# Planer

Eine App für Kalender, Aufgaben, Schule, Pause, Training, Mobility, Atmung & HRV, Rodeln (Bahnplan) und Bibel.

- **Adresse:** https://sportgermany.github.io/planer/
- **Offline:** Alles läuft ohne Netz (Service Worker `sw.js`). Die Cloud-Sicherung (GitHub Gist) gleicht nur ab, wenn Netz da ist.
- **Aufbau:**
  - `index.html` – Planer mit der Übersicht (Startseite der App)
  - `schule/`, `pause/` – Bereiche des Planers
  - `training/` – Training, darin `mobility/`, `atmung/`, `bahnplan/`
  - `bibel/` – Elberfelder Bibel 1905 (`elb1905.json`)
- **Installieren:** In Chrome auf Android ⋮ → „App installieren“.
