# Verlauf: Versionen, Wünsche, Fehler

Neue Einträge oben anfügen. Jeder gefundene Fehler kommt mit **Ursache** und **Lösung** hier hinein – auch kleine.
So geht nichts verloren, wenn ein Chat voll ist.

---

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
