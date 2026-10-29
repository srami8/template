// Nedokumentovaná /cache/ může chybět, i když je původní stránka dostupná.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

for (const [file, start, end, name] of [
  ['shop-reviews.js', 'async function load(path)', 'function stars(', 'load'],
  ['article-cards.js', 'async function fetchPage(path)', '// Data zveřejnění', 'fetchPage'],
]) {
  test(`${file}: a cache 404 falls back to the original page`, async () => {
    const calls = [];
    const source = readFileSync(new URL(`../../theme/src/js/${file}`, import.meta.url), 'utf8');
    const context = createContext({
      fetch: async (url) => {
        calls.push(url);
        return { status: calls.length === 1 ? 404 : 200, ok: calls.length > 1, text: async () => 'page' };
      },
      parseRatingPage: (html) => html,
      DOMParser: class { parseFromString(html) { return html; } },
    });
    runInContext(source.slice(source.indexOf(start), source.indexOf(end)), context);
    assert.equal(await context[name]('/test/'), 'page');
    assert.deepEqual(calls, ['/cache/test/', '/test/']);
  });
}

test('preview styles use their own version rather than the script version', () => {
  const source = readFileSync(new URL('../../theme/src/js/main.js', import.meta.url), 'utf8');
  const inserted = [];
  const base = { dataset: { asStyle: 'asteroid' }, href: 'https://shop.test/asteroid.css', after: (link) => inserted.push(link) };
  const context = createContext({
    URL, Date, encodeURIComponent,
    ownScript: { src: 'https://shop.test/asteroid.js?v=js-version' },
    document: { querySelectorAll: () => [base], createElement: () => ({ dataset: {} }) },
    styleFiles: () => ['asteroid', 'header-v2'],
  });
  runInContext(source.slice(source.indexOf('function ensureStyles('), source.indexOf('function start(')), context);
  context.ensureStyles({ styleVersions: { 'header-v2': 'css-version' } });
  assert.equal(inserted[0].href, 'https://shop.test/header-v2.css?v=css-version');
});

test('missing stylesheets are added once and after the theme base with older snippets', () => {
  const source = readFileSync(new URL('../../theme/src/js/main.js', import.meta.url), 'utf8');
  for (const initial of [[], ['asteroid'], ['header-v1']]) {
    const ordered = [];
    const element = (name) => ({
      dataset: name ? { asStyle: name } : {},
      href: name ? `https://shop.test/${name}.css` : '',
      before(link) { ordered.splice(ordered.indexOf(this), 0, link); },
      after(link) { ordered.splice(ordered.indexOf(this) + 1, 0, link); },
    });
    ordered.push(...initial.map(element));
    const context = createContext({
      URL, Date, encodeURIComponent,
      ownScript: { src: 'https://shop.test/asteroid.js' },
      document: {
        querySelectorAll: () => [...ordered], createElement: () => element(),
        head: { append: (link) => ordered.push(link) },
      },
      styleFiles: () => ['asteroid', 'header-v1', 'banners-default'],
    });
    runInContext(source.slice(source.indexOf('function ensureStyles('), source.indexOf('function start(')), context);
    context.ensureStyles({});
    context.ensureStyles({});
    const names = ordered.map((link) => link.dataset.asStyle);
    // Základ je ve vloženém kódu vždy; bez něj (jen u uměle neúplného kódu) se pořadí neověřuje.
    if (!initial.length || initial.includes('asteroid')) assert.ok(names.indexOf('asteroid') < names.indexOf('header-v1'), initial.join(','));
    for (const name of ['asteroid', 'header-v1', 'banners-default']) assert.equal(names.filter((n) => n === name).length, 1, name);
    assert.ok(!names.includes('base-blank'));
  }
});
