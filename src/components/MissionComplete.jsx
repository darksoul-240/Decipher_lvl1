import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:<>?/\\~`';

function GlitchText({ text, delay = 0 }) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout;
    timeout = setTimeout(() => {
      let iteration = 0;
      const interval = setInterval(() => {
        setDisplay(
          text
            .split('')
            .map((char, i) => {
              if (char === ' ') return ' ';
              if (i < iteration) return char;
              return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            })
            .join('')
        );
        iteration += 0.5;
        if (iteration > text.length) {
          clearInterval(interval);
          setDisplay(text);
          setDone(true);
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span className={done ? '' : 'opacity-90'}>
      {display}
    </span>
  );
}

export default function MissionComplete({ challenge, elapsedTime, onReturn }) {
  const [showStats, setShowStats] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 2400);
    const t2 = setTimeout(() => setShowButton(true), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const formatTime = (ms) => {
    if (!ms) return '--:--';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden"
      style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-void/95" />

      {/* Radial pulse */}
      <motion.div
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: [0, 3, 5], opacity: [0.6, 0.2, 0] }}
        transition={{ duration: 3, ease: 'easeOut' }}
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(57,255,20,0.4) 0%, rgba(57,255,20,0) 70%)',
        }}
      />

      {/* Scan line sweep */}
      <motion.div
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 2, delay: 0.3, ease: 'linear' }}
        className="absolute left-0 right-0 h-[2px] z-20"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.8), transparent)',
          boxShadow: '0 0 20px rgba(57,255,20,0.6), 0 0 60px rgba(57,255,20,0.3)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-xl">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: [0, 1.4, 1], rotate: [180, 0] }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl mb-8"
        >
          <span
            className="text-neon-green inline-block"
            style={{ textShadow: '0 0 30px rgba(57,255,20,0.6), 0 0 60px rgba(57,255,20,0.3)' }}
          >
            ◈
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-3xl md:text-5xl font-black tracking-[0.3em] text-neon-green mb-4"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            textShadow: '0 0 20px rgba(57,255,20,0.5), 0 0 40px rgba(57,255,20,0.2)',
          }}
        >
          <GlitchText text="BREACH COMPLETE" delay={600} />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-sm tracking-[0.2em] uppercase text-ghost/60 mb-2"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          SECURITY LAYER NEUTRALIZED — PASSPHRASE ACCEPTED
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="text-xs text-ghost/40 mb-10"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          All encrypted data has been decrypted and extracted. Challenge node{' '}
          <span className="text-neon-cyan" style={{ color: challenge?.accent }}>
            {challenge?.title || 'UNKNOWN'}
          </span>{' '}
          has been successfully breached.
        </motion.p>

        {/* Stats */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 grid grid-cols-2 gap-4 max-w-sm mx-auto"
          >
            <div className="glass rounded-lg p-4 border border-neon-green/10">
              <p
                className="text-[9px] tracking-[0.3em] uppercase text-ghost/40 mb-1"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                TIME ELAPSED
              </p>
              <p
                className="text-2xl font-bold text-neon-green"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {formatTime(elapsedTime)}
              </p>
            </div>
            <div className="glass rounded-lg p-4 border border-neon-green/10">
              <p
                className="text-[9px] tracking-[0.3em] uppercase text-ghost/40 mb-1"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                SEC LEVEL
              </p>
              <p
                className="text-2xl font-bold"
                style={{ fontFamily: 'Orbitron, sans-serif', color: challenge?.accent || '#00f0ff' }}
              >
                {challenge?.level?.replace('SEC-LEVEL ', '') || '—'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Return button */}
        {showButton && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(57,255,20,0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onReturn}
            className="
              px-8 py-3 rounded-lg cursor-pointer
              bg-transparent border border-neon-green/30 hover:border-neon-green/60
              text-neon-green font-bold tracking-[0.3em] uppercase text-sm
              transition-colors duration-300
            "
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            RETURN TO HQ
          </motion.button>
        )}

        {/* Scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.03) 2px, rgba(57,255,20,0.03) 4px)',
          }}
        />
      </div>
    </motion.div>
  );
}
