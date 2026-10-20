// Daten im Stand 3.5.0 (vor Phase 7): Termine ohne area/endDate/star/status, Serien nur mit f/until, Ausnahmen ex,
// Wochenplanung mit wp, Notizen, Aufgaben. Wird als Init-Skript nach seed.js geladen (ersetzt dessen Kalender).
(function () {
  if (localStorage.getItem('fixture350')) return; localStorage.setItem('fixture350', '1');
  const pad = n => String(n).padStart(2, '0'), d0 = new Date(), iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const add = n => { const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + n); return iso(d); }, td = iso(d0);
  const mon = (() => { const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate()); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return iso(d); })();
  const ev = [
    { id: 'o1', title: 'Rodeltraining', date: td, time: '16:00', end: '17:30', note: '', color: '', app: 'Training', created: 1, changed: 1, remind: null },
    { id: 'o2', title: 'Vereinssitzung', date: add(-21), time: '19:00', end: '20:00', note: '', color: '', app: 'Kalender', created: 1, changed: 2, remind: 30, rep: { f: '2w', until: '' }, ex: [add(-7)] },
    { id: 'o3', title: 'Physio', date: add(-14), time: '08:00', end: '', note: 'Knie', color: '#2f7d57', app: 'Planer', created: 1, changed: 3, remind: null, rep: { f: 'w', until: add(30) } },
    { id: 'o4', title: 'Laufen', date: add(1), time: '07:00', end: '07:40', note: 'Aus der Wochenplanung', color: '', app: 'Training', created: 1, changed: 4, remind: null, wp: mon },
    { id: 'o5', title: 'Mobility-Block', date: add(2), time: '20:00', end: '20:05', note: '', color: '', app: 'Mobility', created: 1, changed: 5, remind: null, wp: mon },
    { id: 'o6', title: 'Lernen & Hausaufgaben', date: add(2), time: '15:00', end: '15:45', note: '', color: '', app: 'Lernplan', created: 1, changed: 6, remind: null, wp: mon },
    { id: 'o7', title: 'Geburtstag Oma', date: add(-300), time: '', end: '', note: '', color: '', app: 'Kalender', created: 1, changed: 7, remind: 1440, rep: { f: 'y', until: '' } },
    { id: 'o8', title: 'Alter gelöschter', date: add(-3), time: '', end: '', app: 'Kalender', created: 1, changed: 8, deleted: true },
    { id: 'o9', title: 'Unbekannte App', date: add(3), time: '', end: '', app: 'Irgendwas', created: 1, changed: 9 }
  ];
  localStorage.setItem('sg-shared-calendar-v1', JSON.stringify({ v: 1, events: ev, updated: 1 }));
  localStorage.setItem('sg-shared-tasks-v1', JSON.stringify({ v: 1, events: [{ id: 'ot1', title: 'Startnummer abholen', due: add(1), done: false, prio: 1, note: '', app: 'Kalender', created: 1, changed: 1 }] }));
  localStorage.setItem('sg-notizen-v1', JSON.stringify({ v: 1, events: [{ id: 'on1', text: 'Kufen schleifen', at: add(2) + 'T18:00', remind: true, done: false, created: 1, changed: 1 }] }));
  localStorage.setItem('sg-wochenplan-v1', JSON.stringify({ on: true, remind: 'so', time: '18:00', topics: { training: true, mobility: true, lernen: true }, planned: { [mon]: 1 }, later: '' }));
})();
