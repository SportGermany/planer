# Erzeugt planer/wissen/js/buch.js aus planer/wissen/buch.md (Export des Docs „Sportwissenschaft für Rennrodler“)
# und den Quizfragen in wissen_quiz.py. Kapitel als Blöcke mit fertigem HTML und Suchtext, Karteikarten aus
# den Merksätzen (mit Fragen) und allen Mach-das/Lass-das-Tabellen.
import re, json, hashlib, html, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from wissen_quiz import QUIZ, MERK_Q
R = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'wissen') + '/'
md = open(R + 'buch.md', encoding='utf-8').read().split('\n')

def norm(s):
    s = s.lower()
    for a, b in (('ä', 'a'), ('ö', 'o'), ('ü', 'u'), ('ß', 'ss'), ('­', '')):
        s = s.replace(a, b)
    return re.sub(r'\s+', ' ', s)

def badge(t):
    if t.startswith('(Geprüft') or t.startswith('(Geprüft'): return 'ok'
    if t.startswith('(Einzelquelle'): return 'one'
    if t.startswith('(Transfer'): return 'tr'
    return 'nt'

def inline(s):
    """Markdown-Inline → HTML (escaped). Links öffnen außerhalb der App (Quellen)."""
    out, i = [], 0
    s = s.replace('\\', '')
    tok = re.compile(r'\[([^\]]+)\]\(<?([^)>]+)>?\)|\*\*(.+?)\*\*|\*(.+?)\*')
    for m in tok.finditer(s):
        out.append(html.escape(s[i:m.start()], quote=False))
        if m.group(1):
            out.append('<a href="%s" target="_blank" rel="noopener">%s</a>' % (html.escape(m.group(2)), html.escape(m.group(1), quote=False)))
        elif m.group(3):
            out.append('<b>%s</b>' % inline(m.group(3)))
        else:
            t = m.group(4)
            if t.startswith('('):
                out.append('<span class="src %s">%s</span>' % (badge(t), inline(t)))
            else:
                out.append('<i>%s</i>' % inline(t))
        i = m.end()
    out.append(html.escape(s[i:], quote=False))
    return ''.join(out)

def plain(s):
    s = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', s)
    return s.replace('**', '').replace('*', '').replace('\\', '')

def cells(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]

# ---------- Kapitel und Blöcke ----------
chapters, cur = [], None
i = 3  # Titel und Datumszeile überspringen
para = []
def flush():
    global para
    if para and cur is not None:
        t = ' '.join(para)
        add('p', inline(t), plain(t))
    para = []
def add(kind, h, txt, extra=None):
    b = {'id': '%s-%d' % (cur['id'], len(cur['blocks'])), 't': kind, 'h': h, 'x': norm(txt)}
    if extra: b.update(extra)
    cur['blocks'].append(b)
    return b

while i < len(md):
    line = md[i]
    if line.startswith('## '):
        flush()
        title = line[3:].strip()
        m = re.match(r'Kapitel (\d+) – (.*)', title)
        cid = 'k' + m.group(1) if m else ('e' if title.startswith('Einleitung') else 'q')
        cur = {'id': cid, 'n': int(m.group(1)) if m else 0, 'title': m.group(2) if m else title, 'full': title, 'blocks': [], 'sec': []}
        chapters.append(cur); i += 1; continue
    if cur is None: i += 1; continue
    if line.startswith('#### ') or line.startswith('### '):
        flush()
        lvl = 4 if line.startswith('####') else 3
        t = line.lstrip('#').strip()
        b = add('h%d' % lvl, inline(t), t)
        if lvl == 3: cur['sec'].append({'id': b['id'], 't': t, 'num': (re.match(r'(\d+\.\d+)', t) or [None, None])[1] if re.match(r'\d+\.\d+', t) else None})
        i += 1; continue
    if line.startswith('|'):
        flush()
        rows = []
        while i < len(md) and md[i].startswith('|'):
            rows.append(cells(md[i])); i += 1
        head, body = rows[0], [r for r in rows[2:]]
        th = ''.join('<th>%s</th>' % inline(c) for c in head)
        tb = ''.join('<tr>' + ''.join('<td data-l="%s">%s</td>' % (html.escape(plain(head[k]) if k < len(head) else ''), inline(c)) for k, c in enumerate(r)) + '</tr>' for r in body)
        b = add('table', '<table><thead><tr>%s</tr></thead><tbody>%s</tbody></table>' % (th, tb), ' | '.join(plain(' '.join(r)) for r in rows if not re.match(r'^[-\s|]*$', ' '.join(r))),
                {'head': [plain(c) for c in head], 'rows': [[plain(c) for c in r] for r in body]})
        continue
    m = re.match(r'^(\s*)(- |\d+\. )(.*)', line)
    if m:
        flush()
        ordered = m.group(2)[0].isdigit()
        items = []
        while i < len(md):
            m2 = re.match(r'^(\s*)(- |\d+\. )(.*)', md[i])
            if not m2: break
            items.append(m2.group(3)); i += 1
        b = add('ol' if ordered else 'ul', ''.join('<li>%s</li>' % inline(t) for t in items), ' '.join(plain(t) for t in items), {'items': [plain(t) for t in items]})
        continue
    if not line.strip():
        flush(); i += 1; continue
    para.append(line.strip()); i += 1
flush()

# Absätze, die mit fettem „Widerspruch geklärt“ beginnen, als Hinweis markieren
for c in chapters:
    for b in c['blocks']:
        if b['t'] == 'p' and re.match(r'<b>Widerspruch', b['h']): b['c'] = 'note'
        if b['t'] == 'p' and b['h'].startswith('<span class="src'): b['c'] = 'srcline'

# ---------- Karteikarten ----------
def cid(*parts):
    return hashlib.sha1('|'.join(parts).encode()).hexdigest()[:10]
cards = []
for c in chapters:
    if not c['id'].startswith('k'): continue
    sec, label = '', ''
    for k, b in enumerate(c['blocks']):
        if b['t'] == 'h3': sec, label = re.sub(r'<[^>]+>', '', b['h']), ''
        if b['t'] == 'p' and re.fullmatch(r'<b>[^<]+</b>', b['h']): label = re.sub(r'<[^>]+>', '', b['h'])
        if b['t'] == 'table' and 'Mach das' in b['head'] and 'Lass das' in b['head']:
            H = b['head']; im, il = H.index('Mach das'), H.index('Lass das')
            iw = H.index('Warum') if 'Warum' in H else None
            iz = H.index('Zeitpunkt') if 'Zeitpunkt' in H else None
            for r in b['rows']:
                ctx = (r[iz] if iz is not None else label) or ''
                cards.append({'id': cid('ml', r[im], r[il]), 'ch': c['id'], 'k': 'ml', 'sec': sec, 'ctx': ctx, 'f': r[il], 'b': r[im],
                              'w': r[iw] if iw is not None else '', 'ref': b['id']})
        if b['t'] == 'ul' and sec.startswith('Merksätze'):
            qs = MERK_Q[c['id']]
            assert len(qs) == len(b['items']), (c['id'], len(qs), len(b['items']))
            for q, t in zip(qs, b['items']):
                cards.append({'id': cid('m', t), 'ch': c['id'], 'k': 'm', 'sec': sec, 'ctx': '', 'f': q, 'b': t, 'w': '', 'ref': b['id']})

# ---------- Quiz: Abschnittsnummer → Block ----------
secmap = {}
for c in chapters:
    for s in c['sec']:
        m = re.match(r'(\d+\.\d+)', s['t'])
        if m: secmap[m.group(1)] = s['id']
quiz = []
for ch, qs in QUIZ.items():
    for n, q in enumerate(qs):
        assert len(q['o']) == 4 and q['ref'] in secmap, (ch, q['q'], q['ref'])
        quiz.append({'id': cid('q', q['q']), 'ch': ch, 'q': q['q'], 'o': q['o'], 'e': q['e'], 'ref': q['ref'], 'blk': secmap[q['ref']]})

for c in chapters:
    c.pop('n', None)
    for s_ in c['sec']: s_.pop('num', None)
    for b in c['blocks']:  # Suchtext berechnet die App aus dem HTML; Hilfsfelder nur für den Generator
        for k in ('x', 'head', 'rows', 'items'): b.pop(k, None)
data = {'title': 'Sportwissenschaft für Rennrodler', 'asof': 'Oktober 2026', 'chapters': chapters, 'cards': cards, 'quiz': quiz}
js = '/* Inhalt „Sportwissenschaft für Rennrodler“ – erzeugt von gen_wissen.py aus wissen/buch.md. Nicht von Hand ändern. */\n' + \
     'window.SW_BUCH = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
os.makedirs(R + 'js', exist_ok=True)
open(R + 'js/buch.js', 'w', encoding='utf-8').write(js)
print('Kapitel', [(c['id'], len(c['blocks'])) for c in chapters])
print('Karten', len(cards), 'davon Merksätze', sum(1 for x in cards if x['k'] == 'm'), '| Quiz', len(quiz), '| Bytes', len(js))
