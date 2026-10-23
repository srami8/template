// HTML stránky nastavení. Všechny hodnoty od uživatele a z e-shopu procházejí přes escape().
// Stránka se zobrazuje v administraci Shoptetu (iframe), proto používá knihovnu Shoptet UI,
// skript iframe-resizer (výška rámu) a přebírá motiv administrace (světlý / tmavý).

import {
  HEADER_VARIANTS,
  BANNER_LAYOUTS,
  QUICK_LINK_ICONS,
  MAX_QUICK_LINKS,
  MAX_NAV_LINKS,
  MAX_HOME_CATEGORIES,
  HOME_CATEGORIES_TITLE,
  PRODUCT_COLUMNS,
} from './theme-config.mjs';

const SHOPTET_UI_CSS = 'https://cdn.jsdelivr.net/npm/@shoptet/ui@0.23.0-beta/dist/index.css';
const IFRAME_RESIZER = 'https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.16/iframeResizer.contentWindow.min.js';

export function escape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Motiv administrace: po načtení si o něj řekneme rodičovskému oknu a zprávy přijímáme jen
// z domény e-shopu nebo *.myshoptet.com. Zpráva obsahuje jen přepínače tříd na <body>.
function themeScript(eshopOrigin) {
  return `<script>
(function () {
  var allowed = ${JSON.stringify(eshopOrigin || '')};
  function trusted(origin) {
    return origin === allowed || /^https:\\/\\/[a-z0-9-]+\\.myshoptet\\.com$/.test(origin);
  }
  window.addEventListener('message', function (event) {
    if (!trusted(event.origin) || !event.data || event.data.type !== 'shoptet:admin-theme') return;
    var classes = event.data.bodyClasses || {};
    Object.keys(classes).forEach(function (name) {
      document.body.classList.toggle(name, Boolean(classes[name]));
    });
  });
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'shoptet:admin-theme-request' }, '*');
  }
})();
</script>`;
}

function layout(title, body, { eshopOrigin } = {}) {
  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<link rel="stylesheet" href="${SHOPTET_UI_CSS}">
<style>
  /* iframe-resizer měří výšku z <body>, nesmí mít pevnou výšku. */
  html, body { height: auto; }
  body { margin: 0; }
  .as-page { max-width: 960px; padding: 24px; }
  .as-intro { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; }
  .as-logo { font: 900 28px/1 Inter, Arial, sans-serif; color: #2e3545; }
  .as-logo span { color: #1e9fe8; }
  .as-intro h1 { margin: 0 0 4px; font-size: 20px; }
  .as-intro p { margin: 0; opacity: 0.75; }
  .as-page .card { margin-bottom: 16px; }
  .as-variant { display: flex; gap: 12px; align-items: flex-start; padding: 8px 0; cursor: pointer; }
  .as-variant strong { display: block; }
  .as-links { display: grid; gap: 8px; align-items: center; }
  .as-links--quick { grid-template-columns: 1fr 1.4fr 1fr; }
  .as-links--nav { grid-template-columns: 1fr 1.4fr; }
  .as-links > span { font-size: 13px; opacity: 0.7; }
  .as-links .textField, .as-links select { width: 100%; }
  .as-categories { display: grid; gap: 8px; margin: 16px 0; padding: 0; list-style: none; }
  .as-categories li { display: flex; gap: 8px; align-items: center; }
  .as-categories select { flex: 1; }
  .as-flash { margin-bottom: 16px; padding: 12px 16px; border-radius: 8px; }
  .as-flash--ok { background: #e7f7e1; color: #1f6a05; }
  .as-flash--err { background: #fde8e8; color: #9b1c1c; }
  .as-flash--info { background: #e9f6fd; color: #0f5074; }
  body.theme-dark .as-logo { color: #fff; }
</style>
</head>
<body>
${body}
<script src="${IFRAME_RESIZER}"></script>
${themeScript(eshopOrigin)}
</body>
</html>`;
}

function intro() {
  return `<header class="as-intro">
    <div class="as-logo" aria-hidden="true"><span>a</span>Steroid<span>.</span></div>
    <div>
      <h1>Nastavení šablony aSteroid</h1>
      <p>Vyberte vzhled hlavičky a doplňte, co se v ní má zobrazit. Po uložení se změny hned projeví na e-shopu.</p>
    </div>
  </header>`;
}

function card(title, content, hint) {
  return `<section class="card card--bordered">
    <div class="card__header"><h2 class="card__title">${escape(title)}</h2></div>
    <div class="card__content">
      ${hint ? `<p class="v2FormField__hint">${escape(hint)}</p>` : ''}
      ${content}
    </div>
  </section>`;
}

// Kategorie na úvodní stránce: jeden výběr na řádek, „Přidat další kategorie“ přidá další řádek
// (šablona <template>, skript níže). Bez načtených kategorií (chyba API) zůstanou uložené kategorie
// ve skrytých polích, aby se uložením ostatních nastavení neztratily.
function homeCategoriesCard(homeCategories, choices) {
  const items = homeCategories?.items || [];
  const title = homeCategories?.title ?? HOME_CATEGORIES_TITLE;
  const titleField = `<div class="v2form">
    <div class="v2FormField">
      <label class="v2FormField__label" for="homeCategoriesTitle">Nadpis</label>
      <div class="v2FormField__input">
        <input class="textField md" type="text" id="homeCategoriesTitle" name="homeCategoriesTitle" value="${escape(title)}" placeholder="${escape(HOME_CATEGORIES_TITLE)}" maxlength="80">
      </div>
    </div>
  </div>`;

  if (!choices) {
    const kept = items.map((item) => `<input type="hidden" name="homeCategories" value="${escape(item.guid)}">`).join('');
    const names = items.map((item) => escape(item.name)).join(', ') || 'žádné';
    return `${titleField}${kept}
      <div class="as-flash as-flash--err" role="alert">Kategorie e-shopu se nepodařilo načíst, výběr teď nejde změnit. Uložené kategorie: ${names}.</div>`;
  }

  const select = (selected) => `<select class="textField" name="homeCategories" aria-label="Kategorie">
      ${choices.map((c) => `<option value="${escape(c.guid)}" ${c.guid === selected ? 'selected' : ''}>${escape(c.label)}</option>`).join('')}
    </select>`;
  const row = (selected) => `<li>${select(selected)}
      <button class="btn btn-secondary btn-sm" type="button" data-remove-category>Odebrat</button></li>`;

  // Kategorie, které už v e-shopu nejsou (smazané, skryté), ve výběru nenabízíme a při uložení vypadnou.
  const known = new Set(choices.map((c) => c.guid));
  const rows = items.filter((item) => known.has(item.guid)).map((item) => row(item.guid)).join('');

  return `${titleField}
    <ul class="as-categories" data-categories data-max="${MAX_HOME_CATEGORIES}">${rows}</ul>
    <template data-category-row>${row('')}</template>
    <button class="btn btn-secondary btn-md" type="button" data-add-category>Přidat další kategorie</button>
    <script>
    (function () {
      var list = document.querySelector('[data-categories]');
      var template = document.querySelector('[data-category-row]');
      var add = document.querySelector('[data-add-category]');
      var max = Number(list.dataset.max);
      function update() { add.hidden = list.children.length >= max; }
      add.addEventListener('click', function () {
        list.appendChild(template.content.cloneNode(true));
        list.lastElementChild.querySelector('select').focus();
        update();
      });
      list.addEventListener('click', function (event) {
        var button = event.target.closest('[data-remove-category]');
        if (!button) return;
        button.closest('li').remove();
        update();
      });
      update();
    })();
    </script>`;
}

export function settingsPage({ eshopName, eshopId, eshopOrigin, themeConfig, categoryChoices, token, lang, flash }) {
  const variants = HEADER_VARIANTS.map(
    (v) => `<label class="as-variant" title="${escape(v.label)}">
      <input class="radioField" type="radio" name="header" value="${v.value}" ${themeConfig.header === v.value ? 'checked' : ''}>
      <span><strong>${escape(v.value.toUpperCase())}</strong><span class="v2FormField__hint">${escape(v.label)}</span></span>
    </label>`,
  ).join('');

  const bannerLayouts = BANNER_LAYOUTS.map(
    (v) => `<label class="as-variant" title="${escape(v.hint)}">
      <input class="radioField" type="radio" name="banners" value="${v.value}" ${(themeConfig.banners || 'default') === v.value ? 'checked' : ''}>
      <span><strong>${escape(v.label)}</strong><span class="v2FormField__hint">${escape(v.hint)}</span></span>
    </label>`,
  ).join('');

  const productColumns = PRODUCT_COLUMNS.map(
    (count) => `<label class="as-variant">
      <input class="radioField" type="radio" name="productColumns" value="${count}" ${Number(themeConfig.productColumns || 4) === count ? 'checked' : ''}>
      <span><strong>${count} ${count < 5 ? 'produkty' : 'produktů'}</strong></span>
    </label>`,
  ).join('');

  const phone = `<div class="v2form">
    <div class="v2FormField">
      <label class="v2FormField__label" for="phoneHours">Otevírací doba</label>
      <div class="v2FormField__input">
        <input class="textField md" type="text" id="phoneHours" name="phoneHours" value="${escape(themeConfig.phone?.hours)}" placeholder="po–pá: 9:00–17:00" title="Zobrazí se za číslem v závorce">
      </div>
    </div>
  </div>`;

  const quickLinks = Array.from({ length: MAX_QUICK_LINKS }, (_, i) => {
    const link = themeConfig.quickLinks[i] || {};
    const options = ['', ...QUICK_LINK_ICONS]
      .map((icon) => `<option value="${icon}" ${link.icon === icon ? 'selected' : ''}>${icon || 'bez ikony'}</option>`)
      .join('');
    return `<input class="textField" type="text" name="quickLinks[${i}][label]" value="${escape(link.label)}" placeholder="Text odkazu" title="Text odkazu">
      <input class="textField" type="text" name="quickLinks[${i}][url]" value="${escape(link.url)}" placeholder="/novinky/" title="Adresa na e-shopu (/novinky/) nebo celá https adresa">
      <select class="textField" name="quickLinks[${i}][icon]" title="Ikona před textem">${options}</select>`;
  }).join('');

  const navLinks = Array.from({ length: MAX_NAV_LINKS }, (_, i) => {
    const link = (themeConfig.navLinks || [])[i] || {};
    return `<input class="textField" type="text" name="navLinks[${i}][label]" value="${escape(link.label)}" placeholder="Text odkazu" title="Text odkazu">
      <input class="textField" type="text" name="navLinks[${i}][url]" value="${escape(link.url)}" placeholder="/kontakty/" title="Adresa na e-shopu (/kontakty/) nebo celá https adresa">`;
  }).join('');

  const flashHtml = flash ? `<div class="as-flash as-flash--${flash.type}" role="status">${escape(flash.message)}</div>` : '';

  return layout(
    'Nastavení šablony aSteroid',
    `<main class="as-page">
      ${intro()}
      ${flashHtml}
      <form method="post" action="/settings?eshopId=${encodeURIComponent(eshopId)}">
        <input type="hidden" name="t" value="${escape(token)}">
        <input type="hidden" name="lang" value="${escape(lang)}">
        ${card('Vzhled hlavičky', variants, `E-shop ${eshopName} (ID ${eshopId})`)}
        ${card(
          'Bannery na úvodní stránce',
          bannerLayouts,
          'Bannery nahráváte jako obvykle v administraci Shoptetu (Vzhled a obsah → Bannery). Tady zvolíte, jak se zobrazí.',
        )}
        ${card(
          'Kategorie na úvodní stránce',
          homeCategoriesCard(themeConfig.homeCategories, categoryChoices),
          'Vybrané kategorie se zobrazí pod bannery s názvem, obrázkem a odkazem z administrace e-shopu. Víc než 6 kategorií se posouvá jako carousel. Po přejmenování kategorie nebo změně jejího obrázku nastavení znovu uložte.',
        )}
        ${card(
          'Produkty na úvodní stránce',
          productColumns,
          'Kolik produktů je vidět vedle sebe v produktových sekcích úvodní stránky (na širokém displeji, na menších se počet sám sníží). Ostatní produkty se posouvají šipkami. Výpis kategorie řídí nastavení e-shopu.',
        )}
        ${card(
          'Telefon v horní liště',
          phone,
          'Telefonní číslo se přebírá z kontaktních údajů v nastavení e-shopu. Tady doplňte jen otevírací dobu, která se zobrazí za číslem.',
        )}
        ${card(
          'Rychlé odkazy pod hlavičkou',
          `<div class="as-links as-links--quick"><span>Text</span><span>Odkaz</span><span>Ikona</span>${quickLinks}</div>`,
          'Řádek odkazů pod vyhledáváním, např. Novinky nebo Akční nabídka. Prázdné řádky se nezobrazí.',
        )}
        ${card(
          'Odkazy vedle „Katalogu produktů“',
          `<div class="as-links as-links--nav"><span>Text</span><span>Odkaz</span>${navLinks}</div>`,
          'Použije se u hlavičky V2. Kategorie z hlavního menu jsou v Katalogu produktů, sem patří stránky jako Kontakt nebo Doprava.',
        )}
        <div class="v2formButtons">
          <button class="btn btn-primary btn-md" type="submit">Uložit a použít na e-shopu</button>
        </div>
      </form>
    </main>`,
    { eshopOrigin },
  );
}

export function messagePage(title, message, { type = 'err' } = {}) {
  const role = type === 'err' ? 'alert' : 'status';
  return layout(title, `<main class="as-page">${intro()}<div class="as-flash as-flash--${type}" role="${role}"><strong>${escape(title)}</strong><br>${escape(message)}</div></main>`);
}
