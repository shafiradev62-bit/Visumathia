import { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
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
import { useSceneGround } from '@/hooks/useSceneGround';
import { LEGACY_FLOOR_Y } from '@/lib/sceneGround';
import { useAutoWalk } from '@/lib/useAutoWalk';

interface Props { onComplete: (stars: number, score: number) => void; }

/** Floating golden ball — natural, no neon */
function GoldenBall({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() + delay;
    ref.current.position.y = position[1] + Math.sin(t * 2.5) * 0.15;
    ref.current.rotation.y = t * 1.5;
  });
  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.02, 8, 24]} />
        <meshStandardMaterial color="#FFD700" transparent opacity={0.3} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

const QUIZ = [
  { count: 3, options: [2, 3, 5], answer: 3 },
  { count: 4, options: [3, 4, 6], answer: 4 },
  { count: 2, options: [1, 2, 4], answer: 2 },
];

const BALL_LAYOUTS: [number, number, number][][] = [
  [[-0.3, 0.5, 0.5], [0.0, 0.7, 0.5], [0.3, 0.5, 0.5]],
  [[-0.3, 0.5, 0.5], [0.0, 0.5, 0.5], [0.3, 0.5, 0.5], [0.0, 0.8, 0.5]],
  [[-0.2, 0.6, 0.5], [0.2, 0.6, 0.5]],
];

const OPTION_POS: [number, number, number][] = [
  [1.0, -0.5, 1.5], [1.8, -0.5, 1.5], [2.6, -0.5, 1.5],
];

/**
 * DWTD Video AR — count golden balls, pick answer, 6 seconds per round!
 */
export function Scene9_VideoAR({ onComplete }: Props) {
  const { groundY, applyMeasure, pos: toGround, foot } = useSceneGround();
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [camShake, setCamShake] = useState(0);
  const [camPunch, setCamPunch] = useState(0);
  const [camPos] = useState<[number, number, number]>([1.5, 0.5, 6.5]);
  const [camLookAt] = useState<[number, number, number]>([1.0, -0.5, 1.5]);
  const [vimoAnim, setVimoAnim] = useState<'wave' | 'idle' | 'point' | 'walk' | 'think' | 'celebrate' | 'grab' | 'shocked' | 'dance'>('wave');
  const [vimoPos, setVimoPos] = useState<[number, number, number]>(() => toGround(1.9, -2.0, 4.0));
  const [lastTappedPos, setLastTappedPos] = useState<[number, number, number] | null>(null);
  const [pickupTrigger, setPickupTrigger] = useState<number | null>(null);
  const [pickupStart, setPickupStart] = useState<[number, number, number]>(() => foot(0, 0));
  const [pickupColor, setPickupColor] = useState('#FFD700');
  const registerTap = useGameStore(s => s.registerTap);
  const vimoPosRef = useRef<[number, number, number]>(toGround(1.9, -2.0, 4.0));
  const setVimoAnimStr = useRef((a: string) => setVimoAnim(a as any)).current;
  const { walkTo, cleanup: cleanupWalk } = useAutoWalk(setVimoPos, setVimoAnimStr, vimoPosRef);

  useEffect(() => { vimoPosRef.current = vimoPos; }, [vimoPos]);
  useEffect(() => { return cleanupWalk; }, []);

  useEffect(() => {
    if (qIdx >= QUIZ.length) return;
    // 7, 6, 5 seconds
    setVimoAnim('point');
  }, [qIdx]);

  const handleFail = () => {
    playSfx('wrong');
    triggerWrongFlash();
    setCamShake(Date.now());
    setVimoAnim('think');
    speakVimo('Hmm, hitung lagi ya! Coba sekali lagi!');
    setTimeout(() => { setVimoAnim('point'); }, 1500);
  };

  const q = QUIZ[qIdx];
  const ballPositions = useMemo(
    () => BALL_LAYOUTS[qIdx].map((p) => toGround(p[0], p[1], p[2])),
    [qIdx, toGround, groundY],
  );
  const optionPositions = useMemo(
    () => OPTION_POS.map((p) => toGround(p[0], p[1], p[2])),
    [toGround, groundY],
  );

  const handleAnswer = (opt: number) => {
    if (opt === q.answer) {
      const next = answered + 1;
      setAnswered(next);
      registerTap(true);
      playSfx('success');
      speakNumber(q.answer);

      // Find which option index was tapped to get its position
      const optIdx = q.options.indexOf(opt);
      const optPos = optionPositions[optIdx] ?? optionPositions[0];
      setLastTappedPos(optPos);

      // Walk to the answer option first, then grab
      walkTo(optPos, () => {
        setPickupStart(optPos);
        setPickupColor('#FFD700');
        setPickupTrigger(Date.now());
        setCamPunch(Date.now());

        setVimoAnim('grab');
        setTimeout(() => setVimoAnim('dance'), 600);

        if (next >= 3) {
          setTimeout(() => { playSfx('cheer'); setTimeout(() => onComplete(3, 300), 1500); }, 1000);
        } else {
          setTimeout(() => setQIdx(qIdx + 1), 1500);
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

      <SceneStage envPreset="studio" keyIntensity={1.1} shadowOpacity={0.4} />

      <Suspense fallback={null}>
        <GroundedEnv
          modelPath="/models/tv.glb"
          scale={2}
          position={[0, LEGACY_FLOOR_Y, 0]}
          onMeasure={(info) => applyMeasure(info, { setVimoPos })}
        />
      </Suspense>

      <ARGroundDisc groundY={groundY} />

      {/* Magic gold particles */}
      <AmbientParticles count={12} color="#FFD700" area={3} centerY={groundY + 2} />

      {/* Golden balls */}
      {ballPositions.map((ballPos, i) => (
        <GoldenBall key={`ball-${qIdx}-${i}`} position={ballPos} delay={i * 0.5} />
      ))}

      {/* Answer options — number label + TapIndicator */}
      {q.options.map((opt, i) => (
        <group key={`opt-${qIdx}-${i}`}>
          {/* 3D number disc */}
          <mesh position={[optionPositions[i][0], optionPositions[i][1] + 0.4, optionPositions[i][2]]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.06, 8]} />
            <meshStandardMaterial
              color={opt === q.answer ? '#4CAF50' : '#FF9800'}
              emissive={opt === q.answer ? '#4CAF50' : '#FF9800'}
              emissiveIntensity={0.2}
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
          {/* Number label floating above disc */}
          <Html position={[optionPositions[i][0], optionPositions[i][1] + 0.7, optionPositions[i][2]]} center>
            <div style={{
              fontFamily: 'Fredoka, cursive',
              fontWeight: 700,
              fontSize: '22px',
              color: '#FFFFFF',
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              {opt}
            </div>
          </Html>
          <TapIndicator position={optionPositions[i]} color={opt === q.answer ? '#4CAF50' : '#FF9800'} active={true} onClick={() => handleAnswer(opt)} />
        </group>
      ))}

      {/* Pickup animation */}
      <PickupAnimation
        startPos={pickupStart}
        endPos={[vimoPos[0], vimoPos[1] + 0.5, vimoPos[2]]}
        color={pickupColor}
        triggerId={pickupTrigger}
        duration={650}
      />

      <Vimo position={vimoPos} animation={vimoAnim} scale={0.8} lookAt={vimoLookTarget} bounds={[-2.5, 2.5, -1.5, 3]} />
    </>
  );
}

useGLTF.preload('/models/tv.glb');








