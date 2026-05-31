import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakVimo, stopVimo, playSfx } from '@/lib/audio';
import { VimoAvatar } from '@/components/ui/VimoAvatar';
import { PaintedSpeech } from '@/components/painted';

interface VimoBubbleProps {
  messages: string[];
  onComplete: () => void;
  vimoSrc: string;
  autoAdvance?: number;
  enableVoice?: boolean;
  /** speaker name shown in the colored pill */
  speakerName?: string;
  /** colored pill background */
  speakerColor?: string;
}

/**
 * Hand-painted speech-bubble dialog — matches the cozy farming-game look.
 * White cream bubble with chunky ink outline + colored name pill above.
 */
export function VimoBubble({
  messages,
  onComplete,
  vimoSrc,
  autoAdvance,
  enableVoice = true,
  speakerName = 'Vimo',
  speakerColor = '#5e4ea8',
}: VimoBubbleProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!enableVoice || !visible) return;
    setIsSpeaking(true);
    speakVimo(messages[currentIdx]).then(() => { setIsSpeaking(false); });
    return () => { stopVimo(); setIsSpeaking(false); };
  }, [currentIdx, enableVoice, visible]);

  useEffect(() => {
    if (autoAdvance && visible && !isSpeaking) {
      const t = setTimeout(() => handleNext(), autoAdvance);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [currentIdx, autoAdvance, visible, isSpeaking]);

  const handleNext = useCallback(() => {
    playSfx('pop');
    stopVimo();
    if (currentIdx < messages.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setVisible(false);
      playSfx('whoosh');
      setTimeout(onComplete, 300);
    }
  }, [currentIdx, messages.length, onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-30 flex items-end justify-center pb-3 px-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleNext}
          style={{ cursor: 'pointer' }}
        >
          {/* Backdrop removed to prevent dark overlay */}

          <motion.div
            className="relative w-full max-w-sm flex items-end gap-2"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.1 }}
          >
            {/* Avatar — round painted portrait */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 30% 28%, #faecc4, #e9b34a 60%, #a36a1d 100%)',
                border: '2.5px solid #2a1809',
                boxShadow: '2px 3px 0 #2a1809, inset 0 1.5px 0 rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {vimoSrc ? (
                <img src={vimoSrc} alt={speakerName} style={{ width: 32, height: 32, objectFit: 'contain' }} />
              ) : (
                <VimoAvatar size={30} variant="idle" />
              )}
            </div>

            {/* Speech bubble */}
            <div className="flex-1">
              <PaintedSpeech
                name={speakerName}
                nameColor={speakerColor}
                pillSide="left"
                tailSide="left"
                maxWidth={420}
                style={{ width: '100%' }}
              >
                {/* Step indicators */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex gap-1">
                    {messages.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          height: 5,
                          width: i === currentIdx ? 22 : 8,
                          background: i <= currentIdx ? '#2a1809' : 'rgba(45,27,14,0.2)',
                          borderRadius: 9999,
                          transition: 'all 0.3s',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 11, color: '#7a4a17' }}>
                    {currentIdx + 1}/{messages.length}
                  </span>
                </div>

                {/* Text */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentIdx}
                    style={{ margin: 0, lineHeight: 1.4 }}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    {messages[currentIdx]}
                  </motion.p>
                </AnimatePresence>

                {/* speaking dots */}
                {isSpeaking && (
                  <div className="flex gap-1 mt-2">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <motion.div
                        key={i}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#2a1809' }}
                        animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.6, delay: d, repeat: Infinity }}
                      />
                    ))}
                  </div>
                )}

                {/* Advance cue */}
                <motion.div
                  className="flex items-center justify-end gap-1 mt-2"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 12, color: '#a83828' }}>
                    {currentIdx < messages.length - 1 ? 'KETUK ▼' : 'MULAI! ▼'}
                  </span>
                </motion.div>
              </PaintedSpeech>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
