// Kontrola, že základ pro Blank mode (theme/src/scss/foundation, vrstva @layer as-foundation) s CSS
// Disca nic nemění – tak, jak e-shop vidí obchodníci. Na testovacím e-shopu s CSS Shoptetu a místním
// buildem aSteroidu změří všechny vypočítané vlastnosti a polohu všech prvků (html, body, svg, ::before,
// ::after, ::marker, ::placeholder). Pak ve stejném DOM vymění asteroid.css za verzi bez vrstvy
// as-foundation, změří znovu a vrstvu vrátí. Rozdíl hlásí, jen když se stav po vrácení shoduje
// s prvním měřením (jinak jde o šum, např. běžící karusel). Měří výchozí stav a ještě stav
// s otevřenými okny, menu a nabídkami (třídy, které přidává JS Shoptetu).
//
//   npm run build && npm run foundation:noop        (PAGES=/,/kosik/ … jen vybrané stránky)
//
// Měří i košík s testovacím produktem a oba kroky objednávky (jen headless prohlížeč, žádné údaje se
// nevyplňují, objednávka nevzniká, košík se na konci vyprázdní). Na konci vypíše selektory vrstvy, které
// na žádné měřené stránce nenašly prvek: pro ně kontrola nic nedokládá.
//
// Skončí chybou i tehdy, když vrstva nebo asteroid.css chybí, nebo když se stránka během měření změnila
// tak, že měření neplatí (jiný počet prvků, příliš mnoho rozdílů mezi prvním měřením a stavem po vrácení).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');
const { withoutFoundation } = require('../responsive/theme-css.cjs');

const SHOP = 'https://313980.myshoptet.com';
const DIST = path.resolve(__dirname, '../../theme/dist');
const PAGES = process.env.PAGES ? process.env.PAGES.split(',') : ['/', '/sperky/', '/pletene-kosiky/', '/zbozi/dreveny-privesek-bracken-pendant-6/', '/vyhledavani/?string=test',
  '/kosik/', '/login/', '/registrace/', '/kontakty/', '/rubriky/nase-novinky/', '/rubriky/nase-novinky/testovaci-clanky-dolor/',
  '/hodnoceni-obchodu/', '/obchodni-podminky/', '/tato-stranka-neexistuje-404/'];
const VIEWPORTS = {
  1440: { viewport: { width: 1440, height: 900 } },
  1024: { viewport: { width: 1024, height: 800 } },
  768: { viewport: { width: 768, height: 1000 } },
  390: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
};
// Přechody a animace okamžitě, ať výměna CSS není vidět v půlce přechodu (stejné ve všech měřeních).
const INSTANT = '*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important;animation-duration:0s!important;animation-delay:0s!important}';
// Dnes se A a C liší nejvýš u pár prvků (margin:auto u .container vrací Chromium až po přepočtu stylů).
const MAX_NOISE = 20;
const PRODUCT = '/zbozi/dreveny-privesek-bracken-pendant-6/';

// Stav s otevřenými prvky: třídy, které přidává JS Shoptetu (okna, menu, nabídky, rozbalení).
function openStates() {
  document.body.classList.add('user-action-visible', 'login-window-visible', 'cart-window-visible', 'search-window-visible',
    'submenu-visible', 'menu-helper-visible', 'navigation-window-visible', 'msg-visible',
    'navigation-hovered', 'top-navigation-menu-visible', 'search-focused');
  document.querySelector('#navigation .menu-level-1 > li.ext')?.classList.add('exp');
  document.querySelector('.dropdown')?.classList.add('open');
  document.querySelectorAll('.js-hidden').forEach((el) => el.classList.add('visible'));
  document.querySelectorAll('.sidebar-inner').forEach((el) => el.classList.add('visible'));
}

// Všechny vypočítané vlastnosti (bez vlastních proměnných) a poloha; uloží se do window[key].
function snapshot(key) {
  const read = (cs) => {
    const out = [];
    for (let i = 0; i < cs.length; i++) {
      const p = cs[i];
      if (!p.startsWith('--')) out.push(`${p}:${cs.getPropertyValue(p)}`);
    }
    return out.join(';');
  };
  const nodes = [document.documentElement, ...document.querySelectorAll('body, body *')];
  const map = new Map();
  nodes.forEach((el, index) => {
    if (el.closest('script, style, noscript, template')) return;
    const r = el.getBoundingClientRect();
    const box = [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 2) / 2).join(',');
    map.set(`${index}`, `${read(getComputedStyle(el))}|${box}`);
    for (const pseudo of ['::before', '::after']) {
      const cs = getComputedStyle(el, pseudo);
      if (cs.content !== 'none' && cs.content !== 'normal') map.set(`${index}${pseudo}`, read(cs));
    }
    if (getComputedStyle(el).display === 'list-item') map.set(`${index}::marker`, read(getComputedStyle(el, '::marker')));
    if (el.matches('input[placeholder], textarea[placeholder]')) map.set(`${index}::placeholder`, read(getComputedStyle(el, '::placeholder')));
  });
  window[key] = map;
  return map.size;
}

// Rozdíly A (s vrstvou) × B (bez ní), které se po vrácení vrstvy (C) shodují s A.
function compare() {
  const { __A: a, __B: b, __C: c } = window;
  const nodes = [document.documentElement, ...document.querySelectorAll('body, body *')];
  const part = (e) => e.tagName.toLowerCase() + (e.id ? `#${e.id}` : '') + [...e.classList].slice(0, 3).map((x) => `.${x}`).join('');
  const where = (key) => {
    const chain = [];
    for (let e = nodes[parseInt(key, 10)]; e && chain.length < 4; e = e.parentElement) {
      chain.unshift(part(e));
      if (e === document.body) break;
    }
    return chain.join(' > ') + key.replace(/^\d+/, '');
  };
  const split = (v) => {
    const [styles, box = ''] = v.split('|');
    return [new Map(styles.split(';').map((d) => [d.slice(0, d.indexOf(':')), d.slice(d.indexOf(':') + 1)])), box];
  };
  const describe = (x, y) => {
    const [sx, bx] = split(x), [sy, by] = split(y);
    const out = [];
    for (const [k, v] of sy) if (sx.get(k) !== v) out.push(`${k}: ${sx.get(k)} → ${v}`);
    if (bx !== by) out.push(`poloha a rozměr: ${bx} → ${by}`);
    return out.join('; ');
  };
  const found = [];
  for (const [key, va] of a) {
    const vb = b.get(key), vc = c.get(key);
    if (vb === undefined) { if (vc !== undefined) found.push(`${where(key)} — bez vrstvy chybí`); continue; }
    if (va !== vb && va === vc) found.push(`${where(key)} — ${describe(va, vb)}`);
  }
  for (const key of b.keys()) if (!a.has(key) && !c.has(key)) found.push(`${where(key)} — jen bez vrstvy`);
  let noise = 0;
  for (const [key, va] of a) if (va !== c.get(key)) noise++;
  return { found, noise, sizes: [a.size, c.size] };
}

// Selektory vrstvy, které na této stránce našly prvek, a všechny selektory vrstvy.
function layerSelectors() {
  const all = [];
  const walk = (rules, inLayer) => {
    for (const rule of rules) {
      const here = inLayer || (rule instanceof CSSLayerBlockRule && rule.name === 'as-foundation');
      if (here && rule instanceof CSSStyleRule) all.push(...rule.selectorText.split(/,(?![^(]*\))/).map((s) => s.trim()));
      if (rule.cssRules) walk(rule.cssRules, here);
    }
  };
  for (const sheet of document.styleSheets) {
    if (!/\/asteroid\.css(\?|$)/.test(sheet.href || '')) continue;
    walk(sheet.cssRules, false);
  }
  const matched = all.filter((s) => {
    const plain = s.replace(/::?(before|after|marker|placeholder|hover|active|focus-visible|focus-within|focus|visited|checked|disabled|autofill|-webkit-[\w-]+|-moz-[\w-]+)\b/g, '') || '*';
    try { return document.querySelector(plain.replace(/(^|[\s>+~])(?=[\s>+~]|$)/g, '$1*')); } catch (e) { return false; }
  });
  return { all, matched };
}

async function measure(page, stripped) {
  await page.evaluate(snapshot, '__A');
  const swapped = await page.evaluate((text) => {
    const link = [...document.querySelectorAll('link[rel="stylesheet"]')].find((l) => /\/asteroid\.css(\?|$)/.test(l.href));
    if (!link) return false;
    const style = document.createElement('style');
    style.id = 'as-noop-without-foundation';
    style.textContent = text;
    link.after(style);
    link.media = 'not all';
    return true;
  }, stripped);
  if (!swapped) return null;
  await page.waitForTimeout(300);
  await page.evaluate(snapshot, '__B');
  await page.evaluate(() => {
    document.getElementById('as-noop-without-foundation').remove();
    [...document.querySelectorAll('link[rel="stylesheet"]')].find((l) => /\/asteroid\.css(\?|$)/.test(l.href)).media = 'all';
  });
  await page.waitForTimeout(300);
  await page.evaluate(snapshot, '__C');
  return page.evaluate(compare);
}

(async () => {
  const css = fs.readFileSync(path.join(DIST, 'asteroid.css'), 'utf8');
  const stripped = withoutFoundation(css);
  if (!/@layer\s+as-foundation/.test(css) || stripped.includes('as-foundation')) {
    console.log('CHYBA: asteroid.css neobsahuje vrstvu as-foundation, nebo ji nejde odebrat (npm run build?).');
    process.exitCode = 1;
    return;
  }
  const browser = await chromium.launch();
  let total = 0;
  let missing = 0;
  let invalid = 0;
  const allSelectors = new Set();
  const usedSelectors = new Set();

  const checkPage = async (page, name, label) => {
    await page.addStyleTag({ content: INSTANT });
    await page.waitForTimeout(800);
    for (const state of ['výchozí', 'otevřené']) {
      if (state === 'otevřené') { await page.evaluate(openStates); await page.waitForTimeout(300); }
      const seen = await page.evaluate(layerSelectors);
      seen.all.forEach((s) => allSelectors.add(s));
      seen.matched.forEach((s) => usedSelectors.add(s));
      const result = await measure(page, stripped);
      if (!result) { console.log(`${name} ${label}: asteroid.css na stránce není`); missing++; break; }
      const { found, noise, sizes } = result;
      total += found.length;
      const bad = sizes[0] !== sizes[1] || noise > MAX_NOISE;
      if (bad) invalid++;
      console.log(`${name} ${label} (${state}): rozdílů ${found.length}${noise ? `, šum ${noise}` : ''}${bad ? ` NEPLATNÉ MĚŘENÍ (prvků ${sizes.join(' / ')})` : ''}`);
      found.slice(0, 15).forEach((d) => console.log(`   ${d}`));
    }
  };

  const open = async (page, url) => {
    for (let attempt = 0; ; attempt++) {
      try { await page.goto(SHOP + url, { waitUntil: 'load' }); return; } catch (e) { if (attempt >= 3) throw e; await page.waitForTimeout(2000); }
    }
  };

  for (const [name, options] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext(options);
    await ctx.route(/\/user\/documents\/asteroid\/([\w-]+)\.(css|js)/, (route) => {
      const m = route.request().url().match(/asteroid\/([\w-]+)\.(css|js)/);
      const file = path.join(DIST, `${m[1]}.${m[2]}`);
      return fs.existsSync(file)
        ? route.fulfill({ contentType: m[2] === 'css' ? 'text/css' : 'application/javascript', body: fs.readFileSync(file, 'utf8') })
        : route.continue();
    });
    const page = await ctx.newPage();
    for (const url of PAGES) {
      await open(page, url);
      await checkPage(page, name, url);
    }
    // Košík s testovacím produktem a kroky objednávky. Volba dopravy a platby jako v capture.cjs.
    if (!process.env.PAGES) {
      try {
        await open(page, PRODUCT);
        await page.waitForTimeout(800);
        await page.locator('#product-detail-form button[type=submit]').first().evaluate((b) => b.click());
        await page.waitForTimeout(2500);
        await open(page, '/kosik/');
        await checkPage(page, name, 'košík s produktem');
        await open(page, '/objednavka/krok-1/');
        await checkPage(page, name, 'krok 2');
        await open(page, '/objednavka/krok-1/');
        await page.waitForTimeout(800);
        await page.locator('label[for="shippingId-20"]').click();
        await page.waitForTimeout(1500);
        await page.locator('label[for="billingId-3"]').click();
        await page.waitForTimeout(1500);
        await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.evaluate(() => document.querySelector('#order-form [type=submit], [data-testid=buttonNextStep]').click())]);
        await checkPage(page, name, 'krok 3');
      } finally {
        await open(page, '/kosik/');
        const remove = page.locator('.cart-table tr.removeable .p-total .remove-item, .cart-table .remove-item');
        for (let i = 0; i < 6 && await remove.count(); i++) {
          await Promise.all([page.waitForLoadState('load'), remove.first().evaluate((b) => b.closest('form').submit())]).catch(() => {});
          await page.waitForTimeout(2000);
        }
        const empty = (await page.locator('.cart-table tr.removeable').count()) === 0;
        console.log(`${name} košík prázdný: ${empty}`);
        if (!empty) invalid++;
      }
    }
    await ctx.close();
  }
  await browser.close();
  const unused = [...allSelectors].filter((s) => !usedSelectors.has(s));
  console.log(`Selektory vrstvy bez prvku na měřených stránkách: ${unused.length} z ${allSelectors.size} (pro ně kontrola nic nedokládá)`);
  unused.forEach((s) => console.log(`   ${s}`));
  if (missing) console.log(`CHYBA: na ${missing} stránkách chybí asteroid.css, měření neproběhlo.`);
  if (invalid) console.log(`CHYBA: ${invalid} měření neplatí (změna stránky během měření nebo nevyprázdněný košík).`);
  if (total) console.log(`ROZDÍLY: ${total} (základ s CSS Disca mění vzhled)`);
  else if (!missing && !invalid) console.log('Beze změny: základ s CSS Disca na měřených stránkách nic nemění.');
  process.exitCode = total || missing || invalid ? 1 : 0;
})();
