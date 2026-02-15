import { motion, useScroll, useTransform } from 'framer-motion';

export default function NavBar() {
  const { scrollYProgress } = useScroll();
  const navBg = useTransform(
    scrollYProgress,
    [0, 0.05],
    ['rgba(8,8,26,0)', 'rgba(8,8,26,0.88)']
  );
  const navBorder = useTransform(
    scrollYProgress,
    [0, 0.05],
    ['rgba(139,92,246,0)', 'rgba(139,92,246,0.15)']
  );

  return (
    <motion.nav
      style={{
        backgroundColor: navBg,
        borderBottomColor: navBorder,
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        backdropFilter: 'blur(12px)',
      }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border border-neon-cyan/30 rounded flex items-center justify-center">
          <span className="text-neon-cyan text-sm font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            G
          </span>
        </div>
        <span
          className="text-xs tracking-[0.4em] uppercase text-ghost/60 hidden sm:block"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          GAUNTLET OS v3.7
        </span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        {['PROTOCOL', 'NODES', 'INTEL'].map((item) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase()}`}
            whileHover={{ color: '#00f0ff' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="text-[11px] tracking-[0.25em] uppercase text-ghost/50 hover:text-neon-cyan transition-colors cursor-pointer"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            {item}
          </motion.a>
        ))}

        {/* Status Indicator */}
        <div className="flex items-center gap-2 ml-4 px-3 py-1.5 rounded-full border border-neon-cyan/10 bg-neon-cyan/5">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
          <span className="text-[9px] tracking-[0.2em] uppercase text-neon-cyan/70"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            CONNECTED
          </span>
        </div>
      </div>
    </motion.nav>
  );
}
