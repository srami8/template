// Horní část stránky kategorie (components/_category.scss, js/category.js). Minimální stránka podle
// markupu Disca: .category-top s nadpisem, popisem, podkategoriemi a „Nejprodávanější“ (#productsTop).
// Kontroluje rozložení podkategorií, posuvný pás karet se šipkami, tlačítko Detail a blok článků
// (data ze settings-app podle GUID kategorie v dataLayer, tady podstrčená přes page.route).
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

const GUID = '0d2e8b0e-6b1a-11eb-90ab-b8ca3a6063f8';
const ARTICLES_URL = 'https://settings.test/public/313980/category-articles.json?v=abc';
const config = `<script>window.dataLayer = [{shoptet: {pageType: 'category', category: {guid: '${GUID}'}}}];
  window.asteroidConfig = Object.assign(window.asteroidConfig || {}, {categoryArticles: '${ARTICLES_URL}'});</script>`;

const variantCss = (name) => fs.readFileSync(path.join(dist, `category-${name}.css`), 'utf8');
// Obrázek vložený do popisu v editoru Shoptetu (s rozměry v atributech a stylu).
const photo = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1400" height="934"%3E%3Crect width="1400" height="934" fill="%2378c5f1"/%3E%3C/svg%3E';
const perexWithImage = `<p><img src='${photo}' alt="Prádelna" width="300" height="200" style="width: 300px; float: left;"></p>
    <p>Úvodní popis kategorie s <a href="/odkaz">odkazem</a> a <strong>tučným textem</strong>, delší text na několik řádků.</p>`;

const page = (bestsellers = 5, {articles = false, layout = 'default', tint = false, image = false, tintColor = null, tintDark = false} = {}) => `<!doctype html><html lang="cs"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><style>
  *,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:sans-serif}.container{margin:0 auto;padding:0 20px}
  @media(min-width:768px){.container{width:747px}}@media(min-width:992px){.container{width:972px}}
  @media(min-width:1200px){.container{width:1178px}}@media(min-width:1440px){.container{width:1418px}}
  /* Disco: buňky podkategorií jsou plovoucí sloupce Bootstrapu */.subcategories li{float:left;width:25%}
  /* Disco: horní část kategorie má max. 1178 px */.category-top{max-width:1178px}
  ${css}${layout === 'default' ? '' : variantCss(layout)}</style>
  ${tintColor ? `<style>:root{--as-category-tint:${tintColor}}</style>` : ''}
  <script>window.asteroidConfig = Object.assign(window.asteroidConfig || {}, {categoryLayout: '${layout}', categoryTint: ${tint}, categoryTintDark: ${tintDark}});</script></head><body class="type-category one-column-body"><main id="content" class="container content">
  <div class="category-top">
    <h1 class="category-title">Šperky</h1>
    <div class="category-perex">${image ? perexWithImage : '<p>Úvodní popis kategorie s <a href="/odkaz">odkazem</a>.</p>'}</div>
    <ul class="subcategories with-image">${Array.from({length: 7}, (_, i) => subcategory(i + 1)).join('')}</ul>
    <div class="products-top-wrapper"><h2 class="products-top-header" id="productsTopHeading">Nejprodávanější</h2>
      <div id="productsTop" class="products products-inline products-top">${Array.from({length: bestsellers}, (_, i) => bestseller(i + 1)).join('')}</div>
      <div class="button-wrapper"><button class="btn">Zobrazit více</button></div></div>
  </div></main><script>window.__originalTop = document.querySelector('.category-top').outerHTML;</script>
  ${articles ? config : ''}<script>${js}</script></body></html>`;

const articleData = (articles, title = '') => ({categories: {[GUID]: {title, articles}}});
const serve = (p, data) => p.route(ARTICLES_URL, (route) => route.fulfill({
  contentType: 'application/json', headers: {'Access-Control-Allow-Origin': '*'}, body: JSON.stringify(data),
}));
const four = [
  {title: 'Jak vycvičit psa, aby poslouchal na slovo', url: '/poradna/vycvik/'},
  {title: 'Povely, které je dobré naučit vašeho psa a které se hodí i při procházce ve městě mezi lidmi', url: '/poradna/povely/'},
  {title: 'Jak pečovat o psí zdraví', url: '/poradna/zdravi/'},
  {title: 'Nejčastější nemoci psů', url: '/poradna/nemoci/'},
];

const box = (p, selector) => p.locator(selector).first().boundingBox();
const boxes = (p, selector) => p.locator(selector).evaluateAll((els) => els.map((el) => {
  const r = el.getBoundingClientRect();
  return {x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height)};
}));

test('subcategories fill the row as buttons of the same height', async ({page: p}) => {
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page());

  // Horní část vyplní celou šířku obsahu (Disco ji omezuje na 1178 px).
  expect(Math.round((await box(p, '.category-top')).width)).toBe(1378);

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

test('category articles sit beside the description on a desktop, in the stored order', async ({page: p}) => {
  await serve(p, articleData(four));
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page(5, {articles: true}));
  const block = p.locator('.category-top > .as-category-articles');
  await expect(block).toHaveCount(1);

  await expect(block.locator('.as-category-articles__title')).toHaveText('Články z poradny');
  expect(await block.locator('a').evaluateAll((links) => links.map((a) => a.getAttribute('href'))))
    .toEqual(four.map((a) => a.url));
  expect(await block.getAttribute('aria-labelledby')).toBe('as-category-articles-title');

  // Popis vlevo (820 px), blok vpravo za čarou, oba nahoře; podkategorie až pod nimi přes celou šířku.
  const title = await box(p, '.category-title');
  const perex = await box(p, '.category-perex');
  const articles = await box(p, '.as-category-articles');
  const subcategories = await box(p, '.subcategories');
  expect(Math.round(articles.y)).toBe(Math.round(title.y));
  // Popis hned pod nadpisem (výšku navíc z bloku článků nebere řádek nadpisu).
  expect(Math.round(perex.y - (title.y + title.height))).toBe(16);
  expect(articles.x).toBeGreaterThanOrEqual(perex.x + 820 + 64);
  expect(await block.evaluate((el) => getComputedStyle(el).borderLeftWidth)).toBe('1px');
  expect(subcategories.y).toBeGreaterThanOrEqual(articles.y + articles.height);
  expect(Math.round(subcategories.width)).toBe(1378);

  // Ikona 24 px vedle textu, dlouhý název se zalomí uvnitř bloku.
  const link = await box(p, '.as-category-articles a >> nth=1');
  const icon = await p.locator('.as-category-articles a').nth(1).evaluate((a) => {
    const style = getComputedStyle(a, '::before');
    return {width: style.width, mask: style.maskImage || style.webkitMaskImage};
  });
  expect(icon.width).toBe('24px');
  expect(icon.mask).toContain('svg');
  expect(link.height).toBeGreaterThan(30);
  expect(link.x + link.width).toBeLessThanOrEqual(articles.x + articles.width + 1);
});

test('category articles on a phone come after the description and before subcategories', async ({page: p}) => {
  await serve(p, articleData(four.slice(0, 1), 'Poradna'));
  await p.setViewportSize({width: 390, height: 844});
  await p.setContent(page(5, {articles: true}));
  await expect(p.locator('.as-category-articles')).toHaveCount(1);
  await expect(p.locator('.as-category-articles__title')).toHaveText('Poradna');
  expect(await p.locator('.category-perex + .as-category-articles + .subcategories').count()).toBe(1);
  const perex = await box(p, '.category-perex');
  const articles = await box(p, '.as-category-articles');
  expect(Math.round(articles.width)).toBe(350);
  expect(Math.round(articles.y - (perex.y + perex.height))).toBe(32);
});

test('no block without valid articles, unsafe links are dropped', async ({page: p}) => {
  await serve(p, articleData([{title: 'Cizí odkaz', url: 'https://jinde.test/'}, {title: '', url: '/prazdny/'}, {title: 'Skript', url: 'javascript:alert(1)'}]));
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page(5, {articles: true}));
  await p.waitForLoadState('networkidle');
  await expect(p.locator('.as-category-articles')).toHaveCount(0);
  // Bez bloku zůstává jeden sloupec (žádný prázdný sloupec vpravo).
  expect(await p.locator('.category-top').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(1);
});

test('no block when the file fails or has no entry for the category', async ({page: p}) => {
  await p.route(ARTICLES_URL, (route) => route.fulfill({status: 500, body: 'chyba'}));
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page(5, {articles: true}));
  await p.waitForLoadState('networkidle');
  await expect(p.locator('.as-category-articles')).toHaveCount(0);
});

// Shoptet po řazení / filtrování / stránkování (AJAX) vymění .category-top a vyvolá ShoptetDOMPageContentLoaded.
test('bestsellers and articles come back after Shoptet replaces the category content', async ({page: p}) => {
  await serve(p, articleData(four));
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page(5, {articles: true}));
  await expect(p.locator('.as-category-articles')).toHaveCount(1);
  await p.evaluate(() => {
    const top = document.querySelector('.category-top');
    const fresh = document.createElement('div');
    fresh.innerHTML = window.__originalTop;
    top.replaceWith(fresh.firstElementChild);
    document.dispatchEvent(new Event('ShoptetDOMPageContentLoaded'));
  });
  await expect(p.locator('.as-category-articles')).toHaveCount(1);
  await expect(p.locator('.as-bestsellers > #productsTop')).toHaveCount(1);
  expect(await p.locator('.as-detail-button').count()).toBe(5);
  await expect(p.locator('.products-top-wrapper > .button-wrapper')).toBeHidden();
});

// Vzhled popisu kategorie (nastavení categoryLayout, scss/variants/category-*.scss, js/category-intro.js).
// Obrázek je první obrázek v popisu; bez něj výchozí vzhled.
const intro = (p) => p.evaluate(() => {
  const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return {x: Math.round(b.x), y: Math.round(b.y), right: Math.round(b.right), bottom: Math.round(b.bottom), width: Math.round(b.width), height: Math.round(b.height)}; };
  const band = getComputedStyle(document.querySelector('.category-top'), '::before');
  const figure = document.querySelector('.as-category-intro__media');
  return {
    figure: r('.as-category-intro__media'), title: r('.category-title'), perex: r('.category-perex'), articles: r('.as-category-articles'), subcategories: r('.subcategories'),
    radius: figure && getComputedStyle(figure).borderTopLeftRadius, alt: figure?.querySelector('img').alt,
    perexImages: document.querySelectorAll('.category-perex img').length, emptyParagraphs: [...document.querySelectorAll('.category-perex p')].filter((el) => !el.textContent.trim()).length,
    band: {content: band.content, width: Math.round(parseFloat(band.width)), background: band.backgroundColor},
    titleColor: getComputedStyle(document.querySelector('.category-title')).color, marginTop: getComputedStyle(document.querySelector('.category-top')).marginTop,
    listColumns: document.querySelector('.as-category-articles__list') && getComputedStyle(document.querySelector('.as-category-articles__list')).columnCount,
  };
});

test('category layout "image": first description image beside the text, articles below it', async ({page: p}) => {
  await serve(p, articleData(four));
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page(3, {articles: true, layout: 'image', image: true}));
  await expect(p.locator('.as-category-articles')).toHaveCount(1);
  const d = await intro(p);
  // Obrázek přesunutý z popisu (jen jednou, bez prázdného odstavce), alt zůstává.
  expect(d.perexImages).toBe(0);
  expect(d.emptyParagraphs).toBe(0);
  expect(d.alt).toBe('Prádelna');
  // Vpravo se zaoblením 20 px v poměru 700 : 467, text vlevo, mezera 72 px, obsah končí s obsahem stránky.
  expect(d.radius).toBe('20px');
  expect(Math.abs(d.figure.width / d.figure.height - 700 / 467)).toBeLessThan(0.02);
  expect(d.figure.x - d.perex.right).toBeGreaterThanOrEqual(72);
  expect(d.figure.right).toBe(1409);
  // Články pod popisem za čarou ve dvou sloupcích, text svisle na střed vůči obrázku.
  expect(d.articles.y).toBeGreaterThan(d.perex.bottom);
  expect(d.articles.x).toBe(d.perex.x);
  expect(d.listColumns).toBe('2');
  expect(Math.abs((d.title.y + d.articles.bottom) / 2 - (d.figure.y + d.figure.bottom) / 2)).toBeLessThan(30);
  expect(d.subcategories.y).toBeGreaterThanOrEqual(Math.max(d.figure.bottom, d.articles.bottom));
  // Bez světlého pozadí žádný pruh.
  expect(d.band.content).toBe('none');
});

test('category layout "image" on a phone: image on top, then title, description and articles in one column', async ({page: p}) => {
  await serve(p, articleData(four));
  await p.setViewportSize({width: 390, height: 844});
  await p.setContent(page(3, {articles: true, layout: 'image', image: true}));
  await expect(p.locator('.as-category-articles')).toHaveCount(1);
  const d = await intro(p);
  expect(d.figure.width).toBe(350);
  expect(d.title.y).toBeGreaterThanOrEqual(d.figure.bottom + 24);
  expect(d.articles.y).toBeGreaterThan(d.perex.bottom);
  expect(d.listColumns).toBe('auto');
  expect(d.subcategories.y).toBeGreaterThanOrEqual(d.articles.bottom);
});

test('category layout "image-wide" reaches the window edge; light background is a full-width band', async ({page: p}) => {
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page(3, {layout: 'image-wide', tint: true, image: true}));
  await expect(p.locator('.as-category-intro__media')).toHaveCount(1);
  let d = await intro(p);
  expect(d.figure.right).toBe(1440);
  expect(d.radius).toBe('0px');
  expect(d.band.width).toBe(1440);
  expect(d.band.background).not.toBe('rgba(0, 0, 0, 0)');
  // Pruh navazuje na drobečky (vyrovnává odsazení #content Disca 20 px).
  expect(d.marginTop).toBe('-20px');
  // Obrázek vyplní pruh na výšku, text uvnitř pruhu aspoň 64 px od okraje.
  expect(d.title.y - d.figure.y).toBeGreaterThanOrEqual(64);

  await p.setViewportSize({width: 390, height: 844});
  // --as-viewport-width nastavuje ResizeObserver (js/viewport.js) až po vykreslení nové šířky.
  await p.waitForFunction(() => document.documentElement.style.getPropertyValue('--as-viewport-width') === '390px');
  d = await intro(p);
  expect([d.figure.x, d.figure.width]).toEqual([0, 390]);
  expect(d.title.y).toBeGreaterThan(d.figure.bottom);
});

test('category layout "background": image behind the text across the window, text in white', async ({page: p}) => {
  await serve(p, articleData(four));
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page(3, {articles: true, layout: 'background', image: true}));
  await expect(p.locator('.as-category-articles')).toHaveCount(1);
  const d = await intro(p);
  expect([d.figure.x, d.figure.width]).toEqual([0, 1440]);
  expect(d.titleColor).toBe('rgb(255, 255, 255)');
  // Pruh od textu 80 px nahoře, články vpravo vedle popisu, výšku určuje text (ne rozměr obrázku).
  expect(d.title.y - d.figure.y).toBe(80);
  expect(d.articles.x).toBeGreaterThan(d.perex.right);
  expect(d.figure.bottom).toBeLessThan(d.articles.bottom + 200);
  expect(d.subcategories.y).toBeGreaterThan(d.figure.bottom);
});

test('category without an image in the description keeps the default look in every layout', async ({browser}) => {
  for (const layout of ['background', 'image', 'image-wide']) {
    // Vlastní stránka: setContent ponechává window, skript šablony by se podruhé nespustil.
    const p = await browser.newPage({viewport: {width: 1440, height: 900}});
    await p.setContent(page(3, {layout, tint: true}));
    const d = await intro(p);
    expect(d.figure).toBeNull();
    expect(d.band.content).toBe('none');
    expect(d.marginTop).toBe('32px');
    // Bez článků popis přes celou šířku obsahu.
    expect(d.perex.width).toBe(1378);
    await p.close();
  }
});

test('reserved image space: the text does not move when the image is moved out of the description', async ({browser}) => {
  const measure = async (withScript) => {
    const p = await browser.newPage({viewport: {width: 1440, height: 900}});
    // Stav před přesunem obrázku: třídy na <html> jako od skriptu šablony, obrázek ještě v popisu.
    const html = page(3, {layout: 'image', image: true});
    await p.setContent(withScript ? html : html.replace(`<script>${js}</script>`, '')
      .replace('<html lang="cs">', '<html lang="cs" class="as-theme as-category-image" style="--as-viewport-width: 1440px">'));
    const d = await intro(p);
    await p.close();
    return d;
  };
  const before = await measure(false);
  const after = await measure(true);
  expect(before.figure).toBeNull();
  expect(after.figure).not.toBeNull();
  expect(after.title).toEqual(before.title);
  expect(after.subcategories.y).toBe(before.subcategories.y);
});

test('description image comes back after Shoptet replaces the category content (AJAX)', async ({page: p}) => {
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page(3, {layout: 'image', image: true}));
  await expect(p.locator('.as-category-intro__media')).toHaveCount(1);
  await p.evaluate(() => {
    const fresh = document.createElement('div');
    fresh.innerHTML = window.__originalTop;
    document.querySelector('.category-top').replaceWith(fresh.firstElementChild);
    document.dispatchEvent(new Event('ShoptetDOMPageContentLoaded'));
  });
  await expect(p.locator('.as-category-intro__media')).toHaveCount(1);
  expect((await intro(p)).perexImages).toBe(0);
});

test('custom background colour from the settings; on a dark colour the text is white', async ({page: p}) => {
  await serve(p, articleData(four));
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page(3, {articles: true, layout: 'image', tint: true, image: true, tintColor: '#1e3a5f', tintDark: true}));
  await expect(p.locator('.as-category-articles')).toHaveCount(1);
  const d = await intro(p);
  expect(d.band.background).toBe('rgb(30, 58, 95)');
  expect(d.titleColor).toBe('rgb(255, 255, 255)');
  const colors = await p.evaluate(() => [
    getComputedStyle(document.querySelector('.category-perex')).color,
    getComputedStyle(document.querySelector('.as-category-articles__list a')).color,
    getComputedStyle(document.querySelector('.as-category-articles__list a'), '::before').color,
  ]);
  expect(colors).toEqual(['rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)']);
});
