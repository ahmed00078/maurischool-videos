import React from 'react';
import { AR, C, FR, useLandscape } from '../theme';

export const PHONE_W = 600;
export const PHONE_H = 1200;

/** Neutral phone frame; the screen content is drawn by each scene. */
export const Phone: React.FC<{
  children: React.ReactNode;
  screen?: string;
  darkStatus?: boolean;
  style?: React.CSSProperties;
}> = ({ children, screen = C.white, darkStatus = false, style }) => {
  const landscape = useLandscape();
  return (
  <div
    style={{
      position: 'absolute',
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 92,
      background: '#0b0f24',
      padding: 16,
      boxShadow: '0 60px 120px rgba(18,26,71,0.35), 0 0 0 3px rgba(255,255,255,0.08) inset',
      ...style,
      ...(landscape ? { left: 330, top: 72, scale: '0.78', transformOrigin: 'top left' } : {}),
    }}
  >
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: 76,
        overflow: 'hidden',
        background: screen,
      }}
    >
      <div
        style={{
          height: 78,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 52px',
          fontFamily: FR,
          fontWeight: 600,
          fontSize: 26,
          color: darkStatus ? C.white : C.ink,
        }}
      >
        <span>08:15</span>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 18,
            translate: '-50% 0',
            width: 150,
            height: 42,
            borderRadius: 21,
            background: '#0b0f24',
          }}
        />
        <span style={{ letterSpacing: 2 }}>●●● ▮</span>
      </div>
      {children}
    </div>
  </div>
  );
};

/** In-app screen header, Arabic RTL. */
export const ScreenHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div dir="rtl" style={{ padding: '14px 40px 22px', fontFamily: AR }}>
    <div style={{ fontSize: 44, fontWeight: 800, color: C.ink }}>{title}</div>
    {subtitle ? <div style={{ fontSize: 28, color: C.inkSoft, marginTop: 4 }}>{subtitle}</div> : null}
  </div>
);
