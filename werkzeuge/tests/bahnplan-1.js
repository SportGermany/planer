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
    p.on('console', m => m.type() === 'error' && !/favicon/.test(m.text()) && errs.push(sz + ' console ' + m.text()));
    await p.goto(U + '/planer/training/bahnplan/?einzeln'); await p.waitForTimeout(600);
    await p.locator('[data-a=add]').first().click(); await p.locator('[data-cat=winterberg]').click(); await p.waitForTimeout(1500);
    const st1 = await p.evaluate(() => [track().map && track().map.src, track().map && track().map.title, !!document.querySelector('#imgwrap img'), !!document.querySelector('.placebar'), document.querySelector('.credit') && document.querySelector('.credit').textContent]);
    console.log(sz, 'Auto-Wiki:', JSON.stringify(st1));
    await p.screenshot({ path: `w-${sz}-plan.png` });
    // drei Nummern setzen
    for (const [fx, fy] of [[220 / 700, 90 / 900], [260 / 700, 200 / 900], [150 / 700, 300 / 900]]) {
      await p.locator('#imgwrap').scrollIntoViewIfNeeded(); const r = await p.locator('#imgwrap').boundingBox();
      await p.mouse.click(r.x + r.width * fx, r.y + r.height * fy); await p.waitForTimeout(150);
    }
    console.log(sz, 'Pins:', await p.locator('#imgwrap .pin').count(), 'als nächstes:', await p.locator('.placebar b').textContent().catch(() => '-'));
    await p.locator('[data-a=placedone]').click(); await p.waitForTimeout(150);
    await p.locator('#imgwrap .pin[data-c="2"]').click(); await p.waitForTimeout(300);
    console.log(sz, 'Kurvenblatt:', await p.locator('#sheetPane h2').textContent(), 'Ausschnitt:', await p.locator('#cropDraw').count());
    await p.locator('[data-a=drawtoggle]').click(); await p.waitForTimeout(150);
    await p.locator('#cropDraw').scrollIntoViewIfNeeded(); const cb = await p.locator('#cropDraw').boundingBox();
    await p.mouse.move(cb.x + 30, cb.y + 30); await p.mouse.down(); await p.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2, { steps: 6 }); await p.mouse.move(cb.x + cb.width - 30, cb.y + 40, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(250);
    await p.locator('[data-a=zin]').click(); await p.waitForTimeout(100);
    await p.locator('[data-o=radius] [data-v=eng]').click(); await p.locator('[data-o=druck] [data-v=hoch]').click(); await p.locator('[data-o=prio] [data-v=Schlüsselkurve]').click();
    await p.locator('[data-ok=speed]').fill('118');
    await p.locator('[data-k=cue]').fill('L2 früh hoch, Druck halten');
    await p.locator('[data-f=eisschnell]').fill('Später einlenken');
    await p.screenshot({ path: `w-${sz}-kurve.png` });
    // eigenes Feld
    await p.locator('#sheetPane [data-a=fields]').first().click(); await p.waitForTimeout(150);
    await p.locator('#cfNew').fill('Kufenstellung'); await p.locator('[data-a=cfadd]').click(); await p.waitForTimeout(100);
    await p.locator('[data-hide=Bedingungen]').uncheck(); await p.locator('[data-hide=Bedingungen]').check();
    await p.locator('[data-a=close]').click(); await p.waitForTimeout(150);
    await p.locator('.crow[data-c="2"]').click(); await p.waitForTimeout(200);
    await p.locator('[data-f^=c_]').fill('leicht nach innen');
    await p.locator('#sheetPane [data-a=close]').click(); await p.waitForTimeout(500);
    await p.reload(); await p.waitForTimeout(800);
    const st2 = await p.evaluate(() => { const c = track().curves[1]; return [c.line.length, c.zoom, c.o.radius, c.o.druck, c.o.prio, c.o.speed, c.cue, c.f.eisschnell, Object.keys(c.f).find(k => k.startsWith('c_')) ? 'eigenes Feld ok' : 'fehlt', !!document.querySelector('#imgwrap img')]; });
    console.log(sz, 'gespeichert:', JSON.stringify(st2));
    // anderer Wikipedia-Plan
    await p.locator('[data-a=mapmenu]').click(); await p.locator('#sheetPane [data-a=wiki]').click(); await p.waitForTimeout(800);
    console.log(sz, 'Auswahl:', await p.locator('.wimg').count(), 'Bilder');
    await p.screenshot({ path: `w-${sz}-wiki.png` });
    await p.locator('.wimg').nth(1).click(); await p.waitForTimeout(800);
    console.log(sz, 'neuer Plan:', await p.evaluate(() => track().map.title));
    // groß
    await p.locator('[data-a=zoom]').click(); await p.waitForTimeout(200); await p.locator('[data-a=zzin]').click(); await p.waitForTimeout(150);
    await p.screenshot({ path: `w-${sz}-zoom.png` });
    await p.locator('.zoomwrap .pin[data-c="1"]').click(); await p.waitForTimeout(200);
    console.log(sz, 'Pin im Großbild öffnet:', await p.locator('#sheetPane h2').textContent());
    await p.locator('#sheetPane [data-a=close]').click(); await p.waitForTimeout(200);
    // Durchgehen
    await p.locator('[data-a=viz]').click(); await p.locator('[data-a=viznext]').click(); await p.waitForTimeout(150);
    console.log(sz, 'Durchgehen Ausschnitt:', await p.locator('.viz .crop').count());
    await p.screenshot({ path: `w-${sz}-viz.png` }); await p.locator('[data-a=vizclose]').click();
    // Buch und Druck
    await p.locator('.tabs [data-v=buch]').click(); await p.waitForTimeout(300);
    console.log(sz, 'Buch:', await p.locator('.bmap img').count(), 'Plan,', await p.locator('.cv').count(), 'Kurven,', await p.locator('.cv.wcrop').count(), 'mit Ausschnitt', '|', await p.locator('.bmap .credit').textContent());
    await p.locator('[data-popt=empty]').click(); await p.waitForTimeout(100);
    console.log(sz, 'nur mit Notizen:', await p.locator('.cv').count());
    await p.screenshot({ path: `w-${sz}-buch.png`, fullPage: true });
    if (sz === 'p') { await p.emulateMedia({ media: 'print' }); await p.pdf({ path: 'bahnplan-druck.pdf', format: 'A4', printBackground: true }); await p.screenshot({ path: 'w-print.png', fullPage: true }); await p.emulateMedia({ media: 'screen' }); await p.locator('[data-popt=empty]').click(); }
    console.log(sz, 'Überlauf:', await p.evaluate(w => innerWidth - w + document.documentElement.scrollWidth - innerWidth, w));
    // eigene Bahn ohne Netz
    await ctx.unroute(/wikipedia\.org|wikimedia\.org/); await mock(ctx, false);
    await p.locator('.tabs [data-v=bahnen]').click(); await p.locator('[data-a=add]').first().click();
    await p.locator('#cuName').fill('Naturbahn Test'); await p.locator('[data-a=custom]').click(); await p.waitForTimeout(800);
    console.log(sz, 'ohne Netz:', (await p.locator('#wikiRes').textContent()).slice(0, 50));
    await p.locator('#sheetPane [data-a=close]').click(); await p.waitForTimeout(200);
    await p.locator('#imgIn').setInputFiles(require('os').tmpdir() + '/fakemap.png'); await p.waitForTimeout(800);
    console.log(sz, 'eigenes Bild:', await p.evaluate(() => [track().map.src, !!document.querySelector('.placebar')]).then(JSON.stringify));
    await p.close();
    const q = await ctx.newPage(); q.on('pageerror', e => errs.push(sz + ' emb ' + e.message));
    await q.goto(U + '/planer/training/?einzeln#bahnplan/buch'); await q.waitForTimeout(2200);
    const fr = q.frameLocator('iframe[src="bahnplan/"]');
    console.log(sz, 'eingebettet Buch:', await fr.locator('.tabs [data-v=buch]').getAttribute('class'));
    await q.screenshot({ path: `w-${sz}-emb.png` });
    await ctx.close();
  }
  console.log('FEHLER', errs); await b.close();
})();
