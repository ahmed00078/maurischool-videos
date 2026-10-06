import { buildTimeline, TimelineJson } from '../../shared/beat';
import type { Lang } from '../../shared/lang';
import type { VeriteSceneId } from '../../shared/verite/episode';
import data from './timeline.json';

/** No voice-over: both languages share one timing (see teachers-day-2026). */
export const timelineFor = (lang: Lang | 'base') => buildTimeline(data as TimelineJson<VeriteSceneId>, {}, lang);

export const TIMELINE = timelineFor('base');
