import test from 'node:test';
import assert from 'node:assert/strict';
import { FORMATS, TOTAL_FORMAT_COUNT, TOTAL_PATHWAY_COUNT, detectFormat } from './formats';
import { executeConversion } from './converterRegistry';
import {
  WEIRD_COMPLEX_FORMAT_IDS,
  decodeFastaDnaToBytes,
  decodeZeroWidthStego,
} from './converters/weirdComplexConverter';

test('All 50 weird, confusing, cosmic, and complex formats exist and detect properly', () => {
  assert.equal(WEIRD_COMPLEX_FORMAT_IDS.length, 50);
  assert.equal(TOTAL_FORMAT_COUNT, 1068);
  assert.equal(TOTAL_PATHWAY_COUNT, 1068 * 1067);

  for (const id of WEIRD_COMPLEX_FORMAT_IDS) {
    const fmt = FORMATS[id];
    assert.ok(fmt, `Expected format ${id} in FORMATS`);
    const fakeFile = new File(['abc'], `sample${fmt.extension}`);
    assert.equal(detectFormat(fakeFile).id, id, `Expected detectFormat to match ${id} for ${fmt.extension}`);
  }
});

test('All 50 weird/complex formats execute real conversions with authentic headers and structures', async () => {
  const inputText = 'Chang-Itz Cosmic Quantum Entropy Test Payload 42!';
  const sampleFile = new File([inputText], 'cosmic_seed.txt', { type: 'text/plain' });

  for (const id of WEIRD_COMPLEX_FORMAT_IDS) {
    const res = await executeConversion(sampleFile, id);
    assert.equal(res.outputFormat, id);
    assert.ok(res.convertedSizeBytes > 0, `Expected non-empty output for ${id}`);
    assert.ok(res.outputName.endsWith(FORMATS[id].extension), `Expected extension for ${id}`);
  }

  // Spot-check authentic binary signatures and structured outputs
  const velato = await executeConversion(sampleFile, 'velato');
  const velatoBytes = new Uint8Array(await (velato.data as Blob).arrayBuffer());
  assert.equal(new TextDecoder().decode(velatoBytes.slice(0, 4)), 'MThd');

  const sstv = await executeConversion(sampleFile, 'sstv_martin');
  const sstvBytes = new Uint8Array(await (sstv.data as Blob).arrayBuffer());
  assert.equal(new TextDecoder().decode(sstvBytes.slice(0, 4)), 'RIFF');
  assert.equal(new TextDecoder().decode(sstvBytes.slice(8, 12)), 'WAVE');
  assert.equal(sstv.previewType, 'audio');

  const ligo = await executeConversion(sampleFile, 'gw_strain');
  const ligoBytes = new Uint8Array(await (ligo.data as Blob).arrayBuffer());
  assert.equal(new TextDecoder().decode(ligoBytes.slice(0, 4)), 'IGWD');

  const dicom = await executeConversion(sampleFile, 'dicm_mri');
  const dicomBytes = new Uint8Array(await (dicom.data as Blob).arrayBuffer());
  assert.equal(new TextDecoder().decode(dicomBytes.slice(128, 132)), 'DICM');

  const elfCore = await executeConversion(sampleFile, 'elf_core');
  const elfBytes = new Uint8Array(await (elfCore.data as Blob).arrayBuffer());
  assert.deepEqual(Array.from(elfBytes.slice(0, 4)), [0x7f, 0x45, 0x4c, 0x46]);

  const macho = await executeConversion(sampleFile, 'macho_fat');
  const machoDv = new DataView(await (macho.data as Blob).arrayBuffer());
  assert.equal(machoDv.getUint32(0, true), 0xfeedfacf);

  const vox = await executeConversion(sampleFile, 'voxel_magica');
  const voxBytes = new Uint8Array(await (vox.data as Blob).arrayBuffer());
  assert.equal(new TextDecoder().decode(voxBytes.slice(0, 4)), 'VOX ');

  const ccsds = await executeConversion(sampleFile, 'ccsds_voyager');
  const ccsdsBytes = new Uint8Array(await (ccsds.data as Blob).arrayBuffer());
  assert.deepEqual(Array.from(ccsdsBytes.slice(0, 4)), [0x1a, 0xcf, 0xfc, 0x1d]);

  const qasm = await executeConversion(sampleFile, 'openqasm3');
  assert.match(qasm.textContent || '', /^OPENQASM 3\.0;/);

  const pgp = await executeConversion(sampleFile, 'pgp_armor');
  assert.match(pgp.textContent || '', /-----BEGIN PGP MESSAGE-----/);
  assert.match(pgp.textContent || '', /-----END PGP MESSAGE-----/);
});

test('Lossless round-trip decoding works for FASTA DNA and Zero-Width Steganography', async () => {
  const secret = 'Secret 4D Alien Payload! 👽';
  const file = new File([secret], 'secret.txt', { type: 'text/plain' });

  // 1. FASTA DNA round-trip
  const dnaRes = await executeConversion(file, 'fasta_dna');
  const dnaText = await (dnaRes.data as Blob).text();
  const decodedDna = new TextDecoder().decode(decodeFastaDnaToBytes(dnaText));
  assert.equal(decodedDna, secret);

  const dnaFile = new File([dnaText], 'secret.fasta', { type: 'text/plain' });
  const backFromDna = await executeConversion(dnaFile, 'txt');
  assert.equal(backFromDna.textContent, secret);

  // 2. Zero-Width Steganography round-trip
  const zwcRes = await executeConversion(file, 'zwc_stego');
  const zwcText = await (zwcRes.data as Blob).text();
  const decodedZwc = new TextDecoder().decode(decodeZeroWidthStego(zwcText));
  assert.equal(decodedZwc, secret);

  const zwcFile = new File([zwcText], 'secret.zwc.txt', { type: 'text/plain' });
  const backFromZwc = await executeConversion(zwcFile, 'txt');
  assert.equal(backFromZwc.textContent, secret);
});
