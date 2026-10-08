/* Planer Service Worker: macht die ganze App offline nutzbar – Planer, Schule, Pause, Training, Mobility,
 * Atmung, Bahnplan und Bibel. Seiten: erst Netz (Updates kommen sofort an), ohne Netz aus dem Speicher.
 * Übrige Dateien: aus dem Speicher, im Hintergrund aktualisiert. Die Cloud-Sicherung ist nur ein Zusatz –
 * ohne Netz läuft alles mit den Daten auf dem Gerät weiter. */
const VERSION = 'planer-app-v1';
const SHELL = ['./', './index.html', './schule/', './pause/', './training/', './training/mobility/', './training/atmung/', './training/bahnplan/',
  './bibel/', './bibel/elb1905.json', './manifest.json', './inter.woff2', './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png',
  './apple-touch-icon.png', './favicon.png'];

self.addEventListener('install', e => {
  // einzeln laden: fehlt eine Datei, landen die übrigen trotzdem im Speicher
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// ohne Netz: passende Seite aus dem Speicher, sonst die Startseite des jeweiligen Teils
function fallback(url) {
  const p = new URL(url).pathname, base = self.registration.scope.replace(location.origin, '');
  const rest = p.startsWith(base) ? p.slice(base.length) : '';
  const part = ['training/mobility/', 'training/atmung/', 'training/bahnplan/', 'training/', 'bibel/', 'schule/', 'pause/'].find(x => rest.startsWith(x));
  return caches.match('./' + (part || ''));
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || fallback(req.url))));
    return;
  }
  e.respondWith(caches.open(VERSION).then(c => c.match(req, { ignoreSearch: true }).then(hit => {
    const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
// Tipp auf eine Erinnerung öffnet die App
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const open = list.find(c => c.url.startsWith(url));
    return open ? open.focus() : clients.openWindow(url);
  }));
});
