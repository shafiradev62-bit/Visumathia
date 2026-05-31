import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * GameFeel — Unity-style screen effects rendered inside the 3D canvas.
 * - Vignette: dark edges that pulse on wrong answers
 * - Red flash: full-screen red tint on wrong answer (Unity standard)
 * - Scene fade-in: canvas fades from black on mount
 *
 * All effects are a single fullscreen quad rendered at the front of the scene.
 * Zero React state — pure ref-based for zero re-renders.
 */
export function GameFeel() {
  const { camera, size } = useThree();
  const vignetteRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const fadeRef = useRef<THREE.Mesh>(null);
  const flashTimeRef = useRef(0);
  const fadeStartRef = useRef(performance.now());

  // Expose trigger function globally so scenes can call it
  useEffect(() => {
    (window as any).__triggerWrongFlash = () => {
      flashTimeRef.current = performance.now();
    };
    return () => {
      delete (window as any).__triggerWrongFlash;
    };
  }, []);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const dist = 0.1; // Just in front of near plane
    const vFov = (cam.fov * Math.PI) / 180;
    const h = 2 * Math.tan(vFov / 2) * dist;
    const w = h * cam.aspect;

    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    const pos = cam.position.clone().add(dir.multiplyScalar(dist));

    // Position all quads at the same spot
    [vignetteRef, flashRef, fadeRef].forEach(r => {
      if (r.current) {
        r.current.position.copy(pos);
        r.current.lookAt(cam.position);
        r.current.scale.set(w, h, 1);
      }
    });

    // === VIGNETTE — disabled (was causing persistent dark overlay) ===
    if (vignetteRef.current) {
      vignetteRef.current.visible = false;
    }

    // === RED FLASH — decays over 0.4s ===
    if (flashRef.current && flashTimeRef.current > 0) {
      const elapsed = (performance.now() - flashTimeRef.current) / 1000;
      if (elapsed < 0.4) {
        const decay = 1 - elapsed / 0.4;
        const mat = flashRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = decay * 0.45;
        flashRef.current.visible = true;
      } else {
        flashRef.current.visible = false;
        flashTimeRef.current = 0;
      }
    }

    // === FADE IN — from black over 0.6s on mount ===
    if (fadeRef.current) {
      const elapsed = (performance.now() - fadeStartRef.current) / 1000;
      if (elapsed < 0.6) {
        const mat = fadeRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 1 - elapsed / 0.6);
        fadeRef.current.visible = true;
      } else {
        fadeRef.current.visible = false;
      }
    }
  });

  return (
    <>
      {/* Vignette removed — was causing persistent dark overlay */}

      {/* Red flash on wrong answer */}
      <mesh ref={flashRef} renderOrder={1000} frustumCulled={false} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#FF0000"
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Scene fade-in from black */}
      <mesh ref={fadeRef} renderOrder={1001} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={1}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </>
  );
}

/** Call this from any scene when the player gets a wrong answer */
export function triggerWrongFlash() {
  if (typeof window !== 'undefined' && (window as any).__triggerWrongFlash) {
    (window as any).__triggerWrongFlash();
  }
}
