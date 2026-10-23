// Okno košíku po najetí na košík v hlavičce (Figma: „Košík - hover“, „Košík - hover - prázdný“).
// Okno je #cart-widget Disca: otevírání najetím, načtení obsahu (AJAX), změny množství, odebrání
// i tlačítko do košíku obsluhuje Shoptet. Doplňujeme jen:
//   pozici okna přímo pod tlačítkem košíku (Disco ji má pevnou pro svou hlavičku),
//   otevření i u prázdného košíku (Disco okno ukazuje jen u .full),
//   kontakt z nastavení e-shopu v prázdném košíku.

import { contactFromShop, contactCard } from './contact';
import { availableViewportHeight } from './viewport';

const OPEN_CLASS = 'cart-window-visible';
const CONTACT_CLASS = 'as-cart-contact';

function isDesktop() {
  const { shoptet } = window;
  return !shoptet?.helpers?.isTouchDevice?.()
    && shoptet?.layout?.detectResolution?.(shoptet.abilities.config.navigation_breakpoint);
}

// Okno je absolutně vůči <body>. Horní okraj = spodek tlačítka, pravý okraj lícuje s tlačítkem
// (šířku okna dává CSS).
function placeWidget(widget, button) {
  const parent = widget.offsetParent || document.body;
  const box = parent.getBoundingClientRect();
  const rect = button.getBoundingClientRect();
  widget.style.setProperty('--as-popup-top', `${rect.bottom - box.top}px`);
  widget.style.setProperty('--as-popup-right', `${Math.max(16, box.right - rect.right)}px`);
  widget.style.setProperty('--as-popup-available-height', `${availableViewportHeight(rect.bottom)}px`);
}

// Shoptet obsah okna při každém otevření načte znovu, kontakt proto doplňujeme po každé změně.
function addContactToEmpty(widget, contact) {
  const inner = widget.querySelector('.cart-widget-inner');
  if (!inner || inner.classList.contains('full') || !inner.querySelector('.cart-widget-products')) return;
  if (inner.querySelector(`.${CONTACT_CLASS}`)) return;
  inner.append(contactCard(contact, CONTACT_CLASS));
}

export function enhanceCart() {
  const button = document.querySelector('#header .cart-count[data-target="cart"]');
  const widget = document.getElementById('cart-widget');
  if (!button || !widget) return;

  const place = () => {
    if (document.body.classList.contains(OPEN_CLASS)) placeWidget(widget, button);
  };
  new MutationObserver(place).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', place, { passive: true });
  window.visualViewport?.addEventListener('resize', place, { passive: true });
  new ResizeObserver(place).observe(document.getElementById('header'));
  place();

  // Prázdný košík: Disco při najetí okno nezobrazí, otevřeme ho jeho vlastní funkcí.
  button.addEventListener('mouseenter', () => {
    if (button.classList.contains('full') || !isDesktop()) return;
    if (document.body.classList.contains(OPEN_CLASS)) return;
    window.shoptet?.popups?.showPopupWindow?.('cart', true, 'cart-widget');
  });

  const contact = contactFromShop();
  if (contact) {
    new MutationObserver(() => addContactToEmpty(widget, contact))
      .observe(widget, { childList: true, subtree: true });
  }
}
