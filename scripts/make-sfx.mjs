// Synthesizes a soft transition whoosh (public/shared/sfx/soft-whoosh.wav): node scripts/make-sfx.mjs
// Band-passed noise whose centre frequency sweeps up then down, panned across, ~0.6 s.
import { writeFileSync } from 'node:fs';

const SR = 44100;
const DUR = 0.6;
const N = Math.floor(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

// State-variable band-pass filter, retuned every sample.
let low = 0;
let band = 0;
for (let i = 0; i < N; i++) {
  const t = i / N;
  const fc = 300 + 2600 * Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 2;
  const f = 2 * Math.sin((Math.PI * fc) / SR);
  const q = 0.55;
  const x = rnd();
  low += f * band;
  const high = x - low - q * band;
  band += f * high;
  const env = Math.sin(Math.PI * t) ** 1.6;
  const pan = -0.6 + 1.2 * t;
  L[i] = band * env * (1 - pan) * 0.5;
  R[i] = band * env * (1 + pan) * 0.5;
}

let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.7 / peak;
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
  buf.writeInt16LE(Math.round(L[i] * gain * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * gain * 32767), 46 + i * 4);
}
writeFileSync('public/shared/sfx/soft-whoosh.wav', buf);
console.log('public/shared/sfx/soft-whoosh.wav written');
