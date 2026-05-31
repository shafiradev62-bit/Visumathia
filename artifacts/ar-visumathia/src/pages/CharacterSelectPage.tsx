import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import { playSfx, playBgMusic, stopBgMusic } from '@/lib/audio';
import { prefetchSceneRoute } from '@/lib/sceneRegistry';
import { useCharacterStore, type CharacterType } from '@/lib/characterStore';
import {
  ParallaxBg,
  PaintedBackButton,
  WoodSign,
  PaintedButton,
  PaintedIconButton,
  PaintedColors as C,
} from '@/components/painted';

const CHARACTERS = [
  {
    id: 'girl' as CharacterType,
    name: 'Vima',
    desc: 'Gadis ceria yang suka berhitung dan menjelajah!',
    tag: 'Karakter Cewek',
    color: '#FF6B9D',
    model: '/models/langkah.glb',
    type: 'glb' as const,
    scale: 1.2,
    camPos: [0, 0.8, 4.5] as [number, number, number],
  },
  {
    id: 'boy' as CharacterType,
    name: 'Vimo',
    desc: 'Anak laki-laki pemberani siap berpetualang!',
    tag: 'Karakter Cowok',
    color: '#5BC5F2',
    model: '/models/boy.glb',
    type: 'glb' as const,
    scale: 1.2,
    camPos: [0, 0.8, 4.5] as [number, number, number],
  },
];

function CharacterModelGLB({ modelPath, scale }: { modelPath: string; scale: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const { scene, animations } = useGLTF(modelPath);
  const cloned = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    if (!cloned || animations.length === 0) return;
    const mixer = new THREE.AnimationMixer(cloned);
    const action = mixer.clipAction(animations[0]);
    action.reset().play();
    mixerRef.current = mixer;
    return () => { mixer.stopAllAction(); mixerRef.current = null; };
  }, [cloned, animations]);

  useFrame((_, delta) => { mixerRef.current?.update(delta); });

  return (
    <group ref={groupRef} scale={scale} position={[0, -1.6, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

function CharacterModelFBX({ modelPath, scale }: { modelPath: string; scale: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const fbx = useLoader(FBXLoader, modelPath);

  useEffect(() => {
    if (!fbx || !fbx.animations || fbx.animations.length === 0) return;
    const mixer = new THREE.AnimationMixer(fbx);
    const action = mixer.clipAction(fbx.animations[0]);
    action.reset();
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.play();
    mixerRef.current = mixer;
    return () => {
      action.stop();
      mixer.stopAllAction();
      mixer.uncacheRoot(fbx);
      mixerRef.current = null;
    };
  }, [fbx]);

  useFrame((_, delta) => { mixerRef.current?.update(delta); });

  return (
    <group ref={groupRef} scale={scale * 0.01} position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <primitive object={fbx} />
    </group>
  );
}

function CharacterModel({ modelPath, scale, type = 'glb' }: { modelPath: string; scale: number; type?: 'glb' | 'fbx' }) {
  if (type === 'fbx') return <CharacterModelFBX modelPath={modelPath} scale={scale} />;
  return <CharacterModelGLB modelPath={modelPath} scale={scale} />;
}

export function CharacterSelectPage() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { character, setCharacter } = useCharacterStore();
  const sceneId = new URLSearchParams(window.location.search).get('scene') || '1';

  useEffect(() => {
    const id = parseInt(sceneId, 10);
    if (id >= 1 && id <= 10) prefetchSceneRoute(id);
  }, [sceneId]);

  useEffect(() => {
    useGLTF.preload(CHARACTERS[currentIndex].model);
  }, [currentIndex]);

  useEffect(() => {
    const idx = CHARACTERS.findIndex(c => c.id === character);
    if (idx >= 0) setCurrentIndex(idx);
  }, []);

  useEffect(() => { playBgMusic(); return () => stopBgMusic(); }, []);

  const current = CHARACTERS[currentIndex];

  const goNext = () => {
    if (currentIndex < CHARACTERS.length - 1) {
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

  const handleSelect = () => {
    playSfx('click');
    setCharacter(current.id);
    setLocation(`/scene/${sceneId}`);
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <ParallaxBg />

      <PaintedBackButton onClick={() => { playSfx('click'); setLocation('/home'); }} />

      <div className="relative z-10 flex justify-center pt-1">
        <WoodSign text="Pilih Temanmu" width={200} height={44} />
      </div>

      <p
        className="relative z-10 text-center mt-0 px-6"
        style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: 11,
          color: '#fff',
          textShadow: `0 2px 0 ${C.ink}, 0 0 8px rgba(0,0,0,0.3)`,
          letterSpacing: '0.02em',
        }}
      >
        Siapa yang akan menemanimu?
      </p>

      <div className="flex-1 relative z-10 flex items-center justify-center px-4">
        {currentIndex > 0 && (
          <div className="absolute left-3 z-30">
            <PaintedIconButton variant="cream" size={34} onClick={goPrev} aria-label="Sebelumnya">
              <ChevronLeft className="w-4 h-4" style={{ color: C.ink }} />
            </PaintedIconButton>
          </div>
        )}

        <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1200px' }}>
          {CHARACTERS.map((char, index) => {
            const offset = index - currentIndex;
            if (Math.abs(offset) > 2) return null;

            const cardScale = offset === 0 ? 1 : 0.78;
            const x = offset * 180;
            const rotateY = offset * -8;
            const zIndex = 10 - Math.abs(offset);
            const opacity = Math.abs(offset) > 1 ? 0.4 : 1;
            const isCenter = offset === 0;
            const renderCanvas = isCenter;

            return (
              <motion.div
                key={char.id}
                className="absolute cursor-pointer"
                style={{ zIndex }}
                animate={{ x, scale: cardScale, rotateY, opacity }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                onClick={() => { playSfx('click'); setCurrentIndex(index); }}
              >
                <div style={{ position: 'relative', width: 200 }}>
                  {/* shadow plate */}
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: C.ink,
                      borderRadius: 14,
                      transform: 'translate(3px, 5px)',
                      opacity: isCenter ? 1 : 0.7,
                    }}
                  />
                  <div
                    style={{
                      position: 'relative',
                      background: C.paper,
                      border: `2.5px solid ${C.ink}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    {/* color band header */}
                    <div
                      style={{
                        position: 'relative',
                        height: 28,
                        background: char.color,
                        borderBottom: `2.5px solid ${C.ink}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: 12,
                          right: 12,
                          height: '40%',
                          background: '#ffffff',
                          opacity: 0.25,
                          borderRadius: 9999,
                        }}
                      />
                      <span
                        style={{
                          position: 'relative',
                          fontFamily: "'Fredoka One', cursive",
                          color: '#fff',
                          fontSize: 12,
                          textShadow: `0 1px 0 ${C.ink}`,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {char.tag}
                      </span>
                    </div>

                    <div
                      style={{
                        position: 'relative',
                        height: 150,
                        background: '#dff1ff',
                        borderBottom: `2.5px solid ${C.ink}`,
                        overflow: 'hidden',
                      }}
                    >
                      {character === char.id && (
                        <motion.div
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 10,
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            background: '#fff',
                            border: `2.5px solid ${C.ink}`,
                            boxShadow: `0 3px 0 ${C.ink}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7" stroke={char.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}

                      <Canvas camera={{ position: char.camPos, fov: 50 }}>
                        <ambientLight intensity={1.5} />
                        <directionalLight position={[2, 4, 2]} intensity={1.2} color="#FFF8E1" />
                        <directionalLight position={[-2, 2, -1]} intensity={0.4} color="#B3E5FC" />
                        <Suspense fallback={null}>
                          {renderCanvas && <CharacterModel modelPath={char.model} scale={char.scale} type={char.type} />}
                        </Suspense>
                      </Canvas>

                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: 22,
                          background: C.hillNear,
                          borderTop: `2.5px solid ${C.ink}`,
                        }}
                      />
                    </div>

                    <div style={{ padding: '8px 10px 10px', textAlign: 'center', background: C.paper }}>
                      <h3
                        style={{
                          fontFamily: "'Fredoka One', cursive",
                          color: C.ink,
                          fontSize: 14,
                          margin: 0,
                          marginBottom: 2,
                        }}
                      >
                        {char.name}
                      </h3>
                      {isCenter && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                          <p
                            style={{
                              fontFamily: "'Nunito', sans-serif",
                              fontWeight: 800,
                              fontSize: 10,
                              color: C.woodDark,
                              margin: '2px 0 0',
                              lineHeight: 1.3,
                            }}
                          >
                            {char.desc}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {currentIndex < CHARACTERS.length - 1 && (
          <div className="absolute right-3 z-30">
            <PaintedIconButton variant="cream" size={34} onClick={goNext} aria-label="Berikutnya">
              <ChevronRight className="w-4 h-4" style={{ color: C.ink }} />
            </PaintedIconButton>
          </div>
        )}
      </div>

      <div className="relative z-20 px-3 pb-2 pt-1">
        <div className="flex justify-center gap-2 mb-2">
          {CHARACTERS.map((char, i) => (
            <button
              key={char.id}
              onClick={() => { playSfx('click'); setCurrentIndex(i); }}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: i === currentIndex ? current.color : C.cream,
                border: `2px solid ${C.ink}`,
                boxShadow: `0 2px 0 ${C.ink}`,
                color: i === currentIndex ? '#fff' : C.woodDark,
                fontFamily: "'Fredoka One', cursive",
                fontSize: 10,
                cursor: 'pointer',
                textShadow: i === currentIndex ? '0 1px 0 rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {i === 0 ? 'G' : 'B'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 justify-center">
          <PaintedButton
            variant="cream"
            size="sm"
            onClick={() => { playSfx('click'); setLocation('/home'); }}
            icon={<ChevronLeft className="w-3 h-3" />}
          >
            Kembali
          </PaintedButton>

          <PaintedButton
            variant="green"
            size="md"
            onClick={handleSelect}
            style={{ minWidth: 180 }}
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            }
          >
            Main sebagai {current.name}!
          </PaintedButton>
        </div>
      </div>
    </div>
  );
}
