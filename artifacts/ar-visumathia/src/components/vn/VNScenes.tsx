import { useState as useReactState } from 'react';
import { PaintedColors as C, PaintedCloud, PaintedTree, PaintedFlower, PaintedGrassTuft } from '@/components/painted';
import { VimoCharacter } from './VimoCharacter';
import { KidCharacter } from './KidCharacter';

export interface VNScene {
  id: number;
  caption: string;
  Component: React.FC;
}

const W = 1280;
const H = 720;

/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS — rich set for expressive scenes
═══════════════════════════════════════════════════════════════ */
const style = document.createElement('style');
style.textContent = `
@keyframes vn-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
@keyframes vn-wave { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-12deg)} 75%{transform:rotate(12deg)} }
@keyframes vn-float { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-18px) rotate(2deg)} }
@keyframes vn-sparkle { 0%,100%{opacity:0.3;transform:scale(0.6)} 50%{opacity:1;transform:scale(1.2)} }
@keyframes vn-slide-in-left { 0%{transform:translateX(-120px);opacity:0} 100%{transform:translateX(0);opacity:1} }
@keyframes vn-slide-in-right { 0%{transform:translateX(120px);opacity:0} 100%{transform:translateX(0);opacity:1} }
@keyframes vn-pop { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
@keyframes vn-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
@keyframes vn-drift { 0%{transform:translateX(0)} 100%{transform:translateX(80px)} }
@keyframes vn-grab { 0%{transform:translate(0,0) scale(1)} 40%{transform:translate(0,-20px) scale(1.1)} 70%{transform:translate(-80px,-60px) scale(0.8)} 100%{transform:translate(-120px,-40px) scale(0.7);opacity:0.6} }
@keyframes vn-rise-bubble { 0%{transform:translateY(60px) scale(0.5);opacity:0} 30%{opacity:1} 100%{transform:translateY(-720px) scale(1.2);opacity:0} }
@keyframes vn-twinkle { 0%,100%{opacity:0.2;transform:scale(0.4) rotate(0)} 50%{opacity:1;transform:scale(1.4) rotate(180deg)} }
@keyframes vn-pop-shake { 0%{transform:scale(0)} 50%{transform:scale(1.3) rotate(8deg)} 70%{transform:scale(0.95) rotate(-4deg)} 100%{transform:scale(1) rotate(0)} }
@keyframes vn-wiggle { 0%,100%{transform:rotate(-3deg)} 25%{transform:rotate(3deg)} 50%{transform:rotate(-3deg)} 75%{transform:rotate(3deg)} }
@keyframes vn-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
@keyframes vn-rainbow { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
@keyframes vn-heartbeat { 0%,100%{transform:scale(1)} 30%{transform:scale(1.2)} 60%{transform:scale(1)} }
@keyframes vn-fall-leaf { 0%{transform:translate(0,-50px) rotate(0deg);opacity:0} 20%{opacity:1} 100%{transform:translate(60px,720px) rotate(720deg);opacity:0} }
@keyframes vn-confetti { 0%{transform:translateY(-40px) rotate(0)} 100%{transform:translateY(800px) rotate(720deg)} }
@keyframes vn-glow { 0%,100%{filter:drop-shadow(0 0 4px currentColor)} 50%{filter:drop-shadow(0 0 18px currentColor)} }
@keyframes vn-walk-cycle { 0%,100%{transform:translateX(0)} 50%{transform:translateX(20px)} }
@keyframes vn-bounce { 0%,100%{transform:translateY(0) scale(1,1)} 40%{transform:translateY(-20px) scale(0.95,1.05)} 60%{transform:translateY(0) scale(1.05,0.95)} }
@keyframes vn-zoom-in { 0%{transform:scale(0.7);opacity:0} 100%{transform:scale(1);opacity:1} }
@keyframes vn-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
@keyframes vn-orbit { 0%{transform:rotate(0deg) translateX(50px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(50px) rotate(-360deg)} }
`;
if (typeof document !== 'undefined' && !document.getElementById('vn-anims')) {
  style.id = 'vn-anims';
  document.head.appendChild(style);
}

/* ─── Halftone texture overlay — subtle paper grain for pro look ─── */
const HalftoneOverlay: React.FC<{ opacity?: number; color?: string }> = ({ opacity = 0.04, color = '#000' }) => (
  <g style={{ pointerEvents: 'none' }}>
    {/* Reduced density for performance + subtlety */}
    {Array.from({ length: 20 }).map((_, row) =>
      Array.from({ length: 30 }).map((_, col) => (
        <circle
          key={`${row}-${col}`}
          cx={col * 44 + (row % 2) * 22}
          cy={row * 36}
          r={1.5}
          fill={color}
          opacity={opacity}
        />
      ))
    )}
    {/* Subtle noise grain — diagonal lines for texture */}
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={`grain${i}`} x1={i * 170} y1={0} x2={i * 170 + 80} y2={H} stroke={color} strokeWidth="0.5" opacity="0.02" />
    ))}
  </g>
);

/* ─── Speed lines for dynamic scenes ─── */
const SpeedLines: React.FC<{ direction?: 'left' | 'right' | 'radial'; color?: string }> = ({ direction = 'right', color = '#fff' }) => (
  <g style={{ pointerEvents: 'none' }} opacity="0.15">
    {Array.from({ length: 20 }).map((_, i) => {
      const y = 30 + i * 35;
      const len = 100 + (i % 3) * 80;
      return direction === 'radial' ? (
        <line key={i} x1={W / 2} y1={H / 2} x2={W / 2 + Math.cos(i * 0.33) * 600} y2={H / 2 + Math.sin(i * 0.33) * 400} stroke={color} strokeWidth="2" />
      ) : (
        <line key={i} x1={direction === 'right' ? 0 : W} y1={y} x2={direction === 'right' ? len : W - len} y2={y + (i % 2 ? 5 : -5)} stroke={color} strokeWidth={1.5 + (i % 2)} strokeLinecap="round" />
      );
    })}
  </g>
);

/* ─── Decorative sparkles scattered ─── */
const Sparkles: React.FC<{ count?: number; area?: [number, number, number, number] }> = ({ count = 12, area = [0, 0, W, H] }) => (
  <g style={{ pointerEvents: 'none' }}>
    {Array.from({ length: count }).map((_, i) => {
      const x = area[0] + ((i * 137) % (area[2] - area[0]));
      const y = area[1] + ((i * 89) % (area[3] - area[1]));
      const colors = ['#fcd34d', '#fff', '#f5a9c2', '#a3d075', '#7fbef7'];
      return (
        <g key={i} transform={`translate(${x},${y})`} style={{ animation: `vn-sparkle ${1.5 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}>
          <path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill={colors[i % colors.length]} stroke={C.ink} strokeWidth="1.5" />
        </g>
      );
    })}
  </g>
);

/* ─── Speech bubble — stylish with tail ─── */
const SpeechBubble: React.FC<{ x: number; y: number; text: string; color?: string; textColor?: string; tailDir?: 'left' | 'right'; delay?: number }> = ({ x, y, text, color = '#fff', textColor = C.ink, tailDir = 'left', delay = 0 }) => (
  <g transform={`translate(${x},${y})`} style={{ animation: `vn-pop 0.5s ease-out forwards`, animationDelay: `${delay}s`, opacity: 0 }}>
    <rect x="-60" y="-22" width="120" height="40" rx="14" fill={color} stroke={C.ink} strokeWidth="3" />
    {tailDir === 'left' ? (
      <path d="M-20 18 L-28 32 L-8 20 Z" fill={color} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
    ) : (
      <path d="M20 18 L28 32 L8 20 Z" fill={color} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
    )}
    <text x="0" y="4" textAnchor="middle" fontSize="16" fontFamily="Fredoka One, cursive" fill={textColor} style={{ textShadow: '0 1px 0 rgba(0,0,0,0.1)' }}>{text}</text>
  </g>
);

/* ─── Click-interactive object ─── */
const ClickableObject: React.FC<{ x: number; y: number; children: React.ReactNode; baseAnim?: string }> = ({ x, y, children, baseAnim }) => {
  const [hearts, setHearts] = useReactState<number[]>([]);
  const [boop, setBoop] = useReactState(0);
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHearts((h) => [...h, Date.now() + Math.random()]);
    setBoop(Date.now());
    setTimeout(() => setHearts((h) => h.slice(1)), 1200);
  };
  return (
    <g transform={`translate(${x},${y})`} onClick={handleClick} style={{ cursor: 'pointer', ...(baseAnim ? { animation: baseAnim } : {}) }}>
      <g key={boop} style={boop ? { animation: 'vn-pop-shake 0.4s ease-out' } : undefined}>{children}</g>
      {hearts.map((id, i) => (
        <g key={id} style={{ animation: 'vn-fall-leaf 1.2s ease-out forwards' }}>
          <path d="M0 -10 C-8 -16 -16 -10 -16 -2 C-16 6 0 14 0 14 C0 14 16 6 16 -2 C16 -10 8 -16 0 -10 Z" fill={['#e85b89', '#ff6b6b', '#f5a9c2'][i % 3]} stroke={C.ink} strokeWidth="2" transform={`translate(${(i % 2 === 0 ? -1 : 1) * 12}, -20) scale(0.7)`} />
        </g>
      ))}
    </g>
  );
};

/* ─── Ambient particles ─── */
const AmbientBubbles: React.FC = () => (
  <g style={{ pointerEvents: 'none' }}>
    {Array.from({ length: 6 }).map((_, i) => {
      const x = 100 + (i * 200) % W;
      const colors = ['#f6c2d2', '#cfeefd', '#fff7c4', '#a3d075', '#f5a9c2', '#7fbef7'];
      return (
        <g key={i} style={{ animation: `vn-rise-bubble ${7 + i * 1.5}s linear infinite`, animationDelay: `${i * 1.1}s` }}>
          <circle cx={x} cy={H + 40} r={6 + (i % 3) * 3} fill={colors[i % colors.length]} stroke={C.ink} strokeWidth="1.5" opacity="0.6" />
        </g>
      );
    })}
  </g>
);

/* ═══════════════════════════════════════════════════════════════
   FRAME BASE — with rich gradient sky + texture
═══════════════════════════════════════════════════════════════ */
const FrameBase: React.FC<{ children: React.ReactNode; sky?: 'day' | 'sunset' | 'night' | 'indoor' | 'pink' | 'purple' }> = ({ children, sky = 'day' }) => {
  const skies: Record<string, [string, string]> = {
    day: ['#7ecce8', '#cfeaf3'],
    sunset: ['#f7a360', '#fbd3a5'],
    night: ['#1a2a5e', '#4d6e9a'],
    indoor: ['#f3d49d', '#e3b673'],
    pink: ['#e85b89', '#f6c2d2'],
    purple: ['#5e4ea8', '#a36adb'],
  };
  const [top, bot] = skies[sky] || skies.day;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id={`vn-sky-${sky}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
        <linearGradient id="vn-rainbow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff6b6b" />
          <stop offset="0.2" stopColor="#ffd93d" />
          <stop offset="0.4" stopColor="#7bb24a" />
          <stop offset="0.6" stopColor="#4d9bc8" />
          <stop offset="0.8" stopColor="#a36adb" />
          <stop offset="1" stopColor="#f5a9c2" />
        </linearGradient>
        {/* Vignette for cinematic depth */}
        <radialGradient id="vn-vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#vn-sky-${sky})`} />
      {/* Vignette overlay for depth */}
      <rect width={W} height={H} fill="url(#vn-vignette)" />
      {children}
    </svg>
  );
};

/* ─── Reusable landscape elements — with gradients for depth ─── */
const Hills: React.FC = () => (
  <g>
    {/* Far hill — lighter, with highlight */}
    <path d={`M0 470 Q160 420 320 450 T640 430 T960 455 T${W} 425 L${W} ${H} L0 ${H} Z`} fill="#9fc086" />
    <path d={`M0 470 Q160 420 320 450 T640 430 T960 455 T${W} 425 L${W} 480 L0 480 Z`} fill="#b5d4a0" opacity="0.4" />
    <path d={`M0 470 Q160 420 320 450 T640 430 T960 455 T${W} 425`} stroke={C.ink} strokeWidth="3" fill="none" />
    {/* Mid hill — richer green with shadow */}
    <path d={`M0 530 Q200 480 400 510 T800 490 T${W} 520 L${W} ${H} L0 ${H} Z`} fill="#6cb04d" />
    <path d={`M0 540 Q200 500 400 520 T800 510 T${W} 530 L${W} ${H} L0 ${H} Z`} fill="#5a9a3e" opacity="0.5" />
    <path d={`M0 530 Q200 480 400 510 T800 490 T${W} 520`} stroke={C.ink} strokeWidth="3" fill="none" />
    {/* Near hill — darkest, strong shadow */}
    <path d={`M0 590 Q220 555 440 580 T880 565 T${W} 590 L${W} ${H} L0 ${H} Z`} fill="#4f8e34" />
    <path d={`M0 600 Q220 570 440 590 T880 580 T${W} 600 L${W} ${H} L0 ${H} Z`} fill="#3a6824" opacity="0.6" />
    <path d={`M0 590 Q220 555 440 580 T880 565 T${W} 590`} stroke={C.ink} strokeWidth="3" fill="none" />
  </g>
);

const Ground: React.FC = () => (
  <g>
    {/* Ground with gradient — darker at bottom */}
    <rect x="0" y="640" width={W} height="80" fill="#3a6824" />
    <rect x="0" y="640" width={W} height="20" fill="#4f8e34" opacity="0.5" />
    {Array.from({ length: 25 }).map((_, i) => <PaintedGrassTuft key={i} x={20 + (i * 52) % W} y={645 + (i % 3) * 10} />)}
    {[100, 280, 460, 640, 820, 1000, 1180].map((x, i) => (
      <PaintedFlower key={i} x={x} y={660 + (i % 2) * 8} color={['#f6c2d2', '#fcd34d', '#7fbef7', '#a36adb', '#e85b89', '#f5b942', '#4d9bc8'][i]} scale={1.2} />
    ))}
  </g>
);


/* Scene - Uses pre-drawn illustration */
const Scene01: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene1.png" alt="Kamar pagi" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* Scene - Uses pre-drawn illustration */
const Scene02: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene2.png" alt="Portal cahaya" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* Scene - Uses pre-drawn illustration */
const Scene03: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene3.png" alt="Taman" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* Scene - Uses pre-drawn illustration */
const Scene04: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene4.png" alt="Playground" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* Scene - Uses pre-drawn illustration */
const Scene05: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene5.png" alt="Dapur" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* Scene - Uses pre-drawn illustration */
const Scene06: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene6.png" alt="Kelas" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* Scene - Uses pre-drawn illustration */
const Scene07: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene7.png" alt="Market" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* Scene - Uses pre-drawn illustration */
const Scene08: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene8.png" alt="Jalan" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* Scene - Uses pre-drawn illustration */
const Scene09: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene9.png" alt="Rak Mainan" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* Scene - Uses pre-drawn illustration */
const Scene10: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene10.png" alt="Kuis TV" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* Scene - Uses pre-drawn illustration */
const Scene11: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene11.png" alt="Kristal" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* Scene 12 - Uses pre-drawn illustration */
const Scene12: React.FC = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <img src="/scene12.png" alt="Bukit Bunga" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SCENE 13 — Big floating numbers 1-5 in pink playful sky.
   Cute counting scene with abacus, blocks, pencils.
═══════════════════════════════════════════════════════════════ */
const Scene13: React.FC = () => {
  const OUT = '#3d2410';
  return (
  <FrameBase sky="pink">
    {/* ─── ZONE 1: SOFT PINK GROUND with polka dots ─── */}
    <rect x="0" y="540" width={W} height="180" fill="#f5a9c2" />
    <rect x="0" y="538" width={W} height="6" fill="#e85b89" stroke={OUT} strokeWidth="2.5" />
    {Array.from({ length: 30 }).map((_, i) => (
      <circle key={`dot${i}`} cx={20 + (i * 47) % W} cy={555 + (i % 3) * 50} r="4" fill="#fff" opacity="0.4" />
    ))}

    {/* ─── ZONE 2: BIG NUMBERS 1-5 floating (main attraction) ─── */}
    {[1, 2, 3, 4, 5].map((n, i) => (
      <g key={`num${n}`} transform={`translate(${180 + i * 220}, 280)`} style={{ animation: `vn-bounce ${1.6 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}>
        {/* Soft halo */}
        <circle r="78" fill={['#e85b89', '#7fbef7', '#7bb24a', '#fcd34d', '#a36adb'][i]} opacity="0.18" />
        <circle r="62" fill={['#e85b89', '#7fbef7', '#7bb24a', '#fcd34d', '#a36adb'][i]} stroke={OUT} strokeWidth="4" />
        <ellipse cx="-18" cy="-22" rx="14" ry="8" fill="#fff" opacity="0.5" />
        <text x="0" y="20" textAnchor="middle" fontSize="64" fontFamily="Fredoka One, cursive" fill="#fff" stroke={OUT} strokeWidth="2">{n}</text>
      </g>
    ))}

    {/* ─── ZONE 3: ABACUS (left foreground) ─── */}
    <g transform="translate(70, 410)">
      <rect x="-6" y="-6" width="148" height="180" rx="10" fill="#a87642" stroke={OUT} strokeWidth="4" />
      <rect x="0" y="0" width="136" height="168" rx="6" fill="#fbe8c8" />
      <rect x="0" y="0" width="136" height="168" fill="none" stroke={OUT} strokeWidth="3" rx="6" />
      {[28, 60, 92, 124].map((ry, i) => (
        <g key={`row${i}`}>
          <line x1="6" y1={ry} x2="130" y2={ry} stroke="#7a5230" strokeWidth="3" />
          {Array.from({ length: 5 }).map((_, j) => (
            <circle key={`b${i}${j}`} cx={18 + j * 25} cy={ry} r="10" fill={['#e85b89', '#7fbef7', '#7bb24a', '#fcd34d', '#a36adb'][j]} stroke={OUT} strokeWidth="2.5" />
          ))}
        </g>
      ))}
    </g>

    {/* ─── ZONE 4: NUMBER BLOCKS scattered (foreground) ─── */}
    {[[260, 580, 1, '#e85b89'], [340, 600, 2, '#7fbef7'], [420, 590, 3, '#7bb24a'], [950, 590, 4, '#fcd34d'], [1040, 605, 5, '#a36adb']].map(([x, y, n, c], i) => (
      <g key={`cb${i}`} transform={`translate(${x},${y}) rotate(${(i % 2 === 0 ? -1 : 1) * 8})`}>
        <rect x="-22" y="-22" width="44" height="44" rx="6" fill={c as string} stroke={OUT} strokeWidth="3" />
        <rect x="-18" y="-18" width="36" height="36" rx="4" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />
        <text x="0" y="8" textAnchor="middle" fontSize="22" fontFamily="Fredoka One, cursive" fill="#fff" stroke={OUT} strokeWidth="1">{n as number}</text>
      </g>
    ))}

    {/* ─── ZONE 5: CHALKBOARD with equation (right foreground) ─── */}
    <g transform="translate(560, 460)">
      <rect x="-8" y="-8" width="206" height="106" rx="8" fill="#7a5230" stroke={OUT} strokeWidth="3.5" />
      <rect x="0" y="0" width="190" height="90" rx="5" fill="#3a7a4a" />
      <rect x="0" y="0" width="190" height="90" fill="none" stroke={OUT} strokeWidth="2.5" rx="5" />
      <text x="95" y="38" textAnchor="middle" fontSize="22" fontFamily="Fredoka One, cursive" fill="#fff">2 + 3 = ?</text>
      <text x="95" y="72" textAnchor="middle" fontSize="20" fontFamily="Fredoka One, cursive" fill="#fcd34d">= 5!</text>
    </g>

    {/* ─── ZONE 6: MATH SYMBOLS floating in sky ─── */}
    {[['＋', 120, 130], ['－', 360, 110], ['＝', 580, 140], ['×', 900, 100], ['÷', 1140, 130]].map(([sym, x, y], i) => (
      <g key={`sym${i}`} transform={`translate(${x as number},${y as number})`} style={{ animation: `vn-float ${3 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}>
        <circle r="22" fill={['#e85b89', '#7fbef7', '#7bb24a', '#fcd34d', '#a36adb'][i]} stroke={OUT} strokeWidth="3" opacity="0.85" />
        <circle r="16" fill="#fff" opacity="0.3" />
        <text x="0" y="8" textAnchor="middle" fontSize="22" fontFamily="Fredoka One, cursive" fill="#fff" stroke={OUT} strokeWidth="0.8">{sym as string}</text>
      </g>
    ))}

    {/* ─── ZONE 7: STAR STICKERS in corners ─── */}
    {[[60, 130], [1220, 200], [1200, 480], [80, 480]].map(([x, y], i) => (
      <path key={`star${i}`} d={`M${x} ${y - 10} l3.5 8 9 0 -7 6 3 9 -8.5 -5 -8.5 5 3 -9 -7 -6 9 0 z`}
        fill="#fcd34d" stroke={OUT} strokeWidth="2"
        style={{ animation: `vn-sparkle ${2 + i * 0.3}s ease-in-out infinite` }} />
    ))}

    {/* ─── ZONE 8: TROPHY (right side, encouraging) ─── */}
    <g transform="translate(1150, 380)">
      <rect x="-12" y="22" width="24" height="10" rx="3" fill="#a87642" stroke={OUT} strokeWidth="2.5" />
      <rect x="-18" y="32" width="36" height="8" rx="3" fill="#a87642" stroke={OUT} strokeWidth="2.5" />
      <path d="M-18 0 Q-22 -28 0 -36 Q22 -28 18 0 Z" fill="#fcd34d" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
      <rect x="-4" y="0" width="8" height="22" fill="#fcd34d" stroke={OUT} strokeWidth="2" />
      <path d="M-18 -10 Q-28 -10 -26 0" stroke="#fcd34d" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M-18 -10 Q-28 -10 -26 0" stroke={OUT} strokeWidth="2" fill="none" />
      <path d="M18 -10 Q28 -10 26 0" stroke="#fcd34d" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M18 -10 Q28 -10 26 0" stroke={OUT} strokeWidth="2" fill="none" />
      <text x="0" y="-12" textAnchor="middle" fontSize="14" fontFamily="Fredoka One, cursive" fill="#fff" stroke={OUT} strokeWidth="0.8">★</text>
    </g>

    {/* ─── ZONE 9: HANGING BUNTING ─── */}
    <g>
      <path d="M0 60 Q200 90 400 60 Q600 40 800 65 Q1000 85 1280 60" stroke={OUT} strokeWidth="2" fill="none" />
      {[160, 280, 880, 1000, 1120].map((x, i) => (
        <path key={`flag${i}`} d={`M${x} 70 L${x + 14} 70 L${x + 7} 92 Z`} fill={['#e85b89', '#fcd34d', '#7fbef7', '#7bb24a', '#a36adb'][i]} stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
      ))}
    </g>

    <SpeechBubble x={250} y={460} text="1, 2, 3, 4, 5!" color="#fff" tailDir="left" delay={0.3} />
    <Sparkles count={18} area={[0, 0, W, H]} />
  </FrameBase>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SCENE 14 — Celebration party! Balloons, cake, confetti, banner.
   Bright pink/rainbow festive scene. Joyful win moment.
═══════════════════════════════════════════════════════════════ */
const Scene14: React.FC = () => {
  const OUT = '#3d2410';
  return (
  <FrameBase sky="pink">
    {/* ─── ZONE 1: SOFT PARTY GROUND ─── */}
    <rect x="0" y="540" width={W} height="180" fill="#fcd6df" />
    <rect x="0" y="538" width={W} height="6" fill="#e85b89" stroke={OUT} strokeWidth="2.5" />
    {Array.from({ length: 36 }).map((_, i) => (
      <circle key={`d${i}`} cx={20 + (i * 37) % W} cy={555 + (i % 3) * 50} r="3.5" fill="#fff" opacity="0.5" />
    ))}

    {/* ─── ZONE 2: STREAMERS hanging from top ─── */}
    {[0, 1, 2, 3, 4, 5].map((s) => (
      <g key={`stream${s}`}>
        <path d={`M${s * 230} 0 Q${s * 230 + 60} 50 ${s * 230 + 120} 30 Q${s * 230 + 180} 0 ${s * 230 + 240} 40`}
          stroke={['#e85b89', '#7fbef7', '#7bb24a', '#fcd34d', '#a36adb', '#e07b39'][s]} strokeWidth="6" fill="none" opacity="0.7" strokeLinecap="round" />
      </g>
    ))}

    {/* ─── ZONE 3: BANNER (top center) ─── */}
    <g transform="translate(640, 130)" style={{ animation: 'vn-bounce 2.5s ease-in-out infinite' }}>
      <path d="M-280 -36 Q-260 -42 -240 -36 L240 -36 Q260 -42 280 -36 L260 32 Q240 38 220 32 L-220 32 Q-240 38 -260 32 Z" fill="#fcd34d" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <path d="M-280 -36 L-260 -16 L-280 -2 Z" fill="#e85b89" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M280 -36 L260 -16 L280 -2 Z" fill="#e85b89" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
      <text x="0" y="14" textAnchor="middle" fontSize="36" fontFamily="Fredoka One, cursive" fill={OUT}>SELAMAT!</text>
    </g>

    {/* ─── ZONE 4: BIG CAKE (center foreground) ─── */}
    <g transform="translate(640, 460)">
      {/* Cake base layer */}
      <rect x="-72" y="40" width="144" height="56" rx="10" fill="#a87642" stroke={OUT} strokeWidth="3.5" />
      <rect x="-78" y="34" width="156" height="14" rx="6" fill="#fff" stroke={OUT} strokeWidth="2.5" />
      {/* Mid layer */}
      <rect x="-58" y="-8" width="116" height="42" rx="8" fill="#e85b89" stroke={OUT} strokeWidth="3.5" />
      <rect x="-62" y="-14" width="124" height="12" rx="6" fill="#fff" stroke={OUT} strokeWidth="2.5" />
      {/* Top layer */}
      <rect x="-40" y="-46" width="80" height="34" rx="8" fill="#f5a9c2" stroke={OUT} strokeWidth="3.5" />
      <rect x="-44" y="-50" width="88" height="10" rx="5" fill="#fff" stroke={OUT} strokeWidth="2.5" />
      {/* Decorations */}
      {[-30, -10, 10, 30].map((x, i) => <circle key={`spr${i}`} cx={x} cy={20} r="3" fill={['#fcd34d', '#7fbef7', '#7bb24a', '#a36adb'][i]} stroke={OUT} strokeWidth="1.2" />)}
      {[-50, -25, 0, 25, 50].map((x, i) => <circle key={`dr${i}`} cx={x} cy={64} r="3.5" fill={['#fcd34d', '#7fbef7', '#7bb24a', '#a36adb', '#e85b89'][i]} stroke={OUT} strokeWidth="1.2" />)}
      {/* Candles on top */}
      {[-24, -12, 0, 12, 24].map((cx, i) => (
        <g key={`cd${i}`}>
          <rect x={cx - 2.5} y={-66} width="5" height="22" rx="1.5" fill={['#e85b89', '#7fbef7', '#7bb24a', '#fcd34d', '#a36adb'][i]} stroke={OUT} strokeWidth="1.5" />
          <ellipse cx={cx} cy={-70} rx="3.5" ry="6" fill="#fcd34d" stroke="#e07b39" strokeWidth="1.5" style={{ animation: `vn-sparkle ${1 + i * 0.2}s ease-in-out infinite` }} />
        </g>
      ))}
    </g>

    {/* ─── ZONE 5: BALLOONS bouquet (left and right floating) ─── */}
    {[[140, 220], [220, 200], [300, 180], [950, 200], [1040, 180], [1130, 215]].map(([x, y], i) => (
      <g key={`bln${i}`} transform={`translate(${x},${y})`} style={{ animation: `vn-float ${3 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
        <ellipse cx="0" cy="0" rx="22" ry="28" fill={['#e85b89', '#7fbef7', '#7bb24a', '#fcd34d', '#a36adb', '#e07b39'][i]} stroke={OUT} strokeWidth="2.5" />
        <ellipse cx="-7" cy="-10" rx="6" ry="8" fill="#fff" opacity="0.4" />
        <path d="M0 28 L-3 36 L3 36 Z" fill={['#e85b89', '#7fbef7', '#7bb24a', '#fcd34d', '#a36adb', '#e07b39'][i]} stroke={OUT} strokeWidth="1.5" strokeLinejoin="round" />
        <path d={`M0 36 Q${(i % 2 === 0 ? 6 : -6)} 70 0 110`} stroke={OUT} strokeWidth="1.5" fill="none" />
      </g>
    ))}

    {/* ─── ZONE 6: GIFT BOXES (foreground left + right) ─── */}
    {[[200, 600, '#e85b89'], [280, 605, '#7fbef7'], [1020, 600, '#7bb24a'], [1100, 610, '#a36adb']].map(([x, y, c], i) => (
      <g key={`gift${i}`} transform={`translate(${x},${y}) rotate(${(i % 2 === 0 ? -1 : 1) * 6})`}>
        <rect x="-22" y="-22" width="44" height="44" rx="5" fill={c as string} stroke={OUT} strokeWidth="3" />
        <line x1="0" y1="-22" x2="0" y2="22" stroke="#fcd34d" strokeWidth="5" />
        <line x1="-22" y1="0" x2="22" y2="0" stroke="#fcd34d" strokeWidth="5" />
        <circle cx="0" cy="-22" r="6" fill="#fcd34d" stroke={OUT} strokeWidth="2" />
        <circle cx="-4" cy="-26" r="3" fill="#fcd34d" stroke={OUT} strokeWidth="1.5" />
        <circle cx="4" cy="-26" r="3" fill="#fcd34d" stroke={OUT} strokeWidth="1.5" />
      </g>
    ))}

    {/* ─── ZONE 7: PARTY HATS scattered ─── */}
    {[[400, 600], [840, 605]].map(([x, y], i) => (
      <g key={`hat${i}`} transform={`translate(${x},${y})`}>
        <path d="M0 -42 L-18 4 L18 4 Z" fill={['#e85b89', '#a36adb'][i]} stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="0" cy="4" rx="20" ry="5" fill={['#e85b89', '#a36adb'][i]} stroke={OUT} strokeWidth="2" />
        {/* Polka dots */}
        <circle cx="-6" cy="-12" r="2.5" fill="#fff" />
        <circle cx="4" cy="-22" r="2.5" fill="#fff" />
        <circle cx="-2" cy="-32" r="2" fill="#fff" />
        <circle cx="0" cy="-42" r="6" fill="#fcd34d" stroke={OUT} strokeWidth="2" />
      </g>
    ))}

    {/* ─── ZONE 8: CONFETTI falling ─── */}
    {Array.from({ length: 32 }).map((_, i) => (
      <rect key={`cf${i}`} x={(i * 87) % W} y={-20 - (i * 30) % 100} width="9" height="18" rx="2"
        fill={['#e85b89', '#7fbef7', '#7bb24a', '#fcd34d', '#a36adb', '#e07b39', '#f5a9c2'][i % 7]}
        stroke={OUT} strokeWidth="1"
        style={{ animation: `vn-confetti ${3 + (i % 3)}s linear infinite`, animationDelay: `${i * 0.15}s` }}
        transform={`rotate(${i * 25})`} />
    ))}

    {/* ─── ZONE 9: STAR EXPLOSION around cake ─── */}
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return (
        <g key={`stx${i}`} transform={`translate(${640 + Math.cos(a) * 240}, ${440 + Math.sin(a) * 130})`} style={{ animation: `vn-sparkle ${1 + i * 0.1}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }}>
          <path d="M0 -14 L4 -4 L14 -4 L6 2 L8 14 L0 8 L-8 14 L-6 2 L-14 -4 L-4 -4 Z" fill="#fcd34d" stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
        </g>
      );
    })}

    {/* ─── ZONE 10: MUSIC NOTES + horn ─── */}
    {[[120, 330], [280, 280], [1020, 320], [1180, 280]].map(([x, y], i) => (
      <g key={`note${i}`} transform={`translate(${x},${y})`} style={{ animation: `vn-float ${2.5 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}>
        <text fontSize="32" fontFamily="serif" fill={['#a36adb', '#7fbef7', '#e85b89', '#7bb24a'][i]} stroke={OUT} strokeWidth="1.5">♪</text>
      </g>
    ))}

    {/* Party horn */}
    <g transform="translate(440, 480)">
      <path d="M0 0 L40 -10 L42 0 L4 8 Z" fill="#fcd34d" stroke={OUT} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="0" cy="4" r="9" fill="#e85b89" stroke={OUT} strokeWidth="2.5" />
      {[0, 1, 2].map((w) => (
        <path key={`sw${w}`} d={`M${44 + w * 8} -12 Q${50 + w * 8} 0 ${44 + w * 8} 10`} stroke="#fcd34d" strokeWidth="2.5" fill="none" opacity={0.8 - w * 0.2} strokeLinecap="round" />
      ))}
    </g>

    <Sparkles count={20} area={[0, 0, W, H]} />
  </FrameBase>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SCENE 15 — Adventure begins. Signpost, treasure map, rainbow.
   Big sky, friendly horizon, ready to explore.
═══════════════════════════════════════════════════════════════ */
const Scene15: React.FC = () => {
  const OUT = '#3d2410';
  return (
  <FrameBase sky="day">
    {/* ─── ZONE 1: BACKGROUND HILLS ─── */}
    <Hills />

    {/* ─── ZONE 2: SOFT GRASSY GROUND ─── */}
    <rect x="0" y="640" width={W} height="80" fill="#7bb24a" />
    <rect x="0" y="638" width={W} height="6" fill="#5e9438" stroke={OUT} strokeWidth="2.5" />
    {Array.from({ length: 18 }).map((_, i) => (
      <path key={`gt${i}`} d="M0 0 L-3 -8 L0 -2 L3 -8 L0 0 Z" fill="#5e9438" stroke={OUT} strokeWidth="1.2" transform={`translate(${30 + (i * 70) % W}, ${652 + (i % 3) * 8})`} />
    ))}

    {/* ─── ZONE 3: WINDING PATH (center) ─── */}
    <path d="M540 720 Q620 660 640 600 Q660 540 720 500 Q800 460 760 420" fill="none" stroke="#d4a06a" strokeWidth="36" strokeLinecap="round" />
    <path d="M540 720 Q620 660 640 600 Q660 540 720 500 Q800 460 760 420" fill="none" stroke="#a87642" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.7" />

    {/* ─── ZONE 4: BIG RAINBOW arc behind ─── */}
    <g opacity="0.65">
      {['#e85b89', '#fcd34d', '#7bb24a', '#7fbef7', '#a36adb', '#f5a9c2'].map((c, i) => (
        <path key={`rb${i}`} d={`M40 ${600 - i * 10} Q640 ${180 - i * 24} 1240 ${600 - i * 10}`} fill="none" stroke={c} strokeWidth="14" />
      ))}
    </g>

    {/* ─── ZONE 5: SUN with face (top right) ─── */}
    <g transform="translate(1100, 160)">
      <circle r="46" fill="#fcd34d" stroke={OUT} strokeWidth="3.5" />
      <circle r="34" fill="#fdd87a" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={`r${i}`} x1={Math.cos(a) * 50} y1={Math.sin(a) * 50} x2={Math.cos(a) * 70} y2={Math.sin(a) * 70} stroke="#fcd34d" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />;
      })}
      <circle cx="-10" cy="-6" r="3" fill={OUT} />
      <circle cx="10" cy="-6" r="3" fill={OUT} />
      <path d="M-10 6 Q0 14 10 6" stroke={OUT} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="-16" cy="6" r="3.5" fill="#f5a9c2" opacity="0.7" />
      <circle cx="16" cy="6" r="3.5" fill="#f5a9c2" opacity="0.7" />
    </g>

    {/* ─── ZONE 6: BIG TITLE banner ─── */}
    <g transform="translate(640, 130)" style={{ animation: 'vn-bounce 2.5s ease-in-out infinite' }}>
      <path d="M-220 -34 Q-200 -40 -180 -34 L180 -34 Q200 -40 220 -34 L200 30 Q180 36 160 30 L-160 30 Q-180 36 -200 30 Z" fill="#fcd34d" stroke={OUT} strokeWidth="4" strokeLinejoin="round" />
      <text x="0" y="12" textAnchor="middle" fontSize="40" fontFamily="Fredoka One, cursive" fill={OUT}>AYO MAIN!</text>
    </g>

    {/* ─── ZONE 7: SIGNPOST pointing to different worlds (center) ─── */}
    <g transform="translate(440, 380)">
      <rect x="-5" y="0" width="10" height="180" rx="2" fill="#a87642" stroke={OUT} strokeWidth="3" />
      {/* Sign 1 — TAMAN */}
      <g transform="translate(0, 10)">
        <path d="M5 -12 L85 -12 L100 0 L85 12 L5 12 Z" fill="#7fbef7" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <text x="48" y="5" textAnchor="middle" fontSize="13" fontFamily="Fredoka One, cursive" fill="#fff">TAMAN</text>
      </g>
      {/* Sign 2 — HUTAN (left) */}
      <g transform="translate(0, 50)">
        <path d="M-5 -12 L-85 -12 L-100 0 L-85 12 L-5 12 Z" fill="#7bb24a" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <text x="-48" y="5" textAnchor="middle" fontSize="13" fontFamily="Fredoka One, cursive" fill="#fff">HUTAN</text>
      </g>
      {/* Sign 3 — KOTA */}
      <g transform="translate(0, 90)">
        <path d="M5 -12 L85 -12 L100 0 L85 12 L5 12 Z" fill="#a36adb" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <text x="48" y="5" textAnchor="middle" fontSize="13" fontFamily="Fredoka One, cursive" fill="#fff">KOTA</text>
      </g>
      {/* Sign 4 — RUMAH */}
      <g transform="translate(0, 130)">
        <path d="M-5 -12 L-85 -12 L-100 0 L-85 12 L-5 12 Z" fill="#e85b89" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <text x="-48" y="5" textAnchor="middle" fontSize="13" fontFamily="Fredoka One, cursive" fill="#fff">RUMAH</text>
      </g>
    </g>

    {/* ─── ZONE 8: TREASURE MAP (left foreground) ─── */}
    <g transform="translate(160, 460)" style={{ animation: 'vn-float 4s ease-in-out infinite' }}>
      <rect x="-4" y="-4" width="148" height="118" rx="6" fill="#a87642" stroke={OUT} strokeWidth="3" transform="rotate(-4)" />
      <rect x="0" y="0" width="140" height="110" rx="4" fill="#fbe8c8" stroke={OUT} strokeWidth="2.5" transform="rotate(-4)" />
      {/* Map content */}
      <g transform="rotate(-4)">
        <path d="M14 28 Q40 36 64 32 Q90 28 116 44 Q124 50 130 48" stroke="#e85b89" strokeWidth="2.5" fill="none" strokeDasharray="5 4" />
        <circle cx="128" cy="48" r="6" fill="none" stroke="#e85b89" strokeWidth="2.5" />
        <text x="128" y="52" textAnchor="middle" fontSize="10" fontFamily="Fredoka One, cursive" fill="#e85b89">X</text>
        <path d="M20 70 Q40 82 60 72 Q80 64 100 78" stroke="#7a5230" strokeWidth="2" fill="none" />
        {/* Compass rose on map */}
        <g transform="translate(28, 88)">
          <circle r="11" fill="none" stroke={OUT} strokeWidth="1.5" />
          <path d="M0 -10 L3 0 L-3 0 Z" fill="#e85b89" stroke={OUT} strokeWidth="1.2" />
          <text x="0" y="-12" textAnchor="middle" fontSize="6" fontFamily="Fredoka One, cursive" fill={OUT}>N</text>
        </g>
        {/* Mountain doodle */}
        <path d="M76 24 L86 14 L96 24 L106 18 L116 24" stroke="#7a5230" strokeWidth="1.5" fill="none" />
      </g>
    </g>

    {/* ─── ZONE 9: ADVENTURE BACKPACK + HAT (right foreground) ─── */}
    <g transform="translate(960, 540)">
      {/* Backpack */}
      <rect x="-26" y="0" width="52" height="60" rx="8" fill="#7bb24a" stroke={OUT} strokeWidth="3" />
      <rect x="-20" y="8" width="40" height="22" rx="4" fill="#5e9438" stroke={OUT} strokeWidth="2.5" />
      <rect x="-30" y="10" width="8" height="40" rx="3" fill="#7bb24a" stroke={OUT} strokeWidth="2" />
      <rect x="22" y="10" width="8" height="40" rx="3" fill="#7bb24a" stroke={OUT} strokeWidth="2" />
      <circle cx="0" cy="40" r="5" fill="#fcd34d" stroke={OUT} strokeWidth="2" />
    </g>
    {/* Adventure hat */}
    <g transform="translate(870, 510)">
      <ellipse cx="0" cy="14" rx="36" ry="9" fill="#a87642" stroke={OUT} strokeWidth="3" />
      <path d="M-22 14 Q-22 -14 0 -18 Q22 -14 22 14" fill="#c89968" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
      <rect x="-14" y="6" width="28" height="6" rx="2" fill="#7a5230" stroke={OUT} strokeWidth="1.8" />
      <circle cx="-2" cy="9" r="2.5" fill="#fcd34d" stroke={OUT} strokeWidth="1.2" />
    </g>

    {/* ─── ZONE 10: TREES + clouds + decorations ─── */}
    <PaintedTree x={80} y={480} scale={1.6} />
    <PaintedTree x={1180} y={490} scale={1.5} flip />
    <PaintedCloud x={300} y={80} scale={1.3} />
    <PaintedCloud x={840} y={70} scale={1.5} />

    {/* Trail marker stones */}
    {[[600, 670], [680, 678], [760, 670]].map(([x, y], i) => (
      <g key={`stone${i}`}>
        <ellipse cx={x} cy={y + 2} rx="20" ry="8" fill="#a87642" />
        <ellipse cx={x} cy={y} rx="20" ry="8" fill="#c89968" stroke={OUT} strokeWidth="2.5" />
      </g>
    ))}

    {/* Floating star confetti */}
    {[[140, 200], [240, 280], [1080, 280], [1200, 200], [1180, 460], [120, 550]].map(([x, y], i) => (
      <path key={`star${i}`} d={`M${x} ${y - 12} l4 9 9.5 0 -7.5 6 3.5 9.5 -9.5 -5.5 -9.5 5.5 3.5 -9.5 -7.5 -6 9.5 0 z`}
        fill="#fcd34d" stroke={OUT} strokeWidth="2"
        style={{ animation: `vn-sparkle ${2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
    ))}

    {/* Butterflies */}
    {[[520, 320], [780, 290]].map(([x, y], i) => (
      <g key={`bf${i}`} transform={`translate(${x},${y})`} style={{ animation: `vn-float ${2 + i * 0.5}s ease-in-out infinite` }}>
        <path d="M0 0 Q-12 -10 -6 -16 Q0 -10 0 0 Q0 -10 6 -16 Q12 -10 0 0 Z" fill={['#a36adb', '#e85b89'][i]} stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="0" cy="-2" r="1.5" fill={OUT} />
      </g>
    ))}

    <Sparkles count={20} area={[0, 100, W, 600]} />
  </FrameBase>
  );
};


/* ═══════════════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════════════ */
export const VN_SCENES: VNScene[] = [
  { id: 1, caption: 'Pagi yang cerah… Vima baru saja bangun di kamarnya yang penuh mainan.', Component: Scene01 },
  { id: 2, caption: 'Tiba-tiba sebuah portal cahaya muncul! Siapa itu yang turun?', Component: Scene02 },
  { id: 3, caption: '"Halo, aku Vimo!" — robot kecil itu melambai dengan ceria.', Component: Scene03 },
  { id: 4, caption: 'Di taman bermain, ada bola warna-warni. Ayo hitung bersama!', Component: Scene04 },
  { id: 5, caption: 'Di dapur, buah-buahan segar menunggu untuk dihitung.', Component: Scene05 },
  { id: 6, caption: 'Di sekolah, ada teka-teki pola warna di papan tulis!', Component: Scene06 },
  { id: 7, caption: 'Di pasar mini, mereka belanja dan mengelompokkan barang.', Component: Scene07 },
  { id: 8, caption: 'Di jalan raya, belajar arah dan rambu lalu lintas bersama.', Component: Scene08 },
  { id: 9, caption: 'Di rak mainan, ayo susun balok sesuai urutan yang benar!', Component: Scene09 },
  { id: 10, caption: 'Layar TV menyala — saatnya kuis hitung bola emas!', Component: Scene10 },
  { id: 11, caption: 'Misi akhir: kumpulkan semua kristal ajaib di langit senja.', Component: Scene11 },
  { id: 12, caption: 'Vimo memimpin di antara bukit bunga yang indah.', Component: Scene12 },
  { id: 13, caption: 'Belajar berhitung 1 sampai 5 jadi seru bersama Vimo!', Component: Scene13 },
  { id: 14, caption: 'Pesta perayaan! Kamu berhasil menyelesaikan semua tantangan!', Component: Scene14 },
  { id: 15, caption: 'Petualangan dimulai sekarang. Ayo main bersama Vimo!', Component: Scene15 },
];
