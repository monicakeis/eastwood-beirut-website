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


/* Eastwood Beirut — mobile hamburger menu (Nielsen Norman + WCAG) ----------- */
(function(){
  var nav = document.querySelector('.nav .nav-inner') || document.querySelector('.nav-inner');
  if(!nav || document.querySelector('.nav-burger')) return;
  var GROUPS = [
    { label:'Programmes', links:[
      ['Early Years','ib-early-years.html'],['Elementary','ib-elementary.html'],
      ['Middle School','ib-myp.html'],['High School','high-school.html'],
      ['IB Diploma','ib-dp.html'],['Section Fran\u00e7aise','fr-section.html']
    ]},
    { label:'School', links:[
      ['About','about.html'],['Student Life','student-life.html'],
      ['Beirut Guide','beirut-guide.html'],['News','news.html'],['Careers','careers.html']
    ]},
    { label:'Visit', links:[ ['Admissions','admissions.html'],['Contact','contact.html'] ]}
  ];
  var here = (location.pathname.split('/').pop() || 'index.html');
  var burger = document.createElement('button');
  burger.className = 'nav-burger';
  burger.setAttribute('aria-label','Open menu');
  burger.setAttribute('aria-expanded','false');
  burger.setAttribute('aria-controls','ew-mobile-menu');
  burger.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(burger);
  var overlay = document.createElement('div');
  overlay.className = 'mnav-overlay';
  var panel = document.createElement('nav');
  panel.className = 'mnav';
  panel.id = 'ew-mobile-menu';
  panel.setAttribute('aria-label','Site menu');
  panel.setAttribute('aria-hidden','true');
  var h = '<div class="mnav-head"><span class="mnav-title">Menu</span>' +
    '<button class="mnav-close" aria-label="Close menu">&times;</button></div><div class="mnav-body">';
  h += '<a class="mnav-home" href="index.html"' + (here==='index.html'?' aria-current="page"':'') + '>Home</a>';
  GROUPS.forEach(function(g){
    h += '<div class="mnav-group"><div class="mnav-label">' + g.label + '</div>';
    g.links.forEach(function(l){
      h += '<a href="' + l[1] + '"' + (l[1]===here?' aria-current="page"':'') + '>' + l[0] + '</a>';
    });
    h += '</div>';
  });
  h += '</div><div class="mnav-cta"><a class="btn btn-primary" href="admissions.html">Enquire now</a>' +
    '<a class="btn btn-ghost" href="contact.html">Book a tour</a></div>';
  panel.innerHTML = h;
  document.body.appendChild(overlay);
  document.body.appendChild(panel);
  var lastFocus = null;
  function foc(){ return panel.querySelectorAll('a[href],button'); }
  function onKey(e){
    if(e.key==='Escape'){ close(); return; }
    if(e.key==='Tab'){
      var f=foc(); if(!f.length) return;
      var a=f[0], z=f[f.length-1];
      if(e.shiftKey && document.activeElement===a){ e.preventDefault(); z.focus(); }
      else if(!e.shiftKey && document.activeElement===z){ e.preventDefault(); a.focus(); }
    }
  }
  function open(){
    lastFocus=document.activeElement;
    overlay.classList.add('open'); panel.classList.add('open');
    document.body.classList.add('mnav-open');
    burger.setAttribute('aria-expanded','true');
    panel.setAttribute('aria-hidden','false');
    var c=panel.querySelector('.mnav-close'); if(c) c.focus();
    document.addEventListener('keydown',onKey);
  }
  function close(){
    overlay.classList.remove('open'); panel.classList.remove('open');
    document.body.classList.remove('mnav-open');
    burger.setAttribute('aria-expanded','false');
    panel.setAttribute('aria-hidden','true');
    document.removeEventListener('keydown',onKey);
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  burger.addEventListener('click',open);
  overlay.addEventListener('click',close);
  panel.querySelector('.mnav-close').addEventListener('click',close);
  panel.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',close); });
})();


/* Eastwood Beirut — scroll progress indicator ------------------------------ */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var bar=document.createElement('div'); bar.className='ew-progress'; bar.setAttribute('aria-hidden','true');
  document.body.appendChild(bar);
  function upd(){ var y=window.scrollY||window.pageYOffset||0;
    var h=(document.documentElement.scrollHeight-window.innerHeight)||1;
    bar.style.transform='scaleX('+Math.min(1,Math.max(0,y/h))+')'; }
  window.addEventListener('scroll',upd,{passive:true});
  window.addEventListener('resize',upd,{passive:true}); upd();
})();
