import { useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import ParticleField from './components/ParticleField';
import GlitchTitle from './components/GlitchTitle';
import ChallengeNodes from './components/ChallengeNodes';
import TerminalFeed from './components/TerminalFeed';
import BeginTrainingCTA from './components/BeginTrainingCTA';
import HexGrid from './components/HexGrid';
import SystemStats from './components/SystemStats';
import NavBar from './components/NavBar';

function App() {
  const terminalRef = useRef(null);
  const [isZooming, setIsZooming] = useState(false);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll();

  // Parallax transforms for morphing scroll — using motion values (no re-renders)
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const handleNodeInteract = useCallback((message) => {
    terminalRef.current?.addLine(message, message.includes('DENIED') ? 'error' : 'action');
  }, []);

  const handleBeginTraining = useCallback(() => {
    terminalRef.current?.addLine('INITIATING TRAINING SEQUENCE...', 'warning');
    terminalRef.current?.addLine('Decrypting challenge payload...', 'system');

    setTimeout(() => {
      terminalRef.current?.addLine('ACCESS GRANTED — Entering Cipher Breach...', 'action');
      setIsZooming(true);

      setTimeout(() => {
        setIsZooming(false);
        terminalRef.current?.addLine('Training simulation loaded.', 'system');
      }, 2000);
    }, 800);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Overlays */}
      <div className="scanline-overlay" />
      <ParticleField />

      {/* Nav */}
      <NavBar />

      {/* Cinematic zoom overlay */}
      <AnimatePresence>
        {isZooming && (
          <motion.div
            key="zoom-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-void"
          >
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 30, opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
              className="text-neon-cyan text-6xl font-bold"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              ◈
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <motion.section
        id="protocol"
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20"
      >
        <HexGrid />

        {/* System Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8 flex items-center gap-4"
        >
          <div className="h-[1px] w-12 bg-neon-cyan/20" />
          <span
            className="text-[10px] tracking-[0.5em] uppercase text-neon-cyan/40 border border-neon-cyan/10 px-4 py-1.5 rounded-full"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            ◈ SYSTEM OVERRIDE ACTIVE ◈
          </span>
          <div className="h-[1px] w-12 bg-neon-cyan/20" />
        </motion.div>

        {/* Title */}
        <GlitchTitle />

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 flex flex-col items-center gap-3"
        >
          <span
            className="text-[10px] tracking-[0.3em] uppercase text-ghost/30"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Scroll to access
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-4 h-7 rounded-full border border-ghost/20 flex items-start justify-center pt-1"
          >
            <motion.div className="w-1 h-2 rounded-full bg-neon-cyan/50" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══════════ STATS SECTION ═══════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-12 justify-center">
            <div className="h-[1px] flex-1 max-w-24 bg-gradient-to-r from-transparent to-neon-cyan/20" />
            <h2
              className="text-[11px] tracking-[0.5em] uppercase text-ghost/40"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              SYSTEM DIAGNOSTICS
            </h2>
            <div className="h-[1px] flex-1 max-w-24 bg-gradient-to-l from-transparent to-neon-cyan/20" />
          </div>

          <SystemStats />
        </div>
      </section>

      {/* ═══════════ CHALLENGE NODES SECTION ═══════════ */}
      <section id="nodes" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2
              className="text-2xl md:text-3xl font-bold tracking-wider text-white-pure mb-3"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              CHALLENGE NODES
            </h2>
            <p
              className="text-sm text-ghost/50 tracking-wider"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Select a security node to begin your infiltration sequence
            </p>
          </motion.div>

          {/* Main Content: Nodes + Terminal */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <ChallengeNodes onNodeInteract={handleNodeInteract} />
            </div>

            {/* Terminal Sidebar */}
            <div className="w-full lg:w-auto lg:sticky lg:top-24 flex-shrink-0">
              <TerminalFeed ref={terminalRef} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ INTEL / CTA SECTION ═══════════ */}
      <section id="intel" className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Mission Brief */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-8 md:p-12 mb-16 text-left border-pulse"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-neon-amber animate-pulse" />
              <span
                className="text-[10px] tracking-[0.4em] uppercase text-neon-amber/70"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                CLASSIFIED BRIEFING
              </span>
            </div>

            <h3
              className="text-xl md:text-2xl font-bold text-white-pure mb-4"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              MISSION PARAMETERS
            </h3>

            <div
              className="text-sm text-ghost/70 leading-relaxed space-y-3"
              style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem' }}
            >
              <p>
                You have been selected to attempt <span className="text-neon-cyan">The Cryptographic Gauntlet</span> —
                a multi-layered digital escape room designed to test your skills in cryptography,
                pattern recognition, and systems exploitation.
              </p>
              <p>
                Each challenge node represents a unique security layer. Breach all four to
                reach the <span className="text-neon-magenta">core cipher</span> and prove your worth as an operator.
              </p>
              <p className="text-neon-amber/60 text-xs tracking-wider uppercase pt-2">
                ⚠ Warning: Failed attempts are logged. Proceed with precision.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <BeginTrainingCTA onClick={handleBeginTraining} />
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-[10px] tracking-[0.3em] uppercase text-ghost/30"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            GAUNTLET OS v3.7.2 — © 2026 CRYPTOGRAPHIC DIVISION
          </span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green/60" />
            <span
              className="text-[9px] tracking-[0.2em] uppercase text-ghost/30"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ALL SYSTEMS NOMINAL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
