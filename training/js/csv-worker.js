/* Rechnet den Datei-Import (CSV, GPX, TCX) im Hintergrund – die Oberfläche bleibt flüssig. Wird von build.py erzeugt. */
importScripts('1-core.js?v=5.1.0.f6ee72', '2-pools.js?v=5.1.0.f6ee72', '3-sports.js?v=5.1.0.f6ee72', '4-stretch.js?v=5.1.0.f6ee72', '9-analysis.js?v=5.1.0.f6ee72');
self.onmessage = function (ev) {
  try { var r = self.WK.parseFitnessFile(ev.data.name, ev.data.text); self.postMessage({ ok: true, res: r }); }
  catch (e) { self.postMessage({ ok: false, err: String(e) }); }
};
