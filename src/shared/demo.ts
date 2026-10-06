import type { Bi } from './lang';

/**
 * The staged school the video shows. Invented on purpose: no real school, no
 * real pupil. The numbers are chosen to be believable for a Mauritanian private
 * school of about 500 pupils, and they agree with each other across scenes
 * (the overdue amount on the home screen is the one on the finance screen).
 *
 * To rename the school, change SCHOOL and nothing else.
 */
export const SCHOOL: Bi = { fr: 'École Nour El Ilm', ar: 'مدرسة نور العلم' };
export const YEAR = '2026-2027';

/** "Today" in the story: a Monday in October, a month after the rentrée. */
export const TODAY = '12/10/2026';

export const PEOPLE = { students: 486, teachers: 24 };
export const ATTENDANCE_RATE = 96.4;

export const FINANCE = {
  netIncome: 754_000,
  collected: 1_102_000,
  spent: 348_000,
  growth: 12.4,
  outstanding: 418_500,
  studentsWithBalance: 97,
  overdue: 62_300,
  overdueInvoices: 21,
  collectionRate: 91.35,
  paidInvoices: 2219,
  totalInvoices: 2429,
  averagePaymentDays: 4,
  /** Last six months, May to October: the summer dip, then the rentrée. */
  months: [
    { month: 5, revenue: 1_050_000, expenses: 340_000 },
    { month: 6, revenue: 980_000, expenses: 360_000 },
    { month: 7, revenue: 210_000, expenses: 300_000 },
    { month: 8, revenue: 350_000, expenses: 310_000 },
    { month: 9, revenue: 1_240_000, expenses: 370_000 },
    { month: 10, revenue: 1_102_000, expenses: 348_000 },
  ],
};

export const PAYROLL_DRAFTS = 3;

export type Activity = {
  kind: 'payment' | 'expense' | 'enrolled';
  name: Bi;
  amount?: number;
  date: string;
};

export const ACTIVITY: Activity[] = [
  { kind: 'payment', name: { fr: 'Aïcha Mint Ahmed', ar: 'عائشة بنت أحمد' }, amount: 3000, date: '12/10/2026' },
  { kind: 'enrolled', name: { fr: 'Sidi Mohamed Ould Brahim', ar: 'سيدي محمد ولد إبراهيم' }, date: '12/10/2026' },
  { kind: 'payment', name: { fr: 'Fatimetou Mint Salem', ar: 'فاطمتو بنت سالم' }, amount: 1500, date: '11/10/2026' },
  { kind: 'expense', name: { fr: 'Fournitures de bureau', ar: 'لوازم مكتبية' }, amount: 12500, date: '10/10/2026' },
  { kind: 'payment', name: { fr: 'Mohamed Lemine Ould Cheikh', ar: 'محمد الأمين ولد الشيخ' }, amount: 2500, date: '10/10/2026' },
];

/** The pupil we follow from the teacher's register to the parent's phone. */
export const PUPIL: Bi = { fr: 'Mariem Mint Ahmed', ar: 'مريم بنت أحمد' };
export const PUPIL_CLASS: Bi = { fr: '5e A', ar: 'الخامسة أ' };

/** 5e A as the teacher's register lists it: the first rows on screen, and the class size. */
export const CLASS_ROSTER: Bi[] = [
  { fr: 'Aminetou Mint Mahmoud', ar: 'أمينتو بنت محمود' },
  { fr: 'Sidi Mohamed Ould Ali', ar: 'سيدي محمد ولد علي' },
  PUPIL,
  { fr: 'Yahya Ould Brahim', ar: 'يحيى ولد إبراهيم' },
  { fr: 'Khadijetou Mint Oumar', ar: 'خديجتو بنت عمر' },
  { fr: 'Moussa Ba', ar: 'موسى با' },
  { fr: 'Zeinabou Mint Sidi', ar: 'زينبو بنت سيدي' },
  { fr: 'Ahmedou Ould Salem', ar: 'أحمدو ولد سالم' },
  { fr: 'Fatimetou Mint Isselmou', ar: 'فاطمتو بنت اسلمو' },
  { fr: 'Oumar Sy', ar: 'عمر سي' },
];
export const CLASS_SIZE = 28;

/** The maths lesson of World Teachers' Day, Monday 5 October 2026. */
export const LESSON = {
  date: new Date(2026, 9, 5),
  subject: { fr: 'Mathématiques', ar: 'الرياضيات' } as Bi,
  start: '08:00',
  end: '10:00',
};

/**
 * A maths test for 5e A: one score per roster row (null = absent), out of 20.
 * Decimals on purpose: the backend writes a grade as a float, so a whole 16
 * would read "16.0/20" in the parent's notification.
 */
export const TEST = {
  title: { fr: 'Devoir 1', ar: 'الفرض 1' } as Bi,
  period: { fr: '1er trimestre', ar: 'الفصل الأول' } as Bi,
  scores: [16.5, 14, null, 12.5, 17, 11.5, 15, 13.5, 18, 9.5] as (number | null)[],
};

/**
 * The Ould Mocktar family, for the « Qui ne dit pas la vérité ? » series:
 * Zahra, her little brother Sidi, and their father Mocktar.
 *
 * Episode 1: the father has paid the term, Zahra has her 20, Sidi's maths test says 7.5.
 * Episode 2 (Wednesday 14 October): Sidi has a 16 in French, the school has
 * reminded the parents of Zahra's instalment due on 5 November, and Zahra was
 * marked absent that morning.
 */
export const FAMILY = {
  son: { fr: 'Sidi Ould Mocktar', ar: 'سيدي ولد المختار' } as Bi,
  daughter: { fr: 'Zahra Mint Mocktar', ar: 'زهرة بنت المختار' } as Bi,
  /** Short names for the placards. */
  short: {
    son: { fr: 'Sidi', ar: 'سيدي' } as Bi,
    daughter: { fr: 'Zahra', ar: 'زهرة' } as Bi,
    father: { fr: 'Papa', ar: 'بابا' } as Bi,
  },
  /**
   * Grades as the parent's inbox prints them: the app formats the number the
   * API sends, so 20.0 reads "20" and 7.5 reads "7.5".
   */
  sonGrade: { value: '7.5', subject: { fr: 'Mathématiques', ar: 'الرياضيات' } as Bi },
  daughterGrade: { value: '20', subject: { fr: 'Arabe', ar: 'اللغة العربية' } as Bi },
  period: { fr: '1er trimestre', ar: 'الفصل الأول' } as Bi,
  /** formatAmount groups with a narrow no-break space, as fr-FR does; receipts are RCP-<year>-<6 digits>. */
  payment: { amount: '2 500', receipt: 'RCP-2026-000312' },
  /** Zahra's class, as the register names it. */
  daughterClass: { fr: '3e A', ar: 'الثالثة أ' } as Bi,
  /** 16.0 from the API prints "16". */
  sonFrenchGrade: { value: '16', subject: { fr: 'Français', ar: 'اللغة الفرنسية' } as Bi },
  /** formatDate prints the ISO date the backend sends as dd/mm/yyyy, in Arabic too. */
  daughterAbsence: '14/10/2026',
  /** A reminder the finance office sends for an open invoice; invoices are INV-<year>-<6 digits>. */
  reminder: { due: '05/11/2026', amount: '2 500', invoice: 'INV-2026-000231' },
  /**
   * The first-term report cards: the backend sends overall_average rounded to
   * two decimals as a string ("12.00"), and the inbox prints it as sent.
   */
  averages: { son: '12.00', daughter: '17.50' },
  /**
   * The first term as the child's grades screen shows it: subject averages and
   * coefficients that make the overall average (weighted by coefficient), the
   * class, the attendance rate. Zahra: 280 / 16 = 17.5; Sidi: 192 / 16 = 12.
   */
  terms: {
    son: {
      className: { fr: '1re B', ar: 'الأولى ب' } as Bi,
      attendance: 94,
      average: 12,
      published: 18,
      subjects: [
        { name: { fr: 'Mathématiques', ar: 'الرياضيات' } as Bi, coefficient: 4, average: 11 },
        { name: { fr: 'Langue arabe', ar: 'اللغة العربية' } as Bi, coefficient: 3, average: 13 },
        { name: { fr: 'Français', ar: 'اللغة الفرنسية' } as Bi, coefficient: 3, average: 12 },
        { name: { fr: 'Sciences naturelles', ar: 'العلوم الطبيعية' } as Bi, coefficient: 2, average: 12.5 },
        { name: { fr: 'Éducation islamique', ar: 'التربية الإسلامية' } as Bi, coefficient: 2, average: 13.5 },
        { name: { fr: 'Histoire-géographie', ar: 'التاريخ والجغرافيا' } as Bi, coefficient: 2, average: 10.5 },
      ],
    },
    daughter: {
      className: { fr: '3e A', ar: 'الثالثة أ' } as Bi,
      attendance: 97,
      average: 17.5,
      published: 18,
      subjects: [
        { name: { fr: 'Mathématiques', ar: 'الرياضيات' } as Bi, coefficient: 4, average: 18 },
        { name: { fr: 'Langue arabe', ar: 'اللغة العربية' } as Bi, coefficient: 3, average: 17.5 },
        { name: { fr: 'Français', ar: 'اللغة الفرنسية' } as Bi, coefficient: 3, average: 17 },
        { name: { fr: 'Sciences naturelles', ar: 'العلوم الطبيعية' } as Bi, coefficient: 2, average: 17 },
        { name: { fr: 'Éducation islamique', ar: 'التربية الإسلامية' } as Bi, coefficient: 2, average: 18 },
        { name: { fr: 'Histoire-géographie', ar: 'التاريخ والجغرافيا' } as Bi, coefficient: 2, average: 17.25 },
      ],
    },
  },
  /** The second term, paid at the desk in December. */
  termPayment: { amount: '7 500', receipt: 'RCP-2026-000418' },
};
