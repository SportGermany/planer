/* ============================================================
   OS V2 – Oberfläche für Analyse, Plan, Widgets und Onboarding
   ============================================================ */
(function(){
"use strict";
var A = window.APP, W = window.WK, OS = window.OS, WT = window.WEATHER;
var S = A.S, $ = A.$, el = A.el, esc = A.esc, row = A.row;

var pane = "overview";
var cache = null, cacheKey = "";

function body(){ return OS.normalizeBody(S.body); }
function analysis(){
  var key = S.today + "|" + S.activities.length + "|" + Object.keys(S.log).length + "|" + S.weekGoal;
  if (cache && cacheKey === key) return cache;
  cache = OS.analyzeTraining(S.log, S.today, S.settings, S.weekGoal);
  cacheKey = key;
  return cache;
}
function invalidate(){ cache = null; }

/* ---------- Skin ---------- */
function applySkin(){
  document.documentElement.setAttribute("data-skin", S.skin);
  var mt = document.querySelector('meta[name="theme-color"]');
  var colors = {osv2:"#0A0A0A", classic:"#17181b", modern:"#0F1115", navy:"#0B132B"};
  if (mt) mt.setAttribute("content", S.settings.theme === "light" ? "#f4f5f7" : (colors[S.skin] || "#0A0A0A"));
  document.documentElement.setAttribute("data-modern-accent", (S.uiPrefs && S.uiPrefs.modernAccent) || "orange");
  document.documentElement.setAttribute("data-navy-panel", (S.uiPrefs && S.uiPrefs.navyPanel) || "classic");
  document.documentElement.classList.toggle("reduce-motion", !!(S.uiPrefs && S.uiPrefs.reduceMotion));
}

/* ============================================================
   OVERVIEW
   ============================================================ */
function hud(){
  var g = $("hudTicks");
  if (g.childNodes.length) return;
  var ns = "http://www.w3.org/2000/svg";
  for (var d = 0; d < 360; d += 6){
    var long = (d % 30 === 0);
    var r1 = long ? 158 : 162, r2 = 166;
    var rad = (d - 90) * Math.PI / 180;
    var l = document.createElementNS(ns, "line");
    l.setAttribute("x1", (170 + Math.cos(rad)*r1).toFixed(1));
    l.setAttribute("y1", (170 + Math.sin(rad)*r1).toFixed(1));
    l.setAttribute("x2", (170 + Math.cos(rad)*r2).toFixed(1));
    l.setAttribute("y2", (170 + Math.sin(rad)*r2).toFixed(1));
    if (long) l.setAttribute("opacity", "1"); else l.setAttribute("opacity", ".45");
    g.appendChild(l);
  }
}
function setRing(id, r, frac){
  var C = 2 * Math.PI * r;
  var e = $(id);
  e.style.strokeDasharray = C;
  e.style.strokeDashoffset = C * (1 - Math.max(0, Math.min(1, frac)));
}
function renderOverview(){
  hud();
  var a = analysis();
  var cur = a.current;
  var goal = a.goal;

  $("befund").textContent = a.befund;
  fillProof($("proof"), a.proof);

  var fVol  = goal > 0 ? cur.sessions / goal : 0;
  var fCons = a.consistency.total ? a.consistency.weeks / a.consistency.total : 0;
  var fWeek = goal > 0 ? Math.min(1, cur.sessions / goal) : 0;
  setRing("ringVol", 150, fVol);
  setRing("ringCons", 122, fCons);
  setRing("ringWeek", 94, fWeek);
  $("ringMain").textContent = cur.sessions;
  $("ringMainLbl").textContent = "von " + goal + " Einheiten diese Woche";
  $("lgVol").textContent  = cur.sessions + " / " + goal;
  $("lgCons").textContent = a.consistency.weeks + " / " + a.consistency.total;
  $("lgWeek").textContent = Math.round(fWeek*100) + " %";
  $("ringTele").textContent =
    "ZIEL " + goal + " EINHEITEN · KW " + cur.week + "/" + cur.year +
    " · UEBUNGEN " + cur.exercises + " · STREAK " + a.streak + " TAGE" +
    " · QUELLE TRAININGSVERLAUF";

  $("kpiRatio").textContent = a.load.ratio ? a.load.ratio.toFixed(2) : "–";
  $("kpi7").textContent = exercisesInDays(7);
  $("kpiPace").textContent = a.avgExercises || "–";
  $("kpiLong").textContent = a.balance.sum ? a.balance.balance + " %" : "–";

  renderCaps($("caps"), a, 110);
  renderWeekOverview(a);
  renderShare(a);
}
function exercisesInDays(n){
  var c = 0;
  for (var i = 0; i < n; i++){
    var e = S.log[W.addDays(S.today, -i)];
    if (e && e.done) c += (e.ex && e.ex.length) ? e.ex.length : (e.groups ? e.groups.length : 0);
  }
  return c;
}

/* ---------- Wochenübersicht: tägliche Übungen ---------- */
var wkOffset = 0, wkOpen = null;
function renderWeekOverview(a){
  var idx = a.weeks.length - 1 + wkOffset;
  idx = Math.max(0, Math.min(a.weeks.length - 1, idx));
  var w = a.weeks[idx];
  $("wkTitle").textContent = "KW " + w.week + " · " + wkRange(w);
  $("wkPrev").disabled = (idx === 0);
  $("wkNext").disabled = (idx === a.weeks.length - 1);
  $("wkSessions").textContent = w.sessions;
  $("wkExercises").textContent = w.exercises;
  $("wkMinutes").textContent = Math.round(w.sec / 60);

  var host = $("weekOverview"); host.innerHTML = "";
  w.days.forEach(function(d){
    var p = A.getPlan(d.date);
    var r = el("div", "planrow" + (d.today ? " today" : "") + (d.done ? " done" : ""));
    r.appendChild(el("div", "d", A.DAYS_SHORT[d.weekday]));
    var label;
    if (d.rest) label = "Entspannung · 2 Min Atemübung";
    else if (p.rest) label = "Entspannung · offen";
    else if (p.run) label = "Lauf · " + S.settings.runDistance + " km";
    else {
      var n = (d.entry && d.entry.ex && d.entry.ex.length) ? d.entry.ex.length : p.exercises.length;
      var min = (d.entry && d.entry.sec) ? Math.round(d.entry.sec/60)
              : Math.round(W.sequenceDuration(W.buildSequence(p, S.settings))/60);
      label = n + " Übungen · " + min + " Min";
    }
    if (d.future) label += " · geplant";
    r.appendChild(el("div", "t", esc(label)));
    r.appendChild(el("div", "chk", d.done ? (d.rest ? "◦" : "✓") : ""));
    r.style.cursor = "pointer";
    r.onclick = function(){ wkOpen = (wkOpen === d.date ? null : d.date); renderWeekOverview(a); };
    host.appendChild(r);

    if (wkOpen === d.date){
      var det = el("div", null, "");
      det.style.cssText = "padding:2px 0 10px 40px";
      if (p.rest || d.rest){
        det.appendChild(el("p", "tiny", "Ankommen 8s · Einatmen 4s · Halten 4s · Ausatmen 6s · 8 Zyklen"));
      } else if (p.run){
        det.appendChild(el("p", "tiny", "Wochenlauf über " + S.settings.runDistance + " km"));
      } else {
        var ids = (d.entry && d.entry.ex && d.entry.ex.length) ? d.entry.ex : null;
        var list = ids
          ? ids.map(function(id){ return W.exerciseById(id); }).filter(Boolean)
          : p.exercises;
        list.forEach(function(e){
          det.appendChild(el("p", "tiny", "· " + (e.n || e.name) + " (" + (W.GROUP_LABEL[e.g] || "") + ")"));
        });
      }
      host.appendChild(det);
    }
  });
}
function wkRange(w){
  var a1 = W.parseYmd(w.monday), a2 = W.parseYmd(W.addDays(w.monday, 6));
  return a1.getDate() + "." + (a1.getMonth()+1) + ". – " + a2.getDate() + "." + (a2.getMonth()+1) + ".";
}
function fillProof(host, proof){
  host.innerHTML = "";
  proof.forEach(function(p){
    host.appendChild(el("div", null, "<b>" + esc(p[1]) + "</b><span>" + esc(p[0]) + "</span>"));
  });
}
function renderCaps(host, a, h){
  host.innerHTML = "";
  var max = Math.max.apply(null, a.weeks.map(function(w){ return w.exercises; }).concat([1]));
  var hot = a.jump ? a.jump.index : -1;
  a.weeks.forEach(function(w, i){
    var col = el("div", "capw");
    var nische = el("div", "capnische");
    nische.style.height = h + "px";
    var cap = el("div", "cap" + (i === hot ? " hot" : "") + (w.complete ? "" : " now"));
    cap.style.height = Math.max(4, w.exercises / max * (h - 6)) + "px";
    nische.appendChild(cap);
    col.appendChild(nische);
    col.appendChild(el("span", null, String(w.week)));
    col.title = "KW " + w.week + ": " + w.exercises + " Übungen, " + w.sessions + " Einheiten";
    host.appendChild(col);
  });
}
function renderShare(a){
  $("scBefund").textContent = a.befund;
  fillProof($("scProof"), a.proof);
  renderCaps($("scCaps"), a, 60);
  var d = W.parseYmd(S.today);
  $("scDate").textContent = d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear();
  var wrap = $("shareCard").parentNode;
  var scale = Math.min(1, (wrap.clientWidth || 360) / 360);
  $("shareCard").style.transform = "scale(" + scale.toFixed(3) + ")";
  wrap.style.height = (640 * scale) + "px";
}
function openShareBig(){
  var clone = $("shareCard").cloneNode(true);
  clone.id = "shareBigCard";
  var vw = window.innerWidth - 24, vh = window.innerHeight - 24;
  var sc = Math.min(vw/360, vh/640);
  clone.style.transform = "scale(" + sc.toFixed(3) + ")";
  clone.style.transformOrigin = "center center";
  var host = $("shareBigHost");
  host.innerHTML = "";
  host.style.width = (360*sc) + "px"; host.style.height = (640*sc) + "px";
  host.style.display = "flex"; host.style.alignItems = "center"; host.style.justifyContent = "center";
  host.appendChild(clone);
  $("shareOver").classList.add("open");
}
function closeShareBig(){ $("shareOver").classList.remove("open"); }

/* ============================================================
   TRAININGSBEREITSCHAFT (ersetzt die frühere Plan-Soll/Ist-Karte)
   ============================================================ */
function renderReadinessCard(){
  var card = $("readinessCard");
  if (!card) return;
  card.style.display = "";
  var rd = OS.readiness(S.log, S.activities, S.today, S.settings);
  $("readyScoreTxt").textContent = rd.score + " / 100";
  $("readyLabel").textContent = rd.label;
  $("readyPct").textContent = rd.score + "%";
  $("readyBar").style.width = rd.score + "%";
  $("readyBar").style.background = rd.score >= 55 ? "var(--run)" : "var(--work)";

  var isRestDay = W.isFixedRestDay ? W.isFixedRestDay(S.today, S.settings) : false;
  var advice;
  if (isRestDay) advice = "Heute ist ein fester Ruhetag – bewusst nichts trainieren, das gehört zum Plan.";
  else if (rd.score >= 75) advice = "Du bist frisch. Ein guter Tag für eine anspruchsvollere Einheit.";
  else if (rd.score >= 55) advice = "Solide Basis – das reguläre Training passt heute gut.";
  else if (rd.score >= 35) advice = "Etwas belastet. Heute lieber die leichtere Stufe oder kürzer trainieren.";
  else advice = "Deine Werte sprechen für eine Pause oder nur eine sehr leichte Einheit.";
  $("readyAdvice").textContent = advice;

  var tip = $("readyTimeTip");
  var bestHour = suggestBestTrainingHour();
  if (bestHour){
    tip.style.display = "";
    tip.textContent = "🌤️ Beste Trainingszeit heute laut Wetter: gegen " + bestHour.hour + " Uhr (" +
      bestHour.temp + "°, " + bestHour.label + ").";
  } else {
    tip.style.display = "none";
    tip.textContent = "";
  }
  renderAdaptiveSuggestion(rd);
}
/* Adaptiver Trainingsvorschlag: erscheint nur, wenn die Bereitschaft
   niedrig ist oder heute ohnehin schon erledigt/ein Ruhetag ist –
   dann macht ein "leichter statt normal"-Vorschlag keinen Sinn. */
function renderAdaptiveSuggestion(rd){
  var card = $("adaptiveCard");
  if (!card) return;
  var p = A.planToday();
  var done = !!(S.log[S.today] && S.log[S.today].done);
  if (done || p.rest || p.run || rd.score >= 40){ card.style.display = "none"; return; }
  card.style.display = "";
  $("adaptiveText").textContent = rd.score < 20
    ? "Deine Werte sind sehr niedrig. Statt des vollen Zirkels heute lieber kürzertreten:"
    : "Deine Bereitschaft ist heute reduziert. Eine der Alternativen schont dich, ohne den Streak zu gefährden:";
  var canReduce = S.settings.rounds > 1;
  $("btnAdaptiveFewer").style.display = canReduce ? "" : "none";
}
/* Sucht in den nächsten Stunden des Wettercaches das angenehmste Zeitfenster
   zwischen 6 und 20 Uhr (wenig Regen, moderate Temperatur). Rein optional –
   ohne Wetterdaten liefert die Funktion einfach nichts. */
function suggestBestTrainingHour(){
  if (!window.APP4 || !S.weather || !S.weather.enabled || !S.weatherCache) return null;
  var hours = (S.weatherCache.data && S.weatherCache.data.hours) || [];
  if (!hours.length) return null;
  var now = new Date();
  var best = null, bestScore = -1;
  hours.forEach(function(h){
    var t = new Date(h.time);
    if (t.getTime() < now.getTime()) return; // nie eine bereits vergangene Stunde vorschlagen
    var hour = t.getHours();
    if (hour < 6 || hour > 20) return;
    var pop = h.pop == null ? 20 : h.pop;
    var tempPenalty = Math.abs(h.temp - 16); // 16°C als angenehmer Richtwert
    var score = 100 - pop - tempPenalty * 3;
    if (score > bestScore){
      bestScore = score;
      var info = WT.wmoInfo(h.code);
      best = {hour: hour + ":00", temp: h.temp, label: info[1]};
    }
  });
  return best;
}

/* ============================================================
   READINESS & ANATOMIE
   ============================================================ */
var ANAT = {
  beine:["a-beine-l","a-beine-r"], arme:["a-arme-l","a-arme-r"],
  brust:["a-brust"], bauch:["a-bauch"], ruecken:["a-ruecken-l","a-ruecken-r"],
  cardio:["a-cardio-l","a-cardio-r"]
};

/* ============================================================
   PERSÖNLICHE REKORDE & ABZEICHEN
   ============================================================ */
function computePRs(){
  var longest = A.longestStreakF ? A.longestStreakF() : W.longestStreak(S.log);
  var current = A.currentStreakF ? A.currentStreakF() : W.currentStreak(S.log, S.today);
  var total = Object.keys(S.log).filter(function(k){ return S.log[k] && S.log[k].done; }).length;
  var bestPaceSec = null, bestPaceDate = null, farthestKm = 0, farthestDate = null;
  (S.activities || []).forEach(function(a){
    var isRun = /lauf/i.test(a.type || "") || /lauf/i.test(a.name || "");
    if (isRun && a.distanceKm > 0 && a.durationSec > 0){
      var pace = a.durationSec / a.distanceKm;
      if (bestPaceSec === null || pace < bestPaceSec){ bestPaceSec = pace; bestPaceDate = a.date; }
    }
    if (a.distanceKm > farthestKm){ farthestKm = a.distanceKm; farthestDate = a.date; }
  });
  var byWeek = {};
  Object.keys(S.log).forEach(function(k){
    if (!S.log[k] || !S.log[k].done) return;
    var wk = W.weekMonday(k);
    byWeek[wk] = (byWeek[wk] || 0) + 1;
  });
  var bestWeek = 0;
  Object.keys(byWeek).forEach(function(k){ if (byWeek[k] > bestWeek) bestWeek = byWeek[k]; });
  return {
    longest: longest, current: current, total: total,
    bestPaceSec: bestPaceSec, bestPaceDate: bestPaceDate,
    farthestKm: farthestKm, farthestDate: farthestDate,
    bestWeek: bestWeek
  };
}
function renderPRs(){
  var host = $("prList");
  if (!host) return;
  var pr = computePRs();
  host.innerHTML = "";
  var rows = [
    ["Längste Serie", pr.longest + " Tage am Stück"],
    ["Aktuelle Serie", pr.current + " Tage"],
    ["Trainingstage insgesamt", pr.total + ""],
    ["Beste Woche", pr.bestWeek + " Einheiten"]
  ];
  if (pr.bestPaceSec) rows.push(["Schnellster Lauf", W.fmtPace(pr.bestPaceSec)]);
  if (pr.farthestKm > 0) rows.push(["Weiteste Distanz", (Math.round(pr.farthestKm*10)/10) + " km"]);
  rows.forEach(function(r){ host.appendChild(row(r[0], "", r[1], "var(--work)")); });
}

var ACHIEVEMENTS = [
  {id:"first", icon:"🎉", n:"Erster Schritt", d:"Die erste Einheit im Logbuch", check:function(pr){ return pr.total >= 1; }},
  {id:"week", icon:"🔥", n:"Eine Woche dran", d:"7 Tage Serie erreicht", check:function(pr){ return pr.longest >= 7; }},
  {id:"month", icon:"🏅", n:"Ein Monat dran", d:"30 Tage Serie erreicht", check:function(pr){ return pr.longest >= 30; }},
  {id:"hundredstreak", icon:"👑", n:"Hundert Tage", d:"100 Tage Serie erreicht", check:function(pr){ return pr.longest >= 100; }},
  {id:"ten", icon:"🔟", n:"Zehn Einheiten", d:"10 Trainingstage insgesamt", check:function(pr){ return pr.total >= 10; }},
  {id:"fifty", icon:"5️⃣0️⃣", n:"Fünfzig Einheiten", d:"50 Trainingstage insgesamt", check:function(pr){ return pr.total >= 50; }},
  {id:"hundred", icon:"💯", n:"Hundert Einheiten", d:"100 Trainingstage insgesamt", check:function(pr){ return pr.total >= 100; }},
  {id:"run", icon:"🏃", n:"Erster Lauf", d:"Einen Lauf erfasst", check:function(pr){ return pr.bestPaceSec != null; }},
  {id:"rodeln", icon:"🛷", n:"Rodeln-Debüt", d:"Das Rodeln-Programm einmal absolviert", check:function(){
    return Object.keys(S.log).some(function(k){ return S.log[k] && S.log[k].type === "rodeln"; });
  }}
];
function renderAchievements(){
  var host = $("achGrid");
  if (!host) return;
  var pr = computePRs();
  host.innerHTML = "";
  var unlocked = 0;
  ACHIEVEMENTS.forEach(function(a){
    var ok = a.check(pr);
    if (ok) unlocked++;
    var b = el("div","ach" + (ok ? " on" : ""));
    b.innerHTML = "<div class='ach-icon'>" + (ok ? a.icon : "🔒") + "</div><b>" + esc(a.n) + "</b><span>" + esc(a.d) + "</span>";
    host.appendChild(b);
  });
  $("achCount").textContent = unlocked + "/" + ACHIEVEMENTS.length;
}

function renderWeekSummary(){
  var host = $("weekSummaryText");
  if (!host) return;
  var mon = W.weekMonday(S.today);
  var sessions = 0, kcal = 0, readySum = 0, readyN = 0, rodeln = 0, runs = 0;
  for (var i = 0; i < 7; i++){
    var ds = W.addDays(mon, i);
    if (ds > S.today) break;
    var e = S.log[ds];
    if (e && e.done){
      sessions++;
      if (e.type === "rodeln") rodeln++;
      if (e.type === "run") runs++;
    }
    kcal += OS.dayBurn(ds, S.log, S.activities, S.settings, body()).total;
    var rd = OS.readiness(S.log, S.activities, ds, S.settings);
    readySum += rd.score; readyN++;
  }
  var avgReady = readyN ? Math.round(readySum / readyN) : 0;
  var fc = (window.APP4 && window.APP4.fmtCal) ? window.APP4.fmtCal(kcal) : Math.round(kcal) + " kcal";
  var extra = [];
  if (runs) extra.push(runs + " Lauf" + (runs>1?"e":""));
  if (rodeln) extra.push(rodeln + "× Rodeln vorbereitet");
  host.textContent = "Diese Woche: " + sessions + " Einheit" + (sessions===1?"":"en") +
    (extra.length ? " (" + extra.join(", ") + ")" : "") +
    ", " + fc + " verbrannt, Bereitschaft im Schnitt " + avgReady + "%.";
}
function renderReadiness(){
  var rd = OS.readiness(S.log, S.activities, S.today, S.settings);
  $("rdLabel").textContent = rd.label;
  $("rdVal").textContent = rd.score + " / 100";
  $("rdBar").style.width = rd.score + "%";
  $("rdBar").style.background = rd.score >= 55 ? "var(--run)" : "var(--work)";

  var bars = $("loadBars"); bars.innerHTML = "";
  var vals = [];
  for (var i = 6; i >= 0; i--){
    var ds = W.addDays(S.today, -i), v = 0;
    if (S.log[ds] && S.log[ds].done) v += 1;
    S.activities.forEach(function(x){ if (x.date === ds) v += Math.min(2, (x.durationSec||0)/3600); });
    vals.push(v);
  }
  var max = Math.max.apply(null, vals.concat([1]));
  vals.forEach(function(v, i){
    var b = el("div", "bar");
    var bi = el("i");
    bi.style.height = Math.max(3, v/max*48) + "px";
    bi.style.background = "var(--run)";
    b.appendChild(bi);
    b.appendChild(el("span", null, A.DAYS_SHORT[W.parseYmd(W.addDays(S.today, -(6-i))).getDay()]));
    bars.appendChild(b);
  });

  var f = rd.fatigue;
  W.GROUPS.forEach(function(g){
    var v = f[g];
    var col = v < 0.15 ? "var(--panel-3)"
            : "color-mix(in srgb, var(--work) " + Math.round(v*85) + "%, var(--panel-3))";
    (ANAT[g] || []).forEach(function(id){
      var e = $(id); if (e) e.style.fill = col;
    });
  });
  var lg = $("anatLegend"); lg.innerHTML = "";
  W.GROUPS.slice().sort(function(x,y){ return f[y] - f[x]; }).forEach(function(g){
    var m = el("div", "meter", "");
    m.appendChild(el("div", "lbl", "<span>" + W.GROUP_LABEL[g] + "</span><span>" + Math.round(f[g]*100) + " %</span>"));
    var t = el("div", "track");
    var i = el("i");
    i.style.width = Math.round(f[g]*100) + "%";
    i.style.background = "var(--work)";
    t.appendChild(i); m.appendChild(t); lg.appendChild(m);
  });
}

/* ============================================================
   KALORIEN-WIDGET
   ============================================================ */
function burnToday(){ return OS.dayBurn(S.today, S.log, S.activities, S.settings, body()); }
function renderBurnChip(){
  var t = burnToday().total;
  if (window.APP4 && window.APP4.calValue) t = window.APP4.calValue(t);
  $("burnVal").textContent = t;
}
function openBurn(){
  var b = burnToday(), bd = body();
  var fc = (window.APP4 && window.APP4.fmtCal) ? window.APP4.fmtCal : function(n){ return n + " kcal"; };
  fillProof($("burnProof"), [["Aktiv", b.workout + b.activities + ""], ["Nachbrennen", b.epoc + ""], ["Grundumsatz", bd ? OS.bmrPerDay(bd) + "" : "–"]]);
  var host = $("burnItems"); host.innerHTML = "";
  if (!b.items.length) host.appendChild(el("p", "muted", "Heute noch nichts erfasst."));
  b.items.forEach(function(it){
    host.appendChild(row(it.name, it.min + " Minuten · MET " + it.met, fc(it.kcal), "var(--work)"));
  });
  $("burnFormula").textContent = "Kalorien = MET × 3,5 × " + bd.weightKg + " kg ÷ 200 × Minuten. " +
    "Grundumsatz " + OS.bmrPerDay(bd) + " kcal/Tag nach Mifflin-St Jeor.";
  openDlg("dlgBurn");
}

/* ============================================================
   QUICK-SWAP
   ============================================================ */
var swapGroup = null;
function openSwap(g){
  swapGroup = g;
  var p = A.planToday();
  var cur = p.exercises.filter(function(e){ return e.g === g; })[0];
  if (!cur) return;
  $("swapSub").textContent = W.GROUP_LABEL[g] + " · aktuell " + cur.n;
  var idx = W.dayIndex(S.today);
  var alts = [], seen = {};
  seen[cur.id] = 1;
  for (var k = 1; alts.length < 3 && k < 30; k++){
    var alt = W.pickForGroup(g, idx, k, S.settings.goal);
    if (!seen[alt.id]){ seen[alt.id] = 1; alts.push(alt); }
  }
  // Eigene Übungen für dieselbe Muskelgruppe zusätzlich anbieten
  var custom = (S.customExercises || []).filter(function(ce){ return ce.g === g && !seen[ce.id]; });
  var host = $("swapList"); host.innerHTML = "";
  alts.forEach(function(alt){
    var r = row(alt.n, alt.c, alt.m === "reps" ? alt.v + "×" : alt.v + "s", W.GROUP_COLOR[g]);
    r.style.cursor = "pointer";
    r.onclick = function(){
      if (!S.swaps[S.today]) S.swaps[S.today] = {};
      S.swaps[S.today][g] = alt.id;
      A.store.set("wk_swaps", S.swaps);
      closeDlg("dlgSwap");
      A.renderAll();
      A.toast("Übung getauscht");
    };
    host.appendChild(r);
  });
  if (custom.length) host.appendChild(el("p","tiny","Eigene Übungen"));
  custom.forEach(function(ce){
    var r = row(ce.n, ce.c, ce.m === "reps" ? ce.v + "×" : ce.v + "s", W.GROUP_COLOR[g]);
    r.style.cursor = "pointer";
    r.onclick = function(){
      if (!S.swaps[S.today]) S.swaps[S.today] = {};
      S.swaps[S.today][g] = ce.id;
      A.store.set("wk_swaps", S.swaps);
      closeDlg("dlgSwap");
      A.renderAll();
      A.toast("Übung getauscht");
    };
    host.appendChild(r);
  });
  openDlg("dlgSwap");
}
function resetSwap(){
  if (S.swaps[S.today]) delete S.swaps[S.today];
  A.store.set("wk_swaps", S.swaps);
  closeDlg("dlgSwap");
  A.renderAll();
  A.toast("Originalplan wiederhergestellt");
}
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
   SPEICHER & EXPORT
   ============================================================ */
function renderStorage(){
  var el2 = $("storeVal"), bar = $("storeBar");
  if (!el2) return;
  var bytes = 0;
  try {
    ["wk_settings","wk_log","wk_activities","wk_body","wk_swaps"].forEach(function(k){
      var v = localStorage.getItem(k); if (v) bytes += v.length;
    });
  } catch(e){}
  if (navigator.storage && navigator.storage.estimate){
    navigator.storage.estimate().then(function(est){
      var used = est.usage || bytes, quota = est.quota || 5*1024*1024;
      el2.textContent = fmtBytes(used) + " von " + fmtBytes(quota);
      bar.style.width = Math.max(1, Math.min(100, used/quota*100)) + "%";
    }).catch(function(){ el2.textContent = fmtBytes(bytes); });
  } else {
    el2.textContent = fmtBytes(bytes);
    bar.style.width = Math.max(1, Math.min(100, bytes/(5*1024*1024)*100)) + "%";
  }
}
function fmtBytes(b){
  if (b < 1024) return b + " B";
  if (b < 1048576) return Math.round(b/102.4)/10 + " kB";
  return Math.round(b/104857.6)/10 + " MB";
}
function download(name, text, mime){
  var blob = new Blob([text], {type: mime || "text/plain"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
}

/* ============================================================
   PREMIUM-PDF-TRAININGSBERICHT
   Füllt das feste, redaktionell gestaltete Druck-Template
   (#pdfReport in part2.html) mit echten Daten aus dem gewählten
   Zeitraum und öffnet danach den Druckdialog des Geräts, über den
   sich der Bericht als PDF speichern lässt. Layout und Aufbau
   dieses Templates sind bewusst als fester Standard angelegt und
   werden hier nicht pro Bericht neu erfunden, nur befüllt.
   ============================================================ */
function generatePdfReport(fromDate, toDate){
  var days = [];
  var d = fromDate, guard = 0;
  while (d <= toDate && guard < 2000){ days.push(d); d = W.addDays(d, 1); guard++; }

  var doneEntries = days.filter(function(ds){ return S.log[ds] && S.log[ds].done; });
  var totalKm = 0, totalCal = 0, muscleCounts = {}, readySum = 0, readyN = 0;
  var bd = body();

  days.forEach(function(ds){
    totalCal += OS.dayBurn(ds, S.log, S.activities, S.settings, bd).total;
    var rd = OS.readiness(S.log, S.activities, ds, S.settings);
    readySum += rd.score; readyN++;
    var e = S.log[ds];
    if (e && e.done && Array.isArray(e.groups)) e.groups.forEach(function(g){ muscleCounts[g] = (muscleCounts[g]||0)+1; });
  });
  (S.activities||[]).forEach(function(a){
    if (a.date >= fromDate && a.date <= toDate) totalKm += (a.distanceKm || 0);
  });

  var longestInRange = 0, run = 0;
  days.forEach(function(ds){
    if (S.log[ds] && S.log[ds].done){ run++; longestInRange = Math.max(longestInRange, run); }
    else run = 0;
  });

  var fc = (window.APP4 && window.APP4.fmtCal) ? window.APP4.fmtCal : function(n){ return Math.round(n) + " kcal"; };
  $("pdfAppNameText").textContent = (S.uiPrefs && S.uiPrefs.appName) || "Training";
  var fd = W.parseYmd(fromDate), td = W.parseYmd(toDate);
  $("pdfPeriodText").textContent = fd.getDate()+"."+(fd.getMonth()+1)+"."+fd.getFullYear() + " – " + td.getDate()+"."+(td.getMonth()+1)+"."+td.getFullYear();
  $("pdfGeneratedText").textContent = "Erstellt am " + new Date().toLocaleDateString("de-DE");
  $("pdfStatDays").textContent = doneEntries.length;
  $("pdfStatKm").textContent = Math.round(totalKm*10)/10;
  $("pdfStatCal").textContent = fc(totalCal);
  $("pdfStatReady").textContent = readyN ? Math.round(readySum/readyN) + "%" : "–";
  $("pdfStatStreak").textContent = longestInRange;
  $("pdfVersionText").textContent = W.APP_VERSION;
  $("pdfFooterDate").textContent = new Date().toLocaleDateString("de-DE");

  var labels = {beine:"Beine", brust:"Brust", bauch:"Bauch & Rumpf", ruecken:"Rücken", arme:"Arme & Schultern", cardio:"Cardio"};
  var maxCount = W.GROUPS.reduce(function(m,g){ return Math.max(m, muscleCounts[g]||0); }, 0) || 1;
  var barsHost = $("pdfMuscleBars"); barsHost.innerHTML = "";
  var anyMuscle = false;
  W.GROUPS.forEach(function(g){
    var c = muscleCounts[g] || 0;
    if (!c) return;
    anyMuscle = true;
    var row = document.createElement("div"); row.className = "pdf-bar-row";
    row.innerHTML = "<div class='pdf-bar-label'>"+esc(labels[g]||g)+"</div>"+
      "<div class='pdf-bar-track'><div class='pdf-bar-fill' style='width:"+Math.round(c/maxCount*100)+"%'></div></div>"+
      "<div class='pdf-bar-val'>"+c+"×</div>";
    barsHost.appendChild(row);
  });
  if (!anyMuscle) barsHost.appendChild(el("p","pdf-empty","Für diesen Zeitraum liegen keine erledigten Trainingstage vor."));

  var artLabel = {rodeln:"Rodeln vorbereiten", rest:"Entspannungstag", extern:"Extern trainiert", run:"Lauf"};
  var tbody = $("pdfTableBody"); tbody.innerHTML = "";
  doneEntries.forEach(function(ds){
    var e = S.log[ds];
    var dd = W.parseYmd(ds);
    var art = artLabel[e.type] || "Ganzkörper-Zirkel";
    var dauer = e.sec ? W.fmtTime(e.sec) : "–";
    var kcalTxt = fc(OS.dayBurn(ds, S.log, S.activities, S.settings, bd).total);
    var tr = document.createElement("tr");
    tr.innerHTML = "<td>"+dd.getDate()+"."+(dd.getMonth()+1)+"."+dd.getFullYear()+"</td><td>"+esc(art)+"</td><td>"+esc(dauer)+"</td><td>"+esc(kcalTxt)+"</td><td></td>";
    tbody.appendChild(tr);
  });
  $("pdfEmptyNote").style.display = doneEntries.length ? "none" : "";

  setTimeout(function(){ window.print(); }, 150);
}

/* ============================================================
   ONBOARDING (CSV im Web Worker)
   ============================================================ */
var worker = null, workerP = null;
// Datei-Import im Hintergrund: js/csv-worker.js lädt die Rechenteile (offline aus dem App-Speicher)
function makeWorker(){
  if (workerP) return workerP;
  try {
    var core = document.getElementById("coreScript");
    var dir = core && core.src ? core.src.replace(/[^/]*$/, "") : "js/";
    worker = new Worker(dir + "csv-worker.js?v=" + (window.SGVersion || ""));
  } catch(e){ worker = false; }
  workerP = Promise.resolve(worker);
  return workerP;
}
function parseInWorker(name, text){
  return makeWorker().then(function(w){ return new Promise(function(resolve){
    if (!w){ resolve(W.parseFitnessFile(name, text)); return; }
    var done = false;
    var to = setTimeout(function(){
      if (!done){ done = true; resolve(W.parseFitnessFile(name, text)); }
    }, 4000);
    w.onmessage = function(ev){
      if (done) return;
      done = true; clearTimeout(to);
      resolve(ev.data && ev.data.ok ? ev.data.res : W.parseFitnessFile(name, text));
    };
    w.onerror = function(){
      if (done) return;
      done = true; clearTimeout(to);
      worker = false; workerP = Promise.resolve(false);
      resolve(W.parseFitnessFile(name, text));
    };
    w.postMessage({name:name, text:text});
  }); });
}
function onbStep(n){
  ["onbClear","onb0","onb1","onb2","onb3"].forEach(function(id, i){
    $(id).classList.toggle("on", i === n);
  });
  var prog = $("onbProgress");
  if (prog) Array.prototype.forEach.call(prog.children, function(dot, i){ dot.classList.toggle("on", i <= n); });
}
var onbGoal = "erhalt", onbRunning = true, onbClearQ1 = false, onbClearQ2 = false;
function renderGoalCards(){
  var host = $("goalCards"); host.innerHTML = "";
  W.GOALS.forEach(function(g){
    var b = el("button", "goalcard" + (g === onbGoal ? " on" : ""),
      "<span class='tick'>✓</span><b>" + W.GOAL_LABEL[g] + "</b><span>" + esc(W.GOAL_DESC[g]) + "</span>");
    b.dataset.g = g;
    b.onclick = function(){ onbGoal = g; renderGoalCards(); };
    host.appendChild(b);
  });
}
function onbFiles(files){
  if (!files || !files.length) return;
  var f = files[0];
  var fr = new FileReader();
  fr.onload = function(){
    parseInWorker(f.name, String(fr.result)).then(function(res){
      var items = (res && res.items) || [];
      if (res && res.kind === "backup"){ finishOnb(); A.handleFiles([f]); return; }
      if (!items.length){ A.toast("Format nicht erkannt"); return; }
      var m = W.mergeActivities(S.activities, items);
      S.activities = m.list;
      A.saveAct();
      invalidate();
      showReadout(f.name, items);
      onbStep(3);
    });
  };
  fr.readAsText(f);
}
function showReadout(fname, items){
  var a = OS.enrich(items);
  var runs = a.filter(function(x){ return OS.isVolume(x.kind); });
  var dates = items.map(function(x){ return x.date; }).sort();
  var cols = [];
  if (items.some(function(x){ return x.distanceKm; })) cols.push("Distanz");
  if (items.some(function(x){ return x.durationSec; })) cols.push("Zeit");
  if (items.some(function(x){ return x.avgHr; })) cols.push("Puls");
  if (items.some(function(x){ return x.calories; })) cols.push("Kalorien");
  if (items.some(function(x){ return x.steps; })) cols.push("Schritte");
  if (items.some(function(x){ return x.elev; })) cols.push("Höhenmeter");
  var host = $("onbReadout"); host.innerHTML = "";
  [["Läufe", runs.length + " von " + items.length + " Aktivitäten"],
   ["Zeitraum", dates.length ? dates[0] + " bis " + dates[dates.length-1] : "–"],
   ["Genutzte Spalten", cols.length ? cols.join(", ") : "Datum"]]
  .forEach(function(p){
    host.appendChild(el("div", null, "<span>" + p[0] + "</span><span>" + esc(p[1]) + "</span>"));
  });
  $("onbGoalHint").textContent = "Einheiten pro Woche · Vorschlag 5";
  $("onbGoal").value = 5;
}
function finishOnb(){
  A.store.set("wk_onboarded", 1);
  $("onb").classList.remove("open");
  invalidate();
  A.renderAll();
}

/* ============================================================
   PLAYER-ERWEITERUNG: Pause ±10 s, Kalorien, Chroma, Halten
   ============================================================ */
function extendPlayer(){
  var ctrl = document.querySelector(".ov-ctrl");
  if (!ctrl || $("ovExtra")) return;
  var extra = el("div", null, "");
  extra.id = "ovExtra";
  extra.style.cssText = "display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:10px";
  extra.innerHTML =
    '<button class="btn ghost sm" id="ovMinus">−10 s</button>' +
    '<div class="mono" id="ovKcal" style="flex:1;text-align:center">0 kcal</div>' +
    '<button class="btn ghost sm" id="ovPlus">+10 s</button>';
  ctrl.parentNode.insertBefore(extra, ctrl.nextSibling);

  $("ovPlus").onclick  = function(){ modRest(10); };
  $("ovMinus").onclick = function(){ modRest(-10); };

  var start = null, raf = null;
  var closeBtn = $("ovClose");
  closeBtn.classList.add("hold");
  var fill = el("div", "fill");
  closeBtn.appendChild(fill);
  function begin(e){
    e.preventDefault();
    start = Date.now();
    (function step(){
      if (start === null) return;
      var p = Math.min(1, (Date.now() - start) / 1500);
      fill.style.width = (p*100) + "%";
      if (p >= 1){ start = null; fill.style.width = "0%"; A.buzz(80); doClose(); return; }
      raf = requestAnimationFrame(step);
    })();
  }
  function end(){ start = null; fill.style.width = "0%"; if (raf) cancelAnimationFrame(raf); }
  function doClose(){
    var evt = new MouseEvent("click", {bubbles:false});
    closeBtn.dispatchEvent(new CustomEvent("holdclose"));
  }
  closeBtn.addEventListener("pointerdown", begin);
  ["pointerup","pointerleave","pointercancel"].forEach(function(ev){ closeBtn.addEventListener(ev, end); });
  closeBtn.title = "1,5 Sekunden halten zum Beenden";
}
function modRest(sec){
  var P = A.player;
  var it = P.seq && P.seq[P.i];
  if (!it || it.type === "work"){ A.toast("Nur in Pausen möglich"); return; }
  it.dur = Math.max(5, it.dur + sec);
  P.remaining = Math.max(1, P.remaining + sec);
  if (A.renderPlayer) A.renderPlayer();
  playerTick();
  A.toast((sec > 0 ? "+" : "") + sec + " Sekunden Pause");
}
function playerTick(){
  var P = A.player, ov = $("player");
  if (!P || !P.open) return;
  var it = P.seq[P.i];
  ov.classList.toggle("chroma-work", it && (it.type === "work"));
  ov.classList.toggle("chroma-rest", it && (it.type === "rest" || it.type === "roundrest"));
  var done = 0;
  for (var k = 0; k < P.i; k++) done += P.seq[k].dur;
  done += (it ? it.dur - P.remaining : 0);
  var stretching = P.seq.some(function(x){ return !!x.pose; });
  var b = OS.burnFor(stretching ? "aufwaermen" : "zirkel", done/60, body());
  var kc = $("ovKcal");
  var fc = (window.APP4 && window.APP4.fmtCal) ? window.APP4.fmtCal(b.total) : (b.total + " kcal");
  if (kc) kc.textContent = fc + " · MET " + b.met;
}

/* ============================================================
   BINDING
   ============================================================ */
function setSeg(name){
  pane = name;
  ["overview","daten"].forEach(function(p){
    $("p-" + p).style.display = (p === name) ? "" : "none";
  });
  var btns = $("segAnalyse").querySelectorAll("button");
  var idx = 0;
  Array.prototype.forEach.call(btns, function(b, i){
    var on = b.dataset.p === name;
    b.classList.toggle("on", on);
    if (on) idx = i;
  });
  var sl = $("segSlider");
  var w = 100 / btns.length;
  sl.style.width = "calc(" + w + "% - 3px)";
  sl.style.transform = "translateX(calc(" + (idx * 100) + "% + " + (idx * 3) + "px))";
  if (name === "overview") renderOverview();
  if (name === "daten") renderStorage();
}
function fillOsSettings(){
  var b = body();
  if ($("setWeight")) $("setWeight").value = b.weightKg;
  if ($("setHeight")) $("setHeight").value = b.heightCm;
  if ($("setAge")) $("setAge").value = b.age;
  Array.prototype.forEach.call($("setSex").children, function(x){ x.classList.toggle("on", x.dataset.v === b.sex); });
  $("setBmr").textContent = OS.bmrPerDay(b) + " kcal/Tag";
  Array.prototype.forEach.call($("setSkinMode").children, function(x){ x.classList.toggle("on", x.dataset.v === S.skin); });
  $("modernAccentRow").style.display = S.skin === "modern" ? "" : "none";
  Array.prototype.forEach.call($("setModernAccent").children, function(x){
    x.classList.toggle("on", x.dataset.v === ((S.uiPrefs && S.uiPrefs.modernAccent) || "orange"));
  });
  $("navyPanelRow").style.display = S.skin === "navy" ? "" : "none";
  Array.prototype.forEach.call($("setNavyPanel").children, function(x){
    x.classList.toggle("on", x.dataset.v === ((S.uiPrefs && S.uiPrefs.navyPanel) || "classic"));
  });
  $("setWeekGoal").value = S.weekGoal || "";
  $("setRace").value = S.race || "";
  renderStorage();
}
function bind(){
  $("segAnalyse").addEventListener("click", function(e){
    var b = e.target.closest("button[data-p]");
    if (b) setSeg(b.dataset.p);
  });
  $("btnShareBig").addEventListener("click", openShareBig);
  $("shareOver").addEventListener("click", closeShareBig);
  document.addEventListener("keydown", function(e){
    if (e.code === "Escape" && $("shareOver").classList.contains("open")) closeShareBig();
  });

  $("wkPrev").addEventListener("click", function(){ wkOffset--; wkOpen = null; renderOverview(); });
  $("wkNext").addEventListener("click", function(){ wkOffset++; wkOpen = null; renderOverview(); });

  $("btnBurn").addEventListener("click", openBurn);
  $("burnClose").addEventListener("click", function(){ closeDlg("dlgBurn"); });
  $("swapClose").addEventListener("click", function(){ closeDlg("dlgSwap"); });
  $("swapReset").addEventListener("click", resetSwap);

  ["setWeight","setHeight","setAge"].forEach(function(id){
    $(id).addEventListener("change", function(){
      S.body = OS.normalizeBody({
        weightKg:$("setWeight").value, heightCm:$("setHeight").value,
        age:$("setAge").value, sex:body().sex
      });
      A.store.set("wk_body", S.body);
      invalidate(); fillOsSettings(); renderBurnChip();
    });
  });
  $("setSex").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.body = OS.normalizeBody(Object.assign({}, body(), {sex:b.dataset.v}));
    A.store.set("wk_body", S.body);
    invalidate(); fillOsSettings();
  });
  $("setSkinMode").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.skin = b.dataset.v;
    A.store.set("wk_skin", S.skin);
    // Eigene Farb-Anpassungen zurücksetzen: die werden als Inline-Stil auf
    // <html> gesetzt und haben sonst IMMER Vorrang vor den Design-Vorgaben,
    // egal welches Design gerade gewählt wird – ein neu gewähltes Design
    // soll aber wirklich mit seinen eigenen, einheitlichen Farben erscheinen,
    // nicht mit versehentlich hängengebliebenen alten Anpassungen.
    S.colors = {};
    A.store.set("wk_colors", S.colors);
    if (window.APP3 && window.APP3.applyColors) window.APP3.applyColors();
    applySkin(); fillOsSettings();
  });
  $("setModernAccent").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.uiPrefs.modernAccent = b.dataset.v;
    A.store.set("wk_uiprefs", S.uiPrefs);
    applySkin(); fillOsSettings();
  });
  $("setNavyPanel").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    S.uiPrefs.navyPanel = b.dataset.v;
    A.store.set("wk_uiprefs", S.uiPrefs);
    applySkin(); fillOsSettings();
  });
  $("setWeekGoal").addEventListener("change", function(e){
    S.weekGoal = Math.max(0, Math.min(14, Number(e.target.value) || 0));
    A.store.set("wk_weekgoal", S.weekGoal);
    invalidate(); A.renderAll();
  });
  $("setRace").addEventListener("change", function(e){
    S.race = String(e.target.value).slice(0, 40);
    A.store.set("wk_race", S.race);
  });

  $("btnExpCsv").addEventListener("click", function(){
    if (!S.activities.length){ A.toast("Keine Aktivitäten vorhanden"); return; }
    download("aktivitaeten-" + S.today + ".csv", OS.toCSV(S.activities), "text/csv");
    A.toast("CSV exportiert");
  });
  $("btnExpGpx").addEventListener("click", function(){
    if (!S.activities.length){ A.toast("Keine Aktivitäten vorhanden"); return; }
    download("aktivitaet-" + S.activities[0].date + ".gpx", OS.toGPX(S.activities[0]), "application/gpx+xml");
    A.toast("GPX exportiert");
  });
  $("btnExpTcx").addEventListener("click", function(){
    if (!S.activities.length){ A.toast("Keine Aktivitäten vorhanden"); return; }
    download("aktivitaet-" + S.activities[0].date + ".tcx", OS.toTCX(S.activities[0]), "application/vnd.garmin.tcx+xml");
    A.toast("TCX exportiert");
  });
  $("btnPdfExport").addEventListener("click", function(){
    var from = $("pdfFrom").value, to = $("pdfTo").value;
    if (!from || !to){ A.toast("Bitte Start- und Enddatum wählen"); return; }
    if (to < from){ A.toast("Enddatum liegt vor dem Startdatum"); return; }
    generatePdfReport(from, to);
  });

  // Onboarding
  $("onbDrop").addEventListener("click", function(){ A.$("fileInput").click(); });
  ["dragenter","dragover"].forEach(function(ev){
    $("onbDrop").addEventListener(ev, function(e){ e.preventDefault(); $("onbDrop").classList.add("over"); });
  });
  ["dragleave","drop"].forEach(function(ev){
    $("onbDrop").addEventListener(ev, function(e){ e.preventDefault(); $("onbDrop").classList.remove("over"); });
  });
  $("onbDrop").addEventListener("drop", function(e){
    if (e.dataTransfer && e.dataTransfer.files) onbFiles(e.dataTransfer.files);
  });
  A.$("fileInput").addEventListener("change", function(e){
    if ($("onb").classList.contains("open") && e.target.files && e.target.files.length){
      onbFiles(e.target.files);
    }
  }, true);
  $("onbRunning").addEventListener("click", function(){
    onbRunning = !onbRunning;
    $("onbRunning").classList.toggle("on", onbRunning);
  });
  $("onbGoalNext").addEventListener("click", function(){
    A.applyGoal(onbGoal);
    A.setRunning(onbRunning);
    A.fillSettings();
    onbStep(2);
  });
  $("clearQ1").addEventListener("click", function(){
    onbClearQ1 = !onbClearQ1;
    $("clearQ1").classList.toggle("on", onbClearQ1);
    $("clearWarn").style.display = (onbClearQ1 || onbClearQ2) ? "" : "none";
  });
  $("clearQ2").addEventListener("click", function(){
    onbClearQ2 = !onbClearQ2;
    $("clearQ2").classList.toggle("on", onbClearQ2);
    $("clearWarn").style.display = (onbClearQ1 || onbClearQ2) ? "" : "none";
  });
  $("clearNext").addEventListener("click", function(){
    S.settings.cleared = true;
    if (onbClearQ1 || onbClearQ2){
      // sanfter Einstieg: Intensität in Schritt 3 auf "leicht" vorbelegen
      Array.prototype.forEach.call($("onbLevel").children, function(x){ x.classList.toggle("on", x.dataset.v === "leicht"); });
      S.settings.level = "leicht";
    }
    A.saveSettings();
    onbStep(1);
  });
  $("onbBack").addEventListener("click", function(){ onbStep(1); });
  $("onbSkip").addEventListener("click", finishOnb);
  $("onbNext").addEventListener("click", function(){ onbStep(4); });
  $("onbLevel").addEventListener("click", function(e){
    var b = e.target.closest("button"); if (!b) return;
    Array.prototype.forEach.call($("onbLevel").children, function(x){ x.classList.toggle("on", x === b); });
    S.settings.level = b.dataset.v;
    A.saveSettings();
  });
  $("onbDone").addEventListener("click", function(){
    var g = Number($("onbGoal").value) || 0;
    if (g > 0){ S.weekGoal = g; A.store.set("wk_weekgoal", g); }
    var r = String($("onbRace").value || "").slice(0,40);
    if (r){ S.race = r; A.store.set("wk_race", r); }
    finishOnb();
  });

  // Player-Erweiterung
  extendPlayer();
  $("ovClose").addEventListener("holdclose", function(){
    var P = A.player;
    P.finished = false;
    A.player.open = false;
    $("player").classList.remove("open");
    A.keepAwake(false);
    A.renderAll();
  });
  setInterval(playerTick, 500);
}

/* ---------- Hook aus ui.js ---------- */
window.APP2 = {
  openSwap: openSwap,
  invalidate: invalidate,
  renderStorage: renderStorage,
  computePRs: computePRs,
  ACHIEVEMENTS: ACHIEVEMENTS,
  applySkin: applySkin,
  after: function(screen){
    invalidate();
    if (screen === "heute"){ renderReadinessCard(); renderBurnChip(); }
    if (screen === "daten") setSeg(pane);
    if (screen === "fitness"){ renderReadiness(); renderPRs(); renderAchievements(); renderWeekSummary(); }
    if (screen === "einst") fillOsSettings();
  }
};

applySkin();
bind();
if (!A.store.get("wk_onboarded", 0)){
  $("onb").classList.add("open");
  onbGoal = S.settings.goal || "erhalt";
  onbRunning = S.settings.running !== false;
  $("onbRunning").classList.toggle("on", onbRunning);
  renderGoalCards();
  onbStep(0);
}
A.renderAll();
})();
