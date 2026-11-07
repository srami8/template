// Zhuštěné CSS aSteroidu bez bloků vrstvy @layer as-foundation (theme/src/scss/foundation, základ pro
// Blank mode). Na e-shopu CSS Disca tuto vrstvu přebije celou (kontrola npm run foundation:noop), takže
// testy na zjednodušených stránkách, které si geometrii Disca napodobují ručně (bez kopie base-blank.css),
// ji vynechávají – ruční napodobenina Disca by ji nepřebila a výsledek by neodpovídal e-shopu.
// Používá i tests/shop/foundation-noop.cjs.

// Konec bloku od otevírací závorky na pozici j; řetězce a komentáře (content: "{", url(…)) přeskakuje.
function blockEnd(css, j) {
  let depth = 0;
  for (let k = j; k < css.length; k++) {
    const ch = css[k];
    if (ch === '"' || ch === "'") {
      for (k++; k < css.length && css[k] !== ch; k++) if (css[k] === '\\') k++;
    } else if (ch === '/' && css[k + 1] === '*') {
      k = css.indexOf('*/', k + 2);
      if (k < 0) return css.length - 1;
      k++;
    } else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return k;
  }
  return css.length - 1;
}

function withoutFoundation(input) {
  // BOM na začátku souboru by v <style> zneplatnil první pravidlo.
  const css = input.replace(/^﻿/, '');
  const marker = '@layer as-foundation';
  let out = '';
  let i = 0;
  for (;;) {
    const start = css.indexOf(marker, i);
    if (start < 0) return out + css.slice(i);
    out += css.slice(i, start);
    const brace = css.indexOf('{', start);
    const semicolon = css.indexOf(';', start);
    // Jen deklarace pořadí vrstev (@layer as-foundation;).
    if (semicolon >= 0 && (brace < 0 || semicolon < brace)) { i = semicolon + 1; continue; }
    i = blockEnd(css, brace) + 1;
  }
}

module.exports = { withoutFoundation };
