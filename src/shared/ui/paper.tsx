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

/** Where the goat bites: on the full sheet, the middle of its left edge; on the scrap, its torn left edge. */
export const SHEET_BITE = { full: [0, 70] as [number, number], scrap: [54, 70] as [number, number] };

/** What is left once she has had most of it: the heading and the serial's last four digits, torn all round. */
const SCRAP = '54,6 166,0 174,20 160,42 172,62 156,86 130,92 104,84 80,94 56,90 50,70';

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
 * piece a goat leaves.
 */
export const ReceiptSheet: React.FC<{ scrap?: boolean; bitten?: boolean }> = ({ scrap = false, bitten = false }) => {
  const bi = useBi();
  const { lang, rtl } = useLang();
  const print = rtl ? TAJAWAL : OUTFIT;
  const pen = chalkFont(lang);
  const id = `sheet${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [bx, by] = bitten ? SHEET_BITE[scrap ? 'scrap' : 'full'] : [0, 0];
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
  const outline = scrap ? `M ${SCRAP.split(' ').join(' L ')} Z` : `M 0 0 L ${SHEET.w} 0 L ${SHEET.w} ${SHEET.h} L 0 ${SHEET.h} Z`;
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
