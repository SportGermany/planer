/* Planer Service Worker: macht die ganze App offline nutzbar – Planer, Schule, Pause, Training, Mobility,
 * Atmung, Bahnplan und Bibel. Seiten und Dateien kommen sofort aus dem Speicher
 * und werden im Hintergrund aufgefrischt; eine neue Version lädt „Version aktualisieren“ sofort.
 * Die Cloud-Sicherung ist nur ein Zusatz –
 * ohne Netz läuft alles mit den Daten auf dem Gerät weiter. */
const VERSION = 'planer-3.4.1';
const SHELL = [
  './app/', './', './index.html', './schule/', './pause/', './training/',
  './training/mobility/', './training/atmung/', './training/bahnplan/', './bibel/', './bibel/elb1905.json', './wissen/',
  './manifest.json', './inter.woff2', './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png',
  './apple-touch-icon.png', './favicon.png', './app/js/1-app.js?v=3.4.1', './bibel/js/1-app.js?v=3.4.1', './js/1-app.js?v=3.4.1', './pause/js/1-app.js?v=3.4.1',
  './schule/js/1-app.js?v=3.4.1', './sg/design.js?v=3.4.1', './sg/install.js?v=3.4.1', './sg/training-suite.js?v=3.4.1', './sg/verbund.js?v=3.4.1', './training/atmung/js/1-app.js?v=3.4.1',
  './training/bahnplan/js/1-app.js?v=3.4.1', './training/js/1-core.js?v=3.4.1', './training/js/10-app.js?v=3.4.1', './training/js/11-app.js?v=3.4.1', './training/js/12-app.js?v=3.4.1', './training/js/13-app.js?v=3.4.1',
  './training/js/14-app.js?v=3.4.1', './training/js/2-pools.js?v=3.4.1', './training/js/3-sports.js?v=3.4.1', './training/js/4-stretch.js?v=3.4.1', './training/js/5-rodeln.js?v=3.4.1', './training/js/6-gym.js?v=3.4.1',
  './training/js/7-weather.js?v=3.4.1', './training/js/8-github.js?v=3.4.1', './training/js/9-analysis.js?v=3.4.1', './training/js/csv-worker.js?v=3.4.1', './training/mobility/js/1-app.js?v=3.4.1', './wissen/js/1-app.js?v=3.4.1',
  './wissen/js/buch.js?v=3.4.1'
];

self.addEventListener('install', e => {
  // einzeln und am HTTP-Zwischenspeicher vorbei laden: fehlt eine Datei, landen die übrigen trotzdem im Speicher
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(SHELL.map(u => fetch(new Request(u, { cache: 'reload' }))
    .then(r => r.ok ? c.put(u, r) : null).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'sg-teilen').map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// ohne Netz: passende Seite aus dem Speicher, sonst die Startseite des jeweiligen Teils
function part(url) {
  const p = new URL(url).pathname, base = self.registration.scope.replace(location.origin, '');
  const rest = p.startsWith(base) ? p.slice(base.length) : '';
  return './' + (['training/mobility/', 'training/atmung/', 'training/bahnplan/', 'training/', 'bibel/', 'schule/', 'pause/', 'wissen/', 'app/'].find(x => rest.startsWith(x)) || '');
}
function refresh(c, req, key) {
  return fetch(req).then(res => { if (res.ok && res.type === 'basic') c.put(key || req, res.clone()); return res; });
}
self.addEventListener('fetch', e => {
  const req = e.request;
  // Teilen › Planer (Share Target im Manifest): Termine aus dem Handykalender – ablegen, dann die Hülle mit #teilen öffnen
  if (req.method === 'POST' && new URL(req.url).searchParams.has('teilen')) {
    e.respondWith((async () => {
      const app = new URL('./app/#teilen', self.registration.scope).href;
      try {
        const fd = await req.formData(), files = [];
        for (const f of fd.getAll('datei')) if (f && typeof f.text === 'function') files.push({ name: f.name || '', text: await f.text() });
        const data = { at: Date.now(), title: fd.get('title') || '', text: fd.get('text') || '', url: fd.get('url') || '', files };
        await (await caches.open('sg-teilen')).put(new URL('app/geteilt.json', self.registration.scope).href, new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }));
      } catch (x) {}
      return Response.redirect(app, 303);
    })());
    return;
  }
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // Seiten sofort aus dem Speicher (schnell, auch ohne Netz) – im Hintergrund wird die Kopie aufgefrischt
    const key = part(req.url);
    e.respondWith(caches.open(VERSION).then(c => c.match(key).then(hit => {
      const net = refresh(c, new Request(req.url, { cache: 'no-cache' }), key);
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net.catch(() => caches.match('./'));
    })));
    return;
  }
  // Dateien gehören fest zu einer Version (Skripte tragen ?v=…): nur aus dem Speicher, nichts nachladen –
  // so bleibt auch der übersetzte Code im Browser erhalten. Neue Dateien kommen mit der nächsten Version.
  e.respondWith(caches.open(VERSION).then(c => c.match(req, { ignoreSearch: true }).then(hit => hit || refresh(c, req))));
});
// die App fragt nach der Version (für „Version aktualisieren“)
self.addEventListener('message', e => { if (e.data === 'version') (e.ports && e.ports[0] ? e.ports[0] : e.source).postMessage({ version: VERSION }); });
// Tipp auf eine Erinnerung öffnet die App
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const open = list.find(c => c.url.startsWith(url));
    return open ? open.focus() : clients.openWindow(url);
  }));
});
