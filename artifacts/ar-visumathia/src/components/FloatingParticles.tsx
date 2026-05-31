import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PASTEL_COLORS = ['#FFB3C1', '#B5EAD7', '#C7CEEA', '#FFDAC1', '#FFE4E1', '#E2F0CB', '#FFD3B6', '#A8EDEA'];

interface ParticleData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  size: number;
  phase: number;
}

export function FloatingParticles({ count = 60 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo<ParticleData[]>(() =>
    Array.from({ length: count }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.002,
        0.004 + Math.random() * 0.006,
        (Math.random() - 0.5) * 0.001
      ),
      color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
      size: 0.02 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
    })), [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    particles.forEach((p, i) => {
      const c = new THREE.Color(p.color);
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    });
    return arr;
  }, [particles, count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      p.position.addScaledVector(p.velocity, 1);
      if (p.position.y > 4) p.position.y = -4;
      if (p.position.x > 5) p.position.x = -5;
      if (p.position.x < -5) p.position.x = 5;

      const opacity = 0.4 + Math.sin(t * 2 + p.phase) * 0.4;
      const s = p.size * (0.8 + Math.sin(t * 1.5 + p.phase) * 0.2);

      dummy.position.copy(p.position);
      dummy.scale.setScalar(s * (opacity + 0.2));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.geometry.attributes.color) {
      meshRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial vertexColors transparent opacity={0.7} />
      <instancedBufferAttribute attach="geometry-attributes-color" args={[colors, 3]} />
    </instancedMesh>
  );
}
