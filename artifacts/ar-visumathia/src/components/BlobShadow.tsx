import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BlobShadowProps {
  position: [number, number, number];
  scale?: number;
}

/**
 * Blob shadow — rendered as a sibling of the character inside the same
 * parent group. It reads the parent's world Y each frame so it always
 * sits exactly at the character's grounded feet, regardless of raycast.
 */
export function BlobShadow({ position: _pos, scale = 1 }: BlobShadowProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    // The parent group (Vimo's groupRef) is positioned by the raycast
    // grounding system. Shadow just sits at the parent's world Y + tiny offset.
    const parent = meshRef.current.parent;
    if (parent) {
      parent.updateWorldMatrix(true, false);
      const worldPos = new THREE.Vector3();
      parent.getWorldPosition(worldPos);
      meshRef.current.position.set(0, 0.02, 0);
    }
    const shadowScale = scale * 0.5;
    meshRef.current.scale.set(shadowScale, shadowScale, 1);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <circleGeometry args={[1, 16]} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={0.3}
        depthWrite={false}
      />
    </mesh>
  );
}
