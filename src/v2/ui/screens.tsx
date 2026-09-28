import React from 'react';
import { fill, FINANCE_COPY, HOME, TABS } from '../appCopy';
import { ACTIVITY, ATTENDANCE_RATE, FINANCE, PAYROLL_DRAFTS, PEOPLE, SCHOOL, YEAR } from '../demo';
import { amount, monthShort, percent, useBi, useLang } from '../lang';
import { APP, pt, Theme, themeColors } from '../tokens';
import {
  ActionTile,
  AlertRow,
  AppScreen,
  Card,
  DashboardHeader,
  Enter,
  FeedRow,
  MoneyTile,
  ScreenHeader,
  SectionHeader,
  StatCard,
  TabBar,
  TabKey,
  useApp,
  useWeights,
} from './appkit';
import { Ionicon } from './Ionicon';

/** formatCurrency: the amount stays left-to-right inside Arabic text. */
export const money = (n: number) => `⁦${amount(n)} MRU⁩`;

type ScreenProps = {
  theme?: Theme;
  /** Frame the blocks start entering; omit for a static screen. */
  enterFrom?: number;
  /** How far the content is scrolled, in app points. */
  scroll?: number;
  /** Values that count up can be driven from outside (0 to 1). */
  progress?: number;
};

const useTabs = () => {
  const bi = useBi();
  return Object.fromEntries(Object.entries(TABS).map(([k, v]) => [k, bi(v)])) as Record<TabKey, string>;
};

const Scroll: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ translate: `0px ${-pt(y)}px` }}>{children}</div>
);

const Pad: React.FC<{ children: React.ReactNode; bottom?: number }> = ({ children, bottom = 18 }) => (
  <div style={{ padding: `0 ${pt(16)}px`, marginBottom: pt(bottom) }}>{children}</div>
);

/** app/(app)/(admin)/index.tsx: the director's home. */
export const HomeScreen: React.FC<
  ScreenProps & {
    unread?: number;
    /**
     * Draw only the two priority alerts, on a clear background, in their exact
     * place. Laid over the phone, this copy is what lifts out of the screen.
     */
    isolate?: boolean;
    /**
     * How far each alert has lifted out (0 to 1). Pass the same value to the
     * phone and to the isolated copy: the copy appears as the original goes.
     */
    lift?: [number, number];
  }
> = ({ theme = 'light', enterFrom, scroll = 0, unread = 3, isolate = false, lift = [0, 0] }) => {
  const bi = useBi();
  const tabs = useTabs();
  const hidden: React.CSSProperties | undefined = isolate ? { visibility: 'hidden' } : undefined;
  // The copy grows a little and casts a deep shadow; the original underneath
  // disappears, so there is never a ghost of the same card behind it.
  const lifted = (l: number, i: number): React.CSSProperties => ({
    scale: String(1 + l * 0.24),
    translate: `0px ${-l * pt(4)}px`,
    rotate: `${l * (i === 0 ? -2.5 : 2)}deg`,
    filter: l > 0 ? `drop-shadow(0 ${pt(20) * l}px ${pt(26) * l}px rgba(15, 23, 60, ${0.45 * l}))` : undefined,
    opacity: isolate ? Math.min(1, l * 4) : 1 - Math.min(1, l * 4),
  });
  return (
    <AppScreen theme={theme} enterFrom={enterFrom} style={isolate ? { background: 'transparent' } : undefined}>
      <Scroll y={scroll}>
        <Enter order={0} style={hidden}>
          <DashboardHeader unread={unread} />
        </Enter>
        <Enter order={1} style={hidden}>
          <SchoolTitle />
        </Enter>
        <Enter order={2}>
          <Pad>
            <div style={hidden}>
              <SectionHeader title={bi(HOME.priorityAlerts)} />
            </div>
            <div style={lifted(lift[0], 0)}>
              <AlertRow severity="warning">{fill(bi(HOME.alerts.overdue_payments), { amount: money(FINANCE.overdue) })}</AlertRow>
            </div>
            <div style={lifted(lift[1], 1)}>
              <AlertRow severity="warning">{fill(bi(HOME.alerts.payroll_drafts_pending), { count: PAYROLL_DRAFTS })}</AlertRow>
            </div>
          </Pad>
        </Enter>
        {isolate ? null : (
          <HomeLower />
        )}
      </Scroll>
      {isolate ? null : <TabBar active="home" labels={tabs} />}
    </AppScreen>
  );
};

const HomeLower: React.FC = () => {
  const bi = useBi();
  return (
    <>
        <Enter order={3}>
          <Pad>
            <SectionHeader title={bi(HOME.nextActions)} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: pt(10) }}>
              <ActionTile icon="person-add-outline" label={bi(HOME.actions.onboard_students)} />
              <ActionTile icon="cash-outline" label={bi(HOME.actions.view_finance)} />
              <ActionTile icon="megaphone-outline" label={bi(HOME.actions.send_announcement)} />
            </div>
          </Pad>
        </Enter>
        <Enter order={4}>
          <Pad>
            <SectionHeader title={bi(HOME.overview)} />
            <div style={{ display: 'flex', gap: pt(10), marginBottom: pt(10) }}>
              <StatCard title={bi(HOME.kpis.students)} value={PEOPLE.students} icon="people" iconColor={APP.brand[500]} />
              <StatCard title={bi(HOME.kpis.teachers)} value={PEOPLE.teachers} icon="school" iconColor={APP.success} />
            </div>
            <div style={{ display: 'flex', gap: pt(10) }}>
              <StatCard title={bi(HOME.kpis.attendance)} value={percent(ATTENDANCE_RATE)} icon="checkmark-circle" iconColor={APP.info} />
              <StatCard title={bi(HOME.kpis.pending)} value={money(FINANCE.outstanding)} icon="cash" iconColor={APP.warning} />
            </div>
          </Pad>
        </Enter>
        <Enter order={5}>
          <div style={{ padding: `0 ${pt(16)}px`, marginBottom: pt(4) }}>
            <SectionHeader title={bi(HOME.recentActivity)} />
          </div>
          <ActivityFeed />
        </Enter>
    </>
  );
};

const SchoolTitle: React.FC = () => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  return (
    <div style={{ padding: `0 ${pt(16)}px ${pt(16)}px` }}>
      <div style={{ fontSize: pt(22), fontWeight: w.bold, color: c.text }}>{bi(SCHOOL)}</div>
      <div style={{ fontSize: pt(13), color: c.textSecondary, marginTop: pt(3) }}>{YEAR}</div>
    </div>
  );
};

const ActivityFeed: React.FC = () => {
  const bi = useBi();
  return (
    <>
      {ACTIVITY.map((a, i) => {
        const accent = a.kind === 'payment' ? APP.success : a.kind === 'expense' ? APP.error : APP.brand[500];
        return (
          <FeedRow
            key={i}
            first={i === 0}
            last={i === ACTIVITY.length - 1}
            icon={a.kind === 'payment' ? 'arrow-down' : a.kind === 'expense' ? 'arrow-up' : 'person-add-outline'}
            accent={accent}
            title={bi(a.name)}
            subtitle={`${bi(HOME.activities[a.kind])} · ${a.date}`}
            amount={a.amount !== undefined ? money(a.amount) : undefined}
          />
        );
      })}
    </>
  );
};

/** app/(app)/(admin)/finance/index.tsx: the finance dashboard. */
export const FinanceScreen: React.FC<ScreenProps & { chart?: number }> = ({
  theme = 'light',
  enterFrom,
  scroll = 0,
  progress = 1,
  chart = progress,
}) => {
  const bi = useBi();
  const tabs = useTabs();
  const c = themeColors(theme);
  return (
    <AppScreen theme={theme} enterFrom={enterFrom}>
      <Scroll y={scroll}>
        <Enter order={0}>
          <ScreenHeader title={bi(FINANCE_COPY.title)} subtitle={YEAR} />
        </Enter>
        <Enter order={1}>
          <Pad bottom={12}>
            <NetCard progress={progress} />
          </Pad>
        </Enter>
        <Enter order={2}>
          <div style={{ display: 'flex', gap: pt(12), padding: `0 ${pt(16)}px`, marginBottom: pt(20) }}>
            <MoneyTile
              icon="hourglass-outline"
              accent={APP.warning}
              label={bi(FINANCE_COPY.outstanding)}
              value={money(FINANCE.outstanding * progress)}
              caption={fill(bi(FINANCE_COPY.studentsWithBalance), { count: FINANCE.studentsWithBalance })}
            />
            <MoneyTile
              icon="alert-circle-outline"
              accent={APP.error}
              label={bi(FINANCE_COPY.overdue)}
              value={money(FINANCE.overdue * progress)}
              caption={fill(bi(FINANCE_COPY.overdueInvoices), { count: FINANCE.overdueInvoices })}
              captionColor={APP.error}
            />
          </div>
        </Enter>
        <Enter order={3}>
          <Pad bottom={20}>
            <SectionHeader title={bi(FINANCE_COPY.collectionRate)} />
            <CollectionCard progress={progress} />
          </Pad>
        </Enter>
        <Enter order={4}>
          <Pad bottom={20}>
            <SectionHeader title={bi(FINANCE_COPY.sixMonthTrend)} />
            <Card>
              <MonthlyTrend progress={chart} />
            </Card>
          </Pad>
        </Enter>
      </Scroll>
      {/* The page runs under the glass, as in the app. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: pt(40),
          background: `linear-gradient(${c.background}00, ${c.background})`,
        }}
      />
      <TabBar active="finance" labels={tabs} />
    </AppScreen>
  );
};

const NetCard: React.FC<{ progress: number }> = ({ progress }) => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  return (
    <Card>
      <div style={{ fontSize: pt(13), color: c.textSecondary }}>{bi(FINANCE_COPY.netIncomeThisMonth)}</div>
      <div style={{ fontSize: pt(32), fontWeight: w.bold, color: APP.success, marginTop: pt(4), whiteSpace: 'nowrap' }}>
        {money(FINANCE.netIncome * progress)}
      </div>
      <div style={{ display: 'flex', borderTop: `${pt(1)}px solid ${c.border}`, marginTop: pt(14), paddingTop: pt(14) }}>
        <Breakdown label={bi(FINANCE_COPY.collectedThisMonth)} value={money(FINANCE.collected * progress)} accent={APP.success} up={false} />
        <div style={{ width: pt(1), background: c.border }} />
        <Breakdown label={bi(FINANCE_COPY.spentThisMonth)} value={money(FINANCE.spent * progress)} accent={APP.error} up />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: pt(6), marginTop: pt(12) }}>
        <Ionicon name="trending-up" size={pt(16)} color={APP.success} />
        <span style={{ fontSize: pt(12), fontWeight: w.medium, color: APP.success }}>
          {fill(bi(FINANCE_COPY.vsLastMonth), { value: percent(FINANCE.growth) })}
        </span>
      </div>
    </Card>
  );
};

const Breakdown: React.FC<{ label: string; value: string; accent: string; up: boolean }> = ({ label, value, accent, up }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div style={{ flex: 1, padding: `0 ${pt(4)}px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: pt(5) }}>
        <Ionicon name={up ? 'arrow-up' : 'arrow-down'} size={pt(13)} color={accent} />
        <span style={{ fontSize: pt(11), color: c.textSecondary }}>{label}</span>
      </div>
      <div style={{ fontSize: pt(15), fontWeight: w.semiBold, color: accent, marginTop: pt(4), whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
};

const CollectionCard: React.FC<{ progress: number }> = ({ progress }) => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  const rate = FINANCE.collectionRate * progress;
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <span style={{ fontSize: pt(30), fontWeight: w.bold, color: APP.brand[500] }}>
          {/* Two decimals while counting, so the width does not jump. */}
          {progress < 1 ? `${rate.toFixed(2)}%` : percent(FINANCE.collectionRate)}
        </span>
        <span style={{ fontSize: pt(12), color: c.textSecondary, marginBottom: pt(6) }}>
          {fill(bi(FINANCE_COPY.paidOfIssued), { paid: FINANCE.paidInvoices, total: FINANCE.totalInvoices })}
        </span>
      </div>
      <div style={{ height: pt(10), borderRadius: pt(5), background: c.border, marginTop: pt(12), overflow: 'hidden' }}>
        <div style={{ width: `${rate}%`, height: '100%', background: APP.brand[500] }} />
      </div>
      <div style={{ fontSize: pt(12), color: c.textSecondary, marginTop: pt(10) }}>
        {fill(bi(FINANCE_COPY.averagePaymentTime), { days: FINANCE.averagePaymentDays })}
      </div>
    </Card>
  );
};

/** The six-month bars, as MonthlyTrend draws them; `progress` grows them from zero. */
export const MonthlyTrend: React.FC<{ progress: number }> = ({ progress }) => {
  const bi = useBi();
  const { lang } = useLang();
  const { c, dark } = useApp();
  const track = dark ? '#37415155' : '#f3f4f6';
  const peak = Math.max(...FINANCE.months.flatMap((m) => [m.revenue, m.expenses]));
  const bar = (ratio: number, color: string, i: number) => {
    // Each month grows a little after the one before it.
    const local = Math.min(1, Math.max(0, progress * 1.6 - i * 0.12));
    return (
      <div style={{ flex: 1, height: pt(100), borderRadius: pt(4), background: track, display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ width: '100%', height: `${Math.max(3, ratio * 100 * local)}%`, borderRadius: pt(4), background: color }} />
      </div>
    );
  };
  return (
    <>
      <div style={{ display: 'flex', gap: pt(6), height: pt(132) }}>
        {FINANCE.months.map((m, i) => (
          <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: pt(3), width: '100%' }}>
              {bar(m.revenue / peak, APP.success, i)}
              {bar(m.expenses / peak, APP.error, i)}
            </div>
            <div style={{ fontSize: pt(10), color: c.textSecondary, marginTop: pt(6), whiteSpace: 'nowrap' }}>
              {monthShort(m.month, lang)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: pt(16), marginTop: pt(12) }}>
        {[
          [APP.success, bi(FINANCE_COPY.revenue)],
          [APP.error, bi(FINANCE_COPY.expenses)],
        ].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: pt(6) }}>
            <div style={{ width: pt(8), height: pt(8), borderRadius: pt(4), background: color }} />
            <span style={{ fontSize: pt(12), color: c.textSecondary }}>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
};
