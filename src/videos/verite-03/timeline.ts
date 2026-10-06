import { buildTimeline, TimelineJson } from '../../shared/beat';
import type { Lang } from '../../shared/lang';
import type { VeriteSceneId } from '../../shared/verite/episode';
import data from './timeline.json';

/** Beats the father's last line adds to the outro: the plain cut is this much shorter. */
export const TEASE_BEATS = 3;

const json = data as TimelineJson<VeriteSceneId>;
const plain: TimelineJson<VeriteSceneId> = {
  ...json,
  scenes: json.scenes.map((s) => (s.id === 'outro' ? { ...s, beats: s.beats - TEASE_BEATS } : s)),
};

/** No voice-over: both languages share one timing. `tease` keeps the father's last line. */
export const timelineFor = (tease: boolean) => (lang: Lang | 'base') => buildTimeline(tease ? json : plain, {}, lang);
