// Save each post as static HTML (the resolved markup and the kit's stylesheet), for Impeccable's detector:
//   node social/scripts/snapshot.cjs [outDir]   then   npx impeccable detect <outDir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const serve = require('./serve.cjs');
const ALL = require('./posts.cjs');

const out = path.resolve(process.argv[2] ?? path.join(__dirname, '..', 'out', 'snapshots'));
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const rel = path.relative(out, path.join(__dirname, '..')).split(path.sep).join('/');
  const server = await serve();
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const p of ALL) for (const l of ['fr', 'ar']) {
    await page.goto(`${server.url}/posts.html?p=${p}&l=${l}`);
    await page.waitForSelector('body[data-ready="1"]');
    const html = await page.evaluate(() => { document.querySelectorAll('script').forEach((s) => s.remove()); return `<!doctype html>\n${document.documentElement.outerHTML}`; });
    fs.writeFileSync(path.join(out, `${p}-${l}.html`), html.replace('href="clarte.css"', `href="${rel}/clarte.css"`).replaceAll('src="img/', `src="${rel}/img/`));
  }
  await browser.close();
  server.close();
  console.log(path.relative(process.cwd(), out));
})();
