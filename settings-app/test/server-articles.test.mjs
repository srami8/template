// Spouštíme skutečné funkce serveru izolovaně, bez OAuth, sítě a zápisu instalací.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const source = readFileSync(new URL('../src/server.mjs', import.meta.url), 'utf8');
const functionSource = (start, end) => source.slice(source.indexOf(start), source.indexOf(end));

test('an API refresh publishes the assignments saved while the request was pending', async () => {
  let complete;
  let installation = { categoryArticles: { old: true } };
  const context = createContext({
    Date, console,
    getArticles: () => new Promise((resolve) => { complete = resolve; }),
    articleSummaries: (value) => value,
    getInstallation: () => installation,
    saveInstallation: (_, patch) => { installation = { ...installation, ...patch }; },
    publishedCategoryArticles: (assignments) => assignments,
  });
  runInContext(functionSource('async function loadArticles(', 'async function readForm('), context);
  const pending = context.loadArticles(installation, '1');
  installation = { ...installation, categoryArticles: { current: true } };
  complete([]);
  await pending;
  assert.deepEqual(installation.categoryArticlesPublished.data, { current: true });
});

test('a cold cache failure is retried only after one minute and is never cached as empty success', async () => {
  let attempts = 0;
  let now = 1_000_000;
  const lastRefresh = new Map();
  const context = createContext({
    Date: { now: () => now }, JSON,
    ARTICLES_REFRESH: 600000, ARTICLES_RETRY: 60000, ARTICLES_MAX_AGE: 300,
    lastRefresh,
    getInstallation: () => ({}),
    refreshPublishedArticles: async (id) => { attempts++; lastRefresh.set(id, now); },
  });
  runInContext(functionSource('async function handlePublicArticles(', '// Kořen adresy:'), context);
  const statuses = [];
  const response = { writeHead(status, headers) { statuses.push(status); assert.equal(headers['Cache-Control'], 'no-store'); }, end() {} };
  for (let i = 0; i < 3; i++) await context.handlePublicArticles({}, response, { pathname: '/public/1/category-articles.json' });
  assert.equal(attempts, 1);
  assert.deepEqual(statuses, [503, 503, 503]);
  now += 60001;
  await context.handlePublicArticles({}, response, { pathname: '/public/1/category-articles.json' });
  assert.equal(attempts, 2);
});
