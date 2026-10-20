import React from 'react';
import { Sliders, HelpCircle, Sparkles, FolderArchive, Terminal } from 'lucide-react';
import { ChangItzMascot } from './ChangItzMascot';

interface HeaderProps {
  activeTab: 'convert' | 'batch' | 'studio' | 'matrix' | 'unicode';
  setActiveTab: (tab: 'convert' | 'batch' | 'studio' | 'matrix' | 'unicode') => void;
  advancedMode: boolean;
  setAdvancedMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  onOpenLogs?: () => void;
  onOpenHelp?: () => void;
  onOpenMascotModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  advancedMode,
  setAdvancedMode,
  onOpenLogs,
  onOpenHelp,
  onOpenMascotModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Mascot */}
        <div className="flex items-center gap-3 group">
          <div
            onClick={onOpenMascotModal}
            className="relative p-1 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-pink-500/20 border border-amber-500/30 hover:border-amber-400 hover:scale-105 transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center cursor-pointer"
            title="Click to open Chang-Itz Mascot Studio (Upload image or change skin)"
          >
            <ChangItzMascot size="sm" spinningGears={true} animated={true} onOpenMascotModal={onOpenMascotModal} />
            <div className="absolute -top-1 -right-1 text-xs">⚡</div>
          </div>
          <div onClick={() => setActiveTab('convert')} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                Chang-Itz
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                <span>🦊</span>
                <span>Mascot Edition</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              If it has bytes, we can Chang-Itz! 🚀
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('convert')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'convert'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>⚡</span>
            <span>Convert File</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'batch'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>📦</span>
            <span>Batch Mode</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'studio'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🪄</span>
            <span>Instant Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'matrix'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🌐</span>
            <span>Format Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('unicode')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'unicode'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🎲</span>
            <span>Unicode Gen</span>
          </button>
        </nav>

        {/* Right Tools: Advanced Mode, Terminal Logs, Help */}
        <div className="flex items-center gap-2">
          {onOpenLogs && (
            <button
              onClick={onOpenLogs}
              title="View Conversion Terminal Logs"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg border border-slate-800 transition-colors"
            >
              <Terminal className="w-4 h-4" />
            </button>
          )}

          {onOpenMascotModal && (
            <button
              onClick={onOpenMascotModal}
              title="Change Mascot Image or Customize Skins"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-all hover:scale-105"
            >
              <span>🦊</span>
              <span className="hidden sm:inline">Mascot</span>
            </button>
          )}

          <button
            onClick={() => setAdvancedMode((prev) => !prev)}
            title="Toggle Advanced Engine Controls"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              advancedMode
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Advanced</span>
            <span className={`w-2 h-2 rounded-full ${advancedMode ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
          </button>

          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              title="Help & Supported Pipelines"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg border border-slate-800 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
