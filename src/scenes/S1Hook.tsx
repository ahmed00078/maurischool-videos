import React from 'react';
import { AbsoluteFill, Easing, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { Caption } from '../components/Caption';
import { AR, C, ease, FR, toneBg, useLandscape } from '../theme';

// 0:00 — a number the director cares about, before any logo.
export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const land = useLandscape();
  const count = ease(frame, [6, 48], [0, 37], Easing.bezier(0.3, 0, 0.2, 1));
  return (
    <AbsoluteFill style={{ background: toneBg.dark }}>
      <div
        style={{
          position: 'absolute',
          top: land ? 110 : 470,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FR,
          fontWeight: 800,
          fontSize: 420,
          lineHeight: 1,
          color: interpolateColors(frame, [44, 56], [C.white, C.orange]),
          scale: String(
            interpolate(frame, [44, 52, 62], [1, 1.08, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          ),
          opacity: ease(frame, [0, 6], [0, 1]),
        }}
      >
        {Math.round(count)}
      </div>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: land ? 560 : 930,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: AR,
          fontWeight: 800,
          fontSize: 88,
          color: C.white,
          opacity: ease(frame, [30, 42], [0, 1]),
          translate: `0px ${ease(frame, [30, 44], [30, 0])}px`,
        }}
      >
        تلميذًا لم يدفعوا بعد
      </div>
      <div
        style={{
          position: 'absolute',
          top: land ? 680 : 1060,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FR,
          fontSize: 46,
          color: 'rgba(255,255,255,0.7)',
          opacity: ease(frame, [36, 48], [0, 1]),
        }}
      >
        élèves n'ont pas encore payé
      </div>
      <Caption
        tone="dark"
        from={4}
        ar="مديرَ المدرسة… كم تلميذًا لم يدفع رسومه هذا الشهر؟"
        fr="Combien d'élèves n'ont pas encore payé ce mois-ci ?"
      />
    </AbsoluteFill>
  );
};
