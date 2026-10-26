// Disco má delegované .active-filters .input a p#clear-filters a, ale testovaný
// obchod jejich HTML nevypisuje. Doplňujeme přehled, původní formuláře zůstávají.
const LABELS = {
  cs: { title: 'Aktivní filtry', remove: 'Zrušit filtr', clear: 'Vymazat filtry' },
  sk: { title: 'Aktívne filtre', remove: 'Zrušiť filter', clear: 'Vymazať filtre' },
  en: { title: 'Active filters', remove: 'Remove filter', clear: 'Clear filters' },
};
let pendingFocus = null;

function localUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, location.href);
    return url.origin === location.origin ? url : null;
  } catch { return null; }
}

function labelText(label) {
  if (!label) return '';
  const copy = label.cloneNode(true);
  copy.querySelectorAll('.filter-count, .show-tooltip').forEach(node => node.remove());
  return copy.textContent.replace(/\s+/g, ' ').trim();
}

function firstPage(url) {
  // Stejný vzor používá nativní priceFilter při změně cenového rozsahu.
  if (window.shoptet?.content?.regexp) url.pathname = url.pathname.replace(window.shoptet.content.regexp, '');
  url.hash = '';
  return url;
}

function selectedFilters(filters, native) {
  const inputs = [...filters.querySelectorAll('.filter-section input[data-url]')];
  const items = native ? [...native.querySelectorAll('.input[data-url]')].map((control, index) => ({
    key: `native-${index}`, label: labelText(control), url: localUrl(control.dataset.url)?.href,
  })) : inputs.filter(input => input.checked).map(input => ({
    key: `${input.dataset.filterCode || input.name}:${input.value}`,
    label: labelText(input.labels?.[0]), url: localUrl(input.dataset.url)?.href,
  }));
  const current = firstPage(new URL(location.href));
  if (!native && ['priceMin', 'priceMax'].some(key => current.searchParams.get(key)?.trim())) {
    const url = new URL(current);
    url.searchParams.delete('priceMin');
    url.searchParams.delete('priceMax');
    const from = filters.querySelector('.slider-header .from')?.textContent.trim();
    const to = filters.querySelector('.slider-header .to')?.textContent.trim();
    if (from && to) items.push({ key: 'price', label: `${from} – ${to}`, url: url.href });
  }
  // data-url vybraného inputu už odkazuje na první stránku kategorie.
  const clear = localUrl(document.querySelector('#clear-filters a')?.getAttribute('href'))
    || firstPage(localUrl(inputs.find(input => input.checked)?.dataset.url) || current);
  const codes = new Set(['priceMin', 'priceMax']);
  inputs.forEach(input => {
    if (input.dataset.filterCode) codes.add(input.dataset.filterCode);
    if (input.name) codes.add(input.name.replace(/\[\]$/, ''));
  });
  codes.forEach(code => { clear.searchParams.delete(code); clear.searchParams.delete(`${code}[]`); });
  return { items: items.filter(item => item.label && item.url), clear: clear.href };
}

function renderSummary({ slot, anchor, items, clear, labels }) {
  let summary = document.querySelector(`[data-as-active-filters="${slot}"]`);
  if (!items.length) { summary?.remove(); return; }
  if (!summary) {
    summary = document.createElement('div');
    summary.className = 'active-filters';
    summary.dataset.asActiveFilters = slot;
    if (slot === 'listing') anchor.before(summary);
    else anchor.after(summary);
  }
  summary.setAttribute('role', 'group');
  summary.setAttribute('aria-label', labels.title);
  const signature = JSON.stringify({ items, clear });
  if (summary.dataset.asFilterState === signature) return;
  summary.dataset.asFilterState = signature;
  summary.replaceChildren();
  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    // Nativní handler čte data-url přímo z event.target, proto text bez vnořené ikony.
    button.className = 'input';
    button.textContent = item.label;
    button.dataset.url = item.url;
    button.setAttribute('aria-label', `${labels.remove}: ${item.label}`);
    button.addEventListener('click', () => { pendingFocus = { slot, index }; });
    summary.append(button);
  });
  const holder = document.createElement('p');
  const link = document.createElement('a');
  link.href = clear;
  link.textContent = labels.clear;
  if (slot === 'listing' && !document.getElementById('clear-filters')) holder.id = 'clear-filters';
  link.addEventListener('click', event => {
    pendingFocus = { slot, index: 0 };
    if (holder.id === 'clear-filters') return; // původní delegace Shoptetu
    event.preventDefault();
    // Druhý přehled nesmí duplikovat ID ani zavřít dialog kliknutím do pozadí.
    // Voláme stejnou nativní funkci se stejnou událostí jako p#clear-filters a.
    if (typeof window.makeFilterAjaxRequest === 'function') {
      window.makeFilterAjaxRequest(link.href, true, false, link, 'ShoptetPageFiltersCleared');
    } else location.href = link.href;
  });
  holder.append(link);
  summary.append(holder);
}

export function enhanceActiveFilters(filters) {
  const header = document.getElementById('category-header');
  if (!header || !filters) return;
  const labels = LABELS[(document.documentElement.lang || 'cs').slice(0, 2)] || LABELS.en;
  // Pokud Shoptet začne posílat svůj přehled, zachováme ho na místě i s jeho ovladači.
  const native = document.querySelector('.active-filters:not([data-as-active-filters])');
  const nativeSlot = native ? (filters.contains(native) ? 'drawer' : 'listing') : null;
  const { items, clear } = selectedFilters(filters, native);
  const anchors = { listing: header, drawer: filters.querySelector(':scope > .as-filter-header') };
  Object.entries(anchors).forEach(([slot, anchor]) => {
    if (anchor && nativeSlot !== slot) renderSummary({ slot, anchor, items, clear, labels });
  });
  if (pendingFocus) {
    const { slot, index } = pendingFocus;
    pendingFocus = null;
    requestAnimationFrame(() => {
      const summary = document.querySelector(`[data-as-active-filters="${slot}"]`);
      const buttons = summary?.querySelectorAll('.input');
      const fallback = slot === 'drawer' ? filters.querySelector('.as-filter-close')
        : header.querySelector('.listSorting__control--current');
      (buttons?.[Math.min(index, buttons.length - 1)] || fallback)?.focus({ preventScroll: true });
    });
  }
}
