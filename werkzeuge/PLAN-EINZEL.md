# Plan: jede App als echte Einzel-App neu gestalten (Wunsch vom 01.11.2026)

**Jede Sitzung liest zuerst diese Datei und macht beim ersten offenen Punkt weiter.** Erledigtes abhaken (`[x]`),
Fehler mit Ursache/Lösung in `VERLAUF.md`. Immer nur **eine App gleichzeitig**; jede App endet mit einem Release,
das der Nutzer auf dem Handy prüft, bevor die nächste beginnt.
**Vorschau = echter App-Code:** https://sportgermany.github.io/planer/vorschau/ (Handyrahmen, App-Wahl; auf dem Handy direkt
`/planer/<start>?app=<app>`). Dieselben Dateien wie die APK – was der Nutzer dort sieht und anmerkt, ist 1:1 die App.
Technik: iframe `name="sgapp:<app>"` bzw. `?app=` → design.js setzt `SGApp`/`SGOhne`, `SGRahmen` = Rahmen gilt als eigenständig;
die Vorschau reicht `top.SGShell/SharedCalendar/…` an die gezeigte App weiter. `vorschau/` kommt nicht in die APK (www.js SKIP).
Änderungen gehen auf `main` **ohne** Versionssprung (Pages zeigt sie, keine APK) – erst nach Freigabe Version erhöhen → APK.

## Wunsch des Nutzers
- Die Apps wurden aus der großen App „herauskopiert“ – Designs schief, Synchronisation nur mittelmäßig.
- Jede App einzeln ansehen, Design und Funktionen **auf Einzel-App zuschneiden**, fürs Handy optimieren:
  Symbole sauber, alle Knöpfe gerade, nichts unter der Leiste versteckt.
- Erst die Vorschau (Smartphone-Ansicht) zeigen, dann App für App umsetzen.

## Ist-Befund (Bildschirmfotos 412×915, APK-Bau, 01.11.)
| App | Befund |
|---|---|
| Planer | Leiste zeigt noch **Training** und **Schule** – öffnen nur den Hinweis „ist jetzt eine eigene App“. „Mehr“ hat noch Bibel, Sportwissenschaft, Pause als Bereiche. Apps sind nicht als Apps erkennbar. |
| Training | **6 Reiter** (Heute, Kalender, Training, Analyse, Fitness, Einst.) – zu eng, Einstellungen gehören nicht in die Leiste. Analyse und Fitness doppeln sich (Woche, Serie, Rekorde). Inhalt verschwindet unter der Leiste, Plus-Knopf überdeckt Karten. Eigener Kartenstil (orange Knöpfe) statt gemeinsamem Design. |
| Schule | **5 Reiter**; „Lehrgang“ als eigener Reiter für eine Erklärkarte. Kalender-Filter brechen in zwei Zeilen um („Fehlzeiten“). Schnellknöpfe mit Emojis, Plus-Knopf und Leiste überdecken „Nächste Prüfungen“. Kopf-Symbol rechts ohne Erklärung. |
| Bibel | Leiste mit **Emojis** (📖📚⭐⚙️) statt Symbolen. „Mehr“ = Farbwelten-Galerie mit Text „gilt für alle Apps (Planer, Training, Bibel)“. Schrift gemischt (Serif + Sans). Untertitel bricht unsauber um. Inhalt unter der Leiste. |
| alle | Jede App hat eigene Kopfzeile, Leiste, Karten, Abstände. Kein gemeinsamer Abstand zur Leiste. Sync: Termine zwischen den Apps nur über Google-Kalender, Rückweg dauert, Status (erledigt) kommt teils nicht an. |

## Gemeinsame Basis (gilt für alle vier Apps, liegt in `werkzeuge/quellen/`)
- **Kopf**: Titel links (22 px), Untertitel einzeilig, höchstens 2 Symbolknöpfe rechts (48 px Tippfläche).
- **Untere Leiste**: genau **4 Reiter**, Material-3-Leiste (80 px), Liniensymbole, aktive Pille hinter dem Symbol, Beschriftung immer sichtbar.
  Inhalt bekommt unten automatisch Platz (Leiste + Plus-Knopf), nichts verschwindet darunter.
- **Plus-Knopf**: rechts über der Leiste, 56 px, nie über Inhalt, der noch bedient werden muss.
- **Karten**: Radius 16, Abstand 12, Innenabstand 16; Listenzeilen ≥ 56 px mit Symbol (40 px) links, Pfeil rechts.
- **Knöpfe**: eine Hauptaktion je Karte (gefüllt), sonst Tonal/Umriss; alle gleich hoch (40 px, Tippfläche 48).
- **Symbole**: ein Liniensymbol-Satz für alle Apps, keine Emojis in Bedienelementen.
- **Farbe je App** (Akzent auf gemeinsamer dunkler/heller Fläche): Planer Violett, Training Grün, Schule Blau, Bibel Bernstein.
- **App-Info**: Abschnitt „App“ (Version, „Version aktualisieren“, „Planer öffnen“) in den Einstellungen jeder App, gleich aufgebaut.

## Schritte
- [x] **Vorschau** – /planer/vorschau/ mit echtem App-Code (01.11.).
- [ ] **0 Basis** – Bausteine in `design.js`/gemeinsamer CSS (Kopf, Leiste mit 4 Reitern, Karten, Zeilen, Knöpfe, Symbolsatz,
  Platz unter der Leiste). Test: Messung „nichts unter der Leiste“, „Leiste 4 Reiter“, „keine Emojis in Knöpfen“ je App.
- [ ] **1 Planer** – Leiste: Heute · Kalender · Aufgaben · Mehr. Apps (Training, Schule, Bibel) als App-Kacheln mit „Öffnen“ bzw.
  „Installieren“; Sportwissenschaft gehört zu Training; Pause bleibt unverändert unter Mehr. Sync-Check: Termine anderer Apps
  erscheinen, „erledigt“ kommt an, Zielkalender klar erklärt. Release Planer 6.0.0.
- [ ] **2 Training** – Leiste: Heute · Training · Fortschritt · Kalender. Analyse + Fitness zu „Fortschritt“ zusammen (nichts
  löschen, nur umordnen), Einstellungen über Zahnrad im Kopf. Gemeinsame Karten/Knöpfe statt Eigenstil, Mobility inhaltlich
  unverändert. Sync-Check: „✓ erledigt“ im Planer, geplante Trainings aus dem Planer. Release Training 2.0.0.
- [ ] **3 Schule** – Leiste: Heute · Stundenplan · Aufgaben · Kalender. Lehrgänge in den Kalender (Unterreiter), Prüfungen in
  Aufgaben, Filter einzeilig (Wischleiste), Schnellknöpfe mit Symbolen. Sync-Check: Prüfungen/Lernblöcke im Planer und in Google.
  Release Schule 2.0.0.
- [ ] **4 Bibel** – Leiste: Heute · Lesen · Meine Bibel · Mehr, Liniensymbole, eine Schriftlinie (Text Serif, Bedienung Sans).
  „Mehr“: Bibel-Einstellungen (Leseplan, Erinnerung, Schriftgröße, Darstellung kompakt), App-Info. Sync-Check: Lesezeit als
  Termin/erledigt im Planer. Release Bibel 2.0.0.
- [ ] **5 Abschluss** – Sync-Test über alle Apps (Emulator + nachgestellt), Bildschirmfotos Ist/Neu, Bericht.

## Arbeitsweise je App
1. Umbau direkt im App-Code, auf `main` ohne Versionssprung → Nutzer sieht ihn in der Vorschau, gibt frei oder ändert.
2. Umsetzen (Funktionen bleiben, nur Ort/Optik ändern sich; Daten abwärtskompatibel).
3. `node schnell-app.js <app>` + neue Basis-Prüfungen, Bildschirmfotos neu, Emulator auf GitHub, Release.
4. Nutzer testet auf dem Handy, erst dann nächste App.
