import { motion } from 'framer-motion';

export default function SystemPurged({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-void/90" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Glitch icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl mb-8"
        >
          <span className="text-neon-red" style={{ textShadow: '0 0 30px rgba(255,7,58,0.6), 0 0 60px rgba(255,7,58,0.3)' }}>
            ✕
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-3xl md:text-5xl font-black tracking-[0.3em] text-neon-red mb-4"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            textShadow: '0 0 20px rgba(255,7,58,0.5), 0 0 40px rgba(255,7,58,0.2)',
          }}
        >
          SYSTEM PURGED
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-sm tracking-[0.2em] uppercase text-ghost/60 mb-2"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          MISSION TIMER EXPIRED — ALL DATA ERASED
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-xs text-ghost/40 mb-10"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          The decryption window has closed. All intercepted data has been wiped
          from the system to prevent counter-intelligence tracking.
        </motion.p>

        {/* Retry button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="
            px-8 py-3 rounded-lg cursor-pointer
            bg-transparent border border-neon-red/30 hover:border-neon-red/60
            text-neon-red font-bold tracking-[0.3em] uppercase text-sm
            transition-colors duration-300
          "
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          RE-INITIALIZE
        </motion.button>

        {/* Scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,7,58,0.03) 2px, rgba(255,7,58,0.03) 4px)',
          }}
        />
      </div>
    </motion.div>
  );
}
