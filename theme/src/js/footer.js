// Patička využívá původní bloky a formulář Disca. Doplňujeme jen text podpory,
// dekoraci a spodní řádek pro původní sociální odkazy / platební metody.
const LABELS = {
  cs: { contact: 'Potřebujete poradit s výběrem?', help: 'Obraťte se na naši ochotnou zákaznickou podporu', newsletter: 'Přihlaste se k odběru newsletteru', teaser: 'Nenechte si utéct žádnou akci či slevu v našem obchodu', placeholder: 'Vložte váš e-mail', submit: 'Odebírat', social: 'Sociální sítě' },
  sk: { contact: 'Potrebujete poradiť s výberom?', help: 'Obráťte sa na našu ochotnú zákaznícku podporu', newsletter: 'Prihláste sa na odber newslettera', teaser: 'Nenechajte si ujsť žiadnu akciu či zľavu v našom obchode', placeholder: 'Vložte váš e-mail', submit: 'Odoberať', social: 'Sociálne siete' },
  en: { contact: 'Need help choosing?', help: 'Contact our friendly customer support team', newsletter: 'Subscribe to our newsletter', teaser: 'Keep up with the latest offers and discounts in our shop', placeholder: 'Enter your email', submit: 'Subscribe', social: 'Social media' },
};

function defaultText(node, defaults, text) {
  // Vlastní text obchodníka má přednost před výchozími popisky Shoptetu.
  if (node && defaults.includes(node.textContent.trim())) node.textContent = text;
}

export function enhanceFooter() {
  const footer = document.getElementById('footer');
  const rows = footer?.querySelector('.footer-rows');
  if (!rows) return;
  const labels = LABELS[document.documentElement.lang?.split('-')[0]] || LABELS.cs;
  const contact = rows.querySelector('.custom-footer__contact');
  if (contact) {
    // Disco fotku v patičce schovávalo; nyní se má načíst i před prvním scrollem.
    const photo = contact.querySelector('.contact-box > img');
    if (photo) {
      photo.loading = 'eager';
      if (photo.dataset.src && photo.getAttribute('src')?.startsWith('data:')) photo.src = photo.dataset.src;
    }
    defaultText(contact.querySelector('.pageElement__heading > span'), ['Kontakt', 'Contact'], labels.contact);
    if (!contact.querySelector(':scope > p')) {
      const intro = document.createElement('p');
      intro.textContent = labels.help;
      contact.querySelector('.pageElement__heading')?.after(intro);
    }
  }
  const newsletter = rows.querySelector('.custom-footer__newsletter');
  if (newsletter) {
    defaultText(newsletter.querySelector('.newsletter-header .pageElement__heading > span'), ['Odebírat newsletter', 'Odber newslettera', 'Subscribe to newsletter'], labels.newsletter);
    defaultText(newsletter.querySelector('.newsletter-header > p'), ['Vložte svůj e-mail a my vám budeme zasílat informace o nových produktech na našem e-shopu.'], labels.teaser);
    defaultText(newsletter.querySelector('.subscribe-form button[type="submit"]'), ['Přihlásit se', 'Prihlásiť sa'], labels.submit);
    const email = newsletter.querySelector('input[type="email"]');
    if (email && !email.hasAttribute('placeholder')) email.placeholder = labels.placeholder;
    if (!newsletter.querySelector('.as-footer-newsletter-art')) {
      const art = document.createElement('span');
      art.className = 'as-footer-newsletter-art';
      art.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 3; i += 1) art.append(document.createElement('i'));
      newsletter.append(art);
    }
  }

  const socialItems = [...rows.querySelectorAll('.contact-box .social-icon-list')];
  const payments = rows.querySelector('.custom-footer ul.payments');
  if (!socialItems.length && !payments) return;
  let meta = rows.querySelector(':scope > .as-footer-meta');
  if (!meta) {
    meta = document.createElement('div');
    meta.className = 'as-footer-meta';
    rows.append(meta);
  }
  // Přesouvají se původní odkazy, nikoli kopie; jejich URL a názvy dál spravuje Shoptet.
  if (payments) {
    const widget = payments.closest('.custom-footer > div');
    meta.prepend(widget || payments);
  }
  if (socialItems.length) {
    let social = meta.querySelector('.as-footer-socials');
    if (!social) {
      social = document.createElement('ul');
      social.className = 'as-footer-socials';
      social.setAttribute('aria-label', labels.social);
      meta.append(social);
    }
    social.append(...socialItems);
  }
}
