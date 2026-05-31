import { PaintedColors as C } from '@/components/painted';
import { motion } from 'framer-motion';

/* ════════════════════════════════════════════════════════════════
   KID — chibi anime schoolkid, hand-drawn vector.
   FIXED: Cute face (not horror), attached arms, same outfit.
══════════════════════════════════════════════════════════════════ */

interface KidProps {
  size?: number;
  variant?: 'girl' | 'boy';
  pose?: 'idle' | 'wave' | 'point' | 'cheer' | 'walk' | 'sleep' | 'hi' | 'up';
  expression?: 'happy' | 'wow' | 'curious';
  flip?: boolean;
}

const INK = C.ink;

export function KidCharacter({
  size = 180,
  variant = 'girl',
  pose = 'idle',
  expression = 'happy',
  flip,
}: KidProps) {
  const skin = '#fbd5b6';
  const hairBase = variant === 'girl' ? '#5a3618' : '#2a1606';
  const hairHi = variant === 'girl' ? '#a36a3a' : '#5a3618';
  const ribbonColor = variant === 'girl' ? '#e85b89' : C.blue;
  const skirtColor = variant === 'girl' ? '#d94373' : '#1c2c5e';

  return (
    <motion.svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 200 280"
      style={{ display: 'block', transform: flip ? 'scaleX(-1)' : undefined, overflow: 'visible' }}
      animate={{ 
        y: [0, -4, 0],
        rotate: [0, 0.5, -0.5, 0]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* ground shadow */}
      <ellipse cx="100" cy="270" rx="46" ry="5" fill={INK} opacity="0.22" />

      {/* HAIR BACK */}
      {variant === 'girl' && (
        <g>
          <path d="M52 60 Q40 70 38 100 Q34 140 40 178 Q44 196 56 198 Q56 170 60 140 Q64 110 70 88 Z" fill={hairBase} />
          <path d="M148 60 Q160 70 162 100 Q166 140 160 178 Q156 196 144 198 Q144 170 140 140 Q136 110 130 88 Z" fill={hairBase} />
        </g>
      )}

      {/* LEGS */}
      <g>
        <rect x="78" y="222" width="14" height="38" rx="7" fill={skin} stroke={INK} strokeWidth="2.5" />
        <rect x="110" y="222" width="14" height="38" rx="7" fill={skin} stroke={INK} strokeWidth="2.5" />
        {/* shoes */}
        <path d="M74 260 Q85 268 96 260 V 254 H 74 Z" fill={INK} stroke={INK} strokeWidth="2" />
        <path d="M106 260 Q117 268 128 260 V 254 H 106 Z" fill={INK} stroke={INK} strokeWidth="2" />
      </g>

      {/* ARMS (ATTACHED) */}
      <ArmsLayer pose={pose} skin={skin} />

      {/* BODY / OUTFIT */}
      <g>
        {/* white shirt */}
        <path d="M62 130 Q56 168 62 188 Q70 196 100 196 Q130 196 138 188 Q144 168 138 130 Q126 122 100 122 Q74 122 62 130 Z" fill="#ffffff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        {/* skirt */}
        <path d="M58 188 Q50 210 60 226 Q80 232 100 232 Q120 232 140 226 Q150 210 142 188 Z" fill={skirtColor} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        {/* collar & bowtie */}
        <path d="M86 122 L100 138 L114 122" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
        <g transform="translate(100, 138)">
          <rect x="-4" y="-5" width="8" height="10" fill={ribbonColor} stroke={INK} strokeWidth="2" />
          <path d="M-4 -2 Q-20 -8 -20 4 Q-10 6 -4 4 Z" fill={ribbonColor} stroke={INK} strokeWidth="2" />
          <path d="M4 -2 Q20 -8 20 4 Q10 6 4 4 Z" fill={ribbonColor} stroke={INK} strokeWidth="2" />
        </g>
      </g>

      {/* HEAD */}
      <g>
        <rect x="92" y="106" width="16" height="20" fill={skin} stroke={INK} strokeWidth="2.5" />
        <ellipse cx="100" cy="68" rx="42" ry="44" fill={skin} stroke={INK} strokeWidth="3" />
        
        {/* CUTE EYES (Not Horror) */}
        <CuteEyes expression={expression} />
        
        {/* Cute Mouth */}
        <path d="M92 95 Q100 102 108 95" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        
        {/* Cheeks */}
        <ellipse cx="68" cy="88" rx="8" ry="4" fill="#f7a8be" opacity="0.6" />
        <ellipse cx="132" cy="88" rx="8" ry="4" fill="#f7a8be" opacity="0.6" />
      </g>

      {/* HAIR FRONT (SIDE BANGS) */}
      <g>
        <path d="M40 56 Q44 24 80 18 Q102 12 126 18 Q160 26 158 60 Q146 36 124 36 Q108 38 96 50 Q80 36 60 40 Q48 44 40 56 Z" fill={hairBase} stroke={INK} strokeWidth="3" />
        {/* Side bangs */}
        <path d="M45 48 Q55 25 105 32 Q135 38 145 65 Q125 45 105 45 Q75 42 60 68 Q50 75 45 48 Z" fill={hairBase} stroke={INK} strokeWidth="2.5" />
        <path d="M65 35 Q85 30 115 35" stroke={hairHi} strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* flower pin */}
        <g transform="translate(142, 48)">
          <circle r="6" fill="#f5a9c2" stroke={INK} strokeWidth="1.5" />
          <circle r="2" fill="#fcd34d" stroke={INK} strokeWidth="1" />
        </g>
      </g>
    </motion.svg>
  );
}

function CuteEyes({ expression }: { expression: string }) {
  return (
    <g>
      {[78, 122].map((cx, i) => (
        <g key={i}>
          {/* Eye socket */}
          <ellipse cx={cx} cy={72} rx="10" ry="13" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
          {/* Iris */}
          <circle cx={cx} cy={74} r="7" fill="#5a3618" />
          {/* Pupil */}
          <circle cx={cx} cy={74} r="4" fill={INK} />
          {/* Sparkles (Making it cute/non-horror) */}
          <circle cx={cx - 3} cy={69} r="3.5" fill="#ffffff" />
          <circle cx={cx + 3} cy={78} r="1.5" fill="#ffffff" />
        </g>
      ))}
    </g>
  );
}

function ArmsLayer({ pose, skin }: { pose: string; skin: string }) {
  // Use relative rotation based on shoulder pivot points
  const leftRot = pose === 'hi' ? -140 : pose === 'up' ? -160 : 15;
  const rightRot = pose === 'up' ? 160 : pose === 'hi' ? -15 : -15;

  return (
    <g>
      {/* Left Shoulder (Pivot point) */}
      <motion.g 
        animate={{ rotate: leftRot }}
        style={{ transformOrigin: "64px 132px" }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <rect x="58" y="132" width="12" height="36" rx="6" fill={skin} stroke={INK} strokeWidth="2.5" />
        <circle cx="64" cy="172" r="8" fill={skin} stroke={INK} strokeWidth="2.5" />
      </motion.g>

      {/* Right Shoulder (Pivot point) */}
      <motion.g 
        animate={{ rotate: rightRot }}
        style={{ transformOrigin: "136px 132px" }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <rect x="130" y="132" width="12" height="36" rx="6" fill={skin} stroke={INK} strokeWidth="2.5" />
        <circle cx="136" cy="172" r="8" fill={skin} stroke={INK} strokeWidth="2.5" />
      </motion.g>
    </g>
  );
}
