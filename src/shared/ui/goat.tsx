import React from 'react';

/**
 * The goat, « La chèvre a encore frappé »: a Boer-style nanny goat, white with
 * a light brown head and a white blaze (or black and white), drawn flat like
 * the family in people.tsx, with a warm outline so her white coat never melts
 * into the sand or a white shirt. The body stands side-on, facing right; the
 * head faces the camera, which is the whole joke: whatever happens, she chews
 * and stares at you.
 *
 * What makes her her, from one episode to the next: the sleepy stare and its
 * horizontal pupils, the caramel patch on her flank, the tuft between her
 * curved horns, the beard, the rope collar with its little brass bell, and a
 * short tail that sticks up and wags when she is pleased with herself.
 *
 * Everything is a prop driven by the frame, in a 600 × 600 box whose ground
 * line is y 580. `chew` counts chewing cycles (pass frames / 15 and she chews
 * on the beat), `idle` is the clock in seconds for the small motions (an ear
 * flick now and then, the tail, the bell), `paper` is whatever she has in her
 * mouth.
 */

export type GoatCoat = 'caramel' | 'pie';

type Coat = Record<
  'body' | 'bodyShade' | 'patch' | 'head' | 'headShade' | 'blaze' | 'muzzle' | 'ear' | 'innerEar' | 'horn' | 'hornRidge' | 'hoof' | 'outline' | 'headLine',
  string
>;

const COATS: Record<GoatCoat, Coat> = {
  caramel: {
    body: '#f7f2e8',
    bodyShade: '#e2d5bf',
    patch: '#d8a067',
    head: '#c47f45',
    headShade: '#a5663a',
    blaze: '#f7f2e8',
    muzzle: '#eccab7',
    ear: '#b8713c',
    innerEar: '#e7a88f',
    horn: '#d3bb8e',
    hornRidge: '#a88f60',
    hoof: '#3f3128',
    outline: '#9d8064',
    headLine: '#8a5330',
  },
  pie: {
    body: '#f5f3ef',
    bodyShade: '#dcd8d0',
    patch: '#2a2522',
    head: '#2a2522',
    headShade: '#161311',
    blaze: '#f5f3ef',
    muzzle: '#dcc5bb',
    ear: '#2a2522',
    innerEar: '#c89e93',
    horn: '#cdbfa6',
    hornRidge: '#a08f70',
    hoof: '#33291f',
    outline: '#857a70',
    headLine: '#0b0908',
  },
};

const ROPE = { base: '#b0753a', twist: '#7f4d1f' };
const BRASS = { base: '#e3b23c', shade: '#b88a1c', line: '#8a6512' };

export type GoatState = {
  /** Chewing cycles, continuous: frames / 15 chews on the beat. 0 is a closed mouth at rest. */
  chew?: number;
  /** Seconds on the video's clock, for the idle motions: an ear flick every few seconds, the tail, the bell. */
  idle?: number;
  /** Where the pupils point, -1 to 1 on each axis; [0, 0] is straight into the camera. */
  look?: [number, number];
  /** 0 open, 1 shut. Adds to the lids. */
  blink?: number;
  /** How far the upper lids sit down at rest: the deadpan stare is about 0.35. */
  lids?: number;
  /** 0 ears out to the sides, 1 hanging down (disappointed). */
  ears?: number;
  /** -1 frowning, 0 rest, 1 raised. */
  brows?: number;
  /** 0 to 1: the inner ends of the brows go up, the sad look. */
  sad?: number;
  /** 0 to 1: one corner of the mouth goes up, the smug look after a theft. */
  smirk?: number;
  /** 0 to 1: the tail wags, pleased; at 0 it only sways. */
  wag?: number;
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

/** A quick there-and-back, 0 → 1 → 0 over `len` seconds, once every `period` seconds from `phase`. */
const pulse = (t: number, period: number, phase: number, len: number) => {
  const u = (((t - phase) % period) + period) % period;
  return u < len ? Math.sin((u / len) * Math.PI) : 0;
};

/** The silhouette of the body: a straight back, a little rise at the withers, a deep chest, the belly, the rump. */
const BODY =
  'M 116 304 C 112 280 132 270 160 270 L 318 268 C 344 266 362 270 378 288 C 400 312 400 352 392 376 C 386 404 368 420 346 424 ' +
  'C 310 432 280 436 250 436 C 210 438 172 432 150 424 C 124 414 110 396 108 368 C 106 340 108 318 116 304 Z';
const BELLY =
  'M 150 424 C 172 432 210 438 250 436 C 280 436 310 432 346 424 C 330 410 300 414 250 416 C 200 418 168 414 150 404 Z';
/** The caramel coat's mark: one patch on the flank, the same from episode to episode. */
const FLANK_PATCH = 'M 200 288 C 228 276 268 280 282 300 C 296 322 280 348 250 352 C 220 356 192 342 188 320 C 186 304 190 294 200 288 Z';
/** The pie coat's saddle. */
const SADDLE = 'M 168 276 Q 236 262 306 276 Q 318 330 278 352 Q 206 360 176 334 Q 154 306 168 276 Z';

export const Goat: React.FC<{ state?: GoatState; width?: number; coat?: GoatCoat; shadow?: boolean; style?: React.CSSProperties }> = ({
  state = {},
  width = 600,
  coat = 'caramel',
  shadow = true,
  style,
}) => {
  const c = COATS[coat];
  const {
    chew = 0,
    idle = 0,
    look = [0, 0],
    blink = 0,
    lids = 0.35,
    ears = 0,
    brows = 0,
    sad = 0,
    smirk = 0,
    wag = 0,
    step = 0,
    turn = 0,
    reach = 0,
    open = 0,
    paper,
  } = state;
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');

  // Chewing: goats grind sideways, so the jaw swings left and right and dips twice a cycle.
  const cyc = chew * Math.PI * 2;
  const chewing = chew !== 0 ? 1 : 0;
  const jx = Math.sin(cyc) * 7 * chewing;
  const jy = (1 - Math.cos(cyc * 2)) * 1.6 * chewing + open * 16;
  const cheekL = 1 + 0.1 * Math.max(0, Math.sin(cyc)) * chewing;
  const cheekR = 1 + 0.1 * Math.max(0, -Math.sin(cyc)) * chewing;

  // Legs swing about the hips and shoulders; the near and far legs of a pair move opposite.
  const swing = Math.sin(step * Math.PI * 2) * 16;
  const bob = -Math.abs(Math.sin(step * Math.PI * 2)) * 4;

  const lid = Math.min(1, Math.max(0, lids + blink));
  const earAngle = -12 + ears * 78;
  // Idle: her right ear (screen right) flicks every few seconds; the tail sways, or wags; the bell follows the jaw and the steps.
  const flick = pulse(idle, 3.3, 1.1, 0.35) * 22 * (1 - ears);
  const tailAngle = -6 + Math.sin(idle * Math.PI * 2 * 0.7) * 5 + Math.sin(idle * Math.PI * 2 * 4) * 16 * wag;
  const bellSwing = Math.sin(cyc) * 5 * chewing + swing * 0.5 + Math.sin(idle * Math.PI * 2 * 0.9) * 3;

  const stroke = { stroke: c.outline, strokeWidth: 3.5, strokeLinejoin: 'round' as const };

  /**
   * A leg as a filled shape and its outline, drawn without the top edge so the
   * leg runs into the body without a seam. `sides` is the path from the top's
   * right corner down and round to its left corner.
   */
  const leg = (x: number, top: number, angle: number, far: boolean, right: number, left: number, sides: string, hoofAt: number) => (
    <g transform={`rotate(${angle} ${x} ${top})`}>
      <path d={`M ${x + left} ${top} L ${x + right} ${top} ${sides} Z`} fill={far ? c.bodyShade : c.body} />
      <path d={`M ${x + right} ${top} ${sides}`} fill="none" {...stroke} strokeLinecap="round" />
      {hoof(hoofAt)}
    </g>
  );
  /** A front leg: straight, a knee half-way, a slim cannon. */
  const frontLeg = (x: number, top: number, angle: number, far: boolean) =>
    leg(
      x,
      top,
      angle,
      far,
      15,
      -17,
      `C ${x + 16} ${top + 40} ${x + 12} 470 ${x + 11} 480 Q ${x + 15} 490 ${x + 9} 500 L ${x + 8} 548 L ${x - 9} 548 L ${x - 10} 500 Q ${x - 15} 490 ${x - 12} 480 C ${x - 14} 470 ${x - 18} ${top + 40} ${x - 17} ${top}`,
      x,
    );
  /** A hind leg: a strong thigh, the hock sticking out backward, the cannon down to the hoof. */
  const hindLeg = (x: number, top: number, angle: number, far: boolean) =>
    leg(
      x,
      top,
      angle,
      far,
      20,
      -22,
      `C ${x + 22} ${top + 50} ${x + 14} 440 ${x + 6} 466 C ${x + 2} 476 ${x - 1} 484 ${x} 494 L ${x + 2} 548 L ${x - 13} 548 L ${x - 16} 502 Q ${x - 25} 490 ${x - 21} 476 C ${x - 26} 440 ${x - 30} ${top + 50} ${x - 22} ${top}`,
      x - 5,
    );
  /** A cloven hoof. */
  const hoof = (x: number) => (
    <g>
      <path d={`M ${x - 12} 546 L ${x + 11} 546 L ${x + 15} 572 Q ${x} 579 ${x - 14} 572 Z`} fill={c.hoof} />
      <path d={`M ${x + 1} 552 L ${x + 2} 575`} stroke="#000" strokeOpacity="0.45" strokeWidth="2.5" />
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
          <rect x={x - rx - 2} y={y - ry + (ry * 2 + 2) * lid - 1.5} width={rx * 2 + 4} height="3" fill={c.headLine} />
        </g>
      </g>
    );
  };

  const ear = (side: -1 | 1) => {
    const [ax, ay] = side < 0 ? [364, 118] : [476, 118];
    const angle = side < 0 ? 180 - earAngle : earAngle - flick;
    return (
      <g key={side} transform={`rotate(${angle} ${ax} ${ay})`}>
        <path d={`M ${ax - 4} ${ay - 13} Q ${ax + 46} ${ay - 20} ${ax + 80} ${ay + 2} Q ${ax + 46} ${ay + 21} ${ax - 4} ${ay + 13} Z`} fill={c.ear} stroke={c.headLine} strokeWidth="3" strokeLinejoin="round" />
        <path d={`M ${ax + 6} ${ay - 5} Q ${ax + 42} ${ay - 9} ${ax + 66} ${ay + 2} Q ${ax + 40} ${ay + 10} ${ax + 6} ${ay + 5} Z`} fill={c.innerEar} />
      </g>
    );
  };

  /** A horn: long, ridged, sweeping up and back over the ear. */
  const horn = (side: -1 | 1) => {
    const x = 420 + side * 22;
    const tip = 420 + side * 70;
    const d = `M ${x - 11} 94 C ${x - 12 + side * 4} 54 ${tip - side * 26} 18 ${tip} 2 C ${tip - side * 10} 26 ${x + side * 20} 52 ${x + 11} 94 Z`;
    return (
      <g key={`h${side}`}>
        <path d={d} fill={c.horn} stroke={c.hornRidge} strokeWidth="2.5" strokeLinejoin="round" />
        {[78, 64, 50, 38, 27].map((y, k) => {
          // The ridges follow the horn as it sweeps outward.
          const cx = x + side * (k * k * 1.6 + k * 2);
          const half = 10 - k * 1.3;
          return <path key={y} d={`M ${cx - half} ${y + 2} Q ${cx} ${y - 3} ${cx + half} ${y + 2}`} stroke={c.hornRidge} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
        })}
      </g>
    );
  };

  /** A brow: its outer end, its middle, its inner end; up with `brows`, the inner end up with `sad`. */
  const brow = (side: -1 | 1) => {
    const outer = 420 + side * 46;
    const inner = 420 + side * 12;
    const lift = brows * 7;
    return (
      <path
        key={`b${side}`}
        d={`M ${outer} ${121 - lift + sad * 5} Q ${420 + side * 28} ${112 - lift} ${inner} ${120 - lift - sad * 9}`}
        stroke={c.headLine}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
    );
  };

  const [hx, hy] = [reach * 0.9, -reach * 0.45];
  const headTransform = `translate(${hx} ${hy}) rotate(${turn} ${PIVOT[0]} ${PIVOT[1]}) translate(${PIVOT[0]} ${PIVOT[1]}) scale(${HEAD_SCALE}) translate(${-PIVOT[0]} ${-PIVOT[1]})`;

  // The neck, from the withers and the chest up to the head, and the collar a third of the way up it.
  const neckA: [number, number] = [324, 300];
  const neckB: [number, number] = [394, 346];
  const headA: [number, number] = [380 + hx, 196 + hy];
  const headB: [number, number] = [446 + hx, 214 + hy];
  const along = ([ax, ay]: [number, number], [bx, by]: [number, number], f: number): [number, number] => [ax + (bx - ax) * f, ay + (by - ay) * f];
  const ca = along(neckA, headA, 0.36);
  const cb = along(neckB, headB, 0.36);
  const cm: [number, number] = [(ca[0] + cb[0]) / 2, (ca[1] + cb[1]) / 2 + 9];
  const rope = `M ${ca[0]} ${ca[1]} Q ${cm[0]} ${cm[1] + 9} ${cb[0]} ${cb[1]}`;

  // The mouth: a straight deadpan line, one corner pulled up by `smirk`.
  const my = 240 + jy * 0.3;
  const mouth = `M 398 ${my + 2 * smirk} Q 410 ${248 + jy * 0.6} 420 ${244 + jy * 0.5} Q 432 ${248 + jy * 0.6 - 6 * smirk} 443 ${my - 9 * smirk}`;

  return (
    <svg width={width} height={width} viewBox="0 0 600 600" style={{ overflow: 'visible', ...style }}>
      {shadow ? <ellipse cx="250" cy="580" rx="190" ry="16" fill="rgba(90,55,20,0.22)" /> : null}
      <g transform={`translate(0 ${bob})`}>
        {/* Far legs, in the body's shade */}
        {hindLeg(178, 374, -swing, true)}
        {frontLeg(326, 392, swing, true)}
        {/* The tail: short, sticking up, swaying (wagging when she is pleased) */}
        <g transform={`rotate(${tailAngle} 118 300)`}>
          <path d="M 122 304 C 106 292 98 272 104 252 C 110 246 118 250 120 258 C 124 274 130 290 134 300 Z" fill={c.body} {...stroke} />
          <path d="M 104 252 C 100 244 106 236 112 242 C 116 246 116 252 112 256 Z" fill={c.bodyShade} />
        </g>
        {/* The body, its belly in shade, its coat's mark, the hip and the shoulder */}
        <path d={BODY} fill={c.body} {...stroke} />
        <path d={BELLY} fill={c.bodyShade} />
        <path d={coat === 'pie' ? SADDLE : FLANK_PATCH} fill={c.patch} />
        <path d="M 124 330 C 152 330 186 352 190 402" stroke={c.bodyShade} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M 352 300 C 338 330 336 370 348 408" stroke={c.bodyShade} strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Near legs */}
        {hindLeg(150, 372, swing, false)}
        {frontLeg(350, 392, -swing, false)}
        {/* The neck, reaching with the head, outlined along its sides only */}
        <path
          d={`M ${neckA[0]} ${neckA[1]} Q ${332 + hx * 0.5} ${244 + hy * 0.5} ${headA[0]} ${headA[1]} L ${headB[0]} ${headB[1]} Q ${404 + hx * 0.5} ${264 + hy * 0.5} ${neckB[0]} ${neckB[1]} Z`}
          fill={c.body}
        />
        <path d={`M ${neckA[0]} ${neckA[1]} Q ${332 + hx * 0.5} ${244 + hy * 0.5} ${headA[0]} ${headA[1]}`} {...stroke} fill="none" />
        <path d={`M ${neckB[0]} ${neckB[1]} Q ${404 + hx * 0.5} ${264 + hy * 0.5} ${headB[0]} ${headB[1]}`} {...stroke} fill="none" />
        {/* The rope collar and its little brass bell */}
        <path d={rope} stroke={ROPE.base} strokeWidth="11" fill="none" strokeLinecap="round" />
        <path d={rope} stroke={ROPE.twist} strokeWidth="11" fill="none" strokeDasharray="3 6" strokeLinecap="butt" opacity="0.55" />
        <g transform={`rotate(${bellSwing} ${cm[0]} ${cm[1] + 4})`}>
          <path d={`M ${cm[0] - 3} ${cm[1] + 2} L ${cm[0] + 3} ${cm[1] + 2} L ${cm[0] + 3} ${cm[1] + 9} L ${cm[0] - 3} ${cm[1] + 9} Z`} fill={BRASS.line} />
          <path
            d={`M ${cm[0] - 11} ${cm[1] + 12} Q ${cm[0]} ${cm[1] + 3} ${cm[0] + 11} ${cm[1] + 12} Q ${cm[0] + 12} ${cm[1] + 28} ${cm[0] + 16} ${cm[1] + 34} L ${cm[0] - 16} ${cm[1] + 34} Q ${cm[0] - 12} ${cm[1] + 28} ${cm[0] - 11} ${cm[1] + 12} Z`}
            fill={BRASS.base}
            stroke={BRASS.line}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d={`M ${cm[0] - 6} ${cm[1] + 14} Q ${cm[0] - 7} ${cm[1] + 24} ${cm[0] - 9} ${cm[1] + 30}`} stroke="#fff3c4" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
          <circle cx={cm[0]} cy={cm[1] + 37} r="4" fill={BRASS.shade} />
        </g>
        <g transform={headTransform}>
          {ear(-1)}
          {ear(1)}
          {horn(-1)}
          {horn(1)}
          {/* The head: a long face narrowing to the muzzle, outlined */}
          <path d="M 420 66 Q 480 68 486 126 Q 490 170 466 206 Q 458 252 420 258 Q 382 252 374 206 Q 350 170 354 126 Q 360 68 420 66 Z" fill={c.head} stroke={c.headLine} strokeWidth="3" />
          <path d="M 358 150 Q 362 190 378 212 Q 372 180 366 150 Z M 482 150 Q 478 190 462 212 Q 468 180 474 150 Z" fill={c.headShade} opacity="0.6" />
          {/* The blaze down the face */}
          <path d="M 412 70 Q 420 64 428 70 Q 432 120 436 170 Q 450 196 452 222 L 388 222 Q 390 196 404 170 Q 408 120 412 70 Z" fill={c.blaze} />
          {/* The tuft between the horns */}
          <path d="M 398 80 Q 400 58 412 70 Q 416 50 426 66 Q 434 52 442 78 Q 430 72 420 76 Q 408 72 398 80 Z" fill={c.headShade} />
          {/* Cheeks, puffing in turn as she grinds */}
          <ellipse cx="380" cy="210" rx={16 * cheekL} ry={14 * cheekL} fill={c.head} />
          <ellipse cx="460" cy="210" rx={16 * cheekR} ry={14 * cheekR} fill={c.head} />
          {eye(392, 'l')}
          {eye(448, 'r')}
          {brow(-1)}
          {brow(1)}
          {/* Muzzle */}
          <path d="M 384 214 Q 386 196 420 194 Q 454 196 456 214 Q 458 244 420 248 Q 382 244 384 214 Z" fill={c.muzzle} />
          <path d="M 404 218 q 4 6 10 4 M 436 218 q -4 6 -10 4" stroke="#7a4b3c" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* What she has in her mouth, bitten at the corner */}
          {paper ? (
            <g transform={`translate(${GOAT_MOUTH[0] + jx * 0.6} ${GOAT_MOUTH[1] + jy * 0.5}) rotate(${(paper.angle ?? 0) + Math.sin(cyc) * 3 * chewing}) scale(${paper.scale ?? 1})`}>
              {paper.node}
            </g>
          ) : null}
          {/* The lower jaw and the beard swing together; the beard is long now, a goat's */}
          <g transform={`translate(${jx} ${jy})`}>
            <path d="M 394 244 Q 420 272 446 244 Q 440 262 420 266 Q 400 262 394 244 Z" fill={c.muzzle} />
            <path d="M 404 260 Q 410 288 416 314 Q 420 324 424 314 Q 430 288 436 260 Z" fill={c.blaze} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 413 270 Q 417 290 419 306 M 427 270 Q 425 288 422 302" stroke={c.bodyShade} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
          {/* The mouth line over it all, a corner up when she is smug, and the lip corner holding the paper */}
          <path d={mouth} stroke="#6b3f31" strokeWidth="3.5" strokeLinecap="round" fill={open > 0.2 ? '#6b2f2a' : 'none'} />
          {smirk > 0.05 ? <path d={`M 446 ${my - 12 * smirk} q 5 2 6 7`} stroke="#6b3f31" strokeWidth="3" strokeLinecap="round" fill="none" opacity={smirk} /> : null}
          {paper ? <ellipse cx={GOAT_MOUTH[0] - 2 + jx * 0.5} cy={GOAT_MOUTH[1] - 1 + jy * 0.3} rx="9" ry="7" fill={c.muzzle} /> : null}
        </g>
      </g>
    </svg>
  );
};
