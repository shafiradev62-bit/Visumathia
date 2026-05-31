import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AR Camera Background — renders device camera as background plane in 3D scene.
 * Works on HTTPS or localhost. Falls back gracefully on HTTP.
 */
export function ARCameraPlane() {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = document.createElement('video');
    video.playsInline = true;
    video.muted = true;
    video.autoplay = true;
    video.setAttribute('playsinline', '');
    video.style.display = 'none';
    document.body.appendChild(video);

    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    if (!isSecure || !navigator.mediaDevices?.getUserMedia) {
      // Not secure context — try anyway on mobile (some browsers allow it)
      // If fails, we just show black
      console.warn('Camera requires HTTPS. Trying anyway...');
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        video.srcObject = stream;
        await video.play();

        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        textureRef.current = texture;
        setReady(true);
      } catch (err) {
        console.warn('Camera failed:', err);
        // Fallback: try front camera
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          video.srcObject = stream;
          await video.play();

          const texture = new THREE.VideoTexture(video);
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.colorSpace = THREE.SRGBColorSpace;
          textureRef.current = texture;
          setReady(true);
        } catch (err2) {
          console.warn('All cameras failed:', err2);
        }
      }
    };

    if (navigator.mediaDevices) {
      startCamera();
    }

    return () => {
      if (video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      if (textureRef.current) textureRef.current.dispose();
      video.remove();
    };
  }, []);

  useFrame(() => {
    if (!meshRef.current || !ready || !textureRef.current) return;

    const cam = camera as THREE.PerspectiveCamera;
    const distance = 50; // Far enough to be behind everything
    const vFov = (cam.fov * Math.PI) / 180;
    const planeHeight = 2 * Math.tan(vFov / 2) * distance;
    const planeWidth = planeHeight * cam.aspect;

    meshRef.current.scale.set(planeWidth, planeHeight, 1);

    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    meshRef.current.position.copy(cam.position).add(dir.multiplyScalar(distance));
    meshRef.current.lookAt(cam.position);

    textureRef.current.needsUpdate = true;
  });

  if (!ready) return null;

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
