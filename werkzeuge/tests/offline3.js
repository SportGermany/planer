// Offline-Test im neuen Aufbau: einmal /planer/app/ online öffnen (wie nach der Installation), Server aus, dann alles offline
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const U = 'http://localhost:8765/planer/', APP = U + 'app/';
const out = [], fail = [];
const log = (ok, m) => { (ok ? out : fail).push(m); console.log(ok ? '✓' : '✗', m); };
function server(on) {
  if (on) { execSync('cd ' + JSON.stringify(require('path').resolve(__dirname, '../../..')) + ' && (setsid nohup python3 -m http.server 8765 >/dev/null 2>&1 &)'); execSync('sleep 1'); return; }
  try { const pid = execSync('pgrep -f "^python3 -m http.server 8765"').toString().trim().split('\n'); pid.forEach(x => execSync('kill ' + x)); } catch (e) {}
  execSync('sleep 0.5');
}
async function fillAll(frame, all) {
  return frame.evaluate((all) => {
    const vis = el => { if (all) return true; const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const set = (el, v) => { const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return el.value === v || el.type === 'number' && +el.value === +v; };
    let n = 0, bad = [];
    const roots = [document]; document.querySelectorAll('*').forEach(e => { if (e.shadowRoot) roots.push(e.shadowRoot); });
    roots.forEach(r => r.querySelectorAll('input,textarea,select').forEach(el => {
      if (!vis(el) || el.disabled || el.readOnly) return;
      const t = (el.type || 'text').toLowerCase(); let ok = true;
      if (['hidden', 'file', 'checkbox', 'radio', 'button', 'submit', 'range', 'color', 'password'].includes(t)) return;
      const old = el.value;
      if (el.tagName === 'SELECT') { if (el.options.length < 2) return; const i = el.selectedIndex; el.selectedIndex = (i + 1) % el.options.length; el.dispatchEvent(new Event('change', { bubbles: true })); ok = el.selectedIndex === (i + 1) % el.options.length; }
      else if (t === 'number' || el.inputMode === 'numeric' || el.inputMode === 'decimal') { const v = el.min !== '' && el.max !== '' && el.min != null ? String(Math.round((+el.min + +el.max) / 2)) : el.min ? el.min : '3'; ok = set(el, v); }
      else if (t === 'date') ok = set(el, '2026-10-12');
      else if (t === 'time') ok = set(el, '07:30');
      else if (t === 'datetime-local') ok = set(el, '2026-10-12T07:30');
      else if (t === 'month') ok = set(el, '2026-10');
      else ok = set(el, 'Offline-Test');
      n++; if (!ok) bad.push((el.id || el.name || el.placeholder || el.tagName) + ':' + t);
    }));
    return { n, bad };
  }, all);
}
const navBad = [];
const navOk = p => p.evaluate(() => { const n = document.getElementById('nav').getBoundingClientRect(); return n.height >= 50 && n.top >= 0 && n.bottom <= innerHeight + 1 && !document.scrollingElement.scrollTop; });
(async () => {
  server(true);
  const b = await chromium.launch({ executablePath: process.env.SG_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const c = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  await c.addInitScript(fs.readFileSync(__dirname + '/seed.js', 'utf8'));
  await c.addInitScript(() => { try { localStorage.setItem('sg-update-check', String(Date.now())); } catch (e) {} });
  const p = await c.newPage(); p.setDefaultTimeout(8000); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss().catch(() => {}));
  await p.goto(APP); await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 20000 }).catch(() => {});
  await p.evaluate(() => navigator.serviceWorker.ready);
  const cached = await p.evaluate(async () => { const k = await caches.keys(); const c = await caches.open(k[0]); return [k, (await c.keys()).map(r => new URL(r.url).pathname)]; });
  log(cached[1].length >= 49, 'Alle App-Dateien beim ersten Start gespeichert (' + cached[1].length + ', ' + cached[0] + ')');
  await p.waitForTimeout(1500);
  server(false);
  try { execSync('curl -s -m 2 -o /dev/null http://localhost:8765/planer/'); log(false, 'Server läuft noch'); } catch (e) { log(true, 'Server ist aus – ab jetzt offline'); }
  try {
    errs.length = 0;
    const r = await p.reload().catch(() => null); await p.waitForTimeout(2000);
    log(r && r.ok() && /Rodeltraining/.test(await p.textContent('#n-kalender')) && !errs.length, 'Hülle und Kalender offline' + (errs.length ? ' ' + errs.join('|') : ''));
    // jedes Ziel, jeder Unterpunkt: Seite sichtbar, keine Fehler, alle Eingabefelder bedienbar
    let total = 0;
    for (const t of ['training', 'mobility', 'schule']) {
      await p.click('#nav [data-tab=' + t + ']'); await p.waitForTimeout(500);
      const secs = await p.$$eval('#chips .crow:first-child [data-sec]', l => l.map(x => x.dataset.sec));
      for (const s of secs) {
        await p.click('#chips [data-sec="' + s + '"]'); await p.waitForTimeout(1500);
        const kids = await p.$$eval('#chips [data-kid]', l => l.map(x => x.dataset.kid));
        for (const k of (kids.length ? kids : [null])) {
          errs.length = 0;
          if (k) { await p.click('#chips [data-kid="' + k + '"]'); await p.waitForTimeout(1200); }
          const path = await p.evaluate(() => document.querySelector('#stage iframe.on').dataset.p);
          const f = p.frames().find(x => x.url().replace(/[?#].*$/, '') === U + path);
          const txt = f ? await f.evaluate(() => document.body.innerText.length).catch(() => 0) : 0;
          const fl = f ? await fillAll(f, false).catch(() => ({ n: 0, bad: ['?'] })) : { n: 0, bad: ['keine Seite'] };
          total += fl.n;
          if (!await navOk(p)) navBad.push(t + '/' + s + (k ? '/' + k : ''));
          log(txt > 20 && !errs.length && !fl.bad.length, 'Offline: ' + t + ' › ' + s + (k ? ' › ' + k : '') + ' (' + fl.n + ' Felder)' + (errs.length ? ' Fehler: ' + errs.join('|') : '') + (fl.bad.length ? ' nicht: ' + fl.bad.join(',') : '') + (txt > 20 ? '' : ' leer'));
        }
      }
    }
    // alle Felder jeder eingebetteten Seite (auch in geschlossenen Dialogen)
    for (const f of p.frames()) { if (f === p.mainFrame()) continue; const fl = await fillAll(f, true).catch(() => ({ n: 0, bad: [] })); total += fl.n; if (fl.bad.length) log(false, 'nicht bedienbar in ' + f.url() + ': ' + fl.bad.join(',')); }
    log(!navBad.length, 'Offline: untere Leiste in jedem Bereich sichtbar' + (navBad.length ? ' – fehlt: ' + navBad.join(', ') : ''));
    log(total > 80, 'Insgesamt ' + total + ' Eingabefelder offline bedient');
    // Mehr: jede Unterseite offline
    for (const m of ['aufgaben', 'notizen', 'bibel', 'pause', 'tset']) {
      errs.length = 0; await p.goto(APP + '#' + m); await p.waitForTimeout(2200);
      const ok = await p.evaluate(() => { const f = document.querySelector('#stage iframe.on'); if (f) return f.contentDocument.body.innerText.length > 80; return document.querySelector('.native.on').innerText.length > 10; });
      log(ok && !errs.length, 'Offline: Mehr › ' + m + (errs.length ? ' ' + errs.join('|') : ''));
    }
    // alte Adressen offline → Hülle
    for (const [from, want] of [['', '#kalender'], ['training/#atmung/train', '#mobility/atmung/hrv'], ['bibel/#lesen', '#bibel/lesen'], ['wissen/#quiz', '#training/wissen/quiz']]) {
      await p.goto(U + from).catch(() => {}); await p.waitForTimeout(2000);
      log(p.url().indexOf(APP + want) === 0, 'Offline alte Adresse /planer/' + from + ' → ' + p.url().replace(U, ''));
    }
    // Notiz und Aufgabe offline, bleiben nach Neustart
    await p.goto(APP + '#notizen'); await p.waitForTimeout(1500); await p.fill('#nin', 'Offline notiert'); await p.press('#nin', 'Enter'); await p.waitForTimeout(300);
    await p.goto(APP + '#kalender'); await p.waitForTimeout(1500);
    await p.click('#fab'); await p.click('#sheet [data-s=aufgabe]'); await p.fill('#tq', 'Offline-Aufgabe'); await p.click('#sheet [data-s=save]'); await p.waitForTimeout(300);
    await p.reload(); await p.waitForTimeout(2000);
    log(/Offline-Aufgabe/.test(await p.textContent('#n-kalender')) && await p.evaluate(() => SharedCalendar.notes.list().some(n => n.text === 'Offline notiert')), 'Notiz und Aufgabe offline gespeichert, nach Neustart da');
    // Kalender → Starten offline
    await p.locator('.ev', { hasText: 'Langsames Atmen' }).locator('[data-start]').click(); await p.waitForTimeout(2500);
    log(p.url().indexOf('#mobility/atmung/hrv') > 0, 'Offline: Kalender → Atemübung starten');
    // Handykalender offline: Termin aus dem Handy teilen (Share Target im Service Worker) und Termine ins Handy übertragen
    errs.length = 0;
    await p.goto(APP + '#kalender'); await p.waitForTimeout(1500);
    const vcs = 'BEGIN:VCALENDAR\r\nVERSION:1.0\r\nBEGIN:VEVENT\r\nUID:off-1\r\nSUMMARY:Offline geteilt\r\nDTSTART:20261024T090000\r\nDTEND:20261024T100000\r\nEND:VEVENT\r\nEND:VCALENDAR';
    const shared = await p.evaluate(async v => { const fd = new FormData(); fd.append('datei', new File([v], 't.vcs', { type: 'text/x-vcalendar' })); const r = await fetch('../app/?teilen', { method: 'POST', body: fd }); return r.status; }, vcs).catch(e => String(e));
    await p.goto(APP + '#teilen'); await p.waitForTimeout(1500);
    await p.click('#sheet [data-s=yes]').catch(() => {}); await p.waitForTimeout(500);
    const got = await p.evaluate(() => SharedCalendar.list().some(x => x.title === 'Offline geteilt'));
    await p.goto(APP + '#mehr'); await p.waitForTimeout(1500);
    await p.click('#n-mehr [data-m=handy]'); await p.waitForTimeout(300);
    const dl = await Promise.all([p.waitForEvent('download', { timeout: 5000 }), p.click('#sheet [data-s=outall]')]).then(x => x[0]).catch(() => null);
    log(shared === 200 && got && dl && !errs.length, 'Offline: Handykalender – Termin teilen › Planer übernommen, Termine als Datei ins Handy' + (errs.length ? ' ' + errs.join('|') : ''));
    // Version aktualisieren offline: Hinweis, App läuft weiter
    await p.goto(APP + '#mehr'); await p.waitForTimeout(1500); await p.click('#n-mehr [data-m=update]'); await p.waitForTimeout(800);
    log(/Ohne Internet|nicht erreichbar/.test(await p.textContent('#snack')), 'Version aktualisieren offline: ' + (await p.textContent('#snack')).slice(0, 60));
  } finally { server(true); }
  console.log(`\n${out.length} grün, ${fail.length} Fehler`); fail.forEach(f => console.log('FEHLER:', f));
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
