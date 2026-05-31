import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';

export type ARMotionPermission = 'unknown' | 'needed' | 'granted' | 'denied';

/**
 * Head-tracking for passthrough AR: gyro on phone/tablet, drag on desktop/laptop.
 */
export function useDeviceMotionAR(active: boolean) {
  const [permission, setPermission] = useState<ARMotionPermission>('unknown');
  const [hasGyro, setHasGyro] = useState(false);

  const targetQuat = useRef(new THREE.Quaternion());
  const smoothQuat = useRef(new THREE.Quaternion());
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  const dragYaw = useRef(0);
  const dragPitch = useRef(0);
  const pointerStart = useRef({ x: 0, y: 0 });
  const dragYawStart = useRef(0);
  const dragPitchStart = useRef(0);
  const pointerDown = useRef(false);
  const listenersReady = useRef(false);

  const needsIOSPermission = useCallback(() => {
    return (
      typeof (DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      }).requestPermission === 'function'
    );
  }, []);

  const attachListeners = useCallback(() => {
    if (listenersReady.current) return;
    listenersReady.current = true;

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha == null || e.beta == null || e.gamma == null) return;
      setHasGyro(true);

      const alpha = THREE.MathUtils.degToRad(e.alpha);
      const beta = THREE.MathUtils.degToRad(e.beta);
      const gamma = THREE.MathUtils.degToRad(e.gamma);
      const orient =
        typeof window.orientation === 'number'
          ? THREE.MathUtils.degToRad(window.orientation)
          : 0;

      euler.current.set(beta, alpha - orient, -gamma, 'YXZ');
      targetQuat.current.setFromEuler(euler.current);
    };

    const onPointerDown = (clientX: number, clientY: number) => {
      pointerDown.current = true;
      pointerStart.current = { x: clientX, y: clientY };
      dragYawStart.current = dragYaw.current;
      dragPitchStart.current = dragPitch.current;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!pointerDown.current) return;
      const dx = clientX - pointerStart.current.x;
      const dy = clientY - pointerStart.current.y;
      dragYaw.current = dragYawStart.current - dx * 0.004;
      dragPitch.current = THREE.MathUtils.clamp(
        dragPitchStart.current + dy * 0.003,
        -Math.PI / 2 + 0.15,
        Math.PI / 2 - 0.15,
      );
      targetQuat.current.setFromEuler(
        new THREE.Euler(dragPitch.current, dragYaw.current, 0, 'YXZ'),
      );
    };

    const onPointerUp = () => {
      pointerDown.current = false;
    };

    const touchStart = (e: TouchEvent) => onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    const touchMove = (e: TouchEvent) => onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    const mouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      onPointerDown(e.clientX, e.clientY);
    };
    const mouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);

    window.addEventListener('deviceorientation', onOrientation, true);
    window.addEventListener('touchstart', touchStart, { passive: true });
    window.addEventListener('touchmove', touchMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', onPointerUp);

    return () => {
      listenersReady.current = false;
      window.removeEventListener('deviceorientation', onOrientation, true);
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', onPointerUp);
    };
  }, []);

  useEffect(() => {
    if (!active) {
      setPermission('unknown');
      setHasGyro(false);
      listenersReady.current = false;
      return;
    }
    setPermission(needsIOSPermission() ? 'needed' : 'granted');
  }, [active, needsIOSPermission]);

  useEffect(() => {
    if (!active || permission !== 'granted') return;
    return attachListeners();
  }, [active, permission, attachListeners]);

  const requestPermission = useCallback(async () => {
    const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof DOE.requestPermission === 'function') {
      try {
        const state = await DOE.requestPermission();
        const granted = state === 'granted';
        setPermission(granted ? 'granted' : 'denied');
        return granted;
      } catch {
        setPermission('denied');
        return false;
      }
    }
    setPermission('granted');
    return true;
  }, []);

  const step = useCallback((lerp = 0.14) => {
    smoothQuat.current.slerp(targetQuat.current, lerp);
    return smoothQuat.current;
  }, []);

  const resetOrientation = useCallback(() => {
    targetQuat.current.identity();
    smoothQuat.current.identity();
    dragYaw.current = 0;
    dragPitch.current = 0;
  }, []);

  return {
    permission,
    hasGyro,
    requestPermission,
    step,
    resetOrientation,
  };
}
