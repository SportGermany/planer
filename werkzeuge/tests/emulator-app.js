// Emulator-Test einer Einzel-App (werkzeuge/apps.json, Workflow .github/workflows/apps.yml): APP=bibel node emulator-app.js
// Prüft: App startet auf ihrer Startseite, richtige Kennung und Version, Inhalt da, keine Fehler, Neustart behält Daten.
// Zusatzprüfungen je App: werkzeuge/tests/app-<app>.js (module.exports = async (page, ok, wait) => {…}), falls vorhanden.
const { _android: android } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const KEY = process.env.APP, A = JSON.parse(fs.readFileSync(path.join(__dirname, '../apps.json'), 'utf8'))[KEY], PKG = A.id, OUT = process.env.OUT || 'emu-out';
fs.mkdirSync(OUT, { recursive: true });
let bad = 0;
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) bad++; };
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const [dev] = await android.devices();
  ok(!!dev, 'Emulator verbunden');
  // Kaltstart des Emulators: der erste App-Start bleibt manchmal ohne sichtbare WebView (Play-Dienste starten noch) – dann einmal neu starten
  const start = async (again) => {
    await dev.shell('am force-stop ' + PKG); await dev.shell('am start -n ' + PKG + '/de.sportgermany.planer.MainActivity'); await wait(8000);
    try { await dev.webView({ pkg: PKG }, { timeout: 60000 }); } catch (e) { if (!again) { console.log('  (keine WebView – App wird neu gestartet)'); return start(true); } throw e; }
    for (let i = 0; i < 40; i++) {
      for (const w of dev.webViews().filter(w => w.pkg() === PKG)) { const pg = await w.page().catch(() => null); if (pg && await pg.evaluate(() => innerHeight).catch(() => 0) > 100) return pg; }
      await wait(1000);
    }
    if (!again) { console.log('  (keine sichtbare Ansicht – App wird neu gestartet)'); return start(true); }
    throw new Error('Keine sichtbare Ansicht der App');
  };
  let page = await start();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
  page.on('response', r => { if (r.status() >= 400 && !/api\.github\.com/.test(r.url())) errs.push('Datei fehlt (' + r.status() + '): ' + r.url()); });
  await wait(3000);
  const info = await page.evaluate(() => ({ url: location.href, app: window.SGApp, ver: window.SGVersion, native: !!window.SGNative, txt: document.body.innerText.length, over: document.documentElement.scrollWidth - innerWidth }));
  ok(info.url.indexOf('/planer/' + A.start) >= 0, 'Start auf ' + A.start + ': ' + info.url);
  ok(info.app === KEY && info.ver === A.ver, 'Kennung/Version: ' + info.app + ' ' + info.ver);
  ok(info.txt > 50 && info.over <= 1, 'Inhalt sichtbar (' + info.txt + ' Zeichen), kein waagrechtes Scrollen');
  await dev.screenshot({ path: OUT + '/1-start.png' });
  // Daten bleiben nach Neustart
  // WebView schreibt den Speicher verzögert auf die Platte – vor dem harten Beenden kurz warten (wie ein Mensch, der die App wechselt)
  await page.evaluate(() => localStorage.setItem('sg-emu-test', 'da')); await wait(4000);
  await dev.shell('input keyevent KEYCODE_HOME'); await wait(1500);
  page = await start(); await wait(1500);
  ok(await page.evaluate(() => localStorage.getItem('sg-emu-test')) === 'da', 'Daten bleiben nach Neustart');
  const extra = path.join(__dirname, 'app-' + KEY + '.js');
  if (fs.existsSync(extra)) await require(extra)(page, ok, wait, dev, OUT);
  ok(!errs.length, 'Keine Fehler ' + errs.join(' | '));
  console.log(bad ? bad + ' Fehler' : 'Emulator ' + KEY + ' grün');
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('✗ Abbruch: ' + e.message); process.exit(1); });
