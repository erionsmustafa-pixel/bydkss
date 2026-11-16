// Builds ../index.html (single self-contained page) from runway.css + runway.js + the data below.
// Usage: node tools/build.mjs   — embeds Inter 600 as base64 when the font can be fetched.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const A = 'https://reel-ref-try-the-look.vercel.app/assets/';
const SHOP = 'https://nike-makknzjs.myshopify.com';
const SID = 'template--28035983671601__the_runway_wdM8BG';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shoe = ['40', '41', '42', '43', '44', '45', '46'], app = ['S', 'L', 'M', 'XL'];
const seq = (first, n) => Array.from({ length: n }, (_, i) => first + i * 32768);
const mk = (id, name, shoeItem, img, h, sh, first) => ({
  id, name, vendor: shoeItem ? 'Nikey | Password: 1' : 'Nike', price: shoeItem ? 149 : 199, legend: shoeItem ? 'Shoe size' : 'Size',
  vals: shoeItem ? shoe : app, img: A + img, h, sh, ids: seq(first, shoeItem ? 7 : 4), url: SHOP + '/products/' + id
});
const P = {
  aj12: mk('tatum-5-orbit-copy', 'Air Jordan 12 Retro', 1, 'source-tatum-5-orbit-copy.webp', 400, 160, 57015167025457),
  tshirt: mk('tshirt', 'Tshirt', 0, 'source-tshirt.webp', 563, 225, 56835911582001),
  sweatshirt: mk('sweatshirt', 'Sweatshirt', 0, 'source-sweatshirt.webp', 581, 232, 56835806396721),
  tatum: mk('tatum-5-orbit', 'Tatum 5 Orbit', 1, 'source-tatum-5-orbit.webp', 400, 160, 57015166730545),
  hoodieblack: mk('hoodie-black', 'Hoodie Black', 0, 'source-hoodie-black.webp', 536, 214, 56836251681073),
  sweatplus: mk('sweatshirt-plus', 'Sweatshirt Plus', 0, 'source-sweatshirt-plus.webp', 610, 244, 56836143743281),
  hoodie: mk('hoodie', 'Hoodie', 0, 'source-hoodie.webp', 555, 222, 56836002185521),
  luka: mk('air-jordan-12-retro-copy', 'Luka 5', 1, 'source-air-jordan-12-retro-copy.webp', 400, 160, 57015176364337)
};
const std = [[50, 28], [48, 58], [45, 88]];
const LOOKS = [
  { key: 'bndthK', name: 'The City Edit', m: 1, desc: 'A charcoal knit and easy denim.', items: ['aj12', 'tshirt', 'sweatshirt'], pins: [[47, 27], [48, 58], [45, 96]] },
  { key: 'XckgG6', name: 'Gallery Opening', m: 5, desc: 'A clean white tee and relaxed denim.', items: ['tatum', 'hoodieblack', 'tshirt'], tag: 2, pins: std },
  { key: 'rLfAhC', name: 'Gallery Opening', m: 4, desc: 'Olive knitwear. A grounded palette.', items: ['sweatplus', 'tatum', 'tshirt'], tag: 2, pins: std },
  { key: 'FKg67q', name: 'Studio Day', m: 6, desc: 'Black, white and laid-back denim.', items: ['hoodieblack', 'aj12', 'tshirt'], pins: std },
  { key: '8KREEE', name: 'Studio Day', m: 3, desc: 'Burgundy layers. A tailored perspective.', items: ['sweatshirt', 'tatum', 'tshirt'], pins: std },
  { key: 'N3bfm9', name: 'Studio Day', m: 2, desc: 'A grey crew and your favourite denim.', items: ['hoodie', 'luka', 'tshirt'], pins: std }
];
const variants = (p) => p.ids.map((id, i) => ({ id, a: true, o: [p.vals[i]] }));
const CATALOG = {
  source: SHOP + '/pages/runway',
  looks: LOOKS.map((l) => ({ name: l.name, description: l.desc, image: A + 'original-look-' + l.m + '.webp', products: l.items.map((k) => P[k].id) })),
  items: Object.values(P).map((p) => ({ id: p.id, name: p.name, type: 'From the original lookbook', price: p.price, image: p.img, sizes: p.vals, variants: variants(p), url: p.url }))
};
const money = (n) => '$' + n.toFixed(2);
const SV = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
const src640 = (l) => A + 'model-' + l.m + '-640.webp';
const img = (l) => `<img src="${src640(l)}" srcset="${src640(l)} 640w, ${A}original-look-${l.m}.webp 1080w" sizes="(min-width: 1800px) 540px, (min-width: 750px) 420px, 320px" loading="eager" decoding="async" width="1100" height="1956" draggable="false" data-model-image alt="${esc(l.name)}">`;

const body = (l, i) => `<div class="rw__model" data-rw-model data-index="${i}" aria-hidden="true"><span class="rw__shadow"></span><div class="rw__figure" style="--rw-ar: 0.5625"><div class="rw__art">${img(l)}<button type="button" class="rw__hit" data-rw-go="${i}" aria-label="Look ${i + 1}: ${esc(l.name)}" tabindex="-1"></button></div></div></div>`;
const hero = (l, i) => `<div class="rw__hero${i ? '' : ' is-on'}" data-rw-hero data-index="${i}" data-name="${esc(l.name)}" data-label="Look ${i + 1}: ${esc(l.name)}" data-probe="${src640(l)}"${i ? ' aria-hidden="true"' : ''}><div class="rw__morph"><span class="rw__shadow"></span><div class="rw__figure" style="--rw-ar: 0.5625"><div class="rw__art">${img(l)}<button type="button" class="rw__zoom" data-rw-zoom aria-label="View look: ${esc(l.name)}" tabindex="-1"></button><div class="rw__pins">${l.items.map((k, j) => `<button type="button" class="rw__pin" data-rw-pin="${j + 1}" data-tip="${esc(P[k].name)}" style="left:${l.pins[j][0]}%; top:${l.pins[j][1]}%; --pi:${j + 1}" aria-label="${j + 1}: ${esc(P[k].name)}" tabindex="-1"><span class="rw__pin-dot">${j + 1}</span></button>`).join('')}</div></div></div></div></div>`;
const tick = (l, i) => `<button type="button" class="rw__tick" data-rw-tick="${i}" aria-current="${i ? 'false' : 'true'}" aria-label="Look ${i + 1}: ${esc(l.name)}"><span class="rw__tick-bar"></span><span class="rw__tick-label">0${i + 1}<span class="rw__tick-name">&nbsp;&nbsp;${esc(l.name)}</span></span></button>`;

const item = (l, k, n) => {
  const p = P[k], pid = `Picker-${SID}-look_${l.key}-${n}`, oname = `Opt-${SID}-look_${l.key}-${n}-1`;
  return `<li class="rw__item" data-rw-card="${n}" style="--i:${n}" data-title="${esc(p.name)}">
${l.tag === n ? '<span class="rw__tag"><span class="rw__tag-text">New</span></span>\n' : ''}<a class="rw__media" href="${p.url}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><img src="${p.img}" width="400" height="${p.h}" loading="lazy" decoding="async" alt=""><span class="rw__num">${n}</span></a>
<div class="rw__info"><span class="rw__type">${esc(p.vendor)}</span><a class="rw__name" href="${p.url}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a><span class="rw__price"><span>${money(p.price)}</span></span></div>
<button type="button" class="rw__add" data-rw-add aria-expanded="false" aria-controls="${pid}" aria-label="Add to bag: ${esc(p.name)}" data-added-label="Added to bag: ${esc(p.name)}"><svg class="rw__add-plus" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.3" ${SV}><path d="M12 4v16M4 12h16"/></svg><svg class="rw__add-check" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" ${SV}><path d="M4.5 12.5l5 5L19.5 7"/></svg><svg class="rw__add-spin" width="18" height="18" viewBox="0 0 24 24" stroke-width="1.5" ${SV}><path d="M12 3a9 9 0 1 1-9 9"/></svg></button>
<div class="rw__picker" data-rw-picker id="${pid}" hidden>
<div class="rw__picker-head"><span class="rw__picker-thumb"><img src="${p.img}" width="160" height="${p.sh}" loading="lazy" decoding="async" alt=""></span><span class="rw__picker-meta"><span class="rw__picker-title">${esc(p.name)}</span><span class="rw__picker-price">${money(p.price)}</span></span><button type="button" class="rw__picker-close" data-rw-pick-close aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" ${SV}><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>
<fieldset class="rw__opt"><legend class="rw__opt-name">${p.legend}</legend><div class="rw__values">${p.vals.map((v, j) => `<label class="rw__pill"><input type="radio" name="${oname}" value="${v}" data-rw-option="0"${j ? '' : ' checked'}><span class="rw__pill-label">${v}</span></label>`).join('')}</div></fieldset>
<button type="button" class="rw__confirm" data-rw-confirm><span data-rw-confirm-label data-add="Add to bag">Add to bag</span><span class="rw__sr"> — ${esc(p.name)}</span></button>
<script type="application/json" data-rw-variants>${JSON.stringify(variants(p))}</script>
</div>
</li>`;
};
const panel = (l, i) => `<div class="rw__look-panel${i ? '' : ' is-in'}" data-rw-panel="${i}"${i ? ' hidden' : ''}>
<div class="rw__mhead"><span class="rw__mhead-title">${esc(l.name)}</span><span class="rw__label">3 pieces</span></div>
<ul class="rw__items" role="list">
${l.items.map((k, j) => item(l, k, j + 1)).join('\n')}
</ul>
<div class="rw__bundle has-rule">
<p class="rw__msg" data-rw-msg role="status" aria-live="polite"></p>
<div class="rw__bundle-row"><div class="rw__bundle-copy"><span class="rw__bundle-title">Complete the look</span><span class="rw__bundle-note">Bundle all 3 and save 10%</span></div><div class="rw__bundle-price"><s>$547.00</s><strong>$492.30</strong></div></div>
<button type="button" class="rw__cta" data-rw-all><span class="rw__cta-add">Add full look to bag</span><span class="rw__cta-m">Add full look — $492.30</span><span class="rw__cta-done">Full look in your bag</span><svg class="rw__cta-arrow" width="22" height="12" viewBox="0 0 26 14" stroke-width="1.4" ${SV}><path d="M1 7h24M19 1l6 6-6 6"/></svg><svg class="rw__cta-spin" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.8" ${SV}><path d="M12 3a9 9 0 1 1-9 9"/></svg></button>
</div>
<template data-rw-pieces-text>3 pieces</template>
</div>`;

const TOKENS = `--rw-c-stage:#ffffff; --rw-c-panel:#ffffff; --rw-c-text:#151413; --rw-c-muted:#66625c; --rw-c-accent:#0e0e0e; --rw-c-on-accent:#ffffff; --rw-c-line:#c8c8c8; --rw-card:#DFDFDF; --rw-hf:var(--font-heading--family, inherit); --rw-hw:400; --rw-h-d:46px; --rw-h-m:24px; --rw-sub-d:12px; --rw-sub-m:12px; --rw-eyebrow-d:11px; --rw-eyebrow-m:10px; --rw-label-d:10px; --rw-label-m:9px; --rw-chip-d:17px; --rw-chip-m:18px; --rw-ph-d:18px; --rw-ph-m:16px; --rw-pt-size-d:13px; --rw-pt-size-m:12px; --rw-price-d:12px; --rw-price-m:12px; --rw-opt-d:11px; --rw-opt-m:11px; --rw-total-d:16px; --rw-total-m:16px; --rw-thumb-d:92px; --rw-thumb-m:62px; --rw-tag-top:18px; --rw-tag-left:0px; --rw-thumb-radius:0px; --rw-morph:900ms; --rw-bar-r:20px; --rw-panel-w:380px; --rw-panel-pad-d:32px; --rw-radius:0px; --rw-max:none; --rw-speed:5s; --rw-ax:40%; --rw-btn-radius:0px; --rw-pill-radius:30px; --rw-add-radius:20px;`;

// Inter 600: embed as base64 when available (tools/inter-600.woff2 or network), else reference the deployed file.
let fontSrc = A + 'inter-600.woff2';
const local = join(here, 'inter-600.woff2');
try {
  let buf = existsSync(local) ? readFileSync(local) : null;
  if (!buf) { const r = await fetch(fontSrc, { signal: AbortSignal.timeout(8000) }); if (r.ok) buf = Buffer.from(await r.arrayBuffer()); }
  if (buf && buf.length > 1000) fontSrc = 'data:font/woff2;base64,' + buf.toString('base64');
} catch (e) {}
console.log('font:', fontSrc.startsWith('data:') ? 'embedded base64' : 'remote URL (could not fetch to embed)');

const css = `@font-face{font-family:Inter;src:url(${fontSrc}) format('woff2');font-weight:600;font-style:normal;font-display:swap}\n` + readFileSync(join(here, 'runway.css'), 'utf8');
const js = readFileSync(join(here, 'runway.js'), 'utf8').replace('/*__CATALOG__*/null', JSON.stringify(CATALOG));

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#ffffff">
<title>Try the Look — Runway</title>
<meta name="description" content="Six looks, styled head to toe. Explore the runway, isolate a look, and tap a pin to see the piece.">
<link rel="preload" as="image" href="${A}model-1-640.webp" fetchpriority="high">
<style>
${css}</style>
</head>
<body>
<header class="site-header shopify-section-group-header-group">
<a href="./" class="brand" aria-label="Runway home"><img src="${A}nike-logo.svg" width="68" height="24" alt="Nike"></a>
<nav aria-label="Main navigation"><a href="./">Home</a><a href="${SHOP}/pages/nike-orbit" target="_blank" rel="noopener noreferrer">Nike Orbit</a><a href="${SHOP}/pages/scene-rail" target="_blank" rel="noopener noreferrer">Hand Rail Pro</a><a href="./" aria-current="page">Runway</a></nav>
<button type="button" id="open-bag" aria-label="Open styling bag"><svg width="22" height="24" viewBox="0 0 24 26" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true" focusable="false"><path d="M4 8h16l1 16H3L4 8zM8 8V6a4 4 0 0 1 8 0v2"/></svg><span data-cart-count>0</span></button>
</header>
<main>
<runway-section id="Runway-${SID}" class="rw rw--add-icon rw--popup rw--list has-dividers has-border" data-feel="balanced" data-blur="true" data-mblur="true" data-style="ring" data-mstyle="classic" data-fit="true" data-height-mode="original" data-height-vh="100" data-mheight-mode="custom" data-mheight-vh="109" data-reflect="false" data-autoplay="true" data-speed="5000" data-after-add="stay" data-bundle-code="" data-msg-choose="Pick a size for: [items]" data-msg-error="Couldn’t add to bag. Please try again." data-msg-soldout="Sold out" style="${TOKENS}">
<div class="rw__sticky">
<div class="rw__grid">
<div class="rw__left">
<div class="rw__head"><div class="rw__intro"><h2 class="rw__title">Try the Look.</h2><p class="rw__sub">Six looks, styled head to toe. Tap a pin to see the piece.</p></div><span class="rw__sr" aria-live="polite" aria-atomic="true" data-rw-live></span></div>
<div class="rw__stage" data-rw-stage tabindex="0" role="region" aria-roledescription="carousel" aria-label="Try the Look. — use arrow keys or swipe to change look">
<div class="rw__actors" data-rw-actors">
${LOOKS.map(body).join('\n')}
</div>
<div class="rw__heroes" data-rw-heroes>
${LOOKS.map(hero).join('\n')}
</div>
<span class="rw__sweep"></span>
<span class="rw__cursor" data-rw-cursor><span class="rw__cursor-in"><span class="rw__cursor-label rw__cursor-drag">Drag</span><span class="rw__cursor-label rw__cursor-view">View</span></span></span>
<span class="rw__walk"><span class="rw__walk-line"></span></span>
</div>
<div class="rw__controls">
<button type="button" class="rw__icon" data-rw-prev aria-label="Previous look"><svg width="26" height="14" viewBox="0 0 26 14" stroke-width="1.3" ${SV}><path d="M25 7H1M7 1L1 7l6 6"/></svg></button>
<div class="rw__ticks">${LOOKS.map(tick).join('')}</div>
<button type="button" class="rw__icon rw__auto" data-rw-auto aria-pressed="false" aria-label="Autoplay"><svg class="rw__auto-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M7 4.5v15l12.5-7.5z"/></svg><svg class="rw__auto-pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z"/></svg></button>
<button type="button" class="rw__icon" data-rw-next aria-label="Next look"><svg width="26" height="14" viewBox="0 0 26 14" stroke-width="1.3" ${SV}><path d="M1 7h24M19 1l6 6-6 6"/></svg></button>
</div>
<div class="rw__lb" data-rw-lb data-word="Look" role="region" aria-label="View look" aria-hidden="true">
<div class="rw__lb-stage" data-rw-lb-stage></div>
<div class="rw__lb-top"><p class="rw__lb-cap"><span class="rw__lb-kicker" data-rw-lb-kicker></span><span class="rw__lb-name" data-rw-lb-name></span></p><button type="button" class="rw__lb-close" data-rw-zoom-close aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" ${SV}><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>
<p class="rw__lb-hint">Tap a dot to shop the piece</p>
</div>
</div>
<div class="rw__panel has-rule">
<div class="rw__panel-inner">
<div class="rw__panel-head"><h3 class="rw__panel-title">In this look</h3><span class="rw__label" data-rw-pieces></span></div>
${LOOKS.map(panel).join('\n')}
</div>
</div>
</div>
</div>
</runway-section>
</main>
<dialog id="bag-dialog" aria-labelledby="bag-title">
<div class="bag-heading"><h2 id="bag-title">Your styling bag</h2><button type="button" id="close-bag" aria-label="Close styling bag">×</button></div>
<p class="bag-note">A local outfit shortlist. No payment or order is collected here. Open a piece on the original demo to continue.</p>
<div id="bag-items"></div>
<p id="bag-total"></p>
<button type="button" id="export-bag">Download outfit shortlist</button>
</dialog>
<div id="bag-status" role="status" aria-live="polite"></div>
<script defer src="data:text/javascript,"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
${js}
});
</script>
</body>
</html>
`.replace('data-rw-actors">', 'data-rw-actors>').replace('<script defer src="data:text/javascript,"></script>\n', '');
writeFileSync(join(here, '..', 'index.html'), html);
console.log('wrote index.html', html.length, 'bytes');
