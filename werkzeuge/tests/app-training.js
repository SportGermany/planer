// Zusatzprüfung Training-App (schnell-app.js und emulator-app.js): Module und Sportwissenschaft ohne Planer-Hülle erreichbar
module.exports = async (page, ok, wait) => {
  // Handy-/Google-Export der Training-App: nur eigene Teile – erledigte Einheiten als „✓ … erledigt“, keine Planer-Termine
  const out = await page.evaluate(() => {
    const d = new Date(), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const log = JSON.parse(localStorage.getItem('wk_log') || '{}'); log[k] = { done: true, type: 'gym', sec: 1500 }; localStorage.setItem('wk_log', JSON.stringify(log));
    SharedCalendar.add({ title: 'Zahnarzt (Planer)', date: k, time: '10:00', app: 'Kalender' });
    return SharedCalendar.handy.out().map(e => e.title + ' | ' + e.description);
  });
  ok(out.some(x => /^✓ Training erledigt/.test(x) && / erledigt$/.test(x)) && !out.some(x => /Zahnarzt/.test(x)), 'Training-App schreibt nur ihre Einträge ins Handy ' + JSON.stringify(out.slice(0, 3)));
  const base = await page.evaluate(() => location.pathname);
  for (const [h, src] of [['mobility', 'mobility/'], ['atmung/train', 'atmung/'], ['bahnplan', 'bahnplan/']]) {
    await page.evaluate(h => { location.hash = h; }, h); await wait(2500);
    const r = await page.evaluate(src => { const f = [...document.querySelectorAll('iframe')].find(x => x.src.indexOf(src) >= 0 && x.offsetParent); return f ? (f.contentDocument && f.contentDocument.body ? f.contentDocument.body.innerText.length : -1) : 0; }, src);
    ok(r > 30, 'Training-App: ' + h + ' öffnet (' + r + ' Zeichen)');
    await page.evaluate(() => history.back()); await wait(800);
  }
  await page.evaluate(() => { location.hash = 'wissen/karten'; }); await wait(2500);
  const w = await page.evaluate(() => [location.pathname, document.body.innerText.length]);
  ok(/\/wissen\//.test(w[0]) && w[1] > 50, 'Training-App: Sportwissenschaft öffnet ' + w[0]);
  await page.goBack().catch(() => {}); await wait(1500);
  ok((await page.evaluate(() => location.pathname)) === base, 'Training-App: Zurück aus der Sportwissenschaft');
};
