/* Le Chat Noir - Chrome/Interaktion (Vanilla, kein Framework) */
(function(){
  'use strict';
  var nav = document.getElementById('nav');
  var isSub = document.body.classList.contains('sub');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav: transparent -> solid ab Scroll (auch auf Unterseiten mit dunklem Subhero) */
  function onScroll(){ if(nav) nav.classList.toggle('scrolled', window.scrollY > 30); }
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  /* ---- Mobile-Menue: Vollglas-Panel, Header blendet aus, Logo+X im Panel ---- */
  var burger = document.getElementById('burger'),
      mmenu  = document.getElementById('mmenu'),
      mclose = document.getElementById('mclose');

  function lockScroll(){
    var sw = window.innerWidth - document.documentElement.clientWidth;
    if(sw > 0) document.body.style.paddingRight = sw + 'px';
    document.body.style.overflow = 'hidden';
  }
  function unlockScroll(){ document.body.style.overflow=''; document.body.style.paddingRight=''; }

  function openMenu(){ mmenu.classList.add('open'); nav.classList.add('menu-open'); mmenu.removeAttribute('inert'); burger.setAttribute('aria-expanded','true'); lockScroll(); }
  function closeMenu(){ mmenu.classList.remove('open'); nav.classList.remove('menu-open'); mmenu.setAttribute('inert',''); burger.setAttribute('aria-expanded','false'); unlockScroll(); }

  function toggleMenu(){ (mmenu && mmenu.classList.contains('open')) ? closeMenu() : openMenu(); }
  if(burger){ burger.addEventListener('click', toggleMenu); }
  if(mclose){ mclose.addEventListener('click', closeMenu); }
  if(mmenu){ mmenu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); }); }
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && mmenu && mmenu.classList.contains('open')) closeMenu(); });

  /* Swipe nach rechts (Herkunftsrichtung) schliesst das Menue */
  if(mmenu){
    var msx=0, msy=0, mtrack=false;
    mmenu.addEventListener('touchstart', function(e){ msx=e.touches[0].clientX; msy=e.touches[0].clientY; mtrack=true; }, {passive:true});
    mmenu.addEventListener('touchmove', function(e){
      if(!mtrack) return;
      var dx=e.touches[0].clientX-msx, dy=e.touches[0].clientY-msy;
      if(dx>60 && Math.abs(dx)>Math.abs(dy)){ mtrack=false; closeMenu(); }
    }, {passive:true});
    mmenu.addEventListener('touchend', function(){ mtrack=false; });
  }

  /* Smooth-Scroll mit Nav-Offset. Behandelt "/" und "/index.html" als dieselbe Seite,
     damit Anker auf der Startseite sanft scrollen statt neu zu laden. */
  var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
  function samePage(p){ return p.replace(/\/index\.html$/,'/').replace(/\/$/,''); }
  document.querySelectorAll('a[href*="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var url; try{ url = new URL(a.href, location.href); }catch(err){ return; }
      if(samePage(url.pathname) !== samePage(location.pathname) || !url.hash) return;
      var el = document.querySelector(url.hash); if(!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.scrollY - (navH - 4);
      window.scrollTo({ top: (url.hash==='#hero'||url.hash==='#top')?0:y, behavior: reduce?'auto':'smooth' });
      history.replaceState(null,'',url.hash);
    });
  });

  /* Reveal-on-scroll */
  if(!reduce && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  /* Hero-Parallax (Desktop: Foto-Hintergrund; Mobil: Video-Hintergrund), rAF-gedrosselt */
  var heroBg = document.getElementById('heroBg'), heroVidFig = document.querySelector('.hero__video'),
      mqMob = window.matchMedia('(max-width:700px)'), ticking=false;
  if((heroBg || heroVidFig) && !reduce){
    var park = function(){
      var y = window.scrollY;
      if(heroBg) heroBg.style.transform = 'translate3d(0,' + (y*0.5) + 'px,0)';
      if(heroVidFig) heroVidFig.style.transform = mqMob.matches ? 'translate3d(0,' + (y*0.28) + 'px,0)' : '';
      ticking=false;
    };
    window.addEventListener('scroll', function(){ if(ticking) return; ticking=true; requestAnimationFrame(park); }, {passive:true});
    park();
  }

  /* Demo-Leiste: Disclaimer erscheint bei JEDEM Laden (Slide-in). Das X blendet nur
     die aktuelle Ansicht aus - bewusst NICHT dauerhaft merken (Reload zeigt ihn wieder). */
  var demobar = document.getElementById('demobar'), dclose = document.getElementById('demoClose');
  if(dclose){ dclose.addEventListener('click', function(){ demobar.classList.add('hide'); }); }

  /* Hinweise: zurueck-nach-oben-Button (erscheint ab ~600px) */
  var tocTop = document.getElementById('tocTop');
  if(tocTop){
    window.addEventListener('scroll', function(){ tocTop.classList.toggle('show', window.scrollY > 600); }, {passive:true});
    tocTop.addEventListener('click', function(){ window.scrollTo({ top:0, behavior: reduce?'auto':'smooth' }); });
  }

  /* Scrollspy: aktive Sektion im Menue unterstreichen */
  /* Scrollspy: aktive Sektion unterstreichen. Sichtbarkeits-Set statt "nur beim Reinscrollen
     setzen" - ganz oben (nichts im Leseband) wird ALLES geleert, kein haengender Marker. */
  var spyLinks = [].slice.call(document.querySelectorAll('.nav__links a[href*="#"]'));
  var spyIds = [];
  spyLinks.forEach(function(a){ var h=a.hash; if(h && h.length>1 && document.getElementById(h.slice(1))) spyIds.push(h.slice(1)); });
  if('IntersectionObserver' in window && spyIds.length){
    var vis = {};
    var spyIo = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting) vis[en.target.id]=true; else delete vis[en.target.id]; });
      spyLinks.forEach(function(a){ a.classList.remove('active'); });
      for(var i=0;i<spyIds.length;i++){
        if(vis[spyIds[i]]){
          var lnk = spyLinks.filter(function(a){ return a.hash === '#'+spyIds[i]; })[0];
          if(lnk) lnk.classList.add('active');
          break;
        }
      }
    }, { rootMargin:'-45% 0px -50% 0px', threshold:0 });
    spyIds.forEach(function(id){ spyIo.observe(document.getElementById(id)); });
  }

  /* Lightbox fuer die Galerie */
  var lb=document.getElementById('lb'), lbImg=document.getElementById('lbImg');
  var gpics=[].slice.call(document.querySelectorAll('.gallery picture'));
  if(lb && lbImg && gpics.length){
    var shots = gpics.map(function(p){ var im=p.querySelector('img'); return { src:(im.currentSrc||im.src), alt:im.alt }; });
    var cur=0;
    function showLb(i){ cur=(i+shots.length)%shots.length; lbImg.src=shots[cur].src; lbImg.alt=shots[cur].alt; }
    function openLb(i){ showLb(i); lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
    function closeLb(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
    gpics.forEach(function(p,i){ p.addEventListener('click', function(){ openLb(i); }); });
    document.getElementById('lbClose').addEventListener('click', closeLb);
    document.getElementById('lbPrev').addEventListener('click', function(e){ e.stopPropagation(); showLb(cur-1); });
    document.getElementById('lbNext').addEventListener('click', function(e){ e.stopPropagation(); showLb(cur+1); });
    lb.addEventListener('click', function(e){ if(e.target===lb) closeLb(); });
    document.addEventListener('keydown', function(e){ if(!lb.classList.contains('open')) return;
      if(e.key==='Escape') closeLb(); else if(e.key==='ArrowLeft') showLb(cur-1); else if(e.key==='ArrowRight') showLb(cur+1); });
  }

  /* Galerie-Masonry: jedes Bild in die aktuell kürzeste Spalte -> ausgewogene Höhen, keine Rechts-Lücke.
     Läuft NACH der Lightbox-Bindung (Click-Handler bleiben beim Verschieben erhalten). */
  (function(){
    var gal=document.querySelector('.gallery'); if(!gal) return;
    var items=[].slice.call(gal.querySelectorAll('picture')); if(!items.length) return;
    function colCount(){ var w=window.innerWidth; return w<=520?2:(w<=820?3:(w<=1100?4:5)); }
    var built=-1;
    function ratio(p){ var im=p.querySelector('img'); return (im && im.naturalWidth>0) ? (im.naturalHeight/im.naturalWidth) : 1; }
    function build(){
      var n=colCount(), cols=[], h=[], i, j;
      for(i=0;i<n;i++){ var d=document.createElement('div'); d.className='gallery__col'; cols.push(d); h.push(0); }
      /* LPT: hoechste Bilder zuerst in die jeweils kuerzeste Spalte */
      var order=items.slice().sort(function(a,b){ return ratio(b)-ratio(a); });
      order.forEach(function(p){ var mi=0; for(j=1;j<n;j++){ if(h[j]<h[mi]) mi=j; } cols[mi].appendChild(p); h[mi]+=ratio(p)+0.05; });
      /* Feinabgleich: beste Verschiebung ODER Tausch zwischen hoechster und niedrigster Spalte, bis Spanne klein (~5%) */
      function simSpread(mx,mn,nx,nn){ var a=-1e9,b=1e9,k,v; for(k=0;k<n;k++){ v=(k===mx)?nx:(k===mn)?nn:h[k]; if(v>a)a=v; if(v<b)b=v; } return a-b; }
      for(var pass=0; pass<300; pass++){
        var mx=0, mn=0; for(j=1;j<n;j++){ if(h[j]>h[mx]) mx=j; if(h[j]<h[mn]) mn=j; }
        var spread=h[mx]-h[mn]; if(spread<=0.30) break;
        var kx=[].slice.call(cols[mx].children), kn=[].slice.call(cols[mn].children);
        var best=null, ai, bi, a, b, ra, rb, d, ns;
        for(ai=0; ai<kx.length; ai++){ a=kx[ai]; ra=ratio(a); ns=simSpread(mx,mn,h[mx]-(ra+0.05),h[mn]+(ra+0.05)); if(ns<spread-1e-6 && (!best||ns<best.ns)) best={t:1,a:a,ns:ns}; }
        for(ai=0; ai<kx.length; ai++){ a=kx[ai]; ra=ratio(a); for(bi=0; bi<kn.length; bi++){ b=kn[bi]; rb=ratio(b); if(ra<=rb) continue; d=ra-rb; ns=simSpread(mx,mn,h[mx]-d,h[mn]+d); if(ns<spread-1e-6 && (!best||ns<best.ns)) best={t:2,a:a,b:b,ns:ns}; } }
        if(!best) break;
        if(best.t===1){ ra=ratio(best.a); cols[mn].appendChild(best.a); h[mx]-=(ra+0.05); h[mn]+=(ra+0.05); }
        else { d=ratio(best.a)-ratio(best.b); cols[mn].appendChild(best.a); cols[mx].appendChild(best.b); h[mx]-=d; h[mn]+=d; }
      }
      gal.innerHTML='';
      cols.forEach(function(c){ gal.appendChild(c); });
      built=n;
    }
    build();
    var pending=items.length;
    function done(){ if(--pending<=0) build(); }
    items.forEach(function(p){ var im=p.querySelector('img'); if(im && im.complete && im.naturalWidth) done(); else if(im){ im.addEventListener('load',done,{once:true}); im.addEventListener('error',done,{once:true}); } else done(); });
    var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt=setTimeout(function(){ if(colCount()!==built) build(); }, 200); }, {passive:true});
  })();

  /* Hero-Ribbon: mobiler Auto-Marquee, per Finger schiebbar */
  (function(){
    var ribbon = document.querySelector('.ribbon'); if(!ribbon) return;
    var mq = window.matchMedia('(max-width:700px)');
    var track=null, built=false, offset=0, half=0, raf=0, dragging=false, sx=0, so=0;
    function build(){
      if(built) return;
      track=document.createElement('div'); track.className='ribbon__track';
      while(ribbon.firstChild) track.appendChild(ribbon.firstChild);
      [].slice.call(track.children).forEach(function(k){ var c=k.cloneNode(true); c.setAttribute('data-dup','1'); track.appendChild(c); });
      ribbon.appendChild(track); built=true; offset=0; half=track.scrollWidth/2;
    }
    function unbuild(){
      if(!built) return; cancelAnimationFrame(raf);
      [].slice.call(track.querySelectorAll('[data-dup]')).forEach(function(d){ d.remove(); });
      while(track.firstChild) ribbon.insertBefore(track.firstChild, track);
      track.remove(); track=null; built=false;
    }
    function frame(){
      if(!dragging && !reduce) offset -= 0.4;
      if(offset <= -half) offset += half; if(offset > 0) offset -= half;
      track.style.transform = 'translateX(' + offset.toFixed(2) + 'px)';
      raf = requestAnimationFrame(frame);
    }
    function start(){ build(); half=track.scrollWidth/2; cancelAnimationFrame(raf); raf=requestAnimationFrame(frame); }
    ribbon.addEventListener('touchstart', function(e){ if(!built) return; dragging=true; sx=e.touches[0].clientX; so=offset; }, {passive:true});
    ribbon.addEventListener('touchmove', function(e){ if(!dragging) return; offset=so+(e.touches[0].clientX-sx); }, {passive:true});
    ribbon.addEventListener('touchend', function(){ dragging=false; });
    function apply(){ if(mq.matches) start(); else unbuild(); }
    apply();
    if(mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
  })();

  /* Hero-Video: Ton-Schalter (Autoplay ist stumm; ein Klick aktiviert den Ton).
     Zwei Buttons teilen sich denselben Schalter: Overlay im Video (Desktop) + CTA-Button (Mobil). */
  (function(){
    var v=document.getElementById('heroVid');
    var btns=[].slice.call(document.querySelectorAll('.snd, .snd-m'));
    if(!v || !btns.length) return;
    var onSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.7 6a8 8 0 0 1 0 12"/></svg>';
    var offSvg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16.5 9 5 6M21.5 9l-5 6"/></svg>';
    function render(){ btns.forEach(function(b){ b.innerHTML=(v.muted?offSvg+'<span>Ton an</span>':onSvg+'<span>Ton aus</span>'); b.setAttribute('aria-label', v.muted?'Ton einschalten':'Ton ausschalten'); }); }
    render();
    btns.forEach(function(b){ b.addEventListener('click', function(){ v.muted=!v.muted; if(!v.muted){ var p=v.play(); if(p&&p.catch)p.catch(function(){}); } render(); }); });
  })();
})();
