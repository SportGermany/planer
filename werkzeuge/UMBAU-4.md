# Planer-APK: Umbau-Prompt (Auftrag für Version 4.0.0)

Quelle: Claude-Doc https://claude.ai/artifact/XcmCFjjXJBbcejyEAUedoH (Stand 20.10.2026), hier als Text gesichert. Fortschritt steht in VERLAUF.md.


## 1. Auftrag und Kontext
Du baust meine Android-App „Planer“ um: neue Kalender-Startseite, Seitenmenü statt Wischleisten, aufgeräumtes Training, neu geordnetes „Mehr“ und eine komplett überarbeitete Suche. Ich benutze die App nur als installierte APK (Capacitor, App-ID de.sportgermany.planer) auf Handy und Tablet. Entwirf, teste und baue deshalb für die APK, nicht für eine Webseite im Browser. Der Browser ist nur dein Prüfstand, weil du die APK nicht selbst starten kannst.
Lies zuerst, in dieser Reihenfolge, und fange erst danach an:
- 
werkzeuge/WISSEN.md (Gedächtnis des Projekts, feste Vorgaben, Stolperfallen) und werkzeuge/VERLAUF.md
- 
app/index.html und app/js/1-app.js (die Hülle: Navigation, Kalender, Notizen, Mehr)
- 
werkzeuge/quellen/verbund.js (Kalender-Kern, Befehlsmenü/Suche) und werkzeuge/quellen/design.js (gemeinsames Design, unifyCSS)
- 
training/index.html, schule/index.html und die Skripte darunter
- 
werkzeuge/tests/ (Suiten) und werkzeuge/apk/ (Capacitor-Projekt)
Wie die App heute aufgebaut ist (aus dem Code, bitte selbst gegenprüfen, Zeilennummern können sich verschieben):
- 
Die Hülle app/ hat fünf Ziele unten (Tablet ab 900 px: Leiste links): Kalender, Training, Mobility, Schule, Mehr.
- 
Die Bereiche sind die bisherigen Seiten als <iframe>. Ihre Unterpunkte steuert die Hülle über die Tabelle V in app/js/1-app.js: Eintrag secs (obere Chip-Reihe), kids (zweite Chip-Reihe), p (Seite), h (Sprungadresse) und s + sel (die Hülle klickt einen Knopf in der ausgeblendeten Leiste der eingebetteten Seite, siehe apply()).
- 
Der Kalender (renderCal()) zeigt Woche oder Monat, darunter Tagesplan und „Danach“. „Mehr“ (renderMehr()) ist eine lange Liste in drei Gruppen.
- 
Die Suche ist die Befehlspalette in verbund.js (globalCommands(), palItems(), openPalette()). Die Hülle öffnet sie über SharedCalendar.palette().
- 
Die Version steht in werkzeuge/build.py (VERSION), aktuell 3.5.0. Der Build kopiert werkzeuge/quellen/* nach sg/.
Feste Regeln aus WISSEN.md, die jede Änderung einhalten muss:
- 
100 % offline: jede Funktion, jedes Textfeld läuft ohne Netz.
- 
Eine App, nichts springt heraus: alles bleibt unter /planer/.
- 
Bestehende Funktionen werden nicht entfernt, nur umgeordnet, eingeklappt oder besser erreichbar gemacht, außer ich sage es ausdrücklich.
- 
Gemeinsames nur in werkzeuge/quellen/ ändern, nie von Hand in sg/.
- 
Design nicht pro Seite, sondern zentral in unifyCSS (design.js); einheitliche Karten, Knöpfe, Abstände, dunkel, Android-gerecht, alle zehn Farbwelten bleiben nutzbar.
- 
Bei jeder Veröffentlichung die Version erhöhen; versionCode = Major·10000 + Minor·100 + Patch muss steigen.
- 
Die Signatur-Datei werkzeuge/apk/planer-schluessel.enc nie neu erzeugen.
- 
Commit-Regeln aus WISSEN.md Punkt 8 einhalten (kein Modellname in Commits oder Code).
- 
Stolperfallen aus WISSEN.md Abschnitt 5 beachten, vor allem: kein 100dvh in der Hülle, Grid-Spalten immer minmax(0,1fr), im Ruhezustand unsichtbare Elemente mit pointer-events:none, nie scrollIntoView (nur Container scrollen), wichtige Aktionen sofort speichern.

## 2. Ziel, Entscheidungen und Rückfragen
Nach dem Umbau soll das Wichtigste auf einen Blick sichtbar sein (heute, starten), die Navigation ohne Wischleisten auskommen und die Suche alles finden und anlegen können.
Mein Wunsch, in meinen Worten zusammengefasst:
- 
Kalender: Die obere Zeile mit den Daten bleibt. Der Tagesplan („Termine für heute“) wandert nach oben. Darunter kommt ein großer Kalender, in dem ich jeden Tag antippen kann und seine Einträge sehe.
- 
Bibel und das übrige „Mehr“-Drumherum passt inhaltlich.
- 
Training: Unten auf „Training“ tippen öffnet ein Seitenmenü, aus dem ich Laufen, Kraft, Rodeln und so weiter wähle. Die Chip-Leiste oben ist zu voll. Alle Trainingsseiten werden viel kürzer und aufgeräumter, damit ich fast alles auf einen Blick sehe und schnell starten kann.
- 
Mobility gefällt mir, so lassen.
- 
Schule und überall sonst: keine Wischleiste oben, sondern neben dem Titel ein Symbol, das ein Seitenmenü öffnet (Schultag, Stundenplan, Aufgaben und Prüfungen und so weiter).
- 
Mehr: aufräumen und durchdacht ordnen, also für jeden Punkt klären, wohin er am besten gehört.
- 
Suche: die Suchleiste vollständig überarbeiten und um neue Befehle erweitern.
- 
Qualität: großer Umbau, deshalb mit Plan arbeiten und am Ende alles auf Fehler prüfen.
Nicht-Ziele: kein Server oder Netz-Zwang, keine Funktion löschen, Inhalt und Aussehen von Mobility und Bibel bleiben, die Datenformate (localStorage-Schlüssel, Umzugsdatei, Cloud-Sicherung per Gist) bleiben kompatibel.
Entscheidungen mit Standardwert. Gilt der Standard, setze ihn um und notiere ihn in werkzeuge/VERLAUF.md. Eine Rückfrage stellst du nur, wo es hier keinen Standard gibt, mit AskUserQuestion und höchstens fünf Fragen.
 | 
Frage | 
Standard
 | 
Laufen und Kraft getrennt im Seitenmenü? | 
Ja, zwei Einträge. Beide zeigen dieselbe Seite mit je eigenem Ausschnitt (heute ein Chip „Laufen & Kraft“).
 | 
Bekommt Mobility auch das Seitenmenü? | 
Inhalt und Aussehen unverändert, Navigation bleibt vorerst bei den Chips. Die Seitenmenü-Komponente wird aber so gebaut, dass ein Schalter in der Tabelle V genügt.
 | 
Was passiert beim Tipp auf einen Tag im großen Monatskalender? | 
Der Tag wird gewählt, der Tagesplan oben zeigt ihn, die Ansicht scrollt (nur der Container) weich nach oben. Langer Druck auf einen Tag öffnet „Neuer Eintrag“ für diesen Tag.
 | 
Bibel und Pause? | 
Gleiches Seitenmenü statt Chips, Inhalt unverändert.
 | 
Seitenmenü öffnen? | 
Über das Symbol links im Kopf. Wischen vom linken Rand bleibt aus, weil es mit der Android-Zurückgeste kollidiert.
 | 
Tablet ab 900 px? | 
Das Seitenmenü steht dauerhaft als zweite Spalte neben der Navigationsleiste.
 | 
Neue Version? | 
4.0.0 (großer Umbau).

## 3. Phasenplan
Arbeite in zehn Phasen, in dieser Reihenfolge. Keine Phase beginnt, solange die Tests der vorigen rot sind. Lege vor dem Start eine Aufgabenliste mit allen Phasen an und hake sie ab. Am Ende jeder Phase prüft ein frischer Prüf-Agent, der deinen Arbeitsverlauf nicht kennt, die Änderung gegen die Abnahme der Phase und gegen Abschnitt 12.
 | 
Phase | 
Inhalt | 
Abnahme | 
Version
 | 
0. Vorbereitung | 
Alles aus Abschnitt 1 lesen. Bestandsaufnahme speichern: je Seite alle Karten (data-sec), Knöpfe, Chips und Befehle als werkzeuge/tests/inventar-vorher.json. Ausgangstests laufen lassen (suite3.js, offline3.js, apk.js). Plan und Annahmen in VERLAUF.md. | 
Ausgangstests grün oder Fehler dokumentiert; Inventar liegt vor | 
–
 | 
1. Kalender-Startseite | 
Abschnitt 4 | 
Abnahme dort | 
3.6.0
 | 
2. Seitenmenü-Baustein | 
Abschnitt 5: Komponente, neue Kopfzeile, Umstellung von Schule, Bibel, Pause, Training (nur Gerüst) | 
Alle alten Chip-Ziele über das Seitenmenü erreichbar, Zurück-Taste korrekt | 
–
 | 
3. Training aufräumen | 
Abschnitt 6 | 
Abnahme dort | 
–
 | 
4. Schule, Bibel, Pause, Mobility | 
Abschnitt 7 | 
Mobility unverändert | 
3.7.0
 | 
5. Mehr | 
Abschnitt 8 | 
Jeder frühere Eintrag noch erreichbar | 
–
 | 
6. Suche | 
Abschnitt 9 | 
Abnahme dort | 
–
 | 
7. Kalender-Verbesserungen | 
Abschnitt 10 | 
Abnahme dort | 
3.8.0
 | 
8. Querschnitt | 
Abschnitt 11 als letzter Durchgang über alle Seiten | 
Prüfliste dort | 
–
 | 
9. Abnahme | 
Abschnitt 12, Inventar vorher/nachher vergleichen, Version 4.0.0, Dokumentation | 
Alle Kriterien erfüllt, APK-Build und Emulator-Test grün | 
4.0.0
Arbeitsweise in jeder Phase:
- 
Kurzen Plan der Phase in VERLAUF.md schreiben (welche Dateien, welche Funktionen, welche Tests).
- 
In kleinen Schritten ändern, nach jedem Schritt python3 werkzeuge/build.py und die betroffenen Tests.
- 
Neue Tests für alles Neue schreiben (Seitenmenü, Kalender-Raster, Suchparser, Suchergebnisse). Bestehende Tests, die Chips oder alte Texte anklicken, auf die neue Bedienung umstellen. Ändere nie einen Test nur, damit er grün wird: erst klären, ob der Test oder der Code recht hat.
- 
Ein Commit je abgeschlossenem Schritt, mit aussagekräftiger Beschreibung.
- 
Pushen nur nach den Phasen mit Versionsnummer in der Tabelle. Jeder Push mit höherer Version baut auf GitHub ein APK-Release, so kann ich Zwischenstände auf dem Handy prüfen. Der Bau läuft nur auf GitHub (.github/workflows/apk.yml), im Container fehlt das Android-SDK.

## 4. Phase 1: Kalender-Startseite neu aufbauen
Die Startseite zeigt von oben nach unten: Kopf, Wochenleiste, Tagesplan, großer Monatskalender, „Auf einen Blick“, „Danach“. Alles lebt weiter in app/js/1-app.js (renderCal() und Helfer) und app/index.html (CSS). Teile renderCal() in drei Funktionen, die sich einzeln neu zeichnen: renderStrip(), renderDay() und renderMonth(). Das spart Arbeit und verhindert, dass beim Abhaken oder Wischen die Scrollposition springt.
Reihenfolge und Inhalt:
- 
Kopf wie bisher: Titel „Kalender“, Suchsymbol, „+“ unten rechts.
- 
Wochenleiste (bleibt, wie ich sie will). Eine Zeile mit sieben Tagen, Punkte unter den Zahlen, „Heute“-Knopf. Neu in der Kopfzeile darüber: „KW 43 · Oktober 2026“. Bei einer Woche über die Monatsgrenze „Okt/Nov 2026“. Der Schalter Woche/Monat entfällt, weil der Monat jetzt als großer Kalender darunter steht (die Funktion bleibt also erhalten). Wischen auf der Leiste springt um sieben Tage.
- 
Tagesplan direkt darunter (heute oder der gewählte Tag). Kopfzeile „Heute · Montag, 26. Oktober“ mit „+ Eintrag“. Danach die Einträge wie heute (evRow, taskRow, „Starten“ am Eintrag nur an heutigen Tagen), ganztägige Einträge gebündelt ganz oben mit der Zeitangabe „ganztägig“ statt „ganzt.“. Leerer Tag: bisheriger Leerzustand mit „Woche planen“ und „Standardwoche übernehmen“.
- 
Großer Monatskalender (Beschreibung unten).
- 
„Auf einen Blick“ wie bisher, nur an heutigen Tagen, höchstens vier Karten in zwei Spalten.
- 
„Danach“ auf die nächsten fünf Einträge über alle Tage gekürzt, mit Datum. Fällige Aufgaben erscheinen auch hier.
Großer Monatskalender:
- 
Kopf: Pfeile für Vor- und Zurück, Monat und Jahr in der Mitte, „Heute“. Tipp auf Monat und Jahr öffnet ein Blatt zum Springen auf Monat und Jahr. Der angezeigte Monat (calMonth) folgt der Wahl in der Wochenleiste, lässt sich aber mit den Pfeilen unabhängig durchblättern, ohne den gewählten Tag zu ändern.
- 
Raster: Kopfzeile Mo bis So, davor eine schmale Spalte mit der Kalenderwoche, immer sechs Zeilen. Die Zellen sind hoch genug (Ziel 64 bis 76 px), damit der Kalender wirklich „groß“ wirkt und Tippen sicher klappt.
- 
Zelle: Tageszahl (heute mit Ring, gewählter Tag gefüllt, Tage anderer Monate gedämpft, Wochenende leicht abgesetzt). Darunter bis zu drei Einträge. Auf dem Handy als farbige Balken (4 px hoch, Farbe nach Bereich, AREA[...]) und „+N“ bei mehr als drei. Ab 600 px Breite (Tablet, quer) als kleine Zeilen mit abgeschnittenem Titel in mindestens 11 px. Farbe allein reicht nicht: Training, Mobility, Atmung, Schule, Aufgabe, Notiz und Termin bekommen zusätzlich ein eigenes kleines Symbol aus der Symbolliste P im Tagesplan, und eine „Legende“ (Link unter dem Raster) erklärt Farben und Symbole.
- 
Ferien und Feiertage dezent als Hintergrund markieren, aber nur, wenn die Schule-Seite sie bereits als Einträge liefert (sie rechnet sie in publishLessons()). Baue dafür keine neue Datenquelle.
- 
Tippen wählt den Tag (calSel), der Tagesplan oben zeigt ihn und die Ansicht scrollt weich (Animation etwa 250 ms, nur der Container #n-kalender, nie scrollIntoView) nach oben. Ein kleiner schwebender Knopf „Zum Monat“ springt zurück zum Raster, solange der Tagesplan oben im Bild ist und das Raster nicht.
- 
Langer Druck (etwa 450 ms) auf einen Tag öffnet das Blatt „Neu“ (addSheet()) für genau diesen Tag. Das gilt auch für leere Tage.
- 
Wischen nach links oder rechts wechselt den Monat mit Schiebe-Animation. Der gewählte Tag bleibt gleich (bei kürzerem Monat der letzte Tag des Monats). Bisher sprang die Auswahl auf den 1. (setMonth(…, 1)), das ist ein Fehler. Wischen funktioniert auf dem ganzen Raster, nicht nur auf einem Streifen.
- 
Barrierefreiheit: Raster mit role="grid", jede Zelle ein Knopf mit aria-label wie „Montag, 26. Oktober, 3 Einträge, heute“ und aria-pressed beim gewählten Tag.
Daten: Lade die Einträge für das sichtbare Raster einmal pro Zeichnen mit items(from, to) (die 42 Zellen plus eine Woche Puffer) und gib sie an renderStrip, renderDay und renderMonth weiter. Rechne Punkte und Balken aus derselben Liste, nicht mit eigenen Abfragen.
Abnahme Phase 1:
- 
Auf 360 × 800 dp ohne Scrollen sichtbar: Kopf, Wochenleiste und Tagesplan mit mindestens zwei Einträgen. Der Monatskalender folgt nach einem Bildschirm Scrollen und passt ohne horizontales Scrollen.
- 
Alles, was es vorher auf der Startseite gab, ist weiterhin erreichbar: „Heute“, „+ Eintrag“, „Woche planen“, „Standardwoche“, Abhaken von Aufgaben mit Rückgängig, „Starten“, Eintrag-Details und Bearbeiten, Handytermine ändern und löschen, „Auf einen Blick“.
- 
Tippen, langer Druck und Wischen wie oben, mit Tests in suite3.js (Playwright, Touch-Ereignisse simulieren).
- 
Schriftgröße 130 % und Anzeigegröße „groß“ zerbrechen nichts. Alle zehn Farbwelten bleiben lesbar.
- 
Keine Fehler in der Konsole (pageerror und console.error im Test fangen).

## 5. Phase 2: Seitenmenü statt Chip-Leiste, überall
Baue einen wiederverwendbaren Seitenmenü-Baustein in app/js/1-app.js und app/index.html, der die Chip-Reihen (#chips, .crow) ersetzt. Er wird aus der bestehenden Tabelle V gespeist, damit Adressen, apply() und gemerkte Auswahl (sg-app-v1, M.sec, M.kid) unverändert weiterlaufen und niemand Daten verliert.
Welche Ziele das Seitenmenü bekommen:
 | 
Ziel | 
Einträge im Seitenmenü
 | 
Training | 
Heute · Laufen · Kraft · Rodeln (darunter Kurvenbuch, Bahnen, Läufe und Zeiten, Drucken) · Auswertung (darunter Fitness, Analyse) · Sportwissenschaft (darunter Lesen, Karteikarten, Quiz, Suche) · unten: Training einstellen
 | 
Schule | 
Schultag · Stundenplan · Aufgaben und Prüfungen · Lernplan · Schuljahr und Ferien
 | 
Bibel | 
Heute · Weiterlesen · Bibliothek · Meine Bibel · Einstellungen
 | 
Pause | 
Ablenken · Wissen · Quiz · Verlauf · Einstellungen
 | 
Mobility | 
bleibt bei den Chips, wie ich es will (siehe Abschnitt 2); in V kommt ein Feld nav dazu ("drawer" oder "chips"), Mobility bekommt "chips", alle anderen "drawer"
Neue Kopfzeile (.top):
- 
Links das Seitenmenü-Symbol (44 × 44 px, Antipp-Fläche mindestens so groß), direkt daneben der Titel. Auf Unterseiten von „Mehr“ steht zusätzlich der Zurück-Pfeil ganz links, das Symbol rechts daneben.
- 
Unter dem Titel eine kleine zweite Zeile mit dem aktuellen Pfad, zum Beispiel „Rodeln · Kurvenbuch“. Tipp darauf öffnet ebenfalls das Seitenmenü.
- 
Rechts das Suchsymbol wie bisher.
- 
Die Zeile mit den Chips entfällt für Ziele mit Seitenmenü. Der gewonnene Platz gehört dem Inhalt.
Verhalten des Seitenmenüs:
- 
Öffnen: Symbol, Pfadzeile oder erneuter Tipp auf den bereits aktiven unteren Tab. Beim Wechsel zu einem Ziel zeigt die App wie bisher die zuletzt benutzte Unterseite. Das Seitenmenü öffnet sich nicht von selbst (optional als Schalter unter Mehr, Standard aus).
- 
Schließen: Tipp auf den dunklen Hintergrund, Tipp auf einen Eintrag, Wischen nach links auf dem Menü, Android-Zurück. Das Seitenmenü legt dazu beim Öffnen einen Verlaufseintrag an (history.pushState({app:1, drawer:1})) und der popstate-Handler schließt zuerst das Seitenmenü, dann das Blatt (sheet), erst dann wird navigiert.
- 
Wischen vom linken Bildrand öffnet nicht, weil das mit der Android-Zurückgeste kollidiert.
- 
Aufbau: Breite min(86vw, 320px), Gruppenüberschriften, Einträge mindestens 56 px hoch, der aktive Eintrag mit einer Pille in der Bereichsfarbe. Untereinträge klappen unter ihrem Eintrag auf, der aktive Eintrag ist aufgeklappt, nur einer zur Zeit. Am Ende „Zurück zu Mehr“ bei Unterseiten von „Mehr“ und „Training einstellen“ im Training.
- 
Animation etwa 220 ms, bei prefers-reduced-motion ohne Bewegung. Ränder: Innenabstand mit --top, --bot und links/rechts im Querformat über --safe-area-inset-*.
- 
Barrierefreiheit: role="dialog", aria-modal="true", aria-label="Bereichsmenü", Fokus auf den aktiven Eintrag, nach dem Schließen zurück auf das Symbol.
- 
Ebene: über der unteren Leiste, aber unter dem Behälter #sg-shared-calendar (Hinweise des Verbunds müssen darüber liegen, siehe Stolperfallen).
- 
Tablet ab 900 px: Das Seitenmenü steht dauerhaft als zweite Spalte (260 px) neben der Navigationsleiste (92 px), das Symbol entfällt. Grid-Spalten immer mit minmax(0,1fr).
Technik:
- 
Auswahl läuft wie bei den Chips über go(cur.v, sec, kid, { push: false }). Die Mechanik apply() (Knopf in der ausgeblendeten Leiste der Seite anklicken) bleibt.
- 
Alle bekannten Adressen aus WISSEN.md (#training/rodeln/plan, #mobility/atmung/hrv, #schule/plan, #bibel/lesen, #u=…) und die Sprünge der eingebetteten Seiten (SGShell.openUrl, openModule) funktionieren unverändert.
- 
Neue Skriptdatei nur, wenn nötig. Dann in werkzeuge/build.py und der Dateiliste von sw.js eintragen und nachprüfen, dass sie in den Offline-Test kommt.
Abnahme Phase 2:
- 
Ein Test läuft jeden Pfad (Ziel, Eintrag, Untereintrag) aus V über das Seitenmenü ab und prüft, dass die richtige eingebettete Seite sichtbar ist und der richtige Unterbereich aktiv ist.
- 
Zurück-Taste: erst Seitenmenü zu, dann Blatt zu, dann Seite zurück. Mit Test.
- 
Drei Fenstergrößen im Test: 360 × 800, 800 × 1280 (Tablet hoch), 1280 × 800 (Tablet quer). Dazu 360 × 640 (kleines Handy) und Schrift 130 %.
- 
Keine Chip-Reihe mehr in Training, Schule, Bibel, Pause. Mobility unverändert.

## 6. Phase 3: Training aufräumen, Seite für Seite
Die Trainingsseite (training/index.html, Skripte in training/js/) ist zu voll. Ziel: Jede Seite zeigt in den ersten 800 dp ihre wichtigste Aktion und die drei wichtigsten Zahlen, der Rest ist eingeklappt oder eine Ebene tiefer. Nach Regel 3 aus WISSEN.md wird nichts gelöscht: Karten wandern, klappen zu oder stehen hinter „Mehr anzeigen“. Die Karten sind im HTML mit data-sec benannt. Prüfe zuerst, ob damit schon eine Ein- und Ausblend-Funktion besteht (Einstellungen unter „Training einstellen“), und nutze sie, statt eine zweite zu bauen.
Allgemeine Regeln für alle Trainingsseiten:
- 
Eine Hauptaktion pro Seite, groß, oben: der Knopf „Starten“ mit klarer Beschriftung (zum Beispiel „Ganzkörper starten, 45 min“).
- 
Kopfzeile statt Karte: Kennzahlen als schmale Reihe von zwei bis vier Werten (zum Beispiel Bereitschaft, Wetter, Wochenfortschritt) statt je einer eigenen Karte.
- 
Einklappbare Karten (Akkordeon): zugeklappt zeigt jede Karte Titel und eine Zeile mit der Kernzahl („Diese Woche: 3 von 5 Einheiten“). Aufklappen zeigt die Details. Der Zustand wird gemerkt (eigener Schlüssel, zum Beispiel in sg-app-v1).
- 
Bedingte Hinweise (krank, verletzt, „Neu in Version“, importierte Daten, Alternative für heute) erscheinen nur, wenn sie zutreffen, als schmaler Hinweisstreifen (eine Zeile, Tipp öffnet Details), nie als große Karte.
- 
Verläufe und Statistiken (Lauf-Statistik, Rodeln-Verlauf, Gym-Verlauf, Dehn-Verlauf, Lieblingssport, Cool-down-Status) wandern in einen Abschnitt „Verlauf“ am Ende der jeweiligen Seite oder nach „Auswertung“.
- 
Texte kürzen. Jede Karte hat höchstens einen Satz Erklärung, Erklärungen länger als zwei Zeilen werden zu einem „Info“-Symbol.
Seite „Heute“. Heute stehen hier bis zu elf Karten untereinander (Neu in Version, Wetter, krank, verletzt, Trainingsbereitschaft, Alternative für heute, Heldenkarte mit Titel, „Deine Übungen heute“, Woche, importierte Daten, Tipp). Neuer Aufbau:
- 
Oben die Heldenkarte mit Titel, Dauer und dem großen Startknopf.
- 
Direkt darunter die Kennzahlenreihe: Bereitschaft (mit Ampelfarbe), Wetter (eine Zeile), Wochenfortschritt als sieben kleine Punkte (Mo bis So, heute markiert).
- 
„Deine Übungen heute“ als zugeklapptes Akkordeon („8 Übungen“). Aufklappen zeigt die Liste.
- 
Krank-/Verletzt-Nachfrage und „Alternative für heute“ als Hinweisstreifen, nur wenn nötig.
- 
„Neu in Version“, „Importierte Daten“ und „Tipp“ ganz unten, zugeklappt.
Die bisherige Seite „Laufen und Kraft“ wird in zwei Seiten geteilt:
- 
Laufen: „Lauf live tracken“ (GPS und Herzfrequenz) als Hauptaktion, Distanz wählen, „Nächster Lauftag“, darunter zugeklappt Lauf-Statistik und „Zuletzt erfasst“.
- 
Kraft: „Programm starten: Gym-Training“ als Hauptaktion, „Aktiv Dehnen und Mobility“ (die 120 Übungen) als zweite Kachel, darunter zugeklappt Gym-Verlauf und Dehn-Verlauf. „Cool-down nach dem Training“ als Hinweis, wenn fällig.
- 
Beide Seiten sind Ausschnitte derselben HTML-Seite. Setze das über eine Adresse (#lauf, #kraft) und das Ein- und Ausblenden per data-sec, nicht durch Kopieren des Inhalts. Die Adresse #lauf muss weiter funktionieren (alte Verweise, Befehle).
Rodeln (training/bahnplan/): Die Struktur Kurvenbuch, Bahnen, Läufe und Zeiten, Drucken bleibt als Untereinträge im Seitenmenü. Innen nur die Aufräum-Regeln oben anwenden. Keine eigenen Bahnzeichnungen, nur Wikipedia-Bilder (Regel 4).
Auswertung hat heute sehr viele Karten (Kilometer pro Woche, Aktivitäten, Export, Trainingsbericht als PDF, Fitness-Wert, Wochenrückblick, Persönliche Rekorde, Abzeichen und mehr). Neuer Aufbau:
- 
Oben der Fitness-Wert als große Kennzahl mit Trend.
- 
Darunter drei bis vier Kennzahlenkacheln (Woche, Monat, Serie, Rekorde), Tipp öffnet jeweils die Details.
- 
Alles andere als zugeklappte Karten in sinnvollen Gruppen: Fortschritt · Aktivitäten · Berichte und Export.
Kalender-Karten im Training (Kalenderraster, Monatsrückblick, Serien-Verlauf, Nächste Termine, Jahresfortschritt, Krankheits- und Verletzungsübersicht, Woche im Überblick) doppeln den neuen Kalender der Startseite. Entferne sie nicht, sondern bündle sie in der Auswertung unter „Kalender und Rückblick“, zugeklappt. Der Trainingsplan-Teil im Hauptkalender bleibt die Hauptstelle für Termine.
Sportwissenschaft bleibt wie sie ist (Lesen, Karteikarten, Quiz, Suche). Prüfe nur, dass Lesefortschritt und Karten-Zähler im „Auf einen Blick“ der Startseite weiter ankommen.
Abnahme Phase 3:
- 
Auf 360 × 800 dp zeigt jede Trainingsseite ohne Scrollen ihre Hauptaktion. „Heute“ kommt mit höchstens drei Bildschirmhöhen Scrollen aus, auch wenn alle Karten aufgeklappt sind.
- 
Das Inventar nachher (inventar-nachher.json) enthält jede Karte und jede Funktion aus dem Inventar vorher, entweder an alter oder an dokumentierter neuer Stelle (Tabelle in VERLAUF.md).
- 
Alle Starts funktionieren: Training, Gym, Laufen mit GPS und Herzfrequenz (Test mit Dummy-Daten), Dehnen, Rodeln vorbereiten.
- 
Zustand der Akkordeons bleibt nach Neustart erhalten.

## 7. Phase 4: Schule, Bibel, Pause; Mobility bleibt
Schule (schule/index.html, schule/js/1-app.js, rund 235 KB Skript): Die fünf Unterseiten laufen über das Seitenmenü aus Phase 2 (Schultag, Stundenplan, Aufgaben und Prüfungen, Lernplan, Schuljahr und Ferien). Die Hülle klickt weiter auf die ausgeblendete Leiste .tab[data-v=…], ändere deren Knöpfe also nicht, ohne V anzupassen. Lies die Seite durch und wende dann dieselben Aufräum-Regeln wie in Abschnitt 6 an. Konkrete Vorgaben:
- 
Schultag zeigt oben die aktuelle oder nächste Stunde (Fach, Raum, Beginn in Minuten), darunter den Stundenplan von heute als kompakte Liste, dann offene Hausaufgaben mit Fälligkeit und die nächste Prüfung mit Countdown („in 6 Tagen“). Alles Weitere zugeklappt.
- 
Aufgaben und Prüfungen bekommen einen Segmentschalter mit höchstens drei Einträgen (zum Beispiel Offen, Prüfungen, Erledigt). Überfälliges steht zuerst und ist deutlich markiert, Prüfungen zeigen Countdown.
- 
Stundenplan und Schuljahr und Ferien bleiben inhaltlich, nur Abstände und Karten vereinheitlichen.
- 
Lernplan bleibt inhaltlich. Prüfe, dass automatisch eingetragene Lernblöcke im neuen Monatskalender erscheinen.
Regel für alle Seiten: Keine horizontal scrollenden Chip-Reihen mehr, auch nicht innerhalb der eingebetteten Seiten. Wo eine Seite intern umschaltet (zum Beispiel Heute, Geplant, Wichtig, Erledigt bei den Aufgaben), nimm einen festen Segmentschalter mit höchstens drei bis vier kurzen Einträgen, die nebeneinander passen. Mehr Auswahl gehört ins Seitenmenü oder in einen Filter, der als Blatt aufgeht.
Bibel und Pause: nur Navigation (Seitenmenü statt Chips), Inhalt und Texte unverändert. Die Offline-Bibel (Elberfelder 1905, bibel/elb1905.json) darf nicht angetastet werden. Prüfe, dass Serie, „Gelesen ✓“ und Leseplan weiter in „Auf einen Blick“ erscheinen (zweiminutenbibel_v2).
Mobility bleibt inhaltlich und optisch unverändert, weil es mir so gefällt. Prüfe nur, dass es in der neuen Kopfzeile sauber sitzt: eigene Chips (Mobility, Atmung und HRV mit Untereinträgen) funktionieren, die Pfadzeile unter dem Titel zeigt zum Beispiel „Atmung und HRV · Üben“, Abstände zur Kopfzeile stimmen, die Polar-H10-Messung und der 12-Wochen-Plan laufen. Änderungen an training/mobility/ und training/atmung/ sind ohne Rückfrage tabu.
Abnahme Phase 4:
- 
Jede Schulseite ist über das Seitenmenü erreichbar und zeigt den richtigen Inhalt.
- 
Es gibt in der ganzen App keine horizontal scrollende Chip-Reihe mehr, außer in Mobility. Prüfe das per Test (CSS overflow-x:auto bei .crow und ähnlichen Klassen suchen).
- 
Mobility besteht seine Tests unverändert (Bildvergleich vorher und nachher, Abweichungen nur in der Kopfzeile).

## 8. Phase 5: Mehr neu ordnen
Heute ist „Mehr“ (renderMehr() in app/js/1-app.js) eine lange Liste mit drei Gruppen, in der Einstellungen, Umzug, Update und Lernseiten durcheinander stehen. Ordne sie nach dem Zweck. Jeder Punkt hat genau einen Hauptort. Wo ein Punkt aus Bequemlichkeit an zweiter Stelle auftaucht (zum Beispiel Sportwissenschaft, Training einstellen), ist es eine Verknüpfung mit kleinem „↗“-Symbol, die zum Hauptort springt.
 | 
Gruppe | 
Einträge | 
Hauptort / Hinweis
 | 
Planen | 
Aufgaben, Notizen, Woche planen, Standardwoche übernehmen | 
Hauptort hier. „Woche planen“ bleibt zusätzlich im Blatt „Neu“ des Kalenders.
 | 
Lesen und Lernen | 
Bibel, Sportwissenschaft ↗, Pause | 
Sportwissenschaft hat ihren Hauptort im Seitenmenü Training.
 | 
Abgleich und Sicherung | 
Handykalender, Erinnerungen, Cloud-Sicherung, Alles als Datei sichern, Daten aus Chrome übernehmen oder In die Android-App umziehen | 
Jede Zeile zeigt ihren Zustand rechts (siehe unten). Der Umzug erscheint groß nur, solange er nicht erledigt ist (sg-umzug-v1 fehlt), danach als kleine Zeile.
 | 
Darstellung und Einstellungen | 
Design (Farbwelt und Glaseffekt), Training einstellen ↗, App installieren (nur im Browser), Seitenmenü beim Wechsel automatisch öffnen (neu, Standard aus) | 
Training einstellen hat seinen Hauptort im Seitenmenü Training.
 | 
Über die App | 
Version und Update, Was ist neu, Fehlerprotokoll (SGShellDiag()) | 
Das Fehlerprotokoll macht Fehlersuche am Handy möglich.
Zustand in jeder Zeile (rechte Spalte .val):
- 
Handykalender: „Abgleich an, zuletzt heute 08:12“ oder „Aus“.
- 
Erinnerungen: „An, 12 geplant“ oder „Aus“.
- 
Cloud-Sicherung: „Zuletzt gesichert vor 2 Std.“, in Warnfarbe und mit Ausrufezeichen, wenn länger als sieben Tage nichts gesichert wurde oder ein Fehler vorliegt. Zusätzlich dieselbe Warnung als kleiner Punkt am Tab „Mehr“, damit sie nicht untergeht.
- 
Aufgaben und Notizen: Zahl der offenen.
- 
Version: aktuelle Nummer, „Neue Version verfügbar“, wenn bekannt.
Gestaltung:
- 
Gruppen mit Überschrift und Karte wie bisher (.grp, .cells, .row), aber kürzere Untertitel (eine Zeile) und gleichmäßige Zeilenhöhe von mindestens 60 px.
- 
Oben ein Suchfeld „Einstellungen und Seiten suchen“, das die neue Suche aus Abschnitt 9 vorbefüllt öffnet, statt eine zweite Suche zu bauen.
- 
Lange Einstellungs-Blätter (Handykalender, Erinnerungen) bleiben Blätter von unten, mit Schaltern im Stil der übrigen App (chk() in 1-app.js). Vereinheitliche Schalter, Texte und Knopfreihenfolge (Abbrechen links, Hauptaktion rechts).
- 
Die APK-Einrichtung „Fast fertig“ (setupSheet(), Merker sg-apk-setup) bleibt unverändert und verweist auf dieselben Blätter.
Abnahme Phase 5:
- 
Jeder Eintrag von früher ist noch erreichbar (Inventar vorher/nachher, Tabelle der neuen Orte in VERLAUF.md).
- 
„Mehr“ passt auf 360 × 800 dp in höchstens zwei Bildschirmhöhen.
- 
Zustandsanzeigen stimmen (Test mit gesetztem und leerem sg-shared-calendar-sync, mit und ohne sg-umzug-v1).

## 9. Phase 6: Suche und Befehle komplett überarbeiten
Heute: Die Suche ist die Befehlspalette in werkzeuge/quellen/verbund.js (globalCommands(), palItems(), openPalette(), palRender()). Sie ist für Tastatur gebaut (Pfeile, Enter, Esc, Strg K), findet Befehle und Einträge nur per Wortteil-Suche, durchsucht Termine nur von 60 Tage zurück bis 120 Tage voraus, zeigt höchstens 60 Treffer, kennt nur „Aufgabe anlegen“ als Schnelleingabe und führt Befehle aus der alten Mehr-App-Struktur („Apps öffnen“, „Planer › Kalender“, „Training-Kalender“). Hooks, die es schon gibt: api.addCommands(list), api.setPalette(fn) (ersetzt die Oberfläche), api.commands(), api.wordsMatch(). Die Hülle öffnet die Suche über SharedCalendar.palette() (auch aus openUrl bei #befehle). Prüfe außerdem, ob das Suchsymbol in app/js/1-app.js (data-act="search") überall einen Klick-Handler hat.
Ziel: Eine Vollbild-Suche für das Handy, die Inhalte findet, Befehle ausführt und mit einem Satz Einträge anlegt. Baue sie in der Hülle und registriere sie mit SharedCalendar.setPalette(fn), damit jeder bisherige Aufruf (Symbol, #befehle, Strg K am Tablet) sie öffnet. Fällt sie aus, bleibt die alte Palette als Rückfall.

### Oberfläche
- 
Vollbild, nicht als kleines Fenster. Oben Zurück-Pfeil, Eingabefeld (automatischer Fokus, enterkeyhint="search", autocomplete="off", spellcheck="false", Löschen-Knopf), Zählung der Treffer für Screenreader (aria-live="polite").
- 
Filter als umbrechende Chips (keine Wischleiste): Alles · Termine · Aufgaben · Notizen · Training · Schule · Bibel · Wissen · Befehle. Aus welcher Seite die Suche geöffnet wurde, bestimmt den Vorschlag (aus Training: Training zuerst), der Standard bleibt „Alles“.
- 
Leerer Zustand: „Zuletzt“ (letzte acht Suchen und Befehle, mit „Löschen“), „Schnell anlegen“ (Termin, Aufgabe, Notiz, Woche planen), „Häufig“ (nach Benutzung gezählt).
- 
Treffer in Gruppen mit höchstens drei Zeilen je Gruppe und „Alle N anzeigen“. Zeile: Symbol in Bereichsfarbe, Titel mit hervorgehobenem Treffer, Unterzeile (Bereich, Datum, Uhrzeit), rechts Pfeil. Aktionen direkt in der Zeile: Aufgabe abhaken, Termin im Kalender öffnen.
- 
Die Tastatur darf Ergebnisse nicht verdecken: Höhe über visualViewport, nicht 100dvh. Android-Zurück schließt die Suche (Verlaufseintrag wie beim Seitenmenü).

### Schnelleingabe in einem Satz
Eine reine Funktion parseQuick(text, jetzt) (eigene Datei in werkzeuge/quellen/, mit Node-Tests in werkzeuge/tests/schnell.js, mindestens 60 Beispiele) erkennt auf Deutsch, ohne Netz:
- 
Absicht: Vorwort „Termin“, „Aufgabe“, „Notiz“, „Erinnere mich an …“; ohne Vorwort mit erkannter Zeit schlägt sie Termin vor, sonst Aufgabe, und bietet die anderen beiden darunter an.
- 
Datum: heute, morgen, übermorgen, Wochentage („am Montag“, „nächsten Freitag“), „in 3 Tagen“, „in 2 Wochen“, „nächste Woche“, „24.10.“, „24.10.2026“, „24. Oktober“, „1.11.“. Ein Wochentag bedeutet das nächste Vorkommen nach heute.
- 
Uhrzeit und Dauer: „15 Uhr“, „15:30“, „um 8“, „halb vier“, „viertel nach drei“, „von 15 bis 16 Uhr“, „für 2 Stunden“, „30 min“.
- 
Wiederholung: „jeden Montag“, „täglich“, „wöchentlich“, „alle 2 Wochen“, „monatlich“, „jährlich“ (die vorhandenen Werte d, w, 2w, m, y).
- 
Erinnerung: „30 min vorher“, „1 Tag vorher“.
- 
Der Rest ist der Titel (erster Buchstabe groß, Füllwörter wie „am“ und „um“ weg).
Unter dem Eingabefeld erscheint eine Vorschaukarte: „Neuer Termin · Mo 26.10., 15:00 · Zahnarzt“ mit den erkannten Teilen als antippbare Chips (Datum, Zeit, Wiederholung), die man korrigieren kann. Knöpfe: „Speichern“ (mit Rückgängig-Hinweis) und „Bearbeiten“ (öffnet das volle Blatt mit den erkannten Werten; dafür SharedCalendar.newEvent(date, vorgabe) um einen zweiten Parameter erweitern). Zeit wird in der lokalen Zeitzone gerechnet.

### Befehle
Baue den Befehlskatalog neu auf der neuen Struktur auf, mit Gruppen und Stichwörtern (zum Beispiel „Rodeln: Kurvenbuch“ mit den Stichwörtern „bahn“, „strecke“). Alle laufen offline. Befehle, die nicht passen, werden ausgeblendet (APK-Befehle im Browser, „App installieren“ in der APK). Dynamische Zeilen zeigen ihren Zustand („Cloud jetzt sichern, zuletzt vor 2 Std.“, „Karteikarten, 14 fällig“).
 | 
Gruppe | 
Befehle
 | 
Kalender | 
Heute, Morgen, Woche planen, Nächste Woche planen, Standardwoche übernehmen, Wochenplanung Einstellungen, Neuer Termin, Neue Aufgabe, Neue Notiz
 | 
Training | 
Training starten, Laufen starten (GPS), Gym starten, Dehnen starten, Rodeln: Kurvenbuch, Bahnen, Läufe und Zeiten, Drucken, Auswertung: Fitness, Analyse, Training einstellen
 | 
Mobility und Atmung | 
Mobility Tagesblock, Mobility Wettkampf, Übungen, Fortschritt, Atemübung starten, Morgen-HRV messen, Atemplan der Woche, Verlauf, 12-Wochen-Plan
 | 
Schule | 
Schultag, Stundenplan, Aufgaben und Prüfungen, Lernplan, Schuljahr und Ferien
 | 
Wissen und Bibel | 
Sportwissenschaft: Lesen, Karteikarten, Quiz, Suche, Bibel heute lesen, Weiterlesen, Bibliothek, Zufallsvers, Meine Bibel, Pause starten
 | 
Daten und Einstellungen | 
Design (alle zehn Farbwelten einzeln), Glaseffekt an oder aus, Erinnerungen an oder aus (APK), Handykalender jetzt abgleichen (APK), Cloud jetzt sichern, Alles als Datei sichern, Frühere Stände zurückholen, Kalender als .ics exportieren, Version aktualisieren, Fehlerprotokoll

### Inhalte durchsuchen
- 
Quellen: Termine und Einträge aller Bereiche inklusive Handytermine und Notizen mit Zeit (ein Jahr zurück bis ein Jahr voraus, Titel und Notiztext), Aufgaben (offene zuerst), Notizen, Übungen (Mobility und Gym), Sportwissenschaft (vorhandenen Suchindex in wissen/js wiederverwenden, Treffer öffnet den Lesemodus an der Stelle), Schule (Fächer, Prüfungen, Hausaufgaben), Bahnen im Kurvenbuch, alle Seiten und Einstellungen der App als Ziele.
- 
Bibel: Eine Bibelstelle wie „Joh 3,16“ oder „1. Mose 1,1-3“ wird erkannt (Buchnamen und gängige Abkürzungen) und öffnet die Stelle. Die Stichwortsuche im Bibeltext (bibel/elb1905.json) läuft erst ab drei Zeichen oder mit gewähltem Filter „Bibel“ und lädt den Text erst dann. Web Worker nur aus Dateien, nicht aus blob: (CSP, siehe WISSEN.md); große Suchläufe in kleinen Stücken (requestIdleCallback oder setTimeout), damit nichts hängt.
- 
Treffer-Logik: Text vereinheitlichen (Kleinschreibung, ä gleich a, ß gleich ss), alle Wörter müssen vorkommen (wie wordsMatch), Wortanfänge zählen, leichter Tippfehler-Spielraum (ein Fehler ab fünf Buchstaben, zwei ab neun). Rangfolge: genauer Titel, Titelanfang, Wortanfang, Notiztext, unscharf. Bonus für heute, bald fällig, häufig benutzt. Abzug für erledigt und lange her.
- 
Leistung: Index erst beim Öffnen der Suche aufbauen, im Speicher halten, bei Datenänderungen auffrischen. Eingabe mit etwa 100 ms Verzögerung, nie länger als 50 ms am Stück blockieren.

### Kurzbefehle im Eingabefeld
/ nur Befehle (zum Beispiel /design graphit) · + neu anlegen (+ Zahnarzt morgen 15 Uhr) · @ Datum öffnen (@24.12., @morgen, @nov) · ? Hilfe mit Beispielen, Tipp auf ein Beispiel fügt es ein.

### Verlauf
Suchverlauf und Benutzungszähler liegen nur auf dem Gerät in sg-suche-v1. Sie gehören nicht in die Cloud-Sicherung (DATA und EXTRA in verbund.js nicht erweitern) und nicht in die Umzugsdatei.
Abnahme Phase 6 (jeweils als Test):
 | 
Eingabe | 
Erwartung
 | 
Zahnarzt morgen 15 Uhr | 
Vorschau „Neuer Termin“, morgen 15:00, Titel „Zahnarzt“
 | 
Mathe Hausaufgaben bis Freitag | 
Vorschau „Neue Aufgabe“, fällig am nächsten Freitag
 | 
jeden Montag 17:30 Krafttraining | 
Termin, wöchentlich montags, 17:30
 | 
Notiz: Kurve 9 früher einlenken | 
Vorschau „Neue Notiz“
 | 
@24.12. | 
Kalender springt auf den 24.12.
 | 
Joh 3,16 | 
Bibelstelle öffnet
 | 
/design graph | 
Nur Design-Befehle, „Design: Graphit“ vorn
 | 
rodeln bahn | 
Kurvenbuch und Bahnen als Befehle, Bahnnamen als Inhalte
 | 
atem | 
„Atemübung starten“ und die übrigen Atem-Befehle
 | 
zahnartz (Tippfehler) | 
findet „Zahnarzt“
 | 
leer | 
Zuletzt, Schnell anlegen, Häufig
Zusätzlich: Android-Zurück schließt die Suche zuerst, die Suche läuft vollständig offline, kein Befehl der alten Palette (alle früheren Befehle) ist verloren gegangen, und die Eingabe bleibt mit eingeblendeter Tastatur flüssig.

## 10. Phase 7: Kalender-Verbesserungen aus der Code-Prüfung
Diese Punkte ergänzen den neuen Kalender. Sie betreffen das Datenmodell im Kalender-Kern (werkzeuge/quellen/verbund.js, Einträge {id, title, date, time, end, app, rep, remind, wp, link …}) und die Hülle. Jede Änderung am Datenmodell muss abwärtskompatibel sein: alte Einträge bleiben lesbar, unbekannte Felder werden beim Cloud-Abgleich (Gist, „neuere Änderung gewinnt“) durchgereicht, damit ein älteres Gerät nichts zerstört.
- 
Mehrtägige Termine. Bisher gibt es nur date plus Uhrzeiten, also keine Wettkampf-Wochenenden, Trainingslager oder Urlaube. Neues optionales Feld endDate. Das Blatt „Termin“ bekommt „Mehrtägig“ mit „Bis“-Datum. occurrences() liefert für jeden Tag einen Eintrag mit day und of (Tag 2 von 4). Im Monatsraster verbindet ein durchgehender Balken die Tage (an der Wochengrenze neu ansetzen), im Tagesplan steht „Tag 2 von 4“. Der .ics-Export schreibt DTEND (bei ganztägigen Terminen exklusiv, also Endtag plus 1), der Import liest DTEND, der Handykalender-Abgleich (hOut) und die Erinnerungen kennen den Zeitraum.
- 
Wiederholungen. Heute möglich: täglich, wöchentlich, alle zwei Wochen, monatlich, jährlich. Ergänze bestimmte Wochentage (Mo, Mi, Fr), „alle N Wochen“ und optional „jeden ersten Montag im Monat“. Beim Ändern oder Löschen eines Serientermins fragt das Blatt „Nur dieser Termin“, „Dieser und alle folgenden“ oder „Alle“. „Nur dieser“ nutzt die vorhandene Ausnahmenliste ex, „dieser und folgende“ beendet die alte Serie am Vortag (rep.until) und legt eine neue an. Passe Export und Import der Regeln an (RRULE mit BYDAY und INTERVAL, die Stellen mit FREQ= in verbund.js; der Import akzeptiert heute nur Intervall 1 oder zweiwöchentlich).
- 
Training, Mobility, Atmung und Lernplan verschieben oder auslassen. evSheet() bietet Bearbeiten nur für eigene Termine an. Für Einträge aus den Bereichen kommen dazu: „Heute später“, „Auf morgen verschieben“, „Anderen Tag wählen“, „Heute auslassen“ (mit kurzem optionalem Grund: krank, Wetter, Bahn gesperrt, Schule, anderes) und „Erledigt“. Das ändert nur diesen Wochenplan-Eintrag (wp), nie die Standardwoche. Rückgängig-Hinweis nach jeder Aktion.
- 
Status sichtbar. Erledigte Einheiten bekommen im Kalender ein ✓, ausgelassene sind gedämpft mit „ausgelassen“. Schließt die Trainingsseite eine Einheit ab, setzt sie den Eintrag über die vorhandenen Verknüpfungsfelder (link, linkApp, linkHash) automatisch auf erledigt. Über der Wochenleiste steht eine Wochenbilanz („4 von 5 Einheiten“). Die Zahlen kommen aus denselben Daten wie der Wochenrückblick der Auswertung, nie doppelt gezählt.
- 
Tagesplan mit Lücken und Zeitraster. Zwischen Einträgen eine Zeile „Frei 14:00 bis 16:30“ ab 45 Minuten Lücke, eine „Jetzt“-Linie an heutigen Tagen, eine Warnung im Blatt „Termin“ bei Überschneidung („Überschneidet sich mit Training 17:00“). Optional ein Umschalter „Liste | Zeitraster“ (zwei Einträge) im Kopf des Tagesplans. Das Zeitraster zeigt 06 bis 22 Uhr, Blöcke nach Dauer, Überschneidungen nebeneinander.
- 
Wichtige Termine. Neues Feld star (Stern im Blatt „Termin“). In „Auf einen Blick“ erscheint eine Kachel „Nächster wichtiger Termin“ mit Countdown („in 12 Tagen“), Prüfungen aus der Schule zählen automatisch.
- 
Bereich als festes Feld. area() erkennt den Bereich heute per Regex auf dem Textfeld e.app (/Lernplan|Schule/ und ähnlich), evSheet() erkennt eigene Termine per ID-Präfix (/^(lp|lc|pp|tb|ta|nt|hd)-/). Das bricht still, sobald ein Bereich umbenannt wird. Ersetze es durch ein Feld area am Eintrag und eine zentrale Tabelle. Beim Laden wird area einmalig und tolerant aus altem app abgeleitet, unbekannte Werte werden zu „Termin“, nichts geht verloren.
- 
Rückgängig überall (Löschen, Verschieben, Auslassen, Abhaken) mit dem vorhandenen Hinweis snack(text, undoFn).
Abnahme Phase 7:
- 
Alte Daten laden fehlerfrei (Fixtures aus werkzeuge/tests/seed.js plus eine Datei im Stand 3.5.0).
- 
Cloud-Abgleich-Test: ein Gerät mit neuen Feldern, eines ohne, beide behalten ihre Einträge.
- 
.ics-Rundreise: exportieren, wieder importieren, Ergebnis gleich (mit mehrtägigen Terminen und Serien mit Wochentagen).
- 
Handykalender-Mock (werkzeuge/tests/apk.js): mehrtägige und wiederkehrende Termine kommen richtig an und zurück.
- 
Verschieben, Auslassen und Erledigt haben Tests, einschließlich Rückgängig.

## 11. Design, UX und APK-Besonderheiten für alle Phasen
Diese Vorgaben gelten in jeder Phase und werden in Phase 8 als letzter Durchgang über alle Seiten geprüft. Design wird zentral in unifyCSS (design.js) und in den Variablen der Hülle geändert, nie pro Seite.

### Gerüst und Gestaltung
- 
Immer dasselbe Gerüst: Kopf (Zurück oder Seitenmenü, Titel mit Pfadzeile, Suche), Inhalt, untere Leiste. Wer sich wo befindet, ist immer sichtbar (Pfadzeile).
- 
Maße: Titel 24 px fett, Kartentitel 15,5 px halbfett, Nebentext 13 px gedämpft, nichts unter 12 px (Ausnahme: Balken im Monatsraster ohne Text). Karten mit 18 px Radius und den vorhandenen Abständen. Antipp-Flächen mindestens 48 dp bei Hauptaktionen und Listenzeilen.
- 
Farben: Bereichsfarben (--c-training, --c-mobility, --c-atmung, --c-schule, --c-notiz, --c-aufgabe, --c-bibel, --c-termin) aus den Variablen, nie feste Werte. Text mindestens 4,5 zu 1 Kontrast, Symbole und Balken mindestens 3 zu 1, in allen zehn Farbwelten (Skript, das den Kontrast aus den Variablen jeder Farbwelt in design.js berechnet). Farbe ist nie der einzige Informationsträger (zusätzlich Symbol, Text oder Form).
- 
Zustände einheitlich: Leer (ein Satz und eine Aktion), Laden (Platzhalterzeilen statt Drehkreis, wenn es länger als 300 ms dauert), Fehler (verständlicher deutscher Satz und was man tun kann). Offline ist nie ein Fehler, die App funktioniert ohne Netz.
- 
Rückmeldung: Jede Aktion bestätigt sich (Hinweis mit „Rückgängig“ bei Löschen, Verschieben, Abhaken). Bewegungen höchstens etwa 250 ms und aus bei prefers-reduced-motion. Haptik nur, wenn das Plugin schon in der App steckt; kein neues Capacitor-Plugin ohne Rückfrage.
- 
Texte: Du-Form, kurze Sätze, keine Abkürzungen wie „ganzt.“, feste Begriffe (Eintrag, Termin, Aufgabe, Notiz). Datum kurz als „Mo 26.10.“, lang als „Montag, 26. Oktober“. Uhrzeiten 24 Stunden.
- 
Tablet und Querformat: Die Seiten dürfen auf breiten Bildschirmen zwei Spalten nutzen (Kalender links, Tagesplan rechts ab 900 px ist ein sinnvoller Anfang), aber nie Inhalt abschneiden. Maximale Lesebreite etwa 860 px wie heute.

### Barrierefreiheit
- 
Alle Knöpfe, auch reine Symbole, haben ein aria-label. Rollen für Raster, Dialog und Liste sind gesetzt. Fokus gelangt nach dem Schließen eines Blattes oder Seitenmenüs zurück zum auslösenden Element.
- 
Android-Schriftgröße bis 200 % und Anzeigegröße „groß“ führen nicht zu abgeschnittenen Texten oder verdeckten Knöpfen (Test mit vergrößerter Basisschrift).
- 
TalkBack liest Tage im Kalender als „Montag, 26. Oktober, 3 Einträge“ vor.

### Besonderheiten der APK
- 
window.SGNative: In der APK gibt es keinen Service Worker. Dateien speichern geht über SGNative.save statt über <a download>, Links nach außen öffnen im Browser, print() zeigt nur einen Hinweis. Neue Funktionen (.ics, Sicherung, Berichte) müssen diese Wege benutzen.
- 
Ränder: Capacitor setzt --safe-area-inset-* (SystemBars mit insetsHandling: css), die Hülle nutzt sie vor env(). Seitenmenü, Suche, Blätter und der schwebende Knopf halten die Ränder ein.
- 
Zurück-Taste: Reihenfolge Seitenmenü, Suche, Blatt, dann Navigation. Die App schließt sich nur auf der Kalender-Startseite ohne offene Ebene. Mit Test.
- 
Tastatur: Eingabefelder bleiben sichtbar, wenn die Tastatur aufgeht (Höhe über visualViewport, nicht 100dvh).
- 
Speicher und Tempo: Die Hülle hält höchstens fünf Seiten geladen (MAXF, in der APK 5), erhöhe das nicht. Der Wechsel zwischen Seiten über das Seitenmenü dauert unter 100 ms, wenn die Seite geladen ist. Messe die Zeit bis der Kalender bedienbar ist vorher und nachher (Emulator-Lauf) und verschlechtere sie nicht. Keine neuen großen Bibliotheken, die Bibel wird nie beim Start geladen.
- 
Daten und Umzug: Datenformate und alle bisherigen localStorage-Schlüssel bleiben. Neue Schlüssel (sg-suche-v1, Zustände der Akkordeons) prüfen: gerätebezogene (der Suchverlauf) gehören in MOVE_SKIP der Umzugsfunktion, damit sie nicht umziehen.
- 
Release: versionCode steigt mit der Version, die Signatur-Datei wird nie angefasst, Zwischenversionen (3.6.0, 3.7.0, 3.8.0) lassen sich als normales Update über die installierte App einspielen. Der Emulator-Test (werkzeuge/tests/emulator.js) wird auf die neue Bedienung angepasst und liefert Bildschirmfotos der neuen Seiten; ein Release entsteht erst nach bestandenem Test.

## 12. Fehlerprüfung am Ende und Abnahmekriterien
Das ist ein großer Umbau, deshalb ist die Prüfung kein Anhängsel. Sie läuft nach jeder Phase in klein und am Ende vollständig. Ein Punkt gilt erst als erledigt, wenn du ihn selbst ausgeführt und das Ergebnis gesehen hast (Test grün, Bildschirmfoto angesehen, Ausgabe gelesen). Schreibe nie „sollte funktionieren“. Was du nicht prüfen konntest (echtes Gerät, echter GPS-Lauf, Polar H10, Android-Berechtigungen), nennst du am Ende ausdrücklich und listest es als Prüfaufgabe für mich auf.

### A. Statische Prüfung
- 
python3 werkzeuge/build.py läuft ohne Warnung. In sg/ steht nichts, das nicht aus werkzeuge/quellen/ stammt.
- 
Jede geänderte Skriptdatei besteht node --check. Keine toten Verweise: Suche nach entfernten Funktionsnamen, Klassen (.crow, .chip in nicht mehr genutzten Zusammenhängen) und IDs (#chips) in allen Dateien.
- 
Versionsnummer überall gleich (build.py, sw.js, ?v= an den Skripten, package.json und versionCode der APK).
- 
Die Dateiliste in sw.js enthält alle neuen Dateien und keinen Ordner werkzeuge/.

### B. Inventur vorher und nachher
- 
Erzeuge werkzeuge/tests/inventar-nachher.json mit demselben Skript wie das Inventar vorher und vergleiche beide. Jede Karte (data-sec), jeder Knopf, jeder Befehl der alten Palette, jeder Eintrag aus „Mehr“ und jeder Chip muss entweder noch da sein oder in VERLAUF.md mit neuem Ort stehen. Eine Lücke ist ein Fehler.
- 
Prüfe jede bekannte Adresse (#kalender, #training/rodeln/plan, #mobility/atmung/hrv, #schule/plan, #bibel/lesen, #mehr, #notizen, #aufgaben, #pause, #tset, #u=…, #teilen) und die Sprünge der eingebetteten Seiten.

### C. Automatische Tests
- 
suite3.js, offline3.js, bahnplan-1.js, bahnplan-2.js, apk.js und upd.js laufen grün (Server-Hinweise aus WISSEN.md beachten, Ausgabe in eine Datei schreiben).
- 
Neue Tests: Seitenmenü (alle Pfade, Zurück-Taste), Monatskalender (Tippen, langer Druck, Wischen, Monatswechsel), parseQuick (mindestens 60 Beispiele), Suche (Treffer, Tippfehler, Kurzbefehle, Bibelstelle), Datenmigration (alte Daten im Stand 3.5.0), Cloud-Abgleich mit und ohne neue Felder, .ics-Rundreise, Handykalender-Mock.
- 
Konsole sauber: Jeder Test fängt pageerror und console.error und schlägt bei jedem Treffer fehl, auch in den eingebetteten Seiten.
- 
Offline-Test: einmal online laden, Server abschalten (per PID beenden), danach alle neuen Wege prüfen.
- 
Bildtests bei 360 × 800, 360 × 640, 412 × 915, 800 × 1280, 1280 × 800, jeweils mit Schrift 100 % und 130 % und in mindestens drei Farbwelten (hell und dunkel, Standard, eine mit Glaseffekt). Sieh dir die Bilder an und suche nach abgeschnittenem Text, überlappenden Elementen, waagerechtem Scrollen, verdeckten Knöpfen hinter Leiste oder Tastatur.

### D. Unabhängige Prüfung
Starte am Ende jeder Phase und noch einmal am Gesamtende einen frischen Prüf-Agenten, der deinen Arbeitsverlauf nicht kennt. Gib ihm nur den Auftrag (dieses Dokument), den Stand des Repositorys, die Testausgaben und die Bildschirmfotos. Er soll aktiv nach Fehlern suchen, vor allem in Randfällen: leere Daten, sehr viele Einträge (zum Beispiel 200 in einem Monat), Mitternachtswechsel, Zeitumstellung, Schaltjahr, 31. Januar bis Februar, Wochen über Jahreswechsel, Einträge ohne Titel, sehr lange Titel, Umlaute und Emojis, Termin ohne Uhrzeit, mehrtägige Termine über Monatsgrenzen, doppelte Antipper, Drehen während eines geöffneten Blattes. Behebe, was er findet, und belege jede Behebung mit einem Test.

### E. Abnahmekriterien (alle müssen erfüllt sein)
- 
Startseite: Wochenleiste, Tagesplan, großer Monatskalender in dieser Reihenfolge; Tippen, langer Druck und Wischen funktionieren.
- 
Training, Schule, Bibel und Pause haben ein Seitenmenü statt Chip-Reihe, jede frühere Unterseite ist erreichbar, Mobility ist unverändert.
- 
Keine horizontal scrollende Chip-Reihe außer in Mobility.
- 
Jede Trainingsseite zeigt ihre Hauptaktion ohne Scrollen, „Heute“ kommt mit höchstens drei Bildschirmhöhen aus.
- 
„Mehr“ ist nach Zweck geordnet und zeigt Zustände; jeder alte Eintrag ist erreichbar.
- 
Die Suche findet Inhalte, führt alle Befehle aus (auch alle alten), legt per Satz Einträge an und läuft offline.
- 
Mehrtägige Termine, erweiterte Wiederholungen, Verschieben, Auslassen und Status funktionieren und überstehen Export, Import und Abgleich.
- 
Alle Tests grün, Konsole in allen Tests sauber, Inventar ohne Lücke, Offline-Test grün.
- 
APK-Build und Emulator-Test auf GitHub grün, Release 4.0.0 vorhanden.
- 
werkzeuge/WISSEN.md (neuer Aufbau, Seitenmenü-Baustein, Suche, Schnelleingabe, neue Datenfelder) und werkzeuge/VERLAUF.md (Entscheidungen, Fehler und Ursachen, Tabelle der neuen Orte) sind aktualisiert.

### F. Abschlussbericht
Schreibe am Ende einen kurzen Bericht in deutscher Sprache: was sich geändert hat (nach Phasen), welche Entscheidungen du getroffen hast (Standardwerte aus Abschnitt 2 und Abweichungen), welche Fehler du gefunden und behoben hast, was du nicht prüfen konntest und was ich auf Handy und Tablet selbst ansehen soll (konkrete Schritte, zum Beispiel „Training antippen, Seitenmenü öffnen, Rodeln, Kurvenbuch, Zurück-Taste drücken“).