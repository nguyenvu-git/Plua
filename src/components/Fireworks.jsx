import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLES_PER_BURST = 60;
const MAX_BURSTS = 6;
const TOTAL = PARTICLES_PER_BURST * MAX_BURSTS;

export default function Fireworks({ active }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particlesRef = useRef([]);
  const lastBurst = useRef(0);
  const burstCount = useRef(0);

  const colors = useMemo(() => [
    new THREE.Color('#D4A853'),
    new THREE.Color('#F0D48A'),
    new THREE.Color('#F2C6D0'),
    new THREE.Color('#C4B5E0'),
    new THREE.Color('#E8A0B0'),
    new THREE.Color('#FFF8F0'),
  ], []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    if (active && t - lastBurst.current > 0.7 && burstCount.current < MAX_BURSTS) {
      const cx = (Math.random() - 0.5) * 5;
      const cy = Math.random() * 3 + 1;
      const cz = (Math.random() - 0.5) * 2;
      const col = colors[burstCount.current % colors.length];

      for (let j = 0; j < PARTICLES_PER_BURST; j++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.random() * Math.PI;
        const sp = 0.4 + Math.random() * 1.2;
        particlesRef.current.push({
          x: cx, y: cy, z: cz,
          vx: Math.sin(ph) * Math.cos(th) * sp * 0.06,
          vy: Math.sin(ph) * Math.sin(th) * sp * 0.06,
          vz: Math.cos(ph) * sp * 0.04,
          life: 1, decay: 0.006 + Math.random() * 0.008,
          color: col, scale: 0.02 + Math.random() * 0.04,
        });
      }
      lastBurst.current = t;
      burstCount.current++;
    }

    const particles = particlesRef.current;
    for (let i = 0; i < TOTAL; i++) {
      if (i < particles.length && particles[i].life > 0) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vy -= 0.001;
        p.life -= p.decay;
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.setScalar(p.scale * Math.max(p.life, 0));
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, p.color);
      } else {
        dummy.position.set(0, -50, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, TOTAL]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        transparent opacity={0.9}
        emissive="#D4A853" emissiveIntensity={2}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
