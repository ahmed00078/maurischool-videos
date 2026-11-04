import type { Bi } from '../../shared/lang';

/**
 * Everything the tour says in its own voice: headlines, the steps listed
 * beside the phone, the benefit under them, and the narrator's line for each
 * scene. The ten chapters are in the order they play: three acts (money,
 * classes, families), then the director's dashboard, where it all lands. App wording lives in shared/appCopy.ts. *Asterisks* mark the accent.
 *
 * `voice` is what the narrator reads (briefs/tour-2026-voix.md is the same
 * text, laid out for recording). The picture is complete without it: the
 * headline, the steps and the benefit carry each chapter muted.
 *
 * The Arabic is standard Arabic; a Hassaniya pass is the school team's call.
 * French keeps a no-break space before « ? » and « : ».
 */

type Chapter = { act: number; title: Bi; role: Bi; headline: Bi; steps: Bi[]; benefit: Bi; voice: Bi };

export const ROLE = {
  director: { fr: 'Direction', ar: 'الإدارة' },
  accountant: { fr: 'Comptable', ar: 'المحاسب' },
  teacher: { fr: 'Enseignant', ar: 'المعلم' },
  parent: { fr: 'Parent', ar: 'ولي الأمر' },
} satisfies Record<string, Bi>;

export const COPY = {
  intro: {
    /** The cold open: the counter and the parent's phone, the same minute. In French the time stays with its « à » (no-break space), so both lines break alike. */
    hook: [
      { fr: 'Payé au guichet à 10:24.', ar: 'في 10:24 دُفعت الرسوم.' },
      { fr: 'Le parent le sait *à 10:24.*', ar: 'وفي *10:24* علِم وليّ الأمر.' },
    ] as Bi[],
    title: { fr: 'MauriSchool en *10 points*', ar: 'MauriSchool في *10 نقاط*' },
    sub: { fr: 'Ce que la plateforme fait pour votre école', ar: 'ما تقدّمه المنصة لمدرستكم' },
    voice: {
      fr: 'Dix heures vingt-quatre : un père paie au guichet. Dix heures vingt-quatre : son téléphone sonne, et le reçu est déjà là. Voici MauriSchool, en dix points.',
      ar: 'العاشرة وأربع وعشرون دقيقة: أبٌ يدفع الرسوم في الشبّاك. العاشرة وأربع وعشرون دقيقة: يرنّ هاتفه، والإيصال بين يديه. هذا هو MauriSchool في عشر نقاط.',
    },
  },
  /**
   * The three acts the ten points are grouped in, each announced by a card.
   * `label` is the act's name over a chapter's number. The dashboard closes
   * the list and belongs to none: everything lands on it.
   */
  acts: [
    {
      headline: { fr: 'Votre *argent*', ar: '*ماليتكم*' },
      label: { fr: 'Votre argent', ar: 'ماليتكم' },
      voice: { fr: 'Commençons par votre argent.', ar: 'نبدأ بماليتكم.' },
    },
    {
      headline: { fr: 'Vos *classes*', ar: '*أقسامكم*' },
      label: { fr: 'Vos classes', ar: 'أقسامكم' },
      voice: { fr: 'Ensuite, vos classes.', ar: 'ثم أقسامكم.' },
    },
    {
      headline: { fr: 'Vos *familles*', ar: 'أسر *تلاميذكم*' },
      label: { fr: 'Vos familles', ar: 'أسر تلاميذكم' },
      voice: { fr: 'Enfin, vos familles.', ar: 'وأخيرًا، أسر تلاميذكم.' },
    },
  ] as { headline: Bi; label: Bi; voice: Bi }[],
  /** The dashboard's label in place of an act's (its chapter has `act: 3`). */
  overview: { fr: 'Vue d’ensemble', ar: 'نظرة شاملة' } as Bi,
  chapters: [
    {
      act: 0,
      title: { fr: 'Frais et reçus', ar: 'الرسوم والإيصالات' },
      role: ROLE.accountant,
      headline: { fr: 'Chaque paiement laisse *une preuve*.', ar: 'كل دفعة تترك *إثباتًا*.' },
      steps: [
        { fr: 'Le comptable enregistre le paiement', ar: 'المحاسب يسجّل الدفعة' },
        { fr: 'Le parent est prévenu aussitôt', ar: 'وليّ الأمر يُبلَّغ في الحال' },
        { fr: 'Le reçu est dans son application', ar: 'الإيصال في تطبيقه' },
      ],
      benefit: { fr: 'Plus de reçu perdu, plus de litige.', ar: 'لا إيصال ضائع ولا خلاف.' },
      voice: {
        fr: 'Un. Les frais de scolarité. Le comptable enregistre le paiement au guichet. Le parent est prévenu sur son téléphone, et le reçu est déjà dans son application. Plus de reçu perdu, plus de litige.',
        ar: 'أولًا. الرسوم الدراسية. يسجّل المحاسب الدفعة في الشبّاك، فيُبلَّغ وليّ الأمر على هاتفه، والإيصال موجود في تطبيقه. لا إيصال ضائع ولا خلاف.',
      },
    },
    {
      act: 0,
      title: { fr: 'Finances', ar: 'المالية' },
      role: ROLE.director,
      headline: { fr: 'Qui a payé, *qui est en retard*.', ar: 'من دفع، *ومن تأخّر*.' },
      steps: [
        { fr: 'Encaissé, dépensé, résultat du mois', ar: 'المحصّل، المصروف، وصافي الشهر' },
        { fr: 'Taux de recouvrement et impayés', ar: 'نسبة التحصيل والمتأخرات' },
        { fr: 'Six mois d’un coup d’œil', ar: 'ستة أشهر في نظرة واحدة' },
      ],
      benefit: { fr: 'Vos finances à jour, sans attendre la fin du mois.', ar: 'ماليتكم محدَّثة دون انتظار نهاية الشهر.' },
      voice: {
        fr: 'Deux. Les finances. Ce qui est encaissé, ce qui est dépensé, le résultat du mois. Le taux de recouvrement, et qui est en retard. Vous n’attendez plus la fin du mois pour savoir.',
        ar: 'ثانيًا. المالية. ما حُصِّل وما صُرف وصافي الشهر، ونسبة التحصيل ومن تأخّر في الدفع. لم تعودوا تنتظرون نهاية الشهر لتعرفوا.',
      },
    },
    {
      act: 0,
      title: { fr: 'Paie', ar: 'الرواتب' },
      role: ROLE.director,
      headline: { fr: 'La paie suit *les heures faites*.', ar: 'الرواتب تتبع *الساعات المنجزة*.' },
      steps: [
        { fr: 'Les heures viennent de la présence des enseignants', ar: 'الساعات تأتي من حضور المعلمين' },
        { fr: 'Vous validez, la fiche de paie est prête', ar: 'تعتمدون فيجهز كشف الراتب' },
      ],
      benefit: { fr: 'Une paie juste, que chacun peut vérifier.', ar: 'رواتب عادلة يتحقق منها الجميع.' },
      voice: {
        fr: 'Trois. La paie des enseignants. Les heures viennent de leur présence. L’application prépare les fiches de paie ; vous vérifiez, vous validez. Une paie juste, que chacun peut vérifier.',
        ar: 'ثالثًا. رواتب المعلمين. تأتي الساعات من حضورهم، ويُعدّ التطبيق كشوف الرواتب، فتراجعونها وتعتمدونها. رواتب عادلة يتحقق منها الجميع.',
      },
    },
    {
      act: 1,
      title: { fr: 'Présence', ar: 'الحضور' },
      role: ROLE.teacher,
      headline: { fr: 'L’appel en *un geste*.', ar: 'تسجيل الحضور *بلمسة*.' },
      steps: [
        { fr: 'L’enseignant marque toute la classe', ar: 'المعلم يسجّل القسم كله' },
        { fr: 'Le parent de l’élève absent est prévenu', ar: 'وليّ التلميذ الغائب يُبلَّغ' },
      ],
      benefit: { fr: 'Les familles le savent le matin même.', ar: 'الأسر تعلم في الصباح نفسه.' },
      voice: {
        fr: 'Quatre. La présence. L’enseignant marque toute la classe en un geste, puis l’élève absent. Le parent le sait le matin même. Et sans réseau, l’appel reste sur le téléphone et part dès que la connexion revient.',
        ar: 'رابعًا. الحضور. يسجّل المعلم القسم كله بلمسة ثم يحدّد الغائب، فيعلم وليّ الأمر في الصباح نفسه. وإن انقطعت الشبكة يبقى التسجيل على الهاتف ويُرسَل عند عودتها.',
      },
    },
    {
      act: 1,
      title: { fr: 'Notes', ar: 'الدرجات' },
      role: ROLE.teacher,
      headline: { fr: 'Les notes arrivent *aux familles*.', ar: 'الدرجات تصل *إلى الأسر*.' },
      steps: [
        { fr: 'L’enseignant saisit et publie', ar: 'المعلم يُدخل الدرجات وينشرها' },
        { fr: 'Le parent reçoit la note', ar: 'وليّ الأمر يستلم الدرجة' },
      ],
      benefit: { fr: 'Personne n’attend plus la fin du trimestre.', ar: 'لا أحد ينتظر نهاية الفصل.' },
      voice: {
        fr: 'Cinq. Les notes. L’enseignant saisit le devoir de toute la classe et le publie. Chaque parent reçoit la note de son enfant. Personne n’attend plus la fin du trimestre pour savoir.',
        ar: 'خامسًا. الدرجات. يُدخل المعلم درجات القسم كله وينشرها، فيستلم كل وليّ أمر درجة ابنه. لا أحد ينتظر نهاية الفصل ليعرف.',
      },
    },
    {
      act: 1,
      title: { fr: 'Bulletins', ar: 'كشوف الدرجات' },
      role: ROLE.director,
      headline: { fr: 'Les bulletins, *en quelques minutes*.', ar: 'كشوف الدرجات *في دقائق*.' },
      steps: [
        { fr: 'Les moyennes et les rangs sont calculés', ar: 'المعدلات والترتيب تُحسب تلقائيًا' },
        { fr: 'Vous clôturez le trimestre', ar: 'تُقفلون الفصل' },
        { fr: 'Chaque bulletin est prêt, à vos couleurs', ar: 'كل كشف جاهز بألوان مدرستكم' },
      ],
      benefit: { fr: 'Fini les calculs à la main.', ar: 'انتهى الحساب اليدوي.' },
      voice: {
        fr: 'Six. Les bulletins. Les moyennes et les rangs se calculent tout seuls. Vous clôturez le trimestre, et chaque bulletin est prêt : à vos couleurs, avec votre cachet, et dans le téléphone des parents.',
        ar: 'سادسًا. كشوف الدرجات. تُحسب المعدلات والترتيب تلقائيًا. تُقفلون الفصل فيكون كل كشف جاهزًا: بألوان مدرستكم وختمها، وفي هواتف الأولياء.',
      },
    },
    {
      act: 1,
      title: { fr: 'Emploi du temps', ar: 'جدول الحصص' },
      role: ROLE.director,
      headline: { fr: 'Un emploi du temps *sans conflit*.', ar: 'جدول حصص *بلا تعارض*.' },
      steps: [
        { fr: 'La semaine de chaque classe', ar: 'أسبوع كل قسم' },
        { fr: 'Un enseignant déjà pris ? C’est bloqué', ar: 'معلم مشغول؟ يمنعه التطبيق' },
      ],
      benefit: { fr: 'Jamais deux cours au même endroit.', ar: 'لا حصتان في المكان نفسه أبدًا.' },
      voice: {
        fr: 'Sept. L’emploi du temps. La semaine de chaque classe, de chaque enseignant, de chaque salle. Et si un enseignant est déjà pris sur un créneau, l’application le bloque avant l’erreur.',
        ar: 'سابعًا. جدول الحصص. أسبوع كل قسم وكل معلم وكل قاعة. وإذا كان المعلم مشغولًا في فترة ما، يمنع التطبيق الخطأ قبل وقوعه.',
      },
    },
    {
      act: 2,
      title: { fr: 'Annonces', ar: 'الإعلانات' },
      role: ROLE.director,
      headline: { fr: 'Un message, *toute la classe*.', ar: 'رسالة واحدة *للقسم كله*.' },
      steps: [
        { fr: 'Vous écrivez une seule fois', ar: 'تكتبون مرة واحدة' },
        { fr: 'Chaque famille le reçoit', ar: 'كل أسرة تستلمها' },
      ],
      benefit: { fr: 'Votre annonce ne se perd plus dans un groupe.', ar: 'إعلانكم لا يضيع في مجموعة.' },
      voice: {
        fr: 'Huit. Les annonces. Vous écrivez une fois, pour une classe ou pour toute l’école. Chaque famille reçoit le message sur son téléphone. Il ne se perd plus dans un groupe.',
        ar: 'ثامنًا. الإعلانات. تكتبون مرة واحدة، لقسم أو للمدرسة كلها، فتستلم كل أسرة الرسالة على هاتفها. لن تضيع بعد اليوم في مجموعة.',
      },
    },
    {
      act: 2,
      title: { fr: 'Application des parents', ar: 'تطبيق الأولياء' },
      role: ROLE.parent,
      headline: { fr: 'Des parents *qui vous font confiance*.', ar: 'أولياء *يثقون بكم*.' },
      steps: [
        { fr: 'La présence de l’enfant', ar: 'حضور الابن' },
        { fr: 'Ses notes et sa moyenne', ar: 'درجاته ومعدله' },
        { fr: 'Les frais payés et leurs reçus', ar: 'الرسوم المدفوعة وإيصالاتها' },
      ],
      benefit: { fr: 'Une application pour chaque famille, sans frais pour elle.', ar: 'تطبيق لكل أسرة، دون أي تكلفة عليها.' },
      voice: {
        fr: 'Neuf. L’application des parents. La présence, les notes, les frais et les reçus de leur enfant, au même endroit. Des familles informées, ce sont des familles qui vous font confiance.',
        ar: 'تاسعًا. تطبيق الأولياء. حضور الابن ودرجاته ورسومه وإيصالاته في مكان واحد. والأسر المطّلعة أسر تثق بكم.',
      },
    },
    {
      act: 3,
      title: { fr: 'Tableau de bord', ar: 'لوحة المدير' },
      role: ROLE.director,
      headline: { fr: 'Toute l’école, *sur un écran*.', ar: 'المدرسة كلها *على شاشة واحدة*.' },
      steps: [
        { fr: 'Ce qui demande votre attention, d’abord', ar: 'ما يحتاج انتباهكم أولًا' },
        { fr: 'Élèves, présence, paiements : les chiffres du jour', ar: 'التلاميذ، الحضور، المدفوعات: أرقام اليوم' },
      ],
      benefit: { fr: 'Dès le matin, vous savez où agir.', ar: 'منذ الصباح تعرفون أين تتدخلون.' },
      voice: {
        fr: 'Dix. Le tableau de bord du directeur. Tout ce que vous venez de voir arrive ici. Dès le matin, ce qui demande votre attention apparaît en premier : les paiements en retard, les fiches de paie à valider. Juste en dessous, les chiffres de l’école, à jour.',
        ar: 'عاشرًا. لوحة المدير. كل ما رأيتموه يصل إلى هنا. منذ الصباح يظهر ما يحتاج انتباهكم أولًا: المدفوعات المتأخرة وكشوف الرواتب التي تنتظر الاعتماد. وتحتها أرقام المدرسة محدَّثة.',
      },
    },
  ] as Chapter[],
  more: {
    headline: { fr: 'Et aussi…', ar: 'وأيضًا…' },
    items: [
      { fr: 'Import Excel des élèves et des enseignants', ar: 'استيراد التلاميذ والمعلمين من Excel' },
      { fr: 'Français et arabe', ar: 'بالعربية والفرنسية' },
      { fr: 'Un espace par rôle', ar: 'فضاء لكل دور' },
      { fr: 'Fonctionne sans connexion', ar: 'يعمل دون اتصال' },
      { fr: 'Sur téléphone et sur ordinateur', ar: 'على الهاتف وعلى الحاسوب' },
      { fr: 'Chaque correction est tracée', ar: 'كل تصحيح مسجَّل' },
    ] as Bi[],
    voice: {
      fr: 'Et aussi : l’import de vos listes depuis Excel, le français et l’arabe, un espace pour chaque rôle, le travail sans connexion, le téléphone et l’ordinateur, et chaque correction tracée.',
      ar: 'وأيضًا: استيراد قوائمكم من Excel، العربية والفرنسية، فضاء لكل دور، العمل دون اتصال، الهاتف والحاسوب، وكل تصحيح مسجَّل.',
    },
  },
  close: {
    headline: { fr: 'On vous *accompagne*.', ar: 'نحن *نرافقكم*.' },
    steps: [
      { fr: 'Import de vos données', ar: 'استيراد بياناتكم' },
      { fr: 'Formation de vos équipes', ar: 'تكوين فرقكم' },
      { fr: 'Suivi au quotidien', ar: 'متابعة يومية' },
    ] as Bi[],
    offer: { fr: 'Demandez une démonstration', ar: 'اطلبوا عرضًا توضيحيًا' },
    tagline: { fr: 'Toute votre école dans une seule application.', ar: 'مدرستكم كلها في تطبيق واحد.' },
    voice: {
      fr: 'Et vous n’êtes pas seuls : nous importons vos données, nous formons vos équipes, et nous restons à vos côtés. Demandez une démonstration dans votre école.',
      ar: 'ولستم وحدكم: نستورد بياناتكم، ونكوّن فرقكم، ونبقى إلى جانبكم. اطلبوا عرضًا توضيحيًا في مدرستكم.',
    },
  },
};
