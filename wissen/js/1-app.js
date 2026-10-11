/* Sportwissenschaft – Lesen, Karteikarten, Quiz und Suche über das Lehrbuch „Sportwissenschaft für Rennrodler“.
 * Inhalt: window.SW_BUCH (js/buch.js). Fortschritt liegt in sg-wissen-v1 (gemeinsamer Speicher, mit der Cloud-Sicherung
 * abgeglichen). Alles läuft offline. Adressen: #lesen, #lesen/k3, #lesen/k3@k3-12, #karten, #quiz, #suche. */
(function () {
  "use strict";
  var B = window.SW_BUCH, KEY = "sg-wissen-v1";
  var CH = B.chapters, BYID = {}, KAP = CH.filter(function (c) { return /^k\d$/.test(c.id); });
  CH.forEach(function (c) { BYID[c.id] = c; });
  var main = document.getElementById("main"), titleEl = document.getElementById("title"), tools = document.getElementById("tools"), bar = document.querySelector(".bar");
  var sheetEl = document.getElementById("sheet");
  var BOX_DAYS = [0, 0, 1, 3, 7, 14, 30]; // Box 1 = gleich wieder, Box 6 = sitzt
  var FS = ["15px", "16.5px", "18px", "20px"];

  /* ---------- Speicher ---------- */
  function load() {
    var s = {}; try { s = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) {}
    s.read = s.read || {}; s.cards = s.cards || {}; s.quiz = s.quiz || {}; s.quiz.wrong = s.quiz.wrong || {}; s.quiz.hist = s.quiz.hist || [];
    if (s.font == null) s.font = 1;
    s.cf = s.cf || { ch: "", k: "" }; s.qf = s.qf || { ch: "" };
    return s;
  }
  var S = load(), saveT = null;
  function save(now) {
    clearTimeout(saveT);
    var w = function () {
      S.sum = { pct: bookPct(), due: dueCards(allCards()).length, wrong: Object.keys(S.quiz.wrong).length };
      S.updated = Date.now();
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    };
    if (now) w(); else saveT = setTimeout(w, 600);
  }
  addEventListener("storage", function (e) { if (e.key === KEY) { S = load(); } });
  addEventListener("pagehide", function () { save(true); });

  /* ---------- Hilfen ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) { return String(s).toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss").replace(/­/g, ""); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function chName(id) { var c = BYID[id]; return c ? (/^k/.test(id) ? "Kapitel " + id.slice(1) : c.title) : ""; }
  function short(c) { return c.title.split(":")[0]; }
  function pct(x) { return Math.round((x || 0) * 100); }
  // Text ohne HTML; Tabellenzellen und Listenpunkte getrennt, damit Suche und Ausschnitte lesbar bleiben
  function strip(h) { var d = document.createElement("div"); d.innerHTML = h.replace(/<\/(td|th|li)>/g, " · </$1>").replace(/<\/tr>/g, " </tr>"); return d.textContent.replace(/ · (\s*)$/, "").replace(/\s+/g, " ").trim(); }
  var ICO = {
    aa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19l5-13 5 13M4.8 14.5h6.4M14 19l3.5-9 3.5 9M15.2 16h4.6"/></svg>',
    toc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'
  };
  function ring(p) {
    var r = 26, c = 2 * Math.PI * r;
    return '<svg class="ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="var(--s3)" stroke-width="7"/>' + (p ? "" : "<!--") + '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="var(--acc)" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (c * p / 100) + " " + c + '" transform="rotate(-90 32 32)"/>' + (p ? "" : "-->") + '<text x="32" y="37" text-anchor="middle" fill="var(--ink)" font-size="15" font-weight="700">' + p + "%</text></svg>";
  }

  /* ---------- Navigation ---------- */
  var depth = 0; // Schritte innerhalb dieser Seite (für Zurück)
  function go(hash, replace) { if (replace) location.replace(hash); else { depth++; location.hash = hash; } }
  function leave() {
    var r = document.referrer || "", base = location.origin + "/" + location.pathname.split("/")[1] + "/";
    if (r.indexOf(base) === 0 && history.length > 1) history.back(); else location.href = "../training/#sg=t_sw";
  }
  document.getElementById("back").addEventListener("click", function () {
    var h = location.hash.slice(1), root = !h || ["lesen", "karten", "quiz", "suche"].indexOf(h) > -1;
    if (root) return leave();
    if (depth > 0) { depth--; history.back(); } else go("#" + h.split("/")[0], true);
  });
  document.querySelectorAll(".tabs button").forEach(function (b) {
    b.addEventListener("click", function () { var t = b.dataset.t; if (location.hash.slice(1) !== t) go("#" + t, true); });
  });
  addEventListener("hashchange", route);
  function setBar(title, toolsHTML) { titleEl.textContent = title; tools.innerHTML = toolsHTML || ""; }
  function tab(t) {
    document.querySelectorAll(".tabs button").forEach(function (b) { b.classList.toggle("on", b.dataset.t === t); });
    var due = dueCards(allCards()).length, wr = Object.keys(S.quiz.wrong).length;
    badge("karten", due); badge("quiz", wr);
  }
  function badge(t, n) {
    var b = document.querySelector('.tabs [data-t="' + t + '"]'), s = b.querySelector(".bd");
    if (!n) { if (s) s.remove(); return; }
    if (!s) { s = document.createElement("span"); s.className = "bd"; b.appendChild(s); }
    s.textContent = n > 99 ? "99+" : n;
  }
  var view = "";
  function route() {
    var h = decodeURIComponent(location.hash.slice(1)) || "lesen", p = h.split("/");
    closeSheet(); document.body.classList.remove("reading", "showtabs"); stopReading();
    view = p[0];
    if (p[0] === "lesen" && p[1]) return chapter(p[1].split("@")[0], p[1].split("@")[1]);
    if (p[0] === "karten") return p[1] === "lernen" && sess ? cardSession() : cardsHome();
    if (p[0] === "quiz") return p[1] === "lauf" && quiz ? quizStep() : quizHome();
    if (p[0] === "suche") return searchView();
    library();
  }
  addEventListener("scroll", function () { bar.classList.toggle("sc", scrollY > 8); }, { passive: true });

  /* ---------- Lesen: Übersicht ---------- */
  function chPct(id) { var r = S.read[id]; return r ? (r.done ? 1 : r.max || 0) : 0; }
  function bookPct() { return pct(KAP.reduce(function (a, c) { return a + chPct(c.id); }, 0) / KAP.length); }
  function library() {
    tab("lesen"); setBar("Sportwissenschaft", '<button class="ib" data-a="find" aria-label="Suchen">' + ICO.search + "</button>");
    var p = bookPct(), last = S.last && BYID[S.last.ch] ? S.last : null, h = "";
    h += '<div class="card hero">' + ring(p) + '<div><h1 style="margin:0;font-size:22px">' + esc(B.title) + '</h1><div class="sub" style="margin:4px 0 0">' +
      KAP.filter(function (c) { return chPct(c.id) >= 1; }).length + " von 8 Kapiteln gelesen · Stand " + esc(B.asof) + "</div></div></div>";
    if (last) {
      var lc = BYID[last.ch], sec = secOf(lc, last.at);
      h += '<div class="grp"><header><span>Weiterlesen</span></header><div class="cells"><button class="row" data-go="#lesen/' + lc.id + (last.at ? "@" + last.at : "") + '">' +
        '<span class="num">' + (lc.id.charAt(0) === "k" ? lc.id.slice(1) : "i") + '</span><span class="tx"><b>' + esc(short(lc)) + "</b><small>" + esc(sec || chName(lc.id)) + '</small><div class="meter"><i style="width:' + pct(chPct(lc.id)) + '%"></i></div></span></button></div></div>';
    }
    h += '<div class="grp"><header><span>Kapitel</span></header><div class="cells">' + KAP.map(chRow).join("") + "</div></div>";
    h += '<div class="grp"><header><span>Zum Buch</span></header><div class="cells">' + CH.filter(function (c) { return !/^k/.test(c.id); }).map(chRow).join("") + "</div></div>";
    main.innerHTML = h; scrollTo(0, 0);
  }
  function chRow(c) {
    var p = chPct(c.id), k = /^k/.test(c.id);
    return '<button class="row" data-go="#lesen/' + c.id + '"><span class="num' + (p >= 1 ? " done" : "") + '">' + (p >= 1 ? "✓" : k ? c.id.slice(1) : c.id === "e" ? "i" : "Q") + '</span><span class="tx"><b>' + esc(k ? c.title : c.full) +
      "</b>" + (k ? '<small>' + c.sec.filter(function (s) { return /^\d/.test(s.t); }).length + " Abschnitte" + (p > 0 && p < 1 ? " · " + pct(p) + " %" : "") + "</small>" : "") +
      (k && p > 0 && p < 1 ? '<div class="meter"><i style="width:' + pct(p) + '%"></i></div>' : "") + "</span></button>";
  }
  function secOf(c, blockId) {
    var s = ""; if (!blockId) return "";
    for (var i = 0; i < c.blocks.length; i++) { var b = c.blocks[i]; if (b.t === "h3") s = strip(b.h); if (b.id === blockId) break; }
    return s;
  }

  /* ---------- Lesen: Kapitel ---------- */
  var readCh = null, rT = null, lastY = 0;
  function blockHTML(b) {
    if (b.t === "table") { var cols = (b.h.match(/<th>/g) || []).length; return '<div class="tw' + (cols >= 3 ? " st" : "") + '" id="' + b.id + '">' + b.h + "</div>"; }
    var tag = b.t === "h3" ? "h3" : b.t === "h4" ? "h4" : b.t;
    return "<" + tag + ' id="' + b.id + '"' + (b.c ? ' class="' + b.c + '"' : "") + ">" + b.h + "</" + tag + ">";
  }
  function chapter(id, at) {
    var c = BYID[id]; if (!c) return library();
    tab("lesen"); document.body.classList.add("reading", "showtabs");
    document.documentElement.style.setProperty("--fs", FS[S.font] || FS[1]);
    setBar(chName(id), '<button class="ib" data-a="font" aria-label="Schriftgröße">' + ICO.aa + '</button><button class="ib" data-a="toc" aria-label="Inhalt">' + ICO.toc + "</button>");
    var i = CH.indexOf(c), prev = CH[i - 1], next = CH[i + 1];
    var h = '<article class="book">' + (/^k/.test(id) ? '<div class="kap">Kapitel ' + id.slice(1) + "</div><h1>" + esc(c.title) + "</h1>" : "<h1>" + esc(c.full) + "</h1>") + c.blocks.map(blockHTML).join("") + "</article>";
    h += '<div class="pager">' + (prev ? '<button data-go="#lesen/' + prev.id + '"><small>‹ Zurück</small><b>' + esc(/^k/.test(prev.id) ? "Kapitel " + prev.id.slice(1) : prev.full) + "</b></button>" : "<span style='flex:1'></span>") +
      (next ? '<button class="nx" data-go="#lesen/' + next.id + '"><small>Weiter ›</small><b>' + esc(/^k/.test(next.id) ? "Kapitel " + next.id.slice(1) : next.full) + "</b></button>" : "<span style='flex:1'></span>") + "</div>";
    main.innerHTML = h;
    readCh = id;
    var r = S.read[id], target = at || (r && !r.done && r.at) || null;
    var el = target && document.getElementById(target);
    if (el) { el.scrollIntoView({ block: "start" }); if (at) { el.classList.add("flash"); } } else scrollTo(0, 0);
    lastY = scrollY; S.last = { ch: id, at: target || (c.blocks[0] && c.blocks[0].id) }; save();
    setTimeout(track, 50);
  }
  function stopReading() { readCh = null; document.querySelector(".progtop i").style.width = "0"; }
  function track() {
    if (!readCh) return;
    var d = document.documentElement, f = Math.min(1, (scrollY + innerHeight) / Math.max(1, d.scrollHeight - 90));
    document.querySelector(".progtop i").style.width = Math.round(f * 100) + "%";
    var r = S.read[readCh] = S.read[readCh] || { max: 0 };
    if (f > (r.max || 0)) r.max = Math.round(f * 1000) / 1000;
    if (f >= 0.985 && !r.done) { r.done = true; r.doneAt = Date.now(); }
    // erster Block, dessen Oberkante unter der Leiste liegt = Leseposition
    var bl = main.querySelectorAll(".book > [id]"), at = null;
    for (var i = 0; i < bl.length; i++) { if (bl[i].getBoundingClientRect().bottom > 70) { at = bl[i].id; break; } }
    if (at) { r.at = at; S.last = { ch: readCh, at: at }; }
    r.t = Date.now(); save();
  }
  addEventListener("scroll", function () {
    if (!readCh) return;
    var y = scrollY; document.body.classList.toggle("showtabs", y < lastY - 4 || y < 80 || y + innerHeight > document.documentElement.scrollHeight - 40); lastY = y;
    clearTimeout(rT); rT = setTimeout(track, 250);
  }, { passive: true });

  /* ---------- Blatt (Inhalt, Schrift) ---------- */
  function sheet(h) { sheetEl.querySelector(".pn").innerHTML = h; sheetEl.classList.add("on"); }
  function closeSheet() { sheetEl.classList.remove("on"); }
  sheetEl.addEventListener("click", function (e) {
    if (e.target === sheetEl) return closeSheet();
    var b = e.target.closest("[data-sec]"); if (b) { closeSheet(); var el = document.getElementById(b.dataset.sec); if (el) { el.scrollIntoView({ block: "start" }); el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); } return; }
    var f = e.target.closest("[data-font]"); if (f) { S.font = +f.dataset.font; save(); document.documentElement.style.setProperty("--fs", FS[S.font]); fontSheet(); }
  });
  function tocSheet() {
    var c = BYID[readCh], cur = (S.read[readCh] || {}).at, curSec = null;
    c.blocks.some(function (b) { if (b.t === "h3") curSec = b.id; return b.id === cur; });
    sheet("<h3>" + esc(/^k/.test(c.id) ? "Kapitel " + c.id.slice(1) + " · " + c.title : c.full) + "</h3>" + c.sec.map(function (s) {
      return '<button class="row' + (s.id === curSec ? " cur" : "") + '" data-sec="' + s.id + '"><span class="tx"><b>' + esc(s.t) + "</b></span></button>";
    }).join(""));
  }
  function fontSheet() {
    sheet("<h3>Schriftgröße</h3>" + ["Klein", "Normal", "Groß", "Sehr groß"].map(function (n, i) {
      return '<button class="row' + (S.font === i ? " cur" : "") + '" data-font="' + i + '"><span class="tx"><b style="font-size:' + FS[i] + '">' + n + "</b></span>" + (S.font === i ? "✓" : "") + "</button>";
    }).join(""));
  }

  /* ---------- Karteikarten ---------- */
  function allCards() { return B.cards; }
  function filtered() { return B.cards.filter(function (c) { return (!S.cf.ch || c.ch === S.cf.ch) && (!S.cf.k || c.k === S.cf.k); }); }
  function st(c) { return S.cards[c.id]; }
  function dueCards(list) { var now = Date.now(); return list.filter(function (c) { var s = st(c); return s && s.n <= now && s.b < 6; }); }
  var sess = null;
  function chipRow(sel, cur, all, attr) {
    return '<div class="chips">' + [["", all]].concat(KAP.map(function (c) { return [c.id, "Kap. " + c.id.slice(1)]; })).map(function (x) {
      return '<button class="chip' + (cur === x[0] ? " on" : "") + '" ' + attr + '="' + x[0] + '">' + x[1] + "</button>"; }).join("") + "</div>";
  }
  function cardsHome() {
    tab("karten"); setBar("Karteikarten");
    var list = filtered(), due = dueCards(list), fresh = list.filter(function (c) { return !st(c); }), known = list.filter(function (c) { var s = st(c); return s && s.b >= 4; });
    var h = '<h1>Karteikarten</h1><p class="sub">' + B.cards.filter(function (c) { return c.k === "m"; }).length + " Merksätze und " + B.cards.filter(function (c) { return c.k === "ml"; }).length +
      " Mach-das/Lass-das-Regeln aus allen Kapiteln. Was du nicht weißt, kommt früher wieder.</p>";
    h += chipRow("ch", S.cf.ch, "Alle Kapitel", "data-cfch");
    h += '<div class="chips">' + [["", "Alle Karten"], ["m", "Merksätze"], ["ml", "Mach das / Lass das"]].map(function (x) { return '<button class="chip' + (S.cf.k === x[0] ? " on" : "") + '" data-cfk="' + x[0] + '">' + x[1] + "</button>"; }).join("") + "</div>";
    h += '<div class="stats"><div class="stat"><b>' + due.length + "</b><small>fällig</small></div><div class=\"stat\"><b>" + fresh.length + "</b><small>neu</small></div><div class=\"stat\"><b>" + known.length + "</b><small>sitzen</small></div></div>";
    var n = Math.min(20, due.length + fresh.length);
    h += '<div class="btns" style="margin-bottom:22px"><button class="btn p" data-a="learn"' + (n ? "" : " disabled") + ">" + (n ? "Lernen · " + n + " Karten" : "Alles gelernt – schau später wieder rein") + "</button>" +
      (list.length ? '<button class="btn" data-a="learnall">Alle ' + list.length + " durchgehen</button>" : "") + "</div>";
    h += '<div class="grp"><header><span>Stand je Kapitel</span></header><div class="cells">' + KAP.map(function (c) {
      var l = B.cards.filter(function (x) { return x.ch === c.id; }), k = l.filter(function (x) { var s = st(x); return s && s.b >= 4; }).length;
      return '<button class="row" data-cfch="' + c.id + '"><span class="num">' + c.id.slice(1) + '</span><span class="tx"><b>' + esc(short(c)) + "</b><small>" + k + " von " + l.length + ' sitzen</small><div class="meter"><i style="width:' + pct(k / l.length) + '%"></i></div></span></button>';
    }).join("") + "</div></div>";
    main.innerHTML = h; scrollTo(0, 0);
  }
  function startCards(all) {
    var list = filtered(), q;
    if (all) q = shuffle(list);
    else {
      var due = dueCards(list).sort(function (a, b) { return st(a).b - st(b).b; }), fresh = list.filter(function (c) { return !st(c); });
      q = due.concat(shuffle(fresh)).slice(0, 20);
    }
    if (!q.length) return;
    sess = { q: q, i: 0, open: false, ok: 0, again: 0, seen: {} };
    if (location.hash === "#karten/lernen") { cardSession(); scrollTo(0, 0); } else go("#karten/lernen");
  }
  function cardSession() {
    tab("karten");
    if (sess.i >= sess.q.length) return cardsDone();
    var c = sess.q[sess.i];
    setBar("Karteikarten");
    var front = c.k === "m"
      ? '<div class="lab">' + esc(chName(c.ch)) + ' · Merksatz</div><div class="q">' + esc(c.f) + "</div>"
      : '<div class="lab">' + esc(chName(c.ch)) + " · " + esc(c.ctx || c.sec.replace(/^\d+\.\d+ /, "")) + '</div><div class="q"><div class="tag l">LASS DAS</div>' + esc(c.f) + '</div><div class="hint" style="margin-top:0">Was machst du stattdessen?</div>';
    var back = c.k === "m" ? '<div class="a">' + esc(c.b) + "</div>"
      : '<div class="a"><div class="tag m">MACH DAS</div>' + esc(c.b) + "</div>" + (c.w ? '<div class="why"><b>Warum:</b> ' + esc(c.w) + "</div>" : "");
    var h = '<div class="progline"><span>Karte ' + (sess.i + 1) + " von " + sess.q.length + "</span><span>" + sess.ok + " gewusst · " + sess.again + " nochmal</span></div>";
    h += '<div class="fc" id="fc">' + front + (sess.open ? back + '<a class="go" href="#lesen/' + c.ch + "@" + c.ref + '">Im Buch nachlesen ›</a>' : '<div class="hint">Tippen zum Aufdecken</div>') + "</div>";
    h += sess.open ? '<div class="btns"><button class="btn bad" data-a="again">Nochmal</button><button class="btn p" data-a="knew">Gewusst</button></div>'
      : '<div class="btns"><button class="btn p" data-a="flip">Antwort zeigen</button></div>';
    main.innerHTML = h;
    swipe(document.getElementById("fc"));
  }
  function rate(ok) {
    var c = sess.q[sess.i], s = S.cards[c.id] || { b: 0, n: 0 };
    if (ok) { s.b = Math.min(6, Math.max(1, s.b || 0) + 1); /* gewusst: frühestens morgen wieder */ s.n = Date.now() + BOX_DAYS[s.b] * 864e5 - 36e5; sess.ok++; }
    else { s.b = 1; s.n = Date.now(); sess.again++; if ((sess.seen[c.id] = (sess.seen[c.id] || 0) + 1) < 3) sess.q.push(c); }
    s.t = Date.now(); S.cards[c.id] = s; save(true);
    sess.i++; sess.open = false; cardSession(); scrollTo(0, 0);
  }
  function swipe(el) {
    var x0 = 0, y0 = 0;
    el.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (!sess.open || Math.abs(dx) < 80 || Math.abs(dy) > 60) return;
      el.style.transform = "translateX(" + (dx > 0 ? 40 : -40) + "px)"; setTimeout(function () { rate(dx > 0); }, 120);
    }, { passive: true });
  }
  function cardsDone() {
    setBar("Karteikarten");
    main.innerHTML = '<div class="res"><div class="big">✓</div><h1>Runde geschafft</h1><p class="sub">' + sess.ok + " gewusst · " + sess.again + " nochmal. Was du nicht wusstest, kommt beim nächsten Mal zuerst.</p></div>" +
      '<div class="btns"><button class="btn" data-a="cardshome">Zur Übersicht</button>' + (dueCards(filtered()).length || filtered().some(function (c) { return !st(c); }) ? '<button class="btn p" data-a="learn">Weiterlernen</button>' : "") + "</div>";
    sess = null;
  }

  /* ---------- Quiz ---------- */
  var quiz = null;
  function qPool() { return B.quiz.filter(function (q) { return !S.qf.ch || q.ch === S.qf.ch; }); }
  function quizHome() {
    tab("quiz"); setBar("Quiz");
    var pool = qPool(), wr = B.quiz.filter(function (q) { return S.quiz.wrong[q.id]; });
    var h = '<h1>Quiz</h1><p class="sub">' + B.quiz.length + " Fragen aus allen Kapiteln. Falsch beantwortete Fragen kommen wieder, bis du sie richtig hast.</p>";
    h += chipRow("ch", S.qf.ch, "Alle Kapitel", "data-qfch");
    h += '<div class="btns" style="margin-bottom:12px"><button class="btn p" data-a="quiz">Quiz starten · ' + Math.min(10, pool.length) + " Fragen</button></div>";
    if (wr.length) h += '<div class="btns" style="margin-bottom:22px"><button class="btn" data-a="quizwrong">Falsche wiederholen · ' + wr.length + "</button></div>";
    else h += '<p class="sub" style="margin-bottom:22px">Keine offenen Fehler.</p>';
    if (S.quiz.hist.length) h += '<div class="grp"><header><span>Letzte Ergebnisse</span></header><div class="cells hist">' + S.quiz.hist.slice(0, 6).map(function (r) {
      var d = new Date(r.t);
      return '<div class="row" style="min-height:52px"><span class="tx"><b>' + r.ok + " von " + r.n + " richtig</b><small>" + d.getDate() + "." + (d.getMonth() + 1) + ". · " + esc(r.ch ? chName(r.ch) : r.w ? "Fehler wiederholt" : "Alle Kapitel") + '</small></span><span class="pc">' + pct(r.ok / r.n) + " %</span></div>";
    }).join("") + "</div></div>";
    main.innerHTML = h; scrollTo(0, 0);
  }
  function startQuiz(wrongOnly) {
    var pool = wrongOnly ? B.quiz.filter(function (q) { return S.quiz.wrong[q.id]; }) : qPool(), list;
    if (wrongOnly) list = shuffle(pool).slice(0, 10);
    else {
      // offene Fehler aus der Auswahl kommen zuerst wieder (höchstens die Hälfte), dann neue Fragen
      var w = shuffle(pool.filter(function (q) { return S.quiz.wrong[q.id]; })).slice(0, 5), rest = shuffle(pool.filter(function (q) { return w.indexOf(q) < 0; }));
      list = shuffle(w.concat(rest.slice(0, 10 - w.length)));
    }
    if (!list.length) return;
    quiz = { list: list.map(function (q) { var o = shuffle(q.o.map(function (t, i) { return { t: t, r: i === 0 }; })); return { q: q, o: o, pick: -1 }; }), i: 0, w: !!wrongOnly, ch: wrongOnly ? "" : S.qf.ch };
    if (location.hash === "#quiz/lauf") { quizStep(); scrollTo(0, 0); } else go("#quiz/lauf");
  }
  function quizStep() {
    tab("quiz"); setBar("Quiz");
    if (quiz.i >= quiz.list.length) return quizDone();
    var it = quiz.list[quiz.i], q = it.q, done = it.pick > -1;
    var h = '<div class="dots">' + quiz.list.map(function (x, i) { return "<i class=\"" + (x.pick > -1 ? (x.o[x.pick].r ? "ok" : "no") : i === quiz.i ? "cur" : "") + "\"></i>"; }).join("") + "</div>";
    h += '<div class="progline"><span>Frage ' + (quiz.i + 1) + " von " + quiz.list.length + "</span><span>" + esc(chName(q.ch)) + (S.quiz.wrong[q.id] && !done ? " · schon mal falsch" : "") + "</span></div>";
    h += '<div class="qq">' + esc(q.q) + "</div>";
    h += it.o.map(function (o, i) {
      var cls = done ? (o.r ? " right" : i === it.pick ? " wrong" : "") : "";
      return '<button class="opt' + cls + '" data-opt="' + i + '"' + (done ? " disabled" : "") + ">" + esc(o.t) + "</button>";
    }).join("");
    if (done) {
      var ok = it.o[it.pick].r;
      h += '<div class="expl"><b style="color:var(--' + (ok ? "ok" : "bad") + ')">' + (ok ? "Richtig" : "Leider falsch") + "</b>" + esc(q.e) +
        ' <a href="#lesen/' + q.ch + "@" + q.blk + '">Abschnitt ' + esc(q.ref) + " lesen ›</a></div>";
      h += '<div class="btns"><button class="btn p" data-a="qnext">' + (quiz.i + 1 < quiz.list.length ? "Weiter" : "Auswertung") + "</button></div>";
    }
    main.innerHTML = h;
  }
  function answer(i) {
    var it = quiz.list[quiz.i]; if (it.pick > -1) return;
    it.pick = i;
    if (it.o[i].r) delete S.quiz.wrong[it.q.id]; else S.quiz.wrong[it.q.id] = (S.quiz.wrong[it.q.id] || 0) + 1;
    save(true); quizStep();
    var ex = main.querySelector(".expl"); if (ex && ex.getBoundingClientRect().bottom > innerHeight - 90) scrollBy({ top: ex.getBoundingClientRect().bottom - innerHeight + 170, behavior: "smooth" });
  }
  function quizDone() {
    var ok = quiz.list.filter(function (x) { return x.o[x.pick] && x.o[x.pick].r; }).length, n = quiz.list.length, p = pct(ok / n);
    S.quiz.hist.unshift({ t: Date.now(), ok: ok, n: n, ch: quiz.ch, w: quiz.w }); S.quiz.hist = S.quiz.hist.slice(0, 30); save(true);
    var msg = p === 100 ? "Alles richtig – stark!" : p >= 70 ? "Gut gemacht. Die Fehler kommen beim nächsten Quiz wieder." : "Lies die markierten Abschnitte nach und versuch es noch einmal.";
    var wrong = quiz.list.filter(function (x) { return !x.o[x.pick].r; });
    var h = '<div class="res">' + ring(p).replace('class="ring"', 'class="ring" style="width:120px;height:120px"') + "<h1>" + ok + " von " + n + ' richtig</h1><p class="sub">' + msg + "</p></div>";
    if (wrong.length) h += '<div class="grp"><header><span>Das war falsch</span></header><div class="cells">' + wrong.map(function (x) {
      return '<button class="row" data-go="#lesen/' + x.q.ch + "@" + x.q.blk + '"><span class="tx"><b>' + esc(x.q.q) + '</b><small style="color:var(--ok)">Richtig: ' + esc(x.q.o[0]) + "</small><small>Abschnitt " + esc(x.q.ref) + " lesen ›</small></span></button>";
    }).join("") + "</div></div>";
    h += '<div class="btns">' + (Object.keys(S.quiz.wrong).length ? '<button class="btn" data-a="quizwrong">Falsche wiederholen</button>' : "") + '<button class="btn p" data-a="quiz">Neues Quiz</button></div>';
    main.innerHTML = h; scrollTo(0, 0); quiz = null; tab("quiz");
  }

  /* ---------- Suche ---------- */
  var IDX = null, lastQ = "";
  try { lastQ = sessionStorage.getItem("sg-wissen-q") || ""; } catch (e) {}
  var SYN = { eisbad: ["eisbad", "kaltebad", "kaltwasser", "kryotherapie", "kalte"], kaltebad: ["kaltebad", "eisbad", "kryotherapie"], eiweiss: ["eiweiss", "protein"], protein: ["protein", "eiweiss"],
    dehnen: ["dehn"], aufwarmen: ["aufwarm"], schlaf: ["schlaf"], kopf: ["kopf", "gehirnerschutterung"], ekg: ["ekg"], shake: ["shake"] };
  function index() {
    if (IDX) return IDX;
    IDX = [];
    CH.forEach(function (c) {
      var sec = "";
      c.blocks.forEach(function (b) {
        var t = strip(b.h); if (b.t === "h3") sec = t;
        IDX.push({ c: c, b: b, sec: sec, t: t, n: norm(t) });
      });
    });
    return IDX;
  }
  function alts(w) {
    if (SYN[w]) return SYN[w];
    var s = w.length > 5 ? w.replace(/(en|er|es|e|n|s)$/, "") : w;
    return [s];
  }
  function find(q) {
    var words = norm(q).split(/[^a-z0-9%,.-]+/).filter(function (w) { return w.length > 1; }).map(alts);
    if (!words.length) return [];
    return index().filter(function (x) { return words.every(function (a) { return a.some(function (s) { return x.n.indexOf(s) > -1; }); }); })
      .map(function (x) { return { x: x, s: (x.b.t === "h3" || x.b.t === "h4" ? 3 : 0) + words.reduce(function (n, a) { return n + a.reduce(function (m, s) { return m + x.n.split(s).length - 1; }, 0); }, 0) }; })
      .sort(function (a, b) { return b.s - a.s; }).map(function (r) { return r.x; });
  }
  function snippet(x, q) {
    var t = x.t, n = x.n, words = norm(q).split(/[^a-z0-9%,.-]+/).filter(function (w) { return w.length > 1; }).map(alts).reduce(function (a, b) { return a.concat(b); }, []);
    var first = n.length; words.forEach(function (w) { var i = n.indexOf(w); if (i > -1 && i < first) first = i; });
    var a = Math.max(0, first - 70), z = Math.min(t.length, first + 150);
    if (a > 0) { var sp = t.indexOf(" ", a); if (sp > -1 && sp < first) a = sp + 1; }
    var part = t.slice(a, z), np = n.slice(a, z), out = "", i = 0;
    // Treffer markieren (Positionen aus dem normalisierten Text; Umlaute haben dieselbe Länge, ß wird zu ss – dann ohne Markierung)
    if (np.length === part.length) {
      var marks = [];
      words.forEach(function (w) { var k = 0; while ((k = np.indexOf(w, k)) > -1) { marks.push([k, k + w.length]); k += w.length; } });
      marks.sort(function (m1, m2) { return m1[0] - m2[0]; });
      marks.forEach(function (m) { if (m[0] < i) return; out += esc(part.slice(i, m[0])) + "<mark>" + esc(part.slice(m[0], m[1])) + "</mark>"; i = m[1]; });
    }
    out += esc(part.slice(i));
    return (a ? "… " : "") + out + (z < t.length ? " …" : "");
  }
  function searchView() {
    tab("suche"); setBar("Suche");
    main.innerHTML = '<label class="search">' + ICO.search + '<input id="q" type="search" placeholder="Im ganzen Buch suchen, z. B. Eisbad" autocomplete="off" enterkeyhint="search" value="' + esc(lastQ) + '"></label><div id="res"></div>';
    var inp = document.getElementById("q");
    inp.addEventListener("input", function () { lastQ = inp.value; try { sessionStorage.setItem("sg-wissen-q", lastQ); } catch (e) {} results(); });
    results();
    if (!lastQ) setTimeout(function () { inp.focus(); }, 60);
  }
  function results() {
    var q = lastQ.trim(), box = document.getElementById("res");
    if (!q) {
      box.innerHTML = '<p class="sub">Vorschläge</p><div class="chips" style="flex-wrap:wrap;overflow:visible">' + ["Eisbad", "Dehnen", "Schlaf", "Protein", "Kreatinphosphat", "Gehirnerschütterung", "Aufwärmen", "Nacken", "Tapering", "Fieber"].map(function (w) {
        return '<button class="chip" data-q="' + w + '">' + w + "</button>"; }).join("") + "</div>";
      return;
    }
    var hits = find(q);
    if (!hits.length) { box.innerHTML = '<p class="empty">Nichts gefunden zu „' + esc(q) + "“.</p>"; return; }
    var by = {}, order = [];
    hits.slice(0, 80).forEach(function (x) { if (!by[x.c.id]) { by[x.c.id] = []; order.push(x.c.id); } by[x.c.id].push(x); });
    order.sort(function (a, b) { return CH.indexOf(BYID[a]) - CH.indexOf(BYID[b]); });
    box.innerHTML = '<p class="sub">' + hits.length + (hits.length === 1 ? " Treffer" : " Treffer") + (hits.length > 80 ? " · die ersten 80" : "") + "</p>" + order.map(function (id) {
      var c = BYID[id];
      return '<div class="grp"><header><span>' + esc(/^k/.test(id) ? "Kapitel " + id.slice(1) + " · " + c.title : c.full) + "</span><span style='flex:none'>" + by[id].length + "</span></header><div class=\"cells\">" + by[id].map(function (x) {
        return '<button class="hit" data-go="#lesen/' + id + "@" + x.b.id + '"><small>' + esc(x.sec || chName(id)) + "</small><span>" + snippet(x, q) + "</span></button>";
      }).join("") + "</div></div>";
    }).join("");
  }

  /* ---------- Klicks ---------- */
  document.addEventListener("click", function (e) {
    var g = e.target.closest("[data-go]"); if (g) { e.preventDefault(); return go(g.dataset.go); }
    var l = e.target.closest('a[href^="#lesen"]'); if (l) { e.preventDefault(); return go(l.getAttribute("href")); }
    var ch = e.target.closest("[data-cfch]"); if (ch) { S.cf.ch = ch.dataset.cfch; save(); return cardsHome(); }
    var k = e.target.closest("[data-cfk]"); if (k) { S.cf.k = k.dataset.cfk; save(); return cardsHome(); }
    var qc = e.target.closest("[data-qfch]"); if (qc) { S.qf.ch = qc.dataset.qfch; save(); return quizHome(); }
    var o = e.target.closest("[data-opt]"); if (o && quiz) return answer(+o.dataset.opt);
    var sq = e.target.closest("[data-q]"); if (sq) { lastQ = sq.dataset.q; var inp = document.getElementById("q"); if (inp) inp.value = lastQ; return results(); }
    if (e.target.closest("#fc") && sess && !sess.open && !e.target.closest("a")) { sess.open = true; return cardSession(); }
    var b = e.target.closest("[data-a]"); if (!b) return;
    var a = b.dataset.a;
    if (a === "find") go("#suche", true);
    else if (a === "toc") tocSheet();
    else if (a === "font") fontSheet();
    else if (a === "learn") startCards(false);
    else if (a === "learnall") startCards(true);
    else if (a === "flip") { sess.open = true; cardSession(); }
    else if (a === "again") rate(false);
    else if (a === "knew") rate(true);
    else if (a === "cardshome") go("#karten", true);
    else if (a === "quiz") startQuiz(false);
    else if (a === "quizwrong") startQuiz(true);
    else if (a === "qnext") { quiz.i++; quizStep(); scrollTo(0, 0); }
  });

  route();
})();
