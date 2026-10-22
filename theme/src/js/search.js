// Našeptávač vyhledávání (Figma: „Vyhledávání“ a „Vyhledávání - nenalezeno“).
// Disco vkládá výsledky do .searchWhisperer při každém psaní. Obsah přeskládáme do dvou sloupců:
// vlevo produkty a tlačítko, vpravo další výsledky (kategorie, články, značky).
// Když se nic nenajde, zobrazíme vlastní hlášku a kontakt z nastavení e-shopu (kontaktní box v patičce).

const LAYOUT_CLASS = 'as-whisperer';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// Kontakt bereme z kontaktního boxu Shoptetu, tedy z údajů v nastavení e-shopu.
function contactFromShop() {
  const box = document.querySelector('.contact-box');
  if (!box) return null;
  const img = box.querySelector('img');
  const mail = box.querySelector('.mail a');
  const tel = box.querySelector('.tel a');
  return {
    photo: img ? img.dataset.src || img.getAttribute('src') : null,
    email: mail ? mail.textContent.trim() : null,
    emailHref: mail ? mail.getAttribute('href') : null,
    phone: tel ? tel.textContent.trim() : null,
    phoneHref: tel ? tel.getAttribute('href') : null,
  };
}

function contactCard(contact) {
  const side = el('div', `${LAYOUT_CLASS}__side ${LAYOUT_CLASS}__contact`);
  if (contact.photo && !contact.photo.startsWith('data:')) {
    const photo = el('img', `${LAYOUT_CLASS}__photo`);
    photo.src = contact.photo;
    photo.alt = '';
    side.append(photo);
  }
  side.append(
    el('div', `${LAYOUT_CLASS}__contactTitle`, 'Potřebujete poradit?'),
    el('div', `${LAYOUT_CLASS}__contactText`, 'Obraťte se na naši ochotnou zákaznickou podporu'),
  );
  [
    [contact.email, contact.emailHref, 'mail'],
    [contact.phone, contact.phoneHref, 'phone'],
  ].forEach(([label, href, type]) => {
    if (!label || !href) return;
    const link = el('a', `${LAYOUT_CLASS}__contactLink ${LAYOUT_CLASS}__contactLink--${type}`, label);
    link.href = href;
    side.append(link);
  });
  return side;
}

function renderEmpty(whisperer) {
  const main = el('div', `${LAYOUT_CLASS}__main ${LAYOUT_CLASS}__empty`);
  const text = el('div', `${LAYOUT_CLASS}__emptyText`);
  text.append(
    el('div', `${LAYOUT_CLASS}__emptyTitle`, 'Nebyly nalezeny žádné výsledky.'),
    el(
      'p',
      null,
      'Je nám líto, ale na zadaný dotaz se nám nepovedlo nic nalézt. Zkuste zkontrolovat, zda v dotazu nemáte překlep.',
    ),
  );
  main.append(el('span', `${LAYOUT_CLASS}__emptyIcon`), text);

  const layout = el('div', LAYOUT_CLASS);
  layout.append(main);
  const contact = contactFromShop();
  if (contact && (contact.email || contact.phone)) layout.append(contactCard(contact));

  whisperer.replaceChildren(layout);
}

function renderResults(whisperer) {
  const main = el('div', `${LAYOUT_CLASS}__main`);
  const side = el('div', `${LAYOUT_CLASS}__side`);
  [...whisperer.children].forEach((child) => {
    (child.classList.contains('searchWhisperer__additionalResults') ? side : main).append(child);
  });

  const layout = el('div', LAYOUT_CLASS);
  layout.append(main);
  if (side.children.length) layout.append(side);
  whisperer.replaceChildren(layout);
}

function rearrange(whisperer) {
  // Naše vlastní úprava taky vyvolá MutationObserver, tu přeskočíme.
  if (!whisperer.children.length || whisperer.firstElementChild.classList.contains(LAYOUT_CLASS)) return;

  if (whisperer.querySelector('.searchWhisperer__content--empty')) {
    renderEmpty(whisperer);
  } else {
    renderResults(whisperer);
  }
}

// Shoptet vytváří .searchWhisperer až po načtení stránky, proto sledujeme celý blok vyhledávání.
export function enhanceSearch() {
  const search = document.querySelector('#header .search');
  if (!search) return;

  const update = () => {
    const whisperer = search.querySelector('.searchWhisperer');
    if (whisperer) rearrange(whisperer);
  };
  new MutationObserver(update).observe(search, { childList: true, subtree: true });
  update();
}
