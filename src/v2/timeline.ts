import { createContext, useContext } from 'react';
import data from './timeline.json';
import { BEAT } from './tokens';

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
};

/**
 * Cuts sit on the beat grid; each transition straddles its cut, half before
 * and half after. So a scene's sequence is its beats plus half of each
 * neighbouring transition, and the whole video is exactly the sum of beats.
 */
export const TIMELINE: TimedScene[] = (() => {
  let beat = 0;
  const scenes = data.scenes as { id: SceneId; beats: number; out: { type: TransitionType; frames: number } }[];
  return scenes.map((s, i) => {
    const inFrames = i === 0 ? 0 : scenes[i - 1].out.frames;
    const outFrames = i === scenes.length - 1 ? 0 : s.out.frames;
    const scene: TimedScene = {
      ...s,
      cutBeat: beat,
      lead: inFrames / 2,
      frames: s.beats * BEAT + inFrames / 2 + outFrames / 2,
    };
    beat += s.beats;
    return scene;
  });
})();

export const TOTAL_BEATS = TIMELINE.reduce((sum, s) => sum + s.beats, 0);
export const TOTAL_FRAMES = TOTAL_BEATS * BEAT;

export const sceneById = (id: SceneId) => {
  const s = TIMELINE.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

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
