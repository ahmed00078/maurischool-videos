// The music kit of « La chèvre a encore frappé »: every episode's score is
// built from it, so the series sounds the same from one episode to the next.
//   import { score } from '../chevre/music-kit.mjs';
//   const m = score(new URL('../../src/videos/<video>/timeline.json', import.meta.url));
// m.at[scene] is the beat a scene starts on; the instruments take beats.
// The series' signature is MOTIF, the goat's sneaky tune on the marimba (the
// first notes of ép. 1): every episode opens on it, at m.motif().
// Karplus-Strong plucks, sines and filtered noise, so there is nothing to license.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

/** G major: G2 = 43. */
export const G = 43;
/** The goat's motif: a step up, a chromatic neighbour, a skip. Eighth notes; null is a rest. */
export const MOTIF = [67, 69, 70, 71, null, 74, 71, null];

export const score = (timelineUrl) => {
  const timeline = JSON.parse(readFileSync(timelineUrl, 'utf8'));
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


  /** The motif from `start`, `up` semitones up, each note `step` beats long (0.25: eighths; slower for a replay). */
  const motif = (start, up = 0, { step = 0.25, gain = 0.22, pan = 0.25 } = {}) =>
    MOTIF.forEach((m, k) => {
      if (m !== null) marimba(start + k * step, m + up, gain, pan);
    });

  /** The hook's bed: pizzicato bass on G, snaps on 2 and 4, a hat on the offbeat. */
  const pizz = (from, to, gain = 0.8) => {
    const bass = [G, G + 7, G + 5, G + 7];
    for (let b = from, i = 0; b < to; b++, i++) {
      pluck(b, bass[i % 4], gain, 0.35, -0.1);
      if (i % 2 === 1) snap(b, 0.16);
      hat(b + 0.5, 0.025);
    }
  };

  // ── the bright groove, and the proud tune over it ──
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


  /** The score's moment: two bells, a fifth apart, as the number rolls. */
  const goal = (beat) => {
    bell(beat, 79, 0.07);
    bell(beat + 0.25, 86, 0.05);
  };

  /** The last bar walks up to G for the first beat, where the hook starts again. */
  const loopBack = () => [G + 2, G + 4, G + 6].forEach((m, k) => pluck(TOTAL - 1.5 + k * 0.5, m, 0.6, 0.4, -0.1));

  const reverb = () => {
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

  };

  /** Reverb (unless the score ran it itself, before a tape effect), normalized to -3 dBFS, written to public/<dir>/<file>. */
  const write = (dir, file = 'music.wav', withReverb = true) => {
    if (withReverb) reverb();
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
    mkdirSync(`public/${dir}`, { recursive: true });
    writeFileSync(`public/${dir}/${file}`, buf);
    console.log(`public/${dir}/${file} (${(N / SR).toFixed(2)} s, ${TOTAL} beats)`);
  };

  return { at, TOTAL, BEAT, SR, N, L, R, T, reverb, add, pluck, marimba, snap, clap, hat, kick, drone, bell, motif, pizz, groove, tune, goal, loopBack, write };
};
