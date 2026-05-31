import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { playSfx } from '@/lib/audio';
import {
  PaintedSkyMeadow,
  ParchmentPanel,
  PaintedButton,
  WoodSign,
} from '@/components/painted';

/**
 * Painted "connecting AR device" page.
 * Cream parchment card sits over the painted meadow backdrop.
 */
export function ConnectARPage() {
  const [, setLocation] = useLocation();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => { setConnected(true); playSfx('success'); }, 3000);
    const t2 = setTimeout(() => { setLocation('/home'); }, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [setLocation]);

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0">
        <PaintedSkyMeadow />
      </div>

      <div className="relative z-10 mb-4">
        <WoodSign text="Menghubungkan…" width={280} height={64} />
      </div>

      <ParchmentPanel width={300} height={220} className="relative z-10">
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          {/* Big spinner / checkmark inside a wooden coin */}
          <motion.div
            style={{
              width: 92,
              height: 92,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 30% 28%, #faecc4, #c69553 60%, #5a3618 100%)',
              border: '3px solid #2a1809',
              boxShadow: '3px 4px 0 #2a1809, inset 0 2px 0 rgba(255,255,255,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
            animate={!connected ? { rotate: 360 } : { rotate: 0, scale: [1, 1.15, 1] }}
            transition={!connected ? { duration: 1.6, repeat: Infinity, ease: 'linear' } : { duration: 0.5 }}
          >
            {!connected ? (
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#2a1809" strokeWidth="2" opacity="0.25" />
                <path
                  d="M12 3 a9 9 0 0 1 9 9"
                  stroke="#fff7c4"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#fff7c4"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </motion.div>

          <motion.p
            style={{
              fontFamily: "'Fredoka One', cursive",
              color: '#2a1809',
              fontSize: 16,
              margin: 0,
            }}
            key={connected ? 'done' : 'loading'}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {connected ? 'Terhubung!' : 'Menghubungkan perangkat'}
          </motion.p>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 11,
              color: '#7a4a17',
              margin: '6px 0 12px',
              textAlign: 'center',
            }}
          >
            Pastikan kamera siap untuk memulai!
          </p>

          {!connected && (
            <PaintedButton
              variant="cream"
              size="sm"
              onClick={() => { playSfx('click'); setLocation('/home'); }}
            >
              Lewati
            </PaintedButton>
          )}
        </div>
      </ParchmentPanel>
    </div>
  );
}
