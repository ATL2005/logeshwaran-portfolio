(() => {
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const loader=$('.loader');
  window.addEventListener('load',()=>setTimeout(()=>loader?.classList.add('hide'),900));

  const progress=$('.progress span');
  const updateProgress=()=>{const d=document.documentElement; const max=d.scrollHeight-innerHeight; progress.style.width=(max>0?scrollY/max*100:0)+'%'};
  addEventListener('scroll',updateProgress,{passive:true}); updateProgress();

  const menu=$('.menu'), nav=$('header nav');
  menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));});
  $$('nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));

  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');reveal.unobserve(e.target)}}),{threshold:.12});
  $$('.reveal').forEach((el,i)=>{el.style.transitionDelay=Math.min(i%6*70,350)+'ms';reveal.observe(el)});

  const dot=$('.cursor-dot'), ring=$('.cursor-ring'); let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;if(dot){dot.style.left=mx+'px';dot.style.top=my+'px'}});
  const cursorLoop=()=>{rx+=(mx-rx)*.14;ry+=(my-ry)*.14;if(ring){ring.style.left=rx+'px';ring.style.top=ry+'px'}requestAnimationFrame(cursorLoop)}; cursorLoop();
  $$('a,button,.skill-card,.project,.cert').forEach(el=>{el.addEventListener('mouseenter',()=>ring?.classList.add('hover'));el.addEventListener('mouseleave',()=>ring?.classList.remove('hover'))});

  // subtle pointer parallax for the hero system
  const visual=$('.hero-visual'), arch=$('.architecture');
  addEventListener('pointermove',e=>{if(!visual||innerWidth<900)return;const x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5); visual.style.transform=`translate3d(${x*10}px,${y*8}px,0)`; if(arch) arch.style.transform=`translate3d(${x*-12}px,${y*-8}px,0)`});

  // magnetic buttons
  $$('.btn').forEach(btn=>btn.addEventListener('pointermove',e=>{const r=btn.getBoundingClientRect();btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08-3}px)`}));
  $$('.btn').forEach(btn=>btn.addEventListener('pointerleave',()=>btn.style.transform=''));

  // project card tilt
  $$('.project,.skill-card').forEach(card=>{
    card.addEventListener('pointermove',e=>{if(innerWidth<900)return;const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${y*-2}deg) rotateY(${x*2}deg) translateY(-5px)`});
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });

  // cinematic hero particles / energy streaks
  const hero = $('.hero');
  if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (let i = 0; i < 34; i++) {
      const p = document.createElement('span');
      p.className = 'space-particle';
      p.style.left = (3 + Math.random() * 94) + '%';
      p.style.top = (8 + Math.random() * 82) + '%';
      p.style.setProperty('--pd', (5 + Math.random() * 8).toFixed(2) + 's');
      p.style.setProperty('--po', (0.25 + Math.random() * 0.7).toFixed(2));
      p.style.setProperty('--px', (-60 + Math.random() * 120).toFixed(0) + 'px');
      p.style.setProperty('--py', (-50 - Math.random() * 110).toFixed(0) + 'px');
      p.style.setProperty('--px2', (-100 + Math.random() * 200).toFixed(0) + 'px');
      p.style.setProperty('--py2', (-110 - Math.random() * 150).toFixed(0) + 'px');
      p.style.animationDelay = (-Math.random() * 10).toFixed(2) + 's';
      hero.appendChild(p);
    }
    for (let i = 0; i < 3; i++) {
      const streak = document.createElement('span');
      streak.className = 'space-streak';
      streak.style.left = (8 + i * 31) + '%';
      streak.style.top = (20 + i * 18) + '%';
      streak.style.setProperty('--sd', (6 + i * 1.8) + 's');
      streak.style.animationDelay = (-i * 2.3) + 's';
      hero.appendChild(streak);
    }
  }

  // active section state through URL hash
  const sections=$$('main section[id]');
  const sectionObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting) history.replaceState(null,'','#'+e.target.id)}),{rootMargin:'-40% 0px -50%'});
  sections.forEach(s=>sectionObs.observe(s));
})();
