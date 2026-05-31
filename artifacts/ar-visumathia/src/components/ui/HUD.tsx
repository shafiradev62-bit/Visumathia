import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PaintedHUD } from '@/components/painted';

interface HUDProps {
  stars: number;
  crystals: number;
  coins: number;
  sceneName?: string;
  className?: string;
  /** optional in-game time */
  hour?: number;
  minute?: number;
  day?: number;
  energy?: number;
}

/**
 * Hand-painted day-dial style HUD.
 * Drops the painted dial in the top-right and lets it carry coins / energy / day,
 * matching the cozy farming-game reference.
 */
export function HUD({
  stars,
  crystals,
  coins,
  sceneName,
  className,
  hour,
  minute,
  day = 1,
  energy = 75,
}: HUDProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn('relative', className)}
    >
      {sceneName && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 4,
            padding: '4px 14px',
            background:
              'linear-gradient(180deg, #c69553 0%, #9c6b3f 60%, #5a3618 100%)',
            color: '#fff7c4',
            fontFamily: "'Fredoka One', cursive",
            fontSize: 14,
            border: '2.5px solid #2a1809',
            borderRadius: 9999,
            boxShadow:
              '2px 3px 0 #2a1809, inset 0 1.5px 0 rgba(255,255,255,0.4)',
            textShadow: '0 1px 0 rgba(0,0,0,0.35)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {sceneName}
        </div>
      )}

      <PaintedHUD
        coins={coins}
        milk={crystals /* re-using the slot for crystals/milk/etc. */}
        energy={energy}
        day={day}
        hour={hour}
        minute={minute}
        size={140}
      />

      {/* tiny stars chip below the dial */}
      <div
        style={{
          position: 'absolute',
          right: 16,
          top: 130,
          padding: '2px 8px',
          background: '#f7e7b4',
          color: '#2a1809',
          fontFamily: "'Fredoka One', cursive",
          fontSize: 10,
          border: '2px solid #2a1809',
          borderRadius: 9999,
          boxShadow: '2px 2px 0 #2a1809',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <polygon
            points="8,1 10,6 15,6 11,9 13,15 8,11 3,15 5,9 1,6 6,6"
            fill="#fcd34d"
            stroke="#2a1809"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
        {stars}/3
      </div>
    </motion.div>
  );
}
