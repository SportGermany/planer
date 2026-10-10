/* ==================== INHALTS-DATEN ==================== */
const CATS = {
  zitate:  { label:"Zitate",              color:"zitate"  },
  wissen:  { label:"Allgemeinwissen",      color:"wissen"  },
  alltag:  { label:"Alltag & Recht",       color:"alltag"  },
  politik: { label:"Politik & Wirtschaft", color:"politik" },
  wiki:    { label:"Wikipedia-Zufall",     color:"wiki"    },
  aktpolitik: { label:"Aktuelle Politik",  color:"aktpolitik", live:true },
  raetsel: { label:"Rätsel",               color:"raetsel" }
};

const DATA = {

zitate: [
{id:"z1",text:"Wer sein Ziel kennt, findet den Weg.",author:"Laotse"},
{id:"z2",text:"Es ist nicht genug zu wissen, man muss es auch anwenden.",author:"Johann Wolfgang von Goethe"},
{id:"z3",text:"Der Mensch ist, was er isst - und was er denkt.",author:"Ludwig Feuerbach (frei)"},
{id:"z4",text:"Wir leiden mehr in der Vorstellung als in der Wirklichkeit.",author:"Seneca"},
{id:"z5",text:"Der Weg ist das Ziel.",author:"Konfuzius (zugeschrieben)"},
{id:"z6",text:"Nicht weil es schwierig ist, wagen wir es nicht, sondern weil wir es nicht wagen, ist es schwierig.",author:"Seneca"},
{id:"z7",text:"Man kann einem Menschen nichts lehren, man kann ihm nur helfen, es in sich selbst zu entdecken.",author:"Galileo Galilei"},
{id:"z8",text:"Wer aufhört zu lernen, hört auf zu leben.",author:"Marie von Ebner-Eschenbach (frei)"},
{id:"z9",text:"Phantasie ist wichtiger als Wissen, denn Wissen ist begrenzt.",author:"Albert Einstein"},
{id:"z10",text:"Am Ende werden wir nur die Dinge bereuen, die wir nicht getan haben.",author:"Volksmund"},
{id:"z11",text:"Wer immer tut, was er schon kann, bleibt immer, was er schon ist.",author:"Henry Ford (zugeschrieben)"},
{id:"z12",text:"Die Grenzen meiner Sprache bedeuten die Grenzen meiner Welt.",author:"Ludwig Wittgenstein"},
{id:"z13",text:"Ich weiß, dass ich nichts weiß.",author:"Sokrates (zugeschrieben)"},
{id:"z14",text:"Zwischen Reiz und Reaktion liegt ein Raum. In diesem Raum liegt unsere Macht zur Wahl der Reaktion.",author:"Viktor Frankl"},
{id:"z15",text:"Der Charakter eines Menschen zeigt sich in Kleinigkeiten.",author:"Arthur Schopenhauer"},
{id:"z16",text:"Was uns nicht umbringt, macht uns härter.",author:"Friedrich Nietzsche"},
{id:"z17",text:"Man sieht nur mit dem Herzen gut.",author:"Antoine de Saint-Exupéry"},
{id:"z18",text:"Es gibt nichts Gutes, außer man tut es.",author:"Erich Kästner"},
{id:"z19",text:"Bildung ist die mächtigste Waffe, um die Welt zu verändern.",author:"Nelson Mandela"},
{id:"z20",text:"Wer die Vergangenheit nicht kennt, kann die Gegenwart nicht verstehen.",author:"Zitat, frei nach Cicero"},
{id:"z21",text:"Man muss noch Chaos in sich haben, um einen tanzenden Stern gebären zu können.",author:"Friedrich Nietzsche"},
{id:"z22",text:"Freiheit ist immer Freiheit des anders Denkenden.",author:"Rosa Luxemburg"},
{id:"z23",text:"Der beste Weg, die Zukunft vorherzusagen, ist, sie zu gestalten.",author:"Peter Drucker (zugeschrieben)"},
{id:"z24",text:"Wissen ist Macht.",author:"Francis Bacon"},
{id:"z25",text:"Wo kein Wille ist, ist auch kein Weg.",author:"Volksmund"},
{id:"z26",text:"Alles, was uns begegnet, lässt Spuren zurück.",author:"Johann Wolfgang von Goethe"},
{id:"z27",text:"Die Kunst des Lebens ist mehr die Kunst, mit Problemen umzugehen, als sie zu lösen.",author:"Zitat, frei"},
{id:"z28",text:"Nur wer sein Ziel kennt, findet den Weg.",author:"Laotse"},
{id:"z29",text:"Man kann nicht in denselben Fluss zweimal steigen.",author:"Heraklit"},
{id:"z30",text:"Der Zweifel ist der Anfang der Weisheit.",author:"René Descartes (frei)"},
{id:"z31",text:"Erfolg ist die Summe kleiner Anstrengungen, die täglich wiederholt werden.",author:"Robert Collier (zugeschrieben)"},
{id:"z32",text:"Ein Ziel ohne Plan ist nur ein Wunsch.",author:"Antoine de Saint-Exupéry (zugeschrieben)"},
{id:"z33",text:"Die größte Entdeckung ist, dass ein Mensch sein Leben ändern kann, indem er seine Einstellung ändert.",author:"William James"},
{id:"z34",text:"Ordnung ist das halbe Leben - Unordnung die andere Hälfte.",author:"Volksmund"},
{id:"z35",text:"Man muss das Unmögliche versuchen, um das Mögliche zu erreichen.",author:"Hermann Hesse (frei)"},
{id:"z36",text:"Wer nicht neugierig ist, entdeckt nichts Neues.",author:"Zitat, frei"},
{id:"z37",text:"Geduld ist bitter, aber ihre Frucht ist süß.",author:"Jean-Jacques Rousseau"},
{id:"z38",text:"Die Fantasie ist wichtiger als das Wissen, denn sie umfasst die ganze Welt.",author:"Albert Einstein"},
{id:"z39",text:"Man wächst mit seinen Aufgaben.",author:"Friedrich Schiller (frei)"},
{id:"z40",text:"Die beste Zeit, einen Baum zu pflanzen, war vor zwanzig Jahren. Die zweitbeste ist jetzt.",author:"Sprichwort"}
],

wissen: [
{id:"w1",title:"Warum der Himmel blau ist",text:"Sonnenlicht enthält alle Farben. Kurzwelliges blaues Licht wird von Luftmolekülen stärker gestreut als langwelliges rotes Licht - dieser Effekt heißt Rayleigh-Streuung. Deshalb sehen wir tagsüber überall am Himmel blaues Licht, während die Sonne selbst gelblich wirkt."},
{id:"w2",title:"Wie ein Kühlschrank kühlt",text:"Ein Kühlschrank pumpt kein Kälte hinein, sondern Wärme heraus. Ein Kältemittel verdampft im Inneren und nimmt dabei Wärme auf, wird dann verdichtet und gibt die Wärme an der Rückseite wieder ab. Deshalb ist die Rückseite eines Kühlschranks warm."},
{id:"w3",title:"Woher der Name 'Sandwich' kommt",text:"Der Legende nach ließ sich der englische Earl of Sandwich im 18. Jahrhundert Fleisch zwischen zwei Brotscheiben servieren, damit er beim Kartenspiel weiteressen konnte, ohne sich die Finger schmutzig zu machen. So entstand der Name für belegte Brotscheiben."},
{id:"w4",title:"Wie viele Knochen ein Baby hat",text:"Ein Neugeborenes hat etwa 300 Knochen, ein Erwachsener nur noch rund 206. Der Grund: Viele Knochen, etwa im Schädel und in der Wirbelsäule, verwachsen im Laufe des Wachstums miteinander."},
{id:"w5",title:"Was die Fibonacci-Folge ist",text:"Bei der Fibonacci-Folge ist jede Zahl die Summe der beiden vorherigen: 0, 1, 1, 2, 3, 5, 8, 13, 21 ... Sie taucht überraschend oft in der Natur auf, etwa bei der Anordnung von Sonnenblumenkernen oder Tannenzapfen-Schuppen."},
{id:"w6",title:"Warum Blätter im Herbst die Farbe wechseln",text:"Im Sommer überdeckt das grüne Chlorophyll andere Farbstoffe im Blatt. Im Herbst baut der Baum das Chlorophyll ab, um Nährstoffe zurückzugewinnen - übrig bleiben gelbe und orange Carotinoide, die vorher einfach nicht sichtbar waren."},
{id:"w7",title:"Wie das Internet grundsätzlich funktioniert",text:"Daten werden in kleine Pakete zerlegt, jedes Paket bekommt eine Zieladresse und reist über viele Zwischenstationen, sogenannte Router. Am Ziel werden die Pakete wieder zusammengesetzt. Deshalb kann eine Internetverbindung Ausfälle einzelner Leitungen oft einfach umgehen."},
{id:"w8",title:"Was der Placebo-Effekt ist",text:"Menschen können sich besser fühlen, nur weil sie glauben, eine wirksame Behandlung zu bekommen - auch wenn das verabreichte Mittel keinen echten Wirkstoff enthält. Der Effekt zeigt, wie stark Erwartung und Gehirn körperliche Empfindungen beeinflussen können."},
{id:"w9",title:"Warum Honig fast ewig haltbar ist",text:"Honig hat einen sehr geringen Wasseranteil und einen niedrigen pH-Wert, dazu enthält Bienenspeichel ein Enzym, das Wasserstoffperoxid bildet. Bakterien und Pilze finden darin kaum Lebensgrundlage - archäologisch gefundener, tausende Jahre alter Honig war teils noch genießbar."},
{id:"w10",title:"Wie Ebbe und Flut entstehen",text:"Die Anziehungskraft des Mondes (und in geringerem Maß der Sonne) zieht das Wasser der Ozeane leicht in ihre Richtung. Durch die Erdrotation wandert dieser Wasserberg im Tagesverlauf um die Erde - daraus entstehen die Gezeiten."},
{id:"w11",title:"Was eine Meritokratie ist",text:"In einer Meritokratie sollen gesellschaftliche Positionen nach Leistung und Verdienst vergeben werden, nicht nach Herkunft oder Vermögen. Der Begriff wird oft als Ideal diskutiert, wobei Kritiker anmerken, dass Startbedingungen selten wirklich gleich sind."},
{id:"w12",title:"Warum Metall sich kälter anfühlt als Holz",text:"Beide Materialien haben oft die gleiche Raumtemperatur. Metall leitet Wärme aber viel schneller ab der Hand als Holz, wodurch die Haut schneller Wärme verliert - das interpretiert das Gehirn als 'kälter', obwohl die Temperatur identisch ist."},
{id:"w13",title:"Wie eine Impfung wirkt",text:"Eine Impfung zeigt dem Immunsystem einen ungefährlichen Teil oder eine abgeschwächte Form eines Erregers. Der Körper bildet daraufhin Antikörper und ein 'Gedächtnis'. Trifft er später auf den echten Erreger, kann er viel schneller reagieren."},
{id:"w14",title:"Woher das Wort 'Salär' bzw. 'Salz' als Lohn kommt",text:"Im antiken Rom wurde Soldaten teils ein Salzgeld gezahlt, weil Salz zur Konservierung von Lebensmitteln wertvoll und knapp war. Aus dem lateinischen 'salarium' entwickelte sich später das Wort für Gehalt in mehreren Sprachen."},
{id:"w15",title:"Was kognitive Dissonanz ist",text:"Kognitive Dissonanz beschreibt das unangenehme Gefühl, wenn Überzeugungen und eigenes Verhalten nicht zusammenpassen. Menschen lösen dieses Unbehagen oft, indem sie ihre Überzeugung nachträglich anpassen, statt ihr Verhalten zu ändern."},
{id:"w16",title:"Wie ein Regenbogen entsteht",text:"Licht wird beim Eintritt in einen Regentropfen gebrochen, an der Rückwand reflektiert und beim Austritt erneut gebrochen. Weil jede Wellenlänge unterschiedlich stark gebrochen wird, fächert sich das weiße Licht in die Regenbogenfarben auf."},
{id:"w17",title:"Was der Dunning-Kruger-Effekt ist",text:"Menschen mit wenig Wissen in einem Bereich überschätzen ihre Fähigkeiten oft, weil ihnen das Wissen fehlt, die eigenen Lücken zu erkennen. Mit wachsender Kompetenz wird die Selbsteinschätzung meist realistischer - manchmal sogar zu kritisch."},
{id:"w18",title:"Warum Flugzeuge meist Kondensstreifen ziehen",text:"Triebwerksabgase enthalten heißen Wasserdampf. Trifft dieser auf die kalte Luft in großer Höhe, kondensiert er sofort zu winzigen Eiskristallen - sichtbar als weißer Streifen. Ob und wie lange er sichtbar bleibt, hängt stark von der Luftfeuchtigkeit ab."},
{id:"w19",title:"Was der Confirmation Bias ist",text:"Menschen neigen dazu, Informationen zu suchen und zu glauben, die die eigene Meinung bestätigen, und widersprechende Informationen eher zu übersehen oder anzuzweifeln. Dieser Bestätigungsfehler beeinflusst oft unbemerkt Entscheidungen und Diskussionen."},
{id:"w20",title:"Wie Vulkane entstehen",text:"An manchen Stellen der Erdkruste kann geschmolzenes Gestein aus dem Erdmantel aufsteigen, etwa an den Grenzen tektonischer Platten oder über sogenannten Hotspots. Steigt genug Druck auf, bricht die Lava an die Oberfläche durch - ein Vulkan entsteht."},
{id:"w21",title:"Warum wir gähnen, wenn andere gähnen",text:"Ansteckendes Gähnen hängt vermutlich mit Empathie und sozialer Nachahmung zusammen - Spiegelneuronen im Gehirn könnten beteiligt sein. Kinder unter etwa vier Jahren und Menschen mit stark ausgeprägtem Autismus zeigen den Effekt seltener."},
{id:"w22",title:"Was Opportunitätskosten sind",text:"Opportunitätskosten sind der Nutzen der besten Alternative, auf die man verzichtet, wenn man sich für eine andere Option entscheidet. Verbringt man einen Abend mit Lernen statt Arbeiten, sind die entgangenen Überstunden die Opportunitätskosten dieser Wahl."},
{id:"w23",title:"Wie Antibiotika wirken - und warum sie gegen Viren nichts bringen",text:"Antibiotika stören gezielt Lebensprozesse von Bakterien, etwa den Aufbau ihrer Zellwand. Viren haben aber keinen eigenen Stoffwechsel, den man so angreifen könnte - deshalb helfen Antibiotika bei einer Erkältung oder Grippe nicht."},
{id:"w24",title:"Woher der Ausdruck 'Sündenbock' kommt",text:"Der Begriff stammt aus einem alten jüdischen Ritual: Ein Ziegenbock wurde symbolisch mit den Sünden der Gemeinschaft beladen und in die Wüste geschickt. Heute meint 'Sündenbock' jemanden, dem man die Schuld für etwas zuschiebt."},
{id:"w25",title:"Was der Survivorship Bias ist",text:"Man zieht oft nur aus 'Überlebenden' Schlüsse - etwa erfolgreichen Firmen - und übersieht die vielen gescheiterten Fälle, die man gar nicht mehr sieht. Das führt zu verzerrten Annahmen darüber, was wirklich zum Erfolg führt."},
{id:"w26",title:"Wie Erdbeben gemessen werden",text:"Die Magnitude eines Erdbebens wird meist mit der Momenten-Magnituden-Skala angegeben, einer Weiterentwicklung der bekannteren Richterskala. Jede volle Stufe entspricht etwa der 32-fachen freigesetzten Energie der Stufe darunter."},
{id:"w27",title:"Was Inflation eigentlich bedeutet",text:"Inflation beschreibt einen allgemeinen, anhaltenden Anstieg des Preisniveaus - Geld verliert dadurch an Kaufkraft. Eine moderate Inflation gilt vielen Ökonomen als normal, während sehr hohe oder sehr niedrige Inflation als problematisch gilt."},
{id:"w28",title:"Wie das Gedächtnis grob funktioniert",text:"Man unterscheidet vereinfacht Kurzzeit- und Langzeitgedächtnis. Informationen werden im Hippocampus zunächst zwischengespeichert und bei Wiederholung oder starker emotionaler Bedeutung in andere Hirnregionen für die dauerhafte Speicherung übertragen."},
{id:"w29",title:"Warum Spiegel links und rechts vertauschen, aber nicht oben und unten",text:"Ein Spiegel vertauscht eigentlich vorne und hinten, nicht links und rechts. Weil unser Gehirn annimmt, wir hätten uns gedreht, um in den Spiegel zu schauen, interpretieren wir das Bild so, als wäre links und rechts vertauscht."},
{id:"w30",title:"Was der Placebo-Gegenspieler Nocebo-Effekt ist",text:"Beim Nocebo-Effekt verschlechtert sich das Befinden, weil jemand negative Wirkungen erwartet - etwa Nebenwirkungen eines Medikaments, obwohl es ein wirkstofffreies Scheinpräparat war. Erwartungshaltung kann also in beide Richtungen wirken."},
{id:"w31",title:"Wie Kompostierung funktioniert",text:"Mikroorganismen, Pilze und Kleinlebewesen zersetzen organisches Material und wandeln es in Humus um. Sauerstoff, Feuchtigkeit und ein gutes Verhältnis von kohlenstoff- und stickstoffreichem Material beschleunigen den Prozess deutlich."},
{id:"w32",title:"Was BIP eigentlich misst",text:"Das Bruttoinlandsprodukt zählt den Wert aller in einem Land in einem Jahr hergestellten Waren und Dienstleistungen zusammen. Es sagt nichts über Verteilung von Wohlstand oder unbezahlte Arbeit wie Haushaltsführung aus - dafür braucht es andere Kennzahlen."},
{id:"w33",title:"Warum Fieber eine sinnvolle Reaktion ist",text:"Erhöhte Körpertemperatur bremst die Vermehrung vieler Krankheitserreger und beschleunigt bestimmte Abwehrreaktionen des Immunsystems. Fieber ist also meist ein Zeichen, dass der Körper aktiv gegen eine Infektion vorgeht, nicht nur ein Symptom."},
{id:"w34",title:"Wie GPS grundsätzlich funktioniert",text:"Ein GPS-Empfänger misst die Laufzeit von Signalen mehrerer Satelliten. Aus den winzigen Zeitunterschieden lässt sich per Triangulation die eigene Position sehr genau berechnen - dafür braucht man Signale von mindestens vier Satelliten gleichzeitig."},
{id:"w35",title:"Was der Pareto-Effekt (80/20-Regel) besagt",text:"Die Faustregel besagt, dass oft etwa 20 Prozent des Aufwands für 80 Prozent des Ergebnisses verantwortlich sind. Sie ist keine exakte Naturgesetzlichkeit, hilft aber oft dabei, Prioritäten bei Zeit und Ressourcen sinnvoll zu setzen."},
{id:"w36",title:"Wie Salzwasser entsalzt wird",text:"Bei der Umkehrosmose wird Meerwasser mit hohem Druck durch eine feine Membran gepresst, die Salz und andere Stoffe zurückhält, aber Wassermoleküle durchlässt. Das Verfahren ist die Grundlage vieler moderner Entsalzungsanlagen."},
{id:"w37",title:"Warum Katzen schnurren",text:"Katzen schnurren nicht nur bei Wohlbefinden, sondern manchmal auch bei Stress oder Schmerzen. Man vermutet, dass die Frequenz des Schnurrens sogar Heilungsprozesse an Knochen und Gewebe unterstützen könnte, sicher belegt ist das aber nicht abschließend."},
{id:"w38",title:"Was ein Algorithmus im einfachsten Sinn ist",text:"Ein Algorithmus ist eine genaue, Schritt-für-Schritt-Anleitung, um ein Problem zu lösen - ähnlich einem Kochrezept. Computerprogramme bestehen letztlich aus vielen ineinandergreifenden Algorithmen, aber auch ein Wegeplan von A nach B ist im Kern einer."},
{id:"w39",title:"Wie tiefgefrorenes Essen haltbar bleibt",text:"Bei tiefen Temperaturen laufen chemische Reaktionen und das Wachstum von Mikroorganismen stark verlangsamt ab. Wasser im Lebensmittel gefriert zu Eis, wodurch Bakterien der flüssige Lebensraum fehlt - Verderb wird dadurch massiv verzögert, nicht gestoppt."},
{id:"w40",title:"Was Zinseszins bedeutet",text:"Beim Zinseszins werden bereits erhaltene Zinsen im nächsten Zeitraum mitverzinst. Dadurch wächst ein angelegter Betrag über lange Zeiträume überproportional - ein Effekt, den Albert Einstein angeblich als 'achtes Weltwunder' bezeichnet haben soll."}
],

alltag: [
{id:"a1",title:"Muss ich überhaupt eine Steuererklärung abgeben?",text:"Angestellte mit nur einem Arbeitgeber sind oft nicht verpflichtet, eine Steuererklärung abzugeben - es kann sich aber trotzdem lohnen, weil viele Ausgaben Steuern zurückbringen. Pflicht besteht häufig bei mehreren Einkunftsarten, bestimmten Freibeträgen oder Lohnersatzleistungen wie Kurzarbeitergeld. Im Zweifel lohnt ein Blick in die eigene Steuersoftware oder ein kurzer Check beim Finanzamt."},
{id:"a2",title:"Was Werbungskosten sind",text:"Werbungskosten sind Ausgaben, die direkt mit dem Job zusammenhängen, etwa Fahrten zur Arbeit, Arbeitsmittel oder Fortbildungen. Ohne Nachweis wird automatisch eine Pauschale angesetzt; wer mehr Kosten hatte, kann diese einzeln mit Belegen geltend machen und so die Steuerlast senken."},
{id:"a3",title:"Wie die Pendlerpauschale funktioniert",text:"Für den Arbeitsweg lässt sich pro Entfernungskilometer ein fester Betrag pro Arbeitstag steuerlich absetzen - unabhängig vom tatsächlichen Verkehrsmittel. Es zählt nur die einfache Strecke zwischen Wohnung und erster Arbeitsstätte, nicht Hin- und Rückweg zusammen."},
{id:"a4",title:"Was eine Haftpflichtversicherung eigentlich absichert",text:"Eine private Haftpflichtversicherung übernimmt Schäden, die man unabsichtlich anderen Personen oder deren Eigentum zufügt - etwa ein umgestoßenes Glas beim Besuch oder ein Fahrradunfall. Sie gilt als eine der wichtigsten Versicherungen, weil Schadenssummen theoretisch unbegrenzt hoch sein können."},
{id:"a5",title:"Wann eine Kündigungsfrist greift",text:"Die gesetzliche Grundkündigungsfrist für Arbeitnehmer beträgt vier Wochen zum 15. oder zum Monatsende, im Arbeitsvertrag können aber andere Fristen vereinbart sein. Für Arbeitgeber verlängern sich die Fristen meist mit der Dauer der Betriebszugehörigkeit."},
{id:"a6",title:"Was der Unterschied zwischen brutto und netto ist",text:"Brutto ist der vereinbarte Lohn vor Abzügen, netto das, was tatsächlich aufs Konto kommt. Dazwischen liegen Steuern und Sozialabgaben wie Renten-, Kranken-, Pflege- und Arbeitslosenversicherung, die je nach Steuerklasse und Einkommen unterschiedlich hoch ausfallen."},
{id:"a7",title:"Wie ein Dispokredit funktioniert - und warum er teuer ist",text:"Ein Dispokredit erlaubt es, das Girokonto bis zu einem vereinbarten Limit zu überziehen. Die Zinsen dafür liegen oft deutlich höher als bei einem klassischen Ratenkredit - er eignet sich daher eher für kurze finanzielle Engpässe als für dauerhafte Finanzierung."},
{id:"a8",title:"Was bei einem Mietvertrag wichtig zu prüfen ist",text:"Wichtig sind unter anderem die vereinbarte Kaution (meist maximal drei Nettokaltmieten), Regelungen zu Schönheitsreparaturen, die Kündigungsfrist und ob Nebenkosten als Pauschale oder Vorauszahlung mit Abrechnung vereinbart sind."},
{id:"a9",title:"Was die Probezeit arbeitsrechtlich bedeutet",text:"In der Probezeit, meist bis zu sechs Monate, gilt oft eine verkürzte Kündigungsfrist von zwei Wochen für beide Seiten. Der grundsätzliche Kündigungsschutz nach dem Kündigungsschutzgesetz greift in dieser Zeit in der Regel noch nicht."},
{id:"a10",title:"Wie die Widerrufsfrist bei Online-Käufen funktioniert",text:"Bei Verträgen, die online oder telefonisch mit einem Unternehmen abgeschlossen werden, gilt meist ein 14-tägiges Widerrufsrecht ohne Angabe von Gründen. Bei fehlender oder fehlerhafter Widerrufsbelehrung kann sich diese Frist deutlich verlängern."},
{id:"a11",title:"Was ein Freibetrag von einem Freistellungsauftrag unterscheidet",text:"Ein Freibetrag mindert allgemein das zu versteuernde Einkommen. Ein Freistellungsauftrag bei der Bank sorgt speziell dafür, dass Kapitalerträge wie Zinsen bis zu einer bestimmten Höhe direkt steuerfrei ausgezahlt werden, ohne dass man sie über die Steuererklärung zurückholen muss."},
{id:"a12",title:"Wie eine Berufsunfähigkeitsversicherung hilft",text:"Sie zahlt eine vereinbarte monatliche Rente, wenn man den zuletzt ausgeübten Beruf krankheits- oder unfallbedingt dauerhaft nicht mehr ausüben kann. Sie gilt für viele als eine der wichtigsten Absicherungen der eigenen Arbeitskraft, unabhängig vom Alter."},
{id:"a13",title:"Was bei einer Kfz-Versicherung Haftpflicht, Teilkasko und Vollkasko unterscheidet",text:"Die Haftpflicht ist Pflicht und deckt Schäden bei anderen ab. Teilkasko übernimmt zusätzlich etwa Diebstahl, Glasbruch oder Wildunfälle am eigenen Auto. Vollkasko deckt darüber hinaus auch selbstverschuldete Unfälle am eigenen Fahrzeug ab."},
{id:"a14",title:"Wie das Schufa-Scoring grob funktioniert",text:"Die Schufa sammelt Informationen zu Zahlungsverhalten, etwa laufenden Krediten oder Zahlungsausfällen, und berechnet daraus einen Score. Ein guter Score erleichtert Vertragsabschlüsse wie Mietwohnungen oder Handyverträge; man hat das Recht, einmal jährlich eine kostenlose Auskunft anzufordern."},
{id:"a15",title:"Was der Grundfreibetrag bei der Einkommensteuer ist",text:"Bis zu einem bestimmten Jahreseinkommen fällt keine Einkommensteuer an - dieser Betrag heißt Grundfreibetrag und soll das Existenzminimum steuerfrei stellen. Er wird regelmäßig angepasst und steigt in der Regel jährlich leicht an."},
{id:"a16",title:"Wie man eine seriöse von einer unseriösen Rechnung/Forderung unterscheidet",text:"Seriöse Rechnungen enthalten üblicherweise vollständige Absenderdaten, eine nachvollziehbare Leistungsbeschreibung und angemessene Fristen. Bei Drohungen mit sofortigem Inkasso, ungewöhnlich hohem Zeitdruck oder unbekannten Vertragsabschlüssen lohnt sich vor dem Zahlen eine genaue Prüfung."},
{id:"a17",title:"Was eine Abmahnung im Arbeitsrecht bedeutet",text:"Eine Abmahnung ist eine formelle Rüge des Arbeitgebers wegen eines konkreten Fehlverhaltens, verbunden mit der Ankündigung, dass bei Wiederholung arbeitsrechtliche Konsequenzen drohen. Sie ist oft, wenn auch nicht immer, Voraussetzung für eine spätere verhaltensbedingte Kündigung."},
{id:"a18",title:"Wie die gesetzliche Rente grob berechnet wird",text:"Die Höhe hängt vereinfacht davon ab, wie viele Entgeltpunkte man über die Erwerbsjahre gesammelt hat - abhängig vom eigenen Einkommen im Vergleich zum Durchschnittseinkommen aller Versicherten - multipliziert mit einem aktuellen Rentenwert."},
{id:"a19",title:"Was der Unterschied zwischen Erbe und Vermächtnis ist",text:"Ein Erbe tritt automatisch in die gesamte rechtliche Position des Verstorbenen ein, inklusive Schulden. Ein Vermächtnis überträgt dagegen nur einen bestimmten, im Testament festgelegten Gegenstand oder Betrag an eine Person, ohne dass diese automatisch Erbe wird."},
{id:"a20",title:"Wie man Handyverträge realistisch vergleicht",text:"Neben dem monatlichen Grundpreis lohnt ein Blick auf Vertragslaufzeit, automatische Verlängerung, tatsächliches Datenvolumen im Ausland und ob ein Gerät mitfinanziert wird - reine Tarifvergleiche ohne diese Punkte führen oft zu falschen Schlüssen."},
{id:"a21",title:"Was eine Reklamation von einer Garantie unterscheidet",text:"Die gesetzliche Sachmängelhaftung (oft 'Gewährleistung' genannt) gilt automatisch beim Kauf und deckt Mängel, die schon beim Kauf vorlagen. Eine Garantie ist ein freiwilliges, zusätzliches Versprechen des Herstellers oder Händlers mit eigenen Bedingungen."},
{id:"a22",title:"Wie ein Notgroschen sinnvoll dimensioniert wird",text:"Häufig empfohlen werden etwa zwei bis drei Netto-Monatsgehälter als leicht verfügbare Rücklage für unerwartete Ausgaben wie Reparaturen. Das verhindert, dass kleinere Notfälle sofort zu teuren Dispokrediten oder Ratenkäufen führen."},
{id:"a23",title:"Was beim Wohnungsübergabeprotokoll wichtig ist",text:"Beim Ein- und Auszug lohnt sich ein gemeinsam unterschriebenes Protokoll mit Zählerständen und bestehenden Mängeln, am besten mit Fotos. Das schützt beide Seiten vor späteren Streitigkeiten über Kaution und angebliche Schäden."},
{id:"a24",title:"Wie die Steuerklassen bei Ehepaaren grob wirken",text:"Steuerklassen ändern nicht die Gesamtsteuerlast eines Ehepaars, sondern nur, wie sich der monatliche Lohnsteuerabzug zwischen beiden Partnern verteilt. Die endgültige Steuer wird erst mit der gemeinsamen Steuererklärung final berechnet."},
{id:"a25",title:"Was der Widerruf bei Kaffeefahrten & Haustürgeschäften bringt",text:"Auch bei Verträgen, die außerhalb von Geschäftsräumen abgeschlossen wurden, etwa an der Haustür oder auf sogenannten Kaffeefahrten, gilt in der Regel ein 14-tägiges Widerrufsrecht - Unterschrift unter Zeitdruck bindet also nicht sofort endgültig."}
],

politik: [
{id:"p1",title:"Wie eine Bundestagswahl grundsätzlich funktioniert",text:"Jede wahlberechtigte Person hat zwei Stimmen: Die Erststimme wählt eine Person im Wahlkreis, die Zweitstimme eine Partei. Die Zweitstimmen entscheiden über die Sitzverteilung im Bundestag insgesamt, wobei Parteien unter fünf Prozent in der Regel leer ausgehen (Fünf-Prozent-Hürde)."},
{id:"p2",title:"Was die Gewaltenteilung bedeutet",text:"Staatliche Macht wird auf drei unabhängige Bereiche verteilt: Legislative (Gesetzgebung, z.B. Parlament), Exekutive (Ausführung, z.B. Regierung und Verwaltung) und Judikative (Rechtsprechung, z.B. Gerichte). So soll verhindert werden, dass sich Macht bei einer einzelnen Stelle konzentriert."},
{id:"p3",title:"Wie die Europäische Zentralbank Zinsen setzt und warum das wichtig ist",text:"Die EZB legt Leitzinsen fest, zu denen sich Banken im Euroraum Geld leihen können. Höhere Leitzinsen machen Kredite teurer und sollen die Wirtschaft abkühlen und Inflation bremsen, niedrige Zinsen sollen Investitionen und Konsum ankurbeln."},
{id:"p4",title:"Was Inflation und Deflation für den Alltag bedeuten",text:"Bei Inflation steigen die Preise allgemein, Geld wird also weniger wert - Sparguthaben verlieren real an Kaufkraft. Bei Deflation sinken Preise, was zunächst gut klingt, aber Konsum und Investitionen verzögern kann, weil viele auf noch günstigere Preise warten."},
{id:"p5",title:"Wie das Bundesverfassungsgericht arbeitet",text:"Es prüft, ob Gesetze und staatliches Handeln mit dem Grundgesetz vereinbar sind, und kann Gesetze für nichtig erklären. Bürgerinnen und Bürger können es über eine Verfassungsbeschwerde anrufen, wenn sie sich in ihren Grundrechten verletzt sehen."},
{id:"p6",title:"Was der Unterschied zwischen Koalition und absoluter Mehrheit ist",text:"Erreicht keine Partei allein die Mehrheit der Sitze, schließen sich mehrere Parteien zu einer Koalition zusammen, um gemeinsam eine Regierung zu bilden. Eine absolute Mehrheit einer einzelnen Partei ist in vielen Mehrparteiensystemen eher selten."},
{id:"p7",title:"Wie Staatsschulden grob funktionieren",text:"Staaten nehmen oft über Anleihen Kredite auf, um Ausgaben zu finanzieren, die aktuelle Einnahmen übersteigen. Zinsen und Rückzahlungen belasten künftige Haushalte - die Schuldenquote setzt die Gesamtschulden ins Verhältnis zur jährlichen Wirtschaftsleistung (BIP)."},
{id:"p8",title:"Was Lobbyismus ist - und warum er umstritten ist",text:"Lobbyismus bezeichnet den Versuch von Interessengruppen, politische Entscheidungen in ihrem Sinne zu beeinflussen, etwa durch Gespräche mit Abgeordneten oder Stellungnahmen. Er ist ein legitimer Teil demokratischer Meinungsbildung, wird aber kritisch gesehen, wenn Transparenz fehlt oder finanzielle Macht überproportional Einfluss verschafft."},
{id:"p9",title:"Wie der Länderfinanzausgleich funktioniert",text:"Finanzstärkere Bundesländer geben einen Teil ihrer Steuereinnahmen an finanzschwächere Länder ab, damit überall vergleichbare Lebensverhältnisse und öffentliche Leistungen möglich sind. Das System wird regelmäßig politisch diskutiert und angepasst."},
{id:"p10",title:"Was eine Volksabstimmung von einer repräsentativen Demokratie unterscheidet",text:"In einer repräsentativen Demokratie entscheiden gewählte Vertreter stellvertretend über Gesetze. Bei einer Volksabstimmung stimmt die Bevölkerung direkt über eine konkrete Sachfrage ab - auf Bundesebene in Deutschland bislang die Ausnahme, in der Schweiz dagegen sehr verbreitet."},
{id:"p11",title:"Wie Zölle wirtschaftlich wirken",text:"Zölle verteuern importierte Waren und sollen heimische Produzenten vor günstigerer ausländischer Konkurrenz schützen. Gleichzeitig können sie Handelspartner zu Gegenmaßnahmen veranlassen und am Ende auch heimische Verbraucher durch höhere Preise treffen."},
{id:"p12",title:"Was der Unterschied zwischen Netto- und Bruttoinlandsprodukt-Wachstum bedeutet",text:"Wirtschaftswachstum wird meist als prozentuale Veränderung des Bruttoinlandsprodukts angegeben. Wächst die Bevölkerung schneller als die Wirtschaft, kann das Gesamtwachstum positiv sein, während der Wohlstand pro Kopf trotzdem stagniert oder sinkt."},
{id:"p13",title:"Wie eine Regierungsbildung nach der Wahl grob abläuft",text:"Nach der Wahl sondieren Parteien, welche Koalitionen rechnerisch und inhaltlich möglich wären. Es folgen Koalitionsverhandlungen mit einem gemeinsamen Vertrag, bevor das Parlament eine Regierungschefin oder einen Regierungschef wählt."},
{id:"p14",title:"Was eine Rezession ist",text:"Als Rezession gilt oft ein Rückgang der Wirtschaftsleistung über mindestens zwei aufeinanderfolgende Quartale. Sie geht häufig mit steigender Arbeitslosigkeit und sinkenden Unternehmensgewinnen einher und kann verschiedene Ursachen haben, von Nachfrageeinbrüchen bis zu externen Schocks."},
{id:"p15",title:"Wie Subventionen grundsätzlich wirken",text:"Der Staat unterstützt gezielt bestimmte Branchen oder Verhaltensweisen finanziell, etwa erneuerbare Energien oder Landwirtschaft, um politisch gewünschte Effekte zu fördern. Kritisiert werden Subventionen oft, wenn sie Marktverzerrungen erzeugen oder sehr lange fortbestehen, ohne ihr Ziel zu erreichen."},
{id:"p16",title:"Was der Bundesrat im Unterschied zum Bundestag macht",text:"Der Bundesrat vertritt die Interessen der 16 Bundesländer auf Bundesebene und wirkt bei bestimmten Gesetzen mit, vor allem wenn Länderinteressen berührt sind. Anders als der Bundestag wird er nicht direkt gewählt, sondern setzt sich aus Mitgliedern der Landesregierungen zusammen."},
{id:"p17",title:"Wie eine Aktie grundsätzlich funktioniert",text:"Eine Aktie ist ein Anteil an einem Unternehmen. Steigt der Unternehmenswert oder werden hohe Gewinne erwartet, steigt meist auch der Kurs; Aktionäre können zudem an Gewinnausschüttungen (Dividenden) beteiligt werden, tragen aber auch das Risiko von Kursverlusten."},
{id:"p18",title:"Was der Unterschied zwischen Steuern und Abgaben/Beiträgen ist",text:"Steuern werden ohne konkrete Gegenleistung erhoben und fließen in den allgemeinen Staatshaushalt. Beiträge, etwa zur Sozialversicherung, sind dagegen zweckgebunden und stehen im Zusammenhang mit einer möglichen späteren Leistung, etwa Rente oder Krankenversicherung."},
{id:"p19",title:"Wie eine unabhängige Notenbank von der Regierung abgegrenzt ist",text:"Zentralbanken wie die EZB agieren bewusst unabhängig von tagespolitischen Weisungen der Regierungen, um geldpolitische Entscheidungen nicht von kurzfristigen Wahlinteressen abhängig zu machen. Das soll langfristige Preisstabilität glaubwürdiger machen."},
{id:"p20",title:"Was Freihandelsabkommen grob regeln",text:"Solche Abkommen zwischen Staaten sollen Zölle und andere Handelshemmnisse abbauen, um den Warenaustausch zu erleichtern. Befürworter sehen Vorteile durch günstigere Preise und mehr Wettbewerb, Kritiker warnen vor Druck auf heimische Standards und Arbeitsplätze."},
{id:"p21",title:"Wie der Mindestlohn wirtschaftlich diskutiert wird",text:"Ein gesetzlicher Mindestlohn soll Beschäftigte vor sehr niedrigen Löhnen schützen. Befürworter betonen sozialen Schutz und Kaufkraft, Kritiker verweisen auf mögliches Risiko für Arbeitsplätze in Branchen mit geringen Gewinnmargen - die tatsächlichen Effekte werden in der Forschung uneinheitlich bewertet."},
{id:"p22",title:"Was eine Verfassungsänderung erschwert",text:"Änderungen am Grundgesetz erfordern in Deutschland eine Zweidrittelmehrheit in Bundestag und Bundesrat. Diese hohe Hürde soll sicherstellen, dass die zentralen Spielregeln des Staates nicht durch eine einfache, kurzfristige Mehrheit verändert werden können."},
{id:"p23",title:"Wie Wechselkurse grob funktionieren",text:"Der Wechselkurs zeigt, wie viel eine Währung in einer anderen wert ist. Er wird unter anderem durch Zinsniveau, Inflationserwartungen, Handelsbilanzen und Vertrauen in eine Volkswirtschaft beeinflusst und wirkt sich direkt auf Import- und Exportpreise aus."},
{id:"p24",title:"Was der Unterschied zwischen Planwirtschaft und Marktwirtschaft ist",text:"In einer Planwirtschaft legt der Staat zentral fest, was, wie viel und zu welchem Preis produziert wird. In einer Marktwirtschaft bestimmen Angebot und Nachfrage weitgehend Preise und Produktion; die meisten heutigen Volkswirtschaften sind Mischformen mit unterschiedlich starkem Staatseinfluss."},
{id:"p25",title:"Wie eine Rentenversicherung im Umlageverfahren funktioniert",text:"Im Umlageverfahren zahlen die aktuell Erwerbstätigen mit ihren Beiträgen direkt die laufenden Renten der heutigen Rentnerinnen und Rentner. Das System hängt daher stark vom Verhältnis zwischen Beitragszahlenden und Rentenbeziehenden ab, was demografischer Wandel zur Herausforderung macht."}
],

raetsel: [
{id:"r1",title:"Der Bauer, der Wolf, die Ziege und der Kohlkopf",text:"Ein Bauer muss einen Wolf, eine Ziege und einen Kohlkopf über einen Fluss bringen. Sein Boot fasst nur ihn und eine Sache gleichzeitig. Lässt er Wolf und Ziege allein, frisst der Wolf die Ziege. Lässt er Ziege und Kohl allein, frisst die Ziege den Kohl. Wie schafft er alle drei sicher hinüber?",solution:"Erst die Ziege rüber, allein zurück. Dann den Wolf rüber, dafür die Ziege wieder mit zurücknehmen. Dann den Kohl rüber, allein zurück. Zuletzt die Ziege noch einmal rüber."},
{id:"r2",title:"Zwei Münzen",text:"Zwei Münzen ergeben zusammen 30 Cent. Eine der beiden ist keine 5-Cent-Münze. Wie viel ist jede Münze wert?",solution:"25 Cent und 5 Cent. Die 25-Cent-Münze ist 'keine 5-Cent-Münze' - die andere ist trotzdem eine."},
{id:"r3",title:"Der Mann im Hochhaus",text:"Ein Mann wohnt im 12. Stock. Jeden Morgen fährt er mit dem Aufzug bis zum 7. Stock und geht den Rest zu Fuß. Abends fährt er direkt bis zum 12. Stock hoch. Warum?",solution:"Er ist zu klein, um den Knopf für den 12. Stock zu erreichen - außer wenn es regnet, dann hat er einen Regenschirm dabei, mit dem er hochdrücken kann."},
{id:"r4",title:"Drei Schalter, eine Glühbirne",text:"In einem Raum ohne Fenster hängt eine Glühbirne. Draußen sind drei Schalter, genau einer davon steuert die Birne. Du darfst die Schalter beliebig betätigen, aber den Raum nur einmal betreten. Wie findest du heraus, welcher Schalter der richtige ist?",solution:"Schalter 1 eine Weile anlassen, dann ausschalten. Schalter 2 anschalten und anlassen. Den Raum betreten: Brennt die Birne, war es Schalter 2. Ist sie aus, aber warm, war es Schalter 1. Ist sie aus und kalt, war es Schalter 3."},
{id:"r5",title:"Das Ei-Problem",text:"Du hast zwei identische Eier und ein 100-stöckiges Gebäude. Ab einem bestimmten Stockwerk zerbricht ein Ei beim Fallenlassen, darunter nicht. Wie findest du das kritische Stockwerk mit möglichst wenigen Würfen heraus?",solution:"Man startet nicht bei Stock 1, sondern springt in größer werdenden Schritten (z.B. 14, dann 27, dann 39...) mit dem ersten Ei, und sucht nach dem Zerbrechen mit dem zweiten Ei einzeln im verbliebenen Bereich - so kommt man mit 14 Würfen im schlimmsten Fall aus, statt mit 100 einzelnen Versuchen."},
{id:"r6",title:"Der Lügner und der Wahrheitssager",text:"Zwei Wächter bewachen zwei Türen, eine führt in die Freiheit, die andere in den Untergang. Einer der Wächter lügt immer, der andere sagt immer die Wahrheit - du weißt nicht, wer wer ist. Du darfst nur einem Wächter eine einzige Frage stellen. Welche Frage rettet dich?",solution:"'Welche Tür würde der andere Wächter als die zur Freiheit bezeichnen?' Die genannte Tür ist immer die falsche - also die andere nehmen."},
{id:"r7",title:"Fünf Piraten und 100 Goldmünzen",text:"Fünf Piraten müssen 100 Goldmünzen aufteilen. Der ranghöchste macht einen Vorschlag, alle stimmen ab - bei Gleichstand oder Ablehnung mit Mehrheit wird er über Bord geworfen und der nächste macht einen Vorschlag. Alle Piraten sind perfekt logisch und wollen zuerst überleben, dann möglichst viel Gold. Wie sollte der erste Pirat verteilen?",solution:"Der erste Pirat gibt sich 98 Münzen, dem drittletzten Piraten 1 Münze und dem letzten 1 Münze - die beiden anderen bekommen nichts. Da die hinteren Piraten sonst bei einem Wechsel schlechter dastehen würden, stimmen genug zu."},
{id:"r8",title:"Die Zugfahrt",text:"Zwei Züge starten 120 km voneinander entfernt gleichzeitig aufeinander zu, einer mit 40 km/h, der andere mit 60 km/h. Eine Fliege startet beim langsameren Zug mit 100 km/h, fliegt zum anderen Zug, dreht um, fliegt zurück - und so weiter, bis die Züge zusammenstoßen. Wie viele Kilometer legt die Fliege insgesamt zurück?",solution:"120 Kilometer. Die Züge brauchen zusammen 120 Minuten Geschwindigkeit (40+60=100 km/h) für 120 km, also 1,2 Stunden - die Fliege fliegt in dieser Zeit mit 100 km/h genau 120 km, egal wie oft sie hin- und herfliegt."},
{id:"r9",title:"Das Wasser-Rätsel",text:"Du hast einen 3-Liter- und einen 5-Liter-Krug ohne Markierungen und unbegrenzt Wasser. Wie misst du genau 4 Liter ab?",solution:"5-Liter-Krug füllen, davon 3 Liter in den 3-Liter-Krug umfüllen (2 Liter bleiben im 5er). 3-Liter-Krug leeren, die 2 Liter hineingießen. 5-Liter-Krug wieder füllen, davon in den 3-Liter-Krug (der schon 2 hat) nachfüllen, bis er voll ist - das braucht nur 1 Liter. Im 5-Liter-Krug bleiben dann genau 4 Liter."},
{id:"r10",title:"Die Kalender-Frage",text:"Welcher Wochentag kommt mit ziemlicher Sicherheit jedes Jahr genau zweimal in einem einzigen Kalendermonat als '13.' vor - moment, umgekehrt gefragt: In wie vielen Monaten eines normalen Jahres kann der 13. auf jeden Wochentag fallen? Und: Warum gibt es statistisch öfter einen Freitag den 13. als andere Tage?",solution:"Der gregorianische Kalender wiederholt sich exakt alle 400 Jahre, und in diesem Zyklus fällt der 13. eines Monats etwas häufiger auf einen Freitag als auf jeden anderen Wochentag - eine Folge der unregelmäßigen Monatslängen und der Schaltjahresregel."},
{id:"r11",title:"Das Sockenproblem",text:"In einer dunklen Schublade liegen 10 schwarze und 10 blaue Socken, ungeordnet. Wie viele Socken musst du mindestens blind herausziehen, um sicher ein passendes Paar zu haben?",solution:"3 Socken. Bei nur 2 Farben ergeben spätestens die ersten drei gezogenen Socken zwangsläufig zwei gleiche."},
{id:"r12",title:"Wer lügt beim Frühstück?",text:"Anna sagt: 'Ben lügt.' Ben sagt: 'Clara lügt.' Clara sagt: 'Anna und Ben lügen beide.' Nur eine Person sagt die Wahrheit. Wer?",solution:"Ben sagt die Wahrheit. Wäre Anna ehrlich, würde Ben lügen - dann müsste Clara stimmen, aber Clara sagt, beide lügen, ein Widerspruch. Die einzig stimmige Lösung: Ben ehrlich, Anna und Clara lügen."},
{id:"r13",title:"Das Zahlenschloss",text:"Ein dreistelliges Zahlenschloss: Die Summe aller drei Ziffern ist 15, die erste Ziffer ist doppelt so groß wie die letzte, und die mittlere Ziffer ist um 3 größer als die letzte. Wie lautet der Code?",solution:"663. Wenn die letzte Ziffer x ist, gilt 2x + (x+3) + x = 15, also 4x = 12 und x = 3. Damit ist die erste Ziffer 6, die mittlere 6 und die letzte 3."},
{id:"r14",title:"Die Brücke bei Nacht",text:"Vier Personen müssen nachts eine Brücke überqueren, die nur maximal zwei Personen gleichzeitig trägt, und sie brauchen dafür eine Taschenlampe, die nur einmal existiert und bei jeder Überquerung mitgenommen werden muss. Die vier brauchen einzeln 1, 2, 5 und 10 Minuten. Gehen zwei zusammen, bestimmt die langsamere Person das Tempo. Wie schaffen sie es in 17 Minuten?",solution:"Erst 1+2 rüber (2 Min), die 1 bringt die Lampe zurück (1 Min). Dann 5+10 rüber (10 Min), die 2 bringt die Lampe zurück (2 Min). Zuletzt 1+2 nochmal rüber (2 Min). Summe: 2+1+10+2+2 = 17 Minuten."},
{id:"r15",title:"Das fehlende Dollar-Rätsel",text:"Drei Freunde zahlen je 10 Euro für ein 30-Euro-Zimmer. Der Hotelier merkt, das Zimmer kostet nur 25 Euro, und schickt 5 Euro per Boten zurück. Der Bote steckt 2 Euro ein und gibt jedem Freund 1 Euro zurück. Jeder hat also 9 Euro gezahlt (27 Euro insgesamt) plus die 2 Euro des Boten macht 29 Euro. Wo ist der fehlende Euro?",solution:"Die Rechnung ist ein Trick: Die 27 Euro, die die Freunde bezahlt haben, enthalten bereits die 2 Euro des Boten (25 Euro Zimmer + 2 Euro Bote = 27 Euro). Man darf die 2 Euro nicht nochmal addieren - es fehlt also gar nichts."},
{id:"r16",title:"Die Waage mit der falschen Kugel",text:"Du hast 8 optisch identische Kugeln, eine davon ist etwas schwerer als die anderen sieben. Mit einer Balkenwaage und nur 2 Wägungen musst du die schwerere Kugel finden. Wie geht das?",solution:"Erste Wägung: 3 gegen 3 Kugeln (2 bleiben übrig). Ist eine Seite schwerer, ist die gesuchte Kugel darunter; sind beide gleich schwer, ist es eine der 2 übrigen. Zweite Wägung: von den verbliebenen 3 (oder 2) Kandidaten 1 gegen 1 wägen, um die schwerere eindeutig zu bestimmen."},
{id:"r17",title:"Das Familienrätsel",text:"Eine Frau hat so viele Brüder wie Schwestern. Ihr Bruder hat doppelt so viele Schwestern wie Brüder. Wie viele Söhne und Töchter hat die Familie insgesamt?",solution:"4 Töchter und 3 Söhne. Aus Sicht der Frau: Schwestern = Brüder → 3 Schwestern (also 4 Töchter insgesamt), 3 Brüder. Aus Sicht eines Bruders: Schwestern (4) = doppelt so viele wie Brüder (2 andere Brüder) - passt bei 3 Söhnen, 4 Töchtern."},
{id:"r18",title:"Das Spiegelrätsel",text:"Welches Wort liest sich im Spiegel genauso wie ohne Spiegel - und zwar nicht nur symmetrische Einzelbuchstaben, sondern das ganze Wort als Block gelesen?",solution:"Ein bekanntes Beispiel ist 'OTTO' - bei manchen Schriftarten liest sich der Name im Spiegel identisch, weil O und T beide senkrecht symmetrisch sind."},
{id:"r19",title:"Die Treppen-Frage",text:"Ein Mädchen steigt eine Treppe hoch. Sie kann dabei entweder 1 oder 2 Stufen auf einmal nehmen. Bei einer Treppe mit 5 Stufen: Wie viele unterschiedliche Wege gibt es, ganz nach oben zu kommen?",solution:"8 Wege. Das folgt der Fibonacci-Logik: Wege(n) = Wege(n-1) + Wege(n-2), beginnend mit Wege(1)=1, Wege(2)=2 → 1,2,3,5,8."},
{id:"r20",title:"Das Alters-Rätsel",text:"Vor drei Jahren war ein Vater dreimal so alt wie sein Sohn. In sieben Jahren wird er nur noch doppelt so alt sein wie sein Sohn. Wie alt sind beide heute?",solution:"Der Vater ist heute 33, der Sohn 13. Vor 3 Jahren: 30 zu 10 (dreimal so alt). In 7 Jahren: 40 zu 20 (doppelt so alt)."}
]

};

/* ==================== QUIZ ==================== */
const QUIZ = [
{id:"q1",cat:"wissen",q:"Warum erscheint der Himmel tagsüber blau?",options:["Weil blaues Licht stärker gestreut wird","Weil die Atmosphäre blau eingefärbt ist","Weil das Meer den Himmel spiegelt","Weil UV-Licht blau leuchtet"],correct:0,expl:"Kurzwelliges blaues Licht wird von Luftmolekülen stärker gestreut (Rayleigh-Streuung) als rotes Licht."},
{id:"q2",cat:"wissen",q:"Wie viele Knochen hat ein erwachsener Mensch ungefähr?",options:["150","206","300","412"],correct:1,expl:"Ein Erwachsener hat rund 206 Knochen, ein Baby dagegen etwa 300 - viele verwachsen mit dem Wachstum."},
{id:"q3",cat:"wissen",q:"Was beschreibt der Dunning-Kruger-Effekt?",options:["Dass Experten immer Recht haben","Dass Unwissende ihre Fähigkeiten oft überschätzen","Dass Gedächtnis mit dem Alter abnimmt","Dass Gruppen immer klüger sind als Einzelne"],correct:1,expl:"Wer wenig Wissen in einem Bereich hat, kann die eigenen Lücken oft schwer erkennen und überschätzt sich."},
{id:"q4",cat:"wissen",q:"Wodurch entsteht ein Regenbogen?",options:["Durch Reflexion an Wolken","Durch Brechung und Reflexion in Regentropfen","Durch elektrische Aufladung der Luft","Durch Streuung an Staubpartikeln"],correct:1,expl:"Licht wird im Regentropfen gebrochen, reflektiert und erneut gebrochen - dabei fächern sich die Farben auf."},
{id:"q5",cat:"wissen",q:"Was passiert bei kognitiver Dissonanz?",options:["Man vergisst plötzlich etwas Wichtiges","Überzeugung und Verhalten widersprechen sich unangenehm","Man kann sich nicht entscheiden","Zwei Gedächtnisinhalte verschmelzen"],correct:1,expl:"Das Unbehagen entsteht, wenn Überzeugung und eigenes Handeln nicht zusammenpassen."},
{id:"q6",cat:"wissen",q:"Wie viele Satelliten braucht ein GPS-Empfänger mindestens für eine Positionsbestimmung?",options:["1","2","4","10"],correct:2,expl:"Für eine genaue Positionsbestimmung per Triangulation braucht es Signale von mindestens vier Satelliten."},
{id:"q7",cat:"wissen",q:"Was besagt die Pareto-Regel (80/20-Regel) sinngemäß?",options:["80% der Menschen sind rechtshändig","20% des Aufwands bringen oft 80% des Ergebnisses","80% aller Firmen scheitern","Man sollte 20% des Einkommens sparen"],correct:1,expl:"Die Faustregel sagt: ein kleiner Teil des Aufwands ist oft für den Großteil des Ergebnisses verantwortlich."},
{id:"q8",cat:"alltag",q:"Wie lang ist das gesetzliche Widerrufsrecht bei den meisten Online-Käufen?",options:["7 Tage","14 Tage","30 Tage","Es gibt keins"],correct:1,expl:"Bei Fernabsatzverträgen gilt in der Regel ein 14-tägiges Widerrufsrecht ohne Angabe von Gründen."},
{id:"q9",cat:"alltag",q:"Was deckt eine private Haftpflichtversicherung ab?",options:["Schäden am eigenen Auto","Schäden, die man selbst anderen zufügt","Krankheitskosten im Ausland","Diebstahl der eigenen Sachen"],correct:1,expl:"Sie übernimmt Schäden, die man unabsichtlich anderen Personen oder deren Eigentum zufügt."},
{id:"q10",cat:"alltag",q:"Was ist der Unterschied zwischen Brutto und Netto?",options:["Brutto ist nach Steuern, Netto davor","Netto ist der Betrag, der ausgezahlt wird","Beides ist immer identisch","Brutto gilt nur für Selbstständige"],correct:1,expl:"Netto ist das, was nach Abzug von Steuern und Sozialabgaben tatsächlich ausgezahlt wird."},
{id:"q11",cat:"alltag",q:"Wofür braucht man in der Regel keine Steuererklärungspflicht?",options:["Mehrere Einkunftsarten gleichzeitig","Nur ein einziges Angestelltenverhältnis ohne Besonderheiten","Bezug von Kurzarbeitergeld","Selbstständige Nebentätigkeit"],correct:1,expl:"Wer nur einen Arbeitgeber hat und keine Besonderheiten, ist häufig nicht zur Abgabe verpflichtet - eine freiwillige Abgabe kann sich trotzdem lohnen."},
{id:"q12",cat:"alltag",q:"Was unterscheidet Garantie von der gesetzlichen Sachmängelhaftung?",options:["Garantie ist verpflichtend, Sachmängelhaftung freiwillig","Sachmängelhaftung gilt automatisch, Garantie ist freiwillig","Beides ist dasselbe","Garantie gilt nur im Ausland"],correct:1,expl:"Die Sachmängelhaftung gilt automatisch beim Kauf, eine Garantie ist ein zusätzliches freiwilliges Versprechen."},
{id:"q13",cat:"alltag",q:"Was ist üblicherweise die maximale Kaution bei einer Mietwohnung?",options:["1 Nettokaltmiete","3 Nettokaltmieten","6 Nettokaltmieten","Es gibt kein Limit"],correct:1,expl:"Die Kaution darf gesetzlich in der Regel maximal drei Nettokaltmieten betragen."},
{id:"q14",cat:"politik",q:"Wofür entscheidet bei der Bundestagswahl vor allem die Zweitstimme?",options:["Über den Wahlkreis-Kandidaten","Über die Sitzverteilung der Parteien im Bundestag","Über den Bundespräsidenten","Über den Bundesratspräsidenten"],correct:1,expl:"Die Zweitstimme ist entscheidend für die Sitzverteilung der Parteien im Bundestag."},
{id:"q15",cat:"politik",q:"Was bezeichnet die Gewaltenteilung?",options:["Die Aufteilung des Staatshaushalts","Die Trennung von Legislative, Exekutive und Judikative","Die Aufteilung der Bundesländer","Die Trennung von Kirche und Staat"],correct:1,expl:"Macht wird auf Gesetzgebung, Ausführung und Rechtsprechung verteilt, um Machtkonzentration zu verhindern."},
{id:"q16",cat:"politik",q:"Was passiert grob, wenn die EZB die Leitzinsen erhöht?",options:["Kredite werden günstiger","Kredite werden teurer, was die Wirtschaft abkühlen soll","Löhne steigen automatisch","Die Inflation steigt garantiert weiter"],correct:1,expl:"Höhere Leitzinsen verteuern Kredite und sollen Konsum und Investitionen bremsen."},
{id:"q17",cat:"politik",q:"Wie hoch ist die übliche Sperrklausel (Fünf-Prozent-Hürde) bei der Bundestagswahl?",options:["3%","5%","8%","10%"],correct:1,expl:"Parteien unter 5% der Zweitstimmen ziehen in der Regel nicht in den Bundestag ein (Ausnahmen bestehen)."},
{id:"q18",cat:"politik",q:"Was prüft das Bundesverfassungsgericht in erster Linie?",options:["Ob Politiker beliebt sind","Ob Gesetze mit dem Grundgesetz vereinbar sind","Ob der Staatshaushalt ausgeglichen ist","Ob eine Partei wirtschaftlich erfolgreich ist"],correct:1,expl:"Es prüft die Vereinbarkeit von Gesetzen und staatlichem Handeln mit dem Grundgesetz."},
{id:"q19",cat:"politik",q:"Was gilt allgemein als Rezession?",options:["Ein einzelner schlechter Börsentag","Rückgang der Wirtschaftsleistung über mind. zwei Quartale","Steigende Löhne über ein Jahr","Ein Rücktritt der Regierung"],correct:1,expl:"Als Rezession gilt häufig ein Rückgang des BIP über mindestens zwei aufeinanderfolgende Quartale."},
{id:"q20",cat:"politik",q:"Wen vertritt der Bundesrat vor allem?",options:["Die Gewerkschaften","Die 16 Bundesländer","Die Europäische Union","Die größten Unternehmen"],correct:1,expl:"Der Bundesrat vertritt die Interessen der Bundesländer auf Bundesebene."},
{id:"q21",cat:"zitate",q:"Von wem stammt sinngemäß 'Ich weiß, dass ich nichts weiß'?",options:["Platon","Sokrates","Aristoteles","Konfuzius"],correct:1,expl:"Der Satz wird traditionell Sokrates zugeschrieben, überliefert vor allem durch Platon."},
{id:"q22",cat:"zitate",q:"Wer sagte 'Phantasie ist wichtiger als Wissen'?",options:["Isaac Newton","Albert Einstein","Marie Curie","Nikola Tesla"],correct:1,expl:"Das Zitat wird Albert Einstein zugeschrieben."},
{id:"q23",cat:"zitate",q:"Von wem stammt 'Man sieht nur mit dem Herzen gut'?",options:["Antoine de Saint-Exupéry","Victor Hugo","Albert Camus","Jean-Paul Sartre"],correct:0,expl:"Das Zitat stammt aus 'Der kleine Prinz' von Antoine de Saint-Exupéry."},
{id:"q24",cat:"wissen",q:"Warum ist Honig so lange haltbar?",options:["Weil er stark gekühlt gelagert wird","Weil er kaum Wasser enthält und einen niedrigen pH-Wert hat","Weil er ständig neu produziert wird","Weil er Konservierungsstoffe enthält"],correct:1,expl:"Der geringe Wasseranteil und niedrige pH-Wert bieten Bakterien und Pilzen kaum Lebensgrundlage."},
{id:"q25",cat:"wissen",q:"Was zeigt die Fibonacci-Folge?",options:["Eine Zufallsfolge ohne Muster","Jede Zahl ist Summe der beiden vorherigen","Nur gerade Zahlen in Reihe","Eine Folge, die immer bei 0 endet"],correct:1,expl:"0,1,1,2,3,5,8,13 ... jede Zahl ergibt sich aus der Summe der beiden vorherigen."}
];

/* ==================== STATE / STORAGE ==================== */
const LS_KEY = "denkpause.v1";
let STATE = loadState();

function defaultState(){
  return {
    theme: "dark",
    skin: "standard",
    navyPanel: "classic",
    catsOn: { zitate:true, wissen:true, alltag:true, politik:true, wiki:true, aktpolitik:true, raetsel:true },
    weather: { city:"", lat:null, lon:null },
    sessions: {},   // "YYYY-MM-DD" -> { items:[{cat,id,title}], count, minutes }
    moods: {},      // "YYYY-MM-DD" -> 1..5
    favorites: [],  // [{cat,id,title,text,author,savedAt}]
    dailyGoal: 5,
    quizStats: { played:0, perfect:0, best:{} },   // best[catKey] = {score,total}
    dailyChallenge: { date:"", ids:[], done:false, score:0 },
    leitner: {}     // Quiz-Wiederholung: id -> { box:1..5, due:"YYYY-MM-DD" }
  };
}
function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed, {
      catsOn: Object.assign(defaultState().catsOn, parsed.catsOn||{}),
      weather: Object.assign(defaultState().weather, parsed.weather||{}),
      sessions: parsed.sessions || {},
      moods: parsed.moods || {},
      favorites: parsed.favorites || [],
      quizStats: Object.assign(defaultState().quizStats, parsed.quizStats||{}, {best: Object.assign({}, (parsed.quizStats||{}).best||{})}),
      dailyChallenge: Object.assign(defaultState().dailyChallenge, parsed.dailyChallenge||{})
    });
  }catch(e){ return defaultState(); }
}
function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(STATE)); }

function todayKey(d){
  d = d || new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

/* ==================== NAV ==================== */
document.getElementById("nav").addEventListener("click", e=>{
  const btn = e.target.closest(".tab"); if(!btn) return;
  showScreen(btn.dataset.t);
});
function showScreen(name){
  document.querySelectorAll(".screen").forEach(s=> s.classList.toggle("active", s.dataset.screen===name));
  document.querySelectorAll(".tab").forEach(t=> t.classList.toggle("on", t.dataset.t===name));
  if(name==="ablenken") renderAblenken();
  if(name==="wissen") renderWissen();
  if(name==="quiz") renderQuizHome();
  if(name==="kalender") renderKalender();
  if(name==="einst") renderEinst();
}

/* ==================== HILFEN ==================== */
function esc(s){ return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function activeCats(){ return Object.keys(STATE.catsOn).filter(k=>STATE.catsOn[k]); }
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function streakDays(){
  let n=0; let d=new Date();
  if(!STATE.sessions[todayKey(d)]) { d.setDate(d.getDate()-1); if(!STATE.sessions[todayKey(d)]) return 0; }
  while(STATE.sessions[todayKey(d)]){ n++; d.setDate(d.getDate()-1); }
  return n;
}

/* ==================== STATISTIK / ERFOLGE ==================== */
function computeStats(){
  let total=0; const catCounts={};
  Object.values(STATE.sessions).forEach(s=>{
    total += s.count||0;
    (s.items||[]).forEach(it=>{ catCounts[it.cat] = (catCounts[it.cat]||0)+1; });
  });
  return { total, catCounts, streak: streakDays() };
}

const ACHIEVEMENTS = [
  {id:"first", em:"🌱", label:"Erster Schritt", desc:"Den ersten Impuls gelesen", check:(s)=> s.total>=1},
  {id:"streak3", em:"🔥", label:"Dranbleiber", desc:"3 Tage in Folge", check:(s)=> s.streak>=3},
  {id:"streak7", em:"🔥", label:"Serientäter", desc:"7 Tage in Folge", check:(s)=> s.streak>=7},
  {id:"streak30", em:"🏅", label:"Marathon", desc:"30 Tage in Folge", check:(s)=> s.streak>=30},
  {id:"total50", em:"📚", label:"Vielleser", desc:"50 Impulse insgesamt", check:(s)=> s.total>=50},
  {id:"total200", em:"🐛", label:"Bücherwurm", desc:"200 Impulse insgesamt", check:(s)=> s.total>=200},
  {id:"allcats", em:"🎯", label:"Allrounder", desc:"Jede Kategorie mind. 1x", check:(s)=> Object.keys(CATS).every(c=> (s.catCounts[c]||0)>0)},
  {id:"quizperfect", em:"🏆", label:"Quizass", desc:"Quiz mit voller Punktzahl", check:()=> STATE.quizStats.perfect>=1},
  {id:"quiz5", em:"❓", label:"Vielgefragt", desc:"5 Quizrunden gespielt", check:()=> STATE.quizStats.played>=5},
  {id:"fav10", em:"⭐", label:"Sammler", desc:"10 Impulse gemerkt", check:()=> STATE.favorites.length>=10}
];
function unlockedAchievements(){ const s = computeStats(); return ACHIEVEMENTS.filter(a=>a.check(s)); }

/* ==================== FAVORITEN ==================== */
function favKey(cat,id){ return cat+":"+id; }
function isFavorited(cat,id){ return STATE.favorites.some(f=>f.cat===cat && f.id===id); }
function toggleFavorite(cat, item){
  const idx = STATE.favorites.findIndex(f=>f.cat===cat && f.id===item.id);
  if(idx>=0){ STATE.favorites.splice(idx,1); }
  else{ STATE.favorites.push({cat, id:item.id, title:item.title||null, text:item.text, author:item.author||null, savedAt:Date.now()}); }
  saveState();
  return idx<0;
}

/* ==================== TEILEN ==================== */
async function shareItem(cat, item, btnEl){
  const title = item.title || "Zitat";
  const body = item.title ? `${item.title}\n\n${item.text}` : `„${item.text}"\n— ${item.author}`;
  const shareText = body + "\n\n(via Planer · Pause)";
  if(navigator.share){
    try{ await navigator.share({title, text:shareText}); return; }
    catch(e){ if(e && e.name === "AbortError") return; /* Nutzer hat abgebrochen - kein Fehler */ }
  }
  try{
    await navigator.clipboard.writeText(shareText);
    if(btnEl){ const old = btnEl.textContent; btnEl.textContent = "Kopiert!"; setTimeout(()=>{ btnEl.textContent = old; }, 1400); }
  }catch(e2){
    openSheet(`
      <h2>Zum Kopieren markieren</h2>
      <p class="muted" style="margin-bottom:10px">Teilen war auf diesem Gerät nicht automatisch möglich - markiere den Text von Hand.</p>
      <textarea readonly id="shareTextArea" style="width:100%;min-height:120px;background:var(--panel-2);border:1px solid var(--line);border-radius:11px;color:var(--text);padding:11px;font-size:13px">${esc(shareText)}</textarea>
    `);
    const ta = document.getElementById("shareTextArea");
    if(ta){ ta.focus(); ta.select(); }
  }
}

/* ==================== ABLENKEN-SCREEN ==================== */
let selectedDuration = "endlos"; // "2" | "5" | "10" | "endlos" (Minuten)

function renderAblenken(){
  const el = document.getElementById("screen-ablenken");
  const tk = todayKey();
  const today = STATE.sessions[tk] || {count:0, minutes:0, items:[]};
  const streak = streakDays();
  const last = lastSessionSummary();
  const goal = STATE.dailyGoal || 5;
  const goalPct = Math.min(100, Math.round(((today.count||0)/goal)*100));
  const unlocked = unlockedAchievements();

  el.innerHTML = `
    <div class="top">
      <div><h1>Ablenken</h1><p>Kurze Pause, klug genutzt.</p></div>
      <span class="streak-chip">🔥 ${streak} Tage</span>
    </div>

    <div class="hero">
      <div class="kicker">Jetzt</div>
      <h2>Was lernst du in den nächsten Minuten?</h2>
      <p class="meta">Wähl aus, woraus dein Feed schöpfen soll, und leg los - statt zu scrollen.</p>
      <div class="chips" id="catChips">
        ${Object.keys(CATS).map(k=>`<button class="chip ${STATE.catsOn[k]?'on':''}" data-cat="${k}">${CATS[k].label}</button>`).join("")}
      </div>
      <p class="tiny" style="margin-bottom:8px">Dauer</p>
      <div class="chips" id="durChips" style="margin-bottom:16px">
        ${[["2","2 Min"],["5","5 Min"],["10","10 Min"],["endlos","Endlos"]].map(([v,l])=>`<button class="chip dur-chip ${selectedDuration===v?'on':''}" data-dur="${v}">${l}</button>`).join("")}
      </div>
      <button class="btn accent block" id="startFeedBtn">Jetzt ablenken</button>
      <div class="goal-bar"><i style="width:${goalPct}%"></i></div>
      <p class="goal-text">${today.count||0} von ${goal} Impulsen heute${goalPct>=100?" · Ziel erreicht! 🎉":""}</p>
    </div>

    <div class="stat-row">
      <div class="stat"><b>${today.count||0}</b><span>heute gelernt</span></div>
      <div class="stat"><b>${today.minutes||0}</b><span>Minuten heute</span></div>
      <div class="stat"><b>${streak}</b><span>Tage in Folge</span></div>
    </div>

    <div class="card tight">
      <div class="card-h"><h2>Letzte Ablenkung</h2></div>
      ${last ? `<p class="muted">${esc(last)}</p>` : `<p class="muted">Noch keine Runde gestartet - fang einfach an.</p>`}
    </div>

    <div class="card tight" id="achCard" style="cursor:pointer">
      <div class="card-h"><h2>Erfolge</h2><span>${unlocked.length} / ${ACHIEVEMENTS.length} ›</span></div>
      <p class="muted">Tippen, um alle Erfolge zu sehen.</p>
    </div>

    <div class="card tight">
      <div class="card-h"><h2>Zum Stöbern</h2><span onclick="showScreen('wissen')" style="cursor:pointer">Wissen ›</span></div>
      <p class="muted">Lieber gezielt lesen statt zufällig? Im Wissen-Tab kannst du nach Themen stöbern.</p>
    </div>
  `;

  document.getElementById("catChips").addEventListener("click", e=>{
    const chip = e.target.closest(".chip"); if(!chip) return;
    const cat = chip.dataset.cat;
    if(activeCats().length===1 && STATE.catsOn[cat]) return; // mind. eine Kategorie muss an bleiben
    STATE.catsOn[cat] = !STATE.catsOn[cat];
    saveState(); renderAblenken();
  });
  document.getElementById("durChips").addEventListener("click", e=>{
    const chip = e.target.closest(".dur-chip"); if(!chip) return;
    selectedDuration = chip.dataset.dur;
    renderAblenken();
  });
  document.getElementById("startFeedBtn").addEventListener("click", startFeed);
  document.getElementById("achCard").addEventListener("click", openAchievementsSheet);
}

function openAchievementsSheet(){
  const unlocked = new Set(unlockedAchievements().map(a=>a.id));
  openSheet(`
    <h2>Erfolge</h2>
    <p class="muted" style="margin-bottom:14px">${unlocked.size} von ${ACHIEVEMENTS.length} freigeschaltet</p>
    <div class="badge-grid">
      ${ACHIEVEMENTS.map(a=>`
        <div class="ach ${unlocked.has(a.id)?'unlocked':''}">
          <span class="em">${a.em}</span>
          <div class="lab">${esc(a.label)}</div>
        </div>
      `).join("")}
    </div>
    <p class="tiny" style="margin-top:14px">${ACHIEVEMENTS.map(a=>unlocked.has(a.id)?`<b>${esc(a.label)}</b>: ${esc(a.desc)}`:``).filter(Boolean).join(" · ") || "Noch nichts freigeschaltet - leg los!"}</p>
  `);
}

function lastSessionSummary(){
  const keys = Object.keys(STATE.sessions).sort();
  if(!keys.length) return null;
  const lastKey = keys[keys.length-1];
  const s = STATE.sessions[lastKey];
  if(!s || !s.items || !s.items.length) return null;
  const lastItem = s.items[s.items.length-1];
  const dateStr = lastKey===todayKey() ? "heute" : new Date(lastKey).toLocaleDateString("de-DE",{day:"numeric",month:"long"});
  return `${dateStr}: ${s.count} Impuls${s.count===1?"":"e"} gelesen, u.a. "${lastItem.title}".`;
}

/* ==================== FEED (ABLENKEN-MODUS) ==================== */
let feedState = null;

function startFeed(){
  const cats = activeCats();
  if(!cats.length) return;
  const durationMin = selectedDuration==="endlos" ? null : Number(selectedDuration);
  feedState = { start: Date.now(), viewed: [], cats, durationMin, timerId:null, current:null };
  document.getElementById("feedOverlay").classList.add("active");
  document.getElementById("feedTimer").textContent = "";
  if(durationMin){
    const endAt = Date.now() + durationMin*60000;
    feedState.timerId = setInterval(()=>{
      const remain = Math.max(0, endAt - Date.now());
      const mm = Math.floor(remain/60000), ss = Math.floor((remain%60000)/1000);
      document.getElementById("feedTimer").textContent = `${mm}:${String(ss).padStart(2,"0")}`;
      if(remain<=0){ endFeed(); }
    }, 500);
  }
  nextFeedItem();
}
document.getElementById("feedClose").addEventListener("click", endFeed);
document.getElementById("feedNext").addEventListener("click", nextFeedItem);
document.getElementById("feedCard").addEventListener("click", e=>{
  if(e.target.closest("a") || e.target.closest(".reveal-btn")) return;
  nextFeedItem();
});
document.getElementById("feedFavBtn").addEventListener("click", ()=>{
  if(!feedState || !feedState.current) return;
  const { cat, item } = feedState.current;
  const nowFav = toggleFavorite(cat, item);
  updateFeedFavBtn(nowFav);
});
document.getElementById("feedShareBtn").addEventListener("click", ()=>{
  if(!feedState || !feedState.current) return;
  const { cat, item } = feedState.current;
  shareItem(cat, item, document.getElementById("feedShareBtn"));
});
function updateFeedFavBtn(isFav){
  const btn = document.getElementById("feedFavBtn");
  btn.textContent = isFav ? "♥ Gemerkt" : "♡ Merken";
  btn.classList.toggle("on", isFav);
}

async function nextFeedItem(){
  const cats = feedState.cats;
  const cat = cats[Math.floor(Math.random()*cats.length)];
  const card = document.getElementById("feedCard");
  const badge = document.getElementById("feedBadge");
  badge.textContent = CATS[cat].label;
  badge.className = "badge " + CATS[cat].color;
  card.style.opacity = "0";

  let item, dateLabel = "";
  if(cat === "wiki"){
    card.innerHTML = `<div class="kicker" style="color:var(--wiki)">Wikipedia-Zufall</div><h2>Lade Artikel …</h2><p>Ein zufälliger Wikipedia-Auszug wird geladen.</p>`;
    item = await fetchWikiRandom();
  } else if(cat === "aktpolitik"){
    card.innerHTML = `<div class="kicker" style="color:var(--aktuell)"><span class="live-dot"></span>Aktuelle Politik</div><h2>Lade aktuelle Meldungen …</h2><p>Die neuesten Politik-Meldungen werden geladen.</p>`;
    try{
      const res = await loadAktuellePolitik();
      item = res.items[Math.floor(Math.random()*res.items.length)];
      dateLabel = res.date;
    }catch(e){
      const pool = DATA.politik;
      const f = pool[Math.floor(Math.random()*pool.length)];
      item = { id:f.id, title:f.title, text:f.text, offline:true };
    }
  } else {
    const pool = DATA[cat];
    item = pool[Math.floor(Math.random()*pool.length)];
  }

  renderFeedItem(cat, item, dateLabel);
  feedState.current = { cat, item };
  updateFeedFavBtn(isFavorited(cat, item.id));
  feedState.viewed.push({cat, id:item.id, title: item.title || (item.text||"").slice(0,60)});
  document.getElementById("feedProgress").textContent = `${feedState.viewed.length}. Impuls dieser Runde`;
  requestAnimationFrame(()=>{ card.style.transition="opacity .18s ease"; card.style.opacity="1"; });
}

function renderFeedItem(cat, item, dateLabel){
  const card = document.getElementById("feedCard");
  if(cat === "zitate"){
    card.innerHTML = `<div class="kicker" style="color:var(--zitate)">Zitat</div><h2>„${esc(item.text)}"</h2><p class="author">— ${esc(item.author)}</p>`;
  } else if(cat === "wiki"){
    card.innerHTML = `<div class="kicker" style="color:var(--wiki)">Wikipedia-Zufall</div><h2>${esc(item.title)}</h2><p>${esc(item.text)}</p>${item.url?`<p class="author"><a href="${item.url}" target="_blank" rel="noopener" style="color:var(--wiki)">Ganzer Artikel ↗</a></p>`:""}`;
  } else if(cat === "aktpolitik"){
    const kicker = item.offline ? `Aktuelle Politik (gerade nicht erreichbar)` : `<span class="live-dot"></span>Aktuelle Politik${dateLabel?" · "+esc(dateLabel):""}`;
    card.innerHTML = `<div class="kicker" style="color:var(--aktuell)">${kicker}</div><h2>${esc(item.title.replace(/ …$/,""))}</h2><p>${esc(item.text)}</p><p class="author"><a href="https://de.wikipedia.org/wiki/Aktuelle_Ereignisse" target="_blank" rel="noopener" style="color:var(--aktuell)">Mehr aktuelle Meldungen ↗</a></p>`;
  } else if(cat === "raetsel"){
    card.innerHTML = `<div class="kicker" style="color:var(--raetsel)">Rätsel</div><h2>${esc(item.title)}</h2><p>${esc(item.text)}</p>
      <button class="reveal-btn" id="revealBtn">Lösung anzeigen</button>
      <div class="solution-box" id="solutionBox">${esc(item.solution)}</div>`;
    setTimeout(()=>{
      const rb = document.getElementById("revealBtn");
      if(rb) rb.addEventListener("click", (e)=>{
        e.stopPropagation();
        document.getElementById("solutionBox").classList.add("show");
        rb.style.display = "none";
      });
    }, 0);
  } else {
    const color = CATS[cat].color;
    card.innerHTML = `<div class="kicker" style="color:var(--${color})">${esc(CATS[cat].label)}</div><h2>${esc(item.title)}</h2><p>${esc(item.text)}</p>`;
  }
}

async function fetchWikiRandom(){
  try{
    const res = await fetch("https://de.wikipedia.org/api/rest_v1/page/random/summary");
    if(!res.ok) throw new Error("offline");
    const j = await res.json();
    return { id:"wiki-"+(j.pageid||Date.now()), title: j.title, text: j.extract || "Kein Auszug verfügbar.", url: j.content_urls && j.content_urls.desktop ? j.content_urls.desktop.page : null };
  }catch(e){
    const pool = DATA.wissen;
    const f = pool[Math.floor(Math.random()*pool.length)];
    return { id:f.id, title: f.title + " (offline)", text: f.text, url:null };
  }
}

/* ---------- Aktuelle Politik (live, letzte Meldungen von Wikipedias "Aktuelle Ereignisse") ---------- */
let AKT_CACHE = { ts:0, items:[], date:"" };
async function loadAktuellePolitik(){
  if(Date.now() - AKT_CACHE.ts < 15*60*1000 && AKT_CACHE.items.length) return AKT_CACHE;
  const base = "https://de.wikipedia.org/w/api.php?format=json&formatversion=2&origin=*&action=parse&page=Aktuelle_Ereignisse";
  const secRes = await fetch(base + "&prop=sections");
  const secJson = await secRes.json();
  const sections = (secJson.parse && secJson.parse.sections) || [];
  const politikSec = sections.find(s => /politik/i.test(s.line));
  if(!politikSec) throw new Error("Politik-Abschnitt nicht gefunden");
  let dateLabel = "";
  const idx = sections.indexOf(politikSec);
  for(let i=idx-1; i>=0; i--){
    if(Number(sections[i].toclevel) < Number(politikSec.toclevel)){ dateLabel = sections[i].line; break; }
  }
  const textRes = await fetch(base + "&prop=text&section=" + encodeURIComponent(politikSec.index));
  const textJson = await textRes.json();
  const html = (textJson.parse && textJson.parse.text) || "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  const lis = Array.from(doc.querySelectorAll("li"));
  const items = lis.map((li,i)=>{
    const t = li.textContent.replace(/\[\d+\]/g,"").replace(/\s+/g," ").trim();
    if(!t || t.length < 15) return null;
    const words = t.split(" ");
    const title = words.slice(0,8).join(" ") + (words.length>8 ? " …" : "");
    return { id:"akt-"+i, title, text:t };
  }).filter(Boolean).slice(0,14);
  if(!items.length) throw new Error("Keine Meldungen gefunden");
  AKT_CACHE = { ts: Date.now(), items, date: dateLabel };
  return AKT_CACHE;
}

function endFeed(){
  document.getElementById("feedOverlay").classList.remove("active");
  if(feedState && feedState.timerId){ clearInterval(feedState.timerId); }
  if(!feedState || !feedState.viewed.length){ feedState=null; return; }
  const minutes = Math.max(1, Math.round((Date.now()-feedState.start)/60000));
  const tk = todayKey();
  if(!STATE.sessions[tk]) STATE.sessions[tk] = { count:0, minutes:0, items:[] };
  STATE.sessions[tk].count += feedState.viewed.length;
  STATE.sessions[tk].minutes += minutes;
  STATE.sessions[tk].items.push(...feedState.viewed);
  saveState();
  feedState = null;
  renderAblenken();
}

/* ==================== WISSEN-SCREEN ==================== */
let wissenFilter = "alle";
let wissenAktCache = null;
let wissenSearch = "";
function renderWissen(){
  const el = document.getElementById("screen-wissen");
  const cats = ["alle","zitate","wissen","alltag","politik","raetsel","aktpolitik","favoriten"];
  const labelFor = c => c==="alle" ? "Alle" : c==="favoriten" ? "Gemerkt ⭐" : CATS[c].label;
  el.innerHTML = `
    <div class="top"><div><h1>Wissen</h1><p>Zum Stöbern, nicht nur zufällig.</p></div></div>
    <input type="text" class="search-field" id="wissenSearch" placeholder="Suchen …" value="${esc(wissenSearch)}">
    <div class="chips scroll-row" id="wissenChips">
      ${cats.map(c=>`<button class="chip ${wissenFilter===c?'on':''}" data-cat="${c}">${labelFor(c)}</button>`).join("")}
    </div>
    <div id="wissenList"></div>
  `;
  document.getElementById("wissenChips").addEventListener("click", e=>{
    const chip = e.target.closest(".chip"); if(!chip) return;
    wissenFilter = chip.dataset.cat;
    renderWissen();
  });
  const searchInput = document.getElementById("wissenSearch");
  searchInput.addEventListener("input", e=>{
    wissenSearch = e.target.value;
    paintCurrentWissenList();
  });
  paintCurrentWissenList();
}

function matchesSearch(hay){
  if(!wissenSearch.trim()) return true;
  return hay.toLowerCase().includes(wissenSearch.trim().toLowerCase());
}

function paintCurrentWissenList(){
  const list = document.getElementById("wissenList");
  if(!list) return;

  if(wissenFilter === "aktpolitik"){ return renderWissenAktuell(list); }

  if(wissenFilter === "favoriten"){
    const items = STATE.favorites.filter(f => matchesSearch((f.title||"")+" "+(f.text||"")+" "+(f.author||"")));
    list.innerHTML = items.length ? items.map(f=>`
      <div class="know-item" data-favid="${f.cat}:${f.id}">
        <span class="badge ${CATS[f.cat] ? CATS[f.cat].color : 'zitate'}">${CATS[f.cat] ? CATS[f.cat].label : f.cat}</span>
        <h3>${esc(f.title || '„'+f.text+'"')}</h3><p>${esc(f.title ? f.text : '— '+(f.author||''))}</p>
      </div>`).join("") : `<p class="muted">Noch nichts gemerkt. Tipp im Ablenken-Modus oder hier auf ♡, um Impulse zu sammeln.</p>`;
    list.addEventListener("click", e=>{
      const it = e.target.closest(".know-item"); if(!it) return;
      const [cat,id] = it.dataset.favid.split(":");
      const f = STATE.favorites.find(x=>x.cat===cat && x.id===id);
      if(f) openItemSheet(cat, f, true);
    });
    return;
  }

  const cats2 = wissenFilter==="alle" ? ["zitate","wissen","alltag","politik","raetsel"] : [wissenFilter];
  let html = "";
  cats2.forEach(cat=>{
    DATA[cat].forEach(item=>{
      const title = item.title || `„${item.text}"`;
      const text = item.title ? item.text : ("— " + item.author);
      if(!matchesSearch(title+" "+text)) return;
      html += `<div class="know-item" data-cat="${cat}" data-id="${item.id}">
        <span class="badge ${CATS[cat].color}">${CATS[cat].label}</span>
        <h3>${esc(title)}</h3><p>${esc(text)}</p>
      </div>`;
    });
  });
  list.innerHTML = html || `<p class="muted">Keine Treffer.</p>`;
  list.addEventListener("click", e=>{
    const it = e.target.closest(".know-item"); if(!it) return;
    const cat = it.dataset.cat, id = it.dataset.id;
    const item = DATA[cat].find(x=>x.id===id);
    openItemSheet(cat, item);
  });
}

async function renderWissenAktuell(list){
  if(wissenAktCache){
    return paintWissenAktuell(list, wissenAktCache);
  }
  list.innerHTML = `<p class="muted"><span class="live-dot"></span> Lade aktuelle Meldungen …</p>`;
  try{
    const res = await loadAktuellePolitik();
    wissenAktCache = res;
    paintWissenAktuell(list, res);
  }catch(e){
    list.innerHTML = `<p class="muted">Aktuelle Meldungen gerade nicht erreichbar - bist du online? <span onclick="wissenAktCache=null;renderWissen()" style="color:var(--aktuell);cursor:pointer">Erneut versuchen ›</span></p>`;
  }
}
function paintWissenAktuell(list, res){
  const items = res.items.filter(item => matchesSearch(item.title+" "+item.text));
  list.innerHTML = `<p class="tiny" style="margin-bottom:10px"><span class="live-dot"></span> Live von Wikipedia „Aktuelle Ereignisse"${res.date?" · "+esc(res.date):""}</p>` +
    (items.length ? items.map(item=>`<div class="know-item" data-id="${item.id}">
      <span class="badge aktpolitik"><span class="live-dot"></span>Aktuelle Politik</span>
      <h3>${esc(item.title.replace(/ …$/,""))}</h3><p>${esc(item.text)}</p>
    </div>`).join("") : `<p class="muted">Keine Treffer.</p>`);
  list.addEventListener("click", e=>{
    const it = e.target.closest(".know-item"); if(!it) return;
    const item = res.items.find(x=>x.id===it.dataset.id);
    if(item) openItemSheet("aktpolitik", item);
  });
}

function openItemSheet(cat, item, isFav){
  const title = item.title || "Zitat";
  const text = item.title ? item.text : `„${item.text}"`;
  const sub = item.title ? "" : `<p class="tiny" style="margin-top:8px">— ${esc(item.author)}</p>`;
  const solution = item.solution ? `
    <button class="reveal-btn" id="sheetRevealBtn">Lösung anzeigen</button>
    <div class="solution-box" id="sheetSolutionBox">${esc(item.solution)}</div>` : "";
  const fav = isFavorited(cat, item.id);
  openSheet(`
    <span class="badge ${CATS[cat] ? CATS[cat].color : 'zitate'}">${CATS[cat] ? CATS[cat].label : cat}</span>
    <h2 style="margin-top:10px">${esc(title)}</h2>
    <p class="muted" style="font-size:14px;line-height:1.6">${esc(text)}</p>
    ${sub}
    ${solution}
    <div class="feed-actions" style="margin-top:16px">
      <button class="btn icon-btn ${fav?'on':''}" id="sheetFavBtn">${fav?'♥ Gemerkt':'♡ Merken'}</button>
      <button class="btn icon-btn" id="sheetShareBtn">⇪ Teilen</button>
    </div>
  `);
  const revealBtn = document.getElementById("sheetRevealBtn");
  if(revealBtn) revealBtn.addEventListener("click", ()=>{
    document.getElementById("sheetSolutionBox").classList.add("show");
    revealBtn.style.display = "none";
  });
  document.getElementById("sheetFavBtn").addEventListener("click", (e)=>{
    const nowFav = toggleFavorite(cat, item);
    e.target.textContent = nowFav ? "♥ Gemerkt" : "♡ Merken";
    e.target.classList.toggle("on", nowFav);
    if(wissenFilter==="favoriten") paintCurrentWissenList();
  });
  document.getElementById("sheetShareBtn").addEventListener("click", ()=> shareItem(cat, item, document.getElementById("sheetShareBtn")));
}

/* ==================== QUIZ-SCREEN ==================== */
let quizRun = null;
function bestLabel(catKey){
  const b = STATE.quizStats.best[catKey];
  return b ? `Beste Runde: ${b.score}/${b.total}` : `Noch keine Runde gespielt`;
}
function renderQuizHome(){
  const el = document.getElementById("screen-quiz");
  const cats = ["gemischt","zitate","wissen","alltag","politik"];
  const tk = todayKey();
  const dc = STATE.dailyChallenge;
  const dailyDoneToday = dc.date === tk && dc.done;
  el.innerHTML = `
    <div class="top"><div><h1>Quiz</h1><p>Testen, was hängen geblieben ist.</p></div></div>
    <p class="tiny" style="margin:-4px 0 12px">${leitnerDueCount() ? `<b>${leitnerDueCount()} Fragen</b> sind heute zur Wiederholung fällig – sie kommen zuerst dran.` : "Falsch beantwortete Fragen kommen am nächsten Tag wieder, sichere in immer größeren Abständen."}</p>

    <div class="card">
      <div class="card-h"><h2>Tages-Challenge</h2><span>5 Fragen</span></div>
      ${dailyDoneToday
        ? `<p class="muted">Heute schon gespielt: <b>${dc.score}/5</b>. Morgen gibt's neue Fragen.</p>`
        : `<p class="muted" style="margin-bottom:12px">Ein fester Satz von 5 Fragen, einmal am Tag. Schaffst du 5/5?</p><button class="btn accent block" id="dailyStartBtn">Tages-Challenge starten</button>`}
    </div>

    <div class="card">
      <div class="card-h"><h2>Kategorie wählen</h2></div>
      <div class="chips" id="quizCatChips">
        ${cats.map((c,i)=>`<button class="chip ${i===0?'on':''}" data-cat="${c}">${c==='gemischt'?'Gemischt':CATS[c].label}</button>`).join("")}
      </div>
      <p class="tiny" id="bestLabel" style="margin-bottom:12px">${bestLabel("gemischt")}</p>
      <button class="btn accent block" id="quizStartBtn">Quiz starten</button>
    </div>
    <div id="quizArea"></div>
  `;
  let chosen = "gemischt";
  document.getElementById("quizCatChips").addEventListener("click", e=>{
    const chip = e.target.closest(".chip"); if(!chip) return;
    document.querySelectorAll("#quizCatChips .chip").forEach(c=>c.classList.remove("on"));
    chip.classList.add("on"); chosen = chip.dataset.cat;
    document.getElementById("bestLabel").textContent = bestLabel(chosen);
  });
  document.getElementById("quizStartBtn").addEventListener("click", ()=> startQuiz(chosen));
  const dailyBtn = document.getElementById("dailyStartBtn");
  if(dailyBtn) dailyBtn.addEventListener("click", startDailyChallenge);
}

/* Wiederholung nach dem Leitner-Prinzip: Falsch beantwortete Fragen kommen am nächsten Tag wieder,
   sichere Fragen in wachsenden Abständen (1, 2, 4, 8, 16 Tage). Verteiltes Abfragen ist eine der
   am besten belegten Lernmethoden (Cepeda et al. 2006; Roediger & Karpicke 2006; Dunlosky et al. 2013). */
const LEITNER_DAYS = [0, 1, 2, 4, 8, 16];
function leitnerPick(pool, n){
  const tk = todayKey(), L = STATE.leitner || {};
  const due = shuffle(pool.filter(q => L[q.id] && L[q.id].due <= tk)).sort((a,b) => L[a.id].box - L[b.id].box);
  const fresh = shuffle(pool.filter(q => !L[q.id]));
  const rest = shuffle(pool.filter(q => L[q.id] && L[q.id].due > tk));
  return due.concat(fresh, rest).slice(0, Math.min(n, pool.length));
}
function leitnerAnswer(q, right){
  if(!STATE.leitner) STATE.leitner = {};
  const cur = STATE.leitner[q.id] || { box:0 };
  const box = right ? Math.min(5, (cur.box||0) + 1) : 1;
  const d = new Date(); d.setDate(d.getDate() + LEITNER_DAYS[box]);
  STATE.leitner[q.id] = { box, due: todayKey(d) };
}
function leitnerDueCount(){
  const tk = todayKey(), L = STATE.leitner || {};
  return QUIZ.filter(q => L[q.id] && L[q.id].due <= tk).length;
}
function startQuiz(catKey){
  const pool = catKey==="gemischt" ? QUIZ : QUIZ.filter(q=>q.cat===catKey);
  const questions = leitnerPick(pool, 8);
  quizRun = { questions, idx:0, score:0, catKey, isDaily:false };
  renderQuizQuestion();
}

function startDailyChallenge(){
  const tk = todayKey();
  let ids;
  if(STATE.dailyChallenge.date === tk && STATE.dailyChallenge.ids.length){
    ids = STATE.dailyChallenge.ids;
  } else {
    ids = leitnerPick(QUIZ, 5).map(q=>q.id);
    STATE.dailyChallenge = { date: tk, ids, done:false, score:0 };
    saveState();
  }
  const questions = ids.map(id => QUIZ.find(q=>q.id===id)).filter(Boolean);
  quizRun = { questions, idx:0, score:0, catKey:"gemischt", isDaily:true };
  renderQuizQuestion();
}

function renderQuizQuestion(){
  const area = document.getElementById("quizArea");
  if(!quizRun || quizRun.idx >= quizRun.questions.length){ return renderQuizEnd(); }
  const q = quizRun.questions[quizRun.idx];
  const pct = Math.round((quizRun.idx/quizRun.questions.length)*100);
  area.innerHTML = `
    <div class="quiz-progress"><i style="width:${pct}%"></i></div>
    <p class="tiny" style="margin-bottom:6px">${quizRun.isDaily?"Tages-Challenge · ":""}Frage ${quizRun.idx+1} von ${quizRun.questions.length}</p>
    <div class="card">
      <h2 style="font-size:16px;font-weight:650;margin-bottom:14px">${esc(q.q)}</h2>
      <div id="quizOpts">
        ${q.options.map((o,i)=>`<button class="quiz-opt" data-i="${i}">${esc(o)}</button>`).join("")}
      </div>
      <p class="muted" id="quizExpl" style="display:none;margin-top:10px"></p>
    </div>
  `;
  document.getElementById("quizOpts").addEventListener("click", e=>{
    const btn = e.target.closest(".quiz-opt"); if(!btn) return;
    const i = Number(btn.dataset.i);
    answerQuiz(i, q);
  }, { once:true });
}

function answerQuiz(i, q){
  document.querySelectorAll("#quizOpts .quiz-opt").forEach((b,idx)=>{
    b.disabled = true;
    if(idx===q.correct) b.classList.add("correct");
    else if(idx===i) b.classList.add("wrong");
  });
  if(i===q.correct) quizRun.score++;
  leitnerAnswer(q, i===q.correct);
  document.getElementById("quizExpl").style.display = "block";
  document.getElementById("quizExpl").textContent = q.expl;
  const area = document.getElementById("quizArea");
  const next = document.createElement("button");
  next.className = "btn primary block"; next.style.marginTop = "12px";
  next.textContent = quizRun.idx < quizRun.questions.length-1 ? "Nächste Frage" : "Ergebnis anzeigen";
  next.addEventListener("click", ()=>{ quizRun.idx++; renderQuizQuestion(); });
  area.querySelector(".card").appendChild(next);

  // Lern-Log für Kalender
  const tk = todayKey();
  if(!STATE.sessions[tk]) STATE.sessions[tk] = { count:0, minutes:0, items:[] };
  STATE.sessions[tk].count += 1;
  STATE.sessions[tk].items.push({cat:"quiz", id:q.id, title:"Quiz: "+q.q.slice(0,40)});
  saveState();
}

function renderQuizEnd(){
  const area = document.getElementById("quizArea");
  const total = quizRun.questions.length;
  const score = quizRun.score;

  STATE.quizStats.played++;
  if(score===total) STATE.quizStats.perfect++;
  const prevBest = STATE.quizStats.best[quizRun.catKey];
  if(!prevBest || (score/total) > (prevBest.score/prevBest.total)){
    STATE.quizStats.best[quizRun.catKey] = { score, total };
  }
  if(quizRun.isDaily){
    STATE.dailyChallenge = { date: todayKey(), ids: quizRun.questions.map(q=>q.id), done:true, score };
  }
  saveState();

  area.innerHTML = `
    <div class="card" style="text-align:center">
      <div class="kicker" style="color:var(--zitate);text-transform:uppercase;font-size:11.5px;font-weight:660;margin-bottom:6px">${quizRun.isDaily?"Tages-Challenge":"Ergebnis"}</div>
      <h2 style="font-size:26px;font-weight:700;margin-bottom:4px">${score} / ${total}</h2>
      <p class="muted" style="margin-bottom:14px">${score===total ? "Alles richtig - stark!" : score >= total/2 ? "Solide Runde." : "Nächstes Mal sitzt mehr - dranbleiben."}</p>
      <button class="btn accent block" id="quizAgainBtn">${quizRun.isDaily ? "Zurück" : "Neue Runde"}</button>
    </div>
  `;
  document.getElementById("quizAgainBtn").addEventListener("click", renderQuizHome);
  quizRun = null;
}

/* ==================== KALENDER-SCREEN ==================== */
let calView = new Date();
function renderKalender(){
  const el = document.getElementById("screen-kalender");
  const monthLabel = calView.toLocaleDateString("de-DE", {month:"long", year:"numeric"});
  el.innerHTML = `
    <div class="top"><div><h1>Kalender</h1><p>Wann hast du was gelernt?</p></div></div>
    <div class="card tight" id="weatherCard"></div>
    <div class="card">
      <div class="card-h"><h2>Letzte 7 Tage</h2></div>
      <div class="week-chart" id="weekChart"></div>
    </div>
    <div class="card">
      <div class="cal-nav">
        <button class="nav-btn" id="calPrev">‹</button>
        <b>${monthLabel[0].toUpperCase()+monthLabel.slice(1)}</b>
        <button class="nav-btn" id="calNext">›</button>
      </div>
      <div class="cal-grid" id="calGrid"></div>
    </div>
  `;
  renderWeatherCard();
  buildWeekChart();
  document.getElementById("calPrev").addEventListener("click", ()=>{ calView.setMonth(calView.getMonth()-1); renderKalender(); });
  document.getElementById("calNext").addEventListener("click", ()=>{ calView.setMonth(calView.getMonth()+1); renderKalender(); });
  buildCalGrid();
}

function buildWeekChart(){
  const chart = document.getElementById("weekChart");
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const key = todayKey(d);
    const count = (STATE.sessions[key] && STATE.sessions[key].count) || 0;
    days.push({ label: d.toLocaleDateString("de-DE",{weekday:"short"}).slice(0,2), count });
  }
  const max = Math.max(1, ...days.map(d=>d.count));
  chart.innerHTML = days.map(d=>`
    <div class="week-col">
      <div class="week-bar" style="height:${Math.max(4, (d.count/max)*100)}%" title="${d.count}"></div>
      <div class="week-lab">${d.label}</div>
    </div>
  `).join("");
}

function buildCalGrid(){
  const grid = document.getElementById("calGrid");
  const y = calView.getFullYear(), m = calView.getMonth();
  const first = new Date(y,m,1);
  const startOffset = (first.getDay()+6)%7; // Montag = 0
  const daysInMonth = new Date(y,m+1,0).getDate();
  const dows = ["Mo","Di","Mi","Do","Fr","Sa","So"];
  let html = dows.map(d=>`<div class="cal-dow">${d}</div>`).join("");
  for(let i=0;i<startOffset;i++) html += `<div class="cal-day empty"></div>`;
  const tk = todayKey();
  for(let d=1; d<=daysInMonth; d++){
    const dateObj = new Date(y,m,d);
    const key = todayKey(dateObj);
    const s = STATE.sessions[key];
    const count = s ? s.count : 0;
    let lvl = "";
    if(count>=6) lvl="l3"; else if(count>=3) lvl="l2"; else if(count>=1) lvl="l1";
    html += `<div class="cal-day ${lvl} ${key===tk?'today':''}" data-key="${key}">${d}</div>`;
  }
  grid.innerHTML = html;
  grid.addEventListener("click", e=>{
    const cell = e.target.closest(".cal-day"); if(!cell || cell.classList.contains("empty")) return;
    openDaySheet(cell.dataset.key);
  });
}

function openDaySheet(key){
  const s = STATE.sessions[key] || {count:0, minutes:0, items:[]};
  const dateStr = new Date(key).toLocaleDateString("de-DE",{weekday:"long", day:"numeric", month:"long"});
  const mood = STATE.moods[key] || 0;
  const moods = ["😩","😕","😐","🙂","😄"];
  openSheet(`
    <h2>${dateStr}</h2>
    <p class="muted">${s.count} Impuls${s.count===1?"":"e"} · ${s.minutes||0} Minuten</p>
    <p class="sec-label" style="margin-left:0">Wie warst du drauf?</p>
    <div class="mood-row" id="moodRow">
      ${moods.map((m,i)=>`<button class="mood-btn ${mood===i+1?'on':''}" data-m="${i+1}">${m}</button>`).join("")}
    </div>
    <p class="sec-label" style="margin-left:0">Gelernt</p>
    ${s.items.length ? s.items.map(it=>`<div class="day-item"><span class="badge ${CATS[it.cat]?CATS[it.cat].color:'wissen'}">${CATS[it.cat]?CATS[it.cat].label:'Quiz'}</span> ${esc(it.title)}</div>`).join("") : `<p class="muted">An diesem Tag war nichts gespeichert.</p>`}
  `);
  document.getElementById("moodRow").addEventListener("click", e=>{
    const b = e.target.closest(".mood-btn"); if(!b) return;
    STATE.moods[key] = Number(b.dataset.m); saveState();
    document.querySelectorAll("#moodRow .mood-btn").forEach(x=>x.classList.remove("on"));
    b.classList.add("on");
  });
}

/* ---------- Wetter ---------- */
async function renderWeatherCard(){
  const card = document.getElementById("weatherCard");
  if(!STATE.weather.lat){
    card.innerHTML = `<p class="muted">Kein Standort für Wetter hinterlegt. <span onclick="showScreen('einst')" style="color:var(--zitate);cursor:pointer">In den Einstellungen festlegen ›</span></p>`;
    return;
  }
  card.innerHTML = `<p class="muted">Lade Wetter für ${esc(STATE.weather.city)} …</p>`;
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${STATE.weather.lat}&longitude=${STATE.weather.lon}&current_weather=true`;
    const res = await fetch(url);
    const j = await res.json();
    const cw = j.current_weather;
    const {emoji, label} = weatherCodeInfo(cw.weathercode);
    card.innerHTML = `<div style="display:flex;align-items:center;gap:12px">
      <div style="font-size:30px">${emoji}</div>
      <div><b style="font-size:18px">${Math.round(cw.temperature)}°C</b><div class="tiny">${label} · ${esc(STATE.weather.city)}</div></div>
    </div>`;
  }catch(e){
    card.innerHTML = `<p class="muted">Wetter aktuell nicht verfügbar.</p>`;
  }
}
function weatherCodeInfo(code){
  const map = {
    0:["☀️","Klarer Himmel"],1:["🌤️","Überwiegend klar"],2:["⛅","Teilweise bewölkt"],3:["☁️","Bewölkt"],
    45:["🌫️","Nebel"],48:["🌫️","Nebel"],51:["🌦️","Leichter Nieselregen"],61:["🌧️","Leichter Regen"],
    63:["🌧️","Regen"],65:["🌧️","Starker Regen"],71:["🌨️","Leichter Schneefall"],73:["🌨️","Schneefall"],
    75:["❄️","Starker Schneefall"],80:["🌦️","Schauer"],81:["🌦️","Schauer"],82:["⛈️","Heftige Schauer"],
    95:["⛈️","Gewitter"],96:["⛈️","Gewitter mit Hagel"],99:["⛈️","Gewitter mit Hagel"]
  };
  return map[code] ? {emoji:map[code][0], label:map[code][1]} : {emoji:"🌡️", label:"Unbekannt"};
}

/* ==================== EINSTELLUNGEN-SCREEN ==================== */
function renderEinst(){
  const el = document.getElementById("screen-einst");
  el.innerHTML = `
    <div class="top"><div><h1>Einstellungen</h1><p>Deine Pause nach deinen Wünschen.</p></div></div>

    <p class="sec-label">Kategorien im Ablenken-Feed</p>
    <div class="card tight" id="catRows">
      ${Object.keys(CATS).map(k=>`
        <div class="row">
          <div><div class="label">${CATS[k].label}</div>${k==='wiki'?'<div class="sub">Live von Wikipedia, sonst Offline-Fakten</div>':''}${k==='aktpolitik'?'<div class="sub">Live-Meldungen, braucht Internet</div>':''}</div>
          <label class="switch"><input type="checkbox" data-cat="${k}" ${STATE.catsOn[k]?'checked':''}><span></span></label>
        </div>
      `).join("")}
    </div>

    <p class="sec-label">Erscheinungsbild</p>
    <div class="card tight">
      <div class="row">
        <div class="label">Design</div>
        <div class="seg" id="setSkin">
          <button data-v="standard" class="${STATE.skin!=='navy'?'on':''}">Standard</button>
          <button data-v="navy" class="${STATE.skin==='navy'?'on':''}">Navy</button>
        </div>
      </div>
      <div class="row" id="themeRow" style="${STATE.skin==='navy'?'display:none':''}">
        <div class="label">Helles Design</div>
        <label class="switch"><input type="checkbox" id="themeSwitch" ${STATE.theme==='light'?'checked':''}><span></span></label>
      </div>
      <div class="row" id="navyPanelRow" style="${STATE.skin==='navy'?'':'display:none'};flex-direction:column;align-items:stretch;gap:10px">
        <div class="label">Kachelfarbe (Navy)</div>
        <div class="color-dots" id="setNavyPanel">
          <button data-v="classic" style="background:#1C2541" title="Classic Navy" class="${STATE.navyPanel==='classic'?'on':''}"></button>
          <button data-v="slate" style="background:#1E293B" title="Deep Slate" class="${STATE.navyPanel==='slate'?'on':''}"></button>
          <button data-v="midnight" style="background:#162447" title="Midnight Blue" class="${STATE.navyPanel==='midnight'?'on':''}"></button>
          <button data-v="steel" style="background:#253355" title="Steel Navy" class="${STATE.navyPanel==='steel'?'on':''}"></button>
          <button data-v="charcoal" style="background:#1A2333" title="Navy Charcoal" class="${STATE.navyPanel==='charcoal'?'on':''}"></button>
        </div>
      </div>
    </div>

    <p class="sec-label">Ziel</p>
    <div class="card tight">
      <div class="row">
        <div><div class="label">Tagesziel</div><div class="sub">Impulse pro Tag</div></div>
        <input type="text" inputmode="numeric" class="field" id="goalInput" style="max-width:70px;text-align:center" value="${STATE.dailyGoal}">
      </div>
    </div>

    <p class="sec-label">Standort für Wetter</p>
    <div class="card tight">
      <input type="text" class="field" id="cityInput" placeholder="Stadt eingeben, z.B. Bad Reichenhall" value="${esc(STATE.weather.city||'')}">
      <button class="btn secondary block" id="citySearchBtn" style="margin-top:10px">Standort suchen</button>
      <p class="tiny" id="cityStatus" style="margin-top:8px">${STATE.weather.lat ? "Aktuell: "+esc(STATE.weather.city) : "Noch kein Standort gespeichert."}</p>
    </div>

    <p class="sec-label">Daten</p>
    <div class="card tight">
      <div class="btn-row">
        <button class="btn secondary" id="exportBtn">Exportieren</button>
        <button class="btn secondary" id="importBtn">Importieren</button>
      </div>
      <input type="file" id="importFile" accept="application/json" style="display:none">
      <p class="tiny" id="importStatus" style="margin-top:8px"></p>
      <button class="btn danger block" id="resetBtn" style="margin-top:10px">Zurücksetzen</button>
    </div>

    <div class="card tight">
      <p class="muted">Deine Daten liegen auf diesem Gerät und werden mit der Cloud-Sicherung des Planers zusätzlich gesichert. "Politik & Wirtschaft" sowie Alltagswissen sind kuratierte, allgemeine Erklärstücke - keine Tagesaktualität. "Aktuelle Politik" dagegen lädt live die neuesten Meldungen von Wikipedias laufend gepflegtem Portal „Aktuelle Ereignisse". Genau wie Wetter und der Wikipedia-Zufallsmodus braucht das eine Internetverbindung.</p>
    </div>
  `;

  document.getElementById("goalInput").addEventListener("change", e=>{
    const v = Math.max(1, Math.min(50, parseInt(e.target.value,10) || 5));
    e.target.value = v;
    STATE.dailyGoal = v; saveState();
  });
  document.getElementById("catRows").addEventListener("change", e=>{
    const cb = e.target.closest("input[data-cat]"); if(!cb) return;
    const cat = cb.dataset.cat;
    const onCount = activeCats().length;
    if(!cb.checked && onCount<=1 && STATE.catsOn[cat]){ cb.checked = true; return; }
    STATE.catsOn[cat] = cb.checked; saveState();
  });
  document.getElementById("themeSwitch").addEventListener("change", e=>{
    STATE.theme = e.target.checked ? "light" : "dark";
    applyTheme(); saveState();
  });
  document.getElementById("setSkin").addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    STATE.skin = b.dataset.v; saveState(); applyTheme(); renderEinst();
  });
  document.getElementById("setNavyPanel").addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    STATE.navyPanel = b.dataset.v; saveState(); applyTheme(); renderEinst();
  });
  document.getElementById("citySearchBtn").addEventListener("click", searchCity);
  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("importBtn").addEventListener("click", ()=> document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", importData);
  document.getElementById("resetBtn").addEventListener("click", ()=>{
    openSheet(`
      <h2>Wirklich alles zurücksetzen?</h2>
      <p class="muted">Alle gespeicherten Impulse, dein Kalender und deine Einstellungen werden gelöscht. Das kann nicht rückgängig gemacht werden.</p>
      <div class="btn-row" style="margin-top:16px">
        <button class="btn secondary" id="cancelReset">Abbrechen</button>
        <button class="btn danger" id="confirmReset">Löschen</button>
      </div>
    `);
    document.getElementById("cancelReset").addEventListener("click", closeSheet);
    document.getElementById("confirmReset").addEventListener("click", ()=>{
      localStorage.removeItem(LS_KEY); STATE = defaultState(); saveState();
      closeSheet(); applyTheme(); renderEinst();
    });
  });
}

async function searchCity(){
  const name = document.getElementById("cityInput").value.trim();
  const status = document.getElementById("cityStatus");
  if(!name) return;
  status.textContent = "Suche …";
  try{
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=de`);
    const j = await res.json();
    if(!j.results || !j.results.length){ status.textContent = "Ort nicht gefunden."; return; }
    const r = j.results[0];
    STATE.weather = { city: r.name + (r.admin1?", "+r.admin1:""), lat:r.latitude, lon:r.longitude };
    saveState();
    status.textContent = "Gespeichert: " + STATE.weather.city;
  }catch(e){ status.textContent = "Suche fehlgeschlagen - bist du online?"; }
}

function exportData(){
  const blob = new Blob([JSON.stringify(STATE, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "denkpause-export.json"; a.click();
  URL.revokeObjectURL(url);
}

function importData(e){
  const file = e.target.files[0];
  const status = document.getElementById("importStatus");
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const parsed = JSON.parse(reader.result);
      if(typeof parsed !== "object" || !parsed) throw new Error("ungültig");
      STATE = Object.assign(defaultState(), parsed, {
        catsOn: Object.assign(defaultState().catsOn, parsed.catsOn||{}),
        weather: Object.assign(defaultState().weather, parsed.weather||{}),
        sessions: parsed.sessions || {},
        moods: parsed.moods || {},
        favorites: parsed.favorites || [],
        quizStats: Object.assign(defaultState().quizStats, parsed.quizStats||{}),
        dailyChallenge: Object.assign(defaultState().dailyChallenge, parsed.dailyChallenge||{})
      });
      saveState(); applyTheme();
      status.textContent = "Import erfolgreich.";
      renderEinst();
    }catch(err){
      status.textContent = "Datei konnte nicht gelesen werden - ist es ein Export aus der Pause?";
    }
  };
  reader.readAsText(file);
}

function applyTheme(){
  document.documentElement.setAttribute("data-theme", STATE.theme==="light" ? "light" : "dark");
  if(STATE.skin === "navy"){
    document.documentElement.setAttribute("data-skin", "navy");
    document.documentElement.setAttribute("data-navy-panel", STATE.navyPanel || "classic");
  } else {
    document.documentElement.removeAttribute("data-skin");
    document.documentElement.removeAttribute("data-navy-panel");
  }
}

/* ==================== SHEET (generisch) ==================== */
function openSheet(html){
  document.getElementById("genSheet").innerHTML = `<div class="grabber"></div>` + html;
  document.getElementById("genOverlay").classList.add("active");
  document.getElementById("genSheet").classList.add("active");
}
function closeSheet(){
  document.getElementById("genOverlay").classList.remove("active");
  document.getElementById("genSheet").classList.remove("active");
}
document.getElementById("genOverlay").addEventListener("click", closeSheet);

/* ==================== INIT ==================== */
applyTheme();
renderAblenken();

// Service Worker registrieren (Voraussetzung fuer "App installieren" in Chrome).
// Auf file:// oder in nicht unterstuetzten Browsern einfach ignorieren.
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("../sw.js").catch(() => {});
  });
}
