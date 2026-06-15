import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Wax Seal SVG ── */
function WaxSeal({ breaking, onBreakDone }) {
  return (
    <motion.div
      style={{ position: 'absolute', bottom: 18, left: '50%', translateX: '-50%', zIndex: 10 }}
      animate={
        breaking
          ? { scale: [1, 1.3, 0.8], opacity: [1, 1, 0], rotate: [0, -8, 12] }
          : { scale: [1, 1.08, 1] }
      }
      transition={
        breaking
          ? { duration: 0.55, ease: 'easeInOut', onComplete: onBreakDone }
          : { duration: 1.8, repeat: Infinity }
      }
    >
      <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
        {/* Outer ring glow */}
        <circle cx="27" cy="27" r="25" fill="url(#sealGrad)" opacity="0.95" />
        <circle cx="27" cy="27" r="22" fill="none" stroke="rgba(255,220,140,0.5)" strokeWidth="1.2" />
        {/* Inner emboss ring */}
        <circle cx="27" cy="27" r="18" fill="none" stroke="rgba(180,80,60,0.4)" strokeWidth="0.8" />
        {/* Stylized 'plua' stamp monogram */}
        <circle cx="27" cy="27" r="13" fill="rgba(110, 26, 16, 0.45)" stroke="rgba(255,220,140,0.3)" strokeWidth="0.8" />
        <text
          x="27"
          y="31.5"
          textAnchor="middle"
          fill="rgba(255, 235, 170, 0.95)"
          fontSize="10.5"
          fontWeight="bold"
          fontStyle="italic"
          fontFamily="'Dancing Script', 'Playfair Display', cursive"
          style={{
            filter: 'drop-shadow(0.5px 1px 0.5px rgba(0,0,0,0.55))',
            letterSpacing: '0.02em',
          }}
        >
          plua
        </text>
        {/* Defs */}
        <defs>
          <radialGradient id="sealGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#c0392b" />
            <stop offset="60%" stopColor="#96281b" />
            <stop offset="100%" stopColor="#6e1a10" />
          </radialGradient>
        </defs>
      </svg>
      {/* Glow ring */}
      {!breaking && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            background: 'transparent',
            boxShadow: '0 0 16px 6px rgba(200, 60, 40, 0.45)',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

export default function Envelope({ onOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sealBreaking, setSealBreaking] = useState(false);
  const [sealGone, setSealGone] = useState(false);
  const [showLetter, setShowLetter] = useState(false);

  const handleClick = () => {
    if (isOpen) return;
    // Phase 1: break the seal
    setSealBreaking(true);
  };

  const onBreakDone = () => {
    setSealGone(true);
    setIsOpen(true);
    setTimeout(() => setShowLetter(true), 700);
    setTimeout(() => onOpen?.(), 800);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <AnimatePresence mode="wait">
        {!showLetter && (
          <motion.div
            key="envelope"
            className="relative cursor-pointer"
            onClick={handleClick}
            whileHover={!isOpen ? { scale: 1.03, y: -6 } : {}}
            whileTap={!isOpen ? { scale: 0.98 } : {}}
            initial={{ scale: 0, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -60 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ width: 300, height: 210 }}
          >
            {/* Envelope body */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,248,240,0.16), rgba(212,168,83,0.12))',
                border: '1px solid rgba(212,168,83,0.35)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Inner gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 40%, rgba(212,168,83,0.06) 100%)',
                }}
              />
              {/* Bottom V-crease */}
              <svg
                viewBox="0 0 300 210"
                className="absolute inset-0 w-full h-full"
                style={{ opacity: 0.28 }}
              >
                <path d="M 0 0 L 150 125 L 300 0" fill="none" stroke="#D4A853" strokeWidth="1" />
              </svg>
            </div>

            {/* Flap */}
            <motion.div
              className="absolute -top-1 left-0 right-0"
              style={{ height: 108, transformOrigin: 'top center', perspective: 600 }}
              animate={isOpen ? { rotateX: 180 } : { rotateX: 0 }}
              transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            >
              <svg viewBox="0 0 300 108" className="w-full h-full">
                <defs>
                  <linearGradient id="flapGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(212,168,83,0.18)" />
                    <stop offset="100%" stopColor="rgba(196,181,224,0.12)" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 0 L 300 0 L 150 102 Z"
                  fill="url(#flapGrad)"
                  stroke="rgba(212,168,83,0.32)"
                  strokeWidth="1"
                />
              </svg>
            </motion.div>

            {/* Wax Seal */}
            {!sealGone && (
              <WaxSeal breaking={sealBreaking} onBreakDone={onBreakDone} />
            )}

            {/* Tap hint */}
            {!isOpen && (
              <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap note-hint">
                chạm để phá con dấu
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
