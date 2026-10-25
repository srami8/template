// Karty článků (styly components/_article-card.scss, Figma „Article“ 1627:5345). Disco vypisuje kartu
// ve dvou markupech a v každém něco z návrhu chybí:
//   výpis rubriky (.news-wrapper): chybí „Číst článek“ → doplní se odkaz na článek,
//   úvodní stránka (.homepage-blog-wrapper): chybí datum zveřejnění → doplní se z výpisu rubriky.
// Datum na úvodní stránce: úvodní stránka ukazuje nejnovější články, ty jsou na první stránce
// výpisu své rubriky, kde Shoptet datum vypisuje. Výpis se čte ze serverové mezipaměti Shoptetu
// (/cache/<rubrika>/, jedno stažení na rubriku, obvykle jedna), článek, který ve výpisu není,
// z detailu (/cache/<článek>/, meta article:published_time). Stahuje se až u sekce článků
// (IntersectionObserver) a výsledek se drží 12 hodin v localStorage (data se nemění).
// Místo pro datum drží prázdný <time> od začátku, karta po doplnění neposkočí.
// Datum se ve všech kartách píše jednotně podle návrhu („10. 12. 2023“).

const STORAGE_KEY = 'asteroid:article-dates';
const MAX_AGE = 12 * 60 * 60 * 1000;
const READ_MORE = { cs: 'Číst článek', sk: 'Čítať článok', en: 'Read article' };

const lang = () => (document.documentElement.lang || 'cs').slice(0, 2);
const pathOf = (href) => {
  try {
    return new URL(href, window.location.href).pathname;
  } catch {
    return '';
  }
};

// „2026-10-24 15:14:48“ (výpis rubriky) nebo „24.10.2026“ (detail článku) → „2026-10-24“.
export function isoDate(value) {
  const text = String(value || '').trim();
  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  match = text.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  return match ? `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` : null;
}

export function formatDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day}. ${month}. ${year}`;
}

function setDate(time, iso) {
  time.dateTime = iso;
  time.textContent = formatDate(iso);
  time.classList.remove('as-article-date--pending');
}

function readStored() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored && Date.now() - stored.time < MAX_AGE ? stored.dates : {};
  } catch {
    return {};
  }
}

function store(dates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ time: Date.now(), dates }));
  } catch {
    // Bez úložiště se data jen stáhnou znovu při další návštěvě.
  }
}

async function fetchPage(path) {
  for (const url of [`/cache${path}`, path]) {
    try {
      const response = await fetch(url, { credentials: 'omit' });
      if (response.status === 404) return null;
      if (response.ok) return new DOMParser().parseFromString(await response.text(), 'text/html');
    } catch {
      // Zkusí se běžná adresa.
    }
  }
  return null;
}

// Data zveřejnění článků (cesta → yyyy-mm-dd): výpis rubriky, chybějící z detailu článku.
async function loadDates(paths) {
  const dates = {};
  const sections = [...new Set(paths.map((path) => path.replace(/[^/]+\/?$/, '')))];
  for (const section of sections) {
    const doc = await fetchPage(section);
    doc?.querySelectorAll('.news-wrapper .news-item').forEach((item) => {
      const link = item.querySelector('h2 a, a[href]');
      const date = isoDate(item.querySelector('time')?.getAttribute('datetime'));
      if (link && date) dates[pathOf(link.getAttribute('href'))] = date;
    });
  }
  for (const path of paths.filter((p) => !dates[p])) {
    const doc = await fetchPage(path);
    const date = isoDate(doc?.querySelector('meta[property="article:published_time"]')?.content
      || doc?.querySelector('.news-item-detail time, time')?.getAttribute('datetime'));
    if (date) dates[path] = date;
  }
  return dates;
}

function enhanceHomepageCards(cards) {
  const pending = [];
  cards.forEach((card) => {
    const link = card.querySelector(':scope > a[href]');
    const title = card.querySelector('.title');
    if (!link || !title || card.querySelector('time')) return;
    const time = document.createElement('time');
    time.className = 'as-article-date as-article-date--pending';
    title.after(time);
    pending.push({ path: pathOf(link.getAttribute('href')), time });
  });
  if (!pending.length) return;

  const stored = readStored();
  const fill = (dates) => pending.forEach(({ path, time }) => {
    if (dates[path]) setDate(time, dates[path]);
    else time.remove();
  });
  if (pending.every(({ path }) => stored[path])) {
    fill(stored);
    return;
  }

  const start = () => loadDates(pending.map(({ path }) => path)).then((dates) => {
    store({ ...stored, ...dates });
    fill({ ...stored, ...dates });
  });
  const section = cards[0].closest('.homepage-blog-wrapper') || cards[0];
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

function enhanceListCards(cards) {
  cards.forEach((card) => {
    const time = card.querySelector(':scope > time');
    const iso = isoDate(time?.getAttribute('datetime'));
    if (iso) setDate(time, iso);
    const link = card.querySelector('h2 a[href]');
    if (!link || card.querySelector('.read-article')) return;
    const more = document.createElement('a');
    more.className = 'read-article';
    more.href = link.getAttribute('href');
    more.textContent = READ_MORE[lang()] || READ_MORE.en;
    more.setAttribute('aria-label', `${more.textContent}: ${link.textContent.trim()}`);
    card.append(more);
  });
}

export function enhanceArticleCards() {
  const home = [...document.querySelectorAll('.homepage-blog-wrapper .news-item')];
  if (home.length) enhanceHomepageCards(home);
  const list = [...document.querySelectorAll('.news-wrapper .news-item')];
  if (list.length) enhanceListCards(list);
}
