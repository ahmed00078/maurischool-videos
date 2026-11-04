import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { NOTIFS, SENSITIVE_PUSH_BODY, fill } from '../../../shared/appCopy';
import { useBeat, useStoryFrame } from '../../../shared/beat';
import { Loupe, TOP_UNDER_BUG } from '../../../shared/chevre/marks';
import { INK, Papa, TopScrim } from '../../../shared/chevre/stage';
import { FAMILY, GRADE_TEST } from '../../../shared/demo';
import { CameraPath, Grain, Shot, Vignette } from '../../../shared/fx';
import { useBi, useLang } from '../../../shared/lang';
import { PhoneRig, Pose, screenToCanvas, Sfx, Top } from '../../../shared/rig';
import { EASE_IN_OUT, pt, SCREEN_W, tween } from '../../../shared/tokens';
import { Device } from '../../../shared/ui/Device';
import { TeaGlass } from '../../../shared/ui/desk';
import { Headline } from '../../../shared/ui/Headline';
import { INBOX_ROW, inboxRowCenter, InboxScreen } from '../../../shared/ui/inbox';
import { LockScreen, Notification } from '../../../shared/ui/LockScreen';
import { LivingRoom, RoomShade } from '../../../shared/ui/places';
import { COPY } from '../copy';
import { useInboxItems } from './Yard';

type Pt = [number, number];

/** Papa indoors, in the salon, seated on the mattress: he is not in the yard. */
const PAPA_SALON = { left: 280, top: 640, width: 520 } as const;

/** The salon at midday, Papa on the mattress, his tea on the tray in front of him. */
const Salon: React.FC<{ papa: React.ComponentProps<typeof Papa>['state']; shots: Shot[] }> = ({ papa, shots }) => {
  const g = useStoryFrame();
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#efc9a0' }}>
      <CameraPath shots={shots}>
        <LivingRoom light="morning" />
        <Papa place={PAPA_SALON} state={papa} />
        <TeaGlass x={210} y={1360} t={g / 30} />
        <RoomShade light="morning" />
      </CameraPath>
      <Vignette strength={0.22} />
      <Grain />
    </AbsoluteFill>
  );
};

/** His phone, held up to read: centre and size on the canvas. */
const PHONE = { x: 540, y: 1060, scale: 0.8 } satisfies Pose;
/** The notification on the lock screen, on the canvas: where the push goes in. */
const NOTIF = screenToCanvas(PHONE, SCREEN_W / 2, pt(300));
/** How far in the push goes: the notification nearly the frame's width. */
const PUSH = 0.85;

/** His lock screen with MauriSchool's notification: the title, and « Ouvrez MauriSchool… », never the grade. */
const Lock: React.FC<{ notifAt: number }> = ({ notifAt }) => {
  const bi = useBi();
  const { lang } = useLang();
  const n = NOTIFS.grade_published_parent;
  return (
    <LockScreen time={GRADE_TEST.time} date={GRADE_TEST.date}>
      <Notification at={notifAt} title={fill(n.title[lang], { student_name: FAMILY.son[lang] })} message={bi(SENSITIVE_PUSH_BODY)} />
    </LockScreen>
  );
};

/** The soft salon behind the phone. */
const SalonBehind: React.FC = () => (
  <AbsoluteFill style={{ filter: 'blur(16px) brightness(0.92)', scale: '1.1' }}>
    <Salon papa={{ face: { mouth: 'smile', look: [0, 0.9] } }} shots={[{ at: 0, zoom: 1.3, focus: [560, 1000], to: [540, 1000] }]} />
  </AbsoluteFill>
);

/** Buzz beats: the pocket buzzes, the phone comes up, the notification drops in, the push in on it; then it holds. */
const BZ = { words: 0.4, buzz: 0.3, lock: 1.3, notif: 1.55, push: [1.85, 2.35] } as const;

/**
 * 4 · buzz: Papa indoors, on the mattress with his tea, the same minute. His
 * pocket buzzes; his lock screen: « Note publiée — Sidi Ould Mocktar » and the
 * generic line (the grade is sensitive: a locked phone never shows it). The
 * camera goes in on the notification and holds still to the end of the scene.
 * « Papa le sait déjà. »
 */
export const BuzzScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const buzzing = frame >= b(BZ.buzz) && frame < b(BZ.buzz) + 14;
  const lockIn = spring({ frame: frame - b(BZ.lock), fps, config: { damping: 16, stiffness: 120 } });
  const push = tween(frame, [b(BZ.push[0]), b(BZ.push[1])], [0, 1], EASE_IN_OUT);
  let picture: React.ReactNode;
  if (frame < b(BZ.lock)) {
    const shake = buzzing ? Math.sin(frame * 2.6) * 6 : 0;
    const pocket: Pt = [PAPA_SALON.left + 270 * 1.3, PAPA_SALON.top + 520 * 1.3];
    picture = (
      <AbsoluteFill>
        <Salon
          papa={{ face: frame >= b(BZ.buzz) + 2 ? { mouth: 'o', brows: 1, look: [0.4, 1] } : { mouth: 'smile', brows: 0.2, look: [-0.5, 0.2] }, phone: { rise: 0.35, shake } }}
          shots={[{ at: 0, zoom: 1.35, focus: [600, 1080], to: [560, 1120] }]}
        />
        {buzzing ? (
          <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            {[0, 1].map((i) => {
              // The pocket on screen, under the camera above.
              const px = 560 + 1.35 * (pocket[0] - 600);
              const py = 1120 + 1.35 * (pocket[1] - 1080);
              return (
                <g key={i} stroke="#2a1d1a" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.7 - i * 0.25}>
                  <path d={`M ${px - 80 - i * 22} ${py - 40} q -14 30 0 60`} />
                  <path d={`M ${px + 80 + i * 22} ${py - 40} q 14 30 0 60`} />
                </g>
              );
            })}
          </svg>
        ) : null}
      </AbsoluteFill>
    );
  } else {
    const lockPose: Pose = { ...PHONE, y: PHONE.y + (1 - lockIn) * 1100, rz: (1 - lockIn) * (rtl ? -8 : 8) };
    picture = (
      <AbsoluteFill>
        <SalonBehind />
        <AbsoluteFill style={{ perspective: 2600, transformOrigin: `${NOTIF[0]}px ${NOTIF[1]}px`, scale: String(1 + PUSH * push) }}>
          <PhoneRig pose={lockPose}>
            <Device statusTone="light" statusBar glare={0.4} time={GRADE_TEST.time}>
              <Lock notifAt={b(BZ.notif)} />
            </Device>
          </PhoneRig>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      {picture}
      <TopScrim height={560} opacity={0.9} />
      <Top style={{ top: TOP_UNDER_BUG }}>
        <Headline text={bi(COPY.already)} at={b(BZ.words)} size={rtl ? 86 : 90} {...INK} />
      </Top>
      <Sfx at={b(BZ.buzz)} name="buzz" volume={0.9} />
      <Sfx at={b(BZ.lock)} name="soft-whoosh" volume={0.4} />
      <Sfx at={b(BZ.notif)} name="ding" volume={0.6} />
    </AbsoluteFill>
  );
};

/** Proof beats: the lock screen slides up, the camera settles on the row, the loupe pops on the grade; then it holds. */
const PR = { unlock: [0.15, 0.6], row: 1.0, loupe: 1.5 } as const;

/** « 17/20 » at the start of the row's message, in app points: x from the screen's left, y its middle. */
const gradePoint = (rtl: boolean): Pt => {
  const x = 16 + 4 + 14 + 40 + 12 + 14;
  return [rtl ? 390 - x : x, INBOX_ROW.top + 14 + 20 + 3 + 9];
};

/**
 * 5 · proof: he unlocks; MauriSchool's notifications, the grade on top,
 * unread, and ép. 1's payment below it (read). The camera settles on the row
 * and stops: « 17/20 en Mathématiques, 1er trimestre. Aucune action requise. »
 * A loupe pops up under it with the 17/20 big, one line high. It holds three seconds.
 */
export const ProofScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const items = useInboxItems();
  const unlock = tween(frame, [b(PR.unlock[0]), b(PR.unlock[1])], [0, 1], EASE_IN_OUT);
  const row = screenToCanvas(PHONE, pt(195), pt(inboxRowCenter(0)));
  const [gx, gy] = gradePoint(rtl);
  const grade = screenToCanvas(PHONE, pt(gx), pt(gy));
  const hold = { zoom: 2.3, focus: [row[0], row[1]] as Pt, to: [540, 880] as Pt };
  const gradeOnScreen: Pt = [hold.to[0] + hold.zoom * (grade[0] - hold.focus[0]), hold.to[1] + hold.zoom * (grade[1] - hold.focus[1])];
  // Starts where the buzz scene left the camera: pushed in on the notification.
  const start = { zoom: 1 + PUSH, focus: [NOTIF[0], NOTIF[1]] as Pt, to: [NOTIF[0], NOTIF[1]] as Pt };
  const phone = (
    <AbsoluteFill style={{ perspective: 2600 }}>
      <PhoneRig pose={PHONE}>
        <Device statusTone={unlock > 0.5 ? 'dark' : 'light'} statusBar glare={0.3} time={GRADE_TEST.time}>
          <InboxScreen items={items} emphasis={[tween(frame, [b(PR.row), b(PR.row) + 8]), 0]} />
          <div style={{ position: 'absolute', inset: 0, translate: `0 ${-unlock * 100}%` }}>
            <Lock notifAt={-100} />
          </div>
        </Device>
      </PhoneRig>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <SalonBehind />
      <CameraPath move={12} shots={[{ at: 0, ...start }, { at: b(PR.row), ...hold }]}>
        {phone}
      </CameraPath>
      <Loupe at={b(PR.loupe)} focus={[grade[0], grade[1]]} zoom={8} center={[540, 1250]} size={[560, 190]} from={gradeOnScreen}>
        {phone}
      </Loupe>
      <TopScrim height={560} opacity={0.9} />
      <Top style={{ top: TOP_UNDER_BUG }}>
        <Headline text={bi(COPY.already)} at={-100} size={rtl ? 86 : 90} {...INK} />
      </Top>
      <Sfx at={b(PR.unlock[0])} name="soft-whoosh" volume={0.35} rate={1.2} />
      <Sfx at={b(PR.loupe)} name="ding" volume={0.55} />
    </AbsoluteFill>
  );
};
