import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Vimo } from '@/components/Vimo';
import { TapIndicator } from '@/components/TapIndicator';
import { CinematicCamera } from '@/components/CinematicCamera';
import { AmbientParticles } from '@/components/AmbientParticles';
import { PickupAnimation } from '@/components/PickupAnimation';
import { SceneStage } from '@/components/SceneStage';
import { GroundedEnv } from '@/components/GroundedEnv';
import { ARGroundDisc } from '@/components/ARGroundDisc';
import { playSfx, speakVimo } from '@/lib/audio';
import { useGameStore } from '@/lib/gameStore';
import { useAutoWalk } from '@/lib/useAutoWalk';
import { useSceneGround } from '@/hooks/useSceneGround';
import { LEGACY_FLOOR_Y } from '@/lib/sceneGround';

interface Props { onComplete: (stars: number, score: number) => void; }

const ZONES = [
  { id: 0, pos: [-1.5, -1.2, -1] as [number, number, number], color: '#F44336', label: 'ZONA KAMAR — Spasial!' },
  { id: 1, pos: [1.5, -1.2, -1] as [number, number, number], color: '#2196F3', label: 'ZONA TAMAN — Bentuk!' },
  { id: 2, pos: [0, -1.2, -2] as [number, number, number], color: '#4CAF50', label: 'ZONA DAPUR — Numerasi!' },
  { id: 3, pos: [-1, -1.2, -2.5] as [number, number, number], color: '#FFC107', label: 'ZONA JALAN — Arah!' },
  { id: 4, pos: [1, -1.2, -2.5] as [number, number, number], color: '#9C27B0', label: 'ZONA RAK — Pola!' },
];

/** Collected crystal — solid, no neon glow */
function CollectedCrystal({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={[position[0], position[1] + 0.3, position[2]]} castShadow>
      <octahedronGeometry args={[0.14, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.9} metalness={0.4} roughness={0.2} />
    </mesh>
  );
}
export function Scene10_FinalMission({ onComplete }: Props) {
  const { groundY, applyMeasure, pos, foot } = useSceneGround();
  const zones = useMemo(
    () => ZONES.map((z) => ({ ...z, pos: pos(z.pos[0], z.pos[1], z.pos[2]) })),
    [pos, groundY],
  );
  const [round, setRound] = useState(0);
  const [crystals, setCrystals] = useState<number[]>([]);
  const [camShake, setCamShake] = useState(0);
  const [camPunch, setCamPunch] = useState(0);
  const [camPos, setCamPos] = useState<[number, number, number]>([-1.0, 1.5, 3.5]);
  const [camLookAt] = useState<[number, number, number]>([-0.5, -0.5, -0.5]);
  const [vimoAnim, setVimoAnim] = useState<'wave' | 'idle' | 'point' | 'walk' | 'celebrate' | 'grab' | 'shocked' | 'dance'>('wave');
  const [vimoPos, setVimoPos] = useState<[number, number, number]>(() => pos(-1.8, -1.5, -0.1));
  const [lastTappedPos, setLastTappedPos] = useState<[number, number, number] | null>(null);
  const [pickupTrigger, setPickupTrigger] = useState<number | null>(null);
  const [pickupStart, setPickupStart] = useState<[number, number, number]>(() => foot(0, 0));
  const [pickupColor, setPickupColor] = useState('#FFD93D');
  const registerTap = useGameStore(s => s.registerTap);
  const vimoPosRef = useRef<[number, number, number]>(pos(-1.8, -1.5, -0.1));
  const setVimoAnimStr = useRef((a: string) => setVimoAnim(a as any)).current;
  const { walkTo, cleanup: cleanupWalk } = useAutoWalk(setVimoPos, setVimoAnimStr, vimoPosRef);

  useEffect(() => { vimoPosRef.current = vimoPos; }, [vimoPos]);
  useEffect(() => { return cleanupWalk; }, []);

  useEffect(() => {
    if (round >= ZONES.length) return;
    setVimoAnim('point');
  }, [round]);

  const handleZone = (id: number) => {
    if (crystals.includes(id)) return;

    const zone = zones[id];
    setLastTappedPos(zone.pos);

    // Walk to the zone first, then collect crystal
    walkTo(zone.pos, () => {
      setPickupStart(zone.pos);
      setPickupColor(zone.color);
      setPickupTrigger(Date.now());
      setCamPunch(Date.now());

      setCrystals(prev => [...prev, id]);
      registerTap(true);
      playSfx('success');
      speakVimo(`Kristal ${crystals.length + 1} terkumpul!`);
      setVimoAnim('grab');
      setTimeout(() => setVimoAnim('celebrate'), 500);
      setTimeout(() => setVimoAnim('idle'), 1300);

      if (crystals.length + 1 >= ZONES.length) {
        setTimeout(() => { setVimoAnim('dance'); playSfx('cheer'); speakVimo('Semua kristal terkumpul! Kamu Petualang Hebat VisuMathia!'); setTimeout(() => onComplete(3, 500), 2000); }, 1200);
      }
    }, { offset: [0.4, 0, 0.4] });
  };

  const currentZone = round < zones.length ? zones[round] : null;
  const vimoHandPos: [number, number, number] = [vimoPos[0], vimoPos[1] + 0.5, vimoPos[2]];
  const vimoLookTarget: [number, number, number] = lastTappedPos ?? (currentZone ? currentZone.pos : camPos);

  return (
    <>
      <CinematicCamera position={camPos} lookAt={camLookAt} smoothness={0.07} shake={camShake} punch={camPunch} />

      <SceneStage envPreset="dawn" keyIntensity={1.5} shadowOpacity={0.4} ambientColor="#E8D5FF" />

      <Suspense fallback={null}>
        <GroundedEnv
          modelPath="/models/cloister-garden.glb"
          scale={2}
          position={[0, LEGACY_FLOOR_Y, 0]}
          onMeasure={(info) => applyMeasure(info, { setVimoPos })}
        />
      </Suspense>

      <ARGroundDisc groundY={groundY} />

      {/* Magical sparkles in the air */}
      <AmbientParticles count={12} color="#E1BEE7" area={4} centerY={groundY + 2.2} />

      {zones.map(zone => (
        <TapIndicator key={zone.id} position={zone.pos} color={zone.id === round ? zone.color : '#555'} active={!crystals.includes(zone.id)} onClick={() => handleZone(zone.id)} />
      ))}

      {/* Pickup animation */}
      <PickupAnimation startPos={pickupStart} endPos={vimoHandPos} color={pickupColor} triggerId={pickupTrigger} duration={650} />

      {/* Collected crystals — spinning */}
      {crystals.map(id => (
        <CollectedCrystal key={`c-${id}`} position={zones[id].pos} color={zones[id].color} />
      ))}

      <Vimo position={vimoPos} animation={vimoAnim} scale={0.75} lookAt={vimoLookTarget} bounds={[-3, 3, -3, 3]} />
    </>
  );
}

useGLTF.preload('/models/cloister-garden.glb');









