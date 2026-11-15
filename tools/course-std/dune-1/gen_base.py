# Базовий курс «Дюна»: картки героїв + 3 словники сцен з кожної специфікації gNN.py.
# Результат: content/dune/dune1.json (36 уроків, у тому ж форматі, що й інші курси).
import json, os, re, sys, glob, importlib.util, types
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
IDS = [l.strip() for l in open(os.path.join(HERE, '..', 'dune-1_ids.txt')) if l.strip()]
M = re.compile(r'\[([^\]]+)\]')
I = {'uk': 0, 'pl': 1, 'en': 2}
ARCS = {1: ('Арка 1 · Каладан|Łuk 1 · Caladan|Arc 1 · Caladan', '🌊', 'Хвиля Каладану|Fala Caladanu|The Caladan Wave', 'Ти пізнав(ла) дім Атрідів на морському світі.|Poznałeś(-aś) ród Atrydów na oceanicznym świecie.|You came to know House Atreides on its ocean world.'),
        2: ('Арка 2 · Випробування|Łuk 2 · Próba|Arc 2 · The Test', '🖐', 'Скринька болю|Skrzynka bólu|The Box of Pain', 'Ти бачив(ла), як Пол пройшов випробування і як дім вирушив у дорогу.|Widziałeś(-aś), jak Paul przeszedł próbę i jak ród wyruszył w drogę.|You saw Paul pass the test and the house set out on its journey.'),
        3: ('Арка 3 · Арракіс|Łuk 3 · Arrakis|Arc 3 · Arrakis', '🏜', 'Пісок Арракіса|Piasek Arrakis|Sand of Arrakis', 'Ти ступив(ла) на найнебезпечнішу планету імперії.|Stanąłeś(-ęłaś) na najniebezpieczniejszej planecie imperium.|You set foot on the most dangerous planet in the empire.'),
        4: ('Арка 4 · Прянощі|Łuk 4 · Przyprawa|Arc 4 · The Spice', '✨', 'Крупинка прянощів|Ziarnko przyprawy|A Grain of Spice', 'Ти дізнав(лася), чому за прянощі воює весь всесвіт.|Dowiedziałeś(-aś) się, dlaczego o przyprawę walczy cały wszechświat.|You learned why the whole universe fights over the spice.'),
        5: ('Арка 5 · Зрада|Łuk 5 · Zdrada|Arc 5 · Betrayal', '🗡', 'Зламаний щит|Złamana tarcza|The Broken Shield', 'Ти пережив(ла) ніч, коли впав дім Атрідів.|Przetrwałeś(-aś) noc, w której upadł ród Atrydów.|You survived the night House Atreides fell.'),
        6: ('Арка 6 · Пустеля|Łuk 6 · Pustynia|Arc 6 · The Desert', '🪱', 'Зуб піщаного черв\'яка|Ząb czerwia|The Sandworm\'s Tooth', 'Ти дійшов(ла) до фрименів і до кінця першої частини.|Dotarłeś(-aś) do Fremenów i do końca pierwszej części.|You reached the Fremen and the end of Part One.')}

def sp(t): a = [x.strip() for x in t.split('|')]; assert len(a) == 3, t; return a
def clean(s): return M.sub(lambda m: m.group(1).split('/')[0], s)

captured = {}
fake = types.ModuleType('tri')
def _build(num, d, tgs, boss=False): captured[num] = (d, boss)
fake.build = _build; sys.modules['tri'] = fake
for f in sorted(glob.glob(os.path.join(HERE, 'd[0-9][0-9].py'))):
    spec = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)

UI = {'uk': ('Відкривай слова, слухай вимову 🔊 і читай, хто і де це каже.', 'Otwieraj słowa, słuchaj wymowy 🔊 i czytaj, kto i gdzie to mówi.', 'Open the words, listen to the pronunciation 🔊 and read who says it and where.')}

def glossary(tg, n, lab, voc, sents):
    k = I[tg]; L = sp(lab); items = []
    for v in voc.split(';'):
        a = sp(v); w = a[k]
        idx = None
        for kk in (2, k):  # спершу англійська (стабільні основи слів), потім мова уроку
            stem = re.sub(r'^to ', '', a[kk].lower())[:4]
            br = lambda s: [x.split('/')[0].lower() for x in M.findall(sp(s)[kk])]
            idx = next((i for i, s in enumerate(sents) if any(b.startswith(stem) for b in br(s))), None)
            if idx is None: idx = next((i for i, s in enumerate(sents) if stem in clean(sp(s)[kk]).lower()), None)
            if idx is not None: break
        line = sents[idx or 0]
        ls = sp(line); full = [clean(x) for x in ls]
        it = {'w': w, 'ipa': '', 'pos': '', 'lvl': 'B2', 'line': full[k], 'ex': full[k],
              'who': full[0], 'who_pl': full[1], 'who_en': full[2]}
        if tg == 'en':
            it.update({'uk': a[0], 'uk_pl': a[1], 'uk_en': a[2]})
        else:
            it.update({'uk': a[0] if tg != 'uk' else a[2], 'uk_uk': a[0], 'uk_pl': a[1], 'uk_en': a[2]})
        items.append(it)
    return {'type': 'glossary', 'label': 'Сцена %d · %s' % (n, L[0]), 'label_pl': 'Scena %d · %s' % (n, L[1]), 'label_en': 'Scene %d · %s' % (n, L[2]),
            'q': UI['uk'][0], 'q_pl': UI['uk'][1], 'q_en': UI['uk'][2], 'items': items}

def cards(d):
    p = sp(d['prev'])
    cs = [{'uk': a, 'en': b, 'role': sp(r)[0], 'role_pl': sp(r)[1], 'role_en': sp(r)[2]} for a, b, r in d['cards']]
    return {'type': 'cards', 'label': 'Раніше на Арракісі…', 'label_pl': 'Wcześniej na Arrakis…', 'label_en': 'Previously on Arrakis…',
            'q': p[0], 'q_pl': p[1], 'q_en': p[2], 'img': None, 'cards': cs}

def arc_of(n): return min(6, (n - 1) // 6 + 1)

out = []
for n in range(1, 37):
    if n not in captured: continue
    d, boss = captured[n]
    t, s = sp(d['title']), sp(d['scene'])
    base = {'num': n, 'id': IDS[n - 1], 'title': t[0], 'title_pl': t[1], 'title_en': t[2], 'scene': s[0], 'scene_pl': s[1], 'scene_en': s[2],
            'grammar': sp(d['gname']['en'])[2]}
    per = {}
    for tg in ('en', 'pl', 'uk'):
        per[tg] = [cards(d)] + [glossary(tg, i + 1, lab, voc, sents) for i, (lab, voc, sents) in enumerate(d['sc'])]
    base['tasks'] = per['en']
    a = ARCS[arc_of(n)]; ar = sp(a[0]); bn = sp(a[2]); bt = sp(a[3])
    v = {'arc': ar[0], 'arc_pl': ar[1], 'arc_en': ar[2], 'badge': {'icon': a[1], 'name': bn[0], 'name_pl': bn[1], 'name_en': bn[2], 'text': bt[0], 'text_pl': bt[1], 'text_en': bt[2]},
         'pl': per['pl'], 'uk': per['uk']}
    for tg in ('pl', 'uk'):
        g = sp(d['gname'][tg]); v[tg + '_grammar'] = g[1] if tg == 'pl' else g[0]
        v[tg + '_grammar_uk'], v[tg + '_grammar_pl'], v[tg + '_grammar_en'] = g
    base['variants'] = v
    out.append(base)
os.makedirs(os.path.join(ROOT, 'content', 'dune'), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, 'content', 'dune', 'got1.json'), 'w'), ensure_ascii=False)
print(len(out), 'lessons ->', os.path.join(ROOT, 'content', 'dune', 'got1.json'))
