import type { Bi } from '../lang';

/**
 * « La chèvre a encore frappé »: the series, its words and its running score.
 *
 * In every episode the goat eats one school paper; it is already in
 * MauriSchool, and she fails to eat the phone. A football score counts her
 * defeats from one episode to the next. These words are the series' own, the
 * same in every episode: an episode's copy.ts never repeats them.
 *
 * The Arabic lines are placeholders in standard Arabic, to be rewritten in
 * Hassaniya by someone who speaks it. French puts a no-break space (U+00A0)
 * before « ? », « ! » and « : ». *Starred* words take the headline's accent.
 */
export const SERIES = {
  name: { fr: 'La chèvre a encore frappé', ar: 'العنز ضربت من جديد' } as Bi,
  /** The episode label: « ÉP. 2 ». */
  label: (n: number): Bi => ({ fr: `Ép. ${n}`, ar: `الحلقة ${n}` }),
  /** The message, every episode's end line, on two lines: the paper, then the app. */
  end: [
    { fr: 'La chèvre mange le papier.', ar: 'العنز تأكل الورق.' },
    { fr: '*Pas l’appli.*', ar: '*لا التطبيق.*' },
  ] as [Bi, Bi],
  /** Over the replay of the theft, every episode. */
  // A no-break space holds « la preuve » together: the line breaks before it.
  catchphrase: { fr: 'La chèvre a mangé *la preuve*.', ar: 'والعنز أكلت *الورقة*.' } as Bi,
  /** The sports replay's band. */
  replay: { fr: 'Ralenti', ar: 'إعادة' } as Bi,
  /** The two sides of the score, at full size. */
  goat: { fr: 'Chèvre', ar: 'العنز' } as Bi,
  /** On the end card and in every post's caption. No accent: it types as it reads. */
  hashtag: { fr: '#LaChevreAEncoreFrappe', ar: '#العنز_ضربت_من_جديد' } as Bi,
};

/** One episode's place in the series. `score` is after the episode: [goat, MauriSchool]. */
export type EpisodeInfo = { number: number; title: Bi; score: [number, number] };

/**
 * Every episode so far, in order. The score bug starts from the previous
 * episode's score and ticks to this one's when the goat fails.
 */
export const EPISODES: Record<number, EpisodeInfo> = {
  1: { number: 1, title: { fr: 'Le reçu', ar: 'الوصل' }, score: [0, 1] },
  2: { number: 2, title: { fr: 'La copie', ar: 'ورقة الامتحان' }, score: [0, 2] },
};

/** The score before an episode: the one before it, or nil-nil. */
export const scoreBefore = (n: number): [number, number] => EPISODES[n - 1]?.score ?? [0, 0];
