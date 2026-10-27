// Rekapitulace Disca nemá obrázky. Z prvního kroku přeneseme jen URL obrázků a identifikátory,
// nikoli ceny/formuláře. Při přímém vstupu stačí jeden nativní GET košíku pro všechny položky.
const CACHE_KEY = 'asteroid.cart-images.v1';
const MAX_AGE = 15 * 60 * 1000;
let initialized = false;

function itemKey(item) {
  const { microIdentifier, microSku } = item.dataset;
  return microIdentifier && microSku ? `${microIdentifier}:${microSku}` : null;
}
function imageUrl(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value, window.location.href);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function readCache() {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    const age = Date.now() - cache?.updatedAt;
    if (age >= 0 && age < MAX_AGE && cache.images && typeof cache.images === 'object') return cache.images;
  } catch { /* Zakázané úložiště neblokuje objednávku. */ }
  return {};
}
function writeCache(images) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ updatedAt: Date.now(), images })); }
  catch { /* Bez úložiště funguje jednorázové načtení na stránce objednávky. */ }
}
function collectImages(root) {
  const images = {};
  root.querySelectorAll('.cart-table tr.removeable[data-micro="cartItem"]').forEach(item => {
    const key = itemKey(item);
    const image = item.querySelector('.cart-p-image img');
    const src = imageUrl(image?.getAttribute('data-src') || image?.getAttribute('src'));
    if (key && src) images[key] = src;
  });
  return images;
}

export function enhanceCheckoutImages() {
  if (initialized) return;
  initialized = true;
  if (document.body.classList.contains('in-kosik')) {
    // Nový úplný snímek odstraní i obrázky odebraných položek a respektuje varianty podle SKU.
    const save = () => writeCache(collectImages(document));
    save();
    document.addEventListener('ShoptetDOMCartContentLoaded', save);
    return;
  }
  if (!document.body.matches('.in-krok-1, .in-krok-2')) return;
  const content = document.getElementById('content');
  if (!content) return;
  let images = readCache();
  let requested = false;
  const failedLinks = new WeakSet();
  const render = () => {
    let missing = false;
    content.querySelectorAll('#summary-box .order-summary-item[data-micro="cartItem"]').forEach(item => {
      const link = item.querySelector('.cart-item-name a');
      const key = itemKey(item);
      if (!link || !key || link.querySelector('img') || failedLinks.has(link)) return;
      const src = imageUrl(images[key]);
      if (!src) { missing = true; return; }
      const image = document.createElement('img');
      image.src = src;
      image.alt = '';
      image.width = 48;
      image.height = 48;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => { failedLinks.add(link); image.remove(); }, { once: true });
      link.prepend(image);
    });
    if (missing && !requested) loadCart();
  };
  const loadCart = async () => {
    requested = true;
    const href = document.querySelector('.cart-header .step-1 a')?.getAttribute('href');
    if (!href) return;
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(url.href, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal });
      if (!response.ok) return;
      images = collectImages(new DOMParser().parseFromString(await response.text(), 'text/html'));
      writeCache(images);
      render();
    } catch { /* Při chybě sítě zůstává původní plně funkční textová rekapitulace. */ }
    finally { clearTimeout(timeout); }
  };
  // Měna/země obnoví rekapitulaci nativním AJAXem; obnova obrázků už neopakuje síťový požadavek.
  new MutationObserver(render).observe(content, { childList: true, subtree: true });
  render();
}
