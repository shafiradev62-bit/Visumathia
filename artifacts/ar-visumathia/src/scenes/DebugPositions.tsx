import { useState, useRef, useCallback, Suspense, useMemo } from 'react';
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ─── Model Components ───────────────────────────────────────────────────────

function BedroomModel() {
  const { scene } = useGLTF('/models/bedroom.glb');
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={2} position={[0, -1.2, 0]} />;
}

function KitchenModel() {
  const { scene } = useGLTF('/models/cozy-kitchen.glb');
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={2} position={[0, -1.2, 0]} />;
}

function GardenModel() {
  const { scene } = useGLTF('/models/garden.glb');
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={2} position={[0, -1.2, 0]} />;
}

// ─── Raycaster Grid ─────────────────────────────────────────────────────────

interface SurfacePoint {
  x: number;
  z: number;
  y: number | null; // null means no hit
}

function SurfaceProbe({
  onResults,
}: {
  onResults: (points: SurfacePoint[]) => void;
}) {
  const { scene } = useThree();
  const hasProbed = useRef(false);

  // Probe after scene is ready
  const probeRef = useCallback(
    (group: THREE.Group | null) => {
      if (!group || hasProbed.current) return;
      hasProbed.current = true;

      // Wait a frame for the model to be fully loaded
      requestAnimationFrame(() => {
        const raycaster = new THREE.Raycaster();
        const results: SurfacePoint[] = [];

        // Grid of test positions
        const range = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];

        for (const x of range) {
          for (const z of range) {
            // Cast ray downward from high above
            const origin = new THREE.Vector3(x, 5, z);
            const direction = new THREE.Vector3(0, -1, 0);
            raycaster.set(origin, direction);

            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
              results.push({ x, z, y: parseFloat(intersects[0].point.y.toFixed(3)) });
            } else {
              results.push({ x, z, y: null });
            }
          }
        }

        onResults(results);
      });
    },
    [scene, onResults]
  );

  return <group ref={probeRef} />;
}

// ─── Click Handler ──────────────────────────────────────────────────────────

function ClickHandler({
  onClickPoint,
}: {
  onClickPoint: (point: { x: number; y: number; z: number }) => void;
}) {
  const { scene, camera } = useThree();

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      // event.point gives us the intersection point directly
      if (event.point) {
        const p = {
          x: parseFloat(event.point.x.toFixed(4)),
          y: parseFloat(event.point.y.toFixed(4)),
          z: parseFloat(event.point.z.toFixed(4)),
        };
        onClickPoint(p);
        console.log(`🎯 Click position: [${p.x}, ${p.y}, ${p.z}]`);
      }
    },
    [onClickPoint]
  );

  return (
    <mesh
      visible={false}
      onPointerDown={handlePointerDown}
      position={[0, -1.2, 0]}
    >
      <boxGeometry args={[20, 20, 20]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// Alternative: click directly on the model
function ModelClickCatcher({
  onClickPoint,
}: {
  onClickPoint: (point: { x: number; y: number; z: number }) => void;
}) {
  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      if (event.point) {
        const p = {
          x: parseFloat(event.point.x.toFixed(4)),
          y: parseFloat(event.point.y.toFixed(4)),
          z: parseFloat(event.point.z.toFixed(4)),
        };
        onClickPoint(p);
        console.log(`🎯 Model click: [${p.x}, ${p.y}, ${p.z}]`);
        console.log(`   Object: ${event.object?.name || 'unnamed'}`);
        console.log(`   Parent: ${event.object?.parent?.name || 'unnamed'}`);
      }
    },
    [onClickPoint]
  );

  // Invisible sphere that wraps the whole scene to catch clicks
  return (
    <mesh visible={false} onClick={handleClick}>
      <sphereGeometry args={[50, 16, 16]} />
      <meshBasicMaterial side={THREE.BackSide} transparent opacity={0} />
    </mesh>
  );
}

// ─── Debug Markers ──────────────────────────────────────────────────────────

function DebugMarker({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
}

// ─── Scene Content ──────────────────────────────────────────────────────────

type ModelName = 'bedroom' | 'kitchen' | 'garden';

function SceneContent({
  model,
  onResults,
  onClickPoint,
  clickPoints,
}: {
  model: ModelName;
  onResults: (points: SurfacePoint[]) => void;
  onClickPoint: (point: { x: number; y: number; z: number }) => void;
  clickPoints: { x: number; y: number; z: number }[];
}) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <pointLight position={[0, 3, 0]} intensity={0.5} />

      <Suspense fallback={null}>
        {model === 'bedroom' && <BedroomModel />}
        {model === 'kitchen' && <KitchenModel />}
        {model === 'garden' && <GardenModel />}
      </Suspense>

      <SurfaceProbe onResults={onResults} />
      <ModelClickCatcher onClickPoint={onClickPoint} />

      {/* Show red markers where user clicked */}
      {clickPoints.map((p, i) => (
        <DebugMarker key={i} position={[p.x, p.y, p.z]} />
      ))}

      {/* Grid helper for reference */}
      <gridHelper args={[10, 20, '#666', '#333']} position={[0, -1.2, 0]} />
      <axesHelper args={[3]} />

      <OrbitControls makeDefault />
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function DebugPositions() {
  const [model, setModel] = useState<ModelName>('bedroom');
  const [surfacePoints, setSurfacePoints] = useState<SurfacePoint[]>([]);
  const [clickPoints, setClickPoints] = useState<{ x: number; y: number; z: number }[]>([]);
  const [lastClick, setLastClick] = useState<{ x: number; y: number; z: number } | null>(null);

  const handleResults = useCallback((points: SurfacePoint[]) => {
    setSurfacePoints(points);
  }, []);

  const handleClickPoint = useCallback((point: { x: number; y: number; z: number }) => {
    setLastClick(point);
    setClickPoints((prev) => [...prev, point]);
  }, []);

  const handleModelChange = (newModel: ModelName) => {
    setModel(newModel);
    setSurfacePoints([]);
    setClickPoints([]);
    setLastClick(null);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Controls Bar */}
      <div
        style={{
          padding: '12px 20px',
          background: '#1a1a2e',
          color: '#fff',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          zIndex: 10,
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>🔍 Debug Positions</span>
        <button
          onClick={() => handleModelChange('bedroom')}
          style={btnStyle(model === 'bedroom')}
        >
          🛏️ Bedroom
        </button>
        <button
          onClick={() => handleModelChange('kitchen')}
          style={btnStyle(model === 'kitchen')}
        >
          🍳 Kitchen
        </button>
        <button
          onClick={() => handleModelChange('garden')}
          style={btnStyle(model === 'garden')}
        >
          🌿 Garden
        </button>
        <button
          onClick={() => setClickPoints([])}
          style={{ ...btnStyle(false), background: '#c0392b' }}
        >
          Clear Markers
        </button>
        <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: 'auto' }}>
          Click on model surfaces to get exact coordinates. Check console for details.
        </span>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* 3D Canvas */}
        <div style={{ flex: 1 }}>
          <Canvas
            camera={{ position: [0, 2, 4], fov: 60 }}
            style={{ background: '#111' }}
          >
            <SceneContent
              key={model}
              model={model}
              onResults={handleResults}
              onClickPoint={handleClickPoint}
              clickPoints={clickPoints}
            />
          </Canvas>
        </div>

        {/* Side Panel - Results */}
        <div
          style={{
            width: '360px',
            background: '#0d1117',
            color: '#c9d1d9',
            overflow: 'auto',
            padding: '12px',
            fontSize: '11px',
            fontFamily: 'monospace',
            borderLeft: '1px solid #30363d',
          }}
        >
          {/* Last Click */}
          {lastClick && (
            <div style={{ marginBottom: '16px', padding: '8px', background: '#161b22', borderRadius: '6px' }}>
              <div style={{ color: '#58a6ff', fontWeight: 'bold', marginBottom: '4px' }}>
                🎯 Last Click Position
              </div>
              <div>
                x: <span style={{ color: '#f97583' }}>{lastClick.x}</span>,{' '}
                y: <span style={{ color: '#85e89d' }}>{lastClick.y}</span>,{' '}
                z: <span style={{ color: '#79b8ff' }}>{lastClick.z}</span>
              </div>
              <div style={{ marginTop: '4px', color: '#8b949e' }}>
                Copy: [{lastClick.x}, {lastClick.y}, {lastClick.z}]
              </div>
            </div>
          )}

          {/* Click History */}
          {clickPoints.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#58a6ff', fontWeight: 'bold', marginBottom: '6px' }}>
                📍 Click History ({clickPoints.length})
              </div>
              <div style={{ maxHeight: '150px', overflow: 'auto' }}>
                {clickPoints.map((p, i) => (
                  <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid #21262d' }}>
                    {i + 1}. [{p.x}, {p.y}, {p.z}]
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Surface Grid Results */}
          <div>
            <div style={{ color: '#58a6ff', fontWeight: 'bold', marginBottom: '6px' }}>
              📐 Surface Y Heights (Raycast Grid)
            </div>
            <div style={{ color: '#8b949e', marginBottom: '8px' }}>
              Ray cast downward from y=5 at each (x, z) position.
              <br />
              Model: scale=2, position=[0, -1.2, 0]
            </div>
            {surfacePoints.length === 0 ? (
              <div style={{ color: '#8b949e' }}>Loading... (switch model to re-probe)</div>
            ) : (
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>x</th>
                    <th style={thStyle}>z</th>
                    <th style={thStyle}>Surface Y</th>
                  </tr>
                </thead>
                <tbody>
                  {surfacePoints
                    .filter((p) => p.y !== null)
                    .sort((a, b) => (b.y ?? 0) - (a.y ?? 0))
                    .map((p, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#161b22' : 'transparent' }}>
                        <td style={tdStyle}>{p.x.toFixed(1)}</td>
                        <td style={tdStyle}>{p.z.toFixed(1)}</td>
                        <td style={{ ...tdStyle, color: getYColor(p.y!) }}>{p.y}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
            {surfacePoints.length > 0 && (
              <div style={{ marginTop: '8px', color: '#8b949e' }}>
                Hits: {surfacePoints.filter((p) => p.y !== null).length} /{' '}
                {surfacePoints.length} points
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ marginTop: '16px', padding: '8px', background: '#161b22', borderRadius: '6px' }}>
            <div style={{ color: '#58a6ff', fontWeight: 'bold', marginBottom: '4px' }}>
              📖 Reference Heights
            </div>
            <div>Ground level: <span style={{ color: '#85e89d' }}>-1.2</span></div>
            <div>Floor objects: <span style={{ color: '#85e89d' }}>-1.2 to -1.0</span></div>
            <div>Table/bed surface: <span style={{ color: '#d2a8ff' }}>-0.8 to -0.4</span></div>
            <div>Shelf/counter: <span style={{ color: '#f97583' }}>-0.2 to 0.3</span></div>
            <div>High shelf: <span style={{ color: '#f97583' }}>0.3 to 1.0</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 'bold' : 'normal',
    background: active ? '#238636' : '#21262d',
    color: '#fff',
    transition: 'all 0.2s',
  };
}

const thStyle: React.CSSProperties = {
  padding: '4px 6px',
  textAlign: 'left',
  borderBottom: '1px solid #30363d',
  color: '#8b949e',
};

const tdStyle: React.CSSProperties = {
  padding: '3px 6px',
  borderBottom: '1px solid #21262d',
};

function getYColor(y: number): string {
  if (y <= -1.0) return '#85e89d'; // ground/floor level
  if (y <= -0.4) return '#d2a8ff'; // table/bed height
  if (y <= 0.3) return '#f97583'; // shelf/counter
  return '#ffab70'; // high
}

export default DebugPositions;





