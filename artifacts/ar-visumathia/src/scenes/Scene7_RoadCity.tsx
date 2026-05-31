import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Vimo } from '@/components/Vimo';
import { TapIndicator } from '@/components/TapIndicator';
import { CinematicCamera } from '@/components/CinematicCamera';
import { AmbientParticles } from '@/components/AmbientParticles';
import { PickupAnimation } from '@/components/PickupAnimation';
import { playSfx, speakVimo } from '@/lib/audio';
import { useGameStore } from '@/lib/gameStore';
import { triggerWrongFlash } from '@/components/GameFeel';
import { SceneStage } from '@/components/SceneStage';
import { GroundedEnv } from '@/components/GroundedEnv';
import { ARGroundDisc } from '@/components/ARGroundDisc';
import { useSceneGround } from '@/hooks/useSceneGround';
import { LEGACY_FLOOR_Y } from '@/lib/sceneGround';
import { useAutoWalk } from '@/lib/useAutoWalk';

interface Props { onComplete: (stars: number, score: number) => void; }

const DIRECTIONS: ('left' | 'right')[] = ['left', 'right', 'left', 'right', 'left'];

function DirectionSign({ position, direction, isCorrect, isActive, onClick }: {
  position: [number, number, number];
  direction: 'left' | 'right';
  isCorrect: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    if (isCorrect && isActive) {
      ref.current.position.y = position[1] + Math.sin(t * 3) * 0.06;
    }
  });
  const color = isCorrect ? '#4CAF50' : '#FF9800';
  const flip = direction === 'left' ? -1 : 1;
  return (
    <group ref={ref} position={position} onClick={onClick}>
      {/* Sign post */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#795548" roughness={0.8} />
      </mesh>
      {/* Sign board */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.22, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isCorrect ? 0.2 : 0.05} roughness={0.4} />
      </mesh>
      {/* Arrow triangle pointing left or right */}
      <mesh position={[flip * 0.12, 0, 0.04]} rotation={[0, 0, direction === 'left' ? Math.PI / 2 : -Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.14, 4]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      {/* Arrow shaft */}
      <mesh position={[flip * -0.04, 0, 0.04]}>
        <boxGeometry args={[0.14, 0.04, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      {/* Invisible tap target */}
      <mesh onClick={onClick}>
        <boxGeometry args={[0.8, 0.6, 0.4]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

/**
 * DWTD Road — pick direction FAST! 5 seconds per choice, 5 rounds!
 */
export function Scene7_RoadCity({ onComplete }: Props) {
  const { groundY, applyMeasure, pos, foot } = useSceneGround();
  const signLeft = useMemo(() => pos(-1.5, -0.8, 4), [pos, groundY]);
  const signRight = useMemo(() => pos(1.5, -0.8, 4), [pos, groundY]);
  const [round, setRound] = useState(0);
  const [camShake, setCamShake] = useState(0);
  const [camPunch, setCamPunch] = useState(0);
  const [camPos] = useState<[number, number, number]>([3, 2, 8]);
  const [camLookAt] = useState<[number, number, number]>([1, -1, 1]);
  const [vimoAnim, setVimoAnim] = useState<'wave' | 'idle' | 'point' | 'walk' | 'think' | 'celebrate' | 'grab' | 'shocked' | 'dance'>('wave');
  const [vimoPos, setVimoPos] = useState<[number, number, number]>(() => pos(5.9, -2.4, -0.4));
  const [lastTappedPos, setLastTappedPos] = useState<[number, number, number] | null>(null);
  const [pickupTrigger, setPickupTrigger] = useState<number | null>(null);
  const [pickupStart, setPickupStart] = useState<[number, number, number]>(() => foot(0, 0));
  const [pickupColor, setPickupColor] = useState('#4CAF50');
  const registerTap = useGameStore(s => s.registerTap);
  const vimoPosRef = useRef<[number, number, number]>(pos(5.9, -2.4, -0.4));
  const setVimoAnimStr = useRef((a: string) => setVimoAnim(a as any)).current;
  const { walkTo, cleanup: cleanupWalk } = useAutoWalk(setVimoPos, setVimoAnimStr, vimoPosRef);

  useEffect(() => { vimoPosRef.current = vimoPos; }, [vimoPos]);
  useEffect(() => { return cleanupWalk; }, []);

  useEffect(() => {
    if (round >= DIRECTIONS.length) return;
    setVimoAnim('point');
  }, [round]);

  const handleFail = () => {
    playSfx('wrong');
    triggerWrongFlash();
    setCamShake(Date.now());
    setVimoAnim('think');
    speakVimo('Aduh! Bukan arah itu. Coba lagi!');
    setTimeout(() => { setVimoAnim('point'); }, 1500);
  };

  const handleChoice = (choice: 'left' | 'right') => {
    const correct = DIRECTIONS[round];
    if (choice === correct) {
      registerTap(true);
      playSfx('success');
      const xDir = choice === 'left' ? -1.5 : 1.5;
      const tapPos: [number, number, number] = pos(xDir, -1.0, 4);

      setLastTappedPos(tapPos);

      // Walk to the chosen direction sign, then celebrate
      walkTo(tapPos, () => {
        setPickupStart(tapPos);
        setPickupColor('#4CAF50');
        setPickupTrigger(Date.now());
        setCamPunch(Date.now());

        speakVimo(choice === 'left' ? 'Belok kiri! Benar!' : 'Belok kanan! Tepat!');
        setVimoAnim('grab');
        setTimeout(() => setVimoAnim('celebrate'), 400);

        if (round + 1 >= DIRECTIONS.length) {
          setTimeout(() => { setVimoAnim('dance'); playSfx('cheer'); setTimeout(() => onComplete(3, 300), 1500); }, 1200);
        } else {
          setTimeout(() => { setRound(round + 1); setVimoPos(foot(0, 3)); }, 1500);
        }
      }, { offset: [0, 0, 0.5], walkDuration: 600 });
    } else {
      registerTap(false);
      handleFail();
    }
  };

  const currentDir = round < DIRECTIONS.length ? DIRECTIONS[round] : 'left';
  const vimoLookTarget: [number, number, number] = lastTappedPos ?? camPos;

  return (
    <>
      <CinematicCamera position={camPos} lookAt={camLookAt} smoothness={0.07} punch={camPunch} shake={camShake} />
      <SceneStage envPreset="city" keyIntensity={1.5} shadowOpacity={0.4} />

      <Suspense fallback={null}>
        <GroundedEnv
          modelPath="/models/road.glb"
          scale={2}
          position={[0, LEGACY_FLOOR_Y, 0]}
          onMeasure={(info) => applyMeasure(info, { setVimoPos })}
        />
      </Suspense>

      <ARGroundDisc groundY={groundY} radius={1.3} />

      {/* Street dust */}
      <AmbientParticles count={12} color="#E0E0E0" area={4} centerY={groundY + 1.2} />

      {/* 3D direction signs */}
      <DirectionSign
        position={signLeft}
        direction="left"
        isCorrect={currentDir === 'left'}
        isActive={round < DIRECTIONS.length}
        onClick={() => handleChoice('left')}
      />
      <DirectionSign
        position={signRight}
        direction="right"
        isCorrect={currentDir === 'right'}
        isActive={round < DIRECTIONS.length}
        onClick={() => handleChoice('right')}
      />

      {/* Pickup animation */}
      <PickupAnimation
        startPos={pickupStart}
        endPos={[vimoPos[0], vimoPos[1] + 0.5, vimoPos[2]]}
        color={pickupColor}
        triggerId={pickupTrigger}
        duration={550}
      />

      <Vimo position={vimoPos} animation={vimoAnim} scale={0.8} lookAt={vimoLookTarget} bounds={[-3, 3, -2, 4]} />
    </>
  );
}

useGLTF.preload('/models/road.glb');









