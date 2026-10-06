import React, { createContext, useContext } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FAMILY } from '../demo';
import { Grain, Vignette } from '../fx';
import { Bi, useBi, useLang } from '../lang';
import { chalkFont } from '../ui/Chalkboard';
import { Arms, HAND, Hands, heightY, LineupWall, Placard, rosetteAt, Stamp, Verdict } from '../ui/lineup';
import { Boy, Face, Father, Girl } from '../ui/people';

/**
 * The set of « Qui ne dit pas la vérité ? », shared by every episode: the
 * lineup as one continuous set, the three suspects, where things sit on the
 * canvas, and the episode's own words and clue, handed down by context.
 *
 * Scenes are cut from the set, so idle motion (breathing, blinks) runs on the
 * story clock, not the scene's, and nothing jumps on a hard cut.
 */
export const StoryClock = createContext(0);
export const useStoryFrame = () => useCurrentFrame() + useContext(StoryClock);

export type Who = 'son' | 'daughter' | 'father';
export const ORDER: Who[] = ['son', 'daughter', 'father'];

/** Everything an episode says in its own voice (its copy.ts). */
export type EpisodeCopy = {
  series: Bi;
  episode: Bi;
  /** The series hashtag, the same in every episode: on the end card, and in every post's caption. */
  hashtag: Bi;
  hook: { title: Bi; rule: Bi };
  /** The three claims, one per suspect. */
  claims: Record<Who, Bi>;
  vote: { ask: Bi; options: Bi };
  check: { title: Bi };
  /** Stamped on the placards: a verdict on what was said. Every episode has true and false; the others when it uses them. */
  verdict: Record<'true' | 'false', Bi> & Partial<Record<Verdict, Bi>>;
  busted: { who: Bi; trick: Bi; seen: Bi };
  outro: { tag: Bi; brand: Bi };
};

/** What a suspect carries on them from the first frame: where an episode hides its clue. */
export type Carry = {
  /** The son only: a marked test in his shirt pocket, with this mark in red. */
  paper?: Bi;
  hands?: Hands;
  /** A gold rosette pinned behind the placard, its top peeking over the edge. */
  ribbon?: boolean;
};

export type Episode = { copy: EpisodeCopy; carry?: Partial<Record<Who, Carry>> };

export const EpisodeContext = createContext<Episode | null>(null);
export const useEpisode = () => {
  const episode = useContext(EpisodeContext);
  if (!episode) throw new Error('A verite scene needs an EpisodeContext');
  return episode;
};

/** Placard numbers follow reading order: 1 on the left in French, on the right in Arabic. */
const SPOTS = [200, 505, 810];
export const spotX = (who: Who, rtl: boolean) => {
  const i = ORDER.indexOf(who);
  return SPOTS[rtl ? 2 - i : i];
};

/** Busts are 380 px wide: 0.95 px per drawing unit. Placards are 230 px wide. */
export const W = 380;
const PW = 230;
export const K = W / 400;

type CastEntry = { cm: number; headTop: number; placardY: number; skin: string; headCy: number; sleeve: string; shoulder: [number, number] };
/**
 * Height in cm; head top, placard top and head centre in drawing units; the
 * sleeve's colour and the left shoulder (mirrored for the right), for the arms.
 */
export const CAST: Record<Who, CastEntry> = {
  son: { cm: 150, headTop: 124, placardY: 600, skin: '#b3744b', headCy: 250, sleeve: '#eef3fb', shoulder: [96, 500] },
  daughter: { cm: 163, headTop: 104, placardY: 640, skin: '#c98f63', headCy: 262, sleeve: '#1f9486', shoulder: [92, 560] },
  father: { cm: 180, headTop: 122, placardY: 660, skin: '#8f5b3b', headCy: 236, sleeve: '#6aa6dd', shoulder: [56, 540] },
};
/** Canvas y of a suspect's drawing top. */
export const svgTop = (who: Who) => heightY(CAST[who].cm) - CAST[who].headTop * K;
export const headCenter = (who: Who, rtl: boolean): [number, number] => [spotX(who, rtl), svgTop(who) + CAST[who].headCy * K];
/** Where the red mark on the son's test paper sits on the canvas, `rise` 0 to 1 out of his pocket. */
export const paperAt = (rtl: boolean, rise: number): [number, number] => [
  spotX('son', rtl) - W / 2 + 239 * K,
  svgTop('son') + (484 - rise * 45) * K,
];
/**
 * The centres of a suspect's two hands on the canvas, on the placard's edges
 * (see HAND in lineup.tsx), the placard raised by `lift` px: [screen-left hand, screen-right hand].
 */
/** The rosette's centre on the canvas, `rise` 0 to 1 (see rosetteAt), the placard raised by `lift` px. */
export const ribbonAt = (who: Who, rtl: boolean, rise = 0, lift = 0): [number, number] => {
  const r = rosetteAt(PW, rise);
  return [spotX(who, rtl) - PW / 2 + r.x, svgTop(who) + CAST[who].placardY * K - lift + r.y];
};

export const handsAt = (who: Who, rtl: boolean, lift = 0): [[number, number], [number, number]] => {
  const x = spotX(who, rtl);
  const y = svgTop(who) + CAST[who].placardY * K - lift + PW * 0.62 * HAND.top + HAND.h / 2;
  const dx = PW / 2 + HAND.out - HAND.w / 2;
  return [
    [x - dx, y],
    [x + dx, y],
  ];
};

export type SuspectState = {
  face?: Face;
  tilt?: number;
  /** 0 lit, 1 in the dark. */
  dim?: number;
  verdict?: { kind: Verdict; at: number };
  /** A second stamp, landing over the first: smaller, lower, at its own angle. */
  over?: { kind: Verdict; at: number; size?: number; dy?: number; dx?: number };
  /** The rosette, when the suspect carries one: 0 peeking, 1 pulled up. */
  ribbon?: number;
  /**
   * The hands leave the placard: `up` to cheer, `clap` in front of the chest,
   * `amount` 0 (on the placard) to 1 (there), `clap` 0 (hands apart) to 1 (together).
   */
  arms?: { pose: 'up' | 'clap'; amount: number; clap?: number };
  /** Frames of this scene where the suspect talks. */
  talk?: [number, number];
  /** The son's test paper, 0 to 1 out of his pocket (when the episode gives him one). */
  paper?: number;
  /** Px: the placard, and the hands on it, raised for a look. */
  lift?: number;
  /** 0 to 1: the placard lights up (the vote). */
  glow?: number;
  /** A little jump, 0 to 1. */
  hop?: number;
};

/** Where one suspect looks to see another: -1 left, 1 right. */
export const lookAt = (from: Who, to: Who, rtl: boolean) => Math.sign(spotX(to, rtl) - spotX(from, rtl));

const BLINK = { son: [113, 7], daughter: [137, 61], father: [97, 30] } as const;

const Suspect: React.FC<{ who: Who; state: SuspectState }> = ({ who, state }) => {
  const frame = useCurrentFrame();
  const g = useStoryFrame();
  const bi = useBi();
  const { rtl, lang } = useLang();
  const { copy, carry } = useEpisode();
  const cast = CAST[who];
  const x = spotX(who, rtl);
  const top = svgTop(who);
  const [cycle, offset] = BLINK[who];
  const b = (g + offset) % cycle;
  const blink = b < 3 ? b / 2 : b < 6 ? (6 - b) / 3 : 0;
  const talking = state.talk && frame >= state.talk[0] && frame < state.talk[1];
  const face: Face = {
    ...(state.face ?? { mouth: 'smile' }),
    ...(talking ? { mouth: 'talk', open: 0.2 + 0.8 * Math.abs(Math.sin(frame * 0.62)) } : {}),
    blink: Math.max(blink, state.face?.blink ?? 0),
    t: g / 30,
  };
  const bob = Math.sin((g / 30) * 2.1 + ORDER.indexOf(who) * 1.7) * 4 - (state.hop ?? 0) * 34;
  const dim = state.dim ?? 0;
  const Body = who === 'son' ? Boy : who === 'daughter' ? Girl : Father;
  const name = bi(FAMILY.short[who]);
  const paper = who === 'son' ? carry?.son?.paper : undefined;
  const label = (kind: Verdict) => {
    const words = copy.verdict[kind];
    if (!words) throw new Error(`This episode has no words for the "${kind}" stamp`);
    return bi(words);
  };
  const lift = state.lift ?? 0;
  // Clear of the platform's button column on the right.
  const shift = x > 700 ? -45 : 0;
  const arms = state.arms && state.arms.amount > 0 ? state.arms : null;
  const armsEl = (() => {
    if (!arms) return null;
    const [sx, sy] = cast.shoulder;
    const shoulders: [[number, number], [number, number]] = [
      [sx * K, sy * K],
      [W - sx * K, sy * K],
    ];
    // On the placard: where the hands hold it.
    const holdY = cast.placardY * K - lift + PW * 0.62 * HAND.top + HAND.h / 2;
    const holdX = (W - PW) / 2 - HAND.out + HAND.w / 2;
    const gap = 26 + 70 * (1 - (arms.clap ?? 0));
    const target: [number, number][] =
      arms.pose === 'up'
        ? [
            [W / 2 - 160, cast.headTop * K + 20],
            [W / 2 + 160, cast.headTop * K + 20],
          ]
        : [
            [W / 2 - gap, cast.placardY * K - lift - 50],
            [W / 2 + gap, cast.placardY * K - lift - 50],
          ];
    const a = arms.amount;
    const hand = (i: number, hx: number): [number, number] => [hx + (target[i][0] - hx) * a, holdY + (target[i][1] - holdY) * a];
    return (
      <Arms
        shoulders={shoulders}
        hands={[hand(0, holdX), hand(1, W - holdX)]}
        sleeve={cast.sleeve}
        skin={cast.skin}
        elbow={arms.pose === 'up' ? 70 : 40}
      />
    );
  })();
  return (
    <div
      style={{
        position: 'absolute',
        left: x - W / 2,
        top: top + bob,
        width: W,
        filter: dim > 0 ? `brightness(${1 - dim * 0.55}) saturate(${1 - dim * 0.4})` : undefined,
      }}
    >
      <Body
        width={W}
        face={face}
        tilt={state.tilt ?? 0}
        {...(paper ? { paper: state.paper ?? 0, paperLabel: bi(paper), paperFont: chalkFont(lang) } : {})}
      />
      <div style={{ position: 'absolute', left: (W - PW) / 2, top: cast.placardY * K - lift }}>
        <Placard
          number={ORDER.indexOf(who) + 1}
          name={name}
          skin={cast.skin}
          glow={state.glow ?? 0}
          width={PW}
          hands={carry?.[who]?.hands}
          free={arms !== null}
          ribbon={carry?.[who]?.ribbon ? (state.ribbon ?? 0) : undefined}
        />
        {state.verdict ? <Stamp kind={state.verdict.kind} label={label(state.verdict.kind)} at={state.verdict.at} size={68} shift={shift} /> : null}
        {state.over ? (
          <Stamp kind={state.over.kind} label={label(state.over.kind)} at={state.over.at} size={state.over.size ?? 60} dy={state.over.dy ?? 22} shift={shift + (state.over.dx ?? 0)} />
        ) : null}
      </div>
      {armsEl}
    </div>
  );
};

/** The wall, the three suspects, and the spotlight on `light`. */
export const Lineup: React.FC<{ states: Partial<Record<Who, SuspectState>>; light?: Who | null; lightAmount?: number; children?: React.ReactNode }> = ({
  states,
  light = null,
  lightAmount = 1,
  children,
}) => {
  const { rtl } = useLang();
  // The father stands behind: drawn first, so the placards of the children overlap his sleeves.
  const drawOrder: Who[] = ['father', 'daughter', 'son'];
  return (
    <AbsoluteFill>
      <LineupWall light={light ? lightAmount : 0} lightX={light ? spotX(light, rtl) : 540} />
      {drawOrder.map((who) => (
        <Suspect key={who} who={who} state={states[who] ?? {}} />
      ))}
      {children}
    </AbsoluteFill>
  );
};

/** Vignette and grain over everything, as every scene of the kit has. */
export const Finish: React.FC = () => (
  <>
    <Vignette strength={0.45} />
    <Grain />
  </>
);
