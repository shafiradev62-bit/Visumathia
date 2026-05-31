import { useARMotion } from '@/lib/arMotionContext';

interface Props {
  active: boolean;
}

export function ARMotionHint({ active }: Props) {
  const { permission, hasGyro } = useARMotion();

  if (!active || permission === 'needed') return null;

  return (
    <div
      className="fixed bottom-20 left-0 right-0 z-20 flex justify-center pointer-events-none px-4"
    >
      <p
        className="rounded-full px-4 py-2 text-xs text-white"
        style={{
          fontFamily: "'Fredoka One', cursive",
          background: 'rgba(0,0,0,0.45)',
        }}
      >
        {hasGyro
          ? '📱 Gerakkan HP — lihat sekeliling seperti kacamata AR'
          : '🖱️ Geser / drag layar untuk melihat sekeliling'}
      </p>
    </div>
  );
}
