// HTML stránky nastavení. Všechny hodnoty od uživatele a z e-shopu procházejí přes escape().

import { HEADER_VARIANTS, QUICK_LINK_ICONS, MAX_QUICK_LINKS, MAX_NAV_LINKS } from './theme-config.mjs';

export function escape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(title, body) {
  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<style>
  :root { --primary: #1e9fe8; --text: #2e3545; --muted: #82868f; --border: #e6e8eb; --bg: #f5f5f5; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 32px 16px 64px; }
  h1 { margin: 0 0 4px; font-size: 26px; }
  .sub { margin: 0 0 24px; color: var(--muted); }
  section { margin-bottom: 16px; padding: 20px 24px; border: 1px solid var(--border); border-radius: 12px; background: #fff; }
  h2 { margin: 0 0 12px; font-size: 17px; }
  label { display: block; }
  .variant { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; }
  .variant + .variant { border-top: 1px solid var(--border); }
  .variant small { display: block; color: var(--muted); }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .links { display: grid; grid-template-columns: 1fr 1.4fr 1fr; gap: 8px; }
  .navlinks { display: grid; grid-template-columns: 1fr 1.4fr; gap: 8px; }
  .links span, .navlinks span { color: var(--muted); font-size: 13px; }
  input[type=text], select { width: 100%; height: 40px; padding: 0 12px; border: 1px solid #d5d7da; border-radius: 8px; font: inherit; color: inherit; background: #fff; }
  button { height: 44px; padding: 0 28px; border: 0; border-radius: 100px; background: var(--primary); color: #fff; font: 600 15px/1 inherit; cursor: pointer; }
  .flash { margin-bottom: 16px; padding: 12px 16px; border-radius: 8px; }
  .flash.ok { background: #e7f7e1; color: #1f6a05; }
  .flash.err { background: #fde8e8; color: #9b1c1c; }
  @media (max-width: 600px) { .grid, .links { grid-template-columns: 1fr; } }
</style>
</head>
<body><main>${body}</main></body>
</html>`;
}

export function settingsPage({ eshopName, eshopId, themeConfig, csrf, flash }) {
  const variants = HEADER_VARIANTS.map(
    (v) => `<label class="variant">
      <input type="radio" name="header" value="${v.value}" ${themeConfig.header === v.value ? 'checked' : ''}>
      <span><strong>${escape(v.value.toUpperCase())}</strong><small>${escape(v.label)}</small></span>
    </label>`,
  ).join('');

  const links = Array.from({ length: MAX_QUICK_LINKS }, (_, i) => {
    const link = themeConfig.quickLinks[i] || {};
    const options = ['', ...QUICK_LINK_ICONS]
      .map((icon) => `<option value="${icon}" ${link.icon === icon ? 'selected' : ''}>${icon || 'bez ikony'}</option>`)
      .join('');
    return `<input type="text" name="quickLinks[${i}][label]" value="${escape(link.label)}" placeholder="Text">
      <input type="text" name="quickLinks[${i}][url]" value="${escape(link.url)}" placeholder="/novinky/">
      <select name="quickLinks[${i}][icon]">${options}</select>`;
  }).join('');

  const navLinks = Array.from({ length: MAX_NAV_LINKS }, (_, i) => {
    const link = (themeConfig.navLinks || [])[i] || {};
    return `<input type="text" name="navLinks[${i}][label]" value="${escape(link.label)}" placeholder="Text">
      <input type="text" name="navLinks[${i}][url]" value="${escape(link.url)}" placeholder="/kontakty/">`;
  }).join('');

  const flashHtml = flash ? `<div class="flash ${flash.type}">${escape(flash.message)}</div>` : '';

  return layout(
    'Nastavení šablony aSteroid',
    `<h1>Nastavení šablony aSteroid</h1>
    <p class="sub">${escape(eshopName)} (ID ${escape(eshopId)})</p>
    ${flashHtml}
    <form method="post" action="/settings?eshopId=${encodeURIComponent(eshopId)}">
      <input type="hidden" name="csrf" value="${escape(csrf)}">
      <section>
        <h2>Vzhled hlavičky</h2>
        ${variants}
      </section>
      <section>
        <h2>Telefon v horní liště</h2>
        <div class="grid">
          <label>Číslo<input type="text" name="phoneNumber" value="${escape(themeConfig.phone?.number)}" placeholder="+420 777 888 998"></label>
          <label>Otevírací doba<input type="text" name="phoneHours" value="${escape(themeConfig.phone?.hours)}" placeholder="po–pá: 9:00–17:00"></label>
        </div>
      </section>
      <section>
        <h2>Rychlé odkazy pod hlavičkou</h2>
        <div class="links"><span>Text</span><span>Odkaz</span><span>Ikona</span>${links}</div>
      </section>
      <section>
        <h2>Odkazy vedle „Katalogu produktů“</h2>
        <p class="sub">Použije se u hlavičky V2. Kategorie z hlavního menu jsou v Katalogu produktů, sem patří stránky jako Kontakt nebo Doprava.</p>
        <div class="navlinks"><span>Text</span><span>Odkaz</span>${navLinks}</div>
      </section>
      <button type="submit">Uložit a použít na e-shopu</button>
    </form>`,
  );
}

export function messagePage(title, message) {
  return layout(title, `<h1>${escape(title)}</h1><p class="sub">${escape(message)}</p>`);
}
