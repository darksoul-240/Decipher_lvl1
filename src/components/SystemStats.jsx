import { useEffect, useRef, useState } from 'react';

const stats = [
  { label: 'ENCRYPTION', target: 98, suffix: '%', color: 'text-neon-cyan', glow: '0 0 10px rgba(0,240,255,0.4)' },
  { label: 'THREATS NEUTRALIZED', target: 47, suffix: '', color: 'text-neon-green', glow: '0 0 10px rgba(57,255,20,0.4)' },
  { label: 'SYS INTEGRITY', target: 87, suffix: '%', color: 'text-neon-amber', glow: '0 0 10px rgba(255,174,0,0.4)' },
];

export default function SystemStats() {
  const [visible, setVisible] = useState(false);
  const [values, setValues] = useState(stats.map(() => 0));
  const ref = useRef(null);

  // IntersectionObserver — animate once on enter
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!visible) return;
    const duration = 1200;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValues(stats.map((s) => Math.round(s.target * ease)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <div
      ref={ref}
      className="flex flex-wrap justify-center gap-8 md:gap-12"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}
    >
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex flex-col items-center gap-1">
          <span
            className={`text-3xl md:text-4xl font-bold ${stat.color}`}
            style={{ fontFamily: 'Orbitron, sans-serif', textShadow: stat.glow }}
          >
            {values[i]}{stat.suffix}
          </span>
          <span
            className="text-[10px] tracking-[0.3em] uppercase text-ghost/50"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
