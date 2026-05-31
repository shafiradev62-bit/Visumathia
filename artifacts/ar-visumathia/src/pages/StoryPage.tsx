import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { playSfx, stopVimo } from '@/lib/audio';
import { VN_SCENES } from '@/components/vn/VNScenes';
import { PaintedColors as C, ComicStickerCharacter } from '@/components/painted';
import { prefetchSceneRoute } from '@/lib/sceneRegistry';

function preloadImage(src: string) {
  const img = new Image();
  img.decoding = 'async';
  img.loading = 'eager';
  img.src = src;
}

function preloadAudio(src: string) {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = src;
}

/**
 * Animated Interactive Character Component
 * Features: complex movements, approaching interactions, speech bubbles, white outline
 */
function AnimatedCharacter({ 
  type, 
  side,
  approach,
  sceneIdx 
}: { 
  type: 'vimo' | 'kid'; 
  side: 'left' | 'right';
  approach?: boolean;
  sceneIdx: number;
}) {
  const [animState, setAnimState] = useState<'idle' | 'wave' | 'jump' | 'interact'>('idle');
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [hearts, setHearts] = useState<number[]>([]);
  
  const interactionPhrases = {
    vimo: ['Bip-bop! 🤖', 'Ayo lanjut! 🚀', 'Keren kan? ✨', 'Data diproses! 📊'],
    kid: ['Vimooo! 🤗', 'Tunggu aku! 🏃‍♀️', 'Wahhh! 😍', 'Ayo main! 🎮'],
  };

  const handleClick = () => {
    const phrases = interactionPhrases[type];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setSpeechBubble(phrase);
    playSfx('pop');
    setHearts(prev => [...prev, Date.now()]);
    setTimeout(() => setHearts(prev => prev.slice(1)), 1500);
    setTimeout(() => setSpeechBubble(null), 2000);
    setAnimState('jump');
    setTimeout(() => setAnimState('idle'), 600);
  };

  const xOffset =
    type === 'kid'
      ? approach
        ? '10vw'
        : '0vw'
      : approach
        ? '-6vw'
        : '0vw';
  const characterWidth = type === 'kid' ? 340 : 310;

  return (
    <motion.div
      onClick={handleClick}
      animate={{
        x: xOffset,
        y: animState === 'idle' ? [0, -2, 0] : 0,
        rotate: animState === 'idle' ? [0, 0.2, 0, -0.2, 0] : 0,
        scale: animState === 'jump' ? [1, 1.06, 1] : 1,
      }}
      transition={{
        x: { type: 'tween', duration: 0.9, ease: 'easeInOut' },
        y: { duration: 7.5, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
      }}
      style={{
        position: 'relative',
        cursor: 'pointer',
        pointerEvents: 'auto',
        transform: side === 'left' ? 'scaleX(-1)' : 'none',
        transformOrigin: 'center bottom',
        zIndex: type === 'kid' ? 6 : 5,
      }}
    >
      <ComicStickerCharacter outlineWidth={4} outlineColor="#ffffff">
        <motion.img
          src={type === 'vimo' ? '/robot.png' : '/girl.png'}
          alt={type}
          draggable={false}
          style={{
            width: characterWidth,
            height: 'auto',
            display: 'block',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          animate={{
            x: type === 'kid' ? [0, 2, 0] : [0, -2, 0],
          }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </ComicStickerCharacter>

      {/* Speech Bubble */}
      <AnimatePresence>
        {speechBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0, y: -20, x: '-50%' }}
            style={{
              position: 'absolute',
              top: -85,
              left: '50%',
              background: '#ffffff',
              border: `3px solid ${C.ink}`,
              borderRadius: 20,
              padding: '8px 18px',
              boxShadow: `3px 4px 0 ${C.ink}`,
              zIndex: 100,
              fontFamily: "'Fredoka One', cursive",
              fontSize: 15,
              color: C.ink,
            }}
          >
            {speechBubble}
            <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `12px solid ${C.ink}` }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Hearts */}
      {hearts.map((id) => (
        <motion.div
          key={id}
          initial={{ opacity: 1, y: 0, scale: 0.5 }}
          animate={{ opacity: 0, y: -130, scale: 1.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          style={{ position: 'absolute', top: -50, right: -20, fontSize: 36, zIndex: 99 }}
        >
          ❤️
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Dialog Box using dialog.png background
 */
function WoodenDialogBox({ children, onNext, onBack, isFirst, isLast }: { children: React.ReactNode, onNext: () => void, onBack: () => void, isFirst: boolean, isLast: boolean }) {
  const woodenButtonStyle: React.CSSProperties = {
    backgroundImage:
      'linear-gradient(180deg, #B56634 0%, #7A3B1A 60%, #5A2A12 100%), repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 2px, rgba(0,0,0,0.04) 6px, rgba(0,0,0,0.04) 10px)',
    backgroundBlendMode: 'overlay',
    border: `3px solid ${C.ink}`,
    borderRadius: 16,
    width: 56,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: `0 5px 0 ${C.ink}, 0 12px 18px rgba(0,0,0,0.25)`,
    color: '#fff',
    fontFamily: "'Fredoka One', cursive",
    fontSize: 26,
    lineHeight: 1,
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <motion.div 
      animate={{ y: [0, 3, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: 'absolute',
        bottom: '5%',
        left: '7%',
        right: '7%',
        maxHeight: '40%',
        zIndex: 20,
        filter: `drop-shadow(0 15px 30px rgba(0,0,0,0.5))`
      }}
    >
      <div 
        className="dialog-scroll-container"
        style={{
           position: 'relative',
           width: '100%',
           maxWidth: 1180,
           margin: '0 auto',
         }}
      >
        <img
          src="/dialog.png"
          alt="dialog"
          draggable={false}
          style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '6% 9% 8% 9%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '6%',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 1fr',
              columnGap: 18,
              alignItems: 'center',
            }}
          >
            <motion.div
              animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 110,
                height: 110,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <ComicStickerCharacter outlineWidth={3} outlineColor="#ffffff">
                <img
                  src="/robot.png"
                  alt="vimo"
                  draggable={false}
                  style={{
                    width: 105,
                    height: 105,
                    objectFit: 'contain',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              </ComicStickerCharacter>
            </motion.div>

            <div
              className="dialog-text-scroll"
              style={{
                maxHeight: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingRight: 10,
                pointerEvents: 'auto',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Fredoka One', cursive",
                  color: '#FFFFFF',
                  fontSize: 'clamp(16px, 2.1vw, 22px)',
                  lineHeight: 1.22,
                  textShadow: `3px 3px 0 ${C.ink}`,
                  letterSpacing: '0.01em',
                  width: '100%',
                  textAlign: 'left',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
                {children}
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'auto',
            }}
          >
            {!isFirst ? (
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.98, y: 3, boxShadow: `0 2px 0 ${C.ink}, 0 8px 12px rgba(0,0,0,0.2)` }}
                onClick={onBack}
                style={{
                  ...woodenButtonStyle,
                }}
              >
                ‹
              </motion.button>
            ) : (
              <div />
            )}

            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.98, y: 3, boxShadow: `0 2px 0 ${C.ink}, 0 8px 12px rgba(0,0,0,0.2)` }}
              onClick={onNext}
              style={{
                ...woodenButtonStyle,
              }}
            >
              {isLast ? '✓' : '›'}
            </motion.button>
          </div>
        </div>
      </div>
      
      <style>{`
        .dialog-text-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .dialog-text-scroll::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .dialog-text-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
        }
      `}</style>
    </motion.div>
  );
}

export function StoryPage() {
  const [, setLocation] = useLocation();
  const [pageIdx, setPageIdx] = useState(0);
  const touchStartX = useRef(0);
  
  useEffect(() => {
    return () => {
      stopVimo();
    };
  }, []);

  useEffect(() => {
    preloadImage('/dialog.png');
    preloadImage('/robot.png');
    preloadImage('/girl.png');

    const sceneNo = pageIdx + 1;
    const nextSceneNo = sceneNo + 1;
    const prevSceneNo = sceneNo - 1;

    if (sceneNo >= 1 && sceneNo <= 12) preloadImage(`/scene${sceneNo}.png`);
    if (nextSceneNo >= 1 && nextSceneNo <= 12) preloadImage(`/scene${nextSceneNo}.png`);
    if (prevSceneNo >= 1 && prevSceneNo <= 12) preloadImage(`/scene${prevSceneNo}.png`);

    preloadAudio(`/voice/narration/scene-${sceneNo}.m4a`);
    if (nextSceneNo <= 15) preloadAudio(`/voice/narration/scene-${nextSceneNo}.m4a`);
  }, [pageIdx]);

  const totalPages = VN_SCENES.length;
  const showCharacters = pageIdx >= 1;
  const scene = VN_SCENES[pageIdx];
  const SceneComp = scene?.Component;
  const approachActive = pageIdx > 0 && pageIdx % 2 === 1;

  const goNext = useCallback(() => {
    playSfx('click');
    if (pageIdx < totalPages - 1) {
      setPageIdx(pageIdx + 1);
    } else {
      setLocation('/home');
    }
  }, [pageIdx, totalPages, setLocation]);

  const goBack = useCallback(() => {
    playSfx('click');
    if (pageIdx > 0) {
      setPageIdx(pageIdx - 1);
    }
  }, [pageIdx]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 80) {
      if (dx < 0) goNext();
      else goBack();
    }
  };

  if (!scene) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#000',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* FULL SCREEN BACKGROUND SCENE */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pageIdx}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%', height: '100%' }}
          >
            <SceneComp />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* TOP LEFT TITLE BADGE */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 30,
      }}>
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          style={{
            background: 'rgba(255,255,255,0.95)',
            border: `4px solid ${C.ink}`,
            borderRadius: '25% 10% 25% 10% / 10% 25% 10% 25%',
            padding: '8px 30px',
            fontFamily: "'Fredoka One', cursive",
            fontSize: 20,
            color: C.ink,
            boxShadow: `0 5px 0 ${C.ink}`,
            letterSpacing: '0.06em',
          }}
        >
          Petualangan
        </motion.div>
      </div>

      {/* PROGRESS DOTS */}
      <div style={{
        position: 'absolute',
        top: 30,
        right: 30,
        display: 'flex',
        gap: 8,
        zIndex: 30,
      }}>
        {VN_SCENES.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === pageIdx ? 24 : 10,
              height: 10,
              borderRadius: 5,
              background: i === pageIdx ? '#fff' : 'rgba(255,255,255,0.4)',
              border: `2px solid ${C.ink}`,
            }}
          />
        ))}
      </div>

      {/* Characters */}
      <div style={{
        position: 'absolute',
        bottom: '38%',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 10%',
        pointerEvents: 'none',
        zIndex: 25
      }}>
        <AnimatePresence>
          {pageIdx > 0 && (
            <>
              <AnimatedCharacter type="kid" side="left" approach={approachActive} sceneIdx={pageIdx} />
              <AnimatedCharacter type="vimo" side="right" approach={approachActive} sceneIdx={pageIdx} />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* WOODEN WAVY DIALOG BOX */}
      <WoodenDialogBox 
        onNext={goNext} 
        onBack={goBack} 
        isFirst={pageIdx === 0} 
        isLast={pageIdx === totalPages - 1}
      >
        {scene.caption}
      </WoodenDialogBox>
    </div>
  );
}
