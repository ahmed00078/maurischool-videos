import type { Bi } from './lang';

/**
 * Interface wording, copied verbatim from mobile_app/src/i18n/{fr,ar}. The
 * phones on screen must read exactly like the app, so do not paraphrase here;
 * change the app's translation first, then copy it across.
 */
export const HOME = {
  priorityAlerts: { fr: 'À traiter en priorité', ar: 'الأولوية الآن' },
  nextActions: { fr: 'Prochaines actions', ar: 'الخطوات التالية' },
  overview: { fr: 'Aperçu', ar: 'نظرة عامة' },
  recentActivity: { fr: 'Activité récente', ar: 'آخر النشاطات' },
  actions: {
    onboard_students: { fr: 'Inscrire des élèves', ar: 'تسجيل التلاميذ' },
    view_finance: { fr: 'Voir les finances', ar: 'عرض المالية' },
    send_announcement: { fr: 'Envoyer une annonce', ar: 'إرسال إعلان' },
  },
  alerts: {
    overdue_payments: { fr: 'Paiements en retard : {amount}.', ar: 'مدفوعات متأخرة: {amount}.' },
    payroll_drafts_pending: { fr: '{count} fiches de paie à valider.', ar: '{count} كشوف رواتب في انتظار المصادقة.' },
  },
  activities: {
    payment: { fr: 'Paiement', ar: 'دفعة' },
    expense: { fr: 'Dépense', ar: 'مصروف' },
    enrolled: { fr: 'Inscription', ar: 'تسجيل' },
  },
  kpis: {
    students: { fr: 'Élèves', ar: 'التلاميذ' },
    teachers: { fr: 'Enseignants', ar: 'المعلمون' },
    attendance: { fr: 'Présence ce mois', ar: 'الحضور هذا الشهر' },
    pending: { fr: 'Paiements attendus', ar: 'المدفوعات المنتظرة' },
  },
} satisfies Record<string, unknown>;

export const FINANCE_COPY = {
  title: { fr: 'Finance', ar: 'المالية' },
  netIncomeThisMonth: { fr: 'Résultat net du mois', ar: 'صافي الشهر' },
  collectedThisMonth: { fr: 'Encaissé', ar: 'المحصّل' },
  spentThisMonth: { fr: 'Dépensé', ar: 'المصروف' },
  vsLastMonth: { fr: '{value} par rapport au mois dernier', ar: '{value} مقارنة بالشهر الماضي' },
  outstanding: { fr: 'Créances ouvertes', ar: 'المستحقات القائمة' },
  studentsWithBalance: { fr: '{count} élèves avec un solde', ar: '{count} تلاميذ عليهم رصيد' },
  overdue: { fr: 'En retard', ar: 'متأخرة' },
  overdueInvoices: { fr: '{count} factures échues', ar: '{count} فواتير متأخرة' },
  collectionRate: { fr: 'Taux de recouvrement', ar: 'نسبة التحصيل' },
  paidOfIssued: { fr: '{paid} payées sur {total}', ar: '{paid} مدفوعة من {total}' },
  averagePaymentTime: { fr: 'Délai moyen de paiement : {days} jours', ar: 'متوسط مدة السداد: {days} يومًا' },
  sixMonthTrend: { fr: 'Six derniers mois', ar: 'آخر ستة أشهر' },
  revenue: { fr: 'Recettes', ar: 'المداخيل' },
  expenses: { fr: 'Dépenses', ar: 'المصروفات' },
} satisfies Record<string, Bi>;

export const TABS = {
  home: { fr: 'Accueil', ar: 'الرئيسية' },
  people: { fr: 'Personnes', ar: 'الأشخاص' },
  academics: { fr: 'Scolarité', ar: 'الدراسة' },
  finance: { fr: 'Finance', ar: 'المالية' },
  more: { fr: 'Plus', ar: 'المزيد' },
} satisfies Record<string, Bi>;

/**
 * Push notification copy, verbatim from backend/app/core/notification_i18n.py.
 * Only the events a parent really receives are here.
 */
export const NOTIFS = {
  payment_received: {
    title: { fr: 'Paiement enregistré — {student_name}', ar: 'تم تسجيل الدفع — {student_name}' },
    message: {
      fr: '{amount} MRU ont été enregistrés. Le reçu {receipt_number} est disponible. Aucune action requise.',
      ar: 'تمّ تسجيل {amount} أوقية. الوصل {receipt_number} متاح. لا يتطلّب أيّ إجراء.',
    },
  },
  absence_marked: {
    title: { fr: 'Absence enregistrée — {student_name}', ar: 'تسجيل غياب — {student_name}' },
    message: {
      fr: "Une absence a été enregistrée le {date} en {class_name}. Si l'information est incorrecte, contactez l'école.",
      ar: 'سُجّل غياب {student_name} يوم {date} في قسم {class_name}. إذا كانت المعلومة غير صحيحة، تواصلوا مع المدرسة.',
    },
  },
  report_card_available_parent: {
    title: { fr: 'Bulletin disponible — {student_name}', ar: 'كشف الدرجات متاح — {student_name}' },
    message: {
      fr: 'Le bulletin de {student_name} pour le {period} est disponible. Moyenne générale : {overall_average}/20. Téléchargez-le depuis les documents.',
      ar: 'كشف درجات {student_name} لـ {period} متاح. المعدّل العام: {overall_average}/20. حمّلوه من الوثائق.',
    },
  },
  grade_published_parent: {
    title: { fr: 'Note publiée — {student_name}', ar: 'نشر نقطة — {student_name}' },
    message: {
      fr: '{grade}/20 en {subject_name}, {period}. Aucune action requise.',
      ar: '{grade}/20 في {subject_name}، {period}. لا يتطلّب أيّ إجراء.',
    },
  },
  payment_reminder: {
    title: { fr: 'Échéance le {due_date} — {student_name}', ar: 'الاستحقاق يوم {due_date} — {student_name}' },
    message: {
      fr: "Il reste {amount_due} MRU à régler au guichet pour la facture {invoice_number}. Ignorez ce rappel si le paiement vient d'être enregistré.",
      ar: 'يتبقّى {amount_due} أوقية للدفع في الشبّاك عن الفاتورة {invoice_number}. تجاهلوا هذا التذكير إذا تمّ الدفع للتوّ.',
    },
  },
  payment_overdue: {
    title: { fr: 'Paiement en retard — {student_name}', ar: 'تأخّر في الدفع — {student_name}' },
    message: {
      fr: "{amount_due} MRU restent dus depuis le {due_date} pour la facture {invoice_number}. Réglez au guichet, ou contactez l'école si vous avez déjà payé.",
      ar: '{amount_due} أوقية ما زالت مستحقّة منذ {due_date} عن الفاتورة {invoice_number}. ادفعوا في الشبّاك، أو تواصلوا مع المدرسة إذا سبق أن دفعتم.',
    },
  },
} satisfies Record<string, { title: Bi; message: Bi }>;

/**
 * The teacher's workspace (mobile_app/src/i18n: teacher, common, navigation).
 * Plural forms are the ones i18next picks for the counts the videos show.
 */
export const TEACHER_COPY = {
  tabs: {
    home: { fr: 'Accueil', ar: 'الرئيسية' },
    teaching: { fr: 'Enseignement', ar: 'التدريس' },
    planning: { fr: 'Planning', ar: 'التخطيط' },
    payments: { fr: 'Paie & pointage', ar: 'الراتب والحضور' },
    profile: { fr: 'Profil', ar: 'الحساب' },
  },
  attendance: {
    allPresent: { fr: 'Tous présents', ar: 'الكل حاضر' },
    progressShort: { fr: '{marked}/{total}', ar: '{marked}/{total}' },
    /** markRemaining_other (fr) and markRemaining_many (ar, 11 to 99). */
    markRemaining: { fr: 'Marquer les {count} restants', ar: 'سجّل {count} تلميذا متبقيا' },
    saveWithCounts: { fr: 'Enregistrer · {present} présents, {absent} absents', ar: 'حفظ · {present} حاضر، {absent} غائب' },
    savedOffline: { fr: "Enregistré sur l'appareil", ar: 'تم حفظ الحضور على الجهاز' },
    savedOfflineDetail: {
      fr: 'La synchronisation se fera automatiquement au retour de la connexion.',
      ar: 'ستتم مزامنته تلقائياً عند عودة الاتصال.',
    },
    pendingSend: { fr: "En attente d'envoi", ar: 'في انتظار الإرسال' },
  },
  status: {
    present: { fr: 'Présent', ar: 'حاضر' },
    absent: { fr: 'Absent', ar: 'غائب' },
  },
  grades: {
    saveDraft: { fr: 'Enregistrer le brouillon', ar: 'حفظ المسودة' },
    publish: { fr: 'Publier', ar: 'نشر' },
    published: { fr: 'Évaluation publiée', ar: 'تم نشر التقييم' },
    publishConfirmTitle: { fr: "Publier l'évaluation ?", ar: 'نشر التقييم؟' },
    publishConfirmMessage: {
      fr: 'Les élèves et les parents verront ces notes et recevront une notification.',
      ar: 'سيرى التلاميذ وأولياء الأمور هذه الدرجات وسيتلقون إشعاراً.',
    },
    draft: { fr: 'Brouillon', ar: 'مسودة' },
  },
  cancel: { fr: 'Annuler', ar: 'إلغاء' },
} as const satisfies Record<string, unknown>;

/** Screens used by the feature scenes (mobile_app/src/i18n: teacher, common, finance). */
export const SCREEN_COPY = {
  attendanceTitle: { fr: 'Marquer la présence', ar: 'تسجيل الحضور' },
  allPresent: { fr: 'Tous présents', ar: 'الكل حاضر' },
  markedProgress: { fr: '{marked}/{total} élèves marqués', ar: 'تم تسجيل {marked} من {total} تلاميذ' },
  submitAttendance: { fr: 'Enregistrer la présence', ar: 'حفظ الحضور' },
  present: { fr: 'Présent', ar: 'حاضر' },
  absent: { fr: 'Absent', ar: 'غائب' },
  recordPayment: { fr: 'Enregistrer un paiement', ar: 'تسجيل دفعة' },
  amount: { fr: 'Montant', ar: 'المبلغ' },
  save: { fr: 'Enregistrer', ar: 'حفظ' },
  overallAverage: { fr: 'Moyenne générale', ar: 'المعدل العام' },
  now: { fr: 'maintenant', ar: 'الآن' },
} satisfies Record<string, Bi>;

/**
 * The notification centre every role shares (mobile_app/src/components/shared/
 * NotificationsScreen.tsx; i18n common.json). Its rows are rendered in the app
 * from notifications.json, whose wording is the backend's above, and unlike the
 * lock screen they show the detail: a sensitive push only says
 * "Ouvrez MauriSchool pour consulter le détail." on a locked phone.
 */
export const INBOX_COPY = {
  title: { fr: 'Notifications', ar: 'الإشعارات' },
  markAllRead: { fr: 'Tout marquer comme lu', ar: 'تحديد الكل كمقروء' },
  all: { fr: 'Tout', ar: 'الكل' },
  unread: { fr: 'Non lues', ar: 'غير المقروءة' },
  archived: { fr: 'Archivées', ar: 'المؤرشفة' },
  /** navigation.json: the parent's tabs. */
  tabs: {
    home: { fr: 'Accueil', ar: 'الرئيسية' },
    fees: { fr: 'Frais', ar: 'الرسوم' },
    observations: { fr: 'Observations', ar: 'الملاحظات' },
    profile: { fr: 'Profil', ar: 'الحساب' },
  },
} satisfies Record<string, unknown>;

/** Role names, from the "roles" block of mobile_app/src/i18n/{fr,ar}/auth.json. */
export const ROLES = {
  parent: { fr: 'Parent', ar: 'ولي الأمر' },
  teacher: { fr: 'Enseignant', ar: 'المعلم' },
} satisfies Record<string, Bi>;

/**
 * The parent's child profile, grades tab (app/(app)/(parent)/children/[id].tsx,
 * StudentGradesPanel, SubjectGradesList), from mobile_app/src/i18n/{fr,ar}/common.json.
 */
export const CHILD_GRADES_COPY = {
  tabs: {
    attendance: { fr: 'Présence', ar: 'الحضور' },
    schedule: { fr: 'Emploi du temps', ar: 'الجدول الزمني' },
    grades: { fr: 'Notes', ar: 'الدرجات' },
  },
  /** periods.* : the term switcher. */
  periods: [
    { fr: 'Trim. 1', ar: 'الفصل 1' },
    { fr: 'Trim. 2', ar: 'الفصل 2' },
    { fr: 'Trim. 3', ar: 'الفصل 3' },
  ],
  /** gradeResults.periodNames.trimester1 */
  trimester1: { fr: 'Trimestre 1', ar: 'الفصل الأول' },
  downloadReportCard: { fr: 'Télécharger le bulletin', ar: 'تحميل كشف الدرجات' },
  finalAverage: { fr: 'Moyenne finale — {period}', ar: 'المعدل النهائي — {period}' },
  gradedSubjects: { fr: '{graded} matières notées sur {total}', ar: '{graded} مواد من أصل {total} لها معدل' },
  publishedGrades: { fr: 'Notes publiées : {count}', ar: 'الدرجات المنشورة: {count}' },
  termClosed: { fr: 'Trimestre clôturé', ar: 'الفصل مغلق' },
  calculationAction: { fr: 'Comment cette moyenne est-elle calculée ?', ar: 'كيف تم حساب هذا المعدل؟' },
  finalSubjectAverage: { fr: 'Moyenne finale', ar: 'المعدل النهائي' },
  subjectCoefficient: { fr: 'Coefficient de la matière : {value}', ar: 'معامل المادة: {value}' },
} satisfies Record<string, unknown>;

/** Fill "{name}" placeholders the way i18next does. */
export const fill = (template: string, params: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
