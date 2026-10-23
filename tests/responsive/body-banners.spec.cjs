// Banner Střed vedle produktové sekce (components/_body-banners.scss). Minimální stránka podle
// skutečného pořadí v obsahu úvodní stránky Disca: sekce 1, blok .body-banners, sekce 2, sekce 3.
// Kontroluje jen rozložení CSS, slider Shoptetu ani počet karet se zde neověřuje.
const fs = require('node:fs');
const path = require('node:path');
const {test, expect} = require('@playwright/test');

const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
const css = fs.readFileSync(path.join(dist, 'asteroid.css'), 'utf8');
const image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="3840" height="1400"%3E%3Crect width="3840" height="1400" fill="%23e6e8eb"/%3E%3C/svg%3E';

const section = (n) => `<div class="homepage-group-title homepage-products-heading-${n} h4">Sekce ${n}</div>
  <div class="products-wrapper product-slider-holder"><div class="products product-slider" data-columns="6"><div style="height:440px"></div></div></div>`;

const page = (layout) => `<!doctype html><html lang="cs" class="as-theme as-middle-banners-${layout}"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><style>
  *,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:sans-serif}.container{margin:0 auto;padding:0 20px}
  /* Disco: obal slideru má width: 100 % */.product-slider-holder{width:100%}
  @media(min-width:1200px){.container{width:1178px}}@media(min-width:1440px){.container{width:1418px}}
  ${css}</style></head><body class="type-index"><main id="content" class="container content">
  ${section(1)}
  <div class="row banners-content body-banners"><div class="col-sm-12"><div class="banner-wrapper"><a href="/nabidka"><img src='${image}' alt="" width="3840" height="1400"><span class="extended-banner-texts"><span class="extended-banner-title">Na svatbu</span><span class="extended-banner-text">Nezapomenutelné chvíle</span><span class="extended-banner-link">Vše pro svatbu</span></span></a></div></div></div>
  ${section(2)}
  ${section(3)}
  </main></body></html>`;

const box = (p, selector) => p.locator(selector).first().boundingBox();

for (const layout of ['left', 'right']) {
  test(`middle banner sits ${layout} of the following section on a wide desktop`, async ({page: p}) => {
    await p.setViewportSize({width: 1440, height: 900});
    await p.setContent(page(layout));
    const banner = await box(p, '.body-banners');
    const heading = await box(p, '.homepage-products-heading-2');
    const products = await box(p, '.body-banners + .homepage-group-title + .products-wrapper');
    const next = await box(p, '.homepage-products-heading-3');

    expect(Math.round(banner.width)).toBe(434);
    expect(Math.round(heading.y)).toBe(Math.round(banner.y));
    expect(Math.round(products.width)).toBe(Math.round(heading.width));
    if (layout === 'left') expect(heading.x).toBeGreaterThanOrEqual(banner.x + banner.width + 39);
    else expect(heading.x + heading.width).toBeLessThanOrEqual(banner.x - 39);
    // Další sekce začíná až pod bannerem i pod užší sekcí.
    expect(next.y).toBeGreaterThanOrEqual(Math.max(banner.y + banner.height, products.y + products.height));
    // Tlačítko banneru je u spodního okraje.
    const link = await box(p, '.body-banners .extended-banner-link');
    expect(Math.round(banner.y + banner.height - (link.y + link.height))).toBe(44);
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('middle banner stays above the section below 1200px', async ({page: p}) => {
  await p.setViewportSize({width: 1024, height: 800});
  await p.setContent(page('left'));
  const banner = await box(p, '.body-banners');
  const heading = await box(p, '.homepage-products-heading-2');
  expect(heading.y).toBeGreaterThanOrEqual(banner.y + banner.height);
  expect(await p.locator('.body-banners').evaluate((el) => getComputedStyle(el).float)).toBe('none');
});
