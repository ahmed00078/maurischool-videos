import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { Phone, ScreenHeader } from '../components/Phone';
import { RoleChip } from '../components/RoleChip';
import { AR, C, ease, FR, toneBg } from '../theme';

const SUBJECTS = [
  { name: 'الرياضيات', grade: 16 },
  { name: 'اللغة العربية', grade: 14 },
  { name: 'الفرنسية', grade: 13 },
  { name: 'العلوم الطبيعية', grade: 15 },
];
const AVERAGE = 14.5;
const HIGHLIGHT = 30;

// 0:19 — the parent reads grades and the report card on their own phone.
export const S6Grades: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const hl = ease(frame, [HIGHLIGHT, HIGHLIGHT + 8], [0, 1]) * (1 - ease(frame, [60, 70], [0, 1]));
  const avg = ease(frame, [50, 80], [0, AVERAGE]);
  const card = spring({ frame: frame - 78, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ background: toneBg.light }}>
      <RoleChip tone="light" ar="الوليّ" fr="Parent" />
      <Phone style={{ left: 240, top: 210, translate: `0px ${(1 - enter) * 900}px` }}>
        <ScreenHeader title="الدرجات" subtitle="مريم أحمد · الفصل الأول" />
        <div dir="rtl" style={{ padding: '0 30px', fontFamily: AR, display: 'grid', gap: 16 }}>
          {SUBJECTS.map((s, i) => (
            <div
              key={s.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '24px 28px',
                borderRadius: 28,
                background: C.paper,
                border: `3px solid ${i === 0 && hl > 0 ? C.brand : 'transparent'}`,
                scale: String(i === 0 ? 1 + hl * 0.04 : 1),
                opacity: ease(frame, [6 + i * 4, 14 + i * 4], [0, 1]),
                translate: `${ease(frame, [6 + i * 4, 18 + i * 4], [-40, 0])}px 0px`,
              }}
            >
              <div style={{ flex: 1, fontSize: 34, fontWeight: 700, color: C.ink }}>{s.name}</div>
              <div style={{ fontFamily: FR, direction: 'ltr', fontSize: 40, fontWeight: 800, color: C.brand }}>
                {s.grade}
                <span style={{ fontSize: 26, color: C.inkSoft, fontWeight: 600 }}>/20</span>
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 8,
              borderRadius: 34,
              background: C.brand,
              color: C.white,
              padding: '26px 30px',
              display: 'flex',
              alignItems: 'center',
              opacity: ease(frame, [44, 54], [0, 1]),
            }}
          >
            <div style={{ flex: 1, fontSize: 34, fontWeight: 800 }}>المعدل العام</div>
            <div style={{ fontFamily: FR, direction: 'ltr', fontSize: 64, fontWeight: 800 }}>
              {avg.toFixed(2)}
              <span style={{ fontSize: 32, fontWeight: 600, opacity: 0.8 }}>/20</span>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '22px 26px',
              borderRadius: 28,
              background: C.white,
              border: `3px solid ${C.line}`,
              scale: String(0.9 + card * 0.1),
              opacity: Math.min(1, card * 1.4),
            }}
          >
            <div
              style={{
                width: 70,
                height: 84,
                borderRadius: 12,
                background: C.red,
                color: C.white,
                fontFamily: FR,
                fontWeight: 800,
                fontSize: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              PDF
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: C.ink }}>كشف الدرجات</div>
              <div style={{ fontSize: 24, color: C.inkSoft }}>الفصل الأول · متاح</div>
            </div>
            <div style={{ fontSize: 44, color: C.brand }}>↓</div>
          </div>
        </div>
      </Phone>
      <Caption
        side
        tone="light"
        from={8}
        ar="والنتائج وكشوف الدرجات… على هاتف الوليّ."
        fr="Notes et bulletins, sur le téléphone des parents."
      />
    </AbsoluteFill>
  );
};
