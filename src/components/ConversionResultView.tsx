import React, { useState } from 'react';
import { Download, Copy, Check, Terminal, RotateCcw, Volume2, Image as ImageIcon, FileText, CheckCircle2 } from 'lucide-react';
import { ConversionResult } from '../types/conversion';
import { FORMATS } from '../engine/formats';

interface ConversionResultViewProps {
  result: ConversionResult;
  onReset: () => void;
  onOpenLogs: () => void;
  onChooseNewTarget?: (targetId: string) => void;
}

export const ConversionResultView: React.FC<ConversionResultViewProps> = ({
  result,
  onReset,
  onOpenLogs,
  onChooseNewTarget,
}) => {
  const [copied, setCopied] = useState(false);
  const targetFmt = FORMATS[result.outputFormat] || FORMATS.png;

  const handleDownload = () => {
    let url = result.previewUrl;
    let shouldRevoke = false;

    if (!url) {
      if (typeof result.data === 'string') {
        const blob = new Blob([result.data], { type: result.mimeType });
        url = URL.createObjectURL(blob);
        shouldRevoke = true;
      } else if (result.data instanceof Blob) {
        url = URL.createObjectURL(result.data);
        shouldRevoke = true;
      }
    }

    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = result.outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (shouldRevoke) URL.revokeObjectURL(url);
    }
  };

  const handleCopy = () => {
    if (result.textContent) {
      navigator.clipboard.writeText(result.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const sizeDelta = result.convertedSizeBytes - result.originalSizeBytes;
  const sizePercent = Math.round((Math.abs(sizeDelta) / (result.originalSizeBytes || 1)) * 100);
  const isSmaller = sizeDelta < 0;

  return (
    <div className="w-full mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Success Metrics Banner */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/20 p-5 shadow-xl glow-emerald">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
              🎉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-100">
                  Chang-Itz Transformation Complete!
                </h3>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {result.executionTimeMs}ms
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <span>{formatSize(result.originalSizeBytes)}</span>
                <span>➔</span>
                <span className="font-bold text-slate-200">{formatSize(result.convertedSizeBytes)}</span>
                {sizeDelta !== 0 && (
                  <span className={`text-[11px] font-semibold ${isSmaller ? 'text-emerald-400' : 'text-amber-400'}`}>
                    ({isSmaller ? `-${sizePercent}% saved` : `+${sizePercent}%`})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download {result.outputName}</span>
            </button>

            {result.textContent && (
              <button
                onClick={handleCopy}
                title="Copy converted text/code to clipboard"
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            <button
              onClick={onOpenLogs}
              title="View Conversion Terminal Logs"
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <span>{targetFmt.emoji}</span>
            <span className="text-slate-200 font-bold">{result.outputName}</span>
            <span className="text-[10px] text-slate-500 font-mono">({result.mimeType})</span>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Convert Another</span>
          </button>
        </div>

        {/* Dynamic Preview Area */}
        {result.previewType === 'image' && result.previewUrl && (
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-xl border border-slate-800/80 min-h-[260px] overflow-hidden">
            <div className="p-3 bg-black/40 rounded-xl border border-slate-800 shadow-lg max-w-full">
              <img
                src={result.previewUrl}
                alt="Converted preview"
                className="max-h-[380px] max-w-full object-contain rounded-lg shadow-inner"
              />
            </div>
          </div>
        )}

        {result.previewType === 'audio' && result.previewUrl && (
          <div className="p-8 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
              🎵
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-base">{result.outputName}</h4>
              <p className="text-xs text-slate-400">Synthesized 16-bit PCM Audio Waveform</p>
            </div>
            <audio controls src={result.previewUrl} className="w-full max-w-md mt-2 accent-amber-500" />
          </div>
        )}

        {result.previewType === 'text' && result.textContent !== undefined && (
          <div className="relative">
            <div className="absolute right-3 top-3 z-10">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300 overflow-x-auto max-h-[380px] leading-relaxed scrollbar-thin">
              <code>{result.textContent}</code>
            </pre>
          </div>
        )}

        {result.previewType === 'archive' && (
          <div className="p-8 bg-slate-950/80 rounded-xl border border-slate-800/80 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl">
              🗜️
            </div>
            <h4 className="font-bold text-slate-100 text-base">ZIP Container Ready</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Your files have been compressed with DEFLATE level 6 for maximum space savings.
            </p>
            <button
              onClick={handleDownload}
              className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Archive</span>
            </button>
          </div>
        )}

        {/* Quick Re-convert Options */}
        {onChooseNewTarget && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>🔄</span>
                <span>Want to convert this to another format?</span>
              </span>
              <button
                onClick={onReset}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Browse All Formats ➔
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
              {[
                { id: 'webp', label: 'WebP', emoji: '🌐' },
                { id: 'png', label: 'PNG', emoji: '🖼️' },
                { id: 'jpeg', label: 'JPG', emoji: '📸' },
                { id: 'svg', label: 'SVG', emoji: '📐' },
                { id: 'csv', label: 'CSV', emoji: '📊' },
                { id: 'json', label: 'JSON', emoji: '📦' },
                { id: 'sql', label: 'SQL', emoji: '🗄️' },
                { id: 'yaml', label: 'YAML', emoji: '⚙️' },
                { id: 'markdown', label: 'Markdown', emoji: '📝' },
                { id: 'html', label: 'HTML', emoji: '🌐' },
                { id: 'asciiart', label: 'ASCII Art', emoji: '👾' },
                { id: 'zip', label: 'ZIP', emoji: '🗜️' },
              ]
                .filter((item) => item.id !== result.outputFormat)
                .map((tgt) => (
                  <button
                    key={tgt.id}
                    onClick={() => onChooseNewTarget(tgt.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-800 transition-all font-semibold flex items-center gap-1.5 shrink-0"
                  >
                    <span>{tgt.emoji}</span>
                    <span>Convert to {tgt.label}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
