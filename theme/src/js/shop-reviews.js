// Hodnocení obchodu nad patičkou (styly components/_shop-reviews.scss, nastavení config.shopReviews).
// Data jsou ze stránky hodnocení obchodu Shoptetu ze serverové mezipaměti Shoptetu (/cache/<adresa>/,
// stejný obsah jako běžná adresa, vrací se z mezipaměti): průměr, počet a 4 nejnovější recenze.
// Žádný vlastní server ani API, průměr i počet jsou přesně podle Shoptetu.
// Šetrnost (šablonu může mít stovky e-shopů a blok je na každé stránce):
//   - stahuje se, až se návštěvník přiblíží k patičce (IntersectionObserver),
//   - výsledek (asi 1 kB) se drží v sessionStorage 30 minut, další stránky návštěvy nic nestahují,
//   - s uloženými daty se blok vykreslí hned, jinak drží místo zástupný blok (bez poskočení),
//   - bez recenzí nebo při chybě se blok odstraní (uloží se i prázdný výsledek).

const STORAGE_KEY = 'asteroid:shop-reviews';
const MAX_AGE = 30 * 60 * 1000;
const MAX_REVIEWS = 4;
const MAX_TEXT = 300;

// Adresa stránky hodnocení podle jazyka e-shopu (stejné jako v Shoptetu); přednost má odkaz na stránce.
const SLUGS = {
  cs: 'hodnoceni-obchodu',
  sk: 'hodnotenie-obchodu',
  hu: 'uzleti-ertekeles',
  ro: 'evaluarea-magazinului',
  de: 'geschaftsbewertung',
  pl: 'opinie-o-sklepie',
  en: 'store-rating',
};

const LABELS = {
  cs: { all: 'Zobrazit všechny recenze', verified: 'Ověřená recenze', rating: (n) => `Hodnocení ${n} z 5` },
  sk: { all: 'Zobraziť všetky recenzie', verified: 'Overená recenzia', rating: (n) => `Hodnotenie ${n} z 5` },
  en: { all: 'Show all reviews', verified: 'Verified review', rating: (n) => `Rating ${n} out of 5` },
};

const lang = () => (document.documentElement.lang || 'cs').slice(0, 2);
const labels = () => LABELS[lang()] || LABELS.en;

function ratingPath() {
  const slugs = Object.values(SLUGS);
  const link = [...document.querySelectorAll('a[href]')].find((a) => {
    try {
      const url = new URL(a.href);
      return url.origin === window.location.origin && slugs.includes(url.pathname.split('/').filter(Boolean).pop());
    } catch {
      return false;
    }
  });
  return link ? new URL(link.href).pathname : `/${SLUGS[lang()] || SLUGS.cs}/`;
}

function readStored() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    return stored && Date.now() - stored.time < MAX_AGE ? stored.data : null;
  } catch {
    return null;
  }
}

function store(data) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ time: Date.now(), data }));
  } catch {
    // Bez úložiště (soukromý režim) se data jen stáhnou znovu na další stránce.
  }
}

const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

// Markup stránky hodnocení Disca/Shoptetu (data-testid používá Shoptet pro testy, mění se méně často).
export function parseRatingPage(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const pick = (root, selectors) => selectors.map((s) => root.querySelector(s)).find(Boolean);
  const average = clean(pick(doc, ['[data-testid="textRatingAverage"]', '.rate-average'])?.textContent);
  const count = clean(pick(doc, ['[data-testid="wrapRatingAverageStars"] .stars-label', '.rate-star-wrap .stars-label'])?.textContent);
  const reviews = [...doc.querySelectorAll('#ratingsList .vote-wrap, .ratingsList .vote-wrap')]
    .slice(0, MAX_REVIEWS)
    .map((item) => {
      const text = clean(pick(item, ['[data-testid="textRating"]', '.vote-content'])?.textContent);
      return {
        name: clean(pick(item, ['[data-testid="textRatingAuthor"]', '.vote-name'])?.textContent),
        rating: item.querySelectorAll('.stars .star-on').length,
        text: text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT - 1).trim()}…` : text,
        // Ověření vypisuje Shoptet jen se zapnutým zobrazením ověření (nastavení hodnocení obchodu).
        verified: Boolean(item.querySelector('[class*="verif"], [data-testid*="erified"]')),
      };
    })
    .filter((review) => review.rating > 0);
  return average && reviews.length ? { average, count, reviews } : null;
}

async function load(path) {
  for (const url of [`/cache${path}`, path]) {
    try {
      const response = await fetch(url, { credentials: 'omit', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      // Nedostupná cache neznamená, že neexistuje běžná stránka.
      if (response.status === 404) continue;
      if (response.ok) return parseRatingPage(await response.text());
    } catch {
      // Zkusí se běžná adresa.
    }
  }
  return null;
}

function stars(rating) {
  const wrap = document.createElement('span');
  wrap.className = 'stars';
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', labels().rating(rating));
  for (let i = 1; i <= 5; i += 1) {
    const star = document.createElement('span');
    star.className = `star ${i <= rating ? 'star-on' : 'star-off'}`;
    star.setAttribute('aria-hidden', 'true');
    wrap.append(star);
  }
  return wrap;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

function fill(section, data, { path, title }) {
  const inner = section.querySelector('.as-shop-reviews__inner');
  inner.replaceChildren();

  const summary = element('div', 'as-shop-reviews__summary');
  summary.append(element('span', 'as-shop-reviews__score', data.average));
  const heading = element('div', 'as-shop-reviews__heading');
  const h2 = element('h2', 'as-shop-reviews__title', title);
  h2.id = 'as-shop-reviews-title';
  const count = element('p', 'as-shop-reviews__count', data.count ? `${data.count}. ` : '');
  const link = element('a', 'as-shop-reviews__all', labels().all);
  link.href = path;
  count.append(link);
  heading.append(h2, count);
  summary.append(heading);

  const list = element('ul', 'as-shop-reviews__list');
  data.reviews.forEach((review) => {
    const item = element('li', 'as-shop-reviews__item');
    if (review.verified) item.append(element('p', 'as-shop-reviews__verified', labels().verified));
    if (review.text) item.append(element('p', 'as-shop-reviews__text', review.text));
    const meta = element('p', 'as-shop-reviews__meta');
    meta.append(stars(review.rating));
    if (review.name) meta.append(element('span', 'as-shop-reviews__author', review.name));
    item.append(meta);
    list.append(item);
  });

  inner.append(summary, list);
  section.classList.remove('as-shop-reviews--pending');
  section.setAttribute('aria-labelledby', h2.id);
}

export function renderShopReviews(config) {
  const settings = { enabled: true, ...config.shopReviews };
  const body = document.body;
  const footer = document.getElementById('footer');
  // Košík a objednávka bez rozptylování, stránka hodnocení recenze vypisuje sama.
  if (!settings.enabled || !footer || document.querySelector('.as-shop-reviews')
    || body.classList.contains('ordering-process') || body.classList.contains('in-hodnoceni-obchodu')
    || Object.values(SLUGS).some((slug) => body.classList.contains(`in-${slug}`))) return;

  const path = ratingPath();
  const options = { path, title: String(settings.title || '').trim() || 'Hodnocení obchodu' };
  const stored = readStored();
  // Uložený prázdný výsledek: e-shop recenze nemá, blok ani zástupný blok se nevkládá.
  if (stored && !stored.reviews) return;

  const section = element('section', 'as-shop-reviews as-shop-reviews--pending');
  section.append(element('div', 'container as-shop-reviews__inner'));
  footer.before(section);

  if (stored) {
    fill(section, stored, options);
    return;
  }

  const start = () => load(path).then((data) => {
    store(data || { reviews: null });
    if (data) fill(section, data, options);
    else section.remove();
  });
  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    start();
  }, { rootMargin: '800px 0px' });
  observer.observe(section);
}
