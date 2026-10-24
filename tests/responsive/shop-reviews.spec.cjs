// Hodnocení obchodu nad patičkou (js/shop-reviews.js, components/_shop-reviews.scss). Stránka běží na
// smyšlené doméně, /cache/hodnoceni-obchodu/ vrací stránku hodnocení v markupu Shoptetu (5 recenzí).
// Kontroluje data (průměr, počet, 4 nejnovější), stažení až u patičky, uložení na návštěvu,
// vynechání v košíku, prázdné hodnocení a rozložení na desktopu i telefonu.
const fs = require('node:fs');
const path = require('node:path');
const {test, expect} = require('@playwright/test');

const dist = process.env.RESPONSIVE_THEME_DIST || path.join(__dirname, '../../theme/dist');
const css = fs.readFileSync(path.join(dist, 'asteroid.css'), 'utf8');
const js = fs.readFileSync(path.join(dist, 'asteroid.js'), 'utf8');
const SHOP = 'https://shop.test';

const review = (name, rating, text) => `<div class="vote-wrap" data-testid="gridRating"><div class="vote-header">
  <span class="vote-pic"><span class="vote-initials">${name[0]}</span></span><span class="vote-summary">
  <span class="vote-name vote-name--nowrap" data-testid="textRatingAuthor"><span>${name}</span></span>
  <span class="vote-rating"><span class="stars" data-testid="gridStars">${'<span class="star star-on"></span>'.repeat(rating)}${'<span class="star star-off"></span>'.repeat(5 - rating)}<span class="sr-only">Hodnocení obchodu je ${rating} z 5 hvězdiček.</span></span>
  <span class="vote-delimeter"></span><span class="vote-time" data-testid="latestContributionDate"> 6.8.2025 </span></span></span></div>
  <div class="vote-content" data-testid="textRating"> ${text} </div></div>`;

const ratingPage = (reviews) => `<!doctype html><html lang="cs"><body class="in-hodnoceni-obchodu"><div class="content">
  <div class="rate-wrapper"><div class="rate-average-wrap"><div class="rate-average-inner" data-testid="wrapRatingAverage">
  <span class="rate-average" data-testid="textRatingAverage"> 4,6 </span>
  <span class="rate-star-wrap" data-testid="wrapRatingAverageStars"><span class="stars"></span><span class="stars-label"> 382 hodnocení </span></span>
  </div></div></div>
  <div id="ratingsList" class="ratingsList votes-wrap simple-vote">${reviews.join('')}</div></div></body></html>`;

const five = [
  review('Michal', 5, 'Rychlá doprava, přehledný web a velký výběr produktů. Od teď už nakupuji jen zde.'),
  review('Jana', 4, 'Parádní výběr produktů, rychlá doprava a ochotná zákaznická podpora. Doporučuji.'),
  review('Petr', 5, 'Úžasná spolupráce …'),
  review('Eva', 5, `Jednoznačně nejlepší obchod, co jsem kdy navštívila. ${'Velmi dlouhý text. '.repeat(30)}`),
  review('Starší', 3, 'Pátá recenze se nezobrazí.'),
];

const page = ({bodyClass = 'type-index', config = {}, filler = 2000} = {}) => `<!doctype html><html lang="cs"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><style>
  *,*::before,*::after{box-sizing:border-box}body{margin:0;font-family:sans-serif}.container{margin:0 auto;padding:0 20px}
  @media(min-width:768px){.container{width:747px}}@media(min-width:992px){.container{width:972px}}
  @media(min-width:1200px){.container{width:1178px}}@media(min-width:1440px){.container{width:1418px}}
  ${css}</style><script>window.asteroidConfig = ${JSON.stringify(config)};</script></head>
  <body class="${bodyClass}"><main id="content" class="container content"><div style="height:${filler}px">obsah</div>
  <a href="/hodnoceni-obchodu/">Hodnocení obchodu</a></main>
  <footer id="footer" class="footer"><div class="container">Patička</div></footer><script>${js}</script></body></html>`;

async function serve(p, html, {reviews = five, status = 200} = {}) {
  const calls = [];
  await p.route(`${SHOP}/**`, (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/') return route.fulfill({contentType: 'text/html', body: html});
    calls.push(url.pathname);
    return route.fulfill({status, contentType: 'text/html', body: status === 200 ? ratingPage(reviews) : 'nenalezeno'});
  });
  return calls;
}

const toFooter = (p) => p.evaluate(() => document.getElementById('footer').scrollIntoView());

test('shop reviews above the footer: average, count, link and the 4 newest reviews', async ({page: p}) => {
  await p.setViewportSize({width: 1440, height: 900});
  const calls = await serve(p, page());
  await p.goto(`${SHOP}/`);
  // Stažení až u patičky; do té doby zástupný blok drží místo.
  await expect(p.locator('.as-shop-reviews--pending')).toHaveCount(1);
  expect(calls).toEqual([]);

  await toFooter(p);
  await expect(p.locator('.as-shop-reviews__item')).toHaveCount(4);
  expect(calls).toEqual(['/cache/hodnoceni-obchodu/']);
  await expect(p.locator('.as-shop-reviews__score')).toHaveText('4,6');
  await expect(p.locator('.as-shop-reviews__title')).toHaveText('Hodnocení obchodu');
  await expect(p.locator('.as-shop-reviews__count')).toHaveText('382 hodnocení. Zobrazit všechny recenze');
  expect(await p.locator('.as-shop-reviews__all').getAttribute('href')).toBe('/hodnoceni-obchodu/');
  expect(await p.locator('.as-shop-reviews__author').allTextContents()).toEqual(['Michal', 'Jana', 'Petr', 'Eva']);
  expect(await p.locator('.as-shop-reviews__item').nth(1).locator('.star-on').count()).toBe(4);
  expect(await p.locator('.as-shop-reviews__item .stars').first().getAttribute('aria-label')).toBe('Hodnocení 5 z 5');
  // Bez ověření v datech Shoptetu žádný štítek „Ověřená recenze“; dlouhý text zkrácený.
  await expect(p.locator('.as-shop-reviews__verified')).toHaveCount(0);
  expect((await p.locator('.as-shop-reviews__text').nth(3).textContent()).length).toBeLessThanOrEqual(300);

  // Blok těsně nad patičkou, recenze čtyři vedle sebe v jednom řádku.
  expect(await p.locator('.as-shop-reviews + #footer').count()).toBe(1);
  const items = await p.locator('.as-shop-reviews__item').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().y)));
  expect(new Set(items).size).toBe(1);
});

test('reviews are stored for the visit: the next page renders them without downloading', async ({page: p}) => {
  await p.setViewportSize({width: 1440, height: 900});
  const calls = await serve(p, page());
  await p.goto(`${SHOP}/`);
  await toFooter(p);
  await expect(p.locator('.as-shop-reviews__item')).toHaveCount(4);
  await p.goto(`${SHOP}/`);
  // Hned vykreslené (bez zástupného bloku), druhé stažení žádné.
  await expect(p.locator('.as-shop-reviews__item')).toHaveCount(4);
  await expect(p.locator('.as-shop-reviews--pending')).toHaveCount(0);
  expect(calls).toEqual(['/cache/hodnoceni-obchodu/']);
});

test('no block without reviews, when the rating page is off, in the cart, on the rating page or when disabled', async ({browser}) => {
  const cases = [
    [{reviews: []}, page()],
    [{status: 404}, page()],
    [{}, page({bodyClass: 'type-cart ordering-process'})],
    [{}, page({bodyClass: 'in-hodnoceni-obchodu'})],
    [{}, page({config: {shopReviews: {enabled: false}}})],
  ];
  for (const [options, html] of cases) {
    const p = await browser.newPage({viewport: {width: 1440, height: 900}});
    await serve(p, html, options);
    await p.goto(`${SHOP}/`);
    await toFooter(p);
    await p.waitForTimeout(300);
    await expect(p.locator('.as-shop-reviews')).toHaveCount(0);
    await p.close();
  }
});

test('custom title from the settings; phone shows a scrolling strip with part of the next review', async ({page: p}) => {
  await p.setViewportSize({width: 390, height: 844});
  await serve(p, page({config: {shopReviews: {enabled: true, title: 'Ověřený obchod zákazníky'}}}));
  await p.goto(`${SHOP}/`);
  await toFooter(p);
  await expect(p.locator('.as-shop-reviews__item')).toHaveCount(4);
  await expect(p.locator('.as-shop-reviews__title')).toHaveText('Ověřený obchod zákazníky');
  const d = await p.evaluate(() => {
    const list = document.querySelector('.as-shop-reviews__list').getBoundingClientRect();
    const items = [...document.querySelectorAll('.as-shop-reviews__item')].map((el) => el.getBoundingClientRect());
    return {listRight: Math.round(list.right), listWidth: list.width, first: items[0].width, secondX: Math.round(items[1].x), scroll: document.documentElement.scrollWidth};
  });
  expect(Math.round(d.first)).toBe(Math.round(d.listWidth * 0.85));
  expect(d.secondX).toBeLessThan(d.listRight);
  expect(d.scroll).toBe(390);
});
