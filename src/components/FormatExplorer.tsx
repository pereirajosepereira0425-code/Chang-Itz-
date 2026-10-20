import React, { useState } from 'react';
import { Search, ArrowRight, Sparkles, Filter, ExternalLink } from 'lucide-react';
import { FORMATS, CATEGORIES } from '../engine/formats';
import { getAvailableTargets } from '../engine/converterRegistry';
import { FormatDefinition } from '../types/conversion';

interface FormatExplorerProps {
  onSelectFormatForConvert: (fmt: FormatDefinition) => void;
}

export const FormatExplorer: React.FC<FormatExplorerProps> = ({
  onSelectFormatForConvert,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [activeFormatId, setActiveFormatId] = useState<string>('png');

  const allFormats = Object.values(FORMATS);
  const activeFmt = FORMATS[activeFormatId] || allFormats[0];
  const targets = getAvailableTargets(activeFormatId).map((id) => FORMATS[id]).filter(Boolean);

  const filteredFormats = allFormats.filter((fmt) => {
    const matchesSearch =
      fmt.name.toLowerCase().includes(search.toLowerCase()) ||
      fmt.id.toLowerCase().includes(search.toLowerCase()) ||
      fmt.extension.toLowerCase().includes(search.toLowerCase()) ||
      fmt.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'all' || fmt.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Explorer Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <span>🌐 Chang-Itz Format Graph & Matrix</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {allFormats.length} Total Formats
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Explore all supported file formats and discover conversion pathways and compatible targets across the graph.
        </p>

        {/* Search & Category Filter */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search format matrix (e.g. png, csv, audio, ico, svg)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-semibold ${
                selectedCat === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-semibold flex items-center gap-1 shrink-0 ${
                  selectedCat === c.id ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{c.emoji}</span>
                <span>{c.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column: Left Formats List, Right Selected Format Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Formats List */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-3 max-h-[600px] overflow-y-auto space-y-1.5 scrollbar-thin">
          {filteredFormats.map((fmt) => {
            const isSelected = fmt.id === activeFormatId;
            return (
              <div
                key={fmt.id}
                onClick={() => setActiveFormatId(fmt.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 border ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
                    : 'bg-slate-950/40 hover:bg-slate-800/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl">{fmt.emoji}</span>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                      {fmt.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {fmt.extension} · {fmt.category}
                    </div>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Right Selected Format Detail & Target Pathways Graph */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-6">
          {/* Active Format Header Card */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
                {activeFmt.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-slate-100">
                    {activeFmt.name}
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    {activeFmt.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {activeFmt.description}
                </p>
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  Ext: <span className="text-slate-300">{activeFmt.extension}</span> · MIME: <span className="text-slate-300">{activeFmt.mimeTypes.join(', ')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectFormatForConvert(activeFmt)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0"
            >
              Convert with this
            </button>
          </div>

          {/* Target Pathways Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Available Conversion Targets ({targets.length})</span>
              </span>
              <span className="text-[11px] text-slate-500">Direct transformation graph</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {targets.map((tgt) => (
                <div
                  key={tgt.id}
                  onClick={() => onSelectFormatForConvert(activeFmt)}
                  className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl group-hover:scale-110 transition-transform">{tgt.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                        {tgt.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {tgt.extension}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    Convert ➔
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
