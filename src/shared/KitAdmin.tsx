import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from './fx';
import { Lang, LangProvider } from './lang';
import { PayrollScreen, ScheduleScreen, TermClosingScreen } from './ui/admin';
import { Device } from './ui/Device';

/** The director's timetable (and its conflict alert), the payroll list, the term closing hub (and its dialog). */
export const KitAdmin: React.FC<{ lang: Lang }> = ({ lang }) => (
  <LangProvider lang={lang}>
    <AbsoluteFill>
      <Backdrop mood="paper" />
      {[
        <ScheduleScreen />,
        <ScheduleScreen glow={1} dialog={1} />,
        <PayrollScreen validated={1} />,
        <TermClosingScreen />,
        <TermClosingScreen dialog={1} />,
      ].map((screen, i) => (
        <div key={i} style={{ position: 'absolute', left: 22 + i * 378, top: 130, scale: '0.6', transformOrigin: '0 0' }}>
          <Device>{screen}</Device>
        </div>
      ))}
    </AbsoluteFill>
  </LangProvider>
);
