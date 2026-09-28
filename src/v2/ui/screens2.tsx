import React from 'react';
import { fill, SCREEN_COPY } from '../appCopy';
import { PUPIL, PUPIL_CLASS } from '../demo';
import { amount, Bi, useBi, useLang } from '../lang';
import { APP, pt, Theme } from '../tokens';
import { AppScreen, Card, Enter, IconChip, ScreenHeader, useApp, useWeights } from './appkit';
import { Ionicon } from './Ionicon';
import { money } from './screens';

/** The 5e A register we follow. Mariem (index 2) is the absence. */
export const PUPILS: Bi[] = [
  { fr: 'Aminetou Mint Mahmoud', ar: 'أمينتو بنت محمود' },
  { fr: 'Sidi Mohamed Ould Ali', ar: 'سيدي محمد ولد علي' },
  PUPIL,
  { fr: 'Yahya Ould Brahim', ar: 'يحيى ولد إبراهيم' },
  { fr: 'Khadijetou Mint Oumar', ar: 'خديجتو بنت عمر' },
  { fr: 'Moussa Ba', ar: 'موسى با' },
  { fr: 'Zeinabou Mint Sidi', ar: 'زينبو بنت سيدي' },
];
export const ABSENT_INDEX = 2;

const initials = (name: string) =>
  name
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join(' ');

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 38 }) => {
  const w = useWeights();
  return (
    <div
      style={{
        width: pt(size),
        height: pt(size),
        borderRadius: pt(size / 2),
        background: APP.brand[50],
        color: APP.brand[500],
        fontSize: pt(size * 0.36),
        fontWeight: w.bold,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );
};

/** A primary button; `press` (0 to 1) dips it as a finger lands. */
const PrimaryButton: React.FC<{ label: string; press?: number; done?: number }> = ({ label, press = 0, done = 0 }) => {
  const w = useWeights();
  return (
    <div
      style={{
        height: pt(52),
        borderRadius: pt(14),
        background: done > 0.5 ? APP.success : APP.brand[500],
        color: '#fff',
        fontSize: pt(16),
        fontWeight: w.semiBold,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: pt(8),
        scale: String(1 - press * 0.04),
        boxShadow: `0 ${pt(8)}px ${pt(18)}px ${APP.brand[500]}44`,
      }}
    >
      {done > 0.5 ? <Ionicon name="checkmark-circle" size={pt(20)} color="#fff" /> : null}
      {label}
    </div>
  );
};

/**
 * Teacher: "Marquer la présence" for one session. `absent` (0 to 1) flips
 * Mariem from present to absent; `tap` is the ripple of the finger on it.
 */
export const AttendanceScreen: React.FC<{
  theme?: Theme;
  enterFrom?: number;
  /** 0 to 1: "Tous présents" filling the rows top to bottom. */
  marked?: number;
  absent: number;
  tap: number;
  saved?: number;
  savePress?: number;
  allPress?: number;
}> = ({ theme = 'light', enterFrom, marked = 1, absent, tap, saved = 0, savePress = 0, allPress = 0 }) => {
  const bi = useBi();
  const count = Math.min(PUPILS.length, Math.floor(marked * (PUPILS.length + 0.999)));
  return (
    <AppScreen theme={theme} enterFrom={enterFrom}>
      <Enter order={0}>
        <ScreenHeader
          title={bi(SCREEN_COPY.attendanceTitle)}
          subtitle={`${bi(PUPIL_CLASS)} · ${bi({ fr: 'Mathématiques', ar: 'الرياضيات' })} · 08:00`}
        />
      </Enter>
      <Enter order={1}>
        <ProgressRow marked={count} total={PUPILS.length} press={allPress} />
      </Enter>
      <div style={{ padding: `0 ${pt(16)}px`, display: 'grid', gap: pt(8) }}>
        {PUPILS.map((p, i) => (
          <Enter key={i} order={2 + i * 0.6}>
            <PupilRow
              name={bi(p)}
              marked={i < count}
              absent={i === ABSENT_INDEX ? absent : 0}
              tap={i === ABSENT_INDEX ? tap : 0}
            />
          </Enter>
        ))}
      </div>
      <div style={{ position: 'absolute', left: pt(16), right: pt(16), bottom: pt(34) }}>
        <PrimaryButton label={bi(SCREEN_COPY.submitAttendance)} press={savePress} done={saved} />
      </div>
    </AppScreen>
  );
};

const ProgressRow: React.FC<{ marked: number; total: number; press: number }> = ({ marked, total, press }) => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${pt(16)}px ${pt(12)}px`,
      }}
    >
      <span style={{ fontSize: pt(13), color: c.textSecondary }}>
        {fill(bi(SCREEN_COPY.markedProgress), { marked, total })}
      </span>
      <span
        style={{
          fontSize: pt(13),
          fontWeight: w.semiBold,
          color: APP.brand[500],
          padding: `${pt(6)}px ${pt(12)}px`,
          borderRadius: 999,
          background: APP.brand[50],
          scale: String(1 - press * 0.08),
          boxShadow: press > 0 ? `0 0 0 ${pt(6) * press}px ${APP.brand[500]}22` : undefined,
        }}
      >
        {bi(SCREEN_COPY.allPresent)}
      </span>
    </div>
  );
};

const PupilRow: React.FC<{ name: string; marked: boolean; absent: number; tap: number }> = ({ name, marked, absent, tap }) => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  const isAbsent = absent > 0.5;
  const isPresent = marked && !isAbsent;
  const pill = (label: string, on: boolean, color: string, withTap: boolean) => (
    <div
      style={{
        position: 'relative',
        minWidth: pt(64),
        textAlign: 'center',
        fontSize: pt(12),
        fontWeight: w.semiBold,
        padding: `${pt(7)}px ${pt(10)}px`,
        borderRadius: 999,
        color: on ? '#fff' : c.textSecondary,
        background: on ? color : c.surface,
        border: `${pt(1)}px solid ${on ? color : c.border}`,
      }}
    >
      {label}
      {withTap && tap > 0 && tap < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: pt(70),
            height: pt(70),
            borderRadius: '50%',
            translate: '-50% -50%',
            background: `${APP.error}33`,
            border: `${pt(2)}px solid ${APP.error}aa`,
            scale: String(0.3 + tap * 1.1),
            opacity: 1 - tap,
          }}
        />
      ) : null}
    </div>
  );
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: pt(10),
        padding: `${pt(10)}px ${pt(12)}px`,
        borderRadius: pt(14),
        border: `${pt(1)}px solid ${isAbsent ? `${APP.error}55` : c.border}`,
        background: isAbsent ? `${APP.error}0d` : c.card,
      }}
    >
      <Avatar name={name} />
      <div style={{ flex: 1, minWidth: 0, fontSize: pt(14), fontWeight: w.medium, color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {name}
      </div>
      {pill(bi(SCREEN_COPY.present), isPresent, APP.success, false)}
      {pill(bi(SCREEN_COPY.absent), isAbsent, APP.error, true)}
    </div>
  );
};

/**
 * Accountant: recording a payment against Mariem's October invoice.
 * `typed` (0 to 1) types the amount; `press` and `done` drive the button.
 */
export const PaymentScreen: React.FC<{
  theme?: Theme;
  enterFrom?: number;
  typed: number;
  press?: number;
  done?: number;
  value: number;
}> = ({ theme = 'light', enterFrom, typed, press = 0, done = 0, value }) => {
  const bi = useBi();
  const { rtl } = useLang();
  const digits = amount(value);
  const shown = digits.slice(0, Math.round(digits.length * typed));
  return (
    <AppScreen theme={theme} enterFrom={enterFrom}>
      <Enter order={0}>
        <div style={{ display: 'flex', alignItems: 'center', padding: `${pt(8)}px ${pt(12)}px 0` }}>
          <Ionicon name={rtl ? 'arrow-forward' : 'arrow-back'} size={pt(24)} color={APP.light.text} />
        </div>
        <ScreenHeader title={bi(SCREEN_COPY.recordPayment)} />
      </Enter>
      <Enter order={1}>
        <div style={{ padding: `0 ${pt(16)}px`, marginBottom: pt(12) }}>
          <StudentCard />
        </div>
      </Enter>
      <Enter order={2}>
        <div style={{ padding: `0 ${pt(16)}px` }}>
          <AmountField shown={shown} caretOn={typed < 1} />
        </div>
      </Enter>
      <div style={{ position: 'absolute', left: pt(16), right: pt(16), bottom: pt(34) }}>
        <PrimaryButton label={bi(SCREEN_COPY.save)} press={press} done={done} />
      </div>
    </AppScreen>
  );
};

const StudentCard: React.FC = () => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: pt(12) }}>
        <Avatar name={bi(PUPIL)} size={44} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: pt(16), fontWeight: w.semiBold, color: c.text }}>{bi(PUPIL)}</div>
          <div style={{ fontSize: pt(13), color: c.textSecondary, marginTop: pt(2) }}>{bi(PUPIL_CLASS)}</div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: pt(10),
          marginTop: pt(14),
          paddingTop: pt(14),
          borderTop: `${pt(1)}px solid ${c.border}`,
        }}
      >
        <IconChip name="receipt-outline" color={APP.brand[500]} box={34} icon={17} alpha="18" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: pt(14), fontWeight: w.medium, color: c.text }}>{bi({ fr: 'Facture d’octobre', ar: 'فاتورة أكتوبر' })}</div>
          <div style={{ fontSize: pt(12), color: APP.warning, marginTop: pt(2) }}>{bi({ fr: 'Reste à payer', ar: 'المتبقي' })}</div>
        </div>
        <div style={{ fontSize: pt(15), fontWeight: w.semiBold, color: c.text }}>{money(3000)}</div>
      </div>
    </Card>
  );
};

const AmountField: React.FC<{ shown: string; caretOn: boolean }> = ({ shown, caretOn }) => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  return (
    <div>
      <div style={{ fontSize: pt(13), fontWeight: w.medium, color: c.textSecondary, marginBottom: pt(6) }}>
        {bi(SCREEN_COPY.amount)}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: pt(6),
          height: pt(64),
          padding: `0 ${pt(16)}px`,
          borderRadius: pt(14),
          border: `${pt(2)}px solid ${APP.brand[500]}`,
          boxShadow: `0 0 0 ${pt(4)}px ${APP.brand[500]}1f`,
          background: c.card,
          direction: 'ltr',
        }}
      >
        <span style={{ fontSize: pt(28), fontWeight: w.bold, color: c.text }}>{shown}</span>
        {caretOn ? <span style={{ width: pt(2), height: pt(30), background: APP.brand[500] }} /> : null}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: pt(16), fontWeight: w.semiBold, color: c.textSecondary }}>MRU</span>
      </div>
    </div>
  );
};

const SUBJECTS: { name: Bi; grade: number }[] = [
  { name: { fr: 'Mathématiques', ar: 'الرياضيات' }, grade: 16 },
  { name: { fr: 'Langue arabe', ar: 'اللغة العربية' }, grade: 15.5 },
  { name: { fr: 'Français', ar: 'اللغة الفرنسية' }, grade: 13 },
  { name: { fr: 'Sciences naturelles', ar: 'العلوم الطبيعية' }, grade: 14.5 },
  { name: { fr: 'Éducation islamique', ar: 'التربية الإسلامية' }, grade: 17 },
];
export const OVERALL_AVERAGE = 15.2;
export const PERIOD: Bi = { fr: 'Trimestre 1', ar: 'الفصل الأول' };

/** mobile_app/src/utils/formatters.ts getGradeColor. */
const gradeColor = (g: number) => (g >= 16 ? APP.success : g >= 14 ? APP.info : g >= 10 ? APP.warning : APP.error);

/** Parent: Mariem's grades for the term, the overall average, and the report card. */
export const GradesScreen: React.FC<{ theme?: Theme; enterFrom?: number; average: number; card: number }> = ({
  theme = 'light',
  enterFrom,
  average,
  card,
}) => {
  const bi = useBi();
  return (
    <AppScreen theme={theme} enterFrom={enterFrom}>
      <Enter order={0}>
        <ScreenHeader title={bi({ fr: 'Notes', ar: 'النقاط' })} subtitle={`${bi(PUPIL)} · ${bi(PERIOD)}`} />
      </Enter>
      <div style={{ padding: `0 ${pt(16)}px`, display: 'grid', gap: pt(8) }}>
        {SUBJECTS.map((s, i) => (
          <Enter key={i} order={1 + i * 0.7}>
            <GradeRow name={bi(s.name)} grade={s.grade} />
          </Enter>
        ))}
        <Enter order={5}>
          <AverageCard value={average} />
        </Enter>
        <div style={{ opacity: card, translate: `0px ${(1 - card) * pt(20)}px` }}>
          <ReportCardRow />
        </div>
      </div>
    </AppScreen>
  );
};

const GradeRow: React.FC<{ name: string; grade: number }> = ({ name, grade }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${pt(13)}px ${pt(14)}px`,
        borderRadius: pt(14),
        border: `${pt(1)}px solid ${c.border}`,
        background: c.card,
      }}
    >
      <div style={{ flex: 1, fontSize: pt(15), fontWeight: w.medium, color: c.text }}>{name}</div>
      <div style={{ direction: 'ltr', fontSize: pt(18), fontWeight: w.bold, color: gradeColor(grade) }}>
        {grade}
        <span style={{ fontSize: pt(12), color: c.textSecondary, fontWeight: w.medium }}>/20</span>
      </div>
    </div>
  );
};

const AverageCard: React.FC<{ value: number }> = ({ value }) => {
  const bi = useBi();
  const w = useWeights();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${pt(16)}px ${pt(16)}px`,
        borderRadius: pt(16),
        background: APP.brand[500],
        color: '#fff',
        marginTop: pt(4),
      }}
    >
      <div style={{ flex: 1, fontSize: pt(16), fontWeight: w.semiBold }}>{bi(SCREEN_COPY.overallAverage)}</div>
      <div style={{ direction: 'ltr', fontSize: pt(30), fontWeight: w.bold }}>
        {value.toFixed(2)}
        <span style={{ fontSize: pt(15), opacity: 0.8 }}>/20</span>
      </div>
    </div>
  );
};

export const ReportCardRow: React.FC = () => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: pt(12),
        padding: `${pt(12)}px ${pt(14)}px`,
        borderRadius: pt(14),
        border: `${pt(1)}px solid ${c.border}`,
        background: c.card,
      }}
    >
      <IconChip name="document-text" color={APP.error} box={40} icon={20} alpha="18" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: pt(15), fontWeight: w.semiBold, color: c.text }}>
          {bi({ fr: 'Bulletin', ar: 'كشف الدرجات' })} · {bi(PERIOD)}
        </div>
        <div style={{ fontSize: pt(12), color: c.textSecondary, marginTop: pt(2) }}>PDF</div>
      </div>
      <Ionicon name="download-outline" size={pt(22)} color={APP.brand[500]} />
    </div>
  );
};
