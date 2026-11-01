/* Rechnet den Datei-Import (CSV, GPX, TCX) im Hintergrund – die Oberfläche bleibt flüssig. Wird von build.py erzeugt. */
importScripts('1-core.js?v=5.1.0.6b0e71', '2-pools.js?v=5.1.0.6b0e71', '3-sports.js?v=5.1.0.6b0e71', '4-stretch.js?v=5.1.0.6b0e71', '9-analysis.js?v=5.1.0.6b0e71');
self.onmessage = function (ev) {
  try { var r = self.WK.parseFitnessFile(ev.data.name, ev.data.text); self.postMessage({ ok: true, res: r }); }
  catch (e) { self.postMessage({ ok: false, err: String(e) }); }
};
