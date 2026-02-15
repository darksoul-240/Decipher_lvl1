import { useMemo } from 'react';

export default function HexGrid() {
  const hexagons = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (i % 4) * 120 + (Math.floor(i / 4) % 2 === 0 ? 0 : 60),
      y: Math.floor(i / 4) * 90,
      delay: (i * 0.5) % 3,
      duration: 5 + (i % 3),
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
      <svg
        className="w-full h-full"
        viewBox="0 0 500 300"
        preserveAspectRatio="xMidYMid slice"
      >
        {hexagons.map((hex) => (
          <polygon
            key={hex.id}
            points="30,0 60,17 60,52 30,69 0,52 0,17"
            transform={`translate(${hex.x}, ${hex.y})`}
            fill="none"
            stroke="rgba(0, 240, 255, 0.12)"
            strokeWidth="0.5"
            style={{
              animation: `hex-pulse ${hex.duration}s ease-in-out ${hex.delay}s infinite`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
