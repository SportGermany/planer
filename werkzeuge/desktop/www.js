// Stellt die App-Dateien für das PC-Programm zusammen (werkzeuge/desktop/www/planer/…): alles wie im Netz, ALLE Bereiche
// (kein schlanker Planer – am PC ist alles in einem Programm). design.js bekommt window.SGDesktop (PC-Ansicht, Update über .deb) und die Programmversion.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..'), OUT = path.join(__dirname, 'www'), APP = path.join(OUT, 'planer');
const SKIP = new Set(['werkzeuge', 'vorschau', 'kalender', '.git', '.github', 'node_modules', '.gitignore', '.nojekyll', 'CLAUDE.md', 'README.md']);
const VER = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version;
fs.rmSync(OUT, { recursive: true, force: true });
let n = 0, bytes = 0;
(function copy(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(e.name) || e.name.endsWith('.md')) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copy(s, d); else { fs.copyFileSync(s, d); n++; bytes += fs.statSync(s).size; }
  }
})(ROOT, APP);
const DJ = path.join(APP, 'sg/design.js'), t = fs.readFileSync(DJ, 'utf8');
const u = 'window.SGDesktop = { version: "' + VER + '", openExternal: function (u) { window.open(u, "_blank"); } };\n' + t.replace(/var VERSION = "[^"]*";/, 'var VERSION = "' + VER + '";');
if (u.indexOf('var VERSION = "' + VER + '"') < 0) { console.error('design.js: VERSION nicht gefunden'); process.exit(1); }
fs.writeFileSync(DJ, u);
console.log('www (desktop): ' + n + ' Dateien, ' + (bytes / 1048576).toFixed(1) + ' MB, Version ' + VER);
