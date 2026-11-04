import { CLASS_ROSTER, PUPIL_CLASS, REPORT_CARD, TEST } from '../../shared/demo';
import type { Bi } from '../../shared/lang';
import type { ChildTerm } from '../../shared/ui/childGrades';
import type { FeesPayment } from '../../shared/ui/fees';

/**
 * The tour's story, on the shared school: École Nour El Ilm in October. Khadi
 * (5e A) is absent from maths on Monday 5 at 08:00; her father pays her
 * October fees at the counter on the 12th at 10:24; her test is published
 * that afternoon; in December the director closes the term and her report
 * card reaches her father's phone.
 *
 * The tour follows Khadi in every chapter: she takes the shared pupil's row
 * in 5e A (and her matricule, her father and her report card).
 */
export const KHADI: Bi = { fr: 'Khadi Mint Ahmed', ar: 'خدي بنت أحمد' };

/**
 * 5e A as the tour lists it: Khadi on the third row. Two shared rows trade
 * places with rows further down, so the rows on screen hold no other
 * Khadi(jetou) and no name too long for the grade entry's card.
 */
const SWAP: Record<number, number> = { 0: 5, 5: 0, 4: 8, 8: 4 };
export const ROSTER: Bi[] = CLASS_ROSTER.map((name, i) => (i === 2 ? KHADI : CLASS_ROSTER[SWAP[i] ?? i]));

/** The maths test with Khadi in class: her 16.5 is the one the teacher types and her father reads. */
export const KHADI_ROW = 2;
export const KHADI_SCORE = 16.5;
export const SCORES: (number | null)[] = TEST.scores.map((s, i) => (i === KHADI_ROW ? KHADI_SCORE : i === 0 ? 13 : s));

export const PAYMENT = { amount: 3000, receipt: 'RCP-2026-000431', invoice: 'INV-2026-000305', date: '12/10/2026', time: '10:24' };

export const feesPayment: FeesPayment = {
  description: { fr: 'Scolarité — Octobre', ar: 'رسوم الدراسة — أكتوبر' },
  student: KHADI,
  invoice: PAYMENT.invoice,
  amount: PAYMENT.amount,
  date: PAYMENT.date,
};

/** Khadi's first term as her father's app shows it: the report card's own numbers. */
export const childTerm: ChildTerm = {
  className: PUPIL_CLASS,
  attendance: 97,
  average: REPORT_CARD.average,
  published: 24,
  subjects: REPORT_CARD.subjects,
};
