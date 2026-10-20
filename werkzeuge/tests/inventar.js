// Bestandsaufnahme der App: je Ziel/Unterpunkt die Karten (data-sec), Überschriften, Knöpfe; dazu Chips/Menüpunkte der Hülle,
// alle Befehle der Suche und alle Einträge unter „Mehr“. node werkzeuge/tests/inventar.js <ausgabe.json>
// Vorher/nachher vergleichen: node werkzeuge/tests/inventar.js --vergleich inventar-vorher.json inventar-nachher.json
const fs = require('fs');
if (process.argv[2] === '--vergleich') {
  const a = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), b = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
  const flat = o => { const s = new Set(); for (const [k, v] of Object.entries(o.seiten)) for (const t of ['karten', 'titel', 'knoepfe']) (v[t] || []).forEach(x => s.add(t + ': ' + x)); ['befehle', 'mehr', 'navigation'].forEach(t => (o[t] || []).forEach(x => s.add(t + ': ' + x))); return s; };
  const A = flat(a), B = flat(b), fehlt = [...A].filter(x => !B.has(x));
  console.log(fehlt.length ? 'Nicht mehr am alten Platz (' + fehlt.length + '):\n' + fehlt.join('\n') : 'Alles noch vorhanden.');
  process.exit(0);
}
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'inventar.json', APP = 'http://localhost:8765/planer/app/';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.SG_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const c = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  await c.addInitScript(fs.readFileSync(__dirname + '/seed.js', 'utf8'));
  const p = await c.newPage(); await p.goto(APP + '#kalender'); await p.waitForTimeout(2500);
  // alle Pfade aus der Navigationstabelle der Hülle
  const paths = await p.evaluate(() => { const V = window.SGShell && SGShell.V; if (!V) return null; const l = [];
    Object.keys(V).forEach(v => { if (!V[v].secs) return l.push(v); if (V[v].secs.length === 1 && !V[v].secs[0].kids) return l.push(v);
      V[v].secs.forEach(s => (s.kids ? s.kids.map(k => v + '/' + s.id + '/' + k.id) : [v + '/' + s.id]).forEach(x => l.push(x))); });
    return l; });
  const list = paths || ['kalender', 'mehr', 'notizen', 'aufgaben', 'tset', 'training/heute', 'training/lauf', 'training/rodeln/plan', 'training/rodeln/bahnen', 'training/rodeln/laeufe', 'training/rodeln/buch',
    'training/auswertung/fitness', 'training/auswertung/analyse', 'training/wissen/lesen', 'training/wissen/karten', 'training/wissen/quiz', 'training/wissen/suche',
    'mobility/mobility/heute', 'mobility/mobility/wettkampf', 'mobility/mobility/uebungen', 'mobility/mobility/fortschritt',
    'mobility/atmung/heute', 'mobility/atmung/hrv', 'mobility/atmung/woche', 'mobility/atmung/verlauf', 'mobility/atmung/plan',
    'schule/heute', 'schule/plan', 'schule/aufgaben', 'schule/lernplan', 'schule/ferien',
    'bibel/heute', 'bibel/lesen', 'bibel/bibliothek', 'bibel/meine', 'bibel/einst', 'pause/ablenken', 'pause/wissen', 'pause/quiz', 'pause/verlauf', 'pause/einst'];
  const out = { stand: new Date().toISOString(), version: await p.evaluate(() => window.SGVersion), seiten: {}, navigation: [], befehle: [], mehr: [] };
  const grab = () => { const vis = e => e.offsetParent !== null || e.getClientRects().length;
    const doc = document; const t = s => (s || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    return { karten: [...new Set([...doc.querySelectorAll('[data-sec]')].map(e => e.dataset.sec))].sort(),
      titel: [...new Set([...doc.querySelectorAll('h1,h2,h3,.card-h,.sec-label')].filter(vis).map(e => t(e.textContent)).filter(Boolean))],
      knoepfe: [...new Set([...doc.querySelectorAll('button,[role=button],a.btn')].filter(vis).map(e => t(e.getAttribute('aria-label') || e.textContent)).filter(x => x && x.length > 1))] }; };
  for (const h of list) {
    await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(1600);
    const f = await p.evaluateHandle(() => document.querySelector('#stage iframe.on'));
    let r;
    const fr = p.frames().find(x => x !== p.mainFrame() && x.url() && 0);
    const isFrame = await p.evaluate(() => !!document.querySelector('#stage iframe.on') && !document.querySelector('.native.on'));
    if (isFrame) { const frame = await f.asElement().contentFrame(); r = await frame.evaluate(grab).catch(() => ({ karten: [], titel: [], knoepfe: [] })); }
    else r = await p.evaluate(`(${grab.toString()})()`);
    out.seiten[h] = r;
    const nav = await p.evaluate(() => [...document.querySelectorAll('#chips [data-sec],#chips [data-kid],#drawer [data-sec],#drawer [data-kid]')].map(e => (e.closest('[data-v]') ? '' : '') + e.textContent.trim()));
    nav.forEach(x => { if (!out.navigation.includes(h.split('/')[0] + ' › ' + x)) out.navigation.push(h.split('/')[0] + ' › ' + x); });
  }
  out.befehle = await p.evaluate(() => (SharedCalendar.commands ? SharedCalendar.commands() : []).map(x => (x.g ? x.g + ': ' : '') + x.label));
  await p.evaluate(() => { location.hash = 'mehr'; }); await p.waitForTimeout(800);
  out.mehr = await p.evaluate(() => [...document.querySelectorAll('#n-mehr [data-m]')].map(e => e.dataset.m + ' = ' + e.querySelector('b').textContent.trim()));
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log('Inventar: ' + Object.keys(out.seiten).length + ' Seiten, ' + out.navigation.length + ' Menüpunkte, ' + out.befehle.length + ' Befehle, ' + out.mehr.length + ' Mehr-Einträge → ' + OUT);
  await b.close();
})();
