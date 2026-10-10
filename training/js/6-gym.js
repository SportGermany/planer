/* ============================================================
   GYM-MODUL: Geräte-Krafttraining
   Sechs essenzielle Ganzkörper-Geräte. Jede Übung hat eine exakte,
   ausführliche Erklärung (Maschineneinstellung, Ausführung, Atmung)
   für ein eigenes Info-Overlay. Einheiten sind fest auf Kilogramm
   eingestellt, keine Umschaltmöglichkeit auf Pfund vorgesehen.
   ============================================================ */
(function(root){
"use strict";
var W = root.WK;

var GYM_EXERCISES = [
  {
    id: "brustpresse",
    n: "Brustpresse",
    g: "Brust, vordere Schulter, Trizeps",
    setup: "Stelle die Sitzhöhe so ein, dass sich die Griffe exakt auf Höhe der mittleren Brust (Brustwarzen) befinden.",
    exec: "Schulterblätter aktiv zusammenziehen und fest in das Rückenpolster drücken (Brust raus). Drücke die Griffe kontrolliert nach vorne. Wichtig: Die Ellbogen am Ende nicht komplett durchstrecken, um die Gelenke zu schonen. Führe das Gewicht langsam zurück, bis du eine deutliche Dehnung in der Brust spürst. Das Gewicht darf zwischendurch nicht abgesetzt werden.",
    breath: "Beim Wegdrücken ausatmen, beim Zurückführen einatmen."
  },
  {
    id: "latzug",
    n: "Latzug am Gerät",
    g: "Breiter Rücken, Bizeps",
    setup: "Das Kniepolster so eng einstellen, dass die Oberschenkel fest fixiert sind und der Körper beim Ziehen nicht abhebt.",
    exec: "Greife die Stange etwas breiter als schulterbreit. Lehne den Oberkörper minimal nach hinten. Ziehe die Stange zur oberen Brust (Schlüsselbein). Führe dabei die Ellbogen aktiv nach unten und hinten – stell dir vor, du willst etwas mit den Ellbogen einklemmen. Führe die Stange kontrolliert wieder nach oben, bis die Arme fast (nicht ganz) gestreckt sind.",
    breath: "Beim Herunterziehen ausatmen, beim Hochlassen einatmen."
  },
  {
    id: "beinpresse",
    n: "Beinpresse",
    g: "Oberschenkel, Gesäß",
    setup: "Der Rücken liegt flach am Polster an. Platziere die Füße schulterbreit und mittig auf der Druckplatte. (Füße höher = mehr Gesäß, Füße tiefer = mehr vorderer Oberschenkel).",
    exec: "Löse die Sicherung. Senke das Gewicht langsam und kontrolliert ab, bis die Knie mindestens einen 90-Grad-Winkel bilden. Drücke das Gewicht kraftvoll aus der Ferse (nicht aus den Zehenspitzen!) wieder nach oben. Wichtig: Knie am obersten Punkt niemals ganz durchdrücken, immer leicht gebeugt lassen!",
    breath: "Beim Absenken einatmen, beim Wegdrücken ausatmen."
  },
  {
    id: "beinbeuger",
    n: "Beinbeuger sitzend",
    g: "Rückseite Oberschenkel",
    setup: "Das Rückenpolster so einstellen, dass die Kniegelenke genau auf Höhe der Maschinen-Drehachse liegen. Das Fußpolster sollte knapp oberhalb der Ferse auf der Achillessehne liegen. Das Oberschenkelpolster fest nach unten drücken.",
    exec: "Drücke die Unterschenkel kraftvoll nach unten und hinten, so weit es geht. Halte die maximale Spannung am untersten Punkt für eine Sekunde. Lass das Gewicht danach langsam und kontrolliert wieder hoch.",
    breath: "Beim Beugen (nach unten) ausatmen, beim Nachgeben einatmen."
  },
  {
    id: "schulterpresse",
    n: "Schulterpresse sitzend",
    g: "Schultern, Trizeps",
    setup: "Sitzhöhe so anpassen, dass die Griffe etwa auf Höhe der Schultern oder minimal darunter liegen.",
    exec: "Rücken fest ans Polster drücken, kein extremes Hohlkreuz bilden. Drücke das Gewicht nach oben. Auch hier: Arme am höchsten Punkt nicht komplett durchstrecken. Lass die Griffe langsam herab, bis sie wieder auf Schulterhöhe sind.",
    breath: "Beim Hochdrücken ausatmen, beim Herablassen einatmen."
  },
  {
    id: "rudern",
    n: "Rudern am Kabelzug / Maschine",
    g: "Rückentiefe, Bizeps, Nacken",
    setup: "Setze dich aufrecht hin, Brust fest gegen das Polster (falls vorhanden). Füße stabil abstützen.",
    exec: "Greife den Griff. Ziehe das Gewicht Richtung Bauchnabel. Wichtig: Die Bewegung beginnt, indem du die Schulterblätter nach hinten ziehst! Erst danach beugen sich die Arme. Die Ellbogen eng am Körper vorbeiführen. Am hintersten Punkt kurz die Spannung halten. Danach Arme und Schultern wieder langsam nach vorne gleiten lassen.",
    breath: "Beim Heranziehen ausatmen, beim Nachlassen einatmen."
  },
  {
    id: "bankdruecken_lh",
    n: "Bankdrücken Langhantel",
    g: "Brust, Trizeps, vordere Schulter",
    setup: "Auf der Flachbank liegen, Füße fest auf dem Boden, Griff etwas breiter als schulterbreit.",
    exec: "Die Stange kontrolliert zur unteren Brust absenken, Ellbogen dabei nicht komplett ausklappen. Kraftvoll nach oben drücken, ohne die Arme oben ganz durchzudrücken.",
    breath: "Beim Absenken einatmen, beim Hochdrücken ausatmen."
  },
  {
    id: "bankdruecken_kh",
    n: "Bankdrücken Kurzhantel",
    g: "Brust, Trizeps, vordere Schulter",
    setup: "Auf der Flachbank liegen, in jeder Hand eine Kurzhantel auf Brusthöhe.",
    exec: "Die Hanteln gleichmäßig nach oben drücken, oben fast zusammenführen. Kontrolliert wieder absenken, bis eine Dehnung in der Brust spürbar ist.",
    breath: "Beim Absenken einatmen, beim Drücken ausatmen."
  },
  {
    id: "schraegbank_lh",
    n: "Schrägbankdrücken Langhantel",
    g: "Obere Brust, Schulter, Trizeps",
    setup: "Bank auf 30 bis 45 Grad einstellen, Griff etwas breiter als schulterbreit.",
    exec: "Die Stange zur oberen Brust absenken, dann kontrolliert nach oben drücken. Unteren Rücken nicht übermäßig durchdrücken.",
    breath: "Beim Absenken einatmen, beim Drücken ausatmen."
  },
  {
    id: "schraegbank_kh",
    n: "Schrägbankdrücken Kurzhantel",
    g: "Obere Brust, Schulter, Trizeps",
    setup: "Schrägbank auf 30 bis 45 Grad, Kurzhanteln auf Höhe der oberen Brust.",
    exec: "Hanteln nach oben drücken, dabei leicht nach innen führen. Langsam wieder absenken, bis die Brust gedehnt ist.",
    breath: "Beim Absenken einatmen, beim Drücken ausatmen."
  },
  {
    id: "kh_fliegende",
    n: "Kurzhantel-Fliegende",
    g: "Äußere und untere Brust",
    setup: "Auf der Flachbank liegen, Hanteln über der Brust, Arme leicht gebeugt.",
    exec: "Die Arme in einem großen Bogen seitlich absenken, bis eine deutliche Dehnung in der Brust spürbar ist. Dann die Hanteln in derselben Bogenbewegung wieder zusammenführen.",
    breath: "Beim Öffnen einatmen, beim Zusammenführen ausatmen."
  },
  {
    id: "butterfly",
    n: "Butterfly-Maschine (Pec Deck)",
    g: "Innere und äußere Brust",
    setup: "Sitzhöhe so einstellen, dass die Griffe oder Armpolster auf Schulterhöhe liegen, Rücken fest an der Lehne.",
    exec: "Die Arme kontrolliert vor dem Körper zusammenführen, kurz die Spannung halten. Langsam wieder öffnen, bis eine Dehnung in der Brust spürbar ist.",
    breath: "Beim Zusammenführen ausatmen, beim Öffnen einatmen."
  },
  {
    id: "dips",
    n: "Dips am Barren",
    g: "Untere Brust, Trizeps, vordere Schulter",
    setup: "An den Griffen des Dip-Barrens abstützen, Arme gestreckt, Oberkörper leicht nach vorn geneigt für mehr Brustbeteiligung.",
    exec: "Den Körper langsam absenken, bis die Oberarme etwa parallel zum Boden sind. Kraftvoll nach oben drücken, ohne die Ellbogen oben ganz durchzustrecken.",
    breath: "Beim Absenken einatmen, beim Hochdrücken ausatmen."
  },
  {
    id: "cable_crossover",
    n: "Cable Crossover",
    g: "Innere Brust",
    setup: "Kabelzüge auf Kopfhöhe einstellen, einen Griff in jede Hand, einen Schritt vor die Mitte treten.",
    exec: "Die Arme in einem Bogen vor dem Körper nach unten und zusammenführen. Kontrolliert wieder in die Ausgangsposition zurückführen.",
    breath: "Beim Zusammenführen ausatmen, beim Zurückführen einatmen."
  },
  {
    id: "kreuzheben",
    n: "Kreuzheben",
    g: "Rücken, Gesäß, Beinrückseite",
    setup: "Langhantel liegt vor den Schienbeinen, Füße hüftbreit, Griff schulterbreit außerhalb der Beine.",
    exec: "Mit geradem Rücken und angespanntem Rumpf die Stange nah am Körper nach oben ziehen, bis der Körper aufrecht steht. Kontrolliert wieder absenken, ohne den Rücken zu runden.",
    breath: "Vor dem Hochziehen einatmen und Luft anhalten, oben und beim Absenken ausatmen."
  },
  {
    id: "rudern_lh",
    n: "Langhantelrudern vorgebeugt",
    g: "Rückenbreite und -tiefe, Bizeps",
    setup: "Oberkörper etwa 45 Grad nach vorn geneigt, Langhantel schulterbreit gegriffen, Rücken gerade.",
    exec: "Die Stange zum unteren Bauch ziehen, Ellbogen nah am Körper führen. Kontrolliert wieder absenken, ohne den Rücken zu runden.",
    breath: "Beim Ziehen ausatmen, beim Absenken einatmen."
  },
  {
    id: "rudern_kh_einarmig",
    n: "Kurzhantelrudern einarmig",
    g: "Rückenbreite, Bizeps",
    setup: "Ein Knie und eine Hand auf einer Bank abstützen, mit der freien Hand eine Kurzhantel greifen.",
    exec: "Die Hantel Richtung Hüfte nach oben ziehen, Ellbogen nah am Körper. Kontrolliert wieder absenken, bis der Arm fast gestreckt ist.",
    breath: "Beim Ziehen ausatmen, beim Absenken einatmen."
  },
  {
    id: "tbar",
    n: "T-Bar-Rudern",
    g: "Rückentiefe, Bizeps",
    setup: "Über die T-Bar-Stange beugen, Brust leicht abgestützt, Griff schulterbreit.",
    exec: "Das Gewicht zur Brust ziehen, Schulterblätter aktiv zusammenziehen. Langsam wieder absenken, bis die Arme fast gestreckt sind.",
    breath: "Beim Ziehen ausatmen, beim Absenken einatmen."
  },
  {
    id: "klimmzuege",
    n: "Klimmzüge",
    g: "Breiter Rücken, Bizeps",
    setup: "Stange etwas breiter als schulterbreit greifen, Handflächen nach vorn.",
    exec: "Den Körper nach oben ziehen, bis das Kinn über der Stange ist. Kontrolliert wieder absenken, bis die Arme fast gestreckt sind.",
    breath: "Beim Hochziehen ausatmen, beim Absenken einatmen."
  },
  {
    id: "ruecken_maschine",
    n: "Rückenstrecker-Maschine",
    g: "Unterer Rücken",
    setup: "Hüfte am Polster fixieren, Oberkörper zu Beginn nach vorn gebeugt.",
    exec: "Den Oberkörper kontrolliert nach oben strecken, bis Rumpf und Beine eine Linie bilden, nicht überstrecken. Langsam wieder absenken.",
    breath: "Beim Aufrichten ausatmen, beim Absenken einatmen."
  },
  {
    id: "kabelrudern_eng",
    n: "Enges Kabelrudern sitzend",
    g: "Rückentiefe, Bizeps",
    setup: "Aufrecht sitzen, Füße gegen die Fußstütze, engen Griff am Kabelzug fassen.",
    exec: "Den Griff Richtung Bauchnabel ziehen, Schulterblätter zuerst nach hinten ziehen. Danach die Arme langsam wieder nach vorn gleiten lassen.",
    breath: "Beim Ziehen ausatmen, beim Nachlassen einatmen."
  },
  {
    id: "kabel_pullover",
    n: "Kabelzug-Überkopf (Pullover)",
    g: "Breiter Rücken, Brust",
    setup: "Vor dem hoch eingestellten Kabelzug stehen, Stange mit beiden Händen über dem Kopf greifen.",
    exec: "Die Arme gestreckt in einem Bogen nach unten zur Hüfte ziehen. Kontrolliert wieder nach oben führen, bis eine Dehnung spürbar ist.",
    breath: "Beim Herunterziehen ausatmen, beim Zurückführen einatmen."
  },
  {
    id: "kniebeuge_lh",
    n: "Kniebeuge Langhantel",
    g: "Oberschenkel, Gesäß, Rumpf",
    setup: "Langhantel auf dem oberen Rücken ablegen, Füße schulterbreit, Zehen leicht nach außen.",
    exec: "In die Hocke absenken, bis die Oberschenkel mindestens parallel zum Boden sind, Rücken bleibt gerade. Kraftvoll über die Fersen wieder hochdrücken.",
    breath: "Beim Absenken einatmen, beim Hochdrücken ausatmen."
  },
  {
    id: "kniebeuge_smith",
    n: "Kniebeuge Smith-Maschine",
    g: "Oberschenkel, Gesäß",
    setup: "Unter der geführten Stange positionieren, Füße leicht vor dem Körper aufstellen.",
    exec: "Kontrolliert absenken, bis die Knie etwa 90 Grad erreichen. Über die Fersen wieder nach oben drücken.",
    breath: "Beim Absenken einatmen, beim Hochdrücken ausatmen."
  },
  {
    id: "beinstrecker",
    n: "Beinstrecker",
    g: "Vorderer Oberschenkel",
    setup: "Rückenlehne so einstellen, dass die Kniegelenke auf Höhe der Drehachse liegen, Polster liegt auf dem Schienbein.",
    exec: "Die Unterschenkel kontrolliert nach oben strecken, oben kurz halten. Langsam wieder absenken, ohne das Gewicht fallen zu lassen.",
    breath: "Beim Strecken ausatmen, beim Absenken einatmen."
  },
  {
    id: "ausfallschritt_kh",
    n: "Ausfallschritte mit Kurzhanteln",
    g: "Oberschenkel, Gesäß",
    setup: "Eine Kurzhantel in jeder Hand, aufrechter Stand.",
    exec: "Einen großen Schritt nach vorn setzen und absenken, bis beide Knie etwa 90 Grad erreichen. Über die vordere Ferse zurück in den Stand drücken.",
    breath: "Beim Absenken einatmen, beim Hochdrücken ausatmen."
  },
  {
    id: "wade_stehend",
    n: "Wadenheben stehend (Maschine)",
    g: "Wadenmuskulatur",
    setup: "Schultern unter die Polster stellen, Fußballen auf der Kante der Trittfläche.",
    exec: "So weit wie möglich auf die Fußballen hochdrücken, oben kurz halten. Fersen kontrolliert unter die Trittfläche absenken.",
    breath: "Beim Hochdrücken ausatmen, beim Absenken einatmen."
  },
  {
    id: "wade_sitzend",
    n: "Wadenheben sitzend (Maschine)",
    g: "Wadenmuskulatur (Soleus)",
    setup: "Sitzen, Polster liegt auf den Oberschenkeln knapp über den Knien, Fußballen auf der Trittfläche.",
    exec: "Auf die Fußballen hochdrücken, oben kurz halten. Fersen kontrolliert wieder absenken.",
    breath: "Beim Hochdrücken ausatmen, beim Absenken einatmen."
  },
  {
    id: "hip_abduktion",
    n: "Hüftabduktion (Maschine)",
    g: "Äußere Hüfte, Gesäß",
    setup: "Sitzen, Außenseiten der Oberschenkel liegen an den Polstern an.",
    exec: "Die Beine kontrolliert gegen den Widerstand nach außen drücken. Langsam wieder zusammenführen.",
    breath: "Beim Nach-außen-Drücken ausatmen, beim Zusammenführen einatmen."
  },
  {
    id: "hip_adduktion",
    n: "Hüftadduktion (Maschine)",
    g: "Innenschenkel",
    setup: "Sitzen, Innenseiten der Oberschenkel liegen an den Polstern an, Beine leicht gespreizt.",
    exec: "Die Beine kontrolliert zusammenführen. Langsam wieder gegen den Widerstand öffnen.",
    breath: "Beim Zusammenführen ausatmen, beim Öffnen einatmen."
  },
  {
    id: "hip_thrust",
    n: "Hip Thrust mit Langhantel",
    g: "Gesäß, Beinrückseite",
    setup: "Oberer Rücken an einer Bank abgestützt, Langhantel liegt über der Hüfte, Füße hüftbreit aufgestellt.",
    exec: "Die Hüfte kraftvoll nach oben strecken, bis der Körper eine gerade Linie bildet, oben kurz anspannen. Kontrolliert wieder absenken.",
    breath: "Beim Hochdrücken ausatmen, beim Absenken einatmen."
  },
  {
    id: "bulgarian_split",
    n: "Bulgarian Split Squat mit Kurzhanteln",
    g: "Oberschenkel, Gesäß",
    setup: "Hinteren Fuß erhöht auf einer Bank ablegen, Kurzhanteln in beiden Händen.",
    exec: "Das vordere Bein beugen, bis der hintere Oberschenkel fast parallel zum Boden ist. Über die vordere Ferse wieder hochdrücken.",
    breath: "Beim Absenken einatmen, beim Hochdrücken ausatmen."
  },
  {
    id: "beinpresse_einbeinig",
    n: "Beinpresse einbeinig",
    g: "Oberschenkel, Gesäß",
    setup: "Nur ein Fuß mittig auf der Druckplatte, das andere Bein angewinkelt zur Seite.",
    exec: "Das Gewicht kontrolliert absenken, bis das Knie etwa 90 Grad erreicht. Kraftvoll über die Ferse wieder wegdrücken.",
    breath: "Beim Absenken einatmen, beim Wegdrücken ausatmen."
  },
  {
    id: "rdl",
    n: "Rumänisches Kreuzheben",
    g: "Beinrückseite, Gesäß, unterer Rücken",
    setup: "Langhantel oder Kurzhanteln vor den Oberschenkeln halten, Knie leicht gebeugt.",
    exec: "Die Hüfte mit geradem Rücken nach hinten schieben, das Gewicht nah am Bein entlang absenken, bis eine Dehnung im hinteren Oberschenkel spürbar ist. Über die Hüftstreckung wieder aufrichten.",
    breath: "Beim Absenken einatmen, beim Aufrichten ausatmen."
  },
  {
    id: "schulterdruecken_lh",
    n: "Schulterdrücken Langhantel stehend",
    g: "Schultern, Trizeps",
    setup: "Langhantel auf Schulterhöhe halten, Füße hüftbreit, Rumpf angespannt.",
    exec: "Die Stange nach oben drücken, bis die Arme fast gestreckt sind. Kontrolliert wieder auf Schulterhöhe absenken.",
    breath: "Beim Hochdrücken ausatmen, beim Absenken einatmen."
  },
  {
    id: "seitheben",
    n: "Seitheben Kurzhantel",
    g: "Seitliche Schulter",
    setup: "Aufrechter Stand, Kurzhanteln seitlich am Körper.",
    exec: "Die Arme seitlich bis auf Schulterhöhe anheben, Ellbogen leicht gebeugt. Kontrolliert wieder absenken.",
    breath: "Beim Anheben ausatmen, beim Absenken einatmen."
  },
  {
    id: "frontheben",
    n: "Frontheben Kurzhantel",
    g: "Vordere Schulter",
    setup: "Aufrechter Stand, Kurzhanteln vor den Oberschenkeln.",
    exec: "Einen oder beide Arme nach vorn bis auf Schulterhöhe anheben. Kontrolliert wieder absenken.",
    breath: "Beim Anheben ausatmen, beim Absenken einatmen."
  },
  {
    id: "face_pull",
    n: "Face Pulls am Kabel",
    g: "Hintere Schulter, oberer Rücken",
    setup: "Seil auf Kopfhöhe am Kabelzug einhängen, mit beiden Händen greifen.",
    exec: "Das Seil Richtung Gesicht ziehen, Ellbogen dabei hoch und weit auseinander führen. Kontrolliert wieder nach vorn geben.",
    breath: "Beim Ziehen ausatmen, beim Nachlassen einatmen."
  },
  {
    id: "reverse_butterfly",
    n: "Reverse Butterfly (hintere Schulter)",
    g: "Hintere Schulter, oberer Rücken",
    setup: "An der Butterfly-Maschine umgekehrt sitzen, Griffe vor dem Körper fassen.",
    exec: "Die Arme seitlich nach hinten öffnen, Schulterblätter zusammenziehen. Kontrolliert wieder nach vorn führen.",
    breath: "Beim Öffnen ausatmen, beim Zurückführen einatmen."
  },
  {
    id: "arnold_press",
    n: "Arnold Press",
    g: "Gesamte Schulter",
    setup: "Sitzen, Kurzhanteln vor der Brust, Handflächen zeigen zum Körper.",
    exec: "Beim Hochdrücken die Handflächen nach außen drehen, bis sie oben nach vorn zeigen. Beim Absenken die Drehung umgekehrt ausführen.",
    breath: "Beim Hochdrücken ausatmen, beim Absenken einatmen."
  },
  {
    id: "shrugs",
    n: "Shrugs mit Kurzhanteln",
    g: "Nacken, oberer Trapezmuskel",
    setup: "Aufrechter Stand, Kurzhanteln seitlich am Körper.",
    exec: "Die Schultern gerade nach oben Richtung Ohren ziehen, oben kurz halten. Kontrolliert wieder absenken.",
    breath: "Beim Hochziehen ausatmen, beim Absenken einatmen."
  },
  {
    id: "bizeps_lh",
    n: "Bizeps-Curl Langhantel",
    g: "Bizeps",
    setup: "Aufrechter Stand, Langhantel schulterbreit vor den Oberschenkeln greifen.",
    exec: "Die Stange unter Anspannung nach oben zur Brust beugen, Ellbogen bleiben am Körper. Kontrolliert wieder absenken.",
    breath: "Beim Beugen ausatmen, beim Absenken einatmen."
  },
  {
    id: "bizeps_kh",
    n: "Bizeps-Curl Kurzhantel",
    g: "Bizeps",
    setup: "Aufrechter Stand, Kurzhanteln seitlich am Körper, Handflächen nach vorn.",
    exec: "Die Hanteln abwechselnd oder gleichzeitig zur Schulter beugen. Kontrolliert wieder absenken.",
    breath: "Beim Beugen ausatmen, beim Absenken einatmen."
  },
  {
    id: "hammer_curl",
    n: "Hammer-Curl",
    g: "Bizeps, Unterarm",
    setup: "Aufrechter Stand, Kurzhanteln seitlich am Körper, Handflächen zeigen zueinander.",
    exec: "Die Hanteln in dieser neutralen Handhaltung zur Schulter beugen. Kontrolliert wieder absenken.",
    breath: "Beim Beugen ausatmen, beim Absenken einatmen."
  },
  {
    id: "konzentrationscurl",
    n: "Konzentrationscurl",
    g: "Bizeps",
    setup: "Sitzend, Ellbogen an die Innenseite des Oberschenkels stützen, Kurzhantel hängt gestreckt nach unten.",
    exec: "Die Hantel kontrolliert zur Schulter beugen, ohne den Ellbogen zu bewegen. Langsam wieder absenken.",
    breath: "Beim Beugen ausatmen, beim Absenken einatmen."
  },
  {
    id: "trizeps_kabel",
    n: "Trizepsdrücken am Kabel (Seil)",
    g: "Trizeps",
    setup: "Vor dem hoch eingehängten Kabelzug stehen, Seil mit beiden Händen greifen, Ellbogen am Körper fixiert.",
    exec: "Das Seil nach unten drücken, bis die Arme fast gestreckt sind, am Ende die Hände leicht auseinanderführen. Kontrolliert wieder nach oben führen.",
    breath: "Beim Drücken ausatmen, beim Zurückführen einatmen."
  },
  {
    id: "french_press",
    n: "French Press (Trizeps über Kopf)",
    g: "Trizeps",
    setup: "Sitzend oder stehend, Kurzhantel oder Langhantelstange mit beiden Händen über dem Kopf halten.",
    exec: "Die Hantel hinter den Kopf absenken, nur der Unterarm bewegt sich. Kontrolliert wieder nach oben strecken.",
    breath: "Beim Absenken einatmen, beim Strecken ausatmen."
  },
  {
    id: "trizeps_dips_maschine",
    n: "Trizeps-Dips-Maschine",
    g: "Trizeps, Brust",
    setup: "Sitzen, Griffe seitlich fassen, Oberkörper aufrecht.",
    exec: "Die Griffe nach unten drücken, bis die Arme fast gestreckt sind. Kontrolliert wieder nach oben führen.",
    breath: "Beim Drücken ausatmen, beim Zurückführen einatmen."
  },
  {
    id: "bizeps_maschine",
    n: "Bizeps-Curl-Maschine",
    g: "Bizeps",
    setup: "Oberarme auf dem Polster ablegen, Griffe fassen.",
    exec: "Die Griffe kontrolliert zur Schulter beugen. Langsam wieder absenken, bis die Arme fast gestreckt sind.",
    breath: "Beim Beugen ausatmen, beim Absenken einatmen."
  },
  {
    id: "enges_bankdruecken",
    n: "Enges Bankdrücken (Trizeps)",
    g: "Trizeps, Brust",
    setup: "Auf der Flachbank liegen, Hände enger als schulterbreit an der Stange.",
    exec: "Die Stange zur unteren Brust absenken, Ellbogen nah am Körper führen. Kraftvoll nach oben drücken.",
    breath: "Beim Absenken einatmen, beim Drücken ausatmen."
  },
  {
    id: "bauchpresse_maschine",
    n: "Bauchpresse-Maschine",
    g: "Gerade Bauchmuskulatur",
    setup: "Sitzen, Oberkörper- und Fußpolster einstellen, Rücken an der Lehne.",
    exec: "Den Oberkörper kontrolliert nach vorn unten drücken, Bauch anspannen. Langsam wieder zurückführen.",
    breath: "Beim Nach-vorn-Drücken ausatmen, beim Zurückführen einatmen."
  },
  {
    id: "crunch_kabel",
    n: "Crunches am Kabel (kniend)",
    g: "Gerade Bauchmuskulatur",
    setup: "Vor dem hoch eingehängten Kabelzug knien, Seil hinter dem Kopf halten.",
    exec: "Den Oberkörper rund nach unten Richtung Oberschenkel beugen, Bauch anspannen. Kontrolliert wieder aufrichten.",
    breath: "Beim Beugen ausatmen, beim Aufrichten einatmen."
  },
  {
    id: "hanging_leg_raise",
    n: "Hanging Leg Raise",
    g: "Untere Bauchmuskulatur, Hüftbeuger",
    setup: "An einer Klimmzugstange oder mit Armstützen hängen, Beine gestreckt oder angewinkelt.",
    exec: "Die Beine kontrolliert nach vorn oben anheben, bis sie etwa waagrecht sind. Langsam wieder absenken, ohne zu schwingen.",
    breath: "Beim Anheben ausatmen, beim Absenken einatmen."
  },
  {
    id: "russian_twist_gewicht",
    n: "Russian Twist mit Gewicht",
    g: "Seitliche Bauchmuskulatur",
    setup: "Sitzen, Oberkörper leicht zurückgelehnt, Füße können abheben, eine Scheibe oder Kurzhantel mit beiden Händen halten.",
    exec: "Das Gewicht kontrolliert von einer Seite zur anderen führen, aus dem Rumpf drehen. Bewegung ruhig und kontrolliert halten.",
    breath: "Gleichmäßig durchatmen, nicht die Luft anhalten."
  },
  {
    id: "hyperextension",
    n: "Rückenstrecker (Hyperextension)",
    g: "Unterer Rücken, Gesäß",
    setup: "Hüfte am Polster der Hyperextension-Bank fixieren, Oberkörper zu Beginn nach vorn gebeugt.",
    exec: "Den Oberkörper kontrolliert aufrichten, bis Rumpf und Beine eine Linie bilden. Langsam wieder absenken.",
    breath: "Beim Aufrichten ausatmen, beim Absenken einatmen."
  },
  {
    id: "torso_rotation",
    n: "Rotationsmaschine (Torso Rotation)",
    g: "Seitliche Bauchmuskulatur",
    setup: "Sitzen, Rumpf und Becken fest fixiert, Griffe vor der Brust halten.",
    exec: "Den Oberkörper kontrolliert zur Seite drehen, so weit es angenehm ist. Langsam zurück und zur anderen Seite drehen.",
    breath: "Gleichmäßig durchatmen, beim Drehen leicht ausatmen."
  },
  {
    id: "plank_gewicht",
    n: "Plank mit Zusatzgewicht",
    g: "Gesamter Rumpf",
    setup: "Unterarmstütz einnehmen, eine Hantelscheibe auf den unteren Rücken legen lassen.",
    exec: "Den Körper in einer geraden Linie von Kopf bis Ferse halten, Bauch fest anspannen. Position über die gewählte Zeit halten.",
    breath: "Gleichmäßig weiteratmen, nicht die Luft anhalten."
  },
  {
    id: "kb_swing",
    n: "Kettlebell Swing",
    g: "Gesäß, Beinrückseite, Rumpf",
    setup: "Kettlebell mit beiden Händen vor dem Körper halten, hüftbreiter Stand.",
    exec: "Aus der Hüfte heraus die Kettlebell zwischen den Beinen nach hinten schwingen, dann explosiv die Hüfte nach vorn strecken, Kettlebell schwingt bis Schulterhöhe. Kontrolliert wieder zurückschwingen lassen.",
    breath: "Beim Zurückschwingen einatmen, beim Hüftstoß ausatmen."
  },
  {
    id: "farmers_walk",
    n: "Farmer's Walk",
    g: "Griffkraft, Rumpf, Ganzkörper",
    setup: "In jeder Hand eine schwere Kurzhantel oder Kettlebell nehmen, aufrecht stehen.",
    exec: "Mit aufrechtem Oberkörper und angespanntem Rumpf eine festgelegte Strecke oder Zeit gehen. Schultern dabei nicht hochziehen.",
    breath: "Gleichmäßig durchatmen im Gehrhythmus."
  },
  {
    id: "rudergeraet",
    n: "Rudergerät (Rowing Machine)",
    g: "Rücken, Beine, Ganzkörper",
    setup: "Füße in die Riemen schnallen, Griff mit beiden Händen fassen, Beine angewinkelt.",
    exec: "Zuerst mit den Beinen kraftvoll abdrücken, dann den Oberkörper leicht zurücklehnen und den Griff zum Bauch ziehen. Die Bewegung in umgekehrter Reihenfolge wieder lösen.",
    breath: "Beim Zug ausatmen, beim Zurückgleiten einatmen."
  },
  {
    id: "airdyne",
    n: "Assault Bike / Airdyne",
    g: "Ganzkörper, Ausdauer",
    setup: "Auf dem Sattel Platz nehmen, beide Griffe fassen, Füße auf die Pedale.",
    exec: "Arme und Beine gleichzeitig und gleichmäßig antreiben, Tempo nach gewünschter Intensität wählen.",
    breath: "Gleichmäßig und rhythmisch durchatmen."
  },
  {
    id: "battle_ropes",
    n: "Battle Ropes",
    g: "Schulter, Arme, Rumpf",
    setup: "Ein Seilende in jede Hand nehmen, leichte Kniebeuge-Grundposition einnehmen.",
    exec: "Die Arme abwechselnd oder gleichzeitig kraftvoll auf und ab bewegen, sodass Wellen durchs Seil laufen. Rumpf dabei stabil halten.",
    breath: "Gleichmäßig durchatmen, nicht die Luft anhalten."
  },
  {
    id: "sled_push",
    n: "Sled Push / Pull",
    g: "Beine, Rumpf, Ganzkörper",
    setup: "Hinter dem Schlitten positionieren, Arme gestreckt oder angewinkelt auf den Griffen.",
    exec: "Mit kraftvollen, kurzen Schritten den Schlitten über die festgelegte Strecke schieben oder ziehen, Oberkörper leicht nach vorn geneigt.",
    breath: "Gleichmäßig durchatmen im Schrittrhythmus."
  },
  {
    id: "wood_chop",
    n: "Kabelzug Holzfäller (Wood Chop)",
    g: "Rumpf, seitliche Bauchmuskulatur",
    setup: "Kabelzug hoch einhängen, seitlich dazu stehen, Griff mit beiden Händen fassen.",
    exec: "Den Griff diagonal von oben außen nach unten innen führen, dabei aus der Hüfte drehen. Kontrolliert in die Ausgangsposition zurückführen.",
    breath: "Beim Herunterziehen ausatmen, beim Zurückführen einatmen."
  },
  {
    id: "medizinball_slam",
    n: "Medizinball-Slam",
    g: "Rumpf, Schulter, Ganzkörper",
    setup: "Medizinball mit beiden Händen über den Kopf heben, hüftbreiter Stand.",
    exec: "Den Ball mit voller Kraft auf den Boden werfen, dabei aus der Hüfte und dem Rumpf arbeiten. Den Ball aufheben und die Bewegung wiederholen.",
    breath: "Beim Werfen ausatmen, beim Aufheben einatmen."
  },
  {
    id: "stepup_kh",
    n: "Step-up mit Kurzhanteln",
    g: "Oberschenkel, Gesäß",
    setup: "Kurzhanteln in beiden Händen, vor einer stabilen Erhöhung stehen.",
    exec: "Mit einem Bein ganz auf die Erhöhung steigen und sich hochdrücken, bis man oben steht. Kontrolliert wieder abwärts steigen.",
    breath: "Beim Hochsteigen ausatmen, beim Absteigen einatmen."
  },
  {
    id: "goblet_squat",
    n: "Goblet Squat mit Kettlebell",
    g: "Oberschenkel, Gesäß, Rumpf",
    setup: "Kettlebell mit beiden Händen vor der Brust halten, Füße etwas breiter als hüftbreit.",
    exec: "In die Hocke absenken, Ellbogen zwischen den Knien, Rücken bleibt gerade. Kraftvoll über die Fersen wieder hochdrücken.",
    breath: "Beim Absenken einatmen, beim Hochdrücken ausatmen."
  },
  {
    id: "landmine_press",
    n: "Landmine Press",
    g: "Schulter, Rumpf, Trizeps",
    setup: "Ein Ende der Langhantel in einer Ecke oder Landmine-Halterung fixieren, das freie Ende mit einer Hand vor der Schulter halten.",
    exec: "Die Stange schräg nach oben vorn drücken, bis der Arm fast gestreckt ist. Kontrolliert wieder zur Schulter absenken.",
    breath: "Beim Drücken ausatmen, beim Absenken einatmen."
  },
  {
    id: "cable_overhead_press",
    n: "Cable Face-to-Overhead Press",
    g: "Schulter, Rumpf",
    setup: "Kabelzug tief einhängen, Griff vor dem Gesicht halten, hüftbreiter Stand.",
    exec: "Den Griff von vor dem Gesicht kraftvoll schräg nach oben drücken, bis der Arm fast gestreckt ist. Kontrolliert wieder zum Gesicht zurückführen.",
    breath: "Beim Drücken ausatmen, beim Zurückführen einatmen."
  },
  {
    id: "standing_cable_row",
    n: "Rudern am Kabel stehend",
    g: "Rückentiefe, Bizeps, Rumpf",
    setup: "Kabelzug auf mittlerer Höhe einhängen, hüftbreiter, stabiler Stand.",
    exec: "Den Griff Richtung Rippen ziehen, Schulterblätter zuerst zusammenziehen. Kontrolliert wieder nach vorn führen.",
    breath: "Beim Ziehen ausatmen, beim Nachlassen einatmen."
  },
];

function gymExerciseById(id){
  for (var i = 0; i < GYM_EXERCISES.length; i++) if (GYM_EXERCISES[i].id === id) return GYM_EXERCISES[i];
  return null;
}

root.GYM_EXERCISES = GYM_EXERCISES;
root.gymExerciseById = gymExerciseById;
W.GYM_EXERCISES = GYM_EXERCISES;
W.gymExerciseById = gymExerciseById;
if (typeof module !== "undefined" && module.exports) module.exports = {GYM_EXERCISES:GYM_EXERCISES, gymExerciseById:gymExerciseById};

})(typeof globalThis !== "undefined" ? globalThis : this);
