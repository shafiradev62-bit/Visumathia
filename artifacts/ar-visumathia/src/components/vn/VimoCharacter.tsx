import { PaintedColors as C } from '@/components/painted';
import { motion } from 'framer-motion';

/* ════════════════════════════════════════════════════════════════
   VIMO — robot mascot drawn as hand-rigged 2D vector character.
   FIXED: Attached arms and smooth movements.
══════════════════════════════════════════════════════════════════ */

type Pose = 'idle' | 'wave' | 'point' | 'cheer' | 'think' | 'walk' | 'hi' | 'up';

interface VimoProps {
  size?: number;
  pose?: Pose;
  expression?: 'happy' | 'wow' | 'curious' | 'proud';
  flip?: boolean;
}

const INK = C.ink;

export function VimoCharacter({
  size = 140,
  pose = 'idle',
  expression = 'happy',
  flip,
}: VimoProps) {
  return (
    <motion.svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 140 180"
      style={{ display: 'block', transform: flip ? 'scaleX(-1)' : undefined }}
      animate={{ 
        y: [0, -6, 0],
        rotate: [0, 0.5, -0.5, 0]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {/* ground shadow */}
      <ellipse cx="70" cy="172" rx="34" ry="4" fill={INK} opacity="0.25" />

      {/* ARMS (ATTACHED) */}
      <ArmsLayer pose={pose} />

      {/* BODY */}
      <g>
        <rect x="50" y="124" width="14" height="44" rx="6" fill="#5fbcd1" stroke={INK} strokeWidth="2.5" />
        <rect x="76" y="124" width="14" height="44" rx="6" fill="#5fbcd1" stroke={INK} strokeWidth="2.5" />
        <ellipse cx="57" cy="168" rx="11" ry="5" fill={INK} />
        <ellipse cx="83" cy="168" rx="11" ry="5" fill={INK} />
        <rect x="40" y="68" width="60" height="62" rx="14" fill="#7ad9f0" stroke={INK} strokeWidth="3" />
        <rect x="86" y="68" width="14" height="62" rx="14" fill="#4ea4bd" opacity="0.5" />
        <rect x="40" y="118" width="60" height="10" fill="#3a8093" stroke={INK} strokeWidth="2.5" />
        <rect x="64" y="120" width="12" height="6" rx="1.5" fill={C.yellow} stroke={INK} strokeWidth="1.5" />
        <rect x="54" y="80" width="32" height="22" rx="6" fill={C.creamDark} stroke={INK} strokeWidth="2.5" />
        <path d="M60 92 h6 l3 -6 l4 12 l3 -8 l3 4 h6" stroke={C.red} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* HEAD */}
      <g>
        <rect x="64" y="60" width="12" height="12" fill={C.creamDark} stroke={INK} strokeWidth="2" />
        <rect x="34" y="14" width="72" height="54" rx="20" fill="#ffffff" stroke={INK} strokeWidth="3" />
        <rect x="92" y="14" width="14" height="54" rx="14" fill={C.cloudShade} opacity="0.6" />
        <line x1="70" y1="14" x2="70" y2="-2" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="70" cy="-4" r="6" fill={C.red} stroke={INK} strokeWidth="2.5" />
        <rect x="42" y="26" width="56" height="32" rx="14" fill={C.creamDark} stroke={INK} strokeWidth="2.5" />
        <circle cx="56" cy="42" r="4" fill={INK} />
        <circle cx="84" cy="42" r="4" fill={INK} />
        <path d="M62 51 Q70 58 78 51" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </motion.svg>
  );
}

function ArmsLayer({ pose }: { pose: Pose }) {
  const leftRot = pose === 'hi' ? -140 : pose === 'up' ? -160 : 10;
  const rightRot = pose === 'up' ? 160 : pose === 'hi' ? -10 : -10;

  return (
    <g>
      <motion.g 
        animate={{ rotate: leftRot }}
        style={{ transformOrigin: "40px 75px" }}
        transition={{ type: "spring", stiffness: 80 }}
      >
        <rect x="34" y="75" width="12" height="46" rx="6" fill="#5fbcd1" stroke={INK} strokeWidth="2.5" />
        <ellipse cx="40" cy="121" rx="8" ry="8" fill="#fff" stroke={INK} strokeWidth="2.5" />
      </motion.g>
      <motion.g 
        animate={{ rotate: rightRot }}
        style={{ transformOrigin: "100px 75px" }}
        transition={{ type: "spring", stiffness: 80 }}
      >
        <rect x="94" y="75" width="12" height="46" rx="6" fill="#5fbcd1" stroke={INK} strokeWidth="2.5" />
        <ellipse cx="100" cy="121" rx="8" ry="8" fill="#fff" stroke={INK} strokeWidth="2.5" />
      </motion.g>
    </g>
  );
}
