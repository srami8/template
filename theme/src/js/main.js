// Vstupní bod JS šablony aSteroid.
// Konfiguraci vkládá settings-app přes Shoptet API (template-include) jako window.asteroidConfig.

import { enhanceHeader } from './header';

const DEFAULTS = {
  header: 'v1',
  categoryLayout: 'default',
  phone: null,
  quickLinks: [],
};

const config = { ...DEFAULTS, ...(window.asteroidConfig || {}) };

// Třídy na <html> řídí, kterou variantu CSS zobrazí (např. .as-header-v2).
// Dáváme je na <html>, protože ten existuje hned a varianta se tak nepřepne až po načtení stránky.
document.documentElement.classList.add(
  'as-theme',
  `as-header-${config.header}`,
  `as-category-${config.categoryLayout}`,
);

function init() {
  enhanceHeader(config);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
