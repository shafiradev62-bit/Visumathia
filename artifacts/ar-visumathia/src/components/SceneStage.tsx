import { Suspense } from 'react';
import { Environment, ContactShadows } from '@react-three/drei';

interface SceneStageProps {
  keyIntensity?: number;
  keyColor?: string;
  ambientIntensity?: number;
  ambientColor?: string;
  shadowOpacity?: number;
  shadowBlur?: number;
  shadowPosY?: number;
  envPreset?: 'park' | 'city' | 'sunset' | 'night' | 'apartment' | 'studio' | 'warehouse' | 'forest' | 'lobby' | 'dawn';
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
  children?: React.ReactNode;
}

/**
 * High-quality scene lighting stage.
 * - Environment map for realistic reflections
 * - Layered directional lights (key + fill + rim)
 * - Contact shadows for solid grounding
 * - Atmospheric fog for depth (subtle — doesn't obscure AR view)
 */
export function SceneStage({
  keyIntensity = 1.6,
  keyColor = '#FFF3CD',
  ambientIntensity = 0.55,
  ambientColor = '#F0F8FF',
  envPreset = 'park',
  fogColor = '#E8F4FD',
  fogNear = 10,
  fogFar = 28,
  children,
}: SceneStageProps) {
  return (
    <>
      {/* Atmospheric depth fog — subtle, only visible at distance */}
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

      <Environment preset={envPreset} background={false} blur={0.8} />

      {/* Ambient fill */}
      <ambientLight color={ambientColor} intensity={ambientIntensity} />

      {/* Key light — warm sun */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={keyIntensity}
        color={keyColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* Cool fill — softens shadows on the opposite side */}
      <directionalLight
        position={[-5, 5, 5]}
        intensity={0.4}
        color="#B3E5FC"
      />

      {/* Warm rim — separates character from background */}
      <directionalLight
        position={[0, 5, -5]}
        intensity={0.3}
        color="#FFB48A"
      />

      {/* Contact shadow — soft ground grounding */}
      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.35}
        scale={16}
        blur={2.5}
        far={2}
        frames={1}
      />

      {children}
    </>
  );
}
