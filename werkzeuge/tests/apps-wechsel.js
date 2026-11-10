// Apps-Wechsel in den Einzel-Apps (Android nachgestellt): Fenster „Apps“ und „Großer Kalender“ öffnen die andere APK,
// statt eine Web-Adresse zu laden, die es in dieser APK nicht gibt („Webseite nicht verfügbar“).
const { execSync, spawn } = require('child_process');
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '../..');
const { chromium } = require('playwright');
const wait = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch(process.env.SG_CHROME ? { executablePath: process.env.SG_CHROME } : {});
  for (const [KEY, want] of [['schule', 'de.sportgermany.training'], ['training', 'de.sportgermany.schule'], ['bibel', 'de.sportgermany.planer']]) {
    execSync('node www.js ' + KEY, { cwd: path.join(ROOT, 'werkzeuge/apk'), stdio: 'ignore' });
    execSync('git checkout -- werkzeuge/apk/capacitor.config.json werkzeuge/apk/android/app/src/main/res', { cwd: ROOT });
    try { fs.unlinkSync(path.join(ROOT, 'werkzeuge/apk/android/app/src/main/res/drawable/ic_launcher_foreground_app.xml')); } catch (e) {}
    const srv = spawn('python3', ['-m', 'http.server', '8768'], { cwd: path.join(ROOT, 'werkzeuge/apk/www'), stdio: 'ignore' }); await wait(700);
    const c = await b.newContext({ viewport: { width: 384, height: 832 }, isMobile: true, hasTouch: true });
    await c.addInitScript(() => {
      window.__opened = [];
      const sys = { openApp: o => { window.__opened.push(o.pkg); return Promise.resolve({ opened: true }); }, takeHandover: () => Promise.resolve({}), installed: o => Promise.resolve({ installed: o.pkgs || [] }) };
      const plug = n => new Proxy(n === 'PlanerSystem' ? sys : {}, { get: (t, k) => k in t ? t[k] : (k === 'addListener' ? () => Promise.resolve({ remove() {} }) : () => Promise.resolve({})) });
      window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: new Proxy({}, { get: (t, k) => plug(k) }) };
      localStorage.setItem('wk_onboarded', '1');
    });
    const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
    await p.goto('http://localhost:8768/'); await wait(3000);
    const home = p.url();
    await p.evaluate(() => SharedCalendar.open(null, 'apps')); await wait(500);
    const r = await p.evaluate(want => { const root = document.getElementById('sg-shared-calendar'), sr = root.shadowRoot || root;
      const a = [...sr.querySelectorAll('.apps .ah')].find(x => x.dataset.app && x.dataset.a === 'openapp' && ('de.sportgermany.' + x.dataset.app) === want);
      const names = [...sr.querySelectorAll('.apps .ah b')].map(x => x.textContent).join(',');
      if (a) a.click(); return names; }, want); await wait(600);
    const op = await p.evaluate(() => window.__opened.slice());
    ok(op.includes(want) && p.url() === home, KEY + ': Apps-Fenster (' + r + ') öffnet ' + want + ' als App, Seite bleibt (' + op.join(',') + ')');
    await p.evaluate(() => SharedCalendar.open(null, 'cal')); await wait(400);
    await p.evaluate(() => { const root = document.getElementById('sg-shared-calendar'), sr = root.shadowRoot || root; const a = sr.querySelector('[data-a=bigcal]'); if (a) a.click(); }); await wait(500);
    const op2 = await p.evaluate(() => window.__opened.slice());
    ok(op2.filter(x => x === 'de.sportgermany.planer').length >= 1 && p.url() === home, KEY + ': „Großer Kalender“ öffnet die Planer-App');
    ok(!errs.length, KEY + ': keine Fehler ' + errs.join(' | '));
    await c.close(); srv.kill();
  }
  await b.close();
  console.log(bad ? bad + ' Fehler' : 'Apps-Wechsel grün'); process.exit(bad ? 1 : 0);
})();
