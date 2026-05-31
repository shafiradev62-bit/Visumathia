import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type DepthParticleType = 'dust' | 'bubbles' | 'sparkles' | 'fireflies' | 'stars' | 'magic';

interface Config {
  colors: string[];
  size: number;
  speed: number;
  opacity: number;
  count: number;
  zRange: number;
  wobble: number;
}

const CONFIGS: Record<DepthParticleType, Config> = {
  dust: {
    colors: ['#FFE0B2', '#FFF8E1', '#FFCC80', '#FFECB3'],
    size: 0.022,
    speed: 0.05,
    opacity: 0.38,
    count: 28,
    zRange: 4,
    wobble: 0.12,
  },
  bubbles: {
    colors: ['#B3E5FC', '#E1F5FE', '#81D4FA', '#E0F7FA'],
    size: 0.048,
    speed: 0.07,
    opacity: 0.3,
    count: 18,
    zRange: 3.5,
    wobble: 0.18,
  },
  sparkles: {
    colors: ['#FFD700', '#FFF176', '#FFEE58', '#FFF9C4'],
    size: 0.028,
    speed: 0.09,
    opacity: 0.65,
    count: 24,
    zRange: 3,
    wobble: 0.08,
  },
  fireflies: {
    colors: ['#CCFF90', '#B9F6CA', '#69F0AE', '#DCEDC8'],
    size: 0.032,
    speed: 0.04,
    opacity: 0.7,
    count: 16,
    zRange: 4.5,
    wobble: 0.22,
  },
  stars: {
    colors: ['#FFFFFF', '#E8EAF6', '#C5CAE9', '#EDE7F6'],
    size: 0.026,
    speed: 0.04,
    opacity: 0.75,
    count: 32,
    zRange: 5,
    wobble: 0.06,
  },
  magic: {
    colors: ['#CE93D8', '#B39DDB', '#80DEEA', '#F48FB1', '#FFCC80'],
    size: 0.034,
    speed: 0.065,
    opacity: 0.55,
    count: 26,
    zRange: 3.5,
    wobble: 0.16,
  },
};

interface ParticleData {
  ox: number;
  oy: number;
  z: number;
  phase: number;
  speed: number;
  wobblePhase: number;
  layer: number; // 0=near, 1=mid, 2=far — drives wobble multiplier
}

interface DepthParticlesProps {
  type?: DepthParticleType;
  areaX?: number;
  areaY?: number;
}

/**
 * Scene-specific depth particles with Z layering for volumetric feel.
 * Near particles (low Z) drift with more wobble; far particles drift slower.
 * Single Points draw call — very lightweight.
 */
export function DepthParticles({ type = 'dust', areaX = 5, areaY = 4 }: DepthParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const cfg = CONFIGS[type];

  const { geometry, particles, basePositions } = useMemo(() => {
    const n = cfg.count;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const ptcls: ParticleData[] = [];

    for (let i = 0; i < n; i++) {
      const z = (Math.random() - 0.5) * cfg.zRange * 2;
      const layer = z < -cfg.zRange * 0.33 ? 0 : z < cfg.zRange * 0.33 ? 1 : 2;
      const ox = (Math.random() - 0.5) * areaX * 2;
      const oy = Math.random() * areaY * 2;

      pos[i * 3] = ox;
      pos[i * 3 + 1] = oy;
      pos[i * 3 + 2] = z;

      const c = new THREE.Color(cfg.colors[Math.floor(Math.random() * cfg.colors.length)]);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      ptcls.push({
        ox,
        oy,
        z,
        phase: Math.random() * Math.PI * 2,
        speed: cfg.speed * (0.6 + Math.random() * 0.8),
        wobblePhase: Math.random() * Math.PI * 2,
        layer,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    return { geometry: geo, particles: ptcls, basePositions: pos };
  }, [cfg, areaX, areaY]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const n = cfg.count;

    for (let i = 0; i < n; i++) {
      const p = particles[i];
      const wobbleScale = p.layer === 0 ? 1.5 : p.layer === 1 ? 1.0 : 0.6;

      const y = p.oy + t * p.speed;
      const wrappedY = ((y % (areaY * 2)) + areaY * 2) % (areaY * 2) - areaY;
      const x = p.ox + Math.sin(t * 0.35 + p.wobblePhase) * cfg.wobble * wobbleScale;

      pos.setXYZ(i, x, wrappedY, p.z + Math.sin(t * 0.2 + p.phase) * 0.08);
    }

    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={cfg.size}
        transparent
        opacity={cfg.opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
