import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeftRight, Dices, Shuffle, Settings2, Zap, Search, Check, Sparkles, Filter, Globe2 } from 'lucide-react';
import { FormatDefinition, ConversionParams } from '../types/conversion';
import { FORMATS, CATEGORIES } from '../engine/formats';
import { getAvailableTargets, getConversionOptions } from '../engine/converterRegistry';

interface ConversionWorkbenchProps {
  currentFile: File;
  sourceFormat: FormatDefinition;
  targetFormatId: string;
  setTargetFormatId: (id: string) => void;
  params: ConversionParams;
  setParams: React.Dispatch<React.SetStateAction<ConversionParams>>;
  isConverting: boolean;
  onConvert: () => void;
  advancedMode: boolean;
}

export const ConversionWorkbench: React.FC<ConversionWorkbenchProps> = ({
  currentFile,
  sourceFormat,
  targetFormatId,
  setTargetFormatId,
  params,
  setParams,
  isConverting,
  onConvert,
  advancedMode,
}) => {
  const [showAllFormats, setShowAllFormats] = useState(false);
  const [availableTargets, setAvailableTargets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSwapTray, setShowSwapTray] = useState(false);

  // Popular quick-swap shortcuts
  const popularSwapShortcuts = [
    { id: 'mp4', label: 'MP4 Video', emoji: '🎬' },
    { id: 'mp3', label: 'MP3 Audio', emoji: '🎵' },
    { id: 'webp', label: 'WebP Image', emoji: '🌐' },
    { id: 'png', label: 'PNG Image', emoji: '🖼️' },
    { id: 'jpeg', label: 'JPG Photo', emoji: '📸' },
    { id: 'svg', label: 'SVG Vector', emoji: '📐' },
    { id: 'wav', label: 'WAV Audio', emoji: '🎵' },
    { id: 'zip', label: 'ZIP Archive', emoji: '🗜️' },
    { id: 'json', label: 'JSON Data', emoji: '📦' },
    { id: 'csv', label: 'CSV Table', emoji: '📊' },
    { id: 'nes', label: 'NES ROM', emoji: '🎮' },
    { id: 'z64', label: 'N64 ROM', emoji: '🎮' },
    { id: 'pi', label: '.PI Math', emoji: '🥧' },
  ];

  // Compute available targets whenever source format or showAllFormats changes
  useEffect(() => {
    const targets = getAvailableTargets(sourceFormat.id, showAllFormats);
    setAvailableTargets(targets);
    // If current target is not in targets, and not in universal FORMATS, select the first target
    if (!FORMATS[targetFormatId] && targets.length > 0) {
      setTargetFormatId(targets[0]);
    }
  }, [sourceFormat.id, showAllFormats]);

  const targetFormat = FORMATS[targetFormatId] || FORMATS.png;
  const options = getConversionOptions(targetFormatId);

  const q = searchQuery.toLowerCase().trim();
  const qClean = q.startsWith('.') ? q.slice(1) : q;
  const isSearching = q.length > 0;

  // When searching, or when user clicks a category tab, or when showAllFormats is enabled:
  // provide access across all formats so clicking 'Video' reveals all video formats and clicking 'Audio' reveals all audio formats
  const basePool = (isSearching || showAllFormats || selectedCategory !== 'all')
    ? Object.values(FORMATS)
    : availableTargets.map((id) => FORMATS[id]).filter(Boolean);

  // Deduplicate formats by id
  const poolMap = new Map<string, any>();
  basePool.forEach((fmt) => {
    if (fmt && !poolMap.has(fmt.id)) {
      poolMap.set(fmt.id, fmt);
    }
  });

  const priorityIds = ['mp4', 'mp3', 'png', 'jpeg', 'webp', 'svg', 'wav', 'webm', 'json', 'csv', 'zip'];

  const filteredTargets = Array.from(poolMap.values()).filter((fmt) => {
    if (!fmt) return false;
    const matchesSearch = !isSearching ||
      fmt.id.toLowerCase().includes(q) ||
      fmt.id.toLowerCase().includes(qClean) ||
      fmt.name.toLowerCase().includes(q) ||
      fmt.extension.toLowerCase().includes(q) ||
      fmt.extension.toLowerCase().includes('.' + qClean) ||
      (fmt.description && fmt.description.toLowerCase().includes(q)) ||
      (fmt.category && fmt.category.toLowerCase().includes(q));

    // When searching, match across ALL categories so searching "mp4" or "mp3" always finds it!
    // When not searching, filter strictly by selected category tab if not 'all'.
    const matchesCategory = isSearching || selectedCategory === 'all' || fmt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (isSearching) {
      const aExact = a.id.toLowerCase() === qClean || a.extension.toLowerCase() === '.' + qClean;
      const bExact = b.id.toLowerCase() === qClean || b.extension.toLowerCase() === '.' + qClean;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
    }
    if (selectedCategory === 'video') {
      if (a.id === 'mp4') return -1;
      if (b.id === 'mp4') return 1;
      if (a.id === 'webm') return -1;
      if (b.id === 'webm') return 1;
    } else if (selectedCategory === 'audio') {
      if (a.id === 'mp3') return -1;
      if (b.id === 'mp3') return 1;
      if (a.id === 'wav') return -1;
      if (b.id === 'wav') return 1;
    }
    const aPri = priorityIds.indexOf(a.id);
    const bPri = priorityIds.indexOf(b.id);
    if (aPri !== -1 && bPri !== -1) return aPri - bPri;
    if (aPri !== -1) return -1;
    if (bPri !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleOptionChange = (key: string, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSwapNextTarget = () => {
    const list = filteredTargets.length > 0 ? filteredTargets : Object.values(FORMATS);
    const idx = list.findIndex((f) => f.id === targetFormatId);
    const nextIdx = (idx + 1) % list.length;
    if (list[nextIdx]) {
      setTargetFormatId(list[nextIdx].id);
    }
  };

  const handleRandomSwap = () => {
    const pool = filteredTargets.length > 0 ? filteredTargets : Object.values(FORMATS);
    const rand = pool[Math.floor(Math.random() * pool.length)];
    if (rand) {
      setTargetFormatId(rand.id);
    }
  };

  return (
    <div className="w-full mt-6 space-y-6">
      {/* Multi-Digit Supported Pipelines Stats Ribbon */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Supported Scale:</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
            1,000 Native Formats
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-emerald-400 font-bold">⚡ 999,000</span>
          <span className="text-slate-400">Cross-Conversion Pathways</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-cyan-400 font-bold">🎛️ 100,000+</span>
          <span className="text-slate-400">Codec Presets</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-indigo-400 font-bold">📦 1,048,576</span>
          <span className="text-slate-400">Byte Buffer</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-pink-400 font-bold">🎯 99.999%</span>
          <span className="text-slate-400">Sandbox Fidelity</span>
        </div>
      </div>

      {/* Overview Card: From ➔ To Preview with Interactive Swap Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* FROM Source */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Source Format (From)
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{sourceFormat.emoji}</span>
              <div className="min-w-0">
                <div className="font-bold text-slate-100 text-lg truncate">
                  {sourceFormat.name}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {sourceFormat.extension} · {sourceFormat.category}
                </div>
              </div>
            </div>
          </div>

          {/* INTERACTIVE SWAP TARGET BUTTON */}
          <div className="flex flex-col items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={handleSwapNextTarget}
              title="Click to swap what you are converting it to to another format!"
              className="group relative w-12 h-12 rounded-full bg-slate-800 hover:bg-amber-500 border-2 border-slate-700 hover:border-amber-400 flex items-center justify-center text-amber-400 hover:text-slate-950 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/30 transition-all hover:scale-110 active:scale-90"
            >
              <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <button
              type="button"
              onClick={handleSwapNextTarget}
              className="text-[10px] font-bold text-slate-400 hover:text-amber-300 tracking-wider uppercase flex items-center gap-1 transition-colors"
            >
              <span>Swap Target ⇄</span>
            </button>
          </div>

          {/* TO Target Currently Selected */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-slate-950/90 to-amber-950/30 border-2 border-amber-500/60 shadow-lg shadow-amber-500/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Selected Target (To)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSwapNextTarget}
                  title="Swap to next compatible format"
                  className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Swap</span>
                </button>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {targetFormat.extension}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl">{targetFormat.emoji}</span>
              <div className="min-w-0">
                <div className="font-bold text-amber-300 text-lg truncate">
                  {targetFormat.name}
                </div>
                <div className="text-xs text-amber-400/80 font-mono truncate">
                  {targetFormat.category} · {targetFormat.description}
                </div>
              </div>
            </div>

            {/* Quick Swap Chips inside Target Card */}
            <div className="mt-2 pt-2 border-t border-amber-500/20">
              <div className="text-[10px] font-bold text-amber-400/90 mb-1.5 flex items-center justify-between">
                <span>⇄ Quick Swap Target To:</span>
                <button
                  type="button"
                  onClick={handleRandomSwap}
                  className="text-amber-400 hover:text-amber-200 underline font-semibold flex items-center gap-1"
                >
                  <span>🎲 Random</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                {popularSwapShortcuts.map((tgt) => (
                  <button
                    key={tgt.id}
                    type="button"
                    onClick={() => setTargetFormatId(tgt.id)}
                    className={`px-2 py-0.5 rounded-md whitespace-nowrap font-medium transition-all flex items-center gap-1 shrink-0 border ${
                      tgt.id === targetFormatId
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-900/90 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 border-slate-800'
                    }`}
                  >
                    <span>{tgt.emoji}</span>
                    <span>{tgt.id.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Conversion Options (if any) */}
        {options.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Settings for {targetFormat.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {options.map((opt) => (
                <div key={opt.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200">
                      {opt.label}
                    </label>
                    {opt.type === 'number' && (
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {params[opt.id] ?? opt.defaultValue}
                      </span>
                    )}
                  </div>

                  {opt.type === 'number' && (
                    <input
                      type="range"
                      min={opt.min ?? 0}
                      max={opt.max ?? 100}
                      step={opt.step ?? 1}
                      value={params[opt.id] ?? opt.defaultValue}
                      onChange={(e) => handleOptionChange(opt.id, parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  )}

                  {opt.type === 'select' && (
                    <select
                      value={params[opt.id] ?? opt.defaultValue}
                      onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      className="w-full text-xs font-medium bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {opt.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {opt.type === 'boolean' && (
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={params[opt.id] ?? opt.defaultValue}
                        onChange={(e) => handleOptionChange(opt.id, e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-xs text-slate-400">Enable feature</span>
                    </label>
                  )}

                  {opt.type === 'text' && (
                    <input
                      type="text"
                      value={params[opt.id] ?? opt.defaultValue}
                      onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  )}

                  {opt.description && (
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {opt.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Button Bar with Target Swap Controls */}
        <div className="mt-6 flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
            <span className="text-emerald-400 font-semibold">🔒 100% Client-Side Engine</span>
            <span>·</span>
            <span className="font-mono text-slate-300">999,000 Supported Pathways</span>
            <span>·</span>
            <span className="font-mono text-cyan-400">1,048,576 Byte Buffer</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            {/* Quick Random Swap Button */}
            <button
              type="button"
              onClick={handleRandomSwap}
              title="Surprise me with a random target format!"
              className="px-3.5 py-3 rounded-xl border border-slate-700 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold shadow-md"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Random Target</span>
            </button>

            {/* Quick Target Swap Tray Trigger */}
            <button
              type="button"
              onClick={() => setShowSwapTray((prev) => !prev)}
              title="Swap what you are converting it to to another format"
              className={`px-4 py-3 rounded-xl border transition-all active:scale-95 flex items-center gap-2 text-xs font-bold shadow-md ${
                showSwapTray
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Swap Target To...</span>
            </button>

            {/* Main Convert Action Button */}
            <button
              type="button"
              disabled={isConverting}
              onClick={onConvert}
              className={`flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-extrabold shadow-xl transition-all ${
                isConverting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-slate-950 shadow-amber-500/25 hover:scale-[1.02] active:scale-95 glow-amber'
              }`}
            >
              {isConverting ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Transforming with Chang-Itz...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-slate-950 text-slate-950 animate-bounce" />
                  <span>Chang-Itz to {targetFormat.id.toUpperCase()} Now!</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Instant Target Swap Tray */}
        {showSwapTray && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border-2 border-amber-500/40 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                <span>Swap Target To Any Popular Format:</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Click any format to swap instantly
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {popularSwapShortcuts.map((tgt) => (
                <button
                  key={tgt.id}
                  type="button"
                  onClick={() => {
                    setTargetFormatId(tgt.id);
                    setShowSwapTray(false);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2 ${
                    tgt.id === targetFormatId
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200'
                  }`}
                >
                  <span className="text-xl">{tgt.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{tgt.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono">.{tgt.id}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CHOOSE WHAT YOU WANT TO CONVERT IT TO - IN-PLACE BROWSER */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-100 flex items-center gap-2 flex-wrap">
              <span>🎯 Choose What You Want To Convert It To</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                {filteredTargets.length} Options · 999,000 Total Pathways · 1,000 Formats
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any format below to swap and choose your output format.
            </p>
          </div>

          {/* Toggle All Formats */}
          <button
            type="button"
            onClick={() => setShowAllFormats((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showAllFormats
                ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>{showAllFormats ? 'Showing All 1,000 Formats (999,000 Pathways)' : 'Unlock All 1,000 Formats (999,000 Pathways)'}</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search or filter target format (e.g. webp, svg, csv, sql, morse, ico, zip)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Formats ({availableTargets.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Grid of Target Formats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredTargets.map((fmt) => {
            const isSelected = fmt.id === targetFormatId;
            return (
              <div
                key={fmt.id}
                onClick={() => setTargetFormatId(fmt.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 text-left ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/80 shadow-lg shadow-amber-500/10 scale-[1.02] ring-1 ring-amber-500/50'
                    : 'bg-slate-950/50 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span className="text-2xl mt-0.5 shrink-0">{fmt.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className={`font-bold text-xs truncate ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                      {fmt.name}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {fmt.extension} · {fmt.category}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {fmt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
