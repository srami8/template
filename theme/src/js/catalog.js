// „Katalog produktů“ pro hlavičky v2 a v3: tlačítko, které otevře původní menu Disco (#navigation)
// jako svislý panel kategorií. Otevírání obstarává Disco samo: tlačítko má třídu .toggle-window
// a data-target="navigation" jako hamburger mobilního menu, Disco pak přepíná
// body.navigation-window-visible (a zavírá ho Escapem i při otevření jiného okna). Podkategorie
// ukazuje Disco při najetí na kategorii (li.exp), styly jsou v components/_catalog.scss.

import { availableViewportHeight } from './viewport';

const OPEN_CLASS = 'navigation-window-visible';

export function renderCatalog(container, { label = 'Katalog produktů' } = {}) {
  const navigation = document.querySelector('#navigation');
  if (!container || !navigation) return null;

  // Disco nabízí katalogové tlačítko jen v mobilní hlavičce, pro desktop ho doplňujeme.
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'toggle-window as-catalog__toggle';
  toggle.dataset.target = 'navigation';
  toggle.setAttribute('aria-controls', 'navigation');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = label;
  container.prepend(toggle);

  // Podmenu je absolutní a nezvyšuje výšku rodiče. Pro scroll celého původního panelu změříme
  // i jeho obsah; na nízkém displeji zůstanou dostupné všechny kategorie.
  const fitPanel = () => {
    if (!document.body.classList.contains(OPEN_CLASS) || !window.matchMedia('(min-width: 768px)').matches) return;
    const available = availableViewportHeight(navigation.getBoundingClientRect().top);
    const content = Math.max(
      navigation.querySelector('.navigation-in')?.offsetHeight || 0,
      ...Array.from(navigation.querySelectorAll('.menu-level-1 > li.exp > .menu-level-2'), (menu) => menu.scrollHeight),
    );
    navigation.style.setProperty('--as-navigation-available-height', `${available}px`);
    navigation.style.setProperty('--as-navigation-content-height', `${content}px`);
  };

  // Disco nastaví aria-expanded jen při kliknutí na tlačítko, ne když okno zavře Escape nebo jiné
  // okno. Stav proto čteme z třídy na <body>.
  const sync = () => {
    toggle.setAttribute('aria-expanded', String(document.body.classList.contains(OPEN_CLASS)));
    if (!document.body.classList.contains(OPEN_CLASS)) {
      navigation.style.removeProperty('--as-navigation-content-height');
    }
    fitPanel();
  };
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(fitPanel).observe(navigation, { subtree: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', fitPanel, { passive: true });
  window.visualViewport?.addEventListener('resize', fitPanel, { passive: true });
  sync();

  // Klik mimo panel (nebo na jeho prázdnou plochu) zavře katalog stejně jako tlačítko. Mobilní menu Disco
  // na to má vlastní overlay, na desktopu chybí. Ztmavení Disca (body::before) najíždí s přechodem,
  // proto nečekáme klik přímo na <body>. Tlačítka oken Disca (.toggle-window) zavírají katalog sama.
  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains(OPEN_CLASS)) return;
    const blankDesktopPanel = event.target === navigation && window.matchMedia('(min-width: 768px)').matches;
    if ((!blankDesktopPanel && navigation.contains(event.target)) || event.target.closest?.('.toggle-window')) return;
    toggle.click();
  });

  return toggle;
}
