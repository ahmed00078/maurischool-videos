import React from 'react';
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { AR, C, FR } from '../theme';

/** A push notification dropping onto a phone screen. Copy comes from backend notification_i18n. */
export const Notification: React.FC<{ title: string; message: string; at: number }> = ({
  title,
  message,
  at,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 16, stiffness: 140 } });
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        top: 0,
        left: 26,
        right: 26,
        padding: '26px 28px',
        borderRadius: 40,
        background: 'rgba(255,255,255,0.97)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        fontFamily: AR,
        opacity: Math.min(1, s * 1.5),
        translate: `0px ${(1 - s) * -260}px`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <Img src={staticFile('logo-icon.png')} style={{ width: 46, height: 46, borderRadius: 12 }} />
        <span style={{ fontSize: 26, fontWeight: 700, color: C.inkSoft, flex: 1 }}>MauriSchool</span>
        <span style={{ fontSize: 24, color: C.inkSoft }}>الآن</span>
      </div>
      <div style={{ fontSize: 31, fontWeight: 800, color: C.ink, lineHeight: 1.35 }}>{title}</div>
      <div style={{ fontSize: 27, color: C.inkSoft, lineHeight: 1.45, marginTop: 6 }}>{message}</div>
    </div>
  );
};

/** Parent's lock screen: wallpaper and clock, notifications land on top. */
export const LockScreen: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(170deg, #2b3a8f 0%, #0f1640 100%)`,
    }}
  >
    <div
      style={{
        marginTop: 200,
        textAlign: 'center',
        color: 'white',
        fontFamily: FR,
        fontWeight: 300,
        fontSize: 150,
        opacity: 0.9,
      }}
    >
      08:15
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 460 }}>{children}</div>
  </div>
);
