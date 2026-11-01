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
  await wp.click('#n-mehr [data-m="g:safe"]'); await wp.waitForTimeout(350);
  ok(await wp.isVisible('#sheet [data-m=umzug]'), 'Web: Mehr › Sicherung › In die Android-App umziehen');
  await wp.click('#sheet [data-m=umzug]'); await wp.waitForSelector('#sheet [data-s=save]');
  const [dl] = await Promise.all([wp.waitForEvent('download'), wp.click('#sheet [data-s=save]')]);
  const file = require('os').tmpdir() + '/planer-umzug-test.json'; await dl.saveAs(file); const mv = JSON.parse(fs.readFileSync(file, 'utf8'));
  ok(mv.format === 'planer-umzug' && mv.ls['sg-shared-calendar-v1'] && mv.idb['bahnplan/img'] && mv.idb['lernplan-dateien/files'] && !mv.ls['sg-diag-v1'], 'Umzugsdatei mit allen Daten, Bildern und Dateien (' + Object.keys(mv.ls).length + ' Bereiche)');
  await w.close();

  // 2) APK: leerer Speicher, Willkommen, Umzugsdatei einlesen
  const n = await b.newContext(PH); await n.addInitScript(FAKE); const p = await n.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); const dialogs = []; p.on('dialog', d => { dialogs.push(d.message()); d.dismiss().catch(() => {}); });
  const nav = []; await p.route(/^https:\/\/(github\.com|de\.wikipedia\.org)\//, r => { nav.push(r.request().url()); r.fulfill({ status: 204 }); }); // 204 = Seite bleibt (wie in der APK: Android öffnet den Browser)
  // Release-Liste: fremde App-Releases (bibel-v…) und neuere Planer-Releases ohne APK dürfen nicht zählen
  await p.route(/api\.github\.com\/repos\/SportGermany\/planer\/releases/, r => r.fulfill({ contentType: 'application/json', body: JSON.stringify([
    { tag_name: 'bibel-v20.0.0', assets: [{ name: 'bibel-20.0.0.apk', browser_download_url: 'https://x/bibel.apk' }] }, { tag_name: 'v10.0.0', assets: [] },
    { tag_name: 'v9.9.9', assets: [{ name: 'planer-9.9.9.apk', browser_download_url: 'https://github.com/SportGermany/planer/releases/download/v9.9.9/planer-9.9.9.apk' }] }]) }));
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
      img: img instanceof Blob && img.size === 7 && img.type === 'image/png', pdf: pdf instanceof Blob && pdf.name === 'Arbeitsblatt.pdf', inbox, flag: !!localStorage.getItem('sg-umzug-v1'), };
  });
  ok(got.ev && got.note && got.flag, 'Umzug: Termine und Notizen da');
  ok(got.img && got.pdf && got.inbox, 'Umzug: Bahnplan-Bild und Schul-Datei da, Ablage vollständig');
  ok(/Fast fertig/.test(await p.textContent('#sheet')), 'Nach dem Umzug: Handykalender und Erinnerungen anbieten (statt Willkommen)');
  await p.click('#sheet [data-s=later]'); await p.waitForTimeout(300);
  // Seiten laufen mit den übernommenen Daten
  await p.evaluate(() => { location.hash = 'schule'; }); await p.waitForTimeout(2500);
  ok(await p.evaluate(() => /Mathematik|Schulaufgabe|Vokabeln/.test(document.querySelector('#stage iframe.on').contentDocument.body.innerText)), 'Schule zeigt die übernommenen Daten');
  // 3) Speichern/Teilen statt Herunterladen
  await p.evaluate(() => { window.__cap.length = 0; location.hash = 'mehr'; }); await p.waitForTimeout(800);
  await p.click('#n-mehr [data-m="g:conn"]'); await p.waitForTimeout(350); await p.click('#sheet [data-m=handy]'); await p.click('#sheet [data-s=outall]'); await p.waitForTimeout(800);
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
  await p.click('#n-mehr [data-m="g:set"]'); await p.waitForTimeout(350); await p.click('#sheet [data-m=update]'); await p.waitForTimeout(1500);
  const sn = await p.textContent('#snack');
  ok(/9\.9\.9|Download/.test(sn) && nav.some(u => /planer-9\.9\.9\.apk$/.test(u)), 'Update: neue Version auf GitHub gefunden, APK-Download geöffnet (' + sn.slice(0, 60) + ' | ' + nav.join(',') + ')');
  ok(await p.evaluate(() => { const all = document.getElementById('n-mehr').innerHTML + Object.values(SGShell.mehr()).join(''); return all.indexOf('data-m="umzugin"') >= 0 && all.indexOf('data-m="umzug"') < 0; }), 'APK: Mehr › Daten aus Chrome übernehmen');
  ok(!errs.length, 'Keine Fehler ' + errs.join(' | '));

  // 6) Handykalender und Erinnerungen (Android-Schnittstellen nachgestellt): „Neu anfangen“ → „Beides einschalten“
  const FAKE2 = () => {
    const T = window.top; if (T !== window) { window.Capacitor = T.Capacitor; return; }
    const day = n => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(10, 0, 0, 0); return d.getTime(); };
    const st = window.__sim = { cal: [], perm: 'prompt', own: -1, phone: [{ eventId: 501, calendarId: 1, title: 'Arzttermin', begin: day(2), end: day(2) + 3600e3, allDay: false, calendar: 'Mein Kalender', color: '#33AA55', recurring: false }], notes: [], removed: [], updated: [] };
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: {
      Filesystem: { writeFile: o => Promise.resolve({ uri: 'file:///cache/' + o.path }) }, Share: { share: () => Promise.resolve({}) },
      PlanerKalender: {
        request: () => { st.perm = 'granted'; return Promise.resolve({ permission: 'granted', calendarId: st.own }); },
        status: () => Promise.resolve({ permission: st.perm, calendarId: st.own }),
        ensure: () => { if (st.own < 0) st.own = 77; return Promise.resolve({ calendarId: st.own }); },
        calendars: () => Promise.resolve({ calendars: [{ id: 1, name: 'Mein Kalender', account: 'My calendar', color: '#33AA55', visible: true, own: false, sync: true }, { id: 3, name: 'Feiertage per Link', account: 'x@gmail.com', color: '#AA3355', visible: true, own: false, sync: !!st.sync3 }, { id: 5, name: 'Diana', account: 'diana@gmail.com', type: 'com.google', color: '#4285F4', visible: true, own: false, sync: true, writable: true }, { id: 77, name: 'Planer', own: true }] }),
        enableSync: o => { st.sync3 = o.id === 3; st.enabled = (st.enabled || []).concat([o.id]); return Promise.resolve({ updated: 1, syncRequested: true }); },
        instances: () => Promise.resolve({ events: st.phone.slice() }),
        write: o => { const before = st.cal.length; (st.writes = st.writes || []).push({ cal: o.calendarId, n: o.events.length }); if (o.events.length || o.calendarId === (st.target || 77)) st.cal = o.events.slice(); return Promise.resolve({ added: o.events.length, changed: 0, removed: 0, calendarId: o.calendarId }); },
        update: o => { st.updated.push(o); const e = st.phone.find(x => x.eventId === o.eventId); if (e && o.title) e.title = o.title; return Promise.resolve({ updated: 1 }); },
        remove: o => { st.removed.push(o.eventId); st.phone = st.phone.filter(x => x.eventId !== o.eventId); return Promise.resolve({ removed: 1 }); } },
      PlanerSystem: {
        colors: () => Promise.resolve({ dynamic: true, accent1: { 200: '#A8D5A2', 800: '#0B3A12' }, accent2: { 200: '#B9CCB4' }, accent3: { 200: '#A1CFD6' },
          neutral1: { 100: '#E2E3DD', 800: '#2F312D', 900: '#1A1C19' }, neutral2: { 200: '#C3C8BE', 400: '#8D9289', 700: '#424940', 800: '#2C322B' } }),
        bars: o => { st.bars = (st.bars || []).concat([o.bg]); return Promise.resolve(); },
        haptic: o => { st.haptic = (st.haptic || []).concat([o.kind]); return Promise.resolve(); },
        // „Öffnen mit Planer“: Android legt die Datei ab, die App holt sie (Ereignis fileOpened)
        takeFile: () => { const f = st.file || {}; st.file = null; return Promise.resolve(f); },
        // eigene Apps (PLAN-APPS.md): Bibel-App ist installiert, openApp merkt sich den Aufruf
        installed: o => Promise.resolve({ installed: o.pkgs.filter(x => x === 'de.sportgermany.bibel' || (st.schuleApp && x === 'de.sportgermany.schule') || (st.trainingApp && x === 'de.sportgermany.training')) }),
        openApp: o => { (st.opened = st.opened || []).push(o); return Promise.resolve({ opened: true }); },
        takeHandover: () => Promise.resolve({}),
        addListener: (ev, fn) => { (st.ls = st.ls || {})[ev] = fn; return Promise.resolve({ remove() {} }); } },
      CapacitorHttp: { get: o => { st.http = (st.http || []).concat([o.url]); return Promise.resolve({ status: 200, data: 'BEGIN:VCALENDAR\r\nX-WR-CALNAME:Verein\r\nBEGIN:VEVENT\r\nUID:a@b\r\nDTSTART;VALUE=DATE:20991231\r\nSUMMARY:Silvesterlauf\r\nEND:VEVENT\r\nEND:VCALENDAR' }); } },
      LocalNotifications: {
        requestPermissions: () => Promise.resolve({ display: 'granted' }), checkExactNotificationSetting: () => Promise.resolve({ exact_alarm: 'granted' }),
        getPending: () => Promise.resolve({ notifications: st.notes.map(n => ({ id: n.id })) }),
        cancel: o => { const ids = o.notifications.map(n => n.id); st.notes = st.notes.filter(n => !ids.includes(n.id)); return Promise.resolve(); },
        schedule: o => { st.notes = st.notes.concat(o.notifications); return Promise.resolve({ notifications: o.notifications.map(n => ({ id: n.id })) }); },
        addListener: () => ({ remove() {} }) } } };
  };
  const n2 = await b.newContext(Object.assign({ timezoneId: 'Europe/Berlin' }, PH)); await n2.addInitScript(SEED); await n2.addInitScript(FAKE2);
  const q = await n2.newPage(); const e2 = []; q.on('pageerror', e => e2.push(e.message));
  await q.goto(APP); await q.waitForTimeout(2000);
  await q.evaluate(() => { const d = new Date(); d.setDate(d.getDate() + 1); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    SharedCalendar.add({ title: 'Krafttraining', date: k, time: '17:00', end: '18:00', app: 'Training', remind: 15 }); });
  await q.click('#sheet [data-s=fresh]'); await q.waitForTimeout(400);
  ok(/Fast fertig/.test(await q.textContent('#sheet')), 'Nach „Neu anfangen“: Handykalender und Erinnerungen anbieten');
  // Stundenplan vorrechnen lassen (Schule einmal laden)
  await q.click('#sheet [data-s=both]'); await q.waitForTimeout(500);
  await q.evaluate(() => { location.hash = 'schule'; }); await q.waitForTimeout(3500);
  await q.evaluate(() => SharedCalendar.handy.sync(true)); await q.waitForTimeout(300);
  const sim = await q.evaluate(() => window.__sim);
  const titles = sim.cal.map(e => e.title);
  ok(titles.includes('Rodeltraining') && titles.includes('Krafttraining') && titles.some(t => /Schulaufgabe|Mathematik/.test(t)), 'Ins Handy: Termine, Wochenplanung, Schule (' + sim.cal.length + ' Einträge)');
  ok(sim.cal.some(e => /Stundenplan/.test(e.description)), 'Ins Handy: Stundenplan (aus der Schul-Seite, mit Ferien/Feiertagen)');
  ok(sim.cal.some(e => /Langsames Atmen|Morgenmessung/.test(e.title)), 'Ins Handy: Atemübungen');
  ok(sim.cal.every(e => e.key && e.h && e.start < e.end) && new Set(sim.cal.map(e => e.key)).size === sim.cal.length, 'Jeder Eintrag mit eindeutigem Schlüssel und Prüfsumme');
  ok(sim.cal.some(e => e.title === 'Krafttraining' && e.reminder === 15), 'Erinnerung des Termins geht mit ins Handy');
  // Google-Kalender als Ziel (4.1.0): eigene Einträge ziehen um, alter Kalender wird geleert; Aufgaben nur mit Schalter
  ok(!sim.cal.some(e => /^☐/.test(e.title)), 'Aufgaben standardmäßig nicht im Handy/Google');
  const g = await q.evaluate(async () => { window.__sim.writes = []; window.__sim.target = 5; await SharedCalendar.handy.setTarget('5'); return { w: window.__sim.writes, st: SharedCalendar.handy.state().calId }; });
  ok(g.st === 5 && g.w.some(x => x.cal === 77 && x.n === 0) && g.w.some(x => x.cal === 5 && x.n > 0), 'Ziel Google-Kalender: Termine ziehen um, „Planer“ wird geleert ' + JSON.stringify(g));
  await q.evaluate(() => { const d = new Date(); d.setDate(d.getDate() + 1); SharedCalendar.tasks.add({ title: 'Trikot kaufen', due: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') }); });
  await q.evaluate(() => SharedCalendar.handy.setOpt('aufgaben', true));
  ok((await q.evaluate(() => window.__sim.cal)).some(e => e.title === '☐ Trikot kaufen' && e.allDay), 'Aufgaben mit Schalter als ganztägiger Eintrag');
  await q.evaluate(() => SharedCalendar.handy.setOpt('aufgaben', false));
  await q.evaluate(() => { location.hash = 'kalender'; }); await q.waitForTimeout(600);
  const arzt = await q.evaluate(() => SharedCalendar.allItems(new Date().toISOString().slice(0, 10), '2099-01-01').find(e => e.title === 'Arzttermin'));
  ok(arzt && arzt.app === 'Handy' && arzt.phone && arzt.phone.eventId === 501, 'Aus dem Handy: Termin erscheint in der App');
  ok(sim.notes.some(n => /Krafttraining – jetzt starten/.test(n.title) && n.extra.go === 'training/heute') && sim.notes.some(n => n.title === 'Krafttraining' && /In 15 Min/.test(n.body)), 'Erinnerungen geplant: 15 Min. vorher und „jetzt starten“ (' + sim.notes.length + ')');
  // Material You: Farben aus dem Hintergrundbild, Leistenfarbe, Vibration beim Abhaken
  await q.waitForTimeout(800);
  const m3 = await q.evaluate(() => ({ acc: getComputedStyle(document.documentElement).getPropertyValue('--acc').trim(), monet: !!localStorage.getItem('sg-monet-v1'), bars: window.__sim.bars || [] }));
  ok(m3.monet && m3.acc.toLowerCase() === '#a8d5a2' && m3.bars.length > 0, 'Material You: Farben aus dem Hintergrundbild und Leistenfarbe ' + JSON.stringify(m3));
  await q.evaluate(() => { location.hash = 'kalender'; }); await q.waitForTimeout(600);
  const ckb = await q.$('#dayplan [data-ck]'); if (ckb) { await ckb.click(); await q.waitForTimeout(300); }
  ok((await q.evaluate(() => window.__sim.haptic || [])).includes('done'), 'Vibration beim Abhaken');
  // Eigene Bibel-App installiert: Planer öffnet sie; Daten gehen nur beim ersten Mal mit, danach nur das Ziel
  const ex = await q.evaluate(async () => { localStorage.setItem('zweiminutenbibel_v2', '{"streak":3}'); SGShell.go('bibel', 'lesen', null, { push: true }); await new Promise(r => setTimeout(r, 300));
    SGShell.go('bibel', 'bibliothek', null, { push: true }); await new Promise(r => setTimeout(r, 300)); return { o: window.__sim.opened || [], hash: location.hash }; });
  ok(ex.o.length === 2 && ex.o[0].pkg === 'de.sportgermany.bibel' && ex.o[0].ziel === 'lesen' && /zweiminutenbibel_v2/.test(ex.o[0].daten) && !ex.o[1].daten && ex.o[1].ziel === 'bibliothek' && !/bibel/.test(ex.hash),
    'Bibel-App installiert: Planer öffnet sie (Daten einmal, dann nur Ziel) ' + JSON.stringify(ex).slice(0, 200));
  // Schul-App installiert: Planer zeigt/exportiert seine alte Schulkopie nicht mehr (kommt über Google aus der Schul-App), Schule öffnet die App mit Daten
  const sc = await q.evaluate(async () => {
    const k0 = new Date(), k = k0.getFullYear() + '-' + String(k0.getMonth() + 1).padStart(2, '0') + '-' + String(k0.getDate()).padStart(2, '0'), far = '2099-01-01';
    const before = SharedCalendar.allItems(k, far).filter(x => /^lp-/.test(x.id)).length, outB = SharedCalendar.handy.out().filter(e => /Stundenplan|Schule/.test(e.description || '')).length;
    window.__sim.schuleApp = true; document.dispatchEvent(new Event('visibilitychange')); await new Promise(r => setTimeout(r, 300));
    const after = SharedCalendar.allItems(k, far).filter(x => /^lp-/.test(x.id)).length, outA = SharedCalendar.handy.out().filter(e => /Stundenplan|Schule/.test(e.description || '')).length;
    window.__sim.opened = []; SGShell.go('schule', 'plan'); await new Promise(r => setTimeout(r, 600));
    const o = window.__sim.opened[0] || {}; window.__sim.schuleApp = false; document.dispatchEvent(new Event('visibilitychange')); await new Promise(r => setTimeout(r, 300));
    return { before, after, outB, outA, pkg: o.pkg, ziel: o.ziel, keys: o.daten ? Object.keys(JSON.parse(o.daten).keys) : [], back: SharedCalendar.allItems(k, far).filter(x => /^lp-/.test(x.id)).length };
  });
  ok(sc.before > 0 && sc.after === 0 && sc.outB > 0 && sc.outA === 0 && sc.pkg === 'de.sportgermany.schule' && sc.ziel === 'plan' && sc.keys.includes('schulkalender-bayern-v1') && sc.back === sc.before,
    'Schul-App installiert: Planer ohne alte Schulkopie, öffnet die App mit Daten, ohne App wieder wie vorher ' + JSON.stringify(sc).slice(0, 220));
  // Training-App installiert: Tagebuch des Planers zählt nicht mehr; „✓ … erledigt“ aus der Training-App (über Google) hakt das geplante Training ab
  const tr = await q.evaluate(async () => {
    const d = new Date(), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'), b = new Date(d); b.setHours(7, 0, 0, 0);
    const n = SharedCalendar.add({ title: 'Plan-Einheit', date: k, time: '18:00', end: '19:00', app: 'Training' });
    window.__sim.trainingApp = true; document.dispatchEvent(new Event('visibilitychange')); await new Promise(r => setTimeout(r, 300));
    const pre = SharedCalendar.allItems(k, k).filter(x => x.st === 'done' && x.auto && /training/i.test(x.app)).length;
    window.__sim.phone.push({ eventId: 990, calendarId: 5, title: '✓ Training erledigt · 25 Min.', begin: b.getTime(), end: b.getTime() + 36e5, allDay: false, calendar: 'Diana', color: '#4285F4', description: 'Planer · Training erledigt', fromApp: 'training' });
    await SharedCalendar.handy.sync(true); await new Promise(r => setTimeout(r, 1200)); await SharedCalendar.handy.sync(true);
    const items = SharedCalendar.allItems(k, k), plan = items.filter(x => x.title === 'Plan-Einheit');
    const res = { pre, post: plan.map(x => (x.st || '-') + (x.auto ? '*' : '')).join(), autoDone: items.filter(x => x.st === 'done' && x.auto && /training/i.test(x.app)).length, shown: items.filter(x => /^ap-training/.test(x.id)).length, tb: items.filter(x => /^tb-/.test(x.id)).length };
    window.__sim.phone.pop(); window.__sim.trainingApp = false; SharedCalendar.remove(n.id); document.dispatchEvent(new Event('visibilitychange')); await new Promise(r => setTimeout(r, 300)); await SharedCalendar.handy.sync(true);
    return res;
  });
  ok(tr.pre === 0 && tr.autoDone === 1 && tr.tb === 0, 'Training-App installiert: „✓ erledigt“ aus Google hakt das geplante Training ab ' + JSON.stringify(tr));
  // Schlanker Planer (APK ohne Training/Schule/Bibel): installierte App öffnet, fehlende → Hinweis mit Download; Startadresse eines ausgelagerten Bereichs → Kalender
  const sl = await q.evaluate(async () => {
    window.SGOhne = ['training', 'schule', 'bibel', 'wissen']; window.__sim.opened = [];
    SGShell.go('bibel', 'lesen', null, { push: true }); await new Promise(r => setTimeout(r, 400));
    SGShell.go('training', 'wissen', 'karten'); await new Promise(r => setTimeout(r, 400));
    const sheet = document.getElementById('sheet').classList.contains('on') ? document.querySelector('#sheet h3').textContent : '';
    document.querySelector('#sheet [data-s=x]') && document.querySelector('#sheet [data-s=x]').click(); await new Promise(r => setTimeout(r, 400));
    location.hash = 'schule/plan'; await new Promise(r => setTimeout(r, 500));
    const sh2 = document.getElementById('sheet').classList.contains('on') ? document.querySelector('#sheet h3').textContent : '', hash = location.hash;
    document.querySelector('#sheet [data-s=x]') && document.querySelector('#sheet [data-s=x]').click(); await new Promise(r => setTimeout(r, 300));
    const frames = [...document.querySelectorAll('#stage iframe')].map(f => f.dataset.p).filter(p => /^(training|schule|bibel|wissen)\//.test(p)).length;
    window.SGOhne = null;
    return { opened: window.__sim.opened.map(o => o.pkg + ' ' + o.ziel), sheet, sh2, hash, frames };
  });
  ok(sl.opened.join() === 'de.sportgermany.bibel lesen' && /Training ist jetzt eine eigene App/.test(sl.sheet) && /Schule ist jetzt eine eigene App/.test(sl.sh2) && sl.hash === '#kalender',
    'Schlanker Planer: Bibel-App öffnet, fehlende Apps mit Hinweis, Startadresse → Kalender ' + JSON.stringify(sl));
  // Kalenderdatei direkt öffnen („Öffnen mit Planer“)
  await q.evaluate(() => { const s = window.__sim; s.file = { name: 'Quali-Lehrgang.ics', text: 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:q1@x\r\nDTSTART;TZID=Europe/Berlin:20991023T160000\r\nDTEND;TZID=Europe/Berlin:20991023T173000\r\nSUMMARY:Training G1\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:q2@x\r\nDTSTART;VALUE=DATE:20991023\r\nDTEND;VALUE=DATE:20991029\r\nSUMMARY:Quali-Lehrgang\r\nEND:VEVENT\r\nEND:VCALENDAR' }; s.ls.fileOpened(); });
  await q.waitForTimeout(900);
  const imp = await q.textContent('#sheet');
  ok(/2 Termine übernehmen/.test(imp) && /Quali-Lehrgang\.ics/.test(imp), 'Kalenderdatei geöffnet: Import-Blatt erscheint (' + imp.slice(0, 60) + ')');
  await q.click('#sheet [data-s=yes]'); await q.waitForTimeout(400);
  ok(await q.evaluate(() => SharedCalendar.allItems('2099-10-23', '2099-10-28').filter(e => /Quali-Lehrgang|Training G1/.test(e.title)).length >= 7), 'Termine übernommen (mehrtägig über 6 Tage)');
  // Handytermin in der App ändern und löschen
  const ok2 = await q.evaluate(async () => { await SharedCalendar.handy.update(501, { title: 'Arzttermin Dr. Weber' }); const a = SharedCalendar.allItems('2000-01-01', '2099-01-01').some(e => e.title === 'Arzttermin Dr. Weber');
    await SharedCalendar.handy.remove(501); const b = !SharedCalendar.allItems('2000-01-01', '2099-01-01').some(e => /Arzttermin/.test(e.title)); return [a, b, window.__sim.removed]; });
  ok(ok2[0] && ok2[1] && ok2[2].includes(501), 'Handytermin aus der App ändern und löschen');
  // Phase 7: mehrtägige und wiederkehrende Termine kommen richtig ins Handy und zurück
  const p7 = await q.evaluate(async () => {
    const pad = n => String(n).padStart(2, '0'), K = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    SharedCalendar.add({ title: 'Trainingslager Oberhof', date: K(3), endDate: K(6), app: 'Training' });
    SharedCalendar.add({ title: 'Kraft Mo Do', date: K(0), time: '17:00', end: '18:00', app: 'Training', rep: { f: 'w', days: [0, 3] } });
    SharedCalendar.add({ title: 'Wettkampfreise', date: K(8), endDate: K(9), time: '18:00', end: '14:00', app: 'Kalender' });
    // aus dem Handy: ganztägig über drei Tage (Android: UTC-Mitternacht, Ende exklusiv)
    const u = n => { const d = new Date(); d.setDate(d.getDate() + n); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); };
    window.__sim.phone.push({ eventId: 601, calendarId: 1, title: 'Urlaub Garda', begin: u(10), end: u(13), allDay: true, calendar: 'Mein Kalender', color: '#33AA55', recurring: false });
    await SharedCalendar.handy.sync(true);
    const cal = window.__sim.cal, one = cal.filter(e => e.title === 'Trainingslager Oberhof'), kr = cal.filter(e => e.title === 'Kraft Mo Do'), tr = cal.filter(e => e.title === 'Wettkampfreise');
    const wd = ms => (new Date(ms).getDay() + 6) % 7;
    const urlaub = SharedCalendar.allItems(K(9), K(14)).filter(e => e.title === 'Urlaub Garda').map(e => e.date + ':' + e.day + '/' + e.of);
    return { one: one.map(e => [e.allDay, Math.round((e.end - e.start) / 864e5)]), kr: [kr.length, kr.every(e => wd(e.start) === 0 || wd(e.start) === 3)], tr: tr.map(e => [new Date(e.start).getHours(), new Date(e.end).getHours(), Math.round((e.end - e.start) / 3600e3)]), urlaub, K10: K(10) };
  });
  ok(p7.one.length === 1 && p7.one[0][0] && p7.one[0][1] === 4, 'Mehrtägig ins Handy: ein Termin über 4 Tage ' + JSON.stringify(p7.one));
  ok(p7.kr[0] >= 20 && p7.kr[1], 'Serie Mo/Do ins Handy: nur an Mo und Do (' + p7.kr[0] + ')');
  ok(p7.tr.length === 1 && p7.tr[0][0] === 18 && p7.tr[0][1] === 14 && p7.tr[0][2] === 20, 'Mehrtägig mit Uhrzeit: 18 Uhr bis 14 Uhr am Folgetag ' + JSON.stringify(p7.tr));
  ok(p7.urlaub.length === 3 && p7.urlaub[0] === p7.K10 + ':1/3', 'Aus dem Handy: mehrtägiger Termin je Tag 1/3, 2/3, 3/3 ' + p7.urlaub);
  // Mehr: Handykalender-Blatt in der APK
  await q.evaluate(() => { location.hash = 'mehr'; }); await q.waitForTimeout(600);
  await q.click('#n-mehr [data-m="g:conn"]'); await q.waitForTimeout(350); await q.click('#sheet [data-m=handy]'); await q.waitForTimeout(300);
  ok(/Mein Kalender/.test(await q.textContent('#sheet')) && await q.isVisible('#sheet [data-h=stunden]'), 'Mehr › Handykalender: Auswahl und Kalenderliste');
  // per Link eingebundener Google-Kalender, auf dem Handy nicht synchronisiert: Hinweis und Einschalten
  ok(/nicht synchronisiert/.test(await q.textContent('#sheet')), 'Nicht synchronisierter Kalender wird angezeigt');
  await q.click('#sheet [data-s="sy:3"]'); await q.waitForTimeout(600);
  ok((await q.evaluate(() => window.__sim.enabled || [])).includes(3), 'Synchronisieren einschalten ruft das Handy auf');
  // Webkalender über die native HTTP-Schnittstelle (ohne CORS)
  const ab = await q.evaluate(async () => { const r = await SharedCalendar.abo.add('webcal://kalender.example.org/v.ics'); return [r, window.__sim.http, SharedCalendar.allItems('2099-12-31', '2099-12-31').map(x => x.title)]; });
  ok(ab[0].n === 1 && ab[1][0] === 'https://kalender.example.org/v.ics' && ab[2].includes('Silvesterlauf'), 'Webkalender in der APK über CapacitorHttp ' + JSON.stringify(ab));
  await q.click('#sheet [data-s=now]').catch(() => {}); await q.waitForTimeout(300);
  ok(!e2.length, 'Keine Fehler ' + e2.join(' | '));
  await b.close();
  console.log(bad ? bad + ' FEHLER' : 'APK-Modus grün'); process.exit(bad ? 1 : 0);
})();
