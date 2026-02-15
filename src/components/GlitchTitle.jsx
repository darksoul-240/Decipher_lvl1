import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789';

export default function GlitchTitle({ text = 'THE GAUNTLET' }) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const triggerGlitch = () => {
      setIsGlitching(true);
      let iterations = 0;
      const maxIterations = 8;

      const interval = setInterval(() => {
        setDisplayText(
          text
            .split('')
            .map((char, idx) => {
              if (char === ' ') return ' ';
              if (idx < iterations) return text[idx];
              return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            })
            .join('')
        );

        iterations += 1;
        if (iterations > maxIterations) {
          clearInterval(interval);
          setDisplayText(text);
          setIsGlitching(false);
        }
      }, 50);

      return () => clearInterval(interval);
    };

    // Initial glitch
    triggerGlitch();

    // Periodic glitches
    const periodicGlitch = setInterval(triggerGlitch, 5000 + Math.random() * 3000);
    return () => clearInterval(periodicGlitch);
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <h1
        className="glitch-text font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-wider text-white-pure"
        data-text={displayText}
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      >
        <span className={isGlitching ? 'text-glow-cyan' : 'text-glow-cyan'}>
          {displayText}
        </span>
      </h1>

      {/* Decorative subtitle */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 flex items-center gap-4"
      >
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-neon-violet to-transparent opacity-40" />
        <span
          className="text-xs sm:text-sm tracking-[0.4em] uppercase text-neon-cyan/70"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          Level 1 — The Cryptographic Gauntlet
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-neon-violet to-transparent opacity-40" />
      </motion.div>
    </motion.div>
  );
}
