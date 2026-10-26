import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { styleFiles } from '../../theme/src/js/styles.mjs';
import { rewriteHtml } from '../../tests/shop/blank-preview.mjs';
process.env.SHOPTET_CLIENT_SECRET ||= 'test';
const { themeConfigFromForm, buildHeaderSnippet, DEFAULT_THEME_CONFIG } = await import('../src/theme-config.mjs');

test('blank foundation is opt-in and precedes all theme styles', () => {
  assert.equal(styleFiles({}).includes('base-blank'), false);
  assert.deepEqual(styleFiles({ styleMode: 'blank' }).slice(0, 2), ['base-blank', 'asteroid']);
  const html = buildHeaderSnippet({ ...DEFAULT_THEME_CONFIG, styleMode: 'blank' });
  assert.ok(html.indexOf('data-as-style="base-blank"') < html.indexOf('data-as-style="asteroid"'));
  assert.equal((html.match(/data-as-style="base-blank"/g) || []).length, 1);
  assert.ok(html.length <= 8192);
});

test('settings preserve blank mode when an older form omits the new field', () => {
  assert.equal(themeConfigFromForm(new URLSearchParams('styleMode=blank')).styleMode, 'blank');
  assert.equal(themeConfigFromForm(new URLSearchParams('styleMode=invalid')).styleMode, 'disco');
  assert.equal(themeConfigFromForm(new URLSearchParams(), { previous: { styleMode: 'blank' } }).styleMode, 'blank');
  assert.equal(themeConfigFromForm(new URLSearchParams('styleMode=disco'), { previous: { styleMode: 'blank' } }).styleMode, 'disco');
});

test('blank preview removes only native template CSS and keeps native JS and selected fonts', () => {
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
  assert.ok(blank.includes('/__as/base-blank.css'));
  assert.ok(rewriteHtml(html, false).includes('main-13.less'));
});

test('blank foundation is self-contained and its icon fonts are deployed beside it', () => {
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
