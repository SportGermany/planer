// Importierte Kalenderdatei landet auch im Handykalender (Rückmeldung: Königssee-Plan kam nicht im Kalender an).
// Planer (Android-Kalender nachgestellt): Datei übernehmen → Abgleich → alle Termine im Kalender „Planer“; ein Termin, der schon
// in einem anderen Handykalender steht, wird nicht doppelt geschrieben.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const wait = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch(process.env.SG_CHROME ? { executablePath: process.env.SG_CHROME } : {});
  const c = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  await c.addInitScript(() => {
    const cal = window.__cal = {};
    const K = { ensure: () => Promise.resolve({ calendarId: 1 }), request: () => Promise.resolve({ permission: 'granted' }),
      write: o => { const ev = o.events || [], m = cal[o.calendarId] = {}; ev.forEach(e => { m[e.key] = e; }); return Promise.resolve({ added: ev.length, changed: 0, removed: 0 }); },
      // im Google-Kalender steht schon die Bahnbegehung (von Hand eingetragen)
      instances: () => Promise.resolve({ events: [{ eventId: 7, calendarId: 2, calendar: 'Google', title: 'Bahnbegehung · 3. Quali BGL', begin: new Date(2026, 10, 16, 9, 0).getTime(), end: new Date(2026, 10, 16, 10, 0).getTime(), allDay: false }] }),
      calendars: () => Promise.resolve({ calendars: [{ id: 2, name: 'Google', own: false }] }) };
    const plug = n => new Proxy(n === 'PlanerKalender' ? K : {}, { get: (t, k) => k in t ? t[k] : (k === 'addListener' ? () => Promise.resolve({ remove() {} }) : () => Promise.resolve({})) });
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: new Proxy({}, { get: (t, k) => plug(k) }) };
  });
  const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/planer/app/'); await wait(2500);
  const ics = fs.readFileSync(path.join(__dirname, '../../kalender/3-quali-bgl-2026.ics'), 'utf8');
  const r = await p.evaluate(async ics => { const C = SharedCalendar, l = C.phone.parse(ics), a = C.phone.apply(l); await C.handy.enable(); await C.handy.sync(true); await C.handy.sync(true);
    const m = window.__cal[1] || {}, keys = Object.values(m).map(e => e.title); return { n: l.length, a, inCal: keys.filter(t => /Quali BGL|Abfahrt zur Bahn|RL DS|TL Es/.test(t)).length, bahn: keys.filter(t => /^Bahnbegehung/.test(t)).length }; }, ics);
  ok(r.n === 28 && r.a.added === 28, 'Datei übernommen: ' + r.a.added + ' von ' + r.n);
  ok(r.inCal === 27, 'im Handykalender „Planer“: ' + r.inCal + ' Termine aus der Datei (27 = 28 ohne die Bahnbegehung, die schon im Google-Kalender steht)');
  ok(r.bahn === 0, 'kein doppelter Eintrag für einen Termin, der schon im Handy steht');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  await b.close(); console.log(bad ? bad + ' Fehler' : 'Import → Handykalender grün'); process.exit(bad ? 1 : 0);
})();
