import { useARMotion } from '@/lib/arMotionContext';

interface Props {
  active: boolean;
}

/** iOS: tap to allow gyroscope for head-tracked AR. */
export function ARPermissionPrompt({ active }: Props) {
  const { permission, requestPermission } = useARMotion();

  if (!active || permission !== 'needed') return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none"
      style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.55))' }}
    >
      <div
        className="pointer-events-auto w-full max-w-sm rounded-2xl p-4 text-center"
        style={{
          background: '#fffaf0',
          border: '3px solid #2D1B0E',
          boxShadow: '4px 5px 0 #2D1B0E',
        }}
      >
        <p
          className="mb-3 text-sm leading-snug"
          style={{ fontFamily: "'Fredoka One', cursive", color: '#2D1B0E' }}
        >
          AR nyata: gerakkan HP/laptop untuk melihat sekeliling. Izinkan sensor gerak dulu ya!
        </p>
        <button
          type="button"
          className="w-full rounded-xl py-3 text-sm font-bold text-white"
          style={{
            fontFamily: "'Fredoka One', cursive",
            background: '#2E86C1',
            border: '2px solid #2D1B0E',
            boxShadow: '2px 3px 0 #2D1B0E',
          }}
          onClick={() => requestPermission()}
        >
          Aktifkan AR & sensor
        </button>
      </div>
    </div>
  );
}
