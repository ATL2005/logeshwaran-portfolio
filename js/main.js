const loader=document.querySelector('.loader');
window.addEventListener('load',()=>setTimeout(()=>loader.classList.add('hide'),900));
const progress=document.querySelector('.progress span');
window.addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;progress.style.width=(scrollY/h*100)+'%'},{passive:true});

const menu=document.querySelector('.menu'), nav=document.querySelector('.header nav');
menu.addEventListener('click',()=>nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));

const dot=document.querySelector('.cursor-dot'), ring=document.querySelector('.cursor-ring');
if(matchMedia('(pointer:fine)').matches){
  let mx=0,my=0,rx=0,ry=0;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx-3}px,${my-3}px)`});
  function follow(){rx+=(mx-rx)*.14;ry+=(my-ry)*.14;ring.style.transform=`translate(${rx-16}px,${ry-16}px)`;requestAnimationFrame(follow)} follow();
  document.querySelectorAll('a,button,.skill-card,.project').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ring.style.width='50px';ring.style.height='50px'});
    el.addEventListener('mouseleave',()=>{ring.style.width='32px';ring.style.height='32px'});
  });
}
document.querySelectorAll('.hero,.contact').forEach(section=>{
 section.addEventListener('mousemove',e=>{
   const r=section.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
   section.querySelectorAll('.hero-orb,.architecture').forEach(el=>el.style.transform=`translate(${x*14}px,${y*14}px)`);
 });
});
