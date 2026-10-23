// Kategorie na úvodní stránce (Figma: Homepage – „Kategorie“). Kategorie vybírá obchodník v nastavení
// šablony, název, odkaz a obrázek se při uložení převezmou z kategorií e-shopu (viz settings-app).
// Disco takový blok na úvodní stránce nemá, proto ho vkládáme. Používáme ale jeho markup:
//   nadpis jako u produktových bloků úvodní stránky (.homepage-group-title.h4),
//   karty jako podkategorie na stránce kategorie (ul.subcategories.with-image > li > a > .image + .text),
//   carousel jako produktový slider Shoptetu (shoptet.slider.runProductSlider, obal .product-slider-holder).
// Slider sám přidá šipky jen tehdy, když je kategorií víc, než se vejde vedle sebe (na desktopu 6).

const LIST_CLASS = 'as-home-categories__list';

// Shoptet dává kategoriím bez obrázku zástupnou ikonu složky, stejně jako v podkategoriích.
const PLACEHOLDER = 'https://cdn.myshoptet.com/prj/dist/master/cms/templates/frontend_templates/00/img/folder.svg';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function categoryItem({ name, url, image }) {
  const img = el('img');
  img.src = image || PLACEHOLDER;
  img.alt = '';
  img.loading = 'lazy';

  const imageWrap = el('span', 'image');
  imageWrap.append(img);

  // Odkaz obaluje obrázek i název, klikací je tak celá karta (jako u podkategorií Disca).
  const link = el('a');
  link.href = url;
  link.append(imageWrap, el('span', 'text', name));

  const item = el('li');
  item.append(link);
  return item;
}

// Blok patří pod lištu výhod obchodu, bez ní pod bannery, jinak na začátek obsahu.
function insertBlock(block) {
  const content = document.querySelector('#content');
  const anchor = content?.querySelector(':scope > .benefitBanner') || content?.querySelector(':scope > .banners-row');
  if (anchor) anchor.after(block);
  else if (content) content.prepend(block);
  return Boolean(content);
}

export function renderHomeCategories(config) {
  const { title, items } = config.homeCategories || {};
  if (!document.body.classList.contains('type-index') || !Array.isArray(items) || items.length === 0) return;

  const list = el('ul', `subcategories with-image ${LIST_CLASS}`);
  list.dataset.columns = '6';
  list.dataset.columnsMobile = '2';
  items.filter((item) => item.name && item.url).forEach((item) => list.append(categoryItem(item)));

  const holder = el('div', 'product-slider-holder');
  holder.append(list);

  const block = el('section', 'as-home-categories');
  if (title) block.append(el('div', 'homepage-group-title h4', title));
  block.append(holder);
  if (!insertBlock(block)) return;

  // Bez slideru (vypnutý v Shoptetu) zůstanou karty v mřížce, kterou zajistí CSS.
  if (window.shoptet?.abilities?.feature?.product_slider && window.shoptet.slider?.runProductSlider) {
    window.shoptet.slider.runProductSlider(`.${LIST_CLASS}`);
    block.classList.add('as-home-categories--slider');
  }
}
