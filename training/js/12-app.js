/* ============================================================
   MODULE: Aktivitäts-Editor, Multisport, Dehnen,
           variable Lauftage, Farbwähler, Erledigt-Zustand
   ============================================================ */
(function(){
"use strict";
var A = window.APP, W = window.WK, OS = window.OS;
var S = A.S, $ = A.$, el = A.el, esc = A.esc, row = A.row;

/* ============================================================
   MODUL 6 – Farb-Engine
   ============================================================ */
var COLOR_KEYS = [
  ["work",  "Hauptakzent",     "Glut – Ringe, Buttons, Hinweise", "#D97757"],
  ["run",   "Sekundärakzent",  "Eisblau – Lauf und Ruhe",         "#9CBCDE"],
  ["roundrest","Tertiärakzent","Violett – erfüllte Woche",        "#BF5AF2"],
  ["bg",    "Hintergrund",     "Seitenhintergrund",               "#0A0A0A"],
  ["panel", "Kartenfarbe",     "Flächen und Karten",              "#141414"],
  ["text",  "Haupttext",       "",                                "#F2F2F2"],
  ["text-dim","Sekundärtext",  "",                                "#B4B4B4"]
];
function hexToRgb(h){
  h = String(h).replace("#","");
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function mix(hex, withHex, amount){
  var a = hexToRgb(hex), b = hexToRgb(withHex);
  var r = a.map(function(v,i){ return Math.round(v*(1-amount) + b[i]*amount); });
  return "#" + r.map(function(v){ return ("0"+v.toString(16)).slice(-2); }).join("");
}
function applyColors(){
  var c = S.colors || {};
  var root = document.documentElement;
  COLOR_KEYS.forEach(function(k){
    var v = c[k[0]];
    if (!v) { root.style.removeProperty("--" + k[0]); return; }
    root.style.setProperty("--" + k[0], v);
  });
  // abgeleitete Flächen mitziehen, damit Kontraste erhalten bleiben
  if (c.bg){
    root.style.setProperty("--panel-2", mix(c.panel || "#141414", c.bg, 0.35));
    root.style.setProperty("--panel-3", mix(c.panel || "#141414", "#FFFFFF", 0.06));
  }
  if (c.work)  root.style.setProperty("--work-dim", mix(c.work, c.bg || "#0A0A0A", 0.82));
  if (c.run)   root.style.setProperty("--run-dim", mix(c.run, c.bg || "#0A0A0A", 0.86));
  if (c.roundrest) root.style.setProperty("--roundrest-dim", mix(c.roundrest, c.bg || "#0A0A0A", 0.86));
  if (c["text-dim"]) root.style.setProperty("--text-faint", mix(c["text-dim"], c.bg || "#0A0A0A", 0.28));
}
function renderColorRows(){
  var host = $("colorRows");
  if (!host) return;
  host.innerHTML = "";
  COLOR_KEYS.forEach(function(k){
    var r = el("div","colorrow");
    r.appendChild(el("div","lab","<b>"+k[1]+"</b>"+(k[2] ? "<span>"+esc(k[2])+"</span>" : "")));
    var i = document.createElement("input");
    i.type = "color";
    i.value = (S.colors && S.colors[k[0]]) || k[3];
    i.addEventListener("input", function(){
      S.colors = S.colors || {};
      S.colors[k[0]] = i.value;
      applyColors();
    });
    i.addEventListener("change", function(){
      A.store.set("wk_colors", S.colors);
      A.toast("Farbe gespeichert");
    });
    r.appendChild(i);
    host.appendChild(r);
  });
}
function resetColors(){
  S.colors = {};
  A.store.set("wk_colors", S.colors);
  COLOR_KEYS.forEach(function(k){ document.documentElement.style.removeProperty("--" + k[0]); });
  ["panel-2","panel-3","work-dim","run-dim","roundrest-dim","text-faint"].forEach(function(v){
    document.documentElement.style.removeProperty("--" + v);
  });
  renderColorRows();
  A.toast("Standardfarben wiederhergestellt");
}

/* ============================================================
   MODUL 4 – Lauftage: fester Rhythmus oder freie Woche
   ============================================================ */
var DAY_ORDER = [1,2,3,4,5,6,0];
function renderRunDays(){
  var fixed = $("setRunDays"), varHost = $("setRunPlan");
  if (!fixed) return;
  var mode = S.settings.runMode;
  Array.prototype.forEach.call($("setRunMode").children, function(b){
    b.classList.toggle("on", b.dataset.v === mode);
  });
  $("rowRunFixed").style.display = (mode === "fest") ? "" : "none";
  $("rowRunVar").style.display   = (mode === "variabel") ? "" : "none";

  fixed.innerHTML = "";
  DAY_ORDER.forEach(function(d){
    var b = el("button", (S.settings.runDays.indexOf(d) >= 0 ? "on" : ""), A.DAYS_SHORT[d]);
    b.onclick = function(){
      var list = S.settings.runDays.slice();
      var i = list.indexOf(d);
      if (i >= 0){ if (list.length > 1) list.splice(i,1); else { A.toast("Mindestens ein Lauftag"); return; } }
      else list.push(d);
      S.settings.runDays = list;
      S.settings = W.normalizeSettings(S.settings);
      A.saveSettings(); renderRunDays(); A.renderAll();
    };
    fixed.appendChild(b);
  });

  var mon = W.weekMonday(S.today);
  var plan = S.settings.runPlan[mon] || [];
  $("varWeekLabel").textContent = "Woche ab " + W.parseYmd(mon).getDate() + "." + (W.parseYmd(mon).getMonth()+1) + ". · " +
    (plan.length ? plan.length + " Lauftag" + (plan.length > 1 ? "e" : "") : "noch nichts geplant");
  varHost.innerHTML = "";
  for (var i = 0; i < 7; i++){
    (function(i){
      var ds = W.addDays(mon, i);
      var d = W.parseYmd(ds);
      var b = el("button", (plan.indexOf(ds) >= 0 ? "on" : ""),
        A.DAYS_SHORT[d.getDay()] + "<small>" + d.getDate() + ".</small>");
      b.onclick = function(){
        var list = (S.settings.runPlan[mon] || []).slice();
        var k = list.indexOf(ds);
        if (k >= 0) list.splice(k,1); else list.push(ds);
        list.sort();
        S.settings.runPlan[mon] = list;
        A.saveSettings(); renderRunDays(); A.renderAll();
      };
      varHost.appendChild(b);
    })(i);
  }
}
function renderRestDaySettings(){
  var host = $("setRestDays");
  if (!host) return;
  host.innerHTML = "";
  DAY_ORDER.forEach(function(d){
    var b = el("button", (S.settings.restDays.indexOf(d) >= 0 ? "on" : ""), A.DAYS_SHORT[d]);
    b.onclick = function(){
      var list = S.settings.restDays.slice();
      var i = list.indexOf(d);
      if (i >= 0) list.splice(i,1); else list.push(d);
      S.settings.restDays = list;
      S.settings = W.normalizeSettings(S.settings);
      A.saveSettings(); renderRestDaySettings(); renderTrainedDaySettings(); A.renderAll();
      A.toast(i >= 0 ? "Ruhetag entfernt" : "Ruhetag festgelegt");
    };
    host.appendChild(b);
  });
}
function renderTrainedDaySettings(){
  var host = $("setTrainedDays");
  if (!host) return;
  host.innerHTML = "";
  DAY_ORDER.forEach(function(d){
    var b = el("button", (S.settings.trainedDays.indexOf(d) >= 0 ? "on" : ""), A.DAYS_SHORT[d]);
    b.onclick = function(){
      var list = S.settings.trainedDays.slice();
      var i = list.indexOf(d);
      if (i >= 0) list.splice(i,1); else list.push(d);
      S.settings.trainedDays = list;
      S.settings = W.normalizeSettings(S.settings);
      A.saveSettings(); renderTrainedDaySettings(); A.renderAll();
      A.toast(i >= 0 ? "'Schon trainiert'-Tag entfernt" : "'Schon trainiert'-Tag festgelegt");
    };
    host.appendChild(b);
  });
}

/* ============================================================
   MODUL 2 – Multisport: erfassen und bearbeiten
   ============================================================ */
var sportState = {sportId:null, editing:null};
function openSportDialog(activity){
  sportState.editing = activity || null;
  $("sportTitle").textContent = activity ? "Einheit bearbeiten" : "Einheit hinzufügen";
  $("sportDelete").style.display = activity ? "" : "none";
  if (activity){
    sportState.sportId = W.sportForActivity(activity).id;
    showSportForm(activity);
  } else {
    sportState.sportId = null;
    $("sportPickWrap").style.display = "";
    $("sportFormWrap").style.display = "none";
    $("sportSearch").value = "";
    renderSportList("");
  }
  openDlg("dlgSport");
}
function renderSportList(q){
  var host = $("sportList");
  host.innerHTML = "";
  var term = String(q||"").toLowerCase();
  var list = W.SPORTS.filter(function(s){ return !term || s.n.toLowerCase().indexOf(term) >= 0; });
  if (!list.length){ host.appendChild(el("p","muted","Keine Sportart gefunden.")); return; }
  list.forEach(function(sp){
    var b = el("button","sportitem",
      "<i></i><b>" + esc(sp.n) + "</b><span>" + sp.f.length + " Felder</span>");
    b.dataset.sport = sp.id;
    b.onclick = function(){ sportState.sportId = sp.id; showSportForm(null); };
    host.appendChild(b);
  });
}
function showSportForm(activity){
  var sp = W.sportById(sportState.sportId);
  $("sportPickWrap").style.display = "none";
  $("sportFormWrap").style.display = "";
  $("sportName").textContent = sp.n;
  $("sportKind").textContent = "Kategorie: " + sp.kind + " · MET " + sp.met;
  var now = new Date();
  $("sportDate").value = (activity && activity.date) || S.today;
  $("sportTime").value = (activity && activity.startTime) ||
    (String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0"));

  var host = $("sportFields"); host.innerHTML = "";
  sp.f.forEach(function(key){
    var def = W.FIELD[key];
    if (!def) return;
    var r = el("div","fieldrow");
    r.appendChild(el("label", null, esc(def.n) + (def.u ? "<small>" + esc(def.u) + "</small>" : "")));
    var i = document.createElement("input");
    i.type = def.t; i.id = "f_" + key;
    if (def.step) i.step = def.step;
    if (def.ph) i.placeholder = def.ph;
    if (def.ro) i.readOnly = true;
    i.value = activity ? fieldValue(activity, key) : "";
    i.addEventListener("input", recalc);
    r.appendChild(i);
    host.appendChild(r);
  });
  recalc();
}
function fieldValue(a, key){
  switch(key){
    case "dist":  return a.distanceKm ? a.distanceKm : "";
    case "dur":   return a.durationSec ? W.fmtTime(a.durationSec) : "";
    case "pace":  return (a.distanceKm && a.durationSec) ? W.fmtPace(a.durationSec/a.distanceKm).replace(" min/km","") : "";
    case "speed": return (a.distanceKm && a.durationSec) ? Math.round(a.distanceKm/(a.durationSec/3600)*10)/10 : "";
    case "elev":  return a.elev || "";
    case "hr":    return a.avgHr || "";
    case "hrmax": return a.maxHr || "";
    case "cal":   return a.calories || "";
    case "steps": return a.steps || "";
    default:      return (a.extra && a.extra[key] != null) ? a.extra[key] : "";
  }
}
function parseDur(v){
  var str = String(v||"").trim();
  if (!str) return 0;
  var p = str.split(":").map(function(x){ return parseFloat(x)||0; });
  if (p.length === 3) return p[0]*3600 + p[1]*60 + p[2];
  if (p.length === 2) return p[0]*60 + p[1];
  return p[0]*60;
}
function recalc(){
  var dist = parseFloat(($("f_dist")||{}).value) || 0;
  var dur = parseDur(($("f_dur")||{}).value);
  if ($("f_pace") && dist > 0 && dur > 0) $("f_pace").value = W.fmtPace(dur/dist).replace(" min/km","");
  if ($("f_speed") && dist > 0 && dur > 0) $("f_speed").value = Math.round(dist/(dur/3600)*10)/10;
  var sp = W.sportById(sportState.sportId);
  var b = OS.burnFor(sp.kind === "lauf" ? "lauf" : sp.kind === "rad" ? "rad" : "kraft",
                     dur/60, S.body, dist && dur ? dist/(dur/3600) : 0);
  var manual = parseFloat(($("f_cal")||{}).value) || 0;
  $("sportCalc").textContent = dur > 0
    ? "Geschätzt " + Math.round(sp.met * 3.5 * (OS.normalizeBody(S.body).weightKg/200) * (dur/60)) +
      " kcal bei MET " + sp.met + (manual ? " · du hast " + manual + " kcal eingetragen" : "")
    : "Trage eine Dauer ein, dann rechne ich die Kalorien mit.";
}
function collectSport(){
  var sp = W.sportById(sportState.sportId);
  var dist = parseFloat(($("f_dist")||{}).value) || 0;
  var dur = parseDur(($("f_dur")||{}).value);
  var body = OS.normalizeBody(S.body);
  var cal = parseFloat(($("f_cal")||{}).value) || 0;
  if (!cal && dur > 0) cal = Math.round(sp.met * 3.5 * (body.weightKg/200) * (dur/60));
  var extra = {};
  ["cad","pow","sets","reps","load","muscles","pool","swolf","stroke","shoe","note"].forEach(function(k){
    var f = $("f_" + k);
    if (f && f.value !== "") extra[k] = f.value;
  });
  return {
    date: $("sportDate").value || S.today,
    startTime: $("sportTime").value || "",
    name: (extra.note && String(extra.note).slice(0,40)) || sp.n,
    type: sp.n, rawType: sp.n, sportId: sp.id,
    distanceKm: Math.round(dist*100)/100,
    durationSec: Math.round(dur),
    calories: Math.round(cal),
    steps: Math.round(parseFloat(($("f_steps")||{}).value) || 0),
    avgHr: Math.round(parseFloat(($("f_hr")||{}).value) || 0),
    maxHr: Math.round(parseFloat(($("f_hrmax")||{}).value) || 0),
    elev: Math.round(parseFloat(($("f_elev")||{}).value) || 0),
    extra: extra,
    source: "manuell"
  };
}
function saveSport(){
  var a = collectSport();
  if (!a.durationSec && !a.distanceKm){ A.toast("Dauer oder Distanz eintragen"); return; }
  if (sportState.editing){
    var i = S.activities.indexOf(sportState.editing);
    if (i >= 0) S.activities[i] = a; else S.activities.unshift(a);
  } else {
    S.activities.unshift(a);
  }
  S.activities.sort(function(x,y){ return x.date < y.date ? 1 : x.date > y.date ? -1 : 0; });
  A.saveAct();
  closeDlg("dlgSport");
  recalcEverything();
  A.toast(sportState.editing ? "Einheit aktualisiert" : "Einheit gespeichert");
  sportState.editing = null;
}
function deleteSport(){
  if (!sportState.editing) return;
  if (!confirm("Diese Einheit wirklich löschen? Wochenumfänge, Ringe und der Readiness-Wert werden neu berechnet.")) return;
  S.activities = S.activities.filter(function(x){ return x !== sportState.editing; });
  A.saveAct();
  closeDlg("dlgSport");
  sportState.editing = null;
  recalcEverything();
  A.toast("Einheit gelöscht, alles neu berechnet");
}
function recalcEverything(){
  if (window.APP2 && window.APP2.invalidate) window.APP2.invalidate();
  A.renderAll();
  renderSportLog();
}
function renderSportLog(){
  var host = $("sportLog");
  if (!host) return;
  host.innerHTML = "";
  var list = S.activities.slice(0, 8);
  $("sportLogCount").textContent = S.activities.length;
  if (!list.length){ host.appendChild(el("p","muted","Noch nichts erfasst. Tippe unten rechts auf das Plus.")); return; }
  list.forEach(function(a){
    var sp = W.sportForActivity(a);
    var d = W.parseYmd(a.date);
    var r = el("div","act");
    r.appendChild(el("div","n","<b>" + esc(sp.n) + "</b><span>" + d.getDate() + "." + (d.getMonth()+1) + ". · " +
      (a.distanceKm ? a.distanceKm + " km · " : "") + (a.durationSec ? W.fmtTime(a.durationSec) : "") + "</span>"));
    var e = el("button","edit","✎");
    e.onclick = function(){ openSportDialog(a); };
    r.appendChild(e);
    host.appendChild(r);
  });
}

/* ============================================================
   MODUL 5 – Dehnen: freies Programm und automatisches Cool-down
   ============================================================ */
var stretchPick = {cat:"alle", min:10};
function openStretchDialog(){
  var host = $("stretchCats"); host.innerHTML = "";
  var cats = [["alle","Alles gemischt","aus allen 120 Übungen","fold"]].concat(
    W.STRETCH_CAT_ORDER.map(function(c){
      var n = W.STRETCHES.filter(function(s){ return s.c === c; }).length;
      var pose = W.STRETCHES.filter(function(s){ return s.c === c; })[0].p;
      return [c, W.STRETCH_CAT[c], n + " Übungen", pose];
    }));
  cats.forEach(function(c){
    var b = el("button","stretchcat" + (c[0] === stretchPick.cat ? " on" : ""),
      W.poseSvg(c[3]) + "<b>" + esc(c[1]) + "</b><span>" + esc(c[2]) + "</span>");
    b.dataset.cat = c[0];
    b.onclick = function(){ stretchPick.cat = c[0]; openStretchDialog(); };
    host.appendChild(b);
  });
  Array.prototype.forEach.call($("stretchMins").children, function(b){
    b.classList.toggle("on", Number(b.dataset.v) === stretchPick.min);
  });
  var prog = W.stretchProgram(stretchPick.cat, stretchPick.min, S.today);
  $("stretchPreview").textContent = prog.items.length + " Übungen · rund " +
    Math.round(prog.seconds/60) + " Minuten · " +
    (stretchPick.cat === "alle" ? "Ganzkörper" : W.STRETCH_CAT[stretchPick.cat]);
  openDlg("dlgStretch");
}
function buildStretchSequence(items, intro){
  var seq = [];
  if (intro) seq.push({type:"warmup", name:"Ankommen", cue:intro, dur:10, round:0, pose:"child"});
  items.forEach(function(s, i){
    if (s.s){
      seq.push({type:"work", name:s.n + " – rechts", cue:s.q, dur:Math.round(s.v/2)+3, round:1,
                mode:"time", pose:s.p, exIndex:i+1, exTotal:items.length, groupLabel:W.STRETCH_CAT[s.c]});
      seq.push({type:"work", name:s.n + " – links", cue:s.q, dur:Math.round(s.v/2)+3, round:1,
                mode:"time", pose:s.p, exIndex:i+1, exTotal:items.length, groupLabel:W.STRETCH_CAT[s.c]});
    } else {
      seq.push({type:"work", name:s.n, cue:s.q, dur:s.v, round:1,
                mode:"time", pose:s.p, exIndex:i+1, exTotal:items.length, groupLabel:W.STRETCH_CAT[s.c]});
    }
    if (i < items.length - 1)
      seq.push({type:"rest", name:"Wechsel", cue:"Position wechseln, weiteratmen.", dur:8, round:1});
  });
  seq.push({type:"cooldown", name:"Fertig", cue:"Nachspüren, ruhig weiteratmen.", dur:10, round:1});
  return seq;
}
function startStretchProgram(){
  var prog = W.stretchProgram(stretchPick.cat, stretchPick.min, S.today);
  closeDlg("dlgStretch");
  stretchMode = "frei";
  A.openPlayer(buildStretchSequence(prog.items, "Setz dich bequem hin. Wir starten gleich."));
}
var stretchMode = null;
/* Cool-down passend zum gerade absolvierten Training */
function cooldownGroups(){
  var p = A.planToday();
  if (p.rest) return ["ruecken","nacken"];
  if (p.run) return ["beine"];
  var g = p.exercises.map(function(e){ return e.g; });
  return g.length ? g : ["beine","ruecken"];
}
function startCoolDown(fromRun){
  var groups = fromRun ? ["beine"] : cooldownGroups();
  var cd = W.coolDownFor(groups, S.today, fromRun ? 5 : 0);
  stretchMode = "cool";
  A.openPlayer(buildStretchSequence(cd.items,
    "Kurzes Cool-down für " + groups.slice(0,3).map(function(g){ return W.GROUP_LABEL[g] || g; }).join(", ") + "."));
}

/* Pose im Player anzeigen */
function decoratePlayer(){
  var P = A.player;
  var pose = $("ovPose");
  if (!pose) return;
  var it = P.seq && P.seq[P.i];
  if (it && it.pose){
    var want = it.pose;
    if (pose.dataset.pose !== want){
      pose.innerHTML = W.poseSvg(want);
      pose.dataset.pose = want;
    }
    pose.style.display = "";
    $("ovTime").style.fontSize = "26px";
  } else {
    pose.style.display = "none";
    pose.dataset.pose = "";
    $("ovTime").style.fontSize = "";
  }
  var cool = $("ovCool");
  if (cool){
    var uiPrefs = A.S && A.S.uiPrefs; // von ui4.js im gemeinsamen Zustand gepflegt
    var allowed = !uiPrefs || uiPrefs.autoCooldown !== false;
    var finished = !!P.finished;
    cool.style.display = (allowed && finished && stretchMode !== "cool" && stretchMode !== "frei") ? "" : "none";
  }
}

/* ============================================================
   Dialog-Hilfen
   ============================================================ */
function openDlg(id){
  var d = $(id);
  try { d.showModal(); } catch(e){ d.setAttribute("open",""); d.style.display = "flex"; }
}
function closeDlg(id){
  var d = $(id);
  try { d.close(); } catch(e){}
  d.removeAttribute("open"); d.style.display = "";
}

/* ============================================================
   MODUL 4b – Erledigt-Zustand auf dem Dashboard
   ============================================================ */
function applyDoneState(){
  var hero = $("hero");
  var done = !!(S.log[S.today] && S.log[S.today].done);
  var old = $("doneCard");
  if (old) old.remove();
  hero.style.display = done ? "none" : "";
  if (!done) return;
  var e = S.log[S.today];
  var card = el("div","card donecard");
  card.id = "doneCard";
  var what = e.type === "rest" ? "Entspannungstag" : e.type === "run" ? "Lauf" : e.type === "rodeln" ? "Rodeln vorbereiten" : "Tagestraining";
  card.innerHTML =
    '<div class="big">🎉</div>' +
    '<h2>Training heute erfolgreich absolviert!</h2>' +
    '<p>' + esc(what) + (e.sec ? " · " + W.fmtTime(e.sec) : "") +
    (e.km ? " · " + e.km + " km" : "") + ' · im Logbuch gespeichert.</p>';
  var rowBtn = el("div","btn-row");
  var again = el("button","btn secondary sm","Nochmal trainieren");
  again.onclick = function(){ hero.style.display = ""; card.remove(); };
  var cool = el("button","btn ghost sm","Dehnen");
  cool.onclick = function(){ startCoolDown(e.type === "run"); };
  rowBtn.appendChild(again); rowBtn.appendChild(cool);
  card.appendChild(rowBtn);
  hero.parentNode.insertBefore(card, hero);
}

/* ============================================================
   Bindings
   ============================================================ */
/* ============================================================
   GYM-MODUL: Geräte-Krafttraining (Sätze/Wiederholungen/Gewicht)
   Aufgebaut wie "Aktiv Vorbereitung Rodeln" – eigene Karte auf dem
   Training-Bildschirm, eigener Ablauf, eigener Verlauf. Da hier
   Sätze/Gewicht per Hand erfasst werden statt eines Timer-
   Countdowns, läuft der Ablauf über eine Tabellen-Eingabe statt
   über den normalen Übungsplayer. Einheiten sind fest in
   Kilogramm, keine Umschaltmöglichkeit vorgesehen.
   ============================================================ */
S.gymLog = A.store.get("wk_gymlog", {});
S.customGymExercises = A.store.get("wk_custom_gym", []);
var GYM_MANDATORY_IDS = ["brustpresse","latzug","beinpresse","beinbeuger","schulterpresse","rudern"];
var GYM = {sets:{}, activeIds:[], startedAt:null, elapsedTimer:null, restTimer:null, restRemaining:0, restTotal:0};
function allGymExercises(){ return W.GYM_EXERCISES.concat(S.customGymExercises); }
function gymExById(id){
  var found = W.gymExerciseById(id);
  if (found) return found;
  for (var i = 0; i < S.customGymExercises.length; i++) if (S.customGymExercises[i].id === id) return S.customGymExercises[i];
  return null;
}

function gymLastData(exId){
  var dates = Object.keys(S.gymLog).filter(function(d){ return d < S.today && S.gymLog[d].sets && S.gymLog[d].sets[exId] && S.gymLog[d].sets[exId].length; }).sort();
  if (!dates.length) return null;
  var lastDate = dates[dates.length - 1];
  var sets = S.gymLog[lastDate].sets[exId];
  return {date: lastDate, sets: sets};
}
function gymRestSeconds(){ return (S.uiPrefs && S.uiPrefs.gymRestSeconds) || 90; }

function renderGymExCard(ex){
  var card = el("div","gym-ex-card" + (GYM_MANDATORY_IDS.indexOf(ex.id) < 0 ? " gym-ex-custom" : ""));
  card.dataset.gymEx = ex.id;
  var last = gymLastData(ex.id);
  var lastTxt = "Letztes Mal: noch keine Daten";
  if (last && last.sets.length){
    var top = last.sets[last.sets.length - 1];
    lastTxt = "Letztes Mal: " + last.sets.length + " x " + (top.reps||0) + " mit " + (top.weight||0) + " kg";
  }
  var warmupOn = !!(S.uiPrefs && S.uiPrefs.gymWarmupSets);
  var micOn = gymVoiceSupported();
  var removeBtn = GYM_MANDATORY_IDS.indexOf(ex.id) < 0
    ? "<button class='gym-ex-remove' data-gym-remove='" + ex.id + "' title='Übung wieder entfernen'>✕</button>" : "";
  card.innerHTML =
    "<div class='gym-ex-head'><b>" + esc(ex.n) + "</b><div style='display:flex;gap:6px;align-items:center'><button class='gym-info-btn' data-gym-info='" + ex.id + "'>ⓘ</button>" + removeBtn + "</div></div>" +
    "<p class='tiny gym-last'>" + esc(lastTxt) + "</p>" +
    "<table class='gym-table'><thead><tr><th>Satz</th><th>Wdh.</th><th>kg</th>" + (warmupOn ? "<th>W</th>" : "") + (micOn ? "<th></th>" : "") + "<th></th></tr></thead>" +
    "<tbody id='gymSets-" + ex.id + "'></tbody></table>" +
    "<button class='btn ghost sm' data-gym-add='" + ex.id + "' style='margin-top:8px'>+ Satz</button>";
  return card;
}
function renderGymSetRows(exId){
  var tbody = $("gymSets-" + exId);
  if (!tbody) return;
  var sets = GYM.sets[exId] || [];
  var warmupOn = !!(S.uiPrefs && S.uiPrefs.gymWarmupSets);
  var micOn = gymVoiceSupported();
  tbody.innerHTML = "";
  sets.forEach(function(s, i){
    var tr = document.createElement("tr");
    if (s.done) tr.className = "gym-set-done";
    var warmupCell = warmupOn
      ? "<td><button class='gym-set-check" + (s.warmup ? " on" : "") + "' data-gym-warmup='" + exId + "' data-idx='" + i + "' title='Warm-up-Satz (zählt nicht zur Tonnage)'>W</button></td>"
      : "";
    var micCell = micOn
      ? "<td><button class='gym-mic-btn' data-gym-mic='" + exId + "' data-idx='" + i + "' title='Per Sprache eintragen: z. B. \"50 Kilo, 10 Wiederholungen\"'>🎤</button></td>"
      : "";
    tr.innerHTML =
      "<td>" + (i+1) + "</td>" +
      "<td><input type='number' inputmode='numeric' min='0' data-gym-reps='" + exId + "' data-idx='" + i + "' value='" + (s.reps != null ? s.reps : "") + "'></td>" +
      "<td><input type='number' inputmode='decimal' min='0' step='0.5' data-gym-weight='" + exId + "' data-idx='" + i + "' value='" + (s.weight != null ? s.weight : "") + "'></td>" +
      warmupCell + micCell +
      "<td><button class='gym-set-check" + (s.done ? " on" : "") + "' data-gym-check='" + exId + "' data-idx='" + i + "'>" + (s.done ? "✓" : "") + "</button></td>";
    tbody.appendChild(tr);
  });
}
function renderGymExList(){
  var host = $("gymExList");
  host.innerHTML = "";
  GYM.activeIds.forEach(function(exId){
    var ex = gymExById(exId);
    if (!ex) return;
    GYM.sets[ex.id] = GYM.sets[ex.id] || [];
    host.appendChild(renderGymExCard(ex));
    renderGymSetRows(ex.id);
  });
  updateGymProgress();
}
/* ============================================================
   SPRACH-EINGABE FÜRS GYM-TRAINING
   Gegenstück zur bereits vorhandenen Sprachausgabe: statt zu
   tippen, "50 Kilo, 10 Wiederholungen" zurufen und die App trägt
   Gewicht und Wiederholungen direkt in den passenden Satz ein.
   Nutzt die Web-Speech-Recognition-API des Browsers (Android-
   Chrome unterstützt das, iOS/Safari nicht durchgängig).
   ============================================================ */
function gymVoiceSupported(){ return !!(window.SpeechRecognition || window.webkitSpeechRecognition); }
function parseGymVoice(text){
  var t = text.toLowerCase().replace(",", ".");
  var result = {reps: null, weight: null};
  var weightMatch = t.match(/(\d+(?:[.,]\d+)?)\s*(kilo|kg)/);
  if (weightMatch) result.weight = parseFloat(weightMatch[1]);
  var repsMatch = t.match(/(\d+)\s*(wiederholung\w*|mal|wdh)/);
  if (repsMatch) result.reps = parseInt(repsMatch[1], 10);
  // Falls keine Einheiten erkannt wurden, aber genau zwei Zahlen genannt
  // wurden: erste Zahl = Gewicht, zweite = Wiederholungen (übliche Reihenfolge).
  if (result.weight === null && result.reps === null){
    var nums = t.match(/\d+(?:[.,]\d+)?/g);
    if (nums && nums.length >= 2){
      result.weight = parseFloat(nums[0].replace(",", "."));
      result.reps = parseInt(nums[1], 10);
    } else if (nums && nums.length === 1){
      result.reps = parseInt(nums[0], 10);
    }
  } else if (result.weight === null || result.reps === null){
    // Nur eine der beiden Einheiten erkannt: die übrig gebliebene Zahl der fehlenden Angabe zuordnen
    var remaining = t.replace(weightMatch ? weightMatch[0] : "", "").replace(repsMatch ? repsMatch[0] : "", "");
    var leftoverNum = remaining.match(/\d+(?:[.,]\d+)?/);
    if (leftoverNum){
      if (result.weight === null) result.weight = parseFloat(leftoverNum[0].replace(",", "."));
      else if (result.reps === null) result.reps = parseInt(leftoverNum[0], 10);
    }
  }
  return result;
}
function startGymVoiceInput(exId, idx){
  if (!gymVoiceSupported()){ A.toast("Sprach-Eingabe wird von diesem Browser nicht unterstützt."); return; }
  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  var rec = new Rec();
  rec.lang = "de-DE";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  var micBtn = document.querySelector('[data-gym-mic="' + exId + '"][data-idx="' + idx + '"]');
  if (micBtn) micBtn.classList.add("listening");
  rec.onresult = function(event){
    var text = event.results[0][0].transcript;
    var parsed = parseGymVoice(text);
    var set = GYM.sets[exId] && GYM.sets[exId][idx];
    if (!set){ return; }
    if (parsed.reps != null) set.reps = parsed.reps;
    if (parsed.weight != null) set.weight = parsed.weight;
    renderGymSetRows(exId);
    if (parsed.reps == null && parsed.weight == null){
      A.toast("Nicht verstanden: \"" + text + "\" – bitte z. B. \"50 Kilo, 10 Wiederholungen\" sagen.");
    } else {
      A.toast("Erkannt: " + (parsed.reps != null ? parsed.reps + " Wdh." : "") + (parsed.weight != null ? " " + parsed.weight + " kg" : ""));
    }
  };
  rec.onerror = function(event){
    if (micBtn) micBtn.classList.remove("listening");
    if (event.error === "no-speech") return;
    if (event.error === "not-allowed"){ A.toast("Mikrofon-Zugriff wurde nicht erlaubt."); return; }
    A.toast("Spracherkennung fehlgeschlagen.");
  };
  rec.onend = function(){ if (micBtn) micBtn.classList.remove("listening"); };
  try { rec.start(); } catch(e){ if (micBtn) micBtn.classList.remove("listening"); }
}

function updateGymProgress(){
  var started = Object.keys(GYM.sets).filter(function(id){ return GYM.sets[id].length > 0; }).length;
  var el2 = $("gymProgress");
  if (el2) el2.textContent = started + " von " + GYM.activeIds.length + " Übungen begonnen";
}
function addGymExerciseToSession(exId){
  if (GYM.activeIds.indexOf(exId) >= 0){
    var existing = document.querySelector('[data-gym-ex="' + exId + '"]');
    if (existing) existing.scrollIntoView({block:"center", behavior:"smooth"});
    return;
  }
  GYM.activeIds.push(exId);
  GYM.sets[exId] = GYM.sets[exId] || [];
  renderGymExList();
  var added = document.querySelector('[data-gym-ex="' + exId + '"]');
  if (added) added.scrollIntoView({block:"center", behavior:"smooth"});
}
function removeGymExerciseFromSession(exId){
  if (GYM_MANDATORY_IDS.indexOf(exId) >= 0) return; // die sechs Basis-Geräte bleiben immer
  var idx = GYM.activeIds.indexOf(exId);
  if (idx < 0) return;
  GYM.activeIds.splice(idx, 1);
  delete GYM.sets[exId];
  renderGymExList();
}
function renderGymSearchResults(query){
  var host = $("gymSearchResults");
  var q = query.trim().toLowerCase();
  if (!q){ host.style.display = "none"; host.innerHTML = ""; return; }
  var matches = allGymExercises().filter(function(ex){
    return ex.n.toLowerCase().indexOf(q) >= 0 || ex.g.toLowerCase().indexOf(q) >= 0;
  }).slice(0, 10);
  host.innerHTML = "";
  if (!matches.length){
    host.appendChild(el("div","gym-search-empty","Keine passende Übung gefunden."));
  } else {
    matches.forEach(function(ex){
      var already = GYM.activeIds.indexOf(ex.id) >= 0;
      var row = el("div","gym-search-row" + (already ? " added" : ""));
      row.dataset.gymPick = ex.id;
      row.innerHTML = "<b>" + esc(ex.n) + "</b><span>" + (already ? "bereits dabei" : esc(ex.g)) + "</span>";
      host.appendChild(row);
    });
  }
  var createRow = el("div","gym-search-row gym-search-create");
  createRow.dataset.gymCreate = query.trim();
  createRow.innerHTML = "<b>+ \"" + esc(query.trim()) + "\" als eigene Übung anlegen</b><span>neu</span>";
  host.appendChild(createRow);
  host.style.display = "";
}
function createCustomGymExercise(name, group){
  var nextId = "custom_gym_" + Date.now();
  var ex = {id: nextId, n: name.slice(0,60), g: group || "Eigene Übung", setup: "", exec: "", breath: ""};
  S.customGymExercises.push(ex);
  A.store.set("wk_custom_gym", S.customGymExercises);
  return ex;
}
function gymElapsedTick(){
  if (!GYM.startedAt) return;
  var sec = Math.floor((Date.now() - GYM.startedAt) / 1000);
  var m = Math.floor(sec/60), s = sec%60;
  $("gymElapsed").textContent = m + ":" + (s<10?"0":"") + s;
}
function openGymOverlay(){
  GYM.sets = {}; GYM.activeIds = GYM_MANDATORY_IDS.slice(); GYM.startedAt = Date.now();
  $("gymSearch").value = "";
  $("gymSearchResults").style.display = "none";
  renderGymExList();
  $("gymOverlay").classList.add("open");
  A.keepAwake && A.keepAwake(true);
  gymElapsedTick();
  GYM.elapsedTimer = setInterval(gymElapsedTick, 1000);
}
function closeGymOverlay(){
  if (GYM.elapsedTimer){ clearInterval(GYM.elapsedTimer); GYM.elapsedTimer = null; }
  stopGymRest();
  $("gymOverlay").classList.remove("open");
  A.keepAwake && A.keepAwake(false);
}
function startGymRest(){
  stopGymRest();
  GYM.restTotal = gymRestSeconds();
  GYM.restRemaining = GYM.restTotal;
  $("gymRestBar").style.display = "";
  $("gymRestVal").textContent = GYM.restRemaining;
  $("gymRestFill").style.width = "100%";
  GYM.restTimer = setInterval(function(){
    GYM.restRemaining--;
    if (GYM.restRemaining <= 0){ A.beep(880,180); stopGymRest(); return; }
    $("gymRestVal").textContent = GYM.restRemaining;
    $("gymRestFill").style.width = Math.round(GYM.restRemaining/GYM.restTotal*100) + "%";
    if (GYM.restRemaining <= 3) A.beep(660,70);
  }, 1000);
}
function stopGymRest(){
  if (GYM.restTimer){ clearInterval(GYM.restTimer); GYM.restTimer = null; }
  $("gymRestBar").style.display = "none";
}
function finishGymWorkout(){
  var anyDone = Object.keys(GYM.sets).some(function(id){ return GYM.sets[id].some(function(s){ return s.done; }); });
  if (!anyDone){ A.toast("Noch keine Sätze abgehakt"); return; }
  var totalVolume = 0, doneSets = 0;
  Object.keys(GYM.sets).forEach(function(id){
    GYM.sets[id].forEach(function(s){
      if (s.done && !s.warmup){ totalVolume += (Number(s.reps)||0) * (Number(s.weight)||0); doneSets++; }
      else if (s.done) doneSets++;
    });
  });
  var elapsedSec = GYM.startedAt ? Math.floor((Date.now() - GYM.startedAt)/1000) : 0;
  S.gymLog[S.today] = {sets: GYM.sets, totalVolume: totalVolume};
  A.store.set("wk_gymlog", S.gymLog);
  A.markDone(S.today, {type:"gym", groups:["brust","ruecken","beine","arme"], ex: GYM.activeIds.slice(), sec: elapsedSec});
  closeGymOverlay();
  $("gymSummaryVolume").textContent = Math.round(totalVolume);
  $("gymSummaryDetail").textContent = doneSets + " Sätze abgeschlossen in " + Math.round(elapsedSec/60) + " Minuten.";
  var dlg = $("dlgGymSummary");
  dlg.showModal ? (function(){ try { dlg.showModal(); } catch(e){ dlg.setAttribute("open",""); } })() : dlg.setAttribute("open","");
  A.renderAll();
  A.toast("Gym-Training gespeichert");
}
function openGymInfo(exId){
  var ex = gymExById(exId);
  if (!ex) return;
  $("gymInfoName").textContent = ex.n;
  $("gymInfoGroup").textContent = ex.g;
  $("gymInfoSetup").textContent = ex.setup || "–";
  $("gymInfoExec").textContent = ex.exec || "–";
  $("gymInfoBreath").textContent = ex.breath || "–";
  var dlg = $("dlgGymInfo");
  dlg.showModal ? (function(){ try { dlg.showModal(); } catch(e){ dlg.setAttribute("open",""); } })() : dlg.setAttribute("open","");
}
// Delegierte Klicks/Eingaben innerhalb der dynamisch erzeugten Gym-Liste
document.addEventListener("click", function(e){
  var addBtn = e.target.closest("[data-gym-add]");
  if (addBtn){
    var exId = addBtn.dataset.gymAdd;
    GYM.sets[exId] = GYM.sets[exId] || [];
    var prevSet = GYM.sets[exId][GYM.sets[exId].length - 1];
    GYM.sets[exId].push({reps: prevSet ? prevSet.reps : null, weight: prevSet ? prevSet.weight : null, done:false});
    renderGymSetRows(exId);
    updateGymProgress();
    return;
  }
  var checkBtn = e.target.closest("[data-gym-check]");
  if (checkBtn){
    var cid = checkBtn.dataset.gymCheck, idx = Number(checkBtn.dataset.idx);
    var set = GYM.sets[cid][idx];
    set.done = !set.done;
    renderGymSetRows(cid);
    if (set.done) startGymRest();
    return;
  }
  var warmupBtn = e.target.closest("[data-gym-warmup]");
  if (warmupBtn){
    var wuid = warmupBtn.dataset.gymWarmup, wuidx = Number(warmupBtn.dataset.idx);
    GYM.sets[wuid][wuidx].warmup = !GYM.sets[wuid][wuidx].warmup;
    renderGymSetRows(wuid);
    return;
  }
  var infoBtn = e.target.closest("[data-gym-info]");
  if (infoBtn){ openGymInfo(infoBtn.dataset.gymInfo); return; }
  var pickRow = e.target.closest("[data-gym-pick]");
  if (pickRow){
    addGymExerciseToSession(pickRow.dataset.gymPick);
    $("gymSearch").value = "";
    $("gymSearchResults").style.display = "none";
    return;
  }
  var createRow = e.target.closest("[data-gym-create]");
  if (createRow){
    var name = createRow.dataset.gymCreate;
    if (!name){ return; }
    var newEx = createCustomGymExercise(name, "Eigene Übung");
    addGymExerciseToSession(newEx.id);
    $("gymSearch").value = "";
    $("gymSearchResults").style.display = "none";
    A.toast("Eigene Übung angelegt und hinzugefügt");
    return;
  }
  var removeBtn = e.target.closest("[data-gym-remove]");
  if (removeBtn){
    removeGymExerciseFromSession(removeBtn.dataset.gymRemove);
    return;
  }
  var micBtn = e.target.closest("[data-gym-mic]");
  if (micBtn){
    startGymVoiceInput(micBtn.dataset.gymMic, Number(micBtn.dataset.idx));
    return;
  }
  if (!e.target.closest(".gym-search-wrap")){
    var sr = $("gymSearchResults");
    if (sr) sr.style.display = "none";
  }
});
document.addEventListener("input", function(e){
  if (e.target.id === "gymSearch"){ renderGymSearchResults(e.target.value); }
  if (e.target.matches("[data-gym-reps]")){
    var rid = e.target.dataset.gymReps, ridx = Number(e.target.dataset.idx);
    GYM.sets[rid][ridx].reps = e.target.value === "" ? null : Number(e.target.value);
  }
  if (e.target.matches("[data-gym-weight]")){
    var wid = e.target.dataset.gymWeight, widx = Number(e.target.dataset.idx);
    GYM.sets[wid][widx].weight = e.target.value === "" ? null : Number(e.target.value);
  }
});

/* ============================================================
   LAUF-TRACKING (GPS + Herzfrequenz live)
   Eigenständige Aufzeichnung wie bei modernen Lauf-Apps: echtes
   GPS-Tracking über die Geolocation-API (watchPosition), Distanz
   per Haversine-Formel aus den Koordinaten berechnet, Live-Tempo,
   Live-Kalorien (über die bestehende MET-Berechnung) und – falls
   gekoppelt – Live-Herzfrequenz über denselben Bluetooth-Brustgurt
   wie im Krafttraining. Am Ende wird der Lauf als ganz normale
   Aktivität gespeichert, genau wie ein importierter GPX-Lauf.
   ============================================================ */
var RUN = {
  tracking:false, paused:false, startedAt:null, pausedAt:null, pausedTotalMs:0,
  points:[], distanceKm:0, splits:[], watchId:null, uiTimer:null,
  hrSamples:[], gpsOk:null, _pendingSave:null
};
function haversineKm(lat1, lon1, lat2, lon2){
  var R = 6371;
  var dLat = (lat2-lat1) * Math.PI/180;
  var dLon = (lon2-lon1) * Math.PI/180;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2) +
          Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function runElapsedSec(){
  if (!RUN.startedAt) return 0;
  var now = RUN.paused ? RUN.pausedAt : Date.now();
  return Math.max(0, Math.floor((now - RUN.startedAt - RUN.pausedTotalMs) / 1000));
}
function runFmtTime(sec){
  var h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
  var pad = function(n){ return (n<10?"0":"")+n; };
  return h > 0 ? (h + ":" + pad(m) + ":" + pad(s)) : (m + ":" + pad(s));
}
function runFmtPace(distanceKm, sec){
  if (distanceKm < 0.05) return "–:––";
  var paceSecPerKm = sec / distanceKm;
  var m = Math.floor(paceSecPerKm / 60), s = Math.round(paceSecPerKm % 60);
  if (s === 60){ m++; s = 0; }
  return m + ":" + (s<10?"0":"") + s;
}
function onGpsUpdate(pos){
  var pt = {lat: pos.coords.latitude, lon: pos.coords.longitude, alt: pos.coords.altitude, t: Date.now()};
  RUN.gpsOk = true;
  if ($("runGpsStatus")) $("runGpsStatus").textContent = "GPS aktiv · Genauigkeit ±" + Math.round(pos.coords.accuracy) + "m";
  // Sehr ungenaue Punkte verwerfen (Innenräume, schwacher Empfang)
  if (pos.coords.accuracy && pos.coords.accuracy > 35) return;
  if (RUN.points.length){
    var prev = RUN.points[RUN.points.length - 1];
    var d = haversineKm(prev.lat, prev.lon, pt.lat, pt.lon);
    // GPS-Rauschen im Stand herausfiltern (unter 3m gilt nicht als Bewegung)
    if (d < 0.003) return;
    var before = RUN.distanceKm;
    RUN.distanceKm += d;
    if (Math.floor(RUN.distanceKm) > Math.floor(before)) RUN.splits.push(runElapsedSec());
  }
  RUN.points.push(pt);
  updateRunLiveUi();
}
function onGpsError(err){
  RUN.gpsOk = false;
  var msg = err.code === 1 ? "Standortzugriff nicht erlaubt." : "GPS-Signal gerade nicht verfügbar.";
  if ($("runGpsStatus")) $("runGpsStatus").textContent = msg;
}
function currentPaceKmh(){
  var sec = runElapsedSec();
  if (sec < 10 || RUN.distanceKm < 0.03) return 9; // sinnvoller Startwert für die Kalorienschätzung
  return (RUN.distanceKm / sec) * 3600;
}
function runLiveCalories(){
  var b = OS.normalizeBody(S.body);
  var met = OS.metFor("lauf", currentPaceKmh());
  return OS.calories(met, b.weightKg, runElapsedSec()/60);
}
function updateRunLiveUi(){
  $("runTime").textContent = runFmtTime(runElapsedSec());
  $("runDistance").textContent = (Math.round(RUN.distanceKm*100)/100).toFixed(2);
  $("runPace").textContent = runFmtPace(RUN.distanceKm, runElapsedSec());
  $("runCalories").textContent = runLiveCalories();
  var bpm = A.getLastHrBpm ? A.getLastHrBpm() : null;
  $("runHr").textContent = bpm != null ? bpm : "–";
}
function onHrSample(bpm){ if (RUN.tracking && !RUN.paused) RUN.hrSamples.push(bpm); }
function startRun(){
  if (!navigator.geolocation){ A.toast("GPS wird von diesem Gerät nicht unterstützt."); return; }
  RUN.tracking = true; RUN.paused = false; RUN.startedAt = Date.now(); RUN.pausedTotalMs = 0;
  RUN.points = []; RUN.distanceKm = 0; RUN.splits = []; RUN.hrSamples = []; RUN.gpsOk = null;
  $("runPreStart").style.display = "none";
  $("runSummary").style.display = "none";
  $("runLive").style.display = "";
  $("runGpsStatus").textContent = "Suche GPS-Signal …";
  RUN.watchId = navigator.geolocation.watchPosition(onGpsUpdate, onGpsError, {
    enableHighAccuracy: true, maximumAge: 2000, timeout: 15000
  });
  A.keepAwake && A.keepAwake(true);
  updateRunLiveUi();
  RUN.uiTimer = setInterval(updateRunLiveUi, 1000);
}
function pauseRun(){
  if (!RUN.tracking || RUN.paused) return;
  RUN.paused = true; RUN.pausedAt = Date.now();
  $("btnRunPause").textContent = "Weiter";
}
function resumeRun(){
  if (!RUN.tracking || !RUN.paused) return;
  RUN.pausedTotalMs += Date.now() - RUN.pausedAt;
  RUN.paused = false;
  $("btnRunPause").textContent = "Pause";
}
function drawRunRoute(){
  var canvas = $("runRouteCanvas");
  if (!canvas || RUN.points.length < 2) { if (canvas) canvas.style.display = "none"; return; }
  canvas.style.display = "block";
  var ctx = canvas.getContext("2d");
  var lats = RUN.points.map(function(p){ return p.lat; });
  var lons = RUN.points.map(function(p){ return p.lon; });
  var minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats);
  var minLon = Math.min.apply(null, lons), maxLon = Math.max.apply(null, lons);
  var w = canvas.width, h = canvas.height, pad = 20;
  var spanLat = Math.max(0.0001, maxLat-minLat), spanLon = Math.max(0.0001, maxLon-minLon);
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--work") || "#D97757";
  ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath();
  RUN.points.forEach(function(p, i){
    var x = pad + ((p.lon - minLon) / spanLon) * (w - pad*2);
    var y = h - pad - ((p.lat - minLat) / spanLat) * (h - pad*2);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
}
function finishRun(){
  if (RUN.watchId != null) navigator.geolocation.clearWatch(RUN.watchId);
  if (RUN.uiTimer) clearInterval(RUN.uiTimer);
  RUN.tracking = false;
  A.keepAwake && A.keepAwake(false);
  var durationSec = runElapsedSec();
  var cal = runLiveCalories();
  var avgHr = RUN.hrSamples.length ? Math.round(RUN.hrSamples.reduce(function(a,b){return a+b;},0) / RUN.hrSamples.length) : null;
  var maxHr = RUN.hrSamples.length ? Math.max.apply(null, RUN.hrSamples) : null;
  $("runLive").style.display = "none";
  $("runSummary").style.display = "";
  $("runSumDistance").textContent = (Math.round(RUN.distanceKm*100)/100).toFixed(2);
  $("runSumTime").textContent = runFmtTime(durationSec);
  $("runSumPace").textContent = runFmtPace(RUN.distanceKm, durationSec);
  $("runSumCalories").textContent = cal;
  $("runSumHr").textContent = avgHr != null ? (avgHr + " / " + maxHr + " BPM") : "kein Brustgurt verbunden";
  var splitsHost = $("runSumSplits"); splitsHost.innerHTML = "";
  var prevT = 0;
  RUN.splits.forEach(function(t, i){
    var pEl = document.createElement("p"); pEl.className = "tiny";
    pEl.textContent = "Kilometer " + (i+1) + ": " + runFmtTime(t - prevT);
    splitsHost.appendChild(pEl);
    prevT = t;
  });
  drawRunRoute();
  RUN._pendingSave = {durationSec:durationSec, calories:cal, avgHr:avgHr, maxHr:maxHr};
}
function saveRunActivity(){
  var d = RUN._pendingSave;
  if (!d) return;
  var act = {
    date: S.today, name: "Lauf", type: "Laufen",
    distanceKm: Math.round(RUN.distanceKm*100)/100, durationSec: d.durationSec,
    calories: d.calories, avgHr: d.avgHr || undefined, source: "Live-Tracking"
  };
  S.activities = S.activities || [];
  S.activities.unshift(act);
  A.saveAct();
  A.markDone(S.today, {type:"run", groups:["cardio"], ex:[], sec:d.durationSec});
  closeRunOverlay();
  A.renderAll();
  A.toast("Lauf gespeichert");
}
function discardRun(){
  RUN._pendingSave = null;
  closeRunOverlay();
}
function closeRunOverlay(){
  if (RUN.watchId != null){ navigator.geolocation.clearWatch(RUN.watchId); RUN.watchId = null; }
  if (RUN.uiTimer){ clearInterval(RUN.uiTimer); RUN.uiTimer = null; }
  RUN.tracking = false;
  A.keepAwake && A.keepAwake(false);
  $("runOverlay").classList.remove("open");
  $("runPreStart").style.display = "";
  $("runLive").style.display = "none";
  $("runSummary").style.display = "none";
}
function openRunOverlay(){
  $("runOverlay").classList.add("open");
  $("runPreStart").style.display = "";
  $("runLive").style.display = "none";
  $("runSummary").style.display = "none";
  $("runHrPreStatus").textContent = A.isHrConnected() ? "Brustgurt verbunden ❤️" : "Kein Brustgurt verbunden (optional)";
}

function bind(){
  // Farben
  $("btnColorReset").addEventListener("click", resetColors);

  // Lauftage
  $("setRunMode").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.settings.runMode = b.dataset.v;
    A.saveSettings(); renderRunDays(); A.renderAll();
    A.toast(b.dataset.v === "fest" ? "Fester Rhythmus" : "Freie Wochenplanung");
  });

  // Multisport
  $("fabAdd").addEventListener("click", function(){ openSportDialog(null); });
  $("sportClose").addEventListener("click", function(){ closeDlg("dlgSport"); sportState.editing = null; });
  $("sportChange").addEventListener("click", function(){
    $("sportPickWrap").style.display = "";
    $("sportFormWrap").style.display = "none";
    renderSportList($("sportSearch").value);
  });
  $("sportSearch").addEventListener("input", function(e){ renderSportList(e.target.value); });
  $("sportSave").addEventListener("click", saveSport);
  $("sportDelete").addEventListener("click", deleteSport);

  // Dehnen
  $("btnStretchStart").addEventListener("click", openStretchDialog);
  $("btnRodelnStart").addEventListener("click", function(){
    if (!W.buildRodelnSequence) { A.toast("Programm nicht verfügbar"); return; }
    S.activeProgram = "rodeln";
    A.openPlayer(W.buildRodelnSequence(S.today));
  });
  $("btnGymStart").addEventListener("click", openGymOverlay);
  var btnRunStart = $("btnRunTrackStart");
  if (btnRunStart) btnRunStart.addEventListener("click", openRunOverlay);
  var runCloseEl = $("runClose");
  if (runCloseEl) runCloseEl.addEventListener("click", function(){
    if (RUN.tracking && !confirm("Laufaufzeichnung wirklich abbrechen? Die bisherige Strecke geht verloren.")) return;
    closeRunOverlay();
  });
  var btnRunGo = $("btnRunGo");
  if (btnRunGo) btnRunGo.addEventListener("click", startRun);
  var btnRunPause = $("btnRunPause");
  if (btnRunPause) btnRunPause.addEventListener("click", function(){
    if (RUN.paused) resumeRun(); else pauseRun();
  });
  var btnRunFinish = $("btnRunFinish");
  if (btnRunFinish) btnRunFinish.addEventListener("click", function(){
    if (confirm("Lauf beenden und Zusammenfassung ansehen?")) finishRun();
  });
  var btnRunSave = $("btnRunSave");
  if (btnRunSave) btnRunSave.addEventListener("click", saveRunActivity);
  var btnRunDiscard = $("btnRunDiscard");
  if (btnRunDiscard) btnRunDiscard.addEventListener("click", function(){
    if (confirm("Lauf wirklich verwerfen, ohne zu speichern?")) discardRun();
  });
  $("gymClose").addEventListener("click", closeGymOverlay);
  $("gymFinish").addEventListener("click", finishGymWorkout);
  $("gymRestSkip").addEventListener("click", stopGymRest);
  $("gymInfoClose").addEventListener("click", function(){ closeDlg("dlgGymInfo"); });
  $("gymSummaryClose").addEventListener("click", function(){ closeDlg("dlgGymSummary"); });
  $("gymSummaryOk").addEventListener("click", function(){ closeDlg("dlgGymSummary"); });
  $("stretchClose").addEventListener("click", function(){ closeDlg("dlgStretch"); });
  $("stretchMins").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    stretchPick.min = Number(b.dataset.v);
    openStretchDialog();
  });
  $("stretchGo").addEventListener("click", startStretchProgram);
  $("ovCool").addEventListener("click", function(){ startCoolDown(false); });

  setInterval(decoratePlayer, 150);
  ["ovNextBtn","ovPlay","ovPrev"].forEach(function(id){
    var b = $(id); if (b) b.addEventListener("click", function(){ setTimeout(decoratePlayer, 20); });
  });
}

/* Editier-Stift in der Aktivitätsliste nachrüsten */
function decorateActivityList(){
  var list = $("actList");
  if (!list) return;
  Array.prototype.forEach.call(list.querySelectorAll(".act"), function(r, i){
    if (r.querySelector(".edit")) return;
    var a = S.activities[i];
    if (!a) return;
    var b = el("button","edit","✎");
    b.onclick = function(ev){ ev.stopPropagation(); openSportDialog(a); };
    r.insertBefore(b, r.querySelector(".x"));
  });
}

window.APP3 = {
  after: function(screen){
    if (screen === "heute") applyDoneState();
    if (screen === "lauf"){ renderSportLog(); }
    if (screen === "einst"){ renderRunDays(); renderRestDaySettings(); renderTrainedDaySettings(); renderColorRows(); }
    if (screen === "daten") decorateActivityList();
  },
  openSportDialog: openSportDialog,
  startCoolDown: startCoolDown,
  applyColors: applyColors,
  renderRunDays: renderRunDays, renderRestDaySettings: renderRestDaySettings, renderTrainedDaySettings: renderTrainedDaySettings,
  onHrSample: onHrSample
};

applyColors();
bind();
A.renderAll();
})();
