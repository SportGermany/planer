# Plan: aus einer App mehrere kleine Apps (freigegeben am 01.11.2026)

**Jede Sitzung liest zuerst diese Datei und macht beim ersten offenen Punkt weiter.** Erledigtes abhaken (`[x]`),
Fehler mit Ursache/Lösung in `VERLAUF.md`. Immer nur eine App gleichzeitig; jede Stufe endet mit einer funktionierenden,
veröffentlichten App. Die bestehende Planer-App bleibt bis zum Schluss voll nutzbar (nichts löschen, bevor der Ersatz läuft).

## Entscheidungen des Nutzers
- Plan B (ein Repo, mehrere APKs, gemeinsamer Code nur in `werkzeuge/quellen/`), eingeführt Schritt für Schritt (Plan D).
- Termine aller Apps erscheinen im **Google-Kalender** (Zielkalender wählbar). Aufgaben: optional (Schalter, Standard aus).
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
- [ ] **0 Grundlagen** – Schnelltest; `apps.json`; Build/Workflow je App (Matrix, nur geänderte App); diese Datei.
- [ ] **1 Google-Kalender-Ziel im Planer** – Zielkalender wählbar (Google-Konto statt lokal), Aufgaben-Schalter; Release 4.1.0.
- [ ] **2 App Bibel** – eigene APK, Import aus Planer, Vergleichstest alt/neu, Planer-Kachel öffnet die App; Release `bibel-v1.0.0`.
- [ ] **3 App Pause** – wie 2.
- [ ] **4 App Schule** – Stundenplan, Aufgaben/Prüfungen, Lernplan, Ferien; Prüfungen/Lernblöcke in Google.
- [ ] **5 App Training** – Training, Mobility, Atmung, Auswertung, Sportwissenschaft, Bahnplan (unverändert); Trainings in Google.
- [ ] **6 Planer schlank** – nur Kalender, Aufgaben, Notizen, Woche planen, Web-/Handykalender; Bereiche als Kacheln zu den Apps.
- [ ] **7 Abnahme** – je App alt/neu-Vergleich, offline, Emulator; Bericht an den Nutzer.
- [ ] **8 Verbesserungen** – Widgets; App-Verknüpfungen (langer Druck); Benachrichtigungen je App; Trainingsergebnis im
  Google-Termin; Stundenplan als eigener Google-Unterkalender; Google-Termine im Planer bearbeiten + Wochenraster über alle Apps;
  gemeinsames Design zentral halten. Danach geplante Aufgabe stoppen.
