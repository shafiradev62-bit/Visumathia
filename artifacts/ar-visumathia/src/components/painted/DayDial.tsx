import { useEffect, useState } from 'react';
import { C, PaintedCloud } from './PaintedTextures';
import { PaintedCoin, PaintedMilk } from './PaintedIcons';

/* ════════════════════════════════════════════════════════════════
   DAY DIAL — circular HUD widget, 2D vector / cozy bike-game look.
   Layout (proportional to size 1):
   • Outer cream ring (r=0.5, stroke r∈[0.42, 0.5])
   • Sky window (r=0.42) showing pastel hills + sun + clouds
   • Time plate centered top of window
   • DAY plate centered below time
   • Energy chip nestled in bottom-right of ring
   • Coin / milk slot tags clipped to LEFT of ring
══════════════════════════════════════════════════════════════════ */

interface DayDialProps {
  coins?: number;
  milk?: number;
  energy?: number;
  day?: number;
  hour?: number;
  minute?: number;
  size?: number;
  dayProgress?: number;
  className?: string;
}

export function DayDial({
  coins = 0,
  milk = 0,
  energy = 100,
  day = 1,
  hour,
  minute,
  size = 140,
  dayProgress,
  className,
}: DayDialProps) {
  // auto time tick
  const [autoTime, setAutoTime] = useState({ h: 8, m: 5 });
  useEffect(() => {
    if (hour !== undefined) return;
    const t = setInterval(() => {
      setAutoTime((s) => {
        const total = s.h * 60 + s.m + 1;
        const wrap = total % (24 * 60);
        return { h: Math.floor(wrap / 60), m: wrap % 60 };
      });
    }, 1500);
    return () => clearInterval(t);
  }, [hour]);

  const h = hour ?? autoTime.h;
  const m = minute ?? autoTime.m;
  const ampm = h < 12 ? 'am' : 'pm';
  const h12 = ((h + 11) % 12) + 1;
  const timeText = `${h12}:${String(m).padStart(2, '0')}`;

  const fractionOfDay =
    dayProgress !== undefined ? dayProgress / 100 : (h * 60 + m) / (24 * 60);

  const phase =
    fractionOfDay < 0.22
      ? 'dawn'
      : fractionOfDay < 0.7
      ? 'day'
      : fractionOfDay < 0.85
      ? 'dusk'
      : 'night';

  const skyId =
    phase === 'day'
      ? 'hp-day-sky'
      : phase === 'dawn'
      ? 'hp-dawn-sky'
      : phase === 'dusk'
      ? 'hp-dusk-sky'
      : 'hp-night-sky';

  // Sun arc inside the sky window
  const sweep = Math.min(1, Math.max(0, (fractionOfDay - 0.18) / 0.7));
  const sunX = 60 + sweep * 80;
  const sunY = 92 - Math.sin(sweep * Math.PI) * 26;

  const energyClamped = Math.max(0, Math.min(100, energy));

  // viewport is 200x200
  // ring outer r=92, inner r=72, sky window r=62
  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size }}
    >
      {/* Slot tags clipped on the LEFT of the dial */}
      <div
        style={{
          position: 'absolute',
          right: size - 22,
          top: size * 0.06,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          alignItems: 'flex-end',
          zIndex: 2,
        }}
      >
        <SlotTag icon={<PaintedCoin size={20} />} value={coins} />
        <SlotTag icon={<PaintedMilk size={18} />} value={milk} />
      </div>

      <svg
        viewBox="0 0 200 200"
        style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
      >
        {/* drop shadow under the dial */}
        <ellipse cx="102" cy="194" rx="80" ry="5" fill={C.ink} opacity="0.22" />

        {/* OUTER RING — single cream donut + ink outlines (clean Adobe-vector look) */}
        <circle cx="100" cy="100" r="93" fill={C.creamShade} />
        <circle cx="100" cy="100" r="93" fill="none" stroke={C.ink} strokeWidth="3" />
        <circle cx="100" cy="100" r="86" fill={C.cream} />
        {/* warm bottom shading on ring */}
        <path
          d="M 14 100 A 86 86 0 0 0 186 100"
          fill="none"
          stroke={C.creamDark}
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.45"
        />
        <circle cx="100" cy="100" r="86" fill="none" stroke={C.ink} strokeWidth="2.5" />
        {/* inner sky window cut */}
        <circle cx="100" cy="100" r="64" fill={C.cream} />
        <circle cx="100" cy="100" r="64" fill="none" stroke={C.ink} strokeWidth="3" />

        {/* SKY WINDOW — clipped circle */}
        <g clipPath="url(#hp-circle-clip)">
          {/* sky gradient */}
          <rect x="36" y="36" width="128" height="128" fill={`url(#${skyId})`} />

          {/* small clouds */}
          <g opacity="0.95">
            <PaintedCloud x={68} y={66} scale={0.32} variant="b" />
            <PaintedCloud x={132} y={76} scale={0.28} variant="a" />
          </g>

          {/* hills inside window — flat tones, layered */}
          <path d="M36 130 Q60 116 84 124 T128 122 T164 128 V164 H36 Z" fill={C.hillFar} />
          <path
            d="M36 130 Q60 116 84 124 T128 122 T164 128"
            stroke={C.ink}
            strokeWidth="2"
            fill="none"
            opacity="0.55"
          />
          <path d="M36 142 Q66 134 96 142 T160 142 T164 144 V164 H36 Z" fill={C.hillMid} />
          <path
            d="M36 142 Q66 134 96 142 T160 142 T164 144"
            stroke={C.ink}
            strokeWidth="2"
            fill="none"
            opacity="0.55"
          />
          <path d="M36 152 Q70 148 100 154 T160 152 T164 156 V164 H36 Z" fill={C.hillNear} />

          {/* sun (or moon) */}
          {phase === 'night' ? (
            <g>
              <circle cx={sunX} cy={92} r="9" fill="#fff7c4" />
              <circle cx={sunX} cy={92} r="9" fill="none" stroke={C.ink} strokeWidth="2" />
              <circle cx={sunX - 3} cy={90} r="2.5" fill="#cfd6da" />
            </g>
          ) : (
            <g>
              <circle cx={sunX} cy={sunY} r="11" fill={C.yellow} />
              <circle cx={sunX} cy={sunY} r="11" fill="none" stroke={C.ink} strokeWidth="2.4" />
              <circle cx={sunX - 4} cy={sunY - 3} r="3.5" fill="#fff7c4" opacity="0.85" />
            </g>
          )}
        </g>
        {/* sky window inner outline */}
        <circle cx="100" cy="100" r="64" fill="none" stroke={C.ink} strokeWidth="3" />

        {/* TIME PLATE — centered upper-mid of window */}
        <g transform="translate(100,90)">
          <rect x="-30" y="-13" width="60" height="26" rx="5" fill={C.cream} />
          <rect x="-30" y="-13" width="60" height="26" rx="5" fill="none" stroke={C.ink} strokeWidth="2.5" />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontFamily="Fredoka One, cursive"
            fontSize="14"
            fill={C.ink}
          >
            {timeText}
          </text>
          <text
            x="0"
            y="11"
            textAnchor="middle"
            fontFamily="Nunito, sans-serif"
            fontSize="6"
            fontWeight="800"
            fill={C.woodDark}
          >
            {ampm}
          </text>
        </g>

        {/* DAY PLATE */}
        <g transform="translate(100,121)">
          <rect x="-22" y="-9" width="44" height="18" rx="4" fill={C.cream} />
          <rect x="-22" y="-9" width="44" height="18" rx="4" fill="none" stroke={C.ink} strokeWidth="2.5" />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fontFamily="Fredoka One, cursive"
            fontSize="11"
            fill={C.ink}
            letterSpacing="0.06em"
          >
            DAY {day}
          </text>
        </g>

        {/* ENERGY CHIP — circular pill bottom-right of the ring */}
        <g transform="translate(160,160)">
          <circle r="16" fill={C.cream} />
          <circle r="16" fill="none" stroke={C.ink} strokeWidth="2.5" />
          {/* small energy pie behind text */}
          <path
            d={describeArc(0, 0, 12, 0, (energyClamped / 100) * 360)}
            fill={C.green}
            opacity="0.35"
          />
          <text
            x="-3"
            y="3"
            textAnchor="middle"
            fontFamily="Fredoka One, cursive"
            fontSize="10"
            fill={C.ink}
          >
            {Math.round(energyClamped)}
          </text>
          <path
            d="M5 -4 L1 2 H4 L2 7 L8 0 H5 Z"
            fill={C.green}
            stroke={C.ink}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

/* ─────────── helpers ─────────── */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

/* ─────────── slot tag ─────────── */
function SlotTag({ icon, value }: { icon: React.ReactNode; value: number | string }) {
  return (
    <div
      style={{
        position: 'relative',
        background: C.cream,
        border: `2.5px solid ${C.ink}`,
        borderRadius: 18,
        padding: '2px 26px 2px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        minWidth: 78,
        boxShadow: `0 2px 0 ${C.ink}`,
      }}
    >
      <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span
        style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: 16,
          color: C.ink,
          minWidth: 18,
          textAlign: 'right',
        }}
      >
        {value}
      </span>
      {/* triangular notch — clean SVG, hidden behind the dial ring */}
      <svg
        style={{
          position: 'absolute',
          right: -14,
          top: -2,
          width: 18,
          height: 'calc(100% + 4px)',
          pointerEvents: 'none',
        }}
        viewBox="0 0 18 28"
        preserveAspectRatio="none"
      >
        <path
          d="M0 1 L14 14 L0 27 Z"
          fill={C.cream}
          stroke={C.ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* shadow strip */}
        <path d="M0 25 L14 14 L0 27 Z" fill={C.creamDark} opacity="0.45" />
      </svg>
    </div>
  );
}
