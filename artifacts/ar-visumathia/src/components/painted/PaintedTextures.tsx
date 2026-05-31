/**
 * Vector-cartoon design tokens, defs, and reusable scenery primitives.
 * Style rules (match the cozy bike-delivery reference):
 *   • Flat color fills only — ONE accent shadow shape overlaid
 *   • Thick dark outlines (≈3px), rounded joins
 *   • No gradients except the sky window inside the day-dial
 *   • Hand-drawn imperfection: asymmetric placement, slight wobble
 */

/* ───────────── PALETTE TOKENS (canonical hex values) ───────────── */
export const C = {
  ink: '#2a1908',
  ink2: '#3d2410',

  cream: '#f4e2b3',
  creamDark: '#e0c98b',
  creamShade: '#caa766',

  paper: '#fff7df',
  paperShade: '#ead9a3',

  woodLight: '#c89968',
  woodMid: '#9c6b3f',
  woodDark: '#5a3618',
  woodGrain: '#3d2410',

  skyTop: '#9fd1eb',
  skyMid: '#cfeaf3',
  skyHaze: '#fbe7c4',
  cloud: '#ffffff',
  cloudShade: '#e3ebf0',

  hillFar: '#9fc086',
  hillMid: '#6cb04d',
  hillNear: '#4f8e34',
  hillShade: '#3a6824',
  grass: '#6cb04d',
  grassShade: '#3f6f2a',

  red: '#e15a3b',
  redShade: '#a83828',
  redDark: '#7a1f1f',
  yellow: '#f5b942',
  yellowShade: '#d18c1d',
  green: '#7bb24a',
  greenShade: '#4f8e34',
  blue: '#4d9bc8',
  blueShade: '#2c6f9c',
  purple: '#5e4ea8',
  purpleShade: '#3d2f7a',
  orange: '#e07b39',
  orangeShade: '#a85a1f',

  petalPink: '#f6c2d2',
  petalCenter: '#fcd34d',
};

/* ───────────── Defs (clip paths & ONE allowed gradient) ───────────── */
export function PaintedDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        {/* Day-time sky gradient — used ONLY inside the dial sky window. */}
        <linearGradient id="hp-day-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.skyTop} />
          <stop offset="1" stopColor={C.skyMid} />
        </linearGradient>

        <linearGradient id="hp-dawn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd6a5" />
          <stop offset="1" stopColor="#fbe7c4" />
        </linearGradient>

        <linearGradient id="hp-dusk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7a360" />
          <stop offset="1" stopColor="#fbd3a5" />
        </linearGradient>

        <linearGradient id="hp-night-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#243b6e" />
          <stop offset="1" stopColor="#4d6e9a" />
        </linearGradient>

        <clipPath id="hp-circle-clip">
          <circle cx="100" cy="100" r="58" />
        </clipPath>
      </defs>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   CARTOON CLOUD — chunky overlapping ellipses with one shadow pass.
══════════════════════════════════════════════════════════════════ */
export function PaintedCloud({
  x = 0,
  y = 0,
  scale = 1,
  variant = 'a',
}: {
  x?: number;
  y?: number;
  scale?: number;
  variant?: 'a' | 'b' | 'c';
}) {
  const VARIANTS = {
    a: { puffs: [{ cx: -36, cy: 6, rx: 26, ry: 22 }, { cx: -2, cy: -6, rx: 30, ry: 26 }, { cx: 30, cy: 0, rx: 26, ry: 22 }, { cx: 50, cy: 14, rx: 22, ry: 18 }] },
    b: { puffs: [{ cx: -28, cy: 8, rx: 22, ry: 18 }, { cx: 0, cy: -2, rx: 26, ry: 22 }, { cx: 28, cy: 8, rx: 24, ry: 20 }] },
    c: { puffs: [{ cx: -42, cy: 10, rx: 28, ry: 22 }, { cx: -10, cy: -4, rx: 30, ry: 26 }, { cx: 22, cy: -8, rx: 28, ry: 24 }, { cx: 50, cy: 4, rx: 26, ry: 20 }, { cx: 70, cy: 18, rx: 18, ry: 14 }] },
  };
  const puffs = VARIANTS[variant].puffs;

  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* detailed shadow under-belly with multiple tones */}
      <g>
        {puffs.map((p, i) => (
          <g key={`s-group-${i}`}>
            <ellipse
              cx={p.cx}
              cy={p.cy + p.ry * 0.6}
              rx={p.rx * 0.98}
              ry={p.ry * 0.5}
              fill={C.cloudShade}
              opacity="0.8"
            />
            {/* secondary deep shadow for depth */}
            <ellipse
              cx={p.cx - 5}
              cy={p.cy + p.ry * 0.7}
              rx={p.rx * 0.6}
              ry={p.ry * 0.25}
              fill="#d1dce5"
              opacity="0.5"
            />
          </g>
        ))}
      </g>
      {/* white body */}
      {puffs.map((p, i) => (
        <ellipse key={`b${i}`} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={C.cloud} />
      ))}
      {/* soft inner highlight for fluffiness */}
      {puffs.map((p, i) => (
        <ellipse
          key={`h${i}`}
          cx={p.cx - p.rx * 0.2}
          cy={p.cy - p.ry * 0.2}
          rx={p.rx * 0.5}
          ry={p.ry * 0.4}
          fill="#ffffff"
          opacity="0.9"
        />
      ))}
      {/* outline drawn as ONE merged silhouette with varying thickness */}
      <g
        fill="none"
        stroke={C.ink}
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {puffs.map((p, i) => (
          <ellipse key={`o${i}`} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} />
        ))}
      </g>
      {/* artistic "sketch" lines for texture */}
      <g stroke={C.ink} strokeWidth="1.5" fill="none" opacity="0.15">
        {puffs.map((p, i) => (
          <path
            key={`t${i}`}
            d={`M ${p.cx - p.rx * 0.4} ${p.cy + p.ry * 0.3} Q ${p.cx} ${p.cy + p.ry * 0.5} ${p.cx + p.rx * 0.4} ${p.cy + p.ry * 0.3}`}
          />
        ))}
      </g>
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════
   CARTOON TREE — chunky leafy crown over a stubby trunk.
   Professional detail: wood grain, multi-tone leaves, shading.
══════════════════════════════════════════════════════════════════ */
export function PaintedTree({
  x = 0,
  y = 0,
  scale = 1,
  flip = false,
}: {
  x?: number;
  y?: number;
  scale?: number;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -scale : scale}, ${scale})`}>
      {/* trunk shadow then trunk */}
      <rect x="-9" y="-26" width="18" height="44" fill={C.woodDark} rx="3" />
      <rect x="-9" y="-26" width="14" height="44" fill={C.woodMid} rx="3" />
      
      {/* Wood grain details */}
      <g stroke={C.woodGrain} strokeWidth="1.5" opacity="0.4">
        <path d="M -4 -15 L -4 5" />
        <path d="M 2 -20 L 2 10" />
        <path d="M -1 -5 Q 2 0 -1 5" />
      </g>

      <rect x="-9" y="-26" width="18" height="44" fill="none" stroke={C.ink} strokeWidth="3.2" rx="3" strokeLinejoin="round" />
      
      {/* crown — overlapping leafy lobes with professional shading */}
      <g>
        {/* base deep shadow */}
        <ellipse cx="2" cy="-46" rx="42" ry="34" fill={C.hillShade} />
        
        {/* main lobes with color variation */}
        <ellipse cx="-15" cy="-52" rx="24" ry="22" fill={C.hillMid} />
        <ellipse cx="16" cy="-60" rx="24" ry="24" fill={C.hillNear} />
        <ellipse cx="0" cy="-68" rx="22" ry="20" fill={C.hillMid} />
        <ellipse cx="-24" cy="-42" rx="18" ry="16" fill={C.hillNear} />
        <ellipse cx="24" cy="-42" rx="18" ry="16" fill={C.hillMid} />
        
        {/* artistic highlights */}
        <ellipse cx="-8" cy="-68" rx="11" ry="6" fill="#a3d075" opacity="0.9" />
        <ellipse cx="16" cy="-74" rx="8" ry="4" fill="#c0e695" opacity="0.8" />
        <path d="M -15 -55 Q -10 -60 -5 -55" stroke="#fff" strokeWidth="2" opacity="0.2" fill="none" />
        
        {/* leaf cluster details (small circles) */}
        <circle cx="-25" cy="-55" r="4" fill={C.hillShade} opacity="0.3" />
        <circle cx="20" cy="-65" r="3" fill={C.hillShade} opacity="0.3" />
        <circle cx="0" cy="-45" r="5" fill={C.hillShade} opacity="0.3" />

        {/* outline silhouette with thick-thin dynamic feel */}
        <path
          d="M -42 -42 Q -35 -68 -12 -72 Q -6 -88 14 -84 Q 30 -88 36 -72 Q 46 -58 42 -40 Q 34 -24 20 -24 H -18 Q -36 -24 -42 -42 Z"
          fill="none"
          stroke={C.ink}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════
   GRASS TUFT — three small stalks
══════════════════════════════════════════════════════════════════ */
export function PaintedGrassTuft({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path
        d="M-1 0 Q-5 -10 -8 -16 M0 0 Q1 -12 1 -20 M1 0 Q5 -10 9 -16"
        stroke={C.grassShade}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════
   FLOWER — petal cluster with a center dot
══════════════════════════════════════════════════════════════════ */
export function PaintedFlower({ x, y, color = C.petalPink, scale = 1 }: { x: number; y: number; color?: string; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <circle r="3.4" fill={color} />
      <circle r="3.4" fill="none" stroke={C.ink} strokeWidth="1.4" />
      <circle r="1.4" fill={C.petalCenter} />
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════
   FULL-BLEED CARTOON SKY MEADOW BACKDROP
   Flat color hills, chunky clouds, scattered trees, grass + flowers
══════════════════════════════════════════════════════════════════ */
export function PaintedSkyMeadow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1280 720"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
    >
      {/* SKY — soft pastel band */}
      <rect width="1280" height="720" fill={C.skyTop} />
      <rect width="1280" height="200" y="180" fill={C.skyMid} />

      {/* Distant hills (flat color, single accent shadow stripe) */}
      <g>
        <path d="M0 470 Q160 400 320 440 T640 420 T960 445 T1280 415 L1280 720 L0 720 Z" fill={C.hillFar} />
        <path d="M0 470 Q160 400 320 440 T640 420 T960 445 T1280 415" stroke={C.ink} strokeWidth="3" fill="none" strokeLinejoin="round" />

        <path d="M0 530 Q200 470 400 510 T800 490 T1280 515 L1280 720 L0 720 Z" fill={C.hillMid} />
        <path d="M0 530 Q200 470 400 510 T800 490 T1280 515" stroke={C.ink} strokeWidth="3" fill="none" strokeLinejoin="round" />

        <path d="M0 600 Q220 555 440 600 T880 580 T1280 605 L1280 720 L0 720 Z" fill={C.hillNear} />
        <path d="M0 600 Q220 555 440 600 T880 580 T1280 605" stroke={C.ink} strokeWidth="3" fill="none" strokeLinejoin="round" />
      </g>

      {/* Clouds */}
      <g>
        <PaintedCloud x={170} y={120} scale={1.1} variant="a" />
        <PaintedCloud x={560} y={90} scale={1.5} variant="c" />
        <PaintedCloud x={920} y={140} scale={0.9} variant="b" />
        <PaintedCloud x={1130} y={210} scale={0.7} variant="a" />
      </g>

      {/* Mid-distance trees */}
      <g>
        <PaintedTree x={130} y={580} scale={1} />
        <PaintedTree x={1060} y={580} scale={1.1} flip />
        <PaintedTree x={870} y={602} scale={0.85} />
        <PaintedTree x={300} y={605} scale={0.8} flip />
      </g>

      {/* Foreground grass + flowers */}
      <g>
        {Array.from({ length: 28 }).map((_, i) => {
          const x = 24 + (i * 47) % 1280;
          const y = 670 + (i % 4) * 12;
          return <PaintedGrassTuft key={i} x={x} y={y} />;
        })}
        {[80, 260, 480, 720, 940, 1180, 360, 880].map((x, i) => (
          <PaintedFlower
            key={i}
            x={x}
            y={690 + (i % 2) * 8}
            color={i % 2 === 0 ? C.petalPink : '#c8d8ff'}
          />
        ))}
      </g>
    </svg>
  );
}
