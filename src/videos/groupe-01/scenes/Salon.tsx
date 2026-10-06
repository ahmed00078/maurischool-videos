import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Freeze, interpolate, useCurrentFrame } from 'remotion';
import { LeadContext, StoryClock, useBeat } from '../../../shared/beat';
import { SAFE, Vhs } from '../../../shared/fx';
import { useBi, useLang } from '../../../shared/lang';
import { PhoneRig, Pose, Sfx, Top } from '../../../shared/rig';
import { SoundContext } from '../../../shared/sound';
import { BEAT, clamp, EASE_IN, EASE_IN_OUT, tween } from '../../../shared/tokens';
import { ChatThread, scrollEnd, scrollTo, threadLayout } from '../../../shared/ui/chat';
import { Device } from '../../../shared/ui/Device';
import { Headline, PlaceTag } from '../../../shared/ui/Headline';
import { SpeechBubble } from '../../../shared/ui/lineup';
import { LivingRoom, RoomShade } from '../../../shared/ui/places';
import { floodThread, GROUP_AVATAR, thursdayThread } from '../chat';
import { COPY, GROUP } from '../copy';
import { CALENDAR_CENTER, PAPA_FACE, PapaState, Salon, SIDI_FACE, SidiState } from '../stage';
import { INK_DAY, INK_NIGHT } from './List';

/** Whether this cut carries the optional gag (a parent asking about Thursday's test). */
export const GagContext = createContext(false);

/** The phone seen over Papa's shoulder, big: the thread readable, a paused frame legible. */
const POV: Pose = { x: 540, y: 1390, scale: 1.15 };

/** The group's thread on Papa's phone, as he sees it. */
const ThreadPhone: React.FC<{ thread: ReturnType<typeof floodThread>; scroll: number; scrolling: number; blur?: number; highlight?: number; time: string; zoom?: { amount: number; y: number } }> = ({
  thread,
  scroll,
  scrolling,
  blur = 0,
  highlight = 0,
  time,
  zoom,
}) => {
  const bi = useBi();
  const z = zoom ? 1 + 0.55 * zoom.amount : 1;
  return (
    <AbsoluteFill style={{ perspective: 2600, transformOrigin: `540px ${zoom?.y ?? 1200}px`, scale: String(z) }}>
      <PhoneRig pose={POV}>
        <Device statusTone="light" time={time} glare={0.3}>
          <ChatThread
            name={bi(GROUP.name)}
            subtitle={bi(GROUP.members)}
            avatar={GROUP_AVATAR}
            messages={thread.messages}
            scroll={scroll}
            scrolling={scrolling}
            blur={blur}
            highlight={highlight > 0 ? { index: thread.director, amount: highlight } : undefined}
          />
        </Device>
      </PhoneRig>
    </AbsoluteFill>
  );
};

/** Flood beats: the tag, the words, the phone, the director's message going by, back to Papa, the yawn. */
const F = { tag: [0.1, 1.6], words: 0.5, pov: [1.8, 7.4], director: 5.4, glaze: 7.5, yawn: [7.8, 9.4], down: [8.6, 9.7], out: 9.3 } as const;

/**
 * 2 · flood: Tuesday night, Papa on the mattress, his face lit by the phone.
 * The thread goes by faster and faster: flowers, voice notes, « Amine », the
 * lost jumper, a chain; for six frames, the director's message; pictures,
 * stickers, more « Amine ». His eyes glaze, he yawns, the phone goes down.
 */
export const FloodScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { lang, rtl } = useLang();
  const thread = floodThread(lang);
  const layout = threadLayout(thread.messages);
  // The scroll accelerates as a cube: the director's message is centred on its beat.
  const [p0, p1] = [b(F.pov[0]), b(F.pov[1])];
  const ud = (b(F.director) - p0) / (p1 - p0);
  const sd = scrollTo(layout, thread.director, 0.36);
  const s1 = Math.min(scrollEnd(layout), sd / ud ** 3);
  const u = interpolate(frame, [p0, p1], [0, 1], clamp);
  const scroll = s1 * u ** 3;
  const speed = (s1 * 3 * u * u) / (p1 - p0);
  // A flick is a blur, except while the director's message is in view: a paused frame reads it.
  const near = Math.max(0, Math.min(1, (Math.abs(scroll - sd) - 280) / 320));
  const blur = Math.min(26, speed * 0.16) * near;
  const pov = frame >= p0 && frame < p1;

  const up = 1 - tween(frame, [b(F.down[0]), b(F.down[1])], [0, 1], EASE_IN_OUT);
  const yawn = frame >= b(F.yawn[0]) && frame < b(F.yawn[1]);
  const yawnOpen = yawn ? Math.sin(Math.PI * tween(frame, [b(F.yawn[0]), b(F.yawn[1])], [0, 1], (x) => x)) : 0;
  const glazed = frame >= b(F.glaze);
  const papa: PapaState = {
    face: yawn
      ? { mouth: 'yawn', open: yawnOpen, blink: 0.35 + 0.65 * yawnOpen, brows: 0.2 + 0.8 * yawnOpen, look: [0, 0.6] }
      : glazed
        ? { mouth: 'flat', blink: 0.55, brows: -0.1, look: [0.1, 1] }
        : { mouth: 'flat', brows: 0.2, look: [0, 1] },
    tilt: yawn ? -7 * yawnOpen : 0,
    phone: { up, glow: 1, bob: frame < p0 ? Math.abs(Math.sin(frame / 6)) * -6 : 0 },
  };
  const flicks: number[] = [];
  for (let f = p0 + 4, gap = 12; f < p1 - 2; f += gap, gap = Math.max(4, gap * 0.86)) flicks.push(Math.round(f));

  return (
    <AbsoluteFill style={{ background: '#1a1830' }}>
      {pov ? (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <AbsoluteFill style={{ filter: 'blur(18px)', scale: '1.12' }}>
            <LivingRoom light="night" />
            <RoomShade light="night" glows={[{ x: 540, y: 1300, r: 700, color: 'rgba(150,190,255,0.9)', amount: 0.35 }]} />
          </AbsoluteFill>
          <ThreadPhone thread={thread} scroll={scroll} scrolling={u > 0.02 ? 1 : 0} blur={blur} time="21:47" />
        </AbsoluteFill>
      ) : (
        <Salon
          light="night"
          papa={papa}
          flip={0}
          shots={[{ at: 0, zoom: 1.18, focus: [PAPA_FACE[0] - 40, PAPA_FACE[1] + 170], to: [540, 1160] }]}
        />
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: 'linear-gradient(180deg, rgba(12,12,34,0.7) 0%, rgba(12,12,34,0.4) 60%, rgba(12,12,34,0) 100%)' }} />
      <Top gap={20}>
        {frame < b(F.tag[1]) + 8 ? <PlaceTag text={bi(COPY.tags.tuesdayNight)} at={b(F.tag[0])} out={b(F.tag[1])} /> : null}
        <Headline text={bi(COPY.lost)} at={b(F.words)} out={b(F.out)} size={rtl ? 76 : 80} {...INK_NIGHT} />
        <Headline text={bi(COPY.lost2)} at={b(F.director) - 3} out={b(F.out) + 2} size={rtl ? 76 : 80} {...INK_NIGHT} />
      </Top>
      {flicks.map((f, i) => (
        <Sfx key={i} at={f} name="flick" volume={0.28 + 0.2 * (i / flicks.length)} rate={1 + 0.5 * (i / flicks.length)} />
      ))}
      <Sfx at={b(F.director) - 3} name="soft-whoosh" volume={0.25} />
      <Sfx at={b(F.pov[1])} name="soft-whoosh" volume={0.35} rate={0.8} />
    </AbsoluteFill>
  );
};

/** Thursday beats: the leaves torn, the pull back, Sidi, the scroll up, the message found, the freeze. */
const T = { tag: [0.1, 5.4], tear: [[0.3, 0.75], [0.8, 1.25]], pull: 1.45, bubble: [1.8, 3.55], look: 2.15, back: 3.1, pov: [3.6, 5.6], found: 4.8, freeze: 5.6, words: 5.75 } as const;

/**
 * 3 · thursday: the calendar loses two leaves, Tuesday to Thursday. Sidi in the
 * doorway, schoolbag on: « Papa… c'est la compo aujourd'hui ?! ». Papa flicks
 * the group back up to Tuesday, 18:04: there it is. Freeze on his face.
 */
export const ThursdayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { lang, rtl } = useLang();
  const gag = useContext(GagContext);
  const thread = thursdayThread(lang, gag);
  const layout = threadLayout(thread.messages);

  const flip = tween(frame, [b(T.tear[0][0]), b(T.tear[0][1])], [0, 1], EASE_IN) + tween(frame, [b(T.tear[1][0]), b(T.tear[1][1])], [0, 1], EASE_IN);
  const [q0, q1] = [b(T.pov[0]), b(T.pov[1])];
  const end = scrollEnd(layout);
  const target = scrollTo(layout, thread.director, 0.42);
  const scroll = interpolate(frame, [q0 + 3, b(T.found)], [end, target], { ...clamp, easing: EASE_IN_OUT });
  const scrollSpeed = Math.abs(end - target) / (b(T.found) - q0);
  const moving = frame > q0 + 3 && frame < b(T.found);
  const mid = interpolate(frame, [q0 + 3, b(T.found)], [0, 1], clamp);
  const blur = moving ? Math.min(22, scrollSpeed * 0.2) * Math.sin(Math.PI * mid) : 0;
  const lit = frame >= b(T.found) ? 1 - tween(frame, [b(T.found) + 6, q1], [0, 0.4]) : 0;
  const pov = frame >= q0 && frame < q1;
  const frozen = frame >= b(T.freeze);

  const surprised = frame >= b(T.look) && frame < b(T.back);
  const papa: PapaState = frozen
    ? { face: { mouth: 'yawn', open: 0.5, brows: 1, worry: 1, sweat: 1, look: [0, -0.1] }, tilt: 3, phone: { up: 1, glow: 0.15 } }
    : {
        face: surprised ? { mouth: 'o', brows: 1, worry: 0.3, look: [-1, -0.1] } : frame >= b(T.back) ? { mouth: 'wobble', brows: 0.8, worry: 0.8, look: [0, 1] } : { mouth: 'smile', brows: 0.2, look: [0, 1] },
        tilt: surprised ? -4 : 0,
        phone: { up: 1, glow: 0.15 },
      };
  const talking = frame >= b(T.bubble[0]) + 2 && frame < b(T.bubble[0]) + 24;
  const sidi: SidiState = {
    face: talking ? { mouth: 'talk', open: 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.6)), brows: 1, worry: 0.4, look: [1, -0.1] } : { mouth: 'o', brows: 1, worry: 0.5, look: [1, 0] },
    tilt: 3,
  };

  let picture: React.ReactNode;
  if (pov) {
    picture = (
      <AbsoluteFill style={{ overflow: 'hidden', background: '#e9d2b0' }}>
        <AbsoluteFill style={{ filter: 'blur(18px)', scale: '1.12' }}>
          <LivingRoom light="morning" />
        </AbsoluteFill>
        <ThreadPhone
          thread={thread}
          scroll={scroll}
          scrolling={1}
          blur={blur}
          highlight={lit}
          time="07:12"
          zoom={{ amount: tween(frame, [b(T.found) + 2, b(T.found) + 14], [0, 1], EASE_IN_OUT), y: 1200 }}
        />
      </AbsoluteFill>
    );
  } else if (frozen) {
    const hold = b(T.freeze);
    picture = (
      <AbsoluteFill style={{ filter: `saturate(${0.75}) contrast(1.08)` }}>
        <Freeze frame={hold}>
          <Salon light="morning" papa={papa} sidi={sidi} flip={2} shots={[{ at: 0, zoom: 2.25, focus: [PAPA_FACE[0], PAPA_FACE[1] + 40], to: [540, 1080] }]} />
        </Freeze>
        {/* The flash of the freeze */}
        <AbsoluteFill style={{ background: '#fff', opacity: 1 - tween(frame, [hold, hold + 6]) }} />
      </AbsoluteFill>
    );
  } else {
    picture = (
      <Salon
        light="morning"
        papa={papa}
        sidi={sidi}
        flip={flip}
        move={b(0.5)}
        shots={[
          { at: 0, zoom: 2.4, focus: CALENDAR_CENTER, to: [540, 1060] },
          { at: b(T.pull), zoom: 1.02, focus: [540, 1080], to: [540, 1120] },
        ]}
      />
    );
  }
  const bubbleW = 640;
  const bubbleX = Math.max(SAFE.side + bubbleW / 2 + 10, Math.min(1080 - SAFE.right - bubbleW / 2, SIDI_FACE[0]));
  return (
    <AbsoluteFill>
      {picture}
      <Top gap={0}>
        <PlaceTag text={bi(COPY.tags.thursdayMorning)} at={b(T.tag[0])} out={b(T.tag[1])} />
      </Top>
      <SpeechBubble text={bi(COPY.sidi)} at={b(T.bubble[0])} out={b(T.bubble[1])} tailX={SIDI_FACE[0]} x={bubbleX} top={350} width={bubbleW} size={rtl ? 56 : 54} />
      {frozen ? (
        <Top>
          <Headline text={bi(COPY.late)} at={b(T.words)} size={rtl ? 110 : 120} {...INK_DAY} />
        </Top>
      ) : null}
      <Sfx at={b(T.tear[0][0])} name="tear" volume={0.7} />
      <Sfx at={b(T.tear[1][0])} name="tear" volume={0.7} rate={1.08} />
      <Sfx at={b(T.bubble[0])} name="pop" volume={0.5} />
      <Sfx at={b(T.look)} name="whip" volume={0.35} rate={1.2} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Sfx key={i} at={q0 + 3 + i * 5} name="flick" volume={0.4} rate={0.9 + i * 0.08} />
      ))}
      <Sfx at={b(T.found)} name="ding" volume={0.45} rate={0.9} />
      <Sfx at={b(T.freeze)} name="freeze" volume={0.9} />
    </AbsoluteFill>
  );
};

/** Rewind beats: Thursday backwards, then play on Tuesday's calendar. */
const R = { back: [0, 2.1], play: 2.1, clear: 2.6, words: 2.2 } as const;

/**
 * 4 · rewind: the tape runs back through Thursday: the freeze, the thread
 * flicked back down, Sidi's question swallowed, the leaves back on the
 * calendar, Thursday to Tuesday. Play: Tuesday, 18:00. « Mardi. Avec
 * MauriSchool. »
 */
export const RewindScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const playing = frame >= b(R.play);
  const amount = playing ? 1 - tween(frame, [b(R.play), b(R.clear)]) : 1;
  const osd = playing ? (frame < b(R.clear) + 6 ? 'play' : null) : 'rew';
  const thursdayLength = 7 * BEAT;
  const f = Math.round(interpolate(frame, [0, b(R.back[1]) - 1], [thursdayLength - 1, 0], clamp));
  const picture = playing ? (
    <Salon light="dusk" papa={{ face: { mouth: 'smile', look: [0, 1] } }} flip={0} shots={[{ at: 0, zoom: 2.4, focus: CALENDAR_CENTER, to: [540, 1060] }]} />
  ) : (
    <SoundContext.Provider value={{ silent: true }}>
      <LeadContext.Provider value={0}>
        <StoryClock.Provider value={0}>
          <Freeze frame={f}>
            <ThursdayScene />
          </Freeze>
        </StoryClock.Provider>
      </LeadContext.Provider>
    </SoundContext.Provider>
  );
  return (
    <AbsoluteFill>
      <Vhs amount={amount} osd={osd}>
        {picture}
      </Vhs>
      {playing ? (
        <Top>
          <Headline text={bi(COPY.rewind)} at={b(R.words)} size={rtl ? 80 : 84} {...INK_DAY} />
        </Top>
      ) : null}
      <Sfx at={0} name="rewind" volume={0.75} length={b(R.play)} />
      <Sfx at={b(R.play)} name="switch" volume={0.7} />
    </AbsoluteFill>
  );
};
