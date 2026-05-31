import { useState, useCallback, useRef } from 'react';
import { LEGACY_FLOOR_Y, suggestCamera, type GroundMeasureInfo } from '@/lib/sceneGround';

export type { GroundMeasureInfo };

/**
 * Per-scene floor height from the environment GLB bounding box.
 * Converts legacy positions (authored at LEGACY_FLOOR_Y) to the measured floor.
 */
export function useSceneGround() {
  const [groundY, setGroundY] = useState(LEGACY_FLOOR_Y);
  const measuredRef = useRef(false);

  const onMeasure = useCallback((info: GroundMeasureInfo) => {
    if (measuredRef.current) return;
    measuredRef.current = true;
    setGroundY(info.groundY);
  }, []);

  /** Map [x, legacyY, z] authored against LEGACY_FLOOR_Y → world position on real floor */
  const pos = useCallback(
    (x: number, legacyY: number, z: number): [number, number, number] => [
      x,
      groundY + (legacyY - LEGACY_FLOOR_Y),
      z,
    ],
    [groundY],
  );

  /** Character / object standing on the floor */
  const foot = useCallback(
    (x: number, z: number): [number, number, number] => pos(x, LEGACY_FLOOR_Y, z),
    [pos],
  );

  /** Height above the measured floor (e.g. ball radius, table height) */
  const above = useCallback((height: number) => groundY + height, [groundY]);

  /** Snap obstacle center Y from legacy floor to measured floor */
  const obstacle = useCallback(
    (center: [number, number, number], size: [number, number, number], padding?: number) => ({
      center: pos(center[0], center[1], center[2]) as [number, number, number],
      size,
      padding,
    }),
    [pos],
  );

  /**
   * First env measurement — optionally re-frame camera & preserve Vimo offset from floor.
   */
  const applyMeasure = useCallback(
    (
      info: GroundMeasureInfo,
      opts?: {
        setCamPos?: (p: [number, number, number]) => void;
        setCamLookAt?: (p: [number, number, number]) => void;
        setVimoPos?: React.Dispatch<React.SetStateAction<[number, number, number]>>;
      },
    ) => {
      if (measuredRef.current) return;
      measuredRef.current = true;
      const gy = info.groundY;
      setGroundY(gy);
      const cam = suggestCamera(info);
      opts?.setCamPos?.(cam.position);
      opts?.setCamLookAt?.(cam.lookAt);
      opts?.setVimoPos?.((p) => [p[0], gy + (p[1] - LEGACY_FLOOR_Y), p[2]]);
    },
    [],
  );

  return {
    groundY,
    ready: measuredRef.current,
    onMeasure,
    applyMeasure,
    pos,
    foot,
    above,
    obstacle,
  };
}
