/* ============================================================
   CORE – Daten & Logik (framework-frei, in Node testbar)
   ============================================================ */
(function (root) {
"use strict";

/* ---------- 1. Übungsdatenbank: 120 Übungen, alles ohne Geräte ---------- */
/* g = Muskelgruppe | m = "reps" oder "time" | v = Wiederholungen bzw. Sekunden
   l = Belastung 1–3 | s = true → pro Seite                                   */
var EXERCISES = [
  /* ---------------- BEINE (24) ---------------- */
  {id:1,  g:"beine", n:"Kniebeugen",                 m:"reps", v:20, l:2, c:"Füße hüftbreit, Zehen leicht nach außen. In der Hocke die Hüfte nach hinten schieben, bis die Oberschenkel etwa waagrecht sind, dann kraftvoll über die Fersen hochdrücken."},
  {id:2,  g:"beine", n:"Sumo-Kniebeugen",            m:"reps", v:18, l:2, c:"Breiter Stand, Fußspitzen zeigen nach außen. Gerade nach unten sinken, Knie folgen der Fußrichtung, dann durch die Fersen zurück nach oben drücken – betont die Innenschenkel."},
  {id:3,  g:"beine", n:"Ausfallschritt vorwärts",    m:"reps", v:8,  l:2, s:true, c:"Großer Schritt nach vorn, beide Knie beugen sich auf etwa 90 Grad, das hintere Knie schwebt knapp über dem Boden. Über die vordere Ferse zurück in den Stand drücken."},
  {id:4,  g:"beine", n:"Ausfallschritt rückwärts",   m:"reps", v:8,  l:2, s:true, c:"Statt nach vorn einen Schritt nach hinten setzen und ebenso tief absenken – schont die vordere Kniescheibe stärker als die Vorwärts-Variante. Rumpf während der ganzen Bewegung stabil halten."},
  {id:5,  g:"beine", n:"Seitlicher Ausfallschritt",  m:"reps", v:8,  l:2, s:true, c:"Großer Schritt zur Seite, das Gewicht wandert auf das gebeugte Bein, während das andere gestreckt bleibt. Über die Ferse des gebeugten Beins zurück zur Mitte drücken."},
  {id:6,  g:"beine", n:"Bulgarian Split Squat",      m:"reps", v:8,  l:3, s:true, c:"Hinteren Fuß auf einem Stuhl oder Sofa ablegen, vorderes Bein trägt die Hauptlast. Langsam absenken, bis der hintere Oberschenkel fast parallel zum Boden ist, dann wieder hochdrücken."},
  {id:7,  g:"beine", n:"Wandsitz",                   m:"time", v:45, l:2, c:"Rücken flach an der Wand, langsam absitzen bis die Oberschenkel parallel zum Boden sind, Knie über den Fersen. Position halten und ruhig weiteratmen, nicht die Luft anhalten."},
  {id:8,  g:"beine", n:"Sprungkniebeugen",           m:"reps", v:15, l:3, c:"Aus der Kniebeuge heraus explosiv nach oben abspringen, Arme helfen beim Schwung. Weich über die Fußballen landen und direkt in die nächste Wiederholung übergehen."},
  {id:9,  g:"beine", n:"Ausfallschritt-Sprünge",     m:"reps", v:16, l:3, c:"Aus dem Ausfallschritt hochspringen und die Beine in der Luft wechseln, sodass man in der entgegengesetzten Ausfallschritt-Position landet. Landung immer weich abfedern."},
  {id:10, g:"beine", n:"Wadenheben",                 m:"reps", v:25, l:1, c:"Hüftbreiter Stand, langsam ganz auf die Fußballen hochdrücken, oben kurz die Spannung halten und kontrolliert wieder absenken – für den Wadenmuskel."},
  {id:11, g:"beine", n:"Einbeiniges Wadenheben",     m:"reps", v:12, l:2, s:true, c:"Auf einem Bein stehen, mit einer Hand zur Balance an der Wand abstützen. Langsam auf den Fußballen hoch und wieder runter, doppelte Belastung pro Bein."},
  {id:12, g:"beine", n:"Glute Bridge",               m:"reps", v:20, l:1, c:"Rückenlage, Füße hüftbreit aufgestellt. Hüfte nach oben drücken bis Schultern, Hüfte und Knie eine Linie bilden, oben den Po fest anspannen, dann kontrolliert absenken."},
  {id:13, g:"beine", n:"Einbeinige Glute Bridge",    m:"reps", v:10, l:2, s:true, c:"Wie die Glute Bridge, aber ein Bein bleibt in der Luft gestreckt. Becken bleibt während der ganzen Bewegung waagrecht, nicht zur Seite kippen lassen."},
  {id:14, g:"beine", n:"Hip Thrust am Boden",        m:"reps", v:20, l:2, c:"Oberer Rücken liegt erhöht (z. B. an der Couchkante), Füße hüftbreit aufgestellt. Hüfte kraftvoll nach oben strecken, oben kurz anspannen, dann absenken."},
  {id:15, g:"beine", n:"Kosaken-Kniebeuge",          m:"reps", v:6,  l:3, s:true, c:"Sehr breiter Stand. Das Gewicht tief auf ein Bein verlagern und in die Hocke gehen, das andere Bein bleibt komplett gestreckt mit dem Fuß flach am Boden."},
  {id:16, g:"beine", n:"Pistol Squat (assistiert)",  m:"reps", v:5,  l:3, s:true, c:"Ein Arm hält sich an einem Türrahmen fest, ein Bein wird nach vorn gestreckt. Auf dem Standbein langsam in die tiefe Hocke absenken und wieder hochdrücken."},
  {id:17, g:"beine", n:"Step-ups auf Stufe",         m:"reps", v:10, l:2, s:true, c:"Ganzen Fuß auf eine stabile Stufe oder Bank stellen. Über dieses Bein nach oben drücken, bis man ganz oben steht, dann kontrolliert wieder abwärts steigen."},
  {id:18, g:"beine", n:"Wandsitz mit Pulsen",        m:"time", v:40, l:3, c:"Aus der Wandsitz-Position kleine, schnelle Auf-und-ab-Bewegungen von wenigen Zentimetern machen, ohne die Grundposition zu verlassen – zusätzlicher Reiz für den Oberschenkel."},
  {id:19, g:"beine", n:"Seitliches Beinheben",       m:"reps", v:12, l:1, s:true, c:"Seitlage, unteres Bein leicht angewinkelt. Oberes Bein gestreckt langsam nach oben heben, ohne das Becken nach hinten kippen zu lassen, dann kontrolliert absenken."},
  {id:20, g:"beine", n:"Feuerhydrant",               m:"reps", v:12, l:1, s:true, c:"Vierfüßlerstand, Rücken flach. Ein Knie im rechten Winkel seitlich nach außen anheben, wie ein Hund am Hydranten, dann kontrolliert zurückführen."},
  {id:21, g:"beine", n:"Donkey Kicks",               m:"reps", v:12, l:1, s:true, c:"Vierfüßlerstand. Eine Ferse Richtung Decke drücken, das Knie bleibt gebeugt, oben den Po kurz anspannen und dann kontrolliert wieder absenken."},
  {id:22, g:"beine", n:"Good Mornings",              m:"reps", v:18, l:2, c:"Hüftbreiter Stand, Hände hinter dem Kopf oder vor der Brust. Hüfte mit geradem Rücken nach hinten schieben, leichte Kniebeugung, Oberkörper sinkt fast waagrecht, dann aufrichten."},
  {id:23, g:"beine", n:"Beinbeuger negativ",         m:"reps", v:8,  l:3, c:"Im Kniestand die Füße fixieren (z. B. unter einem schweren Möbelstück). Den Oberkörper so langsam wie möglich nach vorn absenken, die Beinrückseite bremst die Bewegung."},
  {id:24, g:"beine", n:"Frog Pumps",                 m:"reps", v:25, l:1, c:"Rückenlage, Fußsohlen zusammen, Knie fallen zur Seite. Hüfte in schnellem Rhythmus nach oben pumpen und wieder absenken – hohe Wiederholungszahl für die Gesäßmuskulatur."},

  /* ---------------- ARME & SCHULTERN (20) ---------------- */
  {id:25, g:"arme", n:"Trizeps-Dips am Stuhl",       m:"reps", v:15, l:2, c:"Hände auf die Stuhlkante stützen, Beine nach vorn gestreckt. Ellbogen zeigen nach hinten, Oberkörper absenken bis die Ellbogen etwa 90 Grad erreichen, dann hochdrücken."},
  {id:26, g:"arme", n:"Diamant-Liegestütze",         m:"reps", v:10, l:3, c:"Hände bilden unter der Brust ein Dreieck (Daumen und Zeigefinger berühren sich). Eng am Körper absenken – belastet den Trizeps besonders stark."},
  {id:27, g:"arme", n:"Enge Liegestütze",            m:"reps", v:12, l:3, c:"Hände etwa schulterbreit direkt unter der Brust. Ellbogen laufen eng am Körper entlang statt nach außen zu klappen, der Trizeps übernimmt den Großteil der Arbeit."},
  {id:28, g:"arme", n:"Pike Push-ups",               m:"reps", v:10, l:3, c:"Aus dem Stütz die Hüfte hochschieben wie ein umgekehrtes V. Kopf zwischen den Händen zum Boden absenken, dann zurückdrücken – Vorstufe zum Handstand-Drücken."},
  {id:29, g:"arme", n:"Schulterkreisen mit Spannung",m:"time", v:40, l:1, c:"Arme seitlich auf Schulterhöhe ausstrecken. Kleine, schnelle Kreise ziehen, dabei die Arme bewusst angespannt und lang halten."},
  {id:30, g:"arme", n:"Armkreisen vorwärts",         m:"time", v:30, l:1, c:"Arme seitlich gestreckt ausstrecken und große, gleichmäßige Kreise nach vorn ziehen, die Spannung in den Armen konstant halten."},
  {id:31, g:"arme", n:"Armkreisen rückwärts",        m:"time", v:30, l:1, c:"Wie vorwärts, nur in die andere Richtung. Brustkorb bewusst öffnen, Schulterblätter leicht zusammenziehen."},
  {id:32, g:"arme", n:"Plank Shoulder Taps",         m:"reps", v:20, l:2, c:"Im hohen Stütz die Füße etwas breiter stellen. Abwechselnd mit einer Hand die gegenüberliegende Schulter antippen, Hüfte dabei so ruhig wie möglich halten."},
  {id:33, g:"arme", n:"Bear Crawl vor/zurück",       m:"time", v:40, l:2, c:"Vierfüßlerstand mit angehobenen Knien knapp über dem Boden. Gegengleich Hand und Fuß nach vorn setzen, dann rückwärts, Rücken bleibt flach."},
  {id:34, g:"arme", n:"Trizeps-Strecken im Stütz",   m:"reps", v:12, l:3, c:"Aus dem Unterarmstütz einen Arm nach dem anderen zum Handstütz durchdrücken, dann wieder zurück in den Unterarmstütz – kräftigt Trizeps und Schultern."},
  {id:35, g:"arme", n:"Handstand-Halt an der Wand",  m:"time", v:30, l:3, c:"Füße an der Wand hochlaufen bis zum Handstand, Körper bildet eine lange Linie. Bauch fest anspannen und die Position ruhig halten."},
  {id:36, g:"arme", n:"Wand-Handstand negativ",      m:"reps", v:6,  l:3, c:"Aus dem Handstand an der Wand langsam die Arme beugen und den Kopf kontrolliert Richtung Boden absenken, dann wieder kraftvoll hochdrücken."},
  {id:37, g:"arme", n:"Bizeps-Zug mit Handtuch",     m:"time", v:40, l:2, c:"Handtuch unter einem Fuß einklemmen, mit beiden Händen dagegen nach oben ziehen wie bei einem Bizepscurl – der eigene Fuß liefert den Widerstand."},
  {id:38, g:"arme", n:"Curl gegen Selbstwiderstand", m:"reps", v:15, l:2, c:"Eine Hand umgreift das andere Handgelenk und drückt dagegen, während der Arm langsam gebeugt wird – Muskelspannung statt Gewicht erzeugt den Trainingsreiz."},
  {id:39, g:"arme", n:"Liegestütz mit Halt unten",   m:"reps", v:8,  l:3, c:"Normale Liegestütz-Ausführung, aber unten kurz vor dem Boden zwei Sekunden halten, bevor kraftvoll hochgedrückt wird – deutlich mehr Zeit unter Spannung."},
  {id:40, g:"arme", n:"Scapula Push-ups",            m:"reps", v:15, l:1, c:"Im hohen Stütz die Arme komplett gestreckt lassen. Nur die Schulterblätter zusammenziehen und wieder auseinanderschieben, ohne die Ellbogen zu beugen."},
  {id:41, g:"arme", n:"Crab Walk",                   m:"time", v:40, l:2, c:"Rückwärtsstütz mit angehobener Hüfte, Hände und Füße zeigen vom Körper weg. Im Krebsgang einige Schritte vor- und zurücklaufen, Hüfte bleibt oben."},
  {id:42, g:"arme", n:"Trizeps-Kickback ohne Gewicht",m:"reps",v:18, l:1, c:"Oberkörper leicht nach vorn geneigt, Ellbogen am Körper fixiert. Unterarm nach hinten strecken bis der Arm ganz gerade ist, dann kontrolliert zurückführen."},
  {id:43, g:"arme", n:"Schulterdrücken gegen Wand",  m:"time", v:40, l:2, c:"Rücken zur Wand, Arme wie beim Schulterdrücken nach oben gegen die Wand pressen. Isometrisch halten und dabei gleichmäßig weiteratmen."},
  {id:44, g:"arme", n:"Plank Walk-up",               m:"reps", v:12, l:2, c:"Aus dem Unterarmstütz Hand für Hand in den hohen Stütz hochdrücken, dann wieder zurück in den Unterarmstütz – Seite pro Wiederholung wechseln."},

  /* ---------------- BRUST (16) ---------------- */
  {id:45, g:"brust", n:"Liegestütze klassisch",      m:"reps", v:15, l:2, c:"Hände etwas breiter als schulterbreit, Körper bildet vom Kopf bis zu den Fersen eine gerade Linie. Brust fast bis zum Boden absenken, dann kraftvoll hochdrücken."},
  {id:46, g:"brust", n:"Breite Liegestütze",         m:"reps", v:14, l:2, c:"Hände deutlich breiter als schulterbreit aufsetzen. Durch die breitere Handstellung wird die äußere Brustmuskulatur stärker betont."},
  {id:47, g:"brust", n:"Liegestütze erhöht",         m:"reps", v:18, l:1, c:"Hände auf einen Stuhl oder Tisch stützen, Körper bleibt gerade. Durch die erhöhte Position sinkt die Belastung – gut für viele saubere Wiederholungen."},
  {id:48, g:"brust", n:"Liegestütze Füße erhöht",    m:"reps", v:10, l:3, c:"Füße auf ein Sofa oder eine Bank legen, Hände am Boden. Die erhöhte Fußposition verlagert mehr Last auf die obere Brust und die Schultern."},
  {id:49, g:"brust", n:"Archer-Liegestütze",         m:"reps", v:8,  l:3, c:"Breiter Handstand, beim Absenken das Gewicht auf eine Seite verlagern, der andere Arm bleibt fast gestreckt. Seite für Seite wechseln."},
  {id:50, g:"brust", n:"Langsame Liegestütze 3-1-3", m:"reps", v:8,  l:3, c:"Drei Sekunden lang kontrolliert absenken, unten eine Sekunde halten, dann drei Sekunden lang hochdrücken – die Langsamkeit erhöht die Muskelspannung deutlich."},
  {id:51, g:"brust", n:"Hindu Push-ups",             m:"reps", v:10, l:2, c:"Aus der Hüfte hoch beginnend in einem fließenden Bogen nach vorn unten tauchen, bis die Brust vorn öffnet und der Blick nach oben geht, dann zurück in die Ausgangsposition."},
  {id:52, g:"brust", n:"Liegestütz mit Rotation",    m:"reps", v:12, l:2, c:"Normale Liegestütz-Ausführung, oben angekommen den Oberkörper zur Seite drehen und einen Arm zur Decke strecken, Blick folgt der Hand."},
  {id:53, g:"brust", n:"Klatsch-Liegestütze",        m:"reps", v:8,  l:3, c:"Explosiv aus der tiefen Position abdrücken, sodass die Hände kurz den Boden verlassen und in die Luft klatschen können, dann weich wieder auffangen."},
  {id:54, g:"brust", n:"Versetzte Liegestütze",      m:"reps", v:12, l:2, c:"Eine Hand etwas weiter vorn, die andere etwas weiter hinten platzieren. Nach der Hälfte der Wiederholungen die Handposition tauschen."},
  {id:55, g:"brust", n:"Knie-Liegestütze",           m:"reps", v:20, l:1, c:"Knie statt Füße am Boden, Hüfte bleibt gestreckt, Körper bildet vom Kopf bis zu den Knien eine Linie. Gute Einstiegsvariante für mehr Wiederholungen."},
  {id:56, g:"brust", n:"Liegestütz-Halt unten",      m:"time", v:35, l:3, c:"Kurz über dem Boden in der tiefsten Liegestütz-Position verharren, Spannung im ganzen Körper halten, gleichmäßig weiteratmen."},
  {id:57, g:"brust", n:"Wand-Liegestütze",           m:"reps", v:20, l:1, c:"Hände auf Schulterhöhe gegen eine Wand stützen, Körper schräg gerade. Langsam und kontrolliert zur Wand absenken und wieder hochdrücken – sehr gelenkschonend."},
  {id:58, g:"brust", n:"Push-up to Plank Jack",      m:"reps", v:12, l:3, c:"Nach einer normalen Liegestütz im hohen Stütz die Beine springend auseinander- und wieder zusammenführen, dann die nächste Liegestütz."},
  {id:59, g:"brust", n:"Typewriter Push-ups",        m:"reps", v:8,  l:3, c:"Unten in der tiefen Position von Hand zu Hand seitlich hin- und herschieben, wie ein Schreibmaschinenwagen, ohne den Oberkörper anzuheben."},
  {id:60, g:"brust", n:"Spiderman-Liegestütze",      m:"reps", v:12, l:3, c:"Beim Absenken der Liegestütz ein Knie seitlich zum gleichseitigen Ellbogen ziehen, oben zurückführen, dann die Seite wechseln."},

  /* ---------------- BAUCH & RUMPF (24) ---------------- */
  {id:61, g:"bauch", n:"Unterarmstütz (Plank)",      m:"time", v:45, l:2, c:"Ellbogen direkt unter den Schultern, Körper bildet eine gerade Linie von Kopf bis Ferse. Bauch fest anspannen, Po nicht hochschieben und nicht durchhängen lassen."},
  {id:62, g:"bauch", n:"Seitstütz rechts",           m:"time", v:30, l:2, c:"Auf dem rechten Unterarm abstützen, Füße übereinander, Hüfte anheben bis der Körper eine gerade Linie bildet. Seitliche Bauchmuskulatur trägt das Gewicht."},
  {id:63, g:"bauch", n:"Seitstütz links",            m:"time", v:30, l:2, c:"Spiegelbildlich zur rechten Seite: linker Unterarm unten, Schulter direkt über dem Ellbogen, Hüfte oben halten."},
  {id:64, g:"bauch", n:"Crunches",                   m:"reps", v:25, l:1, c:"Rückenlage, Knie aufgestellt, Hände leicht an den Kopf. Nur Kopf und Schultern vom Boden lösen, Nacken bleibt lang, dann kontrolliert zurücksinken."},
  {id:65, g:"bauch", n:"Bicycle Crunches",           m:"reps", v:30, l:2, c:"Rückenlage, Hände an den Schläfen. Abwechselnd Ellbogen zum gegenüberliegenden angezogenen Knie führen, dabei bewusst langsam aus dem Rumpf drehen."},
  {id:66, g:"bauch", n:"Beinheben liegend",          m:"reps", v:15, l:2, c:"Rückenlage, Beine gestreckt. Langsam nach oben heben bis etwa 90 Grad, dann kontrolliert absenken, ohne dass sich der untere Rücken vom Boden löst."},
  {id:67, g:"bauch", n:"Flutter Kicks",              m:"time", v:40, l:2, c:"Rückenlage, unterer Rücken in den Boden gedrückt. Gestreckte Beine knapp über dem Boden in kleinen, schnellen Scherbewegungen auf und ab bewegen."},
  {id:68, g:"bauch", n:"Scissor Kicks",              m:"time", v:40, l:2, c:"Ähnlich wie Flutter Kicks, aber die gestreckten Beine kreuzen sich abwechselnd über- und untereinander statt nur auf und ab zu wippen."},
  {id:69, g:"bauch", n:"Hollow Body Hold",           m:"time", v:35, l:3, c:"Rückenlage, unterer Rücken fest in den Boden gedrückt. Arme und Beine lang ausgestreckt leicht anheben, Spannung im ganzen Rumpf halten."},
  {id:70, g:"bauch", n:"Russian Twists",             m:"reps", v:30, l:2, c:"Sitzposition, Oberkörper leicht zurückgelehnt, Füße können abheben. Aus dem Rumpf heraus abwechselnd nach links und rechts drehen, Hände berühren jeweils den Boden neben der Hüfte."},
  {id:71, g:"bauch", n:"Sit-ups",                    m:"reps", v:20, l:2, c:"Rückenlage, Knie aufgestellt. Wirbel für Wirbel nach oben aufrollen bis zum Sitzen, dann genauso kontrolliert Wirbel für Wirbel wieder abrollen."},
  {id:72, g:"bauch", n:"Toe Touches",                m:"reps", v:20, l:2, c:"Rückenlage, Beine senkrecht nach oben gestreckt. Mit beiden Händen versuchen, die Zehenspitzen zu berühren, nur Kopf und Schultern lösen sich vom Boden."},
  {id:73, g:"bauch", n:"V-Ups",                      m:"reps", v:15, l:3, c:"Rückenlage, Arme über dem Kopf. Gleichzeitig Oberkörper und gestreckte Beine anheben, sodass sich Hände und Füße in der Luft treffen, dann kontrolliert zurück."},
  {id:74, g:"bauch", n:"Dead Bug",                   m:"reps", v:20, l:1, c:"Rückenlage, Arme zeigen zur Decke, Knie im rechten Winkel angehoben. Gegengleich einen Arm und das entgegengesetzte Bein strecken, unterer Rücken bleibt am Boden."},
  {id:75, g:"bauch", n:"Mountain Climbers",          m:"time", v:40, l:2, c:"Hoher Stütz, Hüfte tief. Knie schnell abwechselnd Richtung Brust ziehen, als würde man auf der Stelle einen Berg hochlaufen."},
  {id:76, g:"bauch", n:"Plank Jacks",                m:"reps", v:20, l:2, c:"Hoher Stütz. Die Beine springend nach außen öffnen und wieder zusammenführen, Oberkörper bleibt dabei ruhig und stabil."},
  {id:77, g:"bauch", n:"Reverse Crunch",             m:"reps", v:18, l:2, c:"Rückenlage, Beine angewinkelt in der Luft. Knie Richtung Brust rollen und dabei das Becken leicht vom Boden abheben, dann kontrolliert absenken."},
  {id:78, g:"bauch", n:"Heel Taps",                  m:"reps", v:30, l:1, c:"Rückenlage, Knie aufgestellt, Schultern leicht vom Boden gelöst. Abwechselnd seitlich zur rechten und linken Ferse tippen – trainiert die seitliche Bauchmuskulatur."},
  {id:79, g:"bauch", n:"Plank mit Beinheben",        m:"reps", v:16, l:3, c:"Hoher Stütz. Ein Bein gestreckt nach oben anheben, ohne dass die Hüfte zur Seite kippt, dann absetzen und die Seite wechseln."},
  {id:80, g:"bauch", n:"Hollow Rocks",               m:"reps", v:20, l:3, c:"Aus der Hollow-Body-Position heraus den ganzen Körper leicht vor und zurück schaukeln, die Grundspannung bleibt dabei durchgehend erhalten."},
  {id:81, g:"bauch", n:"Sitzendes Beinheben",        m:"time", v:30, l:3, c:"Aufrecht sitzen, Hände seitlich abgestützt. Beide gestreckten Beine anheben und die Position einige Sekunden halten, dann kontrolliert absenken."},
  {id:82, g:"bauch", n:"Scheibenwischer",            m:"reps", v:16, l:3, c:"Rückenlage, Beine senkrecht nach oben gestreckt, Arme seitlich zur Stabilität ausgebreitet. Beine wie ein Scheibenwischer kontrolliert von einer Seite zur anderen senken."},
  {id:83, g:"bauch", n:"Bauchpresse gegen die Knie", m:"time", v:40, l:1, c:"Sitzend oder im Stand die Hände gegen die angehobenen Knie drücken, während die Knie gleichzeitig dagegenhalten – reine isometrische Bauchspannung."},
  {id:84, g:"bauch", n:"Bird Dog Crunch",            m:"reps", v:16, l:2, c:"Vierfüßlerstand, ein Arm und das gegenüberliegende Bein gestreckt. Ellbogen und Knie unter dem Bauch zusammenführen, dann wieder lang ausstrecken."},

  /* ---------------- RÜCKEN (20) ---------------- */
  {id:85, g:"ruecken", n:"Superman",                 m:"reps", v:20, l:1, c:"Bauchlage, Arme nach vorn gestreckt. Arme und Beine gleichzeitig einige Zentimeter vom Boden abheben, Blick bleibt zum Boden gerichtet, dann kontrolliert absenken."},
  {id:86, g:"ruecken", n:"Superman-Halt",            m:"time", v:40, l:2, c:"Wie Superman, die angehobene Position aber oben halten statt sie wiederholt aufzulösen. Gleichmäßig weiteratmen, nicht die Luft anhalten."},
  {id:87, g:"ruecken", n:"Bird Dog",                 m:"reps", v:20, l:1, c:"Vierfüßlerstand. Einen Arm nach vorn und das gegenüberliegende Bein nach hinten strecken, Becken bleibt dabei waagrecht, dann Seite wechseln."},
  {id:88, g:"ruecken", n:"Schwimmer",                m:"time", v:40, l:2, c:"Bauchlage, Arme nach vorn gestreckt. Gegengleich einen Arm und das entgegengesetzte Bein leicht anheben und im Wechsel wie beim Schwimmen bewegen."},
  {id:89, g:"ruecken", n:"Reverse Snow Angel",       m:"reps", v:18, l:2, c:"Bauchlage, Arme seitlich am Körper. Arme dicht über dem Boden nach oben und wieder zurück nach unten kreisen, Schulterblätter aktiv einsetzen."},
  {id:90, g:"ruecken", n:"Y-T-W Raises",             m:"reps", v:18, l:2, c:"Bauchlage. Nacheinander die Arme in Y-Form (schräg nach oben), T-Form (seitlich waagrecht) und W-Form (angewinkelt) anheben – trainiert die obere Rückenmuskulatur umfassend."},
  {id:91, g:"ruecken", n:"Prone Cobra",              m:"time", v:40, l:2, c:"Bauchlage, Arme am Körper. Brust vom Boden abheben und dabei die Daumen nach außen drehen, sodass sich die Schulterblätter zusammenziehen."},
  {id:92, g:"ruecken", n:"Rudern mit Handtuch",      m:"reps", v:18, l:2, c:"Handtuch um eine Türklinke oder einen stabilen Griff legen. Mit gestreckten Armen nach hinten lehnen, dann mit dem Rücken zur Klinke ziehen."},
  {id:93, g:"ruecken", n:"Türrahmen-Rudern",         m:"reps", v:12, l:3, s:true, c:"Beide Hände am Türrahmen festhalten, Füße nah an der Tür, Körper nach hinten lehnen. Mit dem Rücken zur Tür ziehen und kontrolliert wieder ausstrecken."},
  {id:94, g:"ruecken", n:"Rudern unter dem Tisch",   m:"reps", v:12, l:3, c:"Unter einen stabilen Tisch legen, Hände greifen die Tischkante. Die Brust kraftvoll zur Kante ziehen, dann die Arme wieder strecken."},
  {id:95, g:"ruecken", n:"Hüftheben mit Fersendruck",m:"reps", v:20, l:2, c:"Rückenlage, Fersen fest in den Boden drücken. Hüfte kraftvoll nach oben strecken, dabei bewusst über die Fersen arbeiten statt über die Zehen."},
  {id:96, g:"ruecken", n:"Katze-Kuh",                m:"reps", v:20, l:1, c:"Vierfüßlerstand. Wirbelsäule abwechselnd zur Decke runden (Katze) und zum Boden durchhängen lassen (Kuh) – mobilisiert die gesamte Wirbelsäule sanft."},
  {id:97, g:"ruecken", n:"Rückenstrecker am Boden",  m:"reps", v:20, l:2, c:"Bauchlage, Hände neben dem Kopf. Nur den Oberkörper leicht vom Boden abheben, die Beine bleiben liegen, dann kontrolliert absenken."},
  {id:98, g:"ruecken", n:"Schulterblätter zusammen", m:"reps", v:20, l:1, c:"Arme im rechten Winkel vor dem Körper halten. Die Schulterblätter bewusst nach hinten zusammenziehen, kurz halten, dann lösen."},
  {id:99, g:"ruecken", n:"Wall Slides",              m:"reps", v:15, l:1, c:"Rücken und Arme an der Wand, Ellbogen im rechten Winkel. Arme an der Wand entlang nach oben schieben und wieder herunterführen, Kontakt zur Wand bleibt bestehen."},
  {id:100,g:"ruecken", n:"Brücken-Halt",             m:"time", v:40, l:2, c:"Rückenlage, Füße aufgestellt. Hüfte nach oben drücken und oben halten, Gewicht verteilt sich auf Schultern und Fersen."},
  {id:101,g:"ruecken", n:"Reverse Plank",            m:"time", v:35, l:3, c:"Sitzposition mit Händen hinter dem Körper aufgestützt, Beine gestreckt. Hüfte anheben, bis der Körper eine gerade Linie von den Schultern bis zu den Fersen bildet."},
  {id:102,g:"ruecken", n:"Reverse Plank Beinheben",  m:"reps", v:16, l:3, c:"Aus der Reverse-Plank-Position abwechselnd ein Bein anheben, ohne dass die Hüfte absackt, dann wieder absetzen und die Seite wechseln."},
  {id:103,g:"ruecken", n:"Superman Pull",            m:"reps", v:18, l:2, c:"Bauchlage, Arme nach vorn gestreckt. Arme wie beim Rudern anwinkeln und die Ellbogen nach hinten ziehen, Schulterblätter zusammenführen, dann wieder strecken."},
  {id:104,g:"ruecken", n:"Vierfüßler-Halt",          m:"time", v:35, l:2, c:"Vierfüßlerstand, Knie schweben knapp über dem Boden, Rücken bleibt flach. Position ruhig halten, ohne den Rücken durchhängen zu lassen."},

  /* ---------------- CARDIO & AUSDAUER (16) ---------------- */
  {id:105,g:"cardio", n:"Hampelmänner",              m:"time", v:45, l:1, c:"Aus dem Stand gleichzeitig die Beine seitlich öffnen und die Arme über dem Kopf zusammenführen, dann zurück in die Ausgangsposition – gleichmäßiger Rhythmus."},
  {id:106,g:"cardio", n:"High Knees",                m:"time", v:40, l:2, c:"Auf der Stelle laufen und dabei die Knie abwechselnd bis auf Hüfthöhe hochziehen, Arme laufen aktiv mit."},
  {id:107,g:"cardio", n:"Butt Kicks",                m:"time", v:40, l:1, c:"Auf der Stelle laufen und dabei die Fersen abwechselnd Richtung Gesäß nach hinten hochschlagen, Oberkörper bleibt aufrecht."},
  {id:108,g:"cardio", n:"Burpees",                   m:"reps", v:12, l:3, c:"Aus dem Stand in die Hocke, Hände auf den Boden, Beine nach hinten in den Stütz springen, kurze Liegestütz-Bewegung, dann zurück in die Hocke und hoch in den Strecksprung."},
  {id:109,g:"cardio", n:"Half Burpees",              m:"reps", v:15, l:2, c:"Wie Burpees, aber ohne die Liegestütz – nur der Sprung in den Stütz und direkt zurück in die Hocke, danach der Strecksprung nach oben."},
  {id:110,g:"cardio", n:"Skater Jumps",              m:"time", v:40, l:2, c:"Seitlich von einem Bein auf das andere springen wie ein Eisläufer, das jeweils hintere Bein schwingt leicht nach hinten, weich landen."},
  {id:111,g:"cardio", n:"Seilspringen ohne Seil",    m:"time", v:45, l:1, c:"Kleine, gleichmäßige Sprünge aus dem Fußgelenk simulieren, als würde tatsächlich ein Seil geschwungen, Handgelenke kreisen mit."},
  {id:112,g:"cardio", n:"Squat Jumps in Serie",      m:"reps", v:15, l:3, c:"Tief in die Kniebeuge gehen, dann explosiv nach oben abspringen, weich landen und direkt in die nächste Wiederholung übergehen."},
  {id:113,g:"cardio", n:"Shadow Boxing",             m:"time", v:45, l:1, c:"Lockere Grundstellung mit leichter Beinarbeit, dabei abwechselnd Schläge aus der Hüfte heraus in die Luft setzen, ständig in Bewegung bleiben."},
  {id:114,g:"cardio", n:"Sprint auf der Stelle",     m:"time", v:30, l:3, c:"Maximales Lauftempo auf der Stelle, kurze Bodenkontakte über den Vorfuß, Arme pumpen aktiv mit."},
  {id:115,g:"cardio", n:"Star Jumps",                m:"reps", v:20, l:2, c:"Aus der tiefen Hocke explosiv nach oben abspringen und dabei Arme und Beine sternförmig weit öffnen, dann wieder in die Hocke landen."},
  {id:116,g:"cardio", n:"Tuck Jumps",                m:"reps", v:12, l:3, c:"Aus dem Stand hochspringen und dabei beide Knie so hoch wie möglich Richtung Brust ziehen, weich mit gebeugten Knien landen."},
  {id:117,g:"cardio", n:"Lateral Shuffle",           m:"time", v:40, l:2, c:"Tiefe, athletische Grundposition, schnelle Seitschritte hin und her, ohne die Knie durchzustrecken – trainiert seitliche Schnelligkeit."},
  {id:118,g:"cardio", n:"Inchworm",                  m:"reps", v:10, l:2, c:"Aus dem Stand die Hände auf den Boden bringen und langsam nach vorn wandern lassen bis zum hohen Stütz, dann die Füße wieder zu den Händen heranlaufen."},
  {id:119,g:"cardio", n:"Bear Crawl Sprint",         m:"time", v:30, l:3, c:"Im Vierfüßlerstand mit angehobenen Knien zügig vorwärts krabbeln, Hüfte bleibt dabei nah am Boden."},
  {id:120,g:"cardio", n:"Stufensteigen schnell",     m:"time", v:45, l:2, c:"Eine Treppenstufe oder erhöhte Fläche im zügigen Wechseltempo besteigen und wieder heruntersteigen, gleichmäßiger, schneller Rhythmus."}
];

var GROUPS = ["beine","brust","bauch","ruecken","arme","cardio"];
var GROUP_LABEL = {
  beine:"Beine", brust:"Brust", bauch:"Bauch & Rumpf",
  ruecken:"Rücken", arme:"Arme & Schultern", cardio:"Cardio"
};
var GROUP_COLOR = {
  beine:"#4fd1b5", brust:"#e8b463", bauch:"#c98bd9",
  ruecken:"#6fa8ea", arme:"#e0645f", cardio:"#8fd15c"
};

/* ---------- Trainingsziele ---------- */
/* Versionsnummer der App. Steigt bei jeder Funktionsänderung/-erweiterung
   um mindestens eine Nebenversion (Minor). Wird in Einstellungen -> Daten
   angezeigt. Diese Zählung beginnt hier neu (erste Version mit einer
   sichtbaren Versionsnummer überhaupt); frühere Entwicklungsrunden hatten
   keine Versionsnummer. */
var APP_VERSION = "3.0.0";
var CHANGELOG = {
  "3.0.0": [
    "Aus Trainingsblog, Focus, Rodel-Mobility und Pulsplan wird eine App: Training",
    "Neu im Bereich Training: Mobility-Programm (Block A/B/C, Wettkampf vor und nach dem Lauf, Vorbeuge-Test) und Atmung & HRV (12-Wochen-Plan, Resonanztest, Morgenmessung)",
    "Heute: neue Karte „Dazu heute“ mit Mobility-Block, geplanter Atemübung und Morgen-HRV",
    "Trainingsbereitschaft berücksichtigt jetzt deine Morgen-HRV (ln RMSSD im Vergleich zu deinem Normalbereich)",
    "Ziel Muskelaufbau mit drei Runden, ehrlichere Beschreibung beim Ziel Abnehmen, Quellen unter Fitness"
  ],
  "2.19.0": [
    "Neuer Knopf 'Version aktualisieren' unter Einstellungen → Daten → Version: prüft aktiv bei GitHub, ob eine neuere Version bereitliegt, und lädt sie bei Bedarf sofort nach – kein Warten mehr auf die automatische Aktualisierung"
  ],
  "2.18.0": [
    "Neue Funktion: Verletzung – exakt nach dem Muster der Krankheits-Funktion aufgebaut (Kalender-Punkt, tägliche Nachfrage, Jahresübersicht), aber mit dem inhaltlichen Unterschied: statt eines leichten Dehnprogramms zeigt ein Verletzungstag durchgehend nur die einfache 2-Minuten-Atemübung",
    "Eigener roter Kalender-Punkt und Legenden-Eintrag 'Verletzt', eigene Widget-Kachel neben 'Krankheit'"
  ],
  "2.17.1": [
    "Echten Fehler behoben: Tage mit festem 'schon trainiert' zeigten weiterhin normale Übungen statt der passenden 2-Minuten-Cool-down-Atemübung – jetzt korrekt sowohl auf der Startseite als auch im Kalender-Tagesblatt"
  ],
  "2.17.0": [
    "'Schon trainiert' markiert den Tag jetzt korrekt als erledigt – mit einem echten Ganzkörper-Belastungsprofil (Beine 20%, restlicher Körper 15%) statt nur einem allgemeinen Hinweis",
    "Das neue Profil fließt direkt in die Ermüdungsberechnung nach Muskelgruppe ein: Beine gelten danach spürbar stärker belastet als der Rest",
    "Gilt jetzt einheitlich sowohl für den Knopf auf der Startseite als auch für das Festlegen/Entfernen einzelner Tage im Kalender"
  ],
  "2.16.0": [
    "Feste 'schon trainiert'-Tage funktionieren jetzt genau wie feste Ruhetage: zukünftige Tage werden im Kalender mit einem eigenen grünen Punkt angezeigt, einzelne Tage lassen sich im Tagesblatt umschalten, und ein ganzer Zeitraum lässt sich auf einmal deaktivieren",
    "Eigener Legenden-Eintrag 'Extern trainiert' zur klaren Unterscheidung von Ruhetagen"
  ],
  "2.15.0": [
    "Neu: feste Ruhetage lassen sich jetzt für einen ganzen Zeitraum deaktivieren, direkt im Kalender – Tag antippen, 'Ruhetage ab hier für Zeitraum deaktivieren', Enddatum wählen",
    "Zukünftige feste Ruhetage waren im Kalender bereits vorher sichtbar (bestätigt) – einzelne Tage ließen sich auch schon vorher direkt im Tagesblatt umschalten"
  ],
  "2.14.1": [
    "Sehr wahrscheinlich der eigentliche, seit langem bestehende Grund gefunden, warum Chrome nur 'Verknüpfung erstellen' statt 'App installieren' anbot: Die Sicherheits-Richtlinie (CSP) der App erlaubte 'manifest-src' nicht ausdrücklich, wodurch der Browser das Manifest vermutlich seit dem Sicherheits-Umbau in Version 2.1 nie richtig laden durfte",
    "Zur Sicherheit zusätzlich die App-Icons von SVG auf echte PNG-Dateien umgestellt (inklusive 'maskable'-Variante für Android), da ältere Chrome-Versionen SVG-Icons für die Installierbarkeits-Prüfung nicht immer zuverlässig erkennen"
  ],
  "2.14.0": [
    "Vermutlich der eigentliche Grund, warum Chrome auf Android nur 'Verknüpfung erstellen' statt 'App installieren' anbot: Es gab überhaupt keinen Service Worker – den verlangt Chrome zusätzlich zum Manifest für die echte Installations-Option",
    "Neuer Service Worker registriert sich automatisch auf der echten (HTTPS-)Seite und speichert die App zusätzlich für die Nutzung ganz ohne Internetverbindung"
  ],
  "2.13.2": [
    "Echter Fehler behoben, warum Chrome nur noch 'Verknüpfung erstellen' statt 'App installieren' anbot: Ein zweites, unvollständiges Manifest wurde zusätzlich zur Laufzeit erzeugt und überschrieb das eigentlich vollständige – jetzt gibt es nur noch das eine, vollständige Manifest mit beiden nötigen Symbolgrößen",
    "Zusätzlich ein eigenes Symbol für iOS (Zum Home-Bildschirm hinzufügen) ergänzt, das vorher nirgends vorhanden war"
  ],
  "2.13.1": [
    "Echten Fehler im Navy-Design behoben: Eigene Farb-Anpassungen aus einem anderen Design blieben als unsichtbarer Überschreib-Wert hängen und ließen manche Kacheln weiß statt Navy erscheinen – ein Design-Wechsel setzt das jetzt sauber zurück",
    "Kachelfarbe im Navy-Design jetzt wählbar: fünf abgestimmte Töne (Classic Navy, Deep Slate, Midnight Blue, Steel Navy, Navy Charcoal)",
    "Feinschliff: sanfter Verlauf auf den wichtigsten Karten für mehr Tiefe, kräftigere Kennzahlen-Zahlen, feine Trennlinie zwischen Kachel-Kopf und Inhalt"
  ],
  "2.13.0": [
    "Neues 'Navy'-Design: Premium-Marineblau (#0B132B/#1C2541) mit strahlend weißen, Pill-förmigen Hauptknöpfen und dunkler Navy-Schrift für maximalen Kontrast",
    "Ausgeklügeltere Typografie im Navy-Design: mehr Zeilenabstand bei Fließtext (1,65), kompaktere, markante Überschriften",
    "Weiche, großflächige Schatten und feine halbtransparente Ränder statt harter Kanten; Navigationsleiste schwebt halbtransparent mit Weichzeichner",
    "Alle bestehenden Funktionen (Gym-Erklärungen, Timer, europäische Einheiten) bleiben strukturell vollständig erhalten – nur das Erscheinungsbild ändert sich",
    "Wählbar unter Einstellungen → Erscheinungsbild → Design, neben Neutral/Klassisch/Modern"
  ],
  "2.12.0": [
    "Kalorienberechnung grundlegend genauer: Jede der über 430 Übungen (Bodyweight, Dehnen, Rodeln, Gym) bekommt jetzt einen eigenen, am wissenschaftlichen 'Compendium of Physical Activities' orientierten MET-Wert statt eines einzigen Pauschalwerts für jedes Training",
    "Explosive/dynamische Übungen (Sprünge, Cardio) zählen spürbar mehr Kalorien als ruhiges Halte- oder Dehntraining gleicher Dauer – bei identischen 20 Minuten z. B. 201 statt 100 kcal, je nach tatsächlichem Inhalt",
    "Gym-Training und Rodeln-Vorbereitung speichern jetzt zusätzlich die tatsächlich absolvierten Übungen im Tagesverlauf, damit die genauere Berechnung greifen kann",
    "Ältere, bereits gespeicherte Trainingstage funktionieren unverändert weiter (Rückwärtskompatibilität bestätigt)"
  ],
  "2.11.9": [
    "Wichtigste Dialoge einzeln durchgeprüft: Jahresrückblick (rechnet korrekt mit echten Daten), Zurücksetzen-Sicherheitsnetz samt Wiederherstellung, Tagesblatt-Aktionen für vergangene Tage, PDF-Trainingsbericht – keine Fehler gefunden"
  ],
  "2.11.8": [
    "Onboarding-Einrichtung vollständig durchgeprüft, erstmals auch der komplette Pfad mit echtem CSV-Import über alle fünf Schritte getestet",
    "Zahlenfelder markieren jetzt beim Antippen ihren gesamten Inhalt, damit eine neue Eingabe korrekt überschreibt statt sich an die vorhandene Zahl anzuhängen (z. B. beim Wochenziel oder Körpergewicht)"
  ],
  "2.11.7": [
    "Einstellungen-Bildschirm gründlich durchgeprüft, alle sieben Kategorien einzeln fotografiert und die Einstellungs-Suche getestet",
    "Bedeutender Fehler behoben: Die Suche kannte über die Hälfte aller Einstellungen nicht – keine der seit Version 2.6 hinzugekommenen Funktionen (Herzfrequenz-Kopplung, Bewegung reduzieren, Gym-Einstellungen, Modern-Design u.v.m.) war auffindbar. Suchindex jetzt vollständig auf 77 Einträge erweitert",
    "Zusätzlich einen stillen toten Verweis behoben (alte 'setSkin'-Einstellung existierte nach dem Drei-Wege-Design-Umbau gar nicht mehr)"
  ],
  "2.11.6": [
    "Fitness-Bildschirm gründlich durchgeprüft: echten Positionsfehler gefunden und behoben – 'Jahresrückblick ansehen' sprang fälschlich ganz nach oben statt hinter die Abzeichen-Karte zu stehen (gleiche Ursache wie ein früherer, bereits behobener Fall)",
    "Systematisch alle Bildschirme auf denselben Fehlertyp durchsucht – keine weiteren Fälle gefunden"
  ],
  "2.11.5": [
    "Analyse-Bildschirm gründlich durchgeprüft: beide Unter-Reiter, alle elf Bereiche, PDF-Export-Zeitraum, Wochentag-Aufklapp-Funktion – keine Fehler gefunden"
  ],
  "2.11.4": [
    "Training-Bildschirm gründlich durchgeprüft: Dehnen, Distanz-Auswahl, Gym-Modul und Lauf-Tracking im Zusammenspiel getestet, keine Konflikte oder Fehler gefunden"
  ],
  "2.11.3": [
    "Kalender-Bildschirm gründlich durchgeprüft: Monatsnavigation, alle zehn Bereiche, Zusammenspiel von Ruhetag/Krankheit/Urlaub/Streak-Freeze im Stresstest bestätigt – keine Fehler gefunden"
  ],
  "2.11.2": [
    "Home-Bildschirm gründlich durchgeprüft: alle zwölf Bereiche einzeln getestet",
    "Fehlerbehebung: 'Wochenfortschritt' zeigte verwirrend '0/0 Einheiten' ohne gesetztes Wochenziel, jetzt klarer Hinweis 'kein Ziel gesetzt'"
  ],
  "2.11.1": [
    "Trainings-Bildschirm neu gruppiert: klare Überschriften für 'Programme starten', 'Manuell erfassen' und 'Verlauf & Statistik' statt 13 unsortierter Karten hintereinander",
    "Fehlerbehebung: eine versehentliche Korrektur an einer bereits funktionierenden Stelle rückgängig gemacht (Kalorien-Kacheln in Kalender/Fitness)",
    "Systematische Durchsicht auf gleichartige Programmfehler wie zuletzt gefunden – keine weiteren entdeckt"
  ],
  "2.11.0": [
    "Neue Funktion: Lauf live tracken mit echtem GPS – Distanz, Tempo, Zeit und Kalorien in Echtzeit, plus Herzfrequenz, falls dein Bluetooth-Brustgurt gekoppelt ist",
    "Automatische Kilometer-Splits, einfache Streckenzeichnung und Speicherung wie eine importierte Aktivität",
    "'Was ist neu' zeigt wieder nur die Änderungen der jeweils neuesten Version"
  ],
  "2.10.0": [
    "Sprach-Eingabe fürs Gym-Training: Gewicht und Wiederholungen per Zuruf eintragen (z. B. '50 Kilo, 10 Wiederholungen'), Mikrofon-Knopf direkt an jedem Satz"
  ],
  "2.9.0": [
    "Eigene Übungen fürs Bodyweight-Training: anlegen unter Einstellungen → Ziel & Training, einsetzbar über den bestehenden Tauschen-Dialog",
    "Eigene Übungen fürs Gym-Training: direkt aus der Suche heraus anlegen, wenn nichts Passendes gefunden wird",
    "Bewegung reduzieren: neuer Schalter gegen Antipp- und Übergangsanimationen",
    "Fehlerbehebung: 'Was ist neu' zeigte nur die letzte statt aller übersprungenen Versionen, stand außerdem viel zu weit unten",
    "Fehlerbehebung: Akzentfarbe im 'Modern'-Design sprang nach jedem Neuladen auf Orange zurück"
  ],
  "2.8.0": [
    "Neue Funktion: App aktualisiert sich selbst – unter Einstellungen → Cloud-Sync die neue Trainingsblog-Datei auswählen und direkt zu GitHub hochladen, ganz ohne die GitHub-Website selbst zu öffnen",
    "Nutzt denselben Zugriffsschlüssel und dasselbe Repository wie die bestehende Cloud-Sicherung"
  ],
  "2.7.0": [
    "Gym-Training: Suchfunktion für 70 statt nur 6 Übungen – oben im Gym-Bildschirm nach weiteren Übungen suchen und direkt zur laufenden Einheit hinzufügen",
    "Zusätzlich hinzugefügte Übungen sind pro Einheit wieder entfernbar, die sechs Basis-Geräte bleiben immer bestehen",
    "Ab sofort heißt die ausgelieferte Datei 'index.html' statt 'Trainingsblog.html' – kein Umbenennen mehr vor dem Hochladen zu GitHub nötig"
  ],
  "2.6.3": [
    "Gym-Training: echter Scroll-Fehler behoben, durch den man nicht bis zu den unteren Übungen (z. B. Rudern) herunterscrollen konnte",
    "Neue Fortschrittsanzeige oben im Gym-Training ('X von 6 Übungen begonnen')"
  ],
  "2.6.2": [
    "Herzfrequenz-Brustgurt: Kopplung jetzt zentral in Einstellungen → Verhalten, nicht mehr nur im laufenden Training – einmal gekoppelt, ist der Gurt beim nächsten Training bereits automatisch verbunden",
    "Zusätzliche Akkustand-Anzeige des Brustgurts (z. B. Polar H10) direkt in den Einstellungen"
  ],
  "2.6.1": [
    "Rundum-Startknopf im 'Modern'-Design wieder entfernt – war zu aufdringlich, ständig im Weg",
    "Performance-Fix fürs 'Modern'-Design: schwerer Weichzeichner-Effekt auf allen Karten entfernt, der auf dem Handy zu Rucklern führte – gleiche Optik, jetzt spürbar flüssiger"
  ],
  "2.6.0": [
    "Neues Gym-Modul: Geräte-Krafttraining mit sechs Ganzkörper-Maschinen (Brustpresse, Latzug, Beinpresse, Beinbeuger, Schulterpresse, Rudern)",
    "Sätze, Wiederholungen und Gewicht (kg) selbst eintragen, automatischer Pausen-Timer, Vergleich zum letzten Mal, Gesamttonnage-Berechnung",
    "Neues 'Modern'-Design zum Umschalten in den Einstellungen: Glasmorphismus-Karten, vier wählbare Akzentfarben, dominanter Rundum-Startknopf – bestehendes Design bleibt vollständig erhalten",
    "Zwei neue Einstellungen fürs Gym-Training: Pausenzeit-Regler, Warm-up-Sätze-Schalter"
  ],
  "2.5.0": [
    "Premium-PDF-Trainingsbericht mit freier Zeitraum-Auswahl, redaktionell gestaltetes Druck-Layout",
    "RPE-Slider nach dem Training zur Erfassung der gefühlten Anstrengung",
    "Streak-Freeze: monatlich ein Joker gegen unverschuldet verpasste Trainingstage",
    "Wetter-Warnbanner bei Hitze, Kälte oder Gewitter",
    "Adaptive Trainingsvorschläge bei niedriger Bereitschaft (Nur Dehnen, Weniger Runden, Ruhetag)",
    "App-Shortcuts fürs Homescreen-Icon (Training, Kalender, Fitness) über ein vollständiges Web-App-Manifest",
    "Jahresrückblick ('Wrapped') mit Trainingstagen, Kilometern, Lieblingsübung und mehr",
    "Erfolge direkt über das native Teilen-Menü des Geräts teilbar",
    "Sperrbildschirm-Steuerung: Übungsname und Play/Pause/Weiter/Zurück auch bei gesperrtem Bildschirm",
    "Kopplung eines Bluetooth-Herzfrequenz-Brustgurts mit Live-Anzeige während des Trainings",
    "Timer als Bild-im-Bild-Fenster, läuft auch beim Wechsel in eine andere App weiter"
  ],
  "2.4.0": [
    "Sechs neue Einstellungen für noch mehr persönliche Anpassung: Klangfarbe, Vibrationsmuster, Countdown-Piepser separat schaltbar",
    "Neue Sprachausgabe: liest Übungsnamen beim Training laut vor (browserintern, ohne Internet)",
    "Start-Bildschirm frei wählbar: welcher Tab beim Öffnen der App zuerst zu sehen ist",
    "Eigene Zitate für den 'Impuls des Tages' hinzufügbar"
  ],
  "2.3.0": [
    "Neue Funktion 'Urlaub': im Kalender einen Zeitraum festlegen, in dem feste 'schon trainiert'-Wochentage nicht gelten – normales Training läuft in dieser Zeit ganz regulär weiter",
    "Bereiche-System deutlich ausgebaut: Startseite, Kalender, Training und Analyse haben jetzt jeweils mindestens 10 einzeln ein-/ausblendbare und verschiebbare Bereiche (vorher teils nur 3-4)"
  ],
  "2.2.0": [
    "Cloud-Sicherung grundlegend vereinfacht: ersetzt die Datei im Repository jetzt einfach, ohne Nachfragen oder 'veraltet'-Meldung",
    "Echte Fehlerursachen werden jetzt korrekt angezeigt (z. B. fehlende Schreibrechte) statt pauschal als veraltete Version missgedeutet",
    "Neue Teilen-Funktion für die Sicherung: direkt ans Teilen-Menü des Geräts übergeben (Google Drive, WhatsApp, E-Mail) als Alternative zu GitHub",
    "Alle 360 Übungen jetzt lückenlos mit ausführlicher 1:1-Erklärung"
  ],
  "2.1.1": [
    "Cloud-Sicherung: die fälschliche Meldung 'neuere Version im Repository' sollte jetzt endgültig verschwunden sein – die Ursache war eine möglicherweise veraltete, zwischengespeicherte Antwort beim Prüfen des aktuellen Stands, jetzt wird das konsequent umgangen"
  ],
  "2.1.0": [
    "Ausführliche, recherchierte Erklärungen jetzt auch für alle 240 Übungen in Muskelaufbau und Abnehmen",
    "Cloud-Sicherung noch robuster: gleicht Schreibkonflikte jetzt mehrfach automatisch aus, praktisch kein Fehlschlag mehr möglich",
    "Systemweite Versionsnummer wird ab sofort bei jeder Änderung konsequent hochgezählt"
  ],
  "2.0.0": [
    "Komplettes Widget-System: jede Seite frei anpassbar, Bereiche und Kacheln ein-/ausblendbar und in der Reihenfolge änderbar",
    "Neues Krankheits-Feature: Aktivierung im Kalender, tägliche Nachfrage, leichtes Dehnprogramm, Kranktage-Zähler",
    "Sicherheits-Umbau: Passphrase statt PIN, Zugangsdaten nur noch sitzungsgebunden, höhere Verschlüsselungsstärke, Content-Security-Policy",
    "Ausführlichere, recherchierte Erklärungen zu allen Übungen",
    "Zahlreiche neue Einstellungsmöglichkeiten und Detailverbesserungen"
  ],
  "1.3.0": [
    "Einstellungen komplett neu geordnet, durchsuchbar und mit Icons versehen",
    "App-Name, Schriftgröße, kcal/kJ, Tonfall, Start-Kategorie und mehr einstellbar",
    "Ruhetage jetzt auch für die Zukunft im Kalender planbar",
    "Persönliche Rekorde, Abzeichen und ein automatischer Wochenrückblick",
    "Sicherung und Cloud-Sync jetzt an einem Ort unter Cloud-Sync"
  ]
};
var GOALS = ["erhalt", "aufbau", "abnehmen"];
var GOAL_LABEL = {
  erhalt:  "Muskelerhalt",
  aufbau:  "Muskelaufbau",
  abnehmen:"Abnehmen"
};
var GOAL_DESC = {
  erhalt:  "Ausgewogener Ganzkörper-Zirkel. Hält Kraft und Beweglichkeit mit moderatem Aufwand.",
  aufbau:  "Langsame Tempi, Pausen unter Spannung und schwerere Varianten, drei Runden. Entscheidend: nah ans Muskelversagen gehen und die Varianten steigern – etwa 10 harte Sätze pro Muskelgruppe und Woche.",
  abnehmen:"Verkettete Ganzkörperbewegungen mit hohem Tempo und kurzen Pausen. Ehrlich gesagt: Abnehmen entscheidet sich vor allem über die Ernährung – das Training erhält die Muskeln und stärkt Ausdauer und Gesundheit."
};
/* Voreinstellungen je Ziel – Erhalt/Abnehmen 10–15 Minuten; Aufbau mit drei Runden etwas länger,
   weil Muskelaufbau vor allem vom wöchentlichen Volumen abhängt (Schoenfeld, Ogborn & Krieger 2017) */
var GOAL_PRESET = {
  erhalt:   {rounds:2, workSec:40, restSec:15, roundRestSec:40},
  aufbau:   {rounds:3, workSec:40, restSec:25, roundRestSec:45},
  abnehmen: {rounds:3, workSec:30, restSec:10, roundRestSec:30}
};
var POOLS = {};
function registerPool(goal, list){
  POOLS[goal] = list;
  POOL_BY_GROUP[goal] = null;
  ORDER_CACHE = {};
}
function poolFor(goal){ return POOLS[goal] || POOLS.erhalt; }
function allExercises(){
  var out = [];
  GOALS.forEach(function(g){ if (POOLS[g]) out = out.concat(POOLS[g]); });
  return out;
}
/* Eigene, vom Nutzer angelegte Übungen. Bewusst NICHT Teil der
   POOLS/GOALS-Rotation (die bleibt unverändert, exakt wie ausgiebig
   getestet) – eigene Übungen lassen sich stattdessen über die
   bestehende Tausch-Funktion für einen Tag einsetzen. */
var CUSTOM_EXERCISES = [];
function setCustomExercises(list){ CUSTOM_EXERCISES = Array.isArray(list) ? list : []; }
function exerciseById(id){
  var all = allExercises();
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  for (var j = 0; j < CUSTOM_EXERCISES.length; j++) if (CUSTOM_EXERCISES[j].id === id) return CUSTOM_EXERCISES[j];
  return null;
}

/* ============================================================
   MET-KLASSIFIZIERUNG PRO ÜBUNG (für genauere Kalorienschätzung)
   Statt einen einzigen pauschalen MET-Wert für ein ganzes Training
   anzunehmen, bekommt jede Übung anhand ihrer tatsächlichen
   Bewegungsart eine eigene, am "Compendium of Physical Activities"
   (Ainsworth et al.) orientierte MET-Kategorie zugeordnet:
   - Dehnen/Halten ohne Anspannung          → 2.5 MET
   - Isometrisches Halten unter Spannung     → 3.8 MET
   - Gerätekrafttraining (Gym, mit Pausen)   → 4.0 MET
   - Übliches, kontrolliertes Bodyweight-
     Krafttraining (Standardfall)            → 4.5 MET
   - Dynamische Mobilität/Vorbereitung
     (z. B. Rodeln-Programm)                 → 5.5 MET
   - Explosiv/plyometrisch oder als "Cardio"
     eingeordnet, hohe Herzfrequenz          → 8.0 MET
   Die Einordnung erfolgt über ID-Bereich (Dehnen/Rodeln/Gym haben
   jeweils eigene, feste ID-Räume), Muskelgruppe und Schlüsselwörter
   in Name/Beschreibung – nicht durch frei erfundene Einzelwerte je
   Übungsname, da selbst das Compendium selbst nach Kategorien und
   nicht nach jeder denkbaren Übungsvariante unterscheidet.
   ============================================================ */
var MET_EXPLOSIVE_RE = /sprung|sprünge|springt|hüpf|jump|explosiv|burpee|hopp|skater|plyo/i;
var MET_HOLD_RE = /halten?|hold|isometrisch|wandsitz|plank|unterarmstütz|statisch/i;
function findInPool(pool, id){
  if (!pool) return null;
  for (var i = 0; i < pool.length; i++) if (pool[i].id === id) return pool[i];
  return null;
}
function metForExercise(ex){
  if (!ex) return 4.5;
  var id = ex.id;
  // Dehnen (STRETCHES, IDs 3001–3120): reine Beweglichkeit, kein Kraftaufwand
  if (typeof id === "number" && id >= 3000 && id < 4000) return 2.5;
  // Rodeln-Vorbereitung (IDs 4001+): durchgehende, dynamische Ganzkörperbewegung
  if (typeof id === "number" && id >= 4000 && id < 5000) return 5.5;
  // Gym-Gerätetraining (string-IDs wie "brustpresse" oder eigene "custom_gym_..."):
  // Krafttraining mit Pausen zwischen den Sätzen, moderate Dauerbelastung
  if (typeof id === "string") return 4.0;
  // Explizit als Cardio eingeordnete oder explosive/plyometrische Bodyweight-Übungen
  if (ex.g === "cardio") return 7.5;
  var text = ((ex.n || "") + " " + (ex.c || "")).toLowerCase();
  if (MET_EXPLOSIVE_RE.test(text)) return 8.0;
  if (MET_HOLD_RE.test(text) || ex.m === "time") return 3.8;
  return 4.5;
}
/* Übungs-Objekt zu einer ID finden – sucht zusätzlich zu den normalen
   Trainings-Pools auch in Dehnen und Rodeln, da deren Übungs-IDs ebenfalls
   für die Kalorienschätzung aufgelöst werden müssen. Bewusst NICHT über
   exerciseById() gelöst, um dessen (an vielen Stellen genutzte und
   ausgiebig getestete) Suche nicht durch zusätzliche Pools zu verändern. */
function findExerciseForMet(id){
  var direct = exerciseById(id);
  if (direct) return direct;
  var wk = root.WK;
  if (!wk) return null;
  return findInPool(wk.STRETCHES, id) || findInPool(wk.RODELN, id) || (wk.gymExerciseById ? wk.gymExerciseById(id) : null);
}
/* Zeitgewichteter Durchschnitts-MET-Wert über eine Liste von Übungs-IDs,
   z. B. für ein tatsächlich absolviertes Tagestraining. Übungen mit
   Zeit-Modus zählen mit ihrer Zielzeit, Wiederholungs-Übungen pauschal
   mit 35 Sekunden (typische Ausführungszeit), damit längere/kürzere
   Übungen im Schnitt richtig gewichtet werden statt alle gleich zu zählen. */
function avgMetForExerciseIds(ids){
  if (!ids || !ids.length) return null;
  var totalW = 0, totalMet = 0;
  ids.forEach(function(id){
    // String-IDs sind immer Gym-Übungen (auch eigene, nicht im Kern bekannte) –
    // die bekommen ohnehin pauschal den Gym-MET-Wert, eine volle Objektsuche
    // ist dafür nicht nötig.
    if (typeof id === "string"){
      totalW += 35; totalMet += 4.0 * 35;
      return;
    }
    var ex = findExerciseForMet(id);
    if (!ex) return;
    var w = ex.m === "time" ? (ex.v || 30) : 35;
    totalW += w;
    totalMet += metForExercise(ex) * w;
  });
  return totalW > 0 ? (totalMet / totalW) : null;
}

/* Aufwärmen & Cool-down (rotieren ebenfalls) */
var WARMUP = [
  {n:"Lockeres Auf-der-Stelle-Gehen", c:"Arme mitschwingen, Puls sanft hochfahren."},
  {n:"Armkreisen & Hüftkreisen",      c:"Große Kreise, erst Arme, dann Hüfte."},
  {n:"Hampelmänner locker",           c:"Ruhiges Tempo, nur zum Warmwerden."},
  {n:"Ausfallschritt mit Drehung",    c:"Im Wechsel, dabei zum vorderen Knie drehen."},
  {n:"Katze-Kuh & Rumpfdrehen",       c:"Wirbelsäule mobilisieren, langsam atmen."},
  {n:"Kniebeugen ohne Tempo",         c:"Tief und langsam, Gelenke aufwärmen."}
];
var COOLDOWN = [
  {n:"Oberschenkel & Waden dehnen",   c:"Jede Seite ruhig halten, nicht wippen."},
  {n:"Brust- & Schulterdehnung",      c:"Am Türrahmen öffnen, tief atmen."},
  {n:"Kindhaltung & Rückendehnung",   c:"Lang machen, Schultern sinken lassen."},
  {n:"Hüftbeuger dehnen",             c:"Im Ausfallschritt Becken nach vorn schieben."},
  {n:"Nacken lockern",                c:"Kopf sanft zur Seite neigen, Schultern tief."},
  {n:"Beinrückseite dehnen",          c:"Beine gestreckt, Oberkörper locker vorbeugen."}
];

/* ---------- 2. Deterministischer Zufall (gleicher Plan auf jedem Gerät) ---------- */
function hash32(str){
  var h = 2166136261;
  for (var i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed){
  var s = seed >>> 0;
  return function(){
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}
function shuffled(arr, seedStr){
  var a = arr.slice(), r = rng(hash32(seedStr) || 1);
  for (var i=a.length-1;i>0;i--){
    var j = Math.floor(r() * (i+1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* ---------- 3. Datums-Helfer ---------- */
var START_YEAR = 2026, END_YEAR = 2031;
var MS_DAY = 86400000;
function ymd(d){
  var m = String(d.getMonth()+1).padStart(2,"0");
  var day = String(d.getDate()).padStart(2,"0");
  return d.getFullYear()+"-"+m+"-"+day;
}
function parseYmd(s){
  var p = String(s).split("-");
  return new Date(Number(p[0]), Number(p[1])-1, Number(p[2]));
}
function dayIndex(dateStr){
  var d = parseYmd(dateStr);
  var start = new Date(START_YEAR,0,1);
  return Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()) -
                     Date.UTC(start.getFullYear(),start.getMonth(),start.getDate())) / MS_DAY);
}
function addDays(dateStr, n){
  var d = parseYmd(dateStr);
  d.setDate(d.getDate()+n);
  return ymd(d);
}
function inRange(dateStr){
  var y = parseYmd(dateStr).getFullYear();
  return y >= START_YEAR && y <= END_YEAR;
}

/* ---------- 4. Einstellungen ---------- */
var DEFAULT_SETTINGS = {
  name: "",
  goal: "erhalt",         // erhalt | aufbau | abnehmen
  running: true,          // Laufeinheiten überhaupt einplanen?
  level: "normal",        // leicht | normal | hart
  rounds: 2,              // 2 oder 3
  workSec: 40,            // Grunddauer je Übung
  restSec: 15,            // Pause zwischen Übungen
  roundRestSec: 40,       // Pause zwischen Runden
  warmup: true,
  cooldown: true,
  runWeekday: 0,          // Altbestand, wird auf runDays gespiegelt
  runMode: "fest",        // fest | variabel
  runDays: [0],           // fester Rhythmus: Wochentage
  runPlan: {},            // variabel: { "YYYY-MM-DD" (Montag): [Datum, ...] }
  runDistance: 5,         // Standarddistanz in km
  runDistanceCustom: null,// benutzerdefinierte Distanz in km, überschreibt runDistance wenn gesetzt
  basePaceSec: 390,       // 6:30 min/km als Startwert
  restDays: [],           // feste wöchentliche Ruhetage (0=So … 6=Sa), hat Vorrang vor allem anderen
  trainedDays: [],        // feste Wochentage "schon trainiert" (extern) – zählt als Training, nicht als Erholung
  sound: true,
  vibrate: true,
  keepAwake: true,
  theme: "dark",
  reminder: "",           // "HH:MM" oder leer
  cleared: false          // Freigabefragen zu Beginn beantwortet?
};
var LEVEL_FACTOR = { leicht: 0.75, normal: 1, hart: 1.25 };

function normalizeSettings(s){
  var out = {};
  for (var k in DEFAULT_SETTINGS) out[k] = DEFAULT_SETTINGS[k];
  if (s && typeof s === "object"){
    for (var j in s) if (Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, j)) out[j] = s[j];
  }
  out.rounds = Math.min(3, Math.max(1, Number(out.rounds) || 2));
  out.workSec = Math.min(60, Math.max(20, Number(out.workSec) || 40));
  out.restSec = Math.min(45, Math.max(5, Number(out.restSec) || 15));
  out.roundRestSec = Math.min(90, Math.max(10, Number(out.roundRestSec) || 40));
  out.runDistance = [5,10,15].indexOf(Number(out.runDistance)) >= 0 ? Number(out.runDistance) : 5;
  if (out.runDistanceCustom != null){
    var rc = Number(out.runDistanceCustom);
    out.runDistanceCustom = (rc > 0 && rc <= 200) ? Math.round(rc*10)/10 : null;
  }
  if (!Array.isArray(out.restDays)) out.restDays = [];
  out.restDays = out.restDays.map(Number).filter(function(d){ return d >= 0 && d <= 6; })
                 .filter(function(d,i,a){ return a.indexOf(d) === i; }).sort();
  if (!Array.isArray(out.trainedDays)) out.trainedDays = [];
  out.trainedDays = out.trainedDays.map(Number).filter(function(d){ return d >= 0 && d <= 6; })
                 .filter(function(d,i,a){ return a.indexOf(d) === i; }).sort();
  out.cleared = !!out.cleared;
  out.basePaceSec = Math.min(900, Math.max(180, Number(out.basePaceSec) || 390));
  if (!LEVEL_FACTOR[out.level]) out.level = "normal";
  if (GOALS.indexOf(out.goal) === -1) out.goal = "erhalt";
  out.running = (out.running !== false);
  out.runWeekday = Math.min(6, Math.max(0, Number(out.runWeekday) || 0));
  if (out.runMode !== "variabel") out.runMode = "fest";
  var hadDays = s && Object.prototype.hasOwnProperty.call(s, "runDays") && Array.isArray(s.runDays) && s.runDays.length;
  if (!hadDays){
    // Altbestand oder Kurzform: aus runWeekday ableiten
    out.runDays = [Number(out.runWeekday) || 0];
  }
  if (!Array.isArray(out.runDays) || !out.runDays.length) out.runDays = [out.runWeekday];
  out.runDays = out.runDays.map(Number).filter(function(d){ return d >= 0 && d <= 6; })
                 .filter(function(d,i,a){ return a.indexOf(d) === i; }).sort();
  if (!out.runDays.length) out.runDays = [0];
  if (!out.runPlan || typeof out.runPlan !== "object") out.runPlan = {};
  return out;
}

/* ---------- 5. Tagesplan ---------- */
var POOL_BY_GROUP = {};
function groupPool(goal, g){
  if (!POOL_BY_GROUP[goal]){
    var map = {};
    GROUPS.forEach(function(x){ map[x] = []; });
    poolFor(goal).forEach(function(e){ if (map[e.g]) map[e.g].push(e); });
    POOL_BY_GROUP[goal] = map;
  }
  return POOL_BY_GROUP[goal][g] || [];
}

/* Wählt für eine Gruppe die Übung des Tages: jede Übung kommt einmal pro
   Zyklus dran, die Reihenfolge wird pro Zyklus neu gemischt. Damit an der
   Zyklusgrenze nichts dicht hintereinander auftaucht, werden die ersten
   Plätze eines Zyklus mit dem Ende des Vorzyklus abgeglichen. Die letzten
   drei Plätze bleiben dabei unangetastet – sonst wäre der Abgleich zirkulär. */
var ORDER_CACHE = {};
function cycleOrder(goal, g, cycle){
  var key = goal + "|" + g + "#" + cycle;
  if (ORDER_CACHE[key]) return ORDER_CACHE[key];
  var pool = groupPool(goal, g), n = pool.length;
  var raw = shuffled(pool, key);
  var prev = shuffled(pool, goal + "|" + g + "#" + (cycle - 1));
  var tail = prev.slice(n - 3).map(function(e){ return e.id; });
  for (var i = 0; i < 3 && i < n; i++){
    if (tail.indexOf(raw[i].id) === -1) continue;
    for (var j = 3; j < n - 3; j++){
      if (tail.indexOf(raw[j].id) === -1){
        var t = raw[i]; raw[i] = raw[j]; raw[j] = t;
        break;
      }
    }
  }
  ORDER_CACHE[key] = raw;
  return raw;
}
function pickForGroup(g, idx, offset, goal){
  goal = goal || "erhalt";
  var n = groupPool(goal, g).length;
  if (!n) return null;
  var i = idx + (offset || 0);
  var cycle = Math.floor(i / n);
  var pos = ((i % n) + n) % n;
  return cycleOrder(goal, g, cycle)[pos];
}

function weekMonday(dateStr){
  var d = parseYmd(dateStr);
  return addDays(dateStr, -((d.getDay() + 6) % 7));
}
function effectiveRunDistance(settings){
  var s = normalizeSettings(settings);
  return s.runDistanceCustom != null ? s.runDistanceCustom : s.runDistance;
}
function isFixedRestDay(dateStr, settings){
  var s = normalizeSettings(settings);
  return s.restDays.indexOf(parseYmd(dateStr).getDay()) >= 0;
}
function isFixedTrainedDay(dateStr, settings){
  var s = normalizeSettings(settings);
  if (isFixedRestDay(dateStr, s)) return false; // Ruhetag hat Vorrang
  return s.trainedDays.indexOf(parseYmd(dateStr).getDay()) >= 0;
}
function isRunDay(dateStr, settings){
  var s = normalizeSettings(settings);
  if (!s.running) return false;
  if (isFixedRestDay(dateStr, s)) return false; // Ruhetag hat Vorrang vor Lauftag
  if (s.runMode === "variabel"){
    var list = s.runPlan[weekMonday(dateStr)];
    return Array.isArray(list) && list.indexOf(dateStr) >= 0;
  }
  return s.runDays.indexOf(parseYmd(dateStr).getDay()) >= 0;
}

/* Belastung über die Woche etwas glätten: zu harte Tage bekommen eine
   leichtere Cardio-Übung, zu leichte Tage eine kräftigere. */
function balance(list, g, idx, goal){
  var load = list.reduce(function(a,e){ return a + e.l; }, 0);
  if (load <= 15 && load >= 9) return list;
  var off = 1, tries = 0;
  while (tries < 12){
    var alt = pickForGroup(g, idx, off, goal);
    var newLoad = load - list[list.length-1].l + alt.l;
    if (newLoad <= 15 && newLoad >= 9){ list[list.length-1] = alt; return list; }
    off++; tries++;
  }
  return list;
}

function planForDate(dateStr, settings){
  var s = normalizeSettings(settings);
  var idx = dayIndex(dateStr);
  var goal = s.goal;
  var list = GROUPS.map(function(g){ return pickForGroup(g, idx, 0, goal); }).filter(Boolean);
  if (list.length) list = balance(list, "cardio", idx, goal);
  var f = LEVEL_FACTOR[s.level];
  var exercises = list.map(function(e){
    var item = {
      id: e.id, g: e.g, n: e.n, c: e.c, m: e.m, side: !!e.s, l: e.l,
      groupLabel: GROUP_LABEL[e.g]
    };
    if (e.m === "reps"){
      item.reps = Math.max(4, Math.round(e.v * f));
      item.dur  = Math.round(s.workSec * (s.level === "hart" ? 1.15 : s.level === "leicht" ? 0.85 : 1));
    } else {
      item.dur = Math.max(15, Math.round(e.v * (s.workSec / 40) * (f === 1 ? 1 : (f + 1) / 2)));
    }
    return item;
  });
  return {
    date: dateStr,
    weekday: parseYmd(dateStr).getDay(),
    run: isRunDay(dateStr, s),
    warmup: WARMUP[idx % WARMUP.length],
    cooldown: COOLDOWN[(idx + 3) % COOLDOWN.length],
    exercises: exercises,
    goal: goal,
    goalLabel: GOAL_LABEL[goal],
    focus: list.length ? GROUP_LABEL[list[idx % list.length].g] : ""
  };
}

/* Baut die abspielbare Abfolge (Übung / Pause / Rundenpause) */
function buildSequence(plan, settings){
  var s = normalizeSettings(settings);
  var seq = [];
  if (s.warmup){
    seq.push({type:"warmup", name:"Aufwärmen: "+plan.warmup.n, cue:plan.warmup.c, dur:60, round:0});
  }
  for (var r=1; r<=s.rounds; r++){
    plan.exercises.forEach(function(ex, i){
      seq.push({
        type:"work", name:ex.n, cue:ex.c, dur:ex.dur, round:r,
        mode:ex.m, reps:ex.reps, side:ex.side, group:ex.g,
        groupLabel:ex.groupLabel, exIndex:i+1, exTotal:plan.exercises.length, exId:ex.id
      });
      if (i < plan.exercises.length - 1){
        seq.push({type:"rest", name:"Pause", cue:"Kurz durchatmen, Position wechseln.", dur:s.restSec, round:r});
      }
    });
    if (r < s.rounds){
      seq.push({type:"roundrest", name:"Rundenpause", cue:"Trinken, locker ausschütteln.", dur:s.roundRestSec, round:r});
    }
  }
  if (s.cooldown){
    seq.push({type:"cooldown", name:"Cool-down: "+plan.cooldown.n, cue:plan.cooldown.c, dur:60, round:s.rounds});
  }
  return seq;
}
function sequenceDuration(seq){
  return seq.reduce(function(a,b){ return a + b.dur; }, 0);
}

/* ---------- 6. Streak & Verlauf ---------- */
function isDone(log, dateStr){
  var e = log[dateStr];
  return !!(e && e.done);
}
function currentStreak(log, todayStr, frozenDays){
  frozenDays = frozenDays || {};
  var d = todayStr, n = 0;
  if (!isDone(log, d) && !frozenDays[d]) d = addDays(d, -1);
  while (isDone(log, d) || frozenDays[d]){ n++; d = addDays(d, -1); }
  return n;
}
function longestStreak(log, frozenDays){
  frozenDays = frozenDays || {};
  var doneKeys = Object.keys(log).filter(function(k){ return log[k] && log[k].done; });
  var frozenKeys = Object.keys(frozenDays).filter(function(k){ return frozenDays[k]; });
  var keys = doneKeys.concat(frozenKeys).filter(function(k,i,a){ return a.indexOf(k) === i; }).sort();
  var best = 0, run = 0, prev = null;
  keys.forEach(function(k){
    if (prev && addDays(prev, 1) === k) run++; else run = 1;
    if (run > best) best = run;
    prev = k;
  });
  return best;
}
function doneInLastDays(log, todayStr, days){
  var n = 0;
  for (var i=0;i<days;i++) if (isDone(log, addDays(todayStr, -i))) n++;
  return n;
}
function groupVolume(log, todayStr, days){
  var vol = {};
  GROUPS.forEach(function(g){ vol[g] = 0; });
  for (var i=0;i<days;i++){
    var e = log[addDays(todayStr, -i)];
    if (e && e.done && Array.isArray(e.groups)) e.groups.forEach(function(g){ if (vol[g] !== undefined) vol[g]++; });
  }
  return vol;
}

/* ---------- 7. Fitness-Auswertung ---------- */
function fitnessScore(log, activities, todayStr){
  var last28 = doneInLastDays(log, todayStr, 28);
  var last7  = doneInLastDays(log, todayStr, 7);
  var streak = currentStreak(log, todayStr);
  var runs = (activities || []).filter(function(a){ return (a.distanceKm || 0) >= 1; });
  var km28 = runs.reduce(function(a,r){
    return a + (dayIndex(todayStr) - dayIndex(r.date) <= 28 && dayIndex(r.date) <= dayIndex(todayStr) ? r.distanceKm : 0);
  }, 0);

  var cKonstanz  = Math.min(40, (last28 / 28) * 40);
  var cWoche     = Math.min(20, (last7 / 7) * 20);
  var cStreak    = Math.min(20, (streak / 30) * 20);
  var cAusdauer  = Math.min(20, (km28 / 40) * 20);
  var score = Math.round(cKonstanz + cWoche + cStreak + cAusdauer);

  var level = score >= 80 ? "Sehr stark"
            : score >= 60 ? "Fortgeschritten"
            : score >= 40 ? "Im Aufbau"
            : score >= 20 ? "Einsteiger"
            : "Startpunkt";
  return {
    score: score, level: level,
    parts: {konstanz:Math.round(cKonstanz), woche:Math.round(cWoche), streak:Math.round(cStreak), ausdauer:Math.round(cAusdauer)},
    last7: last7, last28: last28, streak: streak, km28: Math.round(km28*10)/10
  };
}

/* ---------- 8. Laufzeit-Prognose ---------- */
/* Riegel-Formel: t2 = t1 * (d2/d1)^1.06, angepasst an Trainingszustand. */
function estimateRun(distanceKm, activities, log, todayStr, settings){
  var s = normalizeSettings(settings);
  var runs = (activities || []).filter(function(a){
    return a.distanceKm >= 1.5 && a.durationSec > 0;
  }).sort(function(a,b){ return a.date < b.date ? 1 : -1; }).slice(0, 12);

  var refDist, refTime, quelle;
  if (runs.length){
    var w = 0, sumD = 0, sumT = 0;
    runs.forEach(function(r, i){
      var weight = 1 / (i + 1);
      sumD += r.distanceKm * weight; sumT += r.durationSec * weight; w += weight;
    });
    refDist = sumD / w; refTime = sumT / w;
    quelle = "aus " + runs.length + " importierten Läufen";
  } else {
    refDist = 5; refTime = 5 * s.basePaceSec;
    quelle = "aus deinem Basis-Tempo (Einstellungen)";
  }
  var t = refTime * Math.pow(distanceKm / refDist, 1.06);

  // Trainingszustand: viel Training in den letzten 28 Tagen → etwas schneller
  var f = fitnessScore(log || {}, activities || [], todayStr);
  var adj = 1 - ((f.score - 50) / 100) * 0.12;   // ±6 %
  t = t * Math.max(0.9, Math.min(1.12, adj));

  var pace = t / distanceKm;
  return {
    seconds: Math.round(t),
    paceSec: Math.round(pace),
    source: quelle,
    splits: buildSplits(distanceKm, pace)
  };
}
function buildSplits(distanceKm, paceSec){
  var out = [], acc = 0;
  for (var k=1;k<=Math.floor(distanceKm);k++){
    // leicht negativer Split: hinten etwas schneller
    var f = 1 + (0.02 - 0.04 * (k / Math.max(1, Math.floor(distanceKm))));
    var kmTime = paceSec * f;
    acc += kmTime;
    out.push({km:k, split:Math.round(kmTime), total:Math.round(acc)});
  }
  return out;
}
function fmtTime(sec){
  sec = Math.max(0, Math.round(sec));
  var h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
  return (h ? h+":"+String(m).padStart(2,"0") : String(m)) + ":" + String(s).padStart(2,"0");
}
function fmtPace(sec){
  var m = Math.floor(sec/60), s = Math.round(sec%60);
  if (s === 60){ m++; s = 0; }
  return m + ":" + String(s).padStart(2,"0") + " min/km";
}

/* ---------- 9. Import von Fitness-Dateien (Garmin, Samsung, Apple, Strava …) ---------- */
function haversine(a, b){
  var R = 6371, toRad = Math.PI/180;
  var dLat = (b.lat-a.lat)*toRad, dLon = (b.lon-a.lon)*toRad;
  var la1 = a.lat*toRad, la2 = b.lat*toRad;
  var h = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.sin(dLon/2)*Math.sin(dLon/2)*Math.cos(la1)*Math.cos(la2);
  return 2*R*Math.asin(Math.min(1, Math.sqrt(h)));
}
function num(x){
  if (x === null || x === undefined) return 0;
  var v = parseFloat(String(x).replace(/\s/g,"").replace(",", "."));
  return isFinite(v) ? v : 0;
}
function toDateStr(x){
  if (!x) return null;
  var str = String(x).trim();
  var m = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[1]+"-"+m[2]+"-"+m[3];
  m = str.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/);
  if (m) return m[3]+"-"+String(m[2]).padStart(2,"0")+"-"+String(m[1]).padStart(2,"0");
  var d = new Date(str);
  return isNaN(d.getTime()) ? null : ymd(d);
}
function hmsToSec(x){
  var str = String(x).trim();
  if (/^\d+([.,]\d+)?$/.test(str)) return num(str);
  var p = str.split(":").map(num);
  if (p.length === 3) return p[0]*3600 + p[1]*60 + p[2];
  if (p.length === 2) return p[0]*60 + p[1];
  return 0;
}

function parseGPX(text){
  var pts = [], re = /<trkpt[^>]*lat="([-\d.]+)"[^>]*lon="([-\d.]+)"[^>]*>([\s\S]*?)<\/trkpt>/g, m;
  while ((m = re.exec(text))){
    var t = /<time>([^<]+)<\/time>/.exec(m[3]);
    pts.push({lat:parseFloat(m[1]), lon:parseFloat(m[2]), t: t ? Date.parse(t[1]) : null});
  }
  if (pts.length < 2) return [];
  var dist = 0;
  for (var i=1;i<pts.length;i++) dist += haversine(pts[i-1], pts[i]);
  var t0 = pts[0].t, t1 = pts[pts.length-1].t;
  var dur = (t0 && t1) ? Math.round((t1-t0)/1000) : 0;
  var nameM = /<name>([^<]*)<\/name>/.exec(text);
  return [{
    date: t0 ? ymd(new Date(t0)) : ymd(new Date()),
    name: nameM ? nameM[1] : "Lauf (GPX)",
    type: "Lauf",
    distanceKm: Math.round(dist*100)/100,
    durationSec: dur,
    calories: 0, steps: 0, avgHr: 0, elev: 0, rawType: "Laufen", source: "GPX"
  }];
}
function parseTCX(text){
  var out = [], re = /<Activity[^>]*Sport="?([^">]*)"?[^>]*>([\s\S]*?)<\/Activity>/g, m;
  while ((m = re.exec(text))){
    var body = m[2];
    var dist = 0, dur = 0, cal = 0, hrSum = 0, hrN = 0;
    var lr = /<DistanceMeters>([\d.]+)<\/DistanceMeters>/g, x;
    var lastDist = 0;
    while ((x = lr.exec(body))) lastDist = Math.max(lastDist, parseFloat(x[1]));
    dist = lastDist / 1000;
    var tr = /<TotalTimeSeconds>([\d.]+)<\/TotalTimeSeconds>/g;
    while ((x = tr.exec(body))) dur += parseFloat(x[1]);
    var cr = /<Calories>(\d+)<\/Calories>/g;
    while ((x = cr.exec(body))) cal += parseInt(x[1], 10);
    var hr = /<Value>(\d+)<\/Value>/g;
    while ((x = hr.exec(body))){ hrSum += parseInt(x[1],10); hrN++; }
    var idM = /<Id>([^<]+)<\/Id>/.exec(body);
    out.push({
      date: idM ? (toDateStr(idM[1]) || ymd(new Date())) : ymd(new Date()),
      name: (m[1] || "Training") + " (TCX)",
      type: /run|lauf/i.test(m[1]||"") ? "Lauf" : (m[1] || "Training"),
      distanceKm: Math.round(dist*100)/100,
      durationSec: Math.round(dur), calories: cal,
      steps: 0, avgHr: hrN ? Math.round(hrSum/hrN) : 0, elev: 0,
      rawType: (m[1] || "Training"), source: "TCX"
    });
  }
  return out;
}
function splitCsvLine(line, sep){
  var out = [], cur = "", q = false;
  for (var i=0;i<line.length;i++){
    var ch = line[i];
    if (ch === '"'){ if (q && line[i+1] === '"'){ cur += '"'; i++; } else q = !q; }
    else if (ch === sep && !q){ out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map(function(s){ return s.trim(); });
}
function findCol(headers, patterns){
  for (var p=0;p<patterns.length;p++){
    for (var i=0;i<headers.length;i++){
      if (patterns[p].test(headers[i])) return i;
    }
  }
  return -1;
}
function parseCSV(text){
  var lines = text.split(/\r?\n/).filter(function(l){ return l.trim().length; });
  if (lines.length < 2) return [];
  var sep = (lines[0].split(";").length > lines[0].split(",").length) ? ";" : ",";
  var head = splitCsvLine(lines[0], sep).map(function(h){ return h.toLowerCase(); });
  var iDate = findCol(head, [/datum|date|start|zeitpunkt|day/]);
  var iName = findCol(head, [/titel|title|name|aktivit|activity ?type|sport|typ/]);
  var iDist = findCol(head, [/distanz|distance|strecke|km/]);
  var iDur  = findCol(head, [/zeit|time|dauer|duration/]);
  var iCal  = findCol(head, [/kalorien|calorie|kcal|energie/]);
  var iStep = findCol(head, [/schritt|step/]);
  var iHr   = findCol(head, [/herzfrequenz|heart|puls|hr/]);
  var iElev = findCol(head, [/h(ö|oe)hen|elevation|anstieg|ascent|elev|gain/]);
  var iType = findCol(head, [/aktivit(ä|ae)tstyp|activity ?type|sport|typ$/]);
  if (iDate < 0) return [];
  var out = [];
  for (var r=1;r<lines.length;r++){
    var c = splitCsvLine(lines[r], sep);
    var date = toDateStr(c[iDate]);
    if (!date) continue;
    var dist = iDist >= 0 ? num(c[iDist]) : 0;
    if (dist > 400) dist = dist / 1000;                 // Meter erkannt
    var dur = iDur >= 0 ? hmsToSec(c[iDur]) : 0;
    if (dur > 0 && dur < 60 && dist > 1) dur = dur * 60; // Minuten erkannt
    out.push({
      date: date,
      name: (iName >= 0 && c[iName]) ? c[iName] : "Aktivität",
      type: (iName >= 0 && /lauf|run|jog/i.test(c[iName]||"")) ? "Lauf" : ((iName>=0 && c[iName]) || "Training"),
      distanceKm: Math.round(dist*100)/100,
      durationSec: Math.round(dur),
      calories: iCal >= 0 ? Math.round(num(c[iCal])) : 0,
      steps: iStep >= 0 ? Math.round(num(c[iStep])) : 0,
      avgHr: iHr >= 0 ? Math.round(num(c[iHr])) : 0,
      elev: iElev >= 0 ? Math.round(num(c[iElev])) : 0,
      rawType: (iType >= 0 ? c[iType] : "") || (iName >= 0 ? c[iName] : ""),
      source: "CSV"
    });
  }
  return out;
}
function parseJSONFile(text){
  var data;
  try { data = JSON.parse(text); } catch(e){ return []; }
  if (data && (data.__muskelApp || data.__trainingsblog)) return data;   // eigenes Backup
  var arr = Array.isArray(data) ? data
          : (data && Array.isArray(data.activities)) ? data.activities
          : (data && Array.isArray(data.exercises))  ? data.exercises
          : null;
  if (!arr) return [];
  return arr.map(function(o){
    var dist = num(o.distance != null ? o.distance : (o.distanceKm != null ? o.distanceKm : o.total_distance));
    if (dist > 400) dist = dist/1000;
    var dur = o.duration != null ? hmsToSec(o.duration)
            : o.durationSec != null ? num(o.durationSec)
            : o.elapsed_time != null ? num(o.elapsed_time) : 0;
    if (dur > 100000) dur = dur / 1000;                            // Millisekunden
    return {
      date: toDateStr(o.date || o.start_time || o.startTime || o.start_date || o.day) || ymd(new Date()),
      name: o.name || o.title || o.activityType || "Aktivität",
      type: /run|lauf|jog/i.test(String(o.type || o.sport || o.activityType || o.name || "")) ? "Lauf" : (o.type || o.sport || "Training"),
      distanceKm: Math.round(dist*100)/100,
      durationSec: Math.round(dur),
      calories: Math.round(num(o.calories || o.calorie || o.kcal)),
      steps: Math.round(num(o.steps || o.step_count)),
      avgHr: Math.round(num(o.avgHr || o.average_heartrate || o.heartRate)),
      elev: Math.round(num(o.elev || o.elevation || o.total_elevation_gain)),
      rawType: String(o.type || o.sport || o.activityType || o.name || ""),
      source: "JSON"
    };
  }).filter(function(a){ return a.date; });
}
/* Bereinigt Freitext-Felder aus importierten Dateien (GPX/TCX/CSV/JSON), bevor
   sie überhaupt ins Datenmodell gelangen: HTML-Tags entfernen und Länge
   begrenzen. Die App escaped an allen Stellen, an denen solche Werte
   angezeigt werden, ohnehin schon konsequent (esc()); das hier ist eine
   zusätzliche Verteidigungsebene direkt an der Quelle. */
function sanitizeText(s, maxLen){
  if (typeof s !== "string") return s;
  var out = s.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim();
  return out.slice(0, maxLen || 120);
}
function sanitizeActivity(a){
  if (!a || typeof a !== "object") return a;
  a.name = sanitizeText(a.name, 120) || "Aktivität";
  a.type = sanitizeText(a.type, 60) || "Training";
  a.rawType = sanitizeText(a.rawType, 60);
  a.source = sanitizeText(a.source, 20);
  return a;
}
function parseFitnessFile(filename, text){
  var f = String(filename || "").toLowerCase();
  if (/\.gpx$/.test(f) || /<trkpt/i.test(text)) return {kind:"activities", items: parseGPX(text).map(sanitizeActivity)};
  if (/\.tcx$/.test(f) || /<TrainingCenterDatabase/i.test(text)) return {kind:"activities", items: parseTCX(text).map(sanitizeActivity)};
  if (/\.json$/.test(f) || /^\s*[\[{]/.test(text)){
    var res = parseJSONFile(text);
    if (res && (res.__muskelApp || res.__trainingsblog)) return {kind:"backup", items: res};
    return {kind:"activities", items: (Array.isArray(res) ? res : []).map(sanitizeActivity)};
  }
  if (/\.(csv|tsv|txt)$/.test(f) || text.indexOf(",") >= 0 || text.indexOf(";") >= 0) return {kind:"activities", items: parseCSV(text).map(sanitizeActivity)};
  return {kind:"activities", items: []};
}
function mergeActivities(existing, incoming){
  var map = {};
  (existing||[]).forEach(function(a){ map[a.date+"|"+a.name+"|"+a.distanceKm+"|"+a.durationSec] = a; });
  var added = 0;
  (incoming||[]).forEach(function(a){
    var key = a.date+"|"+a.name+"|"+a.distanceKm+"|"+a.durationSec;
    if (!map[key]){ map[key] = a; added++; }
  });
  var list = Object.keys(map).map(function(k){ return map[k]; })
    .sort(function(a,b){ return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  return {list:list, added:added};
}
function summarizeActivities(activities, todayStr, days){
  var t = dayIndex(todayStr), sum = {sessions:0, km:0, sec:0, cal:0, steps:0, hr:0, hrN:0, runs:0};
  (activities||[]).forEach(function(a){
    var d = dayIndex(a.date);
    if (d > t || t - d >= days) return;
    sum.sessions++; sum.km += a.distanceKm||0; sum.sec += a.durationSec||0;
    sum.cal += a.calories||0; sum.steps += a.steps||0;
    if (a.avgHr){ sum.hr += a.avgHr; sum.hrN++; }
    if ((a.distanceKm||0) >= 1) sum.runs++;
  });
  sum.km = Math.round(sum.km*10)/10;
  sum.avgHr = sum.hrN ? Math.round(sum.hr/sum.hrN) : 0;
  sum.avgPace = sum.km > 0 ? Math.round(sum.sec / sum.km) : 0;
  return sum;
}

registerPool("erhalt", EXERCISES);

/* ---------- Export ---------- */
var API = {
  EXERCISES:EXERCISES, GROUPS:GROUPS, GOALS:GOALS, GOAL_LABEL:GOAL_LABEL,
  GOAL_DESC:GOAL_DESC, GOAL_PRESET:GOAL_PRESET, registerPool:registerPool,
  poolFor:poolFor, groupPool:groupPool, allExercises:allExercises, exerciseById:exerciseById, GROUP_LABEL:GROUP_LABEL, GROUP_COLOR:GROUP_COLOR,
  WARMUP:WARMUP, COOLDOWN:COOLDOWN, DEFAULT_SETTINGS:DEFAULT_SETTINGS, START_YEAR:START_YEAR, END_YEAR:END_YEAR,
  normalizeSettings:normalizeSettings, planForDate:planForDate, buildSequence:buildSequence,
  sequenceDuration:sequenceDuration, isRunDay:isRunDay, pickForGroup:pickForGroup,
  ymd:ymd, parseYmd:parseYmd, weekMonday:weekMonday, addDays:addDays, dayIndex:dayIndex, inRange:inRange,
  APP_VERSION:APP_VERSION,
  CHANGELOG:CHANGELOG,
  effectiveRunDistance:effectiveRunDistance, isFixedRestDay:isFixedRestDay, isFixedTrainedDay:isFixedTrainedDay,
  setCustomExercises:setCustomExercises,
  metForExercise:metForExercise, avgMetForExerciseIds:avgMetForExerciseIds,
  currentStreak:currentStreak, longestStreak:longestStreak, doneInLastDays:doneInLastDays,
  groupVolume:groupVolume, fitnessScore:fitnessScore, estimateRun:estimateRun,
  fmtTime:fmtTime, fmtPace:fmtPace, parseFitnessFile:parseFitnessFile,
  mergeActivities:mergeActivities, summarizeActivities:summarizeActivities,
  parseCSV:parseCSV, parseGPX:parseGPX, parseTCX:parseTCX, parseJSONFile:parseJSONFile
};
root.WK = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;

})(typeof globalThis !== "undefined" ? globalThis : this);
