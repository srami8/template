// Doplňkové bannery Shoptetu s pozicí Střed vedle vybrané produktové sekce úvodní stránky.
// Disco všechny bannery Střed vykreslí jedním blokem #content > .body-banners za první sekcí.
// Obchodník banner přiřadí sekci názvem: „Nadpis sekce [L]“ (vlevo) nebo „Nadpis sekce [P]“ / „[R]“
// (vpravo). Značku hledáme v interním názvu banneru (Shoptet ho posílá do měření v
// #trackingScript[data-products], klíčem je data-ec-promo-id odkazu), pak v popisu obrázku (alt)
// a v nadpisu banneru; banner bez odkazu nemá promo ID ani interní název. Přiřazený .banner-wrapper
// přesuneme (jinam ho Shoptet vykreslit neumí) do vlastního bloku před nadpis sekce, rozložení
// řeší components/_body-banners.scss. Banner bez značky nebo bez shody zůstává, kde je.

const MARKER = /\s*\[\s*([LPR])\s*\]\s*$/i;
const SIDES = { L: 'left', P: 'right', R: 'right' };

const normalize = (text) => text.normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('cs');

function parseMarker(text) {
  const match = (text || '').match(MARKER);
  return match ? { section: normalize(text.slice(0, match.index)), side: SIDES[match[1].toUpperCase()] } : null;
}

// Interní názvy bannerů podle promo ID: { "258": { id: "banner19", name: "…", position: "indexPageBody" } }.
function trackedBanners() {
  try {
    return JSON.parse(document.getElementById('trackingScript')?.dataset.products || '{}').banners || {};
  } catch {
    return {};
  }
}

// Značka je jen pro přiřazení, zákazník ji nevidí (ani čtečka v alt).
function stripMarker(img, title) {
  if (img && MARKER.test(img.alt)) img.alt = img.alt.replace(MARKER, '');
  if (title && MARKER.test(title.textContent)) title.textContent = title.textContent.replace(MARKER, '');
}

export function placeSectionBanners() {
  if (!document.body.classList.contains('type-index')) return;
  const content = document.getElementById('content');
  const block = content?.querySelector(':scope > .body-banners');
  if (!block) return;

  const tracked = trackedBanners();
  const headings = [...content.querySelectorAll(':scope > .homepage-group-title')]
    .filter((heading) => heading.nextElementSibling?.matches('.products-wrapper'));
  const used = new Set();

  block.querySelectorAll('.banner-wrapper').forEach((wrapper) => {
    const promoId = wrapper.querySelector('a[data-ec-promo-id]')?.dataset.ecPromoId;
    const img = wrapper.querySelector('img');
    const title = wrapper.querySelector('.extended-banner-title');
    const target = [tracked[promoId]?.name, img?.alt, title?.textContent].map(parseMarker).find(Boolean);
    stripMarker(img, title);
    if (!target) return;

    const heading = headings.find((h) => !used.has(h) && normalize(h.textContent) === target.section);
    if (!heading) return;
    used.add(heading);

    // Třídy bloku Disca, aby na banner platily jeho i naše styly bannerů (components/_banners.scss).
    const holder = document.createElement('div');
    holder.className = `banners-content body-banners as-section-banner as-section-banner--${target.side}`;
    const column = wrapper.parentElement;
    holder.append(wrapper);
    heading.before(holder);
    if (column !== block && !column.children.length) column.remove();
  });

  // Prázdný původní blok by zůstal jako mezera za první sekcí.
  if (!block.querySelector('.banner-wrapper')) block.remove();
}
