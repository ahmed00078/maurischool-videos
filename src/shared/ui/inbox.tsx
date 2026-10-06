import React from 'react';
import { INBOX_COPY } from '../appCopy';
import { useBi } from '../lang';
import { APP, pt } from '../tokens';
import { AppScreen, FloatingTabBar, useApp, useWeights } from './appkit';
import { IconName, Ionicon } from './Ionicon';

/**
 * The notification centre (mobile_app/src/components/shared/NotificationsScreen.tsx),
 * as a parent sees it: title and unread badge, "Tout marquer comme lu", the
 * All / Unread / Archived tray, then one card per notification, newest first.
 *
 * Unlike a locked phone, the inbox shows the detail of a sensitive event (the
 * grade, the amount), so a scene that has to show a value shows it here.
 */

/** notificationCategories.ts: the backend sends the category, the app maps it to a look. */
const CATEGORY = {
  attendance: { icon: 'calendar', color: '#0891b2' },
  grades: { icon: 'school', color: APP.info },
  finance: { icon: 'card', color: '#7c3aed' },
  behavior: { icon: 'eye', color: '#db2777' },
} as const satisfies Record<string, { icon: IconName; color: string }>;

export type InboxItem = {
  category: keyof typeof CATEGORY;
  /** HIGH and URGENT fill the icon tile instead of tinting it (a payment overdue is HIGH). */
  elevated?: boolean;
  unread?: boolean;
  title: string;
  message: string;
  /** formatNotificationTimestamp: "HH:MM" today. */
  time: string;
};

/**
 * Where row `i` sits on the screen, in app points from the top: status bar 44,
 * header 58, tray 44 + 6 + 12, list padding 4, then rows of 110 + 10.
 */
export const INBOX_ROW = { top: 168, height: 110, gap: 10 } as const;
export const inboxRowCenter = (i: number) => INBOX_ROW.top + i * (INBOX_ROW.height + INBOX_ROW.gap) + INBOX_ROW.height / 2;

const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

const Row: React.FC<{ item: InboxItem; emphasis: number }> = ({ item, emphasis }) => {
  const { c } = useApp();
  const w = useWeights();
  const { icon, color } = CATEGORY[item.category];
  const unread = item.unread ?? true;
  return (
    <div
      style={{
        position: 'relative',
        margin: `0 ${pt(16)}px ${pt(INBOX_ROW.gap)}px`,
        height: pt(INBOX_ROW.height),
        boxSizing: 'border-box',
        background: c.card,
        borderRadius: pt(16),
        border: `1px solid ${unread ? `${color}30` : c.border}`,
        overflow: 'hidden',
        display: 'flex',
        // The video's own emphasis, not the app's: a ring and a lift on the row being read.
        boxShadow: emphasis > 0 ? `0 0 0 ${pt(2.5) * emphasis}px ${color}, 0 ${pt(10) * emphasis}px ${pt(24)}px ${color}${hex(70 * emphasis)}` : undefined,
        scale: String(1 + 0.025 * emphasis),
      }}
    >
      {unread ? <div style={{ width: pt(4), background: color, flexShrink: 0 }} /> : null}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', padding: pt(14), gap: pt(12) }}>
        <div
          style={{
            width: pt(40),
            height: pt(40),
            flexShrink: 0,
            borderRadius: pt(12),
            background: item.elevated ? color : `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicon name={icon} size={pt(20)} color={item.elevated ? '#fff' : color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                marginInlineEnd: pt(8),
                fontSize: pt(15),
                lineHeight: `${pt(20)}px`,
                fontWeight: unread ? w.semiBold : w.regular,
                color: c.text,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.title}
            </div>
            {unread ? (
              <div style={{ width: pt(8), height: pt(8), borderRadius: pt(4), background: color, marginTop: pt(6), flexShrink: 0 }} />
            ) : null}
          </div>
          <div
            style={{
              marginTop: pt(3),
              fontSize: pt(13),
              lineHeight: `${pt(18)}px`,
              color: c.textSecondary,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.message}
          </div>
          <div style={{ marginTop: pt(6), fontSize: pt(12), lineHeight: `${pt(16)}px`, color: c.textSecondary }}>
            <bdi dir="ltr">{item.time}</bdi>
          </div>
        </div>
      </div>
    </div>
  );
};

/** SegmentedControl, `filled`: the brand pill under the active segment. */
const Tray: React.FC<{ labels: string[]; active: number }> = ({ labels, active }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div
      style={{
        display: 'flex',
        background: c.surface,
        borderRadius: pt(12),
        padding: pt(3),
        margin: `0 ${pt(16)}px ${pt(12)}px`,
      }}
    >
      {labels.map((label, i) => (
        <div
          key={label}
          style={{
            flex: 1,
            height: pt(44),
            borderRadius: pt(10),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: i === active ? APP.brand[500] : 'transparent',
            color: i === active ? '#fff' : c.textSecondary,
            fontSize: pt(14),
            fontWeight: i === active ? w.semiBold : w.medium,
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export const InboxScreen: React.FC<{
  items: InboxItem[];
  /** 0 to 1 per row: the video's highlight on the row being read. */
  emphasis?: number[];
  enterFrom?: number;
}> = ({ items, emphasis = [], enterFrom }) => {
  const bi = useBi();
  const w = useWeights();
  const unread = items.filter((i) => i.unread ?? true).length;
  return (
    <AppScreen enterFrom={enterFrom}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${pt(14)}px ${pt(16)}px`, height: pt(58), boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: pt(8) }}>
          <span style={{ fontSize: pt(22), fontWeight: w.bold }}>{bi(INBOX_COPY.title)}</span>
          {unread > 0 ? (
            <span
              style={{
                background: APP.brand[500],
                borderRadius: pt(10),
                padding: `${pt(2)}px ${pt(8)}px`,
                minWidth: pt(20),
                textAlign: 'center',
                fontSize: pt(12),
                fontWeight: w.semiBold,
                color: '#fff',
                boxSizing: 'border-box',
              }}
            >
              {unread}
            </span>
          ) : null}
        </div>
        {unread > 0 ? (
          <span
            style={{
              padding: `${pt(6)}px ${pt(12)}px`,
              borderRadius: pt(8),
              background: `${APP.brand[500]}10`,
              color: APP.brand[500],
              fontSize: pt(13),
              fontWeight: w.medium,
            }}
          >
            {bi(INBOX_COPY.markAllRead)}
          </span>
        ) : null}
      </div>
      <Tray labels={[bi(INBOX_COPY.all), bi(INBOX_COPY.unread), bi(INBOX_COPY.archived)]} active={0} />
      <div style={{ paddingTop: pt(4) }}>
        {items.map((item, i) => (
          <Row key={i} item={item} emphasis={emphasis[i] ?? 0} />
        ))}
      </div>
      {/* The parent's bar. Notifications is a hidden tab: the wash stays on the first tab, nothing focused. */}
      <FloatingTabBar
        wash={0}
        items={[
          { label: bi(INBOX_COPY.tabs.home), icon: 'logo', focused: false },
          { label: bi(INBOX_COPY.tabs.fees), icon: 'wallet-outline', focused: false },
          { label: bi(INBOX_COPY.tabs.observations), icon: 'eye-outline', focused: false },
          { label: bi(INBOX_COPY.tabs.profile), icon: 'person-outline', focused: false },
        ]}
      />
    </AppScreen>
  );
};
