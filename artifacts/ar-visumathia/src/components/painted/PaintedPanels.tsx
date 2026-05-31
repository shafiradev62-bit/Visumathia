import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { C } from './PaintedTextures';

/* ════════════════════════════════════════════════════════════════
   FLAT-CARTOON PANELS — wood plank, parchment paper, signs.
   Style rules:
     • Flat color, ONE accent shadow, thick ink outline
     • Hand-drawn imperfection (rounded joins, slight asymmetry)
     • No procedural noise / no fake gradients
══════════════════════════════════════════════════════════════════ */

interface BasePanelProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
  className?: string;
}

/* ───────────────────────────────────────────────
   WOOD PLANK PANEL — horizontal planks like the reference
   shop interior. Flat color + plank seams + corner pegs.
─────────────────────────────────────────────── */
export function WoodPanel({
  width = '100%',
  height = '100%',
  children,
  className,
  ...rest
}: BasePanelProps) {
  return (
    <motion.div
      className={className}
      style={{ position: 'relative', width, height, ...((rest as any).style ?? {}) }}
      {...rest}
    >
      <svg
        viewBox="0 0 600 400"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        {/* Outer dark frame */}
        <rect x="4" y="4" width="592" height="392" rx="20" fill={C.woodDark} />
        {/* Plank body — alternating two warm browns for visual weight */}
        <rect x="14" y="14" width="572" height="372" rx="14" fill={C.woodMid} />
        {/* horizontal plank stripes (alternating darker bands) */}
        {[58, 122, 186, 250, 314].map((y) => (
          <rect key={y} x="14" y={y} width="572" height="6" fill={C.woodDark} opacity="0.85" />
        ))}
        {/* alternating lighter rows */}
        {[80, 144, 208, 272, 336].map((y) => (
          <rect key={y} x="14" y={y} width="572" height="20" fill={C.woodLight} opacity="0.18" />
        ))}
        {/* outer ink outline */}
        <rect x="4" y="4" width="592" height="392" rx="20" fill="none" stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
        {/* inner ink frame */}
        <rect x="14" y="14" width="572" height="372" rx="14" fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinejoin="round" />
        {/* corner pegs */}
        {[
          [26, 26],
          [574, 26],
          [26, 374],
          [574, 374],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="6" fill={C.ink} />
            <circle cx={x - 1.4} cy={y - 1.4} r="2" fill={C.cream} opacity="0.9" />
          </g>
        ))}
      </svg>

      <div style={{ position: 'relative', width: '100%', height: '100%' }}>{children}</div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   PARCHMENT PANEL — clean cream paper card.
─────────────────────────────────────────────── */
export function ParchmentPanel({
  width = '100%',
  height = '100%',
  children,
  className,
  ...rest
}: BasePanelProps) {
  return (
    <motion.div
      className={className}
      style={{ position: 'relative', width, height, ...((rest as any).style ?? {}) }}
      {...rest}
    >
      <svg
        viewBox="0 0 600 400"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        {/* outer shadow plate */}
        <rect x="4" y="6" width="592" height="392" rx="18" fill={C.ink} opacity="0.18" />
        {/* paper body (single flat cream) */}
        <rect x="2" y="2" width="592" height="392" rx="18" fill={C.paper} />
        {/* warm bottom shading band — single accent shape */}
        <rect x="2" y="280" width="592" height="114" rx="14" fill={C.paperShade} opacity="0.55" />
        {/* outline */}
        <rect x="2" y="2" width="592" height="392" rx="18" fill="none" stroke={C.ink} strokeWidth="3.5" strokeLinejoin="round" />
        {/* tiny corner hearts to feel hand-drawn */}
        <path d="M16 388 q-3 -3 -1 -6 q3 -2 5 1 q2 -3 5 -1 q2 3 -1 6" fill={C.creamShade} />
        <path d="M584 16 q-3 -3 -1 -6 q3 -2 5 1 q2 -3 5 -1 q2 3 -1 6 q -4 4 -8 0 z" fill={C.creamShade} />
      </svg>

      <div style={{ position: 'relative', width: '100%', height: '100%' }}>{children}</div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   WOODEN SIGN BANNER — chunky horizontal plank board
   with hanging ropes, like the "YOYO'S REPAIR SHOP" reference.
─────────────────────────────────────────────── */
export function WoodSign({
  text,
  width = 320,
  height = 90,
  textColor = '#fff4c4',
  className,
}: {
  text: string;
  width?: number | string;
  height?: number | string;
  textColor?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ position: 'relative', width, height, display: 'inline-block' }}
    >
      <svg
        viewBox="0 0 320 90"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        {/* Hanging ropes */}
        <line x1="40" y1="-2" x2="40" y2="14" stroke={C.ink} strokeWidth="3" />
        <line x1="280" y1="-2" x2="280" y2="14" stroke={C.ink} strokeWidth="3" />

        {/* shadow plate */}
        <rect x="14" y="14" width="298" height="68" rx="6" fill={C.ink} opacity="0.25" />
        {/* sign body */}
        <rect x="10" y="10" width="298" height="68" rx="6" fill={C.woodMid} />
        {/* upper plank highlight stripe */}
        <rect x="14" y="14" width="290" height="14" rx="3" fill={C.woodLight} opacity="0.45" />
        {/* lower plank shade stripe */}
        <rect x="14" y="58" width="290" height="16" rx="3" fill={C.woodDark} opacity="0.55" />
        {/* central plank seam */}
        <line x1="159" y1="14" x2="159" y2="74" stroke={C.woodDark} strokeWidth="2" opacity="0.7" />
        {/* outline */}
        <rect x="10" y="10" width="298" height="68" rx="6" fill="none" stroke={C.ink} strokeWidth="3.5" strokeLinejoin="round" />
        {/* corner studs */}
        {[
          [22, 22],
          [296, 22],
          [22, 66],
          [296, 66],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill={C.ink} />
            <circle cx={x - 0.7} cy={y - 0.7} r="1" fill={C.cream} />
          </g>
        ))}
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: textColor,
          fontFamily: "'Fredoka One', cursive",
          fontSize: 'clamp(14px, 2.4vw, 26px)',
          letterSpacing: '0.04em',
          textShadow: `0 2px 0 ${C.ink}, 0 4px 0 rgba(0,0,0,0.25)`,
          padding: '0 18px',
          textAlign: 'center',
          lineHeight: 1,
          pointerEvents: 'none',
          textTransform: 'uppercase',
        }}
      >
        {text}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   ROAD SIGN — small wooden pointed marker.
─────────────────────────────────────────────── */
export function RoadSign({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: 110,
        height: 50,
        display: 'inline-block',
      }}
    >
      <svg
        viewBox="0 0 110 50"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <rect x="6" y="40" width="6" height="10" fill={C.woodDark} />
        <rect x="6" y="40" width="6" height="10" fill="none" stroke={C.ink} strokeWidth="1.5" />

        <path d="M2 8 H86 L106 25 L86 42 H2 Z" fill={C.woodMid} />
        <path d="M2 12 H82" stroke={C.woodLight} strokeWidth="2" opacity="0.55" />
        <path d="M2 8 H86 L106 25 L86 42 H2 Z" fill="none" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          paddingRight: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff4c4',
          fontFamily: "'Fredoka One', cursive",
          fontSize: 14,
          letterSpacing: '0.06em',
          textShadow: `0 2px 0 ${C.ink}`,
          textTransform: 'uppercase',
          pointerEvents: 'none',
        }}
      >
        {text} ›
      </div>
    </div>
  );
}
