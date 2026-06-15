import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BOKEH_COUNT = 35;

export default function BokehLights() {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: BOKEH_COUNT }, () => ({
      x: (Math.random() - 0.5) * 14,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 8 - 2,
      scale: 0.08 + Math.random() * 0.35,
      speedX: (Math.random() - 0.5) * 0.003,
      speedY: (Math.random() - 0.5) * 0.004,
      phase: Math.random() * Math.PI * 2,
      pulseFreq: 0.3 + Math.random() * 0.8,
    }));
  }, []);

  const colors = useMemo(() => {
    const palette = [
      new THREE.Color('#c8b08b'),
      new THREE.Color('#ddccb1'),
      new THREE.Color('#efd4df'),
      new THREE.Color('#cbbfdc'),
      new THREE.Color('#fbf7f1'),
    ];
    return particles.map(() => palette[Math.floor(Math.random() * palette.length)]);
  }, [particles]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < BOKEH_COUNT; i++) {
      const p = particles[i];

      const x = p.x + Math.sin(t * 0.5 + p.phase) * 0.3;
      const y = p.y + Math.cos(t * 0.4 + p.phase) * 0.2;
      const z = p.z + Math.sin(t * 0.3 + p.phase * 1.5) * 0.15;

      const pulse = 1 + Math.sin(t * p.pulseFreq + p.phase) * 0.2;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(p.scale * pulse);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, colors[i]);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, BOKEH_COUNT]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        transparent
        opacity={0.15}
        emissive="#c8b08b"
        emissiveIntensity={0.38}
        roughness={1}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
