// Vstupní bod JS šablony aSteroid.
// Konfiguraci vkládá settings-app přes Shoptet API (template-include) jako window.asteroidConfig.

import { enhanceHeader } from './header';
import { enhanceSearch } from './search';

const HEADER_VARIANTS = ['v1', 'v2', 'v3'];

const DEFAULTS = {
  header: 'v1',
  categoryLayout: 'default',
  phone: null,
  quickLinks: [],
  navLinks: [],
};

// Náhled jiné varianty bez změny nastavení: ?asteroid-header=v2
function previewOverrides() {
  const header = new URLSearchParams(window.location.search).get('asteroid-header');
  return HEADER_VARIANTS.includes(header) ? { header } : {};
}

function start() {
  const config = { ...DEFAULTS, ...(window.asteroidConfig || {}), ...previewOverrides() };

  // Třídy na <html> řídí, kterou variantu CSS zobrazí (např. .as-header-v2).
  // Dáváme je na <html>, protože ten existuje hned a varianta se tak nepřepne až po načtení stránky.
  document.documentElement.classList.add(
    'as-theme',
    `as-header-${config.header}`,
    `as-category-${config.categoryLayout}`,
  );

  const init = () => {
    enhanceHeader(config);
    enhanceSearch();
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
