import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FINANCE_COPY, HOME, SCREEN_COPY, TABS } from '../appCopy';
import { ATTENDANCE_RATE, FINANCE, PEOPLE, PUPIL, PUPIL_CLASS, SCHOOL, YEAR } from '../demo';
import { monthShort, percent, useBi, useLang } from '../lang';
import { APP, OUTFIT } from '../tokens';
import { IconName, Ionicon } from './Ionicon';
import { LogoMark, PIECES } from './LogoMark';
import { money } from './screens';
import { OVERALL_AVERAGE, PERIOD } from './screens2';

/** A chat bubble that pops in from its tail corner. */
export const ChatBubble: React.FC<{
  text: string;
  at: number;
  side: 'start' | 'end';
  sender?: string;
  tone?: 'white' | 'green';
  style?: React.CSSProperties;
}> = ({ text, at, side, sender, tone = 'white', style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { dir, font, rtl } = useLang();
  const p = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 200 } });
  // The tail sits at the bubble's start or end corner, mirrored in Arabic.
  const physicalLeft = (side === 'start') !== rtl;
  return (
    <div
      dir={dir}
      style={{
        position: 'absolute',
        maxWidth: 700,
        padding: '22px 30px',
        borderRadius: 38,
        [physicalLeft ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: 8,
        background: tone === 'green' ? '#d9fdd3' : '#ffffff',
        color: '#111b21',
        fontFamily: font,
        fontSize: 44,
        fontWeight: 500,
        lineHeight: 1.25,
        boxShadow: '0 14px 30px rgba(5, 10, 40, 0.35)',
        transformOrigin: physicalLeft ? 'bottom left' : 'bottom right',
        scale: String(p),
        opacity: Math.min(1, p * 2),
        ...style,
      }}
    >
      {sender ? (
        <div style={{ fontSize: 30, fontWeight: 700, color: APP.brand[600], marginBottom: 4 }}>{sender}</div>
      ) : null}
      {text}
    </div>
  );
};

/**
 * The mark assembling from its pieces: each piece flies in from far away on
 * a spring, one after another, and locks into place.
 */
export const LogoAssemble: React.FC<{
  width: number;
  start: number;
  step: number;
  /** Where each piece starts, in viewBox units, and its starting turn. */
  from?: (i: number) => [number, number, number];
  violet?: string;
  ink?: string;
}> = ({ width, start, step, from, violet, ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const origin =
    from ??
    ((i: number) => {
      const a = (i / PIECES.length) * Math.PI * 2 + 0.6;
      return [Math.cos(a) * 1500, Math.sin(a) * 1500, (i % 2 ? 1 : -1) * 120];
    });
  return (
    <LogoMark
      width={width}
      violet={violet}
      ink={ink}
      piece={(_, i) => {
        const p = spring({ frame: frame - start - i * step, fps, config: { damping: 13, stiffness: 120 } });
        const [dx, dy, r] = origin(i);
        return { x: dx * (1 - p), y: dy * (1 - p), rotate: r * (1 - p), scale: 0.4 + 0.6 * p, opacity: p > 0.01 ? 1 : 0 };
      }}
    />
  );
};

/** The report card as a printed A4 page: what "Télécharger" gives the parent. */
export const ReportCardDoc: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => {
  const bi = useBi();
  const { dir, font } = useLang();
  const u = width / 100; // 1 unit = 1 % of the page width
  const rows: [string, number][] = [
    [bi({ fr: 'Mathématiques', ar: 'الرياضيات' }), 16],
    [bi({ fr: 'Langue arabe', ar: 'اللغة العربية' }), 15.5],
    [bi({ fr: 'Français', ar: 'اللغة الفرنسية' }), 13],
    [bi({ fr: 'Sciences naturelles', ar: 'العلوم الطبيعية' }), 14.5],
    [bi({ fr: 'Éducation islamique', ar: 'التربية الإسلامية' }), 17],
  ];
  return (
    <div
      dir={dir}
      style={{
        width,
        height: width * 1.414,
        background: '#fff',
        borderRadius: u * 1.2,
        padding: `${u * 7}px ${u * 7}px`,
        boxSizing: 'border-box',
        fontFamily: font,
        color: APP.light.text,
        boxShadow: '0 40px 80px rgba(8, 12, 40, 0.45)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: u * 3, borderBottom: `${u * 0.4}px solid ${APP.brand[500]}`, paddingBottom: u * 3 }}>
        <LogoMark width={u * 12} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: u * 4.6, fontWeight: 700 }}>{bi(SCHOOL)}</div>
          <div style={{ fontSize: u * 3.2, color: APP.light.textSecondary }}>{YEAR}</div>
        </div>
      </div>
      <div style={{ fontSize: u * 6.4, fontWeight: 800, marginTop: u * 5, color: APP.brand[600] }}>
        {bi({ fr: 'Bulletin', ar: 'كشف الدرجات' })} · {bi(PERIOD)}
      </div>
      <div style={{ fontSize: u * 4, marginTop: u * 1.5 }}>
        {bi(PUPIL)} · {bi(PUPIL_CLASS)}
      </div>
      <div style={{ marginTop: u * 5, border: `${u * 0.25}px solid ${APP.light.border}`, borderRadius: u * 1.5, overflow: 'hidden' }}>
        {rows.map(([name, g], i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              padding: `${u * 2.4}px ${u * 3}px`,
              fontSize: u * 3.8,
              background: i % 2 ? APP.light.surface : '#fff',
            }}
          >
            <span style={{ flex: 1 }}>{name}</span>
            <span style={{ fontWeight: 700, direction: 'ltr' }}>{g}/20</span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: u * 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${u * 3}px ${u * 4}px`,
          borderRadius: u * 2,
          background: APP.brand[50],
        }}
      >
        <span style={{ fontSize: u * 4.2, fontWeight: 700 }}>{bi(SCREEN_COPY.overallAverage)}</span>
        <span style={{ fontSize: u * 7, fontWeight: 800, color: APP.brand[600], direction: 'ltr' }}>{OVERALL_AVERAGE.toFixed(2)}/20</span>
      </div>
      {/* The school's stamp */}
      <div
        style={{
          position: 'absolute',
          insetInlineEnd: u * 8,
          bottom: u * 9,
          width: u * 22,
          height: u * 22,
          borderRadius: '50%',
          border: `${u * 0.8}px solid ${APP.brand[500]}aa`,
          color: `${APP.brand[500]}cc`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          rotate: '-14deg',
          fontFamily: OUTFIT,
          fontWeight: 800,
          fontSize: u * 3.2,
          textAlign: 'center',
          lineHeight: 1.1,
        }}
      >
        MAURI
        <br />
        SCHOOL
      </div>
    </div>
  );
};

/**
 * A laptop showing the web workspace: sidebar, KPI cards, the six-month chart.
 * A stylised stand-in for frontend/, drawn with the app's figures.
 */
export const Laptop: React.FC<{ width: number; style?: React.CSSProperties; grow?: number }> = ({ width, style, grow = 1 }) => {
  const bi = useBi();
  const { dir, font, lang } = useLang();
  const u = width / 100;
  const screenH = width * 0.6;
  const peak = Math.max(...FINANCE.months.map((m) => m.revenue));
  const nav: [IconName, string][] = [
    ['home-outline', bi(TABS.home)],
    ['people-outline', bi(TABS.people)],
    ['school-outline', bi(TABS.academics)],
    ['wallet-outline', bi(TABS.finance)],
  ];
  const kpis: [string, string][] = [
    [bi(HOME.kpis.students), String(PEOPLE.students)],
    [bi(HOME.kpis.teachers), String(PEOPLE.teachers)],
    [bi(HOME.kpis.attendance), percent(ATTENDANCE_RATE)],
    [bi(FINANCE_COPY.collectionRate), percent(FINANCE.collectionRate)],
  ];
  return (
    <div style={{ width, ...style }}>
      <div
        style={{
          width,
          height: screenH,
          borderRadius: `${u * 2.2}px ${u * 2.2}px 0 0`,
          background: '#0d0f1a',
          padding: u * 1.6,
          boxSizing: 'border-box',
          boxShadow: '0 40px 80px rgba(8, 12, 40, 0.35)',
        }}
      >
        <div
          dir={dir}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: u * 0.8,
            overflow: 'hidden',
            background: APP.light.surface,
            display: 'flex',
            fontFamily: font,
          }}
        >
          <div style={{ width: u * 18, background: '#fff', borderInlineEnd: `1px solid ${APP.light.border}`, padding: u * 1.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: u * 0.8, direction: 'ltr', marginBottom: u * 2.4 }}>
              <LogoMark width={u * 3} />
              <span style={{ fontFamily: OUTFIT, fontWeight: 700, fontSize: u * 1.9, color: APP.logo.violet }}>
                Mauri<span style={{ color: APP.logo.ink }}>School</span>
              </span>
            </div>
            {nav.map(([icon, label], i) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: u * 0.9,
                  padding: `${u * 0.9}px ${u * 1}px`,
                  borderRadius: u * 0.8,
                  marginBottom: u * 0.5,
                  fontSize: u * 1.4,
                  fontWeight: i === 0 ? 700 : 500,
                  color: i === 0 ? APP.brand[600] : APP.light.textSecondary,
                  background: i === 0 ? APP.brand[50] : 'transparent',
                }}
              >
                <Ionicon name={icon} size={u * 1.8} color={i === 0 ? APP.brand[500] : APP.light.textSecondary} />
                {label}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: u * 2 }}>
            <div style={{ fontSize: u * 2.4, fontWeight: 700, color: APP.light.text }}>{bi(SCHOOL)}</div>
            <div style={{ fontSize: u * 1.3, color: APP.light.textSecondary, marginBottom: u * 1.6 }}>{YEAR}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: u * 1.2 }}>
              {kpis.map(([label, value]) => (
                <div key={label} style={{ background: '#fff', border: `1px solid ${APP.light.border}`, borderRadius: u * 1, padding: u * 1.3 }}>
                  <div style={{ fontSize: u * 1.1, color: APP.light.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</div>
                  <div style={{ fontSize: u * 2.4, fontWeight: 700, color: APP.light.text, marginTop: u * 0.4 }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: u * 1.2, marginTop: u * 1.4 }}>
              <div style={{ flex: 2, background: '#fff', border: `1px solid ${APP.light.border}`, borderRadius: u * 1, padding: u * 1.4 }}>
                <div style={{ fontSize: u * 1.4, fontWeight: 700, color: APP.light.text, marginBottom: u * 1 }}>{bi(FINANCE_COPY.sixMonthTrend)}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: u * 1.2, height: u * 13 }}>
                  {FINANCE.months.map((m, i) => (
                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u * 0.4 }}>
                      <div
                        style={{
                          width: '70%',
                          height: u * 11 * (m.revenue / peak) * Math.min(1, Math.max(0, grow * 1.6 - i * 0.12)),
                          borderRadius: u * 0.5,
                          background: APP.success,
                        }}
                      />
                      <span style={{ fontSize: u * 1, color: APP.light.textSecondary }}>{monthShort(m.month, lang)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, background: '#fff', border: `1px solid ${APP.light.border}`, borderRadius: u * 1, padding: u * 1.4 }}>
                <div style={{ fontSize: u * 1.4, fontWeight: 700, color: APP.light.text }}>{bi(FINANCE_COPY.overdue)}</div>
                <div style={{ fontSize: u * 2.6, fontWeight: 800, color: APP.error, marginTop: u * 1 }}>{money(FINANCE.overdue)}</div>
                <div style={{ fontSize: u * 1.2, color: APP.light.textSecondary, marginTop: u * 0.6, fontFamily: font }}>
                  {FINANCE.overdueInvoices} {bi({ fr: 'factures échues', ar: 'فواتير متأخرة' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Base */}
      <div
        style={{
          width: width * 1.12,
          marginLeft: -width * 0.06,
          height: u * 2.4,
          borderRadius: `0 0 ${u * 2}px ${u * 2}px`,
          background: 'linear-gradient(#c9cddb, #9aa0b5)',
        }}
      />
    </div>
  );
};
