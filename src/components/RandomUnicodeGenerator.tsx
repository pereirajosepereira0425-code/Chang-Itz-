import React, { useState, useEffect } from 'react';
import {
  generateRandomUnicode,
  UnicodeCharacterInfo,
  UnicodeGeneratorOptions,
} from '../engine/unicodeGenerator';
import { getGoogleFontUrl } from '../engine/googleFonts';
import { UnicodePhysicsPlayground } from './UnicodePhysicsPlayground';
import {
  Copy,
  Check,
  SlidersHorizontal,
  ArrowRight,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface RandomUnicodeGeneratorProps {
  onSendToConverter?: (text: string, formatId?: string) => void;
  onOpenMascotModal?: () => void;
}

export const RandomUnicodeGenerator: React.FC<RandomUnicodeGeneratorProps> = ({
  onSendToConverter,
  onOpenMascotModal,
}) => {
  const [howManyInput, setHowManyInput] = useState<string>('');
  const [characters, setCharacters] = useState<UnicodeCharacterInfo[]>([]);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectedChar, setSelectedChar] = useState<UnicodeCharacterInfo | null>(null);
  const [themeMode, setThemeMode] = useState<'perchance' | 'dark'>('perchance');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // Filter & Visual Randomization options:
  // Random Google Fonts and Random Sizes without limit applied to random characters at times
  const [options, setOptions] = useState<UnicodeGeneratorOptions>({
    includeCJK: true,
    includePrivateUse: true,
    includeDeprecated: true,
    includeLatest16: true,
    includeLegacySystems: true,
    includeSubstitutes: true,
    includeEbcdic: true,
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
    physicsEnabled: false,
  });

  // Generate on initial mount
  useEffect(() => {
    handleRandomize();
  }, []);

  const handleRandomize = () => {
    const parsed = parseInt(howManyInput.trim(), 10);
    const count = isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, 1000);
    const results = generateRandomUnicode(count, options);
    setCharacters(results);
    setSelectedChar(results[0] || null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRandomize();
    }
  };

  const toggleAllChaos = () => {
    const nextVal = !(options.randomColors && options.randomSizes && options.randomFonts && options.randomDirections);
    const newOpts: UnicodeGeneratorOptions = {
      ...options,
      randomColors: nextVal,
      randomSizes: nextVal,
      randomFonts: nextVal,
      randomDirections: nextVal,
      useGoogleFonts: true,
    };
    setOptions(newOpts);
    const parsed = parseInt(howManyInput.trim(), 10);
    const count = isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, 1000);
    const results = generateRandomUnicode(count, newOpts);
    setCharacters(results);
    setSelectedChar(results[0] || null);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const allRawText = characters.map((c) => c.char).join('');
  const allHtmlEntities = characters.map((c) => c.htmlEntity).join('');
  const allHexCodepoints = characters.map((c) => c.hex).join(' ');

  return (
    <div
      className={`w-full min-h-[85vh] transition-colors py-8 px-4 flex flex-col items-center font-sans ${
        themeMode === 'perchance' ? 'bg-[#fbfbfb] text-[#222222]' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Top Header Toolbar */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1">
            <span>🎲</span>
            <span>Unicode 18.0 Draft + CJK + PUA</span>
          </span>
          {onOpenMascotModal && (
            <button
              onClick={onOpenMascotModal}
              className="px-2.5 py-1 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>🦊</span>
              <span>Mascot</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setThemeMode(themeMode === 'perchance' ? 'dark' : 'perchance')}
            className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
              themeMode === 'perchance'
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 shadow-sm'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {themeMode === 'perchance' ? '🌙 Dark Mode' : '☀️ Perchance Clean'}
          </button>

          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className={`px-3 py-1 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
              showAdvancedSettings
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                : themeMode === 'perchance'
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Options</span>
          </button>
        </div>
      </div>

      {/* Main Perchance-Style Container (Expands naturally to fit any direction and size) */}
      <div className="w-full max-w-2xl sm:max-w-3xl mx-auto space-y-4 transition-all duration-300">
        {/* Title */}
        <div className="text-center space-y-1 mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Random Unicode Character Generator
          </h1>
          <p className={`text-sm ${themeMode === 'perchance' ? 'text-gray-500' : 'text-slate-400'}`}>
            Generates a random HTML unicode character with Google fonts & unlimited sizes applied to random characters.
          </p>
        </div>

        {/* Quick Style Randomization Bar */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
          <button
            type="button"
            onClick={() => {
              const newOpts = { ...options, randomColors: !options.randomColors };
              setOptions(newOpts);
              const count = parseInt(howManyInput.trim(), 10) || 1;
              setCharacters(generateRandomUnicode(count, newOpts));
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-all text-xs ${
              options.randomColors
                ? 'bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 text-white border-transparent shadow-sm'
                : themeMode === 'perchance'
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-sm">🎨</span>
            <span>{options.randomColors ? 'Random Colors (ON)' : 'Random Colors'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const newOpts = { ...options, randomSizes: !options.randomSizes };
              setOptions(newOpts);
              const count = parseInt(howManyInput.trim(), 10) || 1;
              setCharacters(generateRandomUnicode(count, newOpts));
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-all text-xs ${
              options.randomSizes
                ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                : themeMode === 'perchance'
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-sm">📏</span>
            <span>{options.randomSizes ? 'Unlimited Sizes (ON)' : 'Random Sizes'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const newOpts = { ...options, randomFonts: !options.randomFonts };
              setOptions(newOpts);
              const count = parseInt(howManyInput.trim(), 10) || 1;
              setCharacters(generateRandomUnicode(count, newOpts));
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-all text-xs ${
              options.randomFonts
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-sm'
                : themeMode === 'perchance'
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-sm">🔤</span>
            <span>{options.randomFonts ? 'Google Fonts (ON)' : 'Google Fonts'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const newOpts = { ...options, randomDirections: !options.randomDirections };
              setOptions(newOpts);
              const count = parseInt(howManyInput.trim(), 10) || 1;
              setCharacters(generateRandomUnicode(count, newOpts));
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-all text-xs ${
              options.randomDirections
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent shadow-sm'
                : themeMode === 'perchance'
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Make every character face a random direction"
          >
            <span className="text-sm">🧭</span>
            <span>{options.randomDirections ? 'Random Directions (ON)' : 'Random Directions'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOptions((prev) => ({ ...prev, physicsEnabled: !prev.physicsEnabled }));
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-all text-xs ${
              options.physicsEnabled
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-extrabold border-transparent shadow-md ring-2 ring-amber-400/50'
                : themeMode === 'perchance'
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Toggle interactive 2D physics, bouncing, and gravity for Unicode characters"
          >
            <span className="text-sm">🪐</span>
            <span>{options.physicsEnabled ? 'Physics Mode (ON)' : 'Character Physics'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const newOpts = { ...options, randomEmojiColors: !options.randomEmojiColors };
              setOptions(newOpts);
              const count = parseInt(howManyInput.trim(), 10) || 1;
              setCharacters(generateRandomUnicode(count, newOpts));
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-all text-xs ${
              options.randomEmojiColors
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white border-transparent shadow-sm'
                : themeMode === 'perchance'
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Make emojis have vibrant random colors via glowing CSS filters"
          >
            <span className="text-sm">🌈</span>
            <span>{options.randomEmojiColors ? 'Emoji Colors (ON)' : 'Emoji Colors'}</span>
          </button>

          <button
            type="button"
            onClick={toggleAllChaos}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-all text-xs ${
              options.randomColors && options.randomSizes && options.randomFonts && options.randomDirections
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md animate-pulse'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <span className="text-sm">✨</span>
            <span>
              {options.randomColors && options.randomSizes && options.randomFonts && options.randomDirections
                ? 'Chaos Mode (Active)'
                : 'Chaos Mode (All 4)'}
            </span>
          </button>
        </div>

        {/* Optional Advanced Settings Bar */}
        {showAdvancedSettings && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
              themeMode === 'perchance'
                ? 'bg-white border-gray-200 shadow-sm'
                : 'bg-slate-900/90 border-slate-800 text-slate-300'
            }`}
          >
            <div className="font-bold flex items-center justify-between pb-1 border-b border-gray-200/50">
              <span className="flex items-center gap-1">
                <span>⚙️</span>
                <span>Unicode 18.0 Draft, CJK & Historical Settings</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                1,114,112 Codepoint Pool
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-blue-600 dark:text-blue-400">
                <input
                  type="checkbox"
                  checked={options.fullRandomMode}
                  onChange={(e) => setOptions({ ...options, fullRandomMode: e.target.checked })}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                />
                <span>Pure Uniform Random (All 17 Planes 0..16)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-600 dark:text-emerald-400">
                <input
                  type="checkbox"
                  checked={options.includeCJK}
                  onChange={(e) => setOptions({ ...options, includeCJK: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
                />
                <span>Include CJK Ideographs (Ext A-I, Hangul, Kana)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-purple-600 dark:text-purple-400">
                <input
                  type="checkbox"
                  checked={options.includePrivateUse}
                  onChange={(e) => setOptions({ ...options, includePrivateUse: e.target.checked })}
                  className="rounded border-gray-300 text-purple-500 focus:ring-purple-400"
                />
                <span>Include Private Use Area (BMP + Planes 15/16)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-cyan-600 dark:text-cyan-400">
                <input
                  type="checkbox"
                  checked={options.includeLegacySystems}
                  onChange={(e) => setOptions({ ...options, includeLegacySystems: e.target.checked })}
                  className="rounded border-gray-300 text-cyan-500 focus:ring-cyan-400"
                />
                <span>Pre-Unicode Systems (DOS CP437, Commodore PETSCII, Apple, JIS)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeSubstitutes}
                  onChange={(e) => setOptions({ ...options, includeSubstitutes: e.target.checked })}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                />
                <span>Unicode Substitutes (, Tofu ▯, Control Pictures ␀␡)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeLatest16}
                  onChange={(e) => setOptions({ ...options, includeLatest16: e.target.checked })}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                />
                <span>Latest Unicode 16.0 / 17.0 / 18.0 Drafts</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeDeprecated}
                  onChange={(e) => setOptions({ ...options, includeDeprecated: e.target.checked })}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                />
                <span>Include Deprecated & Removed Codepoints</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeEbcdic}
                  onChange={(e) => setOptions({ ...options, includeEbcdic: e.target.checked })}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                />
                <span>IBM EBCDIC & Baudot Telegraph</span>
              </label>
            </div>

            {/* Random Direction Setting (Every character facing a random direction) */}
            <div className="pt-2 border-t border-gray-200/50 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-teal-600 dark:text-teal-400">
                  <input
                    type="checkbox"
                    checked={options.randomDirections || false}
                    onChange={(e) => {
                      const newOpts = { ...options, randomDirections: e.target.checked };
                      setOptions(newOpts);
                      const count = parseInt(howManyInput.trim(), 10) || 1;
                      setCharacters(generateRandomUnicode(count, newOpts));
                    }}
                    className="rounded border-gray-300 text-teal-500 focus:ring-teal-400"
                  />
                  <span>🧭 Every Unicode Character Facing a Random Direction</span>
                </label>
                {options.randomDirections && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 font-bold">
                    Active
                  </span>
                )}
              </div>

              {options.randomDirections && (
                <div className="flex items-center gap-1.5 flex-wrap pl-6 text-[11px]">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">Style:</span>
                  {(['all', '360', 'orthogonal', 'flip'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        const newOpts: UnicodeGeneratorOptions = { ...options, directionMode: mode };
                        setOptions(newOpts);
                        const count = parseInt(howManyInput.trim(), 10) || 1;
                        setCharacters(generateRandomUnicode(count, newOpts));
                      }}
                      className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-all ${
                        (options.directionMode || 'all') === mode
                          ? 'bg-teal-500 text-slate-950 font-bold border-teal-500 shadow-sm'
                          : 'bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {mode === 'all' && '🌀 All Chaos (Angles & Flips)'}
                      {mode === '360' && '🔄 360° Any Angle'}
                      {mode === 'orthogonal' && '📐 4-Way (0°, 90°, 180°, 270°)'}
                      {mode === 'flip' && '🪞 Mirror Flips'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Character Physics & Emoji Colors Settings */}
            <div className="pt-2 border-t border-gray-200/50 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-600 dark:text-amber-400">
                <input
                  type="checkbox"
                  checked={options.physicsEnabled || false}
                  onChange={(e) => {
                    setOptions({ ...options, physicsEnabled: e.target.checked });
                  }}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                />
                <span>🪐 2D Rigid-Body Character Physics & Gravity</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-pink-600 dark:text-pink-400">
                <input
                  type="checkbox"
                  checked={options.randomEmojiColors !== false}
                  onChange={(e) => {
                    const newOpts = { ...options, randomEmojiColors: e.target.checked };
                    setOptions(newOpts);
                    const count = parseInt(howManyInput.trim(), 10) || 1;
                    setCharacters(generateRandomUnicode(count, newOpts));
                  }}
                  className="rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                />
                <span>🎨 Emojis Have Random Colors (Hue Shifting)</span>
              </label>
            </div>
          </div>
        )}

        {/* PRIMARY CARD (Auto-adjusts size to fit any character direction, font size & physics) */}
        <div
          className={`w-full rounded-sm border p-4 sm:p-8 flex flex-col items-center justify-center transition-all duration-300 ${
            themeMode === 'perchance'
              ? 'bg-white border-[#d8d8d8] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
              : 'bg-slate-900 border-slate-800 shadow-xl'
          }`}
        >
          {/* If Physics is enabled, render the dynamic physics simulation playground */}
          {options.physicsEnabled ? (
            <div className="w-full">
              <UnicodePhysicsPlayground
                characters={characters}
                themeMode={themeMode}
                onSelectCharacter={setSelectedChar}
                selectedChar={selectedChar}
              />
            </div>
          ) : (
            /* Character Display: AUTO-ADJUSTING SIZE TO FIT ANY DIRECTION, SIZE & EMOJI COLORS */
            <div className="w-full py-6 px-6 sm:px-10 min-h-[160px] h-auto transition-all duration-300 flex items-center justify-center select-all rounded-xl border border-gray-100 dark:border-slate-800/50 bg-black/[0.01] dark:bg-black/20 overflow-x-auto overflow-y-visible">
              {characters.length === 1 ? (
                <div
                  onClick={() => setSelectedChar(characters[0])}
                  style={{
                    color: characters[0]?.color,
                    filter: characters[0]?.emojiFilter || undefined,
                    fontSize: characters[0]?.fontSize || '4.5rem',
                    fontFamily: characters[0]?.fontFamily || undefined,
                    transform: characters[0]?.transform || undefined,
                    display: 'inline-block',
                    margin: characters[0]?.transform ? '0.35em' : '0.1em',
                    transformOrigin: 'center center',
                  }}
                  className="font-normal leading-none cursor-pointer hover:scale-105 active:scale-95 transition-all text-center select-all p-3"
                  title={`${characters[0]?.hex} - ${characters[0]?.googleFont || characters[0]?.fontFamily || 'Default'} (${characters[0]?.fontSize || 'default'})${characters[0]?.directionNote ? ` | Direction: ${characters[0].directionNote}` : ''}${characters[0]?.emojiColorName ? ` | Emoji Color: ${characters[0].emojiColorName}` : ''}`}
                >
                  {characters[0]?.char}
                </div>
              ) : (
                /* All characters placed side-by-side with auto-fit margins for rotated directions & colorful emojis */
                <div className="w-full text-center px-2 py-4 flex flex-wrap items-center justify-center gap-3 sm:gap-5 leading-none">
                  {characters.map((c, i) => (
                    <span
                      key={i}
                      onClick={() => setSelectedChar(c)}
                      style={{
                        color: c.color,
                        filter: c.emojiFilter || undefined,
                        fontSize: c.fontSize || '2.8rem',
                        fontFamily: c.fontFamily || undefined,
                        transform: c.transform || undefined,
                        display: 'inline-block',
                        margin: c.transform ? '0.3em' : '0.05em',
                        transformOrigin: 'center center',
                      }}
                      className={`cursor-pointer p-1.5 transition-all leading-none ${
                        selectedChar === c
                          ? 'ring-2 ring-amber-500 rounded bg-amber-500/10'
                          : themeMode === 'perchance'
                          ? 'hover:text-blue-600'
                          : 'hover:text-amber-400'
                      }`}
                      title={`${c.char} - ${c.hex} | Font: ${c.googleFont || c.fontFamily || 'System'} | Size: ${c.fontSize || 'default'}${c.directionNote ? ` | Direction: ${c.directionNote}` : ''}${c.emojiColorName ? ` | Emoji Color: ${c.emojiColorName}` : ''}`}
                    >
                      {c.char}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Controls: exact "randomize" button + "how many?" input */}
          <div className="mt-4 flex items-center justify-center gap-1.5 w-full max-w-xs">
            <button
              onClick={handleRandomize}
              type="button"
              className={`px-3 py-1 text-sm rounded transition-all cursor-pointer select-none active:translate-y-0.5 font-medium ${
                themeMode === 'perchance'
                  ? 'bg-[#efefef] hover:bg-[#e4e4e4] active:bg-[#d8d8d8] text-[#222] border border-[#767676]'
                  : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-600'
              }`}
            >
              randomize
            </button>

            <input
              type="text"
              placeholder="how many?"
              value={howManyInput}
              onChange={(e) => setHowManyInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-28 px-2 py-1 text-sm text-center rounded focus:outline-none transition-colors ${
                themeMode === 'perchance'
                  ? 'bg-white border border-[#767676] text-black placeholder:text-gray-400 focus:border-blue-500'
                  : 'bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500'
              }`}
            />
          </div>
        </div>

        {/* SECOND CARD: Notes & Links (Exact text from perchance.org) */}
        <div
          className={`w-full rounded-sm border p-6 text-[13px] leading-relaxed space-y-3.5 transition-all ${
            themeMode === 'perchance'
              ? 'bg-white border-[#d8d8d8] text-[#222222] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          <p className="font-normal">
            Note: CJK and private use characters are supported.
            {options.includeCJK || options.includePrivateUse ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                (Full CJK Ext A-I, PUA, & pre-Unicode enabled)
              </span>
            ) : null}
          </p>

          <p>
            The{' '}
            <a
              href="https://perchance.org/useful-generators"
              target="_blank"
              rel="noreferrer"
              className="text-[#1a0dab] dark:text-cyan-400 hover:underline inline-flex items-center gap-0.5"
            >
              useful generators list
            </a>{' '}
            is a handy list of simple text generators on various topics. If you're a Perchance builder
            then you'll probably find some of them useful for importing into your own projects.
          </p>

          <p>
            If you'd like to learn how to create a random text generator, then check out the{' '}
            <a
              href="https://perchance.org/minimal-generator"
              target="_blank"
              rel="noreferrer"
              className="text-[#1a0dab] dark:text-cyan-400 hover:underline"
            >
              minimal generator template
            </a>{' '}
            and the{' '}
            <a
              href="https://perchance.org/tutorial"
              target="_blank"
              rel="noreferrer"
              className="text-[#1a0dab] dark:text-cyan-400 hover:underline"
            >
              tutorial
            </a>
            . It's easier than you'd think and is great fun :)
          </p>
        </div>

        {/* The classic Perchance dice icon below cards */}
        <div className="flex justify-center pt-2 pb-1">
          <div
            className="w-6 h-6 border border-gray-300 dark:border-slate-700 rounded flex items-center justify-center text-gray-400 dark:text-slate-600 hover:text-amber-500 transition-colors cursor-pointer"
            onClick={handleRandomize}
            title="Roll again"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="7" cy="7" r="1.5" />
              <circle cx="17" cy="7" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="7" cy="17" r="1.5" />
              <circle cx="17" cy="17" r="1.5" />
            </svg>
          </div>
        </div>

        {/* CHANG-ITZ POWER TOOLBAR: Quick Copy & Character Inspector */}
        {characters.length > 0 && (
          <div
            className={`w-full rounded-xl border p-4 text-xs space-y-3 transition-all ${
              themeMode === 'perchance'
                ? 'bg-slate-50 border-gray-300 text-gray-800'
                : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-bold pb-2 border-b border-gray-200 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <span>⚡</span>
                <span>Generated Stream ({characters.length} characters side-by-side)</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => copyToClipboard(allRawText, 'raw')}
                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  {copiedType === 'raw' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'raw' ? 'Copied All!' : 'Copy Characters'}</span>
                </button>

                <button
                  onClick={() => copyToClipboard(allHtmlEntities, 'html')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 transition-all"
                >
                  {copiedType === 'html' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>HTML Entities</span>
                </button>

                <button
                  onClick={() => copyToClipboard(allHexCodepoints, 'hex')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 transition-all"
                >
                  {copiedType === 'hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Hex Codepoints</span>
                </button>
              </div>
            </div>

            {/* Selected Character Deep Inspector */}
            {selectedChar && (
              <div className="space-y-2 pt-1 font-mono text-[11px]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <div className="p-2 rounded bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-sans font-bold">Selected</span>
                    <div
                      style={{
                        color: selectedChar.color,
                        filter: selectedChar.emojiFilter || undefined,
                        fontFamily: selectedChar.fontFamily,
                        fontSize: selectedChar.fontSize,
                        transform: selectedChar.transform,
                        display: 'inline-block',
                      }}
                      className="text-2xl font-normal select-all"
                    >
                      {selectedChar.char}
                    </div>
                  </div>

                  <div className="p-2 rounded bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-sans font-bold">Hex Codepoint</span>
                    <div className="text-amber-500 font-bold select-all">{selectedChar.hex}</div>
                  </div>

                  <div className="p-2 rounded bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-sans font-bold">HTML Entity</span>
                    <div className="text-emerald-500 select-all">{selectedChar.htmlEntity}</div>
                  </div>

                  <div className="p-2 rounded bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-sans font-bold">Font / Size</span>
                    {selectedChar.googleFont ? (
                      <a
                        href={getGoogleFontUrl(selectedChar.googleFont)}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate font-sans font-semibold text-blue-500 hover:underline flex items-center gap-1"
                        title={selectedChar.googleFont}
                      >
                        <span className="truncate">{selectedChar.googleFont}</span>
                        <span className="text-slate-400 text-[10px]">({selectedChar.fontSize || 'default'})</span>
                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <div className="truncate font-sans font-semibold text-gray-800 dark:text-slate-200">
                        {selectedChar.fontFamily || 'System'} ({selectedChar.fontSize || 'default'})
                      </div>
                    )}
                  </div>

                  <div className="p-2 rounded bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-sans font-bold">Direction</span>
                    <div className="truncate font-sans font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1" title={selectedChar.directionNote || selectedChar.transform || 'Upright'}>
                      <span>🧭</span>
                      <span className="truncate">{selectedChar.directionNote || (selectedChar.transform ? 'Rotated' : 'Upright')}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-sans font-bold">
                      {selectedChar.isEmoji ? 'Emoji Color' : 'Color Style'}
                    </span>
                    <div className="truncate font-sans font-semibold text-pink-500 flex items-center gap-1.5" title={selectedChar.emojiColorName || selectedChar.color || 'Default'}>
                      <span
                        className="w-3 h-3 rounded-full inline-block flex-shrink-0 shadow-xs border border-white/20"
                        style={{ backgroundColor: selectedChar.emojiHex || selectedChar.color || '#f59e0b' }}
                      />
                      <span className="truncate">
                        {selectedChar.emojiColorName || (selectedChar.color ? selectedChar.color : 'Default')}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedChar.notes && (
                  <div className="p-2 rounded bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-[11px] font-sans flex items-center gap-1.5 text-gray-600 dark:text-slate-300">
                    <span className="text-sm">💡</span>
                    <span>
                      <strong>Historical / System Note:</strong> {selectedChar.notes}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Direct Send To Chang-Itz Pipeline */}
            {onSendToConverter && (
              <div className="pt-2 flex items-center justify-between border-t border-gray-200 dark:border-slate-800">
                <span className="text-[11px] text-gray-500">
                  Ready to transform these Unicode & Legacy characters in Chang-Itz?
                </span>
                <button
                  onClick={() => onSendToConverter(allRawText, 'json')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>⚡ Convert with Chang-Itz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
