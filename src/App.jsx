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
import BootSequence from './components/BootSequence';
import GauntletChallenge from './components/GauntletChallenge';
import SystemPurged from './components/SystemPurged';
import MissionComplete from './components/MissionComplete';
import AdminPanel from './components/AdminPanel';
import useMissionTimer from './hooks/useMissionTimer';
import { getActiveSlotId, CHALLENGES_CONFIG } from './config/challengesConfig';

function App() {
  const terminalRef = useRef(null);
  const [booted, setBooted] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState(() => getActiveSlotId());
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [showPurged, setShowPurged] = useState(false);
  const [completedChallenge, setCompletedChallenge] = useState(null);
  const [completionElapsed, setCompletionElapsed] = useState(null);
  const containerRef = useRef(null);

  const timer = useMissionTimer();

  const { scrollYProgress } = useScroll();

  // Parallax transforms for morphing scroll
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const handleNodeInteract = useCallback((message) => {
    terminalRef.current?.addLine(message, message.includes('DENIED') ? 'error' : 'action');
  }, []);

  // Called when user clicks an unlocked node
  const handleStartChallenge = useCallback(
    (challenge) => {
      // If timer is already running for a different challenge, don't allow switch
      if (timer.isRunning && timer.challengeId !== challenge.id) {
        terminalRef.current?.addLine(
          `DENIED — Active mission in progress for another challenge.`,
          'error'
        );
        return;
      }

      // Start timer if not already running
      if (!timer.isRunning) {
        timer.startMission(challenge.id);
        terminalRef.current?.addLine(`MISSION STARTED — 30:00 countdown initiated.`, 'warning');
      }

      setActiveChallenge(challenge);
    },
    [timer]
  );

  // Called when timer expires inside GauntletChallenge
  const handleTimerExpired = useCallback(() => {
    setShowPurged(true);
  }, []);

  // Called when user clicks "RE-INITIALIZE" on SystemPurged
  const handlePurgedReset = useCallback(() => {
    timer.clearMission();
    setShowPurged(false);
    setActiveChallenge(null);
  }, [timer]);

  // Close the challenge view (abort) — clears timer so it doesn't tick while user is on landing
  const handleCloseChallenge = useCallback(() => {
    console.log(
      `%c[GAUNTLET] ⛔ ABORT — returning to HQ%c\n` +
      `  Timer cleared. Challenge abandoned.\n` +
      `  Time: ${new Date().toLocaleString()}`,
      'color: #ff073a; font-weight: bold; font-size: 14px;',
      'color: #ff073a;'
    );
    timer.clearMission();
    setActiveChallenge(null);
    terminalRef.current?.addLine('MISSION ABORTED — Timer reset.', 'error');
  }, [timer]);

  // Called when admin panel changes the active slot
  const handleSlotChange = useCallback((newId) => {
    setActiveSlotId(newId);
  }, []);

  // Called when user completes a challenge inside GauntletChallenge
  const handleChallengeComplete = useCallback(
    (challenge) => {
      // Calculate elapsed time from timer's stored start
      let elapsed = null;
      try {
        const raw = localStorage.getItem('gauntlet_mission');
        if (raw) {
          const data = JSON.parse(raw);
          elapsed = Date.now() - data.startTime;
        }
      } catch { /* ignore */ }

      console.log(
        `%c[GAUNTLET] ✅ MISSION COMPLETE%c\n` +
        `  Challenge: ${challenge.title} (ID: ${challenge.id})\n` +
        `  Level: ${challenge.level}\n` +
        `  Completed at: ${new Date().toLocaleString()}\n` +
        `  Elapsed: ${elapsed ? Math.floor(elapsed / 1000) + 's' : 'unknown'}`,
        'color: #39ff14; font-weight: bold; font-size: 16px;',
        'color: #39ff14;'
      );

      // Store elapsed before clearing timer
      setCompletionElapsed(elapsed);
      setCompletedChallenge(challenge);
      timer.clearMission();
      setActiveChallenge(null);
      terminalRef.current?.addLine(
        `CHALLENGE ${challenge.title} — BREACH SUCCESSFUL ✓`,
        'action'
      );
    },
    [timer]
  );

  // Called when user clicks "RETURN TO HQ" on MissionComplete screen
  const handleCompleteReturn = useCallback(() => {
    setCompletedChallenge(null);
    setCompletionElapsed(null);
  }, []);

  // On boot — also check if there's an active timer from a previous session
  const handleBootComplete = useCallback(() => {
    setBooted(true);
    // If timer is running from a previous session, auto-open that challenge
    if (timer.isRunning && timer.challengeId !== null) {
      const ch = CHALLENGES_CONFIG.find((c) => c.id === timer.challengeId);
      if (ch) {
        if (timer.expired) {
          setShowPurged(true);
        } else {
          setActiveChallenge(ch);
        }
      }
    }
  }, [timer]);

  const handleBeginTraining = useCallback(() => {
    terminalRef.current?.addLine('INITIATING TRAINING SEQUENCE...', 'warning');
    terminalRef.current?.addLine('Decrypting challenge payload...', 'system');

    setTimeout(() => {
      terminalRef.current?.addLine('ACCESS GRANTED — Scroll to CHALLENGE NODES.', 'action');
      // Scroll to nodes section
      document.getElementById('nodes')?.scrollIntoView({ behavior: 'smooth' });
    }, 800);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Boot Sequence */}
      <BootSequence onComplete={handleBootComplete} />

      {/* Admin Panel — Ctrl+Shift+G to toggle */}
      <AdminPanel onSlotChange={handleSlotChange} />

      {/* System Purged Overlay */}
      <AnimatePresence>
        {showPurged && <SystemPurged onReset={handlePurgedReset} />}
      </AnimatePresence>

      {/* Mission Complete Overlay */}
      <AnimatePresence>
        {completedChallenge && (
          <MissionComplete
            challenge={completedChallenge}
            elapsedTime={completionElapsed}
            onReturn={handleCompleteReturn}
          />
        )}
      </AnimatePresence>

      {/* Challenge View Overlay */}
      <AnimatePresence>
        {activeChallenge && !showPurged && !completedChallenge && (
          <GauntletChallenge
            challenge={activeChallenge}
            timer={timer}
            onClose={handleCloseChallenge}
            onComplete={handleChallengeComplete}
            onTimerExpired={handleTimerExpired}
          />
        )}
      </AnimatePresence>

      {/* ═══════════ LANDING PAGE ═══════════ */}
      {booted && (
        <>
          {/* Overlays */}
          <div className="scanline-overlay" />
          <div className="aurora-overlay" />
          <ParticleField />

          {/* Nav */}
          <NavBar />

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

            {/* Active mission timer banner (visible on landing if timer is running) */}
            {timer.isRunning && !activeChallenge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 glass rounded-lg px-6 py-3 border border-neon-amber/20 cursor-pointer"
                onClick={() => {
                  const ch = CHALLENGES_CONFIG.find((c) => c.id === timer.challengeId);
                  if (ch) setActiveChallenge(ch);
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-neon-amber animate-pulse" />
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase text-neon-amber/70"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    ACTIVE MISSION — {timer.minutes}:{timer.seconds} remaining
                  </span>
                  <span className="text-neon-amber/50 text-xs">▸ RESUME</span>
                </div>
              </motion.div>
            )}

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
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-violet/20 to-transparent" />
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-4 mb-12 justify-center">
                <div className="h-[1px] flex-1 max-w-24 bg-gradient-to-r from-transparent to-neon-violet/20" />
                <h2
                  className="text-[11px] tracking-[0.5em] uppercase text-ghost/40"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  SYSTEM DIAGNOSTICS
                </h2>
                <div className="h-[1px] flex-1 max-w-24 bg-gradient-to-l from-transparent to-neon-violet/20" />
              </div>
              <SystemStats />
            </div>
          </section>

          {/* ═══════════ CHALLENGE NODES SECTION ═══════════ */}
          <section id="nodes" className="relative z-10 py-20 px-6">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 40%, rgba(139,92,246,0.04), transparent)' }} />
            <div className="max-w-6xl mx-auto">
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

              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1">
                  <ChallengeNodes
                    activeSlotId={activeSlotId}
                    onNodeInteract={handleNodeInteract}
                    onStartChallenge={handleStartChallenge}
                  />
                </div>

                <div className="w-full lg:w-auto lg:sticky lg:top-24 flex-shrink-0">
                  <TerminalFeed ref={terminalRef} />
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════ INTEL / CTA SECTION ═══════════ */}
          <section id="intel" className="relative z-10 py-32 px-6">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-magenta/15 to-transparent" />
            <div className="max-w-4xl mx-auto text-center">
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
                    Each challenge node represents a unique security layer. Only <span className="text-neon-green">one node</span> is
                    unlocked at a time by the operator. Once you start decryption, you have{' '}
                    <span className="text-neon-red">30 minutes</span> to complete the challenge before the system purges all data.
                  </p>
                  <p className="text-neon-amber/60 text-xs tracking-wider uppercase pt-2">
                    ⚠ Warning: The timer persists across page refreshes. Failed attempts are logged. Proceed with precision.
                  </p>
                </div>
              </motion.div>

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
        </>
      )}
    </div>
  );
}

export default App;
