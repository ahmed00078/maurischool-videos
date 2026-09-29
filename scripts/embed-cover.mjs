// Embeds a cover image in an MP4 as its "attached picture":
//   node scripts/embed-cover.mjs <video.mp4> <cover.jpg> <out.mp4>
//
// Players and file browsers that read MP4 cover art show it as the thumbnail.
// Social apps mostly take the first frame instead, which is why PromoFast also
// puts the same cover on frame 0. Streams are copied, nothing is re-encoded.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const [video, cover, out] = process.argv.slice(2);
if (!video || !cover || !out) {
  console.error('usage: node scripts/embed-cover.mjs <video.mp4> <cover.jpg> <out.mp4>');
  process.exit(1);
}
const require = createRequire(import.meta.url);
const pkg = `@remotion/compositor-${process.platform}-${process.arch}${process.platform === 'win32' ? '-msvc' : ''}`;
const ffmpeg = join(dirname(require.resolve(`${pkg}/package.json`)), process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
execFileSync(
  ffmpeg,
  [
    '-loglevel', 'error', '-y',
    '-i', video, '-i', cover,
    '-map', '0', '-map', '1',
    '-c', 'copy',
    '-disposition:v:1', 'attached_pic',
    '-movflags', '+faststart',
    out,
  ],
  { stdio: 'inherit' },
);
console.log(`${out}: ${video} with ${cover} as cover art`);
