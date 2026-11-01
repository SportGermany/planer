# Plan: Neuaufbau der Einzel-Apps (Wunsch vom 01.11.2026)

**Jede Sitzung liest zuerst diese Datei und macht beim ersten offenen Punkt weiter.** Erledigtes abhaken (`[x]`),
Fehler mit Ursache/Lösung in `VERLAUF.md`. Immer nur **eine App gleichzeitig**.

**Vorschau = echter App-Code:** https://sportgermany.github.io/planer/vorschau/ (Handyrahmen, App-Wahl; auf dem Handy direkt
`/planer/<start>?app=<app>`). Dieselben Dateien wie die APK – was der Nutzer dort sieht und anmerkt, ist 1:1 die App.
Technik: iframe `name="sgapp:<app>"` bzw. `?app=` → design.js setzt `SGApp`/`SGOhne`, `SGRahmen` = Rahmen gilt als eigenständig;
die Vorschau reicht `top.SGShell/SharedCalendar/…` an die gezeigte App weiter. `vorschau/` kommt nicht in die APK (www.js SKIP).
Änderungen gehen auf `main` **ohne** Versionssprung (Pages zeigt sie, keine APK) – erst nach Freigabe Version erhöhen → APK.

## Wunsch des Nutzers (01.11., zweite Runde)
- Nach dem „Generalumsturz“ jede App **neu strukturieren**: nur behalten, was für diese App noch relevant ist
  (z. B. Planer: die Listen/Bereiche von Training, Schule, Bibel raus). Menüs dürfen wegfallen oder sich ändern.
- **Bibel zuerst** – wieder klar strukturiert.
- **Cloud-Speicherung in allen Apps gleich gut**, ein gemeinsamer Abgleich; Verbindung zwischen den Apps verbessern.
- **Design in allen Apps weitgehend gleich** (angepasst an die Funktionen), gemeinsame Bausteine.
- **Code schneller**, Ansicht übersichtlicher, schöner. Dateien klar strukturiert, gut verständlich.
- Funktionen nicht stillschweigend verlieren: was wegfällt, steht unten in „entfällt“ und im VERLAUF; Daten bleiben lesbar.

## Ist-Befund
| Thema | Befund (01.11.) |
|---|---|
| Cloud | **Bibel: keine Cloud** (Text sagt sogar „keine Cloud“). **Schule:** eigener GitHub-Repo-Abgleich (Lernplan) + Verbund-Gist. **Training:** eigener „Cloud-Sync“ (8-github.js) + Verbund-Gist. **Planer:** Verbund-Gist über *alle* Datengruppen. Token muss je App einzeln eingegeben werden. Jede App gleicht auch fremde Datengruppen ab (unnötig, langsam). |
| Design | Jede App eigene Kopfzeile, Leiste, Karten, Knöpfe; Bibel Emojis in der Leiste; Training orange Eigenstil; Inhalt unter der Leiste. |
| Planer | Leiste zeigt Training/Schule (nur Hinweis „eigene App“). Hülle trägt noch alle Bereichs-Tabellen (`V`), Suchdaten (Bahnen, Übungen, Schulfächer), alte Seite `/planer/` (js/1-app.js, 100 KB) für „Aufgaben“. |
| Training | 6 Reiter, Analyse/Fitness doppelt, 1,1 MB JS – alles beim Start geladen. |
| Schule | 5 Reiter, Lehrgang als eigener Reiter, Kalender doppelt zum Planer. |
| Bibel | Heute überladen (4 Umschaltreihen für Einstellungen, die man einmal setzt), „Mehr“ = Farbwelten-Galerie + PWA-Installation (in der APK sinnlos). |

## Ziel-Architektur (gilt für alle Apps)
**Gemeinsame Bausteine** in `werkzeuge/quellen/` (build.py → `sg/`):
- `design.js` – Farbwelt, Material-You-Grundflächen, **App-Rahmen**: Kopf (Titel + max. 2 Symbole), untere Leiste mit **4 Reitern**
  (Liniensymbole aus einem gemeinsamen Symbolsatz), Plus-Knopf, Platz unter der Leiste, Karten/Zeilen/Knöpfe als CSS-Klassen
  (`sg-card`, `sg-row`, `sg-btn`, `sg-seg`), Blatt (Bottom-Sheet). Jede App nutzt diese Klassen statt eigener Kopien.
- **Ein Einstellungs-Baukasten** (gleich in jeder App, unten in den Einstellungen): **Cloud** · **Farbwelt** · **App** (Version,
  Version aktualisieren, Planer öffnen) · **Daten** (Datei sichern/laden). Gleiche Texte, gleiche Optik.
- **Ein Cloud-Abgleich** (`verbund.js`, privater GitHub-Gist, eine Datei je Datengruppe):
  - jede App gleicht **nur ihre eigenen** Datengruppen + `einstellungen` (Farbwelt) + `kalender` ab → schneller, keine fremden Daten;
  - Bibel bekommt Datengruppe `bibel` (`zweiminutenbibel_v2`);
  - **Token einmal**: Planer gibt ihn beim Öffnen einer App mit (Übergabe), jede App kann ihn auch selbst eintragen; Status
    „zuletzt abgeglichen“ sichtbar; Abgleich beim Öffnen, nach Änderung (verzögert) und beim Verlassen;
  - eigene Alt-Syncs (Schule-Repo, Training 8-github) bleiben lesbar, werden aber nicht mehr angeboten, sobald der gemeinsame läuft
    (Einstellung wird übernommen, kein doppeltes Schreiben).
- **Verbindung der Apps**: Termine über den Handy-/Google-Kalender (wie jetzt) + gemeinsame Gist-Datei `kalender`;
  Springen per Android-Link/`openApp`; eine Liste der Apps an einer Stelle (`apps.json` → `design.js`).
- **Schneller**: jede App lädt nur ihre Skripte; selten Genutztes (Statistik, Import, Rückblick, Suchdaten) erst bei Bedarf.

## Schritte
- [x] **Vorschau** – /planer/vorschau/ mit echtem App-Code (01.11.).
- [ ] **0 Basis** – App-Rahmen + Bausteine in `design.js`, Symbolsatz, Einstellungs-Baukasten, Cloud nur eigene Gruppen,
  Bibel-Datengruppe, Token-Übergabe. Tests: „nichts unter der Leiste“, „4 Reiter“, „keine Emojis in Bedienelementen“,
  „Cloud gleicht nur eigene Gruppen ab“ (je App, schnell-app).
- [x] **0b Selbsttest in jeder App** (01.11.; Cloud-Datei `selbsttest-<app>.json` folgt mit dem Cloud-Schritt) (Wunsch 01.11.: „automatischer Fehlerfinder auf meinem Handy“) – gemeinsames Modul
  `werkzeuge/quellen/selbsttest.js` (→ `sg/`), Einstellungen › „Selbsttest“ in jeder App:
  - prüft auf dem echten Gerät **alles**: jeder Reiter/jede Ansicht öffnet ohne Fehler, Knöpfe bedienbar (Größe ≥ 44 px, nicht
    verdeckt, nicht unter der Leiste), kein seitliches Überlaufen, Speicher lesen/schreiben, Cloud erreichbar + Token gültig,
    Android-Teile (Kalenderrecht, Handykalender, Benachrichtigungen, Widget, Übergabe an/aus Planer), Update-Prüfung, offline;
  - misst **Leistung**: Startzeit, Wechselzeit je Reiter, lange Aufgaben (> 50 ms), Speicherbedarf, Bildwiederholung beim Scrollen;
  - jede App meldet eigene Prüfungen an (`SGSelbsttest.add(name, fn)`), z. B. Bibel: Abschnitt öffnen, Suche „Joh 3,16“, Favorit
    setzen/entfernen; Training: Plan, Mobility, Atmung öffnen; Schule: Stundenplan, Aufgabe anlegen/löschen (Testdaten werden danach
    wieder entfernt – Nutzerdaten bleiben unverändert);
  - **Bericht**: ✓ klappt · ⚠ langsam/auffällig · ✗ geht nicht – mit Details, Gerät (Modell, Android, WebView, Bildschirm),
    App-Version; Knöpfe „Teilen“ (Android-Teilen → in den Chat einfügen), „Kopieren“, „Als Datei speichern“; zusätzlich in der
    Cloud-Datei `selbsttest-<app>.json`, falls die Cloud eingerichtet ist;
  - derselbe Selbsttest läuft in `schnell-app.js` und im Emulator mit → gleiche Prüfungen lokal, auf GitHub und auf dem Handy.
- [~] **1 Bibel** (Bibel 2.0.0) – Aufbau + Design fertig in der Vorschau (01.11., Nutzerin: „sehr gut“); offen: Cloud, Selbsttest
  - Reiter: **Heute · Lesen · Meine Bibel · Einstellungen**.
  - Heute: Lesekarte (nächster Abschnitt, „Heute lesen“), Serie kompakt (Zahl + 14-Tage-Leiste), Vers des Tages.
  - Lesen: Suche (Wort oder Stelle) + Bücher AT/NT aufklappbar + Fortschritt.
  - Meine Bibel: Favoriten · Notizen · Verlauf (Wischleiste), Zufallsvers als Symbolknopf.
  - Einstellungen: **Leseplan** (Testament, Plan, Reihenfolge, Tagesziel – bisher 4 Reihen auf „Heute“), **Lesen** (Hell/Dunkel/
    Sepia/Nacht, Auto-Nacht, Schriftgröße, Schriftart), **Erinnerung**, Statistik kompakt, Baukasten (Cloud, Farbwelt, App, Daten).
  - entfällt: Farbwelten-Galerie (→ eine Zeile „Farbwelt“), „Als App installieren“ (PWA, in der APK sinnlos), langer Über-Text
    (→ kurz, ohne falsches „keine Cloud“).
- [~] **2 Planer** (Planer 6.0.0) – Leiste/Mehr fertig in der Vorschau; offen: Cloud, Selbsttest, Code ausdünnen
  - Reiter: **Heute · Kalender · Aufgaben · Mehr**; Mehr: **Deine Apps** (Kacheln Öffnen/Installieren), Notizen, Woche planen,
    Pause (unverändert), Kalender verbinden, Baukasten.
  - entfällt in der Planer-APK: Bereichs-Tabellen und Suchdaten von Training/Schule/Bibel, alte Seite `/planer/` für Aufgaben
    (Aufgaben nativ in der Hülle), Vorladen.
- [~] **3 Schule** (Schule 2.0.0) – Leiste/Lehrgänge fertig in der Vorschau; offen: Cloud, Selbsttest – Reiter: **Heute · Stundenplan · Aufgaben · Kalender**; Lehrgänge im Kalender, Prüfungen in
  Aufgaben, Filter als Wischleiste, Schnellknöpfe mit Symbolen; eigener Repo-Sync → gemeinsamer Cloud-Abgleich (Ablage-Dateien
  bleiben lokal + Datei-Sicherung).
- [~] **4 Training** (Training 2.0.0) – Leiste/Fortschritt/Zahnrad fertig in der Vorschau; offen: Cloud, Selbsttest, Skripte nach Bedarf – Reiter: **Heute · Training · Fortschritt · Kalender**, Einstellungen über Zahnrad;
  Analyse + Fitness → Fortschritt; gemeinsame Karten/Knöpfe; Mobility/Atmung inhaltlich unverändert; Skripte nach Bedarf laden;
  8-github-Sync → gemeinsamer Cloud-Abgleich.
- [ ] **6 Neue Funktionen** (Auswahl der Nutzerin, 01.11.) – je Funktion: Vorschau-Push, Selbsttest-Prüfung, VERLAUF.
  - Planer (alle 5 in der Vorschau, 01.11.): [x] wiederkehrende Aufgaben (täglich/wöchentlich/monatlich) · [x] aus anderen Apps teilen → Termin/Aufgabe
    (Text mit „morgen 17 Uhr“ über SGSchnell erkennen; heute endet geteilter Text in „Nichts gefunden“) · [x] Abend-Rückblick
    (erledigt/offen, offen mit einem Tipp auf morgen) · [x] freie Zeit finden (Lücken zwischen Schule/Training/Terminen, Aufgabe
    hineinlegen) · [x] neue Termine direkt in den Google-Kalender (Zielkalender beim Anlegen, Standard = gewählter Google-Kalender).
  - Bibel: [ ] Lesepläne (Bibel in 1 Jahr, NT in 90 Tagen, Psalmen & Sprüche, Evangelien) mit Fortschritt, Tagesabschnitt auf „Heute“.
  - Schule: [ ] Lernkarten je Fach (Wiederholung 1/3/7 Tage, aus Prüfungsthemen) · [ ] Dateien (PDF, Fotos) direkt an Aufgaben,
    Prüfungen und Fächer hängen (Ablage-Speicher mitnutzen).
  - Training: [ ] Wettkampf-Countdown (Wettkampf eintragen, Countdown auf Heute, Tapering der letzten Tage, Checkliste Wettkampftag).
- [ ] **7 Code schneller** – je App nur ihre Skripte; Selten-Genutztes nach Bedarf laden; Altlasten (alte Hülle-Teile, PWA, Wechsler)
  aus den Einzel-APKs; Ladezeit vorher/nachher messen (Selbsttest „Start“).
- [ ] **5 Abschluss** – Sync-Test über alle Apps (zwei Geräte nachgestellt + Emulator), Ladezeiten vorher/nachher, Bericht.

## Arbeitsweise je App
1. Umbau direkt im App-Code, auf `main` ohne Versionssprung → Nutzer sieht ihn in der Vorschau, gibt frei oder ändert.
2. Funktionen bleiben erreichbar (nur Ort/Optik ändern sich) – Ausnahme: Liste „entfällt“; Daten abwärtskompatibel.
3. `node schnell-app.js <app>` + Basis-Prüfungen, Bildschirmfotos, Emulator auf GitHub, Release nach Freigabe.
