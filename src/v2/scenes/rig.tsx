import React from 'react';
import { Audio } from '@remotion/media';
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Backdrop, Grain, Mood, SafeZones, Vignette } from '../fx';
import { SAFE } from '../fx';
import { useSilent } from '../sound';
import { tween } from '../tokens';
import { DEVICE_H, DEVICE_W } from '../ui/Device';

/** Portrait layout: the top band for text sits just under the Reels/TikTok top bar. */
export const LAYOUT = {
  W: 1080,
  H: 1920,
  textTop: SAFE.top + 20,
  /** Default phone centre and scale: below the text band, bottom inside the frame. */
  phone: { x: 540, y: 1175, scale: 0.8 },
} as const;

/** Every scene: background, content, then vignette, grain, and the safe-zone guide on top. */
export const Scene: React.FC<{
  mood: Mood;
  children: React.ReactNode;
  grid?: boolean;
  safeZones?: boolean;
}> = ({ mood, children, grid, safeZones = false }) => (
  <AbsoluteFill style={{ overflow: 'hidden' }}>
    <Backdrop mood={mood} grid={grid} />
    <AbsoluteFill style={{ perspective: 2600 }}>{children}</AbsoluteFill>
    <Vignette strength={mood === 'paper' ? 0.1 : 0.35} />
    <Grain />
    <SafeZones show={safeZones} />
  </AbsoluteFill>
);

/** The text band at the top, centred, clear of the platform chrome and the right-hand buttons. */
export const Top: React.FC<{ children: React.ReactNode; gap?: number; style?: React.CSSProperties }> = ({
  children,
  gap = 26,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      top: LAYOUT.textTop,
      left: SAFE.side + 20,
      right: SAFE.right,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap,
      zIndex: 20,
      ...style,
    }}
  >
    {children}
  </div>
);

export type Pose = { x?: number; y?: number; scale?: number; rx?: number; ry?: number; rz?: number; opacity?: number };

const POSE_KEYS = ['x', 'y', 'scale', 'rx', 'ry', 'rz', 'opacity'] as const;
const POSE_DEFAULT: Required<Pose> = { ...LAYOUT.phone, rx: 0, ry: 0, rz: 0, opacity: 1 };

/** Blend two poses; t is usually a spring or an eased 0→1. */
export const mix = (a: Pose, b: Pose, t: number): Pose =>
  Object.fromEntries(
    POSE_KEYS.map((k) => {
      const from = a[k] ?? POSE_DEFAULT[k];
      const to = b[k] ?? POSE_DEFAULT[k];
      return [k, from + (to - from) * t];
    }),
  ) as Pose;

/** Places a phone (or anything phone-sized) by its centre, with a 3D pose. */
export const PhoneRig: React.FC<{ pose: Pose; children: React.ReactNode; style?: React.CSSProperties }> = ({
  pose,
  children,
  style,
}) => {
  const { x = LAYOUT.phone.x, y = LAYOUT.phone.y, scale = LAYOUT.phone.scale, rx = 0, ry = 0, rz = 0, opacity = 1 } = pose;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - DEVICE_W / 2,
        top: y - DEVICE_H / 2,
        width: DEVICE_W,
        height: DEVICE_H,
        transformStyle: 'preserve-3d',
        transform: `scale(${scale}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Where a point on the phone screen lands on the canvas, for a flat
 * (unrotated) phone: used to line up overlays with what is on screen.
 */
export const screenToCanvas = (pose: Pose, sx: number, sy: number) => {
  const { x = LAYOUT.phone.x, y = LAYOUT.phone.y, scale = LAYOUT.phone.scale } = pose;
  return [x + (sx + 14 - DEVICE_W / 2) * scale, y + (sy + 14 - DEVICE_H / 2) * scale] as const;
};

/** A fingertip landing: a soft disc that presses in and releases, then a ring. */
export const Tap: React.FC<{ x: number; y: number; at: number; size?: number }> = ({ x, y, at, size = 90 }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < -8 || t > 22) return null;
  const inP = tween(frame, [at - 8, at]);
  const outP = tween(frame, [at + 4, at + 14]);
  const ring = tween(frame, [at, at + 18]);
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 40, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          translate: '-50% -50%',
          background: 'rgba(255,255,255,0.55)',
          border: '3px solid rgba(255,255,255,0.9)',
          boxShadow: '0 8px 24px rgba(10,16,50,0.35)',
          scale: String(0.6 + inP * 0.4 - outP * 0.3),
          opacity: inP * (1 - outP),
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          translate: '-50% -50%',
          border: '4px solid rgba(255,255,255,0.85)',
          scale: String(1 + ring * 1.2),
          opacity: t >= 0 ? 1 - ring : 0,
        }}
      />
    </div>
  );
};

export type SfxName = 'soft-whoosh' | 'whoosh' | 'whip' | 'ding' | 'mouse-click' | 'switch';

/** A sound effect at a frame of the current scene (nothing when the subtree is silent). */
export const Sfx: React.FC<{ at: number; name: SfxName; volume?: number; rate?: number }> = ({
  at,
  name,
  volume = 0.8,
  rate = 1,
}) =>
  useSilent() ? null : (
    <Sequence from={Math.max(0, Math.round(at))} layout="none" name={`sfx ${name}`}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} playbackRate={rate} />
    </Sequence>
  );
