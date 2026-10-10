/* ============================================================
   MODUL: Einstellungs-Kategorien, Wetter, Cloud-Sync über GitHub
   ============================================================ */
(function(){
"use strict";
var A = window.APP, W = window.WK, GH = window.GITHUB, WT = window.WEATHER;
var S = A.S, $ = A.$, el = A.el, esc = A.esc, row = A.row;

/* ============================================================
   EINSTELLUNGS-KATEGORIEN
   ============================================================ */
var curCat = "training";
function setCat(name){
  curCat = name;
  Array.prototype.forEach.call($("setCatBar").children, function(b){
    b.classList.toggle("on", b.dataset.cat === name);
  });
  Array.prototype.forEach.call(document.querySelectorAll(".catpanel"), function(p){
    p.classList.toggle("on", p.dataset.cat === name);
  });
}

/* ============================================================
   Synchronisation: Cloud (GitHub) oder direkte Datei
   ============================================================ */
var syncMethod = A.store.get("wk_syncmethod", "cloud");
function renderSyncMethod(){
  if (!$("syncMethod")) return;
  Array.prototype.forEach.call($("syncMethod").children, function(b){
    b.classList.toggle("on", b.dataset.v === syncMethod);
  });
  $("syncCloudBlock").style.display = (syncMethod === "cloud") ? "" : "none";
  $("syncFileBlock").style.display = (syncMethod === "datei") ? "" : "none";
}

/* ============================================================
   EINSTELLUNGEN DURCHSUCHEN
   ============================================================ */
var SETTINGS_INDEX = [
  {l:"Trainingsziel", cat:"training", a:"setGoal"},
  {l:"Laufeinheiten Laufen an aus", cat:"training", a:"setRunning"},
  {l:"Name Begrüßung", cat:"training", a:"setName"},
  {l:"Intensität leicht normal hart", cat:"training", a:"setLevel"},
  {l:"Runden Durchgänge", cat:"training", a:"setRounds"},
  {l:"Zeit je Übung", cat:"training", a:"setWork"},
  {l:"Pause zwischen Übungen", cat:"training", a:"setRest"},
  {l:"Rundenpause", cat:"training", a:"setRoundRest"},
  {l:"Aufwärmen", cat:"training", a:"setWarmup"},
  {l:"Cool-down", cat:"training", a:"setCooldown"},
  {l:"Rhythmus Lauftage fest variabel", cat:"training", a:"setRunMode"},
  {l:"Lauftage Wochentage", cat:"training", a:"setRunDays"},
  {l:"Standarddistanz Lauf km", cat:"training", a:"setRunDist"},
  {l:"Eigene Distanz", cat:"training", a:"setRunCustom"},
  {l:"Feste Ruhetage", cat:"training", a:"setRestDays"},
  {l:"Feste schon-trainiert-Tage Wochentage", cat:"training", a:"setTrainedDays"},
  {l:"Laufplan variabel Wochentage", cat:"training", a:"setRunPlan"},
  {l:"Eigene Übungen erstellen hinzufügen", cat:"training", a:"customExName"},
  {l:"Gewicht Körpergewicht", cat:"koerper", a:"setWeight"},
  {l:"Größe Körpergröße", cat:"koerper", a:"setHeight"},
  {l:"Alter", cat:"koerper", a:"setAge"},
  {l:"Grundumsatz Geschlecht", cat:"koerper", a:"setSex"},
  {l:"Wochenziel Ring", cat:"koerper", a:"setWeekGoal"},
  {l:"Wettkampf Zielzeit", cat:"koerper", a:"setRace"},
  {l:"Wetter anzeigen", cat:"wetter", a:"setWeatherOn"},
  {l:"Standort automatisch manuell", cat:"wetter", a:"setWeatherMode"},
  {l:"Ort suchen Stadt", cat:"wetter", a:"weatherCity"},
  {l:"Jetzt orten GPS Standort", cat:"wetter", a:"btnWeatherLocate"},
  {l:"Einheit Celsius Fahrenheit", cat:"wetter", a:"setWeatherUnit"},
  {l:"Design hell dunkel automatisch Theme", cat:"aussehen", a:"setThemeMode"},
  {l:"Neutral Klassisch Modern Design Glasmorphismus", cat:"aussehen", a:"setSkinMode"},
  {l:"Akzentfarbe Modern Cyan Orange Grün Violett", cat:"aussehen", a:"setModernAccent"},
  {l:"Kalorien-Flamme", cat:"aussehen", a:"setShowFlame"},
  {l:"Farben Akzentfarbe", cat:"aussehen", a:"colorRows"},
  {l:"App-Name eigener Name", cat:"aussehen", a:"setAppName"},
  {l:"Schriftgröße Textgröße", cat:"aussehen", a:"setFontScale"},
  {l:"Kalorieneinheit kcal kJ", cat:"aussehen", a:"setCalUnit"},
  {l:"Startkategorie Einstellungen", cat:"aussehen", a:"setStartCat"},
  {l:"Plus-Knopf FAB anzeigen Training", cat:"aussehen", a:"setShowFab"},
  {l:"Akzentfarbe je Trainingsziel", cat:"aussehen", a:"setAccentPerGoal"},
  {l:"Signalton Ton auswählen", cat:"verhalten", a:"setSound"},
  {l:"Klangfarbe sanft klar markant", cat:"verhalten", a:"setSoundStyle"},
  {l:"Countdown-Piepser letzte Sekunden", cat:"verhalten", a:"setCountdownBeep"},
  {l:"Vibration Muster", cat:"verhalten", a:"setVibrate"},
  {l:"Vibrationsmuster kurz lang doppelt", cat:"verhalten", a:"setVibrationStyle"},
  {l:"Sprachausgabe Übungsnamen vorlesen", cat:"verhalten", a:"setSpeech"},
  {l:"Bewegung reduzieren Animationen", cat:"verhalten", a:"setReduceMotion"},
  {l:"Bildschirm anlassen wach", cat:"verhalten", a:"setAwake"},
  {l:"Herzfrequenz Brustgurt Polar Bluetooth koppeln", cat:"verhalten", a:"setBtnHrConnect"},
  {l:"Cool-down-Vorschlag", cat:"verhalten", a:"setAutoCooldown"},
  {l:"Plus-Knopf Startbildschirm", cat:"verhalten", a:"setStartScreen"},
  {l:"Erinnerung Benachrichtigung Uhrzeit", cat:"verhalten", a:"setReminder"},
  {l:"Tonfall Motivationstexte", cat:"verhalten", a:"setTone"},
  {l:"Eigene Zitate Impuls des Tages", cat:"verhalten", a:"setQuoteInput"},
  {l:"Gym-Training Pausenzeit Standard", cat:"verhalten", a:"setGymRest"},
  {l:"Warm-up-Sätze Gym erfassen", cat:"verhalten", a:"setGymWarmup"},
  {l:"Zugriffsschlüssel Token GitHub", cat:"sync", a:"ghToken"},
  {l:"Repository Konto GitHub", cat:"sync", a:"ghOwner"},
  {l:"Repository Name Datenrepository", cat:"sync", a:"ghRepo"},
  {l:"Branch Zweig GitHub", cat:"sync", a:"ghBranch"},
  {l:"Dateipfad Datenpfad", cat:"sync", a:"ghPath"},
  {l:"Verbindung testen GitHub", cat:"sync", a:"ghTest"},
  {l:"Zugangsdaten löschen GitHub", cat:"sync", a:"ghClear"},
  {l:"Jetzt hochladen herunterladen Sync", cat:"sync", a:"ghPush"},
  {l:"Passphrase Synchronisationscode Verschlüsselung", cat:"sync", a:"ghPin"},
  {l:"Automatisch synchronisieren", cat:"sync", a:"ghAutoSync"},
  {l:"Sicherung Datei exportieren", cat:"sync", a:"syncMethod"},
  {l:"App aktualisieren neue Version hochladen index.html", cat:"sync", a:"btnAppUpdate"},
  {l:"Sicherung teilen Backup GitHub", cat:"sync", a:"btnShareBackup"},
  {l:"Version", cat:"daten", a:"setVersion"},
  {l:"Speicherplatz Speicherort", cat:"daten", a:"setStorage"},
  {l:"Verlauf löschen zurücksetzen", cat:"daten", a:"btnResetLog"},
  {l:"Datenaufbewahrung alte Einträge", cat:"daten", a:"setRetention"},
  {l:"Exportieren Backup Datei", cat:"daten", a:"btnBackup"},
  {l:"Wiederherstellen Backup einspielen", cat:"daten", a:"btnRestore"},
  {l:"Alles zurücksetzen Reset komplett", cat:"daten", a:"btnResetAll"},
  {l:"Letzte Sicherung vor Reset wiederherstellen", cat:"daten", a:"btnUndoReset"}
];
function renderSearchResults(q){
  var host = $("setSearchResults");
  var query = q.trim().toLowerCase();
  if (!query){
    host.style.display = "none"; host.innerHTML = "";
    $("setCatBar").style.display = ""; document.querySelectorAll(".catpanel").forEach(function(p){});
    return;
  }
  var hits = SETTINGS_INDEX.filter(function(it){ return it.l.toLowerCase().indexOf(query) >= 0; });
  host.innerHTML = "";
  $("setCatBar").style.display = "none";
  Array.prototype.forEach.call(document.querySelectorAll(".catpanel"), function(p){ p.classList.remove("on"); });
  if (!hits.length){
    host.appendChild(el("p","muted","Keine Einstellung gefunden."));
  } else {
    hits.forEach(function(it){
      var label = it.l.split(" ")[0];
      var b = el("button","wcityresult", esc(label) + "<span>" + CATS_LABEL[it.cat] + "</span>");
      b.onclick = function(){
        $("setSearch").value = "";
        renderSearchResults("");
        setCat(it.cat);
        setTimeout(function(){
          var target = $(it.a);
          if (!target) return;
          target.scrollIntoView({block:"center", behavior:"smooth"});
          target.classList.add("flash-hit");
          setTimeout(function(){ target.classList.remove("flash-hit"); }, 1500);
        }, 80);
      };
      host.appendChild(b);
    });
  }
  host.style.display = "";
}
var CATS_LABEL = {
  training:"Ziel & Training", koerper:"Körper", wetter:"Wetter", aussehen:"Erscheinungsbild",
  verhalten:"Verhalten", sync:"Cloud-Sync", daten:"Daten"
};


S.weather = A.store.get("wk_weather", {
  enabled: true, mode: "auto", unit: "c",
  lat: null, lon: null, place: "", geoStatus: "noch nicht angefragt"
});
S.weatherCache = A.store.get("wk_weather_cache", null); // {fetchedAt, lat, lon, data}
/* ============================================================
   SICHERHEIT: Zugangsdaten (Token, Passphrase) werden bewusst
   NICHT im localStorage abgelegt, sondern nur im sessionStorage
   (überlebt ein Neuladen, wird aber beim Schließen des Tabs vom
   Browser automatisch geleert) bzw. rein im Arbeitsspeicher. Nur
   die unkritischen Verbindungsdaten (Repo, Branch, Pfad, Zeitpunkt
   der letzten Sync) werden dauerhaft gespeichert.
   ============================================================ */
function loadSessionSecret(key){
  try { return sessionStorage.getItem(key) || ""; } catch(e){ return ""; }
}
function saveSessionSecret(key, val){
  try {
    if (val) sessionStorage.setItem(key, val);
    else sessionStorage.removeItem(key);
  } catch(e){ /* sessionStorage evtl. blockiert (privater Modus) – Wert bleibt nur im Arbeitsspeicher */ }
}
S.sync = A.store.get("wk_sync", {
  owner: "", repo: "", branch: "main", path: "trainingsblog-data.json", auto: false
});
S.sync.token = loadSessionSecret("wk_session_token");
S.sync.pin = loadSessionSecret("wk_session_pin");
S.uiPrefs = A.store.get("wk_uiprefs", {});
(function(){
  var d = {themeMode:"dark", showFlame:true, autoCooldown:true,
    appName:"", fontScale:"normal", calUnit:"kcal", startCat:"training", tone:"neutral", retentionDays:0,
    showFab:true, accentPerGoal:false,
    soundStyle:"sanft", vibrationStyle:"kurz", countdownBeep:true, speechEnabled:false,
    startScreen:"heute", customQuotes:[], gymRestSeconds:90, gymWarmupSets:false, modernAccent:"orange", reduceMotion:false, navyPanel:"classic"};
  for (var k in d) if (S.uiPrefs[k] === undefined) S.uiPrefs[k] = d[k];
})();

function saveWeatherSettings(){ A.store.set("wk_weather", S.weather); }
function saveWeatherCache(){ A.store.set("wk_weather_cache", S.weatherCache); }
function saveSync(){
  // Token und Passphrase bewusst NICHT mit in den localStorage-Datensatz aufnehmen.
  var toSave = {};
  for (var k in S.sync) if (k !== "token" && k !== "pin") toSave[k] = S.sync[k];
  A.store.set("wk_sync", toSave);
  saveSessionSecret("wk_session_token", S.sync.token || "");
  saveSessionSecret("wk_session_pin", S.sync.pin || "");
}
function saveUiPrefs(){ A.store.set("wk_uiprefs", S.uiPrefs); }

/* Beim Verlassen der Seite sensible Werte im Arbeitsspeicher überschreiben. */
window.addEventListener("beforeunload", function(){
  try {
    S.sync.token = ""; S.sync.pin = "";
  } catch(e){}
});

/* ============================================================
   WETTER: Laden, Cachen, stündlich aktualisieren
   ============================================================ */
var ONE_HOUR = 3600000;
function weatherReady(){ return S.weather.enabled && S.weather.lat != null && S.weather.lon != null; }
function weatherStale(){
  if (!S.weatherCache) return true;
  if (S.weatherCache.lat !== S.weather.lat || S.weatherCache.lon !== S.weather.lon) return true;
  if (S.weatherCache.unit !== S.weather.unit) return true;
  return (Date.now() - S.weatherCache.fetchedAt) >= ONE_HOUR;
}
/* Leise Ortung nur für die interne Aktualisierung in loadWeather(): setzt
   bei Erfolg lat/lon, rührt aber nicht die vom Knopf "Jetzt orten"
   verwaltete Status-Anzeige an, damit sich beide sich nicht überschreiben. */
function silentRelocate(){
  return new Promise(function(resolve){
    if (!navigator.geolocation) { resolve(); return; }
    navigator.geolocation.getCurrentPosition(function(pos){
      S.weather.lat = Math.round(pos.coords.latitude * 1000) / 1000;
      S.weather.lon = Math.round(pos.coords.longitude * 1000) / 1000;
      saveWeatherSettings();
      resolve();
    }, function(){ resolve(); }, {timeout:8000, maximumAge:600000});
  });
}
function loadWeather(force){
  if (!weatherReady()) { renderWeatherUI(); return Promise.resolve(null); }
  if (!force && !weatherStale()){ renderWeatherUI(); return Promise.resolve(S.weatherCache.data); }
  setSyncLikeStatus("weatherUpdated", "wird geladen …");
  // Im Automatik-Modus wird bei jeder Aktualisierung auch der Standort neu
  // geholt, damit die Vorhersage bei einem Ortswechsel mitzieht. Das gilt
  // nur, wenn ohnehin schon automatisch geortet wird – schlägt die Ortung
  // fehl, wird einfach mit dem zuletzt bekannten Standort weitergemacht.
  var relocate = (S.weather.mode === "auto") ? silentRelocate() : Promise.resolve(null);
  return relocate.then(function(){
    return WT.fetchForecast(S.weather.lat, S.weather.lon, S.weather.unit).then(function(data){
      S.weatherCache = {fetchedAt: Date.now(), lat: S.weather.lat, lon: S.weather.lon, unit: S.weather.unit, data: data};
      saveWeatherCache();
      renderWeatherUI();
      return data;
    }).catch(function(err){
      renderWeatherUI(err.message || "Wetterdaten nicht erreichbar");
      return null;
    });
  });
}
function ensureWeatherFresh(){
  if (weatherReady() && weatherStale()) loadWeather(false);
  else renderWeatherUI();
}
function setSyncLikeStatus(id, txt){ var e = $(id); if (e) e.textContent = txt; }

function locateAuto(){
  return new Promise(function(resolve, reject){
    if (!navigator.geolocation){ reject(new Error("Keine Standortfreigabe in diesem Browser.")); return; }
    S.weather.geoStatus = "wird angefragt …"; saveWeatherSettings(); renderWeatherSettings();
    navigator.geolocation.getCurrentPosition(function(pos){
      S.weather.lat = Math.round(pos.coords.latitude * 1000) / 1000;
      S.weather.lon = Math.round(pos.coords.longitude * 1000) / 1000;
      S.weather.geoStatus = "erlaubt";
      S.weather.place = "Aktueller Standort";
      saveWeatherSettings();
      resolve();
    }, function(err){
      S.weather.geoStatus = err && err.code === 1 ? "abgelehnt" : "nicht verfügbar";
      saveWeatherSettings(); renderWeatherSettings();
      reject(new Error("Standort nicht verfügbar. Bitte manuell einen Ort eingeben."));
    }, {timeout:8000, maximumAge:600000});
  });
}
function searchCity(name){
  var host = $("weatherResults");
  host.innerHTML = "<p class='tiny'>Suche läuft …</p>";
  return WT.geocodeCity(name).then(function(list){
    host.innerHTML = "";
    if (!list.length){ host.appendChild(el("p","tiny","Kein Ort gefunden.")); return; }
    list.forEach(function(c){
      var b = el("button","wcityresult",
        esc(c.name) + "<span>" + esc([c.admin1, c.country].filter(Boolean).join(", ")) + "</span>");
      b.onclick = function(){
        S.weather.lat = Math.round(c.lat*1000)/1000;
        S.weather.lon = Math.round(c.lon*1000)/1000;
        S.weather.place = c.name + (c.country ? ", " + c.country : "");
        S.weather.mode = "manuell";
        saveWeatherSettings();
        renderWeatherSettings();
        host.innerHTML = "";
        $("weatherCity").value = "";
        loadWeather(true);
        A.toast("Ort gesetzt: " + S.weather.place);
      };
      host.appendChild(b);
    });
  }).catch(function(err){
    host.innerHTML = "";
    host.appendChild(el("p","tiny",err.message || "Ortssuche fehlgeschlagen."));
  });
}

/* ---------- Rendering ---------- */
function fmtUpdated(ts){
  if (!ts) return "–";
  var min = Math.round((Date.now() - ts) / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return "vor " + min + " Min";
  var h = Math.round(min/60);
  return "vor " + h + " Std";
}
function tempUnitSuffix(){ return S.weather.unit === "f" ? "°F" : "°C"; }

function renderWeatherToday(){
  var card = $("weatherToday");
  if (!card) return;
  if (!S.weather.enabled || !weatherReady() || !S.weatherCache){ card.style.display = "none"; return; }
  var data = S.weatherCache.data;
  var today = WT.forecastForDate(data, S.today);
  card.style.display = "";
  var curCode = data.current ? data.current.code : (today ? today.code : 0);
  var info = WT.wmoInfo(curCode);
  $("wTodayIcon").innerHTML = WT.weatherIconSvg(info[0], "wicon");
  $("wTodayTemp").textContent = (data.current ? data.current.temp : (today ? today.tmax : "–")) + tempUnitSuffix();
  $("wTodayLabel").textContent = info[1] + (S.weather.place ? " · " + S.weather.place : "");
  $("wTodayMax").textContent = today ? "Hoch " + today.tmax + "°" : "–";
  $("wTodayMin").textContent = today ? "Tief " + today.tmin + "°" : "–";
  var hh = $("wHours"); hh.innerHTML = "";
  (data.hours || []).slice(0, 12).forEach(function(h){
    var t = new Date(h.time);
    var hi = WT.wmoInfo(h.code);
    var cell = el("div","whour",
      "<span>" + String(t.getHours()).padStart(2,"0") + "h</span>" +
      WT.weatherIconSvg(hi[0], "wicon") + "<b>" + h.temp + "°</b>");
    hh.appendChild(cell);
  });
  $("wUpdatedTxt").textContent = "Aktualisiert " + fmtUpdated(S.weatherCache.fetchedAt) + " · stündlich automatisch";
  renderWeatherWarning();
}
/* Semantisches Warnbanner für wetterbedingte Vorsicht beim Training
   draußen: große Hitze, Kälte oder Gewitter. Nutzt exakt dieselben
   Wetterdaten wie die Wetterkarte, rein informativ. */
function renderWeatherWarning(){
  var banner = $("weatherWarnBanner");
  if (!banner) return;
  if (!S.weather.enabled || !weatherReady() || !S.weatherCache){ banner.style.display = "none"; return; }
  var cur = S.weatherCache.data && S.weatherCache.data.current;
  if (!cur){ banner.style.display = "none"; return; }
  var isF = S.weather.unit === "f";
  var heatThresh = isF ? 86 : 30, severeHeatThresh = isF ? 97 : 36, coldThresh = isF ? 23 : -5;
  var msg = null, severe = false, icon = "⚠️";
  if (cur.temp >= severeHeatThresh){
    msg = "Große Hitze (" + cur.temp + tempUnitSuffix() + ") – Training draußen besser früh morgens oder abends, unbedingt ausreichend trinken.";
    severe = true; icon = "🥵";
  } else if (cur.temp >= heatThresh){
    msg = "Hohe Temperatur (" + cur.temp + tempUnitSuffix() + ") – beim Training draußen auf ausreichend Trinken achten.";
    icon = "☀️";
  } else if (cur.temp <= coldThresh){
    msg = "Sehr kalt (" + cur.temp + tempUnitSuffix() + ") – länger aufwärmen, auf rutschigen Untergrund achten.";
    icon = "🥶";
  } else if ([95,96,99].indexOf(cur.code) >= 0){
    msg = "Gewitter angesagt – Training draußen besser auf drinnen verlegen oder verschieben.";
    severe = true; icon = "⛈️";
  }
  if (!msg){ banner.style.display = "none"; return; }
  banner.style.display = "";
  banner.classList.toggle("severe", severe);
  $("weatherWarnIcon").textContent = icon;
  $("weatherWarnText").textContent = msg;
}
function renderWeatherStrip(){
  var card = $("weatherStripCard");
  if (!card) return;
  if (!S.weather.enabled || !weatherReady() || !S.weatherCache){ card.style.display = "none"; return; }
  card.style.display = "";
  var data = S.weatherCache.data;
  $("weatherStripUpdated").textContent = "vor " + fmtUpdated(S.weatherCache.fetchedAt).replace("vor ","");
  var host = $("weatherStrip"); host.innerHTML = "";
  data.days.forEach(function(d){
    var dd = W.parseYmd(d.date);
    var info = WT.wmoInfo(d.code);
    var c = el("div","wday" + (d.date === S.today ? " today" : ""),
      "<div class='wd-name'>" + A.DAYS_SHORT[dd.getDay()] + "</div>" +
      "<div class='wd-date'>" + dd.getDate() + "." + (dd.getMonth()+1) + ".</div>" +
      WT.weatherIconSvg(info[0], "wicon") +
      "<div class='wd-max'>" + d.tmax + "°</div><div class='wd-min'>" + d.tmin + "°</div>");
    c.onclick = function(){ A.switchTab("kalender"); setTimeout(function(){ A.openSheet(d.date); }, 60); };
    host.appendChild(c);
  });
}
function decorateCalendarGrid(){
  // Bereits gesetzte Icons zuerst entfernen: die Funktion wird von mehreren
  // Stellen aus angestoßen (Kalender-Render, Wetter-Aktualisierung), und
  // ohne Aufräumen würden sich Icons bei jedem erneuten Aufruf verdoppeln.
  Array.prototype.forEach.call(document.querySelectorAll("#calGrid .cal-cell .wc"), function(el){ el.remove(); });
  if (!S.weather.enabled || !weatherReady() || !S.weatherCache) return;
  var data = S.weatherCache.data;
  Array.prototype.forEach.call(document.querySelectorAll("#calGrid .cal-cell[data-date]"), function(cell){
    var d = WT.forecastForDate(data, cell.dataset.date);
    if (!d) return;
    var info = WT.wmoInfo(d.code);
    var span = document.createElement("span");
    span.className = "wc";
    span.innerHTML = WT.weatherIconSvg(info[0], "wicon");
    cell.appendChild(span);
  });
}
function decorateSheet(dateStr){
  var host = $("sheetWeather");
  if (!host) return;
  host.innerHTML = "";
  if (!S.weather.enabled || !weatherReady() || !S.weatherCache) return;
  var d = WT.forecastForDate(S.weatherCache.data, dateStr);
  if (!d) return;
  var info = WT.wmoInfo(d.code);
  var block = el("div","sheetweather");
  block.innerHTML = WT.weatherIconSvg(info[0], "wicon") +
    "<div class='swtext'><b>" + info[1] + " · " + d.tmax + "° / " + d.tmin + "°</b>" +
    (d.pop != null ? "Regenwahrscheinlichkeit " + d.pop + " %" : "") + "</div>";
  host.appendChild(block);
}
function renderWeatherUI(errMsg){
  renderWeatherToday();
  renderWeatherStrip();
  if (S.screen === "kalender") decorateCalendarGrid();
  if (errMsg && $("weatherUpdated")) $("weatherUpdated").textContent = errMsg;
  else if ($("weatherUpdated")) $("weatherUpdated").textContent = S.weatherCache ? fmtUpdated(S.weatherCache.fetchedAt) : "noch keine Daten";
}
function renderWeatherSettings(){
  if (!$("setWeatherOn")) return;
  sw("setWeatherOn", S.weather.enabled);
  $("weatherOptions").style.display = S.weather.enabled ? "" : "none";
  seg("setWeatherMode", S.weather.mode);
  $("rowWeatherAuto").style.display = (S.weather.mode === "auto") ? "" : "none";
  $("rowWeatherManual").style.display = (S.weather.mode === "manuell") ? "" : "none";
  $("weatherAutoStatus").textContent = S.weather.geoStatus;
  $("weatherPlace").textContent = S.weather.place || (S.weather.lat != null ? S.weather.lat + ", " + S.weather.lon : "noch kein Ort gewählt");
  seg("setWeatherUnit", S.weather.unit);
  $("weatherUpdated").textContent = S.weatherCache ? fmtUpdated(S.weatherCache.fetchedAt) : "noch keine Daten";
}

/* ============================================================
   CLOUD-SYNC über GitHub
   ============================================================ */
function currentCfg(){ return GH.normalizeCfg(S.sync); }
function ghStatus(txt, cls){
  var e = $("ghStatus");
  if (!e) return;
  e.textContent = txt;
  e.className = "tiny" + (cls ? " " + cls : "");
}
function renderSyncSettings(){
  if (!$("ghToken")) return;
  var shareBtn = $("btnShareBackup");
  if (shareBtn) shareBtn.style.display = (navigator.share) ? "" : "none";
  $("ghToken").value = S.sync.token || "";
  $("ghOwner").value = S.sync.owner || "";
  $("ghRepo").value = S.sync.repo || "";
  $("ghBranch").value = S.sync.branch || "main";
  $("ghPath").value = S.sync.path || "trainingsblog-data.json";
  $("ghPin").value = S.sync.pin || "";
  sw("ghAutoSync", S.sync.auto);
  var pinLen = (S.sync.pin || "").length;
  if (pinLen === 0) $("ghPinHint").textContent = "Keine Verschlüsselung – die Sicherung ist für jeden mit Repository-Zugriff lesbar.";
  else if (pinLen < 4) $("ghPinHint").textContent = "Noch zu kurz – mindestens 4 Zeichen nötig, sonst wird unverschlüsselt hochgeladen.";
  else if (pinLen < 6) $("ghPinHint").textContent = "Verschlüsselung aktiv. Eine längere Passphrase (mehrere Wörter) ist deutlich sicherer als ein kurzer Code.";
  else $("ghPinHint").textContent = "Verschlüsselung aktiv.";
  var complete = GH.cfgComplete(S.sync);
  ["ghTest","ghPush","ghPull"].forEach(function(id){ $(id).disabled = !complete; });
  if (!complete) ghStatus("Zugriffsschlüssel, Konto, Repository und Pfad eintragen, dann testen.");
  else if (S.sync.lastSync) ghStatus("Zuletzt synchronisiert: " + fmtUpdated(S.sync.lastSync));
  else ghStatus("Noch nicht synchronisiert.");
}
function readSyncFieldsIntoState(){
  S.sync.token = $("ghToken").value.trim();
  S.sync.owner = $("ghOwner").value.trim();
  S.sync.repo = $("ghRepo").value.trim();
  S.sync.branch = $("ghBranch").value.trim() || "main";
  S.sync.path = $("ghPath").value.trim() || "trainingsblog-data.json";
  S.sync.pin = $("ghPin").value.trim(); // Leerzeichen INNERHALB der Passphrase bleiben erhalten (mehrere Wörter), nur am Rand entfernen
  saveSync();
  renderSyncSettings();
}
function doTestConnection(){
  readSyncFieldsIntoState();
  ghStatus("Verbindung wird geprüft …", "busy");
  GH.testConnection(S.sync).then(function(res){
    ghStatus("Verbunden mit " + res.fullName + (res.private ? " (privat)" : " – dieses Repository ist öffentlich, Trainingsdaten wären für alle einsehbar!"), "ok");
  }).catch(function(err){
    ghStatus(err.message, "err");
  });
}
/* Bringt lokale und Cloud-Daten zusammen, bevor hochgeladen wird: die
   Cloud soll auch Log-Tage und Aktivitäten behalten, die auf dem Gerät
   durch die Datenaufbewahrung schon gelöscht wurden. So bleibt die
   Cloud-Sicherung zeitlich unbegrenzt, während das Gerät selbst nur die
   eingestellte Zeitspanne vorhält. */
function buildSyncPayload(){
  var local = A.collectFullState();
  return GH.getFile(S.sync).then(function(cur){
    if (!cur.exists) return local;
    var remote = cur.content;
    var decodeP = GH.isEncryptedPayload(remote)
      ? (S.sync.pin ? GH.decryptPayload(remote, S.sync.pin).catch(function(){ return null; }) : Promise.resolve(null))
      : Promise.resolve(remote);
    return decodeP.then(function(remoteState){
      if (!remoteState || typeof remoteState !== "object") return local;
      remoteState = A.stripDangerousKeys ? A.stripDangerousKeys(remoteState) : remoteState;
      local.log = Object.assign({}, remoteState.log || {}, local.log || {});
      local.activities = W.mergeActivities(remoteState.activities || [], local.activities || []).list;
      return local;
    });
  }).catch(function(){ return local; });
}
function doPush(){
  readSyncFieldsIntoState();
  var pin = S.sync.pin;
  if (pin && pin.length > 0 && pin.length < 4){
    ghStatus("Die Passphrase braucht mindestens 4 Zeichen (oder das Feld leer lassen).", "err");
    return;
  }
  ghStatus("Wird hochgeladen …", "busy");
  buildSyncPayload().then(function(data){
    var prep = (pin && pin.length >= 4) ? GH.encryptPayload(data, pin) : Promise.resolve(data);
    return prep.then(function(payload){ return GH.push(S.sync, payload); });
  }).then(function(){
    S.sync.lastSync = Date.now(); saveSync();
    A.toast("Sicherung in GitHub gespeichert");
    ghStatus((pin && pin.length >= 4 ? "Verschlüsselt hochgeladen · " : "Erfolgreich hochgeladen · ") + fmtUpdated(S.sync.lastSync), "ok");
  }).catch(function(err){
    ghStatus(err.message, "err");
    A.toast("Hochladen fehlgeschlagen");
  });
}
function doPull(){
  readSyncFieldsIntoState();
  if (!confirm("Deine lokalen Daten auf diesem Gerät werden durch die Version aus GitHub ersetzt. Fortfahren?")) return;
  ghStatus("Wird heruntergeladen …", "busy");
  GH.pull(S.sync).then(function(cur){
    if (GH.isEncryptedPayload(cur.content)){
      return GH.decryptPayload(cur.content, S.sync.pin).then(function(plain){
        return {content: plain, wasEncrypted: true};
      });
    }
    return {content: cur.content, wasEncrypted: false};
  }).then(function(res){
    A.applyFullState(res.content);
    S.sync.lastSync = Date.now(); saveSync();
    A.toast("Daten aus GitHub übernommen");
    A.renderAll();
    loadWeather(false);
    ghStatus((res.wasEncrypted ? "Entschlüsselt wiederhergestellt · " : "Erfolgreich wiederhergestellt · ") + fmtUpdated(S.sync.lastSync), "ok");
  }).catch(function(err){
    ghStatus(err.message, "err");
    if (err.needsPin) A.toast("Passphrase eingeben und erneut versuchen");
    else if (err.wrongPin) A.toast("Code stimmt nicht – lokale Daten wurden nicht verändert");
    else A.toast(err.notfound ? "Noch keine Sicherung in diesem Repository" : "Herunterladen fehlgeschlagen");
  });
}
function doClear(){
  if (!confirm("Zugangsdaten für GitHub aus diesem Browser löschen?")) return;
  S.sync = {token:"", owner:"", repo:"", branch:"main", path:"trainingsblog-data.json", auto:false, pin:""};
  saveSync(); renderSyncSettings();
  A.toast("Zugangsdaten gelöscht");
}
var syncTimer = null;
function runAutoSync(){
  if (!S.sync.auto || !GH.cfgComplete(S.sync)) return;
  var pin = S.sync.pin;
  if (pin && pin.length > 0 && pin.length < 4) return; // unvollständiger Code: nicht automatisch senden
  var data = null;
  var prepared = buildSyncPayload().then(function(d){
    data = d;
    return (pin && pin.length >= 4) ? GH.encryptPayload(d, pin) : Promise.resolve(d);
  });
  ghStatus("Automatisch wird synchronisiert …", "busy");
  prepared.then(function(payload){ return GH.push(S.sync, payload); }).then(function(){
    S.sync.lastSync = Date.now(); saveSync(); renderSyncSettings();
  }).catch(function(err){ ghStatus(err.message, "err"); });
}
/* Änderungsgetrieben: kurze Verzögerung, damit nicht bei jedem Tastendruck
   synchronisiert wird. Läuft nach renderAll(), siehe APP4.after(). */
function scheduleAutoSync(){
  if (!S.sync.auto || !GH.cfgComplete(S.sync)) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(runAutoSync, 4000);
}
/* Zusätzlich stündlich, unabhängig von Änderungen – falls die App zwischen
   zwei Besuchen offen bleibt oder der änderungsgetriebene Sync verpasst
   wurde. Überspringt, wenn gerade erst synchronisiert wurde. */
var ONE_HOUR_SYNC = 3600000;
function hourlyAutoSync(){
  if (!S.sync.auto || !GH.cfgComplete(S.sync)) return;
  if (S.sync.lastSync && (Date.now() - S.sync.lastSync) < ONE_HOUR_SYNC) return;
  runAutoSync();
}
setInterval(hourlyAutoSync, 5 * 60 * 1000); // alle 5 Min prüfen, ob eine Stunde um ist

/* ============================================================
   ERSCHEINUNGSBILD-ERWEITERUNGEN: Auto-Theme, Flamme, Cool-down
   ============================================================ */
function sunTimes(){
  if (S.weatherCache && S.weatherCache.data){
    var d = WT.forecastForDate(S.weatherCache.data, S.today);
    if (d && d.sunrise && d.sunset) return {up: new Date(d.sunrise), down: new Date(d.sunset)};
  }
  return null;
}
function applyAutoTheme(){
  if (S.uiPrefs.themeMode !== "auto") return;
  var sun = sunTimes();
  var isDark;
  if (sun){ var now = new Date(); isDark = (now < sun.up || now > sun.down); }
  else { var h = new Date().getHours(); isDark = (h < 7 || h >= 20); }
  S.settings.theme = isDark ? "dark" : "light";
  A.saveSettings(); A.applyTheme();
}
function applyThemeMode(mode){
  S.uiPrefs.themeMode = mode; saveUiPrefs();
  if (mode === "auto") applyAutoTheme();
  else { S.settings.theme = (mode === "light") ? "light" : "dark"; A.saveSettings(); A.applyTheme(); }
  renderAppearance();
}
function renderAppearance(){
  if (!$("setThemeMode")) return;
  seg("setThemeMode", S.uiPrefs.themeMode);
  sw("setShowFlame", S.uiPrefs.showFlame);
  sw("setAutoCooldown", S.uiPrefs.autoCooldown);
  applyFlameVisibility();
}
function applyFlameVisibility(){
  var b = $("btnBurn");
  if (b) b.style.display = S.uiPrefs.showFlame ? "" : "none";
}
function applyFabVisibility(){
  var f = $("fabAdd");
  if (!f) return;
  f.style.display = (S.screen === "lauf" && S.uiPrefs.showFab !== false) ? "flex" : "none";
}
var GOAL_ACCENT = {erhalt:"#D97757", aufbau:"#5B8DEF", abnehmen:"#4FD1B5"};
function applyAccentPerGoal(){
  if (!S.uiPrefs.accentPerGoal) return;
  var c = GOAL_ACCENT[S.settings.goal];
  if (!c) return;
  S.colors = S.colors || {};
  S.colors.work = c;
  A.store.set("wk_colors", S.colors);
  if (window.APP3 && window.APP3.applyColors) window.APP3.applyColors();
}

/* ---------- kleine Helfer ---------- */
function seg(id, val){
  var host = $(id); if (!host) return;
  Array.prototype.forEach.call(host.children, function(b){ b.classList.toggle("on", b.dataset.v === val); });
}
function sw(id, on){ var e = $(id); if (e) e.classList.toggle("on", !!on); }

/* ============================================================
   Weitere Anpassungen: App-Name, Schriftgröße, Kalorien-Einheit,
   Start-Kategorie, Tonfall, Datenaufbewahrung
   ============================================================ */
function applyAppName(){
  var t = $("appTitle");
  if (t) t.textContent = S.uiPrefs.appName || "Training";
}
function applyFontScale(){
  var shell = document.querySelector(".shell");
  if (!shell) return;
  shell.classList.remove("fs-klein","fs-normal","fs-gross");
  shell.classList.add("fs-" + (S.uiPrefs.fontScale || "normal"));
}
function fmtCal(kcal){
  kcal = Math.round(kcal || 0);
  if (S.uiPrefs.calUnit === "kj") return Math.round(kcal * 4.184) + " kJ";
  return kcal + " kcal";
}
function calValue(kcal){
  kcal = Math.round(kcal || 0);
  return S.uiPrefs.calUnit === "kj" ? Math.round(kcal * 4.184) : kcal;
}

/* ============================================================
   "NEU IN DIESER VERSION"
   ============================================================ */
/* ============================================================
   INTERNETVERBINDUNG ANZEIGEN
   ============================================================ */
function applyNetStatus(){
  var icon = document.getElementById("netIcon");
  if (!icon) return;
  icon.classList.toggle("offline", !navigator.onLine);
}
window.addEventListener("online", applyNetStatus);
window.addEventListener("offline", applyNetStatus);

/* ============================================================
   GRANULARE RESETS PRO KATEGORIE
   ============================================================ */
function resetCategory(cat){
  if (cat === "training"){
    var d = W.normalizeSettings({});
    ["name","goal","running","level","rounds","workSec","restSec","roundRestSec","warmup","cooldown",
     "runMode","runDays","runPlan","runDistance","runDistanceCustom","restDays","trainedDays"].forEach(function(k){
      S.settings[k] = d[k];
    });
    S.settings = W.normalizeSettings(S.settings);
    A.saveSettings(); A.renderAll();
    if (window.APP2 && window.APP2.after) window.APP2.after("einst");
  } else if (cat === "koerper"){
    S.body = {}; A.store.set("wk_body", S.body);
    S.weekGoal = 0; A.store.set("wk_weekgoal", S.weekGoal);
    S.race = ""; A.store.set("wk_race", S.race);
    A.renderAll();
  } else if (cat === "wetter"){
    S.weather = {enabled:true, mode:"auto", unit:"c", lat:null, lon:null, place:"", geoStatus:"noch nicht angefragt"};
    S.weatherCache = null;
    saveWeatherSettings(); saveWeatherCache();
    renderWeatherSettings(); renderWeatherUI(); A.renderAll();
  } else if (cat === "verhalten"){
    S.settings.sound = true; S.settings.vibrate = true; S.settings.keepAwake = true; S.settings.reminder = "";
    S.uiPrefs.autoCooldown = true; S.uiPrefs.showFab = true; S.uiPrefs.tone = "neutral";
    A.saveSettings(); saveUiPrefs();
    renderMoreVerhalten(); A.renderAll();
  }
  A.toast("Kategorie zurückgesetzt");
}

function checkWhatsNew(){
  var card = $("whatsNewCard");
  if (!card) return;
  var seen = A.store.get("wk_lastSeenVersion", null);
  if (seen === null){
    // Erststart: nichts zu vergleichen, einfach als gesehen vermerken.
    A.store.set("wk_lastSeenVersion", W.APP_VERSION);
    return;
  }
  if (seen === W.APP_VERSION) return;
  // Bewusst nur die Änderungen der aktuellen (neuesten) Version zeigen,
  // nicht alle übersprungenen Versionen aufsummieren.
  var entries = (W.CHANGELOG && W.CHANGELOG[W.APP_VERSION]) || [];
  if (!entries.length){ A.store.set("wk_lastSeenVersion", W.APP_VERSION); return; }
  $("whatsNewVersion").textContent = W.APP_VERSION;
  var list = $("whatsNewList"); list.innerHTML = "";
  entries.forEach(function(t){ var li = document.createElement("li"); li.textContent = t; list.appendChild(li); });
  card.style.display = "";
}
function dismissWhatsNew(){
  $("whatsNewCard").style.display = "none";
  A.store.set("wk_lastSeenVersion", W.APP_VERSION);
}

function applyRetention(){
  var days = Number(S.uiPrefs.retentionDays) || 0;
  if (!days) return;
  var cutoff = W.addDays(S.today, -days);
  var changed = false;
  Object.keys(S.log).forEach(function(d){ if (d < cutoff){ delete S.log[d]; changed = true; } });
  var before = S.activities.length;
  S.activities = S.activities.filter(function(a){ return !a.date || a.date >= cutoff; });
  if (S.activities.length !== before) changed = true;
  if (changed){ A.saveLog(); A.saveAct(); }
}

/* ============================================================
   TONFALL DER MOTIVATIONSTEXTE
   ============================================================ */
var TONE_TEXT = {
  work: {
    neutral: "Du hast heute alle sechs Muskelgruppen trainiert. Morgen warten neue Übungen.",
    enthu: "Stark gemacht! Alle sechs Muskelgruppen sind heute drangekommen. 💪",
    sachlich: "6 von 6 Muskelgruppen trainiert. Nächste Einheit: morgen."
  },
  rest: {
    neutral: "Zwei Minuten bewusste Atmung sind erfasst. Dein Streak läuft weiter, morgen geht es normal weiter.",
    enthu: "Gönn dir die Pause – auch das ist Training! Dein Streak bleibt erhalten. 🌿",
    sachlich: "Ruhetag erfasst. Streak unverändert. Reguläres Training ab morgen."
  },
  rodeln: {
    neutral: "Rumpf, Beine, Schultern und Nacken sind aufgewärmt und mobilisiert. Der heutige Tag ist im Logbuch erledigt.",
    enthu: "Bereit für die Bahn! Rumpf, Beine, Schultern und Nacken sind aufgewärmt. 🛷",
    sachlich: "Aufwärmprogramm abgeschlossen. Tag im Logbuch erfasst."
  }
};
function toneCue(kind){
  var tone = (S.uiPrefs && S.uiPrefs.tone) || "neutral";
  var set = TONE_TEXT[kind] || TONE_TEXT.work;
  return set[tone] || set.neutral;
}

function renderMoreAppearance(){
  if (!$("setAppName")) return;
  if (document.activeElement !== $("setAppName")) $("setAppName").value = S.uiPrefs.appName || "";
  seg("setFontScale", S.uiPrefs.fontScale);
  seg("setCalUnit", S.uiPrefs.calUnit);
  $("setStartCat").value = S.uiPrefs.startCat;
  sw("setAccentPerGoal", S.uiPrefs.accentPerGoal);
}
function renderMoreVerhalten(){
  if (!$("setShowFab")) return;
  sw("setShowFab", S.uiPrefs.showFab !== false);
  seg("setTone", S.uiPrefs.tone);
  seg("setSoundStyle", S.uiPrefs.soundStyle);
  seg("setVibrationStyle", S.uiPrefs.vibrationStyle);
  sw("setCountdownBeep", S.uiPrefs.countdownBeep !== false);
  sw("setSpeech", S.uiPrefs.speechEnabled);
  if ($("setStartScreen")) $("setStartScreen").value = S.uiPrefs.startScreen || "heute";
  renderCustomQuotes();
  if ($("setGymRest")){
    $("setGymRest").value = S.uiPrefs.gymRestSeconds || 90;
    $("gymRestLabel").textContent = (S.uiPrefs.gymRestSeconds || 90) + " Sekunden";
    sw("setGymWarmup", !!S.uiPrefs.gymWarmupSets);
  }
  sw("setReduceMotion", !!S.uiPrefs.reduceMotion);
}
function renderCustomQuotes(){
  var host = $("customQuotesList");
  if (!host) return;
  host.innerHTML = "";
  var list = S.uiPrefs.customQuotes || [];
  if (!list.length){
    host.appendChild(el("p","muted","Noch keine eigenen Zitate hinzugefügt."));
    return;
  }
  list.forEach(function(q, i){
    var row = el("div","widget-check-row");
    row.innerHTML = "<div class='wl'>" + esc(q) + "</div>";
    var x = el("button","x","✕");
    x.onclick = function(){
      S.uiPrefs.customQuotes.splice(i,1); saveUiPrefs(); renderCustomQuotes();
    };
    row.appendChild(x);
    host.appendChild(row);
  });
}
function renderMoreDaten(){
  if ($("setRetention")) $("setRetention").value = String(S.uiPrefs.retentionDays || 0);
}

/* ============================================================
   Bindings
   ============================================================ */
function bind(){
  $("setCatBar").addEventListener("click", function(e){
    var b = e.target.closest(".catchip"); if (b) setCat(b.dataset.cat);
  });
  $("setSearch").addEventListener("input", function(e){ renderSearchResults(e.target.value); });
  var wnClose = $("whatsNewClose");
  if (wnClose) wnClose.addEventListener("click", dismissWhatsNew);
  ["training","koerper","wetter","verhalten"].forEach(function(cat){
    var b = $("resetCat" + cat.charAt(0).toUpperCase() + cat.slice(1));
    if (b) b.addEventListener("click", function(){
      if (confirm("Diese Kategorie auf die Standardwerte zurücksetzen?")) resetCategory(cat);
    });
  });
  var cexModeEl = $("customExMode");
  if (cexModeEl) cexModeEl.addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    Array.prototype.forEach.call(cexModeEl.children, function(x){ x.classList.toggle("on", x === b); });
    $("customExValLabel").textContent = b.dataset.v === "time" ? "Sekunden" : "Wiederholungen";
  });
  var btnCexAdd = $("btnCustomExAdd");
  if (btnCexAdd) btnCexAdd.addEventListener("click", function(){
    var name = $("customExName").value.trim();
    var val = Number($("customExVal").value);
    if (!name){ A.toast("Bitte einen Namen eingeben"); return; }
    if (!val || val <= 0){ A.toast("Bitte einen gültigen Zielwert eingeben"); return; }
    var modeBtn = cexModeEl.querySelector("button.on");
    var mode = modeBtn ? modeBtn.dataset.v : "reps";
    var nextId = 9000 + S.customExercises.length;
    while (S.customExercises.some(function(e){ return e.id === nextId; })) nextId++;
    S.customExercises.push({
      id: nextId, g: $("customExGroup").value, n: name.slice(0,60), m: mode,
      v: Math.round(val), l: 2, c: $("customExDesc").value.trim().slice(0,300) || "Eigene Übung."
    });
    A.store.set("wk_custom_ex", S.customExercises);
    W.setCustomExercises(S.customExercises);
    $("customExName").value = ""; $("customExVal").value = ""; $("customExDesc").value = "";
    renderCustomExList();
    A.toast("Eigene Übung gespeichert");
  });
  renderCustomExList();
  function renderCustomExList(){
    var host = $("customExList");
    if (!host) return;
    host.innerHTML = "";
    if (!S.customExercises.length){
      host.appendChild(el("p","muted","Noch keine eigenen Übungen angelegt."));
      return;
    }
    S.customExercises.forEach(function(ex){
      var r = el("div","widget-check-row");
      r.innerHTML = "<div class='wl'><b>" + esc(ex.n) + "</b><br><span class='tiny'>" + esc(W.GROUP_LABEL[ex.g]||ex.g) + " · " + ex.v + (ex.m==="time"?"s":"×") + "</span></div>";
      var del = el("button","x","✕");
      del.onclick = function(){
        S.customExercises = S.customExercises.filter(function(e2){ return e2.id !== ex.id; });
        A.store.set("wk_custom_ex", S.customExercises);
        W.setCustomExercises(S.customExercises);
        renderCustomExList();
        A.toast("Eigene Übung gelöscht");
      };
      r.appendChild(del);
      host.appendChild(r);
    });
  }
  $("syncMethod").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    syncMethod = b.dataset.v;
    A.store.set("wk_syncmethod", syncMethod);
    renderSyncMethod();
  });

  // Wetter
  $("setWeatherOn").addEventListener("click", function(){
    S.weather.enabled = !S.weather.enabled; saveWeatherSettings();
    renderWeatherSettings(); renderWeatherUI();
    if (S.weather.enabled) ensureWeatherFresh();
  });
  $("setWeatherMode").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.weather.mode = b.dataset.v; saveWeatherSettings(); renderWeatherSettings();
  });
  $("btnWeatherLocate").addEventListener("click", function(){
    locateAuto().then(function(){ renderWeatherSettings(); loadWeather(true); A.toast("Standort erkannt"); })
      .catch(function(err){ A.toast(err.message); });
  });
  $("btnWeatherSearch").addEventListener("click", function(){
    var v = $("weatherCity").value.trim();
    if (v) searchCity(v);
  });
  $("weatherCity").addEventListener("keydown", function(e){
    if (e.key === "Enter" && $("weatherCity").value.trim()) searchCity($("weatherCity").value.trim());
  });
  $("setWeatherUnit").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.weather.unit = b.dataset.v; saveWeatherSettings(); renderWeatherSettings();
    loadWeather(true);
  });
  $("btnWeatherRefresh").addEventListener("click", function(){ loadWeather(true); A.toast("Wetter wird aktualisiert"); });

  // Erscheinungsbild
  $("setThemeMode").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    applyThemeMode(b.dataset.v);
  });
  $("setShowFlame").addEventListener("click", function(){
    S.uiPrefs.showFlame = !S.uiPrefs.showFlame; saveUiPrefs(); renderAppearance();
  });
  $("setAppName").addEventListener("input", function(){
    S.uiPrefs.appName = $("setAppName").value.slice(0, 24); saveUiPrefs(); applyAppName();
  });
  $("setFontScale").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.uiPrefs.fontScale = b.dataset.v; saveUiPrefs(); applyFontScale(); renderMoreAppearance();
  });
  $("setCalUnit").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.uiPrefs.calUnit = b.dataset.v; saveUiPrefs(); renderMoreAppearance();
    A.renderAll();
  });
  $("setStartCat").addEventListener("change", function(){
    S.uiPrefs.startCat = $("setStartCat").value; saveUiPrefs();
  });
  $("setTone").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.uiPrefs.tone = b.dataset.v; saveUiPrefs(); renderMoreVerhalten();
  });
  $("setRetention").addEventListener("change", function(){
    S.uiPrefs.retentionDays = Number($("setRetention").value); saveUiPrefs();
    applyRetention(); A.renderAll();
    A.toast(S.uiPrefs.retentionDays ? "Datenaufbewahrung gesetzt" : "Unbegrenzt gespeichert");
  });
  $("setShowFab").addEventListener("click", function(){
    S.uiPrefs.showFab = !S.uiPrefs.showFab; saveUiPrefs(); renderMoreVerhalten(); applyFabVisibility();
  });
  $("setSoundStyle").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.uiPrefs.soundStyle = b.dataset.v; saveUiPrefs(); renderMoreVerhalten();
    if (window.APP && window.APP.beep) window.APP.beep(660, 140);
  });
  $("setVibrationStyle").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.uiPrefs.vibrationStyle = b.dataset.v; saveUiPrefs(); renderMoreVerhalten();
    if (window.APP && window.APP.buzz) window.APP.buzz(40);
  });
  $("setCountdownBeep").addEventListener("click", function(){
    S.uiPrefs.countdownBeep = S.uiPrefs.countdownBeep === false; saveUiPrefs(); renderMoreVerhalten();
  });
  $("setSpeech").addEventListener("click", function(){
    S.uiPrefs.speechEnabled = !S.uiPrefs.speechEnabled; saveUiPrefs(); renderMoreVerhalten();
    if (S.uiPrefs.speechEnabled && window.speechSynthesis){
      try{ var u = new SpeechSynthesisUtterance("Sprachausgabe aktiviert"); u.lang = "de-DE"; window.speechSynthesis.speak(u); }catch(e){}
    }
  });
  $("setReduceMotion").addEventListener("click", function(){
    S.uiPrefs.reduceMotion = !S.uiPrefs.reduceMotion; saveUiPrefs(); renderMoreVerhalten();
    document.documentElement.classList.toggle("reduce-motion", S.uiPrefs.reduceMotion);
  });
  $("setStartScreen").addEventListener("change", function(){
    S.uiPrefs.startScreen = $("setStartScreen").value; saveUiPrefs();
  });
  var setBtnHr = $("setBtnHrConnect");
  if (setBtnHr) setBtnHr.addEventListener("click", function(){
    if (setBtnHr.classList.contains("connected")) A.disconnectHr();
    else A.connectHr();
  });
  $("btnAddQuote").addEventListener("click", function(){
    var v = $("setQuoteInput").value.trim();
    if (!v){ A.toast("Bitte zuerst ein Zitat eingeben"); return; }
    if (v.length > 140){ A.toast("Bitte kürzer als 140 Zeichen"); return; }
    S.uiPrefs.customQuotes = S.uiPrefs.customQuotes || [];
    S.uiPrefs.customQuotes.push(v);
    saveUiPrefs(); $("setQuoteInput").value = ""; renderCustomQuotes();
    A.toast("Zitat hinzugefügt");
  });
  var setGymRestEl = $("setGymRest");
  if (setGymRestEl) setGymRestEl.addEventListener("input", function(){
    S.uiPrefs.gymRestSeconds = Number(setGymRestEl.value);
    $("gymRestLabel").textContent = S.uiPrefs.gymRestSeconds + " Sekunden";
    saveUiPrefs();
  });
  var setGymWarmupEl = $("setGymWarmup");
  if (setGymWarmupEl) setGymWarmupEl.addEventListener("click", function(){
    S.uiPrefs.gymWarmupSets = !S.uiPrefs.gymWarmupSets;
    saveUiPrefs(); renderMoreVerhalten();
  });
  $("setAccentPerGoal").addEventListener("click", function(){
    S.uiPrefs.accentPerGoal = !S.uiPrefs.accentPerGoal; saveUiPrefs(); renderMoreAppearance();
    if (S.uiPrefs.accentPerGoal) applyAccentPerGoal();
  });
  $("setAutoCooldown").addEventListener("click", function(){
    S.uiPrefs.autoCooldown = !S.uiPrefs.autoCooldown; saveUiPrefs(); renderAppearance();
  });

  // Cloud-Sync
  ["ghToken","ghOwner","ghRepo","ghBranch","ghPath","ghPin"].forEach(function(id){
    $(id).addEventListener("change", readSyncFieldsIntoState);
  });
  $("ghPin").addEventListener("input", function(){
    S.sync.pin = $("ghPin").value.trim(); // Leerzeichen INNERHALB der Passphrase bleiben erhalten (mehrere Wörter), nur am Rand entfernen
    var pinLen = S.sync.pin.length;
    if (pinLen === 0) $("ghPinHint").textContent = "Keine Verschlüsselung – die Sicherung ist für jeden mit Repository-Zugriff lesbar.";
    else if (pinLen < 4) $("ghPinHint").textContent = "Noch zu kurz – mindestens 4 Zeichen nötig, sonst wird unverschlüsselt hochgeladen.";
    else if (pinLen < 6) $("ghPinHint").textContent = "Verschlüsselung aktiv. Eine längere Passphrase (mehrere Wörter) ist deutlich sicherer als ein kurzer Code.";
    else $("ghPinHint").textContent = "Verschlüsselung aktiv.";
  });
  $("ghPinShow").addEventListener("click", function(){
    var f = $("ghPin");
    f.type = (f.type === "password") ? "text" : "password";
  });
  $("ghTokenShow").addEventListener("click", function(){
    var f = $("ghToken");
    f.type = (f.type === "password") ? "text" : "password";
  });
  $("ghAutoSync").addEventListener("click", function(){
    S.sync.auto = !S.sync.auto; saveSync(); renderSyncSettings();
    A.toast(S.sync.auto ? "Automatischer Sync aktiv" : "Automatischer Sync deaktiviert");
  });
  $("ghTest").addEventListener("click", doTestConnection);
  $("ghPush").addEventListener("click", doPush);
  $("ghPull").addEventListener("click", doPull);
  var appUpdateFileEl = $("appUpdateFile");
  var selectedUpdateFile = null;
  if (appUpdateFileEl) appUpdateFileEl.addEventListener("change", function(){
    selectedUpdateFile = appUpdateFileEl.files && appUpdateFileEl.files[0] ? appUpdateFileEl.files[0] : null;
    var st = $("appUpdateStatus");
    if (!selectedUpdateFile){ st.textContent = "Noch keine Datei ausgewählt."; return; }
    var kb = Math.round(selectedUpdateFile.size / 1024);
    st.textContent = "Ausgewählt: " + selectedUpdateFile.name + " (" + kb + " KB)";
  });
  var btnAppUpdateEl = $("btnAppUpdate");
  if (btnAppUpdateEl) btnAppUpdateEl.addEventListener("click", function(){
    var st = $("appUpdateStatus");
    if (!selectedUpdateFile){ st.textContent = "Bitte zuerst eine Datei auswählen."; return; }
    if (!GH.cfgComplete(S.sync)){ st.textContent = "Bitte zuerst Zugriffsschlüssel, Konto und Repository oben eintragen."; return; }
    var reader = new FileReader();
    reader.onload = function(){
      var text = String(reader.result || "");
      if (!/<html[\s>]|<!doctype html/i.test(text.slice(0, 1000))){
        st.textContent = "Diese Datei sieht nicht nach einer gültigen HTML-Seite aus – Vorgang abgebrochen.";
        return;
      }
      if (!confirm("Die aktuelle App-Datei in deinem Repository wird durch diese neue Version ersetzt. Fortfahren?")) return;
      st.textContent = "Wird hochgeladen …";
      GH.pushRawFile(S.sync, "index.html", text).then(function(){
        st.textContent = "✅ Hochgeladen. Lade die Training-App in ein bis zwei Minuten neu, um die neue Version zu sehen.";
        A.toast("App-Update hochgeladen");
        appUpdateFileEl.value = "";
        selectedUpdateFile = null;
      }).catch(function(err){
        st.textContent = "Fehlgeschlagen: " + (err && err.message ? err.message : "unbekannter Fehler");
      });
    };
    reader.readAsText(selectedUpdateFile);
  });
  $("ghClear").addEventListener("click", doClear);
  var btnCheckUpdateEl = $("btnCheckUpdate");
  if (btnCheckUpdateEl) btnCheckUpdateEl.addEventListener("click", function(){
    var st = $("checkUpdateStatus");
    if (!GH.cfgComplete(S.sync)){
      st.textContent = "Bitte zuerst unter Cloud-Sync Zugriffsschlüssel, Konto und Repository eintragen.";
      return;
    }
    st.textContent = "Prüfe bei GitHub …";
    btnCheckUpdateEl.disabled = true;
    GH.getRawFile(S.sync, "index.html").then(function(res){
      if (!res.exists){
        st.textContent = "Keine index.html im Repository gefunden.";
        return;
      }
      var text = GH.b64decode(res.raw.content);
      var m = text.match(/var APP_VERSION\s*=\s*"([\d.]+)"/);
      if (!m){
        st.textContent = "Version in der Datei bei GitHub konnte nicht erkannt werden.";
        return;
      }
      var remoteVersion = m[1];
      var cmp = compareVersions(remoteVersion, W.APP_VERSION);
      if (cmp <= 0){
        st.textContent = "Du hast bereits die neueste Version (" + W.APP_VERSION + ").";
        return;
      }
      st.textContent = "Neue Version " + remoteVersion + " gefunden (bisher " + W.APP_VERSION + ") – wird geladen …";
      applyRemoteUpdate(text);
    }).catch(function(err){
      st.textContent = "Fehlgeschlagen: " + (err && err.message ? err.message : "unbekannter Fehler");
    }).finally(function(){
      btnCheckUpdateEl.disabled = false;
    });
  });
}

/* Vergleicht zwei Versionsnummern nach dem Muster "2.18.0": gibt 1 zurück,
   wenn a neuer ist als b, -1 wenn älter, 0 wenn gleich. Fehlt ein Teil
   (z. B. "2.18" statt "2.18.0"), zählt er als 0. */
function compareVersions(a, b){
  var pa = String(a).split(".").map(Number);
  var pb = String(b).split(".").map(Number);
  var len = Math.max(pa.length, pb.length);
  for (var i = 0; i < len; i++){
    var na = pa[i] || 0, nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}
/* Übernimmt eine neu bei GitHub gefundene Version direkt: der Service
   Worker (falls vorhanden) wird zurückgesetzt, damit er die neue Datei
   nicht durch eine noch zwischengespeicherte alte Version ersetzt, und
   die Seite lädt danach frisch von der echten Adresse neu. Es wird
   bewusst kein document.write() mit dem heruntergeladenen Text verwendet
   – ein echter Neuladevorgang von der tatsächlichen Adresse ist
   zuverlässiger und stellt sicher, dass Skripte & Manifest sauber neu
   initialisiert werden. */
function applyRemoteUpdate(){
  var clearAndReload = function(){
    location.reload();
  };
  if ("serviceWorker" in navigator){
    navigator.serviceWorker.getRegistrations().then(function(regs){
      var caches_ = window.caches ? caches.keys().then(function(keys){
        return Promise.all(keys.map(function(k){ return caches.delete(k); }));
      }) : Promise.resolve();
      Promise.all(regs.map(function(r){ return r.unregister(); }).concat([caches_])).then(clearAndReload).catch(clearAndReload);
    }).catch(clearAndReload);
  } else {
    clearAndReload();
  }
}

/* ---------- Hook aus ui.js ----------
   renderAll() läuft nach praktisch jeder Zustandsänderung (Training
   abgeschlossen, Aktivität gespeichert, Einstellung geändert, …). Der
   automatische Sync hängt sich hier ein statt einzelne Speicherfunktionen
   zu umschreiben: robuster, weil kein Aufrufpfad vergessen werden kann,
   und durch das Debouncing in scheduleAutoSync() trotzdem sparsam. */
window.APP4 = {
  after: function(screen){
    if (screen === "einst"){
      renderWeatherSettings(); renderSyncSettings(); renderAppearance();
      renderSyncMethod(); renderMoreAppearance(); renderMoreVerhalten(); renderMoreDaten();
      if (window.APP2 && window.APP2.renderStorage) window.APP2.renderStorage();
      if ($("setVersion")) $("setVersion").textContent = window.SGVersion || W.APP_VERSION || "–";
    }
    if (screen === "heute") renderWeatherToday();
    if (screen === "kalender"){ renderWeatherStrip(); decorateCalendarGrid(); }
    scheduleAutoSync();
  },
  decorateCalendarGrid: decorateCalendarGrid,
  decorateSheet: decorateSheet,
  loadWeather: loadWeather,
  runAutoSync: runAutoSync,
  fmtCal: fmtCal,
  calValue: calValue,
  toneCue: toneCue,
  applyAccentPerGoal: applyAccentPerGoal,
  hourlyAutoSync: hourlyAutoSync,
  hardReset: function(){
    S.weather = {enabled:true, mode:"auto", unit:"c", lat:null, lon:null, place:"", geoStatus:"noch nicht angefragt"};
    S.weatherCache = null;
    S.sync = {token:"", owner:"", repo:"", branch:"main", path:"trainingsblog-data.json", auto:false};
    S.uiPrefs = {};
    (function(){
      var d = {themeMode:"dark", showFlame:true, autoCooldown:true,
        appName:"", fontScale:"normal", calUnit:"kcal", startCat:"training", tone:"neutral", retentionDays:0};
      for (var k in d) S.uiPrefs[k] = d[k];
    })();
    saveWeatherSettings(); saveWeatherCache(); saveSync(); saveUiPrefs();
    renderWeatherSettings(); renderSyncSettings(); renderAppearance();
    renderWeatherUI();
    applyFlameVisibility();
    applyAppName(); applyFontScale();
  }
};

bind();
applyFlameVisibility();
applyAppName();
applyFontScale();
applyRetention();
checkWhatsNew();
applyNetStatus();
if (S.uiPrefs.themeMode === "auto") applyAutoTheme();
if (weatherReady()) loadWeather(false);
setInterval(ensureWeatherFresh, 5 * 60 * 1000);
setInterval(function(){ if (S.uiPrefs.themeMode === "auto") applyAutoTheme(); }, 10 * 60 * 1000);
if ($("setCatBar") && S.uiPrefs.startCat && S.uiPrefs.startCat !== "training") setCat(S.uiPrefs.startCat);
if (S.uiPrefs.startScreen && S.uiPrefs.startScreen !== "heute" && !S.shortcutNav && A.switchTab) A.switchTab(S.uiPrefs.startScreen);
// applySkin() lief bereits vorher (in ui2.js) einmal, aber zu diesem
// Zeitpunkt existierte S.uiPrefs (Akzentfarbe, Bewegung reduzieren) noch
// nicht. Jetzt, wo es sicher gesetzt ist, noch einmal korrekt anwenden.
if (window.APP2 && window.APP2.applySkin) window.APP2.applySkin();
A.renderAll();
})();
