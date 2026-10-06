import React from 'react';
import { Composition, Folder } from 'remotion';
import { LeadContext, MarksContext, totalFrames } from '../../shared/beat';
import { PORTRAIT } from '../../shared/formats';
import { Lang, LangProvider } from '../../shared/lang';
import { FPS } from '../../shared/tokens';
import { Names, namesMetadata, PLACEHOLDER_NAMES } from './Names';
import { Cover, SCENE_COMPONENTS, TeachersDay, TeachersDayProps } from './TeachersDay';
import { SceneId, TIMELINE, timelineFor } from './timeline';

/**
 * teachers-day-2026 — World Teachers' Day (5 October 2026), French and Arabic,
 * 23 s, no voice, looping.
 *
 *   TeachersDay2026-FR/AR          the published cuts, cover on frame 0
 *   TeachersDay2026-FR/AR-Check    the same with the Reels/TikTok zones drawn
 *   TeachersDay2026-Cover-FR/AR    the cover as a still
 *   TeachersDay2026-Names-FR/AR    part 2, the day after: the names from the comments
 *   TeachersDay2026-<scene>        each scene alone, in French
 */

const SceneAlone: React.FC<{ id: SceneId; lang: Lang }> = ({ id, lang }) => {
  const Scene = SCENE_COMPONENTS[id];
  const scene = timelineFor(lang).find((s) => s.id === id);
  return (
    <LangProvider lang={lang}>
      <LeadContext.Provider value={scene?.lead ?? 0}>
        <MarksContext.Provider value={scene?.marks ?? {}}>
          <Scene />
        </MarksContext.Provider>
      </LeadContext.Provider>
    </LangProvider>
  );
};

const CUTS: { id: string; props: TeachersDayProps }[] = [
  { id: 'TeachersDay2026-FR', props: { lang: 'fr', safeZones: false, music: 0.75, cover: true } },
  { id: 'TeachersDay2026-AR', props: { lang: 'ar', safeZones: false, music: 0.75, cover: true } },
  { id: 'TeachersDay2026-FR-Check', props: { lang: 'fr', safeZones: true, music: 0.75, cover: false } },
  { id: 'TeachersDay2026-AR-Check', props: { lang: 'ar', safeZones: true, music: 0.75, cover: false } },
];

export const TeachersDay2026Compositions: React.FC = () => (
  <Folder name="teachers-day-2026">
    {CUTS.map((c) => (
      <Composition
        key={c.id}
        id={c.id}
        component={TeachersDay}
        {...PORTRAIT}
        fps={FPS}
        durationInFrames={totalFrames(timelineFor(c.props.lang))}
        defaultProps={c.props}
      />
    ))}
    {(['fr', 'ar'] as Lang[]).map((lang) => (
      <Composition
        key={lang}
        id={`TeachersDay2026-Cover-${lang.toUpperCase()}`}
        component={Cover}
        {...PORTRAIT}
        fps={FPS}
        // Long on purpose: Remotion clamps a frozen frame to the composition's length.
        durationInFrames={totalFrames(TIMELINE)}
        defaultProps={{ lang }}
      />
    ))}
    {(['fr', 'ar'] as Lang[]).map((lang) => (
      <Composition
        key={`names-${lang}`}
        id={`TeachersDay2026-Names-${lang.toUpperCase()}`}
        component={Names}
        {...PORTRAIT}
        fps={FPS}
        durationInFrames={300}
        calculateMetadata={namesMetadata}
        defaultProps={{ lang, names: PLACEHOLDER_NAMES[lang], safeZones: false }}
      />
    ))}
    <Folder name="teachers-day-2026-scenes">
      {TIMELINE.map((s) => (
        <Composition
          key={s.id}
          id={`TeachersDay2026-${s.id}`}
          component={SceneAlone}
          {...PORTRAIT}
          fps={FPS}
          durationInFrames={s.frames}
          defaultProps={{ id: s.id, lang: 'fr' as Lang }}
        />
      ))}
    </Folder>
  </Folder>
);
