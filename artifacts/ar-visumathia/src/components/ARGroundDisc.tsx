/**
 * Soft ring on the measured floor — helps align AR content with real ground.
 */
export function ARGroundDisc({ groundY, radius = 1.1 }: { groundY: number; radius?: number }) {
  return (
    <mesh position={[0, groundY + 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-5}>
      <ringGeometry args={[radius * 0.65, radius, 48]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} />
    </mesh>
  );
}
