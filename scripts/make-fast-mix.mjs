// Builds the sound of a sped-up cut:
//   node scripts/make-fast-mix.mjs <video> <lang> <speed> [--from=<render.mp4> | --composition=<id>]
//
// 1. Takes the normal voiced promo's full mix (voice, ducked music, effects):
//    from an existing voiced render with --from (fast, and exactly what was
//    approved), or by rendering --composition to out/mix/<lang>.wav.
// 2. Time-stretches it with ffmpeg's atempo filter, which changes speed but
//    not pitch, to public/<video>/mix/<lang>-x<speed>.wav.
// The speed must match what the video plays (promo-2026: SPEEDS in PromoFast.tsx).
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const [video, lang, speedArg, fromArg] = process.argv.slice(2);
const speed = Number(speedArg);
const from = fromArg?.startsWith('--from=') ? fromArg.slice('--from='.length) : null;
const composition = fromArg?.startsWith('--composition=') ? fromArg.slice('--composition='.length) : null;
if (!video || !lang || !(speed > 0.5 && speed <= 2)) {
  console.error(
    'usage: node scripts/make-fast-mix.mjs <video> <lang> <speed 0.5–2> [--from=<render.mp4> | --composition=<id>]',
  );
  process.exit(1);
}
if (!from && !composition) {
  console.error('give --from=<a voiced render> or --composition=<the voiced composition id to render>');
  process.exit(1);
}
const require = createRequire(import.meta.url);
const pkg = `@remotion/compositor-${process.platform}-${process.arch}${process.platform === 'win32' ? '-msvc' : ''}`;
const ffmpeg = join(dirname(require.resolve(`${pkg}/package.json`)), process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');

mkdirSync('out/mix', { recursive: true });
mkdirSync(`public/${video}/mix`, { recursive: true });
const normal = `out/mix/${lang}.wav`;
const fast = `public/${video}/mix/${lang}-x${speed}.wav`;

if (from) {
  console.log(`taking the ${lang} mix from ${from}…`);
  execFileSync(ffmpeg, ['-loglevel', 'error', '-y', '-i', from, '-vn', '-c:a', 'pcm_s16le', normal], { stdio: 'inherit' });
} else {
  console.log(`rendering the ${lang} mix…`);
  execFileSync(
    'npx',
    ['remotion', 'render', composition, normal, '--codec=wav', '--timeout=120000', '--log=error'],
    { stdio: 'inherit', shell: process.platform === 'win32' },
  );
}
console.log(`stretching ×${speed} (pitch kept)…`);
execFileSync(ffmpeg, ['-loglevel', 'error', '-y', '-i', normal, '-af', `atempo=${speed}`, '-c:a', 'pcm_s16le', fast], {
  stdio: 'inherit',
});
console.log(`${fast} written`);
