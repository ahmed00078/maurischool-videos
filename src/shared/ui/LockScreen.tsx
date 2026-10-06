import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SCREEN_COPY } from '../appCopy';
import { Bi, useBi, useLang } from '../lang';
import { APP, OUTFIT, pt, SCREEN_H, SCREEN_W } from '../tokens';
import { LogoMark } from './LogoMark';

const DATE = { fr: 'lundi 12 octobre', ar: 'الاثنين 12 أكتوبر' };

/**
 * The parent's lock screen: wallpaper, clock, and MauriSchool notifications
 * landing on top. The status bar comes from <Device statusTone="light">.
 * `date` is the day under the clock, when the story is not on Monday 12 October.
 */
export const LockScreen: React.FC<{ children?: React.ReactNode; time?: string; date?: Bi }> = ({ children, time = '08:16', date = DATE }) => {
  const bi = useBi();
  const { font } = useLang();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: SCREEN_W,
        height: SCREEN_H,
        background: `radial-gradient(90% 60% at 30% 20%, #3b4fdb 0%, transparent 60%), radial-gradient(80% 60% at 80% 90%, #7c3aed88 0%, transparent 60%), linear-gradient(170deg, #1f2b6f 0%, #0b1033 100%)`,
        color: '#fff',
      }}
    >
      <div style={{ marginTop: pt(92), textAlign: 'center', fontFamily: font, fontSize: pt(17), fontWeight: 500, opacity: 0.85 }}>
        {bi(date)}
      </div>
      <div
        style={{
          textAlign: 'center',
          fontFamily: OUTFIT,
          fontWeight: 600,
          fontSize: pt(88),
          lineHeight: 1,
          marginTop: pt(4),
          letterSpacing: -2,
        }}
      >
        {time}
      </div>
      <div style={{ position: 'absolute', left: pt(10), right: pt(10), top: pt(260) }}>{children}</div>
    </div>
  );
};

/**
 * A MauriSchool push notification. It drops in from above on a spring and
 * settles; `at` is the frame it arrives.
 */
export const Notification: React.FC<{ title: string; message: string; at: number; style?: React.CSSProperties }> = ({
  title,
  message,
  at,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bi = useBi();
  const { dir, font } = useLang();
  const s = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 170 } });
  return (
    <div
      dir={dir}
      style={{
        padding: `${pt(14)}px ${pt(16)}px`,
        borderRadius: pt(24),
        background: 'rgba(245,247,255,0.92)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        fontFamily: font,
        color: APP.light.text,
        opacity: Math.min(1, s * 1.6),
        translate: `0px ${(1 - s) * -pt(180)}px`,
        scale: String(0.9 + s * 0.1),
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: pt(8), marginBottom: pt(6) }}>
        <div
          style={{
            width: pt(26),
            height: pt(26),
            borderRadius: pt(7),
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 0 ${pt(0.5)}px ${APP.light.border}`,
          }}
        >
          <LogoMark width={pt(19)} />
        </div>
        <span style={{ flex: 1, fontSize: pt(13), fontWeight: 600, color: APP.light.textSecondary, fontFamily: OUTFIT }}>
          MAURISCHOOL
        </span>
        <span style={{ fontSize: pt(12), color: APP.light.textSecondary }}>{bi(SCREEN_COPY.now)}</span>
      </div>
      <div style={{ fontSize: pt(15), fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: pt(14), lineHeight: 1.4, marginTop: pt(3), color: '#374151' }}>{message}</div>
    </div>
  );
};
