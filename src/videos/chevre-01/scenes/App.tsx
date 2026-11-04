import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBeat } from '../../../shared/beat';
import { TOP_UNDER_BUG } from '../../../shared/chevre/marks';
import { FAMILY, FEES_PAYMENT } from '../../../shared/demo';
import { CameraPath } from '../../../shared/fx';
import { useBi, useLang } from '../../../shared/lang';
import { MarkerCircle } from '../../../shared/ui/lineup';
import { PhoneRig, Pose, screenToCanvas, Sfx, Tap, Top } from '../../../shared/rig';
import { pt, tween } from '../../../shared/tokens';
import { Device } from '../../../shared/ui/Device';
import { FEES_TARGETS, ParentFeesScreen } from '../../../shared/ui/fees';
import { Headline } from '../../../shared/ui/Headline';
import { RECEIPT_TARGETS, ReceiptPdfScreen } from '../../../shared/ui/receiptDoc';
import { COPY } from '../copy';
import { Desk } from '../stage';
import { PAY_NOTIF, PayLock } from './Counter';
import { INK, TopScrim } from './Yard';

const POSE = { x: 520, y: 1150, scale: 0.72 } satisfies Pose;

/**
 * App beats. It opens on his lock screen as the pay scene left it, and he
 * taps the notification: a payment notification opens « Frais » in the app
 * (action_url /parent/fees). On the way, quickly, the « Historique » tab and
 * « Télécharger le reçu »; then the receipt, which holds: the camera settles
 * on its title and amount and stays still to the end, two and a half
 * seconds, the amount circled. One stop on the lock screen, one on the
 * receipt; « Frais » is the way between them.
 */
/** The middle of « 7 500.00 MRU » on the receipt, in app points from the screen's left (the Arabic page mirrors it). */
const AMOUNT_X_FR = 92;

const A = { tapNotif: 0.3, words: 0.5, fees: 0.6, tapTab: 1.4, history: 1.6, tapLink: 2.5, pdf: 2.8, sheet: 3.4, circle: 3.9 } as const;

/** A press that dips over a few frames around `at`. */
const press = (frame: number, at: number) => tween(frame, [at - 3, at]) * (1 - tween(frame, [at + 3, at + 9]));

/**
 * 5 · app: Papa's phone. He taps the payment notification; « Frais », the
 * « Historique » tab, the payment and « Télécharger le reçu »; the receipt
 * PDF, in the school's colours: « Reçu de paiement », the amount.
 * « Le reçu arrive tout seul. »
 */
export const AppScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const AMOUNT_X = rtl ? 390 - AMOUNT_X_FR : AMOUNT_X_FR;
  const at = (sx: number, sy: number): [number, number] => [...screenToCanvas(POSE, pt(sx), pt(sy))];

  // Screens slide in inside the phone: « Frais » forward in the reading direction, the PDF up from the bottom.
  const feesIn = spring({ frame: frame - b(A.fees), fps, config: { damping: 20, stiffness: 160 } });
  const pdfIn = spring({ frame: frame - b(A.pdf), fps, config: { damping: 20, stiffness: 150 } });
  const forward = rtl ? -1 : 1;
  const showFees = frame < b(A.pdf) + 14;
  const showPdf = frame >= b(A.pdf);
  const cardEmphasis = tween(frame, [b(A.history) + 4, b(A.history) + 10]) * (1 - tween(frame, [b(A.tapLink) - 2, b(A.tapLink) + 6]));

  const [tx, ty] = FEES_TARGETS.historyTab(rtl);
  const tab = at(tx, ty);
  const [lx, ly] = FEES_TARGETS.download();
  const link = at(lx, ly);
  const card = at(...FEES_TARGETS.card());
  // The amount sits on the page's left, under « Reçu de paiement » and the receipt number.
  const amount = at(AMOUNT_X, RECEIPT_TARGETS.amount);
  const title = at(AMOUNT_X, RECEIPT_TARGETS.title);
  const whole = at(195, 422);
  // The hold's framing: the title and the amount together, close enough that « 7 500.00 MRU » is some 90 px tall.
  const hold = { zoom: 4.8, focus: [amount[0], (title[1] + amount[1]) / 2] as [number, number], to: [560, 1010] as [number, number] };
  const amountOnScreen: [number, number] = [hold.to[0] + hold.zoom * (amount[0] - hold.focus[0]), hold.to[1] + hold.zoom * (amount[1] - hold.focus[1])];

  if (frame < b(A.fees)) {
    // His lock screen as the pay scene left it, gone in on the notification: he taps it.
    return (
      <AbsoluteFill>
        <PayLock push={1} lockIn={1} notifAt={-100} roleAt={-100}>
          <Tap x={PAY_NOTIF[0]} y={PAY_NOTIF[1]} at={b(A.tapNotif)} size={80} />
        </PayLock>
        <Sfx at={b(A.tapNotif)} name="mouse-click" volume={0.7} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* The office behind, soft: he is still at the counter. */}
      <AbsoluteFill style={{ filter: 'blur(18px) brightness(0.95) saturate(0.9)', scale: '1.1' }}>
        <Desk accountant={{ face: { mouth: 'smile', look: [0.8, 0] } }} papa={{ face: { mouth: 'smile', look: [0.4, 1] } }} month="payday" shots={[{ at: 0, zoom: 1.5, focus: [840, 1100], to: [540, 1000] }]} />
      </AbsoluteFill>
      <CameraPath
        move={10}
        shots={[
          { at: 0, zoom: 1.45, focus: whole, to: [500, 1120] },
          { at: b(A.history) + 6, zoom: 1.8, focus: card, to: [500, 1180] },
          { at: b(A.pdf) + 6, zoom: 1.45, focus: whole, to: [500, 1120] },
          { at: b(A.sheet) + 6, ...hold },
        ]}
      >
        <AbsoluteFill style={{ perspective: 2600 }}>
          <PhoneRig pose={POSE}>
            <Device glare={0.3} time="10:25" statusTone={showPdf && pdfIn > 0.5 ? 'light' : 'dark'}>
              {showFees ? (
                <div style={{ position: 'absolute', inset: 0, translate: `${(1 - feesIn) * forward * 100}% 0px` }}>
                  <ParentFeesScreen
                    tab={frame >= b(A.history) ? 'history' : 'pending'}
                    payment={{ description: FEES_PAYMENT.description, student: FAMILY.son, invoice: FEES_PAYMENT.invoice, amount: FEES_PAYMENT.amount, date: FEES_PAYMENT.date }}
                    tabPress={press(frame, b(A.tapTab))}
                    linkPress={press(frame, b(A.tapLink))}
                    emphasis={cardEmphasis}
                  />
                </div>
              ) : null}
              {showPdf ? (
                <div style={{ position: 'absolute', inset: 0, translate: `0px ${(1 - pdfIn) * 100}%` }}>
                  <ReceiptPdfScreen open={tween(frame, [b(A.pdf) + 4, b(A.pdf) + 14])} />
                </div>
              ) : null}
            </Device>
          </PhoneRig>
          <Tap x={tab[0]} y={tab[1]} at={b(A.tapTab)} size={64} />
          <Tap x={link[0]} y={link[1]} at={b(A.tapLink)} size={64} />
        </AbsoluteFill>
      </CameraPath>
      {/* The amount, circled once the camera has stopped. */}
      <MarkerCircle cx={amountOnScreen[0]} cy={amountOnScreen[1]} rx={330} ry={86} at={b(A.circle)} dur={12} color="#e3a008" />
      {/* The words leave when the receipt opens: the sheet has the frame to itself. */}
      <TopScrim height={600} opacity={1 - tween(frame, [b(A.pdf), b(A.pdf) + 10])} />
      <Top style={{ top: TOP_UNDER_BUG }}>
        <Headline text={bi(COPY.auto)} at={b(A.words)} out={b(A.pdf)} size={rtl ? 78 : 66} {...INK} />
      </Top>
      <Sfx at={b(A.fees)} name="soft-whoosh" volume={0.3} rate={1.3} />
      <Sfx at={b(A.tapTab)} name="mouse-click" volume={0.7} rate={1.1} />
      <Sfx at={b(A.tapLink)} name="mouse-click" volume={0.75} />
      <Sfx at={b(A.pdf)} name="whoosh" volume={0.3} rate={1.4} />
      <Sfx at={b(A.circle)} name="ding" volume={0.45} />
    </AbsoluteFill>
  );
};
