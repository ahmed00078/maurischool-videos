import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useBeat, useStoryFrame } from '../beat';
import { CameraPath, Grain, Shot, Vignette } from '../fx';
import { Bi, useBi } from '../lang';
import { Sfx } from '../rig';
import { APP, EASE_IN_OUT, tween } from '../tokens';
import { Device, DEVICE_H, DEVICE_W } from '../ui/Device';
import { Goat, GOAT_HEAD, GOAT_MOUTH, goatHeadPoint, GoatState } from '../ui/goat';
import { Arm, Boy, BustLayer, Face, Father, FATHER_COLORS, FATHER_SHOULDERS } from '../ui/people';
import { Courtyard } from '../ui/places';

/**
 * The set of « La chèvre a encore frappé »: the family's courtyard at midday,
 * the goat in front, Papa and Sidi behind her. Every episode is cut from it
 * (an episode may add a place of its own, like ép. 1's cash office), so the
 * goat stands in the same spot and chews on the same clock from one episode
 * to the next. Scenes only say what changes: faces, arms, what is in whose
 * hand, where the camera is.
 */

type Pt = [number, number];

// ── the goat ──

/** The goat: 700 px wide, hooves on the ground near the camera. */
export const GOAT = { x: -20, top: 1123, width: 700 } as const;
const GK = GOAT.width / 600;
/** A point of the goat (her own units) on the canvas, `dx` px along. */
export const goatAt = ([x, y]: Pt, dx = 0): Pt => [GOAT.x + dx + x * GK, GOAT.top + y * GK];
/** Her face's centre, and her mouth, on the canvas (for a given reach and turn). */
export const GOAT_FACE = goatAt(goatHeadPoint(GOAT_HEAD));
export const goatMouth = (state: GoatState = {}, dx = 0) => goatAt(goatHeadPoint(GOAT_MOUTH, state), dx);

/** The camera on the courtyard: her face close, filling the frame under the words; and the whole yard. */
export const SHOT = {
  // Her face under the text band and its tag, the paper in her mouth clear of the bottom zone.
  close: { zoom: 3 * (620 / GOAT.width), focus: GOAT_FACE, to: [520, 1090] as Pt },
  wide: { zoom: 1, focus: [540, 960] as Pt, to: [540, 960] as Pt },
} satisfies Record<string, Omit<Shot, 'at'>>;

// ── the people ──

/** Papa in the courtyard: 560 px wide (1.4 px per unit), head top at 700. */
export const PAPA_YARD = { left: 540, top: 529, width: 560 } as const;
const PK = 560 / 400;
export const papaAt = (place: { left: number; top: number }, [x, y]: Pt): Pt => [place.left + x * PK, place.top + y * PK];

/** Sidi in the courtyard, a head shorter than his father and a step in front of him, by the goat. */
export const SIDI_YARD = { left: 330, top: 690, width: 440 } as const;
const SK = SIDI_YARD.width / 400;
export const sidiAt = ([x, y]: Pt, place: { left: number; top: number } = SIDI_YARD): Pt => [place.left + x * SK, place.top + y * SK];
export const BOY_SHOULDERS: [Pt, Pt] = [
  [92, 476],
  [308, 476],
];
export const BOY_COLORS = { sleeve: '#eef3fb', skin: '#b3744b' } as const;

/** One arm: where the hand is, in the bust's units, and how the elbow bends. */
export type ArmPose = { to: Pt; bend?: number };

export type PapaState = {
  face: Face;
  tilt?: number;
  /** The fees envelope out of his pocket, 0 to 1 (undefined: no envelope). */
  envelope?: number;
  pocketOut?: number;
  phone?: { rise: number; shake?: number };
  /** His arms, screen-left and screen-right; hidden when unset. */
  left?: ArmPose;
  right?: ArmPose;
};

export type SidiState = {
  face: Face;
  tilt?: number;
  left?: ArmPose;
  right?: ArmPose;
  /** Px he has stepped along (a hop of joy, a flinch). */
  dx?: number;
  dy?: number;
};

/** Everyone blinks now and then, on the video's clock, each at their own rhythm. */
export const useBlink = (cycle: number, offset: number) => {
  const g = useStoryFrame();
  const b = (g + offset) % cycle;
  return b < 3 ? b / 2 : b < 6 ? (6 - b) / 3 : 0;
};

/** The label on the fees envelope. */
const SCOLARITE: Bi = { fr: 'Scolarité', ar: 'رسوم الدراسة' };

export const Papa: React.FC<{ place: { left: number; top: number; width: number }; state: PapaState }> = ({ place, state }) => {
  const g = useStoryFrame();
  const bi = useBi();
  const blink = useBlink(97, 30);
  const face: Face = { ...state.face, blink: Math.max(blink, state.face.blink ?? 0), t: g / 30 };
  const [l, r] = FATHER_SHOULDERS;
  return (
    <div style={{ position: 'absolute', left: place.left, top: place.top + Math.sin(g / 21) * 3, width: place.width }}>
      <Father
        width={place.width}
        face={face}
        tilt={state.tilt ?? 0}
        envelope={state.envelope ?? 0}
        envelopeLabel={state.envelope === undefined ? undefined : bi(SCOLARITE)}
        pocketOut={state.pocketOut}
        phone={state.phone}
      />
      <BustLayer width={place.width}>
        {state.left ? <Arm from={l} to={state.left.to} bend={state.left.bend ?? -50} thickness={78} thumb={1} {...FATHER_COLORS} /> : null}
        {state.right ? <Arm from={r} to={state.right.to} bend={state.right.bend ?? 50} thickness={78} thumb={-1} {...FATHER_COLORS} /> : null}
      </BustLayer>
    </div>
  );
};

export const Sidi: React.FC<{ place?: { left: number; top: number; width: number }; state: SidiState }> = ({ place = SIDI_YARD, state }) => {
  const g = useStoryFrame();
  const blink = useBlink(113, 51);
  const face: Face = { ...state.face, blink: Math.max(blink, state.face.blink ?? 0), t: g / 30 };
  const [l, r] = BOY_SHOULDERS;
  return (
    <div style={{ position: 'absolute', left: place.left + (state.dx ?? 0), top: place.top + (state.dy ?? 0) + Math.sin(g / 17 + 1) * 3, width: place.width }}>
      <Boy width={place.width} face={face} tilt={state.tilt ?? 0} />
      <BustLayer width={place.width}>
        {state.left ? <Arm from={l} to={state.left.to} bend={state.left.bend ?? -40} thickness={66} thumb={1} {...BOY_COLORS} /> : null}
        {state.right ? <Arm from={r} to={state.right.to} bend={state.right.bend ?? 40} thickness={66} thumb={-1} {...BOY_COLORS} /> : null}
      </BustLayer>
    </div>
  );
};

/**
 * The courtyard: the wall, Papa and Sidi, the goat in front of them. `items`
 * are drawn over everyone (what is in a hand, what flies), in canvas px;
 * `under` between the people and the goat. `dof` blurs everything but the
 * goat, for the close shots.
 */
export const Yard: React.FC<{
  goat: GoatState;
  goatDx?: number;
  /** `null` leaves him out of the yard. */
  papa: PapaState | null;
  papaPlace?: { left: number; top: number; width: number };
  sidi?: SidiState | null;
  shots: Shot[];
  move?: number;
  dof?: number;
  under?: React.ReactNode;
  items?: React.ReactNode;
}> = ({ goat, goatDx = 0, papa, papaPlace = PAPA_YARD, sidi = null, shots, move, dof = 0, under, items }) => {
  const g = useStoryFrame();
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#e6ba84' }}>
      <CameraPath shots={shots} move={move}>
        <AbsoluteFill style={{ filter: dof > 0.05 ? `blur(${dof}px)` : undefined }}>
          <Courtyard />
          {papa ? <Papa place={papaPlace} state={papa} /> : null}
          {sidi ? <Sidi state={sidi} /> : null}
          {under}
        </AbsoluteFill>
        <div style={{ position: 'absolute', left: GOAT.x + goatDx, top: GOAT.top }}>
          {/* She chews on the beat, on the video's clock, unless a scene says otherwise. */}
          <Goat width={GOAT.width} state={{ chew: g / 15, ...goat }} />
        </div>
        {items}
      </CameraPath>
      <Vignette strength={0.28} />
      <Grain />
    </AbsoluteFill>
  );
};

/** Her face, close, the yard blurred behind: the hooks, the cutaways, the end card. */
export const GoatClose: React.FC<{ goat?: GoatState; papa?: PapaState | null; sidi?: SidiState | null; items?: React.ReactNode; shots?: Shot[] }> = ({
  goat = {},
  papa = { face: { mouth: 'flat', look: [-0.6, 0.5] } },
  sidi = null,
  items,
  shots = [{ at: 0, ...SHOT.close }],
}) => <Yard goat={goat} papa={papa} sidi={sidi} shots={shots} dof={5} items={items} />;

/** Where a scrap sits on her mouth at rest: its angle and size. */
export const SCRAP = { angle: 10, scale: 0.55 } as const;

// ── what happens in it ──

/** Words over the courtyard: dark ink, the brand's blue for the accent, a soft light halo against the wall. */
export const INK = {
  color: '#2a1d1a',
  accent: APP.brand[600],
  style: { textShadow: '0 0 18px rgba(255,248,235,0.95), 0 0 6px rgba(255,248,235,0.9)' },
} as const;

/** A light veil under the words where the picture behind is busy: an office's window and shelf, a phone close up. */
export const TopScrim: React.FC<{ opacity?: number; height?: number }> = ({ opacity = 1, height = 640 }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height,
      opacity,
      background: 'linear-gradient(180deg, rgba(255,250,240,0.96) 0%, rgba(255,250,240,0.85) 50%, rgba(255,250,240,0) 100%)',
    }}
  />
);

/** A crunch on every beat while she is in the shot, from beat `from` to beat `to` of the scene. */
export const Chewing: React.FC<{ from: number; to: number; volume?: number }> = ({ from, to, volume = 0.45 }) => {
  const b = useBeat();
  const beats: number[] = [];
  for (let i = Math.ceil(from); i < to; i++) beats.push(i);
  return (
    <>
      {beats.map((i) => (
        <Sfx key={i} at={b(i)} name="chew" volume={volume * (i % 2 ? 0.8 : 1)} rate={i % 3 === 1 ? 1.08 : 0.96} />
      ))}
    </>
  );
};

/**
 * A snatch on any clock: her head shoots out to the paper at `at`, mouth open,
 * and is back with it by `back`. `taken` from the bite, `chewing` once home.
 */
export const snatch = (frame: number, at: number, back: number) => {
  const out = tween(frame, [at - 3, at + 2]);
  const home = tween(frame, [back - 2, back + 6], [0, 1], EASE_IN_OUT);
  return { reach: 74 * out * (1 - home), open: out * (1 - home), taken: frame >= at + 2, chewing: frame >= back + 6 };
};

/** The bite: a flash of paper bits at her mouth, from frame `at` (`clock` for a slowed scene). */
export const Bits: React.FC<{ at: number; mouth: readonly [number, number]; clock?: number; color?: string }> = ({ at, mouth, clock, color = '#fbf5d6' }) => {
  const real = useCurrentFrame();
  const frame = clock ?? real;
  if (frame < at || frame >= at + 10) return null;
  const t = (frame - at) / 10;
  return (
    <>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: mouth[0] + 20 + Math.cos(i * 1.3) * 70 * t,
            top: mouth[1] - 10 + Math.sin(i * 1.3) * 46 * t + 60 * t * t,
            width: 12,
            height: 9,
            background: color,
            rotate: `${i * 40 + frame * 20}deg`,
            opacity: 1 - t,
          }}
        />
      ))}
    </>
  );
};

/** A phone held in a hand, `scale` of a real one, showing `children` (a screen). */
export const HeldPhone: React.FC<{ x: number; y: number; scale: number; rz?: number; time?: string; tone?: 'light' | 'dark'; children: React.ReactNode }> = ({
  x,
  y,
  scale,
  rz = 0,
  time = '10:26',
  tone = 'light',
  children,
}) => (
  <div style={{ position: 'absolute', left: x - DEVICE_W / 2, top: y - DEVICE_H / 2, width: DEVICE_W, height: DEVICE_H, scale: String(scale), rotate: `${rz}deg` }}>
    <Device statusTone={tone} glare={0.5} time={time}>
      {children}
    </Device>
  </div>
);
