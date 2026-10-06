import React from 'react';
import { OUTFIT, SCREEN_H, SCREEN_W } from '../tokens';

/**
 * A neutral modern handset: thin bezel, punch-hole camera, no brand. The app
 * ships on Android and iPhone alike, so the phone belongs to neither.
 *
 * The screen is exactly SCREEN_W x SCREEN_H (390 x 844 app points), so screen
 * components lay out in app units scaled by `pt()`.
 */
export const BEZEL = 14;
export const DEVICE_W = SCREEN_W + BEZEL * 2;
export const DEVICE_H = SCREEN_H + BEZEL * 2;
const SCREEN_RADIUS = 66;

export const Device: React.FC<{
  children: React.ReactNode;
  /** Light or dark status bar glyphs, to match what is on screen. */
  statusTone?: 'dark' | 'light';
  /** Hide the status bar (full-bleed lock screens draw their own). */
  statusBar?: boolean;
  /** 0 to 1: the diagonal glass reflection, stronger when the phone turns. */
  glare?: number;
  /** No network: empty signal bars and no wifi, for the offline scenes. */
  offline?: boolean;
  /** The clock in the status bar, when the story is not at 08:15. */
  time?: string;
  style?: React.CSSProperties;
}> = ({ children, statusTone = 'dark', statusBar = true, glare = 0.5, offline = false, time, style }) => (
  <div
    style={{
      position: 'relative',
      width: DEVICE_W,
      height: DEVICE_H,
      borderRadius: SCREEN_RADIUS + BEZEL,
      padding: BEZEL,
      boxSizing: 'border-box',
      background: 'linear-gradient(145deg, #3a3f55 0%, #14172a 45%, #2b3044 100%)',
      boxShadow: [
        '0 0 0 2px #5b6076 inset',
        '0 0 0 5px #0a0c16 inset',
        '0 50px 90px -20px rgba(8, 12, 40, 0.55)',
        '0 24px 40px -18px rgba(8, 12, 40, 0.45)',
      ].join(', '),
      ...style,
    }}
  >
    {/* Side buttons */}
    <div style={{ position: 'absolute', right: -5, top: 250, width: 5, height: 110, borderRadius: 3, background: '#2b3044' }} />
    <div style={{ position: 'absolute', left: -5, top: 210, width: 5, height: 70, borderRadius: 3, background: '#2b3044' }} />
    <div style={{ position: 'absolute', left: -5, top: 300, width: 5, height: 70, borderRadius: 3, background: '#2b3044' }} />

    <div
      style={{
        position: 'relative',
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: SCREEN_RADIUS,
        overflow: 'hidden',
        background: '#000',
        // Keeps rounded clipping intact under 3D transforms in Chrome.
        isolation: 'isolate',
        transform: 'translateZ(0)',
      }}
    >
      {children}
      {statusBar ? <StatusBar tone={statusTone} offline={offline} time={time} /> : null}
      {/* Punch-hole camera */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          width: 30,
          height: 30,
          marginLeft: -15,
          borderRadius: 15,
          background: 'radial-gradient(circle at 35% 35%, #2a3050 0%, #05060c 60%)',
          zIndex: 20,
        }}
      />
      {/* Glass reflection */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 30,
          background:
            'linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.10) 42%, rgba(255,255,255,0) 55%)',
          opacity: glare,
        }}
      />
    </div>
  </div>
);

/** 08:15 on a school morning (or `time`), full signal, full battery: no clutter from a real phone. */
export const StatusBar: React.FC<{ tone: 'dark' | 'light'; offline?: boolean; time?: string }> = ({ tone, offline = false, time = '08:15' }) => {
  const c = tone === 'dark' ? '#111827' : '#ffffff';
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 66,
        padding: '0 44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: OUTFIT,
        fontWeight: 600,
        fontSize: 24,
        color: c,
        zIndex: 10,
        direction: 'ltr',
      }}
    >
      <span>{time}</span>
      <svg width="96" height="22" viewBox="0 0 96 22">
        {/* signal: four bars, or four empty ones and a cross with no network */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 7} y={16 - i * 4} width="5" height={6 + i * 4} rx="1.5" fill={c} fillOpacity={offline ? 0.28 : 1} />
        ))}
        {offline ? (
          <path d="M36 5 l9 9 M45 5 l-9 9" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
        ) : (
          <>
            {/* wifi */}
            <path d="M44 18 l4 -4 a6 6 0 0 0 -8 0z" fill={c} />
            <path d="M36.5 10.5 a11 11 0 0 1 15 0 l-2.2 2.2 a8 8 0 0 0 -10.6 0z" fill={c} />
            <path d="M33 7 a16 16 0 0 1 22 0 l-2.2 2.2 a13 13 0 0 0 -17.6 0z" fill={c} />
          </>
        )}
        {/* battery */}
        <rect x="62" y="4" width="28" height="14" rx="4" fill="none" stroke={c} strokeOpacity="0.45" strokeWidth="2" />
        <rect x="65" y="7" width="22" height="8" rx="2" fill={c} />
        <rect x="91.5" y="8.5" width="2.5" height="5" rx="1" fill={c} fillOpacity="0.45" />
      </svg>
    </div>
  );
};
