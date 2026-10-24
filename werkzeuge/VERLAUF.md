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

### Phase 6 – Suche und Befehle neu (erledigt)
Umgesetzt (Abschnitt „Suche (Vollbild)“ in app/js/1-app.js, CSS in app/index.html):
- Vollbild-Suche statt Palette (`SharedCalendar.setPalette`): Lupe, `#befehle`, Strg K, Suchfeld in Mehr öffnen sie; fällt sie aus, bleibt die alte Palette.
  Zurück-Pfeil, Feld mit Löschen-Knopf, Trefferzahl für Vorlesen (aria-live), Filter-Chips umbrechend, Höhe über visualViewport,
  Android-Zurück schließt zuerst die Suche (eigener Verlaufseintrag; Folgeaktion erst danach, wie beim Seitenmenü).
- Leer: Zuletzt (8, Löschen), Schnell anlegen, Häufig (Zähler). Treffer in Gruppen (3 + „Alle N anzeigen“), Treffer hervorgehoben,
  Aufgabe direkt abhaken, Termin direkt im Kalender öffnen. Gruppe des Bereichs, aus dem die Suche kam, zuerst.
- Schnelleingabe: Vorschaukarte „Neuer Termin · Mi 21.10., 15:00 · Zahnarzt“ mit Datum/Zeit/Wiederholung zum Korrigieren,
  Speichern (mit Rückgängig), Bearbeiten (volles Blatt vorausgefüllt, `newEvent(date, vorgabe)`), „als Aufgabe/Notiz“.
- Befehlskatalog neu nach Gruppen mit Stichwörtern und Zustand (Aufgaben „N offen“, Cloud „zuletzt …“, Karteikarten „N fällig“);
  APK-Befehle nur in der APK, „App installieren“ nur im Browser. Alle alten Befehle bleiben findbar (Test).
- Inhalte: Termine ±1 Jahr (Serien: nächstes Vorkommen), Aufgaben, Notizen, Bahnen (Katalog + eigene), Mobility-/Gym-/Dehnübungen,
  Schule (Fächer, Prüfungen, Hausaufgaben), Sportwissenschaft (öffnet die Stelle im Lesemodus), Bibelstellen („Joh 3,16“) und Bibeltext.
- Kurzbefehle: / nur Befehle · + neu · @ Datum · ? Beispiele zum Antippen.
- Neue Bausteine mit Node-Tests: `suche.js` (55 Tests in suche-kern.js zusammen mit `bibelstelle.js`), `suchdaten.js` (Build).
Fehler und Ursachen:
| Fehler | Ursache | Lösung |
|---|---|---|
| Vorschau erschien nicht | Schnelleingabe heißt `SGQuick.parseQuick`, nicht `window.parseQuick` | richtiger Name |
| Bibeltext: 60 ms Hauptthread beim ersten Suchen | 4,4 MB JSON auf dem Hauptthread eingelesen | Worker `app/js/suche-worker.js` lädt und durchsucht Bibel und Buch |
| Messung zeigte weiter lange Aufgaben | das Vorladen der Training-Seite (3,5 s nach Start) lief in die Messung | Test misst nach dem Vorladen; Suche selbst: keine Aufgabe > 50 ms |
| „Monatsübersicht“ und „Planer als App installieren“ fehlten im neuen Katalog | beim Neuaufbau vergessen | ergänzt; Test vergleicht mit dem alten Katalog |

Prüfung Phase 6 (Prüf-Agent, 17 Befunde):
| # | Befund | Lösung |
|---|---|---|
| F1 | Enter in den 100 ms nach dem letzten Zeichen speicherte den vorigen Stand („Zahnarzt 15 Uh“) | Enter sucht immer zuerst mit dem aktuellen Text; Test tippt echt und drückt sofort Enter |
| F2 | Vorschau blieb nach „/“, „@“, „?“, leer stehen – Enter speicherte alten Termin | Vorschau wird bei jedem Suchlauf zurückgesetzt |
| F3 | Befehlsname mit Datum-Wort („Bibel heute lesen“) wurde Aufgabe, „Römer 8:28“ Termin | sehr guter Treffer (ganzer Name, Bibelstelle) geht vor; Bibelstelle unterdrückt die Vorschau |
| S4 | Enter im leeren Feld führte „Häufig“ aus | leer/Hilfe: Enter tut nichts |
| S5 | ohne Treffer legte Enter sofort eine Aufgabe an (auch während Worker noch suchte) | nie automatisch ohne „+“; Zeile „Aufgabe anlegen“ öffnet das Blatt zum Prüfen, erst wenn nichts mehr aussteht |
| S6 | Strg K bei offener Suche: zweiter Verlaufseintrag | offene Suche wird nur fokussiert |
| S7 | „Bearbeiten“ → Verbund-Blatt ohne Verlaufseintrag, Zurück verließ die Seite | Blatt hat eigenen Eintrag (`vp`); Hülle schließt es bei Zurück zuerst; neu geöffnet im selben Schritt bleibt offen |
| S8 | Rückfall auf alte Palette ließ die kaputte Suche offen; verzögerte Fehler ohne Rückfall | `sxFail` schließt sauber und öffnet die alte Palette, auch aus dem verzögerten Lauf |
| S9 | 4000 Termine + 1500 Aufgaben: 60–100 ms je Taste | Wortlisten einmal vorbereitet (`SGSuche.prep/scoreP`), Befehle je Öffnen zwischengespeichert – gemessen keine Aufgabe > 50 ms |
| S10 | Bibeltext nur als Wortfolge, Teilwörter („img“) | alle Wörter, jeweils Wortanfang |
| H11 | Tippfehler-Fehltreffer („liebe“ → „Liegen“, „schule“ → „Schulter“) | unscharf nur im Titel, erster Buchstabe muss stimmen, unscharfe Treffer nur, wenn es nichts Genaues gibt |
| H12 | „Joh 3,99“ angenommen, „Jud 5“ nicht, „am 5“ = Amos | Verse je Kapitel geprüft, Bücher mit einem Kapitel lesen die Zahl als Vers, Kurzformen wie „am/mi/ex“ klein nur mit Vers |
| H13 | Stelle geöffnet, Vers nicht markiert | Vers markiert und hingescrollt (ohne scrollIntoView) |
| H14 | Rollen falsch (option mit Knöpfen, combobox ohne activedescendant), Fokus nach Schließen weg, Hintergrund bedienbar | einfache Knopfliste mit Gruppen-Namen, Filter als Umschalter (aria-pressed), Fokus zurück auf die Lupe, Hintergrund inert |
| H15 | „Häufig“ zählte nach wechselndem Titel | feste Schlüssel (glas, cloud, erinnern) |
| H16 | Formular-Hinweis „Wiederholung im großen Kalender ändern“ veraltet; Serienende ging bei neuem Rhythmus verloren | Text entfernt, Serienende bleibt |
| H17 | Datenänderung bei offener Suche zeigte alten Stand; Auswahl sprang | neu zeichnen nach Änderung, Auswahl über den Schlüssel gehalten |
Nachtest nach den Befunden:
| Fehler | Ursache | Lösung |
|---|---|---|
| „+ Eintrag › Termin“ und „Bearbeiten“ öffneten das Terminblatt, es ging sofort wieder zu | das Blatt der Hülle schließt mit `history.back()` (kommt später an); das neue Verbund-Blatt (S7) war dann schon offen und wurde vom späten Zurück geschlossen | `closeSheet(false, danach)`: das Nächste öffnet erst, wenn der Verlaufsschritt angekommen ist; die Hülle schließt das Verbund-Blatt nur, wenn dessen Eintrag verlassen wurde |
| Test „Maskierung“ rot nach Mitternacht | Test rechnete „heute“ in UTC (`toISOString`), die App in Ortszeit – zwischen 0 und 2 Uhr verschiedene Tage | Test nimmt das Ortsdatum |
| Bahnplan-Test: Ladefehler in der Konsole beim Schritt „ohne Netz“ | Test brach nur die Anfragen ab, der Browser war „online“ – die App fragte und der Browser meldete die Fehler | App fragt Wikipedia ohne Netz gar nicht erst; Test schaltet wirklich offline |

### Phase 7 – Kalender-Verbesserungen (erledigt, Version 3.8.0)
Plan (Abschnitt 10 der Anleitung). Datenmodell bleibt abwärtskompatibel: nur neue, optionale Felder; ältere Geräte reichen sie beim Abgleich durch
(Zusammenführen ersetzt ganze Einträge, `update` ändert nur die genannten Felder).
- Neue Felder am Termin: `endDate` (mehrtägig), `star` (wichtig), `area` (Bereich), `status` (`done`/`skip`) mit `why`;
  `rep` bekommt `days` (Wochentage, Mo = 0), `iv` (alle N Wochen/Tage), `nth` (1.–4. oder letzter Wochentag im Monat).
  Einfache Regeln bleiben im alten Format (`w`, `2w`), damit ältere Geräte sie weiter verstehen.
- `occurrences()`: Serien mit Wochentagen, Intervall, n-tem Wochentag; mehrtägige Termine liefern je Tag einen Eintrag mit `day`/`of`/`occ`.
- Bereich: zentrale Tabelle `AREAS` im Verbund, `areaOf(e)` (Feld oder tolerant aus `app`), einmalige Nachtragung beim Start ohne Änderungszeit;
  „eigener Termin“ = kein `ro` statt ID-Präfix.
- Blatt „Termin“: Mehrtägig mit Bis-Datum, Wochentage + alle N Wochen, „jeden 1. Montag“, Stern, Warnung bei Überschneidung;
  Serie ändern/löschen fragt „Nur dieser / Dieser und alle folgenden / Alle“ (`ex`, `rep.until` + neue Serie). Löschen mit Rückgängig.
- .ics: RRULE mit INTERVAL/BYDAY, EXDATE, DTEND für mehrtägig (ganztägig exklusiv); Import liest das alles; Handykalender (hOut, Lesen) und
  Erinnerungen kennen den Zeitraum (nur am ersten Tag).
- Bereichs-Einträge (Wochenplanung, Atmung): Heute später, Morgen, Anderer Tag, Auslassen (Grund), Erledigt – nur dieser Eintrag, mit Rückgängig.
  Status ✓/ausgelassen sichtbar; Training/Mobility/Atmung erledigt automatisch aus Trainingstagebuch, Aktivitäten, Atem-Sitzungen
  (je Tag höchstens so viele, wie wirklich gemacht – nie doppelt). Wochenbilanz über der Leiste.
- Tagesplan: „Frei 14:00 bis 16:30“ ab 45 Minuten, Jetzt-Linie heute, Umschalter Liste | Zeitraster (06–22 Uhr, Überschneidungen nebeneinander).
- „Auf einen Blick“: Nächster wichtiger Termin (Stern oder Prüfung) mit „in 12 Tagen“.
- Tests: alte Daten (seed + Stand 3.5.0), Cloud mit/ohne neue Felder, .ics-Rundreise, Handykalender-Mock, Verschieben/Auslassen/Erledigt mit Rückgängig.

Wünsche während Phase 7 (Nutzerin):
- **Webkalender aus Google fehlten.** Ursache: Per Internetadresse eingebundene Google-Kalender werden von Google standardmäßig nicht aufs Handy synchronisiert;
  das Plugin las nur sichtbare, synchronisierte Kalender. Lösung in zwei Wegen: (1) Mehr › Handykalender zeigt solche Kalender als „nicht synchronisiert“
  mit Knopf zum Einschalten (Plugin `enableSync`: SYNC_EVENTS/VISIBLE + Abgleich anstoßen); (2) Mehr › Webkalender: Adresse (.ics/webcal) einfügen,
  die App holt den Kalender selbst über CapacitorHttp (ohne CORS), speichert ihn für offline und frischt alle 3 Stunden auf (`sg-abos-v1`, in der Cloud-Sicherung).
  Import versteht dabei geänderte Einzeltermine (RECURRENCE-ID) und COUNT.
- **Mobility und Atemübungen raus aus dem Kalender** (jeden Tag mehrere Einträge waren zu viel). Sie bleiben in ihren Bereichen; einschaltbar unter
  Mehr › Darstellung. Die Standardwoche wird nicht mehr automatisch jede Woche eingetragen (einmalig ausgeschaltet; von Hand weiter möglich).
- Designvorschläge: 12 Richtungen mit je zwei Bildern (Startseite, Training) – Auswahl steht aus.

Prüfung Phase 7 (Prüf-Agent, 21 Befunde):
| # | Befund | Lösung |
|---|---|---|
| 1 | „n-ter Wochentag im Monat“ endete nach Dezember | Monat in `nthDay` normalisiert |
| 2 | „Dieser und folgende“ ließ frühere Ausnahmen wieder auftauchen; „Alle“ verschob Ausnahmen nicht | Ausnahmen werden aufgeteilt bzw. mitverschoben |
| 3 | „Wieder offen“ schob den Auto-Haken auf die nächste Einheit | „offen“ verbraucht den Tagebuch-Eintrag |
| 4 | Neu planen löschte erledigte/ausgelassene/verschobene Einheiten | Vergangenes und Einträge mit Status oder Verschiebung (`from`) bleiben; `wp` folgt der neuen Woche |
| 5 | .ics erfand ein Ende (+60 min) | ohne Ende kein DTEND; mehrtägig ohne Ende 23:59 (wird beim Einlesen wieder leer) |
| 6 | `area` nachgespeichert ohne Änderungszeit → alte und neue Geräte laden endlos hoch | `area` wird nur abgeleitet, nicht gespeichert |
| 7 | Tagesplan jede Minute neu gezeichnet (Fokus weg, Tipp ins Leere) | nur Uhrzeit der Jetzt-Linie; neu zeichnen nur bei neuem Platz und ohne Fokus darin |
| 8 | Zeitraster: kurze Blöcke ohne Titel | innerer Block, Mindesthöhe 36 px, kurze einzeilig |
| 9 | Uhrzeitfelder in „Heute später“/„Anderer Tag“ ungestylt | `input[type=time]` wie die anderen Felder (50 px) |
| 10 | Kopf des Tagesplans bei 130 % abgeschnitten, Umschalter 32 px | Umschalter in eigener Zeile, 44 px, nur bei mehr als einem Termin mit Uhrzeit |
| 11 | Serientermine nie abhakbar/verschiebbar | Status je Tag (`stx`); Verschieben = dieser Tag fällt aus + Einzeltermin |
| 12 | Ungültiges „Bis“-Datum blockierte still | `min` am Feld, Hinweis im Blatt; auch Mehrtägig + zu häufige Wiederholung |
| 13 | Erledigt/ausgelassen bekam trotzdem Erinnerung bzw. ging ins Handy | Erinnerungen und Handyexport beachten den Status |
| 14 | „Danach“ zeigte laufenden mehrtägigen Termin erneut | Folgetage nie in „Danach“ |
| 15 | Dritter Zeitraum nie als Balken; Schulzeiträume ohne Balken | Bahnen je Wochenzeile; Schul- und Lehrgangszeiträume mit Tag x von y |
| 16 | „+N“ über der Tageszahl | „+N“ unter den Markierungen |
| 17 | Kachel ohne „Nächster wichtiger Termin“; 365 Tage bei jedem Zeichnen ausgerollt | Beschriftung + Vorlesetext; nur Stern-Termine und Prüfungen, zwischengespeichert |
| 18 | Schrift < 12 px, Ausgelassen per Deckkraft zu kontrastarm, feste Rotfarbe | 12 px, Farbe statt Deckkraft, Farbvariable `--now` |
| 19 | COUNT ignoriert; UNTIL bei Uhrzeit nur Datum | COUNT → Enddatum; UNTIL mit Uhrzeit als Datum-Zeit. Offen: DTSTART außerhalb von BYDAY zählt nicht mit |
| 20 | Wochentag folgte Datum nicht; Knöpfe 40 px | folgt bei einem gewählten Tag; 44 px |
| 21 | Rückgängig hinterließ `null`-Felder | stellt den alten Eintrag genau wieder her |

Veröffentlichung 3.8.0: Erster Emulator-Lauf brach ab – im Emulator starben die Google-Play-Dienste, Android beendete die App mit
(„depends on provider …FontsProvider in dying proc“); kein Fehler der App. Einmal neu gestartet: grün, Release v3.8.0 mit planer-3.8.0.apk.

### Phase 8 – Design „Material You“ (erledigt, Version 3.9.0)
Wahl der Nutzerin: Vorschlag 1 „Material You“ (Designvorschläge mit je zwei Bildern als Artefakt). Plan:
- Zentrale Farbwelt `material` in design.js (Standard, einmalig umgestellt; andere Designs wählbar), dunkles M3-Schema.
- Android 12+: Farben aus dem Hintergrundbild (neues Plugin `PlanerSystem.colors`, zwischengespeichert `sg-monet-v1`),
  Status-/Navigationsleiste in Flächenfarbe (`bars`), Vibration beim Abhaken (`haptic`); Systemschrift Roboto statt Inter.
- Hülle: Tonflächen statt Linien, M3-Leiste (80 dp, Pille), Schalter, Chips, FAB, Blätter; danach Seite für Seite schlanker
  (Terminblatt, Training, Mobility mit höchstens zwei Ebenen, Schule ohne Einrichtungsblock auf der Startseite).

Weitere Umsetzung: Training schlanker (Nebenaktionen als Textknöpfe nebeneinander), Blätter nach unten wegziehen, Vibration beim Abhaken,
Mobility behält seine Chips (früherer ausdrücklicher Wunsch) in M3-Form. Aufräumen: 3,6 MB Testbilder lagen im Hauptordner und gingen in die APK –
entfernt, `.gitignore`, Bahnplan-Tests schreiben nur noch in ihren Ordner. `CLAUDE.md` als Kurzanleitung für KI-Sitzungen (weniger Suchen = weniger Tokens).

Prüfung Phase 8 (Prüf-Agent, 16 Befunde):
| # | Befund | Lösung |
|---|---|---|
| F1 | Leiste links (Tablet, Handy quer) nur 80 px hoch | Höhe nur unter 900 px; ab 900 px `height:auto` |
| F2 | Plugin las kleine Zahlen (Kalender-/Termin-IDs) als -1: Handytermin ändern/löschen wirkte nicht, „Synchronisieren einschalten“ nie – betrifft auch 3.8.0 | `call.getData().optLong` statt `call.getLong` |
| F3 | Schule: weiße Schrift auf hellem M3-Akzent (1,7:1) | Variable `--accent-ink` = Schriftfarbe auf Akzent |
| F4 | Wochentag-Knopf im Terminblatt weiß auf hell | `--accfg` |
| F5 | M3-Feldregeln trafen die Aufgaben-Kästchen | Kästchen ausgenommen, Zeilen 48 px |
| S6 | M3-Karten im Training von design.js überstimmt | Tonfläche und Rundung zentral in design.js |
| S7 | Knöpfe/Chips 40/32 px | 44/36 px |
| S8 | Hervorhebung „Heute schon trainiert“ (externer Tag) ging verloren | Regel nur ohne `.accent` |
| H9 | Terminblatt auf dem Tablet unten eckig | ab 700 px rundum 28 px |
| H10 | Leistenfarbe nach Drehen zurückgesetzt, unten zweifarbig, Schleier über 3-Tasten-Leiste | eigene Farbe für unten, nach Drehen erneut, `setNavigationBarContrastEnforced(false)` |
| H11 | Wegziehen: Abbruch durch Systemgeste ließ Blatt verschoben | `touchcancel` setzt zurück |
| H12 | Erster Start: Violett, dann Umfärben | Hintergrundbild-Farben sofort holen, wenn noch keine gespeichert |
| H13 | Vorschau im Bereich Design zeigte Standard-Violett | gewähltes Design mit echten Farben |
| H14 | gesperrter Schalter sah aktiv aus | `:disabled` gedämpft |
| H15 | Vibration nur an zwei Stellen | auch Suche und Aufgaben im Kalenderblatt |
| H16 | Bereichsfarbe bei „Starten“ und Chips verloren | Bereichsfarbe bleibt |
Veröffentlichung 3.9.0: APK baute (neuer Android-Code kompiliert), der Emulator-Test brach wie bei 3.8.0 ab – zum zweiten Mal, also nicht Zufall:
Im Emulator starten die Play-Dienste einige Minuten nach dem Start neu (Gerätekonfiguration, `lmkd --reinit`), Android beendet die App mit, weil die
WebView deren Schrift-Dienst nutzt. Lösung im Test: nur bei genau diesem Logcat-Muster App neu öffnen und den Schritt einmal wiederholen (höchstens zweimal);
jeder andere Abbruch bleibt ein Fehler. Auf echten Handys kommt das selten vor (Play-Update) – die App startet dann einfach neu, Daten bleiben.
Ergebnis: Im nächsten Lauf trat der Neustart wieder auf (bei training/heute), wurde abgefangen, alle übrigen Prüfungen grün – Release v3.9.0 mit planer-3.9.0.apk.

## 3.9.1 – Kalenderdateien direkt öffnen
**Wunsch:** „Mach mir die App so, dass ich Kalenderdateien gleich öffnen kann“ (Anlass: Wochenplan Quali-Lehrgang als PDF → .ics-Datei).
Umsetzung: Android meldet die App für .ics/.vcs (Öffnen mit, auch über die Endung bei „unbekannter Datei“) und für „Teilen“ (Datei oder Termintext) an.
MainActivity liest die Datei (onStart/onNewIntent, eigener Faden, max. 8 MB) und gibt sie über `PlanerSystem.takeFile`/Ereignis `fileOpened` an die Hülle,
die sofort „N Termine übernehmen?“ zeigt (vorhandene werden aktualisiert, nicht doppelt). Test in apk.js.

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
