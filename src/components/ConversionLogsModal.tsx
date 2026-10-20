import React, { useState } from 'react';
import { Terminal, Copy, Check, Trash2, X } from 'lucide-react';
import { LogEntry } from '../types/conversion';

interface ConversionLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onClearLogs?: () => void;
}

export const ConversionLogsModal: React.FC<ConversionLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-pointer"
    >
      <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 cursor-default">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 ml-2">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Chang-Itz Engine Terminal // Execution Logs</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {onClearLogs && (
              <button
                onClick={onClearLogs}
                className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800"
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close logs modal"
              className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-2 bg-slate-950/95 scrollbar-thin">
          {logs.length === 0 ? (
            <div className="text-slate-600 text-center py-12">
              No conversion logs recorded yet. Run a conversion to see real-time pipeline traces!
            </div>
          ) : (
            logs.map((log, i) => {
              let levelColor = 'text-slate-400';
              let badgeColor = 'bg-slate-800 text-slate-400';

              if (log.level === 'info') {
                levelColor = 'text-cyan-300';
                badgeColor = 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
              } else if (log.level === 'success') {
                levelColor = 'text-emerald-300 font-semibold';
                badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
              } else if (log.level === 'warn') {
                levelColor = 'text-amber-300';
                badgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
              } else if (log.level === 'error') {
                levelColor = 'text-red-300 font-bold';
                badgeColor = 'bg-red-500/10 text-red-400 border border-red-500/20';
              }

              return (
                <div key={i} className="flex items-start gap-2.5 leading-relaxed hover:bg-slate-900/40 p-1 rounded">
                  <span className="text-slate-600 shrink-0 select-none">
                    [{log.timestamp}]
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-bold shrink-0 ${badgeColor}`}>
                    {log.level}
                  </span>
                  <span className={`${levelColor} break-all flex-1`}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
