import { BRAND_LINE } from '../../shared/brand';
import type { Bi } from '../../shared/lang';

/**
 * Everything the episode says in its own voice. App wording lives in
 * shared/appCopy.ts (verbatim from the app); this is the video's copy.
 *
 * The tone is gentle on purpose: the parents watching are in the lineup too,
 * so the video asks who "does not tell the truth" and stamps what was said
 * (true / false), never the person.
 *
 * The spoken lines are placeholders in standard Arabic: they are meant to be
 * rewritten in Hassaniya by someone who speaks it. In Arabic a grade is درجة.
 *
 * French puts a no-break space before "?", "!" and ":" so the mark never wraps alone.
 */
export const COPY = {
  series: { fr: 'Qui ne dit pas la vérité ?', ar: 'من لا يقول الحقيقة؟' } as Bi,
  episode: { fr: 'Épisode 1', ar: 'الحلقة 1' } as Bi,
  /** One tag per language for the whole series, no accent so it types as it reads. */
  hashtag: { fr: '#QuiNeDitPasLaVerite', ar: '#من_لا_يقول_الحقيقة' } as Bi,
  hook: {
    /** On the first frame, over the lineup: the cover. */
    title: { fr: 'Qui ne dit pas *la vérité ?*', ar: 'من لا يقول *الحقيقة؟*' } as Bi,
    rule: { fr: 'Deux disent vrai. Un seul, non.', ar: 'اثنان صادقان، وواحد لا.' } as Bi,
  },
  /** The three claims, one per suspect. */
  claims: {
    son: { fr: 'J’ai eu 17,5 en maths !', ar: 'أخذت 17.5 في الرياضيات!' } as Bi,
    daughter: { fr: '20 sur 20 en arabe.', ar: '20 على 20 في العربية.' } as Bi,
    father: { fr: 'La scolarité ? C’est payé.', ar: 'رسوم الدراسة؟ دفعتها.' } as Bi,
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
    who: { fr: 'C’était *Sidi*.', ar: 'إنه *سيدي*!' } as Bi,
    /** 7.5 became 17.5: the whole lie is one digit. */
    trick: { fr: '7,5… il a juste ajouté un 1.', ar: '7.5… أضاف فقط رقم 1.' } as Bi,
    seen: { fr: 'Tu avais vu sa copie ?', ar: 'هل رأيت ورقته؟' } as Bi,
    /** On the test paper in his pocket, in the teacher's red: the clue from the first frame. */
    paper: { fr: '7,5', ar: '7.5' } as Bi,
  },
  outro: {
    tag: { fr: 'Tague quelqu’un qui ajoutait un 1 à ses notes.', ar: 'أشِر إلى من كان يضيف 1 إلى درجاته.' } as Bi,
    /** The series' brand line, shared with every MauriSchool video. */
    brand: BRAND_LINE,
  },
};
