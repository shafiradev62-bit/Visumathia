import { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Vimo } from '@/components/Vimo';
import { TapIndicator } from '@/components/TapIndicator';
import { CinematicCamera } from '@/components/CinematicCamera';
import { AmbientParticles } from '@/components/AmbientParticles';
import { PickupAnimation } from '@/components/PickupAnimation';
import { GroundedEnv } from '@/components/GroundedEnv';
import { ARGroundDisc } from '@/components/ARGroundDisc';
import { playSfx, speakVimo } from '@/lib/audio';
import { useGameStore } from '@/lib/gameStore';
import { SceneStage } from '@/components/SceneStage';
import { useAutoWalk } from '@/lib/useAutoWalk';
import { useSceneGround } from '@/hooks/useSceneGround';
import { LEGACY_FLOOR_Y } from '@/lib/sceneGround';

interface Props {
  onComplete: (stars: number, score: number) => void;
}

const PORTAL_LEGACY: [number, number, number][] = [
  [-1.5, 0.5, -1],
  [1.5, 0.5, -1],
  [0, 0.8, -2.5],
];

/** Portal - glows bright when it's the one to tap */
function Portal({ position, color, onClick, activated, interactable }: {
  position: [number, number, number]; color: string; onClick: () => void; activated: boolean; interactable: boolean;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Sparkle effects when active */}
      {interactable && !activated && (
        <Sparkles count={20} scale={1.2} size={2} speed={0.4} color={color} />
      )}

      {/* Invisible tap hitbox — required for R3F click events */}
      {interactable && !activated && (
        <mesh onClick={onClick}>
          <sphereGeometry args={[0.7, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Portal ring */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={ringRef} castShadow>
          <torusGeometry args={[0.5, 0.07, 24, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={activated ? 1.5 : interactable ? 1.0 : 0.2}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </Float>

      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={activated ? 1.5 : interactable ? 0.8 : 0.1}
          transparent
          opacity={activated ? 0.6 : interactable ? 0.4 : 0.1}
        />
      </mesh>

      {/* Ground glow ring */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.55, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={interactable && !activated ? 0.8 : 0.3}
          transparent
          opacity={interactable && !activated ? 0.4 : 0.15}
          side={2}
        />
      </mesh>

      {/* Light */}
      <pointLight
        color={color}
        intensity={interactable && !activated ? 2 : activated ? 1.5 : 0.3}
        distance={3}
        decay={2}
      />

      {/* Check when done */}
      {activated && (
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#4CAF50" emissive="#4CAF50" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
}

export function Scene1_IntroPortal({ onComplete }: Props) {
  const { groundY, applyMeasure, pos, foot, obstacle } = useSceneGround();
  const [portalsActivated, setPortalsActivated] = useState(0);
  const [camPos, setCamPos] = useState<[number, number, number]>([0.3, 0.5, 5.5]);
  const [camLookAt, setCamLookAt] = useState<[number, number, number]>([0.3, LEGACY_FLOOR_Y + 0.7, 0]);
  const [camPunch, setCamPunch] = useState(0);
  const [vimoAnim, setVimoAnim] = useState<'idle' | 'wave' | 'celebrate' | 'point' | 'walk' | 'grab'>('wave');
  const [vimoPos, setVimoPos] = useState<[number, number, number]>(() => foot(0.3, 2.6));
  const [lastTappedPos, setLastTappedPos] = useState<[number, number, number] | null>(null);
  const [pickupTrigger, setPickupTrigger] = useState<number | null>(null);
  const [pickupStart, setPickupStart] = useState<[number, number, number]>(() => foot(0, 0));
  const [pickupColor, setPickupColor] = useState('#FFD93D');
  const registerTap = useGameStore(s => s.registerTap);
  const combo = useGameStore(s => s.combo);
  const vimoPosRef = useRef<[number, number, number]>(foot(0.3, 2.6));
  const setVimoAnimStr = useRef((a: string) => setVimoAnim(a as any)).current;
  const { walkTo, cleanup: cleanupWalk } = useAutoWalk(setVimoPos, setVimoAnimStr, vimoPosRef);

  useEffect(() => { vimoPosRef.current = vimoPos; }, [vimoPos]);
  useEffect(() => { return cleanupWalk; }, []);

  useEffect(() => {
    setVimoAnim('idle');
  }, []);

  const handlePortalClick = () => {
    const next = portalsActivated + 1;
    setPortalsActivated(next);
    playSfx('tap');
    registerTap(true);
    setCamPunch(Date.now());

    const portalColors = ['#E53E3E', '#38B2AC', '#D69E2E'];
    const idx = portalsActivated;
    const legacy = PORTAL_LEGACY[idx];
    const portalPos = pos(legacy[0], legacy[1], legacy[2]);

    setPickupStart(portalPos);
    setPickupColor(portalColors[idx]);
    setPickupTrigger(Date.now());
    setLastTappedPos(portalPos);

    if (combo >= 2) playSfx('combo');

    // Walk to the portal, then grab + celebrate
    const walkTarget: [number, number, number] = foot(portalPos[0], portalPos[2]);

    if (next === 1) {
      speakVimo('Satu! Portal pertama terbuka!');
      setCamPos([-0.5, 0.6, 1]);
      setCamLookAt([-1, 0.2, -0.5]);
    } else if (next === 2) {
      speakVimo('Dua! Satu lagi!');
      setCamPos([0.5, 0.6, 1]);
      setCamLookAt([1, 0.2, -0.5]);
    } else {
      speakVimo('Tiga! Semua portal terbuka! Ayo bertualang!');
      setCamPos([0, 0.6, 0]);
      setCamLookAt([0, 0.4, -2]);
    }

    walkTo(walkTarget, () => {
      setVimoAnim('grab');
      setTimeout(() => {
        setVimoAnim('celebrate');
        if (next >= 3) {
          setTimeout(() => onComplete(3, 300), 1500);
        }
      }, 600);
    }, { offset: [0.4, 0, 0.5], walkDuration: 700 });
  };

  return (
    <>
      <CinematicCamera position={camPos} lookAt={camLookAt} smoothness={0.06} punch={camPunch} />

      {/* Lighting */}
      <SceneStage envPreset="park" keyIntensity={1.6} shadowOpacity={0.35} />

      {/* Cloister Garden as the full environment */}
      <Suspense fallback={null}>
        <GroundedEnv
          modelPath="/models/cloister-garden.glb"
          scale={2}
          position={[0, LEGACY_FLOOR_Y, 0]}
          onMeasure={(info) => applyMeasure(info, { setCamPos, setCamLookAt, setVimoPos })}
        />
      </Suspense>

      <ARGroundDisc groundY={groundY} />

      {/* Magical floating sparkles */}
      <AmbientParticles count={12} color="#FFD700" area={4} centerY={groundY + 2.2} />

      {/* Portals - placed inside the garden */}
      <Portal
        position={pos(-1.5, 0.5, -1)}
        color="#E53E3E"
        onClick={handlePortalClick}
        activated={portalsActivated >= 1}
        interactable={portalsActivated < 3}
      />
      <Portal
        position={pos(1.5, 0.5, -1)}
        color="#38B2AC"
        onClick={handlePortalClick}
        activated={portalsActivated >= 2}
        interactable={portalsActivated < 3}
      />
      <Portal
        position={pos(0, 0.8, -2.5)}
        color="#D69E2E"
        onClick={handlePortalClick}
        activated={portalsActivated >= 3}
        interactable={portalsActivated < 3}
      />

      {/* Pickup animation — portal energy flies to Vimo */}
      <PickupAnimation
        startPos={pickupStart}
        endPos={[vimoPos[0], vimoPos[1] + 0.5, vimoPos[2]]}
        color={pickupColor}
        triggerId={pickupTrigger}
        duration={650}
      />

      {/* Vimo - inside the garden, constrained to walkable area */}
      <Vimo
        position={vimoPos}
        animation={vimoAnim}
        scale={0.8}
        lookAt={lastTappedPos ?? camPos}
        bounds={[-2.5, 2.5, -3, 3]}
        obstacles={[
          obstacle([-2.8, LEGACY_FLOOR_Y, 0], [0.3, 2, 4], 0.2),
          obstacle([2.8, LEGACY_FLOOR_Y, 0], [0.3, 2, 4], 0.2),
          obstacle([0, LEGACY_FLOOR_Y, -3.2], [3, 2, 0.3], 0.2),
          obstacle([0, LEGACY_FLOOR_Y, 3.2], [3, 2, 0.3], 0.2),
          obstacle([0, LEGACY_FLOOR_Y, 0], [0.6, 1, 0.6], 0.3),
        ]}
      />

    </>
  );
}

