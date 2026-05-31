import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';

/**
 * Painted in-game overlay — score/timer cream pills + combo popup.
 * Style matches the rest of the painted HUD.
 */

export function SceneOverlay({ active, sceneColor }: { active: boolean; sceneColor: string }) {
  const combo = useGameStore((s) => s.combo);
  const sceneScore = useGameStore((s) => s.sceneScore);
  const timerActive = useGameStore((s) => s.timerActive);
  const timerStart = useGameStore((s) => s.timerStart);
  const [elapsed, setElapsed] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [lastCombo, setLastCombo] = useState(0);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - timerStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timerStart]);

  useEffect(() => {
    if (combo >= 2 && combo > lastCombo) {
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 1500);
    }
    setLastCombo(combo);
  }, [combo]);

  if (!active) return null;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <>
      {/* Score pill — bottom-left painted parchment */}
      <motion.div
        className="absolute bottom-3 left-3 z-20"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div
          style={{
            padding: '4px 8px',
            background: '#f7e7b4',
            border: '2px solid #2a1809',
            borderRadius: 10,
            boxShadow: '2px 3px 0 #2a1809',
            minWidth: 50,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 7,
              color: '#7a4a17',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Skor
          </div>
          <div
            style={{
              fontFamily: "'Fredoka One', cursive",
              color: '#2a1809',
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            {sceneScore}
          </div>
        </div>
      </motion.div>

      {/* Timer pill — bottom-right */}
      {timerActive && (
        <motion.div
          className="absolute bottom-3 right-3 z-20"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div
            style={{
              padding: '4px 8px',
              background: '#f7e7b4',
              border: '2px solid #2a1809',
              borderRadius: 10,
              boxShadow: '2px 3px 0 #2a1809',
              minWidth: 56,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: 7,
                color: '#7a4a17',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Waktu
            </div>
            <div
              style={{
                fontFamily: "'Fredoka One', cursive",
                color: '#2a1809',
                fontSize: 14,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>
        </motion.div>
      )}

      {/* Combo popup — painted ribbon */}
      <AnimatePresence>
        {showCombo && combo >= 2 && (
          <motion.div
            className="absolute top-1/3 left-1/2 z-30 pointer-events-none"
            style={{ transform: 'translateX(-50%)' }}
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <div
              style={{
                padding: '10px 26px',
                background:
                  combo >= 5
                    ? 'linear-gradient(180deg, #fbd76b 0%, #e5a51e 60%, #a36a1d 100%)'
                    : `linear-gradient(180deg, ${sceneColor} 0%, ${shade(sceneColor, -22)} 100%)`,
                border: '3px solid #2a1809',
                borderRadius: 9999,
                boxShadow: '4px 5px 0 #2a1809, inset 0 2px 0 rgba(255,255,255,0.4)',
                fontFamily: "'Fredoka One', cursive",
                color: '#fff',
                fontSize: 22,
                textShadow: '0 2px 0 rgba(0,0,0,0.35)',
                letterSpacing: '0.04em',
              }}
            >
              {combo >= 5 ? 'PERFECT!' : `Combo ${combo}!`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function shade(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + Math.round((percent / 100) * 255)));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + Math.round((percent / 100) * 255)));
  const b = Math.max(0, Math.min(255, (num & 0xff) + Math.round((percent / 100) * 255)));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
