import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingWorldProps {
  children: React.ReactNode;
  amplitude?: number;
  speed?: number;
}

/**
 * Wraps scene content in a group that gently floats up and down.
 * amplitude: max displacement in meters (default 0.012 ≈ 1.2 cm)
 * speed: oscillation cycles per second (default 0.35 — very slow, dreamlike)
 *
 * This gives the AR world a "breathing alive" quality without affecting gameplay.
 */
export function FloatingWorld({ children, amplitude = 0.012, speed = 0.35 }: FloatingWorldProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    // Lemniscate-like motion: primary float + gentle side drift
    groupRef.current.position.y = Math.sin(t * speed) * amplitude;
    groupRef.current.position.x = Math.sin(t * speed * 0.6) * amplitude * 0.4;
  });

  return <group ref={groupRef}>{children}</group>;
}
