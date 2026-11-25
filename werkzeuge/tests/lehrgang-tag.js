// Schule › Lehrgang › „Nach Tag“: Aufgaben je Lehrgangstag und Fach eintragen („bekommen am“), Handy und PC-Breite.
const { chromium } = require('playwright');
const wait = ms => new Promise(r => setTimeout(r, ms));
let bad = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch(process.env.SG_CHROME ? { executablePath: process.env.SG_CHROME } : {});
  for (const [W, H] of [[1440, 900], [412, 915]]) {
    const p = await b.newPage({ viewport: { width: W, height: H } }), errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8765/planer/schule/?einzeln=1'); await wait(2000);
    await p.evaluate(() => { const t = todayStr();
      db.subjects = [{ id: 'sm', name: 'Mathe', short: 'M', color: '#d33', teacher: 'Fr. Huber' }, { id: 'sd', name: 'Deutsch', short: 'D', color: '#33d' }];
      db.camps.push({ id: 'cX', title: 'ITP Cortina', kind: 'lehrgang', place: 'Cortina', start: addDays(t, -1), end: addDays(t, 4), checklist: [], missed: {} });
      db.homework.push({ id: 'hAlt', subject: 'sd', text: 'Alte Aufgabe ohne Tag', kind: 'ha', due: '', campId: 'cX', done: false });
      ui.view = 'lehrgang'; ui.camp = 'cX'; save(); render(); });
    await wait(300);
    const d2 = await p.evaluate(() => addDays(todayStr(), 1));
    ok(await p.evaluate(() => document.querySelectorAll('.cday[data-day]').length === 6 && !!document.querySelector('.cday.today')), W + ': 6 Tageskarten, heute markiert');
    await p.click(`[data-a="campDayAdd"][data-v="${d2}"]`); await wait(400);
    ok(await p.evaluate(d2 => formState.given === d2 && !!document.querySelector(`.sheet [data-a="hgiven"][data-v="${d2}"].on`), d2), W + ': Formular „Bekommen am“ auf dem gewählten Tag');
    await p.fill('#hwText', 'Arbeitsblatt Funktionen'); await p.click('.sheet [data-a="hsubj"][data-v="sm"]'); await wait(200);
    await p.click('.sheet [data-a="save"]'); await wait(500);
    const card = await p.evaluate(d2 => (document.querySelector(`.cday[data-day="${d2}"]`) || {}).innerText || '', d2);
    ok(/Mathe/.test(card) && /Arbeitsblatt Funktionen/.test(card), W + ': Aufgabe steht am Tag unter dem Fach');
    ok(await p.evaluate(() => /Ohne Tag/.test(document.querySelector('#view').innerText) && /Alte Aufgabe ohne Tag/.test(document.querySelector('#view').innerText)), W + ': ältere Aufgaben ohne Tag bleiben sichtbar');
    await p.click('[data-a="campTaskAdd"]').catch(() => {});
    await p.evaluate(() => { closeSheet && closeSheet(); });
    await p.click('[data-a="campView"][data-v="fach"]'); await wait(300);
    ok(await p.evaluate(() => /📥/.test(document.querySelector('#view').innerText) && !!document.querySelector('.subjblock')), W + ': Nach Fach zeigt „bekommen am“');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), W + ': kein seitliches Scrollen');
    ok(!errs.length, W + ': keine Fehler ' + errs.join(' | '));
    await p.evaluate(() => localStorage.clear()); await p.close();
  }
  await b.close(); console.log(bad ? bad + ' Fehler' : 'Lehrgang nach Tag grün'); process.exit(bad ? 1 : 0);
})();
