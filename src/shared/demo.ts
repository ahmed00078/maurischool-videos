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

/**
 * « La chèvre et le reçu » (chevre-01): the father pays Sidi's October fees at
 * the school's counter, in cash, on Monday 12 October. The accountant records
 * it in the app and the receipt reaches his phone. Numbers follow the backend's
 * formats: receipts RCP-<year>-<6 digits> (finance_numbering.py), invoices
 * INV-<year>-<6 digits>, a pupil's matricule <school code><S><4 digits>.
 * The paper receipt book's red serial is the app receipt's last six digits,
 * so the scrap in the goat's mouth (« …0412 ») matches the phone.
 */
export const FEES_PAYMENT = {
  amount: 7500,
  /** formatAmount: a narrow no-break space between thousands. */
  amountText: '7 500',
  receipt: 'RCP-2026-000412',
  serial: '000412',
  invoice: 'INV-2026-000287',
  date: '12/10/2026',
  time: '10:24',
  /** The morning reminder that came before it, for the invoice due on the 15th. */
  reminder: { due: '15/10/2026', time: '07:30' },
  /** The school names the fee; the app prints the school's words. */
  description: { fr: 'Scolarité — Octobre', ar: 'رسوم الدراسة — أكتوبر' } as Bi,
  studentCode: 'NEIS0187',
  /** Sidi's father, named after his own father as Sidi is after him. */
  payer: { fr: 'Mocktar Ould Sidi', ar: 'المختار ولد سيدي' } as Bi,
  cashier: { fr: 'Vatimetou Mint Abdallahi', ar: 'فاطمتو بنت عبد الله' } as Bi,
};

/**
 * « Le groupe des parents » (groupe-01): on Tuesday 20 October 2026 at 18:04
 * the director tells 5e A about Thursday's maths test. The title and the body
 * are free text the director types (≤ 120 and ≤ 1000 characters), shown as
 * typed to every reader, so each cut has them in its own language. It is the
 * same text the director posted in the class's chat group.
 *
 * For a class, the recipients are its pupils, their guardians and its
 * assigned teachers, the sender excluded; the preview sorts the breakdown by
 * role (parent, student, teacher): 41 + 28 (CLASS_SIZE) + 9 = 78.
 */
export const CLASS_ANNOUNCEMENT = {
  title: { fr: 'Composition de maths jeudi', ar: 'امتحان الرياضيات يوم الخميس' } as Bi,
  body: { fr: 'Révisez le chapitre 3. Apportez une calculatrice.', ar: 'راجعوا الفصل الثالث. أحضروا آلة حاسبة.' } as Bi,
  time: '18:04',
  /** Tuesday 20 October 2026; the test is on Thursday 22. */
  day: 20,
  breakdown: [
    { role: 'parent', count: 41 },
    { role: 'student', count: CLASS_SIZE },
    { role: 'teacher', count: 9 },
  ] as const,
  total: 41 + CLASS_SIZE + 9,
};

/**
 * The school's identity on its documents (school settings → documents): its
 * code, its own colour (DocumentTheme.from_color derives the soft and pale
 * tints), its motto, and the authority lines either side of the logo on
 * official documents. A school that sets no colour prints in MauriSchool's.
 */
export const SCHOOL_IDENTITY = {
  code: 'NEIS',
  accent: '#0F766E',
  motto: { fr: 'Savoir, rigueur, respect', ar: 'علم، انضباط، احترام' } as Bi,
  headerFr: ['République Islamique de Mauritanie', "Ministère de l'Éducation Nationale", "Direction de l'enseignement privé"],
  headerAr: ['الجمهورية الإسلامية الموريتانية', 'وزارة التهذيب الوطني', 'إدارة التعليم الخاص'],
  contact: 'Tevragh-Zeina, Nouakchott · +222 45 00 00 00 · contact@nourelilm.example',
};

/** The pupil's matricule and her father, who gets the notifications. */
export const PUPIL_CODE = 'NEIS0142';
export const PUPIL_FATHER: Bi = { fr: 'Ahmed Ould Mohamed', ar: 'أحمد ولد محمد' };
export const PUPIL_SHORT: Bi = { fr: 'Mariem', ar: 'مريم' };

/**
 * Mariem's first-term report card, published when the director closes the
 * term in December. Averages and coefficients make the overall average
 * (356.5 / 23 = 15.5); the backend prints every number with two decimals.
 */
export const REPORT_CARD = {
  period: { fr: '1er trimestre', ar: 'الفصل الأول' } as Bi,
  periodCode: 'T1',
  subjects: [
    { name: { fr: 'Mathématiques', ar: 'الرياضيات' } as Bi, coefficient: 4, average: 16.5 },
    { name: { fr: 'Langue arabe', ar: 'اللغة العربية' } as Bi, coefficient: 4, average: 16 },
    { name: { fr: 'Français', ar: 'اللغة الفرنسية' } as Bi, coefficient: 3, average: 14 },
    { name: { fr: 'Sciences naturelles', ar: 'العلوم الطبيعية' } as Bi, coefficient: 2, average: 15 },
    { name: { fr: 'Physique-chimie', ar: 'الفيزياء والكيمياء' } as Bi, coefficient: 2, average: 14.5 },
    { name: { fr: 'Éducation islamique', ar: 'التربية الإسلامية' } as Bi, coefficient: 2, average: 17 },
    { name: { fr: 'Histoire-géographie', ar: 'التاريخ والجغرافيا' } as Bi, coefficient: 2, average: 14 },
    { name: { fr: 'Anglais', ar: 'اللغة الإنجليزية' } as Bi, coefficient: 2, average: 15.5 },
    { name: { fr: 'Éducation civique', ar: 'التربية المدنية' } as Bi, coefficient: 1, average: 16 },
    { name: { fr: 'Éducation physique', ar: 'التربية البدنية' } as Bi, coefficient: 1, average: 16.5 },
  ],
  average: 15.5,
  rank: 3,
  attendance: { period: '01/10/2026 - 19/12/2026', unexcused: 1, excused: 1, late: 0 },
  /** Free text the class teacher writes, printed as typed. */
  appreciation: { fr: 'Élève sérieuse et appliquée. Très bon trimestre, continuez ainsi.', ar: 'تلميذة جادة ومجتهدة. فصل ممتاز، واصلي على هذا النهج.' } as Bi,
  issued: '21/12/2026',
  /** The term as the closing screen states it. */
  term: { start: '01/10/2026', end: '19/12/2026', classes: 18, subjects: 142 },
};

/**
 * 5e A's Monday as the admin's timetable draws it: the school's bell grid,
 * each period filled, free or a break. The maths lesson is LESSON's.
 */
export type TimetableRow =
  | { kind: 'lesson'; start: string; end: string; subject: Bi; teacher: Bi; room: Bi }
  | { kind: 'pause'; start: string }
  | { kind: 'free'; start: string; end: string };

const ROOM = (n: number): Bi => ({ fr: `Salle ${n}`, ar: `القاعة ${n}` });
export const TEACHERS = {
  maths: { fr: 'Mohamed Ould Sidi', ar: 'محمد ولد سيدي' } as Bi,
  arabic: { fr: 'Aïchetou Mint Brahim', ar: 'عيشة بنت إبراهيم' } as Bi,
  french: { fr: 'Ibrahima Diallo', ar: 'إبراهيما ديالو' } as Bi,
  science: { fr: 'Khadija Mint Ely', ar: 'خديجة بنت اعل' } as Bi,
};
export const TIMETABLE: TimetableRow[] = [
  { kind: 'lesson', start: '08:00', end: '10:00', subject: { fr: 'Mathématiques', ar: 'الرياضيات' }, teacher: TEACHERS.maths, room: ROOM(4) },
  { kind: 'pause', start: '10:00' },
  { kind: 'lesson', start: '10:15', end: '12:00', subject: { fr: 'Langue arabe', ar: 'اللغة العربية' }, teacher: TEACHERS.arabic, room: ROOM(4) },
  { kind: 'lesson', start: '12:00', end: '13:00', subject: { fr: 'Français', ar: 'اللغة الفرنسية' }, teacher: TEACHERS.french, room: ROOM(4) },
  { kind: 'free', start: '15:00', end: '16:00' },
  { kind: 'lesson', start: '16:00', end: '17:00', subject: { fr: 'Sciences naturelles', ar: 'العلوم الطبيعية' }, teacher: TEACHERS.science, room: ROOM(2) },
];

/**
 * September's payroll, as the list shows it in October: PAYROLL_DRAFTS of the
 * 24 payslips still to validate. Payroll numbers share the expenses' series
 * (EXP-<year>-<6 digits>); hours are worked / expected.
 */
export type Payslip = { name: Bi; number: string; contract: 'salarial' | 'horaire'; worked: number; expected: number; net: number; status: 'draft' | 'validated' | 'paid' };
export const PAYROLL = {
  month: 9,
  year: 2026,
  totalNet: 412_600,
  teachers: PEOPLE.teachers,
  slips: [
    { name: TEACHERS.maths, number: 'EXP-2026-000131', contract: 'horaire', worked: 62, expected: 64, net: 18_600, status: 'draft' },
    { name: TEACHERS.arabic, number: 'EXP-2026-000132', contract: 'salarial', worked: 72, expected: 72, net: 21_000, status: 'draft' },
    { name: TEACHERS.french, number: 'EXP-2026-000133', contract: 'horaire', worked: 48, expected: 48, net: 14_400, status: 'validated' },
    { name: TEACHERS.science, number: 'EXP-2026-000134', contract: 'salarial', worked: 64, expected: 64, net: 19_500, status: 'paid' },
  ] as Payslip[],
};

/**
 * « La chèvre a encore frappé », ép. 2 « La copie » (chevre-02): on Tuesday
 * 27 October 2026 Sidi brings home his first maths test, 17/20, and his
 * teacher publishes the grade in the app at 13:10. The parent's notification
 * (grade_published_parent) carries the grade as the API sends it: 17.0 in
 * JSON is the number 17, which the app prints « 17 »; the period is the
 * backend's period_names("trimester1"). Below it in Papa's inbox, read, ép.
 * 1's payment of 12 October: older than a week, the app dates it dd/mm/yyyy.
 */
export const GRADE_TEST = {
  grade: '17',
  subject: { fr: 'Mathématiques', ar: 'الرياضيات' } as Bi,
  period: { fr: '1er trimestre', ar: 'الفصل الأول' } as Bi,
  date: { fr: 'mardi 27 octobre', ar: 'الثلاثاء 27 أكتوبر' } as Bi,
  time: '13:10',
  /** Ép. 1's payment as it now reads in the inbox. */
  earlier: '12/10/2026',
};
