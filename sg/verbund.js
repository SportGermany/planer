/* SportGermany-Verbund (v2): gemeinsamer Kalender, App-Wechsel und Cloud-Sync für alle Apps.
 * Alle Apps liegen auf sportgermany.github.io und teilen sich deshalb denselben localStorage.
 * Kalender und App-Daten werden zusätzlich in einem privaten GitHub-Gist gespeichert und so
 * zwischen mehreren Geräten abgeglichen. Diesen Block in jeder App identisch halten –
 * er wird aus verbund.js erzeugt, nur das data-app-Attribut unterscheidet sich.
 * API: window.SharedCalendar.{open, list, add, update, remove, onChange, sync}
 */
(function () {
  "use strict";
  if (window.SharedCalendar) return;

  /* ---------- Die drei Apps und ihre Bereiche ----------
   * Planer = Kalender + Schule (Lernplan) + Pause (Denkpause); Training = Trainingsblog + Mobility (Rodel-Mobility)
   * + Atmung (Pulsplan); Bibel bleibt eigenständig. Module laufen eingebettet in ihrer App.
   * owns: Datengruppen, deren Seiten in dieser App offen sein können (wichtig für Neuladen nach dem Sync). */
  // Eine App: Planer im Hauptordner, Training und Bibel als Unterordner (Adresse ergibt sich aus der Seite)
  var BASE = "/" + (location.pathname.split("/")[1] || "") + "/";
  var APPS = [
    { id: "planer", name: "Planer", cal: "Kalender", path: "", color: "#6ea8fe", info: "Kalender, Schule, Aufgaben, Pausen",
      sections: [["Heute", "#brief"], ["Kalender", "#cal"], ["Aufgaben", "#tasks"], ["Schule", "#schule"], ["Pause", "#pause"]], owns: ["lernplan", "denkpause"] },
    { id: "training", name: "Training", cal: "Training", path: "training", color: "#4fc18a", info: "Training, Mobility, Atmung und HRV",
      sections: [["Heute", ""], ["Mobility", "#mobility"], ["Atmung", "#atmung"], ["Bahnplan", "#bahnplan"]], owns: ["training", "rodeln", "puls", "bahnplan"] },
    { id: "bibel", name: "Bibel", cal: "Bibel", path: "bibel", color: "#c9a27a", info: "Ganze Elberfelder Bibel · ohne Cloud", sections: [], owns: [] }
  ];
  // Eingebettete Module: gehören zu einer App, haben selbst keinen Knopf und keinen eigenen Sync
  var MODULES = [
    { id: "lernplan", name: "Lernplan", app: "planer" }, { id: "denkpause", name: "Denkpause", app: "planer" },
    { id: "rodeln", name: "Rodel-Mobility", app: "training" }, { id: "puls", name: "Pulsplan", app: "training" },
    { id: "bahnplan", name: "Bahnplan", app: "training" }
  ];
  /* Datengruppen für den Cloud-Sync (Dateiname im Gist: app-<id>.json).
   * Bewusst NICHT dabei: gerätebezogene Daten wie Zugangsschlüssel, Wetter-Cache oder Fensterstellungen
   * (Lernplan: schulplaner-lokal-v1, Trainingsblog: wk_sync, wk_syncmethod, wk_weather*, wk_uiprefs …). */
  var DATA = [
    // Ist im Lernplan die eigene GitHub-Synchronisierung eingerichtet (sichert auch die Dateien der Ablage),
    // überlässt der Verbund ihr die Schul-Daten – zwei Syncs auf denselben Daten würden sich überschreiben.
    { id: "lernplan", name: "Schule (Lernplan)", keys: ["schulkalender-bayern-v1"], own: function () {
      try { var l = JSON.parse(localStorage.getItem("schulplaner-lokal-v1") || "{}"); return !!(l.sync && l.sync.owner && l.sync.repo && l.sync.token); } catch (e) { return false; } } },
    { id: "denkpause", name: "Pause (Denkpause)", keys: ["denkpause.v1"] },
    { id: "training", name: "Training", keys: ["wk_settings", "wk_log", "wk_activities", "wk_runs", "wk_body", "wk_colors", "wk_custom_ex", "wk_custom_gym", "wk_freezes", "wk_gymlog", "wk_illness_active", "wk_injury_active", "wk_injurydays", "wk_onboarded", "wk_race", "wk_rests", "wk_sections", "wk_sickdays", "wk_skin", "wk_swaps", "wk_trainedoverride", "wk_vacation", "wk_weekgoal", "wk_widgets"] },
    { id: "rodeln", name: "Mobility", keys: ["rodelmobility.v1"] },
    { id: "puls", name: "Atmung & HRV", keys: ["pulsplan.v1"] },
    { id: "bahnplan", name: "Bahnplan", keys: ["bahnplan.v1"] }
  ];
  // Farben der Kalender-Quellen (Eintrag.app); alte Namen bleiben gültig
  var SOURCES = [
    ["Kalender", "#6ea8fe"], ["Lernplan", "#2b5fd9"], ["Training", "#4fc18a"], ["Trainingsblog", "#2f7d57"], ["Rodel-Mobility", "#c0303f"],
    ["Pulsplan", "#b4532a"], ["Atmung", "#d9774b"], ["Mobility", "#e0707e"], ["Denkpause", "#8a6d1f"], ["Focus", "#3d6b73"], ["Bibel", "#6b4a3a"], ["Notiz", "#e0b34e"]
  ];
  var EMBED = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var KEY = "sg-shared-calendar-v1";
  var TKEY = "sg-shared-tasks-v1";
  var NKEY = "sg-notizen-v1";
  var POS_KEY = "sg-shared-calendar-btn";
  var SYNC_KEY = "sg-shared-calendar-sync";
  var META_KEY = "sg-verbund-sync-meta";
  var GIST_FILE = "kalender.json";
  var GIST_DESC = "Gemeinsamer Kalender (SportGermany-Apps)";
  var GH = "https://api.github.com";
  var script = document.currentScript;
  var APP_ID = (script && script.getAttribute("data-app")) || "";
  var MOD = MODULES.find(function (m) { return m.id === APP_ID; });
  var ME = APPS.find(function (a) { return a.id === (MOD ? MOD.app : APP_ID); }) || { id: APP_ID || "app", name: document.title || "App", cal: document.title || "App", color: "#6ea8fe", owns: [], sections: [] };
  var APP = MOD ? MOD.name : ME.cal; // Name, unter dem neue Termine/Aufgaben gespeichert werden
  var MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  var COLORS = ["#2b5fd9", "#2f7d57", "#c0303f", "#b4532a", "#8a6d1f", "#6b4a3a", "#4b5b66", "#7a4fa0"];
  var CNAMES = ["Blau", "Grün", "Rot", "Rost", "Ocker", "Braun", "Schiefer", "Violett"];
  var listeners = [];
  var chan = null;
  try { chan = new BroadcastChannel(KEY); } catch (e) {}

  /* ---------- Gemeinsame Speicher: Termine (cal) und Aufgaben (todo) ----------
   * Beide liegen als { v, events: [...] } im localStorage und als eigene Datei im Gist.
   * Jeder Eintrag trägt "changed"; beim Zusammenführen gewinnt die neuere Fassung. */
  var COLS = {
    cal: { key: KEY, file: "kalender.json", ok: function (e) { return /^\d{4}-\d{2}-\d{2}$/.test(e.date); } },
    todo: { key: TKEY, file: "aufgaben.json", ok: function (e) { return typeof e.title === "string"; } },
    // Notizen: schnelle Ideen, optional mit Zeitpunkt (at = "JJJJ-MM-TTTHH:MM") und Erinnerung
    note: { key: NKEY, file: "notizen.json", ok: function (e) { return typeof e.text === "string"; } }
  };
  function load(c) {
    try {
      var d = JSON.parse(localStorage.getItem(COLS[c || "cal"].key) || "null");
      if (d && Array.isArray(d.events)) return d;
    } catch (e) {}
    return { v: 1, events: [] };
  }
  function save(d, fromCloud, c) {
    d.updated = Date.now();
    purge(d);
    try { localStorage.setItem(COLS[c || "cal"].key, JSON.stringify(d)); }
    catch (e) { alert("Konnte nicht gespeichert werden (Speicher voll?)."); return; }
    if (chan) try { chan.postMessage("changed"); } catch (e) {}
    emit();
    if (!fromCloud) schedulePush();
  }
  // Löschmarkierungen nach einem Jahr endgültig entfernen, damit die Datei nicht endlos wächst.
  function purge(d) {
    var limit = Date.now() - 365 * 864e5;
    d.events = d.events.filter(function (e) { return !(e.deleted && (e.changed || 0) < limit); });
  }
  // Führt Einträge zusammen: pro Eintrag gewinnt die zuletzt geänderte Fassung (auch Löschungen).
  function mergeInto(d, events, c) {
    var added = 0, changed = false, ok = COLS[c || "cal"].ok;
    (events || []).forEach(function (e) {
      if (!e || !e.id || !ok(e)) return;
      if (e.link && window.SGFixUrl) e.link = window.SGFixUrl(e.link);
      var i = d.events.findIndex(function (x) { return x.id === e.id; });
      if (i < 0) { d.events.push(e); added++; changed = true; }
      else if ((e.changed || 0) > (d.events[i].changed || 0)) { d.events[i] = e; changed = true; }
    });
    return { added: added, changed: changed };
  }
  // Jede Änderung liest zuerst den aktuellen Stand, damit keine App die Einträge einer anderen überschreibt.
  function mutate(fn, c) { var d = load(c); var r = fn(d); save(d, false, c); return r; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function live(c) {
    var list = load(c).events.filter(function (e) { return !e.deleted; });
    if (c === "todo") return list.sort(function (a, b) {
      return (a.done ? 1 : 0) - (b.done ? 1 : 0) || (a.due || "9999").localeCompare(b.due || "9999") || (b.prio || 0) - (a.prio || 0) || (a.created || 0) - (b.created || 0);
    });
    // Notizen: offene zuerst, mit Zeitpunkt nach Zeit, sonst die neuesten oben
    if (c === "note") return list.sort(function (a, b) {
      return (a.done ? 1 : 0) - (b.done ? 1 : 0) || (a.at ? 0 : 1) - (b.at ? 0 : 1) || (a.at || "").localeCompare(b.at || "") || (b.created || 0) - (a.created || 0);
    });
    return list.sort(function (a, b) { return (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")); });
  }
  // Wiederholungen ausrollen: rep = { f: "d" | "w" | "2w" | "m" | "y", until }, ex = ausgelassene Tage.
  function occurrences(from, to) {
    var out = [];
    live().forEach(function (e) {
      var f = e.rep && e.rep.f;
      if (!f) { if (e.date >= from && e.date <= to) out.push(e); return; }
      var until = e.rep.until && e.rep.until < to ? e.rep.until : to, ex = e.ex || [];
      var s0 = parse(e.date), step = { d: 1, w: 7, "2w": 14 }[f];
      function push(d) {
        var k = iso(d);
        if (k >= from && k <= until && k >= e.date && ex.indexOf(k) < 0) out.push(Object.assign({}, e, { date: k, sid: e.id, start: e.date }));
      }
      if (step) {
        var skip = Math.max(0, Math.floor((parse(from) - s0) / 864e5 / step) - 1);
        for (var i = skip; i < skip + 800; i++) {
          var d = new Date(s0.getFullYear(), s0.getMonth(), s0.getDate() + i * step);
          if (iso(d) > until) break; push(d);
        }
      } else {
        for (var j = 0; j < 1200; j++) {
          var dm = f === "m" ? new Date(s0.getFullYear(), s0.getMonth() + j, s0.getDate()) : new Date(s0.getFullYear() + j, s0.getMonth(), s0.getDate());
          if (iso(dm) > until) break;
          if (dm.getDate() === s0.getDate()) push(dm); // 31. gibt es nicht in jedem Monat: dann auslassen
        }
      }
    });
    return out.sort(function (a, b) { return (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")); });
  }
  /* ---------- Termine aus den Apps (nur lesen): Schule, Atmung, Training ----------
   * Gemeinsam für alle Kalender – Planer, Schule, Training und Atmung zeigen damit dieselben Einträge.
   * link = Adresse der App, linkApp/linkHash = Bereich, falls man schon in dieser App ist. */
  var LP_TYPES = { sa: ["Schulaufgabe", "#e5484d"], ka: ["Kurzarbeit", "#c99200"], ex: ["Ex", "#f76b15"], test: ["Test", "#d6409f"], referat: ["Referat", "#8e4ec6"],
    abgabe: ["Abgabe", "#0090ff"], termin: ["Schultermin", "#12a594"], frei: ["Schulfrei", "#30a46c"], sonst: ["", "#8d8d8d"], ap: ["Abschlussprüfung", "#b4231e"] };
  var JC = {};
  function jkey(k) {
    var raw = null; try { raw = localStorage.getItem(k); } catch (e) {}
    var c = JC[k]; if (c && c.raw === raw) return c.val;
    var val = null; try { val = JSON.parse(raw || "null"); } catch (e) {}
    JC[k] = { raw: raw, val: val }; return val;
  }
  function plusDays(k, n) { var d = parse(k); d.setDate(d.getDate() + n); return iso(d); }
  function eachDay(start, end, from, to, fn) {
    var a = start > from ? start : from, b = (end || start) < to ? (end || start) : to;
    for (var k = a; k <= b; k = plusDays(k, 1)) fn(k);
  }
  function addMin(t, m) { var p = t.split(":"), x = Math.min(1439, +p[0] * 60 + +p[1] + m); return pad(Math.floor(x / 60)) + ":" + pad(x % 60); }
  function where(appId, hash) { var a = APPS.find(function (x) { return x.id === appId; }); return { link: appUrl(a) + hash, linkApp: appId, linkHash: hash }; }
  function externalItems(from, to) {
    var out = [];
    var db = jkey("schulkalender-bayern-v1");
    if (db) {
      var subj = function (id) { return (db.subjects || []).find(function (x) { return x.id === id; }) || {}; };
      (db.events || []).forEach(function (e) {
        if (!e.date) return;
        var t = LP_TYPES[e.type] || LP_TYPES.sonst, sn = subj(e.subject).name || "";
        var title = [t[0], sn].filter(Boolean).join(" ") + (e.title ? (t[0] || sn ? ": " : "") + e.title : "");
        eachDay(e.date, e.end, from, to, function (k) {
          out.push(Object.assign({ id: "lp-" + e.id, title: title || "Schultermin", date: k, time: k === e.date ? e.time || "" : "", end: "", app: "Lernplan", color: t[1], note: e.notes || "", ro: "Lernplan", exam: ["sa", "ka", "ex", "test", "ap"].indexOf(e.type) > -1, subject: sn }, where("planer", "#schule")));
        });
      });
      (db.camps || []).forEach(function (c) {
        if (!c.start) return;
        eachDay(c.start, c.end, from, to, function (k) {
          out.push(Object.assign({ id: "lc-" + c.id, title: "Lehrgang" + (c.title ? ": " + c.title : "") + (c.place ? " (" + c.place + ")" : ""), date: k, time: "", app: "Lernplan", color: "#0891b2", ro: "Lernplan" }, where("planer", "#schule")));
        });
      });
    }
    // Atemübungen aus Atmung & HRV (dort geplant – auch von der Wochenplanung)
    var pp = jkey("pulsplan.v1");
    if (pp && pp.entries) pp.entries.forEach(function (e) {
      if (!e.date || e.date < from || e.date > to) return;
      out.push(Object.assign({ id: "pp-" + e.id, title: e.type || "Atemübung", date: e.date, time: e.time || "", end: e.time ? addMin(e.time, +e.dur || 10) : "", app: "Atmung", note: e.note || "", ro: "Atmung & HRV" }, where("training", "#atmung")));
    });
    // Training: erledigte Einheiten und Aktivitäten
    var log = jkey("wk_log") || {}, acts = jkey("wk_activities") || [];
    Object.keys(log).forEach(function (k) {
      var l = log[k]; if (!l || !l.done || k < from || k > to) return;
      var label = l.type === "rest" ? "Ruhetag" : l.type === "run" ? "Lauf erledigt" : "Training erledigt";
      out.push(Object.assign({ id: "tb-" + k, title: "✓ " + label + (l.sec && l.type !== "rest" ? " · " + Math.round(l.sec / 60) + " Min." : ""), date: k, time: "", app: "Training", ro: "Training" }, where("training", "")));
    });
    acts.forEach(function (a, i) {
      if (!a || !a.date || a.date < from || a.date > to) return;
      var km = a.distanceKm ? " · " + String(Math.round(a.distanceKm * 10) / 10).replace(".", ",") + " km" : "";
      out.push(Object.assign({ id: "ta-" + a.date + "-" + i, title: (a.name || a.title || a.type || "Aktivität") + km, date: a.date, time: a.time || "", app: a.source === "mobility" ? "Mobility" : "Training", ro: "Training" }, where("training", a.source === "mobility" ? "#mobility" : "")));
    });
    return out;
  }
  // Notizen mit Zeitpunkt erscheinen im Kalender (bearbeitet werden sie in der Übersicht)
  function noteItems(from, to) {
    return live("note").filter(function (n) { return n.at && !n.done && n.at.slice(0, 10) >= from && n.at.slice(0, 10) <= to; }).map(function (n) {
      var t = n.at.slice(11, 16);
      return Object.assign({ id: "nt-" + n.id, title: n.text.split("\n")[0].slice(0, 80) || "Notiz", date: n.at.slice(0, 10), time: t, end: "", app: "Notiz", color: "#e0b34e", note: n.text, ro: "Notizen", noteId: n.id }, where("planer", "#sg=x_notiz"));
    });
  }
  function allItems(from, to) {
    return occurrences(from, to).concat(externalItems(from, to), noteItems(from, to)).sort(function (a, b) {
      return (a.date + (a.time || "~")).localeCompare(b.date + (b.time || "~"));
    });
  }
  function emit() {
    var ev = live();
    listeners.forEach(function (f) { try { f(ev); } catch (e) {} });
    if (root) render(true);
  }
  window.addEventListener("storage", function (e) { if (e.key === KEY || e.key === TKEY || e.key === NKEY || e.key === null) emit(); });
  if (chan) chan.onmessage = function (m) {
    if (m.data && m.data.applied) {
      var a = DATA.find(function (x) { return x.id === m.data.applied; });
      if (a && isMe(a) && root) { bootApply(a); pending[a.id] = { kind: "reload", remote: {} }; render(true); }
      return;
    }
    emit();
  };
  document.addEventListener("visibilitychange", function () { if (!document.hidden) emit(); });

  var api = {
    app: APP,
    apps: APPS,
    sources: SOURCES,
    embedded: EMBED,
    list: function (from, to) {
      return live().filter(function (e) { return (!from || e.date >= from) && (!to || e.date <= to); });
    },
    add: function (ev) {
      return mutate(function (d) {
        var n = { id: uid(), title: String(ev.title || "Termin"), date: ev.date, time: ev.time || "", end: ev.end || "",
          note: ev.note || "", color: ev.color || "", app: ev.app || APP, created: Date.now(), changed: Date.now(),
          remind: ev.remind === "" || ev.remind == null ? null : +ev.remind };
        d.events.push(n); return n;
      });
    },
    update: function (id, patch) {
      return mutate(function (d) {
        var e = d.events.find(function (x) { return x.id === id; });
        if (!e) return null;
        Object.keys(patch).forEach(function (k) { if (k !== "id") e[k] = patch[k]; });
        e.changed = Date.now(); return e;
      });
    },
    remove: function (id) {
      // Gelöschte Termine bleiben als Markierung erhalten, damit ein Import sie nicht wiederbelebt.
      return mutate(function (d) {
        var e = d.events.find(function (x) { return x.id === id; });
        if (e) { e.deleted = true; e.changed = Date.now(); }
      });
    },
    onChange: function (f) { listeners.push(f); return function () { listeners = listeners.filter(function (x) { return x !== f; }); }; },
    occurrences: occurrences,
    externalItems: externalItems,
    allItems: allItems,
    // Einen einzelnen Termin einer Serie auslassen
    skip: function (id, date) {
      return mutate(function (d) {
        var e = d.events.find(function (x) { return x.id === id; });
        if (e) { e.ex = (e.ex || []).concat([date]); e.changed = Date.now(); }
      });
    },
    tasks: {
      list: function () { return live("todo"); },
      add: function (t) {
        return mutate(function (d) {
          var n = { id: uid(), title: String(t.title || "Aufgabe"), due: t.due || "", done: false, prio: t.prio ? 1 : 0,
            note: t.note || "", app: t.app || APP, created: Date.now(), changed: Date.now() };
          d.events.push(n); return n;
        }, "todo");
      },
      update: function (id, patch) {
        return mutate(function (d) {
          var e = d.events.find(function (x) { return x.id === id; });
          if (!e) return null;
          Object.keys(patch).forEach(function (k) { if (k !== "id") e[k] = patch[k]; });
          if ("done" in patch) e.doneAt = patch.done ? Date.now() : 0;
          e.changed = Date.now(); return e;
        }, "todo");
      },
      remove: function (id) {
        return mutate(function (d) {
          var e = d.events.find(function (x) { return x.id === id; });
          if (e) { e.deleted = true; e.changed = Date.now(); }
        }, "todo");
      }
    },
    notes: {
      list: function () { return live("note"); },
      add: function (n) {
        return mutate(function (d) {
          var x = { id: uid(), text: String(n.text || "").trim(), at: n.at || "", remind: !!(n.at && n.remind), done: false, created: Date.now(), changed: Date.now() };
          d.events.push(x); return x;
        }, "note");
      },
      update: function (id, patch) {
        return mutate(function (d) {
          var e = d.events.find(function (x) { return x.id === id; });
          if (!e) return null;
          Object.keys(patch).forEach(function (k) { if (k !== "id") e[k] = patch[k]; });
          if ("done" in patch) e.doneAt = patch.done ? Date.now() : 0;
          if (!e.at) e.remind = false;
          e.changed = Date.now(); return e;
        }, "note");
      },
      remove: function (id) {
        return mutate(function (d) {
          var e = d.events.find(function (x) { return x.id === id; });
          if (e) { e.deleted = true; e.changed = Date.now(); }
        }, "note");
      }
    },
    me: ME,
    status: function () { var c = cfg(); return { connected: !!c.token, user: c.user || "", busy: sync.busy, error: sync.error, last: sync.last || c.last || 0 }; },
    open: function (date, tab) { openPanel(date, tab); },
    sync: function () { return syncNow(); }
  };
  window.SharedCalendar = api;

  /* ---------- App-Daten für den Cloud-Sync ----------
   * Pro App wird eine Datei app-<id>.json im Gist abgelegt: { changed, data: { schlüssel: inhalt } }.
   * In meta merkt sich jedes Gerät, welchen Stand es zuletzt abgeglichen hat. Ist nur eine Seite
   * neuer, wird sie übernommen; haben sich beide geändert, entscheidet die Person. */
  function snapshot(app) {
    var data = {};
    app.keys.forEach(function (k) { var v = localStorage.getItem(k); if (v !== null) data[k] = v; });
    return data;
  }
  function hash(obj) {
    var s = JSON.stringify(obj), h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return s.length + ":" + h;
  }
  function meta() { try { return JSON.parse(localStorage.getItem(META_KEY) || "{}"); } catch (e) { return {}; } }
  function setMeta(id, m) { var all = meta(); all[id] = m; try { localStorage.setItem(META_KEY, JSON.stringify(all)); } catch (e) {} }
  var pending = {}; // id -> { remote } bei Konflikt oder wartender Übernahme in einer offenen App
  function bootApply(app) { try { localStorage.setItem("sg-apply-on-boot:" + app.id, JSON.stringify({ t: Date.now(), data: snapshot(app) })); } catch (e) {} }
  function isMe(group) { return !EMBED && ME.owns.indexOf(group.id) > -1; }
  function myPending() { var g = DATA.find(function (d) { return isMe(d) && pending[d.id]; }); return g ? [g, pending[g.id]] : null; }

  function applyRemote(app, remote) {
    app.keys.forEach(function (k) {
      if (remote.data && Object.prototype.hasOwnProperty.call(remote.data, k)) localStorage.setItem(k, window.SGFixUrl ? window.SGFixUrl(remote.data[k]) : remote.data[k]);
    });
    setMeta(app.id, { hash: hash(snapshot(app)), remote: remote.changed });
    delete pending[app.id];
    if (isMe(app)) bootApply(app);
    // Ist diese App gerade in einem anderen Fenster offen, muss sie neu laden, sonst überschreibt sie die neuen Daten.
    if (chan) try { chan.postMessage({ applied: app.id }); } catch (e) {}
  }

  /* ---------- Cloud-Sync über einen privaten GitHub-Gist ----------
   * Der Zugangsschlüssel (Token) liegt im gemeinsamen Speicher, muss also pro Gerät
   * nur einmal eingegeben werden und gilt dann für alle Apps. */
  var sync = { busy: false, again: false, timer: null, error: "", last: 0, started: Date.now() };
  function cfg() { try { return JSON.parse(localStorage.getItem(SYNC_KEY) || "null") || {}; } catch (e) { return {}; } }
  function setCfg(c) { try { if (c) localStorage.setItem(SYNC_KEY, JSON.stringify(c)); else localStorage.removeItem(SYNC_KEY); } catch (e) {} }
  function gh(path, opt, token) {
    opt = opt || {};
    return fetch(GH + path, {
      method: opt.method || "GET", cache: "no-store",
      headers: { "Authorization": "Bearer " + token, "Accept": "application/vnd.github+json", "Content-Type": "application/json" },
      body: opt.body ? JSON.stringify(opt.body) : undefined
    }).then(function (r) {
      if (r.status === 401) throw new Error("Der Token ist ungültig oder abgelaufen.");
      if (r.status === 403 || r.status === 404) throw new Error("Kein Zugriff – hat der Token das Recht „gist“?");
      if (!r.ok) throw new Error("GitHub antwortet mit Fehler " + r.status + ".");
      return r.json();
    });
  }
  function content(d) {
    var events = d.events.slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    return JSON.stringify({ v: 1, events: events }, null, 1);
  }
  function findOrCreateGist(token, d) {
    return gh("/gists?per_page=100", null, token).then(function (list) {
      var hit = list.find(function (g) { return g.files && g.files[GIST_FILE] && g.description === GIST_DESC; });
      if (hit) return hit.id;
      return gh("/gists", { method: "POST", body: { description: GIST_DESC, "public": false, files: { "kalender.json": { content: content(d) } } } }, token)
        .then(function (g) { return g.id; });
    });
  }
  // Die GitHub-API kürzt Dateien über 1 MB; dann den vollständigen Inhalt nachladen.
  function fullGist(g) {
    var cut = Object.keys(g.files || {}).filter(function (k) { return g.files[k].truncated && g.files[k].raw_url; });
    return Promise.all(cut.map(function (k) {
      return fetch(g.files[k].raw_url, { cache: "no-store" }).then(function (r) { return r.text(); }).then(function (t) { g.files[k].content = t; });
    })).then(function () { return g; });
  }
  function readJSON(f) { try { return f && f.content ? JSON.parse(f.content) : null; } catch (e) { return null; } }

  // Gleicht die Daten aller Verbund-Apps ab, nicht nur der gerade offenen –
  // so landen auch Änderungen aus einer App, die lange nicht offen war, in der Cloud.
  var EXTRA = [{ id: "einstellungen", name: "Einstellungen", keys: ["sg-design", "sg-glass", "sg-dir-v1"], lww: true }, { id: "wochenplan", name: "Wochenplanung", keys: ["sg-wochenplan-v1"], lww: true }, { id: "wissen", name: "Sportwissenschaft", keys: ["sg-wissen-v1"], lww: true }];
  function syncApps(g, files) {
    DATA.concat(EXTRA).forEach(function (app) {
      if (!app.keys.length || (app.own && app.own())) return;
      var local = snapshot(app), h = hash(local), m = meta()[app.id] || {};
      var remote = readJSON(g.files && g.files["app-" + app.id + ".json"]);
      var localChanged = h !== m.hash && Object.keys(local).length > 0;
      if (sync.adopt && remote && remote.data) { // neues Gerät: Cloud-Stand übernehmen
        applyRemote(app, remote);
        if (isMe(app)) reloadSoon();
        if (app.id === "einstellungen" && window.SGTheme) window.SGTheme.set(localStorage.getItem("sg-design") || "mitternacht");
        return;
      }
      var remoteChanged = (!m.force || !Object.keys(local).length) && remote && remote.changed && remote.changed !== m.remote && hash(remote.data || {}) !== h;
      if (remoteChanged && !localChanged) {
        if (isMe(app) && Date.now() - sync.started > 5000) pending[app.id] = { remote: remote, kind: "update" };
        else applyRemote(app, remote);
        if (isMe(app) && !pending[app.id]) reloadSoon();
        if (app.id === "einstellungen" && window.SGTheme) window.SGTheme.set(localStorage.getItem("sg-design") || "mitternacht");
      } else if (remoteChanged && localChanged && !app.lww) {
        pending[app.id] = { remote: remote, kind: "conflict" };
      } else if (localChanged || (!remote && Object.keys(local).length)) { // bei lww: eigene neuere Wahl gewinnt
        var out = { changed: Date.now(), device: deviceName(), data: local };
        files["app-" + app.id + ".json"] = { content: JSON.stringify(out) };
        setMeta(app.id, { hash: h, remote: out.changed });
      } else if (remote && remote.changed !== m.remote) {
        setMeta(app.id, { hash: h, remote: remote.changed });
      }
    });
  }
  var reloading = false;
  function reloadSoon() { if (!reloading) { reloading = true; setTimeout(function () { location.reload(); }, 300); } }
  function deviceName() {
    var ua = navigator.userAgent;
    return /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Windows/.test(ua) ? "Windows-PC" : /Mac/.test(ua) ? "Mac" : "Gerät";
  }

  function syncNow() {
    if (EMBED) return Promise.resolve(false); // eingebettete Module: die App drumherum synchronisiert
    var c = cfg();
    if (!c.token) return Promise.resolve(false);
    if (!navigator.onLine) { sync.error = "Offline – wird nachgeholt, sobald Internet da ist."; render(true); return Promise.resolve(false); }
    if (sync.busy) { sync.again = true; return Promise.resolve(false); }
    sync.busy = true; render(true);
    var token = c.token;
    var idP = c.gist ? Promise.resolve(c.gist) : findOrCreateGist(token, load());
    return idP.then(function (id) {
      if (id !== c.gist) { c = cfg(); c.gist = id; setCfg(c); }
      return gh("/gists/" + id, null, token).then(fullGist).then(function (g) {
        var files = {};
        // Termine und Aufgaben: frisch lesen, damit Änderungen während der Anfrage nicht verloren gehen.
        Object.keys(COLS).forEach(function (c) {
          var col = COLS[c];
          var remote = readJSON(g.files && g.files[col.file]) || { events: [] };
          var d = load(c);
          if (mergeInto(d, remote.events, c).changed) save(d, true, c);
          var local = content(load(c));
          var rd = { events: remote.events || [] }; purge(rd);
          if (local !== content(rd)) files[col.file] = { content: local };
        });
        syncApps(g, files);
        if (Object.keys(files).length) return gh("/gists/" + id, { method: "PATCH", body: { files: files } }, token);
      });
    }).then(function () {
      sync.error = ""; sync.last = Date.now();
      var c2 = cfg(); if (c2.token) { c2.last = sync.last; setCfg(c2); }
      return true;
    }).catch(function (e) {
      sync.error = (e && e.message && !/fetch|network/i.test(e.message)) ? e.message : "Keine Verbindung zu GitHub.";
      // Gist wurde womöglich gelöscht: beim nächsten Mal neu suchen.
      if (/Kein Zugriff/.test(sync.error)) { var c3 = cfg(); delete c3.gist; setCfg(c3); }
      return false;
    }).then(function (ok) {
      sync.busy = false; render(true);
      if (sync.again) { sync.again = false; syncNow(); }
      return ok;
    });
  }
  function schedulePush() {
    if (!cfg().token) return;
    clearTimeout(sync.timer);
    sync.timer = setTimeout(syncNow, 1500);
  }
  // Regelmäßig nachsehen, ob ein anderes Gerät etwas geändert hat (nur solange die App sichtbar ist).
  setInterval(function () { if (!document.hidden) syncNow(); }, 30000);
  // Beim Verlassen der App die eigenen Änderungen sofort hochladen.
  document.addEventListener("visibilitychange", function () { syncNow(); });
  window.addEventListener("online", function () { syncNow(); });
  setTimeout(syncNow, 800);

  /* ---------- Erinnerungen ----------
   * remind = Minuten vor Beginn (ganztägig: bezogen auf 8 Uhr). Solange irgendeine App offen ist,
   * wird alle 30 Sekunden geprüft. Was schon gemeldet wurde, steht im gemeinsamen Speicher –
   * so meldet sich jeder Termin nur einmal, egal wie viele Apps offen sind. */
  var FIRED_KEY = "sg-reminders-fired";
  var REMIND = [["", "Keine"], ["0", "Zu Beginn"], ["5", "5 Min. vorher"], ["10", "10 Min. vorher"], ["15", "15 Min. vorher"], ["30", "30 Min. vorher"],
    ["60", "1 Std. vorher"], ["120", "2 Std. vorher"], ["1440", "1 Tag vorher"]];
  function notifyOk() { return "Notification" in window && Notification.permission === "granted"; }
  function askNotify() {
    if (!("Notification" in window) || Notification.permission !== "default") return Promise.resolve(notifyOk());
    return Promise.resolve(Notification.requestPermission()).then(function () { render(); return notifyOk(); });
  }
  function show(title, body, tag) {
    var opt = { body: body, tag: tag, icon: location.origin + BASE + "icon-192.png", data: { url: location.origin + BASE + "#cal" } };
    var fallback = function () { try { new Notification(title, opt); } catch (e) {} };
    if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(function (r) { return r.showNotification(title, opt); }).catch(fallback);
    else fallback();
  }
  function checkReminders() {
    if (EMBED || !notifyOk()) return;
    var now = Date.now(), fired;
    try { fired = JSON.parse(localStorage.getItem(FIRED_KEY) || "{}"); } catch (e) { fired = {}; }
    var t = iso(new Date()), list = occurrences(iso(new Date(now - 864e5)), iso(new Date(now + 2 * 864e5)));
    list.forEach(function (e) {
      if (e.remind == null || e.remind === "") return;
      var p = e.date.split("-"), hm = (e.time || "08:00").split(":");
      var start = new Date(+p[0], +p[1] - 1, +p[2], +hm[0], +hm[1]).getTime(), at = start - e.remind * 60000, key = e.id + "@" + e.date;
      // nur melden, wenn der Zeitpunkt erreicht ist, aber höchstens 2 Stunden zu spät
      if (fired[key] || now < at || now > at + 2 * 3600000) return;
      fired[key] = now;
      var when = e.date === t ? "Heute" : "Morgen";
      show(e.title, (e.time ? when + " um " + e.time + " Uhr" + (e.end ? " bis " + e.end : "") : when + ", ganztägig") + " · " + e.app, key);
    });
    // Notizen mit Erinnerung: genau zum eingestellten Zeitpunkt (höchstens 12 Stunden zu spät)
    live("note").forEach(function (n) {
      if (!n.remind || !n.at || n.done) return;
      var at = new Date(n.at).getTime(), key = "n-" + n.id + "@" + n.at;
      if (fired[key] || isNaN(at) || now < at || now > at + 12 * 3600000) return;
      fired[key] = now;
      show("Notiz", n.text.slice(0, 160), key);
    });
    Object.keys(fired).forEach(function (k) { if (now - fired[k] > 4 * 864e5) delete fired[k]; });
    try { localStorage.setItem(FIRED_KEY, JSON.stringify(fired)); } catch (e) {}
  }
  setInterval(checkReminders, 30000);
  setTimeout(checkReminders, 1500);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) checkReminders(); });
  api.remindOptions = REMIND;
  api.askNotify = askNotify;
  api.notifyState = function () { return "Notification" in window ? Notification.permission : "unsupported"; };

  /* ---------- Hilfen ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function appColor(name) {
    var a = SOURCES.find(function (x) { return x[0] === name; });
    if (a) return a[1];
    var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return COLORS[h % COLORS.length];
  }
  function colorOf(e) { return e.color || appColor(e.app || ""); }
  function longDate(s) {
    var d = parse(s);
    return ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][d.getDay()] + ", " + d.getDate() + ". " + MON[d.getMonth()] + " " + d.getFullYear();
  }
  function download(name, type, text) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function appUrl(app) { return location.origin + BASE + (app.path ? app.path + "/" : ""); }
  // Hell oder dunkel? Richtet sich nach dem tatsächlichen Hintergrund der App, damit das Fenster passt.
  function isDark() { return true; } // alle Apps laufen im Dunkelmodus
  function themeVars() {
    var t = window.SGTheme ? window.SGTheme.current() : { s1: "#151b23", s2: "#1c2430", s3: "#243040", line: "#2a3646", ink: "#e6edf3", muted: "#9aa7b4", acc: "#6ea8fe" };
    return "--bg:" + t.s1 + ";--s1:" + t.s2 + ";--s2:" + t.s3 + ";--line:" + t.line + ";--fg:" + t.ink + ";--mut:" + t.muted + ";--acc:" + t.acc + ";--accfg:#14120f";
  }
  var ICON = "<svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round'><rect x='3.5' y='5' width='17' height='15.5' rx='2.5'/><path d='M3.5 9.5h17M8 3v4M16 3v4'/><path d='M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2'/></svg>";

  /* ---------- Oberfläche (Shadow DOM, damit sich die Styles der Apps nicht gegenseitig stören) ---------- */
  var host, root, state = { month: null, sel: null, edit: null, filter: false, tab: "cal" };
  var CSS = [
    ":host{all:initial}",
    "*{box-sizing:border-box;font-family:'Inter SG',Inter,-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,'Helvetica Neue',system-ui,sans-serif}",
    ".v{--bg:#f3f1ec;--s1:#fff;--s2:#ebe8e1;--line:#dad5cb;--fg:#1d1c19;--mut:#67635b;--acc:" + ME.color + ";--accfg:#fff}",
    ".v.dark{--bg:#1c1b19;--s1:#1c1b19;--s2:#2a2926;--line:#3a3833;--fg:#ebe9e4;--mut:#a29e95}",
    ".fab{position:fixed;z-index:2147483000;width:46px;height:46px;border-radius:14px;cursor:pointer;touch-action:none;",
    "background:var(--s1);color:var(--fg);border:1px solid var(--line);box-shadow:0 1px 2px rgba(0,0,0,.08),0 6px 18px rgba(0,0,0,.14);",
    "display:flex;align-items:center;justify-content:center}",
    ".fab.edge{width:30px;height:54px;border-radius:12px 0 0 12px;border-right:0;box-shadow:-2px 2px 10px rgba(0,0,0,.3)}.fab.edge svg{width:18px;height:18px}.fab.edge .dot{top:-6px;right:auto;left:-6px}",
    ".fab .dot{position:absolute;top:-5px;right:-5px;min-width:19px;height:19px;padding:0 5px;border-radius:10px;background:var(--acc);color:var(--accfg);font-size:11px;line-height:19px;font-weight:700;text-align:center}",
    ".wrap{position:fixed;inset:0;z-index:2147483001;background:rgba(20,18,15,.42);display:flex;align-items:flex-end;justify-content:center}",
    "@media(min-width:700px){.wrap{align-items:center}}",
    ".panel{background:color-mix(in srgb,var(--bg) 78%,transparent);-webkit-backdrop-filter:blur(30px) saturate(170%);backdrop-filter:blur(30px) saturate(170%);border:1px solid rgba(255,255,255,.1);color:var(--fg);width:100%;max-width:540px;max-height:92vh;overflow:auto;border-radius:26px 26px 0 0;",
    "padding:14px 16px calc(18px + env(safe-area-inset-bottom,0px));font-size:15px;line-height:1.4}",
    "@media(min-width:700px){.panel{border-radius:26px}}",
    ".top{display:flex;align-items:center;gap:8px;margin:0 0 12px}",
    ".tabs{flex:1;display:flex;background:var(--s2);border-radius:10px;padding:3px;gap:2px}",
    ".tabs button{flex:1;border:0;background:transparent;color:var(--mut);padding:7px 4px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}",
    ".tabs button.on{background:var(--s1);color:var(--fg);box-shadow:0 1px 2px rgba(0,0,0,.12)}",
    ".hd{display:flex;align-items:center;gap:8px;margin-bottom:10px}",
    ".hd h2{flex:1;margin:0;font-size:19px;font-weight:700;letter-spacing:-.01em}",
    "button.b{border:1px solid var(--line);background:var(--s1);color:var(--fg);border-radius:9px;padding:7px 12px;font-size:14px;cursor:pointer}",
    "button.p{background:var(--acc);border-color:var(--acc);color:var(--accfg);font-weight:600}",
    "button.d{color:#c0303f}",
    "button.x{border:0;background:transparent;color:var(--mut);font-size:20px;width:34px;height:34px;cursor:pointer}",
    ".grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}",
    ".wd{text-align:center;font-size:12px;color:var(--mut);padding:2px 0 4px}",
    ".c{min-height:46px;border-radius:8px;padding:4px 2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;border:1px solid transparent}",
    ".c:hover{background:var(--s2)}.c.o{opacity:.35}.c.t .n{background:var(--fg);color:var(--bg)}.c.s{border-color:var(--acc);background:var(--s1)}",
    ".n{font-size:14px;width:26px;height:26px;line-height:26px;text-align:center;border-radius:50%;font-variant-numeric:tabular-nums}",
    ".ds{display:flex;gap:2px;flex-wrap:wrap;justify-content:center;margin-top:2px}.ds i{width:5px;height:5px;border-radius:50%}",
    ".sec{margin-top:16px}.sec h3{font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em;color:var(--mut);font-weight:600}",
    ".ev{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:10px;background:var(--s1);border:1px solid var(--line);margin-bottom:6px;cursor:pointer}",
    ".bar{width:3px;align-self:stretch;border-radius:2px}",
    ".ev .t{font-weight:600}.m{font-size:13px;color:var(--mut)}",
    ".empty{color:var(--mut);font-size:14px;padding:4px 0}",
    "label{display:block;font-size:13px;color:var(--mut);margin:12px 0 4px}",
    "input,textarea,select{width:100%;padding:10px 11px;border-radius:9px;border:1px solid var(--line);background:var(--s1);color:var(--fg);font-size:16px}",
    "textarea{min-height:70px;resize:vertical}",
    ".row{display:flex;gap:8px}.row>*{flex:1}",
    ".act{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}.act .sp{flex:1}",
    ".tools{display:flex;gap:6px;flex-wrap:wrap;margin-top:18px;padding-top:12px;border-top:1px solid var(--line)}",
    ".tools button.b{font-size:13px;padding:6px 10px}",
    ".chk{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--mut);margin:8px 0 0}.chk input{width:auto}",
    ".cl{font-size:13px;color:var(--mut);margin:10px 0 0;cursor:pointer}.cl.ok{color:#2f7d57}.cl.err{color:#c0303f}",
    ".v.dark .cl.ok{color:#6cc79a}.v.dark .cl.err,.v.dark button.d{color:#f0727c}",
    ".txt{font-size:14px;margin:8px 0}.txt a{color:var(--acc)}ol.txt{padding-left:20px}ol.txt li{margin:5px 0}code{background:var(--s2);padding:1px 4px;border-radius:4px}",
    "button.b[disabled]{opacity:.5}",
    ".task{display:flex;gap:8px;align-items:center;padding:7px 2px;font-size:14px;cursor:pointer}.task input{width:auto;margin:0}.task em{color:#c0303f;font-style:normal;font-size:12px}",
    ".qt{margin-top:4px;font-size:14px;padding:8px 10px}",
    "a.b{text-decoration:none;display:inline-block}a.big{font-weight:600}",
    ".themes{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    ".th{text-align:left;border:2px solid;border-radius:12px;padding:10px;cursor:pointer;display:flex;flex-direction:column;gap:3px}",
    ".th b{font-size:14px}.th small{font-size:12px;line-height:1.3}.th.on{box-shadow:0 0 0 1px var(--acc)}",
    ".pv{display:flex;gap:4px;margin-bottom:4px}.pv i{width:18px;height:18px;border-radius:5px;display:block}.pv i:last-child{border-radius:50%}",
    ".hist{display:flex;flex-direction:column;gap:4px;margin-top:8px}.hist button{text-align:left;border:1px solid var(--line);background:var(--s1);color:var(--fg);border-radius:9px;padding:9px 11px;font-size:14px;cursor:pointer}",
    ".bl{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.bl span{background:var(--s2);border-radius:7px;padding:3px 8px;font-size:12px}",
    ".apps{display:flex;flex-direction:column;gap:8px}",
    ".app .ah{display:flex;gap:10px;align-items:center;color:var(--fg);text-decoration:none}.secs{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}",
    ".secs a{font-size:12.5px;padding:4px 9px;border-radius:7px;background:var(--s2);color:var(--fg);text-decoration:none}",
    ".app{display:block;padding:11px;border-radius:12px;background:var(--s1);border:1px solid var(--line);color:var(--fg);text-decoration:none}",
    ".app.me{border-color:var(--fg)}",
    ".mono{flex:none;width:36px;height:36px;border-radius:10px;color:#fff;font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center}",
    ".app b{display:block;font-size:14px}.app span{display:block;font-size:12px;color:var(--mut);line-height:1.3}",
    ".toast{position:fixed;left:12px;right:12px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:2147483002;max-width:520px;margin:0 auto;",
    "background:var(--fg);color:var(--bg);border-radius:12px;padding:12px 14px;font-size:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;box-shadow:0 8px 24px rgba(0,0,0,.25)}",
    ".inst{bottom:calc(84px + env(safe-area-inset-bottom,0px));background:var(--s1);color:var(--fg);border:1px solid var(--line);padding:10px 12px}",
    ".toast.inst{display:grid;grid-template-columns:40px minmax(0,1fr);gap:4px 12px;align-items:center}",
    ".inst .mono{width:40px;height:40px;min-width:0;border-radius:11px}.inst .it{min-width:0}.inst .it b{display:block;font-size:14.5px}.inst .it small{display:block;font-size:12.5px;color:var(--mut);line-height:1.35}",
    ".inst .ia{grid-column:1/-1;display:flex;justify-content:flex-end;gap:6px}",
    ".inst button.go{background:var(--acc);color:var(--accfg);padding:9px 14px;font-size:14px}.inst button.no{background:transparent;color:var(--mut)}",
    "@media(min-width:1001px){.inst{bottom:20px;left:auto;right:20px;max-width:400px}}",
    "button.ib{width:100%;margin-top:10px;border:0;border-radius:9px;padding:10px 12px;font-size:14px;font-weight:600;cursor:pointer;background:var(--acc);color:var(--accfg)}",
    ".ok2{margin-top:9px;font-size:12.5px;color:#6cc79a}",
    ".wpw .stdbox{border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:12px 0}.wpw .stdbox .sh{display:flex;justify-content:space-between;align-items:center}.wpw .stdbox .sh a{color:var(--acc);font-size:14px}.wpw .stdbox .txt{margin:6px 0 10px}" +
    ".wpw .act2{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 4px}.wpw .act2 .b{flex:1;min-width:140px}",
    ".wpw .panel{max-width:560px}.wpprog{display:flex;gap:4px;margin:-4px 0 12px}.wpprog i{flex:1;height:4px;border-radius:2px;background:var(--s2)}.wpprog i.on{background:var(--acc)}",
    "h3.q{font-size:16px;margin:16px 0 4px;font-weight:700}",
    ".prows{display:flex;flex-direction:column;margin-top:6px}.prow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:7px 0;border-top:1px solid var(--line)}.prow.past{opacity:.4}",
    ".prow .pd{width:52px;font-weight:600;font-size:14px;display:flex;flex-direction:column;line-height:1.15}.prow .pd small{font-weight:400;font-size:11px;color:var(--mut)}",
    ".prow{display:grid;grid-template-columns:52px minmax(0,1fr) minmax(0,1fr);gap:6px 8px}.prow.k-run{grid-template-columns:52px minmax(0,1fr) minmax(0,1fr) 64px}",
    ".prow.k-train .pd{grid-row:span 2}.prow.k-train select[data-p=kind]{grid-column:2/4}",
    "@media(min-width:560px){.prow.k-train{grid-template-columns:52px minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)}.prow.k-train .pd{grid-row:auto}.prow.k-train select[data-p=kind]{grid-column:auto}}",
    ".prow select,.prow input{min-width:0;width:100%;padding:8px;min-height:40px;font-size:15px}",
    ".prow.extra{border-top:1px dashed var(--line)}.prow.extra .pd{align-items:flex-start;gap:3px}.prow.extra .pd small{font-size:10.5px;line-height:1.1}.prow .del{border:0;background:var(--s2);color:var(--fg);width:22px;height:22px;border-radius:50%;cursor:pointer;line-height:1;font-size:15px;flex:none}",
    "button.addu{border:0;background:none;color:var(--acc);font-size:13px;padding:2px 0 8px 60px;cursor:pointer;text-align:left}",
    "button.same{border:0;background:none;color:var(--acc);font-size:13px;padding:6px 0;cursor:pointer}",
    ".wdays{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin:8px 0 4px}",
    ".wd{border:1px solid var(--line);background:var(--s1);color:var(--fg);border-radius:10px;padding:8px 0 6px;font-size:14px;font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;min-height:48px}",
    ".wd small{font-size:10.5px;font-weight:400;color:var(--mut);margin-top:1px}.wd.on{background:var(--acc);border-color:var(--acc);color:var(--accfg)}.wd.on small{color:var(--accfg);opacity:.8}.wd.past{opacity:.35}",
    ".seg{display:grid;grid-template-columns:1fr 1fr;gap:8px}.seg.s3{grid-template-columns:1fr 1fr 1fr}.seg button{border:1px solid var(--line);background:var(--s1);color:var(--fg);border-radius:10px;padding:10px;font-size:14px;font-weight:600;cursor:pointer;text-align:left}",
    ".seg button small{display:block;font-weight:400;font-size:12px;color:var(--mut);margin-top:2px}.seg button.on{border-color:var(--acc);box-shadow:0 0 0 1px var(--acc)}",
    ".txt a{color:var(--acc)}.wpw .row{margin-top:2px}.wpw input[type=time],.wpw select{min-height:44px}",
    ".appb{position:fixed;z-index:41;top:calc(env(safe-area-inset-top,0px) + 9px);right:12px;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.1);color:var(--fg);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;",
    "background:color-mix(in srgb,var(--s1) 72%,transparent);-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);box-shadow:0 8px 28px rgba(0,0,0,.45)}",
    ".appb svg{width:20px;height:20px}.appb:active{transform:scale(.94)}",
    ".appm{position:fixed;z-index:2147483002;width:300px;max-width:calc(100vw - 16px);padding:6px;border-radius:20px;display:none;flex-direction:column;gap:6px;",
    "background:color-mix(in srgb,var(--bg) 74%,transparent);-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);border:1px solid rgba(255,255,255,.1);box-shadow:0 18px 50px rgba(0,0,0,.55);transform-origin:bottom left}",
    ".appm.on{display:flex;animation:sgpop .16s ease-out}@keyframes sgpop{from{opacity:0;transform:scale(.96) translateY(6px)}to{opacity:1;transform:none}}",
    ".appm .mg{display:flex;flex-direction:column;background:rgba(255,255,255,.05);border-radius:14px;overflow:hidden}",
    ".appm .mr{display:flex;align-items:center;gap:12px;padding:9px 12px;border:0;background:none;color:var(--fg);text-align:left;cursor:pointer;min-height:48px;font:inherit}",
    ".appm .mr+.mr{border-top:1px solid rgba(255,255,255,.07)}.appm .mr:active,.appm .mr:hover{background:rgba(255,255,255,.07)}",
    ".appm .mi{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;flex:none}.appm .mi svg{width:18px;height:18px}",
    ".appm .mt{flex:1;min-width:0;display:flex;flex-direction:column}.appm .mt b{font-size:15px;font-weight:600}.appm .mt small{font-size:12.5px;color:var(--mut)}",
    ".appm .ck{color:var(--acc);font-weight:700}.appm .chev{color:var(--mut);font-size:18px}.appm kbd{font:12px inherit;color:var(--mut)}",
    ".palw{position:fixed;inset:0;z-index:2147483003;background:rgba(0,0,0,.35);display:flex;justify-content:center;align-items:flex-start;padding:calc(60px + env(safe-area-inset-top,0px)) 12px 12px}",
    ".palp{width:100%;max-width:600px;max-height:76vh;display:flex;flex-direction:column;border-radius:22px;overflow:hidden;background:color-mix(in srgb,var(--bg) 80%,transparent);-webkit-backdrop-filter:blur(30px) saturate(170%);backdrop-filter:blur(30px) saturate(170%);border:1px solid rgba(255,255,255,.1);box-shadow:0 20px 60px rgba(0,0,0,.5)}",
    ".palin{border:0!important;border-bottom:1px solid var(--line)!important;border-radius:0!important;background:transparent!important;font-size:17px!important;padding:16px 18px!important}",
    ".pall{overflow:auto;padding:6px}.palg{font-size:12px;font-weight:600;color:var(--mut);padding:10px 12px 4px}",
    ".pali{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;font-size:15px;cursor:pointer}.pali span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".pali.on{background:rgba(255,255,255,.1)}.pali kbd{font:12px inherit;color:var(--mut)}",
    ".palf{font-size:11.5px;color:var(--mut);padding:8px 14px;border-top:1px solid var(--line)}@media(max-width:700px){.palf{display:none}}",
    ".toast span{flex:1;min-width:180px}.toast button{border:0;border-radius:8px;padding:7px 10px;font-size:13px;font-weight:600;cursor:pointer;background:var(--bg);color:var(--fg)}"
  ].join("");

  function mount() {
    if (host) return;
    host = document.createElement("div");
    host.id = "sg-shared-calendar";
    root = host.attachShadow({ mode: "open" });
    var st = document.createElement("style"); st.textContent = CSS; root.appendChild(st);
    var v = document.createElement("div"); v.className = "v"; root.appendChild(v);
    var fab = document.createElement("button");
    if (script && script.getAttribute("data-fab") === "off") fab.style.display = "none"; // die Kalender-App braucht den Knopf nicht
    fab.className = "fab"; fab.title = "Kalender & Apps"; fab.setAttribute("aria-label", "Kalender und Apps");
    fab.innerHTML = ICON + "<span class='dot' hidden></span>";
    v.appendChild(fab);
    var box = document.createElement("div"); box.className = "box"; v.appendChild(box);
    var toast = document.createElement("div"); toast.className = "tbox"; v.appendChild(toast);
    var ib = document.createElement("div"); ib.className = "ibox"; v.appendChild(ib);
    var wb = document.createElement("div"); wb.className = "wpbox"; v.appendChild(wb);
    var wt = document.createElement("div"); wt.className = "wptoast"; v.appendChild(wt);
    var pb = document.createElement("div"); pb.className = "palbox"; v.appendChild(pb);
    document.body.appendChild(host);
    placeFab(fab);
    dragFab(fab);
    // Der App-Wechsler oben ersetzt den Knopf am Rand (Kalender, Design und Sync stehen in den Befehlen)
    fab.style.display = "none";
    mountSwitcher();
    render();
  }

  // Handy: schmale Lasche am rechten Rand (verdeckt kaum Inhalt, nur senkrecht verschiebbar). Laptop: runder Knopf.
  function edge() { return window.innerWidth <= 760; }
  function placeFab(fab) {
    var p = null;
    try { p = JSON.parse(localStorage.getItem(POS_KEY + ":" + APP) || "null"); } catch (e) {}
    fab.classList.toggle("edge", edge());
    var x = edge() ? window.innerWidth - 30 : p && p.x != null ? p.x : window.innerWidth - 66, y = p ? p.y : window.innerHeight * (edge() ? .58 : 1) - (edge() ? 0 : 150);
    if (edge()) { fab.style.left = x + "px"; fab.style.top = Math.max(60, Math.min(window.innerHeight - 140, y)) + "px"; return; }
    fab.style.left = Math.max(4, Math.min(window.innerWidth - 50, x)) + "px";
    fab.style.top = Math.max(4, Math.min(window.innerHeight - 50, y)) + "px";
  }
  // Der Knopf lässt sich verschieben, falls er in einer App etwas verdeckt (Position wird pro App gemerkt).
  function dragFab(fab) {
    var sx, sy, ox, oy, moved = false, down = false;
    fab.addEventListener("pointerdown", function (e) {
      down = true; moved = false; sx = e.clientX; sy = e.clientY; ox = fab.offsetLeft; oy = fab.offsetTop;
      try { fab.setPointerCapture(e.pointerId); } catch (_) {}
    });
    fab.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 8) return;
      moved = true;
      if (!edge()) fab.style.left = Math.max(4, Math.min(window.innerWidth - 50, ox + dx)) + "px";
      fab.style.top = Math.max(4, Math.min(window.innerHeight - 50, oy + dy)) + "px";
    });
    fab.addEventListener("pointerup", function () {
      if (!down) return; down = false;
      if (moved) try { localStorage.setItem(POS_KEY + ":" + APP, JSON.stringify({ x: edge() ? null : fab.offsetLeft, y: fab.offsetTop })); } catch (e) {}
    });
    fab.addEventListener("pointercancel", function () { down = false; });
    // Erst beim Klick öffnen: so landet der Tipp nicht zusätzlich auf dem Fenster, das sich gerade öffnet.
    fab.addEventListener("click", function () { if (moved) { moved = false; return; } openPanel(); });
    window.addEventListener("resize", function () { placeFab(fab); });
  }

  function openPanel(date, tab) {
    mount();
    var d = date ? parse(date) : new Date();
    state.sel = iso(d); state.month = new Date(d.getFullYear(), d.getMonth(), 1);
    state.edit = null; state.tab = tab || "cal"; state.open = true;
    render();
  }
  function close() { state.open = false; state.edit = null; render(); }

  function render(bg) {
    if (!root) return;
    var vv = root.querySelector(".v"); vv.classList.add("dark"); vv.setAttribute("style", themeVars());
    var today = iso(new Date());
    renderToast();
    renderInstall();
    renderWpToast();
    var box = root.querySelector(".box");
    if (!state.open) { box.innerHTML = ""; return; }
    // Termine nur ausrollen, wenn das Fenster wirklich offen ist (spart bei jeder Änderung Rechenzeit)
    var all = occurrences(iso(new Date(Date.now() - 400 * 864e5)), iso(new Date(Date.now() + 800 * 864e5)));
    // Hintergrund-Updates (andere App, anderes Gerät) dürfen kein gerade ausgefülltes Formular überschreiben.
    if (bg && (state.edit || (state.tab === "sync" && !cfg().token))) return;
    var evs = state.filter ? all.filter(function (e) { return e.app === APP; }) : all;
    var h = "<div class='wrap'><div class='panel' role='dialog' aria-label='Kalender und Apps'>";
    if (state.edit) h += form(state.edit);
    else {
      h += "<div class='top'><div class='tabs' role='tablist'>" +
        [["cal", "Kalender"], ["apps", "Apps"], ["design", "Design"], ["sync", "Sync"]].map(function (t) {
          return "<button role='tab' data-tab='" + t[0] + "' class='" + (state.tab === t[0] ? "on" : "") + "'>" + t[1] + "</button>";
        }).join("") + "</div><button class='x' data-a='close' aria-label='Schließen'>✕</button></div>";
      h += state.tab === "apps" ? appsView() : state.tab === "sync" ? cloudView() : state.tab === "design" ? designView() : month(evs, today);
    }
    h += "</div></div>";
    box.innerHTML = h;
    bind(box);
  }

  /* ---------- Als App installieren (Chrome / Samsung Internet) ---------- */
  var IKEY = "sg-install-later:" + ME.id;
  function standalone() {
    try { return window.SGInstalled || matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: minimal-ui)").matches || navigator.standalone === true; } catch (e) { return false; }
  }
  function installNow() {
    var e = window.SGInstallEvt;
    if (!e) { state.instHelp = true; openPanel(null, "apps"); return Promise.resolve(false); }
    window.SGInstallEvt = null;
    e.prompt();
    return e.userChoice.then(function (r) {
      if (r && r.outcome === "accepted") window.SGInstalled = true;
      render(true); return !!(r && r.outcome === "accepted");
    }).catch(function () { render(true); return false; });
  }
  window.SGInstall = {
    available: function () { return !!window.SGInstallEvt; },
    installed: standalone,
    prompt: installNow
  };
  function installHelp() {
    return "<ol class='txt'><li><b>Chrome:</b> oben rechts ⋮ → <b>„App installieren“</b> (oder „Zum Startbildschirm hinzufügen“ → „Installieren“).</li>" +
      "<li><b>Samsung Internet:</b> unten ≡ → <b>„Seite hinzufügen zu“</b> → „Apps-Bildschirm“.</li>" +
      "<li>Steht dort nur „Verknüpfung erstellen“: Seite einmal neu laden und kurz warten, dann erneut versuchen.</li></ol>";
  }
  function renderInstall() {
    var ib = root.querySelector(".ibox");
    var later = 0; try { later = +localStorage.getItem(IKEY) || 0; } catch (e) {}
    if (standalone() || !window.SGInstallEvt || state.open || wp || wpDue() || Date.now() - later < 7 * 864e5) { ib.innerHTML = ""; return; }
    ib.innerHTML = "<div class='toast inst'><span class='mono' style='background:" + ME.color + "'>" + esc(ME.name.charAt(0)) + "</span>" +
      "<div class='it'><b>" + esc(ME.name) + " als App installieren</b><small>Eigenes Symbol, startet schneller, läuft offline.</small></div>" +
      "<div class='ia'><button class='no' data-i='later'>Später</button><button class='go' data-i='go'>Installieren</button></div></div>";
    ib.querySelectorAll("[data-i]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.i === "go") installNow();
        else { try { localStorage.setItem(IKEY, String(Date.now())); } catch (e) {} renderInstall(); }
      });
    });
  }
  window.addEventListener("sg-install", function () { if (root) render(true); });

  function renderToast() {
    var tb = root.querySelector(".tbox"), mp = myPending(), p = mp && mp[1], MYDATA = mp && mp[0];
    if (!p) { tb.innerHTML = ""; return; }
    var who = p.remote.device ? " (" + esc(p.remote.device) + ")" : "";
    tb.innerHTML = p.kind === "reload"
      ? "<div class='toast'><span>Die Daten dieser App wurden gerade vom Sync aktualisiert.</span><button data-t='reload'>Neu laden</button></div>"
      : p.kind === "conflict"
      ? "<div class='toast'><span>Deine Daten in " + esc(MYDATA.name) + " wurden hier und auf einem anderen Gerät" + who + " geändert. Welche Fassung soll gelten?</span><button data-t='mine'>Diese hier</button><button data-t='theirs'>Die andere</button></div>"
      : "<div class='toast'><span>Neue Daten von einem anderen Gerät" + who + ".</span><button data-t='theirs'>Jetzt laden</button></div>";
    tb.querySelectorAll("[data-t]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.t === "reload") location.reload();
        else if (b.dataset.t === "theirs") { applyRemote(MYDATA, p.remote); location.reload(); }
        else { setMeta(MYDATA.id, { hash: "", remote: p.remote.changed }); delete pending[MYDATA.id]; renderToast(); syncNow(); }
      });
    });
  }

  function month(evs, today) {
    var m = state.month, y = m.getFullYear(), mo = m.getMonth();
    var byDay = {};
    evs.forEach(function (e) { (byDay[e.date] = byDay[e.date] || []).push(e); });
    var h = "<div class='hd'><h2>" + MON[mo] + " " + y + "</h2><button class='b' data-a='prev' aria-label='Voriger Monat'>‹</button>" +
      "<button class='b' data-a='today'>Heute</button><button class='b' data-a='next' aria-label='Nächster Monat'>›</button></div>";
    h += "<div class='grid'>" + WD.map(function (w) { return "<div class='wd'>" + w + "</div>"; }).join("");
    var start = new Date(y, mo, 1 - ((m.getDay() + 6) % 7));
    for (var i = 0; i < 42; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), k = iso(d);
      if (i === 35 && d.getMonth() !== mo) break;
      var cls = "c" + (d.getMonth() !== mo ? " o" : "") + (k === today ? " t" : "") + (k === state.sel ? " s" : "");
      var dots = (byDay[k] || []).slice(0, 4).map(function (e) { return "<i style='background:" + colorOf(e) + "'></i>"; }).join("");
      h += "<div class='" + cls + "' data-day='" + k + "'><span class='n'>" + d.getDate() + "</span><span class='ds'>" + dots + "</span></div>";
    }
    h += "</div>";
    h += "<label class='chk'><input type='checkbox' data-a='filter'" + (state.filter ? " checked" : "") + "> Nur Termine aus „" + esc(APP) + "“</label>";
    var list = byDay[state.sel] || [];
    h += "<div class='sec'><div class='hd'><h3 style='flex:1;margin:0'>" + longDate(state.sel) + "</h3><button class='b p' data-a='new'>+ Termin</button></div>";
    h += list.length ? list.map(function (e) { return item(e); }).join("") : "<div class='empty'>Keine Termine an diesem Tag.</div>";
    h += "</div>";
    var tasks = live("todo").filter(function (t) { return !t.done && (t.due === state.sel || (state.sel === today && t.due && t.due < today)); });
    h += "<div class='sec'><h3>Aufgaben</h3>" + tasks.map(function (t) {
      return "<label class='task'><input type='checkbox' data-task='" + esc(t.id) + "'><span>" + esc(t.title) +
        (t.due < today ? " <em>überfällig</em>" : "") + "</span></label>";
    }).join("") + "<input class='qt' name='quicktask' placeholder='+ Aufgabe für diesen Tag' maxlength='120' enterkeyhint='done'></div>";
    var seen = {}; // Serien nur mit dem nächsten Termin zeigen
    var upcoming = evs.filter(function (e) { if (e.date <= state.sel || seen[e.id]) return false; seen[e.id] = 1; return true; }).slice(0, 5);
    if (upcoming.length) h += "<div class='sec'><h3>Danach</h3>" + upcoming.map(function (e) { return item(e, true); }).join("") + "</div>";
    if ("Notification" in window && Notification.permission === "default") h += "<div class='cl' data-a='notify'>Erinnerungen als Benachrichtigung erlauben</div>";
    h += "<div class='tools'><a class='b big' href='" + esc(appUrl(APPS[0]) + "#cal") + "'>Großer Kalender</a><button class='b' data-a='weekplan'>Woche planen</button><button class='b' data-a='export'>Sichern</button><button class='b' data-a='import'>Importieren</button><button class='b' data-a='ics'>.ics-Export</button></div>";
    return h;
  }

  function item(e, withDate) {
    var meta = [];
    if (withDate) meta.push(parse(e.date).getDate() + ". " + MON[parse(e.date).getMonth()]);
    if (e.time) meta.push(e.time + (e.end ? "–" + e.end : "") + " Uhr");
    meta.push(e.app);
    return "<div class='ev' data-id='" + esc(e.id) + "'><span class='bar' style='background:" + colorOf(e) + "'></span><div><div class='t'>" + esc(e.title) +
      "</div><div class='m'>" + esc(meta.join(" · ")) + "</div>" + (e.note ? "<div class='m'>" + esc(e.note) + "</div>" : "") + "</div></div>";
  }

  function appsView() {
    var here = location.hash;
    var h = "<div class='apps'>" + APPS.map(function (a) {
      var me = a.id === ME.id;
      return "<div class='app" + (me ? " me" : "") + "'><a class='ah' href='" + (me ? "#" : esc(appUrl(a))) + "'" + (me ? " data-a='close'" : "") + ">" +
        "<span class='mono' style='background:" + a.color + "'>" + esc(a.name.charAt(0)) + "</span><span><b>" + esc(a.name) + "</b><span>" + (me ? "Du bist hier" : esc(a.info)) + "</span></span></a>" +
        (a.sections.length ? "<div class='secs'>" + a.sections.map(function (sct) {
          return "<a href='" + esc(appUrl(a) + sct[1]) + "'" + (me ? " data-go='" + esc(sct[1]) + "'" : "") + ">" + esc(sct[0]) + "</a>"; }).join("") + "</div>" : "") +
        (me ? (standalone() ? "<div class='ok2'>✓ Als App installiert</div>" : "<button class='ib' data-a='install'>" + esc(a.name) + " als App installieren</button>" + (state.instHelp ? installHelp() : "")) : "") + "</div>";
    }).join("") + "</div>";
    h += "<p class='txt m'>Drei Apps, ein gemeinsamer Speicher: Termine, Aufgaben, Design und Sicherung gelten überall.</p>";
    return h;
  }
  function designView() {
    if (!window.SGTheme) return "<p class='txt'>Design nicht verfügbar.</p>";
    var cur = window.SGTheme.current().id;
    return "<p class='txt m'>Gilt sofort für alle Apps auf diesem Gerät – und mit Sync auch auf deinen anderen Geräten.</p>" +
      "<label class='chk' style='margin:0 0 12px'><input type='checkbox' data-a='glass'" + (window.SGTheme.glass && window.SGTheme.glass() ? " checked" : "") + "> Glaseffekt (durchscheinende Flächen, schwebende Leiste)</label><div class='themes'>" +
      window.SGTheme.list.map(function (t) {
        return "<button class='th" + (t.id === cur ? " on" : "") + "' data-theme='" + t.id + "' style='background:" + t.bg + ";color:" + t.ink + ";border-color:" + (t.id === cur ? t.acc : t.line) + "'>" +
          "<span class='pv'><i style='background:" + t.s1 + "'></i><i style='background:" + t.s2 + "'></i><i style='background:" + t.s3 + "'></i><i style='background:" + t.acc + "'></i></span>" +
          "<b>" + esc(t.name) + "</b><small style='color:" + t.muted + "'>" + esc(t.info) + "</small></button>";
      }).join("") + "</div>";
  }
  function ago(t) {
    if (!t) return "noch nie";
    var m = Math.round((Date.now() - t) / 60000);
    return m < 1 ? "gerade eben" : m < 60 ? "vor " + m + " Min." : new Date(t).toLocaleString("de-DE", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function cloudLine() {
    var c = cfg();
    if (!c.token) return "<div class='cl' data-tab='sync'>Nur auf diesem Gerät gespeichert · <u>Sync einrichten</u></div>";
    if (sync.busy) return "<div class='cl'>Synchronisiere …</div>";
    if (sync.error) return "<div class='cl err'>" + esc(sync.error) + "</div>";
    return "<div class='cl ok'>Synchronisiert · " + ago(sync.last || c.last) + "</div>";
  }
  /* ---------- Sicherung: Übersicht, frühere Stände, Datei ---------- */
  function backedUp() {
    return ["Kalender & Aufgaben"].concat(DATA.map(function (a) { return a.name; })).concat(["Design"]);
  }
  function cloudView() {
    var c = cfg();
    var h = "";
    if (state.hist) return histView();
    if (!c.token) {
      h += "<p class='txt'>Mit dem Sync sind <b>alle Daten aller Apps</b> auf deinen Geräten gleich und zusätzlich in der Cloud gesichert – in einem <b>privaten Gist</b> in deinem GitHub-Konto. Einrichten musst du das <b>einmal pro Gerät</b>, danach gilt es für alle Apps.</p>";
      h += "<ol class='txt'><li><a href='https://github.com/settings/tokens/new?scopes=gist&amp;description=SportGermany-Apps' target='_blank' rel='noopener'>Diesen Link öffnen</a> und bei GitHub anmelden.</li>" +
        "<li>Bei <b>Expiration</b> „No expiration“ wählen. Das Häkchen bei <b>gist</b> ist schon gesetzt – sonst nichts anhaken.</li>" +
        "<li>Unten <b>Generate token</b> tippen und den Code (beginnt mit <code>ghp_</code>) kopieren.</li>" +
        "<li>Hier einfügen und verbinden. Auf weiteren Geräten denselben Code verwenden.</li></ol>";
      h += "<label>Token</label><input name='token' type='password' autocomplete='off' placeholder='ghp_…'>";
      if (sync.error) h += "<div class='cl err'>" + esc(sync.error) + "</div>";
      h += "<div class='act'><span class='sp'></span><button class='b p' data-a='connect'" + (sync.busy ? " disabled" : "") + ">" + (sync.busy ? "Verbinde …" : "Verbinden") + "</button></div>";
    } else {
      h += "<p class='txt'>Verbunden als <b>" + esc(c.user || "?") + "</b>. Jede Änderung wird sofort gesichert; was du auf anderen Geräten änderst, kommt spätestens nach 30 Sekunden an.</p>";
      h += cloudLine();
      h += "<p class='txt m' style='margin-bottom:0'>Gesichert und abgeglichen:</p><div class='bl'>" + backedUp().map(function (n) { return "<span>" + esc(n) + "</span>"; }).join("") + "</div>";
      h += "<p class='txt m'>Den alten eigenen Sync in Lernplan und Trainingsblog brauchst du nicht mehr – du kannst ihn dort in den Einstellungen ausschalten.</p>";
      h += "<div class='act'><button class='b' data-a='history'>Frühere Stände</button>" + (c.gist ? "<a class='b' href='https://gist.github.com/" + esc(c.gist) + "' target='_blank' rel='noopener'>Auf GitHub</a>" : "") +
        "<span class='sp'></span><button class='b p' data-a='syncnow'>Jetzt synchronisieren</button></div>";
    }
    h += "<div class='tools'><button class='b' data-a='backup'>Alles als Datei sichern</button><button class='b' data-a='restorefile'>Sicherung einspielen</button>" +
      (c.token ? "<span style='flex:1'></span><button class='b d' data-a='disconnect'>Trennen</button>" : "") + "</div>";
    return h;
  }
  function histView() {
    var H = state.hist, h = "<div class='hd'><h2>Frühere Stände</h2><button class='b' data-a='histclose'>Zurück</button></div>";
    h += "<p class='txt m'>GitHub hebt jeden gesicherten Stand auf. Beim Zurückholen werden <b>alle Apps</b> auf diesen Stand gesetzt – auf allen verbundenen Geräten.</p>";
    if (H.loading) return h + "<p class='txt'>Lade …</p>";
    if (H.error) return h + "<div class='cl err'>" + esc(H.error) + "</div>";
    return h + "<div class='hist'>" + H.list.map(function (v, i) {
      var d = new Date(v.committed_at), when = d.toLocaleString("de-DE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      return "<button data-ver='" + esc(v.version) + "' data-when='" + esc(when) + "'>" + esc(when) + (i === 0 ? " · aktuell" : "") + "</button>";
    }).join("") + "</div>";
  }
  function loadHistory() {
    var c = cfg();
    if (!c.token || !c.gist) { state.hist = { error: "Noch nichts in der Cloud gesichert." }; render(); return; }
    gh("/gists/" + c.gist + "/commits?per_page=30", null, c.token).then(function (list) {
      state.hist = { list: list }; render();
    }).catch(function (e) { state.hist = { error: e.message || "Laden fehlgeschlagen." }; render(); });
  }

  // Alle Daten aller Apps in einem Objekt – für Datei-Sicherung und Wiederherstellung
  function allKeys() {
    var keys = [KEY, TKEY, "sg-design"];
    DATA.forEach(function (a) { keys = keys.concat(a.keys); });
    return keys;
  }
  function fullBackup() {
    var data = {};
    allKeys().forEach(function (k) { var v = localStorage.getItem(k); if (v !== null) data[k] = v; });
    return { format: "sportgermany-sicherung", v: 1, created: new Date().toISOString(), device: deviceName(), data: data };
  }
  // Einen Stand übernehmen und dafür sorgen, dass er sich auch auf den anderen Geräten durchsetzt:
  // Termine/Aufgaben bekommen einen frischen Zeitstempel, was im Stand fehlt, wird als gelöscht markiert.
  function applySnapshot(data) {
    Object.keys(COLS).forEach(function (c) {
      var col = COLS[c], raw = data[col.key];
      if (raw == null) return;
      var snap; try { snap = JSON.parse(raw); } catch (e) { return; }
      var now = Date.now(), d = load(c), keep = {};
      (snap.events || []).forEach(function (e) { e.changed = now; keep[e.id] = 1; });
      d.events.forEach(function (e) { if (!keep[e.id] && !e.deleted) snap.events.push(Object.assign({}, e, { deleted: true, changed: now })); });
      save({ v: 1, events: snap.events }, false, c);
    });
    DATA.concat(EXTRA).forEach(function (a) {
      var touched = false;
      a.keys.forEach(function (k) { if (Object.prototype.hasOwnProperty.call(data, k)) { localStorage.setItem(k, data[k]); touched = true; } });
      if (touched) setMeta(a.id, { hash: "", remote: 0, force: true }); // gilt als lokal geändert und setzt sich durch
    });
  }
  function restoreVersion(ver, when) {
    var c = cfg();
    if (!confirm("Alle Apps auf den Stand vom " + when + " zurücksetzen? Neuere Änderungen gehen dabei verloren.")) return;
    state.hist = { loading: true }; render();
    gh("/gists/" + c.gist + "/" + ver, null, c.token).then(fullGist).then(function (g) {
      var data = {}, f = g.files || {};
      Object.keys(COLS).forEach(function (k) { var x = f[COLS[k].file]; if (x && x.content) data[COLS[k].key] = x.content; });
      DATA.concat(EXTRA).forEach(function (a) {
        var r = readJSON(f["app-" + a.id + ".json"]);
        if (r && r.data) Object.keys(r.data).forEach(function (k) { data[k] = r.data[k]; });
      });
      applySnapshot(data);
      return syncNow();
    }).then(function () { alert("Stand vom " + when + " wiederhergestellt."); location.reload(); })
      .catch(function (e) { state.hist = { error: e.message || "Wiederherstellen fehlgeschlagen." }; render(); });
  }
  function restoreFile() {
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json,application/json";
    inp.onchange = function () {
      var file = inp.files && inp.files[0]; if (!file) return;
      file.text().then(function (txt) {
        var b = JSON.parse(txt);
        if (!b || b.format !== "sportgermany-sicherung" || !b.data) throw new Error("format");
        if (!confirm("Sicherung vom " + new Date(b.created).toLocaleString("de-DE") + " einspielen? Die aktuellen Daten aller Apps werden ersetzt.")) return;
        applySnapshot(b.data);
        syncNow().then(function () { location.reload(); });
      }).catch(function () { alert("Diese Datei ist keine Gesamtsicherung der Apps."); });
    };
    inp.click();
  }
  function connect(token) {
    token = token.trim();
    if (!token) return;
    sync.busy = true; sync.error = ""; render();
    gh("/user", null, token).then(function (u) {
      return findOrCreateGist(token, load()).then(function (id) { return gh("/gists/" + id, null, token).then(function (g) { return [u, id, g]; }); });
    }).then(function (r) {
      var u = r[0], g = r[2];
      var hasData = Object.keys(g.files || {}).some(function (f) { return f.indexOf("app-") === 0; });
      setCfg({ token: token, user: u.login, gist: r[1] });
      sync.busy = false;
      // Termine und Aufgaben werden ohnehin zusammengeführt; bei den App-Daten entscheidet die Person einmal.
      sync.adopt = hasData && confirm("In deiner Cloud sind schon Daten von einem anderen Gerät gesichert.\n\nOK = diese Daten auf dieses Gerät übernehmen (empfohlen für ein neues Gerät)\nAbbrechen = die Daten dieses Geräts behalten und hochladen");
      if (hasData && !sync.adopt) DATA.concat(EXTRA).forEach(function (a) { if (a.keys.length) setMeta(a.id, { hash: "", remote: 0, force: true }); });
      return syncNow().then(function (ok) { sync.adopt = false; return ok; });
    }).catch(function (e) {
      sync.busy = false;
      sync.error = (e && e.message && !/fetch|network/i.test(e.message)) ? e.message : "Keine Verbindung zu GitHub.";
      render();
    });
  }

  function form(e) {
    var isNew = !e.id;
    var h = "<div class='hd'><h2>" + (isNew ? "Neuer Termin" : "Termin bearbeiten") + "</h2><button class='x' data-a='back' aria-label='Zurück'>✕</button></div>";
    h += "<label>Titel</label><input name='title' maxlength='120' value='" + esc(e.title || "") + "' placeholder='z. B. Training, Klassenarbeit …'>";
    h += "<label>Datum</label><input type='date' name='date' value='" + esc(e.date) + "'>";
    h += "<div class='row'><div><label>Von (optional)</label><input type='time' name='time' value='" + esc(e.time || "") + "'></div>" +
      "<div><label>Bis (optional)</label><input type='time' name='end' value='" + esc(e.end || "") + "'></div></div>";
    h += "<label>Erinnerung</label><select name='remind'>" + REMIND.map(function (r) {
      return "<option value='" + r[0] + "'" + (String(e.remind == null ? "" : e.remind) === r[0] ? " selected" : "") + ">" + r[1] + "</option>"; }).join("") + "</select>";
    h += "<label>Notiz</label><textarea name='note' maxlength='1000'>" + esc(e.note || "") + "</textarea>";
    h += "<label>Farbe</label><select name='color'><option value=''>Farbe der App</option>" +
      COLORS.map(function (c, i) { return "<option value='" + c + "'" + (e.color === c ? " selected" : "") + ">" + CNAMES[i] + "</option>"; }).join("") + "</select>";
    if (!isNew) h += "<div class='m' style='margin-top:10px'>Angelegt in „" + esc(e.app) + "“" + (e.rep && e.rep.f ? " · wiederholt sich – Wiederholung im großen Kalender ändern" : "") + "</div>";
    h += "<div class='act'>" + (isNew ? "" : "<button class='b d' data-a='del'>Löschen</button>") + "<span class='sp'></span><button class='b' data-a='back'>Abbrechen</button><button class='b p' data-a='save'>Speichern</button></div>";
    return h;
  }

  function bind(box) {
    box.querySelector(".wrap").addEventListener("click", function (ev) {
      if (ev.target.classList.contains("wrap")) { close(); return; }
      var t = ev.target.closest("[data-a],[data-day],[data-id],[data-tab],[data-theme],[data-ver],[data-go]");
      if (!t) return;
      if (t.dataset.go !== undefined) { close(); return; } // Bereich derselben App: Link setzt nur den #-Teil
      if (t.dataset.tab) { state.tab = t.dataset.tab; render(); return; }
      if (t.dataset.theme && window.SGTheme) { window.SGTheme.set(t.dataset.theme); render(); return; }
      if (t.dataset.ver) { restoreVersion(t.dataset.ver, t.dataset.when); return; }
      if (t.dataset.day) { state.sel = t.dataset.day; render(); return; }
      if (t.dataset.id && !t.dataset.a) {
        var e = live().find(function (x) { return x.id === t.dataset.id; }); // bei Serien: die ganze Serie
        if (e) { state.edit = Object.assign({}, e); render(); }
        return;
      }
      if (t.dataset.a === "close" && t.tagName === "A") ev.preventDefault();
      act(t.dataset.a, box);
    });
    box.querySelectorAll("[data-task]").forEach(function (cb) {
      cb.addEventListener("change", function () { api.tasks.update(cb.dataset.task, { done: cb.checked }); });
    });
    var qt = box.querySelector("[name=quicktask]");
    if (qt) qt.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && qt.value.trim()) { api.tasks.add({ title: qt.value.trim(), due: state.sel }); }
    });
    var f = box.querySelector("[data-a=filter]");
    if (f) f.addEventListener("change", function () { state.filter = f.checked; render(); });
    var ti = box.querySelector("input[name=title]");
    if (ti && state.edit && !state.edit.id) ti.focus();
  }

  function act(a, box) {
    var m = state.month;
    if (a === "prev") state.month = new Date(m.getFullYear(), m.getMonth() - 1, 1);
    else if (a === "next") state.month = new Date(m.getFullYear(), m.getMonth() + 1, 1);
    else if (a === "today") { var t = new Date(); state.sel = iso(t); state.month = new Date(t.getFullYear(), t.getMonth(), 1); }
    else if (a === "close") return close();
    else if (a === "weekplan") { close(); openWeekPlan(); return; }
    else if (a === "glass") { var gc = box.querySelector("[data-a=glass]"); if (window.SGTheme && window.SGTheme.setGlass) window.SGTheme.setGlass(gc.checked); return; }
    else if (a === "install") { if (window.SGInstallEvt) { close(); installNow(); } else { state.instHelp = true; render(); } return; }
    else if (a === "connect") return connect(box.querySelector("[name=token]").value);
    else if (a === "syncnow") return syncNow();
    else if (a === "notify") return askNotify();
    else if (a === "backup") return download("sportgermany-sicherung-" + iso(new Date()) + ".json", "application/json", JSON.stringify(fullBackup(), null, 1));
    else if (a === "restorefile") return restoreFile();
    else if (a === "history") { state.hist = { loading: true }; render(); loadHistory(); return; }
    else if (a === "histclose") state.hist = null;
    else if (a === "disconnect") {
      if (!confirm("Sync auf diesem Gerät beenden? Alle Daten bleiben hier und auf GitHub erhalten.")) return;
      setCfg(null); sync.error = ""; sync.last = 0;
    }
    else if (a === "new") state.edit = { date: state.sel, app: APP };
    else if (a === "back") state.edit = null;
    else if (a === "save") {
      var v = {};
      ["title", "date", "time", "end", "note", "color", "remind"].forEach(function (k) { v[k] = box.querySelector("[name=" + k + "]").value.trim(); });
      v.remind = v.remind === "" ? null : +v.remind;
      if (v.remind != null) askNotify();
      if (!v.title) { box.querySelector("[name=title]").focus(); return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) { box.querySelector("[name=date]").focus(); return; }
      if (state.edit.id) api.update(state.edit.id, v); else api.add(v);
      state.sel = v.date; var d = parse(v.date); state.month = new Date(d.getFullYear(), d.getMonth(), 1);
      state.edit = null;
    }
    else if (a === "del") {
      if (!confirm("Termin „" + state.edit.title + "“ in allen Apps löschen?")) return;
      api.remove(state.edit.id); state.edit = null;
    }
    else if (a === "export") return download("gemeinsamer-kalender-" + iso(new Date()) + ".json", "application/json", JSON.stringify(load(), null, 2));
    else if (a === "import") return importFile();
    else if (a === "ics") return download("gemeinsamer-kalender.ics", "text/calendar", ics());
    render();
  }

  // Import führt zusammen: pro Termin gewinnt die zuletzt geänderte Fassung, nichts wird blind überschrieben.
  function importFile() {
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json,application/json";
    inp.onchange = function () {
      var file = inp.files && inp.files[0]; if (!file) return;
      file.text().then(function (txt) {
        var src = JSON.parse(txt);
        if (!src || !Array.isArray(src.events)) throw new Error("format");
        var added = mutate(function (d) { return mergeInto(d, src.events).added; });
        alert("Import fertig: " + added + " neue Termine.");
      }).catch(function () { alert("Diese Datei ist keine gültige Kalender-Sicherung."); });
    };
    inp.click();
  }

  function ics() {
    function f(s) { return String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, "\\$&"); }
    function stamp(date, time) { return date.replace(/-/g, "") + "T" + time.replace(":", "") + "00"; }
    var out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SportGermany//Gemeinsamer Kalender//DE"];
    live().forEach(function (e) {
      out.push("BEGIN:VEVENT", "UID:" + e.id + "@sportgermany", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z");
      if (e.time) {
        out.push("DTSTART:" + stamp(e.date, e.time));
        if (e.end) out.push("DTEND:" + stamp(e.date, e.end));
      } else {
        var n = parse(e.date); n.setDate(n.getDate() + 1);
        out.push("DTSTART;VALUE=DATE:" + e.date.replace(/-/g, ""), "DTEND;VALUE=DATE:" + iso(n).replace(/-/g, ""));
      }
      out.push("SUMMARY:" + f(e.title), "DESCRIPTION:" + f((e.note ? e.note + "\n" : "") + "aus " + e.app));
      if (e.rep && e.rep.f) out.push("RRULE:FREQ=" + { d: "DAILY", w: "WEEKLY", "2w": "WEEKLY;INTERVAL=2", m: "MONTHLY", y: "YEARLY" }[e.rep.f] + (e.rep.until ? ";UNTIL=" + e.rep.until.replace(/-/g, "") : ""));
      if (e.remind != null) out.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + f(e.title), "TRIGGER:-PT" + (+e.remind) + "M", "END:VALARM");
      out.push("END:VEVENT");
    });
    out.push("END:VCALENDAR");
    return out.join("\r\n");
  }

  /* ---------- Wochenplanung: Fragen zu Training, Mobility & Atmung, Lernen – Antworten werden direkt eingetragen ----------
   * Einstellungen und letzte Antworten liegen in sg-wochenplan-v1 (wird mit der Cloud-Sicherung abgeglichen).
   * Eingetragene Termine tragen wp = Montag der Woche; neu planen ersetzt sie. */
  var WP_KEY = "sg-wochenplan-v1", WDN = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"], WDL = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
  function wpDefaults() {
    var ws = jkey("wk_settings") || {}, pp = (jkey("pulsplan.v1") || {}).settings || {};
    var run = (ws.runDays || [0]).map(function (d) { return (d + 6) % 7; });
    var rest = (ws.restDays || []).map(function (d) { return (d + 6) % 7; });
    var train = [0, 2, 4].filter(function (d) { return run.indexOf(d) < 0 && rest.indexOf(d) < 0; });
    return { on: true, remind: "so", time: "18:00", topics: { training: true, mobility: true, lernen: true }, planned: {}, later: "",
      last: { train: { days: train, time: "17:00" }, run: { days: run, time: "10:00" }, mob: { days: [0, 1, 2, 3, 4, 5, 6], time: "07:30" },
        atm: { on: true, morning: pp.morning || "07:00", evening: pp.evening || "21:30" }, learn: { days: [0, 1, 2, 3], time: "16:00", dur: 45 } } };
  }
  function wpCfg() {
    var d = wpDefaults(), c = jkey(WP_KEY) || {};
    var out = Object.assign({}, d, c);
    out.topics = Object.assign({}, d.topics, c.topics || {});
    out.last = Object.assign({}, d.last, c.last || {});
    out.planned = Object.assign({}, c.planned || {});
    return out;
  }
  function wpSave(c) { try { localStorage.setItem(WP_KEY, JSON.stringify(c)); } catch (e) {} schedulePush(); emit(); }
  function mondayOf(k) { var d = parse(k); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return iso(d); }
  function kw(k) { var d = parse(k), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7); }
  function shortDate(k) { var d = parse(k); return d.getDate() + "." + (d.getMonth() + 1) + "."; }
  var WKINDS = ["Zirkeltraining", "Krafttraining", "Gym", "Laufen", "Radfahren", "Schwimmen", "Rodeln", "Mannschaftssport", "Yoga", "Sonstiges"];
  var WDURS = { train: [15, 20, 30, 45, 60, 75, 90, 120], run: [15, 20, 30, 45, 60, 75, 90, 120], mob: [5, 10, 15, 20, 30], learn: [20, 30, 45, 60, 90, 120] };
  var WDEF = { train: 45, run: 45, mob: 5, learn: 45 };
  // Einstellung eines Tages: eigene Werte dieses Wochentags, sonst die zuletzt benutzten
  function perOf(a, key, i) {
    var x = a[key] || {}, p = (x.per || {})[i] || {};
    return { time: p.time || x.time || "17:00", dur: +(p.dur || x.dur || WDEF[key]), kind: p.kind || x.kind || "Zirkeltraining", km: p.km != null ? p.km : (x.km || "") };
  }
  function durLabel(m) { return m < 60 ? m + " Min." : Math.floor(m / 60) + (m % 60 ? ":" + pad(m % 60) : "") + " Std."; }
  function unitFields(key, p) {
    var r = "";
    if (key === "train") r += "<select data-p='kind' aria-label='Art'>" + WKINDS.map(function (k) { return "<option" + (k === p.kind ? " selected" : "") + ">" + k + "</option>"; }).join("") + "</select>";
    r += "<input type='time' data-p='time' value='" + esc(p.time) + "' aria-label='Uhrzeit'>";
    var durs = WDURS[key].indexOf(+p.dur) < 0 ? WDURS[key].concat([+p.dur]).sort(function (m, n) { return m - n; }) : WDURS[key];
    r += "<select data-p='dur' aria-label='Dauer'>" + durs.map(function (m) { return "<option value='" + m + "'" + (m === +p.dur ? " selected" : "") + ">" + durLabel(m) + "</option>"; }).join("") + "</select>";
    if (key === "run") r += "<input type='number' inputmode='decimal' min='0' step='0.5' data-p='km' value='" + esc(p.km) + "' placeholder='km' aria-label='Distanz in km'>";
    return r;
  }
  function dayRows(key) {
    var x = wp.a[key];
    if (!x.days.length) return "<p class='txt m'>Keine Tage gewählt.</p>";
    // schon gewählte Tage behalten ihre Werte; nur neu dazugewählte übernehmen die zuletzt eingestellten
    x.per = x.per || {};
    x.days.forEach(function (i) { if (!x.per[i]) x.per[i] = perOf(wp.a, key, i); });
    var h = "<div class='prows'>" + x.days.slice().sort().map(function (i) {
      var p = perOf(wp.a, key, i), past = wpPast(i);
      var r = "<div class='prow k-" + key + (past ? " past" : "") + "' data-k='" + key + "' data-i='" + i + "'><span class='pd'>" + WDN[i] + "<small>" + (wp.mode === "std" ? "jede Woche" : shortDate(plusDays(wp.mon, i))) + "</small></span>";
      r += unitFields(key, p) + "</div>";
      // freiwillig: weitere Einheiten am selben Tag (z. B. morgens laufen, abends Kraft)
      if (key === "train") {
        ((x.extra || {})[i] || []).forEach(function (u, xi) {
          r += "<div class='prow k-train extra" + (past ? " past" : "") + "' data-k='train' data-i='" + i + "' data-x='" + xi + "'><span class='pd'><button type='button' class='del' data-w='delunit' data-i='" + i + "' data-x='" + xi + "' aria-label='Einheit entfernen'>×</button><small>" + (xi + 2) + ". Einheit</small></span>" + unitFields("train", u) + "</div>";
        });
        if (!past) r += "<button type='button' class='addu' data-w='addunit' data-i='" + i + "'>+ weitere Einheit am " + WDN[i] + "</button>";
      }
      return r;
    }).join("") + "</div>";
    if (x.days.length > 1) h += "<button type='button' class='same' data-w='same' data-k='" + key + "'>Wie " + WDN[x.days.slice().sort()[0]] + " für alle Tage übernehmen</button>";
    return h;
  }
  var wp = null; // offener Assistent: { step, mon, a: Antworten }
  function wpSteps() {
    var c = wpCfg(), s = ["start"];
    if (c.topics.training) s.push("training");
    if (c.topics.mobility) s.push("mobility");
    if (c.topics.lernen) s.push("lernen");
    s.push("done");
    return s;
  }
  function openWeekPlan(view, mon) {
    mount();
    var t = iso(new Date()), wd = (new Date().getDay() + 6) % 7;
    var c = wpCfg();
    if (mon) mon = mondayOf(mon);
    if (mon && mon < mondayOf(t)) mon = null; // vergangene Wochen plant man nicht mehr
    wp = { step: 0, mon: mon || (wd >= 4 ? plusDays(mondayOf(t), 7) : mondayOf(t)), a: JSON.parse(JSON.stringify(c.last)), view: view || "", result: null, mode: "" };
    if (view === "std") { wp.view = ""; stdEdit(); return; }
    wpRender();
  }
  /* Standardwoche: die normale Trainingswoche einmal festlegen (Tage, Art, Uhrzeit, Dauer) und dann
   * jede Woche mit einem Tipp übernehmen. Danach lässt sich jede einzelne Woche wie gewohnt anpassen. */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function stdEdit() { var c = wpCfg(); wp.mode = "std"; wp.a = clone(c.std || c.last); wp.step = 1; wp.result = null; wpRender(); }
  function stdApply(mon) {
    var c = wpCfg(); if (!c.std) return null;
    var a = clone(c.std); a.atm = Object.assign({}, c.last.atm, a.atm || {});
    return writeWeek(mon, a);
  }
  function stdShow(mon) { openWeekPlan(null, mon); wp.a = clone(wpCfg().std); wp.result = stdApply(wp.mon); wp.step = wpSteps().length - 1; wpRender(); }
  function stdSummary(std) {
    var c = wpCfg(), parts = [];
    if (c.topics.training) {
      (std.train.days || []).slice().sort().forEach(function (i) { var p = perOf(std, "train", i); parts.push([i, WDN[i] + " " + p.time + " " + p.kind]); ((std.train.extra || {})[i] || []).forEach(function (u) { parts.push([i, WDN[i] + " " + (u.time || "") + " " + (u.kind || "Training")]); }); });
      (std.run.days || []).forEach(function (i) { parts.push([i, WDN[i] + " " + perOf(std, "run", i).time + " Laufen"]); });
    }
    if (c.topics.mobility && std.mob.days.length) parts.push([9, "Mobility " + std.mob.days.length + "×"]);
    if (c.topics.lernen && std.learn.days.length) parts.push([9, "Lernen " + std.learn.days.length + "×"]);
    parts.sort(function (x, y) { return x[0] - y[0]; });
    return parts.map(function (x) { return x[1]; }).join(" · ") || "Noch nichts eingetragen";
  }
  function closeWeekPlan() { wp = null; wpRender(); }
  function dayChips(key, days) {
    return "<div class='wdays' data-k='" + key + "'>" + WDN.map(function (n, i) {
      var past = wpPast(i);
      return "<button type='button' class='wd" + (days.indexOf(i) > -1 ? " on" : "") + (past ? " past" : "") + "' data-wd='" + i + "'" + (past ? " disabled title='schon vorbei'" : "") + ">" + n + "<small>" + (wp.mode === "std" ? "" : shortDate(plusDays(wp.mon, i))) + "</small></button>";
    }).join("") + "</div>";
  }
  function wpPast(i) { return wp.mode !== "std" && plusDays(wp.mon, i) < iso(new Date()); }
  function atmPhase(mon) {
    var pp = jkey("pulsplan.v1") || {}, st = pp.settings && pp.settings.start;
    if (!st) return { w: 1, fresh: true, label: "Dein Atemplan startet mit dieser Woche (Woche 1 · Atmen lernen)." };
    var w = Math.floor(Math.round((parse(mon) - parse(st)) / 864e5) / 7) + 1;
    var names = [[1, 2, "Atmen lernen"], [3, 5, "Biofeedback"], [6, 9, "Vertiefen"], [10, 12, "Anwenden"]];
    var p = names.find(function (x) { return w >= x[0] && w <= x[1]; });
    return { w: w, label: w < 1 ? "Dein Atemplan startet erst später." : p ? "Planwoche " + w + " · " + p[2] : "Erhalt: täglich 10 Minuten" };
  }
  function wpExams(mon) {
    return externalItems(mon, plusDays(mon, 20)).filter(function (e) { return e.exam; });
  }
  function wpHomework(mon) {
    var db = jkey("schulkalender-bayern-v1") || {}, end = plusDays(mon, 6);
    var subj = function (id) { return ((db.subjects || []).find(function (x) { return x.id === id; }) || {}).name || ""; };
    return (db.homework || []).filter(function (h) { return !h.done && h.due && h.due <= end; }).map(function (h) { return { title: h.title || h.text || "Hausaufgabe", subject: subj(h.subject), due: h.due }; });
  }
  function wpView() {
    var steps = wpSteps(), st = steps[wp.step], a = wp.a, c = wpCfg();
    var h = "<div class='wrap wpw'><div class='panel' role='dialog' aria-label='Wochenplanung'>";
    h += "<div class='hd'><h2>" + (wp.view === "settings" ? "Wochenplanung · Einstellungen" : wp.mode === "std" ? "Standardwoche festlegen" : "Woche planen") + "</h2><button class='x' data-w='close' aria-label='Schließen'>✕</button></div>";
    if (wp.view === "settings") return h + wpSettingsHTML(c) + "<div class='act'><span class='sp'></span><button class='b p' data-w='" + (wp.result || wp.step ? "back" : "close") + "'>Fertig</button></div></div></div>";
    if (wp.mode === "std" && st !== "done" && st !== "start") h += "<p class='cl'>Gilt als Vorlage für jede Woche – Tage, Art, Uhrzeit und Dauer. Einzelne Wochen kannst du beim Übernehmen trotzdem ändern.</p>";
    if (st !== "done" && st !== "start") h += "<div class='wpprog'>" + steps.slice(1, -1).map(function (x, i) { return "<i class='" + (i + 1 <= wp.step ? "on" : "") + "'></i>"; }).join("") + "</div>";
    var end = plusDays(wp.mon, 6);
    if (st === "start") {
      var t = iso(new Date()), thisMon = mondayOf(t), nextMon = plusDays(thisMon, 7);
      h += "<p class='txt'>Ein paar kurze Fragen – danach steht alles direkt in deinem Kalender (Planer, Schule, Training und Atmung).</p>";
      var opts = [[thisMon, "Diese Woche"], [nextMon, "Nächste Woche"]];
      if (wp.mon !== thisMon && wp.mon !== nextMon) opts.push([wp.mon, "KW " + kw(wp.mon)]);
      h += "<label>Welche Woche?</label><div class='seg" + (opts.length > 2 ? " s3" : "") + "'>" + opts.map(function (x) {
        return "<button type='button' data-mon='" + x[0] + "' class='" + (wp.mon === x[0] ? "on" : "") + "'>" + x[1] + "<small>KW " + kw(x[0]) + " · " + shortDate(x[0]) + "–" + shortDate(plusDays(x[0], 6)) + "</small></button>";
      }).join("") + "</div>";
      if (c.planned[wp.mon]) h += "<p class='cl'>Diese Woche ist schon geplant. Neu planen ersetzt die Einträge der letzten Planung – selbst angelegte Termine bleiben.</p>";
      h += "<div class='stdbox'><div class='sh'><b>Standardwoche</b><a href='#' data-w='stdedit'>" + (c.std ? "Bearbeiten" : "") + "</a></div>" + (c.std
        ? "<p class='txt m'>" + esc(stdSummary(c.std)) + "</p><div class='act2'><button class='b p' data-w='stdapply'>Standardwoche übernehmen</button><button class='b' data-w='stdadjust'>Erst anpassen</button></div>"
        : "<p class='txt m'>Lege einmal fest, wie deine normale Trainingswoche aussieht – danach trägst du jede Woche mit einem Tipp ein und änderst nur noch, was anders ist.</p><div class='act2'><button class='b p' data-w='stdedit'>Standardwoche festlegen</button></div>") + "</div>";
      var topics = [["training", "Training & Laufen"], ["mobility", "Mobility & Atmung"], ["lernen", "Lernen & Prüfungen"]].filter(function (x) { return c.topics[x[0]]; });
      h += "<p class='txt m'>" + (topics.length ? "Fragen zu: " + topics.map(function (x) { return x[1]; }).join(" · ") : "Alle Themen sind ausgeschaltet.") + " <a href='#' data-w='settings'>Einstellungen</a></p>";
      h += "<div class='act'><span class='sp'></span><button class='b p' data-w='next'" + (topics.length ? "" : " disabled") + ">Los geht's</button></div>";
    } else if (st === "training") {
      var ws = jkey("wk_settings") || {}, rest = (ws.restDays || []).map(function (d) { return WDN[(d + 6) % 7]; });
      h += "<h3 class='q'>An welchen Tagen trainierst du?</h3><p class='txt m'>Für jeden Tag Art, Uhrzeit und Dauer" + (rest.length ? " · feste Ruhetage: " + rest.join(", ") : "") + "</p>" + dayChips("train", a.train.days) + dayRows("train");
      h += "<h3 class='q'>Wann gehst du laufen?</h3><p class='txt m'>Uhrzeit, Dauer und – wenn du magst – Distanz</p>" + dayChips("run", a.run.days) + dayRows("run");
    } else if (st === "mobility") {
      h += "<h3 class='q'>Mobility</h3><p class='txt m'>An welchen Tagen, wann und wie lange? Der Tagesblock dauert etwa 5 Minuten.</p>" + dayChips("mob", a.mob.days) + dayRows("mob");
      var ph = atmPhase(wp.mon);
      h += "<h3 class='q'>Atemübungen nach deinem Atemplan</h3><p class='txt m'>" + esc(ph.label) + "</p>";
      h += "<label class='chk'><input type='checkbox' data-f='atm.on'" + (a.atm.on ? " checked" : "") + "> Atemübungen für diese Woche eintragen</label>";
      h += "<div class='row'><div><label>Morgens</label><input type='time' data-f='atm.morning' value='" + esc(a.atm.morning) + "'></div><div><label>Abends</label><input type='time' data-f='atm.evening' value='" + esc(a.atm.evening) + "'></div></div>";
    } else if (st === "lernen") {
      var ex = wpExams(wp.mon), hw = wpHomework(wp.mon);
      h += "<h3 class='q'>Was steht an?</h3>";
      h += ex.length ? "<div class='bl'>" + ex.map(function (e) { return "<span>" + shortDate(e.date) + " " + esc(e.title) + "</span>"; }).join("") + "</div>" : "<p class='txt m'>In den nächsten drei Wochen sind keine Prüfungen eingetragen.</p>";
      if (hw.length) h += "<p class='txt m'>Offene Hausaufgaben bis " + shortDate(end) + ": " + hw.map(function (x) { return esc((x.subject ? x.subject + ": " : "") + x.title); }).join(" · ") + "</p>";
      h += "<h3 class='q'>An welchen Tagen lernst du?</h3><p class='txt m'>Vor einer Prüfung wird die Lernzeit automatisch diesem Fach zugeordnet.</p>" + dayChips("learn", a.learn.days) + dayRows("learn");
    } else if (st === "done") {
      var r = wp.result || { list: [], notes: [] };
      h += "<p class='txt'><b>KW " + kw(wp.mon) + " ist geplant.</b> " + r.list.length + " Einträge stehen jetzt in deinem Kalender.</p>";
      h += "<div class='act2'><button class='b' data-w='adjust'>Zeiten dieser Woche anpassen</button>" + (JSON.stringify(c.std || null) === JSON.stringify(wp.a) ? "" : "<button class='b' data-w='stdsave'>Als Standardwoche merken</button>") + "</div>";

      var byDay = {};
      r.list.forEach(function (e) { (byDay[e.date] = byDay[e.date] || []).push(e); });
      h += Object.keys(byDay).sort().map(function (d) {
        return "<div class='sec'><h3>" + WDL[(parse(d).getDay() + 6) % 7] + ", " + shortDate(d) + "</h3>" + byDay[d].map(function (e) {
          return "<div class='ev'><span class='bar' style='background:" + appColor(e.app) + "'></span><div><div class='t'>" + esc(e.title) + "</div><div class='m'>" + esc((e.time || "") + (e.end ? "–" + e.end : "") + " · " + e.app) + "</div></div></div>";
        }).join("") + "</div>";
      }).join("");
      r.notes.forEach(function (n) { h += "<p class='cl'>" + esc(n) + "</p>"; });
      h += "<div class='act'><button class='b' data-w='settings'>Einstellungen</button><span class='sp'></span><button class='b p' data-w='close'>Fertig</button></div>";
    }
    if (st !== "start" && st !== "done") {
      var last = wp.step === steps.length - 2;
      var fin = wp.mode === "std" ? "Als Standardwoche speichern" : "Woche eintragen", first = wp.mode === "std" && wp.step === 1;
      h += "<div class='act'><button class='b' data-w='" + (first ? "stdcancel" : "prev") + "'>" + (first ? "Abbrechen" : "Zurück") + "</button><span class='sp'></span><button class='b p' data-w='" + (last ? (wp.mode === "std" ? "stdsavedef" : "save") : "next") + "'>" + (last ? fin : "Weiter") + "</button></div>";
    }
    return h + "</div></div>";
  }
  function wpSettingsHTML(c) {
    return "<label class='chk'><input type='checkbox' data-s='on'" + (c.on ? " checked" : "") + "> Wochenplanung aktiv</label>" +
      "<label>Erinnerung</label><div class='row'><select data-s='remind'>" + [["", "Keine Erinnerung"], ["sa", "Samstagabend"], ["so", "Sonntagabend"]].map(function (x) {
        return "<option value='" + x[0] + "'" + (c.remind === x[0] ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + "</select><input type='time' data-s='time' value='" + esc(c.time) + "'></div>" +
      "<label class='chk'><input type='checkbox' data-s='stdAuto'" + (c.stdAuto ? " checked" : "") + (c.std ? "" : " disabled") + "> Standardwoche jede Woche automatisch eintragen</label>" +
      "<p class='txt m'>" + (c.std ? "Neue Wochen werden dann ohne Nachfrage nach deiner Standardwoche eingetragen – ändern kannst du jede Woche trotzdem." : "Dafür zuerst eine Standardwoche festlegen.") + "</p>" +
      "<label>Fragen zu</label>" + [["training", "Training & Laufen"], ["mobility", "Mobility & Atmung"], ["lernen", "Lernen & Prüfungen"]].map(function (x) {
        return "<label class='chk'><input type='checkbox' data-s='topic.' data-t='" + x[0] + "'" + (c.topics[x[0]] ? " checked" : "") + "> " + x[1] + "</label>"; }).join("");
  }
  function wpSetting(el) {
    var c = wpCfg(), k = el.dataset.s;
    if (k === "on") c.on = el.checked;
    else if (k === "remind") c.remind = el.value;
    else if (k === "time") c.time = el.value || "18:00";
    else if (k === "topic.") c.topics[el.dataset.t] = el.checked;
    else if (k === "stdAuto") c.stdAuto = el.checked;
    wpSave(c); renderWpToast();
  }
  function wpRender() {
    if (!root) return;
    var box = root.querySelector(".wpbox");
    if (!wp) { box.innerHTML = ""; return; }
    var vv = root.querySelector(".v"); vv.setAttribute("style", themeVars()); vv.classList.add("dark");
    box.innerHTML = wpView();
    var w = box.querySelector(".wrap");
    w.addEventListener("click", function (ev) {
      if (ev.target === w) { closeWeekPlan(); return; }
      var t = ev.target.closest("[data-w],[data-wd],[data-mon]");
      if (!t) return;
      if (t.dataset.mon) { wp.mon = t.dataset.mon; wpRender(); return; }
      if (t.dataset.wd !== undefined) {
        var k = t.parentNode.dataset.k, i = +t.dataset.wd, arr = wp.a[k].days, pos = arr.indexOf(i);
        if (pos > -1) arr.splice(pos, 1); else arr.push(i);
        arr.sort(); wpRender(); return;
      }
      ev.preventDefault();
      var a = t.dataset.w;
      if (a === "close") closeWeekPlan();
      else if (a === "settings") { wp.view = "settings"; wpRender(); }
      else if (a === "addunit") {
        var xi0 = +t.dataset.i, tr = wp.a.train; tr.extra = tr.extra || {};
        var main = perOf(wp.a, "train", xi0), h0 = +main.time.split(":")[0];
        (tr.extra[xi0] = tr.extra[xi0] || []).push({ kind: "Laufen", time: h0 >= 12 ? "07:00" : "18:00", dur: 30, km: "" });
        wpRender();
      }
      else if (a === "delunit") { var ex = wp.a.train.extra[+t.dataset.i]; ex.splice(+t.dataset.x, 1); wpRender(); }
      else if (a === "same") {
        var k = t.dataset.k, x = wp.a[k], first = perOf(wp.a, k, x.days.slice().sort()[0]);
        x.per = x.per || {}; x.days.forEach(function (i) { x.per[i] = Object.assign({}, first); });
        wpRender();
      }
      else if (a === "back") { wp.view = ""; wpRender(); }
      else if (a === "stdedit") stdEdit();
      else if (a === "stdcancel") { wp.mode = ""; wp.step = 0; wp.a = clone(wpCfg().last); wpRender(); }
      else if (a === "stdsavedef") { var cs = wpCfg(); cs.std = clone(wp.a); wpSave(cs); wp.mode = ""; wp.step = 0; wpRender(); }
      else if (a === "stdapply") stdShow(wp.mon);
      else if (a === "stdadjust") { wp.a = clone(wpCfg().std); wp.step = 1; wpRender(); }
      else if (a === "adjust") { wp.step = 1; wp.result = null; wpRender(); }
      else if (a === "stdsave") { var cs2 = wpCfg(); cs2.std = clone(wp.a); wpSave(cs2); wpRender(); }
      else if (a === "next") { wp.step++; wpRender(); }
      else if (a === "prev") { wp.step = Math.max(0, wp.step - 1); wpRender(); }
      else if (a === "save") { wp.result = writeWeek(wp.mon, wp.a); wp.step = wpSteps().length - 1; wpRender(); }
    });
    box.querySelectorAll("[data-f]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var p = inp.dataset.f.split(".");
        wp.a[p[0]][p[1]] = inp.type === "checkbox" ? inp.checked : inp.value;
      });
    });
    box.querySelectorAll("[data-s]").forEach(function (inp) { inp.addEventListener("change", function () { wpSetting(inp); }); });
    box.querySelectorAll("[data-p]").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var row = inp.closest(".prow"), k = row.dataset.k, i = +row.dataset.i, x = wp.a[k], f = inp.dataset.p;
        if (row.dataset.x != null) { var u = x.extra[i][+row.dataset.x]; u[f] = f === "dur" ? +inp.value : inp.value; return; }
        x.per = x.per || {}; x.per[i] = Object.assign(perOf(wp.a, k, i), x.per[i] || {});
        var val = f === "dur" ? +inp.value : f === "km" ? inp.value.replace(",", ".") : inp.value;
        x.per[i][f] = val; x[f] = val; // neu gewählte Tage übernehmen den zuletzt eingestellten Wert
      });
    });
  }
  // Atemübungen nach Phase des Atemplans (wie „Vorschlag aus dem Plan“ in Atmung & HRV)
  function atmEntries(mon, a, days) {
    var ph = atmPhase(mon), w = ph.w, mo = a.morning || "07:00", ev = a.evening || "21:30", out = [];
    var p = w >= 1 && w <= 2 ? 1 : w >= 3 && w <= 5 ? 2 : w >= 6 && w <= 9 ? 3 : w >= 10 && w <= 12 ? 4 : 0;
    function add(i, time, type, dur, note) { out.push({ id: uid(), date: plusDays(mon, i), time: time, type: type, dur: dur, note: note || "", wp: mon }); }
    days.forEach(function (i) {
      if (!p) { add(i, mo, "Biofeedback mit H10", 10, "Erhalt im eigenen Takt"); return; }
      if (p === 1) { add(i, mo, "Langsames Atmen", 5, "4 s ein, 6 s aus"); add(i, ev, "Langsames Atmen", 5, "4 s ein, 6 s aus"); }
      else if (p === 2) { if (i === 0 && (w === 3 || w === 5)) add(i, mo, "Resonanztest", 12, "Sitzend, H10 angelegt"); else add(i, mo, "Biofeedback mit H10", w === 3 ? 10 : 15, "Im eigenen Takt"); }
      else if (p === 3) { add(i, mo, "Biofeedback mit H10", 10, "Zum Schluss 2 min ohne Taktgeber"); add(i, ev, i % 2 === 0 ? "PMR" : "Autogenes Training", 15, ""); }
      else { if (i === 0 && w === 12) add(i, mo, "Resonanztest", 12, "Mit Woche 3 vergleichen"); else add(i, mo, "Biofeedback mit H10", 10, "Im eigenen Takt"); add(i, ev, "Einschlaf-Routine", 15, "Im Bett, langsam atmen oder PMR"); }
    });
    return out;
  }
  function writeWeek(mon, a) {
    var c = wpCfg(), list = [], notes = [], t = iso(new Date());
    var live = function (days) { return days.filter(function (i) { return plusDays(mon, i) >= t; }); };
    function ev(i, time, dur, title, app, note) {
      list.push({ id: uid(), title: title, date: plusDays(mon, i), time: time || "", end: time ? addMin(time, dur) : "", note: note || "Aus der Wochenplanung",
        color: "", app: app, created: Date.now(), changed: Date.now(), remind: null, wp: mon });
    }
    if (c.topics.training) {
      live(a.train.days).forEach(function (i) {
        var p = perOf(a, "train", i); ev(i, p.time, p.dur, p.kind, "Training", durLabel(p.dur) + " · aus der Wochenplanung");
        ((a.train.extra || {})[i] || []).forEach(function (u) { ev(i, u.time || "18:00", +u.dur || 30, u.kind || "Training", "Training", durLabel(+u.dur || 30) + " · weitere Einheit"); });
      });
      live(a.run.days).forEach(function (i) { var p = perOf(a, "run", i), km = parseFloat(p.km); ev(i, p.time, p.dur, "Laufen" + (km > 0 ? " · " + String(km).replace(".", ",") + " km" : ""), "Training", durLabel(p.dur) + " · aus der Wochenplanung"); });
    }
    if (c.topics.mobility) live(a.mob.days).forEach(function (i) { var p = perOf(a, "mob", i); ev(i, p.time, p.dur, p.dur > 5 ? "Mobility · " + durLabel(p.dur) : "Mobility-Block", "Mobility"); });
    if (c.topics.lernen) {
      var exams = wpExams(mon);
      live(a.learn.days).forEach(function (i) {
        var d = plusDays(mon, i), nx = exams.find(function (e) { return e.date > d && e.date <= plusDays(d, 14); });
        var p = perOf(a, "learn", i);
        ev(i, p.time, p.dur, nx ? "Lernen: " + nx.title : "Lernen & Hausaufgaben", "Lernplan", nx ? "Prüfung am " + shortDate(nx.date) : "Aus der Wochenplanung");
      });
    }
    // gemeinsamer Kalender: frühere Einträge dieser Wochenplanung ersetzen
    mutate(function (d) {
      d.events.forEach(function (e) { if (e.wp === mon && !e.deleted) { e.deleted = true; e.changed = Date.now(); } });
      list.forEach(function (n) { d.events.push(n); });
    });
    var out = list.slice();
    // Atmung & HRV: Einträge im Atemplan (erscheinen dort und in allen Kalendern)
    if (c.topics.mobility && a.atm.on) {
      var raw = null; try { raw = JSON.parse(localStorage.getItem("pulsplan.v1") || "null"); } catch (e) {}
      var pp = raw || { settings: {}, entries: [], sessions: [], morning: [], tests: [], weeks: [], checked: {} };
      pp.settings = pp.settings || {}; pp.entries = pp.entries || [];
      if (!pp.settings.start) pp.settings.start = mon;
      var endW = plusDays(mon, 6);
      pp.entries = pp.entries.filter(function (e) { return e.wp !== mon; });
      var own = pp.entries.filter(function (e) { return e.date >= mon && e.date <= endW; });
      if (own.length) notes.push("Atmung: Für diese Woche hast du dort schon " + own.length + " Übungen geplant – die bleiben, es wurde nichts doppelt eingetragen.");
      else {
        var ae = atmEntries(mon, a.atm, live([0, 1, 2, 3, 4, 5, 6]));
        pp.entries = pp.entries.concat(ae);
        ae.forEach(function (e) { out.push({ title: e.type, date: e.date, time: e.time, end: addMin(e.time, e.dur), app: "Atmung" }); });
      }
      pp.settings.morning = a.atm.morning || pp.settings.morning; pp.settings.evening = a.atm.evening || pp.settings.evening;
      try { localStorage.setItem("pulsplan.v1", JSON.stringify(pp)); } catch (e) {}
    }
    if (mon === mondayOf(t) && out.length) notes.push("Vergangene Tage dieser Woche wurden ausgelassen.");
    c.last = a; c.planned[mon] = Date.now();
    Object.keys(c.planned).forEach(function (k) { if (k < plusDays(mon, -56)) delete c.planned[k]; });
    wpSave(c);
    emit(); syncNow();
    out.sort(function (x, y) { return (x.date + x.time).localeCompare(y.date + y.time); });
    return { list: out, notes: notes };
  }
  // Erinnerung Samstag- oder Sonntagabend
  function wpDue() {
    var c = wpCfg(); if (!c.on || !c.remind) return null;
    var now = new Date(), wd = now.getDay(), t = iso(now);
    var day = c.remind === "sa" ? 6 : 0;
    if (!(wd === day || (day === 6 && wd === 0))) return null;
    if (wd === day && pad(now.getHours()) + ":" + pad(now.getMinutes()) < c.time) return null;
    var mon = plusDays(mondayOf(t), 7);
    if (c.planned[mon] || c.later === t) return null;
    return mon;
  }
  function renderWpToast() {
    if (!root) return;
    var tb = root.querySelector(".wptoast"), mon = wp ? null : wpDue();
    if (!mon) { tb.innerHTML = ""; return; }
    tb.innerHTML = "<div class='toast inst'><span class='mono' style='background:" + ME.color + "'>✓</span><div class='it'><b>Zeit für die Wochenplanung</b><small>KW " + kw(mon) + " · Training, Mobility, Atmung und Lernen in 2 Minuten planen.</small></div>" +
      "<div class='ia'><button class='no' data-p='later'>Später</button>" + (wpCfg().std ? "<button class='no' data-p='go'>Anpassen</button><button class='go' data-p='std'>Standard übernehmen</button>" : "<button class='go' data-p='go'>Jetzt planen</button>") + "</div></div>";
    tb.querySelectorAll("[data-p]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.dataset.p === "go") { openWeekPlan(null, mon); renderWpToast(); }
        else if (b.dataset.p === "std") { stdShow(mon); renderWpToast(); }
        else { var c = wpCfg(); c.later = iso(new Date()); wpSave(c); renderWpToast(); }
      });
    });
    var key = "wp@" + mon, fired = {};
    try { fired = JSON.parse(localStorage.getItem(FIRED_KEY) || "{}"); } catch (e) {}
    if (!fired[key] && notifyOk() && document.hidden) { fired[key] = Date.now(); try { localStorage.setItem(FIRED_KEY, JSON.stringify(fired)); } catch (e) {} show("Zeit für die Wochenplanung", "KW " + kw(mon) + " in 2 Minuten planen", key); }
  }
  if (!EMBED) { setInterval(renderWpToast, 60000); window.addEventListener("storage", function (e) { if (e.key === WP_KEY) renderWpToast(); }); }
  /* ---------- App-Wechsler (oben) und Befehle (⌘) ----------
   * Eine schmale Glasleiste oben: Planer · Training · Bibel und ⌘ für alle Befehle. In eingebetteten Bereichen nicht. */
  var CMD_EXTRA = [], PAL_OVERRIDE = null;
  function go(appId, hash) {
    if (appId === ME.id) { if (location.hash === (hash || "#")) window.dispatchEvent(new HashChangeEvent("hashchange")); else location.hash = hash || ""; return; }
    var a = APPS.find(function (x) { return x.id === appId; }); location.href = appUrl(a) + (hash || "");
  }
  function globalCommands() {
    var L = [];
    function add(g, label, run, k) { L.push({ g: g, label: label, run: run, k: k || "" }); }
    APPS.forEach(function (a) { if (a.id !== ME.id) add("Apps", a.name + " öffnen", function () { go(a.id, ""); }); });
    add("Planer", "Heute (Briefing)", function () { go("planer", "#brief"); });
    add("Planer", "Kalender", function () { go("planer", "#cal"); });
    add("Planer", "Aufgaben", function () { go("planer", "#tasks"); });
    add("Planer", "Schule: Stundenplan, Prüfungen, Hausaufgaben", function () { go("planer", "#schule"); });
    add("Planer", "Pause starten", function () { go("planer", "#pause"); });
    add("Training", "Training starten", function () { go("training", "#start"); });
    add("Training", "Training-Kalender", function () { go("training", "#kalender"); });
    add("Training", "Laufen", function () { go("training", "#lauf"); });
    add("Training", "Fitness & Analyse", function () { go("training", "#fitness"); });
    add("Training", "Mobility-Block", function () { go("training", "#mobility"); });
    add("Training", "Mobility vor/nach dem Wettkampf", function () { go("training", "#mobility/wettkampf"); });
    add("Training", "Atemübung starten", function () { go("training", "#atmung/train"); });
    add("Training", "Morgen-HRV messen", function () { go("training", "#atmung"); });
    add("Training", "Bahnplan öffnen", function () { go("training", "#bahnplan"); });
    add("Training", "Kurvenbuch drucken", function () { go("training", "#bahnplan/buch"); });
    add("Training", "Atemplan dieser Woche", function () { go("training", "#atmung/week"); });
    add("Bibel", "Heute lesen", function () { go("bibel", "#lesen"); });
    add("Bibel", "Bibliothek (alle Bücher)", function () { go("bibel", "#bibliothek"); });
    add("Bibel", "Zufallsvers", function () { go("bibel", "#zufall"); });
    add("Bibel", "Meine Bibel: Favoriten, Notizen", function () { go("bibel", "#meinebibel"); });
    if (wpCfg().on) {
      add("Planen", "Woche planen", function () { openWeekPlan(); });
      add("Planen", "Nächste Woche planen", function () { openWeekPlan("", plusDays(mondayOf(iso(new Date())), 7)); });
    }
    add("Planen", "Wochenplanung: Einstellungen", function () { openWeekPlan("settings"); });
    add("Kalender", "Neuer Termin", function () { openPanel(); state.edit = { date: iso(new Date()), app: APP }; render(); });
    add("Kalender", "Monatsübersicht aller Apps", function () { openPanel(); });
    add("Kalender", "Kalender als .ics exportieren", function () { download("gemeinsamer-kalender.ics", "text/calendar", ics()); });
    if (window.SGTheme) {
      window.SGTheme.list.forEach(function (t) { add("Design", "Design: " + t.name + " – " + t.info, function () { window.SGTheme.set(t.id); }); });
      add("Design", "Glaseffekt " + (window.SGTheme.glass() ? "ausschalten" : "einschalten"), function () { window.SGTheme.setGlass(!window.SGTheme.glass()); });
    }
    add("Daten", cfg().token ? "Jetzt synchronisieren" : "Cloud-Sicherung einrichten", function () { if (cfg().token) syncNow(); else openPanel(null, "sync"); });
    add("Daten", "Frühere Stände zurückholen", function () { openPanel(null, "sync"); });
    add("Daten", "Alles als Datei sichern", function () { download("sportgermany-sicherung-" + iso(new Date()) + ".json", "application/json", JSON.stringify(fullBackup(), null, 2)); });
    if ("Notification" in window && Notification.permission === "default") add("Daten", "Erinnerungen als Benachrichtigung erlauben", askNotify);
    if (!standalone()) add("Daten", ME.name + " als App installieren", function () { installNow(); });
    return L.concat(CMD_EXTRA);
  }
  var pal = null;
  // alle eingegebenen Wörter müssen vorkommen („design graphit“ findet „Design: Graphit“)
  function wordsMatch(text, ql) { text = text.toLowerCase(); return !ql || ql.split(/\s+/).every(function (w) { return text.indexOf(w) > -1; }); }
  function palItems(q) {
    var ql = q.trim().toLowerCase(), out = [];
    globalCommands().forEach(function (c) { if (wordsMatch(c.g + " " + c.label, ql)) out.push(c); });
    // passende Befehle zuerst – „Aufgabe anlegen“ steht dahinter (oder vorn, wenn nichts passt)
    if (ql) { var mk = { g: "Anlegen", label: "Aufgabe anlegen: " + q.trim(), run: function () { api.tasks.add({ title: q.trim(), due: "" }); flash("Aufgabe angelegt"); } }; if (out.length) out.push(mk); else out.unshift(mk); }
    if (ql.length > 1) {
      var t = iso(new Date()), seen = {};
      allItems(plusDays(t, -60), plusDays(t, 120)).forEach(function (e) {
        if (seen[e.id] || (e.title + " " + (e.note || "")).toLowerCase().indexOf(ql) < 0) return; seen[e.id] = 1;
        out.push({ g: "Termine", label: e.title, k: shortDate(e.date) + (e.time ? " " + e.time : ""), run: function () { if (e.linkApp && e.linkApp !== ME.id) location.href = window.SGFixUrl ? window.SGFixUrl(e.link) : e.link; else if (e.linkHash) go(ME.id, e.linkHash); else openPanel(e.date); } });
      });
      api.tasks.list().forEach(function (x) { if (!x.done && x.title.toLowerCase().indexOf(ql) > -1) out.push({ g: "Aufgaben", label: x.title, k: x.due ? shortDate(x.due) : "", run: function () { go("planer", "#tasks"); } }); });
    }
    return out.slice(0, 60);
  }
  function openPalette(text) {
    if (PAL_OVERRIDE) return PAL_OVERRIDE(text);
    mount(); pal = { q: text || "", i: 0 }; palRender(true);
  }
  function closePal() { pal = null; palRender(); }
  function palRender(focus) {
    var box = root.querySelector(".palbox");
    if (!pal) { box.innerHTML = ""; return; }
    var items = palItems(pal.q); pal.items = items; pal.i = Math.min(pal.i, Math.max(0, items.length - 1));
    if (!box.firstChild) {
      box.innerHTML = "<div class='palw'><div class='palp' role='dialog' aria-label='Befehle'><input class='palin' placeholder='Befehl, App oder Termin suchen … oder neue Aufgabe tippen' autocomplete='off'><div class='pall'></div><div class='palf'>↑↓ auswählen · Enter ausführen · Esc schließen</div></div></div>";
      var inp = box.querySelector(".palin");
      inp.value = pal.q;
      inp.addEventListener("input", function () { pal.q = inp.value; pal.i = 0; palRender(); });
      inp.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") { pal.i = Math.min(pal.items.length - 1, pal.i + 1); palRender(); e.preventDefault(); }
        else if (e.key === "ArrowUp") { pal.i = Math.max(0, pal.i - 1); palRender(); e.preventDefault(); }
        else if (e.key === "Enter") { var it = pal.items[pal.i]; if (it) { closePal(); it.run(); } }
        else if (e.key === "Escape") closePal();
      });
      box.querySelector(".palw").addEventListener("click", function (e) {
        if (e.target.classList.contains("palw")) return closePal();
        var r = e.target.closest("[data-pi]"); if (!r) return;
        var it = pal.items[+r.dataset.pi]; closePal(); if (it) it.run();
      });
    }
    var g = "", h = "";
    items.forEach(function (it, n) {
      if (it.g !== g) { g = it.g; h += "<div class='palg'>" + esc(g) + "</div>"; }
      h += "<div class='pali" + (n === pal.i ? " on" : "") + "' data-pi='" + n + "'><span>" + esc(it.label) + "</span>" + (it.k ? "<kbd>" + esc(it.k) + "</kbd>" : "") + "</div>";
    });
    box.querySelector(".pall").innerHTML = h || "<div class='palg'>Nichts gefunden</div>";
    var on = box.querySelector(".pali.on"); if (on) on.scrollIntoView({ block: "nearest" });
    if (focus) box.querySelector(".palin").focus();
  }
  function flash(msg) {
    var tb = root.querySelector(".wptoast");
    tb.innerHTML = "<div class='toast inst'><span class='mono' style='background:" + ME.color + "'>✓</span><div class='it'><b>" + esc(msg) + "</b></div></div>";
    setTimeout(function () { renderWpToast(); }, 1800);
  }
  // App-Knopf: rund, links neben der unteren Leiste. Öffnet ein Menü mit den Apps, der Suche und dem Wichtigsten.
  var APPICON = {
    planer: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round'><rect x='3.5' y='5' width='17' height='15.5' rx='3.5'/><path d='M3.5 10h17M8.5 3v4M15.5 3v4'/></svg>",
    training: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'><path d='M3 12h3l2.5-6 4 12 3-9 1.5 3H21'/></svg>",
    bibel: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'><path d='M5 4.5h10.5A3.5 3.5 0 0 1 19 8v11.5H8.5A3.5 3.5 0 0 1 5 16z'/><path d='M5 16a3.5 3.5 0 0 1 3.5-3.5H19M12 7v5M9.5 9h5'/></svg>",
    search: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'><circle cx='11' cy='11' r='6.5'/><path d='M20 20l-4.2-4.2'/></svg>",
    week: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round'><rect x='3.5' y='5' width='17' height='15.5' rx='3.5'/><path d='M3.5 10h17M8 14h3M13 14h3M8 17h3'/></svg>",
    design: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9'><circle cx='12' cy='12' r='8.5'/><path d='M12 3.5a8.5 8.5 0 0 0 0 17z' fill='currentColor'/></svg>",
    sync: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round'><path d='M7 18a5 5 0 0 1-.6-9.96A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z'/></svg>"
  };
  var APPCOL = { planer: "#0a84ff", training: "#30d158", bibel: "#c79a5b" };
  var appb = null, appm = null;
  // App-Knopf oben rechts (klein, rund) – die untere Leiste behält ihre volle Breite
  function placeAppBtn() {
    if (!appb) return;
    var hide = ME.id === "planer" && innerWidth > 1000; // dort steht „Planer ⌄“ in der Seitenleiste
    appb.style.display = hide ? "none" : "";
    document.documentElement.classList.toggle("sg-appbtn", !hide);
  }
  function appMenuHTML() {
    var row = function (act, icon, col, title, sub, right) {
      return "<button class='mr' data-m='" + act + "'><span class='mi' style='background:" + col + "'>" + icon + "</span><span class='mt'><b>" + esc(title) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span>" + (right || "") + "</button>";
    };
    var h = "<div class='mg'>" + APPS.map(function (a) {
      return row("app:" + a.id, APPICON[a.id], APPCOL[a.id] || a.color, a.name, a.id === "planer" ? "Kalender, Aufgaben, Schule" : a.id === "training" ? "Training, Mobility, Atmung" : "Elberfelder 1905", a.id === ME.id ? "<span class='ck'>✓</span>" : "");
    }).join("") + "</div><div class='mg'>" + row("search", APPICON.search, "#636366", "Suchen und Befehle", "", "<kbd>Strg K</kbd>");
    if (wpCfg().on) h += row("week", APPICON.week, "#ff9f0a", "Woche planen", "");
    h += row("design", APPICON.design, "#5e5ce6", "Design", window.SGTheme ? window.SGTheme.current().name : "");
    var st = api.status();
    h += row("sync", APPICON.sync, "#64d2ff", "Cloud-Sicherung", st.connected ? (st.error ? "Fehler" : "aktiv") : "aus", "<span class='chev'>›</span>");
    return h + "</div>";
  }
  function closeAppMenu() { if (appm) appm.classList.remove("on"); }
  function openAppMenu(anchor) {
    if (!appm) return;
    appm.innerHTML = appMenuHTML();
    var r = (anchor || appb).getBoundingClientRect();
    appm.style.left = Math.max(8, Math.min(r.left, innerWidth - 308)) + "px";
    if (r.top < innerHeight / 2) { appm.style.top = Math.round(r.bottom + 8) + "px"; appm.style.bottom = "auto"; appm.style.transformOrigin = "top left"; }
    else { appm.style.bottom = Math.round(innerHeight - r.top + 10) + "px"; appm.style.top = "auto"; appm.style.transformOrigin = "bottom left"; }
    appm.classList.add("on");
    appm.anchor = anchor || appb;
  }
  function mountSwitcher() {
    if (EMBED || !root || appb || document.documentElement.classList.contains("sg-dir")) return;
    document.documentElement.classList.add("sg-appbtn");
    var v = root.querySelector(".v");
    appb = document.createElement("button"); appb.className = "appb"; appb.setAttribute("aria-label", "Apps und Befehle");
    appb.innerHTML = APPICON[ME.id] || APPICON.planer; v.appendChild(appb);
    appm = document.createElement("div"); appm.className = "appm"; appm.setAttribute("role", "menu"); v.appendChild(appm);
    appb.addEventListener("click", function () { if (appm.classList.contains("on")) closeAppMenu(); else openAppMenu(); });
    api.openAppMenu = function (el) { if (appm.classList.contains("on")) closeAppMenu(); else openAppMenu(el); };
    appm.addEventListener("click", function (e) {
      var b = e.target.closest("[data-m]"); if (!b) return;
      var m = b.dataset.m; closeAppMenu();
      if (m.indexOf("app:") === 0) { var id = m.slice(4); if (id !== ME.id) go(id, ""); }
      else if (m === "search") openPalette();
      else if (m === "week") openWeekPlan();
      else if (m === "design") openPanel(null, "design");
      else if (m === "sync") openPanel(null, "sync");
    });
    document.addEventListener("pointerdown", function (e) { if (appm.classList.contains("on") && !e.composedPath().some(function (n) { return n === appm || n === appb || n === appm.anchor; })) closeAppMenu(); }, true);
    placeAppBtn(); setTimeout(placeAppBtn, 400); setTimeout(placeAppBtn, 1500);
    window.addEventListener("resize", placeAppBtn);
    new MutationObserver(function () { clearTimeout(placeAppBtn.t); placeAppBtn.t = setTimeout(placeAppBtn, 120); }).observe(document.documentElement, { attributes: true, subtree: false });
    window.addEventListener("hashchange", function () { setTimeout(placeAppBtn, 60); });
  }
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K") && !EMBED) { e.preventDefault(); openPalette(); }
    else if (e.key === "Escape" && pal) closePal();
    else if (e.key === "Escape") closeAppMenu();
  });
  function hashCmd() {
    if (location.hash === "#wochenplanung") { history.replaceState(null, "", location.pathname); openWeekPlan(); }
    else if (location.hash === "#befehle") { history.replaceState(null, "", location.pathname); openPalette(); }
  }
  if (!EMBED) { window.addEventListener("hashchange", hashCmd); setTimeout(hashCmd, 300); }
  api.palette = openPalette;
  api.openDesign = function () { openPanel(null, "design"); };
  api.openSync = function () { openPanel(null, "sync"); };
  api.wordsMatch = wordsMatch;
  api.commands = globalCommands;
  api.addCommands = function (list) { CMD_EXTRA = CMD_EXTRA.concat(list); };
  api.setPalette = function (fn) { PAL_OVERRIDE = fn; };
  api.weekPlan = function (view, mon) { if (EMBED) { try { return window.top.SharedCalendar.weekPlan(view, mon); } catch (e) {} } openWeekPlan(view, mon); };
  api.weekPlanned = function (mon) { return wpCfg().planned[mondayOf(mon)] || 0; };
  api.weekPlanConfig = wpCfg;
  // ein Tipp: Standardwoche für die passende Woche eintragen (ohne Standardwoche: erst festlegen)
  api.weekPlanStd = function () {
    if (EMBED) { try { return window.top.SharedCalendar.weekPlanStd(); } catch (e) {} }
    if (!wpCfg().std) return openWeekPlan("std");
    stdShow();
  };
  // automatisch: diese Woche (falls noch nicht geplant) und ab Freitag auch die nächste
  function stdAuto() {
    var c = wpCfg(); if (EMBED || !c.on || !c.stdAuto || !c.std) return;
    var t = iso(new Date()), mons = [mondayOf(t)]; if ((new Date().getDay() + 6) % 7 >= 4) mons.push(plusDays(mondayOf(t), 7));
    mons.forEach(function (m) { if (!wpCfg().planned[m]) stdApply(m); });
  }
  setTimeout(stdAuto, 3000);
  api.weekPlanSave = function (c) { wpSave(c); renderWpToast(); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && wp) closeWeekPlan(); else if (e.key === "Escape" && state.open) close(); });
  window.addEventListener("sg-theme", function () { if (root) render(true); });
  window.addEventListener("sg-theme-set", function () { schedulePush(); });
  if (!EMBED) { if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount); }
})();
