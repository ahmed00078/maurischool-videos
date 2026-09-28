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

/** Fill "{name}" placeholders the way i18next does. */
export const fill = (template: string, params: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
