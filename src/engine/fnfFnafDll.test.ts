import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { FORMATS, TOTAL_FORMAT_COUNT, TOTAL_PATHWAY_COUNT, detectFormat } from './formats';
import { executeConversion, getConversionOptions } from './converterRegistry';
import { buildPeDllBytes, parsePeDllBytes } from './converters/dllConverter';
import { FNF_FORMAT_IDS, FNAF_FORMAT_IDS } from './converters/fnfFnafConverter';

test('Format registry includes all FNF, FNAF, and Windows DLL formats with exact counts', () => {
  assert.equal(TOTAL_FORMAT_COUNT, 1068);
  assert.equal(TOTAL_PATHWAY_COUNT, 1068 * 1067);

  for (const id of [...FNF_FORMAT_IDS, ...FNAF_FORMAT_IDS, 'dll']) {
    assert.ok(FORMATS[id], `Expected format ${id} to exist in FORMATS`);
  }

  assert.equal(detectFormat(new File([''], 'bopeebo.fnfc')).id, 'fnfc');
  assert.equal(detectFormat(new File([''], 'song.psych.json')).id, 'fnf_psych');
  assert.equal(detectFormat(new File([''], 'modchart.lua')).id, 'fnf_lua');
  assert.equal(detectFormat(new File([''], 'script.hxc')).id, 'fnf_hxc');
  assert.equal(detectFormat(new File([''], 'chart.cne.json')).id, 'fnf_cne');
  assert.equal(detectFormat(new File([''], 'kade.kade')).id, 'fnf_kade');
  assert.equal(detectFormat(new File([''], 'night5.fnaf')).id, 'fnaf');
  assert.equal(detectFormat(new File([''], 'freddy.freddy')).id, 'fnaf_freddy');
  assert.equal(detectFormat(new File([''], 'fnaf1.mfa')).id, 'fnaf_mfa');
  assert.equal(detectFormat(new File([''], 'sb.fnafsav')).id, 'fnaf_sav');
  assert.equal(detectFormat(new File([''], 'changitz.dll')).id, 'dll');
});

test('Windows DLL builder and converter produce valid PE32+ and PE32 DLL binaries', async () => {
  const payload = new TextEncoder().encode('Hello from Chang-Itz DLL payload!');
  const dll64 = buildPeDllBytes(payload, { arch: 'x64', exportName: 'RunChangItz', sourceFileName: 'hello.txt' });

  // Verify DOS MZ & PE\0\0 headers
  assert.equal(dll64[0], 0x4d);
  assert.equal(dll64[1], 0x5a);
  const parsed64 = parsePeDllBytes(dll64);
  assert.equal(parsed64.isValidPe, true);
  assert.equal(parsed64.isDll, true);
  assert.equal(parsed64.architecture, 'x64 (AMD64)');
  assert.deepEqual(
    parsed64.sections.map((s) => s.name),
    ['.text', '.rdata', '.data']
  );
  assert.equal(parsed64.embeddedChangItzFileName, 'hello.txt');
  assert.deepEqual(parsed64.embeddedPayloadBytes, payload);

  // Also test x86 conversion via executeConversion
  const srcFile = new File([payload], 'plugin_data.txt', { type: 'text/plain' });
  const res = await executeConversion(srcFile, 'dll', { dllArch: 'x86', exportSymbol: 'InitPlugin' });
  assert.equal(res.outputName, 'plugin_data.dll');
  const outBytes = new Uint8Array(await (res.data as Blob).arrayBuffer());
  const parsed32 = parsePeDllBytes(outBytes);
  assert.equal(parsed32.isValidPe, true);
  assert.equal(parsed32.isDll, true);
  assert.equal(parsed32.architecture, 'x86 (i386)');
  assert.deepEqual(parsed32.embeddedPayloadBytes, payload);

  // Round-trip inspect .dll -> .json
  const dllFile = new File([outBytes], 'plugin_data.dll', { type: 'application/x-msdownload' });
  const inspectRes = await executeConversion(dllFile, 'json');
  const parsedReport = JSON.parse(inspectRes.textContent || '{}');
  assert.equal(parsedReport.peAnalysis.isDll, true);
  assert.equal(parsedReport.peAnalysis.architecture, 'x86 (i386)');
});

test('FNF converters generate valid .fnfc ZIP bundle and Psych/Codename/HXC/Kade/Lua/SM/Sparrow formats', async () => {
  const sampleFile = new File(['fnf-chart-seed-bytes-123456'], 'fresh_song.txt', { type: 'text/plain' });

  // 1. .fnfc ZIP bundle
  const fnfcRes = await executeConversion(sampleFile, 'fnfc', { bpm: 150, scrollSpeed: 3.1, character: 'pico-playable' });
  assert.equal(fnfcRes.outputName, 'fresh_song.fnfc');
  const zip = await JSZip.loadAsync(await (fnfcRes.data as Blob).arrayBuffer());
  assert.ok(zip.files['manifest.json']);
  assert.ok(zip.files['fresh_song-metadata.json']);
  assert.ok(zip.files['fresh_song-chart.json']);
  const meta = JSON.parse(await zip.files['fresh_song-metadata.json'].async('string'));
  assert.equal(meta.timeChanges[0].bpm, 150);
  assert.equal(meta.playData.characters.player, 'pico-playable');

  // Round-trip .fnfc -> fnf_psych
  const fnfcFile = new File([await (fnfcRes.data as Blob).arrayBuffer()], 'fresh_song.fnfc');
  const convertedPsych = await executeConversion(fnfcFile, 'fnf_psych');
  const psychObj = JSON.parse(convertedPsych.textContent || '{}');
  assert.equal(psychObj.song.bpm, 150);
  assert.ok(psychObj.song.notes[0].sectionNotes.length > 0);

  // 2. Remaining FNF engine targets
  const psychChar = await executeConversion(sampleFile, 'fnf_psych_char');
  assert.ok(JSON.parse(psychChar.textContent || '{}').animations.length >= 5);

  const cne = await executeConversion(sampleFile, 'fnf_cne');
  assert.equal(JSON.parse(cne.textContent || '{}').codenameChart, true);

  const kade = await executeConversion(sampleFile, 'fnf_kade');
  assert.equal(JSON.parse(kade.textContent || '{}').song.chartVersion, 'KE2');

  const lua = await executeConversion(sampleFile, 'fnf_lua');
  assert.match(lua.textContent || '', /function onBeatHit/);

  const hxc = await executeConversion(sampleFile, 'fnf_hxc');
  assert.match(hxc.textContent || '', /function beatHit\(curBeat:Int\)/);

  const sm = await executeConversion(sampleFile, 'fnf_sm');
  assert.match(sm.textContent || '', /#BPMS:0\.000=/);

  const sparrow = await executeConversion(sampleFile, 'fnf_sparrow');
  assert.match(sparrow.textContent || '', /<TextureAtlas/);
});

test('FNAF converters generate valid .fnaf, .freddy INI, .mfa, .ccn, .fnafsav GVAS, and .pak binaries', async () => {
  const sampleFile = new File(['freddy-fazbear-1987'], 'office_cam.txt', { type: 'text/plain' });

  const fnaf = await executeConversion(sampleFile, 'fnaf', { night: 6, aiLevel: 20 });
  assert.equal(fnaf.outputName, 'office_cam.fnaf');
  const fnafJson = JSON.parse(fnaf.textContent || '{}');
  assert.equal(fnafJson.night, 6);
  assert.equal(fnafJson.animatronics.freddyFazbear.aiLevel, 20);

  const freddy = await executeConversion(sampleFile, 'fnaf_freddy', { night: 7, aiLevel: 20 });
  assert.equal(freddy.outputName, 'office_cam.freddy');
  assert.match(freddy.textContent || '', /^\[freddy\]/);
  assert.match(freddy.textContent || '', /beat7=1/);

  const mfa = await executeConversion(sampleFile, 'fnaf_mfa');
  const mfaBytes = new Uint8Array(await (mfa.data as Blob).arrayBuffer());
  assert.equal(new TextDecoder().decode(mfaBytes.slice(0, 4)), 'PAMU');

  const ccn = await executeConversion(sampleFile, 'fnaf_ccn');
  const ccnBytes = new Uint8Array(await (ccn.data as Blob).arrayBuffer());
  assert.equal(new TextDecoder().decode(ccnBytes.slice(0, 4)), 'PAME');

  const sav = await executeConversion(sampleFile, 'fnaf_sav');
  const savBytes = new Uint8Array(await (sav.data as Blob).arrayBuffer());
  assert.equal(new TextDecoder().decode(savBytes.slice(0, 4)), 'GVAS');

  const pak = await executeConversion(sampleFile, 'fnaf_pak');
  const pakBytes = new Uint8Array(await (pak.data as Blob).arrayBuffer());
  const dv = new DataView(pakBytes.buffer);
  assert.equal(dv.getUint32(pakBytes.length - 45 + 17, true), 0x5a6f12e1);

  // Verify conversion options exist
  assert.ok(getConversionOptions('dll').length >= 2);
  assert.ok(getConversionOptions('fnfc').length >= 3);
  assert.ok(getConversionOptions('fnaf_freddy').length >= 2);
});
