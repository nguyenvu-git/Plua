import { Suspense, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import MemoryGlobe from './MemoryGlobe';
import PhotoOverlay from './PhotoOverlay';
import SceneTransition from './SceneTransition';

/* ═══════════════════════════════════════════
   Custom 3-layer star field with per-star twinkle
   ═══════════════════════════════════════════ */

const vertexShader = /* glsl */ `
  attribute float twinkleOffset;
  attribute float twinkleSpeed;
  attribute float starSize;
  uniform float uTime;
  varying float vOpacity;
  varying vec2 vUv;

  void main() {
    // Per-star opacity with independent twinkle
    float base = 0.35 + 0.65 * abs(sin(uTime * twinkleSpeed + twinkleOffset));
    vOpacity = base;
    gl_PointSize = starSize;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vOpacity;

  void main() {
    // Soft circular point
    vec2 coord = gl_PointCoord - vec2(0.5);
    float d = length(coord);
    if (d > 0.5) discard;
    // Glow falloff: bright centre, soft edge
    float alpha = (1.0 - smoothstep(0.15, 0.5, d)) * vOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function generateLayer({ count, radiusMin, radiusMax, sizeMin, sizeMax, speedMin, speedMax }) {
  const positions = new Float32Array(count * 3);
  const twinkleOffset = new Float32Array(count);
  const twinkleSpeed = new Float32Array(count);
  const starSize = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Uniform sphere distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radiusMin + Math.random() * (radiusMax - radiusMin);

    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    twinkleOffset[i] = Math.random() * Math.PI * 2;
    twinkleSpeed[i] = speedMin + Math.random() * (speedMax - speedMin);
    starSize[i] = sizeMin + Math.random() * (sizeMax - sizeMin);
  }
  return { positions, twinkleOffset, twinkleSpeed, starSize };
}

function StarLayer({ count, radiusMin, radiusMax, sizeMin, sizeMax, speedMin, speedMax, color }) {
  const ref = useRef();
  const matRef = useRef();

  const data = useMemo(
    () => generateLayer({ count, radiusMin, radiusMax, sizeMin, sizeMax, speedMin, speedMax }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    [color]
  );

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-twinkleOffset" args={[data.twinkleOffset, 1]} />
        <bufferAttribute attach="attributes-twinkleSpeed" args={[data.twinkleSpeed, 1]} />
        <bufferAttribute attach="attributes-starSize" args={[data.starSize, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Three tiers: distant/small, mid, bright/large */
function NebularStarField() {
  return (
    <>
      {/* Layer 1 — Distant small dim stars (depth of field: tiniest, most blurred look) */}
      <StarLayer
        count={1800}
        radiusMin={55} radiusMax={90}
        sizeMin={0.8} sizeMax={2.2}
        speedMin={0.2} speedMax={0.8}
        color="#ccd0ff"
      />
      {/* Layer 2 — Mid-range medium stars */}
      <StarLayer
        count={600}
        radiusMin={30} radiusMax={55}
        sizeMin={1.5} sizeMax={3.5}
        speedMin={0.5} speedMax={1.4}
        color="#e8e0ff"
      />
      {/* Layer 3 — Nearby bright large stars with fast twinkle */}
      <StarLayer
        count={120}
        radiusMin={15} radiusMax={32}
        sizeMin={2.8} sizeMax={5.5}
        speedMin={1.2} speedMax={2.8}
        color="#fff8f0"
      />
      {/* Warm gold accent stars (scant) */}
      <StarLayer
        count={40}
        radiusMin={18} radiusMax={40}
        sizeMin={2.0} sizeMax={4.0}
        speedMin={0.9} speedMax={2.0}
        color="#ffd580"
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   Nebula cloud — soft glowing fog volumes
   ═══════════════════════════════════════════ */
function NebulaCloud({ position, color, scale = 1, opacity = 0.18 }) {
  const ref = useRef();
  const mat = useRef();

  useFrame(({ clock }) => {
    if (mat.current) {
      const t = clock.elapsedTime;
      mat.current.opacity = opacity * (0.8 + 0.2 * Math.sin(t * 0.3 + position[0]));
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial
        ref={mat}
        color={color}
        transparent
        opacity={opacity}
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   Scene component
   ═══════════════════════════════════════════ */
export default function MemorySphereScene({ onNext }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handlePhotoClick = useCallback((index) => {
    setSelectedPhoto(index);
  }, []);

  useEffect(() => {
    const handleSpace = (event) => {
      if (event.code !== 'Space') return;
      event.preventDefault();
      onNext();
    };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [onNext]);

  return (
    <SceneTransition sceneKey="memory-sphere">

      {/* ── Nebula CSS background ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 50% 45%, rgba(90, 55, 170, 0.22) 0%, transparent 65%),
            radial-gradient(ellipse 40% 35% at 18% 68%, rgba(210, 80, 140, 0.14) 0%, transparent 55%),
            radial-gradient(ellipse 38% 30% at 82% 22%, rgba(40, 160, 210, 0.10) 0%, transparent 50%),
            radial-gradient(ellipse 28% 22% at 62% 78%, rgba(140, 70, 220, 0.10) 0%, transparent 45%),
            radial-gradient(ellipse 35% 30% at 35% 20%, rgba(80, 40, 130, 0.12) 0%, transparent 50%),
            linear-gradient(165deg, #0a0812 0%, #0e0b1c 40%, #0c091a 70%, #080611 100%)
          `,
        }}
      />

      {/* ── 3D Canvas ── */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 9.5], fov: 55 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.45} />
          <pointLight position={[5, 5, 5]} intensity={0.65} color="#ddccb1" />
          <pointLight position={[-5, -3, 3]} intensity={0.4} color="#cbbfdc" />
          <pointLight position={[0, -5, 5]} intensity={0.25} color="#efd4df" />

          {/* Custom nebula star field */}
          <NebularStarField />

          {/* WebGL nebula clouds (additive blended spheres) */}
          <NebulaCloud position={[0, 0, -35]} color="#5522aa" scale={22} opacity={0.07} />
          <NebulaCloud position={[-18, 12, -40]} color="#cc3388" scale={14} opacity={0.055} />
          <NebulaCloud position={[22, -10, -38]} color="#1188cc" scale={16} opacity={0.05} />
          <NebulaCloud position={[10, 15, -30]} color="#8833dd" scale={10} opacity={0.06} />
          <NebulaCloud position={[-10, -15, -28]} color="#dd6622" scale={9} opacity={0.04} />

          <Suspense fallback={null}>
            <MemoryGlobe onPhotoClick={handlePhotoClick} />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={5}
            maxDistance={14}
            enableDamping
            dampingFactor={0.05}
            autoRotate={false}
          />
        </Canvas>
      </div>

      {/* ── Hint top ── */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <p
          className="text-xs text-center italic"
          style={{
            color: 'rgba(220, 210, 255, 0.35)',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
          }}
        >
          chạm vào một ảnh để xem lời nhắn · kéo để xoay
        </p>
      </motion.div>

      {/* ── Next hint bottom ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <motion.span
          onClick={onNext}
          className="note-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          id="next-scene-button"
          style={{ color: 'rgba(200, 185, 255, 0.28)' }}
        >
          nhấn Space để tiếp tục
        </motion.span>
      </div>

      {/* ── Photo overlay ── */}
      <PhotoOverlay
        selectedIndex={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </SceneTransition>
  );
}
