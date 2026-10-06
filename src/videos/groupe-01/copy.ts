import { BRAND_LINE } from '../../shared/brand';
import type { Bi } from '../../shared/lang';

/**
 * Everything « Le groupe des parents » says in its own voice, and everything
 * the parents write in their group. App wording lives in shared/appCopy.ts
 * (verbatim from the app); the announcement is data (shared/demo.ts).
 *
 * Nobody is at fault here: the director did post the message, and the parents
 * are kind people wishing each other a good day. The joke is the volume.
 *
 * The Arabic lines are placeholders in standard Arabic, to be rewritten in
 * Hassaniya by someone who speaks it, the group's messages included (parents
 * write to each other in Hassaniya): keep them here, in one place.
 *
 * French puts a no-break space (U+00A0) before "?", "!" and ":" and inside
 * « », so the mark never wraps onto a line of its own. *Starred* words take
 * the headline's accent. « La compo » is what Mauritanian schools call a test.
 */
export const COPY = {
  /** Over the found clip that opens the video: the container, the boxes falling. */
  open: { fr: 'Quand tu ouvres *le groupe des parents*…', ar: 'عندما تفتح *مجموعة الأولياء*…' } as Bi,
  /** The hook, the cover: the number counts with the badge. */
  hook: { fr: '{count} messages non lus.', ar: '{count} رسالة غير مقروءة.' } as Bi,
  lost: { fr: 'Le message important est là.', ar: 'الرسالة المهمة هنا.' } as Bi,
  /** Lands as the director's message flies past. */
  lost2: { fr: '*Quelque part.*', ar: '*في مكان ما.*' } as Bi,
  /** Sidi in the doorway, Thursday morning. */
  sidi: { fr: 'Papa… c’est la compo aujourd’hui ?!', ar: 'بابا… الامتحان اليوم؟!' } as Bi,
  late: { fr: 'Lu *jeudi*.', ar: 'قُرئت *الخميس*.' } as Bi,
  rewind: { fr: 'Mardi. *Avec MauriSchool.*', ar: 'الثلاثاء. *مع MauriSchool.*' } as Bi,
  one: { fr: 'Un seul message. *À toute la classe.*', ar: 'رسالة واحدة. *لكل القسم.*' } as Bi,
  sameDay: { fr: 'Il le voit *le jour même*.', ar: 'يراها *في نفس اليوم*.' } as Bi,
  wait: { fr: 'Le groupe peut *attendre*.', ar: 'المجموعة يمكنها *الانتظار*.' } as Bi,
  end: { fr: 'L’école vous parle. *Directement.*', ar: 'المدرسة تكلّمكم. *مباشرة.*' } as Bi,
  brand: BRAND_LINE,
  /** The question for the comments, on the end card. */
  ask: { fr: 'Combien de messages non lus dans ton groupe ?', ar: 'كم رسالة غير مقروءة في مجموعتك؟' } as Bi,
  /** Where and when we are: a small pill over the picture. */
  tags: {
    tuesdayNight: { fr: 'Mardi soir', ar: 'مساء الثلاثاء' } as Bi,
    thursdayMorning: { fr: 'Jeudi matin', ar: 'صباح الخميس' } as Bi,
    tuesday1804: { fr: 'Mardi, 18 h 04', ar: 'الثلاثاء، 18:04' } as Bi,
    wednesdayEvening: { fr: 'Mercredi soir', ar: 'مساء الأربعاء' } as Bi,
  },
  /** The wall calendar and the lock screen: Tuesday 20 to Thursday 22 October 2026. */
  month: { fr: 'OCT.', ar: 'أكتوبر' } as Bi,
  weekdays: {
    tuesday: { fr: 'Mardi', ar: 'الثلاثاء' } as Bi,
    wednesday: { fr: 'Mercredi', ar: 'الأربعاء' } as Bi,
    thursday: { fr: 'Jeudi', ar: 'الخميس' } as Bi,
  },
  lockDate: { fr: 'mardi 20 octobre', ar: 'الثلاثاء 20 أكتوبر' } as Bi,
  lockDateWednesday: { fr: 'mercredi 21 octobre', ar: 'الأربعاء 21 أكتوبر' } as Bi,
};

/**
 * The parents' group, invented: its name, who writes in it (named after their
 * children in 5e A, as parents are in such groups), and what they write. The
 * chat app itself is generic (shared/ui/chat.tsx); none of this is MauriSchool.
 */
export const GROUP = {
  name: { fr: 'Parents 5e A 🎒', ar: 'أولياء الخامسة أ 🎒' } as Bi,
  members: { fr: 'Maman de Mariem, Papa d’Ahmedou, Directeur, Maman de Yahya…', ar: 'أم مريم، أبو أحمدو، المدير، أم يحيى…' } as Bi,
  unread: { fr: '{count} messages non lus', ar: '{count} رسالة غير مقروءة' } as Bi,
  people: {
    mariem: { fr: 'Maman de Mariem', ar: 'أم مريم' } as Bi,
    ahmedou: { fr: 'Papa d’Ahmedou', ar: 'أبو أحمدو' } as Bi,
    yahya: { fr: 'Maman de Yahya', ar: 'أم يحيى' } as Bi,
    moussa: { fr: 'Papa de Moussa', ar: 'أبو موسى' } as Bi,
    zeinabou: { fr: 'Maman de Zeinabou', ar: 'أم زينبو' } as Bi,
    oumar: { fr: 'Papa d’Oumar', ar: 'أبو عمر' } as Bi,
    aminetou: { fr: 'Maman d’Aminetou', ar: 'أم أمينتو' } as Bi,
    director: { fr: 'Directeur', ar: 'المدير' } as Bi,
  },
  says: {
    hello: { fr: 'Bonjour à tous 🌸', ar: 'صباح الخير للجميع 🌸' } as Bi,
    helloThursday: { fr: 'Bonjour, bonne journée à tous 🌸', ar: 'صباح الخير، يوم سعيد للجميع 🌸' } as Bi,
    /** A du'a for the children, and the « Amine » that answer it. */
    prayer: { fr: 'Qu’Allah facilite nos enfants cette année 🤲', ar: 'اللهم وفّق أبناءنا هذا العام 🤲' } as Bi,
    amine: { fr: 'Amine 🤲', ar: 'آمين 🤲' } as Bi,
    jumper: { fr: 'Qui a vu le pull bleu de Mariem ?', ar: 'من رأى الكنزة الزرقاء لمريم؟' } as Bi,
    chain: { fr: 'Le savoir est une lumière. Partagez !', ar: 'العلم نور. انشروا!' } as Bi,
    evening: { fr: 'Bonne soirée à tous ✨', ar: 'مساء الخير للجميع ✨' } as Bi,
    thanks: { fr: 'Merci 🙏', ar: 'شكرا 🙏' } as Bi,
    bus: { fr: 'Qui a le numéro du transport ?', ar: 'من عنده رقم النقل؟' } as Bi,
    found: { fr: 'Pull retrouvé, merci à tous ! 🙏', ar: 'وُجدت الكنزة، شكرا للجميع! 🙏' } as Bi,
    /** The optional gag (Groupe01-Gag): a parent asks what the director already said. */
    gag: { fr: 'Quelqu’un sait s’il y a compo jeudi ?', ar: 'هل يعرف أحد إن كان هناك امتحان الخميس؟' } as Bi,
  },
  /** The day chips in the thread. */
  days: {
    today: { fr: 'Aujourd’hui', ar: 'اليوم' } as Bi,
    tuesday: { fr: 'Mardi', ar: 'الثلاثاء' } as Bi,
    wednesday: { fr: 'Mercredi', ar: 'الأربعاء' } as Bi,
  },
  /** Papa's other conversations, under the group in his list. */
  others: [
    { name: { fr: 'Famille 🏠', ar: 'العائلة 🏠' } as Bi, preview: { fr: 'Tante Salka : On arrive vers 20 h', ar: 'خالتي السالكة: نصل حوالي الثامنة' } as Bi, time: '20:12', unread: 2, color: '#3aa17e', glyph: '🏠' },
    { name: { fr: 'Boutique Ahmed', ar: 'دكان أحمد' } as Bi, preview: { fr: 'Le riz est arrivé', ar: 'وصل الأرز' } as Bi, time: '19:30', unread: 1, color: '#e0833a', glyph: 'B' },
    { name: { fr: 'Foot du vendredi ⚽', ar: 'كرة الجمعة ⚽' } as Bi, preview: { fr: 'Moussa : Qui vient ?', ar: 'موسى: من سيأتي؟' } as Bi, time: '17:55', unread: 5, color: '#4c78d0', glyph: '⚽' },
    { name: { fr: 'Moussa', ar: 'موسى' } as Bi, preview: { fr: 'Ok, à demain', ar: 'طيب، إلى الغد' } as Bi, time: '16:40', mine: true, color: '#8a63c9', glyph: 'M' },
    { name: { fr: 'Voisins', ar: 'الجيران' } as Bi, preview: { fr: 'Coupure d’eau demain matin', ar: 'انقطاع الماء صباح الغد' } as Bi, time: '15:02', color: '#2f9aa0', glyph: 'V' },
  ],
};

/** Suggested caption for the post (not in the video). */
export const CAPTION: Bi = {
  fr: 'Combien de messages non lus dans ton groupe de parents ? 📱 #MauriSchool #Mauritanie',
  ar: 'كم رسالة غير مقروءة في مجموعة الأولياء؟ 📱 #MauriSchool #موريتانيا',
};
