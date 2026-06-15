import { motion } from 'framer-motion';

export default function NavigationDots({ currentScene, totalScenes, onNavigate }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
      {Array.from({ length: totalScenes }, (_, i) => (
        <motion.button
          key={i}
          onClick={() => onNavigate(i)}
          className="w-3 h-3 rounded-full cursor-pointer border-none p-0"
          style={{
            background: i === currentScene
              ? '#c8b08b'
              : 'rgba(251, 247, 241, 0.25)',
            border: i === currentScene
              ? '2px solid rgba(221, 204, 177, 0.65)'
              : '1px solid rgba(251, 247, 241, 0.22)',
          }}
          whileHover={{ scale: 1.4 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            scale: i === currentScene ? 1.2 : 1,
            boxShadow: i === currentScene
              ? '0 0 10px rgba(200, 176, 139, 0.4)'
              : '0 0 0px rgba(0,0,0,0)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          title={`Scene ${i + 1}`}
          id={`nav-dot-${i}`}
        />
      ))}
    </div>
  );
}
