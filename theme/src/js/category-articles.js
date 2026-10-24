// Články ke kategoriím (issue #1, styly components/_category.scss). Přiřazení spravuje nastavení
// šablony, zveřejněné články jsou ve veřejném souboru settings-app (adresa v config.categoryArticles):
//   { categories: { <GUID kategorie>: { title, articles: [{ title, url }] } } }
// Kategorii poznáme podle GUID v dataLayer Shoptetu (ne podle názvu nebo adresy). dataLayer je
// v hlavičce před kódem šablony, takže soubor se stahuje hned při čtení hlavičky a blok se vloží
// na DOMContentLoaded (většinou už s daty, bez posunu obsahu). Prohlížeč soubor drží v mezipaměti.

function categoryGuid() {
  const layer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
  const shoptet = layer.find((entry) => entry && entry.shoptet)?.shoptet;
  return shoptet?.pageType === 'category' ? shoptet.category?.guid || null : null;
}

// Jen cesty na e-shopu (soubor je ukládá bez domény), cokoli jiného se nezobrazí.
function safePath(url) {
  return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') ? url : null;
}

export function loadCategoryArticles(config) {
  const guid = categoryGuid();
  if (!guid || typeof config.categoryArticles !== 'string' || typeof fetch !== 'function') return null;
  return fetch(config.categoryArticles, { credentials: 'omit' })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => data?.categories?.[guid] || null)
    .catch(() => null);
}

function render(entry) {
  const top = document.querySelector('.category-top');
  if (!top || top.querySelector(':scope > .as-category-articles')) return;
  const articles = (Array.isArray(entry?.articles) ? entry.articles : [])
    .map((article) => ({ title: String(article?.title || '').trim(), url: safePath(article?.url) }))
    .filter((article) => article.title && article.url);
  if (!articles.length) return;

  const block = document.createElement('nav');
  block.className = 'as-category-articles';
  const heading = document.createElement('h2');
  heading.className = 'as-category-articles__title';
  heading.id = 'as-category-articles-title';
  heading.textContent = String(entry.title || '').trim() || 'Články z poradny';
  block.setAttribute('aria-labelledby', heading.id);
  const list = document.createElement('ul');
  list.className = 'as-category-articles__list';
  articles.forEach((article) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = article.url;
    link.textContent = article.title;
    item.append(link);
    list.append(item);
  });
  block.append(heading, list);

  // Za popis (na telefonu tak před podkategorie), bez popisu za nadpis kategorie.
  const anchor = top.querySelector(':scope > .category-perex') || top.querySelector(':scope > .category-title');
  if (anchor) anchor.after(block);
  else top.prepend(block);
}

export function renderCategoryArticles(pending) {
  if (pending) pending.then(render);
}
