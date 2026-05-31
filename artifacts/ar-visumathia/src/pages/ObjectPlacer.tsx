import { useState, useEffect, Suspense, useMemo, useCallback, useRef } from 'react';
import { Canvas, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Object Placer — click & drag objects to position them in each scene.
 * Hold click on object and move mouse to drag on the XZ plane.
 * Hold Shift + drag to move on Y axis.
 * Press "Save Positions" to copy coordinates.
 */

// === SCENE CONFIGS ===
interface SceneConfig {
  name: string;
  envModel: string;
  envScale: number;
  envPosition: [number, number, number];
  envRotY?: number;
  objects: { id: string; label: string; color: string; position: [number, number, number] }[];
}

const SCENE_CONFIGS: Record<string, SceneConfig> = {
  bedroom: {
    name: 'Kamar Tidur',
    envModel: '/models/bedroom.glb',
    envScale: 2,
    envPosition: [0, -1.2, 0],
    objects: [
      { id: 'ball', label: 'Bola', color: '#FF6B6B', position: [-0.5, -1.05, 0.5] },
      { id: 'teddy', label: 'Boneka', color: '#D4A574', position: [0.8, -0.4, -0.3] },
      { id: 'book', label: 'Buku', color: '#5BC5F2', position: [-1.0, 0.1, -0.8] },
    ],
  },
  kitchen: {
    name: 'Dapur',
    envModel: '/models/cozy-kitchen.glb',
    envScale: 2,
    envPosition: [0, -1.2, 0],
    envRotY: Math.PI,
    objects: [
      { id: 'apple1', label: 'Apel 1', color: '#E53935', position: [-0.9, -0.85, 0.0] },
      { id: 'orange1', label: 'Jeruk 1', color: '#FF9800', position: [-0.7, -0.85, -0.1] },
      { id: 'apple2', label: 'Apel 2', color: '#E53935', position: [-0.5, -0.85, 0.0] },
      { id: 'banana', label: 'Pisang', color: '#FDD835', position: [-0.6, -0.85, 0.15] },
      { id: 'orange2', label: 'Jeruk 2', color: '#FF9800', position: [-0.8, -0.85, 0.15] },
    ],
  },
  playground: {
    name: 'Taman Bermain',
    envModel: '/models/garden.glb',
    envScale: 2,
    envPosition: [0, -1.2, 0],
    objects: [
      { id: 'basketball', label: 'Basketball', color: '#E65100', position: [-1.2, 0.2, 1.0] },
      { id: 'volleyball', label: 'Volleyball', color: '#FAFAFA', position: [1.0, 0.0, 2.0] },
      { id: 'soccer', label: 'Soccer', color: '#FFFFFF', position: [0, 0.0, 0.0] },
      { id: 'tennis', label: 'Tennis', color: '#C6FF00', position: [-0.5, -0.12, 3.0] },
    ],
  },
};

// === ENV MODEL ===
function EnvModel({ path, scale, position, rotY = 0 }: { path: string; scale: number; position: [number, number, number]; rotY?: number }) {
  const { scene } = useGLTF(path);
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} scale={scale} position={position} rotation={[0, rotY, 0]} />;
}

// === DRAGGABLE OBJECT WITH REAL DRAG ===
function DraggableObject({ id, label, color, position, selected, onSelect, onDragStart, onDragEnd }: {
  id: string; label: string; color: string; position: [number, number, number];
  selected: boolean; onSelect: () => void; onDragStart: () => void; onDragEnd: () => void;
}) {
  return (
    <group position={position}>
      <mesh
        onPointerDown={(e) => { e.stopPropagation(); onSelect(); onDragStart(); }}
        onPointerUp={() => onDragEnd()}
        castShadow
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={color} emissive={selected ? '#ffffff' : color} emissiveIntensity={selected ? 0.5 : 0.2} />
      </mesh>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <ringGeometry args={[0.2, 0.25, 24]} />
          <meshBasicMaterial color="#5BC5F2" transparent opacity={0.8} />
        </mesh>
      )}
      <Html position={[0, 0.3, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          background: selected ? '#333' : 'rgba(0,0,0,0.7)',
          color: '#fff', padding: '2px 8px', borderRadius: '10px',
          fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap',
          border: selected ? '2px solid #5BC5F2' : 'none',
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

// === DRAG PLANE — invisible plane that captures mouse movement ===
function DragPlane({ dragging, objectPos, shiftHeld, onMove }: {
  dragging: boolean;
  objectPos: [number, number, number];
  shiftHeld: boolean;
  onMove: (pos: [number, number, number]) => void;
}) {
  const { camera, raycaster, pointer } = useThree();
  const planeRef = useRef(new THREE.Plane());
  const intersectPoint = useRef(new THREE.Vector3());
  const offset = useRef(new THREE.Vector3());
  const started = useRef(false);

  useFrame(() => {
    if (!dragging) { started.current = false; return; }

    // Create a plane at object height
    if (shiftHeld) {
      // Y-axis drag: plane faces camera on XZ
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();
      planeRef.current.setFromNormalAndCoplanarPoint(camDir, new THREE.Vector3(objectPos[0], objectPos[1], objectPos[2]));
    } else {
      // XZ drag: horizontal plane at object Y
      planeRef.current.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, objectPos[1], 0));
    }

    // Cast ray from mouse
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(planeRef.current, intersectPoint.current);

    if (!intersectPoint.current) return;

    if (!started.current) {
      // First frame: calculate offset
      offset.current.set(
        objectPos[0] - intersectPoint.current.x,
        objectPos[1] - intersectPoint.current.y,
        objectPos[2] - intersectPoint.current.z,
      );
      started.current = true;
      return;
    }

    // Apply position
    if (shiftHeld) {
      // Only move Y
      const newY = parseFloat((intersectPoint.current.y + offset.current.y).toFixed(3));
      onMove([objectPos[0], newY, objectPos[2]]);
    } else {
      // Move XZ
      const newX = parseFloat((intersectPoint.current.x + offset.current.x).toFixed(3));
      const newZ = parseFloat((intersectPoint.current.z + offset.current.z).toFixed(3));
      onMove([newX, objectPos[1], newZ]);
    }
  });

  return null;
}

// === MAIN PAGE ===
export function ObjectPlacer() {
  const [currentScene, setCurrentScene] = useState<string>('bedroom');
  const [positions, setPositions] = useState<Record<string, Record<string, [number, number, number]>>>(() => {
    const init: Record<string, Record<string, [number, number, number]>> = {};
    Object.entries(SCENE_CONFIGS).forEach(([key, config]) => {
      init[key] = {};
      config.objects.forEach(obj => { init[key][obj.id] = [...obj.position]; });
    });
    return init;
  });
  const [selectedObj, setSelectedObj] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [shiftHeld, setShiftHeld] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  const config = SCENE_CONFIGS[currentScene];
  const scenePositions = positions[currentScene];

  const handleMove = useCallback((id: string, pos: [number, number, number]) => {
    setPositions(prev => ({
      ...prev,
      [currentScene]: { ...prev[currentScene], [id]: pos },
    }));
  }, [currentScene]);

  const handleSave = () => {
    const output = Object.entries(positions).map(([scene, objs]) => {
      const cfg = SCENE_CONFIGS[scene];
      const lines = cfg.objects.map(obj => {
        const pos = objs[obj.id];
        return `  { id: '${obj.id}', pos: [${pos[0]}, ${pos[1]}, ${pos[2]}] }, // ${obj.label}`;
      });
      return `// ${cfg.name}\n${lines.join('\n')}`;
    }).join('\n\n');
    navigator.clipboard.writeText(output);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const nudge = (axis: 'x' | 'y' | 'z', amount: number) => {
    if (!selectedObj) return;
    const pos = [...scenePositions[selectedObj]] as [number, number, number];
    const idx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    pos[idx] = parseFloat((pos[idx] + amount).toFixed(3));
    handleMove(selectedObj, pos);
  };

  // Keyboard listener for shift and arrow keys
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') setShiftHeld(true);
    if (!selectedObj) return;
    const step = e.ctrlKey ? 0.01 : 0.05;
    switch (e.key) {
      case 'ArrowUp': e.preventDefault(); nudgeRef.current('z', -step); break;
      case 'ArrowDown': e.preventDefault(); nudgeRef.current('z', step); break;
      case 'ArrowLeft': e.preventDefault(); nudgeRef.current('x', -step); break;
      case 'ArrowRight': e.preventDefault(); nudgeRef.current('x', step); break;
      case 'PageUp': e.preventDefault(); nudgeRef.current('y', step); break;
      case 'PageDown': e.preventDefault(); nudgeRef.current('y', -step); break;
      case 'q': case 'Q': nudgeRef.current('y', -step); break;
      case 'e': case 'E': nudgeRef.current('y', step); break;
    }
    // Ctrl+S = deselect (like "save placement" for this object)
    if (e.key === 's' && e.ctrlKey) {
      e.preventDefault();
      setSelectedObj(null);
      setDragging(false);
    }
  }, [selectedObj]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') setShiftHeld(false);
  }, []);

  // Ref for nudge so keyboard handler can access latest positions
  const nudgeRef = useRef(nudge);
  nudgeRef.current = nudge;

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div
      style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#111' }}
    >
      {/* Top toolbar */}
      <div style={{ padding: '10px 16px', background: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', zIndex: 20 }}>
        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>Object Placer</span>
        {Object.entries(SCENE_CONFIGS).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => { setCurrentScene(key); setSelectedObj(null); setDragging(false); }}
            style={{
              padding: '6px 14px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: currentScene === key ? '#5BC5F2' : '#2d2d44', color: '#fff',
              fontWeight: currentScene === key ? 'bold' : 'normal', fontSize: '12px',
            }}
          >
            {cfg.name}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: '#8b949e', fontSize: '10px' }}>Drag = XZ | Shift+Drag = Y</span>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              background: saved ? '#4CAF50' : '#FFD93D', color: '#000', fontWeight: 'bold', fontSize: '13px',
            }}
          >
            {saved ? 'Copied!' : 'Save Positions'}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* 3D Canvas */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Canvas camera={{ position: [0, 2, 4], fov: 50 }} shadows>
            <ambientLight intensity={0.8} />
            <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
            <pointLight position={[0, 3, 0]} intensity={0.5} />

            <Suspense fallback={null}>
              <EnvModel path={config.envModel} scale={config.envScale} position={config.envPosition} rotY={config.envRotY} />
            </Suspense>

            {/* Objects */}
            {config.objects.map(obj => (
              <DraggableObject
                key={`${currentScene}-${obj.id}`}
                id={obj.id}
                label={obj.label}
                color={obj.color}
                position={scenePositions[obj.id]}
                selected={selectedObj === obj.id}
                onSelect={() => setSelectedObj(obj.id)}
                onDragStart={() => { setDragging(true); setOrbitEnabled(false); }}
                onDragEnd={() => { setDragging(false); setOrbitEnabled(true); }}
              />
            ))}

            {/* Drag plane logic */}
            {selectedObj && (
              <DragPlane
                dragging={dragging}
                objectPos={scenePositions[selectedObj]}
                shiftHeld={shiftHeld}
                onMove={(pos) => handleMove(selectedObj, pos)}
              />
            )}

            <gridHelper args={[10, 20, '#444', '#222']} position={[0, -1.2, 0]} />
            <OrbitControls makeDefault enabled={orbitEnabled} />
          </Canvas>

          {/* Instructions */}
          <div style={{
            position: 'absolute', bottom: '12px', left: '12px', right: '12px',
            background: 'rgba(0,0,0,0.85)', borderRadius: '12px', padding: '10px 16px',
            color: '#fff', fontSize: '11px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
          }}>
            <span><b>Arrow keys</b> = geser XZ</span>
            <span><b>Q/E</b> = turun/naik (Y)</span>
            <span><b>Ctrl+Arrow</b> = geser halus</span>
            <span><b>Ctrl+S</b> = deselect</span>
            <span><b>Drag</b> = geser XZ</span>
            <span><b>Shift+Drag</b> = naik/turun</span>
          </div>
        </div>

        {/* Right panel */}
        <div style={{
          width: '260px', background: '#0d1117', color: '#c9d1d9', padding: '12px',
          fontSize: '11px', fontFamily: 'monospace', overflowY: 'auto', borderLeft: '1px solid #30363d',
        }}>
          <div style={{ color: '#58a6ff', fontWeight: 'bold', marginBottom: '12px', fontSize: '13px' }}>
            {config.name}
          </div>

          {config.objects.map(obj => {
            const pos = scenePositions[obj.id];
            const isSelected = selectedObj === obj.id;
            return (
              <div
                key={obj.id}
                onClick={() => setSelectedObj(obj.id)}
                style={{
                  padding: '8px', marginBottom: '6px', borderRadius: '8px', cursor: 'pointer',
                  background: isSelected ? '#1f3a5f' : '#161b22',
                  border: isSelected ? '1px solid #58a6ff' : '1px solid #21262d',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: obj.color }} />
                  <span style={{ fontWeight: 'bold' }}>{obj.label}</span>
                </div>
                <div style={{ color: '#8b949e' }}>
                  [{pos[0].toFixed(3)}, {pos[1].toFixed(3)}, {pos[2].toFixed(3)}]
                </div>
              </div>
            );
          })}

          {/* Nudge controls */}
          {selectedObj && (
            <div style={{ marginTop: '16px', padding: '10px', background: '#161b22', borderRadius: '8px' }}>
              <div style={{ color: '#58a6ff', fontWeight: 'bold', marginBottom: '8px' }}>
                Nudge: {config.objects.find(o => o.id === selectedObj)?.label}
              </div>
              {(['x', 'y', 'z'] as const).map(axis => (
                <div key={axis} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <span style={{ width: '14px', color: axis === 'x' ? '#f97583' : axis === 'y' ? '#85e89d' : '#79b8ff' }}>
                    {axis.toUpperCase()}
                  </span>
                  <button onClick={() => nudge(axis, -0.1)} style={nudgeBtn}>-.1</button>
                  <button onClick={() => nudge(axis, -0.05)} style={nudgeBtn}>-.05</button>
                  <button onClick={() => nudge(axis, -0.01)} style={nudgeBtn}>-.01</button>
                  <span style={{ width: '46px', textAlign: 'center', fontSize: '10px' }}>
                    {scenePositions[selectedObj][axis === 'x' ? 0 : axis === 'y' ? 1 : 2].toFixed(3)}
                  </span>
                  <button onClick={() => nudge(axis, 0.01)} style={nudgeBtn}>+.01</button>
                  <button onClick={() => nudge(axis, 0.05)} style={nudgeBtn}>+.05</button>
                  <button onClick={() => nudge(axis, 0.1)} style={nudgeBtn}>+.1</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const nudgeBtn: React.CSSProperties = {
  padding: '4px 6px', border: 'none', borderRadius: '4px',
  background: '#21262d', color: '#c9d1d9', cursor: 'pointer', fontSize: '9px', fontWeight: 'bold',
};

export default ObjectPlacer;
