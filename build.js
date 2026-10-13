// Generates index.html from data.js so every product section is static, crawlable HTML.
// Run: node build.js
const fs = require('fs');
const path = require('path');
const { PRODUCTS, GROUPS } = require('./data.js');

const U = 'https://vtechwindows.com/wp-content/uploads/';
// Every image is downloaded from vtechwindows.com into assets/img (same files, served locally so they always load).
const REV = require('./reviews-section.js')({ formHref: '#lead' });
const IMG = 'assets/img/';
// Real images used on each product page of vtechwindows.com (found in the page HTML). Captions state provenance honestly.
const PHOTOS = {
  'inward-outward-opening-windows': [[IMG + 'everest-ltd_upvc-tilt-and-turn-windows-1_photo_2_cb-tiltturn-2-640x522-1.jpg.webp', 'Inward opening image used on VTech’s product page'], [IMG + 'vtech-outward-opening-window-640x522-1.jpg.webp', 'Outward opening image used on VTech’s product page']],
  'top-hung-casement-window': [[IMG + 'fixed-glazing-casement.jpg.webp', 'Image used on VTech’s Top Hung page']],
  'tilt-and-turn-casement-window': [[IMG + 'WindowVentilation_iStock-830679624-e1629969808748-640x522-1.jpg.webp', 'Image used on VTech’s Tilt and Turn page (file name indicates an iStock stock photo)']],
  'fixed-glazing-casement-window': [[IMG + 'picture-window-with-casement-flankers-640x522-1.jpg.webp', 'Image used on VTech’s Fixed Glazing page']],
  'french-door': [[IMG + 'French-Door-640x522-1.jpg.webp', 'Image used on VTech’s French Door page']],
  'multi-sliding-doors': [[IMG + 'Multi-Sliding-Doors-640x522-1.jpg.webp', 'Image used on VTech’s Multi Sliding Doors page']],
  'two-track-sliding-windows': [[IMG + 'sliding-window-for-Living-Room-Design-640x522-1.jpg.webp', 'Image used on VTech’s Two Track page']],
  'three-track-sliding-windows': [[IMG + 'UPVC-PROFILE-172-640x522-1.jpg.webp', 'Image used on VTech’s Three Track page']],
  'monorail-sliding-windows': [[IMG + 'Monorail-sliding-windows.jpg.webp', 'Image used on VTech’s Monorail page']],
  'fly-mesh-sliding-windows': [[IMG + 'Fly-Mesh-sliding-windows.jpg.webp', 'Image used on VTech’s Fly Mesh page']],
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const total = PRODUCTS.length;
const groupOf = (id) => GROUPS.find((g) => g.id === id);
const byGroup = (id) => PRODUCTS.filter((p) => p.group === id);

// ---- sticky product navigation (every group + every sub-type) ----
const navHtml = GROUPS.map((g) => {
  const items = byGroup(g.id);
  if (items.length === 1) {
    return `<div class="pnav__group"><a class="pnav__link pnav__link--solo" href="#${items[0].id}">${esc(items[0].name)}</a></div>`;
  }
  return `<div class="pnav__group"><a class="pnav__link pnav__label" href="#${g.id}">${esc(g.name)}</a>${items
    .map((p) => `<a class="pnav__link" href="#${p.id}">${esc(p.name)}</a>`)
    .join('')}</div>`;
}).join('');


const pad = (i) => String(i).padStart(2, '0');
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
const firstPhoto = (id) => (PHOTOS[id] || [[]])[0][0];

// ---- product sections ----
let n = 0;
const sections = GROUPS.map((g, gi) => {
  const items = byGroup(g.id);
  const solo = items.length === 1;
  const band = solo
    ? ''
    : `<header class="gband" id="${g.id}"><span class="gband__no" aria-hidden="true">${pad(gi + 1)}</span><div><p class="kicker">Family ${pad(gi + 1)} · ${items.length} systems</p><h2 class="gband__t" data-split>${esc(g.name)}</h2></div></header>`;
  const prods = items
    .map((p) => {
      n += 1;
      const num = pad(n);
      const H = solo ? 'h2' : 'h3';
      const photos = PHOTOS[p.id] || [];
      const specs = p.specs.length
        ? `<div class="spec reveal"><p class="spec__h">Published specifications</p><dl>${p.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>`
        : '';
      const main = photos[0];
      const inset = photos[1];
      return `
<article class="prod ${n % 2 === 0 ? 'prod--alt' : ''}" data-p id="${p.id}" aria-labelledby="${p.id}-h">
  <div class="prod__media">
    <span class="prod__ghost" aria-hidden="true">${num}</span>
    <svg class="corners" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M0 14V0h14"/><path pathLength="1" d="M86 0h14v14"/><path pathLength="1" d="M100 86v14H86"/><path pathLength="1" d="M14 100H0V86"/></svg>
    <figure class="pimg pimg--main" data-tilt data-cursor="View">
      <div class="pimg__in"><img src="${main[0]}" alt="${esc(p.name)}" width="640" height="522" loading="${n < 3 ? 'eager' : 'lazy'}" data-depth></div>
      <span class="pimg__glare" aria-hidden="true"></span>
      <span class="pimg__tag">${num} / ${pad(total)}</span>
    </figure>
    ${inset ? `<figure class="pimg pimg--inset wipe wipe--late" data-tilt><div class="pimg__in"><img src="${inset[0]}" alt="${esc(p.name)}, outward opening" width="640" height="522" loading="lazy"></div></figure>` : ''}
    <p class="pimg__cap">Real image from vtechwindows.com · ${esc(main[1])}${inset ? ' (and outward opening)' : ''}</p>
  </div>
  <div class="prod__body">
    <p class="kicker reveal"><b>${num}</b> ${esc(g.name)}</p>
    <${H} class="prod__title" id="${p.id}-h" data-split>${esc(p.name)}</${H}>
    <p class="prod__desc reveal">${esc(p.desc)}</p>
    <ul class="feat feat--check">${p.features.map((f, i) => `<li class="reveal" style="--d:${120 + i * 80}ms"><svg viewBox="0 0 24 24" aria-hidden="true"><circle pathLength="1" cx="12" cy="12" r="10"/><path pathLength="1" d="M7 12.5l3.2 3.2L17 9"/></svg>${esc(f)}</li>`).join('')}</ul>
    ${specs}
    <div class="prod__cta reveal">
      <a class="btn btn--red btn--enq" href="#enquiry" data-magnetic data-enquire data-category="${esc(g.quote)}" data-type="${esc(p.name)}"><span>Enquire Now</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></a>
      <a class="link-arrow" href="${p.url}" target="_blank" rel="noopener">View Details${arrow}</a>
    </div>
  </div>
</article>`;
    })
    .join('');
  return `<div class="pgroup">${band}${prods}</div>`;
}).join('');

// ---- collection map: every family → every system, with real thumbnails ----
const mapHtml = GROUPS.map((g, gi) => {
  const items = byGroup(g.id);
  const href = items.length === 1 ? items[0].id : g.id;
  return `<div class="map__col" style="--dx:${[150, 50, -50, -150][gi]}%;--r:${[-9, -3, 3, 9][gi]}deg;--z:${gi}">
    <a class="map__fam" href="#${href}">
      <span class="map__img"><img src="${firstPhoto(items[0].id)}" alt="" width="640" height="522" loading="lazy"></span>
      <span class="map__no">${pad(gi + 1)}</span>
      <span class="map__name">${esc(g.name)}</span>
      <span class="map__count">${items.length} ${items.length === 1 ? 'system' : 'systems'}</span>
    </a>
    ${items.length > 1 ? `<ul>${items.map((p) => `<li><a href="#${p.id}"><img src="${firstPhoto(p.id)}" alt="" width="64" height="52" loading="lazy"><span>${esc(p.name)}</span>${arrow}</a></li>`).join('')}</ul>` : ''}
  </div>`;
}).join('');

// ---- horizontal gallery of every real product photo ----
const galHtml = PRODUCTS.map((p, i) => `<a class="hgal__item" href="#${p.id}"><span class="hgal__img"><img src="${firstPhoto(p.id)}" alt="${esc(p.name)}" width="640" height="522" loading="eager"></span><span class="hgal__meta"><b>${pad(i + 1)}</b>${esc(p.name)}</span></a>`).join('');


// ---- product theatre (pinned showcase) + hover index ----
const SLATS = 10;
const p0 = PRODUCTS[0];
const slatsHtml = Array.from({ length: SLATS }, (_, i) => `<i style="--i:${i};background-image:url('${firstPhoto(p0.id)}');background-position:${(i / (SLATS - 1)) * 100}% 50%"></i>`).join('');
const dotsHtml = PRODUCTS.map((p, i) => `<button type="button" class="th-dot${i === 0 ? ' on' : ''}" data-i="${i}" style="--img:url('${firstPhoto(p.id)}')" aria-label="Show ${esc(p.name)}"><span>${pad(i + 1)}</span></button>`).join('');
const indexHtml = PRODUCTS.map((p, i) => `<li><a href="#${p.id}" data-img="${firstPhoto(p.id)}"><span class="idx__n">${pad(i + 1)}</span><span class="idx__name">${esc(p.name)}</span><span class="idx__fam">${esc(groupOf(p.group).name)}</span><img class="idx__thumb" src="${firstPhoto(p.id)}" alt="" width="640" height="522" loading="lazy"></a></li>`).join('');
const marquee = PRODUCTS.map((p) => `<span>${esc(p.name)}</span><i aria-hidden="true">✦</i>`).join('');

const CLIENTS = 'assets/img/Picture1.jpg assets/img/Picture2.jpg assets/img/Picture3.jpg assets/img/Picture4.jpg assets/img/Picture5.jpg assets/img/Picture7.jpg assets/img/Picture8.jpg assets/img/Picture9.jpg assets/img/Picture10.jpg assets/img/Picture11.png assets/img/Picture13.jpg assets/img/Picture14.jpg assets/img/Picture15.jpg assets/img/Picture16.jpg assets/img/Picture17.jpg assets/img/Picture18.png assets/img/Picture19.jpg assets/img/Picture20.jpg assets/img/Picture21.png'.split(' ');
const clientsHtml = CLIENTS.map((s, i) => `<li><img src="${s}" alt="Client logo ${i + 1}, as shown on vtechwindows.com" loading="lazy" onerror="this.parentElement.remove()"></li>`).join('');
const typeOptions = PRODUCTS.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
const explorerList = PRODUCTS.map(
  (p, i) => `<label class="opt"><input type="radio" name="xtype" value="${p.model}" data-id="${p.id}" ${i === 0 ? 'checked' : ''}><span>${esc(p.name)}</span></label>`
).join('');
const productJson = JSON.stringify(
  PRODUCTS.map((p) => ({ id: p.id, desc: p.desc, photo: (PHOTOS[p.id] || [[]])[0][0], model: p.model, name: p.name, url: p.url, features: p.features, specs: p.specs, group: groupOf(p.group).quote }))
);
const groupJson = JSON.stringify(
  GROUPS.map((g) => ({ name: g.quote, types: byGroup(g.id).map((p) => p.name) }))
);

const icon = (d) => `<svg class="ico" viewBox="0 0 32 32" aria-hidden="true">${d}</svg>`;
const P = (d) => `<path pathLength="1" d="${d}"/>`;
const benefits = [
  ['Thermal insulation', 'uPVC profiles offer good thermal insulation thanks to low thermal conductivity.', P('M13 5a3 3 0 0 1 6 0v12.5a6 6 0 1 1-6 0z') + P('M16 11v10')],
  ['Noise insulation', 'VTech lists strong insulation against ambient noise as a core benefit of uPVC.', P('M6 12v8') + P('M11 8v16') + P('M16 4v24') + P('M21 8v16') + P('M26 12v8')],
  ['Weather and light resistance', 'Unaffected by climate changes and resistant to fading from light; will not rot or warp.', P('M9 22a5 5 0 0 1 .8-9.9A7 7 0 0 1 23.5 11 4.5 4.5 0 0 1 23 22z') + P('M11 26l-1 3') + P('M16 26l-1 3') + P('M21 26l-1 3')],
  ['Low maintenance', 'No sanding, painting or varnishing. Smooth frames clean with dishwashing liquid.', P('M16 4l2.5 7.5L26 14l-7.5 2.5L16 24l-2.5-7.5L6 14l7.5-2.5z')],
  ['Galvanised steel reinforcement', 'Steel inside the hollow chambers adds strength and durability to uPVC frames.', P('M16 4l10 4v8c0 6-4.5 10-10 12C10.5 26 6 22 6 16V8z') + P('M11.5 16l3 3 6-6')],
  ['Recyclable', 'VTech states uPVC is 100% recyclable, with lower production energy use than wood.', P('M24 13a8 8 0 0 0-14-3') + P('M8 6v5h5') + P('M8 19a8 8 0 0 0 14 3') + P('M24 26v-5h-5')],
];
const benefitsHtml = benefits
  .map(([t, d, p], i) => `<li class="ben reveal" style="--d:${i * 70}ms">${icon(p)}<h3>${t}</h3><p>${d}</p></li>`)
  .join('');

const faqs = [
  ['Which window type suits which space?', 'VTech’s pages note that outward-opening windows save interior space and keep the sill usable, sliding windows save interior space and let in more sunlight, tilt and turn windows give draft-free ventilation in the tilt position, and multi sliding doors give a panoramic view. For a specific room, the VTech team can guide you.'],
  ['What opening styles are available?', 'Inward and outward opening, top hung, tilt and turn, and fixed glazing casements; French doors; multi sliding doors; and two track, three track, monorail and fly mesh sliding windows.'],
  ['What colour and customisation options are offered?', 'VTech’s consultation form offers White and Wooden Finish colour preferences. The French Door page lists various colours, designs and hardware and both standard and custom sizes.'],
  ['Is double glazing available?', 'The Inward Outward Opening Windows page states that single or double glazing is available, and the Fly Mesh Sliding Windows page lists glass from 5 mm to 12 mm. Please confirm glazing for your chosen system when you request a quote.'],
  ['How can I request a quotation?', 'Use the enquiry form on this page, or call +91 97404 22863 or +91 99801 11468, or email vtechbuildingsystems@gmail.com.'],
  ['How can I arrange a consultation?', 'Call or email the VTech team, or visit the showroom at No. 693, M.N.S Arcade, 3rd Floor, Dr. Rajkumar Rd, 6th Block, Rajajinagar, Bengaluru 560010. Contact person listed: Mr. Bhargav, Executive Director.'],
];
const faqHtml = faqs
  .map(
    ([q, a], i) => `<div class="faq__item reveal"><h3><button type="button" class="faq__q" aria-expanded="false" aria-controls="fa${i}" id="fq${i}"><span>${q}</span><i aria-hidden="true"></i></button></h3><div class="faq__a" id="fa${i}" role="region" aria-labelledby="fq${i}"><div><p>${a}</p></div></div></div>`
  )
  .join('');

const ld = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'V-Tech Building Systems Pvt. Ltd',
  url: 'https://vtechwindows.com/',
  telephone: ['+91 97404 22863', '+91 99801 11468'],
  email: 'vtechbuildingsystems@gmail.com',
  address: { '@type': 'PostalAddress', streetAddress: 'No. 693, M.N.S Arcade, 3rd Floor, Dr. Rajkumar Rd, 6th Block, Rajajinagar', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', postalCode: '560010', addressCountry: 'IN' },
};


const half = Math.ceil(CLIENTS.length / 2);
const logoRow = (list) => list.map((s) => `<li><img src="${s}" alt="Client logo, as shown on vtechwindows.com" loading="lazy" onerror="this.parentElement.remove()"></li>`).join('');
const clientRow = (list, rev) => `<div class="cmq ${rev ? 'cmq--rev' : ''}"><ul>${logoRow(list)}</ul><ul aria-hidden="true">${logoRow(list)}</ul></div>`;
const HERO = IMG + 'WhatsApp-Image-2023-10-03-at-6.30.43-PM.jpeg.webp';

// cache-busting version so browsers always load the latest CSS/JS after a rebuild
const V = Date.now().toString(36);
let html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>uPVC Windows &amp; Doors in Bengaluru | VTech</title>
<meta name="description" content="Explore every VTech uPVC window and door system with real product photos: casement windows, French doors, multi sliding doors and sliding windows. Request a quote from the Bengaluru team.">
<meta name="theme-color" content="#012A63">
<meta property="og:title" content="uPVC Windows &amp; Doors | VTech">
<meta property="og:description" content="Every VTech uPVC window and door system, with real photos. Request a quote.">
<meta property="og:image" content="${U}2023/10/WhatsApp-Image-2023-10-03-at-6.30.43-PM.jpeg.webp">
<meta property="og:type" content="website">
<link rel="icon" type="image/svg+xml" href="${IMG}vtech-icon.svg"><link rel="icon" type="image/png" sizes="32x32" href="${IMG}vtech-icon-32.png"><link rel="apple-touch-icon" href="${IMG}vtech-icon-180.png">

<link rel="preload" as="image" href="${HERO}">
<script>document.documentElement.classList.add('js','loaded')</script>
<link rel="stylesheet" href="styles.css?v=${V}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<div class="progress" aria-hidden="true"><i></i></div>
<div class="cursor" aria-hidden="true"><span></span></div>
<a class="skip" href="#collection">Skip to collection</a>

<header class="top" id="top">
  <a class="brand" href="https://vtechwindows.com/" aria-label="VTech home"><img src="${IMG}vtech-icon.svg" alt="VTech" width="40" height="40"><span><b>V-TECH</b> uPVC Windows &amp; Doors</span></a>
  <nav class="top__nav" aria-label="Page sections">
    <a href="#products">Products</a><a href="#benefits">Why uPVC</a><a href="#process">Process</a><a href="#reviews">Reviews</a><a href="#enquiry">Contact</a>
  </nav>
  <a class="tel" href="tel:+919740422863" aria-label="Call +91 97404 22863"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/></svg><span>+91 97404 22863</span></a>
  <a class="btn btn--red btn--sm" href="#enquiry" data-magnetic><span>Get Free Quote</span></a>
</header>

<div class="hero-pin" data-pin>
<section class="hero" aria-labelledby="h1">
  <div class="hero__media"><img class="hero__img" src="${HERO}" alt="Residential building with uPVC windows, photo from vtechwindows.com" width="1024" height="768" fetchpriority="high"></div>
  <svg class="hero__frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect pathLength="1" x="0" y="0" width="100" height="100"/><path pathLength="1" d="M50 0V100"/><path pathLength="1" d="M0 50H100"/></svg>
  <div class="hero__after" aria-hidden="true"><p class="kicker">The VTech collection</p><p class="hero__after-t">${total} systems.<br><em>4 families.</em></p><p class="hero__after-s">Casement · French Door · Multi Sliding · Sliding</p></div>
  <div class="hero__sweep" aria-hidden="true"></div>
  <div class="hero__veil" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>
  <div class="hero__grid" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="hero__in">
    <p class="eyebrow">VTECH <i></i> uPVC WINDOWS &amp; DOORS</p>
    <h1 id="h1"><span class="ln"><span>A Better View.</span></span><span class="ln ln--it"><span>A Better Way to Live.</span></span></h1>
    <p class="hero__p">Casement windows, French doors, multi sliding doors and sliding windows from a Bengaluru manufacturer using German uPVC profile technology.</p>
    <div class="hero__cta"><a class="btn btn--red" href="#lead" data-magnetic><span>Book Free Site Visit →</span></a><a class="btn btn--ghost" href="tel:+919740422863" data-magnetic><span>Call +91 97404 22863</span></a></div>
  </div>
  <form class="lform" id="lead" novalidate aria-labelledby="lead-h">
    <span class="lead__rb">Free consultation</span>
    <h2 id="lead-h">Book Free Site Consultation</h2>
    <p class="lead__sub">An expert will visit, measure &amp; quote, free of charge.</p>
    <div class="lead__row"><div class="lf"><label for="lfirst">First name <b>*</b></label><input id="lfirst" name="first" autocomplete="given-name" placeholder="Your name"><small class="err"></small></div><div class="lf"><label for="llast">Last name</label><input id="llast" name="last" autocomplete="family-name"></div></div>
    <div class="lf"><label for="lphone">Phone <b>*</b></label><input id="lphone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91"><small class="err"></small></div>
    <div class="lf"><label for="lprod">Product</label><select id="lprod" name="product"><option value="">Not sure yet</option>${PRODUCTS.map((p) => `<option>${p.name}</option>`).join('')}</select></div>
    <div class="lf"><span class="lf__l">Colour preference</span><div class="lchips" role="group" aria-label="Colour preference">${[['White', 'white'], ['Wooden Finish', 'wood'], ['Grey', 'grey'], ['Black', 'black']].map(([l, c], i) => `<button type="button" class="lchip" data-v="${l}" aria-pressed="${i === 0}"><span class="sw sw--${c}"></span>${l}</button>`).join('')}</div><input type="hidden" name="colour" value="White"></div>
    <label class="hp" aria-hidden="true">Leave blank<input name="website" tabindex="-1" autocomplete="off"></label>
    <button class="btn btn--red lead__go" type="submit"><span>Submit Details →</span></button>
    <p class="lead__st" role="status" aria-live="polite"></p>
    <p class="lead__legal">🔒 Used only to contact you about this request.</p>
  </form>
  <a class="scroll" href="#benefits" aria-label="Scroll to collection"><i></i><span>Scroll</span></a>
  <p class="hero__credit">Photo · vtechwindows.com</p>
</section>
</div>

<div class="marquee" aria-hidden="true"><div class="marquee__t">${marquee}${marquee}</div></div>

<section class="sband" aria-label="Figures as stated by VTech"><div class="sband__in">
  <div class="reveal"><b><em data-count="1">1</em> Lakh+</b><span>Happy customers</span></div>
  <div class="reveal" style="--d:90ms"><b><em data-count="200">200</em>+</b><span>Projects completed</span></div>
  <div class="reveal" style="--d:180ms"><b><em data-count="20">20</em>+</b><span>Years of experience</span></div>
  <div class="reveal" style="--d:270ms"><b><em data-count="5">5</em>+</b><span>Quality certifications</span></div>
</div><p>Figures as stated by VTech.</p></section>
<main id="collection">

<section class="benefits" id="benefits" aria-labelledby="ben-h">
  <div class="benefits__head"><p class="kicker reveal">Why uPVC</p><h2 id="ben-h" data-split>Built to be lived with, not looked after.</h2></div>
  <ul class="benefits__grid bento">${benefitsHtml}</ul>
  <div class="benefits__foot">
    <figure class="warranty reveal"><img src="${IMG}Icon-ultrain-ex-final-640x158-1.png.webp" alt="VTech graphic: premium profiles, 15 year uPVC profile warranty, 10 year hardware warranty, weather resistant, low maintenance" loading="lazy" width="640" height="158"><figcaption>Graphic shown on VTech’s product pages. Warranty terms are not published on the site, so please confirm them with VTech.</figcaption></figure>
    <div class="tt reveal">
      <h3>Published on the Tilt and Turn page</h3>
      <dl><div><dt>System</dt><dd>70 mm casement</dd></div><div><dt>Uf value</dt><dd>1.4 W/m²K</dd></div><div><dt>Sound reduction</dt><dd>43 dB</dd></div><div><dt>Profile standard</dt><dd>EN 12608</dd></div><div><dt>Weathering</dt><dd>6,000 h xenon arc test</dd></div></dl>
      <p class="note">Figures apply to VTech’s Tilt and Turn casement system only. <a href="https://vtechwindows.com/upvc-windows-manufacturers-in-bangalore-html/" target="_blank" rel="noopener">Why uPVC?</a></p>
    </div>
  </div>
</section>

<section class="fin2" aria-labelledby="fin-h"><div class="sec2__head"><p class="kicker reveal">Finishes</p><h2 id="fin-h" data-split>Choose a finish that fits your home.</h2><p class="lead reveal">Foil-laminated finishes that won’t fade, peel or need repainting.</p></div><ul class="fin2__g"><li class="fin2__c reveal" style="--d:0ms"><img src="assets/v2/finish-white.webp" alt="Classic White finish sample" width="500" height="500" loading="lazy"><div><h3>Classic White</h3><p>Timeless. The most popular choice.</p></div></li><li class="fin2__c reveal" style="--d:90ms"><img src="assets/v2/finish-oak.webp" alt="Golden Oak finish sample" width="500" height="500" loading="lazy"><div><h3>Golden Oak</h3><p>Warm wood-grain laminate.</p></div></li><li class="fin2__c reveal" style="--d:180ms"><img src="assets/v2/finish-walnut.webp" alt="Dark Walnut finish sample" width="500" height="500" loading="lazy"><div><h3>Dark Walnut</h3><p>Rich teak-like finish.</p></div></li><li class="fin2__c reveal" style="--d:270ms"><img src="assets/v2/finish-grey.webp" alt="Anthracite Grey finish sample" width="500" height="500" loading="lazy"><div><h3>Anthracite Grey</h3><p>Modern, architectural look.</p></div></li></ul></section>

<div class="spine-wrap" id="products" data-pin>
<nav class="pnav" id="pnav" aria-label="uPVC window and door systems"><div class="pnav__in">${navHtml}</div></nav><div class="spine" aria-hidden="true"><i></i><b></b></div>
${sections}
</div>

<section class="gal2" id="gallery2" aria-labelledby="g2-h"><div class="sec2__head"><p class="kicker reveal">Gallery</p><h2 id="g2-h" data-split>Windows that change a room.</h2><p class="lead reveal">Images published on VTech’s landing page, windows.vtechwindows.com.</p></div><div class="gal2__g"><figure class="gal2__c reveal" style="--d:0ms"><img src="assets/v2/gallery-1.webp" alt="Modern home exterior with Casement + Fixed, image from VTech" width="900" height="675" loading="lazy"><figcaption><span>Casement + Fixed</span><b>Modern home exterior</b></figcaption></figure><figure class="gal2__c reveal" style="--d:110ms"><img src="assets/v2/gallery-2.webp" alt="Tower balcony with Multi-Sliding Doors, image from VTech" width="900" height="675" loading="lazy"><figcaption><span>Multi-Sliding Doors</span><b>Tower balcony</b></figcaption></figure><figure class="gal2__c reveal" style="--d:220ms"><img src="assets/v2/gallery-3.webp" alt="Independent villa with Casement + Fixed, image from VTech" width="900" height="675" loading="lazy"><figcaption><span>Casement + Fixed</span><b>Independent villa</b></figcaption></figure><figure class="gal2__c reveal" style="--d:0ms"><img src="assets/v2/gallery-4.webp" alt="High-rise apartment with Fixed Glazing, image from VTech" width="900" height="675" loading="lazy"><figcaption><span>Fixed Glazing</span><b>High-rise apartment</b></figcaption></figure><figure class="gal2__c reveal" style="--d:110ms"><img src="assets/v2/gallery-5.webp" alt="Garden-facing villa with French Door, image from VTech" width="900" height="675" loading="lazy"><figcaption><span>French Door</span><b>Garden-facing villa</b></figcaption></figure><figure class="gal2__c reveal" style="--d:220ms"><img src="assets/v2/gallery-6.webp" alt="Bedroom with Soundproof Casement, image from VTech" width="900" height="675" loading="lazy"><figcaption><span>Soundproof Casement</span><b>Bedroom</b></figcaption></figure></div></section>

<section class="story" id="inside" aria-labelledby="st-h">
  <div class="story__sticky">
    <div class="story__copy">
      <p class="kicker">Inside the frame</p>
      <h2 id="st-h" data-split>What goes into a VTech window.</h2>
      <ol class="story__steps">
        <li data-step="0"><b>01</b><div><h3>Multi-chambered uPVC profile</h3><p>Hollow, multi-chambered profiles with segregated drainage. Frame wall approx. 2.0 mm.</p></div></li>
        <li data-step="1"><b>02</b><div><h3>Galvanised steel reinforcement</h3><p>Steel shaped for structural strength sits inside the profile chamber, 1.2 to 3.0 mm on outward-opening windows.</p></div></li>
        <li data-step="2"><b>03</b><div><h3>EPDM weather and glazing seals</h3><p>Seals around the sash and glass, with pile seals that help keep out dust.</p></div></li>
        <li data-step="3"><b>04</b><div><h3>Mitred beads, single or double glazing</h3><p>Mitred glazing beads give a cleaner finish; single or double glazing is available.</p></div></li>
        <li data-step="4"><b>05</b><div><h3>Corrosion-resistant hardware</h3><p>Fittings that resist atmospheric corrosion, with single- or multi-point locks.</p></div></li>
      </ol>
      <p class="note">Details from VTech’s Inward Outward Opening Windows page. The drawing is a simplified diagram, not a technical drawing.</p>
    </div>
    <div class="story__fig" aria-hidden="true">
      <div class="story__ring"></div>
      <svg viewBox="0 0 420 420">
        <g class="part" data-part="0"><rect pathLength="1" x="80" y="50" width="180" height="320" rx="16"/><rect pathLength="1" x="96" y="66" width="68" height="84" rx="6"/><rect pathLength="1" x="176" y="66" width="68" height="84" rx="6"/><rect pathLength="1" x="96" y="162" width="148" height="96" rx="6"/><rect pathLength="1" x="96" y="270" width="68" height="84" rx="6"/><rect pathLength="1" x="176" y="270" width="68" height="84" rx="6"/><text x="80" y="36">uPVC profile</text></g>
        <g class="part part--steel" data-part="1"><path pathLength="1" d="M110 178h120v64H110"/><path pathLength="1" d="M118 186h104v48H118"/><text x="104" y="220">steel</text></g>
        <g class="part part--seal" data-part="2"><rect pathLength="1" x="258" y="96" width="12" height="26" rx="6"/><rect pathLength="1" x="258" y="298" width="12" height="26" rx="6"/><rect pathLength="1" x="340" y="96" width="12" height="26" rx="6"/><rect pathLength="1" x="340" y="298" width="12" height="26" rx="6"/><text x="356" y="90">EPDM</text></g>
        <g class="part part--glass" data-part="3"><rect pathLength="1" x="278" y="84" width="16" height="252" rx="2"/><rect pathLength="1" x="314" y="84" width="16" height="252" rx="2"/><path pathLength="1" d="M262 70h88l-12 14h-64z"/><path pathLength="1" d="M262 350h88l-12-14h-64z"/><text x="276" y="392">glazing</text></g>
        <g class="part part--hw" data-part="4"><path pathLength="1" d="M80 196H40a10 10 0 0 0 0 20h40"/><circle pathLength="1" cx="58" cy="206" r="4"/><path pathLength="1" d="M80 120h-16M80 300h-16"/><text x="14" y="250">lock</text></g>
      </svg>
    </div>
  </div>
</section>

<section class="zoom" aria-labelledby="zm-h">
  <div class="zoom__sticky">
    <figure class="zoom__frame"><img src="${IMG}WhatsApp-Image-2023-10-19-at-2.44.47-PM-1024x683.jpeg" alt="Interior photo from the VTech website" loading="lazy" width="1024" height="683"></figure>
    <div class="zoom__text">
      <p class="kicker">20+ years of experience</p>
      <h2 id="zm-h">German uPVC profile technology. Made in Bengaluru.</h2>
      <p class="zoom__cap">Real image from vtechwindows.com</p>
    </div>
  </div>
</section>

<section class="proc2" id="process" aria-labelledby="pc-h"><div class="sec2__head"><p class="kicker reveal">Our process</p><h2 id="pc-h" data-split>How it works.</h2><p class="lead reveal">Measurement, design, manufacturing and installation, all handled in-house.</p></div><ol class="proc2__g" data-p><li class="proc2__s"><i>01</i><h3>Book free visit</h3><p>Share your details. An expert visits at a time that suits you.</p></li><li class="proc2__s"><i>02</i><h3>Site measurement</h3><p>Accurate measurement and design recommendations for every opening.</p></li><li class="proc2__s"><i>03</i><h3>Custom manufacturing</h3><p>Made in VTech’s Bengaluru factory with European-grade profiles.</p></li><li class="proc2__s"><i>04</i><h3>Installation & warranty</h3><p>Clean installation by VTech’s own team, backed by a manufacturer warranty.</p></li></ol></section>

<section class="clients" data-p id="clients" aria-labelledby="cl-h">
  <div class="clients__head"><p class="kicker reveal">Clientele</p><h2 id="cl-h" data-split>Trusted by public and private sector organisations.</h2></div>
  ${clientRow(CLIENTS.slice(0, half))}
  ${clientRow(CLIENTS.slice(half), true)}
  <p class="note">Client logos exactly as shown on VTech’s homepage. The website lists no project details for these clients, so none are added here.</p>
  <div class="real2">
    <figure class="pimg wipe" data-tilt><div class="pimg__in"><img src="${HERO}" alt="Residential building photo from the VTech homepage" loading="lazy" width="1024" height="768"></div><span class="pimg__glare" aria-hidden="true"></span></figure>
    <figure class="pimg wipe wipe--late" data-tilt><div class="pimg__in"><img src="${IMG}WhatsApp-Image-2026-01-03-at-2.01.12-PM.jpeg.webp" alt="Folding glass doors photo from the VTech homepage" loading="lazy" width="678" height="452"></div><span class="pimg__glare" aria-hidden="true"></span></figure>
  </div>
  <p class="pimg__cap">Real images from the VTech homepage. VTech does not name these projects.</p>
</section>

${REV}

<section class="faq" id="faq" aria-labelledby="faq-h">
  <div class="faq__head"><p class="kicker reveal">Questions</p><h2 id="faq-h" data-split>Good to know.</h2></div>
  <div class="faq__list">${faqHtml}</div>
</section>

<section class="enq" id="enquiry" aria-labelledby="enq-h">
  <div class="grain" aria-hidden="true"></div>
  <div class="enq__copy">
    <p class="kicker">Enquiry</p>
    <h2 id="enq-h" data-split>Let’s Find the Right Windows for Your Space.</h2>
    <p class="lead">Explore our window and door systems and connect with the VTech team for product guidance and a quotation.</p>
    <address>
      <strong>V-Tech Building Systems Pvt. Ltd</strong>
      <span>Mr. Bhargav, Executive Director</span>
      <a href="tel:+919740422863">+91 97404 22863</a>
      <a href="tel:+919980111468">+91 99801 11468</a>
      <a href="mailto:vtechbuildingsystems@gmail.com">vtechbuildingsystems@gmail.com</a>
      <span class="addr"><b>Showroom</b> No. 693, M.N.S Arcade, 3rd Floor, Dr. Rajkumar Rd, 6th Block, Rajajinagar, Bengaluru 560010</span>
      <span class="addr"><b>Hours</b> All days, 09:00 AM to 09:00 PM</span>
      <span class="addr"><b>Factory</b> 4GW7+P2Q, Kalenahalli, Bengaluru 560089</span>
    </address>
  </div>
  <form class="form" id="qform" novalidate data-p><svg class="frame-draw" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect pathLength="1" x="0" y="0" width="100" height="100" rx="1.5"/></svg>
    <div class="f f--half"><label for="fname">Full Name <b>*</b></label><input id="fname" name="name" autocomplete="name" required><small class="err" aria-live="polite"></small></div>
    <div class="f f--half"><label for="fphone">Phone Number <b>*</b></label><input id="fphone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required><small class="err" aria-live="polite"></small></div>
    <div class="f f--half"><label for="femail">Email Address <i>(optional)</i></label><input id="femail" name="email" type="email" autocomplete="email"><small class="err" aria-live="polite"></small></div>
    <div class="f f--half"><label for="fcity">City / Location <b>*</b></label><input id="fcity" name="city" autocomplete="address-level2" required><small class="err" aria-live="polite"></small></div>
    <div class="f f--half"><label for="fcat">Product Category <b>*</b></label><select id="fcat" name="category" required></select><small class="err" aria-live="polite"></small></div>
    <div class="f f--half"><label for="ftype">Preferred Window Type</label><select id="ftype" name="type"></select></div>
    <div class="f f--half"><label for="fcol">Colour Preference</label><select id="fcol" name="colour"><option value="">No preference</option><option>White</option><option>Wooden Finish</option></select></div>
    <div class="f f--half"><label for="fqty">Approximate Quantity <i>(optional)</i></label><input id="fqty" name="qty" inputmode="numeric" placeholder="e.g. 8 windows"></div>
    <div class="f"><label for="fdet">Project Details <i>(optional)</i></label><textarea id="fdet" name="details" rows="3"></textarea></div>
    <div class="f hp" aria-hidden="true"><label>Leave blank<input name="website" tabindex="-1" autocomplete="off"></label></div>
    <div class="f f--check"><input type="checkbox" id="fconsent" name="consent" required><label for="fconsent">I agree that VTech may use these details to contact me about my enquiry. Details are used only for this purpose. <b>*</b></label><small class="err" aria-live="polite"></small></div>
    <button class="btn btn--red btn--lg" type="submit" id="fsubmit"><span>Request a Quote</span></button>
    <p class="form__status" id="fstatus" role="status" aria-live="polite"></p>
  </form>
</section>
</main>

<footer class="foot">
  <div class="foot__big" aria-hidden="true">${"V-TECH".split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</div>
  <p class="foot__tag"><i></i><span>uPVC Windows &amp; Doors · Bengaluru</span><i></i></p>
  <p>© V-Tech Building Systems Pvt. Ltd · <a href="https://vtechwindows.com/" target="_blank" rel="noopener">vtechwindows.com</a> · <a href="https://vtechwindows.com/contact-html/" target="_blank" rel="noopener">Contact</a> · <a href="https://vtechfacades.com/" target="_blank" rel="noopener">Facades</a> · <a href="https://vtechwindows.com/v-tech-fosroc/" target="_blank" rel="noopener">Fosroc</a> · <a href="https://www.linkedin.com/company/v-tech-building-systems-pvt-ltd" target="_blank" rel="noopener">LinkedIn</a></p>
</footer>

<a class="fab" href="#enquiry" data-magnetic aria-label="Request a quote"><span>Get Free Quote</span></a>
<div class="mbar"><a href="tel:+919740422863" class="mbar__call">Call Now</a><a href="#enquiry" class="mbar__q">Free Quote →</a></div>

<script>window.VTECH={products:${productJson},groups:${groupJson},endpoint:'',email:'vtechbuildingsystems@gmail.com'};</script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="app.js?v=${V}"></script>
</body>
</html>`;

html = html.replace(/((?:assets\/(?:img|v2)|img2?)\/[^"' )?]+\.(?:webp|png|jpe?g|svg))/g, '$1?v=3');
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html written,', PRODUCTS.length, 'products');
