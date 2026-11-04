import React from 'react';
import { Audio } from '@remotion/media';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from 'remotion';
import { LeadContext, MarksContext, speechWindows, totalFrames } from '../../shared/beat';
import { Lang, LangProvider } from '../../shared/lang';
import { useSilent } from '../../shared/sound';
import { EASE_IN_OUT, FPS } from '../../shared/tokens';
import { presentation } from '../../shared/transitions';
import { ActScene, CloseScene, IntroScene, MoreScene } from './scenes/Bookends';
import {
  AnnouncementsChapter,
  AttendanceChapter,
  DashboardChapter,
  FeesChapter,
  FinanceChapter,
  GradesChapter,
  ParentChapter,
  PayrollChapter,
  ReportCardsChapter,
  TimetableChapter,
} from './scenes/Chapters';
import { SceneId, timelineFor } from './timeline';

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  intro: IntroScene,
  actMoney: () => <ActScene index={0} />,
  fees: FeesChapter,
  finance: FinanceChapter,
  payroll: PayrollChapter,
  actClasses: () => <ActScene index={1} />,
  attendance: AttendanceChapter,
  grades: GradesChapter,
  reportcards: ReportCardsChapter,
  timetable: TimetableChapter,
  actFamilies: () => <ActScene index={2} />,
  announcements: AnnouncementsChapter,
  parent: ParentChapter,
  dashboard: DashboardChapter,
  more: MoreScene,
  close: CloseScene,
};

export type TourProps = {
  lang: Lang;
  /** Music level (scripts/tour-2026/make-music.mjs writes the bed, one per voiced timing). */
  music: number;
  /** Play the recorded voice-over when this language has one. */
  voice: boolean;
};

/** Music level under speech, as a fraction of the normal level. */
const DUCK = 0.28;

const duckAt = (f: number, windows: readonly (readonly [number, number])[]) =>
  Math.max(0, ...windows.map(([a, b]) => interpolate(f, [a - 5, a, b, b + 14], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));

/**
 * The tour: an opening, the ten chapters in three acts (each announced by a
 * card) and the dashboard they end on, « Et aussi… » and the closing, on the
 * beat grid, landscape, one language per render.
 */
export const Tour: React.FC<TourProps> = ({ lang, music, voice }) => {
  const { width, height } = useVideoConfig();
  const timeline = timelineFor(voice ? lang : 'base');
  const total = totalFrames(timeline);
  const voiced = timeline.some((s) => s.voice);
  const windows = speechWindows(timeline);
  const silent = useSilent();
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ background: '#0b1033' }}>
        <TransitionSeries>
          {timeline.flatMap((s, i) => {
            const Scene = SCENE_COMPONENTS[s.id];
            const voiceFrom = s.voice ? s.lead + Math.round(s.voice.offsetSeconds * FPS) : 0;
            const items: React.ReactNode[] = [
              <TransitionSeries.Sequence key={s.id} name={s.id} durationInFrames={s.frames}>
                <LeadContext.Provider value={s.lead}>
                  <MarksContext.Provider value={s.marks}>
                    <Scene />
                  </MarksContext.Provider>
                </LeadContext.Provider>
                {s.voice && !silent ? (
                  <Sequence from={Math.max(0, voiceFrom)} layout="none" name={`voice ${s.id}`}>
                    <Audio src={staticFile(s.voice.src)} trimBefore={Math.max(0, -voiceFrom)} volume={1} />
                  </Sequence>
                ) : null}
              </TransitionSeries.Sequence>,
            ];
            if (i < timeline.length - 1 && s.out.type !== 'cut' && s.out.frames > 0) {
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
      </AbsoluteFill>
      {silent || music <= 0 ? null : (
        <Audio
          src={staticFile(voiced ? `tour-2026/music-${lang}.wav` : 'tour-2026/music.wav')}
          volume={(f) => interpolate(f, [0, 8, total - 45, total], [0, music, music, 0], { extrapolateRight: 'clamp' }) * (1 - (1 - DUCK) * duckAt(f, windows))}
        />
      )}
    </LangProvider>
  );
};
