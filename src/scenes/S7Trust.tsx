import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { Check } from '../components/Icons';
import { AR, C, FR, toneBg, useLandscape } from '../theme';

const BADGES = [
  { ar: 'العربية والفرنسية', fr: 'Arabe · Français' },
  { ar: 'أندرويد وآيفون', fr: 'Android · iPhone' },
  { ar: 'بيانات مدرستك محمية', fr: 'Données protégées' },
];

// 0:23 — three short reasons to trust it.
export const S7Trust: React.FC = () => {
  const frame = useCurrentFrame();
  const land = useLandscape();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: toneBg.dark }}>
      <div
        style={{
          position: 'absolute',
          ...(land ? { top: 150, left: 480, right: 480 } : { top: 420, left: 110, right: 110 }),
          display: 'grid',
          gap: land ? 30 : 44,
        }}
      >
        {BADGES.map((b, i) => {
          const s = spring({ frame: frame - (4 + i * 12), fps, config: { damping: 14, stiffness: 140 } });
          return (
            <div
              key={b.fr}
              dir="rtl"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 34,
                padding: land ? '28px 40px' : '38px 44px',
                borderRadius: 44,
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.14)',
                opacity: Math.min(1, s * 1.4),
                scale: String(0.85 + s * 0.15),
              }}
            >
              <Check size={78} />
              <div>
                <div style={{ fontFamily: AR, fontWeight: 800, fontSize: 58, color: C.white }}>{b.ar}</div>
                <div style={{ fontFamily: FR, fontSize: 36, color: 'rgba(255,255,255,0.7)' }}>{b.fr}</div>
              </div>
            </div>
          );
        })}
      </div>
      <Caption
        tone="dark"
        from={6}
        ar="بالعربية والفرنسية، وعلى كل الهواتف."
        fr="En arabe et en français, sur tous les téléphones."
      />
    </AbsoluteFill>
  );
};
