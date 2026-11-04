// Synthesizes the tour's music bed: node scripts/tour-2026/make-music.mjs [lang]
//   no lang → public/tour-2026/music.wav, on the base timing
//   fr, ar  → public/tour-2026/music-<lang>.wav, on the timing stretched to that
//             language's voice (voice.<lang>.json, see scripts/fit-voice.mjs)
//
// A calm bed made to sit under a narrator for three minutes, synthesized so
// there is nothing to license. It reads src/videos/tour-2026/timeline.json, so
// its sections follow the edit:
//   intro     a held, open chord and a pulse from the first frame (the film
//             opens on its moment, not on a build-up); a swell and a hit on
//             the title, where the progression starts
//   acts      each act's card lands on a hit, the groove thinned to its
//             sparkle for the length of the card
//   chapters  a light groove (D A Bm G at 120 BPM); every chapter opens on a
//             swell and a chord, and odd chapters drop the kick, so ten chapters
//             do not sound like one loop
//   more      the groove lifted an octave of sparkle
//   close     the groove, then one held D chord under the offer
//
// Mono on purpose: under a voice the width is not heard, and the file is half the size.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const timeline = JSON.parse(readFileSync(new URL('../../src/videos/tour-2026/timeline.json', import.meta.url), 'utf8'));
const lang = process.argv[2];
const voiceUrl = lang ? new URL(`../../src/videos/tour-2026/voice.${lang}.json`, import.meta.url) : null;
const voice = voiceUrl && existsSync(voiceUrl) ? JSON.parse(readFileSync(voiceUrl, 'utf8')) : null;
if (lang && !voice) {
  console.error(`no src/videos/tour-2026/voice.${lang}.json: run scripts/fit-voice.mjs first`);
  process.exit(1);
}
// A voiced scene only ever grows, by whole beats, exactly as src/shared/beat.ts does.
for (const s of timeline.scenes) s.beats = Math.max(s.beats, voice?.scenes[s.id]?.beats ?? 0);
const BEAT = 60 / timeline.bpm;
const starts = {};
let acc = 0;
for (const s of timeline.scenes) {
  starts[s.id] = acc;
  acc += s.beats;
}
const TOTAL_BEATS = acc;
const SR = 44100;
const DUR = TOTAL_BEATS * BEAT + 1;
const N = Math.ceil(SR * DUR);
const out = new Float32Array(N);

const at = (b) => b * BEAT;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const add = (i, v) => {
  if (i >= 0 && i < N) out[i] += v;
};

const kick = (t, gain = 0.5) => {
  const s0 = Math.floor(t * SR);
  let phase = 0;
  for (let i = 0; i < 0.3 * SR; i++) {
    const tt = i / SR;
    phase += (2 * Math.PI * (46 + 80 * Math.exp(-tt / 0.03))) / SR;
    add(s0 + i, Math.sin(phase) * Math.exp(-tt / 0.11) * gain);
  }
};
const hat = (t, gain = 0.04) => {
  const s0 = Math.floor(t * SR);
  let prev = 0;
  for (let i = 0; i < 0.045 * SR; i++) {
    const n = rnd();
    add(s0 + i, (n - prev) * Math.exp(-i / SR / 0.011) * gain);
    prev = n;
  }
};
const rim = (t, gain = 0.1) => {
  const s0 = Math.floor(t * SR);
  for (let i = 0; i < 0.06 * SR; i++) {
    const tt = i / SR;
    add(s0 + i, (Math.sin(2 * Math.PI * 820 * tt) * 0.6 + rnd() * 0.4) * Math.exp(-tt / 0.012) * gain);
  }
};
const tone = (t, midi, dur, gain, { harmonics = 3, decay = 0.4, attack = 0.006 } = {}) => {
  const s0 = Math.floor(t * SR);
  const f = hz(midi);
  const len = Math.floor(dur * SR);
  for (let i = 0; i < len; i++) {
    const tt = i / SR;
    const env = Math.min(1, tt / attack) * Math.exp(-tt / decay) * Math.min(1, (dur - tt) / 0.04);
    let v = 0;
    for (let h = 1; h <= harmonics; h++) v += Math.sin(2 * Math.PI * f * h * tt) / h ** 1.6;
    add(s0 + i, v * env * gain);
  }
};
const pad = (t0, t1, notes, gain = 0.02, { attack = 0.7, release = 0.7 } = {}) => {
  for (const m of notes) {
    for (const cents of [-5, 5]) {
      const f = hz(m) * 2 ** (cents / 1200);
      const s0 = Math.floor(t0 * SR);
      const s1 = Math.floor(t1 * SR);
      for (let i = s0; i < s1 && i < N; i++) {
        const tt = (i - s0) / SR;
        const env = Math.min(1, tt / attack) * Math.min(1, (t1 - i / SR) / release);
        let v = 0;
        for (let h = 1; h <= 4; h++) v += Math.sin(2 * Math.PI * f * h * tt) / h ** 1.8;
        add(i, v * env * gain);
      }
    }
  }
};
/** Filtered noise opening up: the breath before a chapter. */
const swell = (t0, t1, gain = 0.1) => {
  let prev = 0;
  for (let i = Math.floor(t0 * SR); i < t1 * SR && i < N; i++) {
    const p = (i / SR - t0) / (t1 - t0);
    const n = rnd();
    prev += (0.04 + 0.5 * p) * (n - prev);
    add(i, (n - prev) * p * p * gain);
  }
};
const hit = (t, gain = 0.6) => {
  const s0 = Math.floor(t * SR);
  let phase = 0;
  for (let i = 0; i < 1.2 * SR; i++) {
    const tt = i / SR;
    phase += (2 * Math.PI * (34 + 70 * Math.exp(-tt / 0.08))) / SR;
    add(s0 + i, (Math.sin(phase) * Math.exp(-tt / 0.45) + rnd() * Math.exp(-tt / 0.04) * 0.25) * gain);
  }
};

const CHORDS = {
  D: { notes: [62, 66, 69], root: 38 },
  A: { notes: [61, 64, 69], root: 33 },
  Bm: { notes: [62, 66, 71], root: 35 },
  G: { notes: [62, 67, 71], root: 31 },
};
const PROG = ['D', 'A', 'Bm', 'G'];

/** The groove from one beat to another; bars count from `from`. */
const groove = (from, to, { drums = true, sparkle = false } = {}) => {
  for (let b = from; b < to; b++) {
    const t = at(b);
    const inBar = (b - from) % 4;
    const chord = CHORDS[PROG[Math.floor((b - from) / 4) % 4]];
    if (drums) {
      if (inBar === 0 || inBar === 2) kick(t, inBar === 0 ? 0.5 : 0.38);
      if (inBar === 1 || inBar === 3) rim(t, 0.09);
    }
    hat(t + BEAT / 2, 0.035);
    tone(t, chord.root, BEAT * 0.9, drums ? 0.16 : 0.1, { harmonics: 2, decay: 0.3 });
    // A plucked arpeggio on eighths, the chord's own notes going up and back.
    const arp = [chord.notes[0], chord.notes[2], chord.notes[1], chord.notes[2]];
    for (let k = 0; k < 2; k++) tone(t + (k * BEAT) / 2, arp[(inBar * 2 + k) % 4] + (sparkle ? 12 : 0), 0.4, 0.03, { decay: 0.16 });
    if (sparkle) tone(t + BEAT / 4, chord.notes[inBar % 3] + 24, 0.25, 0.012, { decay: 0.1 });
    if (inBar === 0) pad(t, Math.min(at(to), t + 4 * BEAT), chord.notes.map((m) => m - 12), 0.011, { attack: 0.3, release: 0.4 });
  }
};

// Intro: an open chord and a pulse under the moment, then the hit on the title.
const title = starts.intro + (voice?.scenes.intro?.marks?.title ?? 8);
const afterIntro = starts[timeline.scenes[1].id];
pad(0, at(title), [47, 54, 59, 62], 0.022);
for (let b = 0; b < title - 0.5; b++) {
  tone(at(b), 35, 0.4, 0.14, { harmonics: 2, decay: 0.2 });
  hat(at(b + 0.5), 0.02 + (b / title) * 0.03);
}
swell(at(title - 2), at(title), 0.12);
hit(at(title), 0.5);
pad(at(title), at(afterIntro), [50, 57, 62, 66], 0.024);
groove(Math.round(title), afterIntro, { drums: false });

// The acts' cards, and the ten chapters: each chapter opens on a swell and its own first chord.
const isAct = (s) => s.id.startsWith('act');
const chapters = timeline.scenes.filter((s) => !['intro', 'more', 'close'].includes(s.id) && !isAct(s));
for (const s of timeline.scenes.filter(isAct)) {
  const from = starts[s.id];
  swell(at(from - 2), at(from), 0.1);
  hit(at(from), 0.4);
  groove(from, from + s.beats, { drums: false, sparkle: true });
}
chapters.forEach((s, i) => {
  const from = starts[s.id];
  const to = from + s.beats;
  swell(at(from - 1.5), at(from), 0.07);
  for (const m of CHORDS.D.notes) tone(at(from), m + 12, 1.2, 0.03, { decay: 0.5 });
  groove(from, to, { drums: i % 2 === 0 });
});

// « Et aussi… »: the same groove, brighter.
swell(at(starts.more - 2), at(starts.more), 0.1);
groove(starts.more, starts.close, { sparkle: true });

// Closing: the groove, then one held chord under the offer.
const offer = starts.close + (voice?.scenes.close?.marks?.offer ?? 9);
groove(starts.close, Math.round(offer));
swell(at(offer - 2), at(offer), 0.12);
hit(at(offer), 0.45);
pad(at(offer), DUR - 0.2, [50, 57, 62, 66, 69], 0.028, { attack: 0.2, release: 2.5 });
for (let b = Math.round(offer); b < TOTAL_BEATS - 3; b += 2) tone(at(b), [74, 78, 81, 86][((b - Math.round(offer)) / 2) % 4], 1.2, 0.02, { decay: 0.5 });

// Normalize to a quiet peak (it sits under a voice), and write a 16-bit mono WAV.
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[i]));
const k = 0.7 / peak;
const data = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) {
  const fade = Math.min(1, i / (0.02 * SR), (N - i) / (0.8 * SR));
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i] * k * fade)) * 32767), i * 2);
}
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length, 4);
header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(data.length, 40);
const dir = new URL('../../public/tour-2026/', import.meta.url);
mkdirSync(dir, { recursive: true });
const file = new URL(lang ? `music-${lang}.wav` : 'music.wav', dir);
writeFileSync(file, Buffer.concat([header, data]));
console.log(`${file.pathname.split('/').slice(-3).join('/')}: ${DUR.toFixed(1)} s, ${TOTAL_BEATS} beats`);
