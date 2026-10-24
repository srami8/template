// Vzhled popisu kategorie s obrázkem (scss/variants/category-*.scss, nastavení šablony
// categoryLayout). Obrázek je první obrázek vložený do popisu kategorie v administraci.
//
// Rozložení (pruh, sloupec pro obrázek) zapne CSS už při prvním vykreslení podle
// :has(> .category-perex img) a obrázky v popisu do té doby skryje, místo pro obrázek drží
// zástupný blok stejného rozměru. Tady se obrázek jen přesune z popisu do <figure> na připravené
// místo (třída .as-intro-media), takže se nezobrazí dvakrát a stránka neposkočí. Další obrázky
// zůstávají v textu. Popis v administraci se nemění.

const IMAGE_LAYOUTS = ['background', 'image', 'image-wide'];

// Po přesunu obrázku zůstanou prázdné obaly (<p>, <a>), ty by v popisu dělaly mezeru.
function removeEmpty(node, root) {
  let current = node;
  while (current && current !== root) {
    const parent = current.parentElement;
    const empty = !current.textContent.replace(/ /g, ' ').trim()
      && !current.querySelector('img, picture, video, iframe, svg, table, ul, ol');
    if (!empty) break;
    current.remove();
    current = parent;
  }
}

function enhance() {
  const top = document.querySelector('.category-top');
  const perex = top?.querySelector(':scope > .category-perex');
  if (!top || !perex || top.classList.contains('as-intro-media')) return;
  const image = perex.querySelector('img');
  if (!image) return;

  const parent = image.parentElement;
  const figure = document.createElement('figure');
  figure.className = 'as-category-intro__media';
  // Rozměry z editoru (style, width, height) by obrázek v rámečku deformovaly, vyplní ho přes CSS.
  ['style', 'width', 'height', 'align', 'hspace', 'vspace', 'border'].forEach((name) => image.removeAttribute(name));
  image.className = 'as-category-intro__image';
  image.loading = 'eager';
  image.decoding = 'async';
  figure.append(image);
  perex.after(figure);
  removeEmpty(parent, perex);
  top.classList.add('as-intro-media');
}

export function enhanceCategoryIntro(config) {
  if (!document.body.classList.contains('type-category') || !IMAGE_LAYOUTS.includes(config.categoryLayout)) return;
  enhance();
  // Řazení, filtry a stránkování (AJAX) vymění .category-top i s popisem.
  document.addEventListener('ShoptetDOMPageContentLoaded', enhance);
}
