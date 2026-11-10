// Klicktest: tippt in einer App (APK-Fassung aus www.js, Android nachgestellt) jeden sichtbaren Knopf jeder Ansicht einmal an
// und meldet, was dabei schiefgeht: Skriptfehler, fehlende Dateien (404), Sprung auf Seiten außerhalb der APK, Öffnen anderer Apps.
//   node klicktest.js schule   (planer | training | schule | bibel)
const { execSync, spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const KEY = process.argv[2] || 'schule', ROOT = path.resolve(__dirname, '../..');
execSync('node www.js ' + KEY, { cwd: path.join(ROOT, 'werkzeuge/apk'), stdio: 'ignore' });
execSync('git checkout -- werkzeuge/apk/capacitor.config.json werkzeuge/apk/android/app/src/main/res/values/strings.xml werkzeuge/apk/android/app/src/main/res/values/ic_launcher_background.xml werkzeuge/apk/android/app/src/main/res/mipmap-anydpi-v26', { cwd: ROOT });
try { fs.unlinkSync(path.join(ROOT, 'werkzeuge/apk/android/app/src/main/res/drawable/ic_launcher_foreground_app.xml')); } catch (e) {}
const srv = spawn('python3', ['-m', 'http.server', '8767'], { cwd: path.join(ROOT, 'werkzeuge/apk/www'), stdio: 'ignore' });
const { chromium } = require('playwright');
const wait = ms => new Promise(r => setTimeout(r, ms));
const NAV = { planer: '#nav > button', training: '#nav .tab:not([hidden])', schule: '#tabs .tab:not([hidden])', bibel: '.sg-nav > button' };
(async () => {
  await wait(800);
  const b = await chromium.launch(process.env.SG_CHROME ? { executablePath: process.env.SG_CHROME } : {});
  const c = await b.newContext({ viewport: { width: 384, height: 832 }, isMobile: true, hasTouch: true });
  await c.addInitScript(() => {
    window.__opened = [];
    const sys = { openApp: o => { window.__opened.push(o.pkg + (o.ziel ? '#' + o.ziel : '')); return Promise.resolve({ opened: true }); }, takeHandover: () => Promise.resolve({}), takeFile: () => Promise.resolve({}),
      installed: o => Promise.resolve({ installed: o.pkgs || [] }), colors: () => Promise.resolve({ dynamic: false }) };
    const plug = name => new Proxy(name === 'PlanerSystem' ? sys : {}, { get: (t, k) => k in t ? t[k] : (k === 'addListener' ? () => Promise.resolve({ remove() {} }) : () => Promise.resolve({})) });
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android', Plugins: new Proxy({}, { get: (t, k) => plug(k) }) };
    if (!localStorage.getItem('wk_onboarded')) localStorage.setItem('wk_onboarded', '1');
  });
  const p = await c.newPage(), errs = [], bad = [];
  p.on('dialog', d => d.dismiss().catch(() => {}));
  p.on('pageerror', e => errs.push('Skriptfehler: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_CERT|net::/.test(m.text())) errs.push('Konsole: ' + m.text().slice(0, 160)); });
  p.on('response', r => { const u = r.url(); if (r.status() >= 400 && u.startsWith('http://localhost:8767')) errs.push('fehlt ' + r.status() + ' ' + u.replace('http://localhost:8767', '')); });
  await p.goto('http://localhost:8767/'); await wait(2500);
  try { await p.addScriptTag({ path: path.join(__dirname, 'seed.js') }); await p.reload(); await wait(2500); } catch (e) {}
  const home = p.url().split('#')[0];
  const tabs = await p.$$eval(NAV[KEY], l => l.map((x, i) => i));
  let total = 0;
  for (const ti of tabs) {
    await p.goto(home); await wait(1500);
    const tabName = await p.$$eval(NAV[KEY], (l, i) => { l[i].click(); return (l[i].innerText || '').trim(); }, ti); await wait(900);
    const n = await p.evaluate(sel => {
      const nav = [...document.querySelectorAll(sel)];
      const els = [...document.querySelectorAll('button, a[href], [data-a], [role=button], [data-m], [data-go], [data-tsopen]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.disabled && !nav.includes(e) && !e.closest('#sgSelbsttest'); });
      els.forEach((e, i) => e.setAttribute('data-kt', i)); return els.length;
    }, NAV[KEY]);
    for (let i = 0; i < Math.min(n, 70); i++) {
      const before = errs.length;
      const label = await p.evaluate(i => { const e = document.querySelector('[data-kt="' + i + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; return ((e.getAttribute('aria-label') || e.innerText || e.title || e.dataset.a || e.id || '?') + '').replace(/\s+/g, ' ').trim().slice(0, 40); }, i);
      if (label === null) continue;
      if (/löschen|zurücksetzen|abmelden|alles entfernen/i.test(label)) continue;   // nichts Zerstörerisches
      const url0 = p.url();
      try { await p.click('[data-kt="' + i + '"]', { timeout: 1500 }); } catch (e) { continue; }
      total++; await wait(500);
      const u = p.url();
      if (!u.startsWith(home)) bad.push(tabName + ' › „' + label + '“: springt aus der App nach ' + u);
      const op = await p.evaluate(() => window.__opened.splice(0));
      op.forEach(o => console.log('  ↗ ' + tabName + ' › „' + label + '“ öffnet App ' + o));
      if (errs.length > before) bad.push(tabName + ' › „' + label + '“: ' + errs.slice(before).join(' | '));
      // Ausgangslage für den nächsten Knopf: Seite neu, gleicher Reiter, gleiche Nummerierung
      await p.goto(home); await wait(900); await p.$$eval(NAV[KEY], (l, ti) => l[ti].click(), ti); await wait(500);
      await p.evaluate(sel => { const nav = [...document.querySelectorAll(sel)]; [...document.querySelectorAll('button, a[href], [data-a], [role=button], [data-m], [data-go], [data-tsopen]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.disabled && !nav.includes(e) && !e.closest('#sgSelbsttest'); }).forEach((e, j) => e.setAttribute('data-kt', j)); }, NAV[KEY]);
    }
  }
  console.log(KEY + ': ' + total + ' Knöpfe angetippt, ' + bad.length + ' Auffälligkeiten');
  bad.forEach(x => console.log('✗ ' + x));
  await b.close(); srv.kill();
})();
