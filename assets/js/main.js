/* Dixon Simon — portfolio interactions */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- split headings into words ---------- */
  $$('[data-split]').forEach((el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = p;
            inner.style.setProperty('--i', i++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    $$('.w', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  $$('[data-split],[data-fade],[data-reveal]').forEach((el) => io.observe(el));

  /* ---------- loader ---------- */
  const loader = $('.loader');
  const counter = $('[data-count]');
  const seen = (() => { try { return sessionStorage.getItem('ds-seen') === '1'; } catch (e) { return false; } })();
  const finishLoad = () => {
    root.classList.add('is-loaded');
    $$('.hero [data-fade]').forEach((el, i) => setTimeout(() => el.classList.add('is-in'), 500 + i * 120));
  };
  if (!loader || reduced || seen) {
    if (loader) loader.classList.add('is-gone');
    requestAnimationFrame(finishLoad);
  } else {
    const dur = 1100; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      counter.textContent = Math.round(eased * 100);
      if (p < 1) requestAnimationFrame(tick);
      else {
        loader.classList.add('is-done');
        setTimeout(finishLoad, 280);
        setTimeout(() => loader.classList.add('is-gone'), 1100);
        try { sessionStorage.setItem('ds-seen', '1'); } catch (e) {}
      }
    };
    requestAnimationFrame(tick);
  }

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95 });
  }
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: 0 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      if (id !== '#top') history.replaceState(null, '', id);
    });
  });

  /* ---------- clock ---------- */
  const clock = $('[data-clock]');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const setClock = () => { if (clock) clock.textContent = fmt.format(new Date()); };
  setClock(); setInterval(setClock, 15000);

  /* ---------- scroll-driven effects ---------- */
  const nav = $('[data-nav]');
  const bar = $('.progress span');
  const track = $('.marquee__track');
  const parallax = $$('[data-parallax]');
  const navLinks = $$('.nav__links a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  let lastY = window.scrollY; let vel = 0; let smoothVel = 0;

  const onScroll = (y) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    // hide nav on scroll down, show on scroll up
    const dy = y - lastY;
    if (nav) {
      if (y > 200 && dy > 4) nav.classList.add('is-hidden');
      else if (dy < -4 || y < 200) nav.classList.remove('is-hidden');
    }
    vel = dy; lastY = y;

    // active link
    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.45) current = s; });
    navLinks.forEach((a) => a.classList.toggle('is-active', current && a.getAttribute('href') === '#' + current.id));
  };

  const frame = () => {
    // motion blur on the marquee follows scroll speed
    smoothVel += (vel - smoothVel) * 0.12; vel *= 0.85;
    if (track && !reduced) {
      const v = Math.max(-40, Math.min(40, smoothVel));
      track.style.filter = Math.abs(v) > 0.4 ? `blur(${Math.abs(v) * 0.09}px)` : 'none';
      track.parentElement.style.transform = `skewX(${v * -0.12}deg)`;
    }
    // image parallax
    if (!reduced) {
      const vh = window.innerHeight;
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
        const img = el.tagName === 'IMG' ? el : el.querySelector('img');
        const shift = (p * -28).toFixed(2) + 'px';
        if (img) img.style.setProperty('--py', shift);
        else el.style.transform = `translateY(${p * -24}px)`;
      });
    }
    requestAnimationFrame(frame);
  };

  if (lenis) {
    lenis.on('scroll', ({ scroll }) => onScroll(scroll));
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  } else {
    window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  }
  onScroll(window.scrollY);
  requestAnimationFrame(frame);

  /* ---------- hero card stack follows the pointer ---------- */
  const stack = $('[data-stack]');
  if (stack && finePointer && !reduced) {
    const cards = $$('.card', stack);
    const depth = [18, -26, 34];
    setTimeout(() => cards.forEach((c) => c.classList.add('is-live')), 2600);
    window.addEventListener('pointermove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      cards.forEach((c, i) => {
        c.style.setProperty('--x', `${(x * depth[i]).toFixed(1)}px`);
        c.style.setProperty('--y', `${(y * depth[i]).toFixed(1)}px`);
      });
    }, { passive: true });
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduced) {
    $$('[data-magnetic]').forEach((el) => {
      el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- index hover preview ---------- */
  const box = $('[data-preview-box]');
  if (box && finePointer) {
    const img = $('img', box);
    let tx = 0, ty = 0, cx = 0, cy = 0, on = false;
    $$('[data-list] a').forEach((a) => {
      const src = a.dataset.preview;
      a.addEventListener('pointerenter', () => {
        if (!src) return;
        img.src = src; on = true; box.classList.add('is-on');
      });
      a.addEventListener('pointerleave', () => { on = false; box.classList.remove('is-on'); });
    });
    window.addEventListener('pointermove', (e) => { tx = e.clientX + 200; ty = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
      const maxX = window.innerWidth - box.offsetWidth / 2 - 16;
      box.style.left = Math.min(cx, maxX) + 'px';
      box.style.top = cy + 'px';
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- copy email ---------- */
  $$('[data-copy]').forEach((btn) => {
    const label = $('[data-copy-label]', btn);
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = 'Copied';
      } catch (e) {
        label.textContent = 'Press Ctrl+C';
      }
      btn.classList.add('is-done');
      setTimeout(() => { label.textContent = 'Copy'; btn.classList.remove('is-done'); }, 2000);
    });
  });
})();
