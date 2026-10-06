import React from 'react';
import { Audio } from '@remotion/media';
import { AbsoluteFill, Composition, Folder, Freeze, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { LeadContext, MarksContext, TimedScene, totalFrames } from '../beat';
import { SafeZones } from '../fx';
import { PORTRAIT } from '../formats';
import { Lang, LangProvider } from '../lang';
import { SoundContext, useSilent } from '../sound';
import { BEAT, FPS } from '../tokens';
import { Episode, EpisodeContext, StoryClock } from './stage';

/**
 * One episode of « Qui ne dit pas la vérité ? », assembled: its scenes on its
 * timeline, the music, the cover on frame 0, and its compositions. An episode
 * is a copy.ts, a timeline.json, its scenes (the kit's, told its story) and
 * a call to makeEpisode.
 */

export type VeriteSceneId = 'hook' | 'son' | 'daughter' | 'father' | 'vote' | 'check' | 'busted' | 'outro';

export type EpisodeDef = {
  episode: Episode;
  scenes: Record<VeriteSceneId, React.FC>;
  timelineFor: (lang: Lang | 'base') => TimedScene<VeriteSceneId>[];
  /** Under public/, synthesized on the timeline by scripts/<video>/make-music.mjs. */
  music: string;
  /** The hook once the question is written and before anyone glances: the cover. */
  coverFrame: number;
};

export type VeriteProps = {
  lang: Lang;
  /** Draw the Reels/TikTok interface zones on top, for layout checks. */
  safeZones: boolean;
  /** Music level. */
  music: number;
  /** Put the cover on frame 0, where platforms take the thumbnail from. */
  cover: boolean;
};

export const makeEpisode = (def: EpisodeDef) => {
  const { episode, scenes, timelineFor, music: musicFile, coverFrame } = def;
  const Hook = scenes.hook;

  const Cover: React.FC<{ lang: Lang }> = ({ lang }) => (
    <EpisodeContext.Provider value={episode}>
      <SoundContext.Provider value={{ silent: true }}>
        <LangProvider lang={lang}>
          <LeadContext.Provider value={0}>
            <Freeze frame={coverFrame}>
              <Hook />
            </Freeze>
          </LeadContext.Provider>
        </LangProvider>
      </SoundContext.Provider>
    </EpisodeContext.Provider>
  );

  /**
   * Every cut is hard (the lineup is one set), so scenes are plain sequences
   * on the 120 BPM grid and share a story clock for their idle motion. No
   * voice: it reads with the sound off. One render per language.
   */
  const Video: React.FC<VeriteProps> = ({ lang, safeZones, music, cover }) => {
    const frame = useCurrentFrame();
    const timeline = timelineFor(lang);
    const total = totalFrames(timeline);
    const silent = useSilent();
    return (
      <EpisodeContext.Provider value={episode}>
        <LangProvider lang={lang}>
          <AbsoluteFill style={{ background: '#0b1033' }}>
            {timeline.map((s) => {
              const Scene = scenes[s.id];
              const from = s.cutBeat * BEAT;
              return (
                <Sequence key={s.id} name={s.id} from={from} durationInFrames={s.frames}>
                  <StoryClock.Provider value={from}>
                    <LeadContext.Provider value={s.lead}>
                      <MarksContext.Provider value={s.marks}>
                        <Scene />
                      </MarksContext.Provider>
                    </LeadContext.Provider>
                  </StoryClock.Provider>
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
            <Audio src={staticFile(musicFile)} volume={(f) => interpolate(f, [0, 3, total - 10, total], [0, music, music, 0], { extrapolateRight: 'clamp' })} />
          )}
        </LangProvider>
      </EpisodeContext.Provider>
    );
  };

  const SceneAlone: React.FC<{ id: VeriteSceneId; lang: Lang }> = ({ id, lang }) => {
    const Scene = scenes[id];
    const scene = timelineFor(lang).find((s) => s.id === id);
    return (
      <EpisodeContext.Provider value={episode}>
        <LangProvider lang={lang}>
          <StoryClock.Provider value={(scene?.cutBeat ?? 0) * BEAT}>
            <LeadContext.Provider value={scene?.lead ?? 0}>
              <MarksContext.Provider value={scene?.marks ?? {}}>
                <Scene />
              </MarksContext.Provider>
            </LeadContext.Provider>
          </StoryClock.Provider>
        </LangProvider>
      </EpisodeContext.Provider>
    );
  };

  /**
   *   <prefix>-FR/AR          the published cuts, cover on frame 0
   *   <prefix>-FR/AR-Check    the same with the Reels/TikTok zones drawn
   *   <prefix>-Cover-FR/AR    the cover as a still
   *   <prefix>-<scene>        each scene alone, in French
   *
   * `cutsOnly` leaves out the cover and the scenes: for a second cut of the
   * same episode (a different ending), whose cover and scenes are the first's.
   */
  const Compositions: React.FC<{ prefix: string; folder: string; cutsOnly?: boolean }> = ({ prefix, folder, cutsOnly = false }) => {
    const base = timelineFor('base');
    const cuts: { id: string; props: VeriteProps }[] = [
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
        {cutsOnly ? null : (
          <>
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
                  component={SceneAlone}
                  {...PORTRAIT}
                  fps={FPS}
                  durationInFrames={s.frames}
                  defaultProps={{ id: s.id, lang: 'fr' as Lang }}
                />
              ))}
            </Folder>
          </>
        )}
      </Folder>
    );
  };

  return { Video, Cover, SceneAlone, Compositions };
};
