import React from 'react';
import { AbsoluteFill } from 'remotion';
import { fill, NOTIFS } from './appCopy';
import { FAMILY } from './demo';
import { Backdrop } from './fx';
import { Lang, LangProvider } from './lang';
import { Device } from './ui/Device';
import { InboxItem, InboxScreen } from './ui/inbox';

/** The parent's notification centre on its own, to compare with the app. */
export const KitInbox: React.FC<{ lang: Lang }> = ({ lang }) => {
  const n = (key: keyof typeof NOTIFS, params: Record<string, string>) => ({
    title: fill(NOTIFS[key].title[lang], params),
    message: fill(NOTIFS[key].message[lang], params),
  });
  const items: InboxItem[] = [
    {
      category: 'grades',
      time: '11:40',
      ...n('grade_published_parent', {
        student_name: FAMILY.son[lang],
        grade: FAMILY.sonGrade.value,
        subject_name: FAMILY.sonGrade.subject[lang],
        period: FAMILY.period[lang],
      }),
    },
    {
      category: 'grades',
      time: '10:12',
      ...n('grade_published_parent', {
        student_name: FAMILY.daughter[lang],
        grade: FAMILY.daughterGrade.value,
        subject_name: FAMILY.daughterGrade.subject[lang],
        period: FAMILY.period[lang],
      }),
    },
    {
      category: 'finance',
      elevated: true,
      time: '08:05',
      ...n('payment_overdue', {
        student_name: FAMILY.son[lang],
        // A HIGH row, to check the filled icon tile.
        amount_due: '2 500',
        due_date: '05/10/2026',
        invoice_number: 'INV-2026-000184',
      }),
    },
  ];
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Backdrop mood="paper" />
        <Device time="19:42">
          <InboxScreen items={items} emphasis={[0, 0, 1]} />
        </Device>
      </AbsoluteFill>
    </LangProvider>
  );
};
