/* Als App installieren – eigenständig, ohne Kalender und Cloud (für die Bibel).
 * Das Installations-Ereignis fängt der Design-Block im Kopf ab (window.SGInstallEvt). */
(function () {
  "use strict";
  if (window.SGInstall) return;
  var B = "/" + (location.pathname.split("/")[1] || "") + "/";
  var KEY = "sg-install-later:bibel";
  function installed() {
    try { return window.SGInstalled || matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: minimal-ui)").matches || navigator.standalone === true; } catch (e) { return false; }
  }
  var box = document.createElement("div");
  box.id = "sgInstallBar";
  var st = document.createElement("style");
  st.textContent = "#sgInstallBar .ib{position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:9000;max-width:520px;margin:0 auto;" +
    "background:var(--surface);color:var(--ink);border:1px solid var(--line-strong,var(--line));border-radius:14px;padding:12px 14px;box-shadow:0 10px 30px rgba(0,0,0,.45);" +
    "display:grid;grid-template-columns:40px minmax(0,1fr);gap:4px 12px;align-items:center;font-family:var(--sans)}" +
    "#sgInstallBar .ic{width:40px;height:40px;border-radius:11px;background:var(--accent);color:var(--bg);display:flex;align-items:center;justify-content:center;font-size:20px}" +
    "#sgInstallBar b{display:block;font-size:.92rem}#sgInstallBar small{display:block;font-size:.78rem;color:var(--muted);line-height:1.35}" +
    "#sgInstallBar .ia{grid-column:1/-1;display:flex;justify-content:flex-end;gap:6px}" +
    "#sgInstallBar button{border:0;border-radius:9px;padding:9px 14px;font:600 .85rem var(--sans);cursor:pointer;background:transparent;color:var(--muted)}" +
    "#sgInstallBar button.go{background:var(--accent);color:var(--bg)}" +
    "#sgInstallBar ol{grid-column:1/-1;margin:4px 0 0;padding-left:18px;font-size:.8rem;color:var(--muted);line-height:1.5}" +
    "@media(min-width:1001px){#sgInstallBar .ib{left:auto;right:20px;bottom:20px;max-width:400px}}";
  var help = false;
  function render() {
    var later = 0; try { later = +localStorage.getItem(KEY) || 0; } catch (e) {}
    var show = !installed() && (help || (window.SGInstallEvt && Date.now() - later > 7 * 864e5));
    if (!show) { box.innerHTML = ""; return; }
    box.innerHTML = "<div class='ib' role='dialog' aria-label='Planer installieren'><span class='ic'>📖</span><div><b>Planer als App installieren</b><small>Planer, Training und Bibel in einer App – startet schneller, läuft offline.</small></div>" +
      (help && !window.SGInstallEvt ? "<ol><li><b>Chrome:</b> oben rechts ⋮ → „App installieren“ (oder „Zum Startbildschirm hinzufügen“).</li><li><b>Samsung Internet:</b> unten ≡ → „Seite hinzufügen zu“ → „Apps-Bildschirm“.</li></ol>" : "") +
      "<div class='ia'><button data-i='later'>" + (help && !window.SGInstallEvt ? "Schließen" : "Später") + "</button>" + (window.SGInstallEvt ? "<button class='go' data-i='go'>Installieren</button>" : "") + "</div></div>";
  }
  function prompt() {
    var e = window.SGInstallEvt;
    if (!e) { help = true; render(); return Promise.resolve(false); }
    window.SGInstallEvt = null; help = false;
    e.prompt();
    return e.userChoice.then(function (r) {
      if (r && r.outcome === "accepted") window.SGInstalled = true;
      render(); window.dispatchEvent(new Event("sg-install")); return !!(r && r.outcome === "accepted");
    }).catch(function () { render(); return false; });
  }
  box.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-i]"); if (!b) return;
    if (b.dataset.i === "go") prompt();
    else { help = false; try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} render(); }
  });
  window.SGInstall = { available: function () { return !!window.SGInstallEvt; }, installed: installed, prompt: prompt };
  window.addEventListener("sg-install", render);
  function mount() { document.head.appendChild(st); document.body.appendChild(box); render(); }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
/* App-Wechsler und Befehle für die Bibel (ohne Kalender und Cloud) – gleiche Bedienung wie in Planer und Training */
(function () {
  "use strict";
  var B = "/" + (location.pathname.split("/")[1] || "") + "/";
  if (window.self !== window.top || window.SGSwitch) return;
  window.SGSwitch = true;
  var APPS = [["planer", "Planer", B + ""], ["training", "Training", B + "training/"], ["bibel", "Bibel", B + "bibel/"]];
  var st = document.createElement("style");
  st.textContent = ".sgappb{position:fixed;z-index:41;top:calc(env(safe-area-inset-top,0px) + 9px);right:12px;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.1);color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;" +
    "background:color-mix(in srgb,var(--surface) 72%,transparent);-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);box-shadow:0 8px 28px rgba(0,0,0,.45)}.sgappb svg{width:20px;height:20px}" +
    ".sgappm{position:fixed;z-index:9400;width:300px;max-width:calc(100vw - 16px);padding:6px;border-radius:20px;display:none;flex-direction:column;gap:6px;font-family:var(--sans);" +
    "background:color-mix(in srgb,var(--bg) 74%,transparent);-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);border:1px solid rgba(255,255,255,.1);box-shadow:0 18px 50px rgba(0,0,0,.55)}" +
    ".sgappm.on{display:flex}.sgappm .mg{display:flex;flex-direction:column;background:rgba(255,255,255,.05);border-radius:14px;overflow:hidden}" +
    ".sgappm .mr{display:flex;align-items:center;gap:12px;padding:9px 12px;border:0;background:none;color:var(--ink);text-align:left;cursor:pointer;min-height:48px;font:inherit}.sgappm .mr+.mr{border-top:1px solid rgba(255,255,255,.07)}" +
    ".sgappm .mi{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;flex:none}.sgappm .mi svg{width:18px;height:18px}" +
    ".sgappm .mt{flex:1;display:flex;flex-direction:column}.sgappm .mt b{font-size:15px;font-weight:600}.sgappm .mt small{font-size:12.5px;color:var(--muted)}.sgappm .ck{color:var(--accent-bright)}.sgappm kbd{font:12px inherit;color:var(--muted)}" +
    ".sgpal{position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.35);display:flex;justify-content:center;align-items:flex-start;padding:calc(60px + env(safe-area-inset-top,0px)) 12px 12px;font-family:var(--sans)}" +
    ".sgpal .pp{width:100%;max-width:600px;max-height:76vh;display:flex;flex-direction:column;border-radius:22px;overflow:hidden;background:color-mix(in srgb,var(--bg) 80%,transparent);-webkit-backdrop-filter:blur(30px) saturate(170%);backdrop-filter:blur(30px) saturate(170%);border:1px solid rgba(255,255,255,.1);box-shadow:0 20px 60px rgba(0,0,0,.5)}" +
    ".sgpal input{border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--ink);font:17px var(--sans);padding:16px 18px;outline:none}" +
    ".sgpal .ll{overflow:auto;padding:6px}.sgpal .g{font-size:12px;font-weight:600;color:var(--muted);padding:10px 12px 4px}" +
    ".sgpal .it{padding:10px 12px;border-radius:12px;font-size:15px;color:var(--ink);cursor:pointer}.sgpal .it.on{background:rgba(255,255,255,.1)}";
  function cmds() {
    var L = [], add = function (g, label, url) { L.push({ g: g, label: label, url: url }); };
    add("Apps", "Planer öffnen", B + ""); add("Apps", "Training öffnen", B + "training/");
    add("Bibel", "Heute lesen", "#lesen"); add("Bibel", "Bibliothek (alle Bücher)", "#bibliothek"); add("Bibel", "Zufallsvers", "#zufall"); add("Bibel", "Meine Bibel: Favoriten, Notizen", "#meinebibel"); add("Bibel", "Einstellungen", "#mehr");
    add("Planer", "Heute (Briefing)", B + "#brief"); add("Planer", "Kalender", B + "#cal"); add("Planer", "Aufgaben", B + "#tasks"); add("Planer", "Schule", B + "#schule"); add("Planer", "Pause starten", B + "#pause"); add("Planer", "Woche planen", B + "#wochenplanung");
    add("Training", "Training starten", B + "training/#start"); add("Training", "Mobility-Block", B + "training/#mobility"); add("Training", "Atemübung starten", B + "training/#atmung/train"); add("Training", "Morgen-HRV messen", B + "training/#atmung");
    if (window.SGTheme) {
      SGTheme.list.forEach(function (t) { L.push({ g: "Design", label: "Design: " + t.name + " – " + t.info, run: function () { SGTheme.set(t.id); } }); });
      L.push({ g: "Design", label: "Glaseffekt " + (SGTheme.glass() ? "ausschalten" : "einschalten"), run: function () { SGTheme.setGlass(!SGTheme.glass()); } });
    }
    if (window.SGInstall && !SGInstall.installed()) L.push({ g: "App", label: "Bibel als App installieren", run: function () { SGInstall.prompt(); } });
    return L;
  }
  var pal = null;
  function run(c) { close(); if (c.run) c.run(); else if (c.url.charAt(0) === "#") location.hash = c.url; else location.href = c.url; }
  function close() { if (pal) { pal.el.remove(); pal = null; } }
  function open() {
    if (pal) return;
    var el = document.createElement("div"); el.className = "sgpal";
    el.innerHTML = "<div class='pp'><input placeholder='Befehl oder App suchen …' autocomplete='off'><div class='ll'></div></div>";
    document.body.appendChild(el); pal = { el: el, i: 0, list: [] };
    var inp = el.querySelector("input");
    function draw() {
      var q = inp.value.trim().toLowerCase(); pal.list = cmds().filter(function (c) { var t = (c.g + " " + c.label).toLowerCase(); return !q || q.split(/\s+/).every(function (w) { return t.indexOf(w) > -1; }); });
      pal.i = Math.min(pal.i, Math.max(0, pal.list.length - 1));
      var g = "", h = "";
      pal.list.forEach(function (c, n) { if (c.g !== g) { g = c.g; h += "<div class='g'>" + g + "</div>"; } h += "<div class='it" + (n === pal.i ? " on" : "") + "' data-n='" + n + "'>" + c.label.replace(/</g, "&lt;") + "</div>"; });
      el.querySelector(".ll").innerHTML = h || "<div class='g'>Nichts gefunden</div>";
    }
    inp.addEventListener("input", function () { pal.i = 0; draw(); });
    inp.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { pal.i = Math.min(pal.list.length - 1, pal.i + 1); draw(); e.preventDefault(); }
      else if (e.key === "ArrowUp") { pal.i = Math.max(0, pal.i - 1); draw(); e.preventDefault(); }
      else if (e.key === "Enter" && pal.list[pal.i]) run(pal.list[pal.i]);
      else if (e.key === "Escape") close();
    });
    el.addEventListener("click", function (e) { if (e.target === el) return close(); var it = e.target.closest("[data-n]"); if (it) run(pal.list[+it.dataset.n]); });
    draw(); inp.focus();
  }
  var ICON = {
    planer: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round'><rect x='3.5' y='5' width='17' height='15.5' rx='3.5'/><path d='M3.5 10h17M8.5 3v4M15.5 3v4'/></svg>",
    training: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'><path d='M3 12h3l2.5-6 4 12 3-9 1.5 3H21'/></svg>",
    bibel: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'><path d='M5 4.5h10.5A3.5 3.5 0 0 1 19 8v11.5H8.5A3.5 3.5 0 0 1 5 16z'/><path d='M5 16a3.5 3.5 0 0 1 3.5-3.5H19M12 7v5M9.5 9h5'/></svg>",
    search: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'><circle cx='11' cy='11' r='6.5'/><path d='M20 20l-4.2-4.2'/></svg>",
    design: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9'><circle cx='12' cy='12' r='8.5'/><path d='M12 3.5a8.5 8.5 0 0 0 0 17z' fill='currentColor'/></svg>"
  };
  var COL = { planer: "#0a84ff", training: "#30d158", bibel: "#c79a5b" }, SUB = { planer: "Kalender, Aufgaben, Schule", training: "Training, Mobility, Atmung", bibel: "Elberfelder 1905" };
  var btn, menu;
  function place() {}
  function row(m, icon, col, title, sub, right) { return "<button class='mr' data-m='" + m + "'><span class='mi' style='background:" + col + "'>" + icon + "</span><span class='mt'><b>" + title + "</b>" + (sub ? "<small>" + sub + "</small>" : "") + "</span>" + (right || "") + "</button>"; }
  function openMenu() {
    menu.innerHTML = "<div class='mg'>" + APPS.map(function (a) { return row("app:" + a[2], ICON[a[0]], COL[a[0]], a[1], SUB[a[0]], a[0] === "bibel" ? "<span class='ck'>✓</span>" : ""); }).join("") + "</div>" +
      "<div class='mg'>" + row("search", ICON.search, "#636366", "Suchen und Befehle", "", "<kbd>Strg K</kbd>") + row("design", ICON.design, "#5e5ce6", "Design", window.SGTheme ? SGTheme.current().name : "") + "</div>";
    var r = btn.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(r.left, innerWidth - 308)) + "px";
    menu.style.top = Math.round(r.bottom + 8) + "px";
    menu.classList.add("on");
  }
  function mount() {
    if (document.documentElement.classList.contains("sg-dir")) return; // die Übersicht übernimmt den App-Wechsel
    document.head.appendChild(st);
    document.documentElement.classList.add("sg-appbtn");
    btn = document.createElement("button"); btn.className = "sgappb"; btn.setAttribute("aria-label", "Apps und Befehle"); btn.innerHTML = ICON.bibel;
    menu = document.createElement("div"); menu.className = "sgappm";
    document.body.appendChild(btn); document.body.appendChild(menu);
    btn.addEventListener("click", function () { if (menu.classList.contains("on")) menu.classList.remove("on"); else openMenu(); });
    menu.addEventListener("click", function (e) {
      var b = e.target.closest("[data-m]"); if (!b) return; var m = b.dataset.m; menu.classList.remove("on");
      if (m.indexOf("app:") === 0) { if (m.slice(4) !== B + "bibel/") location.href = m.slice(4); }
      else if (m === "search") open();
      else if (m === "design") { location.hash = "#mehr"; setTimeout(function () { var el = document.getElementById("sgThemes"); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 120); }
    });
    document.addEventListener("pointerdown", function (e) { if (menu.classList.contains("on") && !menu.contains(e.target) && !btn.contains(e.target)) menu.classList.remove("on"); }, true);
    place(); setTimeout(place, 400); addEventListener("resize", place);
  }
  document.addEventListener("keydown", function (e) { if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); open(); } });
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
