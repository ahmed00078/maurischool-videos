import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TEACHER_COPY } from '../../../shared/appCopy';
import { useBeat } from '../../../shared/beat';
import { CameraPath } from '../../../shared/fx';
import { CLASS_ROSTER } from '../../../shared/demo';
import { useBi, useLang } from '../../../shared/lang';
import { mix, PhoneRig, Pose, Scene, screenToCanvas, Sfx, Tap, Top } from '../../../shared/rig';
import { APP, tween } from '../../../shared/tokens';
import { Device } from '../../../shared/ui/Device';
import { Headline, RoleChip } from '../../../shared/ui/Headline';
import { AppToast, REGISTER_TARGETS, RegisterScreen, registerSegmentAt } from '../../../shared/ui/teacher';
import { COPY } from '../copy';

/** The teacher's phone: low enough to clear the headline, its actions above the caption zone. */
const POSE: Pose = { x: 540, y: 1085, scale: 0.72 };

/** A press that dips over a few frames around `at`, for a button under a finger. */
const press = (frame: number, at: number) => tween(frame, [at - 3, at]) * (1 - tween(frame, [at + 3, at + 9]));

/** Rows the teacher marks absent: Mariem, then Moussa. */
const ABSENT_ROWS = [2, 5];

/**
 * 3 · The register, the one moment of the app. Marking stays theirs, so we
 * made the rest simpler: it is 08:15 and there is no network; one tap on
 * "Tous présents" marks the class, two pupils are switched to absent, the
 * register is saved on the phone and will send itself when the connection
 * comes back.
 */
export const RegisterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const enter = spring({ frame: frame - b(0), fps, config: { damping: 18, stiffness: 90 } });
  const allAt = b(1.4);
  const absentAt = [b(2.2), b(2.8)];
  const saveAt = b(3.6);
  const toastAt = saveAt + 7;
  const oneTap = b(4.2);
  const pose = mix({ ...POSE, y: POSE.y! + 900, rx: 14 }, POSE, enter);
  const tapAt = (sx: number, sy: number) => screenToCanvas(POSE, sx, sy);
  const [ax, ay] = tapAt(...REGISTER_TARGETS.allPresent(rtl));
  const [sx, sy] = tapAt(...REGISTER_TARGETS.save());
  const absent = CLASS_ROSTER.map((_, i) => {
    const k = ABSENT_ROWS.indexOf(i);
    return k < 0 ? 0 : frame >= absentAt[k] ? 1 : 0;
  });
  const a = TEACHER_COPY.attendance;
  return (
    <Scene mood="paper">
      {/* In on the rows while the class is marked, back out for the save, in on the top for the offline toast. */}
      <CameraPath
        shots={[
          { at: 0, zoom: 1, focus: [540, 1085] },
          { at: allAt - 2, zoom: 1.3, focus: [540, 930], to: [540, 1000] },
          { at: saveAt - 2, zoom: 1, focus: [540, 1085] },
          { at: toastAt + 6, zoom: 1.5, focus: [540, 690], to: [540, 760] },
        ]}
      >
        <PhoneRig pose={pose}>
          <Device offline>
            <RegisterScreen
              enterFrom={b(0.3)}
              filled={tween(frame, [allAt + 2, allAt + 10], [0, 1], (t) => t)}
              absent={absent}
              allPress={press(frame, allAt)}
              savePress={press(frame, saveAt)}
              queued={frame >= saveAt + 5}
            />
            <AppToast title={bi(a.savedOffline)} message={bi(a.savedOfflineDetail)} accent={APP.success} at={toastAt} />
          </Device>
        </PhoneRig>
        <Tap x={ax} y={ay} at={allAt} size={70} />
        {ABSENT_ROWS.map((row, k) => {
          const [x, y] = tapAt(...registerSegmentAt(row, 'absent', rtl));
          return <Tap key={row} x={x} y={y} at={absentAt[k]} size={70} />;
        })}
        <Tap x={sx} y={sy} at={saveAt} size={80} />
      </CameraPath>
      <Top gap={20}>
        <RoleChip label={bi(COPY.register.chip)} icon="easel-outline" at={b(0.2)} out={oneTap - 10} tone="light" />
        <Headline text={bi(COPY.register.lighten)} at={b(0.4)} out={oneTap - 10} size={rtl ? 72 : 76} color={APP.light.text} accent={APP.brand[600]} highlight={APP.brand[100]} />
      </Top>
      <Top>
        <Headline text={bi(COPY.register.oneTap)} at={oneTap} size={rtl ? 76 : 80} color={APP.light.text} accent={APP.brand[600]} highlight={APP.brand[100]} />
      </Top>
      <Sfx at={allAt} name="mouse-click" volume={0.7} />
      <Sfx at={allAt + 3} name="soft-whoosh" volume={0.25} rate={1.6} />
      {absentAt.map((t) => (
        <Sfx key={t} at={t} name="mouse-click" volume={0.7} rate={1.1} />
      ))}
      <Sfx at={saveAt} name="mouse-click" volume={0.8} rate={0.9} />
      <Sfx at={toastAt} name="ding" volume={0.45} rate={1.2} />
    </Scene>
  );
};
