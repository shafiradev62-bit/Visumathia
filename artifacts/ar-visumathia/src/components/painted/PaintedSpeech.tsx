import React from 'react';
import { C } from './PaintedTextures';

/* ════════════════════════════════════════════════════════════════
   FLAT-CARTOON SPEECH BUBBLE — clean cream rounded-square,
   thick ink outline, ONE accent shadow underneath, colored
   name pill above with offset drop-shadow. Matches the
   "Yoyo / Grandma Yuma" reference exactly.
══════════════════════════════════════════════════════════════════ */

interface PaintedNamePillProps {
  name: string;
  color?: string;
  textColor?: string;
}

export function PaintedNamePill({
  name,
  color = C.purple,
  textColor = '#ffffff',
}: PaintedNamePillProps) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* drop shadow plate */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: C.ink,
          borderRadius: 9999,
          transform: 'translate(2px, 3px)',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'relative',
          padding: '4px 16px',
          background: color,
          color: textColor,
          fontFamily: "'Fredoka One', cursive",
          fontSize: 13,
          letterSpacing: '0.02em',
          border: `2.5px solid ${C.ink}`,
          borderRadius: 9999,
          textShadow: '0 1px 0 rgba(0,0,0,0.3)',
          zIndex: 1,
        }}
      >
        {name}
      </div>
    </div>
  );
}

interface PaintedSpeechProps {
  name?: string;
  nameColor?: string;
  pillSide?: 'left' | 'center' | 'right';
  tailSide?: 'left' | 'center' | 'right';
  maxWidth?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function PaintedSpeech({
  name,
  nameColor = C.purple,
  pillSide = 'left',
  tailSide = 'left',
  maxWidth = 320,
  children,
  className,
  style,
}: PaintedSpeechProps) {
  const pillJustify =
    pillSide === 'left' ? 'flex-start' : pillSide === 'right' ? 'flex-end' : 'center';

  // tail pixel position
  const tailLeft =
    tailSide === 'left'
      ? 30
      : tailSide === 'right'
      ? maxWidth - 50
      : maxWidth / 2 - 10;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 4,
        maxWidth,
        ...style,
      }}
    >
      {name && (
        <div style={{ display: 'flex', justifyContent: pillJustify, paddingLeft: 14 }}>
          <PaintedNamePill name={name} color={nameColor} />
        </div>
      )}

      <div style={{ position: 'relative' }}>
        {/* shadow plate */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 18,
            background: C.ink,
            transform: 'translate(3px, 4px)',
          }}
        />
        {/* bubble */}
        <div
          style={{
            position: 'relative',
            background: C.paper,
            color: C.ink,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: 14,
            lineHeight: 1.35,
            padding: '12px 16px',
            border: `2.5px solid ${C.ink}`,
            borderRadius: 18,
          }}
        >
          {children}
        </div>

        {/* tail — drawn as ONE clean teardrop with ink outline */}
        <svg
          aria-hidden
          width={22}
          height={22}
          viewBox="0 0 22 22"
          style={{
            position: 'absolute',
            left: tailLeft,
            bottom: -16,
          }}
        >
          {/* shadow */}
          <path
            d="M3 1 Q6 14 19 18 Q9 14 8 0 Z"
            fill={C.ink}
            opacity="0.6"
            transform="translate(2,3)"
          />
          <path
            d="M2 0 Q5 14 18 18 Q9 14 8 0 Z"
            fill={C.paper}
            stroke={C.ink}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
