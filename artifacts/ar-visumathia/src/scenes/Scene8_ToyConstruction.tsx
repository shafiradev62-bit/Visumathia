import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { Vimo } from '@/components/Vimo';
import { TapIndicator } from '@/components/TapIndicator';
import { CinematicCamera } from '@/components/CinematicCamera';
import { AmbientParticles } from '@/components/AmbientParticles';
import { PickupAnimation } from '@/components/PickupAnimation';
import { SceneStage } from '@/components/SceneStage';
import { GroundedEnv } from '@/components/GroundedEnv';
import { ARGroundDisc } from '@/components/ARGroundDisc';
import { playSfx, speakNumber } from '@/lib/audio';
import { useGameStore } from '@/lib/gameStore';
import { useAutoWalk } from '@/lib/useAutoWalk';
import { useSceneGround } from '@/hooks/useSceneGround';
import { LEGACY_FLOOR_Y } from '@/lib/sceneGround';

interface Props { onComplete: (stars: number, score: number) => void; }

function ApartmentBuilding({ position, scale = 0.3 }: { position: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF('/models/apartment-building.glb');
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={scale} position={position} />;
}
function Bulldozer({ position, scale = 0.3 }: { position: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF('/models/bulldozer.glb');
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={scale} position={position} />;
}
function CraneModel({ position, scale = 0.3 }: { position: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF('/models/crane.glb');
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={scale} position={position} />;
}
function ConstructionSign({ position, scale = 0.4 }: { position: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF('/models/construction-sign.glb');
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={scale} position={position} />;
}
function WorkerModel({ position, scale = 0.4 }: { position: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF('/models/worker.glb');
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={scale} position={position} />;
}

const TARGETS = [
  { id: 0, pos: [-6, -0.5, -6] as [number, number, number], color: '#F44336', label: 'SUSUN BALOK KIRI!' },
  { id: 1, pos: [6, -0.5, -6] as [number, number, number], color: '#2196F3', label: 'SUSUN BALOK KANAN!' },
  { id: 2, pos: [3, -0.5, -2] as [number, number, number], color: '#FFC107', label: 'SENTUH BULLDOZER!' },
  { id: 3, pos: [-3, -0.5, -4] as [number, number, number], color: '#4CAF50', label: 'SENTUH CRANE!' },
  { id: 4, pos: [1.5, -0.5, -3] as [number, number, number], color: '#9C27B0', label: 'SENTUH PEKERJA!' },
];

/**
 * DWTD Construction — tap targets in sequence, 7 seconds each, faster!
 */
export function Scene8_ToyConstruction({ onComplete }: Props) {
  const { groundY, applyMeasure, pos, foot } = useSceneGround();
  const targets = useMemo(
    () => TARGETS.map((t) => ({ ...t, pos: pos(t.pos[0], t.pos[1], t.pos[2]) })),
    [pos, groundY],
  );
  const [round, setRound] = useState(0);
  const [touched, setTouched] = useState<number[]>([]);
  const [camShake, setCamShake] = useState(0);
  const [camPunch, setCamPunch] = useState(0);
  const [camPos, setCamPos] = useState<[number, number, number]>([0, 2.5, 8]);
  const [camLookAt] = useState<[number, number, number]>([0, -0.5, 1]);
  const [vimoAnim, setVimoAnim] = useState<'wave' | 'idle' | 'point' | 'walk' | 'celebrate' | 'grab' | 'shocked' | 'dance'>('wave');
  const [vimoPos, setVimoPos] = useState<[number, number, number]>(() => foot(0, 4.5));
  const [lastTappedPos, setLastTappedPos] = useState<[number, number, number] | null>(null);
  const [pickupTrigger, setPickupTrigger] = useState<number | null>(null);
  const [pickupStart, setPickupStart] = useState<[number, number, number]>(() => foot(0, 0));
  const [pickupColor, setPickupColor] = useState('#FFD93D');
  const registerTap = useGameStore(s => s.registerTap);
  const vimoPosRef = useRef<[number, number, number]>(foot(0, 4.5));
  const setVimoAnimStr = useRef((a: string) => setVimoAnim(a as any)).current;
  const { walkTo, cleanup: cleanupWalk } = useAutoWalk(setVimoPos, setVimoAnimStr, vimoPosRef);

  useEffect(() => { vimoPosRef.current = vimoPos; }, [vimoPos]);
  useEffect(() => { return cleanupWalk; }, []);

  useEffect(() => {
    if (round >= TARGETS.length) return;
    setVimoAnim('point');
  }, [round]);

  const handleTouch = (id: number) => {
    if (touched.includes(id)) return;

    const target = targets[id];
    setLastTappedPos(target.pos);

    // Walk to the target first, then interact
    walkTo(target.pos, () => {
      setPickupStart(target.pos);
      setPickupColor(target.color);
      setPickupTrigger(Date.now());
      setCamPunch(Date.now());

      setTouched(prev => [...prev, id]);
      registerTap(true);
      playSfx('success');
      speakNumber(touched.length + 1);
      setVimoAnim('grab');
      setTimeout(() => setVimoAnim('celebrate'), 500);
      setTimeout(() => setVimoAnim('idle'), 1300);

      if (touched.length + 1 >= TARGETS.length) {
        setTimeout(() => { setVimoAnim('dance'); playSfx('cheer'); setTimeout(() => onComplete(3, 340), 1500); }, 1000);
      }
    }, { offset: [0.5, 0, 0.5] });
  };

  const currentTarget = round < targets.length ? targets[round] : null;
  const vimoLookTarget: [number, number, number] = lastTappedPos ?? (currentTarget ? currentTarget.pos : camPos);

  return (
    <>
      <CinematicCamera position={camPos} lookAt={camLookAt} smoothness={0.07} punch={camPunch} />

      <SceneStage keyIntensity={1.5} ambientColor="#FFF8F0" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY, 0]}>
        <planeGeometry args={[30, 30]} /><meshStandardMaterial color="#8D6E63" roughness={0.9} />
      </mesh>

      <Suspense fallback={null}>
        <GroundedEnv
          modelPath="/models/bulldozer.glb"
          scale={0.3}
          position={[0, LEGACY_FLOOR_Y, 0]}
          visible={false}
          onMeasure={(info) => applyMeasure(info, { setCamPos, setVimoPos })}
        />
        <ApartmentBuilding position={pos(-6, LEGACY_FLOOR_Y, -6)} />
        <ApartmentBuilding position={pos(6, LEGACY_FLOOR_Y, -6)} />
        <Bulldozer position={pos(3, LEGACY_FLOOR_Y, -2)} />
        <CraneModel position={pos(-3, LEGACY_FLOOR_Y, -4)} />
        <ConstructionSign position={pos(-1.5, LEGACY_FLOOR_Y, 0)} />
        <WorkerModel position={pos(1.5, LEGACY_FLOOR_Y, -3)} />
      </Suspense>

      <ARGroundDisc groundY={groundY} radius={1.5} />

      {/* Construction dust */}
      <AmbientParticles count={12} color="#D7CCC8" area={5} centerY={groundY + 1.7} />

      {targets.map(t => (
        <TapIndicator key={t.id} position={t.pos} color={t.id === round ? t.color : '#666'} active={!touched.includes(t.id)} onClick={() => handleTouch(t.id)} />
      ))}

      {/* Pickup animation */}
      <PickupAnimation
        startPos={pickupStart}
        endPos={[vimoPos[0], vimoPos[1] + 0.5, vimoPos[2]]}
        color={pickupColor}
        triggerId={pickupTrigger}
        duration={750}
      />

      <Vimo position={vimoPos} animation={vimoAnim} scale={0.8} lookAt={vimoLookTarget} bounds={[-3, 3, -2, 3]} />
    </>
  );
}

useGLTF.preload('/models/apartment-building.glb');
useGLTF.preload('/models/bulldozer.glb');
useGLTF.preload('/models/crane.glb');
useGLTF.preload('/models/construction-sign.glb');
useGLTF.preload('/models/worker.glb');









