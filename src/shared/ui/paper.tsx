import React from 'react';
import { FEES_PAYMENT, SCHOOL } from '../demo';
import { useBi, useLang } from '../lang';
import { OUTFIT, TAJAWAL } from '../tokens';
import { chalkFont } from './Chalkboard';

/**
 * Paper, the way schools still do it: a sheet torn from a carbon receipt book
 * (printed heading, a red pre-printed serial, the rest in blue ballpoint) and
 * the cash envelope a parent brings to the counter.
 *
 * The sheet is drawn in its own 200 × 140 units as an SVG group, so the same
 * drawing goes in a hand (<PaperReceipt>) or in the goat's mouth (<Goat paper>).
 * The book's serial is the app receipt's last digits (FEES_PAYMENT.serial).
 */

export const SHEET = { w: 200, h: 140 } as const;

/** Where the goat bites: on the full sheet, the middle of its left edge; on the scrap or the crumb, its torn left edge. */
export const SHEET_BITE = { full: [0, 70] as [number, number], scrap: [54, 70] as [number, number], crumb: [98, 70] as [number, number] };

/** What is left once she has had most of it: the heading and the serial's last four digits, torn all round. */
const SCRAP = '54,6 166,0 174,20 160,42 172,62 156,86 130,92 104,84 80,94 56,90 50,70';
/** A month of chewing later: the serial's last two digits. */
const CRUMB = '102,52 124,45 148,49 166,44 172,62 160,76 166,88 140,93 118,86 102,90 96,70';

const INK = { print: '#24407a', serial: '#d4262c', pen: '#1d3fae', paper: '#fbf5d6', edge: '#e2d6a4' };

/** In SVG, text-anchor follows `direction`: with rtl, "start" is the right end. */
/** Printed in the book: the heading (« REÇU N° »), the line labels. Written on it: the rest. */
const WORDS = {
  heading: { fr: 'REÇU N°', ar: 'وصل رقم' },
  from: { fr: 'Reçu de :', ar: 'استلمنا من:' },
  sum: { fr: 'Somme :', ar: 'المبلغ:' },
  date: { fr: 'Date :', ar: 'التاريخ:' },
  amount: { fr: `${FEES_PAYMENT.amountText} MRU`, ar: `${FEES_PAYMENT.amountText} أوقية` },
};

/**
 * The receipt, as an SVG group in sheet units with (0, 0) at its top-left, or
 * at its bite point with `bitten` (for the goat). `scrap` keeps only the torn
 * piece a goat leaves; `'crumb'`, what is left of that.
 */
export const ReceiptSheet: React.FC<{ scrap?: boolean | 'crumb'; bitten?: boolean }> = ({ scrap = false, bitten = false }) => {
  const bi = useBi();
  const { lang, rtl } = useLang();
  const print = rtl ? TAJAWAL : OUTFIT;
  const pen = chalkFont(lang);
  const id = `sheet${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [bx, by] = bitten ? SHEET_BITE[scrap === 'crumb' ? 'crumb' : scrap ? 'scrap' : 'full'] : [0, 0];
  // Arabic lines start on the right: labels at the right edge, the writing to their left.
  const line = (y: number, label: string, value: string) =>
    rtl ? (
      <g key={y}>
        <text x={190} y={y} fontSize="10" fontFamily={print} fontWeight={700} fill={INK.print} textAnchor="start" direction="rtl">
          {label}
        </text>
        <line x1={14} x2={132} y1={y + 3} y2={y + 3} stroke={INK.print} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
        <text x={126} y={y - 1} fontSize="17" fontFamily={pen} fill={INK.pen} textAnchor="start" direction="rtl">
          {value}
        </text>
      </g>
    ) : (
      <g key={y}>
        <text x={12} y={y} fontSize="10" fontFamily={print} fontWeight={600} fill={INK.print}>
          {label}
        </text>
        <line x1={58} x2={188} y1={y + 3} y2={y + 3} stroke={INK.print} strokeWidth="0.8" strokeDasharray="2 2" opacity="0.6" />
        <text x={64} y={y - 1} fontSize="17" fontFamily={pen} fill={INK.pen}>
          {value}
        </text>
      </g>
    );
  const outline = scrap ? `M ${(scrap === 'crumb' ? CRUMB : SCRAP).split(' ').join(' L ')} Z` : `M 0 0 L ${SHEET.w} 0 L ${SHEET.w} ${SHEET.h} L 0 ${SHEET.h} Z`;
  return (
    <g transform={`translate(${-bx} ${-by})`}>
      <defs>
        <clipPath id={id}>
          <path d={outline} />
        </clipPath>
      </defs>
      <path d={outline} fill={INK.paper} stroke={INK.edge} strokeWidth="1.5" strokeLinejoin="round" />
      <g clipPath={`url(#${id})`}>
        {/* A faint ruled grid, as receipt books have */}
        {[46, 88, 106, 124].map((y) => (
          <line key={y} x1="0" x2={SHEET.w} y1={y} y2={y} stroke="#e9dfb4" strokeWidth="1" />
        ))}
        <text
          x={rtl ? 148 : 62}
          y={31}
          fontSize="21"
          fontFamily={print}
          fontWeight={800}
          fill={INK.print}
          textAnchor="start"
          direction={rtl ? 'rtl' : 'ltr'}
          letterSpacing={rtl ? 0 : 1}
        >
          {bi(WORDS.heading)}
        </text>
        {/* The pre-printed serial, in red, always left to right */}
        <text x={14} y={78} fontSize="34" fontFamily={OUTFIT} fontWeight={700} fill={INK.serial} letterSpacing="2" direction="ltr">
          {FEES_PAYMENT.serial}
        </text>
        <text x={rtl ? 12 : 188} y={16} fontSize="7" fontFamily={print} fill={INK.print} textAnchor={rtl ? 'start' : 'end'} opacity="0.8">
          {bi(SCHOOL)}
        </text>
        {line(102, bi(WORDS.from), bi(FEES_PAYMENT.payer))}
        {line(120, bi(WORDS.sum), bi(WORDS.amount))}
        {line(136, bi(WORDS.date), FEES_PAYMENT.date)}
        {/* The school's round stamp, pressed a little crooked over the date */}
        <g transform={`rotate(-14 ${rtl ? 36 : 162} 116)`} opacity="0.55">
          <circle cx={rtl ? 36 : 162} cy={116} r="19" fill="none" stroke="#6b3fa0" strokeWidth="2" />
          <circle cx={rtl ? 36 : 162} cy={116} r="14" fill="none" stroke="#6b3fa0" strokeWidth="1" />
          <text x={rtl ? 36 : 162} y={119} fontSize="7" fontFamily={OUTFIT} fontWeight={700} fill="#6b3fa0" textAnchor="middle">
            NOUR
          </text>
        </g>
      </g>
      {scrap ? (
        // Chewed edges: a darker rim along the tear.
        <path d={outline} fill="none" stroke="#c9b97c" strokeWidth="2.5" strokeDasharray="3 2" opacity="0.7" />
      ) : null}
    </g>
  );
};

/** The receipt on its own, `width` px wide (in a hand, on a counter). */
export const PaperReceipt: React.FC<{ width: number; scrap?: boolean; style?: React.CSSProperties }> = ({ width, scrap, style }) => (
  <svg width={width} height={(width * SHEET.h) / SHEET.w} viewBox={`0 0 ${SHEET.w} ${SHEET.h}`} style={{ overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(40,25,10,0.3))', ...style }}>
    <ReceiptSheet scrap={scrap} />
  </svg>
);

/**
 * The fees envelope a father brings to the counter, 96 × 70 units like the
 * one in his pocket (people.tsx), with banknotes showing at the flap.
 */
export const Envelope: React.FC<{ width: number; label?: string; labelFont?: string; style?: React.CSSProperties }> = ({ width, label, labelFont, style }) => (
  <svg width={width} height={(width * 70) / 96} viewBox="0 0 96 70" style={{ overflow: 'visible', filter: 'drop-shadow(0 6px 10px rgba(40,25,10,0.3))', ...style }}>
    <rect x="10" y="-10" width="70" height="30" rx="2" fill="#6fae7c" transform="rotate(-6 45 5)" />
    <rect x="18" y="-6" width="68" height="28" rx="2" fill="#8bb8d8" transform="rotate(5 52 8)" />
    <rect x="0" y="0" width="96" height="70" rx="5" fill="#fdfbf4" stroke="#d9d2bd" strokeWidth="3" />
    <path d="M 0 0 L 48 35 L 96 0" stroke="#d9d2bd" strokeWidth="3" fill="none" />
    {label ? (
      <text x="48" y="58" fontSize={label.length > 10 ? 12 : 15} fontWeight={700} fill="#3a3a52" textAnchor="middle" fontFamily={labelFont}>
        {label}
      </text>
    ) : null}
  </svg>
);

/**
 * A marked test on a school « copie »: lined paper with a red margin, the
 * pupil's name and the heading in blue ballpoint, the teacher's red mark
 * circled at the top and « Très bien ! » under it, the working below with a
 * red tick. Drawn in its own 220 × 300 units, like the receipt, so it goes in
 * a hand (<PaperTest>) or in the goat's mouth (<Goat paper>). The mark stays
 * at the top right in both languages, Western digits, as a teacher writes it.
 */
export const TEST_SHEET = { w: 220, h: 300 } as const;

/** Where the goat bites: the whole sheet's left edge by the mark, or the torn left edge of what she leaves. */
export const TEST_BITE = { full: [0, 106] as [number, number], scrap: [100, 132] as [number, number] };

/** What she leaves: the mark and « Très bien ! », torn all round. */
const TEST_SCRAP = '100,64 132,58 160,66 190,56 218,62 214,92 220,118 208,150 180,144 150,152 124,146 104,150 98,126';

export type TestWords = { name: string; heading: string; mark: string; praise: string; work: string[] };

const RED = '#d4262c';

/** The test as an SVG group in sheet units, (0, 0) at its top-left, or at its bite point with `bitten`. */
export const TestSheet: React.FC<{ words: TestWords; scrap?: boolean; bitten?: boolean }> = ({ words, scrap = false, bitten = false }) => {
  const { lang, rtl } = useLang();
  const pen = chalkFont(lang);
  const id = `test${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [bx, by] = bitten ? TEST_BITE[scrap ? 'scrap' : 'full'] : [0, 0];
  const outline = scrap ? `M ${TEST_SCRAP.split(' ').join(' L ')} Z` : `M 0 0 L ${TEST_SHEET.w} 0 L ${TEST_SHEET.w} ${TEST_SHEET.h} L 0 ${TEST_SHEET.h} Z`;
  const margin = rtl ? 192 : 28;
  const textX = rtl ? 184 : 36;
  const anchor = 'start';
  const dir = rtl ? 'rtl' : 'ltr';
  return (
    <g transform={`translate(${-bx} ${-by})`}>
      <defs>
        <clipPath id={id}>
          <path d={outline} />
        </clipPath>
      </defs>
      <path d={outline} fill="#fdfdf7" stroke="#d9dcd2" strokeWidth="1.5" strokeLinejoin="round" />
      <g clipPath={`url(#${id})`}>
        {Array.from({ length: 22 }, (_, i) => 62 + i * 11).map((y) => (
          <line key={y} x1="0" x2={TEST_SHEET.w} y1={y} y2={y} stroke="#c3d6ee" strokeWidth="0.9" />
        ))}
        <line x1={margin} x2={margin} y1="0" y2={TEST_SHEET.h} stroke="#ef8f8f" strokeWidth="1.2" />
        {/* The name and the heading, in blue ballpoint */}
        <text x={textX} y={24} fontSize={rtl ? 15 : 17} fontFamily={pen} fill="#1d3fae" textAnchor={anchor} direction={dir}>
          {words.name}
        </text>
        <text x={textX} y={46} fontSize={rtl ? 15 : 18} fontFamily={pen} fontWeight={700} fill="#1d3fae" textAnchor={anchor} direction={dir}>
          {words.heading}
        </text>
        <line x1={rtl ? 74 : 36} x2={rtl ? 184 : 146} y1={51} y2={51} stroke="#1d3fae" strokeWidth="1.2" />
        {/* The working, with the teacher's tick */}
        {words.work.map((w, i) => {
          // Sums read left to right in both languages; in Arabic they sit at the right margin like the words.
          const sum = /[=×+]/.test(w);
          return (
            <text
              key={i}
              x={textX + (rtl ? -4 : 4) * (i % 2)}
              y={172 + i * 22}
              fontSize={16}
              fontFamily={sum ? CAVEAT_MARK : pen}
              fill="#1d3fae"
              textAnchor={rtl && sum ? 'end' : anchor}
              direction={sum ? 'ltr' : dir}
            >
              {w}
            </text>
          );
        })}
        <path d={rtl ? 'M 40 196 l 8 8 l 16 -18' : 'M 150 196 l 8 8 l 16 -18'} stroke={RED} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={rtl ? 'M 40 262 l 8 8 l 16 -18' : 'M 150 262 l 8 8 l 16 -18'} stroke={RED} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* The mark, circled, and the praise: always left to right, top right */}
        <g transform="rotate(-7 162 96)">
          <text x={162} y={112} fontSize="46" fontFamily={CAVEAT_MARK} fontWeight={700} fill={RED} textAnchor="middle" direction="ltr">
            {words.mark}
          </text>
          <ellipse cx="162" cy="96" rx="50" ry="30" fill="none" stroke={RED} strokeWidth="3" />
        </g>
        <text x={160} y={142} fontSize={rtl ? 17 : 20} fontFamily={pen} fontWeight={700} fill={RED} textAnchor="middle" transform="rotate(-4 160 138)" direction={dir}>
          {words.praise}
        </text>
      </g>
      {scrap ? <path d={outline} fill="none" stroke="#c7c9bd" strokeWidth="2.5" strokeDasharray="3 2" opacity="0.8" /> : null}
    </g>
  );
};

/** The handwriting the mark is in, the same in both cuts (digits). */
const CAVEAT_MARK = chalkFont('fr');

/** The test on its own, `width` px wide (in a hand). */
export const PaperTest: React.FC<{ words: TestWords; width: number; style?: React.CSSProperties }> = ({ words, width, style }) => (
  <svg
    width={width}
    height={(width * TEST_SHEET.h) / TEST_SHEET.w}
    viewBox={`0 0 ${TEST_SHEET.w} ${TEST_SHEET.h}`}
    style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 14px rgba(40,25,10,0.3))', ...style }}
  >
    <TestSheet words={words} />
  </svg>
);
