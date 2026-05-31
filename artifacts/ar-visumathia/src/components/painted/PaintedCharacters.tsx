import { C } from './PaintedTextures';

/* ════════════════════════════════════════════════════════════════
   PAINTED CHARACTER PORTRAITS (2D-art mascot illustrations)
   ─────────────────────────────────────────────────────────────────
   Each character is drawn from scratch with the same flat-cartoon
   rules: chunky shapes, single-pass shadow, thick ink outline.

   Vimo  — small friendly robot mascot (the in-game tutor)
   Vima  — cheerful girl explorer (player avatar)
   Granny — friendly grandma NPC (Grandma Yuma reference)
   Farmer — kind farmer NPC (Farmer Ren reference)
══════════════════════════════════════════════════════════════════ */

interface CharProps {
  size?: number;
  className?: string;
}

/* ─────────────────────── VIMO (robot mascot) ─────────────────────── */
export function PaintedVimo({ size = 120, className }: CharProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className}>
      {/* shadow */}
      <ellipse cx="100" cy="180" rx="50" ry="6" fill={C.ink} opacity="0.25" />
      {/* legs */}
      <rect x="74" y="148" width="14" height="28" rx="6" fill="#88a4d6" />
      <rect x="112" y="148" width="14" height="28" rx="6" fill="#88a4d6" />
      <rect x="68" y="170" width="26" height="10" rx="4" fill={C.ink} />
      <rect x="106" y="170" width="26" height="10" rx="4" fill={C.ink} />
      {/* body — rounded-square chassis */}
      <rect x="58" y="80" width="84" height="76" rx="22" fill="#e8edf4" />
      <rect x="58" y="80" width="84" height="20" rx="14" fill="#cdd9ec" />
      {/* body shadow */}
      <path d="M120 80 V148 a22 22 0 0 1 -8 8 H132 a10 10 0 0 0 10 -10 V100 a20 20 0 0 0 -22 -20 z" fill="#a3b5d3" opacity="0.55" />
      {/* chest screen */}
      <rect x="76" y="108" width="48" height="32" rx="6" fill="#3a4a6a" />
      <rect x="80" y="112" width="40" height="24" rx="4" fill="#7bc7f0" />
      {/* tiny waveform */}
      <path d="M84 124 H92 V120 H102 V128 H110 V124 H116" stroke="#fffbe8" strokeWidth="2.4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {/* arms */}
      <rect x="40" y="100" width="20" height="40" rx="10" fill="#cdd9ec" />
      <rect x="140" y="100" width="20" height="40" rx="10" fill="#cdd9ec" />
      <circle cx="50" cy="142" r="11" fill="#e8edf4" />
      <circle cx="150" cy="142" r="11" fill="#e8edf4" />
      {/* head */}
      <rect x="62" y="36" width="76" height="60" rx="20" fill="#f3f6fb" />
      <rect x="62" y="36" width="76" height="18" rx="14" fill="#dde6f1" />
      {/* head ink */}
      <rect x="62" y="36" width="76" height="60" rx="20" fill="none" stroke={C.ink} strokeWidth="3" />
      {/* visor */}
      <rect x="72" y="58" width="56" height="22" rx="11" fill="#3a4a6a" />
      <rect x="72" y="58" width="56" height="22" rx="11" fill="none" stroke={C.ink} strokeWidth="2.5" />
      {/* eyes */}
      <circle cx="90" cy="69" r="6" fill="#7bc7f0" />
      <circle cx="110" cy="69" r="6" fill="#7bc7f0" />
      <circle cx="91.5" cy="67" r="2" fill="#fff" />
      <circle cx="111.5" cy="67" r="2" fill="#fff" />
      {/* antenna */}
      <line x1="100" y1="20" x2="100" y2="36" stroke={C.ink} strokeWidth="3" />
      <circle cx="100" cy="18" r="6" fill={C.red} />
      <circle cx="100" cy="18" r="6" fill="none" stroke={C.ink} strokeWidth="2" />
      <circle cx="98" cy="16" r="2" fill="#ffd5c4" />
      {/* smile dent under visor */}
      <path d="M88 86 q12 6 24 0" stroke={C.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* ear bolts */}
      <circle cx="62" cy="66" r="5" fill={C.cream} />
      <circle cx="62" cy="66" r="5" fill="none" stroke={C.ink} strokeWidth="2" />
      <circle cx="138" cy="66" r="5" fill={C.cream} />
      <circle cx="138" cy="66" r="5" fill="none" stroke={C.ink} strokeWidth="2" />
      {/* full body ink outline drawn LAST */}
      <g fill="none" stroke={C.ink} strokeWidth="3" strokeLinejoin="round">
        <rect x="58" y="80" width="84" height="76" rx="22" />
        <rect x="40" y="100" width="20" height="40" rx="10" />
        <rect x="140" y="100" width="20" height="40" rx="10" />
        <circle cx="50" cy="142" r="11" />
        <circle cx="150" cy="142" r="11" />
        <rect x="76" y="108" width="48" height="32" rx="6" />
        <rect x="74" y="148" width="14" height="28" rx="6" />
        <rect x="112" y="148" width="14" height="28" rx="6" />
      </g>
    </svg>
  );
}

/* ─────────────────────── VIMA (girl explorer) ─────────────────────── */
export function PaintedVima({ size = 120, className }: CharProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 240" className={className}>
      <ellipse cx="100" cy="220" rx="48" ry="6" fill={C.ink} opacity="0.25" />
      {/* legs */}
      <rect x="80" y="160" width="14" height="50" rx="6" fill="#3d2410" />
      <rect x="106" y="160" width="14" height="50" rx="6" fill="#3d2410" />
      {/* shoes */}
      <rect x="74" y="200" width="22" height="14" rx="4" fill="#e15a3b" />
      <rect x="104" y="200" width="22" height="14" rx="4" fill="#e15a3b" />
      {/* dress / shirt */}
      <path d="M62 100 Q68 90 86 86 H114 Q132 90 138 100 L142 168 H58 Z" fill="#f4d23a" />
      {/* dress shadow side */}
      <path d="M104 90 Q132 92 138 100 L142 168 H110 Z" fill="#c89927" opacity="0.55" />
      {/* belt */}
      <rect x="64" y="148" width="74" height="10" fill="#a83828" />
      {/* sleeves */}
      <ellipse cx="60" cy="118" rx="14" ry="20" fill="#f4d23a" />
      <ellipse cx="140" cy="118" rx="14" ry="20" fill="#f4d23a" />
      {/* hands */}
      <circle cx="56" cy="142" r="11" fill="#c98a64" />
      <circle cx="144" cy="142" r="11" fill="#c98a64" />
      {/* neck */}
      <rect x="92" y="78" width="16" height="12" fill="#c98a64" />
      {/* head — heart-ish */}
      <path d="M62 56 Q62 26 100 26 Q138 26 138 56 Q138 84 100 90 Q62 84 62 56 Z" fill="#e9bd92" />
      {/* face shadow on right */}
      <path d="M100 26 Q138 26 138 56 Q138 84 100 90 Z" fill="#c98a64" opacity="0.5" />
      {/* hair — pixie with bangs */}
      <path
        d="M58 50 Q58 18 100 18 Q142 18 142 52 Q142 60 130 56 Q120 38 100 38 Q80 38 70 56 Q58 60 58 50 Z"
        fill="#1c0e08"
      />
      {/* side bun */}
      <circle cx="138" cy="56" r="9" fill="#1c0e08" />
      {/* eyes */}
      <circle cx="86" cy="58" r="4.5" fill={C.ink} />
      <circle cx="114" cy="58" r="4.5" fill={C.ink} />
      <circle cx="87" cy="56" r="1.6" fill="#fff" />
      <circle cx="115" cy="56" r="1.6" fill="#fff" />
      {/* blush */}
      <ellipse cx="80" cy="68" rx="6" ry="3" fill="#f6c2d2" opacity="0.7" />
      <ellipse cx="120" cy="68" rx="6" ry="3" fill="#f6c2d2" opacity="0.7" />
      {/* smile */}
      <path d="M92 74 q8 6 16 0" stroke={C.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* outline pass */}
      <g fill="none" stroke={C.ink} strokeWidth="3" strokeLinejoin="round">
        <path d="M62 56 Q62 26 100 26 Q138 26 138 56 Q138 84 100 90 Q62 84 62 56 Z" />
        <path d="M62 100 Q68 90 86 86 H114 Q132 90 138 100 L142 168 H58 Z" />
        <ellipse cx="60" cy="118" rx="14" ry="20" />
        <ellipse cx="140" cy="118" rx="14" ry="20" />
        <circle cx="56" cy="142" r="11" />
        <circle cx="144" cy="142" r="11" />
        <rect x="80" y="160" width="14" height="50" rx="6" />
        <rect x="106" y="160" width="14" height="50" rx="6" />
        <rect x="74" y="200" width="22" height="14" rx="4" />
        <rect x="104" y="200" width="22" height="14" rx="4" />
      </g>
    </svg>
  );
}

/* ─────────────────────── GRANDMA YUMA ─────────────────────── */
export function PaintedGranny({ size = 120, className }: CharProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 240" className={className}>
      <ellipse cx="100" cy="220" rx="48" ry="6" fill={C.ink} opacity="0.25" />
      {/* dress */}
      <path d="M50 110 Q60 100 80 96 H120 Q140 100 150 110 L160 220 H40 Z" fill="#5e4ea8" />
      {/* dress shadow */}
      <path d="M104 96 Q140 100 150 110 L160 220 H110 Z" fill="#3d2f7a" opacity="0.55" />
      {/* apron stripe */}
      <rect x="86" y="118" width="28" height="80" fill="#cdd9ec" />
      {/* hands */}
      <circle cx="50" cy="148" r="12" fill="#e6c9a6" />
      <circle cx="150" cy="148" r="12" fill="#e6c9a6" />
      {/* head */}
      <ellipse cx="100" cy="64" rx="42" ry="42" fill="#e6c9a6" />
      {/* face shadow */}
      <path d="M100 22 a42 42 0 0 1 0 84 z" fill="#c89968" opacity="0.45" />
      {/* hair / scarf cap */}
      <path d="M54 54 Q48 18 100 18 Q152 18 146 54 Q140 30 100 30 Q60 30 54 54 Z" fill="#cdd9ec" />
      <path d="M54 54 Q48 18 100 18 Q152 18 146 54 Q140 30 100 30 Q60 30 54 54 Z" fill="none" stroke={C.ink} strokeWidth="3" />
      {/* knot on top */}
      <path d="M86 18 Q100 4 114 18" fill="#cdd9ec" stroke={C.ink} strokeWidth="3" />
      {/* glasses (closed crescent eyes) */}
      <path d="M78 64 q6 -6 14 0 M108 64 q6 -6 14 0" stroke={C.ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* smile */}
      <path d="M86 84 q14 8 28 0" stroke={C.ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <ellipse cx="76" cy="76" rx="5" ry="3" fill="#f6c2d2" opacity="0.7" />
      <ellipse cx="124" cy="76" rx="5" ry="3" fill="#f6c2d2" opacity="0.7" />
      {/* outline pass */}
      <g fill="none" stroke={C.ink} strokeWidth="3" strokeLinejoin="round">
        <ellipse cx="100" cy="64" rx="42" ry="42" />
        <path d="M50 110 Q60 100 80 96 H120 Q140 100 150 110 L160 220 H40 Z" />
        <circle cx="50" cy="148" r="12" />
        <circle cx="150" cy="148" r="12" />
      </g>
    </svg>
  );
}

/* ─────────────────────── FARMER REN ─────────────────────── */
export function PaintedFarmer({ size = 120, className }: CharProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 240" className={className}>
      <ellipse cx="100" cy="220" rx="48" ry="6" fill={C.ink} opacity="0.25" />
      {/* legs */}
      <rect x="80" y="160" width="14" height="50" rx="6" fill="#2c6f9c" />
      <rect x="106" y="160" width="14" height="50" rx="6" fill="#2c6f9c" />
      {/* boots */}
      <rect x="72" y="200" width="24" height="14" rx="4" fill={C.woodDark} />
      <rect x="104" y="200" width="24" height="14" rx="4" fill={C.woodDark} />
      {/* shirt */}
      <path d="M58 100 Q66 90 84 86 H116 Q134 90 142 100 L146 170 H54 Z" fill="#4d9bc8" />
      <path d="M104 88 Q134 92 142 100 L146 170 H110 Z" fill={C.blueShade} opacity="0.5" />
      {/* sash */}
      <path d="M70 100 L130 130" stroke="#a83828" strokeWidth="10" strokeLinecap="round" />
      {/* arms */}
      <ellipse cx="56" cy="120" rx="14" ry="22" fill="#4d9bc8" />
      <ellipse cx="144" cy="120" rx="14" ry="22" fill="#4d9bc8" />
      <circle cx="52" cy="148" r="11" fill="#d8a472" />
      <circle cx="148" cy="148" r="11" fill="#d8a472" />
      {/* head */}
      <ellipse cx="100" cy="62" rx="34" ry="36" fill="#e8c191" />
      <path d="M100 26 a34 36 0 0 1 0 72 z" fill="#b48352" opacity="0.45" />
      {/* hair — short blonde */}
      <path d="M68 50 Q70 24 100 24 Q130 24 132 50 Q120 32 100 32 Q80 32 68 50 Z" fill="#e8c45f" />
      <path d="M68 50 Q70 24 100 24 Q130 24 132 50 Q120 32 100 32 Q80 32 68 50 Z" fill="none" stroke={C.ink} strokeWidth="3" />
      {/* straw hat brim */}
      <ellipse cx="100" cy="34" rx="56" ry="10" fill="#e5a51e" />
      <ellipse cx="100" cy="34" rx="56" ry="10" fill="none" stroke={C.ink} strokeWidth="3" />
      {/* hat top */}
      <path d="M70 34 Q80 8 100 8 Q120 8 130 34 Z" fill="#fbd76b" />
      <path d="M70 34 Q80 8 100 8 Q120 8 130 34 Z" fill="none" stroke={C.ink} strokeWidth="3" />
      {/* hat band */}
      <rect x="74" y="28" width="52" height="6" fill="#a83828" />
      {/* eyes */}
      <circle cx="88" cy="60" r="4" fill={C.ink} />
      <circle cx="112" cy="60" r="4" fill={C.ink} />
      <circle cx="89" cy="58" r="1.4" fill="#fff" />
      <circle cx="113" cy="58" r="1.4" fill="#fff" />
      {/* smile */}
      <path d="M88 78 q12 8 24 0" stroke={C.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* outline pass */}
      <g fill="none" stroke={C.ink} strokeWidth="3" strokeLinejoin="round">
        <ellipse cx="100" cy="62" rx="34" ry="36" />
        <path d="M58 100 Q66 90 84 86 H116 Q134 90 142 100 L146 170 H54 Z" />
        <ellipse cx="56" cy="120" rx="14" ry="22" />
        <ellipse cx="144" cy="120" rx="14" ry="22" />
        <circle cx="52" cy="148" r="11" />
        <circle cx="148" cy="148" r="11" />
        <rect x="80" y="160" width="14" height="50" rx="6" />
        <rect x="106" y="160" width="14" height="50" rx="6" />
        <rect x="72" y="200" width="24" height="14" rx="4" />
        <rect x="104" y="200" width="24" height="14" rx="4" />
      </g>
    </svg>
  );
}
