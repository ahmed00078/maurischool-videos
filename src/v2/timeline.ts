import { createContext, useContext } from 'react';
import type { Lang } from './lang';
import data from './timeline.json';
import { BEAT, FPS } from './tokens';
import voiceFr from './voice.fr.json';

export type SceneId =
  | 'hook'
  | 'chaos'
  | 'logo'
  | 'home'
  | 'finance'
  | 'payment'
  | 'attendance'
  | 'grades'
  | 'languages'
  | 'roles'
  | 'cta';

export type TransitionType = 'cut' | 'pushCut' | 'slideUp' | 'slideForward' | 'flip' | 'fade' | 'iris' | 'wipe';

/** One recorded line, as written by scripts/fit-voice.mjs. */
export type VoiceLine = {
  src: string;
  /** Where the file's time 0 sits after the scene's cut, in seconds (may be negative). */
  offsetSeconds: number;
  /** When speech starts and ends, in seconds after the cut. */
  speech: [number, number];
};

type VoiceFile = {
  scenes: Record<string, VoiceLine & { beats: number; marks: Record<string, number> }>;
};

/** Recorded voice-overs, per language. Arabic has none yet and keeps the base timing. */
const VOICES: Partial<Record<Lang, VoiceFile>> = {
  fr: voiceFr as unknown as VoiceFile,
};

export type TimedScene = {
  id: SceneId;
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
export const timelineFor = (lang: Lang | 'base'): TimedScene[] => {
  const voice = lang === 'base' ? undefined : VOICES[lang];
  let beat = 0;
  const scenes = data.scenes as { id: SceneId; beats: number; out: { type: TransitionType; frames: number } }[];
  return scenes.map((s, i) => {
    const line = voice?.scenes[s.id];
    const beats = line ? Math.max(s.beats, line.beats) : s.beats;
    const inFrames = i === 0 ? 0 : scenes[i - 1].out.frames;
    const outFrames = i === scenes.length - 1 ? 0 : s.out.frames;
    const scene: TimedScene = {
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

/** The unvoiced timing (and the Arabic cut until its voice is recorded). */
export const TIMELINE = timelineFor('base');

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
