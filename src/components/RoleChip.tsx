import React from 'react';
import { useCurrentFrame } from 'remotion';
import { AR, C, ease, FR, Tone, useLandscape } from '../theme';

/** Says whose phone we are looking at: director, teacher or parent. */
export const RoleChip: React.FC<{ ar: string; fr: string; tone: Tone; from?: number; to?: number }> = ({
  ar,
  fr,
  tone,
  from = 0,
  to = 10_000,
}) => {
  const frame = useCurrentFrame();
  const landscape = useLandscape();
  const onLight = tone === 'light';
  return (
    <div
      style={{
        position: 'absolute',
        ...(landscape ? { top: 330, left: 900, right: 80 } : { top: 96, left: 0, right: 0 }),
        display: 'flex',
        justifyContent: 'center',
        opacity: ease(frame, [from, from + 8], [0, 1]) * ease(frame, [to - 6, to], [1, 0]),
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '12px 34px',
          borderRadius: 999,
          background: onLight ? C.brand50 : 'rgba(255,255,255,0.12)',
          color: onLight ? C.brand : C.white,
        }}
      >
        <span dir="rtl" style={{ fontFamily: AR, fontWeight: 800, fontSize: 40 }}>
          {ar}
        </span>
        <span style={{ fontFamily: FR, fontWeight: 400, fontSize: 30, opacity: 0.75 }}>{fr}</span>
      </div>
    </div>
  );
};
