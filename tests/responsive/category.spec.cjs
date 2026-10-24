// Horní část stránky kategorie (components/_category.scss, js/category.js). Minimální stránka podle
// markupu Disca: .category-top s nadpisem, popisem, podkategoriemi a „Nejprodávanější“ (#productsTop).
// Kontroluje rozložení podkategorií, posuvný pás karet se šipkami a tlačítko Detail.
const fs = require('node:fs');
const path = require('node:path');
const {test, expect} = require('@playwright/test');

const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
const css = fs.readFileSync(path.join(dist, 'asteroid.css'), 'utf8');
const js = fs.readFileSync(path.join(dist, 'asteroid.js'), 'utf8');
const image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e6e8eb"/%3E%3C/svg%3E';
const long = 'Velmi dlouhý název produktu, který se do karty nevejde na jeden řádek';

const subcategory = (i) => `<li class="col-xs-6 col-sm-6 col-lg-3 col-xl-3"><a href="/pod-${i}"><span class="image"><img src='${image}' alt="" width="100" height="100"></span><span class="text">Podkategorie ${i}</span></a></li>`;

const bestseller = (i) => `<div class="product"><div class="p"><a href="/produkt-${i}" class="image"><img src='${image}' alt="" width="100" height="100"></a>
  <div class="p-in"><div class="p-in-in"><a href="/produkt-${i}" class="name"><span>${i === 1 ? long : `Produkt ${i}`}</span></a>
  <div class="ratings-wrapper"><div class="availability"><span>Skladem</span></div></div></div>
  <div class="p-bottom no-buttons"><div class="offers"><div class="prices"><span class="price-standard-wrapper-placeholder"></span>
  <div class="price price-final"><strong>${i}90 Kč</strong></div></div></div></div></div></div></div>`;

const page = (bestsellers = 5) => `<!doctype html><html lang="cs"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><style>
  *,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:sans-serif}.container{margin:0 auto;padding:0 20px}
  @media(min-width:768px){.container{width:747px}}@media(min-width:992px){.container{width:972px}}
  @media(min-width:1200px){.container{width:1178px}}@media(min-width:1440px){.container{width:1418px}}
  /* Disco: buňky podkategorií jsou plovoucí sloupce Bootstrapu */.subcategories li{float:left;width:25%}
  ${css}</style></head><body class="type-category one-column-body"><main id="content" class="container content">
  <div class="category-top">
    <h1 class="category-title">Šperky</h1>
    <div class="category-perex"><p>Úvodní popis kategorie s <a href="/odkaz">odkazem</a>.</p></div>
    <ul class="subcategories with-image">${Array.from({length: 7}, (_, i) => subcategory(i + 1)).join('')}</ul>
    <div class="products-top-wrapper"><h2 class="products-top-header" id="productsTopHeading">Nejprodávanější</h2>
      <div id="productsTop" class="products products-inline products-top">${Array.from({length: bestsellers}, (_, i) => bestseller(i + 1)).join('')}</div>
      <div class="button-wrapper"><button class="btn">Zobrazit více</button></div></div>
  </div></main><script>${js}</script></body></html>`;

const box = (p, selector) => p.locator(selector).first().boundingBox();
const boxes = (p, selector) => p.locator(selector).evaluateAll((els) => els.map((el) => {
  const r = el.getBoundingClientRect();
  return {x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height)};
}));

test('subcategories fill the row as buttons of the same height', async ({page: p}) => {
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page());

  const links = await boxes(p, '.subcategories a');
  // Pět vedle sebe (1378 px / min. 240 px), šestá na dalším řádku, mezera 10 px.
  expect(links.slice(0, 5).every((b) => b.y === links[0].y && b.height === 72)).toBe(true);
  expect(links[5].y).toBe(links[0].y + 72 + 10);
  expect(links[1].x - (links[0].x + links[0].width)).toBe(10);
  expect(links[4].x + links[4].width).toBe(links[0].x + 1378);

  await p.setViewportSize({width: 390, height: 844});
  const mobile = await boxes(p, '.subcategories a');
  expect(mobile[1].y).toBe(mobile[0].y + 72 + 10);
  expect(mobile[0].width).toBe(350);
});

test('bestsellers are a scrolling strip with arrows and a detail button', async ({page: p}) => {
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page());

  // Pás je obalený jen jednou, „Zobrazit více“ se skrývá.
  expect(await p.locator('.as-bestsellers > #productsTop').count()).toBe(1);
  await expect(p.locator('.products-top-wrapper > .button-wrapper')).toBeHidden();

  // Tři karty vedle sebe přes šířku obsahu, další jsou za okrajem pásu.
  const cards = await boxes(p, '#productsTop > .product');
  const list = await box(p, '#productsTop');
  expect(cards.slice(0, 3).every((b) => b.y === cards[0].y)).toBe(true);
  expect(cards[2].x + cards[2].width).toBe(Math.round(list.x + list.width));
  expect(cards[3].x).toBeGreaterThan(list.x + list.width);

  // Obrázek 100 px vlevo, název, cena a Detail ve sloupci vedle něj, dlouhý název na jeden řádek.
  const image = await box(p, '#productsTop .product .image');
  const name = await box(p, '#productsTop .product .name');
  const price = await box(p, '#productsTop .product .price-final');
  const detail = await box(p, '#productsTop .product .as-detail-button');
  const card = await box(p, '#productsTop .product .p');
  expect(Math.round(image.width)).toBe(100);
  expect(Math.round(name.x)).toBe(Math.round(image.x + 100 + 24));
  expect(Math.round(price.x)).toBe(Math.round(name.x));
  expect(Math.round(detail.x + detail.width)).toBe(Math.round(card.x + card.width - 1 - 24));
  expect(name.height).toBeLessThan(20);
  await expect(p.locator('#productsTop .product .availability').first()).toBeHidden();
  expect(await p.locator('#productsTop .as-detail-button').first().getAttribute('href')).toBe('/produkt-1');

  // Na začátku jen šipka dál, po posunu na konec jen šipka zpět.
  await expect(p.locator('.as-bestsellers .navigation-prev')).toBeHidden();
  await expect(p.locator('.as-bestsellers .navigation-next')).toBeVisible();
  await p.locator('#productsTop').evaluate((el) => { el.scrollLeft = el.scrollWidth; });
  await expect(p.locator('.as-bestsellers .navigation-next')).toBeHidden();
  await expect(p.locator('.as-bestsellers .navigation-prev')).toBeVisible();
});

test('bestsellers without overflow have no arrows', async ({page: p}) => {
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page(3));
  await expect(p.locator('.as-bestsellers .product-slider-navigation')).toHaveCount(2);
  await expect(p.locator('.as-bestsellers .navigation-prev')).toBeHidden();
  await expect(p.locator('.as-bestsellers .navigation-next')).toBeHidden();
});

// Vlastní stránka: setContent ponechává window, skript šablony by se podruhé nespustil.
test('bestsellers on a phone show part of the next card', async ({page: p}) => {
  await p.setViewportSize({width: 390, height: 844});
  await p.setContent(page());
  const list = await box(p, '#productsTop');
  const cards = await boxes(p, '#productsTop > .product');
  expect(cards[0].width).toBe(Math.round(list.width * 0.88));
  expect(cards[1].x).toBeLessThan(list.x + list.width);
});
