import React from 'react';
import { ShieldCheck, Zap, Lock, Cpu, Heart } from 'lucide-react';
import { ChangItzMascot } from './ChangItzMascot';

interface FooterProps {
  onSelectTab: (tab: 'convert' | 'batch' | 'studio' | 'matrix') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/70 pt-10 pb-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Private</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Your files never leave your device. All calculations and transformations run in your local browser sandbox.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Speed</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Zero network upload delays or queue wait times. Native WebAssembly, Canvas, and Web Audio acceleration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>600+ Formats & Pipelines</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Convert between all 600+ images, video streams, audio chiptunes, databases, docs, code, and packages.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>No Limits</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              No daily conversion quotas, paywalls, watermarks, or account logins required. Free and open spirit.
            </p>
          </div>
        </div>

        {/* Brand Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-900">
          <div className="flex items-center gap-2.5">
            <ChangItzMascot size="xs" spinningGears={false} animated={false} />
            <span className="font-extrabold text-slate-200 tracking-tight">Chang-Itz</span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-500">Official Mascot: Changi 🦊</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
            <button onClick={() => onSelectTab('convert')} className="hover:text-amber-400 transition-colors">
              Single Convert
            </button>
            <button onClick={() => onSelectTab('batch')} className="hover:text-amber-400 transition-colors">
              Batch Mode
            </button>
            <button onClick={() => onSelectTab('studio')} className="hover:text-amber-400 transition-colors">
              Instant Studio
            </button>
            <button onClick={() => onSelectTab('matrix')} className="hover:text-amber-400 transition-colors">
              Format Matrix
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
