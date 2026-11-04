import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useStoryFrame } from '../../shared/beat';
import { GoatClose, Papa, PapaState, SCRAP, useBlink } from '../../shared/chevre/stage';
import { CameraPath, Grain, Shot, Vignette } from '../../shared/fx';
import { useBi } from '../../shared/lang';
import { Accountant, ACCOUNTANT_COLORS, ACCOUNTANT_SHOULDERS, Arm, BustLayer, Face } from '../../shared/ui/people';
import { Counter, DeskSign, Office, Register, WallCalendar } from '../../shared/ui/places';
import { COPY } from './copy';

/**
 * Ép. 1's own place, the school's cash office (the accountant behind the
 * counter, Papa in front of it). The courtyard, the goat and Papa come from
 * the series' set, shared/chevre/stage.tsx.
 */

export { GoatClose, SCRAP };

type Pt = [number, number];

/** Papa at the counter, a little further along than in the yard. */
export const PAPA_DESK = { left: 560, top: 519, width: 560 } as const;

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
