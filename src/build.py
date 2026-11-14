"""Build index.html from src/index.template.html. Run from the repo root: python3 src/build.py"""
import json, urllib.parse, os
here = os.path.dirname(__file__)
t = open(os.path.join(here, 'index.template.html')).read()
d = [x for x in open(os.path.join(here, 'shield_d.txt')).read().split('\n') if x.strip()]
paths = ''.join(f'<path d="{x}"/>' for x in d)
fav = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="150 107 290 315"><g fill="#00B2A9">' + paths + '</g></svg>'
t = t.replace('__SHIELD_SVG_PATHS__', paths).replace('__SHIELD_JSON__', json.dumps(d)).replace('__FAVICON__', 'data:image/svg+xml,' + urllib.parse.quote(fav))
open(os.path.join(here, '..', 'index.html'), 'w').write(t)
print('index.html', len(t))
