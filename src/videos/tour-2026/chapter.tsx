import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBeat, useMarks } from '../../shared/beat';
import { Bi, useBi, useLang } from '../../shared/lang';
import { PhoneRig, Pose, Scene, Sfx, SfxName, Tap } from '../../shared/rig';
import { APP, BEAT, EASE_IN, EASE_IN_OUT, OUTFIT, pt, tween } from '../../shared/tokens';
import { Device } from '../../shared/ui/Device';
import { Headline } from '../../shared/ui/Headline';
import { IconName, Ionicon } from '../../shared/ui/Ionicon';
import { Lift, Rect, Side, useMirror, useRect, Veiled, WIDE } from '../../shared/wide';
import { COPY } from './copy';

/**
 * One chapter of the tour, the same frame ten times: on the reading side the
 * chapter's number, its headline, its steps ticking off and the benefit; on
 * the other a phone whose screen stays veiled, and between them the one
 * section each step is about, lifted out and enlarged. Over the number, the
 * act the chapter belongs to (the acts are announced by scenes/Bookends'
 * ActScene).
 *
 * A step with a new `role` brings a new phone (the accountant's, then the
 * parent's). A `doc` step clears the phone and shows a document instead.
 */

export type StepClock = {
  /** Frames since the step began (negative before it). */
  f: number;
  /** Beats to frames. */
  beats: (n: number) => number;
};

export type PhoneStep = {
  kind?: 'phone';
  /** Beat of the scene the step starts on, when there is no voice mark to follow. */
  at: number;
  role: Bi;
  icon: IconName;
  /** Whose phone it is: steps sharing a key share a phone. */
  phone: string;
  time?: string;
  /** A lock screen: the status bar is light and nothing is veiled (it is not the app). */
  lock?: boolean;
  screen: (c: StepClock) => React.ReactNode;
  /** The section kept sharp, in app points (written for French). */
  rect: Rect;
  /** The same section on the Arabic screen, where Tajawal sets some blocks taller (still written left-to-right; it is mirrored). */
  rectAr?: Rect;
  /** Where the lifted section settles (canvas, written for French) and the box it must fit. */
  card?: { x?: number; y?: number; fit?: [number, number] };
  /** Finger taps on the lifted section: beats after the step starts, a point of the screen in app points (`yAr` where the Arabic screen sets it lower). */
  taps?: { at: number; x: number; y: number; yAr?: number }[];
  sfx?: { at: number; name: SfxName; volume?: number; rate?: number }[];
};

export type DocStep = {
  kind: 'doc';
  at: number;
  role: Bi;
  icon: IconName;
  render: (c: StepClock) => React.ReactNode;
  sfx?: { at: number; name: SfxName; volume?: number; rate?: number }[];
};

export type Step = PhoneStep | DocStep;

const CARD = { x: 1085, y: 548, fit: [600, 640] as [number, number] };
const INK = APP.light.text;

/** The chapter's act, small, over its number, large, beside « / 10 ». */
const ChapterNumber: React.FC<{ n: number; act: string; at: number }> = ({ n, act, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { font, rtl } = useLang();
  const p = spring({ frame: frame - at, fps, config: { damping: 16, stiffness: 130 } });
  return (
    <div style={{ opacity: Math.min(1, p * 1.5), translate: `0px ${(1 - p) * 30}px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, fontFamily: font, fontSize: rtl ? 30 : 26, fontWeight: 700, letterSpacing: rtl ? 0 : 2.5, textTransform: 'uppercase', color: APP.brand[600] }}>
        <span style={{ width: 34, height: 5, borderRadius: 3, background: APP.brand[500] }} />
        {act}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, direction: 'ltr', justifyContent: rtl ? 'flex-end' : 'flex-start', fontFamily: OUTFIT }}>
        <span style={{ fontSize: 112, fontWeight: 800, lineHeight: 0.9, letterSpacing: -4, color: APP.brand[500] }}>{String(n).padStart(2, '0')}</span>
        <span style={{ fontSize: 34, fontWeight: 600, color: APP.brand[300] }}>/ 10</span>
      </div>
    </div>
  );
};

/** One step in the list: a dot while it plays, a green tick once the next has begun. */
const StepLine: React.FC<{ text: string; at: number; doneAt?: number }> = ({ text, at, doneAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { font } = useLang();
  const p = spring({ frame: frame - at, fps, config: { damping: 18, stiffness: 140 } });
  const done = doneAt === undefined ? 0 : spring({ frame: frame - doneAt, fps, config: { damping: 12, stiffness: 180 } });
  if (frame < at) return <div style={{ height: 52 }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, minHeight: 52, opacity: Math.min(1, p * 1.4), translate: `0px ${(1 - p) * 18}px` }}>
      <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 9, borderRadius: '50%', background: APP.brand[500], boxShadow: `0 0 0 7px ${APP.brand[100]}`, opacity: 1 - done }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: String(done), opacity: done }}>
          <Ionicon name="checkmark-circle" size={40} color={APP.success} />
        </div>
      </div>
      <span style={{ fontFamily: font, fontSize: 33, fontWeight: 600, lineHeight: 1.25, color: done > 0.5 ? APP.light.textSecondary : INK }}>{text}</span>
    </div>
  );
};

/** Whose phone it is: a pill above the phone. */
const RoleTag: React.FC<{ label: string; icon: IconName; x: number; at: number; out?: number }> = ({ label, icon, x, at, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { font, dir } = useLang();
  const p = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 150 } });
  const leave = out === undefined ? 0 : tween(frame, [out - 6, out], [0, 1], EASE_IN);
  if (frame < at) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: 30, translate: '-50% 0', zIndex: 6 }}>
      <div
        dir={dir}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 22px 8px 16px',
          borderRadius: 999,
          background: '#fff',
          border: `2px solid ${APP.brand[100]}`,
          boxShadow: '0 8px 22px rgba(20,27,77,0.10)',
          color: APP.brand[700],
          fontFamily: font,
          fontWeight: 700,
          fontSize: 27,
          whiteSpace: 'nowrap',
          opacity: Math.min(1, p * 1.4) * (1 - leave),
          scale: String(0.85 + 0.15 * p),
        }}
      >
        <Ionicon name={icon} size={28} color={APP.brand[500]} />
        {label}
      </div>
    </div>
  );
};

/** The ten chapters along the bottom, grouped by act: done, playing (filling), to come. */
export const ProgressRail: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { rtl } = useLang();
  const fill = Math.min(1, Math.max(0, frame / durationInFrames));
  return (
    <div style={{ position: 'absolute', left: 120, right: 120, bottom: 36, display: 'flex', gap: 10, direction: rtl ? 'rtl' : 'ltr', zIndex: 30 }}>
      {COPY.chapters.map((ch, i) => (
        <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, marginInlineStart: i > 0 && ch.act !== COPY.chapters[i - 1].act ? 26 : 0, background: 'rgba(31,43,111,0.12)', overflow: 'hidden' }}>
          <div style={{ width: `${(i < index ? 1 : i === index ? fill : 0) * 100}%`, height: '100%', borderRadius: 3, background: i === index ? APP.brand[500] : APP.brand[300] }} />
        </div>
      ))}
    </div>
  );
};

const fitScale = (rect: Rect, [w, h]: [number, number]) => Math.min(w / pt(rect.w), h / pt(rect.h));

/**
 * The chapter: `index` is 0 to 9. Steps start on their `at` beat, or on the
 * voice marks « s1 », « s2 »… when the scene has a recorded line; the benefit
 * lands on « benefit » (or `benefitAt`).
 */
export const Chapter: React.FC<{ index: number; steps: Step[]; benefitAt: number }> = ({ index, steps, benefitAt }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const b = useBeat();
  const m = useMarks();
  const bi = useBi();
  const { rtl, font, dir } = useLang();
  const mirror = useMirror();
  const fix = useRect();
  const copy = COPY.chapters[index];
  const starts = steps.map((s, i) => b(m(`s${i + 1}`, s.at)));
  const benefit = b(m('benefit', benefitAt));
  const beats = (n: number) => Math.round(n * BEAT);
  const phoneX = mirror(WIDE.phone.x);

  // Phones: consecutive phone steps with the same key share one.
  type Group = { key: string; from: number; to: number; first: number; steps: number[] };
  const groups: Group[] = [];
  steps.forEach((s, i) => {
    const key = s.kind === 'doc' ? `doc${i}` : s.phone;
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.steps.push(i);
      last.to = starts[i + 1] ?? durationInFrames + 60;
    } else {
      groups.push({ key, from: starts[i], to: starts[i + 1] ?? durationInFrames + 60, first: i, steps: [i] });
    }
  });

  return (
    <Scene mood="paper">
      {groups.map((g) => {
        const head = steps[g.first];
        const enter = spring({ frame: frame - g.from - 1, fps, config: { damping: 19, stiffness: 90 } });
        const leave = tween(frame, [g.to - 13, g.to - 1], [0, 1], EASE_IN);
        if (frame < g.from - 1 || leave >= 1) return null;
        // The step this phone is on.
        const current = [...g.steps].reverse().find((i) => frame >= starts[i]) ?? g.first;
        const step = steps[current];
        const clock: StepClock = { f: frame - starts[current], beats };
        if (step.kind === 'doc') {
          return (
            <React.Fragment key={g.key}>
              <div style={{ position: 'absolute', inset: 0, opacity: 1 - leave }}>{step.render(clock)}</div>
              <RoleTag label={bi(step.role)} icon={step.icon} x={mirror(1300)} at={g.from + 4} out={g.to} />
            </React.Fragment>
          );
        }
        const side = rtl ? -1 : 1;
        const float = Math.sin((frame + index * 40) / 46) * 6;
        const pose: Pose = {
          x: phoneX + side * ((1 - enter) * 520 + leave * 420),
          y: WIDE.phone.y + float,
          scale: WIDE.phone.scale,
          rx: 0,
          ry: -side * ((1 - enter) * 28 + leave * 18),
          rz: 0,
          opacity: Math.min(1, enter * 2) * (1 - leave),
        };
        const flat: Pose = { x: phoneX, y: WIDE.phone.y + float, scale: WIDE.phone.scale };
        const screen = step.screen(clock);
        const rect = (rtl && step.rectAr) || step.rect;
        // The lift: out a few frames after the step starts, back as the next one begins.
        const next = starts[current + 1] ?? g.to;
        const up = spring({ frame: frame - starts[current] - (current === g.first ? 14 : 4), fps, config: { damping: 17, stiffness: 95 } });
        const last = current === g.steps[g.steps.length - 1];
        const back = last ? tween(frame, [next - 24, next - 13], [0, 1], EASE_IN_OUT) : tween(frame, [next - 9, next - 1], [0, 1], EASE_IN_OUT);
        const t = Math.max(0, up - back);
        const card = { ...CARD, ...step.card };
        const scale = fitScale(rect, card.fit);
        const r = fix(rect);
        const cx = mirror(card.x);
        return (
          <React.Fragment key={g.key}>
            <PhoneRig pose={pose}>
              <Device time={step.time} statusTone={step.lock ? 'light' : 'dark'} glare={0.45}>
                {step.lock ? screen : <Veiled windows={[{ rect, open: 1 - Math.min(1, t * 3), ring: Math.min(1, enter) }]}>{screen}</Veiled>}
              </Device>
            </PhoneRig>
            <Lift pose={flat} rect={rect} to={{ x: card.x, y: card.y, scale }} t={t} opacity={Math.min(1, enter * 1.2) * (t > 0.02 ? 1 : 0)} drift={Math.sin((frame + 30) / 38) * 5 * t}>
              {screen}
            </Lift>
            {(step.taps ?? []).map((tap, i) => (
              <Tap key={i} at={starts[current] + beats(tap.at)} x={cx + (pt(rtl ? 390 - tap.x : tap.x) - pt(r.x + r.w / 2)) * scale} y={card.y + (pt((rtl && tap.yAr) || tap.y) - pt(r.y + r.h / 2)) * scale} size={84} />
            ))}
            <RoleTag label={bi(head.role)} icon={head.icon} x={phoneX} at={g.from + 6} out={g.to} />
          </React.Fragment>
        );
      })}
      <Side gap={22}>
        <ChapterNumber n={index + 1} act={bi(COPY.acts[copy.act]?.label ?? COPY.overview)} at={b(0)} />
        <Headline text={bi(copy.headline)} at={b(0.5)} size={70} color={INK} accent={APP.brand[600]} highlight={APP.brand[100]} align="start" style={{ marginBottom: 14 }} />
        {copy.steps.map((s, i) => (
          <StepLine key={i} text={bi(s)} at={(starts[i] ?? benefit) + 8} doneAt={starts[i + 1] ?? benefit} />
        ))}
        <div
          dir={dir}
          style={{
            marginTop: 16,
            padding: rtl ? '10px 26px 16px' : '14px 26px',
            borderRadius: 20,
            background: APP.brand[500],
            color: '#fff',
            fontFamily: font,
            fontSize: 31,
            fontWeight: 700,
            lineHeight: 1.3,
            boxShadow: '0 18px 40px rgba(70,95,255,0.30)',
            opacity: tween(frame, [benefit, benefit + 10]),
            translate: `0px ${(1 - tween(frame, [benefit, benefit + 14])) * 24}px`,
          }}
        >
          {bi(copy.benefit)}
        </div>
      </Side>
      <ProgressRail index={index} />
      {steps.flatMap((s, i) => (s.sfx ?? []).map((x, j) => <Sfx key={`${i}-${j}`} at={starts[i] + beats(x.at)} name={x.name} volume={x.volume ?? 0.6} rate={x.rate} />))}
      {groups.map((g, i) => (
        <Sfx key={g.key} at={Math.max(0, g.from - 2)} name="soft-whoosh" volume={i === 0 ? 0.45 : 0.55} />
      ))}
      <Sfx at={benefit} name="pop" volume={0.35} />
    </Scene>
  );
};
