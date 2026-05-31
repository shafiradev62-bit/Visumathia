import { useEffect, useState, type ComponentType } from 'react';
import { loadSceneComponent, preloadSceneAssets, type SceneComponentProps } from '@/lib/sceneRegistry';

interface LazySceneProps extends SceneComponentProps {
  sceneId: number;
}

/**
 * Loads one scene chunk + GLBs for that scene only (not all 10 at once).
 */
export function LazyScene({ sceneId, onComplete }: LazySceneProps) {
  const [Scene, setScene] = useState<ComponentType<SceneComponentProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setScene(null);
    preloadSceneAssets(sceneId);
    loadSceneComponent(sceneId).then((Comp) => {
      if (!cancelled) setScene(() => Comp);
    });
    return () => {
      cancelled = true;
    };
  }, [sceneId]);

  if (!Scene) return null;
  return <Scene onComplete={onComplete} />;
}
