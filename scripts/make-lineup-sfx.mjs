// Synthesizes the lineup sounds of the kit: node scripts/make-lineup-sfx.mjs
//   public/shared/sfx/pop.wav     a speech bubble popping in
//   public/shared/sfx/stamp.wav   a rubber stamp slammed on a placard
//   public/shared/sfx/buzz.wav    a phone vibrating twice on a table
//   public/shared/sfx/sting.wav   the reveal: a low orchestral hit
//   public/shared/sfx/wahwah.wav  the sad trombone, four notes down
// Everything is oscillators, noise and filters, so there is nothing to license.
import { mkdirSync, writeFileSync } from 'node:fs';

const SR = 44100;
let seed = 11;
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
  for (const [d, g] of [[0.023, 0.5], [0.031, 0.42], [0.043, 0.35], [0.057, 0.28]]) {
    const n = Math.floor(d * SR);
    const fb = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      fb[i] = x[i] + (i >= n ? fb[i - n] * g : 0);
      out[i] += (i >= n ? fb[i - n] : 0) * mix * 0.4;
    }
  }
  return out;
};

// ── pop: a quick pitch drop and a click ──
{
  const N = Math.floor(0.12 * SR);
  const x = new Float32Array(N);
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (380 + 900 * Math.exp(-t / 0.018))) / SR;
    x[i] = Math.sin(ph) * Math.exp(-t / 0.035) * Math.min(1, t / 0.002) + (i < 60 ? rnd() * 0.3 * (1 - i / 60) : 0);
  }
  write('pop', room(x, 0.1), undefined, -4);
}

// ── stamp: a low thump, the rubber slapping, a little wood ──
{
  const N = Math.floor(0.45 * SR);
  const x = new Float32Array(N);
  const f = svf();
  const g = svf();
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (55 + 110 * Math.exp(-t / 0.02))) / SR;
    const thump = Math.sin(ph) * Math.exp(-t / 0.09);
    const slap = f(rnd(), 1400, 0.7).low * Math.exp(-t / 0.018) * 1.6;
    const wood = g(rnd(), 520, 0.15).band * Math.exp(-t / 0.05) * 1.2;
    x[i] = thump * 0.9 + slap + wood;
  }
  write('stamp', room(x, 0.25), undefined, -2);
}

// ── buzz: two pulses of a small motor rattling on a table ──
{
  const N = Math.floor(0.95 * SR);
  const x = new Float32Array(N);
  const f = svf();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const on = (t < 0.36 ? 1 : 0) + (t > 0.5 && t < 0.86 ? 1 : 0);
    const env = on * Math.min(1, ((t % 0.5) + 0.001) / 0.02);
    const motor = Math.sign(Math.sin(2 * Math.PI * 165 * t)) * 0.6 + Math.sin(2 * Math.PI * 330 * t) * 0.3;
    const rattle = f(motor + rnd() * 0.3, 900, 0.5).low;
    x[i] = rattle * env;
  }
  write('buzz', room(x, 0.12), undefined, -6);
}

// ── sting: a minor chord of low brass, a timpani, a crash of noise ──
{
  const N = Math.floor(2.4 * SR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const hz = (m) => 440 * 2 ** ((m - 69) / 12);
  const notes = [38, 45, 50, 53, 57]; // D minor, low
  const filters = notes.map(() => [svf(), svf()]);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.008) * Math.exp(-t / 0.9);
    const bright = 300 + 3500 * Math.exp(-t / 0.25);
    let l = 0;
    let r = 0;
    notes.forEach((m, k) => {
      for (const [side, cents] of [[0, -9], [1, 9]]) {
        const fr = hz(m) * 2 ** (cents / 1200);
        const saw = 2 * ((t * fr) % 1) - 1;
        const y = filters[k][side](saw, bright, 0.6).low;
        if (side === 0) l += y;
        else r += y;
      }
    });
    const timp = Math.sin(2 * Math.PI * (70 + 40 * Math.exp(-t / 0.05)) * t) * Math.exp(-t / 0.5) * 1.4;
    const crash = rnd() * Math.exp(-t / 0.35) * 0.25;
    L[i] = (l * 0.22 + timp + crash) * env;
    R[i] = (r * 0.22 + timp + crash * 0.9) * env;
  }
  write('sting', room(L, 0.3), room(R, 0.3), -2);
}

// ── wahwah: the sad trombone, G F# F E, the last one long and wobbling ──
{
  const hz = (m) => 440 * 2 ** ((m - 69) / 12);
  const notes = [
    [55, 0.0, 0.42],
    [54, 0.45, 0.42],
    [53, 0.9, 0.42],
    [52, 1.35, 1.2],
  ];
  const N = Math.floor(2.8 * SR);
  const x = new Float32Array(N);
  for (const [m, start, len] of notes) {
    const f = svf();
    const s0 = Math.floor(start * SR);
    let ph = 0;
    for (let i = 0; i < len * SR + 0.15 * SR && s0 + i < N; i++) {
      const t = i / SR;
      const last = len > 1;
      const vib = last ? Math.sin(2 * Math.PI * 5.5 * t) * 0.012 * Math.min(1, t / 0.4) : 0;
      const bend = -0.03 * Math.min(1, t / len) * (last ? 1.5 : 1);
      ph += (2 * Math.PI * hz(m) * (1 + vib + bend)) / SR;
      const saw = 2 * ((ph / (2 * Math.PI)) % 1) - 1;
      // The plunger: the filter opens as each note speaks, "wah".
      const open = Math.min(1, t / 0.12);
      const cutoff = 350 + 1500 * open * (last ? 0.7 + 0.3 * Math.sin(2 * Math.PI * 2.5 * t) : 1);
      const env = Math.min(1, t / 0.03) * (t < len ? 1 : Math.exp(-(t - len) / 0.05));
      x[s0 + i] += f(saw, cutoff, 0.35).low * env * 0.8;
    }
  }
  write('wahwah', room(x, 0.2), undefined, -3);
}
