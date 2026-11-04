import { buildTimeline, TimelineJson, VoiceFile } from '../../shared/beat';
import type { Lang } from '../../shared/lang';
import data from './timeline.json';

export type SceneId =
  | 'intro'
  | 'actMoney'
  | 'fees'
  | 'finance'
  | 'payroll'
  | 'actClasses'
  | 'attendance'
  | 'grades'
  | 'reportcards'
  | 'timetable'
  | 'actFamilies'
  | 'announcements'
  | 'parent'
  | 'dashboard'
  | 'more'
  | 'close';

/** Recorded voice-overs, per language: none yet. scripts/fit-voice.mjs writes voice.<lang>.json; import it here. */
const VOICES: Partial<Record<Lang, VoiceFile>> = {};

/** The tour's timing in a language, stretched to its voice ('base' = no voice). */
export const timelineFor = (lang: Lang | 'base') => buildTimeline(data as TimelineJson<SceneId>, VOICES, lang);

/** The unvoiced timing: the reference every voice stretches from. */
export const TIMELINE = timelineFor('base');
