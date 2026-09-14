document.documentElement.classList.add('js');
(function(){
  function init(){
    var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var els=[].slice.call(document.querySelectorAll('.shape[data-reveal]'));
    if(reduce||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return;}
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting)return;
        var el=en.target,sibs=[].slice.call((el.closest('[data-reveal-group]')||document).querySelectorAll('.shape[data-reveal]'));
        var i=Math.max(0,sibs.indexOf(el));
        el.style.setProperty('--d',(i*0.07)+'s');
        el.classList.add('in');io.unobserve(el);
      });
    },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
    els.forEach(function(e){io.observe(e)});
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else{init()}
})();
