import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Shows a "rotate your device" overlay when in portrait mode.
 * Also attempts to lock screen orientation to landscape via API.
 */
export function LandscapeLock() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    // Try to lock orientation
    try {
      (screen.orientation as any)?.lock?.('landscape').catch(() => {});
    } catch {}

    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#1a1a2e] flex flex-col items-center justify-center gap-4 p-8">
      {/* Rotating phone icon */}
      <motion.div
        animate={{ rotate: [0, -90, -90, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl"
      >
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>

      <p className="text-white font-display font-bold text-lg text-center">
        Putar HP ke Landscape
      </p>
      <p className="text-white/60 text-sm text-center">
        Game ini paling bagus dimainkan dalam mode landscape
      </p>
    </div>
  );
}
