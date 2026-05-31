/**
 * Painted GUI icons — multi-pass shaded SVGs.
 * Re-exports from the painted/ design system so existing imports
 * (HeartIcon, CoinIcon, GemIcon, StarIcon, PlayIcon, …) keep working.
 */

import {
  PaintedCoin,
  PaintedHeart,
  PaintedGem,
  PaintedStar,
  PaintedPlay,
} from '@/components/painted';

interface IconProps {
  size?: number;
  className?: string;
}

export function HeartIcon({ size = 28, className }: IconProps) {
  return <PaintedHeart size={size} className={className} />;
}

export function CoinIcon({ size = 28, className }: IconProps) {
  return <PaintedCoin size={size} className={className} />;
}

export function GemIcon({ size = 28, className }: IconProps) {
  return <PaintedGem size={size} className={className} />;
}

export function StarIcon({ size = 28, className }: IconProps) {
  return <PaintedStar size={size} className={className} />;
}

/** Trophy — painted cup on a green pedestal */
export function TrophyIcon({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <ellipse cx="20" cy="36" rx="11" ry="2" fill="#1a1209" opacity="0.25" />
      {/* base */}
      <rect x="13" y="29" width="14" height="5" rx="1" fill="#7a4a17" />
      <rect x="11" y="33" width="18" height="3" rx="1.5" fill="#5a3618" />
      {/* cup */}
      <path
        d="M11 9 H29 V18 a9 9 0 0 1 -9 9 a9 9 0 0 1 -9 -9 Z"
        fill="#fcd34d"
      />
      <path
        d="M11 9 H29 V14 H11 Z"
        fill="#f5b942"
      />
      {/* handles */}
      <path d="M9 12 a4 4 0 0 0 0 8" fill="none" stroke="#fcd34d" strokeWidth="2.5" />
      <path d="M31 12 a4 4 0 0 1 0 8" fill="none" stroke="#fcd34d" strokeWidth="2.5" />
      <path
        d="M11 9 H29 V18 a9 9 0 0 1 -9 9 a9 9 0 0 1 -9 -9 Z"
        fill="none"
        stroke="#2a1809"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M9 12 a4 4 0 0 0 0 8" fill="none" stroke="#2a1809" strokeWidth="2.2" />
      <path d="M31 12 a4 4 0 0 1 0 8" fill="none" stroke="#2a1809" strokeWidth="2.2" />
    </svg>
  );
}

/** Play button — colored coin with white triangle */
export function PlayIcon({
  size = 56,
  color = '#7bb24a',
  className,
}: IconProps & { color?: string }) {
  return <PaintedPlay size={size} color={color} className={className} />;
}

/** Lock — painted padlock on a cream tag */
export function LockIcon({ size = 32, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <ellipse cx="20" cy="36" rx="10" ry="2" fill="#1a1209" opacity="0.25" />
      {/* shackle */}
      <path d="M14 18 V14 a6 6 0 0 1 12 0 V18" fill="none" stroke="#a08362" strokeWidth="3" />
      <path d="M14 18 V14 a6 6 0 0 1 12 0 V18" fill="none" stroke="#2a1809" strokeWidth="2" />
      {/* body */}
      <rect x="11" y="18" width="18" height="14" rx="2.5" fill="#c69553" />
      <rect x="11" y="18" width="18" height="6" rx="2.5" fill="#e9b34a" />
      <rect x="11" y="18" width="18" height="14" rx="2.5" fill="none" stroke="#2a1809" strokeWidth="2.2" />
      <circle cx="20" cy="25" r="2" fill="#3d2410" />
      <rect x="19" y="25" width="2" height="5" fill="#3d2410" />
    </svg>
  );
}

/** Medal — colored disk with rank number, painted */
export function MedalIcon({
  size = 32,
  rank = 1,
  className,
}: IconProps & { rank?: number }) {
  const colors: Record<number, string> = { 1: '#fcd34d', 2: '#cfd6da', 3: '#cd7f32' };
  const bg = colors[rank] || '#cfd6da';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className}>
      <ellipse cx="20" cy="38" rx="9" ry="1.8" fill="#1a1209" opacity="0.25" />
      <path d="M14 6 L20 18 L26 6" fill={bg} stroke="#2a1809" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="20" cy="26" r="11" fill={bg} />
      <circle cx="20" cy="26" r="7" fill="#fff7c4" opacity="0.55" />
      <text
        x="20"
        y="30"
        textAnchor="middle"
        fontSize="11"
        fontFamily="Fredoka One, cursive"
        fill="#2a1809"
      >
        {rank}
      </text>
      <circle cx="20" cy="26" r="11" fill="none" stroke="#2a1809" strokeWidth="2.2" />
    </svg>
  );
}
