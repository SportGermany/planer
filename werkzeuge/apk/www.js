// Kopiert die App in den Ordner www/ für die APK. Die Pfade bleiben gleich wie im Netz (/planer/…),
// damit dieselben Dateien in Chrome und in der APK laufen. Start: www/index.html → /planer/app/
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..'), OUT = path.join(__dirname, 'www'), APP = path.join(OUT, 'planer');
const SKIP = new Set(['werkzeuge', '.git', '.github', 'node_modules', '.gitignore', '.nojekyll', 'CLAUDE.md', 'README.md']); // sw.js bleibt drin (wird nicht registriert, manche Seiten fragen ihn ab)
// Mehrere Apps (werkzeuge/PLAN-APPS.md): node www.js <app> – ohne Angabe die Planer-App wie bisher.
// Einzel-Apps bekommen nur ihre Ordner (dirs) + die Dateien im Hauptordner; Startseite = start; Version/Name aus apps.json.
const APPS = JSON.parse(fs.readFileSync(path.join(ROOT, 'werkzeuge/apps.json'), 'utf8')), KEY = process.argv[2] || 'planer', A = APPS[KEY];
if (!A || KEY[0] === '_') { console.error('Unbekannte App: ' + KEY + ' (bekannt: ' + Object.keys(APPS).filter(k => k[0] !== '_').join(', ') + ')'); process.exit(1); }
const ONLY = A.dirs ? new Set(A.dirs) : null;
fs.rmSync(OUT, { recursive: true, force: true });
let n = 0, bytes = 0;
(function copy(src, dst, top) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(e.name) || e.name.endsWith('.md')) continue;
    if (top && ONLY && e.isDirectory() && !ONLY.has(e.name)) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copy(s, d, false);
    else { fs.copyFileSync(s, d); n++; bytes += fs.statSync(s).size; }
  }
})(ROOT, APP, true);
fs.writeFileSync(path.join(OUT, 'index.html'), '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>html{background:#131313}</style><script>location.replace("/planer/' + A.start + '")</script>');
let ver = (/const VERSION = 'planer-([^']+)'/.exec(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8')) || [])[1];
// Einzel-App: eigene Version und Kennung in die kopierte design.js (Anzeige „Version …“, Update sucht <app>-v…)
const DJ = path.join(APP, 'sg/design.js');
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
fs.writeFileSync(path.join(__dirname, 'app.env'), 'APP=' + KEY + '\nAPP_ID=' + A.id + '\nAPP_NAME=' + A.name + '\nVER=' + ver + '\n');
console.log('www (' + KEY + '): ' + n + ' Dateien, ' + (bytes / 1048576).toFixed(1) + ' MB, Version ' + ver);
