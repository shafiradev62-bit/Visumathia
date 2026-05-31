import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HologramAuraProps {
  size?: number;
  color?: string;
  intensity?: number;
}

/**
 * Holographic aura — pulsing blue rim ring + point light.
 * Place inside any group to add a hologram feel (Vimo, crystals, portals).
 * Renders a glowing base ring and a soft colored rim light.
 * Very lightweight: 1 torus mesh + 1 point light.
 */
export function HologramAura({ size = 0.28, color = '#4FC3F7', intensity = 0.6 }: HologramAuraProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 0.4 + Math.abs(Math.sin(t * 1.8)) * 0.6;

    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = pulse * intensity;
      ringRef.current.rotation.y = t * 0.6;
      ringRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.06);
    }

    if (ring2Ref.current) {
      const mat = ring2Ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = pulse * intensity * 0.5;
      ring2Ref.current.rotation.y = -t * 0.4;
      ring2Ref.current.rotation.x = Math.sin(t * 0.5) * 0.3;
    }

    if (lightRef.current) {
      lightRef.current.intensity = pulse * intensity * 0.8;
    }
  });

  return (
    <>
      {/* Primary base glow ring */}
      <mesh ref={ringRef} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size, size * 0.06, 8, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </mesh>

      {/* Secondary tilted orbit ring */}
      <mesh ref={ring2Ref} position={[0, size * 0.7, 0]} rotation={[-Math.PI / 4, 0, 0]}>
        <torusGeometry args={[size * 0.6, size * 0.03, 6, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* Soft rim point light */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={0.5}
        distance={2.5}
        decay={2}
        position={[0, size * 0.8, 0]}
      />
    </>
  );
}
