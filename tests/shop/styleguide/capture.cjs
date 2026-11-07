// Snímky komponent styleguidu na testovacím e-shopu, počítač 1440 a telefon 390 px. Režimy:
//   disco – CSS a JS aSteroidu zablokované (vzhled Disca), asteroid – Disco + aSteroid (jak to vidí obchodníci),
//   blank – vypnuté CSS Shoptetu (vzhled Disca a písmo ikon), zůstává jen aSteroid (docs/blank-mode.md).
// Použití: npm run styleguide:capture -- [režimy oddělené čárkou] [--local]
//   --local: CSS a JS aSteroidu z místního buildu (theme/dist) místo nasazené verze – měření před nasazením.
// Snímky a výsledky jdou do test-results/styleguide/img, s --local do test-results/styleguide-local/img
// (místní build se nemíchá se snímky nasazené verze). Testovací produkt jen v headless prohlížeči,
// košík se na konci vyprázdní.
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright-core');
const { pages, components } = require('./manifest.cjs');
const SHOP = 'https://313980.myshoptet.com';
const ROOT = path.resolve(__dirname, '../../..');
const DIST = path.join(ROOT, 'theme/dist');
const argv = process.argv.slice(2);
const local = argv.includes('--local');
const OUT = path.join(ROOT, local ? 'test-results/styleguide-local/img' : 'test-results/styleguide/img');
const only = argv.find((a) => !a.startsWith('--'));
fs.mkdirSync(OUT, { recursive: true });
const SPEC = `<section id="as-spec" style="padding:24px 0;display:grid;gap:32px">
<div id="as-spec-buttons" style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:8px"><button class="btn btn-conversion">Do košíku</button><button class="btn btn-default">Výchozí</button><button class="btn btn-primary">Odeslat</button><button class="btn btn-secondary">Načíst další</button><button class="btn btn-special">Speciální</button><button class="btn btn-plain">Textové</button><button class="btn btn-conversion btn-sm">Malé</button><button class="btn btn-conversion btn-lg">Velké</button><button class="btn btn-conversion" disabled>Zakázané</button><button class="btn btn-primary" disabled>Zakázané</button></div>
<div id="as-spec-fields" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;padding:8px;max-width:820px"><div class="form-group"><div class="smart-label-wrapper"><label for="as-s1">Jméno a příjmení</label><input id="as-s1" class="form-control" type="text"></div></div><div class="form-group"><div class="smart-label-wrapper populated"><label for="as-s2">E-mail</label><input id="as-s2" class="form-control" type="email" value="jan@example.invalid"></div></div><div class="form-group"><div class="smart-label-wrapper populated"><label for="as-s3">Telefon</label><input id="as-s3" class="form-control js-error-field error-field" type="text" value="123"></div></div><div class="form-group"><div class="smart-label-wrapper populated"><label for="as-s4">Město</label><input id="as-s4" class="form-control" type="text" value="Praha" disabled></div></div><div class="form-group"><div class="form-control-wrapper"><select class="form-control" id="as-s5"><option>Česká republika</option><option>Slovensko</option></select></div></div><div class="form-group"><textarea class="form-control" id="as-s6" rows="3" placeholder="Poznámka k objednávce"></textarea></div></div>
<div id="as-spec-choices" style="display:flex;flex-wrap:wrap;gap:24px;padding:8px"><div class="form-group"><input type="checkbox" id="as-c1"><label for="as-c1">Nakupuji na firmu</label></div><div class="form-group"><input type="checkbox" id="as-c2" checked><label for="as-c2">Odebírat novinky</label></div><div class="form-group"><input type="checkbox" id="as-c3" disabled><label for="as-c3">Zakázané</label></div><div class="form-group"><input type="radio" name="as-r" id="as-r1" checked><label for="as-r1">PPL</label></div><div class="form-group"><input type="radio" name="as-r" id="as-r2"><label for="as-r2">Zásilkovna</label></div></div>
<div id="as-spec-flags" style="padding:8px"><div class="flags flags-default" style="position:static;display:flex;gap:8px;flex-wrap:wrap"><span class="flag flag-new">Novinka</span><span class="flag flag-action">Akce</span><span class="flag flag-tip">Tip</span><span class="flag flag-freeshipping">Doprava zdarma</span><span class="flag flag-gift">Dárek</span><span class="flag flag-discount">–20 %</span></div></div>
<div id="as-spec-messages" style="display:grid;gap:8px;padding:8px;max-width:820px"><div class="msg msg-success">Zboží bylo vloženo do košíku.</div><div class="msg msg-error">Vyplňte prosím e-mail.</div><div class="msg msg-info">Doprava zdarma od 1 000 Kč.</div><div class="msg msg-warning">Máte rozepsaný slevový kód.</div></div>
<div id="as-spec-tooltip" style="padding:40px 8px 8px"><div class="tooltip top in" style="position:relative;display:inline-block;opacity:1"><div class="tooltip-arrow"></div><div class="tooltip-inner">Není možné zakoupit více než 9999 ks.</div></div></div>
<div id="as-spec-tabs" style="padding:8px"><div class="shp-tabs-wrapper"><div class="shp-tabs-holder"><ul class="shp-tabs"><li class="shp-tab active"><a class="shp-tab-link" href="#">Popis</a></li><li class="shp-tab"><a class="shp-tab-link" href="#">Parametry</a></li><li class="shp-tab"><a class="shp-tab-link" href="#">Hodnocení (3)</a></li><li class="shp-tab"><a class="shp-tab-link" href="#">Diskuze</a></li></ul></div></div></div>
<div id="as-spec-table" style="padding:8px;max-width:820px"><table class="table"><thead><tr><th>Objednávka</th><th>Datum</th><th>Stav</th><th>Cena</th></tr></thead><tbody><tr><td>2026000123</td><td>21. 10. 2026</td><td>Vyřízena</td><td>1 290 Kč</td></tr><tr><td>2026000098</td><td>2. 9. 2026</td><td>Odeslána</td><td>590 Kč</td></tr></tbody></table></div>
</section>`;
async function go(p, u) { for (let i = 0; ; i++) { try { await p.goto(SHOP + u, { waitUntil: 'load' }); await p.waitForTimeout(900); return; } catch (e) { if (i >= 4) throw e; await p.waitForTimeout(2500); } } }
async function shot(p, comp, file, vp) {
  for (const sel of comp.sel) {
    const l = p.locator(sel).first();
    if (!(await l.count())) continue;
    if (!(await l.isVisible().catch(() => false))) continue;
    await l.scrollIntoViewIfNeeded().catch(() => {}); await p.waitForTimeout(500);
    const b = await l.evaluate((e) => { const r = e.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height }; });
    if (b.w < 4 || b.h < 4) continue;
    const pad = 12, maxH = vp === 'm' ? 1500 : 1100;
    const docW = await p.evaluate(() => document.documentElement.scrollWidth);
    const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad);
    await p.screenshot({ path: file, type: 'jpeg', quality: 80, fullPage: true, clip: { x, y, width: Math.min(docW - x, b.w + 2 * pad), height: Math.min(maxH, b.h + 2 * pad) } });
    return { sel, h: Math.round(b.h), cut: b.h + 2 * pad > maxH };
  }
  return null;
}
async function emptyCart(p) { await go(p, '/kosik/'); const rm = p.locator('.cart-table tr.removeable .p-total .remove-item, .cart-table .remove-item'); for (let i = 0; i < 6 && await rm.count(); i++) { await Promise.all([p.waitForLoadState('load'), rm.first().evaluate((b) => b.closest('form').submit())]).catch(() => {}); await p.waitForTimeout(2000); } return (await p.locator('.cart-table tr.removeable').count()) === 0; }
(async () => {
  const browser = await chromium.launch(); const results = {};
  for (const mode of (only ? only.split(',') : ['disco', 'asteroid'])) {
    for (const vp of ['d', 'm']) {
      const ctx = await browser.newContext(vp === 'd' ? { viewport: { width: 1440, height: 900 } } : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      if (mode === 'disco') await ctx.route(/\/user\/documents\/asteroid\//, (r) => r.abort());
      // Místní build místo nasazeného (registrováno před blokací CSS Shoptetu, ta má přednost).
      if (local && mode !== 'disco') await ctx.route(/\/user\/documents\/asteroid\/([\w-]+)\.(css|js)/, (r) => {
        const m = r.request().url().match(/asteroid\/([\w-]+)\.(css|js)/);
        const f = path.join(DIST, `${m[1]}.${m[2]}`);
        return fs.existsSync(f) ? r.fulfill({ contentType: m[2] === 'css' ? 'text/css' : 'application/javascript', body: fs.readFileSync(f, 'utf8') }) : r.continue();
      });
      // Blank: žádné CSS Shoptetu v HTML (vzhled Disca, písmo ikon, @font-face písma z administrace) ani
      // kopie Disca, zůstává jen aSteroid a cizí CSS e-shopu, jako ve skutečném Blank mode. Odkazy se
      // odstraňují z HTML stránky (ne blokací požadavků), aby se mohlo načíst písmo, které v Blank mode
      // dočítá js/template-fonts.js.
      if (mode === 'blank') {
        await ctx.route(/\/user\/documents\/asteroid\/base-blank\.css/, (r) => r.abort());
        await ctx.route((url) => url.hostname === '313980.myshoptet.com', async (r) => {
          if (r.request().resourceType() !== 'document') return r.fallback();
          // Výpadek sítě: požadavek zrušit (go() ho zopakuje), nepustit dál s CSS Shoptetu.
          try {
            const response = await r.fetch();
            const html = (await response.text()).replace(/<link\b[^>]*href=["']https:\/\/cdn\.myshoptet\.com\/[^"']*\.css[^"']*["'][^>]*>/gi, '');
            return await r.fulfill({ response, body: html });
          } catch (e) {
            return r.abort('failed').catch(() => {});
          }
        });
      }
      const p = await ctx.newPage(); let filled = false;
      try {
        const byPage = {}; for (const c of components) { if (!c.page) continue; if (vp === 'm' && !c.m) continue; (byPage[c.page] ||= []).push(c); }
        for (const [key, list] of Object.entries(byPage)) {
          if (['cart', 'step2', 'step3'].includes(key) && !filled) {
            await go(p, pages.detail); await p.locator('#product-detail-form button[type=submit]').first().evaluate((b) => b.click()).catch(() => {}); await p.waitForTimeout(2500); filled = true;
          }
          if (key === 'step3') { await go(p, pages.step2); await p.locator('label[for="shippingId-20"]').click().catch(() => {}); await p.waitForTimeout(1500); await p.locator('label[for="billingId-3"]').click().catch(() => {}); await p.waitForTimeout(1500); await Promise.all([p.waitForNavigation({ waitUntil: 'load' }), p.evaluate(() => document.querySelector('#order-form [type=submit], [data-testid=buttonNextStep]').click())]).catch(() => {}); await p.waitForTimeout(1200); }
          else await go(p, pages[key]);
          if (key === 'spec') await p.evaluate((h) => { const t = document.querySelector('#content .content-inner') || document.querySelector('#content'); t.insertAdjacentHTML('afterbegin', h); }, SPEC);
          for (const c of list) {
            if (c.action === 'whisper') { const i = p.locator('#formSearchForm input[type=search], #formSearchForm .search-input, input.query-input').first(); if (vp === 'm') await p.locator('[data-target="search"]').first().tap().catch(() => {}); await i.fill('pend').catch(() => {}); await p.waitForTimeout(2200); }
            if (c.action === 'login') { await p.locator('#header .as-account-button, .top-nav-button-login').first().click().catch(() => {}); await p.waitForTimeout(1000); }
            const file = path.join(OUT, `${mode}-${vp}-${c.id}.jpg`);
            // Snímek z dřívějšího běhu nesmí zůstat, když teď komponenta chybí nebo focení selže.
            fs.rmSync(file, { force: true });
            const r = await shot(p, c, file, vp).catch((e) => ({ err: e.message.slice(0, 80) }));
            results[`${mode}-${vp}-${c.id}`] = r; console.log(mode, vp, c.id, r ? (r.err || `${r.sel} ${r.h}px${r.cut ? ' (oříznuto)' : ''}`) : 'nenalezeno');
            if (c.action) { await p.keyboard.press('Escape').catch(() => {}); await go(p, pages[key]); }
          }
        }
      } finally { if (filled) console.log(mode, vp, 'košík prázdný:', await emptyCart(p).catch(() => 'chyba')); await ctx.close(); }
    }
  }
  fs.writeFileSync(path.join(OUT, `results${only ? '-' + only : ''}.json`), JSON.stringify(results, null, 1));
  await browser.close();
})();
