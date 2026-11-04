// Render stills of several compositions from one bundle:
//   node scripts/shots.mjs <outDir> [--scale=0.5] <Composition:frame[,frame…]> …
// e.g. node scripts/shots.mjs out/tour Tour2026-FR:120,480 Kit-Admin-AR:10
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const [outDir, ...rest] = process.argv.slice(2);
const scale = Number(rest.find((a) => a.startsWith('--scale='))?.slice(8) ?? 0.5);
const shots = rest.filter((a) => !a.startsWith('--'));
// Fonts come from Google Fonts at render time: give a slow first load room.
const timeoutInMilliseconds = 120000;
// The GPU: large blurs take seconds per frame in software GL.
const chromiumOptions = { gl: 'angle' };
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
for (const shot of shots) {
  const [id, list = '0'] = shot.split(':');
  const composition = await selectComposition({ serveUrl, id, timeoutInMilliseconds, chromiumOptions });
  for (const frame of list.split(',').map(Number)) {
    const output = path.resolve(outDir, `${id}-${String(frame).padStart(4, '0')}.jpg`);
    await renderStill({ serveUrl, composition, frame, scale, imageFormat: 'jpeg', jpegQuality: 90, output, timeoutInMilliseconds, chromiumOptions });
    console.log(output);
  }
}
process.exit(0);
