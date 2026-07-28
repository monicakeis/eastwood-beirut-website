/* ============================================================================
   EASTWOOD — premium motion + reveal safety net
   Progressive enhancement only: if this file never runs, the site is unchanged.
   Its single job is an invariant: a .js-reveal element must never stay
   invisible, and no heading may stay trapped inside a mask left by an older
   build. All decorative motion (masked heading reveals, magnetic buttons,
   scroll parallax) was removed in the restraint pass.
   ============================================================================ */
(function () {
  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.documentElement.dataset.ewReveal) return;
  document.documentElement.dataset.ewReveal = '1';

  var ready = function (fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  ready(function () {
    /* ---- Contrast: tag small teal labels that sit on a LIGHT background ----
       Brand teal passes on deep blue but fails WCAG AA on white at this size.
       Which sections are dark is measured, not hand-listed: an earlier CSS-only
       attempt curated the section names and missed five of them. */
    var lum = function (rgb) {
      var m = rgb.match(/[\d.]+/g);
      if (!m) return null;
      var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(+m[0]) + 0.7152 * f(+m[1]) + 0.0722 * f(+m[2]);
    };
    Array.prototype.forEach.call(document.querySelectorAll('.kicker'), function (k) {
      var p = k, bg = null;
      while (p && p !== document.documentElement) {
        var col = getComputedStyle(p).backgroundColor;
        if (col && !/rgba\(0, 0, 0, 0\)|transparent/.test(col)) {
          var a = col.match(/rgba?\(([^)]+)\)/);
          var parts = a ? a[1].split(',').map(Number) : null;
          /* skip near-transparent overlays; keep walking for the real surface */
          if (!parts || parts.length < 4 || parts[3] > 0.6) { bg = col; break; }
        }
        p = p.parentElement;
      }
      var L = lum(bg || 'rgb(255,255,255)');
      if (L !== null && L > 0.5) k.classList.add('on-light');
    });

    /* ---- Marquee duplicates are decorative: hide the copy from screen readers.
       The looping markup repeats every item, so assistive tech was reading all
       25 university names and the review cards twice, and the ticker line six
       times. Halved tracks hide their second half; the ticker keeps only the
       first line. Focusable descendants are also removed from the tab order,
       since focusable content inside aria-hidden is itself a violation. */
    var hideFromAT = function (el) {
      el.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(el.querySelectorAll('a[href],button,input,select,textarea'), function (f) {
        f.setAttribute('tabindex', '-1');
      });
      if (el.matches('a[href],button')) el.setAttribute('tabindex', '-1');
    };
    /* ticker: every item is the same line, so only the first should be announced */
    Array.prototype.forEach.call(document.querySelectorAll('.deadline-marquee'), function (track) {
      var items = track.querySelectorAll('.deadline-item');
      for (var i = 1; i < items.length; i++) hideFromAT(items[i]);
    });
    /* the rest are exact 2x duplications for the loop */
    [['.unis-track', '.uni-name'], ['.reviews-row', '.review-card'],
     ['.kmarquee-track', '.kmarquee-item']
    ].forEach(function (pair) {
      Array.prototype.forEach.call(document.querySelectorAll(pair[0]), function (track) {
        var items = track.querySelectorAll(pair[1]);
        if (items.length < 2 || items.length % 2 !== 0) return;
        for (var i = items.length / 2; i < items.length; i++) hideFromAT(items[i]);
      });
    });

    /* ---- Masked heading rise -------------------------------------------
       Wrap each heading's contents in a line span and clip the heading, so the
       text rises out of a mask. Inner markup (<span class="italic">) survives. */
    var heads = REDUCE ? [] : document.querySelectorAll('.section-h2, .hs-col-title, .reason-t, .vb-t');
    Array.prototype.forEach.call(heads, function (h) {
      if (h.querySelector('.m-line') || !h.childNodes.length) return;
      var line = document.createElement('span');
      line.className = 'm-line';
      while (h.firstChild) line.appendChild(h.firstChild);
      h.appendChild(line);
      h.classList.add('m-mask');
    });

    /* Observe EVERY mask. A heading inside a .js-reveal may ride that element's
       .in or .visible class, but we never depend on it: .m-in is added here too
       and CSS releases on whichever lands first, so nothing can be stranded. */
    if ('IntersectionObserver' in window) {
      var headIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('m-in');
          headIO.unobserve(e.target);
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
      Array.prototype.forEach.call(document.querySelectorAll('.m-mask'), function (h) { headIO.observe(h); });
    } else {
      Array.prototype.forEach.call(document.querySelectorAll('.m-mask'), function (h) { h.classList.add('m-in'); });
    }

    /* ---- Magnetic buttons (fine pointers only) ---- */
    if (!REDUCE && matchMedia('(pointer: fine)').matches) {
      var MAX = 5;
      Array.prototype.forEach.call(document.querySelectorAll('.btn'), function (b) {
        if (b.closest('.mnav')) return;
        b.addEventListener('mousemove', function (e) {
          var r = b.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          b.style.transform = 'translate3d(' + (dx * MAX).toFixed(2) + 'px,' + (dy * MAX * 0.6).toFixed(2) + 'px,0)';
        });
        b.addEventListener('mouseleave', function () { b.style.transform = ''; });
        b.addEventListener('blur', function () { b.style.transform = ''; });
      });
    }

    /* Understated hover zoom: tag only containers that ALREADY clip, so
       nothing which used to overflow starts getting cut off. */
    var mediaSel = '.prog-parallel-photo, .stage-img, .dil-media, .lead-portrait, .news-media, .sl-media, .campus-photo';
    Array.prototype.forEach.call(document.querySelectorAll(mediaSel), function (box) {
      if (!box.querySelector('img')) return;
      var ov = getComputedStyle(box).overflow;
      if (ov === 'hidden' || ov === 'clip') box.classList.add('zoomable');
    });

    /* Reveal safety net.
       The page's primary observer can miss elements (its threshold/rootMargin,
       a fast scroll, or a container that was display:none when it ran — e.g.
       copy inside an inactive tab, which never intersects at all).
       Two reveal contracts exist and CSS treats them identically:
         eastwood-motion.js / index inline → .in
         eastwood-animations.js            → .visible
       so adding .visible is safe on every page. Elements below the fold still
       animate: the threshold-0 observer fires on entry, not up front. */
    var reveal = function (el) { el.classList.add('visible'); };
    var pending = function (el) {
      return !el.classList.contains('in') && !el.classList.contains('visible');
    };

    if ('IntersectionObserver' in window) {
      var netIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          reveal(e.target);
          netIO.unobserve(e.target);
        });
      }, { threshold: 0, rootMargin: '0px 0px 10% 0px' });
      Array.prototype.forEach.call(document.querySelectorAll('.js-reveal'), function (el) {
        if (pending(el)) netIO.observe(el);
      });
    } else {
      Array.prototype.forEach.call(document.querySelectorAll('.js-reveal'), reveal);
    }

    /* Final sweep: anything with no box (hidden container) can never intersect,
       and anything already near/above the fold should have revealed by now. */
    var sweep = function () {
      Array.prototype.forEach.call(document.querySelectorAll('.js-reveal'), function (el) {
        if (!pending(el)) return;
        var r = el.getBoundingClientRect();
        if (r.height === 0 || r.width === 0 || r.top < window.innerHeight * 1.5) reveal(el);
      });
    };
    window.addEventListener('load', function () { setTimeout(sweep, 1000); });
    setTimeout(sweep, 3000);
  });
})();
