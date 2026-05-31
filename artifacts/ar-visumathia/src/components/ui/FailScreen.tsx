import { motion, AnimatePresence } from 'framer-motion';
import { playSfx } from '@/lib/audio';
import { PaintedButton } from '@/components/painted';

interface FailScreenProps {
  active: boolean;
  onRetry: () => void;
  onQuit: () => void;
}

/**
 * Painted fail screen — cream parchment card with chunky outlined "OOPS!"
 * over a darkened backdrop, with painted action buttons.
 */
export function FailScreen({ active, onRetry, onQuit }: FailScreenProps) {
  if (!active) return null;
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ background: 'rgba(255,80,60,0.55)' }}
            animate={{ background: 'rgba(20,12,6,0.7)' }}
            transition={{ duration: 0.5 }}
          />

          <motion.div
            className="relative text-center px-5 py-6"
            style={{
              background: '#fffaf0',
              backgroundImage:
                'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.9), rgba(247,231,180,0.55) 70%)',
              border: '3px solid #2a1809',
              borderRadius: 22,
              boxShadow: '5px 6px 0 #2a1809, inset 0 2px 0 rgba(255,255,255,0.6)',
              maxWidth: 320,
              width: '100%',
            }}
            initial={{ scale: 0.7, rotate: -8 }}
            animate={{ scale: [0.7, 1.1, 1], rotate: [-8, 4, 0] }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          >
            <motion.h1
              style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 56,
                color: '#a83828',
                margin: 0,
                letterSpacing: '0.05em',
                textShadow: '0 3px 0 #2a1809, 0 5px 0 rgba(0,0,0,0.25)',
                WebkitTextStroke: '0px transparent',
              }}
              animate={{ rotate: [-3, 3, -3, 0] }}
              transition={{ duration: 0.6, repeat: 2 }}
            >
              OOPS!
            </motion.h1>

            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: 14,
                color: '#3d2410',
                margin: '6px 0 18px',
              }}
            >
              Yah, coba lagi yuk!
            </p>

            <div className="flex gap-3 justify-center">
              <PaintedButton
                variant="green"
                size="md"
                onClick={() => { playSfx('click'); onRetry(); }}
              >
                Ulangi
              </PaintedButton>
              <PaintedButton
                variant="cream"
                size="md"
                onClick={() => { playSfx('click'); onQuit(); }}
              >
                Keluar
              </PaintedButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
