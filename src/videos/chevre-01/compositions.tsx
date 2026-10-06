import React from 'react';
import { Composition, Folder } from 'remotion';
import { totalFrames } from '../../shared/beat';
import { PORTRAIT } from '../../shared/formats';
import { Lang } from '../../shared/lang';
import { FPS } from '../../shared/tokens';
import { Chevre, ChevreProps, Cover, SceneAlone } from './Chevre';
import { TIMELINE, timelineFor } from './timeline';

/**
 * chevre-01 — « La chèvre et le reçu » (fee collection, October 2026), French
 * and Arabic, 27 s, no voice, looping.
 *
 *   Chevre01-FR/AR          the published cuts, cover on frame 0
 *   Chevre01-FR/AR-Check    the same with the Reels/TikTok zones drawn
 *   Chevre01-Cover-FR/AR    the cover as a still
 *   Chevre01-<scene>        each scene alone, in French
 */
const CUTS: { id: string; props: ChevreProps }[] = [
  { id: 'Chevre01-FR', props: { lang: 'fr', safeZones: false, music: 0.6, cover: true } },
  { id: 'Chevre01-AR', props: { lang: 'ar', safeZones: false, music: 0.6, cover: true } },
  { id: 'Chevre01-FR-Check', props: { lang: 'fr', safeZones: true, music: 0.6, cover: false } },
  { id: 'Chevre01-AR-Check', props: { lang: 'ar', safeZones: true, music: 0.6, cover: false } },
];

export const Chevre01Compositions: React.FC = () => (
  <Folder name="chevre-01">
    {CUTS.map((c) => (
      <Composition
        key={c.id}
        id={c.id}
        component={Chevre}
        {...PORTRAIT}
        fps={FPS}
        durationInFrames={totalFrames(timelineFor(c.props.lang))}
        defaultProps={c.props}
      />
    ))}
    {(['fr', 'ar'] as Lang[]).map((lang) => (
      <Composition
        key={lang}
        id={`Chevre01-Cover-${lang.toUpperCase()}`}
        component={Cover}
        {...PORTRAIT}
        fps={FPS}
        // Long on purpose: Remotion clamps a frozen frame to the composition's length.
        durationInFrames={totalFrames(TIMELINE)}
        defaultProps={{ lang }}
      />
    ))}
    <Folder name="chevre-01-scenes">
      {TIMELINE.map((s) => (
        <Composition
          key={s.id}
          id={`Chevre01-${s.id}`}
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
