"""Construit data/exercises.json et les animations public/exercises/*.webp.

Source des photos et métadonnées : free-exercise-db (domaine public, Unlicense)
https://github.com/yuhonas/free-exercise-db
Usage : python3 scripts/build_exercises.py <chemin/vers/free-exercise-db>
"""
import glob, json, os, re, sys
from PIL import Image

FEDB = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_IMG = os.path.join(ROOT, 'public', 'exercises')
os.makedirs(OUT_IMG, exist_ok=True)

GROUPS = [
    ('pecs', 'Pectoraux'), ('dos', 'Dos'), ('lombaires', 'Lombaires'), ('trapezes', 'Trapèzes'),
    ('epaules', 'Épaules'), ('biceps', 'Biceps'), ('triceps', 'Triceps'), ('avantbras', 'Avant-bras'),
    ('abdos', 'Abdos'), ('fessiers', 'Fessiers'), ('quadriceps', 'Quadriceps'), ('ischios', 'Ischios'),
    ('adducteurs', 'Adducteurs'), ('abducteurs', 'Abducteurs'), ('mollets', 'Mollets'), ('cou', 'Cou'),
]
MUSCLE_FR = {
    'abdominals': 'abdos', 'abductors': 'abducteurs', 'adductors': 'adducteurs', 'biceps': 'biceps',
    'calves': 'mollets', 'chest': 'pectoraux', 'forearms': 'avant-bras', 'glutes': 'fessiers',
    'hamstrings': 'ischios', 'lats': 'grand dorsal', 'lower back': 'lombaires', 'middle back': 'milieu du dos',
    'neck': 'cou', 'quadriceps': 'quadriceps', 'shoulders': 'épaules', 'traps': 'trapèzes', 'triceps': 'triceps',
}
EQUIP_FR = {
    'barbell': 'Barre', 'dumbbell': 'Haltères', 'cable': 'Poulie', 'machine': 'Machine',
    'body only': 'Poids du corps', 'kettlebells': 'Kettlebell', 'bands': 'Élastique',
    'e-z curl bar': 'Barre EZ', 'exercise ball': 'Ballon', 'medicine ball': 'Médecine-ball',
    'other': 'Autre', None: 'Poids du corps',
}
LEVEL_FR = {'beginner': 'Débutant', 'intermediate': 'Intermédiaire', 'expert': 'Confirmé'}

src = {e['id']: e for e in json.load(open(os.path.join(FEDB, 'dist', 'exercises.json')))}
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def load(p, w):
    im = Image.open(p).convert('RGB')
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)

def build_media(eid, name):
    folder = os.path.join(FEDB, 'exercises', eid)
    anim, thumb = os.path.join(OUT_IMG, name + '.webp'), os.path.join(OUT_IMG, name + '-t.webp')
    if not os.path.exists(anim):
        a, b = load(os.path.join(folder, '0.jpg'), 480), load(os.path.join(folder, '1.jpg'), 480)
        if b.size != a.size: b = b.resize(a.size, Image.LANCZOS)
        mid = Image.blend(a, b, 0.5)
        a.save(anim, 'WEBP', save_all=True, append_images=[mid, b, mid],
               duration=[900, 110, 900, 110], loop=0, quality=55, method=6)
    if not os.path.exists(thumb):
        t = load(os.path.join(folder, '1.jpg'), 160)
        t.save(thumb, 'WEBP', quality=60, method=6)

out, seen = [], set()
for f in sorted(glob.glob(os.path.join(ROOT, 'scripts', 'exercises_fr_*.txt'))):
    for line in open(f, encoding='utf-8'):
        line = line.strip()
        if not line or line.startswith('#'): continue
        g, eid, name, steps, errors, tip = line.split('|')
        assert eid in src, eid
        assert eid not in seen, eid
        seen.add(eid)
        e = src[eid]
        sid = slug(eid)
        build_media(eid, sid)
        out.append({
            'id': sid,
            'name': name,
            'group': g,
            'primary': [MUSCLE_FR[m] for m in e['primaryMuscles']],
            'secondary': [MUSCLE_FR[m] for m in e['secondaryMuscles']],
            'equipment': EQUIP_FR[e['equipment']],
            'level': LEVEL_FR[e['level']],
            'steps': [s.strip() for s in steps.split(' / ')],
            'errors': [s.strip() for s in errors.split(' / ')],
            'tip': tip.strip(),
            'media': sid,
        })

order = [g for g, _ in GROUPS]
assert all(x['group'] in order for x in out), {x['group'] for x in out} - set(order)
out.sort(key=lambda x: (order.index(x['group'])))
json.dump({'groups': [{'id': g, 'label': l} for g, l in GROUPS], 'exercises': out},
          open(os.path.join(ROOT, 'data', 'exercises.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print(len(out), 'exercices')
