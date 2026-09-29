import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { APP, clamp, EASE_IN_OUT, STAGE } from './tokens';

/**
 * Stage effects shared by every scene: the world the phones sit in.
 * All of it is plain CSS/SVG driven by the frame, so it renders the same in
 * Studio and in the final render, with no WebGL needed.
 */

export type Mood = 'night' | 'paper' | 'brand';

const BASE: Record<Mood, string> = {
  night: `radial-gradient(120% 90% at 50% 20%, ${STAGE.navy} 0%, ${STAGE.night} 70%)`,
  paper: `radial-gradient(120% 90% at 50% 25%, #ffffff 0%, ${STAGE.paper} 70%)`,
  brand: `radial-gradient(120% 90% at 50% 30%, #5b72ff 0%, ${APP.brand[600]} 60%, ${APP.brand[800]} 100%)`,
};

const BLOBS: Record<Mood, [string, string]> = {
  night: [`${APP.brand[500]}55`, '#7c3aed33'],
  paper: [`${APP.brand[200]}88`, '#c7f0d8aa'],
  brand: ['#8ea0ff66', '#2f3b6966'],
};

/** A slow, living background: two blurred colour fields drifting over a gradient, plus a faint dot grid. */
export const Backdrop: React.FC<{ mood: Mood; grid?: boolean }> = ({ mood, grid = true }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [a, b] = BLOBS[mood];
  const t = frame / 30;
  const blob = (color: string, x: number, y: number, r: number): React.CSSProperties => ({
    position: 'absolute',
    left: x - r,
    top: y - r,
    width: r * 2,
    height: r * 2,
    borderRadius: '50%',
    background: color,
    filter: `blur(${r * 0.45}px)`,
  });
  return (
    <AbsoluteFill style={{ background: BASE[mood], overflow: 'hidden' }}>
      <div style={blob(a, width * (0.25 + 0.08 * Math.sin(t * 0.5)), height * (0.28 + 0.05 * Math.cos(t * 0.4)), width * 0.55)} />
      <div style={blob(b, width * (0.8 + 0.07 * Math.cos(t * 0.45)), height * (0.75 + 0.05 * Math.sin(t * 0.35)), width * 0.6)} />
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `radial-gradient(${mood === 'paper' ? '#1f2b6f22' : '#ffffff1f'} 1.6px, transparent 1.6px)`,
            backgroundSize: '36px 36px',
            backgroundPosition: `0px ${(frame * 0.4) % 36}px`,
            maskImage: 'radial-gradient(90% 70% at 50% 45%, #000 20%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(90% 70% at 50% 45%, #000 20%, transparent 85%)',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * Film grain: fresh noise every other frame, laid over everything at low
 * opacity. It hides gradient banding on phones and makes flat colour feel filmed.
 */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 97;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml;utf8,${svg}")`,
        backgroundSize: '220px 220px',
        mixBlendMode: 'overlay',
        opacity,
      }}
    />
  );
};

/** Soft darkening at the edges, to pull the eye to the centre. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.35 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(5,8,30,${strength}) 100%)`,
    }}
  />
);

/**
 * A camera around a scene. It always drifts a little (nothing on screen is
 * ever perfectly still), and it can push in toward a point.
 *
 * `push` is [startFrame, endFrame, zoom]; `focus` is the point it pushes toward, in px.
 */
export const Camera: React.FC<{
  children: React.ReactNode;
  drift?: number;
  push?: [number, number, number];
  focus?: [number, number];
  /** Moves the focus point by this much over the push, e.g. to bring it down clear of the headline. */
  shift?: [number, number];
  shake?: number;
}> = ({ children, drift = 0.03, push, focus, shift = [0, 0], shake = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const driftScale = 1 + drift * (frame / durationInFrames);
  const pushT = push ? interpolate(frame, [push[0], push[1]], [0, 1], { ...clamp, easing: EASE_IN_OUT }) : 0;
  const pushScale = push ? 1 + (push[2] - 1) * pushT : 1;
  const [fx, fy] = focus ?? [width / 2, height / 2];
  const jitter = shake ? [Math.sin(frame * 2.1) * shake, Math.cos(frame * 1.7) * shake] : [0, 0];
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${fx}px ${fy}px`,
        scale: String(driftScale * pushScale),
        translate: `${jitter[0] + shift[0] * pushT}px ${jitter[1] + shift[1] * pushT}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * Where Reels and TikTok draw their own interface over a 1080 x 1920 video:
 * the top bar, the caption and buttons at the bottom, the action column on the
 * right. Key text must stay out of the red. Only drawn when `show` is on.
 */
export const SAFE = { top: 220, bottom: 420, side: 60, right: 140 };

export const SafeZones: React.FC<{ show: boolean }> = ({ show }) => {
  const { width, height } = useVideoConfig();
  if (!show || width > height) return null;
  const red = 'rgba(255, 30, 60, 0.28)';
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 1000 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: SAFE.top, background: red }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: SAFE.bottom, background: red }} />
      <div style={{ position: 'absolute', right: 0, top: SAFE.top, bottom: SAFE.bottom, width: SAFE.right, background: red }} />
      <div style={{ position: 'absolute', left: 0, top: SAFE.top, bottom: SAFE.bottom, width: SAFE.side, background: red }} />
    </AbsoluteFill>
  );
};

/** Handy for scenes: a 0→1 ramp between two frames with the in-out curve. */
export const ramp = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: EASE_IN_OUT });
