import React from 'react';
import { loadFont as loadArefRuqaa } from '@remotion/google-fonts/ArefRuqaa';
import { loadFont as loadCaveat } from '@remotion/google-fonts/Caveat';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Grain, SafeZones, Vignette } from '../fx';
import { Lang, useLang } from '../lang';
import { clamp, EASE_IN_OUT, tween } from '../tokens';

/**
 * A classroom blackboard and chalk that writes itself on it, in the reading
 * direction of the language: Caveat for French, Aref Ruqaa for Arabic (Ruqaa
 * is the hand Arabic is written in on a school board). Nothing here is the
 * app: it is the world around it.
 */

export const CAVEAT = loadCaveat('normal', { weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const RUQAA = loadArefRuqaa('normal', { weights: ['400', '700'], subsets: ['arabic', 'latin'] }).fontFamily;
export const chalkFont = (lang: Lang) => (lang === 'ar' ? RUQAA : CAVEAT);

export const CHALK = {
  white: '#f4f2e8',
  yellow: '#f6dd79',
  pink: '#f3a6b8',
  blue: '#a7d8f5',
} as const;

const BOARD = {
  base: 'radial-gradient(120% 80% at 50% 38%, #315545 0%, #243f33 52%, #172a22 100%)',
  wood: '#6e4424',
  woodDark: '#43280f',
};

/**
 * The SVG filters the chalk is drawn through: the stroke's edge roughened, and
 * the grain of the board showing through it. Drawn once per board.
 */
const ChalkDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
    <defs>
      <filter id="chalk" x="-4%" y="-8%" width="108%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="3" result="edge" />
        <feDisplacementMap in="SourceGraphic" in2="edge" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="8" result="grain" />
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -3.4 0 0 0 2.6" result="holes" />
        <feComposite in="rough" in2="holes" operator="in" />
      </filter>
      {/* Thin strokes (underlines) break up under the full filter: a gentler one for them. */}
      <filter id="chalk-stroke" x="-4%" y="-40%" width="108%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="5" result="edge" />
        <feDisplacementMap in="SourceGraphic" in2="edge" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="2" result="grain" />
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -2.4 0 0 0 2.2" result="holes" />
        <feComposite in="rough" in2="holes" operator="in" />
      </filter>
    </defs>
  </svg>
);

/** Old chalk that was never quite wiped off: faint clouds, a few ghost strokes. */
const Smudges: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {[
      [230, 420, 380, 150, -8, 0.05],
      [820, 610, 300, 120, 12, 0.04],
      [420, 1180, 460, 170, 4, 0.045],
      [760, 1480, 360, 140, -14, 0.035],
      [300, 1650, 300, 110, 9, 0.03],
    ].map(([x, y, w, h, r, o], i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x - w / 2,
          top: y - h / 2,
          width: w,
          height: h,
          borderRadius: '50%',
          background: `rgba(255,255,255,${o})`,
          filter: 'blur(38px)',
          rotate: `${r}deg`,
        }}
      />
    ))}
    <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: 0.04, filter: 'blur(2px)' }}>
      <path d="M140 980 q180 -60 360 10 t360 -20" stroke="#fff" strokeWidth="10" fill="none" />
      <path d="M620 300 q90 40 200 -10" stroke="#fff" strokeWidth="8" fill="none" />
      <path d="M180 1400 q140 50 260 0" stroke="#fff" strokeWidth="9" fill="none" />
    </svg>
  </AbsoluteFill>
);

/** The wooden frame, and the tray at the foot with a stick of chalk in it. */
const Frame: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <AbsoluteFill
      style={{
        boxShadow: [
          `inset 0 0 0 26px ${BOARD.wood}`,
          `inset 0 0 0 30px ${BOARD.woodDark}`,
          'inset 0 0 90px 30px rgba(0,0,0,0.45)',
        ].join(', '),
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 26,
        height: 34,
        background: `linear-gradient(${BOARD.wood}, ${BOARD.woodDark})`,
        boxShadow: '0 -6px 14px rgba(0,0,0,0.35)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 700,
        bottom: 50,
        width: 96,
        height: 20,
        borderRadius: 10,
        background: `linear-gradient(${CHALK.white}, #cfccc0)`,
        rotate: '-4deg',
      }}
    />
  </AbsoluteFill>
);

/** A whole scene on the board: board, old chalk, frame, then vignette and grain. */
export const BoardScene: React.FC<{ children: React.ReactNode; safeZones?: boolean }> = ({ children, safeZones = false }) => (
  <AbsoluteFill style={{ overflow: 'hidden', background: BOARD.base }}>
    <ChalkDefs />
    <Smudges />
    <AbsoluteFill>{children}</AbsoluteFill>
    <Frame />
    <Vignette strength={0.3} />
    <Grain opacity={0.11} />
    <SafeZones show={safeZones} />
  </AbsoluteFill>
);

/**
 * One line of chalk writing itself between `at` and `at + dur`, from the start
 * of the line to its end in the reading direction, with the stick of chalk
 * riding the edge. Written lines stay; lay several out with ordinary flexbox.
 */
export const ChalkLine: React.FC<{
  text: string;
  at: number;
  dur: number;
  size: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ text, at, dur, size, color = CHALK.white, weight, style }) => {
  const frame = useCurrentFrame();
  const { lang, rtl, dir } = useLang();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  // The mask's soft edge runs a little past both ends so the line starts and ends clean.
  const edge = -6 + p * 112;
  const writing = p > 0 && p < 1;
  const bob = Math.sin(frame * 1.7) * size * 0.08;
  return (
    <div
      dir={dir}
      style={{
        position: 'relative',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {/* Padded past the advance width: script letters overhang it, and the mask would cut them. */}
      <div
        style={{
          padding: '0 0.16em',
          margin: '0 -0.16em',
          fontFamily: chalkFont(lang),
          fontSize: size,
          fontWeight: weight ?? (rtl ? 700 : 600),
          lineHeight: rtl ? 1.5 : 1.15,
          color,
          filter: 'url(#chalk)',
          textShadow: `0 0 ${size * 0.04}px ${color}88`,
          maskImage: `linear-gradient(${rtl ? 'to left' : 'to right'}, #000 ${edge - 5}%, transparent ${edge + 3}%)`,
          WebkitMaskImage: `linear-gradient(${rtl ? 'to left' : 'to right'}, #000 ${edge - 5}%, transparent ${edge + 3}%)`,
          opacity: p > 0 ? 1 : 0,
        }}
      >
        {text}
      </div>
      {writing ? (
        <div
          style={{
            position: 'absolute',
            top: `calc(62% + ${bob}px)`,
            [rtl ? 'right' : 'left']: `${Math.min(100, Math.max(0, edge))}%`,
            width: size * 0.62,
            height: size * 0.15,
            borderRadius: size * 0.08,
            background: `linear-gradient(${CHALK.white}, #cbc8bb)`,
            boxShadow: '0 6px 14px rgba(0,0,0,0.35)',
            transformOrigin: rtl ? 'right center' : 'left center',
            rotate: `${rtl ? 32 : -32}deg`,
          }}
        />
      ) : null}
    </div>
  );
};

/** A hand-drawn chalk stroke under a line, drawn in the reading direction. */
export const ChalkUnderline: React.FC<{ at: number; dur: number; width: number; color?: string; thickness?: number; style?: React.CSSProperties }> = ({
  at,
  dur,
  width,
  color = CHALK.white,
  thickness = 9,
  style,
}) => {
  const frame = useCurrentFrame();
  const { rtl } = useLang();
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const h = 40;
  const d = `M 6 ${h * 0.6} C ${width * 0.3} ${h * 0.25}, ${width * 0.6} ${h * 0.8}, ${width - 6} ${h * 0.4}`;
  const len = width * 1.08;
  return (
    <svg
      width={width}
      height={h}
      style={{
        display: 'block',
        overflow: 'visible',
        filter: 'url(#chalk-stroke)',
        transform: rtl ? 'scaleX(-1)' : undefined,
        // A dash of length zero still draws its round cap: hide the stroke until it starts.
        opacity: p > 0 ? 1 : 0,
        ...style,
      }}
    >
      <path d={d} stroke={color} strokeWidth={thickness} strokeLinecap="round" fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </svg>
  );
};

/**
 * A chalk arrow drawn in one stroke, then its head, curving from (x0, y0) to
 * (x1, y1) in canvas px: "look there". It points where the screen is, not
 * where the reading goes, so it is not mirrored in Arabic.
 */
export const ChalkArrow: React.FC<{ at: number; dur: number; from: [number, number]; to: [number, number]; bend?: number; color?: string; thickness?: number }> = ({
  at,
  dur,
  from: [x0, y0],
  to: [x1, y1],
  bend = 0.3,
  color = CHALK.white,
  thickness = 9,
}) => {
  const frame = useCurrentFrame();
  const shaft = interpolate(frame, [at, at + dur * 0.75], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const head = interpolate(frame, [at + dur * 0.75, at + dur], [0, 1], clamp);
  // The control point sits off the middle of the chord, to its left, by `bend` of its length.
  const [dx, dy] = [x1 - x0, y1 - y0];
  const [cx, cy] = [(x0 + x1) / 2 + dy * bend, (y0 + y1) / 2 - dx * bend];
  const len = Math.hypot(dx, dy) * (1 + bend * bend * 1.3);
  // The head follows the curve's direction at its end.
  const a = Math.atan2(y1 - cy, x1 - cx);
  const wing = (s: number) => [x1 - Math.cos(a + s) * 46, y1 - Math.sin(a + s) * 46];
  const [l, r] = [wing(0.5), wing(-0.5)];
  const hd = 100;
  return (
    <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, overflow: 'visible', filter: 'url(#chalk-stroke)', opacity: shaft > 0 ? 1 : 0 }}>
      <path d={`M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`} stroke={color} strokeWidth={thickness} strokeLinecap="round" fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - shaft)} />
      <path
        d={`M ${l[0]} ${l[1]} L ${x1} ${y1} L ${r[0]} ${r[1]}`}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={hd}
        strokeDashoffset={hd * (1 - head)}
        opacity={head > 0 ? 1 : 0}
      />
    </svg>
  );
};

/**
 * Erasing: whatever is inside disappears band by band just behind the eraser
 * as it zigzags down from `top` to `bottom` (canvas px), leaving a faint haze
 * of chalk dust that settles. Draw the <Eraser> above it with the same four values.
 */
export const Erasable: React.FC<{ at: number; dur: number; top: number; bottom: number; children: React.ReactNode }> = ({
  at,
  dur,
  top,
  bottom,
  children,
}) => {
  const frame = useCurrentFrame();
  const y = eraserY(frame, at, dur, top, bottom);
  // The felt is 100 px tall around its centre: what it has passed over is gone.
  const mask = frame < at ? undefined : `linear-gradient(to bottom, transparent ${y + 20}px, #000 ${y + 80}px)`;
  const haze = tween(frame, [at, at + dur * 0.6], [0, 1]) * (1 - tween(frame, [at + dur, at + dur + 36]));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ maskImage: mask, WebkitMaskImage: mask }}>{children}</AbsoluteFill>
      {haze > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 90,
            right: 90,
            top: top - 40,
            height: Math.max(0, Math.min(y, bottom) - top + 80),
            borderRadius: 120,
            background: 'rgba(255,255,255,0.07)',
            filter: 'blur(30px)',
            opacity: haze,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** Where the eraser's centre is, going down; past the bottom once it is done, so the mask clears everything. */
const eraserY = (frame: number, at: number, dur: number, top: number, bottom: number) => {
  const p = (frame - at) / dur;
  return p >= 1 ? bottom + 200 : top + Math.max(0, p) * (bottom - top);
};

/** The felt eraser sweeping the board in wide strokes while it works its way down. */
export const Eraser: React.FC<{ at: number; dur: number; top: number; bottom: number; passes?: number }> = ({
  at,
  dur,
  top,
  bottom,
  passes = 3,
}) => {
  const frame = useCurrentFrame();
  const enter = tween(frame, [at - 8, at]);
  const leave = tween(frame, [at + dur, at + dur + 10]);
  if (enter <= 0 || leave >= 1) return null;
  const p = Math.min(1, Math.max(0, (frame - at) / dur));
  const x = 540 + Math.sin(p * Math.PI * passes - Math.PI / 2) * 300;
  const y = top + p * (bottom - top);
  const tilt = Math.cos(p * Math.PI * passes - Math.PI / 2) * 10;
  // A few specks of dust shaken off the felt on each turn.
  const dust = Array.from({ length: 14 }, (_, i) => {
    const born = at + (i / 14) * dur;
    const age = frame - born;
    if (age < 0 || age > 24) return null;
    const bp = (born - at) / dur;
    const bx = 540 + Math.sin(bp * Math.PI * passes - Math.PI / 2) * 300 + ((i * 37) % 60) - 30;
    const by = top + bp * (bottom - top) + 40;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: bx,
          top: by + age * age * 0.35,
          width: 6 + (i % 3) * 3,
          height: 6 + (i % 3) * 3,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.55)',
          opacity: 1 - age / 24,
          filter: 'blur(1px)',
        }}
      />
    );
  });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 30 }}>
      {dust}
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          translate: `-50% -50%`,
          rotate: `${tilt}deg`,
          opacity: enter * (1 - leave),
          scale: String(0.9 + enter * 0.1),
          filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.45))',
        }}
      >
        <div style={{ width: 300, height: 62, borderRadius: '18px 18px 8px 8px', background: 'linear-gradient(#c68a52, #8d5a2c)' }} />
        <div
          style={{
            width: 300,
            height: 40,
            borderRadius: '4px 4px 10px 10px',
            background: 'repeating-linear-gradient(90deg, #5b5f68 0 6px, #50545c 6px 12px)',
            boxShadow: 'inset 0 -8px 12px rgba(255,255,255,0.18)',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
