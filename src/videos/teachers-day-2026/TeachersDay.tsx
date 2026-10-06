import React from 'react';
import { Audio } from '@remotion/media';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { AbsoluteFill, Freeze, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { LeadContext, MarksContext, totalFrames } from '../../shared/beat';
import { SafeZones } from '../../shared/fx';
import { Lang, LangProvider } from '../../shared/lang';
import { SoundContext, useSilent } from '../../shared/sound';
import { EASE_IN_OUT } from '../../shared/tokens';
import { presentation } from '../../shared/transitions';
import { RegisterScene } from './scenes/App';
import { BoardHook, BoardThanks } from './scenes/Board';
import { NightScene } from './scenes/Night';
import { SceneId, timelineFor } from './timeline';

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  board: BoardHook,
  night: NightScene,
  register: RegisterScene,
  thanks: BoardThanks,
};

export type TeachersDayProps = {
  lang: Lang;
  /** Draw the Reels/TikTok interface zones on top, for layout checks. */
  safeZones: boolean;
  /** Music level. */
  music: number;
  /** Put the cover on frame 0, where platforms take the thumbnail from. */
  cover: boolean;
};

/** The music, synthesized on this timeline by scripts/teachers-day-2026/make-music.mjs. */
export const MUSIC = 'teachers-day-2026/music.wav';

/** The board scene opens on the question already written: its first frame is the cover. */
const COVER_FRAME = 0;

/** The cover: the board with its question, on a still. */
export const Cover: React.FC<{ lang: Lang }> = ({ lang }) => (
  <SoundContext.Provider value={{ silent: true }}>
    <LangProvider lang={lang}>
      <LeadContext.Provider value={0}>
        <Freeze frame={COVER_FRAME}>
          <BoardHook />
        </Freeze>
      </LeadContext.Provider>
    </LangProvider>
  </SoundContext.Provider>
);

/**
 * World Teachers' Day 2026: four scenes on the 120 BPM grid, 23 s, no voice
 * (it reads with the sound off), one render per language. The last frame is
 * the first, so it loops; the music only dips at the very end.
 */
export const TeachersDay: React.FC<TeachersDayProps> = ({ lang, safeZones, music, cover }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const timeline = timelineFor(lang);
  const total = totalFrames(timeline);
  const silent = useSilent();
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ background: '#172a22' }}>
        <TransitionSeries>
          {timeline.flatMap((s, i) => {
            const Scene = SCENE_COMPONENTS[s.id];
            const items: React.ReactNode[] = [
              <TransitionSeries.Sequence key={s.id} name={s.id} durationInFrames={s.frames}>
                <LeadContext.Provider value={s.lead}>
                  <MarksContext.Provider value={s.marks}>
                    <Scene />
                  </MarksContext.Provider>
                </LeadContext.Provider>
              </TransitionSeries.Sequence>,
            ];
            const last = i === timeline.length - 1;
            if (!last && s.out.type !== 'cut' && s.out.frames > 0) {
              items.push(
                <TransitionSeries.Transition
                  key={`${s.id}-out`}
                  presentation={presentation(s.out.type, lang, width, height)}
                  timing={linearTiming({ durationInFrames: s.out.frames, easing: EASE_IN_OUT })}
                />,
              );
            }
            return items;
          })}
        </TransitionSeries>
        {cover && frame === 0 ? (
          <AbsoluteFill>
            <Cover lang={lang} />
          </AbsoluteFill>
        ) : null}
        <SafeZones show={safeZones} />
      </AbsoluteFill>
      {silent ? null : (
        <Audio src={staticFile(MUSIC)} volume={(f) => interpolate(f, [0, 4, total - 8, total], [0, music, music, 0], { extrapolateRight: 'clamp' })} />
      )}
    </LangProvider>
  );
};
