import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIni, formatToIni } from './converters/iniConverter.ts';
import { FORMATS, detectFormat } from './formats.ts';

test('parseIni parses sections, comments, booleans, and numbers correctly', () => {
  const sampleIni = `
; Game configuration file
[Display]
width = 1920
height = 1080
fullscreen = true ; inline comment
fov = 95.5

[Audio]
# Sound settings
master_volume = 0.85
music_enabled = false
audio_device = "Default Surround 7.1"
`;

  const parsed = parseIni(sampleIni);

  assert.ok(parsed.Display, 'Display section exists');
  assert.equal(parsed.Display.width, 1920);
  assert.equal(parsed.Display.height, 1080);
  assert.equal(parsed.Display.fullscreen, true);
  assert.equal(parsed.Display.fov, 95.5);

  assert.ok(parsed.Audio, 'Audio section exists');
  assert.equal(parsed.Audio.master_volume, 0.85);
  assert.equal(parsed.Audio.music_enabled, false);
  assert.equal(parsed.Audio.audio_device, 'Default Surround 7.1');
});

test('formatToIni serializes structured object into clean INI format', () => {
  const data = {
    Graphics: {
      shadows: true,
      quality_level: 4,
    },
    Controls: {
      sensitivity: 1.25,
      invert_y: false,
    },
  };

  const output = formatToIni(data, { addTimestampHeader: false });

  assert.ok(output.includes('[Graphics]'), 'Contains [Graphics] header');
  assert.ok(output.includes('shadows = true'), 'Contains shadows = true');
  assert.ok(output.includes('quality_level = 4'), 'Contains quality_level = 4');
  assert.ok(output.includes('[Controls]'), 'Contains [Controls] header');
  assert.ok(output.includes('sensitivity = 1.25'), 'Contains sensitivity = 1.25');
  assert.ok(output.includes('invert_y = false'), 'Contains invert_y = false');
});

test('Game file types and ROMs are correctly registered in FORMATS', () => {
  const gameExts = ['sfc', 'z64', 'gba', 'nds', 'wad', 'pk3', 'vpk', 'dds', 'vgm', 'spc', 'mcworld'];

  for (const ext of gameExts) {
    assert.ok(FORMATS[ext], `Game format "${ext}" is registered`);
    assert.ok(FORMATS[ext].extension.length > 0, `Format "${ext}" has a valid extension`);
    assert.ok(FORMATS[ext].emoji.length > 0, `Format "${ext}" has an emoji icon`);
  }
});
