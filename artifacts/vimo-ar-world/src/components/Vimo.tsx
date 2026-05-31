import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Float, Sphere, Box, RoundedBox, Cylinder } from "@react-three/drei";
import * as THREE from "three";

export function Vimo({ position = [0, 0, 0], scale = 1, expression = "happy" }: { position?: [number, number, number], scale?: number, expression?: string }) {
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const antennaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(t * 2) * 0.1;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 1.5) * 0.2;
      headRef.current.rotation.x = Math.sin(t * 1.2) * 0.1;
    }
    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(t * 5) * 0.1;
    }
  });

  return (
    <group ref={group} position={position} scale={scale} dispose={null}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Body */}
        <RoundedBox args={[1.2, 1.4, 1.2]} radius={0.3} position={[0, -0.2, 0]}>
          <meshStandardMaterial color="#4ECDC4" roughness={0.3} metalness={0.2} />
        </RoundedBox>

        {/* Head */}
        <group ref={headRef} position={[0, 0.8, 0]}>
          <RoundedBox args={[1.4, 1, 1.3]} radius={0.2}>
            <meshStandardMaterial color="#FFF8ED" roughness={0.2} metalness={0.1} />
          </RoundedBox>
          
          {/* Face Panel (Screen) */}
          <RoundedBox args={[1.2, 0.7, 0.1]} radius={0.1} position={[0, 0, 0.65]}>
            <meshStandardMaterial color="#1A1A4E" roughness={0.5} />
          </RoundedBox>

          {/* Eyes based on expression */}
          {expression === "happy" && (
            <group position={[0, 0, 0.71]}>
              <mesh position={[-0.3, 0.1, 0]}>
                <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
                <meshBasicMaterial color="#FFD166" />
              </mesh>
              <mesh position={[0.3, 0.1, 0]}>
                <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
                <meshBasicMaterial color="#FFD166" />
              </mesh>
            </group>
          )}

          {/* Antenna */}
          <group ref={antennaRef} position={[0, 0.6, 0]}>
            <Cylinder args={[0.05, 0.05, 0.4]} position={[0, 0.2, 0]}>
              <meshStandardMaterial color="#999" />
            </Cylinder>
            <Sphere args={[0.15]} position={[0, 0.4, 0]}>
              <meshStandardMaterial color="#FFD166" emissive="#FFD166" emissiveIntensity={0.5} />
            </Sphere>
          </group>
        </group>

        {/* Arms */}
        <RoundedBox args={[0.3, 0.8, 0.3]} radius={0.15} position={[-0.8, -0.1, 0]} rotation={[0, 0, 0.2]}>
          <meshStandardMaterial color="#FFF8ED" />
        </RoundedBox>
        <RoundedBox args={[0.3, 0.8, 0.3]} radius={0.15} position={[0.8, -0.1, 0]} rotation={[0, 0, -0.2]}>
          <meshStandardMaterial color="#FFF8ED" />
        </RoundedBox>
      </Float>
    </group>
  );
}
