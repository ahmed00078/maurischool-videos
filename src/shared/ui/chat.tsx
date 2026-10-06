import React from 'react';
import { loadFont as loadNotoArabic } from '@remotion/google-fonts/NotoSansArabic';
import { loadFont as loadRoboto } from '@remotion/google-fonts/Roboto';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Bi, useBi, useLang } from '../lang';
import { pt, SCREEN_H, SCREEN_W } from '../tokens';
import { Ionicon } from './Ionicon';

/**
 * A generic chat app, the kind every parents' group lives in: a green bar,
 * a list of conversations with unread badges, a thread of bubbles over a
 * tiled wall, voice notes, forwarded chains, pictures and stickers.
 *
 * It is deliberately nobody's app: no logo, no name, its own colours, its own
 * wording, its own icons (Ionicons, like the rest of the kit). The phone's
 * system font (Roboto, Noto Sans Arabic) keeps it from reading as MauriSchool,
 * which is drawn in Outfit and Tajawal. Never put a real messenger's logo or
 * name on it: a video says « le groupe des parents ».
 *
 * Sizes are in app points through `pt()`, on the same 390 × 844 screen as the
 * MauriSchool screens, and everything mirrors in Arabic.
 */

const ROBOTO = loadRoboto('normal', { weights: ['400', '500', '700'], subsets: ['latin', 'latin-ext'] }).fontFamily;
const NOTO_ARABIC = loadNotoArabic('normal', { weights: ['400', '500', '700'], subsets: ['arabic'] }).fontFamily;
/** The chat's font, with the system's emoji behind it. */
const useChatFont = () => {
  const { rtl } = useLang();
  return rtl ? `${NOTO_ARABIC}, ${ROBOTO}, sans-serif` : `${ROBOTO}, sans-serif`;
};

export const CHAT = {
  bar: '#137a5d',
  barText: '#ffffff',
  barMuted: 'rgba(255,255,255,0.78)',
  accent: '#1fb56c',
  wall: '#ece5d9',
  wallInk: 'rgba(122, 98, 62, 0.11)',
  incoming: '#ffffff',
  outgoing: '#d8f4cb',
  text: '#1b2125',
  sub: '#65717a',
  meta: '#8b949a',
  tick: '#36a3e6',
  divider: '#edf0f2',
  highlight: 'rgba(31, 181, 108, 0.22)',
} as const;

/** The chat app's own interface words: invented, generic, not any real app's. */
export const CHAT_COPY = {
  conversations: { fr: 'Conversations', ar: 'المحادثات' },
  placeholder: { fr: 'Message', ar: 'رسالة' },
  forwarded: { fr: 'Transféré plusieurs fois', ar: 'أُعيد توجيهه عدة مرات' },
  today: { fr: 'Aujourd’hui', ar: 'اليوم' },
  photo: { fr: 'Photo', ar: 'صورة' },
  sticker: { fr: 'Autocollant', ar: 'ملصق' },
  voice: { fr: 'Message vocal', ar: 'رسالة صوتية' },
} satisfies Record<string, Bi>;

/** A round avatar: a colour and a glyph (initials, or an emoji for a group). */
export type ChatAvatar = { color: string; glyph: string };

/** Someone in a group: the name in their colour, their avatar. */
export type ChatSender = { name: string; color: string; avatar: ChatAvatar };

/** The drawn pictures people post: flowers, a good-evening card, a sunrise. */
export type ChatArt = 'flowers' | 'evening' | 'morning';

export type ChatMessage =
  | { kind: 'day'; label: string }
  | { kind: 'unread'; label: string }
  | { kind: 'text'; from: ChatSender; text: string; time: string; lines?: number; forwarded?: boolean; mine?: boolean }
  | { kind: 'voice'; from: ChatSender; duration: string; time: string; mine?: boolean }
  | { kind: 'image'; from: ChatSender; art: ChatArt; caption?: string; time: string; mine?: boolean }
  | { kind: 'sticker'; from: ChatSender; time: string; mine?: boolean };

// ── layout: every message has a known height, so a scene can scroll to one ──

const L = {
  /** The bar: status bar 44, then 58. */
  top: 44 + 58,
  /** The composer row at the bottom: 10 + 48 + 10, above the gesture bar (16). */
  bottom: 84,
  side: 8,
  avatar: 30,
  gap: 6,
  bubbleMax: 280,
  line: 20,
  name: 19,
  forwarded: 19,
  meta: 17,
  padTop: 7,
  padBottom: 4,
  voice: 46,
  image: 176,
  sticker: 124,
  day: 40,
  unread: 44,
  sameRun: 3,
  newRun: 9,
} as const;

const isBubble = (m: ChatMessage): m is Exclude<ChatMessage, { kind: 'day' } | { kind: 'unread' }> => m.kind !== 'day' && m.kind !== 'unread';
const sameSender = (a: ChatMessage | undefined, b: ChatMessage) => a !== undefined && isBubble(a) && isBubble(b) && a.from.name === b.from.name && !!a.mine === !!b.mine;

const heightOf = (m: ChatMessage, first: boolean) => {
  const name = first && isBubble(m) && !m.mine ? L.name : 0;
  switch (m.kind) {
    case 'day':
      return L.day;
    case 'unread':
      return L.unread;
    case 'text':
      return L.padTop + name + (m.forwarded ? L.forwarded : 0) + (m.lines ?? 1) * L.line + L.meta + L.padBottom;
    case 'voice':
      return L.padTop + name + L.voice + L.padBottom + 6;
    case 'image':
      return 4 + name + L.image + (m.caption ? L.line + 6 : 0) + L.meta + L.padBottom;
    case 'sticker':
      return L.sticker;
  }
};

export type ThreadLayout = {
  /** Top of each message, in points from the top of the content. */
  y: number[];
  h: number[];
  total: number;
  /** How much of the thread shows between the bar and the composer. */
  viewport: number;
};

/** Where every message of a thread sits, so a scene can scroll to one (`scrollTo`). */
export const threadLayout = (messages: ChatMessage[]): ThreadLayout => {
  const y: number[] = [];
  const h: number[] = [];
  let at = 8;
  messages.forEach((m, i) => {
    const first = !sameSender(messages[i - 1], m);
    if (i > 0) at += first ? L.newRun : L.sameRun;
    y.push(at);
    h.push(heightOf(m, first));
    at += h[i];
  });
  return { y, h, total: at + 10, viewport: SCREEN_H / 1.5 - L.top - L.bottom };
};

/** The scroll that puts message `i` at `where` of the viewport (0 top, 0.5 middle, 1 bottom). */
export const scrollTo = (layout: ThreadLayout, i: number, where = 0.5) =>
  layout.y[i] + layout.h[i] / 2 - layout.viewport * where;

/** The furthest a thread scrolls: its last message resting on the composer. */
export const scrollEnd = (layout: ThreadLayout) => Math.max(0, layout.total - layout.viewport);

// ── pieces ──

export const AvatarDisc: React.FC<{ avatar: ChatAvatar; size: number }> = ({ avatar, size }) => {
  const emoji = /\p{Extended_Pictographic}/u.test(avatar.glyph);
  return (
    <div
      style={{
        width: pt(size),
        height: pt(size),
        borderRadius: '50%',
        background: avatar.color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: pt(size * (emoji ? 0.52 : 0.4)),
        fontWeight: 500,
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {avatar.glyph}
    </div>
  );
};

/** Two ticks, read (blue) or not. */
const Ticks: React.FC<{ read?: boolean; size?: number }> = ({ read = true, size = 15 }) => (
  <Ionicon name="checkmark-done" size={pt(size)} color={read ? CHAT.tick : CHAT.meta} />
);

/** The unread count: a green disc, wider for three digits. `pulse` swells it as a message lands. */
export const UnreadBadge: React.FC<{ count: number; size?: number; pulse?: number }> = ({ count, size = 22, pulse = 0 }) => (
  <div
    style={{
      minWidth: pt(size),
      height: pt(size),
      padding: `0 ${pt(size * 0.3)}px`,
      boxSizing: 'border-box',
      borderRadius: pt(size),
      background: CHAT.accent,
      color: '#fff',
      fontSize: pt(size * 0.56),
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: ROBOTO,
      direction: 'ltr',
      scale: String(1 + 0.18 * pulse),
      boxShadow: pulse > 0 ? `0 0 0 ${pt(3) * pulse}px rgba(31,181,108,${0.25 * pulse})` : undefined,
      flexShrink: 0,
    }}
  >
    {count}
  </div>
);

/** The green bar with the status bar's room above it. */
const Bar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: pt(L.top),
      boxSizing: 'border-box',
      background: CHAT.bar,
      color: CHAT.barText,
      display: 'flex',
      alignItems: 'center',
      padding: `${pt(44)}px ${pt(12)}px 0`,
      gap: pt(10),
      zIndex: 4,
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    }}
  >
    {children}
  </div>
);

// ── the list of conversations ──

export type ChatListItem = {
  name: string;
  avatar: ChatAvatar;
  /** The last message, with its sender ("Maman de Mariem : Amine 🤲") for a group. */
  preview: string;
  time: string;
  unread?: number;
  /** A tick before the preview: the last message was yours. */
  mine?: boolean;
};

/** Where row `i` of the list sits, in points from the top of the screen. */
export const CHAT_ROW = { top: L.top + 8, height: 76 } as const;
export const chatRowCenter = (i: number) => CHAT_ROW.top + i * CHAT_ROW.height + CHAT_ROW.height / 2;

/**
 * One conversation: avatar, name and time, then the last message and the
 * unread badge. `emphasis` (0 to 1) is the video's highlight on the row being
 * watched; `pulse` swells the badge.
 */
export const ChatListRow: React.FC<{ item: ChatListItem; emphasis?: number; pulse?: number }> = ({ item, emphasis = 0, pulse = 0 }) => {
  const unread = (item.unread ?? 0) > 0;
  return (
    <div
      style={{
        position: 'relative',
        height: pt(CHAT_ROW.height),
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${pt(16)}px`,
        gap: pt(14),
        background: emphasis > 0 ? `rgba(31,181,108,${0.1 * emphasis})` : undefined,
      }}
    >
      <AvatarDisc avatar={item.avatar} size={52} />
      <div style={{ flex: 1, minWidth: 0, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: `1px solid ${CHAT.divider}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: pt(8) }}>
          <div style={{ flex: 1, minWidth: 0, fontSize: pt(16.5), fontWeight: 500, color: CHAT.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
          <div style={{ fontSize: pt(12), color: unread ? CHAT.accent : CHAT.meta, fontWeight: unread ? 500 : 400, direction: 'ltr' }}>{item.time}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: pt(8), marginTop: pt(4) }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: pt(3) }}>
            {item.mine ? <Ticks size={15} /> : null}
            <div style={{ flex: 1, minWidth: 0, fontSize: pt(14), color: CHAT.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.preview}</div>
          </div>
          {unread ? <UnreadBadge count={item.unread!} pulse={pulse} /> : null}
        </div>
      </div>
    </div>
  );
};

/** The screen: the bar with « Conversations », the rows, the new-chat button. */
export const ChatList: React.FC<{ items: ChatListItem[]; emphasis?: number[]; pulse?: number[] }> = ({ items, emphasis = [], pulse = [] }) => {
  const bi = useBi();
  const { dir } = useLang();
  const font = useChatFont();
  return (
    <div dir={dir} style={{ position: 'absolute', inset: 0, width: SCREEN_W, height: SCREEN_H, background: '#fff', fontFamily: font, overflow: 'hidden' }}>
      <Bar>
        <div style={{ flex: 1, fontSize: pt(21), fontWeight: 500, paddingInlineStart: pt(4) }}>{bi(CHAT_COPY.conversations)}</div>
        <Ionicon name="camera-outline" size={pt(23)} color={CHAT.barText} />
        <Ionicon name="search-outline" size={pt(22)} color={CHAT.barText} />
        <Ionicon name="ellipsis-vertical" size={pt(21)} color={CHAT.barText} />
      </Bar>
      <div style={{ position: 'absolute', left: 0, right: 0, top: pt(CHAT_ROW.top) }}>
        {items.map((item, i) => (
          <ChatListRow key={i} item={item} emphasis={emphasis[i] ?? 0} pulse={pulse[i] ?? 0} />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          insetInlineEnd: pt(16),
          bottom: pt(40),
          width: pt(56),
          height: pt(56),
          borderRadius: pt(16),
          background: CHAT.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 14px rgba(0,0,0,0.22)',
        }}
      >
        <Ionicon name="chatbubble" size={pt(24)} color="#fff" />
      </div>
    </div>
  );
};

// ── the thread ──

/** The wall behind the bubbles: a soft tile of little shapes, fixed while the bubbles scroll. */
const WALL = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'><g fill='none' stroke='${CHAT.wallInk}' stroke-width='2.2' stroke-linecap='round'><circle cx='14' cy='16' r='6'/><path d='M52 10 l6 10 h-12 z'/><path d='M30 50 h10 M35 45 v10'/><rect x='60' y='46' width='11' height='11' rx='3'/><path d='M8 68 q6 -8 12 0 t12 0'/><circle cx='70' cy='76' r='2.5'/><circle cx='44' cy='28' r='2'/></g></svg>`,
)}")`;

/** A drawn picture someone posted, filling `w` × `h` points. */
const Art: React.FC<{ art: ChatArt; w: number; h: number }> = ({ art, w, h }) => {
  const box = { width: pt(w), height: pt(h), display: 'block' } as const;
  if (art === 'flowers') {
    const flower = (x: number, y: number, r: number, petal: string, heart: string, k: number) => (
      <g key={k} transform={`translate(${x} ${y})`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx="0" cy={-r} rx={r * 0.62} ry={r} fill={petal} transform={`rotate(${i * 60})`} />
        ))}
        <circle r={r * 0.6} fill={heart} />
      </g>
    );
    return (
      <svg viewBox="0 0 280 176" style={box} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="chat-art-f" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe3ec" />
            <stop offset="1" stopColor="#ffd0a8" />
          </linearGradient>
        </defs>
        <rect width="280" height="176" fill="url(#chat-art-f)" />
        {[40, 90, 140, 190, 240].map((x, i) => (
          <path key={i} d={`M ${x} 176 Q ${x + (i % 2 ? 12 : -12)} 130 ${x + (i - 2) * 6} ${90 + (i % 2) * 20}`} stroke="#4f9a4a" strokeWidth="5" fill="none" />
        ))}
        {flower(58, 92, 20, '#ff6f91', '#ffd23f', 0)}
        {flower(128, 70, 26, '#ff9ecf', '#fff3b0', 1)}
        {flower(196, 96, 22, '#ff5e78', '#ffd23f', 2)}
        {flower(246, 66, 16, '#ffb3c6', '#ffe066', 3)}
        {flower(96, 128, 14, '#ffc2d1', '#ffe066', 4)}
        {[20, 70, 160, 230, 262].map((x, i) => (
          <circle key={i} cx={x} cy={24 + (i % 3) * 14} r={3} fill="#fff" opacity="0.9" />
        ))}
      </svg>
    );
  }
  if (art === 'evening') {
    return (
      <svg viewBox="0 0 280 176" style={box} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="chat-art-e" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b1d6b" />
            <stop offset="1" stopColor="#c0508a" />
          </linearGradient>
        </defs>
        <rect width="280" height="176" fill="url(#chat-art-e)" />
        <circle cx="200" cy="62" r="34" fill="#ffe9a8" />
        <circle cx="214" cy="52" r="30" fill="#3a2475" />
        {[
          [40, 30, 5],
          [84, 60, 3],
          [120, 24, 4],
          [150, 80, 3],
          [250, 120, 4],
          [60, 100, 3],
          [26, 140, 4],
        ].map(([x, y, r], i) => (
          <path key={i} d={`M ${x} ${y - r * 2} L ${x + r * 0.6} ${y - r * 0.6} L ${x + r * 2} ${y} L ${x + r * 0.6} ${y + r * 0.6} L ${x} ${y + r * 2} L ${x - r * 0.6} ${y + r * 0.6} L ${x - r * 2} ${y} L ${x - r * 0.6} ${y - r * 0.6} Z`} fill="#fff4c9" />
        ))}
        <path d="M 0 176 L 0 150 Q 70 128 140 150 T 280 146 L 280 176 Z" fill="#241457" opacity="0.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 280 176" style={box} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="chat-art-m" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb86b" />
          <stop offset="0.6" stopColor="#ffe29a" />
          <stop offset="1" stopColor="#fff4d6" />
        </linearGradient>
      </defs>
      <rect width="280" height="176" fill="url(#chat-art-m)" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M 140 128 L ${140 + Math.cos((i / 12) * Math.PI * 2) * 200} ${128 + Math.sin((i / 12) * Math.PI * 2) * 200}`} stroke="#fff3c4" strokeWidth="10" opacity="0.35" />
      ))}
      <circle cx="140" cy="128" r="44" fill="#ff9f1c" />
      <circle cx="140" cy="128" r="34" fill="#ffc94a" />
      <path d="M 0 176 L 0 140 Q 60 120 120 142 Q 190 164 280 132 L 280 176 Z" fill="#e8a34e" />
      <path d="M 0 176 L 0 156 Q 90 140 170 160 Q 230 172 280 158 L 280 176 Z" fill="#d88b3a" />
    </svg>
  );
};

/** A sticker: a glass of atay with its foam and two little hearts of steam. */
const Sticker: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 120 120" width={pt(size)} height={pt(size)} style={{ display: 'block', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))' }}>
    <path d="M 38 30 L 82 30 L 76 104 Q 60 110 44 104 Z" fill="#fff" stroke="#fff" strokeWidth="10" strokeLinejoin="round" />
    <path d="M 38 30 L 82 30 L 76 104 Q 60 110 44 104 Z" fill="#b8561c" />
    <path d="M 39 30 L 81 30 L 79.5 48 L 40.5 48 Z" fill="#f4e3c1" />
    <path d="M 44 56 L 48 96" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.5" />
    <circle cx="52" cy="72" r="3.5" fill="#2a1d1a" />
    <circle cx="68" cy="72" r="3.5" fill="#2a1d1a" />
    <path d="M 52 82 Q 60 90 68 82" stroke="#2a1d1a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    {[
      [44, 16, 7],
      [74, 10, 9],
    ].map(([x, y, s], i) => (
      <path key={i} d={`M ${x} ${y + s * 0.9} C ${x - s * 1.4} ${y} ${x - s * 0.5} ${y - s * 0.9} ${x} ${y - s * 0.2} C ${x + s * 0.5} ${y - s * 0.9} ${x + s * 1.4} ${y} ${x} ${y + s * 0.9} Z`} fill="#ff4d6d" stroke="#fff" strokeWidth="3" />
    ))}
  </svg>
);

/** A voice note: play, a waveform, its length. The same shape for the same length, on every frame. */
const Voice: React.FC<{ duration: string; color: string }> = ({ duration, color }) => {
  let s = [...duration].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const bars = Array.from({ length: 30 }, () => 0.25 + r() * 0.75);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: pt(8), height: pt(L.voice), width: pt(236), direction: 'ltr' }}>
      <Ionicon name="play" size={pt(26)} color={CHAT.sub} />
      <div style={{ flex: 1, position: 'relative', height: pt(30), display: 'flex', alignItems: 'center', gap: pt(1.8) }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, height: `${b * 100}%`, borderRadius: pt(2), background: '#b7c0c6' }} />
        ))}
        <div style={{ position: 'absolute', left: -pt(2), top: '50%', width: pt(12), height: pt(12), marginTop: -pt(6), borderRadius: '50%', background: color }} />
        <div style={{ position: 'absolute', left: 0, bottom: -pt(15), fontSize: pt(11.5), color: CHAT.meta }}>{duration}</div>
      </div>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: pt(40), height: pt(40), borderRadius: '50%', background: `${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicon name="mic" size={pt(20)} color={color} />
        </div>
      </div>
    </div>
  );
};

/** The time and, on your own messages, the ticks: bottom corner of a bubble. */
const Meta: React.FC<{ time: string; mine?: boolean; onImage?: boolean }> = ({ time, mine, onImage }) => (
  <div
    style={{
      position: 'absolute',
      insetInlineEnd: pt(onImage ? 10 : 8),
      bottom: pt(onImage ? 8 : 4),
      display: 'flex',
      alignItems: 'center',
      gap: pt(3),
      fontSize: pt(11.5),
      color: onImage ? '#fff' : CHAT.meta,
      direction: 'ltr',
      textShadow: onImage ? '0 1px 3px rgba(0,0,0,0.5)' : undefined,
    }}
  >
    {time}
    {mine ? <Ticks size={14} /> : null}
  </div>
);

/** A day's chip: « Mardi », centred, floating over the wall. */
const DayChip: React.FC<{ label: string; style?: React.CSSProperties }> = ({ label, style }) => (
  <div style={{ display: 'flex', justifyContent: 'center', ...style }}>
    <div style={{ padding: `${pt(5)}px ${pt(12)}px`, borderRadius: pt(8), background: 'rgba(255,255,255,0.94)', color: CHAT.sub, fontSize: pt(12.5), fontWeight: 500, boxShadow: '0 1px 1px rgba(0,0,0,0.08)' }}>{label}</div>
  </div>
);

const Bubble: React.FC<{ m: Exclude<ChatMessage, { kind: 'day' } | { kind: 'unread' }>; first: boolean }> = ({ m, first }) => {
  const bi = useBi();
  const { rtl } = useLang();
  const mine = !!m.mine;
  const showName = first && !mine;
  const bg = mine ? CHAT.outgoing : CHAT.incoming;
  const name = showName ? (
    <div style={{ height: pt(L.name), lineHeight: `${pt(L.name)}px`, fontSize: pt(13.5), fontWeight: 500, color: m.from.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingInlineEnd: pt(24) }}>{m.from.name}</div>
  ) : null;
  // The little tail on the first bubble of a run, at the top on the sender's side.
  const tailOnStart = !mine;
  const tail = first ? (
    <svg width={pt(10)} height={pt(12)} viewBox="0 0 10 12" style={{ position: 'absolute', top: 0, [tailOnStart ? 'insetInlineStart' : 'insetInlineEnd']: -pt(8), scale: (tailOnStart !== rtl) ? '1 1' : '-1 1' }}>
      <path d="M 10 0 L 0 0 Q 6 4 10 12 Z" fill={bg} />
    </svg>
  ) : null;
  if (m.kind === 'sticker') {
    return (
      <div style={{ position: 'relative', width: pt(L.sticker), height: pt(L.sticker) }}>
        <Sticker size={L.sticker - 8} />
        <div style={{ position: 'absolute', insetInlineEnd: 0, bottom: pt(4), padding: `${pt(1)}px ${pt(6)}px`, borderRadius: pt(8), background: 'rgba(255,255,255,0.9)', fontSize: pt(11), color: CHAT.meta, direction: 'ltr' }}>{m.time}</div>
      </div>
    );
  }
  const common: React.CSSProperties = {
    position: 'relative',
    background: bg,
    borderRadius: pt(10),
    [tailOnStart ? 'borderStartStartRadius' : 'borderStartEndRadius']: first ? 0 : pt(10),
    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
    boxSizing: 'border-box',
  };
  if (m.kind === 'image') {
    return (
      <div style={{ ...common, width: pt(L.bubbleMax), padding: pt(4), paddingBottom: pt(m.caption ? L.meta + L.padBottom : 4) }}>
        {tail}
        {showName ? <div style={{ padding: `${pt(2)}px ${pt(6)}px 0` }}>{name}</div> : null}
        <div style={{ position: 'relative', borderRadius: pt(8), overflow: 'hidden' }}>
          <Art art={m.art} w={L.bubbleMax - 8} h={L.image} />
          {m.caption ? null : <Meta time={m.time} mine={mine} onImage />}
        </div>
        {m.caption ? <div style={{ padding: `${pt(6)}px ${pt(6)}px 0`, fontSize: pt(15), lineHeight: `${pt(L.line)}px`, color: CHAT.text }}>{m.caption}</div> : null}
        {m.caption ? <Meta time={m.time} mine={mine} /> : null}
      </div>
    );
  }
  if (m.kind === 'voice') {
    return (
      <div style={{ ...common, padding: `${pt(L.padTop)}px ${pt(10)}px ${pt(L.padBottom + 6)}px` }}>
        {tail}
        {name}
        <Voice duration={m.duration} color={m.from.avatar.color} />
        <Meta time={m.time} mine={mine} />
      </div>
    );
  }
  const lines = m.lines ?? 1;
  return (
    <div style={{ ...common, maxWidth: pt(L.bubbleMax), minWidth: pt(88), width: 'fit-content', padding: `${pt(L.padTop)}px ${pt(10)}px ${pt(L.meta + L.padBottom)}px` }}>
      {tail}
      {name}
      {m.forwarded ? (
        <div style={{ height: pt(L.forwarded), display: 'flex', alignItems: 'center', gap: pt(4), fontSize: pt(12.5), fontStyle: rtl ? 'normal' : 'italic', color: CHAT.meta }}>
          <Ionicon name="arrow-redo" size={pt(13)} color={CHAT.meta} />
          {bi(CHAT_COPY.forwarded)}
        </div>
      ) : null}
      <div style={{ fontSize: pt(15), lineHeight: `${pt(L.line)}px`, height: pt(lines * L.line), color: CHAT.text, whiteSpace: lines === 1 ? 'nowrap' : 'pre-line', paddingInlineEnd: lines === 1 ? pt(48) : 0 }}>{m.text}</div>
      <Meta time={m.time} mine={mine} />
    </div>
  );
};

/**
 * A group's thread: the bar (back, avatar, name, who is in it), the bubbles
 * over the wall, the composer. `scroll` is how far down the content is, in
 * points (see `threadLayout`, `scrollTo`); `scrolling` (0 to 1) shows the
 * scroll thumb and the floating day chip, as a fast flick does. `highlight`
 * washes one message's row, the way a chat marks the message you jumped to.
 */
export const ChatThread: React.FC<{
  name: string;
  subtitle: string;
  avatar: ChatAvatar;
  messages: ChatMessage[];
  scroll: number;
  scrolling?: number;
  highlight?: { index: number; amount: number };
  /** Vertical motion blur on the bubbles, in points, for a flick too fast to read. */
  blur?: number;
}> = ({ name, subtitle, avatar, messages, scroll, scrolling = 0, highlight, blur = 0 }) => {
  const bi = useBi();
  const { dir, rtl } = useLang();
  const font = useChatFont();
  const blurId = `chatblur${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const layout = threadLayout(messages);
  const top = pt(L.top);
  const view = layout.viewport;
  // The day of the message at the top of the view, for the floating chip.
  let day = '';
  messages.forEach((m, i) => {
    if (m.kind === 'day' && layout.y[i] <= scroll + 30) day = m.label;
  });
  const thumbH = Math.max(40, (view / layout.total) * view);
  const thumbY = (Math.max(0, Math.min(1, scroll / Math.max(1, layout.total - view))) * (view - thumbH));
  return (
    <div dir={dir} style={{ position: 'absolute', inset: 0, width: SCREEN_W, height: SCREEN_H, background: CHAT.wall, backgroundImage: WALL, backgroundSize: `${pt(84)}px ${pt(84)}px`, fontFamily: font, overflow: 'hidden' }}>
      <Bar>
        <Ionicon name={rtl ? 'arrow-forward' : 'arrow-back'} size={pt(23)} color={CHAT.barText} />
        <AvatarDisc avatar={avatar} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: pt(17), fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
          <div style={{ fontSize: pt(12.5), color: CHAT.barMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>
        </div>
        <Ionicon name="videocam-outline" size={pt(23)} color={CHAT.barText} />
        <Ionicon name="call-outline" size={pt(20)} color={CHAT.barText} />
        <Ionicon name="ellipsis-vertical" size={pt(20)} color={CHAT.barText} />
      </Bar>
      <div style={{ position: 'absolute', left: 0, right: 0, top, height: pt(view), overflow: 'hidden' }}>
        {blur > 0.3 ? (
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <filter id={blurId} x="0" y="-5%" width="100%" height="110%">
              <feGaussianBlur stdDeviation={`0 ${pt(blur)}`} />
            </filter>
          </svg>
        ) : null}
        {/* The blur works on the view's box, not on the whole (very long) thread. */}
        <div style={{ position: 'absolute', inset: 0, filter: blur > 0.3 ? `url(#${blurId})` : undefined }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, translate: `0px ${-pt(scroll)}px` }}>
          {messages.map((m, i) => {
            const y = layout.y[i];
            // Only what can show is drawn.
            if (y + layout.h[i] < scroll - 20 || y > scroll + view + 20) return null;
            const first = !sameSender(messages[i - 1], m);
            const lit = highlight && highlight.index === i ? highlight.amount : 0;
            let body: React.ReactNode;
            if (m.kind === 'day') body = <DayChip label={m.label} style={{ paddingTop: pt(6) }} />;
            else if (m.kind === 'unread')
              body = (
                <div style={{ margin: `${pt(6)}px 0`, padding: `${pt(6)}px 0`, background: 'rgba(255,255,255,0.55)', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ padding: `${pt(3)}px ${pt(12)}px`, borderRadius: pt(8), background: '#fff', color: CHAT.accent, fontSize: pt(13), fontWeight: 700, letterSpacing: rtl ? 0 : 0.4, textTransform: 'uppercase' }}>{m.label}</div>
                </div>
              );
            else {
              const mine = !!m.mine;
              body = (
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: mine ? 'flex-end' : 'flex-start', padding: `0 ${pt(L.side + (mine ? 6 : 0))}px` }}>
                  {!mine ? (
                    <div style={{ width: pt(L.avatar), marginInlineEnd: pt(L.gap + 2), flexShrink: 0 }}>{first ? <AvatarDisc avatar={m.from.avatar} size={L.avatar} /> : null}</div>
                  ) : null}
                  <Bubble m={m} first={first} />
                </div>
              );
            }
            return (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: pt(y), height: pt(layout.h[i]) }}>
                {lit > 0 ? <div style={{ position: 'absolute', left: 0, right: 0, top: -pt(4), bottom: -pt(4), background: CHAT.highlight, opacity: lit }} /> : null}
                <div style={{ position: 'relative' }}>{body}</div>
              </div>
            );
          })}
        </div>
        </div>
        {/* The floating day chip and the scroll thumb, while the thread is flicked. */}
        {day && scrolling > 0 ? <DayChip label={day} style={{ position: 'absolute', left: 0, right: 0, top: pt(8), opacity: scrolling }} /> : null}
        {scrolling > 0 ? (
          <div style={{ position: 'absolute', insetInlineEnd: pt(3), top: pt(thumbY), width: pt(4), height: pt(thumbH), borderRadius: pt(2), background: 'rgba(0,0,0,0.3)', opacity: scrolling }} />
        ) : null}
      </div>
      {/* The composer: emoji, « Message », attach, camera; the round mic. */}
      <div style={{ position: 'absolute', left: pt(6), right: pt(6), bottom: pt(26), height: pt(48), display: 'flex', gap: pt(6), alignItems: 'center' }}>
        <div style={{ flex: 1, height: '100%', borderRadius: pt(24), background: '#fff', display: 'flex', alignItems: 'center', gap: pt(10), padding: `0 ${pt(14)}px`, boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
          <Ionicon name="happy-outline" size={pt(22)} color={CHAT.meta} />
          <div style={{ flex: 1, fontSize: pt(16), color: CHAT.meta }}>{bi(CHAT_COPY.placeholder)}</div>
          <Ionicon name="attach" size={pt(22)} color={CHAT.meta} />
          <Ionicon name="camera-outline" size={pt(22)} color={CHAT.meta} />
        </div>
        <div style={{ width: pt(48), height: pt(48), borderRadius: '50%', background: CHAT.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ionicon name="mic" size={pt(22)} color="#fff" />
        </div>
      </div>
    </div>
  );
};

/**
 * The chat app's banner on a lock screen: its icon, the group, who wrote what.
 * Drops in at `at`, like the MauriSchool one (<Notification>), so the two can
 * be told apart by their look alone.
 */
export const ChatPush: React.FC<{ title: string; message: string; at: number; count?: string; style?: React.CSSProperties }> = ({ title, message, at, count, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bi = useBi();
  const { dir } = useLang();
  const font = useChatFont();
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
        color: CHAT.text,
        opacity: Math.min(1, s * 1.6),
        translate: `0px ${(1 - s) * -pt(180)}px`,
        scale: String(0.9 + s * 0.1),
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: pt(8), marginBottom: pt(6) }}>
        <div style={{ width: pt(26), height: pt(26), borderRadius: pt(7), background: CHAT.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicon name="chatbubble" size={pt(15)} color="#fff" />
        </div>
        <span style={{ flex: 1, fontSize: pt(13), fontWeight: 500, color: CHAT.sub }}>{bi(CHAT_COPY.conversations)}</span>
        {count ? <span style={{ fontSize: pt(12), color: CHAT.sub }}>{count}</span> : null}
      </div>
      <div style={{ fontSize: pt(15), fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: pt(14), lineHeight: 1.4, marginTop: pt(3), color: '#374151' }}>{message}</div>
    </div>
  );
};
