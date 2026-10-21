# Planer – Kurzanleitung für KI-Sitzungen (zuerst lesen, spart Suchen)

Android-App (Capacitor 8, WebView = Chrome) aus reinen HTML/JS-Dateien. **Nur die APK zählt** (kein Browser-/PWA-Sonderweg mehr).
Alles läuft 100 % offline; Netz nur für Cloud-Abgleich (Gist), Webkalender, Update-Prüfung, Wikipedia im Bahnplan.
Sprache in App, Commits, Doku: Deutsch. Ausführliches Wissen: `werkzeuge/WISSEN.md`, Geschichte und Fehler: `werkzeuge/VERLAUF.md`.

## Feste Regeln
- Eine App: alles bleibt unter `/planer/`. Keine Funktion löschen. Datenformate abwärtskompatibel (alte Geräte, Cloud, Umzugsdatei).
- Gemeinsamer Code nur in `werkzeuge/quellen/` → `python3 werkzeuge/build.py` kopiert nach `sg/` (nie `sg/` direkt bearbeiten).
- Design zentral (`werkzeuge/quellen/design.js`, Standard „Material You“). Mobility (`training/mobility/`, `training/atmung/`) inhaltlich nicht ändern ohne Rückfrage.
- Nicht anfassen: `bibel/elb1905.json`, `werkzeuge/apk/planer-schluessel.enc` (nie neu erzeugen), Passwortdatei (nie lesen/ausgeben).
- Kein `100dvh`, kein `scrollIntoView`, Grids `minmax(0,1fr)`, Tippflächen ≥ 44 px, Schrift ≥ 12 px, Konsole sauber.
- Jede Änderung: Plan + Fehler/Ursache/Lösung in `VERLAUF.md`, Tests grün, dann Commit. Kein Modellname in Commits/Code.
- Version erhöhen in `werkzeuge/build.py` (`VERSION`) und `werkzeuge/tests/suite3.js` (`VER`); Push auf `main` baut die APK und das Release.

## Wo was steht
| Datei | Inhalt |
|---|---|
| `app/index.html`, `app/js/1-app.js` | Hülle: Navigation (Tabelle `V`), Kalender-Startseite (renderStrip/Day/Month, evSheet, planDo), Mehr (renderMehr), Blätter (`sheet`/`closeSheet`), Suche (`openSearch`), Webkalender-/Handykalender-Blätter |
| `werkzeuge/quellen/verbund.js` | Kalender-Kern `SharedCalendar`: Speicher, `occurrences`/`repStarts` (Serien, mehrtägig), `allItems`/`withStatus`/`planSet`, Terminblatt (`form`, `seriesApply`), Cloud-Gist-Abgleich, Wochenplanung, .ics, Handykalender (`hOut`, `hSync`), Webkalender (`api.abo`), Erinnerungen |
| `werkzeuge/quellen/design.js` | Farbwelten (`THEMES`), Material You + Hintergrundbild-Farben (`sg-monet-v1`), `SGHaptic`, Adress-Umschreibung `SGFixUrl`, `SGVersion` |
| `werkzeuge/quellen/{schnell,suche,bibelstelle,suchdaten}.js` | Schnelleingabe, Such-Kern, Bibelstellen (Node-Tests) |
| `training/`, `schule/`, `bibel/`, `pause/`, `wissen/`, `training/bahnplan/` | Bereiche, als iframe in der Hülle |
| `werkzeuge/apk/android/.../PlanerKalenderPlugin.java`, `PlanerSystemPlugin.java` | native Teile: Handykalender, Systemfarben/Leisten/Vibration |
| `.github/workflows/apk.yml` | Bauen, Emulator-Test, Release (nur wenn Release `v<Version>` fehlt) |

## Testen (Server: `cd /home/user && python3 -m http.server 8765 &`, `NODE_PATH=/opt/node-tools/node_modules`)
`cd werkzeuge/tests` · `node suite3.js [Filter]` (Gesamt, Filter z. B. „P7“) · `node apk.js` (APK nachgestellt) · `node offline3.js` (beendet den Server – danach neu starten) ·
`node schnell.js` · `node suche-kern.js` · `node bahnplan-1.js` / `bahnplan-2.js` · `node upd.js`. Vor dem Commit Testbilder zurücksetzen: `git checkout -- werkzeuge/tests/*.png werkzeuge/tests/*.pdf`.
Lange Läufe im Hintergrund in eine Datei schreiben. Datum in Tests immer als Ortsdatum, nie `toISOString()`.

## Sparsam arbeiten
Erst diese Datei, dann gezielt `grep -n` in der genannten Datei statt ganze Dateien zu lesen; `verbund.js` und `1-app.js` sind groß – Abschnitte über Kommentar-Überschriften (`/* ---------- … ---------- */`) anspringen.
