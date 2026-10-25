// Rozložení podle Figmy; markupy řazení a stránkování jsou ze skutečného Disca (25. 10. 2026).
// Nativní AJAX se ověřuje samostatně na e-shopu, zde se nenahrazuje imitací obsluhy.
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
const css = ['base-blank.css', 'asteroid.css'].map(name => fs.readFileSync(path.join(dist, name), 'utf8')).join('\n');

function html(sidebar = false) {
  return `<!doctype html><html class="as-theme" lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head>
<body class="type-category sidebar-indented"><main id="content" class="content container">
<div class="category-top"><h1 class="category-title">Kategorie</h1></div>
<aside class="sidebar sidebar-left"><h2 class="sr-only">Postranní panel</h2><div class="sidebar-inner sidebar-filters-wrapper"><div class="box box-categories">${sidebar ? '<p>Obsah postranního sloupce</p>' : ''}</div></div></aside>
<div class="category-content-wrapper"><div id="category-header" class="category-header">
<div class="category-header-pagination">Stránka <strong>1</strong> z <strong>2</strong> – <strong>13</strong> položek celkem</div>
<div class="listSorting listSorting--dropdown js-listSorting"><button class="sortingToggle" type="button" aria-controls="listSortingControls" aria-expanded="false">Řadit podle: Nejprodávanější</button>
<div id="listSortingControls" class="listSorting__controls listSorting__controls--dropdown" role="menu">${['Nejprodávanější', 'Nejlevnější', 'Nejdražší', 'Abecedně'].map((name, i) => `<button type="button" class="listSorting__control ${i ? '' : 'listSorting__control--current'}" data-sort="${i}" data-url="/kategorie/?order=${i}">${name}</button>`).join('')}</div></div></div>
<h2 class="sr-only" id="productsListHeading">Výpis produktů</h2><div id="products" class="products products-page products-block">${Array.from({length: 8}, (_, i) => `<div class="product"><div class="p">Produkt ${i + 1}</div></div>`).join('')}</div>
<div class="listingControls"><h3 class="sr-only">Ovládací prvky výpisu</h3><div class="loadMore"><button class="loadMore__button loadMore__button--products btn btn-secondary js-loadMore__button--products" data-url="/kategorie/strana-2/" type="button">Načíst další 4</button></div>
<nav class="pagination"><h4 class="sr-only">Stránkování</h4><ul class="pagination__list"><li><strong class="pagination__currentPage" aria-current="page">1</strong></li><li><a class="pagination__link pagination__link--next btn btn-secondary" href="/kategorie/strana-2/" aria-label="Další"></a></li><li><a class="pagination__link pagination__link--last" href="/kategorie/strana-2/">2</a></li></ul></nav>
<div class="itemsTotal">13 položek celkem</div><div class="goToTop"><a class="goToTop__button btn btn-secondary" href="#productsListHeading">Nahoru</a></div></div></div></main></body></html>`;
}

test('desktop: sidebar 262px, gap 22px, four product columns, 48px listing controls', async ({page}) => {
  await page.setViewportSize({width: 1920, height: 1080});
  await page.setContent(html(true));
  const sidebar = await page.locator('.sidebar').boundingBox();
  const content = await page.locator('.category-content-wrapper').boundingBox();
  expect(sidebar.width).toBe(262);
  expect(content.x - sidebar.x - sidebar.width).toBe(22);
  const items = await page.locator('#products > .product').evaluateAll(els => els.map(e => e.getBoundingClientRect().toJSON()));
  expect(new Set(items.slice(0, 4).map(e => e.y)).size).toBe(1);
  expect(items[4].y).toBeGreaterThan(items[0].y);
  for (const selector of ['.loadMore__button', '.goToTop__button', '.pagination__currentPage', '.pagination__link', '.pagination']) {
    const heights = await page.locator(selector).evaluateAll(els => els.map(e => e.getBoundingClientRect().height));
    heights.forEach(height => expect(height).toBe(48));
  }
  const [up, more, pages] = await Promise.all(['.goToTop', '.loadMore', '.pagination'].map(sel => page.locator(sel).boundingBox()));
  expect(up.y).toBe(more.y);
  expect(more.y).toBe(pages.y);
  expect(up.x).toBeLessThan(more.x);
  expect(more.x).toBeLessThan(pages.x);
});

test('empty sidebar does not reserve an empty column', async ({page}) => {
  await page.setViewportSize({width: 1920, height: 1080});
  await page.setContent(html(false));
  await expect(page.locator('.sidebar')).toBeHidden();
  const top = await page.locator('.category-top').boundingBox();
  const content = await page.locator('.category-content-wrapper').boundingBox();
  expect(content.x).toBe(top.x);
  expect(content.width).toBe(top.width);
});

test('responsive: controls stay available and the document never overflows', async ({page}) => {
  await page.setContent(html(true));
  for (const width of [320, 390, 767, 768, 991, 992, 1199, 1200, 1920]) {
    await page.setViewportSize({width, height: 900});
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${width}px`).toBeLessThanOrEqual(1);
    await expect(page.locator('.loadMore__button')).toBeVisible();
    await expect(page.locator('.pagination')).toBeVisible();
    await expect(page.locator('.goToTop__button')).toBeVisible();
    if (width < 768) {
      await expect(page.locator('.sortingToggle')).toBeHidden();
      await expect(page.locator('.listSorting__controls')).toBeVisible();
      expect(await page.locator('.listSorting__controls').evaluate(el => getComputedStyle(el).overflowX)).toBe('auto');
    } else {
      await expect(page.locator('.sortingToggle')).toBeHidden();
      await expect(page.locator('.listSorting__control').first()).toBeVisible();
    }
  }
});


test('filter collapse survives a native AJAX content replacement without duplicate controls', async ({page}) => {
  const filters = fs.readFileSync(path.join(__dirname, 'fixtures/category-filters.html'), 'utf8');
  const js = fs.readFileSync(path.join(dist, 'asteroid.js'), 'utf8');
  await page.setViewportSize({width: 1920, height: 1080});
  await page.setContent(html(false).replace('<div class="box box-categories"></div>', filters));
  await page.addScriptTag({content: js});
  await expect(page.locator('.as-filter-toggle')).toHaveCount(2);
  await page.locator('.slider-wrapper .as-filter-toggle').click();
  await expect(page.locator('.slider-header')).toBeHidden();
  await expect(page.locator('.slider-wrapper .as-filter-toggle')).toHaveAttribute('aria-expanded', 'false');
  await page.evaluate(markup => {
    document.querySelector('.box-filters').outerHTML = markup;
    document.dispatchEvent(new CustomEvent('ShoptetDOMPageContentLoaded'));
    document.dispatchEvent(new CustomEvent('ShoptetDOMPageContentLoaded'));
  }, filters);
  await expect(page.locator('.as-filter-toggle')).toHaveCount(2);
  await expect(page.locator('.slider-header')).toBeHidden();
  await page.locator('.slider-wrapper .as-filter-toggle').click();
  await expect(page.locator('.slider-header')).toBeVisible();
  // Původní formulář a inputy zůstávají integračním rozhraním Shoptetu.
  await expect(page.locator('#price-filter-form')).toHaveAttribute('action', '/action/ProductsListing/setPriceFilter/');
  await expect(page.locator('#stock')).toHaveAttribute('data-url', '/pletene-kosiky/?stock=1');
});
