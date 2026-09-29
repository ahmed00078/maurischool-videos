import { loadFont as loadOutfit } from '@remotion/google-fonts/Outfit';
import { loadFont as loadTajawal } from '@remotion/google-fonts/Tajawal';
import { Easing, interpolate } from 'remotion';

/**
 * Design tokens for the v2 video, copied from the app so the phones on screen
 * are MauriSchool and not a lookalike:
 * - colours from mobile_app/src/theme/colors.ts
 * - fonts from mobile_app/src/theme/fonts.ts (Outfit for French, Tajawal for Arabic,
 *   and Tajawal has no 600 so semiBold is 700 there too)
 */

export const OUTFIT = loadOutfit('normal', {
  weights: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin', 'latin-ext'],
}).fontFamily;
export const TAJAWAL = loadTajawal('normal', {
  weights: ['400', '500', '700', '800'],
  subsets: ['arabic', 'latin'],
}).fontFamily;

export const APP = {
  white: '#ffffff',
  glass: { tint: '#000000', content: '#ffffff', contentMuted: '#d4d4d4' },
  logo: { violet: '#465fff', ink: '#2f3b69' },
  brand: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#465fff',
    600: '#3b4fdb',
    700: '#3145b7',
    800: '#283893',
    900: '#1f2b6f',
  },
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
  info: '#2563eb',
  light: {
    background: '#ffffff',
    surface: '#f9fafb',
    card: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  },
  dark: {
    background: '#111827',
    surface: '#1f2937',
    card: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
  },
} as const;

/** Stage colours: the world around the phones. Night is the brand's deepest blue. */
export const STAGE = {
  night: '#0b1033',
  navy: '#141b4d',
  paper: '#f4f6ff',
  whatsapp: '#25d366',
} as const;

export type Theme = 'light' | 'dark';
export const themeColors = (theme: Theme) => APP[theme];

/**
 * App points to video pixels. The phone screen is 390 x 844 pt, which lands
 * at 585 x 1266 px, so a 14 pt label in the app is 21 px here, as on a real phone.
 */
export const S = 1.5;
export const pt = (n: number) => n * S;
export const SCREEN_W = pt(390);
export const SCREEN_H = pt(844);

export const FPS = 30;

/**
 * The beat grid. Every scene length and every accent sits on it so cuts land
 * on the music. Change BPM once the final track is chosen and the edit follows.
 */
export const BPM = 120;
export const BEAT = (FPS * 60) / BPM; // 15 frames at 120 BPM
export const BAR = BEAT * 4;
export const beats = (n: number) => Math.round(n * BEAT);

/** The house easing: fast out, long settle. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Clamped ease-out between two frames; the default motion of the video. */
export const tween = (
  frame: number,
  [a, b]: [number, number],
  [from, to]: [number, number] = [0, 1],
  easing: (t: number) => number = EASE_OUT,
) => interpolate(frame, [a, b], [from, to], { ...clamp, easing });
