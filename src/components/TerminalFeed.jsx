import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';

const BOOT_SEQUENCE = [
  { text: '> SYSTEM BOOT v3.7.2 — GAUNTLET OS', delay: 0 },
  { text: '> Initializing cryptographic subsystems...', delay: 400 },
  { text: '> Loading neural-pathway drivers... [OK]', delay: 900 },
  { text: '> Establishing secure tunnel... [OK]', delay: 1400 },
  { text: '> Quantum entropy pool: SEEDED', delay: 1800 },
  { text: '> Threat detection: ACTIVE', delay: 2200 },
  { text: '> ████████████████████ 100%', delay: 2600 },
  { text: '> System ready. Awaiting operator input.', delay: 3200 },
  { text: '>', delay: 3600 },
];

const TerminalFeed = forwardRef(function TerminalFeed(_, ref) {
  const [lines, setLines] = useState([]);
  const scrollRef = useRef(null);

  // Boot sequence
  useEffect(() => {
    const timers = BOOT_SEQUENCE.map(({ text, delay }) =>
      setTimeout(() => {
        setLines((prev) => [...prev, { text, timestamp: new Date(), type: 'system' }]);
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Expose addLine method
  useImperativeHandle(ref, () => ({
    addLine: (text, type = 'action') => {
      setLines((prev) => [
        ...prev,
        { text: `> ${text}`, timestamp: new Date(), type },
      ]);
    },
  }));

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const getLineColor = (type) => {
    switch (type) {
      case 'system': return 'text-neon-cyan/60';
      case 'action': return 'text-neon-green';
      case 'error': return 'text-neon-red';
      case 'warning': return 'text-neon-amber';
      default: return 'text-ghost';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong rounded-xl overflow-hidden w-full max-w-md border border-neon-cyan/10"
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-red/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-neon-amber/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-neon-green/80" />
        </div>
        <span
          className="text-[10px] tracking-[0.3em] uppercase text-ghost/50"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          GAUNTLET://terminal
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="text-[9px] text-neon-green/70 uppercase tracking-widest">live</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        className="p-4 h-64 overflow-y-auto font-mono text-xs leading-relaxed"
        style={{ scrollbarWidth: 'thin' }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${getLineColor(line.type)} mb-1`}
            style={{ animation: 'fadeSlideIn 0.25s ease-out' }}
          >
            <span className="text-ghost/30 mr-2">
              {line.timestamp.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            {line.text}
          </div>
        ))}

        {/* Blinking cursor */}
        <div className="flex items-center gap-1 text-neon-cyan mt-1">
          <span>{'>'}</span>
          <span className="cursor-blink inline-block w-2 h-4 bg-neon-cyan/80" />
        </div>
      </div>
    </motion.div>
  );
});

export default TerminalFeed;
