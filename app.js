(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const CFG = window.VTECH;

const heroImg = $('.hero__img');

/* ---------- split headings into words ---------- */
$$('[data-split]').forEach((el) => {
  let i = 0;
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w"><span style="--i:${i++}">${w}</span></span>`).join(' ');
  el.setAttribute('aria-label', el.textContent);
});

/* ---------- scroll reveals ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('is-in');
  io.unobserve(e.target);
}), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
// .wipe is clip-path masked (zero visible area for IO), so observe its parent instead
const wipeIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  $$(':scope > .wipe', e.target).forEach((w) => w.classList.add('is-in'));
  wipeIO.unobserve(e.target);
}), { threshold: 0.12 });
if (reduce) $$('.reveal,.wipe,[data-split]').forEach((el) => el.classList.add('is-in'));
else {
  $$('.reveal,[data-split]').forEach((el) => io.observe(el));
  [...new Set($$('.wipe').map((w) => w.parentElement))].forEach((p) => wipeIO.observe(p));
}

/* ---------- count-up numbers ---------- */
const countIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  countIO.unobserve(e.target);
  const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = 1600;
  if (reduce) return;
  (function step(t) {
    const k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 4)));
    el.textContent = v; if (k < 1) requestAnimationFrame(step);
  })(t0);
}), { threshold: 0.6 });
$$('[data-count]').forEach((el) => countIO.observe(el));

/* ---------- header, progress bar, hero parallax, horizontal gallery ---------- */
const top = $('#top'), bar = $('.progress i'), heroMedia = $('.hero__media'), fab = $('.fab');
const hgal = $('.hgal'), track = $('.hgal__track'), hbar = $('.hgal__bar i');
let lastY = scrollY, ticking = false, mx = 0, my = 0;
function sizeGallery() {
  
  hgal.style.setProperty('--travel', Math.max(0, track.scrollWidth - innerWidth) + 'px');
}
function onScroll() {
  ticking = false;
  const y = scrollY, h = root.scrollHeight - innerHeight;
  bar.style.setProperty('--p', h > 0 ? (y / h).toFixed(4) : 0);
  top.classList.toggle('is-solid', y > 40);
  top.classList.toggle('is-hidden', y > lastY && y > innerHeight * 0.9);
  lastY = y;
  fab.classList.toggle('is-off', y < innerHeight * 0.6 || $('#enquiry').getBoundingClientRect().top < innerHeight);
  if (!reduce && y < innerHeight * 1.2) heroMedia.style.transform = `translate3d(${mx * -18}px, ${my * -12}px, 0)`;
  if (!reduce) {
    const r = hgal.getBoundingClientRect(), travel = hgal.offsetHeight - innerHeight;
    const k = Math.min(1, Math.max(0, -r.top / travel));
    track.style.transform = `translate3d(${-k * (track.scrollWidth - innerWidth)}px,0,0)`;
    hbar.style.setProperty('--hp', k.toFixed(4));
    $$('.hgal__img', track).forEach((el, i) => el.style.setProperty('--rot', ((k - 0.5) * (i % 2 ? 3 : -3)).toFixed(2) + 'deg'));
  }
}
const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
addEventListener('scroll', req, { passive: true });
addEventListener('resize', () => { sizeGallery(); req(); });
addEventListener('load', () => { sizeGallery(); req(); });
sizeGallery(); onScroll();
if (fine && !reduce) addEventListener('pointermove', (e) => { if (scrollY < innerHeight) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; req(); } }, { passive: true });

/* ---------- 3D tilt + glare + image depth on real photos ---------- */
if (fine && !reduce) $$('[data-tilt]').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
    el.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
    el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
    el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    el.style.setProperty('--mx', ((0.5 - x) * 14).toFixed(1) + 'px');
    el.style.setProperty('--my', ((0.5 - y) * 14).toFixed(1) + 'px');
  });
  el.addEventListener('pointerleave', () => ['--rx', '--ry', '--mx', '--my'].forEach((p) => el.style.removeProperty(p)));
});

/* ---------- magnetic buttons ---------- */
if (fine && !reduce) $$('[data-magnetic]').forEach((el) => {
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.22}px ${(e.clientY - r.top - r.height / 2) * 0.32}px`; });
  el.addEventListener('pointerleave', () => { el.style.translate = ''; });
});

/* ---------- custom cursor ---------- */
if (fine && !reduce) {
  root.classList.add('has-cursor');
  const cur = $('.cursor'); let cx = -100, cy = -100, tx = -100, ty = -100;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  addEventListener('pointerover', (e) => cur.classList.toggle('is-hover', !!e.target.closest('a,button,label,[data-tilt],input,select,textarea')));
  (function loop() { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); })();
}

/* ---------- sticky product nav: active state ---------- */
const links = $$('.pnav__link');
const pnavIn = $('.pnav__in');
const targets = [...links.map((l) => $(l.getAttribute('href'))), ...['map', 'gallery', 'about', 'clients', 'explorer', 'benefits', 'projects', 'faq', 'enquiry'].map((i) => document.getElementById(i))].filter(Boolean);
function setActive(id) {
  links.forEach((l) => { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
  const act = links.find((l) => l.getAttribute('href') === '#' + id);
  if (!act) return;
  act.classList.add('is-active'); act.setAttribute('aria-current', 'true');
  if (!act.classList.contains('pnav__label')) act.parentElement.querySelector('.pnav__label')?.classList.add('is-active');
  const box = act.getBoundingClientRect(), p = pnavIn.getBoundingClientRect();
  if (box.left < p.left + 20 || box.right > p.right - 20) pnavIn.scrollTo({ left: pnavIn.scrollLeft + box.left - p.left - p.width / 3, behavior: reduce ? 'auto' : 'smooth' });
}
const navIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: '-35% 0px -55% 0px' });
targets.forEach((t) => navIO.observe(t));

/* ---------- FAQ accordion ---------- */
$$('.faq__q').forEach((b) => b.addEventListener('click', () => {
  const open = b.getAttribute('aria-expanded') === 'true';
  b.setAttribute('aria-expanded', String(!open));
  b.closest('.faq__item').classList.toggle('open', !open);
}));

/* ---------- enquiry form ---------- */
const form = $('#qform'), fcat = $('#fcat'), ftype = $('#ftype'), fstatus = $('#fstatus'), fsubmit = $('#fsubmit');
fcat.innerHTML = '<option value="">Select category</option>' + CFG.groups.map((g) => `<option>${g.name}</option>`).join('') + '<option>Not sure yet</option>';
function fillTypes(sel) {
  const g = CFG.groups.find((x) => x.name === fcat.value);
  ftype.innerHTML = '<option value="">Not sure yet</option>' + (g ? g.types : CFG.groups.flatMap((x) => x.types)).map((t) => `<option>${t}</option>`).join('');
  if (sel) ftype.value = sel;
}
fillTypes();
fcat.addEventListener('change', () => fillTypes());
function prefill(cat, type) {
  if (cat) { fcat.value = cat; fillTypes(type); }
  if (window.__lenis) window.__lenis.scrollTo('#enquiry', { offset: -10 }); else document.getElementById('enquiry').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  setTimeout(() => $('#fname').focus({ preventScroll: true }), reduce ? 0 : 800);
}
$$('[data-enquire]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); prefill(a.dataset.category, a.dataset.type); history.replaceState(null, '', '#enquiry'); }));

const rules = {
  name: (v) => (v.trim().length < 2 ? 'Please enter your full name.' : ''),
  phone: (v) => (v.replace(/\D/g, '').length < 10 ? 'Enter a valid phone number (at least 10 digits).' : ''),
  email: (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address or leave it blank.' : ''),
  city: (v) => (v.trim().length < 2 ? 'Please enter your city or location.' : ''),
  category: (v) => (!v ? 'Please choose a product category.' : ''),
  consent: (_, el) => (!el.checked ? 'Please confirm consent so we can contact you.' : ''),
};
function check(el) {
  const rule = rules[el.name]; if (!rule) return true;
  const msg = rule(el.value, el);
  const err = el.closest('.f').querySelector('.err');
  if (err) err.textContent = msg;
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
}
$$('input,select,textarea', form).forEach((el) => el.addEventListener('blur', () => check(el)));
let busy = false;
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (busy) return;
  const bad = $$('input,select,textarea', form).filter((el) => rules[el.name]).filter((el) => !check(el));
  if (bad.length) { fstatus.className = 'form__status bad'; fstatus.textContent = 'Please fix the highlighted fields.'; bad[0].focus(); return; }
  const d = Object.fromEntries(new FormData(form));
  if (d.website) return; // honeypot
  busy = true; fsubmit.disabled = true; fsubmit.firstElementChild.textContent = 'Sending…';
  fstatus.className = 'form__status'; fstatus.textContent = '';
  const lines = [['Name', d.name], ['Phone', d.phone], ['Email', d.email], ['City / Location', d.city], ['Category', d.category], ['Window type', d.type], ['Colour', d.colour], ['Quantity', d.qty], ['Details', d.details]].filter(([, v]) => v && v.trim());
  const text = lines.map(([k, v]) => `${k}: ${v}`).join('\n');
  try {
    if (CFG.endpoint) {
      const res = await fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, source: 'upvc-landing' }) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      fstatus.className = 'form__status ok'; fstatus.textContent = 'Thank you. Your enquiry has been received and the VTech team will be in touch.';
      form.reset(); fillTypes();
    } else {
      // No server-side backend is configured: hand the enquiry to the user's email client. Nothing is sent until they press Send.
      location.href = `mailto:${CFG.email}?subject=${encodeURIComponent('uPVC enquiry: ' + (d.type || d.category))}&body=${encodeURIComponent(text)}`;
      fstatus.className = 'form__status ok';
      fstatus.innerHTML = 'Your email app should now open with this enquiry filled in. <strong>It is not sent until you press Send there.</strong> No email app? Call <a href="tel:+919740422863">+91 97404 22863</a> or email ' + CFG.email + '.';
    }
  } catch (err) {
    fstatus.className = 'form__status bad';
    fstatus.innerHTML = 'We could not send your enquiry. Please call <a href="tel:+919740422863">+91 97404 22863</a> or <a href="tel:+919980111468">+91 99801 11468</a>.';
  } finally {
    setTimeout(() => { busy = false; fsubmit.disabled = false; fsubmit.firstElementChild.textContent = 'Request a Quote'; }, 2500);
  }
});

/* ---------- product finder (real photos from vtechwindows.com) ---------- */
const exImg = $('#exImg');
let exProduct = CFG.products[0];
function exShow(animate) {
  const apply = () => {
    exImg.src = exProduct.photo; exImg.alt = exProduct.name;
    $('#exCap').textContent = 'Real image from vtechwindows.com, as used on VTech’s ' + exProduct.name + ' page.';
    $('#exName').textContent = exProduct.name;
    $('#exFeat').innerHTML = exProduct.features.slice(0, 4).map((f) => `<li>${f}</li>`).join('');
    $('#exLink').href = exProduct.url;
    requestAnimationFrame(() => exImg.classList.remove('swap'));
  };
  if (!animate || reduce) return apply();
  exImg.classList.add('swap'); setTimeout(apply, 260);
}
$$('input[name=xtype]').forEach((r) => r.addEventListener('change', () => { exProduct = CFG.products.find((p) => p.id === r.dataset.id); exShow(true); }));
$('#exQuote').addEventListener('click', (e) => { e.preventDefault(); prefill(exProduct.group, exProduct.name); history.replaceState(null, '', '#enquiry'); });
exShow(false);

/* =================== v3: extra motion =================== */
/* smooth scrolling (Lenis) — skipped for reduced motion and touch devices */
let lenis = null;
if (window.Lenis && !reduce && fine) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true }); window.__lenis = lenis;
  (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  const offset = () => -(document.querySelector('.pnav').offsetHeight + 8);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-enquire') || a.id === 'exQuote') return;
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    lenis.scrollTo(t, { offset: offset() });
    history.pushState(null, '', a.getAttribute('href'));
  });
  window.__lenis = lenis;
}

/* scramble text on kickers when they enter */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function scramble(el) {
  const text = el.dataset.text || (el.dataset.text = el.textContent);
  let f = 0; const total = 18;
  (function tick() {
    f++;
    el.textContent = text.split('').map((c, i) => (c === ' ' || i < (f / total) * text.length ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
    if (f < total) requestAnimationFrame(tick); else el.textContent = text;
  })();
}
if (!reduce) {
  const kIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { kIO.unobserve(e.target); scramble(e.target); } }), { threshold: 1 });
  $$('.kicker').filter((k) => !k.querySelector('b')).forEach((k) => kIO.observe(k));
}

/* footer letters */
const footBig = $('.foot__big');
if (reduce) footBig.classList.add('is-in'); else io.observe(footBig);

/* spotlight cards */
$$('.ben,.map__fam,.pcard,.stats li').forEach((el) => {
  el.setAttribute('data-spot', '');
  if (!fine || reduce) return;
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.setProperty('--sx', e.clientX - r.left + 'px'); el.style.setProperty('--sy', e.clientY - r.top + 'px'); });
});

/* scroll-highlight statement */
const hl = $('[data-highlight]');
if (hl) {
  const words = hl.textContent.trim().split(/\s+/);
  const hot = new Set(['timeless', 'first', 'choice,', 'environmentally', 'world-class', 'long', 'service', 'life.']);
  hl.innerHTML = words.map((w) => `<span class="hw${hot.has(w) ? ' hot' : ''}">${w}</span> `).join('');
}
const hws = hl ? $$('.hw', hl) : [];
const story = $('.story'), steps = $$('.story__steps li'), parts = $$('.story .part');
const zoom = $('.zoom'), zf = $('.zoom__frame'), zSticky = $('.zoom__sticky');
const mq = $('.marquee__t'), mqAnim = mq && mq.getAnimations ? mq.getAnimations()[0] : null;
let lastStep = -1, prevY = scrollY, vel = 0;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function fx() {
  fxTicking = false;
  const vh = innerHeight;
  // statement: colour words as the paragraph travels up the viewport
  if (hws.length) {
    const r = hl.getBoundingClientRect();
    const k = reduce ? 1 : clamp01((vh * 0.85 - r.top) / (r.height + vh * 0.35));
    const on = Math.round(k * hws.length);
    hws.forEach((w, i) => w.classList.toggle('on', i < on));
  }
  // pinned story: progress → active step + diagram parts
  if (story) {
    const r = story.getBoundingClientRect(), k = clamp01(-r.top / (story.offsetHeight - vh));
    const s = Math.min(steps.length - 1, Math.floor(k * steps.length * 0.999));
    if (s !== lastStep) {
      lastStep = s;
      steps.forEach((li, i) => li.classList.toggle('is-on', i === s));
      parts.forEach((p, i) => { p.classList.toggle('on', i <= s); p.classList.toggle('cur', i === s); });
    }
  }
  // zoom reveal: photo grows from a framed window to full screen
  if (zoom && !reduce) {
    const r = zoom.getBoundingClientRect(), k = clamp01(-r.top / (zoom.offsetHeight - vh));
    const e = 1 - Math.pow(1 - clamp01(k / 0.7), 3);
    zf.style.setProperty('--zi', (28 * (1 - e)).toFixed(2) + '%');
    zf.style.setProperty('--zj', (30 * (1 - e)).toFixed(2) + '%');
    zf.style.setProperty('--zr', (28 * (1 - e)).toFixed(1) + 'px');
    zf.style.setProperty('--zs', (1.35 - 0.35 * e).toFixed(3));
    zf.style.setProperty('--zo', clamp01((k - 0.45) / 0.3).toFixed(3));
    zSticky.style.setProperty('--zt', clamp01((k - 0.55) / 0.3).toFixed(3));
  }
  // marquee speeds up and skews with scroll velocity
  const y = scrollY; vel = vel * 0.8 + (y - prevY) * 0.2; prevY = y;
  if (mqAnim && !reduce) {
    mqAnim.playbackRate = 1 + Math.min(6, Math.abs(vel) * 0.12);
    mq.style.transform = '';
    mq.parentElement.style.transform = `skewY(${(-1.4 - Math.max(-3, Math.min(3, vel * 0.05))).toFixed(2)}deg)`;
  }
}
let fxTicking = false;
const fxReq = () => { if (!fxTicking) { fxTicking = true; requestAnimationFrame(fx); } };
addEventListener('scroll', fxReq, { passive: true });
addEventListener('resize', fxReq);
if (reduce) { steps.forEach((li) => li.classList.add('is-on')); parts.forEach((p) => p.classList.add('on')); zSticky && zSticky.style.setProperty('--zt', 1); zf && zf.style.setProperty('--zi', '0%'); zf && zf.style.setProperty('--zj', '0%'); zf && zf.style.setProperty('--zs', 1); zf && zf.style.setProperty('--zo', 1); }
fx();

/* =================== v4: scroll-progress engine (drives motion across the whole page) =================== */
// [data-p]   → --p : 0 when the element enters at the bottom, 1 when it leaves at the top
// [data-pin] → --k : 0..1 progress through a tall pinned section
const pEls = $$('[data-p]'), pinEls = $$('[data-pin]');
function progress() {
  progTicking = false;
  const vh = innerHeight, desktop = !reduce;
  pEls.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    el.style.setProperty('--p', reduce ? 0.5 : Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))).toFixed(4));
  });
  pinEls.forEach((el) => {
    if (!desktop) { el.style.setProperty('--k', el.classList.contains('hero-pin') ? 0 : 1); return; }
    const r = el.getBoundingClientRect();
    if (r.bottom < -50 || r.top > vh + 50) return;
    el.style.setProperty('--k', Math.min(1, Math.max(0, -r.top / Math.max(1, el.offsetHeight - vh))).toFixed(4));
  });
}
let progTicking = false;
const progReq = () => { if (!progTicking) { progTicking = true; requestAnimationFrame(progress); } };
addEventListener('scroll', progReq, { passive: true });
addEventListener('resize', progReq);
progress();

/* =================== v5: product theatre (blinds transition + ripple) =================== */
const th = $('#showcase');
if (th) {
  const P = CFG.products, N = P.length;
  const slats = $$('#blinds i'), blinds = $('#blinds');
  const thName = $('#thName'), thNum = $('#thNum'), thFam = $('#thFam'), thFeat = $('#thFeat'), thLink = $('#thLink'), thBg = $('#thBg');
  const dots = $$('.th-dot'), disp = $('#vt-disp'), turb = $('#vt-turb');
  let cur = 0, busy = false, queued = null;
  window.__thShow = (i) => show(i);
  const splitChars = (el, text) => { el.innerHTML = text.split(' ').map((w) => `<span style="white-space:nowrap">${[...w].map((c) => `<span class="c">${c}</span>`).join('')}</span>`).join(' '); $$('.c', el).forEach((c, i) => c.style.setProperty('--i', i)); };
  splitChars(thName, P[0].name);
  // preload every product photo so the blinds never flip to an empty slat
  P.forEach((p) => { const im = new Image(); im.src = p.photo; });

  function ripple() {
    if (reduce || !disp) return;
    blinds.classList.add('ripple');
    const t0 = performance.now(), dur = 900;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur), s = Math.sin(k * Math.PI) * 38;
      disp.setAttribute('scale', s.toFixed(1));
      turb.setAttribute('baseFrequency', `${(0.012 + k * 0.01).toFixed(4)} ${(0.04 - k * 0.015).toFixed(4)}`);
      if (k < 1) requestAnimationFrame(step); else { disp.setAttribute('scale', 0); blinds.classList.remove('ripple'); }
    })(t0);
  }
  function show(i) {
    if (i === cur) return;
    if (busy) { queued = i; return; }
    busy = true;
    const p = P[i], dir = i > cur ? 1 : -1;
    const prev = cur;
    cur = i;
    th.dispatchEvent(new CustomEvent('th:change', { detail: { from: prev, to: i } }));
    dots.forEach((d, j) => d.classList.toggle('on', j === i));
    // counter roll
    thNum.classList.remove('up-in'); thNum.classList.add('up-out');
    setTimeout(() => { thNum.textContent = String(i + 1).padStart(2, '0'); thNum.classList.remove('up-out'); void thNum.offsetWidth; thNum.classList.add('up-in'); }, reduce ? 0 : 340);
    // name: letters leave, then new letters enter
    thName.classList.add('leave'); thBg.classList.add('out');
    setTimeout(() => {
      splitChars(thName, p.name);
      thName.classList.remove('leave'); thName.classList.add('enter');
      void thName.offsetWidth; thName.classList.remove('enter');
      thFam.textContent = p.group;
      thFeat.textContent = p.desc;
      thLink.href = '#' + p.id;
      thBg.textContent = p.name; thBg.classList.remove('out');
      blinds.setAttribute('aria-label', p.name + ', real image from vtechwindows.com');
    }, reduce ? 0 : 320);
    // blinds: each slat turns edge-on, swaps photo, turns back (staggered in scroll direction)
    ripple();
    slats.forEach((s, k) => {
      const order = dir > 0 ? k : slats.length - 1 - k, d = reduce ? 0 : order * 45;
      setTimeout(() => { s.classList.remove('back'); s.classList.add('turn'); }, d);
      setTimeout(() => { s.style.backgroundImage = `url('${p.photo}')`; s.classList.add('back'); s.classList.remove('turn'); }, d + (reduce ? 0 : 330));
    });
    setTimeout(() => { busy = false; if (queued !== null) { const q = queued; queued = null; show(q); } }, reduce ? 0 : slats.length * 45 + 520);
  }

  const desktopPin = () => innerWidth > 900 && !reduce;
  function thScroll() {
    if (!desktopPin()) return;
    const r = th.getBoundingClientRect(), span = th.offsetHeight - innerHeight;
    if (r.bottom < 0 || r.top > innerHeight) return;
    const k = Math.min(0.9999, Math.max(0, -r.top / span)), f = k * N, i = Math.floor(f);
    th.style.setProperty('--lk', (f - i).toFixed(4));
    if (window.__thScrub) window.__thScrub(i, f - i); else show(i);
  }
  addEventListener('scroll', () => requestAnimationFrame(thScroll), { passive: true });
  dots.forEach((d) => d.addEventListener('click', () => {
    const i = +d.dataset.i;
    if (!desktopPin()) { show(i); return; }
    const y = th.getBoundingClientRect().top + scrollY + ((i + 0.5) / N) * (th.offsetHeight - innerHeight);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: 'smooth' });
  }));
  // touch / small screens: no pin — auto-advance while visible
  let auto = null;
  new IntersectionObserver(([e]) => {
    clearInterval(auto);
    if (e.isIntersecting && !desktopPin() && !reduce) auto = setInterval(() => show((cur + 1) % N), 3600);
  }, { threshold: 0.4 }).observe(th);
}

/* =================== v5: hover-reveal index (floating photo follows the cursor) =================== */
const fl = $('.idx__float'), flImg = fl && $('img', fl);
if (fl && fine && !reduce) {
  let fx2 = 0, fy2 = 0, tx2 = 0, ty2 = 0, on = false, raf = 0;
  const loop = () => {
    const dx = tx2 - fx2; fx2 += dx * 0.14; fy2 += (ty2 - fy2) * 0.14;
    fl.style.transform = `translate3d(${fx2 - 150}px, ${fy2 - 122}px, 0) rotate(${Math.max(-14, Math.min(14, dx * 0.08)).toFixed(2)}deg)`;
    raf = on || Math.abs(dx) > 0.5 ? requestAnimationFrame(loop) : 0;
  };
  $$('.idx a').forEach((a) => {
    a.addEventListener('pointerenter', (e) => { flImg.src = a.dataset.img; if (!on) { fx2 = tx2 = e.clientX; fy2 = ty2 = e.clientY; } on = true; fl.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop); });
    a.addEventListener('pointermove', (e) => { tx2 = e.clientX; ty2 = e.clientY; });
  });
  $('.idx').addEventListener('pointerleave', () => { on = false; fl.classList.remove('on'); });
}

/* =================== v6: WebGL liquid morph showcase =================== */
(() => {
  const th = $('#showcase'); if (!th) return;
  const P = CFG.products, N = P.length;
  const canvas = $('.th-gl', th), stage = $('.theatre__stage', th);
  const stack1 = $('.stack__c--1', th), stack2 = $('.stack__c--2', th);
  const chipsBox = $('.chips', th), thName = $('#thName');
  const desktopPin = () => innerWidth > 900 && !reduce;

  /* ---------- floating feature chips + card stack + glitch title ---------- */
  function updateExtras(i) {
    const p = P[i];
    chipsBox.classList.add('out');
    setTimeout(() => {
      chipsBox.innerHTML = p.features.slice(0, 3).map((f, k) => `<span class="chip chip--${k}"><i></i>${f}</span>`).join('');
      chipsBox.classList.remove('out');
    }, reduce ? 0 : 380);
    [stack1, stack2].forEach((el, k) => {
      el.classList.add('swap');
      setTimeout(() => { el.src = P[(i + k + 1) % N].photo; el.classList.remove('swap'); }, reduce ? 0 : 300 + k * 90);
    });
    if (!reduce) { thName.classList.remove('glitch'); void thName.offsetWidth; thName.classList.add('glitch'); }
  }
  th.addEventListener('th:change', (e) => updateExtras(e.detail.to));

  /* ---------- WebGL renderer ---------- */
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false });
  if (!gl) return;   // blinds fallback stays visible
  const VS = 'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
  const FS = `precision mediump float;varying vec2 v;
uniform sampler2D u0,u1;uniform float p,t,hov;uniform vec2 m;
float h(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 q){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(q);q*=2.03;a*=.5;}return s;}
vec3 tex(sampler2D s,vec2 uv,float r){return vec3(texture2D(s,uv+vec2(r,0.)).r,texture2D(s,uv).g,texture2D(s,uv-vec2(r,0.)).b);}
void main(){
  vec2 uv=v;
  vec2 d=uv-m;float dist=length(d);
  uv+=normalize(d+1e-5)*sin(dist*38.-t*5.)*.0045*hov*smoothstep(.32,0.,dist);
  uv+=vec2(sin(uv.y*6.+t*.6),cos(uv.x*5.+t*.5))*.0016;
  float nz=fbm(uv*3.2+vec2(t*.04,-t*.03));
  float w=.22;float edge=uv.x*.75+nz*.55+uv.y*.08;
  float th=p*(1.38+w)-w;
  float mk=smoothstep(th,th+w,edge);
  float tr=sin(p*3.14159);
  vec2 off=vec2((nz-.5)*.32*tr,(nz-.5)*.06*tr);
  vec2 a=uv+off*(1.-mk)+vec2(p*.06,0.);a=(a-.5)*(1.-p*.12)+.5;
  vec2 b=uv-off*mk-vec2((1.-p)*.06,0.);b=(b-.5)*(1.-(1.-p)*.18)+.5;
  float rgb=.016*tr+.0015*hov;
  vec3 c=mix(tex(u1,b,rgb),tex(u0,a,rgb),mk);
  float seam=smoothstep(w*.55,0.,abs(edge-(th+w*.5)))*tr;
  c+=vec3(1.,.18,.12)*seam*1.6+vec3(1.,.82,.45)*pow(seam,3.)*1.4;
  c*=1.-.28*length(v-.5);
  c+=vec3(.06,.01,.01)*(1.-mk)*tr;
  gl_FragColor=vec4(c,1.);
}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  let prog;
  try { prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link'); }
  catch (err) { console.warn('VTech showcase: WebGL unavailable, using blinds', err); return; }
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const uP = U('p'), uT = U('t'), uM = U('m'), uH = U('hov');
  gl.uniform1i(U('u0'), 0); gl.uniform1i(U('u1'), 1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const texs = P.map(() => null);
  let loaded = 0;
  P.forEach((p, i) => {
    const img = new Image();
    img.onload = () => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      texs[i] = t; loaded++;
      if (i === 0) { th.classList.add('has-gl'); dirty = true; }
    };
    img.src = p.photo;
  });

  // state: pair (a → b) and mix p
  let A = 0, B = 1, mix = 0, mouse = [0.5, 0.5], hov = 0, hovT = 0, dirty = true, visible = false, anim = null;
  function size() {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); dirty = true; }
  }
  function draw(now) {
    if (!texs[A]) return;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texs[A]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texs[B] || texs[A]);
    gl.uniform1f(uP, texs[B] ? mix : 0); gl.uniform1f(uT, now / 1000); gl.uniform2f(uM, mouse[0], mouse[1]); gl.uniform1f(uH, hov);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  (function loop(now) {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    hov += (hovT - hov) * 0.08;
    if (anim) { const k = Math.min(1, (now - anim.t0) / anim.dur); mix = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; if (k >= 1) { A = anim.to; B = (anim.to + 1) % N; mix = 0; anim = null; } }
    size(); draw(now);
  })(performance.now());
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '100px' }).observe(th);
  stage.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); mouse = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; hovT = 1; });
  stage.addEventListener('pointerleave', () => { hovT = 0; });

  /* scroll-scrubbed morph on desktop: each product holds, then melts into the next */
  window.__thScrub = (i, lk) => {
    if (anim) anim = null;
    const k = Math.min(1, Math.max(0, (lk - 0.5) / 0.42));
    A = i; B = Math.min(N - 1, i + 1);
    mix = i >= N - 1 ? 0 : k * k * (3 - 2 * k);
    window.__thShow(mix > 0.5 ? B : A);
  };
  /* timed morph for touch screens / dot taps when not scrubbing */
  th.addEventListener('th:change', (e) => {
    if (desktopPin()) return;
    const { from, to } = e.detail;
    A = from; B = to; mix = 0; anim = { t0: performance.now(), dur: reduce ? 1 : 1400, to };
  });
})();

/* =================== v6: dust particles in the showcase =================== */
(() => {
  const c = $('.th-dust'); if (!c || reduce) return;
  const x = c.getContext('2d'), th = $('#showcase');
  let W = 0, H = 0, vis = false, mx = 0, my = 0;
  const parts = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + .4, s: Math.random() * .25 + .05, a: Math.random() * Math.PI * 2, gold: Math.random() > .5 }));
  const fit = () => { const r = c.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = c.width = r.width * d; H = c.height = r.height * d; };
  addEventListener('resize', fit); fit();
  th.addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(th);
  (function loop(t) {
    requestAnimationFrame(loop);
    if (!vis || document.hidden) return;
    if (!W) fit();
    x.clearRect(0, 0, W, H);
    parts.forEach((p) => {
      p.y -= p.s / 1000; p.a += .01; if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); }
      const px = (p.x + Math.sin(p.a) * .01 + mx * p.r * .01) * W, py = (p.y + my * p.r * .01) * H, r = p.r * (W / 1400 + .6);
      const g = x.createRadialGradient(px, py, 0, px, py, r * 6);
      g.addColorStop(0, p.gold ? 'rgba(232,196,120,.9)' : 'rgba(255,90,80,.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r * 6, 0, Math.PI * 2); x.fill();
    });
  })(0);
})();

/* =================== v7: stacking product cards + cursor label =================== */
(() => {
  const groups = $$('.pgroup');
  const pnavH = () => $('.pnav').offsetHeight;
  function layout() {
    if (reduce) { $$('.prod').forEach((c) => { c.style.removeProperty('--stick'); c.style.removeProperty('--cover'); }); return; }
    const vh = innerHeight, top = pnavH();
    // tall cards stick when their bottom reaches the viewport bottom, so nothing is ever hidden
    $$('.prod').forEach((c) => c.style.setProperty('--stick', Math.min(top, vh - c.offsetHeight) + 'px'));
  }
  function cover() {
    if (reduce) return;
    const vh = innerHeight;
    groups.forEach((g) => {
      const cards = $$(':scope > .prod', g);
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        if (!next) { c.style.setProperty('--cover', 0); return; }
        const stick = parseFloat(c.style.getPropertyValue('--stick')) || 0;
        const nt = next.getBoundingClientRect().top;
        const k = Math.min(1, Math.max(0, (vh - nt) / (vh - stick)));
        c.style.setProperty('--cover', k.toFixed(3));
      });
    });
  }
  let t = false;
  addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(() => { t = false; cover(); }); } }, { passive: true });
  addEventListener('resize', () => { layout(); cover(); });
  addEventListener('load', () => { layout(); cover(); });
  layout(); cover();

  // red "VIEW" cursor over product photos
  const cur = $('.cursor');
  if (cur && fine && !reduce) {
    const label = $('span', cur);
    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest('[data-cursor]');
      cur.classList.toggle('is-label', !!el);
      label.textContent = el ? el.dataset.cursor : '';
    });
  }
})();

/* =================== v10: footer V-TECH follows the scroll =================== */
(() => {
  const foot = $('.foot'), big = $('.foot__big'), enq = $('#enquiry');
  if (!foot || !big || !enq) return;
  if (reduce) { foot.style.setProperty('--k', 1); big.style.setProperty('--k', 1); return; }
  let lastY = scrollY, vel = 0, raf = 0;
  function update() {
    raf = 0;
    const vh = innerHeight, doc = document.documentElement.scrollHeight;
    const start = enq.getBoundingClientRect().top + scrollY - vh * 0.4;   // begins while the enquiry section is on screen
    const end = Math.max(start + 1, doc - vh);                             // completes at the very bottom
    const k = Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
    const dy = scrollY - lastY; lastY = scrollY;
    vel = vel * 0.82 + Math.max(-1, Math.min(1, dy / 60)) * 0.18;
    foot.style.setProperty('--k', k.toFixed(4));
    big.style.setProperty('--k', k.toFixed(4));
    big.style.setProperty('--v', vel.toFixed(3));
    if (Math.abs(vel) > 0.002) raf = requestAnimationFrame(update);   // let the speed effect settle back to zero
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  update();
})();
})();
