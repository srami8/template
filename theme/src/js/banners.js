// Bannery na výšku (varianta „cards“). Bannery i jejich texty zadává obchodník v administraci
// Shoptetu jako bannery carouselu. Tady z nich složíme vodorovně posuvný pás karet.
// Ostatní varianty (default / content / fullwidth) řeší jen CSS.

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

// Neaktivní snímky carouselu Shoptet načítá líně (data-src), v kartách je potřeba hned.
function prepareImages(root) {
  root.querySelectorAll('img').forEach((img, index) => {
    if (img.dataset.src) img.src = img.dataset.src;
    img.removeAttribute('data-src');
    img.loading = index < 4 ? 'eager' : 'lazy';
  });
}

function buildCard(item) {
  const card = el('li', 'as-bcard');
  const content = item.querySelector(':scope > a') || item.querySelector(':scope > img');
  if (!content) return null;
  card.append(content.cloneNode(true));
  return card;
}

function updateArrows(track, prev, next) {
  const max = track.scrollWidth - track.clientWidth - 1;
  prev.hidden = track.scrollLeft <= 1;
  next.hidden = track.scrollLeft >= max;
}

export function enhanceBanners(config) {
  if (config.banners !== 'cards') return;

  // Karty skládáme z bannerů carouselu a za ně i z postranních bannerů, aby se nic, co obchodník
  // v administraci nahrál, neztratilo.
  const row = document.querySelector('.banners-row');
  const items = row
    ? [...row.querySelectorAll('#carousel .carousel-inner > .item, .next-to-carousel-banners .banner-wrapper')]
    : [];
  if (!items.length) return;

  const track = el('ul', 'as-bcards__track');
  items.map(buildCard).filter(Boolean).forEach((card) => track.append(card));
  prepareImages(track);

  const prev = el('button', 'as-bcards__arrow as-bcards__arrow--prev');
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Předchozí bannery');
  const next = el('button', 'as-bcards__arrow as-bcards__arrow--next');
  next.type = 'button';
  next.setAttribute('aria-label', 'Další bannery');

  // Posun o šířku viditelné části, aby se nové karty zobrazily celé.
  const scrollByPage = (direction) => track.scrollBy({ left: direction * track.clientWidth * 0.9 });
  prev.addEventListener('click', () => scrollByPage(-1));
  next.addEventListener('click', () => scrollByPage(1));
  track.addEventListener('scroll', () => updateArrows(track, prev, next), { passive: true });

  const section = el('section', 'as-bcards');
  section.setAttribute('aria-label', 'Akce a novinky');
  section.append(prev, track, next);
  row.after(section);

  // Původní carousel Disco už není potřeba (a nemá zbytečně přepínat snímky na pozadí).
  row.remove();

  updateArrows(track, prev, next);
  window.addEventListener('resize', () => updateArrows(track, prev, next), { passive: true });
}
