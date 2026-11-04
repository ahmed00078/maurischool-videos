// Capture the teacher's register with the network cut, at 10:24 (time flowing), FR or AR.
// usage: node capture-register-offline.cjs <user> <password> <fr|ar> <out.png>
const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => {
  const [,, user, pass, lang, out] = process.argv;
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM });
  const ctx = await b.newContext({ viewport: { width: 430, height: 878 }, deviceScaleFactor: 3, locale: lang === 'ar' ? 'ar' : 'fr-FR', timezoneId: 'Africa/Nouakchott' });
  await ctx.clock.install({ time: new Date('2026-11-04T10:24:00Z') }); await ctx.clock.resume();
  await ctx.addInitScript((l) => { localStorage.setItem('@maurischool_onboarding_seen', 'true'); localStorage.setItem('ss_app_language', l); }, lang);
  if (lang === 'ar') await ctx.addInitScript({ content: fs.readFileSync(`${__dirname}/rtl-shim.js`, 'utf8') });
  const page = await ctx.newPage();
  await page.goto(process.env.APP_URL || 'http://localhost:8081', { waitUntil: 'networkidle', timeout: 180000 }); await page.waitForTimeout(1500);
  const inputs = page.locator('input'); await inputs.nth(0).fill(user); await inputs.nth(1).fill(pass); await inputs.nth(1).press('Enter');
  await page.waitForTimeout(6000);
  for (const later of ['Plus tard', 'لاحقًا', 'لاحقاً']) { const bt = page.getByText(later, { exact: true }); if (await bt.count()) { await bt.first().click(); await page.waitForTimeout(800); break; } }
  await page.addStyleTag({ content: '[role=tablist] > div{border-radius:999px !important}' });
  await page.getByText(lang === 'ar' ? 'إجراء النداء' : "Faire l'appel", { exact: true }).first().click();
  await page.waitForTimeout(5000);
  await ctx.setOffline(true); await page.waitForTimeout(4000);
  await page.screenshot({ path: out }); await b.close(); console.log('ok', out);
})();
