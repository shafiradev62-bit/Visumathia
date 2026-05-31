import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSfx } from '@/lib/audio';

interface CountdownTimerProps {
  /** Total seconds for this challenge */
  seconds: number;
  /** Is the timer running? */
  active: boolean;
  /** Called when time runs out */
  onTimeUp: () => void;
  /** Scene color for styling */
  color: string;
}

/**
 * DUMB WAYS TO DIE style countdown timer.
 * - Big circular countdown that shrinks
 * - Turns RED and SHAKES when low
 * - Pulses urgently in last 3 seconds
 * - "TIME'S UP!" flash when done
 */
export function CountdownTimer({ seconds, active, onTimeUp, color }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [timesUp, setTimesUp] = useState(false);

  useEffect(() => {
    if (!active) return;
    setTimeLeft(seconds);
    setTimesUp(false);
  }, [active, seconds]);

  useEffect(() => {
    if (!active || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;
        if (next <= 3 && next > 0) playSfx('countdown');
        if (next <= 0) {
          clearInterval(interval);
          setTimesUp(true);
          playSfx('wrong');
          setTimeout(onTimeUp, 800);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  const progress = timeLeft / seconds;
  const isUrgent = timeLeft <= 5;
  const isCritical = timeLeft <= 3;

  // Pulse screen border red when critical
  useEffect(() => {
    const border = document.getElementById('urgency-border');
    if (!border) return;
    if (isCritical) {
      border.style.borderColor = 'rgba(255,0,0,0.6)';
      border.style.animation = 'pulse-border 0.5s ease-in-out infinite';
    } else if (isUrgent) {
      border.style.borderColor = 'rgba(255,150,0,0.3)';
      border.style.animation = 'none';
    } else {
      border.style.borderColor = 'transparent';
      border.style.animation = 'none';
    }
  }, [isCritical, isUrgent]);

  if (!active) return null;

  return (
    <>
      {/* Timer circle — top right area */}
      <motion.div
        className="absolute top-16 right-4 z-25"
        animate={isCritical ? { 
          scale: [1, 1.2, 1],
          rotate: [-3, 3, -3, 0],
        } : {}}
        transition={isCritical ? { duration: 0.3, repeat: Infinity } : {}}
      >
        <div className="relative w-16 h-16">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#E5E7EB" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none"
              stroke={isCritical ? '#FF4444' : isUrgent ? '#FF9800' : color}
              strokeWidth="3"
              strokeDasharray={`${progress * 94.2} 94.2`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.3s' }}
            />
          </svg>
          {/* Number in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`font-display font-bold text-lg ${isCritical ? 'text-red-500' : 'text-foreground'}`}
            >
              {timeLeft}
            </span>
          </div>
        </div>
      </motion.div>

      {/* TIME'S UP flash */}
      <AnimatePresence>
        {timesUp && (
          <motion.div
            className="absolute inset-0 z-35 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-red-500 rounded-full px-8 py-4 shadow-[0_8px_30px_rgba(255,0,0,0.4)]"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: [0, 1.3, 1], rotate: [-10, 5, 0] }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="font-display font-bold text-2xl text-white">
                WAKTU HABIS!
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
