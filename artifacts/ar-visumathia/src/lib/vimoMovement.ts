/**
 * Vimo movement helper — makes Vimo JUMP over obstacles instead of phasing through them.
 * Sequence: current pos -> jump up -> arc to target -> land -> callback
 */

type SetPos = (pos: [number, number, number]) => void;
type SetAnim = (anim: string) => void;

interface MoveOptions {
  jumpHeight?: number;  // How high to jump (default 1.5)
  duration?: number;    // Total move time in ms (default 800)
  onLand?: () => void;  // Callback when landed
}

/**
 * Move Vimo from current position to target with a jump arc.
 * Returns array of timeouts to clear on unmount.
 */
export function moveVimoWithJump(
  currentPos: [number, number, number],
  targetPos: [number, number, number],
  setPos: SetPos,
  setAnim: SetAnim,
  options: MoveOptions = {}
): NodeJS.Timeout[] {
  const { jumpHeight = 1.5, duration = 800, onLand } = options;
  const timeouts: NodeJS.Timeout[] = [];

  // Phase 1: Jump animation starts
  setAnim('jump');

  // Phase 2: Arc movement (split into steps for smooth arc)
  const steps = 8;
  const stepTime = duration / steps;

  for (let i = 1; i <= steps; i++) {
    const t = timeouts.length;
    const progress = i / steps;
    
    // Parabolic arc: y goes up then down
    const arcY = jumpHeight * 4 * progress * (1 - progress); // peaks at 0.5
    
    // Linear interpolation for x and z
    const x = currentPos[0] + (targetPos[0] - currentPos[0]) * progress;
    const z = currentPos[2] + (targetPos[2] - currentPos[2]) * progress;
    // Y: start from current, arc up, land at target
    const y = currentPos[1] + (targetPos[1] - currentPos[1]) * progress + arcY;

    const timeout = setTimeout(() => {
      setPos([
        parseFloat(x.toFixed(3)),
        parseFloat(y.toFixed(3)),
        parseFloat(z.toFixed(3)),
      ]);
    }, i * stepTime);
    timeouts.push(timeout);
  }

  // Phase 3: Land at exact target position
  const landTimeout = setTimeout(() => {
    setPos(targetPos);
    setAnim('idle');
    if (onLand) onLand();
  }, duration + 50);
  timeouts.push(landTimeout);

  return timeouts;
}

/**
 * Hook-style helper for scenes.
 * Returns a moveVimo function that handles the jump arc.
 */
export function createVimoMover(
  getPos: () => [number, number, number],
  setPos: SetPos,
  setAnim: SetAnim,
) {
  let activeTimeouts: NodeJS.Timeout[] = [];

  return {
    moveTo: (target: [number, number, number], onLand?: () => void, jumpHeight = 1.5) => {
      // Clear any ongoing movement
      activeTimeouts.forEach(clearTimeout);
      activeTimeouts = moveVimoWithJump(getPos(), target, setPos, setAnim, {
        jumpHeight,
        onLand,
      });
    },
    cleanup: () => {
      activeTimeouts.forEach(clearTimeout);
    },
  };
}
