// Audit stejného vzhledu komponent na desktopu a mobilu (pravidlo „vzhled mimo breakpointy“).
// Na skutečném e-shopu změří u každé komponenty vizuální vlastnosti na 1920 a 390 px a vypíše rozdíly.
// Rozložení (šířky, odsazení, pozice) se neporovnává, velikost jen tam, kde má být stejná.
//
//   npm run audit
//
// Položka: [název, stránka, selektor desktop, selektor mobil (výchozí stejný), {akce}]

const { chromium } = require('playwright-core');

const SHOP = process.env.SHOP_URL || 'https://313980.myshoptet.com';
const VISUAL = ['color', 'backgroundColor', 'fontFamily', 'fontWeight', 'fontStyle', 'textTransform', 'textDecorationLine',
  'borderTopLeftRadius', 'borderTopWidth', 'borderTopColor', 'boxShadow', 'letterSpacing',
  'textAlign'];
const SIZE = ['fontSize', 'lineHeight'];
const ICON = (pseudo) => ({ pseudo, props: ['maskImage', 'backgroundColor', 'color'] });

const DETAIL = '/zbozi/dreveny-privesek-bracken-pendant-6/';
const ITEMS = [
  // Hlavička
  ['Hlavička: ikona košíku', '/', '#header .navigation-buttons [data-target="cart"]', null, { pseudo: '::before', props: ['maskImage', 'backgroundColor'] }],
  ['Hlavička: ikona účtu', '/', '#header .as-account-button', null, { pseudo: '::before', props: ['maskImage', 'backgroundColor'] }],
  ['Košík: ikona účtu v hlavičce', '/kosik/', '#header .as-account-button', null, { pseudo: '::before', props: ['maskImage', 'backgroundColor'] }],
  ['Hlavička: pole hledání', '/', '#header .search-input', null, { size: true }],
  ['Hlavička: lupa ve formuláři', '/', '#header .search-button', null, { pseudo: '::before', props: ['maskImage', 'backgroundColor'] }],
  ['Informační lišta', '/', '.site-msg.information', null, { size: true }],
  ['Informační lišta: text', '/', '.site-msg.information .text', null, { size: true }],
  ['Informační lišta: křížek', '/', '.site-msg.information .close', null, { pseudo: '::before', props: ['maskImage', 'backgroundColor'] }],
  // Menu
  ['Výběr měny: položka nabídky', '/', '.top-navigation-tools .dropdown-menu a', '#navigation .navigationActions .menu-level-2 a', { open: { mobile: 'menu' } }],
  ['Výběr měny: značka položky', '/', '.top-navigation-tools .dropdown-menu li', '#navigation .navigationActions .menu-level-2 li li', { open: { mobile: 'menu' }, pseudo: '::before', props: ['content'] }],
  ['Výběr měny: text v liště', '/', '.top-navigation-tools .dropdown > button', '#navigation .navigationActions > li.ext > a > span', { open: { mobile: 'menu' }, props: ['textDecorationLine', 'fontSize', 'color'] }],
  ['Výběr měny: odsazení položky', '/', '.top-navigation-tools .dropdown-menu a', '#navigation .navigationActions .menu-level-2 a', { open: { mobile: 'menu' }, props: ['marginLeft', 'paddingLeft', 'paddingTop'] }],
  ['Výběr měny: panel nabídky', '/', '.top-navigation-tools .dropdown-menu', '#navigation .navigationActions .menu-level-2', { open: { mobile: 'menu' } }],
  // Řádky menu mají na mobilu jiné rozložení (výška, odsazení, šipka) podle návrhu, porovnává se písmo a barvy.
  ['Menu: kategorie', '/', '#navigation .menu-level-1 > li > a', null, { open: { desktop: 'catalog', mobile: 'menu' }, props: ['color', 'fontFamily', 'fontWeight', 'textTransform', 'textDecorationLine'] }],
  ['Menu: rychlý odkaz', '/', '#header > .as-quicklinks a', '#navigation .as-quicklinks a', { open: { mobile: 'menu' }, props: ['color', 'fontFamily', 'fontWeight', 'textTransform', 'textDecorationLine'] }],
  ['Menu: ikona rychlého odkazu', '/', '#header > .as-quicklinks .as-icon', '#navigation .as-quicklinks .as-icon', { open: { mobile: 'menu' }, props: ['maskImage', 'backgroundColor'] }],
  // Našeptávač
  ['Našeptávač: název produktu', '/', '.searchWhisperer__product__name', null, { size: true, search: 'test' }],
  ['Našeptávač: cena', '/', '.searchWhisperer__product__price', null, { size: true, search: 'test' }],
  ['Našeptávač: odkaz článku', '/', '.searchWhisperer__additionalResults__link', null, { size: true, search: 'test' }],
  // Bannery a sekce úvodní stránky (texty carouselu hlídá test, na e-shopu jsou v obrázcích)
  ['Banner u sekce: rámeček', '/', '.as-section-banner .banner-wrapper, .as-section-banner .footer-banner', null, {}],
  ['Mozaika: dlaždice', '/', '.as-banner-mosaic__item', null, {}],
  ['Kategorie na úvodní stránce: karta', '/', '.as-home-categories li > a', null, {}],
  ['Kategorie na úvodní stránce: název', '/', '.as-home-categories li .text', null, { size: true }],
  ['Nadpis sekce úvodní stránky', '/', '.homepage-group-title', null, {}],
  // Stránka kategorie
  ['Kategorie: nadpis', '/sperky/', '.category-top .category-title', null, {}],
  ['Kategorie: popis', '/sperky/', '.category-top .category-perex', null, {}],
  ['Kategorie: podkategorie', '/sperky/', '.category-top .subcategories a', null, {}],
  ['Kategorie: šipka podkategorie', '/sperky/', '.category-top .subcategories a', null, { pseudo: '::after', props: ['maskImage', 'backgroundColor', 'color'] }],
  ['Kategorie: název podkategorie', '/sperky/', '.category-top .subcategories .text', null, { size: true }],
  ['Nejprodávanější: nadpis', '/sperky/', '.products-top-header', null, {}],
  ['Nejprodávanější: karta', '/sperky/', '#productsTop .product .p', null, {}],
  ['Nejprodávanější: název', '/sperky/', '#productsTop .product .name', null, { size: true }],
  ['Nejprodávanější: cena', '/sperky/', '#productsTop .product .price-final', null, { size: true }],
  ['Nejprodávanější: tlačítko Detail', '/sperky/', '#productsTop .as-detail-button', null, { size: true }],
  // Hodnocení obchodu nad patičkou (načítá se po posunu k patičce)
  ['Hodnocení obchodu: průměr', '/', '.as-shop-reviews__score', null, { scrollTo: '#footer' }],
  ['Hodnocení obchodu: nadpis', '/', '.as-shop-reviews__title', null, { scrollTo: '#footer' }],
  ['Hodnocení obchodu: odkaz', '/', '.as-shop-reviews__all', null, { size: true, scrollTo: '#footer' }],
  ['Hodnocení obchodu: text recenze', '/', '.as-shop-reviews__text', null, { size: true, scrollTo: '#footer' }],
  ['Hodnocení obchodu: autor', '/', '.as-shop-reviews__author', null, { size: true, scrollTo: '#footer' }],
  // Karta článku (úvodní stránka a výpis rubriky)
  ['Článek: obrázek', '/rubriky/nase-novinky/', '.news-wrapper .news-item-link-img', null, {}],
  ['Článek: nadpis', '/rubriky/nase-novinky/', '.news-wrapper .news-item > h2', null, { size: true }],
  ['Článek: datum', '/rubriky/nase-novinky/', '.news-wrapper .news-item > time', null, { size: true }],
  ['Článek: ikona data', '/rubriky/nase-novinky/', '.news-wrapper .news-item > time', null, { pseudo: '::before', props: ['maskImage', 'backgroundColor', 'width'] }],
  ['Článek: perex', '/rubriky/nase-novinky/', '.news-wrapper .news-item .description', null, { size: true }],
  ['Článek na úvodní stránce: nadpis', '/', '.homepage-blog-wrapper .news-item .title', null, { size: true }],
  ['Článek na úvodní stránce: obrázek', '/', '.homepage-blog-wrapper .news-item .image', null, {}],
  ['Článek: Číst článek', '/rubriky/nase-novinky/', '.news-wrapper .news-item .read-article', null, { size: true }],
  ['Článek na úvodní stránce: Číst článek', '/', '.homepage-blog-wrapper .news-item .read-article', null, { size: true }],
  ['Článek na úvodní stránce: datum', '/', '.homepage-blog-wrapper .news-item time', null, { size: true, scrollTo: '.homepage-blog-wrapper' }],
  // Karta produktu
  ['Karta: název', '/sperky/', '.products-block .p .name', null, { size: true }],
  ['Karta: cena', '/sperky/', '.products-block .p .price-final', null, { size: true }],
  ['Karta: původní cena', '/sperky/', '.products-block .p .price-standard', null, { size: true }],
  ['Karta: dostupnost', '/sperky/', '.products-block .p .availability', null, { size: true }],
  ['Karta: štítek', '/sperky/', '.products-block .p .flag', null, { size: true }],
  ['Karta: sleva', '/sperky/', '.products-block .p .price-save', null, { pseudo: '::before', props: ['fontSize', 'fontWeight', 'color'] }],
  ['Karta: počítadlo', '/sperky/', '.products-block .p .quantity', null, {}],
  ['Karta: tlačítko', '/sperky/', '.products-block .p .p-tools .btn', null, { size: true }],
  // Detail produktu
  ['Detail: štítek', DETAIL, '.p-image .flags-default .flag', null, { size: true }],
  ['Detail: sleva', DETAIL, '.flags-extra .flag-discount', null, { size: true }],
  ['Detail: počítadlo', DETAIL, '.p-detail .add-to-cart .quantity', null, {}],
  ['Detail: tlačítko Do košíku', DETAIL, '.p-to-cart-block .add-to-cart-button', null, { size: true }],
  ['Detail: hvězdička', DETAIL, '.p-detail .stars .star', null, { pseudo: '::before', props: ['color'] }],
  // Ostatní
  ['Drobečky: odkaz', '/sperky/', '.breadcrumbs > span:not(#navigation-first) a', '.breadcrumbs > span:has(+ [data-testid="breadcrumbsLastLevel"]) a', { size: true }],
  ['Drobečky: pruh', '/sperky/', '.breadcrumbs', null, { size: true }],
  ['Přihlášení: pole', '/login/', '#formLogin input[name="email"]', null, { size: true }],
  ['Přihlášení: tlačítko', '/login/', '#formLogin .submit-wrapper .btn', null, { size: true }],
  ['Přihlášení: odkazy', '/login/', '#formLogin .alternative-links a', null, { size: true }],
];

async function read(page, selector, opts) {
  return page.evaluate(([sel, o, visual, size]) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length) || document.querySelector(sel);
    if (!el) return null;
    const style = getComputedStyle(el, o.pseudo || null);
    const keys = o.props || [...visual, ...(o.size ? size : [])];
    if (o.props && o.size) keys.push(...size);
    return Object.fromEntries(keys.map((k) => [k, k === 'maskImage' ? (style[k].match(/<path[^>]*d='([^']{0,40})/)?.[1] || style[k].slice(0, 40)) : style[k]]));
  }, [selector, opts, VISUAL, SIZE]);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = {
    desktop: await browser.newContext({ viewport: { width: 1920, height: 1080 } }),
    mobile: await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }),
  };
  let problems = 0;
  for (const [name, url, dSel, mSel, opts] of ITEMS) {
    const values = {};
    try {
    for (const device of ['desktop', 'mobile']) {
      const page = await ctx[device].newPage();
      page.setDefaultTimeout(30000);
      // Testovací e-shop občas odpovídá pomalu: delší limit a jeden pokus navíc.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try { await page.goto(SHOP + url, { waitUntil: 'load', timeout: 60000 }); break; } catch (error) { if (attempt) throw error; }
      }
      await page.waitForTimeout(300);
      if (opts.open?.[device] === 'menu') {
        await page.locator('#header .navigation-buttons [data-target="navigation"]').click();
        await page.waitForTimeout(400);
      }
      if (opts.open?.[device] === 'catalog') {
        await page.locator('.as-catalog__toggle').click();
        await page.waitForTimeout(400);
      }
      if (opts.search) {
        if (device === 'mobile') await page.locator('#header .search-input').scrollIntoViewIfNeeded();
        await page.locator('#header .search-input').click(); await page.locator('#header .search-input').pressSequentially(opts.search, { delay: 80 });
        await page.waitForTimeout(2500);
      }
      // Obsah načítaný až u patičky (hodnocení obchodu): posun a počkat na prvek.
      if (opts.scrollTo) {
        await page.locator(opts.scrollTo).scrollIntoViewIfNeeded();
        await page.locator(dSel).first().waitFor({ timeout: 15000 }).catch(() => {});
      }
      values[device] = await read(page, device === 'mobile' && mSel ? mSel : dSel, opts);
      await page.close();
    }
    } catch (error) {
      console.log(`⚠  ${name}: nepodařilo se změřit (${error.message.split('\n')[0]})`);
      continue;
    }
    if (!values.desktop || !values.mobile) {
      console.log(`?  ${name}: prvek nenalezen (${!values.desktop ? 'desktop' : 'mobil'})`);
      continue;
    }
    // „start“ = „left“ (text zleva doprava); okraje a zarovnání jen u položek, ne u řádků seznamů.
    const norm = (v) => (v === 'start' ? 'left' : v);
    const diff = Object.keys(values.desktop).filter((k) => norm(values.desktop[k]) !== norm(values.mobile[k]));
    if (diff.length) {
      problems += 1;
      console.log(`✗  ${name}`);
      diff.forEach((k) => console.log(`     ${k}: desktop ${values.desktop[k]} | mobil ${values.mobile[k]}`));
    } else {
      console.log(`✓  ${name}`);
    }
  }
  console.log(`\nRozdílných komponent: ${problems} z ${ITEMS.length}`);
  await browser.close();
})();
