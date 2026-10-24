// Nastavení šablony: výchozí hodnoty, validace formuláře a kód, který se vkládá do e-shopu.
// Tvar konfigurace odpovídá window.asteroidConfig v theme/src/js/main.js.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from './config.mjs';
import { styleFiles } from '../../theme/src/js/styles.mjs';
import { HEADING_SIZES, headingOverrides, headingStyle } from '../../theme/src/js/typography.mjs';
import { assignmentsVersion, hasAssignments } from './category-articles.mjs';

export const HEADER_VARIANTS = [
  { value: 'v1', label: 'Kategorie v řádku pod hlavičkou' },
  { value: 'v2', label: 'Tlačítko „Katalog produktů“ + odkazy na stránky' },
  { value: 'v3', label: 'Tlačítko „Katalog produktů“ vedle loga' },
];

// Zobrazení bannerů na úvodní stránce. Bannery samotné (obrázky, odkazy, texty) se nahrávají
// v administraci Shoptetu, tady se volí jen způsob zobrazení.
export const BANNER_LAYOUTS = [
  {
    value: 'default',
    label: 'Výchozí',
    hint: 'Velký banner a vedle dva menší. Když postranní bannery nenahrajete, velký banner se roztáhne přes šířku obsahu. Rozměry: 1880 × 1000 px a 920 × 480 px.',
  },
  {
    value: 'content',
    label: 'Jeden banner přes šířku obsahu',
    hint: 'Zobrazí se jen bannery carouselu, postranní bannery se skryjí.',
  },
  {
    value: 'fullwidth',
    label: 'Jeden banner přes celou šířku obrazovky',
    hint: 'Bannery carouselu od okraje k okraji okna v původním poměru stran (bez ořezu), postranní se skryjí. Doporučujeme široký obrázek, např. 2880 × 960 px (poměr 3 : 1).',
  },
  {
    value: 'cards',
    label: 'Bannery na výšku (posuvný pás)',
    hint: 'Bannery z pozice Carousel jako karty na výšku vedle sebe (postranní bannery se nezobrazí), posouvají se šipkami nebo prstem. Nadpis, text a odkaz banneru se zobrazí na kartě. Doporučený rozměr 900 × 1200 px (poměr 3 : 4).',
  },
];

// Ikony dostupné v theme/src/icons pro rychlé odkazy.
export const QUICK_LINK_ICONS = ['local-fire-department', 'local-offer', 'filter-vintage', 'schedule'];

// Počet produktů vedle sebe v produktových sekcích úvodní stránky (Shoptet sám umí jen 3 nebo 4).
export const PRODUCT_COLUMNS = [4, 5, 6];

export const MAX_QUICK_LINKS = 6;
export const MAX_NAV_LINKS = 8;

// Kategorie na úvodní stránce: víc než 6 se zobrazí jako carousel. Strop hlídá i velikost kódu
// vkládaného do e-shopu (Shoptet povoluje 8192 znaků).
export const MAX_HOME_CATEGORIES = 16;
export const HOME_CATEGORIES_TITLE = 'Tohle u nás zrovna frčí';

export const DEFAULT_THEME_CONFIG = {
  header: 'v1',
  banners: 'default',
  phone: null,
  quickLinks: [],
  navLinks: [],
  homeCategories: { title: HOME_CATEGORIES_TITLE, items: [] },
  productColumns: 4,
  headings: {},
};

export { HEADING_SIZES };

const SNIPPET_LIMIT = 8192;

function text(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

// Odkaz smí být relativní na e-shopu (/novinky/) nebo absolutní https.
function safeUrl(value) {
  const url = text(value, 500);
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    return new URL(url).protocol === 'https:' ? url : '';
  } catch {
    return '';
  }
}

// Adresy z API jsou absolutní na doméně e-shopu, ukládáme jen cestu (kratší kód, funguje i na vlastní doméně).
function pathOf(value) {
  try {
    const url = new URL(value);
    return url.pathname + url.search;
  } catch {
    return '';
  }
}

// Kategorie pro výběr v nastavení: jen viditelné, ve stromovém pořadí jako v administraci,
// s cestou k nadřazeným kategoriím v popisku („Produkty › Šperky“).
export function categoryChoices(categories) {
  const visible = categories.filter((c) => c.visible !== false);
  const byParent = new Map();
  visible.forEach((c) => {
    const key = c.parentGuid || '';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(c);
  });

  const choices = [];
  const walk = (parentGuid, path) => {
    (byParent.get(parentGuid) || [])
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
      .forEach((c) => {
        const label = [...path, c.name].join(' › ');
        choices.push({ guid: c.guid, label });
        walk(c.guid, [...path, c.name]);
      });
  };
  walk('', []);
  return choices;
}

// Údaje kategorie pro šablonu: název, odkaz a náhled obrázku z administrace e-shopu.
function homeCategoryFromApi(category) {
  return {
    guid: category.guid,
    name: text(category.name, 80),
    url: pathOf(category.url),
    image: category.image ? pathOf(category.image) : '',
  };
}

// Vybrané kategorie (pole homeCategories, v pořadí formuláře). Údaje bereme z aktuálních kategorií
// e-shopu (smazané a skryté vypadnou). Když je API zrovna nedostupné, ponecháme dříve uložené.
function homeCategoriesFromForm(form, { categories, previous }) {
  const fromApi = new Map((categories || []).filter((c) => c.visible !== false).map((c) => [c.guid, c]));
  const fromPrevious = new Map((previous?.items || []).map((item) => [item.guid, item]));
  const items = [];
  for (const guid of new Set(form.getAll('homeCategories'))) {
    if (items.length >= MAX_HOME_CATEGORIES) break;
    const item = categories ? fromApi.has(guid) && homeCategoryFromApi(fromApi.get(guid)) : fromPrevious.get(guid);
    if (item?.name && item.url) items.push(item);
  }
  return { title: text(form.get('homeCategoriesTitle'), 80), items };
}

export function themeConfigFromForm(form, { categories, previous } = {}) {
  const header = HEADER_VARIANTS.some((v) => v.value === form.get('header')) ? form.get('header') : 'v1';
  const banners = BANNER_LAYOUTS.some((v) => v.value === form.get('banners')) ? form.get('banners') : 'default';

  // Číslo telefonu bere šablona z nastavení e-shopu, tady se vyplňuje jen otevírací doba.
  const hours = text(form.get('phoneHours'), 60);
  const phone = hours ? { hours } : null;

  const quickLinks = [];
  for (let i = 0; i < MAX_QUICK_LINKS; i += 1) {
    const label = text(form.get(`quickLinks[${i}][label]`), 40);
    const url = safeUrl(form.get(`quickLinks[${i}][url]`));
    const icon = form.get(`quickLinks[${i}][icon]`);
    if (!label || !url) continue;
    quickLinks.push({ label, url, ...(QUICK_LINK_ICONS.includes(icon) ? { icon } : {}) });
  }

  // Odkazy vedle „Katalogu produktů“ (hlavička v2).
  const navLinks = [];
  for (let i = 0; i < MAX_NAV_LINKS; i += 1) {
    const label = text(form.get(`navLinks[${i}][label]`), 40);
    const url = safeUrl(form.get(`navLinks[${i}][url]`));
    if (label && url) navLinks.push({ label, url });
  }

  const homeCategories = homeCategoriesFromForm(form, { categories, previous: previous?.homeCategories });
  const columns = Number(form.get('productColumns'));
  const productColumns = PRODUCT_COLUMNS.includes(columns) ? columns : DEFAULT_THEME_CONFIG.productColumns;

  // Velikosti nadpisů: ukládáme jen změněné, prázdné pole = výchozí z návrhu.
  const headings = headingOverrides(Object.fromEntries(
    Object.keys(HEADING_SIZES).map((level) => [level, form.get(`headings[${level}]`)]),
  ));

  return { header, banners, phone, quickLinks, navLinks, homeCategories, productColumns, headings };
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// JSON vložený do <script>: znak < escapujeme, aby text nemohl ukončit script tag.
function inlineJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

// Otisk obsahu sestaveného souboru (stejné nahrává npm run deploy). Nový obsah = nová adresa,
// jinak prohlížeč soubor bere z mezipaměti. Každý soubor má vlastní verzi: změna jedné varianty
// nevynutí nové stažení ostatních.
export function assetsVersion(file = 'asteroid.css') {
  if (config.assetsVersion) return config.assetsVersion;
  return createHash('sha256').update(readFileSync(join(config.themeDist, file))).digest('hex').slice(0, 12);
}

// Konfigurace do kódu e-shopu: nastavení šablony a adresa souboru s články ke kategoriím
// (jen když nějaká přiřazení jsou). Adresu ukládá server při uložení nastavení.
export function snippetConfig({ themeConfig, categoryArticles, categoryArticlesUrl } = {}) {
  const base = themeConfig || DEFAULT_THEME_CONFIG;
  if (!categoryArticlesUrl || !hasAssignments(categoryArticles)) return base;
  return { ...base, categoryArticles: `${categoryArticlesUrl}?v=${assignmentsVersion(categoryArticles)}` };
}

export function buildHeaderSnippet(themeConfig) {
  const base = escapeAttribute(config.assetsBase);
  const url = (file) => `${base}${file}?v=${encodeURIComponent(assetsVersion(file))}`;

  // Soubory jako obyčejné značky (ne document.write): prohlížeč je najde hned při čtení hlavičky.
  // Styly: základ a jen soubory zvolených variant (theme/src/js/styles.mjs), data-as-style pro
  // náhled jiné varianty (js/main.js). Skript zůstává blokující: třídy variant na <html> nastaví
  // před prvním vykreslením a jeho DOMContentLoaded běží před sliderem Shoptetu.
  // Font si šablona nenačítá: použije písmo zvolené v administraci, které načítá Shoptet.
  const styles = styleFiles(themeConfig)
    .map((name) => `<link rel="stylesheet" href="${url(`${name}.css`)}" data-as-style="${name}">`)
    .join('\n');
  const html = `<!-- aSteroid -->
<script>window.asteroidConfig = ${inlineJson(themeConfig)};</script>
${styles}${headingStyle(themeConfig.headings) ? `\n${headingStyle(themeConfig.headings)}` : ''}
<script src="${url('asteroid.js')}"></script>`;

  if (html.length > SNIPPET_LIMIT) {
    throw new Error(`Kód pro e-shop má ${html.length} znaků, Shoptet povoluje nejvýš ${SNIPPET_LIMIT}.`);
  }
  return html;
}
