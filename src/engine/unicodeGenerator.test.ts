import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isEmojiChar,
  getRandomEmojiColorStyle,
  generateRandomUnicode,
  EMOJI_COLOR_STYLES,
} from './unicodeGenerator.ts';
import { FORMATS } from './formats.ts';

test('isEmojiChar correctly detects emojis vs standard Latin characters', () => {
  // Common emojis
  assert.equal(isEmojiChar('🦊', 0x1F98A), true, 'fox emoji should be detected');
  assert.equal(isEmojiChar('🚀', 0x1F680), true, 'rocket emoji should be detected');
  assert.equal(isEmojiChar('🍬', 0x1F36C), true, 'candy emoji should be detected');
  assert.equal(isEmojiChar('🔮', 0x1F52E), true, 'crystal ball emoji should be detected');
  assert.equal(isEmojiChar('😀', 0x1F600), true, 'smiley emoji should be detected');

  // Standard alphanumeric characters
  assert.equal(isEmojiChar('A', 0x0041), false, 'A is not an emoji');
  assert.equal(isEmojiChar('9', 0x0039), false, '9 is not an emoji');
  assert.equal(isEmojiChar('z', 0x007A), false, 'z is not an emoji');
});

test('getRandomEmojiColorStyle returns vibrant CSS filter and hex hint', () => {
  const style = getRandomEmojiColorStyle();
  assert.ok(style.name && style.name.length > 0, 'Style has a descriptive name');
  assert.ok(style.filter.includes('hue-rotate'), 'Filter contains hue-rotate CSS function');
  assert.ok(style.hex && style.hex.length > 0, 'Style provides a color hex or hsl string');
  assert.ok(EMOJI_COLOR_STYLES.length >= 10, 'Curated styles palette has at least 10 color styles');
});

test('generateRandomUnicode generates characters with emoji colors, random direction and sizes', () => {
  const results = generateRandomUnicode(25, {
    includeCJK: true,
    includePrivateUse: false,
    includeDeprecated: false,
    includeLatest16: true,
    includeLegacySystems: false,
    includeSubstitutes: false,
    includeEbcdic: false,
    fullRandomMode: false,
    randomColors: true,
    randomSizes: true,
    randomFonts: true,
    randomDirections: true,
    directionMode: 'all',
    fontSizeBase: 48,
    unlimitedFontSize: true,
    useGoogleFonts: true,
    randomEmojiColors: true,
  });

  assert.equal(results.length, 25, 'Should generate exactly 25 characters');

  // Check that directions are applied
  const rotated = results.filter((c) => Boolean(c.transform));
  assert.ok(rotated.length > 0, 'At least some characters have transform applied for random direction');

  // Check that sizes are applied
  const sized = results.filter((c) => Boolean(c.fontSize));
  assert.ok(sized.length > 0, 'At least some characters have custom font sizes');

  // Check that colors are applied
  const colored = results.filter((c) => Boolean(c.color));
  assert.ok(colored.length > 0, 'At least some characters have vibrant colors');
});

test('Format Matrix includes required categories with expanded formats and .nes file type', () => {
  const allFormats = Object.values(FORMATS);

  // 1. .nes file type
  assert.ok(FORMATS.nes, 'FORMATS.nes exists');
  assert.equal(FORMATS.nes.extension, '.nes', 'NES extension is .nes');
  assert.ok(FORMATS.nes.name.toLowerCase().includes('nintendo'), 'NES name contains Nintendo');

  // 2. Spreadsheets category expanded
  const spreadsheets = allFormats.filter((f) => f.category === 'spreadsheet');
  assert.ok(spreadsheets.length >= 25, `Spreadsheets has ${spreadsheets.length} formats (expected >= 25)`);
  assert.ok(FORMATS.xlsb, '.xlsb exists in format matrix');
  assert.ok(FORMATS.ots, '.ots exists in format matrix');
  assert.ok(FORMATS.qpw, '.qpw exists in format matrix');

  // 3. Typography (font) category expanded
  const fonts = allFormats.filter((f) => f.category === 'font');
  assert.ok(fonts.length >= 25, `Typography has ${fonts.length} formats (expected >= 25)`);
  assert.ok(FORMATS.tfm, '.tfm exists in typography matrix');
  assert.ok(FORMATS.fea, '.fea exists in typography matrix');
  assert.ok(FORMATS.bmfont, '.bmfont exists in typography matrix');

  // 4. Database category expanded
  const databases = allFormats.filter((f) => f.category === 'database');
  assert.ok(databases.length >= 30, `Database has ${databases.length} formats (expected >= 30)`);
  assert.ok(FORMATS.db3, '.db3 exists in database matrix');
  assert.ok(FORMATS.rdb, '.rdb exists in database matrix');
  assert.ok(FORMATS.feather, '.feather exists in database matrix');

  // 5. Units category expanded
  const units = allFormats.filter((f) => f.category === 'units');
  assert.ok(units.length >= 20, `Units has ${units.length} formats (expected >= 20)`);
  assert.ok(FORMATS.pressure_unit, '.pressure exists in units matrix');
  assert.ok(FORMATS.energy_unit, '.energy exists in units matrix');
  assert.ok(FORMATS.astro_unit, '.astro exists in units matrix');
});
