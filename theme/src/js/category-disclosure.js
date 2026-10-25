// Mobilní ořez původního popisu a seznamu. Obsah z administrace zůstává v DOM;
// tlačítka přidáváme jen při přetečení nebo pokud lze rozbalením odhalit články.
const mobile = window.matchMedia('(max-width: 767px)');
const labels = {
  cs: ['Číst více', 'Zobrazit méně', 'Zobrazit všechny kategorie', 'Zobrazit méně kategorií'],
  sk: ['Čítať viac', 'Zobraziť menej', 'Zobraziť všetky kategórie', 'Zobraziť menej kategórií'],
  en: ['Read more', 'Show less', 'Show all categories', 'Show fewer categories'],
};
const observed = new WeakSet();
const state = new Map();

function control(top, kind, anchor, targets, needed) {
  let button = top.querySelector(`:scope > [data-as-disclosure="${kind}"]`);
  if (!needed && !button) return;
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'as-category-expand';
    button.dataset.asDisclosure = kind;
    anchor.after(button);
    button.addEventListener('click', () => {
      const key = `${location.pathname}:${kind}`;
      state.set(key, !state.get(key));
      enhanceCategoryDisclosure();
    });
  }
  const expanded = state.get(`${location.pathname}:${kind}`) || false;
  const words = labels[(document.documentElement.lang || 'cs').slice(0, 2)] || labels.en;
  button.textContent = words[(kind === 'intro' ? 0 : 2) + Number(expanded)];
  button.hidden = !needed || !mobile.matches;
  button.setAttribute('aria-expanded', String(expanded));
  button.setAttribute('aria-controls', targets.map((target, i) => {
    if (!target.id) target.id = `as-category-${kind}-${i}`;
    return target.id;
  }).join(' '));
  top.dataset[kind === 'intro' ? 'asIntroCollapsed' : 'asSubcategoriesCollapsed'] = String(needed && !expanded);
}

export function enhanceCategoryDisclosure() {
  const top = document.querySelector('.category-top');
  if (!top || !document.body.classList.contains('type-category')) return;
  const perex = top.querySelector(':scope > .category-perex');
  const articles = top.querySelector(':scope > .as-category-articles');
  const list = top.querySelector(':scope > .subcategories');
  const intro = [perex, articles].filter(Boolean);
  const anchor = perex || top.querySelector(':scope > .category-title');
  if (anchor && intro.length) {
    control(top, 'intro', anchor, intro, Boolean(articles) || (perex?.scrollHeight || 0) > 95);
  }
  if (list) control(top, 'subcategories', list, [list], list.scrollHeight > 308);
  // Obrázky a webfonty mohou změnit výšku až po prvním vykreslení.
  if (!observed.has(top)) {
    observed.add(top);
    const observer = new ResizeObserver(enhanceCategoryDisclosure);
    [top, perex, list].filter(Boolean).forEach(element => observer.observe(element));
    // Tab na odkaz za ořezem nejdřív odhalí jeho obsah.
    top.addEventListener('focusin', event => {
      const section = event.target.closest('.category-perex, .subcategories');
      if (!mobile.matches || !section || event.target === section) return;
      const kind = section === perex ? 'intro' : 'subcategories';
      if (event.target.getBoundingClientRect().bottom > section.getBoundingClientRect().bottom) {
        state.set(`${location.pathname}:${kind}`, true);
        enhanceCategoryDisclosure();
      }
    });
  }
}
mobile.addEventListener('change', enhanceCategoryDisclosure);
