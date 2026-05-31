/**
 * Per-scene obstacle definitions for character collision avoidance.
 * Each obstacle is an axis-aligned bounding box in world space (Y is height).
 * Vimo will route AROUND these instead of clipping through them.
 */

export interface Obstacle {
  /** Center position [x, y, z] */
  center: [number, number, number];
  /** Half-extents [x, y, z] — distances from center to box edge */
  size: [number, number, number];
  /** Optional padding added around the box for safety */
  padding?: number;
}

/** Per-scene obstacle lists. Indexed by scene ID. */
export const SCENE_OBSTACLES: Record<number, Obstacle[]> = {
  // Scene 1 — Cloister Garden (open courtyard, minimal obstacles)
  1: [
    // Garden pillars (rough)
    { center: [-2.5, 0, -1], size: [0.3, 1.5, 0.3], padding: 0.3 },
    { center: [2.5, 0, -1], size: [0.3, 1.5, 0.3], padding: 0.3 },
  ],

  // Scene 2 — Bedroom (bed, table, shelf)
  2: [
    // Bed (left side)
    { center: [-0.5, -0.6, -1], size: [1.0, 0.4, 0.8], padding: 0.25 },
    // Desk/table (right side)
    { center: [1.0, -0.6, 0.5], size: [0.6, 0.5, 0.4], padding: 0.25 },
    // Shelf (back left)
    { center: [-2.0, -0.4, -0.2], size: [0.4, 0.8, 0.4], padding: 0.25 },
  ],

  // Scene 3 — Playground (play structure, fences)
  3: [
    // Play structure center
    { center: [0, -0.5, -1], size: [1.5, 0.8, 1.0], padding: 0.3 },
    // Left fence
    { center: [-3.5, -0.5, 1.5], size: [0.2, 0.6, 1.0], padding: 0.2 },
    // Right fence
    { center: [3.5, -0.5, 1.5], size: [0.2, 0.6, 1.0], padding: 0.2 },
  ],

  // Scene 4 — Kitchen (counter with fruits is the main obstacle)
  4: [
    // Kitchen counter — Vimo can't walk through it
    { center: [0.7, -0.7, 1.0], size: [0.6, 0.5, 1.5], padding: 0.3 },
    // Stove area
    { center: [-1.0, -0.6, 0.5], size: [0.5, 0.5, 0.5], padding: 0.25 },
  ],

  // Scene 5 — Classroom (desks, chalkboard)
  5: [
    // Teacher's desk
    { center: [0, -0.6, -1], size: [0.8, 0.4, 0.5], padding: 0.25 },
    // Student desks
    { center: [-1.2, -0.6, 1], size: [0.4, 0.4, 0.4], padding: 0.2 },
    { center: [1.2, -0.6, 1], size: [0.4, 0.4, 0.4], padding: 0.2 },
  ],

  // Scene 6 — Mini Market (shelves)
  6: [
    // Center shelf
    { center: [0, -0.4, -1.5], size: [1.5, 0.7, 0.4], padding: 0.3 },
    // Side shelves
    { center: [-1.8, -0.4, -0.5], size: [0.3, 0.7, 0.8], padding: 0.25 },
    { center: [1.8, -0.4, -0.5], size: [0.3, 0.7, 0.8], padding: 0.25 },
  ],

  // Scene 7 — City Road (no obstacles in path; lanes are open)
  7: [],

  // Scene 8 — Construction (buildings, vehicles are the obstacles)
  8: [
    { center: [-6, -0.5, -6], size: [1.5, 2, 1.5], padding: 0.4 },
    { center: [6, -0.5, -6], size: [1.5, 2, 1.5], padding: 0.4 },
    { center: [3, -0.5, -2], size: [0.8, 0.5, 1.2], padding: 0.3 },
    { center: [-3, -0.5, -4], size: [0.8, 1.2, 0.8], padding: 0.3 },
    { center: [-1.5, -0.5, 0], size: [0.4, 0.6, 0.4], padding: 0.2 },
  ],

  // Scene 9 — Video AR (TV is far away; floor is open)
  9: [
    { center: [0, 0, -1], size: [0.8, 1.2, 0.4], padding: 0.3 },
  ],

  // Scene 10 — Final Mission (concert / cloister) — minimal
  10: [
    { center: [-2, -0.5, -1], size: [0.3, 1.0, 0.3], padding: 0.3 },
    { center: [2, -0.5, -1], size: [0.3, 1.0, 0.3], padding: 0.3 },
  ],
};

/**
 * Check if a 2D point (x, z — ground plane) is inside any obstacle box.
 * Y is ignored since the character walks on the ground.
 */
export function isInsideObstacle(x: number, z: number, obstacles: Obstacle[]): boolean {
  for (const obs of obstacles) {
    const pad = obs.padding ?? 0;
    const dx = Math.abs(x - obs.center[0]);
    const dz = Math.abs(z - obs.center[2]);
    if (dx < obs.size[0] + pad && dz < obs.size[2] + pad) {
      return true;
    }
  }
  return false;
}

/**
 * Push a point OUT of any obstacle it's inside.
 * Returns the corrected (x, z) position outside all obstacle boxes.
 * Used each frame to prevent character from clipping into walls/furniture.
 */
export function pushOutOfObstacles(
  x: number,
  z: number,
  obstacles: Obstacle[]
): [number, number] {
  let outX = x;
  let outZ = z;

  for (const obs of obstacles) {
    const pad = obs.padding ?? 0;
    const halfX = obs.size[0] + pad;
    const halfZ = obs.size[2] + pad;
    const dx = outX - obs.center[0];
    const dz = outZ - obs.center[2];

    if (Math.abs(dx) < halfX && Math.abs(dz) < halfZ) {
      // Inside the box — push out along the shorter axis
      const overlapX = halfX - Math.abs(dx);
      const overlapZ = halfZ - Math.abs(dz);

      if (overlapX < overlapZ) {
        outX = obs.center[0] + Math.sign(dx || 1) * halfX;
      } else {
        outZ = obs.center[2] + Math.sign(dz || 1) * halfZ;
      }
    }
  }

  return [outX, outZ];
}
