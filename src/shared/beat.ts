import { createContext, useContext } from 'react';
import { useCurrentFrame } from 'remotion';
import type { Lang } from './lang';
import { BEAT, FPS } from './tokens';

/**
 * The beat grid every video is cut on, and the recorded voice fitted to it.
 *
 * A video describes its scenes in a timeline.json (lengths in beats, the
 * transition into the next scene) and gets its voice files from
 * scripts/fit-voice.mjs (voice.<lang>.json). buildTimeline turns both into
 * frame-exact sequences; scenes then time themselves with useBeat()/useMarks().
 */

export type TransitionType = 'cut' | 'pushCut' | 'slideUp' | 'slideForward' | 'flip' | 'fade' | 'iris' | 'wipe';

export type TimelineJson<Id extends string = string> = {
  bpm: number;
  fps: number;
  scenes: { id: Id; beats: number; out: { type: TransitionType; frames: number } }[];
};

/** One recorded line, as written by scripts/fit-voice.mjs. */
export type VoiceLine = {
  src: string;
  /** Where the file's time 0 sits after the scene's cut, in seconds (may be negative). */
  offsetSeconds: number;
  /** When speech starts and ends, in seconds after the cut. */
  speech: [number, number];
};

/** A voice.<lang>.json file. */
export type VoiceFile = {
  scenes: Record<string, VoiceLine & { beats: number; marks: Record<string, number> }>;
};

export type TimedScene<Id extends string = string> = {
  id: Id;
  beats: number;
  /** Beat on the master timeline where this scene's cut lands. */
  cutBeat: number;
  /** Frames this scene runs before its own cut (half of the incoming transition). */
  lead: number;
  /** Sequence length, including half of each neighbouring transition. */
  frames: number;
  out: { type: TransitionType; frames: number };
  /** Named beats the scene times itself to, measured from the voice. */
  marks: Record<string, number>;
  voice?: VoiceLine;
};

/**
 * Cuts sit on the beat grid; each transition straddles its cut, half before
 * and half after. So a scene's sequence is its beats plus half of each
 * neighbouring transition, and the whole video is exactly the sum of beats.
 *
 * With a recorded voice, a scene only grows (by whole beats) to fit its line.
 */
export const buildTimeline = <Id extends string>(
  data: TimelineJson<Id>,
  voices: Partial<Record<Lang, VoiceFile>>,
  lang: Lang | 'base',
): TimedScene<Id>[] => {
  const voice = lang === 'base' ? undefined : voices[lang];
  let beat = 0;
  const scenes = data.scenes;
  return scenes.map((s, i) => {
    const line = voice?.scenes[s.id];
    const beats = line ? Math.max(s.beats, line.beats) : s.beats;
    const inFrames = i === 0 ? 0 : scenes[i - 1].out.frames;
    const outFrames = i === scenes.length - 1 ? 0 : s.out.frames;
    const scene: TimedScene<Id> = {
      ...s,
      beats,
      cutBeat: beat,
      lead: inFrames / 2,
      frames: beats * BEAT + inFrames / 2 + outFrames / 2,
      marks: line?.marks ?? {},
      voice: line ? { src: line.src, offsetSeconds: line.offsetSeconds, speech: line.speech } : undefined,
    };
    beat += beats;
    return scene;
  });
};

export const totalFrames = (timeline: TimedScene[]) => timeline.reduce((sum, s) => sum + s.beats, 0) * BEAT;

/** Where speech is heard, in frames of the whole video: the music dips under it. */
export const speechWindows = (timeline: TimedScene[]) =>
  timeline
    .filter((s) => s.voice)
    .map((s) => {
      const cut = s.cutBeat * BEAT;
      const [a, b] = s.voice!.speech;
      return [cut + Math.round(a * FPS), cut + Math.round(b * FPS)] as const;
    });

/** The current scene's lead, so a scene can say "on beat 3" and mean it. */
export const LeadContext = createContext(0);

/**
 * Frame of a beat inside the current scene: beat 0 is the scene's own cut.
 * Fractions are fine (1.5 = the "and" after beat 1).
 */
export const useBeat = () => {
  const lead = useContext(LeadContext);
  return (b: number) => lead + Math.round(b * BEAT);
};

/** The current scene's named beats, set from its recorded voice line. */
export const MarksContext = createContext<Record<string, number>>({});

/** A named beat for this scene, or the fallback when there is no voice to follow. */
export const useMarks = () => {
  const marks = useContext(MarksContext);
  return (name: string, fallback: number) => marks[name] ?? fallback;
};

/**
 * The video's own clock, for idle motion that must not jump on a hard cut
 * (breathing, blinks, a goat chewing): a scene cut from one continuous set
 * provides the frame its sequence starts at, and useStoryFrame() counts from
 * the start of the video.
 */
export const StoryClock = createContext(0);
export const useStoryFrame = () => useCurrentFrame() + useContext(StoryClock);
