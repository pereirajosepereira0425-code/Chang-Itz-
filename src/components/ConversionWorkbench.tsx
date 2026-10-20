import React, { useState, useEffect } from 'react';
import { ArrowRight, Settings2, Zap, Search, Check, Sparkles, Filter, Globe2 } from 'lucide-react';
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

  // Filter available targets for the selector
  const filteredTargets = availableTargets
    .map((id) => FORMATS[id])
    .filter(Boolean)
    .filter((fmt) => {
      const matchesSearch =
        fmt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fmt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fmt.extension.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || fmt.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  const handleOptionChange = (key: string, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full mt-6 space-y-6">
      {/* Overview Card: From ➔ To Preview */}
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

          {/* ARROW */}
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shadow-md">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* TO Target Currently Selected */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-br from-slate-950/90 to-amber-950/30 border-2 border-amber-500/60 shadow-lg shadow-amber-500/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Selected Target (To)</span>
              </span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {targetFormat.extension}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl">{targetFormat.emoji}</span>
              <div className="min-w-0">
                <div className="font-bold text-amber-300 text-lg truncate">
                  {targetFormat.name}
                </div>
                <div className="text-xs text-amber-400/80 font-mono">
                  {targetFormat.category} · {targetFormat.description}
                </div>
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

        {/* Primary Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="text-emerald-400">🔒 100% Client-Side Engine</span>
            <span>·</span>
            <span>Instant In-Memory Conversion</span>
          </div>

          <button
            type="button"
            disabled={isConverting}
            onClick={onConvert}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-extrabold shadow-xl transition-all ${
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

      {/* CHOOSE WHAT YOU WANT TO CONVERT IT TO - IN-PLACE BROWSER */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <span>🎯 Choose What You Want To Convert It To</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {filteredTargets.length} Options
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any format below to choose your output format.
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
            <span>{showAllFormats ? 'Showing All 50+ Formats' : 'Unlock All Formats'}</span>
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
