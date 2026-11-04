// Synthesizes the sounds of « La chèvre a encore frappé »: node scripts/make-chevre-sfx.mjs
//   public/shared/sfx/whistle.wav  a referee's whistle: two short pips and a long trill (the score changes)
//   public/shared/sfx/dun.wav      one hit of « dun, dun, DUN »: low brass and a timpani under it
// Everything is oscillators, noise and filters, so there is nothing to license.
import { mkdirSync, writeFileSync } from 'node:fs';

const SR = 44100;
let seed = 23;
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

/** A short room, so the dry sounds do not sound pasted on. */
const room = (x, mix = 0.18) => {
  const out = Float32Array.from(x);
  for (const [d, g] of [[0.019, 0.5], [0.029, 0.42], [0.041, 0.35], [0.053, 0.28]]) {
    const n = Math.floor(d * SR);
    const fb = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      fb[i] = x[i] + (i >= n ? fb[i - n] * g : 0);
      out[i] += (i >= n ? fb[i - n] : 0) * mix * 0.4;
    }
  }
  return out;
};

// ── whistle: a pea whistle, its pitch trilled by the pea; pip, pip, peeeep ──
{
  const pips = [[0, 0.11], [0.17, 0.11], [0.34, 0.62]];
  const N = Math.floor(1.05 * SR);
  const x = new Float32Array(N);
  const f = svf();
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let env = 0;
    for (const [a, d] of pips) {
      if (t >= a && t < a + d + 0.03) env = Math.max(env, Math.min(1, (t - a) / 0.008) * Math.min(1, (a + d + 0.03 - t) / 0.03));
    }
    // The pea rattles the pitch about 28 times a second.
    const trill = 1 + 0.035 * Math.sin(2 * Math.PI * 28 * t) + 0.01 * Math.sin(2 * Math.PI * 61 * t);
    ph += (2 * Math.PI * 2950 * trill) / SR;
    const tone = Math.sin(ph) + 0.25 * Math.sin(2 * ph) + 0.08 * Math.sin(3 * ph);
    const breath = f(rnd(), 3000, 0.4).band * 0.35;
    x[i] = (tone * 0.8 + breath) * env;
  }
  write('whistle', room(x, 0.22), undefined, -6);
}

// ── dun: a dramatic hit, a low brass chord swelling over a timpani ──
{
  const N = Math.floor(0.9 * SR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const f = svf();
  const freqs = [73.4, 110, 146.8, 174.6]; // D2, A2, D3, F3: minor, ominous
  const ph = freqs.map(() => 0);
  let tp = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.02) * Math.exp(-t / 0.45);
    let brass = 0;
    freqs.forEach((fr, k) => {
      ph[k] += (2 * Math.PI * fr * (1 + 0.003 * Math.sin(2 * Math.PI * 5 * t + k))) / SR;
      // A buzzy brass: odd and even partials, brighter as it swells.
      brass += Math.sin(ph[k]) + 0.5 * Math.sin(2 * ph[k]) + 0.3 * Math.sin(3 * ph[k]) * Math.min(1, t / 0.06);
    });
    tp += (2 * Math.PI * (55 + 30 * Math.exp(-t / 0.05))) / SR;
    const timp = Math.sin(tp) * Math.exp(-t / 0.3) * 1.4 + f(rnd(), 200, 0.5).low * Math.exp(-t / 0.04) * 1.2;
    L[i] = (brass * 0.22 + timp) * env;
    R[i] = (brass * 0.2 + timp * 0.95) * env;
  }
  write('dun', room(L, 0.25), room(R, 0.25), -3);
}
