// Rozdělení stylů na základ a soubory variant (theme/src/js/styles.mjs, scss/variants).
const fs = require('node:fs');
const path = require('node:path');
const {test, expect} = require('@playwright/test');

const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');

test('every variant style file is listed and every listed variant is built', async () => {
  const {VARIANT_STYLES, styleFiles} = await import('../../theme/src/js/styles.mjs');
  const listed = Object.values(VARIANT_STYLES).flatMap(({prefix, values}) => values.map((value) => `${prefix}-${value}.css`));
  const built = fs.readdirSync(dist).filter((file) => file.endsWith('.css') && file !== 'asteroid.css');
  expect(listed.sort()).toEqual(built.sort());

  expect(styleFiles({header: 'v2', banners: 'cards'})).toEqual(['asteroid', 'header-v2', 'banners-cards', 'product-card-default']);
  // Neznámá hodnota → výchozí varianta.
  expect(styleFiles({header: 'v9'})).toEqual(['asteroid', 'header-v1', 'banners-default', 'product-card-default']);
});

test('heading defaults are the same in the settings and in the CSS tokens', async () => {
  const {HEADING_SIZES, headingStyle} = await import('../../theme/src/js/typography.mjs');
  const css = fs.readFileSync(path.join(dist, 'asteroid.css'), 'utf8');
  for (const [level, size] of Object.entries(HEADING_SIZES)) {
    expect(css).toContain(`--as-heading-size-${level}: ${size}px`);
  }
  expect(headingStyle({})).toBe('');
  expect(headingStyle({h1: 40, h2: 28, h3: 'x', h4: 500})).toBe('<style>:root{--as-heading-size-h1:40px}</style>');
});
