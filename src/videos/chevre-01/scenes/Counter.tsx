import React from 'react';
import { AbsoluteFill, Freeze, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { NOTIFS, ROLES, SENSITIVE_PUSH_BODY, fill } from '../../../shared/appCopy';
import { LeadContext, StoryClock, useBeat } from '../../../shared/beat';
import { FAMILY, FEES_PAYMENT } from '../../../shared/demo';
import { CameraPath, SAFE, Vhs } from '../../../shared/fx';
import { useBi, useLang } from '../../../shared/lang';
import { PhoneRig, Pose, screenToCanvas, Sfx, Tap, Top } from '../../../shared/rig';
import { SoundContext } from '../../../shared/sound';
import { BEAT, clamp, EASE_IN, EASE_IN_OUT, pt, SCREEN_H, SCREEN_W, tween } from '../../../shared/tokens';
import { Device } from '../../../shared/ui/Device';
import { Headline, RoleChip } from '../../../shared/ui/Headline';
import { SpeechBubble, Stamp } from '../../../shared/ui/lineup';
import { LockScreen, Notification } from '../../../shared/ui/LockScreen';
import { Envelope, PaperReceipt, ReceiptSheet } from '../../../shared/ui/paper';
import { PaymentScreen } from '../../../shared/ui/screens2';
import { COPY } from '../copy';
import { TOP_UNDER_BUG } from '../../../shared/chevre/marks';
import { goatMouth, papaAt, PapaState } from '../../../shared/chevre/stage';
import { AccountantState, accountantAt, Desk, GoatClose, PAGE_HAND, PAPA_DESK, SCRAP } from '../stage';
import { TIMELINE } from '../timeline';
import { Chewing, INK, TopScrim } from './Yard';

/** Where a speech bubble sits: under the tag, clamped in the safe band, its tail on the speaker's head. */
const BUBBLE = { top: TOP_UNDER_BUG + 80, width: 640 };
const bubbleX = (headX: number) => Math.max(SAFE.side + BUBBLE.width / 2 + 10, Math.min(1080 - SAFE.right - BUBBLE.width / 2, headX));
const ACCOUNTANT_HEAD = accountantAt([200, 268]);
const PAPA_HEAD = papaAt(PAPA_DESK, [200, 236]);

/** A mouth that moves while someone speaks. */
const talking = (frame: number, [a, z]: [number, number]) => (frame >= a && frame < z ? { mouth: 'talk' as const, open: 0.2 + 0.8 * Math.abs(Math.sin(frame * 0.6)) } : {});

/** A small caption in a dark pill: where and when we are. */
const Tag: React.FC<{ text: string; at: number; out?: number }> = ({ text, at, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { font, dir, rtl } = useLang();
  const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 160 } });
  const leave = out === undefined ? 0 : tween(frame, [out, out + 8], [0, 1], EASE_IN);
  return (
    <div
      dir={dir}
      style={{
        padding: rtl ? '6px 28px 12px' : '10px 28px',
        borderRadius: 999,
        background: 'rgba(30,22,18,0.82)',
        color: '#fff4dc',
        fontFamily: font,
        fontWeight: 700,
        fontSize: 40,
        fontStyle: rtl ? 'normal' : 'italic',
        opacity: Math.min(1, p * 1.5) * (1 - leave),
        scale: String(0.85 + 0.15 * p),
      }}
    >
      {text}
    </div>
  );
};

/** Counter beats: her question, his answer, the pages, the cut to the goat, the stamp. */
// PREUVE : 0 lands at 5.7 and holds two seconds, to the end of the scene.
const C = { ask: [0.3, 1.9], askTalk: [0.4, 1.4], paid: [1.9, 3.5], paidTalk: [2.0, 3.0], flip: [3.5, 4.5], look: 4.5, goat: [4.5, 5.5], stamp: 5.7 } as const;
const PAGES = 3;
/** The counter scene on the video's clock, for the rewind that plays it backwards. */
const COUNTER = TIMELINE.find((s) => s.id === 'counter')!;

/**
 * 2 · counter, a month later: the accountant asks for the receipt, politely.
 * Papa: « J'ai déjà payé ! », and it is true. She looks through the register,
 * page after page. Cut to the goat: a month on, she is down to the last two
 * digits. Back at the counter, the stamp: PREUVE : 0.
 */
export const CounterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const flip = interpolate(frame, [b(C.flip[0]), b(C.flip[1])], [0, PAGES], { ...clamp, easing: EASE_IN_OUT });
  const flipping = frame >= b(C.flip[0]) && frame < b(C.flip[1]);
  const t = flip % 1;
  const hand: [number, number] | undefined = flipping
    ? [PAGE_HAND.right[0] + (PAGE_HAND.left[0] - PAGE_HAND.right[0]) * t, PAGE_HAND.right[1] - Math.sin(t * Math.PI) * 60]
    : undefined;
  const stamped = frame >= b(C.stamp);
  const accountant: AccountantState = {
    face: stamped
      ? { mouth: 'flat', worry: 0.7, brows: 0.3, look: [0.8, 0] }
      : frame >= b(C.look)
        ? { mouth: 'flat', worry: 0.6, brows: 0.5, look: [0.8, 0] }
        : flipping || frame >= b(C.flip[0]) - 4
          ? { mouth: 'flat', brows: 0.1, look: [0.2, 0.9] }
          : { mouth: 'smile', brows: 0.3, look: [0.8, 0], ...talking(frame, [b(C.askTalk[0]), b(C.askTalk[1])]) },
    tilt: flipping ? 4 : 0,
    hand,
  };
  // His hand comes up, open, with « J'ai déjà payé ! », and goes down again.
  const gesture = tween(frame, [b(C.paid[0]), b(C.paid[0]) + 7]) * (1 - tween(frame, [b(C.paid[1]) - 4, b(C.paid[1]) + 4]));
  const papa: PapaState = {
    face: stamped
      ? { mouth: 'wobble', worry: 1, sweat: 1, brows: 0.4, look: [-0.6, 0.1] }
      : frame >= b(C.paid[0])
        ? { mouth: 'smile', brows: 0.8, worry: 0.4, look: [-0.8, 0.1], ...talking(frame, [b(C.paidTalk[0]), b(C.paidTalk[1])]) }
        : frame >= b(C.ask[0]) + 8
          ? { mouth: 'o', brows: 0.9, worry: 0.3, look: [-0.8, 0] }
          : { mouth: 'smile', look: [-0.8, 0] },
    tilt: stamped ? 3 : 0,
    left: gesture > 0.01 ? { to: [20 + 40 * (1 - gesture), 600 + 500 * (1 - gesture)], bend: -40 } : undefined,
  };
  if (frame >= b(C.goat[0]) && frame < b(C.goat[1])) {
    return (
      <AbsoluteFill>
        {/* A month on, she is down to the serial's last two digits. */}
        <GoatClose goat={{ paper: { node: <ReceiptSheet scrap="crumb" bitten />, ...SCRAP } }} />
        <Chewing from={C.goat[0]} to={C.goat[1]} volume={0.6} />
      </AbsoluteFill>
    );
  }
  const hit = stamped ? Math.max(0, 1 - (frame - b(C.stamp)) / 12) : 0;
  const pages = Array.from({ length: PAGES }, (_, i) => b(C.flip[0]) + ((b(C.flip[1]) - b(C.flip[0])) * i) / PAGES);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ translate: `${Math.sin(frame * 3.1) * 14 * hit}px ${Math.cos(frame * 2.7) * 10 * hit}px` }}>
        <Desk accountant={accountant} papa={papa} flip={flip} month="later" />
      </AbsoluteFill>
      <Top gap={0} style={{ top: TOP_UNDER_BUG }}>
        <Tag text={bi(COPY.later)} at={b(0.1)} out={b(C.stamp) - 8} />
      </Top>
      <SpeechBubble text={bi(COPY.askReceipt)} at={b(C.ask[0])} out={b(C.ask[1])} tailX={ACCOUNTANT_HEAD[0]} x={bubbleX(ACCOUNTANT_HEAD[0])} top={BUBBLE.top} width={BUBBLE.width} />
      <SpeechBubble text={bi(COPY.paid)} at={b(C.paid[0])} out={b(C.paid[1])} tailX={PAPA_HEAD[0]} x={bubbleX(PAPA_HEAD[0])} top={BUBBLE.top} width={BUBBLE.width} />
      {/* PREUVE : 0, in the middle of the frame */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: 540, top: 1180, width: 0, height: 0 }}>
          <Stamp kind="zero" label={bi(COPY.stamp)} at={b(C.stamp)} size={108} />
        </div>
      </AbsoluteFill>
      <Sfx at={b(C.ask[0])} name="pop" volume={0.5} />
      <Sfx at={b(C.paid[0])} name="pop" volume={0.5} rate={1.1} />
      {pages.map((p, i) => (
        <Sfx key={i} at={p} name="paper" volume={0.65} rate={0.95 + i * 0.05} />
      ))}
      <Sfx at={b(C.stamp) - 1} name="stamp" volume={1} />
    </AbsoluteFill>
  );
};

/** Rewind beats: the counter backwards, then her mouth giving the receipt back, then payday. */
const R = { counter: [0, 1.0], goat: [1.0, 2.0], play: 2.0, clear: 2.35, words: 2.15 } as const;

/**
 * 3 · rewind: the tape runs back. The stamp lifts, the pages turn back, the
 * scrap comes out of her mouth and flies up whole, back to Papa's hand; and
 * the counter again, on payday. « Même jour. Avec MauriSchool. »
 */
export const RewindScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const amount = frame < b(R.play) ? 1 : 1 - tween(frame, [b(R.play), b(R.clear)]);
  const osd = frame < b(R.play) ? 'rew' : frame < b(R.clear) + 6 ? 'play' : null;
  let picture: React.ReactNode;
  if (frame < b(R.counter[1])) {
    // The counter scene, played backwards from its last frame to its pages, three times as fast.
    const counterFrom = COUNTER.beats * BEAT - 1;
    const counterTo = b(C.flip[0]);
    const f = Math.round(interpolate(frame, [0, b(R.counter[1])], [counterFrom, counterTo], clamp));
    picture = (
      <SoundContext.Provider value={{ silent: true }}>
        <LeadContext.Provider value={0}>
          <StoryClock.Provider value={COUNTER.cutBeat * BEAT}>
            <Freeze frame={f}>
              <CounterScene />
            </Freeze>
          </StoryClock.Provider>
        </LeadContext.Provider>
      </SoundContext.Provider>
    );
  } else if (frame < b(R.goat[1])) {
    // Her mouth, backwards: the scrap slides out whole, then the sheet flies up out of the frame.
    const u = tween(frame, [b(R.goat[0]), b(R.goat[0]) + 12], [0, 1], (x) => x);
    const whole = u > 0.45;
    const crumb = u < 0.2;
    const fly = tween(frame, [b(R.goat[0]) + 12, b(R.goat[1])], [0, 1], EASE_IN);
    const mouth = goatMouth();
    const w = 160;
    picture = (
      <GoatClose
        goat={{
          chew: -(frame / 15) * 3,
          open: fly > 0 ? 0.6 * (1 - fly) : 0.2 * u,
          lids: 0.35,
          paper: fly > 0 ? undefined : { node: <g transform={`translate(${u * 40} 0)`}>{<ReceiptSheet scrap={whole ? false : crumb ? 'crumb' : true} bitten />}</g>, angle: SCRAP.angle + u * 8, scale: SCRAP.scale },
        }}
        items={
          fly > 0 ? (
            <div style={{ position: 'absolute', left: mouth[0] + 10 + fly * 260, top: mouth[1] - 60 - fly * 520, rotate: `${18 - fly * 70}deg` }}>
              <PaperReceipt width={w} />
            </div>
          ) : null
        }
      />
    );
  } else {
    picture = <Payday />;
  }
  return (
    <AbsoluteFill>
      <Vhs amount={amount} osd={osd}>
        {picture}
      </Vhs>
      {frame >= b(R.play) ? (
        <>
          <TopScrim opacity={tween(frame, [b(R.play), b(R.words) + 4])} height={720} />
          <Top style={{ top: TOP_UNDER_BUG }}>
            <Headline text={bi(COPY.rewind)} at={b(R.words)} size={rtl ? 78 : 84} {...INK} />
          </Top>
        </>
      ) : null}
      <Sfx at={0} name="rewind" volume={0.75} length={b(R.play)} />
      <Sfx at={b(R.play)} name="switch" volume={0.7} />
      <Sfx at={b(R.words)} name="soft-whoosh" volume={0.3} />
    </AbsoluteFill>
  );
};

/** The counter on payday, at rest: both smiling, the envelope's corner in his pocket. */
const Payday: React.FC = () => (
  <Desk accountant={{ face: { mouth: 'smile', brows: 0.3, look: [0.8, 0] } }} papa={{ face: { mouth: 'smile', brows: 0.3, look: [-0.8, 0] }, envelope: 0 }} month="payday" />
);

/** Pay beats: the envelope, the phone, the typing, the save, the buzz in his pocket, the lock screen. */
const P = {
  words: 1.5,
  envelope: [0.1, 0.5],
  grab: [0.45, 0.7],
  give: [0.8, 1.3],
  phone: 1.6,
  type: [2.2, 3.0],
  save: 3.5,
  buzz: 4.1,
  lock: 4.8,
  notif: 5.1,
  // In on the notification, then it holds still to the end of the scene: two seconds to read it.
  push: [5.5, 6.1],
} as const;
const PHONE = { x: 540, y: 1020, scale: 0.8 } satisfies Pose;

/**
 * 4 · pay: the same counter, the same day. Papa hands over the envelope; the
 * accountant records the payment on her phone (« Enregistrer un paiement »,
 * 7 500, the button); Papa's pocket buzzes, and his lock screen shows the
 * notification: the title and the generic message, never the amount.
 */
export const PayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { lang, rtl } = useLang();

  // ── the envelope, from his pocket to the counter ──
  const rise = tween(frame, [b(P.envelope[0]), b(P.envelope[1])]);
  const grab = tween(frame, [b(P.grab[0]), b(P.grab[1])], [0, 1], EASE_IN_OUT);
  const give = tween(frame, [b(P.give[0]), b(P.give[1])], [0, 1], EASE_IN_OUT);
  const retract = tween(frame, [b(P.give[1]) + 3, b(P.phone)], [0, 1], EASE_IN_OUT);
  const inPocket = frame < b(P.grab[1]);
  const rest: [number, number] = [60, 1150];
  const pocket: [number, number] = [262, 470];
  const counter: [number, number] = [-40, 650];
  const handAt = (): [number, number] => {
    if (frame < b(P.grab[1])) return [rest[0] + (pocket[0] - rest[0]) * grab, rest[1] + (pocket[1] - rest[1]) * grab];
    if (frame < b(P.give[1]) + 3) return [pocket[0] + (counter[0] - pocket[0]) * give, pocket[1] + (counter[1] - pocket[1]) * give - Math.sin(give * Math.PI) * 60];
    return [counter[0] + (rest[0] - counter[0]) * retract, counter[1] + (rest[1] - counter[1]) * retract];
  };
  const hand = handAt();
  const [ex, ey] = papaAt(PAPA_DESK, frame < b(P.give[1]) + 3 ? hand : counter);
  const envelopeW = 150;
  const onCounter = frame >= b(P.give[1]) + 3;

  const deskShot = frame < b(P.phone);
  const accountant: AccountantState = {
    face: { mouth: frame >= b(P.give[1]) ? 'grin' : 'smile', brows: 0.4, look: frame >= b(P.give[0]) ? [0.5, 0.7] : [0.8, 0] },
    tilt: frame >= b(P.give[1]) ? -4 : 0,
  };
  const papa: PapaState = {
    face: { mouth: 'smile', brows: 0.4, look: frame >= b(P.give[0]) ? [-0.7, 0.5] : [0.2, 0.9] },
    envelope: inPocket ? rise : undefined,
    left: grab > 0.01 && retract < 0.99 ? { to: hand, bend: -30 } : undefined,
  };
  const envelope = (
    <div style={{ position: 'absolute', left: ex - envelopeW / 2, top: ey - 50, rotate: onCounter ? '-6deg' : '-14deg' }}>
      <Envelope width={envelopeW} label={bi({ fr: 'Scolarité', ar: 'رسوم الدراسة' })} labelFont={lang === 'ar' ? 'Tajawal' : 'Outfit'} />
    </div>
  );

  // ── her phone ──
  const phoneIn = spring({ frame: frame - b(P.phone), fps, config: { damping: 17, stiffness: 110 } });
  const phonePose: Pose = { ...PHONE, y: PHONE.y + (1 - phoneIn) * 1000, rx: (1 - phoneIn) * 18 };
  const typed = tween(frame, [b(P.type[0]), b(P.type[1])], [0, 1], (x) => x);
  const press = tween(frame, [b(P.save) - 3, b(P.save)]) * (1 - tween(frame, [b(P.save) + 3, b(P.save) + 9]));
  const done = frame >= b(P.save) + 4 ? 1 : 0;
  // The fingertip lands beside the button's label, which stays readable.
  const [bx, by] = screenToCanvas(PHONE, SCREEN_W * (rtl ? 0.24 : 0.76), SCREEN_H - pt(60));

  // ── his pocket, then his lock screen ──
  const buzzing = frame >= b(P.buzz) + 2 && frame < b(P.buzz) + 14;
  const lockIn = spring({ frame: frame - b(P.lock), fps, config: { damping: 16, stiffness: 120 } });
  const push = tween(frame, [b(P.push[0]), b(P.push[1])], [0, 1], EASE_IN_OUT);

  let picture: React.ReactNode;
  if (deskShot) {
    picture = <Desk accountant={accountant} papa={papa} month="payday" items={frame >= b(P.grab[1]) ? envelope : null} />;
  } else if (frame < b(P.buzz)) {
    // Over her shoulder: the phone in front of a soft office.
    picture = (
      <AbsoluteFill>
        <AbsoluteFill style={{ filter: 'blur(14px) brightness(0.92)', scale: '1.08' }}>
          <Desk accountant={{ face: { mouth: 'smile', look: [0, 0.9] } }} papa={{ face: { mouth: 'smile', look: [-0.6, 0.3] } }} month="payday" items={envelope} />
        </AbsoluteFill>
        {/* In on Sidi's invoice and the amount while she types, then down to the button, the amount still in the frame. */}
        <CameraPath
          move={12}
          shots={[
            { at: 0, zoom: 1.3, focus: [540, 1020], to: [500, 1040] },
            { at: b(P.type[0]), zoom: 1.75, focus: [...screenToCanvas(PHONE, SCREEN_W / 2, pt(250))], to: [500, 880] },
            { at: b(P.save) - 5, zoom: 1.5, focus: [540, by], to: [500, 1380] },
          ]}
        >
          <AbsoluteFill style={{ perspective: 2600 }}>
            <PhoneRig pose={phonePose}>
              <Device glare={0.35} time="10:24">
                <PaymentScreen enterFrom={b(P.phone) + 2} value={FEES_PAYMENT.amount} typed={typed} press={press} done={done} pupil={FAMILY.son} pupilClass={FAMILY.terms.son.className} due={FEES_PAYMENT.amount} />
              </Device>
            </PhoneRig>
            <Tap x={bx} y={by} at={b(P.save)} />
          </AbsoluteFill>
        </CameraPath>
        <Top style={{ top: TOP_UNDER_BUG }}>
          <RoleChip label={bi(ROLES.accountant)} icon="cash-outline" at={b(P.phone) + 4} out={b(P.save) - 16} tone="light" />
        </Top>
      </AbsoluteFill>
    );
  } else if (frame < b(P.lock)) {
    // His chest, close: the phone jumps in the pocket.
    const shake = buzzing ? Math.sin(frame * 2.6) * 6 : 0;
    const pocketAt = papaAt(PAPA_DESK, [270, 520]);
    picture = (
      <Desk
        accountant={{ face: { mouth: 'smile', look: [0.8, 0] } }}
        papa={{ face: { mouth: buzzing ? 'o' : 'smile', brows: buzzing ? 1 : 0.4, look: [0.4, 1] }, phone: { rise: 0.35, shake } }}
        month="payday"
        shots={[{ at: 0, zoom: 1.7, focus: pocketAt, to: [620, 1180] }]}
        items={
          buzzing ? (
            <svg width="1080" height="1920" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
              {[0, 1].map((i) => (
                <g key={i} stroke="#2a1d1a" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.7 - i * 0.25}>
                  <path d={`M ${pocketAt[0] - 70 - i * 22} ${pocketAt[1] - 40} q -14 30 0 60`} />
                  <path d={`M ${pocketAt[0] + 70 + i * 22} ${pocketAt[1] - 40} q 14 30 0 60`} />
                </g>
              ))}
            </svg>
          ) : null
        }
      />
    );
  } else {
    picture = <PayLock push={push} lockIn={lockIn} notifAt={b(P.notif)} roleAt={b(P.lock) + 3} />;
  }
  const clicks = [0, 1, 2, 3].map((i) => b(P.type[0]) + ((b(P.type[1]) - b(P.type[0])) * (i + 0.5)) / 4);
  return (
    <AbsoluteFill>
      {picture}
      {frame < b(P.words) + 12 ? (
        <>
          <TopScrim opacity={1 - tween(frame, [b(P.words), b(P.words) + 10])} height={720} />
          <Top style={{ top: TOP_UNDER_BUG }}>
            <Headline text={bi(COPY.rewind)} at={-100} out={b(P.words)} size={rtl ? 78 : 84} {...INK} />
          </Top>
        </>
      ) : null}
      <Sfx at={b(P.envelope[0])} name="paper" volume={0.4} rate={1.4} />
      <Sfx at={b(P.give[0])} name="soft-whoosh" volume={0.35} />
      <Sfx at={b(P.give[1])} name="paper" volume={0.55} rate={0.8} />
      <Sfx at={b(P.phone)} name="whoosh" volume={0.3} rate={1.2} />
      {clicks.map((c) => (
        <Sfx key={c} at={c} name="mouse-click" volume={0.5} rate={1.2} />
      ))}
      <Sfx at={b(P.save)} name="mouse-click" volume={0.8} rate={0.9} />
      <Sfx at={b(P.save) + 4} name="ding" volume={0.45} rate={1.1} />
      <Sfx at={b(P.buzz) + 2} name="buzz" volume={0.9} />
      <Sfx at={b(P.lock)} name="soft-whoosh" volume={0.4} />
      <Sfx at={b(P.notif)} name="ding" volume={0.6} />
    </AbsoluteFill>
  );
};

/**
 * His lock screen, MauriSchool's notification on it: the title and « Ouvrez
 * MauriSchool… », never the amount. `push` (0 → 1) goes in on the
 * notification; the app scene opens on its last frame and taps it.
 */
export const PayLock: React.FC<{ push: number; lockIn: number; notifAt: number; roleAt: number; children?: React.ReactNode }> = ({ push, lockIn, notifAt, roleAt, children }) => {
  const bi = useBi();
  const { lang, rtl } = useLang();
  const n = NOTIFS.payment_received;
  const lockPose: Pose = { ...PHONE, y: PHONE.y + (1 - lockIn) * 1100, rz: (1 - lockIn) * (rtl ? -8 : 8) };
  const [nx, ny] = PAY_NOTIF;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: 'blur(16px) brightness(0.9)', scale: '1.1' }}>
        <Desk accountant={{ face: { mouth: 'smile', look: [0.8, 0] } }} papa={{ face: { mouth: 'smile', look: [0.4, 1] } }} month="payday" shots={[{ at: 0, zoom: 1.5, focus: [840, 1100], to: [540, 1000] }]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ perspective: 2600, transformOrigin: `${nx}px ${ny}px`, scale: String(1 + 0.85 * push) }}>
        <PhoneRig pose={lockPose}>
          <Device statusTone="light" statusBar glare={0.4} time="10:24">
            <LockScreen time="10:24">
              <Notification at={notifAt} title={fill(n.title[lang], { student_name: FAMILY.son[lang] })} message={bi(SENSITIVE_PUSH_BODY)} />
            </LockScreen>
          </Device>
        </PhoneRig>
      </AbsoluteFill>
      <Top style={{ top: TOP_UNDER_BUG }}>
        <RoleChip label={bi(ROLES.parent)} icon="person" at={roleAt} tone="light" />
      </Top>
      {children}
    </AbsoluteFill>
  );
};

/** The notification on his lock screen, on the canvas: where the push goes in, and where the app scene taps. */
export const PAY_NOTIF = screenToCanvas(PHONE, SCREEN_W / 2, pt(300));
