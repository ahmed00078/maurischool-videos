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
 * A shot for <CameraPath>: from frame `at` the camera holds `zoom`, with the
 * canvas point `focus` shown at `to` (default: where it already is).
 */
export type Shot = { at: number; zoom: number; focus: [number, number]; to?: [number, number] };

/**
 * A camera that moves from shot to shot: it leaves `move` frames before each
 * shot's `at` and settles on it, eased, then holds. Zoom, focus and target
 * interpolate together, so nothing jumps between shots. Keep the first shot
 * at frame 0.
 */
export const CameraPath: React.FC<{ shots: Shot[]; move?: number; children: React.ReactNode }> = ({ shots, move = 14, children }) => {
  const frame = useCurrentFrame();
  let zoom = shots[0].zoom;
  let focus = shots[0].focus;
  let to = shots[0].to ?? shots[0].focus;
  for (const next of shots.slice(1)) {
    const t = interpolate(frame, [next.at - move, next.at], [0, 1], { ...clamp, easing: EASE_IN_OUT });
    if (t <= 0) break;
    const nextTo = next.to ?? next.focus;
    zoom += (next.zoom - zoom) * t;
    focus = [focus[0] + (next.focus[0] - focus[0]) * t, focus[1] + (next.focus[1] - focus[1]) * t];
    to = [to[0] + (nextTo[0] - to[0]) * t, to[1] + (nextTo[1] - to[1]) * t];
  }
  // p → to + zoom · (p − focus)
  const tx = to[0] - zoom * focus[0];
  const ty = to[1] - zoom * focus[1];
  return <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${zoom})` }}>{children}</AbsoluteFill>;
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

/**
 * A VHS tape over a scene, for a rewind: the picture's colour channels slip
 * apart, scanlines, a bright band of tracking noise rolling up, the whole
 * frame jittering sideways, and the deck's on-screen symbol blinking in the
 * corner (`osd`: ◀◀ rewinding, ▶ playing). `amount` (0 to 1) fades it all.
 * Plain SVG filters and CSS, like the rest of the stage.
 */
export const Vhs: React.FC<{ amount: number; osd?: 'rew' | 'play' | null; children: React.ReactNode }> = ({ amount, osd = null, children }) => {
  const frame = useCurrentFrame();
  const id = `vhs${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const a = Math.max(0, Math.min(1, amount));
  const rnd = (n: number) => {
    const x = Math.sin(frame * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const shift = 9 * a;
  const jitter = (rnd(1) - 0.5) * 14 * a;
  const band = ((frame * 47) % 2300) - 200;
  const noise = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9 0.05' numOctaves='2' seed='${frame % 50}'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <AbsoluteFill>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={shift} dy="0" result="r2" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx={-shift} dy="0" result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
      </svg>
      <AbsoluteFill
        style={{
          filter: a > 0 ? `url(#${id}) saturate(${1 - 0.35 * a}) contrast(${1 + 0.15 * a}) brightness(${1 + 0.08 * a * (rnd(2) - 0.3)})` : undefined,
          translate: `${jitter}px 0px`,
        }}
      >
        {children}
      </AbsoluteFill>
      {a > 0 ? (
        <AbsoluteFill style={{ pointerEvents: 'none', opacity: a }}>
          <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, transparent 2px, transparent 6px)' }} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: band,
              height: 150,
              backgroundImage: `url("data:image/svg+xml;utf8,${noise}")`,
              backgroundSize: '300px 80px',
              mixBlendMode: 'screen',
              opacity: 0.75,
              filter: 'contrast(1.6)',
            }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: band + 180, height: 6, background: 'rgba(255,255,255,0.45)' }} />
          <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 50%, transparent 60%, rgba(0,0,20,0.45) 100%)' }} />
        </AbsoluteFill>
      ) : null}
      {osd && blink ? (
        <svg width="160" height="80" viewBox="0 0 160 80" style={{ position: 'absolute', left: SAFE.side + 30, top: SAFE.top + 40, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6)) drop-shadow(3px 3px 0 rgba(0,0,0,0.5))' }}>
          {osd === 'rew' ? (
            <>
              <path d="M 70 8 L 70 72 L 22 40 Z" fill="#fff" />
              <path d="M 122 8 L 122 72 L 74 40 Z" fill="#fff" />
            </>
          ) : (
            <path d="M 30 8 L 30 72 L 86 40 Z" fill="#fff" />
          )}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
