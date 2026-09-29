import React, { createContext, useContext } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useLang } from '../lang';
import { APP, pt, SCREEN_H, SCREEN_W, Theme, themeColors } from '../tokens';
import { IconName, Ionicon } from './Ionicon';
import { LogoMark } from './LogoMark';

/**
 * The app's own components, rebuilt for the video. Each one mirrors the
 * mobile_app component of the same name, measured in app points through
 * `pt()`, so a screen built here lays out like the phone.
 */

type AppCtx = {
  theme: Theme;
  /** When set, blocks enter one after another from this frame; otherwise they are static. */
  enterFrom?: number;
};
const Ctx = createContext<AppCtx>({ theme: 'light' });
export const useApp = () => {
  const ctx = useContext(Ctx);
  return { ...ctx, c: themeColors(ctx.theme), dark: ctx.theme === 'dark' };
};

/** Theme for app components drawn outside a phone (a card lifted out of the screen). */
export const AppScope: React.FC<{ theme: Theme; children: React.ReactNode }> = ({ theme, children }) => (
  <Ctx.Provider value={{ theme }}>{children}</Ctx.Provider>
);

/** ThemeContext.fonts: Tajawal has no 600, so semiBold is 700 in Arabic. */
export const useWeights = () => {
  const { rtl } = useLang();
  return { regular: 400, medium: 500, semiBold: rtl ? 700 : 600, bold: 700 } as const;
};

/** A full phone screen in the app's theme and the video's language. */
export const AppScreen: React.FC<{
  theme?: Theme;
  enterFrom?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ theme = 'light', enterFrom, children, style }) => {
  const { dir, font } = useLang();
  const c = themeColors(theme);
  return (
    <Ctx.Provider value={{ theme, enterFrom }}>
      <div
        dir={dir}
        style={{
          position: 'absolute',
          inset: 0,
          width: SCREEN_W,
          height: SCREEN_H,
          background: c.background,
          color: c.text,
          fontFamily: font,
          paddingTop: pt(44), // the status bar
          boxSizing: 'border-box',
          overflow: 'hidden',
          ...style,
        }}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
};

/**
 * Staggered entrance for one block of a screen: rises 18 pt and fades in.
 * Static when the screen has no `enterFrom`.
 */
export const Enter: React.FC<{ order: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  order,
  children,
  style,
}) => {
  const { enterFrom } = useContext(Ctx);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p =
    enterFrom === undefined ? 1 : spring({ frame: frame - enterFrom - order * 3, fps, config: { damping: 18, stiffness: 140 } });
  return (
    <div style={{ opacity: Math.min(1, p * 1.3), translate: `0px ${(1 - p) * pt(18)}px`, ...style }}>{children}</div>
  );
};

/** DashboardHeader: logo, two-tone wordmark, and the notification bell with its badge. */
export const DashboardHeader: React.FC<{ unread?: number }> = ({ unread = 0 }) => {
  const { c, dark } = useApp();
  const w = useWeights();
  const violet = dark ? APP.brand[400] : APP.logo.violet;
  const ink = dark ? c.text : APP.logo.ink;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${pt(12)}px ${pt(16)}px ${pt(4)}px`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: pt(9), direction: 'ltr' }}>
        <LogoMark width={pt(32)} violet={violet} ink={dark ? APP.brand[200] : APP.logo.ink} />
        <span
          style={{
            fontWeight: w.bold,
            fontSize: pt(29),
            lineHeight: `${pt(32)}px`,
            letterSpacing: -0.45,
            color: violet,
          }}
        >
          Mauri<span style={{ color: ink }}>School</span>
        </span>
      </div>
      <div style={{ position: 'relative', padding: pt(4) }}>
        <Ionicon name="notifications-outline" size={pt(24)} color={c.text} />
        {unread > 0 ? (
          <div
            style={{
              position: 'absolute',
              top: -pt(2),
              insetInlineEnd: -pt(4),
              minWidth: pt(18),
              height: pt(18),
              borderRadius: pt(9),
              background: APP.error,
              color: APP.white,
              fontSize: pt(11),
              fontWeight: w.semiBold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `0 ${pt(4)}px`,
              boxSizing: 'border-box',
            }}
          >
            {unread}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** ScreenHeader: 20 pt bold title, 13 pt subtitle. */
export const ScreenHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div style={{ padding: `${pt(16)}px ${pt(16)}px ${pt(12)}px` }}>
      <div style={{ fontSize: pt(20), fontWeight: w.bold, color: c.text }}>{title}</div>
      {subtitle ? (
        <div style={{ fontSize: pt(13), fontWeight: w.regular, color: c.textSecondary, marginTop: pt(2) }}>{subtitle}</div>
      ) : null}
    </div>
  );
};

/** SectionHeader: 17 pt semibold, 12 pt below. */
export const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div
      style={{
        fontSize: pt(17),
        fontWeight: w.semiBold,
        color: c.text,
        marginBottom: pt(12),
        padding: `0 ${pt(4)}px`,
      }}
    >
      {title}
    </div>
  );
};

/** Card: 16 pt radius, 1 pt border, 16 pt padding. */
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { c } = useApp();
  return (
    <div
      style={{
        background: c.card,
        borderRadius: pt(16),
        border: `${pt(1)}px solid ${c.border}`,
        padding: pt(16),
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** An icon on a light tint of its colour, as StatCard and MoneyTile draw it. */
export const IconChip: React.FC<{ name: IconName; color: string; box: number; icon: number; radius?: number; alpha?: string }> = ({
  name,
  color,
  box,
  icon,
  radius = 10,
  alpha = '15',
}) => (
  <div
    style={{
      width: pt(box),
      height: pt(box),
      borderRadius: pt(radius),
      background: `${color}${alpha}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <Ionicon name={name} size={pt(icon)} color={color} />
  </div>
);

/** StatCard (full variant). */
export const StatCard: React.FC<{ title: string; value: React.ReactNode; icon: IconName; iconColor: string }> = ({
  title,
  value,
  icon,
  iconColor,
}) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <div style={{ marginBottom: pt(12) }}>
        <IconChip name={icon} color={iconColor} box={40} icon={20} />
      </div>
      <div style={{ fontSize: pt(22), fontWeight: w.bold, color: c.text, marginBottom: pt(4), whiteSpace: 'nowrap' }}>
        {value}
      </div>
      <div style={{ fontSize: pt(13), fontWeight: w.regular, color: c.textSecondary }}>{title}</div>
    </Card>
  );
};

/** The admin home's priority alert row. */
export const AlertRow: React.FC<{ severity: 'critical' | 'warning' | 'info'; children: React.ReactNode }> = ({
  severity,
  children,
}) => {
  const { c } = useApp();
  const { rtl } = useLang();
  const w = useWeights();
  const tone = severity === 'critical' ? APP.error : severity === 'warning' ? APP.warning : APP.info;
  const icon: IconName = severity === 'critical' ? 'alert-circle' : severity === 'warning' ? 'warning' : 'alert-circle-outline';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: pt(10),
        padding: pt(12),
        borderRadius: pt(12),
        border: `${pt(1)}px solid ${tone}55`,
        background: `${tone}12`,
        marginBottom: pt(8),
      }}
    >
      <Ionicon name={icon} size={pt(21)} color={tone} />
      <div style={{ flex: 1, fontSize: pt(13), fontWeight: w.medium, color: c.text }}>{children}</div>
      {/* DirectionalIcon: the chevron points forward in the reading direction. */}
      <Ionicon name={rtl ? 'chevron-back' : 'chevron-forward'} size={pt(17)} color={tone} />
    </div>
  );
};

/** A "Prochaines actions" tile. */
export const ActionTile: React.FC<{ icon: IconName; label: string }> = ({ icon, label }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div
      style={{
        width: '48%',
        minHeight: pt(88),
        borderRadius: pt(14),
        padding: pt(13),
        border: `${pt(1)}px solid ${c.border}`,
        background: c.card,
        boxSizing: 'border-box',
      }}
    >
      <Ionicon name={icon} size={pt(22)} color={APP.brand[500]} />
      <div style={{ fontSize: pt(13), fontWeight: w.semiBold, color: c.text, marginTop: pt(8) }}>{label}</div>
    </div>
  );
};

/** One row of a groupedRowStyle feed: consecutive rows read as one card. */
export const FeedRow: React.FC<{
  icon: IconName;
  accent: string;
  title: string;
  subtitle: string;
  amount?: React.ReactNode;
  first: boolean;
  last: boolean;
}> = ({ icon, accent, title, subtitle, amount, first, last }) => {
  const { c } = useApp();
  const w = useWeights();
  const r = pt(16);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${pt(10)}px ${pt(16)}px`,
        margin: `0 ${pt(16)}px ${last ? pt(8) : 0}px`,
        background: c.card,
        borderStyle: 'solid',
        borderColor: c.border,
        borderWidth: `${pt(1)}px ${pt(1)}px ${last ? pt(1) : 0}px`,
        borderRadius: `${first ? r : 0}px ${first ? r : 0}px ${last ? r : 0}px ${last ? r : 0}px`,
      }}
    >
      <IconChip name={icon} color={accent} box={34} icon={16} alpha="18" />
      <div style={{ flex: 1, minWidth: 0, marginInlineStart: pt(12) }}>
        <div
          style={{
            fontSize: pt(14),
            fontWeight: w.medium,
            color: c.text,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: pt(12), fontWeight: w.regular, color: c.textSecondary, marginTop: pt(2) }}>{subtitle}</div>
      </div>
      {amount !== undefined ? (
        <div style={{ fontSize: pt(14), fontWeight: w.semiBold, color: accent, marginInlineStart: pt(8), whiteSpace: 'nowrap' }}>
          {amount}
        </div>
      ) : null}
    </div>
  );
};

/** MoneyTile: a finance KPI tile. */
export const MoneyTile: React.FC<{
  icon: IconName;
  accent: string;
  label: string;
  value: React.ReactNode;
  caption?: string;
  captionColor?: string;
}> = ({ icon, accent, label, value, caption, captionColor }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: c.card,
        border: `${pt(1)}px solid ${c.border}`,
        borderRadius: pt(16),
        padding: pt(14),
      }}
    >
      <div style={{ marginBottom: pt(10) }}>
        <IconChip name={icon} color={accent} box={34} icon={18} alpha="18" />
      </div>
      <div style={{ fontSize: pt(11), fontWeight: w.regular, color: c.textSecondary, marginBottom: pt(4) }}>{label}</div>
      <div style={{ fontSize: pt(16), fontWeight: w.bold, color: c.text, whiteSpace: 'nowrap' }}>{value}</div>
      {caption ? (
        <div style={{ fontSize: pt(11), fontWeight: w.medium, color: captionColor ?? c.textSecondary, marginTop: pt(3) }}>
          {caption}
        </div>
      ) : null}
    </div>
  );
};

export type TabKey = 'home' | 'people' | 'academics' | 'finance' | 'more';
const TAB_ICONS: Record<Exclude<TabKey, 'home'>, [IconName, IconName]> = {
  people: ['people', 'people-outline'],
  academics: ['school', 'school-outline'],
  finance: ['wallet', 'wallet-outline'],
  more: ['ellipsis-horizontal', 'ellipsis-horizontal'],
};

/**
 * FloatingTabBar: the dark glass pill, 60 pt tall, 20 pt from each side,
 * active tab lifted by a white wash. Mirrors in Arabic.
 */
export const TabBar: React.FC<{ active: TabKey; labels: Record<TabKey, string>; bottom?: number }> = ({
  active,
  labels,
  bottom = 10 + 24,
}) => {
  const { dir } = useLang();
  const w = useWeights();
  const keys: TabKey[] = ['home', 'people', 'academics', 'finance', 'more'];
  return (
    <div
      dir={dir}
      style={{
        position: 'absolute',
        left: pt(20),
        right: pt(20),
        bottom: pt(bottom),
        height: pt(60),
        borderRadius: 999,
        overflow: 'hidden',
        display: 'flex',
        padding: `0 ${pt(12)}px`,
        boxSizing: 'border-box',
        border: `1px solid ${APP.glass.content}1a`,
        background: `linear-gradient(${APP.glass.tint}e0, ${APP.glass.tint}f2)`,
        zIndex: 5,
      }}
    >
      {keys.map((k) => {
        const on = k === active;
        const color = on ? APP.glass.content : APP.glass.contentMuted;
        return (
          <div
            key={k}
            style={{
              flex: 1,
              margin: `${pt(8)}px ${pt(2)}px`,
              borderRadius: 999,
              background: on ? `${APP.glass.content}24` : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: pt(2),
            }}
          >
            {k === 'home' ? (
              <LogoMark width={pt(20)} violet={color} ink={color} />
            ) : (
              <Ionicon name={TAB_ICONS[k][on ? 0 : 1]} size={pt(22)} color={color} />
            )}
            <div
              style={{
                fontSize: pt(11),
                lineHeight: `${pt(13)}px`,
                color,
                fontWeight: on ? w.semiBold : w.regular,
                whiteSpace: 'nowrap',
              }}
            >
              {labels[k]}
            </div>
          </div>
        );
      })}
    </div>
  );
};
