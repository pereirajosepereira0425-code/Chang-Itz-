import React, { useRef, useEffect, useState, useCallback } from 'react';
import { UnicodeCharacterInfo } from '../engine/unicodeGenerator';
import {
  RotateCcw,
  Sparkles,
  Zap,
  Compass,
  Magnet,
  Maximize2,
  Wind,
  Flame,
} from 'lucide-react';

interface PhysicsBody {
  id: number;
  charInfo: UnicodeCharacterInfo;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  radius: number;
  mass: number;
  isDragged: boolean;
  color: string;
  emojiFilter?: string;
  fontFamily?: string;
  fontSizePx: number;
}

interface UnicodePhysicsPlaygroundProps {
  characters: UnicodeCharacterInfo[];
  themeMode: 'perchance' | 'dark';
  onSelectCharacter?: (char: UnicodeCharacterInfo) => void;
  selectedChar?: UnicodeCharacterInfo | null;
}

type GravityPreset = 'earth' | 'moon' | 'zero' | 'helium' | 'jupiter';

export const UnicodePhysicsPlayground: React.FC<UnicodePhysicsPlaygroundProps> = ({
  characters,
  themeMode,
  onSelectCharacter,
  selectedChar,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodiesRef = useRef<PhysicsBody[]>([]);
  const [, setFrameTick] = useState(0);

  // Physics settings
  const [gravityPreset, setGravityPreset] = useState<GravityPreset>('earth');
  const [gravityWell, setGravityWell] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [shockwaveEffect, setShockwaveEffect] = useState<{ x: number; y: number; id: number } | null>(null);

  // Dragging state
  const draggedBodyRef = useRef<PhysicsBody | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastMousePosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // Get gravity Y value based on preset
  const getGravityValue = (preset: GravityPreset): number => {
    switch (preset) {
      case 'earth':
        return 0.45;
      case 'moon':
        return 0.12;
      case 'zero':
        return 0.0;
      case 'helium':
        return -0.28;
      case 'jupiter':
        return 0.95;
      default:
        return 0.45;
    }
  };

  // Parse font size into numerical pixel size
  const parseFontSizePx = (fontSizeStr?: string): number => {
    if (!fontSizeStr) return 48;
    const num = parseFloat(fontSizeStr);
    if (isNaN(num)) return 48;
    if (fontSizeStr.includes('rem')) return Math.max(24, Math.min(120, num * 16));
    return Math.max(22, Math.min(140, num));
  };

  // Initialize physics bodies whenever characters change
  const initBodies = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.max(300, rect.width);
    const height = Math.max(260, rect.height);

    const newBodies: PhysicsBody[] = characters.map((c, i) => {
      const fs = parseFontSizePx(c.fontSize);
      const radius = Math.max(18, Math.min(65, fs * 0.52));
      const col = i % Math.max(1, Math.floor(width / (radius * 2.2)));
      const row = Math.floor(i / Math.max(1, Math.floor(width / (radius * 2.2))));

      const startX = Math.min(width - radius - 10, Math.max(radius + 10, (col + 0.6) * (radius * 2.2)));
      const startY = Math.min(height - radius - 10, Math.max(radius + 10, 40 + row * (radius * 2.2)));

      // Extract initial rotation from transform if present
      let initRot = 0;
      if (c.transform && c.transform.includes('rotate(')) {
        const match = c.transform.match(/rotate\(([-0-9.]+)deg\)/);
        if (match && match[1]) initRot = parseFloat(match[1]);
      } else {
        initRot = (Math.random() - 0.5) * 45;
      }

      return {
        id: i,
        charInfo: c,
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 4 - 2,
        rotation: initRot,
        vRot: (Math.random() - 0.5) * 8,
        radius,
        mass: Math.max(1, radius / 12),
        isDragged: false,
        color: c.color || (themeMode === 'perchance' ? '#1e293b' : '#f8fafc'),
        emojiFilter: c.emojiFilter,
        fontFamily: c.fontFamily,
        fontSizePx: fs,
      };
    });

    bodiesRef.current = newBodies;
  }, [characters, themeMode]);

  useEffect(() => {
    initBodies();
  }, [initBodies]);

  // Main Physics Simulation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(32, currentTime - lastTime) / 16.666; // normalize to ~60fps step
      lastTime = currentTime;

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const gravity = getGravityValue(gravityPreset);
        const bodies = bodiesRef.current;
        const count = bodies.length;

        // 1. Update velocities and positions
        for (let i = 0; i < count; i++) {
          const b = bodies[i];
          if (b.isDragged) continue;

          // Apply Gravity
          b.vy += gravity * dt;

          // Apply Gravity Well attraction towards pointer if active
          if (gravityWell) {
            const dx = mousePosRef.current.x - b.x;
            const dy = mousePosRef.current.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 10) {
              const force = Math.min(2.5, 400 / (dist + 20));
              b.vx += (dx / dist) * force * dt;
              b.vy += (dy / dist) * force * dt;
            }
          }

          // Atmospheric friction
          b.vx *= Math.pow(0.988, dt);
          b.vy *= Math.pow(0.988, dt);
          b.vRot *= Math.pow(0.97, dt);

          // Update position
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.rotation += b.vRot * dt;

          // 2. Boundary Collisions (Walls, Floor, Ceiling)
          const restitution = 0.72; // bounciness
          const wallRestitution = 0.78;

          // Floor
          if (b.y + b.radius > height) {
            b.y = height - b.radius;
            if (b.vy > 0) {
              b.vy = -b.vy * restitution;
              // Friction on floor causes spin
              b.vRot += (b.vx * 0.15);
              b.vx *= 0.92;
            }
          }

          // Ceiling
          if (b.y - b.radius < 0) {
            b.y = b.radius;
            if (b.vy < 0) {
              b.vy = -b.vy * restitution;
              b.vx *= 0.95;
            }
          }

          // Left Wall
          if (b.x - b.radius < 0) {
            b.x = b.radius;
            if (b.vx < 0) {
              b.vx = -b.vx * wallRestitution;
              b.vRot += (b.vy * 0.15);
            }
          }

          // Right Wall
          if (b.x + b.radius > width) {
            b.x = width - b.radius;
            if (b.vx > 0) {
              b.vx = -b.vx * wallRestitution;
              b.vRot -= (b.vy * 0.15);
            }
          }
        }

        // 3. Inter-character Elastic Collisions (Pairwise)
        for (let i = 0; i < count; i++) {
          const b1 = bodies[i];
          for (let j = i + 1; j < count; j++) {
            const b2 = bodies[j];
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = b1.radius + b2.radius;

            if (dist < minDist && dist > 0.001) {
              // Overlap separation
              const overlap = (minDist - dist) * 0.5;
              const nx = dx / dist;
              const ny = dy / dist;

              if (!b1.isDragged) {
                b1.x -= nx * overlap;
                b1.y -= ny * overlap;
              }
              if (!b2.isDragged) {
                b2.x += nx * overlap;
                b2.y += ny * overlap;
              }

              // Normal and tangential velocities
              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;
              const p = 2 * (nx * kx + ny * ky) / (b1.mass + b2.mass);

              const collisionRestitution = 0.85;
              if (!b1.isDragged) {
                b1.vx -= p * b2.mass * nx * collisionRestitution;
                b1.vy -= p * b2.mass * ny * collisionRestitution;
                b1.vRot += (Math.random() - 0.5) * 4;
              }
              if (!b2.isDragged) {
                b2.vx += p * b1.mass * nx * collisionRestitution;
                b2.vy += p * b1.mass * ny * collisionRestitution;
                b2.vRot += (Math.random() - 0.5) * 4;
              }
            }
          }
        }
      }

      // Trigger re-render
      setFrameTick((prev) => (prev + 1) % 10000);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gravityPreset, gravityWell]);

  // Pointer interaction: Dragging & Flinging
  const handlePointerDown = (body: PhysicsBody, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      draggedBodyRef.current = body;
      body.isDragged = true;
      body.vx = 0;
      body.vy = 0;
      dragOffsetRef.current = { x: clientX - body.x, y: clientY - body.y };
      lastMousePosRef.current = { x: clientX, y: clientY, time: performance.now() };

      if (onSelectCharacter) {
        onSelectCharacter(body.charInfo);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    mousePosRef.current = { x: clientX, y: clientY };

    const dragged = draggedBodyRef.current;
    if (dragged) {
      const now = performance.now();
      const dt = Math.max(1, now - lastMousePosRef.current.time);
      const targetX = clientX - dragOffsetRef.current.x;
      const targetY = clientY - dragOffsetRef.current.y;

      // Calculate instantaneous throw velocity
      dragged.vx = ((targetX - dragged.x) / dt) * 16.666;
      dragged.vy = ((targetY - dragged.y) / dt) * 16.666;
      dragged.x = targetX;
      dragged.y = targetY;

      lastMousePosRef.current = { x: clientX, y: clientY, time: now };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const dragged = draggedBodyRef.current;
    if (dragged) {
      dragged.isDragged = false;
      // Cap max throw velocity for pleasant feel
      dragged.vx = Math.max(-28, Math.min(28, dragged.vx));
      dragged.vy = Math.max(-28, Math.min(28, dragged.vy));
      dragged.vRot = (dragged.vx * 0.4) + (Math.random() - 0.5) * 6;
      draggedBodyRef.current = null;
    }
  };

  // Shockwave blast on clicking background
  const handleContainerClick = (e: React.MouseEvent) => {
    if (draggedBodyRef.current) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setShockwaveEffect({ x: clickX, y: clickY, id: Date.now() });
    setTimeout(() => setShockwaveEffect(null), 500);

    // Apply radial explosive impulse to all bodies
    bodiesRef.current.forEach((b) => {
      const dx = b.x - clickX;
      const dy = b.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 400) {
        const force = Math.max(4, (400 - dist) * 0.08);
        const angle = Math.atan2(dy, dx);
        b.vx += Math.cos(angle) * force * 1.5;
        b.vy += Math.sin(angle) * force * 1.5 - 4; // bias upward
        b.vRot += (Math.random() - 0.5) * 15;
      }
    });
  };

  // Action: Supernova Detonation
  const triggerExplosion = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setShockwaveEffect({ x: centerX, y: centerY, id: Date.now() });
    setTimeout(() => setShockwaveEffect(null), 500);

    bodiesRef.current.forEach((b) => {
      const dx = b.x - centerX;
      const dy = b.y - centerY;
      const angle = Math.atan2(dy, dx) || (Math.random() * Math.PI * 2);
      const force = 12 + Math.random() * 16;
      b.vx = Math.cos(angle) * force;
      b.vy = Math.sin(angle) * force - 6;
      b.vRot = (Math.random() - 0.5) * 35;
    });
  };

  // Action: Swirling Tornado Vortex
  const triggerVortex = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    bodiesRef.current.forEach((b) => {
      const dx = b.x - centerX;
      const dy = b.y - centerY;
      // Perpendicular vector for vortex spin
      b.vx = -dy * 0.12 + (Math.random() - 0.5) * 5;
      b.vy = dx * 0.12 - 5 + (Math.random() - 0.5) * 5;
      b.vRot = 20;
    });
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 select-none">
      {/* Physics Control Bar */}
      <div className="w-full flex items-center justify-between flex-wrap gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 shadow-md">
        {/* Gravity Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold flex items-center gap-1 text-amber-400">
            <Compass className="w-3.5 h-3.5" />
            <span>Gravity:</span>
          </span>
          {(['earth', 'moon', 'zero', 'helium', 'jupiter'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setGravityPreset(preset)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                gravityPreset === preset
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {preset === 'earth' && '🌍 Earth'}
              {preset === 'moon' && '🌕 Moon'}
              {preset === 'zero' && '🛸 Zero-G'}
              {preset === 'helium' && '🎈 Anti-G'}
              {preset === 'jupiter' && '🪐 Jupiter'}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setGravityWell(!gravityWell)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              gravityWell
                ? 'bg-purple-500 text-white font-bold ring-2 ring-purple-400/50 shadow-md animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300'
            }`}
            title="Characters are pulled towards your mouse pointer"
          >
            <Magnet className="w-3.5 h-3.5" />
            <span>Gravity Well {gravityWell ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={triggerExplosion}
            className="px-2.5 py-1 rounded-lg font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-all"
            title="Detonate an explosive shockwave"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>💥 Blast</span>
          </button>

          <button
            onClick={triggerVortex}
            className="px-2.5 py-1 rounded-lg font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 transition-all"
            title="Spin characters in a vortex"
          >
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>🌪️ Vortex</span>
          </button>

          <button
            onClick={initBodies}
            className="px-2.5 py-1 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-all"
            title="Reset character positions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title={isExpanded ? 'Collapse Arena' : 'Expand Arena'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Physics Arena Box */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full relative rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-crosshair select-none ${
          isExpanded ? 'h-[540px]' : 'h-[360px] sm:h-[400px]'
        } ${
          themeMode === 'perchance'
            ? 'bg-gradient-to-b from-slate-50 to-amber-50/30 border-amber-400/40 shadow-inner'
            : 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.06)]'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Shockwave Visual Ring */}
        {shockwaveEffect && (
          <div
            key={shockwaveEffect.id}
            className="absolute rounded-full border-2 border-amber-400 pointer-events-none animate-ping"
            style={{
              left: shockwaveEffect.x - 30,
              top: shockwaveEffect.y - 30,
              width: 60,
              height: 60,
            }}
          />
        )}

        {/* Physics Bodies (Unicode characters & emojis) */}
        {bodiesRef.current.map((body) => {
          const isSelected = selectedChar?.char === body.charInfo.char && selectedChar?.codePoint === body.charInfo.codePoint;
          return (
            <div
              key={body.id}
              onPointerDown={(e) => handlePointerDown(body, e)}
              style={{
                position: 'absolute',
                left: `${body.x}px`,
                top: `${body.y}px`,
                transform: `translate(-50%, -50%) rotate(${body.rotation}deg) scale(${body.isDragged ? 1.15 : 1})`,
                color: body.color,
                filter: body.emojiFilter || undefined,
                fontFamily: body.fontFamily || undefined,
                fontSize: `${body.fontSizePx}px`,
                lineHeight: 1,
                cursor: body.isDragged ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none',
                zIndex: body.isDragged ? 50 : 10,
                willChange: 'transform',
                transition: body.isDragged ? 'none' : 'filter 0.2s',
              }}
              className={`leading-none p-1 font-normal select-none transition-shadow ${
                isSelected ? 'ring-2 ring-amber-400 rounded-full' : ''
              } ${body.isDragged ? 'drop-shadow-[0_8px_16px_rgba(245,158,11,0.5)]' : ''}`}
              title={`${body.charInfo.char} (${body.charInfo.hex}) - ${body.charInfo.emojiColorName ? `Emoji Color: ${body.charInfo.emojiColorName}` : `Color: ${body.color}`} | Click & drag to fling!`}
            >
              {body.charInfo.char}
            </div>
          );
        })}

        {/* Hint overlay at bottom */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] pointer-events-none text-slate-400/80 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-lg">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Interactive Physics: Grab & throw characters • Click to trigger shockwave impulse!</span>
          </span>
          <span className="font-mono text-amber-400/90 font-bold hidden sm:inline">
            {bodiesRef.current.length} Rigid Bodies • 60 FPS
          </span>
        </div>
      </div>
    </div>
  );
};
