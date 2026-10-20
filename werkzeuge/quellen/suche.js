/* Kern der Suche (Hülle): Text vereinheitlichen, Treffer bewerten, Tippfehler verzeihen, Treffer hervorheben.
 * Rein und ohne Netz. Tests: node werkzeuge/tests/suche-kern.js
 *   SGSuche.norm("Größe Übung") → "grosse ubung"
 *   SGSuche.score("zahnartz", "Zahnarzt") → > 0 (ein Tippfehler ab fünf Buchstaben, zwei ab neun)
 *   SGSuche.marks("Zahnarzt Termin", "zahn") → [[0, 4]]  (Bereiche zum Hervorheben)
 * Alle Wörter der Suche müssen vorkommen. Rangfolge: genauer Titel › Titelanfang › Wortanfang › Teilwort › Zusatztext › unscharf. */
(function (root) {
  "use strict";
  var MAP = { "ä": "a", "ö": "o", "ü": "u", "ß": "ss", "é": "e", "è": "e", "ê": "e", "á": "a", "à": "a", "â": "a", "ó": "o", "ò": "o", "ô": "o", "í": "i", "ì": "i", "î": "i", "ú": "u", "ù": "u", "û": "u", "ç": "c", "ñ": "n" };
  // gleich lang wie die Eingabe bis auf ß → ss; für das Hervorheben gibt es normMap
  function norm(s) {
    return String(s == null ? "" : s).toLowerCase().replace(/[äöüßéèêáàâóòôíìîúùûçñ]/g, function (c) { return MAP[c]; }).replace(/[^a-z0-9]+/g, " ").trim();
  }
  function words(s) { var n = norm(s); return n ? n.split(" ") : []; }
  // Abstand mit Vertauschung (Damerau, eingeschränkt), bricht ab, sobald max überschritten ist
  function dist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev2 = null, prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i]; var best = i;
      for (j = 1; j <= b.length; j++) {
        var c = a[i - 1] === b[j - 1] ? 0 : 1;
        var v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
        if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        cur[j] = v; if (v < best) best = v;
      }
      if (best > max) return max + 1;
      prev2 = prev; prev = cur;
    }
    return prev[b.length];
  }
  function allowed(len) { return len >= 9 ? 2 : len >= 5 ? 1 : 0; }
  // Wert eines Suchworts gegen eine Wortliste: 6 ganzes Wort, 4 Wortanfang, 2 Teilwort, 1 unscharf, 0 kein Treffer
  function wordHit(q, ws) {
    var best = 0, k = allowed(q.length);
    for (var i = 0; i < ws.length; i++) {
      var w = ws[i];
      if (w === q) return 6;
      if (w.indexOf(q) === 0) { best = Math.max(best, 4); continue; }
      if (q.length >= 3 && w.indexOf(q) > 0) { best = Math.max(best, 2); continue; }
      if (k && best < 1) {
        // ganzes Wort oder gleich langer Wortanfang (Tippfehler mitten im Tippen)
        if (dist(q, w, k) <= k || (w.length > q.length && dist(q, w.slice(0, q.length), k) <= k)) best = 1;
      }
    }
    return best;
  }
  /* Bewertung eines Eintrags: title (wichtig), text (Zusatz: Notiz, Stichwörter). 0 = kein Treffer. */
  function score(query, title, text) {
    var q = words(query); if (!q.length) return 0;
    var nt = norm(title), tw = nt ? nt.split(" ") : [], xw = text ? words(text) : [], nq = q.join(" ");
    var s = 0;
    for (var i = 0; i < q.length; i++) {
      var h = wordHit(q[i], tw);
      if (h) { s += h * 10; continue; }
      var x = xw.length ? wordHit(q[i], xw) : 0;
      if (!x) return 0;
      s += x * 3;
    }
    if (nt === nq) s += 200; else if (nt.indexOf(nq) === 0) s += 100; else if ((" " + nt).indexOf(" " + nq) >= 0) s += 40;
    return s;
  }
  /* Bereiche [Anfang, Ende) im Originaltext, die zu Suchwörtern passen (Wortanfänge und Teilwörter) – fürs Hervorheben */
  function marks(title, query) {
    var q = words(query).filter(function (w) { return w.length >= 1; }); if (!q.length) return [];
    var src = String(title || ""), low = "", idx = [];
    for (var i = 0; i < src.length; i++) { var c = src[i].toLowerCase(), m = MAP[c] || c; for (var k = 0; k < m.length; k++) { low += m[k]; idx.push(i); } }
    var out = [];
    q.forEach(function (w) {
      var p = low.indexOf(w);
      while (p >= 0) { out.push([idx[p], idx[p + w.length - 1] + 1]); p = low.indexOf(w, p + w.length); }
    });
    out.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [];
    out.forEach(function (r) { var l = merged[merged.length - 1]; if (l && r[0] <= l[1]) l[1] = Math.max(l[1], r[1]); else merged.push(r.slice()); });
    return merged;
  }
  var api = { norm: norm, words: words, dist: dist, score: score, marks: marks, wordHit: wordHit };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SGSuche = api;
})(typeof window !== "undefined" ? window : this);
