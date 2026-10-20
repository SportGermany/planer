# Werkzeugkoffer und Wissen zur App „Planer“

Dieses Dokument ist das Gedächtnis des Projekts. Wer an der App weiterarbeitet (auch Claude in einem neuen Chat),
liest zuerst diese Datei, dann `werkzeuge/VERLAUF.md`. Alles Nötige liegt im Repository – nichts nur im Kopf oder in
einem temporären Ordner.

## 1. Was die App ist

- Eine einzige Web-App (PWA) unter **https://sportgermany.github.io/planer/**, Repository `SportGermany/planer`, Branch `main`
  (GitHub Pages: Settings → Pages → `main` / root).
- Nutzer: U18-Kaderathlet im Rennrodeln, Schüler (Realschule Bayern). Benutzt die App installiert in Chrome auf Android
  (Samsung-Handy und -Tablet). Sprache überall Deutsch.
- Sicherung aller früheren Einzel-Repositorys: `SportGermany/sicherung` (Ordner je Repo, Branches `alt/<Repo>/main|claude`, Mirror-ZIP).

## 2. Feste Vorgaben (immer einhalten)

1. **100 % offline.** Jede Funktion, jedes Textfeld muss ohne Netz laufen. Inhalte (Bibeltext, Buch, Bilder) stecken in der App.
   Netz nur für Zusätze (Cloud-Sicherung über GitHub-Gist, Wetter, Wikipedia-Bilder im Bahnplan).
2. **Eine App, nichts springt heraus.** Alles bleibt unter `/planer/` (Scope der PWA). Keine Links in andere Repos.
3. **Bestehende Funktionen nicht entfernen**, nur umordnen/verbessern – außer der Nutzer sagt es ausdrücklich.
4. **Bahnplan:** keine eigenen Zeichnungen von Bahnen, nur Wikipedia-Bilder (als PNG) oder gar kein Bild.
5. **Einheitliches Design** (eine Navigation, gleiche Karten, Knöpfe, Abstände), Android-gerecht, dunkel.
6. Vor größeren Umbauen: Plan machen, dann abarbeiten; danach Test-Suiten bis alles grün ist, dann Offline-Test.
7. Fragen stellen, wenn etwas unklar ist. Versionsnummer bei jeder Veröffentlichung erhöhen.
8. Kein Modellname in Commits/Code. Commits enden mit den Co-Authored-By-/Session-Zeilen, die der Chat vorgibt.

## 3. Aufbau

```
planer/
  app/            Hülle: Navigation (Kalender · Training · Mobility · Schule · Mehr), Kalender, Notizen, Mehr  ← Startseite (manifest start_url)
  index.html      Planer (Aufgaben; früherer Kalender, Heute-Briefing) – in der Hülle als „Aufgaben“ eingebettet
  schule/         Lernplan (Stundenplan, Hausaufgaben, Prüfungen, Lernplan, Ferien)
  pause/          Denkpause (Ablenken, Wissen, Quiz)
  training/       Training (Heute, Laufen & Kraft, Fitness, Analyse, Einstellungen); darin:
    mobility/     Rodel-Mobility (Tagesblock A/B/C, Wettkampf, Übungen, Fortschritt)
    atmung/       Pulsplan: Atmung & HRV (Heute, Üben/HRV-Messung mit Polar H10, Woche, Verlauf, 12-Wochen-Plan)
    bahnplan/     Kurvenbuch für Rodelbahnen (Bahnen, Plan, Läufe, Druck)
  bibel/          Elberfelder 1905 (elb1905.json), Leseplan, Favoriten, Notizen
  wissen/         Sportwissenschaft (Lehrbuch aus buch.md, Karteikarten, Quiz, Suche)
  sg/             gemeinsame Skripte, ERZEUGT von werkzeuge/build.py (nicht von Hand ändern!)
  */js/           Skripte der einzelnen Seiten (Quelle; von Hand änderbar)
  sw.js           Service Worker (Version + Dateiliste werden vom Build gesetzt)
  manifest.json   PWA (id "./", scope "./", start_url "./app/")
  werkzeuge/      dieser Werkzeugkoffer
```

### Die Hülle (`app/`)
- `app/index.html` (Aussehen) und `app/js/1-app.js` (Logik). Fünf Ziele unten (Tablet ≥ 900 px: Leiste links).
- Bereiche = die bisherigen Seiten als `<iframe>` (bleiben geladen → sofortiger Wechsel). Tabelle `V` in `1-app.js`:
  je Ziel `secs` (Chips) mit `p` (Seite), `h` (Sprungadresse der Seite), `s`+`sel` (Knopf in der ausgeblendeten Leiste der Seite)
  und `kids` (zweite Chip-Reihe).
- Adressen der Hülle: `#kalender`, `#training/rodeln/plan`, `#mobility/atmung/hrv`, `#schule/plan`, `#mehr`, `#bibel/lesen`,
  `#notizen`, `#aufgaben`, `#pause`, `#tset`, `#u=<alte Adresse>`.
- `window.SGShell = { openUrl, openApp, openModule, go }` – die eingebetteten Seiten springen darüber (statt Seitenwechsel).
- Eingebettete Seiten erkennen die Hülle an `html.sg-dir` im Elternfenster (`DIRPARENT` in design.js) und blenden ihre eigene
  Leiste aus (`GLASS_NAV`) plus `SHELLHIDE`.
- Die Hülle registriert den Service Worker (`../sw.js`, Scope `/planer/`) – sonst wäre ein neues Gerät nicht offline-fähig.

### Gemeinsame Skripte (Quellen in `werkzeuge/quellen/`, Build kopiert nach `sg/`)
- `design.js` (im `<head>` jeder Seite): Weiterleitung in die Hülle (`?einzeln` verhindert sie), 10 Farbwelten (`sg-design`),
  Schrift Inter, Ausblenden doppelter Leisten, Korrektur alter Adressen (`SGFixUrl`), Linkabfang in der Hülle,
  `SGVersion`, „Version aktualisieren“ (`SGUpdate.check/install`).
- `verbund.js` (`window.SharedCalendar`): gemeinsamer Kalender, Aufgaben, Notizen, Erinnerungen, Wochenplanung + Standardwoche,
  Befehlsmenü (Suche), Design- und Sync-Fenster, Cloud-Sicherung (GitHub-Gist). In eingebetteten Seiten ohne Sync/Knopf.
  API u. a.: `allItems(from,to)`, `add/update/remove`, `tasks.*`, `notes.*`, `open(date)`, `newEvent(date)`, `editEvent(id,date)`,
  `weekPlan()`, `weekPlanStd()`, `weekPlanConfig()`, `palette()`, `openDesign()`, `openSync()`, `askNotify()`.
  `newEvent(date, vorgabe)` füllt das Terminblatt vor (title, time, end, remind, rep); das Blatt hat ein Feld Wiederholung.
  `setPalette(fn)` ersetzt die Suche – die Hülle setzt dort ihre Vollbild-Suche ein; `install()`/`installed()` für „App installieren“.
- Suche der Hülle (nur `app/`): `schnell.js` (`SGQuick.parseQuick`, Schnelleingabe in einem Satz), `suche.js` (`SGSuche`:
  norm, score mit Tippfehlern, marks), `bibelstelle.js` (`SGBibelstelle.parse`, „Joh 3,16“ → Buch/Kapitel/Vers),
  `suche-daten.js` (Bahnen, Mobility-/Gym-/Dehnübungen – erzeugt von `quellen/suchdaten.js` beim Build, nicht von Hand ändern).
  Bibel und Sportwissenschaft durchsucht ein Worker aus der Datei `app/js/suche-worker.js` (nie aus blob:).
  Bibelstelle öffnen: `bibel/#stelle=<Buch 0–65>.<Kapitel>.<Vers>`. Verlauf/Zähler: `sg-suche-v1` (nur Gerät: MOVE_SKIP, nicht in DATA).
- `training-suite.js`: Integration im Training (Heute-Karten „Dazu heute“, Module; in der Hülle öffnet `openMod` das Ziel Mobility/Rodeln).
- `install.js`: Installieren-Hinweis der Bibel.

### Daten (alles `localStorage`, gleiche Herkunft sportgermany.github.io)
| Schlüssel | Inhalt |
| --- | --- |
| `sg-shared-calendar-v1` | gemeinsame Termine `{v,events:[{id,title,date,time,end,app,rep,remind,wp,link…}]}` |
| `sg-shared-tasks-v1` | Aufgaben |
| `sg-notizen-v1` | Notizen `{text,at,remind,done}` |
| `sg-wochenplan-v1` | Wochenplanung: Einstellungen, `last`, `std` (Standardwoche), `planned` |
| `sg-shared-calendar-sync` | Cloud-Zugang (Token, Gist-ID) – gerätebezogen, wird nicht hochgeladen |
| `sg-design`, `sg-glass` | Design |
| `sg-app-v1` | Hülle: zuletzt gewählte Unterpunkte |
| `sg-wissen-v1` | Sportwissenschaft: Lesefortschritt, Karten (Box/Fälligkeit), Quizfehler, Verlauf |
| `schulkalender-bayern-v1` | Schule |
| `denkpause.v1` | Pause |
| `wk_*` | Training (Log, Aktivitäten, Einstellungen …) |
| `rodelmobility.v1` | Mobility |
| `pulsplan.v1` | Atmung & HRV |
| `bahnplan.v1` | Bahnplan |
| `zweiminutenbibel_v2` | Bibel |
| `sg-handykalender-v1` | Handykalender: was schon ins Handy übertragen wurde, Optionen (nur dieses Gerät, nicht in der Cloud) |
| `sg-handy-v1` | APK: Handykalender an/aus, Auswahl, Zwischenspeicher der Handytermine |
| `sg-erinnern-v1` | APK: Erinnerungen an/aus, Auswahl |
| `sg-stundenplan-v1` | Schulstunden der nächsten Monate (von der Schul-Seite vorgerechnet) |
| `sg-umzug-v1` | APK: Umzug erledigt bzw. „neu angefangen“ |
| `sg-diag-v1` | Fehlerprotokoll der Hülle (Leiste) |
| Cache `sg-teilen` | kurzzeitig: Geteiltes aus dem Handy (Share Target) |
| `sg-dir-v1` | frühere Übersicht (Version 2.x, nicht mehr benutzt) |

Cloud-Abgleich: Gruppen in `verbund.js` (`DATA`, `EXTRA`), je Gruppe eine Datei `app-<id>.json` im Gist; Termine/Aufgaben/
Notizen eintragsweise zusammengeführt (neuere Änderung gewinnt).

## 4. Arbeiten an der App

### Ablauf einer Änderung
1. Seite ändern: direkt in `<seite>/js/*.js` bzw. `index.html`. Gemeinsames: in `werkzeuge/quellen/` (nie in `sg/`).
2. Version in `werkzeuge/build.py` erhöhen (`VERSION=…`).
3. `python3 werkzeuge/build.py` – baut gemeinsame Skripte in alle Seiten ein, setzt `?v=` an alle Skripte, erzeugt
   `wissen/js/buch.js`, den CSV-Worker und die Dateiliste in `sw.js`.
4. Tests (Abschnitt 5), dann committen und pushen. Nutzer aktualisiert über Mehr › „Version aktualisieren“.

### Handykalender
Gerätekalender ist für Web-Apps gesperrt → Abgleich über .ics/.vcs: `SharedCalendar.phone` (verbund.js: `pending`, `ics`, `markSent`, `parse`, `apply`),
Oberfläche in `app/js/1-app.js` (`phoneSheet`, `importSheet`, `takeShared`), Teilen-Ziel: `manifest.json` `share_target` + POST-Zweig in `sw.js`.

### APK (Android-App)
- Ordner `werkzeuge/apk/`: Capacitor 8 (`package.json`, `capacitor.config.json`), Android-Projekt `android/`, `www.js` kopiert die App nach
  `www/planer/…` (gleiche Pfade wie im Netz, Start `www/index.html` → `/planer/app/`). App-ID `de.sportgermany.planer`, Name „Planer“.
- Bau nur auf GitHub (`.github/workflows/apk.yml`): bei jedem Push auf main, wenn es für die Version aus `sw.js` noch kein Release `v<Version>` gibt.
  Ergebnis: Release mit `planer-<Version>.apk`. Ohne Secret nur Test-APK als Artefakt. Hier im Container fehlt das Android-SDK (dl.google.com gesperrt).
- Signatur: `werkzeuge/apk/planer-schluessel.enc` = PKCS12-Schlüssel (Alias `planer`), verschlüsselt mit `openssl enc -aes-256-cbc -pbkdf2 -iter 200000`;
  Passwort = Secret `APK_PASSWORT` (hat nur der Nutzer). SHA-256 des Zertifikats beginnt mit `0B:E8:95:D8:09:84:3A:B0`. **Nie neu erzeugen** – sonst lassen sich
  Updates nicht mehr über die installierte App installieren.
- `MainActivity.java`: RouteProcessor liefert für Ordner-Adressen (`/planer/app/`) deren `index.html`; dazu `server.html5mode=false`.
- Im Web-Code: `window.SGNative` (design.js) ist in der APK ein Objekt: kein Service Worker, `a[download]`/`a.click()` → `SGNative.save` (Filesystem + Teilen),
  Links nach außen → Browser, `print()` → Hinweis. Update: `SGUpdate` fragt `api.github.com/repos/SportGermany/planer/releases/latest`.
- Ränder: Capacitor setzt `--safe-area-inset-*` (SystemBars `insetsHandling: css`), die Hülle nutzt sie vor `env()`.
- Umzug Chrome → APK: Mehr › „In die Android-App umziehen“ (Umzugsdatei: localStorage + IndexedDB `bahnplan/img`, `lernplan-dateien/files`),
  in der APK beim ersten Start bzw. Mehr › „Daten aus Chrome übernehmen“. Merker `sg-umzug-v1`. `window.SGMove`.
- versionCode = Major·10000 + Minor·100 + Patch (muss steigen).
- **Handykalender (B):** Plugin `PlanerKalenderPlugin.java` (`ensure`, `calendars`, `instances`, `write`, `update`, `remove`, `request`, `status`).
  Eigener lokaler Kalender „Planer“ (Konto-Typ LOCAL, als Sync-Adapter geschrieben), Schlüssel je Eintrag in `SYNC_DATA1` (= `id@datum`), Prüfsumme in `SYNC_DATA2`.
  JS: `SharedCalendar.handy` in verbund.js (`hOut` = was ins Handy geht, `hSync`, Zwischenspeicher `sg-handy-v1`), Handytermine via `phoneItems()` in `externalItems()`
  (app `"Handy"`, `id` `hd-<eventId>-<beginn>`, Feld `phone`). Zeitraum −30 bis +180 Tage. Stundenplan kommt aus `sg-stundenplan-v1`
  (rechnet die Schul-Seite in `publishLessons()` – mit Ferien, Feiertagen, A/B-Woche).
- **Erinnerungen (C):** `SharedCalendar.erinnern` (LocalNotifications), Einstellungen `sg-erinnern-v1`, plant die nächsten 14 Tage (max. 60), IDs ab 9000,
  `extra.go` = Hülle-Adresse zum Öffnen. Symbol `res/drawable/ic_stat_planer.xml`.
- Einrichtung in der APK: Willkommen (Umzug) → „Fast fertig“ (Handykalender + Erinnerungen), Merker `sg-apk-setup`.
- Test: `node werkzeuge/tests/apk.js` (täuscht `window.Capacitor` samt Kalender/Benachrichtigungen vor);
  echte App: `werkzeuge/tests/emulator.js` läuft auf GitHub im Emulator (Job `emulator`, Bildschirmfotos als Artefakt `emulator-ergebnis`).
  Release wird erst nach bestandenem Emulator-Test veröffentlicht.

### Sportwissenschaft aktualisieren
Das Buch ist ein Claude-Doc („Sportwissenschaft für Rennrodler“, https://claude.ai/artifact/5nhNSLmBbqpxQD1ndpYutj).
Neu exportieren (Docs-Export als Markdown) → `wissen/buch.md` ersetzen → Build. Quizfragen und Merksatz-Fragen:
`werkzeuge/quellen/wissen_quiz.py` (Anzahl Merksatz-Fragen muss zu den Merksätzen passen, sonst bricht der Generator ab).

## 5. Tests

```
cd werkzeuge/tests && npm install          # Playwright (Browser: SG_CHROME, Standard /opt/pw-browsers/…)
cd <Ordner über planer> && python3 -m http.server 8765 &      # App unter http://localhost:8765/planer/
node werkzeuge/tests/suite3.js [Filter]   # Gesamt-Suite (Stand 3.2.0: 47 Tests)
node werkzeuge/tests/offline3.js          # Offline wie installiert: einmal online, Server aus, alles prüfen (42 Prüfungen)
node werkzeuge/tests/bahnplan-1.js / bahnplan-2.js   # Bahnplan (ERR_FAILED-Meldungen = absichtlich gesperrte Wikipedia)
node werkzeuge/tests/upd.js               # echter Update-Weg in der Hülle (baut kurz 9.9.8, danach wieder zurück)
node werkzeuge/tests/schnell.js           # Schnelleingabe parseQuick (ohne Browser)
node werkzeuge/tests/suche-kern.js        # Such-Kern und Bibelstellen (ohne Browser)
node werkzeuge/tests/inventar.js datei.json   # Bestandsaufnahme aller Seiten, Menüs, Befehle; --vergleich a b
```
`seed.js` füllt Testdaten (Schule, Mobility, Atmung, Training, Termine).

### Stolperfallen (aus Erfahrung)
- Server für den Offline-Test **per PID beenden** (`pgrep -f "^python3 -m http.server 8765"`), nie `pkill -f` – das trifft die eigene Shell.
- Playwright `setOffline` stört Service-Worker-Navigationen → für echte Offline-Tests den Server abschalten.
- `page.goto` auf dieselbe Adresse mit anderem `#` liefert `null` (keine Antwort) – `reload()` benutzen.
- Lange Testläufe mit `| grep` puffern die Ausgabe; in eine Datei schreiben.
- `scrollIntoView` in der Hülle verschiebt die ganze Seite → nur Container scrollen.
- Grid-Spalten in der Hülle immer `minmax(0,1fr)`, sonst machen Chip-Reihen das Layout breiter als den Bildschirm.
- Unsichtbare, verschobene Elemente fangen Tipps ab → im Ruhezustand `pointer-events:none`.
- Debounce beim Speichern kann Daten verlieren, wenn Android die App beendet → wichtige Aktionen sofort speichern.
- GitHub: Repos anlegen/löschen kann Claude nicht (403) – der Nutzer macht das.
- Design der Bereiche nicht pro Seite ändern, sondern in `unifyCSS` (design.js) – gilt in der Hülle für alle gleich.
- Hülle: kein `100dvh`, sondern `position:fixed;inset:0`. Alles, was der Verbund unten einblendet, nutzt `--sg-toast-bottom` (über der Leiste).
- Fest positionierte Behälter bilden eine eigene Ebene – `#sg-shared-calendar` braucht deshalb den höchsten z-index.
- Fehlerprotokoll der Hülle: `SGShellDiag()` in der Konsole bzw. `localStorage['sg-diag-v1']`.
- Pillen/Knöpfe aus `<span>`: immer `display:inline-flex;align-items:center`, sonst sitzt der Text oben.
- Neue Werkzeug-Ordner nie in den Offline-Speicher: `build.py` überspringt `werkzeuge/` (sonst landete die APK-Kopie in `sw.js`).
- Inhalte von Seiten mit CSP `worker-src 'self'`: Worker nur aus Dateien, nicht aus `blob:`.

## 6. Wo die Geschichte steht
- `werkzeuge/VERLAUF.md`: Versionen, Wünsche des Nutzers, gefundene Fehler und ihre Ursachen.
- `git log`: jede Änderung mit Begründung.
- `werkzeuge/archiv/`: abgelöste Teile (z. B. Übersicht aus 2.x).
