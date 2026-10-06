import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ANNOUNCEMENT_COPY, fill, NOTIFS, ROLES } from '../../../shared/appCopy';
import { useBeat } from '../../../shared/beat';
import { CLASS_ANNOUNCEMENT, FAMILY, FEES_PAYMENT, PUPIL_CLASS } from '../../../shared/demo';
import { CameraPath } from '../../../shared/fx';
import { useBi, useLang } from '../../../shared/lang';
import { PhoneRig, Pose, screenToCanvas, Sfx, Tap, Top } from '../../../shared/rig';
import { APP, EASE_IN_OUT, pt, SCREEN_W, tween } from '../../../shared/tokens';
import { AnnouncementComposerScreen, AnnouncementDraft, COMPOSER } from '../../../shared/ui/announcement';
import { Device } from '../../../shared/ui/Device';
import { Headline, PlaceTag, RoleChip } from '../../../shared/ui/Headline';
import { InboxItem, inboxRowCenter, InboxScreen } from '../../../shared/ui/inbox';
import { LockScreen, Notification } from '../../../shared/ui/LockScreen';
import { LivingRoom, Office, RoomShade } from '../../../shared/ui/places';
import { HomeScreen } from '../../../shared/ui/screens';
import { AppToast } from '../../../shared/ui/teacher';
import { COPY } from '../copy';
import { papaAt, Salon } from '../stage';
import { INK_DAY } from './List';

/** A press that dips over a few frames around `at`. */
const press = (frame: number, at: number) => tween(frame, [at - 3, at]) * (1 - tween(frame, [at + 3, at + 9]));

const POSE = { x: 540, y: 1160, scale: 0.74 } satisfies Pose;

/** Director beats: the filled form, the scroll to the recipients, send, the dialog, confirm, back home, the toast. */
const D = { out: 0.3, words: 0.55, chip: 0.7, scroll: [1.2, 2.2], tapSend: 2.9, dialog: 3.1, tapConfirm: 4.35, back: 4.6, toast: 4.8 } as const;

/**
 * 5 · director: Tuesday, the director's phone. « Nouvelle annonce », filled in:
 * « Composition de maths jeudi », « Révisez le chapitre 3… », « Par classe »,
 * 5e A, 78 recipients. « Envoyer l'annonce », « Envoyer », and back on his
 * home screen: « Annonce envoyée à 78 destinataire(s) ».
 */
export const DirectorScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { lang, rtl } = useLang();
  const draft: AnnouncementDraft = {
    title: CLASS_ANNOUNCEMENT.title[lang],
    body: CLASS_ANNOUNCEMENT.body[lang],
    audience: 'class',
    className: PUPIL_CLASS[lang],
    total: CLASS_ANNOUNCEMENT.total,
    breakdown: [...CLASS_ANNOUNCEMENT.breakdown],
  };
  const at = (sx: number, sy: number): [number, number] => [...screenToCanvas(POSE, sx, sy)];
  const scroll = tween(frame, [b(D.scroll[0]), b(D.scroll[1])], [0, 104], EASE_IN_OUT);
  const dialog = frame < b(D.back) ? spring({ frame: frame - b(D.dialog), fps, config: { damping: 18, stiffness: 190 } }) : 1 - tween(frame, [b(D.back), b(D.back) + 5]);
  // Back: the composer slides away towards the end of the line, the home screen under it.
  const leave = tween(frame, [b(D.back), b(D.back) + 9], [0, 1], EASE_IN_OUT);
  const send = at(SCREEN_W / 2, pt(COMPOSER.send));
  const [cx, cy] = COMPOSER.confirm(rtl);
  const confirm = at(cx, cy);
  const messageCard = at(SCREEN_W / 2, pt(200));
  const recipients = at(SCREEN_W / 2, pt(560));
  const toast = at(SCREEN_W / 2, pt(84));
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#f0e5cf' }}>
      {/* The school's office behind, soft */}
      <AbsoluteFill style={{ filter: 'blur(16px) brightness(0.97)', scale: '1.1' }}>
        <Office />
      </AbsoluteFill>
      <CameraPath
        move={10}
        shots={[
          { at: 0, zoom: 1, focus: [540, 1160], to: [540, 1180] },
          { at: b(0.9), zoom: 1.5, focus: messageCard, to: [540, 1060] },
          { at: b(D.scroll[1]), zoom: 1.55, focus: recipients, to: [540, 1100] },
          { at: b(D.tapSend) - 2, zoom: 1.1, focus: [540, 1240], to: [540, 1180] },
          { at: b(D.dialog) + 8, zoom: 1.5, focus: at(SCREEN_W / 2, pt(470)), to: [540, 1080] },
          { at: b(D.back) + 2, zoom: 1.15, focus: [540, 1160], to: [540, 1180] },
          { at: b(D.toast) + 8, zoom: 1.7, focus: toast, to: [540, 780] },
        ]}
      >
        <AbsoluteFill style={{ perspective: 2600 }}>
          <PhoneRig pose={POSE}>
            <Device glare={0.3} time="18:04">
              {frame >= b(D.back) ? <HomeScreen /> : null}
              {leave < 1 ? (
                <div style={{ position: 'absolute', inset: 0, translate: `${leave * (rtl ? -100 : 100)}% 0px`, boxShadow: leave > 0 ? '0 0 40px rgba(0,0,0,0.2)' : undefined }}>
                  <AnnouncementComposerScreen draft={draft} scroll={scroll} sendPress={press(frame, b(D.tapSend))} dialog={frame >= b(D.dialog) ? dialog : 0} confirmPress={press(frame, b(D.tapConfirm))} />
                </div>
              ) : null}
              <AppToast title={fill(bi(ANNOUNCEMENT_COPY.successToast), { count: draft.total })} accent={APP.success} at={b(D.toast)} />
            </Device>
          </PhoneRig>
          <Tap x={send[0]} y={send[1]} at={b(D.tapSend)} size={64} />
          <Tap x={confirm[0]} y={confirm[1]} at={b(D.tapConfirm)} size={60} />
        </AbsoluteFill>
      </CameraPath>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 640, background: 'linear-gradient(180deg, rgba(255,250,240,0.96) 0%, rgba(255,250,240,0.85) 55%, rgba(255,250,240,0) 100%)' }} />
      <Top gap={18}>
        {frame < b(D.out) + 12 ? <Headline text={bi(COPY.rewind)} at={-100} out={b(D.out)} size={rtl ? 80 : 84} {...INK_DAY} /> : null}
        {frame >= b(D.words) ? <Headline text={bi(COPY.one)} at={b(D.words)} size={rtl ? 76 : 80} {...INK_DAY} /> : null}
        {frame >= b(D.chip) ? <RoleChip label={bi(ROLES.schoolAdmin)} icon="business-outline" at={b(D.chip)} out={b(2.5)} tone="light" /> : null}
      </Top>
      <Sfx at={b(D.words)} name="soft-whoosh" volume={0.3} />
      <Sfx at={b(D.scroll[0])} name="flick" volume={0.25} rate={0.8} />
      <Sfx at={b(D.tapSend)} name="mouse-click" volume={0.75} />
      <Sfx at={b(D.dialog)} name="pop" volume={0.35} rate={1.2} />
      <Sfx at={b(D.tapConfirm)} name="mouse-click" volume={0.8} rate={0.95} />
      <Sfx at={b(D.back)} name="whoosh" volume={0.3} rate={1.4} />
      <Sfx at={b(D.toast)} name="ding" volume={0.5} />
    </AbsoluteFill>
  );
};

/** Same-day beats: the pocket buzzing, the lock screen, the notification, the push in, the tap, the inbox. */
const S = { tag: [0.05, 0.95], buzz: 0.15, lock: 1.0, chip: 1.1, notif: 1.35, words: 1.6, push: [2.0, 2.8], unpush: [3.5, 3.85], tap: 3.95, inbox: 4.15, row: 4.6 } as const;
const PHONE = { x: 540, y: 1100, scale: 0.8 } satisfies Pose;

/**
 * 6 · sameday: Tuesday, 18:04, Papa at home. His pocket buzzes; the lock
 * screen shows the announcement, its title and its text (it is not sensitive,
 * so all of it shows). A tap: his notifications, the announcement on top,
 * megaphone in a filled tile, 18:04.
 */
export const SameDayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { lang, rtl } = useLang();
  const title = CLASS_ANNOUNCEMENT.title[lang];
  const body = CLASS_ANNOUNCEMENT.body[lang];
  const n = (key: 'payment_received' | 'payment_reminder', params: Record<string, string>) => ({ title: fill(NOTIFS[key].title[lang], params), message: fill(NOTIFS[key].message[lang], params) });
  // The inbox this evening: the announcement, and last week's payment and its reminder (formatDate: more than six days ago).
  const items: InboxItem[] = [
    { category: 'announcements', elevated: true, time: CLASS_ANNOUNCEMENT.time, title, message: body },
    { category: 'finance', unread: false, time: FEES_PAYMENT.date, ...n('payment_received', { student_name: FAMILY.son[lang], amount: FEES_PAYMENT.amountText, receipt_number: FEES_PAYMENT.receipt }) },
    { category: 'finance', unread: false, time: FEES_PAYMENT.date, ...n('payment_reminder', { student_name: FAMILY.son[lang], due_date: FEES_PAYMENT.reminder.due, amount_due: FEES_PAYMENT.amountText, invoice_number: FEES_PAYMENT.invoice }) },
  ];
  const buzzing = frame >= b(S.buzz) && frame < b(S.lock) - 2;
  const lockIn = spring({ frame: frame - b(S.lock), fps, config: { damping: 16, stiffness: 120 } });
  const lockPose: Pose = { ...PHONE, y: PHONE.y + (1 - lockIn) * 1100, rz: (1 - lockIn) * (rtl ? -8 : 8) };
  const push = tween(frame, [b(S.push[0]), b(S.push[1])], [0, 1], EASE_IN_OUT) * (1 - tween(frame, [b(S.unpush[0]), b(S.unpush[1])], [0, 1], EASE_IN_OUT));
  const [nx, ny] = screenToCanvas(PHONE, SCREEN_W / 2, pt(300));
  const opened = spring({ frame: frame - b(S.inbox), fps, config: { damping: 18, stiffness: 170 } });
  const inInbox = frame >= b(S.inbox);
  const emphasis = tween(frame, [b(S.row), b(S.row) + 8]);
  const row = screenToCanvas(PHONE, SCREEN_W / 2, pt(inboxRowCenter(0)));

  let picture: React.ReactNode;
  if (frame < b(S.lock)) {
    const pocketAt = papaAt([270, 520]);
    const shake = buzzing ? Math.sin(frame * 2.6) * 6 : 0;
    picture = (
      <Salon
        light="dusk"
        papa={{ face: { mouth: buzzing ? 'o' : 'smile', brows: buzzing ? 1 : 0.4, look: [0.4, 1] }, pocket: { rise: 0.35, shake } }}
        shots={[{ at: 0, zoom: 1.6, focus: pocketAt, to: [620, 1180] }]}
        items={
          buzzing ? (
            <svg width="1080" height="1920" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
              {[0, 1].map((i) => (
                <g key={i} stroke="#2a1d1a" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.7 - i * 0.25}>
                  <path d={`M ${pocketAt[0] - 80 - i * 22} ${pocketAt[1] - 40} q -14 30 0 60`} />
                  <path d={`M ${pocketAt[0] + 80 + i * 22} ${pocketAt[1] - 40} q 14 30 0 60`} />
                </g>
              ))}
            </svg>
          ) : null
        }
      />
    );
  } else {
    picture = (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <AbsoluteFill style={{ filter: 'blur(16px) brightness(0.92)', scale: '1.1' }}>
          <LivingRoom light="dusk" />
          <RoomShade light="dusk" />
        </AbsoluteFill>
        <CameraPath shots={[{ at: 0, zoom: 1, focus: [540, 1100] }, { at: b(S.row) + 10, zoom: 1.75, focus: row as [number, number], to: [540, 1060] }]} move={12}>
          <AbsoluteFill style={{ perspective: 2600, transformOrigin: `${nx}px ${ny}px`, scale: String(1 + 0.42 * push) }}>
            <PhoneRig pose={lockPose}>
              <Device statusTone={inInbox && opened > 0.5 ? 'dark' : 'light'} statusBar glare={0.4} time={CLASS_ANNOUNCEMENT.time}>
                <LockScreen time={CLASS_ANNOUNCEMENT.time} date={COPY.lockDate}>
                  <Notification at={b(S.notif)} title={title} message={body} />
                </LockScreen>
                {inInbox ? (
                  <div style={{ position: 'absolute', inset: 0, opacity: Math.min(1, opened * 3), scale: String(0.86 + 0.14 * opened), transformOrigin: `50% ${pt(300)}px` }}>
                    <InboxScreen items={items} emphasis={[emphasis]} />
                  </div>
                ) : null}
              </Device>
            </PhoneRig>
            <Tap x={nx} y={ny} at={b(S.tap)} size={70} />
          </AbsoluteFill>
        </CameraPath>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      {picture}
      {frame >= b(S.lock) ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 640, background: 'linear-gradient(180deg, rgba(255,246,236,0.95) 0%, rgba(255,246,236,0.82) 55%, rgba(255,246,236,0) 100%)' }} />
      ) : null}
      <Top gap={18}>
        {frame < b(S.lock) ? <PlaceTag text={bi(COPY.tags.tuesday1804)} at={b(S.tag[0])} out={b(S.tag[1])} /> : null}
        {frame >= b(S.words) ? <Headline text={bi(COPY.sameDay)} at={b(S.words)} size={rtl ? 80 : 84} {...INK_DAY} /> : null}
        {frame >= b(S.chip) ? <RoleChip label={bi(ROLES.parent)} icon="person" at={b(S.chip)} tone="light" /> : null}
      </Top>
      <Sfx at={b(S.buzz)} name="buzz" volume={0.9} />
      <Sfx at={b(S.lock)} name="soft-whoosh" volume={0.4} />
      <Sfx at={b(S.notif)} name="ding" volume={0.6} />
      <Sfx at={b(S.tap)} name="mouse-click" volume={0.75} />
      <Sfx at={b(S.inbox)} name="soft-whoosh" volume={0.3} rate={1.3} />
    </AbsoluteFill>
  );
};

