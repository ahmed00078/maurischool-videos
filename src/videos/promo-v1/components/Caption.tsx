import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { AR, C, ease, FR, Tone, useLandscape } from '../theme';

/** Voice caption: Arabic first and large, French smaller underneath. */
export const Caption: React.FC<{ ar: string; fr: string; tone: Tone; from?: number; side?: boolean }> = ({
  ar,
  fr,
  tone,
  from = 6,
  side = false,
}) => {
  const landscape = useLandscape();
  const panel = landscape && side;
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const onLight = tone === 'light';
  const opacity =
    ease(frame, [from, from + 10], [0, 1]) * ease(frame, [durationInFrames - 8, durationInFrames], [1, 0]);
  return (
    <div
      style={{
        position: 'absolute',
        ...(panel
          ? { left: 900, right: 80, top: '50%', marginTop: -60 }
          : landscape
            ? { left: 120, right: 120, bottom: 80 }
            : { left: 80, right: 80, bottom: 150 }),
        textAlign: 'center',
        opacity,
        translate: `0px ${ease(frame, [from, from + 14], [24, 0])}px`,
      }}
    >
      <div
        dir="rtl"
        style={{
          fontFamily: AR,
          fontWeight: 800,
          fontSize: panel ? 66 : 60,
          lineHeight: 1.35,
          color: onLight ? C.ink : C.white,
        }}
      >
        {ar}
      </div>
      <div
        style={{
          fontFamily: FR,
          fontWeight: 400,
          fontSize: panel ? 42 : 40,
          lineHeight: 1.3,
          marginTop: 14,
          color: onLight ? C.inkSoft : 'rgba(255,255,255,0.72)',
        }}
      >
        {fr}
      </div>
    </div>
  );
};
