import React from 'react';

/**
 * The goat, « La chèvre a encore frappé »: a Boer-style nanny goat, white with
 * a light brown head and a white blaze (or black and white), drawn flat like
 * the family in people.tsx. The body stands side-on, facing right; the head
 * faces the camera, which is the whole joke: whatever happens, she chews and
 * stares at you.
 *
 * Everything is a prop driven by the frame, in a 600 × 600 box whose ground
 * line is y 580. `chew` counts chewing cycles (pass frames / 15 and she chews
 * on the beat), `paper` is whatever she has in her mouth.
 */

export type GoatCoat = 'caramel' | 'pie';

const COATS: Record<GoatCoat, Record<'body' | 'bodyShade' | 'patch' | 'head' | 'headShade' | 'blaze' | 'muzzle' | 'ear' | 'innerEar' | 'horn' | 'hoof', string>> = {
  caramel: {
    body: '#f6f1e6',
    bodyShade: '#e3d8c4',
    patch: '#f6f1e6',
    head: '#c47f45',
    headShade: '#a5663a',
    blaze: '#f6f1e6',
    muzzle: '#eccab7',
    ear: '#b8713c',
    innerEar: '#e7a88f',
    horn: '#dccaa3',
    hoof: '#4a3a2e',
  },
  pie: {
    body: '#f4f2ee',
    bodyShade: '#dcd8d0',
    patch: '#2a2522',
    head: '#2a2522',
    headShade: '#161311',
    blaze: '#f4f2ee',
    muzzle: '#dcc5bb',
    ear: '#2a2522',
    innerEar: '#c89e93',
    horn: '#cdbfa6',
    hoof: '#3a302a',
  },
};

export type GoatState = {
  /** Chewing cycles, continuous: frames / 15 chews on the beat. 0 is a closed mouth at rest. */
  chew?: number;
  /** Where the pupils point, -1 to 1 on each axis; [0, 0] is straight into the camera. */
  look?: [number, number];
  /** 0 open, 1 shut. Adds to the lids. */
  blink?: number;
  /** How far the upper lids sit down at rest: the deadpan stare is about 0.35. */
  lids?: number;
  /** 0 ears out to the sides, 1 hanging down (disappointed). */
  ears?: number;
  /** Leg phase, continuous: one unit is one stride. The caller moves her along. */
  step?: number;
  /** Degrees the head tilts about the neck (positive is clockwise). */
  turn?: number;
  /** Units the head and neck reach forward and up, for a snatch. */
  reach?: number;
  /** 0 to 1: the jaw drops open. */
  open?: number;
  /** Something in her mouth, drawn in its own units with (0, 0) at the point she bites on; it sticks out to the screen's right. */
  paper?: { node: React.ReactNode; angle?: number; scale?: number };
};

/** The corner of the mouth the paper sticks out of (her left, the screen's right), before any reach or turn. */
export const GOAT_MOUTH: [number, number] = [444, 244];
/** The head's centre and the neck pivot, for cameras and scenes that line things up. */
export const GOAT_HEAD: [number, number] = [420, 158];
const PIVOT: [number, number] = [404, 236];
/** The head is drawn a size up from the body: a cartoon's head, for a face that carries the video. */
const HEAD_SCALE = 1.3;
export const GOAT_SIZE = 600;

const rot = ([x, y]: [number, number], [cx, cy]: [number, number], deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  const dx = x - cx;
  const dy = y - cy;
  return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
};

/** Where a point of the head (e.g. GOAT_MOUTH) ends up for a given reach and turn, in goat units. */
export const goatHeadPoint = (p: [number, number], { reach = 0, turn = 0 }: GoatState = {}): [number, number] => {
  const scaled: [number, number] = [PIVOT[0] + (p[0] - PIVOT[0]) * HEAD_SCALE, PIVOT[1] + (p[1] - PIVOT[1]) * HEAD_SCALE];
  const [x, y] = rot(scaled, PIVOT, turn);
  return [x + reach * 0.9, y - reach * 0.45];
};

export const Goat: React.FC<{ state?: GoatState; width?: number; coat?: GoatCoat; shadow?: boolean; style?: React.CSSProperties }> = ({
  state = {},
  width = 600,
  coat = 'caramel',
  shadow = true,
  style,
}) => {
  const c = COATS[coat];
  const { chew = 0, look = [0, 0], blink = 0, lids = 0.35, ears = 0, step = 0, turn = 0, reach = 0, open = 0, paper } = state;
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');

  // Chewing: goats grind sideways, so the jaw swings left and right and dips twice a cycle.
  const cyc = chew * Math.PI * 2;
  const chewing = chew !== 0 ? 1 : 0;
  const jx = Math.sin(cyc) * 7 * chewing;
  const jy = (1 - Math.cos(cyc * 2)) * 1.6 * chewing + open * 16;
  const cheekL = 1 + 0.1 * Math.max(0, Math.sin(cyc)) * chewing;
  const cheekR = 1 + 0.1 * Math.max(0, -Math.sin(cyc)) * chewing;

  // Legs swing about the hips; the near and far legs of a pair move opposite.
  const swing = Math.sin(step * Math.PI * 2) * 16;
  const bob = -Math.abs(Math.sin(step * Math.PI * 2)) * 4;

  const lid = Math.min(1, Math.max(0, lids + blink));
  const earAngle = -12 + ears * 78;

  const leg = (x: number, angle: number, far: boolean) => (
    <g transform={`rotate(${angle} ${x} 400)`}>
      <path
        d={`M ${x - 15} 392 L ${x + 15} 392 L ${x + 11} 486 Q ${x + 10} 500 ${x + 12} 548 L ${x - 10} 548 Q ${x - 9} 500 ${x - 12} 486 Z`}
        fill={far ? c.bodyShade : c.body}
      />
      <path d={`M ${x - 12} 546 L ${x + 13} 546 L ${x + 15} 572 Q ${x} 578 ${x - 14} 572 Z`} fill={c.hoof} />
    </g>
  );

  const eye = (x: number, side: 'l' | 'r') => {
    const y = 138;
    const rx = 15;
    const ry = 12.5;
    return (
      <g key={side}>
        <clipPath id={`e${side}${uid}`}>
          <ellipse cx={x} cy={y} rx={rx} ry={ry} />
        </clipPath>
        <ellipse cx={x} cy={y} rx={rx + 3} ry={ry + 3} fill={c.headShade} />
        <g clipPath={`url(#e${side}${uid})`}>
          <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#e8b746" />
          <ellipse cx={x} cy={y + 3} rx={rx} ry={ry * 0.7} fill="#d69a2c" opacity="0.5" />
          {/* The horizontal pupil: the stare. */}
          <rect x={x - 9 + look[0] * 5} y={y - 3 + look[1] * 4} width="18" height="6.5" rx="3.2" fill="#1b1512" />
          <circle cx={x + 5 + look[0] * 3} cy={y - 5} r="2.6" fill="#fff" opacity="0.85" />
          {/* The upper lid, down to `lid` of the eye, with its dark edge. */}
          <rect x={x - rx - 2} y={y - ry - 2} width={rx * 2 + 4} height={(ry * 2 + 2) * lid + 2} fill={c.head} />
          <rect x={x - rx - 2} y={y - ry + (ry * 2 + 2) * lid - 1.5} width={rx * 2 + 4} height="3" fill={c.headShade} />
        </g>
      </g>
    );
  };

  const ear = (side: -1 | 1) => {
    const [ax, ay] = side < 0 ? [364, 118] : [476, 118];
    const angle = side < 0 ? 180 - earAngle : earAngle;
    return (
      <g key={side} transform={`rotate(${angle} ${ax} ${ay})`}>
        <path d={`M ${ax - 4} ${ay - 12} Q ${ax + 44} ${ay - 18} ${ax + 76} ${ay + 2} Q ${ax + 44} ${ay + 20} ${ax - 4} ${ay + 12} Z`} fill={c.ear} />
        <path d={`M ${ax + 6} ${ay - 5} Q ${ax + 42} ${ay - 8} ${ax + 64} ${ay + 2} Q ${ax + 40} ${ay + 10} ${ax + 6} ${ay + 5} Z`} fill={c.innerEar} />
      </g>
    );
  };

  const horn = (side: -1 | 1) => {
    const x = 420 + side * 22;
    const tip = 420 + side * 48;
    return (
      <g key={`h${side}`}>
        <path d={`M ${x - 10} 90 Q ${x - 6 + side * 4} 40 ${tip} 18 Q ${x + side * 16} 46 ${x + 10} 90 Z`} fill={c.horn} />
        {[70, 56, 44].map((y) => (
          <path key={y} d={`M ${x - 9 + side * (84 - y) * 0.18} ${y} q 10 4 18 0`} stroke="#b8a37a" strokeWidth="2.5" fill="none" />
        ))}
      </g>
    );
  };

  const [hx, hy] = [reach * 0.9, -reach * 0.45];
  const headTransform = `translate(${hx} ${hy}) rotate(${turn} ${PIVOT[0]} ${PIVOT[1]}) translate(${PIVOT[0]} ${PIVOT[1]}) scale(${HEAD_SCALE}) translate(${-PIVOT[0]} ${-PIVOT[1]})`;

  return (
    <svg width={width} height={width} viewBox="0 0 600 600" style={{ overflow: 'visible', ...style }}>
      {shadow ? <ellipse cx="250" cy="580" rx="185" ry="16" fill="rgba(90,55,20,0.22)" /> : null}
      <g transform={`translate(0 ${bob})`}>
        {/* Far legs, in the body's shade */}
        {leg(178, -swing, true)}
        {leg(318, swing, true)}
        {/* Tail */}
        <path d="M 116 300 Q 88 266 100 244 Q 116 268 134 292 Z" fill={c.body} />
        {/* Body */}
        <path d="M 110 300 Q 130 262 230 266 Q 330 262 372 296 Q 400 330 382 392 Q 352 442 250 442 Q 140 444 108 402 Q 88 352 110 300 Z" fill={c.body} />
        <path d="M 120 404 Q 150 440 250 442 Q 352 442 382 392 Q 360 424 250 426 Q 160 426 120 404 Z" fill={c.bodyShade} />
        {coat === 'pie' ? <path d="M 160 280 Q 230 262 300 276 Q 310 330 270 350 Q 200 356 170 330 Q 150 305 160 280 Z" fill={c.patch} /> : null}
        {/* Near legs */}
        {leg(152, swing, false)}
        {leg(346, -swing, false)}
        {/* Neck, reaching with the head */}
        <path
          d={`M 318 322 Q ${332 + hx * 0.5} ${244 + hy * 0.5} ${380 + hx} ${196 + hy} L ${446 + hx} ${214 + hy} Q ${404 + hx * 0.5} ${264 + hy * 0.5} 394 344 Z`}
          fill={c.body}
        />
        <g transform={headTransform}>
          {ear(-1)}
          {ear(1)}
          {horn(-1)}
          {horn(1)}
          {/* The head: a long face narrowing to the muzzle */}
          <path d="M 420 66 Q 480 68 486 126 Q 490 170 466 206 Q 458 252 420 258 Q 382 252 374 206 Q 350 170 354 126 Q 360 68 420 66 Z" fill={c.head} />
          <path d="M 358 150 Q 362 190 378 212 Q 372 180 366 150 Z M 482 150 Q 478 190 462 212 Q 468 180 474 150 Z" fill={c.headShade} opacity="0.6" />
          {/* The blaze down the face */}
          <path d="M 412 70 Q 420 64 428 70 Q 432 120 436 170 Q 450 196 452 222 L 388 222 Q 390 196 404 170 Q 408 120 412 70 Z" fill={c.blaze} />
          {/* Cheeks, puffing in turn as she grinds */}
          <ellipse cx="380" cy="210" rx={16 * cheekL} ry={14 * cheekL} fill={c.head} />
          <ellipse cx="460" cy="210" rx={16 * cheekR} ry={14 * cheekR} fill={c.head} />
          {eye(392, 'l')}
          {eye(448, 'r')}
          {/* Brow ridges: the deadpan is in the lids, not the brows. */}
          <path d="M 374 120 Q 392 112 408 120 M 432 120 Q 448 112 466 120" stroke={c.headShade} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
          {/* Muzzle */}
          <path d="M 384 214 Q 386 196 420 194 Q 454 196 456 214 Q 458 244 420 248 Q 382 244 384 214 Z" fill={c.muzzle} />
          <path d="M 404 218 q 4 6 10 4 M 436 218 q -4 6 -10 4" stroke="#7a4b3c" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* What she has in her mouth, bitten at the corner */}
          {paper ? (
            <g transform={`translate(${GOAT_MOUTH[0] + jx * 0.6} ${GOAT_MOUTH[1] + jy * 0.5}) rotate(${(paper.angle ?? 0) + Math.sin(cyc) * 3 * chewing}) scale(${paper.scale ?? 1})`}>
              {paper.node}
            </g>
          ) : null}
          {/* The lower jaw and the beard swing together */}
          <g transform={`translate(${jx} ${jy})`}>
            <path d="M 394 244 Q 420 272 446 244 Q 440 262 420 266 Q 400 262 394 244 Z" fill={c.muzzle} />
            <path d="M 404 262 Q 416 300 424 318 Q 428 296 438 262 Z" fill={c.blaze} />
            <path d="M 410 266 Q 420 294 424 306" stroke={c.bodyShade} strokeWidth="3" fill="none" />
          </g>
          {/* The mouth line over it all, and the lip corner holding the paper */}
          <path d={`M 398 ${240 + jy * 0.3} Q 410 ${248 + jy * 0.6} 420 ${244 + jy * 0.5} Q 430 ${248 + jy * 0.6} 442 ${240 + jy * 0.3}`} stroke="#6b3f31" strokeWidth="3.5" strokeLinecap="round" fill={open > 0.2 ? '#6b2f2a' : 'none'} />
          {paper ? <ellipse cx={GOAT_MOUTH[0] - 2 + jx * 0.5} cy={GOAT_MOUTH[1] - 1 + jy * 0.3} rx="9" ry="7" fill={c.muzzle} /> : null}
        </g>
      </g>
    </svg>
  );
};
