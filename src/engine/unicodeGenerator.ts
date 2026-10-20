import { getRandomGoogleFont, loadGoogleFont, GOOGLE_FONTS_CATALOG } from './googleFonts';

export interface UnicodeCharacterInfo {
  char: string;
  codePoint: number;
  hex: string;
  dec: number;
  htmlEntity: string;
  block: string;
  version: string;
  isDeprecated?: boolean;
  system?: string; // Pre-Unicode system or substitute name
  notes?: string;
  // Style overrides for random styling
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  googleFont?: string;
  transform?: string;
  directionNote?: string;
  // Emoji random color filters
  isEmoji?: boolean;
  emojiFilter?: string;
  emojiColorName?: string;
  emojiHex?: string;
}

export interface UnicodeGeneratorOptions {
  includeCJK: boolean;
  includePrivateUse: boolean;
  includeDeprecated: boolean;
  includeLatest16: boolean;
  includeLegacySystems: boolean; // DOS CP437, Commodore PETSCII, ATASCII, Apple, JIS
  includeSubstitutes: boolean;   // Unicode Replacement, Tofu, Control Pictures, Mojibake
  includeEbcdic: boolean;        // IBM EBCDIC & Baudot Telegraph
  fullRandomMode: boolean;       // Pick uniformly across all 1,114,112 Unicode codepoints
  // Visual Randomization Options
  randomColors: boolean;
  randomSizes: boolean;
  randomFonts: boolean;
  randomDirections?: boolean;      // Every unicode character facing a random direction
  directionMode?: 'all' | '360' | 'orthogonal' | 'flip'; // Rotation style
  fontSizeBase: number;
  filterBlock?: string;
  // Google Fonts from fonts.google.com & Unlimited Size extensions
  selectedGoogleFont?: string;     // Specific Google Font to apply (e.g. "Bebas Neue", "Pacifico")
  useGoogleFonts?: boolean;        // Whether randomFonts should pull from Google Fonts catalog
  customFontSize?: number | string; // Direct unlimited font size (e.g., 48, 120, 500, 2500, 10000+ px)
  unlimitedFontSize?: boolean;     // Enable completely unrestricted font sizes
  randomSizeMin?: number;
  randomSizeMax?: number;
  // Emojis with Random Colors & Physics mode
  randomEmojiColors?: boolean;     // Emojis have vivid random colors via CSS color filters
  physicsEnabled?: boolean;        // Gravity, bounce, and rigid-body 2D physics
}

// Random Palette generator
export const VIBRANT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb7185',
  '#38bdf8', '#4ade80', '#fbbf24', '#c084fc', '#f472b6', '#2dd4bf',
];

export interface EmojiColorStyle {
  name: string;
  filter: string;
  hex: string;
}

export const EMOJI_COLOR_STYLES: EmojiColorStyle[] = [
  { name: "Cyber Neon Cyan", filter: "hue-rotate(180deg) saturate(380%) brightness(1.2) drop-shadow(0 0 10px rgba(6,182,212,0.75))", hex: "#06b6d4" },
  { name: "Electric Magenta", filter: "hue-rotate(290deg) saturate(420%) brightness(1.15) drop-shadow(0 0 10px rgba(217,70,239,0.75))", hex: "#d946ef" },
  { name: "Emerald Matrix", filter: "hue-rotate(95deg) saturate(340%) brightness(1.1) drop-shadow(0 0 10px rgba(34,197,94,0.75))", hex: "#22c55e" },
  { name: "Molten Ruby Crimson", filter: "hue-rotate(330deg) saturate(450%) brightness(1.1) drop-shadow(0 0 10px rgba(239,68,68,0.75))", hex: "#ef4444" },
  { name: "Golden Solar Amber", filter: "hue-rotate(45deg) saturate(380%) brightness(1.25) drop-shadow(0 0 10px rgba(245,158,11,0.75))", hex: "#f59e0b" },
  { name: "Deep Cosmic Violet", filter: "hue-rotate(250deg) saturate(360%) brightness(1.1) drop-shadow(0 0 10px rgba(139,92,246,0.75))", hex: "#8b5cf6" },
  { name: "Vaporwave Rose", filter: "sepia(0.65) hue-rotate(310deg) saturate(320%) brightness(1.2) drop-shadow(0 0 10px rgba(244,114,182,0.75))", hex: "#f472b6" },
  { name: "Arctic Ice Blue", filter: "hue-rotate(195deg) saturate(280%) brightness(1.3) contrast(1.1) drop-shadow(0 0 10px rgba(56,189,248,0.75))", hex: "#38bdf8" },
  { name: "Phantom Ghost Lavender", filter: "invert(0.85) hue-rotate(180deg) saturate(220%) brightness(1.15)", hex: "#a78bfa" },
  { name: "Solarized Lime", filter: "hue-rotate(75deg) saturate(480%) brightness(1.2) contrast(1.15) drop-shadow(0 0 10px rgba(132,204,22,0.75))", hex: "#84cc16" },
  { name: "Twilight Coral", filter: "hue-rotate(15deg) saturate(360%) brightness(1.15) drop-shadow(0 0 8px rgba(249,115,22,0.75))", hex: "#f97316" },
  { name: "Deep Sea Teal", filter: "hue-rotate(145deg) saturate(320%) brightness(1.05) drop-shadow(0 0 10px rgba(20,184,166,0.75))", hex: "#14b8a6" },
  { name: "Galactic Amethyst", filter: "sepia(0.5) hue-rotate(265deg) saturate(450%) brightness(1.1) drop-shadow(0 0 10px rgba(168,85,247,0.75))", hex: "#a855f7" },
  { name: "Hyper Green Laser", filter: "hue-rotate(110deg) saturate(550%) brightness(1.3) drop-shadow(0 0 12px rgba(16,185,129,0.8))", hex: "#10b981" },
  { name: "Midnight Indigo", filter: "hue-rotate(225deg) saturate(380%) brightness(1.05) drop-shadow(0 0 10px rgba(99,102,241,0.75))", hex: "#6366f1" },
];

export function isEmojiChar(char: string, codePoint?: number): boolean {
  if (codePoint !== undefined) {
    if (
      (codePoint >= 0x1F300 && codePoint <= 0x1FAFF) ||
      (codePoint >= 0x1F600 && codePoint <= 0x1F64F) ||
      (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) ||
      (codePoint >= 0x2600 && codePoint <= 0x27BF) ||
      (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) ||
      (codePoint >= 0x1FA70 && codePoint <= 0x1FAFF) ||
      (codePoint >= 0x1F004 && codePoint <= 0x1F0CF) ||
      (codePoint >= 0x2300 && codePoint <= 0x23FF) ||
      (codePoint >= 0x2B50 && codePoint <= 0x2B55)
    ) {
      return true;
    }
  }
  return /\p{Extended_Pictographic}/u.test(char);
}

export function getRandomEmojiColorStyle(): EmojiColorStyle {
  if (Math.random() < 0.75) {
    return EMOJI_COLOR_STYLES[Math.floor(Math.random() * EMOJI_COLOR_STYLES.length)];
  }
  const deg = Math.floor(Math.random() * 360);
  const sat = Math.floor(250 + Math.random() * 250);
  const bri = (1.05 + Math.random() * 0.25).toFixed(2);
  return {
    name: `${deg}° Rainbow Spectrum`,
    filter: `hue-rotate(${deg}deg) saturate(${sat}%) brightness(${bri}) drop-shadow(0 0 8px hsla(${deg}, 90%, 60%, 0.65))`,
    hex: `hsl(${deg}, 85%, 55%)`,
  };
}

export const FONT_FAMILIES = [
  'monospace',
  'serif',
  'sans-serif',
  'cursive',
  'fantasy',
  'system-ui',
  '"Courier New", Courier, monospace',
  '"Georgia", serif',
  '"Times New Roman", Times, serif',
  '"Trebuchet MS", sans-serif',
  '"Arial Black", Gadget, sans-serif',
  '"Impact", Charcoal, sans-serif',
  '"Lucida Console", Monaco, monospace',
  '"Comic Sans MS", "Comic Sans", cursive',
  '"Palatino Linotype", "Book Antiqua", Palatino, serif',
];

// Deprecated or historically removed characters
export const DEPRECATED_UNICODE_CHARS: { codePoint: number; name: string; version: string; reason: string }[] = [
  { codePoint: 0x0673, name: "ARABIC LETTER ALEF WITH WAVY HAMZA BELOW", version: "4.0", reason: "Deprecated in favor of U+0627 with combining hamza" },
  { codePoint: 0x0F77, name: "TIBETAN VOWEL SIGN VOCALIC RR", version: "3.0", reason: "Deprecated composite glyph, replaced with decomposed sequence" },
  { codePoint: 0x0F79, name: "TIBETAN VOWEL SIGN VOCALIC LL", version: "3.0", reason: "Deprecated composite glyph, replaced with decomposed sequence" },
  { codePoint: 0x17A3, name: "KHMER INDEPENDENT VOWEL QAQ", version: "4.0", reason: "Deprecated spelling variant error" },
  { codePoint: 0x17A4, name: "KHMER INDEPENDENT VOWEL QAA", version: "4.0", reason: "Deprecated obsolete form" },
  { codePoint: 0x206A, name: "INHIBIT SYMMETRIC SWAPPING", version: "3.1", reason: "Deprecated formatting control character" },
  { codePoint: 0x206B, name: "ACTIVATE SYMMETRIC SWAPPING", version: "3.1", reason: "Deprecated formatting control character" },
  { codePoint: 0x206C, name: "INHIBIT ARABIC FORM SHAPING", version: "3.1", reason: "Deprecated shaping control" },
  { codePoint: 0x206D, name: "ACTIVATE ARABIC FORM SHAPING", version: "3.1", reason: "Deprecated shaping control" },
  { codePoint: 0x206E, name: "NATIONAL DIGIT SHAPES", version: "3.1", reason: "Deprecated digit substitution control" },
  { codePoint: 0x206F, name: "NOMINAL DIGIT SHAPES", version: "3.1", reason: "Deprecated digit substitution control" },
  { codePoint: 0x2329, name: "LEFT-POINTING ANGLE BRACKET", version: "5.2", reason: "Deprecated in favor of U+3008 due to canonical mapping issues" },
  { codePoint: 0x232A, name: "RIGHT-POINTING ANGLE BRACKET", version: "5.2", reason: "Deprecated in favor of U+3009 due to canonical mapping issues" },
  { codePoint: 0xE0001, name: "LANGUAGE TAG", version: "5.0", reason: "Deprecated tag plane code" },
  { codePoint: 0x1D173, name: "MUSICAL SYMBOL BEGIN BEAM", version: "3.1", reason: "Deprecated beam control code" },
  { codePoint: 0x1D174, name: "MUSICAL SYMBOL END BEAM", version: "3.1", reason: "Deprecated beam control code" },
  { codePoint: 0x1D175, name: "MUSICAL SYMBOL BEGIN TIE", version: "3.1", reason: "Deprecated tie control code" },
  { codePoint: 0x1D176, name: "MUSICAL SYMBOL END TIE", version: "3.1", reason: "Deprecated tie control code" },
  { codePoint: 0x1D177, name: "MUSICAL SYMBOL BEGIN SLUR", version: "3.1", reason: "Deprecated slur control code" },
  { codePoint: 0x1D178, name: "MUSICAL SYMBOL END SLUR", version: "3.1", reason: "Deprecated slur control code" },
  { codePoint: 0x1D179, name: "MUSICAL SYMBOL BEGIN PHRASE", version: "3.1", reason: "Deprecated phrase control code" },
  { codePoint: 0x1D17A, name: "MUSICAL SYMBOL END PHRASE", version: "3.1", reason: "Deprecated phrase control code" },
];

// Pre-Unicode Legacy Systems & Substitutes Database
export const LEGACY_SYSTEMS_AND_SUBSTITUTES: {
  char: string;
  name: string;
  system: string;
  codePoint: number;
  notes: string;
}[] = [
  // 1. IBM PC DOS Code Page 437 (1981)
  { char: "☺", name: "WHITE SMILING FACE", system: "DOS CP437 (IBM PC)", codePoint: 0x263A, notes: "Byte 0x01 in original 1981 IBM PC ROM" },
  { char: "☻", name: "BLACK SMILING FACE", system: "DOS CP437 (IBM PC)", codePoint: 0x263B, notes: "Byte 0x02 in original 1981 IBM PC ROM" },
  { char: "♥", name: "BLACK HEART SUIT", system: "DOS CP437 (IBM PC)", codePoint: 0x2665, notes: "Byte 0x03 in IBM PC BIOS" },
  { char: "♦", name: "BLACK DIAMOND SUIT", system: "DOS CP437 (IBM PC)", codePoint: 0x2666, notes: "Byte 0x04 in IBM PC BIOS" },
  { char: "♣", name: "BLACK CLUB SUIT", system: "DOS CP437 (IBM PC)", codePoint: 0x2663, notes: "Byte 0x05 in IBM PC BIOS" },
  { char: "♠", name: "BLACK SPADE SUIT", system: "DOS CP437 (IBM PC)", codePoint: 0x2660, notes: "Byte 0x06 in IBM PC BIOS" },
  { char: "•", name: "BULLET", system: "DOS CP437 (IBM PC)", codePoint: 0x2022, notes: "Byte 0x07 in IBM PC BIOS" },
  { char: "◘", name: "INVERSE BULLET", system: "DOS CP437 (IBM PC)", codePoint: 0x25D8, notes: "Byte 0x08 in IBM PC BIOS" },
  { char: "○", name: "WHITE CIRCLE", system: "DOS CP437 (IBM PC)", codePoint: 0x25CB, notes: "Byte 0x09 in IBM PC BIOS" },
  { char: "◙", name: "INVERSE WHITE CIRCLE", system: "DOS CP437 (IBM PC)", codePoint: 0x25D9, notes: "Byte 0x0A in IBM PC BIOS" },
  { char: "♂", name: "MALE SIGN", system: "DOS CP437 (IBM PC)", codePoint: 0x2642, notes: "Byte 0x0B in IBM PC BIOS" },
  { char: "♀", name: "FEMALE SIGN", system: "DOS CP437 (IBM PC)", codePoint: 0x2640, notes: "Byte 0x0C in IBM PC BIOS" },
  { char: "♪", name: "EIGHTH NOTE", system: "DOS CP437 (IBM PC)", codePoint: 0x266A, notes: "Byte 0x0D in IBM PC BIOS" },
  { char: "♫", name: "BEAMED EIGHTH NOTES", system: "DOS CP437 (IBM PC)", codePoint: 0x266B, notes: "Byte 0x0E in IBM PC BIOS" },
  { char: "☼", name: "WHITE SUN WITH RAYS", system: "DOS CP437 (IBM PC)", codePoint: 0x263C, notes: "Byte 0x0F in IBM PC BIOS" },
  { char: "►", name: "BLACK RIGHT-POINTING POINTER", system: "DOS CP437 (IBM PC)", codePoint: 0x25BA, notes: "Byte 0x10 in IBM PC BIOS" },
  { char: "◄", name: "BLACK LEFT-POINTING POINTER", system: "DOS CP437 (IBM PC)", codePoint: 0x25C4, notes: "Byte 0x11 in IBM PC BIOS" },
  { char: "↕", name: "UP DOWN ARROW", system: "DOS CP437 (IBM PC)", codePoint: 0x2195, notes: "Byte 0x12 in IBM PC BIOS" },
  { char: "‼", name: "DOUBLE EXCLAMATION MARK", system: "DOS CP437 (IBM PC)", codePoint: 0x203C, notes: "Byte 0x13 in IBM PC BIOS" },
  { char: "¶", name: "PILCROW SIGN", system: "DOS CP437 (IBM PC)", codePoint: 0x00B6, notes: "Byte 0x14 in IBM PC BIOS" },
  { char: "§", name: "SECTION SIGN", system: "DOS CP437 (IBM PC)", codePoint: 0x00A7, notes: "Byte 0x15 in IBM PC BIOS" },
  { char: "▬", name: "BLACK RECTANGLE", system: "DOS CP437 (IBM PC)", codePoint: 0x25AC, notes: "Byte 0x16 in IBM PC BIOS" },
  { char: "↨", name: "UP DOWN ARROW WITH BASE", system: "DOS CP437 (IBM PC)", codePoint: 0x21A8, notes: "Byte 0x17 in IBM PC BIOS" },
  { char: "↑", name: "UPWARDS ARROW", system: "DOS CP437 (IBM PC)", codePoint: 0x2191, notes: "Byte 0x18 in IBM PC BIOS" },
  { char: "↓", name: "DOWNWARDS ARROW", system: "DOS CP437 (IBM PC)", codePoint: 0x2193, notes: "Byte 0x19 in IBM PC BIOS" },
  { char: "→", name: "RIGHTWARDS ARROW", system: "DOS CP437 (IBM PC)", codePoint: 0x2192, notes: "Byte 0x1A in IBM PC BIOS" },
  { char: "←", name: "LEFTWARDS ARROW", system: "DOS CP437 (IBM PC)", codePoint: 0x2190, notes: "Byte 0x1B in IBM PC BIOS" },
  { char: "∟", name: "RIGHT ANGLE", system: "DOS CP437 (IBM PC)", codePoint: 0x221F, notes: "Byte 0x1C in IBM PC BIOS" },
  { char: "↔", name: "LEFT RIGHT ARROW", system: "DOS CP437 (IBM PC)", codePoint: 0x2194, notes: "Byte 0x1D in IBM PC BIOS" },
  { char: "▲", name: "BLACK UP-POINTING TRIANGLE", system: "DOS CP437 (IBM PC)", codePoint: 0x25B2, notes: "Byte 0x1E in IBM PC BIOS" },
  { char: "▼", name: "BLACK DOWN-POINTING TRIANGLE", system: "DOS CP437 (IBM PC)", codePoint: 0x25BC, notes: "Byte 0x1F in IBM PC BIOS" },
  // CP437 Box-drawing and shades
  { char: "░", name: "LIGHT SHADE", system: "DOS CP437 (IBM PC)", codePoint: 0x2591, notes: "Byte 0xB0 25% dither block" },
  { char: "▒", name: "MEDIUM SHADE", system: "DOS CP437 (IBM PC)", codePoint: 0x2592, notes: "Byte 0xB1 50% dither block" },
  { char: "▓", name: "DARK SHADE", system: "DOS CP437 (IBM PC)", codePoint: 0x2593, notes: "Byte 0xB2 75% dither block" },
  { char: "│", name: "BOX DRAWINGS LIGHT VERTICAL", system: "DOS CP437 (IBM PC)", codePoint: 0x2502, notes: "Byte 0xB3 ANSI box line" },
  { char: "─", name: "BOX DRAWINGS LIGHT HORIZONTAL", system: "DOS CP437 (IBM PC)", codePoint: 0x2500, notes: "Byte 0xC4 Single horizontal line" },
  { char: "┼", name: "BOX DRAWINGS LIGHT VERTICAL AND HORIZONTAL", system: "DOS CP437 (IBM PC)", codePoint: 0x253C, notes: "Byte 0xC5 Single cross" },
  { char: "═", name: "BOX DRAWINGS DOUBLE HORIZONTAL", system: "DOS CP437 (IBM PC)", codePoint: 0x2550, notes: "Byte 0xCD Double horizontal line" },
  { char: "║", name: "BOX DRAWINGS DOUBLE VERTICAL", system: "DOS CP437 (IBM PC)", codePoint: 0x2551, notes: "Byte 0xBA Double vertical line" },
  { char: "╬", name: "BOX DRAWINGS DOUBLE VERTICAL AND HORIZONTAL", system: "DOS CP437 (IBM PC)", codePoint: 0x256C, notes: "Byte 0xCE Double cross" },
  { char: "█", name: "FULL BLOCK", system: "DOS CP437 (IBM PC)", codePoint: 0x2588, notes: "Byte 0xDB 100% solid block" },
  { char: "▄", name: "LOWER HALF BLOCK", system: "DOS CP437 (IBM PC)", codePoint: 0x2584, notes: "Byte 0xDC Bottom half solid block" },
  { char: "▌", name: "LEFT HALF BLOCK", system: "DOS CP437 (IBM PC)", codePoint: 0x258C, notes: "Byte 0xDD Left half solid block" },
  { char: "▐", name: "RIGHT HALF BLOCK", system: "DOS CP437 (IBM PC)", codePoint: 0x2590, notes: "Byte 0xDE Right half solid block" },
  { char: "▀", name: "UPPER HALF BLOCK", system: "DOS CP437 (IBM PC)", codePoint: 0x2580, notes: "Byte 0xDF Top half solid block" },

  // 2. Commodore 64 / VIC-20 PETSCII (1977-1982)
  { char: "◤", name: "UPPER LEFT TRIANGLE", system: "Commodore PETSCII", codePoint: 0x25E4, notes: "PETSCII diagonal fill glyph" },
  { char: "◥", name: "UPPER RIGHT TRIANGLE", system: "Commodore PETSCII", codePoint: 0x25E5, notes: "PETSCII diagonal fill glyph" },
  { char: "◢", name: "LOWER RIGHT TRIANGLE", system: "Commodore PETSCII", codePoint: 0x25E2, notes: "PETSCII diagonal fill glyph" },
  { char: "◣", name: "LOWER LEFT TRIANGLE", system: "Commodore PETSCII", codePoint: 0x25E3, notes: "PETSCII diagonal fill glyph" },
  { char: "▖", name: "QUADRANT LOWER LEFT", system: "Commodore PETSCII", codePoint: 0x2596, notes: "PETSCII 2x2 graphic quadrant" },
  { char: "▗", name: "QUADRANT LOWER RIGHT", system: "Commodore PETSCII", codePoint: 0x2597, notes: "PETSCII 2x2 graphic quadrant" },
  { char: "▘", name: "QUADRANT UPPER LEFT", system: "Commodore PETSCII", codePoint: 0x2598, notes: "PETSCII 2x2 graphic quadrant" },
  { char: "▙", name: "QUADRANT UPPER LEFT AND LOWER LEFT AND LOWER RIGHT", system: "Commodore PETSCII", codePoint: 0x2599, notes: "PETSCII 3-quadrant block" },
  { char: "▚", name: "QUADRANT UPPER LEFT AND LOWER RIGHT", system: "Commodore PETSCII", codePoint: 0x259A, notes: "PETSCII checker quadrant" },
  { char: "▛", name: "QUADRANT UPPER LEFT AND UPPER RIGHT AND LOWER LEFT", system: "Commodore PETSCII", codePoint: 0x259B, notes: "PETSCII 3-quadrant block" },
  { char: "▜", name: "QUADRANT UPPER LEFT AND UPPER RIGHT AND LOWER RIGHT", system: "Commodore PETSCII", codePoint: 0x259C, notes: "PETSCII 3-quadrant block" },
  { char: "▝", name: "QUADRANT UPPER RIGHT", system: "Commodore PETSCII", codePoint: 0x259D, notes: "PETSCII 2x2 graphic quadrant" },
  { char: "▞", name: "QUADRANT UPPER RIGHT AND LOWER LEFT", system: "Commodore PETSCII", codePoint: 0x259E, notes: "PETSCII checker quadrant" },
  { char: "▟", name: "QUADRANT UPPER RIGHT AND LOWER LEFT AND LOWER RIGHT", system: "Commodore PETSCII", codePoint: 0x259F, notes: "PETSCII 3-quadrant block" },

  // 3. Apple II MouseText & Classic Mac OS Roman
  { char: "", name: "APPLE LOGO GLYPH", system: "Mac OS Roman (Apple II / System 7)", codePoint: 0xF8FF, notes: "Classic Apple logo in Apple PUA encoding" },
  { char: "⌘", name: "COMMAND KEY / PLACE OF INTEREST", system: "Mac OS Roman (Macintosh)", codePoint: 0x2318, notes: "Susan Kare's iconic Mac Command key" },
  { char: "⌥", name: "OPTION KEY", system: "Mac OS Roman (Macintosh)", codePoint: 0x2325, notes: "Macintosh Option / Alt key symbol" },
  { char: "⇧", name: "UPWARDS WHITE ARROW (SHIFT)", system: "Mac OS Roman (Macintosh)", codePoint: 0x21E7, notes: "Keyboard shift modifier" },
  { char: "⌃", name: "UP ARROWHEAD (CONTROL)", system: "Mac OS Roman (Macintosh)", codePoint: 0x2303, notes: "Keyboard control modifier" },
  { char: "↵", name: "DOWNWARDS ARROW WITH CORNER LEFTWARDS", system: "Apple MouseText", codePoint: 0x21B5, notes: "MouseText carriage return symbol" },
  { char: "◊", name: "LOZENGE", system: "Mac OS Roman", codePoint: 0x25CA, notes: "Classic Mac OS dialog symbol" },

  // 4. Teletext / Videotex / Minitel Sixel Block Mosaics (1970s)
  { char: "🬀", name: "SEXTANT-1", system: "Teletext / Videotex", codePoint: 0x1CB00, notes: "Broadcast Teletext 2x3 pixel mosaic" },
  { char: "🬁", name: "SEXTANT-2", system: "Teletext / Videotex", codePoint: 0x1CB01, notes: "Broadcast Teletext 2x3 pixel mosaic" },
  { char: "🬃", name: "SEXTANT-12", system: "Teletext / Videotex", codePoint: 0x1CB03, notes: "Broadcast Teletext 2x3 pixel mosaic" },
  { char: "🬎", name: "SEXTANT-24", system: "Teletext / Videotex", codePoint: 0x1CB0E, notes: "Broadcast Teletext 2x3 pixel mosaic" },
  { char: "🬛", name: "SEXTANT-12345", system: "Teletext / Videotex", codePoint: 0x1CB1B, notes: "Broadcast Teletext 2x3 pixel mosaic" },

  // 5. IBM Mainframe EBCDIC (1964)
  { char: "¢", name: "CENT SIGN", system: "IBM EBCDIC (Code Page 037/500)", codePoint: 0x00A2, notes: "Byte 0x4A in IBM Mainframe EBCDIC" },
  { char: "¬", name: "NOT SIGN", system: "IBM EBCDIC (Code Page 037/500)", codePoint: 0x00AC, notes: "Byte 0x5F in IBM Mainframe EBCDIC" },
  { char: "¦", name: "BROKEN BAR / SPLIT VERTICAL", system: "IBM EBCDIC", codePoint: 0x00A6, notes: "Byte 0x6A in IBM EBCDIC" },
  { char: "¤", name: "CURRENCY SIGN", system: "IBM EBCDIC", codePoint: 0x00A4, notes: "Byte 0x9F International currency placeholder" },

  // 6. Baudot / Murray / ITA2 Teleprinter Telegraph (1920s-1950s)
  { char: "␇", name: "SYMBOL FOR BELL", system: "Baudot / ITA2 Telegraph", codePoint: 0x2407, notes: "Telegraph physical bell chime" },
  { char: "␍", name: "SYMBOL FOR CARRIAGE RETURN", system: "Baudot / ITA2 Telegraph", codePoint: 0x240D, notes: "Typewriter carriage return signal" },
  { char: "␊", name: "SYMBOL FOR LINE FEED", system: "Baudot / ITA2 Telegraph", codePoint: 0x240A, notes: "Teleprinter platen roll signal" },
  { char: "␣", name: "OPEN BOX (SPACE SYMBOL)", system: "Baudot / Teletype", codePoint: 0x2423, notes: "Visualized mechanical blank pulse" },
  { char: "␡", name: "SYMBOL FOR DELETE (RUB OUT)", system: "ASCII / Baudot", codePoint: 0x2421, notes: "Punch-tape all-holes-punched overwrite" },

  // 7. Unicode Substitutes & Fallbacks
  { char: "", name: "REPLACEMENT CHARACTER", system: "Unicode Substitute Fallback", codePoint: 0xFFFD, notes: "Universal unrepresentable byte sequence substitute" },
  { char: "▯", name: "WHITE VERTICAL RECTANGLE (TOFU BOX)", system: "Unicode Substitute Fallback", codePoint: 0x25AF, notes: "Missing glyph fallback box" },
  { char: "▮", name: "BLACK VERTICAL RECTANGLE", system: "Unicode Substitute Fallback", codePoint: 0x25AE, notes: "Missing font fallback glyph" },
  { char: "⯑", name: "BOX WITH DIAGONAL CROSS", system: "Unicode Substitute Fallback", codePoint: 0x2BD1, notes: "Unsupported character glyph" },
  { char: "␀", name: "SYMBOL FOR NULL", system: "ASCII Control Pictures", codePoint: 0x2400, notes: "Visual control character substitute for NUL" },
  { char: "␚", name: "SYMBOL FOR SUBSTITUTE", system: "ASCII Control Pictures", codePoint: 0x241A, notes: "Byte 0x1A ASCII Substitute indicator" },
  { char: "␛", name: "SYMBOL FOR ESCAPE", system: "ASCII Control Pictures", codePoint: 0x241B, notes: "Visual substitute for ESC (0x1B)" },
  { char: "␤", name: "SYMBOL FOR NEWLINE", system: "ASCII Control Pictures", codePoint: 0x2424, notes: "Visual substitute for NL / Line feed" },
  { char: "␢", name: "BLANK SYMBOL", system: "ASCII Control Pictures", codePoint: 0x2422, notes: "Visual substitute for space" },

  // 8. Half-Width Katakana (JIS X 0201 - 1969 Pre-Unicode Japanese)
  { char: "ｦ", name: "HALFWIDTH KATAKANA LETTER WO", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF66, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ｱ", name: "HALFWIDTH KATAKANA LETTER A", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF71, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ｶ", name: "HALFWIDTH KATAKANA LETTER KA", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF76, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ｻ", name: "HALFWIDTH KATAKANA LETTER SA", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF7B, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ﾀ", name: "HALFWIDTH KATAKANA LETTER TA", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF80, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ﾂ", name: "HALFWIDTH KATAKANA LETTER TU", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF82, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ﾃ", name: "HALFWIDTH KATAKANA LETTER TE", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF83, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ﾄ", name: "HALFWIDTH KATAKANA LETTER TO", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF84, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ﾅ", name: "HALFWIDTH KATAKANA LETTER NA", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF85, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ﾆ", name: "HALFWIDTH KATAKANA LETTER NI", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF86, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ﾇ", name: "HALFWIDTH KATAKANA LETTER NU", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF87, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ﾈ", name: "HALFWIDTH KATAKANA LETTER NE", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF88, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ﾉ", name: "HALFWIDTH KATAKANA LETTER NO", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF89, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ﾊ", name: "HALFWIDTH KATAKANA LETTER HA", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF8A, notes: "1969 8-bit Japanese telegraph rom" },
  { char: "ﾞ", name: "HALFWIDTH KATAKANA VOICED SOUND MARK", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF9E, notes: "1969 8-bit Japanese dakuten" },
  { char: "ﾟ", name: "HALFWIDTH KATAKANA SEMI-VOICED SOUND MARK", system: "JIS X 0201 (Pre-Unicode)", codePoint: 0xFF9F, notes: "1969 8-bit Japanese handakuten" },
];

// Latest Unicode 15.0 / 15.1 / 16.0 / 17.0 / 18.0 Draft additions
export const LATEST_UNICODE_CHARS: { codePoint: number; name: string; version: string; block: string }[] = [
  // Unicode 16.0 / 17.0 drafts
  { codePoint: 0x1FAE9, name: "FACE WITH BAGS UNDER EYES", version: "16.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FABC, name: "FINGERPRINT", version: "16.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FABD, name: "LEAFLESS TREE", version: "16.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FA87, name: "HARP", version: "16.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FA88, name: "SHOVEL", version: "16.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FA89, name: "ROOT VEGETABLE (RADISH/BEET)", version: "16.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FAAE, name: "SPLATTER", version: "16.0", block: "Symbols and Pictographs Extended-A" },
  // Unicode 16.0 Scripts
  { codePoint: 0x10D40, name: "GARAY CAPITAL LETTER A", version: "16.0", block: "Garay" },
  { codePoint: 0x10D41, name: "GARAY CAPITAL LETTER CA", version: "16.0", block: "Garay" },
  { codePoint: 0x10D4F, name: "GARAY VOWEL SIGN E", version: "16.0", block: "Garay" },
  { codePoint: 0x16100, name: "GURUNG KHEMA LETTER A", version: "16.0", block: "Gurung Khema" },
  { codePoint: 0x16107, name: "GURUNG KHEMA LETTER KA", version: "16.0", block: "Gurung Khema" },
  { codePoint: 0x16D40, name: "KIRAT RAI SIGN ANUSVARA", version: "16.0", block: "Kirat Rai" },
  { codePoint: 0x16D43, name: "KIRAT RAI LETTER A", version: "16.0", block: "Kirat Rai" },
  { codePoint: 0x1E5D0, name: "OL ONAL LETTER O", version: "16.0", block: "Ol Onal" },
  { codePoint: 0x1E5DF, name: "OL ONAL LETTER LA", version: "16.0", block: "Ol Onal" },
  { codePoint: 0x11BC0, name: "SUNUWAR LETTER DEVI", version: "16.0", block: "Sunuwar" },
  { codePoint: 0x11BC5, name: "SUNUWAR LETTER KARMA", version: "16.0", block: "Sunuwar" },
  { codePoint: 0x105C0, name: "TODHRI LETTER A", version: "16.0", block: "Todhri" },
  { codePoint: 0x105C8, name: "TODHRI LETTER KA", version: "16.0", block: "Todhri" },
  { codePoint: 0x11380, name: "TULU-TIGALARI LETTER A", version: "16.0", block: "Tulu-Tigalari" },
  { codePoint: 0x11390, name: "TULU-TIGALARI LETTER KA", version: "16.0", block: "Tulu-Tigalari" },
  { codePoint: 0x1CC00, name: "DIAGONAL LOWER HALF BLOCK", version: "16.0", block: "Symbols for Legacy Computing Supplement" },
  { codePoint: 0x1CD00, name: "INVERTED CHECKERBOARD SEGMENT", version: "16.0", block: "Symbols for Legacy Computing Supplement" },
  // Unicode 15.0 / 15.1
  { codePoint: 0x1F6DC, name: "WIRELESS HEADPHONES", version: "15.1", block: "Supplemental Symbols and Pictographs" },
  { codePoint: 0x1FA75, name: "LIGHT BLUE HEART", version: "15.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FA76, name: "GREY HEART", version: "15.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FA77, name: "PINK HEART", version: "15.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FA86, name: "MARACAS", version: "15.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FA9F, name: "FOLDING HAND FAN", version: "15.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FABF, name: "GOOSE", version: "15.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FAE8, name: "SHAKING FACE", version: "15.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FAF7, name: "LEFTWARDS PUSHING HAND", version: "15.0", block: "Symbols and Pictographs Extended-A" },
  { codePoint: 0x1FAF8, name: "RIGHTWARDS PUSHING HAND", version: "15.0", block: "Symbols and Pictographs Extended-A" },
];

// Comprehensive Unicode Planes 0 to 16
const ALL_UNICODE_RANGES: { start: number; end: number; name: string; isCJK?: boolean; isPUA?: boolean }[] = [
  // BMP Standard
  { start: 0x0021, end: 0x007E, name: "Basic Latin" },
  { start: 0x00A1, end: 0x00FF, name: "Latin-1 Supplement" },
  { start: 0x0100, end: 0x017F, name: "Latin Extended-A" },
  { start: 0x0180, end: 0x024F, name: "Latin Extended-B" },
  { start: 0x0250, end: 0x02AF, name: "IPA Extensions" },
  { start: 0x02B0, end: 0x02FF, name: "Spacing Modifier Letters" },
  { start: 0x0300, end: 0x036F, name: "Combining Diacritical Marks" },
  { start: 0x0370, end: 0x03FF, name: "Greek and Coptic" },
  { start: 0x0400, end: 0x04FF, name: "Cyrillic" },
  { start: 0x0500, end: 0x052F, name: "Cyrillic Supplement" },
  { start: 0x0530, end: 0x058F, name: "Armenian" },
  { start: 0x0590, end: 0x05FF, name: "Hebrew" },
  { start: 0x0600, end: 0x06FF, name: "Arabic" },
  { start: 0x0700, end: 0x074F, name: "Syriac" },
  { start: 0x0750, end: 0x077F, name: "Arabic Supplement" },
  { start: 0x0780, end: 0x07BF, name: "Thaana" },
  { start: 0x07C0, end: 0x07FF, name: "NKo" },
  { start: 0x0800, end: 0x083F, name: "Samaritan" },
  { start: 0x0840, end: 0x085F, name: "Mandaic" },
  { start: 0x0900, end: 0x097F, name: "Devanagari" },
  { start: 0x0980, end: 0x09FF, name: "Bengali" },
  { start: 0x0A00, end: 0x0A7F, name: "Gurmukhi" },
  { start: 0x0A80, end: 0x0AFF, name: "Gujarati" },
  { start: 0x0B00, end: 0x0B7F, name: "Oriya" },
  { start: 0x0B80, end: 0x0BFF, name: "Tamil" },
  { start: 0x0C00, end: 0x0C7F, name: "Telugu" },
  { start: 0x0C80, end: 0x0CFF, name: "Kannada" },
  { start: 0x0D00, end: 0x0D7F, name: "Malayalam" },
  { start: 0x0D80, end: 0x0DFF, name: "Sinhala" },
  { start: 0x0E00, end: 0x0E7F, name: "Thai" },
  { start: 0x0E80, end: 0x0EFF, name: "Lao" },
  { start: 0x0F00, end: 0x0FFF, name: "Tibetan" },
  { start: 0x1000, end: 0x109F, name: "Myanmar" },
  { start: 0x10A0, end: 0x10FF, name: "Georgian" },
  { start: 0x1200, end: 0x137F, name: "Ethiopic" },
  { start: 0x13A0, end: 0x13FF, name: "Cherokee" },
  { start: 0x1400, end: 0x167F, name: "Unified Canadian Aboriginal Syllabics" },
  { start: 0x1680, end: 0x169F, name: "Ogham" },
  { start: 0x16A0, end: 0x16FF, name: "Runic" },
  { start: 0x1700, end: 0x171F, name: "Tagalog" },
  { start: 0x1720, end: 0x173F, name: "Hanunoo" },
  { start: 0x1780, end: 0x17FF, name: "Khmer" },
  { start: 0x1800, end: 0x18AF, name: "Mongolian" },
  { start: 0x1900, end: 0x194F, name: "Limbu" },
  { start: 0x19E0, end: 0x19FF, name: "Khmer Symbols" },
  { start: 0x1A00, end: 0x1A1F, name: "Buginese" },
  { start: 0x1B00, end: 0x1B7F, name: "Balinese" },
  { start: 0x1BC0, end: 0x1BFF, name: "Batak" },
  { start: 0x1C00, end: 0x1C4F, name: "Lepcha" },
  { start: 0x1C50, end: 0x1C7F, name: "Ol Chiki" },
  { start: 0x1E00, end: 0x1EFF, name: "Latin Extended Additional" },
  { start: 0x1F00, end: 0x1FFF, name: "Greek Extended" },
  { start: 0x2000, end: 0x206F, name: "General Punctuation" },
  { start: 0x2070, end: 0x209F, name: "Superscripts and Subscripts" },
  { start: 0x20A0, end: 0x20CF, name: "Currency Symbols" },
  { start: 0x20D0, end: 0x20FF, name: "Combining Diacritical Marks for Symbols" },
  { start: 0x2100, end: 0x214F, name: "Letterlike Symbols" },
  { start: 0x2150, end: 0x218F, name: "Number Forms" },
  { start: 0x2190, end: 0x21FF, name: "Arrows" },
  { start: 0x2200, end: 0x22FF, name: "Mathematical Operators" },
  { start: 0x2300, end: 0x23FF, name: "Miscellaneous Technical" },
  { start: 0x2400, end: 0x243F, name: "Control Pictures" },
  { start: 0x2440, end: 0x245F, name: "Optical Character Recognition" },
  { start: 0x2460, end: 0x24FF, name: "Enclosed Alphanumerics" },
  { start: 0x2500, end: 0x257F, name: "Box Drawing" },
  { start: 0x2580, end: 0x259F, name: "Block Elements" },
  { start: 0x25A0, end: 0x25FF, name: "Geometric Shapes" },
  { start: 0x2600, end: 0x26FF, name: "Miscellaneous Symbols" },
  { start: 0x2700, end: 0x27BF, name: "Dingbats" },
  { start: 0x27C0, end: 0x27EF, name: "Miscellaneous Mathematical Symbols-A" },
  { start: 0x27F0, end: 0x27FF, name: "Supplemental Arrows-A" },
  { start: 0x2800, end: 0x28FF, name: "Braille Patterns" },
  { start: 0x2900, end: 0x297F, name: "Supplemental Arrows-B" },
  { start: 0x2980, end: 0x29FF, name: "Miscellaneous Mathematical Symbols-B" },
  { start: 0x2A00, end: 0x2AFF, name: "Supplemental Mathematical Operators" },
  { start: 0x2B00, end: 0x2BFF, name: "Miscellaneous Symbols and Arrows" },
  { start: 0x2C00, end: 0x2C5F, name: "Glagolitic" },
  { start: 0x2C60, end: 0x2C7F, name: "Latin Extended-C" },
  { start: 0x2C80, end: 0x2CFF, name: "Coptic" },
  { start: 0x2D00, end: 0x2D2F, name: "Georgian Supplement" },
  { start: 0x2D30, end: 0x2D7F, name: "Tifinagh" },

  // CJK Ideographs & Asian scripts
  { start: 0x4E00, end: 0x9FFF, name: "CJK Unified Ideographs", isCJK: true },
  { start: 0x3400, end: 0x4DBF, name: "CJK Unified Ideographs Extension A", isCJK: true },
  { start: 0xAC00, end: 0xD7AF, name: "Hangul Syllables", isCJK: true },
  { start: 0x3040, end: 0x309F, name: "Hiragana", isCJK: true },
  { start: 0x30A0, end: 0x30FF, name: "Katakana", isCJK: true },
  { start: 0x3100, end: 0x312F, name: "Bopomofo", isCJK: true },
  { start: 0x31A0, end: 0x31BF, name: "Bopomofo Extended", isCJK: true },
  { start: 0x20000, end: 0x2A6DF, name: "CJK Extension B", isCJK: true },
  { start: 0x2A700, end: 0x2B73F, name: "CJK Extension C", isCJK: true },
  { start: 0x2B740, end: 0x2B81F, name: "CJK Extension D", isCJK: true },
  { start: 0x2B820, end: 0x2CEAF, name: "CJK Extension E", isCJK: true },
  { start: 0x2CEB0, end: 0x2EBEF, name: "CJK Extension F", isCJK: true },
  { start: 0x30000, end: 0x3134F, name: "CJK Extension G", isCJK: true },
  { start: 0x31350, end: 0x323AF, name: "CJK Extension H", isCJK: true },
  { start: 0x2EBF0, end: 0x2EE5D, name: "CJK Extension I", isCJK: true },

  // Private Use Areas (PUA)
  { start: 0xE000, end: 0xF8FF, name: "Private Use Area (BMP)", isPUA: true },
  { start: 0xF0000, end: 0xFFFFD, name: "Supplementary Private Use Area-A", isPUA: true },
  { start: 0x100000, end: 0x10FFFD, name: "Supplementary Private Use Area-B", isPUA: true },

  // Plane 1 (SMP) Non-CJK
  { start: 0x10000, end: 0x1007F, name: "Linear B Syllabary" },
  { start: 0x10080, end: 0x100FF, name: "Linear B Ideograms" },
  { start: 0x10100, end: 0x1013F, name: "Aegean Numbers" },
  { start: 0x10140, end: 0x1018F, name: "Ancient Greek Numbers" },
  { start: 0x10190, end: 0x101CF, name: "Ancient Symbols" },
  { start: 0x101D0, end: 0x101FF, name: "Phaistos Disc" },
  { start: 0x10280, end: 0x1029F, name: "Lycian" },
  { start: 0x102A0, end: 0x102DF, name: "Carian" },
  { start: 0x10300, end: 0x1032F, name: "Old Italic" },
  { start: 0x10330, end: 0x1034F, name: "Gothic" },
  { start: 0x10380, end: 0x1039F, name: "Ugaritic" },
  { start: 0x103A0, end: 0x103DF, name: "Old Persian" },
  { start: 0x10400, end: 0x1044F, name: "Deseret" },
  { start: 0x10450, end: 0x1047F, name: "Shavian" },
  { start: 0x10480, end: 0x104AF, name: "Osmanya" },
  { start: 0x10800, end: 0x1083F, name: "Cypriot Syllabary" },
  { start: 0x10900, end: 0x1091F, name: "Phoenician" },
  { start: 0x10920, end: 0x1093F, name: "Lydian" },
  { start: 0x12000, end: 0x123FF, name: "Cuneiform" },
  { start: 0x12400, end: 0x1247F, name: "Cuneiform Numbers and Punctuation" },
  { start: 0x13000, end: 0x1342F, name: "Egyptian Hieroglyphs" },
  { start: 0x1D000, end: 0x1D0FF, name: "Byzantine Musical Symbols" },
  { start: 0x1D100, end: 0x1D1FF, name: "Musical Symbols" },
  { start: 0x1D200, end: 0x1D24F, name: "Ancient Greek Musical Notation" },
  { start: 0x1D400, end: 0x1D7FF, name: "Mathematical Alphanumeric Symbols" },
  { start: 0x1F000, end: 0x1F02F, name: "Mahjong Tiles" },
  { start: 0x1F030, end: 0x1F09F, name: "Domino Tiles" },
  { start: 0x1F0A0, end: 0x1F0FF, name: "Playing Cards" },
  { start: 0x1F100, end: 0x1F1FF, name: "Enclosed Alphanumeric Supplement" },
  { start: 0x1F200, end: 0x1F2FF, name: "Enclosed Ideographic Supplement" },
  { start: 0x1F300, end: 0x1F5FF, name: "Miscellaneous Symbols and Pictographs" },
  { start: 0x1F600, end: 0x1F64F, name: "Emoticons" },
  { start: 0x1F680, end: 0x1F6FF, name: "Transport and Map Symbols" },
  { start: 0x1F700, end: 0x1F77F, name: "Alchemical Symbols" },
  { start: 0x1F780, end: 0x1F7FF, name: "Geometric Shapes Extended" },
  { start: 0x1F800, end: 0x1F8FF, name: "Supplemental Arrows-C" },
  { start: 0x1F900, end: 0x1F9FF, name: "Supplemental Symbols and Pictographs" },
  { start: 0x1FA00, end: 0x1FA6F, name: "Chess Symbols" },
  { start: 0x1FA70, end: 0x1FAFF, name: "Symbols and Pictographs Extended-A" },
];

/**
 * Identify block name and version for any codepoint
 */
export function getCodepointInfo(codePoint: number): UnicodeCharacterInfo {
  const hex = codePoint.toString(16).toUpperCase().padStart(4, '0');
  const dec = codePoint;
  const htmlEntity = `&#${dec};`;
  let char = '';
  try {
    char = String.fromCodePoint(codePoint);
  } catch {
    char = '';
  }

  // Check legacy pre-Unicode & substitute systems first
  const leg = LEGACY_SYSTEMS_AND_SUBSTITUTES.find((l) => l.codePoint === codePoint);
  if (leg) {
    return {
      char: leg.char,
      codePoint,
      hex: `U+${hex}`,
      dec,
      htmlEntity,
      block: leg.system,
      version: leg.system,
      system: leg.system,
      notes: leg.notes,
    };
  }

  // Check if deprecated
  const dep = DEPRECATED_UNICODE_CHARS.find((c) => c.codePoint === codePoint);
  if (dep) {
    return {
      char,
      codePoint,
      hex: `U+${hex}`,
      dec,
      htmlEntity,
      block: "Deprecated Characters",
      version: `Unicode ${dep.version} (Deprecated)`,
      isDeprecated: true,
      system: "Deprecated Unicode Standard",
      notes: dep.reason,
    };
  }

  // Check if latest
  const lat = LATEST_UNICODE_CHARS.find((c) => c.codePoint === codePoint);
  if (lat) {
    return {
      char,
      codePoint,
      hex: `U+${hex}`,
      dec,
      htmlEntity,
      block: lat.block,
      version: `Unicode ${lat.version}`,
      system: `Unicode ${lat.version}`,
      notes: lat.name,
    };
  }

  // Check ranges
  for (const r of ALL_UNICODE_RANGES) {
    if (codePoint >= r.start && codePoint <= r.end) {
      return {
        char,
        codePoint,
        hex: `U+${hex}`,
        dec,
        htmlEntity,
        block: r.name,
        version: r.isCJK ? "CJK Standard" : r.isPUA ? "Private Use Area" : codePoint > 0x1F900 ? "Unicode 13.0 - 18.0" : "Unicode Standard",
        system: r.isPUA ? "Private Use (PUA)" : r.isCJK ? "Unicode CJK" : "Unicode Standard",
      };
    }
  }

  return {
    char,
    codePoint,
    hex: `U+${hex}`,
    dec,
    htmlEntity,
    block: "Universal Codepoint",
    version: "Unicode 18.0 Draft",
    system: "Unicode Standard",
  };
}

/**
 * Generate N random unicode characters with optional visual styles
 */
export function generateRandomUnicode(
  count: number = 1,
  options: UnicodeGeneratorOptions = {
    includeCJK: true,
    includePrivateUse: true,
    includeDeprecated: true,
    includeLatest16: true,
    includeLegacySystems: true,
    includeSubstitutes: true,
    includeEbcdic: true,
    fullRandomMode: false,
    randomColors: false,
    randomSizes: false,
    randomFonts: false,
    fontSizeBase: 44,
  }
): UnicodeCharacterInfo[] {
  const safeCount = Math.max(1, Math.min(1000, count || 1));
  const results: UnicodeCharacterInfo[] = [];

  // Build pool of legacy systems and substitutes
  const activeLegacyList = LEGACY_SYSTEMS_AND_SUBSTITUTES.filter((item) => {
    if (!options.includeLegacySystems && (item.system.includes("DOS CP437") || item.system.includes("PETSCII") || item.system.includes("Mac OS") || item.system.includes("Teletext") || item.system.includes("JIS"))) {
      return false;
    }
    if (!options.includeSubstitutes && (item.system.includes("Substitute") || item.system.includes("Control Pictures"))) {
      return false;
    }
    if (!options.includeEbcdic && (item.system.includes("EBCDIC") || item.system.includes("Baudot"))) {
      return false;
    }
    return true;
  });

  // Build active ranges pool
  const activeRanges = ALL_UNICODE_RANGES.filter((r) => {
    if (!options.includeCJK && r.isCJK) return false;
    if (!options.includePrivateUse && r.isPUA) return false;
    return true;
  });

  // Calculate total weights
  const rangeWeights: number[] = [];
  let totalSpan = 0;
  for (const r of activeRanges) {
    const span = Math.max(1, r.end - r.start + 1);
    totalSpan += span;
    rangeWeights.push(totalSpan);
  }

  for (let i = 0; i < safeCount; i++) {
    let info: UnicodeCharacterInfo;

    // Mode A: Pure True Full-Random across all valid Unicode planes (0..16)
    if (options.fullRandomMode) {
      // Pick random plane 0..16 (Plane 0 BMP, Plane 1 SMP, Plane 2 SIP, Plane 14 SSP, Plane 15/16 PUA)
      const plane = Math.random() < 0.6 ? 0 : Math.random() < 0.85 ? 1 : Math.random() < 0.95 ? 2 : Math.floor(Math.random() * 17);
      let cp = (plane << 16) | Math.floor(Math.random() * 0x10000);

      // Exclude surrogate pair zones (0xD800..0xDFFF)
      if (cp >= 0xD800 && cp <= 0xDFFF) {
        cp = 0x0041 + Math.floor(Math.random() * 26);
      }
      // Exclude noncharacters (ends in FFFE/FFFF)
      if ((cp & 0xFFFE) === 0xFFFE || (cp >= 0xFDD0 && cp <= 0xFDEF)) {
        cp = 0x2728;
      }
      if (cp > 0x10FFFF) cp = 0x1F600;

      info = getCodepointInfo(cp);
    } else {
      // Mode B: Balanced distribution including legacy systems, CJK, and latest
      if (activeLegacyList.length > 0 && Math.random() < 0.16) {
        const leg = activeLegacyList[Math.floor(Math.random() * activeLegacyList.length)];
        info = {
          char: leg.char,
          codePoint: leg.codePoint,
          hex: `U+${leg.codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
          dec: leg.codePoint,
          htmlEntity: `&#${leg.codePoint};`,
          block: leg.system,
          version: leg.system,
          system: leg.system,
          notes: leg.notes,
        };
      } else if (options.includeDeprecated && Math.random() < 0.08) {
        const dep = DEPRECATED_UNICODE_CHARS[Math.floor(Math.random() * DEPRECATED_UNICODE_CHARS.length)];
        info = getCodepointInfo(dep.codePoint);
      } else if (options.includeLatest16 && Math.random() < 0.12) {
        const lat = LATEST_UNICODE_CHARS[Math.floor(Math.random() * LATEST_UNICODE_CHARS.length)];
        info = getCodepointInfo(lat.codePoint);
      } else if (options.includeCJK && Math.random() < 0.25) {
        // High-fidelity CJK ideograph sampling across BMP and Extension planes A-I
        const cjkRanges = [
          { start: 0x4e00, end: 0x9fff }, // CJK Unified Ideographs (20,992)
          { start: 0x3400, end: 0x4dbf }, // CJK Extension A (6,592)
          { start: 0x20000, end: 0x2a6df }, // CJK Extension B (42,720)
          { start: 0x2a700, end: 0x2b73f }, // CJK Extension C (4,154)
          { start: 0x2b740, end: 0x2b81f }, // CJK Extension D (222)
          { start: 0x2b820, end: 0x2ceaf }, // CJK Extension E (5,762)
          { start: 0x2ceb0, end: 0x2ebef }, // CJK Extension F (7,473)
          { start: 0x30000, end: 0x3134f }, // CJK Extension G (4,939)
          { start: 0x31350, end: 0x323af }, // CJK Extension H (4,192)
          { start: 0x2ebf0, end: 0x2ee5d }, // CJK Extension I (622)
          { start: 0xac00, end: 0xd7af }, // Hangul Syllables (11,172)
          { start: 0x3040, end: 0x309f }, // Hiragana
          { start: 0x30a0, end: 0x30ff }, // Katakana
        ];
        const r = cjkRanges[Math.floor(Math.random() * cjkRanges.length)];
        const cp = Math.floor(r.start + Math.random() * (r.end - r.start + 1));
        info = getCodepointInfo(cp);
      } else if (options.includePrivateUse && Math.random() < 0.15) {
        // High-fidelity Private Use Area (PUA) sampling: BMP PUA, Plane 15, Plane 16
        const puaPlanes = [
          { start: 0xe000, end: 0xf8ff }, // BMP PUA (6,400)
          { start: 0xf0000, end: 0xffffd }, // Supplementary PUA-A (65,534)
          { start: 0x100000, end: 0x10fffd }, // Supplementary PUA-B (65,534)
        ];
        const p = puaPlanes[Math.floor(Math.random() * puaPlanes.length)];
        const cp = Math.floor(p.start + Math.random() * (p.end - p.start + 1));
        info = getCodepointInfo(cp);
      } else {
        const r = Math.random() * totalSpan;
        let selectedIdx = 0;
        for (let j = 0; j < rangeWeights.length; j++) {
          if (r <= rangeWeights[j]) {
            selectedIdx = j;
            break;
          }
        }
        const range = activeRanges[selectedIdx] || activeRanges[0];
        let cp = Math.floor(range.start + Math.random() * (range.end - range.start + 1));
        if (cp >= 0xD800 && cp <= 0xDFFF) cp = 0x2728;
        if ((cp & 0xFFFE) === 0xFFFE || (cp >= 0xFDD0 && cp <= 0xFDEF)) cp = 0x2728;
        info = getCodepointInfo(cp);
      }
    }

    // Detect if this character is an emoji
    const isEmoji = isEmojiChar(info.char, info.codePoint);
    info.isEmoji = isEmoji;

    // 1. Random Colors (applied to text characters)
    if (options.randomColors) {
      if (Math.random() < 0.85 || count === 1) {
        info.color = VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
      }
    }

    // 1b. Emojis have random colors too! (via CSS hue-rotate, saturation, glow filters)
    const shouldColorEmoji = options.randomEmojiColors ?? options.randomColors ?? true;
    if (isEmoji && shouldColorEmoji) {
      if (Math.random() < 0.90 || count === 1) {
        const emojiStyle = getRandomEmojiColorStyle();
        info.emojiFilter = emojiStyle.filter;
        info.emojiColorName = emojiStyle.name;
        info.emojiHex = emojiStyle.hex;
        info.color = emojiStyle.hex;
      }
    }

    // 2. Random Sizes without limit (applied to random characters at times)
    if (options.randomSizes) {
      if (Math.random() < 0.85 || count === 1) {
        // Any size without limits: varying from compact to monumental
        const roll = Math.random();
        let sizeVal: number;
        if (roll < 0.30) {
          // Moderate sizes: 22px - 60px
          sizeVal = Math.floor(22 + Math.random() * 39);
        } else if (roll < 0.60) {
          // Large sizes: 65px - 160px
          sizeVal = Math.floor(65 + Math.random() * 96);
        } else if (roll < 0.85) {
          // Huge sizes: 170px - 380px
          sizeVal = Math.floor(170 + Math.random() * 211);
        } else {
          // Monumental sizes without limits: 400px - 1400px+
          sizeVal = Math.floor(400 + Math.random() * 1000);
        }
        info.fontSize = `${sizeVal}px`;
      }
    }

    // 3. Random Google Fonts (applied to random characters at times)
    if (options.randomFonts) {
      if (Math.random() < 0.85 || count === 1) {
        // Pick random font out of Google fonts (plus curated fonts)
        const useGf = Math.random() < 0.85;
        if (useGf && GOOGLE_FONTS_CATALOG.length > 0) {
          const font = GOOGLE_FONTS_CATALOG[Math.floor(Math.random() * GOOGLE_FONTS_CATALOG.length)];
          loadGoogleFont(font.name);
          info.fontFamily = `"${font.name}", ${font.category}`;
          info.googleFont = font.name;
        } else {
          const sysFont = FONT_FAMILIES[Math.floor(Math.random() * FONT_FAMILIES.length)];
          info.fontFamily = sysFont;
          info.googleFont = sysFont.replace(/['",]/g, '').split(' ')[0];
        }
      }
    }

    // 4. Random Directions: Every unicode character facing a random direction
    if (options.randomDirections) {
      const mode = options.directionMode || 'all';
      if (mode === '360') {
        const deg = Math.floor(Math.random() * 360);
        info.transform = `rotate(${deg}deg)`;
        info.directionNote = `${deg}° Rotation`;
      } else if (mode === 'orthogonal') {
        const angles = [
          { deg: 0, label: '0° Upright' },
          { deg: 90, label: '90° East' },
          { deg: 180, label: '180° South (Inverted)' },
          { deg: 270, label: '270° West' },
        ];
        const chosen = angles[Math.floor(Math.random() * angles.length)];
        info.transform = `rotate(${chosen.deg}deg)`;
        info.directionNote = chosen.label;
      } else if (mode === 'flip') {
        const flips = [
          { transform: 'scaleX(-1)', label: 'Horizontal Mirror' },
          { transform: 'scaleY(-1)', label: 'Vertical Inverted' },
          { transform: 'scale(-1, -1)', label: 'Dual Flip' },
          { transform: 'rotate(90deg) scaleX(-1)', label: 'Quarter Turn Mirror' },
          { transform: 'rotate(270deg) scaleX(-1)', label: 'Three-Quarter Mirror' },
        ];
        const chosen = flips[Math.floor(Math.random() * flips.length)];
        info.transform = chosen.transform;
        info.directionNote = chosen.label;
      } else {
        // 'all': Omnidirectional freedom with random angles (0°-359°) and optional mirror reflections
        const deg = Math.floor(Math.random() * 360);
        const flipX = Math.random() < 0.35;
        const flipY = Math.random() < 0.25;
        let trans = `rotate(${deg}deg)`;
        let desc = `${deg}° Direction`;
        if (flipX && flipY) {
          trans += ' scale(-1, -1)';
          desc += ' + Dual Flip';
        } else if (flipX) {
          trans += ' scaleX(-1)';
          desc += ' + Mirror';
        } else if (flipY) {
          trans += ' scaleY(-1)';
          desc += ' + Flip';
        }
        info.transform = trans;
        info.directionNote = desc;
      }
    }

    results.push(info);
  }

  return results;
}
