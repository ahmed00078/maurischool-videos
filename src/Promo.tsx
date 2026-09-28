import React from 'react';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { S1Hook } from './scenes/S1Hook';
import { S2Chaos } from './scenes/S2Chaos';
import { S3Logo } from './scenes/S3Logo';
import { S4Fees } from './scenes/S4Fees';
import { S5Attendance } from './scenes/S5Attendance';
import { S6Grades } from './scenes/S6Grades';
import { S7Trust } from './scenes/S7Trust';
import { S8Cta } from './scenes/S8Cta';
import { Soundtrack } from './Soundtrack';
import { T } from './theme';

// Scene lengths in frames at 30 fps. Retime these to the recorded voice.
export const SCENES = [
  { id: 'S1-Hook', component: S1Hook, frames: 110 },
  { id: 'S2-Chaos', component: S2Chaos, frames: 130 },
  { id: 'S3-Logo', component: S3Logo, frames: 102 },
  { id: 'S4-Fees', component: S4Fees, frames: 162 },
  { id: 'S5-Attendance', component: S5Attendance, frames: 132 },
  { id: 'S6-Grades', component: S6Grades, frames: 132 },
  { id: 'S7-Trust', component: S7Trust, frames: 100 },
  { id: 'S8-Cta', component: S8Cta, frames: 116 },
];

export const TOTAL = SCENES.reduce((sum, s) => sum + s.frames, 0) - (SCENES.length - 1) * T;

// Scene changes: fade by default, a slide where the story moves from one feature to the next.
const transitionAfter = (i: number) => (i >= 2 && i <= 4 ? slide({ direction: 'from-bottom' }) : fade());

export const Promo: React.FC = () => (
  <>
    <Soundtrack frames={SCENES.map((s) => s.frames)} />
    <TransitionSeries>
      {SCENES.flatMap((s, i) => {
        const Scene = s.component;
        const seq = (
          <TransitionSeries.Sequence key={s.id} name={s.id} durationInFrames={s.frames}>
            <Scene />
          </TransitionSeries.Sequence>
        );
        if (i === SCENES.length - 1) return [seq];
        return [
          seq,
          <TransitionSeries.Transition
            key={`${s.id}-t`}
            presentation={transitionAfter(i)}
            timing={linearTiming({ durationInFrames: T })}
          />,
        ];
      })}
    </TransitionSeries>
  </>
);
