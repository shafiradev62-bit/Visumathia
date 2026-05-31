import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CONFETTI_COUNT = 80;
const CONFETTI_COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6BCC',
  '#FFB347', '#A8EDEA', '#FFC3A0', '#D4A5FF', '#FDFFB6',
];

interface ConfettiPiece {
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedZ: number;
}

/**
 * Grand Finale — spectacular 3D celebration for Scene 10 completion.
 *
 * Includes:
 *  - 80 colourful confetti boxes with gravity + tumble rotation
 *  - A pulsing magic portal ring at the origin
 *  - Upward rushing magic particle storm
 *  - A warm golden point-light burst
 *
 * Mount this component inside the Canvas when sceneId === 10 and completed.
 */
export function GrandFinale() {
  const confettiMeshRef = useRef<THREE.InstancedMesh>(null);
  const portalRef = useRef<THREE.Mesh>(null);
  const portal2Ref = useRef<THREE.Mesh>(null);
  const stormRef = useRef<THREE.Points>(null);
  const burstLightRef = useRef<THREE.PointLight>(null);
  const startTimeRef = useRef(-1);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const pieces = useMemo<ConfettiPiece[]>(() =>
    Array.from({ length: CONFETTI_COUNT }).map(() => ({
      ox: (Math.random() - 0.5) * 0.4,
      oy: 0.5,
      vx: (Math.random() - 0.5) * 4,
      vy: 3 + Math.random() * 5,
      vz: (Math.random() - 0.5) * 3,
      rotX: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      rotSpeedX: (Math.random() - 0.5) * 8,
      rotSpeedZ: (Math.random() - 0.5) * 6,
    })), []);

  const confettiColors = useMemo(() => {
    const arr = new Float32Array(CONFETTI_COUNT * 3);
    pieces.forEach((_, i) => {
      const c = new THREE.Color(CONFETTI_COLORS[i % CONFETTI_COLORS.length]);
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    });
    return arr;
  }, [pieces]);

  // Storm particle system
  const { stormGeo, stormData } = useMemo(() => {
    const STORM_COUNT = 60;
    const pos = new Float32Array(STORM_COUNT * 3);
    const data: { x: number; z: number; speed: number; phase: number }[] = [];

    for (let i = 0; i < STORM_COUNT; i++) {
      const x = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 6;
      pos[i * 3] = x;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = z;
      data.push({ x, z, speed: 0.8 + Math.random() * 1.5, phase: Math.random() * Math.PI * 2 });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { stormGeo: geo, stormData: data };
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (startTimeRef.current < 0) startTimeRef.current = t;
    const elapsed = t - startTimeRef.current;

    // === CONFETTI ===
    if (confettiMeshRef.current) {
      const mesh = confettiMeshRef.current;
      pieces.forEach((p, i) => {
        const lt = Math.max(0, elapsed - i * 0.015); // stagger launch
        dummy.position.set(
          p.ox + p.vx * lt,
          p.oy + p.vy * lt - 4.9 * lt * lt, // gravity
          p.vz * lt,
        );
        dummy.rotation.x = p.rotX + p.rotSpeedX * lt;
        dummy.rotation.z = p.rotZ + p.rotSpeedZ * lt;
        const fadeOut = Math.max(0, 1 - (lt - 1.2) / 3);
        const s = 0.06 * Math.max(0.01, fadeOut);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }

    // === PORTAL RINGS ===
    const portalPulse = 0.6 + Math.abs(Math.sin(elapsed * 2.5)) * 0.4;
    if (portalRef.current) {
      const mat = portalRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = portalPulse * 2;
      portalRef.current.rotation.y = elapsed * 1.2;
      portalRef.current.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.08);
    }
    if (portal2Ref.current) {
      const mat = portal2Ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = portalPulse * 1.4;
      portal2Ref.current.rotation.y = -elapsed * 0.8;
      portal2Ref.current.rotation.x = elapsed * 0.3;
    }

    // === PARTICLE STORM — upward rush ===
    if (stormRef.current) {
      const pos = stormRef.current.geometry.attributes.position as THREE.BufferAttribute;
      stormData.forEach((d, i) => {
        let y = -2.5 + ((elapsed * d.speed + d.phase * 0.5) % 5);
        const x = d.x + Math.sin(elapsed * 0.6 + d.phase) * 0.2;
        pos.setXYZ(i, x, y, d.z);
      });
      pos.needsUpdate = true;
      const mat = stormRef.current.material as THREE.PointsMaterial;
      mat.opacity = Math.min(1, elapsed * 0.8) * 0.75;
    }

    // === BURST LIGHT ===
    if (burstLightRef.current) {
      burstLightRef.current.intensity = Math.max(0, 3 - elapsed * 0.4) * (0.8 + Math.sin(elapsed * 6) * 0.2);
    }
  });

  return (
    <>
      {/* ── Confetti boxes ── */}
      <instancedMesh ref={confettiMeshRef} args={[undefined, undefined, CONFETTI_COUNT]} castShadow>
        <boxGeometry args={[1, 1, 0.2]} />
        <meshStandardMaterial vertexColors />
        <instancedBufferAttribute attach="geometry-attributes-color" args={[confettiColors, 3]} />
      </instancedMesh>

      {/* ── Magic portal — primary ring ── */}
      <mesh ref={portalRef} position={[0, -0.8, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.06, 12, 64]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>

      {/* ── Portal — inner orbit ring ── */}
      <mesh ref={portal2Ref} position={[0, -0.8, -1.5]}>
        <torusGeometry args={[0.45, 0.03, 8, 48]} />
        <meshStandardMaterial
          color="#4FC3F7"
          emissive="#4FC3F7"
          emissiveIntensity={1.5}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>

      {/* ── Portal centre glow disc ── */}
      <mesh position={[0, -0.78, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.6}
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ── Particle storm ── */}
      <points ref={stormRef} geometry={stormGeo}>
        <pointsMaterial
          color="#FFD700"
          size={0.05}
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ── Burst light ── */}
      <pointLight
        ref={burstLightRef}
        color="#FFD700"
        intensity={3}
        distance={6}
        decay={2}
        position={[0, 0.5, -1]}
      />

      {/* ── Steady fill light for the finale ── */}
      <pointLight color="#FF6B9D" intensity={1.2} distance={5} decay={2} position={[-1.5, 1, 0]} />
      <pointLight color="#4FC3F7" intensity={1.0} distance={5} decay={2} position={[1.5, 1, 0]} />
    </>
  );
}
