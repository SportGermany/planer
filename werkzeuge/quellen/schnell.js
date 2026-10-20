/* Schnelleingabe in einem Satz (Suche der Hülle): parseQuick("Zahnarzt morgen 15 Uhr", jetzt)
 * → { kind: "termin" | "aufgabe" | "notiz", explicit, title, date, time, end, dur, rep, remind, parts }
 * Rein und ohne Netz; Deutsch. Tests: node werkzeuge/tests/schnell.js
 * date = "YYYY-MM-DD" (lokal), time/end = "HH:MM", dur = Minuten, rep = { f: "d"|"w"|"2w"|"m"|"y" }, remind = Minuten vorher. */
(function (root) {
  "use strict";
  var WDS = ["sonntag", "montag", "dienstag", "mittwoch", "donnerstag", "freitag", "samstag"];
  var WDA = { so: 0, mo: 1, di: 2, mi: 3, do: 4, fr: 5, sa: 6 };
  var MON = ["januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember"];
  var MONA = { jan: 0, feb: 1, "mär": 2, mrz: 2, maer: 2, apr: 3, mai: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, okt: 9, nov: 10, dez: 11 };
  var NUM = { ein: 1, eins: 1, eine: 1, einen: 1, einem: 1, einer: 1, zwei: 2, drei: 3, vier: 4, "fünf": 5, fuenf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, "zwölf": 12, zwoelf: 12 };
  var WDN = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function num(s) { s = String(s).toLowerCase(); return /^\d+$/.test(s) ? +s : NUM[s] != null ? NUM[s] : NaN; }
  function hm(h, m) { return pad(h) + ":" + pad(m || 0); }
  function addMin(t, m) { var p = t.split(":"), x = Math.min(23 * 60 + 59, +p[0] * 60 + +p[1] + m); return hm(Math.floor(x / 60), x % 60); }
  var NW = "(\\d+|ein|eins|eine|einen|einem|einer|zwei|drei|vier|fünf|fuenf|sechs|sieben|acht|neun|zehn|elf|zwölf|zwoelf)";
  var DAYW = "(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|mo|di|mi|do|fr|sa|so)";

  function parseQuick(text, now) {
    now = now || new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var src = String(text || "").replace(/\s+/g, " ").trim(), s = " " + src + " ";
    var r = { kind: null, explicit: false, title: "", date: null, time: null, end: null, dur: null, rep: null, remind: null, parts: [] };
    var dayPart = null; // "morgens" | "abends" …
    function cut(re, fn) {
      var m = re.exec(s); if (!m) return false;
      var res = fn(m);
      if (res === false) return false;
      s = s.slice(0, m.index) + " " + s.slice(m.index + m[0].length);
      return true;
    }
    // 1) Absicht (Vorwort)
    cut(/^\s*(termin|aufgabe|todo|to-do|notiz|idee)\s*[:\-–]?\s+/i, function (m) { var w = m[1].toLowerCase(); r.kind = w === "termin" ? "termin" : w === "notiz" || w === "idee" ? "notiz" : "aufgabe"; r.explicit = true; });
    if (!r.kind) cut(/^\s*erinnere? mich (?:daran,? |an )?(?:dass |,? )?/i, function () { r.kind = "notiz"; r.explicit = true; r.remind = 0; });
    // 2) Erinnerung „30 min vorher“, „1 Tag vorher“
    cut(new RegExp("\\s(?:mit erinnerung\\s+)?" + NW + "\\s*(min(?:uten?)?|minute|std\\.?|stunden?|h|tage?n?|tag)\\s+vorher\\b", "i"), function (m) {
      var n = num(m[1]), u = m[2].toLowerCase(); if (isNaN(n)) return false;
      r.remind = /^t/.test(u) ? n * 1440 : /^(s|h)/.test(u) ? n * 60 : n;
    });
    cut(/\s(?:mit\s+)?erinnerung\b/i, function () { if (r.remind == null) r.remind = 0; });
    // 3) Wiederholung
    cut(new RegExp("\\s(?:jeden|jede|immer)\\s+" + DAYW + "\\b", "i"), function (m) { var k = m[1].toLowerCase().slice(0, 2); r.rep = { f: "w" }; r._repDay = WDA[k]; });
    if (!r.rep) cut(/\s(täglich|taeglich|jeden tag)\b/i, function () { r.rep = { f: "d" }; });
    if (!r.rep) cut(/\s(wöchentlich|woechentlich|jede woche)\b/i, function () { r.rep = { f: "w" }; });
    if (!r.rep) cut(/\s(?:alle\s+(?:2|zwei)\s+wochen|zweiwöchentlich|14-tägig|vierzehntägig)\b/i, function () { r.rep = { f: "2w" }; });
    if (!r.rep) cut(/\s(monatlich|jeden monat)\b/i, function () { r.rep = { f: "m" }; });
    if (!r.rep) cut(/\s(jährlich|jaehrlich|jedes jahr)\b/i, function () { r.rep = { f: "y" }; });
    // 3b) Datum als Zahl „24.10.“, „24.10.2026“, „2.11.26“ – vor der Uhrzeit, damit „1.11.“ keine 1:11 wird
    var date = null;
    cut(/\s(\d{1,2})\.(\d{1,2})\.(\d{2,4})?(?=\s|$|[,;])/, function (m) {
      var d = +m[1], mo = +m[2] - 1, y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : today.getFullYear();
      if (mo < 0 || mo > 11 || d < 1 || d > 31) return false;
      date = new Date(y, mo, d); if (!m[3] && date < today) date = new Date(y + 1, mo, d);
    });
    // 4) Zeitraum „von 15 bis 16 Uhr“, „15-16 Uhr“, „15:00–16:30“
    cut(/\s(?:von\s+)?(\d{1,2})(?:[:.](\d{2}))?\s*(?:uhr\s*)?(?:bis|-|–)\s*(\d{1,2})(?:[:.](\d{2}))?\s*uhr\b/i, function (m) {
      var a = +m[1], b = +m[3]; if (a > 23 || b > 23) return false; r.time = hm(a, +m[2] || 0); r.end = hm(b, +m[4] || 0);
    }) || cut(/\s(?:von\s+)?(\d{1,2})[:.](\d{2})\s*(?:bis|-|–)\s*(\d{1,2})[:.](\d{2})\b/, function (m) {
      if (+m[1] > 23 || +m[3] > 23) return false; r.time = hm(+m[1], +m[2]); r.end = hm(+m[3], +m[4]);
    });
    // 5) Dauer „für 2 Stunden“, „30 min“, „1,5 Std“
    cut(new RegExp("\\s(?:für\\s+|fuer\\s+)?(\\d+(?:[,.]\\d+)?|eine?|zwei|drei|anderthalb|eineinhalb)\\s*(stunden?|std\\.?|h|minuten?|min)\\b(?!\\s+vorher)", "i"), function (m) {
      var v = m[1].toLowerCase(), n = v === "anderthalb" || v === "eineinhalb" ? 1.5 : num(v) || parseFloat(v.replace(",", ".")); if (isNaN(n)) return false;
      r.dur = Math.round(/^m/i.test(m[2]) ? n : n * 60);
    });
    // 6) Uhrzeit
    if (!r.time) cut(/\s(?:um\s+|ab\s+|gegen\s+)?(\d{1,2})[:.](\d{2})(?:\s*uhr)?\b/i, function (m) { if (+m[1] > 23 || +m[2] > 59) return false; r.time = hm(+m[1], +m[2]); });
    if (!r.time) cut(/\s(?:um\s+|ab\s+|gegen\s+)?(\d{1,2})\s*uhr(?:\s+(\d{1,2}))?\b/i, function (m) { if (+m[1] > 23) return false; r.time = hm(+m[1], m[2] ? +m[2] : 0); });
    if (!r.time) cut(/\s(dreiviertel|drei viertel|viertel vor|viertel nach|halb)\s+(\d{1,2}|ein|eins|zwei|drei|vier|fünf|fuenf|sechs|sieben|acht|neun|zehn|elf|zwölf|zwoelf)\b/i, function (m) {
      var h = num(m[2]), w = m[1].toLowerCase(); if (isNaN(h) || h > 24) return false;
      var mm = 0; if (w === "halb") { h -= 1; mm = 30; } else if (w === "viertel nach") mm = 15; else { h -= 1; mm = 45; }
      if (h < 0) h += 12;
      r.time = hm(h, mm); r._word = true;
    });
    if (!r.time) cut(/\sum\s+(\d{1,2}|ein|eins|zwei|drei|vier|fünf|fuenf|sechs|sieben|acht|neun|zehn|elf|zwölf|zwoelf)\b(?!\s*(?:\.|tag|woche|monat))/i, function (m) {
      var h = num(m[1]); if (isNaN(h) || h > 23) return false; r.time = hm(h, 0); r._word = !/^\d/.test(m[1]);
    });
    cut(/\s(morgens|früh|frueh|vormittags|mittags|nachmittags|abends|nachts)\b/i, function (m) { dayPart = m[1].toLowerCase(); });
    if (r.time) {
      var h0 = +r.time.slice(0, 2);
      if ((dayPart === "nachmittags" || dayPart === "abends") && h0 < 12) r.time = hm(h0 + 12, +r.time.slice(3));
      else if (!dayPart && r._word && h0 >= 1 && h0 <= 6) r.time = hm(h0 + 12, +r.time.slice(3)); // „halb vier“ = 15:30, „viertel vor acht“ = 7:45
      if (r.end && +r.end.slice(0, 2) < +r.time.slice(0, 2) && +r.end.slice(0, 2) < 12) r.end = hm(+r.end.slice(0, 2) + 12, +r.end.slice(3));
    }
    // 7) Datum
    if (!date) cut(/\s(heute)\b/i, function () { date = today; }) ||
    cut(/\s(übermorgen|uebermorgen)\b/i, function () { date = addDays(today, 2); }) ||
    cut(/\s(morgen)\b(?!\s+(?:früh|frueh)\b(?=.*\bmorgen\b))/i, function () { date = addDays(today, 1); });
    if (!date) cut(new RegExp("\\sin\\s+" + NW + "\\s+(tagen|tag|wochen|woche|monaten|monat)\\b", "i"), function (m) {
      var n = num(m[1]), u = m[2].toLowerCase(); if (isNaN(n)) return false;
      if (/^t/.test(u)) date = addDays(today, n); else if (/^w/.test(u)) date = addDays(today, 7 * n);
      else { date = new Date(today.getFullYear(), today.getMonth() + n, today.getDate()); }
    });
    if (!date) cut(/\s(\d{1,2})\.?\s+(januar|februar|märz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember|jan|feb|mär|mrz|apr|jun|jul|aug|sept?|okt|nov|dez)\.?(?:\s+(\d{4}))?(?=\s|$|[,;])/i, function (m) {
      var k = m[2].toLowerCase().replace("maerz", "märz"), mo = MON.indexOf(k); if (mo < 0) mo = MONA[k]; if (mo == null || mo < 0) return false;
      var y = m[3] ? +m[3] : today.getFullYear(); date = new Date(y, mo, +m[1]); if (!m[3] && date < today) date = new Date(y + 1, mo, +m[1]);
    });
    if (!date) cut(new RegExp("\\s(?:am\\s+|bis\\s+|ab\\s+)?(nächsten|naechsten|nächste|naechste|kommenden|kommende|diesen|diese)?\\s*" + DAYW.replace("(", "(?:") + "\\b(?!\\s*\\.)", "i"), function (m) {
      var w = /(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|mo|di|mi|do|fr|sa|so)\b/i.exec(m[0]); if (!w) return false;
      var k = w[1].toLowerCase(), wd = k.length > 2 ? WDS.indexOf(k) : WDA[k];
      // Abkürzungen nur, wenn eindeutig als Tag gemeint (vor/nach „am“, „bis“, „nächsten“ …)
      if (k.length === 2 && !/(am|bis|ab|nächsten|naechsten|nächste|naechste|kommenden|kommende|diesen|diese)\s/i.test(m[0])) return false;
      var n = (wd - today.getDay() + 7) % 7; if (n === 0) n = 7; // nächstes Vorkommen nach heute
      date = addDays(today, n);
    });
    if (!date) cut(/\s(nächste|naechste|kommende)\s+woche\b/i, function () { date = addDays(today, ((8 - today.getDay()) % 7) || 7); });
    if (!date) cut(/\s(diese|dieser)\s+woche\b/i, function () { date = today; });
    // Wiederholung an einem Wochentag: erstes Vorkommen ab heute
    if (r.rep && r._repDay != null && !date) { var n2 = (r._repDay - today.getDay() + 7) % 7; date = addDays(today, n2); }
    if (date) r.date = iso(date);
    // Dauer → Ende
    if (r.time && !r.end && r.dur) r.end = addMin(r.time, r.dur);
    // 8) Absicht ohne Vorwort
    if (!r.kind) r.kind = r.time ? "termin" : "aufgabe";
    if (r.kind === "termin" && !r.date) r.date = iso(today);
    // 9) Titel: Rest ohne Füllwörter
    var t = s.replace(/\s(am|um|ab|bis|von|für|fuer|in|an|im|zum|zur|nächsten|naechsten|nächste|naechste|kommenden|diese[nr]?|jeden|jede|immer|mit|uhr)(?=\s)/gi, " ")
      .replace(/\s[.,;:]+(?=\s)/g, " ").replace(/\s+/g, " ").replace(/^[\s,;:.\-–]+|[\s,;:.\-–]+$/g, "").trim();
    r.title = t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
    // 10) erkannte Teile (für die Vorschau als antippbare Chips)
    if (r.date) { var dd = new Date(+r.date.slice(0, 4), +r.date.slice(5, 7) - 1, +r.date.slice(8, 10)); r.parts.push({ k: "date", label: WDN[dd.getDay()] + " " + dd.getDate() + "." + (dd.getMonth() + 1) + "." }); }
    if (r.time) r.parts.push({ k: "time", label: r.time + (r.end ? "–" + r.end : "") });
    if (r.rep) r.parts.push({ k: "rep", label: { d: "täglich", w: r._repDay != null ? "jeden " + ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][r._repDay] : "wöchentlich", "2w": "alle 2 Wochen", m: "monatlich", y: "jährlich" }[r.rep.f] });
    if (r.remind != null && r.remind > 0) r.parts.push({ k: "remind", label: (r.remind >= 1440 ? r.remind / 1440 + " Tag" + (r.remind >= 2880 ? "e" : "") : r.remind >= 60 ? r.remind / 60 + " Std." : r.remind + " Min.") + " vorher" });
    delete r._repDay; delete r._word;
    return r;
  }
  var api = { parseQuick: parseQuick };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SGQuick = api;
})(this);
