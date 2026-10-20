// Tests der Schnelleingabe (werkzeuge/quellen/schnell.js). node werkzeuge/tests/schnell.js
// Bezugszeitpunkt: Dienstag, 20. Oktober 2026, 10:00 Uhr.
const { parseQuick } = require('../quellen/schnell.js');
const NOW = new Date(2026, 9, 20, 10, 0);
const F = [ // [Eingabe, erwartete Felder]
  ['Zahnarzt morgen 15 Uhr', { kind: 'termin', title: 'Zahnarzt', date: '2026-10-21', time: '15:00' }],
  ['Mathe Hausaufgaben bis Freitag', { kind: 'aufgabe', title: 'Mathe Hausaufgaben', date: '2026-10-23', time: null }],
  ['jeden Montag 17:30 Krafttraining', { kind: 'termin', title: 'Krafttraining', time: '17:30', rep: { f: 'w' }, date: '2026-10-26' }],
  ['Notiz: Kurve 9 früher einlenken', { kind: 'notiz', title: 'Kurve 9 früher einlenken', explicit: true }],
  ['Termin Elternabend 24.10. 19 Uhr', { kind: 'termin', title: 'Elternabend', date: '2026-10-24', time: '19:00' }],
  ['Aufgabe Trikot waschen', { kind: 'aufgabe', title: 'Trikot waschen', explicit: true }],
  ['Training heute 18 Uhr', { kind: 'termin', date: '2026-10-20', time: '18:00', title: 'Training' }],
  ['Arzt übermorgen um 9', { date: '2026-10-22', time: '09:00', title: 'Arzt' }],
  ['Physio am Montag 14:15', { date: '2026-10-26', time: '14:15', title: 'Physio' }],
  ['Rodeln nächsten Freitag 8 Uhr', { date: '2026-10-23', time: '08:00', title: 'Rodeln' }],
  ['Lauf in 3 Tagen', { kind: 'aufgabe', date: '2026-10-23', title: 'Lauf' }],
  ['Wettkampf in 2 Wochen', { date: '2026-11-03', title: 'Wettkampf' }],
  ['Bericht abgeben nächste Woche', { date: '2026-10-26', title: 'Bericht abgeben' }],
  ['Geburtstag Oma 24.10.2026', { date: '2026-10-24', title: 'Geburtstag Oma' }],
  ['Weihnachtsfeier 24. Dezember', { date: '2026-12-24', title: 'Weihnachtsfeier' }],
  ['Allerheiligen 1.11.', { date: '2026-11-01', title: 'Allerheiligen' }],
  ['Schulaufgabe Englisch 3. Nov', { date: '2026-11-03', title: 'Schulaufgabe Englisch' }],
  ['Kaffee halb vier', { time: '15:30', title: 'Kaffee', kind: 'termin' }],
  ['Treffen viertel nach drei', { time: '15:15', title: 'Treffen' }],
  ['Bus viertel vor acht', { time: '07:45', title: 'Bus' }],
  ['Nachhilfe dreiviertel fünf', { time: '16:45', title: 'Nachhilfe' }],
  ['Kino von 15 bis 16 Uhr', { time: '15:00', end: '16:00', title: 'Kino' }],
  ['Kraft 17-18:30 Uhr', { time: '17:00', end: '18:30', title: 'Kraft' }],
  ['Schwimmen morgen 16 Uhr für 2 Stunden', { date: '2026-10-21', time: '16:00', end: '18:00', dur: 120, title: 'Schwimmen' }],
  ['Dehnen heute 20 Uhr 30 min', { time: '20:00', end: '20:30', dur: 30, title: 'Dehnen' }],
  ['Meeting 10:00-11:30', { time: '10:00', end: '11:30', title: 'Meeting' }],
  ['Yoga täglich 7 Uhr', { rep: { f: 'd' }, time: '07:00', title: 'Yoga' }],
  ['Teamtreffen wöchentlich Donnerstag 18 Uhr', { rep: { f: 'w' }, date: '2026-10-22', time: '18:00', title: 'Teamtreffen' }],
  ['Fahrradcheck alle 2 Wochen', { rep: { f: '2w' }, title: 'Fahrradcheck' }],
  ['Zimmer aufräumen monatlich', { rep: { f: 'm' }, title: 'Zimmer aufräumen' }],
  ['Versicherung jährlich', { rep: { f: 'y' }, title: 'Versicherung' }],
  ['Zahnarzt morgen 15 Uhr 30 min vorher', { remind: 30, time: '15:00', title: 'Zahnarzt' }],
  ['Prüfung 3.11. 8 Uhr 1 Tag vorher', { remind: 1440, date: '2026-11-03', time: '08:00', title: 'Prüfung' }],
  ['Erinnere mich an Kufen schleifen morgen 18 Uhr', { kind: 'notiz', explicit: true, title: 'Kufen schleifen', date: '2026-10-21', time: '18:00' }],
  ['Erinnere mich daran, Milch zu kaufen', { kind: 'notiz', title: 'Milch zu kaufen' }],
  ['Idee: neues Aufwärmprogramm', { kind: 'notiz', title: 'Neues Aufwärmprogramm' }],
  ['todo Schuhe kaufen', { kind: 'aufgabe', title: 'Schuhe kaufen', explicit: true }],
  ['Arbeit Englisch am Mittwoch', { date: '2026-10-21', title: 'Arbeit Englisch', kind: 'aufgabe' }],
  ['Training Dienstag 17 Uhr', { date: '2026-10-27', time: '17:00', title: 'Training' }],
  ['Training am Di 17 Uhr', { date: '2026-10-27', time: '17:00', title: 'Training' }],
  ['Laufen um 7 morgens', { time: '07:00', title: 'Laufen' }],
  ['Grillen um 7 abends', { time: '19:00', title: 'Grillen' }],
  ['Party 20.30 Uhr Samstag', { time: '20:30', date: '2026-10-24', title: 'Party' }],
  ['Termin', { kind: 'termin', title: '' }],
  ['', { kind: 'aufgabe', title: '' }],
  ['zahnarzt', { kind: 'aufgabe', title: 'Zahnarzt' }],
  ['Physio 26.10.', { date: '2026-10-26', title: 'Physio', kind: 'aufgabe' }],
  ['Silvester 31.12. 20 Uhr', { date: '2026-12-31', time: '20:00', title: 'Silvester' }],
  ['Neujahr 1.1.', { date: '2027-01-01', title: 'Neujahr' }],
  ['Rückblick 15.10.', { date: '2027-10-15', title: 'Rückblick' }],
  ['Lehrgang Oberhof 2.11.26', { date: '2026-11-02', title: 'Lehrgang Oberhof' }],
  ['Elterngespräch in einer Woche', { date: '2026-10-27', title: 'Elterngespräch' }],
  ['Ski in zwei Tagen 9 Uhr', { date: '2026-10-22', time: '09:00', title: 'Ski' }],
  ['Fototermin 5. Oktober 2027', { date: '2027-10-05', title: 'Fototermin' }],
  ['Arzt 12:00', { time: '12:00', kind: 'termin', date: '2026-10-20', title: 'Arzt' }],
  ['Mittagessen um 12', { time: '12:00', title: 'Mittagessen' }],
  ['Video schauen heute abends 20 Uhr', { time: '20:00', title: 'Video schauen' }],
  ['Kraft nachmittags um 4', { time: '16:00', title: 'Kraft' }],
  ['Lesen 1,5 Stunden heute 19 Uhr', { time: '19:00', end: '20:30', dur: 90, title: 'Lesen' }],
  ['Ärztin Müller am Freitag um halb drei', { date: '2026-10-23', time: '14:30', title: 'Ärztin Müller' }],
  ['Joggen mit Lena morgen 7:15', { date: '2026-10-21', time: '07:15', title: 'Joggen Lena' }],
  ['Bahn Königssee 24. Okt. 10 Uhr', { date: '2026-10-24', time: '10:00', title: 'Bahn Königssee' }],
  ['jeden Freitag Bibel lesen', { rep: { f: 'w' }, date: '2026-10-23', title: 'Bibel lesen' }],
  ['Termin: Fahrstunde 23.10. von 14 bis 15:30 Uhr', { kind: 'termin', date: '2026-10-23', time: '14:00', end: '15:30', title: 'Fahrstunde' }],
  ['Aufgabe: Vokabeln lernen bis morgen', { kind: 'aufgabe', date: '2026-10-21', title: 'Vokabeln lernen' }],
  ['Notiz Ideen für Kurve 4 und 5', { kind: 'notiz', title: 'Ideen Kurve 4 und 5' }],
  ['Training 18 Uhr eine Stunde vorher', { time: '18:00', remind: 60, title: 'Training' }],
];
let bad = 0;
for (const [inp, exp] of F) {
  const r = parseQuick(inp, NOW), diff = Object.keys(exp).filter(k => JSON.stringify(r[k]) !== JSON.stringify(exp[k]));
  if (diff.length) { bad++; console.log('✗', JSON.stringify(inp), diff.map(k => k + ': ' + JSON.stringify(r[k]) + ' statt ' + JSON.stringify(exp[k])).join(', ')); }
}
// Vorschau-Teile
const v = parseQuick('Zahnarzt morgen 15 Uhr', NOW);
if (!(v.parts.find(x => x.k === 'date').label === 'Mi 21.10.' && v.parts.find(x => x.k === 'time').label === '15:00')) { bad++; console.log('✗ Vorschau-Teile', JSON.stringify(v.parts)); }
console.log((F.length + 1 - bad) + '/' + (F.length + 1) + ' Schnelleingabe-Tests grün');
process.exit(bad ? 1 : 0);
