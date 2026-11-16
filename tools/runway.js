(() => {
'use strict';
const CATALOG = /*__CATALOG__*/null;

/* ================= styling bag ================= */
const Bag = (() => {
  const KEY = 'runway-styling-bag-v3', HOST = 'nike-makknzjs.myshopify.com';
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const $ = (id) => document.getElementById(id);
  let catalog = null, byVariant = null, toastTimer = 0;

  const load = () => {
    if (catalog) return catalog;
    const c = CATALOG;
    if (!c || typeof c !== 'object') throw new Error('The product list could not load.');
    const ok = Array.isArray(c.items) && c.items.every((it) => it && typeof it.id === 'string' && typeof it.name === 'string' &&
      Number.isFinite(it.price) && it.price >= 0 && Array.isArray(it.variants) &&
      it.variants.every((v) => v && Number.isSafeInteger(v.id) && typeof v.a === 'boolean' && Array.isArray(v.o) && v.o.every((s) => typeof s === 'string')));
    if (!ok) throw new Error('The product list is unavailable.');
    byVariant = new Map();
    c.items.forEach((it) => it.variants.forEach((v) => byVariant.set(v.id, { item: it, variant: v })));
    return (catalog = c);
  };
  const read = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter((e) => e && Number.isSafeInteger(e.id) && Number.isSafeInteger(e.quantity) && e.quantity >= 1 && e.quantity <= 20)
        .slice(0, 50).map((e) => ({ id: e.id, quantity: e.quantity }));
    } catch (e) { return []; }
  };
  const save = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} };
  const toast = (text) => {
    const el = $('bag-status'); if (!el) return;
    el.textContent = text; el.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('is-on'), 2500);
  };
  const el = (tag, props, kids) => { const n = Object.assign(document.createElement(tag), props || {}); (kids || []).forEach((k) => n.append(k)); return n; };

  const render = () => {
    const list = read();
    document.querySelectorAll('[data-cart-count]').forEach((n) => { n.textContent = String(list.reduce((s, e) => s + e.quantity, 0)); });
    const box = $('bag-items'), total = $('bag-total'), exp = $('export-bag');
    if (!box) return;
    load();
    const rows = list.map((e) => ({ e, m: byVariant.get(e.id) })).filter((r) => r.m);
    box.replaceChildren();
    if (!rows.length) {
      box.append(el('p', { className: 'bag-note', textContent: 'Your styling bag is empty. Choose a size beside a piece to save it.' }));
      total.textContent = ''; exp.disabled = true; return;
    }
    let sum = 0;
    rows.forEach(({ e, m }) => {
      const url = new URL(m.item.url);
      if (url.hostname !== HOST) throw new Error('The product list is unavailable.');
      sum += m.item.price * e.quantity;
      const link = el('a', { href: url.href, target: '_blank', rel: 'noopener noreferrer', textContent: 'View original piece ↗' });
      const rm = el('button', { type: 'button', textContent: '×' });
      rm.setAttribute('aria-label', 'Remove ' + m.item.name);
      rm.addEventListener('click', () => { save(read().filter((x) => x.id !== e.id)); render(); });
      box.append(el('div', { className: 'bag-row' }, [
        el('img', { src: m.item.image, alt: m.item.name, width: 60, height: 80, loading: 'lazy' }),
        el('div', null, [
          el('h3', { textContent: m.item.name }),
          el('p', { textContent: 'Size ' + m.variant.o.join(' / ') + ' · Quantity ' + e.quantity + ' · ' + money.format(m.item.price) }),
          link
        ]),
        rm
      ]));
    });
    total.textContent = 'Reference subtotal ' + money.format(sum);
    exp.disabled = false;
  };

  const add = (items) => Promise.resolve().then(() => {
    load();
    const list = read();
    items.forEach((it) => {
      const m = byVariant.get(Number(it.id));
      if (!m || !m.variant.a) throw new Error('Please choose an available size.');
    });
    items.forEach((it) => {
      const id = Number(it.id), hit = list.find((x) => x.id === id);
      if (hit) hit.quantity = Math.min(20, hit.quantity + 1); else list.push({ id, quantity: 1 });
    });
    save(list); render();
    toast(items.length === 1 ? 'Piece saved to your styling bag' : 'Look saved to your styling bag');
  });

  const exportText = () => {
    load();
    const parts = ['RUNWAY — STYLING SHORTLIST', 'Reference prices; no order or payment has been placed.', ''];
    read().forEach((e) => { const m = byVariant.get(e.id); if (m) parts.push(m.item.name + ' · Size ' + m.variant.o.join(' / ') + ' · Quantity ' + e.quantity + '\n' + m.item.url); });
    const url = URL.createObjectURL(new Blob([parts.join('\n\n')], { type: 'text/plain;charset=utf-8' }));
    const a = el('a', { href: url, download: 'runway-outfit-shortlist.txt' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const init = () => {
    const dlg = $('bag-dialog');
    try { render(); } catch (e) {}
    const open = $('open-bag');
    if (open && dlg) open.addEventListener('click', () => { try { render(); } catch (e) { toast(e.message); return; } if (!dlg.open) dlg.showModal(); });
    if ($('close-bag')) $('close-bag').addEventListener('click', () => dlg.close());
    if ($('export-bag')) $('export-bag').addEventListener('click', exportText);
    if (dlg) dlg.addEventListener('click', (e) => {
      if (e.target !== dlg) return;
      const r = dlg.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
    });
  };
  return { add, init };
})();

/* ================= runway section ================= */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mod = (v, m) => ((v % m) + m) % m;
const TAU = Math.PI * 2;
const HOST_VARS = ['--rw-panel', '--rw-text', '--rw-muted', '--rw-line', '--rw-accent', '--rw-on-accent', '--rw-btn-bg', '--rw-btn-fg', '--rw-btn-radius', '--rw-pill-radius', '--rw-bar-r', '--rw-thumb-radius', '--rw-pt-size', '--rw-price', '--rw-opt', '--rw-ease', '--rw-ease-sheet', '--rw-ease-spring'];

class RunwaySection extends HTMLElement {
  connectedCallback() { if (this._on) return; this._on = true; this.init(); }
  disconnectedCallback() { if (!this._on) return; this._on = false; this.destroy(); }

  init() {
    const q = (s) => this.querySelector(s), qa = (s) => Array.from(this.querySelectorAll(s));
    this.stage = q('[data-rw-stage]'); this.actors = q('[data-rw-actors]');
    this.heroes = qa('[data-rw-hero]'); this.ticks = qa('[data-rw-tick]'); this.panels = qa('[data-rw-panel]');
    this.live = q('[data-rw-live]'); this.pieces = q('[data-rw-pieces]'); this.panel = q('.rw__panel');
    this.lb = q('[data-rw-lb]'); this.lbStage = q('[data-rw-lb-stage]'); this.autoBtn = q('[data-rw-auto]');
    this.cursor = q('[data-rw-cursor]');
    const d = this.dataset;
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.mq = matchMedia('(max-width: 749px)');
    this.design = !!(window.Shopify && window.Shopify.designMode);
    if (this.design) this.classList.add('rw--design');
    this.useBlur = d.blur === 'true';
    this.speed = Math.max(1500, parseInt(d.speed, 10) || 5000);
    const feel = { soft: [60, .06], balanced: [95, .04], snappy: [150, .025] }[d.feel] || [95, .04];
    this.K = feel[0]; this.C = 2 * Math.sqrt(this.K); this.lag = feel[1];

    /* bodies */
    this.n = this.heroes.length;
    this.N = this.n * Math.ceil(8 / this.n);
    const originals = Array.from(this.actors.querySelectorAll('[data-rw-model]'));
    this.bodies = [];
    for (let a = 0; a < this.N; a++) {
      let el = originals[a];
      if (!el) {
        el = originals[a % this.n].cloneNode(true);
        el.setAttribute('data-rw-clone', '');
        el.querySelectorAll('img').forEach((im) => { im.loading = 'lazy'; im.classList.remove('is-decoded'); });
        this.actors.appendChild(el);
      }
      this.bodies.push({ el, hit: el.querySelector('.rw__hit'), a, look: a % this.n, w: 0, x: 0, g: 0, v: 0, goal: 0, from: 0, trip: false, blur: -1 });
    }
    this.start = this.reduce ? 0 : 1.15;
    this.index = -1; this.target = 0; this.cur = -this.start; this.vel = 0;
    this.still = false; this.visible = false; this.dragging = false; this.playing = false;
    this.engaged = false; this.panelHover = false; this.zoomed = false; this.raf = 0; this.last = 0;
    this.mobile = null; this.vh = 0; this.vw = 0; this.sheet = null; this.suppress = 0;
    this.W = 1; this.H = 1; this.unit = 120;

    /* cards */
    this.cards = qa('[data-rw-card]');
    this.cards.forEach((card) => {
      const picker = card.querySelector('[data-rw-picker]');
      card._picker = picker; if (picker) { picker._card = card; }
      try { card._variants = JSON.parse(picker.querySelector('[data-rw-variants]').textContent); } catch (e) { card._variants = []; }
      this.syncPicker(card, true);
    });

    this.decodeImages(this);
    this.probeFeet();
    this.bind();
    this.classList.add('rw--js');
    this.measure();
    this.setIndex(0, true);
    this.setupCursor();

    this.io = new IntersectionObserver((es) => { this.visible = es[es.length - 1].isIntersecting; if (this.visible) this.kick(); }, { threshold: 0 });
    this.io.observe(this);
    if (this.reduce) this.classList.add('is-revealed');
    else {
      this.io2 = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        this.io2.disconnect();
        requestAnimationFrame(() => requestAnimationFrame(() => this.classList.add('is-revealed')));
      }, { threshold: 0, rootMargin: '0px 0px -22% 0px' });
      this.io2.observe(this);
    }
    if (window.ResizeObserver) { this.ro = new ResizeObserver(() => this.measure()); this.ro.observe(this.stage); }
    if (d.autoplay === 'true' && !this.reduce && !this.design) this.play(true);
  }

  destroy() {
    cancelAnimationFrame(this.raf); cancelAnimationFrame(this.craf);
    clearTimeout(this.timer); clearTimeout(this.rsz); clearTimeout(this.lbTimer);
    [this.io, this.io2, this.ro].forEach((o) => o && o.disconnect());
    (this.offs || []).forEach((f) => f());
    this.dockAll();
    if (this.host) { this.host.remove(); this.host = null; }
  }

  on(t, ev, fn, opt) { t.addEventListener(ev, fn, opt); (this.offs = this.offs || []).push(() => t.removeEventListener(ev, fn, opt)); }

  decodeImages(root) {
    root.querySelectorAll('img[data-model-image]').forEach((im) => {
      const done = () => im.classList.add('is-decoded');
      const late = () => { if (im.complete && im.naturalWidth) done(); else im.addEventListener('load', done, { once: true }); };
      if (im.loading !== 'lazy' && im.decode) im.decode().then(done, late); else late();
    });
  }

  probeFeet() {
    this.heroes.forEach((hero, i) => {
      const src = hero.dataset.probe; if (!src) return;
      const im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = () => {
        try {
          const w = 48, h = Math.max(1, Math.round(w * im.naturalHeight / im.naturalWidth));
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          const ctx = c.getContext('2d'); ctx.drawImage(im, 0, 0, w, h);
          const px = ctx.getImageData(0, 0, w, h).data;
          let lastRow = -1;
          for (let y = h - 1; y >= 0 && lastRow < 0; y--) for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] > 40) { lastRow = y; break; }
          if (lastRow < 0) return;
          const f = clamp((h - 1 - lastRow) / h, 0, .4).toFixed(4);
          hero.style.setProperty('--rw-foot', f);
          this.bodies.forEach((b) => { if (b.look === i) b.el.style.setProperty('--rw-foot', f); });
        } catch (e) {}
      };
      im.onerror = () => {};
      im.src = src;
    });
  }

  /* ---------- measure ---------- */
  headerH() {
    let h = 0;
    document.querySelectorAll('.shopify-section-group-header-group, #shopify-section-header, #shopify-section-announcement-bar').forEach((el) => {
      if (el.contains(this)) return;
      const r = el.getBoundingClientRect();
      if (r.height > 0 && getComputedStyle(el).display !== 'none') h += r.height;
    });
    return h;
  }

  measure() {
    const d = this.dataset, mobile = this.mq.matches, first = this.mobile === null;
    if (mobile !== this.mobile) {
      this.mobile = mobile;
      this.mode = mobile ? (d.mstyle || 'classic') : (d.style || 'ring');
      this.ring = this.mode === 'ring';
      const s = first ? this.start : 0;
      this.target = Math.round(this.target); this.cur = this.target - s; this.vel = 0;
      this.bodies.forEach((b) => { b.goal = mod(b.a - this.target, this.N); b.x = b.g = b.goal + s; b.v = 0; b.trip = false; });
      if (!mobile) this.dockAll();
      if (!first) this.setIndex(this.index, true);
    }
    let frame;
    if (mobile) {
      const iw = window.innerWidth, ih = window.innerHeight;
      if (!this.vh || iw !== this.vw || Math.abs(ih - this.vh) >= 160) { this.vh = ih; this.vw = iw; }
      const pct = d.mheightMode === 'custom' ? clamp(parseFloat(d.mheightVh) || 100, 50, 120) : 100;
      frame = this.vh * pct / 100;
    } else {
      frame = Math.max(380, window.innerHeight - (d.fit === 'true' ? this.headerH() : 0));
    }
    this.style.setProperty('--rw-frame-h', Math.round(frame) + 'px');
    const r = this.stage.getBoundingClientRect();
    const W = this.W = Math.max(1, r.width), H = this.H = Math.max(1, r.height);
    const fs = this.fs = this.ring ? 1.08 : 1;
    let mh, hx, hy;
    if (this.ring) { mh = Math.max(200, Math.round((H - 34 - 18) / fs)); hx = .5 * W; hy = 34; this.unit = Math.max(mobile ? 90 : 120, .3 * W); }
    else {
      this.cl = mobile ? { ax: .3, ay: 22, sx: .32, sy: 22, sr: .76, ex: .55, d: 4 } : { ax: .4, ay: 36, sx: .125, sy: 58, sr: .76, ex: .38, d: 5 };
      mh = Math.max(200, Math.round(H - (mobile ? 24 : 36) - 18)); hx = this.cl.ax * W; hy = this.cl.ay;
      this.unit = Math.max(90, W * this.cl.sx * 1.6);
    }
    const st = this.stage.style;
    st.setProperty('--rw-fs', String(fs));
    st.setProperty('--rw-model-h', mh + 'px');
    st.setProperty('--rw-hx', hx.toFixed(1) + 'px');
    st.setProperty('--rw-hy', hy + 'px');
    this.style.setProperty('--rw-ax', (hx / W * 100).toFixed(2) + '%');
    this.bodies.forEach((b) => { b.w = b.el.offsetWidth || mh * .5625; });
    if (this.zoomed) this.sizeZoom();
    this.renderAll();
    this.kick();
  }

  /* ---------- placement ---------- */
  put(b, x, bottom, scale, op, blur, z) {
    const hw = b.w * scale / 2, st = b.el.style;
    if (x + hw < -4 || x - hw > this.W + 4) op = 0;
    st.transform = 'translate3d(' + x.toFixed(2) + 'px,' + (-bottom).toFixed(2) + 'px,0) translateX(-50%) scale(' + scale.toFixed(4) + ')';
    st.opacity = op.toFixed(3);
    st.zIndex = String(z);
    st.visibility = op < .01 ? 'hidden' : 'visible';
    st.pointerEvents = op < .5 ? 'none' : '';
    const bl = this.useBlur ? Math.round(blur * 10) / 10 : 0;
    if (bl !== b.blur) { b.blur = bl; st.filter = bl > .05 ? 'blur(' + bl + 'px)' : ''; }
  }

  renderAll() { if (this.ring) this.renderRing(); else this.renderClassic(); }

  renderRing() {
    const W = this.W, H = this.H, m = this.mobile, fs = this.fs;
    const cx = .5 * W, R = (m ? .72 : .62) * W, P = (m ? 1.9 : 1.65) * W, floor = H - 34, horizon = .36 * H, step = TAU / this.N;
    for (const b of this.bodies) {
      let phi = mod((b.a - this.cur) * step, TAU); if (phi > Math.PI) phi -= TAU;
      const z = R * (1 - Math.cos(phi)), persp = P / (P + z), sl = Math.abs(phi) / step;
      const scale = persp * (1 + (fs - 1) * clamp(1 - sl, 0, 1));
      const x = cx + R * Math.sin(phi) * persp;
      const feet = horizon + (floor - horizon) * persp;
      const blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
      let op = clamp((Math.cos(phi) + .55) / .3, 0, 1);
      if (this.still && sl < .02) op = 0;
      this.put(b, x, H - feet, scale, op, blur, Math.round(scale * 1000));
    }
  }

  renderClassic() {
    const W = this.W, c = this.cl;
    for (const b of this.bodies) {
      let k = b.x, e = -1;
      if (b.trip) {
        const span = Math.abs(b.goal - b.from) || 1, u = clamp(Math.abs(b.x - b.from) / span, 0, 1);
        if (b.goal > b.from) {
          const e0 = Math.max(0, -b.from);
          if (u < .5) e = e0 + (1.4 - e0) * 2 * u; else k = b.goal + 2 * (1 - u);
        } else {
          const e1 = Math.max(0, -b.goal);
          if (u < .5) k = b.from + 2 * u; else e = e1 + (1.4 - e1) * 2 * (1 - u);
        }
      } else if (k < 0) e = Math.min(-k, 1.4);
      if (e >= 0) {
        let op = Math.max(0, 1 - 1.05 * e);
        if (this.still && e < .02) op = 0;
        this.put(b, W * (c.ax - c.ex * e), c.ay - 22 * e, 1 + .14 * e, op, 4 * Math.min(e, 1), 1100);
      } else {
        let op = k <= c.d - 1 ? 1 - .13 * k : Math.max(0, (1 - .13 * (c.d - 1)) * (c.d - k));
        if (this.still && k < .02) op = 0;
        this.put(b, W * (c.ax + c.sx * k), c.ay + c.sy * k, Math.pow(c.sr, k), op, Math.min(.9 * k, 3.2), 1000 - Math.round(10 * k));
      }
    }
  }

  /* ---------- physics ---------- */
  stepRing(dt) {
    const h = dt / 3;
    for (let i = 0; i < 3; i++) { const acc = -this.K * (this.cur - this.target) - this.C * this.vel; this.vel += acc * h; this.cur += this.vel * h; }
    if (Math.abs(this.cur - this.target) <= .0005 && Math.abs(this.vel) <= .0005) { this.cur = this.target; this.vel = 0; return true; }
    return false;
  }

  goalOf(b) { const r = Math.round(this.target); return mod(b.a - r, this.N) + (r - this.target); }

  stepClassic(dt) {
    const h = dt / 3, N = this.N; let all = true;
    for (const b of this.bodies) {
      const goal = this.goalOf(b);
      if (Math.abs(goal - b.goal) > N / 2) { b.trip = true; b.from = b.x; }
      b.goal = goal;
      const tau = this.dragging ? .016 : b.trip ? .1 : .03 + this.lag * Math.min(Math.max(goal, 0), 4);
      b.g += (goal - b.g) * (1 - Math.exp(-dt / tau));
      for (let i = 0; i < 3; i++) { const acc = -this.K * (b.x - b.g) - this.C * b.v; b.v += acc * h; b.x += b.v * h; }
      if (b.trip && Math.abs(b.x - goal) < .02) b.trip = false;
      if (Math.abs(b.x - goal) <= .0006 && Math.abs(b.v) <= .0006) { b.x = b.g = goal; b.v = 0; } else all = false;
    }
    return all;
  }

  snap() {
    this.cur = this.target; this.vel = 0;
    this.bodies.forEach((b) => { b.goal = this.goalOf(b); b.x = b.g = b.goal; b.v = 0; b.trip = false; });
  }

  frame(t) {
    this.raf = 0;
    if (!this.visible || document.hidden) { this.last = 0; return; }
    const dt = this.last ? Math.min(.034, (t - this.last) / 1000) : 1 / 60; this.last = t;
    let settled;
    if (this.reduce) { this.snap(); settled = true; }
    else settled = this.ring ? this.stepRing(dt) : this.stepClassic(dt);
    if (settled && !this.dragging) { this.setStill(true); this.renderAll(); this.last = 0; return; }
    this.setStill(false); this.renderAll();
    this.raf = requestAnimationFrame((n) => this.frame(n));
  }
  kick() { if (!this.raf && this.visible && !document.hidden) this.raf = requestAnimationFrame((n) => this.frame(n)); }
  setStill(v) { if (v === this.still) return; this.still = v; this.classList.toggle('rw--still', v); }

  /* ---------- index ---------- */
  rank(b) {
    let k = mod(b.a - Math.round(this.target), this.N);
    if (this.ring && k > this.N / 2) k -= this.N;
    return k;
  }

  setIndex(i, silent) {
    const changed = i !== this.index, prev = this.index;
    this.index = i; this.kick();
    const lim = this.ring ? 2 : 3;
    this.bodies.forEach((b) => {
      const k = this.rank(b), on = k !== 0 && Math.abs(k) <= lim;
      if (b.hit) { b.hit.tabIndex = on ? 0 : -1; b.hit.setAttribute('aria-hidden', on ? 'false' : 'true'); }
      if (on) b.el.removeAttribute('aria-hidden'); else b.el.setAttribute('aria-hidden', 'true');
    });
    if (!changed) { this.restartBar(); return; }
    if (!silent) { this.closeZoom(); if (this.mobile) this.closeSheet(); }
    this.style.setProperty('--rw-progress', ((i + 1) / this.n).toFixed(3));
    this.heroes.forEach((hero, j) => {
      hero.classList.toggle('is-on', j === i);
      hero.classList.toggle('was', j === prev && j !== i);
      hero.setAttribute('aria-hidden', j === i ? 'false' : 'true');
      const z = hero.querySelector('[data-rw-zoom]'); if (z) z.tabIndex = j === i ? 0 : -1;
    });
    if (!silent && !this.reduce) { this.stage.classList.remove('is-sweep'); void this.stage.offsetWidth; this.stage.classList.add('is-sweep'); }
    if (!silent && this.live) this.live.textContent = this.heroes[i].dataset.label || '';
    this.ticks.forEach((t, j) => { t.setAttribute('aria-current', j === i ? 'true' : 'false'); t.classList.toggle('is-past', j < i); });
    this.panels.forEach((p, j) => { p.hidden = j !== i; });
    const panel = this.panels[i];
    if (panel && !silent) { this.panels.forEach((p) => p.classList.remove('is-in')); void panel.offsetWidth; panel.classList.add('is-in'); }
    if (panel && this.pieces) {
      const tpl = panel.querySelector('[data-rw-pieces-text]');
      this.pieces.textContent = tpl ? (tpl.content ? tpl.content.textContent : tpl.textContent).trim() : '';
      if (!silent) { this.pieces.classList.remove('is-swap'); void this.pieces.offsetWidth; this.pieces.classList.add('is-swap'); }
    }
    this.clearHot();
    this.restartBar();
  }

  moveTo(T) { this.target = T; this.setStill(false); this.setIndex(mod(T, this.n)); }
  next() { this.moveTo(Math.round(this.target) + 1); }
  prev() { this.moveTo(Math.round(this.target) - 1); }
  go(i) { let d = mod(i - this.index, this.n); if (d > this.n / 2) d -= this.n; this.moveTo(Math.round(this.target) + d); }

  /* ---------- autoplay ---------- */
  play(v) {
    this.playing = v;
    this.classList.toggle('is-playing', v);
    if (this.autoBtn) this.autoBtn.setAttribute('aria-pressed', v ? 'true' : 'false');
    this.restartBar();
  }
  restartBar() {
    clearTimeout(this.timer);
    this.ticks.forEach((t) => t.classList.remove('is-run'));
    if (!this.playing) return;
    const t = this.ticks[this.index];
    if (t) { void t.offsetWidth; t.classList.add('is-run'); }
    this.timer = setTimeout(() => {
      if (this.playing && this.visible && !this.dragging && !document.hidden && !this.panelHover && !this.zoomed && !this.engaged) this.next();
      else this.restartBar();
    }, this.speed);
  }
  engage() { this.engaged = true; if (this.playing) this.play(false); }

  /* ---------- hot linking ---------- */
  clearHot() { this.querySelectorAll('.is-hot').forEach((n) => n.classList.remove('is-hot')); }
  hot(n, scroll) {
    this.clearHot();
    const scope = this.zoomed ? this.lb : this.heroes[this.index];
    const pin = scope && scope.querySelector('[data-rw-pin="' + n + '"]');
    const card = this.panels[this.index] && this.panels[this.index].querySelector('[data-rw-card="' + n + '"]');
    if (pin) pin.classList.add('is-hot');
    if (card) { card.classList.add('is-hot'); if (scroll) this.reveal(card); }
  }
  reveal(card) {
    const list = card.closest('.rw__items'); if (!list) return;
    const behavior = this.reduce ? 'auto' : 'smooth';
    const cr = card.getBoundingClientRect(), lr = list.getBoundingClientRect();
    if (list.scrollWidth > list.clientWidth + 1) list.scrollTo({ left: list.scrollLeft + cr.left - lr.left - 20, behavior });
    else if (list.scrollHeight > list.clientHeight + 1) list.scrollTo({ top: card.offsetTop - list.offsetTop - 12, behavior });
    else if (cr.top < 0 || cr.bottom > window.innerHeight - 140) window.scrollBy({ top: cr.top - .3 * window.innerHeight, behavior });
  }

  /* ---------- popup ---------- */
  sizeZoom() {
    const wrap = this.lbStage.firstElementChild; if (!wrap) return;
    const r = this.lbStage.getBoundingClientRect();
    const h = Math.max(160, Math.min(r.height, r.width / .5625));
    wrap.style.setProperty('--rw-model-h', Math.round(h) + 'px');
    wrap.querySelectorAll('img').forEach((im) => { im.sizes = Math.round(h * .5625) + 'px'; });
  }
  zoomAt(wrap) {
    const src = this.heroes[this.index].querySelector('.rw__figure'), dst = wrap.querySelector('.rw__figure');
    if (!src || !dst) return '';
    const a = src.getBoundingClientRect(), b = dst.getBoundingClientRect();
    if (!b.height) return '';
    return 'translate3d(' + (a.left - b.left).toFixed(2) + 'px,' + (a.bottom - b.bottom).toFixed(2) + 'px,0) scale(' + (a.height / b.height).toFixed(4) + ')';
  }
  openZoom() {
    if (this.zoomed || !this.lb) return;
    this.engage(); this.clearHot();
    clearTimeout(this.lbTimer);
    const hero = this.heroes[this.index], i = this.index;
    const wrap = document.createElement('div'); wrap.className = 'rw__lb-model';
    const sh = hero.querySelector('.rw__shadow'), fig = hero.querySelector('.rw__figure');
    if (sh) wrap.appendChild(sh.cloneNode(true));
    wrap.appendChild(fig.cloneNode(true));
    wrap.querySelectorAll('[data-rw-zoom]').forEach((z) => z.remove());
    wrap.querySelectorAll('[data-rw-pin]').forEach((p) => { p.tabIndex = 0; p.classList.remove('is-hot'); });
    wrap.querySelectorAll('img').forEach((im) => { im.loading = 'eager'; });
    const foot = hero.style.getPropertyValue('--rw-foot'); if (foot) wrap.style.setProperty('--rw-foot', foot);
    this.lbStage.replaceChildren(wrap);
    this.decodeImages(wrap);
    this.sizeZoom();
    const kicker = this.lb.querySelector('[data-rw-lb-kicker]'), name = this.lb.querySelector('[data-rw-lb-name]');
    if (kicker) kicker.textContent = (this.lb.dataset.word || 'Look') + ' ' + String(i + 1).padStart(2, '0');
    if (name) name.textContent = hero.dataset.name || '';
    if (!this.reduce) {
      wrap.style.transformOrigin = '0 100%';
      wrap.style.transition = 'none';
      wrap.style.transform = this.zoomAt(wrap);
      void wrap.offsetWidth;
      wrap.style.transition = ''; wrap.style.transform = '';
    }
    this.zoomed = true;
    this.classList.add('rw--zoom');
    this.lb.setAttribute('aria-hidden', 'false');
    const close = this.lb.querySelector('[data-rw-zoom-close]');
    if (close) close.focus({ preventScroll: true });
  }
  closeZoom() {
    if (!this.zoomed) return;
    this.zoomed = false;
    const wrap = this.lbStage.firstElementChild;
    if (wrap && !this.reduce) wrap.style.transform = this.zoomAt(wrap) || '';
    const had = this.lb.contains(document.activeElement);
    this.classList.remove('rw--zoom');
    this.lb.setAttribute('aria-hidden', 'true');
    this.clearHot();
    clearTimeout(this.lbTimer);
    this.lbTimer = setTimeout(() => { if (!this.zoomed) this.lbStage.replaceChildren(); }, this.reduce ? 0 : 950);
    if (had) this.stage.focus({ preventScroll: true });
    this.restartBar();
  }

  /* ---------- pickers ---------- */
  syncPicker(card, initial) {
    const picker = card._picker; if (!picker) return;
    const vars = card._variants || [];
    const groups = Array.from(picker.querySelectorAll('.rw__opt'));
    const sel = groups.map((g) => { const c = g.querySelector('input:checked'); return c ? c.value : null; });
    const match = vars.find((v) => v.o.every((val, j) => val === sel[j]));
    groups.forEach((g, gi) => g.querySelectorAll('input').forEach((inp) => {
      const ok = vars.some((v) => v.a && v.o[gi] === inp.value && v.o.every((val, j) => j === gi || sel[j] == null || val === sel[j]));
      inp.closest('.rw__pill').classList.toggle('is-unavailable', !ok);
    }));
    const ok = !!(match && match.a);
    const btn = picker.querySelector('[data-rw-confirm]'), lab = picker.querySelector('[data-rw-confirm-label]');
    if (btn) btn.disabled = !ok;
    if (lab) lab.textContent = ok ? lab.dataset.add : (this.dataset.msgSoldout || 'Sold out');
    if (ok) card.dataset.selected = String(match.id); else delete card.dataset.selected;
    if (!initial) card.dataset.touched = '1';
  }

  ensureHost() {
    if (this.host) return this.host;
    const host = this.host = document.createElement('div'); host.className = 'rw-sheet-host';
    const scrim = document.createElement('button');
    scrim.type = 'button'; scrim.className = 'rw__pick-scrim'; scrim.tabIndex = -1;
    scrim.setAttribute('data-rw-pick-close', ''); scrim.setAttribute('aria-hidden', 'true');
    host.appendChild(scrim);
    host.addEventListener('click', (e) => this.onClick(e));
    host.addEventListener('change', (e) => this.onChange(e));
    host.addEventListener('keydown', (e) => this.onKey(e));
    document.body.appendChild(host);
    return host;
  }
  openPicker(card, focus) {
    const picker = card._picker; if (!picker || card.classList.contains('is-added')) return;
    if (this.mobile) {
      this.closeSheet();
      const host = this.ensureHost(), cs = getComputedStyle(this);
      HOST_VARS.forEach((v) => host.style.setProperty(v, cs.getPropertyValue(v)));
      host.style.fontFamily = cs.fontFamily; host.style.color = cs.color;
      host.appendChild(picker);
      this.sheet = card;
      this.classList.add('rw--picking');
      void host.offsetWidth; host.classList.add('is-open');
    }
    picker.hidden = false;
    card.classList.add('is-picking');
    const btn = card.querySelector('[data-rw-add]'); if (btn) btn.setAttribute('aria-expanded', 'true');
    if (focus !== false) { const c = picker.querySelector('input:checked') || picker.querySelector('input'); if (c) c.focus({ preventScroll: true }); }
    if (!this.mobile) this.reveal(card);
  }
  closePicker(card, focusBack) {
    const picker = card._picker; if (!picker) return;
    picker.hidden = true;
    if (picker.parentNode !== card) card.appendChild(picker);
    if (this.sheet === card) { this.sheet = null; this.classList.remove('rw--picking'); if (this.host) this.host.classList.remove('is-open'); }
    card.classList.remove('is-picking');
    const btn = card.querySelector('[data-rw-add]');
    if (btn) { if (btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false'); if (focusBack) btn.focus({ preventScroll: true }); }
  }
  closeSheet(focusBack) { if (this.sheet) { this.closePicker(this.sheet, focusBack); return true; } return false; }
  dockAll() {
    (this.cards || []).forEach((card) => { const p = card._picker; if (p && p.parentNode !== card) card.appendChild(p); });
    this.sheet = null; this.classList.remove('rw--picking');
    if (this.host) this.host.classList.remove('is-open');
  }

  /* ---------- add to bag ---------- */
  msg(panel, text) {
    const m = panel && panel.querySelector('[data-rw-msg]'); if (!m) return;
    m.textContent = ''; if (text) { void m.offsetWidth; m.textContent = text; }
  }
  markAdded(card) {
    card.classList.remove('is-loading'); card.classList.add('is-added');
    this.closePicker(card);
    const btn = card.querySelector('[data-rw-add]');
    if (btn) { btn.setAttribute('aria-label', btn.dataset.addedLabel || btn.getAttribute('aria-label')); btn.removeAttribute('aria-expanded'); }
    if (this.mobile && !this.reduce && navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
  }
  checkComplete(panel) {
    const cards = Array.from(panel.querySelectorAll('[data-rw-card]'));
    if (cards.length >= 2 && cards.every((c) => c.classList.contains('is-added'))) { panel.classList.add('is-complete'); this.msg(panel, ''); }
  }
  addOne(card) {
    if (card.classList.contains('is-added') || card.classList.contains('is-loading')) return;
    const panel = card.closest('[data-rw-panel]'), id = Number(card.dataset.selected);
    card.dataset.touched = '1';
    if (!id) return;
    this.msg(panel, '');
    card.classList.add('is-loading');
    Bag.add([{ id, quantity: 1 }]).then(() => { this.markAdded(card); this.checkComplete(panel); })
      .catch(() => { card.classList.remove('is-loading'); this.msg(panel, this.dataset.msgError || ''); });
  }
  addAll(panel) {
    const cta = panel.querySelector('[data-rw-all]');
    if (panel.classList.contains('is-complete') || (cta && cta.classList.contains('is-loading'))) return;
    this.msg(panel, '');
    const cards = Array.from(panel.querySelectorAll('[data-rw-card]')).filter((c) => !c.classList.contains('is-added') && !c.classList.contains('is-soldout'));
    const ready = cards.filter((c) => c.dataset.variantId || (c.dataset.touched && c.dataset.selected));
    const pending = cards.filter((c) => !ready.includes(c));
    const askPending = () => {
      if (!pending.length) return;
      (this.mobile ? pending.slice(0, 1) : pending).forEach((c, j) => { if (c._picker && c._picker.hidden) this.openPicker(c, j === 0); });
      this.reveal(pending[0]);
      this.msg(panel, (this.dataset.msgChoose || 'Pick a size for: [items]').replace('[items]', pending.map((c) => c.dataset.title).join(', ')));
    };
    if (!ready.length) { askPending(); return; }
    if (cta) cta.classList.add('is-loading');
    ready.forEach((c) => c.classList.add('is-loading'));
    Bag.add(ready.map((c) => ({ id: Number(c.dataset.variantId || c.dataset.selected), quantity: 1 })))
      .then(() => { ready.forEach((c) => this.markAdded(c)); if (cta) cta.classList.remove('is-loading'); this.checkComplete(panel); askPending(); })
      .catch(() => { ready.forEach((c) => c.classList.remove('is-loading')); if (cta) cta.classList.remove('is-loading'); this.msg(panel, this.dataset.msgError || ''); });
  }

  /* ---------- events ---------- */
  cardOf(node) { const p = node.closest('.rw__picker'); return (p && p._card) || node.closest('[data-rw-card]'); }

  onClick(e) {
    const t = e.target instanceof Element ? e.target : null; if (!t) return;
    let el;
    if ((el = t.closest('[data-rw-pick-close]'))) { const card = this.cardOf(el) || this.sheet; if (card) this.closePicker(card, true); return; }
    if (t.closest('[data-rw-zoom-close]')) { this.closeZoom(); return; }
    if (this.zoomed && (t === this.lb || t === this.lbStage)) { this.closeZoom(); return; }
    if (t.closest('[data-rw-zoom]')) { this.openZoom(); return; }
    if (t.closest('[data-rw-next]')) { this.next(); return; }
    if (t.closest('[data-rw-prev]')) { this.prev(); return; }
    if ((el = t.closest('[data-rw-tick]'))) { this.go(parseInt(el.dataset.rwTick, 10) || 0); return; }
    if (t.closest('[data-rw-auto]')) { if (!this.playing) this.engaged = false; this.play(!this.playing); return; }
    if ((el = t.closest('[data-rw-pin]'))) { this.engage(); this.hot(el.dataset.rwPin, true); return; }
    if ((el = t.closest('[data-rw-go]'))) {
      const body = this.bodies.find((b) => b.el.contains(el)); if (!body) return;
      const k = this.rank(body);
      if (k !== 0 && Math.abs(k) < this.N / 2) this.moveTo(Math.round(this.target) + k); else if (k === 0) this.openZoom();
      return;
    }
    if ((el = t.closest('[data-rw-confirm]'))) { const card = this.cardOf(el); if (card) this.addOne(card); return; }
    if ((el = t.closest('[data-rw-add]'))) {
      const card = this.cardOf(el); if (!card || card.classList.contains('is-added') || card.classList.contains('is-loading')) return;
      if (card.dataset.variantId) { card.dataset.selected = card.dataset.variantId; this.addOne(card); return; }
      if (card.classList.contains('is-picking')) this.closePicker(card); else this.openPicker(card);
      return;
    }
    if ((el = t.closest('[data-rw-all]'))) { const panel = el.closest('[data-rw-panel]'); if (panel) this.addAll(panel); }
  }
  onChange(e) {
    const t = e.target; if (!(t instanceof Element)) return;
    this.engage();
    if (t.matches('[data-rw-option]')) { const card = this.cardOf(t); if (card) this.syncPicker(card, false); }
  }
  onKey(e) {
    if (e.key === 'Escape') { if (!this.closeSheet(true)) this.closeZoom(); return; }
    if (e.target !== this.stage) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
  }

  bind() {
    const stage = this.stage;
    this.on(this, 'click', (e) => { if (performance.now() < this.suppress) { e.stopPropagation(); e.preventDefault(); } }, true);
    this.on(this, 'click', (e) => this.onClick(e));
    this.on(this, 'keydown', (e) => this.onKey(e));
    if (this.panel) {
      this.on(this.panel, 'click', (e) => { if (e.target.closest && e.target.closest('button,a,input,select,label')) this.engage(); }, true);
      this.on(this.panel, 'change', (e) => this.onChange(e));
      this.on(this.panel, 'pointerenter', (e) => { if (e.pointerType === 'mouse') this.panelHover = true; });
      this.on(this.panel, 'pointerleave', (e) => { if (e.pointerType === 'mouse') { this.panelHover = false; this.restartBar(); } });
      this.on(this.panel, 'pointerover', (e) => {
        if (e.pointerType !== 'mouse') return;
        const card = e.target.closest && e.target.closest('[data-rw-card]');
        if (card && !card.classList.contains('is-hot')) this.hot(card.dataset.rwCard);
      });
      this.on(this.panel, 'pointerout', (e) => {
        if (e.pointerType !== 'mouse') return;
        const card = e.target.closest && e.target.closest('[data-rw-card]');
        if (card && !(e.relatedTarget && card.contains(e.relatedTarget))) this.clearHot();
      });
    }

    /* drag */
    let p = null;
    const end = (e, cancel) => {
      if (!p) return; const s = p; p = null;
      if (!s.drag) return;
      this.dragging = false; this.classList.remove('is-dragging');
      try { stage.releasePointerCapture(s.id); } catch (er) {}
      this.suppress = performance.now() + 60;
      const dx = (e ? e.clientX : s.lx) - s.x0, a = s.samples[0], b = s.samples[s.samples.length - 1];
      const vx = b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0, sign = -1, from = Math.round(s.t);
      let i;
      if (cancel) i = from;
      else if (this.mobile) i = (Math.abs(dx) > 30 || Math.abs(vx) > .3) ? from + sign * (dx > 0 ? 1 : -1) : from;
      else {
        i = Math.round(this.target + sign * vx * 160 / this.unit);
        if (i === from && Math.abs(vx) > .3) i = from + sign * (vx > 0 ? 1 : -1);
        i = clamp(i, from - 2, from + 2);
      }
      this.moveTo(i);
    };
    this.on(stage, 'pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (this.zoomed) return;
      p = { id: e.pointerId, x0: e.clientX, y0: e.clientY, lx: e.clientX, t: this.target, drag: false, samples: [{ x: e.clientX, t: e.timeStamp }] };
    });
    this.on(stage, 'pointermove', (e) => {
      if (!p || e.pointerId !== p.id) return;
      if (e.pointerType === 'mouse' && e.buttons === 0) { end(e); return; }
      const dx = e.clientX - p.x0, dy = e.clientY - p.y0;
      p.lx = e.clientX;
      p.samples.push({ x: e.clientX, t: e.timeStamp }); if (p.samples.length > 6) p.samples.shift();
      if (!p.drag) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
          p.drag = true; this.dragging = true; this.classList.add('is-dragging');
          try { stage.setPointerCapture(p.id); } catch (er) {}
        } else if (Math.abs(dy) > 10) { p = null; return; }
        else return;
      }
      this.target = p.t - dx / this.unit;
      this.setStill(false); this.kick();
    });
    this.on(stage, 'pointerup', (e) => { if (p && e.pointerId === p.id) end(e); });
    this.on(stage, 'pointercancel', (e) => { if (p && e.pointerId === p.id) end(e, true); });
    this.on(stage, 'dragstart', (e) => e.preventDefault());

    /* trackpad */
    let acc = 0, lock = 0;
    this.on(stage, 'wheel', (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (this.zoomed || performance.now() < lock) return;
      acc += e.deltaX;
      if (Math.abs(acc) > 45) { if (acc > 0) this.next(); else this.prev(); acc = 0; lock = performance.now() + 520; }
    }, { passive: false });

    this.on(window, 'resize', () => { clearTimeout(this.rsz); this.rsz = setTimeout(() => this.measure(), 120); });
    this.on(document, 'visibilitychange', () => { if (!document.hidden) { this.last = 0; this.kick(); } });
    this.on(document, 'shopify:block:select', (e) => {
      const i = this.panels.findIndex((pn) => pn.contains(e.target)); if (i >= 0) { this.engage(); this.go(i); }
    });
  }

  setupCursor() {
    const cur = this.cursor; if (!cur) return;
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) { cur.remove(); this.cursor = null; return; }
    this.classList.add('rw--cursor');
    const stage = this.stage, k = this.reduce ? 1 : .18;
    let x = 0, y = 0, tx = 0, ty = 0;
    const draw = () => { cur.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; };
    const loop = () => {
      this.craf = 0;
      x += (tx - x) * k; y += (ty - y) * k;
      if (Math.abs(tx - x) + Math.abs(ty - y) < .2) { x = tx; y = ty; draw(); return; }
      draw(); this.craf = requestAnimationFrame(loop);
    };
    this.on(stage, 'pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = stage.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (!cur.classList.contains('is-on')) { x = tx; y = ty; draw(); cur.classList.add('is-on'); }
      const t = e.target instanceof Element ? e.target : null;
      cur.classList.toggle('is-view', !this.dragging && !!(t && t.closest('.rw__zoom')));
      cur.classList.toggle('is-link', !this.dragging && !!(t && t.closest('.rw__pin, .rw__hit')));
      if (!this.craf) this.craf = requestAnimationFrame(loop);
    });
    this.on(stage, 'pointerleave', () => cur.classList.remove('is-on', 'is-link', 'is-view'));
  }
}

Bag.init();
if (!customElements.get('runway-section')) customElements.define('runway-section', RunwaySection);
})();
