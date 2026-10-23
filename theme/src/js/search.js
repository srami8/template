// Našeptávač vyhledávání (Figma: „Vyhledávání - nenalezeno“).
// Výsledky stylujeme jen v CSS nad markupem Shoptetu. JS přidává k hlášce „nic nenalezeno“ dva
// doplňky, pro které Disco nemá základ: kategorie z úvodní stránky (nastavení šablony, stejný
// nadpis i karty) a kontakt z nastavení e-shopu (kontaktní box v patičce).
// Prvky Shoptetu nepřesouváme ani nenahrazujeme.

import { categoryItem } from './home-categories';
import { contactFromShop, contactCard } from './contact';

const CONTACT_CLASS = 'as-whisperer-contact';
const CATEGORIES_CLASS = 'as-whisperer-categories';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// Kategorie z úvodní stránky v markupu podkategorií Disca, nadpis stejný jako na úvodní stránce.
function categoriesBlock({ title, items }) {
  const block = el('div', CATEGORIES_CLASS);
  if (title) block.append(el('div', `${CATEGORIES_CLASS}__title`, title));
  const list = el('ul', 'subcategories with-image');
  items.filter((item) => item.name && item.url).forEach((item) => list.append(categoryItem(item)));
  block.append(list);
  return block;
}

// Shoptet při každém dotazu přepíše obsah našeptávače, tím zmizí i naše doplňky. Doplníme je znovu,
// jen když je zobrazená hláška „nic nenalezeno“ a doplněk ještě chybí.
function addToEmptyState(whisperer, { contact, categories }) {
  if (!whisperer.querySelector(':scope > .searchWhisperer__content--empty')) return;
  if (categories && !whisperer.querySelector(`:scope > .${CATEGORIES_CLASS}`)) {
    whisperer.append(categoriesBlock(categories));
  }
  if (contact && !whisperer.querySelector(`:scope > .${CONTACT_CLASS}`)) {
    whisperer.append(contactCard(contact, CONTACT_CLASS));
  }
}

// Shoptet vytváří .searchWhisperer až po načtení stránky, proto sledujeme celý blok vyhledávání.
export function enhanceSearch(config) {
  const search = document.querySelector('#header .search');
  const contact = contactFromShop();
  const categories = config.homeCategories?.items?.length ? config.homeCategories : null;
  if (!search || (!contact && !categories)) return;

  const update = () => {
    const whisperer = search.querySelector('.searchWhisperer');
    if (whisperer) addToEmptyState(whisperer, { contact, categories });
  };
  new MutationObserver(update).observe(search, { childList: true, subtree: true });
  update();
}
