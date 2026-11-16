"""Build the site from src/pages/*.html with the shared partials, core.css and core.js.
Run from the repo root:  python3 src/build.py [--preview DIR]
--preview writes an artifact-safe copy (Google Fonts instead of Fontsource) with its assets to DIR."""
import os, re, sys, shutil, time, urllib.parse
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
R = lambda *p: open(os.path.join(here, *p)).read()
V = str(int(time.time()))
d = [x for x in R('shield_d.txt').split('\n') if x.strip()]
paths = ''.join(f'<path d="{x}"/>' for x in d)
fav = 'data:image/svg+xml,' + urllib.parse.quote('<svg xmlns="http://www.w3.org/2000/svg" viewBox="150 107 290 315"><g fill="#00B2A9">' + paths + '</g></svg>')
GF = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@800;900&family=Bodoni+Moda:ital,opsz,wght@1,6..96,500&display=swap" rel="stylesheet">')
css, js = R('core.css'), R('core.js')
parts = {k: R('partials', k.lower() + '.html') for k in ('HEAD', 'NAV', 'FOOTER', 'SCRIPTS')}

def page(src, preview):
    t = src
    for k, v in parts.items(): t = t.replace('{{%s}}' % k, v.rstrip('\n'))
    m = re.search(r'<body data-page="([\w-]+)"', t); pg = m.group(1) if m else ''
    t = t.replace(f'data-p="{pg}" href', f'data-p="{pg}" aria-current="page" href')
    t = t.replace('__FAVICON__', fav).replace('__SHIELD_SVG_PATHS__', paths).replace('__V__', V)
    return t.replace('<!--FONTS-->\n', GF + '\n' if preview else '')

def build(out, preview):
    a = os.path.join(out, 'assets', 'eis26'); os.makedirs(a, exist_ok=True)
    c = re.sub(r'/\*FONTFACE-START\*/.*?/\*FONTFACE-END\*/\n', '', css, flags=re.S) if preview else css
    open(os.path.join(a, 'site.css'), 'w').write(c); open(os.path.join(a, 'site.js'), 'w').write(js)
    for f in sorted(os.listdir(os.path.join(here, 'pages'))):
        if f.endswith('.html'):
            open(os.path.join(out, f), 'w').write(page(R('pages', f), preview)); print(out, f)

build(root, False)
if '--preview' in sys.argv:
    out = sys.argv[sys.argv.index('--preview') + 1]
    if os.path.exists(out): shutil.rmtree(out)
    shutil.copytree(os.path.join(root, 'assets', 'eis26'), os.path.join(out, 'assets', 'eis26'))
    build(out, True)
