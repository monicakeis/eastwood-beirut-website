# Eastwood International School Beirut — Website

Static marketing site for Eastwood International School Beirut. No build step,
no dependencies, no package manager: every page is plain HTML that opens
directly in a browser.

## Structure

```
index.html              Home
about.html              About, mission, leadership, accreditation
admissions.html         How to apply, checklist, tuition links
contact.html            Address, map, enquiry CTA
high-school.html        Grades 10–12, both diploma pathways
ib-early-years.html     IB-PYP Early Years (ages 3–6)
ib-elementary.html      IB-PYP Elementary (ages 6–11)
ib-pyp.html             IB Primary Years Programme overview
ib-myp.html             IB Middle Years Programme (Grades 6–10)
ib-dp.html              IB Diploma Programme (ages 16–18)
fr-section.html         Section Française
student-life.html       Wellbeing, sport, arts, activities
news.html               News and events
careers.html            Openings and how to apply
beirut-guide.html       Practical guide for relocating families
privacy.html            Privacy policy

assets/
  eastwood-system.css        Shared design system + overrides (loaded by every page)
  eastwood-animations.js     Scroll reveals (.visible), sticky nav, mobile menu
  eastwood-motion.js         Scroll reveals (.in) — loaded by a subset of pages
  eastwood-premium-motion.js Reveal safety net + hover-zoom tagging
  logo-color.png             Primary lockup (light backgrounds)
  logo-white.png             White wordmark + teal shield (dark backgrounds)
  favicon.png                Square emblem favicon
  EB-2026-27-FeeSheet.pdf    Current tuition and fees
  logos/ leadership/ pyp/ myp/ el/ hs/ dp/ inline/ academics/   Imagery
```

## Conventions

**Two reveal contracts.** `eastwood-animations.js` adds `.visible`;
`eastwood-motion.js` and `index.html`'s inline script add `.in`. The CSS honours
both — if you touch the reveal rules in `eastwood-system.css`, keep both
selectors or content will render invisible on the pages using the other script.
`eastwood-premium-motion.js` is a safety net that guarantees nothing stays
hidden (including content inside inactive tabs, which never intersects).

**Motion is deliberately restrained.** A quiet fade-and-rise on scroll-in, the
sticky-nav state change, and hover/focus feedback. Marquees, parallax, hero
Ken-Burns, count-up numbers, pulsing dots and the scroll progress bar were all
removed on purpose — please don't reintroduce them. Everything is
compositor-safe and fully disabled under `prefers-reduced-motion`.

**`eastwood-system.css` is layered.** It has accumulated override blocks over
time, so several selectors are defined more than once and later blocks win.
Before editing, search the whole file for the selector — a change that appears
to do nothing is usually being overridden further down.

**Page CSS is inline.** Each page carries ~40KB of inline CSS in a `<style>`
block, largely duplicated across pages. Shared changes belong in
`assets/eastwood-system.css`, which loads after the inline block and therefore
wins.

## Editing

Open any file in a browser. There is nothing to install or compile. Test at
375px width as well as desktop — the mobile rules live in the
`MOBILE CORRECTNESS` block at the end of `assets/eastwood-system.css`.
