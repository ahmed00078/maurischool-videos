import React from 'react';
import { Audio } from '@remotion/media';
import { linearTiming, TransitionPresentation, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { flip } from '@remotion/transitions/flip';
import { iris } from '@remotion/transitions/iris';
import { pushCut } from '@remotion/transitions/push-cut';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from 'remotion';
import { SafeZones } from './fx';
import { Lang, LangProvider } from './lang';
import { ChaosScene, HookScene, LogoScene } from './scenes/Act1';
import { AttendanceScene, FinanceScene, GradesScene, HomeScene, PaymentScene } from './scenes/Act2';
import { CtaScene, LanguagesScene, RolesScene } from './scenes/Act3';
import { LeadContext, SceneId, TIMELINE, TOTAL_FRAMES, TransitionType } from './timeline';
import { EASE_IN_OUT } from './tokens';

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
};

/** "Forward" is right in French and left in Arabic, so movement follows reading. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentation = (type: TransitionType, lang: Lang, width: number, height: number): TransitionPresentation<any> => {
  const forward = lang === 'ar' ? 'from-left' : 'from-right';
  switch (type) {
    case 'pushCut':
      return pushCut({ flashColor: '#ffffff', flashOpacity: 0.55 });
    case 'slideUp':
      return slide({ direction: 'from-bottom' });
    case 'slideForward':
      return slide({ direction: forward });
    case 'flip':
      return flip({ direction: forward });
    case 'iris':
      return iris({ width, height });
    case 'wipe':
      return wipe({ direction: forward });
    case 'fade':
    case 'cut':
    default:
      return fade();
  }
};

/** The whole v2 promo: eleven scenes on the beat grid, one language per render. */
export const PromoV2: React.FC<PromoV2Props> = ({ lang, safeZones, music }) => {
  const { width, height } = useVideoConfig();
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ background: '#0b1033' }}>
        <TransitionSeries>
          {TIMELINE.flatMap((s, i) => {
            const Scene = SCENE_COMPONENTS[s.id];
            const items: React.ReactNode[] = [
              <TransitionSeries.Sequence key={s.id} name={s.id} durationInFrames={s.frames}>
                <LeadContext.Provider value={s.lead}>
                  <Scene />
                </LeadContext.Provider>
              </TransitionSeries.Sequence>,
            ];
            const last = i === TIMELINE.length - 1;
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
      <Audio
        src={staticFile('v2/temp-track.wav')}
        volume={(f) => interpolate(f, [0, 6, TOTAL_FRAMES - 30, TOTAL_FRAMES], [0, music, music, 0], { extrapolateRight: 'clamp' })}
      />
    </LangProvider>
  );
};
