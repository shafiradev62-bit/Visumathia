import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakVimo, playSfx } from '@/lib/audio';

interface CinematicIntroProps {
  sceneName: string;
  sceneColor: string;
  instruction: string;
  /** Tutorial steps shown one by one — Vimo reads each */
  steps?: string[];
  onComplete: () => void;
}

/**
 * Real game tutorial cinematic — slow, deliberate.
 * Vimo speaks each step, waits, then moves on.
 * No emoji, no rush. The 3D scene plays behind (Vimo is walking/pointing in the scene).
 * Each step takes ~4 seconds so the player can absorb it.
 */
export function CinematicIntro({ sceneName, sceneColor, instruction, steps, onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState<'title' | 'steps' | 'ready'>('title');
  const [stepIdx, setStepIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const tutorialSteps = steps || [
    `Ini adalah ${sceneName}.`,
    instruction,
    'Lihat Vimo bergerak ke area yang bersinar.',
    'Sentuh area itu untuk bermain!',
  ];

  // Phase 1: Title — hold for 3 seconds
  useEffect(() => {
    speakVimo(sceneName);
    const t1 = setTimeout(() => setPhase('steps'), 3000);
    return () => clearTimeout(t1);
  }, []);

  // Phase 2: Steps — 4 seconds each, Vimo speaks
  useEffect(() => {
    if (phase !== 'steps') return;

    speakVimo(tutorialSteps[stepIdx]);

    const timer = setTimeout(() => {
      if (stepIdx < tutorialSteps.length - 1) {
        setStepIdx(s => s + 1);
      } else {
        setPhase('ready');
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [phase, stepIdx]);

  // Phase 3: Ready — hold 2 seconds then finish
  useEffect(() => {
    if (phase !== 'ready') return;
    playSfx('success');
    speakVimo('Ayo mulai!');
    const timer = setTimeout(() => handleFinish(), 2500);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleFinish = useCallback(() => {
    setVisible(false);
    playSfx('whoosh');
    setTimeout(onComplete, 300);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-25 flex flex-col items-center justify-between py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Tap blocker — absorbs all pointer events so 3D scene can't be clicked during tutorial */}
          <div
            className="absolute inset-0"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* === TITLE PHASE === */}
          {phase === 'title' && (
            <motion.div
              className="flex-1 flex flex-col items-center justify-center gap-3 z-10"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              <div
                className="px-4 py-1 rounded-full text-white text-[10px] font-bold tracking-wider shadow-lg"
                style={{ background: sceneColor }}
              >
                TUTORIAL
              </div>

              <h1 className="font-display font-bold text-white text-3xl md:text-4xl text-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                {sceneName}
              </h1>

              <p className="text-white/70 text-sm font-semibold text-center max-w-[260px]">
                {instruction}
              </p>

              {/* Pulsing indicator that something is happening */}
              <motion.div
                className="mt-4 w-12 h-1 rounded-full bg-white/40"
                animate={{ scaleX: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          )}

          {/* === STEPS PHASE — tutorial card at TOP so Vimo is visible === */}
          {phase === 'steps' && (
            <motion.div
              className="flex-1 flex flex-col justify-start z-10 w-full px-4 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="relative max-w-md mx-auto w-full"
                key={stepIdx}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                style={{
                  background: '#FFFFFF',
                  border: '3px solid #2D1B0E',
                  borderRadius: 22,
                  boxShadow: '4px 5px 0 #2D1B0E',
                  padding: '14px 18px 12px',
                }}
              >
                {/* Cloud bubble tail — points down toward the scene */}
                <div
                  className="absolute"
                  style={{
                    left: '50%', bottom: -16,
                    transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '14px solid transparent',
                    borderRight: '14px solid transparent',
                    borderTop: '16px solid #2D1B0E',
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    left: '50%', bottom: -11,
                    transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: '12px solid #FFFFFF',
                    zIndex: 1,
                  }}
                />

                {/* Step progress */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]"
                    style={{
                      background: sceneColor,
                      border: '2px solid #2D1B0E',
                      fontFamily: "'Fredoka One', cursive",
                    }}
                  >
                    {stepIdx + 1}
                  </div>
                  <div className="flex-1 flex gap-1">
                    {tutorialSteps.map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full flex-1 transition-all duration-500"
                        style={{ background: i <= stepIdx ? sceneColor : 'rgba(45,27,14,0.18)' }}
                      />
                    ))}
                  </div>
                  <span
                    className="text-[10px]"
                    style={{ fontFamily: "'Fredoka One', cursive", color: '#8B5E3C' }}
                  >
                    {stepIdx + 1}/{tutorialSteps.length}
                  </span>
                </div>

                {/* Step text */}
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: '#2D1B0E',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                  }}
                >
                  {tutorialSteps[stepIdx]}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* === READY PHASE === */}
          {phase === 'ready' && (
            <motion.div
              className="flex-1 flex flex-col items-center justify-center z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                style={{
                  background: '#FFFFFF',
                  border: '3px solid #2D1B0E',
                  borderRadius: 9999,
                  boxShadow: '5px 6px 0 #2D1B0E',
                  padding: '14px 36px',
                }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span
                  className="text-2xl"
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    color: '#2D1B0E',
                    letterSpacing: '0.02em',
                  }}
                >
                  SIAP MULAI!
                </span>
              </motion.div>
            </motion.div>
          )}

          {/* Skip button — always available */}
          <motion.div
            className="z-10 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <motion.button
              onClick={handleFinish}
              className="px-5 py-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 font-bold text-white text-xs hover:bg-black/40 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
            >
              Skip
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
