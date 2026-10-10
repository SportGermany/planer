/* ============================================================
   ANALYSE-ENGINE  (Trainingsblog)
   Reine Rechenlogik, in Node und im Web Worker lauffähig.
   ============================================================ */
(function(root){
"use strict";
var W = root.WK;

/* ---------- Sportarten trennen ---------- */
function classify(a){
  var sRaw = String((a && (a.rawType || a.type || a.name)) || "").toLowerCase();
  // Nur eine ausdrücklich als Ganzkörper-/Kombi-Einheit benannte, mindestens
  // zweistündige Aktivität zählt als Ganzkörper-Ausdauer/Kraft-Kombi – eine
  // einfache lange Ausdauereinheit (z. B. ein 20-km-Lauf) bleibt unverändert
  // in ihrer eigenen Kategorie.
  if ((a && a.durationSec || 0) >= 7200 && /ganzk(ö|oe)rper|kombi|zirkel|kraftausdauer|cross-?fit|hyrox/.test(sRaw)) return "ganzkoerper";
  if (W.sportForActivity){
    var sp = W.sportForActivity(a);
    var m = {lauf:"lauf", trail:"trail", rad:"rad", schwimmen:"schwimmen",
             gehen:"wandern", kraft:"kraft", mobility:"kraft"};
    return m[sp.kind] || "sonstiges";
  }
  var s = String((a && (a.rawType || a.type || a.name)) || "").toLowerCase();
  if (/rad|bike|cycl|velo|ebike|indoor ?cycl|spinning/.test(s)) return "rad";
  if (/schwimm|swim|pool/.test(s)) return "schwimmen";
  if (/wander|hike|walk|gehen|spazier/.test(s)) return "wandern";
  if (/kraft|strength|gym|workout|training|hantel|yoga|pilates/.test(s) && !/lauf|run/.test(s)) return "kraft";
  if (/trail|berg|mountain|fell|gel(ä|ae)nde/.test(s)) return "trail";
  if (/lauf|run|jog|treadmill|laufband/.test(s)) {
    var km = a.distanceKm || 0, el = a.elev || 0;
    return (km >= 1 && el / km > 20) ? "trail" : "lauf";
  }
  if ((a.distanceKm || 0) >= 1 && (a.durationSec || 0) > 0){
    var kmh = a.distanceKm / (a.durationSec/3600);
    if (kmh > 17) return "rad";
    var el2 = (a.elev || 0) / a.distanceKm;
    return el2 > 20 ? "trail" : "lauf";
  }
  return "sonstiges";
}
/* zählt in den Laufumfang */
function isVolume(k){ return k === "lauf" || k === "trail"; }
/* taugt für Pace-/Puls-Vergleiche */
function isClean(k){ return k === "lauf"; }

function enrich(activities){
  return (activities||[]).map(function(a){
    var o = {};
    for (var k in a) o[k] = a[k];
    o.kind = classify(a);
    o.paceSec = (a.distanceKm > 0 && a.durationSec > 0) ? a.durationSec / a.distanceKm : 0;
    return o;
  });
}

/* ---------- ISO-Wochen ---------- */
function isoMonday(dateStr){
  var d = W.parseYmd(dateStr);
  var off = (d.getDay() + 6) % 7;       // Mo = 0
  return W.addDays(dateStr, -off);
}
function isoWeekNumber(dateStr){
  var d = W.parseYmd(dateStr);
  var t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
  var week1 = new Date(t.getFullYear(), 0, 4);
  return 1 + Math.round(((t - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
/* Wochenumfänge der letzten n ISO-Wochen, älteste zuerst */
function weeklyVolumes(activities, todayStr, n){
  n = n || 12;
  var acts = enrich(activities);
  var curMon = isoMonday(todayStr);
  var out = [];
  for (var i = n - 1; i >= 0; i--){
    var mon = W.addDays(curMon, -7*i);
    var sun = W.addDays(mon, 6);
    var km = 0, runs = 0, longest = 0, sec = 0, hrSum = 0, hrN = 0, paceSum = 0, paceN = 0;
    acts.forEach(function(a){
      if (a.date < mon || a.date > sun) return;
      if (!isVolume(a.kind)) return;
      km += a.distanceKm || 0;
      sec += a.durationSec || 0;
      runs++;
      if ((a.distanceKm||0) > longest) longest = a.distanceKm;
      if (isClean(a.kind)){
        if (a.avgHr){ hrSum += a.avgHr; hrN++; }
        if (a.paceSec){ paceSum += a.paceSec; paceN++; }
      }
    });
    out.push({
      monday: mon, week: isoWeekNumber(mon), year: W.parseYmd(mon).getFullYear(),
      km: Math.round(km*10)/10, runs: runs, longest: Math.round(longest*10)/10,
      sec: sec, avgHr: hrN ? Math.round(hrSum/hrN) : 0,
      avgPace: paceN ? Math.round(paceSum/paceN) : 0,
      complete: sun < todayStr
    });
  }
  return out;
}

/* ---------- Sprung: >30 % über dem Schnitt der 4 Vorwochen UND >= 30 km ---------- */
function detectJump(weeks){
  var flagged = null;
  for (var i = 4; i < weeks.length; i++){
    var w = weeks[i];
    if (!w.complete) continue;
    var prev = weeks.slice(i-4, i);
    var avg = prev.reduce(function(a,b){ return a + b.km; }, 0) / 4;
    if (avg <= 0) continue;
    var pct = (w.km - avg) / avg;
    if (pct > 0.30 && w.km >= 30){
      flagged = {index:i, week:w, avg:Math.round(avg*10)/10, pct:Math.round(pct*100)};
    }
  }
  return flagged;
}
/* ---------- Rückgang: Schnitt letzte 4 abgeschlossene vs. 4 davor ---------- */
function detectDecline(weeks){
  var done = weeks.filter(function(w){ return w.complete; });
  if (done.length < 8) return null;
  var last4 = done.slice(-4), prev4 = done.slice(-8, -4);
  var a = last4.reduce(function(x,y){ return x + y.km; }, 0) / 4;
  var b = prev4.reduce(function(x,y){ return x + y.km; }, 0) / 4;
  if (b <= 0) return null;
  return {last4:Math.round(a*10)/10, prev4:Math.round(b*10)/10, pct:Math.round((a-b)/b*100)};
}
/* ---------- Belastungsverhältnis: 7 Tage / Wochenschnitt aus 28 Tagen ---------- */
function loadRatio(activities, todayStr){
  var acts = enrich(activities);
  function kmIn(days){
    var sum = 0, from = W.addDays(todayStr, -(days-1));
    acts.forEach(function(a){
      if (a.date >= from && a.date <= todayStr && isVolume(a.kind)) sum += a.distanceKm || 0;
    });
    return sum;
  }
  var k7 = kmIn(7), k28 = kmIn(28);
  var base = k28 / 4;
  return {
    km7: Math.round(k7*10)/10, km28: Math.round(k28*10)/10,
    base: Math.round(base*10)/10,
    ratio: base > 0 ? Math.round(k7/base*100)/100 : 0
  };
}
/* ---------- Konsistenz: Wochen mit >= 3 Läufen ---------- */
function consistency(weeks){
  var done = weeks.filter(function(w){ return w.complete; });
  var good = 0, run = 0, best = 0;
  done.forEach(function(w){
    if (w.runs >= 3){ good++; run++; if (run > best) best = run; }
    else run = 0;
  });
  return {weeks:good, total:done.length, streak:best};
}
/* ---------- Tempo bei gleicher Herzfrequenz (nur saubere Läufe) ---------- */
function paceAtHr(activities, todayStr){
  var acts = enrich(activities).filter(function(a){
    return isClean(a.kind) && a.avgHr >= 100 && a.avgHr <= 200 && a.paceSec > 180 && a.paceSec < 900;
  });
  if (acts.length < 4) return null;
  var hrs = acts.map(function(a){ return a.avgHr; }).sort(function(x,y){ return x-y; });
  var lo = hrs[Math.floor(hrs.length*0.25)], hi = hrs[Math.floor(hrs.length*0.75)];
  var band = acts.filter(function(a){ return a.avgHr >= lo && a.avgHr <= hi; });
  if (band.length < 4) band = acts;
  band.sort(function(a,b){ return a.date < b.date ? -1 : 1; });
  var half = Math.floor(band.length/2);
  var older = band.slice(0, half), newer = band.slice(band.length - half);
  function avg(list, f){ return list.reduce(function(s,x){ return s + f(x); }, 0) / list.length; }
  var pOld = avg(older, function(a){ return a.paceSec; });
  var pNew = avg(newer, function(a){ return a.paceSec; });
  return {
    band:[lo,hi], n:band.length,
    oldPace:Math.round(pOld), newPace:Math.round(pNew),
    deltaSec:Math.round(pOld - pNew),
    oldHr:Math.round(avg(older,function(a){return a.avgHr;})),
    newHr:Math.round(avg(newer,function(a){return a.avgHr;}))
  };
}
/* ---------- Longrun-Anteil, nur Wochen mit >= 3 Läufen ---------- */
function longrunShare(weeks){
  var use = weeks.filter(function(w){ return w.complete && w.runs >= 3 && w.km > 0; });
  if (!use.length) return null;
  var sum = use.reduce(function(a,w){ return a + w.longest / w.km; }, 0);
  return {pct:Math.round(sum/use.length*100), weeks:use.length};
}

/* ---------- MET-Kalorien ---------- */
var BODY_DEFAULT = {weightKg:75, heightCm:175, age:35, sex:"w"};
function normalizeBody(b){
  var o = {};
  for (var k in BODY_DEFAULT) o[k] = BODY_DEFAULT[k];
  if (b) for (var j in b) if (o[j] !== undefined) o[j] = b[j];
  o.weightKg = Math.min(200, Math.max(30, Number(o.weightKg) || 75));
  o.heightCm = Math.min(230, Math.max(120, Number(o.heightCm) || 175));
  o.age      = Math.min(100, Math.max(12, Number(o.age) || 35));
  if (o.sex !== "m" && o.sex !== "w") o.sex = "w";
  return o;
}
function bmrPerDay(body){
  var b = normalizeBody(body);
  var v = 10*b.weightKg + 6.25*b.heightCm - 5*b.age;
  return Math.round(b.sex === "m" ? v + 5 : v - 161);
}
function metFor(kind, kmh, override){
  if (kind === "custom" && override != null) return Math.max(1.5, Math.min(12, override));
  if (kind === "lauf" || kind === "trail"){
    var m = 0.95 * (kmh || 9) + 0.7;
    if (kind === "trail") m += 1.2;
    return Math.max(6, Math.min(19, m));
  }
  if (kind === "rad")       return Math.max(4, Math.min(14, 0.4*(kmh||20) + 2.5));
  if (kind === "schwimmen") return 8.0;
  if (kind === "wandern")   return 5.5;
  if (kind === "kraft")     return 5.0;
  if (kind === "zirkel")    return 6.5;
  if (kind === "aufwaermen")return 3.0;
  return 4.5;
}
/* Kalorien = MET x 3.5 x kg / 200 x Minuten */
function calories(met, weightKg, minutes){
  return Math.round(met * 3.5 * (weightKg/200) * minutes);
}
function burnFor(kind, minutes, body, kmh, metOverride){
  var b = normalizeBody(body);
  var met = metFor(kind, kmh, metOverride);
  var total = calories(met, b.weightKg, minutes);
  var bmrShare = Math.round(bmrPerDay(b) / 1440 * minutes);
  var active = Math.max(0, total - bmrShare);
  var epoc = Math.round(active * (met >= 8 ? 0.09 : met >= 6 ? 0.06 : 0.03));
  return {met:Math.round(met*10)/10, total:total, active:active, bmr:bmrShare, epoc:epoc, sum:total + epoc};
}
function dayBurn(dateStr, log, activities, settings, body){
  var out = {workout:0, activities:0, epoc:0, bmr:bmrPerDay(body), items:[]};
  var e = log && log[dateStr];
  if (e && e.done && !e.km){
    var min = (e.sec || 780) / 60;
    // Genauer: Durchschnitts-MET aus den tatsächlich absolvierten Übungen
    // berechnen, statt für jedes Training denselben Pauschalwert anzunehmen.
    // Fällt auf die bisherige Schätzung zurück, wenn keine Übungsliste
    // vorliegt (z. B. sehr alte, vor diesem Update gespeicherte Einträge).
    var avgMet = (W.avgMetForExerciseIds && e.ex && e.ex.length) ? W.avgMetForExerciseIds(e.ex) : null;
    var b = avgMet != null ? burnFor("custom", min, body, 0, avgMet) : burnFor("zirkel", min, body);
    out.workout = b.total; out.epoc += b.epoc;
    out.items.push({name: e.type === "gym" ? "Gym-Training" : "Tagestraining", min:Math.round(min), kcal:b.total, met:b.met});
  }
  (activities||[]).forEach(function(a){
    if (a.date !== dateStr) return;
    var kind = classify(a);
    var min = (a.durationSec||0)/60;
    if (min <= 0) return;
    var kmh = (a.distanceKm && a.durationSec) ? a.distanceKm/(a.durationSec/3600) : 0;
    var b2 = burnFor(kind, min, body, kmh);
    var kcal = a.calories || b2.total;
    out.activities += kcal; out.epoc += b2.epoc;
    out.items.push({name:a.name, min:Math.round(min), kcal:kcal, met:b2.met});
  });
  out.total = out.workout + out.activities + out.epoc;
  return out;
}

/* Ermüdung je Muskelgruppe, jetzt mit optionaler Intensitäts-Gewichtung
   pro Gruppe: ein Log-Eintrag kann statt der einfachen Gruppenliste auch
   ein groupIntensity-Objekt mitbringen (0..1 je Gruppe), z. B. für ein
   extern absolviertes Ganzkörpertraining mit ungleicher Belastung
   (Beine stärker gefordert als der restliche Körper). Ohne dieses Feld
   bleibt das Verhalten wie bisher: volle Gewichtung je gelisteter Gruppe. */
function fatigue(log, activities, todayStr, settings){
  var f = {};
  W.GROUPS.forEach(function(g){ f[g] = 0; });
  var decay = [1, 0.75, 0.5, 0.3, 0.15];
  for (var i = 0; i < 5; i++){
    var ds = W.addDays(todayStr, -i);
    var e = log[ds];
    if (e && e.done && e.groupIntensity && typeof e.groupIntensity === "object"){
      W.GROUPS.forEach(function(g){
        var w = e.groupIntensity[g];
        if (typeof w === "number") f[g] += decay[i] * w * 2.7; // auf dieselbe Skala wie die Vollgewichtung gebracht
      });
    } else if (e && e.done && Array.isArray(e.groups)){
      e.groups.forEach(function(g){ if (f[g] !== undefined) f[g] += decay[i]; });
    }
    (activities||[]).forEach(function(a){
      if (a.date !== ds) return;
      var k = classify(a);
      if (isVolume(k) || k === "rad"){ f.beine += decay[i] * 1.1; f.cardio += decay[i] * 1.2; }
      if (k === "schwimmen"){ f.ruecken += decay[i]; f.arme += decay[i]; f.cardio += decay[i]*0.8; }
      if (k === "ganzkoerper"){ W.GROUPS.forEach(function(g){ f[g] += decay[i] * 0.405; }); } // 15% je Einheit auf jede Muskelgruppe
    });
  }
  var max = 2.7;
  W.GROUPS.forEach(function(g){ f[g] = Math.min(1, Math.round(f[g]/max*100)/100); });
  return f;
}
function monthlyTrainingBonus(log, todayStr){
  // Wer im Monat oft trainiert, gilt schneller wieder als bereit: die
  // Ermüdung wird um bis zu 30% weniger stark angerechnet, proportional
  // zur Anzahl erledigter Tage in den letzten 30 Tagen.
  var n = 0;
  for (var i = 0; i < 30; i++){
    var d = W.addDays(todayStr, -i);
    if (log[d] && log[d].done) n++;
  }
  return Math.min(0.3, n / 24 * 0.3);
}
function readiness(log, activities, todayStr, settings){
  var f = fatigue(log, activities, todayStr, settings);
  var avg = W.GROUPS.reduce(function(a,g){ return a + f[g]; }, 0) / W.GROUPS.length;
  var lr = loadRatio(activities, todayStr);
  var pen = lr.ratio > 1.5 ? 0.25 : lr.ratio > 1.3 ? 0.15 : 0;
  var bonus = monthlyTrainingBonus(log, todayStr);
  var score = Math.max(0, Math.min(100, Math.round((1 - avg*0.7*(1-bonus) - pen) * 100)));
  // Morgen-HRV aus dem Bereich Atmung (Pulsplan): liegt der heutige ln(RMSSD) unter deinem
  // persönlichen Normalbereich, sinkt die Bereitschaft (HRV-gesteuertes Training, Plews 2013, Kiviniemi 2007).
  var hrv = window.SG_HRV ? window.SG_HRV(todayStr) : null;
  if (hrv) score = Math.max(0, Math.min(100, score + hrv.adj));
  var label = score >= 75 ? "Frisch" : score >= 55 ? "Bereit" : score >= 35 ? "Belastet" : "Erholung nötig";
  return {score:score, label:label, fatigue:f, load:lr, monthlyBonus:bonus, hrv:hrv};
}

/* ---------- Befund: ein Satz + drei Belegzahlen ---------- */
function analyze(activities, log, todayStr, settings, body){
  var weeks = weeklyVolumes(activities, todayStr, 12);
  var acts = enrich(activities);
  var runs = acts.filter(function(a){ return isVolume(a.kind); });
  var jump = detectJump(weeks);
  var decline = detectDecline(weeks);
  var load = loadRatio(activities, todayStr);
  var cons = consistency(weeks);
  var pah = paceAtHr(activities, todayStr);
  var lr = longrunShare(weeks);
  var dates = runs.map(function(a){ return a.date; }).sort();

  var befund, proof;
  if (!runs.length){
    befund = "Noch keine Laufdaten importiert – der Befund erscheint, sobald eine CSV eingelesen ist.";
    proof = [["Läufe","0"],["Wochen","0"],["Umfang","0 km"]];
  } else if (jump){
    befund = "Dein Umfang ist in KW " + jump.week.week + " um " + jump.pct + " % über den Schnitt der vier Vorwochen gesprungen – das ist der Punkt, an dem du aufpassen solltest.";
    proof = [["Sprungwoche", jump.week.km + " km"], ["Schnitt davor", jump.avg + " km"], ["Belastung 7/28", load.ratio.toFixed(2)]];
  } else if (load.ratio >= 1.4){
    befund = "Die letzten sieben Tage liegen deutlich über deinem Vier-Wochen-Schnitt – kurzfristig zu viel auf einmal.";
    proof = [["7 Tage", load.km7 + " km"], ["Schnitt/Woche", load.base + " km"], ["Verhältnis", load.ratio.toFixed(2)]];
  } else if (decline && decline.pct <= -20){
    befund = "Dein Umfang ist über die letzten vier Wochen um " + Math.abs(decline.pct) + " % zurückgegangen – die Basis bröckelt, nicht die Form.";
    proof = [["Letzte 4 Wochen", decline.last4 + " km"], ["4 Wochen davor", decline.prev4 + " km"], ["Wochen mit 3+ Läufen", cons.weeks + "/" + cons.total]];
  } else if (pah && pah.deltaSec >= 8){
    befund = "Bei gleichem Puls läufst du inzwischen " + pah.deltaSec + " Sekunden pro Kilometer schneller – die Grundlagenarbeit greift.";
    proof = [["Früher", W.fmtPace(pah.oldPace)], ["Zuletzt", W.fmtPace(pah.newPace)], ["Pulsband", pah.band[0] + "–" + pah.band[1] + " bpm"]];
  } else if (cons.weeks >= Math.max(3, cons.total * 0.6)){
    befund = "Deine Konstanz trägt: In " + cons.weeks + " von " + cons.total + " Wochen standen mindestens drei Läufe – daran musst du nichts ändern.";
    proof = [["Beste Serie", cons.streak + " Wochen"], ["7 Tage", load.km7 + " km"], ["Longrun-Anteil", (lr ? lr.pct + " %" : "–")]];
  } else {
    befund = "Dein Training ist stabil, aber unregelmäßig – die Wochen mit weniger als drei Läufen kosten dich am meisten.";
    proof = [["Wochen mit 3+", cons.weeks + "/" + cons.total], ["7 Tage", load.km7 + " km"], ["Verhältnis 7/28", load.ratio.toFixed(2)]];
  }

  return {
    weeks:weeks, jump:jump, decline:decline, load:load, consistency:cons,
    paceAtHr:pah, longrun:lr, befund:befund, proof:proof,
    runs:runs.length, activities:acts.length,
    from:dates[0] || null, to:dates[dates.length-1] || null,
    kinds:acts.reduce(function(m,a){ m[a.kind] = (m[a.kind]||0)+1; return m; }, {}),
    readiness: readiness(log||{}, activities, todayStr, settings)
  };
}

/* ---------- Plan-Reparatur: genau eine Einheit ändern ---------- */
function planRepair(analysis, settings, todayStr){
  var s = W.normalizeSettings(settings);
  var lr = analysis.load;
  var reason = null, change = null;
  if (analysis.jump || lr.ratio >= 1.4){
    change = {
      kind:"run", field:"Distanz",
      from:s.runDistance + " km", to:Math.max(5, s.runDistance === 15 ? 10 : s.runDistance === 10 ? 5 : 5) + " km",
      day:"Lauftag"
    };
    reason = "Ich nehme genau eine Einheit zurück: den Wochenlauf. Deine letzten sieben Tage liegen über dem Vier-Wochen-Schnitt, und ein Sprung im Umfang ist der häufigste Weg in eine Zwangspause. Alles andere bleibt, wie es ist.";
  } else if (analysis.decline && analysis.decline.pct <= -20){
    change = {kind:"rounds", field:"Runden", from:s.rounds + " Runden", to:Math.min(3, s.rounds + 1) + " Runden", day:"Zirkeltage"};
    reason = "Dein Umfang ist zurückgegangen, deine Erholung ist gut. Ich lege eine Runde drauf, statt am Lauf zu drehen – so kommt die Basis zurück, ohne dass die Wochenbelastung springt.";
  } else if (analysis.readiness.score < 40){
    change = {kind:"level", field:"Intensität", from:s.level, to:"leicht", day:"Heute"};
    reason = "Deine Ermüdungswerte sind hoch. Ich ziehe nur die Intensität von heute herunter und lasse Umfang und Rhythmus unangetastet – erholen ist Training, Pausieren nicht.";
  } else {
    reason = "Ich ändere nichts. Belastungsverhältnis, Konsistenz und Longrun-Anteil liegen im Rahmen – in dieser Lage ist der beste Eingriff kein Eingriff.";
  }
  return {change:change, reason:reason, proof:analysis.proof};
}

/* ============================================================
   AUTO-ADAPTIVE PACE: Benchmarks aus den eigenen Bestleistungen
   ============================================================ */
var BENCH_DISTANCES = [1, 3, 5, 10, 21.1];
/* Riegel: t2 = t1 * (d2/d1)^1.06 */
function riegel(sec, fromKm, toKm){ return sec * Math.pow(toKm / fromKm, 1.06); }

/* Sucht den stärksten Lauf und rechnet ihn auf alle Distanzen hoch. */
function paceBaseline(activities, log, todayStr){
  var runs = enrich(activities).filter(function(a){
    return a.kind === "lauf" && a.distanceKm >= 0.8 && a.durationSec > 60;
  });
  if (!runs.length){
    return {source:"keine", best:null, refKm:5, refSec:5*390, fitness:0, fresh:0};
  }
  // Bestleistung = kleinste auf 5 km normierte Zeit
  var best = null;
  runs.forEach(function(r){
    var norm = riegel(r.durationSec, r.distanceKm, 5);
    if (!best || norm < best.norm) best = {act:r, norm:norm};
  });
  // Aktualität: Läufe der letzten 8 Wochen zählen mehr
  var recent = runs.filter(function(r){
    return dayIndexSafe(todayStr) - dayIndexSafe(r.date) <= 56;
  });
  // Formstand ausschliesslich aus Laufaktivitaeten, sonst wuerde eine
  // Radausfahrt die Laufprognose beschleunigen.
  var runOnly = (activities || []).filter(function(a){ return classify(a) === "lauf" || classify(a) === "trail"; });
  var f = W.fitnessScore(log || {}, runOnly, todayStr);
  return {
    source: runs.length + (runs.length === 1 ? " Lauf" : " Läufe"),
    best: best.act, refKm: best.act.distanceKm, refSec: best.act.durationSec,
    norm5: Math.round(best.norm), runs: runs.length, recent: recent.length,
    fitness: f.score,
    fresh: recent.length ? 1 : 0
  };
}
function dayIndexSafe(d){ try { return W.dayIndex(d); } catch(e){ return 0; } }

/* Zielzeiten für 1, 3, 5, 10 und 21,1 km */
function benchmarks(activities, log, todayStr, settings){
  var b = paceBaseline(activities, log, todayStr);
  var out = [];
  BENCH_DISTANCES.forEach(function(km){
    var sec;
    if (b.best){
      sec = riegel(b.refSec, b.refKm, km);
      // Formkorrektur: gute Konstanz macht schneller, lange Pause langsamer
      var adj = 1 - ((b.fitness - 50) / 100) * 0.10;
      if (!b.fresh) adj *= 1.06;
      sec = sec * Math.max(0.92, Math.min(1.15, adj));
    } else {
      sec = km * 390;
    }
    // eigene Bestzeit auf genau dieser Distanz schlägt die Hochrechnung
    var exact = null;
    enrich(activities).forEach(function(a){
      if (a.kind !== "lauf") return;
      if (Math.abs(a.distanceKm - km) > Math.max(0.3, km * 0.06)) return;
      if (!exact || a.durationSec < exact) exact = a.durationSec;
    });
    out.push({
      km: km,
      target: Math.round(sec),
      paceSec: Math.round(sec / km),
      best: exact ? Math.round(exact) : null,
      bestPace: exact ? Math.round(exact / km) : null
    });
  });
  return {list:out, base:b};
}
/* Pace, die die alte manuelle Einstellung ersetzt */
function autoBasePace(activities, log, todayStr){
  var b = benchmarks(activities, log, todayStr);
  var five = b.list.filter(function(x){ return x.km === 5; })[0];
  return five ? five.paceSec : 390;
}

/* Laufprognose auf Basis der automatischen Benchmarks */
function estimateRunAuto(distanceKm, activities, log, todayStr, settings){
  var b = benchmarks(activities, log, todayStr, settings);
  var exact = b.list.filter(function(x){ return Math.abs(x.km - distanceKm) < 0.05; })[0];
  var sec;
  if (exact) sec = exact.target;
  else {
    var ref = b.list[2];
    sec = riegel(ref.target, ref.km, distanceKm);
  }
  var pace = sec / distanceKm;
  return {
    seconds: Math.round(sec),
    paceSec: Math.round(pace),
    source: b.base.best
      ? "aus deiner besten Leistung (" + b.base.refKm + " km in " + W.fmtTime(b.base.refSec) + ") und deinem Formstand"
      : "aus einem Startwert – sobald Läufe vorliegen, rechnet die App mit deinen echten Zeiten",
    splits: W.__buildSplits ? W.__buildSplits(distanceKm, pace) : buildSplitsLocal(distanceKm, pace),
    benchmarks: b.list
  };
}
function buildSplitsLocal(distanceKm, paceSec){
  var out = [], acc = 0, n = Math.floor(distanceKm);
  for (var k = 1; k <= n; k++){
    var f = 1 + (0.02 - 0.04 * (k / Math.max(1, n)));
    var t = paceSec * f; acc += t;
    out.push({km:k, split:Math.round(t), total:Math.round(acc)});
  }
  return out;
}

/* ---------- Export ---------- */
function toCSV(activities){
  var head = "Datum;Name;Typ;Distanz_km;Dauer_s;Kalorien;Schritte;Puls;Hoehenmeter;Quelle";
  var rows = (activities||[]).map(function(a){
    return [a.date, String(a.name||"").replace(/;/g,","), classify(a), a.distanceKm||0,
            a.durationSec||0, a.calories||0, a.steps||0, a.avgHr||0, a.elev||0, a.source||""].join(";");
  });
  return head + "\n" + rows.join("\n");
}
function toGPX(a){
  return '<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Trainingsblog">\n' +
    '<metadata><name>' + String(a.name||"Aktivität").replace(/[<>&]/g,"") + '</name><time>' + a.date + 'T06:00:00Z</time></metadata>\n' +
    '<trk><name>' + String(a.name||"Aktivität").replace(/[<>&]/g,"") + '</name><trkseg></trkseg></trk>\n</gpx>';
}
function toTCX(a){
  return '<?xml version="1.0" encoding="UTF-8"?>\n<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">\n' +
    '<Activities><Activity Sport="' + (isVolume(classify(a)) ? "Running" : "Other") + '">\n' +
    '<Id>' + a.date + 'T06:00:00Z</Id>\n<Lap StartTime="' + a.date + 'T06:00:00Z">\n' +
    '<TotalTimeSeconds>' + (a.durationSec||0) + '</TotalTimeSeconds>\n' +
    '<DistanceMeters>' + Math.round((a.distanceKm||0)*1000) + '</DistanceMeters>\n' +
    '<Calories>' + (a.calories||0) + '</Calories>\n</Lap>\n</Activity></Activities>\n</TrainingCenterDatabase>';
}

var API = {
  classify:classify, enrich:enrich, isVolume:isVolume, isClean:isClean,
  isoMonday:isoMonday, isoWeekNumber:isoWeekNumber, weeklyVolumes:weeklyVolumes,
  detectJump:detectJump, detectDecline:detectDecline, loadRatio:loadRatio,
  consistency:consistency, paceAtHr:paceAtHr, longrunShare:longrunShare,
  BODY_DEFAULT:BODY_DEFAULT, normalizeBody:normalizeBody, bmrPerDay:bmrPerDay,
  metFor:metFor, calories:calories, burnFor:burnFor, dayBurn:dayBurn,
  fatigue:fatigue, readiness:readiness, analyze:analyze, planRepair:planRepair,
  toCSV:toCSV, toGPX:toGPX, toTCX:toTCX,
  BENCH_DISTANCES:BENCH_DISTANCES, riegel:riegel, paceBaseline:paceBaseline,
  benchmarks:benchmarks, autoBasePace:autoBasePace, estimateRunAuto:estimateRunAuto
};
for (var k in API) W[k] = API[k];
W.estimateRun = estimateRunAuto;      // ersetzt die manuelle Pace-Vorgabe
root.OS = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;

})(typeof globalThis !== "undefined" ? globalThis : this);

/* ============================================================
   TRAINING-ANALYSE – Übungen statt Kilometer
   ============================================================ */
(function(root){
"use strict";
var W = root.WK, OS = root.OS;

/* Wochen aus dem Trainingsverlauf: Einheiten, Übungen, Minuten, Gruppen */
function trainingWeeks(log, todayStr, n, planFn){
  n = n || 12;
  var curMon = OS.isoMonday(todayStr);
  var out = [];
  for (var i = n - 1; i >= 0; i--){
    var mon = W.addDays(curMon, -7*i);
    var sun = W.addDays(mon, 6);
    var sessions = 0, exercises = 0, sec = 0, rests = 0;
    var groups = {};
    W.GROUPS.forEach(function(g){ groups[g] = 0; });
    var days = [];
    for (var d = 0; d < 7; d++){
      var ds = W.addDays(mon, d);
      var e = log[ds];
      var done = !!(e && e.done);
      var rest = !!(e && e.done && e.type === "rest");
      if (done){
        sessions++;
        if (rest) rests++;
        sec += e.sec || 0;
        var ex = (e.ex && e.ex.length) ? e.ex.length : (rest ? 0 : (e.groups ? e.groups.length : 0));
        exercises += ex;
        (e.groups || []).forEach(function(g){ if (groups[g] !== undefined) groups[g]++; });
      }
      days.push({date:ds, weekday:W.parseYmd(ds).getDay(), done:done, rest:rest,
                 future:ds > todayStr, today:ds === todayStr, entry:e || null});
    }
    out.push({
      monday:mon, week:OS.isoWeekNumber(mon), year:W.parseYmd(mon).getFullYear(),
      sessions:sessions, rests:rests, exercises:exercises, sec:sec, groups:groups,
      days:days, complete: sun < todayStr
    });
  }
  return out;
}

/* Sprung: > 30 % über dem Schnitt der 4 Vorwochen UND mindestens 5 Einheiten */
function detectTrainingJump(weeks){
  var flagged = null;
  for (var i = 4; i < weeks.length; i++){
    var w = weeks[i];
    if (!w.complete) continue;
    var prev = weeks.slice(i-4, i);
    var avg = prev.reduce(function(a,b){ return a + b.exercises; }, 0) / 4;
    if (avg <= 0) continue;
    var pct = (w.exercises - avg) / avg;
    if (pct > 0.30 && w.sessions >= 5){
      flagged = {index:i, week:w, avg:Math.round(avg*10)/10, pct:Math.round(pct*100)};
    }
  }
  return flagged;
}
function trainingDecline(weeks){
  var done = weeks.filter(function(w){ return w.complete; });
  if (done.length < 8) return null;
  var l = done.slice(-4), p = done.slice(-8, -4);
  var a = l.reduce(function(x,y){ return x + y.sessions; }, 0) / 4;
  var b = p.reduce(function(x,y){ return x + y.sessions; }, 0) / 4;
  if (b <= 0) return null;
  return {last4:Math.round(a*10)/10, prev4:Math.round(b*10)/10, pct:Math.round((a-b)/b*100)};
}
function trainingLoad(log, todayStr){
  function n(days){
    var c = 0;
    for (var i = 0; i < days; i++){
      var e = log[W.addDays(todayStr, -i)];
      if (e && e.done) c += (e.type === "rest" ? 0.35 : 1);
    }
    return c;
  }
  var s7 = n(7), s28 = n(28), base = s28 / 4;
  return {s7:Math.round(s7*10)/10, s28:Math.round(s28*10)/10,
          base:Math.round(base*10)/10,
          ratio: base > 0 ? Math.round(s7/base*100)/100 : 0};
}
function trainingConsistency(weeks){
  var done = weeks.filter(function(w){ return w.complete; });
  var good = 0, run = 0, best = 0;
  done.forEach(function(w){
    if (w.sessions >= 3){ good++; run++; if (run > best) best = run; }
    else run = 0;
  });
  return {weeks:good, total:done.length, streak:best};
}
/* Ausgewogenheit der Muskelgruppen über die letzten abgeschlossenen Wochen */
function groupBalance(weeks){
  var tot = {}, sum = 0;
  W.GROUPS.forEach(function(g){ tot[g] = 0; });
  weeks.forEach(function(w){
    W.GROUPS.forEach(function(g){ tot[g] += w.groups[g]; sum += w.groups[g]; });
  });
  if (!sum) return {balance:0, totals:tot, sum:0};
  var ideal = sum / W.GROUPS.length;
  var dev = W.GROUPS.reduce(function(a,g){ return a + Math.abs(tot[g] - ideal); }, 0) / (2*sum);
  return {balance:Math.round((1 - dev) * 100), totals:tot, sum:sum};
}

function analyzeTraining(log, todayStr, settings, weekGoal){
  var weeks = trainingWeeks(log, todayStr, 12);
  var cur = weeks[weeks.length - 1];
  var jump = detectTrainingJump(weeks);
  var dec = trainingDecline(weeks);
  var load = trainingLoad(log, todayStr);
  var cons = trainingConsistency(weeks);
  var bal = groupBalance(weeks);
  var streak = W.currentStreak(log, todayStr);
  var best = W.longestStreak(log);
  var avgEx = cons.total ? Math.round(weeks.filter(function(w){ return w.complete; })
                .reduce(function(a,w){ return a + w.exercises; }, 0) / cons.total) : 0;
  var goal = weekGoal > 0 ? weekGoal : 7;

  var befund, proof;
  if (!Object.keys(log).length){
    befund = "Noch kein Training erfasst – der Befund erscheint nach der ersten Einheit.";
    proof = [["Einheiten","0"],["Wochen","0"],["Streak in Tagen","0"]];
  } else if (jump){
    befund = "In KW " + jump.week.week + " lagen deine Übungen " + jump.pct + " % über dem Schnitt der vier Vorwochen – dort ist dein Umfang gesprungen.";
    proof = [["Übungen Sprungwoche", String(jump.week.exercises)], ["Schnitt davor", String(jump.avg)], ["Belastung 7/28", load.ratio.toFixed(2)]];
  } else if (load.ratio >= 1.4){
    befund = "Die letzten sieben Tage liegen deutlich über deinem Vier-Wochen-Schnitt – kurzfristig viel auf einmal.";
    proof = [["Einheiten 7 Tage", String(load.s7)], ["Schnitt pro Woche", String(load.base)], ["Verhältnis", load.ratio.toFixed(2)]];
  } else if (dec && dec.pct <= -25){
    befund = "Deine Einheiten pro Woche sind um " + Math.abs(dec.pct) + " % zurückgegangen – die Regelmäßigkeit bröckelt, nicht die Form.";
    proof = [["Letzte 4 Wochen", String(dec.last4)], ["4 Wochen davor", String(dec.prev4)], ["Streak in Tagen", String(streak)]];
  } else if (bal.sum && bal.balance < 70){
    var weakest = W.GROUPS.slice().sort(function(a,b){ return bal.totals[a] - bal.totals[b]; })[0];
    befund = W.GROUP_LABEL[weakest] + " kommt deutlich seltener dran als der Rest – dort entsteht dein Ungleichgewicht.";
    proof = [["Ausgewogenheit", bal.balance + " %"], [W.GROUP_LABEL[weakest], bal.totals[weakest] + "\u00d7"], ["Einheiten gesamt", String(bal.sum)]];
  } else if (streak >= 7){
    befund = "Du trainierst seit " + streak + " Tagen ohne Unterbrechung – genau daraus entsteht die Anpassung.";
    proof = [["Streak in Tagen", String(streak)], ["Rekord", String(best)], ["Ø Übungen/Woche", String(avgEx)]];
  } else if (cons.weeks >= Math.max(3, cons.total * 0.6)){
    befund = "In " + cons.weeks + " von " + cons.total + " Wochen standen mindestens drei Einheiten – deine Konstanz trägt.";
    proof = [["Beste Serie in Wochen", String(cons.streak)], ["Diese Woche", cur.sessions + "/" + goal], ["Ausgewogenheit", bal.balance + " %"]];
  } else {
    befund = "Dein Training läuft, aber unregelmäßig – die Wochen unter drei Einheiten kosten dich am meisten.";
    proof = [["Wochen mit 3+", cons.weeks + "/" + cons.total], ["Einheiten 7 Tage", String(load.s7)], ["Verhältnis 7/28", load.ratio.toFixed(2)]];
  }

  return {
    weeks:weeks, current:cur, jump:jump, decline:dec, load:load,
    consistency:cons, balance:bal, streak:streak, best:best,
    avgExercises:avgEx, goal:goal, befund:befund, proof:proof
  };
}

/* Plan-Reparatur auf Basis des Trainings */
function rnd(n){ return n + (n === 1 ? " Runde" : " Runden"); }
function repairTraining(t, readinessScore, settings){
  var s = W.normalizeSettings(settings);
  var change = null, reason;
  if (t.jump || t.load.ratio >= 1.4){
    change = {kind:"rounds", from:rnd(s.rounds), to:rnd(Math.max(1, s.rounds - 1))};
    reason = "Ich nehme genau eine Einheit zurück und streiche eine Runde. Deine letzten sieben Tage liegen über dem Vier-Wochen-Schnitt, und ein Sprung im Umfang ist der häufigste Weg in eine Zwangspause. Rhythmus und Übungsauswahl bleiben unangetastet.";
  } else if (readinessScore < 40){
    change = {kind:"level", from:s.level, to:"leicht"};
    reason = "Deine Ermüdungswerte sind hoch. Ich ziehe nur die Intensität von heute herunter und lasse Anzahl und Auswahl der Übungen gleich – erholen ist Training, ausfallen lassen nicht.";
  } else if (t.decline && t.decline.pct <= -25){
    change = {kind:"rounds", from:rnd(s.rounds), to:rnd(Math.min(3, s.rounds + 1))};
    reason = "Deine Einheiten pro Woche sind zurückgegangen, deine Erholung ist gut. Ich lege eine Runde drauf, statt zusätzliche Tage zu fordern – so kommt die Basis zurück, ohne dass du mehr Termine brauchst.";
  } else if (t.balance.sum && t.balance.balance < 70){
    var weak = W.GROUPS.slice().sort(function(a,b){ return t.balance.totals[a] - t.balance.totals[b]; })[0];
    change = {kind:"focus", from:"gleichmäßig", to:W.GROUP_LABEL[weak] + " zuerst"};
    reason = "Ich ziehe " + W.GROUP_LABEL[weak] + " im Zirkel nach vorn, weil diese Gruppe zuletzt am seltensten drankam. Frisch trainiert man sauberer – die Übung selbst und der Umfang ändern sich nicht.";
  } else {
    reason = "Ich ändere nichts. Belastungsverhältnis, Konstanz und die Verteilung über die Muskelgruppen liegen im Rahmen – in dieser Lage ist der beste Eingriff kein Eingriff.";
  }
  return {change:change, reason:reason, proof:t.proof};
}

var X = {
  trainingWeeks:trainingWeeks, detectTrainingJump:detectTrainingJump,
  trainingDecline:trainingDecline, trainingLoad:trainingLoad,
  trainingConsistency:trainingConsistency, groupBalance:groupBalance,
  analyzeTraining:analyzeTraining, repairTraining:repairTraining
};
for (var k in X){ OS[k] = X[k]; W[k] = X[k]; }
if (typeof module !== "undefined" && module.exports) for (var j in X) module.exports[j] = X[j];
})(typeof globalThis !== "undefined" ? globalThis : this);
