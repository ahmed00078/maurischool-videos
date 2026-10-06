import { BRAND_LINE } from '../../shared/brand';
import type { Bi } from '../../shared/lang';
import type { EpisodeCopy } from '../../shared/verite/stage';

/**
 * Everything episode 2 says in its own voice. App wording lives in
 * shared/appCopy.ts (verbatim from the app); this is the video's copy.
 *
 * The trap: after episode 1 everyone suspects Sidi. This time he tells the
 * truth, and the one who does not is Zahra, the good student. The stamps judge
 * what was said (true / false), never the person.
 *
 * The spoken lines are placeholders in standard Arabic: they are meant to be
 * rewritten in Hassaniya by someone who speaks it. In Arabic a grade is درجة.
 *
 * French puts a no-break space before "?", "!" and ":" so the mark never wraps alone.
 */
export const COPY = {
  series: { fr: 'Qui ne dit pas la vérité ?', ar: 'من لا يقول الحقيقة؟' } as Bi,
  episode: { fr: 'Épisode 2', ar: 'الحلقة 2' } as Bi,
  /** One tag per language for the whole series, no accent so it types as it reads. */
  hashtag: { fr: '#QuiNeDitPasLaVerite', ar: '#من_لا_يقول_الحقيقة' } as Bi,
  hook: {
    /** On the first frame, over the lineup: the cover. */
    title: { fr: 'Qui ne dit pas *la vérité ?*', ar: 'من لا يقول *الحقيقة؟*' } as Bi,
    rule: { fr: 'Deux disent vrai. Un seul, non.', ar: 'اثنان صادقان، وواحد لا.' } as Bi,
  },
  /** The three claims, one per suspect. The father's matches the reminder: due on the 5th, so the 5th is still in time. */
  claims: {
    son: { fr: 'Aujourd’hui, j’ai eu 16 en français !', ar: 'أخذت اليوم 16 في الفرنسية!' } as Bi,
    daughter: { fr: 'Je suis restée à l’école toute la journée.', ar: 'بقيت في المدرسة طوال اليوم.' } as Bi,
    father: { fr: 'Novembre ? À payer le 5 au plus tard.', ar: 'شهر نوفمبر؟ آخر أجل للدفع يوم 5.' } as Bi,
  },
  vote: {
    ask: { fr: 'Ton vote en commentaire :', ar: 'صوّت في التعليقات:' } as Bi,
    options: { fr: '1, 2 ou 3 ?', ar: '1 أو 2 أو 3؟' } as Bi,
  },
  check: {
    title: { fr: 'Maman *vérifie*.', ar: 'الأم *تتحقّق*.' } as Bi,
  },
  /** Stamped on the placards: a verdict on what was said. */
  verdict: {
    true: { fr: 'Vrai', ar: 'صحيح' } as Bi,
    false: { fr: 'Faux', ar: 'خطأ' } as Bi,
  },
  busted: {
    who: { fr: 'C’était *Zahra*.', ar: 'إنها *زهرة*!' } as Bi,
    /** Where she was instead: a wedding, not a secret. */
    trick: { fr: 'Le henné… c’était le mariage de sa cousine.', ar: 'الحنّاء… كانت لعرس ابنة عمّها.' } as Bi,
    /** The clue from the first frame: her hands on the placard. */
    seen: { fr: 'Tu avais vu ses mains ?', ar: 'هل رأيت يديها؟' } as Bi,
  },
  outro: {
    /** The question for the comments. */
    tag: { fr: 'Et toi, tu as déjà raté l’école pour un mariage ?', ar: 'وأنت، هل غبت يومًا عن المدرسة من أجل عرس؟' } as Bi,
    /** The series' brand line, shared with every MauriSchool video. */
    brand: BRAND_LINE,
  },
} satisfies EpisodeCopy;
