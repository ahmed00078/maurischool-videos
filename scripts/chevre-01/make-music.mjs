// Synthesizes chevre-01's music: node scripts/chevre-01/make-music.mjs
//   → public/chevre-01/music.wav
//
// A light, playful score in G major at 120 BPM. It reads the video's
// timeline.json, so every section follows the scenes if they are retimed:
//   hook, yard   staccato pizzicato and a sneaky marimba motif, snaps on 2 and 4
//   counter      light under the question, then suspense while the pages turn
//                (ticking, a low drone, plucks climbing); nothing but a tick for
//                the goat; the stamp lands in silence and a little line falls
//   rewind       the counter's own music, played backwards and fast (a tape),
//                then a pickup into payday
//   pay, app     the bright groove: walking bass, claps, hats, a bell melody
//   twist        the groove; it stops dead when he lifts the phone, and comes back
//   outro        the groove, fuller, a bell under the logo; the last bar walks up
//                into the first beat, so the video loops
// Karplus-Strong plucks, sines and filtered noise, so there is nothing to license.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const timeline = JSON.parse(readFileSync(new URL('../../src/videos/chevre-01/timeline.json', import.meta.url), 'utf8'));
const BEAT = 60 / timeline.bpm;
const at = {};
let acc = 0;
for (const s of timeline.scenes) {
  at[s.id] = acc;
  acc += s.beats;
}
const TOTAL = acc;
const SR = 44100;
// Exactly the video's length: the loop joins the last sample to the first.
const N = Math.round(SR * TOTAL * BEAT);
const L = new Float32Array(N);
const R = new Float32Array(N);
const SEND = new Float32Array(N);

let seed = 5;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const T = (beat) => beat * BEAT;
/** Past the end, a note wraps round to the start: the tail of the last bar rings into the first. */
const add = (i, v, pan = 0, send = 0.2) => {
  if (i < 0) return;
  const k = i % N;
  L[k] += v * (1 - pan);
  R[k] += v * (1 + pan);
  SEND[k] += v * send;
};

/** A plucked string (Karplus-Strong): pizzicato when low, a harp-ish pluck when high. */
const pluck = (beat, midi, vel = 0.5, lengthBeats = 1, pan = 0) => {
  const f = hz(midi);
  const period = Math.max(2, Math.round(SR / f));
  const buf = new Float32Array(period);
  for (let i = 0; i < period; i++) buf[i] = rnd() * 0.5 + (i < period / 2 ? 0.3 : -0.3);
  const s0 = Math.floor(T(beat) * SR);
  const n = Math.floor((T(lengthBeats) + 0.3) * SR);
  const damp = midi < 50 ? 0.994 : 0.997;
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const k = i % period;
    const y = buf[k];
    buf[k] = damp * 0.5 * (y + prev);
    prev = y;
    const rel = i < T(lengthBeats) * SR ? 1 : Math.exp(-(i - T(lengthBeats) * SR) / (0.06 * SR));
    add(s0 + i, y * vel * 0.5 * rel, pan, midi < 50 ? 0.08 : 0.35);
  }
};

/** A marimba: a sine with a quick wooden overtone, short. */
const marimba = (beat, midi, vel = 0.3, pan = 0.2) => {
  const s0 = Math.floor(T(beat) * SR);
  const f = hz(midi);
  for (let i = 0; i < 0.6 * SR; i++) {
    const t = i / SR;
    const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.22) + 0.5 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t / 0.02);
    add(s0 + i, v * vel * Math.min(1, t / 0.002), pan, 0.3);
  }
};

const snap = (beat, gain = 0.2, pan = 0.25) => {
  const s0 = Math.floor(T(beat) * SR);
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < 0.07 * SR; i++) {
    const t = i / SR;
    const x = rnd();
    b1 += 0.28 * (x - b1);
    b2 += 0.06 * (b1 - b2);
    add(s0 + i, (b1 - b2) * Math.exp(-t / 0.012) * gain * 3, pan, 0.4);
  }
};

const clap = (beat, gain = 0.22) => {
  for (const d of [0, 0.012, 0.024]) snap(beat + d / BEAT, gain * (d ? 0.6 : 1), -0.15);
};

const hat = (beat, gain = 0.035, pan = -0.35) => {
  const s0 = Math.floor(T(beat) * SR);
  let prev = 0;
  for (let i = 0; i < 0.03 * SR; i++) {
    const t = i / SR;
    const x = rnd();
    add(s0 + i, (x - prev) * Math.exp(-t / 0.008) * gain, pan, 0.1);
    prev = x;
  }
};

const kick = (beat, gain = 0.5) => {
  const s0 = Math.floor(T(beat) * SR);
  let ph = 0;
  for (let i = 0; i < 0.3 * SR; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (45 + 80 * Math.exp(-t / 0.03))) / SR;
    add(s0 + i, Math.sin(ph) * Math.exp(-t / 0.12) * gain, 0, 0.02);
  }
};

/** A low held note that swells in and out. */
const drone = (b0, b1, midi, gain = 0.05) => {
  const s0 = Math.floor(T(b0) * SR);
  const s1 = Math.floor(T(b1) * SR);
  const w = (2 * Math.PI * hz(midi)) / SR;
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const env = Math.min(1, t / 0.4) * Math.min(1, (s1 - i) / SR / 0.2);
    const k = w * (i - s0);
    add(i, (Math.sin(k) + 0.3 * Math.sin(2 * k) + 0.12 * Math.sin(3 * k)) * env * gain, 0, 0.3);
  }
};

/** A vibraphone-ish bell. */
const bell = (beat, midi, gain = 0.08) => {
  const s0 = Math.floor(T(beat) * SR);
  const f = hz(midi);
  for (let i = 0; i < 2 * SR; i++) {
    const t = i / SR;
    const trem = 1 + 0.25 * Math.sin(2 * Math.PI * 5 * t);
    const v = Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t / 0.2);
    add(s0 + i, v * Math.exp(-t / 0.9) * trem * gain * Math.min(1, t / 0.003), 0.2, 0.6);
  }
};

// G major: G2 = 43.
const G = 43;
/** The sneaky motif: a step up, a chromatic neighbour, a skip. Eighth notes. */
const SNEAK = [67, 69, 70, 71, null, 74, 71, null];

// ── hook and yard: pizzicato and the sneaky motif, the goat's own tune ──
{
  const s = at.hook;
  const e = at.counter;
  const bass = [G, G + 7, G + 5, G + 7];
  for (let b = s, i = 0; b < e; b++, i++) {
    pluck(b, bass[i % 4], 0.8, 0.35, -0.1);
    if (i % 2 === 1) snap(b, 0.16);
    hat(b + 0.5, 0.025);
  }
  // The motif twice, answered the second time a third higher.
  for (const [start, up] of [[s + 0.5, 0], [s + 4.5, 0], [at.yard + 0.5, 4], [at.yard + 2.5, 0]]) {
    SNEAK.forEach((m, k) => {
      if (m !== null) marimba(start + k * 0.25, m + up, 0.22, 0.25);
    });
  }
}

// ── counter: light, then suspense, then the stamp ──
{
  const s = at.counter;
  // Her question and his answer: the bass, softly, and a questioning pluck.
  for (let b = s; b < s + 4.5; b++) pluck(b, b - s < 2.5 ? G : G + 2, 0.55, 0.3, -0.1);
  marimba(s + 0.9, 74, 0.2);
  marimba(s + 1.15, 76, 0.2);
  marimba(s + 2.9, 71, 0.2);
  marimba(s + 3.15, 74, 0.2);
  // The pages: ticking eighths, a low drone, a pluck climbing each beat.
  drone(s + 4.5, s + 7, 38, 0.06);
  for (let b = s + 4.5, i = 0; b < s + 7; b += 0.5, i++) {
    hat(b, 0.05, 0.2);
    if (i % 2 === 0) pluck(b, 62 + i, 0.3, 0.4, 0.25);
    kick(b, 0.18);
  }
  // The goat: only the tick.
  for (let b = s + 7; b < s + 9; b += 0.5) hat(b, 0.04);
  // The stamp lands in silence; then a little line falls.
  [74, 71, 69, 66, 62].forEach((m, k) => marimba(s + 9.6 + k * 0.4, m, 0.2, -0.1));
  pluck(s + 9.6, G - 5, 0.5, 2, -0.1);
  drone(s + 9.6, s + 12, 38, 0.035);
}

// ── pay, app, twist, outro: the bright groove ──
const groove = (from, to, { full = false, stop = null } = {}) => {
  const BASS = [G, G + 4, G + 7, G + 9, G + 5, G + 9, G + 12, G + 7];
  const CHORDS = [[67, 71, 74], [67, 71, 74], [65, 69, 72], [66, 69, 74]];
  for (let b = from, i = 0; b < to; b++, i++) {
    if (stop && b >= stop[0] && b < stop[1]) continue;
    pluck(b, BASS[i % BASS.length], 0.8, 0.45, -0.1);
    CHORDS[Math.floor(i / 2) % 4].forEach((m) => pluck(b + 0.5, m, 0.13, 0.3, 0.15));
    kick(b, i % 2 === 0 ? 0.32 : 0.2);
    if (i % 2 === 1) clap(b, 0.2);
    hat(b + 0.5, full ? 0.045 : 0.035);
    if (full) hat(b + 0.25, 0.02, 0.35);
  }
};
/** The payday melody, a bar at a time: bright, stepwise, a little proud. */
const TUNE = [
  [0, 74, 0.5], [0.5, 76, 0.5], [1, 78, 0.5], [1.5, 79, 1],
  [2.5, 78, 0.5], [3, 76, 0.5], [3.5, 74, 1],
];
const tune = (start, up = 0, gain = 0.2) => TUNE.forEach(([o, m]) => marimba(start + o, m + up, gain, 0.2));

{
  // The pickup out of the rewind, into payday.
  [62, 66, 69].forEach((m, k) => pluck(at.pay - 0.75 + k * 0.25, m, 0.3, 0.4, 0.2));
  groove(at.pay, at.twist);
  tune(at.pay + 1.5);
  tune(at.app + 0.5, 0, 0.22);
  tune(at.app + 4.5, 5, 0.2);
  bell(at.app + 6.2, 83, 0.05);
}
{
  const s = at.twist;
  // He lifts the phone: everything stops; the ears drop into silence; then the groove again, softly.
  groove(s, at.outro, { stop: [s + 3.9, s + 5] });
  [71, 72, 73, 74].forEach((m, k) => pluck(s + 3.2 + k * 0.17, m, 0.25, 0.3, 0.2));
  kick(s + 3.9, 0.4);
  tune(s + 0.5, 0, 0.16);
}
{
  const s = at.outro;
  groove(s, TOTAL, { full: true });
  tune(s + 0.3, 0, 0.2);
  bell(s + 2.2, 79, 0.07);
  bell(s + 2.2, 86, 0.035);
  // The last bar walks up to G for the first beat, where the hook starts again.
  [G + 2, G + 4, G + 6].forEach((m, k) => pluck(TOTAL - 1.5 + k * 0.5, m, 0.6, 0.4, -0.1));
}

// ── a small plate reverb on the send ──
{
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d, buf: new Float32Array(d), k: 0 }));
  const aps = [225, 556].map((d) => ({ d, buf: new Float32Array(d), k: 0 }));
  // Two passes, so the reverb's tail at the end rings into the start as well.
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < N; i++) {
      let y = 0;
      for (const c of combs) {
        const out = c.buf[c.k];
        c.buf[c.k] = (pass === 0 ? SEND[i] : 0) + out * 0.8;
        c.k = (c.k + 1) % c.d;
        y += out;
      }
      y *= 0.25;
      for (const a of aps) {
        const out = a.buf[a.k];
        const v = y + out * 0.5;
        a.buf[a.k] = v;
        a.k = (a.k + 1) % a.d;
        y = out - v * 0.5;
      }
      L[i] += y * 0.33;
      R[i] += y * 0.31;
      if (pass === 1 && i > 3 * SR) break;
    }
  }
}

// ── rewind: the counter's music, backwards and fast, wobbling like a tape ──
{
  const s = Math.floor(T(at.rewind) * SR);
  const e = Math.floor(T(at.rewind + 2.7) * SR);
  const from = Math.floor(T(at.rewind) * SR) - 1;
  const to = Math.floor(T(at.counter + 4) * SR);
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
    L[i] *= 0;
    R[i] *= 0;
  }
}

// ── write: normalized to -3 dBFS ──
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 10 ** (-3 / 20) / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVEfmt ', 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), 46 + i * 4);
}
mkdirSync('public/chevre-01', { recursive: true });
writeFileSync('public/chevre-01/music.wav', buf);
console.log(`public/chevre-01/music.wav (${(N / SR).toFixed(2)} s, ${TOTAL} beats)`);
