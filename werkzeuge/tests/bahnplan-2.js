const { chromium } = require('playwright');
const fs = require('fs');
const U = 'http://localhost:8765';
(async () => {
  const b = await chromium.launch({ executablePath: process.env.SG_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  // Testbild: Streckenplan-ähnliche Zeichnung mit Nummern
  { const p = await b.newPage({ viewport: { width: 700, height: 900 } });
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="900" style="background:#fff"><path d="M80 60 C 300 60 300 200 120 260 S 200 480 520 420 S 620 700 300 760 L 200 860" stroke="#333" stroke-width="18" fill="none"/>';
    [[220,90],[260,200],[150,300],[380,440],[560,520],[470,720],[260,800]].forEach((q,i)=>svg+=`<circle cx="${q[0]}" cy="${q[1]}" r="18" fill="#c00"/><text x="${q[0]}" y="${q[1]+6}" font-size="18" text-anchor="middle" fill="#fff" font-family="sans-serif">${i+1}</text>`);
    await p.setContent('<body style="margin:0">' + svg + '</svg></body>'); await p.screenshot({ path: require('os').tmpdir() + '/fakemap.png' }); await p.close(); }
  const IMG = fs.readFileSync(require('os').tmpdir() + '/fakemap.png');
  const errs = [];
  async function mock(ctx, ok = true) {
    await ctx.route(/wikipedia\.org|wikimedia\.org/, async route => {
      const u = new URL(route.request().url());
      if (!ok) return route.abort();
      if (u.host === 'upload.wikimedia.org') return route.fulfill({ status: 200, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: IMG });
      const q = Object.fromEntries(u.searchParams), H = { 'access-control-allow-origin': '*' };
      let body = {};
      if (q.list === 'search') body = { query: { search: [{ title: 'File:Winterberg Bobbahn-Streckenplan deutsch.svg' }, { title: 'File:Winterberg bobsleigh track-Track map english.svg' }, { title: 'File:Altenberg Bobbahn-Streckenplan deutsch.svg' }] } };
      else if (q.list === 'categorymembers') body = { query: { categorymembers: [{ title: 'File:Winterberg bobsleigh track-Track map english.svg' }, { title: 'File:Track Profile (GER) Winterberg.svg' }] } };
      else if (q.generator === 'search') body = { query: { pages: [{ title: 'Bobbahn Winterberg', images: [{ title: (u.host[0] === 'd' ? 'Datei:' : 'File:') + 'Flag of Germany.svg' }, { title: 'File:Winterberg Bobbahn 2009.jpg' }] }] } };
      else if (q.prop === 'imageinfo') {
        const pages = q.titles.split('|').map(t => /Flag/.test(t) ? { title: t, missing: true } : ({ title: t, imageinfo: [{ mime: /jpg$/.test(t) ? 'image/jpeg' : 'image/svg+xml', width: 700, height: 900, thumburl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/' + encodeURIComponent(t.slice(5)) + '/1800px-x.png', url: 'https://upload.wikimedia.org/x', descriptionurl: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(t), extmetadata: { Artist: { value: '<a href="x">Lumu</a>' }, LicenseShortName: { value: 'CC BY-SA 3.0' } } }] }));
        body = { query: { pages } };
      }
      route.fulfill({ status: 200, contentType: 'application/json', headers: H, body: JSON.stringify(body) });
    });
  }
  for (const [w, h, sz] of [[360, 780, 'p'], [800, 1280, 'tp'], [1280, 800, 'tl']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 1000, hasTouch: true });
    await ctx.addInitScript(fs.readFileSync(__dirname + '/seed.js', 'utf8')); await mock(ctx);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(sz + ' ' + e.message));
    p.on('console', m => m.type() === 'error' && errs.push(sz + ' console ' + m.text()));
    // alte Daten (ohne Starts, mit lenkart) müssen übernommen werden
    await p.goto(U + '/planer/training/bahnplan/?einzeln');
    await p.evaluate(() => { localStorage.setItem('bahnplan.v1', JSON.stringify({ tracks: [{ id: 'old1', cat: 'koenigssee', name: 'Königssee alt', ort: '', land: 'Deutschland', len: 1251, note: '', map: null, curves: [1,2,3,4,5,6].map(n => ({ n, name: '', dir: 'L', type: 'Kurve', angle: 90, diff: 3, status: 'neu', cue: n === 2 ? 'alte Ansage' : '', o: n === 2 ? { lenkart: 'Schultern', radius: 'eng' } : {}, f: {}, runs: [], line: [], x: null, y: null })) }], cur: 'old1' })); S = JSON.parse(localStorage.getItem('bahnplan.v1')); });
    await p.reload(); await p.waitForTimeout(600);
    console.log(sz, 'Altdaten:', await p.evaluate(() => { const t = track(); return JSON.stringify([t.starts.map(s => s.name + '@' + s.from), t.curves[1].o.lenkmittel, t.curves[1].cue]); }));
    // Altenberg mit drei Starts
    await p.locator('.tabs [data-v=bahnen]').click(); await p.locator('[data-a=add]').first().click(); await p.locator('[data-cat=altenberg]').click(); await p.waitForTimeout(1500);
    console.log(sz, 'Starts:', await p.locator('.startbar [data-start]').allTextContents());
    await p.locator('[data-a=placedone]').click().catch(() => {});
    await p.screenshot({ path: `s-${sz}-plan.png` });
    // Kurve 5, gemeinsame Fassung
    await p.locator('.crow[data-c="5"]').click(); await p.waitForTimeout(250);
    await p.locator('[data-k=cue]').fill('gemeinsam: früh rein');
    await p.locator('[data-o=spur] [data-v=Mitte]').click();
    await p.locator('[data-o=lenkmittel] [data-v="Wade / Kufe"]').click(); await p.locator('[data-o=lenkmittel] [data-v=Schulter]').click();
    await p.locator('[data-o=radius] [data-v=eng]').click();
    await p.locator('[data-o=fehlerbild] [data-v=Bandenkontakt]').click();
    await p.locator('[data-f=vorbild]').fill('Top 3 lenken erst am Bandenbeginn');
    await p.locator('[data-f=video]').fill('https://example.org/weltcup?t=95');
    await p.screenshot({ path: `s-${sz}-kurve.png` });
    // auf Damenstart wechseln und eigene Fassung anlegen
    await p.locator('.fassung [data-start]').nth(1).click(); await p.waitForTimeout(200);
    await p.locator('[data-a=ownon]').click(); await p.waitForTimeout(200);
    await p.locator('[data-k=cue]').fill('Damen: später rein, höher raus');
    await p.locator('[data-o=spur] [data-v=links]').click();
    await p.locator('[data-o=gefaelle] [data-v=steil]').click();
    await p.screenshot({ path: `s-${sz}-fassung.png` });
    await p.locator('.fassung [data-start]').nth(0).click(); await p.waitForTimeout(200);
    const herren = await p.evaluate(() => [document.querySelector('[data-k=cue]').value, document.querySelector('[data-o=spur] .on')?.dataset.v, document.querySelector('[data-o=gefaelle] .on')?.dataset.v, document.querySelectorAll('[data-o=lenkmittel] .on').length]);
    await p.locator('.fassung [data-start]').nth(1).click(); await p.waitForTimeout(200);
    const damen = await p.evaluate(() => [document.querySelector('[data-k=cue]').value, document.querySelector('[data-o=spur] .on')?.dataset.v, document.querySelector('[data-o=gefaelle] .on')?.dataset.v, !!document.querySelector('.fassung.own')]);
    console.log(sz, 'Herren:', JSON.stringify(herren), 'Damen:', JSON.stringify(damen));
    // Kurve 1 vom Damenstart nicht gefahren
    await p.locator('#sheetPane [data-a=close]').click(); await p.waitForTimeout(200);
    console.log(sz, 'Damen: nicht gefahren', await p.locator('.crow.off').count(), '| eigene Fassung markiert', await p.locator('.crow .own').count());
    // Starts: Zwischenzeiten und Paddeln
    await p.locator('.startbar [data-a=starts]').click(); await p.waitForTimeout(200);
    const sec = p.locator('#sheetPane section[data-sid]').nth(0);
    await sec.locator('[data-s=paddel]').fill('3'); await sec.locator('[data-szz] [data-v="5"]').click(); await sec.locator('[data-szz] [data-v="11"]').click();
    await p.locator('[data-a=sadd]').click(); await p.waitForTimeout(150);
    console.log(sz, 'Starts jetzt:', await p.locator('#sheetPane section[data-sid]').count());
    await p.screenshot({ path: `s-${sz}-starts.png` });
    await p.locator('#sheetPane [data-a=close]').click();
    // Läufe für Herrenstart
    await p.locator('#v-plan .startbar [data-start]').nth(0).click();
    await p.locator('.tabs [data-v=laeufe]').click(); await p.waitForTimeout(150);
    for (const [tm, zz] of [['52.381', ['12.1', '40.2']], ['52.104', ['12.0', '40.0']]]) {
      await p.locator('[data-a=runnew]').click(); await p.waitForTimeout(150);
      await p.locator('[name=time]').fill(tm); await p.locator('[name=startTime]').fill('3.51');
      await p.locator('[name=zz0]').fill(zz[0]); await p.locator('[name=zz1]').fill(zz[1]);
      await p.locator('[name=iceT]').fill('-6.5'); await p.locator('[data-rs=wetter] [data-v=Sonne]').click(); await p.locator('[data-rs=eis] [data-v=hart]').click();
      await p.locator('[data-rc] [data-v="9"]').click();
      await p.locator('#runForm [type=submit]').click(); await p.waitForTimeout(200);
    }
    console.log(sz, 'Läufe:', await p.locator('[data-run]').count(), '|', await p.locator('.stats').innerText().then(t => t.replace(/\n/g, ' ')), '|', await p.locator('.best').count(), 'Bestzeit-Markierung');
    await p.screenshot({ path: `s-${sz}-laeufe.png`, fullPage: true });
    // Buch Damen
    await p.locator('.tabs [data-v=buch]').click(); await p.locator('#v-buch .startbar [data-start]').nth(1).click(); await p.waitForTimeout(200);
    console.log(sz, 'Buch Damen:', await p.locator('.cv').count(), 'Kurven |', (await p.locator('.bookhead').innerText()).replace(/\n/g, ' ').slice(0, 80));
    const k5 = await p.locator('.cv').filter({ hasText: 'Damen: später rein' }).innerText();
    console.log(sz, 'Kurve 5 im Druck:', k5.replace(/\n/g, ' | ').slice(0, 260));
    // Durchgehen ab Damenstart
    await p.locator('.tabs [data-v=plan]').click(); await p.locator('[data-a=viz]').click(); await p.waitForTimeout(100);
    const v0 = await p.locator('.viz .bign b').textContent(); await p.locator('[data-a=viznext]').click();
    console.log(sz, 'Durchgehen:', v0, '->', await p.locator('.viz .bign b').textContent()); await p.locator('[data-a=vizclose]').click();
    // ohne Plan-Bild
    await p.locator('[data-a=mapmenu]').click(); await p.locator('#sheetPane [data-a=nomap]').click(); await p.waitForTimeout(200);
    console.log(sz, 'ohne Bild: Bildkarte', await p.locator('.mapcard').count(), '| Ausschnitt im Kurvenblatt', await (async () => { await p.locator('.crow[data-c="5"]').click(); await p.waitForTimeout(150); const n = await p.locator('#cropDraw').count(); await p.locator('#sheetPane [data-a=close]').click(); return n; })());
    await p.screenshot({ path: `s-${sz}-ohnebild.png`, fullPage: true });
    // Felder einklappen bleibt erhalten
    await p.reload(); await p.waitForTimeout(700);
    const st = await p.evaluate(() => { const t = track(), c = t.curves[4], d = t.starts[1]; return [t.starts.length, t.starts[0].zz.join(','), t.starts[0].paddel, c.cue, c.o.spur, c.o.lenkmittel.join('+'), c.v[d.id] && c.v[d.id].cue, c.v[d.id] && c.v[d.id].o.spur, c.o.gefaelle, t.runs.length, S.showMap]; });
    console.log(sz, 'gespeichert:', JSON.stringify(st));
    console.log(sz, 'Überlauf:', await p.evaluate(w => innerWidth - w + document.documentElement.scrollWidth - innerWidth, w));
    if (sz === 'p') { await p.locator('.tabs [data-v=buch]').click(); await p.waitForTimeout(200); await p.emulateMedia({ media: 'print' }); await p.pdf({ path: 'bahnplan-druck2.pdf', format: 'A4', printBackground: true }); await p.emulateMedia({ media: 'screen' }); }
    const q = await ctx.newPage(); q.on('pageerror', e => errs.push(sz + ' emb ' + e.message));
    await q.goto(U + '/planer/training/?einzeln#bahnplan/laeufe'); await q.waitForTimeout(2200);
    console.log(sz, 'eingebettet Läufe:', await q.frameLocator('iframe[src="bahnplan/"]').locator('.tabs [data-v=laeufe]').getAttribute('class'));
    await q.screenshot({ path: `s-${sz}-emb.png` });
    await ctx.close();
  }
  console.log('FEHLER', errs); await b.close();
})();
