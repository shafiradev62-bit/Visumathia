import { C } from './PaintedTextures';

/**
 * Flat-cartoon icons (Adobe Illustrator look).
 * Build pattern:
 *   1. ONE flat base color block
 *   2. ONE shadow-shape overlay (curved or trimmed copy)
 *   3. ONE small light highlight
 *   4. Thick rounded ink outline drawn LAST
 */

const INK = C.ink;

interface IconProps {
  size?: number;
  className?: string;
}

/* ──────────────── COIN — sand-dollar / shell coin ──────────────── */
export function PaintedCoin({ size = 36, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      {/* drop shadow */}
      <ellipse cx="24" cy="40" rx="14" ry="2.4" fill={INK} opacity="0.2" />
      {/* base coin */}
      <circle cx="24" cy="24" r="18" fill="#c98a2c" />
      {/* face */}
      <circle cx="24" cy="22" r="16" fill="#f3c95a" />
      {/* shadow crescent */}
      <path d="M40 24 a 16 16 0 0 1 -32 0 c 0 -2 1 -4 2 -5 a 14 14 0 0 0 28 0 c 1 1 2 3 2 5 z" fill="#cd9b2c" opacity="0.55" />
      {/* shell swirl */}
      <path
        d="M16 22 q 8 -10 16 0 q 4 4 -2 8 q -8 5 -10 -3"
        fill="none"
        stroke="#a36a1d"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="24" cy="22" r="2" fill="#a36a1d" />
      {/* highlight */}
      <path d="M14 16 q 6 -6 12 -6" stroke="#fff7c4" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* outline */}
      <circle cx="24" cy="24" r="18" fill="none" stroke={INK} strokeWidth="2.6" />
    </svg>
  );
}

/* ──────────────── MILK BOTTLE ──────────────── */
export function PaintedMilk({ size = 36, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <ellipse cx="24" cy="42" rx="11" ry="2.2" fill={INK} opacity="0.2" />
      {/* glass body */}
      <rect x="14" y="18" width="20" height="24" rx="3.5" fill="#dfeaf1" />
      {/* milk inside */}
      <rect x="16" y="22" width="16" height="18" rx="2.5" fill="#fdfbef" />
      {/* shadow on right of glass */}
      <rect x="28" y="22" width="4" height="18" rx="1.5" fill="#cfd9e0" opacity="0.7" />
      {/* neck */}
      <rect x="17" y="12" width="14" height="6" fill="#dfeaf1" />
      {/* cap */}
      <rect x="16" y="9" width="16" height="5" rx="1.5" fill={C.red} />
      <rect x="16" y="9" width="16" height="2" rx="1.5" fill="#f1825c" />
      {/* outline */}
      <g fill="none" stroke={INK} strokeWidth="2.4" strokeLinejoin="round">
        <rect x="14" y="18" width="20" height="24" rx="3.5" />
        <rect x="17" y="12" width="14" height="6" />
        <rect x="16" y="9" width="16" height="5" rx="1.5" />
      </g>
    </svg>
  );
}

/* ──────────────── HEART ──────────────── */
export function PaintedHeart({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <path
        d="M20 33 C 5 23 4 13 11 9 c 3 -2 7 -1 9 2 c 2 -3 6 -4 9 -2 c 7 4 6 14 -9 24 Z"
        fill={C.red}
      />
      {/* shadow lobe */}
      <path
        d="M20 33 C 12 27 7 21 8 14 c 0 -1 1 -2 2 -3 c 4 4 7 9 10 22 z"
        fill={C.redShade}
        opacity="0.45"
      />
      {/* highlight */}
      <path d="M12 11 q 4 -3 9 1" stroke="#ffd5c4" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path
        d="M20 33 C 5 23 4 13 11 9 c 3 -2 7 -1 9 2 c 2 -3 6 -4 9 -2 c 7 4 6 14 -9 24 Z"
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ──────────────── STAR ──────────────── */
export function PaintedStar({
  size = 36,
  filled = true,
  className,
}: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <path
        d="M24 6 L29 18 L42 19 L32 28 L36 41 L24 34 L12 41 L16 28 L6 19 L19 18 Z"
        fill={filled ? C.yellow : 'rgba(45,27,14,0.18)'}
      />
      {filled && (
        <path
          d="M24 6 L24 34 L12 41 L16 28 L6 19 L19 18 Z"
          fill="#e5a51e"
          opacity="0.55"
        />
      )}
      {filled && (
        <path d="M22 10 L26 18" stroke="#fff7c4" strokeWidth="2.4" strokeLinecap="round" />
      )}
      <path
        d="M24 6 L29 18 L42 19 L32 28 L36 41 L24 34 L12 41 L16 28 L6 19 L19 18 Z"
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ──────────────── GEM ──────────────── */
export function PaintedGem({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <polygon points="10,16 20,7 30,16 20,34" fill={C.blue} />
      {/* face cuts */}
      <polygon points="10,16 30,16 20,34" fill={C.blueShade} opacity="0.55" />
      <polygon points="20,7 16,16 24,16" fill="#cfeefd" />
      <polygon
        points="10,16 20,7 30,16 20,34"
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* internal facet lines */}
      <path d="M10 16 L20 16 M30 16 L20 16 M16 16 L20 7 M24 16 L20 7" stroke={INK} strokeWidth="1.4" />
    </svg>
  );
}

/* ──────────────── ENERGY (lightning) ──────────────── */
export function PaintedEnergy({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <path d="M22 4 L8 24 H17 L13 36 L30 14 H21 Z" fill={C.yellow} />
      <path d="M21 6 L11 22" stroke="#fff7c4" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M22 4 L8 24 H17 L13 36 L30 14 H21 Z"
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ──────────────── BACK ARROW (red round button graphic) ──────────────── */
export function PaintedBackArrow({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <ellipse cx="24" cy="44" rx="14" ry="2.5" fill={INK} opacity="0.22" />
      {/* base red pill */}
      <ellipse cx="24" cy="22" rx="20" ry="18" fill={C.red} />
      {/* highlight band on top */}
      <ellipse cx="24" cy="14" rx="14" ry="5" fill="#ffd5c4" opacity="0.7" />
      {/* shadow band on bottom */}
      <ellipse cx="24" cy="32" rx="16" ry="5" fill={C.redShade} opacity="0.55" />
      {/* arrow */}
      <path
        d="M28 14 L17 24 L28 34 M17 24 H32"
        stroke="#fff7e8"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <ellipse cx="24" cy="22" rx="20" ry="18" fill="none" stroke={INK} strokeWidth="2.6" />
    </svg>
  );
}

/* ──────────────── PLAY (triangle disk) ──────────────── */
export function PaintedPlay({
  size = 64,
  color = C.green,
  className,
}: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <ellipse cx="32" cy="58" rx="22" ry="3" fill={INK} opacity="0.22" />
      <circle cx="32" cy="32" r="26" fill={color} />
      <ellipse cx="32" cy="22" rx="18" ry="6" fill="#ffffff" opacity="0.35" />
      <ellipse cx="32" cy="46" rx="18" ry="6" fill="#000000" opacity="0.18" />
      <polygon points="26,20 46,32 26,44" fill="#fff4c4" />
      <circle cx="32" cy="32" r="26" fill="none" stroke={INK} strokeWidth="2.8" />
    </svg>
  );
}

/* ──────────────── COMPASS ROSE (parchment + arrows) ──────────────── */
export function PaintedCompassRose({ size = 96, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={className}>
      <circle cx="48" cy="48" r="40" fill={C.cream} />
      <circle cx="48" cy="48" r="40" fill="none" stroke={INK} strokeWidth="3" />
      <circle cx="48" cy="48" r="32" fill="none" stroke={C.woodMid} strokeWidth="1.4" opacity="0.7" />
      {/* cardinal needles */}
      <polygon points="48,12 52,46 44,46" fill={C.red} />
      <polygon points="48,12 48,46 44,46" fill={C.redShade} />
      <polygon points="48,84 52,50 44,50" fill={C.cream} />
      <polygon points="48,84 52,50 48,50" fill={C.woodMid} />
      <polygon points="12,48 46,44 46,52" fill={C.cream} />
      <polygon points="84,48 50,44 50,52" fill={C.cream} />
      {/* labels */}
      <text x="48" y="11" textAnchor="middle" fontSize="9" fontFamily="Fredoka One, cursive" fill={INK}>N</text>
      <text x="48" y="93" textAnchor="middle" fontSize="9" fontFamily="Fredoka One, cursive" fill={INK}>S</text>
      <text x="8" y="51" textAnchor="middle" fontSize="9" fontFamily="Fredoka One, cursive" fill={INK}>W</text>
      <text x="88" y="51" textAnchor="middle" fontSize="9" fontFamily="Fredoka One, cursive" fill={INK}>E</text>
      <circle cx="48" cy="48" r="4" fill={INK} />
      <circle cx="48" cy="48" r="2" fill={C.cream} />
    </svg>
  );
}

/* ──────────────── POUCH / BACKPACK ──────────────── */
export function PaintedPouch({ size = 36, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <ellipse cx="20" cy="36" rx="13" ry="2" fill={INK} opacity="0.22" />
      {/* body */}
      <path d="M8 16 Q8 32 14 36 H26 Q32 32 32 16 Z" fill={C.woodMid} />
      {/* shadow stripe down */}
      <path d="M22 16 Q22 32 26 36 H30 Q32 32 32 16 Z" fill={C.woodDark} opacity="0.55" />
      {/* fold cap */}
      <path d="M8 16 Q20 12 32 16 V20 Q20 22 8 20 Z" fill="#c69553" />
      {/* tie / strap */}
      <path d="M16 8 Q20 5 24 8" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="22" r="3" fill={C.woodDark} />
      <path
        d="M8 16 Q8 32 14 36 H26 Q32 32 32 16 Z"
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M8 20 Q20 22 32 20" stroke={INK} strokeWidth="2" fill="none" />
    </svg>
  );
}

/* ──────────────── BIKE WHEEL (for shop / repair vibes) ──────────────── */
export function PaintedWheel({ size = 36, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <ellipse cx="20" cy="36" rx="11" ry="2" fill={INK} opacity="0.22" />
      <circle cx="20" cy="20" r="14" fill={C.ink2} />
      <circle cx="20" cy="20" r="13" fill="#3d2410" />
      <circle cx="20" cy="20" r="8" fill={C.cream} />
      {/* spokes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const x2 = 20 + Math.cos(a) * 12;
        const y2 = 20 + Math.sin(a) * 12;
        return <line key={i} x1="20" y1="20" x2={x2} y2={y2} stroke={INK} strokeWidth="1.4" />;
      })}
      <circle cx="20" cy="20" r="2.5" fill={INK} />
      <circle cx="20" cy="20" r="14" fill="none" stroke={INK} strokeWidth="2.4" />
    </svg>
  );
}

/* ──────────────── DEPRECATION-FREE EXPORT ALIAS ──────────────── */
export { PaintedCoin as PaintedShellCoin };
