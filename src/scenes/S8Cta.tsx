import React from 'react';
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { WhatsAppGlyph } from '../components/Icons';
import { AR, C, ease, FR, toneBg, useLandscape } from '../theme';

export const WHATSAPP = '+222 33 08 25 42';

// 0:26 — logo, the offer, and the number held long enough to write down.
export const S8Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const land = useLandscape();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 200 } });
  const offer = spring({ frame: frame - 10, fps, config: { damping: 200 } });
  const num = spring({ frame: frame - 20, fps, config: { damping: 13, stiffness: 120 } });
  const pulse = 1 + Math.sin(Math.max(0, frame - 50) / 7) * 0.015;
  return (
    <AbsoluteFill style={{ background: toneBg.brand, alignItems: 'center' }}>
      <div
        style={{
          marginTop: land ? 110 : 330,
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          opacity: logo,
          translate: `0px ${(1 - logo) * 40}px`,
        }}
      >
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: 36,
            background: C.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img src={staticFile('logo-icon.png')} style={{ width: 96, height: 96 }} />
        </div>
        <div style={{ fontFamily: FR, fontWeight: 800, fontSize: 92, color: C.white, letterSpacing: -2 }}>
          MauriSchool
        </div>
      </div>

      <div
        dir="rtl"
        style={{
          marginTop: land ? 70 : 170,
          fontFamily: AR,
          fontWeight: 800,
          fontSize: 104,
          color: C.white,
          opacity: offer,
          translate: `0px ${(1 - offer) * 40}px`,
        }}
      >
        اطلب عرضًا مجانيًا
      </div>
      <div style={{ marginTop: 10, fontFamily: FR, fontSize: 50, color: 'rgba(255,255,255,0.8)', opacity: offer }}>
        Démo gratuite sur WhatsApp
      </div>

      <div
        style={{
          marginTop: land ? 60 : 110,
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          padding: '34px 50px',
          borderRadius: 999,
          background: C.white,
          boxShadow: '0 30px 70px rgba(18,26,71,0.35)',
          opacity: Math.min(1, num * 1.4),
          scale: String((0.8 + num * 0.2) * pulse),
        }}
      >
        <WhatsAppGlyph size={96} />
        <div style={{ fontFamily: FR, fontWeight: 800, fontSize: 76, color: C.ink, direction: 'ltr', whiteSpace: 'nowrap' }}>
          {WHATSAPP}
        </div>
      </div>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          bottom: land ? 70 : 190,
          fontFamily: AR,
          fontSize: 44,
          color: 'rgba(255,255,255,0.75)',
          opacity: ease(frame, [30, 44], [0, 1]),
        }}
      >
        مدرستك كلها في تطبيق واحد
      </div>
    </AbsoluteFill>
  );
};
