/* Planer – Hülle für die ganze App.
 * Fünf Ziele: Kalender (Start) · Training · Mobility · Schule · Mehr. Der Kalender zeigt alles aus allen Bereichen und
 * führt mit einem Tipp dorthin. Die Bereiche sind die bisherigen Seiten (eingebettet, ohne eigene Leisten); sie bleiben
 * geladen und wechseln sofort. Unterpunkte im Seitenmenü (Tablet: feste Spalte), nur Mobility behält Chips.
 * Adressen: #kalender, #training/rodeln/plan, #mobility/atmung, #schule/plan, #mehr, #bibel/lesen, #notizen, #u=<alte Adresse>. */
(function () {
  "use strict";
  var BASE = "/" + (location.pathname.split("/")[1] || "") + "/";
  var KEY = "sg-app-v1";
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("stage"), chipsEl = $("chips"), titleEl = $("title"), actsEl = $("acts"), navEl = $("nav"), backEl = $("back"), fab = $("fab"),
    menuEl = $("menu"), pathEl = $("path"), drawerEl = $("drawer"), dwPn = $("dwpn"), topEl = document.querySelector(".top");

  /* ---------- Symbole ---------- */
  var P = {
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    run: '<circle cx="14.5" cy="4.5" r="2"/><path d="M8 21l3-6 3 2 1 4M10.5 15l1-5 4 2 3-1M8 10l3-2"/>',
    stretch: '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v6l-4 7M12 13l4 7M5 10l7-1 7 1"/>',
    school: '<path d="M2.5 9l9.5-5 9.5 5-9.5 5z"/><path d="M6.5 11.2v4.8c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.8"/>',
    more: '<rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', plus: '<path d="M12 5v14M5 12h14"/>', back: '<path d="M20 12H5M11 5l-7 7 7 7"/>',
    chev: '<path d="M9 5l7 7-7 7"/>', chevl: '<path d="M15 5l-7 7 7 7"/>', check: '<path d="M4 6.5l1.8 1.8L9 5M4 12.5l1.8 1.8L9 11M4 18.5l1.8 1.8L9 17M12.5 7h7.5M12.5 13h7.5M12.5 19h7.5"/>',
    note: '<path d="M5 3.5h10l4 4v13H5z"/><path d="M15 3.5v4h4M8.5 12h7M8.5 16h5"/>', book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>', coffee: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M11 3v3"/>',
    wand: '<path d="M4 20L16 8M14 6l4 4M18 3v3M21 6h-3M7 4v2M8 5H6"/>', ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5l1.6 2.6 3-.6.6 3 2.6 1.6-1.4 2.9 1.4 2.9-2.6 1.6-.6 3-3-.6L12 21.5l-1.6-2.6-3 .6-.6-3-2.6-1.6L5.6 12 4.2 9.1l2.6-1.6.6-3 3 .6z"/>',
    palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.8-1 1.2-2.1-.7-1.2.1-2.4 1.5-2.4H17a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9-8.5-9z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
    cloud: '<path d="M7 18.5h10.5a4 4 0 0 0 .4-8A6 6 0 0 0 6.3 9.6 4.5 4.5 0 0 0 7 18.5z"/>', download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    sled: '<path d="M3 17h15a3 3 0 0 0 3-3M6 17l-2 3M15 17l-2 3"/><circle cx="9" cy="8" r="2"/><path d="M7 13.5l3-3 4 1"/>', bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>', phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>', star: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>'
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
   * sel = Knopf, der den Unterbereich wählt (X = s), kids = Untereinträge, nav = "drawer" (Seitenmenü) oder "chips",
   * c = Bereichsfarbe, foot = Einträge unten im Seitenmenü [Ziel, Text, Symbol] */
  var MODNAV = "nav [data-tab='X'],nav [data-go='X'],nav [data-v='X']";
  var V = {
    kalender: { t: "Kalender", tab: "kalender", native: "kalender" },
    training: { t: "Training", tab: "training", nav: "drawer", c: "var(--c-training)", foot: [["tset", "Training einstellen", "gear"]], secs: [
      { id: "heute", t: "Heute", p: "training/", h: "heute" },
      { id: "lauf", t: "Laufen", p: "training/", h: "lauf" },
      { id: "kraft", t: "Kraft", p: "training/", h: "kraft" },
      { id: "rodeln", t: "Rodeln", p: "training/bahnplan/", sel: MODNAV, kids: [{ id: "plan", t: "Kurvenbuch", s: "plan" }, { id: "bahnen", t: "Bahnen", s: "bahnen" }, { id: "laeufe", t: "Läufe & Zeiten", s: "laeufe" }, { id: "buch", t: "Drucken", s: "buch" }] },
      { id: "auswertung", t: "Auswertung", p: "training/", kids: [{ id: "fitness", t: "Fitness", h: "fitness" }, { id: "analyse", t: "Analyse", h: "daten" }, { id: "rueckblick", t: "Kalender & Rückblick", h: "kalender" }] },
      { id: "wissen", t: "Sportwissenschaft", p: "wissen/", kids: [{ id: "lesen", t: "Lesen", h: "lesen" }, { id: "karten", t: "Karteikarten", h: "karten" }, { id: "quiz", t: "Quiz", h: "quiz" }, { id: "suche", t: "Suche", h: "suche" }] }
    ] },
    mobility: { t: "Mobility", tab: "mobility", nav: "chips", secs: [
      { id: "mobility", t: "Mobility", p: "training/mobility/", sel: MODNAV, kids: [{ id: "heute", t: "Tagesblock", s: "heute" }, { id: "wettkampf", t: "Wettkampf", s: "wettkampf" }, { id: "uebungen", t: "Übungen", s: "uebungen" }, { id: "fortschritt", t: "Fortschritt", s: "fortschritt" }] },
      { id: "atmung", t: "Atmung & HRV", p: "training/atmung/", sel: MODNAV, kids: [{ id: "heute", t: "Heute", s: "today" }, { id: "hrv", t: "Üben & HRV messen", s: "train" }, { id: "woche", t: "Woche", s: "week" }, { id: "verlauf", t: "Verlauf", s: "log" }, { id: "plan", t: "12-Wochen-Plan", s: "plan" }] }
    ] },
    schule: { t: "Schule", tab: "schule", nav: "drawer", c: "var(--c-schule)", secs: [
      { id: "heute", t: "Schultag", p: "schule/", sel: ".tab[data-v='X']", s: "heute" },
      { id: "plan", t: "Stundenplan", p: "schule/", sel: ".tab[data-v='X']", s: "plan" },
      { id: "aufgaben", t: "Aufgaben & Prüfungen", p: "schule/", sel: ".tab[data-v='X']", s: "aufgaben" },
      { id: "lernzeit", t: "Lernzeit", p: "schule/", h: "lernzeit" },
      { id: "ablage", t: "Ablage", p: "schule/", h: "ablage" },
      { id: "lernplan", t: "Lernplan", p: "schule/", sel: ".tab[data-v='X']", s: "lehrgang" },
      { id: "ferien", t: "Schuljahr & Ferien", p: "schule/", sel: ".tab[data-v='X']", s: "kalender" }
    ] },
    mehr: { t: "Mehr", tab: "mehr", native: "mehr" },
    // über „Mehr“ erreichbar (Zurück führt dorthin)
    aufgaben: { t: "Aufgaben", tab: "mehr", up: "mehr", secs: [{ id: "alle", t: "Aufgaben", p: "", h: "tasks" }] },
    notizen: { t: "Notizen", tab: "mehr", up: "mehr", native: "notizen" },
    bibel: { t: "Bibel", tab: "mehr", up: "mehr", nav: "drawer", c: "var(--c-bibel)", secs: [
      { id: "heute", t: "Heute", p: "bibel/", h: "heute" }, { id: "lesen", t: "Weiterlesen", p: "bibel/", h: "lesen" },
      { id: "bibliothek", t: "Bibliothek", p: "bibel/", h: "bibliothek" }, { id: "meine", t: "Meine Bibel", p: "bibel/", h: "meinebibel" }, { id: "einst", t: "Einstellungen", p: "bibel/", h: "mehr" }] },
    pause: { t: "Pause", tab: "mehr", up: "mehr", nav: "drawer", c: "var(--c-atmung)", secs: [
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
      trimFrames(p);
    }
    f.dataset.used = String(Date.now());
    return f;
  }
  // Höchstens so viele Bereiche bleiben geladen – sonst geht dem Handy (v. a. in der Android-App) der Speicher aus.
  // Der am längsten nicht benutzte wird geschlossen (er speichert dabei selbst) und beim nächsten Öffnen neu geladen.
  var MAXF = window.SGNative ? 5 : 7;
  function trimFrames(keep) {
    var list = Object.keys(frames).filter(function (k) { return k !== keep && !frames[k].classList.contains("on"); });
    while (list.length && Object.keys(frames).length > MAXF) {
      list.sort(function (a, b) { return (+frames[a].dataset.used || 0) - (+frames[b].dataset.used || 0); });
      var k = list.shift(); frames[k].remove(); delete frames[k];
    }
  }
  // Unterbereich in der Seite wählen: Sprungadresse setzen oder Knopf ihrer Leiste drücken (sobald geladen)
  function apply(f, spec, fresh) {
    if (spec.h && !fresh) {
      try {
        // gleiche Adresse löst kein hashchange aus – die Seite kann aber inzwischen woanders stehen (eigene Knöpfe)
        if (f.contentWindow.location.hash === "#" + spec.h) f.contentWindow.dispatchEvent(new HashChangeEvent("hashchange"));
        else f.contentWindow.location.replace(BASE + f.dataset.p + "#" + spec.h);
      } catch (e) {}
    }
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
    var dw = hasDw(v);
    var lostFocus = document.activeElement === menuEl && !dw;
    // Pfadzeile auch bei Mobility (Chips) – dort nur Anzeige, kein Menü
    var hasPath = dw || !!(v.secs && (v.secs.length > 1 || v.secs[0].kids));
    menuEl.hidden = !dw; pathEl.hidden = !hasPath; pathEl.disabled = !dw; topEl.classList.toggle("hasmenu", dw); topEl.classList.toggle("haspath", hasPath); document.body.classList.toggle("hasdw", dw);
    pathEl.tabIndex = wideMQ.matches ? -1 : 0;
    if (!dw && drawerOpen) closeDrawer();
    if (lostFocus) (v.up ? backEl : titleEl).focus({ preventScroll: true });
    // Navigation
    Array.prototype.forEach.call(navEl.children, function (b) { b.classList.toggle("on", b.dataset.tab === v.tab); });
    mehrBadge();
    // Kopf-Aktionen
    actsEl.innerHTML = '<button class="ib" data-act="search" aria-label="Suchen">' + ico("search") + "</button>";
    fab.classList.toggle("on", cur.v === "kalender" || cur.v === "notizen");
    fab.innerHTML = ico("plus");
    if ($("tomonth")) { if (cur.v === "kalender") setTimeout(toMonthBtn, 50); else $("tomonth").classList.remove("on"); }
    if (v.native) {
      chipsEl.innerHTML = ""; stage.classList.remove("lined"); dwPn.innerHTML = "";
      var n = $("n-" + v.native); show(n); $("load").classList.remove("on");
      if (v.native === "kalender") renderCal(); else if (v.native === "mehr") renderMehr(); else renderNotes();
      return;
    }
    var s = secOf(v, cur.s || M.sec[cur.v]), k = kidOf(s, cur.k || M.kid[cur.v + "/" + s.id]);
    cur.s = s.id; cur.k = k ? k.id : null;
    M.sec[cur.v] = s.id; if (k) M.kid[cur.v + "/" + s.id] = k.id; saveM();
    // Seitenmenü (Pfadzeile unter dem Titel) oder Chips (Mobility)
    pathEl.textContent = s.t + (k ? " · " + k.t : "");
    if (dw) { pathEl.setAttribute("aria-label", "Bereichsmenü öffnen, aktuell " + pathEl.textContent); renderDrawer(v, s, k); }
    else { pathEl.removeAttribute("aria-label"); dwPn.innerHTML = ""; }
    var h = "";
    if (!dw && v.secs.length > 1) h += '<div class="crow">' + v.secs.map(function (x) { return '<button class="chip' + (x.id === s.id ? " on" : "") + '" data-sec="' + x.id + '">' + esc(x.t) + "</button>"; }).join("") + "</div>";
    if (s.kids && !dw) h += '<div class="crow sub">' + s.kids.map(function (x) { return '<button class="chip' + (k && x.id === k.id ? " on" : "") + '" data-kid="' + x.id + '">' + esc(x.t) + "</button>"; }).join("") + "</div>";
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
    if (drawerOpen) return closeDrawer(function () { go(v, s, k, opt); });
    if (!V[v]) v = "kalender";
    var push = opt.push != null ? opt.push : (cur.v === "kalender" && v !== "kalender") || (V[v].up === cur.v);
    var hsh = hashOf(v, s, k), prev = cur.v;
    cur = { v: v, s: s || null, k: k || null, sub: opt.sub || null };
    // from = Ziel davor: „Zurück zu Mehr“ darf nur dann zurückgehen, wenn davor wirklich Mehr war
    if (location.hash !== hsh) { if (push) history.pushState({ app: 1, from: prev }, "", hsh); else history.replaceState({ app: 1, from: history.state && history.state.from }, "", hsh); }
    render();
  }
  function fromHash() {
    var h = decodeURIComponent(location.hash.slice(1));
    if (h.indexOf("u=") === 0) { history.replaceState({ app: 1 }, "", "#kalender"); cur = { v: "kalender" }; render(); return openUrl(h.slice(2)); }
    if (h === "teilen") { history.replaceState({ app: 1 }, "", "#kalender"); cur = { v: "kalender" }; render(); return setTimeout(takeShared, 300); }
    var p = h.split("/");
    cur = { v: V[p[0]] ? p[0] : "kalender", s: p[1] || null, k: p[2] || null };
    render();
  }
  // Zurück: erst das Seitenmenü zu, dann das Blatt, erst dann wird navigiert
  addEventListener("popstate", function () {
    // Reihenfolge: Suche (liegt ganz oben) → Seitenmenü → Blatt → Navigation
    if (window.SGShellSearch && SGShellSearch.isOpen()) { closeSearch(true); return; }
    if (shAfter) { var sh = shAfter; shAfter = null; sh(); return; }   // Blatt der Hülle ist zu, jetzt das Nächste öffnen
    if (C() && C().panelOpen && C().panelOpen() && !(history.state && history.state.vp)) { C().closePanel(true); return; }   // Blatt des Verbunds (Termin, Design, Cloud)
    if (sxAfter) { var sa = sxAfter; sxAfter = null; sa(); return; }
    if (drawerOpen) { closeDrawer(null, true); return; }
    if (dwAfter) { var a = dwAfter; dwAfter = null; a(); return; }
    if (sheetOpen) { closeSheet(true); return; }
    fromHash();
  });
  navEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]"); if (!b) return;
    var t = b.dataset.tab;
    if (t === "kalender" && cur.v !== "kalender" && history.state && history.state.app && history.length > 1 && pushedFromCal) { history.back(); return; }
    if (t === cur.v) { if (t === "kalender") { setSel(today()); renderCal(); $("n-kalender").scrollTop = 0; } else if (hasDw(V[t])) openDrawer(); return; }
    pushedFromCal = cur.v === "kalender";
    go(t, null, null, { push: cur.v === "kalender" });
    if (M.autoDw && hasDw(V[t]) && !wideMQ.matches) setTimeout(openDrawer, 60);
  });
  var pushedFromCal = false;
  backEl.addEventListener("click", function () { var v = V[cur.v]; if (history.state && history.state.app && history.length > 1) history.back(); else go(v.up || "kalender"); });
  chipsEl.addEventListener("click", function (e) {
    var a = e.target.closest("[data-sec]"), b = e.target.closest("[data-kid]");
    if (a) go(cur.v, a.dataset.sec, null, { push: false });
    else if (b) go(cur.v, cur.s, b.dataset.kid, { push: false });
  });

  /* ---------- Seitenmenü ----------
   * Öffnet nur über das Symbol, die Pfadzeile oder einen zweiten Tipp auf den aktiven Tab (kein Wischen vom Rand – das ist
   * die Zurück-Geste von Android). Beim Öffnen entsteht ein Verlaufseintrag, Zurück schließt es also zuerst.
   * Ab 900 px steht es fest als Spalte neben der Navigation. */
  // feste Spalte nur auf großen Bildschirmen – Querformat-Handys (915 × 412) bekommen das Menü zum Aufziehen
  var drawerOpen = false, drawerAt = 0, dwAfter = null, dwExp = null, dwLast = "", wideMQ = matchMedia("(min-width: 900px) and (min-height: 600px)");
  function hasDw(v) { return !!(v && v.nav === "drawer" && v.secs && v.secs.length > 1); }
  function renderDrawer(v, s, k) {
    // aufgeklappte Gruppe gilt nur bis zum nächsten Wechsel – danach ist wieder der aktive Eintrag offen
    if (dwLast !== cur.v + "/" + s.id) { dwExp = null; dwLast = cur.v + "/" + s.id; }
    var hadFocus = dwPn.contains(document.activeElement);
    var h = '<div class="dw-h">' + esc(v.t) + "</div>";
    h += v.secs.map(function (x) {
      var on = x.id === s.id, ex = !!x.kids && (dwExp == null ? on : dwExp === x.id);
      return '<div class="dw-g' + (ex ? " ex" : "") + '"><div class="dw-r"><button class="dw-it' + (on ? " on" : "") + '" data-sec="' + x.id + '"' + (on && !x.kids ? ' aria-current="page"' : "") + ">" + esc(x.t) + "</button>" +
        (x.kids ? '<button class="dw-x" data-exp="' + x.id + '" aria-expanded="' + ex + '" aria-label="Unterpunkte von ' + esc(x.t) + '">' + ico("chev") + "</button></div>" +
          '<div class="dw-kids">' + x.kids.map(function (y) { var kon = on && k && y.id === k.id; return '<button class="dw-it sub' + (kon ? " on" : "") + '" data-sec="' + x.id + '" data-kid="' + y.id + '"' + (kon ? ' aria-current="page"' : "") + (ex ? "" : ' tabindex="-1"') + ">" + esc(y.t) + "</button>"; }).join("") + "</div>" : "</div>") + "</div>";
    }).join("");
    var ft = (v.foot || []).concat(v.up ? [[v.up, "Zurück zu " + V[v.up].t, "back"]] : []);
    if (ft.length) h += '<div class="dw-ft">' + ft.map(function (f) { return '<button class="dw-it" data-dgo="' + f[0] + '">' + ico(f[2]) + esc(f[1]) + "</button>"; }).join("") + "</div>";
    dwPn.innerHTML = h; dwPn.style.setProperty("--c", v.c || "var(--acc)");
    if (wideMQ.matches) { dwPn.setAttribute("role", "navigation"); dwPn.removeAttribute("aria-modal"); } else { dwPn.setAttribute("role", "dialog"); dwPn.setAttribute("aria-modal", "true"); }
    if (hadFocus) dwFocus();
  }
  // offenes Menü (Handy): alles dahinter ist für Tastatur und Vorlesen gesperrt
  function dwInert(on) { [topEl, chipsEl, stage, navEl].forEach(function (x) { if (on) x.setAttribute("inert", ""); else x.removeAttribute("inert"); }); }
  function dwFocus() { var a = [dwPn.querySelector(".dw-it.sub.on"), dwPn.querySelector(".dw-it.on"), dwPn.querySelector(".dw-it")].filter(function (x) { return x && x.offsetParent; })[0]; if (a) a.focus({ preventScroll: true }); }
  function openDrawer() {
    var v = V[cur.v]; if (!hasDw(v)) return;
    if (wideMQ.matches) return dwFocus();
    if (drawerOpen) return;
    dwExp = null; renderDrawer(v, secOf(v, cur.s), kidOf(secOf(v, cur.s), cur.k));
    drawerOpen = true; drawerAt = Date.now(); dwAfter = null;
    history.pushState({ app: 1, drawer: 1 }, "", location.hash);
    drawerEl.classList.add("on"); menuEl.setAttribute("aria-expanded", "true"); dwInert(true);
    setTimeout(dwFocus, 30);
  }
  // after = Navigation nach dem Schließen (erst wenn der Verlaufseintrag des Menüs weg ist, sonst landet sie im falschen Eintrag)
  function closeDrawer(after, fromPop) {
    if (!drawerOpen) { if (after) after(); return; }
    drawerOpen = false; drawerEl.classList.remove("on"); menuEl.setAttribute("aria-expanded", "false"); dwInert(false);
    if (!menuEl.hidden) menuEl.focus({ preventScroll: true });
    if (!fromPop && history.state && history.state.drawer) { dwAfter = after || function () {}; history.back(); }
    else if (after) after();
  }
  menuEl.innerHTML = ico("menu");
  menuEl.addEventListener("click", openDrawer);
  pathEl.addEventListener("click", openDrawer);
  drawerEl.addEventListener("click", function (e) {
    if (e.target === drawerEl) { if (Date.now() - drawerAt > 350) closeDrawer(); return; }
    var x = e.target.closest("[data-exp]"), b = e.target.closest("[data-sec],[data-dgo]");
    if (x) {
      var id = x.dataset.exp, open = x.getAttribute("aria-expanded") === "true", v = V[cur.v];
      dwExp = open ? "" : id; renderDrawer(v, secOf(v, cur.s), kidOf(secOf(v, cur.s), cur.k));
      var nx = dwPn.querySelector('[data-exp="' + id + '"]'); if (nx) nx.focus({ preventScroll: true });
      return;
    }
    if (!b) return;
    var v0 = cur.v, sec = b.dataset.sec, kid = b.dataset.kid || null, to = b.dataset.dgo;
    closeDrawer(function () {
      if (to && to === V[v0].up) { if (history.state && history.state.from === to) history.back(); else go(to, null, null, { push: false }); }
      else if (to) go(to, null, null, { push: true });
      else go(v0, sec, kid, { push: false });
    });
  });
  // nach links wischen schließt
  (function () {
    var x0 = 0, y0 = 0, on = false;
    dwPn.addEventListener("touchstart", function (e) { if (!drawerOpen) return; on = true; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    dwPn.addEventListener("touchmove", function (e) {
      if (!on) return; var dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
      if (dx < -50 && Math.abs(dx) > Math.abs(dy) * 1.5) { on = false; closeDrawer(); }
    }, { passive: true });
    dwPn.addEventListener("touchend", function () { on = false; }, { passive: true });
  })();
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawerOpen) closeDrawer(); });
  (wideMQ.addEventListener ? wideMQ.addEventListener.bind(wideMQ, "change") : wideMQ.addListener.bind(wideMQ))(function () { if (drawerOpen) closeDrawer(); if (!V[cur.v].native) render(); });

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
      if (h0 === "lauf" || h0 === "kraft") return go("training", h0);
      if (h0 === "fitness") return go("training", "auswertung", "fitness");
      if (h0 === "daten") return go("training", "auswertung", "analyse");
      if (h0 === "einst") return go("tset", null, null, { push: true });
      if (h0 === "kalender") return go("kalender");
      return go("training", "heute");
    }
    if (p === "training/mobility/") return openModule("mobility", h0);
    if (p === "training/atmung/") return openModule("atmung", h0);
    if (p === "training/bahnplan/") return openModule("bahnplan", h0);
    if (p === "bibel/" && /^stelle=/.test(h0)) return go("bibel", "heute", null, { push: true, sub: h0 });
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
  window.SGShell = { openUrl: openUrl, openApp: openApp, openModule: openModule, go: go, V: V };

  /* ---------- Kalender (Start) ---------- */
  var calSel = today(), calMonth = calSel.slice(0, 8) + "01", CD = null;
  // gewählten Tag setzen – der Monatskalender folgt (mit den Pfeilen lässt er sich unabhängig blättern)
  function setSel(k) { calSel = k; calMonth = k.slice(0, 8) + "01"; }
  var AREA = {
    training: { c: "var(--c-training)", ic: "run", label: "Training", act: "Starten", to: function () { go("training", "heute"); } },
    mobility: { c: "var(--c-mobility)", ic: "stretch", label: "Mobility", act: "Starten", to: function () { go("mobility", "mobility", "heute"); } },
    atmung: { c: "var(--c-atmung)", ic: "wind", label: "Atmung", act: "Üben", to: function () { go("mobility", "atmung", "hrv"); } },
    schule: { c: "var(--c-schule)", ic: "school", label: "Schule", act: "Öffnen", to: function (e) { go("schule", e && e.exam ? "aufgaben" : "heute"); } },
    notiz: { c: "var(--c-notiz)", ic: "note", label: "Notiz", act: "", to: function (e) { noteSheet(e.noteId); } },
    termin: { c: "var(--c-termin)", ic: "cal", label: "Termin", act: "", to: null },
    aufgabe: { c: "var(--c-aufgabe)", ic: "check", label: "Aufgabe", act: "", to: null }
  };
  function area(e) {
    var c = C(); if (c && c.areaOf) return c.areaOf(e);   // zentrale Tabelle im Verbund (Feld area, sonst tolerant aus app)
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
  function monday(k) { var d = parse(k); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return iso(d); }
  /* ---------- Kalender-Startseite: Wochenleiste · Tagesplan · großer Monat · Auf einen Blick · Danach ----------
     Die Teile zeichnen sich einzeln neu (renderStrip/renderDay/renderMonth), damit beim Abhaken oder Wischen nichts springt.
     Daten einmal je Zeichnen aus items() (Raster + Puffer), Punkte und Balken aus derselben Liste. */
  var MS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  function kwOf(k) { var d = parse(k), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7); }
  function shiftMonth(m, n) { var d = parse(m); d.setMonth(d.getMonth() + n, 1); return iso(d); }
  function gridFrom() { return monday(calMonth); }
  function calData() {
    var sFrom = monday(calSel), sTo = plus(calSel, 45), gFrom = gridFrom(), gTo = plus(gFrom, 48);
    if (plus(sFrom, 6) > sTo) sTo = plus(sFrom, 6);
    // Wochenleiste + „Danach“ und das Raster: eine Abfrage, wenn sie sich berühren, sonst zwei (weit geblättert)
    var ranges = sTo < gFrom || gTo < sFrom ? [[sFrom, sTo], [gFrom, gTo]] : [[sFrom < gFrom ? sFrom : gFrom, sTo > gTo ? sTo : gTo]];
    var list = [], seen = {}, by = {}, free = {}, tasks = [], tby = {};
    ranges.forEach(function (r) { items(r[0], r[1]).forEach(function (e) { var id = (e.id || e.title) + "@" + e.date + "@" + (e.time || ""); if (!seen[id]) { seen[id] = 1; list.push(e); } }); });
    ITEMS = {};
    list.forEach(function (e, i) { e._k = "i" + i; ITEMS[e._k] = e; (by[e.date] = by[e.date] || []).push(e); });
    try { var sp = JSON.parse(localStorage.getItem("sg-stundenplan-v1") || "null"); (sp && sp.f || []).forEach(function (x) { free[x[0]] = x[1]; }); } catch (e) {}
    try { tasks = C().tasks.list(); } catch (e) {}
    tasks.forEach(function (q) { if (q.due) (tby[q.due] = tby[q.due] || []).push(q); });
    CD = { ranges: ranges, list: list, by: by, free: free, tby: tby, tasks: tasks };
    return CD;
  }
  function needData() {
    var ok = CD && CD.ranges.some(function (r) { return monday(calSel) >= r[0] && plus(calSel, 45) <= r[1]; }) && CD.ranges.some(function (r) { return gridFrom() >= r[0] && plus(gridFrom(), 48) <= r[1]; });
    if (!ok) calData();
    return CD;
  }
  // offene Aufgaben eines Tages – heute auch die überfälligen (wie im Tagesplan)
  function openTasks(k) { return (k === today() ? tasksFor(k) : (CD.tby[k] || [])).filter(function (q) { return !q.done; }); }
  // Tageswechsel bei offener App: war „heute“ gewählt, wandert die Auswahl mit
  var calToday = today();
  function dayRoll() { var t = today(); if (t === calToday) return false; if (calSel === calToday) setSel(t); calToday = t; return true; }
  function calBox() {
    var w = $("n-kalender").firstElementChild;
    if (!$("cal-strip")) w.innerHTML = '<div id="cal-strip"></div><div id="cal-day"></div><div id="cal-month"></div><div id="cal-glance"></div><div id="cal-next"></div>';
    return w;
  }
  function renderCal() { dayRoll(); calBox(); calData(); renderStrip(); renderDay(); renderMonth(); renderGlance(); renderNext(); toMonthBtn(); }
  function dayLabel(k, n) {
    var d = parse(k), t = today();
    if (n == null) n = (CD && CD.by[k] || []).length + (CD ? openTasks(k).length : 0);
    return WDL[d.getDay()] + ", " + d.getDate() + ". " + MO[d.getMonth()] + ", " + (n === 1 ? "1 Eintrag" : (n || "keine") + " Einträge") + (k === t ? ", heute" : "");
  }
  function stripDots(k) {
    var seen = {}, out = [];
    (CD.by[k] || []).forEach(function (e) { var a = area(e); if (!seen[a]) { seen[a] = 1; out.push(AREA[a].c); } });
    if (openTasks(k).length && !seen.aufgabe) out.push(AREA.aufgabe.c);
    return out.slice(0, 3).map(function (c) { return '<i style="background:' + c + '"></i>'; }).join("");
  }
  function renderStrip() {
    needData();
    var t = today(), from = monday(calSel), to = plus(from, 6), a = parse(from), b = parse(to);
    var lab = a.getMonth() === b.getMonth() ? MO[a.getMonth()] + " " + a.getFullYear()
      : a.getFullYear() === b.getFullYear() ? MS[a.getMonth()] + "/" + MS[b.getMonth()] + " " + b.getFullYear()
      : MS[a.getMonth()] + " " + a.getFullYear() + "/" + MS[b.getMonth()] + " " + b.getFullYear();
    var wb = null; try { wb = C().weekBalance(from); } catch (e) {}
    var bal = wb && wb.n ? '<span class="wbal" aria-label="Wochenbilanz: ' + wb.done + " von " + (wb.n - wb.skip) + ' Einheiten erledigt' + (wb.skip ? ", " + wb.skip + " ausgelassen" : "") + '">' + wb.done + " von " + (wb.n - wb.skip) + " Einheiten" + (wb.skip ? " · " + wb.skip + " ausgelassen" : "") + "</span>" : "";
    var h = '<div class="calhd"><b>KW ' + kwOf(from) + " · " + lab + "</b>" + bal + (calSel !== t ? '<button class="lnk" data-c="today">Heute</button>' : "") + '</div><div class="week" id="strip">';
    for (var k = from; k <= to; k = plus(k, 1)) {
      var d = parse(k);
      h += '<button class="wd' + (k === t ? " t" : "") + (k === calSel ? " s" : "") + '" data-day="' + k + '" aria-pressed="' + (k === calSel) + '" aria-label="' + dayLabel(k) + '"><small>' + WD[d.getDay()] + '</small><span class="n">' + d.getDate() + '</span><span class="dots">' + stripDots(k) + "</span></button>";
    }
    $("cal-strip").innerHTML = h + "</div>";
    swipe($("strip"), function (dir) { setSel(plus(calSel, dir * 7)); renderAfterPick(); });
  }
  function renderDay() {
    needData();
    var t = today(), sel = calSel, sd = parse(sel), c = C();
    var day = (CD.by[sel] || []).slice().sort(function (x, y) { return (x.time ? 1 : 0) - (y.time ? 1 : 0); }), tasks = tasksFor(sel);
    var grid = dayView() === "grid" && day.some(function (e) { return e.time; });
    var h = '<div class="grp" id="dayplan"><header><span>' + (sel === t ? "Heute · " : sel === plus(t, 1) ? "Morgen · " : sel === plus(t, -1) ? "Gestern · " : "") + WDL[sd.getDay()] + ", " + sd.getDate() + ". " + MO[sd.getMonth()] + "</span>" +
      '<button class="lnk" data-c="new">+ Eintrag</button></header>' +
      (day.filter(function (e) { return e.time; }).length > 1 ? '<div class="seg2" role="group" aria-label="Ansicht"><button data-c="vlist" aria-pressed="' + !grid + '">Liste</button><button data-c="vgrid" aria-pressed="' + grid + '">Zeitraster</button></div>' : "");
    if (!day.length && !tasks.length) h += '<div class="cells"><div class="empty">Nichts geplant.<div class="btns" style="margin-top:12px"><button class="btn" data-c="week">Woche planen</button>' +
      (c && c.weekPlanConfig && c.weekPlanConfig().std ? '<button class="btn p" data-c="std">Standardwoche übernehmen</button>' : "") + "</div></div></div>";
    else if (grid) h += timeGrid(day, sel === t) + '<div class="cells">' + tasks.map(taskRow).join("") + "</div>";
    else h += '<div class="cells">' + dayRows(day, sel === t) + tasks.map(taskRow).join("") + "</div>";
    $("cal-day").innerHTML = h + "</div>";
    dayPlan.min = nowMin(); dayPlan.slot = nowSlot(day);
  }
  // Platz der Jetzt-Linie: wie viele Einträge mit Uhrzeit schon begonnen haben
  function nowSlot(day) { var n = nowMin(); return (day || CD && CD.by[calSel] || []).filter(function (e) { return e.time && tmin(e.time) <= n; }).length; }
  // jede halbe Minute: nur Uhrzeit der Linie aktualisieren; neu zeichnen nur, wenn sie an eine andere Stelle rückt und niemand im Tagesplan ist
  function tickNow() {
    var l = document.querySelector("#dayplan .nowl"), g = document.querySelector("#dayplan .tnow"), n = nowMin();
    if (!l && !g) return;
    if (l) { l.querySelector("span").textContent = hm(n); l.setAttribute("aria-label", "Jetzt, " + hm(n) + " Uhr"); }
    if (g) g.style.top = Math.round((n - 360) * 0.9) + "px";
    if (l && nowSlot() !== dayPlan.slot && !$("cal-day").contains(document.activeElement)) renderDay();
  }
  function nowMin() { var n = new Date(); return n.getHours() * 60 + n.getMinutes(); }
  function hm(m) { return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function tmin(t) { var p = String(t).split(":"); return +p[0] * 60 + +p[1]; }
  function endMin(e) { var a = tmin(e.time); return e.end && e.end > e.time ? tmin(e.end) : a + 60; }
  var dayPlan = { min: -1 };
  // Liste: „Frei 14:00 bis 16:30“ ab 45 Minuten zwischen Einträgen, heute eine Jetzt-Linie
  function dayRows(day, isT) {
    var out = "", lastEnd = -1, now = isT ? nowMin() : -1, nowDone = !isT;
    day.forEach(function (e) {
      if (e.time) {
        var a = tmin(e.time);
        if (!nowDone && now < a) { out += nowLine(now); nowDone = true; }
        if (lastEnd >= 0 && a - lastEnd >= 45) out += '<div class="gap" role="note">Frei ' + hm(lastEnd) + " bis " + hm(a) + "</div>";
        out += evRow(e, isT);
        if (e.st !== "skip") lastEnd = Math.max(lastEnd, endMin(e));
      } else out += evRow(e, isT);
    });
    if (!nowDone && day.some(function (e) { return e.time; })) out += nowLine(now);
    return out;
  }
  function nowLine(m) { return '<div class="nowl" role="note" aria-label="Jetzt, ' + hm(m) + ' Uhr"><span>' + hm(m) + "</span><i></i></div>"; }
  // Zeitraster 06–22 Uhr: Blöcke nach Dauer, Überschneidungen nebeneinander
  function timeGrid(day, isT) {
    var H0 = 6 * 60, H1 = 22 * 60, PX = 0.9, timed = day.filter(function (e) { return e.time; }), allday = day.filter(function (e) { return !e.time; });
    var cols = [], ends = [];
    timed.forEach(function (e) {
      var a = tmin(e.time), b = Math.max(a + 20, endMin(e)), ci = ends.findIndex(function (x) { return x <= a; });
      if (ci < 0) { ci = ends.length; ends.push(0); }
      ends[ci] = b; e._col = ci; e._a = a; e._b = b;
    });
    // je Block: wie viele Spalten in seiner Gruppe gleichzeitig laufen
    timed.forEach(function (e) { e._n = 1 + timed.filter(function (x) { return x !== e && x._a < e._b && e._a < x._b && x._col > e._col; }).length + e._col; });
    var h = (allday.length ? '<div class="cells">' + allday.map(function (e) { return evRow(e, isT); }).join("") + "</div>" : "") + '<div class="tgrid" style="height:' + Math.round((H1 - H0) * PX) + 'px">';
    for (var m = H0; m <= H1; m += 60) h += '<div class="tl" style="top:' + Math.round((m - H0) * PX) + 'px"><span>' + pad(m / 60) + "</span></div>";
    timed.forEach(function (e) {
      var A = AREA[area(e)], top = Math.round((Math.max(H0, Math.min(H1 - 36, e._a)) - H0) * PX), ht = Math.max(36, Math.round((Math.min(H1, e._b) - Math.max(H0, e._a)) * PX)), w = 100 / e._n, short = ht < 48;
      h += '<button class="tb' + (e.st === "skip" ? " skip" : e.st === "done" ? " evd" : "") + '" data-ev="' + e._k + '" style="--c:' + A.c + ";top:" + top + "px;height:" + ht + "px;left:calc(44px + (100% - 48px) * " + (e._col * w / 100).toFixed(4) + ");width:calc((100% - 48px) * " + (w / 100).toFixed(4) + ' - 3px)">' +
        '<span class="tbi' + (short ? " one" : "") + '"><b>' + (e.st === "done" ? "✓ " : "") + esc(e.title || "(ohne Titel)") + "</b><small>" + esc(e.time) + (e.end ? "–" + esc(e.end) : "") + "</small></span></button>";
    });
    if (isT) { var nm = nowMin(); if (nm >= H0 && nm <= H1) h += '<div class="tnow" style="top:' + Math.round((nm - H0) * PX) + 'px" aria-hidden="true"></div>'; }
    return h + "</div>";
  }
  function dayView() { try { return localStorage.getItem("sg-tagesansicht-v1") === "grid" ? "grid" : "list"; } catch (e) { return "list"; } }
  function monthMarks(k, wide, lanes) {
    var inBar = function (e) { return e.of > 1 && (SPANS.cell[k] || []).some(function (z) { return z.key === e.id + "@" + e.occ; }); };
    var all = (CD.by[k] || []).filter(function (e) { return !inBar(e); }).map(function (e) { return [area(e), e.title]; })
      .concat(openTasks(k).map(function (q) { return ["aufgabe", q.title]; }));
    var cap = Math.max(1, 3 - (lanes || 0)), nAll = all.length + (CD.by[k] || []).filter(inBar).length;
    var h = all.slice(0, cap).map(function (x) {
      var A = AREA[x[0]];
      return wide ? '<span class="ml" style="--c:' + A.c + '">' + ico(A.ic) + "<em>" + esc(x[1] || "(ohne Titel)") + "</em></span>" : '<span class="mb" style="--c:' + A.c + '">' + ico(A.ic) + "<i></i></span>";
    }).join("");
    return [h + (all.length > cap ? '<span class="more">+' + (all.length - cap) + "</span>" : ""), nAll];
  }
  /* Mehrtägige Termine im Monatsraster: ein durchgehender Balken je Termin (an der Wochengrenze neu angesetzt).
     Bahnen (höchstens zwei) werden über das ganze Raster vergeben, damit der Balken von Tag zu Tag auf gleicher Höhe bleibt. */
  var SPANS = { lane: {}, cell: {} };
  function monthSpans(from) {
    var to = plus(from, 41), seen = {}, list = [], laneEnd = [];
    SPANS = { lane: {}, cell: {} };
    CD.list.forEach(function (e) {
      if (!(e.of > 1)) return; var key = e.id + "@" + e.occ; if (seen[key]) return; seen[key] = 1;
      var a = e.occ > from ? e.occ : from, b = e.lastDay < to ? e.lastDay : to; if (a > b) return;
      list.push({ key: key, a: a, b: b, e: e });
    });
    list.sort(function (x, y) { return x.a.localeCompare(y.a) || y.b.localeCompare(x.b); });
    // Bahnen je Wochenzeile: ein dritter Zeitraum bekommt ab der nächsten Woche einen Balken, sobald dort Platz ist
    for (var w = 0; w < 6; w++) {
      var ws = plus(from, w * 7), we = plus(ws, 6), used = [];
      list.forEach(function (x) {
        var a = x.a > ws ? x.a : ws, b = x.b < we ? x.b : we; if (a > b) return;
        var li = used.findIndex(function (z) { return z < a; }); if (li < 0) li = used.length;
        if (li > 1) return;   // mehr als zwei gleichzeitig in dieser Woche: als Punkt
        used[li] = b; SPANS.lane[x.key + "@" + ws] = li; SPANS.lane[x.key] = SPANS.lane[x.key] == null ? li : SPANS.lane[x.key];
        for (var k = a; k <= b; k = plus(k, 1)) (SPANS.cell[k] = SPANS.cell[k] || []).push({ lane: li, s: k === a, f: k === b, t: x.e.title || "", c: AREA[area(x.e)].c, key: x.key });
      });
    }
  }
  function spanHTML(k, wide) {
    return (SPANS.cell[k] || []).map(function (z) {
      return '<span class="mspan l' + z.lane + (z.s ? " s" : "") + (z.f ? " f" : "") + '" style="--c:' + z.c + '" aria-hidden="true">' + (wide && z.s ? "<em>" + esc(z.t) + "</em>" : "") + "</span>";
    }).join("");
  }
  function renderMonth(slide) {
    needData();
    var t = today(), m0 = parse(calMonth), from = gridFrom(), box = $("n-kalender"), wide = (box.clientWidth || innerWidth) >= 600;
    renderMonth.wide = wide;
    var h = '<div class="mhd"><button class="ib" data-c="mprev" aria-label="Vorheriger Monat">' + ico("chevl") + '</button><button class="mt" data-c="mpick" aria-label="' + MO[m0.getMonth()] + " " + m0.getFullYear() + ', Monat und Jahr wählen">' + MO[m0.getMonth()] + " " + m0.getFullYear() +
      '</button><button class="ib" data-c="mnext" aria-label="Nächster Monat">' + ico("chev") + "</button>" + (calMonth !== t.slice(0, 8) + "01" ? '<button class="lnk" data-c="mtoday">Heute</button>' : "") + "</div>";
    h += '<div class="mgrid' + (wide ? " wide" : "") + (slide ? " sl" + slide : "") + '" id="mgrid" role="grid" aria-label="' + MO[m0.getMonth()] + " " + m0.getFullYear() + '">' +
      '<div class="mrow mh" role="row"><span class="kw" role="columnheader">KW</span>' + ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(function (w) { return '<span role="columnheader">' + w + "</span>"; }).join("") + "</div>";
    monthSpans(from);
    for (var r = 0; r < 6; r++) {
      var ws = plus(from, r * 7);
      h += '<div class="mrow" role="row"><span class="kw" role="rowheader" aria-label="Kalenderwoche ' + kwOf(ws) + '">' + kwOf(ws) + "</span>";
      for (var i = 0; i < 7; i++) {
        var k = plus(ws, i), d = parse(k), sp = SPANS.cell[k] || [], mk = monthMarks(k, wide, sp.length ? Math.max.apply(null, sp.map(function (z) { return z.lane; })) + 1 : 0), fr = CD.free[k];
        h += '<span role="gridcell" class="mcell"><button class="mc' + (k === t ? " t" : "") + (k === calSel ? " s" : "") + (d.getMonth() !== m0.getMonth() ? " o" : "") + (i >= 5 ? " we" : "") + (fr ? " fr" : "") +
          '" data-mday="' + k + '" aria-pressed="' + (k === calSel) + '" aria-label="' + dayLabel(k, mk[1]) + (fr ? ", " + esc(fr) : "") + '"' + (fr ? ' title="' + esc(fr) + '"' : "") +
          '><span class="n">' + d.getDate() + '</span><span class="ms">' + mk[0] + "</span></button>" + spanHTML(k, wide) + "</span>";
      }
      h += "</div>";
    }
    h += '</div><div class="mfoot"><button class="lnk" data-c="legend">Legende</button></div>';
    $("cal-month").innerHTML = h;
    bindMonth($("mgrid"));
  }
  function renderGlance() { $("cal-glance").innerHTML = calSel === today() ? '<div class="grp"><header><span>Auf einen Blick</span></header>' + glance() + "</div>" : ""; }
  function renderNext() {
    needData();
    var sel = calSel, rows = CD.list.filter(function (e) { return e.date > sel && !(e.of > 1 && e.day > 1); }).map(function (e) { return { k: e.date, tm: e.time || "", t: e.title, c: AREA[area(e)].c }; })
      .concat(CD.tasks.filter(function (q) { return !q.done && q.due && q.due > sel; }).map(function (q) { return { k: q.due, tm: "", t: q.title, c: AREA.aufgabe.c, task: 1 }; }))
      .sort(function (a, b) { return (a.k + (a.tm || "~")).localeCompare(b.k + (b.tm || "~")); }).slice(0, 5);
    $("cal-next").innerHTML = '<div class="grp next"><header><span>Danach</span></header><div class="cells">' + (rows.length ? rows.map(function (x) {
      var d = parse(x.k);
      return '<button class="nd" data-day="' + x.k + '"><span class="d">' + WD[d.getDay()] + "<small>" + d.getDate() + "." + (d.getMonth() + 1) + '.</small></span><span class="l"><span style="--c:' + x.c + '"><i></i><span class="tt">' +
        (x.tm ? esc(x.tm) + " " : x.task ? "Aufgabe: " : "") + esc(x.t || "(ohne Titel)") + "</span></span></span></button>";
    }).join("") : '<div class="empty">Danach ist nichts geplant.</div>') + "</div></div>";
  }
  // Tag gewählt: Leiste, Tagesplan, Monat, Blick und Danach neu; von unten (Monat, Danach) weich nach oben zum Tagesplan
  function renderAfterPick(scrollUp) {
    renderStrip(); renderDay(); renderMonth(); renderGlance(); renderNext();
    if (scrollUp) scrollCal(0); else toMonthBtn();
  }
  var scrollBusy = 0;
  function scrollCal(y) {
    scrollBusy = Date.now() + 320;
    var el = $("n-kalender"), s = el.scrollTop, d = y - s, t0 = performance.now(), dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 250;
    if (!dur || Math.abs(d) < 2) { el.scrollTop = y; toMonthBtn(); return; }
    (function f(n) { var p = Math.min(1, (n - t0) / dur); el.scrollTop = s + d * (1 - Math.pow(1 - p, 3)); if (p < 1) requestAnimationFrame(f); else toMonthBtn(); })(t0);
  }
  // „Zum Monat“: sichtbar, solange der Tagesplan im Bild ist und das Raster nicht
  function toMonthBtn() {
    var b = $("tomonth"), el = $("n-kalender"), g = $("mgrid"), dp = $("dayplan");
    if (!b || !g || !dp || cur.v !== "kalender") { if (b) b.classList.remove("on"); return; }
    var top = el.getBoundingClientRect(), gr = g.getBoundingClientRect(), dr = dp.getBoundingClientRect();
    var gridIn = gr.top < top.bottom - 60 && gr.bottom > top.top, dayIn = dr.top < top.bottom && dr.bottom > top.top;
    b.classList.toggle("on", dayIn && !gridIn);
  }
  // Wischen (links/rechts) auf einem Element: fn(+1 | -1)
  function swipe(el, fn) {
    var x0 = 0, y0 = 0;
    el.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) < 60 || Math.abs(dy) > 50) return;
      fn(dx < 0 ? 1 : -1);
    }, { passive: true });
  }
  // Monatsraster: Tippen wählt (Klick), langer Druck (450 ms) = „Neu“ für diesen Tag, Wischen = Monat wechseln (Tag bleibt)
  var mSuppress = 0;
  function bindMonth(g) {
    var x0 = 0, y0 = 0, timer = null, down = false, fired = false;
    function start(x, y, target) {
      x0 = x; y0 = y; down = true; fired = false; clearTimeout(timer);
      var cell = target.closest && target.closest("[data-mday]");
      if (cell) timer = setTimeout(function () { if (!down) return; mSuppress = Date.now(); down = false; fired = true; setSel(cell.dataset.mday); renderAfterPick(); addSheet(); }, 450);
    }
    function move(x, y) { if (down && (Math.abs(x - x0) > 10 || Math.abs(y - y0) > 10)) clearTimeout(timer); }
    function end(x, y) {
      clearTimeout(timer); if (!down) return; down = false;
      var dx = x - x0, dy = y - y0;
      if (Math.abs(dx) >= 60 && Math.abs(dy) < 50) { mSuppress = Date.now(); monthSwipe(dx < 0 ? 1 : -1); }
    }
    g.addEventListener("touchstart", function (e) { start(e.touches[0].clientX, e.touches[0].clientY, e.target); }, { passive: true });
    g.addEventListener("touchmove", function (e) { move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    // nach langem Druck erzeugt das Loslassen keinen Klick (sonst schlösse er das eben geöffnete Blatt)
    g.addEventListener("touchend", function (e) { if (fired) { e.preventDefault(); fired = false; } end(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }, { passive: false });
    g.addEventListener("touchcancel", function () { clearTimeout(timer); down = false; }, { passive: true });
    g.addEventListener("mousedown", function (e) { if (e.button === 0) start(e.clientX, e.clientY, e.target); });
    g.addEventListener("mousemove", function (e) { move(e.clientX, e.clientY); });
    g.addEventListener("mouseup", function (e) { end(e.clientX, e.clientY); });
    g.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }
  function monthSwipe(dir) {
    var nm = shiftMonth(calMonth, dir), y = +nm.slice(0, 4), m = +nm.slice(5, 7), last = new Date(y, m, 0).getDate(), day = Math.min(+calSel.slice(8, 10), last);
    calSel = nm.slice(0, 8) + (day < 10 ? "0" : "") + day; calMonth = nm;
    renderStrip(); renderDay(); renderMonth(dir > 0 ? "l" : "r"); renderGlance(); renderNext(); toMonthBtn();
  }
  function monthPickSheet(y) {
    y = y || +calMonth.slice(0, 4);
    var cm = +calMonth.slice(5, 7) - 1, cy = +calMonth.slice(0, 4);
    sheet('<div class="mpick"><div class="mpy"><button class="ib" data-s="py" aria-label="Vorheriges Jahr">' + ico("chevl") + "</button><b>" + y + '</b><button class="ib" data-s="ny" aria-label="Nächstes Jahr">' + ico("chev") + '</button></div><div class="mpm">' +
      MO.map(function (m, i) { return '<button class="chip' + (i === cm && y === cy ? " on" : "") + '" data-s="m' + i + '">' + MS[i] + "</button>"; }).join("") + "</div></div>", function (act) {
      if (act === "py") return monthPickSheet(y - 1);
      if (act === "ny") return monthPickSheet(y + 1);
      if (act.charAt(0) === "m") { calMonth = y + "-" + pad(+act.slice(1) + 1) + "-01"; closeSheet(); renderMonth(); toMonthBtn(); }
    });
  }
  function legendSheet() {
    var list = ["training", "mobility", "atmung", "schule", "aufgabe", "notiz", "termin"];
    sheet('<h3>Legende</h3><p class="s">Farbe und Symbol zeigen den Bereich eines Eintrags.</p><div class="legend">' + list.map(function (k) {
      var A = AREA[k]; return '<div class="lg" style="--c:' + A.c + '"><span class="mb">' + ico(A.ic) + "<i></i></span><b>" + A.label + "</b></div>";
    }).join("") + '<div class="lg"><span class="lgbox t">26</span><b>Heute (Ring)</b></div><div class="lg"><span class="lgbox s">26</span><b>Gewählter Tag</b></div>' +
      '<div class="lg"><span class="lgbox fr">26</span><b>Ferien oder Feiertag</b></div><div class="lg"><span class="more">+2</span><b>weitere Einträge</b></div></div>', function () {});
  }
  function evRow(e, isToday) {
    var a = area(e), A = AREA[a], tm = e.time ? esc(e.time) + (e.end ? "<small>" + esc(e.end) + "</small>" : "") : "<small>ganztägig</small>";
    if (e.of > 1) tm = (e.time ? esc(e.time) : e.end ? "<small>bis</small>" + esc(e.end) : "") + "<small>Tag " + e.day + "/" + e.of + "</small>";
    var sub = A.label + (e.of > 1 ? " · Tag " + e.day + " von " + e.of : "") + (e.st === "done" ? " · erledigt" : e.st === "skip" ? " · ausgelassen" + (e.why ? " (" + e.why + ")" : "") : "") + (e.note && a !== "notiz" ? " · " + e.note.split("\n")[0].slice(0, 50) : "");
    return '<button class="ev' + (e.st === "done" ? " evd" : e.st === "skip" ? " skip" : "") + '" data-ev="' + e._k + '" style="--c:' + A.c + '"><span class="tm">' + tm + '</span><span class="bar"></span><span class="tx"><b>' + (e.st === "done" ? '<span class="ck1" aria-hidden="true">✓</span> ' : "") + (e.star ? '<span class="st1" aria-label="wichtig">★</span> ' : "") + esc(e.title || "(ohne Titel)") + "</b><small>" + esc(sub) + "</small></span>" +
      (A.act && isToday && !e.st ? '<span class="go" data-start="' + e._k + '">' + ico("play") + "<em>" + A.act + "</em></span>" : "") + "</button>";
  }
  function taskRow(q) {
    var late = q.due < today() && !q.done;
    return '<div class="ev' + (q.done ? " done" : "") + '" style="--c:var(--c-aufgabe)" data-task="' + q.id + '"><span class="tm"><button class="ck' + (q.done ? " on" : "") + '" data-ck="' + q.id + '" aria-label="Erledigt">' + ico("ok") + "</button></span>" +
      '<span class="bar"></span><span class="tx"><b>' + esc(q.title) + "</b><small>Aufgabe" + (late ? " · überfällig" : "") + "</small></span></div>";
  }
  // nächster wichtiger Termin (Stern) oder Prüfung aus der Schule, mit Countdown
  function nextImportant() {
    var t = today(), hit = null;
    try { hit = C().nextImportant(t, hm(nowMin())); } catch (e) {}
    if (!hit) return null;
    var n = Math.round((parse(hit.date) - parse(t)) / 864e5);
    return { date: hit.date, title: hit.title || "Termin", label: n === 0 ? "heute" : n === 1 ? "morgen" : "in " + n + " Tagen" };
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
    var ni = nextImportant(); if (ni) out.splice(Math.min(1, out.length), 0, ["termin", "star", ni.label, "Wichtig: " + ni.title, "imp:" + ni.date, "Nächster wichtiger Termin " + ni.label + ": " + ni.title]);
    var b = null; try { b = JSON.parse(localStorage.getItem("zweiminutenbibel_v2") || "null"); } catch (e) {}
    // todayDone ist in der Bibel {date, ids} (Tagesziel dailyGoal); früher ein Datum
    // wie die Bibel selbst: heute gelesen, sobald lastDate heute ist; sonst todayDone (neu {date, ids}, alt ein Datum)
    var bd = b && b.todayDone, read = !!b && (b.lastDate === today() || bd === today() || (!!bd && bd.date === today() && (bd.ids || []).length >= (b.dailyGoal || 1)));
    out.push(["bibel", "book", read ? "Gelesen ✓" : "Bibel", (b && b.streak ? "Serie " + b.streak : "heute lesen") + (b && b.plan === "hl" ? " · Bekannte Kapitel" : b && b.plan ? " · Ganze Bibel" : ""), "bibel"]);
    var w = null; try { w = JSON.parse(localStorage.getItem("sg-wissen-v1") || "null"); } catch (e) {}
    if (w && w.sum && w.sum.due) out.push(["training", "book", w.sum.due + " Karten", "Sportwissenschaft", "karten"]);
    return '<div class="glance">' + out.slice(0, out.length > 4 ? 6 : 4).map(function (x) {   // mit „wichtig“ bis zu sechs Kacheln, damit die Bibel nicht herausfällt
      return '<button class="gl" data-gl="' + x[4] + '"' + (x[5] ? ' aria-label="' + esc(x[5]) + '"' : "") + ' style="--c:var(--c-' + x[0] + ')"><i>' + ico(x[1]) + "</i><b>" + esc(x[2]) + "</b><small>" + esc(x[3]) + "</small></button>";
    }).join("") + "</div>";
  }
  window.addEventListener("resize", function () {
    if (cur.v !== "kalender" || !$("mgrid")) return;
    var w = ($("n-kalender").clientWidth || innerWidth) >= 600;
    if (w !== renderMonth.wide) renderMonth(); toMonthBtn();
  });
  setInterval(function () {
    if (document.hidden || cur.v !== "kalender") return;
    if (dayRoll()) return renderCal();
    if (calSel === today() && dayPlan.min !== nowMin() && !sheetOpen) { dayPlan.min = nowMin(); tickNow(); }   // Jetzt-Linie wandert mit
  }, 30000);
  $("n-kalender").addEventListener("scroll", function () { if (!toMonthBtn.t) toMonthBtn.t = requestAnimationFrame(function () { toMonthBtn.t = 0; toMonthBtn(); }); }, { passive: true });
  $("tomonth").addEventListener("click", function () { var el = $("n-kalender"), g = $("cal-month"); if (g) scrollCal(Math.max(0, el.scrollTop + g.getBoundingClientRect().top - el.getBoundingClientRect().top - 8)); });
  $("n-kalender").addEventListener("click", function (e) {
    // während des weichen Hochscrollens (etwa 300 ms) zählt kein Tipp – sonst trifft ein Doppeltipp, was gerade darunter gleitet
    if (Date.now() < scrollBusy) { e.preventDefault(); return; }
    var ck = e.target.closest("[data-ck]");
    if (ck) { var c = C(), q = c.tasks.list().find(function (x) { return x.id === ck.dataset.ck; }); if (q) { if (!q.done && window.SGHaptic) SGHaptic("done"); c.tasks.update(q.id, { done: !q.done }); snack(q.done ? "Wieder offen" : "Erledigt", function () { c.tasks.update(q.id, { done: q.done }); renderCal(); }); renderCal(); } return; }
    var st = e.target.closest("[data-start]"); if (st) { var it = ITEMS[st.dataset.start]; AREA[area(it)].to(it); return; }
    var ev = e.target.closest("[data-ev]"); if (ev) return evSheet(ITEMS[ev.dataset.ev]);
    var tk = e.target.closest("[data-task]"); if (tk) return go("aufgaben", null, null, { push: true });
    var md = e.target.closest("[data-mday]"); if (md) { if (Date.now() - mSuppress < 600) return; setSel(md.dataset.mday); renderAfterPick(true); return; }
    var d = e.target.closest("[data-day]"); if (d) { setSel(d.dataset.day); renderAfterPick(!!e.target.closest("#cal-next")); return; }
    var gl = e.target.closest("[data-gl]");
    if (gl) { var g = gl.dataset.gl; if (g.indexOf("imp:") === 0) { setSel(g.slice(4)); renderAfterPick(true); return; } if (g === "week") return C().weekPlan(); if (g === "bibel") return go("bibel", "lesen", null, { push: true }); if (g === "karten") return go("training", "wissen", "karten"); return go(g, null, null, { push: true }); }
    var b = e.target.closest("[data-c]"); if (!b) return;
    var a = b.dataset.c;
    if (a === "today") { setSel(today()); renderAfterPick(); }
    else if (a === "mprev" || a === "mnext") { calMonth = shiftMonth(calMonth, a === "mnext" ? 1 : -1); renderMonth(a === "mnext" ? "l" : "r"); toMonthBtn(); }
    else if (a === "mtoday") { calMonth = today().slice(0, 8) + "01"; renderMonth(); toMonthBtn(); }
    else if (a === "mpick") monthPickSheet();
    else if (a === "legend") legendSheet();
    else if (a === "new") addSheet();
    else if (a === "vlist" || a === "vgrid") { try { localStorage.setItem("sg-tagesansicht-v1", a === "vgrid" ? "grid" : "list"); } catch (x) {} renderDay(); }
    else if (a === "week") C().weekPlan();
    else if (a === "std") C().weekPlanStd();
  });
  // Eintrag antippen: Details und was man damit tun kann
  function evSheet(e) {
    var a = area(e), A = AREA[a], own = !e.ro, d = parse(e.date), isT = e.date === today();   // eigene Termine: ohne ro (Bereichs-Einträge tragen ro)
    if (a === "notiz") return noteSheet(e.noteId);
    if (e.phone) return handyEvSheet(e);
    var h = '<h3>' + (e.star ? "★ " : "") + esc(e.title) + '</h3><p class="s">' + WDL[d.getDay()] + ", " + d.getDate() + ". " + MO[d.getMonth()] + (e.of > 1 ? " · Tag " + e.day + " von " + e.of : "") + (e.time ? " · " + e.time + (e.end ? "–" + e.end : "") + " Uhr" : e.of > 1 ? "" : " · ganztägig") + " · " + esc(e.ro || A.label) +
      (e.st === "done" ? " · erledigt" + (e.auto ? " (aus dem Training)" : "") : e.st === "skip" ? " · ausgelassen" + (e.why ? ": " + esc(e.why) : "") : "") + "</p>";
    if (e.note) h += '<p class="s" style="color:var(--ink);white-space:pre-wrap">' + esc(e.note) + "</p>";
    if (A.to && e.st !== "skip") h += sRow("open", A.ic, a === "schule" ? "In Schule öffnen" : a === "atmung" ? "Atemübung öffnen" : a === "mobility" ? "Mobility starten" : "Training öffnen", "", A.c);
    // geplante Einheiten: nur diesen Eintrag verschieben, auslassen, abhaken (nie die Standardwoche)
    if (e.plan) {
      if (e.st === "done") h += sRow("open1", "back", "Wieder offen", e.auto ? "Haken entfernen, obwohl im Training eingetragen" : "Haken entfernen", "var(--muted)");
      else if (e.st === "skip") h += sRow("open1", "back", "Wieder einplanen", "", "var(--muted)");
      else {
        h += sRow("done", "ok", "Erledigt", "", "var(--c-aufgabe)");
        if (isT) h += sRow("later", "clock", "Heute später", "Andere Uhrzeit wählen", "var(--muted)");
        h += sRow("tom", "chev", isT ? "Auf morgen verschieben" : "Einen Tag später", "", "var(--muted)");
        h += sRow("day2", "cal", "Anderen Tag wählen", "", "var(--muted)");
        h += sRow("skip", "trash", isT ? "Heute auslassen" : "Auslassen", "Mit kurzem Grund, wenn du willst", "var(--muted)");
      }
    }
    if (own) h += sRow("edit", "edit", "Bearbeiten", "Zeit, Wiederholung, Erinnerung", "var(--muted)");
    if (!A.to && !own) h += sRow("day", "cal", "Im Kalender öffnen", "", "var(--muted)");
    sheet(h, function (act) {
      if (act === "later") return laterSheet(e);
      if (act === "day2") return dayPickSheet(e);
      if (act === "skip") return skipSheet(e);
      closeSheet(false, function () {
        if (act === "open") A.to(e);
        else if (act === "edit") C().editEvent(e.id, e.occ || e.date);
        else if (act === "day") C().open(e.date);
        else if (act === "done") planDo(e, { status: "done" }, "Erledigt");
        else if (act === "open1") planDo(e, { status: e.auto ? "open" : null, why: null }, e.st === "skip" ? "Wieder eingeplant" : "Wieder offen");
        else if (act === "tom") planDo(e, { date: plus(e.date, 1) }, isT ? "Auf morgen verschoben" : "Einen Tag später");
      });
    });
  }
  // Verschieben, Auslassen, Abhaken: ändert nur diesen Eintrag, Rückgängig im Hinweis
  function planDo(e, patch, msg) {
    if (patch.status === "done" && window.SGHaptic) SGHaptic("done");
    var u = C().planSet(e, patch); refresh();
    if (u) snack(msg, function () { u(); refresh(); }); else snack("Eintrag nicht gefunden");
  }
  function laterSheet(e) {
    var n = new Date(Date.now() + 30 * 60000), m = Math.ceil(n.getMinutes() / 15) * 15, d0 = new Date(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours(), m);
    var def = d0.getDate() !== new Date().getDate() ? "23:30" : pad(d0.getHours()) + ":" + pad(d0.getMinutes());
    if (e.time && e.time > def) def = e.time;
    sheet('<h3>Heute später</h3><p class="s">' + esc(e.title) + (e.time ? " · bisher " + esc(e.time) + " Uhr" : "") + '</p><label class="f"><span>Neue Uhrzeit</span><input type="time" id="plt" value="' + def + '" style="color-scheme:dark"></label>' +
      '<div class="btns"><button class="btn" data-s="x">Abbrechen</button><button class="btn p" data-s="ok">Verschieben</button></div>', function (x) {
      if (x !== "ok") return closeSheet();
      var t = $("plt").value; if (!t) return $("plt").focus();
      closeSheet(false, function () { planDo(e, { time: t }, "Auf " + t + " Uhr verschoben"); });
    });
    setTimeout(function () { try { $("plt").focus(); } catch (x) {} }, 50);
  }
  function dayPickSheet(e) {
    sheet('<h3>Anderen Tag wählen</h3><p class="s">' + esc(e.title) + '</p><label class="f"><span>Tag</span><input type="date" id="pld" value="' + plus(e.date, 1) + '" style="color-scheme:dark"></label>' +
      (e.time ? '<label class="f"><span>Uhrzeit</span><input type="time" id="plt" value="' + esc(e.time) + '" style="color-scheme:dark"></label>' : "") +
      '<div class="btns"><button class="btn" data-s="x">Abbrechen</button><button class="btn p" data-s="ok">Verschieben</button></div>', function (x) {
      if (x !== "ok") return closeSheet();
      var k = $("pld").value, t = $("plt") ? $("plt").value : ""; if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return $("pld").focus();
      var dd = parse(k), patch = { date: k }; if (t && t !== e.time) patch.time = t;
      closeSheet(false, function () { planDo(e, patch, "Auf " + WD[dd.getDay()] + " " + dd.getDate() + "." + (dd.getMonth() + 1) + ". verschoben"); });
    });
  }
  var WHY = ["krank", "Wetter", "Bahn gesperrt", "Schule", "anderes"];
  function skipSheet(e) {
    var isT = e.date === today();
    sheet('<h3>' + (isT ? "Heute auslassen" : "Auslassen") + '</h3><p class="s">' + esc(e.title) + ' · Grund (optional)</p><div class="whys" role="group" aria-label="Grund">' +
      WHY.map(function (w) { return '<button class="chip" data-s="w:' + w + '" aria-pressed="false">' + w + "</button>"; }).join("") + '</div>' +
      '<label class="f"><span>Eigener Grund (optional)</span><input type="text" id="plw" maxlength="80"></label>' +
      '<div class="btns"><button class="btn" data-s="x">Abbrechen</button><button class="btn p" data-s="ok">Auslassen</button></div>', function (x, b) {
      if (x.indexOf("w:") === 0) {
        var on = b.getAttribute("aria-pressed") !== "true";
        sheetEl.querySelectorAll('.whys .chip').forEach(function (c) { c.classList.remove("on"); c.setAttribute("aria-pressed", "false"); });
        if (on) { b.classList.add("on"); b.setAttribute("aria-pressed", "true"); }
        return;
      }
      if (x !== "ok") return closeSheet();
      var sel = sheetEl.querySelector('.whys .chip.on'), own = $("plw").value.trim(), why = own || (sel ? sel.textContent : "");
      closeSheet(false, function () { planDo(e, { status: "skip", why: why || null }, (isT ? "Heute ausgelassen" : "Ausgelassen") + (why ? " (" + why + ")" : "")); });
    });
  }
  // Termin aus dem Handykalender (nur Android-App): ändern oder löschen schreibt direkt in den Kalender des Handys
  function handyEvSheet(e) {
    var d = parse(e.date), H = C().handy;
    sheet('<h3>' + esc(e.title) + '</h3><p class="s">' + WDL[d.getDay()] + ", " + d.getDate() + ". " + MO[d.getMonth()] + (e.time ? " · " + e.time + (e.end ? "–" + e.end : "") + " Uhr" : " · ganztägig") + " · Handy: " + esc(e.calName || "Kalender") + "</p>" +
      (e.note ? '<p class="s" style="color:var(--ink);white-space:pre-wrap">' + esc(e.note) + "</p>" : "") +
      sRow("edit", "edit", "Ändern", e.phone.recurring ? "Wiederholter Termin – gilt für alle Termine der Reihe" : "Titel, Tag, Uhrzeit", "var(--muted)") +
      sRow("del", "trash", "Im Handy löschen", e.phone.recurring ? "Löscht die ganze Reihe" : "", "#e5484d"), function (act) {
      if (act === "del") {
        sheet('<h3>Termin löschen?</h3><p class="s">„' + esc(e.title) + '“ wird aus dem Kalender auf dem Handy gelöscht' + (e.phone.recurring ? " – mit allen Wiederholungen" : "") + '.</p><div class="btns"><button class="btn" data-s="no">Abbrechen</button><button class="btn p" data-s="yes">Löschen</button></div>', function (x) {
          closeSheet(); if (x === "yes") H.remove(e.phone.eventId).then(function () { refresh(); snack("Im Handy gelöscht"); });
        });
      } else if (act === "edit") {
        sheet('<h3>Termin ändern</h3><label class="f"><span>Titel</span><input type="text" id="hdt" value="' + esc(e.title) + '"></label>' +
          '<label class="f"><span>Tag</span><input type="date" id="hdd" value="' + e.date + '"></label>' +
          '<div style="display:flex;gap:8px;margin:0 16px"><label class="f" style="flex:1;margin:10px 0"><span>Von</span><input type="time" id="hds" value="' + (e.time || "") + '" style="width:100%;min-height:50px;border-radius:12px;border:1px solid var(--line);background:var(--bg);padding:12px;font-size:16px;color-scheme:dark"></label>' +
          '<label class="f" style="flex:1;margin:10px 0"><span>Bis</span><input type="time" id="hde" value="' + (e.end || "") + '" style="width:100%;min-height:50px;border-radius:12px;border:1px solid var(--line);background:var(--bg);padding:12px;font-size:16px;color-scheme:dark"></label></div>' +
          '<p class="s">Ohne Uhrzeit = ganztägig.</p><div class="btns"><button class="btn" data-s="no">Abbrechen</button><button class="btn p" data-s="ok">Speichern</button></div>', function (x) {
          if (x !== "ok") return closeSheet();
          var t = $("hdt").value.trim() || e.title, k = $("hdd").value || e.date, st = $("hds").value, en = $("hde").value, patch = { title: t };
          if (st) {
            var b = parse(k), f; b.setHours(+st.slice(0, 2), +st.slice(3, 5), 0, 0);
            if (en && en > st) { f = parse(k); f.setHours(+en.slice(0, 2), +en.slice(3, 5), 0, 0); } else f = new Date(b.getTime() + 3600e3);
            patch.start = b.getTime(); patch.end = f.getTime(); patch.allDay = false;
          }
          else { var p = k.split("-"), u = Date.UTC(+p[0], +p[1] - 1, +p[2]); patch.start = u; patch.end = u + 864e5; patch.allDay = true; }
          closeSheet(); H.update(e.phone.eventId, patch).then(function () { setSel(k); refresh(); snack("Im Handy geändert"); });
        });
      }
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
      if (act === "termin") closeSheet(false, function () { C().newEvent(calSel); });
      else if (act === "aufgabe") taskSheet();
      else if (act === "notiz") noteSheet(null, calSel);
      else if (act === "woche") closeSheet(false, function () { C().weekPlan(); });
      else if (act === "std") closeSheet(false, function () { C().weekPlanStd(); });
    });
  }
  function taskSheet(pre) {
    sheet('<h3>Neue Aufgabe</h3><label class="f"><span>Was ist zu tun?</span><input type="text" id="tq" autocomplete="off" enterkeyhint="done" value="' + esc(pre && pre.title || "") + '"></label>' +
      '<label class="f"><span>Fällig</span><input type="date" id="td" value="' + (pre ? pre.due || "" : calSel) + '"></label><div class="btns"><button class="btn" data-s="x">Abbrechen</button><button class="btn p" data-s="save">Speichern</button></div>', function (act) {
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
  // pre: Vorgabe aus der Schnelleingabe { text, at }
  function noteSheet(id, day, pre) {
    var c = C(), n = id ? c.notes.list().find(function (x) { return x.id === id; }) : null;
    var at = n ? n.at || "" : pre && pre.at || "", rem = n ? !!n.remind : true;
    var k = day || today(), quick = [["Ohne Zeit", ""], ["In 1 Std.", (function () { var d = new Date(Date.now() + 36e5); d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0); return iso(d) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()); })()], ["18:00", pAt(k, "18:00")], ["Morgen 8:00", pAt(plus(k, 1), "08:00")]];
    sheet("<h3>" + (n ? "Notiz" : "Neue Notiz") + '</h3><label class="f"><textarea id="nt" aria-label="Text">' + esc(n ? n.text : pre && pre.text || "") + "</textarea></label>" +
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

  /* ---------- Handykalender ----------
     Der Gerätekalender ist für Web-Apps gesperrt – abgeglichen wird über Kalenderdateien (offline, ohne Konto):
     App → Handy per Teilen/Datei (.ics), Handy → App per „Teilen › Planer“ (Share Target, siehe sw.js) oder Datei öffnen. */
  function fmtDay(k) { var d = parse(k); return ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + "."; }
  function ago(t) { if (!t) return "noch nie"; var d = new Date(t); return (iso(d) === today() ? "heute" : fmtDay(iso(d))) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function phoneSheet() {
    if (C().handy && C().handy.available()) return handySheet();
    var c = C(), ph = c.phone, st = ph.state(), neu = ph.pending("neu"), alle = ph.pending("alle");
    sheet('<h3>Handykalender</h3><p class="s">Abgleich mit dem Kalender auf deinem Handy – ohne Konto, auch offline. Zuletzt ins Handy: ' + ago(st.last) + ' · aus dem Handy: ' + ago(st.lastIn) + '</p>' +
      '<div class="grp"><header><span>App → Handy</span></header><div class="cells">' +
      '<button class="row" data-s="out" style="--c:var(--c-termin)"><span class="ic">' + ico("phone") + '</span><span class="tx"><b>' + (neu.length ? neu.length + (neu.length === 1 ? " neuer Termin" : " neue Termine") + " ins Handy" : "Alles übertragen") + '</b><small>' + (neu.length ? "Teilen › Samsung-Kalender (oder als Datei speichern)" : "Keine neuen oder geänderten Termine") + '</small></span></button>' +
      '<button class="row" data-s="outall" style="--c:var(--muted)"><span class="ic">' + ico("download") + '</span><span class="tx"><b>Alle ' + alle.length + ' Termine übertragen</b><small>Zum ersten Mal oder nach einem neuen Handy</small></span></button>' +
      '</div></div>' +
      '<div class="grp"><header><span>Handy → App</span></header><div class="cells">' +
      '<div class="row" style="--c:var(--c-schule);cursor:default"><span class="ic">' + ico("phone") + '</span><span class="tx"><b>Termin teilen</b><small>Im Samsung-Kalender Termin öffnen › Teilen › „Planer“ wählen – auch mehrere oder als Datei (.vcs/.ics)</small></span></div>' +
      '<button class="row" data-s="in" style="--c:var(--c-schule)"><span class="ic">' + ico("download") + '</span><span class="tx"><b>Kalenderdatei öffnen</b><small>.ics oder .vcs, z. B. exportierter Kalender</small></span></button>' +
      '</div></div>' +
      '<div class="grp"><header><span>Mit übertragen</span></header><div class="cells">' +
      toggleRow('data-o="schule"', "Schule", "Prüfungen, Schultermine, Lehrgänge", st.opt.schule) +
      toggleRow('data-o="atmung"', "Atemübungen", "geplante Übungen aus Atmung & HRV", st.opt.atmung) +
      '</div></div><p class="s">Gelöschte Termine bitte auf beiden Seiten löschen – Kalenderdateien können nur hinzufügen und ändern.</p>', function (act) {
      if (act === "out" && neu.length) sendPhone(neu);
      else if (act === "outall") sendPhone(alle);
      else if (act === "in") pickFile();
    });
    Array.prototype.forEach.call(document.querySelectorAll("#sheet [data-o]"), function (x) { x.onchange = function () { ph.setOpt(x.dataset.o, x.checked); phoneSheet(); }; });
  }
  // Android-App: echter Abgleich mit dem Kalender des Handys
  function handySheet() {
    var H = C().handy, s = H.state();
    var chk = toggleRow;
    if (!s.on) {
      sheet('<h3>Handykalender</h3><p class="s">Die App gleicht sich mit dem Kalender auf deinem Handy ab – automatisch, in beide Richtungen, auch offline:</p>' +
        '<p class="s">• Termine aus der App stehen im Handy in einem eigenen Kalender „Planer“ (ein- und ausblendbar, eigene Farbe).<br>• Termine aus deinen Handykalendern erscheinen in der App und lassen sich dort ändern oder löschen.</p>' +
        '<p class="s">Android fragt gleich, ob die App auf den Kalender zugreifen darf.</p><div class="btns"><button class="btn p" data-s="on">Abgleich einschalten</button></div>' +
        '<p class="s" style="margin-top:14px">Ohne Abgleich geht es weiter über Dateien: <a href="#" data-s="file" style="color:var(--acc)">Kalenderdatei öffnen</a></p>', function (act) {
        if (act === "file") return pickFile();
        if (act !== "on") return;
        snack("Abgleich wird eingerichtet …");
        H.enable().then(function (r) { if (r && r.error) snack(r.error); else { snack("Abgleich läuft – " + (r ? r.added + " Termine ins Handy, " + r.read + " aus dem Handy" : "fertig")); refresh(); } handySheet(); });
      });
      return;
    }
    var cals = s.cals || [], r = s.lastRes || {};
    sheet('<h3>Handykalender</h3><p class="s">' + (s.err ? '<span style="color:#e5484d">Fehler: ' + esc(s.err) + "</span><br>" : "") + "Zuletzt abgeglichen: " + ago(s.last) + (s.last ? " · " + (s.cache.events || []).length + " Termine aus dem Handy" : "") + "</p>" +
      '<div class="grp"><header><span>Ins Handy (Kalender „Planer“)</span></header><div class="cells">' +
      chk('data-h="termine"', "Termine & Wochenplanung", "alles, was du in der App einträgst", s.opt.termine) +
      chk('data-h="schule"', "Schule", "Prüfungen, Schultermine, Lehrgänge", s.opt.schule) +
      chk('data-h="stunden"', "Stundenplan", "jede Schulstunde (ohne Ferien und Feiertage)", s.opt.stunden) +
      chk('data-h="atmung"', "Atemübungen", "geplante Übungen aus Atmung & HRV", s.opt.atmung) + "</div></div>" +
      (cals.length ? '<div class="grp"><header><span>Aus dem Handy anzeigen</span></header><div class="cells">' + cals.map(function (k) {
        // per Link eingebundene Google-Kalender: auf dem Handy oft „nicht synchronisiert“ – dann kommen keine Termine an
        if (k.sync === false) return '<button class="row" data-s="sy:' + esc(k.id) + '" style="--c:#e5a04b"><span class="ic">' + ico("cloud") + '</span><span class="tx"><b>' + esc(k.name || "Kalender") + '</b><small>wird auf dem Handy nicht synchronisiert – antippen zum Einschalten</small></span></button>';
        return chk('data-c="' + esc(k.id) + '"', '<i style="display:inline-block;width:10px;height:10px;border-radius:5px;background:' + esc(k.color) + ';margin-right:8px"></i>' + esc(k.name || "Kalender"), esc(k.account || "") + (k.visible === false ? " · im Handy ausgeblendet" : ""), !s.off[k.id]);
      }).join("") + "</div></div>" : "") +
      '<p class="s">Fehlt ein Kalender, den du in Google per Link eingebunden hast? Dann unter <a href="#" data-s="abo" style="color:var(--acc)">Webkalender</a> die Adresse einfügen – die App holt ihn selbst.</p>' +
      '<div class="btns"><button class="btn" data-s="off">Abgleich aus</button><button class="btn p" data-s="now">Jetzt abgleichen</button></div>', function (act) {
      if (act === "abo") return aboSheet();
      if (act.indexOf("sy:") === 0) { snack("Schalte Synchronisieren ein …"); H.enableSync(act.slice(3)).then(function (x) { snack(x && x.error ? x.error + " – sonst im Google-Kalender: Einstellungen › Kalender › Synchronisieren" : "Eingeschaltet – Google lädt die Termine, das kann eine Minute dauern"); refresh(); handySheet(); }); return; }
      if (act === "now") { snack("Gleiche ab …"); H.sync(true).then(function (x) { snack(x && x.error ? "Fehler: " + x.error : "Abgeglichen" + (x ? " – " + (x.added + x.changed) + " ins Handy, " + x.read + " aus dem Handy" : "")); refresh(); handySheet(); }); }
      else if (act === "off") { H.disable(); refresh(); closeSheet(); snack("Abgleich aus – der Kalender „Planer“ bleibt im Handy, bis du ihn dort entfernst"); }
    });
    Array.prototype.forEach.call(document.querySelectorAll("#sheet [data-h]"), function (x) { x.onchange = function () { H.setOpt(x.dataset.h, x.checked).then(function () { refresh(); }); }; });
    Array.prototype.forEach.call(document.querySelectorAll("#sheet [data-c]"), function (x) { x.onchange = function () { H.setCal(x.dataset.c, x.checked); refresh(); }; });
  }
  /* Webkalender: per Internetadresse (.ics/webcal) eingebundene Kalender, z. B. Feiertage, Vereins- oder Schulkalender aus Google */
  function aboBadge() { var a = C() && C().abo; if (!a) return ""; var l = a.list(); if (!l.length) return ""; var bad = l.filter(function (x) { return x.err && x.err !== "offline"; }).length; return bad ? '<em class="bad">! ' + bad + "</em>" : l.length + ""; }
  function aboSheet() {
    var A = C().abo, l = A.list();
    sheet('<h3>Webkalender</h3><p class="s">Kalender, die per Link eingebunden sind (in Google „Andere Kalender › Per URL“), landen oft nicht auf dem Handy. Hier holt die App sie selbst – sie stehen danach auch offline im Kalender und werden alle 3 Stunden aufgefrischt.</p>' +
      (l.length ? '<div class="grp"><div class="cells">' + l.map(function (a) {
        var st = a.err ? (a.err === "offline" ? "offline – letzter Stand " + ago(a.at) : "Fehler: " + a.err) : a.n + " Termine · " + ago(a.at);
        return '<button class="row" data-s="a:' + a.id + '" style="--c:' + esc(a.color || "var(--c-termin)") + '"><span class="ic">' + ico("cal") + '</span><span class="tx"><b>' + esc(a.name) + (a.on ? "" : " (aus)") + "</b><small>" + esc(st) + "</small></span></button>";
      }).join("") + "</div></div>" : "") +
      '<div class="btns">' + (l.length ? '<button class="btn" data-s="all">Alle auffrischen</button>' : "") + '<button class="btn p" data-s="add">Webkalender hinzufügen</button></div>' +
      sRow("kshow", "cal", "Im Kalender zeigen", "Mobility und Atemübungen (Standard: aus)", "var(--muted)"), function (act) {
      if (act === "add") return aboAddSheet();
      if (act === "kshow") return calShowSheet();
      if (act === "all") { snack("Lade Webkalender …"); A.refresh().then(function () { snack("Aufgefrischt"); refresh(); aboSheet(); }); return; }
      if (act.indexOf("a:") === 0) aboOneSheet(act.slice(2));
    });
  }
  function aboAddSheet() {
    sheet('<h3>Webkalender hinzufügen</h3><label class="f"><span>Adresse des Kalenders</span><input type="url" id="abu" placeholder="https://… .ics oder webcal://…" autocomplete="off" inputmode="url"></label>' +
      '<label class="f"><span>Name (optional)</span><input type="text" id="abn" maxlength="60" placeholder="z. B. Verein, Feiertage"></label>' +
      '<p class="s"><b>Wo finde ich die Adresse?</b> Im Google Kalender am Computer: Einstellungen › links den Kalender wählen › „Kalender integrieren“ › „Öffentliche Adresse im iCal-Format“ (bei eigenen Kalendern: „Geheime Adresse im iCal-Format“). Bei einem per URL hinzugefügten Kalender ist es genau der Link, den du dort eingefügt hast.</p>' +
      '<div class="btns"><button class="btn" data-s="x">Abbrechen</button><button class="btn p" data-s="ok">Hinzufügen</button></div>', function (x) {
      if (x !== "ok") return aboSheet();
      var u = $("abu").value.trim(); if (!u) return $("abu").focus();
      snack("Lade Kalender …");
      C().abo.add(u, $("abn").value).then(function (r) {
        if (r.error) { snack(r.error); return; }
        snack((r.n || 0) + " Termine übernommen"); refresh(); aboSheet();
      });
    });
    setTimeout(function () { try { $("abu").focus(); } catch (e) {} }, 60);
  }
  function aboOneSheet(id) {
    var A = C().abo, a = A.list().find(function (x) { return x.id === id; }); if (!a) return aboSheet();
    sheet('<h3>' + esc(a.name) + '</h3><p class="s" style="word-break:break-all">' + esc(a.url) + "</p>" +
      '<div class="grp"><div class="cells">' + toggleRow('data-ab="on"', "Im Kalender zeigen", a.n + " Termine", a.on) + "</div></div>" +
      '<label class="f"><span>Name</span><input type="text" id="abn" maxlength="60" value="' + esc(a.name) + '"></label>' +
      '<div class="btns"><button class="btn" data-s="del">Entfernen</button><button class="btn" data-s="re">Jetzt auffrischen</button><button class="btn p" data-s="ok">Fertig</button></div>', function (x) {
      if (x === "del") { A.remove(id); refresh(); snack("Webkalender entfernt"); return aboSheet(); }
      if (x === "re") { snack("Lade …"); A.refresh(id).then(function (r) { snack(r && r.error ? r.error : "Aufgefrischt – " + (r ? r.n : 0) + " Termine"); refresh(); aboOneSheet(id); }); return; }
      var n = $("abn").value.trim(); if (n && n !== a.name) A.set(id, { name: n });
      refresh(); aboSheet();
    });
    var t = document.querySelector('#sheet [data-ab="on"]'); if (t) t.onchange = function () { A.set(id, { on: t.checked }); refresh(); };
  }
  // Android-App: Erinnerungen als echte Benachrichtigungen
  function remindSheet() {
    var R = C().erinnern, s = R.state();
    function chk(k, t, sub, on) { return toggleRow('data-r="' + k + '"', t, sub, on); }
    sheet('<h3>Erinnerungen</h3><p class="s">' + (s.on ? "An · " + (s.n || 0) + " Erinnerungen in den nächsten 14 Tagen geplant" + (s.err ? '<br><span style="color:#e5484d">Fehler: ' + esc(s.err) + "</span>" : "") : "Benachrichtigungen kommen zur richtigen Zeit – auch wenn die App geschlossen ist und ohne Internet.") + "</p>" +
      '<div class="grp"><div class="cells">' + chk("termine", "Termine & Notizen", "so viele Minuten vorher, wie beim Termin eingestellt; Notizen zum Zeitpunkt", s.opt.termine) +
      chk("training", "Training & Mobility", "zur geplanten Uhrzeit – antippen startet die Einheit", s.opt.training) + "</div></div>" +
      '<p class="s">Kommen Erinnerungen zu spät? Dann bei Android „Wecker und Erinnerungen“ für Planer erlauben: <a href="#" data-s="exact" style="color:var(--acc)">Einstellung öffnen</a></p>' +
      '<div class="btns">' + (s.on ? '<button class="btn" data-s="off">Ausschalten</button>' : "") + '<button class="btn p" data-s="' + (s.on ? "x" : "on") + '">' + (s.on ? "Fertig" : "Einschalten") + "</button></div>", function (act) {
      if (act === "on") R.enable().then(function (r) { snack(r && r.error ? r.error : "Erinnerungen an – " + (r && r.n || 0) + " geplant"); remindSheet(); renderMehr(); });
      else if (act === "off") { R.disable(); closeSheet(); renderMehr(); snack("Erinnerungen aus"); }
      else if (act === "exact") R.exactSettings();
      else closeSheet();
    });
    Array.prototype.forEach.call(document.querySelectorAll("#sheet [data-r]"), function (x) { x.onchange = function () { R.setOpt(x.dataset.r, x.checked).then(function () { renderMehr(); }); }; });
  }
  // Android-App, einmal nach Umzug bzw. „Neu anfangen“: Handykalender und Erinnerungen mit einem Tipp einschalten
  function setupSheet() {
    var c = C(); if (!c || !c.handy || !c.erinnern) return;
    sheet('<h3>Fast fertig</h3><p class="s">Zwei Dinge kann nur die Android-App – beides läuft auch offline:</p>' +
      sRow("hk", "cal", "Handykalender abgleichen", "App-Termine im Kalender „Planer“, Handytermine in der App", "var(--c-termin)") +
      sRow("er", "bell", "Erinnerungen", "Termine, Notizen, Training – auch bei geschlossener App", "#e5a04b") +
      '<div class="btns"><button class="btn" data-s="later">Später</button><button class="btn p" data-s="both">Beides einschalten</button></div><p class="s">Android fragt gleich nach den Berechtigungen. Ändern kannst du alles unter Mehr.</p>', function (act) {
      try { localStorage.setItem("sg-apk-setup", String(Date.now())); } catch (e) {}
      if (act === "later") return closeSheet();
      if (act === "hk") return handySheet();
      if (act === "er") return remindSheet();
      if (act !== "both") return;
      closeSheet(); snack("Wird eingerichtet …");
      c.handy.enable().then(function (r) {
        return c.erinnern.enable().then(function (q) {
          snack([r && r.error ? r.error : "Handykalender verbunden", q && q.error ? q.error : "Erinnerungen an"].join(" · ")); refresh();
        });
      });
    });
  }

  function sendPhone(list) {
    var c = C(), text = c.phone.ics(list), name = "planer-termine-" + today() + ".ics";
    var file = null; try { file = new File([text], name, { type: "text/calendar" }); } catch (e) {}
    function done(how) { c.phone.markSent(list); closeSheet(); snack(list.length + (list.length === 1 ? " Termin " : " Termine ") + how); }
    function save() {
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/calendar" })); a.download = name;
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
      done("gespeichert – Datei antippen und mit Kalender öffnen");
    }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: "Termine aus Planer" }).then(function () { done("geteilt"); }).catch(function (e) { if (e && e.name !== "AbortError") save(); });
    } else save();
  }
  function pickFile() {
    var inp = document.createElement("input"); inp.type = "file"; inp.accept = ".ics,.vcs,text/calendar,text/x-vcalendar";
    inp.onchange = function () { var f = inp.files && inp.files[0]; if (f) f.text().then(function (t) { importSheet(C().phone.parse(t), f.name); }); };
    inp.click();
  }
  function importSheet(list, from) {
    var c = C();
    if (!list.length) { sheet('<h3>Nichts gefunden</h3><p class="s">In ' + esc(from || "den geteilten Daten") + ' war kein Termin mit Datum. Am besten im Kalender den Termin teilen und „Als Datei“ (.vcs/.ics) wählen.</p><div class="btns"><button class="btn p" data-s="x">OK</button></div>', function () { closeSheet(); }); return; }
    sheet('<h3>' + list.length + (list.length === 1 ? " Termin" : " Termine") + ' übernehmen?</h3><p class="s">Aus ' + esc(from || "dem Handykalender") + '. Schon vorhandene werden aktualisiert, nicht doppelt angelegt.</p>' +
      '<div class="grp"><div class="cells">' + list.slice(0, 40).map(function (e) {
        return '<div class="ev" style="--c:var(--c-termin)"><span class="tm">' + (e.time ? e.time : "ganzt.") + (e.end ? "<small>" + e.end + "</small>" : "") + '</span><span class="bar"></span><span class="tx"><b>' + esc(e.title) + "</b><small>" + fmtDay(e.date) + (e.rep ? " · wiederholt" : "") + "</small></span></div>"; }).join("") +
      (list.length > 40 ? '<p class="s">… und ' + (list.length - 40) + " weitere</p>" : "") + '</div></div>' +
      '<div class="btns"><button class="btn" data-s="no">Abbrechen</button><button class="btn p" data-s="yes">Übernehmen</button></div>', function (act) {
      if (act === "no") return closeSheet();
      if (act !== "yes") return;
      var r = c.phone.apply(list); closeSheet();
      if (list.length === 1 && list[0].date) { setSel(list[0].date); if (cur.v !== "kalender") go("kalender"); }
      refresh();
      snack((r.added ? r.added + " neu" : "") + (r.added && r.updated ? ", " : "") + (r.updated ? r.updated + " aktualisiert" : "") + (!r.added && !r.updated ? "Schon alles im Kalender" : " im Kalender"));
    });
  }
  /* Android-App: Kalenderdatei direkt geöffnet („Öffnen mit Planer“) oder geteilt („Teilen › Planer“) –
     die App holt sie vom Plugin ab und zeigt gleich „N Termine übernehmen?“. */
  function nativeFiles() {
    var P = null; try { P = window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() && Capacitor.Plugins.PlanerSystem; } catch (e) {}
    if (!P || !P.takeFile) return;
    var take = function () {
      P.takeFile().then(function (f) {
        if (!f || !f.text) return;
        if (cur.v !== "kalender") go("kalender");
        setTimeout(function () { importSheet(C().phone.parse(f.text, f.name), f.name || "der Kalenderdatei"); }, 300);
      }).catch(function () {});
    };
    if (P.addListener) P.addListener("fileOpened", take);
    take();
  }
  // Geteiltes aus dem Handy (Share Target): sw.js legt es im Cache „sg-teilen“ ab und öffnet #teilen
  function takeShared() {
    if (!("caches" in window)) return;
    caches.open("sg-teilen").then(function (cache) {
      return cache.match("geteilt.json").then(function (r) {
        if (!r) return;
        return r.json().then(function (d) {
          cache.delete("geteilt.json");
          var list = [];
          (d.files || []).forEach(function (f) { list = list.concat(C().phone.parse(f.text)); });
          if (!list.length) list = C().phone.parse([d.text, d.url].filter(Boolean).join("\n"), d.title);
          importSheet(list, (d.files && d.files[0] && d.files[0].name) || "dem Handykalender");
        });
      });
    }).catch(function () {});
  }

  /* ---------- Umzug Chrome → Android-App ----------
     Die APK hat einen eigenen Speicher. Die Chrome-App schreibt alles in eine Umzugsdatei (localStorage + die Datei-Speicher
     von Bahnplan und Schule), die APK liest sie ein. Gerätebezogenes (Fehlerprotokoll, Handykalender-Merkliste) bleibt zurück. */
  var MOVE_SKIP = /^(sg-update-check|sg-update-neu|sg-diag-v1|sg-suche-v1|sg-handykalender-v1|sg-apply-on-boot:.*|sg-umzug-v1|sg-umzug-raus-v1)$/;
  var MOVE_DB = [["bahnplan", "img"], ["lernplan-dateien", "files"]], MOVE_STORES = { bahnplan: ["img"], "lernplan-dateien": ["files", "inbox"] };
  function idbAll(name, store) {
    return new Promise(function (ok) {
      var r = indexedDB.open(name); r.onerror = function () { ok([]); };
      r.onupgradeneeded = function () { try { r.transaction.abort(); } catch (e) {} ok([]); };
      r.onsuccess = function () {
        var d = r.result, out = [];
        if (!d.objectStoreNames.contains(store)) { d.close(); return ok([]); }
        var c = d.transaction(store).objectStore(store).openCursor();
        c.onsuccess = function () { var x = c.result; if (x) { out.push([x.key, x.value]); x.continue(); } else { d.close(); ok(out); } };
        c.onerror = function () { d.close(); ok(out); };
      };
    });
  }
  function enc(v) {
    if (v instanceof Blob) return new Promise(function (ok) { var f = new FileReader(); f.onload = function () { ok({ __blob: f.result, type: v.type, name: v.name || "" }); }; f.readAsDataURL(v); });
    return Promise.resolve(v);
  }
  function dec(v) {
    if (!v || !v.__blob) return v;
    var p = v.__blob.split(","), bin = atob(p[1] || ""), a = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    return v.name ? new File([a], v.name, { type: v.type }) : new Blob([a], { type: v.type });
  }
  function moveData() {
    var ls = {};
    for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (!MOVE_SKIP.test(k)) ls[k] = localStorage.getItem(k); }
    return Promise.all(MOVE_DB.map(function (x) {
      return idbAll(x[0], x[1]).then(function (rows) { return Promise.all(rows.map(function (r) { return enc(r[1]).then(function (v) { return [r[0], v]; }); })); });
    })).then(function (dbs) {
      var idb = {}; MOVE_DB.forEach(function (x, i) { if (dbs[i].length) idb[x[0] + "/" + x[1]] = dbs[i]; });
      return { format: "planer-umzug", v: 1, at: Date.now(), version: window.SGVersion || "", ls: ls, idb: idb };
    });
  }
  // mode "umzug": Datei für die Android-App; "backup": Sicherung aller Daten (gleiches Format, einspielen über Mehr › Sicherung einspielen)
  function moveOut(mode) {
    var bk = mode === "backup", nat = !!window.SGNative;
    snack(bk ? "Sicherung wird erstellt …" : "Umzugsdatei wird erstellt …");
    moveData().then(function (d) {
      var n = Object.keys(d.ls).length, text = JSON.stringify(d), name = (bk ? "planer-sicherung-" : "planer-umzug-") + today() + ".json";
      var file = null; try { file = new File([text], name, { type: "application/json" }); } catch (e) {}
      function dl() { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "application/json" })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000); }
      // erst wenn die Datei wirklich gespeichert/geteilt ist, gilt der Umzug als erledigt
      function done() { if (!bk) { try { localStorage.setItem("sg-umzug-raus-v1", String(Date.now())); } catch (e) {} } if (cur.v === "mehr") renderMehr(); }
      var size = n + " Datenbereiche" + (Object.keys(d.idb).length ? " und gespeicherte Dateien/Bilder" : "") + " (" + (text.length / 1048576).toFixed(1).replace(".", ",") + " MB)";
      sheet("<h3>" + (bk ? "Sicherung ist fertig" : "Umzugsdatei ist fertig") + '</h3><p class="s">' + size + ".</p>" +
        (bk ? '<p class="s">Bewahre die Datei an einem sicheren Ort auf (z. B. Google Drive). Zurückholen: Mehr › Sicherung einspielen.</p>'
          : '<p class="s">So geht es weiter:<br>1. Datei speichern (landet unter „Downloads“).<br>2. Android-App „Planer“ öffnen.<br>3. Beim ersten Start „Daten aus Chrome übernehmen“ antippen (oder Mehr › Daten aus Chrome übernehmen) und die Datei wählen.</p>') +
        '<div class="btns">' + (file && navigator.canShare && navigator.canShare({ files: [file] }) ? '<button class="btn" data-s="share">Teilen</button>' : "") + '<button class="btn p" data-s="save">Datei speichern</button></div>', function (act) {
        if (act === "save") { dl(); closeSheet(); done(); snack(nat ? "Gespeichert bzw. zum Teilen geöffnet: " + name : "Gespeichert unter Downloads: " + name); }
        else if (act === "share") navigator.share({ files: [file], title: bk ? "Planer-Sicherung" : "Planer-Umzug" }).then(function () { closeSheet(); done(); }).catch(function () {});
      });
    });
  }
  function moveIn(d) {
    if (!d || d.format !== "planer-umzug" || !d.ls) throw new Error("Das ist keine Umzugsdatei der App Planer.");
    // eingebettete Seiten zuerst schließen – sie speichern beim Schließen ihren alten Stand und würden die Daten sonst überschreiben
    Array.prototype.forEach.call(document.querySelectorAll("#stage iframe"), function (f) { f.remove(); }); frames = {};
    Object.keys(d.ls).forEach(function (k) { try { localStorage.setItem(k, d.ls[k]); } catch (e) {} });
    var jobs = Object.keys(d.idb || {}).map(function (key) {
      var p = key.split("/");
      return new Promise(function (ok) {
        var r = indexedDB.open(p[0]);
        // gleicher Aufbau wie in den Seiten (Version 1, alle Ablagen), sonst legen diese ihn später nicht mehr an
        r.onupgradeneeded = function () { (MOVE_STORES[p[0]] || [p[1]]).forEach(function (n) { if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n); }); };
        r.onerror = function () { ok(); };
        r.onsuccess = function () {
          var db = r.result;
          if (!db.objectStoreNames.contains(p[1])) { var v = db.version + 1; db.close(); var r2 = indexedDB.open(p[0], v); r2.onupgradeneeded = function () { r2.result.createObjectStore(p[1]); }; r2.onsuccess = function () { put(r2.result); }; r2.onerror = function () { ok(); }; return; }
          put(db);
        };
        function put(db) { var t = db.transaction(p[1], "readwrite"), st = t.objectStore(p[1]); d.idb[key].forEach(function (row) { st.put(dec(row[1]), row[0]); }); t.oncomplete = function () { db.close(); ok(); }; t.onerror = function () { db.close(); ok(); }; }
      });
    });
    return Promise.all(jobs).then(function () { localStorage.setItem("sg-umzug-v1", JSON.stringify({ at: Date.now(), from: d.version, n: Object.keys(d.ls).length })); });
  }
  // first: erster Start der APK · "restore": Sicherung einspielen (Browser und APK) · sonst: Daten aus Chrome übernehmen
  function moveInSheet(first) {
    var rs = first === "restore"; if (rs) first = false;
    sheet('<h3>' + (first ? "Willkommen in der Android-App" : rs ? "Sicherung einspielen" : "Daten aus Chrome übernehmen") + '</h3>' +
      '<p class="s">' + (rs ? "Eine Sicherung (Mehr › Alles als Datei sichern) oder Umzugsdatei wählen." : (first ? "Die Android-App hat einen eigenen Speicher. Deine Daten aus der Chrome-App holst du so herüber:<br><br>" : "") +
      '1. In Chrome die Planer-App öffnen › Mehr › „In die Android-App umziehen“ › Datei speichern.<br>2. Hier „Umzugsdatei wählen“ antippen und die Datei aus „Downloads“ nehmen.') + '</p>' +
      (first ? "" : '<p class="s">Achtung: Daten in dieser App werden durch die aus der Datei ersetzt.</p>') +
      '<div class="btns">' + (first ? '<button class="btn" data-s="fresh">Neu anfangen</button>' : "") + '<button class="btn p" data-s="pick">' + (rs ? "Datei wählen" : "Umzugsdatei wählen") + '</button></div>', function (act) {
      if (act === "fresh") { localStorage.setItem("sg-umzug-v1", JSON.stringify({ at: Date.now(), fresh: true })); setupSheet(); return; }
      if (act !== "pick") return;
      var inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
      inp.onchange = function () {
        var f = inp.files && inp.files[0]; if (!f) return;
        f.text().then(function (t) { return moveIn(JSON.parse(t)); }).then(function () {
          closeSheet(); snack("Daten übernommen – die App startet neu …"); setTimeout(function () { location.replace(location.pathname + "#kalender"); location.reload(); }, 900);
        }).catch(function (e) { snack(e && /Umzugsdatei/.test(e.message) ? e.message : "Die Datei konnte nicht gelesen werden."); });
      };
      inp.click();
    });
  }
  window.SGMove = { data: moveData, apply: moveIn, backup: function () { moveOut("backup"); } };

  /* ---------- Mehr ---------- */
  /* ---------- Mehr: nach Zweck geordnet, jede Zeile zeigt ihren Zustand ----------
   * Jeder Punkt hat genau einen Hauptort; Verknüpfungen (↗) springen dorthin. */
  var WHATSNEW = [
    ["3.9.1", ["Kalenderdateien (.ics, .vcs) direkt öffnen: Datei antippen › „Planer“ oder teilen › „Planer“ – die Termine werden gleich zum Übernehmen angezeigt"]],
    ["3.9.0", ["Neues Design „Material You“: auf Android 12+ in den Farben deines Hintergrundbilds, Leisten in passender Farbe, Systemschrift Roboto",
      "Blätter lassen sich nach unten wegziehen, kurze Vibration beim Abhaken, „Starten“ als runder Knopf",
      "Training schlanker; Handykalender: Ändern und Löschen von Handyterminen aus der App funktioniert wieder, kleinere App (3,6 MB weniger)"]],
    ["3.8.0", ["Webkalender: per Link eingebundene Google-Kalender holt die App selbst (Mehr › Webkalender); nicht synchronisierte Handykalender lassen sich einschalten",
      "Mobility und Atemübungen stehen nicht mehr jeden Tag im Kalender (einschaltbar im Webkalender-Blatt › Im Kalender zeigen)",
      "Termine über mehrere Tage, Serien an bestimmten Wochentagen, „Nur dieser / folgende / alle“", "Einheiten verschieben, auslassen, abhaken – mit Rückgängig; Wochenbilanz, freie Zeiten, Zeitraster, wichtige Termine"]],
    ["3.7.0", ["Seitenmenü statt Chip-Leisten (☰ oben links, Pfadzeile unter dem Titel)", "Training aufgeräumt: Hauptaktion oben, Kennzahlen, Karten zum Aufklappen; Laufen und Kraft getrennt",
      "Schule: „Jetzt / Nächste Stunde“, Offen · Prüfungen · Erledigt, Lernzeit und Ablage im Menü", "Lernblöcke aus dem Lernplan im Kalender, Bibel „Gelesen ✓“ in „Auf einen Blick“"]],
    ["3.6.0", ["Neue Kalender-Startseite: Wochenleiste, Tagesplan, großer Monatskalender", "Langer Druck auf einen Tag trägt etwas ein"]],
    ["3.5.0", ["Erste Android-App: Handykalender, Erinnerungen, Umzug aus Chrome"]]
  ];
  function cloudState() {
    var c = C(), st = c && c.status ? c.status() : {};
    if (!st.connected) return { val: "Aus", warn: false };
    // offline/keine Verbindung ist kein Fehler – nur echte Fehler und „länger als 7 Tage nicht gesichert“ warnen
    if (st.error && !st.offline) return { val: "Fehler", warn: true };
    if (!st.last) return { val: "noch nie", warn: false };
    return { val: "vor " + agoShort(st.last), warn: Date.now() - st.last > 7 * 864e5 };
  }
  function agoShort(t) { var m = Math.round((Date.now() - t) / 6e4); return m < 60 ? Math.max(1, m) + " Min." : m < 1440 * 2 ? Math.round(m / 60) + " Std." : Math.round(m / 1440) + " Tagen"; }
  // Warnpunkt am Tab „Mehr“, wenn die Sicherung zu alt ist oder hakt
  function mehrBadge() {
    var b = navEl.querySelector('[data-tab="mehr"]'); if (!b) return;
    var w = cloudState().warn, d = b.querySelector(".warn");
    if (w && !d) { d = document.createElement("i"); d.className = "warn"; d.setAttribute("aria-label", "Sicherung prüfen"); b.appendChild(d); }
    else if (!w && d) d.remove();
  }
  function newer(a, b) { a = String(a).split(".").map(Number); b = String(b || "0").split(".").map(Number); for (var i = 0; i < 3; i++) { if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0); } return false; }
  function umzugDone() { try { return !!(localStorage.getItem("sg-umzug-v1") || localStorage.getItem("sg-umzug-raus-v1")); } catch (e) { return true; } }
  function renderMehr() {
    var c = C(), notes = c && c.notes ? c.notes.list().filter(function (n) { return !n.done; }).length : 0;
    var open = c && c.tasks ? c.tasks.list().filter(function (q) { return !q.done; }).length : 0;
    function r(go, ic, col, t, s, val, cls) { return '<button class="row' + (cls ? " " + cls : "") + '" data-m="' + go + '" style="--c:' + col + '"><span class="ic">' + ico(ic) + '</span><span class="tx"><b>' + t + "</b><small>" + s + "</small></span>" + (val ? '<span class="val">' + val + "</span>" : "") + '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>'; }
    var link = '<span class="lnk-ic" aria-label="Verknüpfung">↗</span>';
    // Abgleich und Sicherung
    var hk = "", er = "", cl = cloudState(), nat = !!window.SGNative;
    if (c && c.handy && c.handy.available()) { var hs = c.handy.state(); hk = !hs.on ? "Aus" : hs.err ? '<em class="bad">! Fehler</em>' : "An · " + ago(hs.last); }
    else if (c && c.phone) { var ps = c.phone.state(), neu = c.phone.pending("neu").length; hk = neu ? neu + " neu" : ps.last ? "zuletzt " + ago(ps.last) : ""; }
    if (c && c.erinnern && c.erinnern.available()) { var rs = c.erinnern.state(); er = !rs.on ? "Aus" : rs.err ? '<em class="bad">! Fehler</em>' : "An · " + (rs.n || 0) + " geplant"; }
    // groß nur, solange der Umzug ansteht – im Browser nur auf Android-Geräten (sonst gibt es keine APK)
    var big = !umzugDone() && (nat || /Android/i.test(navigator.userAgent));
    var w = null; try { w = JSON.parse(localStorage.getItem("sg-wissen-v1") || "null"); } catch (e) {}
    var umz = nat ? r("umzugin", "download", "var(--c-training)", "Daten aus Chrome übernehmen", "Umzugsdatei aus der Chrome-App einlesen", "", big ? "big" : "")
      : r("umzug", "phone", "var(--c-training)", "In die Android-App umziehen", "Umzugsdatei für die APK erstellen", "", big ? "big" : "");
    var nv = window.SGNewVer; try { nv = nv || localStorage.getItem("sg-update-neu"); } catch (e) {}
    var newVer = nv && nv !== window.SGVersion && newer(nv, window.SGVersion) ? nv : "";
    $("n-mehr").firstElementChild.innerHTML =
      // Knopf im Aussehen eines Suchfelds: öffnet die Suche (dort wird getippt – keine zweite Suche, keine Tastatur-Probleme)
      '<button class="msearch" id="mehrq" data-m="suche">' + ico("search") + "<span>Einstellungen und Seiten suchen</span></button>" +
      (big ? '<div class="grp"><div class="cells">' + umz + "</div></div>" : "") +
      '<div class="grp"><header><span>Planen</span></header><div class="cells">' +
      r("aufgaben", "check", "var(--c-aufgabe)", "Aufgaben", "Heute, geplant, wichtig, erledigt", open ? open + " offen" : "") +
      r("notizen", "note", "var(--c-notiz)", "Notizen", "Ideen, optional mit Erinnerung", notes ? notes + " offen" : "") +
      r("week", "wand", "var(--c-training)", "Woche planen", "oder Standardwoche mit einem Tipp", "") + "</div></div>" +
      '<div class="grp"><header><span>Lesen und Lernen</span></header><div class="cells">' +
      r("bibel", "book", "var(--c-bibel)", "Bibel", "Abschnitt von heute, Bibliothek", "") +
      r("wissen", "star", "#5ac8fa", "Sportwissenschaft", "Lehrbuch, Karten, Quiz – Hauptort Training", (w && w.sum && w.sum.pct ? w.sum.pct + " % " : "") + link) +
      r("pause", "coffee", "#e5a04b", "Pause", "Ablenken, Wissen, Quiz", "") + "</div></div>" +
      '<div class="grp"><header><span>Abgleich und Sicherung</span></header><div class="cells">' +
      r("handy", "phone", "var(--c-termin)", "Handykalender", nat ? "Abgleich mit dem Kalender des Handys" : "Termine mit dem Handy austauschen", hk) +
      r("abo", "cal", "var(--c-termin)", "Webkalender", "per Link eingebundene Kalender (z. B. aus Google)", aboBadge()) +
      (er ? r("erinnern", "bell", "#e5a04b", "Erinnerungen", "Benachrichtigungen, auch offline", er) : "") +
      r("sync", "cloud", "#5ac8fa", "Cloud-Sicherung", "Abgleich über GitHub", cl.warn ? '<em class="bad">! ' + cl.val + "</em>" : cl.val) +
      r("backup", "download", "var(--muted)", "Sicherung als Datei", "sichern oder einspielen", "") +
      (big ? "" : umz) + "</div></div>" +
      '<div class="grp"><header><span>Darstellung und Einstellungen</span></header><div class="cells">' +
      r("design", "palette", "#8f7cf7", "Design", "Farbwelt und Glaseffekt", "") +
      r("tset", "gear", "var(--c-training)", "Training einstellen", "Ziele, Ruhetage – Hauptort Training", link) +
      (window.SGInstallEvt && !nat ? r("install", "download", "var(--muted)", "App installieren", "auf den Startbildschirm", "") : "") +
      (wideMQ.matches ? "" : toggleRow('data-m="autodw"', "Seitenmenü automatisch öffnen", "beim Wechsel zu Training, Schule …", !!M.autoDw)) + "</div></div>" +
      '<div class="grp"><header><span>Über die App</span></header><div class="cells">' +
      r("update", "download", "var(--muted)", "Version " + esc(window.SGVersion || ""), nat ? "neue Version von GitHub holen" : "Version aktualisieren", newVer ? '<em class="hi">Neu: ' + esc(newVer) + "</em>" : "") +
      r("neu", "star", "var(--muted)", "Was ist neu", "Änderungen der letzten Versionen", "") +
      r("diag", "pulse", "var(--muted)", "Fehlerprotokoll", "für die Fehlersuche am Handy", (window.SGShellDiag() || []).length || "") + "</div></div>";
    mehrBadge();
  }
  // einheitlicher Schalter (Zeile mit Schalter rechts) für Mehr und die Einstellungs-Blätter
  function toggleRow(attrs, t, sub, on) {
    return '<label class="row tgl"><span class="tx"><b>' + t + "</b>" + (sub ? "<small>" + sub + "</small>" : "") + '</span><input type="checkbox" role="switch" class="swi" ' + attrs + (on ? " checked" : "") + "></label>";
  }
  function whatsNewSheet() {
    sheet("<h3>Was ist neu</h3>" + WHATSNEW.map(function (v) { return '<p class="s"><b>Version ' + v[0] + "</b></p><ul class=\"wn\">" + v[1].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }).join("") +
      '<div class="btns"><button class="btn p" data-s="x">Fertig</button></div>', function () { closeSheet(); });
  }
  function diagSheet() {
    var l = window.SGShellDiag() || [], txt = l.map(function (x) { var d = new Date(x.at); return iso(d) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + " · " + x.t + " · " + (x.v || "") + (x.on === false ? " · offline" : ""); }).reverse().join("\n");
    sheet('<h3>Fehlerprotokoll</h3><p class="s">Hier merkt sich die App Auffälligkeiten (z. B. wenn die untere Leiste verrutscht war). Version ' + esc(window.SGVersion || "") + " · " + esc(navigator.userAgent.replace(/^.*?\(|\).*$/g, "").slice(0, 60)) + "</p>" +
      (l.length ? '<textarea class="diag" readonly>' + esc(txt) + "</textarea>" : '<p class="s">Keine Einträge – alles in Ordnung.</p>') +
      '<div class="btns">' + (l.length ? '<button class="btn" data-s="clear">Leeren</button><button class="btn p" data-s="copy">Kopieren</button>' : '<button class="btn p" data-s="x">Fertig</button>') + "</div>", function (act) {
      if (act === "clear") { try { localStorage.removeItem("sg-diag-v1"); } catch (e) {} closeSheet(); renderMehr(); snack("Protokoll geleert"); }
      else if (act === "copy") {
        var t = sheetEl.querySelector("textarea"), all = "Planer " + (window.SGVersion || "") + (window.SGNative ? " · Android-App" : " · Browser") + " · " + navigator.userAgent + "\n" + t.value;
        var fb = function () { t.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (x) {} snack(ok ? "Kopiert (ohne Kopfzeile)" : "Bitte markieren und kopieren"); };
        try { if (navigator.clipboard) navigator.clipboard.writeText(all).then(function () { snack("Kopiert"); }, fb); else fb(); } catch (e) { fb(); }
      }
      else closeSheet();
    });
  }
  $("n-mehr").addEventListener("click", function (e) {
    var b = e.target.closest("[data-m]"); if (!b || b.tagName === "INPUT") return;
    var m = b.dataset.m, c = C();
    if (m === "autodw") return;
    if (m === "kshow") return calShowSheet();
    if (m === "week") c.weekPlan();
    else if (m === "std") c.weekPlanStd();
    else if (m === "handy") phoneSheet();
    else if (m === "abo") aboSheet();
    else if (m === "wissen") go("training", "wissen");
    else if (m === "design") c.openDesign();
    else if (m === "sync") c.openSync();
    else if (m === "install") { if (window.SGInstallEvt) window.SGInstallEvt.prompt(); }
    else if (m === "erinnern") remindSheet();
    else if (m === "backup") sheet("<h3>Sicherung als Datei</h3><p class=\"s\">Alle Daten in einer Datei – zum Aufheben oder für ein neues Handy.</p>" + sRow("out", "download", "Alles als Datei sichern", "alle Daten in einer Datei", "var(--muted)") + sRow("in", "download", "Sicherung einspielen", "aus einer gesicherten Datei", "var(--muted)"), function (a) { if (a === "out") moveOut("backup"); else if (a === "in") moveInSheet("restore"); });
    else if (m === "restore") moveInSheet("restore");
    else if (m === "suche") c.palette("");
    else if (m === "umzug") moveOut("umzug");
    else if (m === "umzugin") moveInSheet(false);
    else if (m === "neu") whatsNewSheet();
    else if (m === "diag") diagSheet();
    else if (m === "update") { if (window.SGUpdate) window.SGUpdate.check(function (t) { snack(t); }); }
    else go(m, null, null, { push: true });
  });
  $("n-mehr").addEventListener("change", function (e) { if (e.target.matches('[data-m="autodw"]')) { M.autoDw = e.target.checked; saveM(); } });
  // Was der Kalender zeigt: Mobility und Atemübungen sind standardmäßig aus (jeden Tag mehrere Einträge waren zu viel)
  function calShowSheet() {
    var sh = C().calShow();
    sheet('<h3>Im Kalender zeigen</h3><p class="s">Die Übungen bleiben in Training › Mobility und Atmung. Hier legst du fest, ob sie zusätzlich jeden Tag im Kalender stehen.</p><div class="grp"><div class="cells">' +
      toggleRow('data-k="mobility"', "Mobility", "geplante Mobility-Einheiten", sh.mobility) + toggleRow('data-k="atmung"', "Atemübungen", "geplante Übungen aus Atmung & HRV", sh.atmung) +
      '</div></div><div class="btns"><button class="btn p" data-s="x">Fertig</button></div>', function () { closeSheet(); });
    Array.prototype.forEach.call(document.querySelectorAll("#sheet [data-k]"), function (x) { x.onchange = function () { C().setCalShow(x.dataset.k, x.checked); CD = null; }; });
  }
  // Zustand aktuell halten: nach jedem Sicherungslauf, bei Datenänderungen und stündlich (7-Tage-Grenze)
  addEventListener("sg-sync", function () { mehrBadge(); if (cur.v === "mehr") renderMehr(); });
  setInterval(mehrBadge, 36e5);
  // Einträge von „Mehr“ sind auch über die Suche erreichbar
  function mehrCommands() {
    var c = C(); if (!c || !c.addCommands) return setTimeout(mehrCommands, 200);
    var M_ = function (m) { return function () { go("mehr"); setTimeout(function () { var b = document.querySelector('#n-mehr [data-m="' + m + '"]'); if (b) b.click(); }, 80); }; };
    c.addCommands([["Handykalender abgleichen", "handy"], ["Webkalender abonnieren", "abo"], ["Erinnerungen einstellen", "erinnern"], ["Cloud-Sicherung", "sync"], ["Alles als Datei sichern", "backup"], ["Sicherung einspielen", "restore"],
      [window.SGNative ? "Daten aus Chrome übernehmen" : "In die Android-App umziehen", window.SGNative ? "umzugin" : "umzug"], ["Standardwoche übernehmen", "std"], ["Was ist neu", "neu"], ["Fehlerprotokoll", "diag"],
      ["Seitenmenü automatisch öffnen (Mehr)", "autodw"], ["Version und Update", "update"]].map(function (x) { return { g: "Einstellungen", label: x[0], run: x[1] === "autodw" ? function () { go("mehr"); } : M_(x[1]) }; }));
  }
  if (!window.SGSuche) mehrCommands();   // nur für die alte Palette (Rückfall)

  /* ---------- Blatt von unten, Hinweis ---------- */
  var sheetEl = $("sheet"), sheetOpen = false, sheetCb = null;
  var sheetAt = 0, shAfter = null;
  function sheet(html, cb) {
    sheetEl.querySelector(".pn").innerHTML = '<div class="hd"></div>' + html; sheetCb = cb;
    if (drawerOpen) { drawerOpen = false; drawerEl.classList.remove("on"); menuEl.setAttribute("aria-expanded", "false"); dwInert(false); history.replaceState({ app: 1, sheet: 1 }, "", location.hash); sheetOpen = true; sheetAt = Date.now(); }
    if (!sheetOpen) { history.pushState({ app: 1, sheet: 1 }, "", location.hash); sheetOpen = true; sheetAt = Date.now(); }
    sheetEl.classList.add("on");
  }
  // after: läuft erst, wenn der Verlaufseintrag des Blatts wirklich weg ist – sonst schließt das späte „Zurück“
  // ein gleich danach geöffnetes Blatt des Verbunds (Termin) wieder
  function closeSheet(fromPop, after) {
    if (!sheetOpen) { if (after) after(); return; } sheetOpen = false; sheetEl.classList.remove("on");
    if (!fromPop && history.state && history.state.sheet) { if (after) shAfter = after; history.back(); }
    else if (after) after();
  }
  // Android-Gewohnheit: Blatt am Griff (oder ganz oben) nach unten wegziehen
  (function () {
    var pn = sheetEl.querySelector(".pn"), y0 = 0, dy = 0, on = false;
    pn.addEventListener("touchstart", function (e) {
      var t = e.touches[0], top = pn.getBoundingClientRect().top;
      on = pn.scrollTop <= 0 && t.clientY - top < 56; y0 = t.clientY; dy = 0;
    }, { passive: true });
    pn.addEventListener("touchmove", function (e) {
      if (!on) return; dy = Math.max(0, e.touches[0].clientY - y0);
      pn.style.transition = "none"; pn.style.transform = dy ? "translateY(" + dy + "px)" : "";
    }, { passive: true });
    function end(close) { if (!on) return; on = false; pn.style.transition = "transform .18s"; pn.style.transform = ""; setTimeout(function () { pn.style.transition = ""; }, 200); if (close && dy > 90) closeSheet(); }
    pn.addEventListener("touchend", function () { end(true); }, { passive: true });
    pn.addEventListener("touchcancel", function () { end(false); }, { passive: true });   // Systemgeste/Benachrichtigung: nur zurücksetzen
  })();
  sheetEl.addEventListener("click", function (e) {
    // ein Tipp, der noch vom Öffnen stammt (Doppeltipp, Loslassen nach langem Druck), schließt nicht gleich wieder
    if (e.target === sheetEl) { if (Date.now() - sheetAt < 450) return; return closeSheet(); }
    var b = e.target.closest("[data-s]"); if (b && sheetCb) sheetCb(b.dataset.s, b);
  });
  var snackT = null;
  function snack(msg, undo, label) {
    var s = $("snack"); s.innerHTML = "<span>" + esc(msg) + "</span>" + (undo ? "<button>" + esc(label || "Rückgängig") + "</button>" : "");
    s.classList.add("on"); if (undo) s.querySelector("button").onclick = function () { undo(); s.classList.remove("on"); };
    clearTimeout(snackT); snackT = setTimeout(function () { s.classList.remove("on"); }, undo ? 6000 : 3500);
  }
  addEventListener("sg-update", function (e) { window.SGNewVer = e.detail; try { localStorage.setItem("sg-update-neu", e.detail); } catch (x) {} if (cur.v === "mehr") renderMehr(); snack("Version " + e.detail + " ist da.", function () { window.SGUpdate.install(function (t) { snack(t); }, e.detail); }, "Aktualisieren"); });

  /* ---------- Kopf, Plus, Suche ---------- */
  actsEl.addEventListener("click", function (e) { var b = e.target.closest("[data-act]"); if (b && b.dataset.act === "search" && C()) C().palette(); });
  fab.addEventListener("click", function () { if (cur.v === "notizen") noteSheet(null); else addSheet(); });

  /* ---------- Aktualisieren, wenn sich Daten ändern ---------- */
  function refresh() { mehrBadge(); var v = V[cur.v]; if (!v || !v.native) return; if (v.native === "kalender") renderCal(); else if (v.native === "notizen") renderNotes(); else renderMehr(); }
  addEventListener("storage", function () { clearTimeout(refresh.t); refresh.t = setTimeout(refresh, 150); });
  /* Untere Leiste absichern: Seite darf nie verschoben sein, Leiste muss im Bild stehen. Auffälligkeiten landen im
     Fehlerprotokoll (sg-diag-v1, abrufbar mit SGShellDiag()), damit man später sieht, wann und wobei es passiert ist. */
  function keepNav(why) {
    var se = document.scrollingElement || document.documentElement, moved = se.scrollTop || se.scrollLeft || document.body.scrollTop || stage.scrollTop;
    if (moved) { se.scrollTop = se.scrollLeft = 0; document.body.scrollTop = 0; stage.scrollTop = 0; }
    var r = navEl.getBoundingClientRect(), h = window.innerHeight, w = window.innerWidth, out = r.height < 40 || r.width < 40 || r.bottom > h + 2 || r.top < -2 || getComputedStyle(navEl).display === "none";
    if (moved || out) diag(why + (moved ? " verschoben" : "") + (out ? " Leiste " + Math.round(r.top) + "-" + Math.round(r.bottom) + "/" + h + "x" + w : ""));
    if (out) { navEl.style.display = "none"; void navEl.offsetHeight; navEl.style.display = ""; }
  }
  function diag(t) {
    try { var k = "sg-diag-v1", l = JSON.parse(localStorage.getItem(k) || "[]"); l.push({ at: Date.now(), t: t, v: cur.v, on: navigator.onLine }); localStorage.setItem(k, JSON.stringify(l.slice(-30))); } catch (e) {}
  }
  window.SGShellDiag = function () { try { return JSON.parse(localStorage.getItem("sg-diag-v1") || "[]"); } catch (e) { return []; } };
  ["resize", "orientationchange", "pageshow", "focus"].forEach(function (ev) { window.addEventListener(ev, function () { setTimeout(function () { keepNav(ev); }, 120); }); });
  if (window.visualViewport) visualViewport.addEventListener("resize", function () { setTimeout(function () { keepNav("viewport"); }, 120); });
  document.addEventListener("focusout", function () { setTimeout(function () { keepNav("focusout"); }, 300); }, true);
  var scT = 0; window.addEventListener("scroll", function () { if (!scT) scT = requestAnimationFrame(function () { scT = 0; keepNav("scroll"); }); }, true);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) setTimeout(function () { keepNav("zurueck"); }, 150); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { dayRoll(); refresh(); } });

  /* ---------- Suche (Vollbild) ----------
   * Findet Inhalte (Termine, Aufgaben, Notizen, Übungen, Bahnen, Schule, Bibel, Sportwissenschaft), führt Befehle aus und legt
   * mit einem Satz Einträge an (parseQuick). Ersetzt die Befehlspalette des Verbunds (SharedCalendar.setPalette) – jeder bisherige
   * Aufruf (Lupe, #befehle, Strg K) öffnet sie. Kurzbefehle: /Befehle · +neu · @Datum · ?Hilfe.
   * Verlauf und Zähler nur auf dem Gerät (sg-suche-v1, nicht in Cloud oder Umzug). */
  var SX_KEY = "sg-suche-v1", sx = null, sxEl = null;
  var SXF = [["alles", "Alles"], ["termine", "Termine"], ["aufgaben", "Aufgaben"], ["notizen", "Notizen"], ["training", "Training"], ["schule", "Schule"], ["bibel", "Bibel"], ["wissen", "Wissen"], ["befehle", "Befehle"]];
  var SXG = { befehle: ["Befehle", "wand", "var(--acc)"], termine: ["Termine", "cal", "var(--c-termin)"], aufgaben: ["Aufgaben", "check", "var(--c-aufgabe)"], notizen: ["Notizen", "note", "var(--c-notiz)"],
    training: ["Training", "run", "var(--c-training)"], schule: ["Schule", "school", "var(--c-schule)"], bibel: ["Bibel", "book", "var(--c-bibel)"], wissen: ["Sportwissenschaft", "star", "#5ac8fa"] };
  function sxStore() { try { return JSON.parse(localStorage.getItem(SX_KEY) || "{}") || {}; } catch (e) { return {}; } }
  function sxSave(o) { try { localStorage.setItem(SX_KEY, JSON.stringify(o)); } catch (e) {} }
  function sxRemember(entry, key) {
    var o = sxStore(); o.recent = (o.recent || []).filter(function (x) { return x.l !== entry.l; }); o.recent.unshift(entry); o.recent = o.recent.slice(0, 8);
    if (key) { o.count = o.count || {}; o.count[key] = (o.count[key] || 0) + 1; }
    sxSave(o);
  }
  // nach dem Wechsel in eine Seite einen Knopf darin drücken (sobald sie geladen ist)
  function fclick(path, sel) {
    var n = 0;
    (function t() {
      var f = frames[path], el = null; try { el = f && f.dataset.ready && f.contentDocument.querySelector(sel); } catch (e) {}
      if (el) return el.click();
      if (++n < 60) setTimeout(t, 150);
    })();
  }
  function toDay(k) { setSel(k); go("kalender"); renderCal(); setTimeout(function () { scrollCal(0); }, 50); }
  /* Befehlskatalog: [Gruppe, Titel, Stichwörter, Ausführen, Zustand?, Bedingung?] */
  function sxCommands() {
    var c = C(), L = [], nat = !!window.SGNative;
    function add(g, t, kw, run, st, show, id) { if (show === false) return; L.push({ kind: "befehle", g: g, t: t, kw: kw || "", run: run, st: st || "", key: "c:" + (id || t) }); }
    var t0 = today();
    add("Kalender", "Heute", "kalender start tag briefing", function () { toDay(t0); });
    add("Kalender", "Morgen", "kalender tag", function () { toDay(plus(t0, 1)); });
    add("Kalender", "Monatskalender", "monat monatsübersicht übersicht alle aller apps", function () { go("kalender"); setTimeout(function () { $("tomonth").click(); }, 80); });
    add("Kalender", "Woche planen", "wochenplanung planen training", function () { c.weekPlan(); });
    add("Kalender", "Nächste Woche planen", "wochenplanung", function () { var d = parse(t0); c.weekPlan("", plus(t0, 7 - ((d.getDay() + 6) % 7))); });
    add("Kalender", "Standardwoche übernehmen", "standard woche", function () { c.weekPlanStd(); });
    add("Kalender", "Wochenplanung: Einstellungen", "planen einstellungen", function () { c.weekPlan("settings"); });
    add("Kalender", "Neuer Termin", "anlegen eintragen", function () { c.newEvent(calSel); });
    add("Kalender", "Neue Aufgabe", "anlegen todo", function () { go("kalender"); taskSheet(); });
    add("Kalender", "Neue Notiz", "anlegen idee", function () { go("kalender"); noteSheet(null, calSel); });
    add("Kalender", "Aufgaben", "todo liste offen", function () { go("aufgaben", null, null, { push: true }); }, (c && c.tasks ? c.tasks.list().filter(function (q) { return !q.done; }).length : 0) + " offen");
    add("Kalender", "Notizen", "ideen", function () { go("notizen", null, null, { push: true }); });
    add("Training", "Training starten", "heute einheit zirkel", function () { openUrl("training/#start"); });
    add("Training", "Laufen starten (GPS)", "lauf live tracken gps puls", function () { go("training", "lauf"); fclick("training/", "#btnRunTrackStart"); });
    add("Training", "Gym starten", "kraft gerät fitnessstudio", function () { go("training", "kraft"); fclick("training/", "#btnGymStart"); });
    add("Training", "Dehnen starten", "dehnprogramm stretching 120 übungen", function () { go("training", "kraft"); fclick("training/", "#btnStretchStart"); });
    add("Training", "Rodeln vorbereiten", "aufwärmen rodeln", function () { go("training", "kraft"); fclick("training/", "#btnRodelnStart"); });
    add("Training", "Laufen", "lauf distanz", function () { go("training", "lauf"); });
    add("Training", "Kraft", "gym dehnen", function () { go("training", "kraft"); });
    add("Training", "Rodeln: Kurvenbuch", "bahn strecke bahnplan plan kurven", function () { go("training", "rodeln", "plan"); });
    add("Training", "Rodeln: Bahnen", "bahn strecke katalog", function () { go("training", "rodeln", "bahnen"); });
    add("Training", "Rodeln: Läufe und Zeiten", "bahn zeit lauf", function () { go("training", "rodeln", "laeufe"); });
    add("Training", "Rodeln: Drucken", "bahn kurvenbuch drucken buch", function () { go("training", "rodeln", "buch"); });
    add("Training", "Auswertung: Fitness", "fitness analyse wert", function () { go("training", "auswertung", "fitness"); });
    add("Training", "Auswertung: Analyse", "daten import", function () { go("training", "auswertung", "analyse"); });
    add("Training", "Auswertung: Kalender & Rückblick", "training kalender", function () { go("training", "auswertung", "rueckblick"); });
    add("Training", "Training einstellen", "einstellungen ziele ruhetage", function () { go("tset", null, null, { push: true }); });
    add("Mobility und Atmung", "Mobility Tagesblock", "mobility block dehnen", function () { go("mobility", "mobility", "heute"); });
    add("Mobility und Atmung", "Mobility Wettkampf", "vor nach dem wettkampf", function () { go("mobility", "mobility", "wettkampf"); });
    add("Mobility und Atmung", "Mobility Übungen", "mobility übungen", function () { go("mobility", "mobility", "uebungen"); });
    add("Mobility und Atmung", "Mobility Fortschritt", "mobility test", function () { go("mobility", "mobility", "fortschritt"); });
    add("Mobility und Atmung", "Atemübung starten", "atmung atem üben resonanz", function () { go("mobility", "atmung", "hrv"); });
    add("Mobility und Atmung", "Morgen-HRV messen", "atmung atem hrv puls morgen", function () { go("mobility", "atmung", "heute"); });
    add("Mobility und Atmung", "Atemplan der Woche", "atmung atem woche", function () { go("mobility", "atmung", "woche"); });
    add("Mobility und Atmung", "Atem-Verlauf", "atmung atem verlauf", function () { go("mobility", "atmung", "verlauf"); });
    add("Mobility und Atmung", "Atem 12-Wochen-Plan", "atmung atem plan", function () { go("mobility", "atmung", "plan"); });
    add("Schule", "Schultag", "schule heute stunde", function () { go("schule", "heute"); });
    add("Schule", "Stundenplan", "schule plan stunden", function () { go("schule", "plan"); });
    add("Schule", "Aufgaben und Prüfungen", "schule hausaufgaben prüfung test", function () { go("schule", "aufgaben"); });
    add("Schule", "Lernzeit", "schule lernen timer", function () { go("schule", "lernzeit"); });
    add("Schule", "Ablage", "schule dokumente scan", function () { go("schule", "ablage"); });
    add("Schule", "Lernplan", "schule lehrgang", function () { go("schule", "lernplan"); });
    add("Schule", "Schuljahr und Ferien", "schule ferien termine", function () { go("schule", "ferien"); });
    var w = null; try { w = JSON.parse(localStorage.getItem("sg-wissen-v1") || "null"); } catch (e) {}
    add("Wissen und Bibel", "Sportwissenschaft: Lesen", "buch lehrbuch wissen", function () { go("training", "wissen", "lesen"); });
    add("Wissen und Bibel", "Sportwissenschaft: Karteikarten", "karten lernen wissen", function () { go("training", "wissen", "karten"); }, w && w.sum && w.sum.due ? w.sum.due + " fällig" : "");
    add("Wissen und Bibel", "Sportwissenschaft: Quiz", "wissen fragen", function () { go("training", "wissen", "quiz"); });
    add("Wissen und Bibel", "Sportwissenschaft: Suche", "wissen buch suchen", function () { go("training", "wissen", "suche"); });
    add("Wissen und Bibel", "Bibel heute lesen", "bibel lesen heute", function () { go("bibel", "heute", null, { push: true }); });
    add("Wissen und Bibel", "Bibel weiterlesen", "bibel lesen", function () { go("bibel", "lesen", null, { push: true }); });
    add("Wissen und Bibel", "Bibel: Bibliothek", "bibel bücher alle", function () { go("bibel", "bibliothek", null, { push: true }); });
    add("Wissen und Bibel", "Bibel: Zufallsvers", "bibel vers zufall", function () { openUrl("bibel/#zufall"); });
    add("Wissen und Bibel", "Meine Bibel", "bibel favoriten notizen", function () { go("bibel", "meine", null, { push: true }); });
    add("Wissen und Bibel", "Pause starten", "pause ablenken", function () { go("pause", null, null, { push: true }); });
    if (window.SGTheme) {
      window.SGTheme.list.forEach(function (th) { add("Design", "Design: " + th.name, "farbwelt thema " + (th.info || ""), function () { window.SGTheme.set(th.id); snack("Design: " + th.name); }); });
      add("Design", "Glaseffekt " + (window.SGTheme.glass() ? "ausschalten" : "einschalten"), "glas design", function () { window.SGTheme.setGlass(!window.SGTheme.glass()); }, "", true, "glas");
    }
    add("Design", "Design wählen", "farbwelt", function () { c.openDesign(); });
    var cl = cloudState(), cst = c && c.status ? c.status() : {};
    add("Daten", cst.connected ? "Cloud jetzt sichern" : "Cloud-Sicherung einrichten", "sync synchronisieren github", function () { if (cst.connected && c.sync) { c.sync(); snack("Sichere …"); } else c.openSync(); }, cst.connected ? "zuletzt " + cl.val : "", true, "cloud");
    add("Daten", "Frühere Stände zurückholen", "sicherung wiederherstellen cloud", function () { c.openSync(); });
    add("Daten", "Alles als Datei sichern", "backup sicherung datei", function () { moveOut("backup"); });
    add("Daten", "Sicherung einspielen", "wiederherstellen datei", function () { moveInSheet("restore"); });
    add("Daten", nat ? "Daten aus Chrome übernehmen" : "In die Android-App umziehen", "umzug apk", function () { if (nat) moveInSheet(false); else moveOut("umzug"); });
    add("Daten", "Kalender als .ics exportieren", "export ics datei", function () { var x = c.phone && c.phone.ics ? c.phone.ics(c.phone.pending("alle")) : ""; if (!x) return; var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([x], { type: "text/calendar" })); a.download = "planer-kalender.ics"; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 1000); });
    add("Daten", nat ? "Handykalender jetzt abgleichen" : "Handykalender", "handy kalender abgleich", function () { if (nat && c.handy && c.handy.state().on) { c.handy.sync(true); snack("Gleiche ab …"); } else phoneSheet(); });
    if (nat && c.erinnern && c.erinnern.available()) { var on = c.erinnern.state().on; add("Daten", "Erinnerungen " + (on ? "ausschalten" : "einschalten"), "benachrichtigung", function () { if (on) { c.erinnern.disable(); snack("Erinnerungen aus"); } else remindSheet(); }, "", true, "erinnern"); }
    add("Daten", "Erinnerungen als Benachrichtigung erlauben", "benachrichtigung", function () { if (c.askNotify) c.askNotify(); }, "", !nat && "Notification" in window && Notification.permission === "default");
    add("Daten", "Planer als App installieren", "startbildschirm installieren", function () { if (window.SGInstallEvt) window.SGInstallEvt.prompt(); else if (c.install) c.install(); }, "", !nat && !(c.installed && c.installed()));
    add("Über die App", "Version aktualisieren", "update version neu", function () { if (window.SGUpdate) window.SGUpdate.check(function (x) { snack(x); }); }, window.SGVersion || "");
    add("Über die App", "Was ist neu", "neuigkeiten version", function () { whatsNewSheet(); });
    add("Über die App", "Fehlerprotokoll", "fehler diagnose log", function () { diagSheet(); });
    add("Über die App", "Mehr", "einstellungen", function () { go("mehr"); });
    return L;
  }
  /* Inhalte – erst beim Öffnen gesammelt, bei Datenänderungen neu */
  function sxContent() {
    var c = C(), out = [], t0 = today(), seen = {};
    try {
      c.allItems(plus(t0, -365), plus(t0, 365)).forEach(function (e) {
        // Serien: nur das nächste (sonst letzte) Vorkommen
        var k = e.id || e.title + e.date, prev = seen[k];
        if (prev && (prev.date >= t0 || e.date < t0)) return;
        if (prev) out.splice(out.indexOf(prev), 1);
        var a = area(e), x = { kind: a === "notiz" ? "notizen" : a === "schule" ? "schule" : /^(training|mobility|atmung)$/.test(a) ? "termine" : "termine", t: e.title, x: e.note || "", date: e.date, time: e.time,
          st: fmtDay(e.date) + (e.time ? " · " + e.time : "") + " · " + (e.ro || e.app || ""), key: "e:" + k, ic: AREA[a] ? AREA[a].ic : "cal", c: AREA[a] ? AREA[a].c : "var(--c-termin)", e: e,
          run: function () { toDay(e.date); } };
        seen[k] = x; out.push(x);
      });
    } catch (e) {}
    try { c.tasks.list().forEach(function (q) { out.push({ kind: "aufgaben", t: q.title, x: q.note || "", date: q.due, done: q.done, task: q, st: (q.done ? "erledigt" : q.due ? "fällig " + fmtDay(q.due) : "ohne Datum"), key: "t:" + q.id, run: function () { go("aufgaben", null, null, { push: true }); } }); }); } catch (e) {}
    try { c.notes.list().forEach(function (n) { out.push({ kind: "notizen", t: n.text.split("\n")[0].slice(0, 90), x: n.text, done: n.done, st: n.at ? fmtDay(n.at.slice(0, 10)) + " " + n.at.slice(11, 16) : "Notiz", key: "n:" + n.id, run: function () { go("notizen", null, null, { push: true }); setTimeout(function () { noteSheet(n.id); }, 80); } }); }); } catch (e) {}
    var D = window.SG_SUCHDATEN || {};
    (D.bahnen || []).forEach(function (b) { out.push({ kind: "training", t: b[1], x: "bahn rodeln kurvenbuch strecke " + b[2] + " " + b[3], st: "Bahn · " + b[2] + ", " + b[3], ic: "sled", key: "b:" + b[0], run: function () { go("training", "rodeln", "bahnen"); } }); });
    try { var bp = JSON.parse(localStorage.getItem("bahnplan.v1") || "null"); (bp && bp.tracks || []).forEach(function (tr) { if (tr.name) out.push({ kind: "training", t: tr.name, x: "bahn kurvenbuch meine", st: "Meine Bahn · Kurvenbuch", ic: "sled", key: "mb:" + tr.id, run: function () { go("training", "rodeln", "plan"); } }); }); } catch (e) {}
    (D.mob || []).forEach(function (m) { out.push({ kind: "training", t: m[1], x: "mobility übung " + m[2], st: "Mobility-Übung", ic: "stretch", c: "var(--c-mobility)", key: "m:" + m[0], run: function () { go("mobility", "mobility", "uebungen"); } }); });
    (D.gym || []).forEach(function (m) { out.push({ kind: "training", t: m[1], x: "gym kraft übung gerät", st: "Gym-Übung", key: "g:" + m[0], run: function () { go("training", "kraft"); } }); });
    (D.dehn || []).forEach(function (m) { out.push({ kind: "training", t: m[1], x: "dehnen dehnübung " + m[2], st: "Dehnübung · " + m[2], key: "d:" + m[0], run: function () { go("training", "kraft"); } }); });
    try {
      var db = JSON.parse(localStorage.getItem("schulkalender-bayern-v1") || "null") || {}, subj = function (id) { return (db.subjects || []).find(function (s) { return s.id === id; }) || {}; };
      (db.subjects || []).forEach(function (s) { if (s.name) out.push({ kind: "schule", t: s.name, x: "fach " + (s.room || ""), st: "Fach" + (s.room ? " · Raum " + s.room : ""), ic: "school", key: "sf:" + s.id, run: function () { go("schule", "plan"); } }); });
      (db.events || []).forEach(function (e) { if (!e.date) return; var sn = subj(e.subject).name || ""; out.push({ kind: "schule", t: (e.title || sn || "Schultermin"), x: sn + " prüfung " + (e.notes || ""), date: e.date, st: fmtDay(e.date) + (sn ? " · " + sn : ""), ic: "school", key: "se:" + e.id, run: function () { go("schule", "aufgaben"); } }); });
      (db.homework || []).forEach(function (h) { var sn = subj(h.subject).name || ""; out.push({ kind: "schule", t: h.text || "Hausaufgabe", x: sn + " hausaufgabe " + (h.notes || ""), date: h.due, done: h.done, st: (h.due ? "fällig " + fmtDay(h.due) : "Hausaufgabe") + (sn ? " · " + sn : ""), ic: "school", key: "sh:" + h.id, run: function () { go("schule", "aufgaben"); } }); });
    } catch (e) {}
    return out;
  }
  // Große Texte (Bibel, Sportwissenschaft) werden im Hintergrund geladen und durchsucht – die Oberfläche bleibt flüssig
  var sxW = null, sxJob = 0, sxCb = {};
  function sxWorker(art, q, done) {
    var job = ++sxJob;
    if (sxW == null) {
      try { sxW = new Worker("js/suche-worker.js?v=" + (window.SGVersion || "")); } catch (e) { sxW = false; }
      if (sxW) sxW.onmessage = function (ev) { var cb = sxCb[ev.data.id]; delete sxCb[ev.data.id]; if (cb) cb(ev.data.list || []); };
    }
    if (!sxW) return done([]);
    sxCb[job] = done;
    sxW.postMessage({ id: job, art: art, q: q, v: window.SGVersion || "" });
  }
  function sxBibel(q, done) {
    sxWorker("bibel", q, function (list) {
      done(list.map(function (x) { return { kind: "bibel", t: x[3] + " " + x[1] + "," + x[2], x: x[4], st: x[4].slice(0, 110), key: "bv:" + x[0] + "." + x[1] + "." + x[2], run: function () { openUrl("bibel/#stelle=" + x[0] + "." + x[1] + "." + x[2]); } }; }));
    });
  }
  function sxWissen(q, done) {
    sxWorker("wissen", q, function (list) {
      done(list.map(function (x) { return { kind: "wissen", t: x[3].slice(0, 90), st: x[2], sc: x[4], key: "w:" + x[1], run: function () { openUrl("wissen/#lesen/" + x[0] + "@" + x[1]); } }; }));
    });
  }
  /* Kurzbefehl „@…“: Datum öffnen (@24.12., @morgen, @nov) */
  function sxAtDate(s) {
    s = s.trim().toLowerCase(); if (!s) return null;
    var M3 = ["jan", "feb", "mär", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "dez"], mi = M3.indexOf(s.slice(0, 3).replace("mar", "mär"));
    if (mi >= 0 && /^[a-zä]+$/.test(s)) { var d = parse(today()), y = d.getFullYear() + (mi < d.getMonth() ? 1 : 0); return y + "-" + pad(mi + 1) + "-01"; }
    var r = window.SGQuick ? window.SGQuick.parseQuick(s, new Date()) : null;
    return r && r.date || null;
  }
  function sxRun(item, q) {
    if (!item) return;
    sxRemember({ l: item.t, q: q || "" }, item.key);
    closeSearch(false, function () { try { item.run(); } catch (e) { snack("Das ging nicht: " + e.message); } });
  }
  /* Schnelleingabe: Vorschau und Speichern */
  function sxQuick(q) {
    var force = q[0] === "+", txt = force ? q.slice(1) : q;
    if (!window.SGQuick || txt.trim().length < 2) return null;
    var r = window.SGQuick.parseQuick(txt, new Date());
    if (!force && !r.explicit && !r.date && !r.time && !r.rep) return null;
    if (!r.title) return null;
    r.kind = r.kind || (r.time || r.rep ? "termin" : "aufgabe");
    return r;
  }
  function sxSaveQuick(r, how) {
    var c = C(), kind = how || r.kind, undo = null, date = r.date || today();
    if (kind === "termin") {
      var ev = c.add({ title: r.title, date: date, time: r.time || "", end: r.end || "", remind: r.remind });
      if (ev && r.rep) c.update(ev.id, { rep: r.rep });
      if (r.remind != null && c.askNotify) c.askNotify();
      undo = function () { c.remove(ev.id); }; setSel(date);
    } else if (kind === "aufgabe") { var tk = c.tasks.add({ title: r.title, due: r.date || "" }); undo = function () { c.tasks.remove(tk.id); }; }
    else { var nt = c.notes.add({ text: r.title, at: r.date && r.time ? r.date + "T" + r.time : "", remind: r.remind != null }); undo = function () { c.notes.remove(nt.id); }; }
    sxRemember({ l: "+ " + r.title, q: "" }, "q:" + kind);
    closeSearch(); refresh(); if (cur.v === "kalender") renderCal();
    snack({ termin: "Termin", aufgabe: "Aufgabe", notiz: "Notiz" }[kind] + " gespeichert", function () { undo(); refresh(); if (cur.v === "kalender") renderCal(); });
  }
  function sxEditQuick(r, how) {
    var kind = how || r.kind, c = C();
    closeSearch(false, function () {
      if (kind === "termin") c.newEvent(r.date || today(), { title: r.title, time: r.time || "", end: r.end || "", remind: r.remind, rep: r.rep });
      else if (kind === "aufgabe") taskSheet({ title: r.title, due: r.date || "" });
      else noteSheet(null, r.date, { text: r.title, at: r.date && r.time ? r.date + "T" + r.time : "" });
    });
  }
  var REPN = { d: "täglich", w: "wöchentlich", "2w": "alle 2 Wochen", m: "monatlich", y: "jährlich" }, KN = { termin: "Termin", aufgabe: "Aufgabe", notiz: "Notiz" };
  function quickHTML(r) {
    var d = r.date ? parse(r.date) : null;
    var line = "Neue" + (r.kind === "termin" ? "r Termin" : r.kind === "aufgabe" ? " Aufgabe" : " Notiz") + (d ? " · " + WD[d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + "." : "") + (r.time ? ", " + r.time : "") + " · " + esc(r.title);
    var chips = '<label class="qc">' + ico("cal") + '<input type="date" data-q="date" value="' + (r.date || "") + '" aria-label="Datum"></label>' +
      (r.kind !== "aufgabe" ? '<label class="qc">' + ico("clock") + '<input type="time" data-q="time" value="' + (r.time || "") + '" aria-label="Uhrzeit"></label>' : "") +
      (r.kind === "termin" ? '<label class="qc">↻<select data-q="rep" aria-label="Wiederholung"><option value="">einmal</option>' + Object.keys(REPN).map(function (k) { return '<option value="' + k + '"' + (r.rep && r.rep.f === k ? " selected" : "") + ">" + REPN[k] + "</option>"; }).join("") + "</select></label>" : "");
    var other = ["termin", "aufgabe", "notiz"].filter(function (k) { return k !== r.kind; });
    return '<div class="qprev" role="group" aria-label="Schnell anlegen"><b>' + line + '</b><div class="qcs">' + chips + '</div><div class="btns"><button class="btn" data-qa="edit">Bearbeiten</button><button class="btn p" data-qa="save">Speichern</button></div>' +
      '<div class="qalt">' + other.map(function (k) { return '<button class="lnk" data-qa="as-' + k + '">als ' + KN[k] + "</button>"; }).join(" · ") + "</div></div>";
  }
  /* Ergebnisse */
  function hl(text, q) {
    var m = window.SGSuche.marks(text, q), s = String(text || ""), out = "", at = 0;
    m.forEach(function (r) { out += esc(s.slice(at, r[0])) + "<mark>" + esc(s.slice(r[0], r[1])) + "</mark>"; at = r[1]; });
    return out + esc(s.slice(at));
  }
  function rowHTML(it, q, i) {
    var g = SXG[it.kind] || SXG.befehle;
    return '<div class="sxr" data-i="' + i + '"><button class="sxm" data-i="' + i + '" style="--c:' + (it.c || g[2]) + '"><span class="ic">' + ico(it.ic || (it.kind === "befehle" ? "chev" : g[1])) + '</span><span class="tx"><b' + (it.done ? ' class="done"' : "") + ">" + hl(it.t, q) + "</b>" +
      (it.st || it.g ? "<small>" + esc([it.g, it.st].filter(Boolean).join(" · ")) + "</small>" : "") + "</span></button>" +
      (it.task ? '<button class="sxa" data-tk="' + i + '" aria-label="' + (it.task.done ? "Wieder offen" : "Erledigt") + '">' + ico(it.task.done ? "check" : "ok") + "</button>" : it.e ? '<button class="sxa" data-cal="' + i + '" aria-label="Im Kalender öffnen">' + ico("cal") + "</button>" : '<span class="sxa-c">' + ico("chev") + "</span>") + "</div>";
  }
  function prepAll(list) { list.forEach(function (it) { if (!it.p) it.p = window.SGSuche.prep(it.t, ((it.g || "") + " " + (it.kw || "") + " " + (it.x || "")).trim()); }); return list; }
  function sxCmds() { if (!sx.cmds) sx.cmds = prepAll(sxCommands()); return sx.cmds; }
  function sxSearch() {
    var q = sx.q.trim(), f = sx.f, list = [], quick = null, mode = q[0];
    var body = sxEl.querySelector(".sxb"), live = sxEl.querySelector(".sxl"), qprev = sxEl.querySelector(".sxq");
    var keep = sx.items[sx.sel] && sx.items[sx.sel].key;
    sx.items = []; sx.quick = null; sx.pending = false;
    if (!q) { qprev.innerHTML = ""; return sxEmpty(); }
    if (mode === "?") { qprev.innerHTML = ""; return sxHelp(); }
    var S = window.SGSuche, cnt = (sxStore().count || {});
    var tk = parse(today());
    function rank(it, qw, base) { var r = S.scoreP(qw, it.p), sc = r.s; if (!sc) return 0; it.fz = r.fz; sc += base || 0; sc += Math.min(30, (cnt[it.key] || 0) * 6);
      if (it.date) { var dd = Math.abs((parse(it.date) - tk) / 864e5); sc += dd === 0 ? 25 : dd < 8 ? 12 : dd > 120 ? -10 : 0; } if (it.done) sc -= 30; return Math.max(1, sc); }
    if (mode === "@") {
      var d = sxAtDate(q.slice(1)); qprev.innerHTML = "";
      if (d) list.push({ kind: "termine", t: "Kalender: " + fmtDay(d) + " öffnen", st: "Tag im Kalender", key: "at", sc: 999, run: function () { toDay(d); } });
    } else if (mode === "/") {
      var qq = S.words(q.slice(1)); qprev.innerHTML = "";
      sxCmds().forEach(function (it) { var sc = qq.length ? rank(it, qq) : 1; if (sc) { it.sc = sc; list.push(it); } });
    } else {
      // Bibelstelle („Joh 3,16“) zuerst
      var br = window.SGBibelstelle && window.SGBibelstelle.parse(q);
      if (br) list.push({ kind: "bibel", t: br.ref, st: "Bibelstelle öffnen", ic: "book", key: "br:" + br.ref, sc: 1000, run: function () { openUrl("bibel/#stelle=" + br.b + "." + br.c + (br.v ? "." + br.v : "")); } });
      // eine erkannte Bibelstelle („Römer 8:28“) ist kein Termin
      quick = br ? null : sxQuick(q);
      qprev.innerHTML = quick ? quickHTML(quick) : ""; sx.quick = quick;
      if (mode === "+") { sx.items = []; body.innerHTML = ""; live.textContent = "Neuer Eintrag"; return; }
      if (!sx.content) sx.content = prepAll(sxContent());
      var qw = S.words(q), cmdBase = f === "befehle" ? 0 : 5;
      sxCmds().forEach(function (it) { var sc = rank(it, qw, cmdBase); if (sc) { it.sc = sc; list.push(it); } });
      sx.content.forEach(function (it) { var sc = rank(it, qw); if (sc) { it.sc = sc; list.push(it); } });
      // unscharfe Treffer (Tippfehler) nur, wenn es nichts Genaues gibt
      if (list.some(function (it) { return !it.fz; })) list = list.filter(function (it) { return !it.fz; });
      // Ergebnisse aus dem Hintergrund kommen nach und werden dann eingereiht
      if (sx.wis && sx.wis.q === q) list = list.concat(sx.wis.list);
      else if (q.length >= 3 && (f === "alles" || f === "wissen")) { sx.pending = true; sxWissen(q, function (res) { if (sx && sx.q.trim() === q) { sx.wis = { q: q, list: res }; sxSearch(); } }); }
      if (sx.bib && sx.bib.q === q) list = list.concat(sx.bib.list.map(function (x) { x.sc = 5; return x; }));
      else if (q.length >= 3 && (f === "alles" || f === "bibel") || f === "bibel" && q.length >= 2) { sx.pending = true; sxBibel(q, function (res) { if (sx && sx.q.trim() === q) { sx.bib = { q: q, list: res }; sxSearch(); } }); }
    }
    if (f !== "alles") list = list.filter(function (it) { return it.kind === f; });
    list.sort(function (a, b) { return b.sc - a.sc; });
    // Gruppen: höchstens drei Zeilen (außer im Filter), Gruppe des Bereichs, aus dem die Suche kam, zuerst bei Gleichstand
    var groups = {}, order = [], home = { training: "training", mobility: "training", schule: "schule", bibel: "bibel", notizen: "notizen", aufgaben: "aufgaben" }[sx.from];
    list.forEach(function (it) { if (!groups[it.kind]) { groups[it.kind] = []; order.push(it.kind); } groups[it.kind].push(it); });
    order.sort(function (a, b) { return (groups[b][0].sc + (b === home ? 15 : 0)) - (groups[a][0].sc + (a === home ? 15 : 0)); });
    var h = "", n = 0;
    order.forEach(function (k) {
      var all = groups[k], show = f === "alles" && !sx.open[k] ? all.slice(0, 3) : all.slice(0, 80);
      h += '<div class="sxg" role="group" aria-label="' + SXG[k][0] + '"><header><span>' + SXG[k][0] + "</span>" + (all.length > show.length ? '<button class="lnk" data-more="' + k + '">Alle ' + all.length + " anzeigen</button>" : "") + "</header>";
      show.forEach(function (it) { sx.items.push(it); h += rowHTML(it, mode === "/" || mode === "@" ? q.slice(1) : q, sx.items.length - 1); n++; });
      h += "</div>";
    });
    if (!list.length && !quick) h = '<p class="sxe">Nichts gefunden. Tipp: mit „+“ vorne wird es ein neuer Eintrag, „?“ zeigt Beispiele.</p>';
    if (!list.length && !quick && q.length >= 2 && mode !== "/" && mode !== "@" && !sx.pending)
      h += '<div class="sxg"><div class="cells"><button class="row" data-new="' + esc(q) + '" style="--c:var(--c-aufgabe)"><span class="ic">' + ico("check") + '</span><span class="tx"><b>Aufgabe anlegen: ' + esc(q) + "</b><small>öffnet das Blatt zum Prüfen</small></span></button></div></div>";
    body.innerHTML = h;
    live.textContent = (list.length ? list.length + (list.length === 1 ? " Treffer" : " Treffer") : "Keine Treffer") + (quick ? ", Vorschau: neuer Eintrag" : "");
    sx.sel = 0;
    if (keep) sx.items.some(function (it, i) { if (it.key === keep) { sx.sel = i; return true; } });
    if (sx.sel) Array.prototype.forEach.call(sxEl.querySelectorAll(".sxr"), function (r) { r.classList.toggle("on", +r.dataset.i === sx.sel); });
  }
  function sxEmpty() {
    var o = sxStore(), body = sxEl.querySelector(".sxb"), h = "", cmds = sxCmds(), byKey = {};
    cmds.forEach(function (x) { byKey[x.key] = x; });
    if (o.recent && o.recent.length) h += '<div class="sxg"><header><span>Zuletzt</span><button class="lnk" data-clear="1">Löschen</button></header><div class="sxchips">' +
      o.recent.map(function (r, i) { return '<button class="chip" data-recent="' + i + '">' + esc(r.q || r.l) + "</button>"; }).join("") + "</div></div>";
    h += '<div class="sxg"><header><span>Schnell anlegen</span></header><div class="sxchips">' + [["Termin", "+Termin "], ["Aufgabe", "+Aufgabe "], ["Notiz", "+Notiz "]].map(function (x) { return '<button class="chip" data-ins="' + x[1] + '">' + x[0] + "</button>"; }).join("") +
      '<button class="chip" data-cmd="c:Woche planen">Woche planen</button></div></div>';
    var top = Object.keys(o.count || {}).filter(function (k) { return byKey[k]; }).sort(function (a, b) { return o.count[b] - o.count[a]; }).slice(0, 6);
    sx.items = top.map(function (k) { return byKey[k]; });
    if (top.length) h += '<div class="sxg"><header><span>Häufig</span></header>' + sx.items.map(function (it, i) { return rowHTML(it, "", i); }).join("") + "</div>";
    h += '<p class="sxe">Tipp: „/“ nur Befehle · „+“ neu anlegen · „@“ Datum öffnen · „?“ Beispiele</p>';
    body.innerHTML = h; sxEl.querySelector(".sxl").textContent = "Suche bereit";
  }
  function sxHelp() {
    var ex = ["Zahnarzt morgen 15 Uhr", "Mathe Hausaufgaben bis Freitag", "jeden Montag 17:30 Krafttraining", "Notiz: Kurve 9 früher einlenken", "@24.12.", "Joh 3,16", "/design graphit", "rodeln bahn", "atem"];
    sxEl.querySelector(".sxb").innerHTML = '<div class="sxg"><header><span>Beispiele – antippen fügt ein</span></header><div class="sxchips">' + ex.map(function (x) { return '<button class="chip" data-ins="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + "</div></div>" +
      '<p class="sxe">„/“ nur Befehle · „+“ neu anlegen · „@“ Datum öffnen. Tippfehler sind erlaubt (ein Fehler ab 5 Buchstaben).</p>';
    sxEl.querySelector(".sxl").textContent = "Hilfe";
  }
  function sxFit() {
    if (!sxEl) return; var vv = window.visualViewport;
    sxEl.style.height = (vv ? vv.height : innerHeight) + "px"; sxEl.style.top = (vv ? vv.offsetTop : 0) + "px";
  }
  function openSearch(text) {
    if (!sxEl) {
      sxEl = document.createElement("div"); sxEl.id = "sx"; sxEl.className = "sx"; sxEl.setAttribute("role", "dialog"); sxEl.setAttribute("aria-modal", "true"); sxEl.setAttribute("aria-label", "Suche");
      sxEl.innerHTML = '<div class="sxh"><button class="ib" data-x="1" aria-label="Suche schließen">' + ico("back") + '</button><div class="sxi">' + ico("search") +
        '<input type="search" id="sxq" placeholder="Suchen, Befehl oder „Zahnarzt morgen 15 Uhr“" autocomplete="off" autocapitalize="sentences" spellcheck="false" enterkeyhint="search" aria-label="Suchen" aria-controls="sxbody">' +
        '<button class="ib sxc" data-clr="1" aria-label="Eingabe löschen" hidden>✕</button></div></div>' +
        '<div class="sxf" role="group" aria-label="Bereich">' + SXF.map(function (x) { return '<button class="chip" data-f="' + x[0] + '">' + x[1] + "</button>"; }).join("") + "</div>" +
        '<div class="sxl" aria-live="polite"></div><div class="sxbody" id="sxbody"><div class="sxq"></div><div class="sxb"></div></div>';
      document.body.appendChild(sxEl);
      var inp = sxEl.querySelector("#sxq"), tmr = 0;
      inp.addEventListener("input", function () { sxEl.querySelector(".sxc").hidden = !inp.value; if (sx) sx.q = inp.value; clearTimeout(tmr); tmr = setTimeout(function () { if (sx) { sx.open = {}; try { sxSearch(); } catch (x) { sxFail(x); } } }, 100); });
      inp.addEventListener("keydown", function (e) {
        if (!sx) return;
        if (e.key === "Enter") {
          e.preventDefault(); clearTimeout(tmr); sx.q = inp.value; sx.open = {};
          try { sxSearch(); } catch (x) { return sxFail(x); }
          var q = sx.q.trim(), top = sx.items[sx.sel || 0];
          if (!q || q[0] === "?") return;                       // leer oder Hilfe: Enter tut nichts
          if (sx.quick && q[0] === "+") return sxSaveQuick(sx.quick);
          // ein sehr guter Treffer (Bibelstelle, ganzer Befehlsname) geht vor; sonst die Vorschau
          if (top && (top.sc >= 200 || !sx.quick)) return sxRun(top, sx.q);
          if (sx.quick) return sxSaveQuick(sx.quick);
        }
        else if (e.key === "Escape") { e.preventDefault(); closeSearch(); }
        else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); var n = sx.items.length; if (!n) return; sx.sel = (sx.sel + (e.key === "ArrowDown" ? 1 : n - 1)) % n; Array.prototype.forEach.call(sxEl.querySelectorAll(".sxr"), function (r) { r.classList.toggle("on", +r.dataset.i === sx.sel); }); }
      });
      sxEl.addEventListener("click", function (e) {
        var t = e.target.closest("button, [data-i]"); if (!t || !sx) return;
        if (t.dataset.x) return closeSearch();
        if (t.dataset.clr) { inp.value = ""; sx.q = ""; t.hidden = true; sxSearch(); return inp.focus(); }
        if (t.dataset.f) { sx.f = t.dataset.f; sx.open = {}; sxSetF(); sxSearch(); return; }
        if (t.dataset.more) { sx.f = t.dataset.more; sxSetF(); sxSearch(); return; }
        if (t.dataset.clear) { var o = sxStore(); o.recent = []; sxSave(o); return sxSearch(); }
        if (t.dataset.recent != null) { var r = (sxStore().recent || [])[+t.dataset.recent]; if (r) { inp.value = r.q || r.l; sx.q = inp.value; sxSearch(); } return; }
        if (t.dataset.ins != null) { inp.value = t.dataset.ins; sx.q = inp.value; sxEl.querySelector(".sxc").hidden = false; sxSearch(); return inp.focus(); }
        if (t.dataset.cmd) { var cm = sxCmds().find(function (x) { return x.key === t.dataset.cmd; }); return sxRun(cm, ""); }
        if (t.dataset.new != null) { var nq = t.dataset.new; return closeSearch(false, function () { go("kalender"); taskSheet({ title: nq.charAt(0).toUpperCase() + nq.slice(1), due: "" }); }); }
        if (t.dataset.qa) { var how = t.dataset.qa.replace(/^as-/, ""); if (t.dataset.qa === "save") return sxSaveQuick(sx.quick); if (t.dataset.qa === "edit") return sxEditQuick(sx.quick); return sxEditQuick(Object.assign({}, sx.quick, { kind: how }), how); }
        if (t.dataset.tk != null) { var it = sx.items[+t.dataset.tk]; if (!it.task.done && window.SGHaptic) SGHaptic("done"); C().tasks.update(it.task.id, { done: !it.task.done }); it.task.done = !it.task.done; it.done = it.task.done; sx.content = null; snack(it.done ? "Erledigt" : "Wieder offen"); return sxSearch(); }
        if (t.dataset.cal != null) { var ev = sx.items[+t.dataset.cal]; sxRemember({ l: ev.t, q: sx.q }, ev.key); return closeSearch(false, function () { toDay(ev.date); }); }
        if (t.dataset.i != null) return sxRun(sx.items[+t.dataset.i], sx.q);
      });
      // Vorschau korrigieren: Datum, Zeit, Wiederholung
      sxEl.addEventListener("change", function (e) {
        var k = e.target.dataset.q; if (!k || !sx || !sx.quick) return;
        if (k === "rep") sx.quick.rep = e.target.value ? { f: e.target.value } : null; else sx.quick[k] = e.target.value || null;
        if (k === "time" && sx.quick.time && sx.quick.kind === "aufgabe") sx.quick.kind = "termin";
        sxEl.querySelector(".sxq").innerHTML = quickHTML(sx.quick);
      });
      if (window.visualViewport) { visualViewport.addEventListener("resize", sxFit); visualViewport.addEventListener("scroll", sxFit); }
      C().onChange(function () { if (!sx) return; sx.content = null; sx.cmds = null; clearTimeout(sx.ct); sx.ct = setTimeout(function () { if (sx && document.activeElement !== null) { try { sxSearch(); } catch (x) {} } }, 300); });
    }
    if (sx) { var i0 = sxEl.querySelector("#sxq"); if (text != null) { i0.value = text; sx.q = text; sxSearch(); } i0.focus(); return; }
    var from = cur.v; sxFrom = document.activeElement;
    sx = { q: text || "", f: "alles", items: [], sel: 0, open: {}, from: from, content: null, cmds: null, bib: null, wis: null, quick: null };
    sxSetF();
    var inp2 = sxEl.querySelector("#sxq"); inp2.value = sx.q; sxEl.querySelector(".sxc").hidden = !sx.q;
    sxEl.classList.add("on"); sxFit(); sxInert(true);
    if (drawerOpen) closeDrawer();
    history.pushState({ app: 1, sx: 1 }, "", location.hash);
    sxSearch();
    setTimeout(function () { inp2.focus(); }, 30);
  }
  function sxSetF() { Array.prototype.forEach.call(sxEl.querySelectorAll(".sxf [data-f]"), function (b) { var on = b.dataset.f === sx.f; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); }); }
  var sxFrom = null;
  function sxInert(on) { [topEl, chipsEl, stage, navEl].forEach(function (x) { if (on) x.setAttribute("inert", ""); else x.removeAttribute("inert"); }); }
  // Fehler in der Suche: zurück zur alten Befehlspalette (ganz schließen, Verlauf aufräumen)
  function sxFail(x) {
    diag("Suche: " + (x && x.message)); var q = sx ? sx.q : "";
    closeSearch(false, function () { var c = C(); c.setPalette(null); c.palette(q); });
  }
  // after: Aktion nach dem Schließen – erst wenn der Verlaufseintrag der Suche weg ist (sonst landet die Navigation im falschen Eintrag)
  function closeSearch(fromPop, after) {
    if (!sx) { if (after) after(); return; } sx = null; sxJob++;
    sxEl.classList.remove("on"); sxEl.querySelector("#sxq").blur(); sxInert(false);
    var back = sxFrom && sxFrom.isConnected && !sxFrom.closest("[inert]") ? sxFrom : actsEl.querySelector("[data-act=search]"); if (back && !after) back.focus({ preventScroll: true });
    if (!fromPop && history.state && history.state.sx) { sxAfter = after || function () {}; history.back(); }
    else if (after) after();
  }
  var sxAfter = null;
  window.SGShellSearch = { open: openSearch, close: closeSearch, isOpen: function () { return !!sx; } };

  /* ---------- Start ---------- */
  navEl.innerHTML = TABS.map(function (t) { return '<button data-tab="' + t[0] + '"><span class="pill">' + ico(t[2]) + "</span>" + t[1] + "</button>"; }).join("");
  // Offline-Speicher für die ganze App (Service Worker liegt in /planer/, gilt für alle Seiten)
  // (in der APK liegen die Dateien in der App – dort kein Service Worker)
  if (!window.SGNative && "serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("../sw.js", { scope: "../" }).catch(function () {});
  function start() {
    if (!C()) return setTimeout(start, 30);
    C().onChange(function () { clearTimeout(refresh.t); refresh.t = setTimeout(refresh, 100); });
    // neue Vollbild-Suche statt der Befehlspalette (fällt sie aus, bleibt die alte als Rückfall)
    nativeFiles();
    if (C().setSnack) C().setSnack(function (t, fn) { snack(t, function () { fn(); refresh(); }); });   // Rückgängig auch aus dem Terminblatt
    if (C().setPalette && window.SGSuche) C().setPalette(function (text) { try { openSearch(text); } catch (e) { if (sx) sxFail(e); else { diag("Suche: " + e.message); C().setPalette(null); C().palette(text); } } });
    if (location.hash.length > 1) fromHash(); else { history.replaceState({ app: 1 }, "", "#kalender"); render(); }
    if (window.SGNative && !localStorage.getItem("sg-umzug-v1")) setTimeout(function () { moveInSheet(true); }, 600);
    else if (window.SGNative && !localStorage.getItem("sg-apk-setup")) setTimeout(setupSheet, 900);
    // im Leerlauf die wichtigsten Bereiche vorladen – dann wechseln sie sofort
    var pre = ["training/", "training/mobility/", "training/atmung/", "schule/"], i = 0;
    (function next() {
      if (i >= pre.length) return;
      setTimeout(function () { if (!document.hidden && !frames[pre[i]]) frame(pre[i]); i++; next(); }, i ? 2500 : 3500);
    })();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
