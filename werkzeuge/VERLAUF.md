# Verlauf: Versionen, Wünsche, Fehler

Neue Einträge oben anfügen. Jeder gefundene Fehler kommt mit **Ursache** und **Lösung** hier hinein – auch kleine.
So geht nichts verloren, wenn ein Chat voll ist.

---

## 4.0.0 (in Arbeit) – Umbau nach `werkzeuge/UMBAU-4.md`

Auftrag des Nutzers als Claude-Doc, im Repo gesichert als `werkzeuge/UMBAU-4.md` (10 Phasen, Abnahme in Abschnitt 12).
Entscheidungen: alle Standardwerte aus Abschnitt 2 übernommen (keine Rückfragen nötig): Laufen und Kraft getrennt ·
Mobility behält Chips (Feld `nav` in V) · Tipp auf Tag wählt ihn und scrollt nach oben, langer Druck = Neu · Bibel/Pause mit Seitenmenü ·
Seitenmenü nur über Symbol/Pfadzeile/erneuten Tab-Tipp (kein Randwischen) · Tablet ≥ 900 px Seitenmenü als feste Spalte · Zielversion 4.0.0.

### Phase 0 – Vorbereitung (erledigt)
- `werkzeuge/tests/inventar.js` erstellt; `inventar-vorher.json`: 41 Seiten, 41 Menüpunkte (Chips), 44 Befehle, 12 Mehr-Einträge.
  Vergleich später: `node werkzeuge/tests/inventar.js --vergleich werkzeuge/tests/inventar-vorher.json werkzeuge/tests/inventar-nachher.json`.
- Ausgangstests grün: suite3 48/48, offline3 44/44, apk.js, upd.js, bahnplan-1, bahnplan-2.

| Fehler | Ursache | Lösung |
| --- | --- | --- |
| bahnplan-1/-2 liefen nicht | Pfade relativ zum Arbeitsordner (`seed.js`, `fakemap.png`), Seite wurde in die Hülle umgeleitet | `__dirname`/Temp-Ordner, Seiten mit `?einzeln` öffnen |

### Phase 1 – Kalender-Startseite (erledigt, Version 3.6.0)
Plan: `app/js/1-app.js` (renderCal → renderStrip/renderDay/renderMonth/renderGlance/renderNext, calData, bindMonth), CSS in `app/index.html`,
Ferien/Feiertage über `sg-stundenplan-v1.f` (Schul-Seite `publishLessons()`), Tests „K …“ in suite3.js.
Umsetzung wie Abschnitt 4. Schalter Woche/Monat entfällt (der Monat steht als großer Kalender darunter).

Prüf-Agent (unabhängig) fand, alles behoben und mit Test belegt („K Prüfbefunde Phase 1 …“):

| Befund | Ursache | Lösung |
| --- | --- | --- |
| F1 tägliche Serien fehlen in fernen Monaten | `occurrences()` rollte höchstens 800 Schritte aus; Abfrage reichte von der Wochenleiste bis zum weit geblätterten Raster | Schleife bis Zeitraumende; getrennte Abfragen für Leiste/Danach und Raster |
| F2 Blatt „Neu“ schließt beim Loslassen nach langem Druck | Loslassen erzeugt einen Klick auf den Blatt-Hintergrund | `touchend` nach langem Druck `preventDefault`; Blatt ignoriert Hintergrund-Tipps 450 ms nach dem Öffnen |
| F3 Doppeltipp wählt falschen Tag | zweiter Tipp trifft, was beim Hochscrollen darunter gleitet | während der Scroll-Animation (≈300 ms) keine Tipps im Kalender |
| S1 überfällige Aufgaben fehlen in Punkt/Zählung von heute | Leiste/Raster zählten nur genau fällige | `openTasks()` wie im Tagesplan |
| S2 Kontrast < 4,5 (Nachbarmonat, KW) | Deckkraft .42 / `--faint` | `--muted`; Test prüft beides |
| S3 Monatskopf ohne Monatsnamen für Screenreader | aria-label überschrieb Text | „Oktober 2026, Monat und Jahr wählen“ |
| S4 kein Wechsel Balken/Zeilen beim Drehen | Breite nur beim Zeichnen | `resize` zeichnet bei Grenzwechsel neu |
| S5 Uhrzeit unmaskiert im HTML | `e.time` ohne `esc()` | maskiert |
| S6 nach Mitternacht „Gestern“ | kein Tageswechsel bei offener App | `dayRoll()` alle 30 s und beim Zurückkehren (bewusst gewählter Tag bleibt) |
| S7 Text-Knöpfe 28 px | | 48 px Antippfläche |
| S8 ungleich hohe Zellen bei vielen Einträgen | `min-height` | feste Höhe 70 px, „+N“ oben rechts |
| S9 Titel bei 130 % stark gekürzt | einzeilig | zweizeilig |
| H1/H2/H7 ohne Titel leer, „Danach“ ohne …, „Zum Monat“ mittig | | „(ohne Titel)“, Textelement mit Ellipse, Knopf links |
| (eigener Fund) fehlende Symbol-Dateien Pause/Mobility/Atmung/Bahnplan → 404 | alte Verweise | auf gemeinsame Symbole; Tests scheitern jetzt auch an Konsolenfehlern |

Offen/notiert: H5 „Starten“ ist ein `span` im Zeilenknopf (für Screenreader nicht einzeln bedienbar, schon vorher so) – Querschnitt Phase 8.
Tests: suite3 53/53, offline3 44/44, apk, upd, bahnplan-1/-2, schnell 68/68 grün.


### Phase 2 – Seitenmenü statt Chips (erledigt)
Plan: Baustein in `app/js/1-app.js` + `app/index.html`, gespeist aus `V` (neues Feld `nav`: "drawer" für Training, Schule,
Bibel, Pause; "chips" für Mobility). Adressen, `apply()`, `sg-app-v1` bleiben. Training: „Laufen & Kraft“ wird zu
zwei Einträgen „Laufen“ (#lauf) und „Kraft“ (#kraft) – Ausschnitte derselben Seite über `data-part` an `#s-lauf`
(CSS blendet per `data-sec` aus, nichts kopiert, #lauf bleibt gültig).

Umgesetzt:
- Kopf: Menü-Symbol (44 px) links, Titel, darunter Pfadzeile („Rodeln · Kurvenbuch“, Tipp öffnet). Zurück-Pfeil bei
  Unterseiten von „Mehr“ ganz links, Symbol daneben.
- Seitenmenü: min(86 %, 320 px), Einträge 56 px, aktive Pille in Bereichsfarbe, Untereinträge klappen (nur einer),
  Ende: „Training einstellen“ / „Zurück zu Mehr“. Öffnen: Symbol, Pfadzeile, zweiter Tipp auf aktiven Tab.
  Schließen: Hintergrund, Eintrag, Wischen nach links, Escape, Android-Zurück (eigener Verlaufseintrag; Navigation
  erst nachdem der Eintrag weg ist – sonst landet sie im falschen Verlaufseintrag). Kein Öffnen vom Bildrand.
- Tablet ab 900 px: feste Spalte 260 px neben der Leiste, Symbol entfällt.
- `apply()`: gleiche Adresse löst in der Seite jetzt trotzdem `hashchange` aus.

Fehler und Ursachen:
| Fehler | Ursache | Lösung |
|---|---|---|
| Kraft zeigte alles | `training-suite.js` behandelt Sprungadressen selbst, löscht die Adresse und klickt den Tab (vor `10-app.js`) | #kraft auch dort, setzt `data-part` |
| Menü bei Schrift 130 % breiter als Bildschirm (Test mit CSS-Zoom) | `86vw` wird mitgezoomt | `86%` vom festen Behälter |
| Emulator-Lauf 3.6.0 abgebrochen | Android-Speicherverwaltung (lmkd) beendete erst Google-Dienste, dann die App, nach dem 10. Bereich – kein Fehler der App im Protokoll | Lauf einmal neu gestartet: grün, Release v3.6.0 veröffentlicht. Beobachten: tritt es wieder auf, ist es echt (Speicher) |

Tests: suite3 59/59 (neu: jeder Pfad aus V über das Menü inkl. aktivem Unterbereich, Öffnen/Schließen/Zurück-Reihenfolge,
Größen 360×640, 360×800 @130 %, 800×1280, 1280×800, 1280×800 @130 %), offline3 55/55 (Menüweg durch Training, Mobility,
Schule, Bibel, Pause), apk.js, upd.js, schnell 68/68.

Prüfung Phase 2 (unabhängiger Prüf-Agent, 15 Befunde):
| # | Befund | Lösung |
|---|---|---|
| F1 | Laufen zeigte Mobility, Atmung, Bahnplan (Karten aus training-suite ohne data-sec) | data-sec tsmob/tsbreath/tsbahn/tsheute/tssources/tsweekall, CSS, Test erweitert |
| F2 | Zwei Tipps während das Menü ausblendet: erster gewinnt, falscher Verlaufseintrag | `.drawer:not(.on){pointer-events:none}` (nur Handy, Tablet-Spalte bleibt bedienbar) |
| F3 | Keine Fokusfalle: Tab lief ins iframe, Escape ging dann nicht | Kopf, Chips, Inhalt, Leiste bekommen `inert`, solange das Menü offen ist |
| F4 | „Zurück zu Mehr“ führte zum Kalender, wenn Bibel/Pause von dort kam | Verlaufseintrag merkt `from`; nur bei from = Mehr zurück, sonst Mehr ersetzt den Eintrag |
| S5 | Tablet: aufgeklappte Gruppe blieb über Wechsel hinweg | `dwExp` gilt nur bis zum nächsten Ziel/Eintrag |
| S6 | Fokus ging nach Auswahl verloren | Menü fokussiert nach Neuaufbau wieder; verschwindet das Symbol, Fokus auf Zurück bzw. Titel |
| S7 | „Zum Lauf“/„Nur Dehnen“ zeigten die ganze alte Seite | `showPart()` geht über `SGShell.go` (Pfad stimmt) |
| S8 | Titel bei CSS-Zoom 200 % abgeschnitten | nicht geändert: Android-Schriftgröße vergrößert nur Text, Symbole bleiben 44 px; bei 200 % passt „Training“, „Bibel“, „Pause“ – lange Titel („Training einstellen“) werden mit … gekürzt. Für Phase 8 (Querschnitt) vorgemerkt |
| S9/S10 | Kopf ohne Rand links/rechts im Querformat, Spalte unten ohne --bot | Ränder ergänzt |
| H11 | Querformat-Handy ≥ 900 px bekam feste Spalte | Spalte erst ab 900 × 600 |
| H12 | Blatt über offenem Menü: Zurück-Reihenfolge falsch | Blatt übernimmt den Verlaufseintrag des Menüs, Menü geht zu |
| H13 | `go()` von außen bei offenem Menü | `go()` schließt zuerst das Menü |
| H14 | Pfadzeile auf dem Tablet fokussierbar | tabIndex −1 |
| H15 | „Seite bearbeiten“ in Laufen/Kraft listete alle Bereiche | Liste nach Ausschnitt gefiltert, Pfeile überspringen unsichtbare Nachbarn |
Test „S Prüfbefunde Phase 2“ deckt F2, F3, F4, S5, S7, H11, H14 ab.

### Phase 3 – Training aufräumen (erledigt)
Plan: vorhandenes System der Seitenbereiche (data-sec, Reihenfolge per CSS order, „Seite bearbeiten“) weiter nutzen, nichts löschen.
Umgesetzt:
- Einklappbare Karten (`.acc`, Zustand `sg-training-akk-v1`): zu zeigt Titel + Kernzahl, Tipp/Enter klappt.
- Heute: Heldenkarte oben, Startknopf „Ganzkörper starten · 13 min“, darunter Kennzahlenreihe (Bereitschaft mit Ampel,
  Wetter, Woche als 7 Punkte; Tipp öffnet die Details). Krank/Verletzt/Alternative als zugeklappte Hinweisstreifen,
  Neu-in-Version, Import, Tipp unten und zu.
- Laufen: Lauf live tracken oben, Distanz, nächster Lauftag; Verläufe zu unter „Verlauf & Statistik“.
- Kraft: Gym-Training oben, „Mobility & Dehnen“ (120 Übungen) als zweite Kachel, Verläufe zu.
- Auswertung: Fitness-Wert oben, Rest zu; Analyse: Kennzahlen-Kacheln oben, Rest zu; neuer Untereintrag
  „Kalender & Rückblick“ (bisherige Kalender-Karten der Training-Seite, zugeklappt).
- Neue Grundreihenfolge einmalig übernommen (`wk_sections_v4`).
Fehler und Ursachen:
| Fehler | Ursache | Lösung |
|---|---|---|
| Eingeblendete Karten aus training-suite standen über der Hauptaktion | ohne data-sec → CSS order 0 | data-sec, in Reihenfolge eingeplant |
| Wetter-Kennzahl sichtbar trotz hidden | `.kpi{display:flex}` überschreibt [hidden] | `.kpi[hidden]{display:none}` |
| Ausgeblendete Bereiche kamen nach jedem Neustart wieder (alter Fehler) | Beim Laden wurde jede fehlende Kennung als „neu“ angehängt | `wk_sections_seen` merkt, was die App schon kannte |
| Heute ganz aufgeklappt 2353 px | lange Übungsliste | Vorgabe „höchstens drei Bildschirmhöhen Scrollen“: Scrollweg 1680 px = 2,5 Höhen – erfüllt |

Inventar nachher (`werkzeuge/tests/inventar-nachher.json`, Pfade jetzt direkt aus `SGShell.V`) gegen vorher – alles, was nicht
mehr sichtbar am alten Platz steht:
| Vorher | Wo jetzt |
|---|---|
| Kalender: „Woche“/„Monat“, Tagesknöpfe „Mo19“ … | Phase 1: Wochenleiste, Tagesplan, Monatskalender (Datumstexte ändern sich täglich) |
| „Version 3.5.0 Version aktualisieren“ | gleicher Eintrag, jetzt 3.6.0 |
| „Training starten“ | gleicher Knopf, Beschriftung „Ganzkörper starten · 13 min“ |
| Überschriften „Programme starten“, „Manuell erfassen“ | entfallen als Zwischenüberschrift (Karten stehen jetzt in Laufen bzw. Kraft); „Verlauf & Statistik“ bleibt |
| „Atmung öffnen“, „Jetzt üben“ (Karte Atmung & HRV), „Bahn wählen“, „Buch“ (Karte Bahnplan) | Training › Kraft, Karten zugeklappt (Titel sichtbar); außerdem über Mobility › Atmung und Training › Rodeln |
| Fitness: Überschrift „Mobility“, „📤 Fortschritt teilen“ | Training › Auswertung › Fitness, in zugeklappten Karten |
| Menüpunkt „Laufen & Kraft“ | „Laufen“ und „Kraft“ |
Neu dazu: Training › Kraft, Training › Auswertung › Kalender & Rückblick.

Prüfung Phase 3 (Prüf-Agent, 20 Befunde):
| # | Befund | Lösung |
|---|---|---|
| F1 | `wk_sections_seen`/`_v4` liefen nicht mit Cloud/Sicherung → alte Sicherung blendete neue Karten dauerhaft aus | „gesehen“ und „umgestellt“ stehen jetzt in `wk_sections` selbst (`__seen`, `__v4`) |
| F2 | Erster Start erriet „ausgeblendet“ aus Altständen | ohne `__seen` wird wie früher alles Fehlende angehängt, erst danach gilt die Liste |
| F3 | Ohne „Mobility & Dehnen“ waren Freies Dehnen/Rodeln-Aufwärmen unerreichbar | Einzelkarten kommen zurück, sobald tsmob ausgeblendet ist |
| S4 | Ampel nutzte die Akzentfarbe (in manchen Farbwelten gut ≈ schlecht) | eigene Ampelfarben (hell/dunkel) plus Wort „gut/mäßig/schwach“ |
| S5 | Kennzahl Bereitschaft trotz ausgeblendeter Karte | prüft `.sec-hidden`; Woche öffnet nur, wenn die Karte da ist |
| S6 | role=button auf der Kopfzeile, Knöpfe darin verschachtelt | echter `<button class="acc-t" aria-expanded aria-controls>` in der Überschrift |
| S7 | Tippfläche nur 28 px | Kopfzeile 44 px, zugeklappt ist die ganze Karte Tippfläche |
| S8 | Leere/falsche Kernzahlen | eigene Kernzahl für Woche („3 von 7 Tagen trainiert“), Übungen, Zuletzt erfasst, Rekorde; sonst erste Textzeile |
| S9 | Auswertung ohne Kennzahlen-Kacheln und Gruppen | Fitness: 4 Kacheln (Woche, 30 Tage, Serie, Rekorde); Gruppen Fortschritt · Körper und Erholung bzw. Fortschritt · Aktivitäten · Berichte und Export; Befund und Wochenübersicht klappen |
| S10 | 11,5 px Text | 12 px |
| S11 | Umstellung verwarf eigene Sortierung | eigene Reihenfolge bleibt, nur neue Bereiche werden eingereiht |
| S12 | „Atemübung starten · 2 min“ am Krankheitstag falsch | „Sanftes Dehnen starten“ |
| H13 | Editor-Pfeile im Ausschnitt | Position aus der sichtbaren Liste |
| H14 | navy-Skin überschrieb zugeklappten Innenabstand | höhere Spezifität |
| H15 | Kraft-Kopf zeigte „Training · Nächster Lauftag“, Plus verdeckte „Seite bearbeiten“ | Kopf „Kraft“/„Laufen“, Lauftag nur bei Laufen, Abstand unten |
| H16 | Überschriften vor dem Setzen des Ausschnitts berechnet | nach dem Setzen erneut ausgerichtet |
| H17 | Bewegung trotz „weniger Bewegung“ | sanftes Scrollen/Drehung aus |
| H20 | doppelte CSS-Regel | entfernt |
| H18/H19 | Cool-down nur als Hinweis, lange Erklärtexte → Info-Symbol, Rodeln innen, Sportwissenschaft-Zähler im Blick | offen für Phase 8 (Querschnitt) |
Mobility: Bildvergleich vorher (Stand a921bfb, eigener Server) / nachher auf 5 Seiten – Unterschied nur im Kopf (y 11–49, neue Pfadzeile).

### Phase 4 – Schule, Bibel, Pause; Mobility bleibt (erledigt, Version 3.7.0)
Umgesetzt:
- Schultag: oben „Jetzt“/„Nächste Stunde“ (Fach, Raum, Minuten), dann Stundenplan heute, alle offenen Aufgaben
  (Überfälliges zuerst), nächste Prüfungen mit Countdown, Schnellknöpfe; Ferien, Lehrgang, Morgen, stressige Wochen und
  die nächsten Tage in „Mehr für heute“ (zugeklappt, Zustand gemerkt). Ein laufender Lehrgang bleibt oben.
- Aufgaben & Prüfungen: Segmentschalter Offen · Prüfungen · Erledigt (neue Prüfungsliste mit Countdown),
  „⚠️ Überfällig“ markiert. Lernzeit und Ablage sind eigene Einträge im Seitenmenü (Sprungadressen #lernzeit/#ablage
  auch während die Seite läuft). Einzeln geöffnet (ohne Hülle) bleiben alle fünf Schalter, umbrechend.
- Keine waagrecht scrollenden Knopf-Reihen mehr außer Mobility: Schule (Unterleiste, Fach-Auswahl), Pause (Wissen),
  Sportwissenschaft (Kapitel/Karten), Aufgaben (Quellen), Training einstellen (Kategorien) brechen jetzt um. Test prüft alle Seiten.
- Lernblöcke aus dem Lernplan (Aufgaben mit planFor) erscheinen im großen Kalender (Verbund `externalItems`, Kennung lh-).
- Bibel in „Auf einen Blick“: „Gelesen ✓“ ging nie (todayDone ist {date, ids}, verglichen wurde mit einem Datum) – behoben,
  dazu Serie und Leseplan („Ganze Bibel“/„Bekannte Kapitel“).
- Mobility: nur die Pfadzeile unter dem Titel („Atmung & HRV · Üben & HRV messen“), Chips und Inhalt unverändert.
Fehler und Ursachen:
| Fehler | Ursache | Lösung |
|---|---|---|
| Hülle startete nicht (SGShell fehlte) | Syntaxfehler beim Umbau der Pfadzeile (`else` nach geschlossenem Block) | korrigiert; Test „A Hülle lädt“ hätte es gefunden |
| Gruppen-Überschriften der Analyse fehlten | Karten liegen in Reitern (Overview/Daten), Überschrift stand am Seitenende | Überschrift wandert in den Behälter der Karten |
Tests: suite3 72/72, offline3 58/58, apk, upd, schnell 68/68, bahnplan-1/2.

Prüfung Phase 4 (Prüf-Agent, 12 Befunde):
| # | Befund | Lösung |
|---|---|---|
| F1 | Jetzt-Karte: „Montag, Mo 26.10.“ | Datum ohne Wochentagskürzel |
| F2 | Stunden ohne Zeit → Karte sprang mitten am Tag auf morgen | gleiche Regel wie „Heute im Stundenplan“; „Heute · N Stunden“ |
| S3 | „▶ Lernzeit“/„Alle Termine“ aus der Seite: Pfadzeile blieb stehen | Seite meldet den Bereich an die Hülle (`shellSec` → `SGShell.go`) |
| S4 | „Alle →“ nach Lernzeit öffnete wieder Lernzeit | Aufgaben-Sprung setzt die Ansicht immer auf die Liste zurück |
| S5 | Lernblöcke doppelt auf der Aufgaben-Seite (Termin + Aufgabe) | dort nur als Aufgabe |
| S6 | Lernblöcke wären in den Handykalender gegangen | aus Handy-Abgleich und ics-Export ausgenommen |
| S7 | Plus in „Prüfungen“ öffnete „Neue Aufgabe“ | öffnet „Neue Prüfung“ |
| S8 | Jetzt-Karte bei Lehrgang/krank; leer bei freiem nächsten Schultag | dann keine Karte; sucht bis zum nächsten Tag mit Unterricht |
| H9 | Bibel-Kachel: Tagesziel 2 / alte Daten | „Gelesen ✓“, sobald `lastDate` heute ist (wie die Bibel selbst) |
| H10 | Segment gewählt kaum sichtbar, Farbstreifen der Karte unsichtbar (design.js setzt Rahmen 0), „Mehr für heute“ ohne Pfeil | gewählt = Textfarbe als Fläche, Streifen als Schatten, Pfeil |
| H11 | Chip-Wände statt Scrollen (Kapitel, Termin-Arten) | Auswahlfelder; Kartenart als 3er-Segment |
| H12 | Zwischenstand-Schlüssel `wk_sections_seen/_v4` | als Rückfall gelesen |
| (Test) | Kapitel-Auswahl im Quiz änderte den Filter der Karteikarten | gemeinsamer Baustein: Auswahlfeld trägt jetzt, welcher Filter gemeint ist (`data-fsel`) – vom Test „L Quiz“ gefunden |
Version 3.7.0.

### Phase 5 – Mehr neu ordnen (erledigt)
Umgesetzt (app/js/1-app.js `renderMehr`, app/index.html):
- Oben Suchfeld „Einstellungen und Seiten suchen“ – öffnet die vorhandene Suche mit dem Getippten (keine zweite Suche).
- Fünf Gruppen; jede Zeile zeigt rechts ihren Zustand (`.val`), Untertitel einzeilig, Zeilen ≥ 60 px.
- Cloud-Sicherung: „Aus“ / „vor 2 Std.“ / „! vor 9 Tagen“ bzw. „! Fehler“ in Warnfarbe; dazu roter Punkt am Tab „Mehr“ (`mehrBadge()`, bei jeder Darstellung).
- Handykalender: APK „An · heute 08:12“ / „Aus“ / „! Fehler“, Browser „N neu“ oder „zuletzt …“. Erinnerungen (nur APK): „An · 12 geplant“ / „Aus“.
- Umzug groß oben, solange nicht erledigt (`sg-umzug-v1`, im Browser zusätzlich `sg-umzug-raus-v1` nach dem Erstellen der Umzugsdatei), danach kleine Zeile in „Abgleich und Sicherung“.
- Neu: „Standardwoche übernehmen“, „Alles als Datei sichern“ (gleiche Datei wie der Umzug), „Was ist neu“, „Fehlerprotokoll“ (SGShellDiag, Kopieren/Leeren),
  Schalter „Seitenmenü automatisch öffnen“ (Standard aus, `sg-app-v1.autoDw`). Version zeigt „Neu: x.y.z“, sobald eine neuere bekannt ist.
- Ein Schalter-Baustein für alle Blätter (`toggleRow`, `input.swi role=switch`) statt nackter Kontrollkästchen in Handykalender/Erinnerungen/Handy-Optionen.
- Höhe auf 360 × 800: 1391 px (≤ 2 × 800).
Neue Orte (alles von früher erreichbar):
| Früher | Jetzt |
|---|---|
| Planen: Aufgaben, Notizen, Woche planen | gleich, Zahl der offenen rechts; dazu „Standardwoche übernehmen“ |
| Planen: Handykalender | Abgleich und Sicherung |
| Lesen & Lernen: Bibel, Sportwissenschaft, Pause | Lesen und Lernen; Sportwissenschaft als Verknüpfung ↗ (Hauptort Training › Seitenmenü) |
| Einstellungen: Design | Darstellung und Einstellungen |
| Einstellungen: Cloud-Sicherung, Erinnerungen, Umzug | Abgleich und Sicherung |
| Einstellungen: Training einstellen | Darstellung und Einstellungen, Verknüpfung ↗ (Hauptort Training › Seitenmenü) |
| Einstellungen: App installieren | Darstellung und Einstellungen (nur im Browser) |
| Einstellungen: Version | Über die App |

Prüfung Phase 5 (Prüf-Agent, 16 Befunde):
| # | Befund | Lösung |
|---|---|---|
| F1 | Offline/keine Verbindung galt als Fehler (Warnpunkt) | `status().offline`; offline und „noch nie gesichert“ warnen nicht, nur echte Fehler und > 7 Tage |
| F2 | Zustand/Warnpunkt erst nach Seitenwechsel aktuell | Verbund feuert `sg-sync` nach jedem Lauf; Hülle aktualisiert Punkt und Mehr; `refresh()` und stündlich |
| F3 | Umzug galt schon beim Antippen als erledigt | Merker erst nach Speichern/Teilen |
| S4 | Gerätemerker in Umzugs-/Sicherungsdateien | `sg-umzug-raus-v1`, `sg-update-neu` in MOVE_SKIP |
| F5/S6 | „Alles als Datei sichern“ ließ sich im Browser nicht einspielen; Text war der Umzugstext; zwei verschiedene Sicherungen | eine Sicherung (`moveOut("backup")`, mit Dateien/Bildern) überall (Mehr, Cloud-Blatt, Suche); neu „Sicherung einspielen“ in Mehr; Cloud › Einspielen nimmt sie auch |
| S7 | Suchfeld: IME-Komposition „BBücher“, Tastatur sprang | Feld ist ein Knopf, getippt wird in der Suche selbst |
| S8 | Suche fand keine Mehr-Einträge, Enter legte Aufgabe an | Mehr-Einträge als Befehle registriert (Gruppe „Einstellungen“) |
| S9 | Abgeschnittene Titel (360 × 640, 130 %) | Titel brechen um, Untertitel max. 2 Zeilen, kürzere Untertitel |
| S10 | Handykalender „! Fehler“ nach „Abgleich aus“ | `disable()` löscht den Fehler, Zeile prüft zuerst „an“ |
| H11 | „Neu: x.y.z“ nach Neustart weg | in `sg-update-neu` gemerkt, nur wenn wirklich neuer |
| H12 | Große Umzugskarte auf PC/iPhone | nur in der APK oder auf Android |
| H13 | Schalter-Kontrast | Rand im Aus-Zustand, Akzentfläche im An-Zustand |
| H14 | Kopieren ohne Version/Gerät, falsches „Kopiert“ | Kopfzeile dabei, Rückweg meldet ehrlich |
| H15 | Schalter „Seitenmenü automatisch“ auf dem Tablet wirkungslos | dort ausgeblendet |
| H16 | Sportwissenschaft ohne %, Erinnerungen-Zeile | % wieder da; Erinnerungen nur, wenn die APK sie kann (wie vorher) |

## 3.5.0 – erste veröffentlichte Android-App

Secret `APK_PASSWORT` vom Nutzer eingetragen (Passwort bekam er als PDF, weil er die .txt nicht öffnen konnte).
Lauf 39427364524: signiert (Zertifikat geprüft), Emulator 25/25, Release **v3.5.0** mit `planer-3.5.0.apk` (5,4 MB):
https://github.com/SportGermany/planer/releases/tag/v3.5.0

## 3.4.x – Android-App: Handykalender (B), Erinnerungen (C), Test im echten Emulator

**Umsetzung:** siehe WISSEN.md › APK. Workflow: bauen → Emulator-Test (`werkzeuge/tests/emulator.js`, API 34, Pixel 6) → erst dann Release.
Ergebnisse (Bildschirmfotos, Protokoll) zusätzlich im Branch `emulator-ergebnis` (Artefakt-Speicher ist aus der Claude-Umgebung gesperrt).

| Fehler | Ursache | Lösung |
| --- | --- | --- |
| APK blieb im Emulator leer (Leiste nie sichtbar) | Capacitors Server liefert für Pfade **ohne Dateiendung** (`/planer/app/`) nichts, wenn `html5mode` aus ist – der RouteProcessor wird dafür gar nicht gefragt | eigener `BridgeWebViewClient` in `MainActivity` hängt `index.html` an, bevor die Anfrage zum Server geht |
| Verbindung zur App brach beim 12. Bereich ab | alle besuchten Bereiche blieben als iframes geladen (Speicher) | höchstens 7 (APK: 5) Bereiche geladen, der älteste wird geschlossen (`trimFrames`) |
| 404 im Emulator | `sw.js` fehlte in der APK, Seiten fragen ihn ab | `sw.js` wird mitkopiert (nicht registriert) |
| Test: Start-Adresse „falsch“ | Adresse endet auf `#kalender` | Prüfung angepasst |
| App hätte sich nach Absturz des Seiten-Prozesses ganz beendet | Android-Standard bei `onRenderProcessGone` | App baut sich neu auf (`recreate`) |
| Test hing an einer unsichtbaren WebView (Höhe 0) | mehrere WebView-Seiten im Emulator | Test wählt die sichtbare Seite |
| Update-Prüfung meldete 404 | noch kein Release auf GitHub | 404 = nichts Neueres |

Im Emulator geprüft (grün): Start in der Hülle, Leiste über der Android-Gestenleiste, Willkommen/Umzug, Einrichtung,
Kalender „Planer“ im Android-Kalender angelegt und befüllt, Handytermin aus „Mein Kalender“ erscheint in der App, Erinnerungen geplant,
alle 13 Bereiche laden, Leiste nach Tastatur wieder im Bild.

## 3.3.0 – Android-App (APK), Schritt A

**Wunsch:** „Als APK zum Laufen kriegen … nicht im Play Store, einfach per APK herunterladbar.“ Gewählt: Weg 1 (Capacitor, Bau auf GitHub).
Antworten: Schlüssel geheim bei GitHub · eigener Handykalender „Planer“ · alle Handykalender lesen · Umzug per Datei ·
in den Handykalender: Termine & Wochenplanung, Schule, Atemübungen, Stundenplan · Erinnerungen: Termine & Notizen, Training & Mobility ·
Name „Planer“ · Web-App weiter pflegen. Plan: A (APK wie Web + Umzug + Update) → B (Kalenderabgleich nativ) → C (Erinnerungen nativ).

**Umsetzung A:** siehe WISSEN.md › APK. Workflow `.github/workflows/apk.yml`, Release je Version, Update-Hinweis aus der App.

| Fehler | Ursache | Lösung |
| --- | --- | --- |
| (vorab gefunden) Ordner-Adressen wie `/planer/app/` hätten in der APK immer die Start-`index.html` geliefert → Endlosschleife | Capacitor „html5mode“: Pfade ohne Dateiendung → `/index.html` | `html5mode:false` + RouteProcessor in `MainActivity` |
| Service-Worker-Liste hatte plötzlich 99 statt 49 Dateien | `build.py` lief auch durch `werkzeuge/apk/android/…/public` | `werkzeuge/` beim Sammeln überspringen |
| Herunterladen geht im Android-WebView nicht | WebView hat keinen Download-Dialog und kein Web-Share | `a[download]` / `a.click()` abfangen → Datei in den App-Zwischenspeicher, Android-Teilen |
| Seiten geben Blob-Adressen sofort nach dem Klick frei | `URL.revokeObjectURL` direkt nach `a.click()` | in der APK Freigabe um 60 s verzögert |
| Umzug: Schul-Ablage hätte ohne „inbox“ angelegt werden können | IndexedDB-Version 1 ohne alle Ablagen → Seite legt sie nie mehr an | beim Umzug immer den vollständigen Aufbau anlegen |
| Umzug: eingebettete Seiten hätten beim Neustart alte Daten zurückgeschrieben | Seiten speichern beim Schließen | vor dem Einlesen alle iframes schließen |

**Grenzen in der APK (Stand A):** Drucken (Bahnplan) geht nicht – Hinweis, dafür Chrome. Kalender und Erinnerungen folgen in B und C.

Tests: suite3 47/47, offline3 44/44, apk.js grün (Umzug inkl. Bild/PDF, Speichern/Teilen, Links, Update), upd.js grün.

## 3.2.0 – Handykalender

**Wunsch:** „Meinen lokalen Handykalender mit der App synchronisieren, dass beides auf dem gleichen Stand ist.“ Antwort auf Rückfrage:
Termine liegen **nur auf dem Handy** (Samsung, ohne Google-Konto), Lösung soll **nur das Handy** brauchen, **keine Google-Verknüpfung**.

**Grenze (ehrlich):** Web-Apps (auch installiert in Chrome) dürfen den Gerätekalender nicht lesen oder schreiben. Ein vollautomatischer
Abgleich ginge nur über Google-Kalender (abgelehnt) oder eine eigene Android-App. Deshalb Abgleich über Kalenderdateien – offline, ohne Konto:
- App → Handy: Mehr › Handykalender › „n neue Termine ins Handy“ → Teilen an den Samsung-Kalender (Web Share mit .ics) oder Datei speichern.
  Gemerkt wird pro Gerät, was schon übertragen ist (`sg-handykalender-v1`, nicht in der Cloud) → nur Neues/Geändertes. Wählbar: Schule, Atemübungen.
- Handy → App: im Samsung-Kalender Termin › Teilen › „Planer“ (Share Target im Manifest, `sw.js` legt das Geteilte im Cache `sg-teilen` ab und
  öffnet `app/#teilen`) oder „Kalenderdatei öffnen“ (.ics/.vcs). Vorschau, dann Übernehmen; gleiche Termine (UID bzw. Titel+Datum+Zeit) werden aktualisiert.
- Erkennt iCalendar 2.0 (Zeitzonen, UTC, ganztägig, Wiederholung, Erinnerung, gefaltete Zeilen) und Samsungs vCalendar 1.0 (Quoted-Printable, UTF-8),
  außerdem geteilten Text („Di., 20. Okt. 2026 14:30 – 15:15“).
- Löschen geht nicht über Dateien → auf beiden Seiten löschen (steht im Blatt).
- Termine aus dem Handy bekommen `app:"Handy"`, `ext:"handy:<UID>"`; sie gehen nur zurück ins Handy, wenn sie in der App geändert wurden.

| Fehler | Ursache | Lösung |
| --- | --- | --- |
| Geteiltes kam in der App nicht an (Test) | Cache-Schlüssel relativ: SW legte unter `/planer/geteilt.json` ab, die Hülle suchte `/planer/app/geteilt.json` | SW speichert unter `app/geteilt.json` relativ zum Scope |
| Update löschte möglicherweise Geteiltes | `activate` löscht alle fremden Caches | `sg-teilen` ausgenommen |
| `upd.js` lief nicht mehr | Test stammte aus 2.x (Übersicht `.sgd`) | neu für die Hülle: Mehr › Version, alle Bereiche auf neuer Version, Daten erhalten |

Hinweis für den Nutzer: Chrome übernimmt das neue „Teilen-Ziel“ erst, wenn es die installierte App aktualisiert (kann bis zu einem Tag dauern);
sofort: App vom Startbildschirm entfernen und in Chrome neu installieren (Daten bleiben, sie liegen bei der Adresse).

Tests: suite3 47/47 (4 neue H-Tests), offline3 44/44 (Teilen und Datei offline), upd.js grün.

## 3.1.1 – untere Leiste bleibt immer sichtbar

**Wunsch:** „Die Bar (Kalender, Training, Mobility, Schule, Mehr) verschwindet manchmal“ – online und offline prüfen, immer Chrome.

| Fehler | Ursache | Lösung |
| --- | --- | --- |
| Hinweise des Verbunds (Erinnerung, Woche planen, Sync, Installieren) lagen auf der Leiste und verdeckten sie | `.toast` unten bei 14 px mit höchstem z-index, für Seiten ohne Leiste gedacht | Variable `--sg-toast-bottom`, in der Hülle 80 px über dem Rand (Handy) |
| Leiste konnte aus dem Bild rutschen (Android Chrome: `100dvh` nach Tastatur/Drehen/App-Wechsel zeitweise falsch) | Hülle hing an `height:100dvh` | Hülle `position:fixed; inset:0` – folgt immer dem echten Fenster |
| Behälter `#sg-shared-calendar` lag als zusätzliche Rasterzeile im Grid der Hülle | jedes Kind von `body` wird im Grid platziert | Behälter `position:fixed`, Größe 0, z-index ganz oben (sonst lägen seine Fenster unter der Leiste – im Test gefunden) |
| Quer auf kleinen Handys Knöpfe der Seitenleiste abgeschnitten | 5 × 64 px + Abstände > Höhe | ab Höhe ≤ 440 px kleinere Knöpfe, Leiste scrollbar |
| (Schutz) | – | `keepNav()`: setzt verschobene Seite zurück, zeichnet Leiste neu, schreibt Fehlerprotokoll `sg-diag-v1` (`SGShellDiag()`) |

Tests: neuer Test „Leiste immer sichtbar“ (alle Bereiche, Tastatur simuliert, Drehen, Hinweis), Offline-Test prüft die Leiste in jedem Bereich. suite3 43/43, offline3 43/43.

## 3.1.0 – einheitliches Design in allen Bereichen

**Wunsch:** Handy-Prüfung: „Starten“/„Üben“ im Kalender nicht mittig, ragen über den Knopf; „jedes Ding hat sein eigenes Design“.

**Umsetzung:** In der Hülle legt `design.js` (`unifyCSS`) über alle eingebetteten Seiten eine gemeinsame Schicht:
eine Akzentfarbe (Farbwelt) statt Orange im Training und Türkis in der Pause, Titel überall 22 px, Zwischentitel 17 px,
Inter statt Mono-Schrift (Atmung, Training) und statt Serifen in den Bedienelementen der Bibel (Bibeltext bleibt Serif),
Bibel-Hauptknopf gefüllt wie überall. Kalender-Schnellkarten als 2er-Raster. Aufgaben ohne doppelte Kopfzeile.

| Fehler | Ursache | Lösung |
| --- | --- | --- |
| „Starten“/„Üben“-Pille nicht mittig, ragt nach oben | `.go` ist ein `<span>` ohne Flex-Zentrierung | `display:inline-flex;align-items:center;line-height:1;align-self:center` |
| Schnellkarten im Kalender am Rand abgeschnitten | waagrechte Scrollreihe mit 132-px-Karten (bis zu 5 Karten) | 2er-Raster, ungerade letzte Karte über volle Breite |
| Training orange, Pause türkis trotz Farbwelt | eigene Variablen `--work`/`--zitate`, Training setzt sie per Skript inline | in der Hülle mit `!important` auf `acc` legen |
| Atmung zeigt Zahlen in Mono-Schrift | `--font-data` = JetBrains Mono | `font-data` in `FONTVARS` (Inter) |
| Aufgaben: doppelter Titel, 86 px Leerraum unten | Planer-Kopfzeile und Platz für die (ausgeblendete) eigene Leiste | `#bar[data-tab=tasks]` und Polster in der Hülle aus |
| Titelgrößen 21–40 px je Seite | jede Seite eigenes CSS | `h1` 22 px, `h2` 17 px in der Hülle; Mobility-Block 28 px, Schule-Datum 26 px |

Tests: `suite3.js` 42/42 (neu: Design-Test für Pillen, Schnellkarten, Akzentfarbe, Titelgröße), `offline3.js` 42/42.

## 3.0.x – eine Hülle (Kalender als Start)

**Wunsch:** App zu groß, Funktionen zu getrennt, zu viel Navigieren. „Mach einen Kalender und in dem Kalender kann ich auf die
verschiedenen Apps gehen.“ Atmung/HRV unter Mobility. Einheitliches Design, weniger Suchen, Funktionen verknüpfen.
Danach: Werkzeugkoffer im Repo (alles Wissen + Fehlerbeschreibungen), Handy-Prüfung des Designs.

**Umsetzung:** `app/` als Hülle mit fünf Zielen (Kalender · Training · Mobility · Schule · Mehr), Bereiche als iframes,
Chips für Unterpunkte, „Starten“ direkt am Kalendereintrag, „+“ für Termin/Aufgabe/Notiz/Woche planen.
Alte Adressen und direkt geöffnete Seiten leiten in die Hülle um (`?einzeln` = Ausnahme).

| Fehler | Ursache | Lösung |
| --- | --- | --- |
| Tipps auf die untere Leiste wirkungslos | ausgeblendeter Snack lag unsichtbar darüber | `opacity:0;pointer-events:none` im Ruhezustand |
| Ganze Seite verrutscht beim Chip-Wechsel | `scrollIntoView` scrollt alle Vorfahren | nur die Chip-Reihe per `scrollLeft` scrollen |
| Layout breiter als der Bildschirm | Grid-Spalte `1fr` wächst mit langer Chip-Reihe | `minmax(0,1fr)` |
| Zurück-Pfeil auf obersten Ansichten sichtbar | CSS `display` überschrieb das `hidden`-Attribut | `[hidden]{display:none!important}` |
| Training stürzte ab, wenn direkt `#lauf` geöffnet | `switchTab` las `S.uiPrefs.showFab` vor dem Laden | `(S.uiPrefs||{}).showFab` |
| Klicks in der Wochenplanung ohne Wirkung | leerer „Bearbeiten“-Link lag über den Knöpfen | Link nur mit Standardwoche erzeugen |
| Neues Gerät nicht offline | nur die alte Planer-Startseite registrierte `sw.js`, Start ist jetzt `app/` | Hülle registriert `../sw.js` (Scope `../`), Test dafür |
| „Version aktualisieren“ lud manchmal nicht neu | Reload nach `controllerchange` ging verloren | SW-Version per MessageChannel abfragen, alle 4 s erneut neu laden |
| „Starten“/„Üben“-Pille im Kalender nicht mittig, ragt nach oben | `.go` ist ein `<span>` ohne Flex-Zentrierung | `display:inline-flex;align-items:center;line-height:1` (3.1.0) |

Tests: `suite3.js` 41/41, `offline3.js` 42/42 (94 Felder, alle Bereiche, alte Adressen, Notizen/Aufgaben offline).

## 2.1.0 – Sportwissenschaft

**Wunsch:** Bereich „Sportwissenschaft“ aus dem Claude-Doc: Lesemodus (8 Kapitel, Fortschritt gespeichert), Karteikarten aus
Merksätzen und Mach-das/Lass-das-Tabellen, Quiz mit Auswertung (Falsche kommen wieder), Suche (z. B. „Eisbad“, „Dehnen“), offline.

| Fehler | Ursache | Lösung |
| --- | --- | --- |
| Tabs der Seite reagierten falsch | `data-tab` kollidierte mit dem Planer-Skript | in `data-sgtab` umbenannt |
| Kartenstand ging verloren | Speichern mit Verzögerung, Android beendet App | jede Antwort sofort speichern |
| „Gewusst“-Karte sofort wieder fällig | Box-Formel startete bei 0 | `b = min(6, max(1,b)+1)` |
| Zeile im Skript kaputt nach Build | `//`-Kommentar beim Zusammenfügen in eine Zeile gezogen | nur `/* */`-Kommentare |
| Entwurf einer Notiz weg nach Zeitwahl | Formular wurde neu gezeichnet | Entwurfstext merken |

## 2.0.0 – Notizen, Standardwoche, Version, schneller

**Wunsch:** Link „Trainingsplan“ (`sgt-kal…`) offline „nicht erreichbar“ – alles muss in einer App bleiben. Versionsnummer +
„Version aktualisieren“. Notizen (einfach, optional Zeitpunkt/Erinnerung). Übersicht ohne langes Scrollen. Standardwoche
fürs Training, jede Woche mit einem Tipp übernehmen und anpassen. Plan machen, Test-Suiten, Offline-Test, schneller machen.

| Fehler | Ursache | Lösung |
| --- | --- | --- |
| „Website nicht erreichbar“ offline | gespeicherte Termine/Links zeigten auf alte Repos (trainingsblog, Schulplaner, Bibel, kalender) | `SGFixUrl` schreibt alte Adressen zur Laufzeit um |
| Schule/Pause/Mobility/Atmung ohne Offline | falsche Service-Worker-Pfade | einheitlich `sw.js` im Wurzelordner |
| CSV-Import blockierte | Worker aus `blob:` durch CSP verboten | Worker als Datei, im Cache |
| Langsamer Start | große Inline-Skripte ohne Code-Cache | Skripte als Dateien `?v=` (30–47 % schneller) |
| Test beendete eigene Shell | `pkill -f` traf die Shell | Server per PID beenden |

## 1.x – Zusammenführung zu einer App

Vorher einzelne Repos (Schulplaner, trainingsblog, Bibel, Kalender, Pulsplan, Rodeln, Focus …). Wünsche in dieser Zeit:
gemeinsamer Kalender für alle Apps mit Cloud-Sync über GitHub (mehrere Geräte), installierbar über Chrome, 10 Farbdesigns
(Favorit „Mitternacht“, alles dunkel), Glasoptik, schlichter Stil wie Apple/Notion statt „KI-Look“, Handy und Tablet
(Samsung, 9:16 und 16:9), Wochenplanung im großen Kalender, mehrere Einheiten pro Tag freiwillig, App-Wechsel oben rechts,
Unterpunkte als zweite Reihe statt Zurück-Pfeil, Bibel mit vollem Text und ohne Kalender/Cloud, Bahnplan (Kurvenbuch,
nur Wikipedia-Bilder, Starthöhen, Damen-/Herrenstart, Drucken). Am Ende: eine App „planer“, alte Repos gesichert in
`SportGermany/sicherung`.

| Fehler | Ursache | Lösung |
| --- | --- | --- |
| Geisterklick auf Touch | Öffnen auf `touchstart`, danach Klick | auf `click` öffnen |
| Ansicht trotz `hidden` sichtbar | CSS überschrieb `hidden` | `[hidden]{display:none!important}` |
| Atmungsdauer falsch im Kalender | Pulsplan nutzt Feld `dur`, nicht `minutes` | `dur` lesen |
| HRV-Bewertung zu streng | Streuung bei stabilen Werten fast 0 | Mindest-SD und neue Schwellen |
| Training nicht installierbar | Service Worker aus `blob:`, Manifest als data-URL | echte Dateien, CSP angepasst |
| Bibeltext unvollständig | eigener Text war lückenhaft | vollständige Elberfelder 1905 (`elb1905.json`) |
| Bibel-Daten nicht übernommen | Migration ohne Feld `v` übersprungen | `Object.assign(defaultState(),{v:0},parsed)` |
| Leiste überdeckte Modul-Leisten | schwebende Tabbar ohne Abstand | Abstand + Modul-Leiste als zweite Reihe |
| `.col` zerschoss den Kalender | Klassenname doppelt | in `.bcol` umbenannt |
| Langes Drücken schluckte nächsten Klick | Merker blieb gesetzt | globaler Zeitstempel |
| Bibel blockierte beim Laden (487 ms) | Text in jedem Start neu zerlegt | vorberechnete Abschnitte (79 ms) |
| Repos anlegen/löschen: 403 | Claude hat dafür keine Rechte | Nutzer legt an/löscht |
| Wikipedia aus der Testumgebung gesperrt | Netzregeln | Kurvendaten per Websuche; Bild lädt beim Nutzer, sonst kein Bild |
