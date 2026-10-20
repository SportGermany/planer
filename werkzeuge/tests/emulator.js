// Test der echten APK im Android-Emulator (läuft auf GitHub, Job „emulator“ in .github/workflows/apk.yml).
// Verbindet sich über adb mit dem WebView der App (Test-APK ist debugbar) und prüft: Start in der Hülle, Leiste sichtbar,
// alle Bereiche laden, Handykalender (Kalender „Planer“ im Android-Kalender), Erinnerungen, keine Fehler.
// Bildschirmfotos landen in $OUT (Standard ./emu-out) und werden als Artefakt hochgeladen.
const { _android: android } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const OUT = process.env.OUT || 'emu-out', PKG = 'de.sportgermany.planer';
fs.mkdirSync(OUT, { recursive: true });
let bad = 0; const lines = [];
const ok = (c, m) => { const l = (c ? '✓ ' : '✗ ') + m; console.log(l); lines.push(l); if (!c) bad++; };
const sh = c => { try { return execSync('adb shell ' + c, { encoding: 'utf8', timeout: 60000 }); } catch (e) { return String(e.stdout || '') + String(e.stderr || ''); } };
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const [dev] = await android.devices();
  ok(!!dev, 'Emulator verbunden: ' + (dev && dev.model()));
  await dev.shell('am force-stop ' + PKG);
  await dev.shell('am start -n ' + PKG + '/.MainActivity');
  await wait(8000);
  const wv = await dev.webView({ pkg: PKG }, { timeout: 60000 });
  const page = await wv.page();
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const logcat = async (name) => {
    const lc = execSync('adb logcat -d -t 1500', { encoding: 'utf8', maxBuffer: 1 << 24 }).split('\n').filter(l => /Capacitor|chromium|Console|WebView|AndroidRuntime|planer|FATAL|lowmemory|ActivityManager.*(Kill|died)|crash|renderer/i.test(l)).slice(-200).join('\n');
    fs.writeFileSync(OUT + '/logcat-' + name + '.txt', lc); console.log('--- logcat ' + name + ' ---\n' + lc.split('\n').slice(-60).join('\n'));
    await dev.screenshot({ path: OUT + '/x-' + name + '.png' }).catch(() => {});
  };
  const diag = async (why) => {
    console.log('DIAGNOSE (' + why + ')');
    await dev.screenshot({ path: OUT + '/0-diagnose.png' }).catch(() => {});
    const d = await page.evaluate(() => ({ url: location.href, title: document.title, ready: document.readyState, html: document.documentElement.outerHTML.slice(0, 1500),
      frames: [...document.querySelectorAll('iframe')].map(f => f.src) })).catch(e => ({ err: String(e) }));
    console.log(JSON.stringify(d, null, 1));
    const lc = execSync('adb logcat -d -t 400', { encoding: 'utf8', maxBuffer: 1 << 24 }).split('\n').filter(l => /Capacitor|chromium|Console|WebView|AndroidRuntime|planer|FATAL/i.test(l)).slice(-120).join('\n');
    console.log(lc); fs.writeFileSync(OUT + '/logcat.txt', lc);
  };
  console.log('Seiten im WebView:', page.url());
  try { await page.waitForSelector('#nav button', { timeout: 30000 }); } catch (e) { await diag('Leiste fehlt'); throw e; }
  await wait(2500);
  await dev.screenshot({ path: OUT + '/1-start.png' });
  const info = await page.evaluate(() => ({ url: location.href, native: !!window.SGNative, ver: window.SGVersion, sheet: document.getElementById('sheet').textContent.slice(0, 80),
    nav: (() => { const r = document.getElementById('nav').getBoundingClientRect(); return [r.top, r.bottom, innerHeight, r.height]; })(),
    bot: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') }));
  ok(/\/planer\/app\/(#.*)?$/.test(info.url), 'Start in der Hülle: ' + info.url);
  ok(info.native, 'App erkennt die Android-Umgebung (SGNative), Version ' + info.ver);
  ok(info.nav[3] >= 50 && info.nav[1] <= info.nav[2] + 1 && info.nav[0] > 0, 'Untere Leiste sichtbar und im Bild ' + JSON.stringify(info.nav) + ' Rand unten ' + info.bot);
  ok(/Willkommen in der Android-App/.test(info.sheet), 'Willkommen mit Umzug beim ersten Start');
  // Berechtigungen wie nach dem Antippen von „Erlauben“
  sh('pm grant ' + PKG + ' android.permission.READ_CALENDAR'); sh('pm grant ' + PKG + ' android.permission.WRITE_CALENDAR'); sh('pm grant ' + PKG + ' android.permission.POST_NOTIFICATIONS');
  sh('appops set ' + PKG + ' SCHEDULE_EXACT_ALARM allow');
  // ein Handytermin in einem eigenen lokalen Kalender (wie Samsung „Mein Kalender“)
  sh('"content insert --uri \'content://com.android.calendar/calendars?caller_is_syncadapter=true&account_name=Test&account_type=LOCAL\' --bind account_name:s:Test --bind account_type:s:LOCAL --bind name:s:mein --bind calendar_displayName:s:\'Mein Kalender\' --bind calendar_color:i:-13388315 --bind calendar_access_level:i:700 --bind ownerAccount:s:Test --bind visible:i:1 --bind sync_events:i:1"');
  const calId = ((sh('content query --uri content://com.android.calendar/calendars --projection _id:calendar_displayName') || '').match(/_id=(\d+), calendar_displayName=Mein Kalender/) || [])[1];
  const t0 = Date.now() + 2 * 864e5;
  if (calId) sh('"content insert --uri content://com.android.calendar/events --bind calendar_id:i:' + calId + ' --bind title:s:Arzttermin --bind dtstart:l:' + t0 + ' --bind dtend:l:' + (t0 + 3600e3) + ' --bind eventTimezone:s:Europe/Berlin"');
  ok(!!calId, 'Handykalender „Mein Kalender“ mit einem Termin vorbereitet (id ' + calId + ')');
  // „Neu anfangen“ → „Beides einschalten“
  await page.click('#sheet [data-s=fresh]'); await wait(800);
  ok(/Fast fertig/.test(await page.textContent('#sheet')), 'Einrichtung: Handykalender und Erinnerungen');
  await page.evaluate(() => SharedCalendar.add({ title: 'Emulator-Training', date: new Date(Date.now() + 864e5).toISOString().slice(0, 10), time: '17:00', end: '18:00', app: 'Training', remind: 15 }));
  await page.click('#sheet [data-s=both]'); await wait(6000);
  await dev.screenshot({ path: OUT + '/2-eingerichtet.png' });
  const hs = await page.evaluate(() => ({ h: SharedCalendar.handy.state(), r: SharedCalendar.erinnern.state() }));
  ok(hs.h.on && hs.h.calId > 0 && !hs.h.err, 'Handykalender an, Kalender „Planer“ angelegt (id ' + hs.h.calId + ')' + (hs.h.err ? ' Fehler: ' + hs.h.err : ''));
  const evs = sh('content query --uri content://com.android.calendar/events --projection title:calendar_id --where "calendar_id=' + hs.h.calId + '"');
  ok(/Rodeltraining|Emulator-Training/.test(evs) || /Emulator-Training/.test(evs), 'Termine der App stehen im Android-Kalender „Planer“ (' + (evs.match(/Row:/g) || []).length + ' Einträge)');
  ok((hs.h.cache.events || []).some(e => e.title === 'Arzttermin'), 'Handytermin „Arzttermin“ erscheint in der App');
  const pend = await page.evaluate(() => window.Capacitor.Plugins.LocalNotifications.getPending());
  ok(hs.r.on && (pend.notifications || []).some(n => /Emulator-Training/.test(n.title)), 'Erinnerungen geplant (' + (pend.notifications || []).length + ')' + (hs.r.err ? ' Fehler: ' + hs.r.err : ''));
  // Bereiche durchgehen: jede Seite lädt, Leiste bleibt sichtbar
  for (const h of ['kalender', 'training/heute', 'training/rodeln', 'training/wissen', 'mobility/mobility', 'mobility/atmung', 'schule', 'mehr', 'bibel', 'pause', 'notizen', 'aufgaben']) {
    try { await page.evaluate(h => { location.hash = h; }, h); } catch (e) { ok(false, 'Bereich ' + h + ': Verbindung zur App weg (' + e.message + ')'); await logcat('abbruch-' + h.replace(/\//g, '_')); throw e; }
    await wait(2500);
    const r = await page.evaluate(() => { const n = document.getElementById('nav').getBoundingClientRect(), f = document.querySelector('#stage iframe.on'), nat = document.querySelector('.native.on');
      let txt = 0; try { txt = f ? f.contentDocument.body.innerText.length : (nat ? nat.innerText.length : 0); } catch (e) { txt = -1; }
      return { nav: n.bottom <= innerHeight + 1 && n.height >= 50, txt, path: f ? f.contentWindow.location.pathname : 'native' }; });
    ok(r.nav && r.txt > 20, 'Bereich ' + h + ': lädt (' + r.path + ', ' + r.txt + ' Zeichen), Leiste sichtbar');
    await dev.screenshot({ path: OUT + '/3-' + h.replace(/\//g, '_') + '.png' });
  }
  // Tastatur öffnen und schließen: Leiste muss danach wieder da sein
  await page.evaluate(() => { location.hash = 'notizen'; }); await wait(1500);
  await page.click('#n-notizen input, #n-notizen textarea').catch(() => {}); await wait(1500);
  await dev.screenshot({ path: OUT + '/4-tastatur.png' });
  await dev.shell('input keyevent 4'); await wait(1500);
  const after = await page.evaluate(() => { const n = document.getElementById('nav').getBoundingClientRect(); return [n.top, n.bottom, innerHeight]; });
  ok(after[1] <= after[2] + 1 && after[0] > 0, 'Nach der Tastatur ist die Leiste wieder im Bild ' + JSON.stringify(after));
  ok(!errs.length, 'Keine Fehler in der App' + (errs.length ? ': ' + errs.slice(0, 5).join(' | ') : ''));
  fs.writeFileSync(OUT + '/ergebnis.txt', lines.join('\n') + '\n');
  await dev.close();
  console.log(bad ? bad + ' FEHLER' : 'Emulator-Test grün'); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); fs.writeFileSync(OUT + '/ergebnis.txt', lines.join('\n') + '\nABBRUCH: ' + e.message + '\n'); process.exit(1); });
