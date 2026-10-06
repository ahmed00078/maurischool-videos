import React from 'react';
import { CHILD_GRADES_COPY, fill, INBOX_COPY } from '../appCopy';
import { Bi, percent, useBi, useLang } from '../lang';
import { APP, pt } from '../tokens';
import { AppScreen, Card, FloatingTabBar, useApp, useWeights } from './appkit';
import { Ionicon } from './Ionicon';

/**
 * A parent's child profile on its grades tab, where a "Bulletin disponible"
 * notification leads (action_url /parent/children/{id}/grades): the header,
 * the profile card, the tabs, the term switcher, the report-card download,
 * then SubjectGradesList: the term's average, big, and a card per subject.
 * mobile_app: app/(app)/(parent)/children/[id].tsx, StudentGradesPanel.tsx,
 * SubjectGradesList.tsx. A closed term shows "Moyenne finale".
 *
 * Averages print as the app prints them: toFixed(1), so 17.25 would read 17.3.
 */

export type ChildTerm = {
  className: Bi;
  /** % present, from the parent endpoint. */
  attendance: number;
  average: number;
  /** Grades published this term. */
  published: number;
  subjects: { name: Bi; coefficient: number; average: number }[];
};

/** formatters.ts getGradeColor. */
const gradeColor = (g: number) => (g >= 16 ? '#16a34a' : g >= 14 ? '#2563eb' : g >= 10 ? '#ca8a04' : '#dc2626');
/** formatters.ts formatCoefficient: at least one decimal. */
const coefficient = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));

/**
 * Where the average's figure sits on the screen, in app points from the top:
 * status bar 44, header 68, profile card 226 + 16, tabs 50 + 16, terms
 * 50 + 16, download 44 + 16, then the average card: 20 padding, the label 18,
 * 5, and the 38-pt line of the figure.
 */
export const CHILD_AVERAGE_Y = 44 + 68 + 242 + 66 + 66 + 60 + 20 + 18 + 5 + 19;

const Segments: React.FC<{ labels: { label: string; icon?: 'checkmark-circle-outline' | 'calendar-outline' | 'school-outline' }[]; active: number }> = ({
  labels,
  active,
}) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div style={{ display: 'flex', background: c.surface, borderRadius: pt(12), padding: pt(3), margin: `0 ${pt(16)}px ${pt(16)}px` }}>
      {labels.map(({ label, icon }, i) => {
        const color = i === active ? APP.brand[500] : c.textSecondary;
        return (
          <div
            key={label}
            style={{
              flex: 1,
              minWidth: 0,
              height: pt(44),
              borderRadius: pt(10),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: pt(4),
              padding: `0 ${pt(6)}px`,
              background: i === active ? c.card : 'transparent',
              boxShadow: i === active ? `0 ${pt(1)}px ${pt(3)}px rgba(0,0,0,0.08)` : undefined,
              color,
            }}
          >
            {icon ? <Ionicon name={icon} size={pt(16)} color={color} /> : null}
            <span
              style={{
                fontSize: pt(14),
                fontWeight: i === active ? w.semiBold : w.medium,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const ChildGradesScreen: React.FC<{
  name: Bi;
  term: ChildTerm;
  /** 0 to 1: the video's highlight on the average card. */
  emphasis?: number;
}> = ({ name, term, emphasis = 0 }) => {
  const bi = useBi();
  const { rtl } = useLang();
  const { c } = useApp();
  const w = useWeights();
  const T = CHILD_GRADES_COPY;
  const full = bi(name);
  const initials = full
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  const line = (size: number, lh: number, weight: number, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
    fontSize: pt(size),
    lineHeight: `${pt(lh)}px`,
    fontWeight: weight,
    color,
    ...extra,
  });
  return (
    <AppScreen>
      {/* Header: back, and the child's name. */}
      <div style={{ display: 'flex', alignItems: 'center', padding: `${pt(12)}px ${pt(16)}px`, height: pt(68), boxSizing: 'border-box' }}>
        <div style={{ width: pt(44), height: pt(44), marginInlineEnd: pt(8), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* DirectionalIcon: the arrow points back in the reading direction. */}
          <Ionicon name={rtl ? 'arrow-forward' : 'arrow-back'} size={pt(24)} color={c.text} />
        </div>
        <div style={line(18, 24, w.semiBold, c.text, { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>{full}</div>
      </div>
      {/* Profile card */}
      <div style={{ padding: `0 ${pt(16)}px`, marginBottom: pt(16) }}>
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${pt(20)}px ${pt(16)}px`, height: pt(226) }}>
          <div
            style={{
              width: pt(64),
              height: pt(64),
              borderRadius: pt(32),
              background: `${APP.brand[500]}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...line(24, 30, w.semiBold, APP.brand[600]),
            }}
          >
            {initials}
          </div>
          <div style={line(18, 24, w.bold, c.text, { marginTop: pt(10) })}>{full}</div>
          <div style={{ marginTop: pt(6), padding: `${pt(6)}px ${pt(10)}px`, borderRadius: pt(6), background: `${APP.brand[500]}15`, ...line(12, 16, w.semiBold, APP.brand[500]) }}>
            {bi(term.className)}
          </div>
          <div style={{ marginTop: pt(14), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={line(16, 21, w.bold, term.attendance >= 90 ? APP.success : term.attendance >= 75 ? APP.warning : APP.error, { direction: 'ltr' })}>
              {percent(term.attendance)}
            </div>
            <div style={line(11, 15, w.regular, c.textSecondary)}>{bi(T.tabs.attendance)}</div>
          </div>
        </Card>
      </div>
      <Segments
        labels={[
          { label: bi(T.tabs.attendance), icon: 'checkmark-circle-outline' },
          { label: bi(T.tabs.schedule), icon: 'calendar-outline' },
          { label: bi(T.tabs.grades), icon: 'school-outline' },
        ]}
        active={2}
      />
      <Segments labels={T.periods.map((p) => ({ label: bi(p) }))} active={0} />
      <div style={{ padding: `0 ${pt(16)}px` }}>
        {/* The term is closed: the bulletin can be downloaded. */}
        <div
          style={{
            height: pt(44),
            marginBottom: pt(16),
            borderRadius: pt(12),
            background: APP.brand[500],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: pt(8),
            ...line(14, 20, w.semiBold, '#fff'),
          }}
        >
          <Ionicon name="download-outline" size={pt(18)} color="#fff" />
          {bi(T.downloadReportCard)}
        </div>
        {/* The term's average. */}
        <Card
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: `${pt(20)}px ${pt(16)}px`,
            marginBottom: pt(12),
            // The video's own emphasis, not the app's.
            boxShadow: emphasis > 0 ? `0 0 0 ${pt(2.5) * emphasis}px ${gradeColor(term.average)}` : undefined,
            scale: String(1 + 0.025 * emphasis),
          }}
        >
          <div style={line(13, 18, w.medium, c.textSecondary, { textAlign: 'center' })}>{fill(bi(T.finalAverage), { period: bi(T.trimester1) })}</div>
          <div style={line(30, 38, w.bold, gradeColor(term.average), { marginTop: pt(5), direction: 'ltr' })}>{term.average.toFixed(1)}/20</div>
          <div style={line(12, 16, w.regular, c.textSecondary, { marginTop: pt(8) })}>
            {fill(bi(T.gradedSubjects), { graded: term.subjects.length, total: term.subjects.length })}
          </div>
          <div style={line(12, 16, w.regular, c.textSecondary, { marginTop: pt(3) })}>{fill(bi(T.publishedGrades), { count: term.published })}</div>
          <div style={line(12, 16, w.medium, APP.success, { marginTop: pt(5) })}>{bi(T.termClosed)}</div>
          <div style={{ marginTop: pt(8), height: pt(36), display: 'flex', alignItems: 'center', gap: pt(6), ...line(13, 18, w.semiBold, APP.brand[500]) }}>
            <Ionicon name="information-circle-outline" size={pt(15)} color={APP.brand[500]} />
            {bi(T.calculationAction)}
          </div>
        </Card>
        {term.subjects.map((s) => (
          <Card key={s.name.fr} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: pt(12) }}>
            <div style={{ flex: 1, paddingInlineEnd: pt(12) }}>
              <div style={line(16, 22, w.semiBold, c.text)}>{bi(s.name)}</div>
              <div style={line(12, 16, w.regular, c.textSecondary, { marginTop: pt(3) })}>{fill(bi(T.subjectCoefficient), { value: coefficient(s.coefficient) })}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={line(10, 14, w.regular, c.textSecondary)}>{bi(T.finalSubjectAverage)}</div>
              <div style={line(20, 26, w.bold, gradeColor(s.average), { marginTop: pt(2), direction: 'ltr' })}>{s.average.toFixed(1)}/20</div>
            </div>
          </Card>
        ))}
      </div>
      <FloatingTabBar
        wash={0}
        items={[
          { label: bi(INBOX_COPY.tabs.home), icon: 'logo', focused: false },
          { label: bi(INBOX_COPY.tabs.fees), icon: 'wallet-outline', focused: false },
          { label: bi(INBOX_COPY.tabs.observations), icon: 'eye-outline', focused: false },
          { label: bi(INBOX_COPY.tabs.profile), icon: 'person-outline', focused: false },
        ]}
      />
    </AppScreen>
  );
};
