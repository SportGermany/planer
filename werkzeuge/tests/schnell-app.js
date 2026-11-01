// Schnelltest je App (< 3 Minuten) – bei jeder Änderung statt der großen Suite (werkzeuge/PLAN-APPS.md).
//   node schnell-app.js planer   → Kern der Planer-App (ausgewählte Tests aus suite3.js + APK-Simulation)
//   node schnell-app.js bibel    → baut die App-Dateien wie für die APK (www.js bibel), prüft sie auf Port 8766
// Zusatzprüfungen je App: app-<app>.js (dieselbe Datei wie im Emulator-Test, bekommt hier die Browser-Seite).
const { execSync, spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const KEY = process.argv[2] || 'planer', ROOT = path.resolve(__dirname, '../..');
const run = c => execSync(c, { cwd: __dirname, stdio: 'inherit', env: Object.assign({ NODE_PATH: '/opt/node-tools/node_modules' }, process.env) });
const t0 = Date.now();
if (KEY === 'planer') {
  run('node suite3.js "A Hülle lädt ohne Fehler \\(Handy\\)|A Alte Adressen|S Reiter: jeder Pfad|K Startseite Heute|P5 Mehr \\(4.0\\)|S Plus:"');
  run('node apk.js');
  console.log('Schnelltest planer grün in ' + Math.round((Date.now() - t0) / 1000) + ' s');
  process.exit(0);
}
const { chromium } = require('playwright');
const A = JSON.parse(fs.readFileSync(path.join(ROOT, 'werkzeuge/apps.json'), 'utf8'))[KEY];
if (!A) { console.error('Unbekannte App ' + KEY); process.exit(1); }
execSync('node www.js ' + KEY, { cwd: path.join(ROOT, 'werkzeuge/apk'), stdio: 'inherit' });
// www.js setzt Paketname/Name für den Bau – im Repo bleibt die Planer-Fassung stehen
execSync('git checkout -- werkzeuge/apk/capacitor.config.json werkzeuge/apk/android/app/src/main/res/values/strings.xml werkzeuge/apk/android/app/src/main/res/values/ic_launcher_background.xml werkzeuge/apk/android/app/src/main/res/mipmap-anydpi-v26', { cwd: ROOT });
try { fs.unlinkSync(path.join(ROOT, 'werkzeuge/apk/android/app/src/main/res/drawable/ic_launcher_foreground_app.xml')); } catch (e) {}
const srv = spawn('python3', ['-m', 'http.server', '8766'], { cwd: path.join(ROOT, 'werkzeuge/apk/www'), stdio: 'ignore' });
let bad = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) bad++; };
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await wait(800);
  const b = await chromium.launch({ executablePath: process.env.SG_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const vp of [{ width: 412, height: 915 }, { width: 1280, height: 800 }]) {
    const c = await b.newContext({ viewport: vp, isMobile: vp.width < 600, hasTouch: true }), p = await c.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    p.on('response', r => { if (r.status() >= 400 && r.url().startsWith('http://localhost:8766')) errs.push('fehlt ' + r.status() + ' ' + r.url()); });
    await p.goto('http://localhost:8766/'); await wait(2500);
    const info = await p.evaluate(() => ({ url: location.href, app: window.SGApp, ver: window.SGVersion, txt: document.body.innerText.length, over: document.documentElement.scrollWidth - innerWidth }));
    ok(info.url.indexOf('/planer/' + A.start) >= 0, vp.width + ': Start ' + info.url);
    ok(info.app === KEY && info.ver === A.ver, vp.width + ': Kennung/Version ' + info.app + ' ' + info.ver);
    ok(info.txt > 50 && info.over <= 1, vp.width + ': Inhalt ' + info.txt + ' Zeichen, Überlauf ' + info.over);
    // Selbsttest der App (derselbe wie auf dem Handy, Einstellungen › Selbsttest): kein ✗ erlaubt
    if (vp.width < 600) {
      const st = await p.evaluate(() => new Promise((ok, no) => { const s = document.createElement('script'); s.src = '../sg/selbsttest.js'; s.onload = ok; s.onerror = no; document.head.appendChild(s); }).then(() => window.SGSelbsttest.run()).then(r => ({ n: r.n, bad: r.list.filter(x => x[0] === 'fail').map(x => x[1] + ': ' + x[2]) })));
      ok(!st.n.fail, 'Selbsttest: ' + st.n.fail + ' ✗ · ' + st.n.warn + ' ⚠ · ' + st.n.ok + ' ✓ ' + st.bad.join(' | '));
    }
    const extra = path.join(__dirname, 'app-' + KEY + '.js');
    if (fs.existsSync(extra) && vp.width < 600) await require(extra)(p, ok, wait, null, null);
    // offline: Server weg, Seite neu laden aus dem Speicher ist im Browser nicht möglich – geprüft wird, dass nichts aus dem Netz nachgeladen wird
    // erlaubt: Update-Suche (GitHub) und je App freiwillige Online-Extras (apps.json „net“, z. B. Ferien-Aktualisierung) – ohne Netz läuft alles weiter
    const ext = []; p.on('request', r => { const u = r.url(); if (!/^http:\/\/localhost:8766|^data:|^blob:/.test(u) && !/api\.github\.com/.test(u) && !(A.net || []).some(h => u.indexOf(h) >= 0)) ext.push(u); });
    await p.reload(); await wait(1500);
    ok(!ext.length, vp.width + ': lädt nichts aus dem Internet ' + ext.join(' '));
    ok(!errs.length, vp.width + ': keine Fehler ' + errs.join(' | '));
    await c.close();
  }
  // Übergabe vom Planer (Android nachgestellt): leere App übernimmt die Daten ohne Frage, springt ans Ziel; Abschnitt „App“ mit Version
  if (A.probe) {
    const c = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true }), p = await c.newPage(), errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await c.addInitScript(pr => {
      // wie Android: die Übergabe wird genau einmal abgeholt (auch über ein Neuladen hinweg)
      const sys = { takeHandover: () => { if (sessionStorage.getItem('__ho')) return Promise.resolve({}); sessionStorage.setItem('__ho', 1); return Promise.resolve({ ziel: pr.ziel, daten: JSON.stringify({ von: 'planer', keys: pr.keys, idb: pr.idb || {}, stores: pr.stores || {} }) }); }, colors: () => Promise.resolve({ dynamic: false }), openApp: o => { window.__open = o; return Promise.resolve({ opened: true }); } };
      const plug = name => new Proxy(name === 'PlanerSystem' ? sys : {}, { get: (t, k) => k in t ? t[k] : (k === 'addListener' ? () => Promise.resolve({ remove() {} }) : () => Promise.resolve({})) });
      window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: new Proxy({}, { get: (t, k) => plug(k) }) };
    }, A.probe);
    await p.goto('http://localhost:8766/'); await wait(3500);
    const r = await p.evaluate(([keys, chk]) => ({ keys: Object.keys(keys).every(k => Object.entries(JSON.parse(keys[k])).every(([a, v]) => JSON.stringify(JSON.parse(localStorage.getItem(k) || '{}')[a]) === JSON.stringify(v))), mark: !!localStorage.getItem('sg-uebernommen-v1'), ziel: !!eval(chk) }), [A.probe.keys, A.probe.check]);
    ok(r.keys && r.mark, 'Übergabe: Daten aus dem Planer übernommen');
    if (A.probe.idb) for (const key of Object.keys(A.probe.idb)) {
      const got = await p.evaluate(([key, stores]) => new Promise(res => { const [db, st] = key.split('/'), q = indexedDB.open(db); q.onsuccess = () => { const d = q.result;
        const all = stores.every(n => d.objectStoreNames.contains(n)); if (!d.objectStoreNames.contains(st)) return res('fehlt ' + st);
        const g = d.transaction(st).objectStore(st).getAll(); g.onsuccess = () => res((all ? '' : 'Ablagen unvollständig ') + g.result.map(f => (f && f.name) + ':' + (f && f.size)).join()); }; q.onerror = () => res('Fehler'); }), [key, (A.probe.stores || {})[key.split('/')[0]] || []]);
      ok(/^Arbeitsblatt\.pdf:\d+/.test(got) || /\.\w+:\d+$/.test(got), 'Übergabe: Dateien in ' + key + ' (' + got + ')');
    }
    ok(r.ziel, 'Übergabe: Ziel „' + A.probe.ziel + '“ geöffnet');
    if (A.probe.open) { await p.evaluate(x => eval(x), A.probe.open); await wait(500); }
    const info = await p.evaluate(() => { const el = document.getElementById('sgAppInfo'); return el ? [el.hidden, el.textContent, !!document.getElementById('sgToPlaner')] : null; });
    ok(info && !info[0] && info[1].indexOf('Version ' + A.ver) >= 0 && info[2], 'Abschnitt „App“ mit Version und „Planer öffnen“ ' + JSON.stringify(info));
    ok(!errs.length, 'Übergabe ohne Fehler ' + errs.join(' | '));
    await c.close();
  }
  await b.close(); srv.kill();
  console.log((bad ? bad + ' Fehler' : 'Schnelltest ' + KEY + ' grün') + ' in ' + Math.round((Date.now() - t0) / 1000) + ' s');
  process.exit(bad ? 1 : 0);
})().catch(e => { srv.kill(); console.log('✗ Abbruch ' + e.message); process.exit(1); });
