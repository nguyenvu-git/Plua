import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import PetalParticles from './PetalParticles';
import BokehLights from './BokehLights';
import SceneTransition from './SceneTransition';

const titleVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.3,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 1.8, duration: 0.8, ease: 'easeOut' },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 2.4, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
  },
};

const title = "Happy Birthday";

export default function EntranceScene({ onNext }) {
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
    <SceneTransition sceneKey="entrance">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(196, 181, 224, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(239, 212, 223, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(251, 247, 241, 0.12) 0%, transparent 70%),
            linear-gradient(135deg, #241f2e 0%, #2c2538 36%, #30283b 68%, #241f2e 100%)
          `,
        }}
      />

      {/* 3D Canvas with petals and bokeh */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 7], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={0.65} color="#ddccb1" />
          <pointLight position={[-5, -3, 3]} intensity={0.45} color="#cbbfdc" />
          <Suspense fallback={null}>
            <PetalParticles />
            <BokehLights />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="canvas-overlay">
        <div className="flex flex-col items-center gap-6 px-6">
          {/* Staggered title */}
          <motion.h1
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-center font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {title.split('').map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                className="inline-block text-shimmer"
                style={char === ' ' ? { width: '0.3em' } : {}}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={subtitleVariants}
            initial="hidden"
            animate="visible"
            className="text-sm sm:text-lg md:text-xl text-center tracking-wide"
            style={{
              color: 'rgba(251, 247, 241, 0.68)',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              letterSpacing: '0.15em',
            }}
          >
            A dreamy celebration, crafted with love for Pham Lua
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.8, ease: 'easeOut' }}
            className="w-24 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #c8b08b, transparent)' }}
          />

          {/* Subtle hint */}
          <motion.span
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            onClick={onNext}
            className="note-hint mt-6 text-center"
            id="begin-button"
          >
            chạm nhẹ hoặc nhấn Space để bắt đầu
          </motion.span>
        </div>
      </div>
    </SceneTransition>
  );
}
