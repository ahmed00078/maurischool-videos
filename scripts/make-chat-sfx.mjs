// Synthesizes the chat sounds for the kit: node scripts/make-chat-sfx.mjs
//   public/shared/sfx/blip.wav    a message landing: two soft wooden notes, a fifth apart, the second brighter
//   public/shared/sfx/flick.wav   a thumb flicking a long list: a quick airy swish that rises and dies
//   public/shared/sfx/tear.wav    a calendar leaf torn off: a crackling rip, bright at its end
//   public/shared/sfx/freeze.wav  a freeze frame: a shutter's double click over a low, short thump
// Nobody's notification sound: oscillators, noise and filters, so there is nothing to license.
import { mkdirSync, writeFileSync } from 'node:fs';

const SR = 44100;
let seed = 41;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

/** A state-variable filter; call it once per sample with the input and its settings. */
const svf = () => {
  let low = 0;
  let band = 0;
  return (x, fc, q) => {
    const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
    low += f * band;
    const high = x - low - q * band;
    band += f * high;
    return { low, band, high };
  };
};

const write = (name, L, R = L, peakDb = -3) => {
  const N = L.length;
  let peak = 0;
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const gain = 10 ** (peakDb / 20) / peak;
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
  mkdirSync('public/shared/sfx', { recursive: true });
  writeFileSync(`public/shared/sfx/${name}.wav`, buf);
  console.log(`public/shared/sfx/${name}.wav (${(N / SR).toFixed(2)} s)`);
};

// ── blip: two little wooden notes, the second a fifth up and brighter ──
{
  const N = Math.floor(0.26 * SR);
  const x = new Float32Array(N);
  const note = (t0, f, gain) => {
    for (let i = Math.floor(t0 * SR); i < N; i++) {
      const t = i / SR - t0;
      const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.07) + 0.35 * Math.sin(2 * Math.PI * f * 3.01 * t) * Math.exp(-t / 0.015);
      x[i] += v * gain * Math.min(1, t / 0.002);
    }
  };
  note(0, 1046.5, 0.8);
  note(0.075, 1568, 0.7);
  write('blip', x, undefined, -4);
}

// ── flick: air rushing past, rising, gone ──
{
  const N = Math.floor(0.3 * SR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const f = svf();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const p = t / 0.3;
    const env = Math.sin(Math.PI * Math.min(1, p * 1.6)) ** 2 * (1 - p);
    const v = f(rnd(), 700 + 5200 * p, 0.7).band * env;
    L[i] = v * (1 - 0.4 * p);
    R[i] = v * (0.6 + 0.4 * p);
  }
  write('flick', L, R, -8);
}

// ── tear: a rip of paper, crackles getting denser and brighter ──
{
  const N = Math.floor(0.36 * SR);
  const x = new Float32Array(N);
  const f = svf();
  const g = svf();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const p = t / 0.36;
    const density = 0.94 - 0.1 * p;
    const crackle = Math.abs(rnd()) > density ? rnd() * 2 : 0;
    const rip = f(crackle + rnd() * 0.15, 1800 + 3000 * p, 0.5).band;
    const body = g(rnd(), 500, 0.6).band * 0.3;
    const env = Math.min(1, t / 0.01) * (p > 0.85 ? (1 - p) / 0.15 : 1);
    x[i] = (rip * 1.4 + body) * env;
  }
  write('tear', x, undefined, -6);
}

// ── freeze: a shutter's double click, a short low thump under it ──
{
  const N = Math.floor(0.4 * SR);
  const x = new Float32Array(N);
  const f = svf();
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let click = 0;
    for (const c of [0, 0.045]) {
      const d = t - c;
      if (d >= 0 && d < 0.02) click += rnd() * Math.exp(-d / 0.003);
    }
    ph += (2 * Math.PI * (70 + 90 * Math.exp(-t / 0.04))) / SR;
    const thump = Math.sin(ph) * Math.exp(-t / 0.09) * 0.8;
    x[i] = f(click, 3500, 0.4).band * 2 + thump;
  }
  write('freeze', x, undefined, -3);
}
