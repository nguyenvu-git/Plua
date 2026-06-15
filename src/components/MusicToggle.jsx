import { motion } from 'framer-motion';
import { Music, VolumeX } from 'lucide-react';

export default function MusicToggle({ isPlaying, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full glass flex items-center justify-center cursor-pointer border-none"
      style={{
        background: 'rgba(251, 247, 241, 0.14)',
        border: '1px solid rgba(221, 204, 177, 0.35)',
      }}
      whileHover={{ scale: 1.1, borderColor: 'rgba(221, 204, 177, 0.65)' }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      title={isPlaying ? 'Pause music' : 'Play music'}
      id="music-toggle"
    >
      {isPlaying ? (
        <Music size={20} color="#c8b08b" />
      ) : (
        <VolumeX size={20} color="#b4a6cb" />
      )}
    </motion.button>
  );
}
