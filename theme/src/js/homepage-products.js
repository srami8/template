// Počet produktů vedle sebe v produktových sekcích úvodní stránky (nastavení šablony 4–6,
// Shoptet sám umí jen 3 nebo 4). Slider Shoptetu (shoptet.slider.runProductSlider) čte počet
// z data-columns při spuštění na DOMContentLoaded a na menších šířkách ho sám snižuje. Náš
// posluchač DOMContentLoaded je zaregistrovaný dřív (skript v hlavičce), atribut tedy přepíšeme
// před spuštěním slideru. Nic jiného se nemění.

export function setHomepageProductColumns(config) {
  const columns = Number(config.productColumns);
  if (!document.body.classList.contains('type-index') || !columns) return;
  document.querySelectorAll('#content .products-wrapper > .product-slider[data-columns]').forEach((slider) => {
    slider.dataset.columns = String(columns);
  });
}
