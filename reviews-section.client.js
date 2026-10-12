/* Google reviews section: carousel, filters, read-more, step-by-step quick enquiry, share. */
(function () {
  var root = document.getElementById('reviews');
  if (!root) return;
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fineHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var track = $('.gr__track'), cards = $$('.gr-card'), prev = $('.gr-nav--p'), next = $('.gr-nav--n');
  var dotsBox = $('.gr__dots'), count = $('.gr__count');
  cards.forEach(function (c, i) { c.style.setProperty('--i', i); });

  /* read more: only where the text is actually clamped */
  function measure() {
    $$('.gr-card:not(.gr-card--cta)').forEach(function (c) {
      var t = $('.gr-t', c), b = $('.gr-more', c);
      if (c.classList.contains('is-open')) { b.hidden = false; return; }
      b.hidden = !(t.scrollHeight > t.clientHeight + 2);
    });
  }
  $$('.gr-more').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = b.closest('.gr-card'), open = c.classList.toggle('is-open');
      b.textContent = open ? 'Show less' : 'Read more'; b.setAttribute('aria-expanded', open);
    });
  });

  /* carousel helpers */
  function vis() { return cards.filter(function (c) { return !c.hidden; }); }
  function step() { var v = vis(); return v.length > 1 ? v[1].offsetLeft - v[0].offsetLeft : 380; }
  function go(dir) {
    var max = track.scrollWidth - track.clientWidth;
    if (dir > 0 && track.scrollLeft >= max - 4) track.scrollTo({ left: 0, behavior: rm ? 'auto' : 'smooth' });
    else track.scrollBy({ left: dir * step(), behavior: rm ? 'auto' : 'smooth' });
  }
  prev.addEventListener('click', function () { go(-1); });
  next.addEventListener('click', function () { go(1); });
  track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });

  function buildDots() {
    var n = vis().length; dotsBox.innerHTML = '';
    for (var i = 0; i < n; i++) dotsBox.appendChild(document.createElement('i'));
  }
  function sync() {
    var v = vis(), s = step(), idx = Math.max(0, Math.min(v.length - 1, Math.round(track.scrollLeft / s)));
    $$('i', dotsBox).forEach(function (d, i) { d.classList.toggle('on', i === idx); });
    var reviewsShown = v.filter(function (c) { return !c.classList.contains('gr-card--cta'); }).length;
    count.textContent = (idx < reviewsShown ? (idx + 1) : reviewsShown) + ' of ' + reviewsShown + ' reviews';
    var max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 4; next.disabled = false;
    if (max < 4) { prev.disabled = true; next.disabled = true; }
  }
  var raf = 0;
  track.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; sync(); }); }, { passive: true });
  dotsBox.addEventListener('click', function (e) {
    var i = $$('i', dotsBox).indexOf(e.target); if (i < 0) return;
    track.scrollTo({ left: i * step(), behavior: rm ? 'auto' : 'smooth' });
  });
  addEventListener('resize', function () { measure(); sync(); });

  /* filters */
  $$('.gr-f').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.gr-f').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
      var f = b.getAttribute('data-f'), k = 0;
      cards.forEach(function (c) {
        var show = c.classList.contains('gr-card--cta') || f === 'all' || c.getAttribute('data-s') === f;
        c.hidden = !show; c.style.animation = 'none';
        if (show) { void c.offsetWidth; c.style.animation = ''; c.style.setProperty('--i', k++); }
      });
      track.scrollTo({ left: 0, behavior: 'auto' }); buildDots(); measure(); sync();
    });
  });

  /* mouse drag (touch uses native scrolling) */
  if (fineHover) {
    var down = false, sx = 0, sl = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.target.closest('a,button')) return;
      down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft;
    });
    addEventListener('pointermove', function (e) {
      if (!down) return; var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) { track.classList.add('is-drag'); track.scrollLeft = sl - dx; }
    });
    addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (track.classList.contains('is-drag')) {
        track.classList.remove('is-drag'); var s = step();
        track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: 'smooth' });
      }
    });
  }

  /* gentle autoplay: only while visible, never while hovered / focused / reduced motion */
  var inView = false, hold = false, timer = 0;
  new IntersectionObserver(function (e) { inView = e[0].isIntersecting; }, { threshold: 0.35 }).observe(track);
  ['mouseenter', 'focusin', 'touchstart', 'pointerdown'].forEach(function (ev) { root.addEventListener(ev, function () { hold = true; }, { passive: true }); });
  ['mouseleave', 'focusout'].forEach(function (ev) { root.addEventListener(ev, function () { hold = false; }); });
  if (!rm) timer = setInterval(function () { if (inView && !hold && !document.hidden) go(1); }, 5200);

  /* step-by-step quick enquiry */
  var form = $('.gr-form'), prog = $('.gr-prog i', form), steps = $$('.gr-step', form), stepLis = $$('.gr-steps li', form);
  var back = $('.gr-back', form), sumBox = $('.gr-sum', form), st = $('.gr-st2', form), done = $('.gr-done');
  var ans = {}, cur = 1, when = 'Any time';
  function chips() {
    sumBox.innerHTML = '';
    [['need', 1], ['qty', 2]].forEach(function (p) {
      if (!ans[p[0]]) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'gr-chip'; b.setAttribute('data-edit', p[1]);
      b.innerHTML = '<span></span><u>change</u>'; b.firstChild.textContent = (p[0] === 'qty' ? ans.qty + ' openings' : ans.need);
      sumBox.appendChild(b);
    });
  }
  function show(n, focus) {
    cur = n;
    steps.forEach(function (s, i) { var on = i + 1 === n; s.hidden = !on; s.classList.toggle('is-on', on); });
    stepLis.forEach(function (li, i) { li.classList.toggle('is-on', i + 1 === n); li.classList.toggle('is-done', i + 1 < n); });
    prog.style.setProperty('--p', (n / 3).toFixed(3));
    back.hidden = n === 1; chips();
    st.textContent = ''; st.className = 'gr-st2';
    if (focus !== false) { var f = $('input:not([tabindex="-1"]),.gr-opt', steps[n - 1]); if (f && n === 3) f.focus({ preventScroll: true }); }
  }
  $$('.gr-opt', form).forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-k');
      $$('.gr-opt[data-k="' + k + '"]', form).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop');
      ans[k] = b.getAttribute('data-v');
      setTimeout(function () { show(cur + 1); }, rm ? 0 : 260);
    });
    /* arrow keys move between options, number keys pick one */
    b.addEventListener('keydown', function (e) {
      var sib = $$('.gr-opt', b.parentNode), i = sib.indexOf(b);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); sib[(i + 1) % sib.length].focus(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); sib[(i - 1 + sib.length) % sib.length].focus(); }
      var n = parseInt(e.key, 10); if (n >= 1 && n <= sib.length) { e.preventDefault(); sib[n - 1].click(); }
    });
  });
  back.addEventListener('click', function () { show(Math.max(1, cur - 1)); });
  stepLis.forEach(function (li, i) { li.addEventListener('click', function () { if (i + 1 < cur) show(i + 1); }); });
  sumBox.addEventListener('click', function (e) { var c = e.target.closest('.gr-chip'); if (c) show(+c.getAttribute('data-edit')); });
  $$('.gr-time', form).forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.gr-time', form).forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
      when = b.getAttribute('data-v');
    });
  });
  var rules = {
    name: function (v) { return v.trim().length < 2 ? 'Please enter your name.' : ''; },
    phone: function (v) { return v.replace(/\D/g, '').length < 10 ? 'Enter a valid phone number (at least 10 digits).' : ''; }
  };
  function check(el, soft) {
    var m = rules[el.name](el.value), e = el.parentNode.querySelector('.gr-err');
    if (e) { e.className = 'gr-err' + (!m && el.value ? ' gr-ok' : ''); e.textContent = m ? (soft ? '' : m) : (el.value ? 'Looks good' : ''); }
    el.setAttribute('aria-invalid', !!m && !soft); el.classList.toggle('is-valid', !m); return !m;
  }
  var fields = $$('input[name=name],input[name=phone]', form);
  fields.forEach(function (el) {
    el.addEventListener('blur', function () {
      if (el.name === 'phone') { var d = el.value.replace(/\D/g, ''); if (d.length === 10) el.value = d.slice(0, 5) + ' ' + d.slice(5); }
      check(el);
    });
    el.addEventListener('input', function () { check(el, true); });
  });
  function mailto() {
    var lines = ['Name: ' + form.elements.name.value.trim(), 'Phone: ' + form.elements.phone.value.trim(), 'Needs: ' + (ans.need || 'not chosen'), 'Number of openings: ' + (ans.qty || 'not chosen'), 'Best time to call: ' + when, 'Source: Quick enquiry next to Google reviews'];
    return 'mailto:vtechbuildingsystems@gmail.com?subject=' + encodeURIComponent('Call back request: ' + (ans.need || 'uPVC windows and doors')) + '&body=' + encodeURIComponent(lines.join('\n'));
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = fields.filter(function (el) { return !check(el); });
    if (bad.length) { st.className = 'gr-st2 bad'; st.textContent = 'Please fix the highlighted fields.'; bad[0].focus(); return; }
    if (form.elements.website.value) return;
    location.href = mailto();
    form.hidden = true; done.hidden = false; done.focus({ preventScroll: true });
  });
  $('.gr-again', done).addEventListener('click', function () { location.href = mailto(); });
  $('.gr-reset', done).addEventListener('click', function () { ans = {}; when = 'Any time'; form.reset(); fields.forEach(function (f) { f.classList.remove('is-valid'); f.removeAttribute('aria-invalid'); var er = f.parentNode.querySelector('.gr-err'); if (er) er.textContent = ''; }); $$('.gr-opt', form).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); $$('.gr-time', form).forEach(function (x, i) { x.classList.toggle('is-on', i === 0); x.setAttribute('aria-pressed', i === 0); }); done.hidden = true; form.hidden = false; show(1, false); });

  /* "Full enquiry form": scroll to the real form, carry the name/phone over, focus the first empty field */
  function goForm(e) {
    var a = e.currentTarget, href = a.getAttribute('href'), t = href && href.charAt(0) === '#' ? document.querySelector(href) : null;
    if (!t) return;
    e.preventDefault(); e.stopPropagation();   // keep the page's own anchor handler from also scrolling
    var pinned = t.closest('.hero-pin'), hdr = document.querySelector('.hdr,.top'), off = (hdr ? hdr.offsetHeight : 72) + 24;
    var y = pinned ? 0 : Math.max(0, t.getBoundingClientRect().top + scrollY - off);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: rm ? 'auto' : 'smooth' });
    var target = t.querySelector('form') || t;
    var inputs = $$('input', target), nm = form.elements.name.value.trim(), ph = form.elements.phone.value.trim();
    var first = inputs.filter(function (i) { return i.name === 'first' || i.name === 'name'; })[0], phone = inputs.filter(function (i) { return i.name === 'phone'; })[0];
    function put(el, v) { if (el && v && !el.value) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } }
    put(first, nm); put(phone, ph);
    setTimeout(function () {
      var f = inputs.filter(function (i) { return i.type !== 'hidden' && !i.value && i.tabIndex >= 0 && (i.name === 'first' || i.name === 'name' || i.name === 'phone' || i.name === 'email'); })[0] || phone || first;
      if (f) f.focus({ preventScroll: true });
      target.style.transition = 'box-shadow .5s ease';
      target.classList.add('gr-flash');
      setTimeout(function () { target.classList.remove('gr-flash'); }, 1500);
    }, rm ? 80 : 1100);
  }
  $$('.gr-goform', document).forEach(function (a) { a.addEventListener('click', goForm); });

  /* share with family */
  var share = $('.gr-share'), shareS = $('.gr-share__s');
  share.addEventListener('click', function () {
    var data = { title: document.title, text: 'Have a look at these uPVC windows and doors from V-Tech, Bengaluru.', url: location.href.split('#')[0] };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    var ok = function () { shareS.textContent = 'Link copied. Paste it in your family chat.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(data.url).then(ok, function () { shareS.textContent = data.url; });
    else shareS.textContent = data.url;
  });

  buildDots(); show(1);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { measure(); sync(); });
  setTimeout(function () { measure(); sync(); }, 600);
})();
