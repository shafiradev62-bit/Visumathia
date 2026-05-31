import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Vimo } from '@/components/Vimo';
import { TapIndicator } from '@/components/TapIndicator';
import { CinematicCamera } from '@/components/CinematicCamera';
import { AmbientParticles } from '@/components/AmbientParticles';
import { PickupAnimation } from '@/components/PickupAnimation';
import { SceneStage } from '@/components/SceneStage';
import { GroundedEnv } from '@/components/GroundedEnv';
import { ARGroundDisc } from '@/components/ARGroundDisc';
import { speakVimo, playSfx, speakNumber } from '@/lib/audio';
import { useGameStore } from '@/lib/gameStore';
import { useAutoWalk } from '@/lib/useAutoWalk';
import { useSceneGround } from '@/hooks/useSceneGround';
import { LEGACY_FLOOR_Y } from '@/lib/sceneGround';

interface Props { onComplete: (stars: number, score: number) => void; }

const KITCHEN_OBSTACLE_LEGACY = [
  { center: [0.7, -0.7, 1.0] as [number, number, number], size: [0.6, 0.5, 1.5] as [number, number, number], padding: 0.3 },
  { center: [-1.0, -0.6, 0.5] as [number, number, number], size: [0.5, 0.5, 0.5] as [number, number, number], padding: 0.25 },
];

function Apple({ position, visible }: { position: [number, number, number]; visible: boolean }) {
  if (!visible) return null;
  return (
    <group position={position}>
      <mesh castShadow><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#E53935" roughness={0.4} /></mesh>
      <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.008, 0.012, 0.04, 6]} /><meshStandardMaterial color="#5D4037" /></mesh>
    </group>
  );
}

function Orange({ position, visible }: { position: [number, number, number]; visible: boolean }) {
  if (!visible) return null;
  return (
    <group position={position}>
      <mesh castShadow><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#FF9800" roughness={0.6} /></mesh>
    </group>
  );
}

function Banana({ position, visible }: { position: [number, number, number]; visible: boolean }) {
  if (!visible) return null;
  return (
    <group position={position} rotation={[0.1, 0, 0.3]}>
      <mesh castShadow><capsuleGeometry args={[0.03, 0.12, 8, 8]} /><meshStandardMaterial color="#FDD835" roughness={0.4} /></mesh>
    </group>
  );
}

const FRUITS = [
  { id: 0, pos: [0.5, 0.4, 0.5] as [number, number, number], color: '#E53935', type: 'apple', label: 'APEL MERAH!' },
  { id: 1, pos: [-0.3, 0.4, 0.8] as [number, number, number], color: '#FF9800', type: 'orange', label: 'JERUK ORANYE!' },
  { id: 2, pos: [0.8, 0.4, -0.2] as [number, number, number], color: '#E53935', type: 'apple', label: 'APEL MERAH!' },
  { id: 3, pos: [-0.6, 0.4, -0.5] as [number, number, number], color: '#FDD835', type: 'banana', label: 'PISANG KUNING!' },
  { id: 4, pos: [0.1, 0.4, 1.2] as [number, number, number], color: '#FF9800', type: 'orange', label: 'JERUK ORANYE!' },
];

function FruitObject({ type, position, visible }: { type: string; position: [number, number, number]; visible: boolean }) {
  if (type === 'apple') return <Apple position={position} visible={visible} />;
  if (type === 'orange') return <Orange position={position} visible={visible} />;
  return <Banana position={position} visible={visible} />;
}

/**
 * Kitchen scene — alive AR interaction.
 * Tap fruits → fruit flies to Vimo's hand → Vimo celebrates → camera punches.
 */
export function Scene4_Kitchen({ onComplete }: Props) {
  const { groundY, applyMeasure, pos, foot, obstacle } = useSceneGround();
  const fruits = useMemo(
    () => FRUITS.map((f) => ({ ...f, pos: pos(f.pos[0], f.pos[1], f.pos[2]) })),
    [pos, groundY],
  );
  const kitchenObstacles = useMemo(
    () => KITCHEN_OBSTACLE_LEGACY.map((o) => obstacle(o.center, o.size, o.padding)),
    [obstacle, groundY],
  );
  const [order] = useState(() => [...Array(5).keys()].sort(() => Math.random() - 0.5));
  const [round, setRound] = useState(0);
  const [collected, setCollected] = useState<number[]>([]);
  const [camShake, setCamShake] = useState(0);
  const [camPunch, setCamPunch] = useState(0);
  const [camPos] = useState<[number, number, number]>([0.7, 0.5, 2.0]);
  const [camLookAt] = useState<[number, number, number]>([0.5, -1.5, -1.5]);
  const [vimoAnim, setVimoAnim] = useState<'wave' | 'idle' | 'point' | 'walk' | 'celebrate' | 'grab' | 'jump' | 'shocked' | 'dance'>('wave');
  const [vimoPos, setVimoPos] = useState<[number, number, number]>(() => pos(1.2, 0.0, 1.5));
  const [lastTappedPos, setLastTappedPos] = useState<[number, number, number] | null>(null);
  const [pickupTrigger, setPickupTrigger] = useState<number | null>(null);
  const [pickupStart, setPickupStart] = useState<[number, number, number]>(() => foot(0, 0));
  const [pickupColor, setPickupColor] = useState('#FFD93D');
  const vimoPositionRef = useRef<[number, number, number]>(pos(1.2, 0.0, 1.5));
  const registerTap = useGameStore(s => s.registerTap);
  const setVimoAnimStr = useRef((a: string) => setVimoAnim(a as any)).current;
  const { walkTo, cleanup: cleanupWalk } = useAutoWalk(setVimoPos, setVimoAnimStr, vimoPositionRef);

  useEffect(() => { vimoPositionRef.current = vimoPos; }, [vimoPos]);
  useEffect(() => { return cleanupWalk; }, []);

  useEffect(() => {
    if (round >= FRUITS.length) return;
    setVimoAnim('point');
  }, [round]);

  const handleFruit = (id: number) => {
    if (collected.includes(id)) return;

    const fruit = fruits[id];
    setLastTappedPos(fruit.pos);

    // Walk to the fruit first, then grab
    walkTo(fruit.pos, () => {
      setPickupStart(fruit.pos);
      setPickupColor(fruit.color);
      setPickupTrigger(Date.now());
      setCamPunch(Date.now());

      setCollected(prev => [...prev, id]);
      registerTap(true);
      playSfx('success');
      speakNumber(collected.length + 1);

      setVimoAnim('grab');
      setTimeout(() => setVimoAnim('celebrate'), 600);
      setTimeout(() => setVimoAnim('idle'), 1400);

      if (collected.length + 1 >= FRUITS.length) {
        setTimeout(() => {
          setVimoAnim('dance');
          playSfx('cheer');
          speakVimo('Semua buah terkumpul!');
          setTimeout(() => onComplete(3, 350), 2000);
        }, 1200);
      }
    }, { offset: [0.3, 0, 0.4] });
  };

  const currentFruit = round < fruits.length ? fruits[order[round]] : null;

  // Vimo's "hand" — slightly above and in front of the body
  const vimoHandPos: [number, number, number] = [
    vimoPos[0],
    vimoPos[1] + 0.5,
    vimoPos[2],
  ];

  // What Vimo looks at: last tapped fruit, or current target if none tapped yet
  const vimoLookTarget: [number, number, number] = lastTappedPos
    ? lastTappedPos
    : (currentFruit ? currentFruit.pos : camPos);

  return (
    <>
      <CinematicCamera
        position={camPos}
        lookAt={camLookAt}
        smoothness={0.07}
        shake={camShake}
        punch={camPunch}
      />

      {/* Pro lighting: IBL + shadows + 3-point */}
      <SceneStage envPreset="apartment" keyIntensity={1.4} shadowOpacity={0.5} />

      <Suspense fallback={null}>
        <GroundedEnv
          modelPath="/models/cozy-kitchen.glb"
          scale={2}
          position={[0, LEGACY_FLOOR_Y, 0]}
          onMeasure={(info) => applyMeasure(info, { setVimoPos })}
        />
      </Suspense>

      <ARGroundDisc groundY={groundY} />

      {/* Drifting kitchen sparkles — atmosphere */}
      <AmbientParticles count={12} color="#FFE0B2" area={3} centerY={groundY + 1.2} />

      {/* Fruits */}
      {fruits.map(fruit => (
        <FruitObject key={fruit.id} type={fruit.type} position={fruit.pos} visible={!collected.includes(fruit.id)} />
      ))}

      {/* Tap indicators with juicy feedback */}
      {fruits.map(fruit => (
        <TapIndicator
          key={fruit.id}
          position={fruit.pos}
          color={fruit.id === order[round] ? fruit.color : '#888'}
          active={!collected.includes(fruit.id)}
          onClick={() => handleFruit(fruit.id)}
        />
      ))}

      {/* Pickup animation — fruit flies to Vimo's hand */}
      <PickupAnimation
        startPos={pickupStart}
        endPos={vimoHandPos}
        color={pickupColor}
        triggerId={pickupTrigger}
        duration={550}
      />

      {currentFruit && (
        <Html position={[currentFruit.pos[0], currentFruit.pos[1] + 0.8, currentFruit.pos[2]]} center>
          <div style={{
            background: '#FFFFFF',
            border: '3px solid #2D1B0E',
            borderRadius: '14px',
            padding: '7px 16px',
            whiteSpace: 'nowrap',
            boxShadow: '3px 4px 0 #2D1B0E',
          }}>
            <span style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '12px',
              color: '#2D1B0E',
              letterSpacing: '0.02em',
            }}>
              {currentFruit.label}
            </span>
          </div>
        </Html>
      )}

      <Vimo position={vimoPos} animation={vimoAnim} scale={0.8} lookAt={vimoLookTarget} obstacles={kitchenObstacles} bounds={[-2.5, 2.5, -2, 3]} />
    </>
  );
}

useGLTF.preload('/models/cozy-kitchen.glb');

