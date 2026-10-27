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
  // Neznámá hodnota → výchozí varianta; výchozí vzhled kategorie je v základu (bez souboru).
  expect(styleFiles({header: 'v9', categoryLayout: 'x'})).toEqual(['asteroid', 'header-v1', 'banners-default', 'product-card-default']);
  expect(styleFiles({categoryLayout: 'image-wide'})).toContain('category-image-wide');
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

test('search and active filter tags share one compiled base rule on native selectors', () => {
  const css = fs.readFileSync(path.join(dist, 'asteroid.css'), 'utf8');
  const tagRules = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)]
    .filter(([, selector, declarations]) => selector.includes('.searchWhisperer__additionalResults__link')
      && declarations.includes('padding:8px 16px'));
  expect(tagRules).toHaveLength(1);
  expect(tagRules[0][1]).toContain('.active-filters .input');
  expect(css).not.toContain('.as-active-filters');
});

test('free shipping is one shared compiled rule for the widget and the native checkout elements', () => {
  const css = fs.readFileSync(path.join(dist, 'asteroid.css'), 'utf8');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const bases = rules.filter(([,selector,body]) => selector.includes('.cart-free-shipping') && body.includes('font-size:var(--as-font-size-small)'));
  expect(bases).toHaveLength(1);
  expect(bases[0][1]).toContain('.extra.delivery');
  expect(bases[0][1]).not.toContain('#cart-widget');
});

test('cart removal and coupon reuse compiled primitives shared with the existing widgets', () => {
  const css = fs.readFileSync(path.join(dist, 'asteroid.css'), 'utf8');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const removal = rules.filter(([,selector,body]) => selector.includes('.remove-item') && body.includes('display:flex') && body.replace(/\s/g,'').includes('width:var(--as-remove-size,16px)'));
  expect(removal).toHaveLength(1);
  expect(removal[0][1]).toContain('#cart-widget');
  expect(removal[0][1]).toContain('.cart-table');
  const checkbox = rules.filter(([,selector,body]) => selector.includes('.toggle-coupon-input-button::before') && body.includes('border-radius:6px'));
  expect(checkbox).toHaveLength(1);
  // Stejné pravidlo jako globální checkbox (components/_choices.scss).
  expect(checkbox[0][1]).toContain('.as-theme input[type=checkbox]+label:not(.advanced-parameter)::before');
});

test('cart and checkout compile the price breakdown into one shared rule',()=>{
 const css=fs.readFileSync(path.join(dist,'asteroid.css'),'utf8');
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(([,s,d])=>s.includes('.price-wrapper')&&d.includes('grid-template-columns:minmax(0, 1fr) auto'));
 expect(rules).toHaveLength(1);
 expect(rules[0][1]).toContain('.in-kosik .summary .price-wrapper');
 expect(rules[0][1]).toMatch(/body:is\(\.in-krok-1,\s*\.in-krok-2\) #checkoutSidebar \.price-wrapper/);
});

test('native footer and checkout contacts share one compiled link style',()=>{
 const css=fs.readFileSync(path.join(dist,'asteroid.css'),'utf8');
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)].filter(([,s,d])=>s.includes('.contact-box a')&&d.includes('font-size:var(--as-font-size-h5)'));
 expect(rules).toHaveLength(1);
 expect(rules[0][1]).toContain('.custom-footer__contact .contact-box a');
 expect(rules[0][1]).toContain('#checkoutSidebar .checkout-box .contact-box a');
});
