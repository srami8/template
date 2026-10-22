// HTML stránky nastavení. Všechny hodnoty od uživatele a z e-shopu procházejí přes escape().
// Stránka se zobrazuje v administraci Shoptetu (iframe), proto používá knihovnu Shoptet UI,
// skript iframe-resizer (výška rámu) a přebírá motiv administrace (světlý / tmavý).

import { HEADER_VARIANTS, QUICK_LINK_ICONS, MAX_QUICK_LINKS, MAX_NAV_LINKS } from './theme-config.mjs';

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
  .as-flash { margin-bottom: 16px; padding: 12px 16px; border-radius: 8px; }
  .as-flash--ok { background: #e7f7e1; color: #1f6a05; }
  .as-flash--err { background: #fde8e8; color: #9b1c1c; }
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

export function settingsPage({ eshopName, eshopId, eshopOrigin, themeConfig, token, lang, flash }) {
  const variants = HEADER_VARIANTS.map(
    (v) => `<label class="as-variant" title="${escape(v.label)}">
      <input class="radioField" type="radio" name="header" value="${v.value}" ${themeConfig.header === v.value ? 'checked' : ''}>
      <span><strong>${escape(v.value.toUpperCase())}</strong><span class="v2FormField__hint">${escape(v.label)}</span></span>
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

export function messagePage(title, message) {
  return layout(title, `<main class="as-page">${intro()}<div class="as-flash as-flash--err" role="alert"><strong>${escape(title)}</strong><br>${escape(message)}</div></main>`);
}
