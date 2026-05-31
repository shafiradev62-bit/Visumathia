import { useMemo, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface GroundedEnvProps {
  modelPath: string;
  /** Desired scale for the env */
  scale?: number;
  /** Where in world to spawn the env */
  position?: [number, number, number];
  /** Called once when ground/topY are measured */
  onMeasure: (info: { groundY: number; topY: number; centerXZ: [number, number] }) => void;
  /** Hide mesh after load (for measurement-only probes) */
  visible?: boolean;
}

/**
 * Loads an environment GLB, measures its bounding box at the given
 * scale, and reports the actual ground level back to the parent scene.
 * The parent then uses `groundY` to place characters & objects so they
 * never float and never sink into the floor.
 *
 * No more "Y = -1.2 magic numbers".
 */
export function GroundedEnv({
  modelPath,
  scale = 2,
  position = [0, 0, 0],
  onMeasure,
  visible = true,
}: GroundedEnvProps) {
  const { scene } = useGLTF(modelPath);
  const cloned = useMemo(() => scene.clone(), [scene]);
  const rootRef = useRef<THREE.Group>(null);
  const measured = useRef(false);

  useEffect(() => {
    if (measured.current || !rootRef.current) return;

    // Enable shadows for the environment model
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.receiveShadow = true;
        obj.castShadow = true;
      }
    });

    // Defer by one RAF so Three.js has flushed the matrix world after mounting
    const raf = requestAnimationFrame(() => {
      if (measured.current || !rootRef.current) return;
      rootRef.current.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(rootRef.current);
      // Guard against degenerate empty boxes (model not loaded yet)
      if (!box.isEmpty()) {
        onMeasure({
          groundY: box.min.y,
          topY: box.max.y,
          centerXZ: [(box.min.x + box.max.x) / 2, (box.min.z + box.max.z) / 2],
        });
        measured.current = true;
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [cloned, onMeasure]);

  return (
    <group ref={rootRef} scale={scale} position={position} visible={visible}>
      <primitive object={cloned} />
    </group>
  );
}
