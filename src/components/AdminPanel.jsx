import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHALLENGES_CONFIG, getActiveSlotId, setActiveSlotId } from '../config/challengesConfig';

/**
 * Hidden admin panel — toggled via Ctrl+Shift+G keyboard shortcut.
 * Allows the operator (you) to choose which challenge node is unlocked.
 */
export default function AdminPanel({ onSlotChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState(() => getActiveSlotId());

  // Listen for Ctrl+Shift+G to toggle
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = useCallback(
    (id) => {
      const newId = id === activeId ? -1 : id; // toggle off if already selected
      setActiveSlotId(newId);
      setActiveId(newId);
      onSlotChange?.(newId);
    },
    [activeId, onSlotChange]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="admin-panel"
          initial={{ opacity: 0, x: 320 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 320 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-80 z-[500] overflow-y-auto"
          style={{
            background: 'rgba(8,8,26,0.95)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neon-violet/20">
            <div>
              <h2
                className="text-sm font-bold tracking-[0.3em] text-neon-violet"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                OPERATOR PANEL
              </h2>
              <p
                className="text-[9px] tracking-[0.3em] uppercase text-ghost/40 mt-1"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                SELECT ACTIVE CHALLENGE
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-ghost/50 hover:text-neon-red text-lg cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Challenge selector */}
          <div className="p-4 space-y-3">
            {CHALLENGES_CONFIG.map((ch) => {
              const isActive = ch.id === activeId;
              return (
                <motion.button
                  key={ch.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(ch.id)}
                  className={`
                    w-full text-left rounded-lg p-4 border cursor-pointer
                    transition-all duration-300
                    ${isActive
                      ? 'border-neon-green/40 bg-neon-green/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span style={{ color: ch.accent }} className="text-lg">
                        {ch.icon}
                      </span>
                      <span
                        className="text-xs font-bold tracking-wider text-white-pure"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                      >
                        {ch.title}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'text-neon-green border-neon-green/30 bg-neon-green/10'
                          : 'text-ghost/40 border-ghost/10'
                      }`}
                    >
                      {isActive ? 'ACTIVE' : 'LOCKED'}
                    </span>
                  </div>
                  <p
                    className="text-[10px] tracking-wider text-ghost/50"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    {ch.level} — Key: {ch.vigenereKey}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Lock All button */}
          <div className="px-4 pb-4">
            <button
              onClick={() => handleSelect(-1)}
              className={`
                w-full py-2.5 rounded-lg text-[10px] tracking-[0.3em] uppercase cursor-pointer
                border transition-colors duration-300
                ${activeId === -1
                  ? 'border-neon-red/40 text-neon-red bg-neon-red/5'
                  : 'border-white/10 text-ghost/50 hover:border-neon-red/30 hover:text-neon-red'
                }
              `}
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              🔒 LOCK ALL CHALLENGES
            </button>
          </div>

          {/* Info */}
          <div className="px-4 pb-6">
            <div className="rounded-lg p-3 border border-white/5 bg-white/[0.02]">
              <p
                className="text-[9px] tracking-wider text-ghost/30 leading-relaxed"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                Toggle: <span className="text-neon-cyan/60">Ctrl+Shift+G</span>
                <br />
                Select a challenge to make it available to participants.
                Only one challenge can be active at a time.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
