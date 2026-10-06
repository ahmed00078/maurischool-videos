import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CLASS_ANNOUNCEMENT, PUPIL_CLASS } from './demo';
import { Backdrop } from './fx';
import { Lang, LangProvider } from './lang';
import { AnnouncementComposerScreen, AnnouncementDraft } from './ui/announcement';
import { Device, DeviceBack } from './ui/Device';
import { InboxScreen } from './ui/inbox';
import { Father, Boy } from './ui/people';
import { LIVING_ROOM, LivingRoom, RoomLight, RoomShade, WallCalendar } from './ui/places';

/** The director's composer (scrolled to the recipients, then with its dialog) and the parent's inbox row. */
export const KitAnnounce: React.FC<{ lang: Lang }> = ({ lang }) => {
  const draft: AnnouncementDraft = {
    title: CLASS_ANNOUNCEMENT.title[lang],
    body: CLASS_ANNOUNCEMENT.body[lang],
    audience: 'class',
    className: PUPIL_CLASS[lang],
    total: CLASS_ANNOUNCEMENT.total,
    breakdown: [...CLASS_ANNOUNCEMENT.breakdown],
  };
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill>
        <Backdrop mood="paper" />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: 'absolute', left: 8 + i * 356, top: 560, scale: '0.56', transformOrigin: '0 0' }}>
            <Device time="18:03">
              {i === 2 ? (
                <InboxScreen
                  items={[
                    { category: 'announcements', elevated: true, time: '18:04', title: draft.title, message: draft.body },
                    { category: 'finance', unread: false, time: '12/10/2026', title: 'Paiement enregistré — Sidi Ould Mocktar', message: '7 500 MRU ont été enregistrés.' },
                  ]}
                />
              ) : (
                <AnnouncementComposerScreen draft={draft} scroll={i === 0 ? 0 : 60} dialog={i === 1 ? 1 : 0} />
              )}
            </Device>
          </div>
        ))}
      </AbsoluteFill>
    </LangProvider>
  );
};

/** The living room in its three lights, with Papa, Sidi, a calendar mid-tear and a phone's back. */
export const KitRoom: React.FC<{ lang: Lang; light: RoomLight }> = ({ lang, light }) => (
  <LangProvider lang={lang}>
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <LivingRoom light={light} />
      <WallCalendar
        pages={[
          { month: { fr: 'OCT.', ar: 'أكتوبر' }, day: 20, weekday: { fr: 'Mardi', ar: 'الثلاثاء' } },
          { month: { fr: 'OCT.', ar: 'أكتوبر' }, day: 21, weekday: { fr: 'Mercredi', ar: 'الأربعاء' } },
        ]}
        flip={0.4}
        x={LIVING_ROOM.calendar.x}
        y={LIVING_ROOM.calendar.y}
        width={140}
      />
      <div style={{ position: 'absolute', left: 60, top: 760 }}>
        <Boy width={330} face={{ mouth: 'o', brows: 1 }} />
      </div>
      <div style={{ position: 'absolute', left: 470, top: 640 }}>
        <Father width={560} face={{ mouth: 'smile', look: [0, 1] }} />
      </div>
      <div style={{ position: 'absolute', left: 700, top: 1300, scale: '0.2', transformOrigin: '0 0' }}>
        <DeviceBack />
      </div>
      <RoomShade light={light} glows={light === 'night' ? [{ x: 750, y: 1000, r: 420, color: 'rgba(120,170,255,0.9)', amount: 0.7 }] : []} />
    </AbsoluteFill>
  </LangProvider>
);
