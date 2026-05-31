import * as THREE from 'three';

/**
 * Per-scene ground level + camera framing — measured once from the actual
 * GLB bounding box at load time so we never hardcode magic Y numbers.
 *
 * Usage:
 *   1. Load env GLB.
 *   2. Call `measureGround(gltfScene, scaleApplied, scenePosition)` to get the
 *      actual world-space ground Y.
 *   3. Use the returned y to position characters and objects on the floor.
 */

/** Y value used when authoring scene positions before measurement */
export const LEGACY_FLOOR_Y = -1.2;

export interface GroundMeasureInfo {
  groundY: number;
  topY: number;
  centerXZ: [number, number];
}

export interface GroundInfo extends GroundMeasureInfo {
  /** Bounding box for placement queries */
  box: THREE.Box3;
}

/** Convert a legacy [x,y,z] position to sit on the measured floor */
export function toGroundPos(
  groundY: number,
  x: number,
  legacyY: number,
  z: number,
): [number, number, number] {
  return [x, groundY + (legacyY - LEGACY_FLOOR_Y), z];
}

export function measureGround(
  rootObject: THREE.Object3D,
  scale: number,
  position: [number, number, number] = [0, 0, 0],
): GroundInfo {
  // Apply transform temporarily to measure world-space box
  const original = rootObject.parent;
  const wrapper = new THREE.Group();
  wrapper.scale.setScalar(scale);
  wrapper.position.set(...position);
  wrapper.add(rootObject);

  rootObject.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(rootObject);

  // Detach so caller can re-parent
  wrapper.remove(rootObject);
  if (original) original.add(rootObject);

  return {
    groundY: box.min.y,
    topY: box.max.y,
    centerXZ: [(box.min.x + box.max.x) / 2, (box.min.z + box.max.z) / 2],
    box,
  };
}

/**
 * Per-character foot offset — the Y inside the character GLB where the
 * feet meet the model origin. Adding this to (groundY) places the
 * character so its feet touch the floor.
 *
 * Measured by inspecting the GLB models. Origin is usually at hip/torso,
 * so feet are below origin → offset is positive (we add to groundY).
 */
export const CHAR_FEET_OFFSET: Record<string, number> = {
  // girl models — origin near hip, scale 0.8
  'jalan': 0.0,
  'langkah': 0.0,
  'dadah': 0.0,
  'hai': 0.0,
  // boy
  'boy': 0.0,
};

export function getCharacterY(modelKey: string, groundY: number, charScale = 0.8): number {
  // Default: place feet exactly on ground.
  // The GLB origin is at the model's natural origin, which is typically
  // either the feet (good — y = groundY) or the hip (we'd need offset).
  // We expose this so each scene/model can adjust.
  const offset = CHAR_FEET_OFFSET[modelKey] ?? 0;
  void charScale;
  return groundY + offset;
}

/**
 * Camera framing helper — given a measured ground info, produce a sensible
 * cinematic camera position + look target that frames the floor area.
 */
export function suggestCamera(g: GroundMeasureInfo): {
  position: [number, number, number];
  lookAt: [number, number, number];
} {
  const [cx, cz] = g.centerXZ;
  // Shoulder-height camera, behind and slightly above
  const camHeight = g.groundY + 1.6;
  const camBack = 4.5;
  return {
    position: [cx + 0.4, camHeight, cz + camBack],
    lookAt: [cx, g.groundY + 0.4, cz - 0.5],
  };
}
