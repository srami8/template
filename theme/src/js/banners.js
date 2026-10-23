// Bannery na výšku (varianta „cards“). Bannery i jejich texty zadává obchodník v administraci
// Shoptetu jako bannery carouselu. Pás karet je původní #carousel Disca: CSS ukáže všechny
// snímky (.item) vedle sebe ve vodorovně posuvném .carousel-inner. JS jen vypne přepínání snímků
// a šipky .carousel-control přesměruje na posun pásu. DOM carouselu se nemění.
// Ostatní varianty (default / content / fullwidth) řeší jen CSS.

const AT_START = 'as-cards-at-start';
const AT_END = 'as-cards-at-end';

// Bootstrap carousel (Disco ho spouští přes data-ride po načtení stránky) by snímky dál přepínal
// a šipkami posouval aktivní snímek. Nastavíme mu interval a klávesy přes data atributy, a když
// už běží, i do jeho instance.
function stopCycling(carousel) {
  carousel.dataset.interval = 'false';
  carousel.dataset.keyboard = 'false';
  const instance = window.jQuery?.(carousel).data('bs.carousel');
  if (!instance) return;
  instance.options.interval = false;
  instance.options.keyboard = false;
  instance.pause();
}

// Neaktivní snímky Shoptet načítá líně (obrázek v data-src), v pásu jsou vidět hned.
function loadImages(carousel) {
  carousel.querySelectorAll('.carousel-inner > .item img[data-src]').forEach((img) => {
    if (img.getAttribute('src') !== img.dataset.src) img.src = img.dataset.src;
  });
}

function updateEnds(carousel, track) {
  const max = track.scrollWidth - track.clientWidth - 1;
  carousel.classList.toggle(AT_START, track.scrollLeft <= 1);
  carousel.classList.toggle(AT_END, track.scrollLeft >= max);
}

export function enhanceBanners(config) {
  if (config.banners !== 'cards') return;

  // Karty jsou jen z bannerů pozice Carousel, ostatní pozice bannerů do pásu nepatří (skryje CSS).
  const carousel = document.querySelector('.banners-row #carousel');
  const track = carousel?.querySelector(':scope > .carousel-inner');
  if (!track) return;

  // Měříme původní sloupec, nikoli roztažený carousel; změna šířky pásu tak nemění měření.
  const column = carousel.parentElement;
  const fitTrack = () => {
    const box = column.getBoundingClientRect();
    const style = getComputedStyle(column);
    const left = parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth);
    const right = parseFloat(style.paddingRight) + parseFloat(style.borderRightWidth);
    carousel.style.setProperty('--as-cards-inset', `${Math.max(0, box.left + left)}px`);
    carousel.style.setProperty('--as-cards-content-width', `${box.width - left - right}px`);
    updateEnds(carousel, track);
  };
  new ResizeObserver(fitTrack).observe(column);
  window.addEventListener('resize', fitTrack, { passive: true });
  fitTrack();

  stopCycling(carousel);
  window.addEventListener('load', () => stopCycling(carousel), { once: true });
  loadImages(carousel);

  // Šipky Disca: jejich klik obsluhuje Bootstrap delegovaně na documentu ([data-slide]). Klik
  // zastavíme na šipce, takže se snímek nepřepne, a místo toho posuneme pás o viditelnou šířku.
  carousel.querySelectorAll(':scope > .carousel-control[data-slide]').forEach((control) => {
    control.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const direction = control.dataset.slide === 'prev' ? -1 : 1;
      track.scrollBy({ left: direction * track.clientWidth * 0.9 });
    });
  });

  track.addEventListener('scroll', () => updateEnds(carousel, track), { passive: true });
  window.addEventListener('resize', () => updateEnds(carousel, track), { passive: true });
  updateEnds(carousel, track);
}
