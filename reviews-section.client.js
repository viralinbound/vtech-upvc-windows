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
  var form = $('.gr-form'), prog = $('.gr-prog i', form), steps = $$('.gr-step', form), back = $('.gr-back', form), sum = $('.gr-sum', form), st = $('.gr-st2', form);
  var ans = {}, cur = 1;
  function show(n) {
    cur = n;
    steps.forEach(function (s, i) {
      var on = i + 1 === n; s.hidden = !on; s.classList.toggle('is-on', on);
    });
    prog.style.setProperty('--p', (n / 3).toFixed(3));
    back.hidden = n === 1;
    sum.textContent = [ans.need, ans.qty].filter(Boolean).join(' · ');
  }
  $$('.gr-opt', form).forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-k');
      $$('.gr-opt[data-k="' + k + '"]', form).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      ans[k] = b.getAttribute('data-v');
      setTimeout(function () { show(cur + 1); var f = $('input', steps[cur - 1]); if (f && cur === 3) f.focus({ preventScroll: true }); }, rm ? 0 : 240);
    });
  });
  back.addEventListener('click', function () { show(Math.max(1, cur - 1)); });
  var rules = {
    name: function (v) { return v.trim().length < 2 ? 'Please enter your name.' : ''; },
    phone: function (v) { return v.replace(/\D/g, '').length < 10 ? 'Enter a valid phone number (at least 10 digits).' : ''; }
  };
  function check(el) {
    var m = rules[el.name](el.value), e = el.parentNode.querySelector('.gr-err');
    if (e) e.textContent = m; el.setAttribute('aria-invalid', !!m); return !m;
  }
  $$('input[name=name],input[name=phone]', form).forEach(function (el) { el.addEventListener('blur', function () { check(el); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = $$('input[name=name],input[name=phone]', form).filter(function (el) { return !check(el); });
    if (bad.length) { st.className = 'gr-st2 bad'; st.textContent = 'Please fix the highlighted fields.'; bad[0].focus(); return; }
    if (form.elements.website.value) return;
    var lines = ['Name: ' + form.elements.name.value.trim(), 'Phone: ' + form.elements.phone.value.trim(), 'Needs: ' + (ans.need || 'not chosen'), 'Number of openings: ' + (ans.qty || 'not chosen'), 'Source: Quick enquiry next to Google reviews'];
    location.href = 'mailto:vtechbuildingsystems@gmail.com?subject=' + encodeURIComponent('Call back request: ' + (ans.need || 'uPVC windows and doors')) + '&body=' + encodeURIComponent(lines.join('\n'));
    st.className = 'gr-st2 ok';
    st.innerHTML = 'Your email app should now open with these details. <b>It is not sent until you press Send there.</b> No email app? Call <a href="tel:+919740422863">+91 97404 22863</a>.';
  });

  /* share with family */
  var share = $('.gr-share'), shareS = $('.gr-share__s');
  share.addEventListener('click', function () {
    var data = { title: document.title, text: 'Have a look at these uPVC windows and doors from V-Tech, Bengaluru.', url: location.href.split('#')[0] };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    var done = function () { shareS.textContent = 'Link copied. Paste it in your family chat.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(data.url).then(done, function () { shareS.textContent = data.url; });
    else shareS.textContent = data.url;
  });

  buildDots(); show(1);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { measure(); sync(); });
  setTimeout(function () { measure(); sync(); }, 600);
})();
