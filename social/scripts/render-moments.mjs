// Render the illustrated moments (src/shared/moments) as PNG stills for the posts, from one bundle:
//   node social/scripts/render-moments.mjs [outDir] [--scale=1] [Composition …]
// With no composition, every `Moments-*` still (not the Reels). Default outDir: social/img/moments.
// A machine whose Chrome Remotion cannot download: REMOTION_BROWSER=/path/to/chrome.
import { bundle } from '@remotion/bundler';
import { getCompositions, renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const outDir = path.resolve(args.find((a) => !a.startsWith('--') && !a.startsWith('Moments-')) ?? 'social/img/moments');
const scale = Number(args.find((a) => a.startsWith('--scale='))?.slice(8) ?? 1);
let ids = args.filter((a) => a.startsWith('Moments-'));
const timeoutInMilliseconds = 120000;
const browserExecutable = process.env.REMOTION_BROWSER || null;
const chromeMode = browserExecutable ? 'chrome-for-testing' : undefined;
const chromiumOptions = { gl: 'angle' };
const common = { timeoutInMilliseconds, chromiumOptions, browserExecutable, chromeMode };

fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
if (!ids.length) {
  const all = await getCompositions(serveUrl, common);
  ids = all.map((c) => c.id).filter((id) => id.startsWith('Moments-') && !id.endsWith('-Reel'));
}
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id, ...common });
  const output = path.join(outDir, `${id.replace(/^Moments-/, '').toLowerCase()}.png`);
  await renderStill({ serveUrl, composition, frame: 0, scale, imageFormat: 'png', output, ...common });
  console.log(path.relative(process.cwd(), output));
}
process.exit(0);
