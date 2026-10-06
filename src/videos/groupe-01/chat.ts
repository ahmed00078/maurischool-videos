import { fill } from '../../shared/appCopy';
import { CLASS_ANNOUNCEMENT } from '../../shared/demo';
import type { Bi, Lang } from '../../shared/lang';
import { ChatAvatar, ChatListItem, ChatMessage, ChatSender } from '../../shared/ui/chat';
import { GROUP } from './copy';

/**
 * The parents' group as data: who writes, and the two views of its thread the
 * video scrolls through. On Tuesday night Papa opens it on its first unread
 * message and flicks down through the day (`floodThread`); on Thursday morning
 * he opens it at the bottom and flicks back up to Tuesday (`thursdayThread`).
 * The director's message is the same text as the MauriSchool announcement.
 */

type Who = keyof typeof GROUP.people;

const COLORS: Record<Who, string> = {
  mariem: '#d4507a',
  ahmedou: '#2f7fd1',
  yahya: '#159a80',
  moussa: '#e07b1f',
  zeinabou: '#8e44ad',
  oumar: '#c0392b',
  aminetou: '#c2632a',
  director: '#1f5fae',
};

/** Avatars: the initial of the child (or « D » for the director), in each script. */
const INITIALS: Record<Who, Bi> = {
  mariem: { fr: 'M', ar: 'م' },
  ahmedou: { fr: 'A', ar: 'أ' },
  yahya: { fr: 'Y', ar: 'ي' },
  moussa: { fr: 'M', ar: 'م' },
  zeinabou: { fr: 'Z', ar: 'ز' },
  oumar: { fr: 'O', ar: 'ع' },
  aminetou: { fr: 'A', ar: 'أ' },
  director: { fr: 'D', ar: 'م' },
};

export const GROUP_AVATAR: ChatAvatar = { color: '#f2a23a', glyph: '🎒' };

const sender = (who: Who, lang: Lang): ChatSender => ({
  name: GROUP.people[who][lang],
  color: COLORS[who],
  avatar: { color: COLORS[who], glyph: INITIALS[who][lang] },
});

/**
 * How many lines a text bubble takes, from its length: the bubble is 280 pt
 * at most, about 30 characters of Roboto or 34 of Noto Sans Arabic at 15 pt.
 * Cautious on purpose: a line too many is air, a line too few spills.
 */
const linesFor = (text: string, lang: Lang) =>
  text
    .split('\n')
    .reduce((n, part) => n + Math.max(1, Math.ceil([...part].length / (lang === 'ar' ? 32 : 29))), 0);

/** The director's message in the group: the announcement's title and body, as he typed them there. */
export const directorText = (lang: Lang) => `${CLASS_ANNOUNCEMENT.title[lang]}.\n${CLASS_ANNOUNCEMENT.body[lang]}`;

const builder = (lang: Lang) => {
  const s = GROUP.says;
  const text = (who: Who, t: Bi | string, time: string, extra: Partial<Extract<ChatMessage, { kind: 'text' }>> = {}): ChatMessage => {
    const str = typeof t === 'string' ? t : t[lang];
    return { kind: 'text', from: sender(who, lang), text: str, time, lines: linesFor(str, lang), ...extra };
  };
  const voice = (who: Who, duration: string, time: string): ChatMessage => ({ kind: 'voice', from: sender(who, lang), duration, time });
  const image = (who: Who, art: 'flowers' | 'evening' | 'morning', caption: Bi, time: string): ChatMessage => ({ kind: 'image', from: sender(who, lang), art, caption: caption[lang], time });
  const sticker = (who: Who, time: string): ChatMessage => ({ kind: 'sticker', from: sender(who, lang), time });
  const day = (label: Bi): ChatMessage => ({ kind: 'day', label: label[lang] });
  const amens = (whos: Who[], from: number, hour: string): ChatMessage[] => whos.map((w, i) => text(w, s.amine, `${hour}:${String(from + i).padStart(2, '0')}`));
  return { text, voice, image, sticker, day, amens };
};

/** Tuesday, from the morning to the director's message: what sinks it. */
const tuesdayMorning = (lang: Lang): ChatMessage[] => {
  const { text, voice, image, sticker, amens } = builder(lang);
  const s = GROUP.says;
  return [
    image('mariem', 'flowers', s.hello, '07:02'),
    voice('ahmedou', '0:47', '07:05'),
    voice('yahya', '2:13', '07:09'),
    text('zeinabou', s.prayer, '07:20'),
    ...amens(['mariem', 'moussa', 'oumar', 'aminetou', 'yahya'], 21, '07'),
    text('moussa', s.chain, '08:10', { forwarded: true }),
    sticker('ahmedou', '08:12'),
    text('mariem', s.jumper, '12:10'),
    voice('oumar', '1:05', '12:12'),
    text('aminetou', s.bus, '13:02'),
    voice('ahmedou', '0:32', '13:05'),
    text('yahya', s.thanks, '13:06'),
    image('zeinabou', 'flowers', s.hello, '15:40'),
    ...amens(['oumar', 'ahmedou'], 44, '15'),
    voice('moussa', '3:21', '16:30'),
  ];
};

/** The director's message, 18:04. */
const director = (lang: Lang): ChatMessage => {
  const t = directorText(lang);
  return { kind: 'text', from: sender('director', lang), text: t, time: CLASS_ANNOUNCEMENT.time, lines: linesFor(t, lang) };
};

/** Tuesday evening, after it: the picture, the sticker, the « Amine », the 4:58 voice note, and on. */
const tuesdayEvening = (lang: Lang, filler: number): ChatMessage[] => {
  const { text, voice, image, sticker, amens } = builder(lang);
  const s = GROUP.says;
  const out: ChatMessage[] = [
    image('zeinabou', 'evening', s.evening, '18:05'),
    sticker('moussa', '18:06'),
    ...amens(['oumar', 'mariem', 'ahmedou'], 7, '18'),
    voice('yahya', '4:58', '18:20'),
    text('mariem', s.found, '19:02'),
  ];
  // And on into the night: voice notes, thanks, « Amine », pictures.
  const who: Who[] = ['aminetou', 'moussa', 'yahya', 'oumar', 'zeinabou', 'ahmedou', 'mariem'];
  for (let i = 0; i < filler; i++) {
    const w = who[i % who.length];
    const m = 10 + Math.floor((i * 97) / Math.max(1, filler));
    const time = `${String(19 + Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const k = i % 6;
    out.push(k === 0 ? voice(w, `${1 + (i % 4)}:${String(10 + ((i * 13) % 50)).padStart(2, '0')}`, time) : k === 1 ? text(w, s.amine, time) : k === 2 ? text(w, s.thanks, time) : k === 3 ? image(w, i % 2 ? 'evening' : 'flowers', s.evening, time) : k === 4 ? text(w, s.amine, time) : sticker(w, time));
  }
  return out;
};

export type Thread = { messages: ChatMessage[]; director: number };

/** Tuesday night: the thread opened on its first unread message, 312 of them. */
export const floodThread = (lang: Lang): Thread => {
  const { day } = builder(lang);
  const head: ChatMessage[] = [day(GROUP.days.today), { kind: 'unread', label: fill(GROUP.unread[lang], { count: 312 }) }, ...tuesdayMorning(lang)];
  const messages = [...head, director(lang), ...tuesdayEvening(lang, 44)];
  return { messages, director: head.length };
};

/**
 * Thursday morning: Tuesday (the director's message), all of Wednesday, and
 * this morning's hellos, opened at the bottom. With `gag`, a parent asks on
 * Wednesday night whether there is a test on Thursday.
 */
export const thursdayThread = (lang: Lang, gag = false): Thread => {
  const { text, voice, image, sticker, day, amens } = builder(lang);
  const s = GROUP.says;
  const before: ChatMessage[] = [day(GROUP.days.tuesday), ...tuesdayMorning(lang).slice(-6)];
  const wednesday: ChatMessage[] = [
    ...tuesdayEvening(lang, 6),
    day(GROUP.days.wednesday),
    image('mariem', 'morning', s.hello, '06:55'),
    voice('ahmedou', '1:12', '07:03'),
    ...amens(['yahya', 'oumar', 'moussa'], 10, '07'),
    text('aminetou', s.bus, '09:30'),
    voice('zeinabou', '2:40', '12:02'),
    sticker('moussa', '12:05'),
    text('yahya', s.thanks, '17:48'),
    ...(gag ? [text('oumar', s.gag, '21:58')] : []),
    ...amens(['mariem', 'ahmedou'], 12, '22'),
    day(GROUP.days.today),
    image('zeinabou', 'morning', s.helloThursday, '06:40'),
    ...amens(['mariem', 'aminetou', 'oumar'], 41, '06'),
    voice('moussa', '0:58', '06:52'),
  ];
  const messages = [...before, director(lang), ...wednesday];
  return { messages, director: before.length };
};

/** Papa's conversations: the group first, its badge and its last message given by the scene. */
export const chatList = (lang: Lang, unread: number, preview: string, time = '21:47'): ChatListItem[] => [
  { name: GROUP.name[lang], avatar: GROUP_AVATAR, preview, time, unread },
  ...GROUP.others.map((o) => ({ name: o.name[lang], avatar: { color: o.color, glyph: o.glyph }, preview: o.preview[lang], time: o.time, unread: o.unread, mine: o.mine })),
];

/** The group's last message as the list shows it, changing as they arrive: « Maman de Mariem : Amine 🤲 ». */
export const listPreview = (lang: Lang, n: number) => {
  const ppl: Who[] = ['mariem', 'moussa', 'yahya', 'oumar', 'zeinabou', 'ahmedou', 'aminetou'];
  const w = GROUP.people[ppl[n % ppl.length]][lang];
  const kinds: Bi[] = [GROUP.says.amine, { fr: '🎤 0:47', ar: '🎤 0:47' }, GROUP.says.amine, { fr: '📷 Photo', ar: '📷 صورة' }, GROUP.says.thanks];
  return `${w}${lang === 'fr' ? ' : ' : ': '}${kinds[n % kinds.length][lang]}`;
};
