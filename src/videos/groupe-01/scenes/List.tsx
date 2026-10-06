import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fill } from '../../../shared/appCopy';
import { useBeat } from '../../../shared/beat';
import { useBi, useLang } from '../../../shared/lang';
import { PhoneRig, Pose, screenToCanvas, Sfx, Top } from '../../../shared/rig';
import { APP, EASE_IN_OUT, OUTFIT, pt, SCREEN_W, tween } from '../../../shared/tokens';
import { ChatList, chatRowCenter } from '../../../shared/ui/chat';
import { Device } from '../../../shared/ui/Device';
import { Headline } from '../../../shared/ui/Headline';
import { LogoMark } from '../../../shared/ui/LogoMark';
import { LivingRoom, RoomShade } from '../../../shared/ui/places';
import { chatList, listPreview } from '../chat';
import { COPY } from '../copy';

/** Words over the dark room: white, the brand's light blue for the accent, a dark halo. */
export const INK_NIGHT = {
  color: '#ffffff',
  accent: APP.brand[300],
  style: { textShadow: '0 0 22px rgba(10,12,40,0.9), 0 0 8px rgba(10,12,40,0.8)' },
} as const;

/** Words over a lit room or the paper: dark ink, the brand's blue, a light halo. */
export const INK_DAY = {
  color: '#1d1a2a',
  accent: APP.brand[600],
  style: { textShadow: '0 0 18px rgba(255,250,240,0.95), 0 0 6px rgba(255,250,240,0.9)' },
} as const;

/** The badge counts from here to 312 in the hook; the outro climbs back up to just under it. */
export const HOOK_FROM = 289;
export const UNREAD = 312;

/**
 * The frames (from the scene's start) the badge ticks on, `n` ticks over
 * `span` frames, closer and closer together: a group waking up.
 */
export const tickFrames = (n: number, start: number, span: number) => Array.from({ length: n }, (_, k) => Math.round(start + span * ((k + 1) / n) ** 0.62));

/** The count at `frame` for a list of tick frames. */
const countAt = (frame: number, from: number, ticks: number[]) => from + ticks.filter((t) => t <= frame).length;

/** How much the badge swells: a quick pop on each tick. */
const pulseAt = (frame: number, ticks: number[]) => {
  const last = ticks.filter((t) => t <= frame).pop();
  return last === undefined ? 0 : Math.max(0, 1 - (frame - last) / 5);
};

/** The phone, close: the list fills the frame, the group's row in the middle, clear of the words and the buttons. */
const listPose = (rtl: boolean): Pose => ({ x: rtl ? 580 : 500, y: 1657, scale: 1.6 });

/** The room behind the phone, at night, out of focus, lit a little by the screen. */
export const NightBehind: React.FC = () => (
  <AbsoluteFill style={{ filter: 'blur(18px)', scale: '1.12' }}>
    <LivingRoom light="night" />
    <RoomShade light="night" glows={[{ x: 540, y: 1300, r: 700, color: 'rgba(150,190,255,0.9)', amount: 0.35 }]} />
  </AbsoluteFill>
);

/** The list on Papa's phone with the group's badge at `count`. */
const ListShot: React.FC<{ count: number; pulse: number; emphasis: number; sway?: number; push?: number; drop?: number; dim?: number }> = ({
  count,
  pulse,
  emphasis,
  sway = 0,
  push = 0,
  drop = 0,
  dim = 0,
}) => {
  const { lang, rtl } = useLang();
  const items = chatList(lang, count, listPreview(lang, count));
  // The camera leans in on the badge: the list's row, its end.
  const [bx, by] = screenToCanvas(listPose(rtl), rtl ? pt(27) : SCREEN_W - pt(27), pt(chatRowCenter(0)));
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#1a1830' }}>
      <NightBehind />
      <AbsoluteFill style={{ perspective: 2600, transformOrigin: `${bx}px ${by}px`, scale: String(1 + 0.32 * push) }}>
        <PhoneRig pose={{ ...listPose(rtl), y: listPose(rtl).y! + drop, rz: sway }}>
          <Device statusTone="light" time="21:47" glare={0.35}>
            <ChatList items={items} emphasis={[emphasis]} pulse={[pulse]} />
          </Device>
        </PhoneRig>
      </AbsoluteFill>
      {dim > 0 ? <AbsoluteFill style={{ background: '#0c0c22', opacity: dim }} /> : null}
      {/* A shadow under the words, so they read over the bright phone edge. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 700, background: 'linear-gradient(180deg, rgba(12,12,34,0.75) 0%, rgba(12,12,34,0.45) 60%, rgba(12,12,34,0) 100%)' }} />
    </AbsoluteFill>
  );
};

/** The hook's words: « 312 messages non lus. », the number counting with the badge. */
export const HookWords: React.FC<{ count: number; at: number }> = ({ count, at }) => {
  const bi = useBi();
  const { rtl } = useLang();
  return (
    <Top>
      <Headline text={fill(bi(COPY.hook), { count })} at={at} size={rtl ? 104 : 112} {...INK_NIGHT} />
    </Top>
  );
};

const HOOK_TICKS = tickFrames(UNREAD - HOOK_FROM, 3, 31);

/**
 * 1 · hook, three beats right after the boxes: Papa's list of conversations, close. The group's badge counts up
 * fast, a blip for every message, and stops at 312. « 312 messages non lus. »
 */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const count = countAt(frame, HOOK_FROM, HOOK_TICKS);
  return (
    <AbsoluteFill>
      <ListShot
        count={count}
        pulse={pulseAt(frame, HOOK_TICKS)}
        emphasis={tween(frame, [0, 10])}
        sway={Math.sin(frame / 20) * 0.4}
        push={tween(frame, [HOOK_TICKS[HOOK_TICKS.length - 1] + 2, b(2.8)], [0, 1], EASE_IN_OUT)}
      />
      <HookWords count={count} at={b(0.2)} />
      {HOOK_TICKS.map((t, i) => (
        <Sfx key={i} at={t} name="blip" volume={0.32 + 0.2 * (i / HOOK_TICKS.length)} rate={0.94 + ((i * 7) % 5) * 0.03} />
      ))}
    </AbsoluteFill>
  );
};

/** The cover: the list, the badge at 312, the words, big enough for a profile grid. */
export const CoverShot: React.FC = () => (
  <AbsoluteFill>
    <ListShot count={UNREAD} pulse={0} emphasis={1} push={0.7} />
    <HookWords count={UNREAD} at={-100} />
  </AbsoluteFill>
);

/**
 * 8 · outro: back on the list, the group still going. « L'école vous parle.
 * Directement. », then the question for the comments, the brand line, the
 * logo. The words leave, and the badge climbs faster and faster to 288: the
 * hook's first count comes next (it loops).
 */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const end = b(9);
  // Slow at first (the group never sleeps), then the run into the hook's rhythm.
  const slow = [8, 30, 50, 66, 84, 100].map((f) => b(0) + f);
  // The last tick settles before the end: the last frame is the hook's first, count and all.
  const run = tickFrames(14, b(7.2), end - 7 - b(7.2));
  const ticks = [...slow, ...run];
  const from = HOOK_FROM - ticks.length;
  const count = countAt(frame, from, ticks);
  const leave = b(7.1);
  const logo = spring({ frame: frame - b(4.4), fps, config: { damping: 14, stiffness: 150 } });
  const logoOut = tween(frame, [leave + 2, leave + 12]);
  // While the words are up, the phone steps down and back, out of their way; it is back in the hook's place for the loop.
  const card = tween(frame, [b(0.1), b(0.9)], [0, 1], EASE_IN_OUT) * (1 - tween(frame, [b(7.1), b(7.9)], [0, 1], EASE_IN_OUT));
  return (
    <AbsoluteFill>
      <ListShot
        count={count}
        pulse={pulseAt(frame, ticks)}
        emphasis={1 - tween(frame, [end - 12, end - 1])}
        sway={Math.sin((frame - end) / 20) * 0.4}
        drop={240 * card}
        dim={0.4 * card}
      />
      <Top gap={18}>
        {frame < b(3.3) + 12 ? <Headline text={bi(COPY.end)} at={b(0.3)} out={b(3.3)} size={rtl ? 84 : 88} {...INK_NIGHT} /> : null}
        {frame >= b(3.4) ? (
          <>
            <Headline text={bi(COPY.ask)} at={b(3.5)} out={leave} size={rtl ? 64 : 72} {...INK_NIGHT} />
            <Headline text={bi(COPY.brand)} at={b(4.1)} out={leave + 2} size={rtl ? 38 : 42} {...INK_NIGHT} color="#e6e8ff" />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                direction: 'ltr',
                marginTop: 4,
                padding: '10px 26px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.94)',
                opacity: Math.min(1, logo * 1.4) * (1 - logoOut),
                scale: String(0.8 + 0.2 * logo),
              }}
            >
              <LogoMark width={60} violet={APP.logo.violet} ink={APP.logo.ink} />
              <span style={{ fontFamily: OUTFIT, fontWeight: 700, fontSize: 54, letterSpacing: -0.8, color: APP.logo.violet }}>
                Mauri<span style={{ color: APP.logo.ink }}>School</span>
              </span>
            </div>
          </>
        ) : null}
      </Top>
      {ticks.map((t, i) => (
        <Sfx key={i} at={t} name="blip" volume={i < slow.length ? 0.22 : 0.26 + 0.1 * ((i - slow.length) / run.length)} rate={0.94 + ((i * 7) % 5) * 0.03} />
      ))}
      <Sfx at={b(0.3)} name="soft-whoosh" volume={0.3} />
      <Sfx at={b(4.4)} name="ding" volume={0.45} />
    </AbsoluteFill>
  );
};
