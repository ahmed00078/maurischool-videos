import { BRAND_LINE } from '../../shared/brand';
import type { Bi } from '../../shared/lang';
import type { EpisodeCopy } from '../../shared/verite/stage';

/**
 * Everything episode 3 says in its own voice. App wording lives in
 * shared/appCopy.ts (verbatim from the app); this is the video's copy.
 *
 * The format flips: the claim that does not hold hides good news. Zahra says
 * 11, sadly; her report card says 17.50 (the grades screen prints 17.5: an
 * average with a second decimal, like 17.25, would read 17.3 there). The
 * stamps judge what was said (true / false), never the person.
 *
 * The spoken lines are placeholders in standard Arabic: they are meant to be
 * rewritten in Hassaniya by someone who speaks it. In Arabic a grade is درجة;
 * an average is معدّل.
 *
 * French puts a no-break space before "?", "!" and ":" so the mark never wraps alone.
 */
export const COPY = {
  series: { fr: 'Qui ne dit pas la vérité ?', ar: 'من لا يقول الحقيقة؟' } as Bi,
  episode: { fr: 'Épisode 3', ar: 'الحلقة 3' } as Bi,
  /** One tag per language for the whole series, no accent so it types as it reads. */
  hashtag: { fr: '#QuiNeDitPasLaVerite', ar: '#من_لا_يقول_الحقيقة' } as Bi,
  hook: {
    /** On the first frame, over the lineup: the cover. */
    title: { fr: 'Qui ne dit pas *la vérité ?*', ar: 'من لا يقول *الحقيقة؟*' } as Bi,
    rule: { fr: 'Deux disent vrai. Un seul, non.', ar: 'اثنان صادقان، وواحد لا.' } as Bi,
  },
  /**
   * The three claims, one per suspect. Zahra's is said sadly. The father's
   * matches the receipt in the inbox: paid at the desk this afternoon.
   */
  claims: {
    son: { fr: 'Ma moyenne ? 12.', ar: 'معدّلي؟ 12.' } as Bi,
    daughter: { fr: 'Moi… 11 de moyenne.', ar: 'أنا… معدّلي 11.' } as Bi,
    father: { fr: 'Le 2e trimestre ? Payé cet après-midi.', ar: 'الفصل الثاني؟ دفعته بعد الظهر.' } as Bi,
  },
  vote: {
    ask: { fr: 'Ton vote en commentaire :', ar: 'صوّت في التعليقات:' } as Bi,
    options: { fr: '1, 2 ou 3 ?', ar: '1 أو 2 أو 3؟' } as Bi,
  },
  check: {
    title: { fr: 'Maman *vérifie*.', ar: 'الأم *تتحقّق*.' } as Bi,
  },
  /** Stamped on the placards: a verdict on what was said. BRAVO lands over Zahra's FAUX; the last one is the father's. */
  verdict: {
    true: { fr: 'Vrai', ar: 'صحيح' } as Bi,
    false: { fr: 'Faux', ar: 'خطأ' } as Bi,
    bravo: { fr: 'Bravo', ar: 'أحسنتِ' } as Bi,
    unverifiable: { fr: 'Invérifiable', ar: 'لا يمكن التحقّق' } as Bi,
  },
  busted: {
    who: { fr: 'C’était *Zahra*…', ar: 'إنها *زهرة*…' } as Bi,
    /** Why: a surprise, not a secret. */
    trick: { fr: 'Elle avait 17,5. Elle voulait vous faire la surprise.', ar: 'معدّلها 17.5. أرادت أن تفاجئكم.' } as Bi,
    /** The clue from the first frame: the honour-roll rosette behind her placard. */
    seen: { fr: 'Tu avais vu le ruban ?', ar: 'هل رأيت الشريط؟' } as Bi,
  },
  outro: {
    /** The question for the comments. */
    tag: { fr: 'Et toi, ta moyenne du 1er trimestre ?', ar: 'وأنت، كم معدّلك في الفصل الأول؟' } as Bi,
    /** The series' brand line, shared with every MauriSchool video. */
    brand: BRAND_LINE,
  },
} satisfies EpisodeCopy;

/**
 * The last gag (the `tease` cut): once the family has cheered, the father
 * remembers his own grades. Nobody can check them, so the stamp says just
 * that: it teases him without saying he is wrong. The ask follows him.
 */
export const TEASE = {
  line: { fr: 'Moi, à ton âge, j’avais 18 de moyenne.', ar: 'أنا في عمرك كان معدّلي 18.' } as Bi,
  tag: { fr: 'Tague un papa qui avait 18 à son âge.', ar: 'اذكر في التعليقات أبًا كان معدّله 18 في عمره.' } as Bi,
};
