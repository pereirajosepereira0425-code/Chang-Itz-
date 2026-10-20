import React, { useState, useRef } from 'react';
import { Upload, Play, Download, Trash2, CheckCircle2, AlertCircle, FileArchive, ArrowRight } from 'lucide-react';
import { ConversionJob } from '../types/conversion';
import { FORMATS, detectFormat } from '../engine/formats';
import { getAvailableTargets, executeConversion } from '../engine/converterRegistry';
import { createZipArchive } from '../engine/converters/archiveConverters';
import confetti from 'canvas-confetti';

export const BatchConverter: React.FC = () => {
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newJobs: ConversionJob[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const srcFmt = detectFormat(file);
      const targets = getAvailableTargets(srcFmt.id);
      const defaultTarget = targets[0] || 'zip';

      newJobs.push({
        id: `${file.name}-${Date.now()}-${i}`,
        file,
        sourceFormat: srcFmt.id,
        targetFormat: defaultTarget,
        status: 'idle',
        progress: 0,
        params: {},
      });
    }

    setJobs((prev) => [...prev, ...newJobs]);
  };

  const handleRemoveJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleTargetChange = (jobId: string, newTarget: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, targetFormat: newTarget } : j))
    );
  };

  const handleConvertAll = async () => {
    if (jobs.length === 0 || isProcessing) return;
    setIsProcessing(true);

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      if (job.status === 'success') continue;

      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: 'converting', progress: 30 } : j))
      );

      try {
        const result = await executeConversion(job.file, job.targetFormat, job.params);
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: 'success', progress: 100, result } : j))
        );
      } catch (err: any) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id ? { ...j, status: 'error', progress: 0, error: err.message } : j
          )
        );
      }
    }

    setIsProcessing(false);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
  };

  const handleDownloadAllAsZip = async () => {
    const completedJobs = jobs.filter((j) => j.status === 'success' && j.result);
    if (completedJobs.length === 0) return;

    const filesToZip: File[] = [];
    for (const j of completedJobs) {
      const res = j.result!;
      let fileBlob: Blob;
      if (typeof res.data === 'string') {
        fileBlob = new Blob([res.data], { type: res.mimeType });
      } else {
        fileBlob = res.data as Blob;
      }
      filesToZip.push(new File([fileBlob], res.outputName, { type: res.mimeType }));
    }

    const zipResult = await createZipArchive(filesToZip, 'chang_itz_batch_results.zip');
    const url = URL.createObjectURL(zipResult.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipResult.outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const completedCount = jobs.filter((j) => j.status === 'success').length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Batch Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>📦 Batch Converter Engine</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {jobs.length} in queue
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Convert hundreds of files simultaneously with parallel execution & single ZIP package export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Add Files</span>
          </button>

          {jobs.length > 0 && (
            <button
              onClick={() => setJobs([])}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Queue Items */}
      {jobs.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/30 cursor-pointer dropzone-stripes transition-colors group"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
            📦
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-1">Queue is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Click here to select multiple files at once, or drag and drop your whole folder.
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md">
            <span>Select Multiple Files</span>
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800/80 overflow-hidden">
            {jobs.map((job) => {
              const srcFmt = FORMATS[job.sourceFormat] || FORMATS.txt;
              const targets = getAvailableTargets(job.sourceFormat);
              const targetFmt = FORMATS[job.targetFormat] || FORMATS.png;

              return (
                <div key={job.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl">{srcFmt.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate max-w-xs sm:max-w-md">
                        {job.file.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {(job.file.size / 1024).toFixed(1)} KB · {srcFmt.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Target Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">➔</span>
                      <select
                        value={job.targetFormat}
                        disabled={job.status === 'converting'}
                        onChange={(e) => handleTargetChange(job.id, e.target.value)}
                        className="text-xs font-semibold bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        {targets.map((tId) => {
                          const fmt = FORMATS[tId];
                          if (!fmt) return null;
                          return (
                            <option key={tId} value={tId}>
                              {fmt.emoji} {fmt.name} ({fmt.extension})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2">
                      {job.status === 'success' && (
                        <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Done
                        </span>
                      )}

                      {job.status === 'converting' && (
                        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      )}

                      {job.status === 'error' && (
                        <span className="text-red-400 flex items-center gap-1 text-xs font-bold" title={job.error}>
                          <AlertCircle className="w-3.5 h-3.5" />
                          Failed
                        </span>
                      )}

                      <button
                        onClick={() => handleRemoveJob(job.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Batch Actions Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="text-xs text-slate-400">
              <span className="font-bold text-slate-200">{completedCount} of {jobs.length}</span> files transformed
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {completedCount > 0 && (
                <button
                  onClick={handleDownloadAllAsZip}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105"
                >
                  <FileArchive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </button>
              )}

              <button
                disabled={isProcessing || jobs.length === 0}
                onClick={handleConvertAll}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                  isProcessing
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 hover:scale-105 active:scale-95'
                }`}
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{isProcessing ? 'Converting Queue...' : 'Convert All Files'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
