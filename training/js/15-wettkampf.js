/* Wettkampf-Countdown (Training 2.0, werkzeuge/PLAN-EINZEL.md Schritt 6)
 * Wettkämpfe in localStorage „wk_comps“ (Cloud-Sicherung: Datengruppe Training) – [{ id, name, date, ort, chk:{}, calId }].
 * Karte auf „Heute“: Countdown, Phase (Aufbau → wettkampfnah → Tapering → Vortag → Wettkampftag) mit Hinweis, Checkliste.
 * Jeder Wettkampf steht als ★-Termin im gemeinsamen Kalender (→ Planer und Google). */
(function () {
  "use strict";
  var KEY = "wk_comps";
  var CHECK = ["Startnummer / Lizenz", "Helm, Spikes, Anzug", "Schlitten geprüft", "Aufwärmprogramm (Mobility › Wettkampf)", "Trinken und Essen", "Warme Wechselkleidung", "Anfahrt und Startzeit geklärt"];
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { return []; } }
  function save(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} draw(); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function today() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function days(k) { return Math.round((new Date(k + "T12:00") - new Date(today() + "T12:00")) / 864e5); }
  function esc(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(k) { var d = new Date(k + "T12:00"); return ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()] + " " + d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear(); }
  function phase(n) {
    if (n === 0) return ["Wettkampftag", "Locker aufwärmen (Mobility › Wettkampf), ruhig bleiben – du bist vorbereitet."];
    if (n === 1) return ["Morgen ist Wettkampf", "Nur Lockerung und Technik, Tasche nach Checkliste packen, früh schlafen."];
    if (n <= 7) return ["Tapering", "Umfang um etwa 40 % senken, Intensität kurz halten (kurze schnelle Einheiten), viel Schlaf."];
    if (n <= 21) return ["Wettkampfnah", "Intensität halten, Umfang leicht senken, Starts und Technik üben."];
    return ["Aufbau", "Normal trainieren – Umfang und Grundlagen aufbauen."];
  }
  function next() { var t = today(); return load().filter(function (c) { return c.date >= t; }).sort(function (a, b) { return a.date.localeCompare(b.date); })[0]; }
  function cal() { try { return window.SharedCalendar || (window.parent !== window && window.parent.SharedCalendar) || null; } catch (e) { return null; } }

  function draw() {
    var host = document.getElementById("compCard");
    if (!host) {
      var top = document.querySelector("#s-heute > .top"); if (!top) return;
      host = document.createElement("div"); host.id = "compCard"; host.className = "card"; host.setAttribute("data-sec", "comp");
      top.insertAdjacentElement("afterend", host);
    }
    var c = next();
    if (!c) { host.innerHTML = '<div class="comp-row"><span class="comp-t">Kein Wettkampf geplant</span><button class="btn secondary" type="button" data-comp="neu">Wettkampf eintragen</button></div>'; return; }
    var n = days(c.date), ph = phase(n), chk = c.chk || {}, nd = CHECK.filter(function (x) { return chk[x]; }).length;
    host.innerHTML = '<div class="comp-h"><span class="comp-k">' + esc(ph[0]) + '</span><span class="comp-n">' + (n === 0 ? "heute" : n === 1 ? "morgen" : "in " + n + " Tagen") + "</span></div>" +
      '<div class="comp-t">' + esc(c.name) + '</div><div class="comp-s">' + fmt(c.date) + (c.ort ? " · " + esc(c.ort) : "") + "</div>" +
      '<p class="comp-p">' + esc(ph[1]) + "</p>" +
      '<div class="comp-b"><button class="btn secondary" type="button" data-comp="chk">Checkliste ' + nd + "/" + CHECK.length + '</button><button class="btn secondary" type="button" data-comp="liste">Alle</button></div>';
  }

  // einfaches Blatt (eigene Optik, passt sich der Farbwelt an)
  function sheet(html, onclick) {
    var o = document.createElement("div"); o.className = "comp-sheet";
    o.innerHTML = '<div class="comp-in"><button class="comp-x" type="button" aria-label="Schließen">×</button>' + html + "</div>";
    document.body.appendChild(o);
    o.addEventListener("click", function (e) { if (e.target === o || e.target.closest(".comp-x")) return o.remove(); onclick(e, o); });
    return o;
  }
  function editSheet(c) {
    c = c || { id: "c" + Date.now().toString(36), name: "", date: "", ort: "", chk: {} };
    sheet("<h3>" + (c.name ? "Wettkampf bearbeiten" : "Wettkampf eintragen") + '</h3><label class="comp-f"><span>Name</span><input id="cpN" type="text" value="' + esc(c.name) + '" placeholder="z. B. Deutsche Meisterschaft Oberhof"></label>' +
      '<label class="comp-f"><span>Datum</span><input id="cpD" type="date" value="' + esc(c.date) + '"></label><label class="comp-f"><span>Ort</span><input id="cpO" type="text" value="' + esc(c.ort) + '"></label>' +
      '<div class="comp-b">' + (load().some(function (x) { return x.id === c.id; }) ? '<button class="btn secondary" type="button" data-k="del">Löschen</button>' : "") + '<button class="btn accent" type="button" data-k="ok">Speichern</button></div>', function (e, o) {
      var k = e.target.dataset && e.target.dataset.k; if (!k) return;
      var l = load().filter(function (x) { return x.id !== c.id; }), C = cal();
      if (k === "ok") {
        var nm = o.querySelector("#cpN").value.trim(), dt = o.querySelector("#cpD").value;
        if (!nm || !dt) { (nm ? o.querySelector("#cpD") : o.querySelector("#cpN")).focus(); return; }
        c.name = nm; c.date = dt; c.ort = o.querySelector("#cpO").value.trim();
        // im gemeinsamen Kalender als ★-Termin (Planer, Google); vorhandenen Termin anpassen
        try { if (C) { if (c.calId) C.update(c.calId, { title: "Wettkampf: " + c.name, date: c.date, note: c.ort }); else { var ev = C.add({ title: "Wettkampf: " + c.name, date: c.date, note: c.ort, star: true, area: "training" }); c.calId = ev && ev.id; } } } catch (x) {}
        l.push(c);
      } else if (k === "del") { try { if (C && c.calId) C.remove(c.calId); } catch (x) {} }
      save(l); o.remove();
    });
  }
  function listSheet() {
    var l = load().sort(function (a, b) { return a.date.localeCompare(b.date); }), t = today();
    sheet("<h3>Wettkämpfe</h3>" + (l.length ? l.map(function (c) { return '<button class="comp-li' + (c.date < t ? " past" : "") + '" type="button" data-id="' + c.id + '"><b>' + esc(c.name) + "</b><small>" + fmt(c.date) + (c.ort ? " · " + esc(c.ort) : "") + (c.date >= t ? " · in " + days(c.date) + " Tagen" : " · vorbei") + "</small></button>"; }).join("") : "<p>Noch keine Wettkämpfe.</p>") +
      '<div class="comp-b"><button class="btn accent" type="button" data-k="neu">Wettkampf eintragen</button></div>', function (e, o) {
      var b = e.target.closest("[data-id], [data-k]"); if (!b) return;
      o.remove(); if (b.dataset.k === "neu") editSheet(); else editSheet(load().filter(function (x) { return x.id === b.dataset.id; })[0]);
    });
  }
  function checkSheet() {
    var c = next(); if (!c) return;
    var draw2 = function (o) { o.querySelector(".comp-cl").innerHTML = CHECK.map(function (x) { var on = (c.chk || {})[x]; return '<label class="comp-ck"><input type="checkbox" data-ck="' + esc(x) + '"' + (on ? " checked" : "") + "><span>" + esc(x) + "</span></label>"; }).join(""); };
    var o = sheet("<h3>Checkliste · " + esc(c.name) + '</h3><div class="comp-cl"></div>', function (e) {
      var i = e.target.closest("[data-ck]"); if (!i) return;
      c.chk = c.chk || {}; c.chk[i.dataset.ck] = i.checked;
      var l = load().map(function (x) { return x.id === c.id ? c : x; }); save(l);
    });
    draw2(o);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-comp]"); if (!b) return;
    var k = b.dataset.comp; if (k === "neu") editSheet(); else if (k === "liste") listSheet(); else if (k === "chk") checkSheet();
  });
  var st = document.createElement("style");
  st.textContent = "#compCard{display:flex;flex-direction:column;gap:6px}.comp-row{display:flex;align-items:center;gap:12px;justify-content:space-between}.comp-row .comp-t{font-size:15px;font-weight:500;color:var(--text-dim)}" +
    ".comp-h{display:flex;justify-content:space-between;align-items:baseline}.comp-k{font-size:12px;font-weight:600;color:var(--work)}.comp-n{font-size:22px;font-weight:600}" +
    ".comp-t{font-size:17px;font-weight:600}.comp-s{font-size:13px;color:var(--text-dim)}.comp-p{margin:4px 0 0;font-size:14px;line-height:1.45}" +
    ".comp-b{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}.comp-b .btn{flex:1 1 0;min-height:44px}" +
    ".comp-sheet{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center}" +
    ".comp-in{position:relative;width:100%;max-width:560px;max-height:88vh;overflow:auto;background:var(--panel);border-radius:20px 20px 0 0;padding:20px 16px calc(20px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:10px}" +
    ".comp-in h3{margin:0 40px 4px 0;font-size:18px}.comp-x{position:absolute;top:8px;right:8px;width:44px;height:44px;border:0;border-radius:22px;background:none;color:var(--text);font-size:24px}" +
    ".comp-f{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--text-dim)}.comp-f input{height:48px;border-radius:12px;border:1px solid var(--line);background:var(--panel-2);color:var(--text);padding:0 12px;font-size:16px}" +
    ".comp-li{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:56px;padding:10px 12px;border:0;border-radius:12px;background:var(--panel-2);color:var(--text);text-align:left}.comp-li small{color:var(--text-dim)}.comp-li.past{opacity:.6}" +
    ".comp-ck{display:flex;align-items:center;gap:12px;min-height:48px;font-size:15px}.comp-ck input{width:22px;height:22px;accent-color:var(--work)}";
  document.head.appendChild(st);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", draw); else draw();
  document.addEventListener("visibilitychange", function () { if (!document.hidden) draw(); });
  window.SGWettkampf = { draw: draw, list: load };
})();
