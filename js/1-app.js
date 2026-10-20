/* Kalender – die große Ansicht für alle Termine und Aufgaben des Verbunds.
 * Daten kommen ausschließlich über window.SharedCalendar (siehe Verbund-Block am Ende der Seite):
 * dieselben Termine und Aufgaben wie in allen anderen Apps, inklusive Cloud-Sync. */
document.addEventListener("DOMContentLoaded", function () {
"use strict";
var C = window.SharedCalendar;
var $ = function (id) { return document.getElementById(id); };
var MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
var MS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
var WDL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
var WDS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
var PALETTE = ["#2d4a6b", "#2b5fd9", "#2f7d57", "#c0303f", "#b4532a", "#8a6d1f", "#6b4a3a", "#7a4fa0", "#3d6b73", "#4b5b66"];
var REP = [["", "Nie"], ["d", "Täglich"], ["w", "Wöchentlich"], ["2w", "Alle 2 Wochen"], ["m", "Monatlich"], ["y", "Jährlich"]];
var PREF_KEY = "sg-kalender-prefs";
var MODS = { schule: { title: "Schule", src: "schule/" }, pause: { title: "Pause", src: "pause/" } };
var MOBILE = function () { return innerWidth <= 760; };

/* ---------- Hilfen ---------- */
function pad(n) { return (n < 10 ? "0" : "") + n; }
function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
function today() { return iso(new Date()); }
function mins(t) { if (!t) return null; var p = t.split(":"); return +p[0] * 60 + +p[1]; }
function hm(m) { m = Math.max(0, Math.min(1439, Math.round(m))); return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
function nowMin() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function monday(s) { var d = parse(s); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return iso(d); }
function short(s) { var d = parse(s); return WDS[d.getDay()] + ", " + d.getDate() + ". " + MS[d.getMonth()]; }
function long(s) { var d = parse(s); return WDL[d.getDay()] + ", " + d.getDate() + ". " + MON[d.getMonth()]; }
function rel(s) {
  var t = today(); if (s === t) return "Heute"; if (s === addDays(t, 1)) return "Morgen"; if (s === addDays(t, -1)) return "Gestern";
  return short(s);
}
function kw(s) { var d = parse(s); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); var w1 = new Date(d.getFullYear(), 0, 4); return 1 + Math.round(((d - w1) / 864e5 - 3 + (w1.getDay() + 6) % 7) / 7); }
function dur(m) { if (m < 60) return m + " Min."; var h = Math.floor(m / 60), r = m % 60; return h + " Std." + (r ? " " + r + " Min." : ""); }
function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")"; }

/* ---------- Einstellungen dieses Geräts ---------- */
var P = (function () { try { return JSON.parse(localStorage.getItem(PREF_KEY) || "{}"); } catch (e) { return {}; } })();
P.hidden = P.hidden || {}; if (P.showTasks == null) P.showTasks = true; P.theme = P.theme || "system";
function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify(P)); } catch (e) {} }
function applyTheme() { document.documentElement.setAttribute("data-theme", "dark"); } // alle Apps sind dunkel, die Farbwelt kommt aus dem Design-Block
applyTheme();

/* ---------- Zustand ---------- */
var S = {
  tab: "brief",                                  // brief | cal | tasks | schule | pause
  view: P.view || (MOBILE() ? "3" : "w"),        // 1 | 3 | w | m | a
  anchor: today(), mini: null, qaKind: "event",
  edit: null,                                    // { kind: "event"|"task", draft, occ }
  sel: null
};
S.mini = S.anchor.slice(0, 8) + "01";

/* ---------- Kalender (= Apps) und Farben ---------- */
function calendars() {
  // Feste Kalender plus alle Quellen, die wirklich Einträge haben (alte App-Namen bleiben so lesbar)
  var used = {};
  C.list().concat(C.tasks.list()).forEach(function (e) { used[e.app] = 1; });
  var core = { Kalender: 1, Lernplan: 1, Training: 1 };
  var pp = jsonKey("pulsplan.v1"); if (pp && pp.entries && pp.entries.length) used.Atmung = 1;
  var list = C.sources.filter(function (a) { return core[a[0]] || used[a[0]]; }).map(function (a) { return { name: a[0], color: a[1] }; });
  if (lpDb()) list.splice(1, 0, { name: "Stundenplan", color: "#7f9cf5" });
  list.push({ name: "Ferien & Feiertage", color: "#4f8a5b" });
  C.list().concat(C.tasks.list()).forEach(function (e) {
    if (e.app && !list.some(function (c) { return c.name === e.app; })) list.push({ name: e.app, color: PALETTE[list.length % PALETTE.length] });
  });
  return list;
}
function calColor(name) { var c = calendars().find(function (x) { return x.name === name; }); return c ? c.color : PALETTE[0]; }
function colorOf(e) { return e.color || calColor(e.app); }
function colorT(e) { return tone(colorOf(e)); }
function visible(e) { return !P.hidden[e.app || ""]; }
function isDark() { return true; }
function tone(hex) { // im Dunkelmodus 35 % Richtung Weiß, damit dunkle Kalenderfarben sichtbar bleiben
  if (!isDark() || hex.charAt(0) !== "#") return hex;
  var n = parseInt(hex.slice(1), 16), f = function (v) { return Math.round(v + (255 - v) * .35); };
  return "#" + [n >> 16, n >> 8 & 255, n & 255].map(function (v) { return pad2(f(v).toString(16)); }).join("");
}
function pad2(x) { return x.length < 2 ? "0" + x : x; }
function styleVars(e) { var c = tone(colorOf(e)); return "--c:" + c + ";--cb:" + hexA(c, isDark() ? .22 : .16); }

/* ---------- Verbundene Daten aus Lernplan (nur lesen) ----------
 * Lernplan hat einen eigenen Speicher und eigenen Sync. Der Kalender zeigt dessen Prüfungen,
 * Schultermine, Lehrgänge und offene Hausaufgaben an, ändert dort aber nichts. */
var LP_KEY = "schulkalender-bayern-v1", LP_URL = "#schule", TB_URL = "training/";
var LP_TYPES = { sa: ["Schulaufgabe", "#e5484d"], ka: ["Kurzarbeit", "#c99200"], ex: ["Ex", "#f76b15"], test: ["Test", "#d6409f"], referat: ["Referat", "#8e4ec6"],
  abgabe: ["Abgabe", "#0090ff"], termin: ["Schultermin", "#12a594"], frei: ["Schulfrei", "#30a46c"], sonst: ["", "#8d8d8d"], ap: ["Abschlussprüfung", "#b4231e"] };
var FERIEN = [["Sommerferien", "2024-07-29", "2024-09-09"], ["Herbstferien", "2024-10-28", "2024-10-31"], ["Weihnachtsferien", "2024-12-23", "2025-01-03"],
  ["Frühjahrsferien", "2025-03-03", "2025-03-07"], ["Osterferien", "2025-04-14", "2025-04-25"], ["Pfingstferien", "2025-06-10", "2025-06-20"],
  ["Sommerferien", "2025-08-01", "2025-09-15"], ["Herbstferien", "2025-11-03", "2025-11-07"], ["Weihnachtsferien", "2025-12-22", "2026-01-05"],
  ["Frühjahrsferien", "2026-02-16", "2026-02-20"], ["Osterferien", "2026-03-30", "2026-04-10"], ["Pfingstferien", "2026-05-26", "2026-06-05"],
  ["Sommerferien", "2026-08-03", "2026-09-14"], ["Herbstferien", "2026-11-02", "2026-11-06"], ["Weihnachtsferien", "2026-12-24", "2027-01-08"],
  ["Frühjahrsferien", "2027-02-08", "2027-02-12"], ["Osterferien", "2027-03-22", "2027-04-02"], ["Pfingstferien", "2027-05-18", "2027-05-28"],
  ["Sommerferien", "2027-08-02", "2027-09-13"], ["Herbstferien", "2027-11-02", "2027-11-05"], ["Weihnachtsferien", "2027-12-24", "2028-01-07"],
  ["Frühjahrsferien", "2028-02-28", "2028-03-03"], ["Osterferien", "2028-04-10", "2028-04-21"], ["Pfingstferien", "2028-06-06", "2028-06-16"],
  ["Sommerferien", "2028-07-31", "2028-09-11"], ["Herbstferien", "2028-10-30", "2028-11-03"], ["Weihnachtsferien", "2028-12-23", "2029-01-05"],
  ["Frühjahrsferien", "2029-02-12", "2029-02-16"], ["Osterferien", "2029-03-26", "2029-04-06"], ["Pfingstferien", "2029-05-22", "2029-06-01"],
  ["Sommerferien", "2029-07-30", "2029-09-10"], ["Herbstferien", "2029-10-29", "2029-11-02"], ["Weihnachtsferien", "2029-12-24", "2030-01-04"],
  ["Frühjahrsferien", "2030-03-04", "2030-03-08"], ["Osterferien", "2030-04-15", "2030-04-26"], ["Pfingstferien", "2030-06-11", "2030-06-21"],
  ["Sommerferien", "2030-07-29", "2030-09-09"]];
var EXT = {};
// Gelesene Fremddaten zwischenspeichern: neu ausgewertet wird nur, wenn sich der gespeicherte Text ändert
var JCACHE = {};
function jsonKey(k) {
  var raw = null; try { raw = localStorage.getItem(k); } catch (e) {}
  var c = JCACHE[k]; if (c && c.raw === raw) return c.val;
  var val = null; try { val = JSON.parse(raw || "null"); } catch (e) {}
  JCACHE[k] = { raw: raw, val: val }; return val;
}
function lpDb() { return jsonKey(LP_KEY); }
function spanDays(start, end, from, to, fn) {
  var a = start > from ? start : from, b = (end || start) < to ? (end || start) : to;
  for (var k = a; k <= b; k = addDays(k, 1)) fn(k);
}
function extItems(from, to, withLessons) {
  var out = [];
  FERIEN.forEach(function (f) {
    spanDays(f[1], f[2], from, to, function (k) { out.push({ id: "fe-" + f[1], title: f[0], date: k, time: "", app: "Ferien & Feiertage", ro: "Bayerische Schulferien", span: [f[1], f[2]] }); });
  });
  for (var hd = from; hd <= to; hd = addDays(hd, 1)) {
    var hn = holidayName(hd);
    if (hn) out.push({ id: "fh-" + hd, title: hn, date: hd, time: "", app: "Ferien & Feiertage", ro: "Gesetzlicher Feiertag in Bayern" });
  }
  // Stundenplan nur in Tag/3 Tage/Woche – im Monat wäre es zu voll
  if (withLessons) for (var ld = from; ld <= to; ld = addDays(ld, 1)) {
    var si = schoolInfo(ld);
    if (si && si.lessons) si.lessons.forEach(function (l) {
      if (!l.s) return;
      out.push({ id: "ls-" + ld + "-" + l.n, title: l.name + (l.room ? " · " + l.room : ""), date: ld, time: l.s, end: l.e, app: "Stundenplan", color: l.color, ro: "Stundenplan", link: LP_URL });
    });
  }
  // Schule (Termine, Lehrgänge), Atmung und Training: gemeinsame Quelle aus dem Verbund
  C.externalItems(from, to).forEach(function (e) {
    if (e.learn) return;   // Lernblöcke stehen hier schon als Aufgabe (homework) – nicht doppelt
    out.push(Object.assign({}, e, { link: e.linkApp === "planer" ? e.linkHash : e.link }));
  });
  out.forEach(function (e) { EXT[e.id] = e; });
  return out;
}

function homework() {
  var db = lpDb(); if (!db) return [];
  var t0 = addDays(today(), -14);
  return (db.homework || []).filter(function (h) { return h.due && (!h.done || h.due >= t0); }).map(function (h) {
    var sn = ((db.subjects || []).find(function (x) { return x.id === h.subject; }) || {}).short || "";
    var t = { id: "hw-" + h.id, title: (sn ? sn + ": " : "") + (h.text || "Hausaufgabe"), due: h.due, done: !!h.done, prio: 0, note: h.notes || "", app: "Lernplan", ro: "Schule", link: LP_URL };
    EXT[t.id] = t; return t;
  });
}
function occ(from, to, withLessons) {
  return C.occurrences(from, to).concat(extItems(from, to, withLessons)).filter(visible)
    .sort(function (a, b) { return (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")); });
}
function tasksAll() { return C.tasks.list().concat(homework()).filter(visible); }
function tasksOn(day) { return P.showTasks ? tasksAll().filter(function (t) { return t.due === day; }) : []; }

/* ---------- Zeitraum der Ansicht ---------- */
function range() {
  var a = S.anchor;
  if (S.view === "1") return [a, a];
  if (S.view === "3") return [a, addDays(a, 2)];
  if (S.view === "w") { var m = monday(a); return [m, addDays(m, 6)]; }
  if (S.view === "a") return [a, addDays(a, 59)];
  var f = a.slice(0, 8) + "01", s = monday(f), e = addDays(s, 41);
  return [s, e];
}
function step(dir) {
  var a = S.anchor;
  if (S.view === "1") S.anchor = addDays(a, dir);
  else if (S.view === "3") S.anchor = addDays(a, 3 * dir);
  else if (S.view === "w") S.anchor = addDays(a, 7 * dir);
  else if (S.view === "a") S.anchor = addDays(a, 30 * dir);
  else { var d = parse(a); S.anchor = iso(new Date(d.getFullYear(), d.getMonth() + dir, 1)); }
  S.mini = S.anchor.slice(0, 8) + "01";
  render();
}
function goto(day, view) { S.anchor = day; if (view) setView(view, true); S.mini = day.slice(0, 8) + "01"; S.tab = "cal"; render(); }
function setView(v, quiet) { S.view = v; P.view = v; savePrefs(); S.tab = "cal"; if (!quiet) render(); }

/* ---------- Kopfzeile ---------- */
var ICON_CAL = "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round'><rect x='3.5' y='5' width='17' height='15.5' rx='2.5'/><path d='M3.5 9.5h17M8 3v4M16 3v4'/></svg>";
function renderBar() {
  var r = range(), title, sub = "";
  $("bar").setAttribute("data-tab", S.tab);
  if (MODS[S.tab]) {
    $("bar").innerHTML = (window.SGDir ? SGDir.backHTML() : "") + "<button class='ib back' data-tab='" + (S.prevTab || "brief") + "' aria-label='Zurück'>‹</button><button class='ib menu-btn' data-a='menu' aria-label='Menü'>☰</button><h1>" + ((window.SGDir && SGDir.pageTitle(S.tab)) || MODS[S.tab].title) +
      "</h1><span class='sp'></span><button class='ib' data-a='reloadmod' title='Neu laden' aria-label='Neu laden'>↻</button>";
    return;
  }
  if (S.tab === "brief") title = "Heute";
  else if (S.tab === "tasks") title = "Aufgaben";
  else if (S.view === "m") { var d = parse(S.anchor); title = (innerWidth <= 480 ? MS : MON)[d.getMonth()] + " " + d.getFullYear(); }
  else if (S.view === "a") title = "Agenda";
  else {
    var a = parse(r[0]), b = parse(r[1]);
    title = a.getMonth() === b.getMonth() ? (innerWidth <= 480 ? MS : MON)[a.getMonth()] + " " + a.getFullYear() : MS[a.getMonth()] + " – " + MS[b.getMonth()] + " " + b.getFullYear();
    if (S.view === "w") sub = "KW " + kw(r[0]);
  }
  var cal = S.tab === "cal";
  var h = (window.SGDir ? SGDir.backHTML() : "") + "<button class='ib menu-btn' data-a='menu' aria-label='Menü'>☰</button><h1>" + esc(title) + (sub ? "<small>" + sub + "</small>" : "") + "</h1>";
  // Auf schmalen Handys blättert man per Wischen – Platz für den Titel
  if (cal && innerWidth > 480) h += "<button class='ib' data-a='prev' aria-label='Zurück'>‹</button><button class='ib' data-a='next' aria-label='Weiter'>›</button>";
  h += "<span class='sp'></span>";
  if (cal) {
    // Auf dem Handy steht „Woche planen“ in der Leiste über dem Kalender – die Kopfzeile bleibt frei
    if (wpOn() && innerWidth > 600) h += "<button class='btn wpbtn' data-a='weekplan' title='Woche planen: Training, Mobility, Atmung, Lernen'>Woche planen</button>";
    h += "<button class='btn' data-a='today'>Heute</button>";
    var views = [["1", "Tag"], ["3", "3 Tage"], ["w", "Woche"], ["m", "Monat"], ["a", "Agenda"]];
    if (innerWidth <= 1000) h += "<select class='vsel' data-a='vsel' aria-label='Ansicht'>" + views.map(function (v) { return "<option value='" + v[0] + "'" + (S.view === v[0] ? " selected" : "") + ">" + v[1] + "</option>"; }).join("") + "</select>";
    else h += "<div class='seg' role='tablist'>" + views.map(function (v) {
      return "<button data-view='" + v[0] + "' class='" + (S.view === v[0] ? "on" : "") + "'>" + v[1] + "</button>";
    }).join("") + "</div>";
  }
  if (innerWidth > 1000) {
    h += "<button class='btn p desk' data-a='new'>Neu</button><button class='ib desk' data-a='palette' title='Suchen (Strg+K)' aria-label='Suchen'>⌕</button>";
  } else h += "<button class='ib' data-a='palette' aria-label='Suchen'>⌕</button>";
  $("bar").innerHTML = h;
}

/* ---------- Wochenplanung im großen Kalender ---------- */
function wpOn() { return !!(C.weekPlanConfig && C.weekPlanConfig().on); }
// Woche, die gerade angezeigt wird (im Monat: die Woche des gewählten Tags), frühestens diese Woche
function wpWeek() { var m = monday(S.view === "m" ? S.anchor : range()[0]), t = monday(today()); return m < t ? t : m; }
function wpStrip() {
  if (!wpOn()) return "";
  var m = wpWeek(), done = C.weekPlanned(m), n = 0;
  if (done) { n = C.list().filter(function (e) { return e.wp === m; }).length; var pp = jsonKey("pulsplan.v1"); if (pp && pp.entries) n += pp.entries.filter(function (e) { return e.wp === m; }).length; }
  return "<div class='wpstrip" + (done ? " ok" : "") + "'><span class='wpi'>" + (done ? "✓" : "🗓") + "</span><span class='wpt'><b>KW " + kw(m) + (m === monday(today()) ? " · diese Woche" : m === addDays(monday(today()), 7) ? " · nächste Woche" : "") + "</b>" +
    "<small>" + (done ? "Geplant · " + n + " Einträge<span class='wpx'> aus der Wochenplanung</span>" : "Noch nicht geplant<span class='wpx'>: Training, Mobility, Atmung und Lernen in 2 Minuten</span>") + "</small></span>" +
    "<button class='btn" + (done ? "" : " p") + "' data-a='weekplan'>" + (done ? "Neu planen" : "Woche planen") + "</button></div>";
}
function wpSideHTML() {
  if (!C.weekPlanConfig) return "";
  var w = C.weekPlanConfig();
  var opt = function (key, label, on, extra) { return "<label class='opt'><input type='checkbox' data-wps='" + key + "'" + (extra || "") + (on ? " checked" : "") + "><span class='sw' style='--c:var(--acc)'></span>" + label + "</label>"; };
  var h = "<div><p class='sh'>Wochenplanung</p>" + opt("on", "Wochenplanung aktiv", w.on);
  if (w.on) {
    h += "<div class='wprem'><select class='small' data-wps='remind' aria-label='Erinnerung'>" + [["", "Keine Erinnerung"], ["sa", "Erinnerung Sa-Abend"], ["so", "Erinnerung So-Abend"]].map(function (x) {
      return "<option value='" + x[0] + "'" + (w.remind === x[0] ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + "</select>" +
      (w.remind ? "<input class='small' type='time' data-wps='time' value='" + esc(w.time) + "' aria-label='Uhrzeit'>" : "") + "</div>";
    h += opt("topic", "Fragen: Training & Laufen", w.topics.training, " data-t='training'") + opt("topic", "Fragen: Mobility & Atmung", w.topics.mobility, " data-t='mobility'") + opt("topic", "Fragen: Lernen & Prüfungen", w.topics.lernen, " data-t='lernen'");
    h += "<button class='btn wide' data-a='weekplan' style='margin-top:6px;width:100%'>Woche planen</button>";
  }
  return h + "</div>";
}

/* ---------- Seitenleiste ---------- */
function renderSide() {
  var m = parse(S.mini), y = m.getFullYear(), mo = m.getMonth();
  var start = monday(S.mini), t = today(), r = range();
  var busy = {};
  occ(start, addDays(start, 41)).forEach(function (e) { busy[e.date] = 1; });
  // Kopf der Seitenleiste: App-Name mit Pfeil öffnet das App-Menü (wie Konten in Mail oder Bereiche in Notion)
  var h = "<button class='brand' data-a='appmenu' aria-label='App wechseln'>" + ICON_CAL + "Planer<span class='bchev'>⌄</span></button>";
  var NI = { brief: GLYPH_SB.brief, cal: GLYPH_SB.cal, tasks: GLYPH_SB.tasks, schule: GLYPH.schule, pause: GLYPH.pause };
  h += "<nav class='nav'>" + [["brief", "Heute", "B"], ["cal", "Kalender", "K"], ["tasks", "Aufgaben", "A"], ["schule", "Schule", ""], ["pause", "Pause", ""]].map(function (x) {
    var n = x[0] === "tasks" ? tasksAll().filter(function (q) { return !q.done && q.due && q.due <= t; }).length : 0;
    return "<button data-tab='" + x[0] + "' class='" + (S.tab === x[0] ? "on" : "") + "'><span class='ni'>" + NI[x[0]] + "</span>" + x[1] + (n ? "<span class='cnt'>" + n + "</span>" : "") + "</button>";
  }).join("") + "</nav>";
  h += "<div class='mini'><div class='mh'><button data-a='mprev' aria-label='Voriger Monat'>‹</button><span>" + MON[mo] + " " + y + "</span><button data-a='mnext' aria-label='Nächster Monat'>›</button></div><div class='mg'>";
  h += ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(function (w) { return "<span class='w'>" + w.charAt(0) + "</span>"; }).join("");
  for (var i = 0; i < 42; i++) {
    var k = addDays(start, i), d = parse(k);
    var cls = (d.getMonth() !== mo ? "o " : "") + (k === t ? "t " : "") + (S.tab === "cal" && k >= r[0] && k <= r[1] && S.view !== "m" && S.view !== "a" ? "inr " : "") + (busy[k] ? "has" : "");
    h += "<button class='" + cls + "' data-day='" + k + "'>" + d.getDate() + "</button>";
  }
  h += "</div></div>";
  h += "<div><p class='sh'>Meine Kalender</p><div class='cals'>" + calendars().map(function (c) {
    return "<label><input type='checkbox' data-cal='" + esc(c.name) + "'" + (P.hidden[c.name] ? "" : " checked") + "><span class='sw' style='--c:" + tone(c.color) + "'></span>" + esc(c.name) + "</label>";
  }).join("") + "</div>";
  h += "<label class='opt' style='margin-top:6px'><input type='checkbox' data-a='showtasks'" + (P.showTasks ? " checked" : "") + "><span class='sw' style='--c:var(--muted)'></span>Aufgaben im Kalender</label></div>";
  h += wpSideHTML();
  var open = tasksAll().filter(function (x) { return !x.done && x.due && x.due <= t; });
  h += "<div><p class='sh'>Heute fällig</p>" + (open.length ? open.slice(0, 6).map(taskRow).join("") : "<div class='empty'>Nichts fällig.</div>") + "</div>";
  var st = C.status();
  h += "<div class='foot'>" +
    "<button class='link syncline " + (st.connected ? (st.error ? "err" : "ok") : "") + "' data-a='sync'>" + (st.connected ? (st.error ? esc(st.error) : "Synchronisiert" + (st.busy ? " …" : "")) : "Nur auf diesem Gerät · Sync einrichten") + "</button>" +
    "<button class='link' data-a='apps'>Alle Apps</button>" +
    (window.SGInstall && !SGInstall.installed() ? "<button class='link' data-a='install'>Planer als App installieren</button>" : "") +
    "<button class='link desk-hint' data-a='help'>Tastenkürzel <span class='kbd'>?</span></button>" +
    "<button class='link' data-a='science'>Wissenschaftliche Grundlagen</button>" +
    "<button class='link' data-a='design'>Design: " + esc(window.SGTheme ? SGTheme.current().name : "") + "</button>" +
    (C.notifyState() === "default" ? "<button class='link' data-a='notify'>Erinnerungen erlauben</button>" : C.notifyState() === "denied" ? "<span class='link'>Benachrichtigungen sind im Browser blockiert</span>" : "") +
    "</div>";
  $("side").innerHTML = h;
}

/* ---------- Zeitraster (Tag, 3 Tage, Woche) ---------- */
function layoutDay(evs) {
  // Überlappende Termine nebeneinander legen: Gruppen bilden, darin Spalten vergeben.
  var items = evs.map(function (e) {
    var s = mins(e.time), en = mins(e.end);
    if (en == null || en <= s) en = Math.min(1440, s + 60);
    return { e: e, s: s, en: Math.max(en, s + 15) };
  }).sort(function (a, b) { return a.s - b.s || b.en - a.en; });
  var groups = [], cur = null, curEnd = -1;
  items.forEach(function (it) {
    if (!cur || it.s >= curEnd) { cur = []; groups.push(cur); curEnd = it.en; } else curEnd = Math.max(curEnd, it.en);
    cur.push(it);
  });
  groups.forEach(function (g) {
    var cols = [];
    g.forEach(function (it) {
      var c = cols.findIndex(function (end) { return end <= it.s; });
      if (c < 0) { c = cols.length; cols.push(0); }
      cols[c] = it.en; it.col = c;
    });
    g.forEach(function (it) { it.n = cols.length; });
  });
  return items;
}
function renderGrid(days) {
  var t = today(), nm = nowMin(), hour = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hour"));
  var evs = occ(days[0], days[days.length - 1], true);
  var h = "<div class='tg' style='--n:" + days.length + "'>";
  h += "<div class='tg-head'><div></div>" + days.map(function (k) {
    var d = parse(k);
    return "<div class='dh" + (k === t ? " t" : "") + "' data-day='" + k + "' data-v='1'><span class='wd'>" + WDS[d.getDay()] + "</span><span class='dn'>" + d.getDate() + "</span></div>";
  }).join("") + "</div>";
  var anyAd = days.some(function (k) { return evs.some(function (e) { return e.date === k && !e.time; }) || tasksOn(k).length; });
  h += "<div class='tg-ad'><div class='gutlab'>" + (anyAd ? "ganzt." : "") + "</div>" + days.map(function (k) {
    return "<div class='ad' data-adday='" + k + "'>" + evs.filter(function (e) { return e.date === k && !e.time; }).map(chip).join("") + tasksOn(k).map(taskChip).join("") + "</div>";
  }).join("") + "</div>";
  h += "<div class='tg-scroll' id='tgs'><div class='tg-body'><div class='hours'>";
  for (var i = 1; i < 24; i++) h += "<span style='top:" + i * hour + "px'>" + pad(i) + ":00</span>";
  h += "</div>";
  days.forEach(function (k) {
    var wd = parse(k).getDay();
    h += "<div class='col" + (wd === 0 || wd === 6 ? " we" : "") + "' data-col='" + k + "'>";
    layoutDay(evs.filter(function (e) { return e.date === k && e.time; })).forEach(function (it) {
      var top = it.s / 60 * hour, ht = Math.max((it.en - it.s) / 60 * hour - 2, 16), w = 100 / it.n;
      var past = k < t || (k === t && it.en < nm);
      var shortCls = ht < 34 ? " short" : "";
      h += "<div class='evb" + (past ? " past" : "") + shortCls + (S.sel === it.e.id + k ? " sel" : "") + "' data-ev='" + esc(it.e.id) + "' data-date='" + k + "' style='" + styleVars(it.e) +
        ";top:" + top + "px;height:" + ht + "px;left:calc(" + it.col * w + "% + 1px);width:calc(" + w + "% - 3px)'><b>" + esc(it.e.title) + "</b><span>" + esc(it.e.time) +
        (it.e.end ? "–" + esc(it.e.end) : "") + "</span><i class='rs'></i></div>";
    });
    if (k === t) h += "<div class='nowl' style='top:" + nm / 60 * hour + "px'></div>";
    h += "</div>";
  });
  h += "</div></div></div>";
  return h;
}
function chip(e) {
  return "<div class='chip' data-ev='" + esc(e.id) + "' data-date='" + e.date + "' style='" + styleVars(e) + "'>" + (e.time ? "<span class='tmc'>" + esc(e.time) + "</span> " : "") + esc(e.title) + "</div>";
}
function taskChip(t) {
  return "<div class='chip task" + (t.done ? " done" : "") + "' data-task='" + esc(t.id) + "' style='--c:" + colorT(t) + "'><span class='cb' data-check='" + esc(t.id) + "'></span>" + esc(t.title) + "</div>";
}

/* ---------- Monat ---------- */
function renderMonth() {
  var r = range(), t = today(), mo = parse(S.anchor).getMonth();
  var evs = occ(r[0], r[1]);
  var rows = parse(addDays(r[0], 35)).getMonth() === mo ? 6 : 5;
  var h = "<div class='mo' style='--rows:" + rows + "'><div class='mo-h'>" + ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(function (w) { return "<div>" + w + "</div>"; }).join("") + "</div>";
  var maxChips = innerHeight < 700 ? 2 : 3;
  for (var w = 0; w < rows; w++) {
    h += "<div class='mo-r'>";
    for (var i = 0; i < 7; i++) {
      var k = addDays(r[0], w * 7 + i), d = parse(k);
      var list = evs.filter(function (e) { return e.date === k; }), tl = tasksOn(k).filter(function (x) { return !x.done; });
      var all = list.map(chip).concat(tl.map(taskChip));
      h += "<div class='mc" + (d.getMonth() !== mo ? " o" : "") + (k === t ? " t" : "") + "' data-mday='" + k + "'><span class='n'>" + d.getDate() + "</span>" +
        all.slice(0, maxChips).join("") + (all.length > maxChips ? "<span class='more'>+" + (all.length - maxChips) + " weitere</span>" : "") + "</div>";
    }
    h += "</div>";
  }
  return h + "</div>";
}

/* ---------- Agenda ---------- */
function evRow(e, showDay) {
  var t = today(), nm = nowMin(), s = mins(e.time), en = mins(e.end);
  var past = e.date < t || (e.date === t && e.time && (en != null ? en : s + 60) < nm);
  var isNow = e.date === t && e.time && s <= nm && (en != null ? en : s + 60) > nm;
  var tm = e.time ? e.time + (e.end ? "–" + e.end : "") : "ganztägig";
  return "<div class='row" + (past ? " past" : "") + (isNow ? " nowrow" : "") + "' data-ev='" + esc(e.id) + "' data-date='" + e.date + "' style='--c:" + colorT(e) + "'><span class='tm'>" +
    (showDay ? rel(e.date) + "<br>" : "") + (isNow ? "jetzt · " + esc(e.end || "") : esc(tm)) + "</span><span class='bar2'></span><span><div class='tt'>" + esc(e.title) + "</div><div class='sub'>" + esc(e.app) +
    (e.rep && e.rep.f ? " · wiederholt sich" : "") + (e.note ? " · " + esc(e.note.split("\n")[0].slice(0, 80)) : "") + "</div></span></div>";
}
function renderAgenda() {
  var r = range(), t = today(), evs = occ(r[0], r[1]);
  var h = "<div class='page'><div class='page-in'>", any = false;
  for (var i = 0; i < 60; i++) {
    var k = addDays(r[0], i), list = evs.filter(function (e) { return e.date === k; }), tl = tasksOn(k);
    if (!list.length && !tl.length && k !== t) continue;
    any = true;
    var d = parse(k);
    h += "<div class='ag-day" + (k === t ? " t" : "") + "'><div class='d' data-day='" + k + "' data-v='1'><small>" + WDS[d.getDay()] + "</small><b>" + d.getDate() + "</b><small>" + MS[d.getMonth()] + "</small></div><div class='l'>" +
      (list.length || tl.length ? list.map(function (e) { return evRow(e); }).join("") + tl.map(taskRow).join("") : "<div class='empty'>Nichts geplant.</div>") + "</div></div>";
  }
  if (!any) h += "<div class='empty'>In den nächsten 60 Tagen ist nichts geplant.</div>";
  return h + "</div></div>";
}

/* ---------- Aufgaben ---------- */
function taskRow(t) {
  var td = today(), late = t.due && t.due < td && !t.done, own = !/^hw-/.test(t.id);
  return "<div class='task" + (t.done ? " done" : "") + (t.prio ? " prio" : "") + "' style='--c:" + colorT(t) + "'><button class='ck' data-check='" + esc(t.id) + "' aria-label='Erledigt'>✓</button><div class='bd' data-task='" + esc(t.id) + "'>" +
    "<div class='tt'>" + esc(t.title) + "</div><div class='meta'>" +
    (t.due ? "<span class='" + (late ? "late" : "") + "'>" + (late ? "überfällig · " : "") + rel(t.due) + "</span>" : "") +
    "<span><span class='dot'></span>" + esc(t.app === "Lernplan" ? "Schule" : t.app) + "</span>" + (t.note ? "<span class='nt'>" + esc(t.note.split("\n")[0].slice(0, 60)) + "</span>" : "") + "</div></div>" +
    (own && !t.done ? "<button class='fl" + (t.prio ? " on" : "") + "' data-a='flag' data-v='" + esc(t.id) + "' aria-label='Wichtig'>⚑</button>" : "") + "</div>";
}
/* Aufgaben wie in Erinnerungen: intelligente Listen oben, darunter die Liste nach Datum gruppiert */
var TLISTS = [["today", "Heute", "#0a84ff", "◉"], ["planned", "Geplant", "#ff453a", "◷"], ["flag", "Wichtig", "#ff9f0a", "⚑"], ["all", "Alle", "#8e8e93", "≡"], ["done", "Erledigt", "#30d158", "✓"]];
function renderTasks() {
  var td = today(), all = tasksAll(), open = all.filter(function (t) { return !t.done; }), done = all.filter(function (t) { return t.done; });
  var L = S.tlist || "today", src = S.tsrc || "";
  var bySrc = function (list) { return src ? list.filter(function (t) { return t.app === src; }) : list; };
  var sets = {
    today: open.filter(function (t) { return t.due && t.due <= td; }),
    planned: open.filter(function (t) { return t.due; }),
    flag: open.filter(function (t) { return t.prio; }),
    all: open, done: done
  };
  var h = "<div class='page'><div class='page-in tasks2'>";
  h += "<div class='tl-grid'>" + TLISTS.map(function (l) {
    return "<button class='tl-tile" + (L === l[0] ? " on" : "") + "' data-a='tlist' data-v='" + l[0] + "' style='--c:" + l[2] + "'><span class='ic'>" + l[3] + "</span><b>" + bySrc(sets[l[0]]).length + "</b><span class='nm'>" + l[1] + "</span></button>";
  }).join("") + "</div>";
  var apps = [];
  all.forEach(function (t) { if (apps.indexOf(t.app) < 0) apps.push(t.app); });
  if (apps.length > 1) h += "<div class='tl-src'>" + [""].concat(apps).map(function (a) {
    return "<button class='" + (src === a ? "on" : "") + "' data-a='tsrc' data-v='" + esc(a) + "'>" + (a ? esc(a === "Lernplan" ? "Schule" : a) : "Alle Listen") + "</button>";
  }).join("") + "</div>";
  h += quickAdd("task");
  var list = bySrc(sets[L]), title = (TLISTS.find(function (l) { return l[0] === L; }) || TLISTS[0])[1];
  h += "<div class='card tl-list'><h2 class='tl-h'>" + title + "<span>" + list.length + "</span></h2>";
  if (L === "done") {
    h += list.length ? list.sort(function (a, b) { return (b.doneAt || 0) - (a.doneAt || 0); }).slice(0, 80).map(taskRow).join("") + "<div style='margin-top:10px'><button class='btn' data-a='cleardone'>Erledigte entfernen</button></div>" : "<div class='empty'>Noch nichts erledigt.</div>";
  } else {
    var sort = function (a, b) { return (a.due || "9").localeCompare(b.due || "9") || (b.prio || 0) - (a.prio || 0); };
    var groups = L === "today" ? [["Überfällig", list.filter(function (t) { return t.due < td; })], ["Heute", list.filter(function (t) { return t.due === td; })]]
      : L === "flag" ? [["", list.slice().sort(sort)]]
      : [["Überfällig", list.filter(function (t) { return t.due && t.due < td; })], ["Heute", list.filter(function (t) { return t.due === td; })],
        ["Morgen", list.filter(function (t) { return t.due === addDays(td, 1); })],
        ["Diese und nächste Woche", list.filter(function (t) { return t.due > addDays(td, 1) && t.due <= addDays(monday(td), 13); })],
        ["Später", list.filter(function (t) { return t.due > addDays(monday(td), 13); })]].concat(L === "all" ? [["Ohne Datum", list.filter(function (t) { return !t.due; })]] : []);
    var shown = false;
    groups.forEach(function (g) {
      if (!g[1].length) return; shown = true;
      h += "<div class='tsec'>" + (g[0] ? "<h4>" + g[0] + " <span class='c'>" + g[1].length + "</span></h4>" : "") + g[1].slice().sort(sort).map(taskRow).join("") + "</div>";
    });
    if (!shown) h += "<div class='empty'>" + (L === "today" ? "Für heute ist alles erledigt." : L === "flag" ? "Nichts als wichtig markiert – tippe bei einer Aufgabe auf ⚑." : "Keine offenen Aufgaben. Schreib oben einfach los – z. B. „Vokabeln lernen Freitag“.") + "</div>";
  }
  return h + "</div></div></div>";
}

/* ---------- Briefing ---------- */
function freeSlots(evs, from, to) {
  var busy = evs.filter(function (e) { return e.time; }).map(function (e) { var s = mins(e.time), en = mins(e.end); return [s, en != null && en > s ? en : s + 60]; })
    .sort(function (a, b) { return a[0] - b[0]; });
  var out = [], cur = from;
  busy.forEach(function (b) { if (b[0] > cur && b[0] - cur >= 30) out.push([cur, Math.min(b[0], to)]); cur = Math.max(cur, b[1]); });
  if (to - cur >= 30) out.push([cur, to]);
  return out.filter(function (s) { return s[1] - s[0] >= 30 && s[0] < to; });
}
/* ---------- Heute: gruppierte Listen wie in den Systemeinstellungen ---------- */
var GLYPH = {
  schule: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 8l9-4 9 4-9 4-9-4z'/><path d='M7 10v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5'/></svg>",
  exam: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'><path d='M7 3.5h7l4 4V20H7z'/><path d='M10 12h5M10 15.5h5'/></svg>",
  training: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 12h3l2.5-6 4 12 3-9 1.5 3H21'/></svg>",
  mobility: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'><circle cx='12' cy='4.5' r='1.8'/><path d='M5 9.5l7 1.5 7-1.5M12 11v4l-3 5.5M12 15l3 5.5'/></svg>",
  atmung: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'><path d='M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h7'/></svg>",
  pause: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'><path d='M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z'/><path d='M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16'/></svg>",
  bibel: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 4.5h10.5A3.5 3.5 0 0 1 19 8v11.5H8.5A3.5 3.5 0 0 1 5 16z'/><path d='M12 7.5v5M9.5 9.5h5'/></svg>"
};
var GLYPH_SB = {
  brief: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round'><circle cx='12' cy='12' r='4'/><path d='M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4'/></svg>",
  cal: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round'><rect x='3.5' y='5' width='17' height='15.5' rx='3.5'/><path d='M3.5 10h17M8.5 3v4M15.5 3v4'/></svg>",
  tasks: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'><path d='M4 6.5l1.8 1.8L9 5M4 12.5l1.8 1.8L9 11M4 18.5l1.8 1.8L9 17M12.5 7h7.5M12.5 13h7.5M12.5 19h7.5'/></svg>"
};
function grp(title, right, body, foot) {
  return "<section class='grp'>" + (title || right ? "<header><span>" + title + "</span>" + (right || "") + "</header>" : "") + "<div class='cells'>" + body + "</div>" + (foot ? "<p class='gfoot'>" + foot + "</p>" : "") + "</section>";
}
function navRow(icon, col, title, sub, attrs, done) {
  return "<" + (/href=/.test(attrs) ? "a" : "button") + " class='nrow' " + attrs + "><span class='ic' style='background:" + col + "'>" + GLYPH[icon] + "</span><span class='tx'><b>" + esc(title) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span>" +
    (done ? "<span class='okm'>✓</span>" : "") + "<span class='chev'>›</span></" + (/href=/.test(attrs) ? "a" : "button") + ">";
}
var WDS_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
function renderBrief() {
  var t = today(), nm = nowMin(), hr = new Date().getHours();
  var noHol = function (e) { return e.app !== "Ferien & Feiertage"; };
  var hol = occ(t, t).filter(function (e) { return !noHol(e); })[0];
  var todayEv = occ(t, t).filter(noHol), tomorrow = occ(addDays(t, 1), addDays(t, 1)).filter(noHol);
  var open = tasksAll().filter(function (x) { return !x.done; });
  var due = open.filter(function (x) { return x.due === t; }), late = open.filter(function (x) { return x.due && x.due < t; });
  var timed = todayEv.filter(function (e) { return e.time; });
  var upcoming = timed.filter(function (e) { var en = mins(e.end); return (en != null && en > mins(e.time) ? en : mins(e.time) + 60) > nm; });
  var next = upcoming[0];
  var greet = hr < 11 ? "Guten Morgen" : hr < 18 ? "Guten Tag" : "Guten Abend";
  var wd0 = weatherDay(t), d0 = parse(t);
  // Kopf: großes Datum, darüber Gruß und Wetter, darunter ein Satz zum Tag
  var parts = [];
  parts.push(todayEv.length ? (todayEv.length === 1 ? "einen Termin" : todayEv.length + " Termine") : "keine Termine");
  if (due.length) parts.push(due.length === 1 ? "eine fällige Aufgabe" : due.length + " fällige Aufgaben");
  var s = (hol ? hol.title + ". " : "") + "Heute hast du " + parts.join(" und ") + ".";
  if (late.length) s += " " + (late.length === 1 ? "Eine Aufgabe ist" : late.length + " Aufgaben sind") + " überfällig.";
  var last = timed.length ? timed[timed.length - 1] : null;
  if (last && (mins(last.end) || mins(last.time) + 60) > nm) s += " Ab " + (last.end || hm(mins(last.time) + 60)) + " Uhr bist du frei.";
  var h = "<div class='page'><div class='brief2'><div class='lt'><p class='eyebrow'>" + greet + " · KW " + kw(t) +
    (wd0 ? " · " + wd0.tmax + "° " + wmoText(wd0.code).toLowerCase() : "") + "</p><h1>" + WDS_LONG[d0.getDay()] + ", " + d0.getDate() + ". " + MON[d0.getMonth()] + "</h1><p class='sum'>" + esc(s) + "</p></div>";
  h += quickAdd("auto");
  h += "<div class='cols'><div class='bcol'>";
  if (next) {
    var sm = mins(next.time), diff = sm - nm, en = mins(next.end);
    var when = diff <= 0 ? "läuft gerade" + (en ? " · noch " + dur(en - nm) : "") : "in " + dur(diff);
    h += grp("Als Nächstes", "", "<div class='nextc' data-ev='" + esc(next.id) + "' data-date='" + next.date + "' style='--c:" + colorT(next) + "'><span class='nt'>" + esc(next.time) + "</span><span class='tx'><b>" + esc(next.title) + "</b><small>" +
      when + " · " + esc(next.app) + (next.end ? " · bis " + esc(next.end) : "") + "</small></span></div>");
  }
  var evening = nm > 20 * 60, fday = evening ? tomorrow : todayEv;
  var from = evening ? 7 * 60 : Math.max(nm, 7 * 60), slots = freeSlots(fday, Math.ceil(from / 15) * 15, 21 * 60);
  var free = slots.length ? "Frei " + (evening ? "morgen" : "heute") + ": " + slots.slice(0, 3).map(function (x) { return hm(x[0]) + "–" + hm(x[1]); }).join(", ") : "";
  h += grp("Termine heute", "<button class='lnk' data-a='newtoday'>Neu</button>", todayEv.length ? todayEv.map(function (e) { return evRow(e); }).join("") : "<div class='emptyc'>Keine Termine – der Tag gehört dir.</div>", free);
  h += grp("Aufgaben", "<button class='lnk' data-tab='tasks'>Alle</button>", late.length + due.length ? late.concat(due).map(taskRow).join("") : "<div class='emptyc'>Für heute ist nichts fällig.</div>");
  h += "</div><div class='bcol'>";
  // Bereiche: wie Einträge in den Einstellungen – Symbol, Titel, Stand, Pfeil
  var si = schoolInfo(t), ex = upcomingExams(3), stm = studyToday(), rows = "";
  var schoolSub = !si ? "Stundenplan noch nicht eingerichtet" : si.free ? "Kein Unterricht – " + si.free : !si.lessons.length ? "Heute kein Unterricht" :
    si.lessons.length + " Stunden · " + si.lessons[0].s + "–" + si.lessons[si.lessons.length - 1].e + " Uhr" + (si.week ? " · " + si.week + "-Woche" : "");
  rows += navRow("schule", "#0a84ff", "Schule", schoolSub + (stm ? " · " + stm + " Min. gelernt" : ""), "data-tab='schule'");
  ex.forEach(function (e) { rows += navRow("exam", "#ff453a", e.title, (e.days === 0 ? "heute" : e.days === 1 ? "morgen" : "in " + e.days + " Tagen") + (e.plan ? " · Lernplan " + e.planDone + "/" + e.plan : e.learn ? " · jetzt mit dem Lernen anfangen" : ""), "data-tab='schule'"); });
  trainingToday().forEach(function (x, i) {
    var kind = /mobility/.test(x.href) ? "mobility" : /atmung/.test(x.href) ? "atmung" : "training";
    rows += navRow(kind, kind === "training" ? "#30d158" : kind === "mobility" ? "#ff6482" : "#ff9f0a", x.t, x.sub, "href='" + x.href + "'", x.ok);
  });
  var pz = pauseToday(), bb = bibleToday();
  rows += navRow("pause", "#64d2ff", "Kluge Pause", pz ? pz.count + " von " + pz.goal + " Impulsen heute" : "Wissen und Quiz statt Scrollen", "data-tab='pause'", pz && pz.count >= pz.goal);
  rows += navRow("bibel", "#c79a5b", "Bibel", bb ? (bb.read ? "heute gelesen" : "heute noch nicht gelesen") + (bb.streak ? " · " + bb.streak + " Tage in Folge" : "") : "Täglicher Abschnitt", "href='bibel/'", bb && bb.read);
  h += grp("Deine Bereiche", "", rows);
  // Woche
  var wk = occ(t, addDays(t, 6)), wh = "<div class='week7'>";
  for (var i = 0; i < 7; i++) {
    var k = addDays(t, i), d = parse(k), l = wk.filter(function (e) { return e.date === k && e.app !== "Ferien & Feiertage"; });
    wh += "<button class='" + (i === 0 ? "t" : "") + "' data-day='" + k + "' data-v='1'><small>" + WDS[d.getDay()] + "</small><b>" + d.getDate() + "</b><i>" + l.slice(0, 4).map(function (e) { return "<em style='--c:" + colorT(e) + "'></em>"; }).join("") + "</i></button>";
  }
  wh += "</div>";
  var tf = tomorrow.filter(function (e) { return e.time; })[0] || tomorrow[0];
  h += grp("Diese Woche", (C.weekPlanConfig && C.weekPlanConfig().on ? "<button class='lnk' data-a='weekplan'>Planen</button>" : "") + "<button class='lnk' data-a='toweek'>Öffnen</button>", wh,
    tomorrow.length ? "Morgen " + tomorrow.length + (tomorrow.length === 1 ? " Termin" : " Termine") + (tf.time ? ", ab " + esc(tf.time) : "") + "." : "");
  return h + "</div></div></div></div>";
}

/* ---------- Heute: Schule, Training, Pause und Bibel aus den anderen Bereichen ----------
 * Alles nur gelesen – bearbeitet wird in Schule (Lernplan), Training oder Bibel. */
var EXAM_TYPES = { sa: 1, ka: 1, ex: 1, test: 1, referat: 1, ap: 1 };
function easterSun(y) {
  var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
    h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return iso(new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1));
}
var HOL_FIX = { "01-01": "Neujahr", "01-06": "Heilige Drei Könige", "05-01": "Tag der Arbeit", "08-15": "Mariä Himmelfahrt", "10-03": "Tag der Deutschen Einheit", "11-01": "Allerheiligen", "12-25": "1. Weihnachtstag", "12-26": "2. Weihnachtstag" };
var HOL_EASTER = [[-2, "Karfreitag"], [1, "Ostermontag"], [39, "Christi Himmelfahrt"], [50, "Pfingstmontag"], [60, "Fronleichnam"]];
function holidayName(dstr) { // gesetzliche Feiertage Bayern (wie im Lernplan)
  if (HOL_FIX[dstr.slice(5)]) return HOL_FIX[dstr.slice(5)];
  var e = easterSun(+dstr.slice(0, 4)), hit = HOL_EASTER.find(function (h) { return addDays(e, h[0]) === dstr; });
  return hit ? hit[1] : "";
}
function holidayBY(dstr) { return !!holidayName(dstr); }
function schoolInfo(d) {
  var db = lpDb(); if (!db) return null;
  var wd = parse(d).getDay();
  var fer = FERIEN.find(function (f) { return d >= f[1] && d <= f[2]; });
  if (wd === 0 || wd === 6) return { free: "Wochenende", lessons: [] };
  if (fer) return { free: fer[0], lessons: [] };
  if (holidayBY(d)) return { free: "Feiertag", lessons: [] };
  if ((db.events || []).some(function (e) { return e.type === "frei" && e.date <= d && (e.end || e.date) >= d; })) return { free: "Schulfrei", lessons: [] };
  var ab = db.settings && db.settings.ab, wt = null;
  if (ab && ab.on && ab.ref) { var diff = Math.round((parse(monday(d)) - parse(monday(ab.ref))) / 6048e5); wt = ((diff % 2) + 2) % 2 === 0 ? "A" : "B"; }
  var periods = (db.settings && db.settings.periods) || [];
  var subj = function (id) { return (db.subjects || []).find(function (x) { return x.id === id; }) || {}; };
  var lessons = (db.timetable || []).filter(function (l) { return l.day === wd && (l.week === "all" || !l.week || !wt || l.week === wt); })
    .sort(function (a, b) { return a.period - b.period; })
    .map(function (l) { var p = periods[l.period - 1] || {}; return { n: l.period, s: p.s || "", e: p.e || "", name: subj(l.subject).name || "Stunde", color: subj(l.subject).color || "#888", room: l.room || subj(l.subject).room || "" }; });
  return { free: "", lessons: lessons, week: wt };
}
function upcomingExams(n) {
  var db = lpDb(); if (!db) return [];
  var t = today(), subj = function (id) { return ((db.subjects || []).find(function (x) { return x.id === id; }) || {}).name || ""; };
  return (db.events || []).filter(function (e) { return EXAM_TYPES[e.type] && e.date >= t && !e.done; })
    .sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(0, n)
    .map(function (e) {
      var days = Math.round((parse(e.date) - parse(t)) / 864e5), prep = +e.prep || 0;
      var plan = (db.homework || []).filter(function (h) { return h.planFor === e.id; });
      return { title: (e.title && e.title.trim()) || [(LP_TYPES[e.type] || [""])[0], subj(e.subject)].filter(Boolean).join(" "), date: e.date, days: days,
        learn: prep > 0 && days <= prep, color: (LP_TYPES[e.type] || ["", "#888"])[1], plan: plan.length, planDone: plan.filter(function (h) { return h.done; }).length };
    });
}
function trainingToday() {
  var t = today(), out = [];
  var log = jsonKey("wk_log") || {}, done = log[t] && log[t].done;
  out.push({ t: done ? "Tagestraining erledigt" : "Tagestraining", sub: done ? "✓ gut gemacht" : "in Training öffnen", ok: done, href: "training/" });
  var r = jsonKey("rodelmobility.v1");
  if (r) {
    var B = [["A", "Rücken & Wirbelsäule"], ["B", "Hüfte & Becken"], ["C", "Beinrückseite & Waden"]], b = B[(r.next || 0) % 3];
    var rd = (r.sessions || []).some(function (x) { return x.date === t; });
    out.push({ t: rd ? "Mobility erledigt" : "Mobility · Block " + b[0], sub: rd ? "✓ heute geschafft" : b[1] + " · ca. " + Math.round(((r.dur || 40) * 5 + 60) / 60) + " Min.", ok: rd, href: "training/#mobility" });
  }
  var p = jsonKey("pulsplan.v1");
  if (p) {
    var ent = (p.entries || []).filter(function (e) { return e.date === t; }).sort(function (a, b) { return (a.time || "") < (b.time || "") ? -1 : 1; });
    var ses = (p.sessions || []).filter(function (x) { return x.date === t; }).length;
    var mm = (p.morning || []).find(function (m) { return m.date === t; });
    ent.forEach(function (e, i) { out.push({ t: (e.time ? e.time + " · " : "") + (e.type || "Atmung"), sub: ((e.dur || e.minutes) ? (e.dur || e.minutes) + " Min." : "") + (i < ses ? " · ✓ erledigt" : ""), ok: i < ses, href: "training/#atmung" }); });
    if (mm) out.push({ t: "Morgenmessung", sub: "RMSSD " + mm.rmssd + " ms · Puls " + mm.hr, ok: true, href: "training/#atmung" });
  }
  return out;
}
function pauseToday() {
  var d = jsonKey("denkpause.v1"); if (!d) return null;
  var s = (d.sessions || {})[today()] || {};
  return { count: s.count || 0, goal: d.dailyGoal || 5, minutes: s.minutes || 0 };
}
function bibleToday() {
  var b = jsonKey("zweiminutenbibel_v2"); if (!b) return null;
  return { read: b.lastDate === today(), streak: b.streak || 0 };
}
// Wetter aus dem Training (dort eingestellt und geladen) – hier nur gelesen
function weatherDay(d) {
  var w = jsonKey("wk_weather_cache"); if (!w || !w.data || !w.data.days) return null;
  return w.data.days.find(function (x) { return x.date === d; }) || null;
}
function wmoText(c) {
  return c === 0 ? "Klar" : c <= 2 ? "Teils bewölkt" : c === 3 ? "Bedeckt" : c <= 48 ? "Nebel" : c <= 57 ? "Nieselregen" : c <= 67 ? "Regen" : c <= 77 ? "Schnee" : c <= 82 ? "Regenschauer" : c <= 86 ? "Schneeschauer" : "Gewitter";
}
function studyToday() {
  var db = lpDb(); if (!db || !db.study) return 0;
  var t = today(); return db.study.filter(function (x) { return x.date === t; }).reduce(function (a, x) { return a + (+x.min || 0); }, 0);
}
function briefExtras() {
  var t = today(), h = "";
  var si = schoolInfo(t), ex = upcomingExams(3);
  if (si || ex.length) {
    h += "<div class='grid2'>";
    var stm = studyToday();
    h += "<div class='card'><h3>Schule heute" + (si && si.week ? " · " + si.week + "-Woche" : "") + (stm ? " · " + stm + " Min. gelernt" : "") + "<span class='sp'></span><button class='btn' data-tab='schule'>Öffnen</button></h3>";
    if (!si) h += "<div class='empty'>Noch kein Stundenplan.</div>";
    else if (si.free) h += "<div class='empty'>Kein Unterricht – " + esc(si.free) + ".</div>";
    else if (!si.lessons.length) h += "<div class='empty'>Für heute ist kein Stundenplan eingetragen.</div>";
    else {
      var nm = nowMin();
      h += si.lessons.map(function (l) {
        var past = l.e && mins(l.e) < nm, now = l.s && mins(l.s) <= nm && mins(l.e) > nm;
        return "<div class='row" + (past ? " past" : "") + (now ? " nowrow" : "") + "' data-tab='schule' style='--c:" + tone(l.color) + "'><span class='tm'>" + l.n + ". · " + esc(l.s) + "</span><span class='bar2'></span><span><div class='tt'>" + esc(l.name) + "</div>" +
          (l.room ? "<div class='sub'>Raum " + esc(l.room) + "</div>" : "") + "</span></div>";
      }).join("");
    }
    h += "</div><div class='card'><h3>Prüfungen<span class='sp'></span></h3>" + (ex.length ? ex.map(function (e) {
      return "<div class='row' data-tab='schule' style='--c:" + tone(e.color) + "'><span class='tm'>" + (e.days === 0 ? "heute" : e.days === 1 ? "morgen" : "in " + e.days + " Tagen") + "</span><span class='bar2'></span><span><div class='tt'>" + esc(e.title) + "</div><div class='sub'>" +
        short(e.date) + (e.plan ? " · Lernplan " + e.planDone + "/" + e.plan : e.learn ? " · jetzt mit dem Lernen anfangen" : "") + "</div></span></div>";
    }).join("") : "<div class='empty'>Keine Prüfungen eingetragen.</div>") + "</div></div>";
  }
  var tr = trainingToday(), pz = pauseToday(), bb = bibleToday();
  h += "<div class='grid2'><div class='card'><h3>Training heute<span class='sp'></span><a class='btn' href='training/' style='text-decoration:none'>Öffnen</a></h3>" + tr.map(function (x) {
    return "<a class='row' href='" + x.href + "' style='text-decoration:none;color:inherit;--c:" + (x.ok ? "var(--acc)" : "var(--line)") + "'><span class='bar2'></span><span><div class='tt'>" + esc(x.t) + "</div><div class='sub'>" + esc(x.sub) + "</div></span></a>";
  }).join("") + "</div>";
  h += "<div class='card'><h3>Pause & Ruhe</h3>";
  h += "<div class='row' data-tab='pause' style='--c:var(--acc)'><span class='bar2'></span><span><div class='tt'>Kluge Pause</div><div class='sub'>" +
    (pz ? pz.count + " von " + pz.goal + " Impulsen heute" : "Wissen, Zitate und Quiz statt Scrollen") + " · nach 25–50 Min. Lernen 5 Min. Pause</div></span></div>";
  h += "<a class='row' href='training/#atmung' style='text-decoration:none;color:inherit;--c:var(--line)'><span class='bar2'></span><span><div class='tt'>Durchatmen</div><div class='sub'>Bei Stress: 3–5 zyklische Seufzer, dann 1–2 Min. im 4-6-Takt</div></span></a>";
  h += "<a class='row' href='bibel/' style='text-decoration:none;color:inherit;--c:" + (bb && bb.read ? "var(--acc)" : "var(--line)") + "'><span class='bar2'></span><span><div class='tt'>2 Minuten Bibel</div><div class='sub'>" +
    (bb ? (bb.read ? "✓ heute gelesen" : "heute noch nicht gelesen") + (bb.streak ? " · " + bb.streak + " Tage in Folge" : "") : "Täglicher Abschnitt") + "</div></span></a>";
  h += "</div></div>";
  return h;
}

/* ---------- Schnell-Eingabe mit Datumserkennung ---------- */
var WDN = { sonntag: 0, montag: 1, dienstag: 2, mittwoch: 3, donnerstag: 4, freitag: 5, samstag: 6, "so.": 0, "mo.": 1, "di.": 2, "mi.": 3, "do.": 4, "fr.": 5, "sa.": 6 };
function parseQuick(text) {
  var s = " " + text + " ", out = { title: "", date: "", time: "", end: "", task: false, prio: false, hasDate: false };
  function cut(re, fn) { var m = s.match(re); if (m) { fn(m); s = s.replace(m[0], " "); return true; } return false; }
  cut(/^\s*(aufgabe|todo|to-do)\s*:?\s/i, function () { out.task = true; });
  cut(/\s!+(?=\s)/, function () { out.prio = true; });
  var base = today();
  cut(/\sübermorgen\s/i, function () { out.date = addDays(base, 2); }) ||
  cut(/\smorgen\s/i, function () { out.date = addDays(base, 1); }) ||
  cut(/\sheute\s/i, function () { out.date = base; }) ||
  cut(/\s(?:am\s+)?(\d{1,2})\.(\d{1,2})\.(\d{2,4})?(?=\s)/i, function (m) {
    var y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : parse(base).getFullYear();
    var d = new Date(y, +m[2] - 1, +m[1]);
    if (!m[3] && iso(d) < base) d.setFullYear(y + 1);
    out.date = iso(d);
  }) ||
  cut(/\sin\s+(\d+)\s+(tag|tagen|woche|wochen)\s/i, function (m) { out.date = addDays(base, +m[1] * (/woche/i.test(m[2]) ? 7 : 1)); }) ||
  cut(/\s(?:am\s+)?((?:nächste[nrs]?|kommende[nrs]?)\s+)?(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|mo\.|di\.|mi\.|do\.|fr\.|sa\.|so\.)(?=\s)/i, function (m) {
    var want = WDN[m[2].toLowerCase()], d = parse(base), diff = (want - d.getDay() + 7) % 7;
    if (m[1] && diff === 0) diff = 7; else if (m[1] && diff < 7 && /nächste/i.test(m[1])) diff = diff || 7;
    out.date = addDays(base, diff);
  });
  function t(h, m) { h = +h; m = +(m || 0); return h < 24 && m < 60 ? pad(h) + ":" + pad(m) : ""; }
  cut(/\s(?:von\s+|um\s+|ab\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(?:uhr\s*)?(?:-|–|bis)\s*(\d{1,2})(?:[:.](\d{2}))?\s*(?:uhr)?(?=\s)/i, function (m) {
    out.time = t(m[1], m[2]); out.end = t(m[3], m[4]);
  }) ||
  cut(/\s(?:um\s+|ab\s+)?(\d{1,2})[:.](\d{2})\s*(?:uhr)?(?=\s)/i, function (m) { out.time = t(m[1], m[2]); }) ||
  cut(/\s(?:um\s+|ab\s+)?(\d{1,2})\s*uhr(?=\s)/i, function (m) { out.time = t(m[1]); }) ||
  cut(/\sum\s+(\d{1,2})(?=\s)/i, function (m) { out.time = t(m[1]); });
  cut(/\s(?:für\s+)?(\d+(?:[.,]\d+)?)\s*(h|std\.?|stunden?|min\.?|minuten)(?=\s)/i, function (m) {
    if (!out.time) return;
    var n = parseFloat(m[1].replace(",", ".")), mm = /^m/i.test(m[2]) ? n : n * 60;
    out.end = hm(mins(out.time) + mm);
  });
  if (out.time && !out.end) out.end = hm(Math.min(mins(out.time) + 60, 1439));
  out.hasDate = !!out.date || !!out.time;
  if (!out.date && out.time) out.date = base;
  out.title = s.replace(/\s+(am|um|ab|von|bis|für)\s*$/i, " ").replace(/^\s*(am|um)\s+/i, " ").replace(/\s+/g, " ").trim();
  return out;
}
function quickAdd(kind) {
  var k = kind === "task" ? "task" : S.qaKind;
  return "<div class='qa'><div class='qa-in'><input id='qa' data-kind='" + kind + "' placeholder='" + (k === "task" ? "Neue Aufgabe … z. B. „Referat vorbereiten Freitag !“" : "Neuer Termin … z. B. „Training morgen 17–18:30“") +
    "' autocomplete='off' enterkeyhint='done'>" + (kind === "auto" ? "<div class='qa-kind'><button data-qk='event' class='" + (k === "event" ? "on" : "") + "'>Termin</button><button data-qk='task' class='" + (k === "task" ? "on" : "") + "'>Aufgabe</button></div>" : "") +
    "</div><div class='qa-prev' id='qaPrev'></div></div>";
}
function qaPreview(input) {
  var kind = input.dataset.kind === "task" ? "task" : S.qaKind, q = parseQuick(input.value);
  if (q.task) kind = "task";
  var p = $("qaPrev"); if (!p) return;
  if (!input.value.trim()) { p.innerHTML = MOBILE() ? "" : "<span class='desk-hint'>Enter speichert · Datum und Uhrzeit werden erkannt</span>"; return; }
  p.innerHTML = kind === "task"
    ? "Aufgabe <b>" + esc(q.title || "…") + "</b>" + (q.date ? " · fällig " + rel(q.date) : " · ohne Datum") + (q.prio ? " · wichtig" : "")
    : "Termin <b>" + esc(q.title || "…") + "</b> · " + rel(q.date || today()) + (q.time ? " · " + q.time + "–" + q.end : " · ganztägig");
}
function qaSubmit(input) {
  var kind = input.dataset.kind === "task" ? "task" : S.qaKind, q = parseQuick(input.value);
  if (q.task) kind = "task";
  if (!q.title) return;
  if (kind === "task") C.tasks.add({ title: q.title, due: q.date || "", prio: q.prio, app: C.app });
  else C.add({ title: q.title, date: q.date || today(), time: q.time, end: q.time ? q.end : "", app: C.app });
  input.value = ""; qaPreview(input);
}

/* ---------- Hauptdarstellung ---------- */
var keepScroll = null;
function render() {
  var tgs = $("tgs"); if (tgs) keepScroll = tgs.scrollTop;
  var qa = $("qa"), qaVal = qa ? qa.value : "", qaFocus = qa && document.activeElement === qa;
  renderBar(); renderSide(); renderTabbar();
  var inMod = !!MODS[S.tab];
  $("app").classList.toggle("inmod", inMod); $("view").hidden = inMod; $("mods").hidden = !inMod;
  $("fab").style.visibility = inMod ? "hidden" : "";
  if (inMod) { showModule(S.tab); return; }
  var v = $("view"), h;
  if (S.tab === "brief") h = renderBrief();
  else if (S.tab === "tasks") h = renderTasks();
  else if (S.view === "m") h = renderMonth();
  else if (S.view === "a") h = renderAgenda();
  else { var r = range(), days = []; for (var k = r[0]; k <= r[1]; k = addDays(k, 1)) days.push(k); h = renderGrid(days); }
  if (S.tab === "cal" && S.view !== "a") h = wpStrip() + h;
  v.innerHTML = h;
  var nq = $("qa");
  if (nq) { nq.value = qaVal; if (qaFocus) nq.focus(); qaPreview(nq); }
  var ns = $("tgs");
  if (ns) {
    var hour = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hour"));
    if (keepScroll == null) {
      var r2 = range(), first = occ(r2[0], r2[1]).filter(function (e) { return e.time; }).map(function (e) { return mins(e.time); });
      var target = Math.min(first.length ? Math.min.apply(null, first) : 480, 480) - 30;
      keepScroll = Math.max(0, target / 60 * hour);
    }
    ns.scrollTop = keepScroll;
    var sbw = ns.offsetWidth - ns.clientWidth;
    v.querySelector(".tg").style.setProperty("--sbw", sbw + "px");
  }
}
// Jedes Modul wird nur einmal geladen und bleibt beim Wechseln erhalten (Eingaben gehen nicht verloren).
function loadModule(id, hidden) {
  var box = $("mods"), f = box.querySelector("[data-mod='" + id + "']");
  if (!f) { f = document.createElement("iframe"); f.dataset.mod = id; f.src = MODS[id].src; f.title = MODS[id].title; f.hidden = !!hidden; box.appendChild(f); }
  return f;
}
function showModule(id) {
  loadModule(id);
  Array.prototype.forEach.call($("mods").children, function (f) { f.hidden = f.dataset.mod !== id; });
}
// Schneller wechseln: Schule und Pause im Leerlauf schon im Hintergrund laden
(window.requestIdleCallback || function (f) { return setTimeout(f, 2500); })(function () {
  // nach dem Start nacheinander vorladen, damit das Öffnen der App flüssig bleibt
  var ids = Object.keys(MODS);
  (function next(i) {
    if (i >= ids.length) return;
    setTimeout(function () { if (document.hidden) return next(i); if (S.tab !== ids[i]) loadModule(ids[i], true); next(i + 1); }, i ? 3000 : 4500);
  })(0);
}, { timeout: 4000 });
function setTab(t) {
  if (t === S.tab) return;
  if (!MODS[t]) S.prevTab = t; else if (!MODS[S.tab]) S.prevTab = S.tab;
  S.tab = t;
  if (location.hash !== "#" + t) history.replaceState(null, "", "#" + t);
  closeSide(); render(); $("view").scrollTop = 0;
  // die Übersicht (Verzeichnis) zieht mit, wenn innerhalb der App gewechselt wird
  try { window.dispatchEvent(new CustomEvent("sg-nav", { detail: { r: t } })); } catch (e) {}
}
window.SGPlaner = { setTab: function (t) { setTab(t); }, tab: function () { return S.tab; } };
addEventListener("hashchange", function () {
  var h = location.hash.replace("#", "");
  if (["brief", "cal", "tasks", "schule", "pause"].indexOf(h) > -1) { if ($("panel").classList.contains("open")) closePanel(); setTab(h); }
});
// Lernzeit in der Schule beendet → Pause vorschlagen (kurze geplante Pausen, Albulescu et al. 2022)
addEventListener("message", function (e) {
  if (e.origin !== location.origin || !e.data || e.data.sg !== "study-done") return;
  var m = e.data.min || 0, box = document.createElement("div");
  box.className = "nudge";
  box.innerHTML = "<span>" + (m ? m + " Min. gelernt – " : "") + "Zeit für eine kurze Pause. 5 Minuten wirken am besten.</span><button class='btn p' data-tab='pause'>Pause starten</button><button class='btn' data-nudge='x'>Später</button>";
  document.body.appendChild(box);
  box.addEventListener("click", function (ev) { if (ev.target.closest("button")) box.remove(); });
  setTimeout(function () { box.remove(); }, 20000);
});
function renderTabbar() {
  var I = {
    brief: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round'><circle cx='12' cy='12' r='4'/><path d='M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4'/></svg>",
    cal: ICON_CAL.replace("width='22' height='22'", ""),
    tasks: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M4 6.5l1.8 1.8L9 5M4 12.5l1.8 1.8L9 11M4 18.5l1.8 1.8L9 17M12.5 7h7.5M12.5 13h7.5M12.5 19h7.5'/></svg>"
  };
  I.schule = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M3 8l9-4 9 4-9 4-9-4z'/><path d='M7 10v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5'/></svg>";
  I.pause = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round'><path d='M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9z'/><path d='M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M11 3v3'/></svg>";
  $("tabbar").innerHTML = [["brief", "Heute"], ["cal", "Kalender"], ["tasks", "Aufgaben"], ["schule", "Schule"], ["pause", "Pause"]].map(function (t) {
    return "<button data-tab='" + t[0] + "' class='" + (S.tab === t[0] ? "on" : "") + "'>" + I[t[0]] + t[1] + "</button>";
  }).join("");
}

/* ---------- Bearbeiten ---------- */
function findEvent(id) { return C.list().find(function (e) { return e.id === id; }); }
function findTask(id) { return C.tasks.list().find(function (t) { return t.id === id; }); }
function openEvent(id, occDate) {
  if (EXT[id]) return showExt(EXT[id]);
  var e = findEvent(id); if (!e) return;
  S.sel = id + (occDate || e.date);
  S.edit = { kind: "event", draft: JSON.parse(JSON.stringify(e)), occ: occDate || e.date };
  renderPanel(); render();
}
function newEvent(date, time, end) {
  var d = { title: "", date: date || S.anchor, time: time || "", end: end || "", note: "", color: "", app: C.app, rep: null, remind: P.remind == null ? 15 : P.remind };
  if (time === undefined && S.tab !== "brief") { var t = Math.ceil((nowMin() + 1) / 30) * 30; if (t < 23 * 60) { d.time = hm(t); d.end = hm(t + 60); } }
  S.edit = { kind: "event", draft: d, isNew: true };
  renderPanel();
}
function openTask(id) { if (EXT[id]) return showExt(EXT[id]); var t = findTask(id); if (!t) return; S.edit = { kind: "task", draft: JSON.parse(JSON.stringify(t)) }; renderPanel(); }
function newTask(due) { S.edit = { kind: "task", draft: { title: "", due: due || "", prio: 0, note: "", app: C.app, done: false }, isNew: true }; renderPanel(); }
function closePanel() { if (document.activeElement && $("panel").contains(document.activeElement)) document.activeElement.blur(); S.edit = null; S.sel = null; $("panel").classList.remove("open"); $("scrim").classList.remove("on"); render(); }

function calSelect(cur) {
  return "<select data-f='app'>" + calendars().map(function (c) { return "<option" + (c.name === cur ? " selected" : "") + ">" + esc(c.name) + "</option>"; }).join("") + "</select>";
}
function renderPanel() {
  var E = S.edit, p = $("panel");
  if (!E) { p.classList.remove("open"); return; }
  var d = E.draft, h = "<div class='ph'><span class='hint'>" + (E.kind === "task" ? (E.isNew ? "Neue Aufgabe" : "Aufgabe") : (E.isNew ? "Neuer Termin" : "Termin")) + "</span><span class='sp'></span>" +
    (!E.isNew && E.kind === "event" ? "<button class='ib' data-p='dup' title='Duplizieren' aria-label='Duplizieren'>⧉</button>" : "") +
    "<button class='ib' data-p='close' aria-label='Schließen'>✕</button></div><div class='pb'>";
  h += "<input class='ttl' data-f='title' placeholder='" + (E.kind === "task" ? "Was ist zu tun?" : "Titel") + "' value='" + esc(d.title) + "' maxlength='160'>";
  if (E.kind === "event") {
    var allDay = !d.time, rep = d.rep && d.rep.f || "";
    h += "<label class='toggle'><input type='checkbox' data-f='allday'" + (allDay ? " checked" : "") + "> Ganztägig</label>";
    h += "<div class='fl'><span>" + (rep ? "Beginnt" : "Datum") + "</span><input type='date' data-f='date' value='" + esc(d.date) + "'></div>";
    if (!allDay) h += "<div class='fl'><span>Zeit</span><div class='tr'><input type='time' data-f='time' value='" + esc(d.time) + "'>–<input type='time' data-f='end' value='" + esc(d.end) + "'></div></div>";
    h += "<div class='fl'><span>Wiederholen</span><select data-f='rep'>" + REP.map(function (r) { return "<option value='" + r[0] + "'" + (r[0] === rep ? " selected" : "") + ">" + r[1] + "</option>"; }).join("") + "</select></div>";
    h += "<div class='fl'><span>Erinnerung</span><select data-f='remind'>" + C.remindOptions.map(function (r) {
      return "<option value='" + r[0] + "'" + (String(d.remind == null ? "" : d.remind) === r[0] ? " selected" : "") + ">" + r[1] + "</option>"; }).join("") + "</select></div>";
    if (rep) h += "<div class='fl'><span>Endet am</span><input type='date' data-f='until' value='" + esc(d.rep.until || "") + "'></div>";
    if (rep && !E.isNew && E.occ) h += "<div class='hint'>Änderungen gelten für die ganze Serie. Geöffnet am " + short(E.occ) + ".</div>";
  } else {
    h += "<div class='fl'><span>Fällig</span><input type='date' data-f='due' value='" + esc(d.due) + "'></div>";
    h += "<label class='toggle'><input type='checkbox' data-f='prio'" + (d.prio ? " checked" : "") + "> Wichtig</label>";
    if (!E.isNew) h += "<label class='toggle'><input type='checkbox' data-f='done'" + (d.done ? " checked" : "") + "> Erledigt</label>";
  }
  h += "<div class='fl'><span>Kalender</span>" + calSelect(d.app) + "</div>";
  h += "<div class='fl'><span>Farbe</span><div class='swatches'><button class='auto" + (!d.color ? " on" : "") + "' data-color='' title='Farbe des Kalenders' style='--c:" + calColor(d.app) + "'></button>" +
    PALETTE.map(function (c) { return "<button data-color='" + c + "' class='" + (d.color === c ? "on" : "") + "' style='--c:" + c + "'></button>"; }).join("") + "</div></div>";
  h += "<textarea data-f='note' placeholder='Notiz'>" + esc(d.note) + "</textarea>";
  if (!E.isNew && d.app) h += "<div class='hint'>Erstellt in „" + esc(d.app) + "“ · in allen Apps sichtbar</div>";
  h += "</div><div class='pf'>";
  if (!E.isNew) h += "<button class='btn d' data-p='del'>Löschen</button>";
  if (!E.isNew && E.kind === "event" && d.rep && d.rep.f) h += "<button class='btn d' data-p='skip'>Nur diesen</button>";
  h += "<span class='sp'></span><button class='btn' data-p='close'>Abbrechen</button><button class='btn p' data-p='save'>Speichern</button></div>";
  p.innerHTML = h;
  p.classList.add("open"); $("scrim").classList.add("on");
  if (E.isNew) setTimeout(function () { var t = p.querySelector("[data-f=title]"); if (t) t.focus(); }, 60);
}
function readPanel() {
  var E = S.edit, d = E.draft, p = $("panel");
  p.querySelectorAll("[data-f]").forEach(function (el) {
    var f = el.dataset.f, v = el.type === "checkbox" ? el.checked : el.value;
    if (f === "allday") { if (v) { d.time = ""; d.end = ""; } else if (!d.time) { d.time = "09:00"; d.end = "10:00"; } }
    else if (f === "rep") { d.rep = v ? { f: v, until: (d.rep && d.rep.until) || "" } : null; }
    else if (f === "until") { if (d.rep) d.rep.until = v; }
    else if (f === "prio") d.prio = v ? 1 : 0;
    else if (f === "remind") d.remind = v === "" ? null : +v;
    else d[f] = v;
  });
}
function savePanel() {
  readPanel();
  var E = S.edit, d = E.draft;
  d.title = (d.title || "").trim();
  if (!d.title) { $("panel").querySelector("[data-f=title]").focus(); return; }
  if (E.kind === "event") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return;
    if (d.time && d.end && d.end <= d.time) d.end = hm(Math.min(mins(d.time) + 60, 1439));
    var v = { title: d.title, date: d.date, time: d.time || "", end: d.time ? d.end || "" : "", note: d.note || "", color: d.color || "", app: d.app, rep: d.rep && d.rep.f ? d.rep : null, remind: d.remind == null ? null : d.remind };
    if (E.isNew) { P.remind = v.remind; savePrefs(); }
    if (v.remind != null) C.askNotify();
    if (E.isNew) { var n = C.add(v); if (v.rep) C.update(n.id, { rep: v.rep }); } else C.update(d.id, v);
    if (S.tab === "cal" && (d.date < range()[0] || d.date > range()[1])) S.anchor = d.date;
  } else {
    var t = { title: d.title, due: d.due || "", prio: d.prio ? 1 : 0, note: d.note || "", app: d.app };
    if (E.isNew) C.tasks.add(t); else { t.done = !!d.done; C.tasks.update(d.id, t); }
  }
  closePanel();
}
$("panel").addEventListener("click", function (ev) {
  var b = ev.target.closest("[data-p],[data-color]"); if (!b) return;
  var E = S.edit;
  if (b.dataset.color !== undefined) { readPanel(); E.draft.color = b.dataset.color; renderPanel(); return; }
  var a = b.dataset.p;
  if (a === "close") closePanel();
  else if (a === "save") savePanel();
  else if (a === "del") {
    var name = E.draft.title || "Eintrag";
    if (E.kind === "event") {
      if (!confirm((E.draft.rep && E.draft.rep.f ? "Ganze Serie „" : "Termin „") + name + "“ in allen Apps löschen?")) return;
      C.remove(E.draft.id);
    } else { if (!confirm("Aufgabe „" + name + "“ löschen?")) return; C.tasks.remove(E.draft.id); }
    closePanel();
  } else if (a === "skip") { C.skip(E.draft.id, E.occ); closePanel(); }
  else if (a === "dup") { readPanel(); var c = JSON.parse(JSON.stringify(E.draft)); delete c.id; c.title += " (Kopie)"; S.edit = { kind: "event", draft: c, isNew: true }; renderPanel(); }
});
$("panel").addEventListener("change", function (ev) {
  var f = ev.target.dataset.f;
  if (f === "allday" || f === "rep" || f === "app") { readPanel(); renderPanel(); }
});
$("panel").addEventListener("keydown", function (ev) {
  if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey || ev.target.dataset.f === "title")) { ev.preventDefault(); savePanel(); }
});
$("scrim").addEventListener("click", function () { if (S.edit) closePanel(); $("side").classList.remove("open"); $("scrim").classList.remove("on"); });

/* ---------- Klicks in der Ansicht ---------- */
function toggleHomework(id) {
  var db = lpDb(); if (!db) return;
  var h = (db.homework || []).find(function (x) { return "hw-" + x.id === id; }); if (!h) return;
  h.done = !h.done; h.u = Date.now();
  try { localStorage.setItem(LP_KEY, JSON.stringify(db)); } catch (e) { return; }
  var fr = $("mods").querySelector("[data-mod='schule']"); if (fr) fr.contentWindow.location.reload();
  C.sync(); render();
}
function toggleTask(id) { if (/^hw-/.test(id)) return toggleHomework(id); if (EXT[id]) return showExt(EXT[id]); var t = findTask(id); if (t) C.tasks.update(id, { done: !t.done }); }
document.addEventListener("click", function (ev) {
  if (ev.target.closest("#panel, #pal")) return;
  if (dragState && dragState.didDrag) return;
  var el = ev.target.closest("[data-a],[data-tab],[data-view],[data-day],[data-mday],[data-ev],[data-task],[data-check],[data-cal],[data-qk]");
  if (!el || el.closest(".panel")) return;
  var ds = el.dataset;
  if (ds.check) { toggleTask(ds.check); return; }
  if (ds.cal !== undefined) return; // per change-Ereignis
  if (ds.qk) { S.qaKind = ds.qk; render(); var q = $("qa"); if (q) q.focus(); return; }
  if (ds.tab) { setTab(ds.tab); return; }
  if (ds.view) { setView(ds.view); return; }
  if (ds.ev) { openEvent(ds.ev, ds.date); return; }
  if (ds.task) { openTask(ds.task); return; }
  if (ds.day) { closeSide(); goto(ds.day, ds.v ? "1" : null); return; }
  if (ds.mday) { goto(ds.mday, "1"); return; }
  var a = ds.a;
  if (a === "prev") step(-1);
  else if (a === "next") step(1);
  else if (a === "today") { S.anchor = today(); S.mini = S.anchor.slice(0, 8) + "01"; keepScroll = null; $("tgs") && ($("tgs").scrollTop = 0); render(); }
  else if (a === "new") { if (S.tab === "tasks") newTask(); else newEvent(); }
  else if (a === "newtoday") newEvent(today());
  else if (a === "toweek") { S.anchor = today(); setView(MOBILE() ? "3" : "w"); }
  else if (a === "mprev" || a === "mnext") { var m = parse(S.mini); S.mini = iso(new Date(m.getFullYear(), m.getMonth() + (a === "mprev" ? -1 : 1), 1)); renderSide(); }
  else if (a === "menu") { $("side").classList.add("open"); $("scrim").classList.add("on"); }
  else if (a === "palette") openPalette();
  else if (a === "sync") { closeSide(); C.open(null, "sync"); }
  else if (a === "apps") { closeSide(); C.open(null, "apps"); }
  else if (a === "appmenu") { if (C.openAppMenu) C.openAppMenu(el); }
  else if (a === "weekplan") { closeSide(); C.weekPlan("", S.tab === "cal" ? wpWeek() : null); }
  else if (a === "install") { closeSide(); window.SGInstall && SGInstall.prompt(); }
  else if (a === "design") { closeSide(); C.open(null, "design"); }
  else if (a === "reloadmod") { var fr = $("mods").querySelector("[data-mod='" + S.tab + "']"); if (fr) fr.contentWindow.location.reload(); }
  else if (a === "notify") C.askNotify().then(render);
  else if (a === "help") showHelp();
  else if (a === "science") { closeSide(); showScience(); }
  else if (a === "tlist") { S.tlist = el.dataset.v; render(); }
  else if (a === "tsrc") { S.tsrc = el.dataset.v; render(); }
  else if (a === "flag") { var ft = findTask(el.dataset.v); if (ft) C.tasks.update(ft.id, { prio: ft.prio ? 0 : 1 }); }
  else if (a === "cleardone") { if (confirm("Alle erledigten Aufgaben entfernen?")) C.tasks.list().filter(function (t) { return t.done; }).forEach(function (t) { C.tasks.remove(t.id); }); }
});
function closeSide() { $("side").classList.remove("open"); if (!S.edit) $("scrim").classList.remove("on"); }
document.addEventListener("change", function (ev) {
  var el = ev.target;
  if (el.dataset.cal !== undefined) { if (el.checked) delete P.hidden[el.dataset.cal]; else P.hidden[el.dataset.cal] = 1; savePrefs(); render(); }
  else if (el.dataset.a === "vsel") setView(el.value);
  else if (el.dataset.a === "showtasks") { P.showTasks = el.checked; savePrefs(); render(); }
  else if (el.dataset.wps) {
    var w = C.weekPlanConfig(), k = el.dataset.wps;
    if (k === "on") w.on = el.checked; else if (k === "remind") w.remind = el.value; else if (k === "time") w.time = el.value || "18:00"; else if (k === "topic") w.topics[el.dataset.t] = el.checked;
    C.weekPlanSave(w); render();
  }
  else if (el.dataset.a === "theme") { P.theme = el.value; savePrefs(); applyTheme(); render(); }
});
document.addEventListener("input", function (ev) { if (ev.target.id === "qa") qaPreview(ev.target); });
document.addEventListener("keydown", function (ev) { if (ev.target.id === "qa" && ev.key === "Enter") { ev.preventDefault(); qaSubmit(ev.target); } });
$("fab").addEventListener("click", function () {
  if (S.tab === "tasks") newTask();
  else if (S.tab === "brief") { var q = $("qa"); if (q) { q.focus(); q.scrollIntoView({ block: "center" }); } else newEvent(); }
  else newEvent();
});

/* ---------- Ziehen im Zeitraster: anlegen, verschieben, Länge ändern ----------
 * Maus: sofort. Finger: lange drücken (0,35 s), damit normales Scrollen weiter geht. */
var dragState = null;
function gridPoint(ev) {
  var cols = Array.prototype.slice.call(document.querySelectorAll(".col"));
  var col = cols.find(function (c) { var r = c.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX < r.right; }) ||
    (ev.clientX < cols[0].getBoundingClientRect().left ? cols[0] : cols[cols.length - 1]);
  var r = col.getBoundingClientRect(), hour = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hour"));
  var m = Math.round(((ev.clientY - r.top) / hour * 60) / 15) * 15;
  return { col: col, date: col.dataset.col, min: Math.max(0, Math.min(1440, m)), hour: hour };
}
function ghost(col, s, e, label, styleSrc) {
  var g = document.querySelector(".evb.ghost");
  if (!g) { g = document.createElement("div"); g.className = "evb ghost"; }
  if (g.parentNode !== col) col.appendChild(g);
  var hour = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hour"));
  g.setAttribute("style", (styleSrc || "--c:var(--acc);--cb:var(--s2)") + ";top:" + s / 60 * hour + "px;height:" + Math.max((e - s) / 60 * hour - 2, 14) + "px;left:1px;width:calc(100% - 3px)");
  g.innerHTML = "<b>" + esc(label || "Neuer Termin") + "</b><span>" + hm(s) + "–" + hm(e) + "</span>";
}
document.addEventListener("pointerdown", function (ev) {
  if (ev.button !== 0 || S.tab !== "cal") return;
  var col = ev.target.closest(".col"); if (!col) return;
  var evb = ev.target.closest(".evb"), resize = ev.target.classList.contains("rs");
  var touch = ev.pointerType !== "mouse";
  var st = { x: ev.clientX, y: ev.clientY, id: ev.pointerId, touch: touch, armed: !touch, didDrag: false, start: gridPoint(ev) };
  if (evb) {
    var e = findEvent(evb.dataset.ev); if (!e) return; // Lernplan-Einträge sind nur zum Ansehen
    var s = mins(e.time), en = mins(e.end); if (en == null || en <= s) en = s + 60;
    st.mode = resize ? "resize" : "move"; st.ev = e; st.el = evb; st.occ = evb.dataset.date; st.s = s; st.en = en; st.offset = st.start.min - s;
    if (resize) st.armed = true;
  } else {
    if (touch) return; // Antippen eines leeren Felds legt per click einen Termin an
    st.mode = "create";
  }
  if (touch && !st.armed) st.timer = setTimeout(function () { st.armed = true; if (navigator.vibrate) navigator.vibrate(12); begin(); }, 350);
  dragState = st;
  function begin() { st.didDrag = true; if (st.el) st.el.classList.add("drag"); }
  st.begin = begin;
});
document.addEventListener("pointermove", function (ev) {
  var st = dragState; if (!st || ev.pointerId !== st.id) return;
  var dist = Math.abs(ev.clientX - st.x) + Math.abs(ev.clientY - st.y);
  if (!st.armed) { if (dist > 8) { clearTimeout(st.timer); dragState = null; } return; }
  if (!st.didDrag) { if (dist < 4) return; st.begin(); }
  var p = gridPoint(ev);
  if (st.mode === "create") {
    var a = Math.min(st.start.min, p.min), b = Math.max(st.start.min, p.min); if (b - a < 15) b = a + 15;
    st.res = { date: st.start.date, s: a, e: b }; ghost(st.start.col, a, b);
  } else if (st.mode === "move") {
    var ns = Math.max(0, Math.min(1440 - (st.en - st.s), p.min - st.offset));
    st.res = { date: p.date, s: ns, e: ns + (st.en - st.s) }; ghost(p.col, st.res.s, st.res.e, st.ev.title, styleVars(st.ev));
  } else {
    var ne = Math.max(st.s + 15, p.min);
    st.res = { date: st.occ, s: st.s, e: ne }; ghost(st.el.parentNode, st.s, ne, st.ev.title, styleVars(st.ev));
  }
});
document.addEventListener("touchmove", function (ev) { if (dragState && dragState.armed && dragState.didDrag) ev.preventDefault(); }, { passive: false });
function endDrag() {
  var st = dragState; if (!st) return;
  clearTimeout(st.timer);
  var g = document.querySelector(".evb.ghost"); if (g) g.remove();
  if (st.el) st.el.classList.remove("drag");
  if (st.didDrag && st.res) {
    var r = st.res;
    if (st.mode === "create") newEvent(r.date, hm(r.s), hm(r.e));
    else {
      var e = st.ev, patch = { time: hm(r.s), end: hm(r.e) };
      if (r.date !== st.occ) {
        var shift = Math.round((parse(r.date) - parse(st.occ)) / 864e5);
        patch.date = addDays(e.date, shift);
      }
      if (e.rep && e.rep.f && !confirm("Das ist ein wiederkehrender Termin. Die ganze Serie verschieben?")) { render(); }
      else C.update(e.id, patch);
    }
  }
  // Klick, der direkt auf ein Ziehen folgt, ignorieren
  setTimeout(function () { dragState = null; }, 0);
}
document.addEventListener("pointerup", endDrag);
document.addEventListener("pointercancel", function () { if (dragState) { clearTimeout(dragState.timer); var g = document.querySelector(".evb.ghost"); if (g) g.remove(); if (dragState.el) dragState.el.classList.remove("drag"); dragState = null; } });
// Antippen / Klicken ins leere Raster: neuer Termin zu dieser Uhrzeit
document.addEventListener("click", function (ev) {
  if (S.tab !== "cal" || ev.target.closest(".evb") || (dragState && dragState.didDrag)) return;
  var col = ev.target.closest(".col"); if (!col) return;
  var p = gridPoint(ev), s = Math.floor(p.min / 30) * 30;
  if (p.min - s >= 30) s += 30;
  s = Math.min(s, 23 * 60);
  newEvent(p.date, hm(s), hm(Math.min(s + 60, 1439)));
});
// Wischen links/rechts blättert (Handy)
(function () {
  var sx = 0, sy = 0, t0 = 0;
  document.addEventListener("touchstart", function (e) { if (!e.target.closest("#view")) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; t0 = Date.now(); }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!t0 || S.tab !== "cal" || (dragState && dragState.didDrag)) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; t0 = 0;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 45) step(dx < 0 ? 1 : -1);
  }, { passive: true });
})();

/* ---------- Befehlspalette (Strg+K) ---------- */
var palItems = [], palSel = 0;
function openPalette(text) {
  $("pal").classList.add("on"); var i = $("palIn"); i.value = text || ""; palRender(); i.focus();
}
function closePalette() { $("pal").classList.remove("on"); }
if (C.setPalette) C.setPalette(function (text) { openPalette(text); });
function palRender() {
  var q = $("palIn").value.trim(), ql = q.toLowerCase(), items = [];
  if (q) {
    var p = parseQuick(q);
    if (p.title) {
      items.push({ g: "Anlegen", label: "Termin: " + p.title + " · " + rel(p.date || today()) + (p.time ? " " + p.time + "–" + p.end : " ganztägig"), run: function () { C.add({ title: p.title, date: p.date || today(), time: p.time, end: p.time ? p.end : "", app: C.app }); goto(p.date || today()); } });
      items.push({ g: "Anlegen", label: "Aufgabe: " + p.title + (p.date ? " · fällig " + rel(p.date) : ""), run: function () { C.tasks.add({ title: p.title, due: p.date || "", prio: p.prio, app: C.app }); } });
    }
  }
  var acts = [
    ["Heute", "T", function () { S.anchor = today(); S.tab = "cal"; render(); }],
    ["Briefing", "B", function () { S.tab = "brief"; render(); }],
    ["Aufgaben", "A", function () { S.tab = "tasks"; render(); }],
    ["Schule öffnen (Stundenplan, Prüfungen, Lernplan)", "", function () { setTab("schule"); }],
    ["Pause starten", "", function () { setTab("pause"); }],
    ["Training öffnen", "", function () { location.href = "training/"; }],
    ["Ansicht: Tag", "D", function () { setView("1"); }], ["Ansicht: 3 Tage", "3", function () { setView("3"); }],
    ["Ansicht: Woche", "W", function () { setView("w"); }], ["Ansicht: Monat", "M", function () { setView("m"); }], ["Ansicht: Agenda", "L", function () { setView("a"); }],
    ["Neuer Termin", "C", function () { newEvent(); }], ["Neue Aufgabe", "N", function () { newTask(); }],
    ["Sync einrichten", "", function () { C.open(null, "sync"); }], ["Andere Apps öffnen", "", function () { C.open(null, "apps"); }], ["Woche planen (Training, Atmung, Lernen)", "", function () { C.weekPlan(); }], ["Als App installieren", "", function () { window.SGInstall && SGInstall.prompt(); }],
    ["Tastenkürzel", "?", showHelp]
  ];
  acts.filter(function (a) { return C.wordsMatch ? C.wordsMatch(a[0], ql) : !ql || a[0].toLowerCase().indexOf(ql) > -1; }).forEach(function (a) { items.push({ g: "Befehle", label: a[0], k: a[1], run: a[2] }); });
  // dazu alle Befehle der anderen Apps (Training starten, Bibel lesen, Design, Sync …)
  if (C.commands) C.commands().forEach(function (c) { if (C.wordsMatch(c.g + " " + c.label, ql)) items.push({ g: c.g, label: c.label, k: c.k, run: c.run }); });
  // Passt ein Befehl, steht er vorn; die Vorschläge zum Anlegen rutschen ans Ende
  var mk = items.filter(function (x) { return x.g === "Anlegen"; }), rest = items.filter(function (x) { return x.g !== "Anlegen"; });
  if (rest.length && mk.length) items = rest.concat(mk);
  if (ql.length > 1) {
    var seen = {}, from = addDays(today(), -365), to = addDays(today(), 365);
    C.occurrences(from, to).forEach(function (e) {
      if (seen[e.id] || (e.title + " " + (e.note || "")).toLowerCase().indexOf(ql) < 0) return;
      var nextOcc = C.occurrences(today(), to).find(function (x) { return x.id === e.id; }) || e;
      seen[e.id] = 1; items.push({ g: "Termine", label: e.title + " · " + short(nextOcc.date) + (e.time ? " " + e.time : ""), run: function () { goto(nextOcc.date); openEvent(e.id, nextOcc.date); } });
    });
    C.tasks.list().forEach(function (t) {
      if ((t.title + " " + (t.note || "")).toLowerCase().indexOf(ql) < 0) return;
      items.push({ g: "Aufgaben", label: (t.done ? "✓ " : "") + t.title + (t.due ? " · " + rel(t.due) : ""), run: function () { openTask(t.id); } });
    });
  }
  palItems = items.slice(0, 40); palSel = 0;
  var h = "", g = "";
  palItems.forEach(function (it, i) {
    if (it.g !== g) { g = it.g; h += "<div class='grp'>" + esc(g) + "</div>"; }
    h += "<div class='it" + (i === palSel ? " on" : "") + "' data-i='" + i + "'>" + esc(it.label) + (it.k ? "<span class='k'><span class='kbd'>" + esc(it.k) + "</span></span>" : "") + "</div>";
  });
  $("palList").innerHTML = h || "<div class='empty' style='padding:12px'>Nichts gefunden.</div>";
}
function palMark() { $("palList").querySelectorAll(".it").forEach(function (el) { el.classList.toggle("on", +el.dataset.i === palSel); if (+el.dataset.i === palSel) el.scrollIntoView({ block: "nearest" }); }); }
$("palIn").addEventListener("input", palRender);
$("palIn").addEventListener("keydown", function (ev) {
  if (ev.key === "ArrowDown") { palSel = Math.min(palItems.length - 1, palSel + 1); palMark(); ev.preventDefault(); }
  else if (ev.key === "ArrowUp") { palSel = Math.max(0, palSel - 1); palMark(); ev.preventDefault(); }
  else if (ev.key === "Enter") { var it = palItems[palSel]; if (it) { closePalette(); it.run(); } }
  else if (ev.key === "Escape") closePalette();
});
$("palList").addEventListener("click", function (ev) { var el = ev.target.closest("[data-i]"); if (!el) return; var it = palItems[+el.dataset.i]; closePalette(); it.run(); });
$("pal").addEventListener("click", function (ev) { if (ev.target.id === "pal") closePalette(); });

function showExt(e) {
  S.edit = null;
  var when = e.due ? "fällig " + long(e.due) : e.span && e.span[1] !== e.span[0] ? short(e.span[0]) + " – " + short(e.span[1]) : long(e.date) + (e.time ? ", " + e.time + " Uhr" : "");
  var p = $("panel");
  p.innerHTML = "<div class='ph'><span class='hint'>" + (e.due ? "Hausaufgabe" : "Termin") + " · " + esc(e.ro) + "</span><span class='sp'></span><button class='ib' data-p='close' aria-label='Schließen'>✕</button></div>" +
    "<div class='pb'><div class='ttl' style='border:0'>" + esc(e.title) + "</div><div class='fl'><span>" + (e.due ? "Fällig" : "Wann") + "</span><span>" + esc(when) + "</span></div>" +
    (e.note ? "<p style='white-space:pre-wrap;margin:0'>" + esc(e.note) + "</p>" : "") +
    "<p class='hint'>" + (e.link ? "Dieser Eintrag kommt aus " + esc(e.ro) + " und wird dort bearbeitet. Änderungen erscheinen hier automatisch." : "Feste Ferientermine für Bayern.") + "</p></div>" +
    "<div class='pf'><span class='sp'></span>" + (e.link ? "<a class='btn p' href='" + e.link + "' style='text-decoration:none'>In " + esc(e.ro) + " öffnen</a>" : "") + "<button class='btn' data-p='close'>Schließen</button></div>";
  p.classList.add("open"); $("scrim").classList.add("on");
}
function showScience() {
  S.edit = null;
  var p = $("panel"), src = [
    ["Lernplan (Schule)", "Der Stoff wird auf mehrere Tage verteilt und jedes Thema nach etwa einem und drei Tagen im Selbsttest wiederholt. Verteiltes Lernen und Abfragen statt Durchlesen sind die zwei am besten belegten Lernmethoden.",
      "Cepeda et al. 2006 (Psychological Bulletin) · Roediger & Karpicke 2006 (Psychological Science) · Dunlosky et al. 2013 (Psychological Science in the Public Interest)"],
    ["Pausen beim Lernen", "Kurze, geplante Pausen (etwa 5 Minuten nach 25–50 Minuten) erhalten Konzentration und Energie besser als Durcharbeiten oder spontane lange Pausen.",
      "Albulescu et al. 2022 (PLOS ONE, Meta-Analyse zu Mikropausen) · Biwer et al. 2023 (British Journal of Educational Psychology)"],
    ["Quiz in der Pause", "Falsch beantwortete Fragen kommen am nächsten Tag wieder, sichere in wachsenden Abständen (Leitner-Prinzip).", "Cepeda et al. 2006 · Roediger & Karpicke 2006"],
    ["Durchatmen", "Bei Stress: zyklisches Seufzen (zweimal ein, lang aus) und langsames Atmen um 6 Atemzüge pro Minute.", "Balban et al. 2023 (Cell Reports Medicine) · Lehrer et al. 2020 (Meta-Analyse)"]
  ];
  p.innerHTML = "<div class='ph'><span class='hint'>Wissenschaftliche Grundlagen</span><span class='sp'></span><button class='ib' data-p='close'>✕</button></div><div class='pb'>" +
    src.map(function (x) { return "<div><b>" + x[0] + "</b><p style='margin:4px 0'>" + x[1] + "</p><p class='hint' style='margin:0'>" + x[2] + "</p></div>"; }).join("") + "</div>";
  p.classList.add("open"); $("scrim").classList.add("on");
}
function showHelp() {
  var keys = [["Suchen / Befehle", "Strg K"], ["Heute", "T"], ["Zurück / Weiter", "← →"], ["Tag", "D"], ["3 Tage", "3"], ["Woche", "W"], ["Monat", "M"], ["Agenda", "L"],
    ["Neuer Termin", "C"], ["Neue Aufgabe", "N"], ["Briefing", "B"], ["Aufgaben", "A"], ["Schließen", "Esc"], ["Speichern", "Strg Enter"]];
  S.edit = null;
  var p = $("panel");
  p.innerHTML = "<div class='ph'><span class='hint'>Tastenkürzel</span><span class='sp'></span><button class='ib' data-p='close'>✕</button></div><div class='pb'><div class='help'>" +
    keys.map(function (k) { return "<div><span>" + k[0] + "</span><span class='kbd'>" + k[1] + "</span></div>"; }).join("") +
    "</div><p class='hint'>Im Raster: in eine freie Stelle klicken oder ziehen legt einen Termin an. Termine lassen sich verschieben und unten in der Länge ziehen – auf dem Handy nach kurzem Gedrückthalten.</p>" +
    "<p class='hint'>Schnell-Eingabe versteht z. B. „Zahnarzt Do. 14:30“, „Training morgen 17–18:30“, „Lauf am 12.10. um 9 für 1,5 h“, „Aufgabe: Referat Freitag !“.</p></div>";
  p.classList.add("open"); $("scrim").classList.add("on");
}

document.addEventListener("keydown", function (ev) {
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); openPalette(); return; }
  if (ev.key === "Escape") { if ($("pal").classList.contains("on")) closePalette(); else if ($("panel").classList.contains("open")) closePanel(); else closeSide(); return; }
  var tag = (ev.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select" || ev.ctrlKey || ev.metaKey || ev.altKey || $("pal").classList.contains("on")) return;
  if ($("panel").classList.contains("open") || MODS[S.tab]) return;
  var k = ev.key.toLowerCase();
  var map = {
    t: function () { S.anchor = today(); S.tab = "cal"; render(); }, arrowleft: function () { if (S.tab === "cal") step(-1); }, arrowright: function () { if (S.tab === "cal") step(1); },
    j: function () { if (S.tab === "cal") step(1); }, k: function () { if (S.tab === "cal") step(-1); },
    d: function () { setView("1"); }, "3": function () { setView("3"); }, w: function () { setView("w"); }, m: function () { setView("m"); }, l: function () { setView("a"); },
    c: function () { newEvent(); }, n: function () { newTask(); }, b: function () { S.tab = "brief"; render(); }, a: function () { S.tab = "tasks"; render(); },
    "?": showHelp, "/": function () { openPalette(); }
  };
  if (map[k]) { ev.preventDefault(); map[k](); }
});

/* ---------- Start ---------- */
C.onChange(function () { if (!dragState) render(); });
addEventListener("storage", function (e) { if ((e.key === LP_KEY || e.key === "wk_log" || e.key === "wk_activities") && !dragState) render(); });
addEventListener("sg-theme", function () { render(); });
setInterval(function () { if (!document.hidden && !dragState) render(); }, 60000);
var lastW = innerWidth;
// Drehen des Tablets/Handys: nach kurzer Pause neu zeichnen (Kopfzeile, Spalten, Ansichten passen sich an)
var rsT = 0;
addEventListener("resize", function () { if (innerWidth === lastW) return; clearTimeout(rsT); rsT = setTimeout(function () { lastW = innerWidth; if (!dragState) render(); }, 150); });
var hashTab = location.hash.replace("#", "");
if (["brief", "cal", "tasks", "schule", "pause"].indexOf(hashTab) > -1) S.tab = hashTab;
render();
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(function () {});
});
