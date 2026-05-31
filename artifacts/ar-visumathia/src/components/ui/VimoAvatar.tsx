/**
 * High-resolution SVG avatar of Vimo — a super cute Disney/Pixar-style kid.
 * Used in dialogue bubbles, HUD, and completion screens.
 * Renders as crisp vector at any size.
 */
export function VimoAvatar({ size = 48, variant = 'idle' }: { size?: number; variant?: 'idle' | 'celebrate' | 'think' }) {
  const isHappy = variant === 'celebrate';
  const isThinking = variant === 'think';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* Background circle */}
      <circle cx="60" cy="60" r="58" fill="url(#bg-gradient)" />

      {/* Hair back */}
      <ellipse cx="60" cy="42" rx="32" ry="28" fill="#5C3317" />
      <ellipse cx="60" cy="52" rx="28" ry="18" fill="#4A2810" />

      {/* Face */}
      <ellipse cx="60" cy="58" rx="26" ry="27" fill="#FFDAB9" />

      {/* Hair bangs */}
      <ellipse cx="60" cy="38" rx="24" ry="14" fill="#5C3317" />
      <ellipse cx="48" cy="42" rx="8" ry="10" fill="#6B3A1F" />
      <ellipse cx="72" cy="42" rx="8" ry="10" fill="#6B3A1F" />
      {/* Wispy bangs */}
      <path d="M42 44 Q50 36 58 42" stroke="#5C3317" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M62 42 Q70 36 78 44" stroke="#5C3317" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Ears */}
      <ellipse cx="34" cy="60" rx="5" ry="6" fill="#FFDAB9" />
      <ellipse cx="86" cy="60" rx="5" ry="6" fill="#FFDAB9" />

      {/* Eyes — big, sparkly Disney eyes */}
      {/* Left eye */}
      <ellipse cx="48" cy="58" rx="9" ry={isHappy ? 5 : 10} fill="white" />
      <ellipse cx="48" cy={isHappy ? 58 : 60} rx="6" ry={isHappy ? 4 : 7} fill="#4A90D9" />
      <ellipse cx="48" cy={isHappy ? 58 : 61} rx="4" ry={isHappy ? 3 : 5} fill="#1A1A2E" />
      {!isHappy && <circle cx="45" cy="56" r="2.5" fill="white" />}
      {!isHappy && <circle cx="51" cy="62" r="1.2" fill="white" />}

      {/* Right eye */}
      <ellipse cx="72" cy="58" rx="9" ry={isHappy ? 5 : 10} fill="white" />
      <ellipse cx="72" cy={isHappy ? 58 : 60} rx="6" ry={isHappy ? 4 : 7} fill="#4A90D9" />
      <ellipse cx="72" cy={isHappy ? 58 : 61} rx="4" ry={isHappy ? 3 : 5} fill="#1A1A2E" />
      {!isHappy && <circle cx="69" cy="56" r="2.5" fill="white" />}
      {!isHappy && <circle cx="75" cy="62" r="1.2" fill="white" />}

      {/* Eyebrows */}
      <path
        d={isThinking ? "M40 48 Q48 44 56 48" : "M40 47 Q48 43 56 47"}
        stroke="#4A2810"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={isThinking ? "M64 48 Q72 52 80 48" : "M64 47 Q72 43 80 47"}
        stroke="#4A2810"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Nose */}
      <ellipse cx="60" cy="66" rx="2.5" ry="2" fill="#FFB89A" />

      {/* Mouth */}
      {isHappy ? (
        /* Big happy smile */
        <path d="M50 73 Q60 82 70 73" stroke="#E85D75" strokeWidth="2.5" fill="#FF8A9B" strokeLinecap="round" />
      ) : isThinking ? (
        /* Small 'o' thinking mouth */
        <ellipse cx="60" cy="74" rx="3" ry="3.5" fill="#E85D75" />
      ) : (
        /* Gentle smile */
        <path d="M52 73 Q60 79 68 73" stroke="#E85D75" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}

      {/* Rosy cheeks */}
      <ellipse cx="38" cy="68" rx="5" ry="4" fill="#FFB3BA" opacity="0.5" />
      <ellipse cx="82" cy="68" rx="5" ry="4" fill="#FFB3BA" opacity="0.5" />

      {/* T-shirt collar visible at bottom */}
      <path d="M40 82 Q60 88 80 82 L82 90 Q60 96 38 90 Z" fill="#5BC5F2" />
      {/* Star on shirt */}
      <polygon points="60,85 62,89 66,89 63,92 64,96 60,93 56,96 57,92 54,89 58,89" fill="#FFD93D" />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="bg-gradient" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#E8F8FF" />
          <stop offset="100%" stopColor="#D4F1F9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
