/* Übersicht – das gemeinsame Verzeichnis aller Apps (Planer, Training, Bibel).
 * Startseite jeder App: oben Tabs Start · Planer · Training · Bibel (auch per Wischen). „Start“ zeigt Jetzt, Notizen,
 * Favoriten und Zuletzt; die übrigen Tabs alle Bereiche einer App als kompakte Kacheln – ohne langes Scrollen.
 * Ein Eintrag öffnet die bestehende Seite der App (über deren Sprungadressen) – die alten Leisten entfallen.
 * Android: Zurück-Geste führt zur Übersicht bzw. zum Ordner, langes Drücken öffnet Optionen, Blätter von unten.
 * Läuft vollständig offline (steht direkt in der Seite), Einstellungen liegen im gemeinsamen Speicher und
 * werden – wenn eingerichtet – mit der Cloud-Sicherung abgeglichen. */
(function () {
  "use strict";
  if (window.SGDir) return;
  var EMBED = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  if (EMBED) return;
  // Eine App: Planer im Hauptordner, Training und Bibel als Unterordner
  var SEG = location.pathname.split("/"), PATH = "/" + (SEG[1] || "") + "/";
  var APP = SEG[2] === "training" ? "training" : SEG[2] === "bibel" ? "bibel" : "planer";
  var KEY = "sg-dir-v1";
  var APPS = {
    planer: { name: "Planer", path: PATH, color: "#6aa6ff", sub: "Kalender, Aufgaben, Schule, Pause" },
    training: { name: "Training", path: PATH + "training/", color: "#57c98d", sub: "Training, Mobility, Atmung, Rodeln" },
    bibel: { name: "Bibel", path: PATH + "bibel/", color: "#d9a86c", sub: "Elberfelder 1905" }
  };
  /* ---------- Einträge ----------
   * a App, t Titel, s Untertitel, ic Symbol, c Farbe, r Sprungadresse der App, f Unterseite im Bereich (Planer),
   * sec Abschnitt auf der Seite (wird angescrollt), fn Funktion, k Unterpunkte (Ordner), w Suchwörter */
  var E = {
    // Planer
    p_heute: { a: "planer", t: "Heute", s: "Nächster Termin, Aufgaben, freie Zeit", ic: "sun", c: "#6aa6ff", r: "brief" },
    p_kal: { a: "planer", t: "Kalender", s: "Tag, Woche, Monat – Termine aller Apps", ic: "cal", c: "#ff6b6b", r: "cal", w: "termine woche monat" },
    p_auf: { a: "planer", t: "Aufgaben", s: "Heute, Geplant, Wichtig, Erledigt", ic: "check", c: "#6aa6ff", r: "tasks", w: "todo liste" },
    p_woche: { a: "planer", t: "Woche planen", s: "Training, Lernen, Mobility und Atmung eintragen", ic: "wand", c: "#b48cff", fn: "week", w: "wochenplanung" },
    p_schule: { a: "planer", t: "Schule", s: "Stundenplan, Hausaufgaben, Lernplan", ic: "school", c: "#4f8fe8", k: ["p_s_heute", "p_s_plan", "p_s_auf", "p_s_lehr", "p_s_kal"] },
    p_s_heute: { a: "planer", t: "Schultag", s: "Stunden und Aufgaben von heute", ic: "sun", c: "#4f8fe8", r: "schule", f: "schule:heute" },
    p_s_plan: { a: "planer", t: "Stundenplan", s: "A/B-Wochen, Stunden, Räume", ic: "grid", c: "#4f8fe8", r: "schule", f: "schule:plan" },
    p_s_auf: { a: "planer", t: "Hausaufgaben & Prüfungen", s: "Was bis wann zu tun ist", ic: "check", c: "#4f8fe8", r: "schule", f: "schule:aufgaben", w: "schulaufgabe test" },
    p_s_lehr: { a: "planer", t: "Lernplan", s: "Lehrgang, Lernetappen, Lernzeit", ic: "flag", c: "#4f8fe8", r: "schule", f: "schule:lehrgang", w: "lehrgang lernen" },
    p_s_kal: { a: "planer", t: "Schuljahr & Ferien", s: "Ferien, Feiertage, Schultermine", ic: "cal", c: "#4f8fe8", r: "schule", f: "schule:kalender" },
    p_pause: { a: "planer", t: "Pause", s: "Ablenken, Wissen, Quiz", ic: "coffee", c: "#e5a04b", k: ["p_p_abl", "p_p_wis", "p_p_quiz", "p_p_kal", "p_p_set"] },
    p_p_abl: { a: "planer", t: "Ablenken", s: "Artikel, Fakten, Meldungen", ic: "spark", c: "#e5a04b", r: "pause", f: "pause:ablenken" },
    p_p_wis: { a: "planer", t: "Wissen", s: "Zum Stöbern nach Themen", ic: "book", c: "#e5a04b", r: "pause", f: "pause:wissen" },
    p_p_quiz: { a: "planer", t: "Quiz & Tages-Challenge", s: "Kategorien und Punkte", ic: "quiz", c: "#e5a04b", r: "pause", f: "pause:quiz" },
    p_p_kal: { a: "planer", t: "Pausen-Verlauf", s: "Letzte Tage und Erfolge", ic: "history", c: "#e5a04b", r: "pause", f: "pause:kalender", w: "erfolge" },
    p_p_set: { a: "planer", t: "Pause einstellen", s: "Kategorien und Quellen", ic: "gear", c: "#e5a04b", r: "pause", f: "pause:einst" },
    // Training
    t_heute: { a: "training", t: "Heute", s: "Bereitschaft, Dazu heute, Übungen", ic: "sun", c: "#57c98d", r: "heute" },
    t_kal: { a: "training", t: "Kalender", s: "Woche, Wetter, Rückblick, alle Termine", ic: "cal", c: "#ff6b6b", r: "kalender", w: "wetter trainingskalender" },
    t_woche: { a: "training", t: "Woche planen", s: "Training, Laufen, Mobility, Atmung", ic: "wand", c: "#b48cff", fn: "week", w: "wochenplanung" },
    t_std: { a: "training", t: "Standardwoche", s: "Mit einem Tipp übernehmen", ic: "ok", c: "#57c98d", fn: "stdweek", w: "vorlage trainingsplan woche übernehmen standard" },
    t_lauf: { a: "training", t: "Laufen & Kraft", s: "Lauf live, erfassen, Programme", ic: "run", c: "#57c98d", k: ["t_live", "t_erf", "t_prog", "t_cool", "t_verl"] },
    t_live: { a: "training", t: "Lauf live", s: "GPS, Tempo, Splits", ic: "run", c: "#57c98d", r: "lauf", sec: "Lauf live tracken", w: "gps joggen" },
    t_erf: { a: "training", t: "Einheit erfassen", s: "Lauf, Gym, Rodeln nachtragen", ic: "plus", c: "#57c98d", r: "lauf", sec: "Manuell erfassen" },
    t_prog: { a: "training", t: "Programme starten", s: "Dehnen, Rodeln-Aufwärmen, Gym", ic: "dumbbell", c: "#e07a5f", r: "lauf", sec: "Programme starten", w: "gym kraft aufwärmen dehnen" },
    t_cool: { a: "training", t: "Cool-down", s: "Nach dem Training", ic: "stretch", c: "#57c98d", r: "lauf", sec: "Cool-down" },
    t_verl: { a: "training", t: "Verlauf & Statistik", s: "Lauf-, Gym-, Rodel- und Dehnverlauf", ic: "chart", c: "#8f7cf7", r: "lauf", sec: "Verlauf & Statistik" },
    t_mob: { a: "training", t: "Mobility", s: "Tagesblock, Wettkampf, Übungen", ic: "stretch", c: "#ef7f93", k: ["t_m_heute", "t_m_wk", "t_m_ueb", "t_m_fort"] },
    t_m_heute: { a: "training", t: "Tagesblock", s: "A Rücken · B Hüfte · C Beine", ic: "stretch", c: "#ef7f93", r: "mobility/heute" },
    t_m_wk: { a: "training", t: "Wettkampf", s: "Vor dem Start · nach dem Lauf", ic: "flag", c: "#ef7f93", r: "mobility/wettkampf" },
    t_m_ueb: { a: "training", t: "Übungen", s: "Alle Mobility-Übungen mit Anleitung", ic: "list", c: "#ef7f93", r: "mobility/uebungen" },
    t_m_fort: { a: "training", t: "Fortschritt", s: "Vorbeuge-Test, letzte Wochen", ic: "chart", c: "#ef7f93", r: "mobility/fortschritt" },
    t_atm: { a: "training", t: "Atmung & HRV", s: "Üben, Morgenmessung, 12-Wochen-Plan", ic: "wind", c: "#ee8f5a", k: ["t_a_heute", "t_a_train", "t_a_week", "t_a_log", "t_a_plan"] },
    t_a_heute: { a: "training", t: "Heute & Akut-Hilfe", s: "Fokus der Phase, zyklisches Seufzen", ic: "sun", c: "#ee8f5a", r: "atmung/today" },
    t_a_train: { a: "training", t: "Üben & Morgenmessung", s: "Resonanzatmung, Biofeedback, HRV", ic: "wind", c: "#ee8f5a", r: "atmung/train", w: "hrv polar" },
    t_a_week: { a: "training", t: "Atem-Woche", s: "Einheiten der Woche", ic: "cal", c: "#ee8f5a", r: "atmung/week" },
    t_a_log: { a: "training", t: "Verlauf", s: "Einheiten, Messwerte, Wochen-Check", ic: "history", c: "#ee8f5a", r: "atmung/log" },
    t_a_plan: { a: "training", t: "12-Wochen-Plan", s: "4 Phasen und Wissen", ic: "flag", c: "#ee8f5a", r: "atmung/plan" },
    t_rod: { a: "training", t: "Rodeln", s: "Bahnplan, Kurvenbuch, Läufe", ic: "sled", c: "#4aa3df", k: ["t_r_bahn", "t_r_plan", "t_r_lauf", "t_r_buch", "t_r_warm"] },
    t_r_bahn: { a: "training", t: "Meine Bahnen", s: "Bahnen hinzufügen und wählen", ic: "map", c: "#4aa3df", r: "bahnplan/bahnen" },
    t_r_plan: { a: "training", t: "Kurvenbuch", s: "Plan, Starts, Kurven", ic: "sled", c: "#4aa3df", r: "bahnplan/plan", w: "bahnplan kurven" },
    t_r_lauf: { a: "training", t: "Läufe & Zeiten", s: "Start-, Zwischen- und Endzeiten", ic: "timer", c: "#4aa3df", r: "bahnplan/laeufe" },
    t_r_buch: { a: "training", t: "Bahnplan drucken", s: "Buch für deinen Start", ic: "print", c: "#4aa3df", r: "bahnplan/buch" },
    t_r_warm: { a: "training", t: "Rodeln-Aufwärmen", s: "15 Minuten, durchgehend bewegt", ic: "play", c: "#4aa3df", r: "lauf", fn: "click:btnRodelnStart" },
    t_sw: { a: "training", t: "Sportwissenschaft", s: "Lehrbuch, Karteikarten, Quiz, Suche", ic: "book", c: "#5ac8fa", k: ["t_sw_lesen", "t_sw_karten", "t_sw_quiz", "t_sw_suche"] },
    t_sw_lesen: { a: "training", t: "Lehrbuch lesen", s: "8 Kapitel, Fortschritt wird gespeichert", ic: "book", c: "#5ac8fa", u: "wissen/#lesen", w: "sportwissenschaft buch kapitel muskel energie ernährung regeneration" },
    t_sw_karten: { a: "training", t: "Karteikarten", s: "Merksätze und Mach-das/Lass-das", ic: "list", c: "#5ac8fa", u: "wissen/#karten", w: "lernen merksätze sportwissenschaft" },
    t_sw_quiz: { a: "training", t: "Wissensquiz", s: "Mit Auswertung, Fehler kommen wieder", ic: "quiz", c: "#5ac8fa", u: "wissen/#quiz", w: "quiz test sportwissenschaft" },
    t_sw_suche: { a: "training", t: "Im Buch suchen", s: "z. B. Eisbad oder Dehnen", ic: "search", c: "#5ac8fa", u: "wissen/#suche", w: "suche eisbad dehnen sportwissenschaft" },
    t_ausw: { a: "training", t: "Auswertung", s: "Analyse, Fitness, Rekorde, Export", ic: "chart", c: "#8f7cf7", k: ["t_d_ana", "t_f_fit", "t_f_rek", "t_f_ready", "t_d_exp"] },
    t_d_ana: { a: "training", t: "Analyse", s: "12 Wochen, km pro Woche, Aktivitäten", ic: "chart", c: "#8f7cf7", r: "daten" },
    t_f_fit: { a: "training", t: "Fitness", s: "Wochenrückblick, Muskelgruppen", ic: "pulse", c: "#8f7cf7", r: "fitness" },
    t_f_rek: { a: "training", t: "Rekorde & Abzeichen", s: "Persönliche Bestwerte", ic: "trophy", c: "#8f7cf7", r: "fitness", sec: "Persönliche Rekorde" },
    t_f_ready: { a: "training", t: "Erholung & Ermüdung", s: "Readiness, Ermüdung nach Muskelgruppe", ic: "battery", c: "#8f7cf7", r: "fitness", sec: "Readiness" },
    t_d_exp: { a: "training", t: "Bericht & Export", s: "PDF, Share-Karte, Datei", ic: "share", c: "#8f7cf7", r: "daten", sec: "Export" },
    // Bibel
    b_heute: { a: "bibel", t: "Heute", s: "Vers des Tages, Serie, Tagesziel", ic: "sun", c: "#d9a86c", r: "heute" },
    b_lesen: { a: "bibel", t: "Weiterlesen", s: "Abschnitt von heute", ic: "book", c: "#d9a86c", r: "lesen", w: "lesen leseplan" },
    b_bib: { a: "bibel", t: "Bibliothek & Suche", s: "66 Bücher, Stellen wie „Joh 3,16“", ic: "library", c: "#c08a52", r: "bibliothek", w: "suchen buch kapitel" },
    b_meine: { a: "bibel", t: "Meine Bibel", s: "Favoriten, Notizen, Verlauf", ic: "bookmark", c: "#e0b34e", k: ["b_fav", "b_notes", "b_hist", "b_zuf"] },
    b_fav: { a: "bibel", t: "Favoriten", s: "Markierte Verse", ic: "star", c: "#e0b34e", r: "meinebibel", f: "fav" },
    b_notes: { a: "bibel", t: "Notizen", s: "Gedanken zu Versen", ic: "note", c: "#e0b34e", r: "meinebibel", f: "notes" },
    b_hist: { a: "bibel", t: "Verlauf", s: "Gelesene Abschnitte", ic: "history", c: "#e0b34e", r: "meinebibel", f: "history" },
    b_zuf: { a: "bibel", t: "Zufallsvers", s: "Ein Vers für zwischendurch", ic: "dice", c: "#e0b34e", r: "zufall" },
    // Einstellungen (für alle Apps)
    x_set: { a: "*", t: "Einstellungen", s: "Übersicht, Design, Sicherung, Version", ic: "gear", c: "#8e8e93", k: ["x_dir", "x_design", "x_cloud", "x_ver", "x_install", "t_einst", "b_set"] },
    x_notiz: { a: "*", t: "Notizen", s: "Schnelle Ideen – mit oder ohne Erinnerung", ic: "note", c: "#e0b34e", fn: "notes", w: "idee merken erinnerung notiz" },
    x_ver: { a: "*", t: "Version aktualisieren", s: "Neueste Fassung der App laden", ic: "download", c: "#5ac8fa", fn: "update", w: "update version neu laden" },
    x_dir: { a: "*", t: "Übersicht anpassen", s: "Name, Startseite, Reihenfolge, Ausgeblendetes", ic: "tune", c: "#8e8e93", fn: "customize" },
    x_design: { a: "*", t: "Design", s: "10 Farbwelten, Glas", ic: "palette", c: "#8f7cf7", fn: "design", w: "farbe thema" },
    x_cloud: { a: "*", t: "Cloud-Sicherung", s: "Abgleich über GitHub – die Apps laufen immer auch offline", ic: "cloud", c: "#5ac8fa", fn: "sync", w: "github sync backup" },
    x_install: { a: "*", t: "App installieren", s: "Auf den Startbildschirm", ic: "download", c: "#8e8e93", fn: "install" },
    t_einst: { a: "training", t: "Training einstellen", s: "Ziele, Ruhetage, Erinnerungen, Daten", ic: "gear", c: "#57c98d", r: "einst", w: "ruhetage körper ziele import" },
    b_set: { a: "bibel", t: "Bibel einstellen", s: "Schrift, Lesemodus, Daten", ic: "gear", c: "#d9a86c", r: "mehr", w: "schrift sepia nacht" }
  };
  var ROOT = {
    planer: ["p_heute", "p_kal", "p_auf", "p_woche", "p_schule", "p_pause"],
    training: ["t_heute", "t_kal", "t_std", "t_woche", "t_lauf", "t_mob", "t_atm", "t_rod", "t_sw", "t_ausw"],
    bibel: ["b_heute", "b_lesen", "b_bib", "b_meine"]
  };
  var PARENT = {};
  Object.keys(E).forEach(function (id) { E[id].id = id; (E[id].k || []).forEach(function (c) { PARENT[c] = id; }); });
  // Sprungadressen der Apps → Eintrag (für Links innerhalb der Apps, Befehle und App-Verknüpfungen)
  var NATIVE = {
    planer: { brief: "p_heute", cal: "p_kal", tasks: "p_auf", schule: "p_s_heute", pause: "p_p_abl" },
    training: { heute: "t_heute", start: "t_heute", kalender: "t_kal", lauf: "t_prog", daten: "t_d_ana", fitness: "t_f_fit", einst: "t_einst", mobility: "t_m_heute",
      "mobility/heute": "t_m_heute", "mobility/wettkampf": "t_m_wk", "mobility/uebungen": "t_m_ueb", "mobility/fortschritt": "t_m_fort", atmung: "t_a_heute", "atmung/today": "t_a_heute",
      "atmung/train": "t_a_train", "atmung/week": "t_a_week", "atmung/log": "t_a_log", "atmung/plan": "t_a_plan", bahnplan: "t_r_bahn", "bahnplan/bahnen": "t_r_bahn",
      "bahnplan/plan": "t_r_plan", "bahnplan/laeufe": "t_r_lauf", "bahnplan/buch": "t_r_buch" },
    bibel: { heute: "b_heute", lesen: "b_lesen", bibliothek: "b_bib", meinebibel: "b_fav", mehr: "b_set", zufall: "b_zuf" }
  }[APP];

  /* ---------- Einstellungen der Übersicht ---------- */
  function loadP() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  var P = Object.assign({ fav: ["p_heute", "p_kal", "t_heute", "b_lesen"], hidden: [], recent: [], start: {}, order: null, name: "", subs: true, now: true, tab: "start" }, loadP());
  var TABS = ["start", "planer", "training", "bibel"];
  if (TABS.indexOf(P.tab) < 0) P.tab = "start";
  function saveP() { P.updated = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  addEventListener("storage", function (e) { if (e.key === KEY) { P = Object.assign(P, loadP()); if (homeOn()) refresh(); } else if (e.key === "sg-notizen-v1" && homeOn()) refresh(); });
  function appOrder() { var o = (P.order || []).filter(function (a) { return APPS[a]; }); ["planer", "training", "bibel"].forEach(function (a) { if (o.indexOf(a) < 0) o.push(a); }); if (!P.order) { o.splice(o.indexOf(APP), 1); o.unshift(APP); } return o; }

  /* ---------- Symbole (Material-Stil, Linien) ---------- */
  var IC = {
    back: '<path d="M20 12H5M11 5l-7 7 7 7"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', more: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>', chev: '<path d="M9 5l7 7-7 7"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', check: '<path d="M4 6.5l1.8 1.8L9 5M4 12.5l1.8 1.8L9 11M4 18.5l1.8 1.8L9 17M12.5 7h7.5M12.5 13h7.5M12.5 19h7.5"/>',
    wand: '<path d="M4 20L16 8M14 6l4 4M18 3v3M21 6h-3M7 4v2M8 5H6"/>', school: '<path d="M2.5 9l9.5-5 9.5 5-9.5 5z"/><path d="M6.5 11.2v4.8c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.8"/>',
    coffee: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M11 3v3"/>', grid: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 9.5h16M4 14.5h16M9.5 4v16"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>', quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5l1.6 2.6 3-.6.6 3 2.6 1.6-1.4 2.9 1.4 2.9-2.6 1.6-.6 3-3-.6L12 21.5l-1.6-2.6-3 .6-.6-3-2.6-1.6L5.6 12 4.2 9.1l2.6-1.6.6-3 3 .6z"/>',
    run: '<circle cx="14.5" cy="4.5" r="2"/><path d="M8 21l3-6 3 2 1 4M10.5 15l1-5 4 2 3-1M8 10l3-2"/>', plus: '<path d="M12 5v14M5 12h14"/>', dumbbell: '<path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/>',
    stretch: '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v6l-4 7M12 13l4 7M5 10l7-1 7 1"/>', chart: '<path d="M4 20V11M10 20V5M16 20v-6M21 20H3"/>', list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>', sled: '<path d="M3 17h15a3 3 0 0 0 3-3M6 17l-2 3M15 17l-2 3"/><circle cx="9" cy="8" r="2"/><path d="M7 13.5l3-3 4 1"/>',
    map: '<path d="M9 4L3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>', timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M10 2h4"/>', print: '<path d="M7 9V3h10v6"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    play: '<path d="M7 4.5l12 7.5-12 7.5z"/>', pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>', trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>',
    battery: '<rect x="3" y="7" width="16" height="10" rx="2.5"/><path d="M21 10.5v3M6.5 10v4M10 10v4"/>', share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
    library: '<path d="M4 4v16M8.5 4v16M13 5l4.5 15M20 20H3"/>', bookmark: '<path d="M6 3.5h12v17l-6-4-6 4z"/>', note: '<path d="M5 3.5h10l4 4v13H5z"/><path d="M15 3.5v4h4M8.5 12h7M8.5 16h5"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="15" r="1.1"/><circle cx="15" cy="9" r="1.1"/><circle cx="9" cy="15" r="1.1"/>',
    tune: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>', palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.8-1 1.2-2.1-.7-1.2.1-2.4 1.5-2.4H17a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9-8.5-9z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
    cloud: '<path d="M7 18.5h10.5a4 4 0 0 0 .4-8A6 6 0 0 0 6.3 9.6 4.5 4.5 0 0 0 7 18.5z"/>', download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>', eye: '<path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5.5 0 9 6 9 6a15.4 15.4 0 0 1-2.4 3.2M6.6 6.6C4.3 8.1 3 12 3 12s3.5 6 9 6a8.7 8.7 0 0 0 4.3-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    home: '<path d="M4 11l8-7 8 7v9a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20z"/>', up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', folder: '<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>'
  };
  function ico(k, cls) { return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[k] || IC.folder) + "</svg>"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function avail(id) { var e = E[id]; if (!e) return false; if (id === "x_install") return !!window.SGInstallEvt; return true; }
  function visible(id) { return avail(id) && P.hidden.indexOf(id) < 0; }

  /* ---------- Aufbau ---------- */
  var CSS = [
    ":root{--sgd-w:340px;--sgd-bar:64px}",
    ".sgd{position:fixed;inset:0;z-index:1500;display:none;flex-direction:column;background:var(--sgd-bg);color:var(--sgd-ink);font-family:'Inter SG',Inter,Roboto,system-ui,sans-serif;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}",
    "html.sgd-home .sgd{display:flex}html.sgd-home,html.sgd-home body{overflow:hidden!important}",
    ".sgd *{box-sizing:border-box}.sgd,.sgd-sheet{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}.sgd input,.sgd-sheet input{-webkit-user-select:text;user-select:text}.sgd button{font:inherit;color:inherit;cursor:pointer}",
    ".sgd-bar{flex:none;height:calc(var(--sgd-bar) + env(safe-area-inset-top,0px));padding:env(safe-area-inset-top,0px) 4px 0 4px;display:flex;align-items:center;gap:2px;background:var(--sgd-bg);transition:background .2s;position:relative;z-index:2}",
    ".sgd.scrolled .sgd-bar{background:var(--sgd-s1)}",
    ".sgd-bar h2{flex:1;min-width:0;margin:0 0 0 8px;font-size:21px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;transition:opacity .15s}",
    ".sgd.scrolled .sgd-bar h2,.sgd.sub .sgd-bar h2{opacity:1}",
    ".sgd-ib{width:48px;height:48px;border-radius:50%;border:0;background:none;display:flex;align-items:center;justify-content:center;flex:none;position:relative;overflow:hidden}",
    ".sgd-ib svg{width:24px;height:24px}",
    ".sgd-sc{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:0 16px calc(32px + env(safe-area-inset-bottom,0px))}",
    ".sgd-hero{padding:4px 4px 18px}.sgd-hero h1{margin:0;font-size:32px;line-height:1.15;font-weight:700;letter-spacing:-.02em}.sgd-hero p{margin:6px 0 0;color:var(--sgd-mut);font-size:15px}",
    ".sgd-srch{width:100%;height:56px;border:0;border-radius:28px;background:var(--sgd-s2);display:flex;align-items:center;gap:14px;padding:0 20px;color:var(--sgd-mut);font-size:16px;margin:0 0 20px;position:relative;overflow:hidden;text-align:left}",
    ".sgd-srch svg{width:22px;height:22px;flex:none}",
    ".sgd-now{background:var(--sgd-s1);border-radius:24px;padding:14px 6px 8px;margin:0 0 22px}",
    ".sgd-now h3{margin:0 14px 6px;font-size:13px;font-weight:600;color:var(--sgd-mut);display:flex;justify-content:space-between}",
    ".sgd-now .it{display:flex;align-items:center;gap:12px;width:100%;border:0;background:none;padding:9px 14px;border-radius:16px;text-align:left;position:relative;overflow:hidden}",
    ".sgd-now .tm{width:48px;flex:none;font-size:14px;font-weight:600;font-variant-numeric:tabular-nums}.sgd-now .dt{width:10px;height:10px;border-radius:50%;flex:none}",
    ".sgd-now .nm{flex:1;min-width:0;font-size:15.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sgd-now .ap{font-size:12px;color:var(--sgd-mut)}",
    ".sgd-now .sgd-nchips{display:flex;gap:8px;flex-wrap:wrap;padding:6px 14px 6px}",
    ".sgd-chip{flex:none;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:8px;border:1px solid var(--sgd-line);background:none;font-size:13.5px;font-weight:500;color:var(--sgd-ink);position:relative;overflow:hidden;white-space:nowrap}",
    ".sgd-chip i{width:8px;height:8px;border-radius:50%;flex:none}",
    ".sgd-h{display:flex;align-items:center;gap:8px;margin:0 4px 8px;min-height:32px}.sgd-h span{flex:1;font-size:14px;font-weight:600;color:var(--sgd-mut)}",
    ".sgd-h .dot{width:10px;height:10px;border-radius:50%;flex:none}.sgd-h b{font-size:16px;font-weight:650;color:var(--sgd-ink)}",
    ".sgd-tb{border:0;background:none;color:var(--sgd-acc);font-size:14px;font-weight:600;padding:6px 10px;border-radius:16px;position:relative;overflow:hidden}",
    ".sgd-favs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 22px}",
    ".sgd-fav{border:0;border-radius:20px;background:var(--sgd-s1);padding:12px 14px;min-height:84px;display:flex;flex-direction:column;align-items:flex-start;gap:8px;text-align:left;position:relative;overflow:hidden}",
    ".sgd-fav b{font-size:15.5px;font-weight:600;line-height:1.2}.sgd-fav small{font-size:12.5px;color:var(--sgd-mut);margin-top:-4px;display:flex;align-items:center;gap:5px}.sgd-fav small i{width:7px;height:7px;border-radius:50%}",
    ".sgd-rec{display:flex;gap:8px;overflow-x:auto;margin:0 -16px 22px;padding:0 16px;scrollbar-width:none}.sgd-rec::-webkit-scrollbar{display:none}",
    ".sgd-list{background:var(--sgd-s1);border-radius:24px;overflow:hidden;margin:0 0 24px;padding:6px 0}",
    ".sgd-row{display:flex;align-items:center;gap:16px;width:100%;min-height:64px;padding:8px 12px 8px 16px;border:0;background:none;text-align:left;position:relative;overflow:hidden}",
    ".sgd-row .tx{flex:1;min-width:0}.sgd-row .tx b{display:block;font-size:16px;font-weight:500;line-height:1.3}",
    ".sgd-row .tx small{display:block;font-size:13.5px;color:var(--sgd-mut);line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".sgd.nosub .sgd-row .tx small{display:none}.sgd.nosub .sgd-row{min-height:56px}",
    ".sgd-row .val{font-size:13px;color:var(--sgd-mut);font-variant-numeric:tabular-nums}.sgd-row .cnt{font-size:12px;font-weight:700;min-width:22px;height:22px;border-radius:11px;background:var(--sgd-s3);display:flex;align-items:center;justify-content:center;padding:0 6px}",
    ".sgd-row .ch{width:20px;height:20px;color:var(--sgd-faint);flex:none}",
    ".sgd-row.sel{background:var(--sgd-s2)}",
    ".sgd-ic{width:40px;height:40px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex:none;background:color-mix(in srgb,var(--c) 20%,transparent);color:var(--c)}",
    ".sgd-ic svg{width:22px;height:22px}",
    ".sgd-hid{width:100%;border:0;background:none;color:var(--sgd-mut);font-size:14px;padding:10px;display:flex;align-items:center;justify-content:center;gap:8px;position:relative;overflow:hidden;border-radius:16px}.sgd-hid svg{width:18px;height:18px}",
    ".sgd-in{flex:1;min-width:0;height:48px;border:0;background:none;outline:none;color:var(--sgd-ink);font:inherit;font-size:18px}",
    ".sgd-empty{color:var(--sgd-mut);text-align:center;padding:40px 12px}",
    /* Tabs: Start · Planer · Training · Bibel */
    ".sgd-hero.sm{padding:0 4px 10px}.sgd-hero.sm h1{font-size:25px}.sgd-hero.sm p{margin-top:3px;font-size:14px}",
    ".sgd-tabs{position:sticky;top:0;z-index:1;display:flex;gap:6px;margin:0 -16px 14px;padding:4px 16px 10px;background:var(--sgd-bg)}",
    ".sgd-tab{flex:1;min-width:0;height:40px;border:0;border-radius:20px;background:var(--sgd-s1);font-size:14px;font-weight:600;color:var(--sgd-mut);display:flex;align-items:center;justify-content:center;gap:6px;position:relative;overflow:hidden;padding:0 6px;white-space:nowrap}",
    ".sgd-tab i{width:7px;height:7px;border-radius:50%;flex:none;background:var(--c)}.sgd-tab.on{background:color-mix(in srgb,var(--c) 24%,var(--sgd-s1));color:var(--sgd-ink)}",
    "@media(max-width:380px){.sgd-tab i{display:none}.sgd-tab{font-size:13.5px}}",
    ".sgd-pane{animation:sgdin .16s ease-out}@keyframes sgdin{from{opacity:.4;transform:translateX(var(--sgd-dx,0))}}",
    /* Kacheln */
    ".sgd-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 18px}",
    "@media(min-width:620px) and (max-width:999px){.sgd-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}",
    ".sgd-tile{border:0;background:var(--sgd-s1);border-radius:18px;padding:10px 10px 10px 10px;display:flex;align-items:center;gap:10px;min-height:62px;text-align:left;position:relative;overflow:hidden;min-width:0}",
    ".sgd-tile .sgd-ic{width:36px;height:36px;border-radius:12px}.sgd-tile .sgd-ic svg{width:20px;height:20px}",
    ".sgd-tile .tx{flex:1;min-width:0}.sgd-tile b{display:block;font-size:14.5px;font-weight:600;line-height:1.22;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".sgd-tile small{display:block;font-size:12px;color:var(--sgd-mut);line-height:1.3;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sgd.nosub .sgd-tile small{display:none}",
    ".sgd-tile .cnt,.sgd-tile .val{position:absolute;top:6px;right:8px;font-size:11px;font-weight:700;color:var(--sgd-mut)}.sgd-tile .cnt{min-width:18px;height:18px;border-radius:9px;background:var(--sgd-acc);color:var(--sgd-accfg);display:flex;align-items:center;justify-content:center;padding:0 5px}",
    ".sgd-tile.wide{grid-column:1/-1}",
    ".sgd-tile .tx+.cnt,.sgd-tile .tx+.val{position:static;flex:none}.sgd-tile .val{display:none}",
    /* Unterseiten einer Gruppe: dichte Knöpfe mit Symbol – alles auf einen Blick */
    ".sgd-pills{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 16px}",".sgd-pane .sgd-h{min-height:26px;margin-bottom:7px}",
    ".sgd-pill{height:42px;border:0;border-radius:21px;background:var(--sgd-s1);display:inline-flex;align-items:center;gap:8px;padding:0 14px 0 5px;font-size:14px;font-weight:550;position:relative;overflow:hidden;max-width:100%;white-space:nowrap}",
    ".sgd-pill .sgd-ic{width:32px;height:32px;border-radius:50%}.sgd-pill .sgd-ic svg{width:18px;height:18px}.sgd-pill span.t{overflow:hidden;text-overflow:ellipsis}",
    ".sgd-pill .cnt{font-size:11px;font-weight:700;min-width:18px;height:18px;border-radius:9px;background:var(--sgd-acc);color:var(--sgd-accfg);display:flex;align-items:center;justify-content:center;padding:0 5px;margin-right:-6px}",
    /* Notizen */
    ".sgd-notes{background:var(--sgd-s1);border-radius:24px;padding:12px 8px 8px;margin:0 0 20px}",
    ".sgd-notes h3{margin:0 8px 8px 10px;font-size:13px;font-weight:600;color:var(--sgd-mut);display:flex;align-items:center;justify-content:space-between;min-height:28px}",
    ".sgd-nadd{display:flex;align-items:center;gap:6px;margin:0 2px 4px;background:var(--sgd-bg);border-radius:16px;padding:4px 4px 4px 14px}",
    ".sgd-nadd input{flex:1;min-width:0;height:44px;border:0;background:none;outline:none;color:var(--sgd-ink);font:inherit;font-size:16px}",
    ".sgd-nadd button{height:40px;min-width:40px;border:0;border-radius:12px;background:none;display:flex;align-items:center;justify-content:center;gap:4px;position:relative;overflow:hidden;color:var(--sgd-mut);font-size:12.5px;font-weight:600;padding:0 8px}",
    ".sgd-nadd button svg{width:21px;height:21px;flex:none}.sgd-nadd button.set{background:color-mix(in srgb,#e0b34e 22%,transparent);color:var(--sgd-ink)}",
    ".sgd-nadd button.go{background:var(--sgd-acc);color:var(--sgd-accfg)}",
    ".sgd-nt{display:flex;align-items:flex-start;gap:10px;width:100%;border:0;background:none;text-align:left;padding:9px 8px 9px 6px;border-radius:14px;position:relative;overflow:hidden}",
    ".sgd-nt .ck{width:26px;height:26px;border-radius:50%;border:2px solid var(--sgd-faint);background:none;flex:none;display:flex;align-items:center;justify-content:center;padding:0;margin-top:-1px}",
    ".sgd-nt .ck svg{width:16px;height:16px;opacity:0}.sgd-nt.done .ck{background:var(--sgd-acc);border-color:var(--sgd-acc);color:var(--sgd-accfg)}.sgd-nt.done .ck svg{opacity:1}",
    ".sgd-nt .tx{flex:1;min-width:0;font-size:15px;line-height:1.35;white-space:pre-wrap;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}",
    ".sgd-nt.done .tx{color:var(--sgd-mut);text-decoration:line-through}",
    ".sgd-nt .wh{flex:none;font-size:12px;font-weight:600;color:var(--sgd-mut);display:flex;align-items:center;gap:3px;margin-top:2px;font-variant-numeric:tabular-nums}.sgd-nt .wh svg{width:13px;height:13px}",
    ".sgd-nt .wh.over{color:#ff6b6b}",
    ".sgd-seg{display:flex;gap:6px;margin:0 0 12px}.sgd-seg button{height:34px;padding:0 14px;border-radius:17px;border:1px solid var(--sgd-line);background:none;font-size:13.5px;font-weight:600;color:var(--sgd-mut)}.sgd-seg button.on{background:var(--sgd-s2);color:var(--sgd-ink);border-color:transparent}",
    ".sgd-sheet textarea{width:100%;min-height:110px;border-radius:12px;border:1px solid var(--sgd-line);background:var(--sgd-bg);color:var(--sgd-ink);padding:12px 14px;font:inherit;font-size:16px;outline:none;resize:vertical;-webkit-user-select:text;user-select:text}",
    ".sgd-sheet input[type=datetime-local]{width:100%;height:52px;border-radius:12px;border:1px solid var(--sgd-line);background:var(--sgd-bg);color:var(--sgd-ink);padding:0 14px;font:inherit;font-size:16px;outline:none;color-scheme:dark}",
    ".sgd-qt{display:flex;flex-wrap:wrap;gap:8px;margin:0 16px 12px}.sgd-qt .sgd-chip.on{background:var(--sgd-acc);color:var(--sgd-accfg);border-color:var(--sgd-acc)}",
    ".sgd-acts{display:flex;gap:8px;flex-wrap:wrap;margin:14px 16px 4px}.sgd-acts button{flex:1;min-width:110px;height:46px;border-radius:23px;border:1px solid var(--sgd-line);background:none;font:inherit;font-size:14.5px;font-weight:600;color:var(--sgd-ink)}",
    ".sgd-acts button.p{background:var(--sgd-acc);color:var(--sgd-accfg);border-color:var(--sgd-acc)}.sgd-acts button.d{color:#ff6b6b}",
    ".sgd-ver{display:flex;align-items:center;justify-content:center;gap:6px;color:var(--sgd-faint);font-size:12.5px;margin:4px 0 8px}.sgd-ver button{border:0;background:none;color:var(--sgd-acc);font:inherit;font-weight:600;padding:8px;border-radius:12px;position:relative;overflow:hidden}",
    /* Wellen-Effekt */
    ".sgd-rip{position:absolute;border-radius:50%;background:currentColor;opacity:.14;transform:scale(0);animation:sgdrip .5s ease-out forwards;pointer-events:none}@keyframes sgdrip{to{transform:scale(1);opacity:0}}",
    /* Blatt von unten */
    ".sgd-sheet{position:fixed;inset:0;z-index:1600;display:none;background:rgba(0,0,0,.45);font-family:'Inter SG',Inter,Roboto,system-ui,sans-serif;color:var(--sgd-ink)}",
    ".sgd-sheet.on{display:flex;align-items:flex-end;justify-content:center;animation:sgdfade .15s}@keyframes sgdfade{from{opacity:0}}",
    ".sgd-sheet .pn{width:100%;max-width:640px;max-height:88vh;overflow-y:auto;background:var(--sgd-s1);border-radius:28px 28px 0 0;padding:8px 8px calc(20px + env(safe-area-inset-bottom,0px));animation:sgdup .22s cubic-bezier(.2,.8,.2,1)}@keyframes sgdup{from{transform:translateY(40%)}}",
    ".sgd-sheet .hd{width:32px;height:4px;border-radius:2px;background:var(--sgd-faint);margin:6px auto 10px;opacity:.6}",
    ".sgd-sheet h3{margin:4px 16px 4px;font-size:20px;font-weight:600}.sgd-sheet p.s{margin:0 16px 12px;color:var(--sgd-mut);font-size:14px}",
    ".sgd-sheet .sgd-row{min-height:56px;border-radius:16px}.sgd-sheet .sgd-row .ic2{width:24px;height:24px;color:var(--sgd-mut);flex:none}",
    ".sgd-sheet label.f{display:block;margin:8px 16px 14px}.sgd-sheet label.f span{display:block;font-size:12.5px;color:var(--sgd-mut);margin:0 0 6px}",
    ".sgd-sheet input[type=text],.sgd-sheet select{width:100%;height:52px;border-radius:12px;border:1px solid var(--sgd-line);background:var(--sgd-bg);color:var(--sgd-ink);padding:0 14px;font:inherit;font-size:16px;outline:none}",
    ".sgd-sheet .sec{margin:16px 16px 6px;font-size:13px;font-weight:600;color:var(--sgd-acc)}",
    ".sgd-sw{width:52px;height:32px;border-radius:16px;background:var(--sgd-s3);position:relative;flex:none;transition:background .15s;border:2px solid var(--sgd-faint)}",
    ".sgd-sw::after{content:'';position:absolute;left:6px;top:6px;width:16px;height:16px;border-radius:50%;background:var(--sgd-faint);transition:all .15s}",
    ".sgd-sw.on{background:var(--sgd-acc);border-color:var(--sgd-acc)}.sgd-sw.on::after{left:22px;top:2px;width:24px;height:24px;background:var(--sgd-accfg)}",
    ".sgd-mini{display:flex;gap:2px}.sgd-mini button{width:40px;height:40px;border-radius:50%;border:0;background:none;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}.sgd-mini svg{width:20px;height:20px}",
    /* Snackbar */
    ".sgd-snack{position:fixed;left:16px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));max-width:560px;margin:0 auto;z-index:1700;background:var(--sgd-ink);color:var(--sgd-bg);border-radius:8px;min-height:48px;display:flex;align-items:center;gap:8px;padding:6px 8px 6px 16px;font-family:'Inter SG',Inter,Roboto,system-ui,sans-serif;font-size:14.5px;box-shadow:0 4px 18px rgba(0,0,0,.35);transform:translateY(140%);transition:transform .2s}",
    ".sgd-snack.on{transform:none}.sgd-snack span{flex:1}.sgd-snack button{border:0;background:none;color:var(--sgd-acc2);font:inherit;font-weight:700;padding:8px 10px;border-radius:6px}",
    /* Zurück-Knopf in den Seiten der Apps */
    ".sgd-back{width:44px;height:44px;margin:-6px 4px -6px -8px;border-radius:50%;border:0;background:none;color:inherit;display:inline-flex;align-items:center;justify-content:center;flex:none;cursor:pointer;position:relative;overflow:hidden;vertical-align:middle;-webkit-tap-highlight-color:transparent}",
    ".sgd-back svg{width:24px;height:24px}",
    /* Tablet quer und Laptop: Übersicht links, Seite rechts */
    "@media(min-width:1000px){html.sg-dir .sgd{display:flex!important;right:auto;width:var(--sgd-w);border-right:1px solid var(--sgd-line)}html.sg-dir body{padding-left:var(--sgd-w)!important}html.sgd-home,html.sgd-home body{overflow:auto!important}.sgd-back{display:none!important}.sgd .sgd-hero h1{font-size:26px}.sgd-favs{grid-template-columns:repeat(2,minmax(0,1fr))}.sgd-fav{min-height:84px}.sgd-grid{grid-template-columns:1fr;gap:6px}.sgd-tile{min-height:52px;padding:7px 10px}.sgd-tab{font-size:13px;padding:0 4px;gap:4px}.sgd-tabs{gap:4px}}"
  ].join("");
  // App-spezifisch: bisherige Leisten ausblenden, Platz für die Seite
  var APPCSS = {
    // Befehlsmenü und Bearbeiten-Blatt des Planers liegen über der Übersicht (aus der Suche aufrufbar)
    planer: "html.sg-dir .pal{z-index:1800!important}html.sg-dir .scrim{z-index:1790!important}html.sg-dir .panel{z-index:1795!important}html.sg-dir #tabbar,html.sg-dir .side,html.sg-dir .bar .menu-btn,html.sg-dir .bar .back{display:none!important}html.sg-dir .fab{bottom:calc(20px + env(safe-area-inset-bottom,0px))!important}",
    training: "html.sg-dir .nav{display:none!important}html.sg-dir .shell{padding-bottom:calc(28px + env(safe-area-inset-bottom,0px))!important}html.sg-dir #s-heute>.brand{display:none!important}" +
      "html.sg-dir .tsmod{inset:0!important}html.sg-dir .tsmod [data-ts=close]{display:none!important}html.sg-dir .tsmod header{padding-left:10px!important}" +
      "html.sg-dir .screen>.top{align-items:center}html.sg-dir .screen>.top>div:first-of-type{flex:1;min-width:0}" +
      "@media(min-width:1000px){html.sg-dir .tsmod{left:var(--sgd-w)!important}}",
    bibel: "html.sg-dir .tabbar{display:none!important}html.sg-dir .app>header{display:grid;grid-template-columns:auto 1fr;column-gap:4px;align-items:center}html.sg-dir .app>header>.sgd-back{grid-row:span 2}" +
      "html.sg-dir .app{padding-bottom:calc(28px + env(safe-area-inset-bottom,0px))!important}@media(min-width:1000px){html.sg-dir #passageOverlay{left:var(--sgd-w)!important}}"
  };
  var root, bar, sc, sheetEl, snack, view = { kind: "home" }, cur = null, busy = 0;
  function colors() {
    var t = (window.SGTheme && window.SGTheme.current && window.SGTheme.current()) || { bg: "#131313", s1: "#202020", s2: "#272727", s3: "#2f2f2f", line: "#2c2c2c", ink: "#ebebea", muted: "#9b9a97", faint: "#6b6a67", acc: "#529cca" };
    var s = document.documentElement.style;
    [["bg", t.bg], ["s1", t.s1], ["s2", t.s2], ["s3", t.s3], ["line", t.line], ["ink", t.ink], ["mut", t.muted], ["faint", t.faint], ["acc", t.acc], ["accfg", "#10151c"], ["acc2", t.acc]].forEach(function (p) { s.setProperty("--sgd-" + p[0], p[1]); });
  }
  function mount() {
    var st = document.createElement("style"); st.id = "sgd-css"; st.textContent = CSS + (APPCSS[APP] || ""); document.head.appendChild(st);
    root = document.createElement("div"); root.className = "sgd"; root.setAttribute("aria-label", "Übersicht");
    root.innerHTML = '<div class="sgd-bar"></div><div class="sgd-sc"></div>';
    document.body.appendChild(root); bar = root.firstChild; sc = root.lastChild;
    sheetEl = document.createElement("div"); sheetEl.className = "sgd-sheet"; sheetEl.innerHTML = '<div class="pn"></div>'; document.body.appendChild(sheetEl);
    snack = document.createElement("div"); snack.className = "sgd-snack"; document.body.appendChild(snack);
    colors(); addEventListener("sg-theme", colors);
    sc.addEventListener("scroll", function () { root.classList.toggle("scrolled", sc.scrollTop > 40); }, { passive: true });
    root.addEventListener("click", onClick); sheetEl.addEventListener("click", onSheetClick);
    root.addEventListener("input", function (e) { if (e.target.matches("[data-nin]")) draft.text = e.target.value; });
    root.addEventListener("submit", function (e) { var f = e.target.closest("[data-nform]"); if (!f) return; e.preventDefault(); saveDraft(f.querySelector("[data-nin]")); });
    // Wischen nach links/rechts wechselt den Tab
    var sx = 0, sy = 0, st = 0;
    sc.addEventListener("touchstart", function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
    sc.addEventListener("touchend", function (e) {
      if (view.kind !== "home" || e.target.closest(".sgd-rec,input")) return;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 70 && Math.abs(dy) < 45 && Date.now() - st < 600) { var i = TABS.indexOf(P.tab) + (dx < 0 ? 1 : -1); if (i >= 0 && i < TABS.length) setTab(TABS[i], dx < 0 ? 1 : -1); }
    }, { passive: true });
    document.addEventListener("click", function (e) { var b = e.target.closest("[data-sgback]"); if (b) { e.preventDefault(); e.stopPropagation(); back(); } }, true);
    bindPress(root);
    document.addEventListener("pointerdown", ripple, true);
  }
  // Material-Welle beim Antippen
  function ripple(e) {
    var el = e.target.closest && e.target.closest(".sgd-row,.sgd-fav,.sgd-chip,.sgd-ib,.sgd-srch,.sgd-tb,.sgd-hid,.sgd-back,.sgd-now .it,.sgd-mini button,.sgd-tab,.sgd-tile,.sgd-pill,.sgd-nt,.sgd-nadd button,.sgd-ver button"); if (!el) return;
    var r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = document.createElement("span");
    s.className = "sgd-rip"; s.style.width = s.style.height = d + "px"; s.style.left = (e.clientX - r.left - d / 2) + "px"; s.style.top = (e.clientY - r.top - d / 2) + "px";
    el.appendChild(s); setTimeout(function () { s.remove(); }, 520);
  }
  // Langes Drücken auf einen Eintrag → Optionen (mit kurzem Vibrieren wie unter Android üblich)
  var swallow = 0;
  // der Tipp, der auf ein langes Drücken folgt (Finger heben), darf nichts auslösen
  document.addEventListener("click", function (e) { if (swallow && Date.now() < swallow) { e.stopPropagation(); e.preventDefault(); swallow = 0; } }, true);
  function bindPress(host) {
    var t = null, sx = 0, sy = 0, fired = false;
    host.addEventListener("pointerdown", function (e) {
      fired = false; clearTimeout(t);
      var el = e.target.closest("[data-id]"); if (!el) return; sx = e.clientX; sy = e.clientY;
      t = setTimeout(function () { fired = true; try { navigator.vibrate && navigator.vibrate(12); } catch (x) {} optionsSheet(el.dataset.id); }, 480);
    });
    host.addEventListener("pointerup", function () { clearTimeout(t); if (fired) { swallow = Date.now() + 600; fired = false; } });
    ["pointercancel", "pointerleave"].forEach(function (n) { host.addEventListener(n, function () { clearTimeout(t); }); });
    host.addEventListener("pointermove", function (e) { if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 10) clearTimeout(t); });
    host.addEventListener("contextmenu", function (e) { if (e.target.closest("[data-id]")) e.preventDefault(); });
  }

  /* ---------- Darstellung ---------- */
  function homeOn() { return document.documentElement.classList.contains("sgd-home") || twoPane(); }
  function twoPane() { return innerWidth >= 1000; }
  function icon(e) { return '<span class="sgd-ic" style="--c:' + e.c + '">' + ico(e.ic) + "</span>"; }
  function liveVal(id) {
    try {
      var C = window.SharedCalendar, t = isoDay(new Date());
      if (id === "p_auf" && C && C.tasks) { var n = C.tasks.list().filter(function (q) { return !q.done && q.due && q.due <= t; }).length; return n ? '<span class="cnt">' + n + "</span>" : ""; }
      if ((id === "p_kal" || id === "t_kal") && C && C.allItems) { var m = C.allItems(t, t).length; return m ? '<span class="val">' + m + " heute</span>" : ""; }
      if (id === "t_sw_karten" || id === "t_sw_quiz" || id === "t_sw_lesen") { var w = JSON.parse(localStorage.getItem("sg-wissen-v1") || "null"), m = w && w.sum;
        if (m) { var v = id === "t_sw_karten" ? m.due : id === "t_sw_quiz" ? m.wrong : 0; if (v) return '<span class="cnt">' + v + "</span>"; if (id === "t_sw_lesen" && m.pct) return '<span class="val">' + m.pct + " %</span>"; } }
      if (id === "b_heute") { var b = bibleState(); if (b && b.streak) return '<span class="val">' + b.streak + (b.streak === 1 ? " Tag" : " Tage") + "</span>"; }
    } catch (x) {}
    return "";
  }
  function row(id, opts) {
    var e = E[id], cross = e.a !== APP && e.a !== "*";
    var sub = e.s + (cross && !(opts && opts.inApp) ? " · " + APPS[e.a].name : "");
    return '<button class="sgd-row' + (cur === id && twoPane() ? " sel" : "") + '" data-id="' + id + '">' + icon(e) + '<span class="tx"><b>' + esc(e.t) + "</b><small>" + esc(sub) + "</small></span>" +
      liveVal(id) + (e.k ? '<span class="val">' + e.k.filter(visible).length + "</span>" : "") + ico("chev", "ch") + "</button>";
  }
  function greet() {
    var h = new Date().getHours(), g = h < 5 ? "Gute Nacht" : h < 11 ? "Guten Morgen" : h < 17 ? "Hallo" : h < 22 ? "Guten Abend" : "Gute Nacht";
    return g + (P.name ? ", " + esc(P.name) : "");
  }
  var WD = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"], MO = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  function isoDay(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function bibleState() { try { return JSON.parse(localStorage.getItem("zweiminutenbibel_v2") || "null"); } catch (e) { return null; } }
  // „Jetzt“: die nächsten Termine aus allen Apps, fällige Aufgaben, Bibel-Serie
  function nowCard() {
    if (!P.now) return "";
    var C = window.SharedCalendar, d = new Date(), t = isoDay(d), mins = d.getHours() * 60 + d.getMinutes(), items = [], chips = [];
    try {
      if (C && C.allItems) items = C.allItems(t, t).filter(function (e) { if (!e.time) return true; var p = e.time.split(":"), end = e.end ? e.end.split(":") : p; return (+end[0] * 60 + +end[1]) >= mins - 5; })
        .sort(function (a, b) { return (a.time || "00:00") < (b.time || "00:00") ? -1 : 1; });
      if (C && C.tasks) { var n = C.tasks.list().filter(function (q) { return !q.done && q.due && q.due <= t; }).length; if (n) chips.push(['p_auf', n + (n === 1 ? " Aufgabe fällig" : " Aufgaben fällig"), "#6aa6ff"]); }
    } catch (x) {}
    var b = bibleState();
    if (b) chips.push(["b_lesen", b.todayDone === t ? "Bibel heute gelesen ✓" : b.streak ? "Bibel lesen · Serie " + b.streak : "Bibel lesen", "#d9a86c"]);
    var col = function (e) { var s = (C && C.sources || []).find(function (x) { return x[0] === e.app; }); return e.color || (s && s[1]) || "#8e8e93"; };
    var calId = APP === "training" ? "t_kal" : "p_kal";
    var h = '<div class="sgd-now"><h3><span>Jetzt</span><span>' + (items.length ? items.length + " heute noch" : "") + "</span></h3>";
    if (items.length) h += items.slice(0, 3).map(function (e) { return '<button class="it" data-id="' + calId + '"><span class="tm">' + esc(e.time || "ganzt.") + '</span><span class="dt" style="background:' + col(e) + '"></span><span class="nm">' + esc(e.title) + '</span><span class="ap">' + esc(e.app || "") + "</span></button>"; }).join("");
    else if (C) h += '<button class="it" data-id="' + calId + '"><span class="nm" style="color:var(--sgd-mut)">Heute steht nichts mehr an.</span></button>';
    if (chips.length) h += '<div class="sgd-nchips">' + chips.map(function (c) { return '<button class="sgd-chip" data-id="' + c[0] + '"><i style="background:' + c[2] + '"></i>' + esc(c[1]) + "</button>"; }).join("") + "</div>";
    return h + "</div>";
  }
  function setBar(left, title, right) { bar.innerHTML = left + "<h2>" + esc(title) + "</h2>" + right; }
  function tile(id) {
    var e = E[id];
    return '<button class="sgd-tile" data-id="' + id + '">' + icon(e) + '<span class="tx"><b>' + esc(e.t) + "</b><small>" + esc(e.s) + "</small></span>" + liveVal(id) + "</button>";
  }
  function pill(id) {
    var e = E[id], v = liveVal(id);
    return '<button class="sgd-pill" data-id="' + id + '">' + icon(e) + '<span class="t">' + esc(e.t) + "</span>" + (/cnt/.test(v) ? v : "") + "</button>";
  }
  function tabsHTML() {
    var lab = { start: ["Start", "#8e8e93"], planer: ["Planer", APPS.planer.color], training: ["Training", APPS.training.color], bibel: ["Bibel", APPS.bibel.color] };
    return '<div class="sgd-tabs" role="tablist">' + TABS.map(function (t) {
      return '<button class="sgd-tab' + (P.tab === t ? " on" : "") + '" role="tab" aria-selected="' + (P.tab === t) + '" data-sgtab="' + t + '" style="--c:' + lab[t][1] + '"><i></i>' + lab[t][0] + "</button>";
    }).join("") + "</div>";
  }
  // Start: was jetzt wichtig ist – Termine, Notizen, Favoriten, Zuletzt
  function startPane() {
    var h = nowCard() + notesCard();
    var favs = P.fav.filter(visible);
    h += '<div class="sgd-h"><span>Favoriten</span><button class="sgd-tb" data-act="favedit">Bearbeiten</button></div>';
    h += favs.length ? '<div class="sgd-grid">' + favs.map(function (id) { var e = E[id]; return '<button class="sgd-tile" data-id="' + id + '">' + icon(e) + "<span class=\"tx\"><b>" + esc(e.t) + "</b><small>" + (APPS[e.a] ? APPS[e.a].name : "Alle Apps") + "</small></span>" + liveVal(id) + "</button>"; }).join("") + "</div>"
      : '<p style="margin:-2px 4px 20px;color:var(--sgd-mut);font-size:14px">Halte einen Eintrag gedrückt und wähle „Zu Favoriten“.</p>';
    var rec = P.recent.filter(function (id) { return visible(id) && favs.indexOf(id) < 0; }).slice(0, 6);
    if (rec.length) h += '<div class="sgd-h"><span>Zuletzt geöffnet</span></div><div class="sgd-rec">' + rec.map(function (id) { return '<button class="sgd-chip" data-id="' + id + '"><i style="background:' + E[id].c + '"></i>' + esc(E[id].t) + "</button>"; }).join("") + "</div>";
    h += '<div class="sgd-h"><span>Einstellungen</span></div><div class="sgd-pills">' + ["x_dir", "x_design", "x_cloud", "x_ver"].filter(visible).map(pill).join("") + "</div>";
    return h;
  }
  // Ein App-Tab: Hauptbereiche als Kacheln, jeder Ordner als eigene Gruppe mit seinen Seiten – alles auf einen Blick
  function appPane(a) {
    var ids = ROOT[a].filter(visible), flat = ids.filter(function (id) { return !E[id].k; }), h = "";
    if (flat.length) h += '<div class="sgd-grid">' + flat.map(tile).join("") + "</div>";
    ids.filter(function (id) { return E[id].k; }).forEach(function (id) {
      var kids = E[id].k.filter(visible); if (!kids.length) return;
      h += '<div class="sgd-h" data-sec="' + id + '"><i class="dot" style="background:' + E[id].c + '"></i><b>' + esc(E[id].t) + "</b><span></span></div>";
      h += '<div class="sgd-pills">' + kids.map(pill).join("") + "</div>";
    });
    var set = a === "training" ? "t_einst" : a === "bibel" ? "b_set" : null;
    if (set && visible(set)) h += '<div class="sgd-h"><i class="dot" style="background:#8e8e93"></i><b>Einstellungen</b><span></span></div><div class="sgd-pills">' + pill(set) + "</div>";
    return h;
  }
  function renderHome() {
    root.classList.remove("sub"); root.classList.toggle("nosub", !P.subs);
    setBar('<button class="sgd-ib" data-act="apps" aria-label="Apps">' + ico("home") + "</button>", "Übersicht",
      '<button class="sgd-ib" data-act="search" aria-label="Suchen">' + ico("search") + '</button><button class="sgd-ib" data-act="menu" aria-label="Mehr">' + ico("more") + "</button>");
    var d = new Date(), h = '<div class="sgd-hero sm"><h1>' + greet() + "</h1><p>" + WD[d.getDay()] + ", " + d.getDate() + ". " + MO[d.getMonth()] + "</p></div>";
    h += tabsHTML() + '<div class="sgd-pane">' + (P.tab === "start" ? startPane() : appPane(P.tab));
    if (P.hidden.length) h += '<button class="sgd-hid" data-act="hidden">' + ico("eye") + P.hidden.length + " ausgeblendet – anzeigen</button>";
    h += '<div class="sgd-ver">Version ' + esc(window.SGVersion || "") + '<button data-act="update">Aktualisieren</button></div></div>';
    sc.innerHTML = h;
  }
  function setTab(t, dir) {
    if (TABS.indexOf(t) < 0 || t === P.tab) return;
    P.tab = t; saveP();
    sc.style.setProperty("--sgd-dx", (dir || 0) * 24 + "px");
    var y = sc.querySelector(".sgd-tabs"), top = y ? y.offsetTop : 0;
    renderHome(); if (sc.scrollTop > top) sc.scrollTop = top;
  }

  /* ---------- Notizen ---------- */
  function NT() { return window.SharedCalendar && window.SharedCalendar.notes; }
  var draft = { text: "", at: "", remind: true }, nfilter = "open";
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function atStr(d) { return isoDay(d) + "T" + pad2(d.getHours()) + ":" + pad2(d.getMinutes()); }
  function fmtAt(at) {
    if (!at) return "";
    var d = new Date(at), t = new Date(), m = new Date(); m.setDate(t.getDate() + 1);
    var hm = d.getHours() + ":" + pad2(d.getMinutes());
    if (isoDay(d) === isoDay(t)) return "Heute " + hm;
    if (isoDay(d) === isoDay(m)) return "Morgen " + hm;
    return ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + ". " + hm;
  }
  function quickTimes() {
    var n = new Date(), out = [], h1 = new Date(n.getTime() + 60 * 60000);
    h1.setMinutes(Math.ceil(h1.getMinutes() / 5) * 5, 0, 0); out.push(["In 1 Std.", atStr(h1)]);
    if (n.getHours() < 17) { var e = new Date(n); e.setHours(18, 0, 0, 0); out.push(["Heute 18:00", atStr(e)]); }
    var m = new Date(n); m.setDate(n.getDate() + 1); m.setHours(8, 0, 0, 0); out.push(["Morgen 8:00", atStr(m)]);
    var w = new Date(n); w.setDate(n.getDate() + ((6 - n.getDay() + 7) % 7 || 7)); w.setHours(10, 0, 0, 0); out.push([fmtAt(atStr(w)), atStr(w)]);
    return out;
  }
  function noteRow(n) {
    var over = n.at && !n.done && new Date(n.at).getTime() < Date.now();
    return '<div class="sgd-nt' + (n.done ? " done" : "") + '" data-sgnote="' + n.id + '" role="button" tabindex="0"><button class="ck" data-sgnck="' + n.id + '" aria-label="' + (n.done ? "Wieder offen" : "Erledigt") + '">' + ico("ok") + "</button>" +
      '<span class="tx">' + esc(n.text) + "</span>" + (n.at ? '<span class="wh' + (over ? " over" : "") + '">' + (n.remind ? ico("bell") : ico("clock")) + esc(fmtAt(n.at)) + "</span>" : "") + "</div>";
  }
  function composer() {
    return '<form class="sgd-nadd" data-nform><input data-nin value="' + esc(draft.text) + '" placeholder="Neue Notiz …" enterkeyhint="done" autocomplete="off" aria-label="Neue Notiz">' +
      '<button type="button" data-act="ntime" class="' + (draft.at ? "set" : "") + '" aria-label="Zeitpunkt und Erinnerung">' + ico(draft.at && draft.remind ? "bell" : "clock") + (draft.at ? esc(fmtAt(draft.at)) : "") + "</button>" +
      '<button type="submit" class="go" aria-label="Notiz speichern">' + ico("plus") + "</button></form>";
  }
  function notesCard() {
    var N = NT(); if (!N) return "";
    var all = N.list(), open = all.filter(function (n) { return !n.done; });
    return '<div class="sgd-notes"><h3><span>Notizen</span><button class="sgd-tb" data-act="notes">' + (all.length ? "Alle (" + open.length + ")" : "Öffnen") + "</button></h3>" + composer() +
      open.slice(0, 4).map(noteRow).join("") + (open.length > 4 ? '<button class="sgd-hid" data-act="notes">+ ' + (open.length - 4) + " weitere</button>" : "") + "</div>";
  }
  function renderNotes() {
    root.classList.add("sub");
    setBar('<button class="sgd-ib" data-act="back" aria-label="Zurück">' + ico("back") + "</button>", "Notizen", "");
    var N = NT(), all = N ? N.list() : [], list = all.filter(function (n) { return nfilter === "done" ? n.done : nfilter === "time" ? n.at && !n.done : !n.done; });
    var cnt = function (f) { return all.filter(function (n) { return f === "done" ? n.done : f === "time" ? n.at && !n.done : !n.done; }).length; };
    sc.innerHTML = '<div class="sgd-hero" style="padding-top:2px"><h1>Notizen</h1><p>Schnell festhalten – Zeitpunkt und Erinnerung nur, wenn du willst.</p></div>' +
      '<div class="sgd-notes">' + composer() + "</div>" +
      '<div class="sgd-seg">' + [["open", "Offen"], ["time", "Mit Zeit"], ["done", "Erledigt"]].map(function (f) { return '<button data-sgnf="' + f[0] + '" class="' + (nfilter === f[0] ? "on" : "") + '">' + f[1] + " " + cnt(f[0]) + "</button>"; }).join("") + "</div>" +
      (list.length ? '<div class="sgd-notes">' + list.map(noteRow).join("") + "</div>" : '<p class="sgd-empty">' + (nfilter === "done" ? "Noch nichts erledigt." : "Keine Notizen – oben einfach lostippen.") + "</p>");
  }
  function saveDraft(inp) {
    var N = NT(), t = (inp.value || "").trim(); if (!N || !t) { inp.focus(); return; }
    N.add({ text: t, at: draft.at, remind: draft.at && draft.remind });
    if (draft.at && draft.remind) askNotify();
    toast(draft.at ? "Notiz gespeichert · " + fmtAt(draft.at) : "Notiz gespeichert");
    draft = { text: "", at: "", remind: true }; inp.value = "";
    renderDir(); var ni = sc.querySelector("[data-nin]"); if (ni && view.kind === "notes") ni.focus();
  }
  function askNotify() {
    var C = window.SharedCalendar; if (!C || !C.askNotify) return;
    C.askNotify().then(function (ok) { if (!ok) toast("Benachrichtigungen sind aus – fällige Notizen erscheinen rot in der Übersicht."); });
  }
  // Zeitpunkt wählen: für die neue Notiz (id leer) oder eine bestehende
  function timeHTML(at, remind) {
    return '<div class="sgd-qt">' + '<button class="sgd-chip' + (!at ? " on" : "") + '" data-sact="nat:">Ohne Zeit</button>' +
      quickTimes().map(function (q) { return '<button class="sgd-chip' + (at === q[1] ? " on" : "") + '" data-sact="nat:' + q[1] + '">' + q[0] + "</button>"; }).join("") + "</div>" +
      '<label class="f"><span>Eigener Zeitpunkt</span><input type="datetime-local" data-nat value="' + esc(at) + '"></label>' +
      sRow("nrem", "bell", "Erinnern", at ? "Benachrichtigung zum Zeitpunkt" : "Erst einen Zeitpunkt wählen", '<span class="sgd-sw' + (at && remind ? " on" : "") + '"></span>');
  }
  var edit = null; // { id, text, at, remind } – das gerade bearbeitete Blatt
  function timeSheet() {
    edit = { id: "", at: draft.at, remind: draft.remind };
    sheet('<h3>Zeitpunkt</h3><p class="s">Optional – ohne Zeit bleibt es eine einfache Notiz.</p>' + timeHTML(edit.at, edit.remind) +
      '<div class="sgd-acts"><button class="p" data-sact="ndone">Übernehmen</button></div>');
    bindNat();
  }
  function noteSheet(id) {
    var N = NT(), n = N && N.list().find(function (x) { return x.id === id; }); if (!n) return;
    edit = { id: id, text: n.text, at: n.at || "", remind: !!n.remind, done: n.done };
    sheet('<h3>Notiz</h3><label class="f"><textarea data-ntext aria-label="Text">' + esc(n.text) + "</textarea></label>" +
      '<div class="sec">Zeitpunkt</div>' + timeHTML(edit.at, edit.remind) +
      '<div class="sgd-acts"><button class="d" data-sact="ndel">Löschen</button><button data-sact="ntog">' + (n.done ? "Wieder offen" : "Erledigt") + '</button><button class="p" data-sact="nsave">Fertig</button></div>');
    bindNat();
  }
  function bindNat() {
    var i = sheetEl.querySelector("[data-nat]"); if (!i) return;
    i.addEventListener("change", function () { edit.at = i.value || ""; refreshTime(); });
  }
  function refreshTime() {
    var q = sheetEl.querySelector(".sgd-qt"), lab = sheetEl.querySelector("label.f:has([data-nat])") || (sheetEl.querySelector("[data-nat]") || {}).parentNode, r = sheetEl.querySelector('[data-sact="nrem"]');
    var tmp = document.createElement("div"); tmp.innerHTML = timeHTML(edit.at, edit.remind);
    if (q) q.replaceWith(tmp.children[0]); if (lab) lab.replaceWith(tmp.children[0]); if (r) r.replaceWith(tmp.children[0]);
    bindNat();
  }
  function noteAct(a, val) {
    var N = NT(); if (!N || !edit) return false;
    if (a === "nat") { edit.at = val; refreshTime(); return true; }
    if (a === "nrem") { if (!edit.at) { toast("Erst einen Zeitpunkt wählen"); return true; } edit.remind = !edit.remind; refreshTime(); return true; }
    if (a === "ndone") { draft.at = edit.at; draft.remind = edit.remind; closeSheet(); renderDir(); var ni = sc.querySelector("[data-nin]"); if (ni) ni.focus(); return true; }
    var ta = sheetEl.querySelector("[data-ntext]"), id = edit.id;
    if (a === "nsave") { var t = ta ? ta.value.trim() : ""; if (!t) return noteAct("ndel"); N.update(id, { text: t, at: edit.at, remind: !!(edit.at && edit.remind) }); if (edit.at && edit.remind) askNotify(); closeSheet(); renderDir(); return true; }
    if (a === "ntog") { N.update(id, { done: !edit.done }); closeSheet(); renderDir(); toast(edit.done ? "Wieder offen" : "Erledigt"); return true; }
    if (a === "ndel") { var old = N.list().find(function (x) { return x.id === id; }); N.remove(id); closeSheet(); renderDir(); toast("Notiz gelöscht", old ? function () { N.update(id, { deleted: false }); renderDir(); } : null); return true; }
    return false;
  }
  // Fällige Notizen mit Erinnerung auch in der App melden (zusätzlich zur Benachrichtigung)
  function dueCheck() {
    var N = NT(); if (!N || document.hidden) return;
    var seen; try { seen = JSON.parse(localStorage.getItem("sg-notes-seen") || "{}"); } catch (e) { seen = {}; }
    var now = Date.now(), hit = null;
    N.list().forEach(function (n) { if (!n.remind || n.done || !n.at) return; var at = new Date(n.at).getTime(), k = n.id + "@" + n.at; if (now >= at && now < at + 12 * 36e5 && !seen[k]) { seen[k] = now; hit = n; } });
    Object.keys(seen).forEach(function (k) { if (now - seen[k] > 4 * 864e5) delete seen[k]; });
    try { localStorage.setItem("sg-notes-seen", JSON.stringify(seen)); } catch (e) {}
    if (hit) { try { navigator.vibrate && navigator.vibrate([60, 60, 60]); } catch (e) {} var id = hit.id; toast("Notiz: " + hit.text.slice(0, 70), function () { N.update(id, { done: true }); renderDir(); }, "Erledigt", 30000); if (homeOn()) renderDir(); }
  }
  function renderFolder(id) {
    var e = E[id]; root.classList.add("sub"); root.classList.toggle("nosub", !P.subs);
    setBar('<button class="sgd-ib" data-act="back" aria-label="Zurück">' + ico("back") + "</button>", e.t, '<button class="sgd-ib" data-act="search" aria-label="Suchen">' + ico("search") + "</button>");
    var ids = e.k.filter(visible);
    sc.innerHTML = '<div class="sgd-hero" style="padding-top:2px"><h1>' + esc(e.t) + "</h1><p>" + esc(e.a === "*" ? "Für alle Apps" : APPS[e.a].name) + "</p></div>" +
      (ids.length ? '<div class="sgd-list">' + ids.map(function (k) { return row(k, { inApp: true }); }).join("") + "</div>" : '<p class="sgd-empty">Alles ausgeblendet.</p>');
  }
  function renderSearch(q) {
    root.classList.add("sub");
    if (!sc.querySelector(".sgd-res") || !bar.querySelector("input")) {
      bar.innerHTML = '<button class="sgd-ib" data-act="back" aria-label="Zurück">' + ico("back") + '</button><input class="sgd-in" id="sgdQ" placeholder="Suchen in Planer, Training, Bibel" autocomplete="off" enterkeyhint="search">';
      var inp = bar.querySelector("input"); inp.value = q || ""; inp.addEventListener("input", function () { renderSearch(inp.value); }); setTimeout(function () { inp.focus(); }, 50);
    }
    var w = (q || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
    var hits = w.length ? Object.keys(E).filter(function (id) { if (!avail(id)) return false; var e = E[id], hay = (e.t + " " + e.s + " " + (e.w || "") + " " + (APPS[e.a] ? APPS[e.a].name : "")).toLowerCase(); return w.every(function (x) { return hay.indexOf(x) > -1; }); }) : [];
    var h = '<div class="sgd-res">';
    if (!w.length) h += '<p class="sgd-empty">Bereiche, Seiten und Einstellungen aller Apps durchsuchen.</p>';
    else h += hits.length ? '<div class="sgd-list">' + hits.map(function (id) { return row(id); }).join("") + "</div>" : '<p class="sgd-empty">Kein Bereich gefunden.</p>';
    if (window.SharedCalendar && window.SharedCalendar.palette) h += '<div class="sgd-list"><button class="sgd-row" data-act="palette">' + icon({ c: "#8e8e93", ic: "search" }) + '<span class="tx"><b>Termine, Aufgaben und Befehle</b><small>' + (w.length ? "„" + esc(q) + "“ im Befehlsmenü suchen" : "Das Befehlsmenü öffnen") + '</small></span>' + ico("chev", "ch") + "</button></div>";
    sc.innerHTML = h + "</div>";
  }
  function renderDir() { if (view.kind === "folder") renderFolder(view.id); else if (view.kind === "search") renderSearch(view.q); else if (view.kind === "notes") renderNotes(); else renderHome(); }
  // Neu zeichnen, ohne eine angefangene Notiz zu verlieren (Abgleich, andere Fenster)
  function refresh() {
    var ae = document.activeElement, keep = ae && ae.matches && ae.matches(".sgd [data-nin]") ? ae.value : null;
    renderDir();
    if (keep !== null) { var ni = sc.querySelector("[data-nin]"); if (ni) { ni.value = keep; ni.focus(); } }
  }

  /* ---------- Verlauf: Android-Zurück ---------- */
  function stamp(state, replace) { var url = location.pathname + location.search + (state.indexOf("p:") === 0 ? "#sg=" + state.slice(2) : ""); history[replace ? "replaceState" : "pushState"]({ sgd: state }, "", url); }
  function showHome(kind, id) {
    view = kind === "folder" ? { kind: "folder", id: id } : kind === "search" ? { kind: "search", q: "" } : kind === "notes" ? { kind: "notes" } : { kind: "home" };
    document.documentElement.classList.add("sgd-home"); renderDir();
    if (kind !== "search") sc.scrollTop = 0; root.classList.remove("scrolled");
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--sgd-bg").trim() || "#131313"); });
  }
  function hideHome() { document.documentElement.classList.remove("sgd-home"); if (twoPane()) { view = view.kind === "search" ? { kind: "home" } : view; renderDir(); } }
  addEventListener("popstate", function (e) {
    var s = e.state && e.state.sgd; if (!s) return;
    if (sheetEl.classList.contains("on")) { closeSheet(true); }
    if (s === "home") { cur = twoPane() ? cur : null; showHome("home"); }
    else if (s === "search") showHome("search");
    else if (s === "notes") showHome("notes");
    else if (s.indexOf("f:") === 0) { var f = E[s.slice(2)]; if (f && TABS.indexOf(f.a) > -1) P.tab = f.a; showHome("home"); }
    else if (s.indexOf("p:") === 0) { var id = s.slice(2); if (E[id]) { if (cur !== id) run(id); hideHome(); } }
    else if (s === "sheet") { /* Blatt war offen: Vorwärts – nichts tun */ }
  });
  function back() {
    if (history.state && history.state.sgd && history.state.sgd !== "home") { history.back(); return; }
    // zurück zur Übersicht – im Tab der App, aus der die Seite stammt
    var e = cur && E[cur]; if (e && TABS.indexOf(e.a) > -1 && P.tab !== "start") P.tab = e.a;
    stamp("home", true); showHome("home");
  }

  /* ---------- Öffnen ---------- */
  function open(id, opts) {
    var e = E[id]; if (!e || !avail(id)) return;
    opts = opts || {};
    if (e.k) { // Ordner: zum Tab der App und zur Gruppe scrollen
      if (TABS.indexOf(e.a) > -1) P.tab = e.a;
      stamp("home", opts.replace); showHome("home");
      if (e.a === "*") { stamp("f:" + id, false); showHome("folder", id); return; }
      setTimeout(function () { var g = sc.querySelector('[data-sec="' + id + '"]'); if (g) sc.scrollTop = g.offsetTop - 64; }, 0); return;
    }
    if (e.u) { addRecent(id); location.href = PATH + e.u; return; } // eigene Seite der App (Sportwissenschaft)
    if ((e.a !== APP && e.a !== "*") || (e.fn === "notes" && !NT())) { addRecent(id); location.href = APPS[e.a === "*" ? "planer" : e.a].path + "#sg=" + id; return; }
    if (e.fn && !e.r && ["customize", "design", "sync", "install", "week", "stdweek", "notes", "update"].indexOf(e.fn) > -1) { addRecent(id); return runFn(e, id); } // Blätter über der Übersicht, kein Seitenwechsel
    addRecent(id);
    stamp("p:" + id, opts.replace);
    hideHome(); run(id);
  }
  function addRecent(id) { P.recent = [id].concat(P.recent.filter(function (x) { return x !== id; })).slice(0, 10); saveP(); }
  function run(id) {
    var e = E[id]; cur = id; var st = "p:" + id;
    whenReady(function () {
      if (e.r) route(e.r);
      if (e.f) { sub(e.f); if (APP === "planer") { var hb = document.querySelector(".bar h1"); if (hb) hb.textContent = e.t; } }
      if (e.sec) setTimeout(function () { scrollToSec(e.sec); }, 220);
      if (e.fn) setTimeout(function () { runFn(e, id); }, e.r ? 250 : 0);
      title(e);
      // die App setzt beim Wechsel teils den Verlauf zurück – Eintrag wieder markieren
      [0, 350].forEach(function (ms) { setTimeout(function () { if (cur === id && !document.documentElement.classList.contains("sgd-home")) stamp(st, true); }, ms); });
      if (twoPane()) renderDir();
    });
  }
  function route(r) {
    busy++;
    history.replaceState(history.state, "", location.pathname + "#" + r);
    try { window.dispatchEvent(new HashChangeEvent("hashchange")); } catch (x) { window.dispatchEvent(new Event("hashchange")); }
    setTimeout(function () { busy--; }, 0);
    if (APP === "training") { var m = r.split("/")[0]; if (["heute", "kalender", "lauf", "daten", "fitness", "einst", "start"].indexOf(m) > -1) setTimeout(function () { scrollTo(0, 0); }, 0); }
  }
  // Unterseite in einem Bereich wählen (Schule, Pause im Planer; Meine Bibel)
  function sub(f) {
    if (APP === "bibel") { var b = document.querySelector('#subtabs [data-sub="' + f + '"]'); if (b) b.click(); return; }
    var p = f.split(":"), sel = p[0] === "schule" ? '.tab[data-v="' + p[1] + '"]' : '#nav .tab[data-t="' + p[1] + '"]';
    (function tryIt(n) {
      var fr = document.querySelector('#mods iframe[data-mod="' + p[0] + '"]'), el = null;
      try { el = fr && fr.contentDocument && fr.contentDocument.querySelector(sel); } catch (x) {}
      if (el) { el.click(); return; }
      if (n < 60) setTimeout(function () { tryIt(n + 1); }, 120);
    })(0);
  }
  function scrollToSec(text) {
    var scope = document.querySelector(".screen.active") || document.querySelector(".view.active") || document.body;
    var cands = scope.querySelectorAll(".sec-label,h2,h3"), t = text.toLowerCase();
    for (var i = 0; i < cands.length; i++) if ((cands[i].textContent || "").trim().toLowerCase().indexOf(t) === 0) {
      var el = cands[i].closest(".card") && cands[i].tagName !== "DIV" ? cands[i].closest(".card") : cands[i];
      var y = el.getBoundingClientRect().top + scrollY - 12; scrollTo({ top: y, behavior: "smooth" }); return;
    }
  }
  function runFn(e, id) {
    var C = window.SharedCalendar, fn = e.fn;
    if (fn === "week") { if (C && C.weekPlan) C.weekPlan(); else location.href = APPS.planer.path + "#wochenplanung"; }
    else if (fn === "palette") { if (C && C.palette) C.palette(); }
    else if (fn === "customize") customizeSheet();
    else if (fn === "stdweek") { if (C && C.weekPlanStd) C.weekPlanStd(); }
    else if (fn === "notes") { stamp("notes"); showHome("notes"); }
    else if (fn === "update") doUpdate();
    else if (fn === "design") { if (C && C.openDesign) C.openDesign(); else if (APP === "bibel") { open("b_set"); setTimeout(function () { scrollToSec("Design"); }, 400); } }
    else if (fn === "sync") { if (C && C.openSync) C.openSync(); else location.href = APPS.planer.path + "#sg=x_cloud"; }
    else if (fn === "install") { var ev = window.SGInstallEvt; if (ev) { ev.prompt(); } else toast("Im Chrome-Menü ⋮ „App installieren“ wählen."); }
    else if (fn.indexOf("click:") === 0) { var b = document.getElementById(fn.slice(6)); if (b) b.click(); }
  }
  // Seitentitel in der App an den Eintrag anpassen (Bibel-Kopf, Bereichskopf im Training)
  function title(e) {
    if (APP === "bibel") { var h = document.querySelector(".app>header h1"); if (h) h.textContent = e.t === "Heute" ? "Bibel" : e.t; }
    if (APP === "training") { var w = document.querySelector(".tsmod header b"); if (w && /\//.test(e.r || "")) w.textContent = (PARENT[e.id] ? E[PARENT[e.id]].t + " · " : "") + e.t; }
  }
  // Links innerhalb der Apps (z. B. „Atmung öffnen“, Befehle) – die Übersicht zieht mit
  addEventListener("hashchange", function () {
    if (busy) return;
    var h = location.hash.replace("#", ""); if (!h) return;
    if (h.indexOf("sg=") === 0) { var id0 = h.slice(3); if (E[id0]) open(id0, { replace: true }); return; }
    var id = NATIVE[h] || NATIVE[h.split("/")[0]]; if (!id) return;
    cur = id; addRecent(id); setTimeout(function () { stamp("p:" + id, true); }, 0); hideHome(); title(E[id]);
  });
  addEventListener("sg-nav", function (ev) {
    var r = ev.detail && ev.detail.r; if (busy || !r || (cur && E[cur] && E[cur].r === r)) return;
    var id = NATIVE[r]; if (!id || id === cur) return; cur = id; stamp("p:" + id, true); hideHome(); if (twoPane()) renderDir(); });
  function whenReady(fn) {
    var ok = function () {
      if (APP === "planer") return !!window.SGPlaner;
      if (APP === "training") return !!document.querySelector(".tsmod") && !!document.querySelector("#nav .tab");
      return !!window.SGBibelReady;
    };
    (function wait(n) { if (ok() || n > 160) fn(); else setTimeout(function () { wait(n + 1); }, 50); })(0);
  }

  /* ---------- Blätter (unten), Snackbar ---------- */
  function sheet(html) { sheetEl.querySelector(".pn").innerHTML = '<div class="hd"></div>' + html; sheetEl.classList.add("on"); history.pushState({ sgd: "sheet", prev: history.state && history.state.sgd }, "", location.href); }
  function closeSheet(fromPop) { if (!sheetEl.classList.contains("on")) return; sheetEl.classList.remove("on"); if (!fromPop && history.state && history.state.sgd === "sheet") history.back(); }
  addEventListener("popstate", function (e) { if (sheetEl.classList.contains("on") && !(e.state && e.state.sgd === "sheet")) closeSheet(true); });
  function toast(msg, undo, label, ms) {
    snack.innerHTML = "<span>" + esc(msg) + "</span>" + (undo ? "<button>" + esc(label || "Rückgängig") + "</button>" : ""); snack.classList.add("on");
    if (undo) snack.querySelector("button").onclick = function () { undo(); snack.classList.remove("on"); };
    clearTimeout(toast.t); toast.t = setTimeout(function () { snack.classList.remove("on"); }, ms || 4000);
  }
  // „Version aktualisieren“: Fortschritt als Hinweis unten
  function doUpdate() {
    if (!window.SGUpdate) return toast("Version " + (window.SGVersion || ""));
    window.SGUpdate.check(function (t) { toast(t, null, null, 6000); });
  }
  function sRow(act, ic, t, s, right) { return '<button class="sgd-row" data-sact="' + act + '"><span class="ic2">' + ico(ic) + '</span><span class="tx"><b>' + esc(t) + "</b>" + (s ? "<small>" + esc(s) + "</small>" : "") + "</span>" + (right || "") + "</button>"; }
  function optionsSheet(id) {
    var e = E[id]; if (!e) return; var fav = P.fav.indexOf(id) > -1, hid = P.hidden.indexOf(id) > -1, own = e.a === APP;
    sheet("<h3>" + esc(e.t) + '</h3><p class="s">' + esc(e.s) + "</p>" +
      sRow("open:" + id, "chev", "Öffnen", e.a !== APP && e.a !== "*" ? "in " + APPS[e.a].name : "") +
      sRow((fav ? "unfav:" : "fav:") + id, "star", fav ? "Aus Favoriten entfernen" : "Zu Favoriten", "") +
      (own && !e.k ? sRow("start:" + id, "home", P.start[APP] === id ? "Nicht mehr als Startseite" : "Beim Öffnen von " + APPS[APP].name + " starten", "") : "") +
      sRow((hid ? "show:" : "hide:") + id, "eye", hid ? "Wieder einblenden" : "In der Übersicht ausblenden", hid ? "" : "Unter „Ausgeblendet“ jederzeit zurückholen"));
  }
  function customizeSheet() {
    var o = appOrder(), favs = P.fav.filter(function (id) { return E[id]; });
    var mini = function (act, i, n) { return '<span class="sgd-mini"><button data-sact="' + act + ":up:" + i + '"' + (i ? "" : " disabled") + ' aria-label="Nach oben">' + ico("up") + '</button><button data-sact="' + act + ":down:" + i + '"' + (i < n - 1 ? "" : " disabled") + ' aria-label="Nach unten">' + ico("down") + "</button></span>"; };
    var startSel = function (a) { return '<select data-start="' + a + '"><option value="">Übersicht</option>' + Object.keys(E).filter(function (id) { return E[id].a === a && !E[id].k && !E[id].fn; }).map(function (id) { return '<option value="' + id + '"' + (P.start[a] === id ? " selected" : "") + ">" + esc((PARENT[id] ? E[PARENT[id]].t + " › " : "") + E[id].t) + "</option>"; }).join("") + "</select>"; };
    sheet('<h3>Übersicht anpassen</h3><p class="s">Gilt für alle Apps auf diesem Gerät und wird mit der Cloud-Sicherung abgeglichen.</p>' +
      '<label class="f"><span>Wie soll ich dich nennen?</span><input type="text" data-name value="' + esc(P.name) + '" placeholder="Name für die Begrüßung (optional)" autocomplete="given-name"></label>' +
      '<div class="sec">Beim Öffnen starten mit</div>' + Object.keys(APPS).map(function (a) { return '<label class="f"><span>' + APPS[a].name + "</span>" + startSel(a) + "</label>"; }).join("") +
      '<div class="sec">Anzeige</div>' + sRow("tog:now", "sun", "„Jetzt“-Karte", "Nächste Termine, fällige Aufgaben, Bibel", '<span class="sgd-sw' + (P.now ? " on" : "") + '"></span>') +
      sRow("tog:subs", "list", "Beschreibungen unter den Einträgen", "", '<span class="sgd-sw' + (P.subs ? " on" : "") + '"></span>') +
      '<div class="sec">Reihenfolge der Apps</div>' + sRow("tog:order", "home", "Aktuelle App immer oben", "", '<span class="sgd-sw' + (!P.order ? " on" : "") + '"></span>') +
      (P.order ? o.map(function (a, i) { return '<div class="sgd-row" style="cursor:default"><span class="sgd-ic" style="--c:' + APPS[a].color + '">' + ico("folder") + '</span><span class="tx"><b>' + APPS[a].name + "</b></span>" + mini("ord", i, o.length) + "</div>"; }).join("") : "") +
      '<div class="sec">Favoriten</div>' + (favs.length ? favs.map(function (id, i) { return '<div class="sgd-row" style="cursor:default">' + icon(E[id]) + '<span class="tx"><b>' + esc(E[id].t) + "</b><small>" + (APPS[E[id].a] ? APPS[E[id].a].name : "") + "</small></span>" + mini("fav", i, favs.length) + '<span class="sgd-mini"><button data-sact="unfav:' + id + '" aria-label="Entfernen">' + ico("close") + "</button></span></div>"; }).join("") : '<p class="s">Noch keine – Einträge gedrückt halten.</p>') +
      '<div class="sec">Ausgeblendet</div>' + (P.hidden.length ? P.hidden.filter(function (id) { return E[id]; }).map(function (id) { return sRow("show:" + id, "eye", E[id].t, "Tippen zum Einblenden"); }).join("") : '<p class="s">Nichts ausgeblendet.</p>') +
      '<div class="sec">Zurücksetzen</div>' + sRow("reset", "history", "Übersicht zurücksetzen", "Favoriten, Reihenfolge und Ausgeblendetes"));
    var nm = sheetEl.querySelector("[data-name]"); nm.addEventListener("input", function () { P.name = nm.value.trim().slice(0, 30); saveP(); renderDir(); });
    sheetEl.querySelectorAll("select[data-start]").forEach(function (s) { s.addEventListener("change", function () { P.start[s.dataset.start] = s.value || null; saveP(); }); });
  }
  function onSheetClick(e) {
    if (e.target === sheetEl) return closeSheet();
    var b = e.target.closest("[data-sact]"); if (!b) return;
    var p = b.dataset.sact.split(":"), a = p[0], id = p[1], keep = false;
    if (a.charAt(0) === "n" && noteAct(a, b.dataset.sact.slice(a.length + 1))) return;
    if (a === "open") { closeSheet(); setTimeout(function () { open(id); }, 60); return; }
    if (a === "fav") { P.fav.push(id); toast("Zu Favoriten hinzugefügt"); }
    else if (a === "unfav") { var i = P.fav.indexOf(id); P.fav.splice(i, 1); toast("Aus Favoriten entfernt", function () { P.fav.splice(i, 0, id); saveP(); renderDir(); }); keep = b.closest(".sgd-mini"); }
    else if (a === "hide") { P.hidden.push(id); toast("„" + E[id].t + "“ ausgeblendet", function () { P.hidden = P.hidden.filter(function (x) { return x !== id; }); saveP(); renderDir(); }); }
    else if (a === "show") { P.hidden = P.hidden.filter(function (x) { return x !== id; }); keep = b.closest(".sgd-sheet") && sheetEl.querySelector(".sec"); }
    else if (a === "start") { P.start[APP] = P.start[APP] === id ? null : id; toast(P.start[APP] ? APPS[APP].name + " startet jetzt mit „" + E[id].t + "“" : APPS[APP].name + " startet mit der Übersicht"); }
    else if (a === "tog") { if (id === "order") P.order = P.order ? null : appOrder(); else P[id] = !P[id]; keep = true; }
    else if (a === "ord" || a === "fav") { }
    else if (a === "reset") { P.fav = ["p_heute", "p_kal", "t_heute", "b_lesen"]; P.hidden = []; P.order = null; P.subs = true; P.now = true; toast("Übersicht zurückgesetzt"); }
    if ((a === "ord" || a === "fav") && p.length === 3) {
      var list = a === "ord" ? (P.order = appOrder()) : P.fav, j = +p[2], k = j + (id === "up" ? -1 : 1);
      if (k >= 0 && k < list.length) { var t = list[j]; list[j] = list[k]; list[k] = t; } keep = true;
    }
    saveP(); renderDir();
    if (keep) { var y = sheetEl.querySelector(".pn").scrollTop; closeSheet(); setTimeout(function () { customizeSheet(); sheetEl.querySelector(".pn").scrollTop = y; }, 30); }
    else closeSheet();
  }
  function onClick(e) {
    var ck = e.target.closest("[data-sgnck]");
    if (ck) { var N = NT(), n = N && N.list().find(function (x) { return x.id === ck.dataset.sgnck; }); if (n) { N.update(n.id, { done: !n.done }); renderDir(); if (!n.done) toast("Erledigt", function () { N.update(n.id, { done: false }); renderDir(); }); } return; }
    var nt = e.target.closest("[data-sgnote]"); if (nt) return noteSheet(nt.dataset.sgnote);
    var tb = e.target.closest("[data-sgtab]"); if (tb) return setTab(tb.dataset.sgtab, TABS.indexOf(tb.dataset.sgtab) > TABS.indexOf(P.tab) ? 1 : -1);
    var nf = e.target.closest("[data-sgnf]"); if (nf) { nfilter = nf.dataset.sgnf; return renderNotes(); }
    var b = e.target.closest("[data-act],[data-id]"); if (!b) return;
    if (b.dataset.id) return open(b.dataset.id);
    var a = b.dataset.act;
    if (a === "search") { stamp("search"); showHome("search"); }
    else if (a === "back") { if (history.state && history.state.sgd && history.state.sgd !== "home") history.back(); else { stamp("home", true); showHome("home"); } }
    else if (a === "menu") sheet("<h3>Übersicht</h3>" + sRow("x:customize", "tune", "Übersicht anpassen", "Name, Startseite, Favoriten, Reihenfolge") + sRow("x:design", "palette", "Design", "") + (window.SharedCalendar ? sRow("x:sync", "cloud", "Cloud-Sicherung", "Die Apps laufen immer auch offline") : "") + (window.SGInstallEvt ? sRow("x:install", "download", "App installieren", "") : "") + sRow("x:update", "download", "Version aktualisieren", "Installiert: Version " + (window.SGVersion || "–")));
    else if (a === "favedit") customizeSheet();
    else if (a === "notes") { stamp("notes"); showHome("notes"); }
    else if (a === "ntime") timeSheet();
    else if (a === "update") doUpdate();
    else if (a === "hidden") customizeSheet();
    else if (a === "apps") sheet("<h3>Apps</h3>" + Object.keys(APPS).map(function (x) { return '<button class="sgd-row" data-sact="app:' + x + '"><span class="sgd-ic" style="--c:' + APPS[x].color + '">' + ico(x === "bibel" ? "book" : x === "training" ? "run" : "cal") + '</span><span class="tx"><b>' + APPS[x].name + "</b><small>" + APPS[x].sub + "</small></span>" + (x === APP ? '<span class="val">geöffnet</span>' : ico("chev", "ch")) + "</button>"; }).join(""));
    else if (a === "open-app") location.href = APPS[b.dataset.app].path;
    else if (a === "palette") {
      var q = (bar.querySelector("input") || {}).value || "";
      // Ergebnisse (neuer Termin, Sprung in den Kalender) sollen sichtbar sein: erst die Seite der App zeigen
      var pg = APP === "planer" && window.SGPlaner ? NATIVE[SGPlaner.tab()] : null;
      if (pg) { stamp("home", true); open(pg); }
      setTimeout(function () { if (window.SharedCalendar) window.SharedCalendar.palette(q); }, pg ? 120 : 0);
    }
  }
  // Menüpunkte aus dem ⋮-Blatt und App-Wechsel
  sheetClickExtra();
  function sheetClickExtra() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-sact^='x:'],[data-sact^='app:']"); if (!b) return;
      e.stopPropagation(); var v = b.dataset.sact.split(":"); closeSheet();
      if (v[0] === "app") { if (v[1] !== APP) setTimeout(function () { location.href = APPS[v[1]].path; }, 80); return; }
      setTimeout(function () { runFn({ fn: v[1] }); }, 80);
    }, true);
  }

  /* ---------- Schnittstelle für die Apps ---------- */
  window.SGDir = {
    on: true,
    backHTML: function () { return '<button class="sgd-back" data-sgback aria-label="Zur Übersicht">' + ico("back") + "</button>"; },
    back: back, open: open,
    // Titel der geöffneten Unterseite, wenn sie zum Bereich passt (z. B. „Stundenplan“ statt „Schule“)
    pageTitle: function (r) { var e = cur && E[cur]; return e && e.r === r && e.f ? e.t : ""; }, home: function () { stamp("home"); showHome("home"); }
  };
  document.documentElement.classList.add("sg-dir");

  /* ---------- Start ---------- */
  function injectBacks() {
    var bk = window.SGDir.backHTML();
    if (APP === "training") {
      document.querySelectorAll(".screen>.top").forEach(function (t) { if (!t.querySelector(".sgd-back")) t.insertAdjacentHTML("afterbegin", bk); });
      var mh = document.querySelector(".tsmod header"); if (mh && !mh.querySelector(".sgd-back")) mh.insertAdjacentHTML("afterbegin", bk);
    }
    if (APP === "bibel") { var h = document.querySelector(".app>header"); if (h && !h.querySelector(".sgd-back")) h.insertAdjacentHTML("afterbegin", bk); }
  }
  function start() {
    mount(); injectBacks(); setTimeout(injectBacks, 800);
    var h = location.hash.replace("#", ""), id = null;
    if (h.indexOf("sg=") === 0) id = h.slice(3); else if (h) id = NATIVE[h] || NATIVE[h.split("/")[0]] || null;
    if (h && !id) { stamp("home", true); history.replaceState({ sgd: "home" }, "", location.pathname + "#" + h); return showHome("home"); } // z. B. #wochenplanung – die App erledigt das selbst
    stamp("home", true);
    if (!id && P.start[APP] && E[P.start[APP]]) id = P.start[APP];
    if (!id && twoPane()) id = ROOT[APP][0];
    showHome("home");
    if (id && E[id]) open(id);
  }
  var wasTwo = twoPane(); // Tastatur auf dem Handy ändert die Höhe – nur bei Wechsel Handy/Tablet neu zeichnen
  addEventListener("resize", function () { if (root && twoPane() !== wasTwo) { wasTwo = twoPane(); renderDir(); } });
  setInterval(dueCheck, 20000); setTimeout(dueCheck, 2500);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { dueCheck(); if (homeOn() && !document.activeElement.matches("input,textarea")) refresh(); } });
  addEventListener("sg-update", function (e) { if (snack) toast("Version " + e.detail + " ist da.", function () { window.SGUpdate.install(function (t) { toast(t); }, e.detail); }, "Aktualisieren", 12000); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 0); }); else setTimeout(start, 0);
})();
