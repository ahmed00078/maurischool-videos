// Synthesizes chevre-02's music (« La chèvre a encore frappé », ép. 2 « La copie »): node scripts/chevre-02/make-music.mjs
//   → public/chevre-02/music.wav
//
// The series' score (scripts/chevre/music-kit.mjs) in G major at 120 BPM, on
// the video's timeline.json; the cues inside a scene are the scenes' own
// beats, copied here. Under a reading hold, no new melody: only the beat.
//   hook         pizzicato and the goat's motif, as every episode opens
//   replay       slow motion: the motif at half speed an octave down over a
//                drone, a low thud on the bite
//   drama        nearly nothing: a low drone under the three « dun » hits (sound effects)
//   buzz, proof  the bright groove comes in with the buzz; a bell on the loupe
//   revenge      the groove and the proud tune; it stops dead when Papa lifts
//                the phone, the whistle and two bells for the score, and it
//                comes back on her stare
//   outro        the groove, fuller, a bell under the logo; the last bar walks up
//                into the first beat, so the music loops
import { score } from '../chevre/music-kit.mjs';

const m = score(new URL('../../src/videos/chevre-02/timeline.json', import.meta.url));
const { at, TOTAL, pluck, marimba, hat, kick, drone, bell, motif, pizz, groove, tune, goal, loopBack } = m;
const G = 43;

// ── hook: pizzicato and the motif, answered a third higher ──
pizz(at.hook, at.replay);
for (const [start, up] of [[0.5, 0], [2.5, 4], [4.5, 0]]) motif(at.hook + start, up);

// ── replay: everything slowed, as on a sports replay ──
{
  const s = at.replay;
  drone(s, at.drama, 31, 0.05);
  drone(s, at.drama, 38, 0.035);
  for (let b = s; b < at.drama; b += 1) pluck(b, b - s < 3 ? G - 12 + 7 : G - 12, 0.6, 0.9, -0.1);
  motif(s + 0.5, -12, { step: 0.5, gain: 0.2 });
  // The bite, in slow motion (real beat 2.95): a deep thud.
  kick(s + 2.95, 0.5);
  pluck(s + 2.95, G - 12, 0.7, 1.5, -0.1);
}

// ── drama: a low drone under the hits ──
drone(at.drama, at.buzz, 38, 0.05);

// ── buzz, proof: the groove; the tune only before the lock screen holds ──
groove(at.buzz, at.revenge);
tune(at.buzz + 0.2, 0, 0.18);
// The loupe pops on the grade: one bell.
bell(at.proof + 1.5, 83, 0.06);

// ── revenge: stops dead as he lifts the phone, the score, back on her stare ──
{
  const s = at.revenge;
  groove(s, at.outro, { stop: [s + 2.0, s + 4.0] });
  tune(s + 0.1, 5, 0.16);
  [71, 72, 73, 74].forEach((n, k) => pluck(s + 1.2 + k * 0.2, n, 0.25, 0.3, 0.2));
  kick(s + 2.0, 0.4);
  [74, 76].forEach((n, k) => pluck(s + 2.7 + k * 0.3, n, 0.18, 0.3, 0.2));
  // The whistle (a sound effect, 3.5), then the number rolls up to 2.
  goal(s + 4.45);
  hat(s + 3.5, 0.02);
}

// ── outro: fuller, a bell under the logo, and back to the start ──
{
  const s = at.outro;
  groove(s, TOTAL, { full: true });
  tune(s + 0.3, 0, 0.2);
  bell(s + 1.3, 79, 0.07);
  bell(s + 1.3, 86, 0.035);
  marimba(s + 4.5, 74, 0.12);
  loopBack();
}

m.write('chevre-02');
