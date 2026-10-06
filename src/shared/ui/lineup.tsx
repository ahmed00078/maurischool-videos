import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useLang } from '../lang';
import { EASE_IN, OUTFIT, STAGE, tween } from '../tokens';

/**
 * The police lineup of the « Qui ne dit pas la vérité ? » series: a height-chart wall, the
 * suspects holding numbered placards, the verdict stamped on each placard, the
 * speech bubble of whoever is talking, and the countdown before the answer.
 *
 * Heights are real: the wall is graduated in centimetres, 6 px per cm, and a
 * suspect stands so the top of their head meets their height on it.
 */

/** Canvas y of a height in cm on the wall. */
export const heightY = (cm: number) => 490 + (200 - cm) * 6;

/**
 * The wall: dark, graduated every 5 cm, labelled every 10, lit from above. It
 * runs well past the frame on every side, so a camera push never finds its edge.
 */
const OVER = 900;
export const LineupWall: React.FC<{ light?: number; lightX?: number }> = ({ light = 0, lightX = 540 }) => {
  const lines: React.ReactNode[] = [];
  for (let cm = 230; cm >= -40; cm -= 5) {
    const y = heightY(cm) + OVER;
    const major = cm % 10 === 0;
    lines.push(
      <div
        key={cm}
        style={{ position: 'absolute', left: 0, right: 0, top: y, height: major ? 3 : 2, background: `rgba(255,255,255,${major ? 0.16 : 0.07})` }}
      />,
    );
    if (major && cm <= 190 && cm > 0) {
      lines.push(
        <div
          key={`l${cm}`}
          style={{ position: 'absolute', left: 70 + OVER, top: y - 34, fontFamily: OUTFIT, fontWeight: 700, fontSize: 26, color: 'rgba(255,255,255,0.28)', letterSpacing: 1 }}
        >
          {cm}
        </div>,
      );
    }
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: -OVER,
        top: -OVER,
        width: 1080 + OVER * 2,
        height: 1920 + OVER * 2,
        background: `linear-gradient(180deg, #1a2150 0%, #1a2150 ${(OVER / (1920 + OVER * 2)) * 100}%, ${STAGE.night} ${((OVER + 1920) / (1920 + OVER * 2)) * 100}%)`,
        overflow: 'hidden',
      }}
    >
      {lines}
      {/* The spotlight on whoever has the floor. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: light,
          background: `radial-gradient(420px 900px at ${lightX + OVER}px ${780 + OVER}px, rgba(255,236,190,0.22) 0%, rgba(255,236,190,0.08) 45%, transparent 75%)`,
        }}
      />
    </div>
  );
};

/**
 * The hands on a placard's edges: 46 × 58, 30 % of the way down, reaching
 * 22 px past each edge (so the inner half lies on the placard's face, as fingers).
 */
export const HAND = { top: 0.3, w: 46, h: 58, out: 22 } as const;

/** Plain skin, or dyed with henna: dark fingertips and a small flower on the back of the hand. */
export type Hands = 'plain' | 'henna';

const HENNA = { dark: '#7a2e14', light: '#a0461f' };

/**
 * A henna-dyed left hand in HAND's box, fingers pointing right (onto the
 * placard); mirrored for the right hand. The four fingertips are dyed through,
 * each finger has a thin band, and the back of the hand carries a six-petal
 * flower over a line of dots, big enough to read on a close-up.
 */
const HennaHand: React.FC<{ skin: string; mirror: boolean }> = ({ skin, mirror }) => {
  const { w, h } = HAND;
  const id = `hand-${mirror ? 'r' : 'l'}`;
  const finger = h / 4;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible', scale: mirror ? '-1 1' : undefined }}>
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={w} height={h} rx={w / 2} ry={24} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width={w} height={h} fill={skin} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={34} y={i * finger + 1.4} width={16} height={finger - 2.8} rx={(finger - 2.8) / 2} fill={HENNA.dark} />
            <rect x={26.5} y={i * finger + 2.5} width={3} height={finger - 5} rx={1.5} fill={HENNA.light} />
          </g>
        ))}
        {[1, 2, 3].map((i) => (
          <line key={i} x1={24} x2={w} y1={i * finger} y2={i * finger} stroke="rgba(0,0,0,0.2)" strokeWidth={1.6} />
        ))}
        <rect x="0" y={h - 6} width={w} height={6} fill="rgba(0,0,0,0.12)" />
      </g>
      {/* The back of the hand: a flower, and dots running to the wrist. */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={11 + Math.cos(a) * 5.4} cy={21 + Math.sin(a) * 5.4} r={2.7} fill={HENNA.dark} />;
      })}
      <circle cx={11} cy={21} r={2.2} fill={HENNA.light} />
      {[33, 39.5, 46].map((y, i) => (
        <circle key={y} cx={11} cy={y} r={2.1 - i * 0.3} fill={HENNA.dark} />
      ))}
    </svg>
  );
};

/**
 * A gold rosette with two tails, the kind a school pins on for the honour
 * roll, drawn in placard coordinates: centred at `cx`, `cy`, radius `r`.
 */
const ROSETTE = { gold: '#f2b705', light: '#ffd84d', dark: '#b8860b' };
const Rosette: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => {
  const petals = 14;
  const edge: string[] = [];
  for (let i = 0; i <= petals * 2; i++) {
    const a = (i / (petals * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.84;
    edge.push(`${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr}`);
  }
  const tail = (side: number) => {
    const x0 = cx + side * r * 0.25;
    const x1 = cx + side * r * 0.75;
    const len = r * 5.2;
    const w = r * 0.62;
    return `M ${x0 - w / 2} ${cy} L ${x0 + w / 2} ${cy} L ${x1 + w / 2} ${cy + len} L ${x1} ${cy + len - w * 0.6} L ${x1 - w / 2} ${cy + len} Z`;
  };
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
      <path d={tail(-1)} fill={ROSETTE.dark} />
      <path d={tail(1)} fill={ROSETTE.gold} />
      <path d={`M ${edge.join(' L ')} Z`} fill={ROSETTE.gold} />
      <circle cx={cx} cy={cy} r={r * 0.66} fill="none" stroke={ROSETTE.dark} strokeWidth={r * 0.08} strokeDasharray={`${r * 0.12} ${r * 0.1}`} />
      <circle cx={cx} cy={cy} r={r * 0.46} fill={ROSETTE.light} />
      <path
        d={`M ${cx} ${cy - r * 0.26} L ${cx + r * 0.08} ${cy - r * 0.07} L ${cx + r * 0.27} ${cy - r * 0.07} L ${cx + r * 0.12} ${cy + r * 0.06} L ${cx + r * 0.17} ${cy + r * 0.26} L ${cx} ${cy + r * 0.14} L ${cx - r * 0.17} ${cy + r * 0.26} L ${cx - r * 0.12} ${cy + r * 0.06} L ${cx - r * 0.27} ${cy - r * 0.07} L ${cx - r * 0.08} ${cy - r * 0.07} Z`}
        fill={ROSETTE.dark}
      />
    </svg>
  );
};

/** Where the rosette sits on a placard `width` wide, `rise` 0 (peeking over the top edge) to 1 (pulled up, in full). */
export const rosetteAt = (width: number, rise: number) => ({ x: width * 0.8, y: 12 - rise * 62, r: width * 0.14 });

/** A dark slate held against the chest: the number, and the name under it. */
export const Placard: React.FC<{
  number: number;
  name: string;
  skin: string;
  width?: number;
  glow?: number;
  hands?: Hands;
  /** Hands off the placard: the arms are drawn elsewhere (see Arms). */
  free?: boolean;
  /** A rosette pinned behind the placard, `ribbon` 0 (peeking) to 1 (pulled up). */
  ribbon?: number;
}> = ({ number, name, skin, width = 214, glow = 0, hands = 'plain', free = false, ribbon }) => {
  const { font } = useLang();
  const h = width * 0.62;
  const rosette = ribbon === undefined ? null : rosetteAt(width, ribbon);
  return (
    <div style={{ position: 'relative', width, height: h }}>
      {/* Behind the slate: only what clears its edge shows. */}
      {rosette ? <Rosette cx={rosette.x} cy={rosette.y} r={rosette.r} /> : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 14,
          background: '#141827',
          border: '5px solid #e9ecf5',
          boxShadow: `0 16px 30px rgba(0,0,0,0.45)${glow > 0 ? `, 0 0 ${40 * glow}px ${10 * glow}px rgba(255,214,102,${0.7 * glow})` : ''}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <div style={{ fontFamily: OUTFIT, fontWeight: 800, fontSize: h * 0.52, lineHeight: 1 }}>{number}</div>
        <div style={{ fontFamily: font, fontWeight: 700, fontSize: h * 0.17, opacity: 0.75, marginTop: 4, letterSpacing: font === OUTFIT ? 2 : 0 }}>
          {name}
        </div>
      </div>
      {/* Hands on either side */}
      {free ? null : [-1, 1].map((side) =>
        hands === 'henna' ? (
          // Over the verdict stamp: the fingers hold the placard, the ink is on it.
          <div key={side} style={{ position: 'absolute', top: h * HAND.top, [side < 0 ? 'left' : 'right']: -HAND.out, zIndex: 11 }}>
            <HennaHand skin={skin} mirror={side > 0} />
          </div>
        ) : (
          <div
            key={side}
            style={{
              position: 'absolute',
              top: h * HAND.top,
              [side < 0 ? 'left' : 'right']: -HAND.out,
              width: HAND.w,
              height: HAND.h,
              borderRadius: 24,
              background: skin,
              boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.12)',
            }}
          />
        ),
      )}
    </div>
  );
};

/**
 * A verdict on what was said, never on the person. Beyond true and false:
 * `bravo`, gold, lands over a FAUX that hid good news, and `unverifiable`,
 * grey-blue, for a claim nobody can check (a father's grades, long ago).
 *
 * `zero` is not a verdict: an office stamp in dark red ink that counts what
 * can be shown (« PREUVE : 0 »), when the claim is true and nothing proves it.
 */
export type Verdict = 'true' | 'false' | 'bravo' | 'unverifiable' | 'zero';
const VERDICT_COLOR: Record<Verdict, string> = { true: '#22c55e', false: '#ef4444', bravo: '#e3a008', unverifiable: '#5f7a96', zero: '#a3222b' };
const VERDICT_TURN: Record<Verdict, number> = { true: -9, false: -12, bravo: 7, unverifiable: -5, zero: -7 };

/**
 * A rubber stamp slammed onto a placard at `at`: it drops from above, big,
 * lands with a squash, and stays at an angle, ink a little uneven.
 */
export const Stamp: React.FC<{ kind: Verdict; label: string; at: number; size?: number; shift?: number; dy?: number }> = ({
  kind,
  label,
  at,
  size = 64,
  shift = 0,
  dy = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { font } = useLang();
  if (frame < at) return null;
  const drop = tween(frame, [at, at + 5], [0, 1], EASE_IN);
  const settle = spring({ frame: frame - at - 5, fps, config: { damping: 9, stiffness: 260 } });
  const scale = frame < at + 5 ? 2.6 - 1.6 * drop : 1 + 0.12 * (1 - settle);
  const color = VERDICT_COLOR[kind];
  const noise = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.55'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(50% + ${shift}px)`,
        top: `calc(50% + ${dy}px)`,
        translate: '-50% -50%',
        rotate: `${VERDICT_TURN[kind]}deg`,
        scale: String(scale),
        opacity: Math.min(1, drop * 2),
        padding: `${size * 0.08}px ${size * 0.3}px`,
        border: `${size * 0.07}px solid #fff`,
        borderRadius: size * 0.18,
        boxShadow: `0 0 0 ${size * 0.06}px ${color}, 0 14px 30px rgba(0,0,0,0.5)`,
        color: '#fff',
        // White on gold needs an edge to read.
        textShadow: kind === 'bravo' ? '0 2px 0 rgba(120,70,0,0.55)' : undefined,
        background: color,
        fontFamily: font,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.1,
        letterSpacing: font === OUTFIT ? 3 : 0,
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        // Worn ink: the stamp never prints perfectly.
        maskImage: `url("data:image/svg+xml;utf8,${noise}")`,
        WebkitMaskImage: `url("data:image/svg+xml;utf8,${noise}")`,
        maskSize: '160px 160px',
        WebkitMaskSize: '160px 160px',
        zIndex: 10,
      }}
    >
      {label}
    </div>
  );
};

/**
 * A comic speech bubble in the text band, its tail pointing down at the
 * speaker's head (`tailX`, canvas px). Pops in at `at`, leaves at `out`.
 */
export const SpeechBubble: React.FC<{
  text: string;
  at: number;
  out?: number;
  tailX: number;
  top: number;
  /** The bubble's centre, clamped inside the safe band by the caller. */
  x: number;
  width: number;
  size?: number;
}> = ({ text, at, out, tailX, top, x, width, size = 58 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { dir, font, rtl } = useLang();
  const p = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 190 } });
  const leave = out === undefined ? 0 : tween(frame, [out, out + 6], [0, 1], EASE_IN);
  if (frame < at) return null;
  const tail = Math.max(-width / 2 + 60, Math.min(width / 2 - 60, tailX - x));
  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top,
        width,
        transformOrigin: `${width / 2 + tail}px 110%`,
        scale: String(p * (1 - leave * 0.3)),
        opacity: Math.min(1, p * 2) * (1 - leave),
        zIndex: 30,
      }}
    >
      <div
        dir={dir}
        style={{
          position: 'relative',
          background: '#fff',
          color: '#141827',
          borderRadius: 44,
          padding: rtl ? '26px 40px 30px' : '28px 40px',
          fontFamily: font,
          fontWeight: 800,
          fontSize: size,
          lineHeight: rtl ? 1.35 : 1.12,
          letterSpacing: rtl ? 0 : -1,
          textAlign: 'center',
          boxShadow: '0 22px 50px rgba(0,0,0,0.45)',
        }}
      >
        {text}
        <svg
          width="70"
          height="56"
          viewBox="0 0 70 56"
          style={{ position: 'absolute', left: width / 2 + tail - 35, bottom: -50 }}
        >
          <path d="M 8 0 L 62 0 L 30 54 Z" fill="#fff" />
        </svg>
      </div>
    </div>
  );
};

/** The number counting down to the answer, in a ring that empties each second. */
export const CountdownRing: React.FC<{ value: number; progress: number; size?: number; pop?: number }> = ({ value, progress, size = 170, pop = 1 }) => {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, scale: String(pop) }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(10,12,30,0.6)" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#ffd166"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * progress}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: OUTFIT,
          fontWeight: 800,
          fontSize: size * 0.55,
          color: '#fff',
        }}
      >
        {value}
      </div>
    </div>
  );
};

/** A marker circle drawn around something, stroke by stroke, from `at` over `dur` frames. */
export const MarkerCircle: React.FC<{ cx: number; cy: number; rx: number; ry: number; at: number; dur: number; color?: string }> = ({
  cx,
  cy,
  rx,
  ry,
  at,
  dur,
  color = '#ffd166',
}) => {
  const frame = useCurrentFrame();
  const p = tween(frame, [at, at + dur]);
  if (p <= 0) return null;
  // A loop that overshoots its start, as a hand does.
  const pts: string[] = [];
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI * 0.6 + (i / n) * Math.PI * 2.25;
    const wobble = 1 + 0.06 * Math.sin(i * 0.7);
    pts.push(`${cx + Math.cos(a) * rx * wobble} ${cy + Math.sin(a) * ry * (1 + (i / n) * 0.1)}`);
  }
  const d = `M ${pts.join(' L ')}`;
  const len = 2 * Math.PI * Math.max(rx, ry) * 1.3;
  return (
    <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', zIndex: 25 }} width="1080" height="1920">
      <path d={d} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </svg>
  );
};

type Pt = [number, number];

/**
 * Two arms off the placard, for a cheer or a clap: from each shoulder to a
 * hand, a sleeve bent at the elbow (pushed outward) and a round hand. Points
 * are in the suspect's own box, [screen-left arm, screen-right arm].
 */
export const Arms: React.FC<{ shoulders: [Pt, Pt]; hands: [Pt, Pt]; sleeve: string; skin: string; thickness?: number; elbow?: number }> = ({
  shoulders,
  hands,
  sleeve,
  skin,
  thickness = 40,
  elbow = 60,
}) => (
  <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', zIndex: 12 }} width={1} height={1}>
    {[0, 1].map((i) => {
      const [sx, sy] = shoulders[i];
      const [hx, hy] = hands[i];
      const out = i === 0 ? -1 : 1;
      const ex = (sx + hx) / 2 + out * elbow;
      const ey = (sy + hy) / 2 + elbow * 0.3;
      return (
        <g key={i}>
          <path d={`M ${sx} ${sy} Q ${ex} ${ey} ${hx} ${hy}`} stroke={sleeve} strokeWidth={thickness} strokeLinecap="round" fill="none" />
          <path d={`M ${sx} ${sy} Q ${ex} ${ey} ${hx} ${hy}`} stroke="rgba(0,0,0,0.12)" strokeWidth={thickness * 0.3} strokeLinecap="round" fill="none" transform={`translate(${out * thickness * 0.25} 0)`} />
          <circle cx={hx} cy={hy} r={thickness * 0.6} fill={skin} />
          <circle cx={hx} cy={hy + thickness * 0.12} r={thickness * 0.6} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={3} />
        </g>
      );
    })}
  </svg>
);
