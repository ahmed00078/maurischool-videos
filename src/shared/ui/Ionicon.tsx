import React from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

/**
 * The app's icons, drawn from the same Ionicons font the app ships
 * (public/shared/fonts/Ionicons.ttf is copied from @expo/vector-icons), so a glyph
 * here is pixel-identical to the one on the phone.
 *
 * Code points come from @expo/vector-icons' Ionicons.json; add a name below
 * when a scene needs a new icon.
 */
const GLYPHS = {
  add: 61699,
  'arrow-back': 61735,
  'arrow-forward': 61747,
  'book-outline': 61862,
  'business-outline': 61895,
  'calculator-outline': 61901,
  calendar: 61903,
  'checkmark-circle-outline': 61983,
  'checkmark-done-outline': 61989,
  'chevron-down': 62002,
  'clipboard-outline': 62024,
  'close-circle-outline': 62028,
  'contrast-outline': 62093,
  'desktop-outline': 62111,
  'easel-outline': 62150,
  'eye-outline': 62186,
  'globe-outline': 62288,
  'heart-outline': 62327,
  'home-outline': 62339,
  'library-outline': 62390,
  'lock-closed': 62407,
  notifications: 62581,
  'people-circle-outline': 62625,
  person: 62629,
  'person-outline': 62636,
  receipt: 62734,
  'remove-circle-outline': 62754,
  ribbon: 62788,
  send: 62821,
  sparkles: 62860,
  star: 62869,
  time: 62941,
  'trophy-outline': 62978,
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
  'paper-plane-outline': 62606,
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
  'arrow-down-circle-outline': 61743,
  'chatbubble-ellipses-outline': 61971,
  'information-circle': 62360,
  'information-circle-outline': 62361,
  'person-remove': 62637,
  'person-remove-outline': 62638,
  card: 61927,
  'card-outline': 61928,
  eye: 62182,
  // The system PDF viewer's bar
  'share-social-outline': 62837,
  'ellipsis-vertical': 62164,
  'document-outline': 62129,
  // The announcements category (notificationCategories.ts)
  megaphone: 62542,
  // The generic chat app (chat.tsx)
  mic: 62548,
  play: 62662,
  'checkmark-done': 61985,
  'arrow-redo': 61753,
  'camera-outline': 61916,
  'call-outline': 61913,
  'videocam-outline': 62993,
  'search-outline': 62819,
  'happy-outline': 62306,
  attach: 61777,
  chatbubble: 61969,
} as const;

export type IconName = keyof typeof GLYPHS;

const FAMILY = 'Ionicons';

// Loaded once per page. delayRender holds every frame until the font is ready,
// so no frame ever renders an empty box where an icon should be.
// Not guarded by document.fonts.check(): it answers true for a family it has
// never heard of, which silently skipped the load.
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading the Ionicons font');
  const face = new FontFace(FAMILY, `url(${staticFile('shared/fonts/Ionicons.ttf')}) format('truetype')`);
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
