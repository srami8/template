// Úvodní text na úvodní stránce (.welcome-wrapper, layout/_homepage.scss). Disco ho dává do
// .container-narrow (max. 1178 px s okraji 100 px); má být přes celou šířku obsahu a text sloupců
// z editoru (Bootstrap .col-sm-6, odsazení 20 px) lícovat s nadpisy sekcí.
const fs = require('node:fs');
const path = require('node:path');
const {test, expect} = require('@playwright/test');

const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
const css = fs.readFileSync(path.join(dist, 'asteroid.css'), 'utf8');

const page = () => `<!doctype html><html lang="cs" class="as-theme"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><style>
  *,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:sans-serif}.container{margin:0 auto;padding:0 20px}
  @media(min-width:768px){.container{width:747px}}@media(min-width:992px){.container{width:972px}}
  @media(min-width:1200px){.container{width:1178px}}@media(min-width:1440px){.container{width:1418px}}
  /* Disco: úzký kontejner úvodního textu, sloupce Bootstrapu */
  .container-narrow{max-width:100%}@media(min-width:1440px){.container-narrow{width:1178px;margin:0 100px}}
  [class*="col-"]{padding:0 20px}@media(min-width:768px){.col-sm-6{float:left;width:50%}}.clearfix::after{content:"";display:table;clear:both}
  ${css}</style></head><body><main id="content" class="container content">
  <h2 class="homepage-group-title">Nejprodávanější</h2>
  <div class="welcome-wrapper container-narrow"><div class="welcome"><div><div class="clear clearfix">
    <div class="col-sm-6"><h1>Úvodní text</h1>Lorem ipsum dolor sit amet.</div>
    <div class="col-sm-6"><img alt="" style="display:block;width:100%;height:100px;background:#ddd"></div>
  </div></div></div></div></main></body></html>`;

for (const [width, label] of [[1920, 'wide desktop'], [800, 'tablet'], [390, 'phone']]) {
  test(`welcome text spans the content width and lines up with section titles (${label})`, async ({page: p}) => {
    await p.setViewportSize({width, height: 900});
    await p.setContent(page());
    const d = await p.evaluate(() => {
      const r = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return {x: Math.round(b.x), right: Math.round(b.right)}; };
      const text = document.querySelector('.welcome .col-sm-6:last-child');
      const pad = parseFloat(getComputedStyle(text).paddingRight);
      return {title: r('.homepage-group-title'), wrapper: r('.welcome-wrapper'), h1: r('.welcome h1'),
        lastContentRight: Math.round(text.getBoundingClientRect().right - pad), scroll: document.documentElement.scrollWidth};
    });
    expect(d.wrapper).toEqual(d.title);
    expect(d.h1.x).toBe(d.title.x);
    expect(d.lastContentRight).toBe(d.title.right);
    expect(d.scroll).toBe(width);
  });
}
