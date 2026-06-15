import { useState, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import EntranceScene from './components/EntranceScene';
import MemorySphereScene from './components/MemorySphereScene';
import LetterScene from './components/LetterScene';
import CelebrationScene from './components/CelebrationScene';
import MusicToggle from './components/MusicToggle';
import NavigationDots from './components/NavigationDots';

const TOTAL_SCENES = 4;

export default function App() {
  const [currentScene, setCurrentScene] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  const goToScene = useCallback((index) => {
    if (index >= 0 && index < TOTAL_SCENES) {
      setCurrentScene(index);
    }
  }, []);

  const nextScene = useCallback(() => {
    setCurrentScene((prev) => Math.min(prev + 1, TOTAL_SCENES - 1));
  }, []);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/music/birthday.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    if (musicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => { });
    }
    setMusicPlaying((prev) => !prev);
  }, [musicPlaying]);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#241f2e' }}>
      {/* Floating brand signature */}
      <div
        className="absolute top-6 left-6 sm:left-8 z-50 pointer-events-none select-none"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '1.15rem',
          color: 'rgba(251, 247, 241, 0.35)',
          letterSpacing: '0.18em',
          textTransform: 'none',
          fontWeight: 400,
        }}
      >
        Pham Lua ྀིྀི
      </div>

      <AnimatePresence mode="wait">
        {currentScene === 0 && (
          <EntranceScene key="scene-0" onNext={nextScene} />
        )}
        {currentScene === 1 && (
          <MemorySphereScene key="scene-1" onNext={nextScene} />
        )}
        {currentScene === 2 && (
          <LetterScene key="scene-2" onNext={nextScene} />
        )}
        {currentScene === 3 && (
          <CelebrationScene key="scene-3" />
        )}
      </AnimatePresence>

      {/* Navigation dots - visible after entering */}
      {currentScene > 0 && (
        <NavigationDots
          currentScene={currentScene}
          totalScenes={TOTAL_SCENES}
          onNavigate={goToScene}
        />
      )}

      {/* Music toggle */}
      <MusicToggle isPlaying={musicPlaying} onToggle={toggleMusic} />
    </div>
  );
}
