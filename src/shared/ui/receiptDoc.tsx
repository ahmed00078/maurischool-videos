import React from 'react';
import { FAMILY, FEES_PAYMENT } from '../demo';
import { useBi, useLang } from '../lang';
import { OUTFIT, pt, SCREEN_H, SCREEN_W } from '../tokens';
import { ReceiptSheet } from './documents';
import { Ionicon } from './Ionicon';

/**
 * The payment receipt the parent downloads from « Frais », opened in the
 * phone's PDF viewer: the A5 sheet the backend prints since October 2026
 * (documents.tsx: ReceiptSheet), in the school's own colour, filling the
 * viewer's width.
 */

const PAGE_W = 360;
const PAGE_H = (PAGE_W * 210) / 148;
/** App points per mm of the sheet. */
const K = PAGE_W / 148;

/**
 * Where the sheet starts on screen and where its blocks sit (app points from
 * the top of the screen), for a camera: the title, the amount received, the
 * middle of what is printed (masthead to seal), the page.
 */
const BAR = 56;
const PAGE_TOP = 44 + BAR + 16;
export const RECEIPT_TARGETS = {
  title: PAGE_TOP + 35 * K,
  amount: PAGE_TOP + 58 * K,
  body: PAGE_TOP + 70 * K,
  page: PAGE_TOP + PAGE_H / 2,
};

/** Sidi's October payment on the sheet. */
const Sheet: React.FC = () => {
  const bi = useBi();
  const { lang } = useLang();
  return (
    <ReceiptSheet
      width={pt(PAGE_W)}
      lang={lang}
      data={{
        number: FEES_PAYMENT.receipt,
        date: FEES_PAYMENT.date,
        time: FEES_PAYMENT.time,
        invoice: FEES_PAYMENT.invoice,
        amount: FEES_PAYMENT.amount,
        student: bi(FAMILY.son),
        code: FEES_PAYMENT.studentCode,
        payer: bi(FEES_PAYMENT.payer),
        cashier: bi(FEES_PAYMENT.cashier),
      }}
      style={{ boxShadow: '0 12px 30px rgba(0,0,0,0.35)' }}
    />
  );
};

/**
 * The phone's PDF viewer with the receipt open: a dark bar with the file's
 * name and share, the sheet on grey. `open` (0 to 1) brings the sheet up.
 */
export const ReceiptPdfScreen: React.FC<{ open?: number }> = ({ open = 1 }) => (
  <div style={{ position: 'absolute', inset: 0, width: SCREEN_W, height: SCREEN_H, background: '#3c4043', overflow: 'hidden' }}>
    <div
      style={{
        position: 'absolute',
        top: pt(44),
        left: 0,
        right: 0,
        height: pt(BAR),
        display: 'flex',
        alignItems: 'center',
        gap: pt(14),
        padding: `0 ${pt(14)}px`,
        background: '#2b2e31',
        color: '#e8eaed',
        fontFamily: OUTFIT,
        direction: 'ltr',
      }}
    >
      <Ionicon name="arrow-back" size={pt(22)} color="#e8eaed" />
      <Ionicon name="document-outline" size={pt(18)} color="#e8eaed" />
      <span style={{ flex: 1, minWidth: 0, fontSize: pt(15), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>recu_5c1e9a0b-7d42-4f1e-9b3a-0412c8e1f7d2.pdf</span>
      <Ionicon name="share-social-outline" size={pt(20)} color="#e8eaed" />
      <Ionicon name="ellipsis-vertical" size={pt(20)} color="#e8eaed" />
    </div>
    <div
      style={{
        position: 'absolute',
        top: pt(PAGE_TOP),
        left: pt((390 - PAGE_W) / 2),
        opacity: Math.min(1, open * 1.5),
        translate: `0px ${(1 - open) * pt(60)}px`,
        scale: String(0.94 + 0.06 * open),
      }}
    >
      <Sheet />
    </div>
    <div
      style={{
        position: 'absolute',
        bottom: pt(28),
        left: '50%',
        translate: '-50% 0',
        padding: `${pt(4)}px ${pt(12)}px`,
        borderRadius: 999,
        background: 'rgba(0,0,0,0.55)',
        color: '#e8eaed',
        fontFamily: OUTFIT,
        fontSize: pt(12),
      }}
    >
      1 / 1
    </div>
  </div>
);
