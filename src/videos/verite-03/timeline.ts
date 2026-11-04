import { buildTimeline, TimelineJson } from '../../shared/beat';
import type { Lang } from '../../shared/lang';
import type { VeriteSceneId } from '../../shared/verite/episode';
import { CHECK_GAP } from '../../shared/verite/scenes';
import data from './timeline.json';

/** Beats each notification stays on screen in `check`. */
export const CHECK_READ = data.checkRead as [number, number, number];

/** The beat of the check scene where BRAVO lands over the FAUX: just after the last row closes. */
export const BRAVO_BEAT = 2 + CHECK_READ[0] + CHECK_READ[1] + CHECK_READ[2] + 2 * CHECK_GAP + data.bravoAfter;

/** Beats the father's last line adds to the outro: the plain cut is this much shorter. */
export const TEASE_BEATS = 3;

const json = data as TimelineJson<VeriteSceneId>;
const plain: TimelineJson<VeriteSceneId> = {
  ...json,
  scenes: json.scenes.map((s) => (s.id === 'outro' ? { ...s, beats: s.beats - TEASE_BEATS } : s)),
};

/** No voice-over: both languages share one timing. `tease` keeps the father's last line. */
export const timelineFor = (tease: boolean) => (lang: Lang | 'base') => buildTimeline(tease ? json : plain, {}, lang);
