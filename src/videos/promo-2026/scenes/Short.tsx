import React from 'react';
import { AbsoluteFill, Freeze, interpolate, useCurrentFrame } from 'remotion';
import { fill, NOTIFS } from '../../../shared/appCopy';
import { LeadContext, useBeat } from '../../../shared/beat';
import { PUPIL, PUPIL_CLASS, TODAY } from '../../../shared/demo';
import { Camera, Vhs } from '../../../shared/fx';
import { useBi, useLang } from '../../../shared/lang';
import { PhoneRig, Scene, Sfx, Top } from '../../../shared/rig';
import { SoundContext } from '../../../shared/sound';
import { APP, BEAT, clamp, tween } from '../../../shared/tokens';
import { Device } from '../../../shared/ui/Device';
import { Headline } from '../../../shared/ui/Headline';
import { LockScreen, Notification } from '../../../shared/ui/LockScreen';
import { COPY } from '../copy';
import { AttendanceScene, buzz, NOTIFICATION_FOCUS } from './Act2';

/** Alert beats: the second line, a second buzz, the rewind. */
const A = { line2: 0.6, buzz2: 2.6, rew: 4.5, end: 6 } as const;

/** The attendance scene's beats the rewind runs back through: its last shot, back to the teacher's register. */
const BACK = { from: 9, to: 1 } as const;

/**
 * The short cut's opening: the end of the story first. The father's lock
 * screen, pushed in exactly as the attendance scene ends, already shows
 * « Absence enregistrée — Mariem » on frame 0, so the first frame is the
 * thumbnail; the phone buzzes and « Son père le sait déjà. » lands. Then the
 * tape rewinds through the attendance scene to the teacher's register, and
 * the next scene plays it forward.
 */
export const AlertScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const n = NOTIFS.absence_marked;
  const params = { student_name: bi(PUPIL), date: TODAY, class_name: bi(PUPIL_CLASS) };
  const rewinding = frame >= b(A.rew);
  let picture: React.ReactNode;
  if (!rewinding) {
    picture = (
      <Scene mood="paper">
        <Camera drift={0.03} push={[-2, -1, 1.28]} focus={[NOTIFICATION_FOCUS[0], NOTIFICATION_FOCUS[1]]} shift={[0, 230]}>
          <PhoneRig pose={{ rz: buzz(frame, 0) + buzz(frame, b(A.buzz2)) }}>
            <Device statusTone="light">
              <LockScreen>
                <Notification at={-30} title={fill(bi(n.title), params)} message={fill(bi(n.message), params)} />
              </LockScreen>
            </Device>
          </PhoneRig>
        </Camera>
        <Top gap={8}>
          <Headline text={bi(COPY.alert.line1)} at={-100} size={rtl ? 76 : 78} color={APP.light.text} />
          <Headline text={bi(COPY.alert.line2)} at={b(A.line2)} size={rtl ? 76 : 78} color={APP.light.text} accent={APP.brand[600]} highlight={APP.brand[100]} />
        </Top>
      </Scene>
    );
  } else {
    // The attendance scene backwards, silent, about five times as fast.
    const f = Math.round(interpolate(frame, [b(A.rew), b(A.end)], [BACK.from * BEAT, BACK.to * BEAT], clamp));
    picture = (
      <SoundContext.Provider value={{ silent: true }}>
        <LeadContext.Provider value={0}>
          <Freeze frame={f}>
            <AttendanceScene />
          </Freeze>
        </LeadContext.Provider>
      </SoundContext.Provider>
    );
  }
  return (
    <AbsoluteFill>
      <Vhs amount={rewinding ? 1 : tween(frame, [b(A.rew) - 3, b(A.rew)])} osd={rewinding ? 'rew' : null}>
        {picture}
      </Vhs>
      <Sfx at={0} name="buzz" volume={0.8} />
      <Sfx at={2} name="ding" volume={0.9} />
      <Sfx at={b(A.line2)} name="soft-whoosh" volume={0.4} />
      <Sfx at={b(A.buzz2)} name="buzz" volume={0.6} />
      <Sfx at={b(A.rew)} name="rewind" volume={0.75} length={b(A.end) - b(A.rew)} />
    </AbsoluteFill>
  );
};

/** The tape plays again: the first frames of the scene after a rewind clear up under a blinking ▶. */
export const PlayIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <Vhs amount={1 - tween(frame, [2, 10])} osd={frame < 14 ? 'play' : null}>
      {children}
    </Vhs>
  );
};
