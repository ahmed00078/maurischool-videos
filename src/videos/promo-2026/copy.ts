import type { Bi } from '../../shared/lang';

/**
 * Everything the video says in its own voice (headlines, chips, bubbles).
 * App interface wording lives in appCopy.ts and is copied from the app;
 * this file is marketing copy and can be rewritten freely.
 *
 * In a headline, *asterisks* mark the word painted in the brand colour.
 */
export const COPY = {
  hook: {
    bubbles: [
      { fr: 'Il a payé, Ahmed ?', ar: 'هل دفع أحمد؟' },
      { fr: 'Le cahier d’appel est où ?', ar: 'أين دفتر الغياب؟' },
      { fr: 'Les notes du trimestre ??', ar: 'نتائج الفصل؟؟' },
      { fr: 'Le fichier Excel ne s’ouvre plus', ar: 'ملف الإكسل لا يفتح' },
      { fr: 'Réunion des parents à 10h ?', ar: 'اجتماع الأولياء الساعة 10؟' },
      { fr: 'Rappel : 12 familles en retard', ar: 'تذكير: 12 عائلة متأخرة' },
      { fr: 'Le bulletin de Mariem ?', ar: 'كشف درجات مريم؟' },
      { fr: 'Qui était absent ce matin ?', ar: 'من كان غائبًا هذا الصباح؟' },
    ] as Bi[],
    // French puts a space before "?": a no-break space keeps it on the word's line.
    question: { fr: 'Diriger une école… *comme ça* ?', ar: 'إدارة مدرسة… *بهذه الطريقة*؟' },
  },
  chaos: {
    words: [
      { fr: 'Cahiers.', ar: 'دفاتر.' },
      { fr: 'Excel.', ar: 'إكسل.' },
      { fr: 'WhatsApp.', ar: 'واتساب.' },
    ] as Bi[],
    lost: { fr: 'Et l’info *se perd*.', ar: 'والمعلومة *تضيع*.' },
  },
  logo: {
    line1: { fr: 'Toute votre école.', ar: 'مدرستك كلها…' },
    line2: { fr: '*Une seule* application.', ar: 'في تطبيق *واحد*.' },
  },
  home: {
    chip: { fr: 'Direction', ar: 'الإدارة' },
    headline: { fr: 'Chaque matin, *l’essentiel* d’abord.', ar: 'كل صباح… *الأهم* أولًا.' },
  },
  finance: {
    headline: { fr: 'Qui a payé. Qui est *en retard*.', ar: 'من دفع… ومن *تأخّر*.' },
  },
  payment: {
    chipA: { fr: 'Comptable', ar: 'المحاسب' },
    chipB: { fr: 'Parent', ar: 'ولي الأمر' },
    headline: { fr: 'Paiement enregistré. *Parent prévenu.*', ar: 'الدفعة مسجّلة… *والوليّ على علم.*' },
  },
  attendance: {
    chipA: { fr: 'Enseignant', ar: 'المعلم' },
    chipB: { fr: 'Parent', ar: 'ولي الأمر' },
    headline: { fr: 'Une absence ? Le parent le sait *tout de suite*.', ar: 'غياب؟ الوليّ يعلم *في الحال*.' },
  },
  grades: {
    chip: { fr: 'Parent', ar: 'ولي الأمر' },
    headline: { fr: 'Notes et bulletins, *sur son téléphone*.', ar: 'النتائج وكشوف الدرجات… *على هاتفه*.' },
  },
  languages: {
    headline1: { fr: 'Arabe *ou* français.', ar: 'بالعربية *أو* بالفرنسية.' },
    headline2: { fr: 'Clair *ou* sombre.', ar: 'فاتح *أو* داكن.' },
  },
  roles: {
    /** App role names, from the "roles" block of mobile_app/src/i18n/{fr,ar}/auth.json. */
    names: [
      { fr: 'Administrateur', ar: 'مدير المدرسة' },
      { fr: 'Comptable', ar: 'المحاسب' },
      { fr: 'Enseignant', ar: 'المعلم' },
      { fr: 'Superviseur', ar: 'المشرف' },
      { fr: 'Parent', ar: 'ولي الأمر' },
      { fr: 'Élève', ar: 'التلميذ' },
    ] as Bi[],
    headline: { fr: 'Sur le téléphone. *Et sur l’ordinateur.*', ar: 'على الهاتف… *وعلى الحاسوب.*' },
    platforms: { fr: 'Android · iPhone · Web', ar: 'Android · iPhone · Web' },
  },
  cta: {
    offer: { fr: 'Démo gratuite', ar: 'اطلب عرضًا مجانيًا' },
    channel: { fr: 'sur WhatsApp', ar: 'على واتساب' },
    tagline: { fr: 'Toute votre école dans une seule application.', ar: 'مدرستك كلها في تطبيق واحد.' },
  },
};

export const WHATSAPP = '+222 33 08 25 42';
