// Fits a recorded voice-over to the edit:  node scripts/fit-voice.mjs <lang> <sourceDir> [--report]
//
// Expects one file per scene, named 1..11 in timeline order (1.mp3 = hook, ...).
// For each file it decodes the audio with Remotion's bundled ffmpeg, finds
// where speech starts and ends and where the pauses are, then:
//   - copies the files to public/v2/voice/<lang>/<scene>.mp3
//   - writes src/v2/voice.<lang>.json: where each line starts in its scene,
//     how many beats the scene needs so the line fits, and named marks
//     (the hook's question lands on the second sentence).
// The edit then grows a scene only by whole beats, so cuts stay on the music.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';

const [lang, sourceDir, flag] = process.argv.slice(2);
if (!lang || !sourceDir) {
  console.error('usage: node scripts/fit-voice.mjs <lang> <sourceDir> [--report]');
  process.exit(1);
}
const report = flag === '--report';

const timeline = JSON.parse(readFileSync(new URL('../src/v2/timeline.json', import.meta.url), 'utf8'));
const BEAT = 60 / timeline.bpm;
const require = createRequire(import.meta.url);
const pkg = `@remotion/compositor-${process.platform}-${process.arch}${process.platform === 'win32' ? '-msvc' : ''}`;
const ffmpeg = join(dirname(require.resolve(`${pkg}/package.json`)), process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');

const WINDOW = 0.02; // 20 ms
/** Speech is louder than this fraction of the file's loudest window. */
const THRESHOLD = 0.06;
/** A silence at least this long between words is a pause. */
const MIN_PAUSE = Number(process.env.MIN_PAUSE ?? 0.28);

/**
 * Loudness per 20 ms window. Remotion's ffmpeg build has no raw-PCM muxer and
 * no resampling filter, so the file is decoded as-is to a 16-bit WAV and the
 * data chunk is read directly (all channels averaged).
 */
const envelope = (file) => {
  const tmp = join(tmpdir(), `fit-voice-${process.pid}.wav`);
  execFileSync(ffmpeg, ['-loglevel', 'error', '-y', '-i', file, '-c:a', 'pcm_s16le', '-f', 'wav', tmp]);
  const wav = readFileSync(tmp);
  rmSync(tmp);
  const channels = wav.readUInt16LE(22);
  const rate = wav.readUInt32LE(24);
  let offset = 12;
  while (wav.toString('ascii', offset, offset + 4) !== 'data') offset += 8 + wav.readUInt32LE(offset + 4);
  const bytes = wav.readUInt32LE(offset + 4);
  const samples = new Int16Array(wav.buffer, wav.byteOffset + offset + 8, Math.min(bytes, wav.length - offset - 8) / 2);
  const size = Math.round(rate * WINDOW) * channels;
  const env = [];
  for (let i = 0; i + size <= samples.length; i += size) {
    let sum = 0;
    for (let j = i; j < i + size; j++) sum += samples[j] * samples[j];
    env.push(Math.sqrt(sum / size));
  }
  return env;
};

/** Speech start/end and the pauses in between, in seconds. */
const analyse = (file) => {
  const env = envelope(file);
  const peak = Math.max(...env);
  const loud = env.map((v) => v > peak * THRESHOLD);
  const first = loud.indexOf(true);
  const last = loud.lastIndexOf(true);
  const pauses = [];
  let run = 0;
  for (let i = first; i <= last; i++) {
    if (!loud[i]) run++;
    else {
      if (run * WINDOW >= MIN_PAUSE) pauses.push([(i - run) * WINDOW, i * WINDOW]);
      run = 0;
    }
  }
  return { start: first * WINDOW, end: (last + 1) * WINDOW, pauses, duration: env.length * WINDOW };
};

const files = readdirSync(sourceDir)
  .filter((f) => /^\d+\.(mp3|wav|m4a)$/i.test(f))
  .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
if (files.length !== timeline.scenes.length) {
  console.error(`expected ${timeline.scenes.length} files named 1..${timeline.scenes.length}, found ${files.length}`);
  process.exit(1);
}

/** By default a line starts this far into its scene, so the picture leads the voice by a hair. */
const LEAD_IN = 0.2; // seconds
/** Room after the last word before the next cut. */
const TAIL = 0.45; // seconds

/** Hand-read cues for this recording (see scripts/voice-cues.<lang>.json). */
let cues = {};
try {
  cues = JSON.parse(readFileSync(new URL(`./voice-cues.${lang}.json`, import.meta.url), 'utf8'));
} catch {
  console.log(`no scripts/voice-cues.${lang}.json: every line starts ${LEAD_IN} s into its scene`);
}

/** Marks land on the nearest quarter beat. */
const toBeat = (seconds) => Math.round((seconds / BEAT) * 4) / 4;

const outDir = join('public', 'v2', 'voice', lang);
mkdirSync(outDir, { recursive: true });
const scenes = {};
timeline.scenes.forEach((scene, i) => {
  const file = join(sourceDir, files[i]);
  const a = analyse(file);
  const cue = cues[scene.id] ?? {};
  const src = `v2/voice/${lang}/${scene.id}${extname(files[i]).toLowerCase()}`;
  const longestResume = a.pauses.length
    ? a.pauses.reduce((best, p) => (p[1] - p[0] > best[1] - best[0] ? p : best))[1]
    : a.start;
  const at = (v) => (v === 'longestPause' ? longestResume : v);
  // Where the file's time 0 sits in the scene, in seconds.
  const offset = cue.anchor ? cue.anchor.beat * BEAT - at(cue.anchor.at) : (cue.lead ?? LEAD_IN) - a.start;
  const speechEnd = offset + a.end;
  let beats = Math.max(scene.beats, Math.ceil((speechEnd + TAIL) / BEAT));
  const marks = Object.fromEntries(Object.entries(cue.marks ?? {}).map(([k, v]) => [k, toBeat(offset + at(v))]));
  if (scene.id === 'hook') {
    // The question needs time on screen after it is said.
    beats = Math.max(beats, Math.ceil((speechEnd + 1.2) / BEAT));
  }
  scenes[scene.id] = {
    src,
    file: files[i],
    offsetSeconds: Number(offset.toFixed(3)),
    speech: [Number((offset + a.start).toFixed(3)), Number(speechEnd.toFixed(3))],
    pauses: a.pauses.map(([s, e]) => [Number((offset + s).toFixed(3)), Number((offset + e).toFixed(3))]),
    beats,
    marks,
  };
  if (!report) copyFileSync(file, join('public', src));
  const window = scene.beats * BEAT;
  console.log(
    `${String(i + 1).padStart(2)} ${scene.id.padEnd(10)} speech ${a.start.toFixed(2)}–${a.end.toFixed(2)} s` +
      ` | scene ${window.toFixed(1)} s → ${(beats * BEAT).toFixed(1)} s (${scene.beats} → ${beats} beats)` +
      (a.pauses.length ? ` | pauses ${a.pauses.map(([s, e]) => `${s.toFixed(2)}–${e.toFixed(2)}`).join(', ')}` : '') +
      (Object.keys(marks).length ? ` | marks ${JSON.stringify(marks)}` : ''),
  );
});
if (!report) {
  writeFileSync(join('src', 'v2', `voice.${lang}.json`), `${JSON.stringify({ lang, bpm: timeline.bpm, scenes }, null, 2)}\n`);
  console.log(`wrote src/v2/voice.${lang}.json and ${files.length} files in ${outDir}`);
}
