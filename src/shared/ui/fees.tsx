import React from 'react';
import { FEES_COPY, INBOX_COPY } from '../appCopy';
import { amount, Bi, useBi } from '../lang';
import { APP, pt, Theme } from '../tokens';
import { AppScreen, Card, Enter, FloatingTabBar, StatCard, useApp, useWeights } from './appkit';
import { IconName, Ionicon } from './Ionicon';

/**
 * The parent's « Frais » tab (mobile_app/app/(app)/(parent)/fees.tsx): the
 * title, what is due and what is overdue, the Pending / History toggle, then
 * the list. A payment in the history links to its receipt (« Télécharger le
 * reçu »). There is no payment gateway: parents pay at the counter, the app
 * shows what was recorded.
 *
 * Line heights are set, so the rows land where FEES_TARGETS says (app points
 * from the top of the screen).
 */

/** One payment in the history, as the API sends it: the school names the fee. */
export type FeesPayment = { description: Bi; student: Bi; invoice: string; amount: number; date: string };

/** formatCurrency: grouped digits and MRU, kept left to right inside Arabic. */
const currency = (n: number) => (
  <bdi dir="ltr" style={{ unicodeBidi: 'isolate' }}>
    {amount(n)} MRU
  </bdi>
);

/**
 * Where things are, in app points: status bar 44, header 16 + 26 + 16, the
 * stat cards 135 and 16 under them, the toggle 52 (4 + 44 + 4), 16 under it,
 * then the history card: 16 in, 39 of text, the link 12 + 1 + 12 + 17 + 8.
 */
const TOGGLE_Y = 44 + 58 + 135 + 16;
const LIST_Y = TOGGLE_Y + 52 + 16;
export const FEES_TARGETS = {
  /** The « Historique » tab: the right half of the toggle, or the left in Arabic. */
  historyTab: (rtl: boolean): [number, number] => [rtl ? 16 + 4 + 87.5 : 390 - 16 - 4 - 87.5, TOGGLE_Y + 26],
  /** « Télécharger le reçu » on the first payment. */
  download: (): [number, number] => [195, LIST_Y + 1 + 16 + 39 + 12 + 1 + 12 + 8.5],
  /** The first payment card's centre, for a camera. */
  card: (): [number, number] => [195, LIST_Y + 62],
};

const Toggle: React.FC<{ tab: 'pending' | 'history'; pending: number; history: number; press: number }> = ({ tab, pending, history, press }) => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  const tabs: { key: 'pending' | 'history'; label: string; icon: IconName }[] = [
    { key: 'pending', label: `${bi(FEES_COPY.pendingFees)} (${pending})`, icon: 'time-outline' },
    { key: 'history', label: `${bi(FEES_COPY.paymentHistory)} (${history})`, icon: 'receipt-outline' },
  ];
  return (
    <div style={{ display: 'flex', margin: `0 ${pt(16)}px ${pt(16)}px`, background: c.surface, borderRadius: pt(12), padding: pt(4) }}>
      {tabs.map((t) => {
        const on = t.key === tab;
        return (
          <div
            key={t.key}
            style={{
              flex: 1,
              minWidth: 0,
              height: pt(44),
              padding: `0 ${pt(12)}px`,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: pt(4),
              borderRadius: pt(10),
              background: on ? '#ffffff' : 'transparent',
              boxShadow: on ? `0 ${pt(1)}px ${pt(3)}px rgba(17,24,39,0.08)` : undefined,
              scale: String(t.key === 'history' ? 1 - press * 0.04 : 1),
            }}
          >
            <Ionicon name={t.icon} size={pt(14)} color={on ? APP.brand[500] : c.textSecondary} />
            <span
              style={{
                minWidth: 0,
                fontSize: pt(12),
                lineHeight: `${pt(16)}px`,
                color: on ? APP.brand[500] : c.textSecondary,
                fontWeight: on ? w.semiBold : w.regular,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const PaymentCard: React.FC<{ payment: FeesPayment; press: number; emphasis: number }> = ({ payment, press, emphasis }) => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  return (
    <div style={{ padding: `0 ${pt(16)}px` }}>
      <Card
        style={{
          marginBottom: pt(12),
          boxShadow: emphasis > 0 ? `0 0 0 ${pt(2.5) * emphasis}px ${APP.success}, 0 ${pt(10) * emphasis}px ${pt(24)}px rgba(22,163,74,${0.28 * emphasis})` : undefined,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: pt(15), lineHeight: `${pt(20)}px`, color: c.text, fontWeight: w.semiBold }}>{bi(payment.description)}</div>
            <div style={{ fontSize: pt(13), lineHeight: `${pt(17)}px`, color: c.textSecondary, marginTop: pt(2) }}>
              {bi(payment.student)}
              {` - ${payment.invoice}`}
            </div>
          </div>
          <div style={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: pt(16), lineHeight: `${pt(21)}px`, color: APP.success, fontWeight: w.bold, whiteSpace: 'nowrap' }}>{currency(payment.amount)}</div>
            <div style={{ fontSize: pt(12), lineHeight: `${pt(16)}px`, color: c.textSecondary, marginTop: pt(2) }}>
              <bdi dir="ltr">{payment.date}</bdi>
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: pt(6),
            marginTop: pt(12),
            paddingTop: pt(12),
            paddingBottom: pt(8),
            borderTop: `${pt(1)}px solid ${c.border}`,
            scale: String(1 - press * 0.05),
            opacity: 1 - press * 0.3,
          }}
        >
          <Ionicon name="download-outline" size={pt(14)} color={APP.brand[500]} />
          <span style={{ fontSize: pt(13), lineHeight: `${pt(17)}px`, color: APP.brand[500], fontWeight: w.medium }}>{bi(FEES_COPY.downloadReceipt)}</span>
        </div>
      </Card>
    </div>
  );
};

/** The pending tab with nothing left to pay: the green check. */
const AllPaid: React.FC = () => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${pt(40)}px 0` }}>
      <Ionicon name="checkmark-circle" size={pt(48)} color={APP.success} />
      <div style={{ fontSize: pt(16), color: c.text, marginTop: pt(12), fontWeight: w.semiBold }}>{bi(FEES_COPY.allPaid)}</div>
      <div style={{ fontSize: pt(13), color: c.textSecondary, marginTop: pt(4) }}>{bi(FEES_COPY.noFeesPending)}</div>
    </div>
  );
};

export const ParentFeesScreen: React.FC<{
  theme?: Theme;
  enterFrom?: number;
  tab: 'pending' | 'history';
  /** Everything is paid in the story: the history holds this one payment. */
  payment: FeesPayment;
  /** 0 to 1: a finger on the « Historique » tab, on « Télécharger le reçu ». */
  tabPress?: number;
  linkPress?: number;
  /** 0 to 1: the video's highlight on the payment card. */
  emphasis?: number;
}> = ({ theme = 'light', enterFrom, tab, payment, tabPress = 0, linkPress = 0, emphasis = 0 }) => {
  const bi = useBi();
  const w = useWeights();
  return (
    <AppScreen theme={theme} enterFrom={enterFrom}>
      <Enter order={0}>
        {/* ScreenHeader with paddingBottom 16 */}
        <div style={{ padding: `${pt(16)}px ${pt(16)}px ${pt(16)}px`, fontSize: pt(20), lineHeight: `${pt(26)}px`, fontWeight: w.bold }}>{bi(FEES_COPY.fees)}</div>
      </Enter>
      <Enter order={1}>
        <div style={{ display: 'flex', gap: pt(12), padding: `0 ${pt(16)}px`, marginBottom: pt(16), height: pt(135), boxSizing: 'border-box' }}>
          <StatCard title={bi(FEES_COPY.totalDue)} value={currency(0)} icon="cash" iconColor={APP.success} />
          <StatCard title={bi(FEES_COPY.overdueAmount)} value="0" icon="alert-circle" iconColor={APP.success} />
        </div>
      </Enter>
      <Enter order={2}>
        <Toggle tab={tab} pending={0} history={1} press={tabPress} />
      </Enter>
      <Enter order={3}>{tab === 'pending' ? <AllPaid /> : <PaymentCard payment={payment} press={linkPress} emphasis={emphasis} />}</Enter>
      <FloatingTabBar
        wash={1}
        items={[
          { label: bi(INBOX_COPY.tabs.home), icon: 'logo', focused: false },
          { label: bi(INBOX_COPY.tabs.fees), icon: 'wallet', focused: true },
          { label: bi(INBOX_COPY.tabs.observations), icon: 'eye-outline', focused: false },
          { label: bi(INBOX_COPY.tabs.profile), icon: 'person-outline', focused: false },
        ]}
      />
    </AppScreen>
  );
};
