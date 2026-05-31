import type { ComponentType } from 'react';

export type SceneComponentProps = {
  onComplete: (stars: number, score: number) => void;
};

/** GLB paths per scene — used to warm the cache before the scene chunk mounts */
export const SCENE_MODEL_PATHS: Record<number, string[]> = {
  1: ['/models/cloister-garden.glb'],
  2: ['/models/bedroom.glb'],
  3: ['/models/garden.glb', '/models/play-structure.glb', '/models/fence.glb'],
  4: ['/models/cozy-kitchen.glb'],
  5: ['/models/classroom.glb'],
  6: ['/models/market.glb'],
  7: ['/models/road.glb'],
  8: [
    '/models/bulldozer.glb',
    '/models/apartment-building.glb',
    '/models/crane.glb',
    '/models/construction-sign.glb',
    '/models/worker.glb',
  ],
  9: ['/models/tv.glb'],
  10: ['/models/cloister-garden.glb'],
};

const preloaded = new Set<string>();

/**
 * Dynamically imports useGLTF so that three.js / drei are NOT pulled
 * into the initial bundle — they only load when a scene is actually prefetched.
 */
export function preloadSceneAssets(sceneId: number) {
  const paths = SCENE_MODEL_PATHS[sceneId] ?? [];
  const toLoad = paths.filter((p) => !preloaded.has(p));
  if (toLoad.length === 0) return;

  import('@react-three/drei').then(({ useGLTF }) => {
    for (const path of toLoad) {
      preloaded.add(path);
      useGLTF.preload(path);
    }
  });
}

/** Lazy scene chunks — only the active scene is downloaded */
export const loadSceneComponent = (
  sceneId: number,
): Promise<ComponentType<SceneComponentProps>> => {
  switch (sceneId) {
    case 1:
      return import('@/scenes/Scene1_IntroPortal').then((m) => m.Scene1_IntroPortal);
    case 2:
      return import('@/scenes/Scene2_Bedroom').then((m) => m.Scene2_Bedroom);
    case 3:
      return import('@/scenes/Scene3_Playground').then((m) => m.Scene3_Playground);
    case 4:
      return import('@/scenes/Scene4_Kitchen').then((m) => m.Scene4_Kitchen);
    case 5:
      return import('@/scenes/Scene5_Classroom').then((m) => m.Scene5_Classroom);
    case 6:
      return import('@/scenes/Scene6_MiniMarket').then((m) => m.Scene6_MiniMarket);
    case 7:
      return import('@/scenes/Scene7_RoadCity').then((m) => m.Scene7_RoadCity);
    case 8:
      return import('@/scenes/Scene8_ToyConstruction').then((m) => m.Scene8_ToyConstruction);
    case 9:
      return import('@/scenes/Scene9_VideoAR').then((m) => m.Scene9_VideoAR);
    case 10:
      return import('@/scenes/Scene10_FinalMission').then((m) => m.Scene10_FinalMission);
    default:
      return import('@/scenes/Scene1_IntroPortal').then((m) => m.Scene1_IntroPortal);
  }
};

/** Warm next route while user is on home / story */
export function prefetchSceneRoute(sceneId: number) {
  preloadSceneAssets(sceneId);
  void loadSceneComponent(sceneId);
}
