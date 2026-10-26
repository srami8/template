// Nativní filtry ponecháváme na místě. Disco neumí sbalit jednotlivé sekce; přidáváme jen
// přístupné tlačítko nad jejich původní obsah. Hodnoty, formuláře, slider a AJAX řídí Shoptet.
import { dismissDrawerOnBackdrop } from './drawer';
import { enhanceActiveFilters } from './active-filters';
const LABELS = {
  cs: { flags: 'Dle štítku', price: 'Dle ceny', filters: 'Filtry', close: 'Zavřít filtry' },
  sk: { flags: 'Podľa štítku', price: 'Podľa ceny', filters: 'Filtre', close: 'Zavrieť filtre' },
  en: { flags: 'By label', price: 'By price', filters: 'Filters', close: 'Close filters' },
};
let nextId = 0;
const collapsedSections = new Map();
const mobile = window.matchMedia('(max-width: 767px)');
let mobileOpen = false;

function syncMobileFilters() {
  if (!document.body?.classList.contains('type-category')) return;
  const filters = document.getElementById('filters');
  if (!filters) return;
  const open = !mobile.matches || mobileOpen;
  filters.classList.toggle('visible', open);
  filters.inert = !open;
  document.body.classList.toggle('filters-visible', mobile.matches && mobileOpen);
  if (mobile.matches) {
    filters.setAttribute('role', 'dialog');
    filters.setAttribute('aria-modal', 'true');
  } else {
    filters.removeAttribute('role');
    filters.removeAttribute('aria-modal');
  }
  document.querySelectorAll('[data-unveil="filters"]').forEach(button => {
    button.setAttribute('aria-expanded', String(open));
  });
}
mobile.addEventListener('change', () => {
  // Desktopový sidebar nesmí při návratu na mobil sám znovu otevřít dialog.
  mobileOpen = false;
  syncMobileFilters();
});
// Obsluha Shoptetu je delegovaná na html. Na document už čteme její výsledný stav.
document.addEventListener('click', event => {
  const button = event.target.closest?.('[data-unveil="filters"]');
  const filters = document.getElementById('filters');
  if (!filters || !mobile.matches) return;
  if (button) {
    mobileOpen = filters.classList.contains('visible');
    syncMobileFilters();
    if (mobileOpen) filters.querySelector('.as-filter-close')?.focus();
    else document.querySelector('[data-as-filter-trigger]')?.focus();
  }
});
dismissDrawerOnBackdrop({
  panel: () => document.getElementById('filters'),
  trigger: () => document.querySelector('[data-as-filter-trigger]'),
  isOpen: () => document.body?.classList.contains('filters-visible'),
  close: () => document.querySelector('[data-as-filter-trigger]')?.click(),
});
document.addEventListener('keydown', event => {
  if (!mobile.matches || !mobileOpen) return;
  const filters = document.getElementById('filters');
  if (!filters) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    document.querySelector('[data-as-filter-trigger]')?.click();
  } else if (event.key === 'Tab') {
    const focusable = [...filters.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')]
      .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!filters.contains(document.activeElement)
      || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }
});

function ensureMobileTrigger(filters, label) {
  const wrapper = filters.closest('.filters-wrapper');
  if (!wrapper) return;
  let button = wrapper.querySelector('.filters-unveil-button-wrapper [data-unveil="filters"]');
  if (!button) {
    const holder = document.createElement('div');
    holder.className = 'filters-unveil-button-wrapper';
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-default unveil-button';
    button.dataset.unveil = 'filters';
    button.textContent = label;
    button.setAttribute('aria-controls', 'filters');
    holder.append(button);
    wrapper.prepend(holder);
  }
  button.dataset.asFilterTrigger = 'true';
  syncMobileFilters();
}

export function enhanceCategoryFilters() {
  const filters = document.getElementById('filters');
  if (!filters || !document.body.classList.contains('type-category')) return;
  const lang = (document.documentElement.lang || 'cs').slice(0, 2);
  const labels = LABELS[lang] || LABELS.en;
  filters.setAttribute('aria-label', labels.filters);
  if (!filters.querySelector(':scope > .as-filter-header')) {
    const header = document.createElement('div');
    header.className = 'as-filter-header';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'as-filter-close';
    close.dataset.unveil = 'filters';
    close.setAttribute('aria-label', labels.close);
    close.setAttribute('aria-controls', 'filters');
    header.append(close);
    filters.prepend(header);
  }
  ensureMobileTrigger(filters, labels.filters);
  filters.querySelectorAll('.slider-wrapper, .filter-section').forEach((section) => {
    if (section.querySelector(':scope > h4 > .as-filter-toggle')) return;
    const flags = section.classList.contains('filter-section-boolean');
    const price = section.classList.contains('slider-wrapper');
    let heading = section.querySelector(':scope > h4');
    if (!heading && flags) {
      heading = document.createElement('h4');
      heading.textContent = labels.flags;
      section.prepend(heading);
    }
    if (!heading) return;
    if (price && ['Cena', 'Price'].includes(heading.textContent.trim())) {
      const text = heading.querySelector('span') || heading;
      text.textContent = labels.price;
    }
    const targets = [...section.children].filter((element) => element !== heading
      && !element.matches('input[type="hidden"], .no-display'));
    if (!targets.length) return;
    const key = price ? 'price' : flags ? 'flags' : section.id || heading.textContent.trim();
    const wasCollapsed = collapsedSections.get(key) || false;
    section.dataset.asCollapsed = String(wasCollapsed);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'as-filter-toggle';
    button.setAttribute('aria-label', heading.textContent.trim());
    button.setAttribute('aria-expanded', String(!wasCollapsed));
    button.setAttribute('aria-controls', targets.map((element) => {
      if (!element.id) element.id = `as-filter-body-${++nextId}`;
      return element.id;
    }).join(' '));
    button.addEventListener('click', () => {
      const collapsed = section.dataset.asCollapsed !== 'true';
      collapsedSections.set(key, collapsed);
      section.dataset.asCollapsed = String(collapsed);
      button.setAttribute('aria-expanded', String(!collapsed));
    });
    heading.append(button);
  });
  enhanceActiveFilters(filters);
}
