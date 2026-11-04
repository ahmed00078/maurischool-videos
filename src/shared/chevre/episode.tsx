import React from 'react';
import { Audio } from '@remotion/media';
import { AbsoluteFill, Composition, Folder, Freeze, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { LeadContext, MarksContext, StoryClock, TimedScene, totalFrames } from '../beat';
import { SafeZones } from '../fx';
import { PORTRAIT } from '../formats';
import { Lang, LangProvider } from '../lang';
import { SoundContext, useSilent } from '../sound';
import { BEAT, FPS } from '../tokens';
import { ChevreContext, ChevreEpisode, GoalSound, ScoreBug, scoreFor } from './marks';

/**
 * One episode of « La chèvre a encore frappé », assembled: its scenes on its
 * timeline, the score bug over all of them (and its goal), the music, the
 * cover on frame 0, and its compositions. An episode is a copy.ts, a
 * timeline.json, its scenes and a call to makeChevreEpisode.
 */

export type ChevreDef<Id extends string> = {
  episode: ChevreEpisode;
  scenes: Record<Id, React.FC>;
  timelineFor: (lang: Lang | 'base') => TimedScene<Id>[];
  /** Under public/, synthesized on the timeline by scripts/<video>/make-music.mjs. */
  music: string;
  /** Where MauriSchool scores: the scene and the beat in it where the whistle blows. */
  goal: { scene: Id; beat: number };
  /** The hook's frame that is the cover; the hook is drawn so that its frame 0 is it. */
  coverFrame?: number;
  /** Behind everything, for the frames between hard cuts. */
  background?: string;
  /** Where the score comes to at full size, clear of the goal scene's action. */
  scoreAt?: [number, number];
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

export const makeChevreEpisode = <Id extends string>(def: ChevreDef<Id>) => {
  const { episode, scenes, timelineFor, music: musicFile, goal, coverFrame = 0, background = '#e6ba84', scoreAt } = def;
  const score = scoreFor(episode.number);
  const goalFrame = (lang: Lang | 'base') => {
    const s = timelineFor(lang).find((x) => x.id === goal.scene)!;
    return s.cutBeat * BEAT + Math.round(goal.beat * BEAT);
  };
  const first = timelineFor('base')[0];
  const Hook: React.FC = scenes[first.id];

  /** A scene at its place on the video's clock. */
  const Placed: React.FC<{ s: TimedScene<Id> }> = ({ s }) => {
    const Scene: React.FC = scenes[s.id];
    return (
      <StoryClock.Provider value={s.cutBeat * BEAT}>
        <LeadContext.Provider value={s.lead}>
          <MarksContext.Provider value={s.marks}>
            <Scene />
          </MarksContext.Provider>
        </LeadContext.Provider>
      </StoryClock.Provider>
    );
  };

  const Cover: React.FC<{ lang: Lang }> = ({ lang }) => (
    <ChevreContext.Provider value={episode}>
      <SoundContext.Provider value={{ silent: true }}>
        <LangProvider lang={lang}>
          <AbsoluteFill style={{ background }}>
            <LeadContext.Provider value={0}>
              <Freeze frame={coverFrame}>
                <Hook />
              </Freeze>
            </LeadContext.Provider>
            <ScoreBug before={score.before} after={score.after} />
          </AbsoluteFill>
        </LangProvider>
      </SoundContext.Provider>
    </ChevreContext.Provider>
  );

  /** Every cut is hard: the yard is one continuous set, and she chews on the video's clock. */
  const Video: React.FC<ChevreProps> = ({ lang, safeZones, music, cover }) => {
    const frame = useCurrentFrame();
    const timeline = timelineFor(lang);
    const total = totalFrames(timeline);
    const silent = useSilent();
    const g = goalFrame(lang);
    return (
      <ChevreContext.Provider value={episode}>
        <LangProvider lang={lang}>
          <AbsoluteFill style={{ background }}>
            {timeline.map((s) => (
              <Sequence key={s.id} name={s.id} from={s.cutBeat * BEAT} durationInFrames={s.frames}>
                <Placed s={s} />
              </Sequence>
            ))}
            <ScoreBug before={score.before} after={score.after} goal={g} middle={scoreAt} />
            <GoalSound goal={g} />
            {cover && frame === 0 ? (
              <AbsoluteFill>
                <Cover lang={lang} />
              </AbsoluteFill>
            ) : null}
            <SafeZones show={safeZones} />
          </AbsoluteFill>
          {silent || music === 0 ? null : (
            // Barely a fade at either end: the music's last beat runs into its first.
            <Audio src={staticFile(musicFile)} volume={(f) => interpolate(f, [0, 2, total - 3, total], [0, music, music, 0], { extrapolateRight: 'clamp' })} />
          )}
        </LangProvider>
      </ChevreContext.Provider>
    );
  };

  /** One scene alone, for Studio and stills, at its place on the video's clock, with the score. */
  const SceneAlone: React.FC<{ id: Id; lang: Lang }> = ({ id, lang }) => {
    const s = timelineFor(lang).find((x) => x.id === id)!;
    return (
      <ChevreContext.Provider value={episode}>
        <LangProvider lang={lang}>
          <AbsoluteFill style={{ background }}>
            <Placed s={s} />
            <Sequence from={-s.cutBeat * BEAT} layout="none">
              <ScoreBug before={score.before} after={score.after} goal={goalFrame(lang)} middle={scoreAt} />
            </Sequence>
          </AbsoluteFill>
        </LangProvider>
      </ChevreContext.Provider>
    );
  };

  /**
   *   <prefix>-FR/AR          the published cuts, cover on frame 0
   *   <prefix>-FR/AR-Check    the same with the Reels/TikTok zones drawn
   *   <prefix>-Cover-FR/AR    the cover as a still
   *   <prefix>-<scene>        each scene alone, in French
   */
  const Compositions: React.FC<{ prefix: string; folder: string }> = ({ prefix, folder }) => {
    const base = timelineFor('base');
    const cuts: { id: string; props: ChevreProps }[] = [
      { id: `${prefix}-FR`, props: { lang: 'fr', safeZones: false, music: 0.6, cover: true } },
      { id: `${prefix}-AR`, props: { lang: 'ar', safeZones: false, music: 0.6, cover: true } },
      { id: `${prefix}-FR-Check`, props: { lang: 'fr', safeZones: true, music: 0.6, cover: false } },
      { id: `${prefix}-AR-Check`, props: { lang: 'ar', safeZones: true, music: 0.6, cover: false } },
    ];
    return (
      <Folder name={folder}>
        {cuts.map((c) => (
          <Composition
            key={c.id}
            id={c.id}
            component={Video}
            {...PORTRAIT}
            fps={FPS}
            durationInFrames={totalFrames(timelineFor(c.props.lang))}
            defaultProps={c.props}
          />
        ))}
        {(['fr', 'ar'] as Lang[]).map((lang) => (
          <Composition
            key={lang}
            id={`${prefix}-Cover-${lang.toUpperCase()}`}
            component={Cover}
            {...PORTRAIT}
            fps={FPS}
            // Long on purpose: Remotion clamps a frozen frame to the composition's length.
            durationInFrames={totalFrames(base)}
            defaultProps={{ lang }}
          />
        ))}
        <Folder name={`${folder}-scenes`}>
          {base.map((s) => (
            <Composition
              key={s.id}
              id={`${prefix}-${s.id}`}
              component={SceneAlone as React.FC<{ id: string; lang: Lang }>}
              {...PORTRAIT}
              fps={FPS}
              durationInFrames={s.frames}
              defaultProps={{ id: s.id as string, lang: 'fr' as Lang }}
            />
          ))}
        </Folder>
      </Folder>
    );
  };

  return { Video, Cover, SceneAlone, Compositions, goalFrame };
};
