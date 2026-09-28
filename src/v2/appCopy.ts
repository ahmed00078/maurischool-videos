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
} satisfies Record<string, { title: Bi; message: Bi }>;

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

/** Fill "{name}" placeholders the way i18next does. */
export const fill = (template: string, params: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
