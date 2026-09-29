import React from 'react';
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { ChatBubbles, Notebook, RingingPhone, Spreadsheet } from '../components/Icons';
import { C, ease, FR, toneBg, useLandscape } from '../theme';

const FROM: [number, number][] = [
  [-420, -620],
  [420, -640],
  [-420, 560],
  [420, 580],
];
const ICONS = [
  <Notebook size={170} />,
  <Spreadsheet size={190} />,
  <ChatBubbles size={180} />,
  <RingingPhone size={160} />,
];

// 0:07 — the scattered tools are pulled into one place: the logo.
export const S3Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const land = useLandscape();
  const cx = land ? 960 : 540;
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 22, fps, config: { damping: 12, stiffness: 130 } });
  const word = spring({ frame: frame - 34, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: toneBg.brand }}>
      {ICONS.map((icon, i) => {
        const t = ease(frame, [0 + i * 2, 22], [0, 1]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx,
              top: land ? 400 : 760,
              translate: `calc(-50% + ${FROM[i][0] * (1 - t)}px) calc(-50% + ${FROM[i][1] * (1 - t)}px)`,
              scale: String(1 - t * 0.9),
              opacity: 1 - ease(frame, [16, 24], [0, 1]),
            }}
          >
            {icon}
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: land ? 400 : 760,
          width: 900,
          height: 900,
          borderRadius: '50%',
          translate: '-50% -50%',
          background: 'rgba(255,255,255,0.18)',
          scale: String(ease(frame, [20, 40], [0, 1.4])),
          opacity: ease(frame, [20, 44], [1, 0]),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: land ? 330 : 700,
          translate: '-50% -50%',
          width: 300,
          height: 300,
          borderRadius: 80,
          background: C.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 40px 90px rgba(18,26,71,0.35)',
          scale: String(pop),
        }}
      >
        <Img src={staticFile('promo-v1/logo-icon.png')} style={{ width: 220, height: 220 }} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: land ? 520 : 900,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FR,
          fontWeight: 800,
          fontSize: 120,
          color: C.white,
          letterSpacing: -2,
          opacity: word,
          translate: `0px ${(1 - word) * 40}px`,
        }}
      >
        MauriSchool
      </div>
      <Caption
        tone="brand"
        from={30}
        ar="مع MauriSchool، مدرستك كلها في تطبيق واحد."
        fr="Toute votre école dans une seule application."
      />
    </AbsoluteFill>
  );
};
