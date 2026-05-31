import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useARMotion } from '@/lib/arMotionContext';

const EYE_HEIGHT = 1.55;
const STAND_POS = new THREE.Vector3(0, EYE_HEIGHT, 0.8);
const BASE_FOV = 60;
const ZOOM_START_FOV = 72; // wider fov → zooms in to BASE_FOV over 1s (reveal effect)

interface ARMotionCameraProps {
  active: boolean;
}

/**
 * Passthrough AR: live camera + head tracking (gyro / drag), full screen.
 *
 * Improvements:
 *  - Cinematic FOV zoom-in on first mount (ZOOM_START_FOV → BASE_FOV, 1 s)
 *  - Inertia: smoothQuat slerp stays at 0.12 for damped cinematic feel
 *  - Video texture rendered behind all 3D content
 */
export function ARMotionCamera({ active }: ARMotionCameraProps) {
  const { camera } = useThree();
  const { step, resetOrientation } = useARMotion();
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const [ready, setReady] = useState(false);

  const initialized = useRef(false);
  const standOffset = useRef(new THREE.Vector3());
  const zoomStartRef = useRef(-1);
  const didZoomRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setReady(false);
      initialized.current = false;
      didZoomRef.current = false;
      zoomStartRef.current = -1;
      return;
    }

    const video = document.createElement('video');
    video.playsInline = true;
    video.muted = true;
    video.autoplay = true;
    video.setAttribute('playsinline', '');
    video.style.display = 'none';
    document.body.appendChild(video);

    const startCamera = async () => {
      const tryStream = async (facing: 'environment' | 'user') => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        video.srcObject = stream;
        await video.play();
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        textureRef.current = texture;
        setReady(true);
      };
      try {
        await tryStream('environment');
      } catch {
        try {
          await tryStream('user');
        } catch (err) {
          console.warn('AR camera failed:', err);
        }
      }
    };

    if (navigator.mediaDevices) {
      startCamera();
    }

    resetOrientation();

    return () => {
      if (video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
      textureRef.current?.dispose();
      textureRef.current = null;
      video.remove();
      setReady(false);
    };
  }, [active, resetOrientation]);

  useFrame((state) => {
    if (!active) return;

    const cam = camera as THREE.PerspectiveCamera;

    if (!initialized.current) {
      cam.position.copy(STAND_POS);
      cam.lookAt(0, EYE_HEIGHT - 0.2, -2);
      initialized.current = true;
    }

    // === CINEMATIC ZOOM-IN — fires once when camera feed is ready ===
    if (ready && !didZoomRef.current) {
      didZoomRef.current = true;
      zoomStartRef.current = state.clock.getElapsedTime();
      cam.fov = ZOOM_START_FOV;
      cam.updateProjectionMatrix();
    }

    if (didZoomRef.current && zoomStartRef.current >= 0) {
      const elapsed = state.clock.getElapsedTime() - zoomStartRef.current;
      if (elapsed < 1.0) {
        // easeOutCubic — smooth settle into BASE_FOV
        const t = elapsed / 1.0;
        const ease = 1 - Math.pow(1 - t, 3);
        cam.fov = ZOOM_START_FOV + (BASE_FOV - ZOOM_START_FOV) * ease;
        cam.updateProjectionMatrix();
      } else if (cam.fov !== BASE_FOV) {
        cam.fov = BASE_FOV;
        cam.updateProjectionMatrix();
        zoomStartRef.current = -1; // done
      }
    }

    // === HEAD TRACKING — damped slerp (0.12 = cinematic inertia) ===
    const headQuat = step(0.12);
    standOffset.current.copy(STAND_POS);
    standOffset.current.applyQuaternion(headQuat);
    cam.position.copy(standOffset.current);

    const lookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(headQuat);
    cam.lookAt(cam.position.clone().add(lookDir));

    if (!meshRef.current || !ready || !textureRef.current) return;

    const distance = 50;
    const vFov = (cam.fov * Math.PI) / 180;
    const planeHeight = 2 * Math.tan(vFov / 2) * distance;
    const planeWidth = planeHeight * cam.aspect;

    meshRef.current.scale.set(planeWidth, planeHeight, 1);
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    meshRef.current.position.copy(cam.position).add(dir.multiplyScalar(distance));
    meshRef.current.quaternion.copy(cam.quaternion);
    textureRef.current.needsUpdate = true;
  });

  if (!active || !ready) return null;

  return (
    <mesh ref={meshRef} renderOrder={-1000} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={textureRef.current}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}
