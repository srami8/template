// Nastavení šablony: výchozí hodnoty, validace formuláře a kód, který se vkládá do e-shopu.
// Tvar konfigurace odpovídá window.asteroidConfig v theme/src/js/main.js.

import { config } from './config.mjs';

export const HEADER_VARIANTS = [
  { value: 'v1', label: 'Kategorie v řádku pod hlavičkou' },
  { value: 'v2', label: 'Tlačítko „Katalog produktů“ + odkazy na stránky' },
  { value: 'v3', label: 'Tlačítko „Katalog produktů“ vedle loga' },
];

// Ikony dostupné v theme/src/icons pro rychlé odkazy.
export const QUICK_LINK_ICONS = ['local-fire-department', 'local-offer', 'filter-vintage', 'schedule'];

export const MAX_QUICK_LINKS = 6;
export const MAX_NAV_LINKS = 8;

export const DEFAULT_THEME_CONFIG = {
  header: 'v1',
  phone: null,
  quickLinks: [],
  navLinks: [],
};

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

export function themeConfigFromForm(form) {
  const header = HEADER_VARIANTS.some((v) => v.value === form.get('header')) ? form.get('header') : 'v1';

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

  return { header, phone, quickLinks, navLinks };
}

// JSON vložený do <script>: znak < escapujeme, aby text nemohl ukončit script tag.
function inlineJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function buildHeaderSnippet(themeConfig) {
  const base = config.assetsBase;
  const version = config.assetsVersion === 'dev' ? 'Date.now()' : JSON.stringify(config.assetsVersion);

  // Font si šablona nenačítá: použije písmo zvolené v administraci, které načítá Shoptet.
  const html = `<!-- aSteroid -->
<script>
window.asteroidConfig = ${inlineJson(themeConfig)};
(function () {
  var base = ${JSON.stringify(base)};
  var v = ${version};
  document.write('<link rel="stylesheet" href="' + base + 'asteroid.css?v=' + v + '">');
  document.write('<script src="' + base + 'asteroid.js?v=' + v + '"><\\/script>');
})();
</script>`;

  if (html.length > SNIPPET_LIMIT) {
    throw new Error(`Kód pro e-shop má ${html.length} znaků, Shoptet povoluje nejvýš ${SNIPPET_LIMIT}.`);
  }
  return html;
}
