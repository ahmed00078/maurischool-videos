import React from 'react';
import { Audio } from '@remotion/media';
import { AbsoluteFill, Freeze, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { LeadContext, MarksContext, StoryClock, totalFrames } from '../../shared/beat';
import { SafeZones } from '../../shared/fx';
import { Lang, LangProvider } from '../../shared/lang';
import { SoundContext, useSilent } from '../../shared/sound';
import { BEAT } from '../../shared/tokens';
import { DirectorScene, SameDayScene } from './scenes/App';
import { BoxesScene } from './scenes/Boxes';
import { EveningScene } from './scenes/Evening';
import { CoverShot, HookScene, OutroScene } from './scenes/List';
import { FloodScene, GagContext, RewindScene, ThursdayScene } from './scenes/Salon';
import { SceneId, timelineFor } from './timeline';

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  boxes: BoxesScene,
  hook: HookScene,
  flood: FloodScene,
  thursday: ThursdayScene,
  rewind: RewindScene,
  director: DirectorScene,
  sameday: SameDayScene,
  evening: EveningScene,
  outro: OutroScene,
};

export type GroupeProps = {
  lang: Lang;
  /** Draw the Reels/TikTok interface zones on top, for layout checks. */
  safeZones: boolean;
  /** Music level. */
  music: number;
  /** Put the cover on frame 0, where platforms take the thumbnail from. */
  cover: boolean;
  /** The optional gag: on Wednesday night a parent asks the group whether there is a test on Thursday. */
  gag: boolean;
};

/** The music, synthesized on this timeline by scripts/groupe-01/make-music.mjs. */
export const MUSIC = 'groupe-01/music.wav';

/** The cover: the list, the group's badge at 312, « 312 messages non lus. », big enough for a profile grid. */
export const Cover: React.FC<{ lang: Lang }> = ({ lang }) => (
  <SoundContext.Provider value={{ silent: true }}>
    <LangProvider lang={lang}>
      <LeadContext.Provider value={0}>
        <Freeze frame={0}>
          <CoverShot />
        </Freeze>
      </LeadContext.Provider>
    </LangProvider>
  </SoundContext.Provider>
);

/** A scene on its own, with the clock and the beat grid it has in the video. */
const Placed: React.FC<{ id: SceneId; from: number; lead: number; marks: Record<string, number> }> = ({ id, from, lead, marks }) => {
  const Scene = SCENE_COMPONENTS[id];
  return (
    <StoryClock.Provider value={from}>
      <LeadContext.Provider value={lead}>
        <MarksContext.Provider value={marks}>
          <Scene />
        </MarksContext.Provider>
      </LeadContext.Provider>
    </StoryClock.Provider>
  );
};

/**
 * « Le groupe des parents »: nine scenes on the 120 BPM grid, 29.5 s, no voice
 * (it reads with the sound off), one render per language. Every cut is hard.
 * It opens on a found clip (boxes falling out of a container) and cuts on the
 * beat to the badge; the outro ends on the list, the badge climbing, and runs
 * back into the clip, so the video loops.
 */
export const Groupe: React.FC<GroupeProps> = ({ lang, safeZones, music, cover, gag }) => {
  const frame = useCurrentFrame();
  const timeline = timelineFor(lang);
  const total = totalFrames(timeline);
  const silent = useSilent();
  return (
    <LangProvider lang={lang}>
      <GagContext.Provider value={gag}>
        <AbsoluteFill style={{ background: '#1a1830' }}>
          {timeline.map((s) => {
            const from = s.cutBeat * BEAT;
            return (
              <Sequence key={s.id} name={s.id} from={from} durationInFrames={s.frames}>
                <Placed id={s.id} from={from} lead={s.lead} marks={s.marks} />
              </Sequence>
            );
          })}
          {cover && frame === 0 ? (
            <AbsoluteFill>
              <Cover lang={lang} />
            </AbsoluteFill>
          ) : null}
          <SafeZones show={safeZones} />
        </AbsoluteFill>
        {silent || music === 0 ? null : (
          // Barely a fade at either end: the loop runs the last beat into the first.
          <Audio src={staticFile(MUSIC)} volume={(f) => interpolate(f, [0, 2, total - 3, total], [0, music, music, 0], { extrapolateRight: 'clamp' })} />
        )}
      </GagContext.Provider>
    </LangProvider>
  );
};

/** One scene alone, for Studio and stills, at its place on the video's clock. */
export const SceneAlone: React.FC<{ id: SceneId; lang: Lang; gag?: boolean }> = ({ id, lang, gag = false }) => {
  const scene = timelineFor(lang).find((s) => s.id === id);
  return (
    <LangProvider lang={lang}>
      <GagContext.Provider value={gag}>
        <Placed id={id} from={(scene?.cutBeat ?? 0) * BEAT} lead={scene?.lead ?? 0} marks={scene?.marks ?? {}} />
      </GagContext.Provider>
    </LangProvider>
  );
};
