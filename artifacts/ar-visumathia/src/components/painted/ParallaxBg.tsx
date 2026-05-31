import { useEffect, useRef, useState } from 'react';
import { C, PaintedCloud, PaintedTree, PaintedFlower, PaintedGrassTuft } from './PaintedTextures';

/* ════════════════════════════════════════════════════════════════
   PARALLAX BACKGROUND — multi-layer sky/hills/trees that shift
   based on pointer position (mouse or touch). Gives depth feel.
   Layers move at different speeds (far = slow, near = fast).
══════════════════════════════════════════════════════════════════ */

export function ParallaxBg({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      // Normalize to -1..1
      const nx = (clientX - rect.left - cx) / cx;
      const ny = (clientY - rect.top - cy) / cy;
      setOffset({ x: nx, y: ny });
    };

    const onMouse = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  // Layer parallax multipliers (px shift)
  const skyShift = { x: offset.x * 4, y: offset.y * 2 };
  const cloudShift = { x: offset.x * 12, y: offset.y * 5 };
  const hillFarShift = { x: offset.x * 8, y: offset.y * 3 };
  const hillMidShift = { x: offset.x * 16, y: offset.y * 5 };
  const hillNearShift = { x: offset.x * 24, y: offset.y * 7 };
  const treeShift = { x: offset.x * 30, y: offset.y * 8 };
  const groundShift = { x: offset.x * 36, y: offset.y * 10 };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: C.skyTop,
      }}
    >
      {/* Sky — animated gradient cycling: morning → noon → sunset → twilight */}
      <style>{`
        @keyframes sky-1 { 0%,100%{opacity:1} 25%,75%{opacity:0} }
        @keyframes sky-2 { 0%,100%{opacity:0} 20%{opacity:0} 30%,50%{opacity:1} 60%{opacity:0} }
        @keyframes sky-3 { 0%,60%{opacity:0} 65%,80%{opacity:1} 90%,100%{opacity:0} }
        @keyframes sky-4 { 0%,80%{opacity:0} 85%,95%{opacity:1} 100%{opacity:0} }
      `}</style>
      {/* Layer 1: Morning (default) */}
      <div style={{ position:'absolute', inset:-20, background:'linear-gradient(180deg, #7ecce8 0%, #b0dff5 40%, #cfeaf3 70%, #f4dfae 100%)', animation:'sky-1 30s ease-in-out infinite', transform:`translate(${skyShift.x}px,${skyShift.y}px)`, transition:'transform 0.15s ease-out' }} />
      {/* Layer 2: Bright noon */}
      <div style={{ position:'absolute', inset:-20, background:'linear-gradient(180deg, #4db8e8 0%, #87daf5 35%, #d4f1ff 70%, #fff9e6 100%)', animation:'sky-2 30s ease-in-out infinite', transform:`translate(${skyShift.x}px,${skyShift.y}px)`, transition:'transform 0.15s ease-out' }} />
      {/* Layer 3: Sunset */}
      <div style={{ position:'absolute', inset:-20, background:'linear-gradient(180deg, #f7a360 0%, #fcc87a 30%, #fbe7c4 60%, #b0dff5 100%)', animation:'sky-3 30s ease-in-out infinite', transform:`translate(${skyShift.x}px,${skyShift.y}px)`, transition:'transform 0.15s ease-out' }} />
      {/* Layer 4: Twilight */}
      <div style={{ position:'absolute', inset:-20, background:'linear-gradient(180deg, #3d5a8a 0%, #6a7fb0 30%, #f7a360 60%, #fbd3a5 100%)', animation:'sky-4 30s ease-in-out infinite', transform:`translate(${skyShift.x}px,${skyShift.y}px)`, transition:'transform 0.15s ease-out' }} />

      {/* Sun — top right, clean position */}
      <div
        style={{
          position: 'absolute',
          top: '4%',
          right: '4%',
          transform: `translate(${offset.x * 6}px, ${offset.y * 3}px)`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
        }}
      >
        <svg width="90" height="90" viewBox="0 0 120 120">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={60 + Math.cos(a) * 38} y1={60 + Math.sin(a) * 38} x2={60 + Math.cos(a) * 52} y2={60 + Math.sin(a) * 52} stroke="#fcd34d" strokeWidth="6" strokeLinecap="round" />;
          })}
          <circle cx="60" cy="60" r="30" fill="#fcd34d" stroke={C.ink} strokeWidth="3" />
          <circle cx="50" cy="55" r="3" fill={C.ink} />
          <circle cx="70" cy="55" r="3" fill={C.ink} />
          <path d="M50 67 Q60 74 70 67" stroke={C.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="45" cy="63" r="4" fill="#f5a9c2" opacity="0.5" />
          <circle cx="75" cy="63" r="4" fill="#f5a9c2" opacity="0.5" />
        </svg>
      </div>

      {/* Rainbow — clean thick bands, no blur (performance), color-shifting */}
      <div
        style={{
          position: 'absolute',
          top: '-5%',
          left: '0%',
          width: '100%',
          height: '100%',
          transform: `translate(${offset.x * 5}px, ${offset.y * 3}px)`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
          animation: 'rainbow-hue 12s linear infinite',
          opacity: 0.55,
        }}
      >
        <style>{`
          @keyframes rainbow-hue { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        `}</style>
        <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
          {['#ff3366', '#ff6600', '#ffcc00', '#33cc66', '#3399ff', '#6633cc', '#cc33ff'].map((c, i) => (
            <path key={i} d={`M${-20 + i * 7} 600 A${460 - i * 15} ${440 - i * 15} 0 0 1 ${1020 - i * 7} 600`} fill="none" stroke={c} strokeWidth="12" strokeLinecap="round" />
          ))}
        </svg>
      </div>

      {/* Butterflies — evenly spaced in the mid-sky area */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${offset.x * 10}px, ${offset.y * 5}px)`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
          {[
            { x: 180, y: 320, c: '#f5a9c2' },
            { x: 1100, y: 300, c: '#a36adb' },
          ].map((b, i) => (
            <g key={i} transform={`translate(${b.x},${b.y})`}>
              <path d="M0 0 Q-10 -8 -5 -14 Q0 -10 0 0 Q0 -10 5 -14 Q10 -8 0 0 Z" fill={b.c} stroke={C.ink} strokeWidth="2" />
            </g>
          ))}
        </svg>
      </div>

      {/* Clouds layer — animated drifting + birds flying */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          transform: `translate(${cloudShift.x}px, ${cloudShift.y}px)`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
        }}
      >
        <style>{`
          @keyframes drift-slow { 0%{transform:translateX(0)} 100%{transform:translateX(80px)} }
          @keyframes drift-med { 0%{transform:translateX(0)} 100%{transform:translateX(120px)} }
          @keyframes drift-fast { 0%{transform:translateX(0)} 100%{transform:translateX(160px)} }
          @keyframes bird-fly { 0%{transform:translateX(-100px)} 100%{transform:translateX(1400px)} }
          @keyframes twinkle { 0%,100%{opacity:0.3;transform:scale(0.6)} 50%{opacity:1;transform:scale(1.3)} }
          @keyframes float-up { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes shooting-star { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(200px,80px) scale(0.3);opacity:0} }
          
          /* Falling petals atmospheric effect */
          @keyframes falling-petal {
            0% { transform: translate(0, -20px) rotate(0deg); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translate(100px, 800px) rotate(720deg); opacity: 0; }
          }
          @keyframes petal-sway {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(40px); }
          }
        `}</style>
        <svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
          {/* Falling Petals layer */}
          {Array.from({ length: 15 }).map((_, i) => (
            <g key={`petal-${i}`} style={{
              animation: `falling-petal ${10 + i * 2}s linear infinite`,
              animationDelay: `${i * 1.5}s`,
            }}>
              <g style={{ animation: `petal-sway ${3 + i * 0.5}s ease-in-out infinite` }}>
                <path
                  d="M0 0 C-5 -5 -10 -2 -10 5 C-10 12 -5 15 0 15 C5 15 10 12 10 5 C10 -2 5 -5 0 0"
                  fill={i % 2 === 0 ? "#f6c2d2" : "#fbd3e0"}
                  transform={`translate(${100 + i * 80}, 0) scale(${0.5 + (i % 3) * 0.2}) rotate(${i * 45})`}
                  opacity="0.6"
                />
              </g>
            </g>
          ))}

          {/* Drifting clouds — each moves at different speed */}
          <g style={{ animation: 'drift-slow 30s linear infinite' }}>
            <PaintedCloud x={80} y={80} scale={1.3} variant="c" />
          </g>
          <g style={{ animation: 'drift-med 25s linear infinite' }}>
            <PaintedCloud x={350} y={50} scale={1.5} variant="a" />
          </g>
          <g style={{ animation: 'drift-slow 35s linear infinite', animationDelay: '-10s' }}>
            <PaintedCloud x={650} y={110} scale={1.0} variant="b" />
          </g>
          <g style={{ animation: 'drift-fast 20s linear infinite' }}>
            <PaintedCloud x={950} y={60} scale={1.2} variant="c" />
          </g>
          <g style={{ animation: 'drift-med 28s linear infinite', animationDelay: '-5s' }}>
            <PaintedCloud x={200} y={190} scale={0.8} variant="b" />
          </g>
          <g style={{ animation: 'drift-slow 32s linear infinite', animationDelay: '-15s' }}>
            <PaintedCloud x={800} y={180} scale={0.9} variant="a" />
          </g>
          <g style={{ animation: 'drift-fast 22s linear infinite', animationDelay: '-8s' }}>
            <PaintedCloud x={1100} y={140} scale={0.7} variant="b" />
          </g>

          {/* Flying birds — animate across the sky continuously */}
          <g style={{ animation: 'bird-fly 12s linear infinite' }}>
            {[0, 20, 40].map((dx, i) => (
              <path key={i} d={`M${dx} 160 q5 -6 10 0 q5 -6 10 0`} stroke={C.ink} strokeWidth="2.5" fill="none" />
            ))}
          </g>
          <g style={{ animation: 'bird-fly 18s linear infinite', animationDelay: '-6s' }}>
            {[0, 18, 36, 54].map((dx, i) => (
              <path key={i} d={`M${dx} 100 q4 -5 8 0 q4 -5 8 0`} stroke={C.ink} strokeWidth="2" fill="none" opacity="0.7" />
            ))}
          </g>
          <g style={{ animation: 'bird-fly 15s linear infinite', animationDelay: '-3s' }}>
            {[0, 22].map((dx, i) => (
              <path key={i} d={`M${dx} 220 q5 -6 10 0 q5 -6 10 0`} stroke={C.ink} strokeWidth="2" fill="none" opacity="0.5" />
            ))}
          </g>

          {/* Twinkling stars — pulse in and out */}
          {[
            [150, 90], [320, 40], [500, 70], [680, 130], [850, 50], [1020, 100], [1180, 60], [440, 170], [760, 190], [1100, 180],
          ].map(([x, y], i) => (
            <g key={`st${i}`} transform={`translate(${x},${y})`} style={{ animation: `twinkle ${2 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}>
              <path d="M0 -6 L2 -2 L6 0 L2 2 L0 6 L-2 2 L-6 0 L-2 -2 Z" fill="#fff" stroke="#fff" strokeWidth="0.5" />
            </g>
          ))}

          {/* Occasional shooting star */}
          <g style={{ animation: 'shooting-star 4s ease-in infinite', animationDelay: '2s' }}>
            <circle cx="200" cy="60" r="3" fill="#fff" />
            <path d="M200 60 L190 56 L180 58" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </g>
          <g style={{ animation: 'shooting-star 6s ease-in infinite', animationDelay: '5s' }}>
            <circle cx="800" cy="40" r="2.5" fill="#fff" />
            <path d="M800 40 L790 36 L780 38" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </g>

          {/* Floating hot air balloon — drifts slowly */}
          <g style={{ animation: 'drift-slow 40s linear infinite, float-up 4s ease-in-out infinite' }}>
            <g transform="translate(600, 60)">
              {/* balloon body */}
              <ellipse cx="0" cy="0" rx="22" ry="28" fill="#e15a3b" stroke={C.ink} strokeWidth="2.5" />
              {/* stripes */}
              <path d="M-18 -8 Q0 -14 18 -8" stroke="#fcd34d" strokeWidth="5" fill="none" />
              <path d="M-20 6 Q0 0 20 6" stroke="#fff" strokeWidth="4" fill="none" opacity="0.6" />
              {/* basket */}
              <line x1="-8" y1="28" x2="-10" y2="40" stroke={C.ink} strokeWidth="1.5" />
              <line x1="8" y1="28" x2="10" y2="40" stroke={C.ink} strokeWidth="1.5" />
              <rect x="-12" y="40" width="24" height="14" rx="3" fill="#c69553" stroke={C.ink} strokeWidth="2" />
            </g>
          </g>
        </svg>
      </div>

      {/* Far hills — bright green with extra shading layer */}
      <div
        style={{
          position: 'absolute',
          inset: -30,
          top: '55%',
          transform: `translate(${hillFarShift.x}px, ${hillFarShift.y}px)`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 1400 400" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0 60 Q180 0 360 40 T720 20 T1080 50 T1400 30 L1400 400 L0 400 Z" fill="#9fc086" />
          {/* subtle hill texture lines */}
          <path d="M100 100 Q250 80 400 120" stroke="#8bad72" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M800 90 Q1000 70 1200 110" stroke="#8bad72" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M0 60 Q180 0 360 40 T720 20 T1080 50 T1400 30" stroke={C.ink} strokeWidth="3.2" fill="none" />
        </svg>
      </div>

      {/* Mid hills — vibrant green with shadow accents */}
      <div
        style={{
          position: 'absolute',
          inset: -30,
          top: '62%',
          transform: `translate(${hillMidShift.x}px, ${hillMidShift.y}px)`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 1400 400" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0 50 Q200 10 400 40 T800 20 T1400 45 L1400 400 L0 400 Z" fill="#6cb04d" />
          {/* inner hill shadow */}
          <path d="M0 150 Q300 100 600 160 T1200 130 L1400 200 L1400 400 L0 400 Z" fill="#5a9b3d" opacity="0.3" />
          <path d="M0 50 Q200 10 400 40 T800 20 T1400 45" stroke={C.ink} strokeWidth="3.2" fill="none" />
        </svg>
      </div>

      {/* Near hills — rich green with detailed edge highlights */}
      <div
        style={{
          position: 'absolute',
          inset: -30,
          top: '70%',
          transform: `translate(${hillNearShift.x}px, ${hillNearShift.y}px)`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 1400 400" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0 40 Q220 0 440 30 T880 10 T1400 35 L1400 400 L0 400 Z" fill="#4f8e34" />
          {/* detailed grass patches on the hill edge */}
          <g opacity="0.4">
            <path d="M100 45 L110 35 L120 45" stroke="#3a6824" strokeWidth="2.5" fill="none" />
            <path d="M400 35 L415 20 L430 35" stroke="#3a6824" strokeWidth="2.5" fill="none" />
            <path d="M900 25 L910 15 L920 25" stroke="#3a6824" strokeWidth="2.5" fill="none" />
          </g>
          <path d="M0 40 Q220 0 440 30 T880 10 T1400 35" stroke={C.ink} strokeWidth="3.5" fill="none" />
        </svg>
      </div>

      {/* Trees layer */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          top: '50%',
          transform: `translate(${treeShift.x}px, ${treeShift.y}px)`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 1280 400" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
          <PaintedTree x={100} y={200} scale={1.6} />
          <PaintedTree x={1160} y={210} scale={1.5} flip />
          <PaintedTree x={320} y={230} scale={1.0} />
          <PaintedTree x={960} y={220} scale={1.1} flip />
        </svg>
      </div>

      {/* Ground + grass + colorful flowers */}
      <div
        style={{
          position: 'absolute',
          inset: -40,
          top: '82%',
          transform: `translate(${groundShift.x}px, ${groundShift.y}px)`,
          transition: 'transform 0.15s ease-out',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 1280 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <PaintedGrassTuft key={i} x={20 + (i * 44) % 1280} y={35 + (i % 3) * 12} />
          ))}
          {/* Evenly spaced rainbow flowers */}
          {Array.from({ length: 12 }).map((_, i) => {
            const colors = ['#e15a3b', '#f5b942', '#fcd34d', '#7bb24a', '#4d9bc8', '#a36adb', '#f5a9c2', '#e07b39'];
            return <PaintedFlower key={i} x={60 + i * 100} y={55 + (i % 2) * 14} color={colors[i % colors.length]} scale={1} />;
          })}
        </svg>
      </div>
    </div>
  );
}
