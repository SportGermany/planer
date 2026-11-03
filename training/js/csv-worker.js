/* Rechnet den Datei-Import (CSV, GPX, TCX) im Hintergrund – die Oberfläche bleibt flüssig. Wird von build.py erzeugt. */
importScripts('1-core.js?v=6.1.1.7130f5', '2-pools.js?v=6.1.1.7130f5', '3-sports.js?v=6.1.1.7130f5', '4-stretch.js?v=6.1.1.7130f5', '9-analysis.js?v=6.1.1.7130f5');
self.onmessage = function (ev) {
  try { var r = self.WK.parseFitnessFile(ev.data.name, ev.data.text); self.postMessage({ ok: true, res: r }); }
  catch (e) { self.postMessage({ ok: false, err: String(e) }); }
};
