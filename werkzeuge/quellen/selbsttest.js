/* Selbsttest für jede App (werkzeuge/PLAN-EINZEL.md 0b) – läuft auf dem echten Handy und schreibt einen Bericht:
 *   ✓ klappt · ⚠ langsam/auffällig · ✗ geht nicht
 * Prüft: jede Ansicht (Reiter) öffnet ohne Fehler und schnell, kein seitliches Überlaufen, Knöpfe groß genug und nicht verdeckt,
 * nichts Bedienbares unter der Leiste, keine Emojis in Bedienelementen, Scrollen flüssig, Speicher, Android-Teile (Rechte,
 * Benachrichtigungen, Kalender, Übergabe zwischen den Apps), Netz/Update, Cloud, Fehler seit dem Start (SGFehler aus design.js).
 * Apps melden eigene Prüfungen an: SGSelbsttest.add("Name", async () => ({ ok: true|false|"warn", text: "…" })).
 * Nutzerdaten werden nicht verändert: Speicher-Test und App-Prüfungen räumen ihre Testdaten wieder weg.
 * Ohne Oberfläche (Tests auf dem Rechner/Emulator): SGSelbsttest.run().then(r => r.text). */
(function () {
  "use strict";
  var ST = window.SGSelbsttest = window.SGSelbsttest || {};
  if (ST.ready) return;
  var eigene = window.SGSelbsttestEigene || [];
  ST.add = function (name, fn) { eigene.push([name, fn]); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var frame = function () { return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); }); };
  var withTimeout = function (p, ms) { return Promise.race([p, wait(ms).then(function () { throw new Error("keine Antwort nach " + ms / 1000 + " s"); })]); };
  var APPNAME = { planer: "Planer", training: "Training", schule: "Schule", bibel: "Bibel" };
  var EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u;

  function navButtons() {
    var sels = [".sg-nav > button", "#nav > button", "#tabs > .tab", "#nav > .tab"];
    for (var i = 0; i < sels.length; i++) {
      var l = Array.prototype.filter.call(document.querySelectorAll(sels[i]), function (b) { return !b.hidden && b.getBoundingClientRect().width > 0; });
      if (l.length >= 2) return l;
    }
    return [];
  }
  function navTop() { var b = navButtons()[0]; var n = b && b.parentElement; while (n && n !== document.body && getComputedStyle(n).position !== "fixed") n = n.parentElement; return n && n !== document.body ? n.getBoundingClientRect().top : innerHeight; }
  function label(el) { return ((el.getAttribute("aria-label") || el.textContent || el.title || el.id || el.className || "?") + "").replace(/\s+/g, " ").trim().slice(0, 40); }
  function visible(el) { var r = el.getBoundingClientRect(); if (!r.width || !r.height) return false; var cs = getComputedStyle(el); return cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.05; }
  function interactive() {
    var nb = navButtons();
    return Array.prototype.filter.call(document.querySelectorAll("button, a[href], input:not([type=hidden]), select, textarea, [data-a], [role=button]"), function (el) {
      if (!visible(el) || nb.indexOf(el) >= 0 || el.closest("#sgSelbsttest, #sg-shared-calendar, .overlay:not(.show), [hidden]")) return false;
      return true;
    });
  }

  // Prüfung einer Ansicht: Überlauf, zu kleine/verdeckte Knöpfe, unter der Leiste, Emojis
  function checkView(name, out) {
    var over = document.documentElement.scrollWidth - innerWidth;
    out.push(over > 1 ? ["fail", name, "Seite läuft seitlich über (" + over + " px breiter als der Bildschirm)"] : ["ok", name, "kein seitliches Überlaufen"]);
    // Liegt ein Fenster (Einrichtung, Hinweis, Blatt) über der Seite? Dann das melden statt jedes Element einzeln
    var mid = document.elementFromPoint(innerWidth / 2, innerHeight / 2), modal = null;
    for (var m = mid; m && m !== document.body && m !== document.documentElement; m = m.parentElement || (m.getRootNode && m.getRootNode().host)) {
      var cs = getComputedStyle(m); if ((cs.position === "fixed" || cs.position === "absolute") && m.getBoundingClientRect().height > innerHeight * .4 && !m.closest(".sg-app, main")) { modal = m; break; }
    }
    if (modal && !modal.closest("#sgSelbsttest")) { out.push(["warn", name, "Fenster offen: „" + label(modal) + "“ – Ansicht dahinter nicht geprüft"]); return; }
    var els = interactive(), small = [], covered = [], emo = [], nt = navTop();
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top >= innerHeight || r.bottom <= 0) return;
      var af = getComputedStyle(el, "::after"), hitW = Math.max(r.width, parseFloat(af.width) || 0), hitH = Math.max(r.height, parseFloat(af.height) || 0);
      if ((hitH < 32 || hitW < 32) && el.tagName !== "INPUT" && el.tagName !== "TEXTAREA" && !/^(sup|span)$/i.test(el.tagName)) small.push(label(el) + " (" + Math.round(r.width) + "×" + Math.round(r.height) + ")");
      var cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
      var hit = document.elementFromPoint(cx, cy);
      if (hit && hit !== el && !el.contains(hit) && !hit.contains(el)) {
        if (cy > nt - 2) return;   // liegt gerade unter der Leiste, wird beim Scrollen frei (eigene Prüfung unten)
        var nb0 = navButtons()[0]; if (nb0 && (hit.closest("nav, .sg-nav, .tabs") || nb0.parentElement.contains(hit))) return;
        if (!hit.closest("#sgSelbsttest, #sgSelbsttestP")) covered.push(label(el) + " ← " + label(hit));
      }
      if (EMOJI.test(el.textContent || "") && el.closest(".tab, .sg-nav, nav, .toolbar, .qa-btn, .sg-btn, .btn")) emo.push(label(el));
    });
    out.push(small.length ? ["warn", name, small.length + " Tippfläche(n) kleiner als 32 px: " + small.slice(0, 4).join(", ")] : ["ok", name, "alle Tippflächen groß genug"]);
    out.push(covered.length ? ["fail", name, covered.length + " Element(e) verdeckt: " + covered.slice(0, 3).join("; ")] : ["ok", name, "nichts verdeckt"]);
    if (emo.length) out.push(["warn", name, "Emoji statt Symbol in Bedienelement: " + emo.slice(0, 3).join(", ")]);
  }
  // Ganz nach unten scrollen: Letztes Bedienelement muss über der Leiste stehen; dabei Bildrate messen
  function scrollCheck(name, out) {
    var sc = document.scrollingElement || document.documentElement, max = sc.scrollHeight - innerHeight;
    if (max < 40) return Promise.resolve();
    var frames = 0, t0 = performance.now(), run = true;
    (function tick() { if (!run) return; frames++; requestAnimationFrame(tick); })();
    var steps = 12, i = 0;
    return new Promise(function (done) {
      (function step() {
        i++; sc.scrollTop = max * i / steps;
        if (i < steps) return setTimeout(step, 40);
        setTimeout(function () {
          run = false;
          var fps = Math.round(frames / ((performance.now() - t0) / 1000));
          out.push(fps < 40 ? ["warn", name, "Scrollen ruckelt (" + fps + " Bilder/s)"] : ["ok", name, "Scrollen flüssig (" + fps + " Bilder/s)"]);
          var nt = navTop(), last = interactive().filter(function (el) { var r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; })
            .sort(function (a, b) { return b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom; })[0];
          if (last) { var lb = last.getBoundingClientRect().bottom; out.push(lb > nt + 1 ? ["fail", name, "„" + label(last) + "“ bleibt unter der Leiste (" + Math.round(lb - nt) + " px)"] : ["ok", name, "unten nichts unter der Leiste"]); }
          sc.scrollTop = 0; done();
        }, 120);
      })();
    });
  }

  function device() {
    var ua = navigator.userAgent, and = /Android ([\d.]+)/.exec(ua), cr = /Chrome\/([\d.]+)/.exec(ua), model = /Android [\d.]+; ([^;)]+)/.exec(ua);
    return { app: (APPNAME[window.SGApp] || window.SGApp || "Planer"), ver: window.SGVersion || "?", nativ: !!window.SGNative,
      geraet: (model ? model[1].replace(/ Build.*/, "") : "") + (and ? " · Android " + and[1] : ""), webview: cr ? "WebView/Chrome " + cr[1] : ua.slice(0, 60),
      bild: innerWidth + "×" + innerHeight + " @" + (window.devicePixelRatio || 1) + "x", zeit: new Date().toLocaleString("de-DE") };
  }

  ST.run = function (progress) {
    var out = [], say = progress || function () {};
    var add = function (st, b, t) { out.push([st, b, t]); };
    var F = window.SGFehler || { list: [], long: [] }, fehler0 = F.list.length;
    var startView = navButtons().filter(function (b) { return /\b(on|active)\b/.test(b.className); })[0];
    return Promise.resolve().then(function () {
      // Start
      say("Start und Ladezeit …");
      var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      var load = nav ? Math.round(nav.loadEventEnd || nav.domContentLoadedEventEnd) : 0;
      if (load) add(load > 3000 ? "warn" : "ok", "Start", "Seite geladen in " + load + " ms");
      var lt = F.long.filter(function (x) { return x.ms >= 50; });
      if (lt.length) add(lt.some(function (x) { return x.ms > 300; }) ? "warn" : "ok", "Start", lt.length + " lange Aufgabe(n) seit dem Start, längste " + Math.max.apply(null, lt.map(function (x) { return x.ms; })) + " ms");
      else add("ok", "Start", "keine Ruckler seit dem Start");
      if (performance.memory) add(performance.memory.usedJSHeapSize > 150e6 ? "warn" : "ok", "Start", "Speicherbedarf " + Math.round(performance.memory.usedJSHeapSize / 1e6) + " MB");
    }).then(function () {
      // Ansichten durchgehen
      var bs = navButtons();
      if (!bs.length) { add("warn", "Leiste", "keine untere Leiste gefunden"); return; }
      var ws = bs.map(function (b) { return Math.round(b.getBoundingClientRect().width); });
      add(Math.max.apply(null, ws) - Math.min.apply(null, ws) > 1 ? "fail" : "ok", "Leiste", bs.length + " Reiter, Breiten " + ws.join("/") + " px");
      add(bs.length === 4 ? "ok" : "warn", "Leiste", bs.length === 4 ? "4 Reiter wie in allen Apps" : bs.length + " Reiter (Ziel: 4)");
      var chain = Promise.resolve();
      bs.forEach(function (b) {
        chain = chain.then(function () {
          var name = "Ansicht " + label(b), e0 = F.list.length, t0 = performance.now();
          say(name + " …");
          b.click();
          return frame().then(function () {
            var ms = Math.round(performance.now() - t0);
            add(ms > 400 ? "warn" : "ok", name, "öffnet in " + ms + " ms");
            return wait(350);
          }).then(function () {
            var on = /\b(on|active)\b/.test(b.className); if (!on) add("fail", name, "Reiter ist nach dem Antippen nicht markiert");
            checkView(name, out);
            return scrollCheck(name, out);
          }).then(function () {
            var neu = F.list.slice(e0);
            if (neu.length) add("fail", name, neu.length + " Fehler beim Öffnen: " + neu.slice(0, 2).map(function (x) { return x.msg; }).join(" | "));
          });
        });
      });
      return chain.then(function () { if (startView) startView.click(); });
    }).then(function () {
      // Speicher
      say("Speicher …");
      try { var k = "sg-selbsttest-probe", v = String(Date.now()); localStorage.setItem(k, v); var ok = localStorage.getItem(k) === v; localStorage.removeItem(k); add(ok ? "ok" : "fail", "Speicher", ok ? "Speichern und Lesen klappt" : "gespeicherter Wert kommt nicht zurück"); }
      catch (e) { add("fail", "Speicher", "Speichern nicht möglich: " + e.message); }
      var n = 0; try { for (var i = 0; i < localStorage.length; i++) n += (localStorage.getItem(localStorage.key(i)) || "").length; } catch (e) {}
      add(n > 4e6 ? "warn" : "ok", "Speicher", "App-Daten " + Math.round(n / 1024) + " KB");
      if (navigator.storage && navigator.storage.estimate) return withTimeout(navigator.storage.estimate(), 3000).then(function (e) { add("ok", "Speicher", "gesamt belegt " + Math.round((e.usage || 0) / 1e6) + " MB von " + Math.round((e.quota || 0) / 1e6) + " MB"); }).catch(function () {});
    }).then(function () {
      // Android-Teile
      say("Android …");
      var C = window.Capacitor, P = C && C.Plugins;
      if (!window.SGNative || !P) { add("warn", "Android", "nicht in der APK – Android-Teile werden nur dort geprüft"); return; }
      var tasks = [];
      if (P.LocalNotifications) tasks.push(withTimeout(P.LocalNotifications.checkPermissions(), 4000).then(function (r) {
        add(r.display === "granted" ? "ok" : "warn", "Android", "Benachrichtigungen: " + (r.display === "granted" ? "erlaubt" : "nicht erlaubt (" + r.display + ")"));
        return withTimeout(P.LocalNotifications.getPending(), 4000).then(function (p) { add("ok", "Android", (p.notifications || []).length + " Erinnerung(en) geplant"); });
      }).catch(function (e) { add("fail", "Android", "Benachrichtigungen: " + e.message); }));
      if (P.PlanerKalender && P.PlanerKalender.status) tasks.push(withTimeout(P.PlanerKalender.status(), 4000).then(function (r) {
        var g = r && r.permission; add(g === "granted" ? "ok" : "warn", "Android", "Kalenderrecht: " + (g === "granted" ? "erlaubt" + (r.calendarId > 0 ? ", Kalender „Planer“ vorhanden" : "") : "nicht erlaubt (" + g + ")"));
      }).catch(function (e) { add("warn", "Android", "Kalenderrecht nicht abfragbar: " + e.message); }));
      if (P.PlanerSystem && P.PlanerSystem.installed) tasks.push(withTimeout(P.PlanerSystem.installed({ pkgs: ["de.sportgermany.planer", "de.sportgermany.training", "de.sportgermany.schule", "de.sportgermany.bibel"] }), 4000).then(function (r) {
        var l = (r && r.installed) || []; add("ok", "Apps", "installiert: " + (l.length ? l.map(function (p) { return p.replace("de.sportgermany.", ""); }).join(", ") : "keine"));
      }).catch(function (e) { add("warn", "Apps", "Abfrage installierter Apps: " + e.message); }));
      return Promise.all(tasks);
    }).then(function () {
      // Netz und Update (ohne Netz ist alles in Ordnung – die Apps laufen offline)
      say("Netz und Update …");
      if (!navigator.onLine) { add("ok", "Netz", "offline – App läuft ohne Internet"); return; }
      var t0 = performance.now();
      return withTimeout(fetch("https://api.github.com/repos/SportGermany/planer/releases?per_page=1", { cache: "no-store" }), 6000).then(function (r) {
        add(r.ok ? "ok" : "warn", "Update", r.ok ? "Update-Prüfung erreichbar (" + Math.round(performance.now() - t0) + " ms)" : "GitHub antwortet mit " + r.status);
      }).catch(function (e) { add("warn", "Update", "Update-Prüfung nicht erreichbar: " + e.message); });
    }).then(function () {
      // Cloud
      say("Cloud …");
      var C = window.SharedCalendar;
      var cfg = null; try { cfg = JSON.parse(localStorage.getItem("sg-shared-calendar-sync") || "null"); } catch (e) {}
      if (!cfg || !cfg.token) { add("warn", "Cloud", "Cloud-Sicherung nicht eingerichtet"); return; }
      var st = C && C.status ? C.status() : null, last = cfg.last;
      if (st && st.error && !st.offline) add("fail", "Cloud", "letzter Abgleich mit Fehler: " + st.error);
      else add(last && Date.now() - last > 7 * 864e5 ? "warn" : "ok", "Cloud", "eingerichtet" + (last ? ", zuletzt abgeglichen " + new Date(last).toLocaleString("de-DE") : ", noch nie abgeglichen") + (st && st.offline ? " (gerade offline)" : ""));
    }).then(function () {
      // eigene Prüfungen der App
      var chain = Promise.resolve();
      eigene.forEach(function (x) {
        chain = chain.then(function () {
          say(x[0] + " …"); var t0 = performance.now(), e0 = F.list.length;
          return withTimeout(Promise.resolve().then(x[1]), 8000).then(function (r) {
            r = r || {}; var ms = Math.round(performance.now() - t0);
            add(r.ok === true ? (ms > 1500 ? "warn" : "ok") : r.ok === "warn" ? "warn" : "fail", x[0], (r.text || (r.ok ? "klappt" : "geht nicht")) + " (" + ms + " ms)");
            var neu = F.list.slice(e0); if (neu.length) add("fail", x[0], "Fehler dabei: " + neu[0].msg);
          }).catch(function (e) { add("fail", x[0], e.message || String(e)); });
        });
      });
      return chain;
    }).then(function () {
      // Fehler seit dem Start (vor dem Test)
      var alt = F.list.slice(0, fehler0);
      add(alt.length ? "fail" : "ok", "Fehler", alt.length ? alt.length + " Fehler seit dem Start: " + alt.slice(0, 3).map(function (x) { return x.msg + (x.where ? " (" + x.where + ")" : ""); }).join(" | ") : "keine Fehler seit dem Start");
      var d = device(), order = { fail: 0, warn: 1, ok: 2 }, sym = { fail: "✗", warn: "⚠", ok: "✓" };
      var sorted = out.slice().sort(function (a, b) { return order[a[0]] - order[b[0]]; });
      var n = { fail: 0, warn: 0, ok: 0 }; out.forEach(function (x) { n[x[0]]++; });
      var text = "Selbsttest " + d.app + " " + d.ver + " · " + d.zeit + "\n" + (d.geraet || "Gerät unbekannt") + " · " + d.webview + " · " + d.bild + (d.nativ ? " · APK" : " · Browser") +
        "\nErgebnis: " + n.fail + " ✗ · " + n.warn + " ⚠ · " + n.ok + " ✓\n\n" + sorted.map(function (x) { return sym[x[0]] + " " + x[1] + ": " + x[2]; }).join("\n");
      return { list: sorted, n: n, text: text, geraet: d };
    });
  };

  // Oberfläche: bildschirmfüllendes Blatt mit Fortschritt, Bericht, Teilen/Kopieren/Speichern
  ST.open = function () {
    if (document.getElementById("sgSelbsttest")) return;
    var box = document.createElement("div"); box.id = "sgSelbsttest";
    box.innerHTML = "<style>#sgSelbsttest{position:fixed;inset:0;z-index:2147483000;background:var(--bg,#141218);color:var(--ink,var(--text,#e6e0e9));font:15px/1.45 Roboto,system-ui,sans-serif;display:flex;flex-direction:column}" +
      "#sgSelbsttest .h{display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 12px) 8px 8px 20px}#sgSelbsttest .h b{flex:1;font-size:20px;font-weight:500}" +
      "#sgSelbsttest .x{width:48px;height:48px;border:0;border-radius:24px;background:none;color:inherit;font-size:24px}" +
      "#sgSelbsttest .b{flex:1;overflow:auto;padding:0 16px 16px}#sgSelbsttest .p{color:var(--muted,#cac4d0);margin:8px 4px}" +
      "#sgSelbsttest .r{display:flex;gap:10px;padding:10px 12px;border-radius:12px;background:var(--s2,#211f26);margin:6px 0}#sgSelbsttest .r i{font-style:normal;width:18px;flex:none;font-weight:700}" +
      "#sgSelbsttest .r.fail i{color:#ff8a80}#sgSelbsttest .r.warn i{color:#ffd180}#sgSelbsttest .r.ok i{color:#7fd8a4}#sgSelbsttest .r small{display:block;color:var(--muted,#cac4d0);font-size:12px}" +
      "#sgSelbsttest .f{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:12px 16px calc(env(safe-area-inset-bottom,0px) + 12px)}" +
      "#sgSelbsttest .f button{height:44px;border-radius:22px;border:1px solid var(--faint,#938f99);background:none;color:var(--acc,#d0bcff);font-weight:500}#sgSelbsttest .f button.p1{background:var(--acc,#d0bcff);color:var(--accfg,#381e72);border-color:transparent}" +
      "#sgSelbsttest .sum{font-size:16px;margin:8px 4px}</style>" +
      "<div class='h'><b>Selbsttest</b><button class='x' aria-label='Schließen'>×</button></div><div class='b'><p class='p'>Die App wird einmal komplett durchgetestet. Deine Daten bleiben unverändert.</p><div class='st'></div></div>" +
      "<div class='f' hidden><button class='p1' data-k='share'>Teilen</button><button data-k='copy'>Kopieren</button><button data-k='save'>Speichern</button></div>";
    document.body.appendChild(box);
    box.querySelector(".x").onclick = function () { box.remove(); };
    var st = box.querySelector(".st"), foot = box.querySelector(".f"), result = null;
    box.style.visibility = "hidden";   // während des Tests unsichtbar, damit die Messung die echten Seiten sieht
    var prog = document.createElement("div"); prog.id = "sgSelbsttestP"; prog.style.cssText = "position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 12px);transform:translateX(-50%);z-index:2147483001;background:#000c;color:#fff;font:13px system-ui;padding:8px 14px;border-radius:16px;pointer-events:none";
    document.body.appendChild(prog);
    ST.run(function (t) { prog.textContent = "Selbsttest: " + t; }).then(function (r) {
      result = r; prog.remove(); box.style.visibility = "";
      var esc = function (s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); };
      st.innerHTML = "<div class='sum'>" + r.n.fail + " geht nicht · " + r.n.warn + " auffällig · " + r.n.ok + " klappt</div><p class='p'>" + esc(r.geraet.geraet || "") + " · " + esc(r.geraet.webview) + " · Version " + esc(r.geraet.ver) + "</p>" +
        r.list.map(function (x) { return "<div class='r " + x[0] + "'><i>" + { fail: "✗", warn: "⚠", ok: "✓" }[x[0]] + "</i><span>" + esc(x[2]) + "<small>" + esc(x[1]) + "</small></span></div>"; }).join("");
      foot.hidden = false;
    }).catch(function (e) { prog.remove(); box.style.visibility = ""; st.textContent = "Der Selbsttest ist abgebrochen: " + e.message; });
    foot.onclick = function (e) {
      var k = e.target.dataset && e.target.dataset.k; if (!k || !result) return;
      var name = "selbsttest-" + (window.SGApp || "planer") + "-" + new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-") + ".txt";
      var P = window.Capacitor && window.Capacitor.Plugins;
      if (k === "share") {
        if (window.SGNative && P && P.Share) P.Share.share({ title: "Selbsttest", text: result.text, dialogTitle: "Bericht teilen" }).catch(function () {});
        else if (navigator.share) navigator.share({ title: "Selbsttest", text: result.text }).catch(function () {});
        else k = "copy";
      }
      if (k === "copy") { (navigator.clipboard ? navigator.clipboard.writeText(result.text) : Promise.reject()).then(function () { e.target.textContent = "Kopiert ✓"; }).catch(function () { prompt("Bericht kopieren:", result.text); }); }
      if (k === "save") { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([result.text], { type: "text/plain" })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 1000); }
    };
  };
  ST.ready = true;
})();
