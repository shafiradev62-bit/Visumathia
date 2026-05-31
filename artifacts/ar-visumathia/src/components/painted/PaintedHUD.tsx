import { motion } from 'framer-motion';
import { DayDial } from './DayDial';
import { PaintedIconButton } from './PaintedButton';
import { PaintedBackArrow, PaintedPouch } from './PaintedIcons';
import { C } from './PaintedTextures';

/* ════════════════════════════════════════════════════════════════
   TOP-RIGHT painted day-dial cluster.
══════════════════════════════════════════════════════════════════ */

interface PaintedHUDProps {
  coins?: number;
  milk?: number;
  energy?: number;
  day?: number;
  hour?: number;
  minute?: number;
  className?: string;
  size?: number;
}

export function PaintedHUD({
  coins = 0,
  milk = 0,
  energy = 75,
  day = 1,
  hour,
  minute,
  className,
  size = 140,
}: PaintedHUDProps) {
  return (
    <motion.div
      className={className}
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 30,
        pointerEvents: 'auto',
      }}
    >
      <DayDial
        coins={coins}
        milk={milk}
        energy={energy}
        day={day}
        hour={hour}
        minute={minute}
        size={size}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   LEFT-EDGE TOOLBAR — vertical column of small painted icons,
   each on a cream square tile with offset shadow.
══════════════════════════════════════════════════════════════════ */

export interface ToolbarItem {
  id: string;
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
}

export function PaintedLeftToolbar({
  items,
  className,
}: {
  items: ToolbarItem[];
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      style={{
        position: 'absolute',
        top: 18,
        left: 14,
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {items.map((it) => (
        <motion.button
          key={it.id}
          onClick={it.onClick}
          whileTap={{ x: 2, y: 3 }}
          aria-label={it.label}
          title={it.label}
          style={{
            position: 'relative',
            width: 34,
            height: 34,
            background: C.cream,
            border: `2.5px solid ${C.ink}`,
            borderRadius: 10,
            boxShadow: `0 3px 0 ${C.creamShade}, 0 5px 0 ${C.ink}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: C.ink,
            padding: 0,
          }}
        >
          {it.icon}
        </motion.button>
      ))}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Top-left back button (round red ↩ arrow).
══════════════════════════════════════════════════════════════════ */

export function PaintedBackButton({
  onClick,
  size = 38,
  className,
}: {
  onClick?: () => void;
  size?: number;
  className?: string;
}) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      whileTap={{ scale: 0.92, x: 2, y: 3 }}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 40,
        width: size,
        height: size,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
      aria-label="Kembali"
    >
      <PaintedBackArrow size={size} />
    </motion.button>
  );
}

export { PaintedPouch };
