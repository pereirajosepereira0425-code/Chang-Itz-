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

  // 6. N64 and WAD formats
  assert.ok(FORMATS.z64, 'FORMATS.z64 exists');
  assert.equal(FORMATS.z64.category, 'archive', 'z64 is archive category');
  assert.equal(FORMATS.z64.isBinary, true, 'z64 is binary');
  assert.ok(FORMATS.n64, 'FORMATS.n64 exists');
  assert.equal(FORMATS.n64.category, 'archive', 'n64 is archive category');
  assert.ok(FORMATS.v64, 'FORMATS.v64 exists');
  assert.ok(FORMATS.wad, 'FORMATS.wad exists');
  assert.equal(FORMATS.wad.category, 'archive', 'wad is archive category');
  assert.equal(FORMATS.wad.isBinary, true, 'wad is binary');
});

test('N64 ROM Endianness Engine detects, parses, and swaps bytes correctly', async () => {
  const {
    detectN64Endianness,
    toBigEndianZ64,
    toByteSwappedV64,
    toLittleEndianN64,
    parseN64Header,
  } = await import('./converters/n64WadConverter.ts');

  // Sample Big-Endian N64 ROM header (magic 0x80371240)
  const beHeader = new Uint8Array(64);
  beHeader[0] = 0x80; beHeader[1] = 0x37; beHeader[2] = 0x12; beHeader[3] = 0x40;
  // Game Title at offset 32: "SUPER MARIO 64      "
  const title = 'SUPER MARIO 64      ';
  for (let i = 0; i < 20; i++) beHeader[32 + i] = title.charCodeAt(i);
  // Game Code at offset 59: "NSME"
  beHeader[59] = 0x4e; beHeader[60] = 0x53; beHeader[61] = 0x4d; beHeader[62] = 0x45;

  assert.equal(detectN64Endianness(beHeader), 'big', 'Detects big endian (.z64)');

  // Convert to Byte-Swapped (.v64)
  const v64 = toByteSwappedV64(beHeader);
  assert.equal(detectN64Endianness(v64), 'byteswapped', 'Detects byte-swapped (.v64)');
  assert.equal(v64[0], 0x37);
  assert.equal(v64[1], 0x80);
  assert.equal(v64[2], 0x40);
  assert.equal(v64[3], 0x12);

  // Convert to Little-Endian (.n64)
  const n64 = toLittleEndianN64(beHeader);
  assert.equal(detectN64Endianness(n64), 'little', 'Detects little endian (.n64)');
  assert.equal(n64[0], 0x40);
  assert.equal(n64[1], 0x12);
  assert.equal(n64[2], 0x37);
  assert.equal(n64[3], 0x80);

  // Convert v64 back to Big-Endian
  const restoredFromV64 = toBigEndianZ64(v64);
  assert.equal(detectN64Endianness(restoredFromV64), 'big', 'Restores to big endian from v64');
  assert.equal(restoredFromV64[0], 0x80);

  // Parse header
  const parsed = parseN64Header(beHeader);
  assert.equal(parsed.gameTitle, 'SUPER MARIO 64');
  assert.equal(parsed.gameCode, 'NSME');
  assert.equal(parsed.destinationCode, 'E');
  assert.equal(parsed.destinationRegion, 'North America (NTSC)');
});

test('DOOM WAD Engine correctly parses lumps and packages lumps', async () => {
  const { parseWadHeader } = await import('./converters/n64WadConverter.ts');

  // Build a sample IWAD with 1 lump
  const wad = new Uint8Array(12 + 4 + 16);
  const view = new DataView(wad.buffer);
  wad[0] = 0x49; wad[1] = 0x57; wad[2] = 0x41; wad[3] = 0x44; // "IWAD"
  view.setInt32(4, 1, true); // 1 lump
  view.setInt32(8, 16, true); // directory at offset 16
  // Lump payload
  wad[12] = 0xde; wad[13] = 0xad; wad[14] = 0xbe; wad[15] = 0xef;
  // Lump entry: offset 12, size 4, name "PLAYPAL"
  view.setInt32(16, 12, true);
  view.setInt32(20, 4, true);
  const name = 'PLAYPAL\0';
  for (let i = 0; i < 8; i++) wad[24 + i] = name.charCodeAt(i);

  const parsedWad = parseWadHeader(wad);
  assert.equal(parsedWad.type, 'IWAD');
  assert.equal(parsedWad.numLumps, 1);
  assert.equal(parsedWad.lumps[0].name, 'PLAYPAL');
  assert.equal(parsedWad.lumps[0].size, 4);
});
