import React from 'react';
import { useLang } from './lang';
import { Pose } from './rig';
import { APP, pt, SCREEN_H, SCREEN_W } from './tokens';
import { BEZEL, DEVICE_H, DEVICE_W } from './ui/Device';

/**
 * The landscape stage (1920 × 1080), for videos watched on a laptop or a
 * projector: text on the reading side, the phone on the other, and between
 * them the one section of the screen the scene is about.
 *
 * A video for schools never shows a whole screen sharp. The screen is veiled
 * (blurred, washed out: a real app is there, nothing can be read or copied)
 * and only a `Rect` of it stays sharp, in a `Window` on the phone or as a
 * `Lift`, the same section enlarged beside it.
 */
export const WIDE = {
  W: 1920,
  H: 1080,
  /** The phone, on the far side from the text. */
  phone: { x: 1560, y: 548, scale: 0.7 },
  /** The text column: its inline-start margin and its width. */
  text: { start: 120, width: 640 },
} as const;

/** Mirrors a canvas x in Arabic, so a layout written left-to-right reads right-to-left. */
export const useMirror = () => {
  const { rtl } = useLang();
  return (x: number) => (rtl ? WIDE.W - x : x);
};

/** A section of a phone screen, in app points from the screen's top-left, written for French. */
export type Rect = { x: number; y: number; w: number; h: number; r?: number };

/** The same section in the current language: screens mirror in Arabic, so does the rect. */
export const useRect = () => {
  const { rtl } = useLang();
  return (r: Rect): Rect => (rtl ? { ...r, x: 390 - r.x - r.w } : r);
};

/** Where a rect's centre lands on the canvas, for a flat phone in `pose`. */
export const rectCenter = (pose: Pose, r: Rect) => {
  const { x = WIDE.phone.x, y = WIDE.phone.y, scale = WIDE.phone.scale } = pose;
  return [x + (pt(r.x + r.w / 2) + BEZEL - DEVICE_W / 2) * scale, y + (pt(r.y + r.h / 2) + BEZEL - DEVICE_H / 2) * scale] as const;
};

/** The screen, clipped to a rect: the piece every sharp copy is made of. */
const Clip: React.FC<{ rect: Rect; children: React.ReactNode; style?: React.CSSProperties }> = ({ rect, children, style }) => (
  <div style={{ position: 'absolute', left: pt(rect.x), top: pt(rect.y), width: pt(rect.w), height: pt(rect.h), borderRadius: pt(rect.r ?? 16), overflow: 'hidden', ...style }}>
    <div style={{ position: 'absolute', left: -pt(rect.x), top: -pt(rect.y), width: SCREEN_W, height: SCREEN_H }}>{children}</div>
  </div>
);

/**
 * A phone screen behind the veil. `veil` (0 to 1) blurs and washes out
 * everything; each window keeps its rect sharp (`open` 0 to 1), ringed in the
 * brand colour. Goes inside a <Device>.
 */
export const Veiled: React.FC<{
  children: React.ReactNode;
  veil?: number;
  /** `open` shows the rect sharp; `ring` outlines its place (it stays when the section has lifted out). */
  windows?: { rect: Rect; open?: number; ring?: number }[];
  /** The wash over the blur: the app's background, or a dark screen's. */
  wash?: string;
}> = ({ children, veil = 1, windows = [], wash = '#f4f6ff' }) => {
  const fix = useRect();
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Grown a little, so the blur has no transparent edge */}
      <div style={{ position: 'absolute', inset: 0, filter: veil > 0 ? `blur(${14 * veil}px) saturate(${1 - 0.55 * veil})` : undefined, scale: String(1 + 0.05 * veil) }}>{children}</div>
      <div style={{ position: 'absolute', inset: 0, background: wash, opacity: 0.42 * veil }} />
      {windows.map(({ rect, open = 1, ring = 1 }, i) => {
        const r = fix(rect);
        return (
          <React.Fragment key={i}>
            {open > 0 ? (
              <Clip rect={r} style={{ opacity: open }}>
                {children}
              </Clip>
            ) : null}
            {ring > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  left: pt(r.x),
                  top: pt(r.y),
                  width: pt(r.w),
                  height: pt(r.h),
                  borderRadius: pt(r.r ?? 16),
                  boxSizing: 'border-box',
                  border: `${pt(2)}px solid ${APP.brand[500]}`,
                  background: `rgba(70,95,255,${0.07 * (1 - open)})`,
                  opacity: ring,
                }}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * A section lifted out of the phone: the same rect of the same screen, on a
 * card of its own. At `t` 0 it sits exactly over its place on the phone; at 1
 * it is centred on `to` at `to.scale` (pixels per screen pixel). `to.x` is
 * mirrored in Arabic.
 */
export const Lift: React.FC<{
  pose: Pose;
  rect: Rect;
  to: { x: number; y: number; scale: number };
  t: number;
  children: React.ReactNode;
  opacity?: number;
  /** A slow float once lifted, in pixels (driven by the scene). */
  drift?: number;
}> = ({ pose, rect, to, t, children, opacity = 1, drift = 0 }) => {
  const fix = useRect();
  const mirror = useMirror();
  const r = fix(rect);
  const [fx, fy] = rectCenter(pose, r);
  const fromScale = pose.scale ?? WIDE.phone.scale;
  const x = fx + (mirror(to.x) - fx) * t;
  const y = fy + (to.y - fy) * t + drift;
  const scale = fromScale + (to.scale - fromScale) * t;
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - pt(r.w) / 2,
        top: y - pt(r.h) / 2,
        width: pt(r.w),
        height: pt(r.h),
        scale: String(scale),
        opacity,
        borderRadius: pt(r.r ?? 16),
        boxShadow: `0 ${10 + 40 * t}px ${30 + 60 * t}px rgba(15,22,70,${0.14 + 0.2 * t}), 0 0 0 ${pt(1.5)}px rgba(70,95,255,${0.55 - 0.3 * t})`,
        zIndex: 5,
      }}
    >
      <Clip rect={{ ...r, x: 0, y: 0 }} style={{ left: 0, top: 0 }}>
        <div style={{ position: 'absolute', left: -pt(r.x), top: -pt(r.y), width: SCREEN_W, height: SCREEN_H }}>{children}</div>
      </Clip>
    </div>
  );
};

/** The text column on the reading side: vertically centred, start-aligned. */
export const Side: React.FC<{ children: React.ReactNode; gap?: number; style?: React.CSSProperties }> = ({ children, gap = 26, style }) => {
  const { dir } = useLang();
  return (
    <div
      dir={dir}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 60,
        insetInlineStart: WIDE.text.start,
        width: WIDE.text.width,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap,
        zIndex: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** A phone pose on the wide stage: the default place, mirrored in Arabic. */
export const useWidePhone = () => {
  const mirror = useMirror();
  return (p: Pose = {}): Pose => ({ ...WIDE.phone, ...p, x: mirror(p.x ?? WIDE.phone.x), ry: p.ry === undefined ? undefined : (mirror(1) === 1 ? p.ry : -p.ry) });
};
