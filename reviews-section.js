// Google reviews section (HTML). Reviews are the ones VTech itself shows on vtechwindows.com
// (Trustindex Google widget, copied as published, good and bad). Nothing here is written by us.
const reviews = require('./reviews.json');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// the source text has U+FFFD where an apostrophe or dash was lost
const fix = (t) => t
  .replace(/(\w)�(t|s|m|d|ll|re|ve)(?![a-z])/gi, '$1’$2')
  .replace(/�/g, '—')
  .replace(/\s+$/g, '');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const when = (ts) => { const d = new Date(ts * 1000); return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
const COLORS = ['#1a73e8', '#188038', '#d93025', '#e37400', '#9334e6', '#0e4b8c', '#00796b', '#c2185b'];
const G = '<svg class="gr-g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
const stars = (n) => '<span class="gr-st" role="img" aria-label="' + n + ' out of 5 stars">' + '★'.repeat(n) + '<i>' + '★'.repeat(5 - n) + '</i></span>';

module.exports = function ({ formHref = '#quote', phone = '+91 97404 22863', placeId = 'ChIJh57rFncWrjsREhpuUlEFK_k', total = 186 } = {}) {
  const tel = 'tel:' + phone.replace(/\s/g, '');
  const n5 = reviews.filter((r) => r.stars === 5).length, n1 = reviews.filter((r) => r.stars === 1).length;
  const cards = reviews.map((r, i) => `<article class="gr-card" data-s="${r.stars}" tabindex="0" aria-label="Review by ${esc(r.name)}">
<header><span class="gr-av" style="--c:${COLORS[i % COLORS.length]}" aria-hidden="true">${esc(r.name.trim()[0].toUpperCase())}</span><div><b>${esc(r.name)}</b><small>${when(r.ts)}</small></div>${G}</header>
${stars(r.stars)}<p class="gr-t">${esc(fix(r.text))}</p><button type="button" class="gr-more" hidden aria-expanded="false">Read more</button></article>`).join('');

  return `<section class="gr" id="reviews" aria-labelledby="gr-h" data-total="${total}">
<div class="gr__w">
<div class="gr__head">
<a class="gr__badge" href="https://www.google.com/maps/place/?q=place_id:${placeId}" target="_blank" rel="noopener" aria-label="Open VTech on Google Maps">${G}<span><b>${total}</b> Google reviews</span><i aria-hidden="true">↗</i></a>
<h2 id="gr-h">What customers say <em>on Google</em></h2>
<p class="gr__sub">The reviews VTech shows on vtechwindows.com, copied as published, the good and the not-so-good.</p>
<div class="gr__filters" role="group" aria-label="Filter reviews by stars">
<button type="button" class="gr-f is-on" data-f="all" aria-pressed="true">All <span>${reviews.length}</span></button>
<button type="button" class="gr-f" data-f="5" aria-pressed="false">5 <b>★</b> <span>${n5}</span></button>
<button type="button" class="gr-f" data-f="1" aria-pressed="false">1 <b>★</b> <span>${n1}</span></button></div>
</div>
<div class="gr__stage">
<button type="button" class="gr-nav gr-nav--p" aria-label="Previous reviews">←</button>
<div class="gr__track" tabindex="0" role="region" aria-label="Google reviews, scroll sideways" aria-roledescription="carousel">
${cards}
<article class="gr-card gr-card--cta"><span class="gr-cta__k">Your turn</span><h3>Want windows people write good things about?</h3><p>Book a free site visit. An expert measures your openings and gives a clear quote.</p><a class="gr-btn" href="${formHref}">Book free site visit →</a><a class="gr-lnk" href="https://search.google.com/local/writereview?placeid=${placeId}" target="_blank" rel="noopener">Already a customer? Write a review ↗</a></article>
</div>
<button type="button" class="gr-nav gr-nav--n" aria-label="Next reviews">→</button>
</div>
<div class="gr__bar"><span class="gr__count" aria-live="polite"></span><div class="gr__dots" aria-hidden="true"></div><a class="gr__all" href="https://www.google.com/maps/place/?q=place_id:${placeId}" target="_blank" rel="noopener">Read all ${total} on Google ↗</a></div>

<div class="gr-ask">
<div class="gr-ask__l">
<p class="gr-ask__k">Quick enquiry · 20 seconds</p>
<h3>Tell us what you need, we’ll call you back.</h3>
<form class="gr-form" novalidate>
<div class="gr-prog" aria-hidden="true"><i></i></div>
<fieldset class="gr-step is-on" data-step="1"><legend>1. What do you need?</legend><div class="gr-opts">
<button type="button" class="gr-opt" data-k="need" data-v="Windows">\u{1FA9F} Windows</button><button type="button" class="gr-opt" data-k="need" data-v="Doors">\u{1F6AA} Doors</button><button type="button" class="gr-opt" data-k="need" data-v="Windows and doors">✨ Both</button></div></fieldset>
<fieldset class="gr-step" data-step="2" hidden><legend>2. How many openings?</legend><div class="gr-opts">
<button type="button" class="gr-opt" data-k="qty" data-v="1 to 3">1–3</button><button type="button" class="gr-opt" data-k="qty" data-v="4 to 8">4–8</button><button type="button" class="gr-opt" data-k="qty" data-v="9 to 15">9–15</button><button type="button" class="gr-opt" data-k="qty" data-v="More than 15">15+</button></div></fieldset>
<fieldset class="gr-step" data-step="3" hidden><legend>3. Where can we reach you?</legend>
<div class="gr-fld"><label for="gr-n">Your name <b>*</b></label><input id="gr-n" name="name" autocomplete="name"><small class="gr-err"></small></div>
<div class="gr-fld"><label for="gr-p">Phone <b>*</b></label><input id="gr-p" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91"><small class="gr-err"></small></div>
<label class="gr-hp" aria-hidden="true">Leave blank<input name="website" tabindex="-1" autocomplete="off"></label>
<button class="gr-btn gr-btn--full" type="submit">Request a call back →</button></fieldset>
<div class="gr-nav2"><button type="button" class="gr-back" hidden>← Back</button><span class="gr-sum" aria-live="polite"></span></div>
<p class="gr-st2" role="status" aria-live="polite"></p>
</form></div>
<div class="gr-ask__r">
<p class="gr-ask__k">Prefer another way?</p>
<a class="gr-act" href="${tel}"><i>☎</i><span><b>Call ${phone}</b><small>All days, 09:00 AM to 09:00 PM</small></span></a>
<a class="gr-act" href="${formHref}"><i>\u{1F4CB}</i><span><b>Full enquiry form</b><small>Add your colour and product choice</small></span></a>
<button type="button" class="gr-act gr-share"><i>\u{1F4E4}</i><span><b>Send this page to family</b><small class="gr-share__s">Share with whoever decides with you</small></span></button>
</div></div>
</div></section>`;
};
