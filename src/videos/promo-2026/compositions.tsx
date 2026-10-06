import React from 'react';
import { Composition, Folder } from 'remotion';
import { LeadContext, MarksContext, totalFrames } from '../../shared/beat';
import { PORTRAIT } from '../../shared/formats';
import { Lang, LangProvider } from '../../shared/lang';
import { FPS } from '../../shared/tokens';
import { Cover, PromoFast, PromoFastProps, SPEEDS } from './PromoFast';
import { PromoShort, PromoShortProps, SHORT_FRAMES } from './PromoShort';
import { PromoV2, PromoV2Props, SCENE_COMPONENTS } from './PromoV2';
import { SceneId, TIMELINE, timelineFor } from './timeline';

/**
 * promo-2026 — the launch promo (September 2026). Eleven scenes on a 120 BPM
 * grid, French and Arabic cuts, voiced with ElevenLabs.
 *
 *   Promo2026-FR/AR          the voiced cut at natural speed (60 s / 71.5 s)
 *   Promo2026-FR-NoVoice     the base timing with the temp music only
 *   Promo2026-FR/AR-Fast     the published cuts, ×1.3 / ×1.4, cover on frame 0
 *   Promo2026-Cover-FR/AR    the cover as a still
 *   Promo2026-FR/AR-Short    the 20.5 s social cut: no voice, opens on the payoff (see PromoShort.tsx)
 *   Promo2026-<scene>        each scene alone, in its French timing
 */

/** One scene on its own, with the lead and voice marks it has in the full video. */
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

const VOICED: { id: string; props: PromoV2Props }[] = [
  { id: 'Promo2026-FR', props: { lang: 'fr', safeZones: false, music: 0.8, voice: true } },
  { id: 'Promo2026-FR-NoVoice', props: { lang: 'fr', safeZones: false, music: 0.8, voice: false } },
  { id: 'Promo2026-AR', props: { lang: 'ar', safeZones: false, music: 0.8, voice: true } },
];

/** The length follows the timeline of the language and whether its voice plays. */
const voicedLength = ({ props }: { props: PromoV2Props }) => ({
  durationInFrames: totalFrames(timelineFor(props.voice ? props.lang : 'base')),
});

// The published cuts. Their real length is fastFrames(): render with --frames (see PromoFast.tsx).
const FAST: { id: string; props: PromoFastProps }[] = [
  { id: 'Promo2026-FR-Fast', props: { lang: 'fr', speed: SPEEDS.fr, cover: true, safeZones: false } },
  { id: 'Promo2026-AR-Fast', props: { lang: 'ar', speed: SPEEDS.ar, cover: true, safeZones: false } },
];

// The short cuts: frame 0 is already the picture, so they need no cover.
const SHORT: { id: string; props: PromoShortProps }[] = [
  { id: 'Promo2026-FR-Short', props: { lang: 'fr', safeZones: false, music: 0.8 } },
  { id: 'Promo2026-AR-Short', props: { lang: 'ar', safeZones: false, music: 0.8 } },
];

export const Promo2026Compositions: React.FC = () => (
  <Folder name="promo-2026">
    {VOICED.map((p) => (
      <Composition
        key={p.id}
        id={p.id}
        component={PromoV2}
        {...PORTRAIT}
        fps={FPS}
        durationInFrames={totalFrames(TIMELINE)}
        calculateMetadata={voicedLength}
        defaultProps={p.props}
      />
    ))}
    {FAST.map((p) => (
      <Composition
        key={p.id}
        id={p.id}
        component={PromoFast}
        {...PORTRAIT}
        fps={FPS}
        // The full unscaled length on purpose; the cut really lasts fastFrames() frames.
        durationInFrames={totalFrames(timelineFor(p.props.lang))}
        defaultProps={p.props}
      />
    ))}
    {SHORT.map((p) => (
      <Composition key={p.id} id={p.id} component={PromoShort} {...PORTRAIT} fps={FPS} durationInFrames={SHORT_FRAMES} defaultProps={p.props} />
    ))}
    {(['fr', 'ar'] as Lang[]).map((lang) => (
      <Composition
        key={lang}
        id={`Promo2026-Cover-${lang.toUpperCase()}`}
        component={Cover}
        {...PORTRAIT}
        fps={FPS}
        // Long on purpose: Remotion clamps a frozen frame to the composition's
        // length, so a 1-frame composition would freeze the home scene on frame 0.
        durationInFrames={totalFrames(timelineFor(lang))}
        defaultProps={{ lang }}
      />
    ))}
    <Folder name="promo-2026-scenes">
      {timelineFor('fr').map((s) => (
        <Composition
          key={s.id}
          id={`Promo2026-${s.id}`}
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
