// Karta produktu podle Figmy „Produkt“ Type=1/4 (112:5174) a Type=Mobile (1696:6752) – jedna
// komponenta pro výpis produktů (#products), carousely úvodní stránky a související produkty
// v detailu. Markup karty je zkrácený skutečný markup Disca (29. 10. 2026), pod ním kompatibilní CSS
// Disca (base-blank.css), aby platily i jeho okraje, výšky a skrytí tlačítek (.no-buttons).
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
// SVG v kompatibilním CSS obsahuje </style>; uvnitř HTML fixture musí zůstat součástí URL.
const css = ['base-blank.css', 'asteroid.css', 'product-card-default.css'].map(name => fs.readFileSync(path.join(dist, name), 'utf8').replace(/<\/style/gi, '%3C/style')).join('\n');
const image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23e6e8eb"/%3E%3C/svg%3E';

const quantity = `<span class="quantity"><label><span class="sr-only">Množství</span><input type="number" name="amount" value="1" class="amount" min="1" max="9999"></label>
<button class="increase" type="button" aria-label="Zvýšit množství o 1"><span class="increase__sign">+</span></button>
<button class="decrease" type="button" aria-label="Snížit množství o 1"><span class="decrease__sign">−</span></button></span>`;

function card({ name = 'Dřevěný přívěsek', stars = false, discount = false, desc = '', detail = false, noButtons = false } = {}) {
  const rating = stars
    ? `<div class="stars-wrapper"><span class="stars star-list">${'<span class="star star-on" aria-hidden="true"></span>'.repeat(5)}<span class="sr-only">Hodnocení 5 z 5</span></span></div>`
    : '<div class="stars-placeholder"></div>';
  const prices = discount
    ? '<div class="price price-final"><strong>390 Kč</strong></div><span class="price-standard"><span><strong>490 Kč</strong></span></span><span class="price-save" data-as-discount="–20 %">(–20 %)</span>'
    : '<div class="price price-final"><strong>390 Kč</strong></div>';
  const tools = detail
    ? '<a href="/produkt/" class="btn btn-primary" aria-label="Detail produktu">Detail</a>'
    : `<form action="/action/Cart/addCartItem/" method="post" class="pr-action">${quantity}<button type="submit" class="btn btn-cart add-to-cart-button" aria-label="Do košíku ${name}"><span>Do košíku</span></button></form>`;
  return `<div class="product"><div class="p" data-micro="product"><a href="/produkt/" class="image"><img src='${image}' alt="" width="423" height="423">
<div class="flags flags-default"><span class="flag flag-new">Novinka</span></div></a>
<div class="p-in"><div class="p-in-in"><a href="/produkt/" class="name"><span>${name}</span></a>
<div class="ratings-wrapper">${rating}<div class="availability"><span style="color:#1AB800">Skladem</span></div></div></div>
<div class="p-bottom${noButtons ? ' no-buttons' : ''}"><div data-micro="offer"><div class="prices">${prices}</div><div class="p-tools">${tools}</div>
${desc ? `<p class="p-desc">${desc}</p>` : ''}</div></div></div><span class="no-display">123</span></div></div>`;
}

const cards = [
  card({ name: 'Test synchronizace' }),
  card({ name: 'Dřevěný přívěsek s delším názvem na dva řádky', stars: true, discount: true }),
  card({ name: 'Dřevěný přívěsek', desc: 'Sada balzámu na vousy a zelených pánských ponožek s nápisem. Dodáváno v dárkové krabičce, která se hodí jako dárek.' }),
  card({ name: 'Produkt s variantami', detail: true }),
  card(), card(), card(), card(),
];

function html(list = `<div id="products" class="products products-page products-block">${cards.join('')}</div>`, body = 'type-category') {
  return `<!doctype html><html class="as-theme as-product-card-default" lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body class="${body}"><main id="content" class="content container">
<div class="category-content-wrapper">${list}</div></main></body></html>`;
}

// Související produkty v detailu: Shoptet jim dává .no-buttons, Disco tlačítka skrývá.
const related = `<div class="products-related-wrapper products-wrapper"><div class="products product-slider products-block products-additional products-related" data-columns="4">${
  [card({ desc: 'Sada balzámu na vousy a zelených pánských ponožek s nápisem.', noButtons: true }), card({ noButtons: true })].join('')}</div></div>`;

async function measure(page, list = '#products') {
  return page.evaluate((list) => {
    const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; };
    return {
      scroll: document.documentElement.scrollWidth,
      list: box(document.querySelector(list)),
      cards: [...document.querySelectorAll(`${list} .p`)].map(p => {
        const q = s => p.querySelector(s);
        return {
          card: box(p), image: box(q('.image')), name: box(q('.name')), desc: box(q('.p-desc')),
          availability: box(q('.availability')), prices: box(q('.prices')), quantity: box(q('.quantity')),
          button: box(q('.p-tools .btn')), save: box(q('.price-save')), flags: box(q('.flags-default')),
          nameFont: getComputedStyle(q('.name')).fontSize + ' ' + getComputedStyle(q('.name')).fontWeight,
          descFont: q('.p-desc') && getComputedStyle(q('.p-desc')).fontSize,
          // Text popisu bez vnitřního okraje (mezera nad popisem je padding).
          descText: q('.p-desc') && q('.p-desc').getBoundingClientRect().top + parseFloat(getComputedStyle(q('.p-desc')).paddingTop),
          buttonFont: getComputedStyle(q('.p-tools .btn')).fontSize,
          icon: getComputedStyle(q('.p-tools .btn'), '::before').maskImage || getComputedStyle(q('.p-tools .btn'), '::before').webkitMaskImage,
        };
      }),
    };
  }, list);
}

test('desktop: card 1/4 aligned left, availability next to the price, stepper and Small button in one row', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1200 });
  await page.setContent(html());
  const { cards: [plain, rated, described, variant, ...rest], scroll } = await measure(page);
  expect(scroll).toBe(1920);
  for (const c of [plain, rated, described]) {
    expect(c.card.w).toBeGreaterThanOrEqual(260);
    expect(Math.round(c.name.x)).toBe(Math.round(c.card.x + 20));
    expect(Math.round(c.availability.x)).toBe(Math.round(c.card.x + 20));
    expect(c.nameFont).toBe('16px 500');
    // Dostupnost vlevo a cena vpravo v jednom řádku.
    expect(Math.abs(c.prices.b - c.availability.b)).toBeLessThanOrEqual(4);
    expect(Math.round(c.prices.r)).toBe(Math.round(c.card.r - 20));
    // Počítadlo vlevo, tlačítko Small vpravo, na společném středu.
    expect(Math.round(c.quantity.x)).toBe(Math.round(c.card.x + 20));
    expect(Math.round(c.button.r)).toBe(Math.round(c.card.r - 20));
    expect(c.button.h).toBe(44);
    expect(c.buttonFont).toBe('16px');
    expect(Math.abs((c.quantity.y + c.quantity.h / 2) - (c.button.y + c.button.h / 2))).toBeLessThanOrEqual(1);
    expect(c.image.w).toBeLessThanOrEqual(220);
  }
  // Popis vlevo pod názvem, 14 px, nejvýš 3 řádky.
  expect(Math.round(described.desc.x)).toBe(Math.round(described.card.x + 20));
  expect(described.descFont).toBe('14px');
  expect(Math.round(described.descText - described.name.b)).toBe(16);
  expect(described.desc.b - described.descText).toBeLessThanOrEqual(Math.ceil(3 * 14 * 1.4) + 1);
  // Spodní část karet v řadě ve stejné výšce, i když jen některá má hodnocení nebo popis.
  expect(new Set([plain, rated, described, variant].map(c => Math.round(c.availability.y))).size).toBe(1);
  // Kolečko slevy přes pravý spodní roh obrázku, příznaky v rohu karty.
  expect(Math.round(rated.save.r)).toBe(Math.round(rated.card.r - 34));
  expect(Math.round(rated.save.y)).toBe(Math.round(rated.image.b - 34));
  expect(Math.round(rated.flags.x)).toBe(Math.round(rated.card.x + 12));
  expect(Math.round(rated.flags.y)).toBe(Math.round(rated.card.y + 16));
  // Produkt s variantami: samotné tlačítko Detail vlevo.
  expect(Math.round(variant.button.x)).toBe(Math.round(variant.card.x + 20));
  // Řádky karet 40 px od sebe.
  expect(Math.round(rest[0].card.y - plain.card.b)).toBe(40);
});

test('phone: cards edge to edge, price under availability, cart button as a 44px icon', async ({ page }) => {
  for (const width of [390, 360, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(html());
    const { list, cards, scroll } = await measure(page);
    expect(scroll, `${width}px`).toBe(width);
    expect(Math.round(list.x), `${width}px`).toBe(0);
    expect(Math.round(list.w), `${width}px`).toBe(width);
    for (const c of cards.slice(0, 3)) {
      expect(Math.round(c.card.w), `${width}px`).toBe(width / 2);
      expect(c.prices.y, `${width}px`).toBeGreaterThanOrEqual(c.availability.b);
      expect(Math.round(c.prices.x), `${width}px`).toBe(Math.round(c.availability.x));
      expect([c.button.w, c.button.h], `${width}px`).toEqual([44, 44]);
      expect(c.buttonFont, `${width}px`).toBe('0px');
      expect(c.icon, `${width}px`).toContain('url(');
      // Počítadlo a tlačítko vedle sebe uvnitř karty.
      expect(Math.abs((c.quantity.y + c.quantity.h / 2) - (c.button.y + c.button.h / 2)), `${width}px`).toBeLessThanOrEqual(1);
      expect(c.button.r, `${width}px`).toBeLessThanOrEqual(c.card.r);
      expect(c.quantity.x, `${width}px`).toBeGreaterThanOrEqual(c.card.x);
    }
    expect(cards[2].descFont).toBe('13px');
    // Řádky těsně pod sebou.
    expect(Math.round(cards[2].card.y - cards[0].card.b), `${width}px`).toBe(0);
  }
  await expect(page.locator('#products .add-to-cart-button').first()).toHaveAttribute('aria-label', /Do košíku/);
});

test('the same card in the homepage slider and in related products on the detail (buttons shown despite .no-buttons)', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1200 });
  await page.setContent(html(related, 'type-detail'));
  const { cards: [described, plain] } = await measure(page, '.products-related');
  for (const c of [described, plain]) {
    expect(Math.round(c.name.x)).toBe(Math.round(c.card.x + 20));
    expect(c.nameFont).toBe('16px 500');
    expect(c.quantity.h).toBe(36);
    expect(c.button.h).toBe(44);
    expect(Math.abs((c.quantity.y + c.quantity.h / 2) - (c.button.y + c.button.h / 2))).toBeLessThanOrEqual(1);
  }
  expect(Math.round(described.descText - described.name.b)).toBe(16);
  await expect(page.locator('.products-related .add-to-cart-button').first()).toBeVisible();
});
