// Synthesizes chevre-01's music (« La chèvre a encore frappé », ép. 1): node scripts/chevre-01/make-music.mjs
//   → public/chevre-01/music.wav
//
// The series' score (scripts/chevre/music-kit.mjs), light and playful, in G
// major at 120 BPM. It reads the video's timeline.json, so every section
// follows the scenes if they are retimed; the cues inside a scene are the
// scenes' own beats, copied here. Under a reading hold, no new melody: only
// the beat.
//   hook         pizzicato and the goat's motif, snaps on 2 and 4
//   counter      light under the question, then suspense while the pages turn
//                (ticking, a low drone, plucks climbing); a tick for the goat;
//                the stamp lands in silence, a little line falls, and it holds
//   rewind       the counter's own music, played backwards and fast (a tape),
//                then a pickup into payday
//   pay, app     the bright groove: walking bass, claps, hats, a proud tune
//   twist        the groove; it stops dead when he lifts the phone, the whistle
//                and two bells for the score, and it comes back when she looks
//                at the camera
//   outro        the groove, fuller, a bell under the logo; the last bar walks up
//                into the first beat, so the music loops
import { score } from '../chevre/music-kit.mjs';

const m = score(new URL('../../src/videos/chevre-01/timeline.json', import.meta.url));
const { at, TOTAL, SR, L, R, T, pluck, marimba, hat, kick, drone, bell, motif, pizz, groove, tune, goal, loopBack } = m;
const G = 43;

// ── hook: pizzicato and the motif, answered a third higher ──
pizz(at.hook, at.counter);
for (const [start, up] of [[0.5, 0], [2.5, 4], [4.5, 0], [6.5, 4]]) motif(at.hook + start, up);

// ── counter: light, then suspense, then the stamp, which holds ──
{
  const s = at.counter;
  // Her question and his answer: the bass, softly, and a questioning pluck.
  for (let b = s; b < s + 3.5; b++) pluck(b, b - s < 2 ? G : G + 2, 0.55, 0.3, -0.1);
  marimba(s + 0.5, 74, 0.2);
  marimba(s + 0.75, 76, 0.2);
  marimba(s + 2.1, 71, 0.2);
  marimba(s + 2.35, 74, 0.2);
  // The pages (3.5 to 4.5): ticking eighths, a low drone, a pluck climbing each half beat.
  drone(s + 3.5, s + 4.5, 38, 0.06);
  for (let b = s + 3.5, i = 0; b < s + 4.5; b += 0.5, i++) {
    hat(b, 0.05, 0.2);
    pluck(b, 62 + i * 2, 0.3, 0.4, 0.25);
    kick(b, 0.18);
  }
  // The goat (4.5 to 5.5): only the tick.
  for (let b = s + 4.5; b < s + 5.5; b += 0.5) hat(b, 0.04);
  // The stamp lands in silence (5.7); a little line falls; then it holds on a low drone and a tick.
  [74, 71, 69, 66, 62].forEach((n, k) => marimba(s + 6.0 + k * 0.22, n, 0.2, -0.1));
  pluck(s + 6.0, G - 5, 0.5, 1.1, -0.1);
  drone(s + 6.0, s + 10, 38, 0.035);
  for (let b = s + 7.5; b < s + 10; b += 1) hat(b, 0.03);
}

// ── pay, app: the groove; the tune only where nobody is reading ──
// The pickup out of the rewind, into payday.
[62, 66, 69].forEach((n, k) => pluck(at.pay - 0.75 + k * 0.25, n, 0.3, 0.4, 0.2));
groove(at.pay, at.twist);
tune(at.pay + 1.5);
tune(at.app - 0.5, 5, 0.18);
// The receipt fills the frame and the amount is circled: one bell, and the beat alone.
bell(at.app + 3.9, 83, 0.05);

// ── twist: the groove stops dead as he lifts the phone, the score, the groove is back on her stare ──
{
  const s = at.twist;
  groove(s, at.outro, { stop: [s + 4.0, s + 6.6] });
  tune(s + 0.3, 0, 0.16);
  // She walks up to the phone on a climbing pluck.
  [71, 72, 73, 74].forEach((n, k) => pluck(s + 3.2 + k * 0.2, n, 0.25, 0.3, 0.2));
  kick(s + 4.0, 0.4);
  [74, 76].forEach((n, k) => pluck(s + 4.7 + k * 0.3, n, 0.18, 0.3, 0.2));
  // The whistle (a sound effect, 5.8), then the number rolls up to 1.
  goal(s + 6.75);
}

// ── outro: fuller, a bell under the logo, and back to the start ──
{
  const s = at.outro;
  groove(s, TOTAL, { full: true });
  tune(s + 0.3, 0, 0.2);
  bell(s + 1.4, 79, 0.07);
  bell(s + 1.4, 86, 0.035);
  loopBack();
}

// ── rewind: the counter's music, backwards and fast, wobbling like a tape ──
// The reverb first, so the tape plays it back too.
m.reverb();
{
  const s = Math.floor(T(at.rewind) * SR);
  const e = Math.floor(T(at.rewind + 2.0) * SR);
  const from = Math.floor(T(at.rewind) * SR) - 1;
  const to = Math.floor(T(at.counter + 3.5) * SR);
  const speed = (from - to) / (e - s);
  const read = (buf, p) => {
    const i = Math.floor(p);
    const f = p - i;
    return buf[i] * (1 - f) + buf[i + 1] * f;
  };
  const copyL = L.slice(to, from + 2);
  const copyR = R.slice(to, from + 2);
  for (let i = s; i < e; i++) {
    const t = (i - s) / (e - s);
    const wob = 1 + 0.06 * Math.sin(2 * Math.PI * 7 * (i / SR));
    const p = Math.max(0, from - to - (i - s) * speed * wob);
    const env = Math.min(1, (i - s) / (0.03 * SR)) * Math.min(1, (e - i) / (0.02 * SR)) * (0.7 + 0.3 * t);
    L[i] = read(copyL, p) * env * 0.8;
    R[i] = read(copyR, p) * env * 0.8;
  }
  // Silence from the tape stopping to the pickup.
  for (let i = e; i < Math.floor(T(at.pay - 0.8) * SR); i++) {
    L[i] = 0;
    R[i] = 0;
  }
}

m.write('chevre-01', 'music.wav', false);
