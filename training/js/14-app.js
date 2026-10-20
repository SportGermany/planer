/* ============================================================
   WIDGET-SYSTEM
   Für jeden der sechs Bildschirme gibt es 10 vordefinierte
   Kacheln. Über "Widgets bearbeiten" am Bildschirmende lassen
   sie sich einzeln an- und abschalten. Jede Kachel berechnet
   ihren Wert live aus bereits vorhandenen Daten (kein neuer
   Tracking-Aufwand, nur eine andere Ansicht auf Bestehendes).
   ============================================================ */
(function(){
"use strict";
var A = window.APP, W = window.WK, OS = window.OS;
var S = A.S, $ = A.$, el = A.el, esc = A.esc;

function body(){ return OS.normalizeBody(S.body); }
function fc(kcal){ return (window.APP4 && window.APP4.fmtCal) ? window.APP4.fmtCal(kcal) : Math.round(kcal||0) + " kcal"; }
function safe(fn, fallback){ try { var v = fn(); return (v === null || v === undefined || v === "") ? fallback : v; } catch(e){ return fallback; } }

function nextRestDay(){
  for (var i=1;i<15;i++){
    var d = W.addDays(S.today, i);
    if (W.isFixedRestDay(d, S.settings)) return d;
  }
  return null;
}
function nextRunDayStr(){
  for (var i=0;i<15;i++){
    var d = W.addDays(S.today, i);
    if (W.isRunDay(d, S.settings)) return d;
  }
  return null;
}
function fmtShortDate(ds){
  if (!ds) return "–";
  var d = W.parseYmd(ds);
  return A.DAYS_SHORT[d.getDay()] + ", " + d.getDate() + "." + (d.getMonth()+1) + ".";
}
function totalDoneCount(){ return Object.keys(S.log).filter(function(k){ return S.log[k] && S.log[k].done; }).length; }
function sumKm(){
  return (S.activities||[]).reduce(function(s,a){ return s + (a.distanceKm||0); }, 0);
}
function mostCommonActivityType(){
  var counts = {};
  (S.activities||[]).forEach(function(a){ counts[a.type||"Sonstiges"] = (counts[a.type||"Sonstiges"]||0)+1; });
  var best = null, bestN = 0;
  Object.keys(counts).forEach(function(k){ if (counts[k] > bestN){ bestN = counts[k]; best = k; } });
  return best;
}
function monthDoneCount(){
  var y = S.calMonth.getFullYear(), m = S.calMonth.getMonth();
  var n = 0;
  Object.keys(S.log).forEach(function(k){
    var d = W.parseYmd(k);
    if (d.getFullYear() === y && d.getMonth() === m && S.log[k].done) n++;
  });
  return n;
}
function isoWeekNum(dateStr){
  var d = W.parseYmd(dateStr);
  var target = new Date(d.valueOf());
  var dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  var firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}
function dayOfYear(dateStr){
  var d = W.parseYmd(dateStr);
  var start = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d - start) / 86400000) + 1;
}
function muscleBalanceText(){
  var counts = {};
  Object.keys(S.log).forEach(function(k){
    var e = S.log[k];
    if (e && e.done && Array.isArray(e.groups)) e.groups.forEach(function(g){ counts[g] = (counts[g]||0)+1; });
  });
  var best = null, bestN = 0;
  Object.keys(counts).forEach(function(k){ if (counts[k] > bestN){ bestN = counts[k]; best = k; } });
  var labels = {beine:"Beine", brust:"Brust", bauch:"Bauch", ruecken:"Rücken", arme:"Arme", cardio:"Cardio"};
  return best ? (labels[best] || best) : null;
}
var QUOTES = [
  "Kleine Schritte, jeden Tag.", "Konstanz schlägt Intensität.", "Der Rest kommt von allein, sobald du anfängst.",
  "Heute zählt, nicht perfekt zu sein, sondern dabei zu bleiben.", "Ein Tag mehr ist ein Tag mehr.",
  "Fortschritt ist leiser als man denkt.", "Du musst nicht schnell sein, nur dran bleiben.",
  "Der beste Zeitpunkt ist jetzt.", "Erholung gehört zum Training dazu.", "Disziplin ist Selbstfürsorge."
];
function quoteOfDay(){
  var custom = (S.uiPrefs && S.uiPrefs.customQuotes) || [];
  var all = QUOTES.concat(custom);
  var idx = W.dayIndex(S.today) % all.length;
  return all[idx];
}
function lastAchievementName(){
  if (!window.APP2 || !window.APP2.computePRs) return null;
  var pr = window.APP2.computePRs();
  var unlocked = (window.APP2.ACHIEVEMENTS || []).filter(function(a){ return a.check(pr); });
  return unlocked.length ? unlocked[unlocked.length-1].n : null;
}
function nextAchievementProgress(){
  if (!window.APP2 || !window.APP2.computePRs) return null;
  var pr = window.APP2.computePRs();
  var locked = (window.APP2.ACHIEVEMENTS || []).filter(function(a){ return !a.check(pr); });
  return locked.length ? locked[0].n : "alle erreicht";
}
function mostTiredGroup(){
  if (!OS.fatigue) return null;
  var f = OS.fatigue(S.log, S.activities, S.today, S.settings);
  var best = null, bestV = -1;
  Object.keys(f||{}).forEach(function(k){ if (f[k] > bestV){ bestV = f[k]; best = k; } });
  var labels = {beine:"Beine", brust:"Brust", bauch:"Bauch", ruecken:"Rücken", arme:"Arme", cardio:"Cardio"};
  return (best && bestV > 0) ? (labels[best] || best) : null;
}
function restDaysUsedThisWeek(){
  var mon = W.weekMonday(S.today);
  var n = 0;
  for (var i=0;i<7;i++){
    var d = W.addDays(mon, i);
    if (d > S.today) break;
    if (S.log[d] && S.log[d].done && S.log[d].type === "rest") n++;
  }
  return n;
}
function rainDaysNext14(){
  if (!S.weatherCache || !S.weatherCache.data) return null;
  return S.weatherCache.data.days.filter(function(d){ return d.pop != null && d.pop >= 50; }).length;
}

/* ---------- Krankheit: Hilfsfunktionen ---------- */
function sickYearCount(){
  var y = W.parseYmd(S.today).getFullYear();
  return Object.keys(S.sickDays).filter(function(d){ return S.sickDays[d] && W.parseYmd(d).getFullYear() === y; }).length;
}
function sickDateList(){
  var y = W.parseYmd(S.today).getFullYear();
  return Object.keys(S.sickDays).filter(function(d){ return S.sickDays[d] && W.parseYmd(d).getFullYear() === y; }).sort();
}
function sickRanges(){
  var list = sickDateList();
  var ranges = [];
  list.forEach(function(d){
    var last = ranges[ranges.length-1];
    if (last && W.addDays(last.to, 1) === d) last.to = d;
    else ranges.push({from:d, to:d});
  });
  return ranges;
}
function sickSinceDate(){
  var ranges = sickRanges();
  var last = ranges[ranges.length-1];
  return last ? last.from : null;
}
function injuryYearCount(){
  var y = W.parseYmd(S.today).getFullYear();
  return Object.keys(S.injuryDays).filter(function(d){ return S.injuryDays[d] && W.parseYmd(d).getFullYear() === y; }).length;
}
function injuryDateList(){
  var y = W.parseYmd(S.today).getFullYear();
  return Object.keys(S.injuryDays).filter(function(d){ return S.injuryDays[d] && W.parseYmd(d).getFullYear() === y; }).sort();
}
function injuryRanges(){
  var list = injuryDateList();
  var ranges = [];
  list.forEach(function(d){
    var last = ranges[ranges.length-1];
    if (last && W.addDays(last.to, 1) === d) last.to = d;
    else ranges.push({from:d, to:d});
  });
  return ranges;
}
function injurySinceDate(){
  var ranges = injuryRanges();
  var last = ranges[ranges.length-1];
  return last ? last.from : null;
}
function openInjuryDialog(){
  var host = $("injuryRangesList");
  $("injuryStatus").textContent = S.injuryActive
    ? "Aktiv seit " + fmtShortDate(injurySinceDate()) + " – auf der Startseite wird täglich nachgefragt, ob es noch anhält."
    : "Gerade nicht aktiv. Aktivieren, wenn du dich verletzt hast – die App fragt dich danach jeden Tag, ob es noch anhält, und schlägt so lange nur eine einfache Atemübung statt Training vor.";
  $("btnInjuryToggle").textContent = S.injuryActive ? "Verletzungsmodus beenden" : "Ich bin ab heute verletzt";
  $("injuryYearCount").textContent = injuryYearCount();
  host.innerHTML = "";
  var iranges = injuryRanges();
  if (!iranges.length){
    host.appendChild(el("p","muted","Noch keine Verletzungstage in diesem Jahr erfasst."));
  } else {
    iranges.slice().reverse().forEach(function(r){
      var txt = r.from === r.to ? fmtShortDate(r.from) : fmtShortDate(r.from) + " – " + fmtShortDate(r.to);
      host.appendChild(el("p","tiny", txt));
    });
  }
  var idlg = $("dlgInjury");
  idlg.showModal ? (function(){ try { idlg.showModal(); } catch(e){ idlg.setAttribute("open",""); } })() : idlg.setAttribute("open","");
}
function openSickDialog(){
  var host = $("sickRangesList");
  $("sickStatus").textContent = S.illnessActive
    ? "Aktiv seit " + fmtShortDate(sickSinceDate()) + " – auf der Startseite wird täglich nachgefragt, ob es noch anhält."
    : "Gerade nicht aktiv. Aktivieren, wenn du dich ab heute krank fühlst – die App fragt dich danach jeden Tag, ob es noch anhält, und schlägt so lange nur ein sehr leichtes Dehnprogramm vor.";
  $("btnSickToggle").textContent = S.illnessActive ? "Krankheitsmodus beenden" : "Ich bin ab heute krank";
  $("sickYearCount").textContent = sickYearCount();
  host.innerHTML = "";
  var ranges = sickRanges();
  if (!ranges.length){
    host.appendChild(el("p","muted","Noch keine Kranktage in diesem Jahr erfasst."));
  } else {
    ranges.slice().reverse().forEach(function(r){
      var txt = r.from === r.to ? fmtShortDate(r.from) : fmtShortDate(r.from) + " – " + fmtShortDate(r.to);
      host.appendChild(el("p","tiny", txt));
    });
  }
  var dlg = $("dlgSick");
  dlg.showModal ? (function(){ try { dlg.showModal(); } catch(e){ dlg.setAttribute("open",""); } })() : dlg.setAttribute("open","");
}
document.addEventListener("click", function(e){
  if (e.target.closest("#btnSickToggle")){
    if (S.illnessActive){ A.endIllness(); A.toast("Krankheitsmodus beendet"); }
    else { A.startIllness(); A.toast("Gute Besserung – für heute reicht ein leichtes Dehnprogramm"); }
    A.renderAll();
    openSickDialog();
  }
  if (e.target.closest("#btnInjuryToggle")){
    if (S.injuryActive){ A.endInjury(); A.toast("Verletzungsmodus beendet"); }
    else { A.startInjury(); A.toast("Gute Besserung – für heute reicht eine Atemübung"); }
    A.renderAll();
    openInjuryDialog();
  }
  if (e.target.closest("#sickClose")){
    var dlg = $("dlgSick");
    try { dlg.close(); } catch(err){}
    dlg.removeAttribute("open");
  }
  if (e.target.closest("#injuryClose")){
    var idlg2 = $("dlgInjury");
    try { idlg2.close(); } catch(err){}
    idlg2.removeAttribute("open");
  }
});
var WT_CODE_LABEL = {0:"klar",1:"heiter",2:"bewölkt",3:"bedeckt",45:"Nebel",48:"Nebel",51:"Niesel",53:"Niesel",55:"Niesel",
  61:"Regen",63:"Regen",65:"Regen",71:"Schnee",73:"Schnee",75:"Schnee",80:"Schauer",81:"Schauer",82:"Schauer",95:"Gewitter"};
function WT_LABEL(code){ return WT_CODE_LABEL[code] || "–"; }
function isLeap(dateStr){ var y = W.parseYmd(dateStr).getFullYear(); return (y%4===0 && y%100!==0) || y%400===0; }

/* ---------- Widget-Definitionen je Bildschirm ---------- */
var WIDGET_DEFS = {
  heute: [
    {id:"h1", t:"Wochenfortschritt", v:function(){
      var mon=W.weekMonday(S.today); var n=0;
      for(var i=0;i<7;i++){var d=W.addDays(mon,i); if(d<=S.today && S.log[d] && S.log[d].done) n++;}
      if (!S.weekGoal) return n + " Einheiten (kein Ziel gesetzt)";
      return n + " / " + S.weekGoal + " Einheiten";
    }},
    {id:"h2", t:"Kalorien heute", v:function(){ return fc(OS.dayBurn(S.today, S.log, S.activities, S.settings, body()).total); }},
    {id:"h3", t:"Aktuelle Serie", v:function(){ return A.currentStreakF() + " Tage"; }},
    {id:"h4", t:"Nächster Ruhetag", v:function(){ return fmtShortDate(nextRestDay()); }},
    {id:"h5", t:"Nächster Lauftag", v:function(){ return fmtShortDate(nextRunDayStr()); }},
    {id:"h6", t:"Trainingsziel", v:function(){ return W.GOAL_LABEL[S.settings.goal] || "–"; }},
    {id:"h7", t:"Letztes Abzeichen", v:function(){ return safe(lastAchievementName, "noch keins"); }},
    {id:"h8", t:"Impuls des Tages", v:quoteOfDay},
    {id:"h9", t:"Wetter gerade", v:function(){ if (!S.weatherCache || !S.weatherCache.data || !S.weatherCache.data.current) return "aus"; var c=S.weatherCache.data.current; return c.temp + "° · " + (WT_LABEL(c.code)); }},
    {id:"h10", t:"Trainingstage gesamt", v:function(){ return totalDoneCount() + ""; }}
  ],
  kalender: [
    {id:"k1", t:"Diesen Monat erledigt", v:function(){ return monthDoneCount() + " Tage"; }},
    {id:"k2", t:"Längste Serie", v:function(){ return A.longestStreakF() + " Tage"; }},
    {id:"k3", t:"Nächster Lauftag", v:function(){ return fmtShortDate(nextRunDayStr()); }},
    {id:"k4", t:"Nächster Ruhetag", v:function(){ return fmtShortDate(nextRestDay()); }},
    {id:"k5", t:"Heute ist Tag", v:function(){ return dayOfYear(S.today) + " von " + (isLeap(S.today)?366:365); }},
    {id:"k6", t:"Kalenderwoche", v:function(){ return "KW " + isoWeekNum(S.today); }},
    {id:"k7", t:"Erledigt-Quote Monat", v:function(){ var y=S.calMonth.getFullYear(), m=S.calMonth.getMonth(); var days=new Date(y,m+1,0).getDate(); var vergangen=0; for(var d=1; d<=days; d++){ var ds=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0"); if (ds<=S.today) vergangen++; } return vergangen? Math.round(monthDoneCount()/vergangen*100)+"%" : "–"; }},
    {id:"k8", t:"Regentage (14 Tage)", v:function(){ var r = rainDaysNext14(); return r===null ? "Wetter aus" : r + " von 14"; }},
    {id:"k9", t:"Lauftage diese Woche", v:function(){ var mon=W.weekMonday(S.today); var n=0; for(var i=0;i<7;i++){ if (W.isRunDay(W.addDays(mon,i), S.settings)) n++; } return n + ""; }},
    {id:"k10", t:"Gesamt erledigte Tage", v:function(){ return totalDoneCount() + ""; }},
    {id:"k11", t:"Krankheit", interactive:true, v:function(){
      if (S.illnessActive) return "Aktiv seit " + fmtShortDate(sickSinceDate());
      var n = sickYearCount();
      return n > 0 ? n + " Kranktage " + W.parseYmd(S.today).getFullYear() : "Nicht krank";
    }},
    {id:"k12", t:"Verletzung", interactive:true, v:function(){
      if (S.injuryActive) return "Aktiv seit " + fmtShortDate(injurySinceDate());
      var n = injuryYearCount();
      return n > 0 ? n + " Verletzungstage " + W.parseYmd(S.today).getFullYear() : "Nicht verletzt";
    }}
  ],
  lauf: [
    {id:"l1", t:"Geschätzte Dauer heute", v:function(){ return $("setDuration") ? $("setDuration").textContent : "–"; }},
    {id:"l2", t:"Letzte Aktivität", v:function(){ var a=(S.activities||[])[0]; return a ? a.name : "noch keine"; }},
    {id:"l3", t:"Aktivitäten gesamt", v:function(){ return (S.activities||[]).length + ""; }},
    {id:"l4", t:"Gesamtkilometer", v:function(){ return (Math.round(sumKm()*10)/10) + " km"; }},
    {id:"l5", t:"Lieblingssport", v:function(){ return safe(mostCommonActivityType, "noch keins"); }},
    {id:"l6", t:"Rodeln absolviert", v:function(){ return Object.keys(S.log).filter(function(k){ return S.log[k] && S.log[k].type==="rodeln"; }).length + "×"; }},
    {id:"l7", t:"Nächster Lauftag", v:function(){ return fmtShortDate(nextRunDayStr()); }},
    {id:"l8", t:"Cool-down", v:function(){ return (S.uiPrefs && S.uiPrefs.autoCooldown!==false) ? "an" : "aus"; }},
    {id:"l9", t:"Dehnen diese Woche", v:function(){ var mon=W.weekMonday(S.today); var n=0; for(var i=0;i<7;i++){var d=W.addDays(mon,i); if(S.log[d]&&S.log[d].done&&/dehn|stretch/i.test(S.log[d].type||"")) n++;} return n + "×"; }},
    {id:"l10", t:"Standarddistanz", v:function(){ return W.effectiveRunDistance(S.settings) + " km"; }}
  ],
  daten: [
    {id:"d1", t:"Trainingstage gesamt", v:function(){ return totalDoneCount() + ""; }},
    {id:"d2", t:"Aktivitäten importiert", v:function(){ return (S.activities||[]).length + ""; }},
    {id:"d3", t:"Häufigste Muskelgruppe", v:function(){ return safe(muscleBalanceText, "noch keine Daten"); }},
    {id:"d4", t:"Cloud-Sicherung", v:function(){ var st = window.SharedCalendar && window.SharedCalendar.status(); return (st && st.connected) ? "aktiv" : (S.sync && S.sync.auto) ? "GitHub aktiv" : "aus"; }},
    {id:"d5", t:"Zuletzt synchronisiert", v:function(){ return (S.sync && S.sync.lastSync) ? new Date(S.sync.lastSync).toLocaleDateString("de-DE") : "nie"; }},
    {id:"d6", t:"Kalorien gesamt (Log)", v:function(){ var sum=0; Object.keys(S.log).forEach(function(k){ if(S.log[k]&&S.log[k].done) sum += OS.dayBurn(k, S.log, S.activities, S.settings, body()).total; }); return fc(sum); }},
    {id:"d7", t:"Ø Trainingsdauer", v:function(){ var arr=Object.keys(S.log).filter(function(k){return S.log[k]&&S.log[k].done&&S.log[k].sec;}); if(!arr.length) return "–"; var sum=arr.reduce(function(s,k){return s+S.log[k].sec;},0); return Math.round(sum/arr.length/60)+" Min"; }},
    {id:"d8", t:"Beste Woche", v:function(){ return safe(function(){ return (window.APP2.computePRs().bestWeek)+" Einheiten"; }, "–"); }},
    {id:"d9", t:"App-Version", v:function(){ return W.APP_VERSION; }},
    {id:"d10", t:"Gesamtkilometer", v:function(){ return (Math.round(sumKm()*10)/10) + " km"; }}
  ],
  fitness: [
    {id:"f1", t:"Bereitschaft heute", v:function(){ return OS.readiness(S.log, S.activities, S.today, S.settings).score + "%"; }},
    {id:"f2", t:"Abzeichen freigeschaltet", v:function(){ return safe(function(){ var pr=window.APP2.computePRs(); return window.APP2.ACHIEVEMENTS.filter(function(a){return a.check(pr);}).length + " / " + window.APP2.ACHIEVEMENTS.length; }, "–"); }},
    {id:"f3", t:"Nächstes Abzeichen", v:function(){ return safe(nextAchievementProgress, "–"); }},
    {id:"f4", t:"Müdeste Muskelgruppe", v:function(){ return safe(mostTiredGroup, "keine Belastung"); }},
    {id:"f5", t:"Längste Serie", v:function(){ return A.longestStreakF() + " Tage"; }},
    {id:"f6", t:"Ruhetage diese Woche", v:function(){ return restDaysUsedThisWeek() + "×"; }},
    {id:"f7", t:"Schnellster Lauf", v:function(){ return safe(function(){ var p=window.APP2.computePRs(); return p.bestPaceSec ? W.fmtPace(p.bestPaceSec) : null; }, "noch keiner"); }},
    {id:"f8", t:"Weiteste Distanz", v:function(){ return safe(function(){ var p=window.APP2.computePRs(); return p.farthestKm>0 ? (Math.round(p.farthestKm*10)/10)+" km" : null; }, "–"); }},
    {id:"f9", t:"Trainingstage gesamt", v:function(){ return totalDoneCount() + ""; }},
    {id:"f10", t:"Kalorien diese Woche", v:function(){ var mon=W.weekMonday(S.today); var sum=0; for(var i=0;i<7;i++){var d=W.addDays(mon,i); if(d>S.today) break; sum+=OS.dayBurn(d,S.log,S.activities,S.settings,body()).total;} return fc(sum); }}
  ],
  einst: [
    {id:"e1", t:"App-Version", v:function(){ return W.APP_VERSION; }},
    {id:"e2", t:"Trainingsziel", v:function(){ return W.GOAL_LABEL[S.settings.goal] || "–"; }},
    {id:"e3", t:"Cloud-Sicherung", v:function(){ var st = window.SharedCalendar && window.SharedCalendar.status(); return (st && st.connected) ? "aktiv" : (S.sync && S.sync.auto) ? "GitHub aktiv" : "aus"; }},
    {id:"e4", t:"Zuletzt synchronisiert", v:function(){ return (S.sync && S.sync.lastSync) ? new Date(S.sync.lastSync).toLocaleDateString("de-DE") : "nie"; }},
    {id:"e5", t:"Wetter-Standort", v:function(){ return (S.weather && S.weather.place) || "nicht gesetzt"; }},
    {id:"e6", t:"Erinnerung", v:function(){ return S.settings.reminder || "aus"; }},
    {id:"e7", t:"Tonfall", v:function(){ var m={neutral:"neutral", enthu:"enthusiastisch", sachlich:"sachlich"}; return m[(S.uiPrefs&&S.uiPrefs.tone)||"neutral"]; }},
    {id:"e8", t:"Design", v:function(){ var m={dark:"dunkel", light:"hell", auto:"automatisch"}; return m[(S.uiPrefs&&S.uiPrefs.themeMode)||"dark"]; }},
    {id:"e9", t:"Feste Ruhetage", v:function(){ return (S.settings.restDays||[]).length + " Wochentage"; }},
    {id:"e10", t:"Gespeicherte Tage", v:function(){ return totalDoneCount() + ""; }}
  ]
};

var DEFAULT_ON = {
  heute: ["h1","h2","h3","h4"], kalender: ["k1","k2","k3","k11","k12"],
  lauf: ["l1","l2","l3","l4"], daten: ["d1","d2","d3","d4"],
  fitness: ["f1","f2","f5","f6"], einst: ["e1","e2","e3","e9"]
};
S.widgetsOn = A.store.get("wk_widgets", null) || JSON.parse(JSON.stringify(DEFAULT_ON));

function saveWidgets(){ A.store.set("wk_widgets", S.widgetsOn); }

function renderWidgets(screen){
  var host = $("widgetArea-" + screen);
  if (!host) return;
  var defs = WIDGET_DEFS[screen] || [];
  var on = S.widgetsOn[screen] || [];
  host.innerHTML = "";
  on.forEach(function(id){
    var def = defs.filter(function(d){ return d.id === id; })[0];
    if (!def) return;
    var val;
    try { val = def.v(); } catch(e){ val = "–"; }
    var tile = el("div","widget-tile" + (def.interactive ? " widget-tile-tap" : ""));
    tile.innerHTML = "<div class='wt-label'>" + esc(def.t) + "</div><div class='wt-value'>" + esc(String(val)) + "</div>";
    if (def.interactive) tile.onclick = function(){ if (def.id === "k11") openSickDialog(); else if (def.id === "k12") openInjuryDialog(); };
    host.appendChild(tile);
  });
}
function renderAllWidgets(){ Object.keys(WIDGET_DEFS).forEach(renderWidgets); }

/* ============================================================
   SEITENBEREICHE: nicht nur die Kacheln unten, sondern jeder
   feste Abschnitt der Seite lässt sich ein-/ausblenden und in der
   Reihenfolge anpassen. Technisch über CSS (order + eine Klasse
   fürs Verstecken) statt echtem Verschieben im DOM, damit keine
   bestehende Funktion durch Umsortieren beeinträchtigt wird.
   ============================================================ */
var SECTION_DEFS = {
  heute: [
    {id:"whatsnew", l:"\"Neu in dieser Version\"-Hinweis"},
    {id:"weatherwarn", l:"Wetter-Warnbanner"},
    {id:"sickcheckin", l:"Krankheits-Nachfrage"},
    {id:"injurycheckin", l:"Verletzungs-Nachfrage"},
    {id:"importcard", l:"Import-Hinweis nach Datei-Upload"},
    {id:"readiness", l:"Trainingsbereitschaft"},
    {id:"hero", l:"Trainingskarte"},
    {id:"kpis", l:"Kennzahlen (Bereitschaft, Wetter, Woche)"},
    {id:"tsheute", l:"Dazu heute (Mobility, Atmung)"},
    {id:"adaptive", l:"Alternative Trainingsvorschläge"},
    {id:"stats", l:"Statistik-Zeile"},
    {id:"exercises", l:"Deine Übungen heute"},
    {id:"weekbar", l:"Diese Woche"},
    {id:"tip", l:"Tagestipp"},
    {id:"weathertoday", l:"Wetter heute"}
  ],
  kalender: [
    {id:"calstats", l:"Statistik-Zeile"},
    {id:"calweather", l:"Wetter-Vorschau"},
    {id:"calgrid", l:"Kalenderraster"},
    {id:"caltoday", l:"\"Zu heute springen\"-Knopf"},
    {id:"calmonthsummary", l:"Monatsrückblick"},
    {id:"calstreaktext", l:"Serien-Verlauf"},
    {id:"calupcoming", l:"Nächste Termine"},
    {id:"calyearprogress", l:"Jahresfortschritt"},
    {id:"calsickoverview", l:"Krankheitsübersicht"},
    {id:"calinjuryoverview", l:"Verletzungsübersicht"},
    {id:"calweekoverview", l:"Diese Woche im Überblick"},
    {id:"tsweekall", l:"Woche aller Bereiche"}
  ],
  lauf: [
    {id:"tsmob", l:"Mobility & Dehnen"},
    {id:"tsbreath", l:"Atmung & HRV"},
    {id:"tsbahn", l:"Bahnplan"},
    {id:"stretch", l:"Dehnen & Mobility"},
    {id:"rodeln", l:"Rodeln vorbereiten"},
    {id:"gym", l:"Gym-Training"},
    {id:"runtrack", l:"Lauf live tracken (GPS)"},
    {id:"distance", l:"Distanz wählen"},
    {id:"sportlog", l:"Zuletzt erfasst"},
    {id:"runstats", l:"Lauf-Statistik"},
    {id:"rodelnhistory", l:"Rodeln-Verlauf"},
    {id:"gymhistory", l:"Gym-Verlauf"},
    {id:"stretchhistory", l:"Dehn-Verlauf"},
    {id:"nextrunday", l:"Nächster Lauftag"},
    {id:"favoritesport", l:"Lieblingssport"},
    {id:"cooldownstatus", l:"Cool-down-Status"}
  ],
  fitness: [
    {id:"fitscore", l:"Fitness-Score"},
    {id:"fitweek", l:"Wochenrückblick"},
    {id:"fitpr", l:"Persönliche Rekorde"},
    {id:"fitach", l:"Abzeichen"},
    {id:"fitreadiness", l:"Readiness & Recovery"},
    {id:"fitfatigue", l:"Ermüdung nach Muskelgruppe"},
    {id:"fitwhy", l:"Woraus sich das ergibt"},
    {id:"fitmuscles", l:"Muskelgruppen"},
    {id:"fitweeks", l:"Einheiten pro Woche"},
    {id:"fitbest", l:"Bestwerte"},
    {id:"tssources", l:"Wissenschaftliche Grundlagen"}
  ],
  daten: [
    {id:"dbefund", l:"Ehrlicher Befund"},
    {id:"drings", l:"Wochen-Ringe"},
    {id:"dkpis", l:"Kennzahlen-Kacheln"},
    {id:"dweeks12", l:"12 Wochen Übungen"},
    {id:"dweekoverview", l:"Wochenübersicht"},
    {id:"dsharecard", l:"Share-Karte"},
    {id:"ddropzone", l:"Datei-Import"},
    {id:"dagoverview", l:"28-Tage-Übersicht"},
    {id:"dkmweek", l:"Kilometer pro Woche"},
    {id:"dactivities", l:"Aktivitäten-Liste"},
    {id:"dexport", l:"Export"},
    {id:"dpdfexport", l:"Trainingsbericht (PDF)"}
  ]
};
S.sectionsOn = A.store.get("wk_sections", null) || {};
// in 4.0 neu dazugekommene Bereiche
var NEW_V4 = ["kpis","tsheute","tsmob","tsbreath","tsbahn","tssources","tsweekall"];
(function(){
  // __seen: welche Bereiche die App schon angeboten hat – nur wirklich neue werden angehängt, ausgeblendete bleiben aus.
  // Steht im selben Schlüssel wie die Auswahl, damit Sicherung, Cloud und Umzug beides zusammen tragen.
  // Ohne __seen (alte Version, alte Sicherung) wird wie früher alles Fehlende angehängt – nichts wird erraten.
  var seen = S.sectionsOn.__seen || A.store.get("wk_sections_seen", null);   // Rückfall: Zwischenstand vor 3.7.0
  Object.keys(SECTION_DEFS).forEach(function(scr){
    var allIds = SECTION_DEFS[scr].map(function(d){ return d.id; });
    if (!S.sectionsOn[scr]){ S.sectionsOn[scr] = allIds.slice(); return; }
    var known = S.sectionsOn[scr], was = seen ? (seen[scr] || []) : [];
    allIds.forEach(function(id){ if (was.indexOf(id) < 0 && known.indexOf(id) < 0) known.push(id); });
  });
  seen = {}; Object.keys(SECTION_DEFS).forEach(function(scr){ seen[scr] = SECTION_DEFS[scr].map(function(d){ return d.id; }); });
  S.sectionsOn.__seen = seen;
})();
function saveSections(){ A.store.set("wk_sections", S.sectionsOn); }
/* Umbau 4.0: neue Grundreihenfolge (Hauptaktion oben, Verläufe unten), einmalig (__v4).
   Hatte jemand die Reihenfolge selbst geändert, bleibt sie – dann werden nur die neuen Bereiche passend eingereiht. */
var ORDER_V4 = {
  heute: ["hero","kpis","sickcheckin","injurycheckin","adaptive","weatherwarn","tsheute","exercises","stats","readiness","weathertoday","weekbar","whatsnew","importcard","tip"],
  lauf: ["runtrack","gym","tsmob","distance","nextrunday","stretch","rodeln","tsbreath","tsbahn","sportlog","runstats","gymhistory","stretchhistory","rodelnhistory","favoritesport","cooldownstatus"],
  fitness: ["fitscore","fitweek","fitweeks","fitbest","fitpr","fitach","fitreadiness","fitfatigue","fitmuscles","fitwhy","tssources"],
  daten: ["dkpis","drings","dbefund","dweeks12","dweekoverview","dsharecard","dagoverview","dkmweek","ddropzone","dactivities","dexport","dpdfexport"]
};
if (!S.sectionsOn.__v4 && A.store.get("wk_sections_v4", null)) S.sectionsOn.__v4 = 1;
if (!S.sectionsOn.__v4){
  Object.keys(ORDER_V4).forEach(function(scr){
    var list = S.sectionsOn[scr] || [], v4 = ORDER_V4[scr];
    var oldDef = SECTION_DEFS[scr].map(function(d){ return d.id; }).filter(function(id){ return NEW_V4.indexOf(id) < 0; });
    var mine = list.filter(function(id){ return NEW_V4.indexOf(id) < 0; });
    var untouched = mine.join() === oldDef.filter(function(id){ return mine.indexOf(id) >= 0; }).join();
    if (untouched) S.sectionsOn[scr] = v4.filter(function(id){ return list.indexOf(id) >= 0; }).concat(list.filter(function(id){ return v4.indexOf(id) < 0; }));
    else {
      var out = mine.slice();
      v4.forEach(function(id, i){
        if (NEW_V4.indexOf(id) < 0 || list.indexOf(id) < 0) return;
        var j = i - 1; while (j >= 0 && out.indexOf(v4[j]) < 0) j--;
        out.splice(j < 0 ? 0 : out.indexOf(v4[j]) + 1, 0, id);
      });
      S.sectionsOn[scr] = out;
    }
  });
  S.sectionsOn.__v4 = 1;
}
saveSections();
/* ============================================================
   Inhalte der neuen Kalender-Bereiche
   ============================================================ */
/* ============================================================
   Inhalte der neuen Training-Bereiche
   ============================================================ */
function renderLaufSections(){
  if (!$("runStatsText")) return;
  var km = sumKm();
  $("runStatsText").textContent = (S.activities||[]).length === 0
    ? "Noch keine Aktivitäten erfasst."
    : (Math.round(km*10)/10) + " km insgesamt in " + (S.activities||[]).length + " erfassten Aktivitäten.";

  var rodelnCount = Object.keys(S.log).filter(function(k){ return S.log[k] && S.log[k].type === "rodeln"; }).length;
  $("rodelnHistoryText").textContent = rodelnCount === 0
    ? "Noch nicht absolviert. Einmal ausprobieren?"
    : "Bereits " + rodelnCount + "× absolviert.";

  var gymDates = Object.keys(S.gymLog || {});
  var gymVolTotal = gymDates.reduce(function(sum, d){ return sum + (S.gymLog[d].totalVolume || 0); }, 0);
  $("gymHistoryText").textContent = gymDates.length === 0
    ? "Noch kein Gym-Training erfasst."
    : gymDates.length + " Einheit" + (gymDates.length===1?"":"en") + " · " + Math.round(gymVolTotal) + " kg bewegte Gesamttonnage insgesamt.";

  var mon = W.weekMonday(S.today);
  var stretchCount = 0;
  for (var i = 0; i < 7; i++){
    var d = W.addDays(mon, i);
    if (d > S.today) break;
    if (S.log[d] && S.log[d].done && /dehn|stretch/i.test(S.log[d].type || "")) stretchCount++;
  }
  $("stretchHistoryText").textContent = stretchCount + "× diese Woche gedehnt.";

  $("nextRunDayText").textContent = "Am " + fmtShortDate(nextRunDayStr()) + " ist laut Plan der nächste Lauftag.";

  $("favoriteSportText").textContent = safe(function(){
    var s = mostCommonActivityType();
    return s ? s + " ist bisher dein am häufigsten erfasster Sport." : null;
  }, "Noch keine Aktivitäten erfasst, aus denen sich ein Muster ablesen lässt.");

  var cdOn = S.uiPrefs && S.uiPrefs.autoCooldown !== false;
  $("cooldownStatusText").textContent = cdOn
    ? "Aktiv – nach dem Training wird automatisch ein kurzes Cool-down vorgeschlagen."
    : "Ausgeschaltet – lässt sich in Einstellungen → Verhalten wieder aktivieren.";
}

function renderCalendarSections(){
  if (!$("calMonthSummaryText")) return;
  var y = S.calMonth.getFullYear(), m = S.calMonth.getMonth();
  var days = new Date(y, m+1, 0).getDate();
  var vergangen = 0, erledigt = 0;
  for (var d = 1; d <= days; d++){
    var ds = y + "-" + String(m+1).padStart(2,"0") + "-" + String(d).padStart(2,"0");
    if (ds <= S.today) vergangen++;
    if (S.log[ds] && S.log[ds].done) erledigt++;
  }
  var monatsName = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][m];
  $("calMonthSummaryText").textContent = vergangen === 0
    ? monatsName + " hat gerade erst begonnen."
    : monatsName + ": " + erledigt + " von " + vergangen + " vergangenen Tagen erledigt (" + Math.round(erledigt/vergangen*100) + "%).";

  var cur = A.currentStreakF(), best = A.longestStreakF();
  $("calStreakText").textContent = cur === 0
    ? "Aktuell keine laufende Serie. Bisheriger Rekord: " + best + " Tage."
    : "Aktuelle Serie: " + cur + " Tage" + (cur >= best ? " – das ist dein bisheriger Rekord!" : ", Rekord bisher " + best + " Tage") + ".";

  var nr = nextRestDay(), nl = nextRunDayStr();
  var parts = [];
  if (nr) parts.push("nächster Ruhetag " + fmtShortDate(nr));
  if (nl) parts.push("nächster Lauftag " + fmtShortDate(nl));
  $("calUpcomingText").textContent = parts.length ? parts.join(" · ") + "." : "Aktuell keine festen Termine in den nächsten zwei Wochen.";

  var doy = dayOfYear(S.today), total = isLeap(S.today) ? 366 : 365;
  var pct = Math.round(doy/total*100);
  $("calYearLabel").textContent = "Tag " + doy + " von " + total;
  $("calYearPct").textContent = pct + "%";
  $("calYearBar").style.width = pct + "%";

  var sn = sickYearCount();
  $("calSickText").textContent = sn === 0
    ? "Keine Kranktage in diesem Jahr erfasst."
    : sn + " Kranktag" + (sn===1?"":"e") + " in diesem Jahr" + (S.illnessActive ? " · Krankheitsmodus gerade aktiv" : "") + ".";

  var inj = injuryYearCount();
  $("calInjuryText").textContent = inj === 0
    ? "Keine Verletzungstage in diesem Jahr erfasst."
    : inj + " Verletzungstag" + (inj===1?"":"e") + " in diesem Jahr" + (S.injuryActive ? " · Verletzungsmodus gerade aktiv" : "") + ".";

  var mon = W.weekMonday(S.today);
  var labels = [];
  for (var i = 0; i < 7; i++){
    var wd = W.addDays(mon, i);
    var tag = A.DAYS_SHORT[W.parseYmd(wd).getDay()];
    var mark = wd > S.today ? "geplant" : (S.log[wd] && S.log[wd].done) ? "erledigt" : (wd === S.today ? "heute" : "offen");
    labels.push(tag + " " + mark);
  }
  $("calWeekOverviewText").textContent = labels.join(" · ");
}

function applySections(screen){
  var defs = SECTION_DEFS[screen];
  if (!defs) return;
  var on = S.sectionsOn[screen] || defs.map(function(d){ return d.id; });
  defs.forEach(function(def){
    var elx = document.querySelector('[data-sec="' + def.id + '"]');
    if (!elx) return;
    var idx = on.indexOf(def.id);
    if (idx < 0){ elx.classList.add("sec-hidden"); }
    else { elx.classList.remove("sec-hidden"); elx.style.order = idx * 2 + 2; }   // ungerade Plätze für Überschriften
  });
  tidy(screen);
}

/* ============================================================
   AUFGERÄUMT (4.0): einklappbare Karten, Kennzahlenreihe,
   Überschrift „Verlauf“ vor den Verläufen. Zu zeigt eine Karte nur
   ihre Kopfzeile mit der Kernzahl; der Zustand bleibt gemerkt.
   ============================================================ */
var AKK_KEY = "sg-training-akk-v1";
// Karte → standardmäßig offen (1) oder zu (0); nicht genannte Karten klappen nicht
var AKK = {
  heute: { exercises:0, readiness:0, weathertoday:0, weekbar:0, sickcheckin:0, injurycheckin:0, adaptive:0, whatsnew:0, importcard:0, tip:0 },
  lauf: { tsbreath:0, tsbahn:0, sportlog:0, runstats:0, gymhistory:0, stretchhistory:0, rodelnhistory:0, favoritesport:0, cooldownstatus:0 },
  fitness: { tssources:0, fitweek:0, fitpr:0, fitach:0, fitreadiness:0, fitfatigue:0, fitwhy:0, fitmuscles:0, fitweeks:0, fitbest:0 },
  daten: { dbefund:0, dweeks12:0, dweekoverview:0, dsharecard:0, dkmweek:0, dactivities:0, dexport:0, dpdfexport:0 },
  kalender: { calmonthsummary:0, calstreaktext:0, calupcoming:0, calyearprogress:0, calsickoverview:0, calinjuryoverview:0, calweekoverview:0 }
};
var HIST = ["sportlog","runstats","gymhistory","stretchhistory","rodelnhistory","favoritesport","cooldownstatus"];
// Zwischenüberschriften: stehen vor dem ersten sichtbaren Bereich ihrer Gruppe
var GROUPS = {
  lauf: [["Verlauf & Statistik", HIST]],
  fitness: [["Fortschritt", ["fitweek","fitweeks","fitbest","fitpr","fitach"]], ["Körper und Erholung", ["fitreadiness","fitfatigue","fitmuscles","fitwhy"]]],
  daten: [["Fortschritt", ["dagoverview","dkmweek"]], ["Aktivitäten", ["ddropzone","dactivities"]], ["Berichte und Export", ["dexport","dpdfexport"]]]
};
var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
function weekDone(){ var mon = W.weekMonday(S.today), n = 0; for (var i = 0; i < 7; i++){ var d = W.addDays(mon, i); if (S.log[d] && S.log[d].done) n++; } return n; }
// Kernzahl je Karte im zugeklappten Zustand (sonst: erster Text der Karte)
var SUM = {
  weekbar: function(){ return weekDone() + " von 7 Tagen trainiert"; },
  exercises: function(){ return ($("exCount") || {}).textContent || ""; },
  sportlog: function(){ var n = +(($("sportLogCount") || {}).textContent || 0); return n ? n + (n === 1 ? " Eintrag" : " Einträge") : "noch nichts erfasst"; },
  fitpr: function(c){ var n = c.querySelectorAll("#prList > *").length; return n ? n + (n === 1 ? " Rekord" : " Rekorde") : "noch keine Rekorde"; }
};
function akkState(){ try { return JSON.parse(localStorage.getItem(AKK_KEY) || "{}") || {}; } catch(e){ return {}; } }
function akkOpen(id, def){ var st = akkState(); return st[id] != null ? !!st[id] : !!def; }
function akkSet(id, open){ var st = akkState(); st[id] = open ? 1 : 0; try { localStorage.setItem(AKK_KEY, JSON.stringify(st)); } catch(e){} }
function akkCard(id){ var c = document.querySelector('[data-sec="' + id + '"]'); return c && c.querySelector(":scope > .card-h") ? c : (c && c.querySelector(".card") && c.querySelector(".card").querySelector(":scope > .card-h") ? c.querySelector(".card") : null); }
function akkSummary(c, id){
  if (SUM[id]) return SUM[id](c);
  var hd = c.querySelector(":scope > .card-h"), own = hd.querySelector(":scope > span:not(.acc-sum)");
  if (own && own.textContent.trim()) return "";
  var src = null;
  Array.prototype.some.call(c.querySelectorAll("p, .wtemp, .wlabel, #readyScoreTxt, li"), function(x){ if (x.closest(".card-h") || !x.textContent.trim() || x.textContent.trim() === "–") return false; src = x; return true; });
  if (src) return src.textContent.trim().replace(/\s+/g, " ").slice(0, 80);
  // sonst die erste Textzeile unter der Kopfzeile
  var txt = (c.textContent || "").replace(hd.textContent, "").split("\n").map(function(x){ return x.trim(); }).filter(function(x){ return x && x !== "–"; })[0];
  return txt ? txt.slice(0, 80) : "";
}
function tidy(screen){
  var defs = AKK[screen] || {};
  Object.keys(defs).forEach(function(id){
    var c = akkCard(id); if (!c) return;
    var hd = c.querySelector(":scope > .card-h"), h2 = hd.querySelector("h2");
    if (!c.classList.contains("acc")){
      // echter Knopf in der Überschrift (Muster „Akkordeon“): Überschrift bleibt Überschrift, Zusatzknöpfe stehen daneben
      c.classList.add("acc"); c.dataset.acc = id; c.id = c.id || "acc-" + id;
      var bt = document.createElement("button"); bt.type = "button"; bt.className = "acc-t"; bt.setAttribute("aria-controls", c.id);
      while (h2 && h2.firstChild) bt.appendChild(h2.firstChild);
      if (h2) h2.appendChild(bt);
      var sum = document.createElement("span"); sum.className = "acc-sum"; sum.setAttribute("aria-hidden", "true"); hd.appendChild(sum);
      if (SUM[id]) c.classList.add("sumx");
    }
    var open = akkOpen(id, defs[id]), btn = hd.querySelector(".acc-t");
    c.classList.toggle("open", open); c.classList.toggle("closed", !open);
    if (btn) btn.setAttribute("aria-expanded", String(open));
    hd.querySelector(".acc-sum").textContent = open ? "" : akkSummary(c, id);
  });
  // Zwischenüberschriften der Gruppen
  (GROUPS[screen] || []).forEach(function(g, gi){
    var host = $("s-" + screen); if (!host) return;
    var lab = host.querySelector('.sec-label[data-grp="' + screen + gi + '"]') || (screen === "lauf" && host.querySelector('.sec-label[data-grp="verlauf"]'));
    if (!lab){ lab = document.createElement("div"); lab.className = "sec-label grp"; lab.textContent = g[0]; host.appendChild(lab); }
    lab.dataset.grp = lab.dataset.grp === "verlauf" ? "verlauf" : screen + gi;
    var first = null;
    g[1].forEach(function(id){ var e = host.querySelector('[data-sec="' + id + '"]'); if (e && !e.classList.contains("sec-hidden") && getComputedStyle(e).display !== "none" && (!first || +e.style.order < +first.style.order)) first = e; });
    // die Überschrift gehört in denselben Behälter wie ihre Karten (Analyse: Bereiche liegen in Reitern)
    if (first && lab.parentNode !== first.parentNode) first.parentNode.appendChild(lab);
    lab.classList.toggle("on", !!first); if (first) lab.style.order = +first.style.order - 1;
  });
  if (screen === "lauf"){
    // Freies Dehnen und Rodeln-Aufwärmen stecken in „Mobility & Dehnen“ – ist die ausgeblendet, kommen die Einzelkarten zurück
    var mob = document.querySelector('[data-sec="tsmob"]'), merged = !!(mob && !mob.classList.contains("sec-hidden"));
    ["stretch", "rodeln"].forEach(function(k){ var x = document.querySelector('#s-lauf [data-sec="' + k + '"]'); if (x) x.classList.toggle("ts-merged", merged); });
    // Kopf passend zum Ausschnitt
    var part = $("s-lauf").getAttribute("data-part"), h1 = document.querySelector("#s-lauf .top h1");
    if (h1) h1.textContent = part === "kraft" ? "Kraft" : part === "lauf" ? "Laufen" : "Training";
    if ($("runDayInfo")) $("runDayInfo").hidden = part === "kraft";
  }
  if (screen === "heute") kpis();
  if (screen === "fitness") fitKpis();
}
function akkToggle(c){
  var open = !c.classList.contains("open"); akkSet(c.dataset.acc, open);
  var scr = c.closest(".screen"); tidy(scr ? scr.id.replace(/^s-/, "") : S.screen);
}
document.addEventListener("click", function(e){
  // zu: die ganze Karte ist Tippfläche; offen: die Kopfzeile (ohne ihre Zusatzknöpfe)
  var acc = e.target.closest(".acc"), other = e.target.closest("button, a, input, select, label, textarea");
  if (acc && (e.target.closest(".acc-t") || (!other && (acc.classList.contains("closed") || e.target.closest(".acc > .card-h"))))) { akkToggle(acc); return; }
  var k = e.target.closest("[data-acc-open]");
  if (k){
    var c = akkCard(k.dataset.accOpen); if (!c || !c.offsetParent) return;
    if (!c.classList.contains("open")) akkToggle(c);
    window.scrollTo({ top: Math.max(0, c.getBoundingClientRect().top + window.scrollY - 12), behavior: RM ? "auto" : "smooth" });
  }
});
// Ampel: eigene Farben (nicht die Akzentfarbe der Farbwelt) und dazu ein Wort
var AMP = { gut: "gut", mittel: "mäßig", schlecht: "schwach" };
function kpis(){
  var row = document.querySelector('[data-sec="kpis"]'); if (!row) return;
  var rc = $("readinessCard"), wc = $("weatherToday"), kr = $("kpiReady"), kw = $("kpiWeather"), kk = $("kpiWeek");
  var rOn = rc && rc.style.display !== "none" && !rc.classList.contains("sec-hidden"), pct = rOn ? parseInt(($("readyPct") || {}).textContent, 10) : NaN;
  kr.hidden = !rOn || isNaN(pct);
  if (!kr.hidden){ var amp = pct >= 70 ? "gut" : pct >= 40 ? "mittel" : "schlecht"; kr.querySelector("b").textContent = pct + " % · " + AMP[amp]; kr.dataset.amp = amp; kr.setAttribute("aria-label", "Bereitschaft " + pct + " Prozent, " + AMP[amp]); }
  var wOn = wc && wc.style.display !== "none" && !wc.classList.contains("sec-hidden") && $("wTodayTemp") && $("wTodayTemp").textContent.trim() !== "–";
  kw.hidden = !wOn;
  if (wOn){ kw.querySelector("b").textContent = $("wTodayTemp").textContent.trim(); kw.querySelector("span").textContent = $("wTodayLabel").textContent.trim() || "Wetter"; }
  var mon = W.weekMonday(S.today), dots = "", n = weekDone();
  for (var i = 0; i < 7; i++){ var d = W.addDays(mon, i), on = !!(S.log[d] && S.log[d].done); dots += '<i class="' + (on ? "on" : "") + (d === S.today ? " today" : "") + '"></i>'; }
  kk.querySelector(".dots").innerHTML = dots; kk.setAttribute("aria-label", "Diese Woche " + n + " von 7 Tagen trainiert");
  var wb = $("kpiWeek"), wbc = akkCard("weekbar"); wb.toggleAttribute("data-acc-open", false); if (wbc && wbc.offsetParent) wb.setAttribute("data-acc-open", "weekbar");
  var vis = [kr, kw, kk].filter(function(x){ return !x.hidden; }).length;
  row.style.gridTemplateColumns = "repeat(" + vis + ", minmax(0, 1fr))";
}
// Auswertung › Fitness: unter dem Fitness-Wert vier Kennzahlen (Woche, Monat, Serie, Rekorde), Tipp öffnet die Details
function fitKpis(){
  var host = document.querySelector('#s-fitness [data-sec="fitscore"]'); if (!host) return;
  var row = $("fitKpis");
  if (!row){ row = document.createElement("div"); row.id = "fitKpis"; row.className = "kpi-row four"; host.appendChild(row); }
  var streak = ($("streakVal") || {}).textContent || "0", prs = document.querySelectorAll("#prList > *").length;
  var tiles = [[W.doneInLastDays(S.log, S.today, 7) + "/7", "Woche", "fitweek"], [W.doneInLastDays(S.log, S.today, 30) + "", "30 Tage", "fitweeks"], [streak, "Serie", "fitbest"], [prs + "", "Rekorde", "fitpr"]];
  var h = tiles.map(function(t){ return '<button class="kpi" data-acc-open="' + t[2] + '"><b>' + esc(t[0]) + "</b><span>" + t[1] + "</span></button>"; }).join("");
  if (row.dataset.h !== h){ row.innerHTML = h; row.dataset.h = h; }
}
// welche Bereiche im Ausschnitt Laufen bzw. Kraft gar nicht vorkommen (wie die Regeln in training/index.html)
var PART_OFF = { lauf: ["stretch","rodeln","gym","rodelnhistory","gymhistory","stretchhistory","cooldownstatus","tsmob","tsbreath","tsbahn"],
  kraft: ["runtrack","distance","sportlog","runstats","nextrunday","favoritesport"] };
function renderSectionEditorList(screen){
  var part = screen === "lauf" && $("s-lauf").getAttribute("data-part");
  var defs = SECTION_DEFS[screen] && SECTION_DEFS[screen].filter(function(d){ return !part || PART_OFF[part].indexOf(d.id) < 0; });
  var host = $("sectionsList");
  host.innerHTML = "";
  if (!defs){
    host.appendChild(el("p","muted","Für diese Seite gibt es keine umstellbaren Bereiche, nur Kacheln."));
    return;
  }
  var on = S.sectionsOn[screen] || defs.map(function(d){ return d.id; });
  var ordered = on.map(function(id){ return defs.filter(function(d){ return d.id === id; })[0]; }).filter(Boolean);
  var rest = defs.filter(function(d){ return on.indexOf(d.id) < 0; });
  ordered.concat(rest).forEach(function(def){
    var isOn = on.indexOf(def.id) >= 0;
    var row = el("div","widget-check-row");
    var arrows = "";
    if (isOn){
      var vis = on.filter(function(id){ return defs.some(function(d){ return d.id === id; }); }), pos = vis.indexOf(def.id);
      arrows = "<button class='wmove' data-dir='up' " + (pos===0?"disabled":"") + ">▲</button>" +
               "<button class='wmove' data-dir='down' " + (pos===vis.length-1?"disabled":"") + ">▼</button>";
    }
    row.innerHTML = "<div class='wl'><b>" + esc(def.l) + "</b></div><div class='wmove-group'>" + arrows + "</div>";
    var sw = document.createElement("button");
    sw.className = "sw" + (isOn ? " on" : "");
    sw.onclick = function(){
      var list = S.sectionsOn[screen] || [];
      var i = list.indexOf(def.id);
      if (i >= 0) list.splice(i,1); else list.push(def.id);
      S.sectionsOn[screen] = list;
      saveSections(); applySections(screen); renderSectionEditorList(screen);
    };
    row.appendChild(sw);
    Array.prototype.forEach.call(row.querySelectorAll(".wmove"), function(btn){
      btn.onclick = function(){
        var list = S.sectionsOn[screen] || [];
        var i = list.indexOf(def.id);
        // Nachbar überspringen, der im Ausschnitt (Laufen/Kraft) gar nicht zu sehen ist
        var step = btn.dataset.dir === "up" ? -1 : 1, j = i + step, ids = defs.map(function(d){ return d.id; });
        while (j >= 0 && j < list.length && ids.indexOf(list[j]) < 0) j += step;
        if (j < 0 || j >= list.length) return;
        var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
        S.sectionsOn[screen] = list;
        saveSections(); applySections(screen); renderSectionEditorList(screen);
      };
    });
    host.appendChild(row);
  });
}

function openWidgetEditor(screen){
  renderSectionEditorList(screen);
  renderWidgetEditorList(screen);
  var hasSections = !!SECTION_DEFS[screen];
  var tabHost = $("widgetsTab");
  tabHost.style.display = hasSections ? "" : "none";
  Array.prototype.forEach.call(tabHost.children, function(b){ b.classList.toggle("on", b.dataset.v === "sections"); });
  $("sectionsList").style.display = "";
  $("widgetsList").style.display = "none";
  if (!hasSections){
    $("sectionsList").style.display = "none";
    $("widgetsList").style.display = "";
  }
  Array.prototype.forEach.call(tabHost.children, function(b){
    b.onclick = function(){
      Array.prototype.forEach.call(tabHost.children, function(x){ x.classList.toggle("on", x === b); });
      $("sectionsList").style.display = b.dataset.v === "sections" ? "" : "none";
      $("widgetsList").style.display = b.dataset.v === "widgets" ? "" : "none";
    };
  });
  $("dlgWidgets").showModal ? (function(){ try { $("dlgWidgets").showModal(); } catch(e){ $("dlgWidgets").setAttribute("open",""); } })() : $("dlgWidgets").setAttribute("open","");
}
function renderWidgetEditorList(screen){
  var defs = WIDGET_DEFS[screen] || [];
  var on = S.widgetsOn[screen] || [];
  var host = $("widgetsList"); host.innerHTML = "";
  // Aktive Widgets zuerst, in ihrer aktuellen Reihenfolge, danach die noch nicht ausgewählten.
  var ordered = on.map(function(id){ return defs.filter(function(d){ return d.id === id; })[0]; }).filter(Boolean);
  var rest = defs.filter(function(d){ return on.indexOf(d.id) < 0; });
  ordered.concat(rest).forEach(function(def, idx){
    var isOn = on.indexOf(def.id) >= 0;
    var row = el("div","widget-check-row");
    var val; try { val = def.v(); } catch(e){ val = "–"; }
    var arrows = "";
    if (isOn){
      var vis = on.filter(function(id){ return defs.some(function(d){ return d.id === id; }); }), pos = vis.indexOf(def.id);
      arrows = "<button class='wmove' data-dir='up' " + (pos===0?"disabled":"") + ">▲</button>" +
               "<button class='wmove' data-dir='down' " + (pos===vis.length-1?"disabled":"") + ">▼</button>";
    }
    row.innerHTML = "<div class='wl'><b>" + esc(def.t) + "</b><span>" + esc(String(val)) + "</span></div>" +
      "<div class='wmove-group'>" + arrows + "</div>";
    var sw = document.createElement("button");
    sw.className = "sw" + (isOn ? " on" : "");
    sw.dataset.id = def.id;
    sw.onclick = function(){
      var list = S.widgetsOn[screen] || [];
      var i = list.indexOf(def.id);
      if (i >= 0) list.splice(i,1); else list.push(def.id);
      S.widgetsOn[screen] = list;
      saveWidgets(); renderWidgets(screen); renderWidgetEditorList(screen);
    };
    row.appendChild(sw);
    Array.prototype.forEach.call(row.querySelectorAll(".wmove"), function(btn){
      btn.onclick = function(){
        var list = S.widgetsOn[screen] || [];
        var i = list.indexOf(def.id);
        // Nachbar überspringen, der im Ausschnitt (Laufen/Kraft) gar nicht zu sehen ist
        var step = btn.dataset.dir === "up" ? -1 : 1, j = i + step, ids = defs.map(function(d){ return d.id; });
        while (j >= 0 && j < list.length && ids.indexOf(list[j]) < 0) j += step;
        if (j < 0 || j >= list.length) return;
        var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
        S.widgetsOn[screen] = list;
        saveWidgets(); renderWidgets(screen); renderWidgetEditorList(screen);
      };
    });
    host.appendChild(row);
  });
}

document.addEventListener("click", function(e){
  var b = e.target.closest(".widget-edit-btn");
  if (b) openWidgetEditor(b.dataset.screen);
});
var wc = $("widgetsClose");
if (wc) wc.addEventListener("click", function(){
  try { $("dlgWidgets").close(); } catch(e){}
  $("dlgWidgets").removeAttribute("open");
});

/* In die bestehende Render-Kette einhängen, wie APP2/APP3/APP4 auch */
renderAllWidgets();
Object.keys(SECTION_DEFS).forEach(applySections);

window.APP5 = {
  layout: function(){ Object.keys(SECTION_DEFS).forEach(applySections); },
  renderWidgets: renderWidgets, renderAllWidgets: renderAllWidgets, WIDGET_DEFS: WIDGET_DEFS,
  after: function(screen){
    renderWidgets(screen); applySections(screen);
    if (screen === "kalender") renderCalendarSections();
    if (screen === "lauf") renderLaufSections();
  }
};
})();
