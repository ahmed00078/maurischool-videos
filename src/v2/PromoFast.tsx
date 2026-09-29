import React from 'react';
import { Audio } from '@remotion/media';
import { AbsoluteFill, Freeze, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { SafeZones } from './fx';
import { Lang, LangProvider } from './lang';
import { PromoV2 } from './PromoV2';
import { HomeScene } from './scenes/Act2';
import { SoundContext } from './sound';
import { LeadContext, MarksContext, timelineFor, totalFrames } from './timeline';
import { BEAT } from './tokens';

/**
 * The social cuts: the whole voiced promo played faster (French ×1.3,
 * Arabic ×1.4), with a cover on the first frame.
 *
 * Picture: a <Sequence playbackRate> plays the promo at `speed`, silently.
 * Remotion multiplies every frame inside by the rate, so springs and tweens
 * run on fractional frames and stay smooth instead of skipping frames.
 *
 * Sound: the normal mix (voice, ducked music, effects) is rendered to WAV and
 * time-stretched with ffmpeg's atempo, which keeps the voice's pitch; see
 * scripts/make-fast-mix.mjs. Stretching the mix rather than each clip keeps
 * the ducking and every effect exactly where the picture puts them.
 *
 * Length: Remotion clips a nested sequence against the composition's own
 * duration in unscaled frames, so this composition keeps the full original
 * length and is rendered with --frames=0-<fastFrames - 1>. Past that point the
 * picture has already ended; nothing after it is ever encoded.
 */
export type PromoFastProps = {
  lang: Lang;
  speed: number;
  cover: boolean;
  safeZones: boolean;
};

export const SPEEDS: Record<Lang, number> = { fr: 1.3, ar: 1.4 };

/** Frames the fast cut really lasts: render with --frames=0-(this - 1). */
export const fastFrames = (lang: Lang, speed: number) => Math.ceil(totalFrames(timelineFor(lang)) / speed);

export const fastMixFile = (lang: Lang, speed: number) => `v2/mix/${lang}-x${speed}.wav`;

/**
 * Frames the cover holds at the start. Platforms take the first frame as the
 * default thumbnail, so one frame is enough, and too short to read as a cut.
 */
export const COVER_FRAMES = 1;

/**
 * The cover: the director's home, phone flat, camera pushed in, headline
 * written. Just before the alerts lift: mid-lift they are tilted and see-through,
 * which reads as a glitch on a still.
 */
const COVER_BEAT = 5.9;

export const Cover: React.FC<{ lang: Lang }> = ({ lang }) => {
  const home = timelineFor(lang).find((s) => s.id === 'home');
  if (!home) throw new Error('No home scene in the timeline');
  return (
    <SoundContext.Provider value={{ silent: true }}>
      <LangProvider lang={lang}>
        <LeadContext.Provider value={home.lead}>
          <MarksContext.Provider value={home.marks}>
            <Freeze frame={home.lead + Math.round(COVER_BEAT * BEAT)}>
              <HomeScene />
            </Freeze>
          </MarksContext.Provider>
        </LeadContext.Provider>
      </LangProvider>
    </SoundContext.Provider>
  );
};

export const PromoFast: React.FC<PromoFastProps> = ({ lang, speed, cover, safeZones }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#0b1033' }}>
      <Sequence playbackRate={speed} name={`promo ×${speed}`}>
        <SoundContext.Provider value={{ silent: true }}>
          <PromoV2 lang={lang} voice safeZones={false} music={0} />
        </SoundContext.Provider>
      </Sequence>
      {cover && frame < COVER_FRAMES ? (
        <AbsoluteFill>
          <Cover lang={lang} />
        </AbsoluteFill>
      ) : null}
      <SafeZones show={safeZones} />
      <Audio src={staticFile(fastMixFile(lang, speed))} />
    </AbsoluteFill>
  );
};
