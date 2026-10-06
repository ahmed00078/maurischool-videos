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

export type Mouth = 'smile' | 'grin' | 'flat' | 'o' | 'wobble' | 'smirk' | 'talk' | 'yawn';

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
  /** For 'talk' and 'yawn': 0 closed to 1 wide. */
  open?: number;
  /** 0 to 1: drops at the temple. */
  sweat?: number;
  blush?: number;
  /** Seconds, for the drops to run. */
  t?: number;
};

const INK = '#2a1d1a';

export type Head = { cx: number; cy: number; r: number; skin: string; shade: string };

/** Eyes, brows, nose, mouth, cheeks and sweat, laid out on a round head. */
export const FaceFeatures: React.FC<{ head: Head; face: Face; mouthY?: number; mouthW?: number }> = ({ head, face, mouthY, mouthW }) => {
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
    case 'yawn': {
      // A tall open oval, the tongue at the bottom: `open` from a gape to the full yawn.
      const o = Math.max(0.2, Math.min(1, open));
      mouthEl = (
        <g>
          <ellipse cx={cx} cy={my + r * 0.13 * o} rx={r * (0.12 + 0.07 * o)} ry={r * (0.08 + 0.2 * o)} fill={lip} />
          <ellipse cx={cx} cy={my + r * 0.3 * o} rx={r * (0.08 + 0.04 * o)} ry={r * 0.06 * o} fill="#c9575a" />
        </g>
      );
      break;
    }
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

export type BustProps = {
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
 *
 * `phone` puts his phone in the same pocket, its top `rise` (0 to 1) out and
 * `shake` units sideways when it buzzes; `pocketOut` (0 to 1) turns the
 * pocket's lining out, the universal sign for « nothing left in here ».
 */
export const Father: React.FC<
  BustProps & { envelope?: number; envelopeLabel?: string; labelFont?: string; phone?: { rise: number; shake?: number }; pocketOut?: number }
> = ({ face, tilt = 0, width = 340, style, envelope = 0, envelopeLabel, labelFont, phone, pocketOut = 0 }) => {
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
      {phone ? (
        <g transform={`translate(${phone.shake ?? 0} ${40 - phone.rise * 78}) rotate(4 270 520)`}>
          <rect x="236" y="466" width="68" height="130" rx="12" fill="#1c1f2e" />
          <rect x="241" y="471" width="58" height="120" rx="8" fill="#2b3150" />
          <circle cx="270" cy="479" r="3" fill="#0b0d16" />
        </g>
      ) : null}
      <rect x="214" y="500" width="112" height="120" rx="12" fill="#5b95cc" />
      <path d="M 226 516 q 22 -14 44 0 t 44 0 M 226 540 q 22 -14 44 0 t 44 0" stroke={gold} strokeWidth="4" fill="none" />
      <circle cx="270" cy="584" r="14" fill="none" stroke={gold} strokeWidth="4" />
      {pocketOut > 0 ? (
        // The lining, pulled out over the pocket's front: a pale flap with a seam and a crumple.
        <g transform={`translate(0 504) scale(1 ${pocketOut}) translate(0 -504)`}>
          <path d="M 220 502 L 320 502 Q 326 560 304 604 Q 290 590 276 606 Q 262 588 248 604 Q 232 592 222 600 Q 212 556 220 502 Z" fill="#f3efe3" />
          <path d="M 226 520 Q 270 530 314 520" stroke="#d8d0bb" strokeWidth="4" fill="none" />
          <path d="M 246 548 q 10 16 4 34 M 292 546 q -8 18 0 36" stroke="#e2dac6" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      ) : null}
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

type Pt = [number, number];

/**
 * One arm, in a bust's own drawing units (400 × 1700): a sleeve from the
 * shoulder to the wrist, bent at the elbow (`bend` pushes the elbow sideways,
 * negative to the left), and a round hand with its thumb. Draw it inside a
 * <BustLayer> laid over the bust, so it lines up with the body.
 */
export const Arm: React.FC<{
  from: Pt;
  to: Pt;
  sleeve: string;
  skin: string;
  thickness?: number;
  bend?: number;
  /** Which side the thumb sits on, -1 left or 1 right of the hand. */
  thumb?: -1 | 1;
}> = ({ from, to, sleeve, skin, thickness = 64, bend = 40, thumb = 1 }) => {
  const [sx, sy] = from;
  const [hx, hy] = to;
  const ex = (sx + hx) / 2 + bend;
  const ey = (sy + hy) / 2 + Math.abs(bend) * 0.3;
  const d = `M ${sx} ${sy} Q ${ex} ${ey} ${hx} ${hy}`;
  const r = thickness * 0.42;
  return (
    <g>
      <path d={d} stroke={sleeve} strokeWidth={thickness} strokeLinecap="round" fill="none" />
      <path d={d} stroke="rgba(0,0,0,0.1)" strokeWidth={thickness * 0.28} strokeLinecap="round" fill="none" transform={`translate(${thickness * 0.2} 0)`} />
      <circle cx={hx} cy={hy} r={r} fill={skin} />
      <circle cx={hx} cy={hy + r * 0.15} r={r} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={3} />
      <ellipse
        cx={hx + thumb * r * 0.85}
        cy={hy - r * 0.35}
        rx={r * 0.34}
        ry={r * 0.5}
        fill={skin}
        transform={`rotate(${thumb * 30} ${hx + thumb * r * 0.85} ${hy - r * 0.35})`}
      />
    </g>
  );
};

/** An SVG over a bust, in its drawing units: where arms and held things go. */
export const BustLayer: React.FC<{ width: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ width, children, style }) => (
  <svg width={width} height={width * 4.25} viewBox="0 0 400 1700" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style }}>
    {children}
  </svg>
);

/** Where the father's shoulders are, for his arms: [screen-left, screen-right]. */
export const FATHER_SHOULDERS: [Pt, Pt] = [
  [84, 520],
  [316, 520],
];
export const FATHER_COLORS = { sleeve: '#6aa6dd', skin: '#8f5b3b' } as const;

const MELHFA = { base: '#e39b2d', light: '#f2bd5c', motif: '#b35f16', edge: '#c9761c' };

/**
 * A school accountant: a grown woman in a saffron melhfa draped over her head
 * and shoulders, small round glasses. Neutral and friendly: she asks for the
 * receipt because that is her job. A stranger to the family, so she is nobody
 * from the « Vérité » series.
 */
export const Accountant: React.FC<BustProps & { glasses?: boolean }> = ({ face, tilt = 0, width = 340, style, glasses = true }) => {
  const head: Head = { cx: 200, cy: 268, r: 100, skin: '#a86b45', shade: '#8a5535' };
  const id = `melhfa${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const ex = head.r * 0.36;
  const ey = head.cy - head.r * 0.02;
  const cloth = (d: string, light = false) => (
    <>
      <path d={d} fill={light ? MELHFA.light : MELHFA.base} />
      <path d={d} fill={`url(#${id})`} opacity={light ? 0.7 : 1} />
    </>
  );
  return (
    <Svg width={width} style={style}>
      <defs>
        <pattern id={id} width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
          <path d="M 12 10 q 6 -9 12 0 q -6 9 -12 0 Z" fill={MELHFA.motif} opacity="0.55" />
          <circle cx="35" cy="33" r="3.2" fill={MELHFA.motif} opacity="0.5" />
          <circle cx="8" cy="36" r="2" fill="#fff4dc" opacity="0.6" />
        </pattern>
      </defs>
      {/* The melhfa over the body, and its drape across the chest */}
      {cloth('M 26 1700 L 26 610 Q 36 474 200 456 Q 364 474 374 610 L 374 1700 Z')}
      {cloth('M 40 560 Q 190 600 374 860 L 374 990 Q 200 720 30 680 Z', true)}
      <path d="M 44 600 Q 190 640 374 900" stroke={MELHFA.edge} strokeWidth="5" fill="none" opacity="0.6" />
      <g transform={`rotate(${tilt} 200 390)`}>
        {cloth('M 200 104 Q 348 104 350 272 Q 354 430 304 490 L 96 490 Q 46 430 50 272 Q 52 104 200 104 Z')}
        <ellipse cx={head.cx} cy={head.cy + 6} rx="90" ry="110" fill={head.skin} />
        {/* A line of hair under the fabric's edge */}
        <path d="M 116 214 Q 124 176 200 172 Q 276 176 284 214 Q 262 194 200 192 Q 138 194 116 214 Z" fill="#231a18" />
        <path d="M 104 250 Q 104 148 200 142 Q 296 148 296 250 Q 288 176 200 170 Q 112 176 104 250 Z" fill={MELHFA.light} />
        <FaceFeatures head={head} face={face} />
        {glasses ? (
          <g stroke="#3b2a22" strokeWidth="5" fill="rgba(255,255,255,0.08)">
            <rect x={head.cx - ex - 27} y={ey - 22} width="54" height="44" rx="18" />
            <rect x={head.cx + ex - 27} y={ey - 22} width="54" height="44" rx="18" />
            <path d={`M ${head.cx - ex + 27} ${ey - 4} Q ${head.cx} ${ey - 14} ${head.cx + ex - 27} ${ey - 4}`} fill="none" />
          </g>
        ) : null}
      </g>
      {/* The melhfa wrapped under the chin and over the shoulders */}
      {cloth('M 66 506 Q 118 444 200 466 Q 282 444 334 506 L 356 616 Q 200 532 44 616 Z')}
      <path d="M 96 480 Q 200 530 304 480" stroke={MELHFA.light} strokeWidth="10" fill="none" strokeLinecap="round" />
    </Svg>
  );
};

/** The accountant's shoulders and colours, for her arms. */
export const ACCOUNTANT_SHOULDERS: [Pt, Pt] = [
  [78, 560],
  [322, 560],
];
export const ACCOUNTANT_COLORS = { sleeve: MELHFA.base, skin: '#a86b45' } as const;
