/**
 * Comprehensive Google Fonts Directory & Dynamic Loader
 * Connects directly to https://fonts.google.com/ API
 */

export interface GoogleFontMeta {
  name: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace' | 'symbols';
  sampleText?: string;
  popularRank: number;
}

// 120+ Curated top Google Fonts across all major categories
export const GOOGLE_FONTS_CATALOG: GoogleFontMeta[] = [
  // --- DISPLAY & ACCENT ---
  { name: 'Bebas Neue', category: 'display', popularRank: 1 },
  { name: 'Lobster', category: 'display', popularRank: 2 },
  { name: 'Righteous', category: 'display', popularRank: 3 },
  { name: 'Bangers', category: 'display', popularRank: 4 },
  { name: 'Abril Fatface', category: 'display', popularRank: 5 },
  { name: 'Anton', category: 'display', popularRank: 6 },
  { name: 'Comfortaa', category: 'display', popularRank: 7 },
  { name: 'Monoton', category: 'display', popularRank: 8 },
  { name: 'Creepster', category: 'display', popularRank: 9 },
  { name: 'Rye', category: 'display', popularRank: 10 },
  { name: 'Faster One', category: 'display', popularRank: 11 },
  { name: 'Megrim', category: 'display', popularRank: 12 },
  { name: 'Bungee', category: 'display', popularRank: 13 },
  { name: 'Bungee Shade', category: 'display', popularRank: 14 },
  { name: 'Fredericka the Great', category: 'display', popularRank: 15 },
  { name: 'Shrikhand', category: 'display', popularRank: 16 },
  { name: 'Ultra', category: 'display', popularRank: 17 },
  { name: 'Alfa Slab One', category: 'display', popularRank: 18 },
  { name: 'Black Ops One', category: 'display', popularRank: 19 },
  { name: 'Sigmar One', category: 'display', popularRank: 20 },
  { name: 'Press Start 2P', category: 'display', popularRank: 21 },
  { name: 'Silkscreen', category: 'display', popularRank: 22 },
  { name: 'Audiowide', category: 'display', popularRank: 23 },
  { name: 'Orbitron', category: 'display', popularRank: 24 },
  { name: 'Russo One', category: 'display', popularRank: 25 },
  { name: 'Permanent Marker', category: 'display', popularRank: 26 },
  { name: 'Special Elite', category: 'display', popularRank: 27 },
  { name: 'Rubik Glitch', category: 'display', popularRank: 28 },
  { name: 'Honk', category: 'display', popularRank: 29 },
  { name: 'Pixelify Sans', category: 'display', popularRank: 30 },
  { name: 'Foldit', category: 'display', popularRank: 31 },

  // --- SANS-SERIF ---
  { name: 'Roboto', category: 'sans-serif', popularRank: 1 },
  { name: 'Open Sans', category: 'sans-serif', popularRank: 2 },
  { name: 'Montserrat', category: 'sans-serif', popularRank: 3 },
  { name: 'Poppins', category: 'sans-serif', popularRank: 4 },
  { name: 'Lato', category: 'sans-serif', popularRank: 5 },
  { name: 'Inter', category: 'sans-serif', popularRank: 6 },
  { name: 'Oswald', category: 'sans-serif', popularRank: 7 },
  { name: 'Raleway', category: 'sans-serif', popularRank: 8 },
  { name: 'Nunito', category: 'sans-serif', popularRank: 9 },
  { name: 'Rubik', category: 'sans-serif', popularRank: 10 },
  { name: 'Ubuntu', category: 'sans-serif', popularRank: 11 },
  { name: 'Work Sans', category: 'sans-serif', popularRank: 12 },
  { name: 'DM Sans', category: 'sans-serif', popularRank: 13 },
  { name: 'Plus Jakarta Sans', category: 'sans-serif', popularRank: 14 },
  { name: 'Outfit', category: 'sans-serif', popularRank: 15 },
  { name: 'Quicksand', category: 'sans-serif', popularRank: 16 },
  { name: 'Barlow', category: 'sans-serif', popularRank: 17 },
  { name: 'Space Grotesk', category: 'sans-serif', popularRank: 18 },
  { name: 'Manrope', category: 'sans-serif', popularRank: 19 },
  { name: 'Kanit', category: 'sans-serif', popularRank: 20 },
  { name: 'Fira Sans', category: 'sans-serif', popularRank: 21 },
  { name: 'Exo 2', category: 'sans-serif', popularRank: 22 },
  { name: 'Karla', category: 'sans-serif', popularRank: 23 },
  { name: 'Archivo', category: 'sans-serif', popularRank: 24 },
  { name: 'Cabin', category: 'sans-serif', popularRank: 25 },

  // --- SERIF ---
  { name: 'Playfair Display', category: 'serif', popularRank: 1 },
  { name: 'Merriweather', category: 'serif', popularRank: 2 },
  { name: 'Lora', category: 'serif', popularRank: 3 },
  { name: 'PT Serif', category: 'serif', popularRank: 4 },
  { name: 'Cinzel', category: 'serif', popularRank: 5 },
  { name: 'Cormorant Garamond', category: 'serif', popularRank: 6 },
  { name: 'Libre Baskerville', category: 'serif', popularRank: 7 },
  { name: 'EB Garamond', category: 'serif', popularRank: 8 },
  { name: 'Bodoni Moda', category: 'serif', popularRank: 9 },
  { name: 'Crimson Text', category: 'serif', popularRank: 10 },
  { name: 'Bitter', category: 'serif', popularRank: 11 },
  { name: 'Spectral', category: 'serif', popularRank: 12 },
  { name: 'Arvo', category: 'serif', popularRank: 13 },
  { name: 'Cardo', category: 'serif', popularRank: 14 },
  { name: 'DM Serif Display', category: 'serif', popularRank: 15 },
  { name: 'Prata', category: 'serif', popularRank: 16 },
  { name: 'Castoro', category: 'serif', popularRank: 17 },
  { name: 'Besley', category: 'serif', popularRank: 18 },

  // --- HANDWRITING & SCRIPT ---
  { name: 'Pacifico', category: 'handwriting', popularRank: 1 },
  { name: 'Dancing Script', category: 'handwriting', popularRank: 2 },
  { name: 'Caveat', category: 'handwriting', popularRank: 3 },
  { name: 'Shadows Into Light', category: 'handwriting', popularRank: 4 },
  { name: 'Indie Flower', category: 'handwriting', popularRank: 5 },
  { name: 'Kalam', category: 'handwriting', popularRank: 6 },
  { name: 'Architects Daughter', category: 'handwriting', popularRank: 7 },
  { name: 'Great Vibes', category: 'handwriting', popularRank: 8 },
  { name: 'Sacramento', category: 'handwriting', popularRank: 9 },
  { name: 'Yellowtail', category: 'handwriting', popularRank: 10 },
  { name: 'Satisfy', category: 'handwriting', popularRank: 11 },
  { name: 'Kaushan Script', category: 'handwriting', popularRank: 12 },
  { name: 'Marck Script', category: 'handwriting', popularRank: 13 },
  { name: 'Courgette', category: 'handwriting', popularRank: 14 },
  { name: 'Tangerine', category: 'handwriting', popularRank: 15 },
  { name: 'Parisienne', category: 'handwriting', popularRank: 16 },
  { name: 'Alex Brush', category: 'handwriting', popularRank: 17 },
  { name: 'Homemade Apple', category: 'handwriting', popularRank: 18 },
  { name: 'Covered By Your Grace', category: 'handwriting', popularRank: 19 },
  { name: 'Gloria Hallelujah', category: 'handwriting', popularRank: 20 },

  // --- MONOSPACE ---
  { name: 'Space Mono', category: 'monospace', popularRank: 1 },
  { name: 'JetBrains Mono', category: 'monospace', popularRank: 2 },
  { name: 'Fira Code', category: 'monospace', popularRank: 3 },
  { name: 'Source Code Pro', category: 'monospace', popularRank: 4 },
  { name: 'Inconsolata', category: 'monospace', popularRank: 5 },
  { name: 'Roboto Mono', category: 'monospace', popularRank: 6 },
  { name: 'IBM Plex Mono', category: 'monospace', popularRank: 7 },
  { name: 'Courier Prime', category: 'monospace', popularRank: 8 },
  { name: 'VT323', category: 'monospace', popularRank: 9 },
  { name: 'Share Tech Mono', category: 'monospace', popularRank: 10 },
  { name: 'Anonymous Pro', category: 'monospace', popularRank: 11 },
  { name: 'Overpass Mono', category: 'monospace', popularRank: 12 },
  { name: 'DM Mono', category: 'monospace', popularRank: 13 },
  { name: 'Major Mono Display', category: 'monospace', popularRank: 14 },

  // --- SYMBOLS & INTERNATIONAL ---
  { name: 'Noto Sans', category: 'symbols', popularRank: 1 },
  { name: 'Noto Serif', category: 'symbols', popularRank: 2 },
  { name: 'Noto Sans Symbols', category: 'symbols', popularRank: 3 },
  { name: 'Noto Sans Symbols 2', category: 'symbols', popularRank: 4 },
  { name: 'Noto Sans Math', category: 'symbols', popularRank: 5 },
  { name: 'Noto Music', category: 'symbols', popularRank: 6 },
  { name: 'Noto Color Emoji', category: 'symbols', popularRank: 7 },
  { name: 'Noto Sans Runes', category: 'symbols', popularRank: 8 },
  { name: 'Noto Sans Gothic', category: 'symbols', popularRank: 9 },
];

// Set of already loaded font names to prevent duplicate tags
const loadedFontsSet = new Set<string>();

/**
 * Dynamically loads a Google Font by name using Google Fonts CSS2 API
 * Works for ANY font on https://fonts.google.com/
 */
export function loadGoogleFont(fontName: string): Promise<boolean> {
  const cleanName = fontName.trim().replace(/^['"]|['"]$/g, '');
  if (!cleanName || cleanName === 'monospace' || cleanName === 'serif' || cleanName === 'sans-serif') {
    return Promise.resolve(true);
  }

  if (typeof document === 'undefined') {
    return Promise.resolve(true);
  }

  const fontId = `gf-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  if (loadedFontsSet.has(cleanName) || document.getElementById(fontId)) {
    loadedFontsSet.add(cleanName);
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    try {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      // URL encode font name with + for spaces as required by Google Fonts
      const encoded = cleanName.replace(/\s+/g, '+');
      link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700;900&display=swap`;
      
      link.onload = () => {
        loadedFontsSet.add(cleanName);
        resolve(true);
      };
      link.onerror = () => {
        // Fallback without weights in case font only has regular
        link.href = `https://fonts.googleapis.com/css2?family=${encoded}&display=swap`;
        link.onload = () => {
          loadedFontsSet.add(cleanName);
          resolve(true);
        };
        link.onerror = () => {
          resolve(false);
        };
      };

      document.head.appendChild(link);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Preloads a batch of popular Google Fonts for instant switching
 */
export function preloadPopularGoogleFonts(count: number = 25): void {
  const popular = GOOGLE_FONTS_CATALOG.slice(0, count);
  popular.forEach((f) => loadGoogleFont(f.name));
}

/**
 * Returns a random Google Font name from the catalog
 */
export function getRandomGoogleFont(): string {
  const font = GOOGLE_FONTS_CATALOG[Math.floor(Math.random() * GOOGLE_FONTS_CATALOG.length)];
  loadGoogleFont(font.name);
  return `"${font.name}", ${font.category}`;
}

/**
 * Direct link to font on Google Fonts site
 */
export function getGoogleFontUrl(fontName: string): string {
  const clean = fontName.trim().replace(/^['"]|['"]$/g, '').split(',')[0].trim();
  const encoded = clean.replace(/\s+/g, '+');
  return `https://fonts.google.com/specimen/${encoded}`;
}
