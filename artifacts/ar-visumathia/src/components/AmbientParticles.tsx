import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AmbientParticlesProps {
  count?: number;
  color?: string;
  area?: number;
  centerY?: number;
}

/**
 * Lightweight ambient particles using a single Points object.
 * One draw call for all particles — no instanced mesh overhead.
 */
export function AmbientParticles({
  count = 20,
  color = '#FFFFFF',
  area = 4,
  centerY = 1,
}: AmbientParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area * 2;
      positions[i * 3 + 1] = Math.random() * area * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * area * 2;
      speeds[i] = 0.05 + Math.random() * 0.12;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, phases };
  }, [count, area]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const y = positions[i * 3 + 1] + t * speeds[i];
      const wrappedY = ((y % (area * 2)) + area * 2) % (area * 2);
      pos.setY(i, centerY - area + wrappedY);
      pos.setX(i, positions[i * 3] + Math.sin(t * 0.4 + phases[i]) * 0.15);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={0.04}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
