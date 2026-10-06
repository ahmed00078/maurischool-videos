import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ROLES } from '../appCopy';
import { useBeat } from '../beat';
import { SAFE } from '../fx';
import { useBi, useLang } from '../lang';
import { PhoneRig, Pose, screenToCanvas, Sfx, SfxName, Top } from '../rig';
import { APP, EASE_IN, EASE_IN_OUT, OUTFIT, pt, SCREEN_W, tween } from '../tokens';
import { Device } from '../ui/Device';
import { Headline, RoleChip } from '../ui/Headline';
import { InboxItem, inboxRowCenter, InboxScreen } from '../ui/inbox';
import { Confetti } from '../ui/confetti';
import { CountdownRing, SpeechBubble, Verdict } from '../ui/lineup';
import { LogoMark } from '../ui/LogoMark';
import { Finish, headCenter, lookAt, Lineup, ORDER, spotX, SuspectState, useEpisode, useStoryFrame, Who } from './stage';

/**
 * The scenes of « Qui ne dit pas la vérité ? », the same in every episode:
 * the hook, one claim per suspect, the vote, Mum's check, the busted push-in
 * and the outro. An episode feeds them its story (who glances at whom, the
 * inbox rows, where the clue is, the faces) and its words, by EpisodeContext.
 */

export const ACCENT = '#ffd166';

/** The series name, small, at the top of the band: what this is, at a glance. */
export const SeriesPill: React.FC<{ at?: number }> = ({ at = -30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bi = useBi();
  const { font, dir } = useLang();
  const { copy } = useEpisode();
  const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 160 } });
  return (
    <div
      dir={dir}
      style={{
        padding: '10px 26px',
        borderRadius: 999,
        background: 'rgba(255,209,102,0.14)',
        border: '2px solid rgba(255,209,102,0.45)',
        color: ACCENT,
        fontFamily: font,
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: font.includes('Outfit') ? 1 : 0,
        opacity: Math.min(1, p * 1.5),
        scale: String(0.85 + 0.15 * p),
      }}
    >
      {bi(copy.series)} · {bi(copy.episode)}
    </div>
  );
};

/**
 * The episode's number, big enough to read on a profile grid: a yellow tag,
 * a little askew, like a case label. On the hook, so on the cover.
 */
export const EpisodeTag: React.FC<{ at?: number }> = ({ at = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bi = useBi();
  const { font, dir, rtl } = useLang();
  const { copy } = useEpisode();
  const p = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 200 } });
  return (
    <div
      dir={dir}
      style={{
        padding: rtl ? '6px 30px 10px' : '8px 30px',
        borderRadius: 16,
        background: ACCENT,
        color: '#141827',
        fontFamily: font,
        fontWeight: 800,
        fontSize: 40,
        lineHeight: rtl ? 1.3 : 1.1,
        letterSpacing: rtl ? 0 : 2,
        textTransform: 'uppercase',
        boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
        rotate: rtl ? '3deg' : '-3deg',
        opacity: Math.min(1, p * 1.5),
        scale: String(0.6 + 0.4 * p),
      }}
    >
      {bi(copy.episode)}
    </div>
  );
};

/**
 * hook: the lights come on over the lineup, then the question. Its settled
 * frame is the cover. Around beat 4, `glances` says who looks at whom.
 */
export const HookScene: React.FC<{ glances: Partial<Record<Who, Who>> }> = ({ glances }) => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const { copy } = useEpisode();
  // The strip lights flicker on.
  const on = frame < 3 ? 0.15 : frame < 5 ? 0.7 : frame < 7 ? 0.35 : 1;
  const glance = frame > b(3.5) && frame < b(5.2);
  const state = (who: Who): SuspectState => {
    const to = glances[who];
    return { face: { mouth: 'smile', look: glance && to ? [lookAt(who, to, rtl), 0] : [0, 0.2] } };
  };
  const states: Record<Who, SuspectState> = { son: state('son'), daughter: state('daughter'), father: state('father') };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `brightness(${on})` }}>
        <Lineup states={states} />
      </AbsoluteFill>
      {/* The tag takes room from the title, so the rule still clears the father's head. */}
      <Top gap={10}>
        <EpisodeTag at={4} />
        <Headline text={bi(copy.hook.title)} at={b(0.4)} size={rtl ? 84 : 100} accent={ACCENT} />
        <Headline text={bi(copy.hook.rule)} at={b(1.6)} size={58} color="#e6e9f5" />
      </Top>
      <Sfx at={2} name="switch" volume={0.5} />
      <Sfx at={b(1.6)} name="pop" volume={0.35} />
      <Finish />
    </AbsoluteFill>
  );
};

/**
 * One suspect has the floor: the spotlight, the bubble, and the others'
 * faces. `faces` gives everyone's state before and after the line is said;
 * a `talk` it gives the speaker (even undefined) replaces the scene's, to
 * break the line for a look.
 */
export const ClaimScene: React.FC<{ who: Who; faces: (rtl: boolean, after: boolean) => Record<Who, SuspectState> }> = ({ who, faces }) => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const { copy } = useEpisode();
  const [hx] = headCenter(who, rtl);
  const width = 780;
  const x = Math.max(SAFE.side + width / 2 + 10, Math.min(1080 - SAFE.right - width / 2, hx));
  const talkEnd = b(2.2);
  const after = frame >= talkEnd;
  const states = faces(rtl, after);
  for (const w of ORDER) {
    states[w] = { ...states[w], dim: w === who ? 0 : tween(frame, [0, 6], [0.4, 0.75]) };
  }
  states[who] = { talk: [b(0.3), talkEnd], ...states[who] };
  const lightIn = tween(frame, [0, 5]);
  return (
    <AbsoluteFill>
      <Lineup states={states} light={who} lightAmount={lightIn} />
      <Top gap={0}>
        <SeriesPill />
      </Top>
      <SpeechBubble text={bi(copy.claims[who])} at={b(0.2)} out={b(4.6)} tailX={hx} x={x} top={360} width={width} />
      <Sfx at={b(0.2)} name="pop" volume={0.5} />
      <Finish />
    </AbsoluteFill>
  );
};

/** vote: the ask, the three placards lighting in turn, and 3, 2, 1. */
export const VoteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const g = useStoryFrame();
  const bi = useBi();
  const { rtl } = useLang();
  const { copy } = useEpisode();
  // One placard glows per beat, 1 → 2 → 3, and round again.
  const lit = Math.floor((frame - b(1)) / 15);
  const glow = (i: number) => (frame >= b(1) && lit % 3 === i ? 1 - ((frame - b(1)) % 15) / 20 : 0);
  // Everyone fidgets: eyes dart from one to another.
  const dart = (seed: number) => Math.sin(g / 9 + seed) > 0.3 ? 1 : Math.sin(g / 9 + seed) < -0.3 ? -1 : 0;
  const states: Record<Who, SuspectState> = {
    son: { face: { mouth: 'flat', worry: 0.4, look: [dart(0), 0] }, glow: glow(0) },
    daughter: { face: { mouth: 'flat', look: [dart(2), 0] }, glow: glow(1) },
    father: { face: { mouth: 'smile', look: [dart(4) * (rtl ? -1 : 1), 0.1] }, glow: glow(2) },
  };
  const count = [b(1), b(3), b(5)];
  const idx = count.filter((c) => frame >= c).length - 1;
  const since = idx >= 0 ? frame - count[idx] : 0;
  const pop = spring({ frame: since, fps, config: { damping: 10, stiffness: 220 } });
  const leave = tween(frame, [b(6.6), b(7)], [0, 1], EASE_IN);
  return (
    <AbsoluteFill>
      <Lineup states={states} />
      <Top gap={6}>
        <Headline text={bi(copy.vote.ask)} at={b(0.1)} size={62} color="#e6e9f5" />
        <Headline text={bi(copy.vote.options)} at={b(0.5)} size={124} color={ACCENT} />
      </Top>
      {idx >= 0 ? (
        <div style={{ position: 'absolute', left: 540 - 105, top: 490, opacity: 1 - leave }}>
          <CountdownRing value={3 - idx} progress={Math.min(1, since / 30)} size={210} pop={0.7 + 0.3 * pop} />
        </div>
      ) : null}
      {count.map((c) => (
        <Sfx key={c} at={c} name="tick" volume={0.9} />
      ))}
      <Finish />
    </AbsoluteFill>
  );
};

/** Where the check stands, for an episode that wants its own reactions. */
export type CheckMoment = {
  rtl: boolean;
  /** Row `i` has been read and its verdict stamped. */
  stamped: (i: number) => boolean;
  /** The last row is in: the claim that does not hold is stamped. */
  caught: boolean;
};

const PHONE_POSE = { x: 540, y: 1190, scale: 0.82 } satisfies Pose;
const PHONE_ZOOM = 2.0;
/** Where the row being read is held on the canvas: centred in the safe band, clear of the text. */
const PHONE_HOLD: [number, number] = [505, 1060];

/**
 * check: Mum's phone comes up and she reads her notifications, one row per
 * suspect, `rows[i]` being the suspect whose claim row `i` checks. The first
 * two hold, the last does not. After each row, a hard cut back to the lineup,
 * where the verdict is stamped on that suspect's placard.
 *
 *   b0      the phone rises, "Maman vérifie."
 *   b2      zoom on row 1                b3.5 cut: VRAI
 *   b5      row 2                        b6.5 cut: VRAI
 *   b8      row 3, held                  b10.5 cut: FAUX
 *
 * By default the one who does not hold sweats a little more each time someone
 * else is cleared, the cleared grin, and at the end everyone turns to look.
 * `react` replaces any of those states.
 *
 * When a row's value is not in the inbox (the message is clamped to two
 * lines), `details[i]` is the screen the notification opens: row `i`'s window
 * shows it instead, framed on `focusY` (app points from the screen's top).
 */
export type CheckDetail = { screen: (emphasis: number) => React.ReactNode; focusY: number };

export const CheckScene: React.FC<{
  items: InboxItem[];
  rows: [Who, Who, Who];
  react?: (m: CheckMoment & { twisted: boolean }) => Partial<Record<Who, SuspectState>>;
  /**
   * A second stamp over the FAUX, at `beat` of the scene, with confetti: the
   * claim that did not hold was hiding good news.
   */
  twist?: { kind: Verdict; beat: number };
  details?: Partial<Record<0 | 1 | 2, CheckDetail>>;
}> = ({ items, rows: order, react, twist, details = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const { copy } = useEpisode();

  const rows: { phone: [number, number]; stamp: number; who: Who }[] = [
    { phone: [b(2), b(3.5)], stamp: b(3.5) + 3, who: order[0] },
    { phone: [b(5), b(6.5)], stamp: b(6.5) + 3, who: order[1] },
    { phone: [b(8), b(10.5)], stamp: b(10.5) + 3, who: order[2] },
  ];
  const phoneWindow = rows.findIndex((r) => frame >= r.phone[0] && frame < r.phone[1]);
  const showPhone = frame < b(2) || phoneWindow >= 0;

  // ── the phone ──
  const rise = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const pose: Pose = { ...PHONE_POSE, y: PHONE_POSE.y + (1 - rise) * 1300, rx: (1 - rise) * 25 };
  const row = Math.max(0, phoneWindow);
  const detail = phoneWindow >= 0 ? details[phoneWindow as 0 | 1 | 2] : undefined;
  const [fx, fy] = screenToCanvas(PHONE_POSE, SCREEN_W / 2, pt(detail ? detail.focusY : inboxRowCenter(row)));
  // Into the first row it is a camera move; the later rows start already framed, after a cut.
  const zin = phoneWindow === 0 ? tween(frame, [b(2), b(2) + 10], [0, 1], EASE_IN_OUT) : phoneWindow > 0 ? 1 : 0;
  const creep = phoneWindow >= 0 ? tween(frame, rows[row].phone, [0, 0.08]) : 0;
  const zoom = 1 + (PHONE_ZOOM - 1) * zin + creep;
  const tx = fx + (PHONE_HOLD[0] - fx) * zin;
  const ty = fy + (PHONE_HOLD[1] - fy) * zin;
  const emphasis = [0, 1, 2].map((i) =>
    i === phoneWindow ? tween(frame, [rows[i].phone[0] + (i === 0 ? 8 : 2), rows[i].phone[0] + (i === 0 ? 18 : 10)]) : 0,
  );
  // The last row shakes a little before the cut: the drumroll.
  const nerves = phoneWindow === 2 ? tween(frame, [b(9), b(10.5)]) : 0;
  const shake: [number, number] = [Math.sin(frame * 2.3) * 5 * nerves, Math.cos(frame * 1.9) * 4 * nerves];

  // ── the lineup, between rows ──
  const stamped = (i: number) => frame >= rows[i].stamp;
  const caught = stamped(2);
  const hop = (i: number) => (stamped(i) && frame - rows[i].stamp < 12 ? Math.sin(((frame - rows[i].stamp) / 12) * Math.PI) : 0);
  const [first, second, culprit] = order;
  // The one who does not hold sweats a little more each time someone else is cleared.
  const nervous = stamped(1) ? 0.8 : stamped(0) ? 0.4 : 0;
  const states = {} as Record<Who, SuspectState>;
  states[culprit] = {
    face: caught
      ? { mouth: 'wobble', worry: 1, sweat: 1, blush: 0.5, brows: 0.5, look: [rtl ? -1 : 1, 0.4] }
      : { mouth: nervous > 0.5 ? 'wobble' : 'flat', worry: nervous, sweat: nervous, look: [lookAt(culprit, stamped(1) ? second : first, rtl), 0] },
    verdict: caught ? { kind: 'false', at: rows[2].stamp } : undefined,
  };
  states[first] = {
    face: caught
      ? { mouth: 'o', brows: 1, look: [lookAt(first, culprit, rtl), 0] }
      : stamped(0)
        ? { mouth: 'grin', brows: 0.6, look: [0, -0.2] }
        : { mouth: 'smile' },
    verdict: { kind: 'true', at: rows[0].stamp },
    hop: hop(0),
  };
  states[second] = {
    face: caught
      ? { mouth: 'o', brows: 1, look: [lookAt(second, culprit, rtl), 0.2] }
      : stamped(1)
        ? { mouth: 'grin', brows: 0.5 }
        : { mouth: 'smile', look: [0, 0.1] },
    verdict: stamped(1) ? { kind: 'true', at: rows[1].stamp } : undefined,
    hop: hop(1) * 0.6,
  };
  const twistAt = twist ? b(twist.beat) : Infinity;
  const twisted = frame >= twistAt;
  if (twist) states[culprit].over = { kind: twist.kind, at: twistAt };
  const own = react?.({ rtl, stamped, caught, twisted }) ?? {};
  for (const w of ORDER) states[w] = { ...states[w], ...own[w] };
  const hit = caught ? Math.max(0, 1 - (frame - rows[2].stamp) / 14) : 0;
  const lineupShake: [number, number] = [Math.sin(frame * 3.1) * 16 * hit, Math.cos(frame * 2.7) * 12 * hit];
  const lit: Who | null = caught ? culprit : stamped(1) ? second : stamped(0) ? first : null;

  // ── text: the claim being checked, over the phone ──
  const claim = phoneWindow >= 0 ? rows[phoneWindow].who : null;

  return (
    <AbsoluteFill>
      {showPhone ? (
        <AbsoluteFill>
          <AbsoluteFill style={{ filter: 'blur(10px) brightness(0.35)' }}>
            <Lineup states={states} />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              transformOrigin: '0 0',
              transform: `translate(${tx - zoom * fx + shake[0]}px, ${ty - zoom * fy + shake[1]}px) scale(${zoom})`,
              perspective: 2600,
            }}
          >
            <PhoneRig pose={pose}>
              <Device time="19:42" glare={0.35}>
                {detail ? detail.screen(emphasis[phoneWindow]) : <InboxScreen items={items} emphasis={emphasis} />}
              </Device>
            </PhoneRig>
          </AbsoluteFill>
          <Top gap={16}>
            {claim === null ? (
              <>
                <RoleChip label={bi(ROLES.parent)} icon="person" at={b(0.2)} />
                <Headline text={bi(copy.check.title)} at={b(0.5)} size={96} accent={ACCENT} />
              </>
            ) : (
              <ClaimCard key={claim} who={claim} at={rows[phoneWindow].phone[0]} />
            )}
          </Top>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ translate: `${lineupShake[0]}px ${lineupShake[1]}px` }}>
          <Lineup states={states} light={lit} />
          {twist ? <Confetti x={spotX(culprit, rtl)} y={1250} at={twistAt} count={90} power={1.5} /> : null}
          <Top gap={0}>
            <SeriesPill />
          </Top>
        </AbsoluteFill>
      )}
      <Sfx at={0} name="buzz" volume={0.6} />
      <Sfx at={2} name="soft-whoosh" volume={0.5} />
      <Sfx at={b(2)} name="soft-whoosh" volume={0.35} />
      {rows.map((r, i) => (
        <Sfx key={i} at={r.stamp - 1} name="stamp" volume={i === 2 ? 1 : 0.85} />
      ))}
      <Sfx at={rows[2].stamp} name="sting" volume={0.8} />
      {twist ? (
        <>
          <Sfx at={twistAt - 1} name="stamp" volume={0.9} />
          <Sfx at={twistAt} name="ding" volume={0.6} />
          <Sfx at={twistAt + 1} name="pop" volume={0.5} />
        </>
      ) : null}
      <Finish />
    </AbsoluteFill>
  );
};

/** The claim under test, quoted, with the suspect's number. */
const ClaimCard: React.FC<{ who: Who; at: number }> = ({ who, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bi = useBi();
  const { font, dir, rtl } = useLang();
  const { copy } = useEpisode();
  const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 180 } });
  return (
    <div
      dir={dir}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '18px 30px 18px 20px',
        borderRadius: 30,
        background: 'rgba(12,16,40,0.78)',
        border: '2px solid rgba(255,255,255,0.14)',
        color: '#fff',
        fontFamily: font,
        fontWeight: 700,
        fontSize: 50,
        lineHeight: rtl ? 1.35 : 1.15,
        opacity: Math.min(1, p * 1.5),
        translate: `0px ${(1 - p) * 30}px`,
        maxWidth: 860,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 76,
          height: 76,
          borderRadius: 18,
          background: '#141827',
          border: '4px solid #e9ecf5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 46,
        }}
      >
        {ORDER.indexOf(who) + 1}
      </div>
      <span>«&nbsp;{bi(copy.claims[who])}&nbsp;»</span>
    </div>
  );
};

/** Where the busted camera goes: the clue's point on the canvas, where it is held, and how close. */
export type Shot = {
  /** The point pushed in on, in canvas px of the lineup. */
  focus: (rtl: boolean) => [number, number];
  /** Where that point ends up on the canvas once the camera is in. */
  hold: [number, number];
  zoom: number;
};

/** A camera on the lineup: `z` 0 is the whole wall, 1 is the shot's close-up. */
const Push: React.FC<{ shot: Shot; z: number; children: React.ReactNode }> = ({ shot, z, children }) => {
  const { rtl } = useLang();
  const [fx, fy] = shot.focus(rtl);
  const zoom = 1 + (shot.zoom - 1) * z;
  const tx = fx + (shot.hold[0] - fx) * z;
  const ty = fy + (shot.hold[1] - fy) * z;
  return (
    <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translate(${tx - zoom * fx}px, ${ty - zoom * fy}px) scale(${zoom})` }}>
      {children}
    </AbsoluteFill>
  );
};

/** Both verdicts already on the placards, landed before this scene. */
export const LANDED = { true: { kind: 'true' as const, at: -100 }, false: { kind: 'false' as const, at: -100 } };

/**
 * busted: who it was, then the camera pushes in on the clue (beats 2 to 3.5),
 * `reveal` (0 to 1, beats 2.6 to 4) brings it out, and `clue` draws the marker
 * around it. The others look at the culprit and soften into a smile at beat 3.
 */
export const BustedScene: React.FC<{
  culprit: Who;
  shot: Shot;
  /** The culprit, while the clue comes out. */
  culpritState: (reveal: number, rtl: boolean) => SuspectState;
  /** Markers and anything else drawn on the lineup, in its coordinates. */
  clue: (rtl: boolean) => React.ReactNode;
  /** The marker's sound: one per stroke. */
  strokes?: number[];
  /** The name's colour, and the sound under it: bad news by default. */
  accent?: string;
  sting?: SfxName | null;
  /** The others, replacing the default (a gasp, then a smile at beat 3). */
  react?: (m: { smile: boolean; rtl: boolean; frame: number; b: (beat: number) => number }) => Partial<Record<Who, SuspectState>>;
}> = ({ culprit, shot, culpritState, clue, strokes = [4], accent = '#ff6b6b', sting = 'wahwah', react }) => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const { copy } = useEpisode();
  const z = tween(frame, [b(2), b(3.5)], [0, 1], EASE_IN_OUT);
  const reveal = tween(frame, [b(2.6), b(4)]);
  const smile = frame > b(3);
  const states = {} as Record<Who, SuspectState>;
  for (const who of ORDER) {
    states[who] =
      who === culprit
        ? { verdict: LANDED.false, ...culpritState(reveal, rtl) }
        : {
            face: { mouth: smile ? 'smirk' : 'o', brows: smile ? 0.3 : 1, look: [lookAt(who, culprit, rtl), 0.2] },
            verdict: LANDED.true,
            dim: 0.35,
          };
  }
  const own = react?.({ smile, rtl, frame, b }) ?? {};
  for (const w of ORDER) states[w] = { ...states[w], ...own[w] };
  return (
    <AbsoluteFill>
      <Push shot={shot} z={z}>
        <Lineup states={states} light={culprit}>
          {clue(rtl)}
        </Lineup>
      </Push>
      <Top gap={14}>
        <Headline text={bi(copy.busted.who)} at={b(0.3)} size={112} accent={accent} />
        <Headline text={bi(copy.busted.trick)} at={b(4.3)} size={52} color="#e6e9f5" />
        <Headline text={bi(copy.busted.seen)} at={b(6.3)} size={64} color={ACCENT} />
      </Top>
      {sting ? <Sfx at={b(0.3)} name={sting} volume={0.7} /> : null}
      <Sfx at={b(2.6)} name="soft-whoosh" volume={0.5} />
      {strokes.map((s) => (
        <Sfx key={s} at={b(s)} name="chalk" volume={0.35} length={12} />
      ))}
      <Sfx at={b(6.3)} name="pop" volume={0.4} />
      <Finish />
    </AbsoluteFill>
  );
};

/** What the outro's `states` gets: the scene's frame and beat, and a shared laugh bounce. */
export type OutroMoment = { frame: number; b: (beat: number) => number; rtl: boolean; laugh: number };

/**
 * outro: the camera pulls back from the busted shot and the whole family
 * laughs. The ask, the brand, the series hashtag. An episode with a last gag
 * pushes the words back by `delay` beats and plays it in `children` (drawn over
 * the lineup, in canvas px, once the camera is back).
 */
export const OutroScene: React.FC<{ shot: Shot; states: (m: OutroMoment) => Record<Who, SuspectState>; delay?: number; children?: React.ReactNode }> = ({
  shot,
  states,
  delay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const g = useStoryFrame();
  const bi = useBi();
  const { rtl, font } = useLang();
  const { copy } = useEpisode();
  const z = 1 - tween(frame, [0, b(1.4)], [0, 1], EASE_IN_OUT);
  const laugh = Math.max(0, Math.sin(g * 0.55)) * 0.35;
  const d = (beat: number) => b(beat + delay);
  const logo = spring({ frame: frame - d(3), fps, config: { damping: 14, stiffness: 150 } });
  const tag = spring({ frame: frame - d(3.8), fps, config: { damping: 14, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <Push shot={shot} z={z}>
        <Lineup states={states({ frame, b, rtl, laugh })} />
      </Push>
      {children}
      <Top gap={20}>
        <Headline text={bi(copy.outro.tag)} at={d(0.8)} size={66} color="#fff" />
        <Headline text={bi(copy.outro.brand)} at={d(2.2)} size={40} color="#cfd5ea" accent={ACCENT} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            direction: 'ltr',
            marginTop: 6,
            opacity: Math.min(1, logo * 1.4),
            scale: String(0.8 + 0.2 * logo),
          }}
        >
          <LogoMark width={64} violet={APP.brand[400]} ink="#ffffff" />
          <span style={{ fontFamily: OUTFIT, fontWeight: 700, fontSize: 56, letterSpacing: -0.8, color: APP.brand[300] }}>
            Mauri<span style={{ color: '#fff' }}>School</span>
          </span>
        </div>
      </Top>
      {/* The series hashtag, as a caption bar at the foot of the safe band: clear of the heads in both languages. */}
      <div style={{ position: 'absolute', left: SAFE.side + 20, right: SAFE.right, top: 1392, display: 'flex', justifyContent: 'center', zIndex: 20 }}>
        <div
          dir={rtl ? 'rtl' : 'ltr'}
          style={{
            padding: rtl ? '8px 30px 14px' : '12px 30px',
            borderRadius: 22,
            background: 'rgba(12,16,40,0.85)',
            border: '2px solid rgba(255,209,102,0.45)',
            fontFamily: font,
            fontWeight: 800,
            fontSize: 46,
            lineHeight: rtl ? 1.3 : 1.1,
            color: ACCENT,
            opacity: Math.min(1, tag * 1.4),
            translate: `0px ${(1 - tag) * 24}px`,
          }}
        >
          {/* A right-to-left mark, so the # leads on the right as Arabic apps show it. */}
          {rtl ? `‏${bi(copy.hashtag)}` : bi(copy.hashtag)}
        </div>
      </div>
      <Sfx at={d(0.8)} name="pop" volume={0.4} />
      <Sfx at={d(3)} name="ding" volume={0.45} />
      <Finish />
    </AbsoluteFill>
  );
};
