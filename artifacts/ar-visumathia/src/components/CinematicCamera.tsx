import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useARSession } from '@/lib/arSession';

interface CinematicCameraProps {
  position?: [number, number, number];
  lookAt?: [number, number, number];
  smoothness?: number;
  shake?: number;
  punch?: number;
  /** Allow user to orbit/rotate the view with touch/mouse drag */
  allowOrbit?: boolean;
}

/**
 * Game camera with optional orbit.
 * - Smooth lerp to target position
 * - Subtle shake on events
 * - When allowOrbit=true, user can rotate view (touch drag)
 */
export function CinematicCamera({
  position = [0, 2, 5],
  lookAt = [0, 0, 0],
  smoothness = 0.08,
  shake = 0,
  allowOrbit = true,
}: CinematicCameraProps) {
  const arSession = useARSession();
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...position));
  const targetLookAt = useRef(new THREE.Vector3(...lookAt));
  const currentLookAt = useRef(new THREE.Vector3(...lookAt));
  const shakeStart = useRef(0);
  const shakeIntensity = useRef(0);
  const initialized = useRef(false);
  const orbitActive = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      camera.position.set(...position);
      camera.lookAt(new THREE.Vector3(...lookAt));
      currentLookAt.current.set(...lookAt);
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    targetPos.current.set(...position);
    targetLookAt.current.set(...lookAt);
    // When props change, take control back from orbit
    orbitActive.current = false;
  }, [position[0], position[1], position[2], lookAt[0], lookAt[1], lookAt[2]]);

  useEffect(() => {
    if (shake > 0) {
      shakeStart.current = Date.now();
      shakeIntensity.current = 0.06;
    }
  }, [shake]);

  useFrame(() => {
    if (arSession) return;
    // Only auto-lerp if user is NOT actively orbiting
    if (!orbitActive.current) {
      // Smoothly move position
      camera.position.lerp(targetPos.current, smoothness);
      
      // Smoothly rotate lookAt
      currentLookAt.current.lerp(targetLookAt.current, smoothness * 0.8);
      camera.lookAt(currentLookAt.current);
    } else {
      // While orbiting, sync currentLookAt to the orbit target to prevent jump on release
      // Note: OrbitControls updates the camera lookAt internally
    }

    // Shake (additive to smooth movement)
    if (shakeIntensity.current > 0.001) {
      const elapsed = (Date.now() - shakeStart.current) / 1000;
      const decay = Math.max(0, 1 - elapsed * 5);
      const intensity = shakeIntensity.current * decay;
      camera.position.x += (Math.random() - 0.5) * intensity;
      camera.position.y += (Math.random() - 0.5) * intensity * 0.4;
      if (decay <= 0) shakeIntensity.current = 0;
    }
  });

  if (arSession || !allowOrbit) return null;

  return (
    <OrbitControls
      makeDefault
      target={new THREE.Vector3(...lookAt)}
      enablePan={false}
      enableZoom={true}
      minDistance={2}
      maxDistance={12}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.75}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
      zoomSpeed={0.5}
      onStart={() => { orbitActive.current = true; }}
      onEnd={() => {
        // Immediately sync currentLookAt to the direction camera is actually facing
        // to prevent snapping when script takes over again
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        currentLookAt.current.copy(camera.position).add(dir.multiplyScalar(5));
      }}
    />
  );
}
