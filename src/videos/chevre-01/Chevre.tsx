import { makeChevreEpisode } from '../../shared/chevre/episode';
import { chevreEpisode } from '../../shared/chevre/marks';
import { AppScene } from './scenes/App';
import { CounterScene, PayScene, RewindScene } from './scenes/Counter';
import { HookScene, OutroScene, TwistScene, TWIST_GOAL } from './scenes/Yard';
import { COPY } from './copy';
import { timelineFor } from './timeline';

/**
 * « La chèvre a encore frappé », ép. 1 « Le reçu »: seven scenes on the 120
 * BPM grid, 30 s, no voice (it reads with the sound off), one render per
 * language. Every cut is hard. It opens on the receipt in his hand, the
 * series' tag over it (the cover), and ends on her stare under the end card;
 * the score goes from 0 – 0 to 0 – 1 when she fails to get the phone.
 */
export const Chevre01 = makeChevreEpisode({
  episode: chevreEpisode(1, COPY.ask),
  scenes: { hook: HookScene, counter: CounterScene, rewind: RewindScene, pay: PayScene, app: AppScene, twist: TwistScene, outro: OutroScene },
  timelineFor,
  /** Synthesized on this timeline by scripts/chevre-01/make-music.mjs. */
  music: 'chevre-01/music.wav',
  goal: { scene: 'twist', beat: TWIST_GOAL },
  // Left of the phone he holds up out of her reach.
  scoreAt: [400, 680],
});
