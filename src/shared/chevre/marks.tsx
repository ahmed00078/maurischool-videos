import React, { createContext, useContext } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBeat } from '../beat';
import { SAFE } from '../fx';
import { Bi, useBi, useLang } from '../lang';
import { Sfx, Top } from '../rig';
import { APP, clamp, EASE_IN_OUT, EASE_OUT, OUTFIT, tween } from '../tokens';
import { Goat } from '../ui/goat';
import { Headline } from '../ui/Headline';
import { LogoMark } from '../ui/LogoMark';
import { EPISODES, EpisodeInfo, scoreBefore, SERIES } from './series';
import { INK } from './stage';

/**
 * The series' marks, the same in every episode: the tag that names it
 * (series, episode number, title), the football score in the corner, the
 * sports replay's band, the drama zoom, and the end card.
 */

export const GOLD = '#ffd166';
const NAVY = '#141827';

/** The episode on screen, for the marks that print its number, title and question. */
export type ChevreEpisode = EpisodeInfo & {
  /** The question for the comments, on the end card. */
  ask: Bi;
};

export const ChevreContext = createContext<ChevreEpisode | null>(null);
export const useChevre = () => {
  const ep = useContext(ChevreContext);
  if (!ep) throw new Error('A chevre scene needs a ChevreContext');
  return ep;
};

/** Episode n's info with its question. */
export const chevreEpisode = (n: number, ask: Bi): ChevreEpisode => ({ ...EPISODES[n], ask });

/** Where the text band starts under the score bug: the bug owns the band's first line. */
export const TOP_UNDER_BUG = SAFE.top + 104;

// ── the tag ──

/**
 * What this is, at a glance and on a profile grid: the series' name, then the
 * yellow « ÉP. 2 » and the episode's title. On the hook from frame 0, so on
 * the cover. Put it first in a <Top>.
 */
export const SeriesTag: React.FC<{ at?: number; out?: number }> = ({ at = -30, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bi = useBi();
  const { font, dir, rtl } = useLang();
  const ep = useChevre();
  const p = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 180 } });
  const q = spring({ frame: frame - at - 4, fps, config: { damping: 11, stiffness: 200 } });
  const leave = out === undefined ? 0 : tween(frame, [out, out + 8], [0, 1], EASE_IN_OUT);
  return (
    <div dir={dir} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: rtl ? 8 : 14, opacity: 1 - leave, scale: String(1 - 0.1 * leave) }}>
      <div
        style={{
          padding: rtl ? '4px 24px 8px' : '6px 24px',
          borderRadius: 999,
          background: 'rgba(42,29,26,0.86)',
          color: '#fff4dc',
          fontFamily: font,
          fontWeight: 800,
          fontSize: rtl ? 28 : 30,
          letterSpacing: rtl ? 0 : 2,
          textTransform: 'uppercase',
          opacity: Math.min(1, p * 1.5),
          scale: String(0.85 + 0.15 * p),
        }}
      >
        {bi(SERIES.name)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: Math.min(1, q * 1.5), scale: String(0.7 + 0.3 * q) }}>
        <div
          style={{
            padding: rtl ? '2px 22px 8px' : '4px 22px',
            borderRadius: 14,
            background: GOLD,
            color: NAVY,
            fontFamily: font,
            fontWeight: 800,
            fontSize: rtl ? 42 : 48,
            lineHeight: rtl ? 1.3 : 1.15,
            letterSpacing: rtl ? 0 : 1,
            textTransform: 'uppercase',
            boxShadow: '0 8px 18px rgba(60,35,10,0.3)',
            rotate: rtl ? '3deg' : '-3deg',
          }}
        >
          {bi(SERIES.label(ep.number))}
        </div>
        <div style={{ fontFamily: font, fontWeight: 800, fontSize: rtl ? 56 : 68, lineHeight: rtl ? 1.25 : 1.05, letterSpacing: rtl ? 0 : -1, color: INK.color, ...INK.style }}>
          {bi(ep.title)}
        </div>
      </div>
    </div>
  );
};

// ── the score ──

/** The goat's head, cropped round from her drawing: the score's team crest. */
export const GoatCrest: React.FC<{ size: number }> = ({ size }) => {
  const w = size * 3.5;
  const k = w / 600;
  return (
    <div style={{ position: 'relative', width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: '#fff4dc', flexShrink: 0 }}>
      <div style={{ position: 'absolute', left: size / 2 - 425 * k, top: size * 0.58 - 140 * k }}>
        <Goat width={w} shadow={false} state={{ lids: 0.35 }} />
      </div>
    </div>
  );
};

/** MauriSchool's mark in a white disc: the other crest. */
export const AppCrest: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <LogoMark width={size * 0.74} violet={APP.logo.violet} ink={APP.logo.ink} />
  </div>
);

/** One digit of the score, rolling from `from` to `to` over `t` (0 → 1). */
const Digit: React.FC<{ from: number; to: number; t: number; size: number; flash: number }> = ({ from, to, t, size, flash }) => (
  <div style={{ position: 'relative', height: size * 1.12, width: size * 0.66, overflow: 'hidden', fontFamily: OUTFIT, fontWeight: 800, fontSize: size, lineHeight: 1.12, textAlign: 'center' }}>
    <div style={{ position: 'absolute', inset: 0, translate: `0 ${from === to ? 0 : -t * 100}%`, color: '#fff' }}>{from}</div>
    {from !== to ? <div style={{ position: 'absolute', inset: 0, translate: `0 ${(1 - t) * 100}%`, color: flash > 0 ? GOLD : '#fff' }}>{to}</div> : null}
  </div>
);

/**
 * The football score, like a TV broadcast's (but nobody's look): the goat's
 * crest and score, MauriSchool's score and crest, in a dark pill in the top
 * corner of the safe band (the reading start: left in French, right in
 * Arabic). At `goal` (a frame, or undefined) a whistle blows: the bug comes to
 * the middle (`middle`, clear of what the scene shows) at full size with the names under the crests, MauriSchool's
 * number rolls up, it holds two seconds, and goes back to its corner.
 */
export const ScoreBug: React.FC<{ before: [number, number]; after: [number, number]; goal?: number; middle?: [number, number] }> = ({
  before,
  after,
  goal,
  middle: [mx, my] = [540, 640],
}) => {
  const frame = useCurrentFrame();
  const bi = useBi();
  const { dir, rtl, font } = useLang();
  // No goal (a cover, a still): far past any frame, finite for the tweens.
  const g = goal ?? 1e6;
  // In by 12, the number rolls at 14–22, full size and still until 76 (two seconds after the roll), back in its corner by 86.
  const big = tween(frame, [g + 2, g + 12], [0, 1], EASE_IN_OUT) * (1 - tween(frame, [g + 76, g + 86], [0, 1], EASE_IN_OUT));
  const roll = tween(frame, [g + 14, g + 22], [0, 1], EASE_OUT);
  const flash = frame >= g + 14 && frame < g + 76 ? 1 : 0;
  const pop = frame >= g + 14 ? Math.max(0, 1 - (frame - g - 14) / 10) : 0;
  const size = 44;
  // The corner, and the middle of the frame above the people.
  const corner = { x: rtl ? 1080 - SAFE.side - 170 : SAFE.side + 170, y: SAFE.top + 50 };
  const middle = { x: mx, y: my };
  const x = corner.x + (middle.x - corner.x) * big;
  const y = corner.y + (middle.y - corner.y) * big;
  const scale = 1 + 1.25 * big + 0.12 * pop;
  const crest = 56;
  const label = (text: string) => (
    <div style={{ position: 'absolute', top: crest + 8, left: '50%', translate: '-50% 0', whiteSpace: 'nowrap', fontFamily: font, fontWeight: 800, fontSize: rtl ? 21 : 19, color: '#fff', opacity: big, letterSpacing: rtl ? 0 : 0.5 }}>
      {text}
    </div>
  );
  return (
    <div style={{ position: 'absolute', left: x, top: y, translate: '-50% -50%', scale: String(scale), zIndex: 60, pointerEvents: 'none' }}>
      <div
        dir={dir}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: `8px ${12 + 8 * big}px ${8 + 30 * big}px`,
          borderRadius: 999 * (1 - big) + 28 * big,
          background: 'rgba(20,24,39,0.92)',
          boxShadow: `0 8px 22px rgba(0,0,0,0.3), inset 0 0 0 3px ${big > 0.5 ? GOLD : 'rgba(255,255,255,0.12)'}`,
        }}
      >
        <div style={{ position: 'relative' }}>
          <GoatCrest size={crest} />
          {label(bi(SERIES.goat))}
        </div>
        <Digit from={before[0]} to={after[0]} t={roll} size={size} flash={flash} />
        <div style={{ fontFamily: OUTFIT, fontWeight: 800, fontSize: size * 0.8, color: 'rgba(255,255,255,0.6)' }}>–</div>
        <Digit from={before[1]} to={after[1]} t={roll} size={size} flash={flash} />
        <div style={{ position: 'relative' }}>
          <AppCrest size={crest} />
          {label('MauriSchool')}
        </div>
      </div>
    </div>
  );
};

/** The whistle and the crowd's cheer for a score change at frame `goal`. */
export const GoalSound: React.FC<{ goal: number }> = ({ goal }) => (
  <>
    <Sfx at={goal} name="whistle" volume={0.6} />
    <Sfx at={goal + 14} name="ding" volume={0.5} rate={1.2} />
  </>
);

/** The score for episode `n`, from the one before to its own. */
export const scoreFor = (n: number) => ({ before: scoreBefore(n), after: EPISODES[n].score });

// ── the replay ──

/**
 * The sports replay's band in the reading-end corner, opposite the score:
 * a red dot and « RALENTI », blinking like a broadcast's. `t` 0 → 1 slides it in.
 */
export const ReplayBand: React.FC<{ at: number; out?: number }> = ({ at, out }) => {
  const frame = useCurrentFrame();
  const bi = useBi();
  const { rtl, font, dir } = useLang();
  const p = tween(frame, [at, at + 6]) * (out === undefined ? 1 : 1 - tween(frame, [out - 4, out]));
  const dot = Math.floor(frame / 12) % 2 === 0 ? 1 : 0.25;
  return (
    <div
      dir={dir}
      style={{
        position: 'absolute',
        top: SAFE.top + 18,
        ...(rtl ? { left: SAFE.side } : { right: SAFE.right - 40 }),
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: rtl ? '6px 22px 12px' : '10px 22px',
        borderRadius: 12,
        background: '#d6232b',
        color: '#fff',
        fontFamily: font,
        fontWeight: 800,
        fontSize: rtl ? 38 : 34,
        letterSpacing: rtl ? 0 : 3,
        textTransform: 'uppercase',
        boxShadow: '0 8px 18px rgba(0,0,0,0.3)',
        opacity: p,
        translate: `${(1 - p) * (rtl ? -40 : 40)}px 0`,
        zIndex: 55,
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', opacity: dot }} />
      {bi(SERIES.replay)}
    </div>
  );
};

/** The TV replay's look over the picture: a white flash in and out, a cooler, flatter image. */
export const ReplayLook: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  const on = frame >= from && frame < to;
  const flash = Math.max(0, 1 - Math.abs(frame - from) / 4) + Math.max(0, 1 - Math.abs(frame - to) / 4);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, filter: on ? 'saturate(0.8) contrast(1.05) brightness(1.03)' : undefined }}>{children}</div>
      {flash > 0 ? <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: Math.min(1, flash) * 0.9 }} /> : null}
    </div>
  );
};

// ── the drama zoom ──

/**
 * « Dun, dun, DUN »: three hard steps in on a face, one per hit, then still.
 * Returns the zoom at `frame` for hits at the given frames.
 */
export const dramaZoom = (frame: number, hits: [number, number, number], levels: [number, number, number, number] = [1, 1.35, 1.8, 2.6]) => {
  let z = levels[0];
  hits.forEach((h, i) => {
    z += (levels[i + 1] - levels[i]) * interpolate(frame, [h, h + 3], [0, 1], { ...clamp, easing: EASE_OUT });
  });
  return z;
};

/** The three hits' sound: two low and one lower and longer. */
export const DramaSound: React.FC<{ hits: [number, number, number] }> = ({ hits }) => (
  <>
    <Sfx at={hits[0]} name="dun" volume={0.6} />
    <Sfx at={hits[1]} name="dun" volume={0.65} rate={0.94} />
    <Sfx at={hits[2]} name="dun" volume={0.75} rate={0.79} />
  </>
);

// ── the end card ──

/**
 * The end card, over her face: the series' end line, the logo card with the
 * series, the episode and the hashtag, then the question for the comments.
 * Times are beats of the scene.
 */
export const EndCard: React.FC<{ line?: number; card?: number; ask?: number }> = ({ line = 0.3, card = 1.4, ask = 2.6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl, dir, font } = useLang();
  const ep = useChevre();
  const c = spring({ frame: frame - b(card), fps, config: { damping: 14, stiffness: 150 } });
  return (
    <>
      <Top gap={26} style={{ top: TOP_UNDER_BUG }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: rtl ? 0 : 6 }}>
          <Headline text={bi(SERIES.end[0])} at={b(line)} size={rtl ? 70 : 66} {...INK} />
          <Headline text={bi(SERIES.end[1])} at={b(line) + 8} size={rtl ? 84 : 84} {...INK} />
        </div>
        <div
          dir={dir}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '22px 40px 24px',
            borderRadius: 40,
            background: 'rgba(255,255,255,0.96)',
            boxShadow: '0 18px 44px rgba(60,35,10,0.28)',
            opacity: Math.min(1, c * 1.4),
            scale: String(0.8 + 0.2 * c),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, direction: 'ltr' }}>
            <LogoMark width={86} violet={APP.logo.violet} ink={APP.logo.ink} />
            <span style={{ fontFamily: OUTFIT, fontWeight: 700, fontSize: 76, letterSpacing: -1.2, lineHeight: 1.1, color: APP.logo.violet }}>
              Mauri<span style={{ color: APP.logo.ink }}>School</span>
            </span>
          </div>
          <div style={{ fontFamily: font, fontWeight: 700, fontSize: rtl ? 32 : 30, color: '#4a3a33', lineHeight: rtl ? 1.4 : 1.2 }}>
            {bi(SERIES.name)} · {bi(SERIES.label(ep.number))} · {bi(ep.title)}
          </div>
          <div style={{ fontFamily: font, fontWeight: 800, fontSize: rtl ? 34 : 32, color: APP.brand[600] }}>{bi(SERIES.hashtag)}</div>
        </div>
        <Headline text={bi(ep.ask)} at={b(ask)} size={rtl ? 62 : 60} {...INK} />
      </Top>
      <Sfx at={b(line)} name="pop" volume={0.4} />
      <Sfx at={b(card)} name="ding" volume={0.45} />
      <Sfx at={b(ask)} name="pop" volume={0.35} rate={1.2} />
    </>
  );
};

// ── the loupe ──

/**
 * A round magnifier over a proof, for a value too small to read at the
 * camera's distance (a grade in a notification's sentence): the same picture
 * again, `zoom` times closer on the canvas point `focus`, in a gold-rimmed
 * pill `size` px wide and high at `center` (screen px; a circle when square),
 * low enough to show one line of text, with a short tail pointing back at `from`
 * (where the value sits on screen). It pops in at `at` and stays.
 * `children` is the picture without a camera, as the scene draws it.
 */
export const Loupe: React.FC<{
  at: number;
  focus: [number, number];
  zoom: number;
  center: [number, number];
  size: [number, number];
  from: [number, number];
  children: React.ReactNode;
}> = ({ at, focus, zoom, center, size: [w, h], from, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 170 } });
  if (frame < at) return null;
  const [cx, cy] = center;
  const tx = cx - zoom * focus[0];
  const ty = cy - zoom * focus[1];
  // The tail: from the pill's edge toward the value, a little short of it.
  const ang = Math.atan2(from[1] - cy, from[0] - cx);
  const reach = Math.min(Math.abs(w / 2 / (Math.cos(ang) || 1e-6)), Math.abs(h / 2 / (Math.sin(ang) || 1e-6))) - 4;
  const rim: [number, number] = [cx + Math.cos(ang) * reach, cy + Math.sin(ang) * reach];
  const tip: [number, number] = [from[0] - Math.cos(ang) * 26, from[1] - Math.sin(ang) * 26];
  const side = 34;
  const nx = -Math.sin(ang) * side;
  const ny = Math.cos(ang) * side;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none', transformOrigin: `${cx}px ${cy}px`, scale: String(0.3 + 0.7 * p), opacity: Math.min(1, p * 1.6) }}>
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={`M ${rim[0] + nx} ${rim[1] + ny} L ${tip[0]} ${tip[1]} L ${rim[0] - nx} ${rim[1] - ny} Z`} fill={GOLD} stroke="#c98f12" strokeWidth="4" strokeLinejoin="round" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: cx - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          borderRadius: h / 2,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: `0 0 0 14px ${GOLD}, 0 0 0 18px #c98f12, 0 24px 50px rgba(0,0,0,0.35)`,
        }}
      >
        <div style={{ position: 'absolute', left: -(cx - w / 2), top: -(cy - h / 2), width: 1080, height: 1920 }}>
          <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${zoom})` }}>{children}</div>
        </div>
      </div>
    </div>
  );
};
