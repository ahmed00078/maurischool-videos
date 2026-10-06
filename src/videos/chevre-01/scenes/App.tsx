import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fill, NOTIFS } from '../../../shared/appCopy';
import { useBeat } from '../../../shared/beat';
import { FAMILY, FEES_PAYMENT } from '../../../shared/demo';
import { CameraPath } from '../../../shared/fx';
import { useBi, useLang } from '../../../shared/lang';
import { PhoneRig, Pose, screenToCanvas, Sfx, Tap, Top } from '../../../shared/rig';
import { pt, tween } from '../../../shared/tokens';
import { Device } from '../../../shared/ui/Device';
import { FEES_TARGETS, ParentFeesScreen } from '../../../shared/ui/fees';
import { Headline } from '../../../shared/ui/Headline';
import { InboxItem, inboxRowCenter, InboxScreen } from '../../../shared/ui/inbox';
import { RECEIPT_TARGETS, ReceiptPdfScreen } from '../../../shared/ui/receiptDoc';
import { COPY } from '../copy';
import { Desk } from '../stage';
import { INK } from './Yard';

const POSE = { x: 540, y: 1150, scale: 0.72 } satisfies Pose;

/** App beats: the inbox row, the tap to « Frais », the history tab, the receipt link, the PDF. */
const A = { words: 0.3, row: 0.5, tapRow: 2.5, fees: 2.75, tapTab: 3.8, history: 3.95, tapLink: 5.3, pdf: 5.6, title: 6.2, amount: 7.6 } as const;

/**
 * Papa's inbox this morning, newest first: the payment he just made, and the
 * reminder the school sent at 7:30 for the invoice due on the 15th (read).
 * The inbox shows what the lock screen hid: the amount and the receipt number.
 */
const useInbox = (): InboxItem[] => {
  const { lang } = useLang();
  const n = (key: keyof typeof NOTIFS, params: Record<string, string>) => ({
    title: fill(NOTIFS[key].title[lang], params),
    message: fill(NOTIFS[key].message[lang], params),
  });
  return [
    {
      category: 'finance',
      time: FEES_PAYMENT.time,
      ...n('payment_received', { student_name: FAMILY.son[lang], amount: FEES_PAYMENT.amountText, receipt_number: FEES_PAYMENT.receipt }),
    },
    {
      category: 'finance',
      unread: false,
      time: FEES_PAYMENT.reminder.time,
      ...n('payment_reminder', {
        student_name: FAMILY.son[lang],
        due_date: FEES_PAYMENT.reminder.due,
        amount_due: FEES_PAYMENT.amountText,
        invoice_number: FEES_PAYMENT.invoice,
      }),
    },
  ];
};

/** A press that dips over a few frames around `at`. */
const press = (frame: number, at: number) => tween(frame, [at - 3, at]) * (1 - tween(frame, [at + 3, at + 9]));

/**
 * 6 · app: Papa's phone. (a) The inbox: « Paiement enregistré », the amount
 * and the receipt number, readable. (b) He taps it: « Frais », all paid; the
 * « Historique » tab: the payment and « Télécharger le reçu ». (c) The
 * receipt PDF: « REÇU DE PAIEMENT ». « Le reçu arrive tout seul. »
 */
export const AppScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const items = useInbox();
  const at = (sx: number, sy: number): [number, number] => [...screenToCanvas(POSE, pt(sx), pt(sy))];

  // Screens slide in inside the phone: « Frais » forward in the reading direction, the PDF up from the bottom.
  const feesIn = spring({ frame: frame - b(A.fees), fps, config: { damping: 20, stiffness: 160 } });
  const pdfIn = spring({ frame: frame - b(A.pdf), fps, config: { damping: 20, stiffness: 150 } });
  const forward = rtl ? -1 : 1;
  const showInbox = frame < b(A.fees) + 12;
  const showFees = frame >= b(A.fees) && frame < b(A.pdf) + 14;
  const showPdf = frame >= b(A.pdf);
  const emphasis = tween(frame, [b(A.row) + 6, b(A.row) + 14]) * (1 - tween(frame, [b(A.tapRow), b(A.tapRow) + 6]));
  const cardEmphasis = tween(frame, [b(A.history) + 4, b(A.history) + 12]) * (1 - tween(frame, [b(A.tapLink) - 2, b(A.tapLink) + 6]));

  const row = at(195, inboxRowCenter(0));
  const [tx, ty] = FEES_TARGETS.historyTab(rtl);
  const tab = at(tx, ty);
  const [lx, ly] = FEES_TARGETS.download();
  const link = at(lx, ly);
  const card = at(...FEES_TARGETS.card());
  const title = at(195, RECEIPT_TARGETS.title);
  const paid = at(195, RECEIPT_TARGETS.amount);
  const whole = at(195, 422);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* The office behind, soft: he is still at the counter. */}
      <AbsoluteFill style={{ filter: 'blur(18px) brightness(0.95) saturate(0.9)', scale: '1.1' }}>
        <Desk accountant={{ face: { mouth: 'smile', look: [0.8, 0] } }} papa={{ face: { mouth: 'smile', look: [0.4, 1] } }} month="payday" shots={[{ at: 0, zoom: 1.5, focus: [840, 1100], to: [540, 1000] }]} />
      </AbsoluteFill>
      <CameraPath
        move={10}
        shots={[
          { at: 0, zoom: 1, focus: whole },
          { at: b(A.row) + 10, zoom: 1.85, focus: row, to: [540, 1040] },
          { at: b(A.fees) + 6, zoom: 1.15, focus: whole, to: [540, 1080] },
          { at: b(A.history) + 8, zoom: 1.7, focus: card, to: [540, 1060] },
          { at: b(A.pdf) + 4, zoom: 1.1, focus: whole, to: [540, 1080] },
          { at: b(A.title) + 8, zoom: 2, focus: title, to: [540, 960] },
          { at: b(A.amount) + 8, zoom: 2, focus: paid, to: [540, 1000] },
        ]}
      >
        <AbsoluteFill style={{ perspective: 2600 }}>
          <PhoneRig pose={POSE}>
            <Device glare={0.3} time="10:25" statusTone={showPdf && pdfIn > 0.5 ? 'light' : 'dark'}>
              {showInbox ? <InboxScreen items={items} emphasis={[emphasis, 0]} /> : null}
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
          <Tap x={row[0]} y={row[1]} at={b(A.tapRow)} size={70} />
          <Tap x={tab[0]} y={tab[1]} at={b(A.tapTab)} size={64} />
          <Tap x={link[0]} y={link[1]} at={b(A.tapLink)} size={64} />
        </AbsoluteFill>
      </CameraPath>
      {/* A light scrim so the words read over the phone when the camera is in close. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 640, background: 'linear-gradient(180deg, rgba(255,250,240,0.96) 0%, rgba(255,250,240,0.85) 50%, rgba(255,250,240,0) 100%)' }} />
      <Top>
        <Headline text={bi(COPY.auto)} at={b(A.words)} size={rtl ? 78 : 84} {...INK} />
      </Top>
      <Sfx at={b(A.row)} name="soft-whoosh" volume={0.35} />
      <Sfx at={b(A.tapRow)} name="mouse-click" volume={0.7} />
      <Sfx at={b(A.fees)} name="soft-whoosh" volume={0.3} rate={1.3} />
      <Sfx at={b(A.tapTab)} name="mouse-click" volume={0.7} rate={1.1} />
      <Sfx at={b(A.tapLink)} name="mouse-click" volume={0.75} />
      <Sfx at={b(A.pdf)} name="whoosh" volume={0.3} rate={1.4} />
      <Sfx at={b(A.title)} name="ding" volume={0.45} />
    </AbsoluteFill>
  );
};
