import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Vimo } from '@/components/Vimo';
import { TapIndicator } from '@/components/TapIndicator';
import { CinematicCamera } from '@/components/CinematicCamera';
import { AmbientParticles } from '@/components/AmbientParticles';
import { PickupAnimation } from '@/components/PickupAnimation';
import { SceneStage } from '@/components/SceneStage';
import { GroundedEnv } from '@/components/GroundedEnv';
import { ARGroundDisc } from '@/components/ARGroundDisc';
import { speakVimo, playSfx } from '@/lib/audio';
import { useGameStore } from '@/lib/gameStore';
import { triggerWrongFlash } from '@/components/GameFeel';
import { useAutoWalk } from '@/lib/useAutoWalk';
import { useSceneGround } from '@/hooks/useSceneGround';
import { LEGACY_FLOOR_Y } from '@/lib/sceneGround';

interface Props { onComplete: (stars: number, score: number) => void; }

/** Red ball */
function Ball({ position, visible, interactable }: { position: [number, number, number]; visible: boolean; interactable: boolean }) {
  if (!visible) return null;
  return (
    <group position={position}>
      {interactable && <Sparkles count={15} scale={0.5} size={2} speed={0.5} color="#FF6B6B" />}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
        <mesh castShadow><sphereGeometry args={[0.12, 24, 24]} /><meshStandardMaterial color="#FF6B6B" roughness={0.4} /></mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}><torusGeometry args={[0.12, 0.012, 8, 32]} /><meshStandardMaterial color="#FFFFFF" /></mesh>
      </Float>
    </group>
  );
}

/** Teddy bear */
function TeddyBear({ position, visible, interactable }: { position: [number, number, number]; visible: boolean; interactable: boolean }) {
  if (!visible) return null;
  return (
    <group position={position}>
      {interactable && <Sparkles count={15} scale={0.5} size={2} speed={0.5} color="#D4A574" />}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <mesh castShadow><sphereGeometry args={[0.13, 16, 16]} /><meshStandardMaterial color="#D4A574" roughness={0.8} /></mesh>
        <mesh position={[0, 0.16, 0]} castShadow><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#D4A574" roughness={0.8} /></mesh>
        <mesh position={[-0.07, 0.24, 0]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#C49A6C" /></mesh>
        <mesh position={[0.07, 0.24, 0]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial color="#C49A6C" /></mesh>
        <mesh position={[-0.03, 0.18, 0.09]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#1A1A1A" /></mesh>
        <mesh position={[0.03, 0.18, 0.09]}><sphereGeometry args={[0.018, 8, 8]} /><meshStandardMaterial color="#1A1A1A" /></mesh>
      </Float>
    </group>
  );
}

/** Book */
function Book({ position, visible, interactable }: { position: [number, number, number]; visible: boolean; interactable: boolean }) {
  if (!visible) return null;
  return (
    <group position={position} rotation={[0, 0.2, 0]}>
      {interactable && <Sparkles count={15} scale={0.5} size={2} speed={0.5} color="#5BC5F2" />}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.2}>
        <mesh castShadow><boxGeometry args={[0.18, 0.22, 0.035]} /><meshStandardMaterial color="#5BC5F2" roughness={0.5} /></mesh>
        <mesh position={[0, 0.004, 0]}><boxGeometry args={[0.16, 0.2, 0.025]} /><meshStandardMaterial color="#FFFEF0" /></mesh>
      </Float>
    </group>
  );
}

// Positions — adjusted so objects are visible above ground
const TASKS = [
  { id: 0, pos: [1.0, 0.2, 0.8] as [number, number, number], color: '#FF6B6B', label: 'LETAKKAN BOLA DI BAWAH MEJA!', obj: 'ball' },
  { id: 1, pos: [-1.0, 0.6, -0.5] as [number, number, number], color: '#D4A574', label: 'CARI BONEKA DI ATAS TEMPAT TIDUR!', obj: 'teddy' },
  { id: 2, pos: [-0.5, 0.3, 1.2] as [number, number, number], color: '#5BC5F2', label: 'GESER BUKU KE DALAM LEMARI!', obj: 'book' },
];

/**
 * DUMB WAYS TO DIE style bedroom scene:
 * - Each task is a MICROGAME with 8-second timer
 * - Big instruction text at top ("TAP THE BALL!")
 * - Speed increases each round
 * - Wrong = Vimo shocked + camera shake
 * - Right = instant ding + Vimo grabs + next round
 */
export function Scene2_Bedroom({ onComplete }: Props) {
  const { groundY, applyMeasure, pos, foot, obstacle } = useSceneGround();
  const tasks = useMemo(
    () => TASKS.map((t) => ({ ...t, pos: pos(t.pos[0], t.pos[1], t.pos[2]) })),
    [pos, groundY],
  );
  const [round, setRound] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showInstruction, setShowInstruction] = useState(true);
  const [camShake, setCamShake] = useState(0);
  const [camPunch, setCamPunch] = useState(0);
  const [camPos, setCamPos] = useState<[number, number, number]>([1.0, 0.5, 4.0]);
  const [camLookAt, setCamLookAt] = useState<[number, number, number]>([0.5, -0.8, 0]);
  const [vimoAnim, setVimoAnim] = useState<'wave' | 'idle' | 'point' | 'walk' | 'celebrate' | 'grab' | 'shocked' | 'dance' | 'jump'>('wave');
  const [vimoPos, setVimoPos] = useState<[number, number, number]>(() => foot(1.2, 1.5));
  const [lastTappedPos, setLastTappedPos] = useState<[number, number, number] | null>(null);
  const [pickupTrigger, setPickupTrigger] = useState<number | null>(null);
  const [pickupStart, setPickupStart] = useState<[number, number, number]>(() => foot(0, 0));
  const [pickupColor, setPickupColor] = useState('#FFD93D');
  const vimoPositionRef = useRef<[number, number, number]>(foot(1.2, 1.5));
  const moveTimeouts = useRef<NodeJS.Timeout[]>([]);
  const registerTap = useGameStore(s => s.registerTap);
  const setVimoAnimStr = useRef((a: string) => setVimoAnim(a as any)).current;
  const { walkTo, cleanup: cleanupWalk } = useAutoWalk(setVimoPos, setVimoAnimStr, vimoPositionRef);

  useEffect(() => { return () => { moveTimeouts.current.forEach(clearTimeout); cleanupWalk(); }; }, []);
  useEffect(() => { vimoPositionRef.current = vimoPos; }, [vimoPos]);

  // Camera stays steady — no rotation per round (prevents vertigo)
  useEffect(() => {
    if (round >= TASKS.length) return;
    setShowInstruction(true);
  }, [round]);

  // Demo during cinematic — Vimo walks smoothly to highlight each task
  useEffect(() => {
    const t1 = setTimeout(() => {
      setVimoAnim('walk');
      setVimoPos([tasks[0].pos[0], tasks[0].pos[1], tasks[0].pos[2] + 0.5]);
      setTimeout(() => setVimoAnim('point'), 1500);
    }, 3000);
    const t2 = setTimeout(() => {
      setVimoAnim('walk');
      setVimoPos([tasks[1].pos[0], tasks[1].pos[1], tasks[1].pos[2] + 0.5]);
      setTimeout(() => setVimoAnim('point'), 1500);
    }, 7000);
    const t3 = setTimeout(() => {
      setVimoAnim('walk');
      setVimoPos(foot(1.2, 1.5));
      setTimeout(() => setVimoAnim('idle'), 1500);
    }, 11000);
    return () => { [t1, t2, t3].forEach(clearTimeout); };
  }, []);

  const handleFail = () => {
    playSfx('wrong');
    triggerWrongFlash();
    setCamShake(Date.now());
    setVimoAnim('shocked');
    speakVimo('Aduh!');
    // Reset round timer — give another chance
    setTimeout(() => {
      setVimoAnim('point');
    }, 1500);
  };

  const handleTap = (taskId: number) => {
    if (completed.includes(taskId)) return;

    const task = tasks[taskId];
    setLastTappedPos(task.pos);
    setShowInstruction(false);

    // Walk to the task object first, then interact
    walkTo(task.pos, () => {
      // Real interaction feel
      setPickupStart(task.pos);
      setPickupColor(task.color);
      setPickupTrigger(Date.now());
      setCamPunch(Date.now());

      // Any order is fine!
      const next = [...completed, taskId];
      setCompleted(next);
      registerTap(true);
      playSfx('success');

      speakVimo(taskId === 0 ? 'Bola sudah di tempatnya!' : taskId === 1 ? 'Boneka ketemu!' : 'Buku sudah rapi!');

      setVimoAnim('grab');
      setTimeout(() => setVimoAnim('celebrate'), 600);

      if (next.length >= TASKS.length) {
        setTimeout(() => {
          setVimoAnim('dance');
          playSfx('cheer');
          setTimeout(() => onComplete(3, 300), 2000);
        }, 1500);
      } else {
        setTimeout(() => {
          setRound(taskId + 1);
          setVimoPos(foot(1.2, 1.5));
          setTimeout(() => setVimoAnim('point'), 800);
        }, 2200);
      }
    }, { offset: [0.4, 0, 0.5] });
  };

  const currentTask = tasks[round];
  const vimoLookTarget: [number, number, number] = lastTappedPos ?? (currentTask ? currentTask.pos : camPos);

  return (
    <>
      <CinematicCamera position={camPos} lookAt={camLookAt} smoothness={0.07} shake={camShake} punch={camPunch} />

      <SceneStage keyIntensity={1.2} ambientColor="#FFF8F0" />
      <pointLight position={[0, 2, 0]} color="#FFE0B2" intensity={0.8} distance={5} />

      <Suspense fallback={null}>
        <GroundedEnv
          modelPath="/models/bedroom.glb"
          scale={2}
          position={[0, LEGACY_FLOOR_Y, 0]}
          onMeasure={(info) => applyMeasure(info, { setCamPos, setCamLookAt, setVimoPos })}
        />
      </Suspense>

      <ARGroundDisc groundY={groundY} />

      {/* Cozy room dust particles */}
      <AmbientParticles count={12} color="#FFE0B2" area={3} centerY={groundY + 1.2} />

      {/* Objects — only show uncollected ones */}
      <Ball position={tasks[0].pos} visible={!completed.includes(0)} interactable={round === 0} />
      <TeddyBear position={tasks[1].pos} visible={!completed.includes(1)} interactable={round === 1} />
      <Book position={tasks[2].pos} visible={!completed.includes(2)} interactable={round === 2} />

      {/* Tap indicators */}
      {tasks.map((task) => (
        <TapIndicator
          key={task.id}
          position={task.pos}
          color={task.id === round ? task.color : '#888888'}
          active={!completed.includes(task.id)}
          onClick={() => handleTap(task.id)}
        />
      ))}

      {/* Pickup animation */}
      <PickupAnimation
        startPos={pickupStart}
        endPos={[vimoPos[0], vimoPos[1] + 0.5, vimoPos[2]]}
        color={pickupColor}
        triggerId={pickupTrigger}
        duration={550}
      />

      {/* Instruction label — white cloud bubble, storybook style */}
      {showInstruction && round < TASKS.length && (
        <Html position={[currentTask.pos[0], currentTask.pos[1] + 1.2, currentTask.pos[2]]} center>
          <div style={{
            background: '#FFFFFF',
            border: '3px solid #2D1B0E',
            borderRadius: '14px',
            padding: '7px 16px',
            whiteSpace: 'nowrap',
            boxShadow: '3px 4px 0 #2D1B0E',
            animation: 'pulse 0.5s ease-in-out infinite alternate',
          }}>
            <span style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: '13px',
              color: '#2D1B0E',
              letterSpacing: '0.02em',
            }}>
              {currentTask.label}
            </span>
          </div>
        </Html>
      )}

      <Vimo
        position={vimoPos}
        animation={vimoAnim}
        scale={0.8}
        lookAt={vimoLookTarget}
        bounds={[-2, 2.5, -1.5, 2.5]}
        obstacles={[
          obstacle([1.5, LEGACY_FLOOR_Y, -0.5], [1.2, 1, 0.8], 0.2),
          obstacle([-1.5, LEGACY_FLOOR_Y, -0.5], [0.6, 1, 0.5], 0.2),
          obstacle([0.5, LEGACY_FLOOR_Y, -1], [0.3, 0.5, 0.3], 0.15),
        ]}
      />
    </>
  );
}

