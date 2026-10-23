// Počet produktů vedle sebe v produktových sekcích úvodní stránky (nastavení šablony 4–6,
// Shoptet sám umí jen 3 nebo 4). Slider Shoptetu (shoptet.slider.runProductSlider) čte počet
// z data-columns při spuštění na DOMContentLoaded a na menších šířkách ho sám snižuje. Náš
// posluchač DOMContentLoaded je zaregistrovaný dřív (skript v hlavičce), atribut tedy přepíšeme
// před spuštěním slideru. Nic jiného se nemění.
//
// Sekce vedle banneru Střed (components/_body-banners.scss) je o šířku banneru užší, má o dva
// produkty méně (6 → 4 jako v návrhu), nejméně však 3. Vedle banneru je jen od 1200 px, pod tím je
// sekce přes celou šířku; slider si počet určí jen jednou při spuštění, rozhoduje tedy šířka okna
// při načtení (po změně šířky přes 1200 px platí až po novém načtení stránky).

const SLIDER = '.products-wrapper > .product-slider[data-columns]';
const BESIDE_BANNER = `#content > .body-banners + .homepage-group-title + ${SLIDER}`;

export function setHomepageProductColumns(config) {
  if (!document.body.classList.contains('type-index')) return;

  const columns = Number(config.productColumns);
  if (columns) {
    document.querySelectorAll(`#content ${SLIDER}`).forEach((slider) => {
      slider.dataset.columns = String(columns);
    });
  }

  const besideBanner = config.middleBanners === 'left' || config.middleBanners === 'right';
  if (besideBanner && window.matchMedia('(min-width: 1200px)').matches) {
    const slider = document.querySelector(BESIDE_BANNER);
    if (slider) {
      const full = Number(slider.dataset.columns) || 4;
      slider.dataset.columns = String(Math.max(3, full - 2));
    }
  }
}
