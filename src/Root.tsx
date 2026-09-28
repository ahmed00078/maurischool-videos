import React from 'react';
import { Composition, Folder } from 'remotion';
import { Promo, SCENES, TOTAL } from './Promo';
import { FPS } from './theme';
import { Kit, KitProps } from './v2/Kit';
import { LangProvider, Lang } from './v2/lang';
import { PromoV2, PromoV2Props, SCENE_COMPONENTS } from './v2/PromoV2';
import { LeadContext, MarksContext, SceneId, TIMELINE, timelineFor, totalFrames } from './v2/timeline';

/** One v2 scene on its own, with the lead and voice marks it has in the full video. */
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

const PROMO_V2: { id: string; props: PromoV2Props }[] = [
  { id: 'PromoV2-FR', props: { lang: 'fr', safeZones: false, music: 0.8, voice: true } },
  { id: 'PromoV2-FR-NoVoice', props: { lang: 'fr', safeZones: false, music: 0.8, voice: false } },
  { id: 'PromoV2-AR', props: { lang: 'ar', safeZones: false, music: 0.8, voice: true } },
];

/** The length follows the timeline of the language and whether its voice plays. */
const promoLength = ({ props }: { props: PromoV2Props }) => ({
  durationInFrames: totalFrames(timelineFor(props.voice ? props.lang : 'base')),
});

// Checkpoint 1: the rebuilt app screens, one still per language and theme.
const KITS: { id: string; props: KitProps }[] = [
  { id: 'Kit-Home-FR-Light', props: { lang: 'fr', theme: 'light', screen: 'home', mood: 'paper', safeZones: false } },
  { id: 'Kit-Home-AR-Dark', props: { lang: 'ar', theme: 'dark', screen: 'home', mood: 'night', safeZones: false } },
  { id: 'Kit-Finance-FR-Light', props: { lang: 'fr', theme: 'light', screen: 'finance', mood: 'brand', safeZones: false } },
  { id: 'Kit-Finance-AR-Light', props: { lang: 'ar', theme: 'light', screen: 'finance', mood: 'brand', safeZones: false } },
];

const W = 1080;
const H = 1920;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Promo" component={Promo} width={W} height={H} fps={FPS} durationInFrames={TOTAL} />
    <Composition id="PromoWide" component={Promo} width={H} height={W} fps={FPS} durationInFrames={TOTAL} />
    <Folder name="Scenes">
      {SCENES.map((s) => (
        <Composition
          key={s.id}
          id={s.id}
          component={s.component}
          width={W}
          height={H}
          fps={FPS}
          durationInFrames={s.frames}
        />
      ))}
    </Folder>
    {PROMO_V2.map((p) => (
      <Composition
        key={p.id}
        id={p.id}
        component={PromoV2}
        width={W}
        height={H}
        fps={FPS}
        durationInFrames={totalFrames(TIMELINE)}
        calculateMetadata={promoLength}
        defaultProps={p.props}
      />
    ))}
    <Folder name="V2-Scenes">
      {timelineFor('fr').map((s) => (
        <Composition
          key={s.id}
          id={`V2-${s.id}`}
          component={SceneAlone}
          width={W}
          height={H}
          fps={FPS}
          durationInFrames={s.frames}
          defaultProps={{ id: s.id, lang: 'fr' as Lang }}
        />
      ))}
    </Folder>
    <Folder name="V2-Checkpoint-1">
      {KITS.map((k) => (
        <Composition
          key={k.id}
          id={k.id}
          component={Kit}
          width={W}
          height={H}
          fps={FPS}
          durationInFrames={90}
          defaultProps={k.props}
        />
      ))}
    </Folder>
  </>
);
