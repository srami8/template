// Karty produktů ve výpisech Disca (.products-block). Vzhled je v CSS podle varianty
// (.as-product-card-<varianta> na <html>, viz main.js). JS doplňuje jen hodnotu slevy:
// Disco ji vypisuje se závorkami „(–31 %)“, kolečko v návrhu ukazuje „–31 %“. Hodnota jde do
// data-as-discount (CSS ji vypíše přes attr()), text Shoptetu zůstává.

// Ve slideru úvodní stránky vzniká .products-block až po spuštění slideru, proto podle karty (.p).
const SELECTOR = '.p .price-save:not([data-as-discount])';

function markDiscounts(root = document) {
  root.querySelectorAll(SELECTOR).forEach((el) => {
    el.dataset.asDiscount = el.textContent.replace(/[()]/g, '').trim();
  });
}

export function enhanceProductCards() {
  markDiscounts();
  // Výpis kategorie Shoptet překresluje při filtrování a stránkování (AJAX).
  const content = document.getElementById('content');
  if (!content) return;
  new MutationObserver(() => markDiscounts(content)).observe(content, { childList: true, subtree: true });
}
