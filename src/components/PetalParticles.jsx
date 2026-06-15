import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PETAL_COUNT = 120;
const SPREAD_X = 12;
const SPREAD_Y = 10;
const SPREAD_Z = 6;

function createPetalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.15, 0.15, 0.3, 0.4, 0, 0.6);
  shape.bezierCurveTo(-0.3, 0.4, -0.15, 0.15, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 8);
  // Add slight curve
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, Math.sin(y * Math.PI) * 0.05 + Math.sin(x * 4) * 0.02);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export default function PetalParticles() {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const petals = useMemo(() => {
    return Array.from({ length: PETAL_COUNT }, () => ({
      x: (Math.random() - 0.5) * SPREAD_X,
      y: Math.random() * SPREAD_Y + 3,
      z: (Math.random() - 0.5) * SPREAD_Z,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      speedY: 0.3 + Math.random() * 0.5,
      speedRotX: (Math.random() - 0.5) * 0.02,
      speedRotY: (Math.random() - 0.5) * 0.03,
      speedRotZ: (Math.random() - 0.5) * 0.015,
      driftFreq: 0.5 + Math.random() * 1.5,
      driftAmp: 0.3 + Math.random() * 0.5,
      scale: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  const geometry = useMemo(() => createPetalGeometry(), []);

  const colors = useMemo(() => {
    const palette = [
      new THREE.Color('#efd4df'),
      new THREE.Color('#d9bbca'),
      new THREE.Color('#f8ebf1'),
      new THREE.Color('#cbbfdc'),
      new THREE.Color('#ece6f3'),
      new THREE.Color('#fbf7f1'),
    ];
    return petals.map(() => palette[Math.floor(Math.random() * palette.length)]);
  }, [petals]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < PETAL_COUNT; i++) {
      const p = petals[i];

      // Fall
      p.y -= p.speedY * 0.016;

      // Drift horizontally
      const driftX = Math.sin(t * p.driftFreq + p.phase) * p.driftAmp * 0.016;
      const driftZ = Math.cos(t * p.driftFreq * 0.7 + p.phase) * p.driftAmp * 0.5 * 0.016;
      p.x += driftX;
      p.z += driftZ;

      // Rotate
      p.rotX += p.speedRotX;
      p.rotY += p.speedRotY;
      p.rotZ += p.speedRotZ;

      // Respawn at top
      if (p.y < -SPREAD_Y / 2 - 1) {
        p.y = SPREAD_Y / 2 + 2 + Math.random() * 3;
        p.x = (Math.random() - 0.5) * SPREAD_X;
        p.z = (Math.random() - 0.5) * SPREAD_Z;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, colors[i]);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, null, PETAL_COUNT]}>
      <meshStandardMaterial
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
        roughness={0.8}
        metalness={0.05}
      />
    </instancedMesh>
  );
}
