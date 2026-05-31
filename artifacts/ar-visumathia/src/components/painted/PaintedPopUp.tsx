import React from 'react';
import { C } from './PaintedTextures';

interface PaintedPopUpProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  borderColor?: string;
  footer?: React.ReactNode;
}

/**
 * A minimal game-style pop-up container.
 * Features:
 * - Sky blue thick borders (Unity-like)
 * - White comic sticker outline effect
 * - No header/title - clean game UI
 * - Shadow for depth
 */
export function PaintedPopUp({
  children,
  className,
  style,
  borderColor = C.blue,
  footer,
}: PaintedPopUpProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        background: C.paper,
        border: `5px solid ${borderColor}`,
        borderRadius: 16,
        padding: '16px 20px 14px 20px',
        boxShadow: `
          0 0 0 3px #ffffff,
          0 0 0 6px ${C.ink},
          0 10px 0 ${C.ink},
          0 12px 20px rgba(0,0,0,0.3)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 260,
        ...style,
      }}
    >
      {/* Decorative corner accents */}
      <div style={{ position: 'absolute', top: 8, left: 8, width: 10, height: 10, borderRadius: '50%', background: borderColor, opacity: 0.4 }} />
      <div style={{ position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: '50%', background: borderColor, opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: 8, left: 8, width: 10, height: 10, borderRadius: '50%', background: borderColor, opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: 8, right: 8, width: 10, height: 10, borderRadius: '50%', background: borderColor, opacity: 0.4 }} />

      {/* Content */}
      <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* Footer / Buttons */}
      {footer && (
        <div style={{ 
          marginTop: 12, 
          display: 'flex', 
          gap: 10, 
          justifyContent: 'center',
          width: '100%' 
        }}>
          {footer}
        </div>
      )}

      {/* Minimal decorative lines at bottom */}
      <div style={{ 
        position: 'absolute', 
        bottom: 6, 
        left: '50%', 
        transform: 'translateX(-50%)',
        display: 'flex', 
        gap: 6 
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            background: borderColor,
            opacity: 0.5 + i * 0.15
          }} />
        ))}
      </div>
    </div>
  );
}

/**
 * Comic Sticker Character Component
 * Features white outline like cartoon stickers
 */
export function ComicStickerCharacter({
  children,
  className,
  style,
  outlineColor = '#ffffff',
  outlineWidth = 3.5,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  outlineColor?: string;
  outlineWidth?: number;
}) {
  const s = outlineWidth;
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        // Smoother 8-direction outline using drop-shadow
        filter: `
          drop-shadow(${s}px 0 0 ${outlineColor})
          drop-shadow(-${s}px 0 0 ${outlineColor})
          drop-shadow(0 ${s}px 0 ${outlineColor})
          drop-shadow(0 -${s}px 0 ${outlineColor})
          drop-shadow(${s * 0.7}px ${s * 0.7}px 0 ${outlineColor})
          drop-shadow(-${s * 0.7}px ${s * 0.7}px 0 ${outlineColor})
          drop-shadow(${s * 0.7}px -${s * 0.7}px 0 ${outlineColor})
          drop-shadow(-${s * 0.7}px -${s * 0.7}px 0 ${outlineColor})
        `,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
