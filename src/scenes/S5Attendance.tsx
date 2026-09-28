import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { LockScreen, Notification } from '../components/Notification';
import { Phone, ScreenHeader } from '../components/Phone';
import { RoleChip } from '../components/RoleChip';
import { AR, C, ease, toneBg, useOffscreen } from '../theme';

const TAP = 34; // the teacher taps "absent"
const SWAP = 64;
const NOTIFY = 80;
const PUPILS = ['آمنة محمود', 'سيدي محمد', 'مريم أحمد', 'يحيى إبراهيم', 'خديجة عمر', 'الشيخ ولد عالي', 'زينب سيدي'];
const ABSENT = 2;

const Pill: React.FC<{ absent: boolean }> = ({ absent }) => (
  <div
    style={{
      minWidth: 120,
      textAlign: 'center',
      fontSize: 26,
      fontWeight: 800,
      borderRadius: 999,
      padding: '10px 20px',
      color: absent ? C.red : C.green,
      background: absent ? '#fee4e2' : '#d1fadf',
    }}
  >
    {absent ? 'غائب' : 'حاضر'}
  </div>
);

// 0:15 — the teacher marks an absence, the parent is told right away.
export const S5Attendance: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const off = useOffscreen();
  const swap = ease(frame, [SWAP, SWAP + 18], [0, 1]);
  const tap = ease(frame, [TAP - 4, TAP + 10], [0, 1]);
  return (
    <AbsoluteFill style={{ background: toneBg.dark }}>
      <RoleChip tone="dark" ar="المعلّم" fr="Enseignant" to={SWAP + 6} />
      <RoleChip tone="dark" ar="الوليّ" fr="Parent" from={SWAP + 8} />

      <Phone
        style={{
          left: 240,
          top: 210,
          translate: `${swap * -off}px ${(1 - enter) * 900}px`,
          rotate: `${swap * -8}deg`,
        }}
      >
        <ScreenHeader title="تسجيل الحضور" subtitle="الخامسة أ · الرياضيات" />
        <div dir="rtl" style={{ padding: '0 30px', fontFamily: AR, display: 'grid', gap: 16 }}>
          {PUPILS.map((name, i) => (
            <div
              key={name}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '22px 24px',
                borderRadius: 28,
                background: i === ABSENT && frame >= TAP ? '#fff5f4' : C.paper,
                opacity: ease(frame, [6 + i * 3, 14 + i * 3], [0, 1]),
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: C.brand50,
                  color: C.brand,
                  fontSize: 30,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {name[0]}
              </div>
              <div style={{ flex: 1, fontSize: 32, fontWeight: 700, color: C.ink }}>{name}</div>
              <div style={{ position: 'relative' }}>
                <Pill absent={i === ABSENT && frame >= TAP} />
                {i === ABSENT ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 90,
                      height: 90,
                      borderRadius: 45,
                      translate: '-50% -50%',
                      background: 'rgba(70,95,255,0.35)',
                      border: '4px solid rgba(70,95,255,0.8)',
                      scale: String(0.6 + tap * 0.8),
                      opacity: ease(frame, [TAP - 8, TAP - 2], [0, 1]) * (1 - tap),
                    }}
                  />
                ) : null}
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
            title="تسجيل غياب — مريم أحمد"
            message="سُجّل غياب مريم أحمد يوم 12/10/2026 في قسم الخامسة أ. إذا كانت المعلومة غير صحيحة، تواصلوا مع المدرسة."
          />
        </LockScreen>
      </Phone>

      <Caption
        side
        tone="dark"
        from={8}
        ar="المعلّم يسجّل الغياب… والوليّ يعلم في الحال."
        fr="Absence notée, parent prévenu."
      />
    </AbsoluteFill>
  );
};
