import React from 'react';
import { Audio } from '@remotion/media';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from 'remotion';
import { buildTimeline, LeadContext, MarksContext, TimelineJson, totalFrames } from '../../shared/beat';
import { SafeZones } from '../../shared/fx';
import { Lang, LangProvider } from '../../shared/lang';
import { useSilent } from '../../shared/sound';
import { presentation } from '../../shared/transitions';
import { BEAT, EASE_IN_OUT } from '../../shared/tokens';
import { AttendanceScene, HomeScene, PaymentScene } from './scenes/Act2';
import { CtaScene } from './scenes/Act3';
import { AlertScene, PlayIn } from './scenes/Short';
import data from './short.json';

type ShortId = 'alert' | 'attendance' | 'payment' | 'home' | 'cta';

const SCENES: Record<ShortId, React.FC> = {
  alert: AlertScene,
  attendance: AttendanceScene,
  payment: PaymentScene,
  home: HomeScene,
  cta: CtaScene,
};

/** The beat of the full scene each short scene starts at (short.json's `from`). */
const FROM = Object.fromEntries(data.scenes.map((s) => [s.id, 'from' in s ? s.from : 0])) as Record<ShortId, number>;

/** The short cut's timing: no voice, so the base timing is the only one. */
export const SHORT_TIMELINE = buildTimeline(data as TimelineJson<ShortId>, {}, 'base');

export const SHORT_FRAMES = totalFrames(SHORT_TIMELINE);

export const SHORT_MUSIC = 'promo-2026/temp-track-short.wav';

export type PromoShortProps = { lang: Lang; safeZones: boolean; music: number };

/**
 * The short social cut (20.5 s, no voice): the promo's scenes re-ordered so the
 * first frame is already the payoff. The father's lock screen shows Mariem's
 * absence, a rewind shows how he knew (the teacher's register), then the
 * payment the parent is told about, the director's morning, the demo offer.
 * Made after the ×1.4 Arabic cut lost half its viewers between 0:03 and 0:06,
 * on a blurred question and an empty white frame, with the product at 0:10.
 */
export const PromoShort: React.FC<PromoShortProps> = ({ lang, safeZones, music }) => {
  const { width, height } = useVideoConfig();
  const silent = useSilent();
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ background: '#0b1033' }}>
        <TransitionSeries>
          {SHORT_TIMELINE.flatMap((s, i) => {
            const Scene = SCENES[s.id];
            const scene = (
              // Starting a scene part-way: it sees its own frames from beat `from`.
              <Sequence from={-FROM[s.id] * BEAT} name={`${s.id} from beat ${FROM[s.id]}`}>
                <LeadContext.Provider value={s.lead}>
                  <MarksContext.Provider value={s.marks}>
                    <Scene />
                  </MarksContext.Provider>
                </LeadContext.Provider>
              </Sequence>
            );
            const items: React.ReactNode[] = [
              <TransitionSeries.Sequence key={s.id} name={s.id} durationInFrames={s.frames}>
                {i > 0 && SHORT_TIMELINE[i - 1].id === 'alert' ? <PlayIn>{scene}</PlayIn> : scene}
              </TransitionSeries.Sequence>,
            ];
            if (i < SHORT_TIMELINE.length - 1 && s.out.type !== 'cut' && s.out.frames > 0) {
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
          src={staticFile(SHORT_MUSIC)}
          volume={(f) => interpolate(f, [0, SHORT_FRAMES - 30, SHORT_FRAMES], [music, music, 0], { extrapolateRight: 'clamp' })}
        />
      )}
    </LangProvider>
  );
};
