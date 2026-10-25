import { enhanceCategoryFilters } from "./category-filters.js";
import { enhanceCategoryDisclosure } from "./category-disclosure.js";

// Stránka kategorie (styly components/_category.scss). Disco vypisuje „Nejprodávanější“
// (#productsTop) jako zalamovaný seznam karet bez tlačítek a pod ním „Zobrazit více“. Podle návrhu
// je to posuvný pás tří karet se šipkami a tlačítkem Detail:
//   pás = posuvný seznam s přichycením karet; šipky mají třídy šipek slideru Shoptetu, vzhled je
//     tak stejný jako u sekcí úvodní stránky (tools/slider). Seznam se obalí kvůli šipkám,
//   Detail = odkaz na produkt (adresa z odkazu názvu), Shoptet do těchto karet tlačítka nevypisuje.

const LABELS = { cs: 'Detail', sk: 'Detail', en: 'Detail' };

function label() {
  return LABELS[(document.documentElement.lang || 'cs').slice(0, 2)] || LABELS.en;
}

function addDetailButtons(list) {
  list.querySelectorAll(':scope > .product .p').forEach((card) => {
    const name = card.querySelector('a.name');
    const bottom = card.querySelector('.p-bottom');
    if (!name || !bottom || bottom.querySelector('.as-detail-button')) return;
    const button = document.createElement('a');
    button.className = 'btn btn-default as-detail-button';
    button.href = name.href;
    button.textContent = label();
    button.setAttribute('aria-label', `${label()}: ${name.textContent.replace(/\s+/g, ' ').trim()}`);
    bottom.append(button);
  });
}

// Šipky posouvají pás o jednu kartu; na začátku / konci a bez přetečení se příslušná skryje.
function addArrows(holder, list) {
  const make = (direction) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `product-slider-navigation navigation-${direction}`;
    button.setAttribute('aria-label', direction === 'prev' ? '‹' : '›');
    button.addEventListener('click', () => {
      const card = list.querySelector(':scope > .product');
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      const step = card ? card.getBoundingClientRect().width + gap : list.clientWidth;
      list.scrollBy({ left: direction === 'prev' ? -step : step, behavior: 'smooth' });
    });
    holder.append(button);
    return button;
  };
  const prev = make('prev');
  const next = make('next');
  const update = () => {
    const max = list.scrollWidth - list.clientWidth - 1;
    prev.hidden = list.scrollLeft <= 1;
    next.hidden = list.scrollLeft >= max;
  };
  list.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(list);
  update();
}

function enhanceBestsellers() {
  const list = document.getElementById('productsTop');
  if (!list || list.closest('.as-bestsellers')) return;

  addDetailButtons(list);

  // Pás karet s posunem (na telefonu prstem). Slider Shoptetu karty přeskupuje do stránek
  // .products-block, na které by se chytil vzhled svislé karty, proto vlastní posuvný seznam.
  const holder = document.createElement('div');
  holder.className = 'as-bestsellers';
  list.before(holder);
  holder.append(list);
  addArrows(holder, list);
}

export function enhanceCategory() {
  if (!document.body.classList.contains('type-category')) return;
  enhanceBestsellers();
  enhanceCategoryFilters();
  enhanceCategoryDisclosure();
  // Řazení, filtry a stránkování Shoptet načítá přes AJAX a .category-top vymění celou. Událost
  // přijde hned po výměně (před vykreslením), pás se tak vytvoří znovu bez probliknutí.
  document.addEventListener('ShoptetDOMPageContentLoaded', () => {
    enhanceBestsellers();
    enhanceCategoryFilters();
    enhanceCategoryDisclosure();
  });
}
