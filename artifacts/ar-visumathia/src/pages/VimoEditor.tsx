import { useState, useRef, useCallback, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Vimo } from '@/components/Vimo';
import { SceneStage } from '@/components/SceneStage';

type SceneKey = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const SCENE_MODELS: Record<SceneKey, { path: string; label: string }> = {
  1: { path: '/models/cloister-garden.glb', label: 'Scene 1 — Portal Intro' },
  2: { path: '/models/bedroom.glb', label: 'Scene 2 — Kamar Anak' },
  3: { path: '/models/garden.glb', label: 'Scene 3 — Taman Bermain' },
  4: { path: '/models/cozy-kitchen.glb', label: 'Scene 4 — Dapur Ceria' },
  5: { path: '/models/classroom.glb', label: 'Scene 5 — Sekolahku' },
  6: { path: '/models/market.glb', label: 'Scene 6 — Pasar Mini' },
  7: { path: '/models/road.glb', label: 'Scene 7 — Jalan Raya' },
  8: { path: '/models/apartment-building.glb', label: 'Scene 8 — Rak Mainan' },
  9: { path: '/models/tv.glb', label: 'Scene 9 — Video AR' },
  10: { path: '/models/cloister-garden.glb', label: 'Scene 10 — Misi Akhir' },
};

const DEFAULT_POSITIONS: Record<SceneKey, [number, number, number]> = {
  1: [0, -1.2, 1.5],
  2: [1.2, -1.2, 1.5],
  3: [1.8, -0.3, 2.0],
  4: [1.5, -1.2, 2.5],
  5: [-1.5, -1.2, 2.8],
  6: [0.8, -1.2, 0.8],
  7: [0, -1.2, 3.5],
  8: [0, -1.2, 4.5],
  9: [1.8, -1.2, 2.2],
  10: [0, -1.2, 2.5],
};

function EnvironmentModel({ path }: { path: string }) {
  const { scene } = useGLTF(path);
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={2} position={[0, -1.2, 0]} />;
}

/** 
 * Draggable Vimo using screen-space mapping:
 * - Click & hold Vimo
 * - Drag left/right = move left/right
 * - Drag up/down = move forward/backward (Z axis)
 */
function DraggableVimo({ pos, scale: vimoScale, onMove, orbitRef }: {
  pos: [number, number, number];
  scale: number;
  onMove: (newPos: [number, number, number]) => void;
  orbitRef: React.RefObject<any>;
}) {
  const { camera, gl, size } = useThree();
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const currentPos = useRef<[number, number, number]>([...pos]);

  useEffect(() => {
    if (!isDragging.current) {
      currentPos.current = [...pos];
    }
  }, [pos]);

  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation();
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    currentPos.current = [...pos];
    if (orbitRef.current) orbitRef.current.enabled = false;
    gl.domElement.style.cursor = 'grabbing';
  }, [pos, gl, orbitRef]);

  useEffect(() => {
    const el = gl.domElement;

    const handleMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };

      // Sensitivity based on camera distance
      const camDist = camera.position.distanceTo(new THREE.Vector3(...currentPos.current));
      const sensitivity = camDist / size.width * 3;

      // Camera right vector (for left/right movement)
      const camRight = new THREE.Vector3();
      camera.getWorldDirection(camRight);
      camRight.crossVectors(camRight, camera.up).normalize();

      // Camera forward projected on ground (for up/down mouse = forward/backward)
      const camForward = new THREE.Vector3();
      camera.getWorldDirection(camForward);
      camForward.y = 0;
      camForward.normalize();
      // Negate so dragging mouse UP moves Vimo AWAY (forward into scene)
      camForward.negate();

      const newX = currentPos.current[0] + camRight.x * dx * sensitivity + camForward.x * dy * sensitivity;
      const newZ = currentPos.current[2] + camRight.z * dx * sensitivity + camForward.z * dy * sensitivity;

      currentPos.current = [parseFloat(newX.toFixed(2)), pos[1], parseFloat(newZ.toFixed(2))];
      onMove(currentPos.current);
    };

    const handleUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        if (orbitRef.current) orbitRef.current.enabled = true;
        gl.domElement.style.cursor = 'default';
      }
    };

    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerup', handleUp);
    window.addEventListener('pointerup', handleUp);

    return () => {
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [camera, gl, orbitRef, onMove, pos, size]);

  return (
    <group>
      {/* Invisible drag hitbox */}
      <mesh
        position={[pos[0], pos[1] + 0.6, pos[2]]}
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[1.5, 2.5, 1.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <Vimo position={pos} animation="wave" scale={vimoScale} />
      {/* Ground ring indicator */}
      <mesh position={[pos[0], pos[1] + 0.02, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.45, 24]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[pos[0], pos[1] + 0.01, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 24]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function SceneView({ sceneKey, vimoPos, vimoScale, onVimoMove, orbitRef }: {
  sceneKey: SceneKey;
  vimoPos: [number, number, number];
  vimoScale: number;
  onVimoMove: (pos: [number, number, number]) => void;
  orbitRef: React.RefObject<any>;
}) {
  const model = SCENE_MODELS[sceneKey];
  return (
    <>
      <SceneStage keyIntensity={1.4} />
      <Suspense fallback={null}>
        <EnvironmentModel path={model.path} />
      </Suspense>
      <gridHelper args={[10, 20, '#444', '#222']} position={[0, -1.2, 0]} />
      <DraggableVimo pos={vimoPos} scale={vimoScale} onMove={onVimoMove} orbitRef={orbitRef} />
      <OrbitControls ref={orbitRef} makeDefault />
    </>
  );
}

export function VimoEditor() {
  const [sceneKey, setSceneKey] = useState<SceneKey>(2);
  const [pos, setPos] = useState<[number, number, number]>(DEFAULT_POSITIONS[2]);
  const [scale, setScale] = useState(0.8);
  const [saved, setSaved] = useState(false);
  const [savedPositions, setSavedPositions] = useState<Record<number, { pos: [number, number, number]; scale: number }>>({});
  const orbitRef = useRef<any>(null);

  const handleSceneChange = (key: SceneKey) => {
    setSavedPositions(prev => ({ ...prev, [sceneKey]: { pos, scale } }));
    setSceneKey(key);
    const existing = savedPositions[key];
    if (existing) {
      setPos(existing.pos);
      setScale(existing.scale);
    } else {
      setPos(DEFAULT_POSITIONS[key]);
      setScale(0.8);
    }
  };

  const handleSave = () => {
    setSavedPositions(prev => ({ ...prev, [sceneKey]: { pos, scale } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopyAll = () => {
    const all = { ...savedPositions, [sceneKey]: { pos, scale } };
    const output = Object.entries(all)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([key, val]) => `Scene ${key}: [${val.pos.map(v => v.toFixed(1)).join(', ')}] scale=${val.scale}`)
      .join('\n');
    navigator.clipboard.writeText(output);
    alert('Posisi semua scene sudah di-copy ke clipboard!');
  };

  const handleVimoMove = useCallback((newPos: [number, number, number]) => {
    setPos(newPos);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      {/* Top bar */}
      <div style={{ padding: '10px 16px', background: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginRight: '8px' }}>🎮 Vimo Editor</span>
        {([1,2,3,4,5,6,7,8,9,10] as SceneKey[]).map(k => (
          <button
            key={k}
            onClick={() => handleSceneChange(k)}
            style={{
              padding: '5px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: k === sceneKey ? 700 : 400,
              background: k === sceneKey ? '#3b82f6' : savedPositions[k] ? '#22c55e' : '#334155', color: '#fff',
            }}
          >
            {k}
          </button>
        ))}
        <span style={{ color: '#94a3b8', fontSize: '11px', marginLeft: '12px' }}>{SCENE_MODELS[sceneKey].label}</span>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* 3D Canvas */}
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }} style={{ background: '#0f172a' }}>
          <SceneView
            key={sceneKey}
            sceneKey={sceneKey}
            vimoPos={pos}
            vimoScale={scale}
            onVimoMove={handleVimoMove}
            orbitRef={orbitRef}
          />
        </Canvas>

        {/* Bottom left — position display */}
        <div style={{
          position: 'absolute', bottom: '16px', left: '16px',
          background: 'rgba(15,23,42,0.92)', borderRadius: '10px', padding: '12px 16px',
          color: '#fff', fontFamily: 'monospace', fontSize: '13px',
        }}>
          <div style={{ marginBottom: '2px', color: '#64748b', fontSize: '9px', fontWeight: 700, letterSpacing: '1px' }}>POSISI</div>
          X: <span style={{ color: '#f87171' }}>{pos[0].toFixed(2)}</span>{' · '}
          Y: <span style={{ color: '#4ade80' }}>{pos[1].toFixed(2)}</span>{' · '}
          Z: <span style={{ color: '#60a5fa' }}>{pos[2].toFixed(2)}</span>
        </div>

        {/* Top right — Y + Scale */}
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'rgba(15,23,42,0.92)', borderRadius: '10px', padding: '12px 14px',
          color: '#fff', fontSize: '11px', width: '170px',
        }}>
          <div style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ color: '#94a3b8' }}>Tinggi (Y)</span>
              <span style={{ color: '#4ade80', fontFamily: 'monospace' }}>{pos[1].toFixed(1)}</span>
            </div>
            <input type="range" min={-3} max={1} step={0.1} value={pos[1]}
              onChange={e => setPos([pos[0], parseFloat(e.target.value), pos[2]])}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ color: '#94a3b8' }}>Scale</span>
              <span style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{scale.toFixed(2)}</span>
            </div>
            <input type="range" min={0.3} max={1.5} step={0.05} value={scale}
              onChange={e => setScale(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Bottom right — Save buttons */}
        <div style={{
          position: 'absolute', bottom: '16px', right: '16px',
          display: 'flex', gap: '8px',
        }}>
          <button
            onClick={() => { setPos(DEFAULT_POSITIONS[sceneKey]); setScale(0.8); }}
            style={{
              padding: '10px 16px', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer',
              fontSize: '12px', color: '#94a3b8', background: 'rgba(15,23,42,0.9)',
            }}
          >
            Reset
          </button>
          <button
            onClick={handleCopyAll}
            style={{
              padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, color: '#fff', background: '#6366f1',
            }}
          >
            📋 Copy
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 700, color: '#fff',
              background: saved ? '#22c55e' : '#3b82f6',
            }}
          >
            {saved ? '✓ SAVED' : '💾 SAVE'}
          </button>
        </div>

        {/* Instruction hint */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: 'rgba(15,23,42,0.85)', borderRadius: '8px', padding: '8px 12px',
          color: '#94a3b8', fontSize: '10px',
        }}>
          Klik & geser Vimo untuk pindahkan · Scroll untuk zoom · Right-click untuk rotate kamera
        </div>
      </div>
    </div>
  );
}

export default VimoEditor;
