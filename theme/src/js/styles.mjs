// Které soubory stylů e-shop načte: základ (asteroid.css) a soubory zvolených variant
// (scss/variants/<název>.scss → dist/<název>.css). Jediný seznam pro šablonu i settings-app
// (vkládaný kód). Nová varianta = nový soubor ve scss/variants a název tady. Hodnota v `base`
// nemá vlastní soubor (vzhled je v základu), e-shop pro ni nic dalšího nenačítá.

export const VARIANT_STYLES = {
  styleMode: { prefix: 'base', values: ['blank'], base: ['disco'], beforeBase: true },
  header: { prefix: 'header', values: ['v1', 'v2'] },
  banners: { prefix: 'banners', values: ['default', 'content', 'fullwidth', 'cards'] },
  productCard: { prefix: 'product-card', values: ['default'] },
  categoryLayout: { prefix: 'category', values: ['background', 'image', 'image-wide'], base: ['default'] },
};

export const BASE_STYLE = 'asteroid';

// Varianta bez nastavení (nebo s neznámou hodnotou): stejné výchozí jako v js/main.js.
const DEFAULTS = { styleMode: 'disco', header: 'v1', banners: 'default', productCard: 'default', categoryLayout: 'default' };

// Názvy souborů (bez .css): kompatibilní podklad, základ aSteroid, varianty.
export function styleFiles(config = {}) {
  const before = [];
  const files = [BASE_STYLE];
  Object.entries(VARIANT_STYLES).forEach(([key, { prefix, values, beforeBase }]) => {
    const value = values.includes(config[key]) ? config[key] : DEFAULTS[key];
    if (values.includes(value)) (beforeBase ? before : files).push(`${prefix}-${value}`);
  });
  return [...before, ...files];
}
