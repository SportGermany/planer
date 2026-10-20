/* Bibelstellen erkennen: „Joh 3,16“, „1. Mose 1,1-3“, „Ps 23“, „Römer 8:28“ → { b: Buchnummer (0–65), name, c, v, v2 }
 * Buchnamen wie in bibel/elb1905.json (Elberfelder 1905), dazu gängige Abkürzungen (Loccumer Richtlinien und Kurzformen).
 * Rein und ohne Netz. Tests: node werkzeuge/tests/suche-kern.js */
(function (root) {
  "use strict";
  var B = [
    ["1. Mose", "1mo 1mos 1mose gen genesis"], ["2. Mose", "2mo 2mos 2mose ex exo exodus"], ["3. Mose", "3mo 3mos 3mose lev levitikus"],
    ["4. Mose", "4mo 4mos 4mose num numeri"], ["5. Mose", "5mo 5mos 5mose dtn deuteronomium"], ["Josua", "jos"], ["Richter", "ri richt"], ["Ruth", "rut rt"],
    ["1. Samuel", "1sam 1sm"], ["2. Samuel", "2sam 2sm"], ["1. Könige", "1kon 1koe 1kg 1kge 1konige"], ["2. Könige", "2kon 2koe 2kg 2kge 2konige"],
    ["1. Chronika", "1chr 1chron 1chronik"], ["2. Chronika", "2chr 2chron 2chronik"], ["Esra", "esr"], ["Nehemia", "neh"], ["Esther", "est ester"],
    ["Hiob", "hi ijob job"], ["Psalm", "ps psa psalmen"], ["Sprüche", "spr sprueche"], ["Prediger", "pred koh kohelet"], ["Hohelied", "hld hl"],
    ["Jesaja", "jes"], ["Jeremia", "jer"], ["Klagelieder", "klgl klag"], ["Hesekiel", "hes ez ezechiel"], ["Daniel", "dan"], ["Hosea", "hos"],
    ["Joel", "joe"], ["Amos", "am"], ["Obadja", "obd ob"], ["Jona", "jon"], ["Micha", "mi mich"], ["Nahum", "nah"], ["Habakuk", "hab"],
    ["Zephanja", "zef zeph"], ["Haggai", "hag"], ["Sacharja", "sach"], ["Maleachi", "mal"], ["Matthäus", "mt mat matth matthaeus"],
    ["Markus", "mk mar mark"], ["Lukas", "lk luk"], ["Johannes", "joh jo"], ["Apostelgeschichte", "apg"], ["Römer", "rom roem"],
    ["1. Korinther", "1kor"], ["2. Korinther", "2kor"], ["Galater", "gal"], ["Epheser", "eph"], ["Philipper", "phil php"], ["Kolosser", "kol"],
    ["1. Thessalonicher", "1thess 1th"], ["2. Thessalonicher", "2thess 2th"], ["1. Timotheus", "1tim"], ["2. Timotheus", "2tim"], ["Titus", "tit"],
    ["Philemon", "phlm phm"], ["Hebräer", "hebr heb"], ["Jakobus", "jak"], ["1. Petrus", "1petr 1pt"], ["2. Petrus", "2petr 2pt"],
    ["1. Johannes", "1joh"], ["2. Johannes", "2joh"], ["3. Johannes", "3joh"], ["Judas", "jud"], ["Offenbarung", "offb off apk"]
  ];
  // Kapitel je Buch (zum Prüfen: „am 24“ ist keine Stelle in Amos, das hat nur 9 Kapitel)
  var CH = [50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4, 28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22];
  function key(s) {
    return String(s).toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss")
      .replace(/^(erste[rsn]?|i)\s+/, "1").replace(/^(zweite[rsn]?|ii)\s+/, "2").replace(/^(dritte[rsn]?|iii)\s+/, "3").replace(/[\s.]/g, "");
  }
  var ALIAS = {};
  B.forEach(function (b, i) { ALIAS[key(b[0])] = i; b[1].split(" ").forEach(function (a) { ALIAS[a] = i; }); });
  // „Psalmen“ und Mehrzahlformen
  ALIAS.psalmen = 18;
  var RE = /^\s*((?:[123]|i{1,3}|erste[rsn]?|zweite[rsn]?|dritte[rsn]?)\.?\s*)?([a-zäöüß]+)\.?\s*(\d{1,3})(?:\s*[,:]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?)?\s*$/i;
  function parse(text) {
    var m = RE.exec(String(text || "")); if (!m) return null;
    var k = key((m[1] ? m[1].replace(/[.\s]+/g, "") + " " : "") + m[2]), b = ALIAS[k];
    if (b == null) return null;
    var c = +m[3], v = m[4] ? +m[4] : null, v2 = m[5] ? +m[5] : null;
    if (!c || c > CH[b] || (v2 && v && v2 < v)) return null;
    return { b: b, name: B[b][0], c: c, v: v, v2: v2, ref: B[b][0] + " " + c + (v ? "," + v + (v2 ? "–" + v2 : "") : "") };
  }
  var api = { parse: parse, books: B.map(function (b) { return b[0]; }) };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SGBibelstelle = api;
})(typeof window !== "undefined" ? window : this);
