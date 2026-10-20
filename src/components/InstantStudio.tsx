import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Play,
  Volume2,
  Sparkles,
  RefreshCw,
  Hash,
  Sliders,
  Table,
  FileSpreadsheet,
  Database,
  Search,
  Eye,
  FileCode,
  Heart,
  Upload,
  Layers,
  Terminal,
} from 'lucide-react';
import {
  toSpongebob,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toBinaryText,
  textToMorse,
  textToNato,
} from '../engine/converters/textConverters';
import {
  computeSubtleHash,
  computeMD5,
  computeCRC32,
  generateHexDump,
  applyRot13,
  decodeJwt,
} from '../engine/converters/cryptoConverters';
import {
  parseDelimitedText,
  objectsToDelimited,
  jsonToYaml,
  jsonToXml,
  jsonToSql,
  jsonToMarkdownTable,
  jsonToTypeScript,
  jsonToPython,
  jsonToExcelXml,
  jsonToSqlite,
  jsonToPostgres,
  jsonToNdjson,
  jsonToMongoScript,
  jsonToHtmlSpreadsheet,
  jsonToGraphql,
} from '../engine/converters/dataConverters';
import { UNIT_CATEGORIES, convertUnit } from '../engine/converters/unitConverters';
import { generateMorseAudio, generateToneAudio } from '../engine/converters/audioConverters';
import { generateBruhAudioWav } from '../engine/converters/bruhConverter';
import { convertToDdlcChr, convertFromDdlcChr } from '../engine/converters/ddlcChrConverter';
import { ConversionResult } from '../types/conversion';

export const InstantStudio: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'text' | 'data' | 'units' | 'crypto' | 'audio' | 'bruh' | 'ddlc'
  >('text');

  // Meme & Bruh state
  const [bruhText, setBruhText] = useState('When the code compiles on the first try but fails in production');
  const [bruhPitch, setBruhPitch] = useState<'sub' | 'normal' | 'high'>('normal');

  // Text transformer state
  const [inputText, setInputText] = useState('Chang-Itz is the fastest universal converter on the web!');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Spreadsheet & Database transformer state
  const [dataInput, setDataInput] = useState(`[
  { "id": 101, "item": "Quantum Processor M4", "category": "Hardware", "price": 899.50, "in_stock": true, "rating": 4.9 },
  { "id": 102, "item": "Holographic Display X", "category": "Optics", "price": 420.00, "in_stock": true, "rating": 4.7 },
  { "id": 103, "item": "Superconductor Cable", "category": "Wiring", "price": 65.25, "in_stock": false, "rating": 4.2 },
  { "id": 104, "item": "Neural Bus Interface", "category": "Embedded", "price": 1250.00, "in_stock": true, "rating": 5.0 }
]`);
  const [dataTarget, setDataTarget] = useState<
    'excel' | 'sqlite' | 'postgres' | 'jsonl' | 'mongodb' | 'html' | 'graphql' | 'csv' | 'tsv' | 'sql' | 'yaml' | 'xml' | 'mdtable' | 'typescript' | 'python'
  >('excel');
  const [dataOutput, setDataOutput] = useState('');
  const [dataViewMode, setDataViewMode] = useState<'code' | 'grid'>('code');
  const [parsedGridRows, setParsedGridRows] = useState<any[]>([]);

  // Unit converter state
  const [unitCategory, setUnitCategory] = useState('storage');
  const [unitValue, setUnitValue] = useState(1024);
  const [unitFrom, setUnitFrom] = useState('mb');
  const [unitTo, setUnitTo] = useState('gb');
  const [unitSearch, setUnitSearch] = useState('');

  // Crypto state
  const [cryptoInput, setCryptoInput] = useState('chang_itz_secure_token_2026');
  const [hashes, setHashes] = useState({ sha256: '', sha512: '', sha1: '', md5: '', crc32: '' });

  // Audio tone state
  const [audioFreq, setAudioFreq] = useState(440);
  const [toneDuration, setToneDuration] = useState(2);

  // DDLC .chr state
  const [ddlcChar, setDdlcChar] = useState<'monika' | 'sayori' | 'yuri' | 'natsuki' | 'custom'>('monika');
  const [ddlcCustomName, setDdlcCustomName] = useState('custom_member');
  const [ddlcSecretNote, setDdlcSecretNote] = useState('There is a secret world beyond the script...');
  const [ddlcRevealedResult, setDdlcRevealedResult] = useState<ConversionResult | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Compute live data transformations
  useEffect(() => {
    try {
      let parsed: any;
      if (dataInput.trim().startsWith('[') || dataInput.trim().startsWith('{')) {
        parsed = JSON.parse(dataInput);
      } else {
        parsed = parseDelimitedText(dataInput, ',');
      }

      const arr = Array.isArray(parsed) ? parsed : [parsed];
      setParsedGridRows(arr);

      switch (dataTarget) {
        case 'excel':
          setDataOutput(jsonToExcelXml(arr, 'Inventory'));
          break;
        case 'sqlite':
          setDataOutput(jsonToSqlite(arr, 'inventory'));
          break;
        case 'postgres':
          setDataOutput(jsonToPostgres(arr, 'inventory'));
          break;
        case 'jsonl':
          setDataOutput(jsonToNdjson(arr));
          break;
        case 'mongodb':
          setDataOutput(jsonToMongoScript(arr, 'inventory'));
          break;
        case 'html':
          setDataOutput(jsonToHtmlSpreadsheet(arr, 'Inventory'));
          break;
        case 'graphql':
          setDataOutput(jsonToGraphql(arr, 'InventoryItem'));
          break;
        case 'csv':
          setDataOutput(objectsToDelimited(arr, ','));
          break;
        case 'tsv':
          setDataOutput(objectsToDelimited(arr, '\t'));
          break;
        case 'sql':
          setDataOutput(jsonToSql(arr, 'inventory'));
          break;
        case 'yaml':
          setDataOutput(jsonToYaml(parsed));
          break;
        case 'xml':
          setDataOutput(`<?xml version="1.0" encoding="UTF-8"?>\n${jsonToXml(parsed)}`);
          break;
        case 'mdtable':
          setDataOutput(jsonToMarkdownTable(arr));
          break;
        case 'typescript':
          setDataOutput(jsonToTypeScript(arr, 'InventoryItem'));
          break;
        case 'python':
          setDataOutput(jsonToPython(parsed));
          break;
        default:
          setDataOutput(JSON.stringify(arr, null, 2));
      }
    } catch (err: any) {
      setDataOutput(`// Error parsing input: ${err.message}`);
      setParsedGridRows([]);
    }
  }, [dataInput, dataTarget]);

  // Compute live hashes
  useEffect(() => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(cryptoInput);

    computeSubtleHash(bytes.buffer, 'SHA-256').then((sha256) => {
      computeSubtleHash(bytes.buffer, 'SHA-512').then((sha512) => {
        computeSubtleHash(bytes.buffer, 'SHA-1').then((sha1) => {
          setHashes({
            sha256,
            sha512,
            sha1,
            md5: computeMD5(bytes),
            crc32: computeCRC32(bytes),
          });
        });
      });
    });
  }, [cryptoInput]);

  // Current units list
  const currentCategoryObj = UNIT_CATEGORIES.find((c) => c.id === unitCategory) || UNIT_CATEGORIES[0];
  const currentUnits = currentCategoryObj.units;
  const convertedUnitValue = convertUnit(unitValue, unitCategory, unitFrom, unitTo);

  // Filter categories by search
  const filteredCategories = UNIT_CATEGORIES.filter((c) => {
    if (!unitSearch.trim()) return true;
    const q = unitSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.units.some((u) => u.name.toLowerCase().includes(q) || u.symbol.toLowerCase().includes(q));
  });

  // Play audio tone
  const playTone = () => {
    const audioBlob = generateToneAudio(audioFreq, toneDuration);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  };

  // Play Bruh sound
  const playBruh = () => {
    const pitchMap = { sub: 0.65, normal: 1.0, high: 1.45 };
    const blob = generateBruhAudioWav(pitchMap[bruhPitch], 44100);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  };

  // Download converted dataset
  const downloadDataset = () => {
    const extMap: Record<string, string> = {
      excel: '.xml',
      sqlite: '.sql',
      postgres: '.sql',
      jsonl: '.jsonl',
      mongodb: '.js',
      html: '.html',
      graphql: '.graphql',
      csv: '.csv',
      tsv: '.tsv',
      sql: '.sql',
      yaml: '.yaml',
      xml: '.xml',
      mdtable: '.md',
      typescript: '.ts',
      python: '.py',
    };
    const ext = extMap[dataTarget] || '.txt';
    const blob = new Blob([dataOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chang_itz_export${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Preset Datasets
  const loadPresetData = (type: 'orders' | 'employees' | 'crypto' | 'servers') => {
    if (type === 'orders') {
      setDataInput(JSON.stringify([
        { order_id: 'ORD-9821', customer: 'Alice Wong', country: 'CA', amount: 142.50, status: 'Shipped', items: 3 },
        { order_id: 'ORD-9822', customer: 'David Miller', country: 'US', amount: 289.00, status: 'Processing', items: 5 },
        { order_id: 'ORD-9823', customer: 'Elena Rostova', country: 'DE', amount: 59.90, status: 'Delivered', items: 1 },
        { order_id: 'ORD-9824', customer: 'Tariq Al-Mansoor', country: 'AE', amount: 480.00, status: 'Shipped', items: 6 }
      ], null, 2));
    } else if (type === 'employees') {
      setDataInput(JSON.stringify([
        { emp_id: 'EMP-01', name: 'Sophia Chen', role: 'Staff Engineer', department: 'Platform Core', salary: 165000, active: true },
        { emp_id: 'EMP-02', name: 'Marcus Vance', role: 'Security Architect', department: 'InfraSec', salary: 172000, active: true },
        { emp_id: 'EMP-03', name: 'Amara Okafor', role: 'Lead Designer', department: 'UI/UX Lab', salary: 148000, active: true }
      ], null, 2));
    } else if (type === 'crypto') {
      setDataInput(JSON.stringify([
        { symbol: 'BTC', name: 'Bitcoin', holdings: 1.45, price_usd: 67450.00, change_24h: 3.42 },
        { symbol: 'ETH', name: 'Ethereum', holdings: 18.20, price_usd: 3520.80, change_24h: -1.15 },
        { symbol: 'SOL', name: 'Solana', holdings: 140.00, price_usd: 154.60, change_24h: 8.90 }
      ], null, 2));
    } else {
      setDataInput(JSON.stringify([
        { host: 'us-east-cluster-01', cpu_pct: 42.1, ram_pct: 68.4, latency_ms: 12, health: 'OK' },
        { host: 'eu-west-cluster-04', cpu_pct: 78.9, ram_pct: 84.1, latency_ms: 28, health: 'WARNING' },
        { host: 'ap-south-cluster-02', cpu_pct: 22.4, ram_pct: 39.0, latency_ms: 8, health: 'OK' }
      ], null, 2));
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-slate-800 text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-100 flex items-center justify-center gap-2">
          <span>⚡</span>
          <span>Chang-Itz Instant Media & Data Studio</span>
        </h2>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Universal instant generators, live spreadsheet database engine, DDLC .chr secret revealer, and acoustic synthesizers running directly in your browser.
        </p>

        {/* Sub-Tabs Nav */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pt-4 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('text')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'text'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>📝</span>
            <span>Text & Case Styler</span>
          </button>

          <button
            onClick={() => setActiveSubTab('data')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'data'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>📊</span>
            <span>Spreadsheet & Database</span>
          </button>

          <button
            onClick={() => setActiveSubTab('units')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'units'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>📏</span>
            <span>Universal Units (14 Cats)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ddlc')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'ddlc'
                ? 'bg-pink-500 text-white font-bold shadow-md shadow-pink-500/25'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🎀</span>
            <span>DDLC .chr Studio</span>
          </button>

          <button
            onClick={() => setActiveSubTab('crypto')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'crypto'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🔐</span>
            <span>Crypto & Hashes</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audio')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'audio'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🔊</span>
            <span>Tone Synthesizer</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bruh')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'bruh'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🗿</span>
            <span>.BRUH & Media Lab</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: TEXT & CASE STYLER */}
      {activeSubTab === 'text' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>📝</span>
                <span>Type Any Text to Convert Instantly</span>
              </label>
              <span className="text-xs font-mono text-slate-500">{inputText.length} characters</span>
            </div>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-sans text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
              placeholder="Enter text..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'spongebob', label: 'sPoNgEbOb cAsE', emoji: '🧽', val: toSpongebob(inputText) },
              { id: 'camel', label: 'camelCase', emoji: '🐪', val: toCamelCase(inputText) },
              { id: 'snake', label: 'snake_case', emoji: '🐍', val: toSnakeCase(inputText) },
              { id: 'kebab', label: 'kebab-case', emoji: '🍢', val: toKebabCase(inputText) },
              { id: 'binary', label: 'Binary ASCII (8-Bit)', emoji: '0️⃣', val: toBinaryText(inputText) },
              { id: 'morse', label: 'Morse Code Audio / Dots', emoji: '📻', val: textToMorse(inputText) },
              { id: 'nato', label: 'NATO Phonetic Alphabet', emoji: '✈️', val: textToNato(inputText) },
              { id: 'rot13', label: 'ROT-13 Cipher', emoji: '🔄', val: applyRot13(inputText) },
            ].map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(item.val, item.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Copy"
                  >
                    {copiedKey === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs text-amber-400/90 break-all select-all max-h-24 overflow-y-auto">
                  {item.val || '(empty)'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SPREADSHEET & DATABASE STUDIO */}
      {activeSubTab === 'data' && (
        <div className="space-y-5">
          {/* Preset Buttons & Output Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <span>📊</span>
                  <span>Sample Datasets:</span>
                </span>
                <div className="flex items-center gap-1 flex-wrap text-xs">
                  <button
                    onClick={() => loadPresetData('orders')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    🛒 E-Commerce Orders
                  </button>
                  <button
                    onClick={() => loadPresetData('employees')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    👥 Employee Roster
                  </button>
                  <button
                    onClick={() => loadPresetData('crypto')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    🪙 Crypto Ledger
                  </button>
                  <button
                    onClick={() => loadPresetData('servers')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    🖥️ Server Metrics
                  </button>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setDataViewMode('code')}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    dataViewMode === 'code' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Code View</span>
                </button>
                <button
                  onClick={() => setDataViewMode('grid')}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    dataViewMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Spreadsheet Grid</span>
                </button>
              </div>
            </div>

            {/* Target Representation Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pt-1 pb-1">
              {[
                { id: 'excel', label: 'Excel XML Spreadsheet', emoji: '📗' },
                { id: 'sqlite', label: 'SQLite DDL & Dump', emoji: '🗃️' },
                { id: 'postgres', label: 'PostgreSQL Schema', emoji: '🐘' },
                { id: 'jsonl', label: 'JSON Lines / NDJSON', emoji: '📑' },
                { id: 'mongodb', label: 'MongoDB Script', emoji: '🍃' },
                { id: 'html', label: 'HTML Spreadsheet', emoji: '🌐' },
                { id: 'graphql', label: 'GraphQL Schema', emoji: '🕸️' },
                { id: 'csv', label: 'CSV Table', emoji: '📊' },
                { id: 'tsv', label: 'TSV Delimited', emoji: '📑' },
                { id: 'sql', label: 'MySQL INSERTs', emoji: '🗄️' },
                { id: 'yaml', label: 'YAML Config', emoji: '⚙️' },
                { id: 'xml', label: 'XML Tree', emoji: '🌳' },
                { id: 'mdtable', label: 'Markdown Table', emoji: '📋' },
                { id: 'typescript', label: 'TypeScript Interface', emoji: '🔷' },
                { id: 'python', label: 'Python Dict', emoji: '🐍' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDataTarget(opt.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                    dataTarget === opt.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Spreadsheet Grid View */}
          {dataViewMode === 'grid' && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Spreadsheet Table ({parsedGridRows.length} Records)</span>
                </span>
                <button
                  onClick={downloadDataset}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Converted File</span>
                </button>
              </div>

              {parsedGridRows.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 max-h-[460px] scrollbar-thin">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 sticky top-0">
                        <th className="py-2.5 px-3 w-12 text-center text-slate-600">#</th>
                        {Object.keys(parsedGridRows[0] || {}).map((col) => (
                          <th key={col} className="py-2.5 px-3 text-slate-200 font-semibold border-r border-slate-800/60 last:border-none">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-mono">
                      {parsedGridRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-amber-500/5 transition-colors">
                          <td className="py-2 px-3 text-center text-slate-600 bg-slate-900/40 select-none">
                            {idx + 1}
                          </td>
                          {Object.keys(parsedGridRows[0] || {}).map((col) => {
                            const val = row[col];
                            const isNum = typeof val === 'number';
                            const isBool = typeof val === 'boolean';
                            return (
                              <td
                                key={col}
                                className={`py-2 px-3 border-r border-slate-800/40 last:border-none select-all ${
                                  isNum ? 'text-amber-400' : isBool ? (val ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-300'
                                }`}
                              >
                                {isBool ? (val ? 'TRUE' : 'FALSE') : String(val ?? '')}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Enter valid JSON or CSV array in the editor to inspect the spreadsheet table grid.
                </div>
              )}
            </div>
          )}

          {/* Code Input and Output View */}
          {dataViewMode === 'code' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Input Data (JSON or CSV)</label>
                  <span className="text-[11px] font-mono text-slate-500">{dataInput.length} chars</span>
                </div>
                <textarea
                  rows={14}
                  value={dataInput}
                  onChange={(e) => setDataInput(e.target.value)}
                  className="w-full flex-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500 leading-relaxed scrollbar-thin"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400">
                    Converted {dataTarget.toUpperCase()} ({dataOutput.length} chars)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyToClipboard(dataOutput, 'dataOut')}
                      className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
                    >
                      {copiedKey === 'dataOut' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={downloadDataset}
                      className="px-2.5 py-1 text-xs font-mono rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 font-bold"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <textarea
                  readOnly
                  rows={14}
                  value={dataOutput}
                  className="w-full flex-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300/90 focus:outline-none leading-relaxed scrollbar-thin select-all"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: UNIVERSAL UNIT CONVERTER */}
      {activeSubTab === 'units' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          {/* Unit Search & Category Pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search unit categories or symbols (e.g., 'light years', 'celsius', 'petabyte', 'psi')..."
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setUnitCategory(cat.id);
                    setUnitFrom(cat.units[0].id);
                    setUnitTo(cat.units[1]?.id || cat.units[0].id);
                  }}
                  className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    unitCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-6 bg-slate-950 rounded-xl border border-slate-800">
            {/* From */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Source Value</span>
                <span className="text-amber-500">{currentCategoryObj.name}</span>
              </label>
              <input
                type="number"
                value={unitValue}
                onChange={(e) => setUnitValue(parseFloat(e.target.value) || 0)}
                className="w-full text-2xl font-bold font-mono bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <select
                value={unitFrom}
                onChange={(e) => setUnitFrom(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200"
              >
                {currentUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* To */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>Converted Output</span>
                <button
                  onClick={() => copyToClipboard(String(convertedUnitValue), 'unitVal')}
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1"
                >
                  {copiedKey === 'unitVal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </label>
              <div className="w-full text-2xl font-bold font-mono bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-300 truncate select-all">
                {convertedUnitValue.toLocaleString(undefined, { maximumFractionDigits: 8 })}
              </div>
              <select
                value={unitTo}
                onChange={(e) => setUnitTo(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200"
              >
                {currentUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DDLC .CHR CHARACTER STUDIO */}
      {activeSubTab === 'ddlc' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-red-500/10 border border-pink-500/30 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎀</span>
                <div>
                  <h3 className="text-lg font-black text-slate-100">
                    Doki Doki Literature Club Character (.chr) Studio
                  </h3>
                  <p className="text-xs text-slate-400">
                    Create authentic DDLC steganographic character files or unpack and reveal hidden PNGs, audio, and cipher stories!
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs font-bold">
                Team Salvato Steganography Engine
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DDLC Generator Panel */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎀</span>
                <span>Generate Official .chr File</span>
              </h4>

              {/* Character Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold">Select Member:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'monika', label: 'Monika', emoji: '🎀', file: 'monika.chr', format: 'PNG container' },
                    { id: 'sayori', label: 'Sayori', emoji: '☀️', file: 'sayori.chr', format: 'Spectrogram audio' },
                    { id: 'yuri', label: 'Yuri', emoji: '📖', file: 'yuri.chr', format: 'Base64 cipher' },
                    { id: 'natsuki', label: 'Natsuki', emoji: '🧁', file: 'natsuki.chr', format: 'Inverted texture' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setDdlcChar(m.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        ddlcChar === m.id
                          ? 'bg-pink-500/20 border-pink-500 text-pink-200 shadow-md shadow-pink-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-200">
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </div>
                      <div className="text-[10px] text-pink-400 font-mono">{m.file}</div>
                      <div className="text-[9px] text-slate-500">{m.format}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Secret Payload Note */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-semibold">Secret Embedded Note / Poem:</label>
                <textarea
                  rows={3}
                  value={ddlcSecretNote}
                  onChange={(e) => setDdlcSecretNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-pink-500 resize-none"
                  placeholder="Enter secret message to embed in .chr..."
                />
              </div>

              {/* Generate & Download Button */}
              <button
                onClick={async () => {
                  const dummyFile = new File([ddlcSecretNote], `${ddlcChar}_note.txt`, { type: 'text/plain' });
                  const result = await convertToDdlcChr(dummyFile, ddlcChar);
                  const a = document.createElement('a');
                  a.href = result.previewUrl || '';
                  a.download = result.outputName;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/30 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Synthesize & Download {ddlcChar}.chr</span>
              </button>
            </div>

            {/* DDLC Secret Revealer & Unpacker */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Unpack & Reveal .chr Secrets</span>
                </h4>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={async () => {
                      // Minimal PNG disguised as monika.chr
                      const monikaBytes = new Uint8Array([
                        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
                        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
                        0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x40,
                        0x08, 0x06, 0x00, 0x00, 0x00, 0xaa, 0x69, 0x71, 0xde,
                        0x00, 0x00, 0x00, 0x1b, 0x74, 0x45, 0x58, 0x74,
                        0x54, 0x69, 0x74, 0x6c, 0x65, 0x00,
                        0x4a, 0x75, 0x73, 0x74, 0x20, 0x4d, 0x6f, 0x6e, 0x69, 0x6b, 0x61, 0x2e, 0x20, 0x44, 0x44, 0x4c, 0x43,
                        0x39, 0x55, 0x45, 0x30,
                        0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54,
                        0x78, 0x9c, 0x63, 0x60, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33,
                        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
                      ]);
                      const f = new File([monikaBytes], 'monika.chr', { type: 'application/octet-stream' });
                      const res = await convertFromDdlcChr(f, 'png');
                      setDdlcRevealedResult(res);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-pink-300 text-[11px] font-semibold"
                  >
                    Load monika.chr
                  </button>

                  <button
                    onClick={async () => {
                      const yuriStory = `=== DOKI DOKI LITERATURE CLUB - YURI.CHR ===\n[ENCRYPTED POEM STREAM]\nV2hlbiB0aGUgcmFpbiBiZWdpbnMgdG8gZmFsbCwgSSBjbG9zZSBteSBleWVzIGFuZCBsaXN0ZW4gdG8gdGhlIGRyb3BzLiBUaGV5IHNvdW5kIGxpa2UgdGhlIHNvZnQgd2hpc3BlcnMgb2YgYSBwYXN0IHRoYXQgd2FzIG5ldmVyIG1pbmUuIC0gWXVyaQ==\n=== END OF FILE ===`;
                      const f = new File([yuriStory], 'yuri.chr', { type: 'application/octet-stream' });
                      const res = await convertFromDdlcChr(f, 'txt');
                      setDdlcRevealedResult(res);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] font-semibold"
                  >
                    Load yuri.chr
                  </button>
                </div>
              </div>

              {/* Upload Input */}
              <label className="border-2 border-dashed border-slate-800 hover:border-pink-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950">
                <Upload className="w-5 h-5 text-slate-500 mb-1" />
                <span className="text-xs font-semibold text-slate-300">Drop your .chr file here to inspect</span>
                <span className="text-[10px] text-slate-500">Unpacks hidden PNGs, audio streams, or cipher text</span>
                <input
                  type="file"
                  accept=".chr"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const res = await convertFromDdlcChr(f, 'auto');
                      setDdlcRevealedResult(res);
                    }
                  }}
                />
              </label>

              {/* Revealed Output */}
              {ddlcRevealedResult && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Revealed: {ddlcRevealedResult.outputName}</span>
                    </span>
                    {ddlcRevealedResult.previewUrl && (
                      <a
                        href={ddlcRevealedResult.previewUrl}
                        download={ddlcRevealedResult.outputName}
                        className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    )}
                  </div>

                  {ddlcRevealedResult.previewType === 'image' && ddlcRevealedResult.previewUrl && (
                    <div className="flex items-center justify-center p-3 bg-slate-900 rounded-lg">
                      <img
                        src={ddlcRevealedResult.previewUrl}
                        alt="Revealed DDLC Secret"
                        className="max-h-36 rounded shadow-md object-contain"
                      />
                    </div>
                  )}

                  {ddlcRevealedResult.previewType === 'audio' && ddlcRevealedResult.previewUrl && (
                    <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-center">
                      <audio controls src={ddlcRevealedResult.previewUrl} className="w-full" />
                    </div>
                  )}

                  {ddlcRevealedResult.textContent && (
                    <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-pink-300 whitespace-pre-wrap max-h-36 overflow-y-auto select-all">
                      {ddlcRevealedResult.textContent}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: CRYPTO & HASHES */}
      {activeSubTab === 'crypto' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300">
              Input String or Secret Key
            </label>
            <input
              type="text"
              value={cryptoInput}
              onChange={(e) => setCryptoInput(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            {[
              { label: 'SHA-256 Hash', key: 'sha256', val: hashes.sha256 },
              { label: 'SHA-512 Hash', key: 'sha512', val: hashes.sha512 },
              { label: 'SHA-1 Hash', key: 'sha1', val: hashes.sha1 },
              { label: 'MD5 Hash', key: 'md5', val: hashes.md5 },
              { label: 'CRC-32 Checksum', key: 'crc32', val: hashes.crc32 },
            ].map((h) => (
              <div
                key={h.key}
                className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between gap-4 font-mono text-xs"
              >
                <div className="w-36 text-slate-400 font-bold shrink-0">{h.label}:</div>
                <div className="truncate text-amber-400/90 select-all flex-1 text-right">{h.val}</div>
                <button
                  onClick={() => copyToClipboard(h.val, h.key)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 shrink-0"
                >
                  {copiedKey === h.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: AUDIO TONE SYNTHESIZER */}
      {activeSubTab === 'audio' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 flex justify-between">
                  <span>Frequency (Hz)</span>
                  <span className="font-mono text-amber-400">{audioFreq} Hz</span>
                </label>
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={10}
                  value={audioFreq}
                  onChange={(e) => setAudioFreq(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 mt-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 flex justify-between">
                  <span>Duration (Seconds)</span>
                  <span className="font-mono text-amber-400">{toneDuration}s</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={toneDuration}
                  onChange={(e) => setToneDuration(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 mt-2"
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={playTone}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Tone Live</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-center items-center text-center space-y-2">
              <Volume2 className="w-12 h-12 text-amber-500/60 animate-pulse" />
              <div className="text-xs font-bold text-slate-300">Pure Sine Wave WebAudio Synthesizer</div>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Generated via browser AudioContext oscillator with envelope shaping.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: THE .BRUH & EXTENDED MEDIA LAB */}
      {activeSubTab === 'bruh' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                <span>🗿</span>
                <span>The Legendary .BRUH Container & Synthesizer</span>
              </div>
              <h3 className="text-xl font-black text-slate-100">
                Official Bruh Soundboard & Format Engine
              </h3>
              <p className="text-xs text-slate-400 max-w-lg">
                Generates certified .bruh files with embedded ASCII stone-face monuments, meme translation, and 16-bit 44.1kHz acoustic down-pitched BRUH audio.
              </p>
            </div>

            <button
              onClick={playBruh}
              className="relative group shrink-0 w-28 h-28 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-1 shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center text-center p-2 group-hover:bg-slate-900 transition-colors">
                <span className="text-3xl">🗿</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 mt-1">BRUH</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <label className="text-xs font-bold text-slate-300">Acoustic Pitch Control</label>
              <div className="flex items-center gap-2 text-xs">
                {(['sub', 'normal', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setBruhPitch(p)}
                    className={`flex-1 py-2 rounded-xl font-bold capitalize transition-all ${
                      bruhPitch === p ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p === 'sub' ? 'Deep Sub' : p === 'normal' ? 'Classic' : 'Chipmunk'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const blob = generateBruhAudioWav(1.0, 44100);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'bruh_sound_effect.wav';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .WAV Audio</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <label className="text-xs font-bold text-slate-300">Transform Text to .BRUH</label>
              <textarea
                value={bruhText}
                onChange={(e) => setBruhText(e.target.value)}
                rows={3}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-amber-500 font-mono resize-none"
              />
              <button
                type="button"
                onClick={() => {
                  const bruhBlob = new Blob([`🗿 OFFICIAL .BRUH CONTAINER\nVerdict: CERTIFIED BRUH MOMENT\nMessage: ${bruhText}\nTimestamp: ${new Date().toISOString()}`], { type: 'text/plain' });
                  const url = URL.createObjectURL(bruhBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'moment.bruh';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export as .BRUH File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
