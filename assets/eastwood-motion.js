/* ============================================================================
   EASTWOOD — shared scroll motion + nav behaviour (matches the homepage)
   Progressive enhancement: the reveal class is added by JS, so if this file
   never runs, content simply shows with no animation (never hidden).
   ============================================================================ */
(function () {
  // ---- Sticky nav turns deep-blue on scroll -------------------------------
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Staggered scroll reveals (same easing/stagger as the homepage) -----
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var groupSel = [
    '.section-head', '.section-intro', '.feature',
    '.reasons-grid > *', '.stages > *', '.prog-grid > *', '.continuum-track > *',
    '.quotes-grid > *', '.accred-logos-grid > *', '.paths-grid > *',
    '.outcomes-stats > *', '.expat-grid > *', '.sg-grid > *', '.lead-grid > *',
    '.tuition-grid > *', '.hero-stats-grid > *', '.dil-grid > *',
    '.adm-steps > *', '.campus-list > *', '.news-grid > *'
  ];
  document.querySelectorAll(groupSel.join(',')).forEach(function (el) {
    el.classList.add('js-reveal');
  });

  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var sibs = [].slice.call(el.parentElement.children).filter(function (c) {
        return c.classList.contains('js-reveal');
      });
      var idx = Math.max(0, sibs.indexOf(el));
      el.style.transitionDelay = (idx * 0.07) + 's';
      el.classList.add('in');
      revealIO.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
  document.querySelectorAll('.js-reveal').forEach(function (el) { revealIO.observe(el); });

  // ---- Section-level [data-animate] + count-up ----------------------------
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var decimals = (el.dataset.count.split('.')[1] || '').length;
    var dur = 1400, start = performance.now();
    function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }
  var sectionIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      sectionIO.unobserve(e.target);
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('[data-animate]').forEach(function (el) { sectionIO.observe(el); });
})();
