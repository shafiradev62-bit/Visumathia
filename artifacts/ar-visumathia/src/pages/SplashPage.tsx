import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { prefetchSceneRoute } from '@/lib/sceneRegistry';

export function SplashPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Defer heavy prefetching until after first paint using requestIdleCallback
    const schedule = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    const id = schedule(() => {
      prefetchSceneRoute(1);
      prefetchSceneRoute(2);
    });

    // Defer audio import so it doesn't block first paint
    import('@/lib/audio').then((m) => m.playBgMusic());
    const t = setTimeout(() => setLocation('/story', { replace: true }), 1500);
    return () => {
      clearTimeout(t);
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
    };
  }, [setLocation]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundImage: 'url("/splash_night.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Optional overlay for better logo visibility */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        backgroundColor: 'rgba(0,0,0,0.3)',
        pointerEvents: 'none'
      }} />

      <img
        src="/logo.png"
        alt="AR-VisuMathia"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '55vmin',
          maxWidth: 420,
          height: 'auto',
          objectFit: 'contain',
          filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.5))',
        }}
      />
    </div>
  );
}
