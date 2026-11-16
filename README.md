# Eastwood International School, website

Static site for Eastwood International School, Mansourieh. Hosted on Cloudflare Pages.

## Pages (v6, November 2026)

```
index.html        Home
learning.html     Ages 3 to 18: Early Years, Elementary, Section Française band, Middle School, Diploma years
fr-section.html   Section Française, in French with an English switch
life.html         Life on campus: rhythm of the year, buses, Instagram
about.html        Mission, the years, accreditation, leadership, careers
admissions.html   Steps, checklist, who can apply, tuition, moving to Lebanon, visit
privacy.html      Privacy
```

Old page addresses redirect to the right section through `_redirects`.

## Editing

Edit the sources in `src/`, never the built pages in the root.

```
src/pages/*.html     one file per page, with its own styles and script
src/partials/        head, nav and menu, footer, scripts
src/core.css         shared design system  ->  assets/eis26/site.css
src/core.js          shared behaviour      ->  assets/eis26/site.js
```

Build from the repo root:

```
python3 src/build.py                  # writes the root pages and assets/eis26/site.*
python3 src/build.py --preview DIR    # artifact-safe copy with Google Fonts
```

Fonts load from Fontsource (Inter, Inter Tight, Bodoni Moda). Motion uses GSAP 3.13 with ScrollTrigger and Lenis 1.3.
