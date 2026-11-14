"""Build index.html from src/index.template.html. Run from the repo root: python3 src/build.py [--preview DIR]
--preview writes an artifact-safe copy (Google Fonts instead of Fontsource) with its assets to DIR."""
import json, urllib.parse, os, re, sys, shutil
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
t = open(os.path.join(here, 'index.template.html')).read()
d = [x for x in open(os.path.join(here, 'shield_d.txt')).read().split('\n') if x.strip()]
paths = ''.join(f'<path d="{x}"/>' for x in d)
fav = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="150 107 290 315"><g fill="#00B2A9">' + paths + '</g></svg>'
t = t.replace('__SHIELD_SVG_PATHS__', paths).replace('__FAVICON__', 'data:image/svg+xml,' + urllib.parse.quote(fav))
open(os.path.join(root, 'index.html'), 'w').write(t.replace('<!--FONTS-->\n', ''))
print('index.html', len(t))
if '--preview' in sys.argv:
    out = sys.argv[sys.argv.index('--preview') + 1]
    gf = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
          '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@800;900&family=Bodoni+Moda:ital,opsz,wght@1,6..96,500&display=swap" rel="stylesheet">')
    p = re.sub(r'/\*FONTFACE-START\*/.*?/\*FONTFACE-END\*/\n', '', t, flags=re.S).replace('<!--FONTS-->', gf)
    if os.path.exists(out): shutil.rmtree(out)
    shutil.copytree(os.path.join(root, 'assets', 'eis26'), os.path.join(out, 'assets', 'eis26'))
    open(os.path.join(out, 'index.html'), 'w').write(p); print('preview', out)
