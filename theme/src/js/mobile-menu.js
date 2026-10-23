// Mobilní menu (Figma: „Menu - level 1/2/3“, styly components/_mobile-menu.scss). Je to menu Disca
// (#navigation): otevírá ho hamburger Disca (body.navigation-window-visible), podkategorie 2. úrovně
// otevírá Disco třídou li.exp (šipka .submenu-arrow). Na mobilu se z něj stává vysouvací panel,
// ve kterém se úrovně přepínají místo rozbalování pod sebou. Doplňujeme jen to, co Disco nemá:
//   zavírací křížek a zavření klepnutím na ztmavenou stránku,
//   klepnutí na celou kategorii otevře její podkategorie (Disco by přešel na stránku kategorie),
//   v podkategoriích řádek zpět a „Zobrazit vše“ (odkaz na kategorii),
//   3. úroveň (Disco ji na mobilu skrývá): třída .as-open na položce 2. úrovně,
//   informační stránky z horní lišty a telefon z nastavení e-shopu.
// Prvky Disca se nepřesouvají, nové prvky jsou na desktopu skryté.

import { shopPhone } from './header';

const MOBILE = '(max-width: 767px)';
const OPEN_CLASS = 'navigation-window-visible';
const LEVEL3_OPEN = 'as-open';

const LABELS = {
  cs: { close: 'Zavřít menu', back: 'Zpět', all: 'Zobrazit vše' },
  sk: { close: 'Zavrieť menu', back: 'Späť', all: 'Zobraziť všetko' },
  en: { close: 'Close menu', back: 'Back', all: 'Show all' },
};

function labels() {
  const lang = (document.documentElement.lang || 'cs').slice(0, 2);
  return LABELS[lang] || LABELS.en;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// Řádky „zpět“ a „Zobrazit vše“ na začátek seznamu podkategorií.
function addPanelHeader(list, { name, url }, onBack) {
  const text = labels();
  const back = el('li', 'as-menu-back');
  const backButton = el('button', null, name);
  backButton.type = 'button';
  backButton.setAttribute('aria-label', `${text.back}: ${name}`);
  backButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onBack();
  });
  back.append(backButton);

  const all = el('li', 'as-menu-all');
  const allLink = el('a', null, text.all);
  allLink.href = url;
  all.append(allLink);

  list.prepend(back, all);
}

// Kategorie 1. úrovně: celá položka otevře podkategorie přes šipku Disca (ta přepíná li.exp).
function enhanceLevel1(navigation, mobile) {
  navigation.querySelectorAll('.menu-level-1 > li.ext').forEach((item) => {
    const link = item.querySelector(':scope > a');
    const arrow = link?.querySelector('.submenu-arrow');
    const list = item.querySelector(':scope > .menu-level-2');
    if (!link || !arrow || !list) return;

    link.addEventListener('click', (event) => {
      if (!mobile.matches || event.target.closest('.submenu-arrow')) return;
      event.preventDefault();
      arrow.click();
    });
    const name = link.querySelector('b')?.textContent.trim() || link.textContent.trim();
    addPanelHeader(list, { name, url: link.href }, () => arrow.click());
    enhanceLevel2(list, mobile);
  });
}

// Podkategorie se 3. úrovní: klepnutí otevře 3. úroveň (Disco ji na mobilu nemá).
function enhanceLevel2(list, mobile) {
  list.querySelectorAll(':scope > li').forEach((item) => {
    const sub = item.querySelector(':scope > div > .menu-level-3');
    const link = item.querySelector(':scope > div > a');
    if (!sub || !link) return;

    item.classList.add('as-has-level-3');
    const open = (event) => {
      if (!mobile.matches) return;
      event.preventDefault();
      item.classList.add(LEVEL3_OPEN);
    };
    link.addEventListener('click', open);
    item.querySelector(':scope > .menu-image')?.addEventListener('click', open);
    addPanelHeader(sub, { name: link.textContent.trim(), url: link.href }, () => item.classList.remove(LEVEL3_OPEN));
  });
}

// Informační stránky (odkazy z horní lišty Disca a odkazy z nastavení šablony) a telefon.
function renderFooter(navigation, inner, config) {
  const pages = new Map();
  document.querySelectorAll('.top-navigation-bar .top-navigation-menu a[href]').forEach((link) => {
    const label = link.textContent.trim();
    if (label) pages.set(link.getAttribute('href'), label);
  });
  (config.navLinks || []).forEach(({ label, url }) => {
    if (label && url && !pages.has(url)) pages.set(url, label);
  });
  if (pages.size) {
    const list = el('ul', 'as-menu-pages');
    pages.forEach((label, href) => {
      const link = el('a', null, label);
      link.href = href;
      const item = el('li');
      item.append(link);
      list.append(item);
    });
    const actions = inner.querySelector(':scope > .navigationActions');
    if (actions) actions.before(list);
    else inner.append(list);
  }

  const phone = shopPhone();
  if (phone?.number) {
    const link = el('a', 'as-menu-phone');
    link.href = phone.href || `tel:${phone.number.replace(/\s+/g, '')}`;
    link.append(el('strong', null, phone.number));
    if (config.phone?.hours) link.append(el('span', null, `(${config.phone.hours})`));
    navigation.append(link);
  }
}

// Měna a jazyk v horním řádku: ikona podle cíle odkazů v nabídce, bez popisku „Měna“ a závorek.
function enhanceActions(inner) {
  inner.querySelectorAll(':scope > .navigationActions > li.ext').forEach((item) => {
    const target = item.querySelector('.menu-level-2 a[href]')?.getAttribute('href') || '';
    if (target.includes('Currency')) item.classList.add('as-menu-currency');
    else item.classList.add('as-menu-language');
    const value = item.querySelector(':scope > a > span > span:last-child');
    if (value) value.textContent = value.textContent.replace(/[()]/g, '').trim();
  });
}

export function enhanceMobileMenu(config) {
  const navigation = document.getElementById('navigation');
  const inner = navigation?.querySelector('.navigation-in');
  const toggle = document.querySelector('#header .navigation-buttons [data-target="navigation"]');
  if (!inner || !toggle) return;

  const mobile = window.matchMedia(MOBILE);
  const close = el('button', 'as-menu-close');
  close.type = 'button';
  close.setAttribute('aria-label', labels().close);
  close.addEventListener('click', () => toggle.click());
  inner.prepend(close);

  enhanceActions(inner);
  enhanceLevel1(navigation, mobile);
  renderFooter(navigation, inner, config);

  // Ztmavená stránka vedle panelu (klepnutí mimo panel ho zavře jako hamburger).
  document.addEventListener('click', (event) => {
    if (!mobile.matches || !document.body.classList.contains(OPEN_CLASS)) return;
    if (navigation.contains(event.target) || event.target.closest?.('.toggle-window')) return;
    toggle.click();
  });

  // Zavřený panel začíná příště zase na 1. úrovni.
  new MutationObserver(() => {
    if (document.body.classList.contains(OPEN_CLASS)) return;
    navigation.querySelectorAll(`.${LEVEL3_OPEN}`).forEach((item) => item.classList.remove(LEVEL3_OPEN));
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
