import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ChatBubbles, Notebook, RingingPhone, Spreadsheet } from '../../../shared/ui/Illustrations';
import { COPY } from '../copy';
import { Camera } from '../../../shared/fx';
import { useBi, useLang } from '../../../shared/lang';
import { useBeat, useMarks } from '../../../shared/beat';
import { APP, EASE_IN, EASE_IN_OUT, OUTFIT, tween } from '../../../shared/tokens';
import { Headline } from '../../../shared/ui/Headline';
import { ChatBubble, LogoAssemble } from '../../../shared/ui/props';
import { Scene, Sfx, Top } from '../../../shared/rig';

const SENDERS = [
  { fr: 'Parent d’élève', ar: 'وليّ أمر' },
  { fr: 'Prof. de maths', ar: 'أستاذ الرياضيات' },
  null,
  { fr: 'Comptable', ar: 'المحاسب' },
  null,
  { fr: 'Superviseur', ar: 'المشرف' },
  { fr: 'Parent d’élève', ar: 'وليّ أمر' },
  null,
];

/**
 * When each bubble pops, as a share of the time before the question: two are
 * already there on frame 0, then they come faster and faster.
 */
const POPS = [-12, -5, 0.13, 0.31, 0.46, 0.59, 0.7, 0.8];
const Y = [360, 560, 760, 930, 1110, 1270, 1440, 1610];

/**
 * 1 · Hook. A director's phone explodes with questions: bubbles pile up
 * faster and faster, the frame shakes, then everything freezes and one
 * question lands, on the word when there is a voice. Frame 0 is already
 * busy, so the thumbnail is too.
 */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const mark = useMarks();
  const bi = useBi();
  const { rtl } = useLang();
  const q = b(mark('question', 4));
  const pops = POPS.map((p) => (p < 0 ? p : Math.round(p * q)));
  const freeze = tween(frame, [q - 2, q + 4]);
  const shake = tween(frame, [0, q], [1, 6], EASE_IN) * (1 - freeze);
  return (
    <Scene mood="night" grid={false}>
      <Camera shake={shake} drift={0.06}>
        <AbsoluteFill style={{ filter: `blur(${freeze * 14}px) brightness(${1 - freeze * 0.55})` }}>
          {COPY.hook.bubbles.map((text, i) => {
            const start = i % 2 === 0;
            const physicalLeft = start !== rtl;
            const sender = SENDERS[i];
            return (
              <ChatBubble
                key={i}
                text={bi(text)}
                sender={sender ? bi(sender) : undefined}
                at={pops[i]}
                side={start ? 'start' : 'end'}
                tone={start ? 'white' : 'green'}
                style={{ top: Y[i], [physicalLeft ? 'left' : 'right']: 70 + (i % 3) * 18, rotate: `${(i % 2 ? 1 : -1) * (1 + (i % 3))}deg` }}
              />
            );
          })}
        </AbsoluteFill>
      </Camera>
      <AbsoluteFill style={{ justifyContent: 'center', padding: '0 90px' }}>
        <Headline text={bi(COPY.hook.question)} at={q} size={104} accent="#fbbf24" />
      </AbsoluteFill>
      {pops.filter((p) => p >= 0).map((p, i) => (
        <Sfx key={p} at={p} name="mouse-click" rate={1 + i * 0.12} volume={0.6} />
      ))}
      <Sfx at={q - 1} name="whip" volume={0.8} rate={0.8} />
    </Scene>
  );
};

/** `mark` names the word the item lands on; `beat` is where it lands without a voice. */
type Item = { el: React.ReactNode; x: number; y: number; rot: number; mark: string; beat: number; fly: [number, number] };

const ITEMS: Item[] = [
  { el: <Notebook size={340} />, x: 300, y: 930, rot: -10, mark: 'cahier', beat: 0, fly: [-520, -260] },
  { el: <Spreadsheet size={380} />, x: 770, y: 870, rot: 8, mark: 'excel', beat: 1, fly: [560, -320] },
  { el: <ChatBubbles size={350} />, x: 320, y: 1330, rot: 6, mark: 'whatsapp', beat: 2, fly: [-560, 380] },
  { el: <RingingPhone size={290} />, x: 770, y: 1360, rot: -8, mark: 'partout', beat: 3, fly: [540, 420] },
];

/**
 * 2 · Chaos. The tools of today slam down, each on its word in the voice (or
 * one per beat without it); then "the information gets lost" and they drift
 * apart and blur.
 */
export const ChaosScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const mark = useMarks();
  const bi = useBi();
  const { dir, font, rtl } = useLang();
  const at = ITEMS.map((it) => b(mark(it.mark, it.beat)));
  const lost = mark('lost', 4.25);
  const scatter = tween(frame, [b(lost + 0.25), b(lost + 3.75)], [0, 1], EASE_IN_OUT);
  // A short jolt of the frame on every slam.
  const jolt = at.reduce((sum, a) => {
    const t = frame - a;
    return sum + (t >= 0 && t < 8 ? Math.sin(t * 2.4) * (8 - t) * 1.2 : 0);
  }, 0);
  const wordsOut = tween(frame, [b(lost) - 4, b(lost) + 4], [0, 1], EASE_IN);
  return (
    <Scene mood="paper">
      <Camera drift={0.05}>
        <AbsoluteFill style={{ translate: `0px ${jolt}px` }}>
          {ITEMS.map((it, i) => {
            const land = spring({ frame: frame - at[i] + 4, fps, config: { damping: 14, stiffness: 180 } });
            const ring = i === 3 && frame > at[3] ? Math.sin(frame * 2.6) * 7 * (1 - scatter) : 0;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: it.x,
                  top: it.y,
                  // Drift apart but stay in frame: the mess is still there, just out of reach.
                  translate: `calc(-50% + ${it.fly[0] * scatter * 0.45}px) calc(-50% + ${it.fly[1] * scatter * 0.45}px)`,
                  rotate: `${it.rot + ring + scatter * it.rot * 3}deg`,
                  scale: String((1.8 - 0.8 * land) * (1 - scatter * 0.2)),
                  opacity: Math.min(1, land * 2) * (1 - scatter * 0.5),
                  filter: `drop-shadow(0 26px 40px rgba(29,36,64,0.18)) blur(${scatter * 7}px)`,
                }}
              >
                {it.el}
              </div>
            );
          })}
        </AbsoluteFill>
      </Camera>
      <Top>
        <div
          dir={dir}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: 30,
            fontFamily: font,
            fontWeight: 800,
            fontSize: rtl ? 96 : 80,
            color: APP.light.text,
            opacity: 1 - wordsOut,
            translate: `0px ${-wordsOut * 40}px`,
          }}
        >
          {COPY.chaos.words.map((w, i) => {
            const p = spring({ frame: frame - at[i], fps, config: { damping: 12, stiffness: 220 } });
            return (
              <span key={i} style={{ display: 'inline-block', scale: String(0.4 + p * 0.6), opacity: Math.min(1, p * 2) }}>
                {bi(w)}
              </span>
            );
          })}
        </div>
      </Top>
      <Top style={{ top: 260 }}>
        <Headline text={bi(COPY.chaos.lost)} at={b(lost)} size={100} color={APP.light.text} accent={APP.error} />
      </Top>
      {at.map((a) => (
        <Sfx key={a} at={a - 1} name="switch" volume={0.75} rate={0.7} />
      ))}
      <Sfx at={b(lost + 0.25)} name="whoosh" volume={0.45} rate={0.7} />
    </Scene>
  );
};

/**
 * 3 · Logo. The scattered tools are pulled into the centre and swallowed;
 * the mark then assembles tile by tile, locks with a pulse, and the promise
 * is written under it.
 */
export const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const pull = tween(frame, [0, b(1)], [0, 1], EASE_IN);
  const lock = tween(frame, [b(4), b(4) + 16]);
  const word = spring({ frame: frame - b(4), fps, config: { damping: 18, stiffness: 120 } });
  const icons = [<Notebook size={200} />, <Spreadsheet size={220} />, <ChatBubbles size={210} />, <RingingPhone size={180} />];
  const from: [number, number][] = [
    [-420, 200],
    [380, 150],
    [-400, 560],
    [380, 580],
  ];
  return (
    <Scene mood="brand">
      <Camera drift={0.05}>
        {icons.map((icon, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 540,
              top: 760,
              translate: `calc(-50% + ${from[i][0] * (1 - pull)}px) calc(-50% + ${from[i][1] * (1 - pull)}px)`,
              scale: String(1 - pull * 0.95),
              rotate: `${pull * 180 * (i % 2 ? 1 : -1)}deg`,
              opacity: 1 - tween(frame, [b(1) - 4, b(1)]),
            }}
          >
            {icon}
          </div>
        ))}
        {/* The pulse when the mark locks */}
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 760,
            width: 700,
            height: 700,
            borderRadius: '50%',
            translate: '-50% -50%',
            border: '6px solid rgba(255,255,255,0.7)',
            scale: String(0.4 + lock * 1.4),
            opacity: lock > 0 ? 1 - lock : 0,
          }}
        />
        <div style={{ position: 'absolute', left: 540, top: 760, translate: '-50% -50%', scale: String(1 + 0.05 * Math.sin(lock * Math.PI)) }}>
          <LogoAssemble width={560} start={b(1)} step={5} violet="#ffffff" ink={APP.brand[900]} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1010,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: OUTFIT,
            fontWeight: 800,
            fontSize: 138,
            letterSpacing: -3,
            color: '#fff',
            opacity: word,
            translate: `0px ${(1 - word) * 50}px`,
          }}
        >
          Mauri<span style={{ color: APP.brand[900] }}>School</span>
        </div>
      </Camera>
      <div style={{ position: 'absolute', top: 1230, left: 90, right: 90, display: 'grid', gap: 10 }}>
        <Headline text={bi(COPY.logo.line1)} at={b(5)} size={78} color="#fff" accent="#fff" />
        <Headline text={bi(COPY.logo.line2)} at={b(6)} size={78} color="#fff" accent={APP.brand[900]} highlight="#ffffff" />
      </div>
      {Array.from({ length: 7 }, (_, i) => (
        <Sfx key={i} at={b(1) + i * 5 + 9} name="mouse-click" volume={0.55} rate={1.4 + i * 0.05} />
      ))}
      <Sfx at={b(4) - 2} name="ding" volume={0.6} rate={0.9} />
    </Scene>
  );
};
