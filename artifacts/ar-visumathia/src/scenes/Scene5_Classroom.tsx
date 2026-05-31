import { useState, useEffect, Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Vimo } from '@/components/Vimo';
import { TapIndicator } from '@/components/TapIndicator';
import { CinematicCamera } from '@/components/CinematicCamera';
import { AmbientParticles } from '@/components/AmbientParticles';
import { PickupAnimation } from '@/components/PickupAnimation';
import { GroundedEnv } from '@/components/GroundedEnv';
import { ARGroundDisc } from '@/components/ARGroundDisc';
import { playSfx, speakVimo } from '@/lib/audio';
import { useSceneGround } from '@/hooks/useSceneGround';
import { LEGACY_FLOOR_Y } from '@/lib/sceneGround';
import { useGameStore } from '@/lib/gameStore';
import { triggerWrongFlash } from '@/components/GameFeel';
import { SceneStage } from '@/components/SceneStage';
import { useAutoWalk } from '@/lib/useAutoWalk';

interface Props { onComplete: (stars: number, score: number) => void; }

const PATTERNS = [
  { sequence: ['#F44336', '#2196F3', '#F44336', '#2196F3'], answer: '#F44336', options: ['#F44336', '#2196F3', '#FFC107'] },
  { sequence: ['#F44336', '#2196F3', '#FFC107', '#F44336', '#2196F3', '#FFC107'], answer: '#F44336', options: ['#FFC107', '#F44336', '#2196F3'] },
  { sequence: ['#F44336', '#F44336', '#2196F3', '#2196F3', '#F44336', '#F44336'], answer: '#2196F3', options: ['#F44336', '#2196F3', '#FFC107'] },
];

function PulsingBall({ position, color, isPulse }: { position: [number, number, number]; color: string; isPulse: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    if (isPulse) {
      const s = 1 + Math.sin(t * 4) * 0.12;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref} position={position} castShadow>
      <sphereGeometry args={[0.18, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isPulse ? 0.4 : 0.2} roughness={0.4} />
    </mesh>
  );
}

/**
 * DWTD Classroom — pattern quiz, 6 seconds per round, speed up.
 */
export function Scene5_Classroom({ onComplete }: Props) {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [camShake, setCamShake] = useState(0);
  const [camPunch, setCamPunch] = useState(0);
  const { groundY, applyMeasure, above, foot, obstacle } = useSceneGround();
  const [camPos, setCamPos] = useState<[number, number, number]>([1.0, 0.5, 4.0]);
  const [camLookAt, setCamLookAt] = useState<[number, number, number]>([0.5, LEGACY_FLOOR_Y + 0.2, 0]);
  const [vimoAnim, setVimoAnim] = useState<'wave' | 'idle' | 'point' | 'think' | 'walk' | 'celebrate' | 'grab' | 'shocked' | 'dance'>('wave');
  const [vimoPos, setVimoPos] = useState<[number, number, number]>(() => foot(1.8, 0.7));
  const [lastTappedPos, setLastTappedPos] = useState<[number, number, number] | null>(null);
  const [pickupTrigger, setPickupTrigger] = useState<number | null>(null);
  const [pickupStart, setPickupStart] = useState<[number, number, number]>(() => foot(0, 0));
  const [pickupColor, setPickupColor] = useState('#FFD93D');
  const [teleported, setTeleported] = useState(false); // teleport to playground
  const registerTap = useGameStore(s => s.registerTap);
  const vimoPosRef = useRef<[number, number, number]>(foot(1.8, 0.7));
  const setVimoAnimStr = useRef((a: string) => setVimoAnim(a as any)).current;
  const { walkTo, cleanup: cleanupWalk } = useAutoWalk(setVimoPos, setVimoAnimStr, vimoPosRef);

  useEffect(() => { vimoPosRef.current = vimoPos; }, [vimoPos]);
  useEffect(() => { return cleanupWalk; }, []);

  const OPTION_POSITIONS: [number, number, number][] = [
    [-1.0, above(1.0), 2.0],
    [0, above(1.0), 2.0],
    [1.0, above(1.0), 2.0],
  ];

  // Per-round timer
  useEffect(() => {
    if (level >= PATTERNS.length) return;
    // 8, 6, 4 seconds!
    setVimoAnim('point');
  }, [level]);

  const handleFail = () => {
    playSfx('wrong');
    triggerWrongFlash();
    setCamShake(Date.now());
    setVimoAnim('think');
    speakVimo('Hmm, bukan itu polanya! Coba lagi!');
    setTimeout(() => { setVimoAnim('point'); }, 1500);
  };

  const currentPattern = PATTERNS[level];

  const handleOption = (color: string, idx: number) => {
    if (color === currentPattern.answer) {
      const next = score + 1;
      setScore(next);
      registerTap(true);
      playSfx('success');
      speakVimo('Benar! Polanya tepat!');

      const optPos = OPTION_POSITIONS[idx];
      setLastTappedPos(optPos);

      // Walk to the chosen option first, then grab
      walkTo(optPos, () => {
        setPickupStart(optPos);
        setPickupColor(color);
        setPickupTrigger(Date.now());
        setCamPunch(Date.now());

        setVimoAnim('grab');
        setTimeout(() => setVimoAnim('dance'), 600);

        // Teleport to playground after first correct answer!
        if (!teleported) {
          setTimeout(() => {
            playSfx('whoosh');
            setTeleported(true);
            setCamPos([0, 0.8, 4.5]);
            setCamLookAt([0, -0.8, 0]);
            setVimoPos([1.5, LEGACY_FLOOR_Y + 0.05, 1.5]);
          }, 1200);
        }

        if (next >= 3) {
          setTimeout(() => { playSfx('cheer'); setTimeout(() => onComplete(3, 280), 1500); }, 2500);
        } else {
          setTimeout(() => setLevel(level + 1), 2000);
        }
      }, { offset: [0.3, 0, 0.3] });
    } else {
      registerTap(false);
      handleFail();
    }
  };

  const vimoLookTarget: [number, number, number] = lastTappedPos ?? camPos;

  return (
    <>
      <CinematicCamera position={camPos} lookAt={camLookAt} smoothness={0.07} punch={camPunch} shake={camShake} />

      <SceneStage envPreset="lobby" keyIntensity={1.2} shadowOpacity={0.4} />

      <Suspense fallback={null}>
        <GroundedEnv
          modelPath={teleported ? "/models/play-structure.glb" : "/models/classroom.glb"}
          scale={teleported ? 1.5 : 2}
          position={[0, LEGACY_FLOOR_Y, 0]}
          onMeasure={(info) => applyMeasure(info, { setCamPos, setCamLookAt, setVimoPos })}
        />
      </Suspense>

      <ARGroundDisc groundY={groundY} />

      {/* Sand ground base — lower to match model bottom */}
      {teleported && (
        <mesh position={[0, LEGACY_FLOOR_Y - 1.0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#d4a86a" roughness={1} metalness={0} />
        </mesh>
      )}

      {/* Chalk dust particles */}
      <AmbientParticles count={12} color="#FFFFFF" area={3} centerY={above(1.6)} />

      {/* Pattern sequence — only show before teleport */}
      {!teleported && currentPattern.sequence.map((color, i) => (
        <PulsingBall key={`seq-${level}-${i}`} position={[-1.2 + i * 0.5, above(2.2), 0]} color={color} isPulse={false} />
      ))}
      {!teleported && <PulsingBall position={[-1.2 + currentPattern.sequence.length * 0.5, above(2.2), 0]} color="#FFFFFF" isPulse={true} />}

      {/* Answer options — only show before teleport */}
      {!teleported && currentPattern.options.map((color, i) => (
        <group key={`opt-${level}-${i}`}>
          <mesh position={[OPTION_POSITIONS[i][0], OPTION_POSITIONS[i][1] + 0.35, OPTION_POSITIONS[i][2]]} castShadow>
            <sphereGeometry args={[0.28, 24, 24]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.3} metalness={0.1} />
          </mesh>
          <TapIndicator position={OPTION_POSITIONS[i]} color={color} active={true} onClick={() => handleOption(color, i)} />
        </group>
      ))}

      {/* Pickup animation */}
      <PickupAnimation
        startPos={pickupStart}
        endPos={[vimoPos[0], vimoPos[1] + 0.5, vimoPos[2]]}
        color={pickupColor}
        triggerId={pickupTrigger}
        duration={600}
      />

      <Vimo
        position={vimoPos}
        animation={vimoAnim}
        scale={0.8}
        lookAt={vimoLookTarget}
        bounds={[-2.5, 2.5, -1.5, 3]}
        obstacles={teleported ? [] : [
          obstacle([0, LEGACY_FLOOR_Y, -1.2], [1.2, 0.8, 0.5], 0.2),
          obstacle([-1.2, LEGACY_FLOOR_Y, 1], [0.6, 0.6, 0.4], 0.15),
          obstacle([0, LEGACY_FLOOR_Y, 1], [0.6, 0.6, 0.4], 0.15),
          obstacle([1.2, LEGACY_FLOOR_Y, 1], [0.6, 0.6, 0.4], 0.15),
        ]}
      />
    </>
  );
}

useGLTF.preload('/models/classroom.glb');
useGLTF.preload('/models/play-structure.glb');








