import { buildTimeline, TimelineJson } from '../../shared/beat';
import type { Lang } from '../../shared/lang';
import data from './timeline.json';

export type SceneId = 'boxes' | 'hook' | 'flood' | 'thursday' | 'rewind' | 'director' | 'sameday' | 'evening' | 'outro';

/** No voice-over: the video reads, so both languages share one timing. */
export const timelineFor = (lang: Lang | 'base') => buildTimeline(data as TimelineJson<SceneId>, {}, lang);

export const TIMELINE = timelineFor('base');

/** Where a scene's cut lands, in frames of the whole video. */
export const sceneStart = (id: SceneId) => (TIMELINE.find((s) => s.id === id)?.cutBeat ?? 0) * 15;
