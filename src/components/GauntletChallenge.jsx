import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vigenereEncrypt, validateKey } from '../utils/vigenere';
import MissionTimer from './MissionTimer';

const PHASES = {
  INTERCEPT: 'intercept',
  DECRYPTING: 'decrypting',
  COORDINATES: 'coordinates',
  SUCCESS: 'success',
};

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

export default function GauntletChallenge({
  challenge,
  timer,
  onClose,
  onComplete,
  onTimerExpired,
}) {
  const [phase, setPhase] = useState(PHASES.INTERCEPT);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [answerError, setAnswerError] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [terminalLines, setTerminalLines] = useState([]);
  const keyInputRef = useRef(null);
  const answerInputRef = useRef(null);
  const animationRef = useRef(null);

  // Compute the encrypted text once
  const ciphertext = useMemo(
    () => vigenereEncrypt(challenge.plaintext, challenge.vigenereKey),
    [challenge.plaintext, challenge.vigenereKey]
  );

  // Compute the Base64-encoded clue if present
  const base64Encoded = useMemo(() => {
    if (!challenge.base64Clue?.raw) return null;
    try {
      return btoa(challenge.base64Clue.raw);
    } catch {
      return btoa(unescape(encodeURIComponent(challenge.base64Clue.raw)));
    }
  }, [challenge.base64Clue]);

  // Format ciphertext into blocks of 5 with line breaks
  const formatText = useCallback((text) => {
    const alphaOnly = text.replace(/[^A-Z]/g, '');
    const blocks = [];
    for (let i = 0; i < alphaOnly.length; i += 5) {
      blocks.push(alphaOnly.slice(i, i + 5));
    }
    // 6 blocks per line
    const lines = [];
    for (let i = 0; i < blocks.length; i += 6) {
      lines.push(blocks.slice(i, i + 6).join('  '));
    }
    return lines.join('\n');
  }, []);

  // Initialize display
  useEffect(() => {
    setDisplayText(formatText(ciphertext));
    addTerminalLine('Intercepted encrypted transmission...', 'system');
    addTerminalLine('Cipher type: VIGENÈRE POLYALPHABETIC', 'system');
    addTerminalLine('Awaiting decryption key input.', 'warning');
  }, [ciphertext, formatText]);

  // Watch for timer expiry
  useEffect(() => {
    if (timer.expired && timer.isRunning) {
      onTimerExpired?.();
    }
  }, [timer.expired, timer.isRunning, onTimerExpired]);

  // Focus key input on mount
  useEffect(() => {
    setTimeout(() => keyInputRef.current?.focus(), 500);
  }, []);

  const addTerminalLine = (text, type = 'system') => {
    setTerminalLines((prev) => [
      ...prev,
      { text, type, time: new Date().toLocaleTimeString('en-US', { hour12: false }) },
    ]);
  };

  // ─── Decryption Animation ───
  const animateDecryption = useCallback(() => {
    const plain = challenge.plaintext.replace(/[^A-Z]/g, '');
    const cipher = ciphertext.replace(/[^A-Z]/g, '');
    let step = 0;
    const totalSteps = plain.length;

    addTerminalLine('KEY ACCEPTED — Initiating decryption...', 'action');

    animationRef.current = setInterval(() => {
      const revealCount = Math.min(step * 3, totalSteps);
      let result = '';

      for (let i = 0; i < cipher.length; i++) {
        if (i < revealCount) {
          result += plain[i];
        } else {
          result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }

      // Format into blocks
      const blocks = [];
      for (let i = 0; i < result.length; i += 5) {
        blocks.push(result.slice(i, i + 5));
      }
      const lines = [];
      for (let i = 0; i < blocks.length; i += 6) {
        lines.push(blocks.slice(i, i + 6).join('  '));
      }
      setDisplayText(lines.join('\n'));

      step++;

      if (revealCount >= totalSteps) {
        clearInterval(animationRef.current);
        // Show clean plaintext
        setDisplayText(challenge.plaintext);
        setPhase(PHASES.COORDINATES);
        addTerminalLine('DECRYPTION COMPLETE ✓', 'action');
        if (challenge.base64Clue) {
          addTerminalLine('Encoded payload detected — decode it to proceed.', 'action');
        } else if (challenge.quote) {
          addTerminalLine('Passage extracted — fill in the missing words.', 'action');
        } else {
          addTerminalLine(`Coordinates extracted: ${challenge.coordinates.join(', ')}`, 'action');
        }
        addTerminalLine('Proceed to THE LIBRARY for cross-reference.', 'warning');
        setTimeout(() => answerInputRef.current?.focus(), 300);
      }
    }, 40);
  }, [challenge, ciphertext]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  // ─── Key Submission ───
  const handleKeySubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (validateKey(keyInput, challenge.vigenereKey)) {
        setPhase(PHASES.DECRYPTING);
        animateDecryption();
      } else {
        setKeyError(true);
        addTerminalLine(`INVALID KEY: "${keyInput}" — Access denied.`, 'error');
        setTimeout(() => setKeyError(false), 2000);
      }
    },
    [keyInput, challenge.vigenereKey, animateDecryption]
  );

  // ─── Answer Submission ───
  const handleAnswerSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (answerInput.trim().toUpperCase() === challenge.solution.toUpperCase()) {
        setPhase(PHASES.SUCCESS);
        addTerminalLine('PASSPHRASE VERIFIED ✓', 'action');
        addTerminalLine('CHALLENGE COMPLETE — Access granted to next layer.', 'action');
        console.log(
          `%c[GAUNTLET] ✅ CHALLENGE COMPLETED%c\n` +
          `  Challenge: ${challenge.title} (ID: ${challenge.id})\n` +
          `  Level: ${challenge.level}\n` +
          `  Solved at: ${new Date().toLocaleString()}\n` +
          `  Timer remaining: ${timer.minutes}:${timer.seconds}`,
          'color: #39ff14; font-weight: bold; font-size: 14px;',
          'color: #39ff14;'
        );
        // Trigger completion flow after a brief pause for the in-challenge success text
        setTimeout(() => {
          onComplete?.(challenge);
        }, 2500);
      } else {
        setAnswerError(true);
        addTerminalLine(`INCORRECT PASSPHRASE: "${answerInput}"`, 'error');
        setTimeout(() => setAnswerError(false), 2000);
      }
    },
    [answerInput, challenge.solution]
  );

  // ─── Hex data stream for hidden key ───
  const hexStream = useMemo(() => {
    const hex = [];
    for (let i = 0; i < 20; i++) {
      hex.push(
        '0x' +
          Math.floor(Math.random() * 256)
            .toString(16)
            .toUpperCase()
            .padStart(2, '0')
      );
    }
    return hex.join(' ');
  }, []);

  const isLocked = (targetPhase) => {
    const order = [PHASES.INTERCEPT, PHASES.DECRYPTING, PHASES.COORDINATES, PHASES.SUCCESS];
    return order.indexOf(phase) < order.indexOf(targetPhase);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[80] overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, #050510 0%, #0a0a1a 50%, #080818 100%)',
      }}
    >
      {/* Scanline */}
      <div className="scanline-overlay" />

      {/* ─── TOP BAR ─── */}
      <div className="sticky top-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Abort */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log(
                `%c[GAUNTLET] ⛔ MISSION ABORTED%c\n` +
                `  Challenge: ${challenge.title} (ID: ${challenge.id})\n` +
                `  Phase at abort: ${phase}\n` +
                `  Aborted at: ${new Date().toLocaleString()}\n` +
                `  Timer remaining: ${timer.minutes}:${timer.seconds}`,
                'color: #ff073a; font-weight: bold; font-size: 14px;',
                'color: #ff073a;'
              );
              onClose();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-neon-red/20 hover:border-neon-red/50 text-neon-red/70 hover:text-neon-red text-[10px] tracking-[0.2em] uppercase transition-colors cursor-pointer"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            ← ABORT
          </motion.button>

          {/* Title */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-lg" style={{ color: challenge.accent }}>
              {challenge.icon}
            </span>
            <div>
              <h2
                className="text-sm font-bold tracking-wider text-white-pure"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {challenge.title}
              </h2>
              <span
                className="text-[9px] tracking-[0.3em] uppercase text-ghost/40"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                {challenge.level}
              </span>
            </div>
          </div>

          {/* Timer */}
          <div className="w-52">
            <MissionTimer
              minutes={timer.minutes}
              seconds={timer.seconds}
              progress={timer.progress}
              isRunning={timer.isRunning}
            />
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ━━━ THE INTERCEPT ━━━ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass rounded-xl overflow-hidden border border-neon-cyan/10"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-black/30">
            <span
              className={`w-2 h-2 rounded-full ${
                phase === PHASES.INTERCEPT ? 'bg-neon-cyan animate-pulse' : 'bg-neon-green'
              }`}
            />
            <span
              className="text-[10px] tracking-[0.4em] uppercase text-ghost/60"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ■ THE INTERCEPT
            </span>
            {phase !== PHASES.INTERCEPT && (
              <span className="text-[9px] tracking-[0.2em] uppercase text-neon-green/70 ml-auto">
                ✓ DECRYPTED
              </span>
            )}
          </div>

          {/* Cipher Display */}
          <div className="p-5 sm:p-6">
            <div
              className={`
                cipher-display rounded-lg p-4 sm:p-6 font-mono text-sm sm:text-base leading-relaxed
                whitespace-pre-wrap break-all
                ${phase === PHASES.INTERCEPT || phase === PHASES.DECRYPTING
                  ? 'text-neon-green/90'
                  : 'text-neon-cyan'
                }
              `}
              style={{
                fontFamily: 'var(--font-mono)',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(0,240,255,0.08)',
                letterSpacing: '0.15em',
                textShadow:
                  phase === PHASES.DECRYPTING
                    ? '0 0 8px rgba(57,255,20,0.6)'
                    : '0 0 4px rgba(0,240,255,0.3)',
              }}
            >
              {displayText}
            </div>

            {/* Hidden Key Element — hover data stream to reveal */}
            {phase === PHASES.INTERCEPT && (
              <div className="relative group mt-4 cursor-help">
                <div className="text-[10px] text-ghost/20 font-mono tracking-wider overflow-hidden select-none py-1">
                  {hexStream}
                </div>
                <span
                  className="
                    absolute inset-0 flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    text-neon-cyan text-xs font-bold tracking-[0.5em]
                    transition-opacity duration-300
                    rounded
                  "
                  style={{ background: 'rgba(8,8,26,0.92)' }}
                >
                  KEY: {challenge.vigenereKey}
                </span>
                <p
                  className="text-[9px] text-ghost/25 tracking-widest uppercase mt-1"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  ▲ HOVER DATA STREAM TO INSPECT
                </p>
              </div>
            )}

            {/* Key Input */}
            {phase === PHASES.INTERCEPT && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onSubmit={handleKeySubmit}
                className="mt-6"
              >
                <div
                  className={`
                    flex items-center gap-2 rounded-lg px-4 py-3
                    border transition-colors duration-300
                    ${keyError
                      ? 'border-neon-red/50 bg-neon-red/5'
                      : 'border-neon-cyan/15 bg-black/40 focus-within:border-neon-cyan/40'
                    }
                  `}
                >
                  <span className="text-neon-cyan/60 text-sm font-mono">{'>'}</span>
                  <input
                    ref={keyInputRef}
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Enter decryption key..."
                    className="
                      flex-1 bg-transparent outline-none text-sm
                      text-neon-cyan placeholder:text-ghost/25
                      font-mono tracking-wider
                    "
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                      px-4 py-1.5 rounded text-[10px] tracking-[0.3em] uppercase
                      border border-neon-cyan/30 hover:border-neon-cyan/60
                      text-neon-cyan font-bold cursor-pointer
                      transition-colors duration-300
                    "
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    DECRYPT
                  </motion.button>
                </div>
                <AnimatePresence>
                  {keyError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-neon-red text-xs mt-2 tracking-wider"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      ✕ INVALID CIPHER KEY — ACCESS DENIED
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.form>
            )}
          </div>
        </motion.section>

        {/* ━━━ THE LIBRARY ━━━ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className={`
            glass rounded-xl overflow-hidden border transition-all duration-500
            ${phase === PHASES.COORDINATES || phase === PHASES.SUCCESS
              ? 'border-neon-violet/20 opacity-100'
              : 'border-white/5 opacity-40 pointer-events-none'
            }
          `}
        >
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-black/30">
            <span
              className={`w-2 h-2 rounded-full ${
                phase === PHASES.COORDINATES
                  ? 'bg-neon-violet animate-pulse'
                  : isLocked(PHASES.COORDINATES)
                  ? 'bg-ghost/30'
                  : 'bg-neon-green'
              }`}
            />
            <span
              className="text-[10px] tracking-[0.4em] uppercase text-ghost/60"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ■ THE LIBRARY
            </span>
            {isLocked(PHASES.COORDINATES) && (
              <span className="text-[9px] tracking-[0.2em] uppercase text-ghost/30 ml-auto">
                🔒 LOCKED
              </span>
            )}
          </div>

          <div className="p-5 sm:p-6">
            {phase === PHASES.COORDINATES || phase === PHASES.SUCCESS ? (
              <div className="space-y-5">
                {/* Base64-encoded clue (Challenge 0 style) */}
                {challenge.base64Clue && base64Encoded ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4"
                  >
                    {/* Encoding hint — deliberately cryptic */}
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-neon-amber animate-pulse" />
                      <p
                        className="text-[10px] tracking-[0.4em] uppercase text-neon-amber/70"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        ANOMALOUS ENCODING DETECTED — <span className="text-neon-cyan font-bold">PAYLOAD OBSCURED</span>
                      </p>
                    </div>

                    {/* The Base64 blob */}
                    <div
                      className="rounded-lg p-4 sm:p-5 border border-neon-violet/20 bg-black/50 relative group"
                    >
                      <p
                        className="text-[9px] tracking-[0.4em] uppercase text-ghost/40 mb-3"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        ■ ENCODED PAYLOAD
                      </p>
                      <pre
                        className="text-xs sm:text-sm leading-relaxed text-neon-green/80 break-all whitespace-pre-wrap select-all cursor-text"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.05em',
                          textShadow: '0 0 4px rgba(57,255,20,0.3)',
                        }}
                      >
                        {base64Encoded}
                      </pre>
                      <p
                        className="text-[9px] text-ghost/25 tracking-widest uppercase mt-3"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        ▲ THE SIGNAL HIDES IN PLAIN SIGHT — UNMASK IT
                      </p>
                    </div>


                  </motion.div>
                ) : challenge.quote ? (
                  /* Direct quote-based challenge (fallback) */
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="rounded-lg p-5 sm:p-6 border border-neon-violet/20 bg-neon-violet/5"
                  >
                    <p
                      className="text-[9px] tracking-[0.4em] uppercase text-ghost/40 mb-3"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      ■ INTERCEPTED PASSAGE — {challenge.quote.blanks} MISSING WORD{challenge.quote.blanks > 1 ? 'S' : ''}
                    </p>
                    <blockquote
                      className="text-base sm:text-lg leading-relaxed text-ghost/80 italic border-l-2 border-neon-violet/40 pl-4"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      {challenge.quote.text.split('_____').map((segment, i, arr) => (
                        <span key={i}>
                          {segment}
                          {i < arr.length - 1 && (
                            <span
                              className="inline-block mx-1 px-3 py-0.5 rounded border border-neon-cyan/30 bg-neon-cyan/5 not-italic"
                              style={{
                                fontFamily: 'var(--font-mono)',
                                minWidth: '4rem',
                                textAlign: 'center',
                                color: 'var(--color-neon-cyan)',
                                textShadow: '0 0 6px rgba(0,240,255,0.4)',
                              }}
                            >
                              ?
                            </span>
                          )}
                        </span>
                      ))}
                    </blockquote>
                    <p
                      className="text-[9px] tracking-[0.3em] uppercase text-ghost/30 mt-3"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      SOURCE: {challenge.quote.source}
                    </p>
                    {challenge.quote.hint && (
                      <p
                        className="text-[10px] text-neon-amber/50 tracking-wider mt-2"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        ⚠ {challenge.quote.hint}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  /* Coordinate-based challenge (fallback for future challenges) */
                  <div className="flex flex-col sm:flex-row gap-4">
                    {challenge.coordinates?.map((coord, i) => (
                      <motion.div
                        key={coord}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.2, type: 'spring', stiffness: 300 }}
                        className="
                          flex-1 rounded-lg p-4 text-center
                          border border-neon-violet/20 bg-neon-violet/5
                        "
                      >
                        <p
                          className="text-[9px] tracking-[0.3em] uppercase text-ghost/40 mb-1"
                          style={{ fontFamily: 'Rajdhani, sans-serif' }}
                        >
                          COORDINATE {i + 1}
                        </p>
                        <p
                          className="text-2xl font-bold text-neon-violet text-glow-magenta tracking-widest"
                          style={{ fontFamily: 'Orbitron, sans-serif' }}
                        >
                          {coord}
                        </p>
                        <p
                          className="text-[9px] text-ghost/30 tracking-wider mt-1"
                          style={{ fontFamily: 'Rajdhani, sans-serif' }}
                        >
                          PARA–WORD–LETTER
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Book Link */}
                <div
                  className="rounded-lg p-4 border border-neon-cyan/10 bg-black/30"
                >
                  <p
                    className="text-[9px] tracking-[0.4em] uppercase text-ghost/40 mb-2"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    ■ SECURE DOCUMENT LINK
                  </p>
                  <a
                    href={challenge.bookLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex items-center gap-2 text-neon-cyan hover:text-white-pure
                      transition-colors duration-300 text-sm font-bold tracking-wider
                    "
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    <span className="text-neon-cyan/50">⟐</span>
                    {challenge.bookLink.title}
                    <span className="text-neon-cyan/50">↗</span>
                  </a>
                  <p
                    className="text-[10px] text-ghost/40 mt-2 tracking-wider"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    {challenge.base64Clue
                      ? 'Decode the payload above, then use this document to find the missing words.'
                      : challenge.quote
                      ? 'Look up this document to verify the missing words. Enter them in order as your passphrase.'
                      : 'Use the coordinates above to locate the target words in this document. Enter the words as your passphrase below.'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-ghost/30 text-sm tracking-wider">
                  Complete the decryption to unlock this section.
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* ━━━ FINAL SUBMISSION ━━━ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className={`
            glass rounded-xl overflow-hidden border transition-all duration-500
            ${phase === PHASES.COORDINATES
              ? 'border-neon-amber/20 opacity-100'
              : phase === PHASES.SUCCESS
              ? 'border-neon-green/20 opacity-100'
              : 'border-white/5 opacity-40 pointer-events-none'
            }
          `}
        >
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-black/30">
            <span
              className={`w-2 h-2 rounded-full ${
                phase === PHASES.COORDINATES
                  ? 'bg-neon-amber animate-pulse'
                  : phase === PHASES.SUCCESS
                  ? 'bg-neon-green'
                  : 'bg-ghost/30'
              }`}
            />
            <span
              className="text-[10px] tracking-[0.4em] uppercase text-ghost/60"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ■ FINAL SUBMISSION
            </span>
            {isLocked(PHASES.COORDINATES) && (
              <span className="text-[9px] tracking-[0.2em] uppercase text-ghost/30 ml-auto">
                🔒 LOCKED
              </span>
            )}
            {phase === PHASES.SUCCESS && (
              <span className="text-[9px] tracking-[0.2em] uppercase text-neon-green/70 ml-auto">
                ✓ VERIFIED
              </span>
            )}
          </div>

          <div className="p-5 sm:p-6">
            {phase === PHASES.COORDINATES && (
              <form onSubmit={handleAnswerSubmit}>
                <p
                  className="text-[10px] tracking-[0.3em] uppercase text-ghost/40 mb-4"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  {challenge.base64Clue
                    ? 'Enter the missing words from the decoded passage (in order, separated by spaces)'
                    : challenge.quote
                    ? 'Enter the missing words from the passage (in order, separated by spaces)'
                    : 'Enter the words found at the decoded coordinates'
                  }
                </p>
                <div
                  className={`
                    flex items-center gap-2 rounded-lg px-4 py-3
                    border transition-colors duration-300
                    ${answerError
                      ? 'border-neon-red/50 bg-neon-red/5'
                      : 'border-neon-amber/15 bg-black/40 focus-within:border-neon-amber/40'
                    }
                  `}
                >
                  <span className="text-neon-amber/60 text-sm font-mono">{'⟐'}</span>
                  <input
                    ref={answerInputRef}
                    type="password"
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Enter passphrase..."
                    className="
                      flex-1 bg-transparent outline-none text-sm
                      text-neon-amber placeholder:text-ghost/25
                      font-mono tracking-wider
                    "
                    autoComplete="off"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                      px-4 py-1.5 rounded text-[10px] tracking-[0.3em] uppercase
                      border border-neon-amber/30 hover:border-neon-amber/60
                      text-neon-amber font-bold cursor-pointer
                      transition-colors duration-300
                    "
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    SUBMIT
                  </motion.button>
                </div>
                <AnimatePresence>
                  {answerError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-neon-red text-xs mt-2 tracking-wider"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      ✕ INCORRECT PASSPHRASE — TRY AGAIN
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>
            )}

            {phase === PHASES.SUCCESS && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                  className="text-5xl mb-4 inline-block"
                >
                  <span
                    className="text-neon-green"
                    style={{ textShadow: '0 0 20px rgba(57,255,20,0.5)' }}
                  >
                    ◈
                  </span>
                </motion.div>
                <h3
                  className="text-2xl font-bold tracking-[0.3em] text-neon-green text-glow-green mb-2"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  ACCESS GRANTED
                </h3>
                <p
                  className="text-sm tracking-[0.2em] uppercase text-ghost/50"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                  Challenge {challenge.title} — Breach successful
                </p>
              </motion.div>
            )}

            {isLocked(PHASES.COORDINATES) && phase !== PHASES.SUCCESS && (
              <div className="text-center py-6">
                <p className="text-ghost/30 text-sm tracking-wider">
                  Decrypt the intercept and locate the target words first.
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* ━━━ ACTIVITY LOG ━━━ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="glass rounded-xl overflow-hidden border border-white/5"
        >
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-black/30">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span
              className="text-[10px] tracking-[0.4em] uppercase text-ghost/60"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ■ ACTIVITY LOG
            </span>
          </div>
          <div
            className="p-4 max-h-40 overflow-y-auto font-mono text-xs leading-relaxed"
            style={{ scrollbarWidth: 'thin' }}
          >
            {terminalLines.map((line, i) => (
              <div
                key={i}
                className={`mb-1 ${
                  line.type === 'error'
                    ? 'text-neon-red/80'
                    : line.type === 'action'
                    ? 'text-neon-green/80'
                    : line.type === 'warning'
                    ? 'text-neon-amber/80'
                    : 'text-neon-cyan/60'
                }`}
                style={{ animation: 'fadeSlideIn 0.25s ease-out' }}
              >
                <span className="text-ghost/30 mr-2">{line.time}</span>
                {'> '}
                {line.text}
              </div>
            ))}
            <div className="flex items-center gap-1 text-neon-cyan/60 mt-1">
              <span>{'>'}</span>
              <span className="cursor-blink inline-block w-2 h-4 bg-neon-cyan/60" />
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
