import { useRef, useCallback } from 'react';

type SetPos = (pos: [number, number, number]) => void;
type SetAnim = (anim: string) => void;

interface AutoWalkOptions {
  /** Offset from target position where Vimo should stand (default [0.4, 0, 0.4]) */
  offset?: [number, number, number];
  /** Walk duration in ms before triggering onArrive (default 700) */
  walkDuration?: number;
}

/**
 * useAutoWalk — Unity-style "click object → character walks there → interact"
 * 
 * Usage in scene:
 *   const { walkTo } = useAutoWalk(setVimoPos, setVimoAnim, vimoPos);
 *   
 *   const handleTap = (targetPos) => {
 *     walkTo(targetPos, () => {
 *       // This runs after Vimo arrives
 *       playSfx('success');
 *       setVimoAnim('grab');
 *     });
 *   };
 */
export function useAutoWalk(
  setPos: SetPos,
  setAnim: SetAnim,
  currentPosRef: React.MutableRefObject<[number, number, number]>,
) {
  const walkTimeouts = useRef<NodeJS.Timeout[]>([]);
  const isWalking = useRef(false);

  const cleanup = useCallback(() => {
    walkTimeouts.current.forEach(clearTimeout);
    walkTimeouts.current = [];
    isWalking.current = false;
  }, []);

  /**
   * Walk Vimo to a position near the target, then call onArrive.
   * @param targetPos - The object/target world position
   * @param onArrive - Callback when Vimo reaches the destination
   * @param options - Walk configuration
   */
  const walkTo = useCallback((
    targetPos: [number, number, number],
    onArrive: () => void,
    options: AutoWalkOptions = {},
  ) => {
    const { offset = [0.4, 0, 0.4], walkDuration = 700 } = options;

    // Cancel any ongoing walk
    cleanup();
    isWalking.current = true;

    // Calculate destination: near the target but offset so Vimo doesn't overlap
    const dest: [number, number, number] = [
      targetPos[0] + offset[0],
      currentPosRef.current[1], // Keep same Y (ground level)
      targetPos[2] + offset[2],
    ];

    // Start walking
    setAnim('walk');
    setPos(dest);

    // Calculate walk time based on distance (min 400ms, max 1200ms)
    const dx = dest[0] - currentPosRef.current[0];
    const dz = dest[2] - currentPosRef.current[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    const dynamicDuration = Math.max(400, Math.min(1200, dist * 350));
    const finalDuration = walkDuration > 0 ? Math.max(walkDuration, dynamicDuration) : dynamicDuration;

    // After walk duration, trigger arrive callback
    const t = setTimeout(() => {
      isWalking.current = false;
      onArrive();
    }, finalDuration);
    walkTimeouts.current.push(t);
  }, [setPos, setAnim, currentPosRef, cleanup]);

  return { walkTo, cleanup, isWalking };
}
