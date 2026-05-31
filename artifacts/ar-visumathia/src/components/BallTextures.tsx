import { useMemo } from 'react';
import * as THREE from 'three';

const TEX_SIZE = 512;

/** Generate a basketball texture (orange with black seam lines) */
function createBasketballTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Orange base with subtle gradient
  const grad = ctx.createRadialGradient(TEX_SIZE * 0.35, TEX_SIZE * 0.35, 0, TEX_SIZE / 2, TEX_SIZE / 2, TEX_SIZE / 2);
  grad.addColorStop(0, '#F57C00');
  grad.addColorStop(0.6, '#E65100');
  grad.addColorStop(1, '#BF360C');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Pebble texture (dots)
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * TEX_SIZE;
    const y = Math.random() * TEX_SIZE;
    ctx.beginPath();
    ctx.arc(x, y, 1 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Black seam lines
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(0, TEX_SIZE / 2);
  ctx.lineTo(TEX_SIZE, TEX_SIZE / 2);
  ctx.stroke();

  // Vertical line
  ctx.beginPath();
  ctx.moveTo(TEX_SIZE / 2, 0);
  ctx.lineTo(TEX_SIZE / 2, TEX_SIZE);
  ctx.stroke();

  // Curved seams (left and right arcs)
  ctx.beginPath();
  ctx.arc(TEX_SIZE * 0.25, TEX_SIZE / 2, TEX_SIZE * 0.3, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(TEX_SIZE * 0.75, TEX_SIZE / 2, TEX_SIZE * 0.3, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Generate a volleyball texture (white with blue/yellow panels) */
function createVolleyballTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext('2d')!;

  // White base
  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Panel colors (blue and yellow stripes)
  const panelColors = ['#1565C0', '#FDD835', '#1565C0'];
  const panelHeight = TEX_SIZE / 3;
  panelColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, i * panelHeight + panelHeight * 0.2, TEX_SIZE, panelHeight * 0.6);
  });
  ctx.globalAlpha = 1;

  // Seam lines (curved panel dividers)
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;

  // Horizontal seams
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath();
    const y = (TEX_SIZE / 3) * i;
    ctx.moveTo(0, y);
    for (let x = 0; x <= TEX_SIZE; x += 10) {
      ctx.lineTo(x, y + Math.sin(x * 0.02) * 8);
    }
    ctx.stroke();
  }

  // Vertical curved seams
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const x = (TEX_SIZE / 3) * i + TEX_SIZE / 6;
    ctx.moveTo(x, 0);
    for (let y = 0; y <= TEX_SIZE; y += 10) {
      ctx.lineTo(x + Math.sin(y * 0.015) * 15, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Generate a soccer ball texture (white with black pentagons) */
function createSoccerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext('2d')!;

  // White base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Draw black pentagons in a pattern
  ctx.fillStyle = '#1a1a1a';
  const pentagonPositions = [
    [TEX_SIZE * 0.25, TEX_SIZE * 0.25],
    [TEX_SIZE * 0.75, TEX_SIZE * 0.25],
    [TEX_SIZE * 0.5, TEX_SIZE * 0.5],
    [TEX_SIZE * 0.25, TEX_SIZE * 0.75],
    [TEX_SIZE * 0.75, TEX_SIZE * 0.75],
    [TEX_SIZE * 0.0, TEX_SIZE * 0.5],
    [TEX_SIZE * 1.0, TEX_SIZE * 0.5],
  ];

  pentagonPositions.forEach(([cx, cy]) => {
    drawPentagon(ctx, cx, cy, TEX_SIZE * 0.1);
  });

  // Seam lines connecting pentagons
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  pentagonPositions.forEach(([cx, cy]) => {
    drawHexLines(ctx, cx, cy, TEX_SIZE * 0.14);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function drawPentagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHexLines(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r * 0.72, cy + Math.sin(angle) * r * 0.72);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

/** Generate a tennis ball texture (yellow-green with white curved seam) */
function createTennisBallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Yellow-green fuzzy base
  const grad = ctx.createRadialGradient(TEX_SIZE * 0.35, TEX_SIZE * 0.35, 0, TEX_SIZE / 2, TEX_SIZE / 2, TEX_SIZE / 2);
  grad.addColorStop(0, '#C8E600');
  grad.addColorStop(0.7, '#AEEA00');
  grad.addColorStop(1, '#8BC34A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  // Fuzzy texture (tiny dots)
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * TEX_SIZE;
    const y = Math.random() * TEX_SIZE;
    ctx.beginPath();
    ctx.arc(x, y, 0.5 + Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }

  // White curved seam line
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 3;

  // Top curve
  ctx.beginPath();
  ctx.moveTo(0, TEX_SIZE * 0.35);
  ctx.bezierCurveTo(
    TEX_SIZE * 0.3, TEX_SIZE * 0.15,
    TEX_SIZE * 0.7, TEX_SIZE * 0.15,
    TEX_SIZE, TEX_SIZE * 0.35,
  );
  ctx.stroke();

  // Bottom curve
  ctx.beginPath();
  ctx.moveTo(0, TEX_SIZE * 0.65);
  ctx.bezierCurveTo(
    TEX_SIZE * 0.3, TEX_SIZE * 0.85,
    TEX_SIZE * 0.7, TEX_SIZE * 0.85,
    TEX_SIZE, TEX_SIZE * 0.65,
  );
  ctx.stroke();

  ctx.shadowBlur = 0;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export type BallType = 'basketball' | 'volleyball' | 'soccer' | 'tennis';

const textureCreators: Record<BallType, () => THREE.CanvasTexture> = {
  basketball: createBasketballTexture,
  volleyball: createVolleyballTexture,
  soccer: createSoccerTexture,
  tennis: createTennisBallTexture,
};

const materialProps: Record<BallType, { roughness: number; metalness: number }> = {
  basketball: { roughness: 0.7, metalness: 0.0 },
  volleyball: { roughness: 0.4, metalness: 0.0 },
  soccer: { roughness: 0.35, metalness: 0.0 },
  tennis: { roughness: 0.85, metalness: 0.0 },
};

/** Hook to get a cached ball texture by type */
export function useBallTexture(type: BallType): THREE.CanvasTexture {
  return useMemo(() => textureCreators[type](), [type]);
}

/** A realistic textured ball component */
export function TexturedBall({
  position,
  radius,
  type,
  visible,
}: {
  position: [number, number, number];
  radius: number;
  type: BallType;
  visible: boolean;
}) {
  const texture = useBallTexture(type);
  const props = materialProps[type];

  if (!visible) return null;

  return (
    <group position={position}>
      {/* Shadow on ground */}
      <mesh position={[0, -radius + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.7, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {/* Main textured ball */}
      <mesh castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          roughness={props.roughness}
          metalness={props.metalness}
          envMapIntensity={0.6}
        />
      </mesh>
      {/* Subtle specular highlight */}
      <mesh position={[-radius * 0.25, radius * 0.3, radius * 0.55]}>
        <sphereGeometry args={[radius * 0.12, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
