import { buildTimeline, TimelineJson } from '../../shared/beat';
import type { Lang } from '../../shared/lang';
import data from './timeline.json';

export type SceneId = 'board' | 'night' | 'register' | 'thanks';

/**
 * No voice-over: the video reads, so both languages share one timing. The
 * `lang` argument is kept so a recorded voice can be fitted later, as in
 * promo-2026 (scripts/fit-voice.mjs).
 */
export const timelineFor = (lang: Lang | 'base') => buildTimeline(data as TimelineJson<SceneId>, {}, lang);

export const TIMELINE = timelineFor('base');
