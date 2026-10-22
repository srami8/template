// Vstupní bod JS šablony aSteroid.
// Konfiguraci vkládá settings-app přes Shoptet API (template-include) jako window.asteroidConfig.

const DEFAULTS = {
  header: 'v1',
  categoryLayout: 'default',
};

const config = { ...DEFAULTS, ...(window.asteroidConfig || {}) };

// Třídy na <body> řídí, kterou variantu CSS zobrazí (např. .as-header-v2).
function applyConfigClasses() {
  document.body.classList.add(
    'as-theme',
    `as-header-${config.header}`,
    `as-category-${config.categoryLayout}`,
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyConfigClasses);
} else {
  applyConfigClasses();
}
