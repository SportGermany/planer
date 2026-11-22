/* Planer für Ubuntu (Electron). Lädt dieselben Dateien wie die App (www/planer/… aus www.js) über das eigene Schema app://local/planer/…,
 * damit alle Pfade wie im Netz und in der APK stimmen. Alles läuft offline; Netz nur für Cloud-Abgleich, Webkalender, Update-Prüfung.
 * Links nach außen (GitHub, Quellen) öffnen im Browser. Fenstergröße und -position bleiben gespeichert. */
const { app, BrowserWindow, protocol, shell, Menu, net } = require('electron');
const path = require('path'), fs = require('fs'), url = require('url');
const WWW = path.join(__dirname, 'www');
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);
app.setName('Planer');
const STATE = () => path.join(app.getPath('userData'), 'fenster.json');
function loadState() { try { return JSON.parse(fs.readFileSync(STATE(), 'utf8')); } catch (e) { return { width: 1440, height: 900 }; } }
function saveState(w) { try { if (!w.isMinimized()) fs.writeFileSync(STATE(), JSON.stringify(Object.assign(w.getNormalBounds(), { max: w.isMaximized() }))); } catch (e) {} }
const single = app.requestSingleInstanceLock();
if (!single) app.quit();
let win = null;
function create() {
  const st = loadState();
  win = new BrowserWindow({ x: st.x, y: st.y, width: st.width || 1440, height: st.height || 900, minWidth: 380, minHeight: 560, title: 'Planer', backgroundColor: '#141218',
    icon: path.join(__dirname, 'www', 'planer', 'icon-512.png'), autoHideMenuBar: true, show: false,
    webPreferences: { contextIsolation: true, sandbox: true, spellcheck: true } });
  if (st.max) win.maximize();
  win.once('ready-to-show', () => win.show());
  win.loadURL('app://local/planer/app/');
  // nach außen: im Standardbrowser öffnen (Release-Seite, Quellen, Google-Anmeldung für den Webkalender …)
  win.webContents.setWindowOpenHandler(({ url: u }) => { if (/^https?:/.test(u)) shell.openExternal(u); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, u) => { if (/^https?:/.test(u)) { e.preventDefault(); shell.openExternal(u); } });
  ['resize', 'move', 'close'].forEach(ev => win.on(ev, () => saveState(win)));
}
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => {
  protocol.handle('app', req => {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.normalize(path.join(WWW, p));
    if (!f.startsWith(WWW) || !fs.existsSync(f)) return new Response('Nicht gefunden', { status: 404 });
    return net.fetch(url.pathToFileURL(f).toString());
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Planer', submenu: [{ role: 'reload', label: 'Neu laden' }, { role: 'togglefullscreen', label: 'Vollbild' }, { type: 'separator' }, { role: 'zoomIn', label: 'Größer' }, { role: 'zoomOut', label: 'Kleiner' }, { role: 'resetZoom', label: 'Normale Größe' }, { type: 'separator' }, { role: 'quit', label: 'Beenden' }] },
    { label: 'Bearbeiten', submenu: [{ role: 'undo', label: 'Rückgängig' }, { role: 'redo', label: 'Wiederholen' }, { type: 'separator' }, { role: 'cut', label: 'Ausschneiden' }, { role: 'copy', label: 'Kopieren' }, { role: 'paste', label: 'Einfügen' }, { role: 'selectAll', label: 'Alles auswählen' }] }
  ]));
  create();
});
app.on('window-all-closed', () => app.quit());
