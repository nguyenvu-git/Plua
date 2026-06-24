import { useState, Suspense, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sparkles, OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import Fireworks from "./Fireworks";
import SceneTransition from "./SceneTransition";

const NTFY_TOPIC = "thu-mat-sn2-k9r4m7p2xq8z";

const sendWishNotification = (wish) => {
  const now = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  fetch("https://ntfy.sh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: NTFY_TOPIC,
      title: "Co nguoi gui Dieu Uoc! 🌠",
      message: `"${wish}"\n\n— Gui luc ${now}`,
      priority: 5,
      tags: ["sparkles", "birthday"],
    }),
  })
    .then((res) => console.log("[ntfy-wish]", res.status, res.ok ? "✅" : "❌"))
    .catch((err) => console.error("[ntfy-wish]", err));
};

/* ─── Firefly particle inside Three.js scene ─── */
function Fireflies({ count = 40, active = true }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      arr[i * 3 + 0] = r * Math.cos(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
    }
    return arr;
  }, [count]);

  const offsets = useMemo(
    () => Array.from({ length: count }, () => Math.random() * Math.PI * 2),
    [count],
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const posAttr = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const o = offsets[i];
      posAttr.setY(i, positions[i * 3 + 1] + Math.sin(t * 0.8 + o) * 0.18);
      posAttr.setX(i, positions[i * 3] + Math.cos(t * 0.6 + o * 1.3) * 0.1);
    }
    posAttr.needsUpdate = true;
    ref.current.material.opacity = active
      ? 0.55 + Math.sin(t * 2) * 0.2
      : 0.25 + Math.sin(t * 1.2) * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffdf88"
        size={0.055}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── Strawberry ─── */
function Strawberry({ position, scale = 1, rotation = [0, 0, 0] }) {
  const strawberryGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.2, 32, 32);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const ny = (y + 0.2) / 0.4;
      const taper = Math.pow(Math.max(0, ny), 0.4);
      pos.setX(i, x * taper);
      pos.setZ(i, z * taper);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={position} scale={scale} rotation={rotation} castShadow>
      <mesh geometry={strawberryGeo}>
        <meshStandardMaterial color="#e62e2e" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
        <meshStandardMaterial color="#2e8b22" roughness={0.8} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.08, 0.2, Math.sin(angle) * 0.08]}
          rotation={[-0.2, angle + Math.PI / 2, 0]}
        >
          <coneGeometry args={[0.06, 0.15, 3]} />
          <meshStandardMaterial color="#4CAF50" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Candle number "2" ─── */
function NumberTwoCandle({ position, scale = 1 }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.15, 0.4, 0),
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(0.15, 0.4, 0),
        new THREE.Vector3(0.15, 0.2, 0),
        new THREE.Vector3(-0.15, -0.2, 0),
        new THREE.Vector3(-0.15, -0.3, 0),
        new THREE.Vector3(0.2, -0.3, 0),
      ]),
    [],
  );

  return (
    <group position={position} scale={scale}>
      {/* Candle Body - Pastel gloss pink */}
      <mesh castShadow>
        <tubeGeometry args={[curve, 32, 0.055, 16, false]} />
        <meshStandardMaterial
          color="#ffa6c9"
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      {/* Black wick */}
      <mesh position={[-0.15, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ─── Candle number "1" ─── */
function NumberOneCandle({ position, scale = 1 }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.08, 0.32, 0),
        new THREE.Vector3(0, 0.45, 0),
        new THREE.Vector3(0, -0.3, 0),
      ]),
    [],
  );

  return (
    <group position={position} scale={scale}>
      {/* Candle Body - Pastel gloss purple */}
      <mesh castShadow>
        <tubeGeometry args={[curve, 32, 0.055, 16, false]} />
        <meshStandardMaterial
          color="#c8b3f9"
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      {/* Black wick */}
      <mesh position={[0, 0.47, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ─── Flame ─── */
function RealisticFlame({ position }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Tự động flicker quyến rũ
    const s = 1 + Math.sin(t * 22) * 0.08 + Math.random() * 0.04;
    ref.current.scale.set(s, s * 1.15, s);
    ref.current.rotation.z = Math.sin(t * 12) * 0.06;
    ref.current.rotation.y = Math.cos(t * 8) * 0.05;
  });
  return (
    <group ref={ref} position={position}>
      {/* Lớp 1: Aura đỏ cam mờ ảo ngoài cùng */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color="#ff4500"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Lớp 2: Thân lửa vàng cam */}
      <mesh position={[0, 0.06, 0]}>
        <coneGeometry args={[0.085, 0.28, 16]} />
        <meshBasicMaterial
          color="#ffa500"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Lớp 3: Lõi trắng vàng sáng */}
      <mesh position={[0, 0.02, 0]}>
        <coneGeometry args={[0.042, 0.18, 16]} />
        <meshBasicMaterial
          color="#fffae0"
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Lớp 4: Lõi xanh dương nhạt ở chân ngọn lửa */}
      <mesh position={[0, -0.07, 0]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshBasicMaterial
          color="#0077ff"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ─── Cake ─── */
function ThreeDCake({ candleLit }) {
  const flameRef = useRef();
  const groupRef = useRef();

  const sprinkles = useMemo(
    () =>
      Array.from({ length: 40 })
        .map(() => ({
          pos: [(Math.random() - 0.5) * 2.5, 0.45, (Math.random() - 0.5) * 2.5],
          rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
          color: ["#ffffff", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff"][
            Math.floor(Math.random() * 5)
          ],
        }))
        .filter((s) => Math.sqrt(s.pos[0] ** 2 + s.pos[2] ** 2) < 1.25),
    [],
  );

  const drips = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const r = 1.4;
        return {
          x: Math.cos(angle) * r,
          z: Math.sin(angle) * r,
          scale: 0.5 + Math.random() * 0.4,
        };
      }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.1 - 0.3;
      groupRef.current.rotation.y = t * 0.3;
      groupRef.current.rotation.z = 0.05;
    }
    if (flameRef.current && candleLit) {
      const scale = 1 + Math.sin(t * 20) * 0.1 + Math.random() * 0.1;
      flameRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]} scale={0.65}>
      {/* Plate */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[1.6, 1.7, 0.1, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
      </mesh>

      {/* Tier */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[1.4, 1.4, 0.9, 32]} />
        <meshStandardMaterial color="#f7c8d6" roughness={0.6} />
      </mesh>

      {/* Drips */}
      {drips.map((d, i) => (
        <mesh key={`drip-${i}`} position={[d.x, 0.4, d.z]} castShadow>
          <capsuleGeometry args={[0.08, d.scale * 0.4, 4, 8]} />
          <meshStandardMaterial color="#fffcf5" roughness={0.4} />
        </mesh>
      ))}

      {/* Sprinkles */}
      {sprinkles.map((s, i) => (
        <mesh key={`sprinkle-${i}`} position={s.pos} rotation={s.rot}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
          <meshBasicMaterial color={s.color} />
        </mesh>
      ))}

      {/* Strawberries */}
      {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
        <Strawberry
          key={`strawberry-${i}`}
          position={[Math.cos(angle) * 0.85, 0.45, Math.sin(angle) * 0.85]}
          scale={0.8}
          rotation={[0.2, angle, 0]}
        />
      ))}

      {/* Whipped cream dollops & cherries around top rim */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = 1.22;
        const dx = Math.cos(angle) * r;
        const dz = Math.sin(angle) * r;
        return (
          <group key={`dollop-${i}`} position={[dx, 0.45, dz]}>
            {/* Soft whipped cream swirl */}
            <mesh castShadow>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color="#fffef7" roughness={0.3} />
            </mesh>
            {/* Cute glossy cherry on top */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial
                color="#de1f32"
                roughness={0.12}
                metalness={0.1}
              />
            </mesh>
          </group>
        );
      })}

      {/* Candles */}
      <NumberTwoCandle position={[-0.15, 0.6, 0]} scale={0.6} />
      <NumberOneCandle position={[0.15, 0.6, 0]} scale={0.6} />

      {/* Flames (aligned perfectly to wicks: left [-0.24, 0.852, 0], right [0.15, 0.882, 0]) */}
      {candleLit && (
        <group ref={flameRef}>
          <RealisticFlame position={[-0.24, 0.852, 0]} />
          <RealisticFlame position={[0.15, 0.882, 0]} />
          {/* Candle light glow casting onto the cake */}
          <pointLight
            color="#ffcc66"
            intensity={4}
            distance={8}
            decay={1.8}
            position={[0, 1.1, 0.2]}
            castShadow
          />
        </group>
      )}

      {/* Smoke after blow */}
      {!candleLit && (
        <Sparkles
          position={[0, 1.25, 0]}
          count={15}
          scale={1}
          size={4}
          speed={0.8}
          color="#cccccc"
          opacity={0.5}
        />
      )}
    </group>
  );
}

/* ─── Main component ─── */
export default function CelebrationScene() {
  // 'wish-input' → 'candle' → 'blown'
  const [phase, setPhase] = useState("wish-input");
  const [wish, setWish] = useState("");
  const [wishSending, setWishSending] = useState(false);
  const [candleLit, setCandleLit] = useState(true);
  const [fireworksActive, setFireworksActive] = useState(false);
  const [showFinalMsg, setShowFinalMsg] = useState(false);
  const inputRef = useRef(null);

  // Focus textarea when wish-input phase starts
  useEffect(() => {
    if (phase === "wish-input" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [phase]);

  const handleSubmitWish = (skip = false) => {
    const text = skip ? "" : wish.trim();
    if (!skip && text) sendWishNotification(text);
    setWishSending(true);
    setTimeout(
      () => {
        setWishSending(false);
        setPhase("candle");
      },
      skip ? 0 : 700,
    );
  };

  const blowCandle = () => {
    if (!candleLit) return;
    setCandleLit(false);
    setFireworksActive(true);
    setTimeout(() => setShowFinalMsg(true), 1500);
  };

  useEffect(() => {
    if (phase !== "candle") return;
    const handleEnter = (event) => {
      if (event.key !== "Enter" || !candleLit) return;
      event.preventDefault();
      blowCandle();
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [phase, candleLit]);

  const titleText = [..."Happy Birthday! 🎉"];

  return (
    <SceneTransition sceneKey="celebration">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 60%, rgba(200, 176, 139, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 30% 30%, rgba(196, 181, 224, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 80%, rgba(239, 212, 223, 0.1) 0%, transparent 40%),
            #241f2e
          `,
        }}
      />

      {/* ── Phase: Wish Input (before candle) ── */}
      <AnimatePresence>
        {phase === "wish-input" && (
          <motion.div
            key="wish-gate"
            className="absolute inset-0 z-30 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            style={{
              background:
                "radial-gradient(ellipse at 50% 60%, rgba(255,200,80,0.06) 0%, transparent 60%), #241f2e",
            }}
          >
            {/* Floating stars bg */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-200"
                  style={{
                    left: `${Math.random() * 95}%`,
                    top: `${Math.random() * 90}%`,
                    fontSize: `${0.5 + Math.random() * 0.8}rem`,
                    opacity: 0.12 + Math.random() * 0.18,
                  }}
                  animate={{ opacity: [0.1, 0.35, 0.1], y: [0, -8, 0] }}
                  transition={{
                    duration: 3 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                >
                  ★
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 160,
                damping: 22,
              }}
              style={{
                background: "rgba(36, 31, 46, 0.82)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: "1px solid rgba(255,210,80,0.22)",
                borderRadius: 28,
                padding: "2.2rem 2.4rem",
                maxWidth: 420,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
                boxShadow:
                  "0 0 60px rgba(255,200,60,0.08), 0 24px 64px rgba(0,0,0,0.55)",
              }}
            >
              {/* Icon */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                  filter: [
                    "drop-shadow(0 0 6px rgba(255,200,60,0.5))",
                    "drop-shadow(0 0 18px rgba(255,200,60,0.9))",
                    "drop-shadow(0 0 6px rgba(255,200,60,0.5))",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ fontSize: "2.8rem" }}
              >
                🌠
              </motion.div>

              <div style={{ textAlign: "center" }}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#ffdfa0",
                    fontSize: "1.35rem",
                    margin: "0 0 6px 0",
                    fontWeight: 600,
                  }}
                >
                  Hãy ước một điều gì đó...
                </h2>
                <p
                  style={{
                    color: "rgba(251,247,241,0.42)",
                    fontSize: "0.75rem",
                    fontFamily: "'Inter', sans-serif",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Viết điều ước rồi thổi nến — để nó trở thành sự thật ✨
                </p>
              </div>

              <textarea
                ref={inputRef}
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (wish.trim()) handleSubmitWish(false);
                  }
                }}
                placeholder="Điều ước của em..."
                rows={3}
                maxLength={150}
                style={{
                  width: "100%",
                  background: "rgba(255,250,230,0.05)",
                  border: "1px solid rgba(255,210,80,0.28)",
                  borderRadius: 14,
                  padding: "0.8rem 1rem",
                  color: "rgba(255,248,220,0.9)",
                  fontFamily: "'Dancing Script', cursive",
                  fontSize: "1.08rem",
                  lineHeight: 1.65,
                  resize: "none",
                  outline: "none",
                  caretColor: "#ffcc55",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              />

              {/* Submit */}
              <motion.button
                onClick={() => handleSubmitWish(false)}
                disabled={!wish.trim() || wishSending}
                whileHover={
                  wish.trim()
                    ? {
                      scale: 1.04,
                      boxShadow: "0 0 24px rgba(255,200,60,0.35)",
                    }
                    : {}
                }
                whileTap={wish.trim() ? { scale: 0.97 } : {}}
                style={{
                  width: "100%",
                  background: wish.trim()
                    ? "linear-gradient(135deg, #f0c040, #e08820)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${wish.trim() ? "transparent" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 12,
                  padding: "0.62rem 1rem",
                  color: wish.trim() ? "#241f2e" : "rgba(251,247,241,0.25)",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: wish.trim() ? "pointer" : "default",
                  letterSpacing: "0.04em",
                  transition: "all 0.25s",
                }}
              >
                {wishSending ? "✨ Đang gửi..." : "Tiếp ..."}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas (always rendered but behind wish screen) */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0.4, 5.0], fov: 55 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={candleLit ? 0.3 : 0.18} />
          <pointLight
            position={[3, 3, 5]}
            intensity={candleLit ? 0.4 : 0.12}
            color="#ddccb1"
          />

          <Stars
            radius={50}
            depth={50}
            count={2000}
            factor={4}
            saturation={0.5}
            fade
            speed={1.5}
          />
          <Sparkles
            count={80}
            scale={12}
            size={3}
            speed={0.4}
            color="#f8ebf1"
            opacity={0.3}
          />

          {/* Fireflies always visible, brighter when candle lit */}
          <Fireflies count={45} active={candleLit} />

          <ThreeDCake candleLit={candleLit} />

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            maxPolarAngle={Math.PI / 2 + 0.1}
            minDistance={2.5}
            maxDistance={8}
            autoRotate={!candleLit}
            autoRotateSpeed={0.5}
          />

          <Suspense fallback={null}>
            <Fireworks active={fireworksActive} />
          </Suspense>
        </Canvas>
      </div>

      {/* Center UI overlay */}
      <div className="canvas-overlay flex-col gap-8">
        {/* Blow hint */}
        {phase === "candle" && candleLit && (
          <motion.span
            onClick={blowCandle}
            className="absolute bottom-16 left-1/2 cursor-pointer text-center z-20"
            initial={{ opacity: 0, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, scale: [1, 1.05, 1], x: "-50%" }}
            transition={{
              opacity: { delay: 1.5, duration: 0.5 },
              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            }}
            id="blow-candle-button"
            style={{
              background: "rgba(255, 223, 160, 0.15)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1.5px solid rgba(255, 223, 160, 0.45)",
              borderRadius: "24px",
              padding: "10px 24px",
              color: "#ffdfa0",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.88rem",
              fontWeight: 500,
              letterSpacing: "0.06em",
              boxShadow:
                "0 0 20px rgba(255, 223, 160, 0.25), inset 0 0 10px rgba(255, 223, 160, 0.15)",
              userSelect: "none",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            🕯️ chạm nhẹ hoặc nhấn Enter để thổi nến 🕯️
          </motion.span>
        )}

        {/* Final birthday message */}
        {showFinalMsg && (
          <motion.div
            className="flex flex-col items-center gap-4 mt-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl text-center text-shimmer"
              style={{ fontFamily: "'Playfair Display', serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {titleText.map((c, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  {c === " " ? "\u00A0" : c}
                </motion.span>
              ))}
            </motion.h1>

            <motion.div
              className="w-20 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #c8b08b, transparent)",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            />

            <motion.p
              className="text-center text-lg max-w-md handwriting"
              style={{ color: "rgba(251, 247, 241, 0.8)", fontSize: "1.3rem" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              Wishing you all the love, joy, and happiness in the world. You
              deserve the very best! 💖
            </motion.p>

            {/* Animated handwriting signature */}
            <motion.div
              className="flex flex-col items-center gap-1 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "rgba(251, 247, 241, 0.45)",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                With love,
              </span>
              <div
                style={{
                  position: "relative",
                  height: 48,
                  width: 140,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "4px 0",
                }}
              >
                <svg
                  width="120"
                  height="50"
                  viewBox="0 0 120 65"
                  fill="none"
                  style={{ overflow: "visible" }}
                >
                  <motion.path
                    d="M 15 42 Q 20 18 25 18 L 22 48 Q 30 15 36 20 L 40 45 Q 44 32 48 32 Q 50 42 46 45 L 43 58 Q 38 66 44 64 Q 50 60 52 42 Q 56 32 60 32 L 62 45 Q 66 32 70 32 L 72 45 Q 76 32 78 35 L 75 58 Q 70 66 76 64 Q 82 60 84 42 Q 88 32 92 32 Q 94 45 96 45 Q 100 32 104 32 L 106 45 Q 112 50 95 58 Q 40 68 15 62 Q 8 58 35 56 Q 75 52 115 54"
                    stroke="#ffdfa0"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 2.2,
                      ease: "easeInOut",
                      delay: 2.6,
                    }}
                  />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </SceneTransition>
  );
}
