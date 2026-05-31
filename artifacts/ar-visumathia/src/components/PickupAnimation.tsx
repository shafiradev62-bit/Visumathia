import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PickupAnimationProps {
  startPos: [number, number, number];
  endPos: [number, number, number];
  color: string;
  triggerId: number | string | null;
  duration?: number;
  onArrive?: () => void;
}

/**
 * Lightweight pickup animation — item flies in arc to Vimo's hand.
 * Zero React state — all driven by refs + useFrame.
 */
export function PickupAnimation({
  startPos,
  endPos,
  color,
  triggerId,
  duration = 0.55,
  onArrive,
}: PickupAnimationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef(-1);
  const activeRef = useRef(false);
  const prevTrigger = useRef<typeof triggerId>(null);

  useEffect(() => {
    if (triggerId !== null && triggerId !== prevTrigger.current) {
      prevTrigger.current = triggerId;
      startTimeRef.current = -1; // will be set on first frame
      activeRef.current = true;
    }
  }, [triggerId]);

  useFrame((state) => {
    if (!activeRef.current || !groupRef.current || !meshRef.current) return;

    // Set start time on first active frame
    if (startTimeRef.current < 0) {
      startTimeRef.current = state.clock.getElapsedTime();
    }

    const elapsed = state.clock.getElapsedTime() - startTimeRef.current;
    // Phases: fly (duration) → hold (0.6s in hand) → fade (0.3s)
    const flyDur = duration;
    const holdDur = 0.6;
    const fadeDur = 0.3;
    const total = flyDur + holdDur + fadeDur;

    if (elapsed >= total) {
      activeRef.current = false;
      groupRef.current.visible = false;
      if (onArrive) onArrive();
      return;
    }

    groupRef.current.visible = true;

    if (elapsed < flyDur) {
      // PHASE 1: fly in arc to hand
      const t = elapsed / flyDur;
      const ease = 1 - Math.pow(1 - t, 2.5);
      const arcY = Math.sin(t * Math.PI) * 0.5;

      groupRef.current.position.set(
        startPos[0] + (endPos[0] - startPos[0]) * ease,
        startPos[1] + (endPos[1] - startPos[1]) * ease + arcY,
        startPos[2] + (endPos[2] - startPos[2]) * ease
      );

      // Spin while flying
      groupRef.current.rotation.x = t * Math.PI * 2;
      groupRef.current.rotation.y = t * Math.PI * 2;
      groupRef.current.scale.setScalar(1);

      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 1;
    } else if (elapsed < flyDur + holdDur) {
      // PHASE 2: held in hand — bob slightly with the character
      const heldT = (elapsed - flyDur) / holdDur;
      const bob = Math.sin(heldT * Math.PI * 2) * 0.02;

      groupRef.current.position.set(
        endPos[0],
        endPos[1] + bob,
        endPos[2]
      );
      groupRef.current.rotation.x = 0;
      groupRef.current.rotation.y = heldT * Math.PI * 0.5;
      groupRef.current.scale.setScalar(1);

      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 1;
    } else {
      // PHASE 3: shrink and fade away (consumed)
      const fadeT = (elapsed - flyDur - holdDur) / fadeDur;
      groupRef.current.position.set(
        endPos[0],
        endPos[1] + fadeT * 0.3,
        endPos[2]
      );
      const scale = Math.max(0.05, 1 - fadeT * 0.8);
      groupRef.current.scale.setScalar(scale);
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 1 - fadeT;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={1} depthWrite={false} />
      </mesh>
      {/* highlight */}
      <mesh position={[-0.04, 0.04, 0.08]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} depthWrite={false} />
      </mesh>
    </group>
  );
}
