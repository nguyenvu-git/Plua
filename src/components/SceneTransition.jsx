import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: 'blur(10px)',
    transition: { duration: 0.6, ease: 'easeIn' },
  },
};

export default function SceneTransition({ children, sceneKey }) {
  return (
    <motion.div
      key={sceneKey}
      className="scene"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
