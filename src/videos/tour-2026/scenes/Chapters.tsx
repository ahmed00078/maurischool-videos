import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FEES_COPY, fill, NOTIFS, SENSITIVE_PUSH_BODY, TERM_COPY } from '../../../shared/appCopy';
import { CLASS_ANNOUNCEMENT, FEES_PAYMENT, LESSON, PUPIL_CLASS, PUPIL_CODE, PUPIL_FATHER, REPORT_CARD, TEST } from '../../../shared/demo';
import { Bi, useBi, useLang } from '../../../shared/lang';
import { APP, tween } from '../../../shared/tokens';
import { PayrollScreen, ScheduleScreen, TermClosingScreen } from '../../../shared/ui/admin';
import { AnnouncementComposerScreen } from '../../../shared/ui/announcement';
import { ChildGradesScreen } from '../../../shared/ui/childGrades';
import { ReceiptSheet, ReportCardSheet } from '../../../shared/ui/documents';
import { ParentFeesScreen } from '../../../shared/ui/fees';
import { InboxScreen } from '../../../shared/ui/inbox';
import { IconName, Ionicon } from '../../../shared/ui/Ionicon';
import { LockScreen, Notification } from '../../../shared/ui/LockScreen';
import { FinanceScreen, HomeScreen } from '../../../shared/ui/screens';
import { PaymentScreen } from '../../../shared/ui/screens2';
import { EvaluationScreen, RegisterScreen } from '../../../shared/ui/teacher';
import { Rect, useMirror } from '../../../shared/wide';
import { Chapter, Step, StepClock } from '../chapter';
import { ROLE } from '../copy';
import { childTerm, feesPayment, KHADI, KHADI_ROW, KHADI_SCORE, PAYMENT, ROSTER, SCORES } from '../data';

/**
 * The ten chapters, declared in the order they play (their `index` in
 * copy.ts). Each lists its steps: whose phone, which screen, and the one
 * section of it that is shown sharp (the rest of every screen stays veiled).
 * Rects and taps are in app points, read off Tour2026-Ruler.
 */

const ICON: Record<keyof typeof ROLE, IconName> = {
  director: 'business-outline',
  accountant: 'calculator-outline',
  teacher: 'easel-outline',
  parent: 'heart-outline',
};
const who = (k: keyof typeof ROLE) => ({ role: ROLE[k] as Bi, icon: ICON[k] });

/** A lock-screen banner: the notification card and a margin of wallpaper around it. */
export const BANNER = (lines: 1 | 2 | 3): Rect => ({ x: 4, y: 250, w: 382, h: 98 + lines * 21, r: 26 });
export const BANNER_CARD = { fit: [640, 330] as [number, number] };

/** The parent's lock screen as a notification lands, a few frames into the step. */
export const LockNote: React.FC<{ c: StepClock; time: string; date?: Bi; title: string; message: string }> = ({ c, time, date, title, message }) => {
  const frame = useCurrentFrame();
  return (
    <LockScreen time={time} date={date}>
      <Notification at={frame - c.f + 8} title={title} message={message} />
    </LockScreen>
  );
};

/**
 * A sheet of paper rising onto the stage, a little turned: the top `height`
 * pixels of it, fading out below (the page goes on), with a caption pill.
 */
export const Paper: React.FC<{ c: StepClock; x: number; width: number; height: number; tilt?: number; behind?: number; caption?: string; captionIcon?: IconName; children: React.ReactNode }> = ({
  c,
  x,
  width,
  height,
  tilt = -2.5,
  behind = 0,
  caption,
  captionIcon = 'checkmark-circle',
  children,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const { font, dir } = useLang();
  const mirror = useMirror();
  const p = spring({ frame: c.f - 2, fps, config: { damping: 17, stiffness: 80 } });
  const pill = spring({ frame: c.f - 26, fps, config: { damping: 13, stiffness: 150 } });
  const cx = mirror(x);
  const top = 548 - height / 2 + 22;
  const float = Math.sin(frame / 44) * 5;
  const fade = 'linear-gradient(#000 0%, #000 84%, transparent 100%)';
  const sheet: React.CSSProperties = { position: 'absolute', left: cx - width / 2, top, width, height, overflow: 'hidden', maskImage: fade, WebkitMaskImage: fade };
  return (
    <>
      {Array.from({ length: behind }, (_, i) => {
        const k = behind - i;
        const q = spring({ frame: c.f - 8 - k * 4, fps, config: { damping: 18, stiffness: 90 } });
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 14px 26px rgba(15,22,70,0.14))', opacity: p }}>
            <div style={{ ...sheet, background: '#fff', rotate: `${tilt + k * 3 * q}deg`, translate: `${(dir === 'rtl' ? -1 : 1) * k * 30 * q}px ${(1 - p) * 700 + k * 8 + float}px` }} />
          </div>
        );
      })}
      <div style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 34px 60px rgba(15,22,70,0.28))', opacity: Math.min(1, p * 2) }}>
        <div style={{ ...sheet, rotate: `${tilt * p}deg`, translate: `0px ${(1 - p) * 700 + float}px` }}>{children}</div>
      </div>
      {caption ? (
        <div style={{ position: 'absolute', left: cx, top: top + height - 96, translate: '-50% 0', zIndex: 4 }}>
          <div
            dir={dir}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 28px',
              borderRadius: 999,
              background: '#fff',
              boxShadow: '0 16px 40px rgba(15,22,70,0.22)',
              fontFamily: font,
              fontSize: 30,
              fontWeight: 700,
              color: APP.light.text,
              whiteSpace: 'nowrap',
              scale: String(pill),
              opacity: Math.min(1, pill * 2),
            }}
          >
            <Ionicon name={captionIcon} size={34} color={captionIcon === 'checkmark-circle' ? APP.success : APP.brand[500]} />
            {caption}
          </div>
        </div>
      ) : null}
    </>
  );
};

const click = (at: number, rate = 1.3) => ({ at, name: 'mouse-click' as const, volume: 0.4, rate });

/** 1 · Fees: the accountant records, the parent is told, the receipt is in the app. */
export const FeesChapter: React.FC = () => {
  const bi = useBi();
  const { lang } = useLang();
  const n = NOTIFS.payment_received;
  const steps: Step[] = [
    {
      ...who('accountant'),
      at: 2,
      phone: 'accountant',
      time: PAYMENT.time,
      screen: (c) => <PaymentScreen typed={tween(c.f, [34, 70])} value={PAYMENT.amount} pupil={KHADI} />,
      rect: { x: 8, y: 124, w: 374, h: 252 },
      rectAr: { x: 8, y: 124, w: 374, h: 262 },
      sfx: [click(2.4), click(2.9, 1.4), click(3.4, 1.5), click(3.9, 1.6)],
    },
    {
      ...who('parent'),
      at: 11,
      phone: 'parent',
      time: PAYMENT.time,
      lock: true,
      screen: (c) => <LockNote c={c} time={PAYMENT.time} title={fill(bi(n.title), { student_name: bi(KHADI) })} message={bi(SENSITIVE_PUSH_BODY)} />,
      rect: BANNER(1),
      card: BANNER_CARD,
      sfx: [{ at: 0.5, name: 'ding', volume: 0.6 }],
    },
    {
      ...who('parent'),
      kind: 'doc',
      at: 19,
      render: (c) => (
        <Paper c={c} x={1310} width={760} height={760} caption={bi(FEES_COPY.downloadReceipt)} captionIcon="download-outline">
          <ReceiptSheet
            width={760}
            lang={lang}
            data={{ number: PAYMENT.receipt, date: PAYMENT.date, time: PAYMENT.time, invoice: PAYMENT.invoice, amount: PAYMENT.amount, student: bi(KHADI), code: PUPIL_CODE, payer: bi(PUPIL_FATHER), cashier: bi(FEES_PAYMENT.cashier) }}
          />
        </Paper>
      ),
      sfx: [{ at: 0.2, name: 'paper', volume: 0.5 }],
    },
  ];
  return <Chapter index={0} steps={steps} benefitAt={26} />;
};

/** 2 · Finance: the month's result counting up, collection and a finger on what is overdue, six months. */
export const FinanceChapter: React.FC = () => {
  const steps: Step[] = [
    { ...who('director'), at: 2, phone: 'director', screen: (c) => <FinanceScreen progress={tween(c.f, [16, 54])} chart={1} />, rect: { x: 8, y: 114, w: 374, h: 196 }, rectAr: { x: 8, y: 114, w: 374, h: 216 }, card: { fit: [640, 380] } },
    {
      ...who('director'),
      at: 10,
      phone: 'director',
      screen: (c) => <FinanceScreen progress={tween(c.f, [6, 44])} chart={1} />,
      rect: { x: 8, y: 310, w: 374, h: 312 },
      rectAr: { x: 8, y: 326, w: 374, h: 334 },
      taps: [{ at: 4.6, x: 232, y: 357, yAr: 375 }],
      sfx: [click(4.6, 1.1)],
    },
    {
      ...who('director'),
      at: 18,
      phone: 'director',
      screen: (c) => <FinanceScreen scroll={tween(c.f, [0, 12], [0, 300])} chart={tween(c.f, [14, 50])} />,
      rect: { x: 8, y: 336, w: 374, h: 232 },
      rectAr: { x: 8, y: 370, w: 374, h: 238 },
      card: { fit: [640, 420] },
    },
  ];
  return <Chapter index={1} steps={steps} benefitAt={25} />;
};

/** 3 · Payroll: the hours worked counting up against the hours due, then the director validates two payslips. */
export const PayrollChapter: React.FC = () => {
  const steps: Step[] = [
    { ...who('director'), at: 2, phone: 'director', screen: (c) => <PayrollScreen hours={tween(c.f, [16, 52])} />, rect: { x: 8, y: 286, w: 374, h: 210 }, rectAr: { x: 8, y: 290, w: 374, h: 220 }, card: { fit: [640, 380] } },
    {
      ...who('director'),
      at: 10,
      phone: 'director',
      screen: (c) => <PayrollScreen validated={tween(c.f, [c.beats(2), c.beats(5)], [0, 2])} />,
      rect: { x: 8, y: 286, w: 374, h: 314 },
      rectAr: { x: 8, y: 290, w: 374, h: 330 },
      taps: [
        { at: 2.6, x: 329, y: 368, yAr: 378 },
        { at: 4.1, x: 329, y: 469, yAr: 486 },
      ],
      sfx: [click(2.6), { at: 2.7, name: 'switch', volume: 0.5 }, click(4.1, 1.1), { at: 4.2, name: 'switch', volume: 0.5, rate: 1.15 }],
    },
  ];
  return <Chapter index={2} steps={steps} benefitAt={18} />;
};

/** 4 · Attendance: the whole class in one tap, the absent pupil, her parent told. */
export const AttendanceChapter: React.FC = () => {
  const bi = useBi();
  const n = NOTIFS.absence_marked;
  const date = '05/10/2026';
  const steps: Step[] = [
    {
      ...who('teacher'),
      at: 2,
      phone: 'teacher',
      time: '08:05',
      screen: (c) => <RegisterScreen roster={ROSTER} filled={tween(c.f, [c.beats(2.6), c.beats(4.2)])} absent={[0, 0, tween(c.f, [c.beats(6), c.beats(6.5)])]} allPress={tween(c.f, [c.beats(2.3), c.beats(2.6)]) - tween(c.f, [c.beats(2.6), c.beats(3)])} />,
      rect: { x: 8, y: 176, w: 374, h: 336 },
      taps: [
        { at: 2.5, x: 56, y: 190 },
        { at: 6, x: 340, y: 360 },
      ],
      sfx: [click(2.5), { at: 2.7, name: 'switch', volume: 0.5 }, click(6, 1.1)],
    },
    {
      ...who('parent'),
      at: 12,
      phone: 'parent',
      time: '08:06',
      lock: true,
      screen: (c) => (
        <LockNote
          c={c}
          time="08:06"
          date={{ fr: 'lundi 5 octobre', ar: 'الاثنين 5 أكتوبر' }}
          title={fill(bi(n.title), { student_name: bi(KHADI) })}
          message={fill(bi(n.message), { student_name: bi(KHADI), date, class_name: bi(PUPIL_CLASS) })}
        />
      ),
      rect: BANNER(3),
      card: BANNER_CARD,
      sfx: [{ at: 0.5, name: 'ding', volume: 0.6 }],
    },
  ];
  return <Chapter index={3} steps={steps} benefitAt={19} />;
};

/** 5 · Grades: the teacher types Khadi's score and publishes the test, her father reads the grade. */
export const GradesChapter: React.FC = () => {
  const bi = useBi();
  const n = NOTIFS.grade_published_parent;
  const steps: Step[] = [
    {
      ...who('teacher'),
      at: 2,
      phone: 'teacher',
      time: '15:40',
      screen: (c) => <EvaluationScreen roster={ROSTER} scores={SCORES} typedRow={KHADI_ROW} typed={tween(c.f, [c.beats(2), c.beats(3.4)])} />,
      rect: { x: 8, y: 120, w: 374, h: 296 },
      taps: [{ at: 1.7, x: 279, y: 301 }],
      sfx: [click(1.7, 1.1), click(2.1), click(2.6, 1.4), click(3.1, 1.5)],
    },
    {
      ...who('parent'),
      at: 11,
      phone: 'parent',
      time: '15:42',
      screen: () => (
        <InboxScreen
          items={[
            { category: 'grades', time: '15:42', title: fill(bi(n.title), { student_name: bi(KHADI) }), message: fill(bi(n.message), { grade: String(KHADI_SCORE), subject_name: bi(LESSON.subject), period: bi(TEST.period) }) },
            { category: 'attendance', unread: false, time: '08:06', title: '· · ·', message: '· · ·' },
            { category: 'finance', unread: false, time: '02/10/2026', title: '· · ·', message: '· · ·' },
          ]}
        />
      ),
      rect: { x: 8, y: 162, w: 374, h: 122 },
      card: { fit: [640, 330] },
      sfx: [{ at: 0.5, name: 'ding', volume: 0.6 }],
    },
  ];
  return <Chapter index={4} steps={steps} benefitAt={18} />;
};

/** 6 · Report cards: the term is ready, the director closes it, every bulletin exists. */
export const ReportCardsChapter: React.FC = () => {
  const bi = useBi();
  const steps: Step[] = [
    { ...who('director'), at: 2, phone: 'director', screen: () => <TermClosingScreen />, rect: { x: 8, y: 174, w: 374, h: 254 }, rectAr: { x: 8, y: 180, w: 374, h: 264 } },
    {
      ...who('director'),
      at: 10,
      phone: 'director',
      screen: (c) => <TermClosingScreen dialog={tween(c.f, [-6, 2])} confirmPress={tween(c.f, [c.beats(4), c.beats(4.3)]) - tween(c.f, [c.beats(4.3), c.beats(4.8)])} />,
      rect: { x: 20, y: 319, w: 350, h: 204 },
      rectAr: { x: 20, y: 327, w: 350, h: 187 },
      card: { fit: [640, 420] },
      taps: [{ at: 4.1, x: 275, y: 479 }],
      sfx: [click(4.1, 1.1)],
    },
    {
      ...who('parent'),
      kind: 'doc',
      at: 18,
      render: (c) => (
        <Paper c={c} x={1310} width={720} height={820} behind={3} tilt={-2} caption={bi(TERM_COPY.closeSuccess)}>
          <ReportCardSheet width={720} pupil={KHADI} appreciation={bi(REPORT_CARD.appreciation)} />
        </Paper>
      ),
      sfx: [{ at: 0.2, name: 'paper', volume: 0.55 }, { at: 1.6, name: 'ding', volume: 0.5 }],
    },
  ];
  return <Chapter index={5} steps={steps} benefitAt={26} />;
};

/** 7 · Timetable: a class's day, a finger on its free period, and the clash the app refuses. */
export const TimetableChapter: React.FC = () => {
  const steps: Step[] = [
    {
      ...who('director'),
      at: 2,
      phone: 'director',
      screen: (c) => <ScheduleScreen glow={tween(c.f, [c.beats(5.2), c.beats(5.8)])} />,
      rect: { x: 8, y: 220, w: 374, h: 396 },
      rectAr: { x: 8, y: 222, w: 374, h: 418 },
      taps: [{ at: 5.2, x: 356, y: 588, yAr: 611 }],
      sfx: [click(5.2, 1.1)],
    },
    {
      ...who('director'),
      at: 12,
      phone: 'director',
      screen: (c) => <ScheduleScreen glow={1} dialog={tween(c.f, [-6, 2])} />,
      rect: { x: 20, y: 284, w: 350, h: 274 },
      rectAr: { x: 20, y: 292, w: 350, h: 264 },
      card: { fit: [640, 480] },
      sfx: [{ at: 0.3, name: 'buzz', volume: 0.35 }],
    },
  ];
  return <Chapter index={6} steps={steps} benefitAt={19} />;
};

/** 8 · Announcements: written once for a class, on every family's phone. */
export const AnnouncementsChapter: React.FC = () => {
  const bi = useBi();
  const { lang } = useLang();
  const A = CLASS_ANNOUNCEMENT;
  const draft = { title: A.title[lang], body: A.body[lang], audience: 'class' as const, className: PUPIL_CLASS[lang], total: A.total, breakdown: [...A.breakdown] };
  const steps: Step[] = [
    { ...who('director'), at: 2, phone: 'director', time: '18:03', screen: () => <AnnouncementComposerScreen draft={draft} scroll={150} />, rect: { x: 8, y: 276, w: 374, h: 308 }, rectAr: { x: 8, y: 284, w: 374, h: 316 } },
    {
      ...who('parent'),
      at: 11,
      phone: 'parent',
      time: A.time,
      lock: true,
      screen: (c) => <LockNote c={c} time={A.time} date={{ fr: 'mardi 20 octobre', ar: 'الثلاثاء 20 أكتوبر' }} title={bi(A.title)} message={bi(A.body)} />,
      rect: BANNER(1),
      card: BANNER_CARD,
      sfx: [{ at: 0.5, name: 'ding', volume: 0.6 }],
    },
  ];
  return <Chapter index={7} steps={steps} benefitAt={18} />;
};

/** 9 · The parent's app: the child's attendance, her average counting up, the fee paid and a finger on its receipt. */
export const ParentChapter: React.FC = () => {
  const steps: Step[] = [
    { ...who('parent'), at: 2, phone: 'parent', time: '19:30', screen: () => <ChildGradesScreen name={KHADI} term={childTerm} />, rect: { x: 8, y: 112, w: 374, h: 244 }, card: { fit: [640, 440] } },
    {
      ...who('parent'),
      at: 10,
      phone: 'parent',
      time: '19:30',
      screen: (c) => <ChildGradesScreen name={KHADI} term={{ ...childTerm, average: childTerm.average * tween(c.f, [8, 40]) }} emphasis={tween(c.f, [38, 52])} />,
      rect: { x: 8, y: 478, w: 374, h: 264 },
      sfx: [{ at: 2.6, name: 'ding', volume: 0.4 }],
    },
    {
      ...who('parent'),
      at: 18,
      phone: 'parent',
      time: '19:30',
      screen: (c) => (
        <ParentFeesScreen tab="history" payment={feesPayment} emphasis={tween(c.f, [10, 24])} linkPress={tween(c.f, [c.beats(4), c.beats(4.3)]) - tween(c.f, [c.beats(4.3), c.beats(4.8)])} />
      ),
      rect: { x: 8, y: 316, w: 374, h: 130 },
      card: { fit: [640, 330] },
      taps: [{ at: 4, x: 196, y: 419 }],
      sfx: [click(4, 1.1)],
    },
  ];
  return <Chapter index={8} steps={steps} benefitAt={25} />;
};

/** 10 · The director's home, where it all lands: a finger on what needs attention, then the school's figures counting up. */
export const DashboardChapter: React.FC = () => {
  const steps: Step[] = [
    {
      ...who('director'),
      at: 2,
      phone: 'director',
      screen: () => <HomeScreen />,
      rect: { x: 8, y: 150, w: 374, h: 150 },
      rectAr: { x: 8, y: 158, w: 374, h: 150 },
      card: { fit: [640, 330] },
      taps: [{ at: 5, x: 350, y: 222, yAr: 230 }],
      sfx: [click(5, 1.1)],
    },
    { ...who('director'), at: 11, phone: 'director', screen: (c) => <HomeScreen scroll={tween(c.f, [0, 12], [0, 250])} progress={tween(c.f, [10, 48])} />, rect: { x: 8, y: 284, w: 374, h: 334 }, rectAr: { x: 8, y: 300, w: 374, h: 342 } },
  ];
  return <Chapter index={9} steps={steps} benefitAt={18} />;
};
