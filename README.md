# Planer

Eine App für Kalender, Aufgaben, Notizen, Schule, Pause, Training, Mobility, Atmung & HRV, Rodeln (Bahnplan) und Bibel.

- **Adresse:** https://sportgermany.github.io/planer/
- **Version:** steht unten in der Übersicht und im ⋮-Menü. „Version aktualisieren“ lädt die neueste Fassung sofort.
- **Offline:** Alles läuft ohne Netz (Service Worker `sw.js`). Beim ersten Öffnen werden alle Seiten und Dateien gespeichert;
  danach kommen sie immer sofort aus dem Speicher. Die Cloud-Sicherung (GitHub Gist) gleicht nur ab, wenn Netz da ist.
- **Aufbau der App:** eine Hülle (`app/`) mit fünf Zielen unten (Tablet: links) – **Kalender · Training · Mobility · Schule · Mehr**.
  - **Kalender** (Start): Woche/Monat, Tagesplan mit allem aus allen Bereichen, „Starten“ direkt am Eintrag, „+“ für Termin, Aufgabe, Notiz, Woche planen.
  - **Training:** Heute · Laufen & Kraft · Rodeln (Kurvenbuch, Bahnen, Läufe, Drucken) · Auswertung · Sportwissenschaft.
  - **Mobility:** Mobility (Tagesblock, Wettkampf, Übungen, Fortschritt) · Atmung & HRV (Heute, Üben & HRV messen, Woche, Verlauf, Plan).
  - **Schule:** Schultag · Stundenplan · Aufgaben & Prüfungen · Lernplan · Ferien.
  - **Mehr:** Aufgaben, Notizen, Woche planen, Bibel, Sportwissenschaft, Pause, Einstellungen, Version.
  - Die Bereiche sind die bisherigen Seiten, eingebettet ohne eigene Leisten. Direkt geöffnete Seiten und alte Adressen leiten in die Hülle um (`?einzeln` öffnet eine Seite ausnahmsweise allein).
- **Notizen:** schnell festhalten, optional mit Zeitpunkt und Erinnerung; Notizen mit Zeit stehen auch im Kalender.
- **Sportwissenschaft:** das Lehrbuch „Sportwissenschaft für Rennrodler“ in der App (Training › Sportwissenschaft): Lesemodus mit gespeichertem Fortschritt,
  Karteikarten aus Merksätzen und Mach-das/Lass-das-Tabellen, Quiz mit Auswertung, Suche. Inhalt: `wissen/buch.md` → `wissen/js/buch.js`.
- **Standardwoche:** die normale Trainingswoche einmal festlegen und jede Woche mit einem Tipp übernehmen (Training › Standardwoche).
- **Aufbau:**
  - `app/` – die Hülle: Navigation, Kalender, Notizen, Mehr (Startseite der App)
  - `index.html` – Planer (Aufgaben, frühere Kalenderansicht)
  - `schule/`, `pause/` – Bereiche des Planers
  - `training/` – Training, darin `mobility/`, `atmung/`, `bahnplan/`
  - `bibel/` – Elberfelder Bibel 1905 (`elb1905.json`)
  - `wissen/` – Sportwissenschaft (Lehrbuch, Karteikarten, Quiz, Suche)
  - `sg/` – gemeinsame Teile aller Seiten (Design, Verbund mit Kalender/Aufgaben/Notizen/Sync, Training-Integration)
  - `js/` in jedem Ordner – die Skripte der jeweiligen Seite (als Dateien, damit der Browser sie schneller startet)
- **Neue Version veröffentlichen:** Versionsnummer erhöhen (sie steht in `sw.js` und an jeder Skriptdatei als `?v=`),
  dann holt sich jedes Gerät die neue Fassung.
- **Installieren:** In Chrome auf Android ⋮ → „App installieren“.
- **Weiterarbeiten:** alles Wissen, der Build, die Tests und der Fehlerverlauf liegen in `werkzeuge/` (zuerst `werkzeuge/WISSEN.md` lesen).
