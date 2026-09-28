import { loadFont as loadTajawal } from '@remotion/google-fonts/Tajawal';
import { loadFont as loadOutfit } from '@remotion/google-fonts/Outfit';
import { Easing, interpolate, useVideoConfig } from 'remotion';

export const AR = loadTajawal('normal', {
  weights: ['400', '500', '700', '800'],
  subsets: ['arabic', 'latin'],
}).fontFamily;
export const FR = loadOutfit('normal', {
  weights: ['400', '600', '700', '800'],
  subsets: ['latin'],
}).fontFamily;

// Colours from mobile_app/src/theme/colors.ts (brand scale) plus status hues.
export const C = {
  brand: '#465fff',
  brand600: '#3b4fdb',
  brand50: '#eef2ff',
  navy: '#1f2b6f',
  night: '#121a47',
  ink: '#1d2440',
  inkSoft: '#5b6280',
  paper: '#f5f7ff',
  white: '#ffffff',
  green: '#12b76a',
  orange: '#f79009',
  red: '#f04438',
  whatsapp: '#25d366',
  line: '#e4e7f2',
};

export const FPS = 30;

/** Same scenes, two cuts: 1080x1920 for WhatsApp, 1920x1080 for laptops and YouTube. */
export const useLandscape = () => {
  const { width, height } = useVideoConfig();
  return width > height;
};

/** How far a phone travels to leave or enter the frame. */
export const useOffscreen = () => (useLandscape() ? 1750 : 1150);
export const T = 12; // transition length in frames

export type Tone = 'light' | 'dark' | 'brand';
export const toneBg: Record<Tone, string> = {
  light: C.paper,
  dark: `radial-gradient(120% 80% at 50% 30%, ${C.navy} 0%, ${C.night} 100%)`,
  brand: `radial-gradient(120% 80% at 50% 35%, #5a70ff 0%, ${C.brand600} 100%)`,
};

const out = Easing.bezier(0.16, 1, 0.3, 1);

/** Clamped ease-out interpolation, the default motion of the video. */
export const ease = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = out,
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Western digits with a thin-space thousands separator, as in the app. */
export const fmt = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
