// Synthesizes teachers-day-2026's music: node scripts/teachers-day-2026/make-music.mjs
//   → public/teachers-day-2026/music.wav
//
// Written for this edit, in F major at 120 BPM. It reads the video's
// timeline.json, so every section follows the scenes if they are retimed:
//   board     solo piano under the question; a note on the arrow to the comments
//   night     D minor, a heartbeat pulse, a low note for each copy marked
//   register  warm again, a light groove
//   thanks    a bell on "Merci", strings; it ends on C, so the loop falls back on F
// Everything is additive synthesis and filtered noise, so there is nothing to license.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const timeline = JSON.parse(readFileSync(new URL('../../src/videos/teachers-day-2026/timeline.json', import.meta.url), 'utf8'));
const BPM = timeline.bpm;
const BEAT = 60 / BPM;
const starts = {};
let acc = 0;
for (const s of timeline.scenes) {
  starts[s.id] = acc;
  acc += s.beats;
}
const TOTAL_BEATS = acc;
const SR = 44100;
const TAIL = 2;
const DUR = TOTAL_BEATS * BEAT + TAIL;
const N = Math.ceil(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
/** The reverb send: everything that should sit in the room adds to it too. */
const SEND = new Float32Array(N);

let seed = 5;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const T = (beat) => beat * BEAT;
const add = (i, v, pan = 0, send = 0.3) => {
  if (i < 0 || i >= N) return;
  L[i] += v * (1 - pan);
  R[i] += v * (1 + pan);
  SEND[i] += v * send;
};

/**
 * A piano note: eight slightly stretched partials, the higher ones dying
 * sooner, a soft hammer at the start. `vel` 0 to 1.
 */
const piano = (beat, midi, vel = 0.5, lengthBeats = 4) => {
  const f = hz(midi);
  const s0 = Math.floor(T(beat) * SR);
  const dur = Math.min(T(lengthBeats) + 0.6, 6);
  const n = Math.floor(dur * SR);
  const pan = (midi - 62) / 60;
  const B = 0.00035;
  const base = 2.8 * (1 - (midi - 40) / 90);
  const partials = [];
  for (let h = 1; h <= 8; h++) {
    const fh = f * h * Math.sqrt(1 + B * h * h);
    if (fh > 12000) break;
    partials.push({ w: (2 * Math.PI * fh) / SR, a: (1 / h ** 1.25) * (h === 1 ? 1 : 0.7), tau: base / (1 + 0.55 * (h - 1)) });
  }
  const release = T(lengthBeats);
  const gain = 0.16 * vel ** 1.3;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (const p of partials) v += Math.sin(p.w * i) * p.a * Math.exp(-t / p.tau);
    const att = Math.min(1, t / 0.004);
    const rel = t < release ? 1 : Math.exp(-(t - release) / 0.25);
    const hammer = i < 0.012 * SR ? rnd() * Math.exp(-t / 0.003) * 0.25 : 0;
    add(s0 + i, (v * att * rel + hammer) * gain, pan, 0.45);
  }
};

/** A string pad: detuned soft saws (few harmonics), slow in and out. */
const strings = (b0, b1, notes, gain = 0.02) => {
  const t0 = T(b0);
  const t1 = T(b1) + 0.4;
  const s0 = Math.floor(t0 * SR);
  const s1 = Math.min(N, Math.floor(t1 * SR));
  for (const m of notes) {
    for (const cents of [-7, 0, 7]) {
      const w = (2 * Math.PI * hz(m) * 2 ** (cents / 1200)) / SR;
      const pan = cents / 18;
      for (let i = s0; i < s1; i++) {
        const t = (i - s0) / SR;
        const env = Math.min(1, t / 0.7) * Math.min(1, (t1 - i / SR) / 0.6);
        const k = w * (i - s0);
        const v = Math.sin(k) + Math.sin(2 * k) / 4 + Math.sin(3 * k) / 9 + Math.sin(4 * k) / 16;
        add(i, v * env * gain, pan, 0.6);
      }
    }
  }
};

const bass = (beat, midi, lengthBeats = 1, gain = 0.22) => {
  const s0 = Math.floor(T(beat) * SR);
  const dur = T(lengthBeats);
  const w = (2 * Math.PI * hz(midi)) / SR;
  for (let i = 0; i < dur * SR; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.006) * Math.exp(-t / 0.6) * Math.min(1, (dur - t) / 0.04);
    add(s0 + i, (Math.sin(w * i) + 0.25 * Math.sin(2 * w * i)) * env * gain, 0, 0.05);
  }
};

const kick = (beat, gain = 0.55) => {
  const s0 = Math.floor(T(beat) * SR);
  let phase = 0;
  for (let i = 0; i < 0.3 * SR; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * (48 + 90 * Math.exp(-t / 0.025))) / SR;
    add(s0 + i, Math.sin(phase) * Math.exp(-t / 0.11) * gain, 0, 0.02);
  }
};

/** A brushed snare: a short band of noise, soft. */
const brush = (beat, gain = 0.16) => {
  const s0 = Math.floor(T(beat) * SR);
  let lp = 0;
  for (let i = 0; i < 0.16 * SR; i++) {
    const t = i / SR;
    const x = rnd();
    lp += 0.35 * (x - lp);
    add(s0 + i, (x - lp) * Math.exp(-t / 0.05) * gain, 0.15, 0.25);
  }
};

const shaker = (beat, gain = 0.05) => {
  const s0 = Math.floor(T(beat) * SR);
  let prev = 0;
  for (let i = 0; i < 0.05 * SR; i++) {
    const t = i / SR;
    const x = rnd();
    add(s0 + i, (x - prev) * Math.sin((Math.PI * t) / 0.05) * gain, -0.3, 0.15);
    prev = x;
  }
};

/** A bell (inharmonic partials, long ring): the "Merci", the mark. */
const bell = (beat, midi, gain = 0.1) => {
  const s0 = Math.floor(T(beat) * SR);
  const f = hz(midi);
  const parts = [
    [1, 1, 2.2],
    [2.01, 0.5, 1.4],
    [2.76, 0.35, 1.0],
    [5.4, 0.18, 0.5],
    [8.93, 0.08, 0.3],
  ];
  for (let i = 0; i < 3.2 * SR; i++) {
    const t = i / SR;
    let v = 0;
    for (const [r, a, tau] of parts) v += Math.sin(2 * Math.PI * f * r * t) * a * Math.exp(-t / tau);
    add(s0 + i, v * Math.min(1, t / 0.002) * gain, 0.2, 0.7);
  }
};

/** Noise swelling up to `b1`: the breath before a change. */
const swell = (b0, b1, gain = 0.12) => {
  const t0 = T(b0);
  const t1 = T(b1);
  let lp = 0;
  for (let i = Math.floor(t0 * SR); i < t1 * SR && i < N; i++) {
    const p = (i / SR - t0) / (t1 - t0);
    const x = rnd();
    lp += (0.02 + 0.5 * p * p) * (x - lp);
    add(i, lp * p ** 2.2 * gain, Math.sin(p * 9) * 0.3, 0.8);
  }
};

const CH = {
  F: { v: [53, 57, 60, 65], root: 41 },
  Dm: { v: [50, 57, 62, 65], root: 38 },
  Bb: { v: [46, 53, 58, 62], root: 34 },
  C: { v: [48, 55, 60, 64], root: 36 },
  Gm: { v: [43, 50, 55, 58], root: 31 },
};

/** Broken chord in eighths, rising then falling: the piano's accompaniment. */
const arpeggio = (b0, b1, chord, vel = 0.3) => {
  const pattern = [0, 1, 2, 3, 2, 1];
  const notes = CH[chord].v.map((m) => m + 12);
  let k = 0;
  for (let b = b0; b < b1 - 0.01; b += 0.5, k++) piano(b, notes[pattern[k % pattern.length]], vel * (k % 2 ? 0.8 : 1), 1.5);
  piano(b0, CH[chord].root + 12, vel * 1.1, b1 - b0);
};

// ── board: solo piano under the question and the promise ──────────────────────
{
  const s = starts.board;
  arpeggio(s + 0, s + 3, 'F', 0.26);
  arpeggio(s + 3, s + 5, 'Dm', 0.24);
  arpeggio(s + 5, s + 7, 'Bb', 0.26);
  arpeggio(s + 7, s + 9, 'C', 0.24);
  // The arrow to the comments: one high note.
  piano(s + 4, 77, 0.45, 1.5);
  strings(s + 5, s + 9, [58, 62, 65], 0.008);
}

// ── night: D minor, a heartbeat pulse, a low note for each copy marked ────────────
{
  const s = starts.night;
  const plan = [
    [0, 4, 'Dm'],
    [4, 8, 'Bb'],
    [8, 10, 'Gm'],
    [10, 11, 'C'],
  ];
  for (const [a, b, c] of plan) {
    strings(s + a, s + b, CH[c].v, 0.011);
    for (let k = a; k < b; k++) bass(s + k, CH[c].root, 0.9, 0.16 + (k % 2 ? 0 : 0.05));
    piano(s + a, CH[c].v[3] + 12, 0.28, b - a);
  }
  for (let i = 0; i < 9; i++) piano(s + 1 + i, [62, 65, 69, 65][i % 4], 0.16, 1);
  swell(s + 9.5, s + 11, 0.08);
}

// ── register: warm again, a light groove ──────────────────────────────────────────
{
  const from = starts.register;
  const to = starts.thanks;
  for (const m of [41, 53, 57, 60, 65]) piano(from, m, 0.4, 3);
  const prog = ['F', 'C', 'Dm', 'Bb'];
  for (let b = from; b < to; b++) {
    const bar = Math.floor((b - from) / 2);
    const c = CH[prog[bar % 4]];
    const inBar = (b - from) % 4;
    if (inBar === 0 || inBar === 2) kick(b, 0.5);
    if (inBar === 1 || inBar === 3) brush(b, 0.14);
    shaker(b, 0.04);
    shaker(b + 0.5, 0.06);
    bass(b, c.root, 0.45, 0.2);
    bass(b + 0.5, c.root + (inBar === 3 ? 7 : 0), 0.4, 0.12);
    if ((b - from) % 2 === 0) for (const m of c.v) piano(b, m + 12, 0.28, 1.8);
    piano(b + 0.5, c.v[(inBar + 1) % 4] + 24, 0.18, 0.4);
  }
  // The register saved: a small lift.
  bell(from + 3.6, 81, 0.05);
  swell(to - 1.2, to, 0.08);
}

// ── thanks: the bell on "Merci"; strings; C at the end, to fall back on F as it loops ──
{
  const s = starts.thanks;
  for (const m of [41, 53, 60, 65, 69, 72]) piano(s + 0.3, m, 0.55, 3);
  bell(s + 0.3, 77, 0.1);
  bell(s + 0.3, 81, 0.05);
  const plan = [
    [0.3, 3, 'F'],
    [3, 5.2, 'Bb'],
    [5.2, 8, 'C'],
    [8, 10, 'Dm'],
    [10, 12, 'Bb'],
    [12, 17, 'C'],
  ];
  for (const [a, b, c] of plan) {
    arpeggio(s + a, s + b, c, 0.26);
    strings(s + a, s + b, CH[c].v.map((m) => m + 12), 0.011);
    bass(s + a, CH[c].root + 12, b - a, 0.12);
  }
  piano(s + 5.2, 72, 0.4, 2);
  piano(s + 6.6, 77, 0.45, 2);
}

// ── room: a small Schroeder reverb on the send, then master ─────────────────────
{
  const comb = (x, delay, fb) => {
    const out = new Float32Array(x.length);
    let lp = 0;
    for (let i = 0; i < x.length; i++) {
      const d = i >= delay ? out[i - delay] : 0;
      lp = d * 0.7 + lp * 0.3;
      out[i] = x[i] + lp * fb;
    }
    return out;
  };
  const allpass = (x, delay, g) => {
    const out = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      const xd = i >= delay ? x[i - delay] : 0;
      const yd = i >= delay ? out[i - delay] : 0;
      out[i] = -g * x[i] + xd + g * yd;
    }
    return out;
  };
  const wet = (delays) => {
    const sum = new Float32Array(N);
    for (const d of delays) {
      const c = comb(SEND, d, 0.83);
      for (let i = 0; i < N; i++) sum[i] += c[i] / delays.length;
    }
    return allpass(allpass(sum, 225, 0.6), 556, 0.6);
  };
  const wl = wet([1557, 1617, 1491, 1422]);
  const wr = wet([1581, 1643, 1511, 1447]);
  for (let i = 0; i < N; i++) {
    L[i] += wl[i] * 0.32;
    R[i] += wr[i] * 0.32;
  }
}

// Gentle glue: a soft clip, then normalise to -2 dBFS with fades.
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.2);
  R[i] = Math.tanh(R[i] * 1.2);
  const t = i / SR;
  const fade = Math.min(1, t / 0.02) * Math.min(1, (DUR - t) / 1.4);
  L[i] *= fade;
  R[i] *= fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = 0.794 / peak;
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
mkdirSync('public/teachers-day-2026', { recursive: true });
writeFileSync('public/teachers-day-2026/music.wav', buf);
console.log(`public/teachers-day-2026/music.wav: ${TOTAL_BEATS} beats at ${BPM} BPM (${DUR.toFixed(1)} s), gain ${gain.toFixed(2)}`);
