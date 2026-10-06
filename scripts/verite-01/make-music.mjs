// Synthesizes verite-01's music: node scripts/verite-01/make-music.mjs
//   → public/verite-01/music.wav
//
// A small detective score in D minor at 120 BPM. It reads the video's
// timeline.json, so every section follows the scenes if they are retimed:
//   hook      a plucked spy motif over a low D
//   claims    walking pizzicato bass, finger snaps on 2 and 4
//   vote      the bass stops: a heartbeat and a rising pluck, one per beat
//   check     tension under the phone, a major lift after each "Vrai",
//             a snare roll on the last row, then silence for the sting (sfx)
//   busted    the sad trombone is a sound effect; then an oom-pah in D major
//   outro     the oom-pah, fuller, ending on D major
// Karplus-Strong plucks, sines and filtered noise, so there is nothing to license.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const timeline = JSON.parse(readFileSync(new URL('../../src/videos/verite-01/timeline.json', import.meta.url), 'utf8'));
const BEAT = 60 / timeline.bpm;
const at = {};
let acc = 0;
for (const s of timeline.scenes) {
  at[s.id] = acc;
  acc += s.beats;
}
const TOTAL = acc;
const SR = 44100;
const N = Math.ceil(SR * (TOTAL * BEAT + 2));
const L = new Float32Array(N);
const R = new Float32Array(N);
const SEND = new Float32Array(N);

let seed = 3;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const T = (beat) => beat * BEAT;
const add = (i, v, pan = 0, send = 0.2) => {
  if (i < 0 || i >= N) return;
  L[i] += v * (1 - pan);
  R[i] += v * (1 + pan);
  SEND[i] += v * send;
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

const snap = (beat, gain = 0.22, pan = 0.25) => {
  const s0 = Math.floor(T(beat) * SR);
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < 0.07 * SR; i++) {
    const t = i / SR;
    const x = rnd();
    // A crude band-pass around 2 kHz.
    b1 += 0.28 * (x - b1);
    b2 += 0.06 * (b1 - b2);
    add(s0 + i, (b1 - b2) * Math.exp(-t / 0.012) * gain * 3, pan, 0.4);
  }
};

const hat = (beat, gain = 0.035) => {
  const s0 = Math.floor(T(beat) * SR);
  let prev = 0;
  for (let i = 0; i < 0.03 * SR; i++) {
    const t = i / SR;
    const x = rnd();
    add(s0 + i, (x - prev) * Math.exp(-t / 0.008) * gain, -0.35, 0.1);
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
  for (let i = s0; i < s1 && i < N; i++) {
    const t = (i - s0) / SR;
    const env = Math.min(1, t / 0.5) * Math.min(1, (s1 - i) / SR / 0.3);
    const k = w * (i - s0);
    add(i, (Math.sin(k) + 0.3 * Math.sin(2 * k) + 0.12 * Math.sin(3 * k)) * env * gain, 0, 0.3);
  }
};

/** A snare roll that grows from `b0` to `b1`, faster and louder. */
const roll = (b0, b1, gain = 0.2) => {
  for (let b = b0; b < b1; ) {
    const p = (b - b0) / (b1 - b0);
    const s0 = Math.floor(T(b) * SR);
    let lp = 0;
    for (let i = 0; i < 0.06 * SR; i++) {
      const t = i / SR;
      const x = rnd();
      lp += 0.5 * (x - lp);
      add(s0 + i, (x - lp * 0.5) * Math.exp(-t / 0.025) * gain * (0.25 + 0.75 * p * p), 0.1, 0.3);
    }
    b += p < 0.5 ? 0.25 : 0.125;
  }
};

/** A vibraphone-ish bell for the brand. */
const bell = (beat, midi, gain = 0.08) => {
  const s0 = Math.floor(T(beat) * SR);
  const f = hz(midi);
  for (let i = 0; i < 2.5 * SR; i++) {
    const t = i / SR;
    const trem = 1 + 0.25 * Math.sin(2 * Math.PI * 5 * t);
    const v = Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t / 0.2);
    add(s0 + i, v * Math.exp(-t / 1.1) * trem * gain * Math.min(1, t / 0.003), 0.2, 0.6);
  }
};

// D minor: D2 = 38. The walking line, one note per beat.
const WALK = [38, 41, 45, 47, 48, 45, 41, 40, 38, 41, 45, 46, 45, 43, 41, 40];
const MOTIF = [62, 65, 69, 68, 67, 65, 62, 61];

// ── hook ──
{
  const s = at.hook;
  drone(s, s + 6, 38, 0.05);
  MOTIF.forEach((m, i) => pluck(s + 0.5 + i * 0.5, m, 0.42, 0.6, 0.2));
  for (let b = s + 1; b < s + 6; b += 2) snap(b);
  pluck(s + 5.5, 57, 0.35, 0.5);
}

// ── the three claims ──
{
  const s = at.son;
  const e = at.vote;
  for (let b = s, i = 0; b < e; b++, i++) {
    pluck(b, WALK[i % WALK.length], 0.9, 0.9, -0.1);
    if ((b - s) % 2 === 1) snap(b);
    hat(b + 0.5);
  }
  // A little question at each claim.
  for (const c of [at.son, at.daughter, at.father]) {
    pluck(c + 0.25, 74, 0.28, 0.4, 0.3);
    pluck(c + 0.75, 73, 0.24, 0.4, 0.3);
  }
}

// ── vote: heartbeat, a pluck climbing one semitone per beat ──
{
  const s = at.vote;
  const e = at.check;
  drone(s, e, 38, 0.06);
  drone(s, e, 45, 0.03);
  for (let b = s, i = 0; b < e; b++, i++) {
    kick(b, 0.45);
    kick(b + 0.25, 0.25);
    pluck(b + 0.5, 62 + i, 0.3, 0.4, 0.25);
  }
}

// ── check ──
{
  const s = at.check;
  drone(s, s + 10.5, 38, 0.045);
  for (let b = s; b < s + 8; b++) kick(b, 0.28);
  // After each "Vrai": a quick lift in D major.
  for (const lift of [s + 3.5, s + 6.5]) {
    [62, 66, 69, 74].forEach((m, i) => pluck(lift + 0.1 + i * 0.12, m, 0.3, 0.6, 0.2));
  }
  // The last row: the roll, and nothing under the cut but the sting.
  roll(s + 8, s + 10.5, 0.6);
  for (let b = s + 8; b < s + 10.5; b += 0.5) kick(b, 0.3 + 0.3 * ((b - s - 8) / 2.5));
  drone(s + 8, s + 10.5, 39, 0.035);
}

// ── busted and outro: an oom-pah in D major, it is only a father after all ──
{
  const s = at.busted + 2;
  const e = TOTAL;
  const BASS = [38, 45, 38, 45, 43, 45, 38, 45];
  const CHORDS = [[62, 66, 69], [61, 64, 69], [62, 66, 69], [62, 67, 71]];
  for (let b = s, i = 0; b < e - 2; b++, i++) {
    pluck(b, BASS[i % BASS.length], 0.8, 0.5, -0.1);
    CHORDS[Math.floor(i / 2) % CHORDS.length].forEach((m) => pluck(b + 0.5, m, 0.16, 0.3, 0.15));
    if (i % 2 === 1) snap(b, 0.18);
    if (b >= at.outro) hat(b + 0.5, 0.04);
  }
  bell(at.outro + 3, 74, 0.07);
  bell(at.outro + 3, 81, 0.04);
  // The end: D major, rung out.
  [38, 50, 62, 66, 69, 74].forEach((m, i) => pluck(e - 2 + i * 0.03, m, 0.45, 2, (i - 2.5) / 6));
}

// ── a small plate reverb on the send ──
{
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d, buf: new Float32Array(d), k: 0 }));
  const aps = [225, 556].map((d) => ({ d, buf: new Float32Array(d), k: 0 }));
  for (let i = 0; i < N; i++) {
    let y = 0;
    for (const c of combs) {
      const out = c.buf[c.k];
      c.buf[c.k] = SEND[i] + out * 0.8;
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
    L[i] += y * 0.35;
    R[i] += y * 0.33;
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
mkdirSync('public/verite-01', { recursive: true });
writeFileSync('public/verite-01/music.wav', buf);
console.log(`public/verite-01/music.wav (${(N / SR).toFixed(1)} s, ${TOTAL} beats)`);
