import React from 'react';

/**
 * People, drawn flat: a boy in his school shirt, a girl in her headscarf, a
 * father in his daraa. Chest-up busts in a 400 x 1700 box (the body runs off
 * the bottom), with faces that act: where they look, blinks, brows, mouths,
 * sweat. Everything is a prop, so a scene animates a face by the frame.
 *
 * Kept deliberately simple and warm (round heads, no outlines), so the same
 * family can come back from one video to the next.
 */

export type Mouth = 'smile' | 'grin' | 'flat' | 'o' | 'wobble' | 'smirk' | 'talk';

export type Face = {
  /** Where the pupils point, -1 to 1 on each axis (x is screen left to right). */
  look?: [number, number];
  /** 0 open, 1 shut. */
  blink?: number;
  /** -1 frowning, 0 rest, 1 raised. */
  brows?: number;
  /** 0 to 1: inner ends up, the worried look. */
  worry?: number;
  mouth?: Mouth;
  /** For 'talk': 0 closed to 1 wide. */
  open?: number;
  /** 0 to 1: drops at the temple. */
  sweat?: number;
  blush?: number;
  /** Seconds, for the drops to run. */
  t?: number;
};

const INK = '#2a1d1a';

type Head = { cx: number; cy: number; r: number; skin: string; shade: string };

/** Eyes, brows, nose, mouth, cheeks and sweat, laid out on a round head. */
const FaceFeatures: React.FC<{ head: Head; face: Face; mouthY?: number; mouthW?: number }> = ({ head, face, mouthY, mouthW }) => {
  const { cx, cy, r, shade } = head;
  const { look = [0, 0], blink = 0, brows = 0, worry = 0, mouth = 'smile', open = 0, sweat = 0, blush = 0, t = 0 } = face;
  const ex = r * 0.36;
  const ey = cy - r * 0.02;
  const erx = r * 0.165;
  const ery = r * 0.195;
  const pr = r * 0.1;
  const shut = Math.min(1, Math.max(0, blink));
  const eye = (side: -1 | 1) => {
    const x = cx + side * ex;
    const px = x + look[0] * erx * 0.45;
    const py = ey + look[1] * ery * 0.4 + erx * 0.08;
    return (
      <g key={side} transform={`translate(${x} ${ey}) scale(1 ${1 - shut * 0.92}) translate(${-x} ${-ey})`}>
        <ellipse cx={x} cy={ey} rx={erx} ry={ery} fill="#fff" />
        <circle cx={px} cy={py} r={pr} fill={INK} />
        <circle cx={px + pr * 0.35} cy={py - pr * 0.35} r={pr * 0.32} fill="#fff" />
      </g>
    );
  };
  const brow = (side: -1 | 1) => {
    const x = cx + side * ex;
    const y = ey - ery - r * 0.1 - brows * r * 0.07;
    const half = erx * 1.05;
    // Inner end (toward the nose) goes up with worry, down with a frown.
    const inner = -worry * r * 0.09 + Math.min(0, brows) * -r * 0.05;
    const x1 = x - side * half; // inner
    const x2 = x + side * half; // outer
    return (
      <path
        key={`b${side}`}
        d={`M ${x1} ${y + inner} Q ${x} ${y - r * 0.05 + inner / 2} ${x2} ${y + r * 0.02}`}
        stroke={INK}
        strokeWidth={r * 0.065}
        strokeLinecap="round"
        fill="none"
      />
    );
  };
  const my = mouthY ?? cy + r * 0.47;
  const mw = (mouthW ?? r * 0.5) / 2;
  const stroke = { stroke: INK, strokeWidth: r * 0.055, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const lip = '#5b2320';
  let mouthEl: React.ReactNode;
  switch (mouth) {
    case 'grin':
      mouthEl = (
        <g>
          <path d={`M ${cx - mw} ${my} Q ${cx} ${my + mw * 1.3} ${cx + mw} ${my} Z`} fill={lip} />
          <path d={`M ${cx - mw * 0.86} ${my + mw * 0.08} Q ${cx} ${my + mw * 0.34} ${cx + mw * 0.86} ${my + mw * 0.08} L ${cx + mw * 0.8} ${my + 1} L ${cx - mw * 0.8} ${my + 1} Z`} fill="#fff" />
        </g>
      );
      break;
    case 'flat':
      mouthEl = <path d={`M ${cx - mw * 0.7} ${my + mw * 0.2} L ${cx + mw * 0.7} ${my + mw * 0.2}`} {...stroke} />;
      break;
    case 'o':
      mouthEl = <ellipse cx={cx} cy={my + mw * 0.25} rx={mw * 0.32} ry={mw * 0.42} fill={lip} />;
      break;
    case 'wobble': {
      const n = 6;
      const pts = Array.from({ length: n + 1 }, (_, i) => {
        const x = cx - mw * 0.9 + (i / n) * mw * 1.8;
        const y = my + mw * 0.2 + (i % 2 ? -1 : 1) * mw * 0.1 * Math.cos(t * 9 + i);
        return `${x} ${y}`;
      });
      mouthEl = <path d={`M ${pts.join(' L ')}`} {...stroke} />;
      break;
    }
    case 'smirk':
      mouthEl = <path d={`M ${cx - mw * 0.8} ${my + mw * 0.2} Q ${cx + mw * 0.1} ${my + mw * 0.45} ${cx + mw * 0.85} ${my - mw * 0.15}`} {...stroke} />;
      break;
    case 'talk': {
      const o = Math.max(0.12, Math.min(1, open));
      mouthEl = (
        <g>
          <path d={`M ${cx - mw * 0.8} ${my} Q ${cx} ${my - mw * 0.08} ${cx + mw * 0.8} ${my} Q ${cx} ${my + mw * (0.3 + o * 1.0)} ${cx - mw * 0.8} ${my} Z`} fill={lip} />
          <path d={`M ${cx - mw * 0.62} ${my + mw * 0.03} Q ${cx} ${my - mw * 0.02} ${cx + mw * 0.62} ${my + mw * 0.03} L ${cx + mw * 0.55} ${my + mw * 0.03 + o * mw * 0.18} L ${cx - mw * 0.55} ${my + mw * 0.03 + o * mw * 0.18} Z`} fill="#fff" opacity={o > 0.3 ? 1 : 0} />
        </g>
      );
      break;
    }
    case 'smile':
    default:
      mouthEl = <path d={`M ${cx - mw} ${my} Q ${cx} ${my + mw * 0.75} ${cx + mw} ${my}`} {...stroke} />;
  }
  // Two drops at the temple, running down and restarting.
  const drop = (i: number) => {
    const phase = (t * 0.8 + i * 0.5) % 1;
    const x = cx + r * (0.78 - i * 0.1);
    const y = cy - r * 0.35 + phase * r * 0.5 + i * r * 0.15;
    const s = r * 0.1 * (1 - i * 0.25);
    return (
      <path
        key={i}
        d={`M ${x} ${y - s * 1.8} Q ${x + s} ${y - s * 0.2} ${x} ${y + s * 0.6} Q ${x - s} ${y - s * 0.2} ${x} ${y - s * 1.8} Z`}
        fill="#bfe6ff"
        stroke="#7cc3f0"
        strokeWidth={r * 0.015}
        opacity={sweat * Math.min(1, (1 - phase) * 3)}
      />
    );
  };
  return (
    <g>
      {blush > 0 ? (
        <g opacity={blush * 0.55}>
          <ellipse cx={cx - r * 0.52} cy={cy + r * 0.3} rx={r * 0.16} ry={r * 0.09} fill="#e0605e" />
          <ellipse cx={cx + r * 0.52} cy={cy + r * 0.3} rx={r * 0.16} ry={r * 0.09} fill="#e0605e" />
        </g>
      ) : null}
      {eye(-1)}
      {eye(1)}
      {brow(-1)}
      {brow(1)}
      <path d={`M ${cx - r * 0.06} ${cy + r * 0.22} Q ${cx} ${cy + r * 0.29} ${cx + r * 0.07} ${cy + r * 0.22}`} stroke={shade} strokeWidth={r * 0.05} strokeLinecap="round" fill="none" />
      {mouthEl}
      {sweat > 0 ? [0, 1].map(drop) : null}
    </g>
  );
};

type BustProps = {
  face: Face;
  /** Degrees; the head turns about the neck. */
  tilt?: number;
  style?: React.CSSProperties;
  width?: number;
};

const Svg: React.FC<{ width: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ width, style, children }) => (
  <svg width={width} height={width * 4.25} viewBox="0 0 400 1700" style={{ overflow: 'visible', ...style }}>
    {children}
  </svg>
);

/**
 * The boy: short hair with a tuft, white school shirt with a chest pocket,
 * backpack straps. `paper` (0 to 1) is how far his marked test has risen out
 * of the pocket; with a `paperLabel`, the teacher's red mark shows on its corner.
 */
export const Boy: React.FC<BustProps & { paper?: number; paperLabel?: string; paperFont?: string }> = ({
  face,
  tilt = 0,
  width = 340,
  style,
  paper = 0,
  paperLabel,
  paperFont,
}) => {
  const head: Head = { cx: 200, cy: 250, r: 118, skin: '#b3744b', shade: '#93583a' };
  return (
    <Svg width={width} style={style}>
      <rect x="168" y="320" width="64" height="100" rx="20" fill={head.shade} />
      <path d="M 62 1700 L 62 540 Q 66 420 170 402 L 230 402 Q 334 420 338 540 L 338 1700 Z" fill="#eef3fb" />
      <path d="M 200 402 L 200 1700" stroke="#d5deec" strokeWidth="4" />
      {[520, 610, 700].map((y) => (
        <circle key={y} cx="200" cy={y} r="7" fill="#c7d2e6" />
      ))}
      <path d="M 168 398 L 200 446 L 176 478 L 140 418 Z" fill="#ffffff" stroke="#d5deec" strokeWidth="3" />
      <path d="M 232 398 L 200 446 L 224 478 L 260 418 Z" fill="#ffffff" stroke="#d5deec" strokeWidth="3" />
      <path d="M 92 450 Q 110 425 132 432 L 138 1700 L 104 1700 Z" fill="#243b7a" />
      <path d="M 308 450 Q 290 425 268 432 L 262 1700 L 296 1700 Z" fill="#243b7a" />
      {paperLabel !== undefined ? (
        <g transform={`translate(0 ${-paper * 45})`}>
          <g transform="rotate(-6 239 520)">
            <rect x="217" y="462" width="44" height="96" rx="3" fill="#ffffff" stroke="#c9d0e2" strokeWidth="2.5" />
            <line x1="222" x2="256" y1="502" y2="502" stroke="#c9d0e2" strokeWidth="2" />
            <text x="239" y="489" fontSize="21" fontWeight="700" fill="#dc2626" textAnchor="middle" fontFamily={paperFont}>
              {paperLabel}
            </text>
            <ellipse cx="239" cy="482" rx="20" ry="13" fill="none" stroke="#dc2626" strokeWidth="2" transform="rotate(-8 239 482)" />
          </g>
        </g>
      ) : null}
      <rect x="212" y="520" width="54" height="62" rx="6" fill="#e2e9f5" stroke="#cfd9ea" strokeWidth="3" />
      <g transform={`rotate(${tilt} 200 360)`}>
        <circle cx="84" cy="262" r="25" fill={head.skin} />
        <circle cx="316" cy="262" r="25" fill={head.skin} />
        <circle cx="84" cy="262" r="12" fill={head.shade} />
        <circle cx="316" cy="262" r="12" fill={head.shade} />
        <circle cx={head.cx} cy={head.cy} r={head.r} fill={head.skin} />
        <path d="M 84 246 Q 76 128 200 124 Q 324 128 316 246 Q 306 200 276 186 Q 244 204 206 190 Q 168 206 134 188 Q 100 200 84 246 Z" fill="#1d1a1f" />
        <path d="M 188 130 Q 196 96 226 104 Q 206 110 204 132 Z" fill="#1d1a1f" />
        <FaceFeatures head={head} face={face} />
      </g>
    </Svg>
  );
};

/** The girl: a raspberry headscarf framing her face and falling on her shoulders, a teal top. */
export const Girl: React.FC<BustProps> = ({ face, tilt = 0, width = 340, style }) => {
  const head: Head = { cx: 200, cy: 262, r: 108, skin: '#c98f63', shade: '#a8704a' };
  const scarf = '#c2456b';
  const scarfLight = '#dd6e90';
  return (
    <Svg width={width} style={style}>
      <path d="M 58 1700 L 58 580 Q 66 470 200 458 Q 334 470 342 580 L 342 1700 Z" fill="#1f9486" />
      <g transform={`rotate(${tilt} 200 380)`}>
        <path d="M 200 104 Q 344 104 344 260 Q 346 400 300 470 L 100 470 Q 54 400 56 260 Q 56 104 200 104 Z" fill={scarf} />
        <ellipse cx={head.cx} cy={head.cy + 4} rx="98" ry="112" fill={head.skin} />
        <path d="M 96 250 Q 100 136 200 132 Q 300 136 304 250 Q 290 180 200 176 Q 110 180 96 250 Z" fill={scarfLight} />
        <FaceFeatures head={head} face={face} />
      </g>
      <path d="M 70 500 Q 110 440 200 468 Q 290 440 330 500 L 346 600 Q 200 520 54 600 Z" fill={scarf} />
      <path d="M 104 472 Q 200 520 296 472" stroke={scarfLight} strokeWidth="10" fill="none" strokeLinecap="round" />
    </Svg>
  );
};

/**
 * The father: a pale blue daraa with its embroidered chest pocket, a trimmed
 * beard. With an `envelopeLabel`, a school-fees envelope sticks out of the
 * pocket, `envelope` (0 to 1) being how far it has risen: at 0 only its corner
 * shows, a clue a viewer can catch.
 */
export const Father: React.FC<BustProps & { envelope?: number; envelopeLabel?: string; labelFont?: string }> = ({
  face,
  tilt = 0,
  width = 340,
  style,
  envelope = 0,
  envelopeLabel,
  labelFont,
}) => {
  const head: Head = { cx: 200, cy: 236, r: 106, skin: '#8f5b3b', shade: '#72462c' };
  const daraa = '#6aa6dd';
  const gold = '#f2d38b';
  const rise = envelope * 90;
  return (
    <Svg width={width} style={style}>
      <rect x="170" y="300" width="60" height="110" rx="20" fill={head.shade} />
      <path d="M 14 1700 L 14 570 Q 24 425 158 396 L 242 396 Q 376 425 386 570 L 386 1700 Z" fill={daraa} />
      <path d="M 158 396 L 200 478 L 242 396 Z" fill="#f7f7f2" />
      <path d="M 150 396 L 200 492 L 250 396" stroke={gold} strokeWidth="9" fill="none" strokeLinejoin="round" />
      <path d="M 200 492 L 200 560" stroke={gold} strokeWidth="6" />
      {/* The envelope, behind the pocket's front */}
      {envelopeLabel !== undefined ? (
        <g transform={`translate(0 ${-rise}) rotate(-7 268 520)`}>
          <rect x="222" y="470" width="96" height="70" rx="5" fill="#fdfbf4" stroke="#d9d2bd" strokeWidth="3" />
          <path d="M 222 470 L 270 505 L 318 470" stroke="#d9d2bd" strokeWidth="3" fill="none" />
          <text x="270" y="494" fontSize={envelopeLabel.length > 10 ? 12 : 15} fontWeight="700" fill="#3a3a52" textAnchor="middle" fontFamily={labelFont}>
            {envelopeLabel}
          </text>
        </g>
      ) : null}
      <rect x="214" y="500" width="112" height="120" rx="12" fill="#5b95cc" />
      <path d="M 226 516 q 22 -14 44 0 t 44 0 M 226 540 q 22 -14 44 0 t 44 0" stroke={gold} strokeWidth="4" fill="none" />
      <circle cx="270" cy="584" r="14" fill="none" stroke={gold} strokeWidth="4" />
      <g transform={`rotate(${tilt} 200 350)`}>
        <circle cx="94" cy="246" r="23" fill={head.skin} />
        <circle cx="306" cy="246" r="23" fill={head.skin} />
        <circle cx="94" cy="246" r="11" fill={head.shade} />
        <circle cx="306" cy="246" r="11" fill={head.shade} />
        <circle cx={head.cx} cy={head.cy} r={head.r} fill={head.skin} />
        <path d="M 96 232 Q 96 124 200 122 Q 304 124 304 232 Q 296 176 250 164 Q 200 176 150 164 Q 104 176 96 232 Z" fill="#221c1c" />
        <path d="M 96 214 Q 98 196 104 184 L 110 214 Z M 304 214 Q 302 196 296 184 L 290 214 Z" fill="#8d8a8a" />
        <path d="M 96 244 Q 96 350 200 348 Q 304 350 304 244 Q 300 318 252 322 Q 226 300 200 302 Q 174 300 148 322 Q 100 318 96 244 Z" fill="#241c1a" />
        <path d="M 160 288 Q 200 270 240 288 Q 222 294 200 290 Q 178 294 160 288 Z" fill="#241c1a" />
        <FaceFeatures head={head} face={face} mouthY={head.cy + head.r * 0.58} mouthW={head.r * 0.44} />
      </g>
    </Svg>
  );
};
