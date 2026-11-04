import React from 'react';
import { Composition, Folder } from 'remotion';
import { LeadContext, MarksContext, totalFrames } from '../../shared/beat';
import { LANDSCAPE } from '../../shared/formats';
import { Lang, LangProvider } from '../../shared/lang';
import { FPS } from '../../shared/tokens';
import { Ruler } from './Ruler';
import { SCENE_COMPONENTS, Tour, TourProps } from './Tour';
import { SceneId, TIMELINE, timelineFor } from './timeline';

/**
 * tour-2026 — « MauriSchool en 10 points », the presentation sent to schools
 * (October 2026): landscape, about three minutes, French and Arabic, made for
 * a narrator. It opens on its strongest moment, then plays ten chapters in
 * three acts (money, classes, families) and ends on the dashboard. Every
 * phone screen stays veiled except the section a step is about (see
 * shared/wide.tsx).
 *
 *   Tour2026-FR/AR           the tour, with its voice once one is fitted
 *   Tour2026-<scene>-FR/AR   each scene alone
 *   Tour2026-Ruler-FR/AR-<n> a tool: the screens under a ruler, to place a section
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

const CUTS: { id: string; props: TourProps }[] = [
  { id: 'Tour2026-FR', props: { lang: 'fr', music: 0.7, voice: true } },
  { id: 'Tour2026-AR', props: { lang: 'ar', music: 0.7, voice: true } },
];

export const Tour2026Compositions: React.FC = () => (
  <Folder name="tour-2026">
    {CUTS.map((c) => (
      <Composition
        key={c.id}
        id={c.id}
        component={Tour}
        {...LANDSCAPE}
        fps={FPS}
        durationInFrames={totalFrames(TIMELINE)}
        calculateMetadata={({ props }) => ({ durationInFrames: totalFrames(timelineFor(props.voice ? props.lang : 'base')) })}
        defaultProps={c.props}
      />
    ))}
    <Folder name="tour-2026-scenes">
      {(['fr', 'ar'] as Lang[]).flatMap((lang) =>
        timelineFor(lang).map((s) => (
          <Composition key={`${s.id}-${lang}`} id={`Tour2026-${s.id}-${lang.toUpperCase()}`} component={SceneAlone} {...LANDSCAPE} fps={FPS} durationInFrames={s.frames} defaultProps={{ id: s.id, lang }} />
        )),
      )}
    </Folder>
    <Folder name="tour-2026-tools">
      {(['fr', 'ar'] as Lang[]).flatMap((lang) =>
        [0, 1, 2, 3, 4].map((set) => (
          <Composition key={`${lang}${set}`} id={`Tour2026-Ruler-${lang.toUpperCase()}-${set}`} component={Ruler} {...LANDSCAPE} fps={FPS} durationInFrames={30} defaultProps={{ lang, set }} />
        )),
      )}
    </Folder>
  </Folder>
);
