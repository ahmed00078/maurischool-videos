// Synthesizes the classroom sounds of the kit: node scripts/make-classroom-sfx.mjs
//   public/shared/sfx/chalk.wav      2.6 s of chalk writing (cut it to a line's length with <Sfx length>)
//   public/shared/sfx/chalk-tap.wav  one tap of chalk on the board (a full stop, an accent)
//   public/shared/sfx/eraser.wav     a felt eraser swept across the board, three passes
//   public/shared/sfx/tick.wav       a wall clock's tick
//   public/shared/sfx/bell.wav       the school hand bell, shaken for a second
// Everything is noise and sine partials shaped by filters and envelopes, so there is nothing to license.
import { mkdirSync, writeFileSync } from 'node:fs';

const SR = 44100;
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const between = (a, b) => a + (b - a) * (rnd() * 0.5 + 0.5);

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

const write = (name, L, R, peakDb = -3) => {
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

/** The knock of the chalk landing: a short dull click and a low thump. */
const tap = (L, R, at, gain = 1) => {
  const f = svf();
  const s0 = Math.floor(at * SR);
  for (let i = 0; i < 0.06 * SR && s0 + i < L.length; i++) {
    const t = i / SR;
    const click = f(rnd(), 1800, 0.9).low * Math.exp(-t / 0.004);
    const thump = Math.sin(2 * Math.PI * 170 * t) * Math.exp(-t / 0.018) * 0.35;
    const v = (click * 1.4 + thump) * gain;
    L[s0 + i] += v;
    R[s0 + i] += v * 0.92;
  }
};

/**
 * One chalk stroke: friction noise in the 2–5 kHz band, roughened by the
 * stick-slip buzz of chalk on slate (a grain rate of a few hundred hertz that
 * wanders), with a tap where the stroke lands.
 */
const stroke = (L, R, at, dur, gain = 1) => {
  const bp = svf();
  const hp = svf();
  const s0 = Math.floor(at * SR);
  const n = Math.floor(dur * SR);
  const fc = between(2400, 4600);
  let grain = between(170, 320);
  let phase = 0;
  let wobble = 0;
  const pan = between(-0.25, 0.25);
  for (let i = 0; i < n && s0 + i < L.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.006) * Math.min(1, (dur - t) / 0.025);
    grain += rnd() * 0.8;
    phase += (2 * Math.PI * grain) / SR;
    wobble += 0.002 * (rnd() - wobble);
    const buzz = 0.45 + 0.55 * Math.max(0, Math.sin(phase + wobble * 40)) ** 3;
    const x = rnd();
    const band = bp(x, fc * (1 + 0.15 * Math.sin(t * 23)), 0.35).band;
    const air = hp(x, 6500, 0.7).high * 0.25;
    const v = (band * buzz + air * buzz) * env * gain;
    L[s0 + i] += v * (1 - pan);
    R[s0 + i] += v * (1 + pan);
  }
  tap(L, R, at, 0.5 * gain);
};

// chalk: strokes of 80–200 ms with short lifts, like handwriting at a steady pace.
{
  const DUR = 2.6;
  const L = new Float32Array(Math.ceil(DUR * SR));
  const R = new Float32Array(L.length);
  let t = 0.005;
  while (t < DUR - 0.12) {
    const d = between(0.08, 0.2);
    stroke(L, R, t, d, between(0.7, 1));
    t += d + between(0.015, 0.06);
  }
  write('chalk', L, R, -4);
}

// chalk-tap: a full stop pressed into the board.
{
  const L = new Float32Array(Math.ceil(0.12 * SR));
  const R = new Float32Array(L.length);
  tap(L, R, 0.002, 1);
  stroke(L, R, 0.004, 0.03, 0.5);
  write('chalk-tap', L, R, -5);
}

// eraser: felt on slate, three sweeps; soft, low, breathy.
{
  const DUR = 0.95;
  const L = new Float32Array(Math.ceil(DUR * SR));
  const R = new Float32Array(L.length);
  const passes = 3;
  const f = svf();
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const p = (t / DUR) * passes;
    const k = p - Math.floor(p);
    const sweep = Math.sin(Math.PI * k) ** 0.8;
    const fc = 500 + 1300 * sweep;
    const x = rnd();
    const v = f(x, fc, 0.8).band * sweep * Math.min(1, (DUR - t) / 0.05);
    const pan = Math.floor(p) % 2 ? 0.35 - 0.7 * k : -0.35 + 0.7 * k;
    L[i] = v * (1 - pan);
    R[i] = v * (1 + pan);
  }
  write('eraser', L, R, -6);
}

// tick: the escapement of a wall clock, a dry click with a small wooden ring.
{
  const L = new Float32Array(Math.ceil(0.09 * SR));
  const R = new Float32Array(L.length);
  const f = svf();
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const click = f(rnd(), 3200, 0.5).band * Math.exp(-t / 0.0025);
    const ring = Math.sin(2 * Math.PI * 2100 * t) * Math.exp(-t / 0.012) * 0.25;
    const body = Math.sin(2 * Math.PI * 620 * t) * Math.exp(-t / 0.02) * 0.2;
    L[i] = click + ring + body;
    R[i] = L[i];
  }
  write('tick', L, R, -6);
}

// bell: the school's hand bell, shaken: a small brass bell whose clapper
// strikes one side then the other, about seven times a second, each strike
// ringing the bell's inharmonic partials; the swing pans it a little.
{
  const DUR = 2.2;
  const L = new Float32Array(Math.ceil(DUR * SR));
  const R = new Float32Array(L.length);
  const F = 1245;
  const partials = [
    [1, 1, 1.3],
    [2.32, 0.45, 0.7],
    [3.92, 0.3, 0.4],
    [5.43, 0.16, 0.25],
  ];
  let t = 0.004;
  for (let k = 0; k < 9; k++) {
    const gain = (k % 2 ? 0.75 : 1) * between(0.85, 1);
    const pan = (k % 2 ? 0.2 : -0.2) + between(-0.05, 0.05);
    const s0 = Math.floor(t * SR);
    const f = svf();
    for (let i = 0; s0 + i < L.length; i++) {
      const u = i / SR;
      let v = f(rnd(), 5200, 0.6).band * Math.exp(-u / 0.003) * 0.6;
      for (const [ratio, amp, decay] of partials) {
        // A slight beat between the two sides of the bell keeps it alive.
        v += Math.sin(2 * Math.PI * F * ratio * u * (1 + 0.0015 * (k % 2))) * amp * Math.exp(-u / decay);
      }
      v *= gain;
      L[s0 + i] += v * (1 - pan);
      R[s0 + i] += v * (1 + pan);
    }
    t += 1 / 7 + between(-0.012, 0.012);
  }
  for (let i = 0; i < L.length; i++) {
    const fade = Math.min(1, (L.length - i) / (0.3 * SR));
    L[i] *= fade;
    R[i] *= fade;
  }
  write('bell', L, R, -5);
}
