// PC-Programm (werkzeuge/desktop, Electron) starten und prüfen: Seite lädt über app://, PC-Ansicht mit drei Spalten, Tastenkürzel,
// Schule/Training/Bibel öffnen, keine Skriptfehler. Aufruf: xvfb-run -a node desktop.js   (vorher in werkzeuge/desktop: npm ci && node www.js)
const { _electron: electron } = require('playwright');
const path = require('path'), DIR = path.resolve(__dirname, '../desktop');
let bad = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) bad++; };
(async () => {
  const app = await electron.launch({ args: ['--no-sandbox', '--disable-gpu', DIR], executablePath: path.join(DIR, 'node_modules/electron/dist/electron') });
  const w = await app.firstWindow(), errs = [];
  w.on('pageerror', e => errs.push(e.message));
  await w.setViewportSize({ width: 1440, height: 900 }).catch(() => {});
  await w.waitForTimeout(4000);
  const r = await w.evaluate(() => ({ href: location.href, desk: document.documentElement.classList.contains('desk'), sg: !!window.SGDesktop, ver: window.SGVersion,
    cols: ['.dl', '#cal-month', '#cal-tasks'].map(s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().width) : 0; }) }));
  ok(r.href.indexOf('app://local/planer/app/') === 0 && r.sg, 'startet über app:// mit PC-Kennung (' + r.href + ')');
  ok(r.desk && r.cols.every(x => x > 200), 'PC-Ansicht: drei Spalten ' + r.cols.join(' / ') + ' px');
  ok(/^\d+\.\d+\.\d+$/.test(r.ver || ''), 'Version ' + r.ver);
  await w.keyboard.press('w'); await w.waitForTimeout(500);
  ok(await w.evaluate(() => !!document.getElementById('wkgrid')), 'Taste W: Wochenansicht');
  await w.keyboard.press('m'); await w.waitForTimeout(300);
  await w.fill('#dtin', 'Desktop-Test'); await w.keyboard.press('Enter'); await w.waitForTimeout(500);
  ok(await w.evaluate(() => /Desktop-Test/.test(document.getElementById('cal-tasks').innerText)), 'Aufgabe rechts eingetragen');
  for (const h of ['schule', 'training', 'bibel']) {
    await w.evaluate(h => { location.hash = h; }, h); await w.waitForTimeout(2500);
    const f = w.frames().find(x => x.url().indexOf('/planer/' + h + '/') > 0);
    ok(!!f && (await f.evaluate(() => document.body.innerText.length)) > 50, h + ' öffnet im Programm');
  }
  ok(!errs.length, 'keine Skriptfehler ' + errs.join(' | '));
  await app.close();
  // Starter „Schule“: planer --app=schule öffnet die volle Schul-App im eigenen Fenster (Seitenleiste, alle Reiter, Lehrgang nach Tag)
  const app2 = await electron.launch({ args: ['--no-sandbox', '--disable-gpu', DIR, '--app=schule'], executablePath: path.join(DIR, 'node_modules/electron/dist/electron') });
  const s = await app2.firstWindow(), errs2 = []; s.on('pageerror', e => errs2.push(e.message));
  await s.setViewportSize({ width: 1440, height: 900 }).catch(() => {});
  await s.waitForTimeout(3500);
  const q = await s.evaluate(() => ({ href: location.href, title: document.title, tabs: [...document.querySelectorAll('.tabs .tab')].filter(t => t.offsetParent).map(t => t.dataset.v), side: parseInt(getComputedStyle(document.body).paddingLeft) }));
  ok(q.href.indexOf('app://local/planer/schule/') === 0, 'Starter Schule: eigenes Fenster ' + q.href);
  ok(q.tabs.includes('lehrgang') && q.side >= 80, 'Schule am PC: Seitenleiste (' + q.side + ' px), Reiter ' + q.tabs.join(', '));
  await s.evaluate(() => { location.hash = 'lehrgang'; }); await s.waitForTimeout(800);
  ok(await s.evaluate(() => /Lehrg/.test(document.body.innerText)), 'Lehrgänge öffnen');
  ok(!errs2.length, 'Schule: keine Skriptfehler ' + errs2.join(' | '));
  await app2.close();
  console.log(bad ? bad + ' Fehler' : 'PC-Programm grün'); process.exit(bad ? 1 : 0);
})();
