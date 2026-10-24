// Snímky standardní sady stránek testovacího e-shopu pro kontrolu změny před a po nasazení.
// Každý typ stránky, na kterém se vypisují prvky šablony, na desktopu i mobilu. Prvek Disca se
// stejnou třídou bývá na více stránkách (karta, detail, košík …), kontrola musí projít všechny.
//
//   npx -y node@20 tests/shop/snapshots.cjs before          snímky do test-results/shop/before
//   (nasazení)
//   npx -y node@20 tests/shop/snapshots.cjs after before    snímky „after“ a porovnání s „before“
//
// Porovnání hlásí oblasti, kde se liší víc pixelů o víc než 16/255 (drobné rozdíly vyhlazení písma
// ignoruje). Výsledky a obrázky jsou v test-results/shop/ (necommituje se).

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');

const SHOP = process.env.SHOP_URL || 'https://313980.myshoptet.com';
const PAGES = [
  ['home', '/', ['#header', '.banners-row', '.homepage-products-heading-1 + .products-wrapper', '.as-banner-mosaic', '.welcome-wrapper']],
  ['category', '/sperky/', ['.breadcrumbs', '.category-top', '.products-block', '.category-header']],
  ['detail', '/zbozi/dreveny-privesek-bracken-pendant-6/', ['.breadcrumbs', '.p-image-wrapper', '.p-detail-inner-header', '.p-data-wrapper']],
  ['search', '/vyhledavani/?string=test', ['.breadcrumbs', '#content']],
  ['contacts', '/kontakty/', ['.breadcrumbs', '#content']],
  ['cart', '/kosik/', ['#header', '#content']],
  ['login', '/login/', ['.breadcrumbs', '#content']],
];
const VIEWPORTS = [['1920', { width: 1920, height: 1080 }, false], ['390', { width: 390, height: 844 }, true]];

const [tag = 'snap', compareWith] = process.argv.slice(2);
const root = path.join(__dirname, '../../test-results/shop');
const dir = (name) => path.join(root, name);

async function diff(page, a, b) {
  return page.evaluate(async ([x, y]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/png;base64,${s}`; });
    const [i1, i2] = await Promise.all([load(x), load(y)]);
    if (i1.width !== i2.width || i1.height !== i2.height) return { size: [i1.width, i1.height, i2.width, i2.height] };
    const data = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height).data; };
    const d1 = data(i1); const d2 = data(i2);
    let n = 0; let box = [Infinity, Infinity, 0, 0];
    for (let k = 0; k < d1.length; k += 4) {
      if (Math.max(Math.abs(d1[k] - d2[k]), Math.abs(d1[k + 1] - d2[k + 1]), Math.abs(d1[k + 2] - d2[k + 2])) > 16) {
        n += 1; const q = k / 4; const px = q % i1.width; const py = Math.floor(q / i1.width);
        box = [Math.min(box[0], px), Math.min(box[1], py), Math.max(box[2], px), Math.max(box[3], py)];
      }
    }
    return { pixels: n, box: n ? box : null };
  }, [a.toString('base64'), b.toString('base64')]);
}

(async () => {
  fs.mkdirSync(dir(tag), { recursive: true });
  const browser = await chromium.launch();
  const errors = [];
  for (const [vpName, viewport, mobile] of VIEWPORTS) {
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
    for (const [name, url, selectors] of PAGES) {
      const page = await context.newPage();
      page.on('pageerror', (e) => errors.push(`${name}@${vpName}: ${e.message}`));
      await page.goto(SHOP + url, { waitUntil: 'load' });
      await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}' });
      await page.waitForTimeout(1200);
      for (const selector of selectors) {
        const target = page.locator(selector).first();
        if (!(await target.count()) || !(await target.isVisible())) continue;
        const file = `${name}-${vpName}-${selector.replace(/[^a-z0-9]+/gi, '_')}.png`;
        fs.writeFileSync(path.join(dir(tag), file), await target.screenshot());
      }
      await page.close();
    }
    await context.close();
  }

  if (compareWith) {
    const page = await browser.newPage();
    for (const file of fs.readdirSync(dir(tag)).sort()) {
      const other = path.join(dir(compareWith), file);
      if (!fs.existsSync(other)) { console.log(`NOVÝ   ${file}`); continue; }
      const result = await diff(page, fs.readFileSync(other), fs.readFileSync(path.join(dir(tag), file)));
      if (result.size) console.log(`ROZMĚR ${file} ${result.size.join(' ')}`);
      else if (result.pixels > 50) console.log(`ROZDÍL ${file} ${result.pixels} px v oblasti ${result.box.join(',')}`);
      else console.log(`STEJNÉ ${file}`);
    }
  }
  if (errors.length) console.log('Chyby JS:\n' + errors.join('\n'));
  await browser.close();
})();
