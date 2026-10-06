import { buildTimeline, TimelineJson } from '../../shared/beat';
import type { Lang } from '../../shared/lang';
import data from './timeline.json';

export type SceneId = 'hook' | 'yard' | 'counter' | 'rewind' | 'pay' | 'app' | 'twist' | 'outro';

/** No voice-over: the video reads, so both languages share one timing. */
export const timelineFor = (lang: Lang | 'base') => buildTimeline(data as TimelineJson<SceneId>, {}, lang);

export const TIMELINE = timelineFor('base');
