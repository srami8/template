// „Katalog produktů“ pro hlavičky v2 a v3: tlačítko, které otevře původní menu Disco (#navigation)
// jako svislý panel kategorií. Otevírání obstarává Disco samo: tlačítko má třídu .toggle-window
// a data-target="navigation" jako hamburger mobilního menu, Disco pak přepíná
// body.navigation-window-visible (a zavírá ho Escapem i při otevření jiného okna). Podkategorie
// ukazuje Disco při najetí na kategorii (li.exp), styly jsou v components/_catalog.scss.

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

  // Disco nastaví aria-expanded jen při kliknutí na tlačítko, ne když okno zavře Escape nebo jiné
  // okno. Stav proto čteme z třídy na <body>.
  const sync = () => toggle.setAttribute('aria-expanded', String(document.body.classList.contains(OPEN_CLASS)));
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // Klik mimo panel (na ztmavenou stránku) zavře katalog stejně jako tlačítko. Mobilní menu Disco
  // na to má vlastní overlay, na desktopu chybí. Ztmavení Disca (body::before) najíždí s přechodem,
  // proto nečekáme klik přímo na <body>. Tlačítka oken Disca (.toggle-window) zavírají katalog sama.
  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains(OPEN_CLASS)) return;
    if (navigation.contains(event.target) || event.target.closest?.('.toggle-window')) return;
    toggle.click();
  });

  return toggle;
}
