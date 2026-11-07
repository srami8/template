// Porovná snímky aSteroidu s CSS Disca a bez něj (Blank mode) z capture.cjs a zapíše blank-diff.json.
// Použití: npm run styleguide:diff [-- --local] (po npm run styleguide:capture -- asteroid,blank [--local]).
// Snímek se bere jen tehdy, když ho poslední focení opravdu pořídilo (results*.json bez chyby).
// Verdikt: ok (do 0,5 % plochy), drobne (do 5 % plochy a výšky), rozbite (víc, nebo komponenta bez CSS
// Disca zmizela), chybi (nejde nafotit ani s CSS Disca). Výška je skutečná z focení, ne z oříznutého
// snímku. U oříznutého snímku se porovnává jen začátek, takže nemůže dostat ok (příznak cut).
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright-core');
const { components } = require('./manifest.cjs');
const img = path.resolve(__dirname, '../../..', process.argv.includes('--local') ? 'test-results/styleguide-local/img' : 'test-results/styleguide/img');
// Práh nad šumem JPEG: odchylka 8 na kanál pozná i světlé rámečky (#dadada) a pozadí (#f7f5f3 na bílé).
const THRESHOLD = 8;
// Výsledky focení (novější běh přepíše starší údaje stejného snímku).
const results = Object.assign({}, ...fs.readdirSync(img).filter((f) => /^results.*\.json$/.test(f))
  .sort((x, y) => fs.statSync(path.join(img, x)).mtimeMs - fs.statSync(path.join(img, y)).mtimeMs)
  .map((f) => JSON.parse(fs.readFileSync(path.join(img, f), 'utf8'))));
const shot = (mode, vp, id) => { const k = `${mode}-${vp}-${id}`; const f = path.join(img, `${k}.jpg`); return fs.existsSync(f) && results[k] && !results[k].err ? f : null; };
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage(); const out = {};
  for (const c of components) for (const vp of ['d', 'm']) {
    const a = shot('asteroid', vp, c.id), b = shot('blank', vp, c.id);
    if (!a && !b) continue;
    if (a && !b) { out[`${vp}-${c.id}`] = { verdict: 'rozbite', share: 100, missing: true }; console.log(vp, c.id, 'rozbite: bez CSS Disca zmizela'); continue; }
    if (!a) { out[`${vp}-${c.id}`] = { verdict: 'chybi' }; continue; }
    const r = await page.evaluate(async ([x, y, threshold]) => {
      const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = `data:image/jpeg;base64,${s}`; });
      const [i1, i2] = await Promise.all([load(x), load(y)]);
      const w = Math.min(i1.width, i2.width), h = Math.min(i1.height, i2.height);
      const data = (im) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(im, 0, 0); return g.getImageData(0, 0, w, h).data; };
      const d1 = data(i1), d2 = data(i2); let n = 0;
      for (let k = 0; k < d1.length; k += 4) if (Math.max(Math.abs(d1[k] - d2[k]), Math.abs(d1[k + 1] - d2[k + 1]), Math.abs(d1[k + 2] - d2[k + 2])) > threshold) n++;
      return { share: n / (w * h), sizeA: [i1.width, i1.height], sizeB: [i2.width, i2.height] };
    }, [fs.readFileSync(a).toString('base64'), fs.readFileSync(b).toString('base64'), THRESHOLD]);
    const ra = results[`asteroid-${vp}-${c.id}`], rb = results[`blank-${vp}-${c.id}`];
    const hA = ra.h || r.sizeA[1], hB = rb.h || r.sizeB[1];
    const cut = Boolean(ra.cut || rb.cut);
    const dh = Math.abs(hA - hB) / Math.max(hA, 1), dw = Math.abs(r.sizeA[0] - r.sizeB[0]) / Math.max(r.sizeA[0], 1);
    const verdict = r.share < 0.005 && dh < 0.01 && dw < 0.01 && !cut ? 'ok' : r.share < 0.05 && dh < 0.05 && dw < 0.05 ? 'drobne' : 'rozbite';
    out[`${vp}-${c.id}`] = { verdict, share: Math.round(r.share * 1000) / 10, heightChange: Math.round((hB - hA) / Math.max(hA, 1) * 100), ...(cut ? { cut } : {}) };
    console.log(vp, c.id, verdict, out[`${vp}-${c.id}`].share + ' %', 'výška', out[`${vp}-${c.id}`].heightChange + ' %', cut ? '(oříznuto, změřen začátek)' : '');
  }
  fs.writeFileSync(path.join(img, 'blank-diff.json'), JSON.stringify(out, null, 1));
  await browser.close();
})();
