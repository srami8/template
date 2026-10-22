// Úpravy HTML hlavičky Disco, které nejdou udělat jen v CSS.

import { renderCatalog } from './catalog';

// Přihlášení (nebo účet u přihlášeného zákazníka) patří podle návrhu do hlavního řádku vedle košíku.
// Původní tlačítko nepřesouváme: Shoptet po přesunu do #header přestane otevírat okno přihlášení.
// Do hlavičky dáme kopii, která kliká na původní tlačítko schované v horní liště.
function renderAccountButton() {
  const original = document.querySelector(
    '.top-navigation-tools .top-nav-button-login, .top-navigation-tools .top-nav-button-account',
  );
  const cart = document.querySelector('#header .navigation-buttons .cart-count');
  if (!original || !cart) return;

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

  cart.before(proxy);
  document.documentElement.classList.add('as-account-in-header');
}

// Telefon v horní liště: „+420 777 888 998 (po–pá: 9:00–17:00)“.
function renderPhone({ phone }) {
  const tools = document.querySelector('.top-navigation-bar .top-navigation-tools');
  if (!phone || !phone.number || !tools) return;

  const link = document.createElement('a');
  link.className = 'as-topbar-phone';
  link.href = `tel:${phone.number.replace(/\s+/g, '')}`;

  const number = document.createElement('strong');
  number.textContent = phone.number;
  link.append(number);
  if (phone.hours) {
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

  headerBottom.before(wrapper);
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
  renderAccountButton();
  renderPhone(config);
  renderQuickLinks(config);
  if (config.header === 'v2') enhanceV2(config);
}
