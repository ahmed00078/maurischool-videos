import { BRAND_LINE } from '../../shared/brand';
import type { Bi } from '../../shared/lang';

/**
 * Everything « La chèvre et le reçu » says in its own voice. App wording lives
 * in shared/appCopy.ts (verbatim from the app); this is the video's copy.
 *
 * Nobody lies here: the father really paid, the accountant asks for the
 * receipt because it is her job, and the only culprit is the goat.
 *
 * The Arabic lines are placeholders in standard Arabic, to be rewritten in
 * Hassaniya by someone who speaks it: keep them here, in one place. For
 * "receipt" the video says الوصل (the notification's word and the everyday
 * one); the phone shows whatever the app says (الإيصال on its button).
 *
 * French puts a no-break space (U+00A0) before "?", "!" and ":" and inside
 * « », so the mark never wraps onto a line of its own. *Starred* words take
 * the headline's accent.
 */
export const COPY = {
  /** On the goat's stare, the first frame: the cover. */
  hook: { fr: 'Papa a payé.', ar: 'بابا دفع.' } as Bi,
  hook2: { fr: 'La chèvre a mangé *la preuve*.', ar: 'والعنز أكلت *الوصل*.' } as Bi,
  later: { fr: 'Un mois plus tard…', ar: 'بعد شهر…' } as Bi,
  /** The accountant, politely. */
  askReceipt: { fr: 'Vous avez le reçu ?', ar: 'عندك الوصل؟' } as Bi,
  /** The father, and it is true. */
  paid: { fr: 'J’ai déjà payé !', ar: 'دفعتُ من قبل!' } as Bi,
  /** The office stamp over the counter: not a verdict on him, a count of what he can show. */
  stamp: { fr: 'Preuve : 0', ar: 'الإثبات: 0' } as Bi,
  rewind: { fr: 'Même jour. *Avec MauriSchool.*', ar: 'نفس اليوم. *مع MauriSchool.*' } as Bi,
  auto: { fr: 'Le reçu arrive *tout seul*.', ar: 'الوصل يصلك *وحده*.' } as Bi,
  end: { fr: 'Le reçu *ne se perd plus*.', ar: 'الوصل *لا يضيع* بعد اليوم.' } as Bi,
  brand: BRAND_LINE,
  /** The question for the comments, on the end card. */
  ask: { fr: 'Et chez vous, la chèvre a mangé quoi ?', ar: 'وعندكم، ماذا أكلت العنز؟' } as Bi,
  /** Optional caption bar, not used in the cut: kept for a variant. */
  tag: { fr: 'Identifie celui qui perd toujours ses reçus.', ar: 'أشِر إلى من يُضيّع وصولاته دائمًا.' } as Bi,
  /** The nameplate on the counter. */
  desk: { fr: 'Caisse', ar: 'الصندوق' } as Bi,
  /** The wall calendar: a month after the payment, then the day itself. */
  months: { later: { fr: 'NOV.', ar: 'نوفمبر' } as Bi, payday: { fr: 'OCT.', ar: 'أكتوبر' } as Bi },
};

/** Suggested caption for the post (not in the video). */
export const CAPTION: Bi = {
  fr: 'Et chez vous, la chèvre a mangé quoi ? 🐐 #MauriSchool #Mauritanie #école',
  ar: 'وعندكم، ماذا أكلت العنز؟ 🐐 #MauriSchool #موريتانيا',
};
