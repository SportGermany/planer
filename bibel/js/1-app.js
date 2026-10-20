/* =========================================================================
   Bibeltext: vollständige Elberfelder Bibel 1905 (gemeinfrei) aus elb1905.json.
   Die Datei wird beim ersten Öffnen geladen und danach offline gespeichert.
   ========================================================================= */
(function(){
const loadEl = document.getElementById("goBtn");
if(loadEl){ loadEl.disabled = true; loadEl.textContent = "Bibel wird geladen …"; }
fetch("elb1905.json").then(r => { if(!r.ok) throw new Error(r.status); return r.json(); }).then(startApp).catch(() => {
  if(loadEl){ loadEl.textContent = "Bibel konnte nicht geladen werden – bitte einmal mit Internet öffnen"; }
});
function startApp(BIBLE){
if(loadEl) loadEl.disabled = false;
/* Bücher und Kapitel */
const BOOKS = BIBLE.books.map(b => ({ name: b[0], test: b[1], label: b[0] === "Psalm" ? "Psalmen" : b[0], count: b[2].length, chapters: [] }));
const CHAPTERS = [];
BIBLE.books.forEach((b, bi) => b[2].forEach((verses, ci) => {
  const ch = { test: b[1], book: bi, num: ci + 1, ref: b[0] + " " + (ci + 1), verses: verses.map((t, vi) => [vi + 1, t]), pre: b[3] && b[3][ci] };
  CHAPTERS.push(ch); BOOKS[bi].chapters.push(ch);
}));
const CH_BY_REF = {};
CHAPTERS.forEach(c => { CH_BY_REF[c.ref] = c; });
/* Bekannte Kapitel („Höhepunkte“): die frühere Auswahl der App als eigener Leseplan */
const HIGHLIGHTS = ["1. Mose 1", "1. Mose 3", "1. Mose 22", "2. Mose 20", "Psalm 1", "Psalm 8", "Psalm 23", "Psalm 91", "Psalm 100", "Psalm 121", "Psalm 139", "Jesaja 40", "Jona 1", "Jona 2", "Jona 3", "Jona 4", "Matthäus 5", "Matthäus 6", "Matthäus 7", "Matthäus 28", "Lukas 2", "Lukas 15", "Johannes 1", "Johannes 3", "Johannes 14", "Römer 8", "1. Korinther 13", "Offenbarung 21", "1. Mose 12", "2. Mose 3", "Psalm 27", "Psalm 46", "Psalm 103", "Sprüche 3", "Jesaja 53", "Klagelieder 3", "Lukas 1", "Lukas 10", "Apostelgeschichte 2", "Römer 12", "Galater 5", "Philipper 4", "Jakobus 1", "1. Johannes 4"];
/* Abschnitts-Nummern der früheren App-Version (zum Übernehmen von Notizen und Gelesen-Markierungen) */
const OLD_IDS = ["1. Mose 1,1–13", "1. Mose 1,14–24", "1. Mose 1,25–31", "1. Mose 3,1–10", "1. Mose 3,11–18", "1. Mose 3,19–24", "1. Mose 22,1–8", "1. Mose 22,9–18", "1. Mose 22,19", "2. Mose 20,1–14", "2. Mose 20,15–17", "Psalm 1,1–6", "Psalm 8,1–9", "Psalm 23,1–6", "Psalm 91,1–16", "Psalm 100,1–5", "Psalm 121,1–8", "Psalm 139,1–16", "Psalm 139,17–24", "Jesaja 40,1–11", "Jona 1,1–8", "Jona 1,9–16", "Jona 2,1–11", "Jona 3,1–10", "Jona 4,1–9", "Jona 4,10–11", "Matthäus 5,1–16", "Matthäus 5,17–28", "Matthäus 5,29–43", "Matthäus 5,44–48", "Matthäus 6,1–17", "Matthäus 6,18–33", "Matthäus 6,34", "Matthäus 7,1–12", "Matthäus 7,13–25", "Matthäus 7,26–29", "Matthäus 28,1–11", "Matthäus 28,12–20", "Lukas 2,1–14", "Lukas 2,15–20", "Lukas 15,11–21", "Lukas 15,22–32", "Johannes 1,1–14", "Johannes 3,1–13", "Johannes 3,14–25", "Johannes 3,26–36", "Johannes 14,1–11", "Johannes 14,12–14", "Römer 8,31–39", "1. Korinther 13,1–11", "1. Korinther 13,12–13", "Offenbarung 21,1–7", "1. Mose 12,1–9", "1. Mose 12,10–20", "2. Mose 3,1–9", "2. Mose 3,10–15", "Psalm 27,1–11", "Psalm 27,12–14", "Psalm 46,1–11", "Psalm 103,1–19", "Psalm 103,20–22", "Sprüche 3,1–12", "Jesaja 53,1–8", "Jesaja 53,9–12", "Klagelieder 3,19–33", "Lukas 1,26–38", "Lukas 10,25–34", "Lukas 10,35–37", "Apostelgeschichte 2,1–13", "Römer 12,1–13", "Galater 5,16–26", "Philipper 4,4–13", "Jakobus 1,19–27", "1. Johannes 4,7–17", "1. Johannes 4,18–21"];
/* =========================================================================
   Abschnitte in ca. 2-Minuten-Häppchen zerlegen
   ========================================================================= */
const WORDS_PER_CHUNK = 260;

// Wörter zählen ohne Zerlegen (schneller beim Start; gleiches Ergebnis wie split(/\s+/) bei getrimmtem Text)
function wordCount(t){
  let n = 0, inWord = false;
  for(let i = 0; i < t.length; i++){
    const c = t.charCodeAt(i), ws = c === 32 || c === 9 || c === 10 || c === 13 || c === 160;
    if(!ws && !inWord) n++;
    inWord = !ws;
  }
  return n || 1;
}
function chunkChapter(ch){
  // Abschnittsgrenzen liegen vorberechnet in der Bibeldatei: [Anzahl Verse, Wörter] je Abschnitt
  if(ch.pre){
    let at = 0;
    return ch.pre.map(([n, words]) => {
      const arr = ch.verses.slice(at, at + n); at += n;
      const start = arr[0][0], end = arr[arr.length-1][0];
      return { test: ch.test, chapterRef: ch.ref, book: ch.book, ref: `${ch.ref},${start === end ? start : start + "–" + end}`, verses: arr, words };
    });
  }
  const chunks = [];
  let cur = [];
  let count = 0;
  for(const v of ch.verses){
    const w = wordCount(v[1]);
    if(count + w > WORDS_PER_CHUNK && cur.length){
      chunks.push(build(cur));
      cur = []; count = 0;
    }
    cur.push(v);
    count += w;
  }
  if(cur.length) chunks.push(build(cur));
  function build(arr){
    const start = arr[0][0], end = arr[arr.length-1][0];
    const range = start === end ? `${start}` : `${start}–${end}`;
    return {
      test: ch.test,
      chapterRef: ch.ref,
      book: ch.book,
      ref: `${ch.ref},${range}`,
      verses: arr,
      words: count
    };
  }
  return chunks;
}

const READINGS = CHAPTERS.flatMap(chunkChapter);
const READ_BY_ID = {}, CHUNKS_BY_CH = {};
READINGS.forEach((r,i) => {
  r.id = r.ref; r.idx = i; READ_BY_ID[r.id] = r;
  (CHUNKS_BY_CH[r.chapterRef] = CHUNKS_BY_CH[r.chapterRef] || []).push(r);
});

/* Kurze Zitate für "Vers des Tages" / Zufallsvers - Referenzen ins bestehende Material,
   damit der Text nur an einer Stelle gepflegt werden muss. */
function findVerse(chapterRef, num){
  const ch = CH_BY_REF[chapterRef];
  if(!ch) return null;
  const v = ch.verses[num-1];
  if(!v) return null;
  return { chapterRef, num: v[0], text: v[1], test: ch.test };
}
const VOTD_POOL = [["Psalm 23", 1], ["Psalm 23", 4], ["Psalm 121", 2], ["Psalm 100", 5], ["Psalm 1", 1], ["Psalm 91", 1], ["Psalm 139", 14], ["Psalm 27", 1], ["Psalm 46", 1], ["Psalm 103", 8], ["Psalm 103", 12], ["Psalm 8", 4], ["Psalm 4", 8], ["Psalm 16", 11], ["Psalm 18", 2], ["Psalm 19", 14], ["Psalm 25", 4], ["Psalm 31", 15], ["Psalm 32", 8], ["Psalm 34", 8], ["Psalm 34", 18], ["Psalm 37", 4], ["Psalm 37", 5], ["Psalm 42", 11], ["Psalm 51", 10], ["Psalm 55", 22], ["Psalm 56", 3], ["Psalm 62", 1], ["Psalm 63", 1], ["Psalm 73", 26], ["Psalm 84", 11], ["Psalm 90", 12], ["Psalm 103", 2], ["Psalm 118", 24], ["Psalm 119", 105], ["Psalm 127", 1], ["Psalm 143", 8], ["Psalm 145", 18], ["Psalm 147", 3], ["Sprüche 3", 5], ["Sprüche 3", 6], ["Sprüche 4", 23], ["Sprüche 16", 3], ["Sprüche 16", 9], ["Sprüche 17", 17], ["Sprüche 18", 10], ["Prediger 3", 1], ["Prediger 3", 11], ["1. Mose 1", 1], ["1. Mose 1", 27], ["1. Mose 28", 15], ["2. Mose 14", 14], ["2. Mose 15", 2], ["4. Mose 6", 24], ["4. Mose 6", 25], ["4. Mose 6", 26], ["5. Mose 31", 6], ["5. Mose 31", 8], ["Josua 1", 9], ["1. Samuel 16", 7], ["Nehemia 8", 10], ["Hiob 19", 25], ["Jesaja 40", 8], ["Jesaja 40", 31], ["Jesaja 41", 10], ["Jesaja 43", 1], ["Jesaja 43", 2], ["Jesaja 53", 5], ["Jesaja 54", 10], ["Jesaja 55", 8], ["Jesaja 26", 3], ["Jeremia 29", 11], ["Jeremia 29", 13], ["Jeremia 31", 3], ["Klagelieder 3", 22], ["Klagelieder 3", 23], ["Micha 6", 8], ["Zephanja 3", 17], ["Habakuk 3", 18], ["Matthäus 5", 8], ["Matthäus 5", 9], ["Matthäus 5", 14], ["Matthäus 6", 33], ["Matthäus 6", 34], ["Matthäus 7", 7], ["Matthäus 11", 28], ["Matthäus 11", 29], ["Matthäus 28", 20], ["Markus 9", 23], ["Markus 10", 27], ["Lukas 1", 37], ["Lukas 6", 31], ["Lukas 12", 7], ["Johannes 1", 5], ["Johannes 3", 16], ["Johannes 8", 12], ["Johannes 10", 11], ["Johannes 11", 25], ["Johannes 14", 6], ["Johannes 14", 27], ["Johannes 15", 5], ["Johannes 15", 13], ["Johannes 16", 33], ["Apostelgeschichte 1", 8], ["Römer 5", 8], ["Römer 8", 28], ["Römer 8", 38], ["Römer 8", 39], ["Römer 12", 2], ["Römer 12", 12], ["Römer 12", 21], ["Römer 15", 13], ["1. Korinther 10", 13], ["1. Korinther 13", 4], ["1. Korinther 13", 7], ["1. Korinther 13", 13], ["1. Korinther 16", 14], ["2. Korinther 5", 17], ["2. Korinther 12", 9], ["Galater 5", 22], ["Galater 6", 9], ["Epheser 2", 8], ["Epheser 4", 32], ["Philipper 4", 4], ["Philipper 4", 6], ["Philipper 4", 7], ["Philipper 4", 13], ["Philipper 1", 6], ["Kolosser 3", 23], ["1. Thessalonicher 5", 16], ["1. Thessalonicher 5", 17], ["1. Thessalonicher 5", 18], ["2. Timotheus 1", 7], ["Hebräer 11", 1], ["Hebräer 12", 1], ["Hebräer 13", 5], ["Hebräer 13", 8], ["Jakobus 1", 5], ["Jakobus 1", 22], ["1. Petrus 5", 7], ["1. Johannes 1", 9], ["1. Johannes 4", 18], ["1. Johannes 4", 19], ["1. Johannes 4", 16], ["Offenbarung 21", 4], ["Offenbarung 3", 20]];
function dayOfYear(d){
  const start = new Date(d.getFullYear(),0,0);
  return Math.floor((d - start) / 86400000);
}
function getVerseOfDay(){
  const idx = dayOfYear(new Date()) % VOTD_POOL.length;
  const [ref, num] = VOTD_POOL[idx];
  return findVerse(ref, num);
}
function getRandomVerse(){
  // halb aus den ausgewählten Versen, halb aus der ganzen Bibel
  if(Math.random() < .5){ const [ref, num] = VOTD_POOL[Math.floor(Math.random()*VOTD_POOL.length)]; const f = findVerse(ref, num); if(f) return f; }
  const ch = CHAPTERS[Math.floor(Math.random()*CHAPTERS.length)];
  const v = ch.verses[Math.floor(Math.random()*ch.verses.length)];
  return { chapterRef: ch.ref, num: v[0], text: v[1], test: ch.test };
}

/* =========================================================================
   Zustand & Speicherung
   ========================================================================= */
const STORAGE_KEY = "zweiminutenbibel_v2";
const STORAGE_KEY_OLD = "zweiminutenbibel_v1";

function todayStr(d = new Date()){
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}
function addDays(dateStr, n){
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate()+n);
  return todayStr(d);
}
function defaultState(){
  return {
    streak:0, totalDays:0, lastDate:null,
    v:3, plan:"bibel", dailyGoal:1, todayDone:null,
    filter:"ALL", readMode:"sequential",
    cursors:{},
    todayReadingRef: null,
    readLog:{},
    history:[],
    favorites:{},
    highlights:{},
    notes:{},
    readChunks:{},
    theme:"dark", fontSize:"md", fontStyle:"serif", autoNight:false
  };
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      return migrate(Object.assign(defaultState(), { v: 0 }, parsed));
    }
    const old = localStorage.getItem(STORAGE_KEY_OLD);
    if(old){
      const o = JSON.parse(old);
      const s = defaultState();
      s.streak = o.streak || 0;
      s.totalDays = o.totalDays || 0;
      s.lastDate = o.lastDate || null;
      s.filter = o.filter || "ALL";
      return s;
    }
  }catch(e){}
  return defaultState();
}
/* Daten der früheren App-Version (44 Kapitel, Abschnitte als Nummern) auf die ganze Bibel übertragen */
function newIdForOldRef(ref){
  const m = /^(.*\s\d+),(\d+)/.exec(ref || "");
  if(!m) return null;
  const c = findChunkContainingVerse(m[1], parseInt(m[2],10));
  return c ? c.id : null;
}
function migrate(st){
  if(st.v >= 3) return st;
  const conv = id => newIdForOldRef(OLD_IDS[parseInt(id,10)]);
  const rc = {}; Object.keys(st.readChunks || {}).forEach(id => { const n = conv(id); if(n) rc[n] = true; }); st.readChunks = rc;
  const notes = {}; Object.keys(st.notes || {}).forEach(id => { const n = conv(id); if(n) notes[n] = notes[n] ? notes[n] + "\n\n" + st.notes[id] : st.notes[id]; }); st.notes = notes;
  st.history = (st.history || []).map(h => ({ id: conv(h.id), ts: h.ts })).filter(h => h.id);
  st.todayReadingRef = newIdForOldRef(st.todayReadingRef);
  // Fortschritt im bisherigen Leseplan bleibt unter „Höhepunkte“ erhalten
  const oc = st.cursors || {}, cur = {};
  ["ALL","AT","NT"].forEach(f => {
    const oldPool = OLD_IDS.filter(r => f === "ALL" || (CH_BY_REF[r.split(",")[0]] || {}).test === f);
    const pos = oc[f] || 0;
    if(!pos) return;
    const n = newIdForOldRef(oldPool[(pos-1) % oldPool.length]);
    const np = planPool("hl", f), i = np.findIndex(x => x.id === n);
    if(i >= 0) cur["hl:" + f] = i + 1;
  });
  st.cursors = cur;
  st.plan = "bibel";
  st.v = 3;
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); }catch(e){}
  return st;
}
function saveState(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){} }

const POOLS = {};
let state = loadState();
let highlightMode = false;

/* =========================================================================
   Hilfsfunktionen
   ========================================================================= */
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function verseKey(chapterRef, num){ return chapterRef + "::" + num; }
function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(()=> t.classList.remove("show"), 2200);
}
function planPool(plan, filter){
  const k = plan + ":" + filter;
  if(!POOLS[k]){
    const base = plan === "hl" ? HIGHLIGHTS.flatMap(ref => CHUNKS_BY_CH[ref] || []) : READINGS;
    POOLS[k] = filter === "ALL" ? base : base.filter(r => r.test === filter);
  }
  return POOLS[k];
}
function pool(){ return planPool(state.plan || "bibel", state.filter); }
function cursorKey(){ return (state.plan || "bibel") + ":" + state.filter; }
function poolForChapter(chapterRef){
  return CHUNKS_BY_CH[chapterRef] || [];
}
function findChunkContainingVerse(chapterRef, num){
  return (CHUNKS_BY_CH[chapterRef] || []).find(r => r.verses.some(v => v[0] === num));
}
function markReadAndHistory(r){
  state.readChunks[r.id] = true;
  const last = state.history[0];
  if(!last || last.id !== r.id){
    state.history.unshift({ id:r.id, ts: Date.now() });
    if(state.history.length > 60) state.history.length = 60;
  } else {
    last.ts = Date.now();
  }
  saveState();
}

/* Tagesziel: wie viele Abschnitte heute gelesen wurden */
function todayCount(){ const t = state.todayDone; return t && t.date === todayStr() ? t.ids.length : 0; }
function countToday(r){
  if(!state.todayDone || state.todayDone.date !== todayStr()) state.todayDone = { date: todayStr(), ids: [] };
  if(state.todayDone.ids.indexOf(r.id) < 0){
    state.todayDone.ids.push(r.id);
    const g = state.dailyGoal || 1;
    if(g > 1 && state.todayDone.ids.length === g) showToast("Tagesziel erreicht – " + g + " Abschnitte gelesen. Du kannst gern weiterlesen.");
  }
  saveState();
}
function minutesFor(words){ return Math.max(1, Math.round(words / 150)); }

/* =========================================================================
   Passage-Komponente (wiederverwendbar für "Heute" und Overlay)
   ========================================================================= */
function makePassageComponent(rootEl, isHeute){
  let curPool = [];
  let idx = 0;

  function current(){ return curPool[idx]; }

  function verseHtml(r){
    return r.verses.map(v => {
      const num = v[0], text = v[1];
      const key = verseKey(r.chapterRef, num);
      const isFav = !!state.favorites[key];
      const hl = state.highlights[key];
      const hlClass = hl ? ("hl-" + hl) : "";
      return `<span class="v ${hlClass}" data-key="${key}"><sup class="vnum ${isFav?'fav':''}" data-num="${num}">${num}</sup>${escapeHtml(text)}</span>`;
    }).join(" ");
  }

  function nextLabel(r){
    const nx = curPool[(idx+1) % curPool.length];
    const where = nx && nx.chapterRef !== r.chapterRef ? " · " + escapeHtml(nx.chapterRef) : "";
    if(isHeute){
      const g = state.dailyGoal || 1, n = todayCount();
      if(n < g) return "Weiter (" + (n+1) + " / " + g + ")" + where + " ›";
      return "Weiterlesen" + where + " ›";
    }
    return "Nächster Abschnitt" + where + " ›";
  }
  function render(){
    const r = current();
    if(!r){ rootEl.classList.remove("show"); rootEl.innerHTML=""; return; }
    const noteVal = state.notes[r.id] || "";
    rootEl.innerHTML = `
      <span class="badge ${r.test}">${r.test === "AT" ? "Altes Testament" : "Neues Testament"}</span>
      <h2>${escapeHtml(r.ref)}</h2>
      <div class="verse-text" id="vt-${rootEl.id}">${verseHtml(r)}</div>
      <div class="meta"><span>${r.words} Wörter · ca. ${minutesFor(r.words)} Min.</span><span>${isHeute ? "Heute " + Math.min(todayCount(), state.dailyGoal || 1) + " / " + (state.dailyGoal || 1) : escapeHtml(BOOKS[r.book].label) + " · Kapitel " + CH_BY_REF[r.chapterRef].num + " von " + BOOKS[r.book].count}</span></div>
      <div class="toolbar">
        <button data-act="fav-mode" class="${highlightMode?'':''}" title="Verse antippen markiert/entmarkiert Favorit">★ Favorit</button>
        <button data-act="hl-mode" class="${highlightMode?'on':''}" title="Verse antippen zum Farbmarkieren">🖍 Markieren</button>
        <button data-act="speak">🔊 Vorlesen</button>
        <button data-act="copy">⧉ Kopieren</button>
        <button data-act="share">↗ Teilen</button>
      </div>
      <div class="note-box">
        <label>Notiz zu diesem Abschnitt</label>
        <textarea data-act="note" placeholder="Eigene Gedanken, Gebetsanliegen …">${escapeHtml(noteVal)}</textarea>
      </div>
      <div class="nav-row">
        <button data-act="prev" style="visibility:${idx>0?'visible':'hidden'}">‹ Zurück</button>
        <button data-act="next" class="next">${nextLabel(r)}</button>
      </div>
    `;
    rootEl.classList.add("show");
    wire();
    refreshAllStats();
  }

  function wire(){
    rootEl.onclick = (e) => {
      const actEl = e.target.closest("[data-act]");
      if(actEl){
        const act = actEl.dataset.act;
        if(act === "prev") return goPrev();
        if(act === "next") return goNext();
        if(act === "hl-mode"){ highlightMode = !highlightMode; render(); return; }
        if(act === "speak") return speakCurrent(actEl);
        if(act === "copy") return copyCurrent();
        if(act === "share") return shareCurrent();
        return;
      }
      const numEl = e.target.closest(".vnum");
      if(numEl){
        const num = parseInt(numEl.dataset.num,10);
        const r = current();
        const key = verseKey(r.chapterRef, num);
        if(highlightMode){
          const order = [undefined,"yellow","green","blue"];
          const cur = state.highlights[key];
          const nextIdx = (order.indexOf(cur)+1) % order.length;
          const next = order[nextIdx];
          if(next){ state.highlights[key] = next; } else { delete state.highlights[key]; }
        } else {
          if(state.favorites[key]){ delete state.favorites[key]; }
          else { state.favorites[key] = true; }
        }
        saveState();
        render();
      }
    };
    const ta = rootEl.querySelector('[data-act="note"]');
    if(ta){
      ta.addEventListener("input", () => {
        clearTimeout(ta._tm);
        ta._tm = setTimeout(() => {
          const r = current();
          if(ta.value.trim()) state.notes[r.id] = ta.value;
          else delete state.notes[r.id];
          saveState();
          refreshAllStats();
        }, 400);
      });
    }
  }

  function speakCurrent(btn){
    if(!("speechSynthesis" in window)){ showToast("Vorlesen wird von diesem Browser nicht unterstützt."); return; }
    if(speechSynthesis.speaking){ speechSynthesis.cancel(); btn.classList.remove("speaking"); btn.textContent="🔊 Vorlesen"; return; }
    const r = current();
    const text = r.verses.map(v=>v[1]).join(" ");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.onend = () => { btn.classList.remove("speaking"); btn.textContent="🔊 Vorlesen"; };
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    btn.classList.add("speaking");
    btn.textContent = "⏹ Stop";
  }
  function currentPlainText(){
    const r = current();
    return `${r.ref} (Elberfelder 1905)\n\n` + r.verses.map(v=>`${v[0]} ${v[1]}`).join(" ");
  }
  function copyCurrent(){
    const text = currentPlainText();
    if(navigator.clipboard){
      navigator.clipboard.writeText(text).then(()=>showToast("In die Zwischenablage kopiert.")).catch(()=>showToast("Kopieren fehlgeschlagen."));
    } else { showToast("Kopieren wird hier nicht unterstützt."); }
  }
  function shareCurrent(){
    const text = currentPlainText();
    if(navigator.share){
      navigator.share({ text }).catch(()=>{});
    } else {
      copyCurrent();
    }
  }

  function show(reading, p){
    curPool = p;
    idx = p.findIndex(x => x.id === reading.id);
    if(idx < 0) idx = 0;
    markReadAndHistory(reading);
    render();
  }
  function goNext(){
    if(!curPool.length) return;
    idx = (idx+1) % curPool.length;
    markReadAndHistory(curPool[idx]);
    if(isHeute){
      countToday(curPool[idx]);
      // Fortlaufend: morgen geht es hinter dem zuletzt gelesenen Abschnitt weiter
      if(state.readMode !== "random" && curPool === pool()){
        const k = cursorKey();
        if(((state.cursors[k] || 0) % curPool.length) <= idx) { state.cursors[k] = idx + 1; saveState(); }
      }
    }
    render();
    if(isHeute) renderToggle();
    rootEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function goPrev(){
    if(!curPool.length || idx===0) return;
    idx -= 1;
    markReadAndHistory(curPool[idx]);
    render();
  }
  function isVisible(){ return rootEl.classList.contains("show"); }

  return { show, goNext, goPrev, isVisible, current };
}

const heutePassage = makePassageComponent(document.getElementById("passageHeute"), true);
const overlayPassage = makePassageComponent(document.getElementById("passageOverlayContent"));

/* Overlay öffnen/schließen */
const overlayEl = document.getElementById("passageOverlay");
function openOverlay(reading, chapterPool){
  overlayEl.classList.add("show");
  // Im Lesefenster geht „Weiter“ über das Kapitelende hinaus ins nächste Kapitel
  overlayPassage.show(reading, chapterPool || READINGS);
}
document.getElementById("overlayClose").addEventListener("click", () => {
  overlayEl.classList.remove("show");
  if(speechSynthesis.speaking) speechSynthesis.cancel();
});
overlayEl.addEventListener("click", (e) => { if(e.target === overlayEl){ overlayEl.classList.remove("show"); if(speechSynthesis.speaking) speechSynthesis.cancel(); } });

/* Tastatursteuerung */
document.addEventListener("keydown", (e) => {
  if(e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  const useOverlay = overlayEl.classList.contains("show");
  const comp = useOverlay ? overlayPassage : heutePassage;
  if(!comp.isVisible()) return;
  if(e.key === "ArrowRight") comp.goNext();
  if(e.key === "ArrowLeft") comp.goPrev();
});

/* =========================================================================
   TAB: HEUTE
   ========================================================================= */
const streakNum = document.getElementById("streakNum");
const totalNum = document.getElementById("totalNum");
const goBtn = document.getElementById("goBtn");
const testToggleBtns = document.querySelectorAll("#testToggle button");
const modeToggleBtns = document.querySelectorAll("#modeToggle button");

function renderStats(){
  streakNum.textContent = state.streak;
  totalNum.textContent = state.totalDays;
}
function renderCalendarStrip(){
  const el = document.getElementById("calStrip");
  el.innerHTML = "";
  const today = new Date();
  for(let i=13;i>=0;i--){
    const d = new Date(today); d.setDate(d.getDate()-i);
    const ds = todayStr(d);
    const dot = document.createElement("div");
    dot.className = "cal-dot" + (state.readLog[ds] ? " hit" : "") + (ds===todayStr()?" today":"");
    dot.title = ds;
    el.appendChild(dot);
  }
}
function renderToggle(){
  testToggleBtns.forEach(b => b.classList.toggle("active", b.dataset.filter === state.filter));
  modeToggleBtns.forEach(b => b.classList.toggle("active", b.dataset.mode === state.readMode));
  document.querySelectorAll("#planToggle button").forEach(b => b.classList.toggle("active", b.dataset.plan === (state.plan || "bibel")));
  document.querySelectorAll("#goalRow button").forEach(b => b.classList.toggle("active", +b.dataset.goal === (state.dailyGoal || 1)));
  const p = pool(), hint = document.getElementById("nextHint");
  if(state.readMode === "random") hint.textContent = "Zufällige Abschnitte aus " + (state.plan === "hl" ? "bekannten Kapiteln" : "der ganzen Bibel");
  else {
    const pos = (state.cursors[cursorKey()] || 0) % p.length, nx = p[pos];
    hint.textContent = nx ? (state.lastDate === todayStr() ? "Morgen geht es weiter mit " : "Als Nächstes: ") + nx.chapterRef + " · " + (pos / p.length * 100).toLocaleString("de-DE", { maximumFractionDigits: pos / p.length < .1 ? 1 : 0 }) + " % geschafft" : "";
  }
}
document.getElementById("planToggle").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if(!b) return;
  state.plan = b.dataset.plan; saveState(); renderToggle();
});
document.getElementById("goalRow").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if(!b) return;
  state.dailyGoal = +b.dataset.goal; saveState(); renderToggle();
  if(heutePassage.isVisible()) heutePassage.show(heutePassage.current(), pool());
});
function renderVerseOfDay(){
  const v = getVerseOfDay();
  document.getElementById("votdText").textContent = "„" + v.text + "“";
  document.getElementById("votdRef").textContent = v.chapterRef + "," + v.num + " · " + (v.test==="AT"?"Altes Testament":"Neues Testament");
}
document.getElementById("votdOpenBtn").addEventListener("click", () => {
  const v = getVerseOfDay();
  const chunk = findChunkContainingVerse(v.chapterRef, v.num);
  if(chunk) openOverlay(chunk);
});

function updateGoButtonLabel(){
  goBtn.textContent = state.lastDate === todayStr() ? "Heute gelesen ✓ — weiterlesen" : "Heute lesen";
  goBtn.classList.toggle("done", state.lastDate === todayStr());
}

function lastTodayReading(){
  const t = state.todayDone;
  return (t && t.date === todayStr() && READ_BY_ID[t.ids[t.ids.length-1]]) || READ_BY_ID[state.todayReadingRef];
}
function readToday(){
  const today = todayStr();
  if(state.lastDate === today && state.todayReadingRef){
    // schon gelesen: dort weiter, wo du zuletzt warst
    const r = lastTodayReading();
    if(r){ heutePassage.show(r, pool()); return; }
  }
  if(state.lastDate === addDays(today, -1)){ state.streak += 1; } else { state.streak = 1; }
  state.totalDays += 1;
  state.lastDate = today;
  state.readLog[today] = true;

  const p = pool();
  let idx;
  if(state.readMode === "random"){
    idx = Math.floor(Math.random() * p.length);
  } else {
    idx = (state.cursors[cursorKey()] || 0) % p.length;
    state.cursors[cursorKey()] = idx + 1;
  }
  const reading = p[idx];
  state.todayReadingRef = reading.ref;
  countToday(reading);

  saveState();
  renderStats();
  renderCalendarStrip();
  updateGoButtonLabel();
  renderToggle();
  heutePassage.show(reading, p);
  renderLibrary();
}

testToggleBtns.forEach(b => {
  b.addEventListener("click", () => { state.filter = b.dataset.filter; saveState(); renderToggle(); });
});
modeToggleBtns.forEach(b => {
  b.addEventListener("click", () => { state.readMode = b.dataset.mode; saveState(); renderToggle(); });
});
goBtn.addEventListener("click", readToday);

/* =========================================================================
   TAB: BIBLIOTHEK
   ========================================================================= */
const searchInput = document.getElementById("searchInput");
const searchResultsEl = document.getElementById("searchResults");
const libraryDefaultEl = document.getElementById("libraryDefault");

let openBook = null;
function chapterState(ref){
  const ch = CHUNKS_BY_CH[ref] || [];
  const n = ch.filter(c => state.readChunks[c.id]).length;
  return n === 0 ? "" : n === ch.length ? "all" : "some";
}
function renderBookTree(){
  const el = document.getElementById("bookTree");
  let html = "";
  [["AT","Altes Testament"],["NT","Neues Testament"]].forEach(([test, title]) => {
    html += `<div class="book-group"><h3><span class="tdot ${test}"></span>${title}</h3><div class="book-list">`;
    BOOKS.forEach((bk, bi) => {
      if(bk.test !== test) return;
      const done = bk.chapters.filter(c => chapterState(c.ref) === "all").length;
      const isOpen = openBook === bi;
      html += `<div class="book${isOpen ? " open" : ""}"><button class="book-h" data-book="${bi}"><span class="bn">${escapeHtml(bk.label)}</span>` +
        `<span class="bc">${done ? done + " / " : ""}${bk.count} Kap.</span><span class="bar"><i style="width:${Math.round(done / bk.count * 100)}%"></i></span></button>`;
      if(isOpen){
        html += `<div class="chap-grid">` + bk.chapters.map(c => {
          const st = chapterState(c.ref);
          return `<button class="cn ${st}" data-chapterref="${escapeHtml(c.ref)}" title="${escapeHtml(c.ref)}">${c.num}</button>`;
        }).join("") + `</div>`;
      }
      html += `</div>`;
    });
    html += `</div></div>`;
  });
  el.innerHTML = html;
  el.onclick = (e) => {
    const bh = e.target.closest("[data-book]");
    if(bh){ const bi = +bh.dataset.book; openBook = openBook === bi ? null : bi; renderBookTree(); if(openBook !== null) el.querySelector(".book.open").scrollIntoView({ block: "nearest" }); return; }
    const cn = e.target.closest("[data-chapterref]");
    if(cn){ const p = poolForChapter(cn.dataset.chapterref); if(p.length) openOverlay(p[0]); }
  };
}
function renderLibraryProgress(){
  const total = READINGS.length;
  const read = Object.keys(state.readChunks).length;
  document.getElementById("libProgressBar").style.width = (total? (read/total*100) : 0) + "%";
  document.getElementById("libProgressLabel").textContent = `${read.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Abschnitten gelesen · ${CHAPTERS.filter(c => chapterState(c.ref) === "all").length.toLocaleString("de-DE")} von ${CHAPTERS.length.toLocaleString("de-DE")} Kapiteln`;
}
function renderLibrary(){
  renderBookTree();
  renderLibraryProgress();
}
/* Bibelstelle erkennen: „Joh 3,16“, „ps 23“, „1 kor 13“, „Römer 8:28“ */
function norm(t){ return t.toLowerCase().replace(/[.\s]/g, "").replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue"); }
function parseRef(q){
  const m = /^\s*(\d?\.?\s*[a-zäöüß]+)\.?\s*(\d+)(?:\s*[,:]\s*(\d+))?\s*$/i.exec(q);
  if(!m) return null;
  let key = norm(m[1]);
  const ALIAS = { mt:"matthaeus", mk:"markus", lk:"lukas", apg:"apostelgeschichte", offb:"offenbarung", off:"offenbarung", hld:"hohelied", klgl:"klagelieder", ez:"hesekiel", obd:"obadja", mi:"micha", phlm:"philemon", gen:"1mose", ex:"2mose", lev:"3mose", num:"4mose", dtn:"5mose", ri:"richter", rt:"ruth", ijob:"hiob", sir:"" };
  const k2 = key.replace(/^\d/, ""), pre = key.slice(0, key.length - k2.length);
  if(ALIAS[k2]) key = pre + ALIAS[k2];
  const bk = BOOKS.find(b => norm(b.name).indexOf(key) === 0) || BOOKS.find(b => norm(b.label).indexOf(key) === 0);
  if(!bk) return null;
  const ch = bk.chapters[parseInt(m[2],10)-1];
  if(!ch) return null;
  const v = m[3] ? Math.min(parseInt(m[3],10), ch.verses.length) : 1;
  return { ch, v };
}
function runSearch(q){
  const raw = q;
  q = q.trim().toLowerCase();
  if(!q){ searchResultsEl.innerHTML=""; libraryDefaultEl.style.display="block"; return; }
  libraryDefaultEl.style.display = "none";
  const matches = [];
  const ref = parseRef(raw);
  if(ref) matches.push({ r: { chapterRef: ref.ch.ref }, num: ref.v, text: ref.ch.verses[ref.v-1][1], direct: true });
  if(q.length >= 3) outer: for(const ch of CHAPTERS){
    for(const v of ch.verses){
      if(v[1].toLowerCase().includes(q)){
        matches.push({ r: { chapterRef: ch.ref }, num: v[0], text: v[1] });
        if(matches.length >= 100) break outer;
      }
    }
  }
  if(!matches.length){ searchResultsEl.innerHTML = `<div class="empty-hint">${q.length < 3 ? "Bitte mindestens 3 Buchstaben eingeben – oder eine Stelle wie „Joh 3,16“." : "Keine Treffer für „" + escapeHtml(q) + "“."}</div>`; return; }
  const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + ")", "ig");
  searchResultsEl.innerHTML = matches.map(m => {
    const snip = escapeHtml(m.text).replace(re, "<mark>$1</mark>");
    return `<div class="result-row" data-chapterref="${escapeHtml(m.r.chapterRef)}" data-num="${m.num}">
      <div class="rr-ref">${m.direct ? "→ " : ""}${escapeHtml(m.r.chapterRef)},${m.num}</div>
      <div class="rr-snip">${snip}</div>
    </div>`;
  }).join("");
  searchResultsEl.querySelectorAll(".result-row").forEach(row => {
    row.addEventListener("click", () => {
      const chapterRef = row.dataset.chapterref;
      const num = parseInt(row.dataset.num,10);
      const chunk = findChunkContainingVerse(chapterRef, num);
      if(chunk) openOverlay(chunk);
    });
  });
}
let searchTm;
searchInput.addEventListener("input", () => { clearTimeout(searchTm); searchTm = setTimeout(() => runSearch(searchInput.value), 180); });

/* =========================================================================
   TAB: MEINE BIBEL
   ========================================================================= */
const subtabBtns = document.querySelectorAll("#subtabs button");
const subPanels = { fav: document.getElementById("subFav"), notes: document.getElementById("subNotes"), history: document.getElementById("subHistory") };
subtabBtns.forEach(b => {
  b.addEventListener("click", () => {
    subtabBtns.forEach(x=>x.classList.toggle("active", x===b));
    Object.keys(subPanels).forEach(k => subPanels[k].classList.toggle("active", k===b.dataset.sub));
  });
});

function renderFavorites(){
  const keys = Object.keys(state.favorites);
  if(!keys.length){ subPanels.fav.innerHTML = `<div class="empty-hint">Noch keine Favoriten. Tippe in einem Abschnitt auf eine Versnummer, um sie zu markieren.</div>`; return; }
  subPanels.fav.innerHTML = keys.map(key => {
    const [chapterRef, numStr] = key.split("::");
    const num = parseInt(numStr,10);
    const v = findVerse(chapterRef, num);
    if(!v) return "";
    return `<div class="list-row" data-chapterref="${escapeHtml(chapterRef)}" data-num="${num}">
      <div class="lr-ref">★ ${escapeHtml(chapterRef)},${num}</div>
      <div class="lr-snip">${escapeHtml(v.text)}</div>
    </div>`;
  }).join("");
  wireListRows(subPanels.fav);
}
function renderNotesList(){
  const ids = Object.keys(state.notes);
  if(!ids.length){ subPanels.notes.innerHTML = `<div class="empty-hint">Noch keine Notizen. Du kannst in jedem Abschnitt unten eine Notiz eintragen.</div>`; return; }
  subPanels.notes.innerHTML = ids.map(id => {
    const r = READ_BY_ID[id];
    if(!r) return "";
    return `<div class="list-row" data-id="${escapeHtml(id)}">
      <div class="lr-ref">${escapeHtml(r.ref)}</div>
      <div class="lr-snip">${escapeHtml(state.notes[id])}</div>
    </div>`;
  }).join("");
  subPanels.notes.querySelectorAll(".list-row").forEach(row => {
    row.addEventListener("click", () => {
      const r = READ_BY_ID[row.dataset.id];
      if(r) openOverlay(r);
    });
  });
}
function renderHistoryList(){
  if(!state.history.length){ subPanels.history.innerHTML = `<div class="empty-hint">Noch kein Leseverlauf vorhanden.</div>`; return; }
  subPanels.history.innerHTML = state.history.map(h => {
    const r = READ_BY_ID[h.id];
    if(!r) return "";
    const d = new Date(h.ts);
    const ds = d.toLocaleDateString("de-DE") + " · " + d.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
    return `<div class="list-row" data-id="${escapeHtml(h.id)}">
      <div class="lr-ref">${escapeHtml(r.ref)}</div>
      <div class="lr-snip" style="font-family:var(--sans); font-size:.72rem; color:var(--muted);">${ds}</div>
    </div>`;
  }).join("");
  subPanels.history.querySelectorAll(".list-row").forEach(row => {
    row.addEventListener("click", () => {
      const r = READ_BY_ID[row.dataset.id];
      if(r) openOverlay(r);
    });
  });
}
function wireListRows(container){
  container.querySelectorAll(".list-row").forEach(row => {
    row.addEventListener("click", () => {
      const chapterRef = row.dataset.chapterref;
      const num = parseInt(row.dataset.num,10);
      const chunk = findChunkContainingVerse(chapterRef, num);
      if(chunk) openOverlay(chunk);
    });
  });
}
document.getElementById("randomVerseBtn").addEventListener("click", () => {
  const v = getRandomVerse();
  const chunk = findChunkContainingVerse(v.chapterRef, v.num);
  if(chunk) openOverlay(chunk);
});

/* =========================================================================
   TAB: MEHR (Einstellungen)
   ========================================================================= */
function isNightHours(){
  const h = new Date().getHours();
  return h >= 21 || h < 7;
}
function effectiveTheme(){
  return (state.autoNight && isNightHours()) ? "night" : state.theme;
}
function applyDisplaySettings(){
  const eff = effectiveTheme();
  document.documentElement.setAttribute("data-theme", eff);
  document.body.setAttribute("data-fontsize", state.fontSize);
  document.body.setAttribute("data-fontstyle", state.fontStyle);
  document.querySelectorAll("#themeRow button").forEach(b => b.classList.toggle("active", b.dataset.theme===state.theme));
  document.querySelectorAll("#fontSizeRow button").forEach(b => b.classList.toggle("active", b.dataset.size===state.fontSize));
  document.querySelectorAll("#fontStyleRow button").forEach(b => b.classList.toggle("active", b.dataset.fstyle===state.fontStyle));
  const cb = document.getElementById("autoNightToggle");
  if(cb) cb.checked = !!state.autoNight;
  const statusEl = document.getElementById("autoNightStatus");
  if(statusEl){
    if(state.autoNight && eff === "night" && state.theme !== "night"){
      statusEl.style.display = "block";
      statusEl.textContent = "Gerade aktiv: Nachtmodus (automatisch bis 7 Uhr).";
    } else {
      statusEl.style.display = "none";
    }
  }
  const metaTheme = document.getElementById("themeColorMeta");
  if(metaTheme){
    const bgVal = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    if(bgVal) metaTheme.setAttribute("content", bgVal);
  }
}
document.getElementById("themeRow").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if(!b) return;
  state.theme = b.dataset.theme; saveState(); applyDisplaySettings();
});
document.getElementById("fontSizeRow").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if(!b) return;
  state.fontSize = b.dataset.size; saveState(); applyDisplaySettings();
});
document.getElementById("fontStyleRow").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if(!b) return;
  state.fontStyle = b.dataset.fstyle; saveState(); applyDisplaySettings();
});
document.getElementById("autoNightToggle").addEventListener("change", (e) => {
  state.autoNight = e.target.checked; saveState(); applyDisplaySettings();
  showToast(state.autoNight ? "Automatischer Nachtmodus aktiviert." : "Automatischer Nachtmodus deaktiviert.");
});
/* Nachtmodus zeitgesteuert nachprüfen: beim Zurückkehren in den Vordergrund
   und alle 5 Minuten, damit der Wechsel auch bei offener App greift. */
document.addEventListener("visibilitychange", () => { if(!document.hidden) applyDisplaySettings(); });
setInterval(applyDisplaySettings, 5*60*1000);

function refreshAllStats(){
  document.getElementById("chapterCountLabel").textContent = BOOKS.length + " Bücher · " + CHAPTERS.length.toLocaleString("de-DE") + " Kapitel";
  document.getElementById("statChapters").textContent = READINGS.length.toLocaleString("de-DE");
  document.getElementById("statRead").textContent = Object.keys(state.readChunks).length;
  document.getElementById("statFav").textContent = Object.keys(state.favorites).length;
  document.getElementById("statNotes").textContent = Object.keys(state.notes).length;
}

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zwei-minuten-bibel-backup-${todayStr()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast("Sicherung wurde heruntergeladen.");
});
document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const imported = JSON.parse(reader.result);
      if(!confirm("Gesicherte Daten einspielen? Der aktuelle Stand auf diesem Gerät wird überschrieben.")) return;
      state = migrate(Object.assign(defaultState(), imported.v ? imported : Object.assign({}, imported, { v: 0 })));
      saveState();
      fullRerender();
      showToast("Daten wurden wiederhergestellt.");
    }catch(err){
      showToast("Diese Datei konnte nicht gelesen werden.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});
document.getElementById("resetBtn").addEventListener("click", () => {
  if(confirm("Wirklich ALLES zurücksetzen? Streak, Favoriten, Notizen, Markierungen und Fortschritt gehen dabei verloren.")){
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_OLD);
    state = defaultState();
    highlightMode = false;
    fullRerender();
    showToast("Zurückgesetzt.");
  }
});

/* =========================================================================
   Tab-Navigation
   ========================================================================= */
const tabButtons = document.querySelectorAll(".tabbar button");
const views = { heute: document.getElementById("view-heute"), bibliothek: document.getElementById("view-bibliothek"), meinebibel: document.getElementById("view-meinebibel"), mehr: document.getElementById("view-mehr") };
tabButtons.forEach(b => {
  b.addEventListener("click", () => {
    tabButtons.forEach(x => x.classList.toggle("active", x===b));
    Object.keys(views).forEach(k => views[k].classList.toggle("active", k===b.dataset.tab));
    if(b.dataset.tab === "bibliothek") renderLibrary();
    if(b.dataset.tab === "meinebibel"){ renderFavorites(); renderNotesList(); renderHistoryList(); }
    if(b.dataset.tab === "mehr") refreshAllStats();
  });
});

/* =========================================================================
   Initiales Rendern
   ========================================================================= */
function fullRerender(){
  applyDisplaySettings();
  renderStats();
  renderCalendarStrip();
  renderToggle();
  renderVerseOfDay();
  updateGoButtonLabel();
  renderLibrary();
  renderFavorites();
  renderNotesList();
  renderHistoryList();
  refreshAllStats();
  if(state.lastDate === todayStr() && state.todayReadingRef){
    const r = lastTodayReading();
    if(r) heutePassage.show(r, pool());
  }
}
fullRerender();
// Sprungziele aus dem Befehlsmenü der anderen Apps
function bibleHash(){
  const h = location.hash.replace("#", "");
  if(!h) return;
  history.replaceState(null, "", location.pathname);
  const tab = t => { const b = document.querySelector('.tabbar [data-tab="' + t + '"]'); if(b) b.click(); };
  if(h === "lesen"){ tab("heute"); readToday(); document.getElementById("passageHeute").scrollIntoView({ behavior: "smooth" }); }
  else if(h === "zufall"){ tab("meinebibel"); document.getElementById("randomVerseBtn").click(); }
  else if(["heute", "bibliothek", "meinebibel", "mehr"].indexOf(h) > -1) tab(h);
  else if(/^stelle=/.test(h)){
    // Bibelstelle aus der Suche: stelle=<Buch>.<Kapitel>[.<Vers>] (Buch als Nummer 0–65) → Abschnitt mit diesem Vers öffnen
    const p = decodeURIComponent(h.slice(7)).split("."), bk = BOOKS[+p[0]], ch = bk && bk.chapters[(+p[1] || 1) - 1];
    if(!ch) return;
    const list = CHUNKS_BY_CH[ch.ref] || [], v = +p[2] || 1;
    const chunk = list.find(r => r.verses.some(x => x[0] === v)) || list[0];
    if(chunk){ tab("heute"); openOverlay(chunk); }
  }
}
window.addEventListener("hashchange", bibleHash);
bibleHash();
window.SGBibelReady = true;
} // startApp
})();
