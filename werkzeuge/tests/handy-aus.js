// Handykalender: Ausschalten entfernt Einträge wieder (Rückmeldung: Stundenplan blieb im Handy, obwohl abgeschaltet).
// Schul-App (APK-Fassung, Android-Kalender nachgestellt): Stundenplan an → Stunden im Kalender; Schalter aus → Stunden weg;
// „Abgleich aus“ → alle Einträge der App weg.
const { execSync, spawn } = require('child_process');
const fs = require('fs'), path = require('path'), ROOT = path.resolve(__dirname, '../..');
const { chromium } = require('playwright');
const wait = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) bad++; };
(async () => {
  execSync('node www.js schule', { cwd: path.join(ROOT, 'werkzeuge/apk'), stdio: 'ignore' });
  execSync('git checkout -- werkzeuge/apk/capacitor.config.json werkzeuge/apk/android/app/src/main/res', { cwd: ROOT });
  try { fs.unlinkSync(path.join(ROOT, 'werkzeuge/apk/android/app/src/main/res/drawable/ic_launcher_foreground_app.xml')); } catch (e) {}
  const srv = spawn('python3', ['-m', 'http.server', '8769'], { cwd: path.join(ROOT, 'werkzeuge/apk/www'), stdio: 'ignore' }); await wait(700);
  const b = await chromium.launch(process.env.SG_CHROME ? { executablePath: process.env.SG_CHROME } : {});
  const c = await b.newContext({ viewport: { width: 384, height: 832 }, isMobile: true, hasTouch: true });
  await c.addInitScript(() => {
    // nachgestellter Android-Kalender: eigener Kalender 1, Einträge nach Schlüssel
    const cal = window.__cal = {};
    const K = { ensure: () => Promise.resolve({ calendarId: 1 }), request: () => Promise.resolve({ permission: 'granted' }),
      write: o => { const ev = o.events || [], keys = new Set(ev.map(e => e.key)); let added = 0, removed = 0; const m = cal[o.calendarId] = cal[o.calendarId] || {};
        ev.forEach(e => { if (!m[e.key]) added++; m[e.key] = e; }); if (o.prune !== false) Object.keys(m).forEach(k => { if (!keys.has(k)) { delete m[k]; removed++; } });
        return Promise.resolve({ added, changed: 0, removed, calendarId: o.calendarId }); },
      instances: () => Promise.resolve({ events: [] }), calendars: () => Promise.resolve({ calendars: [] }) };
    const sys = { openApp: () => Promise.resolve({ opened: true }), takeHandover: () => Promise.resolve({}), installed: o => Promise.resolve({ installed: o.pkgs || [] }) };
    const plug = n => new Proxy(n === 'PlanerSystem' ? sys : n === 'PlanerKalender' ? K : {}, { get: (t, k) => k in t ? t[k] : (k === 'addListener' ? () => Promise.resolve({ remove() {} }) : () => Promise.resolve({})) });
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: new Proxy({}, { get: (t, k) => plug(k) }) };
  });
  const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('http://localhost:8769/'); await wait(1500);
  await p.addScriptTag({ path: path.join(__dirname, 'seed.js') }).catch(() => {}); await p.reload(); await wait(2500);
  const count = () => p.evaluate(() => { const m = (window.__cal || {})[1] || {}, k = Object.keys(m); return { all: k.length, st: k.filter(x => x.indexOf('st-') === 0).length }; });
  await p.evaluate(() => SharedCalendar.handy.enable()); await wait(1500);
  const a = await count();
  ok(a.st > 0, 'Stundenplan an: ' + a.st + ' Stunden im Handykalender (' + a.all + ' Einträge)');
  // Schalter in den Einstellungen der Schul-App
  await p.click('#btnSettings'); await wait(600);
  const has = await p.$('#hoStunden'); ok(!!has, 'Einstellungen: Schalter „Stundenplan“ unter „Ins Handy übertragen“');
  if (has) { await p.click('#hoStunden'); await wait(1500); }
  const b2 = await count();
  ok(b2.st === 0 && b2.all > 0, 'Stundenplan aus: Stunden entfernt, Rest bleibt (' + b2.st + ' Stunden, ' + b2.all + ' Einträge)');
  if (has) { await p.click('#hoStunden'); await wait(1500); }
  const c2 = await count(); ok(c2.st === a.st, 'wieder an: Stunden wieder da (' + c2.st + ')');
  const r = await p.evaluate(() => SharedCalendar.handy.disable()); await wait(500);
  const d = await count(); ok(d.all === 0 && !(await p.evaluate(() => SharedCalendar.handy.state().on)), 'Abgleich aus: alle Einträge der App entfernt (' + JSON.stringify(r) + ')');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  await b.close(); srv.kill();
  console.log(bad ? bad + ' Fehler' : 'Handykalender aus/ein grün'); process.exit(bad ? 1 : 0);
})();
