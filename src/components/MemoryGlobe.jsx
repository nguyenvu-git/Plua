import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PHOTO_COUNT = 10;
const PLANE_SIZE = 0.6;

/* ── Polaroid-style fallback texture ── */
function createFallbackTexture(index) {
  const W = 256, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const palettes = [
    ['#C4B5E0', '#9B8AC4'], ['#F2C6D0', '#E8A0B0'], ['#D4A853', '#B8913A'],
    ['#E8E0F0', '#C4B5E0'], ['#FBE4EA', '#F2C6D0'], ['#F0D48A', '#D4A853'],
    ['#C4B5E0', '#F2C6D0'], ['#E8A0B0', '#9B8AC4'], ['#FFF8F0', '#F0D48A'],
    ['#9B8AC4', '#D4A853'], ['#F2C6D0', '#C4B5E0'], ['#D4A853', '#E8A0B0'],
    ['#E8E0F0', '#FBE4EA'], ['#B8913A', '#9B8AC4'], ['#F0D48A', '#F2C6D0'],
  ];
  const [c1, c2] = palettes[index % palettes.length];

  // Polaroid white frame
  ctx.fillStyle = '#fdfaf5';
  ctx.fillRect(0, 0, W, H);

  // Photo area (inset)
  const pad = 18, btm = 48;
  const grad = ctx.createLinearGradient(pad, pad, W - pad, H - btm);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(pad, pad, W - pad * 2, H - pad - btm);

  // Photo number
  ctx.globalAlpha = 0.5;
  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${index + 1}`, W / 2, (pad + H - btm) / 2);

  // Bottom text area
  ctx.globalAlpha = 0.35;
  ctx.font = '11px Dancing Script, cursive';
  ctx.fillStyle = '#7a6050';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Memory', W / 2, H - btm / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/* ── Sparkle particle system per photo (on hover) ── */
function PhotoSparkles({ active }) {
  const ref = useRef();
  const count = 12;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = Array.from({ length: count }, () => ({
      vx: (Math.random() - 0.5) * 0.012,
      vy: Math.random() * 0.015 + 0.005,
      vz: (Math.random() - 0.5) * 0.01,
      life: Math.random(),
    }));
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * PLANE_SIZE;
      pos[i * 3 + 1] = (Math.random() - 0.5) * PLANE_SIZE;
      pos[i * 3 + 2] = 0.02;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (!ref.current || !active) return;
    const attr = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const v = velocities[i];
      v.life += 0.02;
      if (v.life > 1) {
        v.life = 0;
        attr.setX(i, (Math.random() - 0.5) * PLANE_SIZE);
        attr.setY(i, (Math.random() - 0.5) * PLANE_SIZE * 0.5 - PLANE_SIZE * 0.2);
        attr.setZ(i, 0.02);
      }
      attr.setX(i, attr.getX(i) + v.vx);
      attr.setY(i, attr.getY(i) + v.vy);
      attr.setZ(i, attr.getZ(i) + v.vz);
    }
    attr.needsUpdate = true;
    ref.current.material.opacity = active ? 0.8 : 0;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffe066"
        size={0.035}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Single photo plane with Polaroid frame + sway ── */
function PhotoPlane({ index, onPhotoClick, onHoverChange }) {
  const meshRef = useRef();
  const frameRef = useRef();
  const [hovered, setHovered] = useState(false);
  const swayOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const swaySpeed = useMemo(() => 0.4 + Math.random() * 0.3, []);

  const fallbackTexture = useMemo(() => createFallbackTexture(index), [index]);
  const [texture, setTexture] = useState(fallbackTexture);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    // Thử load .jpg trước, nếu lỗi thì thử .png
    loader.load(
      `/photos/${index + 1}.jpg`,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => {
        // .jpg không tồn tại, thử .png
        loader.load(
          `/photos/${index + 1}.png`,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            setTexture(tex);
          },
          undefined,
          () => { /* giữ fallback */ }
        );
      }
    );
  }, [index]);

  // Ring layout
  const targetPos = useMemo(() => {
    const angle = (index / PHOTO_COUNT) * Math.PI * 2;
    const radius = 4.2;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(index * (Math.PI / 2)) * 0.4,
      Math.sin(angle) * radius
    );
  }, [index]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;

    // Gentle sway in local space
    const sway = Math.sin(t * swaySpeed + swayOffset) * 0.06;
    meshRef.current.position.copy(targetPos);
    meshRef.current.position.y += Math.sin(t * 0.5 + swayOffset) * 0.12;

    // Face outward + slight tilt
    const lookTarget = targetPos.clone().multiplyScalar(2);
    lookTarget.y += 1.2;
    meshRef.current.lookAt(lookTarget);
    meshRef.current.rotation.z += sway;

    // Scale on hover
    const targetScale = hovered ? 1.22 : 1.0;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.12
    );

    // Frame glow on hover
    if (frameRef.current) {
      frameRef.current.material.opacity = hovered
        ? 0.85
        : 0.55 + Math.sin(t * 1.5 + swayOffset) * 0.08;
    }
  });

  // Photo dimensions (slightly taller than wide for Polaroid)
  const W = PLANE_SIZE;
  const H = PLANE_SIZE * 1.22;
  const pad = 0.055;        // white padding all sides
  const btmPad = 0.14;      // extra bottom for Polaroid caption area

  const pointerStart = useRef({ x: 0, y: 0 });

  return (
    <group
      ref={meshRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        pointerStart.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        const dist = Math.hypot(
          e.clientX - pointerStart.current.x,
          e.clientY - pointerStart.current.y
        );
        // Nếu di chuyển pointer ít hơn 5px thì mới tính là click
        if (dist < 5) {
          onPhotoClick(index);
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHoverChange(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        onHoverChange(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Polaroid white backing */}
      <mesh position={[0, 0, -0.008]}>
        <planeGeometry args={[W + pad * 2, H + pad + btmPad]} />
        <meshStandardMaterial
          color="#fdfaf5"
          roughness={0.35}
          metalness={0.0}
          transparent
          opacity={0.96}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Photo face */}
      <mesh position={[0, (btmPad - pad) / 2, 0]}>
        <planeGeometry args={[W, H - btmPad]} />
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
          transparent
          opacity={hovered ? 1 : 0.92}
          roughness={0.25}
          metalness={0.05}
          emissive={new THREE.Color('#fff8f0')}
          emissiveIntensity={hovered ? 0.28 : 0.06}
          emissiveMap={texture}
        />
      </mesh>

      {/* Glowing golden border on hover */}
      <mesh ref={frameRef} position={[0, (btmPad - pad) / 2, -0.003]}>
        <planeGeometry args={[W + 0.06, H - btmPad + 0.06]} />
        <meshBasicMaterial
          color="#ddb870"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sparkle particles */}
      <PhotoSparkles active={hovered} />
    </group>
  );
}

/* ── Globe group ── */
export default function MemoryGlobe({ onPhotoClick }) {
  const groupRef = useRef();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const rotationSpeed = useRef(-0.002);

  useFrame(() => {
    if (groupRef.current) {
      // Lerp speed to 0 if hovered, else to standard speed
      const targetSpeed = hoveredIndex !== null ? 0 : -0.002;
      rotationSpeed.current = THREE.MathUtils.lerp(rotationSpeed.current, targetSpeed, 0.08);

      groupRef.current.rotation.y += rotationSpeed.current;
      groupRef.current.rotation.z = 0.15;
      groupRef.current.rotation.x = 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: PHOTO_COUNT }).map((_, i) => (
        <PhotoPlane
          key={i}
          index={i}
          onPhotoClick={onPhotoClick}
          onHoverChange={(isHovered) => setHoveredIndex(isHovered ? i : null)}
        />
      ))}
    </group>
  );
}
