import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { LockScreen, Notification } from '../components/Notification';
import { Phone, ScreenHeader } from '../components/Phone';
import { RoleChip } from '../components/RoleChip';
import { AR, C, ease, useOffscreen, fmt, FR, toneBg } from '../theme';

const SWAP = 84; // director's phone leaves, parent's phone arrives
const NOTIFY = 104;

const LATE = [
  { name: 'محمد سالم', cls: 'الخامسة أ', amount: 3000 },
  { name: 'فاطمة الشيخ', cls: 'الثالثة ب', amount: 4500 },
  { name: 'عبد الله أحمد', cls: 'السادسة أ', amount: 3000 },
];

const Stat: React.FC<{ label: string; value: string; color: string; ring?: number }> = ({
  label,
  value,
  color,
  ring = 0,
}) => (
  <div
    style={{
      flex: 1,
      borderRadius: 30,
      background: C.white,
      padding: '22px 26px',
      border: `3px solid ${ring > 0 ? color : C.line}`,
      boxShadow: ring > 0 ? `0 0 0 ${ring * 10}px ${color}22` : 'none',
    }}
  >
    <div style={{ fontSize: 28, color: C.inkSoft }}>{label}</div>
    <div style={{ fontFamily: FR, fontWeight: 800, fontSize: 64, color }}>{value}</div>
  </div>
);

// 0:10 — the director sees who paid and who is late; the parent gets the reminder.
export const S4Fees: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const off = useOffscreen();
  const swap = ease(frame, [SWAP, SWAP + 18], [0, 1]);
  const ring = ease(frame, [52, 60], [0, 1]) * (1 - ease(frame, [74, 84], [0, 1]));
  const collected = ease(frame, [10, 50], [0, 1245000]);
  const rate = ease(frame, [10, 50], [0, 87]);
  return (
    <AbsoluteFill style={{ background: toneBg.light }}>
      <RoleChip tone="light" ar="المدير" fr="Direction" to={SWAP + 6} />
      <RoleChip tone="light" ar="الوليّ" fr="Parent" from={SWAP + 8} />

      <Phone
        screen={C.paper}
        style={{
          left: 240,
          top: 210,
          translate: `${swap * -off}px ${(1 - enter) * 900}px`,
          rotate: `${swap * -8}deg`,
        }}
      >
        <ScreenHeader title="المالية" subtitle="أكتوبر 2026" />
        <div dir="rtl" style={{ padding: '0 30px', fontFamily: AR, display: 'grid', gap: 20 }}>
          <div style={{ borderRadius: 34, background: C.brand, padding: '28px 30px', color: C.white }}>
            <div style={{ fontSize: 30, opacity: 0.85 }}>المحصّل</div>
            <div style={{ fontFamily: FR, fontWeight: 800, fontSize: 70, direction: 'ltr', textAlign: 'right' }}>
              {fmt(collected)} <span style={{ fontSize: 34, fontWeight: 600 }}>MRU</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, marginTop: 8 }}>
              <span>نسبة التحصيل</span>
              <span style={{ fontFamily: FR, fontWeight: 700 }}>{Math.round(rate)}%</span>
            </div>
            <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.25)', marginTop: 10 }}>
              <div style={{ width: `${rate}%`, height: '100%', borderRadius: 7, background: C.white }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Stat label="مدفوعة" value={String(Math.round(ease(frame, [14, 50], [0, 243])))} color={C.green} />
            <Stat
              label="متأخرة"
              value={String(Math.round(ease(frame, [14, 50], [0, 37])))}
              color={C.orange}
              ring={ring}
            />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.ink, marginTop: 6 }}>الفواتير غير المدفوعة</div>
          {LATE.map((row, i) => (
            <div
              key={row.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                background: C.white,
                borderRadius: 26,
                padding: '18px 22px',
                opacity: ease(frame, [30 + i * 6, 40 + i * 6], [0, 1]),
                translate: `${ease(frame, [30 + i * 6, 42 + i * 6], [-40, 0])}px 0px`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>{row.name}</div>
                <div style={{ fontSize: 24, color: C.inkSoft }}>{row.cls}</div>
              </div>
              <div style={{ fontFamily: FR, fontWeight: 700, fontSize: 30, color: C.ink, direction: 'ltr' }}>
                {fmt(row.amount)} MRU
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: C.orange,
                  background: '#fef0c7',
                  borderRadius: 999,
                  padding: '6px 14px',
                }}
              >
                متأخرة
              </div>
            </div>
          ))}
        </div>
      </Phone>

      <Phone
        darkStatus
        screen="#0f1640"
        style={{
          left: 240,
          top: 210,
          translate: `${(1 - swap) * off}px 0px`,
          rotate: `${(1 - swap) * 8}deg`,
        }}
      >
        <LockScreen>
          <Notification
            at={NOTIFY}
            title="الاستحقاق يوم 05/10/2026 — محمد سالم"
            message="يتبقّى 3 000 أوقية للدفع في الشبّاك عن الفاتورة ⁦F-0142⁩. تجاهلوا هذا التذكير إذا تمّ الدفع للتوّ."
          />
        </LockScreen>
      </Phone>

      <Caption
        side
        tone="light"
        from={8}
        ar="تعرف في لحظة من دفع ومن تأخّر… والتطبيق يذكّر الأولياء تلقائيًا."
        fr="Payé ou en retard — rappels automatiques."
      />
    </AbsoluteFill>
  );
};
