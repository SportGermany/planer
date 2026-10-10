'use strict';
/* ==================================================================
   Lernplan (Realschule Bayern) – Version 4
   Läuft komplett im Browser. Daten: localStorage (+ optional GitHub-Sync).
   ================================================================== */

// ---------- Helfer ----------
const pad = n => String(n).padStart(2, '0');
const ds = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return ds(d); };
const diffDays = (a, b) => Math.round((pd(b) - pd(a)) / 864e5);
const todayStr = () => ds(new Date());
const dow = s => pd(s).getDay();
const mondayOf = s => addDays(s, -((dow(s) + 6) % 7));
const weekStart = s => (db.settings.ws === 0) ? addDays(s, -dow(s)) : mondayOf(s); // Wochenstart laut Einstellung (Mo oder So)
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const $ = (s, r = document) => r.querySelector(s);
const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WDL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const fmtDM = s => { const d = pd(s); return d.getDate() + '.' + (d.getMonth() + 1) + '.'; };
const fmtShort = s => WD[dow(s)] + ' ' + fmtDM(s);
const fmtLong = (s, y) => { const d = pd(s); return WDL[d.getDay()] + ', ' + d.getDate() + '. ' + MON[d.getMonth()] + (y ? ' ' + d.getFullYear() : ''); };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const toMin = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const fmtNum = (n, k = 2) => n.toFixed(k).replace('.', ',');
function rel(n) {
  if (n === 0) return 'heute'; if (n === 1) return 'morgen'; if (n === 2) return 'übermorgen';
  if (n > 2) return 'in ' + n + ' Tagen'; if (n === -1) return 'gestern'; return 'vor ' + (-n) + ' Tagen';
}
function isoWeek(s) {
  const d = pd(s); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - day + 3);
  const fy = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((t - fy) / 864e5 - 3 + ((fy.getUTCDay() + 6) % 7)) / 7);
}
function canon(o) { // stabiler JSON-String (sortierte Schlüssel) für Vergleiche
  if (Array.isArray(o)) return '[' + o.map(canon).join(',') + ']';
  if (o && typeof o === 'object') return '{' + Object.keys(o).sort().filter(k => o[k] !== undefined).map(k => JSON.stringify(k) + ':' + canon(o[k])).join(',') + '}';
  return JSON.stringify(o);
}
function b64enc(str) {
  const bytes = new TextEncoder().encode(str); let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function b64dec(b64) {
  const bin = atob(String(b64).replace(/\s/g, '')); const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
const b64url = s => b64enc(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = s => b64dec(s.replace(/-/g, '+').replace(/_/g, '/'));

// ---------- Amtliche Ferien Bayern (BayMBl. 2022 Nr. 747) ----------
const FERIEN_BUILTIN = [
  ['Sommerferien', '2024-07-29', '2024-09-09'], ['Herbstferien', '2024-10-28', '2024-10-31'], ['Weihnachtsferien', '2024-12-23', '2025-01-03'],
  ['Frühjahrsferien', '2025-03-03', '2025-03-07'], ['Osterferien', '2025-04-14', '2025-04-25'], ['Pfingstferien', '2025-06-10', '2025-06-20'],
  ['Sommerferien', '2025-08-01', '2025-09-15'], ['Herbstferien', '2025-11-03', '2025-11-07'], ['Weihnachtsferien', '2025-12-22', '2026-01-05'],
  ['Frühjahrsferien', '2026-02-16', '2026-02-20'], ['Osterferien', '2026-03-30', '2026-04-10'], ['Pfingstferien', '2026-05-26', '2026-06-05'],
  ['Sommerferien', '2026-08-03', '2026-09-14'], ['Herbstferien', '2026-11-02', '2026-11-06'], ['Weihnachtsferien', '2026-12-24', '2027-01-08'],
  ['Frühjahrsferien', '2027-02-08', '2027-02-12'], ['Osterferien', '2027-03-22', '2027-04-02'], ['Pfingstferien', '2027-05-18', '2027-05-28'],
  ['Sommerferien', '2027-08-02', '2027-09-13'], ['Herbstferien', '2027-11-02', '2027-11-05'], ['Weihnachtsferien', '2027-12-24', '2028-01-07'],
  ['Frühjahrsferien', '2028-02-28', '2028-03-03'], ['Osterferien', '2028-04-10', '2028-04-21'], ['Pfingstferien', '2028-06-06', '2028-06-16'],
  ['Sommerferien', '2028-07-31', '2028-09-11'], ['Herbstferien', '2028-10-30', '2028-11-03'], ['Weihnachtsferien', '2028-12-23', '2029-01-05'],
  ['Frühjahrsferien', '2029-02-12', '2029-02-16'], ['Osterferien', '2029-03-26', '2029-04-06'], ['Pfingstferien', '2029-05-22', '2029-06-01'],
  ['Sommerferien', '2029-07-30', '2029-09-10'], ['Herbstferien', '2029-10-29', '2029-11-02'], ['Weihnachtsferien', '2029-12-24', '2030-01-04'],
  ['Frühjahrsferien', '2030-03-04', '2030-03-08'], ['Osterferien', '2030-04-15', '2030-04-26'], ['Pfingstferien', '2030-06-11', '2030-06-21'],
  ['Sommerferien', '2030-07-29', '2030-09-09'],
].map(([name, start, end]) => ({ name, start, end }));

// ---------- Offizielle Realschul-Termine (werden online aus schuldaten.json aktualisiert) ----------
const SCHULDATEN_BUILTIN = {
  stand: '2026-09-30',
  zeugnisse: [
    { sj: '2026/27', zwischen: '2027-02-19', jahr: '2027-07-30', abschluss: '2027-07-23' },
  ],
  abschlusspruefung: [
    { datum: '2027-06-23', zeit: '08:00', fach: 'Deutsch' },
    { datum: '2027-06-24', zeit: '08:30', fach: 'Französisch' },
    { datum: '2027-06-25', zeit: '08:30', fach: 'Englisch' },
    { datum: '2027-06-28', zeit: '08:30', fach: 'Mathematik' },
    { datum: '2027-06-29', zeit: '08:30', fach: 'Betriebswirtschaftslehre/Rechnungswesen' },
    { datum: '2027-06-30', zeit: '08:30', fach: 'Physik' },
    { datum: '2027-07-01', zeit: '08:30', fach: 'Kunst, Musik, Sport' },
    { datum: '2027-07-02', zeit: '08:30', fach: 'Werken' },
  ],
  hinweise: [
    { sj: '2026/27', text: 'Sprechfertigkeitsprüfungen (Englisch, Französisch u. a.) zwischen März und Juni 2027 – den genauen Termin legt deine Schule fest.' },
  ],
};
const FACH_KEYS = {
  'Deutsch': ['deutsch'], 'Englisch': ['englisch'], 'Mathematik': ['mathe'],
  'Betriebswirtschaftslehre/Rechnungswesen': ['bwr', 'betriebswirt'], 'Französisch': ['franz'], 'Physik': ['physik'],
  'Kunst, Musik, Sport': ['kunst', 'musik', 'sport'], 'Werken': ['werken'],
};
const WPFG_AP = { 'I': ['physik'], 'II': ['bwr', 'betriebswirt'], 'IIIa': ['franz'], 'IIIb': [] };
// Fächer, die es in der jeweiligen Wahlpflichtfächergruppe NICHT gibt (für die Fächerauswahl bei Lehrgangs-Aufgaben)
const WPFG_NOT = { 'I': ['bwr', 'betriebswirt', 'franz', 'werken'], 'II': ['franz', 'werken'], 'IIIa': ['bwr', 'betriebswirt', 'werken'], 'IIIb': ['bwr', 'betriebswirt', 'franz'] };
function wpfgSubjects() {
  const ex = WPFG_NOT[db.settings.wpfg || 'I'] || [];
  return db.subjects.filter(s => !ex.some(k => s.name.toLowerCase().includes(k) || s.short.toLowerCase() === k));
}
const CAMP_KINDS = { lehrgang: 'Lehrgang', training: 'Trainingslager', wettkampf: 'Wettkampf', sonst: 'Sonstiges' };
const CAMP_CHECK = ['Freistellung bei der Schule beantragt', 'Lehrkräfte über die Abwesenheit informiert', 'Aufgaben & Arbeitsblätter abgeholt', 'Bücher und Hefte eingepackt', 'Nach Rückkehr: Mitschriften von Mitschülern geholt', 'Nach Rückkehr: Aufgaben abgegeben'];

// ---------- Terminarten, Fächer ----------
const TYPES = {
  sa: { label: 'Schulaufgabe', short: 'SA', color: '#e5484d', exam: 1 },
  ka: { label: 'Kurzarbeit', short: 'KA', color: '#c99200', exam: 1 },
  ex: { label: 'Ex', short: 'Ex', color: '#f76b15', exam: 1 },
  test: { label: 'Test (angesagt)', short: 'Test', color: '#d6409f', exam: 1 },
  referat: { label: 'Referat', short: 'Ref', color: '#8e4ec6', exam: 1 },
  abgabe: { label: 'Abgabe', short: 'Abg', color: '#0090ff' },
  termin: { label: 'Schultermin', short: 'Termin', color: '#12a594' },
  frei: { label: 'Schulfrei', short: 'frei', color: '#30a46c' },
  sonst: { label: 'Sonstiges', short: '•', color: '#8d8d8d' },
  ap: { label: 'Abschlussprüfung', short: 'AP', color: '#b4231e', exam: 1 },
  camp: { label: 'Lehrgang', short: '🛷', color: '#0891b2' },
  off: { label: 'Offizieller Termin', short: '★', color: '#5b5bd6' },
};
const TYPE_ORDER = { frei: 0, ap: 1, sa: 2, test: 3, ka: 4, ex: 5, referat: 6, abgabe: 7, termin: 8, off: 9, sonst: 10 };
const USER_TYPES = ['sa', 'ka', 'ex', 'test', 'referat', 'abgabe', 'termin', 'frei', 'sonst'];
const isExam = e => !!(TYPES[e.type] && TYPES[e.type].exam);
const DEFAULT_SUBJECTS = [
  ['Deutsch', 'D', '#e5484d'], ['Englisch', 'E', '#8e4ec6'], ['Mathematik', 'M', '#2f6fed'], ['Physik', 'Ph', '#0090ff'],
  ['Chemie', 'C', '#12a594'], ['Biologie', 'B', '#30a46c'], ['Geschichte', 'G', '#b08a3e'], ['Geografie', 'Geo', '#46a758'],
  ['Sozialkunde', 'Sk', '#6e56cf'], ['Wirtschaft & Recht', 'WR', '#3e63dd'], ['BwR', 'BwR', '#d6409f'], ['Französisch', 'F', '#e93d82'],
  ['IT', 'IT', '#0d74ce'], ['Religion / Ethik', 'Rel', '#978365'], ['Kunst', 'Ku', '#f76b15'], ['Musik', 'Mu', '#c2298a'],
  ['Sport', 'Sp', '#29a383'], ['Werken', 'We', '#a18072'],
];
const DEFAULT_PERIODS = [
  ['08:00', '08:45'], ['08:45', '09:30'], ['09:45', '10:30'], ['10:30', '11:15'], ['11:30', '12:15'],
  ['12:15', '13:00'], ['13:45', '14:30'], ['14:30', '15:15'], ['15:15', '16:00'],
].map(([s, e]) => ({ s, e }));
const COLLS = ['subjects', 'events', 'homework', 'timetable', 'absences', 'study', 'camps', 'docs'];
const HW_KINDS = { ha: 'Hausaufgabe', lernen: 'Lernen', mit: 'Mitbringen', abgabe: 'Abgabe', sonst: 'Sonstiges' };
const ABS_REASONS = { krank: 'Krank', arzt: 'Arzttermin', beurlaubt: 'Beurlaubt', lehrgang: 'Lehrgang / Wettkampf', sonst: 'Sonstiges' };

// ---------- Speicher ----------
const KEY = 'schulkalender-bayern-v1';   // synchronisierte Daten (gleicher Schlüssel wie Version 1 → Daten bleiben erhalten)
const LKEY = 'schulplaner-lokal-v1'; // interner Speicherschlüssel – bleibt, damit keine Daten verloren gehen     // nur dieses Gerät (Design, Sync-Zugang, Timer …)
function loadLocal() { try { return JSON.parse(localStorage.getItem(LKEY)) || {}; } catch (e) { return {}; } }
let local = loadLocal();
local.theme = local.theme || 'auto';
const START_VIEWS = [['heute', 'Heute'], ['kalender', 'Kalender'], ['plan', 'Stundenplan'], ['aufgaben', 'Aufgaben'], ['lehrgang', 'Lehrgang']];
function saveLocal() { try { localStorage.setItem(LKEY, JSON.stringify(local)); } catch (e) { /* voll */ } }

function defaults() {
  return {
    v: 2,
    settings: {
      u: 0, kw: true, mariae: true, agendaDays: 14, prepDays: 5, showOfficial: true,
      klassen: {}, wpfg: '', ab: { on: false, ref: mondayOf(todayStr()) }, periods: DEFAULT_PERIODS, days: 5, ws: 1, ttTimes: true, hint: true, setupDone: false,
    },
    subjects: DEFAULT_SUBJECTS.map(([name, short, color], i) => ({ id: 'r' + i, name, short, color, teacher: '', room: '', u: 0 })),
    events: [], homework: [], timetable: [], absences: [], study: [], camps: [], docs: [],
    deleted: {},
  };
}
function migrate(d) {
  const def = defaults();
  if (!d) return def;
  if (!d.v || d.v < 2) { // Version 1 → 2
    const now = Date.now(), out = def, s1 = d.settings || {};
    Object.assign(out.settings, { kw: s1.kw ?? true, mariae: s1.mariae ?? true, agendaDays: s1.agendaDays || 14, prepDays: s1.prepDays ?? 5 });
    if (s1.theme && local.theme === 'auto') { local.theme = s1.theme; saveLocal(); }
    const usesSubj = (d.events || []).some(e => e.subject);
    if (usesSubj && Array.isArray(d.subjects)) out.subjects = d.subjects.map(s => ({ teacher: '', room: '', ...s, u: now }));
    (d.events || []).forEach(e => {
      const { grade, person, ...r } = e; // alte Noten-Einträge werden verworfen
      if (r.type === 'test') r.type = 'ka';
      if (!TYPES[r.type]) r.type = 'sonst';
      out.events.push({ ...r, u: now });
    });
    return out;
  }
  const out = { ...def, ...d, settings: { ...def.settings, ...(d.settings || {}) } };
  COLLS.forEach(c => { if (!Array.isArray(out[c])) out[c] = def[c]; });
  if (!out.deleted) out.deleted = {};
  // Altlasten aus früheren Versionen (Notensystem) still verwerfen
  delete out.grades; delete out.gradeTypes; delete out.ap;
  return out;
}
function loadDb() { try { const raw = localStorage.getItem(KEY); return migrate(raw ? JSON.parse(raw) : null); } catch (e) { return defaults(); } }
let db = loadDb();
let EVI = null;
function persist() {
  EVI = null;
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast('Speichern nicht möglich – Browser-Speicher blockiert?'); }
}
function save() { persist(); local.dirty = true; saveLocal(); Sync.schedule(); scheduleReminders(); }
function upsert(coll, item) {
  item.u = Date.now(); delete db.deleted[item.id];
  const a = db[coll], i = a.findIndex(x => x.id === item.id);
  if (i >= 0) a[i] = item; else a.push(item);
  return item;
}
function removeItem(coll, id) {
  const i = db[coll].findIndex(x => x.id === id); if (i < 0) return null;
  const [x] = db[coll].splice(i, 1); db.deleted[id] = Date.now(); return x;
}
function setSetting(k, v) { db.settings[k] = v; db.settings.u = Date.now(); }

// ---------- Ferien & Feiertage ----------
let FERIEN = [], ferienMap = new Map();
function buildFerien() {
  const list = FERIEN_BUILTIN.map(f => ({ ...f }));
  const lastEnd = list[list.length - 1].end;
  ((local.ferienOnline && local.ferienOnline.list) || []).forEach(f => {
    if (f.start > lastEnd && !list.some(x => x.start === f.start)) list.push({ ...f, online: true });
  });
  list.sort((a, b) => a.start < b.start ? -1 : 1);
  FERIEN = list; ferienMap = new Map();
  FERIEN.forEach(f => { for (let d = f.start; d <= f.end; d = addDays(d, 1)) ferienMap.set(d, f); });
}
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
    l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
  return ds(new Date(y, mo - 1, da));
}
let HOL = {};
function holidaysOf(y) {
  if (HOL[y]) return HOL[y];
  const e = easter(y), m = {};
  const add = (d, name, o = {}) => { m[d] = { name, ...o }; };
  add(y + '-01-01', 'Neujahr'); add(y + '-01-06', 'Heilige Drei Könige');
  add(addDays(e, -2), 'Karfreitag'); add(e, 'Ostersonntag', { minor: true }); add(addDays(e, 1), 'Ostermontag');
  add(y + '-05-01', 'Tag der Arbeit'); add(addDays(e, 39), 'Christi Himmelfahrt');
  add(addDays(e, 49), 'Pfingstsonntag', { minor: true }); add(addDays(e, 50), 'Pfingstmontag'); add(addDays(e, 60), 'Fronleichnam');
  if (db.settings.mariae) add(y + '-08-15', 'Mariä Himmelfahrt');
  add(y + '-10-03', 'Tag der Deutschen Einheit'); add(y + '-11-01', 'Allerheiligen');
  const n22 = new Date(y, 10, 22);
  add(ds(new Date(y, 10, 22 - ((n22.getDay() - 3 + 7) % 7))), 'Buß- und Bettag', { schoolOnly: true });
  add(y + '-12-25', '1. Weihnachtstag'); add(y + '-12-26', '2. Weihnachtstag');
  return (HOL[y] = m);
}
const holiday = d => holidaysOf(+d.slice(0, 4))[d] || null;

// ---------- Schuljahr, Klasse, A/B-Woche ----------
const syOf = d => { const y = +d.slice(0, 4), m = +d.slice(5, 7), s = m >= 8 ? y : y - 1; return s + '/' + String(s + 1).slice(2); };
const syRange = sy => [(+sy.slice(0, 4)) + '-08-01', (+sy.slice(0, 4) + 1) + '-07-31'];
const curSy = () => syOf(todayStr());
const klasse = (sy = curSy()) => (db.settings.klassen || {})[sy] || null;
const schuldaten = () => (local.schuldaten && local.schuldaten.stand >= SCHULDATEN_BUILTIN.stand) ? local.schuldaten : SCHULDATEN_BUILTIN;
function weekType(d) {
  const ab = db.settings.ab; if (!ab || !ab.on) return null;
  const diff = Math.round(diffDays(mondayOf(ab.ref), mondayOf(d)) / 7);
  return ((diff % 2) + 2) % 2 === 0 ? 'A' : 'B';
}

// ---------- Datenzugriff ----------
const subj = id => db.subjects.find(s => s.id === id) || { id: '', name: '', short: '', color: '#9a9a9a' };
const autoTitle = e => [TYPES[e.type]?.label, subj(e.subject).name].filter(Boolean).join(' ');
const evTitle = e => (e.title && e.title.trim()) || autoTitle(e);
function sortEv(a, b) {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  const ta = a.time || '', tb = b.time || '';
  if (!ta && tb) return -1; if (ta && !tb) return 1; if (ta !== tb) return ta < tb ? -1 : 1;
  return (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99);
}
function subjectsMatching(keys) { return db.subjects.filter(s => keys.some(k => s.name.toLowerCase().includes(k) || s.short.toLowerCase() === k)); }
function officialEvents() {
  if (!db.settings.showOfficial) return [];
  const sd = schuldaten(), out = [];
  const off = (id, date, title, notes) => ({ id: 'off-' + id, official: true, type: 'off', subject: '', date, end: '', time: '', title, notes: notes || '', prep: 0, done: false });
  (sd.zeugnisse || []).forEach(z => {
    if (z.zwischen) out.push(off('zz-' + z.sj, z.zwischen, 'Zwischenzeugnis'));
    if (z.jahr && klasse(z.sj) !== 10) out.push(off('jz-' + z.sj, z.jahr, 'Jahreszeugnis'));
    if (z.abschluss && klasse(z.sj) === 10) out.push(off('az-' + z.sj, z.abschluss, 'Abschlusszeugnis'));
  });
  const inGroup = wpfgSubjects();
  (sd.abschlusspruefung || []).forEach(p => {
    if (klasse(syOf(p.datum)) !== 10) return;
    const keys = FACH_KEYS[p.fach] || [p.fach.toLowerCase()];
    if (!inGroup.some(s => keys.some(k => s.name.toLowerCase().includes(k) || s.short.toLowerCase() === k))) return;
    out.push({ id: 'off-ap-' + p.datum + '-' + p.fach, official: true, type: 'ap', subject: '', date: p.datum, end: '', time: p.zeit || '', title: 'Abschlussprüfung ' + p.fach, notes: 'Schriftliche Abschlussprüfung (amtlicher Termin)', prep: 0, done: false });
  });
  return out;
}
function campEvents() {
  return db.camps.map(c => ({ id: 'camp-' + c.id, camp: c.id, official: true, type: 'camp', subject: '', date: c.start, end: c.end && c.end > c.start ? c.end : '', time: '', title: c.title || CAMP_KINDS[c.kind] || 'Lehrgang', notes: c.place || '', prep: 0, done: false }));
}
function allEvents() { return db.events.concat(officialEvents(), campEvents()); }
const campOn = d => db.camps.filter(c => c.start <= d && (c.end || c.start) >= d);
function campMissed(c) { // verpasste Schultage und Stunden je Fach laut Stundenplan
  const per = {}; let days = 0, lessons = 0;
  for (let d = c.start; d <= (c.end || c.start); d = addDays(d, 1)) {
    const i = dayInfo(d); if (!i.school) continue; days++;
    lessonsOn(d).forEach(l => { per[l.subject] = (per[l.subject] || 0) + 1; lessons++; });
  }
  const exams = db.events.concat(officialEvents()).filter(e => isExam(e) && e.date >= c.start && e.date <= (c.end || c.start));
  return { days, lessons, per, exams };
}
function index() {
  if (EVI) return EVI;
  EVI = new Map();
  for (const e of allEvents()) {
    const end = e.end && e.end > e.date ? e.end : e.date;
    let d = e.date, guard = 0;
    while (d <= end && guard++ < 400) { if (!EVI.has(d)) EVI.set(d, []); EVI.get(d).push(e); d = addDays(d, 1); }
  }
  for (const arr of EVI.values()) arr.sort((a, b) => sortEv({ ...a, date: '' }, { ...b, date: '' }));
  return EVI;
}
const eventsOn = d => index().get(d) || [];
function dayInfo(d) {
  const h = holiday(d), f = ferienMap.get(d) || null, w = dow(d), weekend = w === 0 || w === 6;
  const freeEv = eventsOn(d).find(e => e.type === 'frei') || null;
  return { h, f, weekend, freeEv, school: !weekend && !f && !h && !freeEv };
}
const isSchoolDay = d => dayInfo(d).school;
function countSchoolDays(from, to) { let n = 0; for (let d = from; d <= to; d = addDays(d, 1)) if (isSchoolDay(d)) n++; return n; }
const nextFerien = d => FERIEN.find(f => f.start > d);
function prevFerien(d) { for (let i = FERIEN.length - 1; i >= 0; i--) if (FERIEN[i].end < d) return FERIEN[i]; return null; }
function freeRange(f) {
  let s = f.start, e = f.end, g = 0;
  while (g++ < 10) { const p = addDays(s, -1), w = dow(p); if (w === 0 || w === 6 || holiday(p)) s = p; else break; }
  g = 0;
  while (g++ < 10) { const n = addDays(e, 1), w = dow(n); if (w === 0 || w === 6 || holiday(n)) e = n; else break; }
  return { start: s, end: e, days: diffDays(s, e) + 1 };
}
function nextSchoolDay(d) { let x = addDays(d, 1), g = 0; while (!isSchoolDay(x) && g++ < 60) x = addDays(x, 1); return x; }

// ---------- Stundenplan ----------
function lessonsOn(d) {
  const wd = dow(d); if (wd === 0 || wd === 6) return [];
  const wt = weekType(d);
  return db.timetable.filter(l => l.day === wd && (l.week === 'all' || !l.week || !wt || l.week === wt)).sort((a, b) => a.period - b.period);
}
function nextLessonDate(subjectId, after) {
  let d = after || todayStr();
  for (let i = 0; i < 60; i++) { d = addDays(d, 1); if (isSchoolDay(d) && lessonsOn(d).some(l => l.subject === subjectId)) return d; }
  return null;
}
const period = n => db.settings.periods[n - 1] || null;

// ---------- Icons ----------
const sv = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICON = {
  home: sv('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>'),
  month: sv('<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M7.5 13.5h.01M12 13.5h.01M16.5 13.5h.01M7.5 17h.01M12 17h.01M16.5 17h.01"/>'),
  plan: sv('<rect x="3" y="3.5" width="18" height="17" rx="2.5"/><path d="M3 9h18M3 14.5h18M9 3.5v17M15 3.5v17"/>'),
  tasks: sv('<path d="M9 6h12M9 12h12M9 18h12"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>'),
  sliders: sv('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),
  cloud: sv('<path d="M17.5 19H7a5 5 0 1 1 1.1-9.9A6 6 0 0 1 19.6 11 4 4 0 0 1 17.5 19z"/>'),
  plus: sv('<path d="M12 5v14M5 12h14"/>'),
  left: sv('<path d="m15 18-6-6 6-6"/>'),
  right: sv('<path d="m9 18 6-6-6-6"/>'),
  trash: sv('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
  check: sv('<path d="M20 6 9 17l-5-5"/>'),
  sled: sv('<path d="M3 17h14a4 4 0 0 0 4-4"/><path d="M6 17l2-6h7l2 6"/><circle cx="13" cy="6" r="2"/><path d="M3 20h16"/>'),
};

// ---------- Ablage: Dateien lokal (IndexedDB) ----------
const FileDB = {
  _db: null,
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('lernplan-dateien', 1);
      r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('files')) d.createObjectStore('files'); if (!d.objectStoreNames.contains('inbox')) d.createObjectStore('inbox'); };
      r.onsuccess = () => { this._db = r.result; res(this._db); };
      r.onerror = () => rej(r.error);
    });
  },
  async tx(store, mode, fn) {
    const d = await this.open();
    return new Promise((res, rej) => { const t = d.transaction(store, mode); const st = t.objectStore(store); const out = fn(st); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); });
  },
  put(id, blob) { return this.tx('files', 'readwrite', st => st.put(blob, id)); },
  async get(id) { const d = await this.open(); return new Promise((res, rej) => { const r = d.transaction('files').objectStore('files').get(id); r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error); }); },
  del(id) { return this.tx('files', 'readwrite', st => st.delete(id)); },
  async keys() { const d = await this.open(); return new Promise((res, rej) => { const r = d.transaction('files').objectStore('files').getAllKeys(); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); }); },
  async inbox() { // von Android „Teilen“ übergebene Dateien (vom Service Worker abgelegt)
    const d = await this.open();
    return new Promise((res, rej) => {
      const t = d.transaction('inbox', 'readwrite'), st = t.objectStore('inbox'), out = [];
      const c = st.openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out.push(cur.value); cur.delete(); cur.continue(); } };
      t.oncomplete = () => res(out); t.onerror = () => rej(t.error);
    });
  },
};
let LOCAL_FILES = new Set();
async function refreshLocalFiles() { try { LOCAL_FILES = new Set(await FileDB.keys()); } catch (e) { LOCAL_FILES = new Set(); } }
const fmtSize = b => b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
const isPdf = d => /pdf/i.test(d.type) || /\.pdf$/i.test(d.name);
const docsFor = (key, id) => db.docs.filter(d => d[key] === id);

async function addDoc(blob, meta) {
  const id = 'f' + uid();
  const doc = { id, name: meta.name || blob.name || 'Datei', type: blob.type || meta.type || 'application/octet-stream', size: blob.size, subject: meta.subject || '', hwId: meta.hwId || '', eventId: meta.eventId || '', campId: meta.campId || '', notes: meta.notes || '', created: todayStr(), remote: false };
  await FileDB.put(id, blob); LOCAL_FILES.add(id);
  upsert('docs', doc); save(); Files.schedule();
  return doc;
}
async function deleteDoc(id) {
  const d = db.docs.find(x => x.id === id); if (!d) return;
  removeItem('docs', id); try { await FileDB.del(id); } catch (e) { /* */ } LOCAL_FILES.delete(id);
  if (d.remote) { local.fileDel = (local.fileDel || []).concat([id]); saveLocal(); }
  save(); Files.schedule();
}
async function docBlob(d) {
  let b = await FileDB.get(d.id);
  if (!b && d.remote && Sync.configured() && navigator.onLine) { b = await Files.download(d); if (b) { await FileDB.put(d.id, b); LOCAL_FILES.add(d.id); } }
  return b;
}

// Bilder verkleinern (Arbeitsblatt-Fotos), optional „Dokument-Modus“ (kontrastreich, schwarz-weiß)
async function processImage(file, docMode) {
  const bmp = await createImageBitmap(file);
  const max = 2000, s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * s), h = Math.round(bmp.height * s);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  if (docMode) ctx.filter = 'grayscale(1) contrast(1.45) brightness(1.08)';
  ctx.drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', docMode ? 0.72 : 0.82));
  return { blob, w, h };
}
// Mini-PDF-Erzeuger: legt JPEG-Bilder als Seiten in eine PDF (A4)
async function pdfFromImages(imgs) {
  const enc = new TextEncoder(), parts = [], offs = []; let len = 0;
  const push = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (id, body) => { offs[id] = len; push(id + ' 0 obj\n'); (Array.isArray(body) ? body : [body]).forEach(push); push('\nendobj\n'); };
  push('%PDF-1.4\n%âã\n');
  const n = imgs.length;
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Kids [${imgs.map((_, i) => (3 + 3 * i) + ' 0 R').join(' ')}] /Count ${n} >>`);
  for (let i = 0; i < n; i++) {
    const im = imgs[i], bytes = new Uint8Array(await im.blob.arrayBuffer());
    const W = 595.28, H = 841.89, sc = Math.min(W / im.w, H / im.h), dw = im.w * sc, dh = im.h * sc, x = (W - dw) / 2, y = (H - dh) / 2;
    obj(3 + 3 * i, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im${i} ${5 + 3 * i} 0 R >> >> /Contents ${4 + 3 * i} 0 R >>`);
    const cs = `q ${dw.toFixed(2)} 0 0 ${dh.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im${i} Do Q`;
    obj(4 + 3 * i, `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
    obj(5 + 3 * i, [`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`, bytes, '\nendstream']);
  }
  const total = 3 + 3 * n, xref = len;
  push(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let id = 1; id < total; id++) push(String(offs[id]).padStart(10, '0') + ' 00000 n \n');
  push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts, { type: 'application/pdf' });
}
// PDF-Anzeige mit pdf.js (wird beim ersten Öffnen geladen und danach offline gespeichert)
const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = PDFJS + 'pdf.min.js';
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; res(window.pdfjsLib); };
    s.onerror = () => rej(new Error('PDF-Anzeige braucht beim ersten Mal Internet.'));
    document.head.appendChild(s);
  });
}

// ---------- Dateien über GitHub synchronisieren ----------
const Files = {
  running: false, timer: null,
  schedule(ms = 3000) { if (!Sync.configured()) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.run(), ms); },
  url(id) { return Sync.base() + '/contents/lernplan-dateien/' + id; },
  async run() {
    if (this.running || !Sync.configured() || !navigator.onLine) return;
    this.running = true;
    try {
      for (const d of db.docs.filter(x => !x.remote && LOCAL_FILES.has(x.id))) {
        if (d.size > 25 * 1048576) continue;
        const blob = await FileDB.get(d.id); if (!blob) continue;
        const b64 = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(',')[1]); fr.readAsDataURL(blob); });
        let sha; const head = await fetch(this.url(d.id), { headers: Sync.headers(), cache: 'no-store' }); if (head.ok) sha = (await head.json()).sha;
        const r = await fetch(this.url(d.id), { method: 'PUT', headers: { ...Sync.headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Lernplan-Datei ' + d.name, content: b64, ...(sha ? { sha } : {}) }) });
        if (!r.ok) throw new Error(await Sync.err(r));
        const cur = db.docs.find(x => x.id === d.id); if (cur) { upsert('docs', { ...cur, remote: true }); persist(); local.dirty = true; }
      }
      const dels = (local.fileDel || []).slice();
      for (const id of dels) {
        const h = await fetch(this.url(id), { headers: Sync.headers(), cache: 'no-store' });
        if (h.ok) { const sha = (await h.json()).sha; await fetch(this.url(id), { method: 'DELETE', headers: { ...Sync.headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Lernplan-Datei gelöscht', sha }) }); }
        local.fileDel = (local.fileDel || []).filter(x => x !== id); saveLocal();
      }
      if (local.dirty) Sync.schedule(500);
    } catch (e) { local.sync.err = 'Dateien: ' + (e.message || e); saveLocal(); Sync.set('err'); }
    finally { this.running = false; }
  },
  async download(d) {
    try {
      const r = await fetch(this.url(d.id), { headers: { ...Sync.headers(), Accept: 'application/vnd.github.raw+json' }, cache: 'no-store' });
      if (!r.ok) return null;
      return new Blob([await r.arrayBuffer()], { type: d.type });
    } catch (e) { return null; }
  },
};
// ---------- UI-Zustand ----------
const ui = {
  view: 'heute', cursor: todayStr(), kal: 'monat', auf: 'offen',
  search: '', typeFilter: 'all', showPast: false, allYears: false, ttWeek: null,
};
let formState = null, sheetOpen = false, sheetMode = null, deferredPrompt = null;

// ---------- Bausteine ----------
function evCard(e, o = {}) {
  const t = TYPES[e.type] || TYPES.sonst, s = subj(e.subject), today = todayStr();
  const endD = e.end || e.date, past = endD < today, n = diffDays(today, e.date);
  const head = (e.title && e.title.trim()) || s.name || t.label;
  const l2 = [];
  if (o.showDate) l2.push(`<span class="it">${fmtShort(e.date)}</span>`);
  if ((e.title && e.title.trim()) || s.name) {
    const lbl = (e.title && e.title.trim()) ? [t.label, s.name].filter(Boolean).join(' · ') : t.label;
    l2.push(`<span class="it">${s.name ? `<i class="dot" style="--c:${s.color}"></i>` : ''}${esc(lbl)}</span>`);
  }
  if (e.time) l2.push(`<span class="it">${e.time} Uhr</span>`);
  if (e.end && e.end > e.date) l2.push(`<span class="it">${e.date < (o.day || e.date) ? 'läuft ' : ''}bis ${fmtShort(e.end)}</span>`);
  if (e.official && !e.camp) l2.push(`<span class="it">amtlich</span>`);
  if (!e.official) { const nd = db.docs.filter(d => d.eventId === e.id).length, np = db.homework.filter(x => x.planFor === e.id); if (nd) l2.push(`<span class="it">📎 ${nd}</span>`); if (np.length) l2.push(`<span class="it">📅 ${np.filter(x => x.done).length}/${np.length}</span>`); }
  if (e.camp && e.notes) l2.push(`<span class="it">📍 ${esc(e.notes)}</span>`);
  const side = [];
  if (isExam(e) && !past) side.push(`<span class="cd">${n === 0 ? 'heute' : n === 1 ? 'morgen' : n + ' T.'}</span>`);
  if (isExam(e) && e.done) side.push(`<span class="ok">✓ bereit</span>`);
  return `<div class="ev${past ? ' past' : ''}${e.official ? ' official' : ''}" role="button" tabindex="0" data-a="${e.camp ? 'campOpen' : e.official ? 'offinfo' : 'edit'}" data-v="${e.camp || e.id}" style="--c:${t.color}">
    <span class="ev-bar"></span>
    <span class="ev-main"><span class="ev-l1"><span class="pill">${esc(t.short)}</span><span class="t">${esc(head)}</span></span>
    ${l2.length ? `<span class="ev-l2">${l2.join('')}</span>` : ''}
    ${o.notes && e.notes && !e.camp ? `<span class="ev-notes">${esc(e.notes)}</span>` : ''}</span>
    ${side.length ? `<span class="ev-side">${side.join('')}</span>` : ''}
  </div>`;
}
function ferienBanner(f, d) {
  const fr = freeRange(f);
  const txt = d === f.start ? `${f.name} beginnen` : d > f.start ? `${f.name} · noch ${diffDays(d, f.end) + 1} Ferientage` : f.name;
  return `<div class="banner fe">🌴 ${txt}<span class="sub">${fmtDM(f.start)}–${fmtDM(f.end)} · ${fr.days} Tage frei</span></div>`;
}
const holBanner = h => `<div class="banner ft">${h.schoolOnly ? '📕' : '🎌'} ${esc(h.name)}${h.schoolOnly ? '<span class="sub">unterrichtsfrei</span>' : ''}</div>`;
const learnStart = e => addDays(e.date, -(+e.prep || 0));
function learnBanner(e, d) {
  return `<div class="banner learn" data-a="edit" data-v="${e.id}">📚 Lernen für ${esc(evTitle(e))}<span class="sub">${rel(diffDays(d, e.date))}</span></div>`;
}
function hwItem(h, o = {}) {
  const s = subj(h.subject), t = todayStr(), n = h.due ? diffDays(t, h.due) : null;
  let due = '';
  if (h.due) {
    const cls = !h.done && n < 0 ? 'over' : !h.done && n <= 1 ? 'soon' : '';
    due = `<span class="due ${cls}">${n < 0 && !h.done ? 'überfällig · ' : ''}${n >= -1 && n <= 2 ? cap(rel(n)) : fmtShort(h.due)}</span>`;
  }
  return `<div class="hw${h.done ? ' done' : ''}">
    <button class="chk sm${h.done ? ' on' : ''}" data-a="hwdone" data-v="${h.id}" aria-label="Erledigt">${ICON.check}</button>
    <div class="body" data-a="hwedit" data-v="${h.id}"><div class="txt">${esc(h.text || HW_KINDS[h.kind] || 'Aufgabe')}</div>
    <div class="meta">${s.name && o.campBadge !== false ? `<span class="row" style="gap:5px"><i class="dot" style="--c:${s.color}"></i>${esc(s.name)}</span>` : ''}${h.page ? `<span>📖 ${esc(h.page)}</span>` : ''}${h.kind && h.kind !== 'ha' ? `<span>${HW_KINDS[h.kind]}</span>` : ''}${due}${h.campId && o.campBadge !== false ? `<span class="campbadge">🛷 ${esc((db.camps.find(c => c.id === h.campId) || {}).title || 'Lehrgang')}</span>` : ''}${h.handed ? '<span style="color:var(--good);font-weight:700">✓ abgegeben</span>' : ''}${(() => { const n = db.docs.filter(d => d.hwId === h.id).length; return n ? `<span>📎 ${n}</span>` : ''; })()}</div>
    ${h.notes && o.notes !== false ? `<div class="hwnotes">${esc(h.notes)}</div>` : ''}</div>
    ${h.campId && h.done ? `<button class="chip sm${h.handed ? ' on' : ''}" data-a="hwHanded" data-v="${h.id}" style="align-self:center">${h.handed ? 'abgegeben' : 'abgeben?'}</button>` : ''}
  </div>`;
}
function absenceBanner(a) {
  return `<div class="banner abs" data-a="absedit" data-v="${a.id}">🤒 Gefehlt: ${ABS_REASONS[a.reason] || 'Abwesend'}<span class="sub">${a.excused ? 'entschuldigt' : 'Entschuldigung fehlt'}</span></div>`;
}
const absOn = d => db.absences.filter(a => a.date <= d && (a.end || a.date) >= d);

// ---------- Heute ----------
function statusCard(t) {
  const f = ferienMap.get(t);
  if (f) {
    const back = nextSchoolDay(f.end), left = diffDays(t, f.end);
    return `<div class="card status ferien"><div class="ic">🌴</div><div class="body">
      <div class="st-t">${f.name} · ${left > 0 ? 'noch ' + (left + 1) + ' Ferientage' : 'letzter Ferientag'}</div>
      <div class="st-s">Die Schule beginnt wieder am ${fmtLong(back)}.</div></div></div>`;
  }
  const nf = nextFerien(t);
  if (!nf) return `<div class="card status"><div class="ic">📅</div><div class="body"><div class="st-t">Weitere Ferien noch nicht veröffentlicht</div><div class="st-s">Die App prüft online regelmäßig auf neue Termine.</div></div></div>`;
  let last = addDays(nf.start, -1), g = 0;
  while (!isSchoolDay(last) && g++ < 30) last = addDays(last, -1);
  const remaining = countSchoolDays(addDays(t, 1), addDays(nf.start, -1));
  const pf = prevFerien(t), stretchStart = pf ? addDays(pf.end, 1) : t;
  const total = Math.max(1, countSchoolDays(stretchStart, addDays(nf.start, -1)));
  const pct = Math.min(100, Math.max(3, Math.round((total - remaining) / total * 100)));
  const fr = freeRange(nf);
  let title;
  if (t === last) title = `Heute ist der letzte Schultag vor den ${nf.name}! 🎉`;
  else if (t > last) title = `Die ${nf.name} beginnen ${rel(diffDays(t, nf.start))} 🎉`;
  else title = `Noch ${remaining} Schultag${remaining === 1 ? '' : 'e'} bis zu den ${nf.name}`;
  return `<div class="card status"><div class="ic">${isSchoolDay(t) ? '🏫' : '☀️'}</div><div class="body">
    <div class="st-t">${title}</div>
    <div class="st-s">${nf.name}: ${fmtShort(nf.start)} – ${fmtShort(nf.end)} · ${fr.days} Tage frei${t < last ? ' · letzter Schultag ' + fmtShort(last) : ''}</div>
    <div class="prog" aria-hidden="true"><i style="width:${pct}%"></i></div></div></div>`;
}
function lessonsHTML(d, live) {
  const ls = lessonsOn(d); if (!ls.length) return '';
  const nm = nowMin();
  return `<div class="card lessons">${ls.map(l => {
    const s = subj(l.subject), p = period(l.period);
    let cls = '';
    if (live && p) { if (nm >= toMin(p.s) && nm < toMin(p.e)) cls = ' now'; else if (nm >= toMin(p.e)) cls = ' past'; }
    const exams = eventsOn(d).filter(e => isExam(e) && e.subject === l.subject);
    const hwDue = db.homework.filter(h => !h.done && h.due === d && h.subject === l.subject).length;
    return `<div class="les${cls}" data-a="ttedit" data-v="${l.day}:${l.period}">
      <span class="pn">${l.period}</span><span class="tm">${p ? p.s + '<br>' + p.e : ''}</span>
      <span class="sb"><i class="dot" style="--c:${s.color}"></i>${esc(s.name || '–')}${exams.map(e => `<span class="badge" style="--c:${TYPES[e.type].color}">${TYPES[e.type].short}</span>`).join('')}${hwDue ? `<span class="badge" style="--c:#0090ff">HA</span>` : ''}</span>
      <span class="rm">${esc(l.room || s.room || '')}</span></div>`;
  }).join('')}</div>`;
}
function nextExamCard(e) {
  const t = todayStr(), n = diffDays(t, e.date), ty = TYPES[e.type];
  const ls = learnStart(e); let tag;
  if (e.done) tag = '<span class="tag ok">✓ gut vorbereitet</span>';
  else if (n <= 1) tag = '<span class="tag hot">Letzte Wiederholung!</span>';
  else if (e.prep > 0 && ls <= t) tag = '<span class="tag hot">Jetzt lernen</span>';
  else if (e.prep > 0) tag = `<span class="tag">Lernen ab ${fmtShort(ls)}</span>`;
  else tag = '';
  if (!e.official) { const pl = db.homework.filter(x => x.planFor === e.id); tag += pl.length ? `<span class="tag btnlike" data-a="planGen" data-v="${e.id}">📅 Lernplan ${pl.filter(x => x.done).length}/${pl.length}</span>` : `<span class="tag btnlike" data-a="planGen" data-v="${e.id}">📅 Lernplan</span>`; }
  if (e.subject) tag += `<span class="tag btnlike" data-a="timerFor" data-v="${e.subject}">▶ Lernzeit</span>`;
  return `<div class="card next" role="button" tabindex="0" data-a="${e.official ? 'offinfo' : 'edit'}" data-v="${e.id}" style="--c:${ty.color};border-left:4px solid ${ty.color}">
    <div class="nc-count">${n === 0 ? '<b>!</b><span>heute</span>' : n === 1 ? '<b>1</b><span>morgen</span>' : `<b>${n}</b><span>Tage</span>`}</div>
    <div class="nc-body"><div class="nc-t"><span class="pill" style="--c:${ty.color}">${ty.short}</span><span class="t">${esc(evTitle(e))}</span></div>
    <div class="nc-d">${fmtLong(e.date)}${e.time ? ' · ' + e.time + ' Uhr' : ''}</div>
    ${e.notes && !e.official ? `<div class="nc-notes">${esc(e.notes)}</div>` : ''}${tag}</div>
    ${e.official ? '' : `<button class="chk${e.done ? ' on' : ''}" data-a="done" data-v="${e.id}" aria-label="Als vorbereitet markieren">${ICON.check}</button>`}
  </div>`;
}
function busyWeeks() {
  const t = todayStr(), mon = mondayOf(t), res = [];
  const exams = allEvents().filter(e => isExam(e) && e.date >= t);
  for (let k = 0; k < 8; k++) {
    const a = addDays(mon, 7 * k), b = addDays(a, 6), list = exams.filter(e => e.date >= a && e.date <= b);
    const big = list.filter(e => e.type === 'sa' || e.type === 'ap' || e.type === 'test').length;
    if (big >= 2 || list.length >= 4) res.push({ a, big, list });
  }
  return res;
}
function agendaHTML(from, days) {
  const t = todayStr(); let html = '';
  const learnMap = {};
  db.events.forEach(e => { if (isExam(e) && !e.done && +e.prep > 0 && e.date > t) (learnMap[learnStart(e)] = learnMap[learnStart(e)] || []).push(e); });
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i), info = dayInfo(d), items = [];
    if (info.f && (d === info.f.start || i === 0)) items.push(ferienBanner(info.f, d));
    if (info.h && !info.h.minor) items.push(holBanner(info.h));
    eventsOn(d).filter(e => e.date === d || i === 0).forEach(e => items.push(evCard(e, { day: d, notes: isExam(e) })));
    if (d !== t) (learnMap[d] || []).forEach(e => items.push(learnBanner(e, d)));
    if (!items.length) continue;
    const n = diffDays(t, d);
    const relTxt = n <= 1 ? cap(rel(n)) + ' · ' + fmtDM(d) : WDL[dow(d)] + ', ' + pd(d).getDate() + '. ' + MON[pd(d).getMonth()];
    html += `<div class="ag-day${d === t ? ' is-today' : ''}">
      <button class="ag-date" data-a="goday" data-v="${d}"><span>${WD[dow(d)]}</span><b>${pd(d).getDate()}</b></button>
      <div class="ag-items"><div class="ag-rel">${relTxt}</div>${items.join('')}</div></div>`;
  }
  return html || `<div class="empty">Keine Termine in den nächsten ${days} Tagen.</div>`;
}
function setupCard() {
  const k = klasse(), g = db.settings.wpfg;
  return `<div class="card tip" style="margin-top:10px"><b>Einrichtung (30 Sekunden)</b>
    <div class="small" style="margin-top:6px">In welche Klasse gehst du im Schuljahr ${curSy()}?</div>
    <div class="rowb">${[7, 8, 9, 10].map(n => `<button class="chip${k === n ? ' on' : ''}" data-a="setKlasse" data-v="${n}">${n}. Klasse</button>`).join('')}</div>
    <div class="small" style="margin-top:10px">Deine Wahlpflichtfächergruppe:</div>
    <div class="rowb">${['I', 'II', 'IIIa', 'IIIb'].map(n => `<button class="chip${g === n ? ' on' : ''}" data-a="setWpfg" data-v="${n}">${n}</button>`).join('')}</div>
    <div class="small muted" style="margin-top:6px">I = Mathe/Physik · II = BwR · IIIa = Französisch · IIIb = Kunst/Werken u. a.</div>
    <div class="rowb"><button class="btn" data-a="setupDone"${k && g ? '' : ' disabled'}>Fertig</button><button class="btn ghost" data-a="setupSkip">Später</button></div></div>`;
}
function homeHTML() {
  const t = todayStr(), d = pd(t);
  const wt = weekType(t);
  let h = `<div class="hero"><div class="hwd">${WDL[d.getDay()]} · KW ${isoWeek(t)}${wt ? ' · ' + wt + '-Woche' : ''}${klasse() ? ' · ' + klasse() + '. Klasse' : ''}</div><div class="big">${d.getDate()}. ${MON[d.getMonth()]}</div></div>`;
  if (!db.settings.setupDone) h += setupCard(); else if (!klasse()) h += newYearCard();
  h += `<div class="cols2"><div class="col-l">`;
  h += `<div style="margin-top:10px">${statusCard(t)}</div>`;
  h += campHomeCard(t);
  h += morgenCard(t);
  h += `<div class="qa-row">
    <button class="qa-btn" data-a="newHw"><span class="e">📝</span>Aufgabe</button>
    <button class="qa-btn" data-a="add"><span class="e">📅</span>Prüfung</button>
    <button class="qa-btn" data-a="sickToday"><span class="e">🤒</span>Krank</button></div>`;
  if (deferredPrompt) h += `<div class="card tip" style="margin-top:12px"><b>Als App installieren</b><div class="small">Startet dann wie eine normale App – auch offline.</div><div class="rowb"><button class="btn" data-a="install">Installieren</button></div></div>`;
  // Stundenplan
  const showDay = isSchoolDay(t) && lessonsOn(t).length && (() => { const ls = lessonsOn(t), p = period(ls[ls.length - 1].period); return !p || nowMin() < toMin(p.e); })() ? t : nextSchoolDay(t);
  if (db.timetable.length) {
    const lbl = (showDay === t ? 'Heute im Stundenplan' : (diffDays(t, showDay) === 1 ? 'Morgen' : WDL[dow(showDay)] + ', ' + fmtDM(showDay)) + ' im Stundenplan') + (campOn(showDay).length ? ' · verpasst (Lehrgang)' : '');
    const lh = lessonsHTML(showDay, showDay === t);
    if (lh) h += `<div class="sec">${lbl}${weekType(showDay) ? ' · ' + weekType(showDay) : ''}<button class="more" data-a="tab" data-v="plan">Plan →</button></div>${lh}`;
  } else if (db.settings.setupDone) {
    h += `<div class="sec">Stundenplan</div><div class="card tip"><b>Stundenplan eintragen</b><div class="small">Am schnellsten per Excel-Import (z. B. aus einem Foto erstellt). Dann siehst du hier deine Stunden, und Hausaufgaben lassen sich „bis zur nächsten Stunde“ eintragen.</div><div class="rowb"><button class="btn" data-a="ttImport">Aus Excel importieren</button><button class="btn ghost" data-a="tab" data-v="plan">Selbst eintragen</button></div></div>`;
  }
  // Aufgaben
  const due = db.homework.filter(x => !x.done && x.due && x.due <= addDays(t, 2)).sort((a, b) => a.due < b.due ? -1 : 1);
  if (due.length) h += `<div class="sec">Fällige Aufgaben <span class="cnt">${due.length}</span><button class="more" data-a="tab" data-v="aufgaben">Alle →</button></div><div class="stack">${due.slice(0, 5).map(hwItem).join('')}</div>`;
  h += `</div><div class="col-r">`;
  // Prüfungen
  const exams = allEvents().filter(e => isExam(e) && e.date >= t && diffDays(t, e.date) <= 45).sort(sortEv);
  if (exams.length) {
    h += `<div class="sec">Nächste Prüfungen <span class="cnt">${exams.length}</span></div><div class="stack">${exams.slice(0, 3).map(nextExamCard).join('')}</div>`;
    if (exams.length > 3) h += `<button class="linkbtn" data-a="kalList">Alle ${exams.length} Prüfungen ansehen →</button>`;
  }
  const busy = busyWeeks();
  if (busy.length) h += `<div class="sec">Stressige Wochen</div><div class="stack">${busy.map(w => {
    const rest = w.list.length - w.big;
    return `<div class="warn">⚠️<div><b>KW ${isoWeek(w.a)} (${fmtDM(w.a)}–${fmtDM(addDays(w.a, 4))})</b><br>${w.big ? w.big + ' große Prüfung' + (w.big > 1 ? 'en' : '') : ''}${w.big && rest ? ', ' : ''}${rest ? rest + ' weitere' : ''}: ${w.list.map(e => esc(subj(e.subject).name || evTitle(e))).join(', ')} – früh anfangen.</div></div>`;
  }).join('')}</div>`;
  h += `<div class="sec">Nächste ${db.settings.agendaDays} Tage</div>${agendaHTML(t, db.settings.agendaDays)}`;
  return h + `</div></div>`;
}
function newYearCard() {
  const sy = curSy(), y = +sy.slice(0, 4), prev = (y - 1) + '/' + String(y).slice(2), k0 = klasse(prev);
  const sug = k0 ? Math.min(10, k0 + 1) : null;
  return `<div class="card tip" style="margin-top:10px"><b>Neues Schuljahr ${sy} 🎒</b><div class="small" style="margin-top:4px">In welcher Klasse bist du jetzt? Davon hängen z. B. die Termine der Abschlussprüfung ab.</div><div class="rowb">${[7, 8, 9, 10].map(n => `<button class="chip${n === sug ? ' on' : ''}" data-a="setKlasse" data-v="${n}">${n}. Klasse</button>`).join('')}</div></div>`;
}

// ---------- Kalender ----------
function monthHTML() {
  const c = pd(ui.cursor), y = c.getFullYear(), m = c.getMonth(), t = todayStr(), kw = db.settings.kw;
  const first = new Date(y, m, 1), lastD = new Date(y, m + 1, 0);
  const sun = db.settings.ws === 0, off = sun ? 0 : 6;
  const start = ds(new Date(y, m, 1 - ((first.getDay() + off) % 7)));
  const end = ds(new Date(y, m, lastD.getDate() + (6 - ((lastD.getDay() + off) % 7))));
  const mStart = ds(first), mEnd = ds(lastD);
  let g = kw ? '<div class="mh"></div>' : '';
  (sun ? ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']).forEach(w => g += `<div class="mh">${w}</div>`);
  for (let d = start, i = 0; d <= end; d = addDays(d, 1), i++) {
    const col = i % 7;
    if (col === 0 && kw) { const wt = weekType(sun ? addDays(d, 1) : d); g += `<div class="kwc">${isoWeek(sun ? addDays(d, 1) : d)}${wt ? `<i>${wt}</i>` : ''}</div>`; }
    const info = dayInfo(d), evs = eventsOn(d).filter(e => e.type !== 'frei'), cls = ['cell'];
    if (col === 0) cls.push('c0');
    if (d < mStart || d > mEnd) cls.push('out');
    if (info.weekend) cls.push('we');
    if (info.f || info.freeEv) cls.push('fe');
    if (info.h && !info.h.minor) cls.push('ft');
    if (d === t) cls.push('today');
    if (d === ui.cursor) cls.push('sel');
    let label = '';
    if (info.h && !info.h.minor) label = `<span class="hn r">${esc(info.h.name)}</span>`;
    else if (info.f && (d === info.f.start || col === 0 || d === mStart)) label = `<span class="hn">${info.f.name}</span>`;
    else if (info.freeEv && (d === info.freeEv.date || col === 0)) label = `<span class="hn">${esc(evTitle(info.freeEv))}</span>`;
    const chips = evs.slice(0, 3).map(e => {
      const s = subj(e.subject), ty = TYPES[e.type] || TYPES.sonst;
      const txt = s.short ? ty.short + ' ' + s.short : evTitle(e);
      return `<i class="mc" style="--c:${ty.color}">${esc(txt)}</i>`;
    }).join('');
    const more = evs.length > 3 ? `<span class="more">+${evs.length - 3}</span>` : '';
    const hw = db.homework.filter(x => !x.done && x.due === d).length, ab = absOn(d).length;
    const dots = (hw ? `<i style="--c:#0090ff"></i>` : '') + (ab ? `<i style="--c:#8e4ec6"></i>` : '');
    g += `<button class="${cls.join(' ')}" data-a="cell" data-v="${d}" aria-label="${fmtLong(d)}"><span class="num">${pd(d).getDate()}</span>${label}${chips}${more}${dots ? `<span class="mdots">${dots}</span>` : ''}</button>`;
  }
  let h = `<div class="cols2"><div class="col-l"><div class="mwrap"><div class="mgrid${kw ? ' kw' : ''}">${g}</div></div>`;
  const fs = FERIEN.filter(f => f.start <= mEnd && f.end >= mStart);
  const hs = Object.entries(holidaysOf(y)).filter(([d, x]) => d >= mStart && d <= mEnd && !x.minor).sort();
  if (fs.length || hs.length) h += `<div class="legend">${fs.map(f => `<span class="lg">🌴 ${f.name} ${fmtDM(f.start)}–${fmtDM(f.end)}</span>`).join('')}${hs.map(([d, x]) => `<span class="lg r">${fmtDM(d)} ${esc(x.name)}</span>`).join('')}</div>`;
  h += `</div><div class="col-r"><div class="sec">${cap(fmtLong(ui.cursor))}${ui.cursor === t ? ' · heute' : ''}</div>${dayDetail(ui.cursor, true)}</div></div>`;
  return h;
}
function dayDetail(d, withLessons) {
  const info = dayInfo(d), t = todayStr(), items = [];
  if (info.f) items.push(ferienBanner(info.f, d));
  if (info.h && !info.h.minor) items.push(holBanner(info.h));
  absOn(d).forEach(a => items.push(absenceBanner(a)));
  eventsOn(d).forEach(e => items.push(evCard(e, { day: d, notes: true })));
  db.homework.filter(x => x.due === d).forEach(x => items.push(hwItem(x)));
  if (d >= t) db.events.filter(e => isExam(e) && !e.done && +e.prep > 0 && learnStart(e) <= d && d < e.date).sort(sortEv).forEach(e => items.push(learnBanner(e, d)));
  if (!items.length) items.push(`<div class="banner school">${info.weekend ? 'Wochenende' : 'Schultag'} – keine Termine</div>`);
  let h = `<div class="stack">${items.join('')}</div>`;
  if (withLessons && info.school) { const lh = lessonsHTML(d, d === t); if (lh) h += `<div class="sec">Stundenplan${weekType(d) ? ' · ' + weekType(d) + '-Woche' : ''}</div>${lh}`; }
  return h + `<button class="addline" data-a="add" data-v="${d}">${ICON.plus} Termin am ${fmtShort(d)} eintragen</button>`;
}
function dayHTML() {
  const d = ui.cursor, t = todayStr(), mon = weekStart(d);
  let strip = '';
  for (let i = 0; i < 7; i++) {
    const x = addDays(mon, i), info = dayInfo(x), cls = ['wd'];
    if (info.f || info.freeEv) cls.push('fe');
    if (info.h && !info.h.minor) cls.push('ft');
    if (x === t) cls.push('today');
    if (x === d) cls.push('sel');
    const dots = eventsOn(x).filter(e => e.type !== 'frei').slice(0, 3).map(e => `<i style="--c:${(TYPES[e.type] || TYPES.sonst).color}"></i>`).join('');
    strip += `<button class="${cls.join(' ')}" data-a="wday" data-v="${x}"><span>${WD[dow(x)]}</span><b>${pd(x).getDate()}</b><span class="dots">${dots}</span></button>`;
  }
  return `<div class="wstrip">${strip}</div>
    <div class="day-head"><div class="rel">${cap(rel(diffDays(t, d)))}</div><h2>${fmtLong(d)}</h2><div class="kw">KW ${isoWeek(d)}${weekType(d) ? ' · ' + weekType(d) + '-Woche' : ''} · ${pd(d).getFullYear()}</div></div>
    ${dayDetail(d, true)}`;
}
function weekHTML() {
  const mon = weekStart(ui.cursor), t = todayStr();
  let h = `<div class="small muted" style="margin:2px 2px 8px">KW ${isoWeek(db.settings.ws === 0 ? addDays(mon, 1) : mon)} · ${fmtDM(mon)} – ${fmtDM(addDays(mon, 6))}${weekType(db.settings.ws === 0 ? addDays(mon, 1) : mon) ? ' · ' + weekType(db.settings.ws === 0 ? addDays(mon, 1) : mon) + '-Woche' : ''}</div><div class="weekgrid">`;
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i), info = dayInfo(d), cls = ['wkday'], items = [];
    if (info.f || info.freeEv) cls.push('fe'); if (d === t) cls.push('today'); if (info.weekend) cls.push('we');
    if (info.f && (i === 0 || d === info.f.start)) items.push(`<div class="wev" style="--c:#30a46c"><span class="t">🌴 ${info.f.name}</span></div>`);
    if (info.h && !info.h.minor) items.push(`<div class="wev" style="--c:#d93025"><span class="t">${esc(info.h.name)}</span></div>`);
    absOn(d).forEach(a => items.push(`<div class="wev" style="--c:#8e4ec6" data-a="absedit" data-v="${a.id}"><span class="t">🤒 ${ABS_REASONS[a.reason] || 'Fehlzeit'}</span></div>`));
    eventsOn(d).filter(e => e.type !== 'frei').forEach(e => { const ty = TYPES[e.type] || TYPES.sonst; items.push(`<div class="wev" style="--c:${ty.color}" data-a="${e.camp ? 'campOpen' : e.official ? 'offinfo' : 'edit'}" data-v="${e.camp || e.id}"><span class="pill" style="--c:${ty.color}">${esc(ty.short)}</span><span class="t">${esc((e.title && e.title.trim()) || subj(e.subject).name || ty.label)}</span></div>`); });
    db.homework.filter(x => x.due === d && !x.done).forEach(x => items.push(`<div class="wev" style="--c:#0090ff" data-a="hwedit" data-v="${x.id}"><span class="t">📝 ${esc((subj(x.subject).short ? subj(x.subject).short + ': ' : '') + (x.text || HW_KINDS[x.kind]))}</span></div>`));
    const ln = info.school && !campOn(d).length ? lessonsOn(d).length : 0;
    h += `<div class="${cls.join(' ')}"><div class="wkh" data-a="goday" data-v="${d}" role="button"><span>${WD[dow(d)]}</span><b>${pd(d).getDate()}.</b>${ln ? `<span class="ls">${ln} Std.</span>` : ''}</div>${items.join('') || `<div class="wkempty">${info.school ? '–' : 'frei'}</div>`}</div>`;
  }
  return h + `</div><button class="addline" data-a="add">${ICON.plus} Termin in dieser Woche</button>`;
}
// Gemeinsamer Kalender aller Apps (Planer, Training, Atmung, Mobility) – kommt aus dem Verbund der äußeren App
const SC = () => { try { return (window.top && window.top.SharedCalendar) || window.SharedCalendar; } catch (e) { return window.SharedCalendar; } };
function weekAllHTML() {
  const C = SC(); if (!C || !C.allItems) return '';
  const t = todayStr(), end = addDays(t, 6), items = C.allItems(t, end);
  const col = name => (C.sources.find(x => x[0] === name) || [])[1] || 'var(--muted)';
  let h = `<div class="card wkall"><div class="wkh"><div><b>Nächste 7 Tage · alle Apps</b><div class="small muted">Schule, Training, Mobility, Atmung und eigene Termine – geplant wird im großen Kalender</div></div></div>`;
  if (!items.length) h += '<div class="small muted" style="margin-top:8px">Nichts geplant.</div>';
  let cur = '';
  items.slice(0, 40).forEach(e => {
    if (e.date !== cur) { cur = e.date; const d = pd(e.date); h += `<div class="wkd">${e.date === t ? 'Heute' : ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.'}</div>`; }
    h += `<div class="wkr"><span class="wkt">${esc(e.time || 'ganzt.')}</span><i style="--c:${e.color || col(e.app)}"></i><span class="wkn">${esc(e.title)}</span><span class="wka">${esc(e.app)}</span></div>`;
  });
  if (items.length > 40) h += `<div class="small muted">… und ${items.length - 40} weitere im Planer-Kalender</div>`;
  return h + '</div>';
}
function termineHTML() {
  return `${weekAllHTML()}<input class="inp" id="q" type="search" placeholder="Suchen: Fach, Thema, Notiz …" value="${esc(ui.search)}" data-f="search" autocomplete="off" style="margin-bottom:8px;background:var(--surface)">
    <div class="hscroll"><button class="chip sm${ui.typeFilter === 'all' ? ' on' : ''}" data-a="tfilter" data-v="all">Alle</button><button class="chip sm${ui.typeFilter === 'exams' ? ' on' : ''}" data-a="tfilter" data-v="exams">Prüfungen</button>
    ${USER_TYPES.map(k => `<button class="chip sm${ui.typeFilter === k ? ' on' : ''}" data-a="tfilter" data-v="${k}"><i class="dot" style="--c:${TYPES[k].color}"></i>${TYPES[k].label}</button>`).join('')}</div>
    <div id="listRes">${listResHTML()}</div>`;
}
function listResHTML() {
  const t = todayStr();
  let evs = allEvents();
  if (ui.typeFilter === 'exams') evs = evs.filter(isExam);
  else if (ui.typeFilter !== 'all') evs = evs.filter(e => e.type === ui.typeFilter);
  if (ui.search.trim()) {
    const q = ui.search.trim().toLowerCase();
    evs = evs.filter(e => [evTitle(e), e.notes, subj(e.subject).name, TYPES[e.type]?.label].join(' ').toLowerCase().includes(q));
  }
  const up = evs.filter(e => (e.end || e.date) >= t).sort(sortEv);
  const past = evs.filter(e => (e.end || e.date) < t).sort(sortEv).reverse();
  const cnt = k => up.filter(e => e.type === k).length;
  let h = `<div class="small muted" style="margin:10px 2px 0">${up.length} kommende${cnt('sa') ? ' · ' + cnt('sa') + ' SA' : ''}${cnt('ka') ? ' · ' + cnt('ka') + ' KA' : ''}${cnt('ex') ? ' · ' + cnt('ex') + ' Ex' : ''}${cnt('ap') ? ' · ' + cnt('ap') + ' AP' : ''}</div>`;
  const group = list => { let out = '', cur = ''; list.forEach(e => { const mk = e.date.slice(0, 7); if (mk !== cur) { cur = mk; out += `<div class="hgroup">${MON[+mk.slice(5) - 1]} ${mk.slice(0, 4)}</div>`; } out += `<div style="margin-bottom:6px">${evCard(e, { showDate: true, notes: true })}</div>`; }); return out; };
  h += up.length ? group(up) : `<div class="empty">${evs.length ? 'Keine kommenden Termine.' : 'Noch nichts eingetragen.'}</div>`;
  if (past.length) { h += `<button class="linkbtn" data-a="past">${ui.showPast ? 'Vergangene ausblenden' : 'Vergangene anzeigen (' + past.length + ')'}</button>`; if (ui.showPast) h += group(past); }
  return h;
}
function schoolYearOfF(f) { const y = +f.start.slice(0, 4), m = +f.start.slice(5, 7), s = f.name === 'Sommerferien' ? y - 1 : (m >= 8 ? y : y - 1); return s + '/' + String(s + 1).slice(2); }
function ferienHTML() {
  const t = todayStr(), items = FERIEN.map(f => ({ ...f }));
  const maxY = +FERIEN[FERIEN.length - 1].end.slice(0, 4);
  for (let y = 2024; y <= maxY; y++) { const e = Object.entries(holidaysOf(y)).find(([, x]) => x.schoolOnly); if (e && e[0] <= FERIEN[FERIEN.length - 1].end) items.push({ name: 'Buß- und Bettag', start: e[0], end: e[0], minor: true }); }
  items.sort((a, b) => a.start < b.start ? -1 : 1);
  const groups = {}; items.forEach(f => { const k = schoolYearOfF(f); (groups[k] = groups[k] || []).push(f); });
  let h = '', hidden = 0;
  Object.keys(groups).sort().forEach(k => {
    const list = groups[k];
    if (list[list.length - 1].end < t && !ui.allYears) { hidden++; return; }
    h += `<div class="hgroup">Schuljahr ${k}</div><div class="card lcard">`;
    list.forEach(f => {
      const now = f.start <= t && t <= f.end, past = f.end < t, n = diffDays(t, f.start), fr = freeRange(f);
      const st = past ? 'vorbei' : now ? 'läuft · noch ' + (diffDays(t, f.end) + 1) + ' T.' : n > 60 ? 'in ' + Math.round(n / 7) + ' Wochen' : rel(n);
      const dates = f.start === f.end ? fmtLong(f.start, true) : `${fmtShort(f.start)} – ${fmtShort(f.end)}${f.end.slice(0, 4)}`;
      const sub = f.minor ? 'unterrichtsfrei' : `${fr.days} Tage frei (${fmtDM(fr.start)}–${fmtDM(fr.end)})`;
      h += `<div class="frow${now ? ' now' : ''}${past ? ' past' : ''}${f.minor ? ' minor' : ''}"><div><div class="fn">${f.minor ? '📕 ' : ''}${f.name}${f.online ? ' <span class="muted small">(online)</span>' : ''}</div><div class="fd">${dates} · ${sub}</div></div><div class="fs">${st}</div></div>`;
    });
    h += '</div>';
  });
  h += `<button class="linkbtn" data-a="allyears">${ui.allYears ? 'Vergangene Schuljahre ausblenden' : 'Vergangene Schuljahre anzeigen' + (hidden ? ' (' + hidden + ')' : '')}</button>`;
  const lo = local.ferienOnline;
  h += `<p class="small muted">Amtliche Termine (BayMBl. 2022 Nr. 747) bis Sommer 2030; spätere Jahre kommen automatisch aus dem Internet (OpenHolidays), sobald veröffentlicht.${lo ? ' Zuletzt online geprüft: ' + fmtShort(ds(new Date(lo.t))) + '.' : ''}</p>`;
  return h;
}
function absencesHTML() {
  const sy = curSy(), [a, b] = syRange(sy);
  const list = db.absences.filter(x => x.date >= a && x.date <= b).sort((x, y) => x.date < y.date ? 1 : -1);
  const daySet = new Set(); list.forEach(x => { for (let d = x.date; d <= (x.end || x.date); d = addDays(d, 1)) { const i = dayInfo(d); if (!i.weekend && !i.f && !i.h) daySet.add(d); } });
  const days = daySet.size;
  const lessons = list.reduce((s, x) => s + (+x.lessons || 0), 0);
  const open = list.filter(x => !x.excused).length;
  let h = `<div class="stats"><div class="stat"><b>${days}</b><span>Fehltage</span></div><div class="stat"><b>${lessons}</b><span>Stunden</span></div><div class="stat"><b style="color:${open ? 'var(--danger)' : 'inherit'}">${open}</b><span>ohne Entschuldigung</span></div></div>`;
  h += `<div class="hgroup">Schuljahr ${sy}</div>`;
  if (!list.length) return h + `<div class="empty">Keine Fehlzeiten eingetragen. 👍</div>`;
  h += `<div class="card lcard">${list.map(x => {
    const missed = allEvents().filter(e => isExam(e) && e.date >= x.date && e.date <= (x.end || x.date));
    return `<div class="frow" data-a="absedit" data-v="${x.id}" style="cursor:pointer"><div><div class="fn">${ABS_REASONS[x.reason] || 'Abwesend'} · ${x.end && x.end > x.date ? fmtShort(x.date) + ' – ' + fmtShort(x.end) : fmtLong(x.date)}</div>
      <div class="fd">${x.lessons ? x.lessons + ' Stunden' : ''}${x.note ? ' · ' + esc(x.note) : ''}${missed.length ? ' · <b style="color:var(--danger)">verpasst: ' + missed.map(e => esc(evTitle(e))).join(', ') + '</b>' : ''}</div></div>
      <div class="fs" style="color:${x.excused ? 'var(--good)' : 'var(--danger)'}">${x.excused ? '✓ entschuldigt' : 'offen'}</div></div>`;
  }).join('')}</div>`;
  return h;
}
function countSchoolDaysAbs(x) { let n = 0; for (let d = x.date; d <= (x.end || x.date); d = addDays(d, 1)) { const i = dayInfo(d); if (!i.weekend && !i.f && !i.h) n++; } return n; }
function kalenderHTML() {
  if (ui.kal === 'monat') return monthHTML();
  if (ui.kal === 'tag') return dayHTML();
  if (ui.kal === 'woche') return weekHTML();
  if (ui.kal === 'termine') return termineHTML();
  if (ui.kal === 'ferien') return ferienHTML();
  return absencesHTML();
}

// ---------- Stundenplan ----------
function planHTML() {
  const t = todayStr(), P = db.settings.periods, days = db.settings.days || 5, ab = db.settings.ab.on;
  const shownWeek = ab ? (ui.ttWeek || weekType(t)) : null;
  const tDow = dow(t), nm = nowMin();
  let h = `<div class="printtitle">Stundenplan ${curSy()}${shownWeek ? ' · ' + shownWeek + '-Woche' : ''}</div>`;
  if (ab) h += `<div class="seg noprint">${['A', 'B'].map(w => `<button class="${shownWeek === w ? 'on' : ''}" data-a="ttWeek" data-v="${w}">${w}-Woche${weekType(t) === w ? ' (aktuell)' : ''}</button>`).join('')}</div>`;
  const used = Math.max(6, ...db.timetable.map(l => l.period));
  const rows = Math.min(P.length, used + (db.timetable.length ? 0 : 0));
  h += `<div class="ttwrap"><div class="tt" style="--days:${days}"><div class="th"></div>`;
  for (let dd = 1; dd <= days; dd++) h += `<div class="th${dd === tDow ? ' today' : ''}">${WD[dd % 7]}</div>`;
  for (let p = 1; p <= rows; p++) {
    const pp = P[p - 1];
    if (p > 1 && P[p - 2] && pp && toMin(pp.s) - toMin(P[p - 2].e) >= 10) h += `<div class="brk"></div>`;
    const isNow = pp && nm >= toMin(pp.s) && nm < toMin(pp.e);
    h += `<div class="tp${isNow ? ' now' : ''}">${p}${pp && db.settings.ttTimes !== false ? `<small>${pp.s}</small>` : ''}</div>`;
    for (let dd = 1; dd <= days; dd++) {
      const ls = db.timetable.filter(l => l.day === dd && l.period === p && (!shownWeek || l.week === 'all' || !l.week || l.week === shownWeek));
      const l = ls[0];
      const cls = ['tc']; if (dd === tDow) cls.push('today'); if (dd === tDow && isNow) cls.push('nowcell');
      let inner = '';
      if (l) {
        const s = subj(l.subject);
        inner = `<div class="in${l.week && l.week !== 'all' ? ' ab' : ''}" data-w="${l.week !== 'all' ? l.week || '' : ''}" style="--c:${s.color}"><b class="sn">${esc(s.short || s.name)}</b><b class="fn">${esc(s.name)}</b><span>${esc(l.room || s.room || '')}</span></div>`;
      }
      h += `<button class="${cls.join(' ')}" data-a="ttedit" data-v="${dd}:${p}" aria-label="${WDL[dd % 7]} ${p}. Stunde">${inner}</button>`;
    }
  }
  h += `</div></div>`;
  if (!db.timetable.length) h += `<div class="card tip noprint" style="margin-top:12px"><b>📸 Schneller: Stundenplan importieren</b><div class="small" style="margin-top:4px">Foto vom Stundenplan → Excel-Datei → hier einlesen. Oder einzeln: auf ein Feld tippen.</div><div class="rowb"><button class="btn" data-a="ttImport">Aus Excel importieren</button></div></div>`;
  h += `<div class="actions noprint"><button class="btn ghost" data-a="ttImport">Import (Excel)</button><button class="btn ghost" data-a="print">Als PDF / Drucken</button><button class="btn ghost" data-a="shareTT"${db.timetable.length ? '' : ' disabled'}>Mit Klasse teilen</button><button class="btn ghost" data-a="periods">Stundenzeiten</button></div>`;
  // Lehrkräfte & Räume
  const subs = [...new Set(db.timetable.map(l => l.subject))].map(subj).filter(s => s.id).sort((a, b) => a.name.localeCompare(b.name));
  if (subs.length) h += `<div class="sec noprint">Fächer, Lehrkräfte & Räume</div><div class="card lcard noprint">${subs.map(s => {
    const n = db.timetable.filter(l => l.subject === s.id).length;
    return `<div class="frow" data-a="subjEdit" data-v="${s.id}" style="cursor:pointer"><i class="dot" style="--c:${s.color}"></i><div><div class="fn">${esc(s.name)}</div><div class="fd">${esc(s.teacher || 'Lehrkraft eintragen')}${s.room ? ' · Raum ' + esc(s.room) : ''}</div></div><div class="fs">${n} Std./Woche</div></div>`;
  }).join('')}</div>`;
  return h;
}

// ---------- Aufgaben ----------
function aufgabenHTML() {
  if (ui.auf === 'lernzeit') return studyHTML();
  if (ui.auf === 'ablage') return ablageHTML();
  const t = todayStr();
  if (ui.auf === 'erledigt') {
    const list = db.homework.filter(h => h.done).sort((a, b) => (b.u || 0) - (a.u || 0));
    return list.length ? `<div class="stack">${list.slice(0, 80).map(hwItem).join('')}</div>${list.length > 80 ? '<p class="small muted">Nur die letzten 80 werden angezeigt.</p>' : ''}` : `<div class="empty">Noch nichts erledigt.</div>`;
  }
  const open = db.homework.filter(h => !h.done).sort((a, b) => (a.due || '9') < (b.due || '9') ? -1 : 1);
  if (!open.length) return `<div class="empty">Alles erledigt! 🎉<br><br><button class="btn" data-a="newHw">Aufgabe eintragen</button></div>`;
  const groups = [['Überfällig', h => h.due && h.due < t], ['Heute', h => h.due === t], ['Morgen', h => h.due === addDays(t, 1)],
    ['Diese Woche', h => h.due && h.due > addDays(t, 1) && h.due <= addDays(mondayOf(t), 6)], ['Später', h => h.due && h.due > addDays(mondayOf(t), 6)], ['Ohne Datum', h => !h.due]];
  let h = '', used = new Set();
  groups.forEach(([name, fn]) => {
    const list = open.filter(x => !used.has(x.id) && fn(x)); list.forEach(x => used.add(x.id));
    if (list.length) h += `<div class="hgroup" style="${name === 'Überfällig' ? 'color:var(--danger)' : ''}">${name} <span class="sec" style="margin:0"><span class="cnt">${list.length}</span></span></div><div class="stack">${list.map(hwItem).join('')}</div>`;
  });
  return h;
}
function timerElapsed() { const tm = local.timer; if (!tm) return 0; return (tm.acc || 0) + (tm.running ? Date.now() - tm.start : 0); }
const fmtClock = ms => { const s = Math.floor(ms / 1000); return (s >= 3600 ? Math.floor(s / 3600) + ':' : '') + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); };
const fmtMin = m => m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60 ? (m % 60) + ' min' : '') : m + ' min';
function studyHTML() {
  const tm = local.timer, s = tm ? subj(tm.subject) : null;
  let h = `<div class="card timer"><div class="clock" id="clock">${fmtClock(timerElapsed())}</div>`;
  if (tm) h += `<div class="subj"><i class="dot" style="--c:${s.color}"></i> ${esc(s.name || 'Allgemein')}${tm.running ? ' · läuft' : ' · pausiert'}</div>
    <div class="btns">${tm.running ? '<button class="btn ghost" data-a="tPause">Pause</button>' : '<button class="btn" data-a="tResume">Weiter</button>'}<button class="btn good" data-a="tStop">Fertig & speichern</button><button class="btn danger" data-a="tCancel">Verwerfen</button></div>`;
  else h += `<div class="subj">Wähle ein Fach und starte die Lernzeit</div><div class="hscroll" style="margin-top:12px;justify-content:flex-start">${db.subjects.map(x => `<button class="chip" data-a="tStart" data-v="${x.id}"><i class="dot" style="--c:${x.color}"></i>${esc(x.name)}</button>`).join('')}</div>`;
  h += `</div>`;
  // Statistik
  const t = todayStr(), mon = mondayOf(t);
  const week = db.study.filter(x => x.date >= mon), month = db.study.filter(x => x.date >= addDays(t, -29));
  const sum = l => l.reduce((a, x) => a + (+x.min || 0), 0);
  let streak = 0; for (let d = t; streak < 400; d = addDays(d, -1)) { if (db.study.some(x => x.date === d)) streak++; else if (d !== t) break; }
  h += `<div class="stats" style="margin-top:12px"><div class="stat"><b>${fmtMin(sum(week))}</b><span>diese Woche</span></div><div class="stat"><b>${fmtMin(sum(month))}</b><span>30 Tage</span></div><div class="stat"><b>${streak}</b><span>Tage am Stück</span></div></div>`;
  const per = {}; month.forEach(x => per[x.subject] = (per[x.subject] || 0) + (+x.min || 0));
  const rows = Object.entries(per).sort((a, b) => b[1] - a[1]); const max = Math.max(1, ...rows.map(r => r[1]));
  if (rows.length) h += `<div class="sec">Lernzeit pro Fach · 30 Tage</div><div class="card">${rows.map(([sid, m]) => { const x = subj(sid); return `<div class="hbar"><span class="n"><i class="dot" style="--c:${x.color}"></i>${esc(x.name || 'Allgemein')}</span><span class="tr"><i style="width:${Math.round(m / max * 100)}%"></i></span><span class="v">${fmtMin(m)}</span></div>`; }).join('')}</div>`;
  const recent = db.study.slice().sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 12);
  if (recent.length) h += `<div class="sec">Letzte Einheiten</div><div class="card lcard">${recent.map(x => `<div class="frow" data-a="studyEdit" data-v="${x.id}" style="cursor:pointer"><i class="dot" style="--c:${subj(x.subject).color}"></i><div><div class="fn">${esc(subj(x.subject).name || 'Allgemein')}</div><div class="fd">${fmtShort(x.date)}</div></div><div class="fs">${fmtMin(+x.min)}</div></div>`).join('')}</div>`;
  h += `<button class="addline" data-a="studyAdd">${ICON.plus} Lernzeit nachtragen</button>`;
  return h;
}

// ---------- Lehrgänge (Rodeln & Co.) ----------
function campStatus(c) {
  const t = todayStr(), end = c.end || c.start;
  if (t < c.start) return { k: 'future', txt: 'in ' + diffDays(t, c.start) + ' Tag' + (diffDays(t, c.start) === 1 ? '' : 'en') };
  if (t > end) return { k: 'past', txt: 'vorbei' };
  return { k: 'now', txt: 'Tag ' + (diffDays(c.start, t) + 1) + ' von ' + (diffDays(c.start, end) + 1) };
}
const campTasks = id => db.homework.filter(h => h.campId === id);
function campHomeCard(t) {
  const now = db.camps.filter(c => c.start <= t && (c.end || c.start) >= t);
  const soon = db.camps.filter(c => c.start > t && diffDays(t, c.start) <= 21).sort((a, b) => a.start < b.start ? -1 : 1);
  const back = db.camps.filter(c => (c.end || c.start) < t && diffDays(c.end || c.start, t) <= 14 && (campTasks(c.id).some(h => !h.done || !h.handed) || Object.values(c.missed || {}).some(m => !m.done)));
  return [...now, ...soon.slice(0, 1), ...back.slice(0, 1)].map(c => {
    const st = campStatus(c), tasks = campTasks(c.id), open = tasks.filter(h => !h.done).length;
    const ck = c.checklist || [], ckDone = ck.filter(x => x.d).length;
    let sub;
    if (st.k === 'now') sub = `${open ? open + ' Aufgabe' + (open > 1 ? 'n' : '') + ' offen' : 'Keine offenen Aufgaben'} · bis ${fmtShort(c.end || c.start)}`;
    else if (st.k === 'future') sub = `Checkliste ${ckDone}/${ck.length} · ${tasks.length} Aufgaben eingetragen`;
    else { const m = campMissed(c), nach = Object.entries(m.per).filter(([sid]) => !(c.missed || {})[sid]?.done).length; sub = `Zurück in der Schule – ${nach ? nach + ' Fächer nachholen' : ''}${nach && tasks.some(h => !h.handed) ? ', ' : ''}${tasks.some(h => !h.handed) ? tasks.filter(h => !h.handed).length + ' Aufgaben abgeben' : ''}`; }
    return `<div class="card camp-home" data-a="campOpen" data-v="${c.id}" role="button" tabindex="0"><div class="ic">🛷</div><div class="grow1"><div class="st-t">${esc(c.title || CAMP_KINDS[c.kind])} · ${st.k === 'now' ? st.txt : st.k === 'future' ? 'startet ' + st.txt : 'Nachbereitung'}</div><div class="st-s">${sub}</div></div><span class="muted">›</span></div>`;
  }).join('');
}
function campCard(c) {
  const st = campStatus(c), tasks = campTasks(c.id), done = tasks.filter(h => h.done).length, m = campMissed(c);
  const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  return `<div class="card campcard ${st.k}" data-a="campOpen" data-v="${c.id}" role="button" tabindex="0">
    <div class="row"><span class="pill" style="--c:${TYPES.camp.color}">${esc(CAMP_KINDS[c.kind] || 'Lehrgang')}</span><span class="grow1"></span><span class="small" style="font-weight:700;color:${st.k === 'now' ? 'var(--accent)' : 'var(--muted)'}">${st.txt}</span></div>
    <div class="ct">${esc(c.title || 'Lehrgang')}</div>
    <div class="small muted">${fmtShort(c.start)}${c.end && c.end > c.start ? ' – ' + fmtShort(c.end) + c.end.slice(0, 4) : ''}${c.place ? ' · 📍 ' + esc(c.place) : ''}</div>
    <div class="cstats"><span><b>${m.days}</b> Schultage</span><span><b>${m.lessons}</b> Stunden</span><span><b>${tasks.length - done}</b> offen</span>${m.exams.length ? `<span style="color:var(--danger)"><b>${m.exams.length}</b> Prüfung${m.exams.length > 1 ? 'en' : ''}</span>` : ''}</div>
    ${tasks.length ? `<div class="prog"><i style="width:${Math.max(3, pct)}%"></i></div>` : ''}
  </div>`;
}
function lehrgangHTML() {
  if (ui.camp) { const c = db.camps.find(x => x.id === ui.camp); if (c) return campDetailHTML(c); ui.camp = null; }
  const t = todayStr();
  const list = db.camps.slice().sort((a, b) => a.start < b.start ? -1 : 1);
  const cur = list.filter(c => (c.end || c.start) >= t), past = list.filter(c => (c.end || c.start) < t).reverse();
  let h = '';
  if (!list.length) {
    return `<div class="card tip" style="margin-top:6px"><b>🛷 Lehrgänge & Wettkämpfe</b>
      <div class="small" style="margin-top:6px">Trag hier deine Rodel-Lehrgänge, Trainingslager und Wettkämpfe ein. Die App rechnet aus, welche Schulstunden du verpasst, und du sammelst pro Fach die Aufgaben deiner Lehrkräfte – mit Buchseite und Notizen.</div>
      <ol class="steps"><li>Lehrgang anlegen (Datum, Ort)</li><li>Aufgaben der Lehrkräfte je Fach eintragen</li><li>Während des Lehrgangs abhaken</li><li>Zurück in der Schule: Stoff nachholen & abgeben</li></ol>
      <div class="rowb"><button class="btn" data-a="campNew">Ersten Lehrgang anlegen</button></div></div>`;
  }
  const allTasks = db.homework.filter(x => x.campId);
  const yearDays = db.camps.filter(c => syOf(c.start) === curSy()).reduce((a, c) => a + campMissed(c).days, 0);
  h += `<div class="stats" style="margin-top:4px"><div class="stat"><b>${db.camps.filter(c => syOf(c.start) === curSy()).length}</b><span>Lehrgänge ${curSy()}</span></div><div class="stat"><b>${yearDays}</b><span>Schultage verpasst</span></div><div class="stat"><b>${allTasks.filter(x => !x.done).length}</b><span>Aufgaben offen</span></div></div>`;
  if (cur.length) h += `<div class="sec">Aktuell & geplant</div><div class="stack gridcards">${cur.map(campCard).join('')}</div>`;
  if (past.length) h += `<div class="sec">Vergangen</div><div class="stack gridcards">${past.slice(0, ui.allCamps ? 99 : 5).map(campCard).join('')}</div>${past.length > 5 ? `<button class="linkbtn" data-a="allCamps">${ui.allCamps ? 'Weniger anzeigen' : 'Alle ' + past.length + ' anzeigen'}</button>` : ''}`;
  h += `<button class="addline" data-a="campNew">${ICON.plus} Lehrgang / Wettkampf anlegen</button>`;
  return h;
}
function campDetailHTML(c) {
  const st = campStatus(c), tasks = campTasks(c.id), m = campMissed(c), missed = c.missed || {};
  const f = ui.campFilter || 'alle';
  let h = `<div class="noprint row" style="margin:2px 0 8px"><button class="link" data-a="campBack" style="min-width:0">‹ Alle Lehrgänge</button><span class="grow1"></span><button class="link" data-a="campEdit" data-v="${c.id}" style="min-width:0">Bearbeiten</button></div>`;
  h += `<div class="printtitle">${esc(c.title)} · ${fmtShort(c.start)} – ${fmtShort(c.end || c.start)}</div>`;
  h += `<div class="card camp-hero"><div class="row"><span class="pill" style="--c:${TYPES.camp.color}">${esc(CAMP_KINDS[c.kind] || 'Lehrgang')}</span><span class="grow1"></span><b style="color:${st.k === 'now' ? 'var(--accent)' : 'var(--muted)'};font-size:13px">${st.txt}</b></div>
    <div class="ct">${esc(c.title || 'Lehrgang')}</div>
    <div class="muted">${fmtLong(c.start)}${c.end && c.end > c.start ? ' – ' + fmtLong(c.end, true) : ''}${c.place ? '<br>📍 ' + esc(c.place) : ''}</div>
    ${c.notes ? `<div class="small" style="margin-top:6px">${esc(c.notes)}</div>` : ''}
    <div class="cstats"><span><b>${m.days}</b> Schultage</span><span><b>${m.lessons}</b> Stunden verpasst</span><span><b>${tasks.filter(x => !x.done).length}</b>/${tasks.length} offen</span></div></div>`;
  if (!db.timetable.length) h += `<div class="info noprint" style="margin-top:10px">💡<div>Trag deinen Stundenplan ein – dann rechnet die App automatisch aus, welche Stunden du in welchem Fach verpasst.</div></div>`;
  if (m.exams.length) h += `<div class="sec">Verpasste Prüfungen</div><div class="stack">${m.exams.map(e => `<div class="warn">⚠️<div class="grow1"><b>${esc(evTitle(e))}</b> am ${fmtShort(e.date)}<br><span class="small">Frag nach einem Nachschreibtermin.</span></div><button class="btn ghost noprint" data-a="nachschreiben" data-v="${e.id}" style="align-self:center;padding:7px 10px;font-size:13px">Termin eintragen</button></div>`).join('')}</div>`;
  // Fächer
  const hid = new Set(c.hidden || []);
  const sids = new Set([...Object.keys(m.per).filter(k => !hid.has(k)), ...tasks.map(x => x.subject || ''), ...Object.keys(missed).filter(k => missed[k].note), ...(c.subjects || [])]);
  const order = db.subjects.map(s => s.id).filter(id => sids.has(id)); if (sids.has('')) order.push('');
  h += `<div class="sec">Aufgaben & verpasster Stoff <span class="cnt">${order.length} Fächer</span></div>`;
  h += `<div class="seg noprint" style="margin-top:0">${[['alle', 'Alle'], ['offen', 'Offen'], ['erledigt', 'Erledigt']].map(([k, l]) => `<button class="${f === k ? 'on' : ''}" data-a="campFilter" data-v="${k}">${l}</button>`).join('')}</div>`;
  h += `<div class="gridcards">`;
  if (!order.length) h += `<div class="empty">Noch keine Aufgaben. Tippe unten auf „Aufgabe hinzufügen“ und wähle das Fach.</div>`;
  order.forEach(sid => {
    const s = subj(sid), ms = missed[sid] || {}, les = m.per[sid] || 0;
    let list = tasks.filter(x => (x.subject || '') === sid).sort((a, b) => (a.due || '9') < (b.due || '9') ? -1 : 1);
    const openN = list.filter(x => !x.done).length;
    if (f === 'offen') list = list.filter(x => !x.done); else if (f === 'erledigt') list = list.filter(x => x.done);
    if (f !== 'alle' && !list.length && !(f === 'offen' && les && !ms.done)) return;
    h += `<div class="card subjblock" style="--c:${s.color}"><div class="sbh"><i class="dot" style="--c:${s.color}"></i><b class="grow1">${esc(s.name || 'Ohne Fach')}</b>${s.teacher ? `<span class="small muted">${esc(s.teacher)}</span>` : ''}<button class="chip sm noprint" data-a="campTaskAdd" data-v="${sid}">+ Aufgabe</button>${sid && !tasks.some(x => (x.subject || '') === sid) && !ms.note ? `<button class="chip sm noprint" data-a="campSubjDel" data-v="${sid}" aria-label="Fach ausblenden" title="Fach ausblenden">✕</button>` : ''}</div>
      <div class="sbm small">${les ? `<span>${les} Stunde${les > 1 ? 'n' : ''} verpasst</span>` : ''}${list.length || openN ? `<span>${openN} offen</span>` : ''}</div>`;
    h += list.length ? `<div class="stack" style="margin-top:8px">${list.map(x => hwItem(x, { campBadge: false })).join('')}</div>` : '';
    if (les || ms.note || ms.done) h += `<div class="nachholen"><label class="row" style="gap:10px;cursor:pointer"><input type="checkbox" class="tgl" data-mdone="${sid}"${ms.done ? ' checked' : ''}><span class="grow1"><b>Stoff nachgeholt</b>${ms.done ? '' : '<span class="small muted"> · Hefteinträge, Arbeitsblätter</span>'}</span></label>
      ${list.length || ms.note || ui.noteOpen === sid ? `<input class="inp" data-mnote="${sid}" value="${esc(ms.note || '')}" placeholder="Wie? z. B. Heft von Lisa abfotografieren" style="margin-top:8px">` : `<button class="link noprint" data-a="noteOpen" data-v="${sid}" style="min-width:0;padding:6px 0 0;font-size:13px">+ Notiz, wie ich es nachhole</button>`}</div>`;
    h += `</div>`;
  });
  h += `</div>`;
  const rest = db.subjects.filter(s => !sids.has(s.id));
  h += `<div class="noprint" style="margin-top:8px"><button class="btn ghost wide" data-a="campSubjPick">${ui.campSubjPick ? 'Schließen' : '+ Fach hinzufügen / wieder einblenden'}</button>${ui.campSubjPick ? `<div class="chips" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">${rest.map(s => `<button class="chip" style="--c:${s.color}" data-a="campSubjAdd" data-v="${s.id}"><i class="dot" style="--c:${s.color}"></i> ${esc(s.name)}</button>`).join('') || '<span class="small muted">Alle Fächer sind schon da.</span>'}</div>` : ''}</div>`;
  h += `<button class="btn wide noprint" style="margin-top:8px" data-a="campTaskAdd" data-v="">+ Aufgabe hinzufügen</button>`;
  // Unterlagen
  const cdocs = db.docs.filter(d => d.campId === c.id && !d.hwId);
  h += `<div class="sec">Unterlagen & Arbeitsblätter <span class="cnt">${cdocs.length}</span></div>${cdocs.length ? `<div class="stack gridcards">${cdocs.map(d => docRow(d, { noLink: true })).join('')}</div>` : ''}<div class="row noprint" style="gap:8px;margin-top:8px"><button class="btn ghost" data-a="attScan" data-v="campId:${c.id}:">📷 Scannen</button><button class="btn ghost" data-a="attFile" data-v="campId:${c.id}:">📄 Datei</button></div>`;
  // Checkliste
  const ck = c.checklist || [];
  h += `<div class="sec">Checkliste <span class="cnt">${ck.filter(x => x.d).length}/${ck.length}</span></div><div class="card lcard">${ck.map(x => `<div class="grow"><button class="chk sm${x.d ? ' on' : ''}" data-a="ckToggle" data-v="${x.id}" aria-label="Abhaken">${ICON.check}</button><span class="grow1" style="${x.d ? 'text-decoration:line-through;color:var(--muted)' : ''}">${esc(x.t)}</span><button class="ib noprint" data-a="ckDel" data-v="${x.id}" aria-label="Entfernen">${ICON.trash}</button></div>`).join('')}
    <div class="grow noprint"><input class="inp" id="ckNew" placeholder="Eigenen Punkt hinzufügen" enterkeyhint="done"><button class="btn" data-a="ckAdd">+</button></div></div>`;
  h += `<div class="actions noprint"><button class="btn ghost" data-a="campShare">Übersicht teilen</button><button class="btn ghost" data-a="print">Als PDF / Drucken</button></div>`;
  return h;
}

// ---------- Ablage-Ansicht ----------
function docRow(d, o = {}) {
  const s = subj(d.subject);
  const hw = d.hwId && db.homework.find(x => x.id === d.hwId), ev = d.eventId && db.events.find(x => x.id === d.eventId), cp = d.campId && db.camps.find(x => x.id === d.campId);
  const link = hw ? '📝 ' + (hw.text || HW_KINDS[hw.kind]) : ev ? '📅 ' + evTitle(ev) : cp ? '🛷 ' + cp.title : '';
  const meta = [s.name && o.noSubj !== true ? `<span class="row" style="gap:5px"><i class="dot" style="--c:${s.color}"></i>${esc(s.name)}</span>` : '', fmtShort(d.created), fmtSize(d.size), link && !o.noLink ? esc(link) : '', !LOCAL_FILES.has(d.id) ? '☁️ Cloud' : ''].filter(Boolean);
  return `<div class="docrow" role="button" tabindex="0" data-a="docOpen" data-v="${d.id}"><div class="dicon ${isPdf(d) ? 'pdf' : 'img'}">${isPdf(d) ? 'PDF' : 'BILD'}</div><div class="grow1" style="min-width:0"><div class="dn">${esc(d.name)}</div><div class="dm">${meta.join(' · ')}</div></div><span class="muted">›</span></div>`;
}
function ablageHTML() {
  const f = ui.docSubj || 'all', q = (ui.docSearch || '').trim().toLowerCase();
  const used = [...new Set(db.docs.map(d => d.subject || ''))];
  let list = db.docs.slice().sort((a, b) => (b.u || 0) - (a.u || 0));
  if (f !== 'all') list = list.filter(d => (d.subject || '') === (f === 'none' ? '' : f));
  if (q) list = list.filter(d => [d.name, d.notes, subj(d.subject).name].join(' ').toLowerCase().includes(q));
  let h = `<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" data-a="scanNew">📷 Arbeitsblatt scannen</button><button class="btn ghost" data-a="docAdd">📄 PDF / Bild hinzufügen</button></div>`;
  h += `<div class="small muted" id="storeInfo" style="margin:8px 2px 0">${db.docs.length} Dateien</div>`;
  if (db.docs.length) {
    h += `<input class="inp" type="search" data-f="docsearch" value="${esc(ui.docSearch || '')}" placeholder="Suchen: Name, Fach, Notiz …" style="margin-top:10px;background:var(--surface)">`;
    h += `<div class="hscroll" style="margin-top:8px"><button class="chip sm${f === 'all' ? ' on' : ''}" data-a="docSubj" data-v="all">Alle</button>${db.subjects.filter(s => used.includes(s.id)).map(s => `<button class="chip sm${f === s.id ? ' on' : ''}" data-a="docSubj" data-v="${s.id}"><i class="dot" style="--c:${s.color}"></i>${esc(s.name)}</button>`).join('')}${used.includes('') ? `<button class="chip sm${f === 'none' ? ' on' : ''}" data-a="docSubj" data-v="none">Ohne Fach</button>` : ''}</div>`;
    h += `<div id="docList" class="stack gridcards" style="margin-top:10px">${list.map(d => docRow(d)).join('') || '<div class="empty">Nichts gefunden.</div>'}</div>`;
  } else {
    h += `<div class="card tip" style="margin-top:12px"><b>Deine Ablage für Arbeitsblätter</b><div class="small" style="margin-top:4px">
      📷 <b>Scannen:</b> Arbeitsblatt fotografieren – mehrere Seiten werden zu einem PDF.<br>
      📄 <b>Hinzufügen:</b> PDFs oder Bilder vom Handy auswählen.<br>
      📲 <b>Von anderen Apps:</b> In WhatsApp, E-Mail oder Drive auf „Teilen“ → „Lernplan“ tippen (in der installierten App).<br>
      🔗 Dateien lassen sich Fächern, Hausaufgaben, Prüfungen und Lehrgängen zuordnen.</div></div>`;
  }
  return h;
}
async function updateStoreInfo() {
  const el = $('#storeInfo'); if (!el) return;
  let txt = db.docs.length + ' Dateien';
  try { const e = await navigator.storage.estimate(); txt += ` · ${fmtSize(e.usage || 0)} belegt${e.quota ? ' von ' + fmtSize(e.quota) : ''}`; } catch (err) { /* */ }
  if (Sync.configured()) { const n = db.docs.filter(d => !d.remote).length; txt += n ? ` · ${n} noch nicht hochgeladen` : ' · ☁️ alle synchronisiert'; }
  el.textContent = txt;
}
function attachHTML(key, id, subject) {
  const ds = docsFor(key, id);
  return `<label class="fl">Dateien & Fotos${ds.length ? ' · ' + ds.length : ''}</label>${ds.length ? `<div class="stack">${ds.map(d => docRow(d, { noLink: true })).join('')}</div>` : ''}
    <div class="row" style="gap:8px;margin-top:8px"><button class="btn ghost" data-a="attScan" data-v="${key}:${id}:${subject || ''}">📷 Foto / Scan</button><button class="btn ghost" data-a="attFile" data-v="${key}:${id}:${subject || ''}">📄 Datei anhängen</button></div>`;
}

// ---------- Scanner: Fotos → PDF ----------
let pendingAttach = null;
function reopener() { // merkt sich das aktuelle Formular, um nach dem Scannen dorthin zurückzukehren
  const ps = formState, pm = sheetMode;
  const html = { form: formHTML, hw: hwFormHTML }[pm];
  if (!html) return null;
  return () => { formState = ps; openSheet(html(), pm); };
}
function openScan(link = {}) {
  const ret = sheetOpen ? reopener() : null;
  (formState && formState._scan ? formState.pages : []).forEach(p => URL.revokeObjectURL(p.url));
  formState = { _scan: true, pages: [], originals: [], docMode: true, subject: link.subject || '', name: '', hwId: link.hwId || '', eventId: link.eventId || '', campId: link.campId || '' };
  sheetReturn = ret;
  openSheet(scanHTML(), 'scan');
}
function scanHTML() {
  const f = formState;
  const def = 'Arbeitsblatt' + (subj(f.subject).name ? ' ' + subj(f.subject).name : '') + ' ' + fmtDM(todayStr()).replace(/\.$/, '');
  let h = sheetHead('Arbeitsblatt scannen', f.pages.length ? '<button class="btn" data-a="scanSave">Speichern</button>' : '', `<button class="link" data-a="close">${sheetReturn ? 'Zurück' : 'Abbrechen'}</button>`);
  h += `<div class="scanpages">${f.pages.map((p, i) => `<div class="spage"><img src="${p.url}" alt="Seite ${i + 1}"><span>${i + 1}</span><button data-a="scanDel" data-v="${i}" aria-label="Seite entfernen">×</button></div>`).join('')}
    <button class="spage add" data-a="scanCam"><b>📷</b>${f.pages.length ? 'Nächste Seite' : 'Seite fotografieren'}</button></div>
    <div class="row" style="gap:8px;margin-top:10px"><button class="btn ghost grow1" data-a="scanGal">🖼️ Aus Galerie</button></div>
    <label class="switch"><span>Dokument-Modus<small>schwarz-weiß & kontrastreich – besser lesbar, kleinere Datei</small></span><input type="checkbox" class="tgl" data-f="scanmode"${f.docMode ? ' checked' : ''}></label>
    <label class="fl">Name</label><input class="inp" data-f="scanname" value="${esc(f.name)}" placeholder="${esc(def)}">
    <label class="fl">Fach</label>${subjChips(f.subject, 'scanSubj', true)}`;
  if (f.pages.length) h += `<button class="btn wide" data-a="scanSave">Als PDF speichern (${f.pages.length} Seite${f.pages.length > 1 ? 'n' : ''})</button>`;
  return h;
}
async function scanAddFiles(files) {
  const f = formState; if (!f || !f._scan) return;
  for (const file of files) {
    try { const im = await processImage(file, f.docMode); f.pages.push({ ...im, url: URL.createObjectURL(im.blob) }); f.originals.push(file); }
    catch (e) { toast('Bild konnte nicht gelesen werden'); }
  }
  openSheet(scanHTML(), 'scan');
}
async function scanReprocess() {
  const f = formState; toast('Wird neu berechnet …');
  f.pages.forEach(p => URL.revokeObjectURL(p.url)); f.pages = [];
  for (const file of f.originals) { const im = await processImage(file, f.docMode); f.pages.push({ ...im, url: URL.createObjectURL(im.blob) }); }
  openSheet(scanHTML(), 'scan');
}
async function scanSave() {
  const f = formState; if (!f.pages.length) return;
  const name = (f.name.trim() || ('Arbeitsblatt' + (subj(f.subject).name ? ' ' + subj(f.subject).name : '') + ' ' + fmtDM(todayStr()).replace(/\.$/, ''))).replace(/\.pdf$/i, '') + '.pdf';
  try {
    const pdf = await pdfFromImages(f.pages);
    await addDoc(pdf, { name, subject: f.subject, hwId: f.hwId, eventId: f.eventId, campId: f.campId });
    f.pages.forEach(p => URL.revokeObjectURL(p.url));
    toast('Gespeichert: ' + name);
    const ret = sheetReturn; sheetReturn = null;
    if (ret) { formState = null; ret(); const ff = $('#ff'); if (ff && sheetMode === 'hw') ff.innerHTML = hwFieldsHTML(); if (ff && sheetMode === 'form') renderFormFields(); }
    else { closeSheet(); render(); }
  } catch (e) { toast('Speichern fehlgeschlagen: ' + (e.message || e)); }
}
async function addFilesTo(files, link) {
  let n = 0;
  for (const file of files) {
    try {
      let blob = file, name = file.name || 'Datei';
      if (/^image\//.test(file.type) && file.size > 600000) { const im = await processImage(file, false); blob = im.blob; name = name.replace(/\.\w+$/, '') + '.jpg'; }
      await addDoc(blob, { name, type: file.type, ...link }); n++;
    } catch (e) { toast('„' + file.name + '“ konnte nicht gespeichert werden'); }
  }
  if (n) toast(n === 1 ? 'Datei abgelegt' : n + ' Dateien abgelegt');
  return n;
}

// ---------- Dateiansicht ----------
let viewerURL = null, viewerZoom = 1;
async function openDoc(id) {
  const d = db.docs.find(x => x.id === id); if (!d) return;
  const ret = sheetOpen && sheetMode !== 'doc' ? (sheetMode && sheetMode.startsWith('subject:') ? (() => { const sid = sheetMode.slice(8); return () => openSubject(sid); })() : reopener()) : null;
  formState = { ...d, _doc: true }; sheetReturn = ret; viewerZoom = 1;
  openSheet(docHTML(), 'doc');
  showDocContent();
}
function docHTML() {
  const d = formState;
  const hwList = db.homework.filter(h => !h.done || h.id === d.hwId).slice(-40);
  const evList = db.events.filter(e => isExam(e) && (e.date >= addDays(todayStr(), -30) || e.id === d.eventId));
  return sheetHead(esc(d.name), '<button class="btn" data-a="docSave">Fertig</button>', `<button class="link" data-a="close">${sheetReturn ? 'Zurück' : 'Schließen'}</button>`) +
    `<div class="docview" id="docView"><div class="empty">Wird geladen …</div></div>
    <div class="row noprint" style="gap:8px;margin-top:8px;flex-wrap:wrap">${isPdf(d) ? '<button class="btn ghost" data-a="docZoom" data-v="-1">−</button><button class="btn ghost" data-a="docZoom" data-v="1">+</button>' : ''}<button class="btn ghost" data-a="docShare">Teilen / Öffnen mit …</button><button class="btn ghost" data-a="docDownload">Herunterladen</button></div>
    <div class="small muted" style="margin-top:6px">${fmtSize(d.size)} · abgelegt ${fmtShort(d.created)}${d.remote ? ' · ☁️ synchronisiert' : ''}</div>
    <label class="fl">Name</label><input class="inp" data-f="docname" value="${esc(d.name)}">
    <label class="fl">Fach</label>${subjChips(d.subject, 'docSubjSet', true)}
    <div class="row2"><div><label class="fl">Gehört zu Aufgabe</label><select class="inp" data-f="dochw"><option value="">–</option>${hwList.map(h => `<option value="${h.id}"${h.id === d.hwId ? ' selected' : ''}>${esc((subj(h.subject).short ? subj(h.subject).short + ': ' : '') + (h.text || HW_KINDS[h.kind]).slice(0, 40))}</option>`).join('')}</select></div>
    <div><label class="fl">Gehört zu Prüfung</label><select class="inp" data-f="docev"><option value="">–</option>${evList.map(e => `<option value="${e.id}"${e.id === d.eventId ? ' selected' : ''}>${esc(evTitle(e))} (${fmtDM(e.date)})</option>`).join('')}</select></div></div>
    ${db.camps.length ? `<label class="fl">Gehört zu Lehrgang</label><select class="inp" data-f="doccamp"><option value="">–</option>${db.camps.map(c => `<option value="${c.id}"${c.id === d.campId ? ' selected' : ''}>${esc(c.title)}</option>`).join('')}</select>` : ''}
    <label class="fl">Notiz</label><input class="inp" data-f="docnotes" value="${esc(d.notes || '')}" placeholder="z. B. Lösungen auf Seite 2">
    <div class="actions"><button class="btn danger" data-a="docDel">Datei löschen</button></div>`;
}
async function showDocContent() {
  const d = formState, el = $('#docView'); if (!el || !d) return;
  const blob = await docBlob(d);
  if (!$('#docView')) return;
  if (!blob) { el.innerHTML = `<div class="warn">⚠️<div>Die Datei ist auf diesem Gerät nicht gespeichert${d.remote ? ' und konnte gerade nicht geladen werden (offline?)' : ''}.</div></div>`; return; }
  if (viewerURL) URL.revokeObjectURL(viewerURL); viewerURL = URL.createObjectURL(blob);
  if (!isPdf(d)) { el.innerHTML = `<img src="${viewerURL}" alt="${esc(d.name)}" style="width:${Math.round(100 * viewerZoom)}%">`; return; }
  el.innerHTML = '<div class="empty">PDF wird angezeigt …</div>';
  try {
    const lib = await loadPdfJs();
    const pdf = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
    if (!$('#docView')) return;
    el.innerHTML = '';
    const w = Math.max(280, el.clientWidth - 4), dpr = Math.min(2, window.devicePixelRatio || 1);
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i), vp0 = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: (w / vp0.width) * viewerZoom * dpr });
      const cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height; cv.style.width = (vp.width / dpr) + 'px';
      if (!el.isConnected) return; el.appendChild(cv);
      await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
    }
  } catch (e) { el.innerHTML = `<div class="warn">⚠️<div>${esc(e.message || 'PDF konnte nicht angezeigt werden.')} Tippe auf „Teilen / Öffnen mit …“, um sie in einer anderen App zu öffnen.</div></div>`; }
}
async function shareDoc() {
  const d = formState, blob = await docBlob(d); if (!blob) return;
  const file = new File([blob], d.name, { type: d.type });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: d.name }); return; } } catch (e) { return; }
  downloadBlob(d.name, blob);
}
function downloadBlob(name, blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
function saveDocMeta() {
  const { _doc, ...d } = formState; d.name = (d.name || '').trim() || 'Datei';
  upsert('docs', d); save();
  const ret = sheetReturn; sheetReturn = null;
  if (viewerURL) { URL.revokeObjectURL(viewerURL); viewerURL = null; }
  if (ret) { formState = null; ret(); const ff = $('#ff'); if (ff && sheetMode === 'hw') ff.innerHTML = hwFieldsHTML(); if (ff && sheetMode === 'form') renderFormFields(); } else { closeSheet(); render(); }
}
async function handleSharedInbox() { // Dateien, die über Android „Teilen“ kamen
  let items = []; try { items = await FileDB.inbox(); } catch (e) { return; }
  if (!items.length) return;
  let n = 0;
  for (const it of items) for (const f of (it.files || [])) { await addDoc(f, { name: f.name, type: f.type, notes: it.text || it.title || '' }); n++; }
  ui.view = 'aufgaben'; ui.auf = 'ablage'; render();
  toast(n === 1 ? '1 Datei in die Ablage übernommen – tippe sie an, um ein Fach zuzuordnen' : n + ' Dateien in die Ablage übernommen');
}

// ---------- Lernplan-Generator ----------
function planItems(eid) { return db.homework.filter(h => h.planFor === eid); }
function openPlanGen(eid) {
  const e = db.events.find(x => x.id === eid); if (!e) return;
  const t = todayStr(), ls = learnStart(e);
  const topics = (e.notes || '').split(/\n|;|,(?![^(]*\))/).map(s => s.replace(/^[-•*\d.)\s]+/, '').trim()).filter(s => s.length > 1);
  const ret = sheetOpen ? reopener() : null;
  formState = { _plan: true, eventId: eid, topics: topics.join('\n'), start: ls > t && ls < e.date ? ls : t, min: 30, weekends: true, skipExams: true, skipCamps: false };
  sheetReturn = ret;
  openSheet(planGenHTML(), 'plangen');
}
function planDays(f, e) {
  const days = [];
  for (let d = f.start; d < e.date; d = addDays(d, 1)) {
    const w = dow(d);
    if (!f.weekends && (w === 0 || w === 6)) continue;
    if (f.skipExams && allEvents().some(x => x.id !== e.id && isExam(x) && x.date === d)) continue;
    if (f.skipCamps && campOn(d).length) continue;
    days.push(d);
  }
  return days;
}
// Lernplan nach Studienlage: Stoff verteilen (verteiltes Lernen), jedes Thema nach etwa 1 und 3 Tagen
// mit Selbsttest wiederholen (Abrufübung statt nur Durchlesen) und am Ende eine Generalprobe.
// Grundlagen: Cepeda et al. 2006 (Spacing), Roediger & Karpicke 2006 (Testing-Effekt), Dunlosky et al. 2013.
function planBuild(f, e) {
  const days = planDays(f, e);
  let topics = f.topics.split('\n').map(s => s.trim()).filter(Boolean);
  if (!topics.length) topics = ['Stoff wiederholen'];
  if (!days.length) return [];
  if (days.length === 1) return [{ date: days[0], text: 'Alles wiederholen: ' + topics.join(', ') + ' – mit Probeaufgaben' }];
  const study = days.slice(0, -1), n = study.length, slots = study.map(() => ({ neu: [], rep: [] }));
  // Neue Themen auf die ersten zwei Drittel verteilen, damit danach Zeit zum Wiederholen bleibt
  const span = Math.max(1, Math.min(n, Math.ceil(n * (n >= 4 ? 0.67 : 1))));
  topics.forEach((tp, i) => {
    const at = Math.min(span - 1, Math.floor(i * span / topics.length));
    slots[at].neu.push(tp);
    [1, 3].forEach(gap => { const r = at + gap; if (r < n) slots[r].rep.push(tp); });
  });
  const out = [];
  slots.forEach((sl, i) => {
    const parts = [];
    if (sl.neu.length) parts.push(sl.neu.join(', '));
    if (sl.rep.length) parts.push('Selbsttest: ' + sl.rep.join(', '));
    if (parts.length) out.push({ date: study[i], text: parts.join(' · ') });
  });
  out.push({ date: days[days.length - 1], text: 'Generalprobe: Probeaufgaben ohne Hilfe lösen, dann gezielt die Lücken wiederholen', final: true });
  return out;
}
function planGenHTML() {
  const f = formState, e = db.events.find(x => x.id === f.eventId);
  const plan = planBuild(f, e), old = planItems(e.id);
  let h = sheetHead('Lernplan erstellen', '<button class="btn" data-a="planDo">Übernehmen</button>', `<button class="link" data-a="close">${sheetReturn ? 'Zurück' : 'Abbrechen'}</button>`);
  h += `<div class="info">📅<div><b>${esc(evTitle(e))}</b> am ${fmtLong(e.date)}. Die App verteilt deinen Lernstoff auf die Tage davor, fragt jedes Thema nach etwa einem und drei Tagen im <b>Selbsttest</b> wieder ab und plant am Ende eine Generalprobe ein. Abfragen statt nur Durchlesen und verteilte Wiederholung sind die beiden am besten belegten Lernmethoden.</div></div>
    <label class="fl">Lernstoff – ein Thema pro Zeile</label><textarea class="inp" data-f="pltopics" style="min-height:110px" placeholder="z. B.&#10;Lineare Funktionen&#10;Steigung berechnen&#10;Textaufgaben">${esc(f.topics)}</textarea>
    <div class="row2"><div><label class="fl">Start</label><input type="date" class="inp" data-f="plstart" value="${f.start}" max="${addDays(e.date, -1)}"></div><div><label class="fl">Pro Tag</label><select class="inp" data-f="plmin">${[15, 20, 30, 45, 60, 90].map(m => `<option value="${m}"${+f.min === m ? ' selected' : ''}>${m} Minuten</option>`).join('')}</select></div></div>
    <label class="switch"><span>Wochenenden einplanen</span><input type="checkbox" class="tgl" data-f="plwe"${f.weekends ? ' checked' : ''}></label>
    <label class="switch"><span>Tage mit anderen Prüfungen auslassen</span><input type="checkbox" class="tgl" data-f="plex"${f.skipExams ? ' checked' : ''}></label>
    ${db.camps.length ? `<label class="switch"><span>Lehrgangstage auslassen</span><input type="checkbox" class="tgl" data-f="plcamp"${f.skipCamps ? ' checked' : ''}></label>` : ''}
    <div class="sh">Vorschau · ${plan.length} Lerneinheiten</div>`;
  h += plan.length ? `<div class="card lcard">${plan.map(p => `<div class="grow"><b style="width:74px;flex:none">${fmtShort(p.date)}</b><span class="grow1"${p.final ? ' style="font-weight:700"' : ''}>${esc(p.text)}</span><span class="small muted">${f.min} Min</span></div>`).join('')}</div>` : `<div class="warn">⚠️<div>Zwischen Start und Prüfung ist kein Tag frei. Wähle ein früheres Startdatum.</div></div>`;
  if (old.length) h += `<div class="small muted" style="margin-top:8px">Ein bestehender Lernplan (${old.filter(x => x.done).length}/${old.length} erledigt) wird ersetzt – erledigte Einheiten bleiben erhalten.</div>`;
  return h + (plan.length ? '<button class="btn wide" data-a="planDo">Lernplan übernehmen</button>' : '');
}
function planDo() {
  const f = formState, e = db.events.find(x => x.id === f.eventId), plan = planBuild(f, e);
  if (!plan.length) return;
  planItems(e.id).filter(h => !h.done).forEach(h => removeItem('homework', h.id));
  plan.forEach(p => upsert('homework', { id: 'h' + uid(), subject: e.subject, text: 'Lernen: ' + p.text, due: p.date, kind: 'lernen', done: false, page: '', notes: `ca. ${f.min} Min · für ${evTitle(e)} am ${fmtShort(e.date)}`, planFor: e.id, campId: '' }));
  if (!e.prep || learnStart(e) > f.start) upsert('events', { ...e, prep: diffDays(f.start, e.date) });
  save();
  const ret = sheetReturn; sheetReturn = null;
  if (ret) { formState = null; ret(); if (sheetMode === 'form') renderFormFields(); } else { closeSheet(); render(); }
  toast(`Lernplan mit ${plan.length} Einheiten erstellt – sie stehen unter Aufgaben`);
}

// ---------- „Morgen“: Schultasche & Vorbereitung ----------
function tomorrowDay() { return nextSchoolDay(todayStr()); }
function morgenCard(t) {
  const d = tomorrowDay(), n = diffDays(t, d);
  const ls = lessonsOn(d), subs = [...new Set(ls.map(l => l.subject))];
  const hw = db.homework.filter(h => !h.done && h.due === d), ex = allEvents().filter(e => isExam(e) && e.date === d);
  const pack = (local.pack || {})[d] || {}, packed = subs.filter(s => pack[s]).length;
  if (!ls.length && !hw.length && !ex.length) return '';
  const bits = []; if (ls.length) bits.push(ls.length + ' Stunden'); if (hw.length) bits.push(hw.length + ' Aufgabe' + (hw.length > 1 ? 'n' : '') + ' fällig'); if (ex.length) bits.push(ex.map(e => TYPES[e.type].short + ' ' + (subj(e.subject).short || '')).join(', '));
  return `<div class="card camp-home morgen-card" data-a="goMorgen" role="button" tabindex="0"><div class="ic">🎒</div><div class="grow1"><div class="st-t">${n === 1 ? 'Morgen' : WDL[dow(d)]} · ${fmtShort(d)}</div><div class="st-s">${bits.join(' · ')}${subs.length ? ` · Tasche ${packed}/${subs.length}` : ''}</div></div><span class="muted">›</span></div>`;
}
function morgenHTML() {
  const t = todayStr(), d = tomorrowDay(), n = diffDays(t, d);
  const ls = lessonsOn(d), subs = [...new Set(ls.map(l => l.subject))], pack = (local.pack || {})[d] || {};
  const hw = db.homework.filter(h => !h.done && h.due === d).sort((a, b) => (a.kind === 'mit' ? -1 : 0) - (b.kind === 'mit' ? -1 : 0));
  const ex = allEvents().filter(e => isExam(e) && e.date === d), other = eventsOn(d).filter(e => !isExam(e) && e.type !== 'frei');
  let h = `<button class="link noprint" data-a="tab" data-v="heute" style="min-width:0">‹ Heute</button>
    <div class="hero"><div class="hwd">${n === 1 ? 'Morgen' : 'Nächster Schultag'}${weekType(d) ? ' · ' + weekType(d) + '-Woche' : ''}</div><div class="big">${fmtLong(d)}</div></div>`;
  const between = FERIEN.find(f => f.start > t && f.start < d);
  if (between) h += `<div class="banner fe">🌴 Vorher: ${between.name} bis ${fmtShort(between.end)}</div>`;
  campOn(d).forEach(c => h += `<div class="banner abs" data-a="campOpen" data-v="${c.id}">🛷 Du bist auf ${esc(c.title)}<span class="sub">Stunden werden verpasst</span></div>`);
  h += `<div class="cols2"><div class="col-l">`;
  if (ex.length) h += `<div class="sec">Prüfungen</div><div class="stack">${ex.map(nextExamCard).join('')}</div>`;
  if (subs.length) {
    const packed = subs.filter(s => pack[s]).length;
    h += `<div class="sec">Schultasche packen <span class="cnt">${packed}/${subs.length}</span>${packed < subs.length ? '<button class="more" data-a="packAll">alles ✓</button>' : ''}</div><div class="card lcard">${subs.map(sid => {
      const s = subj(sid), cnt = ls.filter(l => l.subject === sid).length, pers = ls.filter(l => l.subject === sid).map(l => l.period).join('/');
      const extra = hw.filter(x => x.subject === sid && x.kind === 'mit').map(x => x.text);
      return `<div class="grow" data-a="packToggle" data-v="${sid}" style="cursor:pointer"><button class="chk sm${pack[sid] ? ' on' : ''}" aria-label="Eingepackt">${ICON.check}</button><i class="dot" style="--c:${s.color}"></i><div class="grow1"><div style="font-weight:650${pack[sid] ? ';color:var(--muted);text-decoration:line-through' : ''}">${esc(s.name)}</div><div class="small muted">${pers}. Stunde${cnt > 1 ? 'n' : ''}${s.room ? ' · Raum ' + esc(s.room) : ''}${extra.length ? ' · <b style="color:var(--warnc)">+ ' + extra.map(esc).join(', ') + '</b>' : ''}</div></div></div>`;
    }).join('')}</div>`;
  } else if (!db.timetable.length) h += `<div class="info" style="margin-top:12px">💡<div>Mit Stundenplan siehst du hier, was in die Schultasche muss.</div></div>`;
  h += `</div><div class="col-r">`;
  h += `<div class="sec">Fällig ${n === 1 ? 'morgen' : 'am ' + fmtShort(d)} <span class="cnt">${hw.length}</span></div>${hw.length ? `<div class="stack">${hw.map(hwItem).join('')}</div>` : '<div class="banner school">Keine Aufgaben fällig 👍</div>'}`;
  if (other.length) h += `<div class="sec">Termine</div><div class="stack">${other.map(e => evCard(e, { day: d })).join('')}</div>`;
  const learn = db.homework.filter(x => !x.done && x.kind === 'lernen' && x.due === t);
  if (learn.length) h += `<div class="sec">Heute noch lernen</div><div class="stack">${learn.map(hwItem).join('')}</div>`;
  h += `</div></div>`;
  return h;
}
// ---------- Sheet-Verwaltung ----------
let sheetReturn = null;
function openSheet(html, mode) {
  const w = $('#sheet'), same = sheetOpen && mode === sheetMode, st = same ? $('.sheet')?.scrollTop : 0;
  sheetMode = mode || sheetMode;
  w.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  if (st) $('.sheet').scrollTop = st;
  w.hidden = false; document.body.style.overflow = 'hidden';
  if (!sheetOpen) { history.pushState({ sheet: 1 }, ''); sheetOpen = true; }
}
function closeSheet(fromPop) {
  if (!sheetOpen) return;
  if (sheetReturn && !fromPop) { const fn = sheetReturn; sheetReturn = null; formState = null; fn(); return; }
  sheetReturn = null; sheetOpen = false;
  const w = $('#sheet'); w.hidden = true; w.innerHTML = '';
  document.body.style.overflow = ''; formState = null; sheetMode = null;
  if (!fromPop && history.state && history.state.sheet) history.back();
  render();
}
window.addEventListener('popstate', () => { if (sheetOpen) { sheetReturn = null; closeSheet(true); } });
const sheetHead = (title, right = '<button class="btn" data-a="save">Speichern</button>', left = '<button class="link" data-a="close">Abbrechen</button>') =>
  `<div class="sheet-h">${left}<b>${title}</b>${right || '<span style="min-width:70px"></span>'}</div>`;
const subjChips = (sel, act = 'fsubj', allowNone = false) =>
  `<div class="hscroll">${allowNone ? `<button class="chip${!sel ? ' on' : ''}" data-a="${act}" data-v="">Ohne Fach</button>` : ''}${db.subjects.map(s => `<button class="chip${sel === s.id ? ' on' : ''}" data-a="${act}" data-v="${s.id}"><i class="dot" style="--c:${s.color}"></i>${esc(s.name)}</button>`).join('')}</div>`;

// ---------- Schnelleingabe (wie Notion) ----------
const WD_MAP = { mo: 1, montag: 1, di: 2, dienstag: 2, mi: 3, mittwoch: 3, do: 4, donnerstag: 4, fr: 5, freitag: 5, samstag: 6, sonntag: 0 };
const TYPE_WORDS = {
  sa: ['sa', 'schulaufgabe', 'schulaufgaben', 'klassenarbeit'],
  ka: ['ka', 'kurzarbeit', 'kurzarbeiten'],
  ex: ['ex', 'exen', 'stegreifaufgabe', 'extemporale', 'abfrage'],
  test: ['test', 'tests', 'lzk', 'leistungstest'],
  referat: ['referat', 'präsentation', 'praesentation', 'vortrag', 'kurzreferat'],
  abgabe: ['abgabe', 'projekt', 'portfolio'],
  termin: ['elternabend', 'elternsprechtag', 'sprechstunde', 'ausflug', 'wandertag', 'schulfest', 'klassenfahrt', 'skilager', 'schullandheim', 'theater', 'exkursion', 'termin', 'fototermin', 'sportfest', 'bundesjugendspiele', 'schulgottesdienst', 'infoabend', 'praktikum', 'betriebspraktikum', 'berufsberatung'],
  frei: ['schulfrei', 'frei', 'brückentag', 'brueckentag', 'studientag'],
};
const TITLE_KEEP = new Set(TYPE_WORDS.termin.filter(w => w !== 'termin').concat(['brückentag', 'studientag', 'projekt', 'portfolio']));
const STOP = new Set(['am', 'um', 'im', 'der', 'die', 'das', 'den', 'dem', 'für', 'fuer', 'bis', 'ab', 'uhr', 'in', 'zum', 'zur']);
function matchSubject(w) {
  if (!w) return null;
  for (const s of db.subjects) if (s.name.toLowerCase() === w || (s.short && s.short.toLowerCase() === w)) return s;
  if (w.length >= 3) for (const s of db.subjects) {
    const parts = s.name.toLowerCase().split(/[\s/&]+/).filter(Boolean);
    if (parts.some(p => p.startsWith(w) || (p.length >= 4 && w.startsWith(p)))) return s;
  }
  return null;
}
function parseQuick(text, o = {}) {
  const out = {}, t = todayStr();
  const toks = text.trim().split(/[\s,]+/).filter(Boolean), used = toks.map(() => false);
  let nextWeek = false;
  for (let i = 0; i < toks.length; i++) {
    if (used[i]) continue;
    const raw = toks[i].toLowerCase(), w = raw.replace(/[!?:;.]+$/, '');
    let m = raw.match(/^(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?$/);
    if (m) {
      const d = +m[1], mo = +m[2]; let y = m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : null;
      if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
        if (!y) { y = +t.slice(0, 4); if (diffDays(ds(new Date(y, mo - 1, d)), t) > 60) y++; }
        out.date = ds(new Date(y, mo - 1, d)); used[i] = true; continue;
      }
    }
    m = w.match(/^(\d{1,2})[:h](\d{2})$/) || w.match(/^(\d{1,2})\.(\d{2})$/);
    if (!o.hw && m && +m[1] < 24 && +m[2] < 60) { out.time = pad(+m[1]) + ':' + m[2]; used[i] = true; continue; }
    if (/^\d{1,2}$/.test(w)) {
      const prev = (toks[i - 1] || '').toLowerCase(), next = (toks[i + 1] || '').toLowerCase();
      if (!o.hw && (prev === 'um' || next === 'uhr') && +w < 24) { out.time = pad(+w) + ':00'; used[i] = true; if (prev === 'um') used[i - 1] = true; if (next === 'uhr') used[i + 1] = true; continue; }
      if (prev === 'in' && /^tag/.test(next)) { out.date = addDays(t, +w); used[i - 1] = used[i] = used[i + 1] = true; continue; }
      if (prev === 'in' && /^woche/.test(next)) { out.date = addDays(t, 7 * +w); used[i - 1] = used[i] = used[i + 1] = true; continue; }
    }
    if (w === 'heute') { out.date = t; used[i] = true; continue; }
    if (w === 'morgen') { out.date = addDays(t, 1); used[i] = true; continue; }
    if (w === 'übermorgen' || w === 'uebermorgen') { out.date = addDays(t, 2); used[i] = true; continue; }
    if (['nächsten', 'nächste', 'naechsten', 'naechste', 'kommenden', 'kommende'].includes(w)) { nextWeek = true; used[i] = true; continue; }
    if (w === 'woche' && nextWeek) { used[i] = true; out._week = true; continue; }
    if (w in WD_MAP) { let d = addDays(t, 1); while (dow(d) !== WD_MAP[w]) d = addDays(d, 1); out.date = d; out._wd = true; used[i] = true; continue; }
    if (!o.hw) {
      let found = null;
      for (const [k, arr] of Object.entries(TYPE_WORDS)) if (arr.includes(w)) { found = k; break; }
      if (found && !out.type) { out.type = found; used[i] = !TITLE_KEEP.has(w); continue; }
    }
    const s = matchSubject(w);
    if (s && !out.subject) { out.subject = s.id; used[i] = true; continue; }
    if (!o.hw && STOP.has(w)) { used[i] = true; continue; }
  }
  if (nextWeek && out._wd) out.date = addDays(addDays(mondayOf(t), 7), (dow(out.date) + 6) % 7);
  else if (nextWeek && out._week && !out.date) out.date = addDays(mondayOf(t), 7);
  if (o.hw) { // "bis" / "zum" vor dem Datum entfernen
    toks.forEach((x, i) => { if (!used[i] && ['bis', 'zum', 'zur', 'für', 'am'].includes(x.toLowerCase()) && used[i + 1]) used[i] = true; });
  }
  const rest = toks.filter((x, i) => !used[i]);
  if (rest.length) out.title = rest.join(' ');
  delete out._wd; delete out._week;
  return out;
}

// ---------- Termin-Formular ----------
function openForm(e, presetDate, presetType) {
  const t = todayStr();
  formState = e ? { ...e } : {
    id: uid(), type: presetType || 'sa', subject: '', date: presetDate || (ui.view === 'kalender' && (ui.kal === 'monat' || ui.kal === 'tag') ? ui.cursor : t),
    end: '', time: '', title: '', notes: '', prep: db.settings.prepDays, done: false,
  };
  formState._new = !e;
  openSheet(formHTML(), 'form');
  if (!e) setTimeout(() => $('#qa')?.focus(), 250);
}
function formHTML() {
  const f = formState;
  return sheetHead(f._new ? 'Neuer Termin' : 'Termin bearbeiten') +
    (f._new ? `<div class="quick"><input class="inp" id="qa" data-f="qa" placeholder="Schnell eintippen …" autocomplete="off" enterkeyhint="done" aria-label="Schnelleingabe">
      <div class="qa-hint">z. B. „Mathe SA Do“, „Ex Englisch morgen“, „KA Physik 14.10.“</div><div class="qa-prev" id="qaPrev"></div></div>` : '') +
    `<div id="ff">${formFieldsHTML()}</div>`;
}
function formFieldsHTML() {
  const f = formState, ty = TYPES[f.type] || TYPES.sonst;
  let h = `<label class="fl">Art</label><div class="wrap">${USER_TYPES.map(k => `<button class="tchip${f.type === k ? ' on' : ''}" style="--c:${TYPES[k].color}" data-a="ftype" data-v="${k}">${TYPES[k].label}</button>`).join('')}</div>`;
  h += `<label class="fl">Fach</label>${subjChips(f.subject)}`;
  h += `<label class="fl">Titel <span style="font-weight:500">(optional)</span></label><input class="inp" data-f="title" value="${esc(f.title)}" placeholder="${esc(autoTitle(f) || 'Titel')}">`;
  h += `<div class="row2"><div><label class="fl">Datum</label><input type="date" class="inp" data-f="date" value="${f.date}"></div><div><label class="fl">Uhrzeit</label><input type="time" class="inp" data-f="time" value="${f.time || ''}"></div></div>`;
  if (f.subject && ty.exam) { const nl = nextLessonDate(f.subject, addDays(f.date, -1)); if (nl && nl !== f.date && db.timetable.length) h += `<div class="small muted" style="margin-top:6px">Laut Stundenplan hast du ${esc(subj(f.subject).name)} am ${fmtShort(nl)}. <button class="link" style="min-width:0;padding:0" data-a="useLessonDate" data-v="${nl}">Übernehmen</button></div>`; }
  h += `<label class="switch"><span>Mehrtägig (z. B. Klassenfahrt)</span><input type="checkbox" class="tgl" data-f="multi"${f.end ? ' checked' : ''}></label>`;
  if (f.end) h += `<label class="fl">Bis einschließlich</label><input type="date" class="inp" data-f="end" value="${f.end}" min="${f.date}">`;
  h += `<label class="fl">${ty.exam ? 'Lernstoff / Themen' : 'Notizen'}</label><textarea class="inp" data-f="notes" placeholder="${ty.exam ? 'z. B. Buch S. 34–52, Lineare Funktionen, Vokabeln Unit 2' : 'Notizen'}">${esc(f.notes)}</textarea>`;
  if (ty.exam) {
    h += `<div class="row2"><div><label class="fl">Lernen starten</label><select class="inp" data-f="prep">${[0, 1, 2, 3, 4, 5, 7, 10, 14].map(n => `<option value="${n}"${+f.prep === n ? ' selected' : ''}>${n === 0 ? 'keine Erinnerung' : n + ' Tag' + (n > 1 ? 'e' : '') + ' vorher'}</option>`).join('')}</select></div>
      <div></div></div>
      <label class="switch"><span>Gut vorbereitet ✓</span><input type="checkbox" class="tgl" data-f="done"${f.done ? ' checked' : ''}></label>`;
  }
  if (ty.exam && f.date >= todayStr()) { const pl = db.homework.filter(x => x.planFor === f.id); h += `<button class="btn ghost wide" data-a="planGenForm" style="margin-top:14px">📅 ${pl.length ? `Lernplan anpassen (${pl.filter(x => x.done).length}/${pl.length} erledigt)` : 'Lernplan erstellen – Stoff auf die Tage verteilen'}</button>`; }
  h += attachHTML('eventId', f.id, f.subject);
  h += `<div class="fwarn" id="fwarn">${warnHTML()}</div>`;
  if (!f._new) h += `<div class="actions"><button class="btn ghost" data-a="share">Mit Klasse teilen</button><button class="btn ghost" data-a="dup">Kopie in 1 Woche</button><button class="btn danger" data-a="del">Löschen</button></div>`;
  return h + `<button class="btn wide" data-a="save">Speichern</button>`;
}
function warningsFor(ev) {
  const w = []; if (!ev.date) return w;
  const f = ferienMap.get(ev.date), h = holiday(ev.date), wd = dow(ev.date);
  if (ev.type !== 'frei') {
    if (f) w.push(`Das Datum liegt in den ${f.name}.`);
    if (h && !h.minor) w.push(h.schoolOnly ? `${h.name} – an diesem Tag ist unterrichtsfrei.` : `Feiertag: ${h.name}.`);
    if (!f && !h && (wd === 0 || wd === 6)) w.push('Das Datum ist ein Wochenende.');
  }
  const others = allEvents().filter(o => o.id !== ev.id);
  if (ev.type === 'sa') {
    const same = others.filter(o => (o.type === 'sa' || o.type === 'ap') && o.date === ev.date);
    if (same.length) w.push(`Am selben Tag ist schon: ${same.map(o => esc(evTitle(o))).join(', ')}.`);
    const mon = mondayOf(ev.date), sun = addDays(mon, 6), wk = others.filter(o => o.type === 'sa' && o.date >= mon && o.date <= sun);
    if (wk.length >= 2) w.push(`In dieser Woche sind schon ${wk.length} Schulaufgaben eingetragen.`);
  } else if (isExam(ev)) {
    const same = others.filter(o => isExam(o) && o.date === ev.date);
    if (same.length) w.push(`Am selben Tag: ${same.map(o => esc(evTitle(o))).join(', ')}.`);
  }
  if (absOn(ev.date).length && isExam(ev)) w.push('An diesem Tag ist eine Fehlzeit eingetragen – ggf. Nachholtermin klären.');
  return w;
}
const warnHTML = () => warningsFor(formState).map(x => `<div class="warn">⚠️<div>${x}</div></div>`).join('');
function renderFormFields() { const ff = $('#ff'); if (ff) ff.innerHTML = formFieldsHTML(); }
function renderQaPreview(r, el = $('#qaPrev')) {
  if (!el) return; const b = [];
  if (r.type) b.push(`<span><i class="dot" style="--c:${TYPES[r.type].color}"></i>${TYPES[r.type].label}</span>`);
  if (r.subject) { const s = subj(r.subject); b.push(`<span><i class="dot" style="--c:${s.color}"></i>${esc(s.name)}</span>`); }
  if (r.date) b.push(`<span>📅 ${fmtShort(r.date)} · ${rel(diffDays(todayStr(), r.date))}</span>`);
  if (r.time) b.push(`<span>🕒 ${r.time}</span>`);
  el.innerHTML = b.join('');
}
function saveForm() {
  const f = formState; if (!f) return;
  if (!f.date) { toast('Bitte ein Datum wählen'); return; }
  const isNew = f._new;
  const clean = { id: f.id, type: f.type, subject: f.subject || '', date: f.date, end: f.end && f.end > f.date ? f.end : '', time: f.time || '', title: (f.title || '').trim(), notes: (f.notes || '').trim(), prep: +f.prep || 0, done: !!f.done };
  upsert('events', clean);
  save(); sheetReturn = null; closeSheet();
  if (ui.view === 'kalender') ui.cursor = clean.date;
  render();
  toast(isNew ? `Eingetragen: ${evTitle(clean)} · ${fmtShort(clean.date)}` : 'Gespeichert');
}
function deleteEv(id) {
  const x = removeItem('events', id); if (!x) { closeSheet(); return; }
  save(); sheetReturn = null; closeSheet(); render();
  toast('Termin gelöscht', 'Rückgängig', () => { upsert('events', x); save(); render(); });
}
function offInfo(id) {
  const e = officialEvents().find(x => x.id === id); if (!e) return;
  openSheet(sheetHead('Amtlicher Termin', '', '<button class="link" data-a="close">Schließen</button>') +
    `<div class="card" style="border-left:4px solid ${TYPES[e.type].color}"><div style="font-weight:750;font-size:17px">${esc(evTitle(e))}</div><div class="muted">${fmtLong(e.date, true)}${e.time ? ' · ' + e.time + ' Uhr' : ''}</div>${e.notes ? `<p class="small">${esc(e.notes)}</p>` : ''}</div>
    <p class="small muted">Dieser Termin stammt aus den offiziellen Vorgaben des Kultusministeriums für bayerische Realschulen und wird automatisch aktualisiert. Ausblenden kannst du ihn unter Einstellungen → Darstellung.</p>
    ${e.type === 'ap' && e.subject ? `<button class="btn wide" data-a="timerFor" data-v="${e.subject}">▶ Lernzeit für ${esc(subj(e.subject).name)} starten</button>` : ''}`, 'off');
}

// ---------- Hausaufgaben ----------
function openHw(h, preset = {}) {
  formState = h ? { ...h, _new: false } : { id: 'h' + uid(), subject: preset.subject || '', text: '', kind: 'ha', due: preset.due || '', page: '', notes: '', campId: preset.campId || '', done: false, handed: false, _new: true, _manualSubj: !!preset.subject };
  openSheet(hwFormHTML(), 'hw');
  if (!h) setTimeout(() => $('#hwText')?.focus(), 250);
}
function hwFormHTML() {
  const f = formState, camp = f.campId && db.camps.find(c => c.id === f.campId);
  return sheetHead(f._new ? (camp ? 'Lehrgangs-Aufgabe' : 'Neue Aufgabe') : 'Aufgabe bearbeiten') +
    (camp ? `<div class="info" style="margin-bottom:4px">🛷<div>${esc(camp.title)} · ${fmtShort(camp.start)} – ${fmtShort(camp.end || camp.start)}</div></div>` : '') +
    `<label class="fl" style="margin-top:4px">Was ist zu tun?</label><textarea class="inp" id="hwText" data-f="hwtext" placeholder="${camp ? 'z. B. Lineare Funktionen – Aufgaben bearbeiten' : 'z. B. Mathe S. 45 Nr. 3a–c bis morgen'}" style="min-height:70px">${esc(f.text)}</textarea>
    <div class="qa-prev" id="hwPrev"></div><div id="ff">${hwFieldsHTML()}</div>`;
}
function hwFieldsHTML() {
  const f = formState, t = todayStr(), camp = f.campId && db.camps.find(c => c.id === f.campId);
  const subs = camp && !f._allSubj ? wpfgSubjects() : db.subjects;
  let h = `<label class="fl">Fach${camp ? ` <span style="font-weight:500">(Wahlpflichtfächergruppe ${esc(db.settings.wpfg || 'I')})</span>` : ''}</label><div class="${camp ? 'wrap' : 'hscroll'}">${subs.map(s => `<button class="chip${f.subject === s.id ? ' on' : ''}" data-a="hsubj" data-v="${s.id}"><i class="dot" style="--c:${s.color}"></i>${esc(s.name)}</button>`).join('')}<button class="chip${!f.subject ? ' on' : ''}" data-a="hsubj" data-v="">Ohne Fach</button>${camp && !f._allSubj ? '<button class="chip" data-a="hAllSubj">Alle Fächer …</button>' : ''}</div>`;
  h += `<div class="row2"><div><label class="fl">Buchseite / Nummer</label><input class="inp" data-f="hpage" value="${esc(f.page || '')}" placeholder="z. B. S. 45, Nr. 3a–c"></div><div><label class="fl">Art</label><select class="inp" data-f="hkindsel">${Object.entries(HW_KINDS).map(([k, l]) => `<option value="${k}"${f.kind === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div></div>`;
  h += `<label class="fl">Notizen</label><textarea class="inp" data-f="hnotes" placeholder="${camp ? 'z. B. Arbeitsblatt liegt im Ordner, per Mail an Frau Huber schicken' : 'optional'}" style="min-height:60px">${esc(f.notes || '')}</textarea>`;
  const quick = [];
  if (camp) {
    const end = camp.end || camp.start, back = nextSchoolDay(end);
    quick.push(['Bis Lehrgangsende (' + fmtShort(end) + ')', end], ['Erster Schultag danach (' + fmtShort(back) + ')', back]);
    const nlb = f.subject ? nextLessonDate(f.subject, end) : null;
    if (nlb && nlb !== back) quick.push([`Nächste ${subj(f.subject).short || 'Stunde'} danach (${fmtShort(nlb)})`, nlb]);
  } else {
    const nl = f.subject ? nextLessonDate(f.subject, t) : null;
    quick.push(['Morgen', nextSchoolDay(t)]);
    if (nl) quick.unshift([`Nächste ${subj(f.subject).short || 'Stunde'} (${fmtShort(nl)})`, nl]);
    quick.push(['In 1 Woche', addDays(t, 7)]);
  }
  h += `<label class="fl">Fällig / Abgabe</label><div class="wrap">${quick.map(([l, d]) => `<button class="chip${f.due === d ? ' on' : ''}" data-a="hdue" data-v="${d}">${l}</button>`).join('')}<button class="chip${!f.due ? ' on' : ''}" data-a="hdue" data-v="">Ohne</button></div>
    <input type="date" class="inp" data-f="hdue" value="${f.due || ''}" style="margin-top:8px">`;
  if (!camp && db.camps.length) {
    const opts = db.camps.filter(c => (c.end || c.start) >= addDays(t, -30)).sort((a, b) => a.start < b.start ? -1 : 1);
    if (opts.length) h += `<label class="fl">Gehört zu Lehrgang</label><select class="inp" data-f="hcamp"><option value="">– kein Lehrgang –</option>${opts.map(c => `<option value="${c.id}"${f.campId === c.id ? ' selected' : ''}>${esc(c.title)} (${fmtDM(c.start)})</option>`).join('')}</select>`;
  }
  h += attachHTML('hwId', f.id, f.subject);
  if (!f._new) h += `<label class="switch"><span>Erledigt</span><input type="checkbox" class="tgl" data-f="hdone"${f.done ? ' checked' : ''}></label><label class="switch"><span>Abgegeben</span><input type="checkbox" class="tgl" data-f="hhanded"${f.handed ? ' checked' : ''}></label>
    <div class="actions"><button class="btn ghost" data-a="hwshare">Mit Klasse teilen</button><button class="btn danger" data-a="hwdel">Löschen</button></div>`;
  return h + (f._new && camp ? `<div class="row" style="gap:8px;margin-top:18px"><button class="btn ghost grow1" data-a="hwSaveNext" style="padding:13px">Speichern & nächste</button><button class="btn grow1" data-a="save" style="padding:13px">Speichern</button></div>` : `<button class="btn wide" data-a="save">Speichern</button>`);
}
function saveHw(next) {
  const f = formState; const text = (f.text || '').trim();
  if (!text && !f.subject && !f.page) { toast('Bitte eintragen, was zu tun ist'); return; }
  const { _new, _manualSubj, _manualDue, _allSubj, ...clean } = f; clean.text = text;
  if (_new) { const r = parseQuick(text, { hw: true }); if (r.title && ((r.subject && r.subject === clean.subject) || (r.date && r.date === clean.due))) clean.text = r.title; }
  if (clean.handed) clean.done = true;
  upsert('homework', clean); save();
  if (next) { const keep = { campId: clean.campId, due: clean.due }; formState = null; openHw(null, keep); formState._manualDue = true; toast('Gespeichert – nächste Aufgabe'); return; }
  sheetReturn = null; closeSheet(); render();
  toast(f._new ? 'Aufgabe eingetragen' + (clean.due ? ' · fällig ' + fmtShort(clean.due) : '') : 'Gespeichert');
}
function toggleHw(id) {
  const h = db.homework.find(x => x.id === id); if (!h) return;
  h.done = !h.done; upsert('homework', h); save(); render();
  if (h.done) toast('Erledigt ✓', 'Rückgängig', () => { h.done = false; upsert('homework', h); save(); render(); });
}

function openSubject(id) {
  const s = subj(id); if (!s.id) { sheetReturn = null; closeSheet(); return; }
  let h = sheetHead(`<span class="row" style="justify-content:center;gap:7px"><i class="dot" style="--c:${s.color}"></i>${esc(s.name)}</span>`, `<button class="link" data-a="subjEdit" data-v="${id}" style="text-align:right">Bearbeiten</button>`, '<button class="link" data-a="close">Schließen</button>');
  const next = allEvents().filter(e => e.subject === id && isExam(e) && e.date >= todayStr()).sort(sortEv);
  if (next.length) h += `<div class="sec">Kommende Prüfungen</div><div class="stack">${next.slice(0, 4).map(e => evCard(e, { showDate: true })).join('')}</div>`;
  const sdocs = db.docs.filter(d => d.subject === id).sort((a, b) => (b.u || 0) - (a.u || 0));
  if (sdocs.length) h += `<div class="sec">Dateien & Arbeitsblätter <span class="cnt">${sdocs.length}</span></div><div class="stack">${sdocs.slice(0, 6).map(d => docRow(d, { noSubj: true })).join('')}</div>${sdocs.length > 6 ? `<button class="linkbtn" data-a="docsForSubj" data-v="${id}">Alle ${sdocs.length} in der Ablage →</button>` : ''}`;
  const openHwList = db.homework.filter(x => x.subject === id && !x.done);
  if (openHwList.length) h += `<div class="sec">Offene Aufgaben</div><div class="stack">${openHwList.map(hwItem).join('')}</div>`;
  h += `<div class="actions"><button class="btn" data-a="timerFor" data-v="${id}">▶ Lernzeit</button></div>`;
  openSheet(h, 'subject:' + id);
}

// ---------- Fach bearbeiten ----------
function openSubjEdit(id, ret) {
  const s = id ? subj(id) : { id: 's' + uid(), name: '', short: '', color: '#3e63dd', teacher: '', room: '' };
  formState = { ...s, _new: !id };
  sheetReturn = ret || null;
  openSheet(sheetHead(id ? 'Fach bearbeiten' : 'Neues Fach', undefined, `<button class="link" data-a="close">${ret ? 'Zurück' : 'Abbrechen'}</button>`) + `
    <div class="row2"><div><label class="fl" style="margin-top:4px">Name</label><input class="inp" data-f="sname" value="${esc(s.name)}"></div><div><label class="fl" style="margin-top:4px">Kürzel</label><input class="inp" data-f="sshort" value="${esc(s.short)}" maxlength="4"></div></div>
    <div class="row2"><div><label class="fl">Lehrkraft</label><input class="inp" data-f="steacher" value="${esc(s.teacher || '')}" placeholder="z. B. Frau Huber"></div><div><label class="fl">Raum</label><input class="inp" data-f="sroom" value="${esc(s.room || '')}" placeholder="z. B. 204"></div></div>
    <label class="fl">Farbe</label><input type="color" data-f="scolor" value="${s.color}">
    ${id ? `<div class="actions"><button class="btn danger" data-a="subjDel" data-v="${id}">Fach löschen</button></div>` : ''}
    <button class="btn wide" data-a="save">Speichern</button>`, 'subjEdit');
}
function saveSubj() {
  const f = formState; if (!f.name.trim()) { toast('Bitte einen Namen eingeben'); return; }
  const { _new, ...clean } = f; clean.name = clean.name.trim(); clean.short = (clean.short || clean.name.slice(0, 2)).trim();
  upsert('subjects', clean); save();
  const ret = sheetReturn; sheetReturn = null; formState = null;
  if (ret) ret(); else closeSheet();
  toast('Fach gespeichert');
}

// ---------- Stundenplan-Feld ----------
function openTT(day, per) {
  const ab = db.settings.ab.on, wk = ab ? (ui.ttWeek || weekType(todayStr())) : 'all';
  const ex = db.timetable.find(l => l.day === day && l.period === per && (l.week === 'all' || !l.week || !ab || l.week === wk));
  formState = ex ? { ...ex, _new: false, _double: false } : { id: 't' + uid(), day, period: per, week: 'all', subject: '', room: '', _new: true, _double: false };
  openSheet(ttHTML(), 'tt');
}
function ttHTML() {
  const f = formState, p = period(f.period), ab = db.settings.ab.on;
  let h = sheetHead(`${WDL[f.day % 7]}, ${f.period}. Stunde`) + (p ? `<div class="small muted" style="text-align:center;margin-top:-4px">${p.s} – ${p.e} Uhr</div>` : '');
  h += `<label class="fl">Fach</label><div class="wrap">${db.subjects.map(s => `<button class="chip${f.subject === s.id ? ' on' : ''}" data-a="tsubj" data-v="${s.id}"><i class="dot" style="--c:${s.color}"></i>${esc(s.name)}</button>`).join('')}</div>`;
  h += `<label class="fl">Raum <span style="font-weight:500">(leer = Standardraum des Fachs)</span></label><input class="inp" data-f="troom" value="${esc(f.room || '')}" placeholder="${esc(subj(f.subject).room || 'z. B. 204')}">`;
  if (ab) h += `<label class="fl">Gilt für</label><div class="seg" style="margin:0">${[['all', 'Jede Woche'], ['A', 'Nur A-Woche'], ['B', 'Nur B-Woche']].map(([k, l]) => `<button class="${(f.week || 'all') === k ? 'on' : ''}" data-a="tweek" data-v="${k}">${l}</button>`).join('')}</div>`;
  if (f.period < db.settings.periods.length) h += `<label class="switch"><span>Doppelstunde<small>auch in der ${f.period + 1}. Stunde eintragen</small></span><input type="checkbox" class="tgl" data-f="tdouble"${f._double ? ' checked' : ''}></label>`;
  if (!f._new) h += `<div class="actions"><button class="btn danger" data-a="tdel">Stunde entfernen</button></div>`;
  return h + `<button class="btn wide" data-a="save">Speichern</button>`;
}
function saveTT() {
  const f = formState; if (!f.subject) { toast('Bitte ein Fach wählen'); return; }
  const put = (per, base) => {
    const wk = f.week || 'all';
    db.timetable.filter(l => l.day === f.day && l.period === per && l.id !== base.id && (wk === 'all' || l.week === wk || l.week === 'all' || !l.week)).forEach(l => removeItem('timetable', l.id));
    upsert('timetable', { id: base.id, day: f.day, period: per, week: wk, subject: f.subject, room: (f.room || '').trim() });
  };
  put(f.period, f);
  if (f._double) { const ex = db.timetable.find(l => l.day === f.day && l.period === f.period + 1 && (l.week === (f.week || 'all'))); put(f.period + 1, { id: ex ? ex.id : 't' + uid() }); }
  save(); closeSheet(); render();
}
function openPeriods() {
  sheetReturn = null;
  const P = db.settings.periods, ab = db.settings.ab;
  openSheet(sheetHead('Stundenzeiten & Wochen', '<button class="btn" data-a="close">Fertig</button>', '<span style="min-width:70px"></span>') +
    `${P.map((p, i) => `<div class="set-row"><b style="width:26px">${i + 1}.</b><input type="time" class="inp tm" data-per="s" data-i="${i}" value="${p.s}"><span>–</span><input type="time" class="inp tm" data-per="e" data-i="${i}" value="${p.e}"><span class="grow1"></span>${i === P.length - 1 ? `<button class="ib" data-a="perDel" aria-label="Letzte Stunde entfernen">${ICON.trash}</button>` : ''}</div>`).join('')}
    <button class="addline" data-a="perAdd">${ICON.plus} Stunde hinzufügen</button>
    <div class="switch"><span>Samstag als Schultag</span><input type="checkbox" class="tgl" data-f="days6"${db.settings.days === 6 ? ' checked' : ''}></div>
    <div class="sh">A/B-Wochen</div>
    <label class="switch"><span>A/B-Wochen verwenden<small>für Fächer, die nur alle zwei Wochen stattfinden</small></span><input type="checkbox" class="tgl" data-f="abon"${ab.on ? ' checked' : ''}></label>
    ${ab.on ? `<div class="fl">Diese Woche (KW ${isoWeek(todayStr())}) ist eine …</div><div class="seg" style="margin:0">${['A', 'B'].map(w => `<button class="${weekType(todayStr()) === w ? 'on' : ''}" data-a="abSet" data-v="${w}">${w}-Woche</button>`).join('')}</div>` : ''}`, 'periods');
}

// ---------- Fehlzeiten ----------
function openAbs(a, preset = {}) {
  const d = preset.date || todayStr();
  formState = a ? { ...a, _new: false } : { id: 'a' + uid(), date: d, end: '', reason: 'krank', lessons: lessonsOn(d).length || 6, excused: false, note: '', _new: true };
  openSheet(absHTML(), 'abs');
}
function absHTML() {
  return sheetHead(formState._new ? 'Fehlzeit eintragen' : 'Fehlzeit bearbeiten') + `<div id="ff">${absFieldsHTML()}</div>`;
}
function absFieldsHTML() {
  const f = formState;
  const camp = f.campId && db.camps.find(c => c.id === f.campId);
  let h = (camp ? `<div class="info">🛷<div>Gehört zum Lehrgang <b>${esc(camp.title)}</b>. Datum und Stunden werden beim Bearbeiten des Lehrgangs automatisch angepasst. <button class="link" data-a="campOpen" data-v="${camp.id}" style="min-width:0;padding:0">Zum Lehrgang</button></div></div>` : '') + `<label class="fl" style="margin-top:4px">Grund</label><div class="wrap">${Object.entries(ABS_REASONS).map(([k, l]) => `<button class="chip${f.reason === k ? ' on' : ''}" data-a="areason" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="row2"><div><label class="fl">Datum</label><input type="date" class="inp" data-f="adate" value="${f.date}"></div><div><label class="fl">Versäumte Stunden</label><input type="number" min="0" max="12" class="inp" data-f="alessons" value="${f.lessons}"></div></div>
    <label class="switch"><span>Mehrere Tage</span><input type="checkbox" class="tgl" data-f="amulti"${f.end ? ' checked' : ''}></label>
    ${f.end ? `<label class="fl">Bis einschließlich</label><input type="date" class="inp" data-f="aend" value="${f.end}" min="${f.date}">` : ''}
    <label class="switch"><span>Entschuldigung abgegeben</span><input type="checkbox" class="tgl" data-f="aexc"${f.excused ? ' checked' : ''}></label>
    <label class="fl">Notiz</label><input class="inp" data-f="anote" value="${esc(f.note || '')}" placeholder="z. B. Attest liegt vor">`;
  const missed = allEvents().filter(e => isExam(e) && e.date >= f.date && e.date <= (f.end || f.date));
  if (missed.length) h += `<div class="fwarn"><div class="warn">⚠️<div>Verpasste Prüfung${missed.length > 1 ? 'en' : ''}: ${missed.map(e => esc(evTitle(e))).join(', ')}. Frag nach einem Nachholtermin und trag ihn ein.</div></div></div>`;
  if (!f._new) h += `<div class="actions"><button class="btn danger" data-a="adel">Löschen</button></div>`;
  return h + `<button class="btn wide" data-a="save">Speichern</button>`;
}
function saveAbs() {
  const { _new, ...clean } = formState; if (clean.end && clean.end <= clean.date) clean.end = '';
  clean.lessons = +clean.lessons || 0;
  upsert('absences', clean); save(); closeSheet(); render(); toast(_new ? 'Fehlzeit eingetragen – gute Besserung!' : 'Gespeichert');
}

// ---------- Lernzeit ----------
function openStudy(x) {
  formState = x ? { ...x, _new: false } : { id: 'l' + uid(), subject: local.timer?.subject || '', date: todayStr(), min: 30, _new: true };
  openSheet(sheetHead(formState._new ? 'Lernzeit nachtragen' : 'Lernzeit bearbeiten') + `<div id="ff">${studyFieldsHTML()}</div>`, 'study');
}
function studyFieldsHTML() {
  const f = formState;
  return `<label class="fl" style="margin-top:4px">Fach</label>${subjChips(f.subject, 'lsubj', true)}
    <div class="row2"><div><label class="fl">Datum</label><input type="date" class="inp" data-f="ldate" value="${f.date}"></div><div><label class="fl">Minuten</label><input type="number" min="1" max="600" class="inp" data-f="lmin" value="${f.min}"></div></div>
    ${f._new ? '' : '<div class="actions"><button class="btn danger" data-a="ldel">Löschen</button></div>'}<button class="btn wide" data-a="save">Speichern</button>`;
}
function saveStudy() { const { _new, ...c } = formState; c.min = Math.max(1, +c.min || 0); upsert('study', c); save(); closeSheet(); render(); toast('Lernzeit gespeichert'); }
let clockTimer = null;
function tickClock() { clearInterval(clockTimer); if (local.timer && local.timer.running) clockTimer = setInterval(() => { const el = $('#clock'); if (el) el.textContent = fmtClock(timerElapsed()); else clearInterval(clockTimer); }, 1000); }
function startTimer(subject) { local.timer = { subject, start: Date.now(), acc: 0, running: true }; saveLocal(); ui.view = 'aufgaben'; ui.auf = 'lernzeit'; if (sheetOpen) { sheetReturn = null; closeSheet(); } render(); window.scrollTo(0, 0); }
function stopTimer(saveIt) {
  const min = Math.round(timerElapsed() / 60000), tm = local.timer;
  local.timer = null; saveLocal();
  if (saveIt) { if (min < 1) { toast('Weniger als 1 Minute – nicht gespeichert'); } else { upsert('study', { id: 'l' + uid(), subject: tm.subject, date: todayStr(), min }); save(); toast(`${fmtMin(min)} ${subj(tm.subject).name || ''} gespeichert 💪`);
      // Im Planer: Pause vorschlagen
      if (IN_PLANER) try { window.parent.postMessage({ sg: 'study-done', min }, location.origin); } catch (e) {} } }
  render();
}

// ---------- Auswahl (Plus-Knopf auf „Heute“) ----------
function openChooser() {
  openSheet(sheetHead('Hinzufügen', '', '<button class="link" data-a="close">Abbrechen</button>') + `<div class="choose">
    <button data-a="add"><span class="e">📅</span>Prüfung / Termin<small>SA, KA, Ex, Referat …</small></button>
    <button data-a="newHw"><span class="e">📝</span>Aufgabe<small>Hausaufgabe, Lernen, Mitbringen</small></button>
    <button data-a="newAbs"><span class="e">🤒</span>Fehlzeit<small>krank, Arzt, beurlaubt</small></button>
    <button data-a="goTimer"><span class="e">⏱️</span>Lernzeit<small>Timer starten</small></button>
    <button data-a="tab" data-v="plan"><span class="e">🗓️</span>Stundenplan<small>Stunden eintragen</small></button></div>`, 'choose');
}

// ---------- Teilen & Importieren ----------
async function shareLink(kind, data, title, text) {
  const url = location.origin + location.pathname + '?import=' + b64url(JSON.stringify({ k: kind, d: data }));
  try {
    if (navigator.share) { await navigator.share({ title, text: text + '\n', url }); return; }
    await navigator.clipboard.writeText(text + '\n' + url); toast('Link kopiert – z. B. in den Klassenchat einfügen');
  } catch (e) { /* abgebrochen */ }
}
const subjPayload = id => { const s = subj(id); return s.id ? { n: s.name, k: s.short, c: s.color } : null; };
function subjectFromPayload(p) {
  if (!p) return '';
  const ex = db.subjects.find(s => s.name.toLowerCase() === String(p.n).toLowerCase()) || matchSubject(String(p.n).toLowerCase());
  if (ex) return ex.id;
  return upsert('subjects', { id: 's' + uid(), name: p.n, short: p.k || p.n.slice(0, 2), color: p.c || '#3e63dd', teacher: '', room: '' }).id;
}
function shareEvent(e) {
  shareLink('ev', { t: e.type, s: subjPayload(e.subject), d: e.date, tm: e.time, ti: e.title, no: e.notes, en: e.end }, evTitle(e), `📅 ${evTitle(e)} – ${fmtLong(e.date)}${e.time ? ', ' + e.time + ' Uhr' : ''}${e.notes ? '\nStoff: ' + e.notes : ''}\nIn den Lernplan übernehmen:`);
}
function shareHw(h) {
  shareLink('hw', { s: subjPayload(h.subject), x: h.text, du: h.due, ki: h.kind }, 'Hausaufgabe', `📝 ${subj(h.subject).name ? subj(h.subject).name + ': ' : ''}${h.text}${h.due ? ' (bis ' + fmtShort(h.due) + ')' : ''}\nIn den Lernplan übernehmen:`);
}
function shareTT() {
  const subs = [...new Set(db.timetable.map(l => l.subject))];
  shareLink('tt', { s: subs.map(id => ({ i: id, ...subjPayload(id) })), l: db.timetable.map(l => [l.day, l.period, l.week || 'all', l.subject, l.room || '']), p: db.settings.periods, ab: db.settings.ab }, 'Stundenplan', '🗓️ Unser Stundenplan für den Lernplan:');
}
function openImport(payload) {
  let data; try { data = JSON.parse(unb64url(payload)); } catch (e) { toast('Der geteilte Link ist beschädigt'); return; }
  let desc = '';
  if (data.k === 'ev') desc = `<b>${esc(data.d.ti || [TYPES[data.d.t]?.label, data.d.s?.n].filter(Boolean).join(' '))}</b><br>${fmtLong(data.d.d, true)}${data.d.tm ? ' · ' + data.d.tm + ' Uhr' : ''}${data.d.no ? '<br><span class="small">' + esc(data.d.no) + '</span>' : ''}`;
  else if (data.k === 'hw') desc = `<b>${esc(data.d.s?.n || 'Aufgabe')}</b>: ${esc(data.d.x)}${data.d.du ? '<br>fällig ' + fmtLong(data.d.du) : ''}`;
  else if (data.k === 'tt') desc = `<b>Stundenplan</b> mit ${data.d.l.length} Stunden in ${data.d.s.length} Fächern.${db.timetable.length ? '<br><b>Dein bisheriger Stundenplan wird ersetzt.</b>' : ''}`;
  else { toast('Unbekannter Link'); return; }
  formState = { _import: data };
  openSheet(sheetHead('Geteilt von der Klasse', '', '<button class="link" data-a="close">Abbrechen</button>') + `<div class="card">${desc}</div><button class="btn wide" data-a="doImport">Übernehmen</button>`, 'import');
}
function doImport() {
  const data = formState._import, d = data.d;
  if (data.k === 'ev') upsert('events', { id: 'e' + uid(), type: TYPES[d.t] ? d.t : 'sonst', subject: subjectFromPayload(d.s), date: d.d, end: d.en || '', time: d.tm || '', title: d.ti || '', notes: d.no || '', prep: db.settings.prepDays, done: false });
  else if (data.k === 'hw') upsert('homework', { id: 'h' + uid(), subject: subjectFromPayload(d.s), text: d.x || '', due: d.du || '', kind: d.ki || 'ha', done: false });
  else if (data.k === 'tt') {
    const map = {}; d.s.forEach(x => map[x.i] = subjectFromPayload(x));
    db.timetable.slice().forEach(l => removeItem('timetable', l.id));
    d.l.forEach(([day, per, week, sid, room]) => upsert('timetable', { id: 't' + uid(), day, period: per, week, subject: map[sid] || '', room }));
    if (Array.isArray(d.p) && d.p.length) setSetting('periods', d.p);
    if (d.ab) setSetting('ab', d.ab);
  }
  save(); closeSheet(); render(); toast('Übernommen ✓');
}

// ---------- Lehrgang anlegen / bearbeiten ----------
function openCamp(c) {
  const t = todayStr();
  formState = c ? { ...c, _new: false } : { id: 'c' + uid(), title: '', kind: 'lehrgang', place: '', start: addDays(t, 7), end: addDays(t, 11), notes: '', absence: true, excused: false, checklist: CAMP_CHECK.map((x, i) => ({ id: 'k' + i, t: x, d: false })), missed: {}, _new: true };
  openSheet(sheetHead(formState._new ? 'Neuer Lehrgang' : 'Lehrgang bearbeiten') + `<div id="ff">${campFieldsHTML()}</div>`, 'camp');
}
function campFieldsHTML() {
  const f = formState;
  const m = f.start ? campMissed({ ...f, end: f.end || f.start }) : null;
  let h = `<label class="fl" style="margin-top:4px">Art</label><div class="wrap">${Object.entries(CAMP_KINDS).map(([k, l]) => `<button class="chip${f.kind === k ? ' on' : ''}" data-a="ckind" data-v="${k}">${l}</button>`).join('')}</div>
    <label class="fl">Name</label><input class="inp" data-f="ctitle" value="${esc(f.title)}" placeholder="z. B. Rodellehrgang Oberhof">
    <label class="fl">Ort</label><input class="inp" data-f="cplace" value="${esc(f.place || '')}" placeholder="z. B. Oberhof, Königssee, Innsbruck-Igls">
    <div class="row2"><div><label class="fl">Von</label><input type="date" class="inp" data-f="cstart" value="${f.start}"></div><div><label class="fl">Bis</label><input type="date" class="inp" data-f="cend" value="${f.end || ''}" min="${f.start}"></div></div>`;
  if (m) h += `<div class="info" style="margin-top:12px">📚<div>Du verpasst <b>${m.days} Schultag${m.days === 1 ? '' : 'e'}</b>${db.timetable.length ? ` und <b>${m.lessons} Stunden</b>` : ''}${m.exams.length ? `. <b style="color:var(--danger)">Achtung: ${m.exams.map(e => esc(evTitle(e))).join(', ')}</b>` : ''}.</div></div>`;
  h += `<label class="switch"><span>Als Fehlzeit eintragen<small>erscheint unter Kalender → Fehlzeiten</small></span><input type="checkbox" class="tgl" data-f="cabs"${f.absence ? ' checked' : ''}></label>
    <label class="switch"><span>Freistellung liegt vor</span><input type="checkbox" class="tgl" data-f="cexc"${f.excused ? ' checked' : ''}></label>
    <label class="fl">Notizen</label><textarea class="inp" data-f="cnotes" placeholder="z. B. Abfahrt 6 Uhr, Trainer, Unterkunft" style="min-height:60px">${esc(f.notes || '')}</textarea>`;
  if (!f._new) h += `<div class="actions"><button class="btn danger" data-a="campDel">Lehrgang löschen</button></div>`;
  return h + `<button class="btn wide" data-a="save">Speichern</button>`;
}
function syncCampAbsence(c) {
  const id = 'abs-' + c.id, ex = db.absences.find(a => a.id === id);
  if (!c.absence) { if (ex) removeItem('absences', id); return; }
  const m = campMissed(c);
  upsert('absences', { ...(ex || {}), id, date: c.start, end: c.end && c.end > c.start ? c.end : '', reason: 'lehrgang', lessons: m.lessons || m.days * 6, excused: !!c.excused, note: c.title, campId: c.id });
}
function saveCamp() {
  const f = formState;
  if (!f.title.trim()) { toast('Bitte einen Namen eingeben, z. B. „Rodellehrgang Oberhof“'); return; }
  if (!f.start) { toast('Bitte das Startdatum wählen'); return; }
  const { _new, ...c } = f; c.title = c.title.trim(); if (c.end && c.end < c.start) c.end = c.start;
  upsert('camps', c); syncCampAbsence(c); save();
  sheetReturn = null; closeSheet(); ui.view = 'lehrgang'; ui.camp = c.id; render(); window.scrollTo(0, 0);
  toast(_new ? 'Lehrgang angelegt – jetzt die Aufgaben eintragen' : 'Gespeichert');
}
function deleteCamp(id) {
  const c = db.camps.find(x => x.id === id); if (!c) return;
  const tasks = campTasks(id);
  if (!confirm(`„${c.title}“ löschen?${tasks.length ? `\n${tasks.length} Aufgaben werden ebenfalls gelöscht.` : ''}`)) return;
  removeItem('camps', id); tasks.forEach(x => removeItem('homework', x.id)); if (db.absences.some(a => a.id === 'abs-' + id)) removeItem('absences', 'abs-' + id);
  save(); ui.camp = null; sheetReturn = null; closeSheet(); render(); toast('Lehrgang gelöscht');
}
function campUpdate(id, fn) { const c = db.camps.find(x => x.id === id); if (!c) return; const copy = JSON.parse(JSON.stringify(c)); fn(copy); upsert('camps', copy); save(); }
function campShareText(c) {
  const tasks = campTasks(c.id), m = campMissed(c);
  let txt = `🛷 ${c.title} (${fmtShort(c.start)} – ${fmtShort(c.end || c.start)})\n`;
  if (m.days) txt += `Verpasst: ${m.days} Schultage${m.lessons ? ', ' + m.lessons + ' Stunden' : ''}\n`;
  const bySubj = {}; tasks.forEach(x => (bySubj[x.subject || ''] = bySubj[x.subject || ''] || []).push(x));
  Object.entries(bySubj).forEach(([sid, list]) => {
    txt += `\n${subj(sid).name || 'Sonstiges'}:\n` + list.map(x => `${x.done ? '✅' : '⬜'} ${x.text || HW_KINDS[x.kind]}${x.page ? ' (' + x.page + ')' : ''}${x.due ? ' – bis ' + fmtShort(x.due) : ''}`).join('\n') + '\n';
  });
  return txt;
}
async function shareCamp(c) {
  const text = campShareText(c);
  try { if (navigator.share) { await navigator.share({ title: c.title, text }); return; } await navigator.clipboard.writeText(text); toast('Übersicht kopiert'); } catch (e) { /* abgebrochen */ }
}
function nachschreiben(eventId) {
  const e = allEvents().find(x => x.id === eventId); if (!e) return;
  const c = db.camps.find(x => x.id === ui.camp);
  openForm(null, c ? nextSchoolDay(c.end || c.start) : null, TYPES[e.type] && USER_TYPES.includes(e.type) ? e.type : 'sa');
  formState.subject = e.subject; formState.title = 'Nachschreiben: ' + evTitle(e); renderFormFields();
}

// ---------- Stundenplan-Import (Excel, CSV oder eingefügte Tabelle) ----------
const TT_DAYS = { mo: 1, montag: 1, mon: 1, di: 2, dienstag: 2, die: 2, mi: 3, mittwoch: 3, mit: 3, do: 4, donnerstag: 4, don: 4, fr: 5, freitag: 5, fre: 5, sa: 6, samstag: 6 };
const TT_SYN = { // gängige Abkürzungen auf Stundenplänen → Teil des Fachnamens
  d: 'deutsch', e: 'englisch', m: 'mathe', ma: 'mathe', mathematik: 'mathe', ph: 'physik', phy: 'physik', ch: 'chemie', c: 'chemie', b: 'bio', bio: 'bio',
  g: 'geschichte', ge: 'geschichte', gesch: 'geschichte', ek: 'geogra', erdkunde: 'geogra', geo: 'geogra', geographie: 'geogra', sk: 'sozialkunde', soz: 'sozialkunde',
  wr: 'wirtschaft', 'w&r': 'wirtschaft', bwr: 'bwr', f: 'franz', frz: 'franz', it: 'it', inf: 'it', informatik: 'it', informationstechnologie: 'it', itg: 'it',
  k: 'religion', kr: 'religion', ev: 'religion', er: 'religion', rk: 'religion', kath: 'religion', evang: 'religion', rel: 'religion', reli: 'religion', eth: 'ethik', ethik: 'ethik',
  ku: 'kunst', gest: 'kunst', gestaltung: 'kunst', mu: 'musik', mus: 'musik', sp: 'sport', s: 'sport', sm: 'sport', sw: 'sport', spo: 'sport', we: 'werken', wk: 'werken',
};
const TT_SKIP = /^(pause|mittag|mittagspause|frei|-+|—|–|x|\/)$/i;
function ttFindSubject(raw) {
  const w = raw.toLowerCase().replace(/[.:]+$/, '').trim(); if (!w) return null;
  const exact = db.subjects.find(s => s.name.toLowerCase() === w || s.short.toLowerCase() === w); if (exact) return exact;
  const syn = TT_SYN[w] || TT_SYN[w.replace(/\s+/g, '')];
  if (syn) { const s = db.subjects.find(x => x.name.toLowerCase().includes(syn) || x.short.toLowerCase() === syn); if (s) return s; }
  return matchSubject(w);
}
function ttParseCell(cell) {
  return String(cell).split(/\s*(?:\/|\n|\||;)\s*/).map(p => p.trim()).filter(p => p && !TT_SKIP.test(p)).map(p => {
    let week = 'all', room = '', name = p;
    const wm = name.match(/\s*[\[(]?\b([AB])(?:-?\s*Woche)?\b[\])]?\s*$/) || name.match(/^\s*[\[(]?([AB])(?:-?\s*Woche)?[\])]?\s*:?\s+/);
    if (wm && name.replace(wm[0], '').trim()) { week = wm[1]; name = name.replace(wm[0], ' ').trim(); }
    let rm = name.match(/\((?:R(?:aum)?\.?\s*)?([^)]+)\)/i);
    if (rm) { room = rm[1].trim(); name = name.replace(rm[0], '').trim(); }
    else if ((rm = name.match(/[,\s]+(?:R(?:aum)?\.?\s*)?(\d{1,4}[a-z]?|[A-Z]\d{1,4}|Turnhalle|TH|Halle)\s*$/i)) && name.replace(rm[0], '').trim()) { room = rm[1].trim(); name = name.replace(rm[0], '').trim(); }
    name = name.replace(/[,;]+$/, '').trim();
    return { name, room, week };
  }).filter(x => x.name);
}
function ttParseRows(rows) {
  rows = rows.map(r => (r || []).map(c => String(c ?? '').trim()));
  let hi = -1, cols = {};
  for (let i = 0; i < Math.min(rows.length, 12); i++) {
    const c = {};
    rows[i].forEach((v, j) => { const k = v.toLowerCase().replace(/[.:]/g, '').trim(); if (k in TT_DAYS) c[j] = TT_DAYS[k]; });
    if (Object.keys(c).length >= 3) { hi = i; cols = c; break; }
  }
  if (hi < 0) throw new Error('Keine Kopfzeile mit Wochentagen (Mo, Di, Mi …) gefunden.');
  const out = { lessons: [], periods: {}, newSubjects: [], ab: false, days: Math.max(...Object.values(cols)) };
  const newMap = {};
  let auto = 0;
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i]; if (!r.some(Boolean)) continue;
    let per = null, time = null;
    r.forEach((v, j) => {
      if (j in cols || !v) return;
      const t = v.match(/(\d{1,2})[:.](\d{2})\s*(?:-|–|—|bis)\s*(\d{1,2})[:.](\d{2})/);
      if (t) time = { s: pad(+t[1]) + ':' + t[2], e: pad(+t[3]) + ':' + t[4] };
      const m = v.replace(t ? t[0] : '', '').trim().match(/^(\d{1,2})\s*\.?\s*(?:stunde|std\.?)?$/i);
      if (m && per == null && +m[1] >= 1 && +m[1] <= 14) per = +m[1];
    });
    const cells = Object.keys(cols).map(j => r[j]).filter(v => v && !TT_SKIP.test(v));
    if (!cells.length) continue; // Pausenzeile
    if (per == null) per = auto + 1;
    auto = per;
    if (time) out.periods[per] = time;
    for (const [j, day] of Object.entries(cols)) {
      const cell = r[j]; if (!cell) continue;
      ttParseCell(cell).forEach(x => {
        let s = ttFindSubject(x.name);
        if (!s) {
          const key = x.name.toLowerCase();
          if (!newMap[key]) { newMap[key] = { id: 's' + uid(), name: x.name.charAt(0).toUpperCase() + x.name.slice(1), short: x.name.slice(0, 3), color: PERSON_COLORS_TT[out.newSubjects.length % PERSON_COLORS_TT.length], teacher: '', room: '' }; out.newSubjects.push(newMap[key]); }
          s = newMap[key];
        }
        if (out.lessons.some(l => l.day === day && l.period === per && l.subject === s.id && l.week === x.week)) return;
        if (x.week !== 'all') out.ab = true;
        out.lessons.push({ day, period: per, week: x.week, subject: s.id, room: x.room, _name: s.name, _short: s.short, _color: s.color });
      });
    }
  }
  if (!out.lessons.length) throw new Error('In der Tabelle wurden keine Fächer gefunden.');
  return out;
}
const PERSON_COLORS_TT = ['#0d74ce', '#e54666', '#46a758', '#f76b15', '#8e4ec6', '#12a594', '#b08a3e', '#d6409f'];
function csvRows(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  const first = lines.find(l => l.trim()) || '';
  const delim = first.includes('\t') ? '\t' : (first.split(';').length >= first.split(',').length ? ';' : ',');
  return lines.map(line => {
    const out = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) { if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === delim) { out.push(cur); cur = ''; } else cur += ch;
    }
    out.push(cur); return out;
  });
}
// Eigener, kleiner Excel-Leser (.xlsx = ZIP mit XML) – funktioniert offline ohne Zusatzbibliothek
async function unzipReader(buf) {
  const dv = new DataView(buf); let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Das ist keine gültige Excel-Datei (.xlsx).');
  const n = dv.getUint16(eocd + 10, true); let off = dv.getUint32(eocd + 16, true); const files = {};
  for (let k = 0; k < n; k++) {
    const method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true), nlen = dv.getUint16(off + 28, true), elen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true), loff = dv.getUint32(off + 42, true);
    files[new TextDecoder().decode(new Uint8Array(buf, off + 46, nlen))] = { method, csize, loff };
    off += 46 + nlen + elen + clen;
  }
  return async name => {
    const f = files[name]; if (!f) return null;
    const start = f.loff + 30 + dv.getUint16(f.loff + 26, true) + dv.getUint16(f.loff + 28, true);
    const data = new Uint8Array(buf, start, f.csize);
    if (f.method === 0) return new TextDecoder().decode(data);
    const out = await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
    return new TextDecoder().decode(out);
  };
}
const xmlDoc = t => new DOMParser().parseFromString(t, 'application/xml');
function cellRef(ref) { const m = ref.match(/^([A-Z]+)(\d+)$/); let c = 0; for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return { r: +m[2] - 1, c: c - 1 }; }
async function xlsxRows(buf) {
  const get = await unzipReader(buf);
  let sheetPath = 'xl/worksheets/sheet1.xml';
  const wbx = await get('xl/workbook.xml'), rels = await get('xl/_rels/workbook.xml.rels');
  if (wbx && rels) {
    const first = xmlDoc(wbx).getElementsByTagName('sheet')[0];
    const rid = first && (first.getAttribute('r:id') || first.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'));
    const rel = [...xmlDoc(rels).getElementsByTagName('Relationship')].find(r => r.getAttribute('Id') === rid);
    if (rel) { const tg = rel.getAttribute('Target'); sheetPath = tg.startsWith('/') ? tg.slice(1) : 'xl/' + tg.replace(/^\.\//, ''); }
  }
  const ssx = await get('xl/sharedStrings.xml');
  const shared = ssx ? [...xmlDoc(ssx).getElementsByTagName('si')].map(si => [...si.getElementsByTagName('t')].map(t => t.textContent).join('')) : [];
  const sx = await get(sheetPath); if (!sx) throw new Error('Tabellenblatt nicht gefunden.');
  const doc = xmlDoc(sx), grid = [];
  for (const c of doc.getElementsByTagName('c')) {
    const { r, c: col } = cellRef(c.getAttribute('r')), t = c.getAttribute('t');
    const v = c.getElementsByTagName('v')[0]?.textContent ?? '';
    let val = t === 's' ? (shared[+v] ?? '') : t === 'inlineStr' ? [...c.getElementsByTagName('t')].map(x => x.textContent).join('') : v;
    if (!t && v && /^0\.\d+$/.test(v)) { const min = Math.round(+v * 1440); val = pad(Math.floor(min / 60)) + ':' + pad(min % 60); } // Uhrzeit als Zahl
    (grid[r] = grid[r] || [])[col] = val;
  }
  for (const m of doc.getElementsByTagName('mergeCell')) { // verbundene Zellen (Doppelstunden) auffüllen
    const [a, b] = m.getAttribute('ref').split(':'); if (!b) continue;
    const s0 = cellRef(a), e0 = cellRef(b), src = (grid[s0.r] || [])[s0.c];
    if (src == null || src === '') continue;
    for (let R = s0.r; R <= e0.r; R++) for (let C = s0.c; C <= e0.c; C++) { grid[R] = grid[R] || []; if (grid[R][C] == null || grid[R][C] === '') grid[R][C] = src; }
  }
  return Array.from({ length: grid.length }, (_, i) => Array.from({ length: (grid[i] || []).length }, (_, j) => (grid[i] || [])[j] ?? ''));
}
function openTTImport() {
  formState = { _import: null, _replace: true, _times: true };
  openSheet(ttImportHTML(), 'ttimport');
}
function ttImportHTML() {
  const f = formState, r = f._import;
  let h = sheetHead('Stundenplan importieren', r ? '<button class="btn" data-a="ttImportDo">Übernehmen</button>' : '', '<button class="link" data-a="close">Abbrechen</button>');
  if (!r) {
    h += `<div class="info">📸<div><b>Tipp:</b> Fotografiere deinen Stundenplan und lass daraus eine Excel-Datei machen (z. B. von Claude). Die kannst du hier direkt einlesen.</div></div>
      <label class="fl">1. Excel- oder CSV-Datei wählen</label>
      <button class="btn wide" data-a="ttPickFile" style="margin-top:0">📄 Datei auswählen (.xlsx, .csv)</button>
      <label class="fl">2. … oder aus Excel/Google Tabellen kopieren und hier einfügen</label>
      <textarea class="inp" id="ttPaste" placeholder="Stunde → Mo → Di → Mi → Do → Fr&#10;1 → Mathe → Deutsch → …" style="min-height:110px;font-family:monospace;font-size:13px"></textarea>
      <button class="btn ghost wide" data-a="ttPasteGo" style="margin-top:8px">Eingefügte Tabelle lesen</button>
      <div class="sh">So muss die Tabelle aussehen</div>
      <div class="small muted">Eine Kopfzeile mit <b>Mo, Di, Mi, Do, Fr</b>, links die Stunde (1, 2, 3 …) und optional die Zeit (08:00-08:45). In die Felder kommt das Fach – gern mit Raum in Klammern: <code>Mathe (204)</code>. Nur A- oder B-Woche: <code>Physik [A] / Chemie [B]</code>. Abkürzungen wie D, E, M, Ph, Ek, Sk, Ku werden erkannt.</div>
      <button class="linkbtn" data-a="ttTemplate">Leere Vorlage herunterladen (CSV für Excel)</button>`;
    return h;
  }
  const maxP = Math.max(...r.lessons.map(l => l.period)), days = Math.max(5, r.days);
  h += `<div class="info goodbox">✅<div><b>${r.lessons.length} Stunden</b> in ${new Set(r.lessons.map(l => l.subject)).size} Fächern erkannt${Object.keys(r.periods).length ? `, ${Object.keys(r.periods).length} Uhrzeiten` : ''}${r.ab ? ', mit A/B-Wochen' : ''}.</div></div>`;
  if (r.newSubjects.length) h += `<div class="warn" style="margin-top:8px">🆕<div>Neue Fächer werden angelegt: <b>${r.newSubjects.map(s => esc(s.name)).join(', ')}</b>. Stimmt ein Name nicht, kannst du ihn danach unter Einstellungen → Fächer ändern.</div></div>`;
  h += `<div class="ttwrap" style="margin-top:12px"><div class="tt" style="--days:${days}"><div class="th"></div>${Array.from({ length: days }, (_, i) => `<div class="th">${WD[(i + 1) % 7]}</div>`).join('')}`;
  for (let p = 1; p <= maxP; p++) {
    const tm = r.periods[p] || period(p);
    h += `<div class="tp">${p}${tm ? `<small>${tm.s}</small>` : ''}</div>`;
    for (let d = 1; d <= days; d++) {
      const ls = r.lessons.filter(l => l.day === d && l.period === p);
      h += `<div class="tc">${ls.map(l => `<div class="in" style="--c:${l._color};${ls.length > 1 ? 'margin-bottom:2px' : ''}"><b>${esc(l._short || l._name)}${l.week !== 'all' ? ' <span style="font-size:9px">' + l.week + '</span>' : ''}</b><span>${esc(l.room)}</span></div>`).join('')}</div>`;
    }
  }
  h += `</div></div>`;
  h += `<label class="switch"><span>Bisherigen Stundenplan ersetzen<small>${db.timetable.length ? db.timetable.length + ' Stunden sind schon eingetragen' : 'noch nichts eingetragen'}</small></span><input type="checkbox" class="tgl" data-f="ttrepl"${f._replace ? ' checked' : ''}></label>`;
  if (Object.keys(r.periods).length) h += `<label class="switch"><span>Uhrzeiten übernehmen</span><input type="checkbox" class="tgl" data-f="tttimes"${f._times ? ' checked' : ''}></label>`;
  h += `<div class="actions"><button class="btn ghost" data-a="ttImportReset">Andere Datei</button></div><button class="btn wide" data-a="ttImportDo">Stundenplan übernehmen</button>`;
  return h;
}
async function ttReadFile(file) {
  try {
    const name = file.name.toLowerCase();
    let rows;
    if (/\.(xls|ods)$/.test(name)) throw new Error('Bitte als .xlsx oder .csv speichern (Excel: Datei → Speichern unter).');
    if (/\.(xlsx|xlsm)$/.test(name)) rows = await xlsxRows(await file.arrayBuffer());
    else rows = csvRows(await file.text());
    formState._import = ttParseRows(rows); openSheet(ttImportHTML(), 'ttimport');
  } catch (e) { toast(String(e.message || e)); }
}
function ttImportDo() {
  const f = formState, r = f._import; if (!r) return;
  r.newSubjects.forEach(s => upsert('subjects', { ...s }));
  if (f._replace) db.timetable.slice().forEach(l => removeItem('timetable', l.id));
  r.lessons.forEach(l => {
    if (!f._replace) db.timetable.filter(x => x.day === l.day && x.period === l.period && (x.week === l.week || x.week === 'all' || l.week === 'all')).forEach(x => removeItem('timetable', x.id));
    upsert('timetable', { id: 't' + uid(), day: l.day, period: l.period, week: l.week, subject: l.subject, room: l.room });
  });
  if (f._times && Object.keys(r.periods).length) {
    const maxP = Math.max(db.settings.periods.length, ...Object.keys(r.periods).map(Number), ...r.lessons.map(l => l.period));
    const P = []; for (let p = 1; p <= maxP; p++) P.push(r.periods[p] || db.settings.periods[p - 1] || (P[p - 2] ? { s: P[p - 2].e, e: P[p - 2].e } : { s: '08:00', e: '08:45' }));
    setSetting('periods', P);
  }
  if (r.days === 6) setSetting('days', 6);
  if (r.ab && !db.settings.ab.on) setSetting('ab', { on: true, ref: mondayOf(todayStr()) });
  save(); closeSheet(); ui.view = 'plan'; render();
  toast(`Stundenplan übernommen ✓${r.ab && !db.settings.ab._told ? ' – prüfe unter „Stundenzeiten“, ob diese Woche A oder B ist' : ''}`);
}
function ttTemplate() {
  const P = db.settings.periods;
  const lines = ['Stunde;Zeit;Mo;Di;Mi;Do;Fr'].concat(P.map((p, i) => `${i + 1};${p.s}-${p.e};;;;;`));
  download('stundenplan-vorlage.csv', '﻿' + lines.join('\r\n'), 'text/csv;charset=utf-8');
}
// ---------- GitHub-Synchronisierung ----------
const Sync = {
  state: 'off', running: false, again: false, timer: null,
  configured() { const s = local.sync; return !!(s && s.owner && s.repo && s.token); },
  base() { const s = local.sync; return `https://api.github.com/repos/${encodeURIComponent(s.owner)}/${encodeURIComponent(s.repo)}`; },
  ref() { const b = (local.sync.branch || '').trim(); return b ? 'ref=' + encodeURIComponent(b) + '&' : ''; },
  path() { return (local.sync.path || 'lernplan-daten.json').replace(/^\/+/, ''); },
  headers() { return { Authorization: 'Bearer ' + local.sync.token.trim(), Accept: 'application/vnd.github+json' }; },
  async err(r) {
    let m = ''; try { m = (await r.json()).message || ''; } catch (e) { /* */ }
    if (r.status === 401) return 'Token ungültig oder abgelaufen';
    if (r.status === 403) return 'Keine Berechtigung – der Token braucht „Contents: Read and write“' + (m ? ' (' + m + ')' : '');
    if (r.status === 404) return 'Repository nicht gefunden – Name prüfen und ob der Token Zugriff darauf hat';
    return 'GitHub-Fehler ' + r.status + (m ? ': ' + m : '');
  },
  // Verbindung prüfen: Token -> Konto -> Repository; bei Fehler zugängliche Repositories anbieten
  async connect(s) {
    s.token = (s.token || '').replace(/\s+/g, '').replace(/^["']|["']$/g, '');
    let rp = (s.repo || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/[?#].*$/, '').replace(/\.git$/i, '').replace(/\/+$/, '');
    let ow = (s.owner || '').trim().replace(/^@/, '');
    if (rp.includes('/')) { const q = rp.split('/'); ow = q[0]; rp = q[1]; }
    local.sync = s; s.owner = ow; s.repo = rp;
    const H = this.headers();
    let ur; try { ur = await fetch('https://api.github.com/user', { headers: H, cache: 'no-store' }); } catch (e) { throw new Error('Keine Internetverbindung zu GitHub'); }
    if (ur.status === 401) throw new Error('Der Token ist ungültig oder abgelaufen. Neu erstellen und komplett (github_pat_…) einfügen.');
    const login = ur.ok ? ((await ur.json()).login || '') : '';
    if (!s.owner) s.owner = login;
    if (!s.repo) throw new Error('Bitte den Repository-Namen eintragen');
    let r = await fetch(this.base(), { headers: H, cache: 'no-store' });
    if (r.ok) { const j = await r.json(); s.owner = j.owner.login; s.repo = j.name; return j; }
    if (r.status !== 404) throw new Error(await this.err(r));
    // 404: zeigen, worauf der Token wirklich Zugriff hat
    let list = [];
    try { const l = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', { headers: H, cache: 'no-store' }); if (l.ok) list = await l.json(); } catch (e) { /* */ }
    const low = s.repo.toLowerCase(), m = list.find(x => x.name.toLowerCase() === low) || (list.length === 1 && list[0]);
    if (m && (m.name.toLowerCase() === low || list.length === 1)) { s.owner = m.owner.login; s.repo = m.name; return m; }
    const e = new Error(list.length
      ? `„${ow || login}/${rp}“ gibt es für diesen Token nicht. Der Token hat Zugriff auf:`
      : `Dieser Token (Konto ${login || '?'}) hat auf KEIN Repository Zugriff. Beim Erstellen: „Resource owner“ = dein Konto, „Only select repositories“ → dein Repository wählen, Permissions → Contents: Read and write.`);
    e.repos = list.map(x => x.full_name); throw e;
  },
  async testRepo() { const r = await fetch(this.base(), { headers: this.headers(), cache: 'no-store' }); if (!r.ok) throw new Error(await this.err(r)); return r.json(); },
  async get() {
    const r = await fetch(this.base() + '/contents/' + this.path() + '?' + this.ref() + 't=' + Date.now(), { headers: this.headers(), cache: 'no-store' });
    if (r.status === 404) {
      await this.testRepo();
      if (!local.sync.path) { // alte Datei aus früherer Version übernehmen
        const o = await fetch(this.base() + '/contents/schulplaner-daten.json?t=' + Date.now(), { headers: this.headers(), cache: 'no-store' });
        if (o.ok) { const j = await o.json(); if (j.content) return { data: JSON.parse(b64dec(j.content)), sha: null }; }
      }
      return { data: null, sha: null };
    }
    if (!r.ok) throw new Error(await this.err(r));
    const j = await r.json();
    let content = j.content;
    if (!content && j.git_url) { const b = await fetch(j.git_url, { headers: this.headers(), cache: 'no-store' }); content = (await b.json()).content; }
    return { data: JSON.parse(b64dec(content)), sha: j.sha };
  },
  async put(data, sha) {
    const body = { message: 'Lernplan-Sync ' + new Date().toLocaleString('de-DE'), content: b64enc(JSON.stringify(data)) };
    if (sha) body.sha = sha; if ((local.sync.branch || '').trim()) body.branch = local.sync.branch.trim();
    const r = await fetch(this.base() + '/contents/' + this.path(), { method: 'PUT', headers: { ...this.headers(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.status === 409 || r.status === 422) { const e = new Error('Konflikt'); e.conflict = true; throw e; }
    if (!r.ok) throw new Error(await this.err(r));
    return (await r.json()).content.sha;
  },
  async run(manual) {
    if (!this.configured()) return;
    if (this.running) { this.again = true; return; }
    if (!navigator.onLine) { this.set('off'); if (manual) toast('Offline – wird später synchronisiert'); return; }
    this.running = true; this.set('busy');
    const before = canon(db);
    try {
      let done = false;
      for (let attempt = 0; attempt < 4 && !done; attempt++) {
        const { data, sha } = await this.get();
        const merged = data ? mergeDb(db, migrate(data)) : db;
        db = merged; persist();
        if (!data || canon(merged) !== canon(migrate(data))) {
          try { await this.put(db, sha); } catch (e) { if (e.conflict) continue; throw e; }
        }
        done = true;
      }
      if (!done) throw new Error('Zu viele gleichzeitige Änderungen – bitte gleich nochmal');
      local.dirty = false; local.sync.last = Date.now(); local.sync.err = ''; saveLocal(); this.set('ok');
      if (canon(db) !== before) { HOL = {}; if (!sheetOpen) render(); scheduleReminders(); }
      if (manual) toast('Synchronisiert ✓');
      Files.schedule(800);
    } catch (e) {
      local.sync.err = String(e.message || e); saveLocal(); this.set('err');
      if (manual) toast('Sync-Fehler: ' + local.sync.err);
    } finally {
      this.running = false;
      if (this.again) { this.again = false; this.schedule(1500); }
      if (sheetOpen && sheetMode === 'settings') refreshSettings();
    }
  },
  schedule(ms = 4000) { if (!this.configured()) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.run(), ms); },
  set(st) { this.state = st; renderSyncBtn(); },
};
function mergeDb(a, b) {
  const del = { ...(b.deleted || {}) };
  for (const [k, t] of Object.entries(a.deleted || {})) del[k] = Math.max(del[k] || 0, t);
  const out = { v: 2, deleted: {} };
  for (const c of COLLS) {
    const m = new Map();
    (b[c] || []).forEach(x => m.set(x.id, x));
    (a[c] || []).forEach(x => { const y = m.get(x.id); if (!y || (x.u || 0) >= (y.u || 0)) m.set(x.id, x); });
    out[c] = [...m.values()].filter(x => !(del[x.id] != null && del[x.id] >= (x.u || 0)));
  }
  out.settings = { ...defaults().settings, ...(((a.settings?.u || 0) >= (b.settings?.u || 0)) ? a.settings : b.settings) };
  const cut = Date.now() - 200 * 864e5;
  for (const [k, t] of Object.entries(del)) if (t > cut) out.deleted[k] = t;
  return out;
}
const syncCode = () => 'SP1.' + b64url(JSON.stringify({ o: local.sync.owner, r: local.sync.repo, t: local.sync.token, p: local.sync.path || '', b: local.sync.branch || '' }));
function renderSyncBtn() {
  const b = $('#btnSync'); if (!b) return;
  b.hidden = !Sync.configured();
  const cls = { ok: '', busy: 'busy', err: 'err', off: 'off' }[Sync.state] ?? 'off';
  b.innerHTML = ICON.cloud + `<span class="syncdot ${cls}"></span>`;
  b.title = Sync.state === 'err' ? 'Sync-Fehler: ' + (local.sync?.err || '') : Sync.state === 'busy' ? 'Synchronisiere …' : 'Synchronisiert';
}

// ---------- Online-Aktualisierung: Ferien & Schultermine ----------
const normFerienName = n => /winter|frühjahr|fasching/i.test(n) ? 'Frühjahrsferien' : /herbst|allerheiligen/i.test(n) ? 'Herbstferien' : /weihnacht/i.test(n) ? 'Weihnachtsferien' : /oster/i.test(n) ? 'Osterferien' : /pfingst/i.test(n) ? 'Pfingstferien' : /sommer/i.test(n) ? 'Sommerferien' : n;
async function updateFerienOnline(force) {
  const lo = local.ferienOnline;
  if (!force && lo && Date.now() - lo.t < 7 * 864e5) return;
  if (!navigator.onLine) { if (force) toast('Offline'); return; }
  const y = new Date().getFullYear(), list = [];
  try {
    for (const [a, b] of [[y - 1, y + 1], [y + 2, y + 4], [y + 5, y + 7]]) {
      const r = await fetch(`https://openholidaysapi.org/SchoolHolidays?countryIsoCode=DE&subdivisionCode=DE-BY&languageIsoCode=DE&validFrom=${a}-01-01&validTo=${b}-12-31`, { headers: { accept: 'application/json' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      (await r.json()).forEach(h => {
        const nm = ((h.name || []).find(n => n.language === 'DE') || (h.name || [])[0] || {}).text || 'Ferien';
        if (/buß/i.test(nm) || h.startDate === h.endDate) return;
        if (!list.some(x => x.start === h.startDate)) list.push({ name: normFerienName(nm), start: h.startDate, end: h.endDate });
      });
    }
    list.sort((a, b) => a.start < b.start ? -1 : 1);
    local.ferienOnline = { t: Date.now(), list }; saveLocal(); buildFerien(); EVI = null;
    if (force) toast('Ferien aktualisiert ✓'); if (!sheetOpen) render(); else if (sheetMode === 'settings') refreshSettings();
  } catch (e) { if (force) toast('Ferien-Update nicht möglich: ' + e.message); }
}
function ferienCheck() {
  const lo = local.ferienOnline; if (!lo || !lo.list.length) return null;
  const min = lo.list[0].start, max = lo.list[lo.list.length - 1].start;
  const rel = FERIEN_BUILTIN.filter(f => f.start >= min && f.start <= max);
  const diff = rel.filter(f => !lo.list.some(o => o.start === f.start && o.end === f.end));
  const extra = FERIEN.filter(f => f.online).length;
  return { checked: rel.length, diff, extra };
}
async function updateSchuldaten() { // optional: eine Datei „schuldaten.json“ im Repository überschreibt die eingebauten Termine
  if (!local.schuldatenFile || !navigator.onLine || !location.protocol.startsWith('http')) return;
  try {
    const r = await fetch('schuldaten.json?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return;
    const j = await r.json();
    if (j && j.stand && (!local.schuldaten || j.stand !== local.schuldaten.stand)) { local.schuldaten = j; saveLocal(); EVI = null; if (!sheetOpen) render(); }
  } catch (e) { /* offline */ }
}

// ---------- Erinnerungen (Benachrichtigungen im Hintergrund, soweit das Handy es erlaubt) ----------
let remTimer = null;
function scheduleReminders() { clearTimeout(remTimer); remTimer = setTimeout(writeReminders, 1500); }
async function writeReminders() {
  if (!local.reminders || !('caches' in window)) return;
  const t = todayStr(), list = [];
  const lead = local.remLead ?? 1, at = local.remTime || '';
  allEvents().filter(e => isExam(e) && e.date >= addDays(t, lead ? 1 : 0) && e.date <= addDays(t, 30)).forEach(e => {
    list.push({ id: 'ev' + lead + '-' + e.id + e.date, day: addDays(e.date, -lead), until: e.date, title: (lead === 0 ? 'Heute: ' : lead === 1 ? 'Morgen: ' : 'In ' + lead + ' Tagen: ') + evTitle(e), body: (e.time ? e.time + ' Uhr · ' : '') + (e.notes || 'Viel Erfolg!') });
    if (+e.prep > 0 && !e.done) list.push({ id: 'ls-' + e.id + e.date, day: learnStart(e), until: e.date, title: 'Heute mit dem Lernen starten', body: evTitle(e) + ' am ' + fmtShort(e.date) });
  });
  db.homework.filter(h => !h.done && h.kind === 'lernen' && h.due && h.due >= t && h.due <= addDays(t, 14)).forEach(h => list.push({ id: 'le-' + h.id + h.due, day: h.due, until: h.due, title: 'Heute lernen' + (subj(h.subject).name ? ': ' + subj(h.subject).name : ''), body: h.text }));
  db.homework.filter(h => !h.done && h.kind !== 'lernen' && h.due && h.due > t && h.due <= addDays(t, 14)).forEach(h => list.push({ id: 'hw-' + h.id + h.due, day: addDays(h.due, -1), until: h.due, title: 'Morgen fällig' + (subj(h.subject).name ? ': ' + subj(h.subject).name : ''), body: h.text || HW_KINDS[h.kind] }));
  list.forEach(x => { x.at = at; });
  try { const c = await caches.open('sp-data'); await c.put('./__reminders.json', new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } })); } catch (e) { /* */ }
}
async function enableReminders(on) {
  if (!on) { local.reminders = false; saveLocal(); try { const reg = await navigator.serviceWorker.ready; await reg.periodicSync?.unregister('sp-reminders'); } catch (e) { /* */ } refreshSettings(); return; }
  if (!('Notification' in window) || !('serviceWorker' in navigator)) { toast('Dieser Browser unterstützt keine Benachrichtigungen'); refreshSettings(); return; }
  const p = await Notification.requestPermission();
  if (p !== 'granted') { toast('Benachrichtigungen wurden nicht erlaubt'); refreshSettings(); return; }
  local.reminders = true; saveLocal(); await writeReminders();
  let bg = false;
  try {
    const reg = await navigator.serviceWorker.ready;
    if ('periodicSync' in reg) { const st = await navigator.permissions.query({ name: 'periodic-background-sync' }); if (st.state === 'granted') { await reg.periodicSync.register('sp-reminders', { minInterval: 6 * 3600 * 1000 }); bg = true; } }
  } catch (e) { /* nicht unterstützt */ }
  local.remBg = bg; saveLocal(); refreshSettings();
  toast(bg ? 'Erinnerungen aktiv ✓' : 'Aktiv – Hintergrund-Erinnerungen gehen nur, wenn die App installiert ist');
}
async function showDueReminders() { // beim Öffnen: heutige Erinnerungen als Benachrichtigung, falls noch nicht gezeigt
  if (!local.reminders || Notification?.permission !== 'granted') return;
  try { const reg = await navigator.serviceWorker.ready; reg.active?.postMessage({ type: 'check-reminders' }); } catch (e) { /* */ }
}

// ---------- Einstellungen ----------
function refreshSettings() { if (sheetOpen && sheetMode === 'settings') openSheet(settingsHTML(), 'settings'); }
function openSettings() { sheetReturn = null; openSheet(settingsHTML(), 'settings'); }
function settingsHTML() {
  const s = db.settings, k = klasse();
  const sel = (key, opts) => `<select class="inp" data-s="${key}" style="width:auto;padding:8px 10px">${opts.map(([v, l]) => `<option value="${v}"${String(s[key]) === String(v) ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
  const lsel = (key, opts, def) => `<select class="inp" data-l="${key}" style="width:auto;padding:8px 10px">${opts.map(([v, l]) => `<option value="${v}"${String(local[key] ?? def) === String(v) ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
  const sy = local.sync || {};
  let h = sheetHead('Einstellungen', '<button class="link" data-a="close" style="text-align:right">Fertig</button>', '<span style="min-width:70px"></span>');
  if (deferredPrompt) h += '<button class="btn wide" data-a="install" style="margin-top:0">📲 Als App installieren</button>';
  h += `<div class="sh">Schule</div><div class="small muted">Realschule Bayern · Schuljahr ${curSy()}</div>
    <div class="fl">Klasse</div><div class="wrap">${[5, 6, 7, 8, 9, 10].map(n => `<button class="chip${k === n ? ' on' : ''}" data-a="setKlasse" data-v="${n}">${n}.</button>`).join('')}</div>
    <div class="fl">Wahlpflichtfächergruppe</div><div class="wrap">${['I', 'II', 'IIIa', 'IIIb'].map(n => `<button class="chip${s.wpfg === n ? ' on' : ''}" data-a="setWpfg" data-v="${n}">${n}</button>`).join('')}</div>
    <label class="switch"><span>Amtliche Termine anzeigen<small>Zeugnisse, Abschlussprüfung (10. Klasse)</small></span><input type="checkbox" class="tgl" data-s="showOfficial"${s.showOfficial ? ' checked' : ''}></label>`;
  // Sync: Die Cloud-Sicherung des Planers sichert alle Einträge zusammen mit allen anderen Apps.
  // Die eigene GitHub-Synchronisierung bleibt für die Dateien der Ablage (und für alle, die sie schon nutzen).
  h += `<div class="sh">Cloud-Sicherung</div><div class="info">☁️<div>Termine, Stundenplan, Prüfungen und Aufgaben sichert der <b>Planer</b> automatisch – zusammen mit allen anderen Apps. Einrichten im Planer-Menü unter <b>Sync</b>.</div></div>`;
  if (!Sync.configured()) h += `<details style="margin-top:10px"><summary style="font-weight:650;cursor:pointer">Erweitert: eigene GitHub-Synchronisierung (auch für die Dateien der Ablage)</summary>`;
  else h += `<div class="small muted" style="margin:8px 0">Du nutzt zusätzlich die eigene GitHub-Synchronisierung. Sie sichert auch die Dateien der Ablage; der Planer-Sync überlässt ihr deshalb die Schul-Daten.</div>`;
  if (Sync.configured()) {
    h += `<div class="${sy.err ? 'warn' : 'info goodbox'}">${sy.err ? '⚠️' : '☁️'}<div><b>${esc(sy.owner)}/${esc(sy.repo)}</b><br>${sy.err ? 'Fehler: ' + esc(sy.err) : sy.last ? 'Zuletzt synchronisiert: ' + new Date(sy.last).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'Noch nicht synchronisiert'}</div></div>
      <div class="actions"><button class="btn" data-a="syncNow">Jetzt synchronisieren</button><button class="btn ghost" data-a="syncCode">Code für 2. Gerät</button><button class="btn danger" data-a="syncOff">Trennen</button></div>
      <div class="small muted" style="margin-top:8px">Änderungen werden automatisch hochgeladen, beim Öffnen wird der neueste Stand geholt. Gleichzeitige Änderungen auf zwei Handys werden zusammengeführt.</div>`;
  } else {
    h += `<div class="small">Damit dein Planer auf mehreren Geräten gleich ist, speichert die App die Daten in einem <b>privaten</b> GitHub-Repository.</div>
      <details style="margin-top:8px"><summary style="font-weight:650;cursor:pointer">Einrichtung Schritt für Schritt</summary><ol class="steps">
      <li>Du kannst dasselbe <b>private</b> Repository und denselben Token wie in der Training-App nehmen – die Lernplan-Daten liegen in eigenen Dateien. Oder ein neues privates Repository anlegen (Haken bei „Add a README file“).</li>
      <li>Profilbild → <b>Settings</b> → <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Fine-grained tokens</b> → <b>Generate new token</b>.</li>
      <li>Bei „Repository access“: <b>Only select repositories</b> → <code>lernplan-daten</code>.</li>
      <li>Bei „Permissions“ → Repository permissions → <b>Contents: Read and write</b>. Ablaufdatum z. B. 1 Jahr.</li>
      <li>Token kopieren (beginnt mit <code>github_pat_</code>) und unten einfügen.</li></ol>
      <div class="small muted">Der Token bleibt nur auf diesem Gerät. Er kann ausschließlich auf dieses eine Repository zugreifen.</div></details>
      <div class="row2"><div><label class="fl">GitHub-Name (optional)</label><input class="inp" data-sync="owner" value="${esc(sy.owner || '')}" placeholder="dein-github-name" autocapitalize="off" autocomplete="off"></div><div><label class="fl">Repository</label><input class="inp" data-sync="repo" value="${esc(sy.repo || '')}" placeholder="z. B. dein bestehendes Repository" autocapitalize="off" autocomplete="off"></div></div>
      <label class="fl">Branch (leer = Standard)</label><input class="inp" data-sync="branch" value="${esc(sy.branch || '')}" placeholder="main" autocapitalize="off" autocomplete="off">
      <label class="fl">Token</label><input class="inp" type="password" data-sync="token" value="${esc(sy.token || '')}" placeholder="github_pat_…" autocomplete="off">
      <button class="btn wide" data-a="syncConnect">Verbinden</button><div id="syncPick"></div>
      <label class="fl">… oder Verbindungscode vom anderen Gerät einfügen</label><div class="row"><input class="inp" id="syncCodeIn" placeholder="SP1.…" autocomplete="off"><button class="btn ghost" data-a="syncCodeUse">OK</button></div></details>`;
  }
  // Erinnerungen
  const notifOk = 'Notification' in window;
  h += `<div class="sh">Erinnerungen</div>
    <label class="switch"><span>Benachrichtigungen<small>Abend vor Prüfungen, Lernstart, fällige Aufgaben</small></span><input type="checkbox" class="tgl" data-a="remToggle"${local.reminders && notifOk && Notification.permission === 'granted' ? ' checked' : ''}${notifOk ? '' : ' disabled'}></label>
    ${local.reminders ? `<div class="small muted">${local.remBg ? 'Android prüft ca. alle paar Stunden im Hintergrund (den genauen Zeitpunkt bestimmt das Handy).' : 'Hintergrund-Erinnerungen funktionieren nur in der installierten App (Chrome, Android). Sonst erscheinen sie beim Öffnen.'}</div><div class="actions"><button class="btn ghost" data-a="remTest">Test-Benachrichtigung</button></div>` : ''}`;
  h += `<div class="switch"><span>Prüfungs-Erinnerung</span>${lsel('remLead', [[0, 'am Prüfungstag'], [1, '1 Tag vorher'], [2, '2 Tage vorher'], [3, '3 Tage vorher']], 1)}</div>
    <div class="switch"><span>Frühestens um<small>Uhrzeit der Benachrichtigung</small></span>${lsel('remTime', [['', 'beim Öffnen'], ['07:00', '7:00'], ['12:00', '12:00'], ['16:00', '16:00'], ['18:00', '18:00'], ['20:00', '20:00']], '')}</div>`;
  // Fächer
  h += `<div class="sh">Fächer</div><div class="card lcard">${db.subjects.map(x => `<div class="frow" data-a="subjEditS" data-v="${x.id}" style="cursor:pointer"><i class="dot" style="--c:${x.color}"></i><div><div class="fn">${esc(x.name)} <span class="muted small">${esc(x.short)}</span></div><div class="fd">${[x.teacher, x.room && 'Raum ' + x.room].filter(Boolean).map(esc).join(' · ') || 'antippen zum Bearbeiten'}</div></div></div>`).join('')}</div>
    <button class="addline" data-a="subjNew">${ICON.plus} Fach hinzufügen</button>`;
  // Darstellung
  h += `<div class="sh">Darstellung</div>
    <div class="small muted" style="margin-bottom:8px">Farben: im Planer-Menü unter <b>Design</b> – gilt für alle Apps.</div>
    <div class="switch"><span>Startansicht<small>beim Öffnen der App</small></span>${lsel('startView', START_VIEWS, 'heute')}</div>
    <div class="fl">Schriftgröße</div>
    <div class="seg">${[['s', 'Klein'], ['m', 'Normal'], ['l', 'Groß']].map(([kk, l]) => `<button class="${(local.fs || 'm') === kk ? 'on' : ''}" data-a="fontSize" data-v="${kk}">${l}</button>`).join('')}</div>
    <div class="fl">Woche beginnt am</div>
    <div class="seg">${[[1, 'Montag'], [0, 'Sonntag']].map(([kk, l]) => `<button class="${(s.ws === 0 ? 0 : 1) === kk ? 'on' : ''}" data-a="weekStart" data-v="${kk}">${l}</button>`).join('')}</div>
    <label class="switch"><span>Kalenderwochen anzeigen</span><input type="checkbox" class="tgl" data-s="kw"${s.kw ? ' checked' : ''}></label>
    <label class="switch"><span>Mariä Himmelfahrt (15.8.) als Feiertag</span><input type="checkbox" class="tgl" data-s="mariae"${s.mariae ? ' checked' : ''}></label>
    <div class="switch"><span>Vorschau auf „Heute“</span>${sel('agendaDays', [[7, '7 Tage'], [14, '14 Tage'], [21, '21 Tage'], [30, '30 Tage']])}</div>
    <div class="switch"><span>„Lernen starten“ standardmäßig</span>${sel('prepDays', [[0, 'aus'], [3, '3 Tage vorher'], [5, '5 Tage vorher'], [7, '7 Tage vorher'], [10, '10 Tage vorher'], [14, '14 Tage vorher']])}</div>
    <label class="switch"><span>Stundenplan: Uhrzeiten anzeigen</span><input type="checkbox" class="tgl" data-s="ttTimes"${s.ttTimes !== false ? ' checked' : ''}></label>
    <label class="switch"><span>Stundenplan: Samstag anzeigen</span><input type="checkbox" class="tgl" data-f="days6s"${s.days === 6 ? ' checked' : ''}></label>
    <button class="btn ghost" data-a="periods" style="margin-top:10px">Stundenzeiten & A/B-Wochen</button>`;
  // Online
  const fc = ferienCheck(), lo = local.ferienOnline;
  h += `<div class="sh">Ferien & Termine aus dem Internet</div>
    <div class="small">${lo ? `Zuletzt geprüft: ${new Date(lo.t).toLocaleDateString('de-DE')}. ` : 'Noch nicht online geprüft. '}${fc ? (fc.diff.length ? `⚠️ ${fc.diff.length} Abweichung(en) zu den amtlichen Daten – es gelten die amtlichen.` : `✓ ${fc.checked} Ferienzeiträume stimmen mit den amtlichen Daten überein.`) + (fc.extra ? ` ${fc.extra} zusätzliche Zeiträume nach 2030 geladen.` : '') : ''}</div>
    <div class="small muted" style="margin-top:4px">Schultermine (Zeugnisse, Abschlussprüfung) Stand ${esc(schuldaten().stand)}.</div>
    <div class="actions"><button class="btn ghost" data-a="ferienUpd">Jetzt aktualisieren</button></div>`;
  // Daten
  h += `<div class="sh">Daten & Sicherung</div>
    <div class="small muted">Das Backup enthält alle Einträge, aber nicht die Dateien der Ablage – die werden über die GitHub-Synchronisierung gesichert.</div>
    <div class="actions"><button class="btn ghost" data-a="backup">Backup speichern</button><button class="btn ghost" data-a="restore">Backup laden</button></div>
    <div class="actions"><button class="btn ghost" data-a="exportIcs">Termine als .ics</button><button class="btn ghost" data-a="exportFerien">Ferien als .ics</button></div>
    <div class="small muted" style="margin-top:6px">.ics-Dateien lassen sich in Google Kalender importieren (am PC: Einstellungen → Importieren).</div>
    <div class="actions"><button class="btn danger" data-a="reset">Alle Daten löschen</button></div>
    <div class="sh">Info</div><div class="small muted">Lernplan · Version 5.0 · Ferien: BayMBl. 2022 Nr. 747 und OpenHolidays · Alle Angaben ohne Gewähr.<br><br>Am PC: <b>N</b> neu · <b>T</b> heute · <b>1–5</b> Bereiche · <b>← →</b> blättern</div>`;
  return h;
}
function setWpfg(g) { setSetting('wpfg', g); }

// ---------- Export ----------
function download(name, text, type) {
  const blob = new Blob([text], { type }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
const icsEsc = s => String(s || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
function icsFold(line) { const out = []; while (line.length > 73) { out.push(line.slice(0, 73)); line = ' ' + line.slice(73); } out.push(line); return out.join('\r\n'); }
function buildICS(own, ferien) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lernplan//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + (own ? 'Lernplan' : 'Ferien Bayern'), 'X-WR-TIMEZONE:Europe/Berlin'];
  const ve = (id, start, end, summary, desc, time) => {
    L.push('BEGIN:VEVENT', 'UID:' + id + '@lernplan', 'DTSTAMP:' + stamp);
    if (time) { const [hh, mm] = time.split(':').map(Number), eh = Math.min(23, hh + 1), em = hh >= 23 ? 59 : mm; L.push('DTSTART;TZID=Europe/Berlin:' + start.replace(/-/g, '') + 'T' + pad(hh) + pad(mm) + '00', 'DTEND;TZID=Europe/Berlin:' + start.replace(/-/g, '') + 'T' + pad(eh) + pad(em) + '00'); }
    else L.push('DTSTART;VALUE=DATE:' + start.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + addDays(end || start, 1).replace(/-/g, ''));
    L.push('SUMMARY:' + icsEsc(summary)); if (desc) L.push('DESCRIPTION:' + icsEsc(desc)); L.push('TRANSP:TRANSPARENT', 'END:VEVENT');
  };
  if (own) allEvents().forEach(e => ve(e.id, e.date, e.end, evTitle(e), e.notes, e.time));
  if (ferien) {
    FERIEN.forEach(f => ve('ferien-' + f.start, f.start, f.end, f.name + ' (Bayern)', 'Schulferien Bayern', ''));
    const maxY = +FERIEN[FERIEN.length - 1].end.slice(0, 4);
    for (let y = 2024; y <= maxY; y++) Object.entries(holidaysOf(y)).forEach(([d, x]) => { if (!x.minor) ve('ft-' + d, d, d, x.name + (x.schoolOnly ? ' (unterrichtsfrei)' : ''), '', ''); });
  }
  L.push('END:VCALENDAR'); return L.map(icsFold).join('\r\n');
}

// ---------- Toast & Tooltip ----------
let toastTimer;
function toast(msg, btn, fn) {
  const el = $('#toast'); $('#toastMsg').textContent = msg;
  const b = $('#toastBtn');
  if (btn) { b.hidden = false; b.textContent = btn; b.onclick = () => { el.classList.remove('show'); fn(); }; } else b.hidden = true;
  el.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), btn ? 5000 : 2800);
}
function showTip(el) {
  const tip = $('#ctip'), r = el.getBoundingClientRect();
  tip.textContent = el.dataset.tip; tip.hidden = false;
  const w = tip.offsetWidth;
  tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
  tip.style.top = Math.max(8, r.top - tip.offsetHeight - 6) + 'px';
  clearTimeout(showTip.t); showTip.t = setTimeout(() => tip.hidden = true, 2500);
}

// ---------- Rendern ----------
function applyFont() {
  const z = { s: 0.92, m: 1, l: 1.12 }[local.fs] || 1;
  document.documentElement.style.zoom = z === 1 ? '' : String(z);
}
function applyTheme() {
  const t = local.theme, r = document.documentElement;
  if (t === 'auto') delete r.dataset.theme; else r.dataset.theme = t;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name=theme-color]').content = dark ? '#151515' : '#f6f6f4';
}
// Im Planer eingebettet: Monat/Woche/Tag zeigt der große Planer-Kalender (mit Stundenplan, Prüfungen, Ferien),
// hier bleiben die schul-eigenen Listen Termine, Ferien und Fehlzeiten.
const IN_PLANER = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
if (IN_PLANER) document.addEventListener('DOMContentLoaded', () => { const tl = document.querySelector('.tab[data-v="kalender"] .tl'); if (tl) tl.textContent = 'Termine'; });
const SUBNAV = {
  kalender: ['kal', IN_PLANER ? [['termine', 'Termine'], ['ferien', 'Ferien'], ['fehlzeiten', 'Fehlzeiten']] : [['monat', 'Monat'], ['woche', 'Woche'], ['tag', 'Tag'], ['termine', 'Termine'], ['ferien', 'Ferien'], ['fehlzeiten', 'Fehlzeiten']]],
  aufgaben: ['auf', [['offen', 'Offen'], ['erledigt', 'Erledigt'], ['ablage', 'Ablage'], ['lernzeit', 'Lernzeit']]],
};
function render() {
  if (IN_PLANER && ui.view === 'kalender' && ['monat', 'woche', 'tag'].includes(ui.kal)) ui.kal = 'termine';
  const v = ui.view, c = pd(ui.cursor), t = todayStr();
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x.dataset.v === v));
  const calNav = v === 'kalender' && (ui.kal === 'monat' || ui.kal === 'tag' || ui.kal === 'woche');
  $('#title').textContent = v === 'heute' ? 'Schule' : calNav ? MON[c.getMonth()] + ' ' + c.getFullYear() : { kalender: IN_PLANER ? 'Termine' : 'Kalender', plan: 'Stundenplan', aufgaben: ui.auf === 'ablage' ? 'Ablage' : 'Aufgaben', lehrgang: 'Lehrgänge', morgen: 'Morgen' }[v];
  $('#nav').hidden = !calNav;
  $('#btnToday').hidden = !(calNav && ui.cursor !== t);
  const sn = $('#subnav'), cfg = SUBNAV[v];
  if (cfg) {
    const [key, opts] = cfg; sn.hidden = false;
    sn.innerHTML = opts.map(([k, l]) => {
      let badge = '';
      if (k === 'offen') { const n = db.homework.filter(h => !h.done).length; if (n) badge = ` · ${n}`; }
      if (k === 'lernzeit' && local.timer) badge = ' ⏱';
      return `<button class="chip sm${ui[key] === k ? ' on' : ''}" data-a="sub" data-v="${key}:${k}">${l}${badge}</button>`;
    }).join('');
  } else sn.hidden = true;
  $('#fab').hidden = v === 'plan' || v === 'morgen' || (v === 'aufgaben' && ui.auf === 'lernzeit' && local.timer);
  $('#view').innerHTML = v === 'heute' ? homeHTML() : v === 'kalender' ? kalenderHTML() : v === 'plan' ? planHTML() : v === 'aufgaben' ? aufgabenHTML() : v === 'lehrgang' ? lehrgangHTML() : v === 'morgen' ? morgenHTML() : homeHTML();
  if (v === 'aufgaben' && ui.auf === 'ablage') updateStoreInfo();
  renderSyncBtn(); tickClock();
}
function shift(dir) {
  if (ui.view !== 'kalender') return;
  if (ui.kal === 'monat') {
    const d = pd(ui.cursor), day = d.getDate(), n = new Date(d.getFullYear(), d.getMonth() + dir, 1);
    n.setDate(Math.min(day, new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate())); ui.cursor = ds(n);
  } else if (ui.kal === 'tag') ui.cursor = addDays(ui.cursor, dir); else if (ui.kal === 'woche') ui.cursor = addDays(ui.cursor, 7 * dir); else return;
  render();
}
function fabAction() {
  const v = ui.view;
  if (v === 'heute') return openChooser();
  if (v === 'kalender') return ui.kal === 'fehlzeiten' ? openAbs(null) : openForm(null, ui.kal === 'woche' && mondayOf(ui.cursor) !== mondayOf(todayStr()) ? mondayOf(ui.cursor) : null);
  if (v === 'aufgaben') return ui.auf === 'lernzeit' ? openStudy(null) : ui.auf === 'ablage' ? openScan({}) : openHw(null);
  if (v === 'lehrgang') return ui.camp ? openHw(null, { campId: ui.camp, due: (() => { const c = db.camps.find(x => x.id === ui.camp); return c ? nextSchoolDay(c.end || c.start) : ''; })() }) : openCamp(null);
}

// ---------- Klick-Aktionen ----------
document.addEventListener('click', e => {
  const tipEl = e.target.closest('[data-tip]'); if (tipEl) { showTip(tipEl); return; }
  const a = e.target.closest('[data-a]'); if (!a) return;
  const act = a.dataset.a, v = a.dataset.v, f = formState;
  switch (act) {
    // Navigation
    case 'tab': if (sheetOpen) { sheetReturn = null; closeSheet(); } if (v === 'lehrgang' && ui.view === 'lehrgang') ui.camp = null; ui.view = v; render(); window.scrollTo(0, 0); break;
    case 'sub': { const [k, val] = v.split(':'); ui[k] = val; render(); window.scrollTo(0, 0); break; }
    case 'prev': shift(-1); break;
    case 'next': shift(1); break;
    case 'today': ui.cursor = todayStr(); render(); break;
    case 'cell': if (ui.cursor === v) { ui.kal = 'tag'; window.scrollTo(0, 0); } else ui.cursor = v; render(); break;
    case 'goday': ui.cursor = v; ui.view = 'kalender'; ui.kal = 'tag'; render(); window.scrollTo(0, 0); break;
    case 'wday': ui.cursor = v; render(); break;
    case 'kalWoche': ui.view = 'kalender'; ui.kal = 'woche'; render(); break;
    case 'kalList': ui.view = 'kalender'; ui.kal = 'termine'; ui.typeFilter = 'exams'; render(); window.scrollTo(0, 0); break;
    case 'fab': fabAction(); break;
    case 'settings': openSettings(); break;
    case 'close': closeSheet(); break;
    // Einrichtung
    case 'setKlasse': { const kl = { ...(db.settings.klassen || {}) }; kl[curSy()] = +v; setSetting('klassen', kl); save(); EVI = null; sheetOpen ? refreshSettings() : render(); break; }
    case 'setWpfg': setWpfg(v); save(); EVI = null; sheetOpen ? refreshSettings() : render(); break;
    case 'setupDone': setSetting('setupDone', true); save(); render(); toast('Eingerichtet ✓ – trag jetzt deinen Stundenplan ein'); break;
    case 'setupSkip': setSetting('setupDone', true); save(); render(); break;
    // Termine
    case 'add': if (sheetOpen) { sheetReturn = null; } openForm(null, v || null); break;
    case 'edit': { const ev = db.events.find(x => x.id === v); if (ev) { sheetReturn = sheetOpen && sheetMode?.startsWith('subject:') ? (() => { const id = sheetMode.slice(8); return () => openSubject(id); })() : null; openForm(ev); } break; }
    case 'offinfo': offInfo(v); break;
    case 'done': { const ev = db.events.find(x => x.id === v); if (ev) { ev.done = !ev.done; upsert('events', ev); save(); render(); if (ev.done) toast('Stark – als vorbereitet markiert 💪'); } break; }
    case 'ftype': f.type = v; renderFormFields(); break;
    case 'fsubj': f.subject = f.subject === v ? '' : v; renderFormFields(); break;
    case 'useLessonDate': f.date = v; renderFormFields(); break;
    case 'del': deleteEv(f.id); break;
    case 'share': shareEvent(f); break;
    case 'dup': formState = { ...f, id: uid(), date: addDays(f.date, 7), end: f.end ? addDays(f.end, 7) : '', done: false, _new: true }; openSheet(formHTML(), 'form'); break;
    case 'tfilter': ui.typeFilter = v; render(); break;
    case 'weekPlan': { const C = SC(); if (C && C.weekPlan) C.weekPlan(); break; }
    case 'weekPlanSettings': { const C = SC(); if (C && C.weekPlan) C.weekPlan('settings'); break; }
    case 'past': ui.showPast = !ui.showPast; $('#listRes').innerHTML = listResHTML(); break;
    case 'allyears': ui.allYears = !ui.allYears; render(); break;
    // Aufgaben
    case 'newHw': sheetReturn = null; openHw(null); break;
    case 'hwedit': { const h = db.homework.find(x => x.id === v); if (h) { sheetReturn = null; openHw(h); } break; }
    case 'hwdone': toggleHw(v); if (sheetOpen && sheetMode?.startsWith('subject:')) openSubject(sheetMode.slice(8)); break;
    case 'hsubj': f.subject = v; f._manualSubj = true; $('#ff').innerHTML = hwFieldsHTML(); break;
    case 'hkind': f.kind = v; $('#ff').innerHTML = hwFieldsHTML(); break;
    case 'hdue': f.due = v; f._manualDue = true; $('#ff').innerHTML = hwFieldsHTML(); break;
    case 'hwdel': { const x = removeItem('homework', f.id); save(); closeSheet(); render(); if (x) toast('Aufgabe gelöscht', 'Rückgängig', () => { upsert('homework', x); save(); render(); }); break; }
    case 'hwshare': shareHw(f); break;
    case 'subject': openSubject(v); break;
    // Fächer
    case 'subjEdit': { const back = sheetMode?.startsWith('subject:') ? () => openSubject(v) : null; openSubjEdit(v, back); break; }
    case 'subjEditS': openSubjEdit(v, () => openSettings()); break;
    case 'subjNew': openSubjEdit(null, () => openSettings()); break;
    case 'subjDel': {
      const s = subj(v), n = db.timetable.filter(l => l.subject === v).length;
      if (!confirm(`Fach „${s.name}“ löschen?${n ? `\nEs hängen ${n} Stunden daran – diese werden ebenfalls gelöscht.` : ''}`)) break;
      removeItem('subjects', v); db.timetable.filter(l => l.subject === v).forEach(l => removeItem('timetable', l.id));
      ['events', 'homework', 'study'].forEach(cn => db[cn].filter(x => x.subject === v).forEach(x => upsert(cn, { ...x, subject: '' })));
      save(); const ret = sheetReturn; sheetReturn = null; formState = null; if (ret) ret(); else closeSheet(); toast('Fach gelöscht'); break;
    }
    // Stundenplan
    case 'ttedit': { const [dd, pp] = v.split(':').map(Number); openTT(dd, pp); break; }
    case 'tsubj': f.subject = v; openSheet(ttHTML(), 'tt'); break;
    case 'tweek': f.week = v; openSheet(ttHTML(), 'tt'); break;
    case 'tdel': removeItem('timetable', f.id); save(); closeSheet(); render(); break;
    case 'ttWeek': ui.ttWeek = v; render(); break;
    case 'print': window.print(); break;
    case 'ttImport': sheetReturn = null; openTTImport(); break;
    case 'ttPickFile': $('#ttFile').click(); break;
    case 'ttPasteGo': { const txt = $('#ttPaste').value; if (!txt.trim()) { toast('Erst eine Tabelle einfügen'); break; } try { formState._import = ttParseRows(csvRows(txt)); openSheet(ttImportHTML(), 'ttimport'); } catch (err) { toast(err.message); } break; }
    case 'ttTemplate': ttTemplate(); break;
    case 'ttImportReset': formState._import = null; openSheet(ttImportHTML(), 'ttimport'); break;
    case 'ttImportDo': ttImportDo(); break;
    case 'shareTT': shareTT(); break;
    case 'periods': openPeriods(); break;
    case 'perAdd': { const P = db.settings.periods.slice(), last = P[P.length - 1]; const s = last ? last.e : '08:00'; const m = toMin(s) + 45; P.push({ s, e: pad(Math.floor(m / 60)) + ':' + pad(m % 60) }); setSetting('periods', P); save(); openPeriods(); break; }
    case 'perDel': { const P = db.settings.periods.slice(0, -1); if (P.length < 1) break; setSetting('periods', P); save(); openPeriods(); break; }
    case 'abSet': { const ab = { ...db.settings.ab, on: true, ref: v === 'A' ? mondayOf(todayStr()) : addDays(mondayOf(todayStr()), -7) }; setSetting('ab', ab); save(); ui.ttWeek = null; openPeriods(); break; }
    // Fehlzeiten
    case 'newAbs': sheetReturn = null; openAbs(null); break;
    case 'sickToday': openAbs(null, { date: todayStr() }); break;
    case 'absedit': { const x = db.absences.find(y => y.id === v); if (x) openAbs(x); break; }
    case 'areason': f.reason = v; $('#ff').innerHTML = absFieldsHTML(); break;
    case 'adel': { const x = removeItem('absences', f.id); save(); closeSheet(); render(); if (x) toast('Gelöscht', 'Rückgängig', () => { upsert('absences', x); save(); render(); }); break; }
    // Lernzeit
    case 'goTimer': sheetReturn = null; closeSheet(); ui.view = 'aufgaben'; ui.auf = 'lernzeit'; render(); break;
    case 'timerFor': e.stopPropagation(); if (local.timer && local.timer.running && !confirm('Es läuft schon eine Lernzeit. Neu starten?')) break; startTimer(v); break;
    case 'tStart': startTimer(v); break;
    case 'tPause': local.timer.acc = timerElapsed(); local.timer.running = false; saveLocal(); render(); break;
    case 'tResume': local.timer.start = Date.now(); local.timer.running = true; saveLocal(); render(); break;
    case 'tStop': stopTimer(true); break;
    case 'tCancel': if (confirm('Lernzeit verwerfen?')) stopTimer(false); break;
    case 'studyAdd': openStudy(null); break;
    case 'studyEdit': { const x = db.study.find(y => y.id === v); if (x) openStudy(x); break; }
    case 'lsubj': f.subject = v; $('#ff').innerHTML = studyFieldsHTML(); break;
    case 'ldel': removeItem('study', f.id); save(); closeSheet(); render(); break;
    // Lehrgänge
    case 'campOpen': if (sheetOpen) { sheetReturn = null; closeSheet(); } ui.view = 'lehrgang'; ui.camp = v; ui.campFilter = 'alle'; render(); window.scrollTo(0, 0); break;
    case 'campBack': ui.camp = null; render(); window.scrollTo(0, 0); break;
    case 'campNew': openCamp(null); break;
    case 'campEdit': { const c = db.camps.find(x => x.id === v); if (c) openCamp(c); break; }
    case 'campDel': deleteCamp(f.id); break;
    case 'ckind': f.kind = v; $('#ff').innerHTML = campFieldsHTML(); break;
    case 'campSubjPick': ui.campSubjPick = !ui.campSubjPick; render(); break;
    case 'campSubjAdd': campUpdate(ui.camp, c => { c.subjects = [...new Set([...(c.subjects || []), v])]; c.hidden = (c.hidden || []).filter(x => x !== v); }); render(); break;
    case 'campSubjDel': campUpdate(ui.camp, c => { c.subjects = (c.subjects || []).filter(x => x !== v); c.hidden = [...new Set([...(c.hidden || []), v])]; }); render(); break;
    case 'campFilter': ui.campFilter = v; render(); break;
    case 'allCamps': ui.allCamps = !ui.allCamps; render(); break;
    case 'campTaskAdd': { const c = db.camps.find(x => x.id === ui.camp); openHw(null, { campId: ui.camp, subject: v, due: c ? nextSchoolDay(c.end || c.start) : '' }); break; }
    case 'hwSaveNext': saveHw(true); break;
    case 'hAllSubj': f._allSubj = true; $('#ff').innerHTML = hwFieldsHTML(); break;
    case 'hwHanded': { const h = db.homework.find(x => x.id === v); if (h) { h.handed = !h.handed; upsert('homework', h); save(); render(); } break; }
    case 'ckToggle': campUpdate(ui.camp, c => { const x = (c.checklist || []).find(y => y.id === v); if (x) x.d = !x.d; }); render(); break;
    case 'ckDel': campUpdate(ui.camp, c => { c.checklist = (c.checklist || []).filter(y => y.id !== v); }); render(); break;
    case 'ckAdd': { const inp = $('#ckNew'), t2 = inp.value.trim(); if (!t2) { inp.focus(); break; } campUpdate(ui.camp, c => { c.checklist = (c.checklist || []).concat([{ id: 'k' + uid(), t: t2, d: false }]); }); render(); break; }
    case 'noteOpen': ui.noteOpen = v; render(); setTimeout(() => document.querySelector(`[data-mnote="${v}"]`)?.focus(), 50); break;
    case 'campShare': { const c = db.camps.find(x => x.id === ui.camp); if (c) shareCamp(c); break; }
    case 'nachschreiben': nachschreiben(v); break;
    // Ablage
    case 'docOpen': openDoc(v); break;
    case 'docAdd': pendingAttach = {}; $('#docIn').click(); break;
    case 'scanNew': openScan({ subject: ui.docSubj && !['all', 'none'].includes(ui.docSubj) ? ui.docSubj : '' }); break;
    case 'docSubj': ui.docSubj = v; render(); break;
    case 'docsForSubj': sheetReturn = null; closeSheet(); ui.view = 'aufgaben'; ui.auf = 'ablage'; ui.docSubj = v; render(); break;
    case 'attScan': { const [key, id, sid] = v.split(':'); openScan({ [key]: id, subject: sid || (key === 'hwId' || key === 'eventId' ? (formState && formState.subject) || '' : '') }); break; }
    case 'attFile': { const [key, id, sid] = v.split(':'); pendingAttach = { [key]: id, subject: sid || (formState && formState.subject) || '' }; $('#docIn').click(); break; }
    case 'scanCam': $('#camIn').click(); break;
    case 'scanGal': $('#galIn').click(); break;
    case 'scanDel': { const i = +v; URL.revokeObjectURL(f.pages[i].url); f.pages.splice(i, 1); f.originals.splice(i, 1); openSheet(scanHTML(), 'scan'); break; }
    case 'scanSubj': f.subject = v; openSheet(scanHTML(), 'scan'); break;
    case 'scanSave': a.disabled = true; scanSave(); break;
    case 'docZoom': viewerZoom = Math.min(3, Math.max(0.6, viewerZoom + (+v) * 0.4)); showDocContent(); break;
    case 'docShare': shareDoc(); break;
    case 'docDownload': docBlob(f).then(b => b && downloadBlob(f.name, b)); break;
    case 'docSave': saveDocMeta(); break;
    case 'docSubjSet': f.subject = v; $('.sheet').querySelectorAll('[data-a=docSubjSet]').forEach(b => b.classList.toggle('on', b.dataset.v === v)); break;
    case 'docDel': if (confirm(`„${f.name}“ löschen?`)) { const id = f.id; deleteDoc(id).then(() => { const ret = sheetReturn; sheetReturn = null; if (ret) { formState = null; ret(); const ff = $('#ff'); if (ff && sheetMode === 'hw') ff.innerHTML = hwFieldsHTML(); if (ff && sheetMode === 'form') renderFormFields(); } else { closeSheet(); render(); } toast('Datei gelöscht'); }); } break;
    // Lernplan-Generator & Morgen
    case 'planGen': e.stopPropagation(); openPlanGen(v); break;
    case 'planGenForm': { if (!db.events.some(x => x.id === f.id)) { toast('Bitte den Termin zuerst speichern'); break; } openPlanGen(f.id); break; }
    case 'planDo': planDo(); break;
    case 'goMorgen': ui.view = 'morgen'; render(); window.scrollTo(0, 0); break;
    case 'packToggle': case 'packAll': {
      const d = tomorrowDay(); local.pack = local.pack || {}; const p = local.pack[d] = local.pack[d] || {};
      if (act === 'packAll') [...new Set(lessonsOn(d).map(l => l.subject))].forEach(s => p[s] = true); else p[v] = !p[v];
      Object.keys(local.pack).forEach(k => { if (k < todayStr()) delete local.pack[k]; }); saveLocal(); render(); break;
    }
    // Speichern je nach Formular
    case 'save':
      if (sheetMode === 'camp') { saveCamp(); break; }
      if (sheetMode === 'form') saveForm(); else if (sheetMode === 'hw') saveHw();
      else if (sheetMode === 'subjEdit') saveSubj(); else if (sheetMode === 'tt') saveTT(); else if (sheetMode === 'abs') saveAbs(); else if (sheetMode === 'study') saveStudy();
      break;
    case 'doImport': doImport(); break;
    // Einstellungen
    case 'fontSize': local.fs = v; saveLocal(); applyFont(); refreshSettings(); break;
    case 'weekStart': setSetting('ws', +v); save(); EVI = null; render(); refreshSettings(); break;
    case 'theme': local.theme = v; saveLocal(); applyTheme(); refreshSettings(); break;
    case 'install': if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(() => { deferredPrompt = null; refreshSettings(); if (!sheetOpen) render(); }); } break;
    case 'syncConnect': {
      const old = local.sync, s = { ...(old || {}) };
      document.querySelectorAll('[data-sync]').forEach(i => s[i.dataset.sync] = i.value.trim());
      if (!s.repo || !s.token) { toast('Bitte Repository und Token ausfüllen'); break; }
      a.disabled = true; a.textContent = 'Verbinde …'; const pk = $('#syncPick'); if (pk) pk.innerHTML = '';
      Sync.connect(s).then(r => { if (!r.private && !confirm('Achtung: Dieses Repository ist ÖFFENTLICH – deine Daten wären für alle sichtbar. Trotzdem verwenden?')) throw new Error('abgebrochen'); saveLocal(); return Sync.run(true); })
        .catch(err => { Sync.draft = s; local.sync = old; saveLocal(); const pk2 = $('#syncPick'); a.disabled = false; a.textContent = 'Verbinden'; if (err.repos && pk2) { pk2.innerHTML = `<div class="warn small" style="margin:8px 0">${esc(err.message)}</div>` + err.repos.map(n => `<button class="btn ghost wide" style="margin-bottom:6px" data-a="syncPick" data-v="${esc(n)}">${esc(n)}</button>`).join(''); err.shown = true; } else toast(String(err.message || err)); })
        .finally(() => { if (!$('#syncPick .warn')) refreshSettings(); });
      break;
    }
    case 'syncPick': { const [o, r] = v.split('/'); local.sync = { ...(Sync.draft || local.sync || {}), owner: o, repo: r }; saveLocal(); Sync.run(true).finally(() => refreshSettings()); break; }
    case 'syncNow': Sync.run(true); break;
    case 'syncCode': { const code = syncCode(); (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => toast('Code kopiert – auf dem 2. Gerät unter Einstellungen einfügen. Enthält deinen Token, nur privat weitergeben!')).catch(() => prompt('Verbindungscode (privat halten!):', code)); break; }
    case 'syncCodeUse': {
      const raw = ($('#syncCodeIn').value || '').trim();
      try { if (!raw.startsWith('SP1.')) throw 0; const j = JSON.parse(unb64url(raw.slice(4))); local.sync = { owner: j.o, repo: j.r, token: j.t, path: j.p || '', branch: j.b || '' }; saveLocal(); Sync.run(true).finally(() => refreshSettings()); }
      catch (err) { toast('Ungültiger Code'); }
      break;
    }
    case 'syncOff': if (confirm('Synchronisierung auf diesem Gerät beenden? Deine Daten bleiben hier und auf GitHub erhalten.')) { local.sync = {}; saveLocal(); Sync.set('off'); refreshSettings(); } break;
    case 'remToggle': enableReminders(a.checked); break;
    case 'remTest': navigator.serviceWorker?.ready.then(reg => reg.showNotification('Lernplan', { body: 'So sehen deine Erinnerungen aus 👍', icon: 'icon-192.png', badge: 'icon-192.png' })).catch(() => toast('Test nicht möglich')); break;
    case 'ferienUpd': updateFerienOnline(true); updateSchuldaten(); break;
    case 'backup': download('lernplan-backup-' + todayStr() + '.json', JSON.stringify(db, null, 1), 'application/json'); toast('Backup gespeichert'); break;
    case 'restore': $('#restoreFile').click(); break;
    case 'exportIcs': download('lernplan-termine.ics', buildICS(true, false), 'text/calendar'); break;
    case 'exportFerien': download('ferien-bayern.ics', buildICS(false, true), 'text/calendar'); break;
    case 'reset':
      if (confirm('Wirklich ALLE Daten löschen (Termine, Stundenplan, Aufgaben …)? Speichere vorher ein Backup.') && confirm('Ganz sicher? Das lässt sich nicht rückgängig machen.')) {
        const fresh = defaults(); COLLS.forEach(c => db[c].forEach(x => { if (!fresh[c].some(y => y.id === x.id)) db.deleted[x.id] = Date.now(); }));
        const del = db.deleted; db = fresh; db.deleted = del; db.settings.u = Date.now(); save(); FileDB.keys().then(ks => ks.forEach(k => FileDB.del(k))).catch(() => {}); LOCAL_FILES = new Set(); closeSheet(); render(); toast('Alle Daten gelöscht');
      }
      break;
  }
});

// ---------- Eingaben ----------
document.addEventListener('input', e => {
  const el = e.target, f = formState, k = el.dataset.f;
  if (k === 'search') { ui.search = el.value; $('#listRes').innerHTML = listResHTML(); return; }
  if (k === 'docsearch') { ui.docSearch = el.value; const pos = el.selectionStart; render(); const n = $('[data-f=docsearch]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } return; }
  if (f && f._scan && k === 'scanname') { f.name = el.value; return; }
  if (f && f._doc && (k === 'docname' || k === 'docnotes')) { f[k === 'docname' ? 'name' : 'notes'] = el.value; return; }
  if (f && f._plan && k === 'pltopics') { f.topics = el.value; clearTimeout(window._plT); window._plT = setTimeout(() => { const ta = $('[data-f=pltopics]'), pos = ta.selectionStart; openSheet(planGenHTML(), 'plangen'); const n = $('[data-f=pltopics]'); n.focus(); n.setSelectionRange(pos, pos); }, 700); return; }
  if (el.dataset.sync) { local.sync = { ...(local.sync || {}), [el.dataset.sync]: el.value.trim() }; saveLocal(); return; }
  if (el.dataset.per) { const P = db.settings.periods.map(p => ({ ...p })); P[+el.dataset.i][el.dataset.per] = el.value; setSetting('periods', P); save(); return; }
  if (!f || !k) return;
  switch (k) {
    case 'qa': {
      const r = parseQuick(el.value);
      ['type', 'subject', 'date', 'time'].forEach(x => { if (r[x]) f[x] = r[x]; });
      if (r.title) { f.title = r.title; f._qaTitle = r.title; } else if (f._qaTitle && f.title === f._qaTitle) f.title = '';
      renderQaPreview(r); renderFormFields(); return;
    }
    case 'title': case 'time': case 'notes': case 'prep': f[k] = el.value; return;
    case 'date': case 'end': f[k] = el.value; if (k === 'date' && f.end && f.end <= f.date) f.end = addDays(f.date, 1); $('#fwarn').innerHTML = warnHTML(); return;
    case 'hwtext': {
      f.text = el.value;
      if (f._new) {
        const r = parseQuick(el.value, { hw: true }); let ch = false;
        if (r.subject && !f._manualSubj && f.subject !== r.subject) { f.subject = r.subject; ch = true; }
        if (r.date && !f._manualDue && f.due !== r.date) { f.due = r.date; ch = true; }
        renderQaPreview({ subject: r.subject, date: r.date }, $('#hwPrev'));
        if (ch) $('#ff').innerHTML = hwFieldsHTML();
      }
      return;
    }
    case 'hdue': f.due = el.value; f._manualDue = true; return;
    case 'hpage': f.page = el.value; return;
    case 'hnotes': f.notes = el.value; return;
    case 'ctitle': f.title = el.value; return;
    case 'cplace': f.place = el.value; return;
    case 'cnotes': f.notes = el.value; return;
    case 'cstart': case 'cend': f[k === 'cstart' ? 'start' : 'end'] = el.value; if (f.end && f.end < f.start) f.end = f.start; $('#ff').innerHTML = campFieldsHTML(); return;
    case 'sname': f.name = el.value; return;
    case 'sshort': f.short = el.value; return;
    case 'steacher': f.teacher = el.value; return;
    case 'sroom': f.room = el.value; return;
    case 'scolor': f.color = el.value; return;
    case 'troom': f.room = el.value; return;
    case 'adate': f.date = el.value; if (!f.end) { f.lessons = lessonsOn(f.date).length || f.lessons; } $('#ff').innerHTML = absFieldsHTML(); return;
    case 'aend': f.end = el.value; return;
    case 'alessons': f.lessons = el.value; return;
    case 'anote': f.note = el.value; return;
    case 'ldate': f.date = el.value; return;
    case 'lmin': f.min = el.value; return;
  }
});
window.addEventListener('storage', e => {
  if (!e.key || !/^(sg-shared-calendar-v1|pulsplan\.v1|sg-wochenplan-v1|wk_log|wk_activities)$/.test(e.key)) return;
  if (ui.view === 'kalender' && ui.kal === 'termine' && document.activeElement?.id !== 'q') render();
});
document.addEventListener('change', e => {
  const el = e.target, f = formState, k = el.dataset.f;
  if (f && f._scan && k === 'scanmode') { f.docMode = el.checked; if (f.originals.length) scanReprocess(); return; }
  if (f && f._doc && ['dochw', 'docev', 'doccamp'].includes(k)) { f[{ dochw: 'hwId', docev: 'eventId', doccamp: 'campId' }[k]] = el.value; if (k === 'dochw' && el.value && !f.subject) f.subject = (db.homework.find(x => x.id === el.value) || {}).subject || ''; return; }
  if (f && f._plan && ['plstart', 'plmin', 'plwe', 'plex', 'plcamp'].includes(k)) { if (k === 'plstart') f.start = el.value || f.start; else if (k === 'plmin') f.min = +el.value; else f[{ plwe: 'weekends', plex: 'skipExams', plcamp: 'skipCamps' }[k]] = el.checked; openSheet(planGenHTML(), 'plangen'); return; }
  if (el.dataset.mdone != null) { const sid = el.dataset.mdone; campUpdate(ui.camp, c => { c.missed = c.missed || {}; c.missed[sid] = { ...(c.missed[sid] || {}), done: el.checked }; }); render(); return; }
  if (el.dataset.mnote != null) { const sid = el.dataset.mnote; campUpdate(ui.camp, c => { c.missed = c.missed || {}; c.missed[sid] = { ...(c.missed[sid] || {}), note: el.value.trim() }; }); return; }
  if (el.dataset.wp) {
    const C = SC(); if (!C || !C.weekPlanConfig) return;
    const w = C.weekPlanConfig(), k = el.dataset.wp;
    if (k === 'on') w.on = el.checked; else if (k === 'remind') w.remind = el.value; else if (k === 'time') w.time = el.value || '18:00'; else if (k === 'topic') w.topics[el.dataset.t] = el.checked;
    C.weekPlanSave(w); refreshSettings(); return;
  }
  if (el.dataset.s) {
    const key = el.dataset.s;
    setSetting(key, el.type === 'checkbox' ? el.checked : (isNaN(+el.value) ? el.value : +el.value));
    if (key === 'mariae') HOL = {};
    save(); EVI = null; render(); return;
  }
  if (el.dataset.l) {
    const key = el.dataset.l; local[key] = key === 'remLead' ? +el.value : el.value; saveLocal();
    if (key === 'remLead' || key === 'remTime') scheduleReminders();
    return;
  }
  if (k === 'days6s') { setSetting('days', el.checked ? 6 : 5); save(); render(); return; }
  if (k === 'days6') { setSetting('days', el.checked ? 6 : 5); save(); return; }
  if (k === 'abon') { setSetting('ab', { ...db.settings.ab, on: el.checked }); save(); ui.ttWeek = null; openPeriods(); return; }
  if (!f || !k) return;
  if (k === 'multi') { f.end = el.checked ? addDays(f.date, 1) : ''; renderFormFields(); }
  else if (k === 'done') f.done = el.checked;
  else if (k === 'tdouble') f._double = el.checked;
  else if (k === 'amulti') { f.end = el.checked ? addDays(f.date, 1) : ''; $('#ff').innerHTML = absFieldsHTML(); }
  else if (k === 'aexc') f.excused = el.checked;
  else if (k === 'cabs') f.absence = el.checked;
  else if (k === 'ttrepl') f._replace = el.checked;
  else if (k === 'tttimes') f._times = el.checked;
  else if (k === 'cexc') f.excused = el.checked;
  else if (k === 'hkindsel') f.kind = el.value;
  else if (k === 'hcamp') { f.campId = el.value; $('#ff').innerHTML = hwFieldsHTML(); }
  else if (k === 'hdone') f.done = el.checked;
  else if (k === 'hhanded') { f.handed = el.checked; if (el.checked) f.done = true; }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('.ev,.next')) { e.target.click(); return; }
  if (e.key === 'Enter' && e.target.id === 'qa') { e.preventDefault(); saveForm(); return; }
  if (e.key === 'Enter' && e.target.id === 'ckNew') { e.preventDefault(); $('[data-a="ckAdd"]').click(); return; }
  if (e.key === 'Escape' && sheetOpen) { closeSheet(); return; }
  if (sheetOpen) { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') $('.sheet [data-a="save"]')?.click(); return; }
  if (e.target.matches('input,textarea,select') || e.metaKey || e.ctrlKey || e.altKey) return;
  const kk = e.key.toLowerCase();
  if (kk === 'n') { e.preventDefault(); fabAction(); }
  else if (kk === 't') { ui.cursor = todayStr(); render(); }
  else if (kk >= '1' && kk <= '5') { ui.view = ['heute', 'kalender', 'plan', 'aufgaben', 'lehrgang'][+kk - 1]; render(); }
  else if (e.key === 'ArrowLeft') shift(-1);
  else if (e.key === 'ArrowRight') shift(1);
});
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') { sheetReturn = null; closeSheet(); } });
$('#docIn').addEventListener('change', async e => { const files = [...e.target.files]; e.target.value = ''; if (!files.length) return; const link = pendingAttach || {}; pendingAttach = null; await addFilesTo(files, link); const ff = $('#ff'); if (sheetOpen && ff && sheetMode === 'hw') ff.innerHTML = hwFieldsHTML(); else if (sheetOpen && ff && sheetMode === 'form') renderFormFields(); else if (!sheetOpen) render(); });
['camIn', 'galIn'].forEach(idn => $('#' + idn).addEventListener('change', e => { const files = [...e.target.files]; e.target.value = ''; if (files.length) scanAddFiles(files); }));
$('#ttFile').addEventListener('change', e => { const file = e.target.files[0]; if (file && formState) ttReadFile(file); e.target.value = ''; });
$('#restoreFile').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result); if (!d || !Array.isArray(d.events)) throw new Error();
      if (!confirm('Backup laden? Die aktuellen Daten werden ersetzt.')) return;
      const old = db; db = migrate(d); db.deleted = { ...(db.deleted || {}) };
      COLLS.forEach(c => old[c].forEach(x => { if (!db[c].some(y => y.id === x.id)) db.deleted[x.id] = Date.now(); }));
      COLLS.forEach(c => db[c].forEach(x => x.u = Date.now())); db.settings.u = Date.now();
      HOL = {}; save(); closeSheet(); render(); toast('Backup geladen ✓');
    } catch (err) { toast('Die Datei ist kein gültiges Backup'); }
  };
  r.readAsText(file); e.target.value = '';
});
(() => { // Wischen im Kalender
  let x0 = null, y0 = null; const v = $('#view');
  v.addEventListener('touchstart', e => { if (e.touches.length === 1) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; } }, { passive: true });
  v.addEventListener('touchend', e => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (ui.view === 'kalender' && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) shift(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
let lastVis = Date.now();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  if (!sheetOpen) render();
  if (Date.now() - lastVis > 30000) { Sync.run(); updateSchuldaten(); showDueReminders(); navigator.serviceWorker?.getRegistration().then(r => r?.update()).catch(() => {}); }
  lastVis = Date.now();
});
window.addEventListener('online', () => Sync.run());
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; if (!sheetOpen) render(); });
window.addEventListener('appinstalled', () => { deferredPrompt = null; toast('Installiert – viel Erfolg im Schuljahr!'); render(); });

// ---------- Start ----------
$('#btnPrev').innerHTML = ICON.left; $('#btnNext').innerHTML = ICON.right;
$('#btnSettings').innerHTML = ICON.sliders; $('#fab').innerHTML = ICON.plus;
document.querySelectorAll('.tab .i').forEach((el, i) => { el.outerHTML = [ICON.home, ICON.month, ICON.plan, ICON.tasks, ICON.sled][i]; });
applyTheme(); applyFont(); buildFerien();
const params = new URLSearchParams(location.search);
const vParam = params.get('v') || location.hash.slice(1);
if (START_VIEWS.some(x => x[0] === local.startView)) ui.view = local.startView;
if (vParam === 'monat') { ui.view = 'kalender'; ui.kal = 'monat'; } else if (['kalender', 'plan', 'aufgaben', 'lehrgang', 'morgen'].includes(vParam)) ui.view = vParam;
if (vParam === 'ablage') { ui.view = 'aufgaben'; ui.auf = 'ablage'; }
if (local.timer) { /* laufender Timer bleibt erhalten */ }
persist(); render();
refreshLocalFiles().then(() => { if (!sheetOpen) render(); handleSharedInbox(); Files.schedule(2500); });
if (params.get('scan') === '1') openScan({});
if (params.get('neu') === '1') openForm(null);
if (params.get('aufgabe') === '1') openHw(null);
if (params.get('import')) { const p = params.get('import'); history.replaceState(null, '', location.pathname); openImport(p); }
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const hadCtrl = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('../sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw?.addEventListener('statechange', () => { if (nw.state === 'activated' && hadCtrl) toast('Neue Version installiert', 'Neu laden', () => location.reload()); });
    });
  }).catch(() => {});
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
Sync.set(Sync.configured() ? (local.sync.err ? 'err' : 'ok') : 'off');
Sync.run(); updateFerienOnline(false); updateSchuldaten(); scheduleReminders(); showDueReminders();
setInterval(() => { if (!sheetOpen && (ui.view === 'heute' || ui.view === 'plan') && !document.hidden) render(); }, 60000);
