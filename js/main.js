(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loader (with failsafe) ---------- */
  const loader = $('.loader');
  const hideLoader = () => loader?.classList.add('hide');
  addEventListener('load', () => setTimeout(hideLoader, reduce ? 0 : 700));
  setTimeout(hideLoader, 3500);

  /* ---------- Scroll: progress bar, header state, nav reset (rAF throttled) ---------- */
  const progress = $('.progress span');
  const header = $('.header');
  const navLinks = $$('header nav a[href^="#"]');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const d = document.documentElement;
      const max = d.scrollHeight - innerHeight;
      if (progress) progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
      header?.classList.toggle('scrolled', scrollY > 30);
      if (scrollY < 200) navLinks.forEach(a => { a.classList.remove('active'); a.removeAttribute('aria-current'); });
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Mobile / tablet menu ---------- */
  const menu = $('.menu');
  const nav = $('header nav');
  const setMenu = open => {
    if (!nav || !menu) return;
    nav.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
  };
  menu?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', e => {
    if (nav?.classList.contains('open') && !e.target.closest('header')) setMenu(false);
  });
  addEventListener('resize', () => { if (innerWidth > 900) setMenu(false); });

  /* ---------- Reveal on scroll (stagger by sibling position) ---------- */
  const reveal = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const delay = parseInt(el.style.transitionDelay, 10) || 0;
    el.classList.add('show');
    reveal.unobserve(el);
    // after the entrance finishes, give hover transitions back to the element
    setTimeout(() => { el.style.transitionDelay = ''; el.classList.add('done'); }, 1000 + delay);
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  $$('.reveal').forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = Math.min(sibs.indexOf(el) * 80, 400) + 'ms';
    reveal.observe(el);
  });

  /* ---------- Scroll-spy: highlight current section in the nav ---------- */
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    navLinks.forEach(a => {
      const on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    history.replaceState(null, '', '#' + id);
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- Pause hero animation when it is off-screen ---------- */
  const hero = $('.hero');
  if (hero) new IntersectionObserver(([e]) => hero.classList.toggle('paused', !e.isIntersecting)).observe(hero);

  /* ---------- Hero particles (fewer on phones) ---------- */
  if (hero && !reduce) {
    const small = innerWidth < 700;
    const count = small ? 14 : 34;
    for (let i = 0; i < count; i++) {
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
    for (let i = 0; i < (small ? 1 : 3); i++) {
      const s = document.createElement('span');
      s.className = 'space-streak';
      s.style.left = (8 + i * 31) + '%';
      s.style.top = (20 + i * 18) + '%';
      s.style.setProperty('--sd', (6 + i * 1.8) + 's');
      s.style.animationDelay = (-i * 2.3) + 's';
      hero.appendChild(s);
    }
  }

  /* ---------- Mouse-only effects (skipped on touch devices) ---------- */
  if (!fine) return;

  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0;
  const loop = () => {
    rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    raf = (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) ? requestAnimationFrame(loop) : 0;
  };
  const visual = $('.hero-visual');
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
    if (!raf) raf = requestAnimationFrame(loop);
    if (visual && innerWidth >= 900) {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      visual.style.transform = `translate3d(${x * 10}px,${y * 8}px,0)`;
    }
  }, { passive: true });

  $$('a,button,.skill-card,.project,.cert').forEach(el => {
    el.addEventListener('mouseenter', () => ring?.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring?.classList.remove('hover'));
  });

  // magnetic buttons
  $$('.btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.08}px,${(e.clientY - r.top - r.height / 2) * 0.08 - 3}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });

  // card spotlight + subtle tilt
  $$('.project,.skill-card,.service-card').forEach(card => {
    const tilt = !card.classList.contains('service-card');
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      card.style.setProperty('--mx', px + 'px');
      card.style.setProperty('--my', py + 'px');
      if (tilt && innerWidth >= 900) {
        const x = px / r.width - 0.5, y = py / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${y * -2}deg) rotateY(${x * 2}deg) translateY(-5px)`;
      }
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
})();
