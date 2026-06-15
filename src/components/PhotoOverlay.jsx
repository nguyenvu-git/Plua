import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const captions = [
  'May your days be bright and beautiful ✨',
  'Keep shining, the world needs your light 🌟',
  'Wishing you endless joy and warm laughter 🌸',
  'May all your wildest dreams come true 💫',
  'Love yourself fiercely, always 💖',
  'Embrace the beautiful journey ahead 🌿',
  'May peace and happiness follow you 🍃',
  'Be bold, be brave, be uniquely you 🦋',
  'Cherish every little moment of joy 🧸',
  'Here’s to a beautiful new chapter 🎂',
];

export default function PhotoOverlay({ selectedIndex, onClose }) {
  return (
    <AnimatePresence>
      {selectedIndex !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          style={{ background: 'rgba(10, 8, 15, 0.7)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            className="max-w-lg w-full p-10 flex flex-col items-center gap-8 relative"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(30, 24, 38, 0.85)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '2px solid rgba(212, 168, 83, 0.35)', // Viền vàng gold rõ ràng và dày hơn
              borderRadius: '28px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 168, 83, 0.15)',
            }}
          >
            {/* Ambient Background Glow behind the card */}
            <div
              className="absolute -inset-1 rounded-[32px] opacity-30 blur-2xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #D4A853 0%, #cbbfdc 50%, transparent 100%)',
              }}
            />

            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-none z-10"
              style={{
                background: 'rgba(255, 248, 240, 0.08)',
                border: '1px solid rgba(255, 248, 240, 0.15)',
              }}
              whileHover={{ scale: 1.1, rotate: 90, background: 'rgba(255, 248, 240, 0.18)' }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={18} color="#FFF8F0" />
            </motion.button>

            {/* Polaroid Photo Frame */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, rotate: -6 }}
              animate={{ scale: 1, opacity: 1, rotate: -2 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 20 }}
              whileHover={{ rotate: 1, scale: 1.03 }}
              style={{
                background: '#fdfaf5',
                padding: '18px 18px 48px 18px', // Tăng padding lề Polaroid
                borderRadius: '6px',
                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65), 0 4px 12px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255,255,255,1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '300px', // Tăng kích thước ảnh Polaroid
                position: 'relative',
              }}
            >
              <div
                className="w-full aspect-square overflow-hidden rounded-sm"
                style={{
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: '#eae6df',
                }}
              >
                <img
                  src={`/photos/${selectedIndex + 1}.jpg`}
                  alt={`Memory ${selectedIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (!e.target.src.endsWith('.png')) {
                      e.target.src = `/photos/${selectedIndex + 1}.png`;
                    }
                  }}
                />
              </div>
              {/* Subtle polaroid description at the bottom margin of the paper */}
              <span
                className="handwriting"
                style={{
                  marginTop: '12px',
                  color: '#5c4b37',
                  fontSize: '1.05rem',
                  opacity: 0.85,
                  transform: 'rotate(-1deg)'
                }}
              >
                Memory #{selectedIndex + 1}
              </span>
            </motion.div>

            {/* Typography Section */}
            <div className="flex flex-col items-center gap-2 mt-2 w-full z-10">
              {/* Caption */}
              <motion.p
                className="text-center"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: '#D4A853',
                  fontSize: '1.4rem',
                  letterSpacing: '0.02em',
                  textShadow: '0 2px 10px rgba(212, 168, 83, 0.15)',
                  margin: 0,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                "{captions[selectedIndex % captions.length]}"
              </motion.p>

              {/* Decorative divider */}
              <motion.div
                className="w-20 h-px my-1"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(212, 168, 83, 0.5), transparent)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              />

              {/* Description */}
              <motion.p
                className="text-center text-sm leading-relaxed"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: 'rgba(255, 248, 240, 0.6)',
                  fontWeight: 300,
                  maxWidth: '300px',
                  margin: 0,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >

              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
