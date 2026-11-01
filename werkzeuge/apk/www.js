// Kopiert die App in den Ordner www/ für die APK. Die Pfade bleiben gleich wie im Netz (/planer/…),
// damit dieselben Dateien in Chrome und in der APK laufen. Start: www/index.html → /planer/app/
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..'), OUT = path.join(__dirname, 'www'), APP = path.join(OUT, 'planer');
const SKIP = new Set(['werkzeuge', '.git', '.github', 'node_modules', '.gitignore', '.nojekyll', 'CLAUDE.md', 'README.md']); // sw.js bleibt drin (wird nicht registriert, manche Seiten fragen ihn ab)
// Mehrere Apps (werkzeuge/PLAN-APPS.md): node www.js <app> – ohne Angabe die Planer-App wie bisher.
// Einzel-Apps bekommen nur ihre Ordner (dirs) + die Dateien im Hauptordner; Startseite = start; Version/Name aus apps.json.
const APPS = JSON.parse(fs.readFileSync(path.join(ROOT, 'werkzeuge/apps.json'), 'utf8')), KEY = process.argv[2] || 'planer', A = APPS[KEY];
if (!A || KEY[0] === '_') { console.error('Unbekannte App: ' + KEY + ' (bekannt: ' + Object.keys(APPS).filter(k => k[0] !== '_').join(', ') + ')'); process.exit(1); }
const ONLY = A.dirs ? new Set(A.dirs) : null, OHNE = new Set(A.ohne || []);   // ohne: Bereiche, die eigene Apps sind (schlanker Planer)
fs.rmSync(OUT, { recursive: true, force: true });
let n = 0, bytes = 0;
(function copy(src, dst, top) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(e.name) || e.name.endsWith('.md')) continue;
    if (top && ONLY && e.isDirectory() && !ONLY.has(e.name)) continue;
    if (top && e.isDirectory() && OHNE.has(e.name)) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copy(s, d, false);
    else { fs.copyFileSync(s, d); n++; bytes += fs.statSync(s).size; }
  }
})(ROOT, APP, true);
fs.writeFileSync(path.join(OUT, 'index.html'), '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>html{background:#131313}</style><script>location.replace("/planer/' + A.start + '")</script>');
let ver = (/const VERSION = 'planer-([^']+)'/.exec(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8')) || [])[1];
// Einzel-App: eigene Version und Kennung in die kopierte design.js (Anzeige „Version …“, Update sucht <app>-v…)
const DJ = path.join(APP, 'sg/design.js');
// schlanker Planer: welche Bereiche fehlen (die öffnet er über ihre eigene App, siehe EXT in app/js/1-app.js)
if (A.ohne) fs.writeFileSync(DJ, 'window.SGOhne = ' + JSON.stringify(A.ohne) + ';\n' + fs.readFileSync(DJ, 'utf8'));
if (KEY !== 'planer') {
  ver = A.ver;
  const t = fs.readFileSync(DJ, 'utf8'), u = 'window.SGApp = "' + KEY + '";\n' + t.replace(/var VERSION = "[^"]*";/, 'var VERSION = "' + ver + '";');
  if (u === t) { console.error('design.js: VERSION nicht gefunden'); process.exit(1); }
  fs.writeFileSync(DJ, u);
}
// Paketname und App-Name für Capacitor und Android (Gradle bekommt -PappId, siehe app/build.gradle)
const CC = path.join(__dirname, 'capacitor.config.json'), cc = JSON.parse(fs.readFileSync(CC, 'utf8'));
cc.appId = A.id; cc.appName = A.name; fs.writeFileSync(CC, JSON.stringify(cc, null, 2) + '\n');
const SX = path.join(__dirname, 'android/app/src/main/res/values/strings.xml');
if (fs.existsSync(SX)) fs.writeFileSync(SX, fs.readFileSync(SX, 'utf8').replace(/(name="app_name">)[^<]*/, '$1' + A.name).replace(/(name="title_activity_main">)[^<]*/, '$1' + A.name)
  .replace(/(name="package_name">)[^<]*/, '$1' + A.id).replace(/(name="custom_url_scheme">)[^<]*/, '$1' + A.id));
// eigenes Symbol je App: Hintergrundfarbe + weißes Strich-Symbol (24er-Pfade wie in der App, mittig im 108er-Raster des adaptiven Symbols)
const RES = path.join(__dirname, 'android/app/src/main/res');
if (A.farbe && A.symbol && fs.existsSync(RES)) {
  fs.writeFileSync(path.join(RES, 'values/ic_launcher_background.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">' + A.farbe + '</color>\n</resources>\n');
  fs.writeFileSync(path.join(RES, 'drawable/ic_launcher_foreground_app.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">\n' +
    '  <group android:translateX="30" android:translateY="30" android:scaleX="2" android:scaleY="2">\n' +
    A.symbol.map(d => '    <path android:pathData="' + d + '" android:strokeColor="#FFFFFF" android:strokeWidth="1.8" android:strokeLineCap="round" android:strokeLineJoin="round" android:fillColor="#00000000" />').join('\n') +
    '\n  </group>\n</vector>\n');
  for (const f of ['ic_launcher.xml', 'ic_launcher_round.xml']) {
    const q = path.join(RES, 'mipmap-anydpi-v26', f);
    if (fs.existsSync(q)) fs.writeFileSync(q, fs.readFileSync(q, 'utf8').replace(/@mipmap\/ic_launcher_foreground/, '@drawable/ic_launcher_foreground_app'));
  }
}
fs.writeFileSync(path.join(__dirname, 'app.env'), 'APP=' + KEY + '\nAPP_ID=' + A.id + '\nAPP_NAME=' + A.name + '\nVER=' + ver + '\n');
console.log('www (' + KEY + '): ' + n + ' Dateien, ' + (bytes / 1048576).toFixed(1) + ' MB, Version ' + ver);
