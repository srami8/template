// Našeptávač vyhledávání (Figma: „Vyhledávání - nenalezeno“).
// Výsledky stylujeme jen v CSS nad markupem Shoptetu. JS přidává jediný doplněk, pro který Disco
// nemá základ: ke hlášce „nic nenalezeno“ kontakt z nastavení e-shopu (kontaktní box v patičce).
// Prvky Shoptetu nepřesouváme ani nenahrazujeme.

const CONTACT_CLASS = 'as-whisperer-contact';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// Údaje bereme z kontaktního boxu Shoptetu, tedy z nastavení e-shopu.
function contactFromShop() {
  const box = document.querySelector('.contact-box');
  if (!box) return null;
  const img = box.querySelector('img');
  const mail = box.querySelector('.mail a');
  const tel = box.querySelector('.tel a');
  const contact = {
    photo: img ? img.dataset.src || img.getAttribute('src') : null,
    email: mail ? mail.textContent.trim() : null,
    emailHref: mail ? mail.getAttribute('href') : null,
    phone: tel ? tel.textContent.trim() : null,
    phoneHref: tel ? tel.getAttribute('href') : null,
  };
  return contact.email || contact.phone ? contact : null;
}

function contactCard(contact) {
  const card = el('div', CONTACT_CLASS);
  if (contact.photo && !contact.photo.startsWith('data:')) {
    const photo = el('img', `${CONTACT_CLASS}__photo`);
    photo.src = contact.photo;
    photo.alt = '';
    card.append(photo);
  }
  card.append(
    el('div', `${CONTACT_CLASS}__title`, 'Potřebujete poradit?'),
    el('div', `${CONTACT_CLASS}__text`, 'Obraťte se na naši ochotnou zákaznickou podporu'),
  );
  [
    [contact.email, contact.emailHref, 'mail'],
    [contact.phone, contact.phoneHref, 'phone'],
  ].forEach(([label, href, type]) => {
    if (!label || !href) return;
    const link = el('a', `${CONTACT_CLASS}__link ${CONTACT_CLASS}__link--${type}`, label);
    link.href = href;
    card.append(link);
  });
  return card;
}

// Shoptet při každém dotazu přepíše obsah našeptávače, tím zmizí i náš kontakt. Doplníme ho znovu,
// jen když je zobrazená hláška „nic nenalezeno“ a kontakt ještě chybí.
function addContactToEmptyState(whisperer, contact) {
  if (!whisperer.querySelector(':scope > .searchWhisperer__content--empty')) return;
  if (whisperer.querySelector(`:scope > .${CONTACT_CLASS}`)) return;
  whisperer.append(contactCard(contact));
}

// Shoptet vytváří .searchWhisperer až po načtení stránky, proto sledujeme celý blok vyhledávání.
export function enhanceSearch() {
  const search = document.querySelector('#header .search');
  const contact = contactFromShop();
  if (!search || !contact) return;

  const update = () => {
    const whisperer = search.querySelector('.searchWhisperer');
    if (whisperer) addContactToEmptyState(whisperer, contact);
  };
  new MutationObserver(update).observe(search, { childList: true, subtree: true });
  update();
}
