import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  Calculator,
  Moon,
  Clock,
  Eye,
  Settings2,
  QrCode,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  Play,
  Pause,
  Volume2,
  FileText,
  Save,
  ArrowRight,
  Globe,
  Flame,
  Car,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseIni, formatToIni } from '../engine/converters/iniConverter';

interface EverydayLifeHubProps {
  onSendToConverter?: (file: File, targetFormat?: string) => void;
}

export const EverydayLifeHub: React.FC<EverydayLifeHubProps> = ({ onSendToConverter }) => {
  const [subTab, setSubTab] = useState<'kitchen' | 'split' | 'sleep' | 'ini' | 'tools'>('kitchen');

  // Play gentle Web Audio chime
  const playChime = (type: 'success' | 'timer' | 'click' = 'success') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else if (type === 'timer') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.52);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      }
    } catch {
      // AudioContext policy fallback
    }
  };

  // =========================================================================
  // SECTION 1: KITCHEN & RECIPE SCALER
  // =========================================================================
  const [originalServings, setOriginalServings] = useState<number>(4);
  const [targetServings, setTargetServings] = useState<number>(6);
  const [recipeIngredients, setRecipeIngredients] = useState<Array<{ id: string; name: string; amount: number; unit: string }>>([
    { id: '1', name: 'All-Purpose Flour', amount: 2, unit: 'cups' },
    { id: '2', name: 'Granulated Sugar', amount: 0.75, unit: 'cup' },
    { id: '3', name: 'Unsalted Butter', amount: 0.5, unit: 'cup' },
    { id: '4', name: 'Baking Powder', amount: 2, unit: 'tsp' },
    { id: '5', name: 'Salt', amount: 0.5, unit: 'tsp' },
    { id: '6', name: 'Whole Milk', amount: 1, unit: 'cup' },
  ]);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientAmount, setNewIngredientAmount] = useState<number>(1);
  const [newIngredientUnit, setNewIngredientUnit] = useState('cups');

  // Oven Temperature Quick Converter
  const [ovenTempF, setOvenTempF] = useState<number>(350);
  const ovenTempC = Math.round(((ovenTempF - 32) * 5) / 9);
  const ovenTempFan = Math.round(ovenTempC - 20);
  const ovenGasMark = useMemo(() => {
    if (ovenTempF < 275) return '1/4';
    if (ovenTempF < 300) return '1/2';
    if (ovenTempF < 325) return '1';
    if (ovenTempF < 350) return '2';
    if (ovenTempF < 375) return '3';
    if (ovenTempF < 400) return '4';
    if (ovenTempF < 425) return '6';
    if (ovenTempF < 450) return '7';
    if (ovenTempF < 475) return '8';
    return '9+';
  }, [ovenTempF]);

  const scaleRatio = targetServings > 0 && originalServings > 0 ? targetServings / originalServings : 1;

  const addIngredient = () => {
    if (!newIngredientName.trim()) return;
    setRecipeIngredients((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: newIngredientName.trim(),
        amount: Number(newIngredientAmount) || 1,
        unit: newIngredientUnit,
      },
    ]);
    setNewIngredientName('');
    playChime('click');
  };

  const removeIngredient = (id: string) => {
    setRecipeIngredients((prev) => prev.filter((item) => item.id !== id));
    playChime('click');
  };

  // Convert decimal to clean kitchen fraction
  const formatFraction = (val: number): string => {
    if (val === 0) return '0';
    const whole = Math.floor(val);
    const remainder = val - whole;

    if (remainder < 0.08) return whole > 0 ? `${whole}` : '0';
    if (remainder >= 0.08 && remainder < 0.19) return whole > 0 ? `${whole} 1/8` : '1/8';
    if (remainder >= 0.19 && remainder < 0.3) return whole > 0 ? `${whole} 1/4` : '1/4';
    if (remainder >= 0.3 && remainder < 0.42) return whole > 0 ? `${whole} 1/3` : '1/3';
    if (remainder >= 0.42 && remainder < 0.58) return whole > 0 ? `${whole} 1/2` : '1/2';
    if (remainder >= 0.58 && remainder < 0.7) return whole > 0 ? `${whole} 2/3` : '2/3';
    if (remainder >= 0.7 && remainder < 0.83) return whole > 0 ? `${whole} 3/4` : '3/4';
    if (remainder >= 0.83 && remainder < 0.95) return whole > 0 ? `${whole} 7/8` : '7/8';
    return `${whole + 1}`;
  };

  // =========================================================================
  // SECTION 2: BILL & TIP SPLITTER + ROAD TRIP FUEL
  // =========================================================================
  const [billAmount, setBillAmount] = useState<number>(84.5);
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [taxPercent, setTaxPercent] = useState<number>(8.5);
  const [numPeople, setNumPeople] = useState<number>(3);
  const [roundUp, setRoundUp] = useState<boolean>(true);

  // Tip calculations
  const taxAmount = (billAmount * taxPercent) / 100;
  const rawTipAmount = (billAmount * tipPercent) / 100;
  const preTotal = billAmount + taxAmount + rawTipAmount;
  const finalTotal = roundUp ? Math.ceil(preTotal) : preTotal;
  const tipAmount = roundUp ? finalTotal - (billAmount + taxAmount) : rawTipAmount;
  const perPersonTotal = numPeople > 0 ? finalTotal / numPeople : 0;
  const perPersonTip = numPeople > 0 ? tipAmount / numPeople : 0;

  // Road Trip Calculations
  const [tripMiles, setTripMiles] = useState<number>(320);
  const [vehicleMpg, setVehicleMpg] = useState<number>(28);
  const [gasPricePerGallon, setGasPricePerGallon] = useState<number>(3.65);
  const [tripPassengers, setTripPassengers] = useState<number>(4);

  const totalGallons = vehicleMpg > 0 ? tripMiles / vehicleMpg : 0;
  const totalFuelCost = totalGallons * gasPricePerGallon;
  const costPerPassenger = tripPassengers > 0 ? totalFuelCost / tripPassengers : totalFuelCost;
  const co2Kilos = totalGallons * 8.887; // EPA standard kg CO2 per gallon

  // =========================================================================
  // SECTION 3: 90-MIN REM SLEEP CYCLE & 20-20-20 EYE REST TIMER
  // =========================================================================
  const [bedtimeMode, setBedtimeMode] = useState<'sleepNow' | 'wakeTime'>('sleepNow');
  const [targetWakeHour, setTargetWakeHour] = useState<string>('07:00');
  const [eyeTimerSeconds, setEyeTimerSeconds] = useState<number>(1200); // 20 mins = 1200s
  const [isEyeTimerRunning, setIsEyeTimerRunning] = useState<boolean>(false);
  const [eyeRestActive, setEyeRestActive] = useState<boolean>(false); // 20s rest period

  // Eye timer effect
  useEffect(() => {
    let interval: any = null;
    if (isEyeTimerRunning) {
      interval = setInterval(() => {
        setEyeTimerSeconds((prev) => {
          if (prev <= 1) {
            playChime('timer');
            if (!eyeRestActive) {
              setEyeRestActive(true);
              return 20; // 20 seconds eye rest
            } else {
              setEyeRestActive(false);
              return 1200; // Reset to 20 minutes
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isEyeTimerRunning, eyeRestActive]);

  // Calculate REM sleep times (each cycle = 90 min, 14 min to fall asleep)
  const sleepCycles = useMemo(() => {
    const cycles = [];
    const now = new Date();

    if (bedtimeMode === 'sleepNow') {
      // Add 14 min to fall asleep
      const fallAsleepTime = new Date(now.getTime() + 14 * 60 * 1000);
      for (let c = 3; c <= 6; c++) {
        const wakeTime = new Date(fallAsleepTime.getTime() + c * 90 * 60 * 1000);
        cycles.push({
          cycleCount: c,
          hours: (c * 1.5).toFixed(1),
          timeStr: wakeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quality: c >= 5 ? 'Optimal Rest' : c === 4 ? 'Good Energy' : 'Minimum Baseline',
          recommended: c === 5,
        });
      }
    } else {
      const [h, m] = targetWakeHour.split(':').map(Number);
      const wakeDate = new Date();
      wakeDate.setHours(h, m, 0, 0);
      for (let c = 6; c >= 3; c--) {
        const sleepTime = new Date(wakeDate.getTime() - (c * 90 + 14) * 60 * 1000);
        cycles.push({
          cycleCount: c,
          hours: (c * 1.5).toFixed(1),
          timeStr: sleepTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quality: c >= 5 ? 'Optimal Rest' : c === 4 ? 'Good Energy' : 'Minimum Baseline',
          recommended: c === 5,
        });
      }
    }
    return cycles;
  }, [bedtimeMode, targetWakeHour]);

  // World Time Zones
  const [worldTimeBaseHour, setWorldTimeBaseHour] = useState<number>(new Date().getHours());
  const cities = [
    { name: 'San Francisco (PST)', offset: -8, flag: '🌉' },
    { name: 'New York (EST)', offset: -5, flag: '🗽' },
    { name: 'London (GMT/BST)', offset: 0, flag: '🇬🇧' },
    { name: 'Berlin / Paris (CET)', offset: 1, flag: '🇪🇺' },
    { name: 'Tokyo (JST)', offset: 9, flag: '🇯🇵' },
    { name: 'Sydney (AEST)', offset: 11, flag: '🇦🇺' },
  ];

  // =========================================================================
  // SECTION 4: INI CONFIG CHANGER & GAME TWEAKER
  // =========================================================================
  const sampleGameConfigs: Record<string, string> = {
    skyrim: `[Display]
iSize W = 1920
iSize H = 1080
bFull Screen = 1
fDefaultFOV = 90.0
bFXAAEnabled = 1
uGridsToLoad = 5

[Audio]
fAudioMasterVolume = 1.0000
fAudioMusicVolume = 0.8500
fAudioEffectsVolume = 1.0000
bAudioMuteOnUnfocus = 0

[Controls]
fMouseHeadingSensitivity = 0.0250
bInvertYAxis = 0
bGamepadEnable = 1

[Performance]
bFPSLimit = 1
iMaxFPS = 144
bPrecacheMeshes = 1`,

    minecraft: `[MinecraftServer]
server-port = 25565
gamemode = survival
difficulty = hard
max-players = 20
view-distance = 16
simulation-distance = 12
pvp = true
allow-flight = false
motd = Chang-Itz High Performance Dedicated Server
online-mode = true`,

    source_engine: `[EngineConfig]
cl_updaterate = 128
cl_cmdrate = 128
rate = 786432
fps_max = 300
mat_monitorgamma = 1.8
m_rawinput = 1
net_graph = 1

[VideoSettings]
r_drawtracers_firstperson = 0
mat_queue_mode = 2
r_dynamic = 0`,
  };

  const [activePreset, setActivePreset] = useState<string>('skyrim');
  const [rawIniCode, setRawIniCode] = useState<string>(sampleGameConfigs.skyrim);
  const [copiedIni, setCopiedIni] = useState<boolean>(false);
  const [filterSection, setFilterSection] = useState<string>('all');

  // Parsed INI object for visual tweaks
  const parsedIni = useMemo(() => {
    try {
      return parseIni(rawIniCode);
    } catch {
      return {};
    }
  }, [rawIniCode]);

  // Update a single key-value in INI
  const updateIniValue = (section: string, key: string, newVal: any) => {
    const updated = { ...parsedIni };
    if (!updated[section]) updated[section] = {};
    updated[section][key] = newVal;
    const formatted = formatToIni(updated, { addTimestampHeader: true });
    setRawIniCode(formatted);
  };

  const addNewSection = () => {
    const secName = prompt('Enter new Section Name (e.g. Graphics, Controls):');
    if (!secName) return;
    const clean = secName.replace(/[\[\]]/g, '').trim();
    if (!clean) return;
    const updated = { ...parsedIni, [clean]: { enabled: true, priority: 1 } };
    setRawIniCode(formatToIni(updated, { addTimestampHeader: true }));
    playChime('click');
  };

  const loadPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    setRawIniCode(sampleGameConfigs[presetKey] || '');
    playChime('click');
  };

  const copyIniToClipboard = () => {
    navigator.clipboard.writeText(rawIniCode);
    setCopiedIni(true);
    playChime('success');
    setTimeout(() => setCopiedIni(false), 2000);
  };

  const downloadIniFile = (ext: string = 'ini') => {
    let mime = 'text/plain';
    let content = rawIniCode;
    let filename = `config.${ext}`;

    if (ext === 'json') {
      mime = 'application/json';
      content = JSON.stringify(parsedIni, null, 2);
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#10b981', '#3b82f6'],
    });
  };

  // =========================================================================
  // SECTION 5: WI-FI QR CODE & TEXT CLEANER
  // =========================================================================
  const [wifiSsid, setWifiSsid] = useState<string>('MyHomeNetwork_5G');
  const [wifiPassword, setWifiPassword] = useState<string>('SuperSecretPass123!');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);

  // WiFi string format standard: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
  const wifiQrString = useMemo(() => {
    return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
  }, [wifiSsid, wifiPassword, wifiEncryption, wifiHidden]);

  // Clean text utility
  const [cleanerInput, setCleanerInput] = useState<string>(
    '  Hello   World!   \n\n\nThis is  a test with   extra spaces.  \nContact us at support@example.com or visit https://chang-itz.app today!\nDuplicate line.\nDuplicate line.'
  );
  const [cleanerResult, setCleanerResult] = useState<string>('');
  const [cleanerCopied, setCleanerCopied] = useState<boolean>(false);

  const cleanText = (type: 'spaces' | 'duplicates' | 'emails' | 'urls' | 'stripHtml') => {
    let res = cleanerInput;
    if (type === 'spaces') {
      res = cleanerInput
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter((l) => l.length > 0)
        .join('\n');
    } else if (type === 'duplicates') {
      const lines = cleanerInput.split('\n');
      const unique = Array.from(new Set(lines));
      res = unique.join('\n');
    } else if (type === 'emails') {
      const emails = cleanerInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      res = emails.join('\n');
    } else if (type === 'urls') {
      const urls = cleanerInput.match(/https?:\/\/[^\s]+/g) || [];
      res = urls.join('\n');
    } else if (type === 'stripHtml') {
      res = cleanerInput.replace(/<[^>]*>?/gm, '');
    }
    setCleanerResult(res);
    playChime('click');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-amber-500/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
            ☕
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
              <span>Everyday Life & Smart Utilities</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Daily Essentials
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Kitchen portion scaling, bill & trip splitting, REM sleep optimizer, 20-20-20 eye rest, and game .INI config changer.
            </p>
          </div>
        </div>

        {/* Quick Nav Badges */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setSubTab('kitchen');
              playChime('click');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'kitchen'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🍳</span>
            <span>Kitchen & Recipe</span>
          </button>

          <button
            onClick={() => {
              setSubTab('split');
              playChime('click');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'split'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>💸</span>
            <span>Bill & Trip Cost</span>
          </button>

          <button
            onClick={() => {
              setSubTab('sleep');
              playChime('click');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'sleep'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🌙</span>
            <span>Sleep & Focus</span>
          </button>

          <button
            onClick={() => {
              setSubTab('ini');
              playChime('click');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'ini'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>⚙️</span>
            <span>.INI Config Changer</span>
          </button>

          <button
            onClick={() => {
              setSubTab('tools');
              playChime('click');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'tools'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>📱</span>
            <span>Wi-Fi QR & Text</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: KITCHEN & RECIPE SCALER */}
      {/* ===================================================================== */}
      {subTab === 'kitchen' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Recipe Scaler */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                  <span>🍳 Recipe Portion & Ingredient Scaler</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Scale any cake, dinner or cocktail recipe seamlessly with clean fractions and precision.
                </p>
              </div>

              {/* Servings Control */}
              <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Original</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={originalServings}
                    onChange={(e) => setOriginalServings(Math.max(1, Number(e.target.value)))}
                    className="w-14 text-center bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-bold text-sm py-0.5"
                  />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <div className="text-center">
                  <span className="text-[10px] text-amber-400 block uppercase font-bold">Target</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={targetServings}
                    onChange={(e) => setTargetServings(Math.max(1, Number(e.target.value)))}
                    className="w-14 text-center bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-300 font-extrabold text-sm py-0.5"
                  />
                </div>
                <div className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                  {scaleRatio.toFixed(2)}x
                </div>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1">
                <span className="col-span-5">Ingredient</span>
                <span className="col-span-3 text-right">Original</span>
                <span className="col-span-3 text-right text-amber-400">Scaled ({targetServings} Servings)</span>
                <span className="col-span-1 text-center">Action</span>
              </div>

              <div className="divide-y divide-slate-800/60 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden">
                {recipeIngredients.map((ing) => {
                  const scaledVal = ing.amount * scaleRatio;
                  return (
                    <div
                      key={ing.id}
                      className="grid grid-cols-12 gap-2 items-center px-4 py-3 text-xs hover:bg-slate-900/60 transition-colors"
                    >
                      <span className="col-span-5 font-semibold text-slate-200">{ing.name}</span>
                      <span className="col-span-3 text-right text-slate-400 font-mono">
                        {ing.amount} {ing.unit}
                      </span>
                      <span className="col-span-3 text-right font-bold text-amber-400 font-mono">
                        {formatFraction(scaledVal)} {ing.unit}
                        <span className="text-[10px] text-slate-500 block">({scaledVal.toFixed(2)})</span>
                      </span>
                      <div className="col-span-1 text-center">
                        <button
                          onClick={() => removeIngredient(ing.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Ingredient Form */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Ingredient name (e.g., Chocolate Chips)..."
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
              <input
                type="number"
                step="0.25"
                min="0.05"
                value={newIngredientAmount}
                onChange={(e) => setNewIngredientAmount(Number(e.target.value))}
                className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
              />
              <select
                value={newIngredientUnit}
                onChange={(e) => setNewIngredientUnit(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
              >
                <option value="cups">cups</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
                <option value="grams">grams (g)</option>
                <option value="kg">kilograms (kg)</option>
                <option value="oz">oz</option>
                <option value="lbs">lbs</option>
                <option value="ml">milliliters (ml)</option>
                <option value="cloves">cloves</option>
                <option value="pinch">pinch</option>
              </select>
              <button
                onClick={addIngredient}
                className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Oven Temperature & Quick Culinary Conversions */}
          <div className="space-y-6">
            {/* Oven Dial */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Oven Dial Converter</span>
                </h4>
                <span className="text-xs text-slate-400">°F / °C / Gas</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Fahrenheit (°F)</span>
                  <span className="font-mono font-bold text-amber-400 text-base">{ovenTempF}°F</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="500"
                  step="5"
                  value={ovenTempF}
                  onChange={(e) => setOvenTempF(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Standard °C</span>
                    <span className="text-sm font-extrabold text-slate-200 font-mono">{ovenTempC}°C</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-cyan-400 block uppercase font-bold">Fan-Forced</span>
                    <span className="text-sm font-extrabold text-cyan-300 font-mono">{ovenTempFan}°C</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] text-orange-400 block uppercase font-bold">Gas Mark</span>
                    <span className="text-sm font-extrabold text-orange-300 font-mono">{ovenGasMark}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Kitchen Equivalents */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>Quick Kitchen Ratios</span>
              </h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-2 rounded-lg bg-slate-950 flex justify-between">
                  <span className="text-slate-400">1 Tablespoon (tbsp)</span>
                  <span className="font-bold text-amber-400">3 Teaspoons (tsp)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 flex justify-between">
                  <span className="text-slate-400">1 US Cup</span>
                  <span className="font-bold text-amber-400">16 tbsp = 240 ml</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 flex justify-between">
                  <span className="text-slate-400">1 Stick of Butter</span>
                  <span className="font-bold text-amber-400">1/2 Cup = 113 grams</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 flex justify-between">
                  <span className="text-slate-400">1 US Fluid Ounce</span>
                  <span className="font-bold text-amber-400">29.57 ml</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: BILL & TIP SPLITTER + ROAD TRIP FUEL */}
      {/* ===================================================================== */}
      {subTab === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bill & Tip Splitter */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <span>Restaurant Bill & Tip Splitter</span>
              </h3>
              <p className="text-xs text-slate-400">Fair, accurate breakdown with tax and round-up options.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Subtotal Bill Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={billAmount}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-bold text-emerald-400 font-mono"
                />
              </div>

              {/* Tip Selection */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-slate-300">Tip Percentage</span>
                  <span className="font-bold text-amber-400 font-mono">{tipPercent}%</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[10, 15, 18, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setTipPercent(pct)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        tipPercent === pct
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Guests & Tax */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Number of People</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={numPeople}
                    onChange={(e) => setNumPeople(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Sales Tax (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Round Up Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={roundUp}
                  onChange={(e) => setRoundUp(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span className="text-xs text-slate-300">Round up total bill to nearest whole dollar</span>
              </label>

              {/* Split Summary Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-slate-950 to-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total with Tax & Tip:</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">${finalTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>Tip Amount:</span>
                  <span className="font-mono text-slate-200">${tipAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800/80 pt-2">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Each Person Pays</span>
                    <span className="text-[10px] text-slate-500 block">({numPeople} guests)</span>
                  </div>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    ${perPersonTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Road Trip Fuel & Cost Splitter */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <Car className="w-5 h-5 text-cyan-400" />
                <span>Road Trip Fuel & Gas Splitter</span>
              </h3>
              <p className="text-xs text-slate-400">Calculate fuel volume, total travel expense, and per-seat split.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">One-Way / Round Distance (Miles)</label>
                  <input
                    type="number"
                    min="1"
                    value={tripMiles}
                    onChange={(e) => setTripMiles(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-400 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Vehicle Mileage (MPG)</label>
                  <input
                    type="number"
                    min="5"
                    value={vehicleMpg}
                    onChange={(e) => setVehicleMpg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Gas Price ($ / Gallon)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1"
                    value={gasPricePerGallon}
                    onChange={(e) => setGasPricePerGallon(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Passengers Sharing Gas</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tripPassengers}
                    onChange={(e) => setTripPassengers(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Trip Fuel Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 via-slate-950 to-slate-950 border border-cyan-500/30 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estimated Fuel Consumed:</span>
                  <span className="font-mono font-bold text-slate-200">{totalGallons.toFixed(1)} Gallons</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Fuel Cost:</span>
                  <span className="font-mono font-bold text-cyan-400 text-base">${totalFuelCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estimated Carbon Output:</span>
                  <span className="font-mono text-slate-400">~{co2Kilos.toFixed(1)} kg CO₂</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800/80 pt-2">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Each Passenger Pays</span>
                    <span className="text-[10px] text-slate-500 block">({tripPassengers} travelers)</span>
                  </div>
                  <span className="text-2xl font-black text-cyan-300 font-mono">
                    ${costPerPassenger.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: SLEEP CYCLES & 20-20-20 EYE REST TIMER */}
      {/* ===================================================================== */}
      {subTab === 'sleep' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* REM Sleep Cycle Calculator */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span>90-Minute REM Sleep Optimizer</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Waking up at the end of a 90-minute REM cycle prevents sleep inertia and morning grogginess.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setBedtimeMode('sleepNow')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    bedtimeMode === 'sleepNow' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  If I sleep now
                </button>
                <button
                  onClick={() => setBedtimeMode('wakeTime')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    bedtimeMode === 'wakeTime' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Wake up at...
                </button>
              </div>
            </div>

            {bedtimeMode === 'wakeTime' && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Target Alarm Wake Time:</span>
                <input
                  type="time"
                  value={targetWakeHour}
                  onChange={(e) => setTargetWakeHour(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm text-indigo-300 font-bold"
                />
              </div>
            )}

            {/* Recommended Windows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {sleepCycles.map((c) => (
                <div
                  key={c.cycleCount}
                  className={`p-4 rounded-xl border transition-all text-center space-y-1.5 ${
                    c.recommended
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{c.hours} Hours</span>
                    {c.recommended && (
                      <span className="text-[9px] bg-indigo-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black text-indigo-300 font-mono">{c.timeStr}</div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {c.cycleCount} REM Cycles
                  </span>
                  <span className="text-[10px] text-emerald-400 block font-semibold">{c.quality}</span>
                </div>
              ))}
            </div>

            {/* World Time Zone Slider */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Global Meeting Hour Comparison</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  Base Hour: {worldTimeBaseHour}:00 (PST)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                value={worldTimeBaseHour}
                onChange={(e) => setWorldTimeBaseHour(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cities.map((city) => {
                  const hour = (worldTimeBaseHour + (city.offset + 8) + 24) % 24;
                  const isWorkHour = hour >= 9 && hour <= 17;
                  return (
                    <div
                      key={city.name}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        isWorkHour
                          ? 'bg-slate-950 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{city.flag}</span>
                        <span className="truncate">{city.name.split(' ')[0]}</span>
                      </div>
                      <span className="font-mono font-bold">
                        {String(hour).padStart(2, '0')}:00
                        {isWorkHour && <span className="text-[9px] ml-1 text-emerald-400">☀️</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 20-20-20 Eye Rest Focus Timer */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>20-20-20 Eye Rest Timer</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Anti-Fatigue
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Every 20 minutes of screen work, look at something 20 feet away for 20 seconds.
              </p>
            </div>

            {/* Timer Display */}
            <div
              className={`p-6 rounded-2xl border text-center transition-all ${
                eyeRestActive
                  ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-500/10 animate-pulse'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider block text-slate-400">
                {eyeRestActive ? '👀 Look 20 Feet Away Now!' : '💻 Screen Focus Time'}
              </span>
              <div className="text-4xl font-black font-mono my-2 text-slate-100">
                {Math.floor(eyeTimerSeconds / 60)}:
                {String(eyeTimerSeconds % 60).padStart(2, '0')}
              </div>
              <span className="text-[10px] text-slate-500 block">
                {eyeRestActive ? 'Relaxing eye ciliary muscles...' : 'Gentle chime plays when it is time to rest'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEyeTimerRunning(!isEyeTimerRunning);
                  playChime('click');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isEyeTimerRunning
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                {isEyeTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isEyeTimerRunning ? 'Pause Timer' : 'Start Focus'}</span>
              </button>

              <button
                onClick={() => {
                  setIsEyeTimerRunning(false);
                  setEyeRestActive(false);
                  setEyeTimerSeconds(1200);
                  playChime('click');
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Reset to 20 mins"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: INI CONFIG CHANGER & GAME TWEAKER */}
      {/* ===================================================================== */}
      {subTab === 'ini' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-amber-400" />
                  <span>.INI Game Config Changer & Visual Tweaker</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect, tweak graphics/FOV/keys, add sections, and export clean .INI or .JSON game configuration files.
                </p>
              </div>

              {/* Game Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-400">Presets:</span>
                {[
                  { id: 'skyrim', label: 'SkyrimPrefs.ini' },
                  { id: 'minecraft', label: 'server.properties' },
                  { id: 'source_engine', label: 'autoexec.cfg' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => loadPreset(p.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activePreset === p.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Visual Section & Value Sliders */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Interactive Sections</span>
                    <select
                      value={filterSection}
                      onChange={(e) => setFilterSection(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                    >
                      <option value="all">All Sections ({Object.keys(parsedIni).length})</option>
                      {Object.keys(parsedIni).map((sec) => (
                        <option key={sec} value={sec}>
                          [{sec}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={addNewSection}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Section</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {Object.entries(parsedIni)
                    .filter(([section]) => filterSection === 'all' || filterSection === section)
                    .map(([section, keys]) => (
                      <div key={section} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="font-mono font-bold text-xs text-amber-400">[{section}]</span>
                          <span className="text-[10px] text-slate-500">{Object.keys(keys).length} properties</span>
                        </div>

                        <div className="space-y-2.5">
                          {Object.entries(keys).map(([k, v]) => (
                            <div key={k} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <span className="font-mono text-slate-300">{k}</span>

                              {/* Boolean Toggle */}
                              {typeof v === 'boolean' || v === 1 || v === 0 ? (
                                <button
                                  onClick={() => updateIniValue(section, k, typeof v === 'boolean' ? !v : v === 1 ? 0 : 1)}
                                  className={`px-3 py-1 rounded-lg font-mono font-bold text-[11px] transition-colors ${
                                    v === true || v === 1
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                                  }`}
                                >
                                  {String(v)}
                                </button>
                              ) : typeof v === 'number' ? (
                                <input
                                  type="number"
                                  value={v}
                                  onChange={(e) => updateIniValue(section, k, Number(e.target.value))}
                                  className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-mono text-amber-300"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={String(v)}
                                  onChange={(e) => updateIniValue(section, k, e.target.value)}
                                  className="w-48 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 font-mono text-slate-200"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Live Raw Code & Actions */}
              <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Live .INI Code</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={copyIniToClipboard}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedIni ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIni ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={rawIniCode}
                  onChange={(e) => setRawIniCode(e.target.value)}
                  className="w-full flex-1 min-h-[360px] bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-amber-200 focus:outline-none focus:border-amber-400 leading-relaxed resize-none"
                  spellCheck={false}
                />

                {/* Export Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => downloadIniFile('ini')}
                    className="py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .INI</span>
                  </button>

                  <button
                    onClick={() => downloadIniFile('json')}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export as JSON</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: WI-FI QR CODE & TEXT CLEANER */}
      {/* ===================================================================== */}
      {subTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wi-Fi QR Code Generator */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <span>Instant Wi-Fi Guest QR Generator</span>
              </h3>
              <p className="text-xs text-slate-400">
                Guests can point their phone camera to instantly join your Wi-Fi without typing passwords.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Network Name (SSID)</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Wi-Fi Password</label>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Security Type</label>
                  <select
                    value={wifiEncryption}
                    onChange={(e) => setWifiEncryption(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-amber-500"
                    />
                    <span className="text-xs text-slate-300">Hidden Network</span>
                  </label>
                </div>
              </div>

              {/* Rendered Card / QR Simulation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Wi-Fi Card</span>
                  <span className="font-extrabold text-sm text-slate-100">{wifiSsid}</span>
                  <span className="text-xs text-slate-400 block font-mono">Pass: {wifiPassword}</span>
                </div>

                <div className="p-2 rounded-lg bg-white flex items-center justify-center">
                  <div className="w-16 h-16 bg-slate-900 rounded flex flex-col items-center justify-center text-white text-[10px] font-bold text-center leading-tight">
                    <span>📶</span>
                    <span>SCAN</span>
                    <span className="text-[8px] text-amber-400">WIFI</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(wifiQrString);
                  alert(`Copied standard Wi-Fi barcode string: \n${wifiQrString}`);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Wi-Fi QR Connection Code</span>
              </button>
            </div>
          </div>

          {/* Text Cleaner & Extra Space Remover */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-800">
                <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>Text Cleaner & Extractor</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Strip trailing spaces, remove duplicate lines, extract emails & URLs.
                </p>
              </div>

              <div className="space-y-3 mt-3">
                <textarea
                  value={cleanerInput}
                  onChange={(e) => setCleanerInput(e.target.value)}
                  placeholder="Paste messy text here..."
                  className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400 resize-none"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => cleanText('spaces')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Trim Extra Spaces
                  </button>
                  <button
                    onClick={() => cleanText('duplicates')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Remove Duplicate Lines
                  </button>
                  <button
                    onClick={() => cleanText('emails')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Extract Emails
                  </button>
                  <button
                    onClick={() => cleanText('urls')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Extract URLs
                  </button>
                </div>

                {cleanerResult && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-400">Cleaned Result:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(cleanerResult);
                          setCleanerCopied(true);
                          setTimeout(() => setCleanerCopied(false), 2000);
                        }}
                        className="text-slate-400 hover:text-slate-100 flex items-center gap-1"
                      >
                        {cleanerCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{cleanerCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={cleanerResult}
                      className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-300 font-mono resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
