/* ============================================================
   SPORTARTEN-KATALOG (40) mit sportartspezifischen Eingabefeldern
   kind = interne Kategorie für die strikte Datentrennung.
   Nur kind "lauf" fließt in Lauf-Pace und Laufumfang ein.
   ============================================================ */
(function(root){
"use strict";
var W = root.WK;

/* Feldtypen:
   dist  Distanz km | dur Dauer | pace min/km | speed km/h | elev Höhenmeter
   hr Ø Puls | hrmax max Puls | cad Trittfrequenz | pow Watt | sets Sätze
   reps Wiederholungen | load bewegtes Gewicht | muscles Zielmuskeln
   pool Bahnenlänge | swolf SWOLF | stroke Zugfrequenz | steps Schritte
   shoe Schuh | cal Kalorien | note Notiz                                  */
var BASE = ["dur","cal","note"];
var SPORTS = [
  {id:"lauf",        n:"Laufen",             kind:"lauf",   met:9.8,  f:["dist","dur","pace","elev","hr","hrmax","shoe","cal","note"]},
  {id:"trail",       n:"Trailrunning",       kind:"trail",  met:11.0, f:["dist","dur","pace","elev","hr","hrmax","shoe","cal","note"]},
  {id:"walking",     n:"Walking",            kind:"gehen",  met:4.3,  f:["dist","dur","steps","hr","cal","note"]},
  {id:"wandern",     n:"Wandern",            kind:"gehen",  met:5.5,  f:["dist","dur","elev","steps","hr","cal","note"]},
  {id:"rennrad",     n:"Rennrad",            kind:"rad",    met:8.5,  f:["dist","dur","speed","elev","cad","pow","hr","cal","note"]},
  {id:"mtb",         n:"Mountainbike",       kind:"rad",    met:9.5,  f:["dist","dur","speed","elev","cad","pow","hr","cal","note"]},
  {id:"gravel",      n:"Gravel",             kind:"rad",    met:8.8,  f:["dist","dur","speed","elev","cad","hr","cal","note"]},
  {id:"indoorbike",  n:"Indoor-Cycling",     kind:"rad",    met:8.0,  f:["dur","speed","cad","pow","hr","cal","note"]},
  {id:"schwimmen",   n:"Schwimmen (Becken)", kind:"schwimmen", met:8.0, f:["dist","dur","pool","swolf","stroke","hr","cal","note"]},
  {id:"kraft",       n:"Krafttraining",      kind:"kraft",  met:5.0,  f:["dur","sets","reps","load","muscles","hr","cal","note"]},
  {id:"hiit",        n:"HIIT",               kind:"kraft",  met:9.0,  f:["dur","sets","hr","hrmax","cal","note"]},
  {id:"crossfit",    n:"Functional / CrossFit", kind:"kraft", met:8.5, f:["dur","sets","reps","load","hr","cal","note"]},
  {id:"yoga",        n:"Yoga",               kind:"mobility", met:3.0, f:["dur","hr","cal","note"]},
  {id:"pilates",     n:"Pilates",            kind:"mobility", met:3.8, f:["dur","hr","cal","note"]},
  {id:"dehnen",      n:"Dehnen / Mobility",  kind:"mobility", met:2.5, f:["dur","muscles","cal","note"]},
  {id:"rudernerg",   n:"Rudern (Ergometer)", kind:"rudern", met:8.5,  f:["dist","dur","speed","cad","pow","hr","cal","note"]},
  {id:"rudernwasser",n:"Rudern (Wasser)",    kind:"rudern", met:7.0,  f:["dist","dur","speed","cad","hr","cal","note"]},
  {id:"crosstrainer",n:"Crosstrainer",       kind:"cardio", met:7.0,  f:["dist","dur","cad","hr","cal","note"]},
  {id:"seilspringen",n:"Seilspringen",       kind:"cardio", met:11.0, f:["dur","hr","hrmax","cal","note"]},
  {id:"treppen",     n:"Treppensteigen",     kind:"cardio", met:8.0,  f:["dur","elev","steps","hr","cal","note"]},
  {id:"klettern",    n:"Klettern",           kind:"klettern", met:7.5, f:["dur","elev","hr","cal","note"]},
  {id:"bouldern",    n:"Bouldern",           kind:"klettern", met:7.0, f:["dur","sets","hr","cal","note"]},
  {id:"ski",         n:"Skifahren",          kind:"wintersport", met:6.5, f:["dist","dur","elev","hr","cal","note"]},
  {id:"skitour",     n:"Skitouring",         kind:"wintersport", met:9.0, f:["dist","dur","elev","hr","cal","note"]},
  {id:"langlauf",    n:"Langlauf",           kind:"wintersport", met:9.0, f:["dist","dur","speed","hr","cal","note"]},
  {id:"inline",      n:"Inlineskaten",       kind:"cardio", met:7.5,  f:["dist","dur","speed","hr","cal","note"]},
  {id:"tennis",      n:"Tennis",             kind:"ballsport", met:7.3, f:["dur","sets","hr","cal","note"]},
  {id:"padel",       n:"Padel",              kind:"ballsport", met:6.5, f:["dur","sets","hr","cal","note"]},
  {id:"badminton",   n:"Badminton",          kind:"ballsport", met:5.5, f:["dur","sets","hr","cal","note"]},
  {id:"squash",      n:"Squash",             kind:"ballsport", met:9.0, f:["dur","sets","hr","cal","note"]},
  {id:"fussball",    n:"Fußball",            kind:"ballsport", met:8.0, f:["dur","dist","hr","hrmax","cal","note"]},
  {id:"basketball",  n:"Basketball",         kind:"ballsport", met:7.5, f:["dur","hr","cal","note"]},
  {id:"volleyball",  n:"Volleyball",         kind:"ballsport", met:5.0, f:["dur","hr","cal","note"]},
  {id:"handball",    n:"Handball",           kind:"ballsport", met:8.0, f:["dur","hr","cal","note"]},
  {id:"boxen",       n:"Boxen",              kind:"kampfsport", met:9.0, f:["dur","sets","hr","hrmax","cal","note"]},
  {id:"kampfsport",  n:"Kampfsport",         kind:"kampfsport", met:8.0, f:["dur","hr","cal","note"]},
  {id:"golf",        n:"Golf",               kind:"sonstiges", met:4.8, f:["dur","dist","steps","cal","note"]},
  {id:"sup",         n:"Stand-Up-Paddling",  kind:"wassersport", met:6.0, f:["dist","dur","speed","hr","cal","note"]},
  {id:"kajak",       n:"Kajak",              kind:"wassersport", met:6.5, f:["dist","dur","speed","cad","hr","cal","note"]},
  {id:"tanzen",      n:"Tanzen",             kind:"cardio", met:6.0,  f:["dur","hr","cal","note"]}
];

var FIELD = {
  dist:   {n:"Distanz",        u:"km",     t:"number", step:"0.01"},
  dur:    {n:"Dauer",          u:"hh:mm:ss", t:"text",  ph:"00:45:00"},
  pace:   {n:"Pace",           u:"min/km", t:"text",   ph:"5:30", ro:true},
  speed:  {n:"Geschwindigkeit",u:"km/h",   t:"number", step:"0.1", ro:true},
  elev:   {n:"Höhenmeter",     u:"hm",     t:"number", step:"1"},
  hr:     {n:"Ø Herzfrequenz", u:"bpm",    t:"number", step:"1"},
  hrmax:  {n:"Max. Herzfrequenz", u:"bpm", t:"number", step:"1"},
  cad:    {n:"Trittfrequenz",  u:"1/min",  t:"number", step:"1"},
  pow:    {n:"Leistung",       u:"Watt",   t:"number", step:"1"},
  sets:   {n:"Sätze",          u:"",       t:"number", step:"1"},
  reps:   {n:"Wiederholungen", u:"gesamt", t:"number", step:"1"},
  load:   {n:"Bewegtes Gewicht", u:"kg",   t:"number", step:"1"},
  muscles:{n:"Zielmuskeln",    u:"",       t:"text",   ph:"z. B. Beine, Rücken"},
  pool:   {n:"Bahnenlänge",    u:"m",      t:"number", step:"1"},
  swolf:  {n:"SWOLF",          u:"",       t:"number", step:"1"},
  stroke: {n:"Zugfrequenz",    u:"1/min",  t:"number", step:"1"},
  steps:  {n:"Schritte",       u:"",       t:"number", step:"1"},
  shoe:   {n:"Schuh",          u:"",       t:"text",   ph:"optional"},
  cal:    {n:"Kalorien",       u:"kcal",   t:"number", step:"1"},
  note:   {n:"Notiz",          u:"",       t:"text",   ph:"optional"}
};

function sportById(id){
  for (var i = 0; i < SPORTS.length; i++) if (SPORTS[i].id === id) return SPORTS[i];
  return SPORTS[0];
}
/* Ordnet eine importierte Aktivität einer Sportart zu */
function sportForActivity(a){
  var s = String((a && (a.sportId || a.rawType || a.type || a.name)) || "").toLowerCase();
  for (var i = 0; i < SPORTS.length; i++){
    if (SPORTS[i].id === s) return SPORTS[i];
  }
  var map = [
    [/trail/, "trail"], [/laufband|treadmill/, "lauf"], [/lauf|run|jog/, "lauf"],
    [/wander|hike/, "wandern"], [/walk|gehen|spazier/, "walking"],
    [/mtb|mountain/, "mtb"], [/gravel/, "gravel"], [/indoor ?cycl|spinning/, "indoorbike"],
    [/rennrad|road ?bike/, "rennrad"], [/rad|bike|cycl/, "rennrad"],
    [/schwimm|swim/, "schwimmen"],
    [/hiit/, "hiit"], [/crossfit|functional/, "crossfit"],
    [/kraft|strength|gym|hantel/, "kraft"],
    [/yoga/, "yoga"], [/pilates/, "pilates"], [/dehn|stretch|mobility/, "dehnen"],
    [/ruder|row/, "rudernerg"], [/crosstrainer|elliptical/, "crosstrainer"],
    [/seilspring|jump ?rope/, "seilspringen"], [/treppe|stair/, "treppen"],
    [/boulder/, "bouldern"], [/kletter|climb/, "klettern"],
    [/langlauf|nordic/, "langlauf"], [/skitour/, "skitour"], [/ski/, "ski"],
    [/inline/, "inline"], [/tennis/, "tennis"], [/padel/, "padel"],
    [/badminton/, "badminton"], [/squash/, "squash"], [/fussball|fußball|soccer|football/, "fussball"],
    [/basketball/, "basketball"], [/volleyball/, "volleyball"], [/handball/, "handball"],
    [/box/, "boxen"], [/kampf|karate|judo|kickbox|mma/, "kampfsport"],
    [/golf/, "golf"], [/sup|paddl/, "sup"], [/kajak|kayak|kanu/, "kajak"], [/surf/, "surfen"],
    [/tanz|dance/, "tanzen"]
  ];
  for (var m = 0; m < map.length; m++) if (map[m][0].test(s)) return sportById(map[m][1]);
  if (a && a.distanceKm >= 1 && a.durationSec > 0){
    var kmh = a.distanceKm / (a.durationSec/3600);
    if (kmh > 17) return sportById("rennrad");
    return sportById("lauf");
  }
  return {id:"sonstiges", n:"Sonstiges", kind:"sonstiges", met:4.5, f:BASE};
}
function kindOf(a){ return sportForActivity(a).kind; }

var API = {
  SPORTS:SPORTS, FIELD:FIELD, sportById:sportById,
  sportForActivity:sportForActivity, kindOf:kindOf
};
for (var k in API) W[k] = API[k];
root.SPORTS_API = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof globalThis !== "undefined" ? globalThis : this);
