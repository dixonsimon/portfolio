/* Dixon Simon — portfolio interactions
   One scroll loop drives every scrubbed 3D effect; elements are only measured
   while they are near the viewport. */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  if (reduced) root.classList.add('rm');

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

  /* ---------- split big titles into characters ---------- */
  $$('[data-chars]').forEach((el) => {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    let i = 0;
    text.split(' ').forEach((word, wi) => {
      if (wi) el.appendChild(document.createTextNode(' '));
      // keep each word's letters together so lines only break between words
      const w = document.createElement('span'); w.className = 'cw'; w.setAttribute('aria-hidden', 'true');
      [...word].forEach((c) => {
        const o = document.createElement('span'); o.className = 'ch';
        const s = document.createElement('span'); s.textContent = c; s.style.setProperty('--c', i++);
        o.appendChild(s); w.appendChild(o);
      });
      el.appendChild(w); i++;
    });
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  $$('[data-split],[data-fade],[data-reveal],[data-chars]').forEach((el) => io.observe(el));

  /* ---------- count-up stats ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target; const to = +el.dataset.countup; const dec = +(el.dataset.decimals || 0); const suf = el.dataset.suffix || '';
      if (reduced) return;
      const t0 = performance.now(); const dur = 1600;
      const step = (t) => {
        const p = easeOut(clamp((t - t0) / dur));
        el.textContent = (to * p).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-countup]').forEach((el) => countIO.observe(el));

  /* ---------- loader ---------- */
  const loader = $('.loader');
  const counter = $('[data-count]');
  const loadBar = $('[data-loader-bar]');
  const seen = (() => { try { return sessionStorage.getItem('ds-seen') === '1'; } catch (e) { return false; } })();
  const finishLoad = () => {
    root.classList.add('is-loaded');
    window.dispatchEvent(new Event('ds:loaded'));
    $$('.hero [data-fade]').forEach((el, i) => setTimeout(() => el.classList.add('is-in'), 500 + i * 120));
  };
  if (!loader || reduced || seen) {
    if (loader) loader.classList.add('is-gone');
    requestAnimationFrame(finishLoad);
  } else {
    const dur = 1300; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = easeOut(p);
      counter.textContent = String(Math.round(e * 100)).padStart(2, '0');
      if (loadBar) loadBar.style.transform = `scaleX(${e.toFixed(3)})`;
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
  const scrollToTarget = (id) => {
    const target = id === '#top' ? document.body : $(id);
    if (!target) return false;
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: 0 });
    else if (id === '#top') window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    return true;
  };

  /* ---------- mobile menu ---------- */
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-btn]');
  const setMenu = (open) => {
    if (!menu || !menuBtn) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    root.classList.toggle('menu-open', open);
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); if (lenis) lenis.stop(); }
    else { menu.classList.remove('is-open'); if (lenis) lenis.start(); setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 500); }
  };
  if (menuBtn) menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } });

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const wasOpen = root.classList.contains('menu-open');
      if (wasOpen) setMenu(false);
      e.preventDefault();
      // let the menu release Lenis before scrolling
      setTimeout(() => { if (scrollToTarget(id) && id !== '#top') history.replaceState(null, '', id); }, wasOpen ? 60 : 0);
    });
  });

  /* ---------- clock ---------- */
  const clock = $('[data-clock]');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const setClock = () => { if (clock) clock.textContent = fmt.format(new Date()); };
  setClock(); setInterval(setClock, 15000);

  /* ---------- elements driven by scroll ---------- */
  const nav = $('[data-nav]');
  const bar = $('.progress span');
  const track = $('.marquee__track');
  const navLinks = $$('.nav__links a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const hero = $('[data-hero]');
  const heroLines = $$('[data-hero-line]');
  const heroFoot = $('[data-hero-foot]');
  const stack = $('[data-stack]');
  const cards = stack ? $$('.card', stack) : [];
  const footWord = $('[data-footer-word]');

  // only measure what is near the viewport
  const near = new Set();
  const nearIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? near.add(e.target) : near.delete(e.target)));
  }, { rootMargin: '25% 0px 25% 0px' });
  const tilts = $$('[data-tilt]');
  const folds = $$('[data-fold]');
  const parallax = $$('[data-parallax]');
  const posters = $$('[data-poster]');
  const drifts = $$('[data-drift]');
  const sheets = $$('[data-sheet]');
  [...tilts, ...folds, ...parallax, ...posters, ...drifts, ...sheets].forEach((el) => nearIO.observe(el));
  if (footWord) nearIO.observe(footWord);

  /* ---------- "Selected work": fly through the o ---------- */
  const zoom = $('[data-zoom]');
  const zoomTitle = zoom ? $('.zoom__title', zoom) : null;
  const zoomO = zoom ? $('[data-zoom-origin]', zoom) : null;
  const zoomFade = zoom ? $$('.zoom__label, .zoom__sub', zoom) : [];
  const measureZoom = () => {
    if (!zoomTitle || !zoomO) return;
    // offsets ignore transforms, so this is stable mid-animation; aim at the o's counter
    zoomTitle.style.position = 'relative';
    const ox = zoomO.offsetLeft + zoomO.offsetWidth * 0.54;
    const oy = zoomO.offsetTop + zoomO.offsetHeight * 0.6;
    zoomTitle.style.setProperty('--ox', `${ox.toFixed(1)}px`);
    zoomTitle.style.setProperty('--oy', `${oy.toFixed(1)}px`);
  };
  if (zoom) { nearIO.observe(zoom); measureZoom(); window.addEventListener('resize', measureZoom); if (document.fonts) document.fonts.ready.then(measureZoom); }
  const updateZoom = (vh) => {
    const r = zoom.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - vh));
    const e = Math.pow(p, 2.4);
    const s = 1 + e * 90;
    zoomTitle.style.transform = `scale(${s.toFixed(3)})`;
    zoomTitle.style.opacity = (1 - clamp((p - 0.82) / 0.14)).toFixed(3);
    zoomTitle.style.filter = p > 0.55 ? `blur(${((p - 0.55) * 6).toFixed(2)}px)` : 'none';
    zoomFade.forEach((el) => { el.style.opacity = (1 - clamp(p / 0.22)).toFixed(3); el.style.transform = `translate3d(0, ${(-p * 80).toFixed(1)}px, 0)`; });
  };

  /* ---------- Halvane coverflow ---------- */
  const show = $('[data-show]');
  const slides = show ? $$('[data-slide]', show) : [];
  const showTitle = $('[data-show-title]');
  const showSub = $('[data-show-sub]');
  const showCount = $('[data-show-count]');
  const showBar = $('[data-show-bar]');
  let slideW = 0; let lastIdx = -1;
  if (show) { show.style.setProperty('--n', slides.length); nearIO.observe(show); }
  const measureShow = () => { slideW = slides[0] ? slides[0].offsetWidth : 0; };
  measureShow(); window.addEventListener('resize', measureShow);

  const updateShow = (vh) => {
    const r = show.getBoundingClientRect();
    const span = Math.max(1, r.height - vh);
    const p = clamp(-r.top / span);
    const n = slides.length;
    const pos = p * (n - 1);
    const W = slideW || 600;
    slides.forEach((s, i) => {
      const d = i - pos; const ad = Math.abs(d); const sg = Math.sign(d);
      const x = sg * (Math.min(ad, 1) * W * 0.74 + Math.max(ad - 1, 0) * W * 0.22);
      const z = -Math.min(ad, 3) * 340;
      const ry = clamp(d, -1.3, 1.3) * 40;
      s.style.transform = `translate(-50%, -50%) perspective(1700px) translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
      s.style.opacity = (1 - clamp((ad - 1.25) / 0.7, 0, 1)).toFixed(3);
      s.style.zIndex = String(100 - Math.round(ad * 10));
      s.style.setProperty('--shade', (Math.min(ad, 1.3) * 0.5).toFixed(3));
    });
    const idx = Math.round(pos);
    if (idx !== lastIdx) {
      lastIdx = idx;
      const s = slides[idx];
      if (showTitle) showTitle.innerHTML = s.dataset.title;
      if (showSub) showSub.textContent = s.dataset.sub;
      if (showCount) showCount.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
      slides.forEach((el, i) => el.classList.toggle('is-front', i === idx));
    }
    if (showBar) showBar.style.transform = `scaleX(${p})`;
    // tilt the whole stage as it arrives
    const enter = clamp((vh - r.top) / vh);
    show.style.setProperty('--enter', easeOut(enter).toFixed(3));
  };

  let lastY = window.scrollY; let vel = 0; let smoothVel = 0;

  const onScroll = (y) => {
    const max = root.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    const dy = y - lastY;
    if (nav && !root.classList.contains('menu-open')) {
      if (y > 200 && dy > 4) nav.classList.add('is-hidden');
      else if (dy < -4 || y < 200) nav.classList.remove('is-hidden');
    }
    vel = dy; lastY = y;
    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.45) current = s; });
    navLinks.forEach((a) => a.classList.toggle('is-active', !!current && a.getAttribute('href') === '#' + current.id));
  };

  const frame = () => {
    const vh = window.innerHeight;
    const y = lenis ? lenis.scroll : window.scrollY;
    smoothVel += (vel - smoothVel) * 0.12; vel *= 0.85;

    if (!reduced) {
      // marquee reacts to scroll speed
      if (track) {
        const v = clamp(smoothVel, -40, 40);
        track.style.filter = Math.abs(v) > 0.6 ? `blur(${(Math.abs(v) * 0.07).toFixed(2)}px)` : 'none';
        track.parentElement.style.transform = `skewX(${(v * -0.12).toFixed(2)}deg)`;
      }

      // hero: title splits apart in depth, cards fly toward the camera
      if (hero && y < hero.offsetHeight * 1.2) {
        const p = clamp(y / (hero.offsetHeight * 0.85));
        const e = p * p;
        heroLines.forEach((l) => {
          const dir = +l.dataset.heroLine;
          l.style.transform = `translate3d(${(dir * e * 16).toFixed(2)}vw, ${(-p * 4).toFixed(2)}vh, ${(-e * 220).toFixed(1)}px) rotateX(${(p * 38).toFixed(2)}deg)`;
          l.style.opacity = (1 - e * 0.85).toFixed(3);
        });
        if (heroFoot) { heroFoot.style.opacity = (1 - clamp(p * 1.6)).toFixed(3); heroFoot.style.transform = `translate3d(0, ${(p * 60).toFixed(1)}px, 0)`; }
        cards.forEach((c, i) => {
          const spread = [-1, 1, 0.2][i] || 0;
          c.style.setProperty('--sz', `${(e * [320, 520, 720][i]).toFixed(1)}px`);
          c.style.setProperty('--sy', `${(-p * [120, 40, -80][i]).toFixed(1)}px`);
          c.style.setProperty('--sx', `${(e * spread * 260).toFixed(1)}px`);
          c.style.setProperty('--sry', `${(e * spread * -28).toFixed(2)}deg`);
          c.style.setProperty('--srx', `${(p * 18).toFixed(2)}deg`);
        });
        if (stack) stack.style.opacity = (1 - clamp((p - 0.45) * 2)).toFixed(3);
      }

      // scroll speed drives a vertical smear on the work frames (motion blur + skew)
      const sv = clamp(smoothVel, -60, 60);
      const smear = Math.abs(sv) > 1.2 ? Math.min(3.2, (Math.abs(sv) - 1.2) * 0.09) : 0;
      const skew = sv * -0.045;

      // project frames tilt into place in 3D
      tilts.forEach((el) => {
        if (!near.has(el)) return;
        const r = el.getBoundingClientRect();
        const t = easeOut(clamp((vh - r.top) / (vh * 0.8)));
        const out = clamp(-r.top / (r.height * 1.4));
        const side = el.closest('.case--flip') ? 1 : -1;
        const k = 1 - t;
        el.style.transform = `perspective(1500px) translate3d(0, ${(k * 110).toFixed(1)}px, ${(k * -240 - out * 120).toFixed(1)}px) rotateX(${(k * 24 - out * 10).toFixed(2)}deg) rotateY(${(side * k * 14).toFixed(2)}deg) skewY(${skew.toFixed(2)}deg)`;
        el.style.opacity = (0.1 + 0.9 * t).toFixed(3);
        el.style.filter = smear ? `blur(${smear.toFixed(2)}px)` : '';
      });

      // case titles glide in from the opposite side and settle flush with their edge
      drifts.forEach((el) => {
        if (!near.has(el)) return;
        const r = el.getBoundingClientRect();
        const k = 1 - easeOut(clamp((vh - r.top) / (vh * 0.75)));
        el.style.transform = `translate3d(${(-(+el.dataset.drift) * k * 12).toFixed(2)}vw, 0, 0)`;
      });

      // service cards fold up from their bottom edge, one after another
      folds.forEach((el, i) => {
        if (!near.has(el)) return;
        const r = el.getBoundingClientRect();
        const t = easeOut(clamp((vh - r.top) / (vh * 0.42) - (i % 4) * 0.12));
        el.style.transform = `rotateX(${((1 - t) * -60).toFixed(2)}deg) translate3d(0, ${((1 - t) * 50).toFixed(1)}px, 0)`;
        el.style.opacity = t.toFixed(3);
      });

      // light sections arrive as a rounded sheet that widens to full bleed
      sheets.forEach((el) => {
        if (!near.has(el)) return;
        const r = el.getBoundingClientRect();
        const k = 1 - easeOut(clamp((vh - r.top) / vh));
        el.style.setProperty('--sx', `${(k * Math.min(window.innerWidth * 0.06, 80)).toFixed(1)}px`);
        el.style.setProperty('--sr', `${(k * 48).toFixed(1)}px`);
      });

      if (zoom && near.has(zoom)) updateZoom(vh);

      // image parallax inside frames
      parallax.forEach((el) => {
        if (!near.has(el)) return;
        const r = el.getBoundingClientRect();
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        const img = el.querySelector('img');
        if (img) img.style.setProperty('--py', `${(p * -28).toFixed(2)}px`);
      });

      // poster: layered depth parallax
      posters.forEach((el) => {
        if (!near.has(el)) return;
        const r = el.getBoundingClientRect();
        const p = clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
        el.style.setProperty('--pp', p.toFixed(3));
      });

      // footer word rises into place
      if (footWord && near.has(footWord)) {
        const r = footWord.getBoundingClientRect();
        const t = easeOut(clamp((vh - r.top) / (r.height * 1.6)));
        footWord.style.setProperty('--fw', t.toFixed(3));
      }

      if (show && near.has(show)) updateShow(vh);
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
  if (stack && finePointer && !reduced) {
    const depth = [18, -26, 34];
    setTimeout(() => cards.forEach((c) => c.classList.add('is-live')), 2600);
    window.addEventListener('pointermove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      cards.forEach((c, i) => {
        c.style.setProperty('--x', `${(x * depth[i]).toFixed(1)}px`);
        c.style.setProperty('--y', `${(y * depth[i]).toFixed(1)}px`);
        c.style.setProperty('--prx', `${(-y * 10).toFixed(2)}deg`);
        c.style.setProperty('--pry', `${(x * 14).toFixed(2)}deg`);
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

  /* ---------- 3D tilt on the portrait ---------- */
  const photo = $('[data-photo]');
  if (photo && finePointer && !reduced) {
    photo.addEventListener('pointermove', (e) => {
      const r = photo.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5;
      photo.style.setProperty('--tx', `${(-y * 10).toFixed(2)}deg`);
      photo.style.setProperty('--ty', `${(x * 12).toFixed(2)}deg`);
      photo.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
      photo.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    photo.addEventListener('pointerleave', () => { photo.style.setProperty('--tx', '0deg'); photo.style.setProperty('--ty', '0deg'); });
  }

  /* ---------- pointer label over media ("View", "Open", "Code") ---------- */
  const cursor = $('[data-cursor]');
  if (cursor && finePointer) {
    const label = $('[data-cursor-label]', cursor);
    let tx = -200, ty = -200, cx = -200, cy = -200, running = false, on = false;
    const loop = () => {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (on || Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5) requestAnimationFrame(loop); else running = false;
    };
    const start = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
    window.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; if (on) start(); }, { passive: true });
    $$('[data-cursor-text]').forEach((el) => {
      el.addEventListener('pointerenter', (e) => {
        if (!on) { cx = tx = e.clientX; cy = ty = e.clientY; }
        label.textContent = el.dataset.cursorText;
        cursor.classList.toggle('is-hv', !!el.closest('.now'));
        on = true; cursor.classList.add('is-on'); start();
      });
      el.addEventListener('pointerleave', () => { on = false; cursor.classList.remove('is-on'); });
    });
    // a hidden slide can end up under a stationary pointer as the coverflow turns
    window.addEventListener('scroll', () => { if (on && !document.querySelector('[data-cursor-text]:hover')) { on = false; cursor.classList.remove('is-on'); } }, { passive: true });
  }

  /* ---------- nav labels scramble on hover ---------- */
  if (!reduced) {
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#/*+';
    $$('[data-scramble]').forEach((el) => {
      const final = el.textContent; let raf = 0;
      el.addEventListener('pointerenter', () => {
        cancelAnimationFrame(raf);
        if (!el.style.minWidth) { el.style.display = 'inline-block'; el.style.minWidth = el.offsetWidth + 'px'; el.style.textAlign = 'center'; }
        const t0 = performance.now();
        const step = (t) => {
          const p = clamp((t - t0) / 420);
          const keep = Math.floor(p * final.length);
          el.textContent = final.split('').map((c, i) => (i < keep || c === ' ' ? c : glyphs[(Math.random() * glyphs.length) | 0])).join('');
          if (p < 1) raf = requestAnimationFrame(step); else el.textContent = final;
        };
        raf = requestAnimationFrame(step);
      });
    });
  }

  /* ---------- copy email ---------- */
  $$('[data-copy]').forEach((btn) => {
    const label = $('[data-copy-label]', btn);
    btn.addEventListener('click', async () => {
      let ok = false;
      try { await navigator.clipboard.writeText(btn.dataset.copy); ok = true; } catch (e) {
        // fallback for browsers without the async clipboard API
        const ta = document.createElement('textarea'); ta.value = btn.dataset.copy; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        ta.remove();
      }
      label.textContent = ok ? 'Copied' : 'Copy failed';
      btn.classList.add('is-done');
      setTimeout(() => { label.textContent = 'Copy'; btn.classList.remove('is-done'); }, 2000);
    });
  });
})();
