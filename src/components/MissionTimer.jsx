import { motion } from 'framer-motion';

export default function MissionTimer({ minutes, seconds, progress, isRunning }) {
  const totalSec = parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
  const isUrgent = totalSec <= 300; // under 5 min
  const isCritical = totalSec <= 60; // under 1 min

  const barColor = isCritical
    ? 'var(--color-neon-red)'
    : isUrgent
    ? 'var(--color-neon-amber)'
    : 'var(--color-neon-cyan)';

  const textColor = isCritical
    ? 'text-neon-red'
    : isUrgent
    ? 'text-neon-amber'
    : 'text-neon-cyan';

  const glowClass = isCritical
    ? 'text-glow-red'
    : isUrgent
    ? 'text-glow-amber'
    : 'text-glow-cyan';

  return (
    <div className="w-full">
      {/* Timer header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isCritical ? 'bg-neon-red' : isUrgent ? 'bg-neon-amber' : 'bg-neon-cyan'} ${isRunning ? 'animate-pulse' : ''}`}
          />
          <span
            className="text-[10px] tracking-[0.4em] uppercase text-ghost/50"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            MISSION TIMER
          </span>
        </div>
        <motion.span
          key={`${minutes}:${seconds}`}
          initial={{ scale: 1.15, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className={`text-2xl font-bold tracking-[0.15em] ${textColor} ${glowClass}`}
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          {minutes}:{seconds}
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${Math.max(0, (1 - progress) * 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            background: barColor,
            boxShadow: `0 0 8px ${barColor}80, 0 0 20px ${barColor}30`,
          }}
        />
      </div>
    </div>
  );
}
