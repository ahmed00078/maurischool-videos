import React from 'react';

/**
 * A desk at night, drawn flat: the wooden top, a desk lamp and its cone of
 * light, a glass of atay, and a hand writing with a red pen. Each prop is
 * placed by one canvas point (the lamp's base, the glass's foot, the pen's
 * tip) and `flip` mirrors it for right-to-left layouts.
 */

/** The desk's top, from `top` to the bottom of the frame, its far edge catching a little light. */
export const DeskTop: React.FC<{ top: number; lit?: number }> = ({ top, lit = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top,
      bottom: 0,
      background: 'linear-gradient(#4a2e1a 0px, #3a2415 10px, #2e1c10 45%, #1d120a 100%)',
      boxShadow: `0 -2px 0 rgba(255, 214, 150, ${0.25 * lit})`,
    }}
  />
);

/** Where the lamp's shade opens, from its base, and the way the light points. */
const MOUTH: [number, number] = [205, -325];
const AXIS: [number, number] = [0.5, 0.866];
const NORMAL: [number, number] = [-AXIS[1], AXIS[0]];

/** A desk lamp standing at (x, y), its shade pointing down towards the middle of the desk. `on` 0 to 1. */
export const DeskLamp: React.FC<{ x: number; y: number; on: number; flip?: boolean }> = ({ x, y, on, flip = false }) => {
  const at = (p: [number, number], a: number, n: number) => `${p[0] + AXIS[0] * a + NORMAL[0] * n},${p[1] + AXIS[1] * a + NORMAL[1] * n}`;
  const neck: [number, number] = [MOUTH[0] - AXIS[0] * 110, MOUTH[1] - AXIS[1] * 110];
  const shade = [at(neck, 0, 26), at(neck, 0, -26), at(MOUTH, 0, -72), at(MOUTH, 0, 72)].join(' ');
  const cone = [at(MOUTH, 0, 70), at(MOUTH, 0, -70), at(MOUTH, 1100, -520), at(MOUTH, 1100, 520)].join(' ');
  const lip = Math.atan2(NORMAL[1], NORMAL[0]) * (180 / Math.PI);
  return (
    <svg
      width={1600}
      height={1600}
      viewBox="-400 -800 1600 1600"
      style={{ position: 'absolute', left: x - 400, top: y - 800, overflow: 'visible', scale: flip ? '-1 1' : undefined, transformOrigin: '400px 800px', pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="lamp-cone" gradientUnits="userSpaceOnUse" x1={MOUTH[0]} y1={MOUTH[1]} x2={MOUTH[0] + AXIS[0] * 1000} y2={MOUTH[1] + AXIS[1] * 1000}>
          <stop offset="0" stopColor="#ffd98f" stopOpacity={0.34 * on} />
          <stop offset="1" stopColor="#ffd98f" stopOpacity={0} />
        </linearGradient>
        <filter id="lamp-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <polygon points={cone} fill="url(#lamp-cone)" filter="url(#lamp-soft)" style={{ mixBlendMode: 'screen' }} />
      <ellipse cx="0" cy="0" rx="70" ry="18" fill="#1c1f27" />
      <ellipse cx="0" cy="-6" rx="62" ry="14" fill="#2e333f" />
      <line x1="0" y1="-10" x2="20" y2="-330" stroke="#2e333f" strokeWidth="14" strokeLinecap="round" />
      <line x1="20" y1="-330" x2={neck[0]} y2={neck[1]} stroke="#2e333f" strokeWidth="12" strokeLinecap="round" />
      <circle cx="20" cy="-330" r="13" fill="#454b5a" />
      <polygon points={shade} fill="#d9922f" stroke="#b8731c" strokeWidth="4" strokeLinejoin="round" />
      <ellipse
        cx={MOUTH[0]}
        cy={MOUTH[1]}
        rx="72"
        ry="17"
        fill={on > 0.5 ? '#fff4cf' : '#5b5140'}
        transform={`rotate(${lip} ${MOUTH[0]} ${MOUTH[1]})`}
      />
      <circle cx={MOUTH[0]} cy={MOUTH[1]} r={60} fill="#fff1c4" opacity={0.35 * on} filter="url(#lamp-soft)" />
    </svg>
  );
};

/**
 * A small glass of atay standing at (x, y): amber tea under its head of foam,
 * steam rising while it is hot. `t` is the time in seconds, for the steam.
 */
export const TeaGlass: React.FC<{ x: number; y: number; t: number; steam?: number }> = ({ x, y, t, steam = 1 }) => {
  const wisp = (i: number) => {
    const k = (t * 0.55 + i / 3) % 1;
    const dx = Math.sin((t + i) * 2.2) * 6;
    return (
      <path
        key={i}
        d={`M ${-10 + i * 10 + dx} ${-112 - k * 70} q 10 -14 0 -28 q -10 -14 0 -28`}
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity={0.28 * steam * Math.sin(Math.PI * k)}
      />
    );
  };
  return (
    <svg width={140} height={260} viewBox="-70 -230 140 260" style={{ position: 'absolute', left: x - 70, top: y - 230, overflow: 'visible' }}>
      <ellipse cx="0" cy="4" rx="40" ry="9" fill="rgba(0,0,0,0.35)" />
      {[0, 1, 2].map(wisp)}
      <path d="M -24 -72 L 24 -72 L 21 0 L -21 0 Z" fill="#b4541a" />
      <path d="M -24 -72 L 24 -72 L 23 -48 L -23 -48 Z" fill="#c96a26" opacity="0.6" />
      <path d="M -26 -92 L 26 -92 L 24.5 -70 L -24.5 -70 Z" fill="#f2e1bd" />
      {[-14, -4, 7, 16].map((bx, i) => (
        <circle key={i} cx={bx} cy={-80 + (i % 2) * 5} r={2.4} fill="#fffaf0" />
      ))}
      <path d="M -30 -104 L 30 -104 L 23 0 L -23 0 Z" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M -20 -96 L -16 -10" stroke="rgba(255,255,255,0.45)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};

/**
 * A hand holding a red pen, the pen's tip at (x, y), the forearm running off
 * towards the bottom right (bottom left with `flip`). `lift` 0 has the pen on
 * the paper; 1 draws the hand back and up, clear of a sheet sliding in.
 */
export const WritingHand: React.FC<{ x: number; y: number; lift?: number; flip?: boolean; sleeve?: string }> = ({
  x,
  y,
  lift = 0,
  flip = false,
  sleeve = '#2e7d74',
}) => {
  const skin = '#8f5b3b';
  const shade = '#72462c';
  const back = [lift * 34 * (flip ? -1 : 1), lift * 30] as const;
  return (
    <svg
      width={760}
      height={1000}
      viewBox="-60 -200 760 1000"
      style={{
        position: 'absolute',
        left: x - 60,
        top: y - 200,
        overflow: 'visible',
        transformOrigin: '60px 200px',
        translate: `${back[0]}px ${back[1]}px`,
        scale: `${(flip ? -1 : 1) * (1 + lift * 0.05)} ${1 + lift * 0.05}`,
        filter: 'drop-shadow(0 18px 18px rgba(0,0,0,0.4))',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <pattern id="sleeve-print" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <rect width="34" height="34" fill={sleeve} />
          <circle cx="9" cy="9" r="4" fill="#ffffff" opacity="0.22" />
          <circle cx="26" cy="25" r="2.6" fill="#ffffff" opacity="0.16" />
        </pattern>
      </defs>
      <g transform="scale(1.25)">
        {/* The forearm in a printed sleeve, running off the frame. */}
        <line x1="130" y1="120" x2="620" y2="760" stroke="url(#sleeve-print)" strokeWidth="150" strokeLinecap="round" />
        <line x1="126" y1="114" x2="136" y2="128" stroke="rgba(0,0,0,0.2)" strokeWidth="152" strokeLinecap="round" />
        {/* The back of the hand, and the middle and ring fingers curled under the pen. */}
        <line x1="84" y1="84" x2="40" y2="30" stroke={shade} strokeWidth="26" strokeLinecap="round" />
        <line x1="96" y1="100" x2="62" y2="62" stroke={shade} strokeWidth="24" strokeLinecap="round" />
        <ellipse cx="96" cy="64" rx="56" ry="46" fill={skin} transform="rotate(-40 96 64)" />
        <path d="M 70 44 q 10 6 14 18 M 84 34 q 10 6 14 18" stroke={shade} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
        {/* The thumb, on the far side of the pen. */}
        <line x1="56" y1="4" x2="8" y2="-40" stroke={skin} strokeWidth="26" strokeLinecap="round" />
        <line x1="56" y1="4" x2="8" y2="-40" stroke={shade} strokeWidth="26" strokeLinecap="round" opacity="0.35" />
        {/* The red pen. */}
        <line x1="10" y1="-20" x2="86" y2="-172" stroke="#c62828" strokeWidth="15" strokeLinecap="round" />
        <line x1="66" y1="-132" x2="86" y2="-172" stroke="#8e1b1b" strokeWidth="17" strokeLinecap="round" />
        <line x1="0" y1="0" x2="10" y2="-20" stroke="#d8d4c6" strokeWidth="8" strokeLinecap="round" />
        <circle cx="0" cy="0" r="3" fill="#d92d20" />
        {/* The index finger along the pen, its nail near the tip. */}
        <line x1="80" y1="30" x2="22" y2="-24" stroke={skin} strokeWidth="25" strokeLinecap="round" />
        <ellipse cx="22" cy="-23" rx="7.5" ry="5.5" fill="#c09077" transform="rotate(43 22 -23)" />
      </g>
    </svg>
  );
};
