const { chromium } = require('playwright');
const { execSync } = require('child_process');
const B = 'python3 ' + JSON.stringify(require('path').resolve(__dirname, '../build.py'));
(async () => { const b = await chromium.launch({ executablePath: process.env.SG_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const c = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true });
  await c.addInitScript(require('fs').readFileSync(__dirname + '/seed.js', 'utf8'));
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => /status|controller|state/.test(m.text()) && console.log('console:', m.text())); p.on('framenavigated', f => f === p.mainFrame() && console.log('nav', f.url()));
  try {
    await p.goto('http://localhost:8765/planer/'); await p.evaluate(() => navigator.serviceWorker.ready); await p.waitForTimeout(2500);
    console.log('vorher', await p.evaluate(async () => [SGVersion, await caches.keys()]));
    await p.fill('.sgd [data-nin]', 'Vor dem Update'); await p.press('.sgd [data-nin]', 'Enter');
    execSync('SGV=9.9.8 ' + B);
    await p.click('.sgd [data-sgtab=start]');
    await p.evaluate(() => { navigator.serviceWorker.addEventListener('controllerchange', () => console.log('controllerchange')); navigator.serviceWorker.getRegistration('/planer/').then(r => { console.log('reg ' + !!r + ' waiting ' + !!(r && r.waiting) + ' installing ' + !!(r && r.installing)); r.addEventListener('updatefound', () => { console.log('updatefound'); const w = r.installing; w.addEventListener('statechange', () => console.log('state ' + w.state)); }); }); });
    const nav = p.waitForEvent('load', { timeout: 30000 }).catch(() => 'kein Neuladen');
    await p.click('.sgd-ver button');
    for (let i = 0; i < 6; i++) { await p.waitForTimeout(1000); console.log('snack', await p.evaluate(() => (document.querySelector('.sgd-snack') || {}).textContent).catch(() => 'nav')); }
    console.log('neu geladen:', typeof (await nav) === 'object'); await p.waitForTimeout(2500);
    console.log('nachher', await p.evaluate(async () => [SGVersion, await caches.keys(), navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL]));
    for (const pg of ['training/', 'bibel/', 'training/atmung/']) { await p.goto('http://localhost:8765/planer/' + pg); await p.waitForTimeout(1500); console.log(pg, await p.evaluate(() => SGVersion)); }
    await p.goto('http://localhost:8765/planer/'); await p.waitForTimeout(1500);
    console.log('Notiz erhalten', /Vor dem Update/.test(await p.textContent('.sgd-notes')));
    console.log('Fehler', JSON.stringify(errs));
  } finally { execSync(B); }
  await b.close(); })();
