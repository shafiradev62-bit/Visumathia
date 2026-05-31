import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playSfx } from '@/lib/audio';

interface TapIndicatorProps {
  position: [number, number, number];
  color?: string;
  active: boolean;
  onClick: () => void;
}

/**
 * Tap indicator — subtle glowing ring pulse around the object.
 * No cursor, no pointing hand. Just a pulsing aura that says "tap me".
 * The character will walk to the object and grab it on tap.
 */
export function TapIndicator({ position, color = '#FFD700', active, onClick }: TapIndicatorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!active || !groupRef.current) return;
    const t = state.clock.getElapsedTime() + phase.current;

    // Outer ring pulses (scale + opacity)
    if (ringRef.current) {
      const pulse = 0.8 + Math.sin(t * 3) * 0.2;
      ringRef.current.scale.setScalar(pulse);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(t * 3) * 0.2;
    }

    // Second ring — offset phase, creates ripple effect
    if (ring2Ref.current) {
      const pulse2 = 0.9 + Math.sin(t * 3 + Math.PI) * 0.15;
      ring2Ref.current.scale.setScalar(pulse2);
      const mat2 = ring2Ref.current.material as THREE.MeshBasicMaterial;
      mat2.opacity = 0.25 + Math.sin(t * 3 + Math.PI) * 0.15;
    }

    // Ground glow breathes
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 2) * 0.08;
    }
  });

  if (!active) return null;

  const handleClick = (e: any) => {
    e.stopPropagation?.();
    playSfx('tap');
    onClick();
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Invisible tap hitbox — generous for small fingers */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} />
      </mesh>

      {/* Pulsing ring 1 — main indicator */}
      <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.55, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Pulsing ring 2 — ripple effect */}
      <mesh ref={ring2Ref} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.67, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Soft ground glow */}
      <mesh ref={glowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Small floating sparkle dots — subtle "magic" feel */}
      <SparkleParticles color={color} />
    </group>
  );
}

/** Tiny floating particles around the tap target — lightweight, no pointLight */
function SparkleParticles({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const phase = useRef(Math.random() * 100);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() + phase.current;
    groupRef.current.rotation.y = t * 0.5;
    // Each child bobs independently
    groupRef.current.children.forEach((child, i) => {
      child.position.y = 0.3 + Math.sin(t * 2 + i * 1.5) * 0.15;
      (child as THREE.Mesh).scale.setScalar(0.6 + Math.sin(t * 3 + i) * 0.4);
    });
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 0.4,
            0.3,
            Math.sin((i / 4) * Math.PI * 2) * 0.4,
          ]}
        >
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}
