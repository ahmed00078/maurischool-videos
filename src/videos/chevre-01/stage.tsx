import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useStoryFrame } from '../../shared/beat';
import { CameraPath, Grain, Shot, Vignette } from '../../shared/fx';
import { Bi, useBi } from '../../shared/lang';
import { Goat, GOAT_HEAD, GOAT_MOUTH, goatHeadPoint, GoatState } from '../../shared/ui/goat';
import {
  Accountant,
  ACCOUNTANT_COLORS,
  ACCOUNTANT_SHOULDERS,
  Arm,
  BustLayer,
  Face,
  Father,
  FATHER_COLORS,
  FATHER_SHOULDERS,
} from '../../shared/ui/people';
import { Counter, Courtyard, DeskSign, Office, Register, WallCalendar } from '../../shared/ui/places';
import { COPY } from './copy';

/**
 * Where everyone stands in « La chèvre et le reçu », and the two sets: the
 * courtyard (the goat in front, Papa behind her) and the cash office (the
 * accountant behind the counter, Papa in front of it). Scenes are cut from
 * these sets and only say what changes: faces, arms, what is in whose hand,
 * where the camera is.
 */

type Pt = [number, number];

// ── the courtyard ──

/** The goat: 700 px wide, hooves on the ground near the camera. */
export const GOAT = { x: -20, top: 1123, width: 700 } as const;
const GK = GOAT.width / 600;
/** A point of the goat (her own units) on the canvas, `dx` px along. */
export const goatAt = ([x, y]: Pt, dx = 0): Pt => [GOAT.x + dx + x * GK, GOAT.top + y * GK];
/** Her face's centre, and her mouth, on the canvas (for a given reach and turn). */
export const GOAT_FACE = goatAt(goatHeadPoint(GOAT_HEAD));
export const goatMouth = (state: GoatState = {}, dx = 0) => goatAt(goatHeadPoint(GOAT_MOUTH, state), dx);

/** Papa in the courtyard: 560 px wide (1.4 px per unit), head top at 700. */
export const PAPA_YARD = { left: 540, top: 529, width: 560 } as const;
/** Papa at the counter, a little further along. */
export const PAPA_DESK = { left: 560, top: 519, width: 560 } as const;
const PK = 560 / 400;
export const papaAt = (place: { left: number; top: number }, [x, y]: Pt): Pt => [place.left + x * PK, place.top + y * PK];

/** The accountant behind her counter: 500 px wide, head top at 700. */
export const ACCOUNTANT = { left: 110, top: 570, width: 500 } as const;
const AK = ACCOUNTANT.width / 400;
export const accountantAt = ([x, y]: Pt): Pt => [ACCOUNTANT.left + x * AK, ACCOUNTANT.top + y * AK];
export const toAccountant = ([x, y]: Pt): Pt => [(x - ACCOUNTANT.left) / AK, (y - ACCOUNTANT.top) / AK];

/** The counter top, seen from a little above so the register lies on it. */
export const DESK = { top: 1330, depth: 190 } as const;
export const REGISTER = { x: 330, y: 1428, width: 400 } as const;
/** Where the accountant's hand turns a page: from the right page's edge over to the left. */
export const PAGE_HAND = { right: [490, 1420] as Pt, left: [200, 1415] as Pt };

/** The camera on the courtyard: her face close, filling the frame under the words; and the whole yard. */
export const SHOT = {
  close: { zoom: 3 * (620 / GOAT.width), focus: GOAT_FACE, to: [520, 1000] as Pt },
  wide: { zoom: 1, focus: [540, 960] as Pt, to: [540, 960] as Pt },
} satisfies Record<string, Omit<Shot, 'at'>>;

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

/** Everyone blinks now and then, on the video's clock, each at their own rhythm. */
const useBlink = (cycle: number, offset: number) => {
  const g = useStoryFrame();
  const b = (g + offset) % cycle;
  return b < 3 ? b / 2 : b < 6 ? (6 - b) / 3 : 0;
};

const Papa: React.FC<{ place: { left: number; top: number; width: number }; state: PapaState }> = ({ place, state }) => {
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

/** The label on the fees envelope. */
const SCOLARITE: Bi = { fr: 'Scolarité', ar: 'رسوم الدراسة' };

/**
 * The courtyard: the wall, Papa, the goat in front of him. `items` are drawn
 * over everyone (what is in a hand, what flies), in canvas px. `dof` blurs
 * everything but the goat, for the close shots.
 */
export const Yard: React.FC<{
  goat: GoatState;
  goatDx?: number;
  papa: PapaState;
  shots: Shot[];
  move?: number;
  dof?: number;
  items?: React.ReactNode;
}> = ({ goat, goatDx = 0, papa, shots, move, dof = 0, items }) => {
  const g = useStoryFrame();
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#e6ba84' }}>
      <CameraPath shots={shots} move={move}>
        <AbsoluteFill style={{ filter: dof > 0.05 ? `blur(${dof}px)` : undefined }}>
          <Courtyard />
          <Papa place={PAPA_YARD} state={papa} />
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

export type AccountantState = { face: Face; tilt?: number; hand?: Pt };

/**
 * The cash office: the wall and its calendar, the accountant behind the
 * counter, the register open on it, the « Caisse » plate, Papa in front.
 * `flip` turns the register's pages; `month` sets the calendar.
 */
export const Desk: React.FC<{
  accountant: AccountantState;
  papa: PapaState;
  flip?: number;
  month: 'later' | 'payday';
  shots?: Shot[];
  items?: React.ReactNode;
}> = ({ accountant, papa, flip = 0, month, shots = [{ at: 0, zoom: 1, focus: [540, 960] }], items }) => {
  const g = useStoryFrame();
  const bi = useBi();
  const blink = useBlink(131, 64);
  const face: Face = { ...accountant.face, blink: Math.max(blink, accountant.face.blink ?? 0), t: g / 30 };
  const [, shoulder] = ACCOUNTANT_SHOULDERS;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#f0e5cf' }}>
      <CameraPath shots={shots}>
        <Office />
        <WallCalendar month={COPY.months[month]} day={12} x={510} y={790} width={132} />
        <div style={{ position: 'absolute', left: ACCOUNTANT.left, top: ACCOUNTANT.top + Math.sin(g / 25) * 2, width: ACCOUNTANT.width }}>
          <Accountant width={ACCOUNTANT.width} face={face} tilt={accountant.tilt ?? 0} />
        </div>
        <Counter top={DESK.top} depth={DESK.depth}>
          <DeskSign label={bi(COPY.desk)} x={120} y={DESK.top + 70} />
          <Register x={REGISTER.x} y={REGISTER.y} width={REGISTER.width} flip={flip} />
        </Counter>
        {/* Her hand on the register, from behind the counter's edge */}
        {accountant.hand ? (
          <div style={{ position: 'absolute', left: ACCOUNTANT.left, top: ACCOUNTANT.top, width: ACCOUNTANT.width, height: 2000, clipPath: `inset(0 -400px ${2000 - (DESK.top + DESK.depth - ACCOUNTANT.top)}px -400px)` }}>
            <BustLayer width={ACCOUNTANT.width}>
              <Arm from={shoulder} to={toAccountant(accountant.hand)} bend={60} thickness={66} thumb={-1} {...ACCOUNTANT_COLORS} />
            </BustLayer>
          </div>
        ) : null}
        <Papa place={PAPA_DESK} state={papa} />
        {items}
      </CameraPath>
      <Vignette strength={0.22} />
      <Grain />
    </AbsoluteFill>
  );
};

/** The goat at the counter's cutaway, and the hook: her face, close, blurred yard behind. */
export const GoatClose: React.FC<{ goat?: GoatState; papa?: PapaState; items?: React.ReactNode }> = ({ goat = {}, papa = { face: { mouth: 'flat', look: [-0.6, 0.5] } }, items }) => (
  <Yard goat={goat} papa={papa} shots={[{ at: 0, ...SHOT.close }]} dof={5} items={items} />
);

/** Where the scrap sits on her mouth at rest, for the hook, the outro and the rewind: its angle and size. */
export const SCRAP = { angle: 10, scale: 0.55 } as const;

