import React from 'react';
import { Audio } from '@remotion/media';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from 'remotion';
import { SafeZones } from '../../shared/fx';
import { useSilent } from '../../shared/sound';
import { Lang, LangProvider } from '../../shared/lang';
import { ChaosScene, HookScene, LogoScene } from './scenes/Act1';
import { AttendanceScene, FinanceScene, GradesScene, HomeScene, PaymentScene } from './scenes/Act2';
import { CtaScene, LanguagesScene, RolesScene } from './scenes/Act3';
import { LeadContext, MarksContext, speechWindows, totalFrames } from '../../shared/beat';
import { presentation } from '../../shared/transitions';
import { SceneId, timelineFor } from './timeline';
import { EASE_IN_OUT, FPS } from '../../shared/tokens';

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: HookScene,
  chaos: ChaosScene,
  logo: LogoScene,
  home: HomeScene,
  finance: FinanceScene,
  payment: PaymentScene,
  attendance: AttendanceScene,
  grades: GradesScene,
  languages: LanguagesScene,
  roles: RolesScene,
  cta: CtaScene,
};

export type PromoV2Props = {
  lang: Lang;
  /** Draw the Reels/TikTok interface zones on top, for layout checks. */
  safeZones: boolean;
  /** Music level; the temp track stands in until the real one is chosen. */
  music: number;
  /** Play the recorded voice-over when this language has one. */
  voice: boolean;
};

/** Music level under speech, as a fraction of the normal level. */
const DUCK = 0.3;
const DUCK_IN = 5; // frames to dip before a line
const DUCK_OUT = 14; // frames to come back after it

/** How far the music is ducked at frame f (0 = full music, 1 = fully ducked). */
const duckAt = (f: number, windows: readonly (readonly [number, number])[]) =>
  Math.max(
    0,
    ...windows.map(([a, b]) =>
      interpolate(f, [a - DUCK_IN, a, b, b + DUCK_OUT], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    ),
  );

/** The music bed: the temp track made for this language's timing (see scripts/make-temp-track.mjs). */
export const musicTrackFor = (voiced: boolean, lang: Lang) => (voiced ? `promo-2026/temp-track-${lang}.wav` : 'promo-2026/temp-track.wav');

/** The whole v2 promo: eleven scenes on the beat grid, one language per render. */
export const PromoV2: React.FC<PromoV2Props> = ({ lang, safeZones, music, voice }) => {
  const { width, height } = useVideoConfig();
  const timeline = timelineFor(voice ? lang : 'base');
  const voiced = timeline.some((s) => s.voice);
  const total = totalFrames(timeline);
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
                  // A line that starts a hair before the cut is trimmed rather than shifted.
                  <Sequence from={Math.max(0, voiceFrom)} layout="none" name={`voice ${s.id}`}>
                    <Audio src={staticFile(s.voice.src)} trimBefore={Math.max(0, -voiceFrom)} volume={1} />
                  </Sequence>
                ) : null}
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
        <SafeZones show={safeZones} />
      </AbsoluteFill>
      {silent ? null : (
      <Audio
        src={staticFile(musicTrackFor(voiced, lang))}
        volume={(f) =>
          interpolate(f, [0, 6, total - 30, total], [0, music, music, 0], { extrapolateRight: 'clamp' }) *
          (1 - (1 - DUCK) * duckAt(f, windows))
        }
      />
      )}
    </LangProvider>
  );
};
