// Banner Střed vedle produktové sekce (js/homepage-banners.js, components/_body-banners.scss).
// Minimální stránka podle skutečného pořadí v obsahu úvodní stránky Disca: sekce 1, blok
// .body-banners se všemi bannery Střed, sekce 2 a 3, a měřicí #trackingScript Shoptetu.
// Kontroluje přiřazení podle názvu a rozložení, slider Shoptetu se zde nespouští (jen data-columns).
const fs = require('node:fs');
const path = require('node:path');
const {test, expect} = require('@playwright/test');

const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
const css = fs.readFileSync(path.join(dist, 'asteroid.css'), 'utf8');
const js = fs.readFileSync(path.join(dist, 'asteroid.js'), 'utf8');
const image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="434" height="509"%3E%3Crect width="434" height="509" fill="%23e6e8eb"/%3E%3C/svg%3E';

const section = (n, title) => `<div class="homepage-group-title homepage-products-heading-${n} h4">${title}</div>
  <div class="products-wrapper product-slider-holder"><div class="products product-slider" data-columns="6"><div style="height:440px"></div></div></div>`;

// Interní název banneru je jen v měřicích datech Shoptetu (klíčem je data-ec-promo-id).
const tracking = JSON.stringify({products: {}, banners: {
  258: {id: 'banner19', name: 'Omrkni nové kousky [L]', position: 'indexPageBody'},
  261: {id: 'banner20', name: 'Bez značky', position: 'indexPageBody'},
}}).replace(/"/g, '&quot;');

const linked = (id, title) => `<div class="banner-wrapper"><a href="/nabidka" data-ec-promo-id="${id}"><img src='${image}' alt="${title}" width="434" height="509"><span class="extended-banner-texts"><span class="extended-banner-title">${title}</span><span class="extended-banner-text">Nezapomenutelné chvíle</span><span class="extended-banner-link">Vše pro svatbu</span></span></a></div>`;

const page = () => `<!doctype html><html lang="cs"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><style>
  *,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:sans-serif}.container{margin:0 auto;padding:0 20px}
  /* Disco: obal slideru má width: 100 %, odkaz banneru inline-block */.product-slider-holder{width:100%}.banners-content a{display:inline-block;position:relative}
  @media(min-width:768px){.container{width:747px}}@media(min-width:992px){.container{width:972px}}
  @media(min-width:1200px){.container{width:1178px}}@media(min-width:1440px){.container{width:1418px}}
  ${css}</style></head><body class="type-index"><main id="content" class="container content">
  ${section(1, 'Omrkni nové kousky')}
  <div class="row banners-content body-banners">
    <div class="col-sm-4"><div class="banner-wrapper"><img src='${image}' alt="Novinky, které  musíš mít [R]" width="434" height="509"></div></div>
    <div class="col-sm-4">${linked(258, 'Omrkni nové kousky [L]')}</div>
    <div class="col-sm-4">${linked(261, 'Na svatbu')}</div>
  </div>
  ${section(2, 'Novinky, které musíš mít')}
  ${section(3, 'Pro vaši vysněnou svatbu')}
  </main><script id="trackingScript" data-products="${tracking}"></script><script>${js}</script></body></html>`;

const box = (p, selector) => p.locator(selector).first().boundingBox();

test('middle banners sit beside the sections named in them on a wide desktop', async ({page: p}) => {
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(page());

  const left = await box(p, '.as-section-banner--left');
  const right = await box(p, '.as-section-banner--right');
  const first = await box(p, '.homepage-products-heading-1');
  const firstProducts = await box(p, '.homepage-products-heading-1 + .products-wrapper');
  const second = await box(p, '.homepage-products-heading-2');
  const secondProducts = await box(p, '.homepage-products-heading-2 + .products-wrapper');
  const third = await box(p, '.homepage-products-heading-3');

  // Banner z interního názvu vlevo od první sekce, banner bez odkazu (značka v alt) vpravo od druhé.
  expect(await p.locator('.as-section-banner--left + .homepage-products-heading-1').count()).toBe(1);
  expect(await p.locator('.as-section-banner--right + .homepage-products-heading-2').count()).toBe(1);
  expect(Math.round(left.width)).toBe(434);
  expect(Math.round(right.width)).toBe(434);
  expect(Math.round(first.y)).toBe(Math.round(left.y));
  expect(first.x).toBeGreaterThanOrEqual(left.x + left.width + 39);
  expect(Math.round(firstProducts.width)).toBe(Math.round(first.width));
  expect(second.x + second.width).toBeLessThanOrEqual(right.x - 39);
  expect(Math.round(secondProducts.width)).toBe(Math.round(second.width));
  // Druhý banner i další sekce začínají až pod předchozím bannerem.
  expect(right.y).toBeGreaterThanOrEqual(left.y + left.height);
  expect(third.y).toBeGreaterThanOrEqual(Math.max(right.y + right.height, secondProducts.y + secondProducts.height));

  // Tlačítko banneru je u spodního okraje.
  const link = await box(p, '.as-section-banner--left .extended-banner-link');
  expect(Math.round(left.y + left.height - (link.y + link.height))).toBe(44);

  // Značka se zákazníkům nezobrazuje.
  expect(await p.locator('.as-section-banner--left .extended-banner-title').textContent()).toBe('Omrkni nové kousky');
  expect(await p.locator('.as-section-banner--right img').getAttribute('alt')).toBe('Novinky, které  musíš mít');

  // Sekce vedle banneru mají o dva produkty méně.
  const columns = await p.locator('.product-slider').evaluateAll((els) => els.map((el) => el.dataset.columns));
  expect(columns).toEqual(['4', '4', '6']);

  // Banner bez značky zůstává v původním bloku Shoptetu, prázdné sloupce zmizí.
  expect(await p.locator('#content > .body-banners:not(.as-section-banner) .banner-wrapper').count()).toBe(1);
  expect(await p.locator('#content > .body-banners:not(.as-section-banner) > [class*="col-"]').count()).toBe(1);

  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('a narrower middle banner sits beside its section between 992 and 1199px', async ({page: p}) => {
  await p.setViewportSize({width: 1024, height: 800});
  await p.setContent(page());
  const banner = await box(p, '.as-section-banner--left');
  const heading = await box(p, '.homepage-products-heading-1');
  expect(Math.round(banner.width)).toBe(300);
  expect(Math.round(heading.y)).toBe(Math.round(banner.y));
  expect(heading.x).toBeGreaterThanOrEqual(banner.x + banner.width + 39);
  // Obrázek se neořezává, drží poměr stran z návrhu.
  expect(Math.round(banner.height)).toBe(Math.round(300 * 509 / 434));
  const columns = await p.locator('.product-slider').evaluateAll((els) => els.map((el) => el.dataset.columns));
  expect(columns).toEqual(['4', '4', '6']);
});

test('middle banner stays above its section on a tablet', async ({page: p}) => {
  await p.setViewportSize({width: 800, height: 1000});
  await p.setContent(page());
  const banner = await box(p, '.as-section-banner--left');
  const heading = await box(p, '.homepage-products-heading-1');
  expect(heading.y).toBeGreaterThanOrEqual(banner.y + banner.height);
  expect(Math.round(banner.width)).toBe(434);
  // Uprostřed šířky sekce.
  expect(Math.abs(banner.x + banner.width / 2 - (heading.x + heading.width / 2))).toBeLessThanOrEqual(1);
  expect(await p.locator('.as-section-banner--left').evaluate((el) => getComputedStyle(el).float)).toBe('none');
  const columns = await p.locator('.product-slider').evaluateAll((els) => els.map((el) => el.dataset.columns));
  expect(columns).toEqual(['6', '6', '6']);
});

test('middle banners fit the phone width', async ({page: p}) => {
  await p.setViewportSize({width: 375, height: 800});
  await p.setContent(page());
  const banner = await box(p, '.as-section-banner--left');
  expect(banner.width).toBeLessThanOrEqual(375);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

// Bannery ze Zápatí: mozaika podle čísel, banner sekce podle [R], banner bez značky zůstává v zápatí.
const svg = (w, h) => `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"%3E%3Crect width="${w}" height="${h}" fill="%23e6e8eb"/%3E%3C/svg%3E`;
const footerBanner = (alt, w, h) => `<div class="footer-banner col-sm-12 col-lg-2"><img src='${svg(w, h)}' alt="${alt}" width="${w}" height="${h}"></div>`;

const footerPage = () => `<!doctype html><html lang="cs"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><style>
  *,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:sans-serif}.container{margin:0 auto;padding:0 20px}
  .product-slider-holder{width:100%}.footer-banner{float:left;width:16.66%;padding:0 10px}
  @media(min-width:768px){.container{width:747px}}@media(min-width:992px){.container{width:972px}}
  @media(min-width:1200px){.container{width:1178px}}@media(min-width:1440px){.container{width:1418px}}
  ${css}</style></head><body class="type-index admin-logged"><main id="content" class="container content">
  ${section(1, 'Omrkni nové kousky')}
  ${section(2, 'Novinky, které musíš mít')}
  <div class="footer-banners row banner-wrapper banners-row">
    ${footerBanner('Sluchátka [3]', 920, 480)}${footerBanner('Novinky, které musíš mít [R]', 434, 509)}
    ${footerBanner('Makita [1]', 920, 1000)}${footerBanner('Fotoaparát [4]', 920, 1000)}
    ${footerBanner('Kosmetika [2]', 920, 480)}${footerBanner('Recenze', 920, 480)}
  </div>
  </main><script id="trackingScript" data-products="{}"></script><script>${js}</script></body></html>`;

test('numbered footer banners form the mosaic under the first section', async ({page: p}) => {
  await p.setViewportSize({width: 1440, height: 900});
  await p.setContent(footerPage());

  // Pořadí podle čísel, mozaika hned za prvním pásem produktů.
  expect(await p.locator('.homepage-products-heading-1 + .products-wrapper + .as-banner-mosaic').count()).toBe(1);
  expect(await p.locator('.as-banner-mosaic img').evaluateAll((els) => els.map((el) => el.alt))).toEqual(['Makita', 'Kosmetika', 'Sluchátka', 'Fotoaparát']);

  const boxes = await p.locator('.as-banner-mosaic > *').evaluateAll((els) => els.map((el) => el.getBoundingClientRect()).map(({x, y, width, height}) => ({x, y, width, height})));
  const [tall1, low2, low3, tall4] = boxes;
  // Vysoký vlevo, dva nízké pod sebou uprostřed, vysoký vpravo, mezery 20 px.
  expect(Math.abs(low2.x - (tall1.x + tall1.width) - 20)).toBeLessThanOrEqual(1);
  expect(Math.abs(low2.x - low3.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(low3.y - (low2.y + low2.height) - 20)).toBeLessThanOrEqual(1);
  expect(Math.abs(tall4.x - (low2.x + low2.width) - 20)).toBeLessThanOrEqual(1);
  expect(Math.abs(tall1.height - (low3.y + low3.height - low2.y))).toBeLessThanOrEqual(1);
  expect(Math.abs(low2.width / low2.height * 240 - 460)).toBeLessThanOrEqual(2);

  // [R] u své sekce, banner bez značky zůstává v zápatí, štítky pro admina.
  expect(await p.locator('.as-section-banner--right + .homepage-products-heading-2').count()).toBe(1);
  expect(await p.locator('#content > .footer-banners .footer-banner img').evaluateAll((els) => els.map((el) => el.alt))).toEqual(['Recenze']);
  expect(await p.locator('.as-banner-mosaic > *').first().getAttribute('data-as-admin-label')).toContain('pozice 1');
  expect(await p.locator('.as-banner-mosaic > *').first().evaluate((el) => getComputedStyle(el, '::after').content)).toContain('Mozaika');

  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('mosaic banners stack uncropped on a phone', async ({page: p}) => {
  await p.setViewportSize({width: 375, height: 800});
  await p.setContent(footerPage());
  const items = await p.locator('.as-banner-mosaic img').evaluateAll((els) => els.map((el) => {
    const r = el.getBoundingClientRect();
    return {ratio: r.width / r.height, natural: el.naturalWidth / el.naturalHeight, x: r.x, width: r.width};
  }));
  for (const item of items) {
    expect(Math.abs(item.ratio - item.natural)).toBeLessThan(0.02);
    expect(item.x + item.width).toBeLessThanOrEqual(376);
  }
});
