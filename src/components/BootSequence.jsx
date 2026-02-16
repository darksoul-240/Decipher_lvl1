import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  { text: '[ BIOS ]  POST check .................. OK', delay: 200 },
  { text: '[ BIOS ]  Memory 32768 MB ............. OK', delay: 500 },
  { text: '[ KERN ]  Loading GAUNTLET OS v3.7.2', delay: 900 },
  { text: '[ KERN ]  Mounting encrypted volumes ... OK', delay: 1300 },
  { text: '[ CRYPT]  Initializing cipher engines', delay: 1700 },
  { text: '[ CRYPT]  Vigenère module .............. LOADED', delay: 2100 },
  { text: '[ CRYPT]  RSA-4096 subsystem ........... LOADED', delay: 2400 },
  { text: '[ NET  ]  Secure tunnel established', delay: 2800 },
  { text: '[ GUARD]  Threat detection ............. ACTIVE', delay: 3200 },
  { text: '[ GATE ]  Time-gate synchronization .... SYNCED', delay: 3600 },
  { text: '[ BOOT ]  ████████████████████████ 100%', delay: 4000 },
  { text: '[ BOOT ]  System ready. Awaiting operator.', delay: 4500 },
];

export default function BootSequence({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Skip if already booted this session
  useEffect(() => {
    if (sessionStorage.getItem('gauntlet_booted')) {
      onComplete();
      setDismissed(true);
      return;
    }

    const timers = BOOT_LINES.map(({ text, delay }) =>
      setTimeout(() => setLines((prev) => [...prev, text]), delay)
    );

    const doneTimer = setTimeout(() => {
      setDone(true);
      sessionStorage.setItem('gauntlet_booted', 'true');
    }, 5000);

    const dismissTimer = setTimeout(() => {
      setDismissed(true);
      onComplete();
    }, 6200);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
      clearTimeout(dismissTimer);
    };
  }, [onComplete]);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="boot-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 100%)' }}
        >
          <div className="w-full max-w-2xl px-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <h1
                className="text-2xl sm:text-3xl font-bold tracking-[0.4em] text-neon-cyan text-glow-cyan"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                GAUNTLET OS
              </h1>
              <p
                className="text-[10px] tracking-[0.5em] uppercase text-ghost/40 mt-2"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                CRYPTOGRAPHIC SUBSYSTEM INITIALIZATION
              </p>
            </motion.div>

            {/* Boot log */}
            <div
              className="glass rounded-lg p-6 font-mono text-xs leading-loose max-h-80 overflow-hidden border border-neon-cyan/10"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-neon-green/80"
                >
                  {line}
                </motion.div>
              ))}

              {/* Blinking cursor */}
              {!done && (
                <span className="inline-block w-2 h-4 bg-neon-cyan/80 cursor-blink ml-1 align-middle" />
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-1 w-full rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: done ? '100%' : `${(lines.length / BOOT_LINES.length) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-violet))',
                  boxShadow: '0 0 12px rgba(0,240,255,0.4)',
                }}
              />
            </div>

            {/* Ready message */}
            <AnimatePresence>
              {done && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-center mt-6 text-[11px] tracking-[0.3em] uppercase text-neon-cyan/60"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  ◈ SYSTEM ONLINE — ENTERING OPERATIONAL MODE ◈
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
