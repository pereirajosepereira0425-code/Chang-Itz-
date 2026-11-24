import JSZip from 'jszip';
import { LogEntry, ConversionParams, ConversionResult } from '../../types/conversion';
import { FORMATS } from '../formats';

function createLog(level: LogEntry['level'], message: string): LogEntry {
  return { timestamp: new Date().toLocaleTimeString(), level, message };
}

function sanitizeSlug(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'changitz-track'
  );
}

function deriveNoteSequence(bytes: Uint8Array, bpm: number, count: number = 48) {
  const stepMs = (60000 / bpm) / 2; // eighth-note grid
  const notes: Array<{ t: number; d: number; l: number; p: string[] }> = [];
  for (let i = 0; i < count; i++) {
    const b = bytes[i % Math.max(1, bytes.length)] ?? (i * 37);
    const lane = b % 8; // 0-3 opponent, 4-7 player (V-Slice)
    const time = Math.round(1000 + i * stepMs);
    const sustain = b % 5 === 0 ? Math.round(stepMs * 1.5) : 0;
    const params: string[] = b % 11 === 0 ? ['alt-anim'] : [];
    notes.push({ t: time, d: lane, l: sustain, p: params });
  }
  return notes;
}

export const FNF_FORMAT_IDS = [
  'fnfc',
  'fnf_psych',
  'fnf_psych_char',
  'fnf_psych_stage',
  'fnf_psych_week',
  'fnf_lua',
  'fnf_hxc',
  'fnf_cne',
  'fnf_kade',
  'fnf_sm',
  'fnf_sparrow',
] as const;

export const FNAF_FORMAT_IDS = [
  'fnaf',
  'fnaf_freddy',
  'fnaf_mfa',
  'fnaf_ccn',
  'fnaf_sav',
  'fnaf_pak',
] as const;

/**
 * Convert any source file into any Friday Night Funkin' (FNF) or FNF Engine format.
 */
export async function convertFnfFormat(
  file: File,
  targetFormat: string,
  params: ConversionParams = {}
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  const targetFmt = FORMATS[targetFormat] || FORMATS.fnfc;
  const rawBytes = new Uint8Array(await file.arrayBuffer());
  const slug = sanitizeSlug(file.name);
  const songTitle = file.name.replace(/\.[^.]+$/, '') || 'ChangItz Funkin';
  const bpm = Number(params.bpm) > 0 ? Number(params.bpm) : 135;
  const scrollSpeed = Number(params.scrollSpeed) > 0 ? Number(params.scrollSpeed) : 2.6;
  const playerChar = String(params.character || 'bf');
  const opponentChar = String(params.opponent || 'dad');

  logs.push(createLog('info', `Encoding "${file.name}" into ${targetFmt.name} (${targetFmt.extension})...`));

  // V-Slice Official .fnfc ZIP bundle
  if (targetFormat === 'fnfc') {
    const zip = new JSZip();
    const normalNotes = deriveNoteSequence(rawBytes, bpm, 64).map((n) => ({
      t: n.t,
      d: n.d,
      l: n.l,
      ...(n.p.length ? { k: n.p[0] } : {}),
    }));
    const hardNotes = deriveNoteSequence(rawBytes, bpm * 1.15, 96).map((n) => ({
      t: n.t,
      d: n.d,
      l: n.l,
      ...(n.p.length ? { k: n.p[0] } : {}),
    }));
    const easyNotes = normalNotes.filter((_, idx) => idx % 2 === 0);

    const manifest = {
      version: '1.0.0',
      songId: slug,
      title: songTitle,
      converter: 'Chang-Itz FNF V-Slice Packager',
      sourceFile: file.name,
      sourceBytes: file.size,
      generatedAt: new Date().toISOString(),
    };

    const metadata = {
      version: '2.2.4',
      songName: songTitle,
      artist: 'Chang-Itz Audio Lab',
      charter: 'Chang-Itz Chart Generator',
      divisions: 96,
      looped: false,
      offsets: {
        instrumental: 0,
        altInstrumentals: {},
        vocals: { [playerChar]: 0, [opponentChar]: 0 },
      },
      playData: {
        difficulties: ['easy', 'normal', 'hard'],
        characters: {
          player: playerChar,
          girlfriend: 'gf',
          opponent: opponentChar,
          instrumental: '',
        },
        stage: 'mainStage',
        noteStyle: 'funkin',
        ratings: { easy: 2, normal: 4, hard: 6 },
        album: 'volume1',
        previewStart: 0,
        previewEnd: 15000,
      },
      generatedBy: 'Friday Night Funkin - v0.5.0 (Chang-Itz V-Slice Exporter)',
      timeFormat: 'ms',
      timeChanges: [
        { t: 0, b: 0, bpm, n: 4, d: 4, bt: [4, 4, 4, 4] },
      ],
    };

    const chart = {
      version: '2.0.0',
      scrollSpeed: {
        easy: Math.max(1.2, Number((scrollSpeed * 0.8).toFixed(2))),
        normal: scrollSpeed,
        hard: Number((scrollSpeed * 1.15).toFixed(2)),
      },
      events: [
        { t: 0, e: 'FocusCamera', v: { char: 0 } },
        { t: 4000, e: 'FocusCamera', v: { char: 1 } },
      ],
      notes: {
        easy: easyNotes,
        normal: normalNotes,
        hard: hardNotes,
      },
      generatedBy: 'Chang-Itz V-Slice Chart Compiler',
    };

    zip.file('manifest.json', JSON.stringify(manifest, null, 2));
    zip.file(`${slug}-metadata.json`, JSON.stringify(metadata, null, 2));
    zip.file(`${slug}-chart.json`, JSON.stringify(chart, null, 2));
    zip.file(`assets/${file.name}`, rawBytes);

    const zipBytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    const outputName = `${slug}.fnfc`;
    const blob = new Blob([zipBytes.slice().buffer], { type: 'application/zip' });

    logs.push(createLog('success', `Packaged V-Slice .fnfc bundle (${outputName}, ${zipBytes.length} bytes) containing manifest.json, ${slug}-metadata.json, ${slug}-chart.json, and source assets`));

    return {
      data: blob,
      outputName,
      outputFormat: 'fnfc',
      mimeType: 'application/zip',
      previewType: 'archive',
      textContent: JSON.stringify({ manifest, metadataSummary: metadata.playData, noteCounts: { easy: easyNotes.length, normal: normalNotes.length, hard: hardNotes.length } }, null, 2),
      logs,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
    };
  }

  let outputText = '';
  if (targetFormat === 'fnf_psych') {
    const notes = deriveNoteSequence(rawBytes, bpm, 64);
    const sections: any[] = [];
    for (let s = 0; s < 4; s++) {
      const slice = notes.slice(s * 16, (s + 1) * 16);
      sections.push({
        sectionNotes: slice.map((n) => [n.t, n.d, n.l]),
        sectionBeats: 4,
        typeOfSection: 0,
        mustHitSection: s % 2 === 1,
        gfSection: false,
        bpm,
        changeBPM: false,
        altAnim: false,
      });
    }
    outputText = JSON.stringify(
      {
        song: {
          song: songTitle,
          notes: sections,
          events: [],
          bpm,
          needsVoices: true,
          speed: scrollSpeed,
          player1: playerChar,
          player2: opponentChar,
          gfVersion: 'gf',
          stage: 'stage',
          format: 'psych_v1_convert',
          changitzSource: file.name,
        },
      },
      null,
      2
    );
  } else if (targetFormat === 'fnf_psych_char') {
    outputText = JSON.stringify(
      {
        animations: [
          { loop: false, offsets: [0, 0], anim: 'idle', fps: 24, name: `${slug} idle`, indices: [] },
          { loop: false, offsets: [-10, 12], anim: 'singLEFT', fps: 24, name: `${slug} left`, indices: [] },
          { loop: false, offsets: [0, -25], anim: 'singDOWN', fps: 24, name: `${slug} down`, indices: [] },
          { loop: false, offsets: [5, 30], anim: 'singUP', fps: 24, name: `${slug} up`, indices: [] },
          { loop: false, offsets: [20, 0], anim: 'singRIGHT', fps: 24, name: `${slug} right`, indices: [] },
        ],
        no_antialiasing: false,
        image: `characters/${slug}`,
        position: [0, 0],
        healthicon: slug,
        flip_x: playerChar === 'bf',
        healthbar_colors: [161, 161, 161],
        camera_position: [0, 0],
        sing_duration: 6.1,
        scale: 1,
        _editor_isPlayer: playerChar === 'bf',
      },
      null,
      2
    );
  } else if (targetFormat === 'fnf_psych_stage') {
    outputText = JSON.stringify(
      {
        directory: slug,
        defaultZoom: 0.9,
        isPixelStage: false,
        stageUI: 'normal',
        boyfriend: [770, 100],
        girlfriend: [400, 130],
        opponent: [100, 100],
        hide_girlfriend: false,
        camera_boyfriend: [0, 0],
        camera_opponent: [0, 0],
        camera_girlfriend: [0, 0],
        camera_speed: 1,
      },
      null,
      2
    );
  } else if (targetFormat === 'fnf_psych_week') {
    outputText = JSON.stringify(
      {
        storyName: `Week of ${songTitle}`,
        difficulties: 'Easy, Normal, Hard',
        hideStoryMode: false,
        hideFreeplay: false,
        weekBackground: 'stage',
        weekBefore: 'tutorial',
        startUnlocked: true,
        weekCharacters: [opponentChar, playerChar, 'gf'],
        songs: [[songTitle, slug, [146, 113, 253]]],
        weekName: `week-${slug}`,
      },
      null,
      2
    );
  } else if (targetFormat === 'fnf_lua') {
    outputText = [
      `-- Psych Engine Lua Modchart Script`,
      `-- Converted from ${file.name} (${file.size} bytes) via Chang-Itz`,
      `local songBPM = ${bpm}`,
      `local baseSpeed = ${scrollSpeed}`,
      ``,
      `function onCreate()`,
      `  makeLuaText('changitzBanner', 'Track: ${songTitle} | BPM: ' .. songBPM, 600, 20, 20)`,
      `  setTextSize('changitzBanner', 18)`,
      `  addLuaText('changitzBanner')`,
      `end`,
      ``,
      `function onBeatHit()`,
      `  if curBeat % 4 == 0 then`,
      `    triggerEvent('Add Camera Zoom', '0.03', '0.05')`,
      `  end`,
      `end`,
      ``,
      `function goodNoteHit(membersIndex, noteData, noteType, isSustainNote)`,
      `  setProperty('camHUD.angle', (noteData - 1.5) * 0.8)`,
      `  doTweenAngle('hudReset', 'camHUD', 0, 0.25, 'quadOut')`,
      `end`,
    ].join('\n');
  } else if (targetFormat === 'fnf_hxc') {
    outputText = [
      `// Codename Engine / FNF V-Slice HScript (.hxc)`,
      `// Source: ${file.name} (${file.size} bytes)`,
      `import flixel.FlxG;`,
      `import flixel.tweens.FlxTween;`,
      ``,
      `var trackName:String = "${songTitle}";`,
      `var bpmValue:Float = ${bpm};`,
      ``,
      `function create() {`,
      `    trace("[Chang-Itz HScript] Loaded stage/song script for " + trackName);`,
      `}`,
      ``,
      `function beatHit(curBeat:Int) {`,
      `    if (curBeat % 2 == 0) {`,
      `        FlxG.camera.zoom += 0.015;`,
      `    }`,
      `}`,
      ``,
      `function update(elapsed:Float) {`,
      `    // Runtime hook for ${slug}`,
      `}`,
    ].join('\n');
  } else if (targetFormat === 'fnf_cne') {
    const rawNotes = deriveNoteSequence(rawBytes, bpm, 48);
    outputText = JSON.stringify(
      {
        codenameChart: true,
        stage: 'stage',
        scrollSpeed,
        noteTypes: [],
        events: [],
        strumLines: [
          {
            characters: [opponentChar],
            type: 0,
            position: 'dad',
            notes: rawNotes.filter((n) => n.d < 4).map((n) => ({ time: n.t, id: n.d, sLen: n.l, type: 0 })),
          },
          {
            characters: [playerChar],
            type: 1,
            position: 'boyfriend',
            notes: rawNotes.filter((n) => n.d >= 4).map((n) => ({ time: n.t, id: n.d - 4, sLen: n.l, type: 0 })),
          },
        ],
      },
      null,
      2
    );
  } else if (targetFormat === 'fnf_kade') {
    const notes = deriveNoteSequence(rawBytes, bpm, 48);
    outputText = JSON.stringify(
      {
        song: {
          song: songTitle,
          chartVersion: 'KE2',
          bpm,
          needsVoices: true,
          player1: playerChar,
          player2: opponentChar,
          gfVersion: 'gf',
          stage: 'stage',
          speed: scrollSpeed,
          validScore: true,
          offset: 0,
          eventObjects: [{ name: 'Init', position: 0, value: bpm, type: 'BPM Change' }],
          notes: [
            {
              sectionNotes: notes.map((n) => [n.t, n.d, n.l]),
              lengthInSteps: 16,
              mustHitSection: true,
              bpm,
            },
          ],
        },
      },
      null,
      2
    );
  } else if (targetFormat === 'fnf_sm') {
    outputText = [
      `#TITLE:${songTitle};`,
      `#SUBTITLE:Converted via Chang-Itz;`,
      `#ARTIST:Chang-Itz Chart Engine;`,
      `#CREDIT:Friday Night Funkin;`,
      `#MUSIC:${slug}.ogg;`,
      `#OFFSET:0.000;`,
      `#SAMPLESTART:0.000;`,
      `#SAMPLELENGTH:15.000;`,
      `#BPMS:0.000=${bpm.toFixed(3)};`,
      `//---------------dance-single - ----------------`,
      `#NOTES:`,
      `     dance-single:`,
      `     Chang-Itz:`,
      `     Hard:`,
      `     6:`,
      `     0.500,0.500,0.500,0.500,0.500:`,
      `1000`,
      `0100`,
      `0010`,
      `0001`,
      `,`,
      `1001`,
      `0110`,
      `0010`,
      `1000`,
      `;`,
    ].join('\n');
  } else if (targetFormat === 'fnf_sparrow') {
    outputText = [
      `<?xml version="1.0" encoding="utf-8"?>`,
      `<!-- Generated by Chang-Itz Sparrow v2 Atlas Exporter -->`,
      `<TextureAtlas imagePath="${slug}.png">`,
      `\t<SubTexture name="${slug} idle0000" x="0" y="0" width="420" height="460" frameX="0" frameY="0" frameWidth="420" frameHeight="460"/>`,
      `\t<SubTexture name="${slug} idle0001" x="424" y="0" width="420" height="460" frameX="0" frameY="0" frameWidth="420" frameHeight="460"/>`,
      `\t<SubTexture name="${slug} left0000" x="0" y="464" width="440" height="450" frameX="-12" frameY="0" frameWidth="452" frameHeight="450"/>`,
      `\t<SubTexture name="${slug} down0000" x="444" y="464" width="430" height="410" frameX="0" frameY="-40" frameWidth="430" frameHeight="450"/>`,
      `\t<SubTexture name="${slug} up0000" x="878" y="464" width="415" height="495" frameX="0" frameY="0" frameWidth="415" frameHeight="495"/>`,
      `\t<SubTexture name="${slug} right0000" x="888" y="0" width="445" height="455" frameX="0" frameY="0" frameWidth="460" frameHeight="455"/>`,
      `</TextureAtlas>`,
    ].join('\n');
  }

  const outputName = `${slug}${targetFmt.extension}`;
  const mimeType = targetFmt.mimeTypes[0] || 'application/json';
  const blob = new Blob([outputText], { type: mimeType });
  logs.push(createLog('success', `Converted ${file.name} to ${targetFmt.name} (${outputName}, ${blob.size} bytes)`));

  return {
    data: blob,
    outputName,
    outputFormat: targetFormat,
    mimeType,
    previewType: 'text',
    textContent: outputText,
    logs,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}

/**
 * Extract or inspect an uploaded .fnfc ZIP bundle when converting from .fnfc
 */
export async function convertFromFnfc(
  file: File,
  targetFormat: string
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  const targetFmt = FORMATS[targetFormat] || FORMATS.json;
  const slug = sanitizeSlug(file.name);

  try {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const entries = Object.keys(zip.files);
    const metaEntry = entries.find((k) => k.endsWith('-metadata.json')) || entries.find((k) => k === 'manifest.json');
    const chartEntry = entries.find((k) => k.endsWith('-chart.json'));

    const metaJson = metaEntry ? JSON.parse(await zip.files[metaEntry].async('string')) : {};
    const chartJson = chartEntry ? JSON.parse(await zip.files[chartEntry].async('string')) : {};

    // If converting .fnfc -> Psych Engine chart JSON
    if (targetFormat === 'fnf_psych') {
      const bpm = metaJson?.timeChanges?.[0]?.bpm || 135;
      const normalNotes: any[] = chartJson?.notes?.normal || chartJson?.notes?.hard || [];
      const psychChart = {
        song: {
          song: metaJson.songName || slug,
          notes: [
            {
              sectionNotes: normalNotes.map((n: any) => [n.t ?? 0, n.d ?? 0, n.l ?? 0]),
              sectionBeats: 4,
              mustHitSection: true,
              bpm,
            },
          ],
          events: chartJson.events || [],
          bpm,
          needsVoices: true,
          speed: chartJson?.scrollSpeed?.normal || 2.5,
          player1: metaJson?.playData?.characters?.player || 'bf',
          player2: metaJson?.playData?.characters?.opponent || 'dad',
          gfVersion: metaJson?.playData?.characters?.girlfriend || 'gf',
          stage: metaJson?.playData?.stage || 'stage',
          format: 'psych_v1_convert',
        },
      };
      const txt = JSON.stringify(psychChart, null, 2);
      const blob = new Blob([txt], { type: 'application/json' });
      logs.push(createLog('success', `Converted V-Slice .fnfc (${normalNotes.length} notes) to Psych Engine chart`));
      return {
        data: blob,
        outputName: `${slug}.psych.json`,
        outputFormat: targetFormat,
        mimeType: 'application/json',
        previewType: 'text',
        textContent: txt,
        logs,
        executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
        originalSizeBytes: file.size,
        convertedSizeBytes: blob.size,
      };
    }

    const summaryText = JSON.stringify({ fnfcFile: file.name, entries, metadata: metaJson, chartPreview: chartJson }, null, 2);
    const blob = new Blob([summaryText], { type: targetFmt.mimeTypes[0] || 'application/json' });
    logs.push(createLog('success', `Unpacked .fnfc chart bundle (${entries.length} entries)`));
    return {
      data: blob,
      outputName: `${slug}${targetFmt.extension}`,
      outputFormat: targetFormat,
      mimeType: targetFmt.mimeTypes[0] || 'application/json',
      previewType: 'text',
      textContent: summaryText,
      logs,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
    };
  } catch {
    return convertFnfFormat(file, targetFormat);
  }
}

/**
 * Convert any source file into Five Nights at Freddy's (FNAF) file formats:
 * .fnaf, .freddy (Clickteam INI save), .mfa (Clickteam Fusion 2.5 source),
 * .ccn (Clickteam sub-app), .fnafsav (Unreal GVAS save), .pak (Unreal asset pack).
 */
export async function convertFnafFormat(
  file: File,
  targetFormat: string,
  params: ConversionParams = {}
): Promise<ConversionResult> {
  const startTime = performance.now();
  const logs: LogEntry[] = [];
  const targetFmt = FORMATS[targetFormat] || FORMATS.fnaf;
  const rawBytes = new Uint8Array(await file.arrayBuffer());
  const slug = sanitizeSlug(file.name);
  const nightNumber = Math.min(7, Math.max(1, Number(params.night) || 5));
  const aiLevel = Math.min(20, Math.max(0, Number(params.aiLevel) ?? 20));

  logs.push(createLog('info', `Encoding "${file.name}" into ${targetFmt.name} (${targetFmt.extension})...`));

  // 1. .freddy Clickteam MMFApplications Save INI
  if (targetFormat === 'fnaf_freddy') {
    const checksum = rawBytes.reduce((acc, b) => (acc + b) % 999983, 0);
    const iniText = [
      `[freddy]`,
      `level=${nightNumber}`,
      `beatgame=${nightNumber >= 5 ? 1 : 0}`,
      `beat6=${nightNumber >= 6 ? 1 : 0}`,
      `beat7=${nightNumber >= 7 ? 1 : 0}`,
      `lives=3`,
      `power_reserve=100`,
      `ai_freddy=${aiLevel}`,
      `ai_bonnie=${aiLevel}`,
      `ai_chica=${aiLevel}`,
      `ai_foxy=${aiLevel}`,
      `changitz_source=${file.name}`,
      `changitz_bytes=${file.size}`,
      `changitz_checksum=${checksum}`,
    ].join('\r\n');

    const outputName = `${slug}.freddy`;
    const blob = new Blob([iniText], { type: 'text/plain' });
    logs.push(createLog('success', `Generated Clickteam Fusion [freddy] INI save (${outputName}, Night ${nightNumber}, AI ${aiLevel})`));
    return {
      data: blob,
      outputName,
      outputFormat: 'fnaf_freddy',
      mimeType: 'text/plain',
      previewType: 'text',
      textContent: iniText,
      logs,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
    };
  }

  // 2. .fnaf Universal Animatronic Config JSON
  if (targetFormat === 'fnaf') {
    const fnafPayload = {
      format: 'FNAF_UNIVERSAL_CONTAINER_V1',
      location: "Freddy Fazbear's Pizza",
      night: nightNumber,
      powerPercent: 100,
      clock: '12:00 AM',
      animatronics: {
        freddyFazbear: { aiLevel, camera: '1A', activeHour: 3 },
        bonnieBunny: { aiLevel, camera: '1A', doorSide: 'left' },
        chicaChicken: { aiLevel, camera: '1A', doorSide: 'right' },
        foxyPirate: { aiLevel, camera: '1C', stage: 0 },
        goldenFreddy: { posterTrigger: aiLevel === 20 },
      },
      sourceFile: {
        name: file.name,
        bytes: file.size,
        previewHex: Array.from(rawBytes.slice(0, 32))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' '),
      },
    };
    const jsonText = JSON.stringify(fnafPayload, null, 2);
    const outputName = `${slug}.fnaf`;
    const blob = new Blob([jsonText], { type: 'application/json' });
    logs.push(createLog('success', `Built FNAF Universal Animatronic Config (${outputName}, ${blob.size} bytes)`));
    return {
      data: blob,
      outputName,
      outputFormat: 'fnaf',
      mimeType: 'application/json',
      previewType: 'text',
      textContent: jsonText,
      logs,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
    };
  }

  // 3. .mfa / .ccn Clickteam Fusion 2.5 Binary Container
  if (targetFormat === 'fnaf_mfa' || targetFormat === 'fnaf_ccn') {
    const isCcn = targetFormat === 'fnaf_ccn';
    const magic = isCcn ? 'PAME' : 'PAMU'; // Clickteam Runtime PAME (.ccn) / MFA Unicode PAMU (.mfa)
    const headerStr = `${magic}\x00\x02\x00\x00MMF2.5_FNAF_${slug.toUpperCase().slice(0, 16)}\x00`;
    const enc = new TextEncoder();
    const hBytes = enc.encode(headerStr);
    const metaBytes = enc.encode(`CHGZ_FNAF_NIGHT=${nightNumber};AI=${aiLevel};SRC=${file.name};LEN=${rawBytes.length}\0`);
    const out = new Uint8Array(hBytes.length + 4 + metaBytes.length + rawBytes.length);
    out.set(hBytes, 0);
    const dv = new DataView(out.buffer);
    dv.setUint32(hBytes.length, rawBytes.length >>> 0, true);
    out.set(metaBytes, hBytes.length + 4);
    out.set(rawBytes, hBytes.length + 4 + metaBytes.length);

    const outputName = `${slug}${targetFmt.extension}`;
    const blob = new Blob([out.slice().buffer], { type: 'application/octet-stream' });
    logs.push(createLog('success', `Packaged Clickteam Fusion binary ${targetFmt.extension} (${magic} header, ${out.length} bytes)`));
    return {
      data: blob,
      outputName,
      outputFormat: targetFormat,
      mimeType: 'application/octet-stream',
      previewType: 'text',
      textContent: [
        `// Clickteam Fusion 2.5 FNAF Binary Header Summary`,
        `// Magic Signature: ${magic} (${isCcn ? 'Compiled Sub-Application .ccn' : 'Fusion 2.5 Source Project .mfa'})`,
        `// Night Config: Night ${nightNumber} | Animatronic AI: ${aiLevel}`,
        `// Embedded Payload: ${file.name} (${rawBytes.length} bytes)`,
        `// Total Output Size: ${out.length} bytes`,
      ].join('\n'),
      logs,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
    };
  }

  // 4. .fnafsav Unreal Engine GVAS Binary Save (Security Breach / Help Wanted)
  if (targetFormat === 'fnaf_sav') {
    const enc = new TextEncoder();
    const engineIdBytes = enc.encode('++UE4+Release-4.27\0');
    const saveClassBytes = enc.encode('/Script/fnaf9.FNAFSaveData\0');
    const propNameBytes = enc.encode('ChangItzPayloadBytes\0');
    const arrayPropTypeBytes = enc.encode('ArrayProperty\0');
    const bytePropBytes = enc.encode('ByteProperty\0');
    const noneBytes = enc.encode('None\0');

    // GVAS header (26 bytes + strings)
    const parts: Uint8Array[] = [];
    const pushU32 = (v: number) => {
      const b = new Uint8Array(4);
      new DataView(b.buffer).setUint32(0, v >>> 0, true);
      parts.push(b);
    };
    const pushU16 = (v: number) => {
      const b = new Uint8Array(2);
      new DataView(b.buffer).setUint16(0, v & 0xffff, true);
      parts.push(b);
    };
    const pushFString = (bytes: Uint8Array) => {
      pushU32(bytes.length);
      parts.push(bytes);
    };

    parts.push(enc.encode('GVAS')); // Magic "GVAS"
    pushU32(2); // SaveGameFileVersion
    pushU32(522); // PackageFileUE4Version
    pushU16(4); // Engine Major
    pushU16(27); // Engine Minor
    pushU16(2); // Engine Patch
    pushU32(0); // Changelist
    pushFString(engineIdBytes);
    pushU32(3); // CustomVersionFormat
    pushU32(0); // CustomVersionsCount
    pushFString(saveClassBytes);

    // Property entry
    pushFString(propNameBytes);
    pushFString(arrayPropTypeBytes);
    pushU32(rawBytes.length + 4);
    pushU32(0);
    pushFString(bytePropBytes);
    parts.push(new Uint8Array([0]));
    pushU32(rawBytes.length);
    parts.push(rawBytes);
    pushFString(noneBytes);

    const totalLen = parts.reduce((s, p) => s + p.length, 0);
    const out = new Uint8Array(totalLen);
    let offset = 0;
    for (const p of parts) {
      out.set(p, offset);
      offset += p.length;
    }

    const outputName = `${slug}.fnafsav`;
    const blob = new Blob([out.slice().buffer], { type: 'application/octet-stream' });
    logs.push(createLog('success', `Generated Unreal Engine GVAS FNAF Save (${outputName}, ${out.length} bytes)`));
    return {
      data: blob,
      outputName,
      outputFormat: 'fnaf_sav',
      mimeType: 'application/octet-stream',
      previewType: 'text',
      textContent: [
        `// Unreal Engine GVAS Save File (FNAF: Security Breach / Help Wanted)`,
        `// Header Magic: GVAS (0x47 0x56 0x41 0x53)`,
        `// Engine Build: 4.27.2 ++UE4+Release-4.27`,
        `// SaveClass: /Script/fnaf9.FNAFSaveData`,
        `// Serialized ByteProperty: ChangItzPayloadBytes (${rawBytes.length} bytes)`,
      ].join('\n'),
      logs,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
    };
  }

  // 5. .pak Unreal Engine FNAF Asset Pak
  const enc = new TextEncoder();
  const mountBytes = enc.encode('../../../fnaf9/Content/ChangItz/\0');
  const fileNameBytes = enc.encode(`${file.name}\0`);
  // Payload + index + 44-byte UE4 v8 pak footer ending with magic 0x5A6F12E1
  const indexOffset = rawBytes.length;
  const indexHeader = new Uint8Array(8 + mountBytes.length + 4 + fileNameBytes.length + 28);
  const idxDv = new DataView(indexHeader.buffer);
  idxDv.setUint32(0, mountBytes.length, true);
  indexHeader.set(mountBytes, 4);
  idxDv.setUint32(4 + mountBytes.length, 1, true); // 1 file entry
  const fnPos = 4 + mountBytes.length + 4;
  idxDv.setUint32(fnPos, fileNameBytes.length, true);
  indexHeader.set(fileNameBytes, fnPos + 4);

  const footer = new Uint8Array(45);
  const fDv = new DataView(footer.buffer);
  fDv.setUint32(17, 0x5a6f12e1, true); // UE Pak Magic
  fDv.setUint32(21, 8, true); // Pak Version 8
  fDv.setUint32(25, indexOffset, true);
  fDv.setUint32(33, indexHeader.length, true);

  const pakOut = new Uint8Array(rawBytes.length + indexHeader.length + footer.length);
  pakOut.set(rawBytes, 0);
  pakOut.set(indexHeader, rawBytes.length);
  pakOut.set(footer, rawBytes.length + indexHeader.length);

  const outputName = `${slug}.pak`;
  const blob = new Blob([pakOut.slice().buffer], { type: 'application/octet-stream' });
  logs.push(createLog('success', `Generated Unreal Engine Asset Pak (${outputName}, UE Pak Magic 0x5A6F12E1, ${pakOut.length} bytes)`));

  return {
    data: blob,
    outputName,
    outputFormat: 'fnaf_pak',
    mimeType: 'application/octet-stream',
    previewType: 'text',
    textContent: [
      `// Unreal Engine Asset Pak (.pak) Summary`,
      `// Mount Point: ../../../fnaf9/Content/ChangItz/`,
      `// Packed Asset: ${file.name} (${rawBytes.length} bytes)`,
      `// UE Pak Magic: 0x5A6F12E1 (Version 8)`,
      `// Output Size: ${pakOut.length} bytes`,
    ].join('\n'),
    logs,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    originalSizeBytes: file.size,
    convertedSizeBytes: blob.size,
  };
}
