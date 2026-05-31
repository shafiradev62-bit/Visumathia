import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { C } from './PaintedTextures';

/* ════════════════════════════════════════════════════════════════
   FLAT-CARTOON BUTTON — single-color body, top highlight band,
   bottom shade band, ONE thick ink outline, OFFSET ink drop shadow.
══════════════════════════════════════════════════════════════════ */

type Variant = 'green' | 'red' | 'blue' | 'yellow' | 'orange' | 'cream' | 'wood' | 'purple';
type Size = 'sm' | 'md' | 'lg';

interface PaintedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  pill?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const VARIANTS: Record<Variant, { fill: string; shade: string; text: string; highlight: string }> = {
  green:  { fill: C.green,        shade: C.greenShade,  text: '#fff7c4', highlight: '#a3d075' },
  red:    { fill: C.red,          shade: C.redShade,    text: '#ffffff', highlight: '#f1825c' },
  blue:   { fill: C.blue,         shade: C.blueShade,   text: '#ffffff', highlight: '#7bbde0' },
  yellow: { fill: C.yellow,       shade: C.yellowShade, text: C.ink,     highlight: '#fbd76b' },
  orange: { fill: C.orange,       shade: C.orangeShade, text: '#ffffff', highlight: '#f0a060' },
  cream:  { fill: C.cream,        shade: C.creamShade,  text: C.ink,     highlight: C.paper },
  wood:   { fill: C.woodMid,      shade: C.woodDark,    text: '#fff4c4', highlight: C.woodLight },
  purple: { fill: C.purple,       shade: C.purpleShade, text: '#ffffff', highlight: '#8675c4' },
};

const SIZES: Record<Size, { px: number; py: number; fs: number; gap: number }> = {
  sm: { px: 10, py: 4,  fs: 11, gap: 4 },
  md: { px: 16, py: 7, fs: 13, gap: 6 },
  lg: { px: 22, py: 10, fs: 15, gap: 8 },
};

export const PaintedButton = React.forwardRef<HTMLButtonElement, PaintedButtonProps>(
  (
    {
      variant = 'green',
      size = 'md',
      pill = true,
      icon,
      children,
      style,
      className,
      ...rest
    },
    ref,
  ) => {
    const v = VARIANTS[variant];
    const s = SIZES[size];

    return (
      <motion.button
        ref={ref}
        whileTap={{ x: 2, y: 3 }}
        className={className}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: s.gap,
          padding: `${s.py}px ${s.px}px`,
          background: v.fill,
          color: v.text,
          fontFamily: "'Fredoka One', cursive",
          fontSize: s.fs,
          letterSpacing: '0.02em',
          border: `3px solid ${C.ink}`,
          borderRadius: pill ? 9999 : 12,
          boxShadow: `0 4px 0 ${v.shade}, 0 6px 0 ${C.ink}`,
          cursor: 'pointer',
          textShadow: variant === 'cream' || variant === 'yellow' ? 'none' : '0 1px 0 rgba(0,0,0,0.3)',
          overflow: 'hidden',
          ...style,
        }}
        {...rest}
      >
        {/* top highlight band */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 4,
            left: 10,
            right: 10,
            height: '38%',
            background: v.highlight,
            borderRadius: 9999,
            opacity: 0.55,
            pointerEvents: 'none',
          }}
        />
        {icon}
        <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      </motion.button>
    );
  },
);
PaintedButton.displayName = 'PaintedButton';

/* ════════════════════════════════════════════════════════════════
   ROUND ICON BUTTON — perfect circle, top highlight, side shade.
══════════════════════════════════════════════════════════════════ */

interface PaintedIconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: number;
  children?: React.ReactNode;
}

export const PaintedIconButton = React.forwardRef<HTMLButtonElement, PaintedIconButtonProps>(
  ({ variant = 'red', size = 44, children, style, ...rest }, ref) => {
    const v = VARIANTS[variant];
    return (
      <motion.button
        ref={ref}
        whileTap={{ x: 2, y: 3 }}
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          background: v.fill,
          border: `3px solid ${C.ink}`,
          boxShadow: `0 4px 0 ${v.shade}, 0 6px 0 ${C.ink}`,
          color: v.text,
          fontFamily: "'Fredoka One', cursive",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          ...style,
        }}
        {...rest}
      >
        {/* top highlight crescent */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 4,
            left: '15%',
            right: '15%',
            height: '36%',
            background: v.highlight,
            borderRadius: 9999,
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
        <span style={{ position: 'relative', zIndex: 1, display: 'flex' }}>{children}</span>
      </motion.button>
    );
  },
);
PaintedIconButton.displayName = 'PaintedIconButton';
