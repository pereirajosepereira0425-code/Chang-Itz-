import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { ConversionWorkbench } from './components/ConversionWorkbench';
import { ConversionResultView } from './components/ConversionResultView';
import { BatchConverter } from './components/BatchConverter';
import { InstantStudio } from './components/InstantStudio';
import { FormatExplorer } from './components/FormatExplorer';
import { RandomUnicodeGenerator } from './components/RandomUnicodeGenerator';
import { ConversionLogsModal } from './components/ConversionLogsModal';
import { MascotModal } from './components/MascotModal';
import { Footer } from './components/Footer';
import { FormatDefinition, ConversionParams, ConversionResult, LogEntry } from './types/conversion';
import { detectFormat, FORMATS } from './engine/formats';
import { executeConversion } from './engine/converterRegistry';
import confetti from 'canvas-confetti';
import { createSampleFiles } from './engine/sampleFiles';

export default function App() {
  const [activeTab, setActiveTab] = useState<'convert' | 'batch' | 'studio' | 'matrix' | 'unicode'>('convert');
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [isMascotModalOpen, setIsMascotModalOpen] = useState<boolean>(false);

  // Single conversion state
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<FormatDefinition | null>(null);
  const [targetFormatId, setTargetFormatId] = useState<string>('webp');
  const [params, setParams] = useState<ConversionParams>({});
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'Chang-Itz Universal Core v2.5 initialized. Ready for incoming byte streams.',
    },
  ]);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Handle file selection
  const handleFileSelected = (file: File) => {
    setCurrentFile(file);
    const fmt = detectFormat(file);
    setDetectedFormat(fmt);
    setConversionResult(null);
    setParams({});

    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `File queued: "${file.name}" (${(file.size / 1024).toFixed(1)} KB) ➔ Detected as ${fmt.name}`,
      },
    ]);
  };

  const handleClearFile = () => {
    setCurrentFile(null);
    setDetectedFormat(null);
    setConversionResult(null);
    setParams({});
  };

  // Run single conversion
  const handleConvert = async () => {
    if (!currentFile) return;
    setIsConverting(true);

    try {
      const result = await executeConversion(currentFile, targetFormatId, params);
      setConversionResult(result);
      setLogs((prev) => [...prev, ...result.logs]);

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#06b6d4', '#ec4899'],
      });
    } catch (err: any) {
      const errLog: LogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        level: 'error',
        message: `Conversion failed: ${err.message || 'Unknown error occurred'}`,
      };
      setLogs((prev) => [...prev, errLog]);
      alert(`Conversion Error: ${err.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Switch format from Matrix Explorer
  const handleSelectFormatFromMatrix = (fmt: FormatDefinition) => {
    setActiveTab('convert');
    // Load a corresponding sample file or prompt user
    const samples = createSampleFiles();
    const matchingSample = samples.find((s) => s.category === fmt.category);
    if (matchingSample) {
      handleFileSelected(matchingSample.file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500/20 selection:text-amber-200">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        advancedMode={advancedMode}
        setAdvancedMode={setAdvancedMode}
        onOpenLogs={() => setIsLogsModalOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenMascotModal={() => setIsMascotModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* TAB 1: SINGLE CONVERSION */}
        {activeTab === 'convert' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <DropZone
              currentFile={currentFile}
              detectedFormat={detectedFormat}
              targetFormatId={targetFormatId}
              setTargetFormatId={setTargetFormatId}
              onFileSelected={handleFileSelected}
              onClearFile={handleClearFile}
              onOpenMascotModal={() => setIsMascotModalOpen(true)}
            />

            {currentFile && detectedFormat && !conversionResult && (
              <ConversionWorkbench
                currentFile={currentFile}
                sourceFormat={detectedFormat}
                targetFormatId={targetFormatId}
                setTargetFormatId={setTargetFormatId}
                params={params}
                setParams={setParams}
                isConverting={isConverting}
                onConvert={handleConvert}
                advancedMode={advancedMode}
              />
            )}

            {conversionResult && (
              <ConversionResultView
                result={conversionResult}
                onReset={() => setConversionResult(null)}
                onOpenLogs={() => setIsLogsModalOpen(true)}
                onChooseNewTarget={(newTarget) => {
                  setTargetFormatId(newTarget);
                  setConversionResult(null);
                }}
              />
            )}
          </div>
        )}

        {/* TAB 2: BATCH CONVERTER */}
        {activeTab === 'batch' && <BatchConverter />}

        {/* TAB 3: INSTANT STUDIO */}
        {activeTab === 'studio' && <InstantStudio />}

        {/* TAB 5: FORMAT MATRIX & EXPLORER */}
        {activeTab === 'matrix' && (
          <FormatExplorer onSelectFormatForConvert={handleSelectFormatFromMatrix} />
        )}

        {/* TAB 6: RANDOM UNICODE CHARACTER GENERATOR (PERCHANCE STYLE) */}
        {activeTab === 'unicode' && (
          <RandomUnicodeGenerator
            onSendToConverter={(text, formatId) => {
              const file = new File([text], `unicode_sample_${Date.now()}.txt`, { type: 'text/plain' });
              handleFileSelected(file);
              if (formatId) setTargetFormatId(formatId);
              setActiveTab('convert');
            }}
            onOpenMascotModal={() => setIsMascotModalOpen(true)}
          />
        )}
      </main>

      {/* Chang-Itz Mascot Studio Modal */}
      <MascotModal
        isOpen={isMascotModalOpen}
        onClose={() => setIsMascotModalOpen(false)}
      />

      {/* Terminal Logs Modal */}
      <ConversionLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={logs}
        onClearLogs={() => setLogs([])}
      />

      {/* Help Modal */}
      {isHelpOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsHelpOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md cursor-pointer"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 cursor-default">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <span>⚡ How Chang-Itz Works</span>
              </h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <span>🔒 Privacy-First In-Browser Pipeline</span>
                </h4>
                <p className="text-slate-400">
                  Chang-Itz runs 100% inside your browser using HTML5 Canvas, Web Audio API, Web Workers, and Web Crypto. Your confidential files, photos, data, or source code never leave your machine.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <span>⌨️ Keyboard Shortcuts & Clipboard</span>
                </h4>
                <p className="text-slate-400">
                  You can copy any image or text from another tab or app, then press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-300">Ctrl+V</kbd> anywhere on Chang-Itz to immediately paste and start transforming it!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                  <span>🪄 Instant Studio</span>
                </h4>
                <p className="text-slate-400">
                  Switch to the "Instant Studio" tab if you want to convert text cases, test unit conversions, calculate cryptographic hashes, or synthesize audio tones on the fly without picking a file.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer onSelectTab={(tab) => setActiveTab(tab)} />
    </div>
  );
}
