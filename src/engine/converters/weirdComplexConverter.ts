import { LogEntry, ConversionParams, ConversionResult } from '../../types/conversion';
import { FORMATS } from '../formats';

function createLog(level: LogEntry['level'], message: string): LogEntry {
  return { timestamp: new Date().toLocaleTimeString(), level, message };
}

function slugOf(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'changitz_artifact'
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function safeCreateObjectUrl(blob: Blob): string | undefined {
  try {
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      return URL.createObjectURL(blob);
    }
  } catch {
    // Fallback in non-browser contexts
  }
  return undefined;
}

// Build a valid 16-bit mono PCM RIFF/WAVE binary
function buildWavBytes(samples: Int16Array, sampleRate: number = 22050): Uint8Array {
  const dataLen = samples.length * 2;
  const out = new Uint8Array(44 + dataLen);
  const dv = new DataView(out.buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) out[off + i] = s.charCodeAt(i);
  };
  writeStr(0, 'RIFF');
  dv.setUint32(4, 36 + dataLen, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  dv.setUint32(16, 16, true); // PCM chunk size
  dv.setUint16(20, 1, true); // PCM format
  dv.setUint16(22, 1, true); // mono
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, sampleRate * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  writeStr(36, 'data');
  dv.setUint32(40, dataLen, true);
  for (let i = 0; i < samples.length; i++) {
    dv.setInt16(44 + i * 2, samples[i], true);
  }
  return out;
}

// Build a Standard MIDI File (Format 0 or 1)
function buildMidiBytes(
  events: Array<{ delta: number; status: number; data1: number; data2: number }>,
  ticksPerBeat: number = 480
): Uint8Array {
  const trackBody: number[] = [];
  const pushVarLen = (val: number) => {
    let v = Math.max(0, val >>> 0);
    const buf: number[] = [v & 0x7f];
    while ((v >>= 7) > 0) buf.unshift((v & 0x7f) | 0x80);
    trackBody.push(...buf);
  };

  for (const ev of events) {
    pushVarLen(ev.delta);
    trackBody.push(ev.status & 0xff, ev.data1 & 0x7f, ev.data2 & 0x7f);
  }
  // End of Track meta event
  trackBody.push(0x00, 0xff, 0x2f, 0x00);

  const out = new Uint8Array(14 + 8 + trackBody.length);
  const dv = new DataView(out.buffer);
  out.set([0x4d, 0x54, 0x68, 0x64], 0); // MThd
  dv.setUint32(4, 6, false);
  dv.setUint16(8, 0, false); // format 0
  dv.setUint16(10, 1, false); // 1 track
  dv.setUint16(12, ticksPerBeat, false);
  out.set([0x4d, 0x54, 0x72, 0x6b], 14); // MTrk
  dv.setUint32(18, trackBody.length, false);
  out.set(trackBody, 22);
  return out;
}

// OpenPGP 24-bit CRC24 (RFC 4880)
function computeOpenPgpCrc24(bytes: Uint8Array): number {
  let crc = 0xb704ce;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i] << 16;
    for (let j = 0; j < 8; j++) {
      crc <<= 1;
      if (crc & 0x1000000) crc ^= 0x1864cfb;
    }
  }
  return crc & 0xffffff;
}

// ASN.1 DER length encoder
function derLength(len: number): Uint8Array {
  if (len < 128) return new Uint8Array([len]);
  const bytes: number[] = [];
  let n = len;
  while (n > 0) {
    bytes.unshift(n & 0xff);
    n >>= 8;
  }
  return new Uint8Array([0x80 | bytes.length, ...bytes]);
}

function derTlv(tag: number, value: Uint8Array): Uint8Array {
  const lenBytes = derLength(value.length);
  const res = new Uint8Array(1 + lenBytes.length + value.length);
  res[0] = tag;
  res.set(lenBytes, 1);
  res.set(value, 1 + lenBytes.length);
  return res;
}

// IBM CP037 ASCII -> EBCDIC conversion map (subset covering ASCII 0x20-0x7E + newlines)
function asciiByteToEbcdic(b: number): number {
  const map: Record<number, number> = {
    0x0a: 0x25, 0x0d: 0x0d, 0x20: 0x40, 0x21: 0x5a, 0x22: 0x7f, 0x23: 0x7b,
    0x24: 0x5b, 0x25: 0x6c, 0x26: 0x50, 0x27: 0x7d, 0x28: 0x4d, 0x29: 0x5d,
    0x2a: 0x5c, 0x2b: 0x4e, 0x2c: 0x6b, 0x2d: 0x60, 0x2e: 0x4b, 0x2f: 0x61,
    0x3a: 0x7a, 0x3b: 0x5e, 0x3c: 0x4c, 0x3d: 0x7e, 0x3e: 0x6e, 0x3f: 0x6f,
    0x40: 0x7c, 0x5f: 0x6d,
  };
  if (map[b] !== undefined) return map[b];
  if (b >= 0x30 && b <= 0x39) return 0xf0 + (b - 0x30); // '0'-'9'
  if (b >= 0x41 && b <= 0x49) return 0xc1 + (b - 0x41); // 'A'-'I'
  if (b >= 0x4a && b <= 0x52) return 0xd1 + (b - 0x4a); // 'J'-'R'
  if (b >= 0x53 && b <= 0x5a) return 0xe2 + (b - 0x53); // 'S'-'Z'
  if (b >= 0x61 && b <= 0x69) return 0x81 + (b - 0x61); // 'a'-'i'
  if (b >= 0x6a && b <= 0x72) return 0x91 + (b - 0x6a); // 'j'-'r'
  if (b >= 0x73 && b <= 0x7a) return 0xa2 + (b - 0x73); // 's'-'z'
  return 0x40 ^ (b & 0x3f);
}

export const WEIRD_COMPLEX_FORMAT_IDS = [
  'malbolge', 'piet_lang', 'velato', 'shakespeare_spl', 'arnoldc',
  'rockstar_code', 'befunge98', 'intercal', 'unlambda', 'polyglot_quine',
  'openqasm3', 'qobj_pulse', 'gw_strain', 'root_cern', 'cif_crystal',
  'mmcif_protein', 'feynman_diag', 'spacetime_4d', 'fasta_dna', 'genbank_gbk',
  'ccsds_voyager', 'arecibo_msg', 'voyager_gold', 'edf_eeg', 'dicm_mri',
  'nmea_ais', 'zwc_stego', 'snow_ws', 'pgp_armor', 'asn1_der',
  'elf_core', 'macho_fat', 'subleq_oisc', 'ebpf_bytecode', 'ebcdic_ibm',
  'hollerith_card', 'baudot_telex', 'sstv_martin', 'kansas_city', 'midi_black',
  'voxel_magica', 'stl_hyper', 'gcode_cnc', 'lisp_s_expr', 'graphviz_dot',
  'mermaid_flow', 'mandelbrot_ppm', 'hex_qr_ansi', 'bplus_wal', 'poly_tesseract_obj',
] as const;

export type WeirdComplexFormatId = (typeof WEIRD_COMPLEX_FORMAT_IDS)[number];

/**
 * Decode bijective Base-4 FASTA DNA back to original bytes
 */
export function decodeFastaDnaToBytes(fastaText: string): Uint8Array {
  const seq = fastaText
    .split(/\r?\n/)
    .filter((line) => !line.startsWith('>'))
    .join('')
    .toUpperCase()
    .replace(/[^ACGT]/g, '');
  const baseMap: Record<string, number> = { A: 0, C: 1, G: 2, T: 3 };
  const byteCount = Math.floor(seq.length / 4);
  const out = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    const b0 = baseMap[seq[i * 4]] ?? 0;
    const b1 = baseMap[seq[i * 4 + 1]] ?? 0;
    const b2 = baseMap[seq[i * 4 + 2]] ?? 0;
    const b3 = baseMap[seq[i * 4 + 3]] ?? 0;
    out[i] = (b0 << 6) | (b1 << 4) | (b2 << 2) | b3;
  }
  return out;
}

/**
 * Decode Zero-Width Unicode Steganography (.zwc.txt) back to hidden bytes
 */
export function decodeZeroWidthStego(text: string): Uint8Array {
  const zwChars: number[] = [];
  for (const ch of text) {
    if (ch === '\u200B') zwChars.push(0); // 00
    else if (ch === '\u200C') zwChars.push(1); // 01
    else if (ch === '\u200D') zwChars.push(2); // 10
    else if (ch === '\uFEFF') zwChars.push(3); // 11
  }
  const byteCount = Math.floor(zwChars.length / 4);
  const out = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    out[i] = (zwChars[i * 4] << 6) | (zwChars[i * 4 + 1] << 4) | (zwChars[i * 4 + 2] << 2) | zwChars[i * 4 + 3];
  }
  return out;
}

/**
 * Reverse-extract .fasta DNA or .zwc.txt invisible Unicode steganography back into another format
 */
export async function convertFromWeirdFormat(
  file: File,
  targetFormat: string
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  const lower = file.name.toLowerCase();
  const targetFmt = FORMATS[targetFormat] || FORMATS.txt;
  const slug = slugOf(file.name);
  const rawText = await file.text();

  let decodedBytes: Uint8Array;
  let methodName: string;

  if (lower.endsWith('.fasta')) {
    decodedBytes = decodeFastaDnaToBytes(rawText);
    methodName = 'FASTA Base-4 DNA Nucleotide Decoder (A=00, C=01, G=10, T=11)';
  } else {
    decodedBytes = decodeZeroWidthStego(rawText);
    methodName = 'Zero-Width Invisible Unicode Steganography Extractor';
  }

  const outputName = `${slug}${targetFmt.extension}`;
  const mimeType = targetFmt.mimeTypes[0] || 'application/octet-stream';
  const blob = new Blob([decodedBytes.slice().buffer], { type: mimeType });
  const textPreview = new TextDecoder('utf-8', { fatal: false }).decode(decodedBytes.slice(0, 4000));

  logs.push(createLog('success', `${methodName} recovered ${decodedBytes.length} payload bytes into ${outputName}`));

  return {
    data: blob,
    outputName,
    outputFormat: targetFormat,
    mimeType,
    previewType: 'text',
    textContent: textPreview,
    logs,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}

/**
 * Main converter for all 50 weird, confusing, out-of-this-world, and complex file types.
 */
export async function convertWeirdComplexFormat(
  file: File,
  targetFormat: WeirdComplexFormatId,
  params: ConversionParams = {}
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  const targetFmt = FORMATS[targetFormat] || FORMATS.txt;
  const rawBytes = new Uint8Array(await file.arrayBuffer());
  const slug = slugOf(file.name);
  const outputName = `${slug}${targetFmt.extension}`;
  const mimeType = targetFmt.mimeTypes[0] || 'application/octet-stream';
  const sample = rawBytes.slice(0, Math.min(rawBytes.length, 256));
  const chaosSeed = rawBytes.reduce((acc, b, idx) => (acc * 31 + b + idx) >>> 0, 0x1337beef);

  logs.push(createLog('info', `Warping "${file.name}" (${file.size} bytes) into ${targetFmt.name}...`));

  const textResult = (content: string, note?: string): ConversionResult => {
    const blob = new Blob([content], { type: mimeType });
    logs.push(createLog('success', note || `Synthesized ${targetFmt.name} (${blob.size} bytes)`));
    return {
      data: blob,
      outputName,
      outputFormat: targetFormat,
      mimeType,
      previewType: 'text',
      textContent: content.slice(0, 12000),
      logs,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
    };
  };

  const binaryResult = (bytes: Uint8Array, summaryText: string, previewType: ConversionResult['previewType'] = 'text'): ConversionResult => {
    const blob = new Blob([bytes.slice().buffer], { type: mimeType });
    const previewUrl = (previewType === 'audio' || previewType === 'image') ? safeCreateObjectUrl(blob) : undefined;
    logs.push(createLog('success', `Compiled ${targetFmt.name} binary (${bytes.length} bytes)`));
    return {
      data: blob,
      outputName,
      outputFormat: targetFormat,
      mimeType,
      previewType,
      previewUrl,
      textContent: summaryText,
      logs,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
    };
  };

  switch (targetFormat) {
    // 1. Malbolge
    case 'malbolge': {
      const validOps = ['j', 'i', '*', 'p', '<', '/', 'v', 'o'];
      const crzTable = (pos: number, val: number) => {
        const ch = ((val + pos * 7) % 94) + 33;
        return String.fromCharCode(ch === 127 ? 64 : ch);
      };
      let prog = '(=<`#9]~6ZY32Vx/4Rs+0No-&Jk)"Fh}|Bcy?`=*z]Kw%oG4UUS0/@-ejc(:\'8dc';
      prog += '\n; Encrypted Ternary Payload Stream for ' + file.name + '\n';
      for (let i = 0; i < Math.min(rawBytes.length, 160); i++) {
        prog += validOps[rawBytes[i] % validOps.length] + crzTable(i, rawBytes[i]);
        if ((i + 1) % 32 === 0) prog += '\n';
      }
      prog += 'v';
      return textResult(prog, `Generated Base-3 crazy-op Malbolge program (${prog.length} chars)`);
    }

    // 2. Piet Geometric Painting (.piet.ppm)
    case 'piet_lang': {
      const palette = [
        '255 192 192', '255 0 0', '192 0 0', '255 255 192', '255 255 0', '192 192 0',
        '192 255 192', '0 255 0', '0 192 0', '192 255 255', '0 255 255', '0 192 192',
        '192 192 255', '0 0 255', '0 0 192', '255 192 255', '255 0 255', '192 0 192',
      ];
      const w = 16;
      const h = 16;
      const lines = [`P3`, `# Piet Codel Program Canvas for ${file.name}`, `${w} ${h}`, `255`];
      for (let y = 0; y < h; y++) {
        const row: string[] = [];
        for (let x = 0; x < w; x++) {
          const b = rawBytes[(y * w + x) % Math.max(1, rawBytes.length)] ?? 0;
          row.push(palette[b % palette.length]);
        }
        lines.push(row.join('  '));
      }
      return textResult(lines.join('\n'));
    }

    // 3. Velato Musical MIDI Program (.velato.mid)
    case 'velato': {
      const events: Array<{ delta: number; status: number; data1: number; data2: number }> = [];
      for (let i = 0; i < Math.min(rawBytes.length, 128); i++) {
        const rootNote = 60 + (rawBytes[i] % 12);
        const interval = (rawBytes[i] >> 4) + 1;
        events.push({ delta: 0, status: 0x90, data1: rootNote, data2: 96 });
        events.push({ delta: 120, status: 0x80, data1: rootNote, data2: 0 });
        events.push({ delta: 0, status: 0x90, data1: Math.min(115, rootNote + interval), data2: 88 });
        events.push({ delta: 120, status: 0x80, data1: Math.min(115, rootNote + interval), data2: 0 });
      }
      const mid = buildMidiBytes(events);
      return binaryResult(
        mid,
        `// Velato Musical Code MIDI Binary\n// Magic: MThd + MTrk (${mid.length} bytes)\n// Note intervals encode ${events.length / 2} Velato opcodes from ${file.name}`
      );
    }

    // 4. Shakespeare Programming Language (.spl)
    case 'shakespeare_spl': {
      const firstSum = sample.slice(0, 6).reduce((a, b) => a + b, 0);
      const spl = [
        `The Tragic Transformation of ${file.name}.`,
        ``,
        `Hamlet, a conflicted byte accumulator.`,
        `Juliet, the output oracle of Chang-Itz.`,
        ``,
        `                    Act I: The Allocation of Entropy.`,
        `                    Scene I: The Digital Elsinore.`,
        ``,
        `[Enter Hamlet and Juliet]`,
        ``,
        `Hamlet:`,
        ` Thou art as lovely as the sum of a brave golden angel and a proud summer's day!`,
        ` Speak your mind!`,
        ``,
        `Juliet:`,
        ` Remember thyself! Thou art as villainous as the product of a foul toad and a cursed ${firstSum % 2 === 0 ? 'ghost' : 'demon'}!`,
        ` Open your heart!`,
        ``,
        `[Exeunt]`,
      ].join('\n');
      return textResult(spl);
    }

    // 5. ArnoldC
    case 'arnoldc': {
      const lines = [
        `IT'S SHOWTIME`,
        `HEY CHRISTMAS TREE payloadBytes`,
        `YOU SET US UP ${file.size}`,
        `HEY CHRISTMAS TREE entropyChecksum`,
        `YOU SET US UP ${chaosSeed % 65535}`,
        `TALK TO THE HAND "${file.name} -> ${file.size} BYTES"`,
        `GET TO THE CHOPPER entropyChecksum`,
        `HERE IS MY INVITATION ${sample[0] ?? 42}`,
        `HE HAD TO SPLIT ${(sample[1] ?? 7) + 1}`,
        `ENOUGH TALK`,
        `TALK TO THE HAND entropyChecksum`,
        `YOU HAVE BEEN TERMINATED`,
      ].join('\n');
      return textResult(lines);
    }

    // 6. Rockstar 80s Ballad Code
    case 'rockstar_code': {
      const lines = [
        `(Rockstar Code Transpiled from ${file.name})`,
        `Midnight takes your heart and your soul`,
        `While Midnight ain't nothing`,
        `Put ${sample[0] ?? 1984} into your dreams`,
        `Build your dreams up`,
        `Shout your dreams`,
        `Knock Midnight down`,
        ``,
        `My shadow is ${sample.length} lonely echoes`,
        `Shout my shadow`,
      ].join('\n');
      return textResult(lines);
    }

    // 7. Befunge-98 2D Toroidal Grid
    case 'befunge98': {
      const hex = Array.from(sample.slice(0, 16))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const grid = [
        `>25*"${hex.slice(0, 16)}":v`,
        `^_@#:<,"ztI-gnahC"<   v`,
        `v  >${chaosSeed % 9}+.${(sample[0] ?? 0) % 9}*      <`,
        `>^`,
      ].join('\n');
      return textResult(grid);
    }

    // 8. INTERCAL
    case 'intercal': {
      const code = [
        `PLEASE NOTE: INTERCAL POLITE MAINFRAME TRANSCODING FOR ${file.name.toUpperCase()}`,
        `PLEASE DO ,1 <- #${Math.max(1, Math.min(255, sample.length))}`,
        `DO .1 <- #${sample[0] ?? 42} ~ #${sample[1] ?? 17}`,
        `PLEASE DO .2 <- .1 ¢ #${(chaosSeed % 255) + 1}`,
        `DO COME FROM (100)`,
        `(100) PLEASE READ OUT .2`,
        `PLEASE GIVE UP`,
      ].join('\n');
      return textResult(code);
    }

    // 9. Unlambda SKI Combinator Calculus
    case 'unlambda': {
      const ops = Array.from(sample.slice(0, 24))
        .map((b) => `\`.\`${String.fromCharCode(33 + (b % 90))}`)
        .join('');
      const unl = `# Unlambda SKI Combinator Stream (${file.name})\n\`\`\`s\`\`k\`s\`k\`si${ops}i`;
      return textResult(unl);
    }

    // 10. Tri-Lingual Polyglot Executable (.html.py.sh)
    case 'polyglot_quine': {
      const poly = [
        `#<!-- :`,
        `#!/bin/sh`,
        `echo "Running Polyglot as POSIX Shell for ${file.name} (${file.size} bytes)"`,
        `exit 0`,
        `--><html><head><title>${file.name} Polyglot</title></head><body><!--`,
        `"""-->`,
        `<h1>Chang-Itz Tri-Lingual Polyglot: ${file.name}</h1>`,
        `<p>Checksum: 0x${chaosSeed.toString(16).toUpperCase()}</p>`,
        `</body></html><!--"""`,
        `print("Running Polyglot as Python 3 for ${file.name} (${file.size} bytes)")`,
        `# -->`,
      ].join('\n');
      return textResult(poly);
    }

    // 11. OpenQASM 3.0 Quantum Circuit
    case 'openqasm3': {
      const gates = Array.from(sample.slice(0, 8)).map((b, i) => {
        const theta = ((b / 255) * Math.PI).toFixed(4);
        return `h q[${i}];\nrx(${theta}) q[${i}];\ncx q[${i}], q[${(i + 1) % 8}];`;
      });
      const qasm = [
        `OPENQASM 3.0;`,
        `include "stdgates.inc";`,
        `// Quantum State Encoding for ${file.name} (${file.size} bytes)`,
        `qubit[8] q;`,
        `bit[8] c;`,
        ...gates,
        `c = measure q;`,
      ].join('\n');
      return textResult(qasm);
    }

    // 12. Quantum Pulse & Bloch Vectors (.qobj)
    case 'qobj_pulse': {
      const bloch = Array.from(sample.slice(0, 8)).map((b, q) => {
        const theta = (b / 255) * Math.PI;
        const phi = ((b * 7) % 360) * (Math.PI / 180);
        return {
          qubit: q,
          alpha: Number(Math.cos(theta / 2).toFixed(5)),
          betaReal: Number((Math.sin(theta / 2) * Math.cos(phi)).toFixed(5)),
          betaImag: Number((Math.sin(theta / 2) * Math.sin(phi)).toFixed(5)),
          gaussianAmp: Number((0.1 + (b % 40) / 100).toFixed(3)),
        };
      });
      return textResult(JSON.stringify({ qobjSchema: '1.3.0', source: file.name, shots: 4096, hamiltonianGHz: 5.142, qubits: bloch }, null, 2));
    }

    // 13. LIGO Gravitational-Wave Strain Frame (.gwf)
    case 'gw_strain': {
      const headerStr = `IGWD\x01\x05\x04\x08L1:GWOSC-STRAIN_CHGZ_${slug.slice(0, 12)}\x00`;
      const hBytes = new TextEncoder().encode(headerStr);
      const numSamples = 128;
      const out = new Uint8Array(hBytes.length + 8 + numSamples * 8);
      out.set(hBytes, 0);
      const dv = new DataView(out.buffer);
      dv.setFloat64(hBytes.length, 1389427218.0, false); // GPS timestamp
      for (let i = 0; i < numSamples; i++) {
        const b = rawBytes[i % Math.max(1, rawBytes.length)] ?? 0;
        const chirp = Math.sin(i * (0.2 + i * 0.008)) * ((b + 1) / 256) * 1e-21;
        dv.setFloat64(hBytes.length + 8 + i * 8, chirp, false);
      }
      return binaryResult(out, `// LIGO Gravitational-Wave Frame (.gwf)\n// Magic: IGWD v8 | Detector: L1:GWOSC-STRAIN\n// GPS Epoch: 1389427218.0 | Chirp Samples: ${numSamples} float64 (${out.length} bytes)`);
    }

    // 14. CERN LHC High-Energy Collision Event (.root.json)
    case 'root_cern': {
      const tracks = Array.from(sample.slice(0, 12)).map((b, idx) => ({
        trackId: idx,
        pdgCode: idx % 2 === 0 ? 13 : -13, // muon+ / muon-
        pxGeV: Number((((b & 0x0f) - 8) * 4.21).toFixed(3)),
        pyGeV: Number(((((b >> 4) & 0x0f) - 8) * 3.87).toFixed(3)),
        pzGeV: Number(((b - 128) * 0.74).toFixed(3)),
        energyGeV: Number((12.5 + (b / 255) * 85).toFixed(3)),
      }));
      return textResult(JSON.stringify({
        rootClass: 'TFile',
        treeName: 'Events',
        experiment: 'CMS / ATLAS Run-3 Simulation',
        invariantMassGeV: Number((125.09 + (chaosSeed % 100) / 1000).toFixed(4)),
        sourceArtifact: file.name,
        muonTracks: tracks,
      }, null, 2));
    }

    // 15. IUCr Crystallographic Lattice (.cif)
    case 'cif_crystal': {
      const atoms = Array.from(sample.slice(0, 16)).map((b, i) => {
        const sym = ['C', 'Si', 'O', 'Au', 'Fe', 'N'][b % 6];
        const x = ((b % 100) / 100).toFixed(4);
        const y = (((b * 7) % 100) / 100).toFixed(4);
        const z = (((b * 13 + i) % 100) / 100).toFixed(4);
        return `  ${sym}${i + 1}  ${sym}  ${x}  ${y}  ${z}  1.000`;
      });
      const cif = [
        `data_${slug}`,
        `_chemical_name_common   'ChangItz-Byte-Crystal'`,
        `_cell_length_a          5.4309`,
        `_cell_length_b          5.4309`,
        `_cell_length_c          5.4309`,
        `_cell_angle_alpha       90.000`,
        `_cell_angle_beta        90.000`,
        `_cell_angle_gamma       90.000`,
        `_symmetry_space_group_name_H-M   'F d -3 m'`,
        `loop_`,
        `  _atom_site_label`,
        `  _atom_site_type_symbol`,
        `  _atom_site_fract_x`,
        `  _atom_site_fract_y`,
        `  _atom_site_fract_z`,
        `  _atom_site_occupancy`,
        ...atoms,
      ].join('\n');
      return textResult(cif);
    }

    // 16. Macromolecular Ribosome / Protein Fold (.mmcif)
    case 'mmcif_protein': {
      const residues = ['ALA', 'GLY', 'VAL', 'LEU', 'TRP', 'CYS', 'PHE', 'TYR'];
      const rows = Array.from(sample.slice(0, 16)).map((b, i) => {
        const res = residues[b % residues.length];
        const x = (Math.cos(i * 0.6) * 8 + (b % 5)).toFixed(3);
        const y = (Math.sin(i * 0.6) * 8 + (b % 7)).toFixed(3);
        const z = (i * 1.54).toFixed(3);
        return `ATOM ${i + 1} C CA . ${res} A 1 ${i + 1} ? ${x} ${y} ${z} 1.00 20.00 ? ${i + 1} ${res} A CA 1`;
      });
      const mmcif = [
        `data_${slug.toUpperCase()}`,
        `_entry.id   CHGZ`,
        `_struct.title   'Synthetic Alpha-Helix Folded from ${file.name}'`,
        `loop_`,
        `_atom_site.group_PDB`,
        `_atom_site.id`,
        `_atom_site.type_symbol`,
        `_atom_site.label_atom_id`,
        `_atom_site.label_comp_id`,
        `_atom_site.label_asym_id`,
        `_atom_site.Cartn_x`,
        `_atom_site.Cartn_y`,
        `_atom_site.Cartn_z`,
        ...rows,
      ].join('\n');
      return textResult(mmcif);
    }

    // 17. Feynman QED Diagram SVG (.feyn.svg)
    case 'feynman_diag': {
      const momentum = ((chaosSeed % 400) / 10 + 12.5).toFixed(1);
      const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320" width="640" height="320">`,
        `<rect width="640" height="320" fill="#090d16"/>`,
        `<text x="24" y="34" fill="#fbbf24" font-family="monospace" font-size="14" font-weight="bold">QED e- e+ -> gamma -> mu- mu+ | Source: ${file.name}</text>`,
        `<line x1="70" y1="70" x2="210" y2="160" stroke="#38bdf8" stroke-width="3"/>`,
        `<line x1="70" y1="250" x2="210" y2="160" stroke="#38bdf8" stroke-width="3"/>`,
        `<path d="M210,160 Q230,135 250,160 T290,160 T330,160 T370,160 T410,160 T430,160" fill="none" stroke="#f59e0b" stroke-width="3.5"/>`,
        `<line x1="430" y1="160" x2="570" y2="70" stroke="#34d399" stroke-width="3"/>`,
        `<line x1="430" y1="160" x2="570" y2="250" stroke="#34d399" stroke-width="3"/>`,
        `<circle cx="210" cy="160" r="5" fill="#f43f5e"/><circle cx="430" cy="160" r="5" fill="#f43f5e"/>`,
        `<text x="275" y="135" fill="#fde68a" font-family="monospace" font-size="13">photon (q = ${momentum} GeV)</text>`,
        `</svg>`,
      ].join('\n');
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      logs.push(createLog('success', `Rendered QED Feynman SVG diagram (${svg.length} bytes)`));
      return {
        data: blob,
        outputName,
        outputFormat: targetFormat,
        mimeType: 'image/svg+xml',
        previewType: 'image',
        previewUrl: safeCreateObjectUrl(blob),
        textContent: svg,
        logs,
        executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
        originalSizeBytes: file.size,
        convertedSizeBytes: blob.size,
      };
    }

    // 18. 4D Minkowski Spacetime Tesseract (.minkowski)
    case 'spacetime_4d': {
      const vertices4D: number[][] = [];
      for (let i = 0; i < 16; i++) {
        vertices4D.push([
          i & 1 ? 1 : -1,
          i & 2 ? 1 : -1,
          i & 4 ? 1 : -1,
          i & 8 ? 1 : -1,
        ]);
      }
      return textResult(JSON.stringify({
        manifold: 'Minkowski R^(1,3)',
        metricTensor: [[-1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]],
        tesseractRotationW: Number(((chaosSeed % 360) * Math.PI / 180).toFixed(5)),
        sourceBytes: file.size,
        vertices4D,
      }, null, 2));
    }

    // 19. Lossless FASTA DNA Sequence (.fasta)
    case 'fasta_dna': {
      const bases = ['A', 'C', 'G', 'T'];
      let seq = '';
      for (let i = 0; i < rawBytes.length; i++) {
        const b = rawBytes[i];
        seq += bases[(b >> 6) & 3] + bases[(b >> 4) & 3] + bases[(b >> 2) & 3] + bases[b & 3];
      }
      const wrapped = seq.match(/.{1,70}/g)?.join('\n') || '';
      const fasta = `>CHGZ_${slug.toUpperCase()} | ${file.name} | ${file.size} bytes (${seq.length} bp lossless base-4)\n${wrapped}`;
      return textResult(fasta, `Encoded ${file.size} bytes losslessly into ${seq.length} DNA base pairs (.fasta)`);
    }

    // 20. NCBI GenBank Annotated Genome (.gbk)
    case 'genbank_gbk': {
      const bases = ['a', 'c', 'g', 't'];
      let seq = '';
      for (let i = 0; i < Math.min(rawBytes.length, 60); i++) {
        const b = rawBytes[i];
        seq += bases[(b >> 6) & 3] + bases[(b >> 4) & 3] + bases[(b >> 2) & 3] + bases[b & 3];
      }
      const lines = [
        `LOCUS       ${slug.toUpperCase().slice(0, 12).padEnd(12)} ${seq.length} bp    DNA     linear   SYN 24-NOV-2026`,
        `DEFINITION  Synthetic Chang-Itz chromosome encoding ${file.name}.`,
        `ACCESSION   CHGZ_${chaosSeed.toString(16).toUpperCase()}`,
        `FEATURES             Location/Qualifiers`,
        `     CDS             1..${seq.length}`,
        `                     /gene="${slug}"`,
        `                     /product="ChangItzPayloadProtein"`,
        `ORIGIN`,
      ];
      for (let i = 0; i < seq.length; i += 60) {
        const chunk = seq.slice(i, i + 60).match(/.{1,10}/g)?.join(' ') || '';
        lines.push(`${String(i + 1).padStart(9)} ${chunk}`);
      }
      lines.push('//');
      return textResult(lines.join('\n'));
    }

    // 21. NASA CCSDS Deep-Space Telemetry Packet (.ccsds)
    case 'ccsds_voyager': {
      const payload = rawBytes.slice(0, 4096);
      const out = new Uint8Array(4 + 6 + 4 + payload.length + 2);
      const dv = new DataView(out.buffer);
      out.set([0x1a, 0xcf, 0xfc, 0x1d], 0); // CCSDS ASM sync marker
      dv.setUint16(4, 0x0800 | (chaosSeed & 0x07ff), false); // Packet ID (Version=0, Type=0, SecHdr=1, APID)
      dv.setUint16(6, 0xc000 | 1, false); // Standalone packet seq=1
      dv.setUint16(8, (4 + payload.length + 2 - 1) & 0xffff, false); // Packet Data Length - 1
      dv.setUint32(10, Math.floor(Date.now() / 1000), false); // Secondary Epoch
      out.set(payload, 14);
      dv.setUint16(14 + payload.length, chaosSeed & 0xffff, false);
      return binaryResult(out, `// NASA CCSDS Space Packet Telemetry (.ccsds)\n// ASM Sync Marker: 0x1ACFFC1D\n// APID: 0x${(chaosSeed & 0x7ff).toString(16).toUpperCase()}\n// Packet Length: ${out.length} bytes`);
    }

    // 22. SETI Arecibo 23x73 Bitstream (.arecibo)
    case 'arecibo_msg': {
      const rows: string[] = [`; SETI Arecibo 23x73 Interstellar Matrix for ${file.name} (${file.size} bytes)`];
      for (let y = 0; y < 73; y++) {
        let row = '';
        for (let x = 0; x < 23; x++) {
          const idx = (y * 23 + x) % Math.max(1, rawBytes.length);
          const bit = ((rawBytes[idx] >> ((x + y) % 8)) ^ (x === 0 || x === 22 ? 1 : 0)) & 1;
          row += bit ? '█' : '·';
        }
        rows.push(row);
      }
      return textResult(rows.join('\n'));
    }

    // 23. Voyager Golden Record Analog Audio (.vgr)
    case 'voyager_gold': {
      const sr = 22050;
      const numSamples = sr * 2;
      const samples = new Int16Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        const b = rawBytes[Math.floor((i / numSamples) * rawBytes.length)] ?? 64;
        const carrier = 432 + (b % 12) * 36;
        const pulse = Math.sin((2 * Math.PI * carrier * i) / sr) * 0.55 + Math.sin((2 * Math.PI * 1618 * i) / sr) * 0.25;
        samples[i] = Math.round(pulse * 22000);
      }
      const wav = buildWavBytes(samples, sr);
      return binaryResult(wav, `// Voyager Golden Record Telemetry Audio (16 2/3 RPM PCM)\n// Encoded ${file.name} into 2.0s harmonic interstellar pulse burst`, 'audio');
    }

    // 24. European Data Format+ Brainwave EEG (.edf)
    case 'edf_eeg': {
      const hdr = new Uint8Array(512);
      const writePad = (off: number, len: number, str: string) => {
        const s = str.slice(0, len).padEnd(len, ' ');
        for (let i = 0; i < len; i++) hdr[off + i] = s.charCodeAt(i);
      };
      writePad(0, 8, '0'); // EDF version
      writePad(8, 80, `CHGZ-SUBJECT-01 X 24-NOV-2026 ${file.name}`);
      writePad(88, 80, 'Startdate 24-NOV-2026 ChangItz-NeuroLab');
      writePad(168, 8, '24.11.26');
      writePad(176, 8, '06.55.00');
      writePad(184, 8, '512'); // header bytes
      writePad(192, 44, 'EDF+C');
      writePad(236, 8, '1'); // 1 data record
      writePad(244, 8, '1'); // duration 1s
      writePad(252, 4, '1'); // 1 channel
      // 1 signal header (256 bytes)
      writePad(256, 16, 'EEG Fp1-Cz');
      writePad(272, 80, 'Ag/AgCl cup electrode');
      writePad(352, 8, 'uV');
      writePad(360, 8, '-500');
      writePad(368, 8, '500');
      writePad(376, 8, '-32768');
      writePad(384, 8, '32767');
      writePad(392, 80, 'HP:0.5Hz LP:70Hz');
      writePad(472, 8, '64'); // 64 samples
      writePad(480, 32, '');

      const out = new Uint8Array(512 + 128);
      out.set(hdr, 0);
      const dv = new DataView(out.buffer);
      for (let i = 0; i < 64; i++) {
        const val = ((rawBytes[i % Math.max(1, rawBytes.length)] ?? 0) - 128) * 150;
        dv.setInt16(512 + i * 2, val, true);
      }
      return binaryResult(out, `// European Data Format+ (.edf) Neuro-EEG Binary\n// Header: 512 bytes (EDF+C) | Channel: EEG Fp1-Cz | Samples: 64`);
    }

    // 25. DICOM Medical MRI Slice (.dcm)
    case 'dicm_mri': {
      const pixCount = 1024;
      const out = new Uint8Array(132 + 40 + pixCount);
      out.set([0x44, 0x49, 0x43, 0x4d], 128); // "DICM"
      const dv = new DataView(out.buffer);
      // Tag (0002,0010) Transfer Syntax UID Explicit VR Little Endian
      dv.setUint16(132, 0x0002, true);
      dv.setUint16(134, 0x0010, true);
      out.set([0x55, 0x49], 136); // "UI"
      const uid = '1.2.840.10008.1.2.1\0';
      dv.setUint16(138, uid.length, true);
      for (let i = 0; i < uid.length; i++) out[140 + i] = uid.charCodeAt(i);
      // Pixel Data Tag (7FE0,0010) OB
      const pOff = 140 + uid.length;
      dv.setUint16(pOff, 0x7fe0, true);
      dv.setUint16(pOff + 2, 0x0010, true);
      out.set([0x4f, 0x42, 0x00, 0x00], pOff + 4);
      dv.setUint32(pOff + 8, pixCount, true);
      for (let i = 0; i < pixCount; i++) {
        out[pOff + 12 + i] = rawBytes[i % Math.max(1, rawBytes.length)] ?? 0;
      }
      return binaryResult(out, `// NEMA DICOM Part 10 Medical MRI Binary (.dcm)\n// Preamble: 128 zero bytes + "DICM" magic\n// Transfer Syntax: 1.2.840.10008.1.2.1 (Explicit VR LE)\n// Pixel Data (7FE0,0010): ${pixCount} bytes`);
    }

    // 26. Maritime AIS & GPS NMEA-0183 (.ais)
    case 'nmea_ais': {
      const xorCheck = (sentence: string) => {
        let cs = 0;
        for (let i = 0; i < sentence.length; i++) cs ^= sentence.charCodeAt(i);
        return cs.toString(16).toUpperCase().padStart(2, '0');
      };
      const lat = (3700 + (chaosSeed % 99)).toFixed(4);
      const lon = (12200 + (chaosSeed % 99)).toFixed(4);
      const ggaBody = `GPGGA,065500.00,${lat},N,${lon},W,1,09,0.9,14.2,M,-31.4,M,,`;
      const aisBody = `AIVDM,1,1,,B,15M67FC000G?ufbE\`FepT@3n00Sa,0`;
      const payloadHex = Array.from(sample.slice(0, 16)).map((b) => b.toString(16).padStart(2, '0')).join('');
      const txtBody = `GPTXT,01,01,01,CHGZ_${payloadHex}`;
      return textResult([
        `$${ggaBody}*${xorCheck(ggaBody)}`,
        `!${aisBody}*${xorCheck(aisBody)}`,
        `$${txtBody}*${xorCheck(txtBody)}`,
      ].join('\r\n'));
    }

    // 27. Zero-Width Invisible Unicode Steganography (.zwc.txt)
    case 'zwc_stego': {
      const zw = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
      let hidden = '';
      for (let i = 0; i < rawBytes.length; i++) {
        const b = rawBytes[i];
        hidden += zw[(b >> 6) & 3] + zw[(b >> 4) & 3] + zw[(b >> 2) & 3] + zw[b & 3];
      }
      const decoy = `Totally ordinary harmless shopping list: apples,${hidden} bananas, milk, and fresh bread.`;
      return textResult(decoy, `Hid ${rawBytes.length} bytes inside ${hidden.length} completely invisible zero-width Unicode characters!`);
    }

    // 28. SNOW Whitespace Steganography (.snow.txt)
    case 'snow_ws': {
      const lines = [`// Innocent Document Cover Text (Trailing spaces/tabs hide ${sample.length} bytes via SNOW)`];
      for (let i = 0; i < Math.min(rawBytes.length, 64); i++) {
        let trail = '';
        for (let bit = 7; bit >= 0; bit--) {
          trail += ((rawBytes[i] >> bit) & 1) ? '\t' : ' ';
        }
        lines.push(`Line ${String(i + 1).padStart(2, '0')}: Normal looking sentence.${trail}`);
      }
      return textResult(lines.join('\n'));
    }

    // 29. OpenPGP ASCII-Armored Packet (.asc)
    case 'pgp_armor': {
      const b64 = bytesToBase64(rawBytes);
      const crc = computeOpenPgpCrc24(rawBytes);
      const crcBytes = new Uint8Array([(crc >> 16) & 0xff, (crc >> 8) & 0xff, crc & 0xff]);
      const crcB64 = bytesToBase64(crcBytes);
      const wrapped = b64.match(/.{1,64}/g)?.join('\n') || b64;
      const armor = [
        `-----BEGIN PGP MESSAGE-----`,
        `Comment: Chang-Itz RFC 4880 Radix-64 Packet for ${file.name}`,
        ``,
        wrapped,
        `=${crcB64}`,
        `-----END PGP MESSAGE-----`,
      ].join('\n');
      return textResult(armor);
    }

    // 30. X.509 ASN.1 DER Binary (.der)
    case 'asn1_der': {
      const oidBytes = new Uint8Array([0x2b, 0x06, 0x01, 0x04, 0x01, 0x86, 0x8d, 0x1f, 0x01]);
      const oidTlv = derTlv(0x06, oidBytes);
      const nameTlv = derTlv(0x0c, new TextEncoder().encode(file.name));
      const payloadTlv = derTlv(0x04, rawBytes);
      const body = new Uint8Array(oidTlv.length + nameTlv.length + payloadTlv.length);
      body.set(oidTlv, 0);
      body.set(nameTlv, oidTlv.length);
      body.set(payloadTlv, oidTlv.length + nameTlv.length);
      const seq = derTlv(0x30, body);
      return binaryResult(seq, `// X.509 ASN.1 DER Binary (.der)\n// Tag 0x30 SEQUENCE -> 0x06 OID + 0x0C UTF8String ("${file.name}") + 0x04 OCTET STRING (${rawBytes.length} bytes)`);
    }

    // 31. Linux ELF64 Core Crash Dump (.core)
    case 'elf_core': {
      const out = new Uint8Array(64 + 56 + rawBytes.length);
      const dv = new DataView(out.buffer);
      out.set([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1, 0], 0); // \x7FELF 64-bit LE
      dv.setUint16(16, 4, true); // e_type = ET_CORE (4)
      dv.setUint16(18, 0x3e, true); // e_machine = EM_X86_64
      dv.setUint32(20, 1, true);
      dv.setBigUint64(32, BigInt(64), true); // e_phoff = 64
      dv.setUint16(52, 64, true); // e_ehsize
      dv.setUint16(54, 56, true); // e_phentsize
      dv.setUint16(56, 1, true); // e_phnum = 1
      // Program header PT_LOAD (1)
      dv.setUint32(64, 1, true);
      dv.setUint32(68, 6, true); // RW
      dv.setBigUint64(72, BigInt(120), true); // p_offset
      dv.setBigUint64(80, BigInt(0x400000), true);
      dv.setBigUint64(96, BigInt(rawBytes.length), true);
      dv.setBigUint64(104, BigInt(rawBytes.length), true);
      out.set(rawBytes, 120);
      return binaryResult(out, `// Linux ELF64 Core Crash Dump (.core)\n// Magic: 0x7F 'E' 'L' 'F' | Type: ET_CORE (4) | Arch: x86_64 (0x3E)\n// PT_LOAD Memory Segment: ${rawBytes.length} bytes mapped at 0x400000`);
    }

    // 32. Apple ARM64 Mach-O Binary (.macho)
    case 'macho_fat': {
      const out = new Uint8Array(32 + 72 + rawBytes.length);
      const dv = new DataView(out.buffer);
      dv.setUint32(0, 0xfeedfacf, true); // MH_MAGIC_64
      dv.setUint32(4, 0x0100000c, true); // CPU_TYPE_ARM64
      dv.setUint32(8, 0, true);
      dv.setUint32(12, 2, true); // MH_EXECUTE
      dv.setUint32(16, 1, true); // ncmds = 1
      dv.setUint32(20, 72, true); // sizeofcmds
      // LC_SEGMENT_64 (0x19)
      dv.setUint32(32, 0x19, true);
      dv.setUint32(36, 72, true);
      const segName = '__CHGZ_DATA';
      for (let i = 0; i < segName.length; i++) out[40 + i] = segName.charCodeAt(i);
      dv.setBigUint64(64, BigInt(rawBytes.length), true); // vmsize
      dv.setBigUint64(72, BigInt(104), true); // fileoff
      dv.setBigUint64(80, BigInt(rawBytes.length), true); // filesize
      out.set(rawBytes, 104);
      return binaryResult(out, `// Apple 64-bit ARM64 Mach-O Binary (.macho)\n// Magic: 0xFEEDFACF (MH_MAGIC_64) | CPU_TYPE_ARM64\n// Segment __CHGZ_DATA: ${rawBytes.length} bytes`);
    }

    // 33. SUBLEQ One-Instruction Computer (.subleq)
    case 'subleq_oisc': {
      const cells = Array.from(sample.slice(0, 24)).map((b, i) => `${i * 3} ${i * 3 + 1} ${(i + 1) * 3} ; byte=${b}`).join('\n');
      return textResult(`; SUBLEQ One-Instruction Set Computer Program\n; Single Instruction: Subtract and Branch if Less or Equal to Zero\n${cells}\n0 0 -1 ; HALT`);
    }

    // 34. Linux Kernel eBPF Bytecode (.ebpf)
    case 'ebpf_bytecode': {
      // 3 standard 8-byte eBPF instructions: lddw r0, len; mov r1, 0; exit
      const out = new Uint8Array(24 + rawBytes.length);
      const dv = new DataView(out.buffer);
      // BPF_ALU64 | BPF_MOV | BPF_K (0xB7), dst=0, imm=rawBytes.length
      out[0] = 0xb7;
      dv.setInt32(4, rawBytes.length, true);
      // BPF_ALU64 | BPF_XOR | BPF_X (0xAF)
      out[8] = 0xaf;
      // BPF_JMP | BPF_EXIT (0x95)
      out[16] = 0x95;
      out.set(rawBytes, 24);
      return binaryResult(out, `// Linux Kernel eBPF Verifier Bytecode (.ebpf)\n// Insns: [0xB7 MOV64 r0, ${rawBytes.length}] [0xAF XOR64] [0x95 EXIT]\n// Attached Packet Payload: ${rawBytes.length} bytes`);
    }

    // 35. IBM Mainframe CP037 EBCDIC (.ebc)
    case 'ebcdic_ibm': {
      const ebcdic = new Uint8Array(rawBytes.length);
      for (let i = 0; i < rawBytes.length; i++) ebcdic[i] = asciiByteToEbcdic(rawBytes[i]);
      const hexSample = Array.from(ebcdic.slice(0, 32)).map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      return binaryResult(ebcdic, `// IBM System/360 CP037 EBCDIC Mainframe Tape (.ebc)\n// Transcoded ${rawBytes.length} bytes ('A'->0xC1, '0'->0xF0, ' '->0x40)\n// First 32 EBCDIC Hex Bytes:\n// ${hexSample}`);
    }

    // 36. IBM 80-Column Hollerith Punch Card (.punch)
    case 'hollerith_card': {
      const ascii = new TextDecoder('utf-8', { fatal: false }).decode(sample.slice(0, 48)).replace(/[^\x20-\x7e]/g, '.');
      const cols = Math.min(48, Math.max(24, ascii.length));
      const rows = ['12', '11', ' 0', ' 1', ' 2', ' 3', ' 4', ' 5', ' 6', ' 7', ' 8', ' 9'];
      const lines = [
        ` __________________________________________________`,
        `/ ${ascii.padEnd(48)} |`,
      ];
      for (let r = 0; r < rows.length; r++) {
        let line = `|${rows[r]} `;
        for (let c = 0; c < cols; c++) {
          const b = sample[c % Math.max(1, sample.length)] ?? 0x20;
          const punched = ((b + r * 3) % 7 === 0) || (r === (b % 12));
          line += punched ? '█' : String(Math.max(0, r - 2));
        }
        lines.push(line.padEnd(51) + '|');
      }
      lines.push(`|__________________________________________________|`);
      return textResult(lines.join('\n'));
    }

    // 37. 5-Bit Baudot ITA2 Telex Tape (.ita2)
    case 'baudot_telex': {
      const rows = Array.from(sample.slice(0, 40)).map((b, i) => {
        const bits = b & 0x1f;
        const holes = [4, 3, 2, 1, 0].map((k) => ((bits >> k) & 1 ? 'o' : ' ')).join('');
        return `|${holes.slice(0, 3)}.${holes.slice(3)}| ; 0x${bits.toString(16).padStart(2, '0')} [${i}]`;
      });
      return textResult(`; 5-Bit Murray/Baudot ITA2 Punched Paper Tape (${file.name})\n${rows.join('\n')}`);
    }

    // 38. ISS Ham-Radio SSTV Martin M1 Audio (.sstv.wav)
    case 'sstv_martin': {
      const sr = 22050;
      const numSamples = sr * 2;
      const samples = new Int16Array(numSamples);
      let phase = 0;
      for (let i = 0; i < numSamples; i++) {
        let freq = 1500;
        if (i < sr * 0.3) freq = 1900; // VIS leader tone
        else if (i < sr * 0.33) freq = 1200; // break
        else {
          const b = rawBytes[Math.floor(((i - sr * 0.33) / numSamples) * rawBytes.length * 4) % Math.max(1, rawBytes.length)] ?? 128;
          freq = 1500 + (b / 255) * 800; // 1500 Hz (black) to 2300 Hz (white)
        }
        phase += (2 * Math.PI * freq) / sr;
        samples[i] = Math.round(Math.sin(phase) * 24000);
      }
      const wav = buildWavBytes(samples, sr);
      return binaryResult(wav, `// ISS Ham-Radio SSTV Martin M1 Audio Signal (.sstv.wav)\n// 1900Hz VIS Leader + 1200Hz Sync + 1500-2300Hz Luminance Scanlines`, 'audio');
    }

    // 39. 1975 Kansas City Standard 300-Baud Cassette Audio (.kcs.wav)
    case 'kansas_city': {
      const sr = 22050;
      const bitSamples = Math.round(sr / 300); // ~73 samples per 300-baud bit
      const bytesToEncode = sample.slice(0, 24);
      const totalBits = bytesToEncode.length * 11; // 1 start (0) + 8 data + 2 stop (1)
      const samples = new Int16Array(totalBits * bitSamples);
      let ptr = 0;
      const writeBit = (bit: number) => {
        const freq = bit ? 2400 : 1200;
        for (let s = 0; s < bitSamples && ptr < samples.length; s++) {
          samples[ptr++] = Math.round(Math.sin((2 * Math.PI * freq * s) / sr) * 24000);
        }
      };
      for (let i = 0; i < bytesToEncode.length; i++) {
        writeBit(0); // start bit
        for (let b = 0; b < 8; b++) writeBit((bytesToEncode[i] >> b) & 1);
        writeBit(1);
        writeBit(1); // 2 stop bits
      }
      const wav = buildWavBytes(samples, sr);
      return binaryResult(wav, `// 1975 Altair 8800 Kansas City Standard Cassette (.kcs.wav)\n// 300-Baud FSK Audio (1200Hz = 0, 2400Hz = 1) encoding ${bytesToEncode.length} bytes`, 'audio');
    }

    // 40. Impossible "Black MIDI" Cascade (.black.mid)
    case 'midi_black': {
      const noteCount = Number(params.noteDensity) > 0 ? Math.min(2000, Number(params.noteDensity)) : 600;
      const events: Array<{ delta: number; status: number; data1: number; data2: number }> = [];
      for (let i = 0; i < noteCount; i++) {
        const b = rawBytes[i % Math.max(1, rawBytes.length)] ?? (i * 13);
        const pitch = 21 + ((b + i * 3) % 88);
        events.push({ delta: i % 8 === 0 ? 10 : 0, status: 0x90, data1: pitch, data2: 120 });
        events.push({ delta: 2, status: 0x80, data1: pitch, data2: 0 });
      }
      const mid = buildMidiBytes(events, 960);
      return binaryResult(mid, `// Black MIDI Hyper-Dense Cascade (.black.mid)\n// Generated ${noteCount} overlapping micro-notes (${mid.length} bytes)`);
    }

    // 41. MagicaVoxel Binary (.vox)
    case 'voxel_magica': {
      const numVoxels = Math.min(256, Math.max(16, rawBytes.length));
      const sizeChunkLen = 12;
      const xyziLen = 4 + numVoxels * 4;
      const childrenLen = (12 + sizeChunkLen) + (12 + xyziLen);
      const out = new Uint8Array(8 + 12 + childrenLen);
      const dv = new DataView(out.buffer);
      const writeTag = (off: number, t: string) => {
        for (let i = 0; i < 4; i++) out[off + i] = t.charCodeAt(i);
      };
      writeTag(0, 'VOX ');
      dv.setUint32(4, 150, true);
      writeTag(8, 'MAIN');
      dv.setUint32(12, 0, true);
      dv.setUint32(16, childrenLen, true);
      writeTag(20, 'SIZE');
      dv.setUint32(24, 12, true);
      dv.setUint32(28, 0, true);
      dv.setUint32(32, 16, true);
      dv.setUint32(36, 16, true);
      dv.setUint32(40, 16, true);
      writeTag(44, 'XYZI');
      dv.setUint32(48, xyziLen, true);
      dv.setUint32(52, 0, true);
      dv.setUint32(56, numVoxels, true);
      for (let i = 0; i < numVoxels; i++) {
        const b = rawBytes[i % Math.max(1, rawBytes.length)] ?? i;
        out[60 + i * 4 + 0] = i % 16;
        out[60 + i * 4 + 1] = Math.floor(i / 16) % 16;
        out[60 + i * 4 + 2] = b % 16;
        out[60 + i * 4 + 3] = 1 + (b % 250);
      }
      return binaryResult(out, `// MagicaVoxel 3D Voxel Binary (.vox)\n// Magic: "VOX " v150 | Grid: 16x16x16 | Voxels: ${numVoxels}`);
    }

    // 42. Binary 3D STL Mesh (.hyper.stl)
    case 'stl_hyper': {
      const tris = Math.min(64, Math.max(4, sample.length));
      const out = new Uint8Array(84 + tris * 50);
      const dv = new DataView(out.buffer);
      const hdrTxt = `Chang-Itz Hyper STL Mesh from ${file.name}`.slice(0, 80);
      for (let i = 0; i < hdrTxt.length; i++) out[i] = hdrTxt.charCodeAt(i);
      dv.setUint32(80, tris, true);
      for (let t = 0; t < tris; t++) {
        const off = 84 + t * 50;
        const h = ((rawBytes[t % Math.max(1, rawBytes.length)] ?? 0) / 255) * 10;
        dv.setFloat32(off + 8, 1.0, true); // normal Z
        dv.setFloat32(off + 12, t * 1.5, true); // v1.x
        dv.setFloat32(off + 24, t * 1.5 + 1.0, true); // v2.x
        dv.setFloat32(off + 32, h, true); // v2.z
        dv.setFloat32(off + 36, t * 1.5, true); // v3.x
        dv.setFloat32(off + 40, 1.0, true); // v3.y
      }
      return binaryResult(out, `// Binary 3D STL Mesh (.hyper.stl)\n// Triangle Facets: ${tris} | Total Binary Size: ${out.length} bytes`);
    }

    // 43. 3D Printer / CNC Laser G-Code (.gcode)
    case 'gcode_cnc': {
      const moves = Array.from(sample.slice(0, 24)).map((b, i) => {
        const x = ((i * 8 + (b % 10)) % 180 + 20).toFixed(2);
        const y = (((b * 3) % 160) + 20).toFixed(2);
        const e = ((i + 1) * 0.45).toFixed(3);
        return `G1 X${x} Y${y} E${e} F1800`;
      });
      return textResult([
        `; Chang-Itz Physical Entropy Sculpture G-Code (${file.name})`,
        `G21 ; millimeters`,
        `G90 ; absolute positioning`,
        `G28 ; home all axes`,
        `G1 Z0.28 F1200`,
        ...moves,
        `M84 ; disable motors`,
      ].join('\n'));
    }

    // 44. Symbolic S-Expression Hypergraph AST (.sexp)
    case 'lisp_s_expr': {
      const pairs = Array.from(sample.slice(0, 24)).map((b) => `#x${b.toString(16).padStart(2, '0')}`).join(' ');
      const sexp = `(chang-itz-ast\n  (:source "${file.name}")\n  (:bytes ${file.size})\n  (:checksum #x${chaosSeed.toString(16).toUpperCase()})\n  (:payload-vector '(${pairs})))`;
      return textResult(sexp);
    }

    // 45. Graphviz Directed Entropy Graph (.dot)
    case 'graphviz_dot': {
      const edges = Array.from(sample.slice(0, 20)).map((b, i) => {
        const next = sample[(i + 1) % Math.max(1, sample.length)] ?? 0;
        return `  "0x${b.toString(16).padStart(2, '0')}" -> "0x${next.toString(16).padStart(2, '0')}" [label="step_${i}"];`;
      });
      return textResult(`digraph ChangItzEntropy {\n  rankdir=LR;\n  node [shape=box, style=filled, fillcolor="#1e293b", fontcolor="#fbbf24"];\n${edges.join('\n')}\n}`);
    }

    // 46. MermaidJS Architecture Flowchart (.mmd)
    case 'mermaid_flow': {
      const mmd = [
        `flowchart TD`,
        `  SRC["📄 ${file.name} (${file.size} B)"] --> HASH["🔐 Seed 0x${chaosSeed.toString(16).toUpperCase()}"]`,
        `  HASH --> B0["Byte 0: 0x${(sample[0] ?? 0).toString(16).padStart(2, '0')}"]`,
        `  HASH --> B1["Byte 1: 0x${(sample[1] ?? 0).toString(16).padStart(2, '0')}"]`,
        `  B0 --> OUT["✨ Chang-Itz Artifact"]`,
        `  B1 --> OUT`,
      ].join('\n');
      return textResult(mmd);
    }

    // 47. Deterministic Julia/Mandelbrot Fractal Image (.fractal.ppm)
    case 'mandelbrot_ppm': {
      const w = 24;
      const h = 16;
      const cRe = -0.8 + ((chaosSeed & 0xff) / 255) * 0.4;
      const cIm = 0.156 + (((chaosSeed >> 8) & 0xff) / 255) * 0.2;
      const lines = [`P3`, `# Julia Fractal Seed c=${cRe.toFixed(4)}+${cIm.toFixed(4)}i`, `${w} ${h}`, `255`];
      for (let y = 0; y < h; y++) {
        const row: string[] = [];
        for (let x = 0; x < w; x++) {
          let zr = (x / w - 0.5) * 3.0;
          let zi = (y / h - 0.5) * 2.2;
          let iter = 0;
          while (zr * zr + zi * zi <= 4 && iter < 32) {
            const nr = zr * zr - zi * zi + cRe;
            zi = 2 * zr * zi + cIm;
            zr = nr;
            iter++;
          }
          row.push(`${(iter * 8) % 256} ${(iter * 16) % 256} ${255 - iter * 7}`);
        }
        lines.push(row.join(' '));
      }
      return textResult(lines.join('\n'));
    }

    // 48. BBS 24-Bit Truecolor ANSI Escape Art (.ans)
    case 'hex_qr_ansi': {
      const rows = [`\x1b[1;33m[Chang-Itz 24-Bit ANSI Mural :: ${file.name}]\x1b[0m`];
      for (let r = 0; r < 6; r++) {
        let line = '';
        for (let c = 0; c < 16; c++) {
          const idx = (r * 16 + c) % Math.max(1, rawBytes.length);
          const v = rawBytes[idx] ?? 128;
          const R = (v * 3) % 256;
          const G = (v * 7 + 80) % 256;
          const B = (255 - v) % 256;
          line += `\x1b[38;2;${R};${G};${B}m██`;
        }
        rows.push(line + '\x1b[0m');
      }
      return textResult(rows.join('\n'));
    }

    // 49. MVCC B+Tree Write-Ahead Log Frame (.waldb)
    case 'bplus_wal': {
      const pageSize = 4096;
      const out = new Uint8Array(32 + 24 + pageSize);
      const dv = new DataView(out.buffer);
      dv.setUint32(0, 0x377f0682, false); // SQLite/WAL magic
      dv.setUint32(4, 3007000, false); // format version
      dv.setUint32(8, pageSize, false);
      dv.setUint32(12, 1, false); // checkpoint sequence
      dv.setUint32(16, chaosSeed >>> 0, false); // salt-1
      dv.setUint32(20, 0xcafebabe, false); // salt-2
      // Frame header (24 bytes at 32)
      dv.setUint32(32, 1, false); // page number 1
      dv.setUint32(36, 1, false); // commit db size
      dv.setUint32(40, chaosSeed >>> 0, false);
      out.set(rawBytes.slice(0, pageSize), 56);
      return binaryResult(out, `// MVCC B+Tree Write-Ahead Log Frame (.waldb)\n// Magic: 0x377F0682 | Page Size: 4096 B | Salt: 0x${chaosSeed.toString(16).toUpperCase()}\n// Frame 1 committed (${out.length} bytes)`);
    }

    // 50. 4D-to-3D Stereographic Schlegel Tesseract Projection (.4d.obj)
    case 'poly_tesseract_obj':
    default: {
      const theta = ((chaosSeed % 360) * Math.PI) / 180;
      const lines = [
        `# Schlegel 4D Hypercube Tesseract Stereographic Projection`,
        `# Seeded from ${file.name} (angle=${theta.toFixed(4)} rad)`,
        `o ChangItz_4D_Tesseract`,
      ];
      for (let i = 0; i < 16; i++) {
        const x4 = i & 1 ? 1 : -1;
        const y4 = i & 2 ? 1 : -1;
        const z4 = i & 4 ? 1 : -1;
        const w4 = i & 8 ? 1 : -1;
        // Rotate in XW plane
        const xr = x4 * Math.cos(theta) - w4 * Math.sin(theta);
        const wr = x4 * Math.sin(theta) + w4 * Math.cos(theta);
        const proj = 2.5 / (3.0 - wr);
        lines.push(`v ${(xr * proj).toFixed(4)} ${(y4 * proj).toFixed(4)} ${(z4 * proj).toFixed(4)}`);
      }
      // Cube faces for outer & inner cells
      lines.push(`f 1 2 4 3`, `f 5 6 8 7`, `f 9 10 12 11`, `f 13 14 16 15`, `f 1 2 10 9`, `f 3 4 12 11`);
      return textResult(lines.join('\n'));
    }
  }
}
