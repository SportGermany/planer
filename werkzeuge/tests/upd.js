// Echter Update-Weg in der Hülle: App läuft mit Version X, Build mit 9.9.8, Mehr › Version › Aktualisieren lädt die neue Fassung.
// Danach wird wieder die normale Version gebaut. node werkzeuge/tests/upd.js
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const B = 'python3 ' + JSON.stringify(require('path').resolve(__dirname, '../build.py'));
const APP = 'http://localhost:8765/planer/app/';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.SG_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const c = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  await c.addInitScript(require('fs').readFileSync(__dirname + '/seed.js', 'utf8'));
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  let ok = true; const check = (cond, m) => { console.log(cond ? '✓' : '✗', m); if (!cond) ok = false; };
  try {
    await p.goto(APP + '#mehr'); await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 20000 }); await p.waitForTimeout(1500);
    const v0 = await p.evaluate(() => SGVersion);
    await p.evaluate(() => SharedCalendar.notes.add({ text: 'Vor dem Update' }));
    execSync('SGV=9.9.8 ' + B);
    // Mehr › Version: findet 9.9.8 und lädt sie gleich (Hinweis „gefunden – wird geladen“)
    const load = p.waitForEvent('load', { timeout: 40000 }).then(() => true).catch(() => false);
    await p.click('#n-mehr [data-m=update]');
    check(await load, 'Neue Version gefunden, App lädt neu');
    await p.waitForTimeout(2500);
    const after = await p.evaluate(async () => [SGVersion, await caches.keys()]);
    check(after[0] === '9.9.8' && after[1].includes('planer-9.9.8') && true, 'Version nach dem Update: ' + JSON.stringify(after));
    const fr = [];
    for (const h of ['training/heute', 'mobility/atmung', 'schule', 'bibel', 'training/wissen']) { await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(1500); fr.push(await p.evaluate(() => document.querySelector('#stage iframe.on').contentWindow.SGVersion)); }
    check(fr.length && fr.every(v => v === '9.9.8'), 'Alle Bereiche auf der neuen Version: ' + fr.join(','));
    check(await p.evaluate(() => SharedCalendar.notes.list().some(n => n.text === 'Vor dem Update')), 'Daten bleiben erhalten');
    check(!errs.length, 'Keine Fehler ' + errs.join('|'));
    console.log('vorher ' + v0);
  } catch (e) { check(false, String(e).slice(0, 200)); }
  finally { execSync(B); }
  await b.close(); console.log(ok ? 'Update-Weg grün' : 'Update-Weg FEHLER'); process.exit(ok ? 0 : 1);
})();
