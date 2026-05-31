import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Vimo } from '@/components/Vimo';
import { TapIndicator } from '@/components/TapIndicator';
import { CinematicCamera } from '@/components/CinematicCamera';
import { AmbientParticles } from '@/components/AmbientParticles';
import { PickupAnimation } from '@/components/PickupAnimation';
import { GroundedEnv } from '@/components/GroundedEnv';
import { ARGroundDisc } from '@/components/ARGroundDisc';
import { SceneStage } from '@/components/SceneStage';
import { playSfx, speakNumber } from '@/lib/audio';
import { useGameStore } from '@/lib/gameStore';
import { useAutoWalk } from '@/lib/useAutoWalk';
import { useSceneGround } from '@/hooks/useSceneGround';
import { LEGACY_FLOOR_Y } from '@/lib/sceneGround';

import { TexturedBall, BallType } from '@/components/BallTextures';

interface Props { onComplete: (stars: number, score: number) => void; }

function PlayStructure({ groundY }: { groundY: number }) {
  const { scene } = useGLTF('/models/play-structure.glb');
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={2.5} position={[0, groundY, -1]} />;
}

function FenceModel({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const { scene } = useGLTF('/models/fence.glb');
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={1.5} position={position} rotation={[0, rotation, 0]} />;
}

/** GameBall now uses realistic textures — basketball, volleyball, soccer, tennis */
function GameBall({ position, radius, visible, ballType }: { position: [number, number, number]; color: string; radius: number; visible: boolean; ballType: BallType }) {
  return <TexturedBall position={position} radius={radius} type={ballType} visible={visible} />;
}

const BALLS = [
  { id: 0, pos: [-1.200, 0.2, 1.000] as [number, number, number], color: '#E65100', radius: 0.5, label: 'BOLA BASKET BESAR!', ballType: 'basketball' as BallType },
  { id: 1, pos: [0.920, 0.2, 1.570] as [number, number, number], color: '#2196F3', radius: 0.45, label: 'BOLA VOLI SEDANG!', ballType: 'volleyball' as BallType },
  { id: 2, pos: [0.113, 0.2, 0.285] as [number, number, number], color: '#4CAF50', radius: 0.45, label: 'BOLA SEPAK SEDANG!', ballType: 'soccer' as BallType },
  { id: 3, pos: [-0.426, 0.2, 2.214] as [number, number, number], color: '#FDD835', radius: 0.4, label: 'BOLA TENIS KECIL!', ballType: 'tennis' as BallType },
];

/**
 * DWTD Playground — tap balls in random order, each round faster.
 */
export function Scene3_Playground({ onComplete }: Props) {
  const { groundY, applyMeasure, pos, foot, obstacle } = useSceneGround();
  const balls = useMemo(
    () => BALLS.map((b) => ({ ...b, pos: pos(b.pos[0], b.pos[1], b.pos[2]) })),
    [pos, groundY],
  );
  const [order] = useState(() => [...Array(4).keys()].sort(() => Math.random() - 0.5)); // Random order!
  const [round, setRound] = useState(0);
  const [collected, setCollected] = useState<number[]>([]);
  const [camShake, setCamShake] = useState(0);
  const [camPunch, setCamPunch] = useState(0);
  const [camPos, setCamPos] = useState<[number, number, number]>([0.3, 1.8, 4.0]);
  const [camLookAt, setCamLookAt] = useState<[number, number, number]>([0.0, -0.5, 0.8]);
  const [vimoAnim, setVimoAnim] = useState<'wave' | 'idle' | 'point' | 'walk' | 'celebrate' | 'grab' | 'shocked' | 'dance'>('wave');
  const [vimoPos, setVimoPos] = useState<[number, number, number]>(() => foot(0.6, 2.5));
  const [lastTappedPos, setLastTappedPos] = useState<[number, number, number] | null>(null);
  const [pickupTrigger, setPickupTrigger] = useState<number | null>(null);
  const [pickupStart, setPickupStart] = useState<[number, number, number]>(() => foot(0, 0));
  const [pickupColor, setPickupColor] = useState('#FFD93D');
  const registerTap = useGameStore(s => s.registerTap);
  const vimoPosRef = useRef<[number, number, number]>(foot(0.6, 2.5));
  const setVimoAnimStr = useRef((a: string) => setVimoAnim(a as any)).current;
  const { walkTo, cleanup: cleanupWalk } = useAutoWalk(setVimoPos, setVimoAnimStr, vimoPosRef);

  useEffect(() => { vimoPosRef.current = vimoPos; }, [vimoPos]);
  useEffect(() => { return cleanupWalk; }, []);

  // Point at current target on round change (don't teleport Vimo)
  useEffect(() => {
    if (round >= BALLS.length) return;
    setVimoAnim('point');
  }, [round]);

  const handleTap = (ballId: number) => {
    if (collected.includes(ballId)) return;

    const ball = balls[ballId];
    setLastTappedPos(ball.pos);

    // Walk to the ball first, then grab it
    walkTo(ball.pos, () => {
      setPickupStart(ball.pos);
      setPickupColor(ball.color);
      setPickupTrigger(Date.now());
      setCamPunch(Date.now());

      setCollected(prev => [...prev, ballId]);
      registerTap(true);
      playSfx('success');
      speakNumber(collected.length + 1);
      setVimoAnim('grab');
      setTimeout(() => setVimoAnim('celebrate'), 500);
      setTimeout(() => setVimoAnim('idle'), 1300);

      if (collected.length + 1 >= BALLS.length) {
        setTimeout(() => { setVimoAnim('dance'); playSfx('cheer'); setTimeout(() => onComplete(3, 300), 2000); }, 1200);
      }
    }, { offset: [0.4, 0, 0.4] });
  };

  const currentBall = round < balls.length ? balls[order[round]] : null;

  // Vimo's "hand" — slightly above and in front of body
  const vimoHandPos: [number, number, number] = [vimoPos[0], vimoPos[1] + 0.5, vimoPos[2]];

  // Vimo looks at last tapped ball, or current target
  const vimoLookTarget: [number, number, number] = lastTappedPos
    ? lastTappedPos
    : (currentBall ? currentBall.pos : camPos);

  return (
    <>
      <CinematicCamera position={camPos} lookAt={camLookAt} smoothness={0.07} punch={camPunch} />

      <SceneStage envPreset="park" keyIntensity={1.6} shadowOpacity={0.4} />

      <Suspense fallback={null}>
        <GroundedEnv
          modelPath="/models/garden.glb"
          scale={2}
          position={[0, LEGACY_FLOOR_Y, 0]}
          onMeasure={(info) => applyMeasure(info, { setCamPos, setCamLookAt, setVimoPos })}
        />
        <PlayStructure groundY={groundY} />
        <FenceModel position={pos(-4, LEGACY_FLOOR_Y, 2)} rotation={Math.PI / 2} />
        <FenceModel position={pos(4, LEGACY_FLOOR_Y, 2)} rotation={Math.PI / 2} />
      </Suspense>

      <ARGroundDisc groundY={groundY} radius={1.4} />

      {/* Drifting playground sparkles */}
      <AmbientParticles count={12} color="#FFFFFF" area={4} centerY={groundY + 2.2} />

      {/* Balls */}
      {balls.map(ball => (
        <GameBall key={ball.id} position={ball.pos} color={ball.color} radius={ball.radius} visible={!collected.includes(ball.id)} ballType={ball.ballType} />
      ))}

      {/* Tap indicators */}
      {balls.map(ball => (
        <TapIndicator key={ball.id} position={ball.pos} color={ball.color} active={!collected.includes(ball.id)} onClick={() => handleTap(ball.id)} />
      ))}

      {/* Pickup animation — ball flies to Vimo */}
      <PickupAnimation startPos={pickupStart} endPos={vimoHandPos} color={pickupColor} triggerId={pickupTrigger} duration={550} />

      <Vimo
        position={vimoPos}
        animation={vimoAnim}
        scale={0.8}
        lookAt={vimoLookTarget}
        bounds={[-3, 3, -2, 3.5]}
        obstacles={[
          obstacle([0, LEGACY_FLOOR_Y, -1], [1.2, 2, 1.2], 0.3),
          obstacle([-4, LEGACY_FLOOR_Y, 2], [0.3, 1.5, 2], 0.2),
          obstacle([4, LEGACY_FLOOR_Y, 2], [0.3, 1.5, 2], 0.2),
        ]}
      />
    </>
  );
}

useGLTF.preload('/models/garden.glb');
useGLTF.preload('/models/play-structure.glb');
useGLTF.preload('/models/fence.glb');








