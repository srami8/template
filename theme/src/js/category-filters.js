// Nativní filtry ponecháváme na místě. Disco neumí sbalit jednotlivé sekce; přidáváme jen
// přístupné tlačítko nad jejich původní obsah. Hodnoty, formuláře, slider a AJAX řídí Shoptet.
const LABELS = {
  cs: { flags: 'Dle štítku', price: 'Dle ceny', filters: 'Filtry' },
  sk: { flags: 'Podľa štítku', price: 'Podľa ceny', filters: 'Filtre' },
  en: { flags: 'By label', price: 'By price', filters: 'Filters' },
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
  document.body.classList.toggle('filters-visible', mobile.matches && mobileOpen);
  document.querySelectorAll('[data-unveil="filters"]').forEach(button => {
    button.setAttribute('aria-expanded', String(open));
  });
}
mobile.addEventListener('change', syncMobileFilters);
// Obsluha Shoptetu je delegovaná na html. Na document už čteme její výsledný stav.
document.addEventListener('click', event => {
  const button = event.target.closest?.('[data-as-filter-trigger]');
  if (!button) return;
  mobileOpen = document.getElementById('filters')?.classList.contains('visible') || false;
  button.setAttribute('aria-expanded', String(mobileOpen));
});

function ensureMobileTrigger(filters, label) {
  const wrapper = filters.closest('.filters-wrapper');
  if (!wrapper) return;
  let button = wrapper.querySelector('[data-unveil="filters"]');
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
}
