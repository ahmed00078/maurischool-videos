import React from 'react';
/** The four colours these drawings use, fixed so the kit has no dependency on a video's theme. */
const C = { brand: '#465fff', green: '#12b76a', red: '#f04438', whatsapp: '#25d366' } as const;

// Flat, logo-free drawings of the tools schools use today (notebook, spreadsheet,
// chat, ringing phone), for "before MauriSchool" scenes.

export const Notebook: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 100 120">
    <rect x="8" y="4" width="84" height="112" rx="8" fill="#e8b04a" />
    <rect x="18" y="4" width="74" height="112" rx="6" fill="#fff7e6" />
    {[20, 34, 48, 62, 76, 90].map((y) => (
      <line key={y} x1="28" x2="84" y1={y} y2={y} stroke="#d9c7a3" strokeWidth="2.5" />
    ))}
    {[14, 30, 46, 62, 78, 94].map((y) => (
      <circle key={y} cx="13" cy={y + 6} r="4" fill="#9a6b1f" />
    ))}
    <path d="M32 44 q8 -6 16 0 t16 0" stroke="#c0392b" strokeWidth="2.5" fill="none" />
  </svg>
);

export const Spreadsheet: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 110 100">
    <rect x="2" y="2" width="106" height="96" rx="8" fill="#ffffff" stroke="#cfd6e6" strokeWidth="2" />
    <rect x="2" y="2" width="106" height="18" rx="8" fill="#1d8f55" />
    <rect x="2" y="12" width="106" height="8" fill="#1d8f55" />
    {[32, 46, 60, 74, 88].map((y) => (
      <line key={y} x1="2" x2="108" y1={y} y2={y} stroke="#dfe4ef" strokeWidth="1.5" />
    ))}
    {[30, 58, 84].map((x) => (
      <line key={x} x1={x} x2={x} y1="20" y2="98" stroke="#dfe4ef" strokeWidth="1.5" />
    ))}
    <rect x="34" y="50" width="20" height="8" rx="2" fill="#f04438" opacity="0.8" />
    <rect x="62" y="64" width="18" height="8" rx="2" fill="#f79009" opacity="0.8" />
  </svg>
);

export const ChatBubbles: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size} height={size * 0.95} viewBox="0 0 110 104">
    <rect x="4" y="4" width="78" height="36" rx="14" fill={C.whatsapp} />
    <path d="M16 40 l-6 12 l16 -12z" fill={C.whatsapp} />
    <rect x="14" y="16" width="52" height="5" rx="2.5" fill="#fff" opacity="0.9" />
    <rect x="14" y="26" width="34" height="5" rx="2.5" fill="#fff" opacity="0.9" />
    <rect x="28" y="56" width="78" height="36" rx="14" fill="#ffffff" stroke="#cfd6e6" strokeWidth="2" />
    <rect x="40" y="68" width="52" height="5" rx="2.5" fill="#9aa3bf" />
    <rect x="40" y="78" width="30" height="5" rx="2.5" fill="#9aa3bf" />
    <circle cx="100" cy="10" r="10" fill={C.red} />
    <text x="100" y="14" fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="sans-serif">
      99
    </text>
  </svg>
);

export const RingingPhone: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#cfd6e6" strokeWidth="2" />
    <path
      d="M35 28 c3 -2 6 -1 7 2 l4 9 c1 2 0 5 -2 6 l-4 3 c3 7 8 12 15 15 l3 -4 c1 -2 4 -3 6 -2 l9 4 c3 1 4 4 2 7 l-3 5 c-3 4 -9 5 -15 2 c-14 -7 -24 -17 -31 -31 c-3 -6 -2 -12 2 -15z"
      fill={C.brand}
    />
    <path d="M66 20 a18 18 0 0 1 14 14" stroke={C.red} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M64 30 a9 9 0 0 1 6 6" stroke={C.red} strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

export const WhatsAppGlyph: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill={C.whatsapp} />
    <path d="M50 22 a28 28 0 0 0 -24 42 l-4 14 l14 -4 a28 28 0 1 0 14 -52z" fill="#fff" />
    <path
      d="M40 38 c1 -2 3 -2 4 0 l3 6 c0 1 0 2 -1 3 l-2 2 c2 4 5 7 9 9 l2 -2 c1 -1 2 -1 3 -1 l6 3 c2 1 2 3 0 4 c-2 3 -6 4 -10 2 c-7 -3 -12 -8 -15 -15 c-2 -4 -1 -8 1 -11z"
      fill={C.whatsapp}
    />
  </svg>
);

export const Check: React.FC<{ size?: number; color?: string }> = ({ size = 56, color = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill={color} />
    <path d="M7 12.5 l3.2 3.2 L17 9" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// "After class" drawings: the work a teacher takes home.

/** A pile of marked copies, a score circled in red on the top one, and the red pen. */
export const CopyStack: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size} height={size * 1.05} viewBox="0 0 100 105">
    <rect x="16" y="14" width="68" height="86" rx="3" fill="#e9ecf5" transform="rotate(-7 50 57)" />
    <rect x="14" y="12" width="68" height="86" rx="3" fill="#f3f5fb" transform="rotate(5 48 55)" />
    <rect x="16" y="10" width="68" height="86" rx="3" fill="#ffffff" stroke="#d7dcea" strokeWidth="1.2" />
    {[26, 34, 42, 50, 58, 66, 74, 82].map((y) => (
      <line key={y} x1="24" x2={y % 16 ? 76 : 64} y1={y} y2={y} stroke="#c9d0e2" strokeWidth="2.2" strokeLinecap="round" />
    ))}
    <line x1="22" x2="22" y1="14" y2="92" stroke="#f3b3b3" strokeWidth="1.2" />
    <ellipse cx="68" cy="22" rx="11" ry="7.5" fill="none" stroke={C.red} strokeWidth="2.2" transform="rotate(-8 68 22)" />
    <path d="M60 44 l4 4 l8 -9" stroke={C.red} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30 60 q10 -4 20 1" stroke={C.red} strokeWidth="2" fill="none" strokeLinecap="round" />
    <g transform="rotate(32 70 80)">
      <rect x="44" y="77" width="46" height="7" rx="3.5" fill={C.red} />
      <path d="M90 77 l8 3.5 l-8 3.5z" fill="#2b2f3a" />
      <rect x="44" y="77" width="8" height="7" rx="2" fill="#b42318" />
    </g>
  </svg>
);

/** A desk calculator: the averages done by hand. */
export const Calculator: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 80 100">
    <rect x="4" y="4" width="72" height="92" rx="10" fill="#2f3650" />
    <rect x="12" y="12" width="56" height="20" rx="4" fill="#c9e7c4" />
    <text x="64" y="27" fontSize="12" fontWeight="700" fill="#1d3b24" textAnchor="end" fontFamily="monospace">
      13.75
    </text>
    {[0, 1, 2, 3].map((r) =>
      [0, 1, 2, 3].map((col) => (
        <rect
          key={`${r}-${col}`}
          x={12 + col * 14.5}
          y={40 + r * 13.5}
          width="11"
          height="10"
          rx="2.5"
          fill={col === 3 ? C.brand : r === 3 && col === 2 ? '#f79009' : '#4a5270'}
        />
      )),
    )}
  </svg>
);

/**
 * A wall clock at `hours:minutes`; `seconds` turns the second hand, so a scene
 * can tick it on the beat.
 */
export const WallClock: React.FC<{ size?: number; hours: number; minutes: number; seconds: number }> = ({
  size = 200,
  hours,
  minutes,
  seconds,
}) => {
  const hand = (deg: number, len: number, w: number, color: string) => (
    <line x1="50" y1="50" x2={50 + Math.sin((deg * Math.PI) / 180) * len} y2={50 - Math.cos((deg * Math.PI) / 180) * len} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="47" fill="#fdfcf8" stroke="#2f3650" strokeWidth="5" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={50 + Math.sin(a) * 36}
            y1={50 - Math.cos(a) * 36}
            x2={50 + Math.sin(a) * 41}
            y2={50 - Math.cos(a) * 41}
            stroke="#2f3650"
            strokeWidth={i % 3 ? 1.6 : 3}
            strokeLinecap="round"
          />
        );
      })}
      {hand((hours % 12) * 30 + minutes * 0.5, 22, 4.5, '#2f3650')}
      {hand(minutes * 6 + seconds * 0.1, 32, 3, '#2f3650')}
      {hand(seconds * 6, 36, 1.4, C.red)}
      <circle cx="50" cy="50" r="3" fill={C.red} />
    </svg>
  );
};
