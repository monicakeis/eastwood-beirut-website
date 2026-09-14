document.documentElement.classList.add('js');
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els=[].slice.call(document.querySelectorAll('.reveal2'));
  function settle(el){
    if(el.classList.contains('in'))return;
    var sibs=[].slice.call((el.closest('[data-reveal-group]')||el.parentElement).querySelectorAll('.reveal2'));
    var i=Math.max(0,sibs.indexOf(el));
    el.style.setProperty('--rd',(i*0.08)+'s');
    el.classList.add('in');
  }
  if(reduce||!('IntersectionObserver' in window)){els.forEach(settle);}
  else{
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(!en.isIntersecting)return; settle(en.target); io.unobserve(en.target); });
    },{threshold:.14,rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(e){io.observe(e)});
    setTimeout(function(){els.forEach(function(e){var r=e.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)settle(e);})},400);
    setTimeout(function(){els.forEach(settle)},1800);
  }

  // Pointer-tilt on hero collage cards (2026 micro-interaction), desktop only
  if(!reduce && matchMedia('(pointer: fine)').matches){
    document.querySelectorAll('[data-tilt]').forEach(function(card){
      card.style.transition='transform .3s '+'cubic-bezier(.16,1,.3,1)';
      card.addEventListener('mousemove',function(e){
        var r=card.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
        var base=card.dataset.tilt||'0';
        card.style.transform='rotate('+base+'deg) perspective(700px) rotateX('+(py*-6)+'deg) rotateY('+(px*6)+'deg)';
      });
      card.addEventListener('mouseleave',function(){
        card.style.transform='rotate('+(card.dataset.tilt||'0')+'deg)';
      });
    });
  }
})();
