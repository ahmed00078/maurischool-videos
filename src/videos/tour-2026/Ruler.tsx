import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CLASS_ANNOUNCEMENT, FEES_PAYMENT, PUPIL_CLASS, REPORT_CARD } from '../../shared/demo';
import { Lang, LangProvider } from '../../shared/lang';
import { pt, SCREEN_H, SCREEN_W } from '../../shared/tokens';
import { PayrollScreen, ScheduleScreen, TermClosingScreen } from '../../shared/ui/admin';
import { AnnouncementComposerScreen } from '../../shared/ui/announcement';
import { ChildGradesScreen } from '../../shared/ui/childGrades';
import { ParentFeesScreen } from '../../shared/ui/fees';
import { FinanceScreen, HomeScreen } from '../../shared/ui/screens';
import { PaymentScreen } from '../../shared/ui/screens2';
import { EvaluationScreen, RegisterScreen } from '../../shared/ui/teacher';
import { childTerm, feesPayment, KHADI, KHADI_ROW, ROSTER, SCORES } from './data';

/**
 * A working tool, not a cut: the screens the tour uses, three to a frame,
 * under a ruler in app points, to read off the Rect of the section a scene
 * keeps sharp. `set` picks the three.
 */
export const Ruler: React.FC<{ lang: Lang; set: number }> = ({ lang, set }) => {
  const screens: [string, React.ReactNode][] = [
    ['home', <HomeScreen />],
    ['finance', <FinanceScreen />],
    ['finance 300', <FinanceScreen scroll={300} />],
    ['payment', <PaymentScreen typed={1} value={3000} pupil={KHADI} />],
    ['register', <RegisterScreen roster={ROSTER} filled={1} absent={[0, 0, 1]} />],
    ['evaluation', <EvaluationScreen roster={ROSTER} scores={SCORES} typedRow={KHADI_ROW} typed={1} />],
    ['composer', <AnnouncementComposerScreen draft={{ title: CLASS_ANNOUNCEMENT.title[lang], body: CLASS_ANNOUNCEMENT.body[lang], audience: 'class', className: PUPIL_CLASS[lang], total: CLASS_ANNOUNCEMENT.total, breakdown: [...CLASS_ANNOUNCEMENT.breakdown] }} scroll={150} />],
    ['child', <ChildGradesScreen name={KHADI} term={childTerm} />],
    ['fees', <ParentFeesScreen tab="history" payment={feesPayment} />],
    ['schedule', <ScheduleScreen />],
    ['payroll', <PayrollScreen />],
    ['term', <TermClosingScreen />],
    ['term dialog', <TermClosingScreen dialog={1} />],
    ['schedule dialog', <ScheduleScreen glow={1} dialog={1} />],
    ['payroll validated', <PayrollScreen validated={2} />],
  ];
  const k = 0.8;
  void FEES_PAYMENT;
  void REPORT_CARD;
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ background: '#fff' }}>
        {screens.slice(set * 3, set * 3 + 3).map(([name, screen], i) => (
          <div key={name} style={{ position: 'absolute', left: 90 + i * 620, top: 34, width: SCREEN_W, height: SCREEN_H, scale: String(k), transformOrigin: '0 0' }}>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', outline: '1px solid #999' }}>{screen}</div>
            {Array.from({ length: 43 }, (_, j) => (
              <div key={j} style={{ position: 'absolute', left: -70, right: j % 2 ? SCREEN_W : -10, top: pt(j * 20), height: 0, borderTop: `1px solid rgba(255,0,60,${j % 2 ? 0.25 : 0.55})` }}>
                {j % 2 === 0 ? <span style={{ position: 'absolute', left: 0, top: -24, fontSize: 22, fontFamily: 'monospace', color: '#d00' }}>{j * 20}</span> : null}
              </div>
            ))}
            {Array.from({ length: 9 }, (_, j) => (
              <div key={j} style={{ position: 'absolute', top: -12, bottom: 0, left: pt(j * 50), width: 0, borderLeft: '1px solid rgba(0,80,255,0.3)' }} />
            ))}
            <div style={{ position: 'absolute', top: -40, left: 0, fontSize: 26, fontFamily: 'monospace' }}>{name}</div>
          </div>
        ))}
      </AbsoluteFill>
    </LangProvider>
  );
};
