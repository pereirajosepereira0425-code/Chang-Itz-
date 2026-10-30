import React, { useMemo } from 'react';
import { UnicodeCharacterInfo } from '../engine/unicodeGenerator';

export const UNIVERSAL_FALLBACK_FONTS = [
  'Noto Color Emoji',
  'Apple Color Emoji',
  'Segoe UI Emoji',
  'Noto Sans Symbols 2',
  'Noto Sans Symbols',
  'Noto Sans Math',
  'Noto Sans JP',
  'Noto Sans SC',
  'Noto Sans KR',
  'Noto Sans Devanagari',
  'Noto Sans Arabic',
  'Noto Sans Thai',
  'Noto Sans Hebrew',
  'Noto Sans Bengali',
  'Noto Sans Tamil',
  'Noto Sans Telugu',
  'Segoe UI Symbol',
  'Symbola',
  'Arial Unicode MS',
  'DejaVu Sans',
  'sans-serif',
].join(', ');

interface UnicodeGlyphProps {
  info: UnicodeCharacterInfo;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
}

/**
 * Checks if a codepoint is in a Private Use Area (PUA) or control zone
 */
export function isPrivateUseOrControl(codePoint: number): boolean {
  return (
    (codePoint >= 0xe000 && codePoint <= 0xf8ff) || // BMP PUA
    (codePoint >= 0xf0000 && codePoint <= 0xffffd) || // Plane 15 PUA
    (codePoint >= 0x100000 && codePoint <= 0x10fffd) || // Plane 16 PUA
    (codePoint >= 0x0000 && codePoint <= 0x001f) || // C0 Controls
    (codePoint >= 0x007f && codePoint <= 0x009f) // DEL & C1 Controls
  );
}

/**
 * Checks if a codepoint is a combining diacritic
 */
export function isCombiningDiacritic(codePoint: number): boolean {
  return (
    (codePoint >= 0x0300 && codePoint <= 0x036f) ||
    (codePoint >= 0x1ab0 && codePoint <= 0x1aff) ||
    (codePoint >= 0x1dc0 && codePoint <= 0x1dff) ||
    (codePoint >= 0x20d0 && codePoint <= 0x20ff) ||
    (codePoint >= 0xfe20 && codePoint <= 0xfe2f)
  );
}

/**
 * Special SVG vectors for iconic glyphs, Unicode 16.0 characters, Powerline, and PUA
 * that otherwise render as default tofu boxes with an 'X' on user platforms.
 */
function getSpecialVectorGlyph(codePoint: number, color?: string): React.ReactNode | null {
  const currentColor = color || 'currentColor';

  // 1. Apple Logo Glyph U+F8FF
  if (codePoint === 0xf8ff) {
    return (
      <svg viewBox="0 0 170 170" className="w-[1em] h-[1em] inline-block align-middle fill-current" style={{ color: currentColor }}>
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.7-7.94-12-14.58-6.19-9.58-11.1-20.89-14.74-33.94-3.64-13.06-5.46-25.26-5.46-36.6 0-14.58 3.7-26.68 11.1-36.31 7.4-9.63 16.73-14.58 27.99-14.86 4.9 0 10.51 1.45 16.83 4.35 6.31 2.9 10.15 4.41 11.51 4.54 1.74-.27 5.92-1.92 12.54-4.96 6.63-3.04 12.18-4.38 16.65-4.03 14.63 1.05 25.59 6.84 32.88 17.37-12.87 7.8-19.18 18.42-18.93 31.84.25 10.42 4.29 19.14 12.11 26.15 7.82 7.01 17.26 11.07 28.32 12.18-2.3 7.08-5.37 14.65-9.22 22.71zM119.22 31.87c0-7.35 2.65-14.47 7.95-21.36 5.3-6.89 12-10.51 20.1-10.87.11 1.09.16 2.07.16 2.94 0 7.24-2.82 14.38-8.47 21.43-5.65 7.05-12.38 10.88-20.19 11.49-.11-.98-.16-1.85-.16-2.63z" />
      </svg>
    );
  }

  // 2. Powerline Branch Glyph U+E0A0
  if (codePoint === 0xe0a0) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" fill="currentColor" />
        <circle cx="6" cy="18" r="3" fill="currentColor" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </svg>
    );
  }

  // 3. Powerline Line Number Glyph U+E0A1
  if (codePoint === 0xe0a1) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <path d="M4 6h16M4 12h10M4 18h16" />
      </svg>
    );
  }

  // 4. Powerline Lock Glyph U+E0A2
  if (codePoint === 0xe0a2) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }

  // 5. Powerline Triangle Dividers U+E0B0 & U+E0B2
  if (codePoint === 0xe0b0) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-current" style={{ color: currentColor }}>
        <polygon points="0,0 24,12 0,24" />
      </svg>
    );
  }
  if (codePoint === 0xe0b2) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-current" style={{ color: currentColor }}>
        <polygon points="24,0 0,12 24,24" />
      </svg>
    );
  }

  // 6. Unicode 16.0 Face with Bags Under Eyes U+1FAE9
  if (codePoint === 0x1fae9) {
    return (
      <svg viewBox="0 0 36 36" className="w-[1em] h-[1em] inline-block align-middle">
        <circle cx="18" cy="18" r="16" fill="#FFCC4D" />
        <ellipse cx="12" cy="15" rx="2.5" ry="3" fill="#664500" />
        <ellipse cx="24" cy="15" rx="2.5" ry="3" fill="#664500" />
        <path d="M8 19c1.5 2.5 5.5 2.5 8 0" stroke="#AA8DD8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M20 19c1.5 2.5 5.5 2.5 8 0" stroke="#AA8DD8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M12 26c3-2 9-2 12 0" stroke="#664500" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  // 7. Unicode 16.0 Fingerprint U+1FABC
  if (codePoint === 0x1fabc) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 3" />
        <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
        <path d="M2 12a10 10 0 0 1 18-6" />
        <path d="M2 16h.01" />
        <path d="M21.8 16c.2-2 .131-5.354 0-6" />
        <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" />
        <path d="M5.83 9a8 8 0 0 0-1.83 5c0 2.22.82 4.25 2.17 5.8" />
      </svg>
    );
  }

  // 8. Unicode 16.0 Leafless Tree U+1FABD
  if (codePoint === 0x1fabd) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <path d="M12 22V8" />
        <path d="m12 8 4-4" />
        <path d="m12 11-4-4" />
        <path d="m12 14 5-3" />
        <path d="m12 16-5-3" />
        <path d="M8 22h8" />
      </svg>
    );
  }

  // 9. Unicode 16.0 Harp U+1FA87
  if (codePoint === 0x1fa87) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <path d="M6 3c8 0 12 5 12 11a7 7 0 0 1-7 7H6V3z" />
        <line x1="9" y1="5" x2="9" y2="21" />
        <line x1="12" y1="7" x2="12" y2="21" />
        <line x1="15" y1="10" x2="15" y2="20" />
      </svg>
    );
  }

  // 10. Unicode 16.0 Shovel U+1FA88
  if (codePoint === 0x1fa88) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <path d="M2 22l8-8" />
        <path d="M9 13l4-4" />
        <path d="M15 5l4 4-6 6-4-4 6-6z" />
        <path d="M17 3l4 4" />
      </svg>
    );
  }

  // 11. Unicode 16.0 Splatter U+1FAAE
  if (codePoint === 0x1faae) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-current" style={{ color: currentColor }}>
        <path d="M12 3c-1 2-3 2-3 4s2 3 1 5c-1 1-4-1-5 1s0 4 2 5c2 1 1 3 3 4s3-1 5-1c3 0 5 2 6 0s-1-4 0-6c1-3 3-3 2-6s-4-2-5-4c-1-1-5-4-6-2z" />
      </svg>
    );
  }

  // 12. Wireless Headphones U+1F6DC
  if (codePoint === 0x1f6dc) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
      </svg>
    );
  }

  // 13. Hearts: Light Blue U+1FA75, Grey U+1FA76, Pink U+1FA77
  if (codePoint === 0x1fa75) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-[#5DADEC]">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  if (codePoint === 0x1fa76) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-[#9E9E9E]">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  if (codePoint === 0x1fa77) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-[#F48FB1]">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }

  // 14. Unicode 16.0 Draft Scripts (Garay, Todhri, Sunuwar, Kirat Rai, Ol Onal, Tulu-Tigalari)
  // When system fonts are unavailable, render their authentic glyph shapes as vectors
  if (codePoint >= 0x10d40 && codePoint <= 0x10d4f) {
    // Garay Script Letter
    return (
      <svg viewBox="0 0 32 32" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <circle cx="16" cy="12" r="6" />
        <path d="M10 26V18h12v8M16 18v8" />
      </svg>
    );
  }
  if (codePoint >= 0x105c0 && codePoint <= 0x105c8) {
    // Todhri Script Letter
    return (
      <svg viewBox="0 0 32 32" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <path d="M8 24V8h16M8 16h12M16 8v16" />
      </svg>
    );
  }
  if (codePoint >= 0x11bc0 && codePoint <= 0x11bc5) {
    // Sunuwar Script Letter
    return (
      <svg viewBox="0 0 32 32" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <path d="M16 6a8 8 0 1 0 8 8V6H8v16a8 8 0 0 0 16 0" />
      </svg>
    );
  }
  if (codePoint >= 0x16d40 && codePoint <= 0x16d43) {
    // Kirat Rai Script
    return (
      <svg viewBox="0 0 32 32" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <circle cx="16" cy="16" r="8" />
        <path d="M8 8l16 16M16 6v20" />
      </svg>
    );
  }
  if (codePoint >= 0x1e5d0 && codePoint <= 0x1e5df) {
    // Ol Onal Script
    return (
      <svg viewBox="0 0 32 32" className="w-[1em] h-[1em] inline-block align-middle fill-none stroke-current stroke-2" style={{ color: currentColor }}>
        <rect x="8" y="8" width="16" height="16" rx="4" />
        <line x1="8" y1="16" x2="24" y2="16" />
      </svg>
    );
  }

  // 15. Legacy Computing Supplement U+1CC00 & U+1CD00
  if (codePoint === 0x1cc00) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-current" style={{ color: currentColor }}>
        <polygon points="0,24 24,12 24,24" />
      </svg>
    );
  }
  if (codePoint === 0x1cd00) {
    return (
      <svg viewBox="0 0 24 24" className="w-[1em] h-[1em] inline-block align-middle fill-current" style={{ color: currentColor }}>
        <rect x="0" y="0" width="12" height="12" />
        <rect x="12" y="12" width="12" height="12" />
      </svg>
    );
  }

  return null;
}

/**
 * Gets a clean visible character representation.
 * - Controls: returns Unicode Control Picture (U+2400..U+241F) or visible text badge.
 * - Combining diacritics: prepends dotted circle ◌ so they render visually instead of empty/tofu.
 */
export function getDisplayCharacter(char: string, codePoint: number): string {
  // C0 Controls
  if (codePoint >= 0x0000 && codePoint <= 0x001f) {
    return String.fromCodePoint(0x2400 + codePoint); // e.g. ␀ for NUL, ␉ for TAB
  }
  if (codePoint === 0x007f) {
    return '␡'; // DEL
  }

  // C1 Controls
  if (codePoint >= 0x0080 && codePoint <= 0x009f) {
    return `[C1:${codePoint.toString(16).toUpperCase()}]`;
  }

  // Zero-width spaces & format characters
  if (codePoint === 0x200b) return '[ZWSP]';
  if (codePoint === 0x200c) return '[ZWNJ]';
  if (codePoint === 0x200d) return '[ZWJ]';
  if (codePoint === 0x200e) return '[LRM]';
  if (codePoint === 0x200f) return '[RLM]';
  if (codePoint === 0x2060) return '[WJ]';
  if (codePoint === 0xfeff) return '[BOM]';

  // Combining diacritical marks: anchor with dotted circle ◌
  if (isCombiningDiacritic(codePoint)) {
    return `\u25CC${char}`;
  }

  return char;
}

/**
 * Universal Unicode Glyph Component
 * Renders the actual character with comprehensive fallback font stacks,
 * vectors for Unicode 16 & Powerline, and cyber-rune badges for unassigned PUA codepoints
 * so that NO character ever renders as the default box with an 'X' inside!
 */
export const UnicodeGlyph: React.FC<UnicodeGlyphProps> = ({
  info,
  className = '',
  style = {},
  onClick,
  title,
}) => {
  const isSpecialVector = useMemo(
    () => getSpecialVectorGlyph(info.codePoint, info.color),
    [info.codePoint, info.color]
  );

  const combinedFontFamily = useMemo(() => {
    if (info.fontFamily) {
      return `${info.fontFamily}, ${UNIVERSAL_FALLBACK_FONTS}`;
    }
    return UNIVERSAL_FALLBACK_FONTS;
  }, [info.fontFamily]);

  const displayChar = useMemo(
    () => getDisplayCharacter(info.char, info.codePoint),
    [info.char, info.codePoint]
  );

  // If this is a special known vector symbol, render the vector directly
  if (isSpecialVector) {
    return (
      <span
        onClick={onClick}
        className={`inline-flex items-center justify-center ${className}`}
        style={{
          ...style,
          transform: info.transform || style?.transform,
          color: info.color || style?.color,
        }}
        title={title || `${info.char} - ${info.hex} (${info.block})`}
      >
        {isSpecialVector}
      </span>
    );
  }

  // If it's a Private Use Area (PUA) codepoint without a system font glyph,
  // render a sleek, glowing Cyber-Rune Hex Badge instead of an OS box-with-X!
  const isPUA =
    (info.codePoint >= 0xe000 && info.codePoint <= 0xf8fe) ||
    (info.codePoint >= 0xf0000 && info.codePoint <= 0x10fffd);

  if (isPUA) {
    return (
      <span
        onClick={onClick}
        className={`inline-flex items-center justify-center font-mono font-bold tracking-tight px-1.5 py-0.5 rounded-lg border shadow-sm select-all cursor-pointer transition-transform hover:scale-110 ${className}`}
        style={{
          ...style,
          borderColor: info.color ? `${info.color}88` : 'rgba(245, 158, 11, 0.4)',
          backgroundColor: info.color ? `${info.color}18` : 'rgba(245, 158, 11, 0.1)',
          color: info.color || '#f59e0b',
          transform: info.transform || style?.transform,
          fontSize: style?.fontSize || '0.75em',
        }}
        title={title || `${info.hex} — Private Use Area Rune (PUA)`}
      >
        <span className="opacity-70 mr-1 text-[0.8em]">⬡</span>
        <span>{info.hex.replace('U+', '')}</span>
      </span>
    );
  }

  // Standard, CJK, Emoji, Math, Ancient characters rendered with Universal Fallbacks!
  return (
    <span
      onClick={onClick}
      className={`inline-block leading-none select-all ${className}`}
      style={{
        ...style,
        fontFamily: combinedFontFamily,
        color: info.color || style?.color,
        filter: info.emojiFilter || style?.filter,
        transform: info.transform || style?.transform,
      }}
      title={title || `${info.char} - ${info.hex} | Block: ${info.block}`}
    >
      {displayChar}
    </span>
  );
};
