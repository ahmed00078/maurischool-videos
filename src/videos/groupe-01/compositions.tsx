import React from 'react';
import { Composition, Folder } from 'remotion';
import { totalFrames } from '../../shared/beat';
import { PORTRAIT } from '../../shared/formats';
import { Lang } from '../../shared/lang';
import { FPS } from '../../shared/tokens';
import { Cover, Groupe, GroupeProps, SceneAlone } from './Groupe';
import { TIMELINE, timelineFor } from './timeline';

/**
 * groupe-01 — « Le groupe des parents » (class announcements, mid-October
 * 2026), French and Arabic, 29.5 s, no voice, looping.
 *
 *   Groupe01-FR/AR          the published cuts, cover on frame 0
 *   Groupe01-FR/AR-Check    the same with the Reels/TikTok zones drawn
 *   Groupe01-Gag-FR/AR      the optional gag, for the owner to choose
 *   Groupe01-Cover-FR/AR    the cover as a still
 *   Groupe01-<scene>        each scene alone, in French
 */
const CUTS: { id: string; props: GroupeProps }[] = [
  { id: 'Groupe01-FR', props: { lang: 'fr', safeZones: false, music: 0.6, cover: true, gag: false } },
  { id: 'Groupe01-AR', props: { lang: 'ar', safeZones: false, music: 0.6, cover: true, gag: false } },
  { id: 'Groupe01-FR-Check', props: { lang: 'fr', safeZones: true, music: 0.6, cover: false, gag: false } },
  { id: 'Groupe01-AR-Check', props: { lang: 'ar', safeZones: true, music: 0.6, cover: false, gag: false } },
  { id: 'Groupe01-Gag-FR', props: { lang: 'fr', safeZones: false, music: 0.6, cover: true, gag: true } },
  { id: 'Groupe01-Gag-AR', props: { lang: 'ar', safeZones: false, music: 0.6, cover: true, gag: true } },
];

export const Groupe01Compositions: React.FC = () => (
  <Folder name="groupe-01">
    {CUTS.map((c) => (
      <Composition
        key={c.id}
        id={c.id}
        component={Groupe}
        {...PORTRAIT}
        fps={FPS}
        durationInFrames={totalFrames(timelineFor(c.props.lang))}
        defaultProps={c.props}
      />
    ))}
    {(['fr', 'ar'] as Lang[]).map((lang) => (
      <Composition
        key={lang}
        id={`Groupe01-Cover-${lang.toUpperCase()}`}
        component={Cover}
        {...PORTRAIT}
        fps={FPS}
        // Long on purpose: Remotion clamps a frozen frame to the composition's length.
        durationInFrames={totalFrames(TIMELINE)}
        defaultProps={{ lang }}
      />
    ))}
    <Folder name="groupe-01-scenes">
      {TIMELINE.map((s) => (
        <Composition
          key={s.id}
          id={`Groupe01-${s.id}`}
          component={SceneAlone}
          {...PORTRAIT}
          fps={FPS}
          durationInFrames={s.frames}
          defaultProps={{ id: s.id, lang: 'fr' as Lang, gag: false }}
        />
      ))}
    </Folder>
  </Folder>
);
