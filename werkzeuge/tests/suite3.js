// Gesamt-Testsuite für den neuen Aufbau (Hülle /planer/app/) – node suite3.js [filter]
const { chromium } = require('playwright');
const fs = require('fs');
const U = 'http://localhost:8765/planer/', APP = U + 'app/';
const SEED = fs.readFileSync(__dirname + '/seed.js', 'utf8');
const ONLY = process.argv[2] || '';
const VER = '3.8.0';
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
function watch(p) { const e = []; p.on('pageerror', x => e.push('pageerror: ' + x.message)); p.on('console', m => { const u = (m.location() || {}).url || ''; if (m.type() === 'error' && !(/^Failed to load resource: net::ERR_/.test(m.text()) && !/^http:\/\/localhost/.test(u))) e.push('console: ' + m.text() + ' @ ' + ((m.location() || {}).url || '')); }); return e; }
function assert(c, m) { if (!c) throw new Error(m); }
async function test(name, fn) {
  if (ONLY && !name.toLowerCase().includes(ONLY.toLowerCase())) return;
  const t0 = Date.now();
  try { await fn(); results.push([true, name, Date.now() - t0]); console.log('✓', name); }
  catch (e) { results.push([false, name, e.message]); console.log('✗', name, '–', e.message.split('\n')[0]); }
}
const wait = (p, ms) => p.waitForTimeout(ms);
const state = p => p.evaluate(() => ({ hash: location.hash, title: document.getElementById('title').textContent, tab: (document.querySelector('#nav .on') || {}).dataset?.tab,
  chips: [...document.querySelectorAll('#chips .chip.on')].map(c => c.textContent), path: (document.getElementById('path') || {}).textContent, frame: (document.querySelector('#stage iframe.on') || {}).dataset?.p ?? null }));
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
  // Wischen/Langdruck auf einem Element (Touch-Ereignisse wie am Handy)
  const touch = (p, sel, dx, dy, ms) => p.evaluate(([sel, dx, dy, ms]) => new Promise(res => {
    const g = document.querySelector(sel), r = g.getBoundingClientRect(), x0 = r.left + r.width / 2, y0 = r.top + Math.min(r.height / 2, 120);
    const tgt = document.elementFromPoint(x0, y0) || g, t = (x, y) => new Touch({ identifier: 1, target: tgt, clientX: x, clientY: y });
    tgt.dispatchEvent(new TouchEvent('touchstart', { touches: [t(x0, y0)], changedTouches: [t(x0, y0)], bubbles: true }));
    setTimeout(() => { if (dx || dy) tgt.dispatchEvent(new TouchEvent('touchmove', { touches: [t(x0 + dx, y0 + dy)], changedTouches: [t(x0 + dx, y0 + dy)], bubbles: true }));
      tgt.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t(x0 + dx, y0 + dy)], bubbles: true })); res(); }, ms || 30);
  }), [sel, dx, dy, ms]);
  const trFrame = p => p.frames().find(f => /\/planer\/training\/(#|$)/.test(f.url()));
  // Ist in der sichtbaren Seite der Unterbereich aus V aktiv? (Sprungadresse h oder Knopf sel)
  const activeOk = p => p.evaluate(() => {
    const m = location.hash.slice(1).split('/'), v = SGShell.V[m[0]], s = v.secs.find(x => x.id === m[1]) || v.secs[0], k = s.kids ? (s.kids.find(x => x.id === m[2]) || s.kids[0]) : null;
    const f = document.querySelector('#stage iframe.on'); if (!f) return 'keine Seite';
    if (f.dataset.p !== s.p) return 'Seite ' + f.dataset.p + ' statt ' + s.p;
    const d = f.contentDocument, h = (k && k.h) || s.h, sv = (k && k.s) || s.s;
    if (!d || !d.body) return 'nicht geladen';
    if (sv && s.sel) { const el = d.querySelector(s.sel.replace(/X/g, sv)); return el && (el.classList.contains('on') || el.classList.contains('active')) ? '' : 'Knopf ' + sv + ' nicht aktiv'; }
    if (s.p === 'training/') { const scr = h === 'kraft' ? 'lauf' : h === 'daten' ? 'daten' : h, el = d.getElementById('s-' + scr);
      if (!el || !el.classList.contains('active')) return 'Training ' + h + ' nicht aktiv';
      if ((h === 'lauf' || h === 'kraft') && el.getAttribute('data-part') !== h) return 'Ausschnitt ' + el.getAttribute('data-part');
      if (h === 'kraft' && d.querySelector('#s-lauf [data-sec=runtrack]').offsetParent) return 'Kraft zeigt Lauf';
      if (h === 'lauf' && d.querySelector('#s-lauf [data-sec=gym]').offsetParent) return 'Laufen zeigt Gym';
      return ''; }
    if (s.p === 'bibel/') { const t = h === 'lesen' ? 'heute' : h, el = d.getElementById('view-' + t); return el && el.classList.contains('active') ? '' : 'Bibel ' + h; }
    if (s.p === 'wissen/') { const el = d.querySelector('.tabs button.on'); return el && el.dataset.t === h ? '' : 'Wissen ' + h + ' / ' + (el && el.dataset.t); }
    return '';
  });
  const dwOpen = p => p.evaluate(() => document.getElementById('drawer').classList.contains('on'));
  await test('S Seitenmenü: jeder Pfad (Ziel, Eintrag, Untereintrag) öffnet die richtige Seite und den Unterbereich', async () => {
    const c = await ctxFor({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true }), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    const bad = []; let n = 0;
    for (const t of ['training', 'schule', 'bibel', 'pause']) {
      await p.goto(APP + '#' + t); await wait(p, 1500);
      assert(!(await p.$$('#chips .chip')).length, 'Chips in ' + t);
      const V = await p.evaluate(t => SGShell.V[t].secs.map(s => [s.id, (s.kids || []).map(k => k.id)]), t);
      for (const [sid, kids] of V) for (const kid of (kids.length ? kids : [null])) {
        await p.click('#menu'); await wait(p, 300);
        if (!await dwOpen(p)) { bad.push(t + ': Menü geht nicht auf'); continue; }
        if (kid) {
          if (!await p.isVisible(`#dwpn [data-sec="${sid}"][data-kid="${kid}"]`)) await p.click(`#dwpn [data-exp="${sid}"]`);
          await p.click(`#dwpn [data-sec="${sid}"][data-kid="${kid}"]`);
        } else await p.click(`#dwpn .dw-r [data-sec="${sid}"]`);
        await wait(p, 1400); n++;
        const st = await state(p), want = '#' + t + '/' + sid + (kid ? '/' + kid : '');
        if (await dwOpen(p)) bad.push(want + ' Menü bleibt offen');
        if (st.hash !== want) bad.push(want + ' Adresse ' + st.hash);
        let a = await activeOk(p); if (a) { await wait(p, 1500); a = await activeOk(p); }
        if (a) bad.push(want + ': ' + a);
        const path = await p.textContent('#path');
        if (!path.startsWith(await p.textContent(`#dwpn .dw-r [data-sec="${sid}"]`))) bad.push(want + ' Pfadzeile ' + path);
      }
    }
    // Ende des Menüs: Training einstellen, Zurück zu Mehr
    await p.goto(APP + '#training/heute'); await wait(p, 1200); await p.click('#menu'); await wait(p, 300);
    await p.click('#dwpn [data-dgo=tset]'); await wait(p, 1500);
    if ((await state(p)).hash !== '#tset') bad.push('Training einstellen → ' + (await state(p)).hash);
    await p.goto(APP + '#mehr'); await wait(p, 800); await p.click('#n-mehr [data-m=bibel]'); await wait(p, 1500);
    await p.click('#menu'); await wait(p, 300); await p.click('#dwpn [data-dgo=mehr]'); await wait(p, 800);
    if ((await state(p)).hash !== '#mehr') bad.push('Zurück zu Mehr → ' + (await state(p)).hash);
    // Mobility behält die Chips
    await p.goto(APP + '#mobility/atmung/verlauf'); await wait(p, 2000);
    if (await p.isVisible('#menu') || (await p.$$('#chips .chip')).length < 5) bad.push('Mobility ohne Chips');
    await p.click('#chips [data-kid=woche]'); await wait(p, 1200);
    if ((await state(p)).hash !== '#mobility/atmung/woche' || await activeOk(p)) bad.push('Mobility-Chip ' + (await activeOk(p)));
    assert(n >= 25, 'nur ' + n + ' Pfade');
    assert(!bad.length, bad.join('; '));
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('S Seitenmenü öffnen/schließen: Symbol, Pfadzeile, Tab, Hintergrund, Wischen, Escape; Zurück schließt zuerst', async () => {
    const c = await ctxFor({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true }), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    assert(!await p.isVisible('#menu'), 'Symbol im Kalender');
    await p.click('#nav [data-tab=training]'); await wait(p, 1200);
    const h0 = (await state(p)).hash;
    assert(!await dwOpen(p), 'öffnet von selbst');
    // Symbol 44×44 links, Pfadzeile darunter
    const r = await p.evaluate(() => { const m = document.getElementById('menu').getBoundingClientRect(), t = document.getElementById('title').getBoundingClientRect(), q = document.getElementById('path').getBoundingClientRect(); return [m.width, m.height, m.left, t.left, q.top - t.bottom]; });
    assert(r[0] >= 44 && r[1] >= 44 && r[2] < r[3] && r[4] >= -2, 'Kopf ' + r);
    await p.click('#menu'); await wait(p, 300); assert(await dwOpen(p), 'Symbol');
    assert(await p.evaluate(() => document.activeElement && document.activeElement.classList.contains('on')), 'Fokus auf aktivem Eintrag');
    // Zurück: erst Menü zu, Seite bleibt
    await p.goBack(); await wait(p, 400);
    assert(!await dwOpen(p) && (await state(p)).hash === h0, 'Zurück schließt Menü: ' + (await state(p)).hash);
    assert(await p.evaluate(() => document.activeElement === document.getElementById('menu')), 'Fokus zurück aufs Symbol');
    await p.click('#path'); await wait(p, 450); assert(await dwOpen(p), 'Pfadzeile');
    await p.mouse.click(350, 400); await wait(p, 400); assert(!await dwOpen(p), 'Hintergrund');
    await p.click('#nav [data-tab=training]'); await wait(p, 300); assert(await dwOpen(p), 'Tab nochmal');
    await touch(p, '#dwpn', -120, 4, 80); await wait(p, 400); assert(!await dwOpen(p), 'Wischen nach links');
    await p.click('#menu'); await wait(p, 300); await p.keyboard.press('Escape'); await wait(p, 400); assert(!await dwOpen(p), 'Escape');
    // kein Öffnen durch Wischen vom Rand
    await touch(p, '#stage', 200, 0, 80); await wait(p, 300); assert(!await dwOpen(p), 'Randwischen öffnet');
    assert((await state(p)).hash === h0, 'Adresse verändert ' + (await state(p)).hash);
    // Zurück-Reihenfolge Menü → Seite: Training wurde vom Kalender aus geöffnet
    await p.click('#menu'); await wait(p, 300);
    await p.click('#dwpn .dw-r [data-sec=kraft]'); await wait(p, 900);
    assert((await state(p)).hash === '#training/kraft', 'Kraft ' + (await state(p)).hash);
    await p.click('#menu'); await wait(p, 300);
    await p.goBack(); await wait(p, 400); assert(!await dwOpen(p) && (await state(p)).hash === '#training/kraft', 'erst Menü zu');
    await p.goBack(); await wait(p, 600); assert((await state(p)).tab === 'kalender', 'dann Seite zurück: ' + (await state(p)).hash);
    // Untereinträge: nur einer offen, aktiver aufgeklappt
    await p.goto(APP + '#training/rodeln/bahnen'); await wait(p, 1500); await p.click('#menu'); await wait(p, 300);
    let ex = await p.$$eval('#dwpn .dw-g.ex .dw-r [data-sec]', l => l.map(x => x.dataset.sec));
    assert(ex.join() === 'rodeln', 'aufgeklappt ' + ex);
    await p.click('#dwpn [data-exp=auswertung]'); await wait(p, 150);
    ex = await p.$$eval('#dwpn .dw-g.ex .dw-r [data-sec]', l => l.map(x => x.dataset.sec));
    assert(ex.join() === 'auswertung', 'nur einer ' + ex);
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('S Prüfbefunde Phase 2: Doppeltipp, Tastatur bleibt im Menü, Zurück zu Mehr, Tablet-Aufklappen, Ausschnitt aus der Seite', async () => {
    const c = await ctxFor({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true }), p = await c.newPage(), e = watch(p), bad = [];
    await open(p, '#kalender'); await p.click('#nav [data-tab=training]'); await wait(p, 1200);
    // zwei schnelle Tipps: das sich schließende Menü nimmt keinen zweiten an, kein falscher Verlaufseintrag
    await p.click('#menu'); await wait(p, 400);
    await p.click('#dwpn .dw-r [data-sec=lauf]'); await wait(p, 100); await p.mouse.click(60, 250); await wait(p, 900);
    if ((await state(p)).hash !== '#training/lauf') bad.push('Doppeltipp ' + (await state(p)).hash);
    await p.goBack(); await wait(p, 600); if ((await state(p)).tab !== 'kalender') bad.push('Verlauf nach Doppeltipp ' + (await state(p)).hash);
    // Tab bleibt im Menü (Rest ist gesperrt), Escape schließt
    await p.goto(APP + '#schule'); await wait(p, 1500); await p.click('#menu'); await wait(p, 400);
    for (let n = 0; n < 15; n++) { await p.keyboard.press('Tab'); const w = await p.evaluate(() => { const a = document.activeElement; return a === document.body ? 'body' : a.closest('#dwpn') ? 'menu' : a.tagName + '#' + a.id; }); if (w !== 'menu' && w !== 'body') { bad.push('Fokus verlässt Menü: ' + w); break; } }
    await p.keyboard.press('Escape'); await wait(p, 400); if (await dwOpen(p)) bad.push('Escape nach Tab');
    if (await p.evaluate(() => document.getElementById('stage').hasAttribute('inert'))) bad.push('bleibt gesperrt');
    // „Zurück zu Mehr“ führt nach Mehr, auch wenn Bibel aus dem Kalender kam
    await p.goto(APP + '#kalender'); await wait(p, 1200); await p.evaluate(() => SGShell.openUrl('bibel/#lesen')); await wait(p, 1500);
    await p.click('#menu'); await wait(p, 400); await p.click('#dwpn [data-dgo=mehr]'); await wait(p, 900);
    if ((await state(p)).hash !== '#mehr') bad.push('Zurück zu Mehr ' + (await state(p)).hash);
    // Sprung aus der Seite (Alternative „Nur Dehnen“) landet auf Kraft mit passender Pfadzeile
    await p.goto(APP + '#training/heute'); await wait(p, 2200);
    await trFrame(p).evaluate(() => document.getElementById('btnAdaptiveStretch').click()); await wait(p, 1500);
    const st = await state(p);
    if (st.hash !== '#training/kraft' || !/^Kraft/.test(st.path) || await activeOk(p)) bad.push('Nur Dehnen → ' + st.hash + ' ' + st.path + ' ' + await activeOk(p));
    await c.close();
    // Tablet: nach Zuklappen und Wechsel ist der neue aktive Eintrag aufgeklappt
    const t = await ctxFor(TAB), q = await t.newPage(); e.push(...watch(q));
    await open(q, '#training/rodeln/plan'); await q.click('#dwpn [data-exp=rodeln]'); await wait(q, 150);
    await q.click('#dwpn [data-sec=auswertung][data-kid=fitness]', { force: true }).catch(async () => { await q.click('#dwpn [data-exp=auswertung]'); await q.click('#dwpn [data-sec=auswertung][data-kid=fitness]'); }); await wait(q, 1200);
    const ex = await q.$$eval('#dwpn .dw-g.ex .dw-r [data-sec]', l => l.map(x => x.dataset.sec).join());
    if (ex !== 'auswertung') bad.push('Tablet aufgeklappt: ' + ex);
    if (await q.evaluate(() => document.getElementById('path').tabIndex) !== -1) bad.push('Pfadzeile auf Tablet fokussierbar');
    await t.close();
    // Querformat-Handy (915 × 412): Menü zum Aufziehen statt fester Spalte
    const l = await ctxFor({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true }), r = await l.newPage();
    await open(r, '#schule'); if (!await r.isVisible('#menu')) bad.push('Querformat ohne Menü-Symbol'); await l.close();
    assert(!bad.length, bad.join('; '));
    assert(!e.length, e.join(' | '));
  });
  for (const [lab, opt, zoom] of [['360×640', { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true }, 1], ['360×800 Schrift 130 %', { viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true }, 1.3],
    ['800×1280', { viewport: { width: 800, height: 1280 }, hasTouch: true }, 1], ['1280×800', TAB, 1], ['1280×800 Schrift 130 %', TAB, 1.3]]) {
    await test(`S Seitenmenü passt: ${lab}`, async () => {
      const c = await ctxFor(opt), p = await c.newPage(), e = watch(p);
      await open(p, '#schule/aufgaben');
      if (zoom !== 1) { await p.evaluate(z => { document.documentElement.style.zoom = z; }, zoom); await wait(p, 300); }
      const wide = opt.viewport.width / zoom >= 900;
      if (!wide) { await p.click('#menu'); await wait(p, 350); }
      const r = await p.evaluate(() => {
        const pn = document.getElementById('dwpn').getBoundingClientRect(), it = [...document.querySelectorAll('#dwpn .dw-it')].filter(x => x.offsetParent).map(x => x.getBoundingClientRect().height),
          st = document.getElementById('stage').getBoundingClientRect(), last = [...document.querySelectorAll('#dwpn .dw-it')].pop().getBoundingClientRect();
        return { w: pn.width, left: pn.left, minH: Math.min(...it), stLeft: st.left, menu: !!document.getElementById('menu').offsetParent, over: document.documentElement.scrollWidth - innerWidth,
          title: (t => t.scrollWidth <= t.clientWidth + 1)(document.getElementById('title')), lastIn: last.bottom <= innerHeight + 1 || document.getElementById('dwpn').scrollHeight > document.getElementById('dwpn').clientHeight };
      });
      ['w', 'left', 'minH', 'stLeft'].forEach(k => { r[k] /= zoom; });
      if (wide) assert(Math.abs(r.w - 260) < 2 && r.left >= 91 && r.stLeft >= 350 && !r.menu, 'feste Spalte ' + JSON.stringify(r));
      else assert(r.w <= Math.min(opt.viewport.width / zoom * 0.86, 320) + 1 && r.left === 0 && r.menu, 'Menü ' + JSON.stringify(r));
      assert(r.minH >= 55.5, 'Einträge zu niedrig ' + r.minH);
      assert(r.over <= 1 && r.title && r.lastIn, 'Überlauf ' + JSON.stringify(r));
      // Eintrag wählen klappt in jeder Größe
      await p.click('#dwpn .dw-r [data-sec=plan]'); await wait(p, 1200);
      assert((await state(p)).hash === '#schule/plan' && !(await activeOk(p)), 'Wahl ' + (await state(p)).hash);
      assert(!await dwOpen(p), 'Menü bleibt offen');
      assert(!e.length, e.join(' | ')); await c.close();
    });
  }
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
  /* ---------- T: Training aufgeräumt (Phase 3) ---------- */
  const SMALL = { viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true };
  await test('T Training: jede Seite zeigt ihre Hauptaktion ohne Scrollen (360×800), Laufen und Kraft getrennt', async () => {
    const c = await ctxFor(SMALL), p = await c.newPage(), e = watch(p), bad = [];
    for (const [h, sel] of [['heute', '#btnStartToday'], ['lauf', '#btnRunTrackStart'], ['kraft', '#btnGymStart'], ['auswertung/fitness', '[data-sec=fitscore]'], ['auswertung/analyse', '[data-sec=dkpis]'], ['auswertung/rueckblick', '[data-sec=calgrid]']]) {
      await open(p, '#training/' + h);
      const r = await trFrame(p).evaluate(sel => { const el = document.querySelector(sel), b = el && el.getBoundingClientRect(); return el && el.offsetParent ? [Math.round(b.top), Math.round(b.bottom), innerHeight, scrollY] : null; }, sel);
      if (!r || r[3] > 0 || r[0] < 0 || r[1] > r[2]) bad.push(h + ' ' + JSON.stringify(r));
    }
    // Laufen ohne Gym/Dehnen, Kraft ohne Lauf; in Kraft steht Dehnen (120 Übungen) gleich nach Gym
    await open(p, '#training/lauf');
    let v = await trFrame(p).evaluate(() => ['runtrack', 'distance', 'gym', 'tsmob', 'tsbreath', 'tsbahn', 'gymhistory'].map(k => { const x = document.querySelector('#s-lauf [data-sec=' + k + ']'); return k + ':' + !!(x && x.offsetParent); }).join()
      + ([...document.querySelectorAll('#s-lauf .sec-label')].some(x => x.offsetParent && /Programme/.test(x.textContent)) ? ' Programme-Überschrift' : ''));
    if (v !== 'runtrack:true,distance:true,gym:false,tsmob:false,tsbreath:false,tsbahn:false,gymhistory:false') bad.push('Laufen ' + v);
    await open(p, '#training/kraft');
    v = await trFrame(p).evaluate(() => { const vis = [...document.querySelectorAll('#s-lauf > [data-sec]')].filter(x => x.offsetParent).sort((a, b) => getComputedStyle(a).order - getComputedStyle(b).order).map(x => x.dataset.sec); return vis.join(); });
    if (!/^gym,tsmob,/.test(v) || /runtrack|distance/.test(v)) bad.push('Kraft ' + v);
    assert(!bad.length, bad.join('; '));
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('T Heute: Startknopf klar beschriftet, Kennzahlenreihe, höchstens drei Bildschirmhöhen Scrollen auch ganz aufgeklappt', async () => {
    const c = await ctxFor(SMALL), p = await c.newPage(), e = watch(p);
    await c.addInitScript(() => { if (!sessionStorage.akk) { const o = {}; ['exercises', 'readiness', 'weathertoday', 'weekbar', 'sickcheckin', 'injurycheckin', 'adaptive', 'whatsnew', 'importcard', 'tip'].forEach(k => o[k] = 1); localStorage.setItem('sg-training-akk-v1', JSON.stringify(o)); sessionStorage.akk = 1; } });
    await open(p, '#training/heute');
    const r = await trFrame(p).evaluate(() => ({ btn: document.getElementById('btnStartToday').textContent, dots: document.querySelectorAll('#kpiWeek .dots i').length, today: document.querySelectorAll('#kpiWeek .dots i.today').length,
      kpiTop: document.querySelector('[data-sec=kpis]').getBoundingClientRect().top, heroTop: document.querySelector('[data-sec=hero]').getBoundingClientRect().top,
      closed: document.querySelectorAll('#s-heute .acc.closed').length, sh: document.documentElement.scrollHeight, ih: innerHeight }));
    assert(/starten · \d+ min|Zum Lauf|Nochmal/.test(r.btn), 'Startknopf ' + r.btn);
    assert(r.dots === 7 && r.today === 1, 'Wochenpunkte ' + r.dots);
    assert(r.heroTop < r.kpiTop, 'Kennzahlen unter der Heldenkarte');
    assert(r.closed === 0, 'nicht alles offen');
    // „höchstens drei Bildschirmhöhen Scrollen“: Scrollweg ≤ 3 × sichtbare Höhe
    assert(r.sh - r.ih <= 3 * r.ih, 'Scrollweg ' + (r.sh - r.ih) + ' > ' + 3 * r.ih);
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('T Akkordeons: zu zeigt die Kernzahl, ganze Karte/Enter klappt, Zustand bleibt nach Neustart, Kennzahl öffnet Details', async () => {
    const c = await ctxFor(SMALL), p = await c.newPage(), e = watch(p);
    await open(p, '#training/heute');
    let f = trFrame(p);
    const s0 = await f.evaluate(() => { const c = document.querySelector('.acc[data-acc=exercises]'), b = c.querySelector('h2 > button.acc-t'); return [c.classList.contains('closed'), b && b.getAttribute('aria-expanded'), c.querySelector('.acc-sum').textContent, c.getBoundingClientRect().height, b && b.getAttribute('aria-controls') === c.id, !c.querySelector('.card-h[role]')]; });
    assert(s0[0] && s0[1] === 'false' && /Übungen|Lauftag|Minuten/.test(s0[2]) && s0[3] < 80 && s0[4] && s0[5], 'zu ' + s0);
    // Tipp irgendwo auf die zugeklappte Karte (nicht nur die Kopfzeile)
    const box = await (await f.$('.acc[data-acc=exercises]')).boundingBox(); await p.mouse.click(box.x + box.width - 30, box.y + box.height - 6, { delay: 30 }).catch(() => {});
    await f.evaluate(() => { const c = document.querySelector('.acc[data-acc=exercises]'); if (c.classList.contains('closed')) c.click(); }); await wait(p, 200);
    assert(await f.evaluate(() => document.querySelector('.acc[data-acc=exercises]').classList.contains('open') && document.getElementById('todayList').offsetParent !== null), 'aufklappen');
    await f.focus('.acc[data-acc=tip] .acc-t'); await p.keyboard.press('Enter'); await wait(p, 150);
    assert(await f.evaluate(() => document.querySelector('.acc[data-acc=tip]').classList.contains('open')), 'Enter');
    await p.reload(); await wait(p, 2500); f = trFrame(p);
    assert(await f.evaluate(() => document.querySelector('.acc[data-acc=exercises]').classList.contains('open') && document.querySelector('.acc[data-acc=tip]').classList.contains('open')), 'Zustand nach Neustart');
    if (await f.evaluate(() => !document.getElementById('kpiReady').hidden)) {
      assert(/% · (gut|mäßig|schwach)/.test(await f.textContent('#kpiReady b')), 'Ampel mit Wort');
      await f.click('#kpiReady'); await wait(p, 700);
      assert(await f.evaluate(() => document.getElementById('readinessCard').classList.contains('open')), 'Bereitschaft öffnet Details');
    }
    // Wochenkarte: Kernzahl statt Datum
    await f.evaluate(() => localStorage.setItem('sg-training-akk-v1', '{}'));
    await p.reload(); await wait(p, 2500); f = trFrame(p);
    assert(/\d von 7 Tagen/.test(await f.textContent('.acc[data-acc=weekbar] .acc-sum')), 'Woche zu: ' + await f.textContent('.acc[data-acc=weekbar] .acc-sum'));
    // zugeklappte Verläufe in Kraft mit Überschrift
    await open(p, '#training/kraft'); f = trFrame(p);
    assert(await f.evaluate(() => ['gymhistory', 'stretchhistory'].every(k => document.querySelector('[data-acc=' + k + ']').classList.contains('closed'))
      && document.querySelector('#s-lauf .sec-label[data-grp=verlauf]').classList.contains('on') && document.querySelector('#s-lauf .top h1').textContent === 'Kraft'), 'Verläufe zu, Überschrift Verlauf, Kopf Kraft');
    // Auswertung: vier Kennzahlen unter dem Fitness-Wert, Gruppen in der Analyse
    await open(p, '#training/auswertung/fitness'); f = trFrame(p);
    assert(await f.evaluate(() => document.querySelectorAll('#fitKpis .kpi').length === 4 && [...document.querySelectorAll('#s-fitness .sec-label.grp.on')].map(x => x.textContent).join() === 'Fortschritt,Körper und Erholung'), 'Fitness-Kennzahlen/Gruppen');
    await open(p, '#training/auswertung/analyse'); f = trFrame(p);
    await f.click('#s-daten .segbar button[data-p=daten]'); await wait(p, 300);
    const g = await f.evaluate(() => [...document.querySelectorAll('#s-daten .sec-label.grp.on')].filter(x => x.offsetParent).map(x => x.textContent).join());
    assert(g === 'Fortschritt,Aktivitäten,Berichte und Export', 'Analyse-Gruppen ' + g);
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('T Starts: Training, Gym, Dehnen, Rodeln vorbereiten, Laufen mit GPS und Herzfrequenz (Testdaten)', async () => {
    const c = await ctxFor(Object.assign({ permissions: ['geolocation'], geolocation: { latitude: 47.60, longitude: 12.90, accuracy: 6 } }, SMALL)), e = [];
    // Brustgurt nachgebaut: Web Bluetooth mit Pulswerten 128, 131, …
    await c.addInitScript(() => {
      const ch = new EventTarget(); let bpm = 128; ch.startNotifications = () => Promise.resolve(ch);
      setInterval(() => { const dv = new DataView(new ArrayBuffer(2)); dv.setUint8(0, 0); dv.setUint8(1, bpm++); ch.value = dv; ch.dispatchEvent(new Event('characteristicvaluechanged')); }, 400);
      const srv = { getPrimaryService: id => id === 0x180D ? Promise.resolve({ getCharacteristic: () => Promise.resolve(ch) }) : Promise.reject(new Error('kein Akku')) };
      const dev = { name: 'Test-Gurt', addEventListener() {}, gatt: { connected: true, connect: () => Promise.resolve(srv), disconnect() {} } };
      Object.defineProperty(navigator, 'bluetooth', { value: { requestDevice: () => Promise.resolve(dev) } });
    });
    const bad = [];
    for (const [h, sel, want] of [['heute', '#btnStartToday', '#player.open'], ['kraft', '#btnGymStart', '#gymOverlay.open'], ['kraft', '[data-tsclick=btnStretchStart]', '#dlgStretch[open]'], ['kraft', '[data-tsclick=btnRodelnStart]', '#player.open'], ['lauf', '#btnRunTrackStart', '#runOverlay.open']]) {
      const p = await c.newPage(); e.push(...watch(p));
      await open(p, '#training/' + h); const f = trFrame(p);
      await f.click(sel); await wait(p, 700);
      if (!await f.$(want)) bad.push(h + ' ' + sel + ' öffnet nicht');
      if (h === 'lauf') {
        await f.evaluate(() => window.APP.connectHr()); await wait(p, 600);
        await f.click('#btnRunGo'); await wait(p, 2500);
        await c.setGeolocation({ latitude: 47.6015, longitude: 12.9015, accuracy: 5 }); await wait(p, 2500);
        const r = await f.evaluate(() => [document.getElementById('runGpsStatus').textContent, document.getElementById('runTime').textContent, document.getElementById('runHr').textContent]);
        if (!/GPS aktiv/.test(r[0]) || r[1] === '0:00' || !/^\d{3}$/.test(r[2])) bad.push('Lauf live ' + r.join(' | '));
      }
      await p.close();
    }
    assert(!bad.length, bad.join('; '));
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('T Reihenfolge 4.0: Grundreihenfolge übernommen, eigene bleibt, Ausgeblendetes bleibt aus, alte Sicherung verliert nichts', async () => {
    const bad = [];
    const run = async (seed, fn) => {
      const c = await ctxFor(SMALL), p = await c.newPage(), e = watch(p);
      await c.addInitScript(seed); await open(p, '#training/heute');
      const r = await trFrame(p).evaluate(() => { const o = JSON.parse(localStorage.getItem('wk_sections')); return { heute: o.heute.join(), lauf: (o.lauf || []).join(), v4: o.__v4, seen: !!o.__seen, hid: [...document.querySelectorAll('#s-heute > .sec-hidden, #s-lauf > .sec-hidden')].map(x => x.dataset.sec).join() }; });
      await fn(r, p); bad.push(...e); await c.close();
    };
    const OLD = ['whatsnew', 'weatherwarn', 'sickcheckin', 'injurycheckin', 'importcard', 'readiness', 'hero', 'adaptive', 'stats', 'exercises', 'weekbar', 'tip', 'weathertoday'];
    // 1) unveränderte alte Grundreihenfolge → neue Reihenfolge
    await run(new Function('if (!sessionStorage.m1) { sessionStorage.m1 = 1; localStorage.setItem("wk_sections", JSON.stringify({ heute: ' + JSON.stringify(OLD) + ' })); }'), r => { if (!/^hero,kpis,/.test(r.heute) || r.v4 !== 1 || !r.seen) bad.push('Grundreihenfolge ' + JSON.stringify(r)); });
    // 2) eigene Reihenfolge bleibt, neue Bereiche passend eingereiht
    await run(new Function('if (!sessionStorage.m2) { sessionStorage.m2 = 1; localStorage.setItem("wk_sections", JSON.stringify({ heute: ["tip","stats","exercises","hero","weekbar"] })); }'), r => {
      if (!/^tip,stats,exercises,hero,kpis,/.test(r.heute)) bad.push('eigene Reihenfolge ' + r.heute); });
    // 3) ausgeblendet (mit __seen) bleibt nach Neustart aus
    await run(new Function('if (!sessionStorage.m3) { sessionStorage.m3 = 1; const all = ' + JSON.stringify(OLD) + '.concat(["kpis","tsheute"]); localStorage.setItem("wk_sections", JSON.stringify({ __v4: 1, __seen: { heute: all }, heute: all.filter(x => x !== "readiness") })); }'), async (r, p) => {
      if (r.heute.indexOf('readiness') >= 0 || r.hid.indexOf('readiness') < 0) bad.push('ausgeblendet kam zurück ' + r.heute);
      await p.reload(); await wait(p, 2500); if (!(await trFrame(p).evaluate(() => !!document.querySelector('[data-sec=readiness].sec-hidden')))) bad.push('nach Neustart wieder da'); });
    // 4) alte Sicherung (ohne __seen, ohne neue Bereiche) → neue Bereiche sichtbar, nichts dauerhaft weg
    await run(new Function('if (!sessionStorage.m4) { sessionStorage.m4 = 1; localStorage.setItem("wk_sections", JSON.stringify({ __v4: 1, heute: ' + JSON.stringify(OLD) + ', lauf: ["runtrack","gym","distance"] })); }'), r => {
      if (['kpis', 'tsheute'].some(k => r.heute.indexOf(k) < 0) || ['tsmob', 'stretch', 'sportlog'].some(k => r.lauf.indexOf(k) < 0)) bad.push('alte Sicherung ' + JSON.stringify(r)); });
    assert(!bad.length, bad.join(' | '));
  });
  await test('T Ausgeblendetes greift: ohne „Mobility & Dehnen“ kommen Dehnen/Rodeln zurück, ohne Bereitschaft keine Kennzahl', async () => {
    const c = await ctxFor(SMALL), p = await c.newPage(), e = watch(p);
    await c.addInitScript(() => { if (sessionStorage.h) return; sessionStorage.h = 1; const o = JSON.parse(localStorage.getItem('wk_sections') || '{}');
      o.__v4 = 1; o.__seen = null; localStorage.setItem('wk_sections', JSON.stringify(o)); });
    await open(p, '#training/kraft'); let f = trFrame(p);
    await f.evaluate(() => { const o = JSON.parse(localStorage.getItem('wk_sections')); o.lauf = o.lauf.filter(x => x !== 'tsmob'); o.heute = o.heute.filter(x => x !== 'readiness'); localStorage.setItem('wk_sections', JSON.stringify(o)); });
    await p.reload(); await wait(p, 2500); f = trFrame(p);
    const r = await f.evaluate(() => ['stretch', 'rodeln'].map(k => !!document.querySelector('#s-lauf [data-sec=' + k + ']').offsetParent).join());
    assert(r === 'true,true', 'Einzelkarten ' + r);
    await open(p, '#training/heute'); f = trFrame(p);
    assert(await f.evaluate(() => document.getElementById('kpiReady').hidden), 'Bereitschaft-Kennzahl trotz ausgeblendet');
    assert(!e.length, e.join(' | ')); await c.close();
  });

  /* ---------- P4: Schule, Bibel, Pause, Mobility (Phase 4) ---------- */
  const schFrame = p => p.frames().find(f => /\/planer\/schule\//.test(f.url()));
  // Schuldaten ergänzen: eine überfällige Aufgabe und zwei Lernblöcke vom Lernplan
  const SCHUL_EXTRA = () => { if (sessionStorage.sx) return; sessionStorage.sx = 1; const k = 'schulkalender-bayern-v1', db = JSON.parse(localStorage.getItem(k) || '{}'), d = n => { const x = new Date(); x.setDate(x.getDate() + n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
    const sub = (db.subjects || [])[0] || {}; db.homework = (db.homework || []).concat([{ id: 'hOver', subject: sub.id, text: 'Referat Folien', due: d(-1), done: false },
      { id: 'hL1', subject: sub.id, text: 'Lernen: Kapitel 1–3', due: d(1), kind: 'lernen', done: false, planFor: 'eX' }, { id: 'hL2', subject: sub.id, text: 'Lernen: Probetest', due: d(2), kind: 'lernen', done: false, planFor: 'eX' }]);
    localStorage.setItem(k, JSON.stringify(db)); };
  await test('P4 Schultag: nächste Stunde oben, Stundenplan, offene Aufgaben, Prüfung mit Countdown, Rest zugeklappt', async () => {
    const c = await ctxFor(Object.assign({ timezoneId: 'Europe/Berlin' }, SMALL)), p = await c.newPage(), e = watch(p);
    await c.addInitScript(SCHUL_EXTRA);
    await p.clock.install({ time: new Date('2026-10-20T09:40:00+02:00') });
    await open(p, '#schule/heute'); let f = schFrame(p);
    const r = await f.evaluate(() => { const y = s => { const el = document.querySelector(s); return el ? el.getBoundingClientRect().top : -1; };
      return { now: (document.querySelector('.nowcard') || {}).textContent || '', nowY: y('.nowcard'), lesY: y('.card.lessons'), hwY: y('.stack .hw'), exY: y('.card.next'), more: !!document.querySelector('details.more-today:not([open])'),
        hwFirst: (document.querySelector('.stack .hw .txt') || {}).textContent, count: (document.querySelector('.card.next .nc-count') || {}).textContent || '' }; });
    assert(/Nächste Stunde/.test(r.now) && /beginnt in 5 Min\./.test(r.now), 'Jetzt-Karte ' + r.now);
    assert(r.nowY > 0 && r.nowY < r.lesY && r.lesY < r.hwY, 'Reihenfolge ' + JSON.stringify(r));
    assert(r.exY > 0 && /Tage|morgen|heute/.test(r.count), 'Prüfung mit Countdown ' + r.count);
    assert(r.hwFirst === 'Referat Folien', 'Überfälliges zuerst: ' + r.hwFirst);
    assert(r.more, 'Rest nicht zugeklappt');
    await f.click('details.more-today > summary'); await wait(p, 200); await p.reload(); await wait(p, 2500); f = schFrame(p);
    assert(await f.evaluate(() => !!document.querySelector('details.more-today[open]')), 'Zustand „Mehr für heute“ nicht gemerkt');
    // während der Stunde: „Jetzt … noch … Min.“
    await p.clock.fastForward('20:00'); await f.evaluate(() => document.querySelector('.tab[data-v=heute]').click()); await wait(p, 300);
    assert(/Jetzt.*noch 30 Min\./.test(await f.textContent('.nowcard')), 'laufende Stunde: ' + await f.textContent('.nowcard'));
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P4 Aufgaben & Prüfungen: Schalter mit drei Einträgen, Überfälliges markiert, Prüfungen mit Countdown, Lernzeit/Ablage im Menü', async () => {
    const c = await ctxFor(SMALL), p = await c.newPage(), e = watch(p);
    await c.addInitScript(SCHUL_EXTRA);
    await open(p, '#schule/aufgaben'); const f = schFrame(p);
    const seg = await f.evaluate(() => { const sn = document.getElementById('subnav'); return { n: sn.querySelectorAll('button').length, seg: sn.classList.contains('seg'), scroll: sn.scrollWidth > sn.clientWidth + 1, labels: [...sn.querySelectorAll('button')].map(b => b.textContent).join('|'),
      first: (document.querySelector('#view .hgroup') || {}).textContent || '', over: !!document.querySelector('#view .hgroup.over') }; });
    assert(seg.n === 3 && seg.seg && !seg.scroll && /^Offen.*\|Prüfungen\|Erledigt$/.test(seg.labels), 'Schalter ' + JSON.stringify(seg));
    assert(/Überfällig/.test(seg.first) && seg.over, 'Überfällig zuerst ' + seg.first);
    await f.click('#subnav [data-v="auf:pruef"]'); await wait(p, 300);
    assert(await f.evaluate(() => document.querySelectorAll('#view .card.next .nc-count').length >= 1), 'Prüfungsliste mit Countdown');
    for (const [id, want] of [['lernzeit', '.timer'], ['ablage', '#view']]) {
      await p.click('#menu'); await wait(p, 400); await p.click(`#dwpn .dw-r [data-sec=${id}]`); await wait(p, 1500);
      const st = await state(p), ok = await f.evaluate(([id, want]) => document.getElementById('title').textContent === (id === 'lernzeit' ? 'Lernzeit' : 'Ablage') && !!document.querySelector(want) && document.getElementById('subnav').hidden, [id, want]);
      assert(st.hash === '#schule/' + id && ok, id + ' ' + st.hash + ' ' + ok);
    }
    // zurück zu „Aufgaben & Prüfungen“ zeigt die Liste, nicht die Ablage
    await p.click('#menu'); await wait(p, 400); await p.click('#dwpn .dw-r [data-sec=aufgaben]'); await wait(p, 1200);
    assert(await f.evaluate(() => document.getElementById('title').textContent === 'Aufgaben' && !document.getElementById('subnav').hidden), 'Aufgabenliste nach Ablage');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P4 Prüfbefunde Phase 4: Wochentag, Stunden ohne Zeit, krank, Lernzeit-Pfad, „Alle →“, Plus in Prüfungen, keine Doppel, Handy ohne Lernblöcke', async () => {
    const bad = [], mk = async (time, extra) => { const c = await ctxFor(Object.assign({ timezoneId: 'Europe/Berlin' }, SMALL)); await c.addInitScript(SCHUL_EXTRA); if (extra) await c.addInitScript(extra);
      const p = await c.newPage(); await p.clock.install({ time: new Date(time) }); return { c, p, e: watch(p) }; };
    // Samstag: „Montag, 26.10.“ (nicht „Montag, Mo 26.10.“)
    let { c, p, e } = await mk('2026-10-24T10:00:00+02:00'); await open(p, '#schule/heute');
    let t = await schFrame(p).textContent('.nowcard').catch(() => '');
    if (!/^Montag, 26\.10\./.test(t)) bad.push('Wochentag: ' + t); bad.push(...e); await c.close();
    // nur 4 Stundenzeiten, 5. Stunde ohne Zeit: um 12:30 bleibt „Heute“
    ({ c, p, e } = await mk('2026-10-20T12:30:00+02:00', () => { if (sessionStorage.pz) return; sessionStorage.pz = 1; const k = 'schulkalender-bayern-v1', db = JSON.parse(localStorage.getItem(k)); db.settings.periods = (db.settings.periods || []).slice(0, 4); localStorage.setItem(k, JSON.stringify(db)); }));
    await open(p, '#schule/heute'); t = await schFrame(p).textContent('.nowcard').catch(() => '');
    if (!/^Heute/.test(t)) bad.push('ohne Zeit: ' + t); bad.push(...e); await c.close();
    // krank heute: keine Jetzt-Karte
    ({ c, p, e } = await mk('2026-10-20T09:40:00+02:00', () => { if (sessionStorage.ab) return; sessionStorage.ab = 1; const k = 'schulkalender-bayern-v1', db = JSON.parse(localStorage.getItem(k)); db.absences = (db.absences || []).concat([{ id: 'aX', date: '2026-10-20', reason: 'krank' }]); localStorage.setItem(k, JSON.stringify(db)); }));
    await open(p, '#schule/heute'); if (await schFrame(p).$('.nowcard')) bad.push('Jetzt-Karte trotz krank'); bad.push(...e); await c.close();
    // „▶ Lernzeit“ an einer Prüfung: Pfadzeile folgt; danach „Alle →“ vom Schultag zeigt die Aufgabenliste
    ({ c, p, e } = await mk('2026-10-20T09:40:00+02:00')); await open(p, '#schule/heute'); let f = schFrame(p);
    await f.click('.card.next [data-a=timerFor]'); await wait(p, 1200);
    let st = await state(p); if (st.hash !== '#schule/lernzeit' || st.path !== 'Lernzeit') bad.push('Lernzeit-Pfad ' + st.hash + ' ' + st.path);
    await p.click('#menu'); await wait(p, 400); await p.click('#dwpn .dw-r [data-sec=heute]'); await wait(p, 1200);
    await f.click('[data-a=tab][data-v=aufgaben].more'); await wait(p, 1200); st = await state(p);
    if (st.hash !== '#schule/aufgaben' || !(await f.evaluate(() => document.getElementById('title').textContent === 'Aufgaben'))) bad.push('Alle → ' + st.hash);
    // Plus in „Prüfungen“ öffnet eine Prüfung
    await f.click('#subnav [data-v="auf:pruef"]'); await wait(p, 300); await f.click('#fab'); await wait(p, 500);
    if (!(await f.evaluate(() => /Prüfung|Termin/.test((document.querySelector('.sheet.on, #sheet.on, [class*=sheet][open]') || document.body).textContent) && !!document.querySelector('#ff')))) bad.push('Plus in Prüfungen');
    // Lernblöcke nicht doppelt auf der Aufgaben-Seite, nicht im Handy-Abgleich
    await p.goto(APP + '#aufgaben'); await wait(p, 2200);
    const n = await frameOf(p, '').evaluate(() => (document.body.innerText.match(/Lernen: Kapitel 1–3/g) || []).length);
    if (n > 1) bad.push('Lernblock doppelt (' + n + ')');
    const ho = await p.evaluate(() => { try { return SharedCalendar.handy.out().filter(x => /^lh-/.test(x.id || '') || /Lernen: Kapitel/.test(x.title || '')).length; } catch (x) { return 'Fehler ' + x.message; } });
    if (ho !== 0) bad.push('Handy-Abgleich enthält Lernblöcke: ' + ho);
    bad.push(...e); await c.close();
    assert(!bad.length, bad.join(' | '));
  });
  await test('P4 Keine waagrecht scrollende Knopf-Reihe in der ganzen App (außer Mobility)', async () => {
    const c = await ctxFor(SMALL), p = await c.newPage(), e = watch(p), bad = [];
    await open(p, '#kalender');
    const paths = await p.evaluate(() => { const V = SGShell.V, l = []; Object.keys(V).forEach(v => { if (!V[v].secs) return l.push(v); V[v].secs.forEach(s => (s.kids ? s.kids.map(k => v + '/' + s.id + '/' + k.id) : [v + '/' + s.id]).forEach(x => l.push(x))); }); return l.filter(x => !/^mobility/.test(x)); });
    const scan = () => [...document.querySelectorAll('body *')].filter(el => { const cs = getComputedStyle(el); return /auto|scroll/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 2 && el.querySelectorAll(':scope > button, :scope > .chip, :scope > a').length >= 2 && el.offsetParent; }).map(el => el.className || el.id);
    for (const h of paths) {
      await p.evaluate(h => { location.hash = h; }, h); await wait(p, 1300);
      let r = await p.evaluate(scan);
      const fr = await p.$('#stage iframe.on'); if (fr && !(await p.$('.native.on'))) r = r.concat(await (await fr.contentFrame()).evaluate(scan).catch(() => []));
      if (r.length) bad.push(h + ': ' + r.join(','));
    }
    assert(paths.length > 30, 'nur ' + paths.length + ' Seiten');
    assert(!bad.length, bad.join('; '));
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P4 Lernblöcke vom Lernplan erscheinen im Monatskalender und im Tagesplan', async () => {
    const c = await ctxFor(SMALL), p = await c.newPage(), e = watch(p);
    await c.addInitScript(SCHUL_EXTRA);
    await open(p, '#kalender');
    const r = await p.evaluate(() => { const d = new Date(); d.setDate(d.getDate() + 1); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      return { k, items: SharedCalendar.allItems(k, k).filter(x => /^lh-/.test(x.id)).map(x => x.title) }; });
    assert(r.items.join() === 'Lernen: Kapitel 1–3', 'Verbund ' + JSON.stringify(r));
    await p.click(`#mgrid [data-mday="${r.k}"]`); await wait(p, 600);
    assert(/Lernen: Kapitel 1–3/.test(await p.textContent('#dayplan')), 'Tagesplan');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P4 Bibel in „Auf einen Blick“: Gelesen ✓, Serie und Leseplan', async () => {
    const c = await ctxFor(SMALL), p = await c.newPage(), e = watch(p);
    await c.addInitScript(() => { const d = new Date(), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const b = JSON.parse(localStorage.getItem('zweiminutenbibel_v2') || '{}'); Object.assign(b, { streak: 6, plan: 'hl', dailyGoal: 1, todayDone: { date: k, ids: ['x'] } }); localStorage.setItem('zweiminutenbibel_v2', JSON.stringify(b)); });
    await open(p, '#kalender');
    const t = await p.textContent('[data-gl=bibel]');
    assert(/Gelesen ✓/.test(t) && /Serie 6/.test(t) && /Bekannte Kapitel/.test(t), 'Karte: ' + t);
    await p.evaluate(() => { const d = new Date(), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'), b = JSON.parse(localStorage.getItem('zweiminutenbibel_v2'));
      Object.assign(b, { dailyGoal: 2, todayDone: { date: k, ids: ['x'] }, lastDate: k }); localStorage.setItem('zweiminutenbibel_v2', JSON.stringify(b)); });
    await p.reload(); await wait(p, 2200);
    assert(/Gelesen ✓/.test(await p.textContent('[data-gl=bibel]')), 'lastDate heute');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P4 Mobility unverändert: Chips, Pfadzeile „Atmung & HRV · …“, Inhalt unter dem Kopf', async () => {
    const c = await ctxFor(SMALL), p = await c.newPage(), e = watch(p);
    await open(p, '#mobility/atmung/hrv');
    const r = await p.evaluate(() => ({ path: document.getElementById('path').textContent, pathVis: !!document.getElementById('path').offsetParent, menu: !!document.getElementById('menu').offsetParent,
      chips: document.querySelectorAll('#chips .chip').length, on: [...document.querySelectorAll('#chips .chip.on')].map(x => x.textContent).join('|'),
      stTop: document.getElementById('stage').getBoundingClientRect().top, chipsBottom: document.getElementById('chips').getBoundingClientRect().bottom, topH: document.querySelector('.top').getBoundingClientRect().height }));
    assert(r.path === 'Atmung & HRV · Üben & HRV messen' && r.pathVis && !r.menu, 'Pfadzeile ' + JSON.stringify(r));
    assert(r.chips >= 7 && r.on === 'Atmung & HRV|Üben & HRV messen', 'Chips ' + r.on);
    assert(Math.abs(r.stTop - r.chipsBottom) <= 1, 'Abstand Kopf/Inhalt ' + JSON.stringify(r));
    assert(!e.length, e.join(' | ')); await c.close();
  });
  /* ---------- P5: Mehr neu geordnet ---------- */
  const ANDROID = Object.assign({ userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' }, SMALL);
  const mehrCtx = async (init, opt) => { const c = await ctxFor(opt || SMALL); if (init) await c.addInitScript(init); const p = await c.newPage(); return { c, p, e: watch(p) }; };
  const valOf = (p, m) => p.evaluate(m => { const r = document.querySelector('#n-mehr [data-m="' + m + '"] .val'); return r ? r.textContent : ''; }, m);
  await test('P5 Mehr: fünf Gruppen nach Zweck, alles von früher erreichbar, höchstens zwei Bildschirmhöhen', async () => {
    const { c, p, e } = await mehrCtx(); await open(p, '#mehr');
    const r = await p.evaluate(() => ({ grp: [...document.querySelectorAll('#n-mehr .grp > header')].map(x => x.textContent).join('|'), ms: [...document.querySelectorAll('#n-mehr [data-m]')].map(x => x.dataset.m),
      h: document.getElementById('n-mehr').scrollHeight, minRow: Math.min(...[...document.querySelectorAll('#n-mehr .row')].map(x => x.getBoundingClientRect().height)),
      links: [...document.querySelectorAll('#n-mehr .lnk-ic')].map(x => x.closest('[data-m]').dataset.m).join() }));
    assert(r.grp === 'Planen|Lesen und Lernen|Abgleich und Sicherung|Darstellung und Einstellungen|Über die App', 'Gruppen ' + r.grp);
    // 3.8.0 schlanker: Standardwoche in „Woche planen“, Einspielen in „Sicherung als Datei“
    const fehlt = ['aufgaben', 'notizen', 'week', 'handy', 'abo', 'bibel', 'wissen', 'pause', 'design', 'sync', 'tset', 'update', 'umzug', 'backup', 'neu', 'diag', 'autodw'].filter(m => r.ms.indexOf(m) < 0);
    assert(!fehlt.length, 'fehlt ' + fehlt);
    assert(r.links === 'wissen,tset', 'Verknüpfungen ' + r.links);
    assert(r.h <= 2 * 800 && r.minRow >= 59.5, 'Höhe ' + r.h + ' Zeile ' + r.minRow);
    // „Was ist neu“, Fehlerprotokoll (mit Leeren)
    await p.click('#n-mehr [data-m=neu]'); await wait(p, 300); assert(/Version 3\.8\.0/.test(await p.textContent('#sheet')), 'Was ist neu'); await p.goBack(); await wait(p, 300);
    await p.evaluate(() => localStorage.setItem('sg-diag-v1', JSON.stringify([{ at: Date.now(), t: 'Test-Eintrag', v: 'kalender', on: true }])));
    await p.evaluate(() => { location.hash = 'kalender'; }); await wait(p, 300); await p.evaluate(() => { location.hash = 'mehr'; }); await wait(p, 400);
    await p.click('#n-mehr [data-m=diag]'); await wait(p, 300); assert(/Test-Eintrag/.test(await p.inputValue('#sheet textarea.diag')), 'Protokoll');
    await p.click('#sheet [data-s=clear]'); await wait(p, 400); assert(await p.evaluate(() => !localStorage.getItem('sg-diag-v1')), 'Leeren');
    // Suchfeld öffnet die Suche; Einträge von „Mehr“ sind dort zu finden, Enter legt keine Aufgabe an
    await p.click('#mehrq'); await wait(p, 300);
    assert(await p.isVisible('#sx.on #sxq'), 'Suche geht nicht auf');
    await p.keyboard.type('Fehlerproto'); await wait(p, 300);
    const first = await p.evaluate(() => { const x = document.querySelector('#sx .sxr b'); return x ? x.textContent : ''; });
    assert(/Fehlerprotokoll/.test(first), 'erster Treffer ' + first);
    await p.keyboard.press('Enter'); await wait(p, 600);
    assert(/Fehlerprotokoll/.test(await p.textContent('#sheet')), 'Befehl öffnet Fehlerprotokoll');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P5 Zustände: Cloud (aus, frisch, alt mit Warnpunkt), Umzug groß nur bis erledigt, Aufgaben/Notizen-Zahl, neue Version', async () => {
    const bad = [];
    let { c, p, e } = await mehrCtx(() => localStorage.removeItem('sg-shared-calendar-sync'), ANDROID); await open(p, '#mehr');
    if (await valOf(p, 'sync') !== 'Aus' || await p.$('#nav [data-tab=mehr] .warn')) bad.push('aus: ' + await valOf(p, 'sync'));
    if (!(await p.$('#n-mehr .grp:first-of-type [data-m=umzug].big')) && !(await p.$('#n-mehr [data-m=umzug].big'))) bad.push('Umzug nicht groß');
    if (!/\d+ offen/.test(await valOf(p, 'aufgaben'))) bad.push('Aufgaben-Zahl ' + await valOf(p, 'aufgaben'));
    await p.evaluate(() => window.dispatchEvent(new CustomEvent('sg-update', { detail: '9.9.9' }))); await wait(p, 200);
    if (!/Neu: 9\.9\.9/.test(await valOf(p, 'update'))) bad.push('neue Version ' + await valOf(p, 'update'));
    bad.push(...e); await c.close();
    ({ c, p, e } = await mehrCtx(() => { localStorage.setItem('sg-shared-calendar-sync', JSON.stringify({ token: 'x', user: 'u', last: Date.now() - 2 * 36e5 })); localStorage.setItem('sg-umzug-v1', '{"at":1}'); }, ANDROID));
    await c.route('https://api.github.com/**', r => r.abort()); await open(p, '#mehr');
    const v1 = await valOf(p, 'sync'); if (!/^vor 2 Std\.$/.test(v1) || await p.$('#nav [data-tab=mehr] .warn')) bad.push('frisch: ' + v1);
    if (await p.$('#n-mehr [data-m=umzug].big') || !(await p.$('#n-mehr [data-m=umzug]'))) bad.push('Umzug erledigt, aber groß');
    await c.close();
    ({ c, p, e } = await mehrCtx(() => localStorage.setItem('sg-shared-calendar-sync', JSON.stringify({ token: 'x', user: 'u', last: Date.now() - 9 * 864e5 }))));
    await c.route('https://api.github.com/**', r => r.abort()); await open(p, '#kalender');
    if (!(await p.$('#nav [data-tab=mehr] .warn'))) bad.push('kein Warnpunkt am Tab');
    // nach erfolgreicher Sicherung verschwindet der Punkt ohne Neuladen
    await p.evaluate(() => { const c = JSON.parse(localStorage.getItem('sg-shared-calendar-sync')); c.last = Date.now(); localStorage.setItem('sg-shared-calendar-sync', JSON.stringify(c)); window.dispatchEvent(new Event('sg-sync')); }); await wait(p, 200);
    if (await p.$('#nav [data-tab=mehr] .warn')) bad.push('Punkt bleibt nach Sicherung');
    await p.evaluate(() => { const c = JSON.parse(localStorage.getItem('sg-shared-calendar-sync')); c.last = Date.now() - 9 * 864e5; localStorage.setItem('sg-shared-calendar-sync', JSON.stringify(c)); window.dispatchEvent(new Event('sg-sync')); }); await wait(p, 200);
    await p.click('#nav [data-tab=mehr]'); await wait(p, 400); const v2 = await valOf(p, 'sync');
    if (!/^! (vor 9 Tagen|Fehler)$/.test(v2)) bad.push('alt: ' + v2);
    await c.close();
    // offline ist kein Fehler: kein Warnpunkt, kein „Fehler“
    ({ c, p, e } = await mehrCtx(() => localStorage.setItem('sg-shared-calendar-sync', JSON.stringify({ token: 'x', user: 'u', last: Date.now() - 36e5 }))));
    await c.setOffline(true).catch(() => {}); await p.goto(APP + '#mehr').catch(() => {}); await c.setOffline(false); await p.goto(APP + '#mehr'); await c.setOffline(true); await p.evaluate(() => SharedCalendar.sync && SharedCalendar.sync()); await wait(p, 600);
    await p.evaluate(() => window.dispatchEvent(new Event('sg-sync'))); await wait(p, 200);
    const v3 = await valOf(p, 'sync'); if (/Fehler|!/.test(v3) || await p.$('#nav [data-tab=mehr] .warn')) bad.push('offline als Fehler: ' + v3);
    await c.setOffline(false); await c.close();
    // Umzug: abbrechen lässt die große Karte stehen, Speichern erledigt; Merker reist nicht in Dateien mit
    ({ c, p, e } = await mehrCtx(null, ANDROID)); await open(p, '#mehr');
    await p.click('#n-mehr [data-m=umzug]'); await wait(p, 1500); await p.goBack(); await wait(p, 400);
    if (!(await p.$('#n-mehr [data-m=umzug].big'))) bad.push('Abbrechen hat Umzug erledigt');
    await p.click('#n-mehr [data-m=umzug]'); await wait(p, 1500);
    const dl = p.waitForEvent('download', { timeout: 5000 }).catch(() => null); await p.click('#sheet [data-s=save]'); await dl; await wait(p, 400);
    if (await p.$('#n-mehr [data-m=umzug].big')) bad.push('nach Speichern noch groß');
    const keys = await p.evaluate(() => SGMove.data().then(d => Object.keys(d.ls)));
    if (keys.some(k => /^sg-umzug-raus-v1|^sg-update-neu/.test(k))) bad.push('Gerätemerker in der Datei');
    await c.close();
    // Desktop/iPhone: keine große Umzugskarte
    ({ c, p, e } = await mehrCtx()); await open(p, '#mehr'); if (await p.$('#n-mehr [data-m=umzug].big')) bad.push('große Umzugskarte ohne Android'); await c.close();
    assert(!bad.length, bad.join(' | '));
  });
  await test('P5 Schalter: einheitlich, „Seitenmenü automatisch öffnen“ (Standard aus) wirkt und bleibt', async () => {
    const { c, p, e } = await mehrCtx(); await open(p, '#mehr');
    assert(!(await p.isChecked('#n-mehr [data-m=autodw]')), 'Standard nicht aus');
    await p.click('#n-mehr .row.tgl'); await wait(p, 200);
    await p.click('#nav [data-tab=training]'); await wait(p, 900);
    assert(await dwOpen(p), 'Menü geht nicht automatisch auf');
    await p.reload(); await wait(p, 2000); await p.evaluate(() => { location.hash = 'mehr'; }); await wait(p, 500);
    assert(await p.isChecked('#n-mehr [data-m=autodw]'), 'Einstellung nicht gemerkt');
    await p.click('#n-mehr [data-m=handy]'); await wait(p, 400);
    assert(await p.evaluate(() => document.querySelectorAll('#sheet input.swi[role=switch]').length >= 2 && !document.querySelector('#sheet input[type=checkbox]:not(.swi)')), 'Handykalender-Blatt ohne einheitliche Schalter');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  /* ---------- P6: Suche ---------- */
  const sxOpen = async p => { await p.click('[data-act=search]'); await wait(p, 300); };
  const sxType = async (p, q, ms) => { await p.fill('#sxq', q); await wait(p, ms || 450); };
  const sxRows = p => p.evaluate(() => [...document.querySelectorAll('#sx .sxg')].map(g => ({ g: (g.querySelector('header span') || {}).textContent, rows: [...g.querySelectorAll('.sxr b')].map(b => b.textContent) })));
  const sxPrev = p => p.evaluate(() => { const b = document.querySelector('#sx .qprev > b'); return b ? b.textContent : ''; });
  await test('P6 Suche: Abnahme-Tabelle (Schnelleingabe, @Datum, Bibelstelle, /Befehle, Inhalte, Tippfehler, leer)', async () => {
    const c = await ctxFor(Object.assign({ timezoneId: 'Europe/Berlin' }, SMALL)), p = await c.newPage(), e = watch(p), bad = [];
    await p.clock.install({ time: new Date('2026-10-20T10:00:00+02:00') });
    await open(p, '#kalender'); await sxOpen(p);
    // leer: Zuletzt (nach einer Suche), Schnell anlegen, Häufig (nach einem Befehl)
    await sxType(p, '/design graph'); const d1 = await sxRows(p);
    if (!d1.length || d1[0].rows[0] !== 'Design: Graphit' || d1.some(g => g.rows.some(r => !/^Design|^Glaseffekt/.test(r)))) bad.push('/design graph ' + JSON.stringify(d1));
    await p.keyboard.press('Enter'); await wait(p, 400);
    if (await p.evaluate(() => localStorage.getItem('sg-theme')) !== 'graphit' && !(await p.evaluate(() => JSON.stringify(localStorage)).then(t => /graphit/.test(t)))) bad.push('Design nicht gesetzt');
    await sxOpen(p); await sxType(p, '');
    const empty = (await sxRows(p)).map(g => g.g).join('|');
    if (!/Zuletzt/.test(empty) || !/Schnell anlegen/.test(empty) || !/Häufig/.test(empty)) bad.push('leer: ' + empty);
    const cases = [
      ['Zahnarzt morgen 15 Uhr', r => /^Neuer Termin · Mi 21\.10\., 15:00 · Zahnarzt$/.test(r.prev)],
      ['Mathe Hausaufgaben bis Freitag', r => /^Neue Aufgabe · Fr 23\.10\. · Mathe Hausaufgaben$/.test(r.prev)],
      ['jeden Montag 17:30 Krafttraining', r => /^Neuer Termin · Mo 26\.10\., 17:30 · Krafttraining$/.test(r.prev) && r.rep === 'w'],
      ['Notiz: Kurve 9 früher einlenken', r => /^Neue Notiz/.test(r.prev) && /Kurve 9 früher einlenken/.test(r.prev)],
      ['@24.12.', r => /Kalender: Do 24\.12\. öffnen/.test(r.first)],
      ['Joh 3,16', r => r.first === 'Johannes 3,16'],
      ['rodeln bahn', r => ['Rodeln: Kurvenbuch', 'Rodeln: Bahnen'].every(x => r.all.indexOf(x) >= 0) && /Altenberg|Königssee|Oberhof/.test(r.all)],
      ['atem', r => /Atemübung starten/.test(r.all) && (r.all.match(/Atem/g) || []).length >= 4],
      ['zahnartz', r => /Zahnarzt/.test(r.all)],
    ];
    // ein Zahnarzt-Termin, damit „zahnartz“ etwas findet
    await p.evaluate(() => SharedCalendar.add({ title: 'Zahnarzt Kontrolle', date: '2026-11-03', time: '08:00' }));
    for (const [q, ok] of cases) {
      await sxType(p, q, 600);
      const g = await sxRows(p), all = g.map(x => x.g + ': ' + x.rows.join(', ')).join(' / '), first = (g[0] || { rows: [] }).rows[0] || '';
      const r = { prev: await sxPrev(p), first, all, rep: await p.evaluate(() => { const s = document.querySelector('#sx [data-q=rep]'); return s ? s.value : ''; }) };
      if (!ok(r)) bad.push(q + ' → ' + JSON.stringify(r).slice(0, 300));
    }
    // @24.12. öffnet den Tag, Joh 3,16 die Bibelstelle
    await sxType(p, '@24.12.'); await p.keyboard.press('Enter'); await wait(p, 600);
    if (await p.evaluate(() => (document.querySelector('#dayplan header') || {}).textContent || '').then(t => !/24\./.test(t))) bad.push('@24.12. springt nicht');
    await sxOpen(p); await sxType(p, 'Joh 3,16'); await p.keyboard.press('Enter'); await wait(p, 5000);
    const bib = await (async () => { const f = frameOf(p, 'bibel/'); return f ? f.evaluate(() => { const o = document.querySelector('#passageOverlay.show'); return o ? o.textContent : ''; }) : ''; })();
    if (!/also hat Gott die Welt geliebt/i.test(bib)) bad.push('Bibelstelle öffnet nicht: ' + bib.slice(0, 80));
    assert(!bad.length, bad.join(' || '));
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P6 Schnelleingabe speichern (mit Rückgängig), Bearbeiten öffnet das volle Blatt vorausgefüllt', async () => {
    const c = await ctxFor(Object.assign({ timezoneId: 'Europe/Berlin' }, SMALL)), p = await c.newPage(), e = watch(p);
    await p.clock.install({ time: new Date('2026-10-20T10:00:00+02:00') });
    await open(p, '#kalender'); await sxOpen(p); await sxType(p, 'jeden Montag 17:30 Krafttraining'); await p.keyboard.press('Enter'); await wait(p, 500);
    const ev = await p.evaluate(() => SharedCalendar.list().find(x => x.title === 'Krafttraining'));
    assert(ev && ev.date === '2026-10-26' && ev.time === '17:30' && ev.rep && ev.rep.f === 'w', 'Termin ' + JSON.stringify(ev));
    assert(/Termin gespeichert/.test(await p.textContent('#snack')), 'Hinweis');
    await p.click('#snack button'); await wait(p, 300);
    assert(await p.evaluate(() => !SharedCalendar.list().some(x => x.title === 'Krafttraining')), 'Rückgängig');
    await sxOpen(p); await sxType(p, 'Zahnarzt morgen 15 Uhr 30 min vorher'); await p.click('#sx [data-qa=edit]'); await wait(p, 700);
    const f = await p.evaluate(() => { const r = document.getElementById('sg-shared-calendar'), b = r.shadowRoot || r; const v = n => (b.querySelector('[name=' + n + ']') || {}).value; return [v('title'), v('date'), v('time'), v('remind')]; });
    assert(f.join('|') === 'Zahnarzt|2026-10-21|15:00|30', 'Blatt ' + f);
    // Aufgabe und Notiz
    await p.keyboard.press('Escape'); await p.goto(APP + '#kalender'); await wait(p, 1500);
    await sxOpen(p); await sxType(p, 'Mathe Hausaufgaben bis Freitag'); await p.keyboard.press('Enter'); await wait(p, 400);
    assert(await p.evaluate(() => SharedCalendar.tasks.list().some(t => t.title === 'Mathe Hausaufgaben' && t.due === '2026-10-23')), 'Aufgabe');
    await sxOpen(p); await sxType(p, 'Notiz: Kurve 9 früher einlenken'); await p.keyboard.press('Enter'); await wait(p, 400);
    assert(await p.evaluate(() => SharedCalendar.notes.list().some(n => /Kurve 9 früher einlenken/.test(n.text))), 'Notiz');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P6 Prüfbefunde: echtes Tippen + sofort Enter, Vorschau zurückgesetzt, Befehlsname geht vor, leer/Filter legt nichts an, Verlauf', async () => {
    const c = await ctxFor(Object.assign({ timezoneId: 'Europe/Berlin' }, SMALL)), p = await c.newPage(), e = watch(p), bad = [];
    await p.clock.install({ time: new Date('2026-10-20T10:00:00+02:00') });
    await open(p, '#kalender');
    const evs = () => p.evaluate(() => SharedCalendar.list().map(x => x.title + '|' + x.date + '|' + x.time));
    const tasks = () => p.evaluate(() => SharedCalendar.tasks.list().length);
    // echtes Tippen, Enter ohne Pause
    await sxOpen(p); await p.keyboard.type('Zahnarzt morgen 15 Uhr', { delay: 15 }); await p.keyboard.press('Enter'); await wait(p, 400);
    if (!(await evs()).includes('Zahnarzt|2026-10-21|15:00')) bad.push('Tippen+Enter: ' + (await evs()).slice(-2));
    // Vorschau von vorher wirkt nicht mehr: „/glas“ schaltet den Glaseffekt, legt keinen Termin an
    const n0 = (await evs()).length, glas0 = await p.evaluate(() => window.SGTheme.glass());
    await sxOpen(p); await p.keyboard.type('Kino morgen 20 Uhr', { delay: 10 }); await wait(p, 300);
    await p.fill('#sxq', ''); await p.keyboard.type('/glas', { delay: 10 }); await p.keyboard.press('Enter'); await wait(p, 400);
    if ((await evs()).length !== n0 || await p.evaluate(() => window.SGTheme.glass()) === glas0) bad.push('/glas nach Vorschau');
    // ganzer Befehlsname geht vor der Vorschau; Bibelstelle ist kein Termin
    const t0 = await tasks();
    await sxOpen(p); await p.keyboard.type('Bibel heute lesen', { delay: 10 }); await p.keyboard.press('Enter'); await wait(p, 900);
    if (await tasks() !== t0 || !/^#bibel/.test((await state(p)).hash)) bad.push('Bibel heute lesen → ' + (await state(p)).hash);
    await p.goto(APP + '#kalender'); await wait(p, 1200);
    await sxOpen(p); await p.keyboard.type('Römer 8:28', { delay: 10 }); await p.keyboard.press('Enter'); await wait(p, 900);
    if ((await evs()).some(x => /^Römer/.test(x))) bad.push('Römer 8:28 wurde Termin');
    await p.goto(APP + '#kalender'); await wait(p, 1200);
    // leeres Feld: Enter tut nichts; Filter „Bibel“ ohne Treffer legt keine Aufgabe an
    await sxOpen(p); await p.keyboard.press('Enter'); await wait(p, 300);
    if (!(await p.isVisible('#sx.on')) || (await state(p)).hash !== '#kalender') bad.push('leer Enter');
    await p.click('#sx .sxf [data-f=bibel]'); await p.keyboard.type('Zahnarzt', { delay: 10 }); await p.keyboard.press('Enter'); await wait(p, 400);
    if (await tasks() !== t0) bad.push('Filter Bibel legte Aufgabe an');
    await p.keyboard.press('Escape'); await wait(p, 300);
    // Strg K zweimal: nur ein Verlaufseintrag; Esc räumt ihn wieder ab
    const L0 = await p.evaluate(() => history.length);
    await p.keyboard.press('Control+k'); await wait(p, 200); await p.keyboard.press('Control+k'); await wait(p, 200);
    if (await p.evaluate(() => history.length) - L0 > 1) bad.push('Strg K doppelt im Verlauf');
    await p.keyboard.press('Escape'); await wait(p, 300);
    if (await p.evaluate(() => history.state && history.state.sx)) bad.push('Suchen-Eintrag bleibt');
    // „Bearbeiten“ öffnet das Terminblatt; Zurück schließt es, die Seite bleibt
    await sxOpen(p); await p.keyboard.type('Arzt morgen 9 Uhr', { delay: 10 }); await wait(p, 300); await p.click('#sx [data-qa=edit]'); await wait(p, 600);
    if (!(await p.evaluate(() => SharedCalendar.panelOpen()))) bad.push('Blatt nicht offen');
    await p.goBack(); await wait(p, 500);
    if (await p.evaluate(() => SharedCalendar.panelOpen()) || (await state(p)).hash !== '#kalender') bad.push('Zurück schließt Blatt nicht: ' + (await state(p)).hash);
    // Bibeltext: alle Wörter; Jud 5 = Judas 1,5
    await sxOpen(p); await sxType(p, 'gnade friede', 3500);
    if (!(await sxRows(p)).some(g => g.g === 'Bibel' && g.rows.length)) bad.push('gnade friede ohne Treffer');
    await sxType(p, 'Jud 5'); if ((await sxRows(p))[0]?.rows[0] !== 'Judas 1,5') bad.push('Jud 5');
    assert(!bad.length, bad.join(' | '));
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P6 Suche: kein alter Befehl verloren, Filter, Zurück schließt zuerst, Strg K, offline, flüssig', async () => {
    const c = await ctxFor(SMALL), p = await c.newPage(), e = watch(p), bad = [];
    await open(p, '#training/heute');
    // alle Befehle der alten Palette (ihr Katalog liegt weiter im Verbund) sind über ihre Wörter zu finden
    const old = await p.evaluate(() => { const L = []; const pal = SharedCalendar; pal.setPalette(null); const list = pal.commands().map(x => x.label); return list; });
    await p.evaluate(() => location.reload()); await wait(p, 2200);
    const STOP = /^(offnen|starten|alle|apps|als|app|der|die|das|dieser|und|vor|nach|dem|von|mit|im|in|fur|jetzt)$/;
    await sxOpen(p);
    for (const l of old) {
      if (/Aufgabe anlegen/.test(l)) continue;
      const w = l.toLowerCase().replace(/[äöüß]/g, ch => ({ ä: 'a', ö: 'o', ü: 'u', ß: 'ss' }[ch])).replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(x => x.length > 2 && !STOP.test(x)).slice(0, 2).join(' ');
      await sxType(p, '/' + w, 250);
      const rows = (await sxRows(p)).reduce((a, g) => a.concat(g.rows), []);
      if (!rows.length) bad.push(l + ' (/' + w + ')');
    }
    // aus Training geöffnet: Training-Gruppe vorn bei gleichwertigen Treffern; Filter „Bibel“ zeigt nur Bibel
    await sxType(p, 'kraft'); const g1 = await sxRows(p);
    if (!g1.length) bad.push('kraft nichts');
    await p.click('#sx .sxf [data-f=befehle]'); await wait(p, 300);
    if ((await sxRows(p)).some(g => g.g !== 'Befehle')) bad.push('Filter Befehle');
    // Zurück schließt die Suche, die Seite bleibt
    const h0 = (await state(p)).hash; await p.goBack(); await wait(p, 400);
    if (await p.isVisible('#sx.on') || (await state(p)).hash !== h0) bad.push('Zurück: ' + (await state(p)).hash);
    // Strg K (Tablet-Tastatur) öffnet dieselbe Suche
    await p.keyboard.press('Control+k'); await wait(p, 300);
    if (!(await p.isVisible('#sx.on'))) bad.push('Strg K');
    await p.keyboard.press('Escape'); await wait(p, 300);
    // offline: Suche und Bibeltext funktionieren (Bibel ist im Speicher)
    await c.setOffline(true); await sxOpen(p); await sxType(p, 'gnade', 3000);
    if (!(await sxRows(p)).some(g => g.g === 'Bibel' && g.rows.length)) bad.push('offline Bibelsuche');
    await c.setOffline(false);
    // flüssig: nach dem Vorladen der Seiten blockiert die Suche den Hauptthread nie länger als 50 ms (Bibel/Buch laufen im Worker)
    await p.keyboard.press('Escape'); await wait(p, 14000); await sxOpen(p);
    const longT = await p.evaluate(async () => { const obs = []; new PerformanceObserver(l => l.getEntries().forEach(x => obs.push(Math.round(x.duration)))).observe({ type: 'longtask' });
      const inp = document.getElementById('sxq'); for (const q of ['z', 'zah', 'zahnarzt', 'atem', 'gnade', 'kraftraum', 'Joh 3,16', '/design', '@morgen']) { inp.value = q; inp.dispatchEvent(new Event('input')); await new Promise(r => setTimeout(r, 450)); }
      await new Promise(r => setTimeout(r, 2500)); return obs; });
    if (longT.some(x => x > 50)) bad.push('lange Aufgaben ' + longT);
    // Verlauf bleibt auf dem Gerät: nicht in der Umzugsdatei
    if (await p.evaluate(() => SGMove.data().then(d => 'sg-suche-v1' in d.ls))) bad.push('Suchverlauf in Umzugsdatei');
    assert(!bad.length, bad.join(' | '));
    assert(!e.filter(x => !/ERR_INTERNET_DISCONNECTED/.test(x)).length, e.join(' | ')); await c.close();
  });
  await test('K Kalender: Reihenfolge Wochenleiste · Tagesplan · Monat, auf 360×800 ohne Scrollen sichtbar', async () => {
    const c = await ctxFor({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true }), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    const r = await p.evaluate(() => { const y = id => document.getElementById(id).getBoundingClientRect(), rows = [...document.querySelectorAll('#dayplan .ev')];
      return { strip: y('cal-strip').top, day: y('cal-day').top, month: y('cal-month').top, glance: y('cal-glance').top, next: y('cal-next').top, rows: rows.length,
        row2: rows[1] ? rows[1].getBoundingClientRect().bottom : 9999, nav: document.getElementById('nav').getBoundingClientRect().top,
        hd: document.querySelector('.calhd b').textContent, over: document.documentElement.scrollWidth - innerWidth, mw: document.getElementById('mgrid').scrollWidth - document.getElementById('mgrid').clientWidth,
        cells: document.querySelectorAll('#mgrid [data-mday]').length, ch: document.querySelector('#mgrid .mc').getBoundingClientRect().height }; });
    assert(r.strip < r.day && r.day < r.month && r.month < r.glance && r.glance <= r.next, 'Reihenfolge ' + JSON.stringify(r));
    assert(r.rows >= 2 && r.row2 <= r.nav, 'Tagesplan mit 2 Einträgen ohne Scrollen ' + r.row2 + '/' + r.nav);
    assert(/^KW \d+ · \S+/.test(r.hd), 'Kopf ' + r.hd);
    assert(r.over <= 1 && r.mw <= 1 && r.cells === 42 && r.ch >= 64, 'Raster ' + JSON.stringify(r));
    assert(!(await p.$('[data-c=monat]')), 'kein Woche/Monat-Schalter mehr');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('K Kalender: Wochenleiste wischen, Tag tippen, Danach', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    assert((await p.$$('#strip .wd')).length === 7, 'Woche');
    assert(/Rodeltraining/.test(await p.textContent('#dayplan')), 'Termin des Tages');
    const k1 = await p.$eval('#strip .wd:nth-child(1)', x => x.dataset.day);
    await touch(p, '#strip', -180, 0); await wait(p, 200);
    const k2 = await p.$eval('#strip .wd:nth-child(1)', x => x.dataset.day);
    assert(k2 > k1, 'Wischen zur nächsten Woche');
    await p.click('[data-c=today]'); await wait(p, 200);
    const rows = await p.$$('#cal-next .nd');
    assert(rows.length >= 1 && rows.length <= 5, 'Danach höchstens 5: ' + rows.length);
    const nk = await rows[0].evaluate(x => x.dataset.day);
    await rows[0].click(); await wait(p, 400);
    assert(await p.evaluate(k => document.querySelector('#strip .wd.s').dataset.day === k, nk), 'Danach-Tag gewählt');
    assert(await p.evaluate(() => document.getElementById('n-kalender').scrollTop) < 5, 'nach oben gescrollt');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('K Monatskalender: tippen, langer Druck, wischen, Pfeile, Monat wählen, Legende, Bedienhilfe', async () => {
    const c = await ctxFor(Object.assign({ timezoneId: 'Europe/Berlin' }, PHONE)), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    // Tippen auf einen Tag: gewählt, Tagesplan zeigt ihn, weich nach oben
    await p.evaluate(() => { document.getElementById('n-kalender').scrollTop = 500; });
    const cell = p.locator('#mgrid [data-mday]').nth(24); const k = await cell.getAttribute('data-mday');
    await cell.click(); await wait(p, 450);
    assert(await p.evaluate(k => document.querySelector('#strip .wd.s').dataset.day === k && document.querySelector('#mgrid .mc.s').dataset.mday === k, k), 'Tag gewählt');
    const d = new Date(k + 'T12:00'); assert((await p.textContent('#dayplan header')).includes(d.getDate() + '.'), 'Tagesplan zeigt den Tag');
    assert(await p.evaluate(() => document.getElementById('n-kalender').scrollTop) < 5, 'nach oben gescrollt');
    const lab = await p.getAttribute('#mgrid .mc.s', 'aria-label'), pr = await p.getAttribute('#mgrid .mc.s', 'aria-pressed');
    assert(/^(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag), \d+\. \S+, (keine|\d+) Eintr/.test(lab) && pr === 'true', 'Bedienhilfe ' + lab);
    assert(await p.$('#mgrid[role=grid] [role=gridcell] button'), 'role=grid');
    // Langer Druck: „Neu“ für genau diesen Tag
    const lp = await p.locator('#mgrid [data-mday]').nth(30).getAttribute('data-mday');
    await touch(p, '#mgrid [data-mday="' + lp + '"]', 0, 0, 600); await wait(p, 300);
    const dd = new Date(lp + 'T12:00');
    assert(/Neu/.test(await p.textContent('#sheet')) && (await p.textContent('#sheet')).includes(dd.getDate() + '.'), 'Langer Druck öffnet Neu für den Tag');
    await p.keyboard.press('Escape'); await p.evaluate(() => history.back()); await wait(p, 300);
    // Wischen: Monat weiter, Tag bleibt (31.10. → 30.11.)
    await p.evaluate(() => { window.__pick = k => { const b = document.querySelector('#mgrid [data-mday="' + k + '"]'); if (b) b.click(); }; });
    // auf den Monat Oktober 2026 springen und den 31. wählen
    await p.click('[data-c=mpick]'); await wait(p, 200);
    while (!(await p.textContent('#sheet .mpy b')).includes('2026')) await p.click((await p.textContent('#sheet .mpy b')) > '2026' ? '#sheet [data-s=py]' : '#sheet [data-s=ny]');
    await p.click('#sheet [data-s=m9]'); await wait(p, 300);
    assert(/Oktober 2026/.test(await p.textContent('.mhd .mt')), 'Monat gewählt');
    await p.evaluate(() => window.__pick('2026-10-31')); await wait(p, 400);
    await touch(p, '#mgrid', -200, 0); await wait(p, 400);
    assert(/November 2026/.test(await p.textContent('.mhd .mt')), 'gewischt: November');
    assert(await p.evaluate(() => document.querySelector('#strip .wd.s').dataset.day) === '2026-11-30', 'Tag bleibt (letzter im kürzeren Monat)');
    await touch(p, '#mgrid', 200, 0); await wait(p, 400);
    assert(/Oktober 2026/.test(await p.textContent('.mhd .mt')) && await p.evaluate(() => document.querySelector('#strip .wd.s').dataset.day) === '2026-10-30', 'zurückgewischt');
    // Pfeile: Monat blättern, Auswahl bleibt
    await p.click('[data-c=mnext]'); await p.click('[data-c=mnext]'); await wait(p, 300);
    assert(/Dezember 2026/.test(await p.textContent('.mhd .mt')) && await p.evaluate(() => document.querySelector('#strip .wd.s').dataset.day) === '2026-10-30', 'Pfeile ändern die Auswahl nicht');
    await p.click('[data-c=mprev]'); await wait(p, 200);
    assert(/November 2026/.test(await p.textContent('.mhd .mt')), 'Pfeil zurück');
    // Legende
    await p.click('[data-c=legend]'); await wait(p, 200);
    const lg = await p.textContent('#sheet');
    assert(['Training', 'Mobility', 'Atmung', 'Schule', 'Aufgabe', 'Notiz', 'Termin', 'Ferien'].every(x => lg.includes(x)), 'Legende ' + lg);
    assert(!e.length, e.join(' | ')); await c.close();
  });
  // echte Touch-Eingaben wie am Handy (Chrome DevTools Protocol): langer Druck, Doppeltipp
  const cdpTouch = async (p, x, y, ms) => { const s = await p.context().newCDPSession(p);
    await s.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await new Promise(r => setTimeout(r, ms));
    await s.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await s.detach(); };
  await test('K Prüfbefunde Phase 1: Serien weit weg, langer Druck, Doppeltipp, überfällig, Bedienhilfe, Breite, Maskierung', async () => {
    const c = await ctxFor(Object.assign({ timezoneId: 'Europe/Berlin' }, PHONE)), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    // F1: tägliche Serie auch 26 Monate weiter vollständig
    await p.evaluate(() => SharedCalendar.add({ title: 'Täglich dehnen', date: '2026-01-01', time: '07:00', app: 'Kalender' }).id).then(id => p.evaluate(id => SharedCalendar.update(id, { rep: { f: 'd' } }), id));
    await wait(p, 300);
    for (let i = 0; i < 26; i++) await p.click('[data-c=mnext]');
    await wait(p, 300);
    const f1 = await p.evaluate(() => { const cells = [...document.querySelectorAll('#mgrid .mc:not(.o)')]; return [cells.length, cells.filter(b => /[1-9]\d* Eintr|1 Eintrag/.test(b.getAttribute('aria-label'))).length, document.querySelector('.mhd .mt').textContent]; });
    assert(f1[0] > 27 && f1[0] === f1[1], 'Serie in ' + f1[2] + ': ' + f1[1] + '/' + f1[0]);
    await p.click('[data-c=mtoday]'); await wait(p, 200);
    // F2: langer Druck mit echtem Finger: Blatt bleibt nach dem Loslassen offen
    await p.evaluate(() => { const el = document.getElementById('n-kalender'); el.scrollTop += document.getElementById('mgrid').getBoundingClientRect().top - 140; }); await wait(p, 200);
    const box = await p.locator('#mgrid [data-mday]').nth(17).boundingBox();
    await cdpTouch(p, box.x + box.width / 2, box.y + 20, 700); await wait(p, 500);
    assert(await p.evaluate(() => document.getElementById('sheet').classList.contains('on')) && /Neu/.test(await p.textContent('#sheet')), 'Blatt bleibt offen');
    await p.evaluate(() => history.back()); await wait(p, 300);
    // F3: Doppeltipp wählt den getippten Tag, nicht den darunter
    await p.evaluate(() => { document.getElementById('n-kalender').scrollTop = 450; }); await wait(p, 100);
    const cell = p.locator('#mgrid [data-mday]').nth(23), k = await cell.getAttribute('data-mday'), b2 = await cell.boundingBox();
    await cdpTouch(p, b2.x + b2.width / 2, b2.y + 15, 40); await wait(p, 80); await cdpTouch(p, b2.x + b2.width / 2, b2.y + 15, 40); await wait(p, 500);
    assert(await p.evaluate(() => document.querySelector('#strip .wd.s').dataset.day) === k, 'Doppeltipp');
    // S1: überfällige Aufgabe zählt heute in Leiste und Raster
    await p.evaluate(() => { const d = new Date(Date.now() - 2 * 864e5); SharedCalendar.tasks.add({ title: 'Überfällig', due: d.toISOString().slice(0, 10) }); });
    await p.click('[data-c=today]').catch(() => {}); await wait(p, 400);
    const s1 = await p.evaluate(() => { const t = document.querySelector('#strip .wd.t'), m = document.querySelector('#mgrid .mc.t'); return [t.getAttribute('aria-label'), m.getAttribute('aria-label'), document.querySelectorAll('#dayplan .ev').length]; });
    const n = +((s1[1].match(/(\d+) Eintr/) || [])[1] || 0);
    assert(n === s1[2] && s1[0] === s1[1], 'Zählung heute ' + JSON.stringify(s1));
    // S3: Monatskopf nennt den Monat
    assert(/^\S+ \d{4}, Monat und Jahr wählen$/.test(await p.getAttribute('.mhd .mt', 'aria-label')), 'Monatskopf');
    // S4: Breite ab 600 px → Zeilen mit Titel
    await p.setViewportSize({ width: 800, height: 915 }); await wait(p, 400);
    assert(await p.$('#mgrid.wide'), 'breit nach Drehen');
    await p.setViewportSize({ width: 412, height: 915 }); await wait(p, 400);
    assert(!(await p.$('#mgrid.wide')), 'schmal');
    // S5/H1: Uhrzeit maskiert, Eintrag ohne Titel
    await p.evaluate(() => { const t = new Date(), k = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); const n = SharedCalendar.add({ title: 'x', date: k, time: '<b>x', app: 'Kalender' }); SharedCalendar.update(n.id, { title: '' }); }); await wait(p, 400);
    assert(!(await p.$('#dayplan .tm b')) && /\(ohne Titel\)/.test(await p.textContent('#dayplan')), 'maskiert/ohne Titel');
    // S8: viele Einträge → gleich hohe Zellen
    await p.evaluate(() => { const t = new Date(), k = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-'; for (let i = 0; i < 200; i++) SharedCalendar.add({ title: 'Viel ' + i, date: k + String(1 + i % 28).padStart(2, '0'), time: '10:00', app: 'Kalender' }); }); await wait(p, 600);
    const hs = await p.evaluate(() => [...new Set([...document.querySelectorAll('#mgrid .mc')].map(b => Math.round(b.getBoundingClientRect().height)))]);
    assert(hs.length === 1 && hs[0] >= 64 && hs[0] <= 76, 'Zellhöhen ' + hs);
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('K Prüfbefunde Phase 1: Mitternacht bei offener App, Titel bei Schrift 130 %', async () => {
    const c = await ctxFor(Object.assign({ timezoneId: 'Europe/Berlin' }, PHONE)), p = await c.newPage(), e = watch(p);
    await p.clock.install({ time: new Date('2026-10-20T23:59:20+02:00') });
    await open(p, '#kalender');
    assert(/Heute · Dienstag, 20\./.test(await p.textContent('#dayplan header')), 'vorher');
    await p.clock.fastForward(75000); await wait(p, 300);
    assert(/Heute · Mittwoch, 21\./.test(await p.textContent('#dayplan header')), 'nach Mitternacht: ' + await p.textContent('#dayplan header'));
    await c.close();
    const c2 = await ctxFor({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true }), q = await c2.newPage();
    await open(q, '#kalender'); await q.evaluate(() => { document.documentElement.style.zoom = '1.3'; }); await wait(q, 300);
    const cut = await q.evaluate(() => [...document.querySelectorAll('#dayplan .ev b')].filter(b => b.scrollHeight > b.clientHeight + 1).map(b => b.textContent));
    assert(!cut.length, 'abgeschnitten: ' + cut);
    assert(!e.length, e.join(' | ')); await c2.close();
  });
  await test('K Kalender: Schrift 130 %, Tablet, alle zehn Farbwelten lesbar', async () => {
    for (const vp of [{ width: 360, height: 640 }, { width: 800, height: 1280 }, { width: 1280, height: 800 }]) {
      const c = await ctxFor(Object.assign({}, PHONE, { viewport: vp })), p = await c.newPage(), e = watch(p);
      await open(p, '#kalender');
      await p.evaluate(() => { document.documentElement.style.zoom = '1.3'; }); await wait(p, 300);
      const over = await p.evaluate(() => [document.documentElement.scrollWidth - innerWidth, ...[...document.querySelectorAll('#mgrid .mc')].slice(0, 7).map(b => b.scrollWidth - b.clientWidth)]);
      assert(over.every(x => x <= 2), 'Überlauf ' + vp.width + ': ' + over);
      assert(!e.length, e.join(' | ')); await c.close();
    }
    const c = await ctxFor(PHONE), p = await c.newPage();
    await open(p, '#kalender');
    const ids = await p.evaluate(() => SGTheme.list.map(t => t.id)), bad = [];
    const lum = 'const L=c=>{const m=c.match(/\\d+(\\.\\d+)?/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])};const K=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};';
    for (const id of ids) {
      await p.evaluate(id => SGTheme.set(id), id); await wait(p, 150);
      const k = await p.evaluate(lum + 'const bg=getComputedStyle(document.querySelector("#mgrid")).backgroundColor,fg=getComputedStyle(document.querySelector("#mgrid .mc:not(.o) .n")).color,mu=getComputedStyle(document.querySelector("#mgrid .mh span")).color,dbg=getComputedStyle(document.querySelector("#dayplan .cells")).backgroundColor,dfg=getComputedStyle(document.querySelector("#dayplan .ev b")).color,oc=getComputedStyle(document.querySelector("#mgrid .mc.o .n")).color,kw=getComputedStyle(document.querySelector("#mgrid .mrow:not(.mh) .kw")).color;[K(fg,bg),K(mu,bg),K(dfg,dbg),K(oc,bg),K(kw,bg)]');
      if (k.some(x => x < 4.5)) bad.push(id + ' ' + k.map(x => x.toFixed(1)).join('/'));
    }
    assert(!bad.length, 'Kontrast zu niedrig: ' + bad.join(', '));
    await c.close();
  });
  await test('S Kalender verknüpft: Starten führt in Training und Atmung, Zurück-Geste zum Kalender', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    await p.locator('.ev', { hasText: 'Rodeltraining' }).locator('[data-start]').click(); await wait(p, 1500);
    let s = await state(p); assert(s.tab === 'training' && s.hash === '#training/heute', 'Training ' + s.hash);
    await p.goBack(); await wait(p, 500); s = await state(p); assert(s.tab === 'kalender', 'zurück ' + s.hash);
    await p.evaluate(() => SharedCalendar.setCalShow('atmung', true)); await wait(p, 400);   // Atemübungen stehen standardmäßig nicht im Kalender
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
    await p.locator('#strip .wd').nth(6).click(); const day = await p.$eval('#strip .wd.s', x => x.dataset.day);
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
    await p.locator('#strip .wd').nth(6).click();
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

  await test('S Speicher: höchstens 7 Bereiche gleichzeitig geladen, geschlossene laden beim Öffnen neu', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    for (const h of ['training/heute', 'training/rodeln', 'training/wissen', 'mobility/mobility', 'mobility/atmung', 'schule', 'bibel', 'pause', 'aufgaben', 'tset']) { await p.evaluate(h => { location.hash = h; }, h); await wait(p, 700); }
    const n = await p.evaluate(() => document.querySelectorAll('#stage iframe').length);
    assert(n <= 7, 'geladen: ' + n);
    await p.evaluate(() => { location.hash = 'training/rodeln'; }); await wait(p, 2000);
    const ok = await p.evaluate(() => { const f = document.querySelector('#stage iframe.on'); return f && /bahnplan/.test(f.src) && f.contentDocument.body.innerText.length > 20; });
    assert(ok, 'wieder geöffnet');
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
    assert(f.time === '' && f.date === '2026-11-02' && f.endDate === '2026-11-06' && /gefaltet werden muss/.test(f.title), 'ganztägig ' + JSON.stringify(f));
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
    await p.selectOption('[data-fsel=data-cfch]', 'k3'); await p.waitForTimeout(150); await p.click('[data-cfk="m"]');
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
    await p.selectOption('[data-fsel=data-qfch]', 'k5'); await wait(p, 150); await p.click('[data-a=quiz]'); await wait(p, 200);
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
  /* ---------- P7: Kalender-Verbesserungen (mehrtägig, Serien, Verschieben, Status, Bereich) ---------- */
  const FIX350 = fs.readFileSync(__dirname + '/stand-3.5.0.js', 'utf8');
  const LOC = `const pad=n=>String(n).padStart(2,'0'), K=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};`;
  await test('P7 Alte Daten (seed + Stand 3.5.0) laden fehlerfrei, Bereich einmalig nachgetragen, Serien wie vorher', async () => {
    const c = await ctxFor(PHONE); await c.addInitScript(FIX350); const p = await c.newPage(), e = watch(p);
    await open(p, '#kalender'); await wait(p, 600);
    const r = await p.evaluate(LOC + `(() => {
      const d = JSON.parse(localStorage.getItem('sg-shared-calendar-v1')), by = id => d.events.find(x => x.id === id);
      const occ = SharedCalendar.occurrences(K(-21), K(14)).filter(x => x.sid === 'o2').map(x => x.date);
      const phys = SharedCalendar.occurrences(K(-14), K(60)).filter(x => x.sid === 'o3').length;
      const A = e => SharedCalendar.areaOf(e);
      return { areas: [A(by('o1')), A(by('o5')), A(by('o6')), A(by('o9')), A(by('o2'))], stored: d.events.some(e => e.area), changed: [by('o1').changed, by('o2').changed], deleted: !by('o8') || !by('o8').area,
        occ, exp: [K(-21), K(-7), K(7)], phys, rows: document.querySelectorAll('#dayplan .ev').length, plan: SharedCalendar.allItems(K(1), K(2)).filter(x => x.plan).map(x => x.id).sort().join() };
    })()`);
    assert(JSON.stringify(r.areas) === JSON.stringify(['training', 'mobility', 'schule', 'termin', 'termin']), 'Bereiche ' + r.areas);
    assert(r.changed[0] === 1 && r.changed[1] === 2 && r.deleted && !r.stored, 'Änderungszeit blieb, Bereich nur abgeleitet (nicht gespeichert), gelöschte weg');
    assert(JSON.stringify(r.occ) === JSON.stringify([r.exp[0], r.exp[2]]), 'zweiwöchentlich mit Ausnahme ' + r.occ);
    assert(r.phys === 7, 'Physio bis Serienende: ' + r.phys);
    assert(r.plan === 'o4,o6', 'planbare Einträge (Mobility und Atmung stehen nicht mehr im Kalender) ' + r.plan);
    assert(r.rows >= 2 && !e.length, e.join(' | ')); await c.close();
  });
  function K0(k, n) { const d = new Date(k + 'T12:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  await test('P7 Mehrtägig: Tag 2 von 4, Balken im Monat (neu an der Wochengrenze), .ics DTEND exklusiv, Import, Danach einmal', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    const r = await p.evaluate(LOC + `(() => {
      // Fr bis Mo nächster Woche: über die Wochengrenze
      const d = new Date(); d.setDate(d.getDate() + 7 + (5 - (d.getDay() + 6) % 7 - 1 + 7) % 7); const fr = d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
      const e3 = new Date(d); e3.setDate(e3.getDate() + 3); const mo = e3.getFullYear()+'-'+pad(e3.getMonth()+1)+'-'+pad(e3.getDate());
      const n = SharedCalendar.add({ title: 'Trainingslager', date: fr, endDate: mo, app: 'Training' });
      const occ = SharedCalendar.occurrences(fr, mo).filter(x => x.id === n.id).map(x => x.day + '/' + x.of);
      const ics = SharedCalendar.phone.ics([JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events.find(x => x.id === n.id)]);
      const back = SharedCalendar.phone.parse(ics)[0];
      const t = SharedCalendar.add({ title: 'Wettkampf', date: fr, endDate: K(0) > fr ? fr : (() => { const x = new Date(d); x.setDate(x.getDate() + 1); return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate()); })(), time: '18:00', end: '14:00', app: 'Kalender' });
      const ics2 = SharedCalendar.phone.ics([JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events.find(x => x.id === t.id)]);
      const back2 = SharedCalendar.phone.parse(ics2)[0];
      return { fr, mo, occ, dtend: /DTEND;VALUE=DATE:(\\d+)/.exec(ics)[1], back: [back.date, back.endDate, back.time], back2: [back2.time, back2.endDate, back2.end], id: n.id };
    })()`);
    assert(r.occ.join() === '1/4,2/4,3/4,4/4', 'Tage ' + r.occ);
    assert(r.dtend === K0(r.mo, 1).replace(/-/g, ''), 'DTEND exklusiv ' + r.dtend);
    assert(r.back[0] === r.fr && r.back[1] === r.mo && !r.back[2], 'Import ganztägig ' + r.back);
    assert(r.back2[0] === '18:00' && r.back2[1] === K0(r.fr, 1) && r.back2[2] === '14:00', 'Import mit Uhrzeit ' + r.back2);
    await p.evaluate(k => { location.hash = 'kalender'; }, r.fr); await wait(p, 200);
    // Tag 2 im Tagesplan
    await p.evaluate(k => { const b = document.querySelector('#mgrid [data-mday="' + k + '"]'); if (!b) { document.querySelector('[data-c=mnext]').click(); } }, K0(r.fr, 1)); await wait(p, 300);
    await p.click('#mgrid [data-mday="' + K0(r.fr, 1) + '"]'); await wait(p, 400);
    assert(/Tag 2 von 4/.test(await p.textContent('#dayplan')), 'Tag 2 von 4 im Tagesplan');
    const bars = await p.evaluate(k => [...document.querySelectorAll('#mgrid .mcell')].filter(c => c.querySelector('.mspan')).map(c => c.querySelector('[data-mday]').dataset.mday + ':' + c.querySelector('.mspan').className), r.fr);
    const mine = bars.filter(b => b >= r.fr && b <= r.mo + '~');
    assert(mine.length >= 4 && /\bs\b/.test(mine[0]) && /\bf\b/.test(mine[2].split(':')[1]) && /\bs\b/.test(mine[3].split(':')[1]), 'Balken ' + mine.join(' | '));
    const next = await p.evaluate(() => [...document.querySelectorAll('#cal-next .nd')].map(x => x.textContent).filter(t => /Trainingslager/.test(t)).length);
    assert(next <= 1, 'Danach doppelt: ' + next);
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P7 Serien: Wochentage, alle N Wochen, n-ter Wochentag; RRULE/EXDATE-Rundreise; Formular', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    const r = await p.evaluate(LOC + `(() => {
      const S = SharedCalendar, ev = id => JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events.find(x => x.id === id);
      const m = (() => { const d = new Date(); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d; })(), mo = m.getFullYear()+'-'+pad(m.getMonth()+1)+'-'+pad(m.getDate());
      const a = S.add({ title: 'Kraft Mo Mi Fr', date: mo, time: '17:00', end: '18:00', app: 'Training', rep: { f: 'w', days: [0, 2, 4] } });
      const b = S.add({ title: 'Alle 3 Wochen Di', date: mo, time: '09:00', app: 'Kalender', rep: { f: 'w', days: [1], iv: 3 } });
      const c = S.add({ title: 'Erster Montag', date: '2026-01-05', app: 'Kalender', rep: { f: 'm', nth: 1 } });
      const l = S.add({ title: 'Letzter Freitag', date: '2026-01-30', app: 'Kalender', rep: { f: 'm', nth: -1 } });
      S.skip(a.id, (() => { const x = new Date(m); x.setDate(x.getDate() + 2); return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate()); })());
      const to = (() => { const x = new Date(m); x.setDate(x.getDate() + 27); return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate()); })();
      const wd = k => ['So','Mo','Di','Mi','Do','Fr','Sa'][new Date(k + 'T12:00').getDay()];
      const oa = S.occurrences(mo, to).filter(x => x.sid === a.id).map(x => wd(x.date)), ob = S.occurrences(mo, to).filter(x => x.sid === b.id).map(x => x.date);
      const oc = S.occurrences('2026-01-01', '2026-06-30').filter(x => x.sid === c.id).map(x => x.date), ol = S.occurrences('2026-01-01', '2026-04-30').filter(x => x.sid === l.id).map(x => x.date);
      const ics = S.phone.ics([ev(a.id), ev(b.id), ev(c.id), ev(l.id)]), back = S.phone.parse(ics);
      return { oa, ob, oc, ol, rr: (ics.match(/RRULE:[^\\r]+/g) || []).join(' | '), ex: /EXDATE:\\d{8}T170000/.test(ics),
        back: back.map(x => JSON.stringify(x.rep) + (x.ex ? x.ex.length : 0)), src: [a, b, c, l].map(x => JSON.stringify(ev(x.id).rep) + ((ev(x.id).ex || []).length)) };
    })()`);
    assert(r.oa.length === 11 && r.oa.slice(0, 5).join() === 'Mo,Fr,Mo,Mi,Fr', 'Mo/Mi/Fr mit Ausnahme ' + r.oa);
    assert(r.ob.length === 2, 'alle 3 Wochen ' + r.ob);
    assert(r.oc.join() === '2026-01-05,2026-02-02,2026-03-02,2026-04-06,2026-05-04,2026-06-01', 'erster Montag ' + r.oc);
    assert(r.ol.join() === '2026-01-30,2026-02-27,2026-03-27,2026-04-24', 'letzter Freitag ' + r.ol);
    assert(/BYDAY=MO,WE,FR/.test(r.rr) && /INTERVAL=3;BYDAY=TU/.test(r.rr) && /BYDAY=1MO/.test(r.rr) && /BYDAY=-1FR/.test(r.rr) && r.ex, 'RRULE ' + r.rr);
    assert(JSON.stringify(r.back) === JSON.stringify(r.src), 'Rundreise ' + r.back.join(' ; ') + ' ≠ ' + r.src.join(' ; '));
    // Formular: „An bestimmten Wochentagen“ speichert Wochentage und Intervall
    await p.evaluate(() => SharedCalendar.newEvent()); await wait(p, 400);
    const f = p.locator('#sg-cal-root, body').first();
    await p.fill('[name=title]', 'Lauf Di Do'); await p.selectOption('[name=rep]', 'wd'); await wait(p, 100);
    const today = await p.evaluate(() => (new Date().getDay() + 6) % 7);
    for (const i of [1, 3]) if (i !== today) await p.click('[data-wd="' + i + '"]');
    if (today !== 1 && today !== 3) await p.click('[data-wd="' + today + '"]');
    await p.fill('[name=iv]', '2'); await p.click('[data-a=save]'); await wait(p, 400);
    const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events.find(x => x.title === 'Lauf Di Do').rep);
    assert(saved && saved.f === 'w' && saved.iv === 2 && JSON.stringify(saved.days) === '[1,3]', 'Formular ' + JSON.stringify(saved));
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P7 Serie ändern/löschen: nur dieser, dieser und folgende, alle – jeweils mit Rückgängig', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    const id = await p.evaluate(LOC + `SharedCalendar.add({ title: 'Teamtreffen', date: K(-7), time: '18:00', app: 'Kalender', rep: { f: 'w' } }).id`);
    const occ = await p.evaluate(LOC + 'K(7)');
    const ev = () => p.evaluate(i => JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events.filter(x => !x.deleted && (x.id === i || x.title.indexOf('Teamtreffen') === 0)), id);
    const step = async (title, mode) => {
      await p.evaluate(([i, k]) => SharedCalendar.editEvent(i, k), [id, occ]); await wait(p, 400);
      assert(await p.inputValue('[name=date]') === occ, 'Formular zeigt den gewählten Tag');
      if (title) { await p.fill('[name=title]', title); await p.click('[data-a=save]'); } else await p.click('[data-a=del]');
      await wait(p, 200); assert(/wiederholt sich/.test(await p.textContent('.ask')), 'Frage nach Umfang');
      await p.click('[data-a=mode][data-m=' + mode + ']'); await wait(p, 400);
    };
    await step('Teamtreffen (verlegt)', 'one');
    let l = await ev(); const base = l.find(x => x.id === id);
    assert((base.ex || []).includes(occ) && l.some(x => x.title === 'Teamtreffen (verlegt)' && x.date === occ && !x.rep), 'nur dieser ' + JSON.stringify(l.map(x => [x.title, x.date, x.ex])));
    assert(/Nur dieser Termin geändert/.test(await p.textContent('#snack')), 'Hinweis');
    await p.click('#snack button'); await wait(p, 400);
    l = await ev(); assert(l.length === 1 && !(l[0].ex || []).length && l[0].title === 'Teamtreffen', 'Rückgängig (nur dieser) ' + JSON.stringify(l));
    await step('Teamtreffen neu', 'next');
    l = await ev(); assert(l.find(x => x.id === id).rep.until === K0(occ, -1) && l.some(x => x.title === 'Teamtreffen neu' && x.date === occ && x.rep && x.rep.f === 'w'), 'folgende ' + JSON.stringify(l));
    await p.click('#snack button'); await wait(p, 400);
    await step('Teamtreffen alle', 'all');
    l = await ev(); assert(l.length === 1 && l[0].title === 'Teamtreffen alle' && l[0].date === K0(occ, -14), 'alle ' + JSON.stringify(l));
    await p.click('#snack button'); await wait(p, 400);
    await step(null, 'one');
    l = await ev(); assert((l[0].ex || []).includes(occ), 'löschen nur dieser');
    await p.click('#snack button'); await wait(p, 400);
    await step(null, 'all'); l = await ev(); assert(!l.length, 'Serie gelöscht');
    await p.click('#snack button'); await wait(p, 400); l = await ev(); assert(l.length === 1, 'Löschen rückgängig');
    // einzelner Termin: Löschen ohne Rückfrage, mit Rückgängig
    const sid = await p.evaluate(LOC + `SharedCalendar.add({ title: 'Einzeln', date: K(3), app: 'Kalender' }).id`);
    await p.evaluate(i => SharedCalendar.editEvent(i), sid); await wait(p, 300); await p.click('[data-a=del]'); await wait(p, 300);
    assert(/gelöscht/.test(await p.textContent('#snack')), 'Hinweis Löschen'); await p.click('#snack button'); await wait(p, 300);
    assert(await p.evaluate(i => !JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events.find(x => x.id === i).deleted, sid), 'einzeln wiederhergestellt');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P7 Verschieben, Auslassen, Erledigt – nur dieser Eintrag, Status sichtbar, Wochenbilanz, Rückgängig', async () => {
    const c = await ctxFor(Object.assign({ timezoneId: 'Europe/Berlin' }, PHONE)), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    const t0 = await p.evaluate(LOC + 'K(0)'), t1 = await p.evaluate(LOC + 'K(1)');
    const c1 = () => p.evaluate(() => JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events.find(x => x.id === 'c1'));
    const row = () => p.locator('#dayplan .ev', { hasText: 'Rodeltraining' });
    const bal0 = await p.textContent('.calhd');
    await row().click(); await wait(p, 300);
    assert(/Erledigt/.test(await p.textContent('#sheet')) && /Auf morgen verschieben/.test(await p.textContent('#sheet')) && /Heute auslassen/.test(await p.textContent('#sheet')), 'Aktionen im Blatt');
    await p.click('#sheet [data-s=tom]'); await wait(p, 500);
    assert((await c1()).date === t1 && /Auf morgen verschoben/.test(await p.textContent('#snack')), 'morgen');
    await p.click('#snack button'); await wait(p, 400); assert((await c1()).date === t0, 'Rückgängig morgen');
    // Auslassen mit Grund
    await row().click(); await wait(p, 300); await p.click('#sheet [data-s=skip]'); await wait(p, 200);
    await p.click('#sheet [data-s="w:Wetter"]'); await p.click('#sheet [data-s=ok]'); await wait(p, 500);
    let x = await c1(); assert(x.status === 'skip' && x.why === 'Wetter', 'ausgelassen ' + JSON.stringify(x));
    assert(await p.evaluate(() => { const r = [...document.querySelectorAll('#dayplan .ev')].find(b => /Rodeltraining/.test(b.textContent)); return r.classList.contains('skip') && /ausgelassen \(Wetter\)/.test(r.textContent); }), 'gedämpft mit Grund');
    assert(/ausgelassen/.test(await p.textContent('.calhd')), 'Wochenbilanz zählt ausgelassen: ' + await p.textContent('.calhd'));
    await p.click('#snack button'); await wait(p, 400); x = await c1(); assert(!x.status && !x.why, 'Rückgängig auslassen');
    // Erledigt
    await row().click(); await wait(p, 300); await p.click('#sheet [data-s=done]'); await wait(p, 500);
    assert((await c1()).status === 'done' && await p.evaluate(() => /✓/.test([...document.querySelectorAll('#dayplan .ev')].find(b => /Rodeltraining/.test(b.textContent)).textContent)), '✓ sichtbar');
    const bal = await p.textContent('.calhd .wbal'); assert(/^1 von \d+ Einheiten/.test(bal), 'Bilanz ' + bal);
    await p.click('#snack button'); await wait(p, 400); assert(!(await c1()).status, 'Rückgängig erledigt');
    // Heute später: neue Uhrzeit, Dauer bleibt
    await row().click(); await wait(p, 300); await p.click('#sheet [data-s=later]'); await wait(p, 200);
    await p.fill('#plt', '19:00'); await p.click('#sheet [data-s=ok]'); await wait(p, 500);
    x = await c1(); assert(x.time === '19:00' && x.end === '20:30' && x.date === t0, 'später ' + x.time + '–' + x.end);
    await p.click('#snack button'); await wait(p, 300);
    // Anderen Tag
    await row().click(); await wait(p, 300); await p.click('#sheet [data-s=day2]'); await wait(p, 200);
    await p.fill('#pld', K0(t0, 3)); await p.click('#sheet [data-s=ok]'); await wait(p, 500);
    x = await c1(); assert(x.date === K0(t0, 3) && x.time === '16:00', 'anderer Tag ' + x.date);
    await p.click('#snack button'); await wait(p, 300); assert((await c1()).date === t0, 'Rückgängig anderer Tag');
    // Atemübung aus Atmung & HRV (andere Datenquelle) verschieben – dazu Atemübungen im Kalender einschalten
    assert(!(await p.textContent('#dayplan')).includes('Langsames Atmen'), 'Atemübungen stehen standardmäßig nicht im Kalender');
    await p.evaluate(() => SharedCalendar.setCalShow('atmung', true)); await wait(p, 400);
    await p.locator('#dayplan .ev', { hasText: 'Langsames Atmen' }).click(); await wait(p, 300); await p.click('#sheet [data-s=tom]'); await wait(p, 500);
    const pp = await p.evaluate(() => JSON.parse(localStorage.getItem('pulsplan.v1')).entries.find(x => x.id === 'p1'));
    assert(pp.date === t1, 'Atemübung verschoben ' + pp.date);
    await p.click('#snack button'); await wait(p, 300);
    assert(await p.evaluate(() => JSON.parse(localStorage.getItem('pulsplan.v1')).entries.find(x => x.id === 'p1').date) === t0, 'Atemübung zurück');
    // Standardwoche unberührt
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P7 Automatisch erledigt aus dem Trainingstagebuch – je Tag nie doppelt, ohne Extra-Zeile', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await p.addInitScript(LOC + `if (!localStorage.getItem('p7log')) { localStorage.setItem('p7log','1'); localStorage.setItem('wk_log', JSON.stringify({ [K(0)]: { done: true, type: 'strength', sec: 2400 } })); }`);
    await open(p, '#kalender');
    await p.evaluate(LOC + `SharedCalendar.add({ title: 'Abendlauf', date: K(0), time: '19:00', end: '19:40', app: 'Training' })`); await wait(p, 400);
    const r = await p.evaluate(LOC + `SharedCalendar.allItems(K(0), K(0)).filter(x => /Rodeltraining|Abendlauf|erledigt/.test(x.title)).map(x => x.title + ':' + (x.st || '-') + (x.auto ? '*' : ''))`);
    assert(r.join() === 'Rodeltraining:done*,Abendlauf:-', 'Zuordnung ' + r);
    assert(!(await p.textContent('#dayplan')).includes('Training erledigt'), 'Extra-Zeile weg');
    assert(/^1 von 2 Einheiten/.test(await p.textContent('.calhd .wbal')), 'Bilanz ' + await p.textContent('.calhd .wbal'));
    // „Wieder offen“ übersteuert den Automatismus
    await p.locator('#dayplan .ev', { hasText: 'Rodeltraining' }).click(); await wait(p, 300); await p.click('#sheet [data-s=open1]'); await wait(p, 500);
    const r2 = await p.evaluate(LOC + `SharedCalendar.allItems(K(0), K(0)).filter(x => /Rodeltraining|Abendlauf/.test(x.title)).map(x => x.title + ':' + (x.st || '-'))`);
    assert(r2.join() === 'Rodeltraining:-,Abendlauf:-', 'nach Wieder offen: der Haken wandert nicht weiter ' + r2);
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P7 Tagesplan: „Frei … bis …“, Jetzt-Linie, Überschneidung im Blatt, Zeitraster mit Blöcken nebeneinander', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    await p.evaluate(LOC + `SharedCalendar.add({ title: 'Schwimmen', date: K(2), time: '10:00', end: '11:00', app: 'Training' }); SharedCalendar.add({ title: 'Physio', date: K(2), time: '13:00', end: '14:00', app: 'Kalender' }); SharedCalendar.add({ title: 'Kurz', date: K(2), time: '13:30', end: '15:00', app: 'Kalender' });`);
    await p.click('#strip [data-day="' + await p.evaluate(LOC + 'K(2)') + '"]').catch(async () => { await p.evaluate(LOC + `document.querySelector('[data-mday="' + K(2) + '"]').click()`); });
    await wait(p, 400);
    assert(/Frei 11:00 bis 13:00/.test(await p.textContent('#dayplan')), 'Frei-Zeile: ' + await p.textContent('#dayplan'));
    assert(!(await p.$('#dayplan .nowl')), 'keine Jetzt-Linie an anderen Tagen');
    await p.click('[data-c=vgrid]'); await wait(p, 300);
    const g = await p.evaluate(() => [...document.querySelectorAll('.tgrid .tb')].map(b => { const r = b.getBoundingClientRect(); return [b.textContent.slice(0, 6), Math.round(r.left), Math.round(r.width), Math.round(r.height)]; }));
    const ph = g.find(x => /Physio/.test(x[0])), ku = g.find(x => /Kurz/.test(x[0])), sw = g.find(x => /Schwim/.test(x[0]));
    assert(g.length === 3 && ph[1] !== ku[1] && ph[2] < sw[2] && ku[3] > ph[3], 'Zeitraster ' + JSON.stringify(g));
    assert(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, 'kein Überlauf');
    await p.click('[data-c=vlist]'); await wait(p, 200);
    // heute: Jetzt-Linie (Seed: Rodeltraining 16:00)
    await p.click('[data-c=today]').catch(() => {}); await wait(p, 300);
    assert(await p.$('#dayplan .nowl'), 'Jetzt-Linie heute');
    // Überschneidung im Blatt
    await p.evaluate(LOC + 'SharedCalendar.newEvent(K(2))'); await wait(p, 400);
    await p.fill('[name=time]', '10:30'); await p.fill('[name=end]', '11:30'); await wait(p, 200);
    assert(/Überschneidet sich mit Schwimmen 10:00/.test(await p.textContent('.ovl')), 'Warnung: ' + await p.textContent('.ovl'));
    await p.fill('[name=time]', '11:00'); await wait(p, 200);
    assert(!(await p.textContent('.ovl')), 'keine Warnung, wenn es anschließt');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P7 Wichtig: Stern im Blatt, Kachel „Nächster wichtiger Termin“ mit Countdown, Prüfungen zählen', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    await open(p, '#kalender');
    let gl = await p.textContent('#cal-glance');
    assert(/in 3 Tagen/.test(gl) && /Mathematik|Schulaufgabe/.test(gl), 'Prüfung aus dem Seed: ' + gl);
    await p.evaluate(LOC + 'SharedCalendar.newEvent(K(2))'); await wait(p, 400);
    await p.fill('[name=title]', 'Landesmeisterschaft'); await p.check('[name=star]'); await p.click('[data-a=save]'); await wait(p, 600);
    gl = await p.textContent('#cal-glance');
    assert(/in 2 Tagen/.test(gl) && /Landesmeisterschaft/.test(gl), 'Stern-Termin: ' + gl);
    await p.click('#cal-glance [data-gl^="imp:"]'); await wait(p, 400);
    assert(/★/.test(await p.textContent('#dayplan')) && /Landesmeisterschaft/.test(await p.textContent('#dayplan')), 'Kachel führt zum Tag, Stern sichtbar');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  await test('P7 Cloud-Abgleich: Gerät mit neuen Feldern und Gerät ohne – beide behalten alles', async () => {
    const gist = { id: 'g1', description: 'Gemeinsamer Kalender (SportGermany-Apps)', files: {} };
    const route = async r => {
      const u = new URL(r.request().url()), m = r.request().method(), H = { 'content-type': 'application/json', 'access-control-allow-origin': '*' };
      if (u.pathname === '/user') return r.fulfill({ status: 200, headers: H, body: JSON.stringify({ login: 'test' }) });
      if (u.pathname === '/gists' && m === 'GET') return r.fulfill({ status: 200, headers: H, body: JSON.stringify([{ id: 'g1', description: gist.description, files: Object.assign({ 'kalender.json': {} }, gist.files) }]) });
      if (u.pathname === '/gists/g1' && m === 'PATCH') { const b = JSON.parse(r.request().postData()); Object.keys(b.files).forEach(k => { gist.files[k] = { content: b.files[k].content }; }); return r.fulfill({ status: 200, headers: H, body: JSON.stringify(gist) }); }
      if (u.pathname === '/gists/g1') return r.fulfill({ status: 200, headers: H, body: JSON.stringify(gist) });
      return r.fulfill({ status: 200, headers: H, body: '[]' });
    };
    const dev = async () => { const c = await ctxFor(PHONE); await c.route('https://api.github.com/**', route); await c.addInitScript(() => { if (!localStorage.getItem('sg-shared-calendar-sync')) localStorage.setItem('sg-shared-calendar-sync', JSON.stringify({ token: 'x', user: 'test', gist: 'g1' })); }); const p = await c.newPage(); await open(p, '#kalender'); return [c, p]; };
    const [ca, a] = await dev(), ea = watch(a);
    await a.evaluate(LOC + `SharedCalendar.add({ title: 'Lager neu', date: K(5), endDate: K(8), star: true, app: 'Training', rep: null }); SharedCalendar.add({ title: 'Serie neu', date: K(1), time: '17:00', app: 'Training', rep: { f: 'w', days: [0, 3], iv: 2 } });`);
    await a.evaluate(() => SharedCalendar.sync()); await wait(a, 2500);
    // Gerät B: älterer Stand – schreibt Einträge ohne die neuen Felder (so wie Version 3.7.0)
    const [cb, b] = await dev(), eb = watch(b);
    await b.evaluate(LOC + `(() => { const d = JSON.parse(localStorage.getItem('sg-shared-calendar-v1')); d.events.push({ id: 'alt1', title: 'Alt ohne Felder', date: K(4), time: '', end: '', app: 'Kalender', created: Date.now(), changed: Date.now() }); localStorage.setItem('sg-shared-calendar-v1', JSON.stringify(d)); })()`);
    await b.evaluate(() => SharedCalendar.sync()); await wait(b, 1500);
    // B ändert den neuen Termin (nur Titel, wie die alte App: unbekannte Felder bleiben)
    await b.evaluate(() => { const e = JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events.find(x => x.title === 'Lager neu'); SharedCalendar.update(e.id, { title: 'Lager geändert' }); });
    await b.evaluate(() => SharedCalendar.sync()); await wait(b, 1500);
    await a.evaluate(() => SharedCalendar.sync()); await wait(a, 1500);
    const sa = await a.evaluate(() => JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events.filter(x => !x.deleted).map(x => [x.title, x.endDate || '', !!x.star, x.rep ? JSON.stringify(x.rep) : '']));
    const sb = await b.evaluate(() => JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events.filter(x => !x.deleted).map(x => x.title));
    const lager = sa.find(x => x[0] === 'Lager geändert'), ser = sa.find(x => x[0] === 'Serie neu');
    assert(lager && lager[1] && lager[2], 'A: neue Felder nach Änderung durch B erhalten ' + JSON.stringify(sa));
    assert(ser && /"days":\[0,3\]/.test(ser[3]), 'A: Serie mit Wochentagen');
    assert(sa.some(x => x[0] === 'Alt ohne Felder'), 'A hat Eintrag von B');
    assert(['Lager geändert', 'Serie neu', 'Alt ohne Felder'].every(t => sb.includes(t)), 'B hat alles ' + sb);
    assert(await b.evaluate(LOC + `SharedCalendar.areaOf(JSON.parse(localStorage.getItem('sg-shared-calendar-v1')).events.find(x => x.id === 'alt1'))`) === 'termin', 'B: Bereich tolerant');
    assert(!ea.length && !eb.length, ea.concat(eb).join(' | ')); await ca.close(); await cb.close();
  });
  await test('P7 Webkalender per Link: laden, Serien mit geändertem Einzeltermin und COUNT, offline gespeichert, aus/entfernen', async () => {
    const c = await ctxFor(PHONE), p = await c.newPage(), e = watch(p);
    const K = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); };
    const ICS = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'X-WR-CALNAME:Rodelverein', 'BEGIN:VEVENT', 'UID:s1@v', 'DTSTART;TZID=Europe/Berlin:' + K(0) + 'T190000', 'DTEND;TZID=Europe/Berlin:' + K(0) + 'T203000', 'RRULE:FREQ=WEEKLY', 'SUMMARY:Vereinstraining', 'END:VEVENT',
      'BEGIN:VEVENT', 'UID:s1@v', 'RECURRENCE-ID;TZID=Europe/Berlin:' + K(7) + 'T190000', 'DTSTART;TZID=Europe/Berlin:' + K(8) + 'T180000', 'DTEND;TZID=Europe/Berlin:' + K(8) + 'T193000', 'SUMMARY:Vereinstraining (verlegt)', 'END:VEVENT',
      'BEGIN:VEVENT', 'UID:s2@v', 'DTSTART;VALUE=DATE:' + K(1), 'DTEND;VALUE=DATE:' + K(2), 'RRULE:FREQ=DAILY;COUNT=3', 'SUMMARY:Kurs', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    let hits = 0;
    await c.route('https://kalender.example.org/**', r => { hits++; r.fulfill({ status: 200, headers: { 'content-type': 'text/calendar', 'access-control-allow-origin': '*' }, body: ICS }); });
    await open(p, '#mehr');
    await p.click('#n-mehr [data-m=abo]'); await wait(p, 300); await p.click('#sheet [data-s=add]'); await wait(p, 200);
    await p.fill('#abu', 'webcal://kalender.example.org/verein.ics'); await p.click('#sheet [data-s=ok]'); await wait(p, 1200);
    assert(/Rodelverein/.test(await p.textContent('#sheet')) && /Termine übernommen/.test(await p.textContent('#snack')), 'hinzugefügt: ' + await p.textContent('#sheet'));
    const r = await p.evaluate(() => { const pad = n => String(n).padStart(2, '0'), k = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
      const l = SharedCalendar.allItems(k(0), k(14)).filter(x => x.app === 'Webkalender'); return { tr: l.filter(x => /Vereinstraining/.test(x.title)).map(x => x.date + ' ' + x.time + ' ' + x.title), kurs: l.filter(x => x.title === 'Kurs').length, ro: l.every(x => x.ro === 'Rodelverein'), k7: k(7), k8: k(8) }; });
    assert(r.tr.length === 3 && !r.tr.some(x => x.startsWith(r.k7)) && r.tr.some(x => x === r.k8 + ' 18:00 Vereinstraining (verlegt)'), 'Serie mit verlegtem Termin ' + r.tr.join(' | '));
    assert(r.kurs === 3 && r.ro, 'COUNT=3 ' + r.kurs);
    // offline: ohne Netz bleibt der Stand
    await c.unroute('https://kalender.example.org/**'); await c.route('https://kalender.example.org/**', r => r.abort());
    await p.evaluate(() => SharedCalendar.abo.refresh()); await wait(p, 500);
    assert(await p.evaluate(() => SharedCalendar.abo.list()[0].n) >= 3, 'Stand bleibt ohne Netz');
    const id = await p.evaluate(() => SharedCalendar.abo.list()[0].id);
    await p.evaluate(i => SharedCalendar.abo.set(i, { on: false }), id); await wait(p, 200);
    assert(await p.evaluate(() => !SharedCalendar.allItems('2000-01-01', '2100-01-01').some(x => x.app === 'Webkalender')), 'aus = nicht im Kalender');
    await p.evaluate(i => SharedCalendar.abo.remove(i), id);
    assert(await p.evaluate(() => SharedCalendar.abo.list().length) === 0 && hits >= 1, 'entfernt');
    assert(!e.length, e.join(' | ')); await c.close();
  });
  const ok = results.filter(r => r[0]).length;
  console.log(`\n${ok}/${results.length} Tests grün`); results.filter(r => !r[0]).forEach(r => console.log('FEHLER:', r[1], '–', r[2]));
  fs.writeFileSync(__dirname + '/suite-result.json', JSON.stringify(results, null, 1));
  await browser.close(); process.exit(ok === results.length ? 0 : 1);
})();
