import React from 'react';
import { Audio } from '@remotion/media';
import { AbsoluteFill, Freeze, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { LeadContext, MarksContext, StoryClock, totalFrames } from '../../shared/beat';
import { SafeZones } from '../../shared/fx';
import { Lang, LangProvider } from '../../shared/lang';
import { SoundContext, useSilent } from '../../shared/sound';
import { BEAT } from '../../shared/tokens';
import { AppScene } from './scenes/App';
import { CounterScene, PayScene, RewindScene } from './scenes/Counter';
import { HookScene, HookWords, OutroScene, scrap, TwistScene, YardScene } from './scenes/Yard';
import { GoatClose } from './stage';
import { SceneId, timelineFor } from './timeline';

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: HookScene,
  yard: YardScene,
  counter: CounterScene,
  rewind: RewindScene,
  pay: PayScene,
  app: AppScene,
  twist: TwistScene,
  outro: OutroScene,
};

export type ChevreProps = {
  lang: Lang;
  /** Draw the Reels/TikTok interface zones on top, for layout checks. */
  safeZones: boolean;
  /** Music level. */
  music: number;
  /** Put the cover on frame 0, where platforms take the thumbnail from. */
  cover: boolean;
};

/** The music, synthesized on this timeline by scripts/chevre-01/make-music.mjs. */
export const MUSIC = 'chevre-01/music.wav';

/**
 * The cover: her stare, the scrap « REÇU N° …0412 » in her mouth, and both
 * lines, « Papa a payé. La chèvre a mangé la preuve. », big enough for a
 * profile grid.
 */
export const Cover: React.FC<{ lang: Lang }> = ({ lang }) => (
  <SoundContext.Provider value={{ silent: true }}>
    <LangProvider lang={lang}>
      <LeadContext.Provider value={0}>
        <Freeze frame={0}>
          <AbsoluteFill>
            <GoatClose goat={{ paper: scrap() }} />
            <HookWords at={-100} second={-100} />
          </AbsoluteFill>
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
 * « La chèvre et le reçu »: eight scenes on the 120 BPM grid, 27 s, no voice
 * (it reads with the sound off), one render per language. Every cut is hard;
 * the goat chews on the video's clock, so her last frame runs into her first
 * and the video loops.
 */
export const Chevre: React.FC<ChevreProps> = ({ lang, safeZones, music, cover }) => {
  const frame = useCurrentFrame();
  const timeline = timelineFor(lang);
  const total = totalFrames(timeline);
  const silent = useSilent();
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ background: '#e6ba84' }}>
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
    </LangProvider>
  );
};

/** One scene alone, for Studio and stills, at its place on the video's clock. */
export const SceneAlone: React.FC<{ id: SceneId; lang: Lang }> = ({ id, lang }) => {
  const scene = timelineFor(lang).find((s) => s.id === id);
  return (
    <LangProvider lang={lang}>
      <Placed id={id} from={(scene?.cutBeat ?? 0) * BEAT} lead={scene?.lead ?? 0} marks={scene?.marks ?? {}} />
    </LangProvider>
  );
};
