import { useRef, useEffect } from 'react';

const PARTICLE_COUNT = 35;
const COLORS = ['#a855f7', '#d946ef', '#8b5cf6', '#00f0ff', '#7c3aed'];
const CONNECTION_DIST = 100;
const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;

export default function ParticleField() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationId = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = () => window.innerWidth;
    const h = () => window.innerHeight;

    // Initialize particles
    particles.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      size: Math.random() * 1.8 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.4 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const draw = () => {
      const cw = w();
      const ch = h();
      ctx.clearRect(0, 0, cw, ch);

      const pts = particles.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < 22500 && distSq > 0) { // 150²
          const dist = Math.sqrt(distSq);
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.2;
          p.vy += (dy / dist) * force * 0.2;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.015;

        if (p.y < -10) p.y = ch + 10;
        if (p.y > ch + 10) p.y = -10;
        if (p.x < -10) p.x = cw + 10;
        if (p.x > cw + 10) p.x = -10;

        const pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.1;

        // Simple glow — just a bigger translucent dot, no radial gradient
        ctx.globalAlpha = pulseAlpha * 0.25;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.globalAlpha = pulseAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connection lines — squared distance to avoid sqrt
      ctx.globalAlpha = 1;
      ctx.lineWidth = 0.4;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dSq = dx * dx + dy * dy;
          if (dSq < CONNECTION_DIST_SQ) {
            const alpha = 0.05 * (1 - dSq / CONNECTION_DIST_SQ);
            ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
