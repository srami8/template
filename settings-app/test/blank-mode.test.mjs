import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { styleFiles } from '../../theme/src/js/styles.mjs';
import { rewriteHtml } from '../../tests/shop/blank-preview.mjs';
process.env.SHOPTET_CLIENT_SECRET ||= 'test';
const { themeConfigFromForm, buildHeaderSnippet, DEFAULT_THEME_CONFIG } = await import('../src/theme-config.mjs');

// Blank mode má ukázat jen styly aSteroidu: kopie CSS Disca se do e-shopu nikdy nenačítá.
test('the Disco copy is never loaded by the shop code, not even with a saved blank mode', () => {
  for (const config of [{}, { styleMode: 'blank' }]) assert.equal(styleFiles(config).includes('base-blank'), false);
  assert.equal(styleFiles({})[0], 'asteroid');
  const html = buildHeaderSnippet({ ...DEFAULT_THEME_CONFIG, styleMode: 'blank' });
  assert.ok(!html.includes('base-blank'));
  assert.ok(html.length <= 8192);
});

test('settings drop the hidden blank mode choice, including an older saved value', () => {
  assert.equal(themeConfigFromForm(new URLSearchParams('styleMode=blank')).styleMode, undefined);
  assert.equal(themeConfigFromForm(new URLSearchParams(), { previous: { styleMode: 'blank' } }).styleMode, undefined);
});

test('blank preview removes only native template CSS, keeps native JS and fonts and adds no Disco copy', () => {
  const html = `<link href="https://cdn.myshoptet.com/prj/dist/master/shop/dist/main-13.less.hash.css" rel="stylesheet">
<link href="https://cdn.myshoptet.com/prj/dist/master/shop/dist/font-shoptet-13.css.hash.css" rel="stylesheet">
<link href="https://cdn.myshoptet.com/font-face/poppins.css" rel="stylesheet">
<link href="/other-addon.css" rel="stylesheet">
<script>window.asteroidConfig = {};</script>
<link href="/user/documents/asteroid/asteroid.css" rel="stylesheet" data-as-style="asteroid">
<script src="/user/documents/asteroid/asteroid.js?v=old"></script>
<script src="https://cdn.myshoptet.com/prj/dist/master/shop/dist/main-3g.js.hash.js"></script>`;
  const blank = rewriteHtml(html, true);
  assert.ok(!blank.includes('main-13.less'));
  assert.ok(!blank.includes('font-shoptet-13.css'));
  assert.ok(blank.includes('poppins.css') && blank.includes('other-addon.css') && blank.includes('main-3g.js'));
  assert.ok(!blank.includes('base-blank'));
  assert.ok(blank.includes('/__as/asteroid.css'));
  assert.ok(rewriteHtml(html, false).includes('main-13.less'));
});

// Kopie Disca zůstává jen pro testy a porovnání; musí být soběstačná i s fonty ikon.
test('the Disco copy for tests is self-contained and its icon fonts sit beside it', () => {
  const css = readFileSync(new URL('../../theme/dist/base-blank.css', import.meta.url), 'utf8');
  assert.ok(!/@import\b/.test(css));
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/^["']|["']$/g, '')).filter((u) => !u.startsWith('data:'));
  assert.equal(urls.length, 2);
  for (const url of urls) {
    assert.match(url, /^shoptet\.[a-f0-9]+\.woff2?$/);
    assert.ok(existsSync(new URL(`../../theme/dist/${url}`, import.meta.url)));
  }
});


test('native AJAX fragments retain content and keep listing requests on the local preview', () => {
  const fragment = '<div class="products-page">Produkt</div><button data-url="https://313980.myshoptet.com/pletene-kosiky/strana-2/">Další</button>';
  const result = rewriteHtml(fragment, true);
  assert.ok(result.includes('Produkt'));
  assert.ok(result.includes('data-url="/pletene-kosiky/strana-2/"'));
  assert.ok(!result.includes('base-blank.css'));
});

test('native breadcrumb history stays on the preview origin after clearing filters', () => {
  const html = '<meta itemprop="item" content="https://313980.myshoptet.com/pletene-kosiky/?order=price">'
    + '<meta itemprop="position" content="3"><meta property="og:url" content="https://313980.myshoptet.com/pletene-kosiky/">';
  const result = rewriteHtml(html, true);
  assert.ok(result.includes('itemprop="item" content="/pletene-kosiky/?order=price"'));
  assert.ok(result.includes('itemprop="position" content="3"'));
  assert.ok(result.includes('property="og:url" content="https://313980.myshoptet.com/pletene-kosiky/"'));
});
