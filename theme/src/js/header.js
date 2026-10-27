// Úpravy HTML hlavičky Disco, které nejdou udělat jen v CSS.

import { renderCatalog } from './catalog';

// Přihlášení (nebo účet u přihlášeného zákazníka) patří podle návrhu do hlavního řádku vedle košíku.
// Původní tlačítko nepřesouváme: Shoptet po přesunu do #header přestane otevírat okno přihlášení.
// Do hlavičky dáme kopii, která kliká na původní tlačítko schované v horní liště.
function renderAccountButton() {
  const original = document.querySelector(
    '.top-navigation-tools .top-nav-button-login, .top-navigation-tools .top-nav-button-account',
  );
  const buttons = document.querySelector('#header .navigation-buttons');
  if (!original || !buttons) return;
  // Patří před košík. V objednávce (košík, doprava …) Disco košík v hlavičce nemá, pak před
  // tlačítko menu (na desktopu skryté), aby byl účet všude na stejném místě.
  const anchor = buttons.querySelector(':scope > .cart-count')
    || buttons.querySelector(':scope > [data-target="navigation"]');

  const proxy = original.cloneNode(true);
  proxy.removeAttribute('data-testid');
  proxy.classList.remove('toggle-window');
  proxy.classList.add('as-account-button');

  if (original.classList.contains('toggle-window')) {
    proxy.addEventListener('click', (event) => {
      event.preventDefault();
      // Bez zastavení by klik doputoval k dokumentu a Shoptet by právě otevřené okno hned zavřel.
      event.stopPropagation();
      original.click();
      proxy.setAttribute('aria-expanded', original.getAttribute('aria-expanded') || 'false');
    });
  }

  if (anchor) anchor.before(proxy);
  else buttons.append(proxy);
  document.documentElement.classList.add('as-account-in-header');
}

// Telefon z nastavení e-shopu bereme z kontaktního boxu Shoptetu (patička).
export function shopPhone() {
  const link = document.querySelector('.contact-box .tel a');
  if (!link) return null;
  return { number: link.textContent.trim(), href: link.getAttribute('href') };
}

// Telefon v horní liště: „+420 777 888 998 (po–pá: 9:00–17:00)“.
// Číslo je z nastavení e-shopu, otevírací dobu vyplňuje obchodník v nastavení šablony.
function renderPhone({ phone }) {
  const tools = document.querySelector('.top-navigation-bar .top-navigation-tools');
  const shop = shopPhone();
  if (!shop || !shop.number || !tools) return;

  const link = document.createElement('a');
  link.className = 'as-topbar-phone';
  link.href = shop.href || `tel:${shop.number.replace(/\s+/g, '')}`;

  const number = document.createElement('strong');
  number.textContent = shop.number;
  link.append(number);
  if (phone && phone.hours) {
    link.append(` (${phone.hours})`);
  }

  tools.before(link);
}

// Řádek rychlých odkazů pod hlavním řádkem, položky přicházejí z nastavení doplňku.
function renderQuickLinks({ quickLinks }) {
  const headerBottom = document.querySelector('#header .header-bottom');
  if (!Array.isArray(quickLinks) || quickLinks.length === 0 || !headerBottom) return;

  const list = document.createElement('ul');
  quickLinks.forEach(({ label, url, icon }) => {
    if (!label || !url) return;

    const link = document.createElement('a');
    link.href = url;
    if (icon) {
      const iconEl = document.createElement('span');
      iconEl.className = `as-icon as-icon--${icon}`;
      iconEl.setAttribute('aria-hidden', 'true');
      link.append(iconEl);
    }
    link.append(label);

    const item = document.createElement('li');
    item.append(link);
    list.append(item);
  });

  const container = document.createElement('div');
  container.className = 'container';
  container.append(list);

  const wrapper = document.createElement('nav');
  wrapper.className = 'as-quicklinks';
  wrapper.setAttribute('aria-label', 'Rychlé odkazy');
  wrapper.append(container);

  // Přesouváme jen vlastní odkazy; původní menu a jeho obsluhu necháváme Discu.
  const navigation = document.querySelector('#navigation .navigation-in');
  const mobile = window.matchMedia('(max-width: 767px)');
  const place = () => {
    if (mobile.matches && navigation) {
      navigation.insertBefore(wrapper, navigation.querySelector('.navigationActions'));
    } else {
      headerBottom.before(wrapper);
    }
  };
  mobile.addEventListener('change', place);
  place();
}

// Textové odkazy na stránky vedle katalogu (v2), položky přicházejí z nastavení doplňku.
function renderNavLinks(container, { navLinks }) {
  if (!Array.isArray(navLinks) || navLinks.length === 0) return;

  const list = document.createElement('ul');
  list.className = 'as-navlinks';
  navLinks.forEach(({ label, url }) => {
    if (!label || !url) return;
    const link = document.createElement('a');
    link.href = url;
    link.textContent = label;
    const item = document.createElement('li');
    item.append(link);
    list.append(item);
  });

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Informace');
  nav.append(list);
  container.append(nav);
}

function enhanceV2(config) {
  const container = document.querySelector('#header .header-bottom > .container');
  if (!container) return;
  renderCatalog(container);
  renderNavLinks(container, config);
}

export function enhanceHeader(config) {
  // V dokončení objednávky zůstává původní účet v topbaru; nevytváříme skrytou kopii ani katalog.
  if (document.body.matches('.in-krok-1, .in-krok-2')) {
    renderPhone(config);
    return;
  }
  renderAccountButton();
  renderPhone(config);
  renderQuickLinks(config);
  if (config.header === 'v2') enhanceV2(config);

  // Mobilní Disco má pevnou hlavičku a ve .overall-wrapper rezervuje jen 50 / 80 px. Naše hlavička
  // s polem hledání je vyšší; obsah musí začínat až pod ní. Měříme jen plnou hlavičku: kompaktní
  // (js/mobile-header.js) je nižší a obsah se při přepnutí posouvat nemá. Otevřené hledání také
  // ne: v košíku je hlavička kompaktní od začátku a pole hledání se jen vysune přes obsah.
  const header = document.getElementById('header');
  if (header) {
    let previous;
    const syncHeight = () => {
      if (document.documentElement.classList.contains('as-header-compact')) return;
      if (document.body.classList.contains('search-window-visible')) return;
      const height = header.getBoundingClientRect().height;
      if (height === previous) return;
      previous = height;
      document.documentElement.style.setProperty('--as-mobile-header-height', `${height}px`);
    };
    new ResizeObserver(syncHeight).observe(header);
    syncHeight();
  }
}
