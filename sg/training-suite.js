/* Training-Verbund: Mobility (Rodel-Mobility) und Atmung & HRV (Pulsplan) als Bereiche der Training-App.
 * Die Module laufen als eigene Seiten (mobility/, atmung/) im Vollbild über der App; ihre Daten liegen im
 * gemeinsamen Speicher. Hier werden sie in „Heute“, „Training“ und die Bereitschaft eingebunden. */
(function () {
  "use strict";
  if (!window.APP) return;
  var A = window.APP;
  var MODS = { mobility: { title: "Mobility", src: "mobility/" }, atmung: { title: "Atmung & HRV", src: "atmung/" }, bahnplan: { title: "Bahnplan", src: "bahnplan/" } };
  var BLOCKS = [["A", "Rücken & Wirbelsäule"], ["B", "Hüfte & Becken"], ["C", "Beinrückseite & Waden"]];
  function json(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ymd(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function today() { return ymd(new Date()); }

  /* ---------- HRV für die Bereitschaft ----------
   * Vergleich des heutigen ln(RMSSD) mit dem persönlichen Normalbereich der letzten 28 Tage
   * (Mittelwert ± 0,5 SD als kleinste bedeutsame Änderung, Plews et al. 2013). Ab 5 Vergleichswerten. */
  window.SG_HRV = function (dateStr) {
    var p = json("pulsplan.v1"); if (!p || !p.morning || !p.morning.length) return null;
    var day = dateStr || today(), list = p.morning.filter(function (m) { return m.rmssd > 0; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var cur = list.filter(function (m) { return m.date === day; }).pop(); if (!cur) return null;
    var from = ymd(new Date(new Date(day).getTime() - 28 * 864e5));
    var base = list.filter(function (m) { return m.date < day && m.date >= from; }).map(function (m) { return Math.log(m.rmssd); });
    if (base.length < 5) return { adj: 0, status: "sammelt", text: "Normalbereich wird ermittelt (" + base.length + "/5 Messungen)", rmssd: cur.rmssd };
    var mean = base.reduce(function (a, b) { return a + b; }, 0) / base.length;
    // Tagesschwankung von ln(RMSSD) liegt typischerweise bei 5–10 % – sehr ruhige Messreihen nicht überbewerten
    var sd = Math.max(0.06, Math.sqrt(base.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / (base.length - 1)) || 0);
    var z = (Math.log(cur.rmssd) - mean) / sd;
    if (z < -1.5) return { adj: -15, status: "niedrig", text: "deutlich unter deinem Normalbereich – heute lieber locker", rmssd: cur.rmssd, z: z };
    if (z < -0.75) return { adj: -7, status: "leicht niedrig", text: "etwas unter deinem Normalbereich", rmssd: cur.rmssd, z: z };
    if (z > 0.5) return { adj: 3, status: "hoch", text: "über deinem Normalbereich", rmssd: cur.rmssd, z: z };
    return { adj: 0, status: "normal", text: "im Normalbereich", rmssd: cur.rmssd, z: z };
  };

  /* ---------- Module im Vollbild ---------- */
  var st = document.createElement("style");
  // Mobility/Atmung öffnen über der Leiste: die Training-Leiste bleibt unten, die des Bereichs steht als zweite Reihe darüber
  st.textContent = ".tsmod{position:fixed;inset:0 0 calc(80px + env(safe-area-inset-bottom,0px)) 0;z-index:39;background:var(--bg);display:flex;flex-direction:column}" +
    ".tsmod[hidden]{display:none}.tsmod header{padding-right:58px!important;display:flex;align-items:center;gap:8px;padding:calc(8px + env(safe-area-inset-top,0px)) 10px 8px;border-bottom:1px solid var(--line);background:var(--bg)}" +
    ".tsmod header button{border:0;background:var(--panel-2);color:var(--text);border-radius:10px;padding:8px 12px;font:600 14px/1 inherit;cursor:pointer}" +
    ".tsmod header b{font-size:16px;flex:1}.tsmod iframe{flex:1;width:100%;border:0;background:var(--bg)}" +
    ".ts-rows{display:flex;flex-direction:column;gap:2px;margin-bottom:12px}.ts-row{display:flex;gap:10px;align-items:center;padding:9px 4px;border-bottom:1px solid var(--line);cursor:pointer}" +
    ".ts-row:last-child{border-bottom:0}.ts-row i{width:8px;height:8px;border-radius:50%;background:var(--text-faint);flex:none}.ts-row.ok i{background:var(--work,#4fc18a)}" +
    ".ts-row b{display:block;font-size:14px}.ts-row span{font-size:12.5px;color:var(--text-dim)}.ts-row .go{margin-left:auto;color:var(--text-dim);font-size:18px}" +
    ".ts-merged{display:none!important}.ts-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
    ".ts-grid .btn{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:12px 14px;min-height:58px;width:100%}" +
    ".ts-grid .btn small{font-weight:500;font-size:12px;opacity:.75}" +
    ".ts-grid .btn:not(.accent){background:var(--panel-2);border:1px solid var(--line);color:var(--text)}" +
    ".ts-info{background:var(--panel-2);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:12px;font-size:14px;line-height:1.45}" +
    ".cal-cell .sgd{position:absolute;top:4px;left:0;right:0;display:flex;justify-content:center;gap:2px;pointer-events:none}.cal-cell .sgd i{width:4px;height:4px;border-radius:50%}" +
    ".ts-ev{display:grid;grid-template-columns:50px 4px minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 2px;border-top:1px solid var(--line);font-size:14px;cursor:pointer;color:var(--text)}" +
    ".ts-ev em{width:4px;height:20px;border-radius:2px;background:var(--c)}.ts-ev .tm{color:var(--text-dim);font-size:13px;font-variant-numeric:tabular-nums}.ts-ev .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ts-ev .ap{font-size:11.5px;color:var(--text-faint)}" +
    ".ts-evd{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-faint);margin:12px 0 2px}" +
    ".ts-adv>summary{cursor:pointer;font-weight:650;margin:6px 0 10px;color:var(--text-dim)}" +
    ".ts-src{font-size:12.5px;color:var(--text-dim);line-height:1.5}.ts-src h3{font-size:13px;color:var(--text);margin:12px 0 4px}.ts-src p{margin:0 0 3px}";
  document.head.appendChild(st);
  var wrap = document.createElement("div");
  wrap.className = "tsmod"; wrap.hidden = true;
  wrap.innerHTML = "<header><button type='button' data-ts='close'>‹ Training</button><b></b><button type='button' data-ts='reload' aria-label='Neu laden'>↻</button></header>";
  document.body.appendChild(wrap);
  var frames = {}, openId = null;
  function openMod(id, sub) {
    if (!MODS[id]) return;
    // in der gemeinsamen Hülle: Mobility/Atmung/Bahnplan dort öffnen (eigenes Ziel unten) statt als Fenster im Training
    var SH = null; try { SH = window.top !== window && window.top.SGShell; } catch (e) {}
    if (SH) { SH.openModule(id, sub || ""); if (MODS[location.hash.replace("#", "").split("/")[0]]) history.replaceState(null, "", location.pathname); return; }
    openId = id; wrap.hidden = false; wrap.querySelector("b").textContent = MODS[id].title;
    Object.keys(frames).forEach(function (k) { frames[k].hidden = k !== id; });
    if (!frames[id]) { var f = document.createElement("iframe"); f.src = MODS[id].src; f.title = MODS[id].title; frames[id] = f; wrap.appendChild(f); }
    document.documentElement.style.overflow = "hidden";
    if (sub) goSub(frames[id], sub);
  }
  // Unterbereich im Modul öffnen (z. B. Wettkampf), sobald es geladen ist
  function goSub(f, sub, tries) {
    try {
      var b = f.contentDocument && f.contentDocument.querySelector("nav [data-tab='" + sub + "'], nav [data-go='" + sub + "'], nav [data-v='" + sub + "']");
      if (b) { b.click(); return; }
    } catch (e) {}
    if ((tries || 0) < 40) setTimeout(function () { goSub(f, sub, (tries || 0) + 1); }, 150);
  }
  function closeMod() {
    openId = null; wrap.hidden = true; document.documentElement.style.overflow = "";
    try { A.renderAll(); } catch (e) {}
    render();
  }
  // Sprungziele aus dem Befehlsmenü: #start, #kalender, #lauf, #kraft, #fitness, #daten, #einst
  // (#lauf und #kraft sind zwei Ausschnitte derselben Seite, data-part an #s-lauf)
  var SCREENS = { kalender: 1, lauf: 1, kraft: 1, fitness: 1, daten: 1, einst: 1, heute: 1 };
  function fromHash() {
    var h = location.hash.replace("#", "").split("/");
    if (MODS[h[0]]) { openMod(h[0], h[1]); return; }
    if (openId) closeMod();
    if (h[0] === "start" || SCREENS[h[0]]) {
      history.replaceState(null, "", location.pathname);
      var tab = document.querySelector("#nav [data-t='" + (h[0] === "start" ? "heute" : h[0] === "kraft" ? "lauf" : h[0]) + "']"); if (tab) tab.click();
      if (h[0] === "lauf" || h[0] === "kraft") { var sl = document.getElementById("s-lauf"); if (sl) sl.setAttribute("data-part", h[0]); }
      if (h[0] === "start") setTimeout(function () { var b = document.getElementById("btnStartToday"); if (b) b.click(); }, 150);
    }
  }
  addEventListener("hashchange", fromHash);
  wrap.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ts]"); if (!b) return;
    if (b.dataset.ts === "reload" && frames[openId]) frames[openId].contentWindow.location.reload();
    if (b.dataset.ts === "close") { if (MODS[location.hash.replace("#", "").split("/")[0]]) history.back(); else closeMod(); }
  });
  // Tipp auf die Training-Leiste schließt einen offenen Bereich
  document.addEventListener("click", function (e) {
    if (openId && e.target.closest("#nav .tab")) { if (MODS[location.hash.replace("#", "").split("/")[0]]) history.replaceState(null, "", location.pathname); closeMod(); }
  }, true);
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-tsclick]");
    if (c) { e.preventDefault(); var t = document.getElementById(c.dataset.tsclick); if (t) t.click(); return; }
    var b = e.target.closest("[data-tsopen]"); if (!b) return;
    e.preventDefault(); location.hash = b.dataset.tsopen;
  });

  /* ---------- Ein Kalender für alles: Schule, Planer-Termine, Atmung und Mobility auch im Training ---------- */
  function SC() { return window.SharedCalendar; }
  // eigene Trainings-Einträge (erledigt, Aktivitäten) zeigt der Training-Kalender schon selbst
  function others(from, to) { var C = SC(); if (!C || !C.allItems) return []; return C.allItems(from, to).filter(function (e) { return !/^t[ab]-/.test(e.id); }); }
  function srcColor(e) { var C = SC(), s = C && (C.sources || []).find(function (x) { return x[0] === e.app; }); return e.color || (s && s[1]) || "#8b8fa3"; }
  function evRows(list, withDay) {
    var h = "", cur = "", WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    list.forEach(function (e) {
      if (withDay && e.date !== cur) { cur = e.date; var d = new Date(e.date + "T00:00:00"); h += "<div class='ts-evd'>" + (e.date === today() ? "Heute" : WD[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + ".") + "</div>"; }
      var go = e.linkApp === "training" ? e.linkHash || "#" : e.link || "";
      h += "<div class='ts-ev' data-tsgo='" + esc(go) + "'><span class='tm'>" + esc(e.time || "ganzt.") + "</span><em style='--c:" + srcColor(e) + "'></em><span class='nm'>" + esc(e.title) + "</span><span class='ap'>" + esc(e.app) + "</span></div>";
    });
    return h;
  }
  function weekAllHTML() {
    var C = SC(); if (!C || !C.allItems) return "";
    var t = today(), d = new Date(); d.setDate(d.getDate() + 6);
    var list = others(t, ymd(d)), wp = C.weekPlanConfig ? C.weekPlanConfig() : { on: false };
    return "<div class='card-h'><h2>Nächste 7 Tage · alle Apps</h2>" + (wp.on ? "<button class='btn accent sm' type='button' data-tswp='1'>Woche planen</button>" : "") + "</div>" +
      "<p class='muted' style='margin:0 0 4px'>Schule, Planer, Mobility und Atmung – derselbe Kalender wie im Planer.</p>" +
      (list.length ? evRows(list.slice(0, 30), true) : "<p class='muted'>Nichts geplant.</p>");
  }
  function decoGrid() {
    var cells = document.querySelectorAll("#calGrid .cal-cell[data-date]");
    Array.prototype.forEach.call(document.querySelectorAll("#calGrid .sgd"), function (x) { x.remove(); });
    if (!cells.length) return;
    var by = {};
    others(cells[0].dataset.date, cells[cells.length - 1].dataset.date).forEach(function (e) { (by[e.date] = by[e.date] || []).push(e); });
    Array.prototype.forEach.call(cells, function (c) {
      var l = by[c.dataset.date]; if (!l) return;
      var s = document.createElement("span"); s.className = "sgd"; s.title = l.length + " weitere Termine";
      s.innerHTML = l.slice(0, 4).map(function (e) { return "<i style='background:" + srcColor(e) + "'></i>"; }).join("");
      c.appendChild(s);
    });
  }
  function decoSheet(d) {
    var old = document.getElementById("tsSheetEv"); if (old) old.remove();
    var list = others(d, d); if (!list.length) return;
    var box = document.createElement("div"); box.id = "tsSheetEv"; box.style.marginTop = "14px";
    box.innerHTML = "<div class='ts-evd' style='margin-top:0'>Weitere Termine an diesem Tag</div>" + evRows(list, false);
    var host = document.getElementById("sheetList"); if (host) host.parentNode.insertBefore(box, host.nextSibling);
  }
  (function hook() {
    if (!window.APP4) return setTimeout(hook, 300);
    if (window.APP4.__sg) return; window.APP4.__sg = true;
    var g = window.APP4.decorateCalendarGrid, s = window.APP4.decorateSheet;
    window.APP4.decorateCalendarGrid = function () { try { if (g) g.apply(this, arguments); } catch (e) {} decoGrid(); };
    window.APP4.decorateSheet = function (d) { try { if (s) s.apply(this, arguments); } catch (e) {} decoSheet(d); };
  })();
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-tswp]")) { e.preventDefault(); if (SC() && SC().weekPlan) SC().weekPlan(); return; }
    var r = e.target.closest("[data-tsgo]"); if (!r) return;
    var go = r.dataset.tsgo; if (!go) return;
    if (go.charAt(0) === "#") { if (go !== "#") location.hash = go; } else location.href = window.SGFixUrl ? window.SGFixUrl(go) : go;
  });

  /* ---------- Inhalte ---------- */
  function mobilityInfo() {
    var r = json("rodelmobility.v1") || {}, t = today();
    var b = BLOCKS[(r.next || 0) % 3], done = (r.sessions || []).filter(function (x) { return x.date === t; });
    var tests = (r.tests || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    return { block: b, done: done.length > 0, min: Math.round(((r.dur || 40) * 5 + 60) / 60), lastTest: tests[tests.length - 1] };
  }
  function breathInfo() {
    var p = json("pulsplan.v1") || {}, t = today();
    var ent = (p.entries || []).filter(function (e) { return e.date === t; }).sort(function (a, b) { return (a.time || "") < (b.time || "") ? -1 : 1; });
    var ses = (p.sessions || []).filter(function (x) { return x.date === t; }).length;
    var mm = (p.morning || []).find(function (m) { return m.date === t; });
    return { entries: ent, sessions: ses, morning: mm, hrv: window.SG_HRV(t) };
  }
  function row(ok, title, sub, mod) {
    return "<div class='ts-row" + (ok ? " ok" : "") + "' data-tsopen='" + mod + "'><i></i><div><b>" + esc(title) + "</b><span>" + esc(sub) + "</span></div><span class='go'>›</span></div>";
  }
  function heuteHTML() {
    var m = mobilityInfo(), b = breathInfo(), h = "<div class='card-h'><h2>Dazu heute</h2><span>Mobility · Atmung</span></div><div class='ts-rows'>";
    h += row(m.done, m.done ? "Mobility erledigt" : "Mobility · Block " + m.block[0], m.done ? "✓ heute geschafft – morgen geht es mit dem nächsten Block weiter" : m.block[1] + " · ca. " + m.min + " Min.", "mobility");
    if (b.entries.length) b.entries.forEach(function (e, i) {
      h += row(i < b.sessions, (e.time ? e.time + " · " : "") + (e.type || "Atmung"), ((e.dur || e.minutes) ? (e.dur || e.minutes) + " Min." : "") + (i < b.sessions ? " · ✓ erledigt" : " · geplant"), "atmung");
    });
    else h += row(b.sessions > 0, b.sessions ? "Atemübung erledigt" : "Atmung", b.sessions ? "✓ " + b.sessions + " Einheit" + (b.sessions > 1 ? "en" : "") + " heute" : "5–10 Min. im 6er-Takt senken den Stress messbar", "atmung");
    if (b.morning) h += row(true, "Morgen-HRV: RMSSD " + b.morning.rmssd + " ms", b.hrv ? b.hrv.text + (b.hrv.adj ? " (Bereitschaft " + (b.hrv.adj > 0 ? "+" : "") + b.hrv.adj + ")" : "") : "Puls " + b.morning.hr, "atmung");
    else h += row(false, "Morgen-HRV messen", "2 Min. nach dem Aufwachen – fließt in deine Trainingsbereitschaft ein", "atmung");
    return h + "</div>";
  }
  function trainingHTML() {
    var m = mobilityInfo();
    return "<div class='card' id='tsMobCard' data-sec='tsmob'><div class='card-h'><h2>Mobility & Dehnen</h2><span>alles an einem Ort</span></div>" +
      "<p class='muted' id='tsMobText' style='margin-bottom:12px'>" + mobText(m) + "</p>" +
      "<div class='ts-grid'><button class='btn accent' data-tsopen='mobility'>Tagesblock " + m.block[0] + "<small>" + esc(m.block[1]) + "</small></button>" +
      "<button class='btn' data-tsopen='mobility/wettkampf'>Wettkampf<small>vor dem Start · nach dem Lauf</small></button>" +
      "<button class='btn' data-tsclick='btnStretchStart'>Freies Dehnen<small>120 Übungen, Bereich wählen</small></button>" +
      "<button class='btn' data-tsclick='btnRodelnStart'>Rodeln-Aufwärmen<small>15 Min., durchgehend bewegt</small></button></div></div>" +
      "<div class='card' id='tsBreathCard' data-sec='tsbreath'><div class='card-h'><h2>Atmung & HRV</h2><span>12-Wochen-Plan</span></div>" +
      "<p class='muted' style='margin-bottom:12px'>Resonanzatmung mit Biofeedback (Polar H10), Resonanztest, Morgenmessung der Herzratenvariabilität und Werkzeuge gegen akuten Stress. Die Morgen-HRV fließt in deine Trainingsbereitschaft ein.</p>" +
      "<div class='ts-grid'><button class='btn accent' data-tsopen='atmung'>Atmung öffnen<small>Übungen und Plan</small></button><button class='btn' data-tsopen='atmung/train'>Jetzt üben<small>Takt, Resonanz, Morgenmessung</small></button></div></div>" +
      bahnHTML();
  }
  function bahnHTML() {
    var b = json("bahnplan.v1"), n = b && b.tracks ? b.tracks.length : 0, cur = n && (b.tracks.find(function (t) { return t.id === b.cur; }) || b.tracks[0]);
    return "<div class='card' id='tsBahnCard' data-sec='tsbahn'><div class='card-h'><h2>Bahnplan</h2><span>Kurvenbuch</span></div>" +
      "<p class='muted' style='margin-bottom:12px'>" + (n ? "Deine Bahnen: " + n + (cur ? " · zuletzt <b>" + esc(cur.name) + "</b>" : "") + ". Tippe im Plan auf eine Kurvennummer, um Linie, Körper und Ansage zu sehen."
        : "Bahnen aus aller Welt mit dem Original-Streckenplan von Wikipedia. Für jede Kurve hältst du Form, Linie, Steuern, Blick und Fehlerbilder fest – und druckst alles als Bahnplan aus.") + "</p>" +
      "<div class='ts-grid'><button class='btn accent' data-tsopen='bahnplan" + (n ? "/plan" : "") + "'>" + (n ? "Plan öffnen" : "Bahn wählen") + "<small>" + (n ? "Kurven mit Nummern" : "16 Bahnen, Plan von Wikipedia") + "</small></button>" +
      "<button class='btn' data-tsopen='bahnplan/buch'>Buch<small>alle Kurven zum Lesen und Drucken</small></button></div></div>";
  }
  function mobText(m) {
    return "Täglich rotierend Block A Rücken, B Hüfte, C Beine – heute <b>Block " + m.block[0] + "</b>" + (m.done ? " (✓ erledigt)" : "") + ". Vor dem Wettkampf nur bewegtes Dehnen, lange Dehnungen danach." +
      (m.lastTest ? " Letzter Vorbeuge-Test: " + m.lastTest.cm + " cm." : "");
  }
  function sourcesHTML() {
    return "<div class='card-h'><h2>Wissenschaftliche Grundlagen</h2><span>Quellen</span></div><div class='ts-src'>" +
      "<h3>Training</h3><p>Kalorien: MET-Werte nach Ainsworth et al. 2011 (Compendium of Physical Activities), Grundumsatz nach Mifflin et al. 1990.</p>" +
      "<p>Anstrengung: Session-RPE nach Foster et al. 2001. Muskelaufbau: Dosis-Wirkung des Trainingsvolumens, Schoenfeld, Ogborn & Krieger 2017.</p>" +
      "<p>Abnehmen: Bewegung allein bewirkt meist nur wenig Gewichtsverlust, Swift et al. 2014. Bewegungsempfehlung: 150–300 Min. moderat pro Woche plus 2× Kraft, WHO 2020 (Bull et al.).</p>" +
      "<p>Belastung 7/28 Tage ist nur eine Orientierung, keine Verletzungsvorhersage, Impellizzeri et al. 2020.</p>" +
      "<h3>Mobility</h3><p>Vor dem Start nur bewegtes Dehnen; lange statische Dehnung (über 60 s) kann die Schnellkraft kurz senken, Behm et al. 2016; Opplert & Babault 2018.</p>" +
      "<p>Beweglichkeit wächst mit der Gesamtdehnzeit pro Woche und Muskel, Thomas et al. 2018.</p>" +
      "<h3>Atmung & HRV</h3><p>HRV-Biofeedback und langsames Atmen: Meta-Analysen Goessl et al. 2017, Lehrer et al. 2020. Zyklisches Seufzen: Balban et al. 2023.</p>" +
      "<p>HRV-gesteuertes Training mit ln(RMSSD): Kiviniemi et al. 2007, Plews et al. 2013.</p></div>";
  }
  /* Fertige Mobility-Einheiten zählen als Aktivität „Dehnen“ (MET aus dem Compendium) –
     so erscheinen sie in Kalender, Analyse und Kalorien. Atemübungen bewusst nicht: sie sind keine Bewegung. */
  function importMobility() {
    var r = json("rodelmobility.v1"); if (!r || !r.sessions || !A.S || !A.S.activities) return;
    var have = {}, added = 0;
    A.S.activities.forEach(function (a) { if (a && a.extId) have[a.extId] = 1; });
    r.sessions.forEach(function (x, i) {
      var id = "mob-" + x.date + "-" + i;
      if (have[id] || !x.date || !(x.sec > 30)) return;
      var name = x.type === "daily" ? "Mobility · Block " + (x.block || "") : x.type === "comp" ? "Mobility · Wettkampfprogramm" : "Mobility";
      A.S.activities.push({ extId: id, date: x.date, name: name, type: "Dehnen", sportId: "dehnen", rawType: "dehnen", durationSec: Math.round(x.sec), source: "mobility" });
      added++;
    });
    if (added) { try { A.saveAct(); A.renderAll(); } catch (e) {} }
  }
  // Eine Cloud-Sicherung für alles: die eigene GitHub-Synchronisierung wandert in „Erweitert“
  function syncPanel() {
    var pnl = document.querySelector(".catpanel[data-cat='sync']");
    if (!pnl || pnl.dataset.ts) return;
    pnl.dataset.ts = "1";
    var w = json("wk_sync") || {}, used = !!(w.owner && w.repo);
    var det = document.createElement("details"); det.className = "ts-adv"; det.open = used;
    det.innerHTML = "<summary>Erweitert: eigene GitHub-Synchronisierung" + (used ? " (eingerichtet)" : "") + "</summary>";
    while (pnl.firstChild) det.appendChild(pnl.firstChild);
    var info = document.createElement("div"); info.className = "ts-info";
    info.innerHTML = "<b>Cloud-Sicherung für alle Apps</b><br>Training, Mobility, Atmung und Planer werden zusammen gesichert und auf all deinen Geräten abgeglichen – mit früheren Ständen zum Zurückholen." +
      "<div style='margin-top:10px'><button class='btn accent block' type='button' id='tsOpenSync'>Cloud-Sicherung öffnen</button></div>";
    pnl.appendChild(info); pnl.appendChild(det);
    info.querySelector("#tsOpenSync").addEventListener("click", function () { if (window.SharedCalendar) window.SharedCalendar.open(null, "sync"); });
    // Installieren: eigener Knopf, solange Training noch im Browser läuft
    var ins = document.createElement("div"); ins.className = "ts-info"; ins.id = "tsInstall";
    ins.innerHTML = "<b>Training als App</b><br>Eigenes Symbol auf dem Startbildschirm, startet schneller und läuft offline – inklusive Mobility und Atmung." +
      "<div style='margin-top:10px'><button class='btn accent block' type='button'>App installieren</button></div>";
    pnl.insertBefore(ins, info);
    ins.querySelector("button").addEventListener("click", function () { if (window.SGInstall) window.SGInstall.prompt(); });
    var upd = function () { ins.style.display = window.SGInstall && window.SGInstall.installed() ? "none" : ""; };
    upd(); window.addEventListener("sg-install", upd);
  }
  function ensure(id, html, where) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div"); el.className = "card"; el.id = id;
      // eigener Name für Reihenfolge, Ein-/Ausblenden und Zuklappen (Seitenbereiche der Training-App)
      el.setAttribute("data-sec", { tsHeute: "tsheute", tsSources: "tssources", tsWeekAll: "tsweekall" }[id] || id);
      where(el); if (!el.parentNode) return;
    }
    if (el.dataset.html !== html) { el.innerHTML = html; el.dataset.html = html; }
  }
  function render() {
    ensure("tsHeute", heuteHTML(), function (el) {
      var r = document.getElementById("readinessCard"), s = document.getElementById("s-heute");
      if (r && r.parentNode) r.parentNode.insertBefore(el, r.nextSibling); else if (s) s.appendChild(el);
    });
    if (!document.getElementById("tsMobCard")) {
      var anchor = document.querySelector("#s-lauf [data-sec='stretch']");
      if (anchor) { var tmp = document.createElement("div"); tmp.innerHTML = trainingHTML(); while (tmp.firstChild) anchor.parentNode.insertBefore(tmp.firstChild, anchor); }
    } else {
      var p = document.getElementById("tsMobText"); var m = mobilityInfo();
      if (p) { var nt = mobText(m); if (p.innerHTML !== nt) p.innerHTML = nt; }
    }
    // Die bisherigen Einzelkarten (Dehnprogramm, Rodeln-Vorbereitung) stecken jetzt in „Mobility & Dehnen“
    ["stretch", "rodeln"].forEach(function (k) { var c = document.querySelector("#s-lauf [data-sec='" + k + "']"); if (c) c.classList.add("ts-merged"); });
    syncPanel();
    importMobility();
    var rc = document.getElementById("readinessCard"), hv = window.SG_HRV(today());
    if (rc) {
      var note = document.getElementById("tsHrvNote");
      var txt = hv && hv.adj ? "Morgen-HRV " + hv.rmssd + " ms – " + hv.text + " (Bereitschaft " + (hv.adj > 0 ? "+" : "") + hv.adj + ")." : "";
      if (txt && !note) { note = document.createElement("p"); note.id = "tsHrvNote"; note.className = "tiny"; note.style.marginTop = "8px"; rc.appendChild(note); }
      if (note) { note.textContent = txt; note.hidden = !txt; }
    }
    ensure("tsSources", sourcesHTML(), function (el) { var f = document.getElementById("s-fitness"); if (f) f.appendChild(el); });
    var wk = weekAllHTML();
    if (wk) ensure("tsWeekAll", wk, function (el) { var g = document.querySelector("#s-kalender [data-sec='calgrid']"); if (g) g.parentNode.insertBefore(el, g.nextSibling); });
    if (document.querySelector("#s-kalender.active")) decoGrid();
    if (window.APP5 && window.APP5.layout) window.APP5.layout();
  }
  // Die App zeichnet ihre Seiten neu – eigene Karten bei Bedarf wieder einsetzen
  new MutationObserver(function () { if (!document.getElementById("tsHeute") || !document.getElementById("tsMobCard") || (SC() && !document.getElementById("tsWeekAll"))) render(); })
    .observe(document.body, { childList: true, subtree: true });
  addEventListener("storage", function (e) { if (e.key === "pulsplan.v1" || e.key === "rodelmobility.v1") { render(); try { A.renderAll(); } catch (x) {} } else if (e.key === "sg-shared-calendar-v1" || e.key === "schulkalender-bayern-v1") render(); });
  setTimeout(function () { if (SC()) { SC().onChange(function () { render(); }); render(); } }, 0);
  // Ruft das Modul „Erledigt“ oder schließt es, gleich alles auffrischen
  addEventListener("message", function (e) { if (e.origin === location.origin && e.data && e.data.sg === "changed") render(); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) render(); });
  setInterval(render, 60000);
  // Version: gilt für die ganze App – „Version aktualisieren“ lädt die neueste Fassung vom Server (ohne Cloud-Einrichtung)
  function showVersion() { var v = document.getElementById("setVersion"); if (v && window.SGVersion && v.textContent !== window.SGVersion) v.textContent = window.SGVersion; }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#btnCheckUpdate"); if (!b || !window.SGUpdate) return;
    e.stopImmediatePropagation(); e.preventDefault();
    var st = document.getElementById("checkUpdateStatus");
    b.disabled = true;
    window.SGUpdate.check(function (t) { if (st) st.textContent = t; }).then(function (r) { if (r !== "neu") b.disabled = false; });
  }, true);
  showVersion();
  render();
  try { A.renderAll(); } catch (e) {} // Bereitschaft jetzt mit HRV neu berechnen
  fromHash();
  // Schneller öffnen: Mobility und Atmung im Leerlauf schon im Hintergrund laden
  var inShell = false; try { inShell = window.top !== window && !!window.top.SGShell; } catch (e) {}
  if (!inShell) (window.requestIdleCallback || function (f) { return setTimeout(f, 2500); })(function () {
    // erst nach dem Start vorladen, nacheinander – so bleibt die App beim Öffnen flüssig
    var ids = Object.keys(MODS);
    (function next(i) {
      if (i >= ids.length) return;
      setTimeout(function () {
        if (document.hidden) return next(i);
        var id = ids[i];
        if (!frames[id]) { var f = document.createElement("iframe"); f.src = MODS[id].src; f.title = MODS[id].title; f.hidden = true; frames[id] = f; wrap.appendChild(f); }
        next(i + 1);
      }, i ? 3000 : 5000);
    })(0);
  }, { timeout: 5000 });
})();
