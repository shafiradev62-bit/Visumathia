import { useState, useEffect, Suspense, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { playSfx, playBgMusic, stopBgMusic } from '@/lib/audio';
import { prefetchSceneRoute } from '@/lib/sceneRegistry';
import {
  ParallaxBg,
  PaintedBackButton,
  WoodSign,
  PaintedButton,
  PaintedIconButton,
  PaintedStar,
  PaintedGem,
  PaintedColors as C,
} from '@/components/painted';

const SCENES = [
  { id: 1, name: 'Dunia VisuMathia', desc: 'Taman ajaib penuh angka dan bentuk.', tag: 'Taman & Edukasi', color: '#5BC5F2', model: '/models/cloister-garden.glb', scale: 0.5, rotY: 0 },
  { id: 2, name: 'Kamar Anak', desc: 'Bereskan kamar dan temukan benda tersembunyi.', tag: 'Posisi & Ruang', color: '#FF6B6B', model: '/models/bedroom.glb', scale: 0.6, rotY: 0 },
  { id: 3, name: 'Taman Bermain', desc: 'Kumpulkan bola dan hitung bersama.', tag: 'Berhitung', color: '#6BCB77', model: '/models/garden.glb', scale: 0.15, rotY: 0 },
  { id: 4, name: 'Dapur Ceria', desc: 'Hitung buah-buahan di atas meja.', tag: 'Angka & Hitung', color: '#FF9F45', model: '/models/cozy-kitchen.glb', scale: 0.6, rotY: Math.PI },
  { id: 5, name: 'Sekolahku', desc: 'Kenali pola warna di papan tulis.', tag: 'Pola & Logika', color: '#A66CFF', model: '/models/classroom.glb', scale: 0.3, rotY: 0 },
  { id: 6, name: 'Pasar Mini', desc: 'Belanja dan kelompokkan barang.', tag: 'Klasifikasi', color: '#FF6B6B', model: '/models/market.glb', scale: 1.2, rotY: Math.PI },
  { id: 7, name: 'Jalan Raya', desc: 'Bantu Vimo menemukan jalan ke sekolah.', tag: 'Arah & Navigasi', color: '#5BC5F2', model: '/models/road.glb', scale: 0.4, rotY: 0 },
  { id: 8, name: 'Rak Mainan', desc: 'Susun balok sesuai urutan yang benar.', tag: 'Urutan & Susunan', color: '#FFD93D', model: '/models/apartment-building.glb', scale: 0.15, rotY: 0 },
  { id: 9, name: 'Video AR', desc: 'Kuis hitung bola emas di layar.', tag: 'Kuis Angka', color: '#45D4A8', model: '/models/tv.glb', scale: 0.6, rotY: 0 },
  { id: 10, name: 'Misi Akhir', desc: 'Kumpulkan kristal dan jadi petualang hebat!', tag: 'Tantangan Akhir', color: '#FF6B9D', model: '/models/concert.glb', scale: 0.4, rotY: 0 },
];

function CardModel({ modelPath, scale, rotY }: { modelPath: string; scale: number; rotY: number }) {
  const { scene } = useGLTF(modelPath);
  const cloned = useMemo(() => scene.clone(), [scene]);
  return (
    <group scale={scale} rotation={[0, rotY, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

export function HomePage() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    playBgMusic();
    const startCanvas = () => setCanvasReady(true);
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(startCanvas, { timeout: 120 });
      return () => { stopBgMusic(); cancelIdleCallback(id); };
    }
    const t = setTimeout(startCanvas, 0);
    return () => { stopBgMusic(); clearTimeout(t); };
  }, []);

  const currentScene = SCENES[currentIndex];

  useEffect(() => {
    useGLTF.preload(currentScene.model);
    const next = SCENES[currentIndex + 1];
    if (next) useGLTF.preload(next.model);
    prefetchSceneRoute(currentScene.id);
  }, [currentIndex, currentScene.model, currentScene.id]);

  const goNext = () => {
    if (currentIndex < SCENES.length - 1) {
      playSfx('click');
      setCurrentIndex(currentIndex + 1);
    }
  };
  const goPrev = () => {
    if (currentIndex > 0) {
      playSfx('click');
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      {/* Parallax backdrop */}
      <ParallaxBg />

      <PaintedBackButton onClick={() => { playSfx('click'); setLocation('/'); }} />

      {/* Title banner */}
      <div className="relative z-10 flex justify-center pt-1 pointer-events-none">
        <WoodSign text="Pilih Dunia" width={190} height={40} />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SINGLE CENTERED CARD — no stacking, one big card at a time
         ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-6">
        {/* Left arrow */}
        {currentIndex > 0 && (
          <div className="absolute left-4 z-30">
            <PaintedIconButton variant="cream" size={38} onClick={goPrev} aria-label="Sebelumnya">
              <ChevronLeft className="w-5 h-5" style={{ color: C.ink }} />
            </PaintedIconButton>
          </div>
        )}

        {/* The card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ width: '100%', maxWidth: 340 }}
          >
            {/* Shadow plate */}
            <div
              style={{
                position: 'relative',
                borderRadius: 22,
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: C.ink,
                  borderRadius: 22,
                  transform: 'translate(5px, 7px)',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  background: C.paper,
                  border: `3.5px solid ${C.ink}`,
                  borderRadius: 22,
                  overflow: 'hidden',
                }}
              >
                {/* Color header band */}
                <div
                  style={{
                    position: 'relative',
                    height: 34,
                    background: currentScene.color,
                    borderBottom: `3px solid ${C.ink}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      left: 14,
                      right: 14,
                      height: '40%',
                      background: '#fff',
                      opacity: 0.2,
                      borderRadius: 9999,
                    }}
                  />
                  <span
                    style={{
                      position: 'relative',
                      fontFamily: "'Fredoka One', cursive",
                      color: '#fff',
                      fontSize: 15,
                      textShadow: `0 2px 0 ${C.ink}`,
                    }}
                  >
                    Dunia {currentScene.id}
                  </span>
                  <span
                    style={{
                      position: 'relative',
                      padding: '3px 12px',
                      background: 'rgba(255,255,255,0.25)',
                      borderRadius: 9999,
                      fontFamily: "'Fredoka One', cursive",
                      color: '#fff',
                      fontSize: 11,
                      border: '2px solid rgba(255,255,255,0.4)',
                    }}
                  >
                    {currentScene.tag}
                  </span>
                </div>

                {/* 3D Preview — deferred until page is painted */}
                <div
                  style={{
                    position: 'relative',
                    height: 160,
                    background: '#dff1ff',
                    borderBottom: `3px solid ${C.ink}`,
                    overflow: 'hidden',
                  }}
                >
                  {canvasReady ? (
                    <Canvas camera={{ position: [0, 1.5, 3], fov: 35 }}>
                      <ambientLight intensity={1.2} />
                      <directionalLight position={[2, 3, 2]} intensity={1} />
                      <Suspense fallback={null}>
                        <CardModel
                          modelPath={currentScene.model}
                          scale={currentScene.scale}
                          rotY={currentScene.rotY}
                        />
                      </Suspense>
                    </Canvas>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 60, height: 60, borderRadius: '50%', background: currentScene.color, border: `3px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fredoka One', cursive", color: '#fff', fontSize: 22 }}>
                        {currentScene.id}
                      </div>
                    </div>
                  )}
                  {/* ground strip */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 24,
                      background: C.hillNear,
                      borderTop: `2.5px solid ${C.ink}`,
                    }}
                  />
                </div>

                {/* Info section */}
                <div style={{ padding: '8px 14px 12px', textAlign: 'center' }}>
                  <h2
                    style={{
                      fontFamily: "'Fredoka One', cursive",
                      color: C.ink,
                      fontSize: 17,
                      margin: 0,
                      marginBottom: 4,
                    }}
                  >
                    {currentScene.name}
                  </h2>
                  <p
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 800,
                      fontSize: 12,
                      color: C.woodDark,
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {currentScene.desc}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right arrow */}
        {currentIndex < SCENES.length - 1 && (
          <div className="absolute right-4 z-30">
            <PaintedIconButton variant="cream" size={38} onClick={goNext} aria-label="Berikutnya">
              <ChevronRight className="w-5 h-5" style={{ color: C.ink }} />
            </PaintedIconButton>
          </div>
        )}
      </div>

      {/* Bottom bar — compact for mobile, normal on desktop */}
      <div className="relative z-20 px-4 pb-2 pt-1 home-bottom-bar">
        {/* Dot indicators */}
        <div className="flex justify-center gap-1 mb-2">
          {SCENES.map((scene, i) => (
            <button
              key={scene.id}
              onClick={() => { playSfx('click'); setCurrentIndex(i); }}
              style={{
                width: i === currentIndex ? 22 : 7,
                height: 7,
                borderRadius: 9999,
                background: i === currentIndex ? currentScene.color : C.creamDark,
                border: `1.5px solid ${C.ink}`,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              aria-label={`Dunia ${scene.id}`}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 justify-center">
          <PaintedButton
            variant="cream"
            size="sm"
            onClick={() => { playSfx('click'); setLocation('/'); }}
            icon={<ChevronLeft className="w-3 h-3" />}
          >
            Kembali
          </PaintedButton>

          <PaintedButton
            variant="green"
            size="md"
            onClick={() => { playSfx('click'); setLocation(`/character?scene=${currentScene.id}`); }}
            style={{ minWidth: 170 }}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            }
          >
            Mulai Petualangan
          </PaintedButton>
        </div>

        {/* Progress chip */}
        <div className="flex justify-center mt-1">
          <div
            style={{
              padding: '2px 10px',
              background: C.cream,
              border: `2px solid ${C.ink}`,
              borderRadius: 9999,
              boxShadow: `0 2px 0 ${C.ink}`,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: "'Fredoka One', cursive",
              fontSize: 10,
              color: C.ink,
            }}
          >
            <PaintedStar size={11} />
            <span>{currentIndex * 3}/30</span>
            <span style={{ width: 1, height: 10, background: 'rgba(45,27,14,0.3)' }} />
            <PaintedGem size={11} />
            <span>0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
