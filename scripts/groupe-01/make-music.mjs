// Synthesizes groupe-01's music: node scripts/groupe-01/make-music.mjs
//   → public/groupe-01/music.wav
//
// A bright, bubbly score in C major at 120 BPM. It reads the video's
// timeline.json, so every section follows the scenes if they are retimed:
//   boxes       under the found clip: a low drone and a ticking hat while the
//               container opens, a rising sweep, then the drums drop out as
//               the boxes fall (the clip's own crash)
//   hook        plucked bass, hats, a marimba bubbling like a group waking up;
//               a stab when the badge stops at 312 (three beats)
//   flood       the bubbles get denser as the thread flies by (eighths, then
//               sixteenths, a rising sweep); when Papa glazes over it all
//               sags into a slow, sleepy slide (the yawn)
//   thursday    a morning tick; the panic hit on Sidi's question; nervous
//               sixteenths while Papa flicks back up; a bell on the message;
//               silence and a low drone on the freeze
//   rewind      Thursday's music, backwards and fast (a tape), then a pickup
//   director,   the bright groove: walking bass, claps, hats, a bell melody
//   sameday
//   evening     a warm, half-time groove under the lamp: soft kick, rim, a
//               tremolo electric piano, a gentle tune
//   outro       the warm groove, fuller; the last bar bubbles up into the
//               first beat, so the video loops
// Karplus-Strong plucks, sines and filtered noise, so there is nothing to license.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const timeline = JSON.parse(readFileSync(new URL('../../src/videos/groupe-01/timeline.json', import.meta.url), 'utf8'));
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

let seed = 11;
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
  for (let i = 0; i < 0.5 * SR; i++) {
    const t = i / SR;
    const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.18) + 0.5 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t / 0.02);
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

/** A rim click, dry. */
const rim = (beat, gain = 0.12) => {
  const s0 = Math.floor(T(beat) * SR);
  for (let i = 0; i < 0.04 * SR; i++) {
    const t = i / SR;
    add(s0 + i, (Math.sin(2 * Math.PI * 1700 * t) * 0.6 + rnd() * 0.4) * Math.exp(-t / 0.006) * gain, 0.3, 0.2);
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

/** An electric piano chord: soft sines with a slow tremolo. */
const keys = (beat, notes, lengthBeats, gain = 0.05) => {
  const s0 = Math.floor(T(beat) * SR);
  const n = Math.floor(T(lengthBeats) * SR);
  for (const m of notes) {
    const f = hz(m);
    for (let i = 0; i < n + 0.3 * SR; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.01) * Math.exp(-t / 1.4) * (i < n ? 1 : Math.exp(-(i - n) / (0.08 * SR)));
      const trem = 1 + 0.2 * Math.sin(2 * Math.PI * 4.5 * t);
      add(s0 + i, (Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t / 0.3)) * env * trem * gain, -0.15, 0.45);
    }
  }
};

/** The panic hit: a minor chord of brass, a timpani, a crash of noise. */
const sting = (beat, gain = 0.35) => {
  const s0 = Math.floor(T(beat) * SR);
  const chord = [48, 51, 55, 60].map(hz);
  for (let i = 0; i < 1.4 * SR; i++) {
    const t = i / SR;
    let v = 0;
    for (const f of chord) {
      const ph = 2 * Math.PI * f * t;
      v += (Math.sin(ph) + 0.5 * Math.sin(2 * ph) + 0.3 * Math.sin(3 * ph) + 0.15 * Math.sin(4 * ph)) * 0.25;
    }
    const env = Math.min(1, t / 0.015) * Math.exp(-t / 0.5);
    const timp = Math.sin(2 * Math.PI * (70 + 30 * Math.exp(-t / 0.05)) * t) * Math.exp(-t / 0.35);
    const crash = rnd() * Math.exp(-t / 0.25) * 0.3;
    add(s0 + i, (v * env * 0.8 + timp * 0.9 + crash) * gain, 0, 0.5);
  }
};

/** A slide down, sleepy: a detuned sine sagging an octave (the yawn). */
const sag = (b0, b1, from, to, gain = 0.08) => {
  const s0 = Math.floor(T(b0) * SR);
  const s1 = Math.floor(T(b1) * SR);
  let ph = 0;
  for (let i = s0; i < s1; i++) {
    const u = (i - s0) / (s1 - s0);
    const f = hz(from + (to - from) * u ** 1.4) * (1 + 0.01 * Math.sin(2 * Math.PI * 5 * (i / SR)));
    ph += (2 * Math.PI * f) / SR;
    const env = Math.min(1, u * 8) * Math.min(1, (1 - u) * 5);
    add(i, (Math.sin(ph) + 0.3 * Math.sin(2 * ph)) * env * gain, 0.1, 0.5);
  }
};

/** Filtered noise rising, for the thread flying by. */
const sweep = (b0, b1, gain = 0.05) => {
  const s0 = Math.floor(T(b0) * SR);
  const s1 = Math.floor(T(b1) * SR);
  let low = 0;
  let band = 0;
  for (let i = s0; i < s1; i++) {
    const u = (i - s0) / (s1 - s0);
    const fc = 400 + 5000 * u * u;
    const f = 2 * Math.sin((Math.PI * fc) / SR);
    low += f * band;
    const high = rnd() - low - 0.6 * band;
    band += f * high;
    add(i, band * u * u * gain, -0.2 + 0.4 * u, 0.2);
  }
};

// C major: C3 = 48.
const C = 48;
/** The bubbles: a little rising-and-falling figure, like messages popping in. */
const BUBBLES = [72, 76, 79, 84, 79, 76, 74, 77];

// ── boxes: the container opens, the boxes fall; the badge comes in on the beat ──
{
  const s = at.boxes;
  drone(s, s + 3.2, C - 12, 0.07);
  for (let b = s; b < s + 3; b += 0.5) hat(b + 0.25, 0.02 + 0.01 * (b - s));
  for (let b = s; b < s + 2.5; b++) kick(b, 0.18);
  sweep(s + 1.5, s + 3.2, 0.05);
  // Two marimba notes leaning into the hook's first bubble.
  marimba(s + 3.5, BUBBLES[0] - 12, 0.12, -0.2);
  marimba(s + 3.75, BUBBLES[1] - 12, 0.14, 0.2);
}

// ── hook: waking up, the stab on 312 ──
{
  const s = at.hook;
  const bass = [C, C + 7, C + 5];
  for (let b = s, i = 0; b < s + 3; b++, i++) {
    pluck(b, bass[i % 4], 0.8, 0.35, -0.1);
    kick(b, i % 2 ? 0.2 : 0.3);
    hat(b + 0.5, 0.03);
    if (i % 2 === 1) snap(b, 0.14);
  }
  for (let k = 0; k < 8; k++) marimba(s + 0.25 + k * 0.25, BUBBLES[k], 0.14 + k * 0.01, 0.3);
  // The badge stops: a chord stab on the "and" of 2, then the bubbles again, higher.
  [60, 64, 67, 72].forEach((m) => pluck(s + 2.25, m, 0.3, 0.6, 0.1));
  kick(s + 2.25, 0.35);
  marimba(s + 2.75, BUBBLES[0] + 5, 0.14, -0.2);
}

// ── flood: denser and denser, then the yawn ──
{
  const s = at.flood;
  const glaze = s + 7.4;
  const bass = [C, C + 4, C + 7, C + 9, C + 5, C + 9, C + 12, C + 7];
  for (let b = s, i = 0; b < glaze; b++, i++) {
    pluck(b, bass[i % bass.length], 0.75, 0.4, -0.1);
    kick(b, i % 2 ? 0.22 : 0.32);
    if (i % 2 === 1) clap(b, 0.16);
    hat(b + 0.5, 0.035);
    // Eighths of bubbles, then sixteenths from the middle of the scroll.
    const dense = b - s >= 3.5;
    const step = dense ? 0.25 : 0.5;
    for (let o = 0; o < 1; o += step) marimba(b + o, BUBBLES[(i * 4 + o * 4) % 8] + (b - s >= 5.5 ? 5 : 0), dense ? 0.1 : 0.13, o % 0.5 ? -0.3 : 0.3);
  }
  sweep(s + 3.6, glaze, 0.06);
  // The director's message flies by: one clear bell, and it is gone.
  bell(s + 5.4, 84, 0.05);
  // Glazed: everything sags, a slow sleepy slide, a soft low note.
  sag(glaze + 0.2, s + 9.6, 67, 55, 0.07);
  drone(glaze + 0.2, s + 10, 36, 0.05);
  pluck(glaze + 0.2, C - 12, 0.5, 2, -0.1);
}

// ── thursday: tick, panic, nervous flicks, the bell, the freeze ──
{
  const s = at.thursday;
  // The leaves torn off: ticks and plucks going up (Tuesday, Wednesday, Thursday).
  for (let b = s; b < s + 1.8; b += 0.5) hat(b, 0.05, 0.2);
  [67, 69, 71].forEach((m, k) => pluck(s + 0.3 + k * 0.5, m, 0.3, 0.4, 0.2));
  // Sidi's question: the hit.
  sting(s + 1.8, 0.36);
  drone(s + 1.8, s + 3.6, 36, 0.05);
  // Nervous sixteenths while Papa flicks back up.
  for (let b = s + 3.6; b < s + 4.8; b += 0.25) {
    hat(b, 0.05, (b * 4) % 2 ? 0.3 : -0.3);
    if ((b - s) % 0.5 === 0) kick(b, 0.18);
  }
  pluck(s + 3.6, C - 12, 0.6, 1.2, -0.1);
  // Found: the bell. The freeze: silence, a low note.
  bell(s + 4.8, 79, 0.07);
  bell(s + 4.8, 86, 0.03);
  drone(s + 5.6, s + 7, 31, 0.06);
}

// ── director, sameday: the bright groove ──
const groove = (from, to, { full = false } = {}) => {
  const BASS = [C, C + 4, C + 7, C + 9, C + 5, C + 9, C + 12, C + 7];
  const CHORDS = [[64, 67, 72], [64, 67, 72], [65, 69, 72], [67, 71, 74]];
  for (let b = from, i = 0; b < to; b++, i++) {
    pluck(b, BASS[i % BASS.length], 0.8, 0.45, -0.1);
    CHORDS[Math.floor(i / 2) % 4].forEach((m) => pluck(b + 0.5, m, 0.12, 0.3, 0.15));
    kick(b, i % 2 === 0 ? 0.32 : 0.2);
    if (i % 2 === 1) clap(b, 0.2);
    hat(b + 0.5, full ? 0.045 : 0.035);
    if (full) hat(b + 0.25, 0.02, 0.35);
  }
};
/** The announcement's tune: a bright rising phrase, then an answer. */
const TUNE = [
  [0, 72, 0.5], [0.5, 74, 0.5], [1, 76, 0.5], [1.5, 79, 1],
  [2.5, 76, 0.5], [3, 74, 0.5], [3.5, 72, 1],
];
const tune = (start, up = 0, gain = 0.2) => TUNE.forEach(([o, m]) => marimba(start + o, m + up, gain, 0.2));
{
  // The pickup out of the rewind.
  [67, 71, 74].forEach((m, k) => pluck(at.director - 0.75 + k * 0.25, m, 0.3, 0.4, 0.2));
  groove(at.director, at.evening);
  tune(at.director + 0.5);
  bell(at.director + 4.8, 84, 0.06);
  tune(at.sameday + 1.3, 0, 0.22);
  tune(at.sameday + 4.5, 5, 0.18);
}

// ── evening: the warm, half-time groove ──
const warm = (from, to, { full = false } = {}) => {
  const CH = [[52, 55, 59, 62], [53, 57, 60, 64], [48, 52, 55, 59], [50, 53, 57, 60]];
  const BASS = [C - 8, C - 7, C - 12, C - 10];
  for (let b = from, i = 0; b < to; b++, i++) {
    const bar = Math.floor(i / 2) % 4;
    if (i % 2 === 0) {
      keys(b, CH[bar], 1.8, full ? 0.05 : 0.045);
      pluck(b, BASS[bar], 0.7, 1.6, -0.1);
      kick(b, 0.22);
    } else {
      rim(b, 0.1);
    }
    hat(b + 0.5, 0.02, 0.3);
    if (full) hat(b + 0.25, 0.012, -0.3);
  }
};
const EVE = [[0.5, 67], [1, 69], [1.5, 71], [2.5, 72], [3.5, 71], [4, 69], [5, 67]];
{
  const s = at.evening;
  warm(s, at.outro);
  EVE.forEach(([o, m]) => marimba(s + 0.5 + o, m, 0.12, 0.25));
  // « Le groupe peut attendre. »: a warm bell.
  bell(s + 5.6, 76, 0.06);
  bell(s + 5.6, 83, 0.03);
}

// ── outro: the warm groove, fuller; the last bar bubbles into the start ──
{
  const s = at.outro;
  warm(s, TOTAL - 2, { full: true });
  bell(s + 4.4, 79, 0.07);
  bell(s + 4.4, 84, 0.035);
  EVE.forEach(([o, m]) => marimba(s + 0.4 + o, m + 5, 0.11, 0.25));
  // The last bar: the hook's bass and bubbles, waking up again.
  for (let b = TOTAL - 2, i = 0; b < TOTAL; b++, i++) {
    pluck(b, [C + 5, C + 7][i], 0.7, 0.35, -0.1);
    kick(b, 0.24);
    hat(b + 0.5, 0.03);
  }
  for (let k = 0; k < 8; k++) marimba(TOTAL - 2 + k * 0.25, BUBBLES[k] - 5 + Math.floor(k / 2), 0.08 + k * 0.012, k % 2 ? -0.3 : 0.3);
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

// ── the freeze: the tail of the found bell cut dead, only the low note ──
{
  const s = Math.floor(T(at.thursday + 5.6) * SR);
  const e = Math.floor(T(at.rewind) * SR);
  // Everything else stops dead: the drone alone, quietly, over silence.
  const w = (2 * Math.PI * hz(31)) / SR;
  for (let i = s; i < e; i++) {
    const t = (i - s) / SR;
    const env = Math.min(1, t / 0.05) * Math.min(1, (e - i) / SR / 0.05);
    const v = (Math.sin(w * (i - s)) + 0.3 * Math.sin(2 * w * (i - s))) * env * 0.06;
    L[i] = v;
    R[i] = v;
  }
}

// ── rewind: Thursday's music, backwards and fast, wobbling like a tape ──
{
  const s = Math.floor(T(at.rewind) * SR);
  const e = Math.floor(T(at.rewind + 2.1) * SR);
  const from = Math.floor(T(at.rewind) * SR) - 1;
  const to = Math.floor(T(at.thursday) * SR);
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
  for (let i = e; i < Math.floor(T(at.director - 0.8) * SR); i++) {
    L[i] = 0;
    R[i] = 0;
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
mkdirSync('public/groupe-01', { recursive: true });
writeFileSync('public/groupe-01/music.wav', buf);
console.log(`public/groupe-01/music.wav (${(N / SR).toFixed(2)} s, ${TOTAL} beats)`);
