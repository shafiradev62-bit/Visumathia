import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3D particle burst that spawns at tap location.
 * Colorful particles fly outward then fade — like confetti explosion.
 */

interface TapFeedbackProps {
  position: [number, number, number];
  color: string;
  active: boolean;
  type?: 'success' | 'wrong' | 'combo';
}

const PARTICLE_COUNT = 12;

export function TapFeedback({ position, color, active, type = 'success' }: TapFeedbackProps) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(0);
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
      speed: 1.5 + Math.random() * 2,
      ySpeed: 2 + Math.random() * 3,
      size: 0.04 + Math.random() * 0.06,
      rotSpeed: Math.random() * 10,
    })), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (!active) {
      groupRef.current.visible = false;
      startTime.current = 0;
      return;
    }

    if (startTime.current === 0) startTime.current = state.clock.getElapsedTime();
    const elapsed = state.clock.getElapsedTime() - startTime.current;

    if (elapsed > 1.2) {
      groupRef.current.visible = false;
      return;
    }

    groupRef.current.visible = true;
    const progress = elapsed / 1.2;

    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      const mesh = child as THREE.Mesh;
      const dist = p.speed * elapsed;
      mesh.position.x = Math.cos(p.angle) * dist;
      mesh.position.z = Math.sin(p.angle) * dist;
      mesh.position.y = p.ySpeed * elapsed - 4.9 * elapsed * elapsed; // gravity
      mesh.rotation.x = elapsed * p.rotSpeed;
      mesh.rotation.z = elapsed * p.rotSpeed * 0.7;

      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 1 - progress;
      const scale = p.size * (1 + elapsed * 2) * (type === 'combo' ? 1.5 : 1);
      mesh.scale.setScalar(scale);
    });
  });

  const particleColor = type === 'wrong' ? '#FF4444' : type === 'combo' ? '#FFD700' : color;

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p, i) => (
        <mesh key={i}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={particleColor} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Screen flash overlay — renders a colored flash in 3D space (billboard quad).
 * Used for wrong answers (red flash) or combo (gold flash).
 */
export function ScreenFlash({ active, color = '#FF0000' }: { active: boolean; color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    if (!active) {
      meshRef.current.visible = false;
      startTime.current = 0;
      return;
    }
    if (startTime.current === 0) startTime.current = state.clock.getElapsedTime();
    const elapsed = state.clock.getElapsedTime() - startTime.current;

    if (elapsed > 0.3) {
      meshRef.current.visible = false;
      return;
    }

    meshRef.current.visible = true;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.3 * (1 - elapsed / 0.3);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -0.5]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0} side={THREE.DoubleSide} depthTest={false} />
    </mesh>
  );
}

/**
 * Combo counter — floating 3D text that appears on combo streaks.
 */
export function ComboDisplay({ combo, position }: { combo: number; position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (combo < 2) { groupRef.current.visible = false; return; }
    groupRef.current.visible = true;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = position[1] + 1.5 + Math.sin(t * 3) * 0.1;
    groupRef.current.rotation.y = Math.sin(t * 2) * 0.1;
  });

  if (combo < 2) return null;

  const comboColor = combo >= 5 ? '#FFD700' : combo >= 3 ? '#FF6B9D' : '#5BC5F2';

  return (
    <group ref={groupRef} position={position}>
      {/* Combo ring */}
      <mesh>
        <torusGeometry args={[0.3, 0.05, 8, 24]} />
        <meshStandardMaterial color={comboColor} emissive={comboColor} emissiveIntensity={2} />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={comboColor} emissive={comboColor} emissiveIntensity={3} transparent opacity={0.6} />
      </mesh>
      <pointLight color={comboColor} intensity={4} distance={3} decay={2} />
    </group>
  );
}
