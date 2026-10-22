// „Katalog produktů“ pro hlavičky v2 a v3: tlačítko, které otevře panel s kategoriemi z menu Disco.
// Menu Disco nepřesouváme (jeho skripty počítají s původním místem), ale klonujeme.

let idCounter = 0;

// Obrázky v menu Disco se načítají líně z data-src, v klonu je načteme až při otevření.
function loadImages(root) {
  root.querySelectorAll('img[data-src]').forEach((img) => {
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  });
}

function buildCategoryList() {
  const source = document.querySelector('#navigation .menu-level-1');
  if (!source) return null;

  const list = document.createElement('ul');
  list.className = 'as-catalog__categories';
  source.querySelectorAll(':scope > li').forEach((item) => {
    const clone = item.cloneNode(true);
    clone.removeAttribute('role');
    clone.querySelectorAll('[role], [aria-haspopup], [aria-expanded], [tabindex]').forEach((el) => {
      ['role', 'aria-haspopup', 'aria-expanded', 'tabindex'].forEach((attr) => el.removeAttribute(attr));
    });
    clone.querySelector(':scope > a .submenu-arrow')?.remove();
    list.append(clone);
  });
  return list;
}

export function renderCatalog(container, { label = 'Katalog produktů' } = {}) {
  const categories = buildCategoryList();
  if (!container || !categories) return null;

  idCounter += 1;
  const panelId = `as-catalog-panel-${idCounter}`;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'as-catalog__toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', panelId);
  toggle.textContent = label;

  const sub = document.createElement('div');
  sub.className = 'as-catalog__sub';

  const panel = document.createElement('div');
  panel.className = 'as-catalog__panel';
  panel.id = panelId;
  panel.hidden = true;
  panel.append(categories, sub);

  const backdrop = document.createElement('div');
  backdrop.className = 'as-catalog__backdrop';
  backdrop.hidden = true;

  const wrapper = document.createElement('div');
  wrapper.className = 'as-catalog';
  wrapper.append(toggle);
  container.prepend(wrapper);
  // Ztmavení dáváme do hlavičky, ne do <body>: musí být ve stejném stacking contextu jako panel.
  container.append(backdrop, panel);

  // Podkategorie aktivní kategorie se zobrazí v pravém panelu.
  function activate(item) {
    categories.querySelectorAll(':scope > li.is-active').forEach((li) => li.classList.remove('is-active'));
    item.classList.add('is-active');
    sub.replaceChildren();
    const level2 = item.querySelector('.menu-level-2');
    if (level2) sub.append(level2.cloneNode(true));
  }

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    backdrop.hidden = !open;
    if (open) {
      loadImages(panel);
      const first = categories.querySelector(':scope > li');
      if (first && !categories.querySelector(':scope > li.is-active')) activate(first);
      loadImages(sub);
    }
  }

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  categories.querySelectorAll(':scope > li').forEach((item) => {
    const link = item.querySelector(':scope > a');
    item.addEventListener('mouseenter', () => {
      activate(item);
      loadImages(sub);
    });
    link?.addEventListener('focus', () => {
      activate(item);
      loadImages(sub);
    });
  });

  return wrapper;
}
