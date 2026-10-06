import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBeat } from '../../../shared/beat';
import { Camera } from '../../../shared/fx';
import { CLASS_SIZE } from '../../../shared/demo';
import { useBi, useLang } from '../../../shared/lang';
import { Scene, Sfx, Top } from '../../../shared/rig';
import { clamp, EASE_IN_OUT, OUTFIT, tween } from '../../../shared/tokens';
import { DeskLamp, DeskTop, TeaGlass, WritingHand } from '../../../shared/ui/desk';
import { Headline } from '../../../shared/ui/Headline';
import { WallClock } from '../../../shared/ui/Illustrations';
import { Ionicon } from '../../../shared/ui/Ionicon';
import { COPY } from '../copy';

/**
 * Copies moved on screen: one a beat while the headlines read, then one every
 * half beat, the time-lapse of an evening, until the class is done.
 */
const MOVE_BEATS = [1, 2, 3, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];
/** Already marked when the scene opens: the moves above finish the class. */
const DONE_BEFORE = CLASS_SIZE - MOVE_BEATS.length;
/** Frames a copy takes to slide across, and the pen to mark it, at each pace. */
const SLOW = { fly: 8, mark: 6 };
const FAST = { fly: 4, mark: 3 };
const RED = '#d92d20';
/** Sheet size, and how much a pile grows per sheet. */
const SW = 250;
const SH = 320;
const LAYER = 5;
const PILE_Y = 1330;
const DESK_Y = 1165;

/** Where the pen goes on a copy, in the sheet's own 100 x 128 units: the tick, then round the grade. */
const TICK: [number, number][] = [
  [58, 60],
  [65, 67],
  [79, 51],
];
const GRADE = { cx: 78, cy: 14, rx: 13, ry: 8, rot: -8 };
/** The share of the marking spent on the tick; the rest circles the grade. */
const TICK_SHARE = 0.55;

const rotate = (x: number, y: number, cx: number, cy: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
};

/** The pen's point on the sheet after `p` (0 to 1) of the marking, in sheet units. */
const penOnSheet = (p: number): [number, number] => {
  if (p < TICK_SHARE) {
    const [a, b, c] = TICK;
    const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const d = (p / TICK_SHARE) * (l1 + l2);
    const [from, to, k] = d < l1 ? [a, b, d / l1] : [b, c, (d - l1) / l2];
    return [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
  }
  const th = ((p - TICK_SHARE) / (1 - TICK_SHARE)) * Math.PI * 2;
  return rotate(GRADE.cx + GRADE.rx * Math.cos(th), GRADE.cy + GRADE.ry * Math.sin(th), GRADE.cx, GRADE.cy, GRADE.rot);
};

/** One copy seen from above: ruled lines, a margin, and as it is marked, a red tick and a circled grade. */
const Sheet: React.FC<{ marked?: number; tilt?: number; style?: React.CSSProperties }> = ({ marked = 0, tilt = 0, style }) => {
  const tick = Math.min(1, marked / TICK_SHARE);
  const ring = Math.max(0, (marked - TICK_SHARE) / (1 - TICK_SHARE));
  return (
    <div
      style={{
        position: 'absolute',
        width: SW,
        height: SH,
        borderRadius: 6,
        background: '#fbfaf4',
        boxShadow: '0 2px 0 #dcd8c8, 0 10px 24px rgba(0,0,0,0.35)',
        rotate: `${tilt}deg`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <svg width={SW} height={SH} viewBox="0 0 100 128">
        <line x1="14" x2="14" y1="0" y2="128" stroke="#f3b3b3" strokeWidth="0.8" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1="20" x2={i % 4 === 3 ? 62 : 88} y1={22 + i * 9} y2={22 + i * 9} stroke="#bfc6d6" strokeWidth="1.6" strokeLinecap="round" />
        ))}
        <path
          d={`M${TICK.map(([x, y]) => `${x} ${y}`).join(' L')}`}
          stroke={RED}
          strokeWidth="3.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="32"
          strokeDashoffset={32 * (1 - tick)}
        />
        <ellipse
          cx={GRADE.cx}
          cy={GRADE.cy}
          rx={GRADE.rx}
          ry={GRADE.ry}
          fill="none"
          stroke={RED}
          strokeWidth="2.4"
          strokeDasharray="68"
          strokeDashoffset={68 * (1 - ring)}
          transform={`rotate(${GRADE.rot} ${GRADE.cx} ${GRADE.cy})`}
        />
      </svg>
    </div>
  );
};

const tiltOf = (i: number, seed: number) => Math.sin((i + seed) * 2.3) * 3;
const sheetTop = (i: number) => PILE_Y - SH - i * LAYER;

/** A pile of `count` sheets, bottom centred on (x, PILE_Y); `top` is how far its top sheet is marked. */
const Pile: React.FC<{ x: number; count: number; top: number; seed: number }> = ({ x, count, top, seed }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <Sheet key={i} marked={i === count - 1 ? top : 0} tilt={tiltOf(i, seed)} style={{ left: x - SW / 2, top: sheetTop(i) }} />
    ))}
  </>
);

/** The lamp's warm pool on the desk, around the piles. */
const LampGlow: React.FC<{ on: number }> = ({ on }) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      opacity: on,
      background: 'radial-gradient(62% 30% at 50% 64%, rgba(255, 196, 110, 0.3) 0%, rgba(255, 196, 110, 0) 70%)',
    }}
  />
);

/**
 * 2 · Night. They taught you to read; tonight they are still marking. At a
 * desk, under the lamp, beside a glass of atay, a hand takes the copies one
 * by one and ticks them in red while the clock runs towards midnight; the
 * pace quickens, the count reaches the whole class, and the lamp goes out.
 * Nobody sees this part of the job.
 */
export const NightScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl, font } = useLang();
  const still = b(4);
  const moves = MOVE_BEATS.map((beat, i) => {
    const pace = i < 4 ? SLOW : FAST;
    const at = b(beat);
    return { at, land: at + pace.fly, done: at + pace.fly + pace.mark, pace };
  });
  const last = moves[moves.length - 1];
  const handOut = last.done + 2;
  const lampOff = b(10);
  const on = 1 - tween(frame, [lampOff, lampOff + 2]);

  // Copies that have landed on the marked pile, the one in the air, the one under the pen.
  const landed = moves.filter((m) => frame >= m.land).length;
  const flying = moves.findIndex((m) => frame >= m.at && frame < m.land);
  const marking = moves.findIndex((m) => frame >= m.land && frame < m.done);
  const [fromX, toX] = rtl ? [760, 320] : [320, 760];
  const todo = CLASS_SIZE - DONE_BEFORE - landed - (flying >= 0 ? 1 : 0);
  const done = DONE_BEFORE + landed;
  const topMarked = marking >= 0 ? interpolate(frame, [moves[marking].land, moves[marking].done], [0, 1], clamp) : 1;
  const beat = Math.max(0, Math.floor((frame - b(0)) / 15));
  const enter = tween(frame, [0, 12]);

  let flyer: React.ReactNode = null;
  if (flying >= 0) {
    const m = moves[flying];
    const t = interpolate(frame, [m.at, m.land], [0, 1], { ...clamp, easing: EASE_IN_OUT });
    const x = fromX + (toX - fromX) * t;
    const top = PILE_Y - SH - (todo + t * (done - todo)) * LAYER - Math.sin(t * Math.PI) * 120;
    flyer = <Sheet tilt={(1 - 2 * t) * (rtl ? -8 : 8)} style={{ left: x - SW / 2, top, zIndex: 5 }} />;
  }

  // The pen: on the top copy of the marked pile, following the tick and the ring while it marks,
  // lifted back while a copy slides in, and gone once the class is done.
  const top = done - 1;
  const penAt = (p: number) => {
    const [ux, uy] = penOnSheet(p);
    const [sx, sy] = rotate(ux * (SW / 100), uy * (SH / 128), SW / 2, SH / 2, tiltOf(top, 4));
    return [toX - SW / 2 + sx, sheetTop(top) + sy] as const;
  };
  const [penX, penY] = penAt(marking >= 0 ? topMarked : 0);
  const lift = flying >= 0 ? Math.sin(Math.PI * interpolate(frame, [moves[flying].at, moves[flying].land], [0, 1], clamp)) : 0;
  const handAway = interpolate(frame, [handOut, handOut + 8], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const handIn = interpolate(frame, [b(0.2), moves[0].at], [1, 0], { ...clamp, easing: EASE_IN_OUT });
  const away = Math.max(handAway, handIn);
  const awayX = (rtl ? -1 : 1) * away * 520;

  // The clock runs through the evening as the copies go by.
  const progress = landed + (flying >= 0 ? interpolate(frame, [moves[flying].at, moves[flying].land], [0, 1], clamp) : 0);
  const minutes = 12 + progress * 3;
  const allDone = done === CLASS_SIZE;
  const bump = spring({ frame: frame - (landed > 0 ? moves[landed - 1].land : -99), fps, config: { damping: 12, stiffness: 220 } });
  const doneAt = last.land;
  const check = spring({ frame: frame - doneAt, fps, config: { damping: 11, stiffness: 160 } });

  return (
    <Scene mood="night" grid={false}>
      <Camera drift={0.08} focus={[540, 1150]}>
        <AbsoluteFill style={{ opacity: enter }}>
          <div style={{ position: 'absolute', left: 540, top: 700, translate: '-50% -50%' }}>
            <WallClock size={190} hours={23} minutes={minutes} seconds={8 + beat} />
          </div>
          <DeskTop top={DESK_Y} lit={on} />
          <LampGlow on={on} />
          <DeskLamp x={rtl ? 970 : 110} y={DESK_Y - 10} on={on} flip={rtl} />
          <TeaGlass x={540} y={PILE_Y - 12} t={frame / fps} />
          <Pile x={fromX} count={todo} top={0} seed={1} />
          <Pile x={toX} count={done} top={topMarked} seed={4} />
          {flyer}
          <div style={{ position: 'absolute', inset: 0, translate: `${awayX}px ${away * 480}px`, zIndex: 6 }}>
            <WritingHand x={penX} y={penY} lift={lift} flip={rtl} />
          </div>
          {/* The count: this many marked, out of the class. */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: PILE_Y + 30,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
              direction: 'ltr',
              color: '#ffffff',
              zIndex: 7,
            }}
          >
            <span
              style={{
                fontFamily: OUTFIT,
                fontWeight: 800,
                fontSize: 88,
                fontVariantNumeric: 'tabular-nums',
                color: allDone ? '#4ade80' : '#fbbf24',
                scale: String(1 + 0.14 * (1 - bump)),
              }}
            >
              {done}
            </span>
            <span style={{ fontFamily: OUTFIT, fontWeight: 700, fontSize: 60, opacity: 0.75 }}>/ {CLASS_SIZE}</span>
            <span style={{ fontFamily: font, fontWeight: 700, fontSize: 48, opacity: 0.75 }}>{bi(COPY.night.copies)}</span>
            {allDone ? (
              <span style={{ display: 'flex', scale: String(check), marginInlineStart: 4 }}>
                <Ionicon name="checkmark-circle" size={64} color="#4ade80" />
              </span>
            ) : null}
          </div>
        </AbsoluteFill>
      </Camera>
      {/* Lamp off: the room goes dark around the finished piles. */}
      <AbsoluteFill style={{ background: '#05060d', opacity: 0.6 * (1 - on), zIndex: 10, pointerEvents: 'none' }} />
      <Top>
        <Headline text={bi(COPY.night.taught)} at={b(0.2)} out={still - 8} size={rtl ? 84 : 92} accent="#fbbf24" />
      </Top>
      <Top>
        <Headline text={bi(COPY.night.still)} at={still} size={rtl ? 80 : 88} accent="#fbbf24" />
      </Top>
      {Array.from({ length: 11 }, (_, i) => (
        <Sfx key={`t${i}`} at={b(i)} name="tick" volume={0.35} />
      ))}
      {moves.map((m, i) => (
        <React.Fragment key={m.at}>
          <Sfx at={m.at} name="soft-whoosh" volume={0.16} rate={1.5 + (i % 3) * 0.1} />
          {/* The red pen: a short scratch as the tick and the ring are drawn. */}
          <Sfx at={m.land} name="chalk" length={m.pace.mark + 1} volume={0.3} rate={1.7} />
        </React.Fragment>
      ))}
      <Sfx at={doneAt} name="ding" volume={0.35} rate={1.25} />
      <Sfx at={lampOff} name="switch" volume={0.8} />
    </Scene>
  );
};
