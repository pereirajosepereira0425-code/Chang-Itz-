import React, { useState, useEffect } from 'react';
import { Sparkles, Camera } from 'lucide-react';

interface ChangItzMascotProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'giant';
  animated?: boolean;
  spinningGears?: boolean;
  showBubble?: boolean;
  customQuote?: string;
  className?: string;
  onClick?: () => void;
  onOpenMascotModal?: () => void;
}

const MASCOT_QUOTES = [
  "Feed me bytes, I'll Chang-Itz! 🚀",
  "Powered by triple peppermint turbo engines! 🍬",
  "600+ formats? Just another snack for me! 😋",
  "Drop your file right here, let's transform it! ✨",
  "My magenta crystal tail senses incoming data! 🔮",
  "If it has bytes, we can Chang-Itz! ⚡",
  "FlipaClip official mascot! 🎨",
  "Click me to pet or customize! 🐾",
];

// The Official FlipaClip User Artwork Image
export const DEFAULT_MASCOT_IMAGE_URL = '/assets/aistudio/Screenshot_20261017_133833_FlipaClip_74400130.jpg';

export const ChangItzMascot: React.FC<ChangItzMascotProps> = ({
  size = 'md',
  animated = true,
  showBubble = false,
  customQuote,
  className = '',
  onClick,
  onOpenMascotModal,
}) => {
  const [petCount, setPetCount] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [clickedQuote, setClickedQuote] = useState<string | null>(null);
  const [isWiggling, setIsWiggling] = useState(false);
  const quoteTimeoutRef = React.useRef<any>(null);

  const [mascotImageSrc, setMascotImageSrc] = useState<string>(() => {
    const skin = localStorage.getItem('chang_itz_mascot_skin');
    const custom = localStorage.getItem('chang_itz_custom_mascot_image');
    if (skin === 'custom' && custom) return custom;
    return DEFAULT_MASCOT_IMAGE_URL;
  });

  // Listen for storage / custom events to update instantly
  useEffect(() => {
    const handleUpdate = () => {
      const skin = localStorage.getItem('chang_itz_mascot_skin');
      const custom = localStorage.getItem('chang_itz_custom_mascot_image');
      if (skin === 'custom' && custom) {
        setMascotImageSrc(custom);
      } else {
        setMascotImageSrc(DEFAULT_MASCOT_IMAGE_URL);
      }
    };
    window.addEventListener('chang_itz_mascot_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('chang_itz_mascot_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      if (quoteTimeoutRef.current) clearTimeout(quoteTimeoutRef.current);
    };
  }, []);

  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPetCount((prev) => prev + 1);
    setClickedQuote("my names changi! Mew");
    if (quoteTimeoutRef.current) clearTimeout(quoteTimeoutRef.current);
    quoteTimeoutRef.current = setTimeout(() => {
      setClickedQuote(null);
    }, 4500);

    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 500);

    // 1. Spoken voice: "my names changi! Mew" via Web Speech API
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("my names changi! Mew");
        utterance.pitch = 1.7; // cute mascot pitch
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Speech synthesis unsupported or blocked
    }

    // 2. Synthesized authentic cat mew contour via Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      const t = audioCtx.currentTime;
      // Frequency ramps up like a cheerful mew (440Hz -> 860Hz -> 680Hz)
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(860, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(680, t + 0.28);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.33);
    } catch {
      // AudioContext unavailable
    }

    if (onClick) onClick();
  };

  // Dimensions for various sizes
  const dimensions = {
    xs: { width: 44, height: 26 },
    sm: { width: 68, height: 38 },
    md: { width: 140, height: 80 },
    lg: { width: 260, height: 148 },
    xl: { width: 380, height: 215 },
    giant: { width: 520, height: 295 },
  }[size];

  const currentQuote = clickedQuote || customQuote || MASCOT_QUOTES[quoteIndex];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`relative inline-flex flex-col items-center select-none ${className}`}
    >
      {/* Speech Bubble: shows permanently if showBubble, or temporarily on click */}
      {(showBubble || clickedQuote) && (
        <div className="mb-2 max-w-xs animate-bounce text-center z-20">
          <div className="relative px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-slate-950 text-[11px] font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5 whitespace-nowrap">
            <span>🐾</span>
            <span>{currentQuote}</span>
            {petCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-950/20 text-slate-950 text-[10px]">
                ❤️ {petCount}
              </span>
            )}
            {/* Bubble arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 rotate-45" />
          </div>
        </div>
      )}

      {/* Mascot Image Container: Uses the EXACT user FlipaClip image file */}
      <div className="relative group">
        <div
          onClick={handleMascotClick}
          className={`cursor-pointer transition-transform duration-300 rounded-xl overflow-hidden bg-white/95 p-1 border-2 border-amber-500/40 shadow-xl shadow-amber-500/10 ${
            animated ? 'hover:scale-105 active:scale-95' : ''
          } ${isWiggling ? 'animate-bounce' : ''}`}
          style={{ width: dimensions.width, height: dimensions.height }}
          title="Chang-Itz Official FlipaClip Mascot! (Click to pet or customize)"
        >
          <img
            src={mascotImageSrc}
            alt="Chang-Itz Official FlipaClip Mascot"
            className="w-full h-full object-contain filter drop-shadow-sm"
          />
        </div>

        {/* Quick button to open Mascot Studio / change image */}
        {onOpenMascotModal && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMascotModal();
            }}
            className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-slate-900 border border-amber-500/60 text-amber-400 hover:text-white hover:bg-amber-500 shadow-md opacity-75 group-hover:opacity-100 transition-all hover:scale-110"
            title="Change mascot image"
          >
            <Camera className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </div>
  );
};
