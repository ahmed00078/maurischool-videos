import React from 'react';
import { useLang } from '../lang';
import { LogoMark } from '../ui/LogoMark';

/**
 * The moments are drawn on a 1080-wide canvas whose bottom 1350 px hold the
 * scene (a 4:5 post). In a taller frame (a 9:16 Reel) the scene rises by
 * REEL_LIFT, clear of the captions and buttons Reels and TikTok lay over the
 * bottom (fx.SAFE), and the wall, desk and pupils run on to the frame's foot.
 * The top of the canvas is left as plain wall for the headline a post or a
 * video lays over it.
 */
export const W = 1080;
export const SCENE_H = 1350;
export const REEL_LIFT = 300;

/** Turns a scene coordinate (in the 1080 × 1350 box) into the frame's, for a frame `height` tall. */
export const useStage = (height: number) => {
  const { rtl } = useLang();
  const dy = height > SCENE_H ? height - SCENE_H - REEL_LIFT : 0;
  return {
    rtl,
    dy,
    /** Mirrors an x in Arabic, so the scene reads from the right like the text over it. */
    x: (x: number) => (rtl ? W - x : x),
    y: (y: number) => y + dy,
  };
};

/**
 * Everything drawn (people, furniture, light) mirrors in Arabic; what carries
 * writing or a clock face does not, and is placed outside this layer with `x()`.
 */
export const Mirrored: React.FC<{ children: React.ReactNode; height: number }> = ({ children, height }) => {
  const { rtl } = useLang();
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height, transform: rtl ? 'scaleX(-1)' : undefined, transformOrigin: `${W / 2}px 0` }}>
      {children}
    </div>
  );
};

export const abs = (style: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', ...style });

/** A phone seen from the back, as held: dark body, the camera block in its corner. In a bust's drawing units. */
export const PhoneBackSvg: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 96, rot = 0 }) => {
  const h = w * 2.05;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w * 0.17} fill="#262a3d" />
      <rect x={x - w / 2 + 3} y={y - h / 2 + 3} width={w - 6} height={h - 6} rx={w * 0.15} fill="none" stroke="#4a5068" strokeWidth="3" />
      <rect x={x - w / 2 + w * 0.1} y={y - h / 2 + w * 0.1} width={w * 0.36} height={w * 0.36} rx={w * 0.1} fill="#171a28" stroke="#4a5068" strokeWidth="2" />
      <circle cx={x - w / 2 + w * 0.2} cy={y - h / 2 + w * 0.2} r={w * 0.06} fill="#3a4a78" />
      <circle cx={x - w / 2 + w * 0.36} cy={y - h / 2 + w * 0.2} r={w * 0.06} fill="#3a4a78" />
      <circle cx={x - w / 2 + w * 0.2} cy={y - h / 2 + w * 0.36} r={w * 0.06} fill="#3a4a78" />
    </g>
  );
};

/**
 * The app's icon, floating by the phone: a white tile with the MauriSchool
 * mark, so a phone seen from the back still says which app is open.
 */
export const AppTile: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 120 }) => (
  <div
    style={abs({
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: size * 0.26,
      background: '#ffffff',
      boxShadow: '0 14px 26px -6px rgba(15,23,60,0.3), 0 3px 6px rgba(15,23,60,0.12)',
      display: 'grid',
      placeItems: 'center',
    })}
  >
    <LogoMark width={size * 0.66} />
  </div>
);

/** A soft drop shadow for a prop that floats over a scene. */
export const FLOAT = '0 14px 26px -6px rgba(15,23,60,0.3), 0 3px 6px rgba(15,23,60,0.12)';
