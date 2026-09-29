// Synthesizes promo-2026's temp track: node scripts/promo-2026/make-temp-track.mjs [lang]
//   no lang  → public/promo-2026/temp-track.wav, on the base timing
//   fr, ...  → public/promo-2026/temp-track-<lang>.wav, on the timing stretched to that
//              language's voice (voice.<lang>.json, see scripts/fit-voice.mjs)
//
// A stand-in so the animatic can be judged on rhythm; the final music replaces it.
// It reads src/videos/promo-2026/timeline.json, so its sections follow the edit:
//   hook      tense pulse, then everything stops when the question lands
//   chaos     a slam on every beat, then a riser
//   logo      the drop, and the groove (D A Bm G) through the features
//   languages a breakdown: drums out, a riser back in
//   roles/cta the groove again, then a held D chord to close
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const timeline = JSON.parse(readFileSync(new URL('../../src/videos/promo-2026/timeline.json', import.meta.url), 'utf8'));
const lang = process.argv[2];
const voiceUrl = lang ? new URL(`../../src/videos/promo-2026/voice.${lang}.json`, import.meta.url) : null;
const voice = voiceUrl && existsSync(voiceUrl) ? JSON.parse(readFileSync(voiceUrl, 'utf8')) : null;
if (lang && !voice) {
  console.error(`no src/videos/promo-2026/voice.${lang}.json: run scripts/fit-voice.mjs first`);
  process.exit(1);
}
// A voiced scene only ever grows, by whole beats, exactly as src/shared/beat.ts does.
for (const s of timeline.scenes) s.beats = Math.max(s.beats, voice?.scenes[s.id]?.beats ?? 0);
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
const DUR = TOTAL_BEATS * BEAT + 1.5;
const N = Math.ceil(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const beatTime = (b) => b * BEAT;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
let seed = 3;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const add = (i, v, pan = 0) => {
  if (i < 0 || i >= N) return;
  L[i] += v * (1 - pan);
  R[i] += v * (1 + pan);
};

const kick = (t, gain = 0.9) => {
  const s0 = Math.floor(t * SR);
  let phase = 0;
  for (let i = 0; i < 0.35 * SR; i++) {
    const tt = i / SR;
    const f = 45 + 110 * Math.exp(-tt / 0.03);
    phase += (2 * Math.PI * f) / SR;
    add(s0 + i, Math.sin(phase) * Math.exp(-tt / 0.12) * gain);
  }
};
const clap = (t, gain = 0.35) => {
  const s0 = Math.floor(t * SR);
  let prev = 0;
  for (let i = 0; i < 0.18 * SR; i++) {
    const tt = i / SR;
    const n = rnd();
    const bp = n - prev * 0.6;
    prev = n;
    const env = (tt < 0.02 ? Math.exp(-(tt % 0.007) / 0.002) : 1) * Math.exp(-tt / 0.06);
    add(s0 + i, bp * env * gain, 0.1);
  }
};
const hat = (t, gain = 0.08, pan = 0.3) => {
  const s0 = Math.floor(t * SR);
  let prev = 0;
  for (let i = 0; i < 0.05 * SR; i++) {
    const n = rnd();
    add(s0 + i, (n - prev) * Math.exp(-i / SR / 0.012) * gain, pan);
    prev = n;
  }
};
const tone = (t, midi, dur, gain, { harmonics = 3, decay = 0.4, pan = 0, attack = 0.005 } = {}) => {
  const s0 = Math.floor(t * SR);
  const f = hz(midi);
  const len = Math.floor(dur * SR);
  for (let i = 0; i < len; i++) {
    const tt = i / SR;
    const env = Math.min(1, tt / attack) * Math.exp(-tt / decay) * Math.min(1, (dur - tt) / 0.05);
    let v = 0;
    for (let h = 1; h <= harmonics; h++) v += Math.sin(2 * Math.PI * f * h * tt) / h ** 1.5;
    add(s0 + i, v * env * gain, pan);
  }
};
const pad = (t0, t1, notes, gain = 0.03) => {
  for (const m of notes) {
    for (const cents of [-6, 6]) {
      const f = hz(m) * 2 ** (cents / 1200);
      const s0 = Math.floor(t0 * SR);
      const s1 = Math.floor(t1 * SR);
      for (let i = s0; i < s1 && i < N; i++) {
        const tt = (i - s0) / SR;
        const env = Math.min(1, tt / 0.6) * Math.min(1, (t1 - i / SR) / 0.5);
        let v = 0;
        for (let h = 1; h <= 4; h++) v += Math.sin(2 * Math.PI * f * h * tt) / h ** 1.7;
        add(i, v * env * gain, cents / 14);
      }
    }
  }
};
const riser = (t0, t1, gain = 0.25) => {
  let prev = 0;
  for (let i = Math.floor(t0 * SR); i < t1 * SR && i < N; i++) {
    const p = (i / SR - t0) / (t1 - t0);
    const n = rnd();
    const k = 0.05 + 0.9 * p;
    prev = prev + k * (n - prev);
    add(i, (n - prev) * p * p * gain, Math.sin(p * 12) * 0.3);
  }
};
const impact = (t, gain = 1) => {
  const s0 = Math.floor(t * SR);
  let phase = 0;
  for (let i = 0; i < 1.4 * SR; i++) {
    const tt = i / SR;
    const f = 32 + 90 * Math.exp(-tt / 0.08);
    phase += (2 * Math.PI * f) / SR;
    add(s0 + i, (Math.sin(phase) * Math.exp(-tt / 0.5) + rnd() * Math.exp(-tt / 0.05) * 0.4) * gain);
  }
};

const CHORDS = {
  D: { notes: [62, 66, 69], root: 38 },
  A: { notes: [61, 64, 69], root: 33 },
  Bm: { notes: [62, 66, 71], root: 35 },
  G: { notes: [62, 67, 71], root: 31 },
};
const PROG = ['D', 'A', 'Bm', 'G'];

const groove = (fromBeat, toBeat, { drums = true } = {}) => {
  for (let b = fromBeat; b < toBeat; b++) {
    const t = beatTime(b);
    const barBeat = (b - starts.logo) % 4;
    const chord = CHORDS[PROG[Math.floor((b - starts.logo) / 4) % 4]];
    if (drums) {
      if (barBeat === 0 || barBeat === 2) kick(t);
      if (barBeat === 1 || barBeat === 3) clap(t);
      hat(t + BEAT / 2, 0.09);
      hat(t, 0.04, -0.3);
      // Bass: the root on eighths, the off-beat a little quieter.
      tone(t, chord.root, BEAT / 2, 0.22, { harmonics: 2, decay: 0.2 });
      tone(t + BEAT / 2, chord.root, BEAT / 2, 0.14, { harmonics: 2, decay: 0.2 });
    }
    // Plucked chord stabs on the off-beat, arpeggio sparkle on sixteenths.
    for (const m of chord.notes) tone(t + BEAT / 2, m, 0.3, 0.035, { decay: 0.12, pan: (m % 3) * 0.2 - 0.2 });
    const arp = [...chord.notes, chord.notes[1] + 12];
    for (let k = 0; k < 4; k++) tone(t + (k * BEAT) / 4, arp[k] + 12, 0.2, 0.018, { decay: 0.08, pan: k % 2 ? 0.4 : -0.4 });
    if (barBeat === 0) pad(t, t + 4 * BEAT, chord.notes.map((m) => m - 12), 0.012);
  }
};

// Hook: a tense pulse that speeds up, then silence under the question.
const hookEnd = starts.chaos;
const freeze = starts.hook + (voice?.scenes.hook?.marks?.question ?? 4);
for (let b = 0; b < freeze; b += 0.5) {
  hat(beatTime(b), 0.03 + (b / freeze) * 0.06);
  if (b % 1 === 0) tone(beatTime(b), 35, 0.3, 0.25, { harmonics: 2, decay: 0.15 });
}
pad(0, beatTime(freeze), [47, 50, 54], 0.02);
impact(beatTime(freeze), 0.5);
pad(beatTime(freeze), beatTime(hookEnd), [47, 50, 53, 57], 0.022);

// Chaos: a slam on every beat, a riser into the logo.
for (let b = starts.chaos; b < starts.logo; b++) {
  kick(beatTime(b), b - starts.chaos < 4 ? 1 : 0.6);
  if (b - starts.chaos < 4) tone(beatTime(b), 47 + ((b * 5) % 7), 0.4, 0.05, { harmonics: 5, decay: 0.25 });
  hat(beatTime(b + 0.5), 0.05);
}
riser(beatTime(starts.chaos + 4), beatTime(starts.logo), 0.3);

// Logo: the drop.
impact(beatTime(starts.logo), 1);
groove(starts.logo, starts.languages);

// Languages: breakdown, then a riser back in.
groove(starts.languages, starts.roles, { drums: false });
riser(beatTime(starts.roles - 2), beatTime(starts.roles), 0.25);
impact(beatTime(starts.roles), 0.6);
groove(starts.roles, TOTAL_BEATS - 4);

// Close on a held D chord.
const end = beatTime(TOTAL_BEATS - 4);
kick(end);
pad(end, DUR, [50, 54, 57, 62], 0.03);
tone(end, 38, 3, 0.2, { harmonics: 2, decay: 1.2 });

// A short stereo delay for space, then normalise to -3 dBFS with fades.
const D = Math.floor(BEAT * 0.75 * SR);
for (let i = N - 1; i >= D; i--) {
  L[i] += R[i - D] * 0.18;
  R[i] += L[i - D] * 0.18;
}
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const fade = Math.min(1, t / 0.05) * Math.min(1, (DUR - t) / 1.2);
  L[i] *= fade;
  R[i] *= fade;
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
mkdirSync('public/promo-2026', { recursive: true });
const out = lang ? `public/promo-2026/temp-track-${lang}.wav` : 'public/promo-2026/temp-track.wav';
writeFileSync(out, buf);
console.log(`${out}: ${TOTAL_BEATS} beats at ${BPM} BPM (${DUR.toFixed(1)} s), gain ${gain.toFixed(2)}`);
