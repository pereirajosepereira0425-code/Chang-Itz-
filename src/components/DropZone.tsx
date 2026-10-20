import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, RefreshCw, Sparkles, Target, ArrowRight } from 'lucide-react';
import { FormatDefinition } from '../types/conversion';
import { createSampleFiles, SampleFile } from '../engine/sampleFiles';
import { FORMATS } from '../engine/formats';
import { ChangItzMascot } from './ChangItzMascot';

interface DropZoneProps {
  currentFile: File | null;
  detectedFormat: FormatDefinition | null;
  targetFormatId: string;
  setTargetFormatId: (id: string) => void;
  onFileSelected: (file: File) => void;
  onClearFile: () => void;
  onOpenMascotModal?: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  currentFile,
  detectedFormat,
  targetFormatId,
  setTargetFormatId,
  onFileSelected,
  onClearFile,
  onOpenMascotModal,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [samples] = useState<SampleFile[]>(() => createSampleFiles());

  // Popular target format shortcuts
  const popularTargets = [
    { id: 'chr', label: 'DDLC .chr', emoji: '🎀' },
    { id: 'bruh', label: '.BRUH Meme', emoji: '🗿' },
    { id: 'apk', label: 'Android APK', emoji: '🤖' },
    { id: 'xapk', label: 'Android XAPK', emoji: '📦' },
    { id: 'truehd', label: 'Dolby TrueHD', emoji: '🔊' },
    { id: 'webp', label: 'WebP', emoji: '🌐' },
    { id: 'jpeg', label: 'JPG', emoji: '📸' },
    { id: 'png', label: 'PNG', emoji: '🖼️' },
    { id: 'svg', label: 'SVG', emoji: '📐' },
    { id: 'ico', label: 'Favicon ICO', emoji: '⭐' },
    { id: 'csv', label: 'CSV Table', emoji: '📊' },
    { id: 'json', label: 'JSON Data', emoji: '📦' },
    { id: 'markdown', label: 'Markdown', emoji: '📝' },
    { id: 'wav', label: 'WAV Audio', emoji: '🎵' },
    { id: 'asciiart', label: 'ASCII Art', emoji: '👾' },
    { id: 'pixelart', label: 'Pixel Art', emoji: '🕹️' },
    { id: 'zip', label: 'ZIP Archive', emoji: '🗜️' },
  ];

  // Support Ctrl+V paste from clipboard (images or text)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            onFileSelected(file);
            return;
          }
        }
      }
      // If text pasted and no file is current
      const text = e.clipboardData.getData('text');
      if (text && text.trim().length > 0 && !currentFile) {
        let isJson = false;
        try {
          JSON.parse(text);
          isJson = true;
        } catch {}
        const pastedFile = new File(
          [text],
          isJson ? 'pasted_data.json' : 'pasted_document.txt',
          { type: isJson ? 'application/json' : 'text/plain' }
        );
        onFileSelected(pastedFile);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [currentFile, onFileSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const currentSelectedTargetFmt = FORMATS[targetFormatId] || FORMATS.webp;

  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Target Format Quick-Selection Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <span className="text-xs font-bold text-slate-200">
              Convert To:
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm">
              <span>{currentSelectedTargetFmt.emoji}</span>
              <span>{currentSelectedTargetFmt.name}</span>
              <span>({currentSelectedTargetFmt.extension})</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Choose what you want to convert it to below:
          </span>
        </div>

        {/* Quick Target Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {popularTargets.map((tgt) => {
            const isSelected = tgt.id === targetFormatId;
            return (
              <button
                key={tgt.id}
                type="button"
                onClick={() => setTargetFormatId(tgt.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105 ring-1 ring-amber-400'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{tgt.emoji}</span>
                <span>{tgt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!currentFile ? (
        /* Empty / Upload Drop Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('[data-mascot="true"]')) {
              return;
            }
            fileInputRef.current?.click();
          }}
          className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all dropzone-stripes overflow-hidden group ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10 scale-[1.01] shadow-2xl shadow-amber-500/20'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
          }`}
        >
          {/* Ambient background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Chang-Itz Official Mascot Hero (clicks pet Changi without opening file dialog) */}
            <div data-mascot="true" className="mb-2 flex flex-col items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <ChangItzMascot
                size="lg"
                animated={true}
                spinningGears={true}
                showBubble={true}
                customQuote={isDragging ? 'Omnomnom! Feed me bytes! 🍬' : undefined}
                className="hover:scale-105 transition-transform"
                onOpenMascotModal={onOpenMascotModal}
              />
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight mb-2">
              Drop any file to convert to <span className="text-amber-400">{currentSelectedTargetFmt.name.split(' ')[0]}</span>
            </h3>

            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              Drag & drop images, audio, documents, tables, or code. Or paste directly from your clipboard (<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">Ctrl+V</kbd>).
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>📂 Choose File to Convert</span>
            </button>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
                {detectedFormat?.emoji || '📄'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-100 text-base sm:text-lg truncate max-w-xs sm:max-w-md">
                    {currentFile.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Ready
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="font-mono">{formatFileSize(currentFile.size)}</span>
                  <span>·</span>
                  <span className="text-slate-300 font-medium">{detectedFormat?.name || 'Generic File'}</span>
                  <span>·</span>
                  <span className="uppercase text-[10px] tracking-wider font-bold text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                    {detectedFormat?.category || 'file'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                onClick={onClearFile}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Try Sample Files Row */}
      {!currentFile && (
        <div className="pt-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Or test with a ready sample file:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {samples.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => onFileSelected(sample.file)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 text-left transition-all group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{sample.emoji}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-400 transition-colors">
                    {sample.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {sample.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
