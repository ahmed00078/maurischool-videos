// Synthesizes the goat's sounds for the kit: node scripts/make-goat-sfx.mjs
//   public/shared/sfx/chew.wav    one bite of paper: a wet crunch, crackle over a soft thump
//   public/shared/sfx/paper.wav   a ledger page turned: a swish that opens up, a crackle at the start
//   public/shared/sfx/rewind.wav  a tape rewinding: chipmunk warble over a rising motor and hiss
//   public/shared/sfx/bleat.wav   a disappointed « mêêê »: a falling, trembling bleat
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

// ── chew: a crunch of little cracks, a soft thump of the jaw, a wet smack ──
{
  const N = Math.floor(0.3 * SR);
  const x = new Float32Array(N);
  const f = svf();
  const g = svf();
  // The cracks: random clicks, denser at the start of the bite.
  const cracks = [];
  for (let k = 0; k < 26; k++) cracks.push(Math.floor(Math.abs(rnd()) ** 1.8 * 0.2 * SR));
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let c = 0;
    for (const s of cracks) {
      const d = i - s;
      if (d >= 0 && d < 300) c += rnd() * Math.exp(-d / 40);
    }
    const crunch = f(c, 3200, 0.6).band * 1.6;
    ph += (2 * Math.PI * (110 + 60 * Math.exp(-t / 0.03))) / SR;
    const thump = Math.sin(ph) * Math.exp(-t / 0.05) * 0.5;
    const smack = g(rnd(), 900, 0.3).band * Math.exp(-Math.abs(t - 0.2) / 0.012) * 0.6;
    x[i] = (crunch + thump + smack) * Math.min(1, t / 0.004) * (t > 0.25 ? Math.exp(-(t - 0.25) / 0.02) : 1);
  }
  write('chew', room(x, 0.08), undefined, -4);
}

// ── paper: a page turned, the swish opening up from dull to bright ──
{
  const N = Math.floor(0.42 * SR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const f = svf();
  const g = svf();
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const p = t / 0.42;
    const env = Math.sin(Math.PI * Math.min(1, p * 1.2)) ** 1.5;
    const swish = f(rnd(), 900 + 4200 * p, 0.8).band * env;
    const crackle = (Math.abs(rnd()) > 0.985 ? rnd() * 3 : 0) * Math.exp(-t / 0.08);
    const body = g(rnd(), 400, 0.5).low * env * 0.6;
    L[i] = swish * (1 - p * 0.5) + crackle + body;
    R[i] = swish * (0.5 + p * 0.5) + crackle * 0.8 + body;
  }
  write('paper', room(L, 0.1), room(R, 0.1), -6);
}

// ── rewind: a tape running backwards, fast ──
{
  const N = Math.floor(1.9 * SR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  const f = svf();
  const hiss = svf();
  let ph = 0;
  let ph2 = 0;
  let motor = 0;
  // Garbled pitch: a random walk of little jumps, the sound of speech and music played backwards at speed.
  let target = 1400;
  let pitch = 1400;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    if (i % Math.floor(0.045 * SR) === 0) target = 900 + Math.abs(rnd()) * 2200;
    pitch += (target - pitch) * 0.004;
    ph += (2 * Math.PI * pitch * (1 + 0.04 * Math.sin(2 * Math.PI * 23 * t))) / SR;
    ph2 += (2 * Math.PI * pitch * 1.5) / SR;
    const warble = f(Math.sin(ph) * 0.6 + Math.sin(ph2) * 0.25 + rnd() * 0.2, pitch * 1.2, 0.5).low;
    motor += (2 * Math.PI * (180 + 260 * Math.min(1, t / 0.4))) / SR;
    const whine = Math.sin(motor) * 0.18 + Math.sin(motor * 2) * 0.08;
    const h = hiss(rnd(), 6000, 0.7).high * 0.25;
    const env = Math.min(1, t / 0.05) * (t > 1.7 ? Math.exp(-(t - 1.7) / 0.05) : 1);
    L[i] = (warble * 0.8 + whine + h) * env;
    R[i] = (warble * 0.7 + whine * 0.9 + h * 1.1) * env;
  }
  write('rewind', L, R, -5);
}

// ── bleat: « mêêê », deflated ──
{
  const N = Math.floor(1.1 * SR);
  const x = new Float32Array(N);
  const f1 = svf();
  const f2 = svf();
  const f3 = svf();
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    // Starts a little high, sags; the goat's tremble is a fast wobble in pitch and loudness.
    const base = 460 - 150 * Math.min(1, t / 0.95) ** 1.3;
    const trem = Math.sin(2 * Math.PI * 11 * t);
    ph += (2 * Math.PI * base * (1 + 0.035 * trem)) / SR;
    const saw = 2 * ((ph / (2 * Math.PI)) % 1) - 1;
    const src = saw + rnd() * 0.08;
    // Formants of an "è" going toward "a": the mouth opens a little as the sigh ends.
    const open = Math.min(1, t / 0.8);
    const voice = f1(src, 600 + 150 * open, 0.25).band * 1.1 + f2(src, 1800 - 300 * open, 0.2).band * 0.7 + f3(src, 2700, 0.15).band * 0.35;
    const env = Math.min(1, t / 0.06) * (0.75 + 0.25 * trem) * (t > 0.85 ? Math.exp(-(t - 0.85) / 0.08) : 1);
    // "M": closed lips at the start, a nasal hum.
    const m = t < 0.07 ? Math.sin(ph) * 0.5 * (1 - t / 0.07) : 0;
    x[i] = voice * env + m;
  }
  write('bleat', room(x, 0.2), undefined, -3);
}
