/* Eastwood Beirut — shared scroll-reveal animations
   Auto-discovers animatable elements; skips hero + nav + footer.
   Works alongside any inline js-reveal classes already in the markup. */
(function () {
  if (typeof IntersectionObserver === 'undefined') return;

  var HERO_SKIP = [
    '[id="top"]','.hero','.ab-hero','.sl2-hero','.bg2-hero',
    '.dp-hero','.myp-hero','.util-hero','.contact-hero',
    '.news-hero','.careers-hero','.hs-hero','.ey-hero',
    '.el-hero','.fr-hero','.pyp-hero'
  ].join(',');

  var AUTO = [
    'main .kicker',
    'main .section-h2',
    'main .section-lede',
    'main .section-head',
    'main .mv-block',
    'main .abt-stat',
    'main .lead-card',
    'main .lead-featured',
    'main .reason',
    'main .stage',
    'main .contact-info-block',
    'main .myp-item',
    'main .hs-col',
    'main .path',
    'main .cont-step',
    'main .feature-text',
    'main .ey-feature',
    'main .el-sec > .container > *',
    'main .sl2-feature > *',
    'main .bg2-payoff-line',
    'main .abt-payoff-line',
    'main .sl2-payoff-line'
  ].join(',');

  document.querySelectorAll(AUTO).forEach(function (el) {
    if (el.closest(HERO_SKIP)) return;
    if (el.closest('footer') || el.closest('header')) return;
    if (!el.classList.contains('js-reveal')) {
      el.classList.add('js-reveal');
    }
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var sibs = Array.prototype.filter.call(
        el.parentElement.children,
        function (c) { return c.classList.contains('js-reveal'); }
      );
      var idx = Math.max(0, sibs.indexOf(el));
      el.style.transitionDelay = (idx * 0.08) + 's';
      el.classList.add('visible');
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.js-reveal').forEach(function (el) {
    io.observe(el);
  });
})();
