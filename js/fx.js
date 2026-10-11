/* =====================================================================
   FX — Orbital Tech Globe (canvas), role typewriter, animated header.
   Works on desktop, tablet and phones.
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, p = document) => p.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(hover:none), (pointer:coarse)').matches;

  /* ---------------------------------------------------------------
     1) ORBITAL TECH GLOBE
  --------------------------------------------------------------- */ 
  const canvas = document.getElementById('orb-canvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const isSmall = () => innerWidth < 700;
    let W = 0, H = 0, R = 0, dpr = 1;

    /* --- static geometry: Fibonacci sphere + neighbour edges --- */
    const N = isSmall() ? 88 : 138;
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r });
    }
    const THR = isSmall() ? 0.5 : 0.41;
    const edges = [];
    const adj = pts.map(() => []);
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dz = pts[i].z - pts[j].z;
        if (dx * dx + dy * dy + dz * dz < THR * THR) {
          const t = ((pts[i].y + pts[j].y) / 2 + 1) / 2; // 0 (top) .. 1 (bottom)
          // cyan -> violet -> pink by height
          const c = t < 0.5
            ? mix([34, 211, 238], [139, 92, 246], t * 2)
            : mix([139, 92, 246], [244, 114, 182], (t - 0.5) * 2);
          edges.push({ a: i, b: j, c });
          adj[i].push(edges.length - 1);
          adj[j].push(edges.length - 1);
        }
      }
    }
    function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t | 0, a[1] + (b[1] - a[1]) * t | 0, a[2] + (b[2] - a[2]) * t | 0]; }

    /* --- orbits & chips --- */
    const orbits = [
      { r: 1.38, tx: 1.1, tz: 0.25, col: [34, 211, 238] },
      { r: 1.52, tx: -0.55, tz: 1.0, col: [139, 92, 246] },
      { r: 1.26, tx: 0.35, tz: -0.95, col: [244, 114, 182] }
    ];
    const chips = [
      { l: 'REACT', o: 0, p: 0.0, s: 0.00058, c: [34, 211, 238] },
      { l: 'NODE.JS', o: 1, p: 2.1, s: -0.0005, c: [139, 92, 246] },
      { l: 'PYTHON', o: 2, p: 4.0, s: 0.00068, c: [244, 114, 182] },
      { l: 'MYSQL', o: 0, p: 3.3, s: 0.00058, c: [94, 234, 212] },
      { l: 'AI / ML', o: 1, p: 0.9, s: -0.0005, c: [196, 181, 253] },
      { l: 'ERP', o: 2, p: 1.6, s: 0.00068, c: [103, 232, 249] },
      { l: 'CLOUD', o: 0, p: 5.0, s: 0.00058, c: [249, 168, 212] }
    ];

    /* --- data packets travelling along edges --- */
    const packets = [];
    for (let i = 0; i < (isSmall() ? 5 : 8); i++) {
      const e = (Math.random() * edges.length) | 0;
      packets.push({ e, dir: Math.random() < 0.5, t: Math.random(), v: 0.0009 + Math.random() * 0.0008 });
    }

    /* --- interaction state --- */
    let ay = 0.6, ax = 0.32, vy = 0, vx = 0;
    let down = false, lastX = 0, lastY = 0, moved = 0;
    let tiltX = 0, tiltY = 0, tX = 0, tY = 0;
    const ripples = [];
    const BASE_SPIN = 0.0026, BASE_PITCH = 0.32;

    canvas.addEventListener('pointerdown', e => {
      down = true; moved = 0; lastX = e.clientX; lastY = e.clientY;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      canvas.classList.add('grabbing');
    });
    canvas.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      ay += dx * 0.009; ax += dy * 0.006;
      vy = dx * 0.0016; vx = dy * 0.001;
      ax = Math.max(-0.9, Math.min(0.9, ax));
    });
    const release = e => {
      if (!down) return;
      down = false; canvas.classList.remove('grabbing');
      if (moved < 8) { // treat as tap
        const r = canvas.getBoundingClientRect();
        ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: 0 });
        vy += 0.05;
      }
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', () => { down = false; canvas.classList.remove('grabbing'); });

    // phone tilt (Android / non-iOS-permission devices) — gentle parallax
    addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      tY = Math.max(-1, Math.min(1, e.gamma / 40));
      tX = Math.max(-1, Math.min(1, ((e.beta || 0) - 50) / 40));
    }, { passive: true });

    /* --- sizing --- */
    const chipCache = new Map();
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, H) * 0.27;
      chipCache.clear();
      if (reduce) draw(0, 0);
    };
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else addEventListener('resize', resize);

    /* --- helpers --- */
    const rotate = (x, y, z, cy, sy, cx, sx) => {
      const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
      return [x1, y * cx - z1 * sx, y * sx + z1 * cx];
    };
    const rr = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };
    const orbitPoint = (o, a, cy2, sy2, cx2, sx2) => {
      let x = Math.cos(a) * o.r, y = 0, z = Math.sin(a) * o.r;
      let y1 = -z * Math.sin(o.tx), z1 = z * Math.cos(o.tx);
      const x2 = x * Math.cos(o.tz) - y1 * Math.sin(o.tz);
      const y2 = x * Math.sin(o.tz) + y1 * Math.cos(o.tz);
      return rotate(x2, y2, z1, cy2, sy2, cx2, sx2);
    };

    /* --- draw a single chip --- */
    const drawChip = (chip, p, depth) => {
      const fs = isSmall() ? 9 : 10.5;
      let m = chipCache.get(chip.l);
      if (!m) {
        ctx.font = `500 ${fs}px "DM Mono",ui-monospace,Menlo,monospace`;
        m = ctx.measureText(chip.l).width; chipCache.set(chip.l, m);
      }
      const padX = 8, h = fs + 10, w = m + padX * 2;
      const s = 0.72 + depth * 0.42;
      ctx.save();
      ctx.translate(p[0], p[1]);
      ctx.scale(s, s);
      ctx.globalAlpha = 0.35 + depth * 0.65;
      rr(-w / 2, -h / 2, w, h, 7);
      ctx.fillStyle = 'rgba(7,10,24,.86)';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${chip.c[0]},${chip.c[1]},${chip.c[2]},.7)`;
      ctx.stroke();
      ctx.fillStyle = `rgb(${chip.c[0]},${chip.c[1]},${chip.c[2]})`;
      ctx.font = `500 ${fs}px "DM Mono",ui-monospace,Menlo,monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(chip.l, 0, 0.5);
      ctx.restore();
    };

    /* --- main render --- */
    const draw = (time, dt) => {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;

      // inertia + auto motion
      if (!down && !reduce) {
        ay += BASE_SPIN * (dt / 16.7) + vy;
        ax += vx;
        vy *= 0.94; vx *= 0.94;
        ax += (BASE_PITCH - ax) * 0.012;
      }
      tiltX += (tX - tiltX) * 0.08; tiltY += (tY - tiltY) * 0.08;
      const Ay = ay + tiltY * 0.5, Ax = ax + tiltX * 0.35;
      const cyw = Math.cos(Ay), syw = Math.sin(Ay), cxw = Math.cos(Ax), sxw = Math.sin(Ax);
      // orbits turn slower than the globe for a layered, parallax feel
      const cyo = Math.cos(Ay * 0.35 + 0.4), syo = Math.sin(Ay * 0.35 + 0.4);
      const cxo = Math.cos(Ax * 0.6), sxo = Math.sin(Ax * 0.6);

      // soft pulsing core glow
      const pulse = 0.5 + 0.5 * Math.sin(time / 900);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (1.7 + pulse * 0.12));
      g.addColorStop(0, 'rgba(124,58,237,.30)');
      g.addColorStop(0.45, 'rgba(34,211,238,.09)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // --- orbit paths ---
      const SEG = 56;
      ctx.lineWidth = 1;
      orbits.forEach(o => {
        let prev = null;
        for (let i = 0; i <= SEG; i++) {
          const a = (i / SEG) * Math.PI * 2;
          const q = orbitPoint(o, a, cyo, syo, cxo, sxo);
          const f = 1 + q[2] * 0.12;
          const px = cx + q[0] * R * f, py = cy + q[1] * R * f;
          const depth = Math.max(0, Math.min(1, (q[2] / (o.r * 1.1) + 1) / 2));
          if (prev) {
            ctx.strokeStyle = `rgba(${o.col[0]},${o.col[1]},${o.col[2]},${(0.06 + depth * 0.3).toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(px, py); ctx.stroke();
          }
          prev = [px, py];
        }
      });

      // chip positions
      const chipPos = chips.map(c => {
        const a = c.p + time * c.s;
        const q = orbitPoint(orbits[c.o], a, cyo, syo, cxo, sxo);
        const f = 1 + q[2] * 0.12;
        const depth = Math.max(0, Math.min(1, (q[2] / (orbits[c.o].r * 1.1) + 1) / 2));
        return { c, p: [cx + q[0] * R * f, cy + q[1] * R * f], z: q[2], depth };
      });
      // chips behind the globe
      chipPos.filter(c => c.z < 0).forEach(c => drawChip(c.c, c.p, c.depth));

      // --- globe: project points ---
      const proj = new Array(N);
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const q = rotate(p.x, p.y, p.z, cyw, syw, cxw, sxw);
        const f = 1 + q[2] * 0.16;
        proj[i] = { x: cx + q[0] * R * f, y: cy + q[1] * R * f, d: (q[2] + 1) / 2 };
      }
      // edges
      ctx.lineWidth = 1;
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i], a = proj[e.a], b = proj[e.b];
        const d = (a.d + b.d) / 2;
        ctx.strokeStyle = `rgba(${e.c[0]},${e.c[1]},${e.c[2]},${(0.05 + d * d * 0.5).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      // nodes
      for (let i = 0; i < N; i++) {
        const p = proj[i];
        const t = (pts[i].y + 1) / 2;
        const col = t < 0.5 ? mix([34, 211, 238], [139, 92, 246], t * 2) : mix([139, 92, 246], [244, 114, 182], (t - 0.5) * 2);
        if (p.d > 0.72) {
          ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},.16)`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 4.5 + p.d * 2, 0, 6.283); ctx.fill();
        }
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${(0.25 + p.d * 0.75).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 0.8 + p.d * 1.7, 0, 6.283); ctx.fill();
      }

      // --- data packets ---
      if (!reduce) {
        packets.forEach(k => {
          k.t += k.v * dt;
          if (k.t >= 1) {
            const end = k.dir ? edges[k.e].a : edges[k.e].b;
            const list = adj[end];
            const next = list[(Math.random() * list.length) | 0];
            k.dir = edges[next].a === end ? false : true; // travel away from `end`
            k.e = next; k.t = 0;
          }
          const e = edges[k.e];
          const A = proj[k.dir ? e.b : e.a], B = proj[k.dir ? e.a : e.b];
          const x = A.x + (B.x - A.x) * k.t, y = A.y + (B.y - A.y) * k.t;
          const d = (A.d + B.d) / 2;
          ctx.fillStyle = `rgba(255,255,255,${0.35 + d * 0.65})`;
          ctx.beginPath(); ctx.arc(x, y, 1.8 + d * 1.2, 0, 6.283); ctx.fill();
          ctx.fillStyle = `rgba(34,211,238,${0.12 + d * 0.2})`;
          ctx.beginPath(); ctx.arc(x, y, 7 + d * 3, 0, 6.283); ctx.fill();
        });
      }

      // chips in front of the globe
      chipPos.filter(c => c.z >= 0).forEach(c => drawChip(c.c, c.p, c.depth));

      // --- tap ripples ---
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.t += dt;
        const k = r.t / 900;
        if (k >= 1) { ripples.splice(i, 1); continue; }
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(34,211,238,${(1 - k) * 0.8})`;
        ctx.beginPath(); ctx.arc(r.x, r.y, 8 + k * R * 1.5, 0, 6.283); ctx.stroke();
        ctx.strokeStyle = `rgba(139,92,246,${(1 - k) * 0.5})`;
        ctx.beginPath(); ctx.arc(r.x, r.y, 4 + k * R * 1.0, 0, 6.283); ctx.stroke();
      }
    };

    /* --- loop (pauses off-screen / hidden tab) --- */
    let visible = true, running = false, last = 0;
    const loop = t => {
      if (!visible || document.hidden) { running = false; return; }
      const dt = Math.min(50, last ? t - last : 16.7);
      last = t;
      draw(t, dt);
      requestAnimationFrame(loop);
    };
    const start = () => { if (running || reduce) return; running = true; last = 0; requestAnimationFrame(loop); };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
    resize();
    start();
  }

  /* ---------------------------------------------------------------
     2) ROLE TYPEWRITER
  --------------------------------------------------------------- */
  const roleEl = $('#role-text');
  if (roleEl) {
    const roles = ['Full-Stack Developer', 'AI / ML Enthusiast', 'ERP Software Builder', 'Cloud & Deployment'];
    if (reduce) { roleEl.textContent = roles[0]; }
    else {
      let ri = 0, ci = 0, del = false;
      const tick = () => {
        const word = roles[ri];
        ci += del ? -1 : 1;
        roleEl.textContent = word.slice(0, ci);
        let wait = del ? 28 : 62;
        if (!del && ci === word.length) { del = true; wait = 1500; }
        else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; wait = 350; }
        setTimeout(tick, wait);
      };
      tick();
    }
  }

  /* ---------------------------------------------------------------
     3) ANIMATED HEADER — sliding nav pill + menu overlay state
  --------------------------------------------------------------- */
  const nav = $('header nav');
  const pill = $('.nav-pill');
  if (nav && pill) {
    const normal = [...nav.querySelectorAll('a')].filter(a => !a.classList.contains('nav-contact'));
    const place = a => {
      if (!a || innerWidth <= 900) { pill.style.opacity = '0'; return; }
      const nr = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
      const wasHidden = pill.style.opacity !== '1';
      if (wasHidden) { pill.classList.add('snap'); }
      pill.style.width = (r.width + 22) + 'px';
      pill.style.setProperty('--x', (r.left - nr.left - 11) + 'px');
      pill.style.opacity = '1';
      if (wasHidden) { void pill.offsetWidth; pill.classList.remove('snap'); }
    };
    const home = () => place(nav.querySelector('a.active:not(.nav-contact)'));
    normal.forEach(a => {
      a.addEventListener('mouseenter', () => place(a));
      a.addEventListener('focus', () => place(a));
    });
    nav.addEventListener('mouseleave', home);
    nav.addEventListener('focusout', home);
    new MutationObserver(home).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });
    addEventListener('resize', home);
    addEventListener('load', home);
    home();
  }
  if (nav) {
    const sync = () => document.body.classList.toggle('menu-open', nav.classList.contains('open') && innerWidth <= 900);
    new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ['class'] });
    addEventListener('resize', sync);
  }
})();
