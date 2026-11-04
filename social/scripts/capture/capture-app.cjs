// Captures one mobile-app screen from the Expo web build (adapted from maurischool-home-website's scripts/screenshots).
// usage: node capture-app.cjs <username> <fr|ar> <out.png> ["Tab label>Other label"]
// Env: APP_URL (default http://localhost:8081), PASSWORD, CHROMIUM (executable path).
const { chromium } = require('playwright-core');
const fs = require('fs');

const APP_URL = process.env.APP_URL || 'http://localhost:8081';

(async () => {
  const [,, user, lang, out, steps = ''] = process.argv;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM });
  // 430x878 + the 54pt status bar added by compose.py = a 430x932 iPhone.
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 878 },
    deviceScaleFactor: 3,
    locale: lang === 'ar' ? 'ar' : 'fr-FR',
    timezoneId: 'Africa/Nouakchott',
  });
  await ctx.addInitScript((lang) => {
    localStorage.setItem('@maurischool_onboarding_seen', 'true');
    localStorage.setItem('ss_app_language', lang);
  }, lang);
  // Without this the Arabic capture is half mirrored: see rtl-shim.js.
  if (lang === 'ar') await ctx.addInitScript({ content: fs.readFileSync(`${__dirname}/rtl-shim.js`, 'utf8') });

  // FIXED_TIME freezes the browser clock to match the API run under libfaketime (10:24 in the posts).
  if (process.env.FIXED_TIME) await ctx.clock.setFixedTime(new Date(process.env.FIXED_TIME));
  const page = await ctx.newPage();
  await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 180000 });
  await page.waitForTimeout(1500);
  const inputs = page.locator('input');
  await inputs.nth(0).fill(user);
  await inputs.nth(1).fill(process.env.PASSWORD);
  await inputs.nth(1).press('Enter');
  await page.waitForTimeout(5000);
  for (const later of ['Plus tard', 'لاحقًا', 'لاحقاً']) {
    const button = page.getByText(later, { exact: true });
    if (await button.count()) { await button.first().click(); break; }
  }
  // Chromium does not clip a backdrop-filter child to its rounded parent; the
  // phone does. Round the tab bar's layers so it does not render square.
  await page.addStyleTag({ content: '[role=tablist] > div{border-radius:999px !important}' });
  // OFFLINE=1 cuts the network after login, as a classroom without signal.
  if (process.env.OFFLINE) { await ctx.setOffline(true); await page.waitForTimeout(3000); }
  for (const step of steps.split('>').filter(Boolean)) {
    // '~text' matches part of a label, '@label' taps by accessibility label.
    if (step.startsWith('@')) { await page.getByLabel(new RegExp(step.slice(1))).first().click(); await page.waitForTimeout(2500); continue; }
    const exact = !step.startsWith('~'); const text = exact ? step : step.slice(1);
    const tab = page.locator('[role=tablist]').getByText(text, { exact });
    await ((await tab.count()) ? tab : page.getByText(text, { exact })).first().click();
    await page.waitForTimeout(2500);
  }
  if (process.env.GOTO) { await page.goto(APP_URL + process.env.GOTO, { waitUntil: 'networkidle', timeout: 180000 }); await page.waitForTimeout(3000); }
  await page.waitForTimeout(Number(process.env.FINAL_WAIT || 6000)); // let toasts fade out (FINAL_WAIT keeps one)
  await page.screenshot({ path: out });
  await browser.close();
})();
