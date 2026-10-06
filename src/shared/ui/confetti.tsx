import React from 'react';
import { useCurrentFrame } from 'remotion';
import { APP } from '../tokens';

/**
 * A light burst of paper squares from a point, at `at`: they fly up and out,
 * fall back with a little drag and flutter as they turn. Every piece comes
 * from its index, not from Math.random, so a frame renders the same each time.
 */
const COLORS = ['#ffd166', '#f2b705', APP.brand[400], APP.brand[300], '#ffffff', '#1f9486', '#dd6e90'];

/** A fixed pseudo-random number in [0, 1) for piece `i`, channel `k`. */
const hash = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Confetti: React.FC<{ x: number; y: number; at: number; count?: number; power?: number; life?: number }> = ({
  x,
  y,
  at,
  count = 70,
  power = 1,
  life = 75,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > life) return null;
  const fade = Math.min(1, (life - t) / 15);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 26 }}>
      {Array.from({ length: count }, (_, i) => {
        // Mostly upward, fanned ±70°.
        const a = -Math.PI / 2 + (hash(i, 1) - 0.5) * 2.4;
        const v = (14 + hash(i, 2) * 22) * power;
        const drag = 0.94;
        // Velocity with drag, integrated: v (1 - d^t) / (1 - d).
        const travel = (1 - drag ** t) / (1 - drag);
        const px = x + Math.cos(a) * v * travel + Math.sin(t * 0.15 + i) * 10 * Math.min(1, t / 10);
        const py = y + Math.sin(a) * v * travel + 0.35 * t * t * 0.5 * (0.6 + hash(i, 3) * 0.4);
        const size = 12 + hash(i, 4) * 12;
        const spin = t * (6 + hash(i, 5) * 12) * (hash(i, 6) > 0.5 ? 1 : -1);
        const flip = Math.cos(t * (0.2 + hash(i, 7) * 0.25) + i);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - size / 2,
              top: py - size / 2,
              width: size,
              height: size * (hash(i, 8) > 0.5 ? 0.55 : 1),
              background: COLORS[i % COLORS.length],
              borderRadius: 2,
              rotate: `${spin}deg`,
              scale: `1 ${flip}`,
              opacity: fade,
            }}
          />
        );
      })}
    </div>
  );
};
