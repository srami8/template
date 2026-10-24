// Datová logika článků ke kategoriím (src/category-articles.mjs): formulář → přiřazení,
// přiřazení + články z API → zveřejněná data pro šablonu.
//
//   npm test -w settings-app

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORY_ARTICLES_TITLE,
  MAX_ARTICLES_PER_CATEGORY,
  articleState,
  articleSummaries,
  articlesErrorMessage,
  assignmentsVersion,
  categoryArticlesFromForm,
  publishedCategoryArticles,
} from '../src/category-articles.mjs';

const DOGS = '0d2e8b0e-6b1a-11eb-90ab-b8ca3a6063f8';
const CATS = '1f3e8b0e-6b1a-11eb-90ab-b8ca3a6063f8';
const NOW = Date.parse('2026-10-24T12:00:00+02:00');

const api = [
  { id: 1, title: 'Jak vycvičit psa', url: 'https://shop.cz/poradna/vycvik/', visible: true, publishDate: '2026-01-01T10:00:00+0100' },
  { id: 2, title: 'Povely pro psa', url: 'https://shop.cz/poradna/povely/', visible: true, publishDate: null },
  { id: 3, title: 'Skrytý článek', url: 'https://shop.cz/poradna/skryty/', visible: false, publishDate: null },
  { id: 4, title: 'Budoucí článek', url: 'https://shop.cz/poradna/budouci/', visible: true, publishDate: '2026-12-01T10:00:00+0100' },
  { id: 5, title: `Velmi dlouhý název článku ${'a'.repeat(300)}`, url: 'https://shop.cz/poradna/dlouhy/?x=1', visible: true, publishDate: null },
];
const articles = articleSummaries(api);

const form = (entries) => {
  const params = new URLSearchParams();
  entries.forEach(([key, value]) => params.append(key, value));
  return params;
};

test('form keeps categories by GUID with article IDs in the submitted order', () => {
  const result = categoryArticlesFromForm(form([
    [`categoryArticles[${DOGS}][title]`, '  Poradna pro pejskaře '],
    [`categoryArticles[${DOGS}][ids]`, '4'],
    [`categoryArticles[${DOGS}][ids]`, '1'],
    [`categoryArticles[${DOGS}][ids]`, '4'],
    [`categoryArticles[${DOGS}][ids]`, 'x'],
    [`categoryArticles[${CATS}][title]`, ''],
    [`categoryArticles[${CATS}][ids]`, '1'],
    ['categoryArticles[nejde-o-guid][ids]', '1'],
  ]));
  assert.deepEqual(result, {
    [DOGS]: { title: 'Poradna pro pejskaře', articleIds: [4, 1] },
    [CATS]: { title: '', articleIds: [1] },
  });
});

test('category without articles is not stored and the count per category is capped', () => {
  const ids = Array.from({ length: 15 }, (_, i) => [`categoryArticles[${DOGS}][ids]`, String(i + 1)]);
  const result = categoryArticlesFromForm(form([[`categoryArticles[${CATS}][title]`, 'Bez článků'], ...ids]));
  assert.equal(result[CATS], undefined);
  assert.equal(result[DOGS].articleIds.length, MAX_ARTICLES_PER_CATEGORY);
});

test('article state: published, hidden, scheduled and deleted', () => {
  const byId = new Map(articles.map((a) => [a.id, a]));
  assert.equal(articleState(byId.get(1), NOW), 'published');
  assert.equal(articleState(byId.get(2), NOW), 'published');
  assert.equal(articleState(byId.get(3), NOW), 'hidden');
  assert.equal(articleState(byId.get(4), NOW), 'scheduled');
  assert.equal(articleState(undefined, NOW), 'missing');
  // Po datu zveřejnění se budoucí článek zobrazí bez nového uložení.
  assert.equal(articleState(byId.get(4), Date.parse('2026-12-02')), 'published');
});

test('published data: only visible articles, in order, paths without the domain, default title', () => {
  const assignments = {
    [DOGS]: { title: '', articleIds: [5, 3, 99, 4, 1] },
    [CATS]: { title: 'Kočky', articleIds: [3, 4] },
  };
  const data = publishedCategoryArticles(assignments, articles, NOW);
  assert.deepEqual(Object.keys(data.categories), [DOGS]);
  assert.equal(data.categories[DOGS].title, CATEGORY_ARTICLES_TITLE);
  assert.deepEqual(data.categories[DOGS].articles.map((a) => a.url), ['/poradna/dlouhy/?x=1', '/poradna/vycvik/']);
  assert.ok(data.categories[DOGS].articles[0].title.length <= 200);
});

test('one article can belong to several categories; renaming comes from the API', () => {
  const assignments = { [DOGS]: { title: 'Psi', articleIds: [1] }, [CATS]: { title: 'Kočky', articleIds: [1, 2] } };
  const renamed = articleSummaries(api.map((a) => (a.id === 1 ? { ...a, title: 'Nový název' } : a)));
  const data = publishedCategoryArticles(assignments, renamed, NOW);
  assert.equal(data.categories[DOGS].articles[0].title, 'Nový název');
  assert.deepEqual(data.categories[CATS].articles.map((a) => a.title), ['Nový název', 'Povely pro psa']);
});

test('no assignments or no articles give an empty file', () => {
  assert.deepEqual(publishedCategoryArticles({}, articles, NOW), { categories: {} });
  assert.deepEqual(publishedCategoryArticles({ [DOGS]: { title: '', articleIds: [1] } }, [], NOW), { categories: {} });
});

test('version changes with the assignments only', () => {
  const a = { [DOGS]: { title: '', articleIds: [1, 2] } };
  assert.equal(assignmentsVersion(a), assignmentsVersion({ [DOGS]: { title: '', articleIds: [1, 2] } }));
  assert.notEqual(assignmentsVersion(a), assignmentsVersion({ [DOGS]: { title: '', articleIds: [2, 1] } }));
});

test('missing permission has its own message', () => {
  assert.match(articlesErrorMessage(new Error('GET /api/articles: HTTP 403 Forbidden')), /oprávnění/);
  assert.match(articlesErrorMessage(new Error('fetch failed')), /nepodařilo načíst/);
});
