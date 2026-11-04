import React from 'react';
import { CLASS_SIZE, PUPIL, PUPIL_CLASS, PUPIL_CODE, REPORT_CARD, SCHOOL, SCHOOL_IDENTITY, YEAR } from '../demo';
import type { Bi } from '../lang';
import { APP, OUTFIT, TAJAWAL } from '../tokens';

/**
 * The school's documents in the layout the backend prints since October 2026
 * (backend/app/templates/documents: base.css, _official_header.html,
 * report_card.html, _seal.html, _footer.html): the school's own colour on the
 * header rule, its name and the table heads; the accent tick over the title;
 * hairline tables; one stamp-and-sign zone; the one-line footer. Official
 * academic documents add a frame in the school colour and the logo as a faint
 * watermark.
 *
 * Lengths are the templates', in mm and typographic points, scaled to the
 * sheet's width. The report card is bilingual on one sheet, whatever the
 * viewer's language, as the backend prints it.
 */

const mixWithWhite = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - k) + 255 * k);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
};

/** DocumentTheme.from_color: the accent, its soft and pale tints, and the fixed ink, muted and line greys. */
export const documentTheme = (accent: string = SCHOOL_IDENTITY.accent) => ({
  accent,
  soft: mixWithWhite(accent, 0.82),
  pale: mixWithWhite(accent, 0.93),
  ink: '#172033',
  muted: '#667085',
  line: '#EAECF0',
  lineStrong: '#D0D5DD',
  faint: '#98A2B3',
});

/** _format_decimal: two decimals. */
const dec = (n: number) => n.toFixed(2);

/** A school crest, standing in for the logo a school uploads: an open book under a star. */
export const Crest: React.FC<{ size: number; accent?: string; opacity?: number }> = ({ size, accent = SCHOOL_IDENTITY.accent, opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ opacity, display: 'block' }}>
    <circle cx="20" cy="20" r="19" fill={mixWithWhite(accent, 0.93)} stroke={accent} strokeWidth="1.6" />
    <path d="M 9 25 Q 14 22 20 25 Q 26 22 31 25 L 31 15 Q 26 12 20 15 Q 14 12 9 15 Z" fill="#fff" stroke={accent} strokeWidth="1.4" />
    <path d="M 20 15 L 20 25" stroke={accent} strokeWidth="1.2" />
    <path d="M 20 5.5 l 1.4 2.9 3.2 .4 -2.3 2.2 .6 3.1 -2.9 -1.5 -2.9 1.5 .6 -3.1 -2.3 -2.2 3.2 -.4 Z" fill={accent} />
  </svg>
);

/** The stamp and signature a school uploads once: a round seal and a pen stroke, in stamp-pad blue. */
const Seal: React.FC<{ height: number }> = ({ height }) => (
  <svg height={height} viewBox="0 0 150 70" style={{ display: 'block', margin: '0 auto' }}>
    <g transform="rotate(-9 38 35)" fill="none" stroke="#2b4ea8" opacity="0.82">
      <circle cx="38" cy="35" r="30" strokeWidth="2.2" />
      <circle cx="38" cy="35" r="23" strokeWidth="1" />
      <path d="M 38 23 l 2.6 5.3 5.9 .8 -4.3 4.1 1 5.8 -5.2 -2.8 -5.2 2.8 1 -5.8 -4.3 -4.1 5.9 -.8 Z" fill="#2b4ea8" stroke="none" />
      <path d="M 24 48 h 28" strokeWidth="1.6" />
    </g>
    <path d="M 70 48 C 82 20, 92 22, 88 40 C 85 54, 100 30, 108 28 C 116 26, 108 46, 118 42 C 126 39, 132 30, 144 34" fill="none" stroke="#1b2a5c" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * The report card, A4 portrait, `width` pixels wide: the pupil's first term.
 * `accent` is the school's colour; a school that sets none prints in
 * MauriSchool's. `appreciation` is the teacher's own words, as typed.
 */
export const ReportCardSheet: React.FC<{ width: number; accent?: string; appreciation?: string; pupil?: Bi; style?: React.CSSProperties }> = ({ width, accent, appreciation = REPORT_CARD.appreciation.fr, pupil = PUPIL, style }) => {
  const T = documentTheme(accent);
  const K = width / 210;
  const mm = (n: number) => n * K;
  const fs = (n: number) => n * 0.3528 * K;
  const R = REPORT_CARD;
  const sans = `${OUTFIT}, ${TAJAWAL}`;
  const arabic = `${TAJAWAL}, ${OUTFIT}`;
  const rtl: React.CSSProperties = { direction: 'rtl', fontFamily: arabic, unicodeBidi: 'isolate' };
  const label: React.CSSProperties = { display: 'block', color: T.muted, fontSize: fs(6), fontWeight: 600, letterSpacing: fs(0.45), textTransform: 'uppercase', lineHeight: 1.3 };
  const value: React.CSSProperties = { display: 'block', fontSize: fs(8.4), fontWeight: 600, lineHeight: 1.35 };
  const sub: React.CSSProperties = { display: 'block', color: T.muted, fontSize: fs(7), lineHeight: 1.35 };
  const th: React.CSSProperties = { padding: `0 ${mm(1.8)}px ${mm(1.5)}px`, borderBottom: `${fs(0.7)}px solid ${T.accent}`, color: T.accent, fontSize: fs(5.9), fontWeight: 600, letterSpacing: fs(0.4), textTransform: 'uppercase', textAlign: 'start', verticalAlign: 'bottom' };
  const td: React.CSSProperties = { padding: `${mm(1.35)}px ${mm(1.8)}px`, borderBottom: `${fs(0.4)}px solid ${T.line}`, verticalAlign: 'top' };
  const reference = `${SCHOOL_IDENTITY.code}-BUL-${YEAR}-${R.periodCode}-${PUPIL_CODE}`;
  const counts: [number, string, string][] = [
    [R.attendance.unexcused, 'Absences non justifiées', 'غياب غير مبرر'],
    [R.attendance.excused, 'Absences justifiées', 'غياب مبرر'],
    [R.attendance.late, 'Retards', 'التأخر'],
  ];
  return (
    <div style={{ position: 'relative', width, height: (width * 297) / 210, background: '#fff', color: T.ink, fontFamily: sans, fontSize: fs(7.8), lineHeight: 1.4, direction: 'ltr', textAlign: 'left', overflow: 'hidden', ...style }}>
      {/* The frame in the school colour, on the page's margin box */}
      <div style={{ position: 'absolute', left: mm(12), right: mm(12), top: mm(10), bottom: mm(15), border: `${fs(0.8)}px solid ${T.accent}`, padding: `${mm(5)}px ${mm(6)}px`, boxSizing: 'border-box' }}>
        {/* The watermark */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: mm(64), display: 'flex', justifyContent: 'center' }}>
          <Crest size={mm(110)} accent={T.accent} opacity={0.06} />
        </div>
        <div style={{ position: 'relative' }}>
          {/* official-header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: mm(4), paddingBottom: mm(3), borderBottom: `${fs(1.4)}px solid ${T.accent}` }}>
            <div style={{ width: '36%', fontSize: fs(7), lineHeight: 1.45, color: T.muted }}>
              {SCHOOL_IDENTITY.headerFr.map((l, i) => (
                <div key={i} style={i === 0 ? { color: T.ink, fontWeight: 600 } : undefined}>{l}</div>
              ))}
            </div>
            <div style={{ width: '28%', textAlign: 'center', alignSelf: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Crest size={mm(15)} accent={T.accent} />
              </div>
              <div style={{ marginTop: mm(1), fontSize: fs(8), fontWeight: 700, lineHeight: 1.25, color: T.accent }}>{SCHOOL.fr}</div>
              <div style={{ ...rtl, fontSize: fs(7.4), fontWeight: 600, color: T.muted, lineHeight: 1.3, textAlign: 'center' }}>{SCHOOL.ar}</div>
              <div style={{ marginTop: mm(0.4), color: T.accent, fontSize: fs(6.6), fontStyle: 'italic', lineHeight: 1.3 }}>{SCHOOL_IDENTITY.motto.fr}</div>
            </div>
            <div style={{ ...rtl, width: '36%', fontSize: fs(7), lineHeight: 1.45, color: T.muted, textAlign: 'right' }}>
              {SCHOOL_IDENTITY.headerAr.map((l, i) => (
                <div key={i} style={i === 0 ? { color: T.ink, fontWeight: 600 } : undefined}>{l}</div>
              ))}
            </div>
          </div>
          {/* official-title */}
          <div style={{ textAlign: 'center', margin: `${mm(1)}px 0 ${mm(4)}px` }}>
            <div style={{ width: mm(11), height: mm(1.2), borderRadius: mm(0.6), background: T.accent, margin: `0 auto ${mm(2)}px` }} />
            <div style={{ fontSize: fs(14), fontWeight: 700, lineHeight: 1.15 }}>Bulletin de notes</div>
            <div style={{ ...rtl, fontSize: fs(12), fontWeight: 700, textAlign: 'center' }}>كشف الدرجات</div>
            <div style={{ marginTop: mm(1), color: T.muted, fontSize: fs(7.6) }}>
              {R.period.fr} · <span style={rtl}>{R.period.ar}</span> · {YEAR}
            </div>
          </div>
          {/* student */}
          <div style={{ display: 'flex', marginBottom: mm(4), padding: `${mm(2.2)}px 0`, borderTop: `${fs(0.6)}px solid ${T.accent}`, borderBottom: `${fs(0.4)}px solid ${T.line}` }}>
            <div style={{ width: '38%', paddingRight: mm(4), boxSizing: 'border-box' }}>
              <span style={label}>Élève · <span style={rtl}>التلميذ</span></span>
              <span style={value}>{pupil.fr}</span>
              <span style={{ ...sub, ...rtl, textAlign: 'left' }}>{pupil.ar}</span>
            </div>
            {[
              ['Matricule', 'الرقم', PUPIL_CODE, ''],
              ['Classe', 'القسم', PUPIL_CLASS.fr, PUPIL_CLASS.ar],
              ['Année', 'السنة', YEAR, ''],
            ].map(([l, la, v, va]) => (
              <div key={l} style={{ flex: 1, paddingRight: mm(4) }}>
                <span style={label}>{l} · <span style={rtl}>{la}</span></span>
                <span style={value}>{v}</span>
                {va ? <span style={{ ...sub, ...rtl, textAlign: 'left' }}>{va}</span> : null}
              </div>
            ))}
          </div>
          {/* The subjects */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fs(7.4), lineHeight: 1.35 }}>
            <thead>
              <tr>
                <th style={{ ...th, width: '34%', paddingLeft: 0 }}>Matière</th>
                <th style={{ ...th, width: '11%', textAlign: 'center' }}>Coef.<br /><span style={rtl}>المعامل</span></th>
                <th style={{ ...th, width: '14%', textAlign: 'right' }}>Moyenne /20<br /><span style={rtl}>المعدل</span></th>
                <th style={{ ...th, width: '13%', textAlign: 'right' }}>Points<br /><span style={rtl}>النقاط</span></th>
                <th style={{ ...th, width: '28%', textAlign: 'right', paddingRight: 0, color: T.muted }}><span style={rtl}>المادة</span></th>
              </tr>
            </thead>
            <tbody>
              {R.subjects.map((s, i) => {
                const last = i === R.subjects.length - 1;
                const cell: React.CSSProperties = { ...td, borderBottom: last ? `${fs(0.7)}px solid ${T.lineStrong}` : td.borderBottom };
                return (
                  <tr key={s.name.fr}>
                    <td style={{ ...cell, paddingLeft: 0, fontWeight: 600 }}>{s.name.fr}</td>
                    <td style={{ ...cell, textAlign: 'center' }}>{dec(s.coefficient)}</td>
                    <td style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>{dec(s.average)}</td>
                    <td style={{ ...cell, textAlign: 'right' }}>{dec(s.average * s.coefficient)}</td>
                    <td style={{ ...cell, ...rtl, textAlign: 'right', paddingRight: 0, color: T.muted }}>{s.name.ar}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* results */}
          <div style={{ display: 'flex', marginTop: mm(4) }}>
            <div style={{ width: '34%', padding: `${mm(2.6)}px ${mm(3)}px ${mm(2.6)}px 0`, boxSizing: 'border-box' }}>
              <span style={label}>Moyenne générale · <span style={rtl}>المعدل العام</span></span>
              <div style={{ fontSize: fs(17), fontWeight: 700, lineHeight: 1.1, color: T.accent, whiteSpace: 'nowrap' }}>
                {dec(R.average)}
                <span style={{ fontSize: fs(10), color: T.muted }}> / 20</span>
              </div>
            </div>
            <div style={{ width: '22%', padding: `${mm(2.6)}px ${mm(3)}px`, borderLeft: `${fs(0.6)}px solid ${T.line}`, boxSizing: 'border-box' }}>
              <span style={label}>Rang · <span style={rtl}>الترتيب</span></span>
              <div style={{ fontSize: fs(12), fontWeight: 700, lineHeight: 1.15, whiteSpace: 'nowrap' }}>
                {R.rank} <span style={{ fontSize: fs(8), color: T.muted }}>/ {CLASS_SIZE}</span>
              </div>
            </div>
            <div style={{ flex: 1, padding: `${mm(2.6)}px 0 ${mm(2.6)}px ${mm(3)}px`, borderLeft: `${fs(0.6)}px solid ${T.line}` }}>
              <span style={label}>
                Assiduité · <span style={rtl}>المواظبة</span> <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>({R.attendance.period})</span>
              </span>
              <div style={{ display: 'flex', marginTop: mm(0.8) }}>
                {counts.map(([n, fr, ar]) => (
                  <div key={fr} style={{ width: '33%' }}>
                    <div style={{ fontSize: fs(12), fontWeight: 700, lineHeight: 1.15 }}>{n}</div>
                    <div style={{ color: T.muted, fontSize: fs(6.4), lineHeight: 1.35 }}>
                      {fr}
                      <br />
                      <span style={rtl}>{ar}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* appreciation */}
          <div style={{ marginTop: mm(3.5), paddingTop: mm(2.4), borderTop: `${fs(0.4)}px solid ${T.line}`, fontSize: fs(7.6) }}>
            <span style={label}>Appréciation · <span style={rtl}>الملاحظة</span></span>
            <span dir="auto" style={{ fontFamily: `${OUTFIT}, ${TAJAWAL}` }}>{appreciation}</span>
          </div>
          {/* closing: issued, reference, the stamp-and-sign zone */}
          <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: mm(4) }}>
            <div style={{ flex: 1, color: T.muted, fontSize: fs(6.8) }}>
              Édité le {R.issued} · <span style={rtl}>صدر بتاريخ</span> {R.issued}
              <br />
              Référence · <span style={rtl}>المرجع</span> : {reference}
            </div>
            <div style={{ width: mm(62) }}>
              <span style={{ ...label, marginBottom: mm(1.2) }}>Cachet et signature · <span style={rtl}>الختم والتوقيع</span></span>
              <div style={{ height: mm(22), border: `${fs(0.6)}px dashed ${T.lineStrong}`, borderRadius: mm(1.6), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Seal height={mm(19.5)} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* The footer, in the page's bottom margin */}
      <div style={{ position: 'absolute', left: mm(12), right: mm(12), bottom: mm(3), height: mm(10), display: 'flex', color: T.muted, fontSize: fs(6), lineHeight: 1.4 }}>
        <div style={{ width: '58%' }}>
          {SCHOOL_IDENTITY.contact}
          <br />
          <span style={{ color: T.faint }}>{reference}</span>
        </div>
        <div style={{ width: '10%', textAlign: 'center', fontSize: fs(6.2) }}>1 / 1</div>
        <div style={{ width: '32%', textAlign: 'right' }}>
          <span style={{ display: 'inline-block', width: mm(1.6), height: mm(1.6), marginRight: mm(1.2), borderRadius: mm(0.4), background: APP.brand[500], verticalAlign: '-0.1em' }} />
          Document généré avec <span style={{ fontWeight: 700, color: APP.brand[500] }}>MauriSchool</span>
          <br />
          <span style={rtl}>
            تم إنشاء المستند بواسطة <span style={{ fontFamily: OUTFIT, fontWeight: 700, color: APP.brand[500] }}>MauriSchool</span>
          </span>
        </div>
      </div>
    </div>
  );
};

/** financial.html's wording for a payment receipt (pdf_service.py: _labels, _status_label; payment_methods.py; _seal.html). */
const RECEIPT = {
  title: { fr: 'Reçu de paiement', ar: 'إيصال دفع' },
  number: { fr: 'Numéro', ar: 'الرقم' },
  date: { fr: 'Date', ar: 'التاريخ' },
  invoice: { fr: 'Facture', ar: 'رقم الفاتورة' },
  received: { fr: 'Montant reçu', ar: 'المبلغ المستلم' },
  student: { fr: 'Élève', ar: 'التلميذ' },
  name: { fr: 'Nom', ar: 'الاسم' },
  code: { fr: 'Matricule', ar: 'الرقم المدرسي' },
  payer: { fr: 'Payeur', ar: 'الدافع' },
  payment: { fr: 'Paiement', ar: 'الدفع' },
  method: { fr: 'Mode de paiement', ar: 'طريقة الدفع' },
  cash: { fr: 'Espèces', ar: 'نقدًا' },
  processedBy: { fr: 'Traité par', ar: 'سجله' },
  balanceAfter: { fr: 'Solde restant', ar: 'الرصيد المتبقي' },
  paid: { fr: 'Payé', ar: 'مدفوع' },
  seal: { fr: 'Cachet et signature', ar: 'الختم والتوقيع' },
  generated: { fr: 'Document généré avec', ar: 'تم إنشاء المستند بواسطة' },
} as const;

export type ReceiptData = { number: string; date: string; time: string; invoice: string; amount: number; student: string; code: string; payer: string; cashier: string };

/** _format_decimal: two decimals, thousands grouped with a plain space. */
const grouped = (n: number) => `${Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${(n % 1).toFixed(2).slice(2)}`;

/**
 * A payment receipt, A5 portrait, `width` pixels wide, in the viewer's
 * language (financial.html, document_type "payment_receipt", the compact A5
 * rhythm): masthead, tick and title with the status pill, the facts strip, the
 * amount received, the pupil and payment panels, the balance left, the seal.
 */
export const ReceiptSheet: React.FC<{ width: number; lang: 'fr' | 'ar'; data: ReceiptData; accent?: string; style?: React.CSSProperties }> = ({ width, lang, data, accent, style }) => {
  const T = documentTheme(accent);
  const K = width / 148;
  const mm = (n: number) => n * K;
  const fs = (n: number) => n * 0.3528 * K;
  const ar = lang === 'ar';
  const L = (k: keyof typeof RECEIPT) => RECEIPT[k][lang];
  const ltr = (s: string) => (
    <bdi dir="ltr" style={{ unicodeBidi: 'isolate' }}>
      {s}
    </bdi>
  );
  const money = (n: number) => ltr(`${grouped(n)} MRU`);
  const label: React.CSSProperties = { display: 'block', color: T.muted, fontSize: fs(6), fontWeight: 600, letterSpacing: ar ? 0 : fs(0.45), textTransform: 'uppercase', lineHeight: 1.3 };
  const panelHead: React.CSSProperties = { ...label, paddingBottom: mm(1), marginBottom: mm(0.6), borderBottom: `${fs(0.4)}px solid ${T.line}` };
  const kv = (k: string, v: React.ReactNode) => (
    <div key={k} style={{ display: 'flex', padding: `${mm(0.7)}px 0` }}>
      <span style={{ width: mm(25), flexShrink: 0, color: T.muted }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
  return (
    <div
      dir={ar ? 'rtl' : 'ltr'}
      style={{
        position: 'relative',
        width,
        height: (width * 210) / 148,
        background: '#fff',
        color: T.ink,
        fontFamily: ar ? `${TAJAWAL}, ${OUTFIT}` : `${OUTFIT}, ${TAJAWAL}`,
        fontSize: fs(7.4),
        lineHeight: 1.4,
        padding: `${mm(11)}px ${mm(12)}px ${mm(15)}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        textAlign: 'start',
        ...style,
      }}
    >
      {/* masthead */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: `${fs(1.4)}px solid ${T.accent}`, paddingBottom: mm(2.4), marginBottom: mm(4) }}>
        <div style={{ paddingInlineEnd: mm(3) }}>
          <Crest size={mm(12)} accent={T.accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: fs(9.5), fontWeight: 700, lineHeight: 1.2, color: T.accent }}>{SCHOOL[lang]}</div>
          <div style={{ fontSize: fs(8), fontWeight: 600, color: T.muted, lineHeight: 1.3 }}>
            <span dir={ar ? 'ltr' : 'rtl'} style={{ fontFamily: ar ? OUTFIT : TAJAWAL }}>
              {SCHOOL[ar ? 'fr' : 'ar']}
            </span>
          </div>
          <div style={{ marginTop: mm(0.4), color: T.accent, fontSize: fs(6.8), fontStyle: ar ? 'normal' : 'italic', lineHeight: 1.3 }}>{SCHOOL_IDENTITY.motto[lang]}</div>
        </div>
        <div style={{ width: '30%', textAlign: 'end', color: T.muted, fontSize: fs(6.6) }}>{ltr(`${data.date} ${data.time}`)}</div>
      </div>
      {/* doc-head */}
      <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: mm(3.5) }}>
        <div style={{ flex: 1 }}>
          <div style={{ width: mm(11), height: mm(1.2), borderRadius: mm(0.6), background: T.accent, marginBottom: mm(2.2) }} />
          <div style={{ fontSize: fs(12), fontWeight: 700, lineHeight: 1.15 }}>{L('title')}</div>
        </div>
        <span style={{ padding: `${mm(0.5)}px ${mm(2.2)}px`, borderRadius: mm(3), fontSize: fs(6.4), fontWeight: 600, color: '#067647', background: '#ECFDF3' }}>{L('paid')}</span>
      </div>
      {/* strip */}
      <div style={{ display: 'flex', marginBottom: mm(3.5), padding: `${mm(1.8)}px 0`, borderTop: `${fs(0.6)}px solid ${T.accent}`, borderBottom: `${fs(0.4)}px solid ${T.line}` }}>
        {[
          [L('number'), data.number],
          [L('date'), data.date],
          [L('invoice'), data.invoice],
        ].map(([k, v]) => (
          <div key={k} style={{ paddingInlineEnd: mm(5) }}>
            <span style={label}>{k}</span>
            <span style={{ display: 'block', fontSize: fs(8.4), fontWeight: 600, lineHeight: 1.35 }}>{ltr(v)}</span>
          </div>
        ))}
      </div>
      {/* amount */}
      <div style={{ margin: `0 0 ${mm(4)}px` }}>
        <div style={{ fontSize: fs(17), fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{money(data.amount)}</div>
        <div style={{ marginTop: mm(0.8), color: T.muted, fontSize: fs(7.4) }}>{L('received')}</div>
      </div>
      {/* panels */}
      <div style={{ display: 'flex', marginBottom: mm(3.5) }}>
        <div style={{ width: '50%', paddingInlineEnd: mm(8), boxSizing: 'border-box' }}>
          <span style={panelHead}>{L('student')}</span>
          {kv(L('name'), data.student)}
          {kv(L('code'), ltr(data.code))}
          {kv(L('payer'), data.payer)}
        </div>
        <div style={{ width: '50%' }}>
          <span style={panelHead}>{L('payment')}</span>
          {kv(L('method'), L('cash'))}
          {kv(L('processedBy'), data.cashier)}
        </div>
      </div>
      {/* totals */}
      <div style={{ width: '70%', marginInlineStart: 'auto', display: 'flex', justifyContent: 'space-between', paddingTop: mm(1.8), borderTop: `${fs(0.7)}px solid ${T.accent}`, fontSize: fs(10), fontWeight: 700 }}>
        <span>{L('balanceAfter')}</span>
        <span style={{ color: T.accent }}>{money(0)}</span>
      </div>
      {/* seal */}
      <div style={{ width: mm(54), marginTop: mm(4), marginInlineStart: 'auto' }}>
        <span style={{ ...label, marginBottom: mm(1.2) }}>{L('seal')}</span>
        <div style={{ height: mm(22), border: `${fs(0.6)}px dashed ${T.lineStrong}`, borderRadius: mm(1.6), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Seal height={mm(19.5)} />
        </div>
      </div>
      {/* footer */}
      <div style={{ position: 'absolute', left: mm(12), right: mm(12), bottom: mm(4), display: 'flex', justifyContent: 'space-between', borderTop: `${fs(0.5)}px solid ${T.line}`, paddingTop: mm(1.6), color: T.muted, fontSize: fs(6), lineHeight: 1.4 }}>
        <div style={{ width: '58%' }}>
          {ltr(SCHOOL_IDENTITY.contact)}
          <br />
          <span style={{ color: T.faint }}>{ltr(data.number)}</span>
        </div>
        <div style={{ textAlign: 'end' }}>
          <span style={{ display: 'inline-block', width: mm(1.6), height: mm(1.6), marginInlineEnd: mm(1.2), borderRadius: mm(0.4), background: APP.brand[500] }} />
          {L('generated')} <span style={{ fontFamily: OUTFIT, fontWeight: 700, color: APP.brand[500] }}>MauriSchool</span>
        </div>
      </div>
    </div>
  );
};
