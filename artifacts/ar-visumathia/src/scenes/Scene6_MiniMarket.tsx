import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { Vimo } from '@/components/Vimo';
import { TapIndicator } from '@/components/TapIndicator';
import { CinematicCamera } from '@/components/CinematicCamera';
import { AmbientParticles } from '@/components/AmbientParticles';
import { PickupAnimation } from '@/components/PickupAnimation';
import { playSfx, speakVimo, speakNumber } from '@/lib/audio';
import { useGameStore } from '@/lib/gameStore';
import { triggerWrongFlash } from '@/components/GameFeel';
import { SceneStage } from '@/components/SceneStage';
import { GroundedEnv } from '@/components/GroundedEnv';
import { ARGroundDisc } from '@/components/ARGroundDisc';
import { useAutoWalk } from '@/lib/useAutoWalk';
import { useSceneGround } from '@/hooks/useSceneGround';
import { LEGACY_FLOOR_Y } from '@/lib/sceneGround';

interface Props { onComplete: (stars: number, score: number) => void; }

const ITEMS = [
  { id: 0, pos: [-0.6, 0.1, -1] as [number, number, number], isTarget: true, color: '#F44336' },
  { id: 1, pos: [-0.2, 0.1, -1] as [number, number, number], isTarget: true, color: '#F44336' },
  { id: 2, pos: [0.2, 0.1, -1] as [number, number, number], isTarget: true, color: '#F44336' },
  { id: 3, pos: [0.6, 0.1, -1] as [number, number, number], isTarget: false, color: '#4CAF50' },
  { id: 4, pos: [-0.4, 0.5, -1] as [number, number, number], isTarget: true, color: '#F44336' },
  { id: 5, pos: [0.4, 0.5, -1] as [number, number, number], isTarget: true, color: '#F44336' },
];
const TARGETS = ITEMS.filter(i => i.isTarget);

function ShelfItem({ position, color, visible }: { position: [number, number, number]; color: string; visible: boolean }) {
  const ref = useRef(null);
  // Removed useRef/useFrame since we don't have those imports yet — just static mesh
  if (!visible) return null;
  return (
    <group ref={ref} position={position}>
      {/* Product box */}
      <mesh castShadow>
        <boxGeometry args={[0.14, 0.18, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Label stripe */}
      <mesh position={[0, 0.051, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.002]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * DWTD Market — tap RED items only! Green = wrong! 7 seconds per item, faster.
 */
export function Scene6_MiniMarket({ onComplete }: Props) {
  const { groundY, applyMeasure, pos, foot, obstacle } = useSceneGround();
  const items = useMemo(
    () => ITEMS.map((i) => ({ ...i, pos: pos(i.pos[0], i.pos[1], i.pos[2]) })),
    [pos, groundY],
  );
  const [collected, setCollected] = useState<number[]>([]);
  const [camShake, setCamShake] = useState(0);
  const [camPunch, setCamPunch] = useState(0);
  const [camPos] = useState<[number, number, number]>([0.3, 0.5, 1.5]);
  const [camLookAt] = useState<[number, number, number]>([0, -0.5, -1]);
  const [vimoAnim, setVimoAnim] = useState<'wave' | 'idle' | 'point' | 'walk' | 'celebrate' | 'grab' | 'shocked' | 'dance' | 'think'>('wave');
  const [vimoPos, setVimoPos] = useState<[number, number, number]>(() => pos(0.3, -1.4, -1.3));
  const [lastTappedPos, setLastTappedPos] = useState<[number, number, number] | null>(null);
  const [pickupTrigger, setPickupTrigger] = useState<number | null>(null);
  const [pickupStart, setPickupStart] = useState<[number, number, number]>(() => foot(0, 0));
  const [pickupColor, setPickupColor] = useState('#FFD93D');
  const registerTap = useGameStore(s => s.registerTap);
  const correctCount = collected.filter(id => items[id].isTarget).length;
  const vimoPosRef = useRef<[number, number, number]>(pos(0.3, -1.4, -1.3));
  const setVimoAnimStr = useRef((a: string) => setVimoAnim(a as any)).current;
  const { walkTo, cleanup: cleanupWalk } = useAutoWalk(setVimoPos, setVimoAnimStr, vimoPosRef);

  useEffect(() => { vimoPosRef.current = vimoPos; }, [vimoPos]);
  useEffect(() => { return cleanupWalk; }, []);

  useEffect(() => {
    setVimoAnim('point');
  }, [correctCount]);

  const handleFail = () => {
    playSfx('wrong');
    triggerWrongFlash();
    setCamShake(Date.now());
    setVimoAnim('think');
    speakVimo('Bukan yang itu! Yang merah ya!');
    setTimeout(() => { setVimoAnim('point'); }, 1200);
  };

  const handleItem = (id: number) => {
    if (collected.includes(id)) return;
    if (!items[id].isTarget) {
      // WRONG — tapped green item!
      handleFail();
      registerTap(false);
      return;
    }

    const item = items[id];
    setLastTappedPos(item.pos);

    // Walk to the item first, then grab
    walkTo(item.pos, () => {
      setPickupStart(item.pos);
      setPickupColor(item.color);
      setPickupTrigger(Date.now());
      setCamPunch(Date.now());

      setCollected(prev => [...prev, id]);
      registerTap(true);
      playSfx('success');
      speakNumber(correctCount + 1);
      setVimoAnim('grab');
      setTimeout(() => setVimoAnim('celebrate'), 500);
      setTimeout(() => setVimoAnim('idle'), 1300);

      if (correctCount + 1 >= TARGETS.length) {
        setTimeout(() => { setVimoAnim('dance'); playSfx('cheer'); setTimeout(() => onComplete(3, 320), 1500); }, 1000);
      }
    }, { offset: [0.3, 0, 0.3] });
  };

  const vimoLookTarget: [number, number, number] = lastTappedPos ?? camPos;

  return (
    <>
      <CinematicCamera position={camPos} lookAt={camLookAt} smoothness={0.07} punch={camPunch} shake={camShake} />
      <SceneStage envPreset="warehouse" keyIntensity={1.3} shadowOpacity={0.45} />

      <Suspense fallback={null}>
        <GroundedEnv
          modelPath="/models/market.glb"
          scale={2}
          position={[0, LEGACY_FLOOR_Y, 0]}
          onMeasure={(info) => applyMeasure(info, { setVimoPos })}
        />
      </Suspense>

      <ARGroundDisc groundY={groundY} />

      {/* Market dust particles */}
      <AmbientParticles count={12} color="#FFE0B2" area={3} centerY={groundY + 1.7} />

      {/* 3D shelf items */}
      {items.map(item => (
        <ShelfItem key={`item-${item.id}`} position={item.pos} color={item.color} visible={!collected.includes(item.id)} />
      ))}

      {items.map(item => (
        <TapIndicator key={item.id} position={item.pos} color={item.color} active={!collected.includes(item.id)} onClick={() => handleItem(item.id)} />
      ))}

      {/* Pickup animation */}
      <PickupAnimation
        startPos={pickupStart}
        endPos={[vimoPos[0], vimoPos[1] + 0.5, vimoPos[2]]}
        color={pickupColor}
        triggerId={pickupTrigger}
        duration={600}
      />

      <Vimo position={vimoPos} animation={vimoAnim} scale={0.45} lookAt={vimoLookTarget} bounds={[-3, 3, -2, 3]} obstacles={[obstacle([0, LEGACY_FLOOR_Y, -1], [2, 1, 0.8], 0.3)]} />
    </>
  );
}

useGLTF.preload('/models/market.glb');







