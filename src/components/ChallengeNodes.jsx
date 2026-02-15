import { useState } from 'react';
import { motion } from 'framer-motion';

const challenges = [
  {
    id: 1,
    title: 'CIPHER BREACH',
    level: 'SEC-LEVEL α',
    status: 'unlocked',
    description: 'Decode the encrypted signal to bypass the outer firewall.',
    threat: 'LOW',
    icon: '◈',
    accent: '#00f0ff',
  },
  {
    id: 2,
    title: 'QUANTUM LOCK',
    level: 'SEC-LEVEL β',
    status: 'unlocked',
    description: 'Navigate quantum-encrypted pathways to reach the core.',
    threat: 'MEDIUM',
    icon: '◇',
    accent: '#39ff14',
  },
  {
    id: 3,
    title: 'NEURAL MAZE',
    level: 'SEC-LEVEL γ',
    status: 'locked',
    description: 'Infiltrate the neural network defense grid.',
    threat: 'HIGH',
    icon: '⬡',
    accent: '#ffae00',
  },
  {
    id: 4,
    title: 'ZERO-DAY',
    level: 'SEC-LEVEL Ω',
    status: 'locked',
    description: 'Exploit the final vulnerability. No second chances.',
    threat: 'CRITICAL',
    icon: '◆',
    accent: '#ff073a',
  },
];

function getThreatColor(threat) {
  switch (threat) {
    case 'LOW': return 'text-neon-cyan';
    case 'MEDIUM': return 'text-neon-green';
    case 'HIGH': return 'text-neon-amber';
    case 'CRITICAL': return 'text-neon-red';
    default: return 'text-ghost';
  }
}

export default function ChallengeNodes({ onNodeInteract }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
      {challenges.map((node, index) => {
        const isLocked = node.status === 'locked';
        const isHovered = hoveredId === node.id;

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              delay: index * 0.15,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{
              scale: isLocked ? 1.01 : 1.03,
              transition: { type: 'spring', stiffness: 400, damping: 25 },
            }}
            whileTap={{
              scale: isLocked ? 1 : 0.97,
              transition: { type: 'spring', stiffness: 600, damping: 30 },
            }}
            onHoverStart={() => {
              setHoveredId(node.id);
              onNodeInteract?.(`Scanning node: ${node.title}...`);
            }}
            onHoverEnd={() => setHoveredId(null)}
            onClick={() => {
              if (!isLocked) {
                onNodeInteract?.(`ACCESS GRANTED → ${node.title} [${node.level}]`);
              } else {
                onNodeInteract?.(`ACCESS DENIED → ${node.title} [ENCRYPTED]`);
              }
            }}
            className={`
              relative group cursor-pointer rounded-xl p-[1px] overflow-hidden
              ${isLocked ? 'opacity-60' : ''}
            `}
            style={{
              background: isHovered && !isLocked
                ? `linear-gradient(135deg, ${node.accent}40, transparent 40%, transparent 60%, ${node.accent}20)`
                : `linear-gradient(135deg, ${node.accent}15, transparent 40%, transparent 60%, ${node.accent}08)`,
            }}
          >
            {/* Static border glow — no layoutId to avoid cross-card layout recalc */}
            <div
              className="absolute inset-0 rounded-xl transition-opacity duration-300"
              style={{
                opacity: isHovered && !isLocked ? 1 : 0,
                boxShadow: `0 0 15px ${node.accent}30, 0 0 40px ${node.accent}15, inset 0 0 15px ${node.accent}08`,
              }}
            />

            <div className="glass-strong rounded-xl p-6 h-full relative z-10">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="text-2xl inline-block transition-transform duration-300"
                    style={{
                      color: node.accent,
                      transform: isHovered ? 'rotate(10deg)' : 'rotate(0deg)',
                    }}
                  >
                    {node.icon}
                  </span>
                  <div>
                    <h3
                      className="text-lg font-bold tracking-wider text-white-pure"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                    >
                      {node.title}
                    </h3>
                    <span
                      className="text-[10px] tracking-[0.3em] uppercase text-ghost"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      {node.level}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`
                  flex items-center gap-2 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase
                  ${isLocked
                    ? 'bg-neon-red/10 text-neon-red border border-neon-red/20'
                    : 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                  }
                `}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-neon-red' : 'bg-neon-green'} ${!isLocked ? 'animate-pulse' : ''}`} />
                  {node.status}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-ghost/80 mb-4 leading-relaxed"
                style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.95rem' }}
              >
                {node.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tracking-widest uppercase text-ghost/50">THREAT:</span>
                  <span className={`text-[10px] tracking-widest uppercase font-bold ${getThreatColor(node.threat)}`}>
                    {node.threat}
                  </span>
                </div>

                {!isLocked && (
                  <div
                    className="text-[10px] tracking-widest uppercase flex items-center gap-1 transition-transform duration-300"
                    style={{
                      color: node.accent,
                      transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                    }}
                  >
                    ENTER →
                  </div>
                )}

                {isLocked && (
                  <div className="text-[10px] tracking-widest uppercase text-ghost/30 flex items-center gap-1">
                    🔒 ENCRYPTED
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
