// Kontakt z nastavení e-shopu (kontaktní box Shoptetu v patičce): fotka, e-mail, telefon.
// Zobrazuje se u „nic nenalezeno“ v našeptávači a v prázdném košíku (Figma: „Potřebujete poradit?“).

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function contactFromShop() {
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

// Prvky mají třídy podle bloku (např. as-whisperer-contact__photo), vzhled řeší CSS daného místa.
export function contactCard(contact, className) {
  const card = el('div', className);
  if (contact.photo && !contact.photo.startsWith('data:')) {
    const photo = el('img', `${className}__photo`);
    photo.src = contact.photo;
    photo.alt = '';
    card.append(photo);
  }
  card.append(
    el('div', `${className}__title`, 'Potřebujete poradit?'),
    el('div', `${className}__text`, 'Obraťte se na naši ochotnou zákaznickou podporu'),
  );
  [
    [contact.email, contact.emailHref, 'mail'],
    [contact.phone, contact.phoneHref, 'phone'],
  ].forEach(([label, href, type]) => {
    if (!label || !href) return;
    const link = el('a', `${className}__link ${className}__link--${type}`, label);
    link.href = href;
    card.append(link);
  });
  return card;
}
