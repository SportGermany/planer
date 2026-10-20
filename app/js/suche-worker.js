/* Suche im Hintergrund (Web Worker aus einer Datei – blob: ist per CSP gesperrt, siehe WISSEN.md).
 * Große Texte werden hier geladen und durchsucht, die Oberfläche bleibt flüssig:
 *   { id, art: "bibel", q } → { id, list: [[Buch-Nr, Kapitel, Vers, Buchname, Text], …] }   (bibel/elb1905.json, höchstens 60)
 *   { id, art: "wissen", q } → { id, list: [[Kapitel-ID, Block-ID, Kapitel, Text, Wert], …] } (wissen/js/buch.js, höchstens 40) */
var BIB = null, BIBN = null, bibL = null, WI = null, wiL = null;
function words(q) { return self.SGSuche.words(q); }
function bibel(d) {
  bibL = bibL || fetch("../../bibel/elb1905.json").then(function (r) { return r.json(); }).then(function (j) {
    BIB = j.books; BIBN = BIB.map(function (b) { return b[2].map(function (vs) { return vs.map(self.SGSuche.norm); }); });
  });
  return bibL.then(function () {
    var nq = self.SGSuche.norm(d.q), out = [];
    if (nq) for (var bi = 0; bi < BIBN.length && out.length < 60; bi++)
      for (var ci = 0; ci < BIBN[bi].length && out.length < 60; ci++)
        for (var vi = 0; vi < BIBN[bi][ci].length && out.length < 60; vi++)
          if (BIBN[bi][ci][vi].indexOf(nq) >= 0) out.push([bi, ci + 1, vi + 1, BIB[bi][0], BIB[bi][2][ci][vi]]);
    return out;
  });
}
function wissen(d) {
  wiL = wiL || new Promise(function (ok) {
    self.window = self; importScripts("../../wissen/js/buch.js?v=" + (d.v || ""));
    WI = [];
    self.SW_BUCH.chapters.forEach(function (ch) { (ch.blocks || []).forEach(function (b) { if (!b.h) return; var t = b.h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); WI.push([ch.id, b.id, ch.full || ch.title, t, " " + self.SGSuche.norm(t) + " "]); }); });
    ok();
  });
  return wiL.then(function () {
    var qw = words(d.q), out = []; if (!qw.length) return out;
    for (var i = 0; i < WI.length && out.length < 40; i++) {
      var n = WI[i][4], sc = 0;
      for (var j = 0; j < qw.length; j++) { var at = n.indexOf(qw[j]); if (at < 0) { sc = 0; break; } sc += n.charAt(at - 1) === " " ? 4 : 2; }
      if (sc) out.push([WI[i][0], WI[i][1], WI[i][2], WI[i][3].slice(0, 160), sc]);
    }
    return out;
  });
}
self.onmessage = function (ev) {
  var d = ev.data;
  if (!self.SGSuche) importScripts("../../sg/suche.js?v=" + (d.v || ""));
  (d.art === "wissen" ? wissen(d) : bibel(d)).then(function (list) { self.postMessage({ id: d.id, list: list }); }, function () { self.postMessage({ id: d.id, list: [], err: 1 }); });
};
