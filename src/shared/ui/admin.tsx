import React from 'react';
import { fill, PAYROLL_COPY, SCHEDULE_COPY, TEACHER_COPY, TERM_COPY } from '../appCopy';
import { PAYROLL, Payslip, PUPIL_CLASS, REPORT_CARD, TIMETABLE, TimetableRow, YEAR } from '../demo';
import { amount, Bi, monthShort, useBi, useLang } from '../lang';
import { APP, pt, Theme } from '../tokens';
import { AdminTabBar } from './announcement';
import { AppScreen, Card, SectionHeader, useApp, useWeights } from './appkit';
import { IconName, Ionicon } from './Ionicon';
import { AppButton, BackHeader, PinnedFooter } from './teacher';

/**
 * Three of the director's screens, rebuilt from mobile_app: the timetable
 * (app/(admin)/schedule/index.tsx + components/schedule/DaySchedule.tsx), the
 * teachers' payroll (app/(admin)/teacher-payroll/index.tsx on ListScreenLayout)
 * and the term closing hub (app/(admin)/term-closing/index.tsx), with the
 * dialog they raise (ConfirmDialog by type). Sizes are the app's, in points.
 */

const money = (n: number) => `⁦${amount(n)} MRU⁩`;

/** The round header buttons: « + » filled, « … » outlined (36 pt). */
const HeaderActions: React.FC<{ add?: boolean; addPress?: number }> = ({ add = false, addPress = 0 }) => {
  const { c } = useApp();
  const round: React.CSSProperties = { width: pt(36), height: pt(36), borderRadius: pt(18), display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: pt(8) }}>
      {add ? (
        <div style={{ ...round, background: APP.brand[500], scale: String(1 - addPress * 0.1) }}>
          <Ionicon name="add" size={pt(22)} color={APP.white} />
        </div>
      ) : null}
      <div style={{ ...round, border: `${pt(1)}px solid ${c.border}` }}>
        <Ionicon name="ellipsis-horizontal" size={pt(18)} color={c.text} />
      </div>
    </div>
  );
};

type Tone = 'danger' | 'warning' | 'info';
const TONES: Record<Tone, { icon: IconName; color: string }> = {
  danger: { icon: 'warning', color: APP.error },
  warning: { icon: 'alert-circle', color: APP.warning },
  info: { icon: 'information-circle', color: APP.info },
};

/**
 * ConfirmDialog by type: the icon in a disc of its tone, the title, the
 * message, then the actions in that tone. Without `cancel` it is an alert
 * (DialogContext's singleAction): one full-width button.
 */
export const ToneDialog: React.FC<{
  open: number;
  tone: Tone;
  title: string;
  message: string;
  confirm: string;
  cancel?: string;
  confirmPress?: number;
  icon?: IconName;
  /** CenteredDialog + DialogHeader with no icon: text at the start edge, the action in the brand colour. */
  plain?: boolean;
}> = ({ open, tone, title, message, confirm, cancel, confirmPress = 0, icon, plain = false }) => {
  const { c } = useApp();
  const w = useWeights();
  const t = TONES[tone];
  if (open <= 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `0 ${pt(20)}px`, background: `rgba(0,0,0,${0.5 * open})` }}>
      <div style={{ width: '100%', maxWidth: pt(360), background: c.card, borderRadius: pt(16), overflow: 'hidden', opacity: open, scale: String(0.94 + open * 0.06) }}>
        <div style={{ padding: pt(20), display: 'flex', flexDirection: 'column', alignItems: plain ? 'stretch' : 'center' }}>
          {plain ? null : (
            <div style={{ width: pt(56), height: pt(56), borderRadius: pt(28), background: `${t.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: pt(14) }}>
              <Ionicon name={icon ?? t.icon} size={pt(28)} color={t.color} />
            </div>
          )}
          <div style={{ fontSize: pt(18), fontWeight: w.semiBold, color: c.text, textAlign: plain ? 'start' : 'center' }}>{title}</div>
          <div style={{ fontSize: pt(14), lineHeight: `${pt(20)}px`, color: c.textSecondary, marginTop: pt(6), textAlign: plain ? 'start' : 'center', marginBottom: pt(16) }}>{message}</div>
        </div>
        <div style={{ borderTop: `1px solid ${c.border}`, padding: `${pt(16)}px ${pt(20)}px ${pt(20)}px`, display: 'flex', gap: pt(10) }}>
          {cancel ? <AppButton variant="secondary" title={cancel} style={{ flex: 1, minWidth: 0 }} /> : null}
          <AppButton title={confirm} press={confirmPress} style={{ flex: 1, minWidth: 0, background: plain ? APP.brand[500] : t.color }} />
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────────── Timetable ───────────────────────────── */

const TimeColumn: React.FC<{ start: string; end: string; filled: boolean }> = ({ start, end, filled }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div
      style={{
        width: pt(60),
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginInlineEnd: pt(12),
        paddingInlineEnd: pt(8),
        borderInlineEnd: filled ? `${pt(2)}px solid ${APP.brand[500]}` : undefined,
        boxSizing: 'border-box',
        direction: 'ltr',
      }}
    >
      <div style={{ fontSize: pt(14), fontWeight: filled ? w.semiBold : w.medium, color: filled ? APP.brand[500] : c.textSecondary }}>{start}</div>
      <div style={{ fontSize: pt(12), color: c.textSecondary, marginTop: pt(2) }}>{end}</div>
    </div>
  );
};

const Meta: React.FC<{ icon: IconName; children: React.ReactNode }> = ({ icon, children }) => {
  const { c } = useApp();
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: pt(2) }}>
      <Ionicon name={icon} size={pt(13)} color={c.textSecondary} />
      <span style={{ fontSize: pt(13), color: c.textSecondary, marginInlineStart: pt(4) }}>{children}</span>
    </div>
  );
};

/** One row of the day: a ScheduleCard, a PauseRow or a FreeRow. `glow` (0 to 1) lights a free period being filled. */
const DayRow: React.FC<{ row: TimetableRow; glow?: number }> = ({ row, glow = 0 }) => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  if (row.kind === 'pause') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: pt(12), padding: `${pt(8)}px ${pt(12)}px`, marginBottom: pt(8) }}>
        <span style={{ width: pt(60), textAlign: 'center', fontSize: pt(12), color: c.textSecondary, direction: 'ltr' }}>{row.start}</span>
        <span style={{ fontSize: pt(13), color: c.textSecondary }}>{bi(SCHEDULE_COPY.pause)}</span>
      </div>
    );
  }
  if (row.kind === 'free') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: `${pt(1)}px dashed ${glow > 0 ? APP.brand[500] : c.border}`,
          background: glow > 0 ? `rgba(70,95,255,${0.08 * glow})` : undefined,
          borderRadius: pt(12),
          marginBottom: pt(8),
          padding: pt(12),
          boxSizing: 'border-box',
        }}
      >
        <TimeColumn start={row.start} end={row.end} filled={false} />
        <span style={{ flex: 1, fontSize: pt(15), color: c.textSecondary }}>{bi(SCHEDULE_COPY.freeSlot)}</span>
        <span style={{ fontSize: pt(20), fontWeight: w.semiBold, color: APP.brand[500], lineHeight: 1 }}>+</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', background: c.card, borderRadius: pt(12), border: `${pt(1)}px solid ${c.border}`, padding: pt(12), marginBottom: pt(8), boxSizing: 'border-box' }}>
      <TimeColumn start={row.start} end={row.end} filled />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: pt(15), fontWeight: w.semiBold, color: c.text, marginBottom: pt(4) }}>{bi(row.subject)}</div>
        <Meta icon="person-outline">{bi(row.teacher)}</Meta>
        <Meta icon="location-outline">{bi(row.room)}</Meta>
      </div>
    </div>
  );
};

/** Where the free period's row and the header's « + » sit (app points), for a tap. */
export const SCHEDULE_TARGETS = {
  add: (rtl: boolean) => [rtl ? 78 : 312, 82] as const,
  free: () => [195, 580] as const,
};

/**
 * « Emploi du temps »: the class picker, the week's days (Monday chosen), the
 * day drawn from the school's periods. `dialog` opens the blocking-conflict
 * alert a clashing lesson raises.
 */
export const ScheduleScreen: React.FC<{ theme?: Theme; glow?: number; dialog?: number; confirmPress?: number; rows?: TimetableRow[] }> = ({
  theme = 'light',
  glow = 0,
  dialog = 0,
  confirmPress = 0,
  rows = TIMETABLE,
}) => {
  const bi = useBi();
  const { lang } = useLang();
  const S = SCHEDULE_COPY;
  return (
    <AppScreen theme={theme}>
      <BackHeader title={bi(S.title)} action={<HeaderActions add />} />
      <Inner>
        {(c, w) => (
          <>
            <div style={{ padding: `0 ${pt(16)}px`, marginBottom: pt(12) }}>
              <div style={{ display: 'flex', alignItems: 'center', minHeight: pt(48), padding: `${pt(12)}px ${pt(14)}px`, boxSizing: 'border-box', background: c.card, border: `${pt(1)}px solid ${c.border}`, borderRadius: pt(12) }}>
                <span style={{ flex: 1, fontSize: pt(15), fontWeight: w.medium, color: c.text }}>{bi(PUPIL_CLASS)}</span>
                <Ionicon name="chevron-down" size={pt(18)} color={c.textSecondary} />
              </div>
            </div>
            <div style={{ padding: `0 ${pt(16)}px` }}>
              <div style={{ display: 'flex', marginBottom: pt(12), padding: `0 ${pt(4)}px` }}>
                {S.days[lang].map((d, i) => (
                  <div key={d} style={{ padding: `${pt(8)}px ${pt(16)}px`, marginInlineEnd: pt(8), borderRadius: pt(8), background: i === 0 ? APP.brand[500] : c.surface, flexShrink: 0 }}>
                    <div style={{ fontSize: pt(14), fontWeight: i === 0 ? w.semiBold : w.regular, color: i === 0 ? '#fff' : c.text, whiteSpace: 'nowrap' }}>{d}</div>
                    {i > 0 ? <div style={{ width: pt(4), height: pt(4), borderRadius: pt(2), background: APP.brand[500], margin: `${pt(2)}px auto 0` }} /> : null}
                  </div>
                ))}
              </div>
              {rows.map((row, i) => (
                <DayRow key={i} row={row} glow={row.kind === 'free' ? glow : 0} />
              ))}
            </div>
          </>
        )}
      </Inner>
      <AdminTabBar />
      <ToneDialog open={dialog} tone="danger" title={bi(S.blockingConflictTitle)} message={bi(S.blockingConflictMessage)} confirm={bi(S.confirm)} confirmPress={confirmPress} />
    </AppScreen>
  );
};

/** Gives a screen's body the theme colours and weights (they live under AppScreen's provider). */
const Inner: React.FC<{ children: (c: ReturnType<typeof useApp>['c'], w: ReturnType<typeof useWeights>) => React.ReactNode }> = ({ children }) => {
  const { c } = useApp();
  const w = useWeights();
  return <>{children(c, w)}</>;
};

/* ───────────────────────────── Payroll ───────────────────────────── */

const STATUS: Record<Payslip['status'], string> = { draft: APP.light.textSecondary, validated: APP.info, paid: APP.success };

/** StatusBadge (sm): the status colour on a 20 % tint of itself. */
const StatusBadge: React.FC<{ status: Payslip['status']; flash?: number }> = ({ status, flash = 0 }) => {
  const bi = useBi();
  const w = useWeights();
  const color = STATUS[status];
  return (
    <div style={{ background: `${color}33`, borderRadius: pt(8), padding: `${pt(3)}px ${pt(8)}px`, fontSize: pt(11), fontWeight: w.semiBold, color, scale: String(1 + flash * 0.18) }}>
      {bi(PAYROLL_COPY.status[status])}
    </div>
  );
};

/** FinanceRow: the teacher, the payslip number and contract, the hours, the net amount, the status. */
const PayslipRow: React.FC<{ slip: Payslip; flash?: number }> = ({ slip, flash = 0 }) => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  return (
    <div style={{ background: c.card, border: `${pt(1)}px solid ${c.border}`, borderRadius: pt(14), margin: `0 ${pt(16)}px ${pt(10)}px`, padding: pt(14), boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: pt(6) }}>
        <div style={{ flex: 1, minWidth: 0, marginInlineEnd: pt(10) }}>
          <div style={{ fontSize: pt(15), fontWeight: w.semiBold, color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bi(slip.name)}</div>
          <div style={{ fontSize: pt(12), color: c.textSecondary, marginTop: pt(2), whiteSpace: 'nowrap' }}>
            <bdi dir="ltr">{slip.number}</bdi> · {bi(PAYROLL_COPY.contract[slip.contract])}
          </div>
        </div>
        <div style={{ fontSize: pt(16), fontWeight: w.bold, color: c.text }}>{money(slip.net)}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: pt(6) }}>
          <Ionicon name="time-outline" size={pt(13)} color={c.textSecondary} />
          <span style={{ fontSize: pt(12), color: c.textSecondary, direction: 'ltr' }}>{`${slip.worked}h / ${slip.expected}h`}</span>
        </div>
        <StatusBadge status={slip.status} flash={flash} />
      </div>
    </div>
  );
};

/** The first payslip's centre (app points): what a scene taps or pushes in on. */
export const PAYROLL_TARGETS = { firstRow: () => [195, 337] as const, firstBadge: (rtl: boolean) => [rtl ? 60 : 330, 360] as const };

/**
 * « Paie enseignants »: the summary strip (total net, teachers), the filters,
 * the month stepper, the payslips, « Générer » pinned over the tab bar.
 * `validated` is how many of the drafts have been validated so far (a
 * fraction flashes the badge that is changing). `hours` (0 to 1) counts the
 * hours worked up from zero.
 */
export const PayrollScreen: React.FC<{ theme?: Theme; validated?: number; hours?: number }> = ({ theme = 'light', validated = 0, hours = 1 }) => {
  const bi = useBi();
  const { lang, rtl } = useLang();
  const P = PAYROLL_COPY;
  let seen = 0;
  const slips = PAYROLL.slips.map((full) => {
    const s = hours < 1 ? { ...full, worked: Math.round(full.worked * hours) } : full;
    if (s.status !== 'draft') return { slip: s, flash: 0 };
    const k = validated - seen;
    seen += 1;
    return { slip: k >= 0.5 ? { ...s, status: 'validated' as const } : s, flash: k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0 };
  });
  return (
    <AppScreen theme={theme}>
      <BackHeader title={bi(P.title)} action={<HeaderActions />} />
      <Inner>
        {(c, w) => (
          <>
            {/* ListSummaryStrip */}
            <div style={{ display: 'flex', border: `${pt(1)}px solid ${c.border}`, borderRadius: pt(14), margin: `0 ${pt(16)}px ${pt(12)}px`, padding: `${pt(10)}px 0` }}>
              {[
                { label: bi(P.totalNet), value: money(PAYROLL.totalNet), emphasis: true },
                { label: bi(P.teachers), value: String(PAYROLL.teachers), emphasis: false },
              ].map((e, i) => (
                <div key={i} style={{ flex: 1, padding: `0 ${pt(12)}px`, borderInlineStart: i > 0 ? `${pt(1)}px solid ${c.border}` : undefined }}>
                  <div style={{ fontSize: pt(11), color: c.textSecondary }}>{e.label}</div>
                  <div style={{ fontSize: pt(e.emphasis ? 16 : 14), fontWeight: e.emphasis ? w.bold : w.semiBold, color: c.text, marginTop: pt(2) }}>{e.value}</div>
                </div>
              ))}
            </div>
            {/* The filters button */}
            <div style={{ padding: `0 ${pt(16)}px ${pt(10)}px` }}>
              <div style={{ height: pt(44), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: pt(6), border: `${pt(1)}px solid ${c.border}`, borderRadius: pt(12), boxSizing: 'border-box' }}>
                <Ionicon name="options-outline" size={pt(18)} color={c.textSecondary} />
                <span style={{ fontSize: pt(14), fontWeight: w.medium, color: c.text }}>{bi(P.filters)}</span>
              </div>
            </div>
            {/* MonthStepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: pt(8), padding: `0 ${pt(16)}px ${pt(12)}px` }}>
              {(['back', 'forward'] as const).map((d, i) => (
                <div
                  key={d}
                  style={{
                    order: i === 0 ? 0 : 2,
                    width: pt(40),
                    height: pt(40),
                    borderRadius: pt(10),
                    border: `${pt(1)}px solid ${c.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <Ionicon name={(d === 'back') !== rtl ? 'chevron-back' : 'chevron-forward'} size={pt(18)} color={c.text} />
                </div>
              ))}
              <div style={{ order: 1, flex: 1, textAlign: 'center', fontSize: pt(16), fontWeight: w.bold, color: c.text }}>{`${monthShort(PAYROLL.month, lang)} ${PAYROLL.year}`}</div>
            </div>
            {slips.map(({ slip, flash }) => (
              <PayslipRow key={slip.number} slip={slip} flash={flash} />
            ))}
          </>
        )}
      </Inner>
      <PinnedFooter>
        <AppButton title={bi(P.generate)} size="lg" icon="flash-outline" />
      </PinnedFooter>
      <AdminTabBar />
    </AppScreen>
  );
};

/* ───────────────────────────── Term closing ───────────────────────────── */

const CompactStat: React.FC<{ title: string; value: React.ReactNode; color?: string }> = ({ title, value, color }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
      <div style={{ fontSize: pt(18), fontWeight: w.bold, color: color ?? c.text }}>{value}</div>
      <div style={{ fontSize: pt(11), color: c.textSecondary, marginTop: pt(2), whiteSpace: 'nowrap' }}>{title}</div>
    </div>
  );
};

/** The classes the hub lists first; each is ready (every subject approved). */
const TERM_CLASSES: { name: Bi; subjects: number }[] = [
  { name: { fr: '6e A', ar: 'السادسة أ' }, subjects: 10 },
  { name: PUPIL_CLASS, subjects: 10 },
  { name: { fr: '4e A', ar: 'الرابعة أ' }, subjects: 11 },
];

/** « Clôturer et publier » and the dialog's primary button (app points). */
export const TERM_TARGETS = {
  close: () => [195, 400] as const,
  confirm: (rtl: boolean) => [rtl ? 115 : 275, 483] as const,
};

/**
 * « Clôture des trimestres »: the term picker, the state of the term in one
 * card (year, dates, « Prêt », the counts, the four stages), « Clôturer et
 * publier », then the classes. `stage` is how many of the four stages are
 * complete (3 before closing, 4 once `closed`); `dialog` opens « Publier les
 * bulletins ? ».
 */
export const TermClosingScreen: React.FC<{ theme?: Theme; closed?: boolean; closePress?: number; dialog?: number; confirmPress?: number }> = ({
  theme = 'light',
  closed = false,
  closePress = 0,
  dialog = 0,
  confirmPress = 0,
}) => {
  const bi = useBi();
  const { rtl } = useLang();
  const T = TERM_COPY;
  const R = REPORT_CARD.term;
  const students = 486;
  const state = closed ? APP.info : APP.success;
  return (
    <AppScreen theme={theme}>
      <div style={{ paddingTop: pt(8) }}>
        <div style={{ marginTop: pt(-4), marginBottom: pt(-2) }}>
          <BackHeader title={bi(T.title)} subtitle={bi(T.subtitle)} />
        </div>
      </div>
      <Inner>
        {(c, w) => (
          <>
            {/* SegmentedControl */}
            <div style={{ display: 'flex', background: c.surface, borderRadius: pt(12), padding: pt(3), margin: `0 ${pt(16)}px ${pt(12)}px` }}>
              {T.periods.map((p, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: pt(44),
                    boxSizing: 'border-box',
                    borderRadius: pt(10),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: i === 0 ? c.card : 'transparent',
                    boxShadow: i === 0 ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
                    fontSize: pt(14),
                    fontWeight: i === 0 ? w.semiBold : w.medium,
                    color: i === 0 ? APP.brand[500] : c.textSecondary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {bi(p)}
                </div>
              ))}
            </div>
            <div style={{ margin: `0 ${pt(16)}px ${pt(12)}px` }}>
              <Card style={{ padding: pt(14) }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: pt(16), fontWeight: w.semiBold, color: c.text }}>
                      <bdi dir="ltr">{YEAR}</bdi>
                      <span style={{ fontSize: pt(12), fontWeight: w.regular, color: c.textSecondary }}>{` · ${bi(T.yearHint)}`}</span>
                    </div>
                    <div style={{ fontSize: pt(12), color: c.textSecondary, marginTop: pt(2) }}>{fill(bi(T.dates), { start: R.start, end: R.end })}</div>
                  </div>
                  <div style={{ marginInlineStart: pt(8), padding: `${pt(5)}px ${pt(11)}px`, borderRadius: 999, background: `${state}18`, fontSize: pt(12), fontWeight: w.semiBold, color: state }}>
                    {bi(closed ? T.closed : T.ready)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: pt(6), marginTop: pt(14) }}>
                  <CompactStat title={bi(T.students)} value={students} />
                  <CompactStat title={bi(T.subjects)} value={R.subjects} />
                  <CompactStat title={bi(T.approved)} value={R.subjects} />
                  <CompactStat title={bi(T.blockers)} value={0} />
                </div>
                <div style={{ display: 'flex', gap: pt(6), marginTop: pt(16), paddingTop: pt(14), borderTop: `${pt(1)}px solid ${c.border}` }}>
                  {T.stages.map((s, i) => {
                    const done = closed || i < 3;
                    const current = !closed && i === 3;
                    return (
                      <div key={i} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ height: pt(4), alignSelf: 'stretch', borderRadius: pt(4), background: current ? APP.brand[500] : done ? APP.success : c.border }} />
                        <div style={{ fontSize: pt(10), fontWeight: w.medium, color: c.text, textAlign: 'center', marginTop: pt(5), lineHeight: 1.3 }}>
                          {i + 1}. {bi(s)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
            <div style={{ margin: `0 ${pt(16)}px ${pt(16)}px` }}>
              {closed ? (
                <AppButton title={bi(T.reopen)} variant="outline" icon="lock-closed-outline" />
              ) : (
                <AppButton title={bi(T.close)} icon="lock-closed-outline" press={closePress} />
              )}
            </div>
            <div style={{ margin: `0 ${pt(16)}px` }}>
              <SectionHeader title={bi(T.classes)} />
            </div>
            {TERM_CLASSES.map((k, i) => (
              <div key={i} style={{ margin: `0 ${pt(16)}px ${pt(8)}px` }}>
                <Card style={{ padding: pt(14) }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: pt(38), height: pt(38), borderRadius: pt(12), background: `${APP.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginInlineEnd: pt(12) }}>
                      <Ionicon name="checkmark-circle" size={pt(21)} color={APP.success} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: pt(15), fontWeight: w.semiBold, color: c.text }}>{bi(k.name)}</div>
                      <div style={{ fontSize: pt(12), color: c.textSecondary, marginTop: pt(2) }}>{fill(bi(T.classProgress), { approved: k.subjects, total: k.subjects })}</div>
                    </div>
                    <Ionicon name={rtl ? 'chevron-back' : 'chevron-forward'} size={pt(18)} color={c.textSecondary} />
                  </div>
                </Card>
              </div>
            ))}
          </>
        )}
      </Inner>
      <AdminTabBar />
      <ToneDialog
        open={dialog}
        tone="info"
        plain
        title={bi(T.closeTitle)}
        message={fill(bi(T.closeMessage), { students })}
        confirm={bi(T.close)}
        cancel={bi(TEACHER_COPY.cancel)}
        confirmPress={confirmPress}
      />
    </AppScreen>
  );
};
