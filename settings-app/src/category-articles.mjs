// Články ke kategoriím (issue #1): admin v nastavení přiřadí ke kategorii existující články e-shopu.
//
// Ukládá se jen GUID kategorie a ID článků v pořadí (installation.categoryArticles). Název, adresu
// a zveřejnění článku bereme vždy z API Shoptetu, takže přejmenování, skrytí nebo smazání článku
// se projeví bez nového uložení. Přiřazení se samo nikdy nemaže: skrytý, smazaný nebo budoucí
// článek se jen nezveřejní a admin ho v nastavení vidí označený.
//
// Šablona čte zveřejněná data z veřejného souboru (server.mjs, /public/<eshopId>/category-articles.json),
// ne z globálního kódu v hlavičce: přiřazení může být hodně a kód hlavičky má limit 8192 znaků.

import { createHash } from 'node:crypto';

export const CATEGORY_ARTICLES_TITLE = 'Články z poradny';
export const MAX_ARTICLES_PER_CATEGORY = 10;
export const MAX_ARTICLE_CATEGORIES = 300;

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

// Adresy z API jsou absolutní na doméně e-shopu, šabloně stačí cesta (funguje i na vlastní doméně).
function pathOf(value) {
  try {
    const url = new URL(value);
    return url.pathname + url.search;
  } catch {
    return '';
  }
}

// Stav článku pro zveřejnění: viditelný na webu a s datem zveřejnění, které už nastalo.
export function articleState(article, now = Date.now()) {
  if (!article) return 'missing';
  if (article.visible !== true) return 'hidden';
  if (article.publishDate && Date.parse(article.publishDate) > now) return 'scheduled';
  return 'published';
}

// Články z API zúžené na to, co potřebuje nastavení a zveřejnění.
export function articleSummaries(articles) {
  return articles.map((a) => ({
    id: Number(a.id),
    title: text(a.title, 200),
    url: pathOf(a.url),
    visible: a.visible === true,
    publishDate: a.publishDate || null,
  }));
}

// Formulář: pro každou kategorii categoryArticles[<guid>][title] a categoryArticles[<guid>][ids]
// (ID článků v pořadí). Kategorie bez článků se neukládá. Neznámé ID kategorie / článku
// (podvržený formulář) se zahodí podle tvaru, existenci ověřuje až zveřejnění.
export function categoryArticlesFromForm(form) {
  const result = {};
  const pattern = /^categoryArticles\[([^\]]+)\]\[ids\]$/;
  for (const key of new Set(form.keys())) {
    const guid = key.match(pattern)?.[1];
    if (!guid || !GUID.test(guid) || result[guid]) continue;
    if (Object.keys(result).length >= MAX_ARTICLE_CATEGORIES) break;
    const ids = [...new Set(form.getAll(key).map(Number).filter((id) => Number.isInteger(id) && id > 0))]
      .slice(0, MAX_ARTICLES_PER_CATEGORY);
    if (!ids.length) continue;
    const title = text(form.get(`categoryArticles[${guid}][title]`), 80);
    result[guid] = { title, articleIds: ids };
  }
  return result;
}

// Zveřejněná data pro šablonu: jen kategorie s aspoň jedním zveřejněným článkem, články v pořadí
// z nastavení. Prázdný nadpis = výchozí.
export function publishedCategoryArticles(assignments, articles, now = Date.now()) {
  const byId = new Map(articles.map((a) => [Number(a.id), a]));
  const categories = {};
  for (const [guid, { title, articleIds }] of Object.entries(assignments || {})) {
    const items = articleIds
      .map((id) => byId.get(id))
      .filter((article) => articleState(article, now) === 'published' && article.title && article.url)
      .map((article) => ({ title: article.title, url: article.url }));
    if (items.length) categories[guid] = { title: title || CATEGORY_ARTICLES_TITLE, articles: items };
  }
  return { categories };
}

// Verze do adresy souboru v kódu e-shopu: mění se s uloženým přiřazením, takže po uložení
// prohlížeč nevezme starý soubor z mezipaměti. Změny článků v e-shopu se projeví po vypršení
// mezipaměti souboru (server.mjs).
export function assignmentsVersion(assignments) {
  return createHash('sha256').update(JSON.stringify(assignments || {})).digest('hex').slice(0, 12);
}

export function hasAssignments(assignments) {
  return Object.keys(assignments || {}).length > 0;
}

// Chyba načtení článků jako zpráva pro admina. Bez oprávnění (403) vrací Shoptet chybu
// i po obnovení tokenu (shoptet.mjs api).
export function articlesErrorMessage(error) {
  if (/HTTP 403/.test(error?.message || '')) {
    return 'Doplněk nemá oprávnění číst články e-shopu. Je potřeba ho v nastavení doplňku přidat (přístup k článkům) a doplněk znovu schválit. Uložená přiřazení zůstávají beze změny.';
  }
  return 'Články e-shopu se teď nepodařilo načíst, přiřazení nejde změnit. Uložená přiřazení zůstávají beze změny a e-shop dál zobrazuje poslední načtená data.';
}
