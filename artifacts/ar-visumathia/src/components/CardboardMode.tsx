import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * CardboardStereo — AR glasses simulation.
 * 
 * Controls:
 * - Gyroscope (if available): tilt device to orbit around scene
 * - Touch drag (fallback): swipe on screen to orbit
 * - Both work simultaneously
 * 
 * Camera orbits around scene center. Tilt/drag = change viewing angle.
 */

const IPD = 0.06;
const ORBIT_RADIUS = 4;
const LOOK_CENTER = new THREE.Vector3(0, -0.5, 0);

export function CardboardStereo({ active }: { active: boolean }) {
  const { gl, camera, scene, size } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const centerVec = useRef(new THREE.Vector2(0, 0));
  
  // Orbit angles (in radians) — target and smoothed
  const yawTarget = useRef(0);
  const pitchTarget = useRef(0.3);
  const yawSmooth = useRef(0);
  const pitchSmooth = useRef(0.3);
  
  // Gyroscope
  const hasGyro = useRef(false);
  const baseGamma = useRef<number | null>(null);
  const baseBeta = useRef<number | null>(null);

  // Touch drag
  const touchStart = useRef({ x: 0, y: 0 });
  const touchYawStart = useRef(0);
  const touchPitchStart = useRef(0);

  // Gaze-dwell: DISABLED — was causing auto-clicks without user intent
  // Single-tap interaction is sufficient

  useEffect(() => {
    if (!active) {
      gl.setScissorTest(false);
      gl.setViewport(0, 0, size.width, size.height);
      gl.autoClear = true;
      baseGamma.current = null;
      baseBeta.current = null;
      return;
    }

    // Gyroscope handler — sets target, smoothing happens in useFrame
    const gyroHandler = (e: DeviceOrientationEvent) => {
      if (e.gamma === null && e.beta === null) return;
      hasGyro.current = true;
      const g = e.gamma ?? 0;
      const b = e.beta ?? 0;
      if (baseGamma.current === null) {
        baseGamma.current = g;
        baseBeta.current = b;
      }
      const dg = (g - baseGamma.current!) * 0.025;
      const db = (b - baseBeta.current!) * 0.015;
      yawTarget.current = THREE.MathUtils.clamp(dg, -Math.PI / 2, Math.PI / 2);
      pitchTarget.current = THREE.MathUtils.clamp(0.3 + db, -0.2, Math.PI / 3);
    };

    // Touch handlers (fallback + supplement)
    const onTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchYawStart.current = yawTarget.current;
      touchPitchStart.current = pitchTarget.current;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      yawTarget.current = THREE.MathUtils.clamp(
        touchYawStart.current - dx * 0.005,
        -Math.PI / 2, Math.PI / 2
      );
      pitchTarget.current = THREE.MathUtils.clamp(
        touchPitchStart.current + dy * 0.003,
        -0.2, Math.PI / 3
      );
    };

    // Mouse drag (for desktop testing)
    let mouseDown = false;
    const onMouseDown = (e: MouseEvent) => {
      mouseDown = true;
      touchStart.current = { x: e.clientX, y: e.clientY };
      touchYawStart.current = yawTarget.current;
      touchPitchStart.current = pitchTarget.current;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return;
      const dx = e.clientX - touchStart.current.x;
      const dy = e.clientY - touchStart.current.y;
      yawTarget.current = THREE.MathUtils.clamp(
        touchYawStart.current - dx * 0.005,
        -Math.PI / 2, Math.PI / 2
      );
      pitchTarget.current = THREE.MathUtils.clamp(
        touchPitchStart.current + dy * 0.003,
        -0.2, Math.PI / 3
      );
    };
    const onMouseUp = () => { mouseDown = false; };

    // Setup gyroscope
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission().then((s: string) => {
        if (s === 'granted') window.addEventListener('deviceorientation', gyroHandler, true);
      });
    } else {
      window.addEventListener('deviceorientation', gyroHandler, true);
    }

    // Setup touch/mouse
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Gaze-tap: raycast from camera center to interact with objects
    const onGazeTap = () => {
      raycaster.current.setFromCamera(centerVec.current, camera);
      const hits = raycaster.current.intersectObjects(scene.children, true);
      for (const hit of hits) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          const r3f = (obj as any).__r3f;
          if (r3f?.eventCount > 0 || (obj as any).onClick) {
            // Check onClick, onPointerDown, and onPointerUp handlers
            const clickHandler =
              r3f?.handlers?.onClick ||
              r3f?.handlers?.onPointerDown ||
              r3f?.handlers?.onPointerUp ||
              (obj as any).onClick;
            if (clickHandler) {
              clickHandler({ stopPropagation: () => {}, object: hit.object, point: hit.point });
              return;
            }
          }
          obj = obj.parent;
        }
      }
    };

    // Single-tap with distance threshold (distinguishes tap from drag)
    const TAP_DISTANCE_THRESHOLD = 15; // pixels
    let tapStartPos = { x: 0, y: 0 };
    let tapStartTime = 0;

    const onTapStart = (e: TouchEvent) => {
      tapStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      tapStartTime = Date.now();
    };

    const onTapEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - tapStartPos.x;
      const dy = touch.clientY - tapStartPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = Date.now() - tapStartTime;

      // If finger barely moved and tap was quick, it's a tap (not a drag)
      if (dist < TAP_DISTANCE_THRESHOLD && elapsed < 500) {
        onGazeTap();
      }
    };

    // Mouse click for desktop testing
    const onMouseClick = (e: MouseEvent) => {
      const dx = e.clientX - touchStart.current.x;
      const dy = e.clientY - touchStart.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < TAP_DISTANCE_THRESHOLD) {
        onGazeTap();
      }
    };

    window.addEventListener('touchstart', onTapStart, { passive: true });
    window.addEventListener('touchend', onTapEnd, { passive: true });
    window.addEventListener('click', onMouseClick);

    return () => {
      window.removeEventListener('deviceorientation', gyroHandler, true);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTapStart);
      window.removeEventListener('touchend', onTapEnd);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('click', onMouseClick);
      baseGamma.current = null;
      baseBeta.current = null;
    };
  }, [active, gl, size]);

  useFrame(() => {
    if (!active) return;

    const cam = camera as THREE.PerspectiveCamera;
    const halfW = Math.floor(size.width / 2);
    const h = size.height;

    // Smooth interpolation (lerp) for buttery movement
    const lerpFactor = 0.12;
    yawSmooth.current += (yawTarget.current - yawSmooth.current) * lerpFactor;
    pitchSmooth.current += (pitchTarget.current - pitchSmooth.current) * lerpFactor;

    const yaw = yawSmooth.current;
    const pitch = pitchSmooth.current;

    const cx = Math.sin(yaw) * ORBIT_RADIUS;
    const cy = 1.2 + Math.sin(pitch) * 3;
    const cz = Math.cos(yaw) * ORBIT_RADIUS;

    cam.position.set(cx, cy, cz);
    cam.lookAt(LOOK_CENTER);
    cam.aspect = halfW / h;
    cam.updateProjectionMatrix();

    // Stereo render
    gl.autoClear = false;
    gl.clear();
    gl.setScissorTest(true);

    const origX = cam.position.x;

    // Left eye
    gl.setViewport(0, 0, halfW, h);
    gl.setScissor(0, 0, halfW, h);
    cam.position.x = origX - IPD / 2;
    gl.render(scene, cam);

    // Right eye  
    gl.setViewport(halfW, 0, halfW, h);
    gl.setScissor(halfW, 0, halfW, h);
    cam.position.x = origX + IPD / 2;
    gl.render(scene, cam);

    cam.position.x = origX;
    gl.setScissorTest(false);
  }, active ? 1 : 0);

  useEffect(() => {
    gl.autoClear = !active;
  }, [active, gl]);

  return null;
}

export function CardboardOverlay({ active, onExit }: { active: boolean; onExit: () => void }) {
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: '#222', transform: 'translateX(-50%)' }} />
      {/* Crosshair — center of each eye */}
      <div style={{ position: 'absolute', left: '25%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.7)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 4, height: 4, background: '#fff', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>
      <div style={{ position: 'absolute', left: '75%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.7)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 4, height: 4, background: '#fff', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>
      <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', padding: '3px 10px', background: 'rgba(0,0,0,0.5)', borderRadius: 9999, color: '#fff', fontFamily: "'Fredoka One', cursive", fontSize: 10, pointerEvents: 'none' }}>
        🥽 Arahkan ke objek, ketuk untuk interaksi
      </div>
      <button
        onClick={onExit}
        style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.4)',
          color: '#fff', fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >✕</button>
    </div>
  );
}
