// Vstupní bod JS šablony aSteroid.
// Konfiguraci vkládá settings-app přes Shoptet API (template-include) jako window.asteroidConfig.

import { enhanceHeader } from './header';
import { enhanceMobileHeader } from './mobile-header';
import { enhanceMobileMenu } from './mobile-menu';
import { enhanceSearch } from './search';
import { enhanceBanners } from './banners';
import { renderHomeCategories } from './home-categories';
import { enhanceLogin } from './login';
import { enhanceCart } from './cart';
import { enhanceProductCards } from './product-cards';
import { setHomepageProductColumns } from './homepage-products';
import { placeHomepageBanners } from './homepage-banners';
import { enhanceCategory } from './category';
import { enhanceCategoryIntro } from './category-intro';
import { loadCategoryArticles, renderCategoryArticles } from './category-articles';
import { trackViewportWidth } from './viewport';
import { styleFiles } from './styles.mjs';

const HEADER_VARIANTS = ['v1', 'v2', 'v3'];
const BANNER_LAYOUTS = ['default', 'content', 'fullwidth', 'cards'];
// Vzhledy karet produktů (zatím jen výchozí, další přibudou v nastavení šablony).
const PRODUCT_CARDS = ['default'];
const PRODUCT_COLUMNS = [4, 5, 6];
// Vzhled popisu kategorie (scss/variants/category-*.scss, výchozí je v základu).
const CATEGORY_LAYOUTS = ['default', 'background', 'image', 'image-wide'];

const DEFAULTS = {
  header: 'v1',
  categoryLayout: 'default',
  // Světlé pozadí pod popisem a obrázkem (jen vzhledy image a image-wide).
  categoryTint: false,
  banners: 'default',
  phone: null,
  quickLinks: [],
  navLinks: [],
  homeCategories: null,
  productCard: 'default',
  // Bez nastavení necháváme počet podle Shoptetu (rozvržení se 3 nebo 4 produkty).
  productColumns: null,
};

// Náhled jiné varianty bez změny nastavení: ?asteroid-header=v2, ?asteroid-banners=cards,
// ?asteroid-columns=6, ?asteroid-category=image-wide, ?asteroid-category-tint=1
function previewOverrides() {
  const params = new URLSearchParams(window.location.search);
  const header = params.get('asteroid-header');
  const banners = params.get('asteroid-banners');
  const columns = Number(params.get('asteroid-columns'));
  const category = params.get('asteroid-category');
  const tint = params.get('asteroid-category-tint');
  return {
    ...(CATEGORY_LAYOUTS.includes(category) ? { categoryLayout: category } : {}),
    ...(tint === '1' || tint === '0' ? { categoryTint: tint === '1' } : {}),
    ...(HEADER_VARIANTS.includes(header) ? { header } : {}),
    ...(BANNER_LAYOUTS.includes(banners) ? { banners } : {}),
    ...(PRODUCT_COLUMNS.includes(columns) ? { productColumns: columns } : {}),
  };
}

// Skript šablony (adresa pro dočítání stylů). currentScript platí jen při prvním spuštění skriptu.
const ownScript = document.currentScript;

// Styly zvolených variant vkládá do stránky už kód z nastavení šablony (link[data-as-style]).
// Chybějící dočteme: náhled jiné varianty (?asteroid-header=v2) nebo starší vložený kód, který
// načítal jen asteroid.css. Vedle souboru šablony, se stejnou verzí jako skript.
function ensureStyles(config) {
  const source = ownScript?.src ? new URL(ownScript.src) : null;
  if (!source) return;
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')];
  const loaded = new Set(links.map((link) => link.dataset.asStyle).filter(Boolean));
  const base = links.find((link) => link.dataset.asStyle === 'asteroid' || /\/asteroid\.css(\?|$)/.test(link.href));
  if (base) loaded.add('asteroid');
  let last = links.filter((link) => link.dataset.asStyle).pop() || base;

  styleFiles(config).filter((name) => !loaded.has(name)).forEach((name) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL(`${name}.css${source.search}`, source).href;
    link.dataset.asStyle = name;
    if (last) last.after(link);
    else document.head.append(link);
    last = link;
  });
}

function start() {
  trackViewportWidth();
  const config = { ...DEFAULTS, ...(window.asteroidConfig || {}), ...previewOverrides() };
  ensureStyles(config);

  // Třídy na <html> řídí, kterou variantu CSS zobrazí (např. .as-header-v2).
  // Dáváme je na <html>, protože ten existuje hned a varianta se tak nepřepne až po načtení stránky.
  document.documentElement.classList.add(
    'as-theme',
    `as-header-${config.header}`,
    `as-category-${CATEGORY_LAYOUTS.includes(config.categoryLayout) ? config.categoryLayout : 'default'}`,
    `as-banners-${BANNER_LAYOUTS.includes(config.banners) ? config.banners : 'default'}`,
    `as-product-card-${PRODUCT_CARDS.includes(config.productCard) ? config.productCard : 'default'}`,
  );
  // Řádek rychlých odkazů vzniká až na DOMContentLoaded; CSS mu podle třídy drží místo předem,
  // aby hlavička a obsah po prvním vykreslení neposkočily (layout/_header.scss).
  if (config.categoryTint === true && ['image', 'image-wide'].includes(config.categoryLayout)) {
    document.documentElement.classList.add('as-category-tinted');
  }
  if (Array.isArray(config.quickLinks) && config.quickLinks.some((link) => link?.label && link?.url)) {
    document.documentElement.classList.add('as-has-quicklinks');
  }

  // Články ke kategorii stahujeme hned, ať jsou na DOMContentLoaded nejspíš k dispozici.
  const categoryArticles = loadCategoryArticles(config);

  const init = () => {
    // Před spuštěním slideru Shoptetu (ten běží na DOMContentLoaded po nás). Bannery k sekcím
    // nejdřív, sekce vedle banneru má méně produktů.
    placeHomepageBanners();
    setHomepageProductColumns(config);
    enhanceHeader(config);
    enhanceMobileHeader();
    enhanceMobileMenu(config);
    enhanceSearch(config);
    enhanceBanners(config);
    renderHomeCategories(config);
    enhanceLogin();
    enhanceCart();
    enhanceProductCards();
    enhanceCategoryIntro(config);
    enhanceCategory();
    renderCategoryArticles(categoryArticles);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

// Pojistka: kdyby se skript na stránce načetl dvakrát (např. kód z doplňku i ruční kód v HTML kódech),
// hlavičku upravíme jen jednou.
if (!window.asteroidStarted) {
  window.asteroidStarted = true;
  start();
}
