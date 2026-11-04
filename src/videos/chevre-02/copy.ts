import type { Bi } from '../../shared/lang';
import type { TestWords } from '../../shared/ui/paper';

/**
 * Everything ép. 2 « La copie » says in its own voice. The series' words (its
 * name, « La chèvre a mangé la preuve. », the end line, the hashtag) are in
 * shared/chevre/series.ts; app wording is in shared/appCopy.ts.
 *
 * Nobody lies: Sidi really had 17, and Papa is proud of him. The only one who
 * loses is the goat.
 *
 * The Arabic lines are placeholders in standard Arabic, to be rewritten in
 * Hassaniya: keep them here, in one place. A grade is درجة in the video's own
 * words (the app's notification says نقطة: the phone stays verbatim).
 * French puts a no-break space (U+00A0) before « ? », « ! » and « : ».
 * *Starred* words take the headline's accent.
 */
export const COPY = {
  /** On the cover and the hook. */
  hook: { fr: 'Sidi a eu *17*.', ar: 'سيدي حصل على *17*.' } as Bi,
  /** Sidi's fear, over his face. */
  never: { fr: 'Papa ne le saura jamais.', ar: 'بابا لن يعرف أبدًا.' } as Bi,
  /** Papa's phone, the same minute. */
  already: { fr: 'Papa le sait *déjà*.', ar: 'بابا عرف *من قبل*.' } as Bi,
  /** The question for the comments, on the end card: she has no name yet. */
  ask: { fr: 'Elle n’a pas encore de nom. Proposez-en un !', ar: 'ما عندها اسم بعد. اقترحوا لها اسمًا!' } as Bi,
};

/** The test paper, in each cut's language: the name and heading in ballpoint, the teacher's red mark. */
export const TEST_WORDS: Record<'fr' | 'ar', TestWords> = {
  fr: {
    name: 'Sidi Ould Mocktar',
    heading: 'Devoir de mathématiques',
    mark: '17/20',
    praise: 'Très bien !',
    work: ['Exercice 1', '2x + 3 = 11', 'x = 4', 'Exercice 2', '3 × 12 = 36'],
  },
  ar: {
    name: 'سيدي ولد المختار',
    heading: 'فرض في الرياضيات',
    mark: '17/20',
    praise: 'حسن جدًا!',
    work: ['التمرين 1', '2x + 3 = 11', 'x = 4', 'التمرين 2', '3 × 12 = 36'],
  },
};

/** Suggested caption for the post (not in the video). */
export const CAPTION: Bi = {
  fr: 'Ép. 2 — La copie. Sidi a eu 17… la chèvre aussi 🐐 Elle n’a pas encore de nom : proposez-en un en commentaire ! #LaChevreAEncoreFrappe #MauriSchool #Mauritanie',
  ar: 'الحلقة 2 — ورقة الامتحان 🐐 ما عندها اسم بعد: اقترحوا لها اسمًا في التعليقات! #العنز_ضربت_من_جديد #MauriSchool #موريتانيا',
};
