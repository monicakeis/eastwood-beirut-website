document.documentElement.classList.add('js');
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els=[].slice.call(document.querySelectorAll('.shape[data-reveal]'));
  if(reduce||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return;}
  function reveal(el){
    if(el.classList.contains('in'))return;
    var sibs=[].slice.call((el.closest('[data-reveal-group]')||document).querySelectorAll('.shape[data-reveal]'));
    var i=Math.max(0,sibs.indexOf(el));
    el.style.setProperty('--d',(i*0.07)+'s');
    el.classList.add('in');
  }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting)return;
      reveal(en.target);io.unobserve(en.target);
    });
  },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
  els.forEach(function(e){io.observe(e)});
  // Safety net: some environments never fire IO for already-in-view elements.
  setTimeout(function(){
    els.forEach(function(e){
      var r=e.getBoundingClientRect();
      if(r.top<innerHeight&&r.bottom>0)reveal(e);
    });
  },400);
  setTimeout(function(){els.forEach(reveal)},1600);
})();

