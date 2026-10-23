// Vstupní bod JS šablony aSteroid.
// Konfiguraci vkládá settings-app přes Shoptet API (template-include) jako window.asteroidConfig.

import { enhanceHeader } from './header';
import { enhanceSearch } from './search';
import { enhanceBanners } from './banners';
import { renderHomeCategories } from './home-categories';
import { enhanceLogin } from './login';
import { enhanceCart } from './cart';
import { enhanceProductCards } from './product-cards';

const HEADER_VARIANTS = ['v1', 'v2', 'v3'];
const BANNER_LAYOUTS = ['default', 'content', 'fullwidth', 'cards'];
// Vzhledy karet produktů (zatím jen výchozí, další přibudou v nastavení šablony).
const PRODUCT_CARDS = ['default'];

const DEFAULTS = {
  header: 'v1',
  categoryLayout: 'default',
  banners: 'default',
  phone: null,
  quickLinks: [],
  navLinks: [],
  homeCategories: null,
  productCard: 'default',
};

// Náhled jiné varianty bez změny nastavení: ?asteroid-header=v2, ?asteroid-banners=cards
function previewOverrides() {
  const params = new URLSearchParams(window.location.search);
  const header = params.get('asteroid-header');
  const banners = params.get('asteroid-banners');
  return {
    ...(HEADER_VARIANTS.includes(header) ? { header } : {}),
    ...(BANNER_LAYOUTS.includes(banners) ? { banners } : {}),
  };
}

function start() {
  const config = { ...DEFAULTS, ...(window.asteroidConfig || {}), ...previewOverrides() };

  // Třídy na <html> řídí, kterou variantu CSS zobrazí (např. .as-header-v2).
  // Dáváme je na <html>, protože ten existuje hned a varianta se tak nepřepne až po načtení stránky.
  document.documentElement.classList.add(
    'as-theme',
    `as-header-${config.header}`,
    `as-category-${config.categoryLayout}`,
    `as-banners-${BANNER_LAYOUTS.includes(config.banners) ? config.banners : 'default'}`,
    `as-product-card-${PRODUCT_CARDS.includes(config.productCard) ? config.productCard : 'default'}`,
  );

  const init = () => {
    enhanceHeader(config);
    enhanceSearch(config);
    enhanceBanners(config);
    renderHomeCategories(config);
    enhanceLogin();
    enhanceCart();
    enhanceProductCards();
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
