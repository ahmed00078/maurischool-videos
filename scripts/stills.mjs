// Render review stills: node scripts/stills.mjs <Promo|PromoWide> 55 175 270 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const [id, ...rest] = process.argv.slice(2);
const frames = rest.map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id });
for (const frame of frames) {
  await renderStill({
    serveUrl,
    composition,
    frame,
    scale: 0.4,
    imageFormat: 'jpeg',
    output: path.resolve(`out/check/${id}-${String(frame).padStart(3, '0')}.jpg`),
  });
  console.log('frame', frame);
}
