// Doplňkové bannery Shoptetu na úvodní stránce: kam který patří, určí obchodník koncem
// interního názvu banneru.
//   „Nadpis sekce [L]“ / „[P]“ / „[R]“  vedle produktové sekce se stejným nadpisem (vlevo / vpravo),
//   „Cokoli [1]“, „[2]“ …               mozaika pod prvním pásem produktů na danou pozici
//                                       (Figma „Bannery medium“, components/_banner-mosaic.scss),
//   bez značky                          zůstává, kde ho vykreslí Disco.
// Bannery bere z pozice Zápatí (#content > .footer-banners > .footer-banner, Shoptet jich pošle
// libovolný počet) i Střed (#content > .body-banners .banner-wrapper, nejvýš dva).
// Značku hledáme v interním názvu (Shoptet ho posílá do měření v #trackingScript[data-products],
// klíčem je data-ec-promo-id odkazu), pak v popisu obrázku (alt) a v nadpisu banneru; banner bez
// cílové adresy nemá odkaz ani promo ID. Jinam Shoptet bannery vykreslit neumí, proto původní prvek
// přesuneme (odkaz i měření zůstávají). Přihlášenému adminovi ukáže štítek, kam banner patří.

const MARKER = /\s*\[\s*([LPR]|\d{1,2})\s*\]\s*$/i;
const SIDES = { L: 'left', P: 'right', R: 'right' };
const SIDE_LABELS = { left: 'vlevo', right: 'vpravo' };
// Doporučené rozměry obrázků (dvojnásobek dlaždice z návrhu).
const SIZES = { tall: '920 × 1000', low: '920 × 480', section: '868 × 1018' };

const normalize = (text) => text.normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('cs');

function parseMarker(text) {
  const match = (text || '').match(MARKER);
  if (!match) return null;
  const value = match[1].toUpperCase();
  if (SIDES[value]) return { side: SIDES[value], section: normalize(text.slice(0, match.index)) };
  return { position: Number(value) };
}

// Interní názvy bannerů podle promo ID: { "258": { id: "banner19", name: "…", position: "footer" } }.
function trackedBanners() {
  try {
    return JSON.parse(document.getElementById('trackingScript')?.dataset.products || '{}').banners || {};
  } catch {
    return {};
  }
}

// Značka je jen pro umístění, zákazník ji nevidí (ani čtečka v alt).
function stripMarker(img, title) {
  if (img && MARKER.test(img.alt)) img.alt = img.alt.replace(MARKER, '');
  if (title && MARKER.test(title.textContent)) title.textContent = title.textContent.replace(MARKER, '');
}

function adminLabel(unit, text) {
  unit.dataset.asAdminLabel = text;
}

// Banner = .footer-banner (Zápatí) nebo .banner-wrapper (Střed).
function collectUnits(content) {
  const footer = content.querySelector(':scope > .footer-banners');
  const middle = content.querySelector(':scope > .body-banners');
  return {
    blocks: [footer, middle].filter(Boolean),
    units: [
      ...(footer ? footer.querySelectorAll(':scope > .footer-banner') : []),
      ...(middle ? middle.querySelectorAll('.banner-wrapper') : []),
    ],
  };
}

function placeBesideSections(content, banners) {
  const headings = [...content.querySelectorAll(':scope > .homepage-group-title')]
    .filter((heading) => heading.nextElementSibling?.matches('.products-wrapper'));
  const used = new Set();

  banners.forEach(({ unit, target }) => {
    const heading = headings.find((h) => !used.has(h) && normalize(h.textContent) === target.section);
    if (!heading) {
      adminLabel(unit, `Sekce „${target.section}“ nenalezena · banner zůstal na místě`);
      return;
    }
    used.add(heading);
    // Třídy bloku Disca, aby na banner platily jeho i naše styly bannerů (components/_banners.scss).
    const holder = document.createElement('div');
    holder.className = `banners-content body-banners as-section-banner as-section-banner--${target.side}`;
    holder.append(unit);
    heading.before(holder);
    adminLabel(unit, `U sekce ${heading.textContent.trim()} · ${SIDE_LABELS[target.side]} · ${SIZES.section}`);
  });
}

// Mozaika: vzor po čtyřech (1. a 4. vysoký, 2. a 3. nízké pod sebou), stejná čísla v pořadí Shoptetu.
function placeMosaic(content, banners) {
  if (!banners.length) return;
  const anchor = content.querySelector(':scope > .homepage-group-title + .products-wrapper');
  if (!anchor) return;

  const mosaic = document.createElement('div');
  mosaic.className = 'as-banner-mosaic';
  banners
    .map((banner, index) => ({ ...banner, index }))
    .sort((a, b) => a.target.position - b.target.position || a.index - b.index)
    .forEach(({ unit }, slot) => {
      const tall = slot % 4 === 0 || slot % 4 === 3;
      unit.classList.add('as-banner-mosaic__item', `as-banner-mosaic__item--${tall ? 'tall' : 'low'}`);
      adminLabel(unit, `Mozaika · pozice ${slot + 1} · ${tall ? `vysoký ${SIZES.tall}` : `nízký ${SIZES.low}`}`);
      mosaic.append(unit);
    });
  anchor.after(mosaic);
}

export function placeHomepageBanners() {
  if (!document.body.classList.contains('type-index')) return;
  const content = document.getElementById('content');
  if (!content) return;

  const { blocks, units } = collectUnits(content);
  if (!units.length) return;

  const tracked = trackedBanners();
  const beside = [];
  const mosaic = [];
  units.forEach((unit) => {
    const promoId = unit.querySelector('a[data-ec-promo-id]')?.dataset.ecPromoId;
    const img = unit.querySelector('img');
    const title = unit.querySelector('.extended-banner-title');
    const target = [tracked[promoId]?.name, img?.alt, title?.textContent].map(parseMarker).find(Boolean);
    stripMarker(img, title);
    if (!target) adminLabel(unit, unit.matches('.footer-banner') ? 'Zápatí · bez značky' : 'Střed · bez značky');
    else if (target.side) beside.push({ unit, target });
    else mosaic.push({ unit, target });
  });

  // Mozaika až po bannerech u sekcí: za první sekcí pak stojí před případným bannerem 2. sekce.
  placeBesideSections(content, beside);
  placeMosaic(content, mosaic);

  // Prázdné sloupce a bloky Disca by zůstaly jako mezery.
  blocks.forEach((block) => {
    block.querySelectorAll(':scope > [class*="col-"]').forEach((column) => {
      if (!column.querySelector('.banner-wrapper') && !column.matches('.footer-banner')) column.remove();
    });
    if (!block.querySelector('.banner-wrapper, .footer-banner')) block.remove();
  });
}
