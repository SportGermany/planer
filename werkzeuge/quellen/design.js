/* Eine App, eine Hülle: Jede Seite (Planer, Training, Bibel, Module) läuft in /planer/app/ – dort gibt es eine
 * Navigation für alles. Wird eine einzelne Seite direkt geöffnet (alte Lesezeichen, Benachrichtigungen, Verknüpfungen),
 * geht es sofort in die Hülle an die passende Stelle. ?einzeln in der Adresse öffnet die Seite ausnahmsweise allein. */
(function () {
  try {
    var top = window.self === window.top, B = "/" + (location.pathname.split("/")[1] || "") + "/";
    if (top && !/\/app\/(index\.html)?$/.test(location.pathname) && !/[?&]einzeln/.test(location.search) && location.protocol !== "file:") {
      var rest = location.pathname.slice(B.length).replace(/index\.html$/, "");
      location.replace(B + "app/#u=" + encodeURIComponent(rest + location.hash));
      document.documentElement.style.visibility = "hidden";
    }
  } catch (e) {}
})();
/* APK (Android-App mit Capacitor): Die Seiten sind dieselben wie im Netz. Unterschiede nur hier:
 * kein Service Worker (die Dateien liegen ohnehin in der App), Herunterladen = Speichern/Teilen über Android,
 * Links nach außen öffnen im Browser. window.SGNative ist in der APK ein Objekt, sonst null. */
(function () {
  var C = null; try { C = window.top.Capacitor; } catch (e) {}
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) { window.SGNative = null; return; }
  document.documentElement.classList.add("sg-native");
  try { if (navigator.serviceWorker) navigator.serviceWorker.register = function () { return Promise.resolve({ scope: "" }); }; } catch (e) {}
  function P() { return window.top.Capacitor.Plugins; }
  function b64(data) {
    var blob = data instanceof Blob ? data : new Blob([data]);
    return new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(String(r.result).split(",")[1] || ""); }; r.onerror = no; r.readAsDataURL(blob); });
  }
  // Datei speichern/weitergeben: landet im Zwischenspeicher der App, dann Android-Teilen (Eigene Dateien, Drive, Kalender, …)
  function save(name, data) {
    name = String(name || "datei").replace(/[\\/:*?"<>|]+/g, "-");
    return b64(data).then(function (d) { return P().Filesystem.writeFile({ path: name, data: d, directory: "CACHE" }); })
      .then(function (r) { return P().Share.share({ title: name, files: [r.uri], dialogTitle: "Speichern oder teilen" }); })
      .catch(function (e) { if (!/cancel/i.test(String(e && e.message))) alert("Speichern hat nicht geklappt: " + (e && e.message || e)); });
  }
  function external(url) { try { window.top.location.href = url; } catch (e) { location.href = url; } }
  function handle(a) {
    var href = a.href || "";
    if (a.hasAttribute("download") && /^(blob:|data:)/.test(href)) {
      fetch(href).then(function (r) { return r.blob(); }).then(function (b) { return save(a.getAttribute("download") || "datei", b); })
        .catch(function (e) { alert("Speichern hat nicht geklappt: " + e.message); });
      return true;
    }
    if (/^https?:/.test(href) && new URL(href).origin !== location.origin) { external(href); return true; }
    return false;
  }
  var click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (handle(this)) return; return click.call(this); };
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (a && handle(a)) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  var open = window.open;
  window.open = function (url) { if (url && /^https?:/.test(url) && new URL(url, location.href).origin !== location.origin) { external(url); return null; } return open.apply(window, arguments); };
  // Seiten geben Blob-Adressen oft direkt nach dem Klick frei – hier etwas später, damit das Speichern sie noch lesen kann
  var revoke = URL.revokeObjectURL;
  URL.revokeObjectURL = function (u) { setTimeout(function () { revoke.call(URL, u); }, 60000); };
  window.print = function () { alert("Drucken geht in der Android-App nicht. Zum Drucken die Seite in Chrome öffnen: sportgermany.github.io/planer"); };
  window.SGNative = { save: save, external: external, plugins: P, platform: "android" };
})();
/* SportGermany-Design: 10 dunkle Farbwelten für alle Apps. Läuft im <head>, damit beim Laden nichts aufblitzt.
 * Die Wahl liegt im gemeinsamen Speicher (gilt sofort für alle Apps) und wird vom Verbund-Sync mit abgeglichen.
 * data-design nennt, welche CSS-Variablen die jeweilige App benutzt. */
(function () {
  "use strict";
  if (window.SGTheme) return;
  var KEY = "sg-design";
  // Schlicht nach dem Vorbild von Notion Kalender und Apple: ruhige Grautöne, eine Akzentfarbe, feine Linien
  var THEMES = [
    // Material You (Standard ab 3.8.0): Tonflächen nach Material Design 3; auf Android 12+ aus den Farben des Hintergrundbilds
    { id: "material", name: "Material You", info: "Farben aus deinem Hintergrundbild (Android 12+), sonst Violett", m3: true, bg: "#141218", s1: "#1d1b20", s2: "#211f26", s3: "#2b2930", line: "#36343b", ink: "#e6e0e9", muted: "#cac4d0", faint: "#938f99", acc: "#d0bcff", accfg: "#381e72", g2: "#efb8c8", g3: "#ccc2dc" },
    { id: "notion", name: "Notion", info: "Neutrales Grau, klares Blau (Standard)", bg: "#131313", s1: "#202020", s2: "#272727", s3: "#2f2f2f", line: "#2c2c2c", ink: "#ebebea", muted: "#9b9a97", faint: "#6b6a67", acc: "#529cca", g2: "#7c5cff", g3: "#2f8f6f" },
    { id: "apple", name: "Apple", info: "Tiefschwarz mit Systemblau", bg: "#000000", s1: "#1c1c1e", s2: "#2c2c2e", s3: "#3a3a3c", line: "#2c2c2e", ink: "#f5f5f7", muted: "#98989d", faint: "#636366", acc: "#0a84ff", g2: "#bf5af2", g3: "#30d158" },
    { id: "graphit", name: "Graphit", info: "Anthrazit mit Orange", bg: "#0f0f0f", s1: "#1e1e1e", s2: "#272727", s3: "#313131", line: "#2d2d2d", ink: "#ececec", muted: "#a0a0a0", faint: "#6a6a6a", acc: "#ff9f0a", g2: "#ff375f", g3: "#5e5ce6" },
    { id: "mitternacht", name: "Mitternacht", info: "Nachtblau", bg: "#0a0d12", s1: "#151b23", s2: "#1c2430", s3: "#243040", line: "#232c38", ink: "#e6edf3", muted: "#9aa7b4", faint: "#5d6b7a", acc: "#6ea8fe", g2: "#b0457a", g3: "#2f8f6f" },
    { id: "schiefer", name: "Schiefer", info: "Kühles Blaugrau, Petrol", bg: "#0d0f12", s1: "#1a1d21", s2: "#22262b", s3: "#2b3036", line: "#2a2f35", ink: "#e8eaed", muted: "#a0a7b0", faint: "#69707a", acc: "#5ac8c8", g2: "#5e5ce6", g3: "#ff9f0a" },
    { id: "salbei", name: "Salbei", info: "Gedämpftes Grün", bg: "#0d100e", s1: "#191d1a", s2: "#212622", s3: "#2a302b", line: "#272d28", ink: "#e6ebe6", muted: "#9eaa9f", faint: "#667067", acc: "#7fbf95", g2: "#5ac8c8", g3: "#d6a26b" },
    { id: "sand", name: "Sand", info: "Warmes Dunkelbraun, Karamell", bg: "#110f0d", s1: "#1f1c19", s2: "#282420", s3: "#322d28", line: "#2e2a25", ink: "#efe9e2", muted: "#aca295", faint: "#766d62", acc: "#d6a26b", g2: "#ff7a6b", g3: "#7fbf95" },
    { id: "lavendel", name: "Lavendel", info: "Dunkles Violettgrau", bg: "#100f13", s1: "#1c1b22", s2: "#24222b", s3: "#2d2b35", line: "#2b2932", ink: "#ece9f2", muted: "#a49fb0", faint: "#6d6878", acc: "#a78bfa", g2: "#ff6bcb", g3: "#5ac8fa" },
    { id: "koralle", name: "Koralle", info: "Warmes Grau mit Korallrot", bg: "#100e0e", s1: "#1e1b1b", s2: "#272323", s3: "#312c2c", line: "#2d2828", ink: "#efe8e7", muted: "#ab9f9d", faint: "#756a68", acc: "#ff7a6b", g2: "#ffd60a", g3: "#a78bfa" },
    { id: "oled", name: "OLED", info: "Reines Schwarz, Gelb – spart Akku", bg: "#000000", s1: "#0c0c0c", s2: "#161616", s3: "#202020", line: "#1f1f1f", ink: "#f2f2f2", muted: "#a3a3a3", faint: "#6b6b6b", acc: "#ffd60a", g2: "#ff9f0a", g3: "#0a84ff" }
  ];
  // frühere Namen weiter verstehen
  var ALIAS = { wald: "salbei", espresso: "sand", aubergine: "lavendel", tiefsee: "schiefer", oxid: "koralle", bordeaux: "koralle" };
  // Inter liegt als Datei in jeder App (offline, auf Samsung und iPhone gleich)
  var FONT = "'Inter SG',Inter,-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,'Helvetica Neue',system-ui,sans-serif";
  var FONTURL = "/" + (location.pathname.split("/")[1] || "") + "/inter.woff2";
  // App-Variable -> Farbrolle der Farbwelt
  var MAPS = {
    panel: { bg: "bg", panel: "s1", "panel-2": "s2", "panel-3": "s3", line: "line", text: "ink", "text-dim": "muted", "text-faint": "faint" },
    bibel: { bg: "bg", surface: "s1", surface2: "s2", ink: "ink", muted: "muted", accent: "acc", "accent-bright": "acc" },
    rodeln: { bg: "bg", surface: "s1", surface2: "s2", ink: "ink", muted: "muted", line: "line", accent: "acc", "accent-soft": "accsoft", "accent-ink": "accfg", mat: "s2", floor: "s3", far: "faint" },
    lernplan: { bg: "bg", surface: "s1", surface2: "s2", text: "ink", muted: "muted", line: "line", weekend: "bg", grid: "line", accent: "acc", "accent-soft": "accsoft", "accent-ink": "accfg" },
    puls: { bg: "bg", surface: "s1", ink: "ink", muted: "muted", line: "line", breath: "acc", "breath-soft": "accsoft" },
    kalender: { bg: "bg", s1: "s1", s2: "s2", s3: "s3", line: "line", line2: "s2", ink: "ink", muted: "muted", faint: "faint", acc: "acc", accfg: "accfg" },
    bahn: { bg: "bg", s1: "s1", s2: "s2", s3: "s3", line: "line", ink: "ink", muted: "muted", faint: "faint", acc: "acc", accfg: "accfg" }
  };
  // Laptop-Anpassungen: schmale Handy-Spalten verbreitern, zu breite Seiten mittig begrenzen
  // Doppelte Design-Schalter der einzelnen Apps ausblenden: Farben kommen für alle aus dem Bereich „Design“.
  var LAYOUT = {
    // Planer: die Leiste liegt sonst im Fluss – als schwebende Bahn über dem Inhalt
    kalender: "@media(max-width:1000px){.tabbar{position:fixed;z-index:40}#view{padding-bottom:calc(86px + env(safe-area-inset-bottom,0px))}" +
      ".fab{bottom:calc(92px + env(safe-area-inset-bottom,0px))!important;border-radius:50%!important}.tabbar button{border-radius:24px}" +
      // in Schule/Pause bleibt die Planer-Leiste – die Leiste des Bereichs steht als zweite Reihe darüber
      ".app.inmod #mods{margin-bottom:calc(70px + env(safe-area-inset-bottom,0px))}.app.inmod .bar .back{display:none!important}" +
      // Platz oben rechts für den App-Knopf
      ".bar{padding-right:58px!important}}",
    panel: "@media(min-width:900px){.onb{padding-left:max(24px,calc(50vw - 380px))!important;padding-right:max(24px,calc(50vw - 380px))!important}}" +
      // Training auf Tablet quer / Laptop: Karten in zwei Spalten statt einer langen Liste
      "html:not(.sg-embed) .screen>.top{padding-right:48px}" +
      // Tablet hochkant: breitere Spalte statt 480-px-Handyformat
      "@media(min-width:700px) and (max-width:1099px){.shell{max-width:660px!important}}" +
      "@media(min-width:1100px){#s-heute.active,#s-lauf.active,#s-fitness.active,#s-daten.active{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:18px;align-items:stretch;align-content:start}" +
      "#s-heute.active>*,#s-lauf.active>*,#s-fitness.active>*,#s-daten.active>*{min-width:0}" +
      "#s-heute>.brand,#s-heute>.top,#s-lauf>.top,#s-fitness>.top,#s-daten>.top,.screen.active>.sec-label,.screen.active>.hero,.screen.active>.stat-row,.screen.active>.bento,.screen.active>.widget-area,.screen.active>button,.screen.active>p{grid-column:1/-1}}" +
      ".row:has(#setSkin),#themeRow,#navyPanelRow,.row:has(#setThemeMode),.row:has(#setSkinMode),#modernAccentRow,.row:has(#setAccentPerGoal){display:none!important}" +
      // Denkpause im Planer: Wetter und eigener Verlauf-Kalender sind doppelt (Planer-Kalender, Wetter im Training)
      "html.sg-embed .tab[data-t=kalender],html.sg-embed .card:has(#citySearchBtn),html.sg-embed .sec-label:has(+ .card #citySearchBtn){display:none!important}",
    bibel: "header{padding-right:48px}.settings-section{padding:16px!important;margin-bottom:14px!important;border-bottom:0!important}.settings-section h3{margin-top:0!important}.tabbar{min-height:58px}" +
      "@media(min-width:900px){.app,.overlay-inner{max-width:720px}}#themeRow [data-theme=light]{display:none!important}",
    rodeln: ".set:has([data-theme-set]),.set:has(#chkBtn),#chkOut,.set:has(#instGo2),html.sg-embed .install{display:none!important}" +
      "@media(min-width:900px){.app{max-width:780px}}" +
      // Systemschrift ist breiter als die frühere schmale Schrift: Startknopf auf kleinen Handys anpassen
      ".start{letter-spacing:.02em;flex-wrap:wrap}@media(max-width:400px){.start{font-size:17px;padding:13px 10px;gap:6px}}",
    puls: "@media(min-width:900px){.wrap{max-width:820px}}"
  };
  // Schlicht statt verspielt: keine Großbuchstaben-Überschriften mit Sperrschrift, keine Verläufe und Kartenschatten,
  // ruhigere Rundungen. Gilt in allen Apps und Bereichen.
  var PLAIN = "body *{text-transform:none!important;letter-spacing:normal!important}" +
    "h1,h2,h3{letter-spacing:-.01em!important}" +
    ".card,.hero,.stat,.feed-card,.widget-tile,.tile,.bento>*,.stat-row>*,.panel,.set,.wk-card,.kpi,.mini,.quote-card,.settings-section,.stat-box,.passage{box-shadow:none!important;background-image:none!important}" +
    ".card,.hero,.feed-card,.widget-tile,.tile,.quote-card,.settings-section,.stat-box,.passage{border-radius:14px!important}" +
    "button,.btn,.chip{box-shadow:none!important;background-image:none!important}" +
    // Ausdrucke ohne App-Knopf und Menüs des Verbunds
    "@media print{#sg-shared-calendar{display:none!important}}";
  // In der Hülle: alle Bereiche mit derselben Schrift, denselben Überschriftgrößen und derselben Akzentfarbe
  // (vorher brachte jede Seite eigene Farben, Mono-/Serifenschriften und Titelgrößen mit)
  function unifyCSS(t, roles) {
    var r = "html:root:not(#sg)", e = "html.sg-dir-embed ";
    var css = e + "h1{font-family:" + FONT + "!important;font-size:22px!important;line-height:1.2!important;font-weight:700!important;letter-spacing:-.01em!important}" +
      e + "h2{font-family:" + FONT + "!important;font-size:17px!important;line-height:1.3!important;font-weight:650!important}";
    var per = {
      // Training und Pause: eigene Akzentfarben (Orange, Türkis) – auch die vom Skript gesetzten – auf die Farbwelt legen
      panel: r + "{--work:" + t.acc + "!important;--work-dim:" + roles.accsoft + "!important;--zitate:" + t.acc + "!important;--zitate-dim:" + roles.accsoft + "!important}" +
        e + ".mono{font-family:inherit!important;font-variant-numeric:tabular-nums}",
      rodeln: e + ".blk{font-size:28px!important;line-height:1.1!important}",
      lernplan: e + ".hero .big{font-size:26px!important}",
      // Bibel: Serifenschrift nur für den Bibeltext selbst, Bedienelemente wie überall
      bibel: e + "header h1," + e + ".passage h2," + e + ".book-group h3," + e + ".stat .num," + e + ".book-h .bn{font-family:" + FONT + "!important;font-weight:650!important}" +
        e + ".go-button{background:" + t.acc + "!important;color:" + roles.accfg + "!important;border-color:transparent!important;border-radius:14px!important;font-weight:700!important}" +
        e + ".go-button.done{background:" + t.s2 + "!important;color:" + t.ink + "!important}" + e + ".mode-row button{border-radius:12px!important}"
    };
    return css + (per[MODE] || "");
  }
  var GLASS_CARDS = {
    kalender: ".card,.tl-tile,.wpstrip,.nudge",
    lernplan: ".card,.wkall",
    panel: ".card,.hero,.feed-card,.stat,.widget-tile,.stat-row>*",
    rodeln: ".card,.set,.tabs2 button",
    puls: ".panel",
    bibel: ".quote-card,.passage.show,.settings-section,.stat-box"
  };
  // Was in der Hülle zusätzlich entfällt (die Hülle hat eine Navigation für alles)
  var SHELLHIDE = { kalender: ".side,.bar .menu-btn,.bar .back,.sgappb,#bar[data-tab=tasks]{display:none!important}#view{padding-bottom:0!important}", panel: "#s-heute>.brand{display:none!important}" };
  var GLASS_NAV = {
    kalender: [".tabbar", ".tabbar button.on"],
    // die Schule zeigt ab 900 px (und im Querformat) eine Leiste am linken Rand – die bleibt unverändert
    lernplan: [".tabs", ".tab.on", "(max-width:899px) and (min-height:561px),(max-width:899px) and (orientation:portrait)"],
    panel: [".nav", ".tab.on"],
    rodeln: [".tabbar", ".tabbar button.on"],
    puls: ["nav.tabs", "nav.tabs button.on"],
    bibel: [".tabbar", ".tabbar button.active"],
    bahn: [".tabs", ".tabs button.on"]
  };
  /* Natürlicher Aufbau wie in den iOS-Einstellungen: Inhalte auf ruhigen, gruppierten Flächen (ohne Rahmen, ohne Glas),
   * Glas nur für Leisten und Menüs, die über dem Inhalt schweben. Die untere Leiste rückt nach rechts, wenn links der App-Knopf sitzt. */
  function glassCSS(t) {
    var g = "html:not(.sg-noglass)";
    var css = "";
    var cards = GLASS_CARDS[MODE];
    // Material You: Karten als Tonfläche (Fläche mit etwas Akzent) und runder
    if (cards) css += cards + "{background-color:" + (t.m3 ? mix(t.s1, t.acc, .06) : t.s1) + "!important;border:0!important;border-radius:" + (t.m3 ? 16 : 14) + "px!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}";
    var nav = GLASS_NAV[MODE];
    // In der Übersicht-Navigation steuert die Übersicht die Unterseiten der Bereiche – deren eigene Leiste entfällt
    if (nav && DIRPARENT) return css + nav[0] + "{display:none!important}" + (SHELLHIDE[MODE] || "");
    if (nav && nav[2]) { var inner = glassNav(t, nav, g); return css + "@media " + nav[2] + "{" + inner + "}"; }
    if (nav) css += glassNav(t, nav, g);
    return css;
  }
  function glassNav(t, nav, g) {
    var css = "";
    if (nav) {
      css += ":root{--sgW:min(520px,calc(100vw - 96px));--sgL:calc(50% - (var(--sgW) + 70px) / 2)}";
      css += nav[0] + "{left:12px!important;right:12px!important;bottom:calc(10px + env(safe-area-inset-bottom,0px))!important;max-width:560px;margin:0 auto!important;border-radius:30px!important;" +
        "background:" + t.s1 + "!important;border:1px solid rgba(255,255,255,.08)!important;box-shadow:0 8px 28px rgba(0,0,0,.45)!important;padding:0 6px!important;overflow:hidden}";
      css += g + " " + nav[0] + "{background:" + rgba(t.s2, .72) + "!important;-webkit-backdrop-filter:blur(24px) saturate(180%)!important;backdrop-filter:blur(24px) saturate(180%)!important}";
      // eingebettete Bereiche (Schule, Pause, Mobility, Atmung): kompakte zweite Reihe direkt über der Leiste der App
      css += "html.sg-embed " + nav[0] + "{bottom:6px!important;height:50px!important;min-height:50px!important;max-width:470px;border-radius:25px!important;box-shadow:0 6px 20px rgba(0,0,0,.35)!important}" +
        "html.sg-embed " + nav[0] + " *{font-size:10.5px!important}html.sg-embed " + nav[0] + " svg{width:19px!important;height:19px!important}";
      css += nav[1] + "{background:rgba(255,255,255,.12)!important;border-radius:24px!important}";
    }
    return css;
  }
  var FONTVARS = { rodeln: ["fd", "fb"], puls: ["font-display", "font-body", "font-data"], bibel: ["sans"] };
  var script = document.currentScript;
  var MODE = (script && script.getAttribute("data-design")) || "panel";
  // Als Modul in einer anderen App eingebettet? Dann übernimmt die äußere App Offline-Speicher und Installation.
  var EMBED = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  // Chrome bietet „App installieren“ an: Ereignis merken, damit die App einen eigenen Installieren-Knopf zeigen kann
  if (!EMBED) {
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); window.SGInstallEvt = e; window.dispatchEvent(new Event("sg-install")); });
    window.addEventListener("appinstalled", function () { window.SGInstallEvt = null; window.SGInstalled = true; window.dispatchEvent(new Event("sg-install")); });
  }
  if (!EMBED && script && script.getAttribute("data-dir")) document.documentElement.classList.add("sg-dir");
  var DIRPARENT = false;
  if (EMBED) {
    try { DIRPARENT = window.parent.document.documentElement.classList.contains("sg-dir"); } catch (e) {}
    if (DIRPARENT) document.documentElement.classList.add("sg-dir-embed");
    document.documentElement.classList.add("sg-embed");
    try { if (navigator.serviceWorker) navigator.serviceWorker.register = function () { return Promise.resolve({ scope: "" }); }; } catch (e) {}
  }
  // Daten, die der Cloud-Sync kurz vor einem Neuladen übernommen hat, zurückschreiben, BEVOR die App startet –
  // so kann die App sie beim Schließen nicht mit ihrem alten Stand überschreiben.
  (function () {
    var sid = script && script.getAttribute("data-sync");
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf("sg-apply-on-boot:") !== 0) return;
        var e = JSON.parse(localStorage.getItem(k) || "null");
        if (!e || Date.now() - e.t > 10 * 60000) { localStorage.removeItem(k); return; }
        if (sid && k === "sg-apply-on-boot:" + sid) {
          Object.keys(e.data || {}).forEach(function (d) { localStorage.setItem(d, e.data[d]); });
          localStorage.removeItem(k);
        }
      });
    } catch (e) {}
  })();

  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")"; }
  /* Farben aus dem Hintergrundbild (Android 12+): das Plugin liefert Tonleitern, daraus die Rollen des dunklen M3-Schemas.
   * Zwischengespeichert in sg-monet-v1 – eingebettete Seiten und der nächste Start haben sie sofort. */
  var MONET_KEY = "sg-monet-v1";
  function mix(a, b, w) { var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), f = function (s) { return Math.round(((x >> s) & 255) * (1 - w) + ((y >> s) & 255) * w); }; return "#" + ((1 << 24) + (f(16) << 16) + (f(8) << 8) + f(0)).toString(16).slice(1); }
  function monet() { try { var m = JSON.parse(localStorage.getItem(MONET_KEY) || "null"); return m && m.dynamic && m.accent1 && m.neutral1 ? m : null; } catch (e) { return null; } }
  function fromMonet(base, m) {
    var a1 = m.accent1, a2 = m.accent2 || a1, a3 = m.accent3 || a1, n1 = m.neutral1, n2 = m.neutral2 || n1;
    return Object.assign({}, base, { bg: mix(n1["900"], "#000000", .35), s1: n1["900"], s2: mix(n1["900"], n1["800"], .45), s3: n1["800"], line: mix(n2["800"], n2["700"], .4),
      ink: n1["100"], muted: n2["200"], faint: n2["400"], acc: a1["200"], accfg: a1["800"], g2: a3["200"], g3: a2["200"], dynamic: true });
  }
  function get(id) {
    id = ALIAS[id] || id;
    var t = THEMES.find(function (t) { return t.id === id; }) || THEMES[0], m = t.m3 && monet();
    return m ? fromMonet(t, m) : t;
  }
  // Umstellung auf den schlichten Stil: einmalig auf das neue Standard-Design wechseln (danach frei wählbar)
  try { if (!localStorage.getItem("sg-design-v2")) { localStorage.setItem("sg-design-v2", "1"); localStorage.setItem(KEY, "notion"); } } catch (e) {}
  // 3.8.0: Material You wird einmalig zum Standard (Wunsch der Nutzerin); andere Designs bleiben wählbar
  try { if (!localStorage.getItem("sg-design-v3")) { localStorage.setItem("sg-design-v3", "1"); localStorage.setItem(KEY, "material"); } } catch (e) {}
  function currentId() { try { return localStorage.getItem(KEY) || "material"; } catch (e) { return "material"; } }
  // Android: Systemschrift Roboto statt Inter (liegt im Handy, kein Laden nötig)
  var ROBOTO = "Roboto,'Roboto Flex','Google Sans Text','Noto Sans',system-ui,-apple-system,'Segoe UI',sans-serif";
  function css(t) {
    var roles = Object.assign({ accsoft: rgba(t.acc, .16), accfg: "#14120f" }, t), map = MAPS[MODE] || MAPS.panel, FONT0 = FONT;
    if (t.m3) FONT = ROBOTO;
    try {
    var vars = Object.keys(map).map(function (k) { return "--" + k + ":" + roles[map[k]]; }).join(";");
    vars += ";" + (FONTVARS[MODE] || []).map(function (v) { return "--" + v + ":" + FONT; }).join(";") + ";--sg-acc:" + t.acc + ";--sg-line:" + t.line + ";color-scheme:dark";
    // :not(#sg) hebt die Regel über alle Hell/Dunkel-Regeln der Apps – alle Apps bleiben dunkel.
    // In der Bibel bleiben Sepia- und Nachtmodus als Lesemodi erhalten.
    var sel = MODE === "bibel" ? "html:root:not(#sg):not([data-theme=\"sepia\"]):not([data-theme=\"night\"])" : "html:root:not(#sg)";
    return "@font-face{font-family:'Inter SG';src:url(" + FONTURL + ") format('woff2');font-weight:100 900;font-display:swap}" +
      sel + "{" + vars + "}html:not(#sg) body{background-color:var(--bg)}body,button,input,select,textarea{font-family:" + FONT + (t.m3 ? "" : ";font-feature-settings:'cv11','ss01'") + "}" + PLAIN + glassCSS(t) + (LAYOUT[MODE] || "") + (DIRPARENT ? unifyCSS(t, roles) : "") + (t.m3 ? M3CSS : "");
    } finally { FONT = FONT0; }
  }
  /* Material-You-Formen für alle Seiten (die Hülle hat eigene, ausführlichere Regeln in app/index.html, Klasse html.m3) */
  var M3CSS = "html.m3 input:not([type=checkbox]):not([type=radio]):not([type=range]),html.m3 select,html.m3 textarea{border-radius:12px}";
  function apply(id) {
    var t = get(id || currentId());
    document.documentElement.classList.toggle("m3", !!t.m3);
    var st = document.getElementById("sg-theme");
    if (!st) { st = document.createElement("style"); st.id = "sg-theme"; (document.head || document.documentElement).appendChild(st); }
    st.textContent = css(t);
    document.querySelectorAll("meta[name=theme-color]").forEach(function (m) { m.setAttribute("content", t.bg); m.removeAttribute("media"); });
    window.dispatchEvent(new CustomEvent("sg-theme", { detail: t }));
    bars(t);
    return t;
  }
  // Android-App, oberstes Fenster: Leisten in der Flächenfarbe; Farben aus dem Hintergrundbild holen (ändern sich mit dem Hintergrund)
  function SP() { try { if (window.top !== window) return null; var C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.PlanerSystem || null; } catch (e) { return null; } }
  // oben Fläche, unten Farbe der unteren Leiste (M3: Fläche mit 8 % Akzent) – sonst zweifarbiger Streifen bei 3-Tasten-Navigation
  function bars(t) { var P = SP(); if (P && P.bars) P.bars({ bg: t.bg, nav: t.m3 ? mix(t.s1, t.acc, .08) : t.s1, light: false }).catch(function () {}); }
  function loadMonet() {
    var P = SP(); if (!P || !P.colors) return;
    P.colors().then(function (m) {
      var old = localStorage.getItem(MONET_KEY), now = JSON.stringify(m || {});
      if (old !== now) { try { localStorage.setItem(MONET_KEY, now); } catch (e) {} if (get(currentId()).m3) apply(); }
    }).catch(function () {});
  }
  function glassOn() { try { return localStorage.getItem("sg-glass") !== "0"; } catch (e) { return true; } }
  document.documentElement.classList.toggle("sg-noglass", !glassOn());
  window.SGNav = (GLASS_NAV[MODE] || [])[0] || "";
  // ohne gespeicherte Farben sofort holen (sonst erst Violett, dann Umfärben)
  try { if (!localStorage.getItem(MONET_KEY)) loadMonet(); else setTimeout(loadMonet, 600); } catch (e) { setTimeout(loadMonet, 600); }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { loadMonet(); bars(get(currentId())); } });
  window.addEventListener("resize", function () { clearTimeout(bars.t); bars.t = setTimeout(function () { bars(get(currentId())); }, 300); });   // nach Drehen setzt Android die Leisten zurück
  // kurze Rückmeldung per Vibration (Android-App); im Browser still
  window.SGHaptic = function (kind) { var P = SP() || (function () { try { return window.top.Capacitor.Plugins.PlanerSystem; } catch (e) { return null; } })(); if (P && P.haptic) P.haptic({ kind: kind || "tap" }).catch(function () {}); };
  window.SGTheme = {
    glass: glassOn,
    setGlass: function (on) { try { localStorage.setItem("sg-glass", on ? "1" : "0"); } catch (e) {} document.documentElement.classList.toggle("sg-noglass", !on); window.dispatchEvent(new CustomEvent("sg-theme-set", { detail: "glass" })); },
    list: THEMES,
    current: function () { return get(currentId()); },
    set: function (id) { try { localStorage.setItem(KEY, id); } catch (e) {} apply(id); window.dispatchEvent(new CustomEvent("sg-theme-set", { detail: id })); }
  };
  // ?design=… in der Adresse: zum Ausprobieren ohne zu speichern
  var q = /[?&]design=([a-z]+)/.exec(location.search);
  apply(q ? q[1] : null);
  window.addEventListener("storage", function (e) { if (e.key === KEY || e.key === MONET_KEY || e.key === null) apply(); if (e.key === "sg-glass") document.documentElement.classList.toggle("sg-noglass", !glassOn()); });
})();
/* Eine App, ein Bereich: Adressen der früheren Einzel-Apps (trainingsblog, Schulplaner, Bibel, kalender …)
 * zeigen auf die passende Stelle in /planer/. Sonst öffnet Chrome sie außerhalb der App – und offline gibt es sie nicht.
 * Wirkt auf gespeicherte Einträge (einmal pro Version und nach jedem Cloud-Abgleich) und auf jeden Klick auf einen Link. */
(function () {
  "use strict";
  if (window.SGFixUrl) return;
  var VERSION = "__SGVERSION__";
  window.SGVersion = VERSION;
  var BASE = "/" + (location.pathname.split("/")[1] || "") + "/";
  var MAP = { trainingsblog: "training/", pulsplan: "training/atmung/", rodeln: "training/mobility/", schulplaner: "", kalender: "",
    bibel: "bibel/", focus: "pause/", ablenkung: "pause/", splash: "" };
  var SEG = "(trainingsblog|pulsplan|rodeln|schulplaner|kalender|bibel|focus|ablenkung|splash)";
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };
  // ganze Adresse (gleicher Server) oder relative ../Name/-Angabe; nur wenn der Ordner nicht schon in /planer/ liegt
  var RX = new RegExp("(" + esc(location.origin) + "|\\.\\.)/" + SEG + "/", "gi");
  function fix(u) {
    if (typeof u !== "string" || u.indexOf("/") < 0) return u;
    return u.replace(RX, function (m, pre, seg) { return (pre === ".." ? "" : location.origin) + BASE + MAP[seg.toLowerCase()]; });
  }
  window.SGFixUrl = fix;
  function migrate() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i), v = localStorage.getItem(k);
        if (!v || v.length > 5e6 || (v.indexOf("github.io") < 0 && v.indexOf(location.host) < 0 && v.indexOf("../") < 0)) continue;
        RX.lastIndex = 0; var n = fix(v); if (n !== v) localStorage.setItem(k, n);
      }
      localStorage.setItem("sg-url-fix", VERSION);
    } catch (e) {}
  }
  var need = false;
  try { need = localStorage.getItem("sg-url-fix") !== VERSION || !!sessionStorage.getItem("sg-url-fix-now"); sessionStorage.removeItem("sg-url-fix-now"); } catch (e) {}
  if (need) migrate();
  window.addEventListener("sg-cloud-applied", migrate);
  document.addEventListener("click", function (e) {
    var path = e.composedPath ? e.composedPath() : [e.target], a = null;
    for (var i = 0; i < path.length && !a; i++) if (path[i].tagName === "A" && path[i].hasAttribute("href")) a = path[i];
    if (!a) return;
    var h = a.getAttribute("href"), n = fix(h); if (n !== h) a.setAttribute("href", n);
    // in der Hülle: ein Link in einen anderen Bereich der App springt dort hin, statt diese Seite zu wechseln
    var SH = null; try { SH = window.top.SGShell; } catch (x) {}
    if (!SH || a.target === "_blank" || a.hasAttribute("download")) return;
    var u = new URL(n, location.href);
    if (u.origin !== location.origin || u.pathname.indexOf(BASE) !== 0 || u.pathname === location.pathname) return;
    e.preventDefault(); e.stopPropagation(); SH.openUrl(u.pathname.slice(BASE.length) + u.hash);
  }, true);
})();
/* Version und „Version aktualisieren“: fragt sw.js auf dem Server nach der aktuellen Versionsnummer.
 * Ist sie neuer, lädt der Service Worker alle Dateien neu und die App startet frisch – ohne Netz bleibt alles, wie es ist. */
(function () {
  "use strict";
  if (window.SGUpdate) return;
  var EMBED = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var BASE = "/" + (location.pathname.split("/")[1] || "") + "/";
  function num(v) { return String(v || "").replace(/^planer-/, ""); }
  function newer(a, b) {
    var pa = num(a).split(".").map(Number), pb = num(b).split(".").map(Number);
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) { var x = pa[i] || 0, y = pb[i] || 0; if (x !== y) return x > y; }
    return false;
  }
  function remote() {
    return fetch(BASE + "sw.js?v=" + Date.now(), { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (t) { var m = /const VERSION = 'planer-([^']+)'/.exec(t); if (!m) throw new Error("Version"); return m[1]; });
  }
  // Version des Service Workers, der die Seite gerade bedient (z. B. "planer-2.0.1")
  function swVersion() {
    return new Promise(function (res) {
      var c = navigator.serviceWorker && navigator.serviceWorker.controller; if (!c) return res("");
      var ch = new MessageChannel(); ch.port1.onmessage = function (e) { res((e.data && e.data.version) || ""); };
      try { c.postMessage("version", [ch.port2]); } catch (e) { res(""); }
      setTimeout(function () { res(""); }, 1500);
    });
  }
  // want: neue Versionsnummer. Neu geladen wird, sobald der Service Worker sie bereitstellt –
  // auch wenn der Browser sie schon vorher im Hintergrund installiert hat.
  function install(cb, want) {
    if (window.SGNative) {
      if (apkUrl) { cb && cb("Download startet – danach die Datei antippen und „Installieren“ wählen."); window.SGNative.external(apkUrl); }
      else nativeCheck(cb || function () {}, false);
      return;
    }
    var sw = navigator.serviceWorker;
    if (!sw) { location.reload(); return; }
    var t = null, go = function () { location.reload(); clearTimeout(t); t = setTimeout(go, 4000); };
    sw.addEventListener("controllerchange", go);
    t = setTimeout(go, 20000); // spätestens dann neu laden
    cb && cb("Neue Version wird geladen …");
    (function poll(n) {
      swVersion().then(function (v) { if (want && v === "planer-" + want) go(); else if (n < 40) setTimeout(function () { poll(n + 1); }, 500); });
    })(0);
    sw.getRegistration(BASE).then(function (reg) { if (!reg) return go(); return reg.update(); }).catch(go);
  }
  // check(status): status(text) meldet den Fortschritt; Ergebnis "neu" | "aktuell" | "offline" | "fehler"
  // APK: neue Fassungen liegen als Release auf GitHub (Bau: .github/workflows/apk.yml) – Download öffnet im Browser, dann installieren
  var REL = "https://api.github.com/repos/SportGermany/planer/releases/latest", apkUrl = "";
  function nativeCheck(status, auto) {
    if (!navigator.onLine) { status("Ohne Internet kann nicht nach einer neuen Version gesucht werden. Die App läuft offline ganz normal weiter."); return Promise.resolve("offline"); }
    status("Suche nach einer neuen Version …");
    return fetch(REL, { cache: "no-store", headers: { Accept: "application/vnd.github+json" } }).then(function (r) { if (r.status === 404) return {}; if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
      // 404 = noch kein Release veröffentlicht → nichts Neueres
      var v = String(j.tag_name || "").replace(/^v/, ""), a = (j.assets || []).find(function (x) { return /\.apk$/.test(x.name); });
      if (!a || !newer(v, window.SGVersion)) { status("Du hast die neueste Version (" + window.SGVersion + ")."); return "aktuell"; }
      apkUrl = a.browser_download_url;
      if (auto) { status("Version " + v + " ist da."); return v; }
      status("Version " + v + " gefunden – die neue App wird heruntergeladen. Danach antippen und installieren (deine Daten bleiben)."); install(status, v); return "neu";
    }).catch(function () { status("GitHub ist gerade nicht erreichbar. Die App läuft offline ganz normal weiter."); return "fehler"; });
  }
  function check(status, auto) {
    status = status || function () {};
    if (window.SGNative) return nativeCheck(status, auto);
    if (!navigator.onLine) { status("Ohne Internet kann nicht nach einer neuen Version gesucht werden. Die App läuft offline ganz normal weiter."); return Promise.resolve("offline"); }
    status("Suche nach einer neuen Version …");
    return remote().then(function (v) {
      if (!newer(v, window.SGVersion)) { status("Du hast die neueste Version (" + window.SGVersion + ")."); return "aktuell"; }
      if (auto) { status("Version " + v + " ist da."); return v; }
      status("Version " + v + " gefunden – wird geladen …"); install(status, v); return "neu";
    }).catch(function () { status("Der Server ist gerade nicht erreichbar. Die App läuft offline ganz normal weiter."); return "fehler"; });
  }
  window.SGUpdate = { version: function () { return window.SGVersion; }, check: check, install: install };
  // Beim Start leise nachsehen (höchstens alle 6 Stunden) und dann einen Hinweis anbieten
  if (EMBED) return;
  window.addEventListener("load", function () {
    setTimeout(function () {
      var last = 0; try { last = +localStorage.getItem("sg-update-check") || 0; } catch (e) {}
      if (Date.now() - last < 6 * 36e5) return;
      try { localStorage.setItem("sg-update-check", String(Date.now())); } catch (e) {}
      check(null, true).then(function (v) { if (v && /^\d/.test(v)) window.dispatchEvent(new CustomEvent("sg-update", { detail: v })); });
    }, 4000);
  });
})();
