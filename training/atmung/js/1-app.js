(function () {
"use strict";

/* =========================================================
   Basics
   ========================================================= */
var $ = function (id) { return document.getElementById(id); };
var pad = function (n) { return String(n).padStart(2, "0"); };
function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function parseYmd(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
function mondayOf(d) { var wd = (d.getDay() + 6) % 7; return addDays(d, -wd); }
function isoWeek(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); var day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); var y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 864e5 + 1) / 7); }
function fmtDay(s) { var p = s.split("-"); return +p[2] + "." + +p[1] + "."; }
function fmtDayY(s) { var p = s.split("-"); return +p[2] + "." + +p[1] + "." + p[0]; }
var WD = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
var WDS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
function wdIndex(s) { return (parseYmd(s).getDay() + 6) % 7; }
function de(n, d) { return Number(n).toFixed(d).replace(".", ","); }
function rateTxt(r) { return de(r, r % 1 ? 1 : 0); }
function numOrNull(v) { if (v === "" || v == null) return null; var n = Number(v); return isFinite(n) ? n : null; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function setStatus(id, msg, err) { var el = $(id); el.textContent = msg; el.className = "status" + (err ? " err" : ""); }

/* =========================================================
   Storage
   ========================================================= */
var LS = "pulsplan.v1";
function defaults() {
  return {
    settings: { start: null, rate: 6, morning: "07:00", evening: "21:30", remind: 10, vibrate: true,
      gh: { owner: "", repo: "", path: "atemtraining.ics", token: "" } },
    entries: [], sessions: [], morning: [], tests: [], weeks: [], checked: {}
  };
}
function fill(target, def) {
  Object.keys(def).forEach(function (k) {
    if (target[k] === undefined || target[k] === null && def[k] !== null) target[k] = def[k];
    else if (def[k] && typeof def[k] === "object" && !Array.isArray(def[k]) && typeof target[k] === "object") fill(target[k], def[k]);
  });
  return target;
}
function load() {
  try { var raw = localStorage.getItem(LS); if (raw) return fill(JSON.parse(raw), defaults()); } catch (e) {}
  return defaults();
}
var S = load();
var saveTimer = 0;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { setStatus("cfStatus", "Speichern im Browser fehlgeschlagen.", true); }
  }, 150);
}
function saveNow() { clearTimeout(saveTimer); try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} }
window.addEventListener("pagehide", saveNow);

/* =========================================================
   Plan model
   ========================================================= */
var TYPES = ["Langsames Atmen", "Biofeedback mit H10", "Resonanztest", "Zyklisches Seufzen", "PMR", "Autogenes Training", "Einschlaf-Routine", "Wettkampf-Routine", "Nach Belastung", "Morgenmessung"];
var PHASES = [
  { n: 1, name: "Atmen lernen", from: 1, to: 2,
    focus: "Zweimal täglich 5 Minuten im 4-6-Takt (6 Atemzüge pro Minute). Lege den H10 an, wann immer es passt, damit du die Pulswelle siehst. An 3 Morgen eine Morgenmessung als Ausgangswert.",
    items: [["p1a", "Training-App auf dem Handy installiert"], ["p1b", "H10 verbunden, Live-Puls sichtbar"], ["p1c", "3 Morgenmessungen als Ausgangswert"], ["p1d", "6 Atemzüge pro Minute fühlen sich mühelos an"]] },
  { n: 2, name: "Biofeedback", from: 3, to: 5,
    focus: "Zu Beginn der Phase den Resonanztest machen und deinen Takt übernehmen. Danach täglich 10 bis 20 Minuten mit H10 in deinem Takt. Ziel: eine große, gleichmäßige Pulswelle.",
    items: [["p2a", "Resonanztest gemacht"], ["p2b", "Meinen Takt in den Einstellungen übernommen"], ["p2c", "Pulswelle deutlich und gleichmäßig sichtbar"], ["p2d", "Woche 5: Resonanztest wiederholt"]] },
  { n: 3, name: "Vertiefen", from: 6, to: 9,
    focus: "Morgens 10 Minuten Biofeedback, abends PMR oder Autogenes Training. Am Ende jeder Einheit 2 Minuten „Ohne Taktgeber“: Kannst du die Pulswelle allein halten?",
    items: [["p3a", "PMR abends eingeführt"], ["p3b", "Autogenes Training mit Atmungs- und Herzformel geübt"], ["p3c", "Pulswelle ohne Taktgeber gehalten"]] },
  { n: 4, name: "Anwenden", from: 10, to: 12,
    focus: "Die Werkzeuge im echten Leben einsetzen: vor Gesprächen, beim Einschlafen, im Training. In Woche 12 Resonanztest wiederholen und mit Woche 1 vergleichen.",
    items: [["p4a", "Zyklisches Seufzen in einer echten Stresssituation genutzt"], ["p4b", "Einschlaf-Routine eine Woche lang durchgezogen"], ["p4c", "Wettkampf-Routine im Training getestet"], ["p4d", "Woche 12: Resonanztest wiederholt"], ["p4e", "Bilanz: Werte mit Woche 1 verglichen"]] }
];
function startDate() { return S.settings.start ? parseYmd(S.settings.start) : parseYmd(ymd(new Date())); }
function weekOf(date) { return Math.floor(Math.round((date - startDate()) / 864e5) / 7) + 1; }
function phaseOf(w) { for (var i = 0; i < PHASES.length; i++) if (w >= PHASES[i].from && w <= PHASES[i].to) return PHASES[i]; return null; }
function phaseLabel(w) { var p = phaseOf(w); if (w < 1) return "vor dem Start"; return p ? "Phase " + p.n + " · " + p.name : "Erhalt: täglich 10 Minuten"; }

/* =========================================================
   Navigation
   ========================================================= */
var views = ["today", "train", "week", "log", "plan"];
function go(v) {
  views.forEach(function (x) { $("v-" + x).hidden = x !== v; });
  document.querySelectorAll("nav.tabs button").forEach(function (b) { b.classList.toggle("on", b.dataset.go === v); });
  if (v === "today") renderToday();
  if (v === "week") renderWeek();
  if (v === "log") renderLog();
  if (v === "plan") renderPlan();
  if (v === "train") resizeCanvas();
  window.scrollTo(0, 0);
}
document.addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });

/* =========================================================
   Today
   ========================================================= */
function renderHeaderBits() {
  var w = weekOf(parseYmd(ymd(new Date())));
  $("phaseChip").textContent = phaseOf(w) ? "Phase " + phaseOf(w).n : (w > 12 ? "Erhalt" : "Start");
  $("weekText").textContent = (w >= 1 && w <= 12 ? "Woche " + w + " von 12 · " : "") + phaseLabel(w);
  var bar = $("weekbar"); bar.innerHTML = "";
  for (var i = 1; i <= 12; i++) { var s = document.createElement("span"); if (i < w) s.className = "done"; else if (i === w) s.className = "now"; bar.appendChild(s); }
  $("startHint").hidden = !!S.settings.start;
  var p = phaseOf(w);
  $("phaseFocus").textContent = p ? p.focus : "Halte das Gelernte mit dem täglichen 10-Minuten-Kern im eigenen Takt. Teste den Resonanztakt etwa einmal im Monat neu.";
}
function renderToday() {
  renderHeaderBits();
  var t = ymd(new Date());
  $("todayDate").textContent = WD[wdIndex(t)] + ", " + fmtDay(t);
  var list = S.entries.filter(function (e) { return e.date === t; }).sort(function (a, b) { return a.time < b.time ? -1 : 1; });
  var ul = $("todayList"); ul.innerHTML = "";
  $("todayEmpty").hidden = list.length > 0;
  list.forEach(function (e) {
    var li = document.createElement("li");
    li.innerHTML = '<div><div class="t">' + esc(e.type) + '</div></div><div class="r">' + esc(e.time) + " · " + e.dur + " min</div>" +
      (e.note ? '<div class="sub">' + esc(e.note) + "</div>" : "") +
      '<div class="acts"><button type="button" class="primary">Starten</button></div>';
    li.querySelector("button").addEventListener("click", function () { startFromEntry(e); });
    ul.appendChild(li);
  });
}
function startFromEntry(e) {
  go("train");
  if (e.type === "Resonanztest") { setMode("rf"); return; }
  if (e.type === "Morgenmessung") { setMode("morning"); return; }
  setMode("practice");
  pendingType = e.type;
  var d = [5, 10, 15, 20].indexOf(e.dur) >= 0 ? e.dur : 0;
  $("optDur").value = String(d);
}

/* =========================================================
   H10 / Web Bluetooth
   ========================================================= */
var H = { dev: null, char: null, hr: null, samples: [], lastRR: null, listeners: [] };
var hasBT = !!(navigator.bluetooth && navigator.bluetooth.requestDevice);
if (!hasBT) { $("btMissing").hidden = false; $("h10Btn").disabled = true; }

function parseHRM(dv) {
  var flags = dv.getUint8(0), i = 1, hr, rr = [];
  if (flags & 0x01) { hr = dv.getUint16(i, true); i += 2; } else { hr = dv.getUint8(i); i += 1; }
  if (flags & 0x08) i += 2;
  if (flags & 0x10) { for (; i + 1 < dv.byteLength; i += 2) rr.push(dv.getUint16(i, true) / 1024 * 1000); }
  return { hr: hr, rr: rr };
}
function onHRM(ev) {
  var m = parseHRM(ev.target.value), now = Date.now();
  H.hr = m.hr;
  $("h10Bpm").textContent = m.hr || "--";
  if (m.rr.length) {
    var tot = m.rr.reduce(function (a, b) { return a + b; }, 0), t = now - tot;
    m.rr.forEach(function (rr) {
      t += rr;
      var ok = rr >= 300 && rr <= 2000 && (H.lastRR == null || Math.abs(rr - H.lastRR) / H.lastRR <= 0.25);
      H.lastRR = rr;
      if (ok) H.samples.push({ t: Math.round(t), rr: rr, hr: 60000 / rr });
    });
  } else if (m.hr) {
    H.samples.push({ t: now, rr: null, hr: m.hr });
  }
  var cut = now - 20 * 60 * 1000;
  while (H.samples.length && H.samples[0].t < cut) H.samples.shift();
}
function setH10State(txt, ok) {
  $("h10State").textContent = txt; $("h10Dot").classList.toggle("ok", !!ok);
  $("h10Btn").textContent = ok ? "Trennen" : "Verbinden";
  if (!ok) $("h10Bpm").textContent = "--";
  updateMorningBtn();
}
async function connectH10() {
  try {
    setH10State("suche …", false);
    var dev = H.dev;
    if (!dev) {
      dev = await navigator.bluetooth.requestDevice({ filters: [{ services: ["heart_rate"] }], optionalServices: ["battery_service"] });
      H.dev = dev;
      dev.addEventListener("gattserverdisconnected", function () { H.char = null; setH10State("Verbindung getrennt", false); });
    }
    $("h10Name").textContent = dev.name || "Pulsgurt";
    var server = await dev.gatt.connect();
    var svc = await server.getPrimaryService("heart_rate");
    var ch = await svc.getCharacteristic("heart_rate_measurement");
    ch.addEventListener("characteristicvaluechanged", onHRM);
    await ch.startNotifications();
    H.char = ch; H.lastRR = null;
    var batt = "";
    try { var bs = await server.getPrimaryService("battery_service"); var bc = await bs.getCharacteristic("battery_level"); var v = await bc.readValue(); batt = " · Akku " + v.getUint8(0) + " %"; } catch (e) {}
    setH10State("verbunden" + batt, true);
  } catch (err) {
    if (err && err.name === "NotFoundError") setH10State("keine Auswahl getroffen", false);
    else setH10State("Verbindung fehlgeschlagen. Gurt anfeuchten, anlegen, andere Verbindungen trennen.", false);
  }
}
$("h10Btn").addEventListener("click", function () {
  if (H.char && H.dev && H.dev.gatt.connected) { H.dev.gatt.disconnect(); return; }
  connectH10();
});
function connected() { return !!(H.char && H.dev && H.dev.gatt.connected); }

/* metrics */
function since(t0, t1) { return H.samples.filter(function (s) { return s.t >= t0 && (!t1 || s.t <= t1); }); }
function avg(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; }
function avgHR(arr) { return avg(arr.map(function (s) { return s.hr; })); }
function rmssd(arr) {
  var rr = arr.filter(function (s) { return s.rr; }), d = [];
  for (var i = 1; i < rr.length; i++) d.push(Math.pow(rr[i].rr - rr[i - 1].rr, 2));
  return d.length >= 10 ? Math.sqrt(avg(d)) : null;
}
function waveByCycle(arr, t0, cycleMs, skipFirst) {
  var groups = {};
  arr.forEach(function (s) { var k = Math.floor((s.t - t0) / cycleMs); (groups[k] = groups[k] || []).push(s.hr); });
  var keys = Object.keys(groups).map(Number).sort(function (a, b) { return a - b; });
  if (skipFirst) keys = keys.slice(1);
  var last = keys[keys.length - 1];
  var amps = keys.filter(function (k) { return k !== last && groups[k].length >= 3; }).map(function (k) { return Math.max.apply(null, groups[k]) - Math.min.apply(null, groups[k]); });
  return amps.length ? avg(amps) : null;
}

/* =========================================================
   Pacer
   ========================================================= */
var RATES = [6.5, 6, 5.5, 5, 4.5];
var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function pacerState(rate, elapsedMs) {
  var c = 60000 / rate, inh = c * 0.4, pos = elapsedMs % c, inhale = pos < inh;
  var frac = inhale ? pos / inh : (pos - inh) / (c - inh);
  var ease = 0.5 - 0.5 * Math.cos(Math.PI * frac);
  return { inhale: inhale, frac: frac, scale: inhale ? 0.45 + 0.55 * ease : 1 - 0.55 * ease, left: (inhale ? inh - pos : c - pos) / 1000, cycle: Math.floor(elapsedMs / c) };
}
function drawOrb(orb, label, count, st) {
  if (!reduceMotion) orb.style.transform = "scale(" + st.scale.toFixed(3) + ")";
  label.textContent = st.inhale ? "Ein" : "Aus";
  count.textContent = de(Math.max(st.left, 0), 1) + " s";
}
var curRate = S.settings.rate || 6;
function renderRates() {
  var box = $("rates"); box.innerHTML = "";
  RATES.forEach(function (r) {
    var b = document.createElement("button"); b.type = "button";
    b.textContent = rateTxt(r) + (r === S.settings.rate ? " ★" : "");
    b.className = r === curRate ? "on" : ""; b.setAttribute("aria-pressed", String(r === curRate));
    b.addEventListener("click", function () { if (P.running) return; curRate = r; renderRates(); idleOrb(); });
    box.appendChild(b);
  });
  if (RATES.indexOf(S.settings.rate) < 0 && S.settings.rate) {
    var m = document.createElement("button"); m.type = "button"; m.textContent = rateTxt(S.settings.rate) + " ★";
    m.className = curRate === S.settings.rate ? "on" : "";
    m.addEventListener("click", function () { if (P.running) return; curRate = S.settings.rate; renderRates(); idleOrb(); });
    box.appendChild(m);
  }
}
function idleOrb() {
  var c = 60 / curRate;
  $("orbLabel").textContent = "Bereit";
  $("orbCount").innerHTML = de(c * 0.4, 1) + " s ein<br>" + de(c * 0.6, 1) + " s aus";
  $("orb").style.transform = "scale(0.62)";
}

/* wake lock + vibration */
var wakeLock = null;
async function lockScreen() { try { if (navigator.wakeLock) wakeLock = await navigator.wakeLock.request("screen"); } catch (e) {} }
function unlockScreen() { try { if (wakeLock) wakeLock.release(); } catch (e) {} wakeLock = null; }
function buzz(p) { if ($("optVibrate").checked && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } }
$("optVibrate").checked = !!S.settings.vibrate;
$("optVibrate").addEventListener("change", function () { S.settings.vibrate = this.checked; save(); });
$("optBlind").addEventListener("change", function () { $("m-practice").classList.toggle("blind", this.checked); });

/* live canvas */
var cv = $("liveCanvas"), ctx = cv.getContext("2d");
function resizeCanvas() { var r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; if (!r.width) return; cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); drawLive(); }
window.addEventListener("resize", resizeCanvas);
function drawLive() {
  var w = cv.clientWidth, h = cv.clientHeight; if (!w) return;
  ctx.clearRect(0, 0, w, h);
  var now = Date.now(), win = 60000, pts = H.samples.filter(function (s) { return s.t > now - win; });
  ctx.font = "11px " + css("--font-data");
  if (pts.length < 2) {
    ctx.fillStyle = css("--muted"); ctx.textAlign = "center";
    ctx.fillText(connected() ? "Warte auf Pulsdaten …" : "Live-Pulskurve: H10 verbinden", w / 2, h / 2 + 4);
    return;
  }
  var lo = Math.min.apply(null, pts.map(function (p) { return p.hr; })), hi = Math.max.apply(null, pts.map(function (p) { return p.hr; }));
  lo = Math.floor(lo / 5) * 5 - 5; hi = Math.ceil(hi / 5) * 5 + 5;
  var L = 30, R = 8, T = 8, B = 8;
  var X = function (t) { return L + (t - (now - win)) / win * (w - L - R); };
  var Y = function (v) { return T + (hi - v) / (hi - lo) * (h - T - B); };
  ctx.strokeStyle = css("--line"); ctx.lineWidth = 1; ctx.fillStyle = css("--muted"); ctx.textAlign = "right";
  var step = hi - lo > 40 ? 20 : 10;
  for (var v = Math.ceil(lo / step) * step; v <= hi; v += step) { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(w - R, Y(v)); ctx.stroke(); ctx.fillText(v, L - 5, Y(v) + 4); }
  ctx.strokeStyle = css("--pulse"); ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.beginPath();
  pts.forEach(function (p, i) { var x = X(p.t), y = Y(p.hr); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
  ctx.stroke();
}

/* =========================================================
   Practice session
   ========================================================= */
var P = { running: false, t0: 0, raf: 0, lastInhale: null, rate: 6 };
var pendingType = null;
var lastSession = null;
function practiceTick() {
  if (!P.running) return;
  var el = Date.now() - P.t0, st = pacerState(P.rate, el);
  drawOrb($("orb"), $("orbLabel"), $("orbCount"), st);
  if (P.lastInhale !== null && P.lastInhale !== st.inhale) buzz(st.inhale ? 80 : [40, 80, 40]);
  P.lastInhale = st.inhale;
  $("phaseBar").style.width = (st.frac * 100).toFixed(1) + "%";
  $("mTime").textContent = pad(Math.floor(el / 60000)) + ":" + pad(Math.floor(el / 1000) % 60);
  if (!P.metricTick || Date.now() - P.metricTick > 1000) {
    P.metricTick = Date.now();
    var last = since(Date.now() - 60000);
    var wv = waveByCycle(since(Math.max(P.t0, Date.now() - 60000)), P.t0, 60000 / P.rate, false);
    $("mWave").textContent = wv != null ? de(wv, 1) : "–";
    var rm = rmssd(last); $("mRmssd").textContent = rm != null ? Math.round(rm) : "–";
    drawLive();
    var target = +$("optDur").value;
    if (target && el >= target * 60000) { buzz([200, 100, 200]); stopPractice(); return; }
  }
  P.raf = requestAnimationFrame(practiceTick);
}
function startPractice() {
  P.running = true; P.t0 = Date.now(); P.rate = curRate; P.lastInhale = null; P.metricTick = 0;
  $("practiceBtn").textContent = "Beenden"; $("summary").hidden = true;
  document.querySelectorAll("#rates button").forEach(function (b) { b.disabled = true; });
  lockScreen(); buzz(80);
  P.raf = requestAnimationFrame(practiceTick);
}
function stopPractice() {
  P.running = false; cancelAnimationFrame(P.raf); unlockScreen();
  $("practiceBtn").textContent = "Start";
  document.querySelectorAll("#rates button").forEach(function (b) { b.disabled = false; });
  $("phaseBar").style.width = "0"; idleOrb();
  var t1 = Date.now(), dur = t1 - P.t0;
  if (dur < 30000) return;
  var all = since(P.t0, t1);
  var first = since(P.t0, P.t0 + 30000), lastS = since(t1 - 30000, t1);
  lastSession = {
    start: P.t0, durMin: Math.max(1, Math.round(dur / 60000)), rate: P.rate,
    hr0: avgHR(first), hr1: avgHR(lastS), hrAvg: avgHR(all),
    rm0: rmssd(since(P.t0, P.t0 + 60000)), rm1: rmssd(since(t1 - 60000, t1)),
    wave: waveByCycle(all, P.t0, 60000 / P.rate, true), blind: $("optBlind").checked
  };
  openSummary();
}
$("practiceBtn").addEventListener("click", function () { if (P.running) stopPractice(); else startPractice(); });

function fillTypeSelect(sel, val) {
  sel.innerHTML = TYPES.map(function (t) { return "<option" + (t === val ? " selected" : "") + ">" + esc(t) + "</option>"; }).join("");
}
function openSummary() {
  var s = lastSession;
  var m = [];
  m.push(['<b class="num">' + s.durMin + '</b><span>Minuten</span>']);
  m.push(['<b class="num">' + (s.wave != null ? de(s.wave, 1) : "–") + '</b><span>Ø Pulswelle bpm</span>']);
  m.push(['<b class="num">' + (s.rm0 != null && s.rm1 != null ? Math.round(s.rm0) + "→" + Math.round(s.rm1) : "–") + '</b><span>RMSSD Anfang→Ende</span>']);
  $("sumMetrics").innerHTML = m.map(function (x) { return '<div class="metric">' + x[0] + "</div>"; }).join("");
  var type = pendingType || (connected() ? "Biofeedback mit H10" : "Langsames Atmen");
  fillTypeSelect($("sType"), type);
  $("sMin").value = s.durMin;
  $("sHr0").value = s.hr0 != null ? Math.round(s.hr0) : "";
  $("sHr1").value = s.hr1 != null ? Math.round(s.hr1) : "";
  $("sT0").value = ""; $("sT1").value = ""; $("sNote").value = s.blind ? "Ohne Taktgeber" : "";
  $("summary").hidden = false;
  $("summary").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}
$("sumForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var s = lastSession || {};
  S.sessions.push({
    id: uid(), date: ymd(new Date(s.start || Date.now())), type: $("sType").value, minutes: numOrNull($("sMin").value),
    rate: s.rate || null, hrBefore: numOrNull($("sHr0").value), hrAfter: numOrNull($("sHr1").value),
    rmssd0: s.rm0 != null ? Math.round(s.rm0) : null, rmssd1: s.rm1 != null ? Math.round(s.rm1) : null,
    wave: s.wave != null ? Math.round(s.wave * 10) / 10 : null,
    tenseBefore: numOrNull($("sT0").value), tenseAfter: numOrNull($("sT1").value), note: $("sNote").value.trim()
  });
  save(); $("summary").hidden = true; lastSession = null; pendingType = null;
  go("log");
});
$("sDiscard").addEventListener("click", function () { $("summary").hidden = true; lastSession = null; pendingType = null; });

/* =========================================================
   Mode switch
   ========================================================= */
function setMode(m) {
  if (P.running || RF.running || MM.running) return;
  document.querySelectorAll("#modeSeg button").forEach(function (b) { b.classList.toggle("on", b.dataset.mode === m); });
  $("m-practice").hidden = m !== "practice"; $("m-rf").hidden = m !== "rf"; $("m-morning").hidden = m !== "morning";
  if (m !== "practice") $("summary").hidden = true;
  if (m === "practice") resizeCanvas();
}
$("modeSeg").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) setMode(b.dataset.mode); });

/* =========================================================
   Resonance test
   ========================================================= */
var RF = { running: false, t0: 0, raf: 0, blockMs: 120000, idx: -1, lastInhale: null };
function rfTick() {
  if (!RF.running) return;
  var el = Date.now() - RF.t0, idx = Math.floor(el / RF.blockMs);
  if (idx >= RATES.length) { finishRF(); return; }
  if (idx !== RF.idx) { RF.idx = idx; buzz([60, 60, 60]); }
  var rate = RATES[idx], st = pacerState(rate, el - idx * RF.blockMs);
  drawOrb($("orbRf"), $("orbRfLabel"), $("orbRfCount"), st);
  if (RF.lastInhale !== null && RF.lastInhale !== st.inhale) buzz(st.inhale ? 80 : [40, 80, 40]);
  RF.lastInhale = st.inhale;
  $("rfBar").style.width = (el / (RF.blockMs * RATES.length) * 100).toFixed(1) + "%";
  $("rfStep").textContent = "Block " + (idx + 1) + " von " + RATES.length + " · " + rateTxt(rate) + " Atemzüge/min";
  RF.raf = requestAnimationFrame(rfTick);
}
function startRF() {
  if (!connected()) { $("rfStep").textContent = "Bitte zuerst den H10 verbinden."; return; }
  RF.running = true; RF.t0 = Date.now(); RF.idx = -1; RF.lastInhale = null;
  $("rfBtn").textContent = "Abbrechen"; $("rfResult").hidden = true;
  lockScreen(); RF.raf = requestAnimationFrame(rfTick);
}
function stopRF(msg) {
  RF.running = false; cancelAnimationFrame(RF.raf); unlockScreen();
  $("rfBtn").textContent = "Test starten"; $("rfBar").style.width = "0";
  $("orbRf").style.transform = "scale(0.45)"; $("orbRfLabel").textContent = "Bereit"; $("orbRfCount").textContent = "";
  $("rfStep").textContent = msg || "Block – von 5";
}
function finishRF() {
  var res = RATES.map(function (r, i) {
    var b0 = RF.t0 + i * RF.blockMs, b1 = b0 + RF.blockMs, arr = since(b0, b1);
    return { rate: r, wave: waveByCycle(arr, b0, 60000 / r, true), rmssd: rmssd(arr) };
  });
  stopRF("Test abgeschlossen");
  buzz([200, 100, 200]);
  var valid = res.filter(function (x) { return x.wave != null; });
  if (valid.length < 3) { $("rfResult").hidden = false; $("rfResult").innerHTML = '<p class="notice">Zu wenige Pulsdaten. Sitzt der Gurt gut und war er die ganze Zeit verbunden?</p>'; return; }
  var best = valid.reduce(function (a, b) { return b.wave > a.wave ? b : a; });
  var max = best.wave;
  S.tests.push({ date: ymd(new Date()), best: best.rate, results: res.map(function (x) { return { rate: x.rate, wave: x.wave != null ? Math.round(x.wave * 10) / 10 : null }; }) });
  save();
  var html = "<h3>Dein Resonanztakt: " + rateTxt(best.rate) + " Atemzüge pro Minute</h3><div class=\"bars\">";
  res.forEach(function (x) {
    var pct = x.wave != null ? Math.max(4, x.wave / max * 100) : 0;
    html += '<div class="bar' + (x === best ? " best" : "") + '"><span>' + rateTxt(x.rate) + '/min</span><div class="track"><div class="fill" style="width:' + pct.toFixed(0) + '%"></div></div><span style="text-align:right">' + (x.wave != null ? de(x.wave, 1) : "–") + "</span></div>";
  });
  html += '</div><p class="small muted">Balken = Ø Pulswelle in bpm je Block. Liegen zwei Takte fast gleichauf, nimm den, der sich angenehmer anfühlt.</p>';
  html += '<button type="button" class="primary" id="rfApply">' + rateTxt(best.rate) + "/min als meinen Takt übernehmen</button>";
  $("rfResult").innerHTML = html; $("rfResult").hidden = false;
  $("rfApply").addEventListener("click", function () { S.settings.rate = best.rate; curRate = best.rate; save(); renderRates(); idleOrb(); this.textContent = "Übernommen"; this.disabled = true; });
}
$("rfBtn").addEventListener("click", function () { if (RF.running) stopRF("Abgebrochen"); else startRF(); });

/* =========================================================
   Morning measurement
   ========================================================= */
var MM = { running: false, t0: 0, timer: 0, dur: 120000 };
function updateMorningBtn() { if (!MM.running) $("mmBtn").disabled = !connected(); if (!connected() && !MM.running) setStatus("mmStatus", hasBT ? "H10 verbinden, um zu messen." : "Bluetooth nicht verfügbar.", true); else if (!MM.running) setStatus("mmStatus", ""); }
function mmTick() {
  var el = Date.now() - MM.t0, left = Math.max(0, MM.dur - el), arr = since(MM.t0);
  var secLeft = Math.ceil(left / 1000);
  $("mmTime").textContent = pad(Math.floor(secLeft / 60)) + ":" + pad(secLeft % 60);
  var a = avgHR(arr), r = rmssd(arr);
  $("mmHr").textContent = a != null ? Math.round(a) : "–"; $("mmRmssd").textContent = r != null ? Math.round(r) : "–"; $("mmBeats").textContent = arr.length;
  if (el >= MM.dur) {
    clearInterval(MM.timer); MM.running = false; unlockScreen(); buzz([200, 100, 200]);
    $("mmBtn").textContent = "Messung starten"; $("mmTime").textContent = "02:00";
    if (r == null || arr.length < 60) { setStatus("mmStatus", "Zu wenige saubere Schläge. Gurt anfeuchten und neu messen.", true); updateMorningBtn(); return; }
    S.morning.push({ date: ymd(new Date()), hr: Math.round(a), rmssd: Math.round(r), ln: Math.round(Math.log(r) * 100) / 100 });
    save(); setStatus("mmStatus", "Gespeichert: Ø " + Math.round(a) + " bpm, RMSSD " + Math.round(r) + " ms."); updateMorningBtn();
  }
}
$("mmBtn").addEventListener("click", function () {
  if (MM.running) { clearInterval(MM.timer); MM.running = false; unlockScreen(); $("mmBtn").textContent = "Messung starten"; $("mmTime").textContent = "02:00"; setStatus("mmStatus", "Abgebrochen.", true); return; }
  if (!connected()) return;
  MM.running = true; MM.t0 = Date.now(); $("mmBtn").textContent = "Abbrechen"; setStatus("mmStatus", "Ruhig liegen bleiben …");
  lockScreen(); MM.timer = setInterval(mmTick, 500);
});

/* =========================================================
   Week planning
   ========================================================= */
var wkMonday = mondayOf(addDays(new Date(), 7));
var editId = null;
function weekEntries() {
  var a = ymd(wkMonday), b = ymd(addDays(wkMonday, 6));
  return S.entries.filter(function (e) { return e.date >= a && e.date <= b; }).sort(function (x, y) { return (x.date + x.time) < (y.date + y.time) ? -1 : 1; });
}
function renderWeek() {
  var sun = addDays(wkMonday, 6);
  $("wkTitle").textContent = "KW " + isoWeek(wkMonday) + (ymd(mondayOf(new Date())) === ymd(wkMonday) ? " · diese Woche" : ymd(mondayOf(addDays(new Date(), 7))) === ymd(wkMonday) ? " · nächste Woche" : "");
  $("wkRange").textContent = fmtDay(ymd(wkMonday)) + " – " + fmtDayY(ymd(sun));
  var w = weekOf(wkMonday);
  $("wkPhase").textContent = (w >= 1 && w <= 12 ? "Planwoche " + w + ": " : "") + phaseLabel(w);
  $("tMorning").value = S.settings.morning; $("tEvening").value = S.settings.evening;
  var daySel = $("aDay"), cur = daySel.value; daySel.innerHTML = "";
  for (var i = 0; i < 7; i++) { var d = ymd(addDays(wkMonday, i)); var o = document.createElement("option"); o.value = d; o.textContent = WDS[i] + " " + fmtDay(d); daySel.appendChild(o); }
  if (cur && cur >= ymd(wkMonday) && cur <= ymd(sun)) daySel.value = cur;
  if (!$("aType").options.length) fillTypeSelect($("aType"), "Biofeedback mit H10");
  var list = weekEntries(), box = $("wkList"); box.innerHTML = "";
  $("wkEmpty").hidden = list.length > 0;
  var byDay = {};
  list.forEach(function (e) { (byDay[e.date] = byDay[e.date] || []).push(e); });
  Object.keys(byDay).sort().forEach(function (d) {
    var h = document.createElement("div"); h.className = "day-h"; h.innerHTML = WD[wdIndex(d)] + "<span>" + fmtDay(d) + "</span>"; box.appendChild(h);
    var ul = document.createElement("ul"); ul.className = "list";
    byDay[d].forEach(function (e) {
      var li = document.createElement("li");
      li.innerHTML = '<div><div class="t">' + esc(e.type) + '</div></div><div class="r">' + esc(e.time) + " · " + e.dur + " min</div>" +
        (e.note ? '<div class="sub">' + esc(e.note) + "</div>" : "") +
        '<div class="acts"><a class="btn" target="_blank" rel="noopener" title="In Google Kalender eintragen" href="' + esc(gcalLink(e)) + '">G</a><button type="button" data-a="edit">Ändern</button><button type="button" data-a="del">Löschen</button></div>';
      li.querySelector('[data-a="edit"]').addEventListener("click", function () { startEdit(e); });
      var del = li.querySelector('[data-a="del"]'), armed = false;
      del.addEventListener("click", function () {
        if (!armed) { armed = true; del.textContent = "Wirklich?"; del.classList.add("danger"); return; }
        S.entries = S.entries.filter(function (x) { return x.id !== e.id; }); save(); renderWeek();
      });
      ul.appendChild(li);
    });
    box.appendChild(ul);
  });
  $("icsShare").hidden = !canShareFiles();
  renderWeekOther();
}
/* Gemeinsamer Kalender: die übrigen Termine derselben Woche (Atmung selbst steht schon oben) */
function renderWeekOther() {
  var C = null; try { C = window.top.SharedCalendar || window.SharedCalendar; } catch (e) { C = window.SharedCalendar; }
  var panel = $("wkOtherPanel"); if (!panel) return;
  if (!C || !C.allItems) { panel.hidden = true; return; }
  var list = C.allItems(ymd(wkMonday), ymd(addDays(wkMonday, 6))).filter(function (e) { return e.app !== "Atmung"; });
  panel.hidden = !list.length;
  var box = $("wkOther"); box.innerHTML = "";
  var byDay = {};
  list.forEach(function (e) { (byDay[e.date] = byDay[e.date] || []).push(e); });
  Object.keys(byDay).sort().forEach(function (d) {
    var h = document.createElement("div"); h.className = "day-h"; h.innerHTML = WD[wdIndex(d)] + "<span>" + fmtDay(d) + "</span>"; box.appendChild(h);
    var ul = document.createElement("ul"); ul.className = "list";
    byDay[d].forEach(function (e) {
      var li = document.createElement("li");
      li.innerHTML = '<div><div class="t">' + esc(e.title) + '</div></div><div class="r">' + esc((e.time || "ganztägig") + (e.end ? "–" + e.end : "")) + " · " + esc(e.app) + "</div>";
      ul.appendChild(li);
    });
    box.appendChild(ul);
  });
}
addEventListener("storage", function (e) { if (e.key === "sg-shared-calendar-v1" || e.key === "schulkalender-bayern-v1") renderWeekOther(); if (e.key === "pulsplan.v1") { try { S = load(); renderWeek(); } catch (x) {} } });
$("wkPrev").addEventListener("click", function () { wkMonday = addDays(wkMonday, -7); cancelEdit(); renderWeek(); });
$("wkNext").addEventListener("click", function () { wkMonday = addDays(wkMonday, 7); cancelEdit(); renderWeek(); });
$("tMorning").addEventListener("change", function () { if (this.value) { S.settings.morning = this.value; save(); } });
$("tEvening").addEventListener("change", function () { if (this.value) { S.settings.evening = this.value; save(); } });

function suggestFor(monday) {
  var w = weekOf(monday), p = phaseOf(w), mo = S.settings.morning, ev = S.settings.evening, out = [];
  var rate = rateTxt(S.settings.rate || 6) + " Atemzüge/min";
  function add(i, time, type, dur, note) { out.push({ id: uid(), date: ymd(addDays(monday, i)), time: time, type: type, dur: dur, note: note || "" }); }
  for (var i = 0; i < 7; i++) {
    if (!p) { add(i, mo, "Biofeedback mit H10", 10, "Erhalt im eigenen Takt (" + rate + ")"); continue; }
    if (p.n === 1) {
      add(i, mo, "Langsames Atmen", 5, "4 s ein, 6 s aus" + (i < 3 && w === 1 ? ". Vorher 2 min Morgenmessung" : ""));
      add(i, ev, "Langsames Atmen", 5, "4 s ein, 6 s aus");
    } else if (p.n === 2) {
      if (i === 0 && (w === 3 || w === 5)) add(i, mo, "Resonanztest", 12, "Sitzend, H10 angelegt");
      else add(i, mo, "Biofeedback mit H10", w === 3 ? 10 : 15, "Im eigenen Takt (" + rate + "). Mo und Do vorher Morgenmessung");
    } else if (p.n === 3) {
      add(i, mo, "Biofeedback mit H10", 10, "Zum Schluss 2 min ohne Taktgeber");
      add(i, ev, i % 2 === 0 ? "PMR" : "Autogenes Training", 15, "");
    } else {
      if (i === 0 && w === 12) add(i, mo, "Resonanztest", 12, "Mit Woche 3 vergleichen");
      else add(i, mo, "Biofeedback mit H10", 10, "Im eigenen Takt (" + rate + ")");
      add(i, ev, "Einschlaf-Routine", 15, "Im Bett, langsam atmen oder PMR");
      if (i === 5) add(i, "10:00", "Wettkampf-Routine", 5, "Im Training testen: 2–3 min Resonanzatmen, dann normal");
    }
  }
  return out;
}
function insertSuggestion(replace) {
  if (replace) { var a = ymd(wkMonday), b = ymd(addDays(wkMonday, 6)); S.entries = S.entries.filter(function (e) { return e.date < a || e.date > b; }); }
  S.entries = S.entries.concat(suggestFor(wkMonday)); save(); $("wkConfirm").hidden = true; renderWeek();
}
$("wkSuggest").addEventListener("click", function () { if (weekEntries().length) $("wkConfirm").hidden = false; else insertSuggestion(false); });
$("wkConfirmYes").addEventListener("click", function () { insertSuggestion(true); });
$("wkConfirmNo").addEventListener("click", function () { $("wkConfirm").hidden = true; });

function startEdit(e) {
  editId = e.id; $("aDay").value = e.date; $("aTime").value = e.time; fillTypeSelect($("aType"), e.type); $("aDur").value = e.dur; $("aNote").value = e.note || "";
  $("addTitle").textContent = "Termin ändern"; $("addBtn").textContent = "Änderung speichern"; $("addCancel").hidden = false;
  $("addForm").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
}
function cancelEdit() { editId = null; $("addTitle").textContent = "Termin hinzufügen"; $("addBtn").textContent = "Hinzufügen"; $("addCancel").hidden = true; $("aNote").value = ""; }
$("addCancel").addEventListener("click", cancelEdit);
$("addForm").addEventListener("submit", function (ev) {
  ev.preventDefault();
  var rec = { date: $("aDay").value, time: $("aTime").value || "07:00", type: $("aType").value, dur: Math.max(2, numOrNull($("aDur").value) || 10), note: $("aNote").value.trim() };
  if (editId) { var x = S.entries.filter(function (e) { return e.id === editId; })[0]; if (x) Object.assign(x, rec); }
  else { rec.id = uid(); S.entries.push(rec); }
  save(); cancelEdit(); renderWeek();
});

/* ---------- Calendar export ---------- */
function startOf(e) { var p = e.date.split("-"), t = e.time.split(":"); return new Date(+p[0], +p[1] - 1, +p[2], +t[0], +t[1]); }
function utcStamp(d) { return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z"; }
function icsText(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
function fold(line) {
  var out = [], cur = "", bytes = 0, enc = new TextEncoder();
  for (var ch of line) {
    var b = enc.encode(ch).length;
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ""; bytes = 0; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out.join("\r\n ");
}
function describe(e) {
  var d = e.note ? e.note + "\n" : "";
  if (e.type === "Biofeedback mit H10" || e.type === "Langsames Atmen") d += "Takt: " + rateTxt(S.settings.rate || 6) + " Atemzüge/min. Training-App → Atmung öffnen, H10 verbinden.";
  else if (e.type === "Resonanztest") d += "Training → Atmung → Üben → Resonanztest. 10 min sitzend mit H10.";
  else if (e.type === "PMR") d += "Progressive Muskelentspannung, 15 min.";
  else if (e.type === "Autogenes Training") d += "Formeln: Atmung ruhig. Herz schlägt ruhig.";
  else if (e.type === "Einschlaf-Routine") d += "Im Bett 15 min langsam atmen oder PMR.";
  return d.trim();
}
function buildICS(entries, name) {
  var now = utcStamp(new Date()), L = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Pulsplan//Atemtraining//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:" + icsText(name || "Atemtraining"), "X-WR-TIMEZONE:Europe/Berlin"];
  entries.forEach(function (e) {
    var s = startOf(e), en = new Date(s.getTime() + e.dur * 60000);
    L.push("BEGIN:VEVENT", "UID:" + e.id + "@pulsplan", "DTSTAMP:" + now, "DTSTART:" + utcStamp(s), "DTEND:" + utcStamp(en),
      "SUMMARY:" + icsText(e.type + " (" + e.dur + " min)"), "DESCRIPTION:" + icsText(describe(e)), "CATEGORIES:Atemtraining");
    if (S.settings.remind > 0) L.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsText(e.type), "TRIGGER:-PT" + Math.round(S.settings.remind) + "M", "END:VALARM");
    L.push("END:VEVENT");
  });
  L.push("END:VCALENDAR");
  return L.map(fold).join("\r\n") + "\r\n";
}
function gcalLink(e) {
  var s = startOf(e), en = new Date(s.getTime() + e.dur * 60000);
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(e.type + " (" + e.dur + " min)") +
    "&dates=" + utcStamp(s) + "/" + utcStamp(en) + "&details=" + encodeURIComponent(describe(e)) + "&ctz=Europe/Berlin";
}
function weekFileName() { return "atemtraining-kw" + pad(isoWeek(wkMonday)) + "-" + wkMonday.getFullYear() + ".ics"; }
function downloadBlob(blob, name) {
  var url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
}
function canShareFiles() { try { return !!(navigator.canShare && navigator.canShare({ files: [new File(["x"], "t.ics", { type: "text/calendar" })] })); } catch (e) { return false; } }
$("icsDownload").addEventListener("click", function () {
  var list = weekEntries(); if (!list.length) { setStatus("ghStatus", "Diese Woche hat noch keine Termine.", true); return; }
  downloadBlob(new Blob([buildICS(list, "Atemtraining KW " + isoWeek(wkMonday))], { type: "text/calendar;charset=utf-8" }), weekFileName());
  setStatus("ghStatus", "Datei gespeichert: " + weekFileName());
});
$("icsShare").addEventListener("click", function () {
  var list = weekEntries(); if (!list.length) { setStatus("ghStatus", "Diese Woche hat noch keine Termine.", true); return; }
  var f = new File([buildICS(list, "Atemtraining KW " + isoWeek(wkMonday))], weekFileName(), { type: "text/calendar" });
  navigator.share({ files: [f], title: "Atemtraining KW " + isoWeek(wkMonday) }).catch(function () {});
});

/* ---------- GitHub subscription ---------- */
function ghCfg() { return S.settings.gh; }
function ghPagesUrl() {
  var g = ghCfg(); if (!g.owner || !g.repo || !g.path) return "";
  var base = g.repo.toLowerCase() === (g.owner + ".github.io").toLowerCase() ? "https://" + g.owner.toLowerCase() + ".github.io/" : "https://" + g.owner.toLowerCase() + ".github.io/" + g.repo + "/";
  return base + g.path.replace(/^\/+/, "");
}
function b64utf8(str) { var bytes = new TextEncoder().encode(str), bin = ""; for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(bin); }
async function publishGH() {
  var g = ghCfg();
  if (!g.owner || !g.repo || !g.path || !g.token) { setStatus("ghStatus", "Erst unter Plan → Einstellungen GitHub-Name, Repository und Token eintragen.", true); return; }
  var from = ymd(addDays(new Date(), -28));
  var list = S.entries.filter(function (e) { return e.date >= from; }).sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; });
  if (!list.length) { setStatus("ghStatus", "Es gibt noch keine Termine zum Veröffentlichen.", true); return; }
  var api = "https://api.github.com/repos/" + encodeURIComponent(g.owner) + "/" + encodeURIComponent(g.repo) + "/contents/" + g.path.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
  var headers = { "Authorization": "Bearer " + g.token, "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  $("ghPublish").disabled = true; setStatus("ghStatus", "Wird hochgeladen …");
  try {
    var sha = null, r = await fetch(api, { headers: headers, cache: "no-store" });
    if (r.status === 200) sha = (await r.json()).sha;
    else if (r.status === 401) throw new Error("Token ungültig oder abgelaufen.");
    else if (r.status !== 404) throw new Error("GitHub antwortet mit Fehler " + r.status + ".");
    var body = { message: "Atemtraining-Kalender aktualisiert", content: b64utf8(buildICS(list, "Atemtraining")) };
    if (sha) body.sha = sha;
    var p = await fetch(api, { method: "PUT", headers: headers, body: JSON.stringify(body) });
    if (p.status === 401 || p.status === 403) throw new Error("Keine Schreibrechte. Token braucht „Contents: Read and write“ für dieses Repo.");
    if (p.status === 404) throw new Error("Repository nicht gefunden. Name und Repo prüfen.");
    if (!p.ok) throw new Error("Hochladen fehlgeschlagen (Fehler " + p.status + ").");
    setStatus("ghStatus", list.length + " Termine veröffentlicht. Google übernimmt sie beim nächsten Abgleich.");
  } catch (err) {
    setStatus("ghStatus", (err && err.message) || "Keine Verbindung zu GitHub.", true);
  }
  $("ghPublish").disabled = false;
}
$("ghPublish").addEventListener("click", publishGH);

/* =========================================================
   Log
   ========================================================= */
function renderLog() {
  var list = S.sessions.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  var mon = ymd(mondayOf(new Date()));
  $("stWeek").textContent = S.sessions.filter(function (s) { return s.date >= mon; }).length;
  var drops = S.sessions.filter(function (s) { return s.hrBefore != null && s.hrAfter != null; }).map(function (s) { return s.hrBefore - s.hrAfter; });
  $("stDrop").textContent = drops.length ? de(avg(drops), 1) : "–";
  var tens = S.sessions.filter(function (s) { return s.tenseBefore != null && s.tenseAfter != null; }).map(function (s) { return s.tenseBefore - s.tenseAfter; });
  $("stTense").textContent = tens.length ? de(avg(tens), 1) : "–";
  renderSessChart(list); renderMornChart();
  var ul = $("sessList"); ul.innerHTML = ""; $("sessEmpty").hidden = list.length > 0;
  list.slice(0, 40).forEach(function (s) {
    var li = document.createElement("li"), bits = [fmtDayY(s.date)];
    if (s.minutes) bits.push(s.minutes + " min");
    if (s.rate) bits.push(rateTxt(s.rate) + "/min");
    if (s.wave != null) bits.push("Welle " + de(s.wave, 1));
    if (s.rmssd0 != null && s.rmssd1 != null) bits.push("RMSSD " + s.rmssd0 + "→" + s.rmssd1);
    if (s.tenseBefore != null && s.tenseAfter != null) bits.push("Anspannung " + s.tenseBefore + "→" + s.tenseAfter);
    var hr = "–", diff = "";
    if (s.hrBefore != null && s.hrAfter != null) { hr = s.hrBefore + "→" + s.hrAfter; var d = s.hrBefore - s.hrAfter; diff = '<div class="' + (d > 0 ? "drop" : "muted") + '">' + (d > 0 ? "−" : d < 0 ? "+" : "±") + Math.abs(d) + " bpm</div>"; }
    li.innerHTML = '<div><div class="t">' + esc(s.type) + '</div><div class="small muted">' + esc(bits.join(" · ")) + '</div></div><div class="r">' + hr + diff + "</div>" +
      (s.note ? '<div class="sub">' + esc(s.note) + "</div>" : "") + '<div class="acts"><button type="button" class="link-btn">Löschen</button></div>';
    var del = li.querySelector("button"), armed = false;
    del.addEventListener("click", function () {
      if (!armed) { armed = true; del.textContent = "Wirklich löschen?"; del.className = "danger"; return; }
      S.sessions = S.sessions.filter(function (x) { return x.id !== s.id; }); save(); renderLog();
    });
    ul.appendChild(li);
  });
  renderWeeksTable();
  if (!$("wNum").value) $("wNum").value = Math.max(1, weekOf(parseYmd(ymd(new Date()))));
}
function axisText(x, y, t, anchor) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '" font-size="11" fill="var(--muted)" font-family="JetBrains Mono, monospace">' + t + "</text>"; }
function renderSessChart(sorted) {
  var rows = sorted.filter(function (s) { return s.hrBefore != null && s.hrAfter != null; }).slice(0, 14).reverse();
  $("chartSessWrap").hidden = rows.length < 2; if (rows.length < 2) return;
  var W = 600, Hh = 210, L = 38, R = 12, T = 12, B = 30, vals = [];
  rows.forEach(function (r) { vals.push(r.hrBefore, r.hrAfter); });
  var lo = Math.floor((Math.min.apply(null, vals) - 3) / 10) * 10, hi = Math.ceil((Math.max.apply(null, vals) + 3) / 10) * 10; if (hi - lo < 20) hi = lo + 20;
  var y = function (v) { return T + (hi - v) / (hi - lo) * (Hh - T - B); }, step = (W - L - R) / rows.length, x = function (i) { return L + step * (i + 0.5); };
  var svg = '<svg viewBox="0 0 ' + W + " " + Hh + '" role="img" aria-label="Puls am Anfang und Ende der letzten Einheiten">';
  for (var t = lo; t <= hi; t += (hi - lo > 60 ? 20 : 10)) svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t) + '" y2="' + y(t) + '" stroke="var(--line)"/>' + axisText(L - 6, y(t) + 4, t, "end");
  rows.forEach(function (r, i) {
    var cx = x(i).toFixed(1);
    svg += '<line x1="' + cx + '" x2="' + cx + '" y1="' + y(r.hrBefore) + '" y2="' + y(r.hrAfter) + '" stroke="var(--muted)" stroke-width="2" stroke-opacity="0.45"/>';
    svg += '<circle cx="' + cx + '" cy="' + y(r.hrBefore) + '" r="5" fill="var(--pulse)"/><circle cx="' + cx + '" cy="' + y(r.hrAfter) + '" r="5" fill="var(--breath)"/>';
    if (rows.length <= 8 || i % 2 === 0 || i === rows.length - 1) svg += axisText(cx, Hh - 10, fmtDay(r.date));
  });
  $("chartSess").innerHTML = svg + "</svg>";
}
function renderMornChart() {
  var rows = S.morning.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(-30);
  $("mornEmpty").hidden = rows.length >= 3; $("chartMornWrap").hidden = rows.length < 3; if (rows.length < 3) return;
  var W = 600, Hh = 210, L = 38, R = 38, T = 12, B = 30;
  var rm = rows.map(function (r) { return r.rmssd; }), hr = rows.map(function (r) { return r.hr; });
  var rlo = Math.floor(Math.min.apply(null, rm) / 10) * 10, rhi = Math.ceil(Math.max.apply(null, rm) / 10) * 10; if (rhi - rlo < 20) rhi = rlo + 20;
  var hlo = Math.floor(Math.min.apply(null, hr) / 5) * 5 - 5, hhi = Math.ceil(Math.max.apply(null, hr) / 5) * 5 + 5;
  var x = function (i) { return L + (rows.length === 1 ? 0 : i / (rows.length - 1)) * (W - L - R); };
  var yr = function (v) { return T + (rhi - v) / (rhi - rlo) * (Hh - T - B); }, yh = function (v) { return T + (hhi - v) / (hhi - hlo) * (Hh - T - B); };
  var svg = '<svg viewBox="0 0 ' + W + " " + Hh + '" role="img" aria-label="Morgenmessung: RMSSD und Ruhepuls">';
  [0, 0.5, 1].forEach(function (f) {
    var yy = T + f * (Hh - T - B);
    svg += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '" stroke="var(--line)"/>';
    svg += axisText(L - 6, yy + 4, Math.round(rhi - f * (rhi - rlo)), "end") + axisText(W - R + 6, yy + 4, Math.round(hhi - f * (hhi - hlo)), "start");
  });
  var pr = rows.map(function (r, i) { return x(i).toFixed(1) + "," + yr(r.rmssd).toFixed(1); }).join(" ");
  var ph = rows.map(function (r, i) { return x(i).toFixed(1) + "," + yh(r.hr).toFixed(1); }).join(" ");
  svg += '<polyline points="' + ph + '" fill="none" stroke="var(--pulse)" stroke-width="1.5" stroke-opacity="0.7"/>';
  svg += '<polyline points="' + pr + '" fill="none" stroke="var(--good)" stroke-width="2.5"/>';
  var li = rows.length - 1; svg += '<circle cx="' + x(li) + '" cy="' + yr(rows[li].rmssd) + '" r="4.5" fill="var(--good)"/>';
  svg += axisText(x(0), Hh - 10, fmtDay(rows[0].date), "start") + axisText(x(li), Hh - 10, fmtDay(rows[li].date), "end");
  $("chartMorn").innerHTML = svg + "</svg>";
}
$("weekForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var n = numOrNull($("wNum").value) || 1;
  S.weeks = S.weeks.filter(function (w) { return w.week !== n; });
  S.weeks.push({ week: n, sleep: numOrNull($("wSleep").value), stress: numOrNull($("wStress").value), hrv: $("wHrv").value || null });
  save(); setStatus("wStatus", "Woche " + n + " gespeichert."); renderWeeksTable();
});
function renderWeeksTable() {
  var rows = S.weeks.slice().sort(function (a, b) { return b.week - a.week; });
  $("weeksWrap").hidden = !rows.length; var body = $("weeksBody"); body.innerHTML = "";
  rows.forEach(function (r) {
    var tr = document.createElement("tr");
    tr.innerHTML = "<td>Woche " + r.week + '</td><td class="n">' + (r.sleep != null ? r.sleep + "/10" : "–") + '</td><td class="n">' + (r.stress != null ? r.stress + "/10" : "–") + "</td><td>" + esc(r.hrv || "–") + "</td>";
    body.appendChild(tr);
  });
}

/* =========================================================
   Plan + settings
   ========================================================= */
function renderPlan() {
  var box = $("phases"); box.innerHTML = "<h2>12 Wochen in 4 Phasen</h2>";
  var w = weekOf(parseYmd(ymd(new Date()))), total = 0, done = 0;
  PHASES.forEach(function (ph) {
    var div = document.createElement("div"); div.className = "phase" + (w >= ph.from && w <= ph.to ? " current" : "");
    div.innerHTML = "<h3><span>Phase " + ph.n + " · " + ph.name + "</span><small>Woche " + ph.from + "–" + ph.to + "</small></h3><p>" + esc(ph.focus) + "</p>";
    ph.items.forEach(function (it) {
      total++; if (S.checked[it[0]]) done++;
      var lab = document.createElement("label"); lab.className = "check";
      lab.innerHTML = '<input type="checkbox" id="chk-' + it[0] + '"' + (S.checked[it[0]] ? " checked" : "") + "><span>" + esc(it[1]) + "</span>";
      lab.querySelector("input").addEventListener("change", function () { if (this.checked) S.checked[it[0]] = true; else delete S.checked[it[0]]; save(); countPlan(); });
      div.appendChild(lab);
    });
    box.appendChild(div);
  });
  $("planCount").textContent = done + " / " + total;
  $("cfStart").value = S.settings.start || ""; $("cfRate").value = S.settings.rate; $("cfRemind").value = S.settings.remind;
  var g = S.settings.gh; $("ghOwner").value = g.owner; $("ghRepo").value = g.repo; $("ghPath").value = g.path; $("ghToken").value = g.token;
  $("ghUrl").value = ghPagesUrl();
}
function countPlan() { var t = 0, d = 0; PHASES.forEach(function (p) { p.items.forEach(function (it) { t++; if (S.checked[it[0]]) d++; }); }); $("planCount").textContent = d + " / " + t; }
$("cfStart").addEventListener("change", function () { S.settings.start = this.value || null; save(); renderHeaderBits(); renderPlan(); setStatus("cfStatus", "Startdatum gespeichert."); });
$("cfRate").addEventListener("change", function () { var v = numOrNull(this.value); if (v && v >= 3 && v <= 10) { S.settings.rate = v; curRate = v; save(); renderRates(); idleOrb(); setStatus("cfStatus", "Takt gespeichert."); } });
$("cfRemind").addEventListener("change", function () { var v = numOrNull(this.value); S.settings.remind = v == null ? 0 : Math.max(0, Math.min(120, v)); save(); });
["ghOwner", "ghRepo", "ghPath", "ghToken"].forEach(function (id) {
  $(id).addEventListener("change", function () {
    var key = { ghOwner: "owner", ghRepo: "repo", ghPath: "path", ghToken: "token" }[id];
    S.settings.gh[key] = this.value.trim(); if (key === "path" && !S.settings.gh.path) S.settings.gh.path = "atemtraining.ics";
    save(); $("ghUrl").value = ghPagesUrl();
  });
});
$("ghCopy").addEventListener("click", function () {
  var v = $("ghUrl").value; if (!v) { setStatus("cfStatus", "Erst GitHub-Name und Repository eintragen.", true); return; }
  (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(function () { setStatus("cfStatus", "Abo-Adresse kopiert."); })
    .catch(function () { $("ghUrl").select(); setStatus("cfStatus", "Adresse markiert, bitte manuell kopieren.", true); });
});
$("bkExport").addEventListener("click", function () {
  var copy = JSON.parse(JSON.stringify(S)); copy.settings.gh.token = "";
  downloadBlob(new Blob([JSON.stringify(copy, null, 1)], { type: "application/json" }), "pulsplan-sicherung-" + ymd(new Date()) + ".json");
  setStatus("cfStatus", "Sicherung gespeichert (ohne Token).");
});
$("bkImport").addEventListener("change", function () {
  var f = this.files && this.files[0]; if (!f) return;
  f.text().then(function (txt) {
    var d = JSON.parse(txt); if (!d || !d.settings || !Array.isArray(d.sessions)) throw new Error();
    var token = S.settings.gh.token; S = fill(d, defaults()); if (!S.settings.gh.token) S.settings.gh.token = token;
    saveNow(); curRate = S.settings.rate; renderRates(); idleOrb(); renderPlan(); renderHeaderBits(); setStatus("cfStatus", "Sicherung geladen.");
  }).catch(function () { setStatus("cfStatus", "Die Datei ist keine Sicherung des Atemtrainings.", true); });
  this.value = "";
});

/* Installation: manifest.json, Icons und sw.js liegen als eigene Dateien neben index.html. */

/* =========================================================
   Boot
   ========================================================= */
renderRates(); idleOrb(); renderHeaderBits(); renderToday(); updateMorningBtn();
document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && (P.running || RF.running || MM.running)) lockScreen(); });
window.__pulsplan = { H: H, parseHRM: parseHRM, buildICS: buildICS, waveByCycle: waveByCycle, rmssd: rmssd, suggestFor: suggestFor, S: function () { return S; } };
})();
