# Eine App „planer“: Planer im Hauptordner, Training und Bibel als Unterordner.
# Legt die gemeinsamen Skripte (Design, Verbund, Übersicht, Training-Integration, Bibel-Installation) als Dateien
# unter planer/sg/ ab und bindet sie in jede Seite ein. Dateien statt Blöcken in der Seite: der Browser speichert
# den übersetzten Code zwischen – die Seiten starten dadurch etwa doppelt so schnell.
import re, os
# Versionsnummer der ganzen App: steht in sw.js (Cache-Name), in jeder Seite (window.SGVersion) und an jeder Skriptdatei.
# Bei jeder Veröffentlichung erhöhen – dann holt „Version aktualisieren“ die neue Fassung.
VERSION=os.environ.get('SGV','3.9.1')
HERE=os.path.dirname(os.path.abspath(__file__))
SP=os.path.join(HERE,'quellen')+'/'  # Quellen der gemeinsamen Skripte und des Sportwissenschafts-Generators
R=os.path.dirname(HERE)+'/'  # Wurzel des Repositorys
SHARED={'design.js':open(SP+'design.js').read().replace('__SGVERSION__',VERSION),'verbund.js':open(SP+'verbund.js').read(),
  'training-suite.js':open(SP+'training_suite.js').read(),'install.js':open(SP+'install.js').read(),
  # Suche der Hülle: Schnelleingabe, Such-Kern, Bibelstellen (reine Bausteine, mit Node getestet)
  'schnell.js':open(SP+'schnell.js').read(),'suche.js':open(SP+'suche.js').read(),'bibelstelle.js':open(SP+'bibelstelle.js').read()}
if os.path.exists(R+'sg/uebersicht.js'): os.remove(R+'sg/uebersicht.js')  # frühere Übersicht, ersetzt durch die Hülle
# Sportwissenschaft: Buchinhalt aus wissen/buch.md neu erzeugen
import subprocess; subprocess.run(['python3', SP+'gen_wissen.py'], check=True, stdout=subprocess.DEVNULL)
os.makedirs(R+'sg',exist_ok=True)
for k,v in SHARED.items(): open(R+'sg/'+k,'w').write(v)
# Suchdaten (Bahnen, Übungen) aus den Seiten auslesen → sg/suche-daten.js
subprocess.run(['node', SP+'suchdaten.js', R], check=True, stdout=subprocess.DEVNULL)
# Seite: (data-app, Design-Variablen, Sync-Gruppe, Extra-Attribute)
PAGES={
  'index.html':                   ('planer',   'kalender', '',          ' data-fab="off"'),
  'schule/index.html':            ('lernplan', 'lernplan', 'lernplan',  ''),
  'pause/index.html':             ('denkpause','panel',    'denkpause', ''),
  'training/index.html':          ('training', 'panel',    'training',  ''),
  'training/mobility/index.html': ('rodeln',   'rodeln',   'rodeln',    ''),
  'training/atmung/index.html':   ('puls',     'puls',     'puls',      ''),
  'training/bahnplan/index.html': ('bahnplan', 'bahn',     'bahnplan',  ''),
  'bibel/index.html':             ('bibel',    'bibel',    '',          ''),
  'wissen/index.html':            ('wissen',   'bahn',     '',          ''),
  'app/index.html':               ('planer',   'bahn',     '',          ' data-fab="off"'),
}
def strip(s):
    for a,b in [('<!-- suche:start -->','<!-- suche:end -->\n'),('<!-- verbund-design:start -->','<!-- verbund-design:end -->\n'),('<!-- gemeinsamer-kalender:start -->','<!-- gemeinsamer-kalender:end -->\n'),('<!-- training-suite:start -->','<!-- training-suite:end -->\n'),('<!-- uebersicht:start -->','<!-- uebersicht:end -->\n')]:
        s=re.sub(re.escape(a)+r'.*?'+re.escape(b),'',s,flags=re.S)
    return s
for path,(aid,dm,sid,extra) in PAGES.items():
    p=R+path; s=strip(open(p).read())
    up='../'*path.count('/')
    src=lambda f: up+'sg/'+f+'?v='+VERSION
    s=re.sub(r'<link rel="preconnect" href="https://fonts\.g[^>]*>\n|<link rel="stylesheet" href="https://fonts\.googleapis[^>]*>\n','',s)
    MAIN=path=='app/index.html'  # die Hülle: eine Navigation für alles (ersetzt die frühere Übersicht)
    block='<!-- verbund-design:start -->\n<script data-design="'+dm+'" data-sync="'+sid+'"'+(' data-dir="1"' if MAIN else '')+' src="'+src('design.js')+'"></script>\n<!-- verbund-design:end -->\n'
    if MAIN: block+='<!-- suche:start -->\n'+''.join('<script src="'+src(f)+'"></script>\n' for f in ['schnell.js','suche.js','bibelstelle.js','suche-daten.js'])+'<!-- suche:end -->\n'
    i=s.index('</head>'); s=s[:i]+block+s[i:]
    tail=''
    if aid=='training': tail+='<!-- training-suite:start -->\n<script src="'+src('training-suite.js')+'"></script>\n<!-- training-suite:end -->\n'
    if aid=='wissen': pass  # eigenständige Seite: nur Design, kein Kalender-Knopf
    elif aid=='bibel': tail+='<!-- gemeinsamer-kalender:start -->\n<script src="'+src('install.js')+'"></script>\n<!-- gemeinsamer-kalender:end -->\n'
    else: tail+=f'<!-- gemeinsamer-kalender:start -->\n<script data-app="{aid}"{extra} src="{src("verbund.js")}"></script>\n<!-- gemeinsamer-kalender:end -->\n'
    i=s.rindex('</body>'); s=s[:i]+tail+s[i:]
    # eigene ausgelagerte Skripte der Seite: Version anhängen (neue Fassung umgeht alte Zwischenspeicher)
    s=re.sub(r'(src="js/[^"?]+)\?v=[^"]*"',r'\1?v='+VERSION+'"',s)
    open(p,'w').write(s); print(path,'ok',len(s))
# Training: Datei-Import (CSV, GPX, TCX) rechnet in einem Worker – er lädt dieselben Rechenteile wie die Seite
t=open(R+'training/index.html').read()
parts=[re.search(r'<script id="'+i+r'" src="js/([^"?]+)',t).group(1) for i in ['coreScript','poolsScript','sportsScript','stretchScript','analysisScript']]
open(R+'training/js/csv-worker.js','w').write('/* Rechnet den Datei-Import (CSV, GPX, TCX) im Hintergrund – die Oberfläche bleibt flüssig. Wird von build.py erzeugt. */\n' +
  'importScripts(' + ', '.join("'"+x+'?v='+VERSION+"'" for x in parts) + ');\n' +
  'self.onmessage = function (ev) {\n  try { var r = self.WK.parseFitnessFile(ev.data.name, ev.data.text); self.postMessage({ ok: true, res: r }); }\n  catch (e) { self.postMessage({ ok: false, err: String(e) }); }\n};\n')
# Service Worker: Version und vollständige Liste aller Dateien für den Offline-Speicher
files=['./app/','./','./index.html','./schule/','./pause/','./training/','./training/mobility/','./training/atmung/','./training/bahnplan/','./bibel/','./bibel/elb1905.json','./wissen/',
  './manifest.json','./inter.woff2','./icon-192.png','./icon-512.png','./icon-maskable-192.png','./icon-maskable-512.png','./apple-touch-icon.png','./favicon.png']
for d,_,fs in sorted(os.walk(R)):
    if '/.git' in d or '/werkzeuge' in d: continue  # Werkzeugkoffer (auch die APK-Kopie) gehört nicht in den Offline-Speicher
    rel=d[len(R):]
    if rel=='sg' or rel.endswith('js') and os.path.basename(rel)=='js':
        files+=['./'+(rel+'/' if rel else '')+f+'?v='+VERSION for f in sorted(fs) if f.endswith('.js')]
sw=R+'sw.js'; t=open(sw).read()
t=re.sub(r"const VERSION = 'planer-[^']*';","const VERSION = 'planer-"+VERSION+"';",t)
shell='const SHELL = [\n'+',\n'.join('  '+', '.join("'"+x+"'" for x in files[i:i+6]) for i in range(0,len(files),6))+'\n];'
t=re.sub(r'const SHELL = \[.*?\];',shell,t,flags=re.S)
open(sw,'w').write(t); print('sw.js',VERSION,len(files),'Dateien')
