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
  HEADING_SIZES,
} from './theme-config.mjs';
import { CATEGORY_ARTICLES_TITLE, MAX_ARTICLES_PER_CATEGORY, articleState } from './category-articles.mjs';

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
  .as-headings { display: grid; gap: 8px; max-width: 420px; }
  .as-heading-field { display: grid; grid-template-columns: minmax(0, 1fr) 96px auto; align-items: center; gap: 12px; }
  .as-heading-field .textField { width: 96px; }
  .as-headings__reset { justify-self: start; margin-top: 8px; }
  .as-variant strong { display: block; }
  .as-links { display: grid; gap: 8px; align-items: center; }
  .as-links--quick { grid-template-columns: 1fr 1.4fr 1fr; }
  .as-links--nav { grid-template-columns: 1fr 1.4fr; }
  .as-links > span { font-size: 13px; opacity: 0.7; }
  .as-links .textField, .as-links select { width: 100%; }
  .as-categories { display: grid; gap: 8px; margin: 16px 0; padding: 0; list-style: none; }
  .as-categories li { display: flex; gap: 8px; align-items: center; }
  .as-categories select { flex: 1; }
  .as-ca-block { margin: 0 0 16px; padding: 16px; border: 1px solid rgba(128, 128, 128, 0.3); border-radius: 8px; }
  .as-ca-block__head { display: flex; gap: 12px; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .as-ca-block__head strong { font-size: 15px; }
  .as-ca-items { display: grid; gap: 6px; margin: 12px 0; padding: 0; list-style: none; counter-reset: ca; }
  .as-ca-items li { display: flex; gap: 8px; align-items: center; counter-increment: ca; }
  .as-ca-items li::before { content: counter(ca) "."; min-width: 20px; opacity: 0.6; }
  .as-ca-items li > span { flex: 1; min-width: 0; overflow-wrap: anywhere; }
  .as-ca-state { padding: 2px 6px; border-radius: 4px; background: #fdf3d8; color: #7a5300; font-size: 12px; white-space: nowrap; }
  .as-ca-search { display: flex; gap: 8px; }
  .as-ca-search input, .as-ca-add select { flex: 1; }
  .as-ca-add { display: flex; gap: 8px; margin-top: 8px; }
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

// Velikosti nadpisů H1–H6 (px). Prázdné / výchozí pole = velikost z návrhu. Skript hlídá, aby
// nadpisy šly od největšího, a umí vrátit výchozí hodnoty.
function headingsCard(headings = {}) {
  const fields = Object.entries(HEADING_SIZES).map(([level, size]) => `<label class="as-heading-field">
      <span style="font-size:${Math.min(headings[level] || size, 36)}px;font-weight:500;line-height:1.2">${level.toUpperCase()}</span>
      <input class="textField" type="number" name="headings[${level}]" min="12" max="72" step="1"
        value="${escape(String(headings[level] || size))}" data-default="${size}" aria-label="Velikost ${level.toUpperCase()} v px"> px
    </label>`).join('');
  return `<div class="as-headings">
    ${fields}
    <p class="v2FormField__hint as-headings__warning" hidden>Pozor: nadpis vyšší úrovně by měl být větší než nadpis nižší (H1 &gt; H2 &gt; … &gt; H6).</p>
    <button type="button" class="btn btn-default btn-sm as-headings__reset">Vrátit výchozí velikosti</button>
  </div>
  <script>
  (function () {
    var box = document.currentScript.previousElementSibling;
    var inputs = [].slice.call(box.querySelectorAll('input[name^="headings"]'));
    var warning = box.querySelector('.as-headings__warning');
    function check() {
      var sizes = inputs.map(function (input) { return Number(input.value) || Number(input.dataset.default); });
      warning.hidden = sizes.every(function (size, i) { return i === 0 || size <= sizes[i - 1]; });
    }
    inputs.forEach(function (input) { input.addEventListener('input', check); });
    box.querySelector('.as-headings__reset').addEventListener('click', function () {
      inputs.forEach(function (input) { input.value = input.dataset.default; });
      check();
    });
    check();
  })();
  </script>`;
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

// Popisek stavu článku, který se na e-shopu nezobrazí (v nastavení zůstává přiřazený).
function articleStateLabel(article, now = Date.now()) {
  const state = articleState(article, now);
  if (state === 'hidden') return 'skrytý, nezobrazí se';
  if (state === 'missing') return 'v e-shopu už není';
  if (state === 'scheduled') return `zobrazí se od ${new Date(article.publishDate).toLocaleDateString('cs-CZ')}`;
  return '';
}

// Články ke kategoriím: blok pro každou kategorii s nadpisem a seřaditelným seznamem článků,
// články se hledají v seznamu článků e-shopu (datalist). Stav drží skryté inputy v pořadí seznamu,
// skript jen přidává, přesouvá a odebírá řádky. Bez načtených článků nebo kategorií (chyba API)
// zůstanou uložená přiřazení ve skrytých polích a výběr nejde měnit.
function categoryArticlesCard(assignments, { articles, error }, choices) {
  const entries = Object.entries(assignments || {});
  const hidden = entries.map(([guid, a]) => `<input type="hidden" name="categoryArticles[${escape(guid)}][title]" value="${escape(a.title)}">${
    a.articleIds.map((id) => `<input type="hidden" name="categoryArticles[${escape(guid)}][ids]" value="${id}">`).join('')}`).join('');

  if (error || !articles || !choices) {
    const message = error || 'Kategorie e-shopu se nepodařilo načíst, přiřazení teď nejde změnit. Uložená přiřazení zůstávají beze změny.';
    return `${hidden}<div class="as-flash as-flash--err" role="alert">${escape(message)}</div>`;
  }

  const byId = new Map(articles.map((a) => [a.id, a]));
  const labels = new Map(choices.map((c) => [c.guid, c.label]));
  const now = Date.now();
  const item = (guid, id) => {
    const article = byId.get(id);
    const state = articleStateLabel(article, now);
    return `<li><input type="hidden" name="categoryArticles[${escape(guid)}][ids]" value="${id}">
      <span>${escape(article?.title || `Článek ${id}`)}</span>${state ? `<em class="as-ca-state">${escape(state)}</em>` : ''}
      <button class="btn btn-default btn-sm" type="button" data-ca-move="-1" aria-label="Posunout výš">↑</button>
      <button class="btn btn-default btn-sm" type="button" data-ca-move="1" aria-label="Posunout níž">↓</button>
      <button class="btn btn-secondary btn-sm" type="button" data-ca-remove>Odebrat</button></li>`;
  };
  const block = (guid, assignment = { title: '', articleIds: [] }) => `<div class="as-ca-block" data-ca-block="${escape(guid)}">
      <div class="as-ca-block__head">
        <strong>${escape(labels.get(guid) || 'Kategorie už v e-shopu není (přiřazení se nezobrazí)')}</strong>
        <button class="btn btn-secondary btn-sm" type="button" data-ca-remove-block>Odebrat kategorii</button>
      </div>
      <input class="textField" type="text" name="categoryArticles[${escape(guid)}][title]" value="${escape(assignment.title)}"
        placeholder="${escape(CATEGORY_ARTICLES_TITLE)}" maxlength="80" aria-label="Nadpis bloku článků">
      <ol class="as-ca-items">${assignment.articleIds.map((id) => item(guid, id)).join('')}</ol>
      <div class="as-ca-search">
        <input class="textField" type="search" list="as-ca-articles" placeholder="Hledat článek podle názvu…" aria-label="Přidat článek" data-ca-search>
      </div>
    </div>`;

  const options = articles.map((a) => {
    const state = articleStateLabel(a, now);
    return `<option value="${escape(`${a.title} (ID ${a.id})`)}">${escape(state)}</option>`;
  }).join('');
  const articleData = JSON.stringify(Object.fromEntries(articles.map((a) => [a.id, { title: a.title, state: articleStateLabel(a, now) }])))
    .replace(/</g, '\\u003c');
  const categoryOptions = choices.map((c) => `<option value="${escape(c.guid)}">${escape(c.label)}</option>`).join('');

  return `<div data-ca data-max="${MAX_ARTICLES_PER_CATEGORY}">
    ${articles.length ? '' : '<div class="as-flash as-flash--info" role="status">V e-shopu zatím nejsou žádné články (Blog / Články v administraci Shoptetu).</div>'}
    <div data-ca-blocks>${entries.map(([guid, a]) => block(guid, a)).join('')}</div>
    <div class="as-ca-add">
      <select class="textField" data-ca-category aria-label="Kategorie">${categoryOptions}</select>
      <button class="btn btn-secondary btn-md" type="button" data-ca-add-category>Přidat kategorii</button>
    </div>
    <datalist id="as-ca-articles">${options}</datalist>
    <template data-ca-block-template>${block('__GUID__')}</template>
    <template data-ca-item-template>${item('__GUID__', 0)}</template>
    <script type="application/json" data-ca-data>${articleData}</script>
  </div>
  <script>
  (function () {
    var root = document.querySelector('[data-ca]');
    var blocks = root.querySelector('[data-ca-blocks]');
    var data = JSON.parse(root.querySelector('[data-ca-data]').textContent);
    var max = Number(root.dataset.max);
    var labels = {};
    [].forEach.call(root.querySelectorAll('[data-ca-category] option'), function (o) { labels[o.value] = o.textContent; });

    function fromTemplate(selector, guid) {
      var html = root.querySelector(selector).innerHTML.split('__GUID__').join(guid);
      var box = document.createElement('div');
      box.innerHTML = html;
      return box.firstElementChild;
    }
    function addArticle(block, id) {
      var list = block.querySelector('.as-ca-items');
      var ids = [].map.call(list.querySelectorAll('input'), function (input) { return Number(input.value); });
      if (ids.indexOf(id) !== -1 || ids.length >= max) return;
      var li = fromTemplate('[data-ca-item-template]', block.dataset.caBlock);
      li.querySelector('input').value = id;
      li.querySelector('span').textContent = data[id].title;
      var state = li.querySelector('.as-ca-state');
      if (data[id].state) {
        if (!state) { state = document.createElement('em'); state.className = 'as-ca-state'; li.querySelector('span').after(state); }
        state.textContent = data[id].state;
      } else if (state) state.remove();
      list.appendChild(li);
    }

    root.querySelector('[data-ca-add-category]').addEventListener('click', function () {
      var guid = root.querySelector('[data-ca-category]').value;
      var existing = blocks.querySelector('[data-ca-block="' + guid + '"]');
      if (!existing) {
        existing = fromTemplate('[data-ca-block-template]', guid);
        existing.querySelector('strong').textContent = labels[guid];
        blocks.appendChild(existing);
      }
      existing.querySelector('[data-ca-search]').focus();
    });

    root.addEventListener('change', function (event) {
      var search = event.target.closest('[data-ca-search]');
      if (!search) return;
      var match = search.value.match(/\\(ID (\\d+)\\)$/);
      if (match && data[match[1]]) {
        addArticle(search.closest('[data-ca-block]'), Number(match[1]));
        search.value = '';
      }
    });

    root.addEventListener('click', function (event) {
      var target = event.target;
      if (target.closest('[data-ca-remove-block]')) return target.closest('[data-ca-block]').remove();
      var li = target.closest('.as-ca-items li');
      if (!li) return;
      if (target.closest('[data-ca-remove]')) return li.remove();
      var move = target.closest('[data-ca-move]');
      if (move && move.dataset.caMove === '-1' && li.previousElementSibling) li.parentNode.insertBefore(li, li.previousElementSibling);
      if (move && move.dataset.caMove === '1' && li.nextElementSibling) li.parentNode.insertBefore(li.nextElementSibling, li);
    });
  })();
  </script>`;
}

export function settingsPage({
  eshopName, eshopId, eshopOrigin, themeConfig, categoryChoices, categoryArticles = {}, articles = { articles: [], error: null },
  token, lang, flash,
}) {
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
          'Články ke kategoriím',
          categoryArticlesCard(categoryArticles, articles, categoryChoices),
          'Ke kategorii přiřaďte existující články e-shopu. Na stránce kategorie se zobrazí vedle popisu (na telefonu pod ním) v nastaveném pořadí. Název a odkaz článku se berou z e-shopu, skryté, smazané a dosud nezveřejněné články se nezobrazí. Odebrání článek nemaže.',
        )}
        ${card(
          'Produkty na úvodní stránce',
          productColumns,
          'Kolik produktů je vidět vedle sebe v produktových sekcích úvodní stránky (na širokém displeji, na menších se počet sám sníží). Ostatní produkty se posouvají šipkami. Výpis kategorie řídí nastavení e-shopu.',
        )}
        ${card(
          'Velikosti nadpisů',
          headingsCard(themeConfig.headings),
          'Velikost nadpisů H1–H6 na celém e-shopu (název produktu a kategorie, nadpisy sekcí, patička …). Výchozí hodnoty jsou z návrhu šablony. Na telefonu se velké nadpisy (H1–H3) samy zmenší asi o 15–20 %.',
        )}
        ${card(
          'Bannery na úvodní stránce podle názvu',
          `<p class="v2FormField__hint">Doplňkové bannery s pozicí <strong>Zápatí</strong> (Vzhled a obsah → Bannery → Doplňkové bannery) umístíte koncem interního názvu:</p>
          <ul class="v2FormField__hint">
            <li><strong>[1], [2], [3] …</strong> mozaika pod prvním pásem produktů na danou pozici (1. a 4. vysoký 920 × 1000 px, 2. a 3. nízký 920 × 480 px, pak znovu stejný vzor), např. „Makita [1]“,</li>
            <li><strong>[L] / [P]</strong> vedle produktové sekce se stejným nadpisem, vlevo / vpravo (obrázek 868 × 1018 px), např. „Omrkni nové kousky [L]“,</li>
            <li>bez značky zůstane banner v zápatí.</li>
          </ul>
          <p class="v2FormField__hint">Přihlášeným v administraci se na e-shopu u každého banneru ukáže štítek, kam patří. Zákazníci ho nevidí.</p>`,
          'Texty a tlačítka v mozaice jsou součástí obrázku. Bannery se Střed fungují také, Shoptet jich ale zobrazí nejvýš dva.',
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
