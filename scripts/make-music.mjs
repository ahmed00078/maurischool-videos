// Composes the 30 s background track and writes public/music.wav.
// Fully synthesized here, so there is no licence to clear: node scripts/make-music.mjs
//
// Shape follows the story: a soft minor pad under the problem (0–7.9 s),
// a warm D-major progression with a light arpeggio from the logo on,
// and a held D chord under the call to action.
import { writeFileSync } from 'node:fs';

const SR = 44100;
const DUR = 30;
const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);
const send = new Float32Array(N); // reverb send (mono)

const hz = (m) => 440 * 2 ** ((m - 69) / 12);

// [start s, end s, notes (midi), bass (midi)]
const CHORDS = {
  D: [[50, 54, 57, 62], 38],
  A: [[45, 52, 57, 61], 33],
  Bm: [[47, 50, 54, 59], 35],
  G: [[43, 50, 55, 59], 31],
  Asus: [[45, 52, 57, 62], 33],
};
const BRIGHT = 7.9;
const PLAN = [
  [0, 3.9, 'Bm'],
  [3.9, BRIGHT, 'G'],
  [BRIGHT, 10.4, 'D'],
  [10.4, 12.9, 'A'],
  [12.9, 15.4, 'Bm'],
  [15.4, 17.9, 'G'],
  [17.9, 20.4, 'D'],
  [20.4, 22.9, 'A'],
  [22.9, 24.8, 'Bm'],
  [24.8, 26.1, 'Asus'],
  [26.1, DUR, 'D'],
];

const add = (i, v, pan = 0, rev = 0.3) => {
  if (i < 0 || i >= N) return;
  L[i] += v * (1 - pan) * 0.5 * 2 ** 0.5;
  R[i] += v * (1 + pan) * 0.5 * 2 ** 0.5;
  send[i] += v * rev;
};

// Pad: a few soft harmonics per note, two detuned voices, slow attack and release.
for (const [t0, t1, name] of PLAN) {
  const [notes, bass] = CHORDS[name];
  const a = 0.9;
  const rel = 1.4;
  const s0 = Math.floor(t0 * SR);
  const s1 = Math.min(N, Math.floor((t1 + rel) * SR));
  const dark = t0 < BRIGHT;
  for (const m of notes) {
    for (const cents of [-5, 5]) {
      const f = hz(m) * 2 ** (cents / 1200);
      for (let i = s0; i < s1; i++) {
        const t = (i - s0) / SR;
        const env = Math.min(1, t / a) * (i / SR > t1 ? Math.max(0, 1 - (i / SR - t1) / rel) : 1);
        let v = 0;
        for (let h = 1; h <= (dark ? 3 : 5); h++) v += Math.sin(2 * Math.PI * f * h * t) / h ** 1.6;
        add(i, v * env * 0.028, cents / 12, 0.45);
      }
    }
  }
  // Bass: a round sine on the root, only once the story turns bright.
  if (!dark) {
    const f = hz(bass);
    for (let i = s0; i < s1; i++) {
      const t = (i - s0) / SR;
      const env = Math.min(1, t / 0.15) * (i / SR > t1 ? Math.max(0, 1 - (i / SR - t1) / 0.4) : 1);
      add(i, (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * env * 0.11, 0, 0.05);
    }
  }
}

// Arpeggio: soft bell-like plucks on eighth notes (96 bpm) from the logo until the CTA settles.
const EIGHTH = 60 / 96 / 2;
const PATTERN = [0, 1, 2, 3, 2, 1, 2, 3];
let step = 0;
for (let t = BRIGHT; t < 28.4; t += EIGHTH, step++) {
  const [, , name] = PLAN.find(([a, b]) => t >= a && t < b) ?? PLAN[PLAN.length - 1];
  const notes = CHORDS[name][0];
  const late = t >= 26.1; // slow down and thin out under the CTA
  if (late && step % 2) continue;
  const f = hz(notes[PATTERN[step % PATTERN.length]] + 12);
  const s0 = Math.floor(t * SR);
  const len = Math.floor(0.9 * SR);
  const vel = (step % 4 === 0 ? 0.075 : 0.05) * (late ? 0.8 : 1);
  const pan = step % 2 ? 0.35 : -0.35;
  for (let i = 0; i < len; i++) {
    const tt = i / SR;
    const env = Math.min(1, tt / 0.004) * Math.exp(-tt / 0.28);
    const v = Math.sin(2 * Math.PI * f * tt) + 0.3 * Math.sin(4 * Math.PI * f * tt) * Math.exp(-tt / 0.08);
    add(s0 + i, v * env * vel, pan, 0.35);
  }
}

// Shaker: very quiet filtered noise on the off-beats, for a gentle pulse.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
for (let t = BRIGHT + EIGHTH; t < 26.1; t += EIGHTH * 2) {
  const s0 = Math.floor(t * SR);
  let prev = 0;
  for (let i = 0; i < 0.06 * SR; i++) {
    const n = rnd();
    const hp = n - prev;
    prev = n;
    add(s0 + i, hp * Math.exp(-i / SR / 0.018) * 0.018, 0.2, 0.1);
  }
}

// Reverb: Schroeder (4 combs + 2 all-passes) on the send, mixed back in stereo.
const comb = (x, d, g) => {
  const y = new Float32Array(N);
  for (let i = 0; i < N; i++) y[i] = x[i] + (i >= d ? g * y[i - d] : 0);
  return y;
};
const allpass = (x, d, g) => {
  const y = new Float32Array(N);
  for (let i = 0; i < N; i++) y[i] = -g * x[i] + (i >= d ? x[i - d] + g * y[i - d] : 0);
  return y;
};
const wet = (delays) => {
  const sum = new Float32Array(N);
  for (const d of delays) {
    const c = comb(send, d, 0.8);
    for (let i = 0; i < N; i++) sum[i] += c[i] / delays.length;
  }
  return allpass(allpass(sum, 556, 0.6), 1100, 0.6);
};
const wl = wet([1557, 1617, 1491, 1422]);
const wr = wet([1277, 1356, 1188, 1116]);

// Mix, fade in/out, normalize to -3 dBFS.
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.8) * Math.min(1, (DUR - t) / 2.2);
  L[i] = (L[i] + wl[i] * 0.55) * fade;
  R[i] = (R[i] + wr[i] * 0.55) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = 0.708 / peak;

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
writeFileSync('public/music.wav', buf);
console.log(`public/music.wav written, peak gain ${gain.toFixed(2)}`);
