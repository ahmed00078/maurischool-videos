import type { Bi } from '../../shared/lang';

/**
 * Everything the video says in its own voice. App wording lives in
 * shared/appCopy.ts (verbatim from the app); this is the video's copy.
 *
 * It talks to one viewer ("tu" in French), asks for one thing (the name of
 * their first teacher, in the comments) and promises one thing back (the
 * names written on the board in the next video: see Names.tsx).
 *
 * Board lines are split where the chalk breaks them. In a headline, *stars*
 * mark the words painted in the accent colour. French puts a no-break space
 * before "?" and ":" so the mark never wraps onto its own line.
 */
export const COPY = {
  board: {
    /** The date a teacher writes at the top of the board: World Teachers' Day 2026 is a Monday. */
    date: { fr: 'Lundi 5 octobre 2026', ar: 'الاثنين 5 أكتوبر 2026' } as Bi,
    /** Already on the board on the first frame, and written back on the last one, so the video loops. */
    question: {
      fr: ['Ton premier prof,', 'tu te souviens', 'de son nom ?'],
      ar: ['معلّمك الأول…', 'هل تتذكّر اسمه؟'],
    } as Bi<string[]>,
    /**
     * The ask and the promise, chalked under the question in the first seconds.
     * Tagging the teacher (« identifier » on Facebook, الإشارة in Arabic) tells
     * them, and their friends see the video: it travels further than a name.
     */
    promise: {
      fr: ['Identifie-le ou écris son nom :', 'demain, on l’écrit au tableau.'],
      ar: ['أشِر إليه أو اكتب اسمه:', 'غدًا نكتبه على السبّورة.'],
    } as Bi<string[]>,
    /** An example answer, so the viewer sees what to write; the same form as the names in part 2 (Names.tsx). */
    example: { fr: 'Ex. : Mme Fatimetou, 1re année, 1998', ar: 'مثلًا: الأستاذة فاطمتو، السنة الأولى، 1998' } as Bi,
  },
  /** UNESCO's World Teachers' Day, every 5 October since 1994. */
  day: {
    date: { fr: '5 octobre', ar: '5 أكتوبر' } as Bi,
    name: { fr: 'Journée mondiale des enseignants', ar: 'اليوم العالمي للمعلّمين' } as Bi,
  },
  night: {
    taught: { fr: 'Ils t’ont appris *à lire*.', ar: 'علّموك *القراءة*.' } as Bi,
    still: { fr: 'Ce soir, ils corrigent *encore*.', ar: 'والليلة… ما زالوا *يصحّحون*.' } as Bi,
    /** The pile the lamp is on: one class, as many copies as pupils on the register (shared/demo.ts). */
    copies: { fr: 'copies', ar: 'ورقة' } as Bi,
  },
  register: {
    /** App role names, from the "roles" block of mobile_app/src/i18n/{fr,ar}/auth.json. */
    chip: { fr: 'Enseignant', ar: 'المعلم' } as Bi,
    lighten: { fr: 'Alors, on leur a *simplifié le reste*.', ar: 'لذلك… *بسّطنا لهم الباقي*.' } as Bi,
    oneTap: { fr: 'L’appel : *un geste*. Même sans réseau.', ar: 'الحضور: *لمسة واحدة*. حتى بدون شبكة.' } as Bi,
  },
  thanks: {
    merci: { fr: 'Merci', ar: 'شكرًا' } as Bi,
    all: { fr: 'à tous les enseignants.', ar: 'لكلّ المعلّمين والمعلّمات.' } as Bi,
    /** The video as a gift: what makes it travel from phone to phone on 5 October. */
    forward: {
      fr: ['Tu connais un enseignant ?', 'Envoie-lui cette vidéo.'],
      ar: ['تعرف معلّمًا؟', 'أرسل له هذا الفيديو.'],
    } as Bi<string[]>,
    /** The ask from the first seconds, asked again. */
    comment: {
      fr: ['Identifie-le ou écris son nom.', 'Demain, on l’écrit au tableau.'],
      ar: ['أشِر إليه أو اكتب اسمه.', 'غدًا نكتبه على السبّورة.'],
    } as Bi<string[]>,
  },
  /** Part 2, the day after: the names from the comments, in chalk. */
  names: {
    /** The day after World Teachers' Day. */
    date: { fr: 'Mardi 6 octobre 2026', ar: 'الثلاثاء 6 أكتوبر 2026' } as Bi,
    title: { fr: 'Vos premiers profs', ar: 'معلّموكم الأوائل' } as Bi,
    thanks: { fr: 'Merci à eux.', ar: 'شكرًا لهم.' } as Bi,
    more: { fr: 'Le tien n’y est pas ? Écris son nom.', ar: 'معلّمك ليس هنا؟ اكتب اسمه.' } as Bi,
  },
};
