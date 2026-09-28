import React from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/**
 * The app's icons, drawn from the same Ionicons font the app ships
 * (public/fonts/Ionicons.ttf is copied from @expo/vector-icons), so a glyph
 * here is pixel-identical to the one on the phone.
 *
 * Code points come from @expo/vector-icons' Ionicons.json; add a name below
 * when a scene needs a new icon.
 */
const GLYPHS = {
  'albums-outline': 61712,
  'alert-circle': 61715,
  'alert-circle-outline': 61716,
  'arrow-down': 61741,
  'arrow-up': 61765,
  'calendar-outline': 61910,
  call: 61912,
  cash: 61957,
  'cash-outline': 61958,
  chatbubbles: 61975,
  checkmark: 61981,
  'checkmark-circle': 61982,
  'chevron-back': 61993,
  'chevron-forward': 62011,
  close: 62026,
  'close-circle': 62027,
  'document-text': 62131,
  'document-text-outline': 62132,
  'download-outline': 62138,
  'ellipsis-horizontal': 62158,
  'finger-print-outline': 62216,
  'grid-outline': 62294,
  'hourglass-outline': 62342,
  'language-outline': 62378,
  'laptop-outline': 62381,
  'logo-whatsapp': 62501,
  'megaphone-outline': 62543,
  moon: 62560,
  'notifications-outline': 62591,
  people: 62623,
  'people-outline': 62627,
  'person-add-outline': 62631,
  'person-circle-outline': 62634,
  'phone-portrait-outline': 62645,
  'pricetags-outline': 62702,
  'receipt-outline': 62735,
  'repeat-outline': 62768,
  'ribbon-outline': 62789,
  school: 62812,
  'school-outline': 62813,
  'shield-checkmark': 62840,
  'stats-chart': 62875,
  sunny: 62893,
  'time-outline': 62942,
  'trending-up': 62971,
  wallet: 63013,
  'wallet-outline': 63014,
  warning: 63016,
} as const;

export type IconName = keyof typeof GLYPHS;

const FAMILY = 'Ionicons';

// Loaded once per page. delayRender holds every frame until the font is ready,
// so no frame ever renders an empty box where an icon should be.
// Not guarded by document.fonts.check(): it answers true for a family it has
// never heard of, which silently skipped the load.
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading the Ionicons font');
  const face = new FontFace(FAMILY, `url(${staticFile('fonts/Ionicons.ttf')}) format('truetype')`);
  face
    .load()
    .then((loaded) => {
      document.fonts.add(loaded);
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}

/** Same props as <Ionicons name size color />, in app points already scaled to pixels. */
export const Ionicon: React.FC<{
  name: IconName;
  size: number;
  color: string;
  style?: React.CSSProperties;
}> = ({ name, size, color, style }) => (
  <span
    aria-hidden
    style={{
      fontFamily: FAMILY,
      fontSize: size,
      lineHeight: 1,
      width: size,
      height: size,
      color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontStyle: 'normal',
      fontWeight: 'normal',
      flexShrink: 0,
      ...style,
    }}
  >
    {String.fromCodePoint(GLYPHS[name])}
  </span>
);
