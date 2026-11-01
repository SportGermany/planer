# Plan: aus einer App mehrere kleine Apps (freigegeben am 01.11.2026)

**Jede Sitzung liest zuerst diese Datei und macht beim ersten offenen Punkt weiter.** Erledigtes abhaken (`[x]`),
Fehler mit Ursache/Lösung in `VERLAUF.md`. Immer nur eine App gleichzeitig; jede Stufe endet mit einer funktionierenden,
veröffentlichten App. Die bestehende Planer-App bleibt bis zum Schluss voll nutzbar (nichts löschen, bevor der Ersatz läuft).

## Entscheidungen des Nutzers
- Plan B (ein Repo, mehrere APKs, gemeinsamer Code nur in `werkzeuge/quellen/`), eingeführt Schritt für Schritt (Plan D).
- Termine aller Apps erscheinen im **Google-Kalender** (Zielkalender wählbar). Aufgaben: optional (Schalter, Standard aus).
- **Pause/Ablenken** wird nicht weiterentwickelt (keine eigene App, bleibt unverändert im Planer).
- **Rodeln** wird nicht als eigene App entwickelt; der Bahnplan bleibt unverändert, wo er ist (Training), keine Weiterentwicklung.
- Alle 7 Verbesserungen umsetzen – **erst nach der Abnahme (Schritt 8)**.
- Geplante Aufgabe weckt die Sitzung alle 5 Stunden: „weiter laut PLAN-APPS.md“. Stoppen, wenn alles erledigt ist.
- 100 % offline bleibt Grundregel jeder App. Mobility inhaltlich unverändert.

## Technik (gilt für alle Apps)
- Gleiche Web-Dateien wie heute (`/planer/<bereich>/`), je App ein eigenes Paket: `werkzeuge/apps.json` beschreibt
  Paketname, Name, Startseite, Ordner, Version. `www.js <app>` kopiert nur diese Ordner; Gradle bekommt `-PappId`/`-PappName`.
- Releases je App: Planer `v4.x.y` (wie bisher), sonst `<app>-v1.x.y` (z. B. `bibel-v1.0.0`). Update-Knopf je App sucht sein Release.
- Sync zwischen Apps: Handykalender mit Google-Kalender als Ziel (Termine), Cloud-Gist (Sicherung, je App eigene Datei im
  selben Gist), Android-Links `planer-<app>://…` zum Springen, Umzug: Planer exportiert den Bereich als Datei, neue App liest ein.
- Tests: `node schnell-app.js <app>` (< 3 min) bei jeder Änderung; große Suite (`suite3.js`) nur vor einem Release der Planer-App.

## Schritte
- [x] **0 Grundlagen** – `schnell-app.js` (Planer 3,4 min), `apps.json`, `www.js <app>`, Gradle `-PappId`, Workflow `apps.yml`
  (baut nur Apps ohne Release, Emulator `emulator-app.js`, Release `--latest=false`), Update-Prüfung sucht nur das eigene Release.
- [x] **1 Google-Kalender-Ziel im Planer** – Zielkalender wählbar (Google-Konto statt lokal), Aufgaben-Schalter; Release 4.1.0.
  Fremde Kalender: Einträge mit CUSTOM_APP_PACKAGE/URI (kein Sync-Adapter nötig); Rücklesen überspringt eigene, meldet `fromApp`.
- [x] **2 App Bibel** – eigene APK, Import aus Planer, Vergleichstest alt/neu, Planer-Kachel öffnet die App; Release `bibel-v1.0.0`.
  Übergabe: Planer `openApp` (Daten nur beim 1. Mal, `sg-uebergabe-v1`), App `takeHandover` (1. Mal ohne Frage), Abschnitt `#sgAppInfo`.
  Neue App = Eintrag in apps.json (+ `probe`), `EXT` in app/js/1-app.js, Platzhalter `#sgAppInfo` in den Einstellungen der Seite.
- [–] **3 App Pause** – entfällt (Wunsch 01.11.: „Ablenken nicht mehr weiterentwickeln“). Pause bleibt unverändert im Planer.
- [x] **4 App Schule** – Stundenplan, Aufgaben/Prüfungen, Lernplan, Ferien; Prüfungen/Lernblöcke in Google.
  Übergabe als Datei (FileProvider, bis 64 MB) inkl. Ablage (IndexedDB) und Handy-Einstellung; Planer setzt `sg-ausgelagert-v1`
  → verbund.js liest/exportiert die alte Schulkopie nicht mehr; Einträge anderer Apps kommen über `fromApp` aus Google zurück.
- [x] **5 App Training** – Training, Mobility, Atmung, Auswertung, Sportwissenschaft, Bahnplan (unverändert); Trainings in Google.
  „✓ … erledigt“-Einträge (Beschreibung „Planer · … erledigt“) → Planer `doneArea` hakt geplante Trainings ab; `#wissen/…` öffnet ../wissen/.
- [x] **6 Planer schlank** – nur Kalender, Aufgaben, Notizen, Woche planen, Web-/Handykalender; Bereiche als Kacheln zu den Apps.
  apps.json `ohne` → www.js lässt die Ordner weg und setzt `window.SGOhne`; `ohne()`/`viaApp()`/`appMissing()` in 1-app.js (Download über `SGUpdate.apkFor`).
  Im Browser/den Tests (ohne SGOhne) bleibt der volle Planer – die große Suite prüft weiter alle Bereiche. Planer-APK 6,7 → 0,9 MB.
- [ ] **7 Abnahme** – je App alt/neu-Vergleich, offline, Emulator; Bericht an den Nutzer.
- [ ] **8 Verbesserungen** – Widgets; App-Verknüpfungen (langer Druck); Benachrichtigungen je App; Trainingsergebnis im
  Google-Termin; Stundenplan als eigener Google-Unterkalender; Google-Termine im Planer bearbeiten + Wochenraster über alle Apps;
  gemeinsames Design zentral halten. Danach geplante Aufgabe stoppen.
