import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { AmbientParticles } from './AmbientParticles';

interface SceneEnvironmentProps {
  groundColor?: string;
  skyColor?: string;
  ambientIntensity?: number;
  fogNear?: number;
  fogFar?: number;
  children?: React.ReactNode;
}

/**
 * High-quality scene environment with:
 * - Gradient sky dome (light blue to white horizon)
 * - Stylized cartoon clouds
 * - Atmospheric fog
 * - Multi-directional lighting (warm key, cool fill, purple rim)
 * - Ground plane with Soft Contact Shadows
 * - Ambient reflections via Environment Map
 */
export function SceneEnvironment({
  groundColor = '#90EE90',
  skyColor = '#87CEEB',
  ambientIntensity = 0.8,
  children,
}: SceneEnvironmentProps) {
  return (
    <>
      {/* High-quality reflections and ambient lighting */}
      <Environment preset="park" background={false} blur={0.8} />

      {/* Gradient sky dome — light blue top fading to white at horizon */}
      <SkyDome topColor={skyColor} bottomColor="#FFFFFF" />

      {/* Stylized cartoon clouds */}
      <CloudLayer />

      {/* Atmospheric fog for depth */}
      <fog attach="fog" args={[skyColor, 15, 35]} />

      {/* === LIGHTING SETUP (3-point + ambient) === */}
      <ambientLight color="#FFF8F0" intensity={ambientIntensity} />

      {/* Key sun light */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        color="#FFF3CD"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={40}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      {/* Soft fill light */}
      <directionalLight
        position={[-5, 5, 5]}
        intensity={0.4}
        color="#B3E5FC"
      />

      {/* Purple rim light for stylized look */}
      <directionalLight
        position={[0, 5, -10]}
        intensity={0.8}
        color="#E1BEE7"
      />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={groundColor} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Realistic contact shadows for better grounding */}
      <ContactShadows
        position={[0, -1.19, 0]}
        opacity={0.4}
        scale={20}
        blur={2.5}
        far={1.5}
        color={groundColor}
      />

      {/* Ambient magical particles */}
      <AmbientParticles count={30} area={6} color="#B3E5FC" />

      {children}
    </>
  );
}

/**
 * Gradient sky dome using a custom shader for smooth top-to-bottom color blend.
 */
function SkyDome({ topColor, bottomColor }: { topColor: string; bottomColor: string }) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(topColor) },
        bottomColor: { value: new THREE.Color(bottomColor) },
        offset: { value: 10 },
        exponent: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }, [topColor, bottomColor]);

  return (
    <mesh material={material}>
      <sphereGeometry args={[40, 32, 32]} />
    </mesh>
  );
}

/**
 * Stylized cartoon cloud layer — soft white blobs that drift slowly.
 */
function CloudLayer() {
  const groupRef = useRef<THREE.Group>(null);

  // Slowly rotate the cloud layer for a gentle drift effect
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.008;
    }
  });

  const clouds = useMemo(() => {
    const positions: { x: number; y: number; z: number; scale: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 18 + Math.random() * 8;
      positions.push({
        x: Math.cos(angle) * radius,
        y: 8 + Math.random() * 6,
        z: Math.sin(angle) * radius,
        scale: 1.5 + Math.random() * 2,
      });
    }
    return positions;
  }, []);

  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <group key={i} position={[cloud.x, cloud.y, cloud.z]}>
          {/* Main cloud body — 3 overlapping spheres */}
          <mesh scale={[cloud.scale, cloud.scale * 0.6, cloud.scale * 0.8]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
          </mesh>
          <mesh position={[cloud.scale * 0.5, -0.1, 0]} scale={[cloud.scale * 0.7, cloud.scale * 0.45, cloud.scale * 0.6]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
          </mesh>
          <mesh position={[-cloud.scale * 0.4, -0.15, 0.2]} scale={[cloud.scale * 0.6, cloud.scale * 0.4, cloud.scale * 0.5]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
