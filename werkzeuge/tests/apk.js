// APK-Modus im Browser nachgestellt: window.Capacitor wird vorgetäuscht (Android-Schnittstellen Filesystem/Share aufgezeichnet).
// Prüft: kein Service Worker, Willkommen/Umzug, Umzug Chrome → APK samt Bildern/Dateien, Speichern/Teilen, Links nach außen,
// Update über GitHub-Releases. node werkzeuge/tests/apk.js   (Server wie bei suite3.js)
const { chromium } = require('playwright');
const fs = require('fs');
const APP = 'http://localhost:8765/planer/app/';
const SEED = fs.readFileSync(__dirname + '/seed.js', 'utf8');
const FAKE = () => {
  const log = (window.top === window ? window : window.top).__cap = (window.top === window ? (window.__cap || []) : window.top.__cap || []);
  window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {
    Filesystem: { writeFile: o => { window.top.__cap.push(['write', o.path, o.data.length, o.directory]); return Promise.resolve({ uri: 'file:///cache/' + o.path }); } },
    Share: { share: o => { window.top.__cap.push(['share', o.files && o.files[0]]); return Promise.resolve({}); } } } };
  if (window.top === window) window.__cap = log;
};
const out = []; let bad = 0;
const ok = (c, m) => { console.log(c ? '✓' : '✗', m); if (!c) bad++; };
const PH = { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, acceptDownloads: true };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.SG_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  // 1) Chrome-App (Web): Daten + Bild im Bahnplan-Speicher + Datei in der Schul-Ablage → Umzugsdatei
  const w = await b.newContext(PH); await w.addInitScript(SEED); const wp = await w.newPage();
  await wp.goto(APP + '#mehr'); await wp.waitForTimeout(2000);
  await wp.evaluate(() => new Promise(res => { const r = indexedDB.open('bahnplan', 1); r.onupgradeneeded = () => r.result.createObjectStore('img');
    r.onsuccess = () => { const t = r.result.transaction('img', 'readwrite'); t.objectStore('img').put(new Blob([new Uint8Array([137, 80, 78, 71, 1, 2, 3])], { type: 'image/png' }), 'map-test'); t.oncomplete = res; }; }));
  await wp.evaluate(() => new Promise(res => { const r = indexedDB.open('lernplan-dateien', 1); r.onupgradeneeded = () => { r.result.createObjectStore('files'); r.result.createObjectStore('inbox'); };
    r.onsuccess = () => { const t = r.result.transaction('files', 'readwrite'); t.objectStore('files').put(new File(['%PDF-1.4 test'], 'Arbeitsblatt.pdf', { type: 'application/pdf' }), 'doc1'); t.oncomplete = res; }; }));
  await wp.evaluate(() => SharedCalendar.notes.add({ text: 'Notiz vor dem Umzug' }));
  ok(await wp.isVisible('#n-mehr [data-m=umzug]'), 'Web: Mehr › In die Android-App umziehen');
  await wp.click('#n-mehr [data-m=umzug]'); await wp.waitForSelector('#sheet [data-s=save]');
  const [dl] = await Promise.all([wp.waitForEvent('download'), wp.click('#sheet [data-s=save]')]);
  const file = require('os').tmpdir() + '/planer-umzug-test.json'; await dl.saveAs(file); const mv = JSON.parse(fs.readFileSync(file, 'utf8'));
  ok(mv.format === 'planer-umzug' && mv.ls['sg-shared-calendar-v1'] && mv.idb['bahnplan/img'] && mv.idb['lernplan-dateien/files'] && !mv.ls['sg-diag-v1'], 'Umzugsdatei mit allen Daten, Bildern und Dateien (' + Object.keys(mv.ls).length + ' Bereiche)');
  await w.close();

  // 2) APK: leerer Speicher, Willkommen, Umzugsdatei einlesen
  const n = await b.newContext(PH); await n.addInitScript(FAKE); const p = await n.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); const dialogs = []; p.on('dialog', d => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
  const nav = []; await p.route(/^https:\/\/(github\.com|de\.wikipedia\.org)\//, r => { nav.push(r.request().url()); r.fulfill({ status: 204 }); }); // 204 = Seite bleibt (wie in der APK: Android öffnet den Browser)
  await p.route('https://api.github.com/repos/SportGermany/planer/releases/latest', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ tag_name: 'v9.9.9', assets: [{ name: 'planer-9.9.9.apk', browser_download_url: 'https://github.com/SportGermany/planer/releases/download/v9.9.9/planer-9.9.9.apk' }] }) }));
  await p.goto(APP); await p.waitForTimeout(2500);
  ok(await p.evaluate(() => !!window.SGNative && document.documentElement.classList.contains('sg-native')), 'APK erkannt (SGNative)');
  ok(await p.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length === 0), 'APK: kein Service Worker');
  ok(/Willkommen in der Android-App/.test(await p.textContent('#sheet')), 'APK: beim ersten Start Willkommen mit Umzug');
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('#sheet [data-s=pick]')]);
  const reload = p.waitForEvent('load', { timeout: 15000 }).catch(() => null);
  await fc.setFiles(file); await reload; await p.waitForTimeout(2500);
  const got = await p.evaluate(async () => {
    const idb = (name, st, key) => new Promise(res => { const r = indexedDB.open(name); r.onsuccess = () => { const d = r.result; if (!d.objectStoreNames.contains(st)) return res(null); const g = d.transaction(st).objectStore(st).get(key); g.onsuccess = () => res(g.result); }; });
    const img = await idb('bahnplan', 'img', 'map-test'), pdf = await idb('lernplan-dateien', 'files', 'doc1');
    const inbox = await new Promise(res => { const r = indexedDB.open('lernplan-dateien'); r.onsuccess = () => res(r.result.objectStoreNames.contains('inbox')); });
    return { ev: SharedCalendar.list().some(e => e.title === 'Rodeltraining'), note: SharedCalendar.notes.list().some(x => x.text === 'Notiz vor dem Umzug'),
      img: img instanceof Blob && img.size === 7 && img.type === 'image/png', pdf: pdf instanceof Blob && pdf.name === 'Arbeitsblatt.pdf', inbox, flag: !!localStorage.getItem('sg-umzug-v1'), sheet: document.getElementById('sheet').classList.contains('on') };
  });
  ok(got.ev && got.note && got.flag, 'Umzug: Termine und Notizen da');
  ok(got.img && got.pdf && got.inbox, 'Umzug: Bahnplan-Bild und Schul-Datei da, Ablage vollständig');
  ok(!got.sheet, 'Nach dem Umzug kein Willkommen mehr');
  // Seiten laufen mit den übernommenen Daten
  await p.evaluate(() => { location.hash = 'schule'; }); await p.waitForTimeout(2500);
  ok(await p.evaluate(() => /Mathematik|Schulaufgabe|Vokabeln/.test(document.querySelector('#stage iframe.on').contentDocument.body.innerText)), 'Schule zeigt die übernommenen Daten');
  // 3) Speichern/Teilen statt Herunterladen
  await p.evaluate(() => { window.__cap.length = 0; location.hash = 'mehr'; }); await p.waitForTimeout(800);
  await p.click('#n-mehr [data-m=handy]'); await p.click('#sheet [data-s=outall]'); await p.waitForTimeout(800);
  const cap = await p.evaluate(() => window.__cap);
  ok(cap.some(x => x[0] === 'write' && /\.ics$/.test(x[1]) && x[3] === 'CACHE') && cap.some(x => x[0] === 'share' && /\.ics$/.test(x[1])), 'Datei aus der Hülle: gespeichert und Android-Teilen geöffnet ' + JSON.stringify(cap));
  await p.evaluate(() => { window.__cap.length = 0; location.hash = 'training/wissen'; }); await p.waitForTimeout(2000);
  await p.evaluate(() => { const d = document.querySelector('#stage iframe.on').contentDocument, a = d.createElement('a'); a.href = d.defaultView.URL.createObjectURL(new d.defaultView.Blob(['x;y'])); a.download = 'test.csv'; a.click(); d.defaultView.URL.revokeObjectURL(a.href); });
  await p.waitForTimeout(800);
  ok((await p.evaluate(() => window.__cap)).some(x => x[0] === 'share' && /test\.csv$/.test(x[1])), 'Datei aus einer eingebetteten Seite (auch wenn sie die Adresse sofort freigibt)');
  // 4) Links nach außen → Browser, Drucken → Hinweis
  await p.evaluate(() => { const d = document.querySelector('#stage iframe.on').contentDocument, a = d.createElement('a'); a.href = 'https://de.wikipedia.org/wiki/Rennrodeln'; a.textContent = 'x'; d.body.appendChild(a); a.click(); });
  await p.waitForTimeout(800);
  ok(nav.some(u => /wikipedia/.test(u)), 'Link nach außen öffnet außerhalb der App');
  await p.evaluate(() => document.querySelector('#stage iframe.on').contentWindow.print()); await p.waitForTimeout(300);
  ok(dialogs.some(d => /Drucken geht in der Android-App nicht/.test(d)), 'Drucken: verständlicher Hinweis');
  // 5) Update: GitHub-Release 9.9.9 → Download der APK
  await p.goto(APP + '#mehr'); await p.waitForTimeout(1500); nav.length = 0;
  await p.click('#n-mehr [data-m=update]'); await p.waitForTimeout(1500);
  const sn = await p.textContent('#snack');
  ok(/9\.9\.9|Download/.test(sn) && nav.some(u => /planer-9\.9\.9\.apk$/.test(u)), 'Update: neue Version auf GitHub gefunden, APK-Download geöffnet (' + sn.slice(0, 60) + ' | ' + nav.join(',') + ')');
  ok(await p.isVisible('#n-mehr [data-m=umzugin]') && !(await p.isVisible('#n-mehr [data-m=umzug]')), 'APK: Mehr › Daten aus Chrome übernehmen');
  ok(!errs.length, 'Keine Fehler ' + errs.join(' | '));
  await b.close();
  console.log(bad ? bad + ' FEHLER' : 'APK-Modus grün'); process.exit(bad ? 1 : 0);
})();
