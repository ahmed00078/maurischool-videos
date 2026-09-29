import { buildTimeline, TimelineJson, VoiceFile } from '../../shared/beat';
import type { Lang } from '../../shared/lang';
import data from './timeline.json';
import voiceAr from './voice.ar.json';
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

/** Recorded voice-overs, per language (Standard Arabic for now; a Hassaniya take will replace it). */
const VOICES: Partial<Record<Lang, VoiceFile>> = {
  fr: voiceFr as unknown as VoiceFile,
  ar: voiceAr as unknown as VoiceFile,
};

/** This video's timing in a language, stretched to its voice ('base' = no voice). */
export const timelineFor = (lang: Lang | 'base') => buildTimeline(data as TimelineJson<SceneId>, VOICES, lang);

/** The unvoiced timing: the no-voice cuts, and the reference every voice stretches from. */
export const TIMELINE = timelineFor('base');
