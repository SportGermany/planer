// Kopiert die App in den Ordner www/ für die APK. Die Pfade bleiben gleich wie im Netz (/planer/…),
// damit dieselben Dateien in Chrome und in der APK laufen. Start: www/index.html → /planer/app/
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..'), OUT = path.join(__dirname, 'www'), APP = path.join(OUT, 'planer');
const SKIP = new Set(['werkzeuge', '.git', '.github', 'node_modules', '.gitignore', '.nojekyll', 'CLAUDE.md', 'README.md']); // sw.js bleibt drin (wird nicht registriert, manche Seiten fragen ihn ab)
fs.rmSync(OUT, { recursive: true, force: true });
let n = 0, bytes = 0;
(function copy(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(e.name) || e.name.endsWith('.md')) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copy(s, d);
    else { fs.copyFileSync(s, d); n++; bytes += fs.statSync(s).size; }
  }
})(ROOT, APP);
fs.writeFileSync(path.join(OUT, 'index.html'), '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>html{background:#131313}</style><script>location.replace("/planer/app/")</script>');
const ver = (/const VERSION = 'planer-([^']+)'/.exec(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8')) || [])[1];
console.log('www: ' + n + ' Dateien, ' + (bytes / 1048576).toFixed(1) + ' MB, Version ' + ver);
