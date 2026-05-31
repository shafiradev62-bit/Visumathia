import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useCharacterStore } from '@/lib/characterStore';
import { BlobShadow } from '@/components/BlobShadow';
import { HologramAura } from '@/components/HologramAura';

interface VimoProps {
  animation?: 'idle' | 'wave' | 'celebrate' | 'jump' | 'think' | 'point' | 'walk' | 'grab' | 'shocked' | 'dance' | 'dizzy';
  position?: [number, number, number];
  scale?: number;
  lookAt?: [number, number, number];
  /** Obstacle boxes — Vimo will be pushed out of these each frame */
  obstacles?: { center: [number, number, number]; size: [number, number, number]; padding?: number }[];
  /** Walkable area bounds [minX, maxX, minZ, maxZ] — character clamped inside */
  bounds?: [number, number, number, number];
  /** Character collision radius (default 0.3) */
  radius?: number;
}

/** Pick the right GLB based on character + animation */
function getModelPath(character: 'girl' | 'boy', animation: VimoProps['animation']): string {
  if (character === 'boy') {
    return '/models/boy.glb';
  }
  switch (animation) {
    case 'walk':
      return '/models/jalan.glb';
    case 'wave':
    case 'celebrate':
    case 'dance':
    case 'shocked':
      return '/models/dadah.glb';
    default:
      return '/models/hai.glb';
  }
}

/** Loads one GLB and plays its built-in animation on loop. */
function VimoModel({ modelPath, isMoving }: { modelPath: string; isMoving: boolean }) {
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const { scene, animations } = useGLTF(modelPath);
  const cloned = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [cloned]);

  useEffect(() => {
    if (!cloned || animations.length === 0) return;
    const mixer = new THREE.AnimationMixer(cloned);
    const action = mixer.clipAction(animations[0]);
    action.reset().play();
    mixerRef.current = mixer;
    return () => { mixer.stopAllAction(); mixerRef.current = null; };
  }, [cloned, animations]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return (
    <Float
      speed={isMoving ? 0 : 2}
      rotationIntensity={isMoving ? 0 : 0.1}
      floatIntensity={isMoving ? 0 : 0.2}
      floatingRange={[-0.05, 0.05]}
    >
      <primitive object={cloned} />
    </Float>
  );
}

// ─── Random idle micro-behaviour types ───────────────────────────────────────
type IdleBehavior = 'none' | 'lookLeft' | 'lookRight' | 'smallJump' | 'excited' | 'nod';

interface IdleState {
  type: IdleBehavior;
  startTime: number;
  duration: number;
  nextTrigger: number;
  yawOffset: number; // additional Y rotation accumulated by look behaviours
}

/**
 * Vimo — natural walking character.
 * - Acceleration ramp at start of movement (no jerky teleport)
 * - Body faces direction of travel while walking
 * - Subtle pendulum sway like real walking
 * - Smooth deceleration arrival (no overshoot)
 * - Random idle micro-behaviours (look L/R, small jump, nod, excited)
 * - Hologram aura ring at feet
 */
export function Vimo({ animation = 'idle', position = [0, 0, 0], scale = 1, lookAt, obstacles, bounds, radius = 0.3 }: VimoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { character } = useCharacterStore();
  const modelPath = getModelPath(character, animation);

  const currentPos = useRef(new THREE.Vector3(...position));
  const targetPos = useRef(new THREE.Vector3(...position));
  const movementStart = useRef(0);
  const lastTickPos = useRef(new THREE.Vector3(...position));
  const velocityVec = useRef(new THREE.Vector3());
  const prevTarget = useRef(new THREE.Vector3(...position));

  // Emergence bounce — scale 0 → elastic overshoot → 1 on first mount
  const mountTimeRef = useRef(-1);
  const emergenceDoneRef = useRef(false);

  // Random idle behaviour system — all ref-based, zero re-renders
  const idleState = useRef<IdleState>({
    type: 'none',
    startTime: 0,
    duration: 0,
    nextTrigger: 3 + Math.random() * 5,
    yawOffset: 0,
  });

  useEffect(() => {
    const newTarget = new THREE.Vector3(...position);
    if (newTarget.distanceTo(prevTarget.current) > 0.05) {
      movementStart.current = performance.now();
      prevTarget.current.copy(newTarget);
    }
    targetPos.current.copy(newTarget);
  }, [position[0], position[1], position[2]]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    // === EMERGENCE BOUNCE — elastic scale-in on first mount ===
    if (mountTimeRef.current < 0) mountTimeRef.current = t;
    if (!emergenceDoneRef.current) {
      const elapsed = t - mountTimeRef.current;
      const duration = 0.85;
      if (elapsed < duration) {
        const p = elapsed / duration;
        const c4 = (2 * Math.PI) / 3;
        const es = Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
        const s = Math.max(0, es) * scale;
        groupRef.current.scale.setScalar(s);
      } else {
        emergenceDoneRef.current = true;
        groupRef.current.scale.set(scale, scale, scale);
      }
    } else {
      groupRef.current.scale.set(scale, scale, scale);
    }

    // === NATURAL WALKING — accel ramp + dist-aware lerp ===
    lastTickPos.current.copy(currentPos.current);
    const dist = currentPos.current.distanceTo(targetPos.current);

    if (dist > 0.001) {
      const elapsed = (performance.now() - movementStart.current) / 1000;
      const accelRamp = Math.min(1, elapsed / 0.4);
      const easedAccel = accelRamp * accelRamp * (3 - 2 * accelRamp);
      const factor = easedAccel * 0.08;
      currentPos.current.lerp(targetPos.current, factor);
    }

    // === COLLISION — push out of obstacles + clamp to walkable bounds ===
    let px = currentPos.current.x;
    let pz = currentPos.current.z;

    if (obstacles && obstacles.length > 0) {
      for (const obs of obstacles) {
        const pad = (obs.padding ?? 0) + radius;
        const halfX = obs.size[0] + pad;
        const halfZ = obs.size[2] + pad;
        const dx = px - obs.center[0];
        const dz = pz - obs.center[2];
        if (Math.abs(dx) < halfX && Math.abs(dz) < halfZ) {
          const overlapX = halfX - Math.abs(dx);
          const overlapZ = halfZ - Math.abs(dz);
          if (overlapX < overlapZ) {
            px = obs.center[0] + Math.sign(dx || 1) * halfX;
          } else {
            pz = obs.center[2] + Math.sign(dz || 1) * halfZ;
          }
        }
      }
    }

    if (bounds) {
      px = Math.max(bounds[0] + radius, Math.min(bounds[1] - radius, px));
      pz = Math.max(bounds[2] + radius, Math.min(bounds[3] - radius, pz));
    }

    currentPos.current.x = px;
    currentPos.current.z = pz;

    // === Compute actual velocity this frame ===
    velocityVec.current.subVectors(currentPos.current, lastTickPos.current);
    const speed = velocityVec.current.length();
    const isMoving = speed > 0.003;

    // === ORIENTATION ===
    let targetRotY = groupRef.current.rotation.y;
    if (isMoving) {
      const dir = velocityVec.current.clone().normalize();
      targetRotY = Math.atan2(dir.x, dir.z);
    } else if (lookAt) {
      const dir = new THREE.Vector3(...lookAt).sub(currentPos.current);
      dir.y = 0;
      if (dir.lengthSq() > 0.001) {
        dir.normalize();
        targetRotY = Math.atan2(dir.x, dir.z);
      }
    }

    let diff = targetRotY - groupRef.current.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    groupRef.current.rotation.y += diff * (isMoving ? 0.15 : 0.08);

    // === BODY OVERLAY (bob, sway) per animation ===
    const breathe = Math.sin(t * 1.8) * 0.03;
    let bobY = 0;
    let rotZ = 0;

    switch (animation) {
      case 'celebrate':
        bobY = Math.abs(Math.sin(t * 5)) * 0.12;
        rotZ = Math.sin(t * 6) * 0.06;
        break;
      case 'dance':
        bobY = Math.abs(Math.sin(t * 5)) * 0.1;
        rotZ = Math.sin(t * 4) * 0.08;
        break;
      case 'shocked':
        bobY = 0.05 + Math.abs(Math.sin(t * 12)) * 0.04;
        rotZ = Math.sin(t * 15) * 0.03;
        break;
      case 'jump':
        bobY = Math.abs(Math.sin(t * 3)) * 0.15;
        break;
      case 'dizzy':
        bobY = Math.sin(t * 2) * 0.02;
        rotZ = Math.sin(t * 2) * 0.06;
        break;
      case 'walk':
      default: {
        if (isMoving) {
          const cadence = 7;
          bobY = Math.abs(Math.sin(t * cadence)) * 0.025;
          rotZ = Math.sin(t * cadence * 0.5) * 0.025;
        } else {
          bobY = breathe;
          rotZ = Math.sin(t * 0.5) * 0.012;
        }
        break;
      }
    }

    // === RANDOM IDLE MICRO-BEHAVIOURS ===
    // Only fires when Vimo is idle (not moving, not celebrating/dancing)
    const canDoIdleBehavior = !isMoving && (animation === 'idle' || animation === 'think' || animation === 'point');
    const idle = idleState.current;

    if (canDoIdleBehavior) {
      if (t > idle.nextTrigger && idle.type === 'none') {
        const behaviors: IdleBehavior[] = ['lookLeft', 'lookRight', 'smallJump', 'excited', 'nod', 'none', 'none'];
        idle.type = behaviors[Math.floor(Math.random() * behaviors.length)];
        idle.startTime = t;
        idle.duration = 0.35 + Math.random() * 0.45;
        idle.nextTrigger = t + idle.duration + 3 + Math.random() * 5;
      }

      if (idle.type !== 'none') {
        const elapsed = t - idle.startTime;
        if (elapsed > idle.duration) {
          idle.type = 'none';
          idle.yawOffset = 0;
        } else {
          const p = elapsed / idle.duration;
          const bell = Math.sin(p * Math.PI); // 0 → 1 → 0 bell curve

          switch (idle.type) {
            case 'lookLeft':
              // Additive yaw offset — look left and return
              idle.yawOffset = bell * 0.55;
              groupRef.current.rotation.y += idle.yawOffset;
              break;
            case 'lookRight':
              idle.yawOffset = -bell * 0.55;
              groupRef.current.rotation.y += idle.yawOffset;
              break;
            case 'smallJump':
              bobY += bell * 0.14;
              break;
            case 'excited':
              // Rapid side-to-side wiggle
              rotZ += Math.sin(p * Math.PI * 8) * bell * 0.09;
              bobY += Math.abs(Math.sin(p * Math.PI * 4)) * bell * 0.06;
              break;
            case 'nod':
              // Gentle forward pitch (rotate X briefly)
              groupRef.current.rotation.x = bell * 0.12;
              break;
          }
        }
      }
    } else {
      // Clear idle state when moving or in non-idle animation
      if (idle.type !== 'none') {
        idle.type = 'none';
        idle.yawOffset = 0;
        groupRef.current.rotation.x = 0;
      }
    }

    // Apply final position (lerped + bob)
    groupRef.current.position.set(
      currentPos.current.x,
      currentPos.current.y + bobY,
      currentPos.current.z
    );
    groupRef.current.rotation.z = rotZ;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <VimoModel key={modelPath} modelPath={modelPath} isMoving={false} />
      {/* Holographic aura — glowing ring at Vimo's feet */}
      <HologramAura size={0.26} color="#4FC3F7" intensity={0.55} />
      {/* Blob shadow — Unity-style fake shadow on the ground */}
      <BlobShadow position={[0, -0.01, 0]} scale={0.9} />
    </group>
  );
}

// Character models warmed via preloadSceneAssets when entering a scene
