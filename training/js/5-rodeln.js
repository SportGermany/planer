/* ============================================================
   RODELN VORBEREITEN – dynamisches Aufwärm- & Mobilitätsprogramm
   Fokus auf rennrodel-relevante Muskeln: Rumpf/Core (die Beine
   liegen die ganze Fahrt erhöht, der Rumpf hält und steuert),
   Beine/Hüfte/Fuß (Drucksteuerung über die Kufen, explosiver
   Start-Abstoß), Schulter/Arme (Zug an den Startgriffen, kurze
   kraftvolle Eisstöße) und Nacken (Kopfkontrolle unter den
   Fliehkräften in Rückenlage). Alle Übungen sind Bewegung, keine
   Halteposition, und laufen frei im Raum – das Handy kann
   währenddessen einfach am Boden liegen.
   phase: "warm" (10-Minuten-Ganzkörperblock) oder "mobil"
   (5-Minuten-Block mit Fokus Fuß/Hüfte/Arme/Kopf) – beide werden
   im Player gemischt, nicht nacheinander in Blöcken abgespielt.
   pos = exakte Ausgangsposition, aus = exakte Ausführung.
   ============================================================ */
(function(root){
"use strict";
var W = root.WK;

var RODELN_CAT = {
  rumpf: "Rumpf & Core", bein: "Beine", huefte: "Hüfte",
  arm: "Schulter & Arme", nacken: "Nacken & Kopf", fuss: "Fuß & Sprunggelenk",
  ganz: "Ganzkörper"
};

var RODELN = [
/* ---------------- RUMPF & CORE, dynamisch (18) – warm ---------------- */
{id:4001,g:"rumpf",phase:"warm",n:"Rumpfrotation im Stand",m:"reps",v:20,
 pos:"Hüftbreiter Stand, Arme vor der Brust angewinkelt, Ellbogen zeigen zur Seite.",
 aus:"Rumpf zügig nach rechts drehen, dabei die Hüfte fast ruhig lassen, dann zurück zur Mitte und nach links drehen. Kopf dreht sanft mit, Blick folgt den Ellbogen."},
{id:4002,g:"rumpf",phase:"warm",n:"Seitliche Rumpfneigung gehend",m:"reps",v:16,
 pos:"Hüftbreiter Stand, Arme locker seitlich am Körper.",
 aus:"Rechten Arm über den Kopf strecken und den Oberkörper dabei zügig nach links neigen, linke Hand gleitet am Oberschenkel Richtung Knie. Zurück zur Mitte, Seite wechseln."},
{id:4003,g:"rumpf",phase:"warm",n:"Bear Crawl vorwärts",m:"time",v:35,
 pos:"Vierfüßlerstand, Knie schweben zwei Zentimeter über dem Boden, Rücken flach.",
 aus:"Abwechselnd rechte Hand mit linkem Knie und linke Hand mit rechtem Knie kleine Schritte nach vorn setzen, Hüfte bleibt tief und ruhig. Nach der Zeit umdrehen und zurückkriechen."},
{id:4004,g:"rumpf",phase:"warm",n:"Mountain Climber locker",m:"time",v:30,
 pos:"Handstütz, Arme unter den Schultern, Körper eine gerade Linie.",
 aus:"Abwechselnd ein Knie zügig, aber kontrolliert Richtung Brust ziehen und wieder zurückstrecken, Hüfte bleibt auf gleicher Höhe. Blick bleibt zum Boden, Nacken lang."},
{id:4005,g:"rumpf",phase:"warm",n:"Plank Walk-out",m:"reps",v:10,
 pos:"Hüftbreiter Stand, Beine gestreckt, Oberkörper leicht vorgebeugt.",
 aus:"Mit den Händen langsam nach vorn laufen bis zum Handstütz, kurz die gerade Körperlinie spüren, dann die Hände wieder zurück zu den Füßen laufen und aufrichten."},
{id:4006,g:"rumpf",phase:"warm",n:"Superman dynamisch",m:"reps",v:16,
 pos:"Bauchlage, Arme nach vorn gestreckt, Beine lang, Stirn knapp über dem Boden.",
 aus:"Gleichzeitig Arme, Brust und gestreckte Beine einige Zentimeter vom Boden abheben, kurz die Spannung halten, dann kontrolliert zurück auf den Boden sinken lassen."},
{id:4007,g:"rumpf",phase:"warm",n:"Liegender Beinüberschlag locker",m:"reps",v:12,
 pos:"Rückenlage, Arme seitlich ausgestreckt, Beine senkrecht nach oben gestreckt.",
 aus:"Beide Beine zusammen langsam nach rechts zur Seite absenken, bis kurz vor den Boden, dann durch die Körpermitte zurück nach oben und zur Gegenseite führen."},
{id:4008,g:"rumpf",phase:"warm",n:"Russian Twist im Sitzen",m:"reps",v:24,
 pos:"Sitzend, Oberkörper leicht zurückgelehnt, Knie gebeugt, Fersen am Boden, Hände vor der Brust gefaltet.",
 aus:"Aus dem Rumpf zügig von einer Seite zur anderen drehen, die Hände tippen dabei neben die Hüfte, Rücken bleibt gerade und leicht zurückgelehnt."},
{id:4009,g:"rumpf",phase:"warm",n:"Hollow-Body-Wippen",m:"time",v:25,
 pos:"Rückenlage, unterer Rücken fest auf den Boden gedrückt, Arme über dem Kopf lang, Beine gestreckt leicht angehoben.",
 aus:"In dieser leicht gebogenen Position minimal auf und ab wippen, ohne dass der untere Rücken den Bodenkontakt verliert. Gleichmäßig weiteratmen."},
{id:4010,g:"rumpf",phase:"warm",n:"Beckenheben im Wechsel",m:"reps",v:20,
 pos:"Rückenlage, Knie aufgestellt, Füße hüftbreit, Arme flach neben dem Körper.",
 aus:"Becken zügig anheben bis Schultern, Hüfte und Knie eine Linie bilden, oben kurz halten, dann kontrolliert absenken, ohne den Boden ganz zu berühren, sofort wiederholen."},
{id:4011,g:"rumpf",phase:"warm",n:"Seitstütz-Hüftpumpen rechts",m:"reps",v:14,
 pos:"Seitstütz auf dem rechten Unterarm, Füße übereinander, Körper eine gerade Linie.",
 aus:"Hüfte zügig einige Zentimeter Richtung Boden absenken und wieder anheben, ohne den Boden zu berühren. Der obere Arm zeigt zur Decke."},
{id:4012,g:"rumpf",phase:"warm",n:"Seitstütz-Hüftpumpen links",m:"reps",v:14,
 pos:"Seitstütz auf dem linken Unterarm, Füße übereinander, Körper eine gerade Linie.",
 aus:"Hüfte zügig einige Zentimeter Richtung Boden absenken und wieder anheben, ohne den Boden zu berühren. Der obere Arm zeigt zur Decke."},
{id:4013,g:"rumpf",phase:"warm",n:"Toe Reach dynamisch",m:"reps",v:16,
 pos:"Rückenlage, Beine senkrecht nach oben gestreckt, Arme neben dem Körper.",
 aus:"Oberkörper zügig anheben und mit beiden Händen Richtung Zehenspitzen greifen, dabei kurz die Schulterblätter vom Boden lösen, dann kontrolliert zurücklegen."},
{id:4014,g:"rumpf",phase:"warm",n:"Liegestütz-Schulterklopfen",m:"reps",v:16,
 pos:"Hoher Handstütz, Füße etwas breiter als hüftbreit für mehr Stand, Rücken gerade.",
 aus:"Abwechselnd eine Hand vom Boden lösen und die gegenüberliegende Schulter antippen, Hüfte bleibt dabei so ruhig wie möglich, kein Wackeln nach links oder rechts."},
{id:4015,g:"rumpf",phase:"warm",n:"Liegender Scherenschlag Rumpf",m:"time",v:30,
 pos:"Rückenlage, Hände unter dem Gesäß, Beine gestreckt leicht angehoben.",
 aus:"Beine im Wechsel klein und zügig auf und ab bewegen wie eine Schere, unterer Rücken bleibt die ganze Zeit am Boden."},
{id:4016,g:"rumpf",phase:"warm",n:"Vierfüßler-Diagonalheben",m:"reps",v:16,
 pos:"Vierfüßlerstand, Rücken flach, Blick zum Boden.",
 aus:"Rechten Arm nach vorn und linkes Bein nach hinten strecken, kurz halten, dann zügig unter dem Körper zusammenführen bis Ellbogen und Knie sich fast berühren. Seite wechseln."},
{id:4017,g:"rumpf",phase:"warm",n:"Sit-up mit Rotation",m:"reps",v:14,
 pos:"Rückenlage, Knie aufgestellt, Hände leicht an den Schläfen.",
 aus:"Zügig hochrollen und dabei den rechten Ellbogen Richtung linkes Knie drehen, zurück ablegen, beim nächsten Mal die andere Seite ansteuern."},
{id:4018,g:"rumpf",phase:"warm",n:"Plank-Jack",m:"reps",v:20,
 pos:"Unterarmstütz, Ellbogen unter den Schultern, Beine geschlossen und gestreckt.",
 aus:"Beide Füße gleichzeitig springend nach außen setzen und wieder zusammenspringen, Oberkörper und Hüfte bleiben dabei ruhig und stabil."},

/* ---------------- BEINE, dynamisch (26) – warm ---------------- */
{id:4019,g:"bein",phase:"warm",n:"Beinschwingen vorwärts-rückwärts rechts",m:"reps",v:14,
 pos:"Stand auf dem linken Bein, rechte Hand hält sich leicht an einer Wand oder Stuhllehne fest.",
 aus:"Rechtes Bein locker und mit wachsender Amplitude nach vorn und hinten schwingen, Oberkörper bleibt aufrecht, Becken dreht kaum mit."},
{id:4020,g:"bein",phase:"warm",n:"Beinschwingen vorwärts-rückwärts links",m:"reps",v:14,
 pos:"Stand auf dem rechten Bein, linke Hand hält sich leicht an einer Wand oder Stuhllehne fest.",
 aus:"Linkes Bein locker und mit wachsender Amplitude nach vorn und hinten schwingen, Oberkörper bleibt aufrecht, Becken dreht kaum mit."},
{id:4021,g:"bein",phase:"warm",n:"Seitliches Beinschwingen rechts",m:"reps",v:14,
 pos:"Stand auf dem linken Bein, rechte Hand stützt sich leicht ab, Blick nach vorn.",
 aus:"Rechtes Bein gestreckt seitlich vor dem Körper nach links und wieder nach rechts schwingen, Oberkörper bleibt gerade, Bewegung kommt aus der Hüfte."},
{id:4022,g:"bein",phase:"warm",n:"Seitliches Beinschwingen links",m:"reps",v:14,
 pos:"Stand auf dem rechten Bein, linke Hand stützt sich leicht ab, Blick nach vorn.",
 aus:"Linkes Bein gestreckt seitlich vor dem Körper nach rechts und wieder nach links schwingen, Oberkörper bleibt gerade, Bewegung kommt aus der Hüfte."},
{id:4023,g:"bein",phase:"warm",n:"Ausfallschritt gehend vorwärts",m:"time",v:35,
 pos:"Hüftbreiter Stand am Anfang des freien Raums.",
 aus:"Großen Schritt nach vorn setzen, hinteres Knie sinkt Richtung Boden ohne ihn zu berühren, dann aufstehen und mit dem anderen Bein den nächsten Ausfallschritt nach vorn setzen. So durch den Raum wandern."},
{id:4024,g:"bein",phase:"warm",n:"Rückwärtiger Ausfallschritt im Wechsel",m:"reps",v:16,
 pos:"Hüftbreiter Stand, Hände in die Hüften gestützt.",
 aus:"Mit dem rechten Bein einen großen Schritt nach hinten setzen, Knie sinkt Richtung Boden, dann zügig zurück in den Stand und mit dem linken Bein wiederholen."},
{id:4025,g:"bein",phase:"warm",n:"Seitlicher Ausfallschritt im Wechsel",m:"reps",v:16,
 pos:"Breiter Stand, Füße etwas mehr als hüftbreit, Zehen zeigen leicht nach außen.",
 aus:"Gewicht zügig auf das rechte Bein verlagern, in die Hocke gehen, linkes Bein bleibt gestreckt zur Seite, dann zurück zur Mitte und zur Gegenseite wechseln."},
{id:4026,g:"bein",phase:"warm",n:"Kniehebelauf auf der Stelle",m:"time",v:30,
 pos:"Hüftbreiter Stand, Arme locker angewinkelt wie beim Laufen.",
 aus:"Im lockeren Tempo abwechselnd die Knie bis auf Hüfthöhe anheben, Arme schwingen im Laufrhythmus mit, Fußaufsatz bleibt leise und weich."},
{id:4027,g:"bein",phase:"warm",n:"Fersenheben im Gehen",m:"time",v:30,
 pos:"Start am Anfang des freien Raums, aufrechter Stand.",
 aus:"Kleine Schritte nach vorn gehen, dabei bei jedem Schritt bewusst hoch auf den Fußballen abrollen, bevor der nächste Fuß aufsetzt."},
{id:4028,g:"bein",phase:"warm",n:"Kniebeuge im Tempo",m:"reps",v:20,
 pos:"Hüftbreiter bis schulterbreiter Stand, Arme locker vor der Brust.",
 aus:"Zügig in die Hocke gehen, Fersen bleiben am Boden, Knie zeigen über die Fußspitzen, dann kraftvoll wieder aufrichten, ohne oben ganz durchzuhängen."},
{id:4029,g:"bein",phase:"warm",n:"Sumo-Kniebeuge mit Pulsen",m:"time",v:30,
 pos:"Breiter Stand, Fußspitzen zeigen nach außen, Hände vor der Brust gefaltet.",
 aus:"In die tiefe Hocke gehen und dort in kleinen, zügigen Bewegungen auf und ab pulsieren, Rücken bleibt lang und aufrecht."},
{id:4030,g:"bein",phase:"warm",n:"Step-up auf niedrige Stufe rechts",m:"reps",v:12,
 pos:"Stand vor einer stabilen Stufe oder einem festen Tritt, rechter Fuß steht bereits oben.",
 aus:"Über das rechte Bein hochdrücken bis der Körper oben gestreckt steht, dann kontrolliert wieder mit demselben Bein zurücktreten."},
{id:4031,g:"bein",phase:"warm",n:"Step-up auf niedrige Stufe links",m:"reps",v:12,
 pos:"Stand vor einer stabilen Stufe oder einem festen Tritt, linker Fuß steht bereits oben.",
 aus:"Über das linke Bein hochdrücken bis der Körper oben gestreckt steht, dann kontrolliert wieder mit demselben Bein zurücktreten."},
{id:4032,g:"bein",phase:"warm",n:"Innenschenkel-Pendel rechts",m:"reps",v:14,
 pos:"Seitliche Stützhaltung an einer Wand mit der rechten Hand, Körper leicht zur Wand gedreht.",
 aus:"Linkes Bein leicht vor das rechte kreuzen, dann seitlich wegschwingen und wieder zurückkreuzen, Bewegung bleibt zügig und kontrolliert."},
{id:4033,g:"bein",phase:"warm",n:"Innenschenkel-Pendel links",m:"reps",v:14,
 pos:"Seitliche Stützhaltung an einer Wand mit der linken Hand, Körper leicht zur Wand gedreht.",
 aus:"Rechtes Bein leicht vor das linke kreuzen, dann seitlich wegschwingen und wieder zurückkreuzen, Bewegung bleibt zügig und kontrolliert."},
{id:4034,g:"bein",phase:"warm",n:"Curtsy Lunge im Wechsel",m:"reps",v:16,
 pos:"Hüftbreiter Stand, Hände in die Hüften gestützt.",
 aus:"Mit dem rechten Bein diagonal hinter das linke Bein kreuzen, in die Hocke sinken, dann zurück in den Stand und mit dem linken Bein die Gegenseite ausführen."},
{id:4035,g:"bein",phase:"warm",n:"Hamstring-Kick vorwärts",m:"reps",v:16,
 pos:"Hüftbreiter Stand, Arme locker seitlich.",
 aus:"Beim Gehen die Ferse zügig Richtung Gesäß hochschnellen lassen, kurz antippen, dann wieder absetzen und mit dem anderen Bein fortsetzen, dabei stetig vorwärtsbewegen."},
{id:4036,g:"bein",phase:"warm",n:"Skater-Sprung locker",m:"reps",v:14,
 pos:"Stand auf dem rechten Bein, leicht in die Knie gegangen.",
 aus:"Mit einem seitlichen Sprung aufs linke Bein wechseln, rechtes Bein schwingt locker hinter das linke, dann zurück zur anderen Seite springen. Landung immer weich in den Knien abfedern."},
{id:4037,g:"bein",phase:"warm",n:"Wadenheben im Stand zügig",m:"reps",v:24,
 pos:"Hüftbreiter Stand, Hände locker in der Hüfte oder leicht abgestützt.",
 aus:"Zügig auf die Fußballen hochdrücken, oben kurz halten, dann kontrolliert die Fersen wieder absenken, sofort das nächste Mal hochdrücken."},
{id:4038,g:"bein",phase:"warm",n:"Ausfallschritt mit Rotation",m:"reps",v:14,
 pos:"Hüftbreiter Stand, Hände vor der Brust gefaltet.",
 aus:"Großen Schritt nach vorn ins Ausfallschritt-Knie, dabei den Oberkörper zur Seite des vorderen Beins drehen, zurück zur Mitte drehen, aufstehen und die Seite wechseln."},
{id:4039,g:"bein",phase:"warm",n:"Frog Jump locker",m:"reps",v:10,
 pos:"Tiefe Hocke, Hände zwischen den Füßen leicht auf dem Boden.",
 aus:"Aus der Hocke einen kleinen Sprung nach vorn machen, weich mit erneuter Hocke landen, kurz stabilisieren, dann den nächsten Sprung ausführen."},
{id:4040,g:"bein",phase:"warm",n:"Adduktoren-Ausfallschritt seitlich gehend",m:"time",v:30,
 pos:"Breiter Stand am Anfang des freien Raums.",
 aus:"Großen Schritt zur Seite setzen, in die Hocke über das seitliche Bein sinken, anderes Bein bleibt gestreckt, dann das gestreckte Bein heranziehen und den nächsten Seitschritt setzen. So seitlich durch den Raum wandern."},
{id:4041,g:"bein",phase:"warm",n:"Ausfallschritt-Pulsen",m:"time",v:25,
 pos:"Tiefer Ausfallschritt, rechtes Bein vorn, hinteres Knie knapp über dem Boden.",
 aus:"In dieser Position mehrmals klein und zügig auf und ab pulsieren, Oberkörper bleibt aufrecht, dann Seite wechseln und mit dem linken Bein vorn wiederholen."},
{id:4042,g:"bein",phase:"warm",n:"Beinkreisen im Liegen rechts",m:"reps",v:10,
 pos:"Rückenlage, Arme seitlich ausgestreckt, rechtes Bein senkrecht nach oben gestreckt.",
 aus:"Mit dem gestreckten rechten Bein große, zügige Kreise in die Luft zeichnen, fünf in jede Richtung, das Becken bleibt möglichst ruhig am Boden."},
{id:4043,g:"bein",phase:"warm",n:"Beinkreisen im Liegen links",m:"reps",v:10,
 pos:"Rückenlage, Arme seitlich ausgestreckt, linkes Bein senkrecht nach oben gestreckt.",
 aus:"Mit dem gestreckten linken Bein große, zügige Kreise in die Luft zeichnen, fünf in jede Richtung, das Becken bleibt möglichst ruhig am Boden."},
{id:4044,g:"bein",phase:"warm",n:"Squat-to-Stand mit Armschwung",m:"reps",v:14,
 pos:"Hüftbreiter Stand, Arme hängen locker.",
 aus:"In die tiefe Hocke sinken und dabei die Arme nach hinten schwingen, dann kraftvoll aufrichten und die Arme nach vorn oben schwingen lassen wie beim Absprung."},

/* ---------------- HÜFTE, dynamisch (14) – mobil ---------------- */
{id:4045,g:"huefte",phase:"mobil",n:"Hüftkreisen im Stand groß",m:"reps",v:10,
 pos:"Hüftbreiter Stand, Hände auf dem Becken.",
 aus:"Becken in großen, langsamen Kreisen bewegen, fünf Kreise im Uhrzeigersinn, Oberkörper bleibt möglichst ruhig, nur die Hüfte kreist."},
{id:4046,g:"huefte",phase:"mobil",n:"Hüftkreisen Gegenrichtung",m:"reps",v:10,
 pos:"Hüftbreiter Stand, Hände auf dem Becken.",
 aus:"Becken in großen, langsamen Kreisen gegen den Uhrzeigersinn bewegen, fünf Kreise, Knie bleiben leicht weich."},
{id:4047,g:"huefte",phase:"mobil",n:"Hüftpendel seitlich im Stand",m:"time",v:25,
 pos:"Hüftbreiter Stand, Hände locker in der Hüfte.",
 aus:"Becken zügig von einer Seite zur anderen schieben, Oberkörper bleibt aufrecht und ruhig, nur das Becken pendelt seitlich."},
{id:4048,g:"huefte",phase:"mobil",n:"90-90-Hüftwechsel",m:"reps",v:10,
 pos:"Sitzend auf dem Boden, beide Knie im rechten Winkel angewinkelt, ein Bein vorn, eines seitlich abgewinkelt.",
 aus:"Beide Knie zügig zur anderen Seite kippen lassen, sodass die Beinstellung spiegelverkehrt wird, Hände stützen leicht hinter dem Körper."},
{id:4049,g:"huefte",phase:"mobil",n:"Beckenkippen dynamisch",m:"reps",v:16,
 pos:"Hüftbreiter Stand, Knie leicht gebeugt, Hände auf dem unteren Rücken.",
 aus:"Becken abwechselnd nach vorn kippen, sodass sich der untere Rücken rundet, dann nach hinten kippen, sodass sich ein leichtes Hohlkreuz bildet."},
{id:4050,g:"huefte",phase:"mobil",n:"Hüftöffner im Vierfüßler rechts",m:"reps",v:12,
 pos:"Vierfüßlerstand, Rücken flach, rechtes Knie angewinkelt.",
 aus:"Rechtes Knie seitlich nach außen und oben anheben wie bei einem Hund am Hydranten, dann kontrolliert zurückführen, ohne dass sich der Rücken mitdreht."},
{id:4051,g:"huefte",phase:"mobil",n:"Hüftöffner im Vierfüßler links",m:"reps",v:12,
 pos:"Vierfüßlerstand, Rücken flach, linkes Knie angewinkelt.",
 aus:"Linkes Knie seitlich nach außen und oben anheben wie bei einem Hund am Hydranten, dann kontrolliert zurückführen, ohne dass sich der Rücken mitdreht."},
{id:4052,g:"huefte",phase:"mobil",n:"Hüftbeuger-Pendel im Ausfallschritt",m:"time",v:30,
 pos:"Tiefer Ausfallschritt, rechtes Bein vorn, Hände locker auf dem vorderen Oberschenkel.",
 aus:"Das Becken sanft und zügig nach vorn schieben und wieder zurücknehmen, die Dehnung im hinteren Hüftbeuger dabei bewusst spüren, dann Seite wechseln."},
{id:4053,g:"huefte",phase:"mobil",n:"Liegende Knie-Rotation",m:"reps",v:14,
 pos:"Rückenlage, Knie angewinkelt und zusammen, Füße flach auf dem Boden, Arme seitlich ausgestreckt.",
 aus:"Beide Knie zügig, aber kontrolliert nach rechts zum Boden absenken, kurz antippen, dann durch die Mitte zur linken Seite führen."},
{id:4054,g:"huefte",phase:"mobil",n:"Stehende Hüftrotation",m:"reps",v:12,
 pos:"Stand auf dem linken Bein, rechtes Knie angehoben auf Hüfthöhe.",
 aus:"Das angehobene rechte Knie nach außen öffnen und wieder nach innen schließen, wie ein kleines Scheibenwischen in der Luft, dann Bein wechseln."},
{id:4055,g:"huefte",phase:"mobil",n:"Hüftschaukeln im Vierfüßler",m:"time",v:25,
 pos:"Vierfüßlerstand, Hände unter den Schultern, Knie unter der Hüfte.",
 aus:"Das Gesäß rhythmisch Richtung Fersen zurückschieben und wieder nach vorn in die Ausgangsposition schaukeln, Bewegung bleibt fließend."},
{id:4056,g:"huefte",phase:"mobil",n:"Cossack-Wechsel dynamisch",m:"reps",v:12,
 pos:"Sehr breiter Stand, Fußspitzen leicht nach außen.",
 aus:"Gewicht zügig auf die rechte Seite verlagern und tief in die Hocke sinken, linkes Bein bleibt gestreckt, dann durch die Mitte zur linken Seite wechseln."},
{id:4057,g:"huefte",phase:"mobil",n:"Liegendes Beinöffnen und -schließen",m:"reps",v:16,
 pos:"Seitlage, Beine übereinander leicht angewinkelt, Kopf auf dem unteren Arm abgelegt.",
 aus:"Das obere Knie wie eine Muschel nach oben öffnen, Fersen bleiben zusammen, dann wieder schließen. Nach der Hälfte die Seite wechseln."},
{id:4058,g:"huefte",phase:"mobil",n:"Stehender Hüftkreis mit angehobenem Knie",m:"reps",v:10,
 pos:"Stand auf dem linken Bein, rechtes Knie auf Hüfthöhe angehoben.",
 aus:"Mit dem angehobenen Knie einen großen Kreis in die Luft zeichnen, erst nach außen, dann nach innen, danach das Bein wechseln."},

/* ---------------- SCHULTER & ARME, dynamisch (24) ---------------- */
{id:4059,g:"arm",phase:"mobil",n:"Armkreisen groß vorwärts",m:"time",v:25,
 pos:"Hüftbreiter Stand, Arme seitlich waagrecht ausgestreckt.",
 aus:"Große, langsame Kreise nach vorn ziehen, die Bewegung kommt aus der ganzen Schulter, nicht nur dem Handgelenk."},
{id:4060,g:"arm",phase:"mobil",n:"Armkreisen groß rückwärts",m:"time",v:25,
 pos:"Hüftbreiter Stand, Arme seitlich waagrecht ausgestreckt.",
 aus:"Große, langsame Kreise nach hinten ziehen, Brustkorb bleibt dabei offen, Schultern sinken weg von den Ohren."},
{id:4061,g:"arm",phase:"warm",n:"Armkreisen klein schnell vorwärts",m:"time",v:20,
 pos:"Hüftbreiter Stand, Arme seitlich waagrecht ausgestreckt.",
 aus:"Kleine, schnelle Kreise nach vorn ziehen, Arme bleiben die ganze Zeit auf Schulterhöhe gestreckt."},
{id:4062,g:"arm",phase:"warm",n:"Armkreisen klein schnell rückwärts",m:"time",v:20,
 pos:"Hüftbreiter Stand, Arme seitlich waagrecht ausgestreckt.",
 aus:"Kleine, schnelle Kreise nach hinten ziehen, Arme bleiben die ganze Zeit auf Schulterhöhe gestreckt."},
{id:4063,g:"arm",phase:"warm",n:"Wechselseitiges Armschwingen",m:"time",v:30,
 pos:"Hüftbreiter Stand, leichte Kniebeugung, Arme hängen locker vor dem Körper.",
 aus:"Abwechselnd einen Arm kraftvoll nach vorn oben und den anderen nach hinten schwingen wie beim Skilanglauf, Beine federn im Rhythmus mit."},
{id:4064,g:"arm",phase:"warm",n:"Boxschläge gerade",m:"time",v:30,
 pos:"Leichter Kampfstand, Fäuste vor dem Kinn, Knie weich.",
 aus:"Abwechselnd rechte und linke Faust zügig nach vorn schlagen und zurückziehen, die Hüfte dreht dabei leicht mit, Fäuste kehren sofort zur Deckung zurück."},
{id:4065,g:"arm",phase:"warm",n:"Boxschläge Aufwärtshaken",m:"time",v:25,
 pos:"Leichter Kampfstand, Fäuste vor dem Kinn, Knie weich.",
 aus:"Abwechselnd mit einer Faust einen Aufwärtshaken andeuten, dabei leicht in die Knie gehen und die Hüfte mitdrehen, dann zurück in die Deckung."},
{id:4066,g:"arm",phase:"mobil",n:"Schulterkreisen vorwärts",m:"time",v:20,
 pos:"Hüftbreiter Stand, Fingerspitzen berühren die Schultern.",
 aus:"Die Ellbogen in großen, langsamen Kreisen nach vorn führen, Schulterblätter bewegen sich dabei bewusst mit."},
{id:4067,g:"arm",phase:"mobil",n:"Schulterkreisen rückwärts",m:"time",v:20,
 pos:"Hüftbreiter Stand, Fingerspitzen berühren die Schultern.",
 aus:"Die Ellbogen in großen, langsamen Kreisen nach hinten führen, Brust öffnet sich dabei bewusst nach vorn."},
{id:4068,g:"arm",phase:"mobil",n:"Armscheren horizontal",m:"time",v:25,
 pos:"Hüftbreiter Stand, Arme seitlich waagrecht ausgestreckt, Handflächen nach oben.",
 aus:"Beide Arme zügig vor der Brust kreuzen und wieder öffnen, im Wechsel liegt einmal der rechte, einmal der linke Arm oben."},
{id:4069,g:"arm",phase:"mobil",n:"Armscheren vertikal",m:"time",v:25,
 pos:"Hüftbreiter Stand, ein Arm oben, einer unten, beide gestreckt.",
 aus:"Beide Arme senkrecht aneinander vorbeiführen, oberer Arm sinkt, unterer steigt, zügiger fließender Wechsel."},
{id:4070,g:"arm",phase:"warm",n:"Paddelzug im Stand",m:"time",v:30,
 pos:"Hüftbreiter Stand, leichte Vorlage des Oberkörpers, Arme vor dem Körper wie beim Kanufahren.",
 aus:"Abwechselnd einen Arm kraftvoll nach hinten ziehen, als würde ein Paddel durchs Wasser gezogen, der andere Arm führt gleichzeitig nach vorn."},
{id:4071,g:"arm",phase:"warm",n:"Startgriff-Zugsimulation",m:"time",v:30,
 pos:"Hüftbreiter Stand, Oberkörper leicht zurückgelehnt, beide Fäuste auf Brusthöhe wie an Startgriffen.",
 aus:"Beide Arme schnell und kraftvoll nach hinten unten reißen, als würde man sich an Griffen abstoßen, dann zügig wieder nach vorn oben führen und wiederholen."},
{id:4072,g:"arm",phase:"warm",n:"Liegestütz-Wippen dynamisch",m:"time",v:25,
 pos:"Hoher Handstütz, Arme leicht gebeugt, Körper eine gerade Linie.",
 aus:"In den Armen leicht auf und ab wippen, ohne die Ellbogen ganz durchzustrecken oder den Boden zu berühren, Rumpf bleibt fest."},
{id:4073,g:"arm",phase:"warm",n:"Wand-Push-off dynamisch",m:"reps",v:14,
 pos:"Beide Hände schulterbreit an einer Wand, Körper leicht schräg nach vorn geneigt.",
 aus:"Die Arme beugen, bis sich die Brust der Wand nähert, dann kraftvoll abdrücken, bis die Arme wieder gestreckt sind."},
{id:4074,g:"arm",phase:"mobil",n:"Schulterblätter-Zusammenziehen dynamisch",m:"reps",v:16,
 pos:"Hüftbreiter Stand, Arme seitlich im rechten Winkel angehoben, Handflächen nach vorn.",
 aus:"Die Schulterblätter zügig zusammenziehen, sodass sich die Ellbogen leicht nach hinten bewegen, dann wieder lösen und sofort wiederholen."},
{id:4075,g:"arm",phase:"warm",n:"Armkreisen im Ausfallschritt",m:"time",v:25,
 pos:"Tiefer Ausfallschritt, rechtes Bein vorn, Arme seitlich ausgestreckt.",
 aus:"In der Ausfallschritt-Position die Arme in kleinen, zügigen Kreisen bewegen, nach der Hälfte der Zeit die Beine wechseln."},
{id:4076,g:"arm",phase:"mobil",n:"Trizeps-Pump im Stand",m:"reps",v:16,
 pos:"Hüftbreiter Stand, beide Arme über dem Kopf gestreckt.",
 aus:"Die Unterarme zügig hinter den Kopf beugen und wieder ganz nach oben strecken, Oberarme bleiben dabei möglichst nah am Kopf."},
{id:4077,g:"arm",phase:"mobil",n:"Handgelenkskreisen mit Armstreckung",m:"time",v:20,
 pos:"Hüftbreiter Stand, beide Arme vor dem Körper gestreckt, Fäuste locker geballt.",
 aus:"Beide Handgelenke gleichzeitig in zügigen Kreisen bewegen, zehn Kreise in eine Richtung, dann zehn in die andere."},
{id:4078,g:"arm",phase:"warm",n:"Faustöffnen im Armschwingen",m:"time",v:20,
 pos:"Hüftbreiter Stand, Arme locker seitlich am Körper.",
 aus:"Beide Arme leicht nach vorn und zurück schwingen und dabei im Rhythmus die Fäuste weit öffnen und wieder fest schließen."},
{id:4079,g:"arm",phase:"warm",n:"Diagonales Armschwingen",m:"time",v:25,
 pos:"Hüftbreiter Stand, rechter Arm über der linken Schulter, wie zum Axtschwung angesetzt.",
 aus:"Den rechten Arm diagonal von der linken Schulter nach rechts unten schwingen lassen wie bei einem Holzhieb, Hüfte dreht leicht mit, dann Seite wechseln."},
{id:4080,g:"arm",phase:"warm",n:"Armzug rückwärts im Ausfallschritt",m:"reps",v:14,
 pos:"Tiefer Ausfallschritt, rechtes Bein vorn, Oberkörper leicht vorgeneigt, Arme vor dem Körper gestreckt.",
 aus:"Beide Ellbogen kraftvoll nach hinten ziehen, Schulterblätter zusammenführen, dann Arme wieder nach vorn strecken. Nach der Hälfte Bein und Rhythmus wechseln."},
{id:4081,g:"arm",phase:"mobil",n:"Seitliches Armheben dynamisch",m:"reps",v:18,
 pos:"Hüftbreiter Stand, Arme locker seitlich am Körper.",
 aus:"Beide Arme zügig seitlich bis Schulterhöhe anheben, kurz oben halten, dann kontrolliert wieder absenken, sofort wiederholen."},
{id:4082,g:"arm",phase:"warm",n:"Kreuzheben-Armschwung",m:"reps",v:16,
 pos:"Hüftbreiter Stand, Arme seitlich ausgestreckt auf Schulterhöhe.",
 aus:"Beide Arme vor dem Körper zügig kreuzen, sodass sich die Hände fast berühren, dann wieder weit nach außen öffnen."},

/* ---------------- NACKEN & KOPF, dynamisch (14) – mobil ---------------- */
{id:4083,g:"nacken",phase:"mobil",n:"Nackenrollen sanft dynamisch",m:"time",v:25,
 pos:"Aufrechter Sitz oder Stand, Schultern entspannt.",
 aus:"Den Kopf langsam von einer Schulter zur Brust und zur anderen Schulter rollen, immer im vorderen Halbkreis, niemals in den Nacken hinein."},
{id:4084,g:"nacken",phase:"mobil",n:"Kopf-Neige-Wechsel seitlich",m:"reps",v:14,
 pos:"Aufrechter Sitz oder Stand, Blick geradeaus.",
 aus:"Den Kopf zügig, aber kontrolliert zur rechten Schulter neigen, kurz halten, dann zur Mitte zurück und zur linken Schulter neigen."},
{id:4085,g:"nacken",phase:"mobil",n:"Kopf-Rotation im Wechsel",m:"reps",v:14,
 pos:"Aufrechter Sitz oder Stand, Kinn leicht parallel zum Boden.",
 aus:"Den Kopf zügig so weit wie angenehm möglich nach rechts drehen, zurück zur Mitte, dann nach links drehen, Bewegung bleibt fließend."},
{id:4086,g:"nacken",phase:"mobil",n:"Kinn-Zieh-Wiederholung",m:"reps",v:14,
 pos:"Aufrechter Sitz oder Stand, Blick geradeaus.",
 aus:"Das Kinn gerade nach hinten Richtung Hals ziehen, als würde man ein Doppelkinn formen, kurz halten, dann wieder lösen."},
{id:4087,g:"nacken",phase:"mobil",n:"Blickführung mit Kopf-Rotation",m:"time",v:25,
 pos:"Aufrechter Sitz oder Stand, ein Punkt geradeaus fixiert.",
 aus:"Den Kopf langsam nach rechts drehen, während der Blick möglichst lange auf dem Fixpunkt bleibt, dann zurück zur Mitte und zur linken Seite wiederholen."},
{id:4088,g:"nacken",phase:"mobil",n:"Nacken-Achter",m:"time",v:25,
 pos:"Aufrechter Sitz oder Stand, Schultern entspannt.",
 aus:"Mit der Nase eine liegende Acht in die Luft zeichnen, die Bewegung bleibt klein und ruhig, der Blick folgt der Nase."},
{id:4089,g:"nacken",phase:"mobil",n:"Kopf-Nick-Wiederholung",m:"reps",v:16,
 pos:"Aufrechter Sitz oder Stand, Blick geradeaus.",
 aus:"Das Kinn zügig Richtung Brust senken, dann den Kopf wieder aufrichten bis der Blick geradeaus geht, nicht in den Nacken überstrecken."},
{id:4090,g:"nacken",phase:"mobil",n:"Schulter-Ohr-Wechsel",m:"reps",v:14,
 pos:"Aufrechter Stand, Arme hängen locker.",
 aus:"Die rechte Schulter zügig Richtung Ohr hochziehen, wieder absenken, dann die linke Schulter hochziehen, Kopf bleibt dabei gerade."},
{id:4091,g:"nacken",phase:"mobil",n:"Nacken-Seitneige im Gehen",m:"time",v:25,
 pos:"Aufrechter Stand, bereit für kleine Schritte auf der Stelle.",
 aus:"Locker auf der Stelle gehen und dabei den Kopf im Wechsel sanft zu einer Schulter und dann zur anderen neigen, Schultern bleiben entspannt."},
{id:4092,g:"nacken",phase:"mobil",n:"Kopfkreisen sehr sanft groß",m:"reps",v:6,
 pos:"Aufrechter Sitz oder Stand, Schultern entspannt.",
 aus:"Den Kopf in einem großen, sehr langsamen Halbkreis von einer Schulter über die Brust zur anderen Schulter führen und zurück, nie ganz in den Nacken."},
{id:4093,g:"nacken",phase:"mobil",n:"Diagonale Kopfneigung im Wechsel",m:"reps",v:14,
 pos:"Aufrechter Sitz oder Stand, Blick geradeaus.",
 aus:"Die Nase zügig Richtung rechte Achsel senken, zurück zur Mitte, dann Richtung linke Achsel senken, Bewegung bleibt klein und kontrolliert."},
{id:4094,g:"nacken",phase:"mobil",n:"Nackenstrecker-Pump",m:"reps",v:16,
 pos:"Aufrechter Sitz oder Stand, Hand locker am Hinterkopf.",
 aus:"Den Kopf leicht gegen die Hand nach hinten drücken und sofort wieder lösen, Druck bleibt sanft und die Bewegung ist klein."},
{id:4095,g:"nacken",phase:"mobil",n:"Blick-Fixierung mit Kopfschwenk",m:"time",v:20,
 pos:"Aufrechter Sitz oder Stand, ein Finger auf Augenhöhe vor dem Gesicht.",
 aus:"Den Finger fixieren und den Kopf langsam nach rechts und links schwenken, ohne den Blick vom Finger zu lösen."},
{id:4096,g:"nacken",phase:"mobil",n:"Kinnkreisen leicht",m:"reps",v:10,
 pos:"Aufrechter Sitz oder Stand, Mund leicht geschlossen.",
 aus:"Mit dem Kinn kleine, sanfte Kreise in die Luft zeichnen, fünf in jede Richtung, Bewegung bleibt minimal und locker."},

/* ---------------- FUSS & SPRUNGGELENK, dynamisch (12) – mobil ---------------- */
{id:4097,g:"fuss",phase:"mobil",n:"Fußkreisen im Sitzen rechts",m:"reps",v:10,
 pos:"Sitzend, rechtes Bein leicht angehoben, Fuß frei in der Luft.",
 aus:"Mit dem rechten Fuß große, langsame Kreise zeichnen, fünf im Uhrzeigersinn, fünf gegen den Uhrzeigersinn, nur das Sprunggelenk bewegt sich."},
{id:4098,g:"fuss",phase:"mobil",n:"Fußkreisen im Sitzen links",m:"reps",v:10,
 pos:"Sitzend, linkes Bein leicht angehoben, Fuß frei in der Luft.",
 aus:"Mit dem linken Fuß große, langsame Kreise zeichnen, fünf im Uhrzeigersinn, fünf gegen den Uhrzeigersinn, nur das Sprunggelenk bewegt sich."},
{id:4099,g:"fuss",phase:"mobil",n:"Zehenspitzen-Fersen-Wippen",m:"time",v:25,
 pos:"Hüftbreiter Stand, Hände locker in der Hüfte.",
 aus:"Zügig auf die Zehenspitzen hochkommen, dann auf die Fersen zurückkippen, sodass die Zehen leicht abheben, ein fließender Wechsel."},
{id:4100,g:"fuss",phase:"mobil",n:"Seitliches Fußabrollen gehend",m:"time",v:25,
 pos:"Hüftbreiter Stand am Anfang des freien Raums.",
 aus:"Kleine Schritte seitlich setzen und dabei bewusst über die Außenkante und dann über die Innenkante des Fußes abrollen."},
{id:4101,g:"fuss",phase:"mobil",n:"Sprunggelenk-Pump im Stand",m:"reps",v:20,
 pos:"Hüftbreiter Stand, ein Bein leicht vorgestellt, Ferse am Boden, Zehen zeigen nach oben.",
 aus:"Die Fußspitze des vorderen Fußes zügig nach oben ziehen und wieder absenken, das Sprunggelenk pumpt dabei kräftig, dann Seite wechseln."},
{id:4102,g:"fuss",phase:"mobil",n:"Zehenheben im Stand",m:"reps",v:18,
 pos:"Hüftbreiter Stand, Gewicht gleichmäßig auf beiden Füßen.",
 aus:"Beide Fußspitzen zügig vom Boden abheben, nur auf den Fersen stehen bleiben, kurz halten, dann die Zehen wieder absetzen."},
{id:4103,g:"fuss",phase:"mobil",n:"Fußgelenk-Wippen im Ausfallschritt",m:"time",v:25,
 pos:"Leichter Ausfallschritt, hinterer Fuß mit dem Ballen aufgesetzt, Ferse zeigt nach oben.",
 aus:"Die hintere Ferse zügig Richtung Boden drücken und wieder anheben, das vordere Bein bleibt stabil, dann die Seite wechseln."},
{id:4104,g:"fuss",phase:"mobil",n:"Ballengang auf der Stelle",m:"time",v:25,
 pos:"Hüftbreiter Stand, beide Fersen leicht angehoben.",
 aus:"Auf den Fußballen kleine, zügige Schritte auf der Stelle machen, die Fersen bleiben die ganze Zeit oben, Arme schwingen locker mit."},
{id:4105,g:"fuss",phase:"mobil",n:"Fersengang auf der Stelle",m:"time",v:25,
 pos:"Hüftbreiter Stand, beide Zehen leicht angehoben.",
 aus:"Auf den Fersen kleine, zügige Schritte auf der Stelle machen, die Zehen bleiben die ganze Zeit oben, Schienbeine spüren die Arbeit."},
{id:4106,g:"fuss",phase:"mobil",n:"Seitliches Fußkanten-Wippen",m:"time",v:20,
 pos:"Hüftbreiter Stand, Gewicht gleichmäßig verteilt.",
 aus:"Das Gewicht zügig auf die Außenkanten beider Füße verlagern, kurz halten, dann auf die Innenkanten kippen, immer sanft und kontrolliert."},
{id:4107,g:"fuss",phase:"mobil",n:"Fußspitzen-Antippen im Wechsel",m:"time",v:25,
 pos:"Hüftbreiter Stand, leichtes Körpergewicht auf dem Standbein.",
 aus:"Mit der freien Fußspitze abwechselnd vorn, seitlich und hinten den Boden antippen, wie eine kleine Uhr um den Standfuß, dann Bein wechseln."},
{id:4108,g:"fuss",phase:"mobil",n:"Sprung-Abfederung leicht",m:"reps",v:12,
 pos:"Hüftbreiter Stand, leichte Kniebeugung.",
 aus:"Ganz leicht abspringen, nur wenige Zentimeter hoch, und weich über den ganzen Fuß abrollend landen, Knie federn die Landung ab."},

/* ---------------- GANZKÖRPER, dynamisch (12) – warm ---------------- */
{id:4109,g:"ganz",phase:"warm",n:"Hampelmann locker",m:"time",v:35,
 pos:"Hüftbreiter Stand, Arme locker seitlich am Körper.",
 aus:"Gleichzeitig die Beine seitlich öffnen und die Arme über den Kopf zusammenführen, dann zurück in die Ausgangsposition springen, lockeres Tempo."},
{id:4110,g:"ganz",phase:"warm",n:"Step-Jack ohne Sprung",m:"time",v:30,
 pos:"Hüftbreiter Stand, Arme locker seitlich am Körper.",
 aus:"Abwechselnd ein Bein zur Seite ausstellen und die Arme dabei über den Kopf führen, ohne zu springen, dann zurück und die andere Seite ausführen."},
{id:4111,g:"ganz",phase:"warm",n:"Marschieren mit großem Armschwung",m:"time",v:30,
 pos:"Hüftbreiter Stand, bereit zum Gehen auf der Stelle.",
 aus:"Auf der Stelle marschieren und dabei die Arme mit großer Amplitude gegengleich zu den Knien mitschwingen lassen."},
{id:4112,g:"ganz",phase:"warm",n:"Skipping locker auf der Stelle",m:"time",v:30,
 pos:"Hüftbreiter Stand, leichte Grundspannung in den Beinen.",
 aus:"Locker auf der Stelle von einem Bein aufs andere hüpfen, Knie kommen dabei leicht nach vorn oben, Armeinsatz wie beim Laufen."},
{id:4113,g:"ganz",phase:"warm",n:"Ganzkörper-Wellenbewegung",m:"reps",v:10,
 pos:"Hüftbreiter Stand, Arme über dem Kopf gestreckt.",
 aus:"Von den Fingerspitzen beginnend eine Welle durch den ganzen Körper laufen lassen: Arme, Brust, Bauch und Hüfte nacheinander leicht nach vorn bewegen, dann wieder aufrichten."},
{id:4114,g:"ganz",phase:"warm",n:"Seitliches Pendellaufen",m:"time",v:30,
 pos:"Hüftbreiter Stand am Anfang des freien Raums.",
 aus:"Mehrere schnelle Seitschritte nach rechts setzen, kurz abstoppen, dann mehrere schnelle Seitschritte nach links, Arme helfen beim Abstoppen mit."},
{id:4115,g:"ganz",phase:"warm",n:"Boxschritt-Kombination",m:"time",v:30,
 pos:"Leichter Kampfstand, Fäuste vor dem Kinn.",
 aus:"Locker auf der Stelle von einem Fuß auf den anderen wippen und dabei im Rhythmus einzelne Schläge nach vorn andeuten."},
{id:4116,g:"ganz",phase:"warm",n:"Lockeres Traben auf der Stelle",m:"time",v:35,
 pos:"Hüftbreiter Stand, Arme locker angewinkelt.",
 aus:"In lockerem Lauftempo auf der Stelle traben, Fußaufsatz bleibt weich und leise, Schultern bleiben entspannt."},
{id:4117,g:"ganz",phase:"warm",n:"Kniehebelauf mit Armzug kombiniert",m:"time",v:30,
 pos:"Hüftbreiter Stand, Arme locker angewinkelt wie beim Laufen.",
 aus:"Die Knie zügig auf Hüfthöhe anheben und gleichzeitig die Arme kraftvoll wie beim Startzug nach hinten reißen, dann wieder nach vorn führen."},
{id:4118,g:"ganz",phase:"warm",n:"Seitgalopp im Raum",m:"time",v:30,
 pos:"Hüftbreiter Stand am Anfang des freien Raums.",
 aus:"Im Seitgalopp durch den Raum bewegen: ein Fuß setzt zur Seite, der andere folgt heran, ohne die Füße zu kreuzen, Arme schwingen locker mit."},
{id:4119,g:"ganz",phase:"warm",n:"Ausfallschritt-Startsimulation",m:"reps",v:10,
 pos:"Tiefer Ausfallschritt, rechtes Bein vorn, Arme wie an Startgriffen vor dem Körper.",
 aus:"Kraftvoll aus dem Ausfallschritt nach vorn drücken, dabei die Arme nach hinten reißen wie beim Rodel-Start, dann zurück in den Ausfallschritt und die Seite wechseln."},
{id:4120,g:"ganz",phase:"warm",n:"Ganzkörper-Ausschütteln dynamisch",m:"time",v:30,
 pos:"Hüftbreiter Stand, Knie leicht gebeugt, Arme locker.",
 aus:"Nacheinander beide Arme, dann beide Beine kräftig ausschütteln, dabei den ganzen Körper leicht in Bewegung halten, zum Abschluss tief durchatmen."}
];

var RODELN_TOTAL_SEC = 900; // 15 Minuten
var RODELN_MOBIL_SEC = 300; // davon 5 Minuten mit Fokus Fuß/Hüfte/Arme/Kopf
var RODELN_WARM_SEC = RODELN_TOTAL_SEC - RODELN_MOBIL_SEC;

function rodelnPool(phase){ return RODELN.filter(function(e){ return e.phase === phase; }); }

/* Deterministisch je Tag gemischte Reihenfolge einer Liste (wie shuffled in core.js) */
function rShuffle(arr, seedStr){
  var a = arr.slice();
  var h = 2166136261;
  for (var i = 0; i < seedStr.length; i++){ h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  var s = (h >>> 0) || 1;
  function rnd(){ s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }
  for (var j = a.length - 1; j > 0; j--){
    var k = Math.floor(rnd() * (j + 1));
    var t = a[j]; a[j] = a[k]; a[k] = t;
  }
  return a;
}

/* Füllt einen Zeitbudget-Topf aus einem Pool, ohne eine Übung zu wiederholen,
   bis das Budget (inklusive kurzer Wechselpause) erreicht ist. */
function fillBudget(pool, seed, budgetSec, transitionSec){
  var order = rShuffle(pool, seed);
  var out = [], used = 0, i = 0;
  while (used < budgetSec && i < order.length){
    var e = order[i++];
    var dur = e.m === "reps" ? Math.max(15, Math.round(e.v * 1.8)) : e.v;
    out.push({ex:e, dur:dur});
    used += dur + transitionSec;
  }
  return out;
}

/* Baut das gemischte 15-Minuten-Programm für ein Datum: 10 Minuten aus dem
   warm-Pool, 5 Minuten aus dem mobil-Pool, danach ineinander verschränkt
   (nicht als zwei Blöcke hintereinander). */
function rodelnProgramForDate(dateStr){
  var idx = W.dayIndex(dateStr || "2026-01-01");
  var warmItems = fillBudget(rodelnPool("warm"), "rodeln-warm#" + idx, RODELN_WARM_SEC, 6);
  var mobilItems = fillBudget(rodelnPool("mobil"), "rodeln-mobil#" + idx, RODELN_MOBIL_SEC, 6);

  // Verschränken im Verhältnis etwa 2 Aufwärm- zu 1 Mobil-Übung, nicht als Blöcke.
  var mixed = [], wi = 0, mi = 0, toggle = 0;
  while (wi < warmItems.length || mi < mobilItems.length){
    if (toggle < 2 && wi < warmItems.length){ mixed.push(warmItems[wi++]); toggle++; }
    else if (mi < mobilItems.length){ mixed.push(mobilItems[mi++]); toggle = 0; }
    else if (wi < warmItems.length){ mixed.push(warmItems[wi++]); }
    else { toggle = 0; }
  }
  return mixed;
}

/* Spielbare Abfolge für den bestehenden Player: eine Übung, danach eine
   kurze Wechselpause, seitenweise Übungen laufen automatisch als zwei
   Blöcke rechts/links hintereinander. */
function buildRodelnSequence(dateStr){
  var items = rodelnProgramForDate(dateStr);
  var seq = [{type:"warmup", name:"Rodeln vorbereiten", cue:"15 Minuten, im Stehen oder am Boden. Leg das Handy einfach neben dich, du hörst Ton und Ansage.", dur:10, round:0}];
  items.forEach(function(it, i){
    var e = it.ex;
    var label = RODELN_CAT[e.g];
    var fullCue = e.pos + " " + e.aus;
    seq.push({
      type:"work", name:e.n, cue:fullCue, dur:it.dur, round:1, mode:e.m,
      reps: e.m === "reps" ? e.v : undefined,
      exIndex:i+1, exTotal:items.length, groupLabel:label, group:e.g, id:e.id
    });
    if (i < items.length - 1){
      seq.push({type:"rest", name:"Wechsel", cue:"Kurz lockern, nächste Übung vorbereiten.", dur:6, round:1});
    }
  });
  seq.push({type:"cooldown", name:"Geschafft", cue:"Rumpf, Beine, Schultern und Nacken sind aufgewärmt und mobilisiert. Gute Fahrt.", dur:10, round:1});
  return seq;
}
function rodelnSequenceDuration(dateStr){
  return W.sequenceDuration(buildRodelnSequence(dateStr));
}

var API = {
  RODELN:RODELN, RODELN_CAT:RODELN_CAT, RODELN_TOTAL_SEC:RODELN_TOTAL_SEC,
  rodelnPool:rodelnPool, rodelnProgramForDate:rodelnProgramForDate,
  buildRodelnSequence:buildRodelnSequence, rodelnSequenceDuration:rodelnSequenceDuration
};
for (var k in API) W[k] = API[k];
root.RODELN_API = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof globalThis !== "undefined" ? globalThis : this);
