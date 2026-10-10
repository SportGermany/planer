/* ============================================================
   DEHN- & MOBILITY-BIBLIOTHEK
   120 Übungen. c = Kategorie, t = beanspruchte Muskelgruppen
   (passend zu den Trainingsgruppen), p = SVG-Pose, v = Sekunden.
   ============================================================ */
(function(root){
"use strict";
var W = root.WK;

var STRETCH_CAT = {
  beine:  "Beine & Hüfte",
  ruecken:"Rücken & Wirbelsäule",
  brust:  "Brust & Schultern",
  arme:   "Arme & Handgelenke",
  nacken: "Nacken & Kopf",
  ganz:   "Ganzkörper & Faszien"
};
var STRETCH_CAT_ORDER = ["beine","ruecken","brust","arme","nacken","ganz"];

var STRETCHES = [
  /* ---------- BEINE & HÜFTE (24) ---------- */
  {id:3001,c:"beine",n:"Stehende Vorbeuge",            v:40,t:["beine"],p:"fold",  q:"Knie leicht weich, Oberkörper schwer hängen lassen."},
  {id:3002,c:"beine",n:"Quadrizeps im Stand",          v:35,t:["beine"],p:"quad",  s:true,q:"Ferse zum Po, Knie zeigt nach unten, Becken aufrichten."},
  {id:3003,c:"beine",n:"Beinrückseite im Sitzen",      v:40,t:["beine"],p:"ham",   q:"Beine gestreckt, aus der Hüfte nach vorn klappen."},
  {id:3004,c:"beine",n:"Hüftbeuger im Ausfallschritt", v:40,t:["beine"],p:"hipflex",s:true,q:"Becken nach vorn schieben, Po fest anspannen."},
  {id:3005,c:"beine",n:"Taubenhaltung",                v:45,t:["beine"],p:"pigeon",s:true,q:"Vorderes Schienbein quer, Hüfte gerade nach unten."},
  {id:3006,c:"beine",n:"Wadendehnung an der Wand",     v:35,t:["beine"],p:"calf",  s:true,q:"Ferse am Boden, hinteres Bein gestreckt."},
  {id:3007,c:"beine",n:"Sitzende Waden mit Handtuch",  v:35,t:["beine"],p:"calf",  s:true,q:"Handtuch um den Fußballen, sanft heranziehen."},
  {id:3008,c:"beine",n:"Schmetterling",                v:45,t:["beine"],p:"fold",  q:"Fußsohlen zusammen, Knie sinken lassen."},
  {id:3009,c:"beine",n:"Breite Grätsche sitzend",      v:45,t:["beine"],p:"fold",  q:"Beine weit öffnen, Rücken lang nach vorn."},
  {id:3010,c:"beine",n:"Liegende Beinrückseite",       v:40,t:["beine"],p:"ham",   s:true,q:"Bein senkrecht, anderes bleibt am Boden."},
  {id:3011,c:"beine",n:"Figur 4 im Liegen",            v:40,t:["beine"],p:"pigeon",s:true,q:"Knöchel aufs Knie, den unteren Oberschenkel heranziehen."},
  {id:3012,c:"beine",n:"Adduktoren im Seitausfall",    v:35,t:["beine"],p:"hipflex",s:true,q:"Ein Bein gestreckt, über das andere absinken."},
  {id:3013,c:"beine",n:"Tiefe Hocke halten",           v:45,t:["beine"],p:"child", q:"Fersen möglichst am Boden, Ellbogen drücken die Knie."},
  {id:3014,c:"beine",n:"Stehende Beinrückseite",       v:35,t:["beine"],p:"fold",  s:true,q:"Ferse vorn aufsetzen, Zehen hoch, Hüfte zurück."},
  {id:3015,c:"beine",n:"Quadrizeps im Liegen",         v:40,t:["beine"],p:"quad",  s:true,q:"Seitlage, Ferse zum Po, Becken nicht kippen."},
  {id:3016,c:"beine",n:"Hüftbeuger im Kniestand",      v:45,t:["beine"],p:"hipflex",s:true,q:"Hinteres Knie am Boden, Arm derselben Seite hoch."},
  {id:3017,c:"beine",n:"Wadenheben-Dehnung Stufe",     v:35,t:["beine"],p:"calf",  q:"Fersen über die Stufenkante sinken lassen."},
  {id:3018,c:"beine",n:"Schienbein im Fersensitz",     v:35,t:["beine"],p:"child", q:"Fußrücken am Boden, langsam zurücklehnen."},
  {id:3019,c:"beine",n:"Iliotibialband im Stand",      v:35,t:["beine"],p:"sidebend",s:true,q:"Beine kreuzen, Oberkörper zur Gegenseite neigen."},
  {id:3020,c:"beine",n:"Gesäß im Sitzen",              v:40,t:["beine"],p:"twist", s:true,q:"Fuß über das Knie stellen, sanft gegendrehen."},
  {id:3021,c:"beine",n:"Frosch am Boden",              v:45,t:["beine"],p:"pigeon",q:"Knie weit außen, Unterschenkel parallel, langsam wiegen."},
  {id:3022,c:"beine",n:"Herabschauender Hund",         v:45,t:["beine","ruecken"],p:"fold",q:"Fersen abwechselnd Richtung Boden schieben."},
  {id:3023,c:"beine",n:"Fußgelenk kreisen",            v:30,t:["beine"],p:"wrist", s:true,q:"Große langsame Kreise in beide Richtungen."},
  {id:3024,c:"beine",n:"Beinpendel im Stand",          v:30,t:["beine"],p:"quad",  s:true,q:"Locker vor und zurück schwingen, Rumpf ruhig."},

  /* ---------- RÜCKEN & WIRBELSÄULE (20) ---------- */
  {id:3025,c:"ruecken",n:"Kindhaltung",                v:45,t:["ruecken"],p:"child",q:"Arme lang nach vorn, Stirn ablegen, tief atmen."},
  {id:3026,c:"ruecken",n:"Katze-Kuh langsam",          v:40,t:["ruecken"],p:"catcow",q:"Im Atemrhythmus runden und strecken."},
  {id:3027,c:"ruecken",n:"Liegende Wirbelsäulendrehung",v:45,t:["ruecken"],p:"twist",s:true,q:"Knie zur Seite, Schultern bleiben am Boden."},
  {id:3028,c:"ruecken",n:"Kobra sanft",                v:35,t:["ruecken"],p:"cobra",q:"Ellbogen leicht gebeugt, Schultern tief."},
  {id:3029,c:"ruecken",n:"Fadenöhr",                   v:40,t:["ruecken"],p:"twist",s:true,q:"Arm unter dem Körper durchfädeln, Schulter ablegen."},
  {id:3030,c:"ruecken",n:"Seitneigung im Sitzen",      v:35,t:["ruecken"],p:"sidebend",s:true,q:"Arm über den Kopf, Flanke lang machen."},
  {id:3031,c:"ruecken",n:"Knie zur Brust",             v:40,t:["ruecken"],p:"child",q:"Beide Knie umfassen und sanft heranziehen."},
  {id:3032,c:"ruecken",n:"Sphinx",                     v:40,t:["ruecken"],p:"cobra",q:"Unterarme am Boden, Brust öffnen, Nacken lang."},
  {id:3033,c:"ruecken",n:"Rückenrollen",               v:30,t:["ruecken"],p:"child",q:"Auf dem Rücken sanft vor und zurück wiegen."},
  {id:3034,c:"ruecken",n:"Drehsitz",                   v:40,t:["ruecken"],p:"twist",s:true,q:"Aufrecht sitzen, aus der Brustwirbelsäule drehen."},
  {id:3035,c:"ruecken",n:"Rundrücken im Stand",        v:35,t:["ruecken"],p:"fold",q:"Hände vorstrecken, oberen Rücken bewusst runden."},
  {id:3036,c:"ruecken",n:"Halbmond im Stand",          v:35,t:["ruecken"],p:"sidebend",s:true,q:"Arme über Kopf, zur Seite neigen, Hüfte gegenhalten."},
  {id:3037,c:"ruecken",n:"Beckenkippen im Liegen",     v:35,t:["ruecken"],p:"catcow",q:"Lendenwirbel abwechselnd andrücken und lösen."},
  {id:3038,c:"ruecken",n:"Sitzende Vorbeuge lang",     v:45,t:["ruecken","beine"],p:"fold",q:"Bauch Richtung Oberschenkel, Rücken lang lassen."},
  {id:3039,c:"ruecken",n:"Türrahmen-Hängen",           v:35,t:["ruecken"],p:"chest",q:"An einer stabilen Kante hängen, Schultern lang ziehen."},
  {id:3040,c:"ruecken",n:"Brustwirbel-Extension",      v:35,t:["ruecken"],p:"cobra",q:"Über eine Rolle oder Handtuchrolle nach hinten öffnen."},
  {id:3041,c:"ruecken",n:"Vierfüßler-Rotation",        v:40,t:["ruecken"],p:"twist",s:true,q:"Hand an den Hinterkopf, Ellbogen zur Decke drehen."},
  {id:3042,c:"ruecken",n:"Quadrizeps-Lendenlösung",    v:35,t:["ruecken"],p:"hipflex",s:true,q:"Ausfallschritt mit langem Oberkörper, Becken kippt."},
  {id:3043,c:"ruecken",n:"Nackenzug im Vierfüßler",    v:35,t:["ruecken","nacken"],p:"catcow",q:"Kinn zur Brust, oberen Rücken runden."},
  {id:3044,c:"ruecken",n:"Rückenlage mit Armen lang",  v:40,t:["ruecken"],p:"child",q:"Arme über Kopf strecken, Körper ganz lang machen."},

  /* ---------- BRUST & SCHULTERN (20) ---------- */
  {id:3045,c:"brust",n:"Türrahmen-Brustöffner",        v:40,t:["brust"],p:"chest",s:true,q:"Unterarm am Rahmen, Brust langsam nach vorn drehen."},
  {id:3046,c:"brust",n:"Schulter über Kreuz",          v:35,t:["brust","arme"],p:"shoulder",s:true,q:"Arm vor der Brust, mit dem anderen heranziehen."},
  {id:3047,c:"brust",n:"Hände hinter dem Rücken",      v:35,t:["brust"],p:"chest",q:"Finger verschränken, Brust öffnen, Arme heben."},
  {id:3048,c:"brust",n:"Brustöffner im Liegen",        v:45,t:["brust"],p:"chest",s:true,q:"Bauchlage, ein Arm seitlich, langsam wegdrehen."},
  {id:3049,c:"brust",n:"Schulterkreisen langsam",      v:30,t:["brust"],p:"shoulder",q:"Große Kreise, Schulterblätter mitnehmen."},
  {id:3050,c:"brust",n:"Kuhgesicht-Arme",              v:35,t:["brust","arme"],p:"triceps",s:true,q:"Ein Arm oben, einer unten, hinterm Rücken greifen."},
  {id:3051,c:"brust",n:"Wanddehnung Brust tief",       v:40,t:["brust"],p:"chest",s:true,q:"Hand tief an der Wand, Oberkörper wegdrehen."},
  {id:3052,c:"brust",n:"Wanddehnung Brust hoch",       v:40,t:["brust"],p:"chest",s:true,q:"Hand über Schulterhöhe, sanft eindrehen."},
  {id:3053,c:"brust",n:"Schulterblatt-Retraktion",     v:30,t:["brust","ruecken"],p:"shoulder",q:"Schulterblätter zusammenziehen und halten."},
  {id:3054,c:"brust",n:"Handtuch über Kopf",           v:35,t:["brust"],p:"shoulder",q:"Handtuch breit greifen, über den Kopf nach hinten."},
  {id:3055,c:"brust",n:"Delfin-Unterarmstütz",         v:35,t:["brust","ruecken"],p:"fold",q:"Unterarme am Boden, Brust Richtung Beine schieben."},
  {id:3056,c:"brust",n:"Sitzender Brustöffner",        v:35,t:["brust"],p:"chest",q:"Hände hinter dem Körper aufstützen, Brust hoch."},
  {id:3057,c:"brust",n:"Nacken-Schulter-Zug",          v:35,t:["brust","nacken"],p:"neckside",s:true,q:"Kopf zur Seite, Gegenschulter nach unten ziehen."},
  {id:3058,c:"brust",n:"Arm hinter dem Rücken heben",  v:35,t:["brust"],p:"shoulder",s:true,q:"Handrücken am Rücken, langsam nach oben schieben."},
  {id:3059,c:"brust",n:"Brustöffner im Kniestand",     v:40,t:["brust"],p:"cobra",q:"Hände hinter dem Becken, Brustkorb zur Decke."},
  {id:3060,c:"brust",n:"Wandengel",                    v:35,t:["brust","ruecken"],p:"shoulder",q:"Rücken an der Wand, Arme langsam hoch und runter."},
  {id:3061,c:"brust",n:"Schulterpendel",               v:30,t:["brust"],p:"shoulder",s:true,q:"Vorbeugen, Arm locker kreisen lassen."},
  {id:3062,c:"brust",n:"Ecke-Brustdehnung",            v:40,t:["brust"],p:"chest",q:"In der Zimmerecke beide Unterarme anlegen, vorlehnen."},
  {id:3063,c:"brust",n:"Latissimus am Türrahmen",      v:40,t:["brust","ruecken"],p:"chest",s:true,q:"Seitlich greifen, Hüfte zur Gegenseite schieben."},
  {id:3064,c:"brust",n:"Rotatorenmanschette sanft",    v:35,t:["brust"],p:"shoulder",s:true,q:"Ellbogen am Körper, Unterarm nach außen drehen."},

  /* ---------- ARME & HANDGELENKE (16) ---------- */
  {id:3065,c:"arme",n:"Trizeps über Kopf",             v:35,t:["arme"],p:"triceps",s:true,q:"Ellbogen zur Decke, Hand zwischen die Schulterblätter."},
  {id:3066,c:"arme",n:"Bizeps an der Wand",            v:35,t:["arme"],p:"chest",s:true,q:"Arm gestreckt an die Wand, Körper wegdrehen."},
  {id:3067,c:"arme",n:"Handgelenk nach unten",         v:30,t:["arme"],p:"wrist",s:true,q:"Arm strecken, Finger nach unten ziehen."},
  {id:3068,c:"arme",n:"Handgelenk nach oben",          v:30,t:["arme"],p:"wrist",s:true,q:"Handfläche nach vorn, Finger sanft heranziehen."},
  {id:3069,c:"arme",n:"Handgelenk im Vierfüßler",      v:35,t:["arme"],p:"wrist",q:"Finger zeigen zu den Knien, Gewicht langsam zurück."},
  {id:3070,c:"arme",n:"Unterarm-Beuger im Sitzen",     v:30,t:["arme"],p:"wrist",s:true,q:"Handrücken am Oberschenkel, Handgelenk strecken."},
  {id:3071,c:"arme",n:"Finger einzeln dehnen",         v:30,t:["arme"],p:"wrist",q:"Jeden Finger einzeln sanft nach hinten ziehen."},
  {id:3072,c:"arme",n:"Trizeps am Türrahmen",          v:35,t:["arme"],p:"triceps",s:true,q:"Ellbogen am Rahmen abstützen, Körper nach vorn."},
  {id:3073,c:"arme",n:"Unterarm-Strecker gedreht",     v:30,t:["arme"],p:"wrist",s:true,q:"Arm strecken, Hand nach innen drehen und ziehen."},
  {id:3074,c:"arme",n:"Gebetsposition",                v:35,t:["arme"],p:"wrist",q:"Handflächen vor der Brust, Ellbogen anheben."},
  {id:3075,c:"arme",n:"Umgekehrte Gebetsposition",     v:35,t:["arme"],p:"wrist",q:"Handrücken zusammen, Hände langsam senken."},
  {id:3076,c:"arme",n:"Bizeps hinter dem Rücken",      v:35,t:["arme"],p:"chest",q:"Hände hinter dem Rücken fassen, Arme heben."},
  {id:3077,c:"arme",n:"Ellbogen-Extension",            v:30,t:["arme"],p:"triceps",s:true,q:"Arm ganz strecken, mit der anderen Hand sanft nachhelfen."},
  {id:3078,c:"arme",n:"Handgelenk kreisen",            v:30,t:["arme"],p:"wrist",q:"Beide Handgelenke langsam in beide Richtungen kreisen."},
  {id:3079,c:"arme",n:"Faust öffnen und schließen",    v:30,t:["arme"],p:"wrist",q:"Langsam ganz weit öffnen, dann fest schließen."},
  {id:3080,c:"arme",n:"Schulter-Trizeps-Kombi",        v:40,t:["arme","brust"],p:"triceps",s:true,q:"Trizeps über Kopf und dabei zur Seite neigen."},

  /* ---------- NACKEN & KOPF (16) ---------- */
  {id:3081,c:"nacken",n:"Nacken zur Seite",            v:30,t:["nacken"],p:"neckside",s:true,q:"Ohr zur Schulter, Gegenschulter sinkt."},
  {id:3082,c:"nacken",n:"Kinn zur Brust",              v:30,t:["nacken"],p:"neckside",q:"Kopf langsam senken, Hände nur als Gewicht auflegen."},
  {id:3083,c:"nacken",n:"Diagonale Nackendehnung",     v:30,t:["nacken"],p:"neckside",s:true,q:"Blick zur gegenüberliegenden Achsel."},
  {id:3084,c:"nacken",n:"Nacken-Rotation",             v:30,t:["nacken"],p:"neckside",s:true,q:"Kopf langsam zur Seite drehen und halten."},
  {id:3085,c:"nacken",n:"Kinn zurückziehen",           v:30,t:["nacken"],p:"neckside",q:"Doppelkinn machen, Hinterkopf lang nach oben."},
  {id:3086,c:"nacken",n:"Levator-Dehnung",             v:35,t:["nacken"],p:"neckside",s:true,q:"Blick zur Achsel, gleiche Hand zieht sanft."},
  {id:3087,c:"nacken",n:"Schulterheben und Lösen",     v:30,t:["nacken"],p:"shoulder",q:"Schultern hochziehen, halten, fallen lassen."},
  {id:3088,c:"nacken",n:"Nacken-Isometrie vorn",       v:30,t:["nacken"],p:"neckside",q:"Handfläche an die Stirn, sanft dagegendrücken."},
  {id:3089,c:"nacken",n:"Nacken-Isometrie seitlich",   v:30,t:["nacken"],p:"neckside",s:true,q:"Hand seitlich am Kopf, leichter Gegendruck."},
  {id:3090,c:"nacken",n:"Kiefer lösen",                v:30,t:["nacken"],p:"neckside",q:"Mund leicht öffnen, Zunge am Gaumen, Kiefer locker."},
  {id:3091,c:"nacken",n:"Augen-Nacken-Kopplung",       v:30,t:["nacken"],p:"neckside",q:"Nur die Augen wandern, der Kopf folgt langsam."},
  {id:3092,c:"nacken",n:"Nackenrolle sanft",           v:35,t:["nacken"],p:"neckside",q:"Halbkreis von Schulter zu Schulter, nie nach hinten."},
  {id:3093,c:"nacken",n:"Oberer Trapez im Sitzen",     v:35,t:["nacken"],p:"neckside",s:true,q:"Eine Hand unter den Oberschenkel, Kopf zur Gegenseite."},
  {id:3094,c:"nacken",n:"Brustwirbel-Aufrichtung",     v:30,t:["nacken","ruecken"],p:"cobra",q:"Brustbein heben, Kinn leicht zurück."},
  {id:3095,c:"nacken",n:"Nacken im Liegen",            v:35,t:["nacken"],p:"neckside",q:"Rückenlage, Kopf sanft von Seite zu Seite rollen."},
  {id:3096,c:"nacken",n:"Atemlenkung in den Nacken",   v:40,t:["nacken"],p:"neckside",q:"Ruhig atmen und beim Ausatmen bewusst lösen."},

  /* ---------- GANZKÖRPER & FASZIEN (24) ---------- */
  {id:3097,c:"ganz",n:"Ganzkörperstreckung im Liegen", v:40,t:["ruecken","brust","beine"],p:"child",q:"Arme und Beine maximal lang, dann lösen."},
  {id:3098,c:"ganz",n:"Sonnengruß langsam",            v:45,t:["ruecken","beine","brust"],p:"fold",q:"Fließend durchbewegen, im Atemrhythmus."},
  {id:3099,c:"ganz",n:"Weltbeste Dehnung",             v:45,t:["beine","ruecken","brust"],p:"twist",s:true,q:"Tiefer Ausfallschritt, Ellbogen nach unten, dann aufdrehen."},
  {id:3100,c:"ganz",n:"Eidechse",                      v:45,t:["beine","ruecken"],p:"hipflex",s:true,q:"Beide Hände innen neben dem vorderen Fuß."},
  {id:3101,c:"ganz",n:"Girlande",                      v:45,t:["beine","ruecken"],p:"child",q:"Tiefe Hocke, Handflächen zusammen, Brust auf."},
  {id:3102,c:"ganz",n:"Seitliche Faszienkette",        v:40,t:["ruecken","brust"],p:"sidebend",s:true,q:"Beine kreuzen, Arm über Kopf, weit zur Seite."},
  {id:3103,c:"ganz",n:"Skorpion im Liegen",            v:40,t:["ruecken","brust"],p:"twist",s:true,q:"Bauchlage, ein Bein über den Körper zur Gegenseite."},
  {id:3104,c:"ganz",n:"Kamel sanft",                   v:35,t:["brust","beine"],p:"cobra",q:"Kniestand, Becken vor, Brustkorb zur Decke."},
  {id:3105,c:"ganz",n:"Hund-Kobra-Wechsel",            v:45,t:["ruecken","brust","beine"],p:"cobra",q:"Fließend zwischen beiden Positionen wechseln."},
  {id:3106,c:"ganz",n:"Beine an der Wand",             v:45,t:["beine","ruecken"],p:"ham",q:"Po nah zur Wand, Beine senkrecht, ruhig atmen."},
  {id:3107,c:"ganz",n:"Rumpfkreisen im Stand",         v:35,t:["ruecken"],p:"sidebend",q:"Große langsame Kreise aus der Hüfte."},
  {id:3108,c:"ganz",n:"Hampelmann-Dehnung",            v:35,t:["brust","beine"],p:"shoulder",q:"Arme weit öffnen und schließen, Brust weit."},
  {id:3109,c:"ganz",n:"Faszien-Rollen Oberschenkel",   v:40,t:["beine"],p:"quad",s:true,q:"Mit Rolle oder Flasche langsam über den Muskel fahren."},
  {id:3110,c:"ganz",n:"Faszien-Rollen Waden",          v:40,t:["beine"],p:"calf",s:true,q:"Langsam rollen, an empfindlichen Stellen kurz verweilen."},
  {id:3111,c:"ganz",n:"Faszien-Rollen Rücken",         v:40,t:["ruecken"],p:"catcow",q:"Nur den oberen Rücken rollen, Lende aussparen."},
  {id:3112,c:"ganz",n:"Fußsohle rollen",               v:35,t:["beine"],p:"wrist",s:true,q:"Ball oder Flasche unter dem Fuß langsam bewegen."},
  {id:3113,c:"ganz",n:"Atemdehnung im Sitzen",         v:45,t:["brust","ruecken"],p:"chest",q:"Tief in die Flanken atmen, beim Ausatmen weicher werden."},
  {id:3114,c:"ganz",n:"Vierfüßler-Mobilisation",       v:40,t:["ruecken","beine"],p:"catcow",q:"Hüfte kreisen lassen, Wirbelsäule folgt."},
  {id:3115,c:"ganz",n:"90-90-Hüftwechsel",             v:45,t:["beine"],p:"pigeon",q:"Beide Knie im rechten Winkel, langsam von Seite zu Seite."},
  {id:3116,c:"ganz",n:"Standwaage mit Griff",          v:35,t:["beine","ruecken"],p:"ham",s:true,q:"Ein Bein nach hinten, Oberkörper waagrecht."},
  {id:3117,c:"ganz",n:"Schulterbrücke passiv",         v:40,t:["brust","beine"],p:"cobra",q:"Hüfte anheben und einfach gestützt halten."},
  {id:3118,c:"ganz",n:"Liegender Schmetterling",       v:45,t:["beine","brust"],p:"fold",q:"Rückenlage, Fußsohlen zusammen, Arme offen."},
  {id:3119,c:"ganz",n:"Savasana mit Atemzählung",      v:45,t:["ruecken","nacken"],p:"child",q:"Ganz flach liegen, vier ein, sechs aus."},
  {id:3120,c:"ganz",n:"Rückenrolle mit Drehung",       v:40,t:["ruecken"],p:"twist",q:"Knie angezogen, sanft von Seite zu Seite rollen."}
];

/* Zielgruppen -> passende Dehnübungen (für das automatische Cool-down) */
function stretchesFor(groups){
  var want = {};
  (groups || []).forEach(function(g){ want[g] = true; });
  return STRETCHES.filter(function(s){
    return s.t.some(function(t){ return want[t]; });
  });
}
/* 3–4 Übungen, 2–3 Minuten, deterministisch je Tag */
function coolDownFor(groups, dateStr, seedExtra){
  var pool = stretchesFor(groups);
  if (pool.length < 4) pool = STRETCHES.slice();
  var idx = W.dayIndex(dateStr || "2026-01-01");
  var order = pool.slice().sort(function(a,b){ return a.id - b.id; });
  var picked = [], byGroup = {}, total = 0;
  var start = Math.abs(idx * 7 + (seedExtra || 0)) % order.length;
  for (var k = 0; k < order.length && picked.length < 4; k++){
    var s = order[(start + k) % order.length];
    var key = s.t[0];
    if (byGroup[key] && picked.length < 3) continue;   // erst Vielfalt, dann auffüllen
    byGroup[key] = 1;
    picked.push(s);
    total += s.v;
    if (picked.length >= 3 && total >= 120) break;
  }
  while (total < 120 && picked.length < 4){
    var extra = order[(start + picked.length) % order.length];
    if (picked.indexOf(extra) === -1){ picked.push(extra); total += extra.v; } else break;
  }
  return {items:picked, seconds:total};
}
/* Freies Programm nach Kategorie und Zeitfenster */
function stretchProgram(category, minutes, dateStr){
  var pool = (category === "alle") ? STRETCHES.slice()
           : STRETCHES.filter(function(s){ return s.c === category; });
  var target = minutes * 60;
  var idx = W.dayIndex(dateStr || "2026-01-01");
  var start = Math.abs(idx * 3) % pool.length;
  var picked = [], total = 0, k = 0;
  while (total < target && k < pool.length * 3){
    var s = pool[(start + k) % pool.length];
    if (picked.length >= pool.length) break;
    if (picked.indexOf(s) === -1){ picked.push(s); total += s.v + 8; }
    k++;
  }
  return {items:picked, seconds:total};
}

/* ---------- SVG-Posen (leichte Inline-Animationen) ---------- */
var POSES = {
  fold:     "M32 52a5 5 0 1 0 0 10 5 5 0 0 0 0-10M37 58l15-16M52 42l-6 30M52 42l7 30M36 60l-5 12",
  quad:     "M50 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10M50 24v22M50 46l-8 22M50 46c6 4 10 12 4 18",
  ham:     "M46 28a5 5 0 1 0 0 10 5 5 0 0 0 0-10M44 40l-8 18M36 58h40M44 44l26 10",
  hipflex:     "M46 8a5 5 0 1 0 0 10 5 5 0 0 0 0-10M46 20v24M46 44l20 10v18M46 44L26 66h14M46 24l7-13",
  pigeon:     "M34 26a5 5 0 1 0 0 10 5 5 0 0 0 0-10M36 36l6 18M26 62h32M46 58l30 8",
  calf:     "M40 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10M40 24l8 20M48 44l-4 22M48 44l16 20M24 20v50",
  chest:    "M50 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10M50 24v24M50 30l-18-6M50 30l18-6M50 48l-8 20M50 48l8 20",
  shoulder: "M50 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10M50 24v24M50 32h20M70 32c-4 6-10 8-16 6M50 48l-8 20M50 48l8 20",
  triceps:     "M50 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10M50 24v28M50 52l-8 20M50 52l8 20M50 30l11-13-15 5M50 30l-12 7",
  wrist:     "M22 44h34M56 44l11-13M67 31c8 3 10 9 5 13M56 44l9 11",
  neckside: "M52 14a6 6 0 1 0 0 12 6 6 0 0 0 0-12M50 26l-2 22M48 34h18M48 34H32M48 48l-6 20M48 48l8 20",
  twist:    "M50 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10M50 24v20M50 30l-16 8M50 30l16-2M50 44l-14 12M50 44c10 4 14 12 10 22",
  catcow:   "M28 44a5 5 0 1 0 0 10 5 5 0 0 0 0-10M34 48c10-8 24-8 34 0M34 48v20M68 48v20M40 48v18M62 48v18",
  child:     "M32 54a5 5 0 1 0 0 10 5 5 0 0 0 0-10M38 60l26-8M64 52c7 4 7 11 2 15M48 58l-28 6",
  cobra:     "M74 24a5 5 0 1 0 0 10 5 5 0 0 0 0-10M70 34L36 58M36 58H14M64 38v20",
  sidebend: "M50 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10M50 24c8 6 12 14 10 24M52 30l14-14M50 48l-8 20M52 48l10 20"
};
function poseSvg(pose, color){
  var d = POSES[pose] || POSES.fold;
  return '<svg viewBox="0 0 100 80" class="pose" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="' + d + '" fill="none" stroke="' + (color || "currentColor") +
    '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

var API = {
  STRETCHES:STRETCHES, STRETCH_CAT:STRETCH_CAT, STRETCH_CAT_ORDER:STRETCH_CAT_ORDER,
  stretchesFor:stretchesFor, coolDownFor:coolDownFor, stretchProgram:stretchProgram,
  POSES:POSES, poseSvg:poseSvg
};
for (var k in API) W[k] = API[k];
root.STRETCH = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof globalThis !== "undefined" ? globalThis : this);
