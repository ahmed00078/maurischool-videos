// Render the posts to PNG at their exact size (1080 × 1350, stories 1080 × 1920).
//   node social/scripts/render.cjs [outDir] [post:lang …]
// With no post, every post in French and Arabic. Default outDir: social/out.
// Needs Playwright (`npm i --no-save playwright` and `npx playwright install chromium`, or CHROMIUM=<path>),
// and the moments rendered first (`node social/scripts/render-moments.mjs`).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const serve = require('./serve.cjs');
const ALL = require('./posts.cjs');

const args = process.argv.slice(2);
const out = path.resolve(args.find((a) => !a.includes(':')) ?? path.join(__dirname, '..', 'out'));
let jobs = args.filter((a) => a.includes(':'));
if (!jobs.length) jobs = ALL.flatMap((p) => [`${p}:fr`, `${p}:ar`]);

(async () => {
  if (!fs.existsSync(path.join(__dirname, '..', 'img', 'moments'))) {
    console.error('img/moments is missing: run `node social/scripts/render-moments.mjs` first.');
    process.exit(1);
  }
  fs.mkdirSync(out, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', (r) => errors.push(`FAILED ${r.url()}`));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  for (const job of jobs) {
    const [p, l] = job.split(':');
    await page.goto(`${server.url}/posts.html?p=${p}&l=${l}`);
    await page.waitForSelector('body[data-ready="1"]');
    await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })))));
    await (await page.$('#post')).screenshot({ path: path.join(out, `${p}-${l}.png`) });
    process.stdout.write(`${p}-${l} `);
  }
  console.log(`\n${errors.length ? errors.join('\n') : 'no errors'} → ${path.relative(process.cwd(), out) || '.'}`);
  await browser.close();
  server.close();
  process.exit(errors.length ? 1 : 0);
})();
