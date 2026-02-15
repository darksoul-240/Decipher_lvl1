import { motion } from 'framer-motion';

export default function BeginTrainingCTA({ onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-6"
    >
      {/* Main CTA Button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="
          relative group px-10 py-4 rounded-lg overflow-hidden
          bg-transparent border border-neon-cyan/30
          text-neon-cyan font-bold tracking-[0.3em] uppercase text-sm
          cursor-pointer
          hover:border-neon-cyan/60
          transition-colors duration-300
        "
        style={{ fontFamily: 'Orbitron, sans-serif' }}
      >
        {/* Hover gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-cyan/5 to-neon-magenta/10"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Animated border glow on hover */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: '0 0 15px rgba(139,92,246,0.35), 0 0 40px rgba(168,85,247,0.12), inset 0 0 15px rgba(139,92,246,0.06)',
          }}
        />

        <span className="relative z-10 flex items-center gap-3">
          <span className="text-glow-cyan">BEGIN TRAINING</span>
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            ▸
          </motion.span>
        </span>
      </motion.button>

      {/* Sub-text */}
      <p
        className="text-[11px] tracking-[0.2em] uppercase text-ghost/40"
        style={{ fontFamily: 'Rajdhani, sans-serif' }}
      >
        Authorization required — Clearance Level 1
      </p>
    </motion.div>
  );
}
