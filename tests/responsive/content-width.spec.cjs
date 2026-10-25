// Šířka obsahu (layout/_content-width.scss): obal obsahu s .container-narrow Disca (textové stránky,
// články, přihlášení) je stejně široký jako na úvodní stránce; běžný text nejvýš 820 px.
const fs = require('node:fs');
const path = require('node:path');
const {test, expect} = require('@playwright/test');

const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
const css = fs.readFileSync(path.join(dist, 'asteroid.css'), 'utf8');
const image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1600" height="400"%3E%3C/svg%3E';
const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(12);

const page = (narrow) => `<!doctype html><html lang="cs" class="as-theme"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><style>
  *,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:sans-serif}.container{margin:0 auto;padding:0 20px}
  @media(min-width:768px){.container{width:747px}}@media(min-width:992px){.container{width:972px}}
  @media(min-width:1200px){.container{width:1178px}}@media(min-width:1440px){.container{width:1418px}}
  /* Disco: úzký kontejner od 1440 px */.container-narrow{max-width:100%}@media(min-width:1440px){.container-narrow{width:1178px}}
  img{max-width:100%}${css}</style></head><body>
  <div id="content-wrapper" class="container ${narrow ? 'container-narrow' : ''} content-wrapper"><main id="content" class="content wide"><div class="content-inner">
  <article class="pageArticleDetail"><header><h1>Obchodní podmínky</h1></header><div itemprop="about">
    <p class="plain">${text}</p><ul class="list"><li>${text}</li></ul><p class="with-image"><img src='${image}' alt="" width="1600" height="400"></p>
  </div></article></div></main></div></body></html>`;

for (const width of [1920, 1440]) {
  test(`content is as wide as on the homepage, running text at most 820 px (${width} px)`, async ({page: p}) => {
    await p.setViewportSize({width, height: 900});
    await p.setContent(page(false));
    const home = await p.locator('#content-wrapper').boundingBox();
    await p.setContent(page(true));
    const narrow = await p.locator('#content-wrapper').boundingBox();
    expect(narrow).toEqual(home);
    expect(Math.round(narrow.width)).toBe(1418);

    const d = await p.evaluate(() => {
      const w = (s) => Math.round(document.querySelector(s).getBoundingClientRect().width);
      return {heading: w('h1'), plain: w('.plain'), list: w('.list'), withImage: w('.with-image')};
    });
    // Obsah = kontejner bez odsazení 20 px po stranách.
    expect(d.heading).toBe(1378);
    expect(d.plain).toBe(820);
    expect(d.list).toBe(820);
    expect(d.withImage).toBe(1378);
  });
}

test('below 1440 px nothing changes; on a phone text uses the whole width', async ({page: p}) => {
  for (const width of [1200, 390]) {
    await p.setViewportSize({width, height: 900});
    await p.setContent(page(true));
    const box = await p.locator('#content-wrapper').boundingBox();
    expect(Math.round(box.width)).toBe(width >= 1200 ? 1178 : width);
    const plain = await p.locator('.plain').boundingBox();
    expect(Math.round(plain.width)).toBe(Math.min(820, Math.round(box.width) - 40));
  }
});
