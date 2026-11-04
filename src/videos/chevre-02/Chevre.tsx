import { makeChevreEpisode } from '../../shared/chevre/episode';
import { chevreEpisode } from '../../shared/chevre/marks';
import { COPY } from './copy';
import { BuzzScene, ProofScene } from './scenes/Phone';
import { DramaScene, HookScene, OutroScene, ReplayScene, REVENGE_GOAL, RevengeScene } from './scenes/Yard';
import { timelineFor } from './timeline';

/**
 * « La chèvre a encore frappé », ép. 2 « La copie »: seven scenes on the 120
 * BPM grid, 24 s, no voice (it reads with the sound off), one render per
 * language. Every cut is hard. Frame 0 is the cover: her stare and the red
 * 17/20 in her mouth. The score goes from 0 – 1 to 0 – 2 when she fails to
 * get the phone; it ends on her stare under the end card, and loops.
 */
export const Chevre02 = makeChevreEpisode({
  episode: chevreEpisode(2, COPY.ask),
  scenes: { hook: HookScene, replay: ReplayScene, drama: DramaScene, buzz: BuzzScene, proof: ProofScene, revenge: RevengeScene, outro: OutroScene },
  timelineFor,
  /** Synthesized on this timeline by scripts/chevre-02/make-music.mjs. */
  music: 'chevre-02/music.wav',
  goal: { scene: 'revenge', beat: REVENGE_GOAL },
  // Left of the phone Papa holds up out of her reach.
  scoreAt: [400, 680],
});
