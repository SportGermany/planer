/* ============================================================
   UI – Screens, Player, Lauf-Tracking, Import
   ============================================================ */
(function(){
"use strict";
var W = window.WK;

/* ---------- Speicher (localStorage mit Rückfallebene) ---------- */
var mem = {}, storageOk = false;
try {
  window.localStorage.setItem("__t","1"); window.localStorage.removeItem("__t"); storageOk = true;
} catch(e){ storageOk = false; }
var store = {
  get: function(k, def){
    try{
      var raw = storageOk ? window.localStorage.getItem(k) : mem[k];
      return raw == null ? def : JSON.parse(raw);
    }catch(e){ return def; }
  },
  set: function(k, v){
    var raw = JSON.stringify(v);
    try{ if (storageOk) window.localStorage.setItem(k, raw); else mem[k] = raw; }
    catch(e){ mem[k] = raw; }
  },
  del: function(k){
    try{ if (storageOk) window.localStorage.removeItem(k); else delete mem[k]; }catch(e){ delete mem[k]; }
  }
};
var K = {set:"wk_settings", log:"wk_log", act:"wk_activities", run:"wk_runs"};

/* ---------- Zustand ---------- */
var S = {
  settings: W.normalizeSettings(store.get(K.set, {})),
  log: store.get(K.log, {}),
  activities: store.get(K.act, []),
  today: W.ymd(new Date()),
  calMonth: null,
  sheetDate: null,
  runKm: 5,
  screen: "heute",
  body: store.get("wk_body", {}),
  weekGoal: store.get("wk_weekgoal", 0),
  race: store.get("wk_race", ""),
  swaps: store.get("wk_swaps", {}),
  rests: store.get("wk_rests", {}),
  trainedOverride: store.get("wk_trainedoverride", {}),
  colors: store.get("wk_colors", {}),
  skin: store.get("wk_skin", "osv2"),
  sickDays: store.get("wk_sickdays", {}),
  illnessActive: store.get("wk_illness_active", false),
  injuryDays: store.get("wk_injurydays", {}),
  injuryActive: store.get("wk_injury_active", false),
  vacationDays: store.get("wk_vacation", {}),
  customExercises: store.get("wk_custom_ex", []),
  streakFreezes: store.get("wk_freezes", {frozenDays:{}, lastGrantMonth:null, available:1})
};
S.calMonth = new Date(W.parseYmd(S.today).getFullYear(), W.parseYmd(S.today).getMonth(), 1);
S.runKm = W.effectiveRunDistance(S.settings);
S.runCustomActive = S.settings.runDistanceCustom != null;
function saveSettings(){ store.set(K.set, S.settings); }
function applyGoal(goal, keepTuning){
  S.settings.goal = goal;
  if (!keepTuning){
    var pre = W.GOAL_PRESET[goal] || W.GOAL_PRESET.erhalt;
    for (var k in pre) S.settings[k] = pre[k];
  }
  S.settings = W.normalizeSettings(S.settings);
  S.swaps = {};
  store.set("wk_swaps", S.swaps);
  saveSettings();
  if (window.APP4 && window.APP4.applyAccentPerGoal) window.APP4.applyAccentPerGoal();
}
function setRunning(on){
  S.settings.running = !!on;
  saveSettings();
  applyRunningVisibility();
}
function applyRunningVisibility(){
  // Der Tab selbst bleibt immer sichtbar: er enthält neben dem Lauf auch
  // Dehnen/Mobility, das Rodeln-Programm und die Mehrsport-Erfassung, die
  // alle unabhängig vom Laufen-Schalter funktionieren müssen.
  document.documentElement.setAttribute("data-running", S.settings.running ? "on" : "off");
  var rb = document.getElementById("runBlocks");
  if (rb) rb.style.display = S.settings.running ? "" : "none";
}
function saveLog(){ store.set(K.log, S.log); }
function saveAct(){ store.set(K.act, S.activities); }

var $ = function(id){ return document.getElementById(id); };
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function el(tag, cls, html){
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
var DAYS_SHORT = ["So","Mo","Di","Mi","Do","Fr","Sa"];
var DAYS_LONG  = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
var MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

var toastTimer = null;
function toast(msg, undoFn){
  var t = $("toast");
  t.innerHTML = "";
  t.appendChild(document.createTextNode(msg));
  if (undoFn){
    var b = document.createElement("button");
    b.className = "toast-undo"; b.textContent = "Rückgängig";
    b.onclick = function(){ undoFn(); t.classList.remove("show"); clearTimeout(toastTimer); };
    t.appendChild(b);
  }
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove("show"); }, undoFn ? 5000 : 2400);
}

/* ---------- Ton & Vibration ---------- */
var audioCtx = null;
function beep(freq, ms){
  if (!S.settings.sound) return;
  try{
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    var style = (S.uiPrefs && S.uiPrefs.soundStyle) || "sanft";
    o.type = style === "klar" ? "triangle" : style === "markant" ? "square" : "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.22, audioCtx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + ms/1000);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + ms/1000 + 0.02);
  }catch(e){}
}
function buzz(pattern){
  if (!S.settings.vibrate) return;
  var style = (S.uiPrefs && S.uiPrefs.vibrationStyle) || "kurz";
  var p = pattern;
  try{
    if (style === "lang") p = (typeof pattern === "number") ? Math.round(pattern*2.2) : pattern.map(function(x){ return Math.round(x*1.8); });
    if (style === "doppelt") p = (typeof pattern === "number") ? [pattern, 55, pattern] : pattern.concat([55], pattern);
  }catch(e){}
  try{ if (navigator.vibrate) navigator.vibrate(p); }catch(e){}
}
function countdownBeep(){
  // Eigener Schalter, unabhängig vom allgemeinen Ton: die letzten drei
  // Sekunden vor einem Wechsel piepen lassen oder eben nicht.
  if (S.uiPrefs && S.uiPrefs.countdownBeep === false) return;
  beep(660, 70);
}
/* Optionale Sprachausgabe: liest bei jedem neuen Schritt im Player den
   Übungsnamen laut vor (z. B. für freihändiges Training). Nutzt die im
   Browser eingebaute Sprachsynthese, braucht keine Internetverbindung. */
function speakCurrentStep(){
  if (!S.uiPrefs || !S.uiPrefs.speechEnabled) return;
  if (!window.speechSynthesis) return;
  var it = P.seq[P.i];
  if (!it) return;
  try{
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(it.name);
    u.lang = "de-DE"; u.rate = 1.0; u.volume = 0.9;
    window.speechSynthesis.speak(u);
  }catch(e){}
}

/* ============================================================
   SPERRBILDSCHIRM-STEUERUNG (Media Session API)
   Zeigt den aktuellen Übungsnamen als Medien-Info auf dem
   Sperrbildschirm und erlaubt Weiter/Zurück/Play/Pause von dort
   aus – wie bei einem Podcast. Damit der Browser die Steuerung
   überhaupt einblendet, braucht es eine aktiv "abspielende" Ton-
   spur; dafür wird ganz ohne eingebettete Audiodatei ein lautloser
   Audio-Stream direkt per Web-Audio-API erzeugt.
   ============================================================ */
var silentStreamNode = null;
function ensureSilentAudioTrack(){
  if (!window.AudioContext && !window.webkitAudioContext) return;
  try{
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (!audioCtx.createMediaStreamDestination) return; // z. B. Safari < 14.1
    if (!silentStreamNode){
      var dest = audioCtx.createMediaStreamDestination();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      gain.gain.value = 0;
      osc.connect(gain); gain.connect(dest);
      osc.start();
      silentStreamNode = dest;
      var audioEl = $("mediaSessionAudio");
      if (audioEl) audioEl.srcObject = dest.stream;
    }
    var el = $("mediaSessionAudio");
    if (el) el.play().catch(function(){});
  }catch(e){}
}
function updateMediaSession(){
  if (!("mediaSession" in navigator)) return;
  var it = P.seq[P.i];
  if (!it) return;
  try{
    navigator.mediaSession.metadata = new MediaMetadata({
      title: it.name,
      artist: (S.uiPrefs && S.uiPrefs.appName) || "Training",
      album: typeLabel(it.type) + " · Schritt " + (P.i+1) + "/" + P.seq.length
    });
    navigator.mediaSession.playbackState = P.running ? "playing" : "paused";
    navigator.mediaSession.setActionHandler("play", function(){ startTimer(); updateMediaSession(); });
    navigator.mediaSession.setActionHandler("pause", function(){ stopTimer(); updateMediaSession(); });
    navigator.mediaSession.setActionHandler("previoustrack", function(){ prev(); });
    navigator.mediaSession.setActionHandler("nexttrack", function(){ next(P.running); });
  }catch(e){}
}
function clearMediaSession(){
  if (!("mediaSession" in navigator)) return;
  try{
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.setActionHandler("play", null);
    navigator.mediaSession.setActionHandler("pause", null);
    navigator.mediaSession.setActionHandler("previoustrack", null);
    navigator.mediaSession.setActionHandler("nexttrack", null);
  }catch(e){}
  var el = $("mediaSessionAudio");
  if (el){ el.pause(); el.srcObject = null; }
  silentStreamNode = null;
}

/* ============================================================
   HERZFREQUENZ-BRUSTGURT (Web Bluetooth)
   Koppelt einen Standard-Bluetooth-LE-Brustgurt über das offiz-
   ielle "Heart Rate"-GATT-Profil (Service 0x180D, Messwert-
   Charakteristik 0x2A37) – das nutzt u. a. auch der Polar H10.
   Zusätzlich wird, falls vorhanden, der Akkustand über den
   Standard-Batterie-Service (0x180F) ausgelesen, den der Polar H10
   ebenfalls unterstützt. Die Kopplung erfolgt zentral in den
   Einstellungen, damit der Gurt schon vor dem eigentlichen
   Training verbunden ist; die Anzeige im Player während des
   Trainings zeigt den Status nur noch an, ohne selbst zu koppeln.
   Web Bluetooth braucht zwingend HTTPS (oder localhost) und eine
   echte Nutzer-Geste zum Koppeln – auf Geräten/Browsern ohne
   Unterstützung (z. B. iOS Safari) bleibt der Knopf nutzbar,
   meldet das aber verständlich zurück.
   ============================================================ */
var hrDevice = null, hrServer = null, hrChar = null, hrBatteryChar = null;
var HR_SERVICE = 0x180D, HR_MEASUREMENT_CHAR = 0x2A37;
var BATTERY_SERVICE = 0x180F, BATTERY_LEVEL_CHAR = 0x2A19;
function hrSupported(){ return !!(navigator.bluetooth && navigator.bluetooth.requestDevice); }
function parseHeartRate(dataView){
  var flags = dataView.getUint8(0);
  var is16bit = (flags & 0x1) !== 0;
  return is16bit ? dataView.getUint16(1, true) : dataView.getUint8(1);
}
function hrSetAllUi(fn){
  ["btnHrConnect","setBtnHrConnect"].forEach(function(btnId){
    var btn = $(btnId); if (btn) fn(btn, btnId);
  });
}
var lastHrBpm = null;
function onHrNotify(event){
  var bpm = parseHeartRate(event.target.value);
  lastHrBpm = bpm;
  ["hrValue","setHrValue"].forEach(function(id){ var e = $(id); if (e) e.textContent = bpm + " BPM"; });
  if (window.APP3 && window.APP3.onHrSample) window.APP3.onHrSample(bpm);
}
function onHrBatteryNotify(level){
  ["hrBattery","setHrBattery"].forEach(function(id){ var e = $(id); if (e) e.textContent = level != null ? ("🔋 " + level + "%") : ""; });
}
function connectHr(){
  if (!hrSupported()){
    toast("Dieser Browser unterstützt keine Bluetooth-Kopplung (z. B. iOS Safari). Auf Android-Chrome verfügbar.");
    return;
  }
  navigator.bluetooth.requestDevice({filters: [{services: [HR_SERVICE]}], optionalServices: [BATTERY_SERVICE]})
    .then(function(device){
      hrDevice = device;
      device.addEventListener("gattserverdisconnected", onHrDisconnected);
      return device.gatt.connect();
    })
    .then(function(server){ hrServer = server; return server.getPrimaryService(HR_SERVICE); })
    .then(function(service){ return service.getCharacteristic(HR_MEASUREMENT_CHAR); })
    .then(function(ch){
      hrChar = ch;
      return ch.startNotifications();
    })
    .then(function(ch){
      ch.addEventListener("characteristicvaluechanged", onHrNotify);
      hrSetAllUi(function(btn){ btn.classList.add("connected"); });
      ["hrIcon","setHrIcon"].forEach(function(id){ var e = $(id); if (e) e.textContent = "❤️"; });
      ["hrValue","setHrValue"].forEach(function(id){ var e = $(id); if (e) e.textContent = (hrDevice.name || "Brustgurt") + " verbunden …"; });
      toast((hrDevice.name || "Brustgurt") + " verbunden");
      // Akkustand ist optional – nicht jedes Gerät bietet den Service an,
      // daher wird ein Fehlschlag hier bewusst still ignoriert.
      return hrServer.getPrimaryService(BATTERY_SERVICE)
        .then(function(bs){ return bs.getCharacteristic(BATTERY_LEVEL_CHAR); })
        .then(function(bc){
          hrBatteryChar = bc;
          return bc.readValue().then(function(v){ onHrBatteryNotify(v.getUint8(0)); });
        })
        .catch(function(){ onHrBatteryNotify(null); });
    })
    .catch(function(err){
      if (err && err.name === "NotFoundError") return; // Nutzer hat Auswahl abgebrochen
      toast("Kopplung fehlgeschlagen: " + (err && err.message ? err.message : "unbekannter Fehler"));
    });
}
function onHrDisconnected(){
  hrSetAllUi(function(btn){ btn.classList.remove("connected"); });
  ["hrIcon","setHrIcon"].forEach(function(id){ var e = $(id); if (e) e.textContent = "🤍"; });
  ["hrValue","setHrValue"].forEach(function(id){ var e = $(id); if (e) e.textContent = "Brustgurt koppeln"; });
  onHrBatteryNotify(null);
  hrServer = null; hrChar = null; hrBatteryChar = null;
}
function disconnectHr(){
  if (hrDevice && hrDevice.gatt && hrDevice.gatt.connected) hrDevice.gatt.disconnect();
  onHrDisconnected();
}
function getLastHrBpm(){ return lastHrBpm; }
function isHrConnected(){ return !!(hrDevice && hrDevice.gatt && hrDevice.gatt.connected); }

/* ============================================================
   PICTURE-IN-PICTURE-TIMER
   Picture-in-Picture funktioniert nativ nur für <video>-Elemente.
   Um trotzdem den Übungs-Timer als schwebendes Fenster anzeigen
   zu können, wird der aktuelle Stand auf einen unsichtbaren
   Canvas gezeichnet, per captureStream() als Video-Stream an ein
   verstecktes <video>-Element gehängt und darüber das schwebende
   Fenster angefordert. Läuft während des Trainings alle 500ms neu
   gezeichnet, damit die Anzeige im PiP-Fenster mitzählt.
   ============================================================ */
var pipTimer = null;
function pipSupported(){ return document.pictureInPictureEnabled && $("pipCanvas").captureStream; }
function drawPipFrame(){
  var canvas = $("pipCanvas");
  var ctx = canvas.getContext("2d");
  var it = P.seq[P.i];
  ctx.fillStyle = "#0A0A0A"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!it) return;
  ctx.fillStyle = "#F4F4F5"; ctx.textAlign = "center";
  ctx.font = "700 22px -apple-system, sans-serif";
  ctx.fillText(it.name, canvas.width/2, 60, canvas.width - 30);
  ctx.font = "800 72px -apple-system, sans-serif";
  ctx.fillStyle = "#E8734A";
  ctx.fillText(String(P.remaining), canvas.width/2, 150);
  ctx.font = "500 15px -apple-system, sans-serif";
  ctx.fillStyle = "#8A8A93";
  ctx.fillText(it.m === "reps" ? "Wiederholungen" : "Sekunden", canvas.width/2, 180);
  var total = it.dur || 1;
  var pct = Math.max(0, Math.min(1, P.remaining / total));
  ctx.strokeStyle = "#2A2A2E"; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(canvas.width/2, 105, 90, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = "#E8734A"; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(canvas.width/2, 105, 90, -Math.PI/2, -Math.PI/2 + (1-pct)*Math.PI*2); ctx.stroke();
}
function startPipDrawLoop(){
  drawPipFrame();
  if (pipTimer) clearInterval(pipTimer);
  pipTimer = setInterval(drawPipFrame, 500);
}
function stopPipDrawLoop(){ if (pipTimer){ clearInterval(pipTimer); pipTimer = null; } }
function togglePip(){
  if (!pipSupported()){
    toast("Bild-im-Bild wird von diesem Browser nicht unterstützt.");
    return;
  }
  if (document.pictureInPictureElement){
    document.exitPictureInPicture().catch(function(){});
    return;
  }
  var canvas = $("pipCanvas"), video = $("pipVideo");
  startPipDrawLoop();
  video.srcObject = canvas.captureStream(30);
  video.play().then(function(){
    return video.requestPictureInPicture();
  }).then(function(){
    toast("Timer läuft als Bild-im-Bild weiter");
  }).catch(function(err){
    toast("Bild-im-Bild konnte nicht gestartet werden: " + (err && err.message ? err.message : ""));
    stopPipDrawLoop();
  });
  video.addEventListener("leavepictureinpicture", function onLeave(){
    stopPipDrawLoop();
    video.removeEventListener("leavepictureinpicture", onLeave);
  });
}

/* ---------- Wake Lock ---------- */
var wakeLock = null;
function keepAwake(on){
  try{
    if (on && S.settings.keepAwake && navigator.wakeLock && !wakeLock){
      navigator.wakeLock.request("screen").then(function(l){
        wakeLock = l;
        l.addEventListener("release", function(){ wakeLock = null; });
      }).catch(function(){});
    } else if (!on && wakeLock){ wakeLock.release().catch(function(){}); wakeLock = null; }
  }catch(e){}
}

/* ---------- Tages-Helfer ---------- */
/* 2 Minuten geführte Atemübung als Ersatz für das Tagestraining */
var BREATH_CYCLES = 8;
function buildBreath(){
  var seq = [{type:"warmup", name:"Ankommen", cue:"Setz oder leg dich bequem hin. Schultern locker, Augen weich.", dur:8, round:0}];
  for (var i = 1; i <= BREATH_CYCLES; i++){
    seq.push({type:"work", name:"Einatmen", cue:"Durch die Nase, ruhig in den Bauch.", dur:4, round:1,
              mode:"time", exIndex:i, exTotal:BREATH_CYCLES, group:"cardio", groupLabel:"Atemzyklus " + i + " von " + BREATH_CYCLES});
    seq.push({type:"rest", name:"Halten", cue:"Locker halten, nicht pressen.", dur:4, round:1});
    seq.push({type:"cooldown", name:"Ausatmen", cue:"Langsam durch den Mund, doppelt so lang wie das Einatmen.", dur:6, round:1});
  }
  return seq;
}
var BREATH_STEPS = [
  ["Ankommen", "Bequem hinsetzen oder hinlegen, Schultern locker", "8s"],
  ["Einatmen", "Durch die Nase, ruhig in den Bauch", "4s"],
  ["Halten", "Locker halten, nicht pressen", "4s"],
  ["Ausatmen", "Langsam durch den Mund", "6s"]
];
function isRestDay(dateStr){
  if (S.rests[dateStr] === 0) return false; // bewusst überschrieben: "Doch normal trainieren"
  if (S.rests[dateStr] === 1) return true;  // bewusst überschrieben: "Heute schon trainiert" -> Ruhetag
  if (isSickDay(dateStr)) return true;      // Kranktag zählt automatisch als Ruhetag
  if (isInjuryDay(dateStr)) return true;    // Verletzungstag zählt automatisch als Ruhetag
  return W.isFixedRestDay(dateStr, S.settings); // sonst: fester wöchentlicher Ruhetag
}
function setRestDay(dateStr, on){
  S.rests[dateStr] = on ? 1 : 0;
  store.set("wk_rests", S.rests);
}
/* Feste "schon trainiert"-Wochentage (extern, z. B. Vereinstraining) nach
   exakt demselben Muster wie die festen Ruhetage: eine bewusste
   Überschreibung pro Tag hat immer Vorrang vor der festen Wochentag-Regel.
   Der wichtige Unterschied bleibt inhaltlich bestehen – ein Ruhetag bedeutet
   keine Belastung, ein "schon trainiert"-Tag bedeutet Belastung, nur eben
   nicht über diese App nachverfolgt. */
/* "Schon trainiert" bedeutet inhaltlich: An diesem Tag wurde bereits
   trainiert – nur eben nicht über diese App, sondern z. B. ein rund
   zweistündiges externes Ganzkörpertraining mit unterschiedlicher
   Belastung: die Beine deutlich stärker gefordert (Kniebeugen, Ausfall-
   schritte & Co.), der restliche Körper moderater mitbelastet. Der Tag
   zählt deshalb als erledigt, mit genau dieser Gewichtung statt einer
   gleichmäßigen Vollbelastung aller Gruppen. */
var TRAINED_ELSEWHERE_INTENSITY = {beine:0.20, brust:0.15, bauch:0.15, ruecken:0.15, arme:0.15, cardio:0.15};
function markTrainedElsewhere(dateStr){
  markDone(dateStr, {type:"extern", groups: W.GROUPS.slice(), groupIntensity: TRAINED_ELSEWHERE_INTENSITY, ex: []});
}
function isTrainedElsewhereDay(dateStr){
  if (S.trainedOverride[dateStr] === 0) return false; // bewusst überschrieben: "Heute doch nicht extern"
  if (S.trainedOverride[dateStr] === 1) return true;  // bewusst überschrieben: manuell gesetzt
  return W.isFixedTrainedDay(dateStr, S.settings);     // sonst: fester wöchentlicher "schon trainiert"-Tag
}
function setTrainedElsewhereDay(dateStr, on){
  S.trainedOverride[dateStr] = on ? 1 : 0;
  store.set("wk_trainedoverride", S.trainedOverride);
}
function addTrainedOverrideRange(fromDate, toDate){
  var d = fromDate;
  var guard = 0;
  while (d <= toDate && guard < 366){
    S.trainedOverride[d] = 0;
    d = W.addDays(d, 1);
    guard++;
  }
  store.set("wk_trainedoverride", S.trainedOverride);
}
function openTrainedOverrideDialog(fromDate){
  var d = W.parseYmd(fromDate);
  $("trainedOverrideSub").textContent = "Ab " + d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear() +
    ". Bis wann sollen deine festen \"schon trainiert\"-Tage nicht gelten?";
  var endInput = $("trainedOverrideEndDate");
  endInput.min = fromDate;
  endInput.value = fromDate;
  endInput.dataset.from = fromDate;
  var dlg = $("dlgTrainedOverride");
  dlg.showModal ? (function(){ try { dlg.showModal(); } catch(e){ dlg.setAttribute("open",""); } })() : dlg.setAttribute("open","");
}

/* ============================================================
   KRANKHEIT
   Aktivierung ausschließlich über das Kalender-Widget. Solange
   aktiv, wird auf der Startseite jeden neuen Tag nachgefragt, ob
   noch krank – bei "Ja" zählt der Tag als Kranktag (Ruhetag mit
   leichtem, kranktauglichem Dehnprogramm statt reiner Atemübung),
   bei "Nein" endet der Modus sofort wieder.
   ============================================================ */
function saveSickState(){
  store.set("wk_sickdays", S.sickDays);
  store.set("wk_illness_active", S.illnessActive);
}
function isSickDay(dateStr){ return !!S.sickDays[dateStr]; }
function startIllness(){
  S.illnessActive = true;
  S.sickDays[S.today] = 1;
  saveSickState();
}
function endIllness(){
  S.illnessActive = false;
  saveSickState();
}
function needsSickCheckIn(){
  return S.illnessActive && !S.sickDays[S.today];
}
function confirmStillSick(){
  S.sickDays[S.today] = 1;
  saveSickState();
}
function sickDaysThisYear(){
  var y = W.parseYmd(S.today).getFullYear();
  return Object.keys(S.sickDays).filter(function(d){ return S.sickDays[d] && W.parseYmd(d).getFullYear() === y; }).length;
}

/* ============================================================
   VERLETZUNG (exakt nach demselben Muster wie Krankheit, mit dem
   inhaltlichen Unterschied: statt eines leichten Dehnprogramms wird
   an einem Verletzungstag durchgehend nur die einfache Atemübung
   gezeigt – bis "Nein, wieder fit" den Modus beendet.
   ============================================================ */
function saveInjuryState(){
  store.set("wk_injurydays", S.injuryDays);
  store.set("wk_injury_active", S.injuryActive);
}
function isInjuryDay(dateStr){ return !!S.injuryDays[dateStr]; }
function startInjury(){
  S.injuryActive = true;
  S.injuryDays[S.today] = 1;
  saveInjuryState();
}
function endInjury(){
  S.injuryActive = false;
  saveInjuryState();
}
function needsInjuryCheckIn(){
  return S.injuryActive && !S.injuryDays[S.today];
}
function confirmStillInjured(){
  S.injuryDays[S.today] = 1;
  saveInjuryState();
}
function injuryDaysThisYear(){
  var y = W.parseYmd(S.today).getFullYear();
  return Object.keys(S.injuryDays).filter(function(d){ return S.injuryDays[d] && W.parseYmd(d).getFullYear() === y; }).length;
}
/* Leichtes, für Kranke geeignetes Dehnprogramm: nur ruhige, sitzend/
   liegend machbare Übungen aus der bestehenden Dehn-Bibliothek, ohne
   jede Anstrengung. */
var SICK_STRETCH_IDS = null;
function sickRoutineExercises(){
  if (!SICK_STRETCH_IDS){
    SICK_STRETCH_IDS = W.STRETCHES.filter(function(s){
      return /nacken|schulter/i.test(s.g) || /sanft|leicht|ruhig|langsam/i.test(s.aus || s.cue || "");
    }).slice(0, 40);
    if (SICK_STRETCH_IDS.length < 6) SICK_STRETCH_IDS = W.STRETCHES.slice(0, 40);
  }
  var idx = W.dayIndex(S.today);
  var picked = [];
  for (var i = 0; i < 5; i++) picked.push(SICK_STRETCH_IDS[(idx + i * 7) % SICK_STRETCH_IDS.length]);
  return picked;
}
function buildSickRoutine(){
  var seq = [{type:"warmup", name:"Krankheitstag", cue:"Ganz ruhig, im Sitzen oder Liegen. Bei Unwohlsein sofort abbrechen.", dur:10, round:0}];
  sickRoutineExercises().forEach(function(s, i){
    seq.push({type:"work", name:s.n, cue:(s.pos||"") + " " + (s.aus||s.cue||""), dur:30, round:1, mode:"time", group:s.g});
    if (i < 4) seq.push({type:"rest", name:"Kurz lockern", cue:"Ruhig weiteratmen.", dur:8, round:1});
  });
  seq.push({type:"cooldown", name:"Gute Besserung", cue:"Das war schonend genug für einen Krankheitstag. Streak läuft weiter.", dur:8, round:1});
  return seq;
}

/* ============================================================
   URLAUB
   Aktivierung ausschließlich über den Kalender: ein Zeitraum von
   einem Starttag bis zu einem gewählten Endtag. Während des
   Urlaubs wird die feste "schon trainiert extern"-Erkennung
   ausgeschaltet (man folgt ja gerade nicht dem gewohnten
   Wochenrhythmus), das reguläre Training läuft aber ganz normal
   weiter – Urlaub ist kein Ruhetag und keine Krankheit.
   ============================================================ */
function isVacationDay(dateStr){ return !!S.vacationDays[dateStr]; }
function addVacationRange(fromDate, toDate){
  var d = fromDate;
  var guard = 0;
  while (d <= toDate && guard < 366){
    S.vacationDays[d] = 1;
    d = W.addDays(d, 1);
    guard++;
  }
  store.set("wk_vacation", S.vacationDays);
}
function endVacationFrom(dateStr){
  Object.keys(S.vacationDays).forEach(function(d){ if (d >= dateStr) delete S.vacationDays[d]; });
  store.set("wk_vacation", S.vacationDays);
}
function openVacationDialog(fromDate){
  var d = W.parseYmd(fromDate);
  $("vacationSub").textContent = "Urlaub ab " + d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear() +
    ". Bis wann geht er? Trainiert wird in dieser Zeit ganz normal weiter, nur feste \"schon trainiert\"-Wochentage gelten währenddessen nicht.";
  var endInput = $("vacationEndDate");
  endInput.min = fromDate;
  endInput.value = fromDate;
  endInput.dataset.from = fromDate;
  var dlg = $("dlgVacation");
  dlg.showModal ? (function(){ try { dlg.showModal(); } catch(e){ dlg.setAttribute("open",""); } })() : dlg.setAttribute("open","");
}

/* Feste Ruhetage für einen ganzen Zeitraum deaktivieren, z. B. für eine
   intensive Trainingsphase oder ein Lauf-Event. Setzt für jeden Tag im
   Zeitraum explizit "normal trainieren" (S.rests[d] = 0), was denselben
   Vorrang hat wie eine Einzeltag-Änderung im Kalender – einzelne Tage
   lassen sich hinterher jederzeit wieder zurückändern. */
function addRestOverrideRange(fromDate, toDate){
  var d = fromDate;
  var guard = 0;
  while (d <= toDate && guard < 366){
    S.rests[d] = 0;
    d = W.addDays(d, 1);
    guard++;
  }
  store.set("wk_rests", S.rests);
}
function openRestOverrideDialog(fromDate){
  var d = W.parseYmd(fromDate);
  $("restOverrideSub").textContent = "Ab " + d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear() +
    ". Bis wann sollen deine festen Ruhetage nicht gelten?";
  var endInput = $("restOverrideEndDate");
  endInput.min = fromDate;
  endInput.value = fromDate;
  endInput.dataset.from = fromDate;
  var dlg = $("dlgRestOverride");
  dlg.showModal ? (function(){ try { dlg.showModal(); } catch(e){ dlg.setAttribute("open",""); } })() : dlg.setAttribute("open","");
}

/* ============================================================
   STREAK-FREEZE
   Ein "Joker"-System für unverschuldet verpasste Trainingstage:
   ein eingesetzter Freeze lässt die Serie für genau diesen Tag
   nicht abreißen, ohne den Tag rückwirkend als erledigt zu
   markieren (zählt also nicht zu den Trainingstagen/Abzeichen,
   schützt nur die Serie). Es gibt monatlich einen neuen Freeze,
   bis zu drei können gleichzeitig vorrätig sein.
   ============================================================ */
function grantMonthlyFreezeIfDue(){
  var curMonth = S.today.slice(0,7); // "YYYY-MM"
  var fz = S.streakFreezes;
  if (fz.lastGrantMonth === curMonth) return;
  fz.lastGrantMonth = curMonth;
  fz.available = Math.min(3, (fz.available || 0) + 1);
  store.set("wk_freezes", fz);
}
function currentStreakF(){ return W.currentStreak(S.log, S.today, S.streakFreezes.frozenDays); }
function longestStreakF(){ return W.longestStreak(S.log, S.streakFreezes.frozenDays); }
function isFrozenDay(dateStr){ return !!S.streakFreezes.frozenDays[dateStr]; }
function useStreakFreeze(dateStr){
  if (S.streakFreezes.available <= 0) return false;
  if (S.log[dateStr] && S.log[dateStr].done) return false; // schon erledigt, kein Freeze nötig
  S.streakFreezes.frozenDays[dateStr] = 1;
  S.streakFreezes.available--;
  store.set("wk_freezes", S.streakFreezes);
  return true;
}
function removeStreakFreeze(dateStr){
  if (!S.streakFreezes.frozenDays[dateStr]) return;
  delete S.streakFreezes.frozenDays[dateStr];
  S.streakFreezes.available = Math.min(3, S.streakFreezes.available + 1);
  store.set("wk_freezes", S.streakFreezes);
}

/* ============================================================
   JAHRESRÜCKBLICK ("Wrapped")
   Rein clientseitig aus den vorhandenen Daten berechnet – keine
   zusätzliche Speicherung, wird bei jedem Öffnen neu ermittelt.
   ============================================================ */
function computeWrapped(){
  var year = S.today.slice(0,4);
  var entries = Object.keys(S.log).filter(function(k){ return k.slice(0,4) === year && S.log[k] && S.log[k].done; });
  var dayCounts = [0,0,0,0,0,0,0]; // So..Sa
  var exCounts = {};
  entries.forEach(function(k){
    dayCounts[W.parseYmd(k).getDay()]++;
    var e = S.log[k];
    if (Array.isArray(e.ex)) e.ex.forEach(function(id){ exCounts[id] = (exCounts[id]||0) + 1; });
  });
  var km = 0;
  (S.activities || []).forEach(function(a){ if (a.date && a.date.slice(0,4) === year) km += (a.distanceKm || 0); });

  // Längste Serie INNERHALB des Jahres (nicht die Gesamt-Serie über Jahresgrenzen hinweg)
  var yearDays = [], d = year + "-01-01";
  for (var i=0;i<366;i++){ if (d.slice(0,4) !== year) break; yearDays.push(d); d = W.addDays(d,1); }
  var longestInYear = 0, run = 0;
  yearDays.forEach(function(ds){
    if (ds > S.today) return;
    if ((S.log[ds] && S.log[ds].done) || isFrozenDay(ds)){ run++; longestInYear = Math.max(longestInYear, run); }
    else run = 0;
  });

  var dayNames = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
  var maxDayIdx = dayCounts.indexOf(Math.max.apply(null, dayCounts));
  var favDay = entries.length ? dayNames[maxDayIdx] : "–";

  var favExId = null, favExCount = 0;
  Object.keys(exCounts).forEach(function(id){ if (exCounts[id] > favExCount){ favExCount = exCounts[id]; favExId = id; } });
  var favExName = "–";
  if (favExId){ var exObj = W.exerciseById(Number(favExId)); if (exObj) favExName = exObj.n; }

  var badges = 0;
  if ($("achCount")){
    var m = /^(\d+)/.exec($("achCount").textContent);
    if (m) badges = Number(m[1]);
  }

  return {
    year: year, days: entries.length, km: Math.round(km*10)/10,
    longestStreak: longestInYear, favDay: favDay,
    favExercise: favExName, favExerciseCount: favExCount, badges: badges
  };
}
function openWrapped(){
  var w = computeWrapped();
  $("wrappedYear").textContent = w.year;
  $("wrappedDays").textContent = w.days;
  $("wrappedKm").textContent = w.km;
  $("wrappedStreak").textContent = w.longestStreak;
  $("wrappedBadges").textContent = w.badges;
  $("wrappedFavDay").textContent = w.favDay;
  $("wrappedFavExercise").textContent = w.favExercise;
  $("wrappedFavCount").textContent = w.favExerciseCount ? w.favExerciseCount + "× gemacht" : "";
  var dlg = $("dlgWrapped");
  dlg.showModal ? (function(){ try { dlg.showModal(); } catch(e){ dlg.setAttribute("open",""); } })() : dlg.setAttribute("open","");
}

function getPlan(dateStr){
  if (isRestDay(dateStr)){
    return {date:dateStr, weekday:W.parseYmd(dateStr).getDay(), run:false, rest:true, sick:isSickDay(dateStr), injured:isInjuryDay(dateStr),
            exercises:[], warmup:null, cooldown:null};
  }
  var p = W.planForDate(dateStr, S.settings);
  p.trainedElsewhere = isTrainedElsewhereDay(dateStr);
  var sw = S.swaps && S.swaps[dateStr];
  if (sw){
    p.exercises = p.exercises.map(function(e){
      var id = sw[e.g];
      if (!id) return e;
      var alt = W.exerciseById(id);
      if (!alt) return e;
      var f = {leicht:0.75, normal:1, hart:1.25}[S.settings.level] || 1;
      var o = {id:alt.id, g:alt.g, n:alt.n, c:alt.c, m:alt.m, side:!!alt.s, l:alt.l,
               groupLabel:W.GROUP_LABEL[alt.g], swapped:true};
      if (alt.m === "reps"){ o.reps = Math.max(4, Math.round(alt.v*f)); o.dur = e.dur; }
      else o.dur = Math.max(15, Math.round(alt.v * (S.settings.workSec/40)));
      return o;
    });
  }
  return p;
}
function planToday(){ return getPlan(S.today); }
function todayDuration(){
  var p = planToday();
  if (p.rest) return 120;
  return W.sequenceDuration(W.buildSequence(p, S.settings));
}
function markDone(dateStr, info){
  var p = getPlan(dateStr);
  var base = p.rest
    ? {done:true, ts:Date.now(), type:"rest", groups:[], ex:[], sec:120}
    : {done:true, ts:Date.now(), type: p.run ? "run" : "workout",
       groups: p.exercises.map(function(e){ return e.g; }),
       ex: p.exercises.map(function(e){ return e.id; }),
       sec: W.sequenceDuration(W.buildSequence(p, S.settings))};
  S.log[dateStr] = Object.assign(base, info || {});
  saveLog();
}
function unmark(dateStr){ delete S.log[dateStr]; saveLog(); }
function totalDone(){ return Object.keys(S.log).filter(function(k){ return S.log[k] && S.log[k].done; }).length; }

var GOAL_TIPS = {
  aufbau: [
    "Beim Muskelaufbau zählt die Zeit unter Spannung: lieber langsamer als mehr Wiederholungen.",
    "Die letzten zwei Wiederholungen bringen den Reiz – dort sauber bleiben statt abzubrechen.",
    "Zwischen den Übungen ruhig die vollen Pausen nehmen, sonst fehlt Kraft für den Reiz.",
    "Eiweiß über den Tag verteilen hilft mehr als eine große Portion nach dem Training.",
    "Fortschritt heißt hier: gleiche Übung, langsamer ausgeführt oder eine Wiederholung mehr."
  ],
  abnehmen: [
    "Kurze Pausen halten den Puls oben – genau das ist bei diesem Plan der Punkt.",
    "Der Kalorienverbrauch entsteht über den ganzen Tag, nicht nur in diesen 14 Minuten.",
    "Sauber bleiben schlägt Tempo: eine schludrige Wiederholung zählt nicht.",
    "Trink vor dem Training ein Glas Wasser, das hält den Kreislauf stabil.",
    "Regelmäßigkeit schlägt Intensität. Fünf kurze Einheiten sind besser als eine lange."
  ],
  erhalt: null
};
var TIPS = [
  "Qualität vor Tempo: Lieber zwei saubere Wiederholungen weniger als eine unsaubere mehr.",
  "Atme bei der Anstrengung aus – das stabilisiert den Rumpf.",
  "Ein kurzes Training, das stattfindet, schlägt jedes lange, das ausfällt.",
  "Trinke direkt nach dem Training ein großes Glas Wasser.",
  "Muskelkater heißt nicht „gutes Training“. Regelmäßigkeit zählt mehr.",
  "Wenn eine Übung zu leicht wird: langsamer machen statt mehr Wiederholungen.",
  "Nach dem Lauftag tut lockeres Dehnen der Beinrückseite besonders gut.",
  "Setz dir eine feste Uhrzeit – Gewohnheiten brauchen einen Anker.",
  "Bei Schmerzen (nicht Anstrengung) abbrechen und die Übung austauschen.",
  "Schlaf ist der wichtigste Teil des Trainings – plane ihn mit ein."
];

/* ============================================================
   SCREEN: HEUTE
   ============================================================ */
function renderHeute(){
  var d = W.parseYmd(S.today);
  var p = planToday();
  var f = W.fitnessScore(S.log, S.activities, S.today);
  var streak = currentStreakF();
  var h = new Date().getHours();
  var gr = h < 5 ? "Gute Nacht" : h < 11 ? "Guten Morgen" : h < 17 ? "Hallo" : h < 22 ? "Guten Abend" : "Noch wach";
  $("greet").textContent = gr + (S.settings.name ? ", " + S.settings.name : "");
  $("todayLine").textContent = DAYS_LONG[d.getDay()] + ", " + d.getDate() + ". " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  $("streakVal").textContent = streak;
  $("sickCheckIn").style.display = needsSickCheckIn() ? "" : "none";
  $("injuryCheckIn").style.display = needsInjuryCheckIn() ? "" : "none";

  var done = W.currentStreak ? !!(S.log[S.today] && S.log[S.today].done) : false;
  var hero = $("hero");
  hero.classList.toggle("runday", !!(p.run || p.rest || p.trainedElsewhere));
  $("heroKicker").textContent = p.sick ? "Krankheitstag" : p.injured ? "Verletzungspause" : p.rest ? "Entspannungstag" : p.trainedElsewhere ? "Extern trainiert" : p.run ? "Lauftag" : W.GOAL_LABEL[S.settings.goal];
  if (p.sick){
    $("heroTitle").textContent = "Leichtes Dehnen für heute";
    $("heroMeta").textContent = "5 sehr sanfte Übungen im Sitzen/Liegen · kein Leistungsdruck · Streak läuft normal weiter.";
  } else if (p.injured){
    $("heroTitle").textContent = "Atemübung statt Training";
    $("heroMeta").textContent = "2 Minuten geführte Atmung, bis du wieder verletzungsfrei bist · Streak läuft normal weiter.";
  } else if (p.rest){
    $("heroTitle").textContent = "Atemübung statt Training";
    $("heroMeta").textContent = "2 Minuten geführte Atmung · dein Streak läuft normal weiter.";
  } else if (p.trainedElsewhere){
    $("heroTitle").textContent = "Cool-down statt Training";
    $("heroMeta").textContent = "Heute zählt dein externes Ganzkörpertraining – nur 2 Minuten Cool-down-Atmung hier in der App.";
  } else if (p.run){
    $("heroTitle").textContent = "Dein Wochenlauf";
    $("heroMeta").textContent = "5, 10 oder 15 km – Zielzeit wird aus deinen Daten berechnet.";
  } else {
    $("heroTitle").textContent = p.goal === "aufbau" ? "Kraft-Zirkel"
                               : p.goal === "abnehmen" ? "Stoffwechsel-Zirkel" : "Ganzkörper-Zirkel";
    $("heroMeta").textContent = S.settings.rounds + " Runden · " + p.exercises.length + " Übungen · ca. " +
      Math.round(todayDuration()/60) + " Minuten";
  }
  var chips = $("heroChips"); chips.innerHTML = "";
  (p.rest && p.injured ? ["Verletzungspause","Atmung","Schonung"] : p.rest ? ["Entspannung","Atmung","Regeneration"] : p.trainedElsewhere ? ["Extern trainiert","Cool-down","Regeneration"] : p.run ? ["Ausdauer","Beine","Kopf frei"] : p.exercises.map(function(e){ return e.groupLabel; }))
    .forEach(function(c){ chips.appendChild(el("span","chip",esc(c))); });

  // klare Beschriftung der Hauptaktion: was und wie lange
  $("btnStartToday").textContent = p.rest && p.sick ? "Sanftes Dehnen starten" : p.rest ? "Atemübung starten · 2 min" : p.trainedElsewhere ? "Cool-down starten · 2 min" : p.run ? "Zum Lauf" :
    (done ? "Nochmal trainieren" : $("heroTitle").textContent.replace(/-Zirkel$/, "") + " starten") + " · " + Math.round(todayDuration()/60) + " min";
  $("btnRest").classList.toggle("on", !!p.rest);
  $("btnRest").textContent = p.rest ? "Ruhetag aufheben" : "Heute als Ruhetag";
  $("btnToggleDone").textContent = done ? "✓" : "✓";
  $("btnToggleDone").style.opacity = done ? "1" : ".55";
  $("btnToggleDone").style.color = done ? "var(--work)" : "";
  var fixedTrained = isTrainedElsewhereDay(S.today) && !done && !p.rest && !isVacationDay(S.today);
  var bte = $("btnTrainedElsewhere");
  if (bte){
    bte.classList.toggle("accent", fixedTrained);
    bte.classList.toggle("ghost", !fixedTrained);
    bte.textContent = fixedTrained ? "Heute schon trainiert (externer Tag)" : "Heute schon trainiert";
  }

  $("stFit").textContent = f.score;
  $("stWeek").textContent = W.doneInLastDays(S.log, S.today, 7) + "/7";
  $("stTotal").textContent = totalDone();

  // Übungsliste
  var list = $("todayList"); list.innerHTML = "";
  $("exCount").textContent = p.rest ? "2 Minuten" : p.trainedElsewhere ? "2 Minuten" : p.run ? "Lauftag" : p.exercises.length + " Übungen";
  if (p.rest || p.trainedElsewhere){
    BREATH_STEPS.forEach(function(b){ list.appendChild(row(b[0], b[1], b[2], "var(--run)")); });
    list.appendChild(row("Wiederholung", "Der Zyklus läuft " + BREATH_CYCLES + "-mal", "8×", "var(--run)"));
  } else if (p.run){
    list.appendChild(row("Aufwärmen", "10 Minuten locker", "–", "var(--run)"));
    list.appendChild(row("Hauptlauf", "gewählte Distanz im Zieltempo", S.runKm + " km", "var(--run)"));
    list.appendChild(row("Auslaufen & Dehnen", "5 Minuten ruhig", "–", "var(--run)"));
  } else {
    if (S.settings.warmup) list.appendChild(row("Aufwärmen: " + p.warmup.n, p.warmup.c, "60s", "var(--run)"));
    p.exercises.forEach(function(e){
      var r = row(e.n + (e.swapped ? " ↺" : ""), e.groupLabel + " · " + e.c, targetText(e), W.GROUP_COLOR[e.g]);
      r.dataset.g = e.g;
      list.appendChild(r);
    });
    if (S.settings.cooldown) list.appendChild(row("Cool-down: " + p.cooldown.n, p.cooldown.c, "60s", "var(--run)"));
  }

  renderWeekBar();

  var sum = W.summarizeActivities(S.activities, S.today, 28);
  if (sum.sessions){
    $("importCard").style.display = "";
    $("importSummary").textContent = sum.sessions + " Aktivitäten · " + sum.km + " km · " +
      W.fmtTime(sum.sec) + " Bewegungszeit" + (sum.avgHr ? " · Ø " + sum.avgHr + " bpm" : "") +
      (sum.avgPace ? " · Ø " + W.fmtPace(sum.avgPace) : "");
  } else {
    $("importCard").style.display = "none";
  }
  var tips = GOAL_TIPS[S.settings.goal] || TIPS;
  $("tipText").textContent = "💡 " + tips[W.dayIndex(S.today) % tips.length];
}
function targetText(e){
  if (e.m === "reps") return e.reps + "×" + (e.side ? " je Seite" : "");
  return e.dur + "s";
}
function row(name, sub, val, color){
  var r = el("div","ex");
  var d = el("span","dot"); d.style.background = color || "var(--work)";
  var n = el("div","n","<b>"+esc(name)+"</b><span>"+esc(sub)+"</span>");
  var v = el("div","v", esc(val));
  r.appendChild(d); r.appendChild(n); r.appendChild(v);
  return r;
}
function renderWeekBar(){
  var d = W.parseYmd(S.today);
  var monday = W.addDays(S.today, -((d.getDay() + 6) % 7));
  var bar = $("weekBar"); bar.innerHTML = "";
  for (var i=0;i<7;i++){
    var ds = W.addDays(monday, i);
    var dd = W.parseYmd(ds);
    var wd = el("div","wd");
    wd.appendChild(el("span",null,DAYS_SHORT[dd.getDay()]));
    var cls = "";
    if (S.log[ds] && S.log[ds].done) cls += " done";
    if (W.isRunDay(ds, S.settings)) cls += " run";
    if (ds === S.today) cls += " today";
    var i2 = el("i", cls.trim(), String(dd.getDate()));
    wd.appendChild(i2);
    bar.appendChild(wd);
  }
  $("weekRange").textContent = W.parseYmd(monday).getDate() + ". – " +
    W.parseYmd(W.addDays(monday,6)).getDate() + ". " + MONTHS[W.parseYmd(W.addDays(monday,6)).getMonth()];
}

/* ============================================================
   SCREEN: KALENDER
   ============================================================ */
function renderKalender(){
  $("calStreak").textContent = currentStreakF();
  $("calBest").textContent = longestStreakF();
  $("calDone").textContent = totalDone();

  var head = $("calHead");
  if (!head.childNodes.length){
    ["Mo","Di","Mi","Do","Fr","Sa","So"].forEach(function(t){ head.appendChild(el("div","cal-head",t)); });
  }
  var y = S.calMonth.getFullYear(), m = S.calMonth.getMonth();
  $("calTitle").textContent = MONTHS[m] + " " + y;
  $("calPrev").disabled = (y <= W.START_YEAR && m === 0);
  $("calNext").disabled = (y >= W.END_YEAR && m === 11);

  var grid = $("calGrid"); grid.innerHTML = "";
  var first = new Date(y, m, 1);
  var lead = (first.getDay() + 6) % 7;
  var daysInMonth = new Date(y, m+1, 0).getDate();
  for (var i=0;i<lead;i++) grid.appendChild(el("div","cal-cell empty"));
  for (var day=1; day<=daysInMonth; day++){
    var ds = y + "-" + String(m+1).padStart(2,"0") + "-" + String(day).padStart(2,"0");
    var cls = "cal-cell";
    var isDone = !!(S.log[ds] && S.log[ds].done);
    if (isDone) cls += " done";
    else if (ds < S.today) cls += " missed";
    if (ds === S.today) cls += " today";
    if (isSickDay(ds)) cls += " sick";
    else if (isInjuryDay(ds)) cls += " injury";
    else if (isVacationDay(ds)) cls += " vacation";
    else if (isFrozenDay(ds)) cls += " frozen";
    var c = el("div", cls, String(day));
    c.dataset.date = ds;
    if (isSickDay(ds)) c.appendChild(el("div","rd sick-dot"));
    else if (isInjuryDay(ds)) c.appendChild(el("div","rd injury-dot"));
    else if (isVacationDay(ds)) c.appendChild(el("div","rd vacation-dot"));
    else if (isFrozenDay(ds)) c.appendChild(el("div","rd frozen-dot"));
    else if (isRestDay(ds)) c.appendChild(el("div","rd rest-dot"));
    else if (isTrainedElsewhereDay(ds)) c.appendChild(el("div","rd trained-dot"));
    else if (W.isRunDay(ds, S.settings)) c.appendChild(el("div","rd"));
    grid.appendChild(c);
  }
  if (window.APP4 && window.APP4.decorateCalendarGrid) window.APP4.decorateCalendarGrid();
}

/* ---------- Tages-Sheet ---------- */
function openSheet(dateStr){
  if (!W.inRange(dateStr)) return;
  S.sheetDate = dateStr;
  var p = getPlan(dateStr);
  var d = W.parseYmd(dateStr);
  var isDone = !!(S.log[dateStr] && S.log[dateStr].done);
  var isTrainedElsewhere = p.trainedElsewhere;
  $("sheetTitle").textContent = DAYS_LONG[d.getDay()] + ", " + d.getDate() + ". " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  $("sheetSub").textContent = p.sick
    ? "Krankheitstag · 2 Minuten Atemübung · " + (isDone ? "erledigt" : "offen")
    : p.injured
    ? "Verletzungspause · 2 Minuten Atemübung · " + (isDone ? "erledigt" : "offen")
    : p.rest
    ? "Entspannungstag · 2 Minuten Atemübung · " + (isDone ? "erledigt" : "offen")
    : isTrainedElsewhere
    ? "Extern trainiert · 2 Minuten Cool-down · " + (isDone ? "erledigt" : "offen")
    : p.run
    ? "Lauftag · " + (isDone ? "erledigt" : "offen")
    : S.settings.rounds + " Runden · ca. " + Math.round(W.sequenceDuration(W.buildSequence(p,S.settings))/60) +
      " Minuten · " + (isDone ? "erledigt" : "offen");

  var list = $("sheetList"); list.innerHTML = "";
  if (p.rest || isTrainedElsewhere){
    BREATH_STEPS.forEach(function(b){ list.appendChild(row(b[0], b[1], b[2], "var(--run)")); });
  } else if (p.run){
    list.appendChild(row("Wochenlauf", "5, 10 oder 15 km nach Wahl", "Lauf", "var(--run)"));
  } else {
    p.exercises.forEach(function(e){
      list.appendChild(row(e.n, e.groupLabel + " · " + e.c, targetText(e), W.GROUP_COLOR[e.g]));
    });
  }
  var act = $("sheetActions"); act.innerHTML = "";
  if (dateStr === S.today){
    var b1 = el("button","btn accent", p.run ? "Zum Lauf" : "Training starten");
    b1.style.gridColumn = "1 / -1";
    b1.onclick = function(){ closeSheet(); startToday(); };
    act.appendChild(b1);
  }
  var bR = el("button","btn ghost", p.rest ? "Ruhetag entfernen" : "Als Ruhetag festlegen");
  bR.onclick = function(){
    setRestDay(dateStr, !p.rest);
    renderAll(); openSheet(dateStr);
    toast(p.rest ? "Normales Training zurück" : (dateStr > S.today ? "Ruhetag für diesen Tag geplant" : "Entspannungstag gesetzt"));
  };
  act.appendChild(bR);
  if (W.isFixedRestDay(dateStr, S.settings) && dateStr >= S.today){
    var bRO = el("button","btn ghost","Ruhetage ab hier für Zeitraum deaktivieren");
    bRO.style.gridColumn = "1 / -1";
    bRO.onclick = function(){ closeSheet(); openRestOverrideDialog(dateStr); };
    act.appendChild(bRO);
  }
  var isTrainedElsewhere = isTrainedElsewhereDay(dateStr);
  if (isTrainedElsewhere || W.isFixedTrainedDay(dateStr, S.settings)){
    var bTE = el("button","btn ghost", isTrainedElsewhere ? "\"Schon trainiert\"-Tag entfernen" : "Als \"schon trainiert\"-Tag festlegen");
    bTE.onclick = function(){
      setTrainedElsewhereDay(dateStr, !isTrainedElsewhere);
      if (!isTrainedElsewhere){
        markTrainedElsewhere(dateStr);
      } else if (S.log[dateStr] && S.log[dateStr].type === "extern"){
        unmark(dateStr);
      }
      renderAll(); openSheet(dateStr);
      toast(isTrainedElsewhere ? "Normales Training zurück" : "Als erledigt markiert – Ganzkörpertraining extern");
    };
    act.appendChild(bTE);
  }
  if (W.isFixedTrainedDay(dateStr, S.settings) && dateStr >= S.today){
    var bTO = el("button","btn ghost","\"Schon trainiert\"-Tage ab hier für Zeitraum deaktivieren");
    bTO.style.gridColumn = "1 / -1";
    bTO.onclick = function(){ closeSheet(); openTrainedOverrideDialog(dateStr); };
    act.appendChild(bTO);
  }
  if (S.settings.running){
    var isFixedRest = W.isFixedRestDay(dateStr, S.settings);
    var bL = el("button","btn ghost", p.run ? "Lauftag entfernen" : "Als Lauftag festlegen");
    bL.onclick = function(){
      if (isFixedRest && !p.run){
        toast("Das ist ein fester Ruhetag – zuerst in den Einstellungen ändern.");
        return;
      }
      var mon = W.weekMonday(dateStr);
      S.settings.runMode = "variabel";
      var list = (S.settings.runPlan[mon] || []).slice();
      var i = list.indexOf(dateStr);
      if (i >= 0) list.splice(i,1); else { list.push(dateStr); list.sort(); }
      S.settings.runPlan[mon] = list;
      S.settings = W.normalizeSettings(S.settings);
      saveSettings();
      renderAll(); openSheet(dateStr);
      toast(i >= 0 ? "Lauftag entfernt" : "Lauftag festgelegt");
    };
    act.appendChild(bL);
  }
  var bV = el("button","btn ghost", isVacationDay(dateStr) ? "Urlaub beenden" : "Urlaub hinzufügen");
  bV.onclick = function(){
    if (isVacationDay(dateStr)){
      endVacationFrom(dateStr);
      renderAll(); openSheet(dateStr);
      toast("Urlaub ab diesem Tag beendet");
    } else {
      openVacationDialog(dateStr);
    }
  };
  act.appendChild(bV);
  if (dateStr <= S.today && !(S.log[dateStr] && S.log[dateStr].done)){
    var frozen = isFrozenDay(dateStr);
    var bF = el("button","btn ghost", frozen ? "Streak-Freeze zurücknehmen" : "Streak-Freeze einsetzen (" + S.streakFreezes.available + " übrig)");
    if (!frozen && S.streakFreezes.available <= 0) bF.disabled = true;
    bF.onclick = function(){
      if (frozen){
        removeStreakFreeze(dateStr);
        toast("Streak-Freeze zurückgenommen");
      } else {
        if (useStreakFreeze(dateStr)) toast("Streak-Freeze eingesetzt – die Serie reißt hier nicht ab");
        else toast("Kein Freeze mehr übrig");
      }
      renderAll(); openSheet(dateStr);
    };
    act.appendChild(bF);
  }
  // "Als erledigt markieren" bleibt bewusst der letzte Button in der Liste:
  // mehrere Testabläufe und die Bedienlogik gehen von "letzter Knopf = erledigt" aus.
  if (dateStr <= S.today){
    var b2 = el("button","btn " + (isDone ? "ghost" : "secondary"), isDone ? "Erledigt entfernen" : "Als erledigt markieren");
    b2.style.gridColumn = "1 / -1";
    b2.onclick = function(){
      if (isDone) unmark(dateStr); else markDone(dateStr);
      renderAll(); openSheet(dateStr);
      toast(isDone ? "Eintrag entfernt" : "Als erledigt gespeichert");
    };
    act.appendChild(b2);
  }
  if (!act.childNodes.length){
    var b3 = el("button","btn ghost","Schließen"); b3.onclick = closeSheet; act.appendChild(b3);
  }
  if (window.APP4 && window.APP4.decorateSheet) window.APP4.decorateSheet(dateStr);
  $("sheetBg").classList.add("open");
  $("sheet").classList.add("open");
}
function closeSheet(){
  $("sheetBg").classList.remove("open");
  $("sheet").classList.remove("open");
}

/* ============================================================
   SCREEN: LAUF
   ============================================================ */
function renderLauf(){
  if (!S.settings.running){
    $("runDayInfo").textContent = "Dehnen, Rodeln-Vorbereitung und Mehrsport-Erfassung – Laufen ist in den Einstellungen deaktiviert.";
    return;
  }
  var next = nextRunDay();
  var isToday = W.isRunDay(S.today, S.settings);
  $("runDayInfo").textContent = isToday
    ? "Heute ist dein Lauftag"
    : "Nächster Lauftag: " + DAYS_LONG[W.parseYmd(next).getDay()] + ", " + W.parseYmd(next).getDate() + ". " + MONTHS[W.parseYmd(next).getMonth()];

  Array.prototype.forEach.call(document.querySelectorAll("#distRow .dist"), function(d){
    d.classList.toggle("sel", Number(d.dataset.km) === S.runKm && !S.runCustomActive);
  });
  var ci = $("runCustomKm");
  if (document.activeElement !== ci) ci.value = S.runCustomActive ? S.runKm : "";

  var already = !!(S.log[S.today] && S.log[S.today].done);
  $("runPlanTxt").textContent = "Geplant: " + S.runKm + " km" + (already ? " · heute bereits erledigt" : "");
  $("btnRunDone").textContent = already ? "Als nicht erledigt zurücksetzen" : "Lauf als erledigt markieren";
}
function nextRunDay(){
  for (var i=0;i<8;i++){
    var d = W.addDays(S.today, i);
    if (W.isRunDay(d, S.settings)) return d;
  }
  return S.today;
}
var runDoneCooldownTimer = null;
function markRunDone(){
  if (S.log[S.today] && S.log[S.today].done){
    clearTimeout(runDoneCooldownTimer);
    unmark(S.today); toast("Eintrag entfernt"); renderAll(); return;
  }
  markDone(S.today, {type:"run", km:S.runKm});
  beep(660,180); setTimeout(function(){ beep(880,260); }, 190);
  toast(S.runKm + " km als erledigt gespeichert"); buzz(50);
  renderAll();
  clearTimeout(runDoneCooldownTimer);
  if (window.APP3) runDoneCooldownTimer = setTimeout(function(){
    if (confirm("Kurzes Cool-down für die Beine? Etwa zwei Minuten Dehnen.")) window.APP3.startCoolDown(true);
  }, 400);
}

/* ============================================================
   SCREEN: DATEN
   ============================================================ */
function renderDaten(){
  if ($("pdfFrom") && !$("pdfFrom").value){
    $("pdfFrom").value = W.addDays(S.today, -29);
    $("pdfTo").value = S.today;
  }
  var sum = W.summarizeActivities(S.activities, S.today, 28);
  $("agKm").textContent = sum.km;
  $("agSess").textContent = sum.sessions;
  $("agTime").textContent = sum.sec ? W.fmtTime(sum.sec) : "0:00";
  $("agCal").textContent = sum.cal ? Math.round(sum.cal/100)/10 + "k" : "0";
  $("agSteps").textContent = sum.steps ? Math.round(sum.steps/100)/10 + "k" : "0";
  $("agHr").textContent = sum.avgHr || "–";

  // Wochenbalken km
  var weeks = [], max = 0;
  for (var w=7; w>=0; w--){
    var kmw = 0;
    for (var i=0;i<7;i++){
      var ds = W.addDays(S.today, -(w*7 + i));
      S.activities.forEach(function(a){ if (a.date === ds) kmw += a.distanceKm||0; });
    }
    kmw = Math.round(kmw*10)/10;
    weeks.push(kmw); if (kmw > max) max = kmw;
  }
  var bars = $("kmBars"); bars.innerHTML = "";
  weeks.forEach(function(v, i){
    var b = el("div","bar");
    var bi = el("i"); bi.style.height = (max ? Math.max(3, v/max*72) : 3) + "px";
    bi.style.background = "var(--run)";
    b.appendChild(bi);
    b.appendChild(el("span", null, i === 7 ? "jetzt" : "−" + (7-i) + "W"));
    b.title = v + " km";
    bars.appendChild(b);
  });

  var list = $("actList"); list.innerHTML = "";
  $("actCount").textContent = S.activities.length;
  if (!S.activities.length){
    list.appendChild(el("div","empty-state","📭<b>Noch nichts importiert</b><span>Tippe unten rechts auf + oder importiere eine Datei über die Synchronisation.</span>"));
  } else {
    S.activities.slice(0,40).forEach(function(a, i){
      var d = W.parseYmd(a.date);
      var r = el("div","act");
      r.appendChild(el("div","n","<b>"+esc(a.name)+"</b><span>"+d.getDate()+"."+(d.getMonth()+1)+"."+d.getFullYear()+" · "+esc(a.source)+"</span>"));
      var v = (a.distanceKm ? a.distanceKm + " km" : (a.steps ? a.steps + " Schritte" : "–"));
      if (a.durationSec) v += "<br><span class='tiny'>"+W.fmtTime(a.durationSec)+"</span>";
      r.appendChild(el("div","v", v));
      var x = el("button","x","✕");
      x.onclick = (function(act){ return function(){
        var idx = S.activities.indexOf(act);
        S.activities = S.activities.filter(function(o){ return o !== act; });
        saveAct(); renderAll();
        toast("Aktivität gelöscht", function(){
          S.activities.splice(idx, 0, act); saveAct(); renderAll(); toast("Wiederhergestellt");
        });
      };})(a);
      r.appendChild(x);
      list.appendChild(r);
    });
    if (S.activities.length > 40)
      list.appendChild(el("p","tiny","… und " + (S.activities.length-40) + " weitere."));
  }
}

/* ---------- Import ---------- */
function handleFiles(files){
  if (!files || !files.length) return;
  var added = 0, done = 0, total = files.length, bad = 0, restored = false;
  Array.prototype.forEach.call(files, function(file){
    var fr = new FileReader();
    fr.onload = function(){
      try{
        var res = W.parseFitnessFile(file.name, String(fr.result));
        if (res.kind === "backup"){
          applyBackup(res.items); restored = true;
        } else if (res.items && res.items.length){
          var m = W.mergeActivities(S.activities, res.items);
          S.activities = m.list; added += m.added;
        } else bad++;
      }catch(e){ bad++; }
      if (++done === total) finish();
    };
    fr.onerror = function(){ bad++; if (++done === total) finish(); };
    fr.readAsText(file);
  });
  function finish(){
    saveAct(); renderAll();
    if (restored) toast("Sicherung wiederhergestellt");
    else if (added) toast(added + " Aktivität" + (added>1?"en":"") + " importiert");
    else if (bad) toast("Format nicht erkannt – GPX, TCX, CSV oder JSON nötig");
    else toast("Keine neuen Einträge gefunden");
  }
}
/* Vollständiger Zustand – für lokale Sicherung UND Cloud-Sync verwendet.
   Der GitHub-Zugangsschlüssel selbst gehört NIE in diese Daten: er würde
   sonst im eigenen Repository landen. */
function collectFullState(){
  return {
    __trainingsblog: 3, exported: new Date().toISOString(),
    settings: S.settings, log: S.log, activities: S.activities,
    body: S.body, weekGoal: S.weekGoal, race: S.race, swaps: S.swaps,
    skin: S.skin, rests: S.rests, trainedOverride: S.trainedOverride, colors: S.colors
  };
}
/* ============================================================
   SICHERHEIT: Schema-Absicherung beim Wiederherstellen
   Entfernt gefährliche Schlüssel (Prototype Pollution) aus
   importierten/entschlüsselten Daten, bevor sie ins Datenmodell
   übernommen werden, ohne die eigentliche Struktur anzutasten.
   ============================================================ */
var DANGEROUS_KEYS = ["__proto__", "constructor", "prototype"];
function stripDangerousKeys(obj, depth){
  if (depth === undefined) depth = 0;
  if (depth > 6 || obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)){
    for (var i = 0; i < obj.length; i++) obj[i] = stripDangerousKeys(obj[i], depth + 1);
    return obj;
  }
  var out = {};
  Object.keys(obj).forEach(function(k){
    if (DANGEROUS_KEYS.indexOf(k) >= 0) return; // bewusst weglassen
    out[k] = stripDangerousKeys(obj[k], depth + 1);
  });
  return out;
}
function applyFullState(data){
  if (!data || typeof data !== "object") return false;
  data = stripDangerousKeys(data);
  if (data.settings) S.settings = W.normalizeSettings(data.settings);
  if (data.log && typeof data.log === "object" && !Array.isArray(data.log)) S.log = data.log;
  if (Array.isArray(data.activities)) S.activities = data.activities;
  if (data.body && typeof data.body === "object") S.body = data.body;
  if (typeof data.weekGoal === "number") S.weekGoal = data.weekGoal;
  if (typeof data.race === "string") S.race = data.race;
  if (data.swaps && typeof data.swaps === "object") S.swaps = data.swaps;
  if (["osv2","classic","modern","navy"].indexOf(data.skin) >= 0) S.skin = data.skin;
  if (data.rests && typeof data.rests === "object") S.rests = data.rests;
  if (data.trainedOverride && typeof data.trainedOverride === "object") S.trainedOverride = data.trainedOverride;
  if (data.colors && typeof data.colors === "object") S.colors = data.colors;
  saveSettings(); saveLog(); saveAct();
  store.set("wk_body", S.body); store.set("wk_weekgoal", S.weekGoal);
  store.set("wk_race", S.race); store.set("wk_swaps", S.swaps);
  store.set("wk_skin", S.skin); store.set("wk_rests", S.rests);
  store.set("wk_colors", S.colors);
  applyTheme(); fillSettings();
  if (window.APP2 && window.APP2.invalidate) window.APP2.invalidate();
  if (window.APP3 && window.APP3.applyColors) window.APP3.applyColors();
  return true;
}
function applyBackup(data){
  // Rückwärtskompatibel: alte Sicherungen (__muskelApp) enthielten nur
  // Einstellungen, Verlauf und Aktivitäten.
  applyFullState(data);
}
function exportBackup(){
  var data = collectFullState();
  var blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = "trainingsblog-backup-" + S.today + ".json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  toast("Sicherung heruntergeladen");
}
/* Alternative zur GitHub-Cloud-Sync: übergibt die Sicherung direkt an das
   native Teilen-Menü des Geräts. Der Nutzer wählt dort selbst eine
   beliebige Cloud-App (Google Drive, WhatsApp an sich selbst, Dateien-App,
   E-Mail an sich selbst usw.) – die App selbst stellt dabei keinerlei
   Netzwerk-Anfrage, funktioniert also unabhängig von GitHub, CORS oder
   file://-Einschränkungen des Browsers. */
function shareBackup(){
  var data = collectFullState();
  var filename = "trainingsblog-backup-" + S.today + ".json";
  var file = new File([JSON.stringify(data, null, 2)], filename, {type:"application/json"});
  if (navigator.canShare && navigator.canShare({files:[file]})){
    navigator.share({files:[file], title:"Trainingsblog-Sicherung", text:"Sicherung vom " + S.today})
      .then(function(){ toast("Sicherung geteilt"); })
      .catch(function(err){ if (err && err.name !== "AbortError") toast("Teilen nicht möglich: " + err.message); });
  } else {
    toast("Teilen wird von diesem Browser nicht unterstützt – bitte 'Exportieren' nutzen");
    exportBackup();
  }
}

/* ============================================================
   SCREEN: FITNESS
   ============================================================ */
function renderFitness(){
  var f = W.fitnessScore(S.log, S.activities, S.today);
  var C = 2 * Math.PI * 43;
  var ring = $("fitRing");
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = C * (1 - f.score/100);
  $("fitScore").textContent = f.score;
  $("fitLevel").textContent = f.level;
  $("fitText").textContent = fitText(f);

  var parts = $("fitParts"); parts.innerHTML = "";
  [["Konstanz (28 Tage)", f.parts.konstanz, 40, f.last28 + " Einheiten"],
   ["Diese Woche", f.parts.woche, 20, f.last7 + " von 7 Tagen"],
   ["Streak", f.parts.streak, 20, f.streak + " Tage"],
   ["Ausdauer", f.parts.ausdauer, 20, f.km28 + " km in 28 Tagen"]].forEach(function(p){
    var m = el("div","meter");
    m.appendChild(el("div","lbl","<span>"+p[0]+"</span><span>"+p[3]+"</span>"));
    var t = el("div","track");
    var i = el("i"); i.style.width = Math.round(p[1]/p[2]*100) + "%";
    t.appendChild(i); m.appendChild(t);
    parts.appendChild(m);
  });

  var vol = W.groupVolume(S.log, S.today, 28);
  var maxV = Math.max(1, Math.max.apply(null, W.GROUPS.map(function(g){ return vol[g]; })));
  var gb = $("groupBars"); gb.innerHTML = "";
  W.GROUPS.forEach(function(g){
    var m = el("div","meter");
    m.appendChild(el("div","lbl","<span>"+W.GROUP_LABEL[g]+"</span><span>"+vol[g]+"×</span>"));
    var t = el("div","track");
    var i = el("i"); i.style.width = Math.round(vol[g]/maxV*100) + "%"; i.style.background = W.GROUP_COLOR[g];
    t.appendChild(i); m.appendChild(t); gb.appendChild(m);
  });

  var weeks = [], max = 0;
  for (var w=7; w>=0; w--){
    var n = 0;
    for (var i2=0;i2<7;i2++){
      var ds = W.addDays(S.today, -(w*7 + i2));
      if (S.log[ds] && S.log[ds].done) n++;
    }
    weeks.push(n); if (n > max) max = n;
  }
  var bars = $("weekBars"); bars.innerHTML = "";
  weeks.forEach(function(v, i){
    var b = el("div","bar");
    var bi = el("i"); bi.style.height = (max ? Math.max(3, v/max*72) : 3) + "px";
    b.appendChild(bi); b.appendChild(el("span", null, i === 7 ? "jetzt" : "−" + (7-i) + "W"));
    b.title = v + " Einheiten";
    bars.appendChild(b);
  });

  var totalSec = 0, totalKm = 0;
  Object.keys(S.log).forEach(function(k){ if (S.log[k] && S.log[k].done) totalSec += S.log[k].sec || 0; });
  S.activities.forEach(function(a){ totalKm += a.distanceKm || 0; });
  $("recStreak").textContent = longestStreakF() + " Tage";
  $("recTotal").textContent = totalDone();
  $("recKm").textContent = Math.round(totalKm*10)/10 + " km";
  $("recTime").textContent = W.fmtTime(totalSec);
}
function fitText(f){
  if (f.score >= 80) return "Sehr gute Konstanz. Halte das Niveau und variiere die Intensität, statt noch mehr Umfang draufzupacken.";
  if (f.score >= 60) return "Solide Basis. Ein zusätzlicher Tag pro Woche bringt dich am schnellsten weiter.";
  if (f.score >= 40) return "Du bist dran. Ziel für die nächsten Wochen: vier Einheiten pro Woche, egal wie kurz.";
  if (f.score >= 20) return "Guter Anfang. Wichtiger als die Länge ist, dass du überhaupt startest.";
  return "Noch keine Daten. Starte heute mit dem Tagestraining – nach einer Woche wird der Wert aussagekräftig.";
}

/* ============================================================
   SCREEN: EINSTELLUNGEN
   ============================================================ */
function fillSettings(){
  $("setName").value = S.settings.name || "";
  seg("setGoal", S.settings.goal);
  $("setGoalDesc").textContent = W.GOAL_DESC[S.settings.goal];
  sw("setRunning", S.settings.running);
  seg("setLevel", S.settings.level);
  seg("setRounds", String(S.settings.rounds));
  $("setWork").value = String(S.settings.workSec);
  $("setRest").value = String(S.settings.restSec);
  $("setRoundRest").value = String(S.settings.roundRestSec);
  sw("setWarmup", S.settings.warmup);
  sw("setCooldown", S.settings.cooldown);
  $("setRunDist").value = String(S.settings.runDistance);
  if (document.activeElement !== $("setRunCustom")){
    $("setRunCustom").value = S.settings.runDistanceCustom != null ? S.settings.runDistanceCustom : "";
  }
  sw("setSound", S.settings.sound);
  sw("setVibrate", S.settings.vibrate);
  sw("setAwake", S.settings.keepAwake);

  $("setReminder").value = S.settings.reminder || "";
  $("setDays").textContent = totalDone();
  $("setStorage").textContent = storageOk
    ? "Dauerhaft auf diesem Gerät gespeichert"
    : "Nur für diese Sitzung – Datei lokal speichern und direkt öffnen";
  updateDurationLabel();
}
function nearestPace(v){
  var best = 390, d = 1e9;
  for (var p=270;p<=540;p+=15){ if (Math.abs(p-v) < d){ d = Math.abs(p-v); best = p; } }
  return best;
}
function updateDurationLabel(){
  var p = getPlan(S.today);
  if (p.rest){ $("setDuration").textContent = "heute 2 Minuten (Entspannung)"; return; }
  var sec = W.sequenceDuration(W.buildSequence(p, S.settings));
  $("setDuration").textContent = "ca. " + Math.round(sec/60) + " Minuten";
}
function seg(id, val){
  Array.prototype.forEach.call($(id).children, function(b){ b.classList.toggle("on", b.dataset.v === val); });
}
function sw(id, on){ $(id).classList.toggle("on", !!on); }
function applyTheme(){
  document.documentElement.setAttribute("data-theme", S.settings.theme === "light" ? "light" : "dark");
  var mt = document.querySelector('meta[name="theme-color"]');
  if (mt) mt.setAttribute("content", S.settings.theme === "light" ? "#f4f5f7" : "#17181b");
}

/* ============================================================
   PLAYER
   ============================================================ */
var P = {seq:[], i:0, remaining:0, running:false, timer:null, open:false, mode:"workout"};
var OV_C = 2 * Math.PI * 44;

function startToday(){
  var p = planToday();
  if (p.rest && p.sick){ openPlayer(buildSickRoutine()); return; }
  if (p.rest){ openPlayer(buildBreath()); return; }
  if (p.run){ showPart("lauf"); return; }
  openPlayer(W.buildSequence(p, S.settings));
}
function openPlayer(seq){
  P.seq = seq; P.i = 0; P.remaining = seq[0].dur; P.running = false; P.open = true; P.finished = false;
  $("ovRing").style.strokeDasharray = OV_C;
  $("player").classList.add("open");
  $("rpeCard").style.display = "none";
  keepAwake(true);
  renderPlayer();
  speakCurrentStep();
  ensureSilentAudioTrack();
  updateMediaSession();
}
function closePlayer(){
  stopTimer(); P.open = false;
  $("player").classList.remove("open");
  keepAwake(false);
  S.activeProgram = null;
  if (window.speechSynthesis) try{ window.speechSynthesis.cancel(); }catch(e){}
  clearMediaSession();
  if (hrDevice) disconnectHr();
  if (document.pictureInPictureElement) document.exitPictureInPicture().catch(function(){});
  stopPipDrawLoop();
  renderAll();
}
function typeLabel(t){
  return t === "work" ? "Übung" : t === "rest" ? "Pause"
       : t === "roundrest" ? "Rundenpause" : t === "warmup" ? "Aufwärmen" : "Cool-down";
}
function renderPlayer(){
  var it = P.seq[P.i];
  if (!it) return;
  $("ovTag").className = "ov-tag t-" + it.type;
  $("ovTagText").textContent = typeLabel(it.type) + (it.type === "work" ? " " + it.exIndex + "/" + it.exTotal : "");
  var isStretch = P.seq.some(function(x){ return !!x.pose; });
  $("ovRound").textContent = isStretch ? "Dehnen & Mobility"
    : it.round ? "Runde " + it.round + "/" + S.settings.rounds : "Vorbereitung";
  $("ovName").textContent = it.name;
  $("ovCue").textContent = it.cue;

  if (it.type === "work" && it.mode === "reps"){
    $("ovTarget").textContent = it.reps + " Wiederholungen" + (it.side ? " je Seite" : "");
    $("ovTime").className = "ov-reps"; $("ovTime").textContent = it.reps + "×";
    $("ovUnit").textContent = "Zeit: " + P.remaining + " s";
  } else {
    $("ovTarget").textContent = it.type === "work" ? (it.groupLabel || "") : "";
    $("ovTime").className = "ov-time"; $("ovTime").textContent = P.remaining;
    $("ovUnit").textContent = "Sekunden";
  }

  var nx = P.seq[P.i+1];
  $("ovNext").textContent = nx ? "Danach: " + nx.name : "Letzter Block";

  var ring = $("ovRing");
  ring.setAttribute("stroke", it.type === "work" ? "var(--work)"
    : it.type === "rest" ? "var(--rest)" : it.type === "roundrest" ? "var(--roundrest)" : "var(--run)");
  ring.style.strokeDashoffset = OV_C * (1 - (P.remaining / it.dur));

  var totalSec = W.sequenceDuration(P.seq);
  var doneSec = 0;
  for (var k=0;k<P.i;k++) doneSec += P.seq[k].dur;
  doneSec += (it.dur - P.remaining);
  $("ovProg").style.width = Math.round(doneSec/totalSec*100) + "%";
  $("ovLeft").textContent = "noch " + W.fmtTime(totalSec - doneSec);

  $("ovPlay").textContent = P.running ? "Pause" : (P.remaining === it.dur ? "Start" : "Weiter");
  if (it.type === "work" && it.mode === "reps" && !P.running && P.remaining !== it.dur) $("ovPlay").textContent = "Weiter";
  $("ovPrev").disabled = (P.i === 0);
  $("ovNextBtn").disabled = false;
}
function tick(){
  P.remaining--;
  if (P.remaining <= 3 && P.remaining > 0) countdownBeep();
  if (P.remaining <= 0){
    stopTimer();
    beep(880, 220); buzz([80,50,80]);
    if (P.i < P.seq.length - 1){ next(true); }
    else { finishWorkout(); }
    return;
  }
  renderPlayer();
}
function startTimer(){
  if (P.running) return;
  P.running = true;
  beep(760,90);
  P.timer = setInterval(tick, 1000);
  renderPlayer();
  updateMediaSession();
}
function stopTimer(){ P.running = false; if (P.timer){ clearInterval(P.timer); P.timer = null; } }
function next(auto){
  stopTimer();
  if (P.i >= P.seq.length - 1){ finishWorkout(); return; }
  P.i++; P.remaining = P.seq[P.i].dur;
  renderPlayer();
  speakCurrentStep();
  updateMediaSession();
  if (auto) startTimer();
}
function prev(){
  stopTimer();
  if (P.i > 0) P.i--;
  P.remaining = P.seq[P.i].dur;
  renderPlayer();
  speakCurrentStep();
  updateMediaSession();
}
function finishWorkout(){
  stopTimer();
  var extra = {sec: W.sequenceDuration(P.seq)};
  if (S.activeProgram === "rodeln"){
    extra.type = "rodeln";
    extra.ex = P.seq.filter(function(s){ return s.type === "work" && s.id != null; }).map(function(s){ return s.id; });
    var map = {rumpf:"bauch", bein:"beine", huefte:"beine", fuss:"beine", arm:"arme", nacken:"ruecken", ganz:"cardio"};
    var seen = {};
    extra.groups = P.seq.filter(function(s){ return s.type === "work" && s.group; })
      .map(function(s){ return map[s.group] || null; })
      .filter(function(g){ return g && !seen[g] && (seen[g] = true); });
  }
  markDone(S.today, extra);
  keepAwake(false);
  var streak = currentStreakF();
  $("ovTag").className = "ov-tag t-work";
  $("ovTagText").textContent = "Geschafft";
  $("ovName").textContent = "Training erledigt";
  $("ovTarget").textContent = "🔥 " + streak + " Tage Streak";
  var getToneCue = (window.APP4 && window.APP4.toneCue) ? window.APP4.toneCue : function(){ return null; };
  $("ovCue").textContent = S.activeProgram === "rodeln"
    ? (getToneCue("rodeln") || "Rumpf, Beine, Schultern und Nacken sind aufgewärmt und mobilisiert. Der heutige Tag ist im Logbuch erledigt.")
    : planToday().sick
    ? "Gute Besserung. Das war schonend genug für einen Krankheitstag – dein Streak läuft ganz normal weiter."
    : planToday().rest
    ? (getToneCue("rest") || "Zwei Minuten bewusste Atmung sind erfasst. Dein Streak läuft weiter, morgen geht es normal weiter.")
    : (getToneCue("work") || "Du hast heute alle sechs Muskelgruppen trainiert. Morgen warten neue Übungen.");
  $("ovNext").textContent = "";
  $("ovTime").className = "ov-time"; $("ovTime").textContent = "✓";
  $("ovUnit").textContent = W.fmtTime(W.sequenceDuration(P.seq));
  $("ovRing").style.strokeDashoffset = 0;
  $("ovProg").style.width = "100%";
  $("ovLeft").textContent = "fertig";
  $("ovPlay").textContent = "Schließen";
  P.seq = P.seq; P.i = P.seq.length - 1; P.remaining = 0;
  beep(660,150); setTimeout(function(){ beep(880,150); }, 160); setTimeout(function(){ beep(1046,300); }, 330);
  buzz([100,60,100,60,200]);
  P.finished = true;
  var showRpe = !planToday().rest && !planToday().sick;
  $("rpeCard").style.display = showRpe ? "" : "none";
  if (showRpe){
    $("rpeSlider").value = 5; $("rpeValue").textContent = "5";
    delete S.log[S.today].rpe;
  }
}

/* ============================================================
   NAVIGATION & EVENTS
   ============================================================ */
// Ausschnitt „Laufen“ oder „Kraft“ zeigen – in der Hülle über deren Navigation, damit Pfad und Menü stimmen
function showPart(part){
  try { var sh = window.parent !== window && window.parent.SGShell; if (sh) { sh.go("training", part, null, { push: false }); return; } } catch(e){}
  switchTab("lauf"); $("s-lauf").setAttribute("data-part", part);
  if (window.APP5 && window.APP5.layout) window.APP5.layout();
}
function switchTab(name){
  S.screen = name;
  $("s-lauf").removeAttribute("data-part");
  Array.prototype.forEach.call(document.querySelectorAll(".screen"), function(s){
    s.classList.toggle("active", s.id === "s-" + name);
  });
  Array.prototype.forEach.call(document.querySelectorAll(".tab"), function(t){
    t.classList.toggle("on", t.dataset.t === name);
  });
  var fab = $("fabAdd");
  if (fab) fab.style.display = (name === "lauf" && (S.uiPrefs || {}).showFab !== false) ? "flex" : "none";
  window.scrollTo(0,0);
  renderAll();
}
function renderAll(){
  var nowDate = W.ymd(new Date());
  if (nowDate !== S.today){ S.today = nowDate; }
  if (S.screen === "heute") renderHeute();
  else if (S.screen === "kalender") renderKalender();
  else if (S.screen === "lauf") renderLauf();
  else if (S.screen === "daten") renderDaten();
  else if (S.screen === "fitness") renderFitness();
  else if (S.screen === "einst") fillSettings();
  if (window.APP2 && window.APP2.after) window.APP2.after(S.screen);
  if (window.APP3 && window.APP3.after) window.APP3.after(S.screen);
  if (window.APP4 && window.APP4.after) window.APP4.after(S.screen);
  if (window.APP5 && window.APP5.after) window.APP5.after(S.screen);
}

function bind(){
  $("nav").addEventListener("click", function(e){
    var t = e.target.closest(".tab"); if (t) switchTab(t.dataset.t);
  });

  $("btnStartToday").addEventListener("click", startToday);
  $("btnStillSickYes").addEventListener("click", function(){
    confirmStillSick(); renderAll();
    toast("Weiterhin geschont – gute Besserung");
  });
  $("btnStillSickNo").addEventListener("click", function(){
    endIllness(); renderAll();
    toast("Schön, dass es dir besser geht!");
  });
  $("btnStillInjuredYes").addEventListener("click", function(){
    confirmStillInjured(); renderAll();
    toast("Weiterhin geschont – gute Besserung");
  });
  $("btnStillInjuredNo").addEventListener("click", function(){
    endInjury(); renderAll();
    toast("Schön, dass es dir besser geht!");
  });
  $("btnRest").addEventListener("click", function(){
    var on = !isRestDay(S.today);
    setRestDay(S.today, on);
    renderAll();
    if (on){
      toast("Entspannungstag – 2 Minuten Atemübung");
      openPlayer(buildBreath());
    } else {
      toast("Normales Training zurück");
    }
    buzz(40);
  });
  $("btnTrainedElsewhere").addEventListener("click", function(){
    markTrainedElsewhere(S.today);
    renderAll();
    toast("Schon trainiert – 2 Minuten Atemübung als Cool-down");
    buzz(40);
    openPlayer(buildBreath());
  });
  var btnAS = $("btnAdaptiveStretch");
  if (btnAS) btnAS.addEventListener("click", function(){ showPart("kraft"); });
  var btnAF = $("btnAdaptiveFewer");
  if (btnAF) btnAF.addEventListener("click", function(){
    if (S.settings.rounds > 1){
      S.settings.rounds--; saveSettings(); renderAll();
      toast("Rundenzahl auf " + S.settings.rounds + " reduziert – in den Einstellungen jederzeit wieder änderbar");
    }
  });
  var btnAR = $("btnAdaptiveRest");
  if (btnAR) btnAR.addEventListener("click", function(){
    setRestDay(S.today, true);
    renderAll();
    toast("Entspannungstag – 2 Minuten Atemübung");
    openPlayer(buildBreath());
  });
  $("btnVacationSave").addEventListener("click", function(){
    var endInput = $("vacationEndDate");
    var from = endInput.dataset.from;
    var to = endInput.value;
    if (!to || to < from){ toast("Bitte ein gültiges Enddatum wählen"); return; }
    addVacationRange(from, to);
    var dlg = $("dlgVacation");
    try { dlg.close(); } catch(e){}
    dlg.removeAttribute("open");
    renderAll(); openSheet(from);
    toast("Urlaub eingetragen");
  });
  $("vacationClose").addEventListener("click", function(){
    var dlg = $("dlgVacation");
    try { dlg.close(); } catch(e){}
    dlg.removeAttribute("open");
  });
  $("btnRestOverrideSave").addEventListener("click", function(){
    var endInput = $("restOverrideEndDate");
    var from = endInput.dataset.from;
    var to = endInput.value;
    if (!to || to < from){ toast("Bitte ein gültiges Enddatum wählen"); return; }
    addRestOverrideRange(from, to);
    var dlg = $("dlgRestOverride");
    try { dlg.close(); } catch(e){}
    dlg.removeAttribute("open");
    renderAll(); openSheet(from);
    toast("Ruhetage für diesen Zeitraum deaktiviert");
  });
  $("restOverrideClose").addEventListener("click", function(){
    var dlg = $("dlgRestOverride");
    try { dlg.close(); } catch(e){}
    dlg.removeAttribute("open");
  });
  $("btnTrainedOverrideSave").addEventListener("click", function(){
    var endInput = $("trainedOverrideEndDate");
    var from = endInput.dataset.from;
    var to = endInput.value;
    if (!to || to < from){ toast("Bitte ein gültiges Enddatum wählen"); return; }
    addTrainedOverrideRange(from, to);
    var dlg = $("dlgTrainedOverride");
    try { dlg.close(); } catch(e){}
    dlg.removeAttribute("open");
    renderAll(); openSheet(from);
    toast("\"Schon trainiert\"-Tage für diesen Zeitraum deaktiviert");
  });
  $("trainedOverrideClose").addEventListener("click", function(){
    var dlg = $("dlgTrainedOverride");
    try { dlg.close(); } catch(e){}
    dlg.removeAttribute("open");
  });
  var btnYW = $("btnYearWrap");
  if (btnYW) btnYW.addEventListener("click", openWrapped);
  var btnSP = $("btnShareProgress");
  if (btnSP) btnSP.addEventListener("click", function(){
    var streak = currentStreakF(), best = longestStreakF(), total = totalDone();
    var badgeTxt = $("achCount") ? $("achCount").textContent : "0/0";
    var text = "💪 Mein Trainingsfortschritt: " + streak + " Tage aktuelle Serie" +
      (best > streak ? " (Rekord " + best + ")" : "") + ", " + total + " Trainingstage insgesamt, " + badgeTxt + " Abzeichen freigeschaltet.";
    if (navigator.share){
      navigator.share({title:"Mein Trainingsfortschritt", text: text})
        .catch(function(err){ if (err && err.name !== "AbortError") toast("Teilen nicht möglich"); });
    } else if (navigator.clipboard){
      navigator.clipboard.writeText(text).then(function(){ toast("In die Zwischenablage kopiert"); });
    } else {
      toast("Teilen wird von diesem Browser nicht unterstützt");
    }
  });
  var wrappedCloseBtn = $("wrappedClose");
  if (wrappedCloseBtn) wrappedCloseBtn.addEventListener("click", function(){
    var dlg = $("dlgWrapped");
    try { dlg.close(); } catch(e){}
    dlg.removeAttribute("open");
  });
  var wrappedShareBtn = $("btnWrappedShare");
  if (wrappedShareBtn) wrappedShareBtn.addEventListener("click", function(){
    var w = computeWrapped();
    var text = "🎉 Mein Trainingsjahr " + w.year + ": " + w.days + " Trainingstage, " +
      w.km + " km, längste Serie " + w.longestStreak + " Tage, " + w.badges + " Abzeichen. 💪";
    if (navigator.share){
      navigator.share({title:"Mein Trainingsjahr " + w.year, text: text})
        .catch(function(err){ if (err && err.name !== "AbortError") toast("Teilen nicht möglich"); });
    } else if (navigator.clipboard){
      navigator.clipboard.writeText(text).then(function(){ toast("In die Zwischenablage kopiert"); });
    } else {
      toast("Teilen wird von diesem Browser nicht unterstützt");
    }
  });
  $("btnToggleDone").addEventListener("click", function(){
    if (S.log[S.today] && S.log[S.today].done){ unmark(S.today); toast("Eintrag entfernt"); }
    else { markDone(S.today); toast("Als erledigt gespeichert"); buzz(50); }
    renderAll();
  });
  $("todayList").addEventListener("click", function(e){
    var r = e.target.closest(".ex");
    if (r && r.dataset.g && window.APP2) window.APP2.openSwap(r.dataset.g);
    else if (S.screen === "heute") openSheet(S.today);
  });

  // Kalender
  $("calPrev").addEventListener("click", function(){
    S.calMonth = new Date(S.calMonth.getFullYear(), S.calMonth.getMonth()-1, 1); renderKalender();
  });
  $("calNext").addEventListener("click", function(){
    S.calMonth = new Date(S.calMonth.getFullYear(), S.calMonth.getMonth()+1, 1); renderKalender();
  });
  $("calToday").addEventListener("click", function(){
    var d = W.parseYmd(S.today);
    S.calMonth = new Date(d.getFullYear(), d.getMonth(), 1); renderKalender();
  });
  $("calGrid").addEventListener("click", function(e){
    var c = e.target.closest(".cal-cell");
    if (c && c.dataset.date) openSheet(c.dataset.date);
  });
  $("sheetBg").addEventListener("click", closeSheet);
  document.querySelector("#sheet .grab").addEventListener("click", closeSheet);

  // Lauf
  $("distRow").addEventListener("click", function(e){
    var d = e.target.closest(".dist");
    if (!d) return;
    S.runKm = Number(d.dataset.km);
    S.runCustomActive = false;
    renderLauf();
  });
  $("runCustomKm").addEventListener("input", function(e){
    var v = parseFloat(e.target.value);
    if (v > 0 && v <= 200){
      S.runKm = Math.round(v*10)/10;
      S.runCustomActive = true;
      Array.prototype.forEach.call(document.querySelectorAll("#distRow .dist"), function(d){
        d.classList.remove("sel");
      });
      $("runPlanTxt").textContent = "Geplant: " + S.runKm + " km";
    }
  });
  $("btnRunDone").addEventListener("click", markRunDone);

  // Daten
  $("drop").addEventListener("click", function(){ $("fileInput").click(); });
  $("fileInput").addEventListener("change", function(e){ handleFiles(e.target.files); e.target.value = ""; });
  ["dragenter","dragover"].forEach(function(ev){
    $("drop").addEventListener(ev, function(e){ e.preventDefault(); $("drop").classList.add("over"); });
  });
  ["dragleave","drop"].forEach(function(ev){
    $("drop").addEventListener(ev, function(e){ e.preventDefault(); $("drop").classList.remove("over"); });
  });
  $("drop").addEventListener("drop", function(e){
    if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  });
  $("btnBackup").addEventListener("click", exportBackup);
  var shareBtn = $("btnShareBackup");
  if (shareBtn) shareBtn.addEventListener("click", shareBackup);
  $("btnRestore").addEventListener("click", function(){ $("fileInput").click(); });

  // Einstellungen
  $("setName").addEventListener("input", function(e){ S.settings.name = e.target.value.slice(0,24); saveSettings(); });
  $("setGoal").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.v === S.settings.goal) return;
    applyGoal(b.dataset.v);
    fillSettings(); renderAll();
    toast("Ziel: " + W.GOAL_LABEL[b.dataset.v] + " – Plan umgestellt");
  });
  $("setRunning").addEventListener("click", function(){
    setRunning(!S.settings.running);
    fillSettings(); renderAll();
    toast(S.settings.running ? "Laufeinheiten aktiv" : "Laufeinheiten deaktiviert");
  });
  $("setLevel").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.settings.level = b.dataset.v; saveSettings(); fillSettings(); toast("Intensität: " + b.dataset.v);
  });
  $("setRounds").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.settings.rounds = Number(b.dataset.v); saveSettings(); fillSettings();
  });
  [["setWork","workSec"],["setRest","restSec"],["setRoundRest","roundRestSec"]].forEach(function(p){
    $(p[0]).addEventListener("change", function(e){
      S.settings[p[1]] = Number(e.target.value); S.settings = W.normalizeSettings(S.settings);
      saveSettings(); updateDurationLabel();
    });
  });
  [["setWarmup","warmup"],["setCooldown","cooldown"],["setSound","sound"],["setVibrate","vibrate"],["setAwake","keepAwake"]]
  .forEach(function(p){
    $(p[0]).addEventListener("click", function(){
      S.settings[p[1]] = !S.settings[p[1]]; saveSettings(); fillSettings();
      if (p[1] === "sound" && S.settings.sound) beep(880,120);
      if (p[1] === "vibrate" && S.settings.vibrate) buzz(60);
    });
  });
  $("setRunDist").addEventListener("change", function(e){
    S.settings.runDistance = Number(e.target.value);
    S.settings.runDistanceCustom = null; saveSettings();
    S.runKm = S.settings.runDistance; S.runCustomActive = false;
    fillSettings();
  });
  $("setRunCustom").addEventListener("input", function(e){
    var v = parseFloat(e.target.value);
    if (v > 0 && v <= 200){
      S.settings.runDistanceCustom = Math.round(v*10)/10; saveSettings();
      S.runKm = S.settings.runDistanceCustom; S.runCustomActive = true;
    } else if (e.target.value === ""){
      S.settings.runDistanceCustom = null; saveSettings();
      S.runKm = S.settings.runDistance; S.runCustomActive = false;
    }
  });
  $("setReminder").addEventListener("change", function(e){
    S.settings.reminder = e.target.value; saveSettings(); setupReminder();
  });
  $("btnResetLog").addEventListener("click", function(){
    if (confirm("Trainingsverlauf und Streaks wirklich löschen?")){
      S.log = {}; S.rests = {}; store.del("wk_rests"); saveLog(); renderAll(); toast("Verlauf gelöscht");
    }
  });
  $("btnResetAll").addEventListener("click", function(){
    if (confirm("Alles zurücksetzen? Einstellungen, Verlauf, importierte Daten, Farben, Wetter-Standort und Cloud-Zugangsdaten gehen verloren. Eine stille Sicherung wird vorher angelegt und lässt sich über 'Letzte Sicherung vor Reset wiederherstellen' zurückholen.")){
      try { store.set("wk_lastResetBackup", collectFullState()); } catch(e){}
      ["wk_settings","wk_log","wk_activities","wk_rests","wk_trainedoverride","wk_swaps","wk_body","wk_weekgoal",
       "wk_race","wk_skin","wk_colors","wk_weather","wk_weather_cache","wk_sync","wk_uiprefs"]
        .forEach(function(k){ store.del(k); });
      S.settings = W.normalizeSettings({}); S.log = {}; S.activities = []; S.rests = {}; S.trainedOverride = {}; S.swaps = {};
      S.body = {}; S.weekGoal = 0; S.race = ""; S.skin = "osv2"; S.colors = {};
      applyTheme(); renderAll(); toast("Zurückgesetzt");
      if (window.APP4 && window.APP4.hardReset) window.APP4.hardReset();
    }
  });
  var btnUndoReset = $("btnUndoReset");
  if (btnUndoReset) btnUndoReset.addEventListener("click", function(){
    var bak = store.get("wk_lastResetBackup", null);
    if (!bak){ toast("Keine Sicherung vorhanden"); return; }
    if (!confirm("Den Stand von vor dem letzten Zurücksetzen wiederherstellen?")) return;
    applyFullState(bak);
    toast("Wiederhergestellt"); renderAll();
  });

  // Player
  $("ovClose").addEventListener("click", closePlayer);
  $("rpeSlider").addEventListener("input", function(){
    var v = Number($("rpeSlider").value);
    $("rpeValue").textContent = v;
    if (S.log[S.today]) { S.log[S.today].rpe = v; saveLog(); }
  });
  $("ovPlay").addEventListener("click", function(){
    if (P.finished){ P.finished = false; closePlayer(); return; }
    if (P.running) { stopTimer(); renderPlayer(); updateMediaSession(); } else startTimer();
  });
  $("ovNextBtn").addEventListener("click", function(){ next(P.running); });
  $("ovPrev").addEventListener("click", prev);
  var btnHr = $("btnHrConnect");
  if (btnHr) btnHr.addEventListener("click", function(){
    if (btnHr.classList.contains("connected")) disconnectHr();
    else connectHr();
  });
  var btnPip = $("btnPipTimer");
  if (btnPip) btnPip.addEventListener("click", togglePip);

  document.addEventListener("visibilitychange", function(){
    if (document.hidden) { if (P.running) { stopTimer(); renderPlayer(); } }
    else if (!P.open) renderAll();
  });
  document.addEventListener("keydown", function(e){
    if (!P.open) return;
    if (e.code === "Space"){ e.preventDefault(); $("ovPlay").click(); }
    if (e.code === "ArrowRight") next(false);
    if (e.code === "ArrowLeft") prev();
    if (e.code === "Escape") closePlayer();
  });
}

/* ---------- Erinnerung ---------- */
var remTimer = null;
function setupReminder(){
  if (remTimer){ clearTimeout(remTimer); remTimer = null; }
  var t = S.settings.reminder;
  if (!t) { $("remHint").textContent = "Tägliche Benachrichtigung"; return; }
  if (!("Notification" in window)){ $("remHint").textContent = "Dein Browser unterstützt keine Erinnerungen"; return; }
  if (Notification.permission === "default"){
    Notification.requestPermission().then(function(){ setupReminder(); });
    return;
  }
  if (Notification.permission !== "granted"){
    $("remHint").textContent = "Benachrichtigungen sind blockiert";
    return;
  }
  $("remHint").textContent = "Aktiv, solange die App geöffnet ist";
  var parts = t.split(":");
  var now = new Date();
  var target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(parts[0]), Number(parts[1]), 0);
  if (target <= now) target = new Date(target.getTime() + 86400000);
  remTimer = setTimeout(function(){
    try{ new Notification("Zeit für dein Training", {body:"Heute: " + planToday().exercises.map(function(e){return e.groupLabel;}).slice(0,3).join(", ") + " …"}); }catch(e){}
    setupReminder();
  }, target - now);
}

/* ---------- Schnittstelle fuer die Analyse-Ebene ---------- */
window.APP = {
  S:S, store:store, K:K, $:$, el:el, esc:esc, row:row, toast:toast, beep:beep, buzz:buzz,
  getPlan:getPlan, planToday:planToday, isRestDay:isRestDay, applyGoal:applyGoal, setRunning:setRunning, setRestDay:setRestDay, buildBreath:buildBreath, targetText:targetText, markDone:markDone,
  saveSettings:saveSettings, saveLog:saveLog, saveAct:saveAct, renderAll:renderAll,
  switchTab:switchTab, applyTheme:applyTheme, fillSettings:fillSettings, totalDone:totalDone,
  handleFiles:handleFiles, player:P, renderPlayer:renderPlayer, openPlayer:openPlayer, closePlayer:closePlayer, keepAwake:keepAwake, storageOk:storageOk,
  MONTHS:MONTHS, DAYS_SHORT:DAYS_SHORT, DAYS_LONG:DAYS_LONG,
  collectFullState:collectFullState, applyFullState:applyFullState, stripDangerousKeys:stripDangerousKeys,
  startIllness:startIllness, endIllness:endIllness, isSickDay:isSickDay,
  startInjury:startInjury, endInjury:endInjury, isInjuryDay:isInjuryDay,
  isVacationDay:isVacationDay, currentStreakF:currentStreakF, longestStreakF:longestStreakF,
  connectHr:connectHr, disconnectHr:disconnectHr, hrSupported:hrSupported,
  getLastHrBpm:getLastHrBpm, isHrConnected:isHrConnected,
  isFrozenDay:isFrozenDay, useStreakFreeze:useStreakFreeze, removeStreakFreeze:removeStreakFreeze,
  openSheet:openSheet, closeSheet:closeSheet
};

/* ---------- Start ---------- */
applyTheme();
bind();
applyRunningVisibility();
fillSettings();
W.setCustomExercises(S.customExercises);
// Zahlenfelder beim Antippen komplett markieren, damit ein neuer Wert
// direkt überschrieben werden kann, statt sich an die bestehende Zahl
// anzuhängen (z. B. "5" + "4" getippt würde sonst "54" ergeben).
document.addEventListener("focus", function(e){
  if (e.target && e.target.tagName === "INPUT" && e.target.type === "number") {
    e.target.select();
  }
}, true);

grantMonthlyFreezeIfDue();
switchTab("heute");
/* App-Shortcuts vom Homescreen (siehe Manifest im <head>) springen per
   URL-Hash direkt zum gewünschten Tab, z. B. beim Antippen von
   "Kalender" im langen Drücken auf das App-Icon. */
(function(){
  var validTabs = ["heute","kalender","lauf","kraft","daten","fitness","einst"];
  function applyHashNav(){
    var href = location.href;
    var hashTab = href.indexOf("#") >= 0 ? href.slice(href.indexOf("#")+1) : "";
    if (validTabs.indexOf(hashTab) < 0) return;
    // #lauf und #kraft sind zwei Ausschnitte derselben Seite (Ein- und Ausblenden über data-sec, siehe CSS)
    var part = hashTab === "lauf" || hashTab === "kraft" ? hashTab : "";
    switchTab(part ? "lauf" : hashTab); S.shortcutNav = true;
    if (part) $("s-lauf").setAttribute("data-part", part);
    if (window.APP5 && window.APP5.layout) window.APP5.layout();   // Überschriften und Kopf passend zum Ausschnitt
  }
  // Direkt versuchen; zusätzlich auf "hashchange" reagieren, falls der
  // Browser den Hash bei dieser Navigation erst nachträglich setzt
  // (kommt insbesondere bei lokal geöffneten Dateien vor).
  applyHashNav();
  window.addEventListener("hashchange", applyHashNav);
})();
setupReminder();
setInterval(function(){
  var d = W.ymd(new Date());
  if (d !== S.today){ S.today = d; renderAll(); }
}, 60000);

/* Das vollständige Manifest (Name, Symbole, Verknüpfungen) ist bereits
   fest im Kopf der Seite hinterlegt (siehe der manifest-Link weiter
   oben). Es wird hier bewusst NICHT durch ein zweites, unvollständigeres
   Manifest überschrieben – genau das hatte zuvor dazu geführt, dass
   Chrome nur noch "Verknüpfung erstellen" statt "App installieren"
   anbot, weil dem zur Laufzeit erzeugten Manifest ein 192×192-Symbol
   und die Verknüpfungen fehlten. */

/* Service Worker (sw.js) registrieren: macht Training samt Mobility und Atmung offline nutzbar
   und ist Voraussetzung für "App installieren" in Chrome. */
try{
  if ("serviceWorker" in navigator && window.isSecureContext) navigator.serviceWorker.register("../sw.js").catch(function(){});
}catch(e){}
})();
