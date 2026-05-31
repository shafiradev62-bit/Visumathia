import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function elasticOut(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  if (t === 0) return 0;
  if (t === 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

interface ObjectEmergenceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

/**
 * Wraps children and animates them from scale 0 → 1 with an elastic bounce.
 * Use this around any object that should "emerge" when first rendered.
 */
export function ObjectEmergence({ children, delay = 0, duration = 0.9 }: ObjectEmergenceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const startRef = useRef(-1);
  const doneRef = useRef(false);

  useFrame((state) => {
    if (doneRef.current || !groupRef.current) return;

    const t = state.clock.getElapsedTime();
    if (startRef.current < 0) startRef.current = t + delay;

    const elapsed = Math.max(0, t - startRef.current);
    if (elapsed <= 0) {
      groupRef.current.scale.setScalar(0);
      return;
    }

    const progress = Math.min(elapsed / duration, 1);
    const s = elasticOut(progress);
    groupRef.current.scale.setScalar(Math.max(0, s));

    if (progress >= 1) doneRef.current = true;
  });

  return (
    <group ref={groupRef} scale={0}>
      {children}
    </group>
  );
}
