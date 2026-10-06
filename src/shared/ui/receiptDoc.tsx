import React from 'react';
import { RECEIPT_PDF } from '../appCopy';
import { FAMILY, FEES_PAYMENT, SCHOOL } from '../demo';
import { useBi, useLang } from '../lang';
import { APP, OUTFIT, pt, SCREEN_H, SCREEN_W, TAJAWAL } from '../tokens';
import { Ionicon } from './Ionicon';

/**
 * The payment receipt the parent downloads from « Frais », opened in the
 * phone's PDF viewer: backend/app/templates/documents/financial.html with
 * document_type "payment_receipt" (pdf_service.py), on an A5 sheet. The
 * header with the school, the title, the number and date, the status; the
 * pupil and receipt panels; the amount paid; the balance left; the signature
 * and the school's stamp; the footer with the reference and the brand.
 *
 * Lengths are the template's, in mm and typographic points, scaled so the
 * 148 mm sheet fills the viewer's width.
 */

const PAGE_W = 360;
const PAGE_H = (PAGE_W * 210) / 148;
/** App points per mm, and per typographic point. */
const K = PAGE_W / 148;
const mm = (n: number) => pt(n * K);
const fs = (n: number) => pt(n * 0.3528 * K);

/** The school's colours (identity.theme): MauriSchool's accent unless the school sets its own. */
const T = { accent: '#465FFF', pale: '#F2F4FF', ink: '#172033', muted: '#667085', line: '#D9DEE8' };

/** Where the sheet starts on screen, and where its title and the amount paid sit (app points), for a camera. */
const BAR = 56;
const PAGE_TOP = 44 + BAR + 16;
export const RECEIPT_TARGETS = { title: PAGE_TOP + 62, amount: PAGE_TOP + 300, page: PAGE_TOP + PAGE_H / 2 };

/** _format_decimal: two decimals, thousands grouped with a plain space. */
const decimal = (n: number) => `${Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${(n % 1).toFixed(2).slice(2)}`;
const mru = (n: number) => (
  <bdi dir="ltr" style={{ unicodeBidi: 'isolate' }}>
    {decimal(n)} MRU
  </bdi>
);
const ltr = (s: string) => (
  <bdi dir="ltr" style={{ unicodeBidi: 'isolate' }}>
    {s}
  </bdi>
);

const InfoRow: React.FC<{ label: string; value: React.ReactNode; last?: boolean }> = ({ label, value, last }) => (
  <div style={{ display: 'flex', padding: `${mm(1)}px 0`, borderBottom: last ? undefined : `${pt(0.5)}px solid #EEF1F5`, gap: mm(1) }}>
    <span style={{ width: '42%', flexShrink: 0, color: T.muted }}>{label}</span>
    <span style={{ flex: 1, textAlign: 'end', fontWeight: 600 }}>{value}</span>
  </div>
);

const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ flex: 1, minWidth: 0, border: `${pt(0.5)}px solid ${T.line}`, padding: mm(3) }}>
    <div style={{ margin: `0 0 ${mm(2)}px`, color: T.muted, fontSize: fs(8.5), fontWeight: 700, textTransform: 'uppercase' }}>{title}</div>
    {children}
  </div>
);

/** A school crest, standing in for the logo a school uploads: an open book under a star. */
const Crest: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="19" fill={T.pale} stroke={T.accent} strokeWidth="1.6" />
    <path d="M 9 25 Q 14 22 20 25 Q 26 22 31 25 L 31 15 Q 26 12 20 15 Q 14 12 9 15 Z" fill="#fff" stroke={T.accent} strokeWidth="1.4" />
    <path d="M 20 15 L 20 25" stroke={T.accent} strokeWidth="1.2" />
    <path d="M 20 5.5 l 1.4 2.9 3.2 .4 -2.3 2.2 .6 3.1 -2.9 -1.5 -2.9 1.5 .6 -3.1 -2.3 -2.2 3.2 -.4 Z" fill={T.accent} />
  </svg>
);

/** The page itself, `PAGE_W` app points wide. */
const Sheet: React.FC = () => {
  const bi = useBi();
  const { rtl, dir } = useLang();
  const L = RECEIPT_PDF;
  const font = rtl ? `${TAJAWAL}, ${OUTFIT}` : `${OUTFIT}, ${TAJAWAL}`;
  return (
    <div
      dir={dir}
      style={{
        position: 'relative',
        width: pt(PAGE_W),
        height: pt(PAGE_H),
        background: '#fff',
        boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
        padding: `${mm(13)}px ${mm(12)}px ${mm(24)}px`,
        boxSizing: 'border-box',
        fontFamily: font,
        fontSize: fs(10.5),
        lineHeight: 1.35,
        color: T.ink,
      }}
    >
      {/* brand-header */}
      <div style={{ display: 'flex', borderBottom: `${pt(1.3)}px solid ${T.accent}`, paddingBottom: mm(5), marginBottom: mm(6) }}>
        <div style={{ width: '62%', display: 'flex', alignItems: 'center', gap: mm(4) }}>
          <Crest size={mm(16)} />
          <div>
            <div dir="ltr" style={{ fontFamily: OUTFIT, fontSize: fs(16), fontWeight: 700, color: T.accent, lineHeight: 1.12, textAlign: 'start' }}>
              {SCHOOL.fr}
            </div>
            <div dir="rtl" style={{ fontFamily: TAJAWAL, fontSize: fs(12.5), fontWeight: 700, textAlign: rtl ? 'start' : 'end' }}>
              {SCHOOL.ar}
            </div>
          </div>
        </div>
        <div style={{ width: '38%', textAlign: 'end' }}>
          <div style={{ margin: `0 0 ${mm(2)}px`, fontSize: fs(17), fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.15 }}>{bi(L.receipt)}</div>
          <div style={{ margin: `${mm(0.7)}px 0` }}>
            <span style={{ color: T.muted }}>{bi(L.number)}</span> <span style={{ fontWeight: 600 }}>{ltr(FEES_PAYMENT.receipt)}</span>
          </div>
          <div style={{ margin: `${mm(0.7)}px 0` }}>
            <span style={{ color: T.muted }}>{bi(L.date)}</span> <span style={{ fontWeight: 600 }}>{ltr(FEES_PAYMENT.date)}</span>
          </div>
          <div style={{ marginTop: mm(2) }}>
            <span
              style={{
                display: 'inline-block',
                color: T.accent,
                border: `${pt(0.5)}px solid ${T.accent}`,
                padding: `${mm(1)}px ${mm(2.5)}px`,
                fontWeight: 700,
                fontSize: fs(8),
                textTransform: 'uppercase',
                letterSpacing: rtl ? 0 : pt(0.3),
              }}
            >
              {bi(L.completed)}
            </span>
          </div>
        </div>
      </div>
      {/* info-grid (compact: 3 mm) */}
      <div style={{ display: 'flex', gap: mm(4), margin: `${mm(3)}px 0` }}>
        <Panel title={bi(L.student)}>
          <InfoRow label={bi(L.student)} value={bi(FAMILY.son)} />
          <InfoRow label={bi(L.code)} value={ltr(FEES_PAYMENT.studentCode)} />
          <InfoRow label={bi(L.payer)} value={bi(FEES_PAYMENT.payer)} last />
        </Panel>
        <Panel title={bi(L.receipt)}>
          <InfoRow label={bi(L.invoiceNumber)} value={ltr(FEES_PAYMENT.invoice)} />
          <InfoRow label={bi(L.method)} value={bi(L.cash)} />
          <InfoRow label={bi(L.processedBy)} value={bi(FEES_PAYMENT.cashier)} last />
        </Panel>
      </div>
      {/* amount-callout */}
      <div style={{ background: T.pale, borderInlineStart: `${pt(0.8)}px solid ${T.accent}`, padding: mm(3), margin: `${mm(3)}px 0`, textAlign: 'center' }}>
        <div style={{ color: T.muted, fontSize: fs(8.5) }}>{bi(L.paid)}</div>
        <div style={{ color: T.accent, fontWeight: 700, fontSize: fs(17) }}>{mru(FEES_PAYMENT.amount)}</div>
      </div>
      {/* totals */}
      <div style={{ width: '48%', marginInlineStart: 'auto', borderTop: `${pt(0.4)}px solid ${T.ink}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: `${mm(0.9)}px 0`, fontSize: fs(12), color: T.accent, borderBottom: `${pt(0.8)}px solid ${T.accent}` }}>
          <span>{bi(L.balanceAfter)}</span>
          <span style={{ fontWeight: 600 }}>{mru(0)}</span>
        </div>
      </div>
      {/* signature-area: the signature and the school's stamp, as a school uploads them */}
      <div style={{ display: 'flex', marginTop: mm(4) }}>
        {[L.signature, L.stamp].map((label, i) => (
          <div key={i} style={{ width: '50%', padding: `0 ${mm(8)}px`, textAlign: 'center', boxSizing: 'border-box' }}>
            <div style={{ height: mm(18), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i === 0 ? (
                <svg width={mm(26)} height={mm(12)} viewBox="0 0 100 46">
                  <path d="M 4 34 C 14 6 22 6 20 30 C 18 44 30 20 38 14 C 44 10 40 36 48 30 C 56 24 58 18 64 26 C 70 34 78 20 96 16" stroke="#1d3fae" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width={mm(17)} height={mm(17)} viewBox="0 0 60 60" style={{ rotate: '-12deg', opacity: 0.75 }}>
                  <circle cx="30" cy="30" r="27" fill="none" stroke="#6b3fa0" strokeWidth="2.5" />
                  <circle cx="30" cy="30" r="20" fill="none" stroke="#6b3fa0" strokeWidth="1.2" />
                  <text x="30" y="34" fontSize="11" fontFamily={OUTFIT} fontWeight={700} fill="#6b3fa0" textAnchor="middle">
                    NOUR
                  </text>
                </svg>
              )}
            </div>
            <div style={{ borderTop: `${pt(0.4)}px solid ${T.ink}`, paddingTop: mm(1.5), fontSize: fs(9) }}>{bi(label)}</div>
          </div>
        ))}
      </div>
      {/* The running footer, in the bottom margin: the reference, the page, the brand. Arabic swaps the two sides. */}
      <div
        style={{
          position: 'absolute',
          left: mm(12),
          right: mm(12),
          bottom: mm(24) - mm(8),
          display: 'flex',
          direction: 'ltr',
          borderTop: `${pt(0.4)}px solid ${T.line}`,
          paddingTop: mm(1.5),
          fontSize: fs(6.8),
          color: T.muted,
        }}
      >
        {(() => {
          const reference = <span style={{ width: '46%', textAlign: 'left' }}>{FEES_PAYMENT.receipt}</span>;
          const brand = (
            <span dir={dir} style={{ width: '40%', textAlign: rtl ? 'left' : 'right' }}>
              {bi(L.generatedWith)} <span style={{ fontFamily: OUTFIT, fontWeight: 700, color: APP.brand[500] }}>MauriSchool</span>
            </span>
          );
          return (
            <>
              {rtl ? brand : reference}
              <span style={{ width: '14%', textAlign: 'center' }}>1 / 1</span>
              {rtl ? <span style={{ width: '46%', textAlign: 'right' }}>{FEES_PAYMENT.receipt}</span> : brand}
            </>
          );
        })()}
      </div>
    </div>
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
