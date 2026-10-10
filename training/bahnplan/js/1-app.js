"use strict";
/* =====================================================================
   Bahnplan – Kurvenbuch fürs Rennrodeln.
   Katalog: Startwerte aus öffentlichen Quellen (Wikipedia, FIL, USA Luge, Betreiber). Starts: [Name, ab Kurve, Länge m]
   aus den Weltcup-Angaben (Herren/Damen/Doppelsitzer). Der Plan selbst ist ausschließlich das Bild von Wikipedia
   bzw. Wikimedia Commons (w.files = bekannte Streckenpläne, w.q = Suchbegriff, w.kw = Ortsname im Dateinamen) –
   oder ein eigenes Bild. Es wird nichts selbst gezeichnet.
   ===================================================================== */
const CATALOG = [
  { id: "altenberg", name: "Altenberg", ort: "Altenberg (Erzgebirge)", land: "Deutschland", len: 1413, n: 17, note: "Gilt als eine der schwierigsten Bahnen der Welt. Bekannte Abschnitte: Omega-Kurve, Kreisel, Zielkreisel.",
    st: [["Herrenstart", 1, 1387], ["Damenstart", 3, 1220], ["Doppelsitzerstart", 7, 996]],
    w: { q: "Altenberg bobsleigh track", kw: "altenberg", files: ["Altenberg Bobbahn-Streckenplan deutsch.svg", "Altenberg bobsleigh track-track map english.svg"] } },
  { id: "koenigssee", name: "Königssee", ort: "Schönau am Königssee", land: "Deutschland", len: 1251, n: 16, note: "Bekannte Kurven: Teufelsmühle, Turbodrom (Kreisel), Schlangengrube (S-Kombination, Kurven 6–9), Echowand – heute Josef-Fendt-Kurve.",
    c: { 6: { t: "S-Kombination", nm: "Schlangengrube" }, 7: { t: "S-Kombination", nm: "Schlangengrube" }, 8: { t: "S-Kombination", nm: "Schlangengrube" }, 9: { t: "S-Kombination", nm: "Schlangengrube" } },
    st: [["Herrenstart", 1, 1332], ["Damenstart", 5, 1216], ["Doppelsitzerstart", 5, 1216]],
    w: { q: "Königssee bobsleigh luge track", kw: "k(ö|oe|o)nigssee", files: ["Koenigssee Kunsteisbahn-Streckenplan deutsch.svg", "Koenigssee luge track-track map english.svg", "Track Profile (GER) Königssee.svg"] } },
  { id: "oberhof", name: "Oberhof", ort: "Oberhof (Thüringen)", land: "Deutschland", len: 1354, n: 15, note: "Reine Rennschlittenbahn von 1971 mit engen Übergängen zwischen den Kurven.",
    st: [["Herrenstart", 2, 1069], ["Damenstart", 5, 945]],
    w: { q: "Oberhof luge track", kw: "oberhof", files: ["Oberhof Rennrodelbahn-Streckenplan deutsch.svg", "Oberhof luge track-Track map english.svg"] } },
  { id: "winterberg", name: "Winterberg", ort: "Winterberg (Sauerland)", land: "Deutschland", len: 1609, n: 14, note: "Omega (Kurven 1–3), Veltins-Kreisel (Kurve 7, 270°), Labyrinth (Kurven 11–13).",
    c: { 1: { t: "Omega", nm: "Omega" }, 2: { t: "Omega", nm: "Omega" }, 3: { t: "Omega", nm: "Omega" }, 7: { t: "Kreisel", a: 270, nm: "Veltins-Kreisel" }, 11: { t: "Labyrinth", nm: "Labyrinth" }, 12: { t: "Labyrinth", nm: "Labyrinth" }, 13: { t: "Labyrinth", nm: "Labyrinth" } },
    st: [["Herrenstart", 1, 1324], ["Damenstart", 1, 1293], ["Doppelsitzerstart", 4, 945]],
    w: { q: "Winterberg bobsleigh track", kw: "winterberg", files: ["Winterberg Bobbahn-Streckenplan deutsch.svg", "Winterberg bobsleigh track-Track map english.svg"] } },
  { id: "igls", name: "Innsbruck-Igls", ort: "Igls bei Innsbruck", land: "Österreich", len: 1270, n: 14, note: "Olympia-Eiskanal von 1976, mit Kreisel.",
    st: [["Herrenstart", 1, 1270], ["Damenstart", 5, 870]], w: { q: "Igls bobsleigh luge track", kw: "igls", files: ["Track Profile (AUT) Igls.svg"] } },
  { id: "sigulda", name: "Sigulda", ort: "Sigulda", land: "Lettland", len: 1200, n: 16, note: "Nach Kurve 15 lange Gerade, Kurve 16 dreht ca. 270° mit schwieriger Ausfahrt.",
    c: { 16: { t: "Kreisel", a: 270 } }, st: [["Herrenstart", 1, 1200], ["Damenstart", 4, 988]], w: { q: "Sigulda bobsleigh luge track", kw: "sigulda", files: ["Track Profile (LAT) Sigulda.svg"] } },
  { id: "lillehammer", name: "Lillehammer", ort: "Hunderfossen", land: "Norwegen", len: 1365, n: 16, note: "Olympiabahn von 1994.",
    st: [["Herrenstart", 1, 1365], ["Damenstart", 4, 1065]], w: { q: "Lillehammer Olympic Bobsleigh and Luge Track", kw: "lillehammer|hunderfossen", files: ["Lillehammer Olympic Bobsleigh and Luge Track map.svg"] } },
  { id: "laplagne", name: "La Plagne", ort: "La Plagne", land: "Frankreich", len: 1507, n: 19, note: "Olympiabahn von 1992.",
    w: { q: "La Plagne bobsleigh luge track", kw: "plagne", files: ["Track Profile (FRA) La Plagne.svg"] } },
  { id: "cortina", name: "Cortina d'Ampezzo", ort: "Cortina Sliding Centre „Eugenio Monti“", land: "Italien", len: 1445, n: 16, note: "Neu gebaut für die Winterspiele 2026.",
    w: { q: "Cortina Sliding Centre", kw: "cortina|monti", files: [] } },
  { id: "stmoritz", name: "St. Moritz–Celerina", ort: "Olympia Bobrun", land: "Schweiz", len: 1722, n: 19, note: "Natureisbahn für Bob und Skeleton. Bekannte Kurven: Horseshoe, Shamrock, Leap, Wall, Snake.",
    w: { q: "St. Moritz-Celerina Olympic Bobrun", kw: "moritz|celerina", files: ["St. Moritz Bobrun-track map english.svg"] } },
  { id: "lakeplacid", name: "Lake Placid", ort: "Mt. Van Hoevenberg", land: "USA", len: 1455, n: 20, note: "Abschnitte: Devil's Highway, Shady II, Labyrinth, Chicane, zum Ziel die Heart-Kombination.",
    st: [["Herrenstart", 1, 1455], ["Damenstart", 4, 1130]], w: { q: "Mt. Van Hoevenberg Olympic Bobsled Run", kw: "lake.?placid|hoevenberg", files: ["Track Profile (USA) Lake Placid.svg"] } },
  { id: "parkcity", name: "Park City", ort: "Utah Olympic Park", land: "USA", len: 1335, n: 15, note: "Olympiabahn von 2002.",
    w: { q: "Utah Olympic Park Track", kw: "park.?city|utah", files: ["Track Profile (USA) Park City.svg"] } },
  { id: "whistler", name: "Whistler", ort: "Whistler Sliding Centre", land: "Kanada", len: 1450, n: 16, note: "Schnellste Bahn der Welt (über 150 km/h).",
    c: { 3: { nm: "Wedge" }, 7: { nm: "Lueders' Loop" }, 11: { nm: "Shiver" }, 13: { nm: "50/50" }, 16: { nm: "Thunderbird" } },
    w: { q: "Whistler Sliding Centre", kw: "whistler", files: ["Whistler Sliding Centre-track map english.svg"] } },
  { id: "pyeongchang", name: "Pyeongchang", ort: "Alpensia Sliding Centre", land: "Südkorea", len: 1376, n: 16, note: "Olympiabahn von 2018.",
    w: { q: "Alpensia Sliding Centre", kw: "alpensia|pyeongchang", files: ["Alpensia Sliding Centre Map.jpg"] } },
  { id: "yanqing", name: "Yanqing", ort: "National Sliding Centre", land: "China", len: 1615, n: 16, note: "Olympiabahn von 2022 mit 360°-Kurve.",
    w: { q: "Yanqing National Sliding Centre", kw: "yanqing", files: [] } },
  { id: "sochi", name: "Sotschi", ort: "Sliding Center Sanki", land: "Russland", len: 1500, n: 18, note: "Längste Bahn, drei Gegenanstiege.",
    w: { q: "Sliding Center Sanki", kw: "sanki|sochi|krasnaya", files: [] } }
];
const START_NAMES = ["Herrenstart", "Damenstart", "Doppelsitzerstart", "Juniorenstart", "Jugendstart", "Teamstaffel", "Touristenstart"];
const TYPES = { "Kurve": 90, "Kehre": 180, "Kreisel": 270, "Omega": 200, "S-Kombination": 80, "Labyrinth": 70, "Schikane": 40, "Gerade": 0, "Gegenanstieg": 0, "Startkurve": 60, "Zielkurve": 90 };
const NOARC = t => t === "Gerade" || t === "Gegenanstieg";
const STATUS = { neu: ["Neu", "#8e8e93"], ueben: ["Übe ich", "#ff9f0a"], sitzt: ["Sitzt", "#30d158"] };
/* Kurvenblatt in Phasen: [Name, gemeinsam für alle Starts?, Auswahlfelder [Schlüssel, Titel, Werte, Mehrfachwahl], Textfelder, Zahlenfelder]
   „gemeinsam“ = die Kurve selbst (Form, Eis, Licht) – alles andere kann je Start eine eigene Fassung haben. */
const GROUPS = [
  ["Kurve", true, [
    ["radius", "Radius", ["eng", "mittel", "weit"]],
    ["verlauf", "Verlauf", ["zieht zu", "konstant", "öffnet sich"]],
    ["gefaelle", "Gefälle", ["flach", "mittel", "steil"]],
    ["wand", "Wand / Überhöhung", ["flach", "steil", "sehr steil"]],
    ["druck", "Druck (G-Kräfte)", ["wenig", "mittel", "hoch", "sehr hoch"]],
    ["sicht", "Einsehbar", ["ja", "teilweise", "blind"]],
    ["kombi", "Teil einer Kombination", ["nein", "Anfang", "Mitte", "Ende"]],
    ["sonne", "Licht", ["Schatten", "Sonne", "wechselnd"]],
    ["eis", "Eis meist", ["hart", "normal", "weich", "Rillen"]]
  ], [["kurve", "Besonderheiten", "Fugen, Schatten, Wellen, wo es rumpelt …"]], [["laenge", "Länge", "m"]]],
  ["Anfahrt", false, [
    ["spur", "Spur vor der Kurve", ["links", "Mitte", "rechts"]],
    ["hEin", "Höhe bei der Einfahrt", ["am Boden", "tief", "mittig", "hoch"]],
    ["anfwinkel", "Anfahrtswinkel", ["flach / lang", "gerade", "spitz / direkt"]],
    ["vorher", "Aus der Kurve davor", ["mitnehmen", "gerade stellen", "laufen lassen"]],
    ["blickvor", "Kopf vor der Kurve", ["ruhig liegen", "kurz schauen", "Blick zur Ausfahrt"]]
  ], [["anfahrt", "Anfahrt", "Wo komme ich aus der letzten Kurve? Wo liege ich in der Bahn?"]], [["speed", "Tempo", "km/h"]]],
  ["Einlenken", false, [
    ["lenkzeit", "Zeitpunkt", ["sehr früh", "früh", "normal", "spät", "sehr spät"]],
    ["bezug", "Bezugspunkt", ["Kurvenbeginn", "Bandenbeginn", "Markierung", "Lichtmast", "Gefühl / Zeit"]],
    ["lenkkraft", "Stärke", ["keine", "leicht", "mittel", "stark"]],
    ["lenkdauer", "Dauer", ["kurzer Impuls", "gehalten", "nachdrücken"]],
    ["lenkmittel", "Steuern mit", ["Wade / Kufe", "Schulter", "Hüfte", "Kopf", "Griffe"], true],
    ["wade", "Druck auf", ["rechte Wade", "linke Wade", "beide"]]
  ], [["einlenken", "Einlenken", "Wo genau, woran erkenne ich den Punkt?"], ["steuern", "So steuere ich", "Beine, Kufen, Schultern – wie stark, wie lange?"]]],
  ["Scheitel", false, [
    ["hScheitel", "Höhe im Scheitel", ["unten", "mittig", "hoch", "ganz oben"]],
    ["slage", "Scheitelpunkt", ["früh", "mittig", "spät"]],
    ["verhalten", "Im Scheitel", ["laufen lassen", "halten", "nachdrücken", "leicht gegenlenken"]],
    ["spann", "Körperspannung", ["locker", "mittel", "fest"]],
    ["kopf", "Kopf", ["in den Sitz", "neutral", "gegen den Druck halten"]]
  ], [["scheitel", "Scheitel & Druck", "Wann kommt der Druck, wie lange hält er?"]]],
  ["Ausfahrt", false, [
    ["hAus", "Höhe bei der Ausfahrt", ["unten", "mittig", "hoch"]],
    ["ausricht", "Richtung", ["Mitte", "zur linken Bande", "zur rechten Bande"]],
    ["austiming", "Runterkommen", ["früh", "natürlich", "spät"]],
    ["gerade", "Schlitten gerade stellen", ["aktiv", "laufen lassen"]],
    ["uebergang", "Danach", ["direkt in die nächste Kurve", "Gerade zum Ruhigwerden"]],
    ["bande", "Bandengefahr", ["Einfahrt", "Scheitel", "Ausfahrt"], true]
  ], [["ausfahrt", "Ausfahrt", "Wo will ich rauskommen? Übergang in die nächste Kurve"]]],
  ["Körper", false, [
    ["liegen", "Liegen", ["ganz flach", "Kopf leicht hoch", "Kopf hoch zum Schauen"]],
    ["fuesse", "Füße", ["gestreckt, zusammen", "leicht offen"]],
    ["arme", "Arme", ["angelegt", "an den Griffen"]],
    ["atmung", "Atmung", ["ausatmen", "anhalten", "ruhig weiter"]]
  ], [["blick", "Kopf & Blick", "Kopfhaltung, wohin schauen"], ["spannung", "Spannung & Atmung", "Wo locker, wo fest?"]]],
  ["Fehlerbilder", false, [
    ["fehlerbild", "Passiert mir hier", ["zu früh eingelenkt", "zu spät eingelenkt", "zu hoch raus", "zu tief", "Bandenkontakt", "Rutschen / Schleudern", "übersteuert", "zu wenig gelenkt", "doppelt gelenkt", "Kopf zu früh hoch", "Spannung verloren"], true]
  ], [["fehler", "Korrektur", "Was hilft, wenn das passiert?"], ["bild", "Mein Bild", "Gefühl oder Bild, das mir in dieser Kurve hilft"]]],
  ["Bedingungen", false, [], [["eisschnell", "Schnelles / kaltes Eis", "Was ändere ich, wenn die Bahn schnell ist?"], ["eislangsam", "Langsames / warmes Eis", "Was ändere ich bei weichem Eis?"], ["trainer", "Tipp vom Trainer", "Was hat der Trainer zu dieser Kurve gesagt?"]]],
  ["Vorbilder", false, [], [["vorbild", "So fahren es die Besten", "Beobachtung aus dem Weltcup: Linie, Lenkpunkt, Höhe"], ["unterschied", "Was mache ich anders?", ""], ["video", "Video-Link", "https://… (gern mit Zeitstempel)"]]],
  ["Bewertung", false, [
    ["risiko", "Sturz-/Fehlerrisiko", ["niedrig", "mittel", "hoch"]],
    ["zeit", "Zeitverlust bei Fehler", ["klein", "mittel", "groß"]],
    ["prio", "Wichtigkeit", ["normal", "wichtig", "Schlüsselkurve"]]
  ], []]
];
const SHARED = new Set(); GROUPS.forEach(g => { if (g[1]) { g[2].forEach(o => SHARED.add(o[0])); (g[4] || []).forEach(o => SHARED.add(o[0])); g[3].forEach(f => SHARED.add("f:" + f[0])); } });
const HIDEABLE = GROUPS.map(g => g[0]).concat(["Eigene Felder", "Ausschnitt", "Laufnotizen"]);
const KEY = "bahnplan.v1";
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dmy = s => String(s || "").split("-").reverse().join(".");
const secs = v => v === "" || v == null || isNaN(+v) ? "" : (+v).toFixed(3).replace(".", ",");

/* ---------- Speicher: Texte in localStorage (mit Cloud-Sicherung), Bilder in IndexedDB (nur dieses Gerät) ---------- */
function load() { try { const d = JSON.parse(localStorage.getItem(KEY) || "null"); if (d && Array.isArray(d.tracks)) { d.tracks.forEach(norm); return d; } } catch (e) {} return { tracks: [], cur: null }; }
function norm(t) {
  if (!t.map || typeof t.map !== "object") t.map = null;
  t.custom = t.custom || []; t.startNote = t.startNote || ""; t.runs = t.runs || []; t.sled = t.sled || {};
  if (t.setup && !t.sled.note) { t.sled.note = t.setup; } delete t.setup;
  t.curves.forEach(c => {
    c.o = c.o || {}; c.f = c.f || {}; c.runs = c.runs || []; c.line = Array.isArray(c.line) ? c.line : []; c.v = c.v || {}; delete c.straight;
    if (c.o.lenkart && !c.o.lenkmittel) { c.o.lenkmittel = [{ Beinen: "Wade / Kufe", Schultern: "Schulter", Kopf: "Kopf", kombiniert: "Wade / Kufe" }[c.o.lenkart] || "Wade / Kufe"]; delete c.o.lenkart; }
  });
  if (!Array.isArray(t.starts) || !t.starts.length) {
    const cat = CATALOG.find(c => c.id === t.cat), st = (cat && cat.st) || [["Herrenstart", 1, t.len]];
    t.starts = st.map(s => ({ id: uid(), name: s[0], from: s[1], len: s[2] || "", hoehe: "", paddel: "", note: s[0] === "Herrenstart" && t.startNote ? t.startNote : "", zz: [] }));
  }
  if (!t.starts.some(s => s.id === t.curStart)) t.curStart = t.starts[0].id;
  return t;
}
let S = load(), saveT;
S.hide = S.hide || {}; S.closed = S.closed || {}; S.print = Object.assign({ map: true, pins: true, crops: true, opts: true, runs: false, empty: true, sled: true }, S.print || {});
if (S.showMap == null) S.showMap = true;
function save() { clearTimeout(saveT); saveT = setTimeout(saveNow, 300); }
function saveNow() { clearTimeout(saveT); S.updated = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Speichern fehlgeschlagen"); } try { parent.postMessage({ sg: "changed" }, location.origin); } catch (e) {} }
addEventListener("pagehide", saveNow);
addEventListener("storage", async e => {
  if (e.key !== KEY) return;
  const keep = { hide: S.hide, closed: S.closed, print: S.print, showMap: S.showMap };
  S = load(); Object.keys(keep).forEach(k => { if (S[k] == null) S[k] = keep[k]; });
  await loadMapImg(); renderSafe();
});
let idb;
function db() {
  if (idb) return idb;
  idb = new Promise((res, rej) => { const r = indexedDB.open("bahnplan", 1); r.onupgradeneeded = () => r.result.createObjectStore("img"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  return idb;
}
async function imgGet(k) { try { const d = await db(); return await new Promise(res => { const r = d.transaction("img").objectStore("img").get(k); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); }); } catch (e) { return null; } }
async function imgSet(k, v) { const d = await db(); return new Promise((res, rej) => { const tx = d.transaction("img", "readwrite"); v == null ? tx.objectStore("img").delete(k) : tx.objectStore("img").put(v, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }

/* ---------- Modell ---------- */
function newCurve(n, preset) {
  const p = preset || {}, t = p.t || "Kurve";
  return { n, name: p.nm || "", dir: p.d || "", type: t, angle: p.a || "", diff: 3, status: "neu", cue: "", o: {}, f: {}, runs: [], line: [], v: {}, x: null, y: null };
}
function addTrack(cat, custom) {
  const c = cat || custom;
  const t = { id: uid(), cat: cat ? cat.id : null, name: c.name, ort: c.ort || "", land: c.land || "", len: +c.len || 1300, note: cat ? cat.note : "", curves: [], map: null, created: Date.now() };
  for (let i = 1; i <= (+c.n || 15); i++) t.curves.push(newCurve(i, cat && cat.c && cat.c[i]));
  norm(t); S.tracks.push(t); S.cur = t.id; saveNow(); return t;
}
const track = () => S.tracks.find(t => t.id === S.cur) || null;
const catOf = t => t && CATALOG.find(c => c.id === t.cat);
const start = t => (t && t.starts.find(s => s.id === t.curStart)) || (t && t.starts[0]);
const driven = (t, x) => x.n >= (+start(t).from || 1);
const curCurve = () => { const t = track(); return t && t.curves.find(c => c.n === curN); };
// Fassung einer Kurve für den gewählten Start: eigene Fassung, sonst die gemeinsame
const V = (t, x) => (x.v && x.v[t.curStart]) || x;
const hasOwn = (t, x) => !!(x.v && x.v[t.curStart]);
function getO(t, x, k) { return SHARED.has(k) ? x.o[k] : V(t, x).o[k]; }
function getF(t, x, k) { return SHARED.has("f:" + k) ? x.f[k] : V(t, x).f[k]; }
function counts(t) { return t.curves.filter(x => driven(t, x)).reduce((o, x) => { const s = V(t, x).status; o[s] = (o[s] || 0) + 1; return o; }, {}); }
const optVal = v => Array.isArray(v) ? v.join(", ") : v;
function formText(x) {
  const a = [x.name && x.name !== x.type ? x.type : ""];
  if (!NOARC(x.type)) a.push([x.dir === "L" ? "links" : x.dir === "R" ? "rechts" : "", x.angle ? x.angle + "°" : ""].filter(Boolean).join(" "));
  return a.filter(Boolean).join(" · ");
}

/* ---------- Plan-Bild (Wikipedia als PNG oder eigenes Bild) ---------- */
let mapURL = null;
async function loadMapImg() {
  const t = track(); if (mapURL) { URL.revokeObjectURL(mapURL); mapURL = null; }
  if (!t) return;
  let v = await imgGet("map:" + t.id);
  if (typeof v === "string") { try { v = await (await fetch(v)).blob(); await imgSet("map:" + t.id, v); } catch (e) { v = null; } }
  if (!v) return;
  mapURL = URL.createObjectURL(v);
  if (!t.map || !t.map.w) { const im = await imgOf(mapURL); t.map = Object.assign({ src: "eigen" }, t.map || {}, { w: im.naturalWidth, h: im.naturalHeight }); save(); }
}
function imgOf(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; }); }
// Bild in ein PNG umwandeln (weißer Grund, damit transparente SVG-Pläne lesbar bleiben)
async function toPNG(blob, max, type) {
  const u = URL.createObjectURL(blob);
  try {
    const im = await imgOf(u), k = Math.min(1, max / Math.max(im.naturalWidth || max, im.naturalHeight || max));
    const c = document.createElement("canvas"); c.width = Math.round((im.naturalWidth || max) * k); c.height = Math.round((im.naturalHeight || max) * k);
    const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
    const out = await new Promise(r => c.toBlob(r, type || "image/png", .88));
    return { blob: out, w: c.width, h: c.height };
  } finally { URL.revokeObjectURL(u); }
}
async function setMap(t, blob, meta) { await imgSet("map:" + t.id, blob); t.map = meta; save(); if (S.cur === t.id) await loadMapImg(); }

/* ---------- Wikipedia / Wikimedia Commons: Streckenpläne suchen ---------- */
const API = { c: "https://commons.wikimedia.org/w/api.php", en: "https://en.wikipedia.org/w/api.php", de: "https://de.wikipedia.org/w/api.php" };
async function api(base, params) {
  const r = await fetch(base + "?" + new URLSearchParams(Object.assign({ format: "json", formatversion: "2", origin: "*" }, params)));
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}
const JUNK = /flag|logo|icon|symbol|pictogram|olympic[_ ]rings|commons-|wiki|locator|location[_ ]map|relief|edit-|question|disambig|portal|signature|medal|emblem|coat[_ ]of[_ ]arms|wappen|stub|pog|marker|arrow|button|blank/i;
const GOOD = /streckenplan|track[_ ]?map|track[_ ]profile|bahnplan|map|plan|layout|profil/i;
const tkey = s => String(s).replace(/^(file|datei|image|bild):/i, "").replace(/_/g, " ").trim().toLowerCase();
const strip = s => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
async function wikiCandidates(w) {
  // Schlüssel klein geschrieben (gegen Doppelte), angefragt wird mit der Original-Schreibweise – Commons unterscheidet Groß/klein
  const score = new Map(), orig = new Map(), kw = w.kw ? new RegExp(w.kw, "i") : null;
  const add = (title, s) => { const k = tkey(title); if (!k || JUNK.test(k)) return; if (!orig.has(k)) orig.set(k, String(title).replace(/^(file|datei|image|bild):/i, "").replace(/_/g, " ").trim()); s += (GOOD.test(k) ? 20 : 0) + (/deutsch/.test(k) ? 5 : 0); if (!score.has(k) || score.get(k) < s) score.set(k, s); };
  (w.files || []).forEach((f, i) => add(f, 200 - i));
  const jobs = [
    api(API.c, { action: "query", list: "search", srnamespace: "6", srsearch: w.q + " map", srlimit: "25" }).then(d => ((d.query || {}).search || []).forEach(m => { if (!kw || kw.test(m.title)) add(m.title, 40); })),
    api(API.de, { action: "query", generator: "search", gsrsearch: w.q, gsrlimit: "1", prop: "images", imlimit: "80" }).then(d => ((d.query || {}).pages || []).forEach(p => (p.images || []).forEach(im => add(im.title, 15)))),
    api(API.en, { action: "query", generator: "search", gsrsearch: w.q, gsrlimit: "1", prop: "images", imlimit: "80" }).then(d => ((d.query || {}).pages || []).forEach(p => (p.images || []).forEach(im => add(im.title, 15))))
  ];
  if (kw) jobs.push(api(API.c, { action: "query", list: "categorymembers", cmtitle: "Category:Maps of sledding tracks", cmtype: "file", cmlimit: "500" })
    .then(d => ((d.query || {}).categorymembers || []).forEach(m => { if (kw.test(m.title)) add(m.title, 80); })));
  const res = await Promise.allSettled(jobs);
  const keys = [...score.keys()].sort((a, b) => score.get(b) - score.get(a)).slice(0, 40);
  if (!keys.length) { if (res.every(r => r.status === "rejected")) throw new Error("offline"); return []; }
  const out = [];
  for (let i = 0; i < keys.length; i += 20) {
    const d = await api(API.c, { action: "query", titles: keys.slice(i, i + 20).map(k => "File:" + orig.get(k)).join("|"), prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "1800", iiextmetadatafilter: "Artist|LicenseShortName" });
    ((d.query || {}).pages || []).forEach(p => {
      const ii = p.imageinfo && p.imageinfo[0]; if (!ii || p.missing) return;
      if (!/^image\/(svg|png|jpe?g|gif|webp)/.test(ii.mime) || Math.max(ii.width, ii.height) < 300) return;
      const md = ii.extmetadata || {};
      out.push({ title: p.title.replace(/^File:/, ""), score: score.get(tkey(p.title)) || 0, url: ii.thumburl || ii.url, page: ii.descriptionurl, w: ii.width, h: ii.height,
        artist: strip(md.Artist && md.Artist.value), license: strip(md.LicenseShortName && md.LicenseShortName.value) });
    });
  }
  return out.sort((a, b) => b.score - a.score);
}
const thumb = u => u.replace(/\/(\d+)px-/, "/480px-");
async function takeWiki(t, cand) {
  const r = await fetch(cand.url); if (!r.ok) throw new Error("HTTP " + r.status);
  const png = await toPNG(await r.blob(), 2200);
  await setMap(t, png.blob, { src: "wiki", title: cand.title, page: cand.page, artist: cand.artist, license: cand.license, w: png.w, h: png.h });
}
async function autoWiki(t) {
  const cat = catOf(t); if (!cat || !cat.w || !navigator.onLine) return;
  try {
    const list = await wikiCandidates(cat.w); if (!list.length || track() !== t || t.map) return;
    await takeWiki(t, list[0]); startPlacing(t); renderSafe(); toast("Plan von Wikipedia geladen – jetzt die Nummern antippen");
  } catch (e) { /* ohne Netz bleibt der Knopf „Wikipedia-Plan laden“ */ }
}

/* ---------- Ansichten ---------- */
let view = "bahnen", placing = null, placeOne = null;
function show(v) {
  view = v;
  document.querySelectorAll(".view").forEach(s => s.classList.toggle("on", s.id === "v-" + v));
  document.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.v === v));
  render(); scrollTo(0, 0);
}
function render() { ({ bahnen: renderBahnen, plan: renderPlan, laeufe: renderRuns, buch: renderBuch })[view](); }
function renderSafe() { if (!$("sheet").classList.contains("on")) render(); }
function progressBar(t) {
  const c = counts(t), n = t.curves.filter(x => driven(t, x)).length || 1;
  return `<div class="progress">${["sitzt", "ueben", "neu"].map(k => `<i style="width:${(c[k] || 0) / n * 100}%;background:${STATUS[k][1]}"></i>`).join("")}</div>`;
}
function startBar(t) {
  return `<div class="startbar noprint"><div class="chips">${t.starts.map(s => `<button data-start="${s.id}" class="${s.id === t.curStart ? "on" : ""}">${esc(s.name)} <small>ab ${s.from}</small></button>`).join("")}<button data-a="starts" class="more">Starts …</button></div></div>`;
}
function startLine(t) {
  const s = start(t), n = t.curves.filter(x => driven(t, x)).length;
  return [s.name, "ab Kurve " + s.from, s.len ? s.len + " m" : "", n + " Kurven", s.hoehe ? s.hoehe + " m ü. NN" : ""].filter(Boolean).join(" · ");
}
function renderBahnen() {
  let h = `<p class="eyebrow">Training</p><h1>Bahnplan</h1><p class="sub">Dein Kurvenbuch fürs Rennrodeln: der Original-Plan jeder Bahn, deine Starts, zu jeder Kurve Anfahrt, Einlenken, Scheitel und Ausfahrt – und deine Läufe mit Zeiten.</p>`;
  h += `<section class="grp"><header><span>Meine Bahnen</span><button class="lnk" data-a="add">Hinzufügen</button></header><div class="cells">`;
  if (!S.tracks.length) h += `<div class="empty">Noch keine Bahn. Tippe auf „Hinzufügen“ und wähle eine Bahn aus der Liste – oder lege eine eigene an.</div>`;
  S.tracks.forEach(t => {
    h += `<button class="row" data-open="${t.id}"><span class="ic" style="background:var(--acc)">${esc(t.name.charAt(0))}</span><span class="tx"><b>${esc(t.name)}</b><small>${esc([t.land, t.starts.map(s => s.name.replace("start", "")).join(" / "), t.curves.length + " Kurven", t.runs.length ? t.runs.length + " Läufe" : ""].filter(Boolean).join(" · "))}</small></span><span class="chev">›</span></button>`;
  });
  h += `</div><p class="gfoot">Notizen und Läufe werden mit der Cloud-Sicherung abgeglichen. Plan-Bilder bleiben auf dem Gerät – auf einem neuen Gerät einfach neu von Wikipedia laden.</p></section>`;
  h += `<section class="grp"><header><span>Einstellungen</span></header><div class="cells">
    <button class="row" data-a="fields"><span class="tx"><b>Felder anpassen</b><small>Bereiche des Kurvenblatts ein- und ausblenden, eigene Felder, Plan-Bild</small></span><span class="chev">›</span></button></div></section>`;
  h += `<section class="grp"><header><span>So arbeitest du mit dem Buch</span></header><div class="cells"><div class="src">
    <b>1. Starts:</b> Lege die Starts der Bahn fest (Herren, Damen, Doppelsitzer, Junioren …). Jede Kurve hat eine gemeinsame Fassung – für einen Start kannst du eine eigene anlegen, wenn du sie von dort anders fährst.<br>
    <b>2. Plan:</b> Der Original-Streckenplan kommt von Wikipedia. Tippe einmal auf jede Kurvennummer im Bild – oder blende das Bild ganz aus.<br>
    <b>3. Kurven:</b> Pro Kurve Anfahrt, Einlenken, Scheitel, Ausfahrt, Körper und Fehlerbilder festhalten. Die Ideallinie zeichnest du in den Ausschnitt des Original-Plans.<br>
    <b>4. Vorbilder:</b> Beim Weltcup-Schauen notieren, wie die Besten die Kurve fahren – mit Video-Link.<br>
    <b>5. Läufe:</b> Zeiten, Zwischenzeiten, Eis und Wetter, Setup und Problemkurven eintragen.<br>
    <b>6. Durchgehen und Drucken:</b> Vor dem Lauf die Bahn im Kopf abfahren, unter „Buch“ den Bahnplan für deinen Start ausdrucken.
  </div></div></section>`;
  h += `<section class="grp"><header><span>Quellen und Vorbilder</span></header><div class="cells"><div class="src">
    Pläne: <a href="https://commons.wikimedia.org/wiki/Category:Maps_of_sledding_tracks" target="_blank" rel="noopener">Wikimedia Commons – Maps of sledding tracks</a> und die Wikipedia-Artikel der Bahnen (Urheber und Lizenz stehen unter jedem Plan).<br>
    Starts und Längen: <a href="https://www.usaluge.org/luge-tracks-around-the-world" target="_blank" rel="noopener">USA Luge – Luge Tracks</a>, <a href="https://en.wikipedia.org/wiki/List_of_bobsleigh,_luge,_and_skeleton_tracks" target="_blank" rel="noopener">Wikipedia – Liste der Bahnen</a>, <a href="https://www.fil-luge.org/en/tracks/artificial-tracks" target="_blank" rel="noopener">FIL – Kunstbahnen</a>.<br>
    Technik und Material: <a href="https://de.wikipedia.org/wiki/Rennrodeln" target="_blank" rel="noopener">Wikipedia – Rennrodeln</a>, <a href="https://www.luge.ca/en/about/luge/" target="_blank" rel="noopener">Luge Canada</a>, <a href="https://www.nbcolympics.com/news/luge-101-equipment" target="_blank" rel="noopener">NBC – Luge Equipment</a>.<br>
    Aufbau der Notizen nach: Kursbesichtigung im Skirennsport (<a href="https://eliteam.com/how-to-inspect-a-race-course/" target="_blank" rel="noopener">Elite Alpine</a>), Rallye-Aufschrieb (<a href="https://en.wikipedia.org/wiki/Pacenotes" target="_blank" rel="noopener">Pacenotes</a>).
  </div></div></section>`;
  $("v-bahnen").innerHTML = h;
}
function pinsHTML(t) {
  return t.curves.filter(x => x.x != null).map(x =>
    `<button class="pin${placing === x.n ? " sel" : ""}${driven(t, x) ? "" : " off"}" data-c="${x.n}" style="left:${x.x}%;top:${x.y}%;background:${STATUS[V(t, x).status][1]}" aria-label="Kurve ${x.n}">${x.n}</button>`).join("");
}
function mapBlock(t) {
  if (!t.map || !mapURL) {
    return `<div class="nomap"><b>Noch kein Plan</b><p>Lade den Original-Streckenplan von Wikipedia. Er wird als PNG auf diesem Gerät gespeichert und funktioniert danach auch ohne Netz.</p>
      <div class="btns"><button class="btn p" data-a="wiki">Wikipedia-Plan laden</button><button class="btn" data-a="img">Eigenes Bild</button><button class="btn" data-a="nomap">Ohne Bild</button></div></div>`;
  }
  return `<div class="imgwrap${placing ? " placing" : ""}" id="imgwrap"><img src="${mapURL}" alt="Streckenplan ${esc(t.name)}" draggable="false">${pinsHTML(t)}</div>`;
}
function credit(t) {
  if (!t.map) return "";
  if (t.map.src !== "wiki") return `<p class="credit">Eigenes Bild</p>`;
  return `<p class="credit">Plan: <a href="${esc(t.map.page)}" target="_blank" rel="noopener">${esc(t.map.title)}</a>${t.map.artist ? " · " + esc(t.map.artist) : ""}${t.map.license ? " · " + esc(t.map.license) : ""} · Wikimedia Commons</p>`;
}
function startPlacing(t) { const nx = t.curves.find(c => c.x == null); placing = nx ? nx.n : null; }
function renderPlan() {
  const t = track();
  if (!t) { $("v-plan").innerHTML = `<p class="eyebrow">Bahnplan</p><h1>Kein Plan offen</h1><p class="sub">Wähle unter „Bahnen“ eine Bahn aus oder füge eine hinzu.</p><button class="btn p" data-a="add">Bahn hinzufügen</button>`; return; }
  const c = counts(t), pinned = t.curves.filter(x => x.x != null).length, s = start(t);
  let h = `<div class="planhead"><div class="t"><p class="eyebrow">${esc([t.ort, t.land].filter(Boolean).join(" · "))}</p><h1>${esc(t.name)}</h1></div>
    <div class="btns noprint"><button class="btn sm p" data-a="viz">Durchgehen</button><button class="btn sm" data-a="trackedit">Bahn bearbeiten</button></div></div>`;
  h += startBar(t);
  h += `<p class="sub" style="margin-top:8px">${esc(startLine(t))} · ${c.sitzt || 0} sitzen, ${c.ueben || 0} übe ich</p>`;
  h += progressBar(t);
  const showMap = S.showMap;
  h += `<div class="plan${showMap ? "" : " nomapcol"}">`;
  if (showMap) {
    h += `<div class="mapcard">`;
    if (placing && t.map) h += `<div class="placebar"><span>Tippe im Plan auf die Stelle von <b>Kurve ${placing}</b></span><button class="btn sm" data-a="placeskip">Überspringen</button><button class="btn sm p" data-a="placedone">Fertig</button></div>`;
    h += mapBlock(t);
    if (t.map && mapURL) {
      h += `<div class="maptools noprint"><span>${placing ? "" : pinned ? "Nummer antippen zeigt die Kurve" : "Noch keine Nummern gesetzt"}</span><span class="sp"></span>
        <button class="btn sm" data-a="zoom">Groß</button><button class="btn sm" data-a="placeall">Nummern setzen</button><button class="btn sm" data-a="mapmenu">Plan ⋯</button></div>`;
      if (placing) h += `<div class="chips noprint">` + t.curves.map(x => `<button data-place="${x.n}" class="${placing === x.n ? "on" : x.x != null ? "set" : ""}">${x.n}</button>`).join("") + `</div>`;
      h += credit(t);
    }
    h += `</div>`;
  }
  h += `<div>`;
  h += `<section class="grp"><header><span>Kurven</span>${showMap ? "" : `<button class="lnk" data-a="mapshow">Plan-Bild zeigen</button>`}</header><div class="cells">`;
  t.curves.forEach(x => {
    if (x.n === +s.from) h += `<div class="startrow"><span class="flag">▶</span><span><b>${esc(s.name)}</b>${s.paddel ? " · " + esc(s.paddel) + " Paddelschläge" : ""}${s.note ? " · " + esc(s.note) : ""}</span></div>`;
    const vx = V(t, x), on = driven(t, x);
    h += `<button class="row crow${on ? "" : " off"}" data-c="${x.n}"><span class="num" style="background:${on ? STATUS[vx.status][1] : "var(--s3)"}">${x.n}</span><span class="tx"><b>${esc(x.name || x.type)}${getO(t, x, "prio") === "Schlüsselkurve" ? " ★" : ""}${hasOwn(t, x) ? ` <em class="own">eigene Fassung</em>` : ""}</b><small>${esc(on ? (vx.cue || formText(x)) : "wird von diesem Start nicht gefahren")}</small></span>${s.zz && s.zz.includes(x.n) ? `<span class="zz">ZZ</span>` : ""}<span class="chev">›</span></button>`;
  });
  h += `<div class="startrow"><span class="flag">■</span><span><b>Ziel</b></span></div></div></section>`;
  h += `<div class="legend">${Object.keys(STATUS).map(k => `<span><i style="background:${STATUS[k][1]}"></i>${STATUS[k][0]}</span>`).join("")}<span>ZZ = Zwischenzeit</span></div>`;
  if (t.note) h += `<p class="gfoot" style="margin-top:14px">${esc(t.note)}</p>`;
  h += `</div></div>`;
  $("v-plan").innerHTML = h;
}

/* ---------- Ausschnitt einer Kurve aus dem Original-Plan (mit eigener Linie) ---------- */
function cropBox(t, x) {
  const W = t.map.w, H = t.map.h, z = clamp(x.zoom || .26, .08, 1), cw = Math.min(W, W * z), ch = Math.min(H, cw * .7);
  return [clamp(x.x / 100 * W - cw / 2, 0, Math.max(0, W - cw)), clamp(x.y / 100 * H - ch / 2, 0, Math.max(0, H - ch)), cw, ch];
}
function cropSVG(t, x, id) {
  if (!t.map || !mapURL || x.x == null) return "";
  const b = cropBox(t, x), sw = (b[2] / 90).toFixed(1), line = V(t, x).line || [];
  return `<svg class="crop"${id ? ` id="${id}"` : ""} viewBox="${b.map(v => v.toFixed(1)).join(" ")}" preserveAspectRatio="xMidYMid meet"><image href="${mapURL}" width="${t.map.w}" height="${t.map.h}"/>` +
    `<g class="ln">${line.map(p => `<polyline points="${p.join(" ")}" fill="none" stroke="#e5383b" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</g></svg>`;
}

/* ---------- Kurvenblatt ---------- */
let curN = null, drawOn = false;
function optRow(t, x, o) {
  const v = getO(t, x, o[0]), multi = !!o[3];
  return `<div class="fieldrow"><label>${o[1]}</label><div class="seg wrap" data-o="${o[0]}"${multi ? ' data-m="1"' : ""}>${o[2].map(w => `<button data-v="${esc(w)}" class="${multi ? (Array.isArray(v) && v.includes(w) ? "on" : "") : v === w ? "on" : ""}">${esc(w)}</button>`).join("")}</div></div>`;
}
function numRow(t, x, nums) {
  if (!nums || !nums.length) return "";
  return `<div class="fieldrow"><label>${nums.map(n => n[1]).join(" und ")}</label>${nums.map(n => `<input class="inp" data-ok="${n[0]}" type="number" inputmode="decimal" min="0" value="${esc(getO(t, x, n[0]) ?? "")}" placeholder="${n[2]}" style="width:110px">`).join("")}</div>`;
}
function textRows(t, x, texts) {
  return texts.map(f => f[0] === "video"
    ? `<div class="field"><label>${f[1]}${getF(t, x, f[0]) ? ` · <a href="${esc(getF(t, x, f[0]))}" target="_blank" rel="noopener">öffnen</a>` : ""}</label><input data-f="video" type="url" inputmode="url" value="${esc(getF(t, x, f[0]) || "")}" placeholder="${esc(f[2])}"></div>`
    : `<div class="field"><label>${f[1]}</label><textarea data-f="${f[0]}" rows="1" placeholder="${esc(f[2])}">${esc(getF(t, x, f[0]) || "")}</textarea></div>`).join("");
}
function filled(t, x, g) {
  let n = 0;
  g[2].forEach(o => { const v = getO(t, x, o[0]); if (Array.isArray(v) ? v.length : v) n++; });
  g[3].forEach(f => { if (getF(t, x, f[0])) n++; }); (g[4] || []).forEach(o => { if (getO(t, x, o[0])) n++; });
  return n;
}
function group(name, body, count, extra) {
  return `<details class="grp fold" data-fold="${name}"${S.closed[name] ? "" : " open"}><summary><span>${name}</span>${count ? `<i>${count}</i>` : ""}${extra || ""}</summary><div class="cells">${body}</div></details>`;
}
function openCurve(n, keepScroll) {
  const t = track(); if (!t) return;
  const x = t.curves.find(c => c.n === n); if (!x) return;
  const sc = keepScroll ? $("sheetPane").scrollTop : 0;
  curN = n;
  const i = t.curves.indexOf(x), H = S.hide, s = start(t), vx = V(t, x), own = hasOwn(t, x), multi = t.starts.length > 1;
  let h = `<div class="shead"><button class="ib" data-a="cprev" ${i ? "" : "disabled"} aria-label="Vorige Kurve">‹</button><h2>Kurve ${x.n}</h2><button class="ib" data-a="cnext" ${i < t.curves.length - 1 ? "" : "disabled"} aria-label="Nächste Kurve">›</button><button class="ib" data-a="close" aria-label="Schließen">✕</button></div>`;
  // Fassung: gemeinsam für alle Starts oder eigene für den gewählten Start
  h += `<div class="fassung${own ? " own" : ""}"><div class="chips">${t.starts.map(z => `<button data-start="${z.id}" class="${z.id === t.curStart ? "on" : ""}">${esc(z.name)}${x.v[z.id] ? " •" : ""}</button>`).join("")}</div>`;
  if (!driven(t, x)) h += `<p>Vom <b>${esc(s.name)}</b> (ab Kurve ${s.from}) wird diese Kurve nicht gefahren.</p>`;
  else if (own) h += `<p>Du bearbeitest die <b>eigene Fassung für den ${esc(s.name)}</b>. Form, Eis und Licht der Kurve gelten für alle Starts.</p><button class="btn sm" data-a="ownoff">Gemeinsame Fassung verwenden</button>`;
  else if (multi) h += `<p>Gemeinsame Fassung – gilt für alle Starts ohne eigene Fassung.</p><button class="btn sm" data-a="ownon">Für ${esc(s.name)} anders fahren</button>`;
  h += `</div>`;
  if (!H["Ausschnitt"] && S.showMap) {
    const ln = vx.line || [];
    h += `<section class="grp"><header><span>Ausschnitt aus dem Plan</span>${ln.length ? `<button class="lnk" data-a="lineundo">Rückgängig</button><button class="lnk" data-a="lineclear">Löschen</button>` : ""}</header><div class="cells">`;
    if (!t.map || !mapURL) h += `<div class="empty">Noch kein Plan geladen. <button class="lnk" data-a="wiki">Wikipedia-Plan laden</button></div>`;
    else if (x.x == null) h += `<div class="empty">Kurve ${x.n} ist im Plan noch nicht markiert. <button class="lnk" data-a="placeone">Jetzt im Plan antippen</button></div>`;
    else h += `<div class="drawbox${drawOn ? " on" : ""}">${cropSVG(t, x, "cropDraw")}</div><div class="fieldrow tools"><button class="btn sm${drawOn ? " p" : ""}" data-a="drawtoggle">${drawOn ? "Zeichnen: an" : "Linie zeichnen"}</button><span class="sp"></span><button class="ib" data-a="zin" aria-label="Näher">+</button><button class="ib" data-a="zout" aria-label="Weiter weg">−</button><button class="btn sm" data-a="placeone">Nummer verschieben</button></div>`;
    h += `</div><p class="gfoot">Rot ist deine Ideallinie${own ? " für diesen Start" : ""}. „Linie zeichnen“ antippen, dann mit dem Finger durch die Kurve ziehen.</p></section>`;
  }
  h += `<section class="grp"><div class="cells">
    <div class="field cue"><label>Meine Ansage <small>– kurz, wie im Rallye-Aufschrieb</small></label><input data-k="cue" value="${esc(vx.cue)}" placeholder="z. B. L4 zieht zu, früh rein, Druck halten"></div>
    <div class="field"><label>Name</label><input data-k="name" value="${esc(x.name)}" placeholder="z. B. Kreisel, Omega, Echowand"></div>
  </div></section>`;
  GROUPS.forEach(g => {
    if (H[g[0]]) return;
    let body = "";
    if (g[0] === "Kurve") {
      body += `<div class="fieldrow"><label>Art</label><select class="inp" data-k="type">${Object.keys(TYPES).map(k => `<option${k === x.type ? " selected" : ""}>${k}</option>`).join("")}</select></div>`;
      if (!NOARC(x.type)) body += `<div class="fieldrow"><label>Richtung und Winkel</label><div class="seg" data-seg="dir"><button data-v="L" class="${x.dir === "L" ? "on" : ""}">Links</button><button data-v="R" class="${x.dir === "R" ? "on" : ""}">Rechts</button></div>
        <select class="inp" data-k="angle"><option value="">Winkel?</option>${[20, 30, 45, 60, 75, 90, 105, 120, 135, 150, 180, 200, 225, 250, 270, 300, 320, 340, 360].map(a => `<option value="${a}"${+x.angle === a ? " selected" : ""}>${a}°</option>`).join("")}</select></div>`;
    }
    if (g[0] === "Bewertung") {
      body += `<div class="fieldrow"><label>Wie sicher fahre ich sie?</label><div class="seg" data-seg="status">${Object.keys(STATUS).map(k => `<button data-v="${k}" class="${vx.status === k ? "on" : ""}">${STATUS[k][0]}</button>`).join("")}</div></div>
        <div class="fieldrow"><label>Schwierigkeit</label><div class="seg" data-seg="diff">${[1, 2, 3, 4, 5].map(d => `<button data-v="${d}" class="${+vx.diff === d ? "on" : ""}">${d}</button>`).join("")}</div></div>`;
    }
    body += g[2].map(o => optRow(t, x, o)).join("") + numRow(t, x, g[4]) + textRows(t, x, g[3]);
    h += group(g[0], body, filled(t, x, g), g[1] && multi ? `<em class="all">alle Starts</em>` : "");
  });
  if (!H["Eigene Felder"]) {
    h += group("Eigene Felder", (t.custom.length ? t.custom.map(cf => `<div class="field"><label>${esc(cf.label)}</label><textarea data-f="c_${cf.id}" rows="1">${esc(vx.f["c_" + cf.id] || "")}</textarea></div>`).join("") : `<div class="empty">Noch keine eigenen Felder.</div>`) +
      `<div class="fieldrow"><button class="btn sm" data-a="fields">Eigene Felder bearbeiten</button></div>`, 0);
  }
  if (!H["Laufnotizen"]) {
    h += group("Laufnotizen", (x.runs.length ? x.runs.map((r, ri) =>
      `<div class="run"><i class="rate" style="background:${r.rate === "gut" ? "#30d158" : r.rate === "schwer" ? "#ff453a" : "#ff9f0a"}"></i><b>${esc(dmy(r.date))}${r.start ? " · " + esc((t.starts.find(z => z.id === r.start) || {}).name || "") : ""}</b><span>${esc(r.text)}</span><button class="lnk" data-delrun="${ri}" aria-label="Löschen">✕</button></div>`).join("") : `<div class="empty">Noch keine Notiz zu dieser Kurve.</div>`) +
      `<div class="runadd"><input type="date" id="runDate" value="${today()}" class="inp"><div class="seg" id="runRate"><button data-v="gut">Gut</button><button data-v="ok" class="on">Okay</button><button data-v="schwer">Schwer</button></div>
        <textarea id="runText" placeholder="Was ist in dieser Kurve passiert? Was mache ich beim nächsten Lauf anders?"></textarea><button class="btn p" data-a="addrun" style="grid-column:1/-1">Notiz speichern</button></div>`, x.runs.length);
  }
  h += `<p class="gfoot" style="text-align:center"><button class="lnk" data-a="fields">Felder anpassen</button></p>`;
  $("sheetPane").innerHTML = h;
  $("sheet").classList.add("on");
  $("sheetPane").scrollTop = sc;
  document.querySelectorAll("#sheetPane textarea").forEach(grow);
  setupDraw(t, x);
}
function closeSheet() { $("sheet").classList.remove("on", "wide"); curN = null; drawOn = false; render(); }
function grow(ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }
// Linie mit dem Finger in den Ausschnitt zeichnen – gespeichert als Punkte im Plan-Bild (klein, mit Cloud-Sicherung)
function setupDraw(t, x) {
  const sv = $("cropDraw"); if (!sv || !drawOn) return;
  sv.style.touchAction = "none";
  let cur = null;
  const pt = e => { const p = sv.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(sv.getScreenCTM().inverse()); return [Math.round(q.x), Math.round(q.y)]; };
  const g = sv.querySelector(".ln"), sw = (cropBox(t, x)[2] / 90).toFixed(1);
  sv.onpointerdown = e => { e.preventDefault(); sv.setPointerCapture(e.pointerId); cur = pt(e); const pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    pl.setAttribute("fill", "none"); pl.setAttribute("stroke", "#e5383b"); pl.setAttribute("stroke-width", sw); pl.setAttribute("stroke-linecap", "round"); pl.setAttribute("stroke-linejoin", "round"); pl.setAttribute("points", cur.join(" ")); g.appendChild(pl); sv._pl = pl; };
  sv.onpointermove = e => { if (!cur) return; const p = pt(e); if (Math.hypot(p[0] - cur[cur.length - 2], p[1] - cur[cur.length - 1]) < 2) return; cur.push(p[0], p[1]); sv._pl.setAttribute("points", cur.join(" ")); };
  sv.onpointerup = sv.onpointercancel = () => { if (!cur) return; const vx = V(t, x); vx.line = vx.line || []; if (cur.length >= 4) { vx.line.push(cur); save(); } cur = null; openCurve(x.n, true); };
}

/* ---------- Läufe: Zeiten, Zwischenzeiten, Bedingungen, Setup ---------- */
const WETTER = ["Sonne", "bewölkt", "Schnee", "Regen", "Nebel"], EIS = ["hart", "normal", "weich", "Rillen", "frisch präpariert"], ART = ["Training", "Abschlusstraining", "Rennen"];
function renderRuns() {
  const t = track();
  if (!t) { $("v-laeufe").innerHTML = `<h1>Läufe</h1><p class="sub">Wähle zuerst eine Bahn.</p>`; return; }
  const s = start(t), list = t.runs.filter(r => r.start === s.id).sort((a, b) => (b.date + (b.t || "")).localeCompare(a.date + (a.t || "")));
  const times = list.map(r => +r.time).filter(v => v > 0), best = times.length ? Math.min(...times) : null;
  let h = `<div class="planhead"><div class="t"><p class="eyebrow">${esc(t.name)}</p><h1>Läufe</h1></div><div class="btns"><button class="btn p" data-a="runnew">Lauf eintragen</button></div></div>`;
  h += startBar(t);
  h += `<div class="stats"><div><b>${list.length}</b><small>Läufe</small></div><div><b>${best ? secs(best) : "–"}</b><small>Bestzeit</small></div><div><b>${times.length ? secs(times.reduce((a, b) => a + b, 0) / times.length) : "–"}</b><small>Schnitt</small></div></div>`;
  if (s.zz && s.zz.length) {
    const bz = s.zz.map((n, i) => { const v = list.map(r => +(r.zz || [])[i]).filter(v => v > 0); return v.length ? Math.min(...v) : null; });
    h += `<p class="gfoot" style="margin:0 6px 14px">Beste Zwischenzeiten: ${s.zz.map((n, i) => `nach Kurve ${n}: ${bz[i] ? secs(bz[i]) : "–"}`).join(" · ")}</p>`;
  } else h += `<p class="gfoot" style="margin:0 6px 14px">Zwischenzeiten legst du unter „Starts …“ fest (nach welcher Kurve gemessen wird).</p>`;
  h += `<section class="grp"><header><span>${esc(s.name)}</span></header><div class="cells">`;
  if (!list.length) h += `<div class="empty">Noch kein Lauf von diesem Start.</div>`;
  list.forEach(r => {
    const d = best && r.time ? +r.time - best : null;
    h += `<button class="row" data-run="${r.id}"><span class="tx"><b>${r.time ? secs(r.time) + " s" : "ohne Zeit"}${d ? ` <em class="delta">+${secs(d)}</em>` : d === 0 ? ` <em class="best">Bestzeit</em>` : ""}</b><small>${esc([dmy(r.date), r.kind, r.startTime ? "Start " + secs(r.startTime) : "", r.iceT !== "" && r.iceT != null ? "Eis " + r.iceT + " °C" : "", r.wetter, r.eis, r.curves && r.curves.length ? "Probleme: " + r.curves.join(", ") : ""].filter(Boolean).join(" · "))}</small></span><span class="chev">›</span></button>`;
  });
  h += `</div></section>`;
  $("v-laeufe").innerHTML = h;
}
function openRun(id) {
  const t = track(), s = start(t);
  const r = t.runs.find(z => z.id === id) || { id: "", date: today(), start: s.id, kind: "Training", time: "", startTime: "", zz: [], place: "", iceT: "", airT: "", wetter: "", eis: "", feel: "", setup: sledLine(t), curves: [], note: "" };
  const st = t.starts.find(z => z.id === r.start) || s;
  const sg = (k, vals) => `<div class="seg wrap" data-rs="${k}">${vals.map(v => `<button type="button" data-v="${esc(v)}" class="${r[k] === v ? "on" : ""}">${esc(v)}</button>`).join("")}</div>`;
  openSheet(sheetHead(id ? "Lauf" : "Lauf eintragen") + `<form id="runForm" data-id="${esc(r.id)}">
    <section class="grp"><div class="cells">
      <div class="fieldrow"><label>Datum und Start</label><input class="inp" type="date" name="date" value="${esc(r.date)}"><select class="inp" name="start">${t.starts.map(z => `<option value="${z.id}"${z.id === st.id ? " selected" : ""}>${esc(z.name)}</option>`).join("")}</select></div>
      <div class="fieldrow"><label>Art</label>${sg("kind", ART)}</div>
    </div></section>
    <section class="grp"><header><span>Zeiten (Sekunden)</span></header><div class="cells">
      <div class="fieldrow"><label>Startzeit und Endzeit</label><input class="inp" name="startTime" type="number" step="0.001" inputmode="decimal" value="${esc(r.startTime)}" placeholder="Start" style="width:110px"><input class="inp" name="time" type="number" step="0.001" inputmode="decimal" value="${esc(r.time)}" placeholder="Endzeit" style="width:120px"></div>
      ${(st.zz || []).length ? `<div class="fieldrow"><label>Zwischenzeiten</label>${st.zz.map((n, i) => `<input class="inp" name="zz${i}" type="number" step="0.001" inputmode="decimal" value="${esc((r.zz || [])[i] ?? "")}" placeholder="nach K${n}" style="width:100px">`).join("")}</div>` : ""}
      <div class="fieldrow"><label>Platz (im Rennen)</label><input class="inp" name="place" type="number" min="1" value="${esc(r.place)}" style="width:90px"></div>
    </div></section>
    <section class="grp"><header><span>Bedingungen</span></header><div class="cells">
      <div class="fieldrow"><label>Eis- und Lufttemperatur (°C)</label><input class="inp" name="iceT" type="number" step="0.1" value="${esc(r.iceT)}" placeholder="Eis" style="width:100px"><input class="inp" name="airT" type="number" step="0.1" value="${esc(r.airT)}" placeholder="Luft" style="width:100px"></div>
      <div class="fieldrow"><label>Wetter</label>${sg("wetter", WETTER)}</div>
      <div class="fieldrow"><label>Eis</label>${sg("eis", EIS)}</div>
    </div></section>
    <section class="grp"><header><span>Lauf</span></header><div class="cells">
      <div class="fieldrow"><label>Gefühl</label>${sg("feel", ["1", "2", "3", "4", "5"])}</div>
      <div class="fieldrow"><label>Problemkurven</label><div class="chips" data-rc="1">${t.curves.filter(x => x.n >= +st.from).map(x => `<button type="button" data-v="${x.n}" class="${(r.curves || []).includes(x.n) ? "on" : ""}">${x.n}</button>`).join("")}</div></div>
      <div class="field"><label>Setup</label><textarea name="setup" rows="1" placeholder="Kufen, Stahl, Schliff, Gewicht …">${esc(r.setup)}</textarea></div>
      <div class="field"><label>Notiz</label><textarea name="note" rows="2" placeholder="Was lief gut, was nicht?">${esc(r.note)}</textarea></div>
    </div></section>
    <div class="btns" style="justify-content:space-between"><button class="btn p" type="submit">Speichern</button>${id ? `<button class="btn d" type="button" data-a="rundel">Löschen</button>` : ""}</div></form>`);
  $("runForm").dataset.state = JSON.stringify({ kind: r.kind, wetter: r.wetter, eis: r.eis, feel: r.feel, curves: r.curves || [] });
  document.querySelectorAll("#sheetPane textarea").forEach(grow);
}
function sledLine(t) { const s = t.sled || {}; return [s.kufen && "Kufen " + s.kufen, s.stahl && "Stahl " + s.stahl, s.schliff && "Schliff " + s.schliff, s.gewicht && "Weste " + s.gewicht + " kg"].filter(Boolean).join(" · "); }

/* ---------- Buch / Druck (für den gewählten Start) ---------- */
function optRows(t, x) {
  const rows = [];
  GROUPS.forEach(g => {
    if (S.hide[g[0]]) return;
    const v = g[2].filter(o => { const w = getO(t, x, o[0]); return Array.isArray(w) ? w.length : w; }).map(o => o[1] + ": " + optVal(getO(t, x, o[0])));
    (g[4] || []).forEach(n => { const w = getO(t, x, n[0]); if (w) v.push(n[1] + ": " + w + " " + n[2]); });
    if (v.length) rows.push([g[0], v.join(" · ")]);
  });
  return rows;
}
function renderBuch() {
  const t = track();
  if (!t) { $("v-buch").innerHTML = `<h1>Buch</h1><p class="sub">Wähle zuerst eine Bahn.</p>`; return; }
  const P = S.print, s = start(t);
  let h = `<div class="noprint printopts"><div class="planhead"><div class="t"><p class="eyebrow">Kurvenbuch</p><h1>Drucken</h1></div><div class="btns"><button class="btn p" data-a="print">Drucken / PDF</button></div></div>${startBar(t)}
    <div class="chips">${[["map", "Plan-Bild"], ["pins", "Nummern im Plan"], ["crops", "Kurvenausschnitte"], ["opts", "Auswahlfelder"], ["sled", "Start & Setup"], ["runs", "Laufnotizen"], ["empty", "Kurven ohne Notizen"]].map(o => `<button data-popt="${o[0]}" class="${P[o[0]] ? "on" : ""}">${P[o[0]] ? "✓ " : ""}${o[1]}</button>`).join("")}</div></div>`;
  h += `<article class="paper"><header class="bookhead"><p class="eyebrow">Bahnplan · ${esc(s.name)}</p><h1>${esc(t.name)}</h1><p class="sub">${esc([t.ort, t.land].filter(Boolean).join(" · "))} · ${esc(startLine(t))} · Stand ${new Date().toLocaleDateString("de-DE")}</p></header>`;
  if (P.map && t.map && mapURL) h += `<figure class="bmap"><div class="imgwrap"><img src="${mapURL}" alt="Streckenplan">${P.pins ? pinsHTML(t) : ""}</div>${credit(t)}</figure>`;
  const sl = t.sled || {};
  const tn = [["Allgemein", t.note]];
  if (P.sled) tn.push(["Start", [s.paddel ? s.paddel + " Paddelschläge" : "", s.note].filter(Boolean).join(" · ")], ["Zwischenzeiten", (s.zz || []).length ? "nach Kurve " + s.zz.join(", ") : ""],
    ["Schlitten", [sl.schlitten, sledLine(t), sl.bogen && "Bogen " + sl.bogen, sl.sitz && "Sitz " + sl.sitz, sl.note].filter(Boolean).join(" · ")]);
  const tnr = tn.filter(r => r[1]);
  if (tnr.length) h += `<dl class="tnotes">${tnr.map(r => `<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join("")}</dl>`;
  h += `<div class="book">`;
  t.curves.filter(x => driven(t, x)).forEach(x => {
    const vx = V(t, x), rows = [];
    if (P.opts) optRows(t, x).forEach(r => rows.push(r));
    GROUPS.forEach(g => { if (S.hide[g[0]]) return; g[3].forEach(f => { const w = getF(t, x, f[0]); if (w) rows.push([f[1], w]); }); });
    if (!S.hide["Eigene Felder"]) t.custom.forEach(cf => { if (vx.f["c_" + cf.id]) rows.push([cf.label, vx.f["c_" + cf.id]]); });
    if (P.runs) x.runs.slice(0, 3).forEach(r => rows.push(["Notiz " + dmy(r.date), r.text]));
    const has = rows.length || vx.cue || (vx.line || []).length;
    if (!has && !P.empty) return;
    const crop = P.crops ? cropSVG(t, x) : "";
    h += `<section class="cv${crop ? " wcrop" : ""}">${crop ? `<div class="cvimg">${crop}</div>` : ""}<div class="cvtx"><div class="cvh"><span class="num" style="background:${STATUS[vx.status][1]}">${x.n}</span><div><b>${esc(x.name || x.type)}${getO(t, x, "prio") === "Schlüsselkurve" ? " ★" : ""}</b><small>${esc([formText(x), "Schwierigkeit " + vx.diff + "/5", STATUS[vx.status][0], (s.zz || []).includes(x.n) ? "Zwischenzeit danach" : ""].filter(Boolean).join(" · "))}</small></div></div>`;
    if (vx.cue) h += `<div class="cue">„${esc(vx.cue)}“</div>`;
    h += rows.length ? `<dl>${rows.map(r => `<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join("")}</dl>` : `<p class="sub" style="margin:8px 0 0">Noch keine Notizen.</p>`;
    h += `</div></section>`;
  });
  $("v-buch").innerHTML = h + `</div></article>`;
}

/* ---------- Durchgehen: Bahn vom gewählten Start im Kopf abfahren ---------- */
let vizI = 0;
function openViz(i) {
  const t = track(); if (!t) return;
  const list = t.curves.filter(x => driven(t, x)); if (!list.length) return;
  vizI = clamp(i, -1, list.length - 1);
  const s = start(t);
  if (vizI < 0) {
    $("viz").innerHTML = `<div class="top"><span>${esc(t.name)} · ${esc(s.name)}</span><button class="ib" data-a="vizclose" aria-label="Beenden">✕</button></div>
      <div class="mid"><div class="bign"><b>Start</b>${esc(startLine(t))}</div><div class="cuebig">${esc([s.paddel ? s.paddel + " Paddelschläge" : "", s.note].filter(Boolean).join(" · ") || "Griffe fassen, abstoßen, paddeln, flach legen.")}</div></div>
      <div class="nav"><button class="btn" disabled>Zurück</button><button class="btn p" data-a="viznext">Los – Kurve ${list[0].n}</button></div>`;
    $("viz").classList.add("on"); return;
  }
  const x = list[vizI], vx = V(t, x), f = (k) => getF(t, x, k);
  const pts = [["Anfahrt", f("anfahrt")], ["Einlenken", f("einlenken")], ["Scheitel", f("scheitel")], ["Ausfahrt", f("ausfahrt")], ["Blick", f("blick")]].filter(p => p[1]);
  const quick = [getO(t, x, "lenkzeit") && "einlenken " + getO(t, x, "lenkzeit"), getO(t, x, "hScheitel") && "Scheitel " + getO(t, x, "hScheitel"), getO(t, x, "verhalten")].filter(Boolean).join(" · ");
  $("viz").innerHTML = `<div class="top"><span>${esc(t.name)} · ${esc(s.name)} · Kurve ${x.n}</span><button class="ib" data-a="vizclose" aria-label="Beenden">✕</button></div>
    <div class="mid">${cropSVG(t, x) && S.showMap ? `<div class="vizcrop">${cropSVG(t, x)}</div>` : ""}<div class="bign"><b>${x.n}</b>${esc([x.name !== x.type ? x.name : "", formText(x), quick].filter(Boolean).join(" · "))}</div>
    <div class="cuebig">${esc(vx.cue || "Noch keine Ansage – im Kurvenblatt eintragen.")}</div>
    <div class="pts">${pts.map(p => `<div><b>${p[0]}:</b> ${esc(p[1])}</div>`).join("")}</div></div>
    <div class="nav"><button class="btn" data-a="vizprev">Zurück</button><button class="btn p" data-a="viznext">${vizI < list.length - 1 ? "Nächste Kurve" : "Ziel ✓"}</button></div>`;
  $("viz").classList.add("on");
}

/* ---------- Blätter ---------- */
function sheetHead(title) { return `<div class="shead"><span style="width:38px"></span><h2>${title}</h2><button class="ib" data-a="close" aria-label="Schließen">✕</button></div>`; }
function openSheet(h) { $("sheetPane").innerHTML = h; $("sheet").classList.add("on"); $("sheetPane").scrollTop = 0; curN = null; }
function openPicker(q) {
  q = (q || "").toLowerCase();
  const list = CATALOG.filter(c => !q || (c.name + " " + c.ort + " " + c.land).toLowerCase().includes(q));
  const lands = [...new Set(list.map(c => c.land))];
  let h = sheetHead("Bahn hinzufügen") + `<input class="search" id="pickQ" placeholder="Bahn, Ort oder Land suchen" value="${esc(q)}" autocomplete="off">`;
  lands.forEach(l => {
    h += `<section class="grp"><header><span>${esc(l)}</span></header><div class="cells">` + list.filter(c => c.land === l).map(c => {
      const has = S.tracks.some(t => t.cat === c.id);
      return `<button class="row" data-cat="${c.id}"><span class="ic" style="background:var(--s3);color:var(--ink)">${c.n}</span><span class="tx"><b>${esc(c.name)}</b><small>${esc([c.ort, c.n + " Kurven", c.st ? c.st.map(s => s[0].replace("start", "") + " ab " + s[1]).join(", ") : ""].filter(Boolean).join(" · "))}</small></span>${has ? `<span class="dirx">schon da</span>` : ""}<span class="chev">+</span></button>`;
    }).join("") + `</div></section>`;
  });
  h += `<section class="grp"><header><span>Andere Bahn (z. B. Naturbahn)</span></header><div class="cells">
    <div class="field"><label>Name</label><input id="cuName" placeholder="z. B. Naturbahn Umhausen"></div>
    <div class="field"><label>Ort, Land</label><input id="cuOrt" placeholder="optional"></div>
    <div class="fieldrow"><label>Kurven und Länge</label><input id="cuN" class="inp" type="number" min="1" max="40" value="12" style="width:90px"> Kurven
      <input id="cuLen" class="inp" type="number" min="100" max="3000" step="10" value="1000" style="width:110px"> m</div>
    <div class="fieldrow"><button class="btn p" data-a="custom">Bahn anlegen</button></div></div><p class="gfoot">Den Plan suchst du danach auf Wikipedia oder lädst ein eigenes Bild – oder du arbeitest ganz ohne Bild.</p></section>`;
  openSheet(h);
  const inp = $("pickQ"); inp.oninput = () => { const v = inp.value; openPicker(v); const n = $("pickQ"); n.focus(); n.setSelectionRange(v.length, v.length); };
}
let wikiList = [];
async function openWiki(q) {
  const t = track(); if (!t) return;
  const cat = catOf(t), w = q ? { q, kw: "", files: [] } : (cat && cat.w) || { q: t.name + " " + (t.ort || "") + " luge track", kw: "", files: [] };
  openSheet(sheetHead("Plan von Wikipedia") + `<input class="search" id="wikiQ" placeholder="Suchbegriff, z. B. Bahnname" value="${esc(w.q)}" autocomplete="off"><div id="wikiRes"><div class="empty">Suche auf Wikipedia und Wikimedia Commons …</div></div>`);
  $("wikiQ").onkeydown = e => { if (e.key === "Enter") openWiki($("wikiQ").value.trim()); };
  try { wikiList = await wikiCandidates(w); }
  catch (e) { if ($("wikiRes")) $("wikiRes").innerHTML = `<div class="empty">Wikipedia ist gerade nicht erreichbar. Mit Internet erneut versuchen – oder ein eigenes Bild wählen.</div><div class="btns"><button class="btn" data-a="img">Eigenes Bild</button></div>`; return; }
  if (!$("wikiRes")) return;
  $("wikiRes").innerHTML = wikiList.length ? `<p class="gfoot" style="margin:0 4px 10px">Tippe auf den Streckenplan, den du verwenden willst. Er wird als PNG gespeichert.</p><div class="wgrid">` +
    wikiList.map((c, i) => `<button class="wimg" data-wiki="${i}"><span class="wi"><img src="${esc(thumb(c.url))}" alt="" loading="lazy"></span><b>${esc(c.title)}</b><small>${esc([c.artist, c.license].filter(Boolean).join(" · "))}</small></button>`).join("") + `</div>`
    : `<div class="empty">Kein Bild gefunden. Probiere einen anderen Suchbegriff (z. B. den englischen Namen der Bahn) oder wähle ein eigenes Bild.</div><div class="btns"><button class="btn" data-a="img">Eigenes Bild</button></div>`;
}
let zoomZ = 2;
function openZoom() {
  const t = track(); if (!t || !mapURL) return;
  openSheet(sheetHead("Plan") + `<div class="zoombar"><button class="ib" data-a="zzout">−</button><span>${Math.round(zoomZ * 100)} %</span><button class="ib" data-a="zzin">+</button></div>
    <div class="zoomwrap"><div class="imgwrap" style="width:${zoomZ * 100}%"><img src="${mapURL}" alt="Streckenplan" draggable="false">${pinsHTML(t)}</div></div>${credit(t)}`);
  $("sheet").classList.add("wide");
}
function openMapMenu() {
  const t = track(); if (!t) return;
  openSheet(sheetHead("Plan-Bild") + `<section class="grp"><div class="cells">
    <button class="row" data-a="wiki"><span class="tx"><b>Anderen Wikipedia-Plan wählen</b><small>Alle passenden Bilder aus Wikipedia und Commons</small></span><span class="chev">›</span></button>
    <button class="row" data-a="img"><span class="tx"><b>Eigenes Bild</b><small>Foto oder Screenshot des offiziellen Plans</small></span><span class="chev">›</span></button>
    <button class="row" data-a="savepng"><span class="tx"><b>Als PNG speichern</b><small>Plan-Bild auf das Gerät laden</small></span><span class="chev">›</span></button>
    <button class="row" data-a="pinsreset"><span class="tx"><b>Alle Nummern neu setzen</b><small>Markierungen löschen und von vorn antippen</small></span><span class="chev">›</span></button>
    <button class="row" data-a="nomap"><span class="tx"><b>Plan-Bild ausblenden</b><small>Nur mit der Kurvenliste arbeiten</small></span><span class="chev">›</span></button>
    <button class="row" data-a="mapdel"><span class="tx"><b style="color:#ff6961">Plan-Bild entfernen</b></span></button>
  </div></section>${credit(t)}`);
}
function openStarts() {
  const t = track(); if (!t) return;
  const opts = (sel) => t.curves.map(x => `<option value="${x.n}"${+sel === x.n ? " selected" : ""}>Kurve ${x.n}${x.name ? " – " + esc(x.name) : ""}</option>`).join("");
  let h = sheetHead("Starts") + `<p class="gfoot" style="margin:0 4px 14px">Jeder Start beginnt vor einer bestimmten Kurve. Pro Start kannst du Kurven anders fahren (eigene Fassung im Kurvenblatt), eigene Zwischenzeiten und Läufe führen.</p>`;
  t.starts.forEach(s => {
    h += `<section class="grp" data-sid="${s.id}"><header><span>${esc(s.name)}</span>${t.starts.length > 1 ? `<button class="lnk" data-sdel="${s.id}">Entfernen</button>` : ""}</header><div class="cells">
      <div class="field"><label>Name</label><input data-s="name" value="${esc(s.name)}" list="startNames"></div>
      <div class="fieldrow"><label>Beginnt vor</label><select class="inp" data-s="from">${opts(s.from)}</select></div>
      <div class="fieldrow"><label>Länge (m), Höhe (m ü. NN), Paddelschläge</label><input class="inp" data-s="len" type="number" value="${esc(s.len)}" placeholder="Länge" style="width:100px"><input class="inp" data-s="hoehe" type="number" value="${esc(s.hoehe)}" placeholder="Höhe" style="width:100px"><input class="inp" data-s="paddel" type="number" value="${esc(s.paddel)}" placeholder="Paddeln" style="width:100px"></div>
      <div class="field"><label>Start-Notiz</label><textarea data-s="note" rows="1" placeholder="Griffe, Abstoß, Paddeln, Liegen nach dem Start">${esc(s.note)}</textarea></div>
      <div class="fieldrow"><label>Zwischenzeit gemessen nach Kurve</label><div class="chips" data-szz="${s.id}">${t.curves.filter(x => x.n >= +s.from).map(x => `<button data-v="${x.n}" class="${(s.zz || []).includes(x.n) ? "on" : ""}">${x.n}</button>`).join("")}</div></div>
    </div></section>`;
  });
  h += `<datalist id="startNames">${START_NAMES.map(n => `<option value="${n}">`).join("")}</datalist><div class="btns"><button class="btn p" data-a="sadd">Start hinzufügen</button></div>`;
  openSheet(h);
  document.querySelectorAll("#sheetPane textarea").forEach(grow);
}
function openTrackEdit() {
  const t = track(); if (!t) return;
  const sl = t.sled || {};
  const sf = (k, l, ph) => `<div class="field"><label>${l}</label><input data-sl="${k}" value="${esc(sl[k] || "")}" placeholder="${ph}"></div>`;
  openSheet(sheetHead("Bahn bearbeiten") + `
    <section class="grp"><div class="cells"><div class="field"><label>Name</label><input data-t="name" value="${esc(t.name)}"></div><div class="field"><label>Ort</label><input data-t="ort" value="${esc(t.ort)}"></div>
    <div class="field"><label>Land</label><input data-t="land" value="${esc(t.land)}"></div><div class="field"><label>Gesamtlänge (m)</label><input data-t="len" type="number" value="${t.len}"></div>
    <div class="field"><label>Notiz zur Bahn</label><textarea data-t="note" rows="2">${esc(t.note || "")}</textarea></div></div></section>
    <section class="grp"><div class="cells"><button class="row" data-a="starts"><span class="tx"><b>Starts</b><small>${esc(t.starts.map(s => s.name + " ab " + s.from).join(" · "))}</small></span><span class="chev">›</span></button></div></section>
    <section class="grp"><header><span>Schlitten-Setup für diese Bahn</span></header><div class="cells">
      ${sf("schlitten", "Schlitten", "z. B. Trainingsschlitten, Rennschlitten")}${sf("kufen", "Kufen", "Nummer / Typ")}${sf("stahl", "Schienen (Stahl)", "Nummer, Profil")}${sf("schliff", "Schliff / Kante", "z. B. scharf für hartes Eis")}
      ${sf("bogen", "Bogen / Vorspannung", "Einstellung")}${sf("sitz", "Sitzschale / Position", "weiter vorn / hinten")}${sf("gewicht", "Gewichtsweste (kg)", "kg")}${sf("anzug", "Anzug, Helm, Schuhe", "")}
      <div class="field"><label>Was hat hier funktioniert?</label><textarea data-sl="note" rows="1">${esc(sl.note || "")}</textarea></div></div>
      <p class="gfoot">Die Stahltemperatur wird im Wettkampf kontrolliert – Kufen nicht anwärmen.</p></section>
    <section class="grp"><header><span>Kurven (${t.curves.length})</span></header><div class="cells"><div class="fieldrow"><button class="btn" data-a="cadd">Kurve am Ende anfügen</button><button class="btn" data-a="cdel" ${t.curves.length > 1 ? "" : "disabled"}>Letzte Kurve entfernen</button></div></div></section>
    <section class="grp"><div class="cells"><button class="row" data-a="fields"><span class="tx"><b>Felder anpassen</b><small>Bereiche ein- und ausblenden, eigene Felder</small></span><span class="chev">›</span></button><button class="row" data-a="mapmenu"><span class="tx"><b>Plan-Bild</b><small>${t.map ? esc(t.map.title || "Eigenes Bild") : "noch keins"}</small></span><span class="chev">›</span></button></div></section>
    <section class="grp"><div class="cells"><div class="fieldrow"><button class="btn d" data-a="tdel">Bahn löschen</button></div></div></section>`);
  document.querySelectorAll("#sheetPane textarea").forEach(grow);
}
function openFields() {
  const t = track();
  let h = sheetHead("Felder anpassen") + `<section class="grp"><header><span>Plan</span></header><div class="cells"><label class="row tog"><span class="tx"><b>Plan-Bild zeigen</b><small>Aus: nur die Kurvenliste, ohne Bild</small></span><input type="checkbox" data-showmap="1"${S.showMap ? " checked" : ""}></label></div></section>
    <section class="grp"><header><span>Im Kurvenblatt zeigen</span></header><div class="cells">` +
    HIDEABLE.map(g => `<label class="row tog"><span class="tx"><b>${g}</b></span><input type="checkbox" data-hide="${g}"${S.hide[g] ? "" : " checked"}></label>`).join("") + `</div><p class="gfoot">Ausgeblendete Bereiche fehlen auch im Ausdruck. Notizen bleiben erhalten.</p></section>`;
  if (t) h += `<section class="grp"><header><span>Eigene Felder für ${esc(t.name)}</span></header><div class="cells">` +
    t.custom.map(cf => `<div class="fieldrow"><input class="inp" data-cf="${cf.id}" value="${esc(cf.label)}" style="flex:1"><button class="lnk" data-cfdel="${cf.id}">Entfernen</button></div>`).join("") +
    `<div class="fieldrow"><input class="inp" id="cfNew" placeholder="Neues Feld, z. B. Kufenstellung" style="flex:1"><button class="btn sm p" data-a="cfadd">Hinzufügen</button></div></div>
    <p class="gfoot">Eigene Felder gibt es in jeder Kurve dieser Bahn.</p></section>`;
  openSheet(h);
}

/* ---------- Bild-Upload, Hinweise ---------- */
async function readOwn(file) { return toPNG(file, 2200, file.type === "image/png" ? "image/png" : "image/jpeg"); }
function toast(m) { const e = $("toast"); e.textContent = m; e.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("on"), 2600); }
function copyVersion(x) { return { cue: x.cue, status: x.status, diff: x.diff, o: JSON.parse(JSON.stringify(x.o)), f: JSON.parse(JSON.stringify(x.f)), line: JSON.parse(JSON.stringify(x.line || [])) }; }

/* ---------- Ereignisse ---------- */
document.addEventListener("click", async e => {
  if (e.target.id === "sheet") return closeSheet();
  const b = e.target.closest("[data-a],[data-v],[data-open],[data-c],[data-place],[data-cat],[data-delrun],[data-wiki],[data-popt],[data-cfdel],[data-start],[data-run],[data-sdel]");
  if (!b) {
    const w = e.target.closest("#imgwrap");
    if (w && placing) {
      const r = w.getBoundingClientRect(), t = track(), x = t.curves.find(c => c.n === placing);
      x.x = +((e.clientX - r.left) / r.width * 100).toFixed(2); x.y = +((e.clientY - r.top) / r.height * 100).toFixed(2);
      const nx = placeOne ? null : t.curves.find(c => c.n > placing && c.x == null);
      const back = placeOne; placing = nx ? nx.n : null; placeOne = null; save(); renderPlan();
      if (back) openCurve(back);
    }
    return;
  }
  if (b.closest(".tabs") && b.dataset.v) return show(b.dataset.v);
  const t = track();
  // Auswahlfelder im Kurvenblatt (einfach oder mehrfach)
  if (b.dataset.v != null && b.closest("[data-o]")) {
    const x = curCurve(), box = b.closest("[data-o]"), k = box.dataset.o; if (!x) return;
    const tgt = SHARED.has(k) ? x.o : V(t, x).o;
    if (box.dataset.m) { const a = Array.isArray(tgt[k]) ? tgt[k] : []; tgt[k] = a.includes(b.dataset.v) ? a.filter(z => z !== b.dataset.v) : a.concat(b.dataset.v); b.classList.toggle("on", tgt[k].includes(b.dataset.v)); }
    else { tgt[k] = tgt[k] === b.dataset.v ? "" : b.dataset.v; box.querySelectorAll("button").forEach(z => z.classList.toggle("on", z === b && !!tgt[k])); }
    save(); return;
  }
  if (b.dataset.v != null && b.closest("[data-seg]")) { const x = curCurve(), k = b.closest("[data-seg]").dataset.seg; if (!x) return; const tgt = k === "dir" ? x : V(t, x); tgt[k] = k === "diff" ? +b.dataset.v : b.dataset.v; save(); b.parentNode.querySelectorAll("button").forEach(z => z.classList.toggle("on", z === b)); return; }
  if (b.dataset.v != null && b.closest("[data-rs]")) { const f = $("runForm"), st = JSON.parse(f.dataset.state), k = b.closest("[data-rs]").dataset.rs; st[k] = st[k] === b.dataset.v ? "" : b.dataset.v; f.dataset.state = JSON.stringify(st); b.parentNode.querySelectorAll("button").forEach(z => z.classList.toggle("on", z === b && !!st[k])); return; }
  if (b.dataset.v != null && b.closest("[data-rc]")) { const f = $("runForm"), st = JSON.parse(f.dataset.state), n = +b.dataset.v; st.curves = st.curves.includes(n) ? st.curves.filter(z => z !== n) : st.curves.concat(n).sort((p, q) => p - q); f.dataset.state = JSON.stringify(st); b.classList.toggle("on"); return; }
  if (b.dataset.v != null && b.closest("[data-szz]")) { const s = t.starts.find(z => z.id === b.closest("[data-szz]").dataset.szz), n = +b.dataset.v; s.zz = (s.zz || []).includes(n) ? s.zz.filter(z => z !== n) : (s.zz || []).concat(n).sort((p, q) => p - q); b.classList.toggle("on"); save(); return; }
  if (b.closest("#runRate")) { b.parentNode.querySelectorAll("button").forEach(z => z.classList.toggle("on", z === b)); return; }
  if (b.dataset.start) { t.curStart = b.dataset.start; save(); if (curN != null && $("sheet").classList.contains("on")) return openCurve(curN, true); return render(); }
  if (b.dataset.run) return openRun(b.dataset.run);
  if (b.dataset.sdel) { const s = t.starts.find(z => z.id === b.dataset.sdel); if (!confirm("„" + s.name + "“ entfernen? Eigene Fassungen der Kurven für diesen Start gehen verloren, Läufe bleiben.")) return; t.starts = t.starts.filter(z => z !== s); t.curves.forEach(x => delete x.v[s.id]); if (t.curStart === s.id) t.curStart = t.starts[0].id; save(); return openStarts(); }
  if (b.dataset.popt) { S.print[b.dataset.popt] = !S.print[b.dataset.popt]; save(); return renderBuch(); }
  if (b.dataset.cfdel) { if (!confirm("Feld in allen Kurven entfernen? Die Einträge darin gehen verloren.")) return; t.custom = t.custom.filter(c => c.id !== b.dataset.cfdel); t.curves.forEach(c => { delete c.f["c_" + b.dataset.cfdel]; Object.values(c.v).forEach(v => delete v.f["c_" + b.dataset.cfdel]); }); save(); return openFields(); }
  if (b.dataset.open) { S.cur = b.dataset.open; placing = null; save(); await loadMapImg(); return show("plan"); }
  if (b.dataset.cat) {
    const c = CATALOG.find(z => z.id === b.dataset.cat), nt = addTrack(c); placing = null;
    $("sheet").classList.remove("on"); await loadMapImg(); toast(c.name + " hinzugefügt" + (S.showMap ? " – Plan wird von Wikipedia geladen …" : "")); show("plan"); if (S.showMap) autoWiki(nt); return;
  }
  if (b.dataset.wiki != null) {
    const c = wikiList[+b.dataset.wiki]; if (!c || !t) return;
    b.classList.add("busy");
    try { await takeWiki(t, c); S.showMap = true; $("sheet").classList.remove("on", "wide"); if (!t.curves.some(x => x.x != null)) startPlacing(t); show("plan"); toast("Plan gespeichert" + (placing ? " – jetzt die Nummern antippen" : "")); }
    catch (err) { b.classList.remove("busy"); toast("Bild konnte nicht geladen werden"); }
    return;
  }
  if (b.dataset.place) { placing = +b.dataset.place; return renderPlan(); }
  if (b.dataset.delrun != null) { const x = curCurve(); x.runs.splice(+b.dataset.delrun, 1); save(); return openCurve(x.n, true); }
  if (b.dataset.c && !b.dataset.a) {
    if (placing && b.classList.contains("pin") && !$("sheet").classList.contains("on")) { placing = +b.dataset.c; return renderPlan(); }
    $("sheet").classList.remove("wide"); drawOn = false; return openCurve(+b.dataset.c);
  }
  const a = b.dataset.a;
  if (a === "add") return openPicker("");
  if (a === "close") return closeSheet();
  if (a === "custom") { const nm = $("cuName").value.trim(); if (!nm) { toast("Bitte einen Namen eingeben"); return; } const p = $("cuOrt").value.split(","); addTrack(null, { name: nm, ort: (p[0] || "").trim(), land: (p[1] || "").trim(), n: clamp(+$("cuN").value || 12, 1, 40), len: +$("cuLen").value || 1000 }); $("sheet").classList.remove("on"); await loadMapImg(); show("plan"); return S.showMap ? openWiki() : null; }
  if (a === "cprev" || a === "cnext") { const i = t.curves.findIndex(c => c.n === curN), nx = t.curves[i + (a === "cnext" ? 1 : -1)]; drawOn = false; if (nx) openCurve(nx.n); return; }
  if (a === "ownon") { const x = curCurve(); x.v[t.curStart] = copyVersion(x); save(); toast("Eigene Fassung für " + start(t).name + " angelegt"); return openCurve(x.n, true); }
  if (a === "ownoff") { const x = curCurve(); if (!confirm("Eigene Fassung für " + start(t).name + " löschen? Danach gilt wieder die gemeinsame Fassung.")) return; delete x.v[t.curStart]; save(); return openCurve(x.n, true); }
  if (a === "drawtoggle") { drawOn = !drawOn; return openCurve(curN, true); }
  if (a === "lineundo") { const vx = V(t, curCurve()); (vx.line || []).pop(); save(); return openCurve(curN, true); }
  if (a === "lineclear") { const vx = V(t, curCurve()); if ((vx.line || []).length && confirm("Gezeichnete Linie löschen?")) { vx.line = []; save(); } return openCurve(curN, true); }
  if (a === "zin" || a === "zout") { const x = curCurve(); x.zoom = clamp((x.zoom || .26) * (a === "zin" ? .75 : 1.33), .08, 1); save(); return openCurve(x.n, true); }
  if (a === "placeone") { const x = curCurve() || t.curves[0]; if (!t.map) return openWiki(); placeOne = x.n; placing = x.n; $("sheet").classList.remove("on"); curN = null; renderPlan(); scrollTo(0, 0); toast("Tippe im Plan auf die Stelle von Kurve " + x.n); return; }
  if (a === "placeall") { startPlacing(t); if (!placing) placing = t.curves[0].n; return renderPlan(); }
  if (a === "placeskip") { const nx = t.curves.find(c => c.n > placing && c.x == null) || t.curves.find(c => c.n > placing); placing = nx ? nx.n : null; return renderPlan(); }
  if (a === "placedone") { placing = null; placeOne = null; return renderPlan(); }
  if (a === "pinsreset") { if (!confirm("Alle Nummern im Plan löschen?")) return; t.curves.forEach(c => { c.x = c.y = null; }); save(); $("sheet").classList.remove("on"); startPlacing(t); return renderPlan(); }
  if (a === "mapdel") { if (!confirm("Plan-Bild entfernen? Die Nummern-Positionen bleiben gespeichert.")) return; await imgSet("map:" + t.id, null); t.map = null; save(); await loadMapImg(); return closeSheet(); }
  if (a === "nomap") { S.showMap = false; placing = null; save(); $("sheet").classList.remove("on", "wide"); toast("Plan-Bild ausgeblendet – unter „Felder anpassen“ wieder einschalten"); return render(); }
  if (a === "mapshow") { S.showMap = true; save(); return render(); }
  if (a === "savepng") { if (!mapURL) return; const l = document.createElement("a"); l.href = mapURL; l.download = "Bahnplan " + t.name + ".png"; document.body.appendChild(l); l.click(); l.remove(); return; }
  if (a === "mapmenu") return openMapMenu();
  if (a === "wiki") { $("sheet").classList.remove("wide"); return openWiki(); }
  if (a === "zoom") return openZoom();
  if (a === "zzin" || a === "zzout") { zoomZ = clamp(zoomZ * (a === "zzin" ? 1.4 : 1 / 1.4), 1, 6); return openZoom(); }
  if (a === "fields") return openFields();
  if (a === "starts") return openStarts();
  if (a === "sadd") { const used = t.starts.map(s => s.name), nm = START_NAMES.find(n => !used.includes(n)) || "Start " + (t.starts.length + 1); const s = { id: uid(), name: nm, from: t.curves[0].n, len: "", hoehe: "", paddel: "", note: "", zz: [] }; t.starts.push(s); save(); openStarts(); const el = document.querySelector(`[data-sid="${s.id}"]`); if (el) el.scrollIntoView({ block: "center" }); return; }
  if (a === "cfadd") { const v = $("cfNew").value.trim(); if (!v) return; t.custom.push({ id: uid(), label: v }); save(); return openFields(); }
  if (a === "addrun") { const x = curCurve(), txt = $("runText").value.trim(); if (!txt) { toast("Kurz notieren, was passiert ist"); return; } const on = document.querySelector("#runRate .on"); x.runs.unshift({ date: $("runDate").value || today(), rate: on ? on.dataset.v : "ok", text: txt, start: t.curStart }); save(); toast("Notiz gespeichert"); return openCurve(x.n, true); }
  if (a === "runnew") return openRun("");
  if (a === "rundel") { const id = $("runForm").dataset.id; if (!confirm("Lauf löschen?")) return; t.runs = t.runs.filter(r => r.id !== id); save(); return closeSheet(); }
  if (a === "viz") return openViz(-1);
  if (a === "vizclose") { $("viz").classList.remove("on"); return; }
  if (a === "vizprev") return openViz(vizI - 1);
  if (a === "viznext") { const n = t.curves.filter(x => driven(t, x)).length; if (vizI >= n - 1) { $("viz").classList.remove("on"); toast("Bahn im Kopf abgefahren ✓"); return; } return openViz(vizI + 1); }
  if (a === "trackedit") return openTrackEdit();
  if (a === "cadd") { t.curves.push(newCurve(t.curves.length + 1)); save(); return openTrackEdit(); }
  if (a === "cdel") { if (t.curves.length > 1 && confirm("Letzte Kurve (" + t.curves.length + ") mit allen Notizen entfernen?")) { t.curves.pop(); save(); } return openTrackEdit(); }
  if (a === "tdel") { if (confirm("„" + t.name + "“ mit allen Kurvennotizen und Läufen löschen?")) { await imgSet("map:" + t.id, null).catch(() => {}); S.tracks = S.tracks.filter(z => z !== t); S.cur = S.tracks[0] ? S.tracks[0].id : null; saveNow(); await loadMapImg(); $("sheet").classList.remove("on"); show("bahnen"); } return; }
  if (a === "img") return $("imgIn").click();
  if (a === "print") return print();
});
document.addEventListener("submit", e => {
  if (e.target.id !== "runForm") return;
  e.preventDefault();
  const f = e.target, t = track(), st = JSON.parse(f.dataset.state), fd = new FormData(f), g = k => (fd.get(k) || "").toString().trim();
  const s = t.starts.find(z => z.id === g("start")) || start(t);
  const r = Object.assign(t.runs.find(z => z.id === f.dataset.id) || { id: uid() }, {
    date: g("date") || today(), start: s.id, kind: st.kind, time: g("time"), startTime: g("startTime"), zz: (s.zz || []).map((n, i) => g("zz" + i)),
    place: g("place"), iceT: g("iceT"), airT: g("airT"), wetter: st.wetter, eis: st.eis, feel: st.feel, curves: st.curves, setup: g("setup"), note: g("note"), t: Date.now()
  });
  if (!t.runs.includes(r)) t.runs.push(r);
  t.curStart = s.id; save(); closeSheet(); show("laeufe"); toast("Lauf gespeichert");
});
document.addEventListener("input", e => {
  const el = e.target, t = track(), x = curCurve();
  if (el.dataset.f && x) { const k = el.dataset.f, tgt = SHARED.has("f:" + k) ? x.f : V(t, x).f; tgt[k] = el.value; if (el.tagName === "TEXTAREA") grow(el); save(); }
  else if (el.dataset.ok && x) { const k = el.dataset.ok, tgt = SHARED.has(k) ? x.o : V(t, x).o; tgt[k] = el.value === "" ? "" : +el.value; save(); }
  else if (el.dataset.k && x) {
    const k = el.dataset.k;
    if (k === "cue") V(t, x).cue = el.value;
    else { x[k] = k === "angle" ? (el.value ? +el.value : "") : el.value; if (k === "type" && TYPES[el.value] && !NOARC(el.value)) x.angle = TYPES[el.value]; }
    save(); if (k === "type") openCurve(x.n, true);
  } else if (el.dataset.t) { t[el.dataset.t] = el.dataset.t === "len" ? +el.value || t.len : el.value; if (el.tagName === "TEXTAREA") grow(el); save(); }
  else if (el.dataset.sl) { t.sled[el.dataset.sl] = el.value; if (el.tagName === "TEXTAREA") grow(el); save(); }
  else if (el.dataset.s) { const s = t.starts.find(z => z.id === el.closest("[data-sid]").dataset.sid); s[el.dataset.s] = el.dataset.s === "from" ? +el.value : el.value; if (el.tagName === "TEXTAREA") grow(el); save(); if (el.dataset.s === "from") openStarts(); }
  else if (el.dataset.cf) { const cf = t.custom.find(c => c.id === el.dataset.cf); if (cf) { cf.label = el.value; save(); } }
  else if (el.tagName === "TEXTAREA" && el.closest("#runForm")) grow(el);
});
document.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.hide) { S.hide[el.dataset.hide] = !el.checked; save(); }
  if (el.dataset.showmap) { S.showMap = el.checked; save(); }
});
document.addEventListener("toggle", e => { const d = e.target; if (d.dataset && d.dataset.fold) { S.closed[d.dataset.fold] = !d.open; save(); } }, true);
$("imgIn").addEventListener("change", async e => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  try {
    const t = track(), r = await readOwn(f);
    await setMap(t, r.blob, { src: "eigen", title: f.name, w: r.w, h: r.h }); S.showMap = true;
    $("sheet").classList.remove("on", "wide"); if (!t.curves.some(x => x.x != null)) startPlacing(t); show("plan"); toast("Bild gespeichert" + (placing ? " – jetzt die Nummern antippen" : ""));
  } catch (err) { toast("Bild konnte nicht gelesen werden"); }
});
document.addEventListener("keydown", e => {
  if ($("viz").classList.contains("on")) { if (e.key === "ArrowRight" || e.key === " ") $("viz").querySelector("[data-a=viznext]").click(); else if (e.key === "ArrowLeft") openViz(vizI - 1); else if (e.key === "Escape") $("viz").classList.remove("on"); }
  else if (e.key === "Escape" && $("sheet").classList.contains("on")) closeSheet();
});

/* ---------- Start ---------- */
(async function () {
  await loadMapImg();
  const h = location.hash.replace("#", "");
  show(["plan", "buch", "laeufe"].includes(h) ? h : S.tracks.length && S.cur ? "plan" : "bahnen");
})();
