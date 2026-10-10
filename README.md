# Planer

Eine App für Kalender, Aufgaben, Notizen, Schule, Pause, Training, Mobility, Atmung & HRV, Rodeln (Bahnplan) und Bibel.

- **Adresse:** https://sportgermany.github.io/planer/
- **Version:** steht unten in der Übersicht und im ⋮-Menü. „Version aktualisieren“ lädt die neueste Fassung sofort.
- **Offline:** Alles läuft ohne Netz (Service Worker `sw.js`). Beim ersten Öffnen werden alle Seiten und Dateien gespeichert;
  danach kommen sie immer sofort aus dem Speicher. Die Cloud-Sicherung (GitHub Gist) gleicht nur ab, wenn Netz da ist.
- **Übersicht:** Tabs Start · Planer · Training · Bibel (auch per Wischen). Start zeigt Jetzt, Notizen, Favoriten und Zuletzt.
- **Notizen:** schnell festhalten, optional mit Zeitpunkt und Erinnerung; Notizen mit Zeit stehen auch im Kalender.
- **Standardwoche:** die normale Trainingswoche einmal festlegen und jede Woche mit einem Tipp übernehmen (Training › Standardwoche).
- **Aufbau:**
  - `index.html` – Planer mit der Übersicht (Startseite der App)
  - `schule/`, `pause/` – Bereiche des Planers
  - `training/` – Training, darin `mobility/`, `atmung/`, `bahnplan/`
  - `bibel/` – Elberfelder Bibel 1905 (`elb1905.json`)
  - `sg/` – gemeinsame Teile aller Seiten (Design, Verbund mit Kalender/Aufgaben/Notizen/Sync, Übersicht)
  - `js/` in jedem Ordner – die Skripte der jeweiligen Seite (als Dateien, damit der Browser sie schneller startet)
- **Neue Version veröffentlichen:** Versionsnummer erhöhen (sie steht in `sw.js` und an jeder Skriptdatei als `?v=`),
  dann holt sich jedes Gerät die neue Fassung.
- **Installieren:** In Chrome auf Android ⋮ → „App installieren“.
