/* Planer – Hülle für die ganze App.
 * Fünf Ziele: Kalender (Start) · Training · Mobility · Schule · Mehr. Der Kalender zeigt alles aus allen Bereichen und
 * führt mit einem Tipp dorthin. Die Bereiche sind die bisherigen Seiten (eingebettet, ohne eigene Leisten); sie bleiben
 * geladen und wechseln sofort. Unterpunkte als Chips, Unter-Unterpunkte als zweite Reihe.
 * Adressen: #kalender, #training/rodeln/plan, #mobility/atmung, #schule/plan, #mehr, #bibel/lesen, #notizen, #u=<alte Adresse>. */
(function () {
  "use strict";
  var BASE = "/" + (location.pathname.split("/")[1] || "") + "/";
  var KEY = "sg-app-v1";
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("stage"), chipsEl = $("chips"), titleEl = $("title"), actsEl = $("acts"), navEl = $("nav"), backEl = $("back"), fab = $("fab");

  /* ---------- Symbole ---------- */
  var P = {
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    run: '<circle cx="14.5" cy="4.5" r="2"/><path d="M8 21l3-6 3 2 1 4M10.5 15l1-5 4 2 3-1M8 10l3-2"/>',
    stretch: '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v6l-4 7M12 13l4 7M5 10l7-1 7 1"/>',
    school: '<path d="M2.5 9l9.5-5 9.5 5-9.5 5z"/><path d="M6.5 11.2v4.8c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.8"/>',
    more: '<rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', plus: '<path d="M12 5v14M5 12h14"/>', back: '<path d="M20 12H5M11 5l-7 7 7 7"/>',
    chev: '<path d="M9 5l7 7-7 7"/>', check: '<path d="M4 6.5l1.8 1.8L9 5M4 12.5l1.8 1.8L9 11M4 18.5l1.8 1.8L9 17M12.5 7h7.5M12.5 13h7.5M12.5 19h7.5"/>',
    note: '<path d="M5 3.5h10l4 4v13H5z"/><path d="M15 3.5v4h4M8.5 12h7M8.5 16h5"/>', book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>', coffee: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M11 3v3"/>',
    wand: '<path d="M4 20L16 8M14 6l4 4M18 3v3M21 6h-3M7 4v2M8 5H6"/>', ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5l1.6 2.6 3-.6.6 3 2.6 1.6-1.4 2.9 1.4 2.9-2.6 1.6-.6 3-3-.6L12 21.5l-1.6-2.6-3 .6-.6-3-2.6-1.6L5.6 12 4.2 9.1l2.6-1.6.6-3 3 .6z"/>',
    palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.8-1 1.2-2.1-.7-1.2.1-2.4 1.5-2.4H17a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9-8.5-9z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
    cloud: '<path d="M7 18.5h10.5a4 4 0 0 0 .4-8A6 6 0 0 0 6.3 9.6 4.5 4.5 0 0 0 7 18.5z"/>', download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    sled: '<path d="M3 17h15a3 3 0 0 0 3-3M6 17l-2 3M15 17l-2 3"/><circle cx="9" cy="8" r="2"/><path d="M7 13.5l3-3 4 1"/>', bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>', star: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>'
  };
  function ico(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[k] || "") + "</svg>"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function plus(k, n) { var d = parse(k); d.setDate(d.getDate() + n); return iso(d); }
  function today() { return iso(new Date()); }
  var WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], WDL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    MO = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  function C() { return window.SharedCalendar; }

  /* ---------- Ziele und Unterpunkte ----------
   * p = Seite (Pfad unter /planer/), h = Sprungadresse der Seite, s = Unterbereich in deren (ausgeblendeter) Leiste,
   * sel = Knopf, der den Unterbereich wählt (X = s), kids = zweite Chip-Reihe */
  var MODNAV = "nav [data-tab='X'],nav [data-go='X'],nav [data-v='X']";
  var V = {
    kalender: { t: "Kalender", tab: "kalender", native: "kalender" },
    training: { t: "Training", tab: "training", secs: [
      { id: "heute", t: "Heute", p: "training/", h: "heute" },
      { id: "lauf", t: "Laufen & Kraft", p: "training/", h: "lauf" },
      { id: "rodeln", t: "Rodeln", p: "training/bahnplan/", sel: MODNAV, kids: [{ id: "plan", t: "Kurvenbuch", s: "plan" }, { id: "bahnen", t: "Bahnen", s: "bahnen" }, { id: "laeufe", t: "Läufe & Zeiten", s: "laeufe" }, { id: "buch", t: "Drucken", s: "buch" }] },
      { id: "auswertung", t: "Auswertung", p: "training/", kids: [{ id: "fitness", t: "Fitness", h: "fitness" }, { id: "analyse", t: "Analyse", h: "daten" }] },
      { id: "wissen", t: "Sportwissenschaft", p: "wissen/", kids: [{ id: "lesen", t: "Lesen", h: "lesen" }, { id: "karten", t: "Karteikarten", h: "karten" }, { id: "quiz", t: "Quiz", h: "quiz" }, { id: "suche", t: "Suche", h: "suche" }] }
    ] },
    mobility: { t: "Mobility", tab: "mobility", secs: [
      { id: "mobility", t: "Mobility", p: "training/mobility/", sel: MODNAV, kids: [{ id: "heute", t: "Tagesblock", s: "heute" }, { id: "wettkampf", t: "Wettkampf", s: "wettkampf" }, { id: "uebungen", t: "Übungen", s: "uebungen" }, { id: "fortschritt", t: "Fortschritt", s: "fortschritt" }] },
      { id: "atmung", t: "Atmung & HRV", p: "training/atmung/", sel: MODNAV, kids: [{ id: "heute", t: "Heute", s: "today" }, { id: "hrv", t: "Üben & HRV messen", s: "train" }, { id: "woche", t: "Woche", s: "week" }, { id: "verlauf", t: "Verlauf", s: "log" }, { id: "plan", t: "12-Wochen-Plan", s: "plan" }] }
    ] },
    schule: { t: "Schule", tab: "schule", secs: [
      { id: "heute", t: "Schultag", p: "schule/", sel: ".tab[data-v='X']", s: "heute" },
      { id: "plan", t: "Stundenplan", p: "schule/", sel: ".tab[data-v='X']", s: "plan" },
      { id: "aufgaben", t: "Aufgaben & Prüfungen", p: "schule/", sel: ".tab[data-v='X']", s: "aufgaben" },
      { id: "lernplan", t: "Lernplan", p: "schule/", sel: ".tab[data-v='X']", s: "lehrgang" },
      { id: "ferien", t: "Schuljahr & Ferien", p: "schule/", sel: ".tab[data-v='X']", s: "kalender" }
    ] },
    mehr: { t: "Mehr", tab: "mehr", native: "mehr" },
    // über „Mehr“ erreichbar (Zurück führt dorthin)
    aufgaben: { t: "Aufgaben", tab: "mehr", up: "mehr", secs: [{ id: "alle", t: "Aufgaben", p: "", h: "tasks" }] },
    notizen: { t: "Notizen", tab: "mehr", up: "mehr", native: "notizen" },
    bibel: { t: "Bibel", tab: "mehr", up: "mehr", secs: [
      { id: "heute", t: "Heute", p: "bibel/", h: "heute" }, { id: "lesen", t: "Weiterlesen", p: "bibel/", h: "lesen" },
      { id: "bibliothek", t: "Bibliothek", p: "bibel/", h: "bibliothek" }, { id: "meine", t: "Meine Bibel", p: "bibel/", h: "meinebibel" }, { id: "einst", t: "Einstellungen", p: "bibel/", h: "mehr" }] },
    pause: { t: "Pause", tab: "mehr", up: "mehr", secs: [
      { id: "ablenken", t: "Ablenken", p: "pause/", sel: "#nav .tab[data-t='X']", s: "ablenken" }, { id: "wissen", t: "Wissen", p: "pause/", sel: "#nav .tab[data-t='X']", s: "wissen" },
      { id: "quiz", t: "Quiz", p: "pause/", sel: "#nav .tab[data-t='X']", s: "quiz" }, { id: "verlauf", t: "Verlauf", p: "pause/", sel: "#nav .tab[data-t='X']", s: "kalender" },
      { id: "einst", t: "Einstellungen", p: "pause/", sel: "#nav .tab[data-t='X']", s: "einst" }] },
    tset: { t: "Training einstellen", tab: "mehr", up: "mehr", secs: [{ id: "einst", t: "Einstellungen", p: "training/", h: "einst" }] }
  };
  var TABS = [["kalender", "Kalender", "cal"], ["training", "Training", "run"], ["mobility", "Mobility", "stretch"], ["schule", "Schule", "school"], ["mehr", "Mehr", "more"]];

  /* ---------- gemerkte Auswahl ---------- */
  var M = {}; try { M = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
  M.sec = M.sec || {}; M.kid = M.kid || {};
  function saveM() { try { localStorage.setItem(KEY, JSON.stringify(M)); } catch (e) {} }

  /* ---------- eingebettete Seiten ---------- */
  var frames = {}, cur = { v: "kalender" };
  function frame(p, hash) {
    var f = frames[p];
    if (!f) {
      f = document.createElement("iframe");
      f.title = p || "Planer"; f.dataset.p = p;
      f.src = BASE + p + (hash ? "#" + hash : "");
      f.addEventListener("load", function () { f.dataset.ready = "1"; if (f.classList.contains("on")) $("load").classList.remove("on"); });
      stage.insertBefore(f, $("load"));
      frames[p] = f;
    }
    return f;
  }
  // Unterbereich in der Seite wählen: Sprungadresse setzen oder Knopf ihrer Leiste drücken (sobald geladen)
  function apply(f, spec, fresh) {
    if (spec.h && !fresh) { try { f.contentWindow.location.replace(BASE + f.dataset.p + "#" + spec.h); } catch (e) {} }
    if (spec.s && spec.sel) {
      var sel = spec.sel.replace(/X/g, spec.s), n = 0;
      (function tryIt() {
        var el = null; try { el = f.contentDocument && f.contentDocument.querySelector(sel); } catch (e) {}
        if (el) { el.click(); return; }
        if (++n < 60) setTimeout(tryIt, 120);
      })();
    }
  }
  function show(el) {
    Array.prototype.forEach.call(stage.querySelectorAll("iframe,.native"), function (x) { x.classList.toggle("on", x === el); });
  }

  /* ---------- Darstellung eines Ziels ---------- */
  function secOf(v, id) { return v.secs ? v.secs.find(function (s) { return s.id === id; }) || v.secs[0] : null; }
  function kidOf(s, id) { return s && s.kids ? s.kids.find(function (k) { return k.id === id; }) || s.kids[0] : null; }
  function render() {
    var v = V[cur.v] || V.kalender;
    titleEl.textContent = v.t;
    document.title = v.t + " · Planer";
    backEl.hidden = !v.up; backEl.innerHTML = ico("back");
    // Navigation
    Array.prototype.forEach.call(navEl.children, function (b) { b.classList.toggle("on", b.dataset.tab === v.tab); });
    // Kopf-Aktionen
    actsEl.innerHTML = '<button class="ib" data-act="search" aria-label="Suchen">' + ico("search") + "</button>";
    fab.classList.toggle("on", cur.v === "kalender" || cur.v === "notizen");
    fab.innerHTML = ico("plus");
    if (v.native) {
      chipsEl.innerHTML = ""; stage.classList.remove("lined");
      var n = $("n-" + v.native); show(n); $("load").classList.remove("on");
      if (v.native === "kalender") renderCal(); else if (v.native === "mehr") renderMehr(); else renderNotes();
      return;
    }
    var s = secOf(v, cur.s || M.sec[cur.v]), k = kidOf(s, cur.k || M.kid[cur.v + "/" + s.id]);
    cur.s = s.id; cur.k = k ? k.id : null;
    M.sec[cur.v] = s.id; if (k) M.kid[cur.v + "/" + s.id] = k.id; saveM();
    // Chips
    var h = "";
    if (v.secs.length > 1) h += '<div class="crow">' + v.secs.map(function (x) { return '<button class="chip' + (x.id === s.id ? " on" : "") + '" data-sec="' + x.id + '">' + esc(x.t) + "</button>"; }).join("") + "</div>";
    if (s.kids) h += '<div class="crow sub">' + s.kids.map(function (x) { return '<button class="chip' + (k && x.id === k.id ? " on" : "") + '" data-kid="' + x.id + '">' + esc(x.t) + "</button>"; }).join("") + "</div>";
    chipsEl.innerHTML = h; stage.classList.toggle("lined", !!h);
    // gewählten Chip sichtbar machen – nur die Chip-Reihe scrollen, nie die Seite
    Array.prototype.forEach.call(chipsEl.querySelectorAll(".chip.on"), function (c) { var r = c.parentNode; if (c.offsetLeft + c.offsetWidth > r.scrollLeft + r.clientWidth || c.offsetLeft < r.scrollLeft) r.scrollLeft = c.offsetLeft - 16; });
    // Seite zeigen und Unterbereich wählen
    var spec = { h: (k && k.h) || s.h, s: (k && k.s) || s.s, sel: s.sel };
    if (cur.sub) { if (s.sel) spec.s = cur.sub; else spec.h = cur.sub; cur.sub = null; }
    var fresh = !frames[s.p];
    var f = frame(s.p, spec.h);
    show(f);
    $("load").classList.toggle("on", !f.dataset.ready);
    apply(f, spec, fresh);
  }

  /* ---------- Navigation und Verlauf ----------
   * Adresse = Ziel/Unterpunkt/Unter-Unterpunkt. Wechsel zwischen den Zielen unten ersetzen den Eintrag; vom Kalender
   * aus und in Unterseiten von „Mehr“ entsteht ein Eintrag – die Zurück-Geste führt dann zurück. */
  function hashOf(v, s, k) { return "#" + v + (s ? "/" + s + (k ? "/" + k : "") : ""); }
  function go(v, s, k, opt) {
    opt = opt || {};
    if (!V[v]) v = "kalender";
    var push = opt.push != null ? opt.push : (cur.v === "kalender" && v !== "kalender") || (V[v].up === cur.v);
    var hsh = hashOf(v, s, k);
    cur = { v: v, s: s || null, k: k || null, sub: opt.sub || null };
    if (location.hash !== hsh) { if (push) history.pushState({ app: 1 }, "", hsh); else history.replaceState({ app: 1 }, "", hsh); }
    render();
  }
  function fromHash() {
    var h = decodeURIComponent(location.hash.slice(1));
    if (h.indexOf("u=") === 0) { history.replaceState({ app: 1 }, "", "#kalender"); cur = { v: "kalender" }; render(); return openUrl(h.slice(2)); }
    var p = h.split("/");
    cur = { v: V[p[0]] ? p[0] : "kalender", s: p[1] || null, k: p[2] || null };
    render();
  }
  addEventListener("popstate", function () { if (sheetOpen) { closeSheet(true); return; } fromHash(); });
  navEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]"); if (!b) return;
    var t = b.dataset.tab;
    if (t === "kalender" && cur.v !== "kalender" && history.state && history.state.app && history.length > 1 && pushedFromCal) { history.back(); return; }
    if (t === cur.v) { if (t === "kalender") { calSel = today(); renderCal(); $("n-kalender").scrollTop = 0; } return; }
    pushedFromCal = cur.v === "kalender";
    go(t, null, null, { push: cur.v === "kalender" });
  });
  var pushedFromCal = false;
  backEl.addEventListener("click", function () { var v = V[cur.v]; if (history.state && history.state.app && history.length > 1) history.back(); else go(v.up || "kalender"); });
  chipsEl.addEventListener("click", function (e) {
    var a = e.target.closest("[data-sec]"), b = e.target.closest("[data-kid]");
    if (a) go(cur.v, a.dataset.sec, null, { push: false });
    else if (b) go(cur.v, cur.s, b.dataset.kid, { push: false });
  });

  /* ---------- Sprünge aus den Bereichen (Links, Befehle, Module) ---------- */
  // alte und interne Adressen → Ziel der Hülle
  function openUrl(rel) {
    rel = String(rel || "").replace(/^\//, ""); if (rel.indexOf(BASE.slice(1)) === 0) rel = rel.slice(BASE.length - 1);
    var p = rel.split("#")[0].replace(/index\.html$/, ""), h = decodeURIComponent(rel.split("#")[1] || ""), h0 = h.split("/")[0], h1 = h.split("/")[1] || "";
    if (p === "" || p === "planer/") {
      if (h0 === "tasks") return go("aufgaben", null, null, { push: true });
      if (h0 === "schule") return go("schule");
      if (h0 === "pause") return go("pause", null, null, { push: true });
      if (h0 === "wochenplanung") { go("kalender"); return C() && C().weekPlan(); }
      if (h0 === "befehle") return C() && C().palette();
      if (h === "sg=x_notiz") return go("notizen", null, null, { push: true });
      return go("kalender");
    }
    if (p === "training/") {
      if (h0 === "mobility" || h0 === "atmung" || h0 === "bahnplan") return openModule(h0, h1);
      if (h0 === "lauf") return go("training", "lauf");
      if (h0 === "fitness") return go("training", "auswertung", "fitness");
      if (h0 === "daten") return go("training", "auswertung", "analyse");
      if (h0 === "einst") return go("tset", null, null, { push: true });
      if (h0 === "kalender") return go("kalender");
      return go("training", "heute");
    }
    if (p === "training/mobility/") return openModule("mobility", h0);
    if (p === "training/atmung/") return openModule("atmung", h0);
    if (p === "training/bahnplan/") return openModule("bahnplan", h0);
    if (p === "bibel/") return go("bibel", { lesen: "lesen", bibliothek: "bibliothek", meinebibel: "meine", mehr: "einst" }[h0] || "heute", null, { push: true });
    if (p === "schule/") return go("schule");
    if (p === "pause/") return go("pause", null, null, { push: true });
    if (p === "wissen/") return go("training", "wissen", ["lesen", "karten", "quiz", "suche"].indexOf(h0) > -1 ? h0 : "lesen", { sub: /^lesen\//.test(h) ? h : null });
    if (p === "app/") { location.hash = "#" + h; return; }
    go("kalender");
  }
  function openModule(id, sub) {
    if (id === "mobility") return go("mobility", "mobility", { wettkampf: "wettkampf", uebungen: "uebungen", fortschritt: "fortschritt" }[sub] || "heute");
    if (id === "atmung") return go("mobility", "atmung", { train: "hrv", week: "woche", log: "verlauf", plan: "plan" }[sub] || "heute");
    if (id === "bahnplan") return go("training", "rodeln", { bahnen: "bahnen", laeufe: "laeufe", buch: "buch" }[sub] || "plan");
  }
  function openApp(appId, hash) {
    hash = String(hash || "").replace(/^#/, "");
    if (appId === "training") return openUrl("training/#" + hash);
    if (appId === "bibel") return openUrl("bibel/#" + hash);
    return openUrl("#" + hash);
  }
  window.SGShell = { openUrl: openUrl, openApp: openApp, openModule: openModule, go: go };

  /* ---------- Kalender (Start) ---------- */
  var calSel = today(), calMode = "woche";
  var AREA = {
    training: { c: "var(--c-training)", ic: "run", label: "Training", act: "Starten", to: function () { go("training", "heute"); } },
    mobility: { c: "var(--c-mobility)", ic: "stretch", label: "Mobility", act: "Starten", to: function () { go("mobility", "mobility", "heute"); } },
    atmung: { c: "var(--c-atmung)", ic: "wind", label: "Atmung", act: "Üben", to: function () { go("mobility", "atmung", "hrv"); } },
    schule: { c: "var(--c-schule)", ic: "school", label: "Schule", act: "Öffnen", to: function (e) { go("schule", e && e.exam ? "aufgaben" : "heute"); } },
    notiz: { c: "var(--c-notiz)", ic: "note", label: "Notiz", act: "", to: function (e) { noteSheet(e.noteId); } },
    termin: { c: "var(--c-termin)", ic: "cal", label: "Termin", act: "", to: null }
  };
  function area(e) {
    var a = e.app || "";
    if (a === "Notiz") return "notiz";
    if (/Lernplan|Schule/.test(a)) return "schule";
    if (/Atmung|Pulsplan/.test(a)) return "atmung";
    if (/Mobility/.test(a)) return "mobility";
    if (/Training|Trainingsblog|Rodeln/.test(a)) return "training";
    return "termin";
  }
  var ITEMS = {};
  function items(from, to) {
    var c = C(), out = [];
    if (c && c.allItems) out = c.allItems(from, to);
    return out;
  }
  function tasksFor(k) {
    var c = C(); if (!c || !c.tasks) return [];
    var t = today();
    return c.tasks.list().filter(function (q) { return q.due && (q.due === k || (k === t && !q.done && q.due < t)); });
  }
  function dayDots(list, k) {
    var seen = {}, out = [];
    list.forEach(function (e) { if (e.date !== k) return; var a = area(e); if (!seen[a]) { seen[a] = 1; out.push(AREA[a].c); } });
    return out.slice(0, 3).map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("");
  }
  function monday(k) { var d = parse(k); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return iso(d); }
  function renderCal() {
    var box = $("n-kalender").firstElementChild, c = C(), t = today(), sel = calSel, sd = parse(sel);
    var from, to, cells = [];
    if (calMode === "monat") {
      var first = new Date(sd.getFullYear(), sd.getMonth(), 1); from = monday(iso(first)); to = plus(from, 41);
    } else { from = monday(sel); to = plus(from, 6); }
    var range = items(from, plus(to, 7)); ITEMS = {};
    range.forEach(function (e, i) { ITEMS["i" + i] = e; e._k = "i" + i; });
    for (var k = from; k <= to; k = plus(k, 1)) cells.push(k);
    var h = '<div class="calhd"><b>' + MO[sd.getMonth()] + " " + sd.getFullYear() + "</b>" + (sel !== t ? '<button class="lnk" data-c="today">Heute</button>' : "") +
      '<div class="seg"><button data-c="woche" class="' + (calMode === "woche" ? "on" : "") + '">Woche</button><button data-c="monat" class="' + (calMode === "monat" ? "on" : "") + '">Monat</button></div></div>';
    h += '<div class="' + (calMode === "monat" ? "month" : "week") + '" id="grid">' + (calMode === "monat" ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(function (w) { return '<div class="wd" style="padding:0"><small>' + w + "</small></div>"; }).join("") : "") +
      cells.map(function (k) {
        var d = parse(k), dots = dayDots(range, k) + (tasksFor(k).filter(function (q) { return !q.done; }).length ? '<i style="background:var(--c-aufgabe)"></i>' : "");
        return '<button class="wd' + (k === t ? " t" : "") + (k === sel ? " s" : "") + (calMode === "monat" && d.getMonth() !== sd.getMonth() ? " o" : "") + '" data-day="' + k + '">' +
          (calMode === "woche" ? "<small>" + WD[d.getDay()] + "</small>" : "") + '<span class="n">' + d.getDate() + '</span><span class="dots">' + dots + "</span></button>";
      }).join("") + "</div>";
    if (sel === t) h += glance();
    // Tagesplan
    var day = range.filter(function (e) { return e.date === sel; }), tasks = tasksFor(sel);
    h += '<div class="grp"><header><span>' + (sel === t ? "Heute · " : sel === plus(t, 1) ? "Morgen · " : "") + WDL[sd.getDay()] + ", " + sd.getDate() + ". " + MO[sd.getMonth()] + "</span>" +
      '<button class="lnk" data-c="new">+ Eintrag</button></header>';
    if (!day.length && !tasks.length) h += '<div class="cells"><div class="empty">Nichts geplant.<div class="btns" style="margin-top:12px"><button class="btn" data-c="week">Woche planen</button>' +
      (c && c.weekPlanConfig && c.weekPlanConfig().std ? '<button class="btn p" data-c="std">Standardwoche übernehmen</button>' : "") + "</div></div></div>";
    else h += '<div class="cells">' + day.map(function (e) { return evRow(e, sel === t); }).join("") + tasks.map(taskRow).join("") + "</div>";
    h += "</div>";
    // nächste Tage
    var nx = [];
    for (var i = 1; i <= 6; i++) { var kk = plus(sel, i), l = range.filter(function (e) { return e.date === kk; }); nx.push([kk, l]); }
    h += '<div class="grp next"><header><span>Danach</span></header><div class="cells">' + nx.map(function (x) {
      var d = parse(x[0]);
      return '<button class="nd" data-day="' + x[0] + '"><span class="d">' + WD[d.getDay()] + "<small>" + d.getDate() + "." + (d.getMonth() + 1) + '.</small></span><span class="l">' +
        (x[1].length ? x[1].slice(0, 3).map(function (e) { return '<span style="--c:' + AREA[area(e)].c + '"><i></i>' + (e.time ? e.time + " " : "") + esc(e.title) + "</span>"; }).join("") + (x[1].length > 3 ? "<em>+ " + (x[1].length - 3) + " weitere</em>" : "") : "<em>frei</em>") + "</span></button>";
    }).join("") + "</div></div>";
    box.innerHTML = h;
    swipeGrid($("grid"));
  }
  function evRow(e, isToday) {
    var a = area(e), A = AREA[a], tm = e.time ? e.time + (e.end ? "<small>" + e.end + "</small>" : "") : "<small>ganzt.</small>";
    var sub = A.label + (e.note && a !== "notiz" ? " · " + e.note.split("\n")[0].slice(0, 50) : "");
    return '<button class="ev" data-ev="' + e._k + '" style="--c:' + A.c + '"><span class="tm">' + tm + '</span><span class="bar"></span><span class="tx"><b>' + esc(e.title) + "</b><small>" + esc(sub) + "</small></span>" +
      (A.act && isToday ? '<span class="go" data-start="' + e._k + '">' + A.act + "</span>" : "") + "</button>";
  }
  function taskRow(q) {
    var late = q.due < today() && !q.done;
    return '<div class="ev' + (q.done ? " done" : "") + '" style="--c:var(--c-aufgabe)" data-task="' + q.id + '"><span class="tm"><button class="ck' + (q.done ? " on" : "") + '" data-ck="' + q.id + '" aria-label="Erledigt">' + ico("ok") + "</button></span>" +
      '<span class="bar"></span><span class="tx"><b>' + esc(q.title) + "</b><small>Aufgabe" + (late ? " · überfällig" : "") + "</small></span></div>";
  }
  // „Auf einen Blick“ (nur heute): was jetzt wichtig ist, ein Tipp führt hin
  function glance() {
    var c = C(), out = [];
    try {
      var open = c.tasks.list().filter(function (q) { return !q.done && q.due && q.due <= today(); }).length;
      if (open) out.push(["aufgabe", "check", open + (open === 1 ? " Aufgabe" : " Aufgaben"), "fällig", "aufgaben"]);
      var notes = c.notes ? c.notes.list().filter(function (n) { return !n.done; }).length : 0;
      out.push(["notiz", "note", notes ? notes + " offen" : "Notiz", notes ? "Notizen" : "schnell festhalten", "notizen"]);
      var wp = c.weekPlanConfig && c.weekPlanConfig(), mon = monday(today());
      if (wp && wp.on && !wp.planned[mon] && !wp.planned[plus(mon, 7)]) out.push(["training", "wand", "Woche planen", wp.std ? "Standard mit 1 Tipp" : "in 2 Minuten", "week"]);
    } catch (e) {}
    var b = null; try { b = JSON.parse(localStorage.getItem("zweiminutenbibel_v2") || "null"); } catch (e) {}
    out.push(["bibel", "book", b && b.todayDone === today() ? "Gelesen ✓" : "Bibel", b && b.streak ? "Serie " + b.streak : "heute lesen", "bibel"]);
    var w = null; try { w = JSON.parse(localStorage.getItem("sg-wissen-v1") || "null"); } catch (e) {}
    if (w && w.sum && w.sum.due) out.push(["training", "book", w.sum.due + " Karten", "Sportwissenschaft", "karten"]);
    return '<div class="glance">' + out.map(function (x) {
      return '<button class="gl" data-gl="' + x[4] + '" style="--c:var(--c-' + x[0] + ')"><i>' + ico(x[1]) + "</i><b>" + esc(x[2]) + "</b><small>" + esc(x[3]) + "</small></button>";
    }).join("") + "</div>";
  }
  function swipeGrid(el) {
    var x0 = 0, y0 = 0;
    el.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) < 60 || Math.abs(dy) > 50) return;
      if (calMode === "monat") { var d = parse(calSel); d.setMonth(d.getMonth() + (dx < 0 ? 1 : -1), 1); calSel = iso(d); }
      else calSel = plus(calSel, dx < 0 ? 7 : -7);
      renderCal();
    }, { passive: true });
  }
  $("n-kalender").addEventListener("click", function (e) {
    var ck = e.target.closest("[data-ck]");
    if (ck) { var c = C(), q = c.tasks.list().find(function (x) { return x.id === ck.dataset.ck; }); if (q) { c.tasks.update(q.id, { done: !q.done }); snack(q.done ? "Wieder offen" : "Erledigt", function () { c.tasks.update(q.id, { done: q.done }); renderCal(); }); renderCal(); } return; }
    var st = e.target.closest("[data-start]"); if (st) { var it = ITEMS[st.dataset.start]; AREA[area(it)].to(it); return; }
    var ev = e.target.closest("[data-ev]"); if (ev) return evSheet(ITEMS[ev.dataset.ev]);
    var tk = e.target.closest("[data-task]"); if (tk) return go("aufgaben", null, null, { push: true });
    var d = e.target.closest("[data-day]"); if (d) { calSel = d.dataset.day; if (calMode === "monat" && e.target.closest(".month")) calMode = "woche"; renderCal(); return; }
    var gl = e.target.closest("[data-gl]");
    if (gl) { var g = gl.dataset.gl; if (g === "week") return C().weekPlan(); if (g === "bibel") return go("bibel", "lesen", null, { push: true }); if (g === "karten") return go("training", "wissen", "karten"); return go(g, null, null, { push: true }); }
    var b = e.target.closest("[data-c]"); if (!b) return;
    var a = b.dataset.c;
    if (a === "today") { calSel = today(); renderCal(); }
    else if (a === "woche" || a === "monat") { calMode = a; renderCal(); }
    else if (a === "new") addSheet();
    else if (a === "week") C().weekPlan();
    else if (a === "std") C().weekPlanStd();
  });
  // Eintrag antippen: Details und was man damit tun kann
  function evSheet(e) {
    var a = area(e), A = AREA[a], own = !/^(lp|lc|pp|tb|ta|nt)-/.test(e.id || ""), d = parse(e.date);
    if (a === "notiz") return noteSheet(e.noteId);
    var h = '<h3>' + esc(e.title) + '</h3><p class="s">' + WDL[d.getDay()] + ", " + d.getDate() + ". " + MO[d.getMonth()] + (e.time ? " · " + e.time + (e.end ? "–" + e.end : "") + " Uhr" : " · ganztägig") + " · " + esc(e.ro || A.label) + "</p>";
    if (e.note) h += '<p class="s" style="color:var(--ink);white-space:pre-wrap">' + esc(e.note) + "</p>";
    if (A.to) h += sRow("open", A.ic, a === "schule" ? "In Schule öffnen" : a === "atmung" ? "Atemübung öffnen" : a === "mobility" ? "Mobility starten" : "Training öffnen", "", A.c);
    if (own) h += sRow("edit", "edit", "Bearbeiten", "Zeit, Wiederholung, Erinnerung", "var(--muted)");
    if (!A.to && !own) h += sRow("day", "cal", "Im Kalender öffnen", "", "var(--muted)");
    sheet(h, function (act) {
      closeSheet();
      if (act === "open") A.to(e);
      else if (act === "edit") C().editEvent(e.id, e.date);
      else if (act === "day") C().open(e.date);
    });
  }
  function sRow(act, ic, t, s, c) { return '<button class="row" data-s="' + act + '" style="--c:' + (c || "var(--acc)") + '"><span class="ic">' + ico(ic) + '</span><span class="tx"><b>' + esc(t) + "</b>" + (s ? "<small>" + esc(s) + "</small>" : "") + "</span></button>"; }
  // „+“: neuer Eintrag für den gewählten Tag
  function addSheet() {
    var d = parse(calSel), c = C(), std = c && c.weekPlanConfig && c.weekPlanConfig().std;
    sheet('<h3>Neu</h3><p class="s">für ' + WDL[d.getDay()] + ", " + d.getDate() + ". " + MO[d.getMonth()] + "</p>" +
      sRow("termin", "cal", "Termin", "Mit Uhrzeit, Wiederholung, Erinnerung", "var(--c-termin)") +
      sRow("aufgabe", "check", "Aufgabe", "Fällig an diesem Tag", "var(--c-aufgabe)") +
      sRow("notiz", "note", "Notiz", "Idee festhalten, optional mit Erinnerung", "var(--c-notiz)") +
      sRow("woche", "wand", "Trainingswoche planen", "Training, Laufen, Mobility, Atmung, Lernen", "var(--c-training)") +
      (std ? sRow("std", "ok", "Standardwoche übernehmen", "Mit einem Tipp", "var(--c-training)") : ""), function (act) {
      if (act === "termin") { closeSheet(); C().newEvent(calSel); }
      else if (act === "aufgabe") taskSheet();
      else if (act === "notiz") noteSheet(null, calSel);
      else if (act === "woche") { closeSheet(); C().weekPlan(); }
      else if (act === "std") { closeSheet(); C().weekPlanStd(); }
    });
  }
  function taskSheet() {
    sheet('<h3>Neue Aufgabe</h3><label class="f"><span>Was ist zu tun?</span><input type="text" id="tq" autocomplete="off" enterkeyhint="done"></label>' +
      '<label class="f"><span>Fällig</span><input type="date" id="td" value="' + calSel + '"></label><div class="btns"><button class="btn" data-s="x">Abbrechen</button><button class="btn p" data-s="save">Speichern</button></div>', function (act) {
      if (act === "x") return closeSheet();
      var t = $("tq").value.trim(); if (!t) { $("tq").focus(); return; }
      C().tasks.add({ title: t, due: $("td").value }); closeSheet(); snack("Aufgabe gespeichert"); renderCal();
    });
    setTimeout(function () { $("tq").focus(); }, 80);
  }

  /* ---------- Notizen ---------- */
  var nfilter = "open";
  function pAt(k, hm) { return k + "T" + hm; }
  function fmtAt(at) {
    if (!at) return ""; var d = new Date(at), t = today(), k = iso(d), hm = d.getHours() + ":" + pad(d.getMinutes());
    return k === t ? "Heute " + hm : k === plus(t, 1) ? "Morgen " + hm : WD[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + ". " + hm;
  }
  function renderNotes() {
    var c = C(), all = c && c.notes ? c.notes.list() : [], list = all.filter(function (n) { return nfilter === "done" ? n.done : !n.done; });
    $("n-notizen").firstElementChild.innerHTML = '<form class="nadd" id="nform"><input id="nin" placeholder="Neue Notiz …" autocomplete="off" enterkeyhint="done"><button class="ib" type="submit" aria-label="Speichern">' + ico("plus") + "</button></form>" +
      '<div class="seg" style="margin:0 0 12px"><button data-nf="open" class="' + (nfilter === "open" ? "on" : "") + '">Offen ' + all.filter(function (n) { return !n.done; }).length + '</button><button data-nf="done" class="' + (nfilter === "done" ? "on" : "") + '">Erledigt ' + all.filter(function (n) { return n.done; }).length + "</button></div>" +
      (list.length ? '<div class="cells">' + list.map(function (n) {
        var over = n.at && !n.done && new Date(n.at).getTime() < Date.now();
        return '<button class="nt' + (n.done ? " done" : "") + '" data-note="' + n.id + '"><span class="tx">' + esc(n.text) + "</span>" + (n.at ? '<span class="wh' + (over ? " over" : "") + '">' + (n.remind ? "🔔 " : "") + esc(fmtAt(n.at)) + "</span>" : "") + "</button>";
      }).join("") + "</div>" : '<p class="empty">' + (nfilter === "done" ? "Noch nichts erledigt." : "Keine offenen Notizen – oben einfach lostippen.") + "</p>");
    $("nform").addEventListener("submit", function (e) { e.preventDefault(); var t = $("nin").value.trim(); if (!t) return; C().notes.add({ text: t }); snack("Notiz gespeichert"); renderNotes(); $("nin").focus(); });
  }
  $("n-notizen").addEventListener("click", function (e) {
    var f = e.target.closest("[data-nf]"); if (f) { nfilter = f.dataset.nf; return renderNotes(); }
    var n = e.target.closest("[data-note]"); if (n) noteSheet(n.dataset.note);
  });
  // Notiz anlegen oder bearbeiten: Text, optional Zeitpunkt und Erinnerung
  function noteSheet(id, day) {
    var c = C(), n = id ? c.notes.list().find(function (x) { return x.id === id; }) : null;
    var at = n ? n.at || "" : "", rem = n ? !!n.remind : true;
    var k = day || today(), quick = [["Ohne Zeit", ""], ["In 1 Std.", (function () { var d = new Date(Date.now() + 36e5); d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0); return iso(d) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()); })()], ["18:00", pAt(k, "18:00")], ["Morgen 8:00", pAt(plus(k, 1), "08:00")]];
    sheet("<h3>" + (n ? "Notiz" : "Neue Notiz") + '</h3><label class="f"><textarea id="nt" aria-label="Text">' + esc(n ? n.text : "") + "</textarea></label>" +
      '<div class="qt">' + quick.map(function (q) { return '<button class="chip' + (at === q[1] ? " on" : "") + '" data-at="' + q[1] + '">' + q[0] + "</button>"; }).join("") + "</div>" +
      '<label class="f"><span>Zeitpunkt</span><input type="datetime-local" id="nat" value="' + esc(at) + '"></label>' +
      '<label class="f" style="display:flex;align-items:center;gap:10px"><input type="checkbox" id="nrem"' + (rem ? " checked" : "") + ' style="width:20px;height:20px"> Zum Zeitpunkt erinnern</label>' +
      '<div class="btns">' + (n ? '<button class="btn" data-s="del">Löschen</button><button class="btn" data-s="tog">' + (n.done ? "Wieder offen" : "Erledigt") + "</button>" : "") + '<button class="btn p" data-s="save">Fertig</button></div>', function (act, el) {
      if (act === "at") { $("nat").value = el.dataset.at; Array.prototype.forEach.call(document.querySelectorAll("#sheet [data-at]"), function (b) { b.classList.toggle("on", b === el); }); return; }
      var text = $("nt").value.trim(), when = $("nat").value, r = $("nrem").checked;
      if (act === "del") { c.notes.remove(n.id); closeSheet(); snack("Notiz gelöscht", function () { c.notes.update(n.id, { deleted: false }); refresh(); }); }
      else if (act === "tog") { c.notes.update(n.id, { done: !n.done }); closeSheet(); }
      else if (act === "save") {
        if (!text) { if (n) { c.notes.remove(n.id); closeSheet(); } else $("nt").focus(); refresh(); return; }
        if (n) c.notes.update(n.id, { text: text, at: when, remind: !!(when && r) }); else c.notes.add({ text: text, at: when, remind: !!(when && r) });
        if (when && r && c.askNotify) c.askNotify();
        closeSheet(); snack(n ? "Gespeichert" : "Notiz gespeichert");
      }
      refresh();
    });
    Array.prototype.forEach.call(document.querySelectorAll("#sheet [data-at]"), function (b) { b.dataset.s = "at"; });
    if (!n) setTimeout(function () { $("nt").focus(); }, 80);
  }

  /* ---------- Mehr ---------- */
  function renderMehr() {
    var c = C(), notes = c && c.notes ? c.notes.list().filter(function (n) { return !n.done; }).length : 0;
    var open = c && c.tasks ? c.tasks.list().filter(function (q) { return !q.done; }).length : 0;
    var w = null; try { w = JSON.parse(localStorage.getItem("sg-wissen-v1") || "null"); } catch (e) {}
    function r(go, ic, col, t, s, val) { return '<button class="row" data-m="' + go + '" style="--c:' + col + '"><span class="ic">' + ico(ic) + '</span><span class="tx"><b>' + t + "</b><small>" + s + "</small></span>" + (val ? '<span class="val">' + val + "</span>" : "") + '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg></button>'; }
    $("n-mehr").firstElementChild.innerHTML =
      '<div class="grp"><header><span>Planen</span></header><div class="cells">' +
      r("aufgaben", "check", "var(--c-aufgabe)", "Aufgaben", "Heute, Geplant, Wichtig, Erledigt", open || "") +
      r("notizen", "note", "var(--c-notiz)", "Notizen", "Ideen, optional mit Erinnerung", notes || "") +
      r("week", "wand", "var(--c-training)", "Woche planen", "Training, Mobility, Atmung, Lernen eintragen", "") + "</div></div>" +
      '<div class="grp"><header><span>Lesen & Lernen</span></header><div class="cells">' +
      r("bibel", "book", "var(--c-bibel)", "Bibel", "Abschnitt von heute, Bibliothek, Favoriten", "") +
      r("wissen", "star", "#5ac8fa", "Sportwissenschaft", "Lehrbuch, Karteikarten, Quiz", w && w.sum && w.sum.pct ? w.sum.pct + " %" : "") +
      r("pause", "coffee", "#e5a04b", "Pause", "Ablenken, Wissen, Quiz", "") + "</div></div>" +
      '<div class="grp"><header><span>Einstellungen</span></header><div class="cells">' +
      r("design", "palette", "#8f7cf7", "Design", "10 Farbwelten", "") +
      r("sync", "cloud", "#5ac8fa", "Cloud-Sicherung", "Abgleich über GitHub – die App läuft immer offline", "") +
      r("tset", "gear", "var(--c-training)", "Training einstellen", "Ziele, Ruhetage, Erinnerungen, Daten", "") +
      (window.SGInstallEvt ? r("install", "download", "var(--muted)", "App installieren", "Auf den Startbildschirm", "") : "") +
      r("update", "download", "var(--muted)", "Version " + esc(window.SGVersion || ""), "Version aktualisieren", "") + "</div></div>";
  }
  $("n-mehr").addEventListener("click", function (e) {
    var b = e.target.closest("[data-m]"); if (!b) return;
    var m = b.dataset.m, c = C();
    if (m === "week") c.weekPlan();
    else if (m === "wissen") go("training", "wissen");
    else if (m === "design") c.openDesign();
    else if (m === "sync") c.openSync();
    else if (m === "install") { if (window.SGInstallEvt) window.SGInstallEvt.prompt(); }
    else if (m === "update") { if (window.SGUpdate) window.SGUpdate.check(function (t) { snack(t); }); }
    else go(m, null, null, { push: true });
  });

  /* ---------- Blatt von unten, Hinweis ---------- */
  var sheetEl = $("sheet"), sheetOpen = false, sheetCb = null;
  function sheet(html, cb) {
    sheetEl.querySelector(".pn").innerHTML = '<div class="hd"></div>' + html; sheetCb = cb;
    if (!sheetOpen) { history.pushState({ app: 1, sheet: 1 }, "", location.hash); sheetOpen = true; }
    sheetEl.classList.add("on");
  }
  function closeSheet(fromPop) {
    if (!sheetOpen) return; sheetOpen = false; sheetEl.classList.remove("on");
    if (!fromPop && history.state && history.state.sheet) history.back();
  }
  sheetEl.addEventListener("click", function (e) {
    if (e.target === sheetEl) return closeSheet();
    var b = e.target.closest("[data-s]"); if (b && sheetCb) sheetCb(b.dataset.s, b);
  });
  var snackT = null;
  function snack(msg, undo, label) {
    var s = $("snack"); s.innerHTML = "<span>" + esc(msg) + "</span>" + (undo ? "<button>" + esc(label || "Rückgängig") + "</button>" : "");
    s.classList.add("on"); if (undo) s.querySelector("button").onclick = function () { undo(); s.classList.remove("on"); };
    clearTimeout(snackT); snackT = setTimeout(function () { s.classList.remove("on"); }, undo ? 6000 : 3500);
  }
  addEventListener("sg-update", function (e) { snack("Version " + e.detail + " ist da.", function () { window.SGUpdate.install(function (t) { snack(t); }, e.detail); }, "Aktualisieren"); });

  /* ---------- Kopf, Plus, Suche ---------- */
  actsEl.addEventListener("click", function (e) { var b = e.target.closest("[data-act]"); if (b && b.dataset.act === "search" && C()) C().palette(); });
  fab.addEventListener("click", function () { if (cur.v === "notizen") noteSheet(null); else addSheet(); });

  /* ---------- Aktualisieren, wenn sich Daten ändern ---------- */
  function refresh() { var v = V[cur.v]; if (!v || !v.native) return; if (v.native === "kalender") renderCal(); else if (v.native === "notizen") renderNotes(); else renderMehr(); }
  addEventListener("storage", function () { clearTimeout(refresh.t); refresh.t = setTimeout(refresh, 150); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { if (calSel < today() && cur.v === "kalender") calSel = today(); refresh(); } });

  /* ---------- Start ---------- */
  navEl.innerHTML = TABS.map(function (t) { return '<button data-tab="' + t[0] + '"><span class="pill">' + ico(t[2]) + "</span>" + t[1] + "</button>"; }).join("");
  // Offline-Speicher für die ganze App (Service Worker liegt in /planer/, gilt für alle Seiten)
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("../sw.js", { scope: "../" }).catch(function () {});
  function start() {
    if (!C()) return setTimeout(start, 30);
    C().onChange(function () { clearTimeout(refresh.t); refresh.t = setTimeout(refresh, 100); });
    if (location.hash.length > 1) fromHash(); else { history.replaceState({ app: 1 }, "", "#kalender"); render(); }
    // im Leerlauf die wichtigsten Bereiche vorladen – dann wechseln sie sofort
    var pre = ["training/", "training/mobility/", "training/atmung/", "schule/"], i = 0;
    (function next() {
      if (i >= pre.length) return;
      setTimeout(function () { if (!document.hidden && !frames[pre[i]]) frame(pre[i]); i++; next(); }, i ? 2500 : 3500);
    })();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
