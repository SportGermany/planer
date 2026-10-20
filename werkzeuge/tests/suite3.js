// Gesamt-Testsuite für den neuen Aufbau (Hülle /planer/app/) – node suite3.js [filter]
const { chromium } = require('playwright');
const fs = require('fs');
const U = 'http://localhost:8765/planer/', APP = U + 'app/';
const SEED = fs.readFileSync(__dirname + '/seed.js', 'utf8');
const ONLY = process.argv[2] || '';
const VER = '3.4.0';
const results = [];
const PAGES = ['', 'schule/', 'pause/', 'training/', 'training/mobility/', 'training/atmung/', 'training/bahnplan/', 'bibel/', 'wissen/'];
const PHONE = { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 };
const TAB = { viewport: { width: 1280, height: 800 }, hasTouch: true, deviceScaleFactor: 1 };
let browser;
async function ctxFor(opt, seed = true) {
  const c = await browser.newContext(opt || PHONE);
  if (seed) await c.addInitScript(SEED);
  await c.addInitScript(() => { try { localStorage.setItem('sg-update-check', String(Date.now())); } catch (e) {} });
  return c;
}
// Fehler der Hülle UND aller eingebetteten Seiten
function watch(p) { const e = []; p.on('pageerror', x => e.push('pageerror: ' + x.message)); return e; }
function assert(c, m) { if (!c) throw new Error(m); }
async function test(name, fn) {
  if (ONLY && !name.toLowerCase().includes(ONLY.toLowerCase())) return;
  const t0 = Date.now();
  try { await fn(); results.push([true, name, Date.now() - t0]); console.log('✓', name); }
  catch (e) { results.push([false, name, e.message]); console.log('✗', name, '–', e.message.split('\n')[0]); }
}
const wait = (p, ms) => p.waitForTimeout(ms);
const state = p => p.evaluate(() => ({ hash: location.hash, title: document.getElementById('title').textContent, tab: (document.querySelector('#nav .on') || {}).dataset?.tab,
  chips: [...document.querySelectorAll('#chips .chip.on')].map(c => c.textContent), frame: (document.querySelector('#stage iframe.on') || {}).dataset?.p ?? null }));
// sichtbare eingebettete Seite
const frameOf = (p, path) => p.frames().find(f => f.url().replace(/[?#].*$/, '') === U + path);
async function open(p, hash) { await p.goto(APP + hash); await wait(p, 2200); }

(async () => {
  browser = await chromium.launch({ executablePath: process.env.SG_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  /* ---------- A: Seiten ---------- */
  for (const [lab, opt] of [['Handy', PHONE], ['Tablet', TAB]]) {
    await test(`A Hülle lädt ohne Fehler (${lab})`, async () => {
      const c = await ctxFor(opt), p = await c.newPage(), e = watch(p);
      await open(p, '#kalender');
      assert(await p.evaluate(() => window.SGVersion) === VER, 'Version');
      assert(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, 'waagrechtes Scrollen');
      assert((await p.$$('#nav button')).length === 5, '5 Ziele');
      assert(!e.length, e.join(' | ')); await c.close();
    });
    for (const pg of PAGES) await test(`A Seite einzeln ohne Fehler (${lab}): /planer/${pg}`, async () => {
      const c = await ctxFor(opt), p = await c.newPage(), e = watch(p);
      await p.goto(U + pg + '?einzeln'); await wait(p, 1500);
      assert(await p.evaluate(() => !!document.getElementById('sg-theme') && window.SGVersion), 'Design/Version');
      assert(p.url().indexOf('/app/') < 0, 'wurde umgeleitet');
      assert(!e.length, e.join(' | ')); await c.close();
    });
  }
  await test('A Alte Adressen landen in der Hülle an der richtigen Stelle', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    const cases = [['', '#kalender', 'kalender'], ['#tasks', '#aufgaben', 'mehr'], ['training/', '#training', 'training'], ['training/#lauf', '#training/lauf', 'training'],
      ['training/#atmung/train', '#mobility/atmung/hrv', 'mobility'], ['training/mobility/', '#mobility/mobility', 'mobility'], ['training/bahnplan/', '#training/rodeln', 'training'],
      ['bibel/#lesen', '#bibel/lesen', 'mehr'], ['schule/', '#schule', 'schule'], ['pause/', '#pause', 'mehr'], ['wissen/#karten', '#training/wissen/karten', 'training'], ['#sg=x_notiz', '#notizen', 'mehr']];
    const bad = [];
    for (const [from, want, tab] of cases) {
      await p.goto(U + from); await wait(p, 1800);
      const s = await state(p);
      if (s.hash.indexOf(want) !== 0 || s.tab !== tab) bad.push(from + ' → ' + s.hash + ' (' + s.tab + ')');
    }
    assert(!bad.length, bad.join('; '));
    assert(!e.length, e.join(' | ')); await c.close();
  });

  await test('A Offline-Speicher: frisches Gerät öffnet nur die Hülle → Service Worker aktiv, alles gespeichert', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await p.goto(APP);
    await p.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 20000 });
    const n = await p.evaluate(async () => { const k = await caches.keys(); const ch = await caches.open(k[0]); return (await ch.keys()).length; });
    assert(n >= 49, 'gespeichert: ' + n);
    assert(!e.length, e.join(' | ')); await c.close();
  });

  /* ---------- S: Hülle ---------- */
  await test('S Alle Ziele und jeder Unterpunkt öffnen die richtige Seite', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    const bad = [];
    for (const t of ['training', 'mobility', 'schule']) {
      await p.click(`#nav [data-tab=${t}]`); await wait(p, 600);
      const secs = await p.$$eval('#chips .crow:first-child [data-sec]', l => l.map(x => x.dataset.sec));
      for (const s of secs) {
        await p.click(`#chips [data-sec="${s}"]`); await wait(p, 1500);
        const kids = await p.$$eval('#chips [data-kid]', l => l.map(x => x.dataset.kid));
        for (const k of (kids.length ? kids : [null])) {
          if (k) { await p.click(`#chips [data-kid="${k}"]`); await wait(p, 900); }
          const st = await state(p);
          if (!st.frame && st.frame !== '') bad.push(t + '/' + s + '/' + k + ' keine Seite');
          if (st.hash !== '#' + t + '/' + s + (k ? '/' + k : '')) bad.push(t + '/' + s + '/' + k + ' Adresse ' + st.hash);
        }
      }
    }
    // Unterbereiche wirklich gewählt: Mobility › Wettkampf, Atmung › Verlauf, Schule › Stundenplan, Rodeln › Läufe
    const vis = async (path, sel) => { const f = frameOf(p, path); return f && f.evaluate(s => { const el = document.querySelector(s); return !!el && el.classList.contains('on'); }, sel); };
    await p.goto(APP + '#mobility/mobility/wettkampf'); await wait(p, 2500);
    if (!await vis('training/mobility/', "nav [data-tab='wettkampf']")) bad.push('Mobility Wettkampf nicht gewählt');
    await p.goto(APP + '#mobility/atmung/verlauf'); await wait(p, 2500);
    if (!await vis('training/atmung/', "nav [data-go='log']")) bad.push('Atmung Verlauf nicht gewählt');
    await p.goto(APP + '#training/rodeln/laeufe'); await wait(p, 2500);
    if (!await vis('training/bahnplan/', "nav [data-v='laeufe']")) bad.push('Rodeln Läufe nicht gewählt');
    assert(!bad.length, bad.join('; '));
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('S Eingebettete Seiten ohne eigene Leisten, Hülle ohne Überlauf', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#training/heute');
    for (const [h, path, sel] of [['#training/heute', 'training/', '.nav'], ['#mobility/mobility', 'training/mobility/', '.tabbar'], ['#mobility/atmung', 'training/atmung/', 'nav.tabs'], ['#schule/plan', 'schule/', '.tabs'], ['#bibel/heute', 'bibel/', '.tabbar'], ['#training/wissen/lesen', 'wissen/', '.tabs']]) {
      await p.goto(APP + h); await wait(p, 2200);
      const f = frameOf(p, path); assert(f, 'Seite ' + path);
      const shown = await f.evaluate(s => { const n = document.querySelector(s); return n && getComputedStyle(n).display !== 'none'; }, sel);
      assert(!shown, 'eigene Leiste sichtbar in ' + path);
      assert(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, 'Überlauf bei ' + h);
    }
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('S Kalender: Woche, Monat, Tag wählen, Wischen, Danach', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    assert((await p.$$('#grid .wd')).length === 7, 'Woche');
    assert(/Rodeltraining/.test(await p.textContent('#n-kalender')), 'Termin des Tages');
    const k1 = await p.$eval('#grid .wd:nth-child(1)', x => x.dataset.day);
    await p.evaluate(() => { const g = document.getElementById('grid'), t = (x) => new Touch({ identifier: 1, target: g, clientX: x, clientY: 300 });
      g.dispatchEvent(new TouchEvent('touchstart', { touches: [t(300)], changedTouches: [t(300)], bubbles: true })); g.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t(120)], bubbles: true })); });
    await wait(p, 200);
    const k2 = await p.$eval('#grid .wd:nth-child(1)', x => x.dataset.day);
    assert(k2 > k1, 'Wischen zur nächsten Woche');
    await p.click('[data-c=today]'); await p.click('[data-c=monat]'); await wait(p, 200);
    assert((await p.$$('#grid [data-day]')).length === 42, 'Monat');
    await p.locator('#grid [data-day]').nth(20).click(); await wait(p, 200);
    assert(await p.$('.week'), 'Tag im Monat → Woche');
    if (await p.$('[data-c=today]')) await p.click('[data-c=today]');
    await p.locator('.nd').nth(0).click(); await wait(p, 200);
    assert(/Morgen/.test(await p.textContent('.grp header')), 'Danach-Tag wählen');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('S Kalender verknüpft: Starten führt in Training und Atmung, Zurück-Geste zum Kalender', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    await p.locator('.ev', { hasText: 'Rodeltraining' }).locator('[data-start]').click(); await wait(p, 1500);
    let s = await state(p); assert(s.tab === 'training' && s.hash === '#training/heute', 'Training ' + s.hash);
    await p.goBack(); await wait(p, 500); s = await state(p); assert(s.tab === 'kalender', 'zurück ' + s.hash);
    await p.locator('.ev', { hasText: 'Langsames Atmen' }).locator('[data-start]').click(); await wait(p, 2500);
    s = await state(p); assert(s.hash === '#mobility/atmung/hrv', 'Atmung ' + s.hash);
    assert(await frameOf(p, 'training/atmung/').evaluate(() => document.querySelector("nav [data-go='train']").classList.contains('on')), 'Üben gewählt');
    await p.goBack(); await wait(p, 500); assert((await state(p)).tab === 'kalender', 'zurück 2');
    // Eintrag antippen → Details, „Bearbeiten“ öffnet das Formular
    await p.locator('.ev', { hasText: 'Rodeltraining' }).locator('.tx').click(); await wait(p, 200);
    assert(/Training öffnen/.test(await p.textContent('#sheet')), 'Details');
    await p.click('#sheet [data-s=edit]'); await wait(p, 400);
    assert(await p.evaluate(() => { const r = document.getElementById('sg-shared-calendar'); return /Speichern/.test((r.shadowRoot || r).textContent); }), 'Formular');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('S Bereiche verknüpft: „Dazu heute“ im Training öffnet Mobility in der Hülle', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#training/heute'); await wait(p, 1500);
    const f = frameOf(p, 'training/');
    await f.evaluate(() => { location.hash = '#mobility'; }); await wait(p, 1500);
    let s = await state(p); assert(s.tab === 'mobility' && s.hash.indexOf('#mobility/mobility') === 0, 'Mobility ' + s.hash);
    assert(await f.evaluate(() => document.querySelector('.tsmod').hidden), 'kein Fenster im Fenster');
    // Befehlsmenü: Atemübung starten
    await p.click('#acts [data-act=search]'); await wait(p, 300);
    await p.keyboard.type('Atemübung starten'); await wait(p, 200); await p.keyboard.press('Enter'); await wait(p, 1500);
    s = await state(p); assert(s.hash === '#mobility/atmung/hrv', 'Befehl ' + s.hash);
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('S Plus: Aufgabe, Notiz und Termin für den gewählten Tag', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    await p.locator('#grid .wd').nth(6).click(); const day = await p.$eval('#grid .wd.s', x => x.dataset.day);
    await p.click('#fab'); await p.click('#sheet [data-s=aufgabe]'); await p.fill('#tq', 'Startbügel prüfen'); await p.click('#sheet [data-s=save]'); await wait(p, 300);
    assert(await p.evaluate(d => SharedCalendar.tasks.list().some(q => q.title === 'Startbügel prüfen' && q.due === d), day), 'Aufgabe');
    assert(/Startbügel prüfen/.test(await p.textContent('#n-kalender')), 'Aufgabe im Tag');
    await p.click('#fab'); await p.click('#sheet [data-s=notiz]'); await p.fill('#nt', 'Kufen schleifen'); await p.click('#sheet [data-at]:nth-child(3)'); await p.click('#sheet [data-s=save]'); await wait(p, 300);
    const n = await p.evaluate(() => SharedCalendar.notes.list().find(x => x.text === 'Kufen schleifen'));
    assert(n && n.at.indexOf(day) === 0 && n.remind, 'Notiz mit Zeit ' + JSON.stringify(n));
    assert(/Kufen schleifen/.test(await p.textContent('#n-kalender')), 'Notiz im Kalender');
    await p.click('#fab'); await p.click('#sheet [data-s=termin]'); await wait(p, 400);
    assert(await p.evaluate(d => { const r = document.getElementById('sg-shared-calendar'); return !!(r.shadowRoot || r).querySelector('input[type=date][value="' + d + '"], [value="' + d + '"]'); }, day), 'Terminformular mit Datum');
    // Aufgabe abhaken im Kalender + Rückgängig
    await p.keyboard.press('Escape'); await p.goto(APP + '#kalender'); await wait(p, 1500);
    await p.locator('#grid .wd').nth(6).click();
    await p.locator('.ev', { hasText: 'Startbügel' }).locator('[data-ck]').click(); await wait(p, 200);
    assert(await p.evaluate(() => SharedCalendar.tasks.list().find(q => q.title === 'Startbügel prüfen').done), 'abgehakt');
    await p.click('#snack button'); assert(!(await p.evaluate(() => SharedCalendar.tasks.list().find(q => q.title === 'Startbügel prüfen').done)), 'Rückgängig');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('S Notizen: anlegen, bearbeiten, erledigen, löschen', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#notizen');
    assert((await state(p)).tab === 'mehr' && !(await p.isHidden('#back')), 'Notizen unter Mehr mit Zurück');
    await p.fill('#nin', 'Idee eins'); await p.press('#nin', 'Enter'); await wait(p, 200);
    await p.locator('.nt', { hasText: 'Idee eins' }).click(); await p.fill('#nt', 'Idee eins geändert'); await p.click('#sheet [data-s=save]'); await wait(p, 200);
    assert(/Idee eins geändert/.test(await p.textContent('#n-notizen')), 'bearbeitet');
    await p.locator('.nt', { hasText: 'geändert' }).click(); await p.click('#sheet [data-s=tog]'); await wait(p, 200);
    await p.click('[data-nf=done]'); assert(/geändert/.test(await p.textContent('#n-notizen')), 'erledigt-Liste');
    await p.locator('.nt', { hasText: 'geändert' }).click(); await p.click('#sheet [data-s=del]'); await wait(p, 200);
    assert(!(await p.evaluate(() => SharedCalendar.notes.list().length)), 'gelöscht');
    await p.click('#back'); await wait(p, 300); assert((await state(p)).hash === '#mehr', 'Zurück zu Mehr');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('S Mehr: Aufgaben, Bibel, Pause, Sportwissenschaft, Training einstellen, Design, Cloud', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#mehr');
    for (const [m, want, path] of [['aufgaben', '#aufgaben', ''], ['bibel', '#bibel', 'bibel/'], ['pause', '#pause', 'pause/'], ['tset', '#tset', 'training/']]) {
      await p.click(`#n-mehr [data-m=${m}]`); await wait(p, 2200);
      const s = await state(p); assert(s.hash.indexOf(want) === 0 && s.frame === path, m + ' ' + s.hash + ' ' + s.frame);
      const f = frameOf(p, path); assert(f && (await f.evaluate(() => document.body.innerText.length)) > 100, m + ' leer');
      await p.goBack(); await wait(p, 400); assert((await state(p)).hash === '#mehr', 'zurück von ' + m);
    }
    assert(/Aufgaben|Heute|Geplant/.test(await frameOf(p, '').evaluate(() => document.body.innerText)), 'Aufgabenliste');
    await p.click('#n-mehr [data-m=wissen]'); await wait(p, 1500); assert((await state(p)).hash.indexOf('#training/wissen') === 0, 'Wissen');
    await p.goto(APP + '#mehr'); await wait(p, 1500);
    await p.click('#n-mehr [data-m=design]'); await wait(p, 400);
    assert(await p.evaluate(() => { const r = document.getElementById('sg-shared-calendar'); return /Farbwelt|Design/.test((r.shadowRoot || r).textContent); }), 'Design');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('S Zurück: Kalender → Ziel → Zurück = Kalender; zwischen Zielen wird ersetzt', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    await p.click('#nav [data-tab=training]'); await wait(p, 800);
    await p.click('#nav [data-tab=schule]'); await wait(p, 800);
    await p.click('#nav [data-tab=mobility]'); await wait(p, 800);
    await p.goBack(); await wait(p, 500);
    assert((await state(p)).tab === 'kalender', 'nicht zurück im Kalender: ' + (await state(p)).hash);
    await p.click('#nav [data-tab=mehr]'); await wait(p, 400); await p.click('#nav [data-tab=kalender]'); await wait(p, 400);
    assert((await state(p)).tab === 'kalender', 'Kalender-Knopf');
    // Blatt schließt mit Zurück
    await p.click('#fab'); await wait(p, 200); await p.goBack(); await wait(p, 200);
    assert(!(await p.isVisible('#sheet.on')) && (await state(p)).tab === 'kalender', 'Blatt schließen');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('S Tablet: Seitenleiste links, Inhalt rechts', async () => {
    const c = await ctxFor(TAB), p = await c.newPage(), e = watch(p);
    await open(p, '#mobility/atmung');
    const r = await p.evaluate(() => { const n = document.getElementById('nav').getBoundingClientRect(), s = document.getElementById('stage').getBoundingClientRect(); return [n.width, n.height, s.left, s.width]; });
    assert(r[0] === 92 && r[1] > 700 && r[2] >= 92 && r[3] > 1100, 'Aufteilung ' + r);
    assert(!e.length, e.join(' | ')); await c.close();
  });

  await test('S Design: Pillen mittig, Schnellkarten im Bildschirm, eine Akzentfarbe in allen Bereichen', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    const go = await p.evaluate(() => [...document.querySelectorAll('#n-kalender .go')].map(g => { const r = g.getBoundingClientRect(), x = document.createRange(); x.selectNodeContents(g); const t = x.getBoundingClientRect(), row = g.closest('.ev').getBoundingClientRect();
      return [Math.abs((t.top + t.bottom) / 2 - (r.top + r.bottom) / 2), Math.abs((r.top + r.bottom) / 2 - (row.top + row.bottom) / 2)]; }));
    assert(go.length && go.every(d => d[0] < 2 && d[1] < 3), 'Pille nicht mittig ' + JSON.stringify(go));
    const gl = await p.evaluate(() => [...document.querySelectorAll('.gl')].every(g => { const r = g.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }));
    assert(gl, 'Schnellkarte ragt aus dem Bildschirm');
    const acc = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim().toLowerCase());
    for (const [h, sel, v] of [['#training/lauf', 'training/', '--work'], ['#pause', 'pause/', '--zitate'], ['#mobility/atmung', 'training/atmung/', '--breath']]) {
      await p.evaluate(h => { location.hash = h; }, h); await wait(p, 1500);
      const f = p.frames().find(f => f.url().split(/[?#]/)[0].endsWith('/planer/' + sel));
      assert(f, 'Seite ' + sel);
      const got = await f.evaluate(v => getComputedStyle(document.documentElement).getPropertyValue(v).trim().toLowerCase(), v);
      assert(got === acc, sel + ' ' + v + '=' + got + ' statt ' + acc);
      const fs = await f.evaluate(() => [...document.querySelectorAll('h1')].filter(x => x.offsetParent).map(x => parseFloat(getComputedStyle(x).fontSize)));
      assert(fs.every(x => x === 22), sel + ' Titelgröße ' + fs);
    }
    assert(!e.length, e.join(' | ')); await c.close();
  });

  await test('S Leiste: immer sichtbar – alle Bereiche, Tastatur, Drehen, Hinweise, Rückkehr', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    const navOk = () => p.evaluate(() => { const n = document.getElementById('nav').getBoundingClientRect(), se = document.scrollingElement;
      return n.height >= 50 && n.width >= 50 && n.top >= 0 && n.bottom <= innerHeight + 1 && !se.scrollTop && getComputedStyle(document.getElementById('nav')).visibility === 'visible'; });
    await open(p, '#kalender');
    const bad = [];
    for (const h of ['kalender', 'training/heute', 'training/lauf', 'training/rodeln/plan', 'training/auswertung', 'training/wissen/lesen', 'mobility/mobility/heute', 'mobility/atmung/hrv', 'schule', 'schule/plan', 'mehr', 'notizen', 'aufgaben', 'bibel', 'pause', 'tset']) {
      await p.evaluate(h => { location.hash = h; }, h); await wait(p, 900);
      if (!await navOk()) bad.push(h);
      // Eingabefeld der Seite antippen (Tastatur) und Inhalt ganz nach unten holen
      for (const f of p.frames()) { if (f === p.mainFrame()) continue;
        await f.evaluate(() => { if (!frameElement.classList.contains('on')) return; const i = [...document.querySelectorAll('input,textarea')].filter(x => x.offsetParent).pop(); if (i) i.focus(); const a = [...document.querySelectorAll('body *')].filter(x => x.offsetParent).pop(); if (a) a.scrollIntoView(); }).catch(() => {}); }
      await p.setViewportSize({ width: 412, height: 520 }); await wait(p, 250);
      if (!await navOk()) bad.push(h + ' Tastatur');
      await p.setViewportSize({ width: 412, height: 915 }); await wait(p, 250);
      if (!await navOk()) bad.push(h + ' nach Tastatur');
    }
    await p.setViewportSize({ width: 915, height: 412 }); await wait(p, 400);
    const rail = await p.evaluate(() => { const b = [...document.querySelectorAll('#nav button')].map(x => x.getBoundingClientRect()); return b.every(r => r.bottom <= innerHeight + 1 && r.top >= 0); });
    if (!rail) bad.push('quer: Knöpfe abgeschnitten');
    await p.setViewportSize({ width: 412, height: 915 }); await wait(p, 400);
    if (!await navOk()) bad.push('nach Drehen');
    // Hinweis des Verbunds (Erinnerung, Woche planen …) darf die Leiste nicht verdecken
    const over = await p.evaluate(() => { const r = document.getElementById('sg-shared-calendar').shadowRoot, v = r.querySelector('.v'), t = document.createElement('div');
      t.className = 'toast'; t.textContent = 'Test'; v.appendChild(t); const a = t.getBoundingClientRect(), n = document.getElementById('nav').getBoundingClientRect(); t.remove(); return a.bottom > n.top + 1; });
    if (over) bad.push('Hinweis liegt auf der Leiste');
    assert(!bad.length, bad.join(', '));
    assert(!(await p.evaluate(() => window.SGShellDiag())).some(d => /Leiste/.test(d.t)), 'Fehlerprotokoll meldet Leiste');
    assert(!e.length, e.join(' | ')); await c.close();
  });

  /* ---------- E: Version ---------- */
  await test('E Version in Mehr, Aktualisieren lädt neue Fassung', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#mehr');
    assert(new RegExp('Version ' + VER.replace(/\./g, '\\.')).test(await p.textContent('#n-mehr')), 'Version sichtbar');
    assert(await p.evaluate(() => SGUpdate.check()) === 'aktuell', 'gleiche Version');
    await p.route('**/planer/sw.js?v=*', r => r.fulfill({ body: "const VERSION = 'planer-9.9.9';", contentType: 'text/javascript' }));
    const nav = p.waitForEvent('framenavigated', { timeout: 25000 });
    await p.click('#n-mehr [data-m=update]'); await nav;
    await p.unroute('**/planer/sw.js?v=*');
    assert(!e.length, e.join(' | ')); await c.close();
  });

  /* ---------- F: alte Adressen in Daten ---------- */
  await test('F Alte Adressen in gespeicherten Daten zeigen in die App', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await c.addInitScript(() => { if (localStorage.getItem('oldlink')) return; localStorage.setItem('oldlink', '1');
      localStorage.setItem('sg-shared-calendar-v1', JSON.stringify({ v: 1, events: [{ id: 'o1', title: 'Alt', date: '2026-10-12', time: '', app: 'Training', link: location.origin + '/trainingsblog/#kalender', linkApp: 'training', linkHash: '#kalender', changed: 1 }] })); });
    await open(p, '#kalender');
    const l = await p.evaluate(() => JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events[0].link);
    assert(l === 'http://localhost:8765/planer/training/#kalender', 'gespeichert: ' + l);
    assert(!e.length, e.join(' | ')); await c.close();
  });

  /* ---------- G: Wochenplanung ---------- */
  await test('G Standardwoche festlegen und mit einem Tipp aus dem Kalender übernehmen', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#mehr');
    await p.click('#n-mehr [data-m=week]'); await wait(p, 300);
    await p.click('.wpw [data-w=stdedit]'); await p.click('.wpw [data-w=next]'); await p.click('.wpw [data-w=next]'); await p.click('.wpw [data-w=stdsavedef]');
    await p.click('.wpw [data-w=close]');
    await p.goto(APP + '#kalender'); await wait(p, 1500);
    await p.click('#fab'); await p.click('#sheet [data-s=std]'); await wait(p, 400);
    assert(/ist geplant/.test(await p.locator('.wpw .txt').first().textContent()), 'übernommen');
    assert(await p.evaluate(() => SharedCalendar.list().filter(e => e.wp).length) > 0, 'Einträge');
    assert(!e.length, e.join(' | ')); await c.close();
  });

  /* ---------- H: Handykalender (Kalenderdateien, Teilen) ---------- */
  const SAMSUNG = ['BEGIN:VCALENDAR', 'VERSION:1.0', 'BEGIN:VEVENT', 'UID:samsung-123',
    'SUMMARY;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:Geburtstag M=C3=BCller', 'DTSTART:20261020T160000Z', 'DTEND:20261020T170000Z',
    'DESCRIPTION;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:Kuchen mitbringen und =', 'Geschenk', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const ICAL = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', 'UID:abc@google.com', 'DTSTART;TZID=Europe/Berlin:20261021T073000', 'DTEND;TZID=Europe/Berlin:20261021T080000',
    'RRULE:FREQ=WEEKLY;UNTIL=20261231T000000Z', 'SUMMARY:Lauftreff\\, Stadtpark', 'LOCATION:Stadtpark', 'BEGIN:VALARM', 'TRIGGER:-PT30M', 'END:VALARM', 'END:VEVENT',
    'BEGIN:VEVENT', 'UID:ferien@x', 'DTSTART;VALUE=DATE:20261102', 'DTEND;VALUE=DATE:20261107', 'SUMMARY:Herbstferien mit einem sehr langen Titel der gefaltet wer', ' den muss', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const PHONE_DE = Object.assign({}, PHONE, { timezoneId: 'Europe/Berlin', locale: 'de-DE' });
  await test('H Handykalender: Export nur Neues/Geändertes, Schule wählbar, gültige .ics', async () => {
    const c = await ctxFor(PHONE_DE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    const r = await p.evaluate(() => { const ph = SharedCalendar.phone, a = ph.pending('neu'), ics = ph.ics(a);
      ph.markSent(a); const after = ph.pending('neu').length;
      const ev = SharedCalendar.list().find(x => x.title === 'Zahnarzt'); SharedCalendar.update(ev.id, { time: '15:00', changed: Date.now() });
      const ch = ph.pending('neu').map(x => x.title);
      ph.setOpt('schule', false); const noSchool = ph.pending('alle').filter(x => x.app === 'Lernplan').length;
      return { titles: a.map(x => x.title), n: (ics.match(/BEGIN:VEVENT/g) || []).length, ok: /^BEGIN:VCALENDAR\r\n/.test(ics) && /END:VCALENDAR\r\n$/.test(ics) && ics.split('\r\n').every(l => l.length <= 75), after, ch, noSchool }; });
    assert(r.titles.includes('Rodeltraining') && r.titles.includes('Zahnarzt') && r.titles.some(t => /Mathematik|Schulaufgabe/.test(t)), 'Export ' + r.titles);
    assert(r.n === r.titles.length && r.ok, 'ics-Format');
    assert(r.after === 0, 'nach Übertragung nichts Neues');
    assert(r.ch.length === 1 && r.ch[0] === 'Zahnarzt', 'nur geändert: ' + r.ch);
    assert(r.noSchool === 0, 'Schule abwählbar');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('H Handykalender: Samsung-Datei (vCalendar, Umlaute), iCal mit Zeitzone/Wiederholung/ganztägig, keine Doppelten', async () => {
    const c = await ctxFor(PHONE_DE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    const r = await p.evaluate(([S, I]) => { const ph = SharedCalendar.phone, a = ph.parse(S), b = ph.parse(I);
      const r1 = ph.apply(a.concat(b)), r2 = ph.apply(ph.parse(S).concat(ph.parse(I)));
      const own = ph.parse(ph.ics(ph.pending('alle'))), r3 = ph.apply(own);
      return { a, b, r1, r2, r3, n: SharedCalendar.list().filter(x => x.app === 'Handy').length }; }, [SAMSUNG, ICAL]);
    const g = r.a[0];
    assert(g.title === 'Geburtstag Müller' && g.date === '2026-10-20' && g.time === '18:00' && g.end === '19:00' && /Kuchen mitbringen und Geschenk/.test(g.note), 'Samsung ' + JSON.stringify(g));
    const l = r.b[0], f = r.b[1];
    assert(l.title === 'Lauftreff, Stadtpark' && l.time === '07:30' && l.end === '08:00' && l.rep && l.rep.f === 'w' && l.rep.until === '2026-12-31' && l.remind === 30 && /Ort: Stadtpark/.test(l.note), 'iCal ' + JSON.stringify(l));
    assert(f.time === '' && f.date === '2026-11-02' && /bis 6\.11\.2026/.test(f.note) && /gefaltet werden muss/.test(f.title), 'ganztägig ' + JSON.stringify(f));
    assert(r.r1.added === 3 && r.r2.added === 0 && r.r2.same === 3 && r.r3.added === 0, 'Doppelte ' + JSON.stringify([r.r1, r.r2, r.r3]));
    assert(r.n === 3, 'Handy-Termine ' + r.n);
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('H Handykalender: geteilter Text wird erkannt', async () => {
    const c = await ctxFor(PHONE_DE), p = await c.newPage();
    await open(p, '#kalender');
    const r = await p.evaluate(() => [SharedCalendar.phone.parse('Zahnarzt Dr. Weber\nDi., 20. Okt. 2026 14:30 – 15:15\nPraxis am Markt'),
      SharedCalendar.phone.parse('Training 21.10.2026 17:00'), SharedCalendar.phone.parse('ohne Datum')]);
    assert(r[0][0].title === 'Zahnarzt Dr. Weber' && r[0][0].date === '2026-10-20' && r[0][0].time === '14:30' && r[0][0].end === '15:15' && r[0][0].note === 'Praxis am Markt', JSON.stringify(r[0]));
    assert(r[1][0].date === '2026-10-21' && r[1][0].time === '17:00', JSON.stringify(r[1]));
    assert(r[2].length === 0, 'ohne Datum');
    await c.close();
  });
  await test('H Handykalender: Teilen › Planer (Share Target) und Mehr › Handykalender', async () => {
    const c = await ctxFor(PHONE_DE), p = await c.newPage(), e = watch(p);
    await p.goto(APP); await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 20000 });
    const m = await (await p.request.get(U + 'manifest.json')).json();
    assert(m.share_target && m.share_target.method === 'POST' && m.share_target.params.files[0].accept.includes('.vcs'), 'Manifest share_target');
    const st = await p.evaluate(async (S) => { const fd = new FormData(); fd.append('title', ''); fd.append('datei', new File([S], 'termin.vcs', { type: 'text/x-vcalendar' }));
      const r = await fetch(new URL(navigator.serviceWorker.controller ? '../app/?teilen' : '', location.href), { method: 'POST', body: fd }); return [r.status, r.url, !!(await (await caches.open('sg-teilen')).match('geteilt.json'))]; }, SAMSUNG);
    assert(st[0] === 200 && /planer\/app\/$/.test(st[1]) && st[2], 'Weiterleitung/Ablage ' + st);
    await p.goto(APP + '#teilen'); await wait(p, 1200);
    assert(/1 Termin übernehmen/.test(await p.textContent('#sheet')), 'Vorschau');
    await p.click('#sheet [data-s=yes]'); await wait(p, 500);
    assert(await p.evaluate(() => SharedCalendar.list().some(x => x.title === 'Geburtstag Müller' && x.app === 'Handy')), 'übernommen');
    assert(await p.evaluate(async () => !(await (await caches.open('sg-teilen')).match('geteilt.json'))), 'Ablage geleert');
    await p.goto(APP + '#mehr'); await wait(p, 1200);
    await p.click('#n-mehr [data-m=handy]'); await wait(p, 300);
    assert(/Handykalender/.test(await p.textContent('#sheet')), 'Blatt');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#sheet [data-s=outall]')]);
    const txt = fs.readFileSync(await dl.path(), 'utf8');
    assert(/BEGIN:VCALENDAR/.test(txt) && /SUMMARY:Rodeltraining/.test(txt) && !/samsung-123/.test(txt), 'Datei (ohne gerade aus dem Handy übernommene Termine)');
    assert(!e.length, e.join(' | ')); await c.close();
  });

  /* ---------- J: Manifest ---------- */
  await test('J Manifest startet in der Hülle, alles im Bereich der App', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage();
    await p.goto(APP); const m = await (await p.request.get(U + 'manifest.json')).json();
    assert(m.scope === './' && m.display === 'standalone' && m.start_url === './app/' && m.id === './', 'Manifest');
    assert(m.shortcuts.every(s => s.url.indexOf('./app/#') === 0), 'Verknüpfungen');
    await c.close();
  });

  /* ---------- L: Sportwissenschaft (Seite einzeln) ---------- */
  /* ---------- L: Sportwissenschaft ---------- */
  const W = U + 'wissen/?einzeln';
  await test('L Lesen: 8 Kapitel, Fortschritt und Leseposition bleiben gespeichert', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await p.goto(W); await wait(p, 800);
    assert((await p.$$('[data-go^="#lesen/k"]')).length === 8, 'nicht 8 Kapitel');
    await p.click('[data-go="#lesen/k4"]'); await wait(p, 400);
    assert(/Dehnen/.test(await p.textContent('.book h1')), 'Kapitel 4 Titel');
    const mid = await p.evaluate(() => { const el = document.querySelector('#k4-20'); el.scrollIntoView(); return el.id; }); await wait(p, 600);
    await p.click('#back'); await wait(p, 300);
    assert(/Dehnen/.test(await p.textContent('main')) && await p.$('.row .meter'), 'Weiterlesen fehlt');
    await p.reload(); await wait(p, 600);
    await p.click('.grp .row[data-go*="@"]'); await wait(p, 500);
    const top = await p.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(); return Math.round(r.top); }, mid);
    assert(Math.abs(top) < 400, 'Leseposition nicht wiederhergestellt: ' + top);
    await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await wait(p, 900);
    assert(await p.evaluate(() => JSON.parse(localStorage.getItem('sg-wissen-v1')).read.k4.done) === true, 'Kapitel nicht als gelesen markiert');
    await p.goto(W + '#lesen'); await wait(p, 300);
    assert(/1 von 8 Kapiteln gelesen/.test(await p.textContent('main')), 'Zähler');
    const ov = await p.evaluate(() => { location.hash = '#lesen/k2'; return new Promise(r => setTimeout(() => r(document.documentElement.scrollWidth - innerWidth), 400)); });
    assert(ov <= 2, 'waagrechtes Scrollen ' + ov);
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('L Inhalt und Schriftgröße im Lesemodus', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await p.goto(W + '#lesen/k6'); await wait(p, 500);
    await p.click('[data-a=toc]'); const n = (await p.$$('.sheet [data-sec]')).length; assert(n >= 7, 'Inhalt ' + n);
    await p.locator('.sheet [data-sec]').nth(3).click(); await wait(p, 300);
    await p.click('[data-a=font]'); await p.click('.sheet [data-font="3"]'); await p.mouse.click(5, 5);
    assert(await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fs').trim()) === '20px', 'Schrift');
    await p.reload(); await wait(p, 400);
    assert(await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fs').trim()) === '20px', 'Schrift nicht gemerkt');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('L Karteikarten: Merksätze und Mach/Lass, Nochmal kommt wieder, Gewusst wird fällig später', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await p.goto(W + '#karten'); await wait(p, 500);
    assert(/45 Merksätze und 88/.test(await p.textContent('main')), 'Kartenzahl');
    await p.click('[data-cfch="k3"]'); await p.click('[data-cfk="m"]');
    assert(/Lernen · 5 Karten/.test(await p.textContent('[data-a=learn]')), 'Filter Kapitel 3 Merksätze');
    await p.click('[data-a=learn]'); await wait(p, 200);
    assert(/Karte 1 von 5/.test(await p.textContent('.progline')), 'Sitzung');
    await p.click('#fc'); await p.click('[data-a=again]'); await wait(p, 100);
    assert(/Karte 2 von 6/.test(await p.textContent('.progline')), 'Nochmal nicht hinten angehängt');
    for (let i = 0; i < 5; i++) { await p.click('[data-a=flip]'); await p.click('[data-a=knew]'); }
    assert(/Runde geschafft/.test(await p.textContent('main')), 'Ende');
    const s = await p.evaluate(() => JSON.parse(localStorage.getItem('sg-wissen-v1')));
    const boxes = Object.values(s.cards).map(x => x.b).sort().join();
    assert(boxes === '2,2,2,2,2', 'Boxen ' + boxes); assert(Object.values(s.cards).every(x => x.n > Date.now() + 20 * 36e5), 'nächste Fälligkeit');
    await p.click('[data-a=cardshome]'); await wait(p, 200);
    assert(/Lernen · 0|Alles gelernt/.test(await p.textContent('[data-a=learn]')), 'Gelernte Karten nicht sofort wieder fällig');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('L Quiz: Auswertung, falsche Antworten kommen wieder und verschwinden bei richtiger Antwort', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await p.goto(W + '#quiz'); await wait(p, 500);
    await p.click('[data-qfch="k5"]'); await p.click('[data-a=quiz]'); await wait(p, 200);
    const wrongIdx = () => p.evaluate(() => { const b = [...document.querySelectorAll('[data-opt]')]; return b.findIndex(x => !/8–10 Stunden|Massage|bremsen Muskel|Wettkampfwochenende|keine Veränderung|Schneller und|unter 7 Stunden/.test(x.textContent)); });
    for (let i = 0; i < 7; i++) { await p.click('[data-opt="' + await wrongIdx() + '"]'); await p.click('[data-a=qnext]'); }
    assert(/0 von 7 richtig/.test(await p.textContent('main')), 'Auswertung: ' + (await p.textContent('.res h1')));
    assert((await p.$$('.grp .row')).length === 7, 'Liste der Fehler');
    assert(/Falsche wiederholen/.test(await p.textContent('main')), 'Wiederholen-Knopf');
    await p.click('[data-a=quizwrong]'); await wait(p, 200);
    const rightIdx = () => p.evaluate(() => [...document.querySelectorAll('[data-opt]')].findIndex(x => /^(8–10 Stunden|Massage|Sie bremsen Muskel|Am Wettkampfwochenende|Nein, es zeigte keine Veränderung|Schneller und mit weniger|Gewohnheitsmäßig unter 7 Stunden)/.test(x.textContent)));
    for (let i = 0; i < 7; i++) { await p.click('[data-opt="' + await rightIdx() + '"]'); await p.click('[data-a=qnext]'); }
    assert(/7 von 7 richtig/.test(await p.textContent('main')), 'Wiederholung');
    assert(await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('sg-wissen-v1')).quiz.wrong).length) === 0, 'Fehler nicht gelöscht');
    await p.goto(W + '#quiz'); await wait(p, 300);
    assert(/7 von 7 richtig/.test(await p.textContent('.hist')) && /0 von 7 richtig/.test(await p.textContent('.hist')), 'Verlauf');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('L Suche über das ganze Buch (Eisbad, Dehnen, Umlaute) und Sprung zur Stelle', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await p.goto(W + '#suche'); await wait(p, 400);
    const n = async q => { await p.fill('#q', q); await wait(p, 50); const t = await p.textContent('#res'); const m = /(\d+) Treffer/.exec(t); return m ? +m[1] : 0; };
    assert(await n('Eisbad') >= 5, 'Eisbad'); assert(await n('Dehnen') >= 10, 'Dehnen');
    assert(await n('gehirnerschutterung') >= 3, 'ohne Umlaut'); assert(await n('Kältebad Kraft') >= 2, 'zwei Wörter');
    assert(await n('xyzunbekannt') === 0 && /Nichts gefunden/.test(await p.textContent('#res')), 'leer');
    await n('Eisbad-Dilemma'); await p.click('#res .hit'); await wait(p, 500);
    assert(/#lesen\/k5@/.test(await p.evaluate(() => location.hash)), 'Sprung');
    assert(await p.evaluate(() => { const el = document.querySelector('.flash'); return el && Math.abs(el.getBoundingClientRect().top) < 300; }), 'Stelle nicht markiert');
    await p.goBack(); await wait(p, 300); assert(await p.inputValue('#q') === 'Eisbad-Dilemma', 'Suchbegriff nicht behalten');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  const ok = results.filter(r => r[0]).length;
  console.log(`\n${ok}/${results.length} Tests grün`); results.filter(r => !r[0]).forEach(r => console.log('FEHLER:', r[1], '–', r[2]));
  fs.writeFileSync(__dirname + '/suite-result.json', JSON.stringify(results, null, 1));
  await browser.close(); process.exit(ok === results.length ? 0 : 1);
})();
