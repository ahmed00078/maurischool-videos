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
