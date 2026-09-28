// Extracts chosen frames of a render as small JPEGs, for quick review:
//   node scripts/contact-sheet.mjs <video> <outDir> <frame> [frame...]
// Uses the ffmpeg that ships with Remotion's compositor. That build only has
// the scale and trim filters, so each frame is a seek plus a scale; tile the
// results with any image tool.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const FPS = 30;
const [video, outDir, ...frames] = process.argv.slice(2);
if (!video || !outDir || frames.length === 0) {
  console.error('usage: node scripts/contact-sheet.mjs <video> <outDir> <frame> [frame...]');
  process.exit(1);
}
const require = createRequire(import.meta.url);
const pkg = `@remotion/compositor-${process.platform}-${process.arch}${process.platform === 'win32' ? '-msvc' : ''}`;
const ffmpeg = join(dirname(require.resolve(`${pkg}/package.json`)), process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
mkdirSync(outDir, { recursive: true });
for (const f of frames) {
  const out = join(outDir, `f${String(f).padStart(5, '0')}.jpg`);
  execFileSync(ffmpeg, ['-loglevel', 'error', '-y', '-ss', String(Number(f) / FPS), '-i', video, '-vf', 'scale=360:-2', '-frames:v', '1', '-q:v', '3', out]);
}
console.log(`${frames.length} frames in ${outDir}`);
