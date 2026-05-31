import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Temporary debug component — logs all bone names from the GLB model.
 * Remove after finding the correct bone names.
 */
export function DebugBones() {
  const { scene } = useGLTF('/models/langkah.glb');

  useEffect(() => {
    console.log('=== ALL BONES IN langkah.glb ===');
    const bones: string[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Bone || child.type === 'Bone') {
        bones.push(`${child.name} (parent: ${child.parent?.name || 'none'})`);
      }
    });
    bones.forEach((b, i) => console.log(`  [${i}] ${b}`));
    console.log(`=== Total bones: ${bones.length} ===`);
    
    // Also log all object names for reference
    console.log('=== ALL OBJECTS ===');
    scene.traverse((child) => {
      if (child.type === 'Bone' || child.type === 'SkinnedMesh' || child.type === 'Object3D') {
        console.log(`  ${child.type}: "${child.name}"`);
      }
    });
  }, [scene]);

  return null;
}
