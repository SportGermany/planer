'use strict';
/* Lernkarten je Fach (Schule 2.0, werkzeuge/PLAN-EINZEL.md Schritt 6) – Karteikasten mit Wiederholung.
 * Daten in db.cards (gleicher Speicher und Abgleich wie die übrige Schul-App): { id, subject, front, back, box, due, u }.
 * Fächer: Kasten 0–4 → nächste Abfrage nach 0, 1, 3, 7, 14 Tagen. Gewusst → ein Kasten weiter, nicht gewusst → Kasten 0.
 * Einstiege: Fach-Blatt (Stundenplan › Fach antippen) und Karte oben in „Aufgaben“. */
(function () {
  const STEP = [0, 1, 3, 7, 14];
  const cards = () => (db.cards = db.cards || []);
  const due = sid => cards().filter(c => (!sid || c.subject === sid) && (!c.due || c.due <= todayStr()));
  let run = null;   // laufende Abfrage { list, i, show, ok, no }

  window.kkSummaryHTML = function (sid) {
    const all = cards().filter(c => !sid || c.subject === sid), d = due(sid).length;
    if (!sid && !all.length) return '';
    const btns = `<div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap">${d ? `<button class="btn" data-kk="learn:${sid || ''}">Lernen (${d})</button>` : ''}${sid ? `<button class="btn ghost" data-kk="add:${sid}">Karte hinzufügen</button>` : ''}${all.length ? `<button class="btn ghost" data-kk="list:${sid || ''}">Alle Karten</button>` : ''}</div>`;
    return `<div class="sec">Lernkarten <span class="cnt">${all.length}</span></div><div class="card kk-sum"><div>${all.length ? (d ? `<b>${d} fällig</b> · ` : 'Heute nichts fällig · ') + all.filter(c => (c.box || 0) >= 4).length + ' sicher gelernt' : 'Fragen auf die Vorderseite, Antworten auf die Rückseite – die App fragt dich nach 1, 3, 7 und 14 Tagen wieder ab.'}</div>${btns}</div>`;
  };
  function addSheet(sid, card) {
    const c = card || { id: 'k' + uid(), subject: sid, front: '', back: '', box: 0, due: '' };
    openSheet(sheetHead(card ? 'Karte bearbeiten' : 'Neue Lernkarte · ' + esc(subj(c.subject).name || ''), `<button class="btn" data-kk="save:${c.id}">Speichern</button>`) +
      `<label class="fl">Vorderseite (Frage)</label><textarea class="inp" id="kkF" rows="3" placeholder="z. B. Was ist Photosynthese?">${esc(c.front)}</textarea>
       <label class="fl">Rückseite (Antwort)</label><textarea class="inp" id="kkB" rows="4">${esc(c.back)}</textarea>
       <div class="actions">${card ? `<button class="btn danger" data-kk="del:${c.id}">Karte löschen</button>` : ''}<button class="btn wide" data-kk="saveNext:${c.id}">Speichern und nächste</button></div>`, 'kk');
    addSheet.cur = c;
    setTimeout(() => { const f = document.getElementById('kkF'); if (f && !c.front) f.focus(); }, 80);
  }
  function listSheet(sid) {
    const l = cards().filter(c => !sid || c.subject === sid).sort((a, b) => (a.due || '').localeCompare(b.due || ''));
    openSheet(sheetHead('Lernkarten' + (sid ? ' · ' + esc(subj(sid).name || '') : ''), sid ? `<button class="btn" data-kk="add:${sid}">Neu</button>` : '') +
      (l.length ? `<div class="stack">${l.map(c => `<button class="card kk-li" data-kk="edit:${c.id}"><b>${esc(c.front.slice(0, 80))}</b><small>${sid ? '' : esc(subj(c.subject).name || '') + ' · '}Kasten ${(c.box || 0) + 1}/5 · ${!c.due || c.due <= todayStr() ? 'fällig' : 'wieder am ' + c.due.split('-').reverse().join('.')}</small></button>`).join('')}</div>` : '<div class="empty">Noch keine Karten.</div>'), 'kk');
  }
  function learnSheet() {
    if (!run || run.i >= run.list.length) {
      const n = run ? run.ok + run.no : 0;
      openSheet(sheetHead('Fertig', '<button class="btn" data-a="close">Schließen</button>', '') + `<div class="empty">${n ? `${run.ok} von ${n} gewusst. Nicht Gewusstes kommt morgen wieder.` : 'Nichts fällig.'}</div>`, 'kk');
      run = null; return;
    }
    const c = run.list[run.i], s = subj(c.subject);
    openSheet(sheetHead(`Karte ${run.i + 1} von ${run.list.length}`, '<button class="link" data-a="close">Beenden</button>', '') +
      `<div class="kk-card"><small>${esc(s.name || '')} · Kasten ${(c.box || 0) + 1}/5</small><div class="kk-f">${esc(c.front).replace(/\n/g, '<br>')}</div>` +
      (run.show ? `<div class="kk-b">${esc(c.back).replace(/\n/g, '<br>')}</div>` : '') + '</div>' +
      (run.show ? '<div class="row kk-btns"><button class="btn ghost" data-kk="no">Nicht gewusst</button><button class="btn" data-kk="ok">Gewusst</button></div>'
                : '<button class="btn wide" data-kk="show">Antwort zeigen</button>'), 'kk');
  }
  function grade(okk) {
    const c = run.list[run.i];
    c.box = okk ? Math.min(4, (c.box || 0) + 1) : 0;
    c.due = addDays(todayStr(), okk ? STEP[c.box] : 1);
    upsert('cards', c); save();
    if (okk) run.ok++; else run.no++;
    run.i++; run.show = false; learnSheet();
  }
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-kk]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const [k, v] = b.dataset.kk.split(':');
    if (k === 'add') return addSheet(v);
    if (k === 'list') return listSheet(v);
    if (k === 'edit') return addSheet(null, cards().find(c => c.id === v));
    if (k === 'learn') { run = { list: due(v).sort(() => Math.random() - .5), i: 0, show: false, ok: 0, no: 0 }; return learnSheet(); }
    if (k === 'show') { run.show = true; return learnSheet(); }
    if (k === 'ok' || k === 'no') return grade(k === 'ok');
    if (k === 'save' || k === 'saveNext') {
      const c = addSheet.cur, f = document.getElementById('kkF').value.trim(), bk = document.getElementById('kkB').value.trim();
      if (!f) { document.getElementById('kkF').focus(); return; }
      c.front = f; c.back = bk; upsert('cards', c); save(); toast('Lernkarte gespeichert');
      if (k === 'saveNext') return addSheet(c.subject);
      closeSheet(); render(); return;
    }
    if (k === 'del') { removeItem('cards', v); save(); closeSheet(); render(); toast('Karte gelöscht'); }
  }, true);
  const st = document.createElement('style');
  st.textContent = '.kk-sum{display:flex;flex-direction:column;gap:4px;font-size:14px}.kk-li{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;width:100%;min-height:56px}.kk-li small{color:var(--muted)}' +
    '.kk-card{display:flex;flex-direction:column;gap:14px;padding:18px;border-radius:16px;background:var(--surface2);margin:8px 0 14px}.kk-card small{color:var(--muted)}.kk-f{font-size:20px;line-height:1.35;font-weight:600}' +
    '.kk-b{font-size:17px;line-height:1.45;border-top:1px solid var(--line);padding-top:12px}.kk-btns{gap:8px}.kk-btns .btn{flex:1;min-height:48px}';
  document.head.appendChild(st);
})();
