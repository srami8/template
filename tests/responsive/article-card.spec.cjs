// Karta článku (components/_article-card.scss) v obou markupech Disca: sekce článků na úvodní stránce
// (.homepage-blog-wrapper) a výpis rubriky (.news-wrapper). Kontroluje obrázek 3 : 2 se zaoblením,
// mezery, datum s ikonou, skryté „Číst článek“ a počet sloupců.
const fs = require('node:fs');
const path = require('node:path');
const {test, expect} = require('@playwright/test');

const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
const css = fs.readFileSync(path.join(dist, 'asteroid.css'), 'utf8');
const image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="920" height="1000"%3E%3Crect width="920" height="1000" fill="%23e6e8eb"/%3E%3C/svg%3E';
const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const homeItem = (i) => `<div class="news-item"><a href="/clanek-${i}/" title="Článek ${i}"><div class="image"><img src='${image}' alt="" width="920" height="1000"></div>
  <div class="text"><span class="title">Jak správně nabíjet baterii v mrazech ${i}</span><div class="description">${text}</div><span class="read-article">Číst článek</span></div></a></div>`;
const listItem = (i) => `<article class="news-item"><a href="/clanek-${i}/" class="news-item-link-img"><img src='${image}' alt="" class="news-image" width="920" height="1000"></a>
  <h2><a href="/clanek-${i}/" data-testid="textArticleTitle">Jak správně nabíjet baterii v mrazech ${i}</a></h2>
  <time datetime="2023-12-10 10:00:00"> 10.12.2023 </time><div class="description"><p>${text}</p></div></article>`;

const page = (body) => `<!doctype html><html lang="cs" class="as-theme"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><style>
  *,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:sans-serif}.container{margin:0 auto;padding:0 20px}
  @media(min-width:768px){.container{width:747px}}@media(min-width:992px){.container{width:972px}}
  @media(min-width:1200px){.container{width:1178px}}@media(min-width:1440px){.container{width:1418px}}
  /* Disco: úzký kontejner, .row, sloupce karet */.container-narrow{max-width:100%}@media(min-width:1440px){.container-narrow{width:1178px;margin:0 100px}}
  .row{margin:0 -20px;display:flex;flex-wrap:wrap}.news-item{width:50%;padding:0 20px}
  ${css}</style></head><body><main id="content" class="container content">${body}</main></body></html>`;

const home = page(`<h2 class="homepage-group-title">Nejprodávanější</h2><div class="container-narrow"><div class="homepage-blog-wrapper row blog-wrapper">
  <div class="homepage-group-title h4">Nové články</div>${[1, 2, 3, 4].map(homeItem).join('')}</div></div>`);
const list = page(`<div class="news-wrapper">${[1, 2, 3, 4].map(listItem).join('')}</div>`);

const measure = (p) => p.evaluate(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return {x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.width), height: Math.round(b.height), bottom: Math.round(b.bottom)}; };
  const item = document.querySelector('.news-item');
  const media = item.querySelector('.image, .news-item-link-img');
  const title = item.querySelector('.title, h2');
  const time = item.querySelector('time');
  return {
    items: [...document.querySelectorAll('.news-item')].map(r), media: r(media), title: r(title),
    radius: getComputedStyle(media).borderTopLeftRadius, titleSize: getComputedStyle(title).fontSize,
    time: time && {box: r(time), icon: getComputedStyle(time, '::before').width},
    readMore: item.querySelector('.read-article') && getComputedStyle(item.querySelector('.read-article')).display,
    sectionTitle: r(document.querySelector('h2.homepage-group-title') || document.querySelector('main')),
  };
});

for (const [name, html] of [['home', home], ['list', list]]) {
  test(`article card (${name}): 3 : 2 image, H4 title, three columns on a wide desktop`, async ({page: p}) => {
    await p.setViewportSize({width: 1440, height: 900});
    await p.setContent(html);
    const d = await measure(p);
    expect(Math.abs(d.media.width / d.media.height - 1.5)).toBeLessThan(0.01);
    expect(d.radius).toBe('8px');
    expect(d.title.y - d.media.bottom).toBe(20);
    expect(d.titleSize).toBe('20px');
    // Tři karty v řádku, čtvrtá pod nimi; mezera mezi sloupci 20 px.
    expect(new Set(d.items.slice(0, 3).map((b) => b.y)).size).toBe(1);
    expect(d.items[3].y).toBeGreaterThan(d.items[0].y);
    expect(d.items[1].x - (d.items[0].x + d.items[0].width)).toBe(20);
    if (name === 'home') {
      expect(d.readMore).toBe('none');
      // Sekce přes celou šířku obsahu jako ostatní sekce úvodní stránky.
      expect(d.items[0].x).toBe(d.sectionTitle.x);
      expect(d.items[2].x + d.items[2].width).toBe(d.sectionTitle.x + d.sectionTitle.width);
    } else {
      expect(d.time.icon).toBe('12px');
      expect(d.time.box.y - (d.title.y + d.title.height)).toBe(12);
    }
  });

  test(`article card (${name}): one column on a phone, two on a tablet`, async ({page: p}) => {
    await p.setViewportSize({width: 390, height: 844});
    await p.setContent(html);
    let d = await measure(p);
    expect(d.items[1].y).toBeGreaterThan(d.items[0].bottom);
    expect(d.items[0].width).toBe(350);
    await p.setViewportSize({width: 800, height: 900});
    d = await measure(p);
    expect(d.items[0].y).toBe(d.items[1].y);
    expect(d.items[2].y).toBeGreaterThan(d.items[0].bottom);
  });
}
