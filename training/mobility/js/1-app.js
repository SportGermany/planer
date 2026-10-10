/* =========================================================
   Figur-Modell: 2D-Kinematik mit Keyframes
   Winkel: 0 = nach unten, 90 = nach vorn (rechts), 180 = nach oben
   ========================================================= */
const L={lumb:26,thor:30,neck:6,head:9,arm:27,fore:27,thigh:44,shin:42,foot:13};
const AK=['lumb','thor','head','armN','foreN','armF','foreF','thighN','shinN','footN','thighF','shinF','footF','hipW','shW'];
const SK=['lumb','thor','head','armN','foreN','armF','foreF','thighN','shinN','footN','thighF','shinF','footF'];
const R=Math.PI/180;
const dv=a=>[Math.sin(a*R),Math.cos(a*R)];
const pv=a=>[-Math.cos(a*R),Math.sin(a*R)];
const ad=(p,d,l)=>[p[0]+d[0]*l,p[1]+d[1]*l];

const B={
  stand:{view:'side',lumb:180,thor:180,head:180,armN:4,foreN:2,armF:-4,foreF:-2,thighN:0,shinN:0,footN:90,thighF:0,shinF:0,footF:90},
  quad:{view:'side',lumb:100,thor:100,head:115,armN:0,foreN:0,armF:0,foreF:0,thighN:0,shinN:-90,footN:-90,thighF:0,shinF:-90,footF:-90},
  sup:{view:'side',lumb:-90,thor:-90,head:-90,armN:90,foreN:90,armF:90,foreF:90,thighN:150,shinN:30,footN:90,thighF:150,shinF:30,footF:90},
  long:{view:'side',lumb:180,thor:180,head:180,armN:20,foreN:20,armF:20,foreF:20,thighN:90,shinN:90,footN:180,thighF:90,shinF:90,footF:180},
  front:{view:'front',hipW:18,shW:32,lumb:180,thor:180,head:180,armN:14,foreN:4,armF:-14,foreF:-4,thighN:0,shinN:0,footN:90,thighF:0,shinF:0,footF:-90,sc:{footN:.35,footF:.35}},
  topSup:{view:'top',hipW:18,shW:34,lumb:180,thor:180,head:180,armN:90,foreN:90,armF:-90,foreF:-90,thighN:0,shinN:0,footN:0,thighF:0,shinF:0,footF:0,sc:{head:.5,thighN:.45,thighF:.45,shinN:.5,shinF:.5,footN:.8,footF:.8}},
  topChild:{view:'top',hipW:16,shW:32,lumb:180,thor:180,head:180,armN:176,foreN:178,armF:184,foreF:182,thighN:180,thighF:180,shinN:0,shinF:0,footN:0,footF:0,sc:{lumb:.75,thor:.85,head:.6,thighN:.3,thighF:.3,shinN:.6,shinF:.6,footN:.3,footF:.3}},
  topSeat:{view:'top',hipW:18,shW:34,lumb:180,thor:180,head:180,armN:15,foreN:0,armF:-15,foreF:0,thighF:0,shinF:0,footF:0,thighN:-8,shinN:-35,footN:0,sc:{lumb:.2,thor:.22,head:.2,footN:.4,footF:.4,thighN:.55,shinN:.75,armN:.8,foreN:.7,armF:.8,foreF:.7}},
  top9090:{view:'top',hipW:20,shW:34,lumb:180,thor:180,head:180,armN:160,foreN:170,armF:200,foreF:190,thighN:90,shinN:180,footN:180,thighF:0,shinF:90,footF:90,sc:{lumb:.4,thor:.45,head:.25,armN:.7,foreN:.6,armF:.7,foreF:.6,footN:.3,footF:.3}},
  topFrog:{view:'top',hipW:18,shW:32,lumb:180,thor:180,head:180,armN:180,foreN:180,armF:180,foreF:180,thighN:95,shinN:0,footN:0,thighF:-95,shinF:0,footF:0,sc:{lumb:.85,thor:.85,head:.7,armN:.15,armF:.15,footN:.5,footF:.5}}
};

/* =========================================================
   Übungen (eigene Beschreibungen, fachlich abgeglichen)
   ========================================================= */
const REG={
  warm:{n:'Aufwärmen',c:'--r-warm'},
  back:{n:'Rücken & Wirbelsäule',s:'Rücken',c:'--r-back'},
  hip:{n:'Hüfte & Becken',s:'Hüfte',c:'--r-hip'},
  leg:{n:'Beinrückseite & Waden',s:'Beinrückseite',c:'--r-leg'},
  start:{n:'Startspezifisch',s:'Start',c:'--r-start'}
};

const EX=[
{id:'warm',name:'Lockeres Aufwärmen',reg:'warm',type:'dyn',
 mp:['Herz-Kreislauf','Hüftbeuger'],ms:['Schultern','Waden'],
 start:'Aufrecht stehen, genug Platz um dich herum.',
 steps:['Auf der Stelle gehen oder locker traben, Knie abwechselnd bis etwa Hüfthöhe anheben.','Die Arme schwingen gegengleich mit.','Nach etwa einer Minute große Armkreise dazunehmen: 10 vorwärts, 10 rückwärts.','Zum Schluss ein paar Mal locker in die Knie federn.'],
 cue:'Du solltest leicht warm werden, aber nicht außer Atem sein.',
 err:['Kalt direkt in tiefe Dehnungen gehen.','Zu kurz: Unter einer Minute wird das Gewebe kaum wärmer.'],
 sled:'Warme Muskulatur lässt sich weiter und sicherer bewegen. Das gilt besonders bei Kälte an der Bahn.',
 dose:'2–3 Minuten',easy:'Nur gehen.',hard:'Hopserlauf auf der Stelle.',q:'marching in place arm circles warm up',
 anim:{base:'stand',frames:[{thighN:62,shinN:-12,armN:-32,foreN:-12,armF:34,foreF:62,d:.5,h:.05},{d:.5,h:.05},{thighF:62,shinF:-12,armF:-32,foreF:-12,armN:34,foreN:62,d:.5,h:.05},{d:.5,h:.05}],hl:[],th:0}},

{id:'katze',name:'Katze-Kuh',reg:'back',type:'dyn',
 mp:['Rückenstrecker (M. erector spinae)','Multifidus'],ms:['Gerade und schräge Bauchmuskeln','Nackenmuskulatur'],
 start:'Vierfüßlerstand: Hände unter den Schultern, Knie unter den Hüften, Rücken neutral.',
 steps:['Ausatmen: Steißbein einrollen, Bauchnabel Richtung Wirbelsäule ziehen und den Rücken Wirbel für Wirbel zur Decke runden. Kinn Richtung Brust.','Einatmen: Becken nach vorn kippen, Brustbein nach vorn-oben schieben, der Rücken sinkt ins Hohlkreuz. Blick schräg nach vorn.','Jede Richtung startet im Becken und wandert nach oben bis zum Kopf.','Langsam und fließend im Atemrhythmus wechseln.'],
 cue:'Stell dir vor, deine Wirbelsäule ist eine Perlenkette, die du Perle für Perle bewegst.',
 err:['Nur die Brustwirbelsäule bewegt sich, das Becken bleibt still.','Ellbogen knicken ein oder die Schultern rutschen zu den Ohren.'],
 sled:'Trainiert genau das Einrollen und Aufrichten der Wirbelsäule, das du beim Anschwingen an den Startgriffen brauchst.',
 dose:'8–10 langsame Wiederholungen',easy:'Kleinerer Bewegungsumfang, nur das Becken kippen.',hard:'Am Ende jeder Richtung 2 Sekunden halten.',q:'cat cow stretch',
 anim:{base:'quad',frames:[{d:.9,h:.3},{lumb:122,thor:76,head:40,armN:6,armF:6,d:1.4,h:.9},{d:1.2,h:.2},{lumb:78,thor:114,head:150,d:1.4,h:.9}],anchor:'kneeN',hl:['lumb','thor'],th:1}},

{id:'thread',name:'Thread the Needle',reg:'back',type:'dyn',sides:true,
 mp:['Rotatoren der Brustwirbelsäule','Rautenmuskeln (Rhomboiden)','Hinterer Deltamuskel'],ms:['Latissimus','Schräge Bauchmuskeln'],
 start:'Vierfüßlerstand, Hände unter den Schultern, Knie unter den Hüften.',
 steps:['Rechten Arm seitlich zur Decke öffnen. Der Blick folgt der Hand, der Brustkorb dreht auf.','Den Arm dann unter dem linken Arm hindurch weit zur linken Seite schieben.','Rechte Schulter und rechte Schläfe sinken zum Boden, die linke Hand stützt.','2 Sekunden halten, dann wieder aufdrehen. Nach der Hälfte der Zeit Seite wechseln.'],
 cue:'Die Hüften bleiben die ganze Zeit über den Knien. Gedreht wird nur der Oberkörper.',
 err:['Das Becken dreht mit oder weicht zur Seite aus.','Schwung statt kontrollierter Bewegung.'],
 sled:'Eine drehfähige Brustwirbelsäule lässt Schultern und Arme beim Paddeln frei arbeiten.',
 dose:'6–8 pro Seite',easy:'Schulter nur halb Richtung Boden.',hard:'Stützhand ein Stück weiter nach vorn setzen.',q:'thread the needle stretch',
 anim:{base:'quad',frames:[{d:1,h:.2},{thor:108,armN:180,foreN:180,head:160,d:1.3,h:.7},{d:1,h:0},{thor:82,lumb:98,armN:-40,foreN:-55,armF:32,foreF:-32,head:45,d:1.5,h:1.2}],anchor:'kneeN',hl:['thor','armN'],th:3}},

{id:'kind',name:'Kindhaltung, Arme vorn',reg:'back',type:'stat',
 mp:['Latissimus dorsi','Rückenstrecker'],ms:['Quadratus lumborum','Gesäß','Schultern'],
 start:'Kniestand, die großen Zehen berühren sich, Knie hüftbreit oder etwas weiter.',
 steps:['Gesäß Richtung Fersen sinken lassen.','Oberkörper zwischen oder auf die Oberschenkel legen, Stirn auf den Boden.','Arme lang nach vorn. Die Handflächen drücken leicht in den Boden, die Fingerspitzen wandern weit weg.','Mit jedem Ausatmen das Gesäß ein Stück mehr Richtung Fersen.'],
 cue:'Zug entsteht vom Becken bis in die Achseln. Schultern weg von den Ohren.',
 err:['Schultern hochziehen.','Knie zu eng, dadurch schwebt das Gesäß hoch.'],
 sled:'Dehnt Latissimus und unteren Rücken, die in der tiefen Paddelposition lang werden müssen.',
 dose:'30–45 s halten, 2 Durchgänge',easy:'Kissen zwischen Gesäß und Fersen.',hard:'Hände auf einem Block erhöht ablegen und die Brust sinken lassen.',q:'child pose arms extended',
 anim:{base:'quad',frames:[{armN:25,foreN:25,armF:25,foreF:25,d:1,h:.4},{thighN:62,thighF:62,lumb:76,thor:72,head:78,armN:84,foreN:88,armF:84,foreF:88,d:1.8,h:2.2}],anchor:'kneeN',hl:['lumb','thor','armN'],th:1}},

{id:'kindSeite',name:'Kindhaltung seitlich',reg:'back',type:'stat',sides:true,
 mp:['Latissimus','Quadratus lumborum'],ms:['Schräge Bauchmuskeln','Zwischenrippenmuskeln'],
 start:'Kindhaltung mit den Armen lang nach vorn.',
 steps:['Beide Hände nach rechts wandern lassen, bis in der linken Flanke eine Dehnung entsteht.','Das Gesäß bleibt auf den Fersen.','Für mehr Zug die linke Hand auf die rechte legen.','Bewusst in die linke Flanke atmen. Nach der Hälfte der Zeit Seite wechseln.'],
 cue:'Du dehnst die Seite, die von den Händen weg zeigt.',
 err:['Das Gesäß hebt ab und kippt mit zur Seite.'],
 sled:'Die seitliche Rumpfkette muss frei sein für Steuerimpulse und das saubere Ablegen nach dem Start.',
 dose:'30 s pro Seite',easy:'Hände weniger weit zur Seite.',hard:'Gesäß aktiv zur Gegenseite schieben.',q:'side child pose stretch',
 anim:{base:'topChild',frames:[{d:1,h:.6},{lumb:168,thor:146,head:150,armN:128,foreN:124,armF:136,foreF:130,d:1.8,h:2}],hl:['lumb','thor'],th:1}},

{id:'kneeChest',name:'Knie zur Brust',reg:'back',type:'stat',
 mp:['Lendenwirbelsäule (Rückenstrecker)','Großer Gesäßmuskel'],ms:['Quadratus lumborum'],
 start:'Rückenlage, Knie angewinkelt, Füße am Boden.',
 steps:['Beide Knie zur Brust ziehen, Hände unter den Knien oder auf den Schienbeinen.','Das Kreuzbein darf sich etwas vom Boden lösen, der untere Rücken rundet sich.','Sanft vor und zurück oder seitlich wiegen.','Kopf und Schultern bleiben entspannt am Boden.'],
 cue:'Ein angenehmes Ziehen im unteren Rücken, kein Druck.',
 err:['Kopf hochziehen.','An den Schienbeinen reißen. Bei empfindlichen Knien unter den Knien fassen.'],
 sled:'Entlastet die Lendenwirbelsäule nach den Läufen und eignet sich gut als Abschluss.',
 dose:'30–45 s, sanft wiegen',easy:'Nur ein Knie zur Brust.',hard:'Stirn Richtung Knie heben (nur ohne Nackenprobleme).',q:'knees to chest stretch supine',
 anim:{base:'sup',frames:[{d:1,h:.3},{thighN:210,thighF:210,shinN:100,shinF:100,armN:140,foreN:125,armF:140,foreF:125,d:1.5,h:.4},{lumb:-82,thor:-86,thighN:200,thighF:200,d:.8,h:.2},{thighN:210,thighF:210,shinN:100,shinF:100,armN:140,foreN:125,armF:140,foreF:125,d:.8,h:.6}],hl:['lumb','hip'],th:1}},

{id:'lumbRot',name:'Lumbale Rotation',reg:'back',type:'dyn',sides:true,
 mp:['Rotatoren der Lendenwirbelsäule','Quadratus lumborum','Schräge Bauchmuskeln'],ms:['Gesäß seitlich','Tensor fasciae latae'],
 start:'Rückenlage, Knie angewinkelt und geschlossen, Füße am Boden, Arme in T-Position.',
 steps:['Beide Knie langsam nach rechts sinken lassen.','Beide Schultern bleiben am Boden, den Kopf kannst du nach links drehen.','Kurz halten und ausatmen.','Über die Mitte zur anderen Seite.'],
 cue:'Nur so weit, wie die gegenüberliegende Schulter liegen bleibt.',
 err:['Die Schulter hebt ab.','Die Knie fallen unkontrolliert.'],
 sled:'Mobilisiert die Drehung im unteren Rücken ohne Last. Ideal vor dem Start.',
 dose:'8 pro Seite langsam, oder 30 s pro Seite halten',easy:'Füße weiter auseinander.',hard:'Oberes Bein strecken.',q:'supine lumbar rotation stretch',
 anim:{base:'topSup',frames:[{d:1,h:.4},{thighN:58,thighF:58,shinN:10,shinF:10,sc:{thighN:.95,thighF:.95,shinN:.8,shinF:.8},d:1.6,h:1.2},{d:1.4,h:.3},{thighN:-58,thighF:-58,shinN:-10,shinF:-10,sc:{thighN:.95,thighF:.95,shinN:.8,shinF:.8},d:1.6,h:1.2}],hl:['lumb'],th:1}},

{id:'seatTwist',name:'Sitzende Drehung',reg:'back',type:'stat',sides:true,
 mp:['Rotatoren der Brustwirbelsäule','Schräge Bauchmuskeln'],ms:['Gesäß und Piriformis des aufgestellten Beins'],
 start:'Langsitz. Rechtes Bein anwinkeln und den Fuß außen neben das linke Knie stellen.',
 steps:['Aufrecht sitzen, Scheitel Richtung Decke.','Rechte Hand hinter dem Gesäß aufstützen.','Linken Ellbogen außen gegen das rechte Knie legen und den Oberkörper nach rechts drehen.','Einatmen: länger werden. Ausatmen: ein Stück weiter drehen.'],
 cue:'Die Drehung kommt aus dem Brustkorb, nicht nur aus dem Kopf.',
 err:['Rund sitzen, dann drehen nur die Schultern.','Mit dem Ellbogen ruckartig ziehen.'],
 sled:'Verbindet aufrechten Sitz mit Rotation, wie beim Ausrichten auf dem Schlitten.',
 dose:'30 s pro Seite',easy:'Das untere Bein angewinkelt lassen.',hard:'Hand weiter hinten aufsetzen.',q:'seated spinal twist',
 anim:{base:'topSeat',frames:[{d:1,h:.5},{thor:235,head:225,armN:170,foreN:175,armF:55,foreF:10,d:1.8,h:2}],hl:['thor'],th:1}},

{id:'bwsRolle',name:'Brustwirbelsäule über Rolle',reg:'back',type:'dyn',
 mp:['Brustwirbelsäulen-Strecker','Großer Brustmuskel'],ms:['Bauchmuskeln','Latissimus'],
 start:'Rückenlage, Faszienrolle (oder fest eingerolltes Handtuch) quer unter dem oberen Rücken auf Höhe der Schulterblätter. Knie angewinkelt, Hände stützen den Kopf.',
 steps:['Gesäß bleibt am Boden.','Ausatmen und den Oberkörper über die Rolle nach hinten sinken lassen, Ellbogen zeigen nach oben.','2–3 Sekunden halten, zurück in die Ausgangsposition.','Die Rolle eine Handbreit höher oder tiefer legen und wiederholen.'],
 cue:'Die Bewegung passiert nur in der Brustwirbelsäule. Rippen bleiben unten.',
 err:['Rolle unter der Lendenwirbelsäule: dort nie.','Kopf nach hinten fallen lassen.'],
 sled:'Das flache Zurücklegen auf den Schlitten nach dem Paddeln verlangt eine streckbare Brustwirbelsäule.',
 dose:'3 Positionen × 5 Wiederholungen',easy:'Weicheres Handtuch statt Rolle.',hard:'Arme gestreckt über den Kopf.',q:'thoracic extension foam roller',
 anim:{base:'sup',frames:[{lumb:-130,thor:-102,head:-108,armN:-160,foreN:-13,armF:-160,foreF:-13,d:1,h:.5},{lumb:-130,thor:-76,head:-88,armN:-160,foreN:-13,armF:-160,foreF:-13,d:1.6,h:1.5}],props:[{t:'roller'}],hl:['thor'],th:1}},

{id:'lat',name:'Lat-Dehnung an Wand oder Stange',reg:'back',type:'stat',
 mp:['Latissimus dorsi','Großer Rundmuskel (Teres major)'],ms:['Trizeps','Rückenstrecker','Oberschenkelrückseite'],
 start:'Etwa einen Meter vor einer Wand, Stange oder Stuhllehne stehen. Hände schulterbreit auf Hüfthöhe auflegen.',
 steps:['Hüfte nach hinten schieben, die Arme bleiben gestreckt.','Der Oberkörper sinkt zwischen die Arme, Brust Richtung Boden.','Knie leicht beugen, wenn die Beinrückseite zu stark zieht.','Für mehr Zug im Lat das Gesäß leicht zur Seite schieben.'],
 cue:'Rücken lang, Kopf zwischen den Oberarmen.',
 err:['Ins Hohlkreuz fallen.','Kopf hängen lassen.'],
 sled:'Ein freier Lat gibt dir die volle Armreichweite beim Paddeln.',
 dose:'30–45 s, 2 Durchgänge',easy:'Hände höher auflegen.',hard:'Eine Hand auf die andere legen und zur Seite schieben.',q:'lat stretch wall',
 anim:{base:'stand',frames:[{lumb:92,thor:90,head:95,armN:95,foreN:95,armF:95,foreF:95,thighN:8,shinN:4,thighF:8,shinF:4,d:1,h:1},{lumb:90,thor:78,head:84,armN:104,foreN:104,armF:104,foreF:104,thighN:10,shinN:4,thighF:10,shinF:4,d:1.6,h:2}],anchor:'ankleN',props:[{t:'wall',f:0}],hl:['armN','thor'],th:1}},

{id:'abrollen',name:'Wirbelweises Abrollen',reg:'back',type:'dyn',
 mp:['Rückenstrecker','Rückenfaszie'],ms:['Oberschenkelrückseite','Waden','Nacken'],
 start:'Hüftbreit stehen, Knie leicht gebeugt, Arme hängen locker.',
 steps:['Kinn zur Brust sinken lassen.','Wirbel für Wirbel nach unten abrollen, die Arme hängen schwer.','Unten 2–3 Atemzüge hängen lassen.','Genauso langsam von unten nach oben aufrollen. Der Kopf kommt zuletzt.'],
 cue:'Langsam genug, dass du jeden Abschnitt des Rückens spürst.',
 err:['Mit geradem Rücken abkippen (das ist dann ein Hüftscharnier).','Zu schnell.'],
 sled:'Schult die Kontrolle über jeden Wirbelsäulenabschnitt, die du für einen runden, kraftvollen Start brauchst.',
 dose:'5 Wiederholungen, je ca. 10 s',easy:'Nur bis zur Hälfte abrollen.',hard:'Unten Knie abwechselnd strecken.',q:'standing roll down spine',
 anim:{base:'stand',pingpong:true,frames:[{d:1.2,h:.6},{head:122,d:1.2,h:.2},{thor:122,head:70,armN:18,armF:14,d:1.4,h:.2},{lumb:122,thor:55,head:22,armN:2,foreN:0,armF:0,foreF:0,thighN:6,thighF:6,d:1.5,h:.2},{lumb:62,thor:14,head:4,armN:-4,armF:-4,foreN:-2,foreF:-2,thighN:16,shinN:-4,thighF:16,shinF:-4,d:1.6,h:2}],anchor:'ankleN',hl:['lumb','thor'],th:3}},

{id:'taube',name:'Taube (Pigeon)',reg:'hip',type:'stat',sides:true,
 mp:['Großer Gesäßmuskel','Piriformis','Tiefe Außenrotatoren der Hüfte'],ms:['Hüftbeuger des hinteren Beins'],
 start:'Vierfüßlerstand.',
 steps:['Rechtes Knie hinter das rechte Handgelenk bringen, den rechten Fuß Richtung linke Hand legen.','Linkes Bein gestreckt nach hinten, Fußrücken am Boden.','Hüfte gerade ausrichten, beide Beckenknochen zeigen nach vorn.','Erst aufrecht bleiben, dann den Oberkörper auf die Unterarme sinken lassen.'],
 cue:'Der Zug sitzt im Gesäß des vorderen Beins. Im Knie darf es nicht ziehen.',
 err:['Das Becken kippt zur Seite, eine Gesäßhälfte schwebt. Dann ein Kissen darunter legen.','Knieschmerz: den Fuß näher zum Körper holen.'],
 sled:'Freie Außenrotatoren und Gesäß erlauben die tiefe Hüftbeugung beim Paddeln, ohne dass das Becken nach hinten kippt.',
 dose:'30–45 s pro Seite',easy:'Figur 4 in Rückenlage.',hard:'Vorderes Schienbein paralleler zur Mattenkante.',q:'pigeon pose stretch',
 anim:{base:'stand',frames:[{thighN:80,shinN:0,footN:0,thighF:-63,shinF:-90,footF:-90,armN:-5,armF:5,sc:{shinN:.3,footN:.3},d:1,h:1.2},{thighN:80,shinN:0,footN:0,thighF:-63,shinF:-90,footF:-90,lumb:112,thor:98,head:100,armN:12,foreN:92,armF:12,foreF:92,sc:{shinN:.3,footN:.3},d:2,h:2.5}],anchor:'kneeF',hl:['hip'],th:1}},

{id:'fig4',name:'Figur 4 (Rückenlage)',reg:'hip',type:'stat',sides:true,
 mp:['Piriformis','Großer Gesäßmuskel'],ms:['Tiefe Außenrotatoren'],
 start:'Rückenlage, Knie angewinkelt, Füße am Boden.',
 steps:['Rechten Knöchel auf das linke Knie legen, das rechte Knie zeigt nach außen.','Linken Fuß abheben und mit beiden Händen hinter den linken Oberschenkel greifen.','Den Oberschenkel zur Brust ziehen, bis im rechten Gesäß ein Zug entsteht.','Kopf und Kreuzbein bleiben am Boden.'],
 cue:'Den rechten Fuß aktiv anziehen (Zehen Richtung Schienbein), das schützt das Knie.',
 err:['Kopf und Schultern hochziehen.','Fuß hängen lassen.'],
 sled:'Die sanfte Variante der Taube, gut für den Einstieg und nach dem Lauf.',
 dose:'30–45 s pro Seite',easy:'Linken Fuß am Boden lassen.',hard:'Rechtes Knie mit dem Ellbogen sanft nach außen drücken.',q:'figure four stretch supine',
 anim:{base:'sup',frames:[{thighF:150,shinF:30,thighN:165,shinN:150,sc:{thighN:.75,shinN:.3},d:1,h:.8},{thighF:210,shinF:100,thighN:190,shinN:251,armN:118,foreN:108,armF:118,foreF:108,sc:{thighN:.75,shinN:.42},d:1.8,h:2.5}],hl:['hip'],th:1}},

{id:'n9090',name:'90/90-Wechsel',reg:'hip',type:'dyn',
 mp:['Innen- und Außenrotatoren der Hüfte','Gesäß','Piriformis'],ms:['Adduktoren','Hüftgelenkkapsel'],
 start:'Sitz auf dem Boden. Vorderes Bein 90° gebeugt vor dir, hinteres Bein 90° gebeugt seitlich hinter dir. Hände hinter dem Körper aufstützen.',
 steps:['Beide Knie anheben, die Füße bleiben etwas breiter als hüftbreit am Boden.','Die Knie zur anderen Seite ablegen, sodass wieder beide Beine 90° gebeugt sind.','Der Oberkörper bleibt aufrecht.','Langsam hin und her wechseln.'],
 cue:'Beide Gesäßhälften so gut es geht am Boden lassen.',
 err:['Rund sitzen.','Mit Schwung umklappen.'],
 sled:'Trainiert Innen- und Außenrotation, damit das Becken im Sitz frei bleibt.',
 dose:'8–10 Wechsel',easy:'Hände weiter hinten aufstützen.',hard:'Ohne Hände, aufrecht.',q:'90 90 hip switch',
 anim:{base:'top9090',frames:[{d:1,h:1},{thighN:45,thighF:-45,shinN:225,shinF:135,sc:{thighN:.45,thighF:.45,shinN:.75,shinF:.75},d:.9,h:.1},{thighN:0,shinN:270,footN:270,thighF:-90,shinF:180,footF:180,d:.9,h:1},{thighN:45,thighF:-45,shinN:225,shinF:135,footN:225,footF:135,sc:{thighN:.45,thighF:.45,shinN:.75,shinF:.75},d:.9,h:.1}],hl:['hip'],th:0}},

{id:'lunge',name:'Tiefer Ausfallschritt',reg:'hip',type:'dyn',sides:true,
 mp:['Hüftbeuger (Iliopsoas)','Gerader Oberschenkelmuskel (Rectus femoris)'],ms:['Adduktoren','Gesäß des vorderen Beins'],
 start:'Kniestand, rechter Fuß vorn, linkes Knie am Boden (weich unterlegen).',
 steps:['Becken leicht nach hinten kippen (Steißbein Richtung Boden) und das Gesäß anspannen.','Hüfte nach vorn-unten schieben, bis vorn in der linken Leiste ein Zug entsteht.','2 Sekunden halten, dann zurück.','Das vordere Knie bleibt über dem Fuß.'],
 cue:'Der Zug gehört in die Leiste des hinteren Beins, nicht ins Kreuz.',
 err:['Hohlkreuz statt Hüftstreckung.','Das vordere Knie fällt nach innen.'],
 sled:'Im Rodelsitz sind die Hüftbeuger dauerhaft verkürzt und ziehen das Becken ins Hohlkreuz.',
 dose:'8 pro Seite, dynamisch',easy:'Kleinerer Schritt.',hard:'Gleichseitigen Arm nach oben strecken.',q:'kneeling hip flexor lunge stretch',
 anim:{base:'stand',frames:[{thighN:90,shinN:0,thighF:-17,shinF:-90,footF:-90,armN:38,foreN:42,armF:38,foreF:42,d:1,h:.4},{thighN:100,shinN:25,thighF:-45,shinF:-90,footF:-90,lumb:182,armN:40,foreN:48,armF:40,foreF:48,d:1.2,h:1.2}],anchor:'ankleN',hl:['hipF','thighF'],th:1}},

{id:'butterfly',name:'Schmetterling',reg:'hip',type:'stat',
 mp:['Kurze Adduktoren','Gracilis'],ms:['Hüftgelenkkapsel'],
 start:'Sitz, Fußsohlen aneinander, Fersen nah zum Körper.',
 steps:['Hände um die Füße legen und aufrecht sitzen.','Die Knie Richtung Boden sinken lassen, ohne zu drücken.','Für mehr Dehnung mit geradem Rücken aus der Hüfte nach vorn kippen.','Ruhig atmen und in der Position bleiben.'],
 cue:'Brustbein nach vorn, nicht die Stirn Richtung Füße.',
 err:['Runder Rücken.','Knie mit den Ellbogen nach unten drücken.'],
 sled:'Freie Adduktoren erlauben eine stabile, breite Beckenposition auf dem Schlitten.',
 dose:'30–45 s',easy:'Füße weiter weg vom Körper.',hard:'Aus der Hüfte weiter vorbeugen.',q:'butterfly stretch',
 anim:{base:'front',frames:[{lumb:180,thor:180,armN:12,foreN:-12,armF:-12,foreF:12,thighN:125,shinN:-55,thighF:-125,shinF:55,footN:0,footF:0,sc:{thighN:.75,thighF:.75,shinN:.95,shinF:.95,footN:.25,footF:.25},d:1,h:1},{thighN:105,shinN:-74,thighF:-105,shinF:74,footN:0,footF:0,armN:28,foreN:-22,armF:-28,foreF:22,sc:{lumb:.9,thor:.85,thighN:.8,thighF:.8,shinN:.96,shinF:.96,footN:.25,footF:.25},d:1.8,h:2}],hl:['thighN','thighF'],th:1}},

{id:'frosch',name:'Frosch',reg:'hip',type:'stat',
 mp:['Adduktoren (v. a. Adduktor magnus)'],ms:['Gracilis','Hüftgelenkkapsel'],
 start:'Unterarmstütz. Knie so weit auseinander wie angenehm, Unterschenkel parallel, Fußinnenseiten am Boden.',
 steps:['Die Knie liegen auf einer Linie mit der Hüfte.','Das Gesäß langsam nach hinten Richtung Fersen schieben.','Der Rücken bleibt neutral, kein Hohlkreuz.','Halten oder langsam vor und zurück wippen.'],
 cue:'Der Zug sitzt an den Oberschenkelinnenseiten.',
 err:['Knie zu weit auseinander, dann sticht es innen am Knie. Weich unterlegen.','Hohlkreuz.'],
 sled:'Die großen Adduktoren begrenzen oft die tiefe Hüftbeugung. Der Frosch öffnet sie.',
 dose:'30–45 s oder 10 Wipper',easy:'Knie enger.',hard:'Länger halten, tiefer sinken.',q:'frog stretch adductor',
 anim:{base:'topFrog',frames:[{d:1,h:.6},{thighN:125,thighF:-125,d:1.6,h:1.6}],anchor:'kneeN',hl:['thighN','thighF'],th:1}},

{id:'hocke',name:'Tiefe Hocke halten',reg:'hip',type:'stat',
 mp:['Großer Gesäßmuskel','Adduktoren'],ms:['Schollenmuskel (Sprunggelenk)','Lendenwirbelsäule'],
 start:'Schulterbreit stehen, Fußspitzen leicht nach außen.',
 steps:['Tief hinsetzen, die Fersen bleiben am Boden.','Hände vor der Brust zusammen, Ellbogen innen an die Knie.','Mit den Ellbogen die Knie sanft nach außen drücken, Brust hoch.','Das Gewicht langsam etwas nach links und rechts verlagern.'],
 cue:'Knie zeigen in Richtung der Fußspitzen.',
 err:['Fersen heben ab. Dann ein Brett unter die Fersen legen.','Knie fallen nach innen.'],
 sled:'Kombiniert Hüftbeugung, Sprunggelenk und unteren Rücken in einer Position.',
 dose:'30–60 s',easy:'An einem Türrahmen festhalten.',hard:'Arme über den Kopf strecken.',q:'deep squat hold',
 anim:{base:'stand',frames:[{d:1,h:.5},{thighN:112,shinN:-24,thighF:112,shinF:-24,lumb:158,thor:165,head:170,armN:55,foreN:150,armF:55,foreF:150,d:1.8,h:1.5},{thighN:112,shinN:-24,thighF:112,shinF:-24,lumb:168,thor:172,head:176,armN:40,foreN:150,armF:40,foreF:150,d:1,h:1.5}],anchor:'ankleN',hl:['hip','thighN'],th:2}},

{id:'kosak',name:'Kosakenhocke',reg:'hip',type:'dyn',
 mp:['Adduktoren des gestreckten Beins','Innere Oberschenkelrückseite'],ms:['Gesäß und Quadrizeps des gebeugten Beins','Sprunggelenk'],
 start:'Sehr breiter Stand, Fußspitzen leicht nach außen.',
 steps:['Gewicht auf das rechte Bein verlagern und tief in die Hocke setzen.','Das linke Bein bleibt gestreckt, die Zehen zeigen nach oben, die Ferse bleibt am Boden.','Die rechte Ferse bleibt ebenfalls am Boden, Brust hoch.','Über die Mitte zur anderen Seite wechseln.'],
 cue:'Tiefer ist nicht besser. Rücken lang ist wichtiger.',
 err:['Der Rücken rundet sich.','Die Ferse des Hockbeins hebt ab.'],
 sled:'Dehnt Adduktoren und Beinrückseite dynamisch und wärmt zugleich die Hüfte auf.',
 dose:'8 pro Seite, abwechselnd',easy:'An etwas festhalten.',hard:'Unten 2 s halten.',q:'cossack squat',
 anim:{base:'front',frames:[{armN:25,foreN:-140,armF:-25,foreF:140,thighN:48,shinN:48,footN:90,thighF:-48,shinF:-48,footF:-90,d:1,h:.4},{armN:25,foreN:-140,armF:-25,foreF:140,thighN:90,shinN:10,footN:90,thighF:-61.6,shinF:-61.6,footF:180,d:1.4,h:1},{armN:25,foreN:-140,armF:-25,foreF:140,thighN:48,shinN:48,footN:90,thighF:-48,shinF:-48,footF:-90,d:1.2,h:.3},{armN:25,foreN:-140,armF:-25,foreF:140,thighN:61.6,shinN:61.6,footN:180,thighF:-90,shinF:-10,footF:-90,d:1.4,h:1}],anchor:'ankleN',hl:['thighN','thighF'],th:1}},

{id:'hipCircle',name:'Hüftkreisen im Vierfüßler',reg:'hip',type:'dyn',sides:true,
 mp:['Hüftgelenkkapsel','Tiefe Hüftrotatoren','Gesäß'],ms:['Rumpfstabilisatoren'],
 start:'Vierfüßlerstand.',
 steps:['Rechtes Knie Richtung Brust ziehen.','Das Knie zur Seite öffnen und nach oben führen.','Nach hinten führen und wieder unter die Hüfte bringen.','So groß wie möglich kreisen, Becken und Rücken bleiben ruhig. Nach der Hälfte Richtung wechseln.'],
 cue:'Die Hüfte bewegt sich, der Rumpf bleibt wie ein Tisch.',
 err:['Der Rücken dreht und kippt mit.','Zu schnell.'],
 sled:'Mobilisiert die Hüftkapsel in alle Richtungen, eine gute Vorbereitung für die Sitzposition.',
 dose:'8 pro Richtung und Seite',easy:'Kleinere Kreise.',hard:'Langsamer, mit Pause an jedem Punkt.',q:'quadruped hip circles',
 anim:{base:'quad',frames:[{d:.8,h:.2},{thighN:75,shinN:-40,footN:-40,d:.9,h:.2},{thighN:20,shinN:-85,sc:{thighN:.45},d:.9,h:.2},{thighN:-80,shinN:-150,footN:-150,d:.9,h:.2}],anchor:'kneeF',hl:['hip'],th:1}},

{id:'gurt',name:'Beinheben mit Gurt',reg:'leg',type:'stat',sides:true,
 mp:['Oberschenkelrückseite (Hamstrings)'],ms:['Zwillingswadenmuskel (Gastrocnemius)','Gesäß'],
 start:'Rückenlage. Gurt, Gürtel oder Handtuch um die rechte Fußsohle.',
 steps:['Das linke Bein liegt gestreckt am Boden, Zehen zeigen zur Decke.','Das rechte Bein gestreckt anheben, bis hinten ein Zug entsteht.','Den Fuß anziehen (Zehen Richtung Schienbein), dann dehnt die Wade mit.','Das Becken bleibt gerade am Boden.'],
 cue:'Hier siehst du ehrlich, wie kurz deine Hamstrings sind, weil der Rücken nicht ausweichen kann.',
 err:['Das untere Bein beugt sich oder hebt ab.','Mit dem Gurt ruckartig ziehen.'],
 sled:'Isoliert die Oberschenkelrückseite, ohne dass der Rücken mitmogelt.',
 dose:'30–45 s pro Seite',easy:'Unteres Bein angewinkelt.',hard:'Bein leicht nach innen führen (mehr seitliche Kette).',q:'supine hamstring stretch strap',
 anim:{base:'sup',frames:[{thighF:90,shinF:90,footF:180,thighN:130,shinN:130,footN:220,armN:150,foreN:160,armF:150,foreF:160,d:1,h:.5},{thighF:90,shinF:90,footF:180,thighN:168,shinN:168,footN:258,armN:165,foreN:172,armF:165,foreF:172,d:1.8,h:2.2}],props:[{t:'strap'}],hl:['thighN','shinN'],th:1}},

{id:'sitVorbeuge',name:'Sitzende Vorbeuge',reg:'leg',type:'stat',
 mp:['Oberschenkelrückseite','Waden'],ms:['Rückenstrecker','Rückenfaszie'],
 start:'Langsitz, Handtuch um die Fußsohlen. Auf den Sitzbeinhöckern sitzen, nicht auf dem Kreuzbein.',
 steps:['Aufrichten, Brustbein nach vorn.','Mit langem Rücken aus der Hüfte nach vorn kippen, das Handtuch hilft.','Erst wenn die Hüfte nicht weiter kippt, darf der Rücken rund werden.','Mit jedem Ausatmen ein kleines Stück weiter sinken.'],
 cue:'Erst Hüfte, dann Rücken. Diese Reihenfolge ist der Kern der Übung.',
 err:['Sofort rund werden.','Knie durchdrücken, bis es in der Kniekehle sticht.'],
 sled:'Das ist fast deine Position beim Paddeln: Beine lang, Oberkörper tief vorn.',
 dose:'30–45 s, 2 Durchgänge',easy:'Kissen unter das Gesäß, Knie leicht gebeugt.',hard:'Handtuch kürzer fassen.',q:'seated forward fold towel',
 anim:{base:'long',frames:[{armN:108,foreN:100,armF:108,foreF:100,d:1,h:.6},{lumb:128,thor:122,head:120,armN:100,foreN:95,armF:100,foreF:95,d:1.6,h:.8},{lumb:115,thor:96,head:72,armN:82,foreN:86,armF:82,foreF:86,d:1.4,h:2.2}],props:[{t:'strap'}],hl:['thighN','shinN','lumb'],th:2}},

{id:'hinge',name:'Hüftscharnier mit Stab',reg:'leg',type:'dyn',
 mp:['Oberschenkelrückseite','Großer Gesäßmuskel'],ms:['Rückenstrecker (haltend)'],
 start:'Hüftbreit stehen. Ein Besenstiel liegt längs am Rücken und berührt Hinterkopf, Brustwirbelsäule und Kreuzbein. Eine Hand hält ihn hinter dem Nacken, die andere am unteren Rücken.',
 steps:['Knie leicht beugen.','Hüfte nach hinten schieben, der Oberkörper kippt nach vorn.','Alle drei Kontaktpunkte bleiben am Stab.','Wenn die Beinrückseite deutlich zieht: aufrichten und dabei das Gesäß anspannen.'],
 cue:'Das Gewicht bleibt über dem Mittelfuß.',
 err:['Der Stab löst sich am Kopf oder am Kreuzbein, dann rundet der Rücken.','Knie beugen statt Hüfte nach hinten.'],
 sled:'Lehrt dich, die Vorbeuge aus der Hüfte zu machen statt aus dem Rücken.',
 dose:'10 langsame Wiederholungen',easy:'Ohne Stab, Hände an den Hüften.',hard:'Auf einem Bein.',q:'hip hinge dowel',
 anim:{base:'stand',frames:[{armN:-25,foreN:20,armF:-160,foreF:15,sc:{foreN:.7,foreF:.6},d:1,h:.6},{lumb:128,thor:128,head:128,thighN:20,shinN:-5,thighF:20,shinF:-5,armN:-77,foreN:-32,armF:-212,foreF:-37,sc:{foreN:.7,foreF:.6},d:1.6,h:1}],anchor:'ankleN',props:[{t:'stick'}],hl:['thighN'],th:1}},

{id:'wade',name:'Wadendehnung an der Wand',reg:'leg',type:'stat',sides:true,
 mp:['Zwillingswadenmuskel (Knie gestreckt)','Schollenmuskel (Knie gebeugt)'],ms:['Achillessehne','Fußsohle'],
 start:'Vor einer Wand stehen, Hände etwa auf Schulterhöhe.',
 steps:['Linkes Bein weit zurück, Ferse am Boden, Fußspitze zeigt nach vorn.','Vorderes Knie beugen und die Hüfte Richtung Wand schieben, bis die hintere Wade zieht.','Nach der halben Zeit das hintere Knie beugen. Die Ferse bleibt unten, der Zug wandert tiefer.','Seite wechseln.'],
 cue:'Beide Varianten machen: gestreckt für den Zwillingswadenmuskel, gebeugt für den Schollenmuskel.',
 err:['Fuß nach außen gedreht.','Ferse hebt ab.'],
 sled:'Freie Waden lassen die Beinrückseite in der Vorbeuge weiter aufgehen.',
 dose:'30 s je Variante und Seite',easy:'Kürzerer Schritt.',hard:'Vorfuß auf eine Stufe.',q:'wall calf stretch gastrocnemius soleus',
 anim:{base:'stand',frames:[{lumb:163,thor:160,head:160,thighN:22,shinN:0,thighF:-20,shinF:-20,footF:90,armN:98,foreN:92,armF:98,foreF:92,d:1,h:2.2},{lumb:165,thor:162,head:162,thighN:32,shinN:-10,thighF:-5,shinF:-30,footF:90,armN:98,foreN:92,armF:98,foreF:92,d:1.5,h:2.2}],anchor:'ankleN',props:[{t:'wall',f:0}],hl:['shinF'],th:0}},

{id:'dog',name:'Herabschauender Hund',reg:'leg',type:'dyn',
 mp:['Waden','Oberschenkelrückseite'],ms:['Latissimus','Schultern','Rückenstrecker'],
 start:'Vierfüßlerstand, Zehen aufstellen.',
 steps:['Knie abheben und das Gesäß nach hinten-oben schieben: ein umgedrehtes V.','Der Rücken bleibt lang, die Knie dürfen gebeugt sein.','Abwechselnd ein Knie beugen und die andere Ferse Richtung Boden drücken.','Zum Schluss 20 s ruhig halten.'],
 cue:'Langer Rücken hat Vorrang vor gestreckten Beinen.',
 err:['Runder Rücken, weil die Beine gestreckt erzwungen werden.','Schultern rutschen zu den Ohren.'],
 sled:'Dehnt die ganze hintere Kette von der Hand bis zur Ferse in einer Position.',
 dose:'8 pro Seite, dann 20 s halten',easy:'Hände auf einem Stuhl.',hard:'Ein Bein zur Decke heben.',q:'downward dog pedaling',
 anim:{base:'stand',frames:[{lumb:48,thor:46,head:35,armN:42,foreN:42,armF:42,foreF:42,thighN:12,shinN:-45,footN:62,thighF:-25,shinF:-25,footF:90,d:.9,h:.5},{lumb:48,thor:46,head:35,armN:42,foreN:42,armF:42,foreF:42,thighF:12,shinF:-45,footF:62,thighN:-25,shinN:-25,footN:90,d:.9,h:.5}],anchor:'handN',hl:['shinN','thighN','shinF','thighF'],th:0}},

{id:'vorbeuge',name:'Stehende Vorbeuge',reg:'leg',type:'stat',
 mp:['Oberschenkelrückseite','Waden'],ms:['Rückenstrecker','Gesäß'],
 start:'Hüftbreit stehen.',
 steps:['Knie deutlich beugen, aus der Hüfte nach vorn, Bauch auf die Oberschenkel, Hände zu den Zehen oder zum Boden.','Die Brust bleibt auf den Oberschenkeln, die Knie langsam strecken, bis es zieht.','Ganz entspannen, den Kopf hängen lassen.','Mit gebeugten Knien Wirbel für Wirbel aufrollen.'],
 cue:'Das ist auch dein Fortschritts-Test: Abstand der Fingerspitzen zum Boden messen.',
 err:['Knie durchdrücken und nach unten federn.','Kalt ausführen.'],
 sled:'Führt alles zusammen, was die Einzelübungen vorbereitet haben.',
 dose:'30–45 s',easy:'Hände auf einen Stuhl oder Block.',hard:'Auf einer Stufe stehend.',q:'standing forward fold bent knees',
 anim:{base:'stand',frames:[{d:1,h:.5},{thighN:38,shinN:-14,thighF:38,shinF:-14,lumb:45,thor:25,head:15,armN:6,foreN:4,armF:6,foreF:4,d:1.8,h:1},{thighN:6,shinN:-2,thighF:6,shinF:-2,lumb:55,thor:20,head:6,armN:3,foreN:0,armF:3,foreF:0,d:2,h:1.6},{thighN:6,shinN:-2,thighF:6,shinF:-2,lumb:50,thor:8,head:0,armN:0,foreN:0,armF:0,foreF:0,d:1.2,h:2}],anchor:'ankleN',hl:['thighN','shinN'],th:2}},

{id:'zehen',name:'Vorbeuge mit hochgezogenen Zehen',reg:'leg',type:'stat',
 mp:['Waden','Fußsohle (Plantarfaszie)'],ms:['Oberschenkelrückseite'],
 start:'Vorfüße auf ein Buch, Brett oder gerolltes Handtuch stellen, Fersen am Boden.',
 steps:['Knie leicht gebeugt, aus der Hüfte vorbeugen.','Die Hände Richtung Boden sinken lassen.','Knie langsam strecken.','Der Zug verlagert sich in Wade und Kniekehle.'],
 cue:'Die Erhöhung muss nur 2–4 cm hoch sein.',
 err:['Zu hohe Erhöhung.','Mit Schwung nach unten.'],
 sled:'Nimmt die Waden gezielt mit in die Vorbeuge, die beim normalen Zehen-Berühren oft zu kurz kommen.',
 dose:'30 s',easy:'Niedrigere Erhöhung.',hard:'Länger halten.',q:'forward fold toes elevated',
 anim:{base:'stand',frames:[{footN:110,footF:110,d:1,h:.5},{footN:110,footF:110,thighN:36,shinN:-14,thighF:36,shinF:-14,lumb:47,thor:25,head:15,armN:6,foreN:4,armF:6,foreF:4,d:1.8,h:1},{footN:110,footF:110,thighN:6,shinN:-2,thighF:6,shinF:-2,lumb:56,thor:18,head:6,armN:3,foreN:0,armF:3,foreF:0,d:2,h:2}],anchor:'ankleN',props:[{t:'wedge'}],hl:['shinN'],th:2}},

{id:'startImit',name:'Start-Imitation',reg:'start',type:'dyn',
 mp:['Rumpfbeuger und -strecker im Wechsel','Hüftbeuger','Latissimus und Schultern'],ms:['Oberschenkelrückseite'],
 start:'Langsitz auf dem Boden oder einer Bank, Beine gestreckt.',
 steps:['Oberkörper weit nach vorn, die Arme greifen über die Knie hinaus nach vorn (wie an die Startgriffe).','Kontrolliert nach hinten lehnen, als würdest du an den Griffen ziehen.','Wieder tief nach vorn und 2–3 Paddelbewegungen neben dem Körper.','Flach nach hinten ablegen, dann wieder aufsetzen.'],
 cue:'Locker und rhythmisch, noch nicht mit voller Kraft.',
 err:['Nur aus den Armen arbeiten, statt den Rumpf mitzunehmen.','Beim Ablegen ins Hohlkreuz fallen.'],
 sled:'Verbindet die Beweglichkeit direkt mit deinem Startablauf.',
 dose:'8–10 Wiederholungen',easy:'Nur Vor- und Zurücklehnen.',hard:'Mit leichtem Widerstand (Theraband).',q:'luge start technique',
 anim:{base:'long',frames:[{armN:40,foreN:40,armF:40,foreF:40,d:1,h:.3},{lumb:128,thor:108,head:110,armN:95,foreN:92,armF:95,foreF:92,d:.9,h:.2},{lumb:205,thor:200,head:190,armN:105,foreN:100,armF:105,foreF:100,d:.9,h:.2},{lumb:120,thor:100,head:105,armN:70,foreN:30,armF:70,foreF:30,d:.8,h:.05},{lumb:122,thor:104,head:105,armN:40,foreN:-60,armF:40,foreF:-60,d:.4,h:.05},{lumb:120,thor:100,head:105,armN:70,foreN:30,armF:70,foreF:30,d:.4,h:.05},{lumb:122,thor:104,head:105,armN:40,foreN:-60,armF:40,foreF:-60,d:.4,h:.05},{lumb:268,thor:270,head:268,armN:90,foreN:90,armF:90,foreF:90,d:1.2,h:1}],props:[{t:'sled'}],hl:['lumb','thor'],th:1}}
];
const EXM={};EX.forEach(e=>EXM[e.id]=e);

/* =========================================================
   Kinematik + Rendering
   ========================================================= */
function fk(p,ex){
  const s=k=>(p.sc&&p.sc[k]!=null)?p.sc[k]:1;
  const P={};P.hip=[0,0];
  const hw=(p.hipW||0)/2, ph=pv(p.lumb);
  P.hipN=ad(P.hip,ph,hw);P.hipF=ad(P.hip,ph,-hw);
  P.mid=ad(P.hip,dv(p.lumb),L.lumb*s('lumb'));
  P.sh=ad(P.mid,dv(p.thor),L.thor*s('thor'));
  const sw=(p.shW||0)/2, ps=pv(p.thor);
  P.shN=ad(P.sh,ps,sw);P.shF=ad(P.sh,ps,-sw);
  if(p.view==='side'){P.hipF=[P.hipF[0]-2.5,P.hipF[1]-1.5];P.shF=[P.shF[0]-2.5,P.shF[1]-1.5];}
  P.neck=ad(P.sh,dv(p.head),L.neck*s('head'));
  P.headC=ad(P.neck,dv(p.head),L.head*s('head'));
  for(const n of ['N','F']){
    P['elbow'+n]=ad(P['sh'+n],dv(p['arm'+n]),L.arm*s('arm'+n));
    P['hand'+n]=ad(P['elbow'+n],dv(p['fore'+n]),L.fore*s('fore'+n));
    P['knee'+n]=ad(P['hip'+n],dv(p['thigh'+n]),L.thigh*s('thigh'+n));
    P['ankle'+n]=ad(P['knee'+n],dv(p['shin'+n]),L.shin*s('shin'+n));
    P['toe'+n]=ad(P['ankle'+n],dv(p['foot'+n]),L.foot*s('foot'+n));
  }
  const props=(ex&&ex.anim.props)||[];
  for(const pr of props){
    if(pr.t==='roller'){P.rollC=[P.mid[0],P.mid[1]+11];P.rollB=[P.mid[0],P.mid[1]+18];}
    if(pr.t==='sled'){P.sledB=[P.hip[0],P.hip[1]+16];}
  }
  return P;
}
function groundPts(P,p){
  const out=[];
  for(const k in P){if(k==='headC'||k==='rollC')continue;out.push(P[k]);}
  out.push([P.headC[0],P.headC[1]+L.head]);
  return out;
}
function place(ex,p){
  const P=fk(p,ex);
  let dx=0,dy=0;
  if(p.view!=='top'){let my=-1e9;for(const q of groundPts(P,p))my=Math.max(my,q[1]);dy=-my;}
  const a=ex.anim.anchor;
  if(a&&ex._ref){dx=ex._ref[0]-P[a][0];if(p.view==='top')dy=ex._ref[1]-P[a][1];}
  for(const k in P){P[k]=[P[k][0]+dx,P[k][1]+dy];}
  return P;
}
const ease=u=>.5-.5*Math.cos(Math.PI*u);
function lerpPose(a,b,u){
  const o={view:b.view,sc:{}};
  for(const k of AK){const x=a[k]||0,y=b[k]||0;o[k]=x+(y-x)*u;}
  for(const k of SK){const x=(a.sc&&a.sc[k]!=null)?a.sc[k]:1,y=(b.sc&&b.sc[k]!=null)?b.sc[k]:1;o.sc[k]=x+(y-x)*u;}
  return o;
}
function prep(ex){
  if(ex._fr)return;
  const A=ex.anim, base=B[A.base];
  let fr=A.frames.map(f=>{const p=Object.assign({},base,f);p.sc=Object.assign({},base.sc||{},f.sc||{});p.d=f.d!=null?f.d:1.2;p.h=f.h!=null?f.h:.6;return p;});
  if(A.pingpong)fr=fr.concat(fr.slice(1,-1).reverse().map(p=>Object.assign({},p)));
  ex._fr=fr;ex._T=fr.reduce((s,p)=>s+p.d+p.h,0);
  ex._ref=null;
  if(A.anchor){const P0=place(ex,fr[0]);ex._ref=P0[A.anchor];}
  const wall=(A.props||[]).find(x=>x.t==='wall');
  if(wall){const Pw=place(ex,fr[wall.f||0]);ex._wallX=Pw.handN[0]+3;}
  // Bounding box
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  const N=72;
  for(let i=0;i<N;i++){
    const p=poseAt(ex,ex._T*i/N);const P=place(ex,p);
    for(const k in P){const q=P[k];const r=(k==='headC')?L.head:(k==='rollC'?7:0);x0=Math.min(x0,q[0]-r);x1=Math.max(x1,q[0]+r);y0=Math.min(y0,q[1]-r);y1=Math.max(y1,q[1]+r);}
  }
  if(ex._wallX!=null){x1=Math.max(x1,ex._wallX+4);y0=Math.min(y0,-120);}
  if(ex._fr[0].view!=='top')y1=Math.max(y1,0);
  ex._bb={x0,x1,y0,y1};
}
function poseAt(ex,t){
  const fr=ex._fr;const T=ex._T;t=((t%T)+T)%T;
  let acc=0;
  for(let i=0;i<fr.length;i++){
    const f=fr[i];
    if(t<acc+f.d){const prev=fr[(i-1+fr.length)%fr.length];return lerpPose(prev,f,ease((t-acc)/f.d));}
    acc+=f.d;
    if(t<acc+f.h)return lerpPose(f,f,0);
    acc+=f.h;
  }
  return lerpPose(fr[0],fr[0],0);
}

let COL={};
function readColors(){
  const cs=getComputedStyle(document.documentElement);
  const g=n=>cs.getPropertyValue(n).trim();
  COL={ink:g('--ink'),far:g('--far'),hl:g('--accent'),floor:g('--floor'),mat:g('--mat'),muted:g('--muted'),surface:g('--surface'),hip:g('--r-hip'),prop:g('--r-hip'),line:g('--line')};
}
readColors();

function drawFigure(cv,ex,t,opts={}){
  prep(ex);
  const dpr=Math.min(window.devicePixelRatio||1,2.5);
  const W=cv.clientWidth,H=cv.clientHeight;
  if(!W||!H)return;
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);}
  const c=cv.getContext('2d');
  c.setTransform(dpr,0,0,dpr,0,0);
  c.clearRect(0,0,W,H);
  const p=poseAt(ex,t);const P=place(ex,p);
  const bb=ex._bb;const pad=opts.pad!=null?opts.pad:Math.max(10,Math.min(W,H)*.08);
  const bw=bb.x1-bb.x0,bh=bb.y1-bb.y0;
  let s=Math.min((W-2*pad)/bw,(H-2*pad)/bh);
  const ox=W/2-(bb.x0+bb.x1)/2*s, oy=H/2-(bb.y0+bb.y1)/2*s;
  c.save();
  if(opts.mirror){c.translate(W,0);c.scale(-1,1);}
  c.translate(ox,oy);c.scale(s,s);
  c.lineCap='round';c.lineJoin='round';
  const lw=1/s;
  // Boden / Matte
  if(p.view==='top'){
    c.fillStyle=COL.mat;const m=8;
    roundRect(c,bb.x0-m,bb.y0-m,bw+2*m,bh+2*m,10);c.fill();
  }else{
    c.strokeStyle=COL.floor;c.lineWidth=2*lw;
    c.beginPath();c.moveTo((-ox)/s,0);c.lineTo((W-ox)/s,0);c.stroke();
    c.lineWidth=1*lw;
    for(let x=Math.floor((-ox)/s/14)*14;x<(W-ox)/s;x+=14){c.beginPath();c.moveTo(x,0);c.lineTo(x-6,7);c.stroke();}
  }
  const props=ex.anim.props||[];
  // Requisiten hinten
  for(const pr of props){
    if(pr.t==='wall'){c.fillStyle=COL.floor;c.fillRect(ex._wallX,bb.y0-10,6,-bb.y0+10);}
    if(pr.t==='roller'){c.fillStyle=COL.prop;c.globalAlpha=.85;c.beginPath();c.arc(P.rollC[0],P.rollC[1],7,0,Math.PI*2);c.fill();c.globalAlpha=1;}
    if(pr.t==='sled'){
      c.fillStyle=COL.floor;c.strokeStyle=COL.muted;c.lineWidth=2*lw;
      const x0=P.hip[0]-14,x1=P.toeN[0]+6,y=P.hip[1]+4;
      roundRect(c,x0,y,x1-x0,6,3);c.fill();
      c.beginPath();c.moveTo(x0+4,y+6);c.lineTo(x0+4,y+12);c.moveTo(x1-10,y+6);c.lineTo(x1-10,y+12);c.stroke();
      c.lineWidth=2.5*lw;c.beginPath();c.moveTo(x0-4,y+12);c.lineTo(x1+2,y+12);c.quadraticCurveTo(x1+10,y+12,x1+10,y+4);c.stroke();
    }
    if(pr.t==='wedge'){c.fillStyle=COL.prop;c.globalAlpha=.8;const tx=P.toeN[0];c.beginPath();c.moveTo(tx-16,0);c.lineTo(tx+4,0);c.lineTo(tx+4,P.toeN[1]+1.5);c.closePath();c.fill();c.globalAlpha=1;}
  }
  const hl=new Set(ex.anim.hl||[]);
  const seg=(a,b,w,col)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(P[a][0],P[a][1]);c.lineTo(P[b][0],P[b][1]);c.stroke();};
  const limb=(n,col,alpha)=>{
    c.globalAlpha=alpha;
    const hc=hl=>COL.hl;
    seg('hip'+n,'knee'+n,7,hl.has('thigh'+n)?COL.hl:col);
    seg('knee'+n,'ankle'+n,6.2,hl.has('shin'+n)?COL.hl:col);
    seg('ankle'+n,'toe'+n,5,col);
    c.globalAlpha=1;
  };
  const arm=(n,col,alpha)=>{
    c.globalAlpha=alpha;
    seg('sh'+n,'elbow'+n,6,hl.has('arm'+n)?COL.hl:col);
    seg('elbow'+n,'hand'+n,5.2,col);
    c.globalAlpha=1;
  };
  const side=p.view==='side';
  const farCol=side?COL.far:COL.ink;
  const farA=side?1:.92;
  arm('F',farCol,farA);limb('F',farCol,farA);
  // Rumpf
  if(side){
    c.strokeStyle=COL.ink;c.lineWidth=11;
    c.beginPath();c.moveTo(P.hip[0],P.hip[1]);c.quadraticCurveTo(P.mid[0],P.mid[1],P.sh[0],P.sh[1]);c.stroke();
    if(hl.has('lumb')||hl.has('thor')){
      c.strokeStyle=COL.hl;c.lineWidth=5;c.beginPath();
      const m=[(P.hip[0]+P.mid[0])/2,(P.hip[1]+P.mid[1])/2],n=[(P.mid[0]+P.sh[0])/2,(P.mid[1]+P.sh[1])/2];
      if(hl.has('lumb')&&hl.has('thor')){c.moveTo(P.hip[0],P.hip[1]);c.quadraticCurveTo(P.mid[0],P.mid[1],P.sh[0],P.sh[1]);}
      else if(hl.has('lumb')){c.moveTo(P.hip[0],P.hip[1]);c.quadraticCurveTo(m[0],m[1],P.mid[0],P.mid[1]);}
      else{c.moveTo(P.mid[0],P.mid[1]);c.quadraticCurveTo(n[0],n[1],P.sh[0],P.sh[1]);}
      c.stroke();
    }
  }else{
    seg('hipF','hipN',9,COL.ink);
    seg('hip','mid',9,hl.has('lumb')?COL.hl:COL.ink);
    seg('mid','sh',9,hl.has('thor')?COL.hl:COL.ink);
    seg('shF','shN',8,hl.has('thor')?COL.hl:COL.ink);
  }
  seg('sh','neck',5,COL.ink);
  c.fillStyle=COL.ink;c.beginPath();c.arc(P.headC[0],P.headC[1],L.head*(p.view==='top'?.9:1),0,Math.PI*2);c.fill();
  // Gelenk-Markierungen (Zielzone)
  for(const k of ['hip','hipN','hipF']){
    if(hl.has(k)){c.fillStyle=COL.hl;c.globalAlpha=.9;c.beginPath();c.arc(P[k][0],P[k][1],6.5,0,Math.PI*2);c.fill();c.globalAlpha=1;}
  }
  limb('N',COL.ink,1);arm('N',COL.ink,1);
  // Requisiten vorn
  for(const pr of props){
    if(pr.t==='strap'){c.strokeStyle=COL.prop;c.lineWidth=2.2;c.setLineDash([4,3]);c.beginPath();c.moveTo(P.handN[0],P.handN[1]);c.lineTo((P.toeN[0]+P.ankleN[0])/2,(P.toeN[1]+P.ankleN[1])/2);c.stroke();c.setLineDash([]);}
    if(pr.t==='stick'){
      const d=[P.sh[0]-P.hip[0],P.sh[1]-P.hip[1]];const l=Math.hypot(d[0],d[1]);const u=[d[0]/l,d[1]/l];const bk=[u[1],-u[0]];
      const a=[P.hip[0]-u[0]*10+bk[0]*6.5,P.hip[1]-u[1]*10+bk[1]*6.5];
      const b=[P.headC[0]+u[0]*12+bk[0]*(L.head+1.5),P.headC[1]+u[1]*12+bk[1]*(L.head+1.5)];
      c.strokeStyle=COL.prop;c.lineWidth=3;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();
    }
  }
  c.restore();
}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function thumbT(ex){prep(ex);let acc=0;const i=Math.min(ex.anim.th||0,ex._fr.length-1);for(let k=0;k<=i;k++){acc+=ex._fr[k].d;if(k<i)acc+=ex._fr[k].h;}return acc+.01;}

/* Animations-Schleife */
const live=new Map();
let rafOn=false;
function loop(now){
  for(const [cv,a] of live){
    if(!cv.isConnected){live.delete(cv);continue;}
    if(a.playing){a.t+=(now-(a.last||now))/1000*a.speed;}
    a.last=now;
    drawFigure(cv,EXM[a.id],a.t,{mirror:a.mirror});
  }
  if(live.size)requestAnimationFrame(loop);else rafOn=false;
}
function animate(cv,id,o={}){
  live.set(cv,Object.assign({id,t:o.t!=null?o.t:0,speed:1,playing:true,last:0,mirror:false},o));
  if(!rafOn){rafOn=true;requestAnimationFrame(loop);}
  return live.get(cv);
}
function drawThumbs(root=document){
  root.querySelectorAll('canvas[data-thumb]').forEach(cv=>{const ex=EXM[cv.dataset.thumb];drawFigure(cv,ex,thumbT(ex),{pad:5});});
}

/* =========================================================
   Speicher
   ========================================================= */
const KEY='rodelmobility.v1';
const DEF={sessions:[],tests:[],next:0,dur:40,sound:true,voice:false,vibrate:true,prep:5,switchPause:3,theme:'system',startTime:'',installHide:false,swaps:{}};
let S=load();
function load(){try{const r=JSON.parse(localStorage.getItem(KEY)||'null');return Object.assign(structuredClone(DEF),r||{});}catch(e){return structuredClone(DEF);}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}

/* =========================================================
   Programme
   ========================================================= */
const BLOCKS=[
  {k:'A',reg:'back',name:'Rücken & Wirbelsäule',short:'Rücken',ex:['katze','thread','lumbRot','kindSeite','abrollen']},
  {k:'B',reg:'hip',name:'Hüfte & Becken',short:'Hüfte',ex:['hipCircle','n9090','lunge','hocke','frosch']},
  {k:'C',reg:'leg',name:'Beinrückseite & Waden',short:'Beine',ex:['hinge','dog','wade','gurt','vorbeuge']}
];
const COMP=[
  {ph:'Aktivierung',items:[{id:'warm',t:180,note:'Gehen oder locker traben, Arme kreisen'}]},
  {ph:'Wirbelsäule',items:[{id:'katze',t:60,note:'10 Wiederholungen'},{id:'thread',t:90,note:'8 pro Seite',sides:true},{id:'lumbRot',t:80,note:'8 pro Seite, langsam',sides:true}]},
  {ph:'Hüfte',items:[{id:'hipCircle',t:120,note:'8 pro Seite und Richtung',sides:true},{id:'n9090',t:60,note:'8 Wechsel'},{id:'hocke',t:30,note:'30 s halten, Knie sanft nach außen'},{id:'lunge',t:90,note:'8 pro Seite, dynamisch rein und raus',sides:true},{id:'kosak',t:90,note:'8 pro Seite, abwechselnd'}]},
  {ph:'Beinrückseite',items:[{id:'hinge',t:60,note:'10 Wiederholungen'},{id:'dog',t:60,note:'8 pro Seite die Fersen senken'},{id:'wade',t:30,note:'nur 15 s pro Seite',sides:true}]},
  {ph:'Startspezifisch',items:[{id:'startImit',t:90,note:'10 Wiederholungen, locker'},{id:'startImit',t:60,note:'Ein paar echte Startbewegungen ohne volle Intensität',label:'Probestarts'}]}
];
const COOL=[
  {ph:'Nach dem Lauf',items:[{id:'kind',t:45,note:'Ruhig atmen, 45 s halten'},{id:'taube',t:90,note:'45 s pro Seite',sides:true},{id:'frosch',t:45,note:'45 s halten'},{id:'lat',t:45,note:'45 s halten'},{id:'sitVorbeuge',t:45,note:'Erst Hüfte, dann Rücken'},{id:'kneeChest',t:45,note:'Sanft wiegen'}]}
];
let compMode='pre';
function blockEx(i){const b=BLOCKS[i];const sw=S.swaps[b.k];return (sw&&sw.length===b.ex.length)?sw.slice():b.ex.slice();}
function dailyItems(i){return blockEx(i).map(id=>({id,t:S.dur,sides:!!EXM[id].sides,note:EXM[id].sides?`${S.dur/2} s pro Seite`:(EXM[id].type==='dyn'?'Langsam und kontrolliert':'Ruhig halten und ausatmen')}));}
const trD=()=>S.prep, trC=()=>S.prep+3;
const BUFFER_MIN=10;
function totalSec(items,tr){return items.reduce((s,x)=>s+x.t,0)+items.length*tr;}
const mmss=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};

/* =========================================================
   Hilfsfunktionen
   ========================================================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const dkey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>dkey(new Date());
const regDot=r=>`<span class="dot" style="background:var(${REG[r].c})"></span>`;
const IC={
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>',
  next:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 5v14l10-7zM17 5h2.5v14H17z"/></svg>',
  prev:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5v14L9 12zM4.5 5H7v14H4.5z"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17h.01"/></svg>',
  search:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>'
};
function row(item,opts={}){
  const ex=EXM[item.id];
  const t=item.sides?`2 × ${mmss(item.t/2)}`:mmss(item.t);
  return `<li class="row" data-id="${ex.id}">
    <canvas class="th" data-thumb="${ex.id}" aria-hidden="true"></canvas>
    <button class="main" data-open="${ex.id}"><div class="nm">${esc(item.label||ex.name)}</div><div class="sub">${esc(item.note||ex.mp.slice(0,2).join(' · '))}</div></button>
    <div class="right"><span class="chip">${t}</span>${opts.swap!=null?`<button class="ibtn" data-swap="${opts.swap}" aria-label="${esc(ex.name)} tauschen" title="Übung tauschen">${IC.swap}</button>`:''}</div>
  </li>`;
}
function streak(){
  const days=new Set(S.sessions.map(s=>s.date));let n=0;const d=new Date();
  if(!days.has(dkey(d)))d.setDate(d.getDate()-1);
  while(days.has(dkey(d))){n++;d.setDate(d.getDate()-1);}
  return n;
}
function weekCount(){
  const d=new Date();const wd=(d.getDay()+6)%7;const mon=new Date(d.getFullYear(),d.getMonth(),d.getDate()-wd);
  const days=new Set(S.sessions.filter(s=>new Date(s.date+'T12:00')>=mon).map(s=>s.date));return days.size;
}

/* =========================================================
   Ansicht: Heute
   ========================================================= */
function renderHeute(){
  const i=S.next%3,b=BLOCKS[i],items=dailyItems(i);
  const last=S.sessions.filter(s=>s.type==='daily').slice(-1)[0];
  const nxt=BLOCKS[(i+1)%3];
  $('#v-heute').innerHTML=`
  ${installBanner()}
  <div class="hero">
    <div class="eyebrow">Tagestraining · rotiert A → B → C</div>
    <div class="rot" role="group" aria-label="Block wählen">
      ${BLOCKS.map((x,j)=>`<button data-block="${j}" class="${j===i?'on':''}" aria-pressed="${j===i}"><b>${x.k}</b><span>${x.short}</span></button>`).join('')}
    </div>
    <div>
      <h1 class="blk">${b.name}</h1>
      <p class="meta">${items.length} Übungen · ca. ${mmss(totalSec(items,trD()))} Min.${last?` · zuletzt Block ${esc(last.block)}`:''} · danach Block ${nxt.k}</p>
    </div>
    <div class="seg"><span class="lbl">Zeit pro Übung</span><div class="opts">${[30,40,60].map(v=>`<button data-dur="${v}" class="${S.dur===v?'on':''}">${v} s</button>`).join('')}</div></div>
    <button class="start" id="goDaily">${IC.play}Block ${b.k} starten <small>${mmss(totalSec(items,trD()))}</small></button>
  </div>
  <ol class="list">${items.map((it,j)=>row(it,{swap:j})).join('')}</ol>
  <div class="note">Mit <b>⇄</b> tauschst du eine Übung gegen eine andere aus derselben Region. Empfehlung: alle 2–3 Wochen eine pro Block. ${S.swaps[b.k]?'<button class="linkbtn" id="resetSwap">Standard wiederherstellen</button>':''}</div>
  <div class="stats">
    <div class="stat"><b>${streak()}</b><span>Tage in Folge</span></div>
    <div class="stat"><b>${weekCount()}</b><span>Tage diese Woche</span></div>
    <div class="stat"><b>${S.sessions.length}</b><span>Einheiten gesamt</span></div>
  </div>`;
  drawThumbs($('#v-heute'));
}
$('#v-heute').addEventListener('click',e=>{
  const bl=e.target.closest('[data-block]');if(bl){S.next=+bl.dataset.block;save();renderHeute();return;}
  const du=e.target.closest('[data-dur]');if(du){S.dur=+du.dataset.dur;save();renderHeute();return;}
  const sw=e.target.closest('[data-swap]');
  if(sw){
    const i=S.next%3,b=BLOCKS[i];const list=blockEx(i);const j=+sw.dataset.swap;
    const pool=EX.filter(x=>x.reg===b.reg).map(x=>x.id);
    let k=pool.indexOf(list[j]);
    for(let n=0;n<pool.length;n++){k=(k+1)%pool.length;if(!list.includes(pool[k])){list[j]=pool[k];break;}}
    S.swaps[b.k]=list;if(list.join()===b.ex.join())delete S.swaps[b.k];save();renderHeute();return;
  }
  if(e.target.closest('#instGo')){doInstall();return;}
  if(e.target.closest('#instNo')){S.installHide=true;save();renderHeute();return;}
  if(e.target.closest('#resetSwap')){delete S.swaps[BLOCKS[S.next%3].k];save();renderHeute();return;}
  const op=e.target.closest('[data-open]');if(op){openSheet(op.dataset.open);return;}
  if(e.target.closest('#goDaily')){const i=S.next%3;startPlayer({items:dailyItems(i),trans:trD(),type:'daily',block:BLOCKS[i].k,title:'Block '+BLOCKS[i].k+' · '+BLOCKS[i].name});}
});

/* =========================================================
   Ansicht: Wettkampf
   ========================================================= */
function renderComp(){
  const prog=compMode==='pre'?COMP:COOL;
  const all=prog.flatMap(p=>p.items);
  $('#v-wettkampf').innerHTML=`
  <div>
    <div class="eyebrow">Wettkampftag</div>
    <h1 class="blk" style="margin-top:4px">${compMode==='pre'?'Vor dem Start':'Nach dem Lauf'}</h1>
  </div>
  <div class="tabs2" role="group">
    <button data-mode="pre" class="${compMode==='pre'?'on':''}"><b>Vor dem Start</b><span>dynamisch · ca. ${Math.round(totalSec(COMP.flatMap(p=>p.items),trC())/60)} Min.</span></button>
    <button data-mode="post" class="${compMode==='post'?'on':''}"><b>Nach dem Lauf</b><span>statisch · ca. ${Math.round(totalSec(COOL.flatMap(p=>p.items),trC())/60)} Min.</span></button>
  </div>
  ${compMode==='pre'?`<div class="warn">${IC.warn}<div>Vor dem Start nur <b>kurze, bewegte Dehnung</b>. Lang gehaltene statische Dehnungen (über 60 s pro Muskel) können die Schnellkraft kurzzeitig senken. Taube, Frosch und lange Halteübungen kommen nach dem Lauf.</div></div>`:`<div class="note">Nach dem letzten Lauf oder am Abend. Jetzt darfst du lange halten: <b>ruhig ausatmen, nicht federn</b>.</div>`}
  ${compMode==='pre'?`<div class="plan"><label for="stt">Dein Start um<input id="stt" type="time" value="${esc(S.startTime)}"></label><div class="out" id="planOut">${planText()}</div></div>`:''}
  <button class="start" id="goComp">${IC.play}Programm starten <small>${mmss(totalSec(all,trC()))}</small></button>
  ${prog.map(p=>`<div class="phase"><h3>${p.ph}<span>${mmss(p.items.reduce((s,x)=>s+x.t,0))}</span></h3><ol class="list">${p.items.map(it=>row(it)).join('')}</ol></div>`).join('')}`;
  drawThumbs($('#v-wettkampf'));
}
function planText(){
  const tot=Math.ceil(totalSec(COMP.flatMap(p=>p.items),trC())/60);
  if(!S.startTime)return `Startzeit eintragen. Die App rechnet aus, wann du mit dem Programm beginnst (${tot} Min. + ${BUFFER_MIN} Min. Puffer für Weg und Schlitten).`;
  const [h,m]=S.startTime.split(':').map(Number);let t=h*60+m-tot-BUFFER_MIN;t=(t+1440)%1440;
  return `<b>${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')} Uhr</b>beginnen: ${tot} Min. Programm, danach ${BUFFER_MIN} Min. Puffer bis zum Start.`;
}
$('#v-wettkampf').addEventListener('input',e=>{if(e.target.id==='stt'){S.startTime=e.target.value;save();$('#planOut').innerHTML=planText();}});
$('#v-wettkampf').addEventListener('click',e=>{
  const m=e.target.closest('[data-mode]');if(m){compMode=m.dataset.mode;renderComp();return;}
  const op=e.target.closest('[data-open]');if(op){openSheet(op.dataset.open);return;}
  if(e.target.closest('#goComp')){const prog=compMode==='pre'?COMP:COOL;startPlayer({items:prog.flatMap(p=>p.items.map(x=>Object.assign({ph:p.ph},x))),trans:trC(),type:compMode==='pre'?'comp':'cool',block:compMode==='pre'?'W':'N',title:compMode==='pre'?'Wettkampf · vor dem Start':'Wettkampf · nach dem Lauf'});}
});

/* =========================================================
   Ansicht: Übungen
   ========================================================= */
let fReg='all',fQ='';
function renderLib(){
  const v=$('#v-uebungen');
  if(!v.dataset.init){
    v.dataset.init=1;
    v.innerHTML=`<div><div class="eyebrow">Bibliothek</div><h1 class="blk" style="margin-top:4px">${EX.length} Übungen</h1></div>
    <label class="search">${IC.search}<input id="q" type="search" placeholder="Übung oder Muskel suchen, z. B. Piriformis" autocomplete="off"></label>
    <div class="chips" id="regs"></div><div id="libList" style="display:flex;flex-direction:column;gap:10px"></div>`;
    $('#q').addEventListener('input',e=>{fQ=e.target.value.trim().toLowerCase();renderLibList();});
    v.addEventListener('click',e=>{
      const r=e.target.closest('[data-reg]');if(r){fReg=r.dataset.reg;renderLibList();return;}
      const op=e.target.closest('[data-open]');if(op)openSheet(op.dataset.open);
    });
  }
  renderLibList();
}
function renderLibList(){
  const regs=['all','back','hip','leg','start','warm'];
  $('#regs').innerHTML=regs.map(r=>`<button data-reg="${r}" class="${fReg===r?'on':''}">${r==='all'?'Alle':regDot(r)+(REG[r].s||REG[r].n)}</button>`).join('');
  const f=EX.filter(x=>(fReg==='all'||x.reg===fReg)&&(!fQ||(x.name+' '+x.mp.join(' ')+' '+x.ms.join(' ')).toLowerCase().includes(fQ)));
  const groups=['back','hip','leg','start','warm'].map(r=>[r,f.filter(x=>x.reg===r)]).filter(g=>g[1].length);
  $('#libList').innerHTML=groups.length?groups.map(([r,xs])=>`<div class="grp">${regDot(r)}${REG[r].n}</div><ol class="list">${xs.map(x=>`<li class="row"><canvas class="th" data-thumb="${x.id}" aria-hidden="true"></canvas><button class="main" data-open="${x.id}"><div class="nm">${esc(x.name)}</div><div class="sub">${esc(x.mp.join(' · '))}</div></button><div class="right"><span class="chip">${x.type==='dyn'?'dynamisch':'statisch'}</span></div></li>`).join('')}</ol>`).join(''):`<div class="note">Keine Übung gefunden. Versuch es mit einem Muskel wie „Wade“ oder „Adduktoren“.</div>`;
  drawThumbs($('#libList'));
}

/* =========================================================
   Detail-Sheet
   ========================================================= */
let sheetAnim=null,lastFocus=null;
function openSheet(id){
  const ex=EXM[id];prep(ex);lastFocus=document.activeElement;
  const view=ex._fr[0].view==='top'?'Ansicht von oben':(ex._fr[0].view==='front'?'Ansicht von vorn':'Ansicht von der Seite');
  $('#sheet').innerHTML=`
  <div class="grab"><div><div class="eyebrow">${regDot(ex.reg)} ${REG[ex.reg].n}</div></div><button class="xbtn" id="shClose" aria-label="Schließen">${IC.x}</button></div>
  <h2 id="sh-title">${esc(ex.name)}</h2>
  <div class="pills"><span class="chip">${ex.type==='dyn'?'Dynamisch':'Statisch halten'}</span>${ex.sides?'<span class="chip">Beide Seiten</span>':''}<span class="chip">${esc(ex.dose)}</span></div>
  <div class="stage" style="margin-top:14px">
    <canvas id="shCv" aria-label="Animation: ${esc(ex.name)}"></canvas>
    <div class="cap"><span class="dot" style="background:var(--accent)"></span>Zielzone · ${view}</div>
    <div class="bar">
      <button class="play" id="shPlay">${IC.play}<span>Bewegung ansehen</span></button>
      <button class="speed" id="shSpeed" hidden>Tempo 1×</button>
      <a class="ext" href="https://www.google.com/search?tbm=isch&q=${encodeURIComponent(ex.q)}" target="_blank" rel="noopener">Fotos im Web ↗</a>
    </div>
  </div>
  <div class="sec"><h3>Zielmuskeln</h3><div class="musc">${ex.mp.map(m=>`<span class="chip p">${esc(m)}</span>`).join('')}${ex.ms.map(m=>`<span class="chip">${esc(m)}</span>`).join('')}</div></div>
  <div class="sec"><h3>Ausgangsposition</h3><p>${esc(ex.start)}</p></div>
  <div class="sec"><h3>Ausführung</h3><ol class="steps">${ex.steps.map(s=>`<li><span>${esc(s)}</span></li>`).join('')}</ol></div>
  <div class="sec"><h3>Darauf achten</h3><p>${esc(ex.cue)}</p></div>
  <div class="sec"><h3>Häufige Fehler</h3><ul class="bul">${ex.err.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div>
  <div class="sec"><div class="sled"><b>Warum fürs Rodeln</b>${esc(ex.sled)}</div></div>
  <div class="sec"><div class="two"><div class="mini"><b>Leichter</b>${esc(ex.easy)}</div><div class="mini"><b>Schwerer</b>${esc(ex.hard)}</div></div></div>
  <div class="sec"><p style="font-size:13px;color:var(--muted)">Dehnen darf ziehen, aber nicht stechen. Bei Bandscheibenproblemen, Ischias oder Taubheitsgefühlen vorher mit Physio oder Arzt sprechen.</p></div>`;
  $('#scrim').hidden=false;$('#sheet').scrollTop=0;
  history.pushState({ov:'sheet'},'');
  const cv=$('#shCv');
  requestAnimationFrame(()=>{sheetAnim=animate(cv,id,{t:thumbT(ex),playing:false});});
  $('#shClose').focus();
}
function closeSheet(fromPop){if($('#scrim').hidden)return;if(!fromPop&&history.state&&history.state.ov==='sheet'){ignorePop=true;history.back();}$('#scrim').hidden=true;const cv=$('#shCv');if(cv)live.delete(cv);$('#sheet').innerHTML='';sheetAnim=null;if(lastFocus&&lastFocus.focus)lastFocus.focus();}
$('#scrim').addEventListener('click',e=>{
  if(e.target.id==='scrim'||e.target.closest('#shClose')){closeSheet(false);return;}
  if(e.target.closest('#shPlay')&&sheetAnim){
    sheetAnim.playing=!sheetAnim.playing;sheetAnim.last=0;
    $('#shPlay').innerHTML=sheetAnim.playing?IC.pause+'<span>Pause</span>':IC.play+'<span>Weiter</span>';
    $('#shSpeed').hidden=false;return;
  }
  if(e.target.closest('#shSpeed')&&sheetAnim){sheetAnim.speed=sheetAnim.speed===1?.5:1;$('#shSpeed').textContent='Tempo '+(sheetAnim.speed===1?'1×':'½×');}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#scrim').hidden)closeSheet(false);else if(!$('#player').hidden)askClose();}});

/* =========================================================
   Ansicht: Fortschritt
   ========================================================= */
let delArm=null;
function renderProg(){
  const d=new Date();const wd=(d.getDay()+6)%7;
  const start=new Date(d.getFullYear(),d.getMonth(),d.getDate()-wd-28);
  const byDay={};S.sessions.forEach(s=>{(byDay[s.date]=byDay[s.date]||[]).push(s.type);});
  let cal='';['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(h=>cal+=`<div class="h">${h}</div>`);
  for(let k=0;k<35;k++){
    const x=new Date(start.getFullYear(),start.getMonth(),start.getDate()+k);const key=dkey(x);
    const t=byDay[key];const fut=x>d;
    cal+=`<div class="d ${t?(t.some(y=>y!=='daily')?'comp':'has'):''} ${key===today()?'today':''}" style="${fut?'opacity:.35':''}" title="${key}">${x.getDate()}</div>`;
  }
  const tests=S.tests.slice().sort((a,b)=>a.date.localeCompare(b.date));
  const sample=!tests.length;
  const data=sample?[{date:'2026-09-01',cm:18},{date:'2026-09-08',cm:15},{date:'2026-09-15',cm:13},{date:'2026-09-22',cm:10}]:tests;
  $('#v-fortschritt').innerHTML=`
  <div><div class="eyebrow">Fortschritt</div><h1 class="blk" style="margin-top:4px">Dranbleiben</h1></div>
  <div class="stats">
    <div class="stat"><b>${streak()}</b><span>Tage in Folge</span></div>
    <div class="stat"><b>${weekCount()}</b><span>Tage diese Woche</span></div>
    <div class="stat"><b>${S.sessions.length}</b><span>Einheiten gesamt</span></div>
  </div>
  <div class="card">
    <h2>Letzte 5 Wochen</h2>
    <div class="cal">${cal}</div>
    <div class="legend"><span><i style="background:var(--ink)"></i>Tagestraining</span><span><i style="background:var(--accent)"></i>Wettkampfprogramm</span></div>
    <p>Ziel: 4–5 Tage pro Woche. Regelmäßigkeit bringt mehr als eine lange Einheit.</p>
  </div>
  <div class="card">
    <h2>Vorbeuge-Test</h2>
    <p>Alle 2–3 Wochen, aufgewärmt: Knie gestreckt, langsam vorbeugen, Abstand Mittelfinger zum Boden messen. 0 cm = Boden berührt, negative Werte = tiefer (auf einer Stufe stehend).</p>
    ${chartSVG(data,sample)}
    ${sample?'<p style="font-size:13px"><b style="color:var(--accent)">Beispielwerte.</b> Sobald du deinen ersten Test einträgst, siehst du hier deine eigene Kurve.</p>':''}
    <form class="test" id="testForm">
      <label for="tcm">Abstand in cm<input id="tcm" type="number" inputmode="decimal" step="0.5" min="-40" max="80" placeholder="z. B. 12" required></label>
      <label for="tdate">Datum<input id="tdate" type="date" value="${today()}" required></label>
      <button type="submit">Eintragen</button>
    </form>
    ${tests.length?`<ul class="entries">${tests.slice().reverse().map(t=>`<li><span>${fmtDate(t.date)}</span><span><b>${t.cm} cm</b> <button data-del="${t.date}|${t.cm}" class="${delArm===t.date+'|'+t.cm?'really':''}">${delArm===t.date+'|'+t.cm?'Wirklich löschen?':'Löschen'}</button></span></li>`).join('')}</ul>`:''}
  </div>
  <div class="card" id="settings">
    <h2>Einstellungen</h2>
    <div>
      ${isStandalone()?'':(deferredPrompt?`<div class="set"><span>App installieren<small>Eigenes Symbol auf dem Startbildschirm, Vollbild, funktioniert offline</small></span><button class="sbtn" id="instGo2">Installieren</button></div>`:'')}
      <div class="set stack"><span>Installation prüfen<small>Zeigt, ob Chrome die App installieren kann und was fehlt</small></span><button class="sbtn" id="chkBtn">Jetzt prüfen</button></div>
      <div id="chkOut" hidden></div>
      <div class="set stack"><span>Darstellung</span><div class="opts">${[['system','Auto'],['light','Hell'],['dark','Dunkel']].map(([k,l])=>`<button data-theme-set="${k}" class="${S.theme===k?'on':''}">${l}</button>`).join('')}</div></div>
      <div class="set stack"><span>Vorbereitung<small>Zeit zum Einnehmen der Position</small></span><div class="opts">${[3,5,10].map(v=>`<button data-prep="${v}" class="${S.prep===v?'on':''}">${v} s</button>`).join('')}</div></div>
      <div class="set stack"><span>Pause beim Seitenwechsel<small>Timer hält kurz an</small></span><div class="opts">${[0,3,5].map(v=>`<button data-sp="${v}" class="${S.switchPause===v?'on':''}">${v?v+' s':'Aus'}</button>`).join('')}</div></div>
      <div class="set"><span>Vibration<small>Kurzes Vibrieren bei Start, Seitenwechsel und Ende</small></span><button class="tog" data-set="vibrate" aria-pressed="${S.vibrate}" aria-label="Vibration"></button></div>
      <div class="set"><span>Signaltöne<small>Piepton in den letzten 3 Sekunden und beim Seitenwechsel</small></span><button class="tog" data-set="sound" aria-pressed="${S.sound}" aria-label="Signaltöne"></button></div>
      <div class="set"><span>Sprachansage<small>Liest den Namen der nächsten Übung vor</small></span><button class="tog" data-set="voice" aria-pressed="${S.voice}" aria-label="Sprachansage"></button></div>
      <div class="set stack"><span>Datensicherung<small>Sichern, bevor du das Handy wechselst oder den Browser-Speicher löschst</small></span><div class="btnrow"><button class="sbtn" id="expBtn">Exportieren</button><button class="sbtn" id="impBtn">Importieren</button></div></div>
      <div class="set"><span>Alle Daten löschen<small>Einheiten, Tests und Einstellungen auf diesem Gerät</small></span><button class="linkbtn" id="wipe">${delArm==='ALL'?'Wirklich alles löschen?':'Zurücksetzen'}</button></div>
    </div>
    <p style="font-size:13px">Deine Daten liegen auf diesem Gerät. Mit dem Sync der Training-App werden sie zusätzlich in deiner privaten Cloud gesichert.</p>
    <div class="card" style="margin-top:14px"><h2 style="font-size:16px;margin:0 0 6px">Wissenschaftliche Grundlagen</h2>
      <p style="font-size:13px;margin:0 0 6px">Vor dem Start nur bewegtes, kurzes Dehnen: lange statische Dehnung (über 60 s je Muskel) kann die Schnellkraft kurzzeitig senken – Behm et al. 2016; Opplert &amp; Babault 2018.</p>
      <p style="font-size:13px;margin:0 0 6px">Beweglichkeit wächst vor allem mit der gesamten Dehnzeit pro Woche und Muskel; regelmäßig (4–5 Tage pro Woche) bringt mehr als selten und lang – Thomas et al. 2018.</p>
      <p style="font-size:13px;margin:0">Der Vorbeuge-Test (Finger-Boden-Abstand) ist ein einfaches, wiederholbares Maß für die Beweglichkeit der Beinrückseite – nur mit sich selbst vergleichen, immer aufgewärmt.</p>
    </div>
  </div>`;
}
function fmtDate(k){const [y,m,d]=k.split('-');return `${+d}.${+m}.${y}`;}
function chartSVG(data,sample){
  const W=340,H=170,l=34,r=12,t=14,b=26;
  const vals=data.map(d=>d.cm);let mn=Math.min(0,...vals),mx=Math.max(...vals,5);
  const span=mx-mn;const step=span>40?20:span>20?10:5;mn=Math.floor(mn/step)*step;mx=Math.ceil(mx/step)*step;
  const n=data.length;
  const X=i=>n===1?(l+(W-l-r)/2):l+i*(W-l-r)/(n-1);
  const Y=v=>t+(v-mn)/(mx-mn)*(H-t-b); // invertiert: kleinere Werte (besser) oben
  let g='';
  for(let v=mn;v<=mx;v+=step){g+=`<line x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${l-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${v}</text>`;}
  const zero=`<line x1="${l}" x2="${W-r}" y1="${Y(0)}" y2="${Y(0)}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3"/><text x="${W-r}" y="${Y(0)-5}" text-anchor="end" font-size="11" fill="var(--accent)" font-weight="600">Boden</text>`;
  const pts=data.map((d,i)=>`${X(i)},${Y(d.cm)}`).join(' ');
  const area=n>1?`<polygon points="${X(0)},${H-b} ${pts} ${X(n-1)},${H-b}" fill="var(--ink)" opacity=".06"/>`:'';
  const dots=data.map((d,i)=>`<circle cx="${X(i)}" cy="${Y(d.cm)}" r="${i===n-1?5:3.5}" fill="${i===n-1?'var(--accent)':'var(--surface)'}" stroke="${i===n-1?'var(--accent)':'var(--ink)'}" stroke-width="2"/>`).join('');
  const lastL=`<text x="${X(n-1)}" y="${Y(data[n-1].cm)-10}" text-anchor="${n>1?'end':'middle'}" font-size="12" font-weight="600" fill="var(--ink)">${data[n-1].cm} cm</text>`;
  const xl=data.map((d,i)=>(n<=6||i===0||i===n-1)?`<text x="${X(i)}" y="${H-8}" text-anchor="middle" font-size="10.5" fill="var(--muted)">${fmtDate(d.date).split('.').slice(0,2).join('.')}.</text>`:'').join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Verlauf Finger-Boden-Abstand${sample?' (Beispiel)':''}" style="${sample?'opacity:.75':''}">${g}${zero}${area}${n>1?`<polyline points="${pts}" fill="none" stroke="var(--ink)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`:''}${dots}${lastL}${xl}</svg>`;
}
$('#v-fortschritt').addEventListener('submit',e=>{
  if(e.target.id!=='testForm')return;e.preventDefault();
  const cm=parseFloat($('#tcm').value);const date=$('#tdate').value||today();
  if(isNaN(cm))return;
  S.tests=S.tests.filter(t=>t.date!==date);S.tests.push({date,cm});save();delArm=null;renderProg();
});
$('#v-fortschritt').addEventListener('click',e=>{
  const st=e.target.closest('[data-set]');if(st){const k=st.dataset.set;S[k]=!S[k];save();st.setAttribute('aria-pressed',S[k]);if(k==='voice'&&S.voice)speak('Sprachansage an');if(k==='vibrate'&&S.vibrate)vib(80);return;}
  const dl=e.target.closest('[data-del]');
  if(dl){const k=dl.dataset.del;if(delArm===k){const [d,c]=k.split('|');S.tests=S.tests.filter(t=>!(t.date===d&&String(t.cm)===c));save();delArm=null;}else delArm=k;renderProg();return;}
  if(e.target.closest('#wipe')){if(delArm==='ALL'){S=structuredClone(DEF);save();delArm=null;applyTheme();toast('Alle Daten gelöscht');}else delArm='ALL';renderProg();return;}
  const th=e.target.closest('[data-theme-set]');if(th){S.theme=th.dataset.themeSet;save();applyTheme();renderProg();return;}
  const pr=e.target.closest('[data-prep]');if(pr){S.prep=+pr.dataset.prep;save();renderProg();return;}
  const sp=e.target.closest('[data-sp]');if(sp){S.switchPause=+sp.dataset.sp;save();renderProg();return;}
  if(e.target.closest('#expBtn')){exportData();return;}
  if(e.target.closest('#impBtn')){$('#impFile').click();return;}
  if(e.target.closest('#instGo2')){doInstall();return;}
  if(e.target.closest('#chkBtn')){checkInstall();return;}
});

/* =========================================================
   Player
   ========================================================= */
let PL=null,actx=null,wake=null;
function beep(f=880,d=.12,v=.25){
  if(!S.sound)return;
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(v,actx.currentTime);g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+d);o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+d+.02);}catch(e){}
}
function vib(p){if(!S.vibrate)return;try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}}
function speak(txt){
  if(!S.voice)return;
  try{const u=new SpeechSynthesisUtterance(txt);u.lang='de-DE';u.rate=1.02;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}
}
function startPlayer(cfg){
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();actx.resume&&actx.resume();}catch(e){}
  PL={cfg,i:0,phase:'prep',left:cfg.trans,paused:false,last:performance.now(),elapsed:0,side:0,hold:0,beeped:{}};
  history.pushState({ov:'player'},'');
  const pl=$('#player');pl.hidden=false;document.body.style.overflow='hidden';
  pl.innerHTML=`
  <div class="ph"><div class="prog" id="plProg">${cfg.items.map(()=>'<i><b></b></i>').join('')}</div><button class="xbtn" id="plX" aria-label="Training beenden">${IC.x}</button></div>
  <div class="body" id="plBody">
    <div class="pstage"><canvas id="plCv"></canvas><div class="side" id="plSide" hidden></div><div class="flash" id="plFlash" hidden></div></div>
    <div class="pinfo"><div class="k" id="plK"></div><h2 id="plName"></h2><p id="plNote"></p></div>
    <div class="clock"><div class="t" id="plT">0:00</div><div class="nx" id="plNx"></div></div>
    <div class="tbar"><b id="plBar"></b></div>
    <div class="ctrl"><button id="plPrev" aria-label="Vorherige Übung">${IC.prev}</button><button class="big" id="plPlay" aria-label="Pause">${IC.pause}</button><button id="plNext" aria-label="Nächste Übung">${IC.next}</button></div>
  </div>`;
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(w=>wake=w).catch(()=>{});}catch(e){}
  PL.anim=animate($('#plCv'),cfg.items[0].id,{playing:true});
  showItem();
  speak('Als Nächstes: '+(cfg.items[0].label||EXM[cfg.items[0].id].name));
  requestAnimationFrame(tick);
}
function showItem(){
  const it=PL.cfg.items[PL.i],ex=EXM[it.id];
  PL.anim.id=it.id;PL.anim.t=0;PL.anim.mirror=false;
  $('#plK').textContent=PL.phase==='prep'?'Gleich · '+(PL.i+1)+' von '+PL.cfg.items.length:(it.ph?it.ph+' · ':'')+(PL.i+1)+' von '+PL.cfg.items.length;
  $('#plName').textContent=it.label||ex.name;
  $('#plNote').textContent=it.note||'';
  const n=PL.cfg.items[PL.i+1];
  $('#plNx').innerHTML=PL.phase==='prep'?`<span>Dauer</span><b>${it.sides?'2 × '+mmss(it.t/2):mmss(it.t)}</b>`:(n?`<span>Danach</span><b>${esc(n.label||EXM[n.id].name)}</b>`:'<span>Danach</span><b>Geschafft</b>');
  $('#plT').classList.toggle('prep',PL.phase==='prep');
  const sd=$('#plSide');
  if(it.sides&&PL.phase==='work'){sd.hidden=false;sd.textContent=PL.side?'Linke Seite':'Rechte Seite';}else sd.hidden=true;
  [...$('#plProg').children].forEach((el,j)=>{el.firstChild.style.transform=`scaleX(${j<PL.i?1:0})`;});
}
function tick(now){
  if(!PL)return;
  const dt=Math.min(.25,(now-PL.last)/1000);PL.last=now;
  if(!PL.paused&&PL.hold>0){
    PL.hold-=dt;const f=$('#plFlash');f.hidden=false;f.textContent='Seite wechseln · '+Math.max(1,Math.ceil(PL.hold));
    if(PL.hold<=0){f.hidden=true;beep(1320,.2,.3);vib(150);}
  }else if(!PL.paused){
    PL.left-=dt;
    const it=PL.cfg.items[PL.i];
    const sec=Math.ceil(PL.left);
    if(sec<=3&&sec>=1&&!PL.beeped[PL.phase+sec]){PL.beeped[PL.phase+sec]=1;beep(880,.1,.2);vib(35);}
    if(PL.phase==='work'){
      PL.elapsed+=dt;
      if(it.sides&&!PL.side&&PL.left<=it.t/2){
        PL.side=1;PL.anim.mirror=true;beep(1320,.12);setTimeout(()=>beep(1320,.12),180);speak('Seite wechseln');vib([120,80,120]);
        showItem();if(S.switchPause>0){PL.hold=S.switchPause;}else flash('Seite wechseln');
      }
    }
    if(PL.left<=0)advance();
  }
  if(!PL)return;
  const it=PL.cfg.items[PL.i];
  const tot=PL.phase==='prep'?PL.cfg.trans:it.t;
  $('#plT').textContent=mmss(PL.left);
  $('#plBar').style.transform=`scaleX(${Math.min(1,1-PL.left/tot)})`;
  if(PL.phase==='work')$('#plProg').children[PL.i].firstChild.style.transform=`scaleX(${Math.min(1,1-PL.left/tot)})`;
  PL.anim.playing=!PL.paused;
  requestAnimationFrame(tick);
}
function flash(txt){const f=$('#plFlash');f.textContent=txt;f.hidden=false;clearTimeout(flash.t);flash.t=setTimeout(()=>f.hidden=true,1100);}
function advance(){
  const it=PL.cfg.items[PL.i];
  if(PL.phase==='prep'){PL.phase='work';PL.left=it.t;PL.side=0;PL.beeped={};beep(1320,.25,.3);vib(200);flash('Los');showItem();return;}
  if(PL.i<PL.cfg.items.length-1){
    PL.i++;PL.phase='prep';PL.left=PL.cfg.trans;PL.beeped={};showItem();
    const n=PL.cfg.items[PL.i];speak('Als Nächstes: '+(n.label||EXM[n.id].name));
  }else finish();
}
function jump(d){
  const ni=PL.i+d;
  if(ni<0){PL.phase='prep';PL.left=PL.cfg.trans;}
  else if(ni>=PL.cfg.items.length){finish();return;}
  else{PL.i=ni;PL.phase='prep';PL.left=PL.cfg.trans;}
  PL.beeped={};PL.side=0;PL.hold=0;$('#plFlash').hidden=true;showItem();
}
function finish(){
  const cfg=PL.cfg;const mins=Math.max(1,Math.round(PL.elapsed/60));
  S.sessions.push({date:today(),type:cfg.type,block:cfg.block,sec:Math.round(PL.elapsed)});
  if(cfg.type==='daily')S.next=(BLOCKS.findIndex(b=>b.k===cfg.block)+1)%3;
  save();beep(1046,.18);setTimeout(()=>beep(1318,.3),200);speak('Geschafft');vib([200,100,200]);
  live.delete($('#plCv'));
  const nx=cfg.type==='daily'?`Morgen ist Block ${BLOCKS[S.next].k} dran: ${BLOCKS[S.next].name}.`:(cfg.type==='comp'?'Viel Erfolg auf der Bahn.':'Gute Erholung.');
  $('#plBody').innerHTML=`<div class="fin"><div class="eyebrow">${esc(cfg.title)}</div><h2>Geschafft</h2><p>${mins} Min. aktiv, ${cfg.items.length} Übungen. ${nx}</p><div class="stats"><div class="stat"><b>${streak()}</b><span>Tage in Folge</span></div><div class="stat"><b>${weekCount()}</b><span>diese Woche</span></div><div class="stat"><b>${S.sessions.length}</b><span>gesamt</span></div></div><button class="start" id="plDone">Fertig</button></div>`;
  [...$('#plProg').children].forEach(el=>el.firstChild.style.transform='scaleX(1)');
  PL=null;
}
let ignorePop=false;
function closePlayer(fromPop){if(!fromPop&&history.state&&history.state.ov==='player'){ignorePop=true;history.back();}PL=null;live.delete($('#plCv'));const pl=$('#player');pl.hidden=true;pl.innerHTML='';document.body.style.overflow='';try{wake&&wake.release();}catch(e){}wake=null;try{speechSynthesis.cancel();}catch(e){}renderAll();}
function askClose(){
  if(!PL){closePlayer(false);return;}
  PL.paused=true;updPlay();
  const b=$('#plBody');if($('#plAsk'))return;
  const d=document.createElement('div');d.id='plAsk';d.className='warn';d.style.marginBottom='6px';
  d.innerHTML=`${IC.warn}<div style="flex:1">Training beenden? Die Einheit wird dann nicht gespeichert.<div style="display:flex;gap:14px;margin-top:8px"><button class="linkbtn" id="plQuit">Beenden</button><button class="linkbtn" id="plStay" style="color:var(--ink)">Weitermachen</button></div></div>`;
  b.insertBefore(d,b.firstChild);
}
function updPlay(){const b=$('#plPlay');if(b){b.innerHTML=PL&&PL.paused?IC.play:IC.pause;b.setAttribute('aria-label',PL&&PL.paused?'Weiter':'Pause');}}
$('#player').addEventListener('click',e=>{
  if(e.target.closest('#plDone')){closePlayer(false);return;}
  if(e.target.closest('#plX')){askClose();return;}
  if(e.target.closest('#plQuit')){closePlayer(false);return;}
  if(e.target.closest('#plStay')){$('#plAsk').remove();if(PL){PL.paused=false;PL.last=performance.now();updPlay();}return;}
  if(!PL)return;
  if(e.target.closest('#plPlay')){PL.paused=!PL.paused;PL.last=performance.now();updPlay();return;}
  if(e.target.closest('#plNext')){jump(1);return;}
  if(e.target.closest('#plPrev')){jump(PL.phase==='work'&&PL.left<(PL.cfg.items[PL.i].t-3)?0:-1);return;}
});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&$('#player').hidden===false){try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(w=>wake=w).catch(()=>{});}catch(e){}}});

/* =========================================================
   Navigation
   ========================================================= */
const TABS=['heute','wettkampf','uebungen','fortschritt'];
let tab='heute';
function setTab(t,o={}){
  if(!o.fromPop&&!o.init&&!document.documentElement.classList.contains('sg-embed')){
    if(t!=='heute'&&tab==='heute')history.pushState({tab:t},'');
    else if(t!=='heute')history.replaceState({tab:t},'');
    else if(t==='heute'&&history.state&&history.state.tab){history.back();return;}
  }
  tab=t;TABS.forEach(x=>{$('#v-'+x).hidden=x!==t;});
  document.querySelectorAll('.tabbar button').forEach(b=>{b.classList.toggle('on',b.dataset.tab===t);b.setAttribute('aria-current',b.dataset.tab===t?'page':'false');});
  try{localStorage.setItem(KEY+'.tab',t);}catch(e){}
  renderTab();window.scrollTo(0,0);
}
function renderTab(){if(tab==='heute')renderHeute();if(tab==='wettkampf')renderComp();if(tab==='uebungen')renderLib();if(tab==='fortschritt')renderProg();}
function renderAll(){renderTab();}
document.querySelector('.tabbar').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)setTab(b.dataset.tab);});
$('#today').textContent=new Date().toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short'});
function onTheme(){readColors();drawThumbs();updMeta();}
function updMeta(){const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#EAF0F2');}
function applyTheme(){const r=document.documentElement;if(S.theme==='system'){if(r.dataset.themeByApp){r.removeAttribute('data-theme');delete r.dataset.themeByApp;}}else{r.setAttribute('data-theme',S.theme);r.dataset.themeByApp='1';}onTheme();}
window.addEventListener('popstate',()=>{
  if(ignorePop){ignorePop=false;return;}
  if(!$('#player').hidden){if(PL){history.pushState({ov:'player'},'');askClose();}else closePlayer(true);return;}
  if(!$('#scrim').hidden){closeSheet(true);return;}
  if(tab!=='heute')setTab('heute',{fromPop:true});
});
$('#gear').addEventListener('click',()=>{setTab('fortschritt');requestAnimationFrame(()=>{const el=$('#settings');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});});});
/* Installation */
let deferredPrompt=null;
const isStandalone=()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;}catch(e){return false;}};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;renderTab();});
window.addEventListener('appinstalled',()=>{deferredPrompt=null;toast('App installiert');renderTab();});
function installBanner(){
  if(!deferredPrompt||isStandalone()||S.installHide)return '';
  return `<div class="install"><div><b>Als App installieren</b>Startbildschirm-Symbol, Vollbild, offline nutzbar.</div><button id="instGo">Installieren</button><button class="no" id="instNo" aria-label="Hinweis ausblenden">${IC.x}</button></div>`;
}
async function doInstall(){if(!deferredPrompt)return;deferredPrompt.prompt();try{await deferredPrompt.userChoice;}catch(e){}deferredPrompt=null;renderTab();}
/* Datensicherung */
function exportData(){
  try{const blob=new Blob([JSON.stringify(S,null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='rodel-mobility-'+today()+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);toast('Sicherung gespeichert');}catch(e){toast('Export hat nicht geklappt');}
}
$('#impFile').addEventListener('change',e=>{
  const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||!Array.isArray(d.sessions))throw 0;S=Object.assign(structuredClone(DEF),d);save();applyTheme();renderTab();toast('Sicherung geladen: '+S.sessions.length+' Einheiten');}catch(err){toast('Datei ist keine Mobility-Sicherung');}e.target.value='';};
  r.readAsText(f);
});
async function checkInstall(){
  const out=$('#chkOut');out.hidden=false;out.innerHTML='<p style="padding:8px 0">Prüfe …</p>';
  const R=[];const add=(ok,t,h)=>R.push({ok,t,h});
  const host=location.hostname;
  const preview=/claude|anthropic|usercontent/.test(host)||location.protocol==='file:'||location.protocol==='blob:';
  if(preview){add(false,'Du bist nicht auf deiner GitHub-Adresse',location.protocol==='file:'?'Die Datei wurde direkt vom Handy geöffnet. Chrome installiert nur Apps von einer https-Adresse, also über GitHub Pages.':'Das ist die Vorschau in Claude. Installieren geht nur über deine GitHub-Adresse, z. B. https://NAME.github.io/rodel-mobility/');}
  else add(window.isSecureContext,'Sichere Adresse (https)',window.isSecureContext?'':'Die Adresse muss mit https:// beginnen.');
  let man=null;
  try{const r=await fetch('manifest.webmanifest',{cache:'no-store'});if(r.ok)man=await r.json();}catch(e){}
  add(!!man,'App-Beschreibung (manifest.webmanifest) gefunden',man?'':'Datei fehlt im Repository oder liegt in einem Unterordner. Sie muss neben index.html liegen.');
  if(man){
    let bad=[];
    for(const ic of man.icons||[]){try{const r=await fetch(ic.src,{cache:'no-store'});if(!r.ok)bad.push(ic.src);}catch(e){bad.push(ic.src);}}
    add(!bad.length,'App-Symbole erreichbar',bad.length?'Fehlt: '+bad.join(', ')+'. Diese Dateien neben index.html hochladen.':'');
  }
  let sw=false;
  try{sw=!!(navigator.serviceWorker&&await navigator.serviceWorker.getRegistration());}catch(e){}
  add(sw,'Offline-Modus (sw.js) aktiv',sw?'':'sw.js fehlt oder wurde noch nicht geladen. Seite einmal neu laden.');
  if(isStandalone())add(true,'App ist bereits installiert','');
  else add(!!deferredPrompt,'Chrome bietet die Installation an',deferredPrompt?'Tippe oben auf „Installieren“.':'Noch nicht. Wenn alles darüber grün ist: Seite neu laden, 30 Sekunden warten, dann Menü ⋮ → „App installieren“ oder „Zum Startbildschirm hinzufügen“.');
  out.innerHTML='<ul class="entries" style="margin:6px 0 10px">'+R.map(x=>`<li style="align-items:flex-start"><span><b style="color:${x.ok?'var(--r-leg)':'var(--accent)'}">${x.ok?'✓':'✗'}</b> ${esc(x.t)}${x.h?`<small style="display:block;color:var(--muted)">${esc(x.h)}</small>`:''}</span></li>`).join('')+'</ul>';
}
function toast(t){const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,2600);}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',onTheme);}catch(e){}
new MutationObserver(onTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>drawThumbs(),150);});
(function init(){
  let t='heute';const h=(location.hash||'').slice(1);
  if(TABS.includes(h))t=h;else{try{const s=localStorage.getItem(KEY+'.tab');if(TABS.includes(s))t=s;}catch(e){}}
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>drawThumbs());
  try{history.replaceState({root:1},'');}catch(e){}
  applyTheme();
  setTab('heute',{init:true});
  if(t!=='heute')setTab(t);
})();
