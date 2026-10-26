// Původní Shoptet obsluhuje související produkty, kupon i všechny formuláře.
// Doplňujeme jejich přístupnost a zachování rozbalení/fokusu po jeho AJAXu.
const expandedProducts = new Map();
let panelId = 0;
let lastFocus = null;
const controlSelector = '.amount, .increase, .decrease, .show-related, .remove-item';

function rowKey(row) {
  return row.querySelector('input[name="itemId"]')?.value || row.dataset.microIdentifier;
}
function syncCoupon() {
  const button = document.querySelector('.in-kosik .toggle-coupon-input-button');
  const panel = button?.nextElementSibling;
  if (!button || !panel?.matches('.discount-coupon')) return;
  panel.id ||= 'cart-discount-coupon';
  button.setAttribute('aria-controls', panel.id);
  button.setAttribute('aria-expanded', String(button.classList.contains('discount-coupon-visible')));
}

export function enhanceCartStep() {
  if (!document.body.classList.contains('in-kosik')) return;
  const rows = [...document.querySelectorAll('.cart-table tr.removeable')];
  let unveiled = false;
  rows.forEach(row => {
    const toggle = row.querySelector('.show-related');
    const panel = row.nextElementSibling;
    const name = row.querySelector('.main-link')?.textContent.trim();
    row.querySelectorAll('.remove-item').forEach(button => {
      const label = button.querySelector('.sr-only')?.textContent.trim();
      if (label && name) button.setAttribute('aria-label', `${label}: ${name}`);
    });
    if (!toggle || !panel?.matches('tr.related')) return;
    const saved = expandedProducts.get(rowKey(row));
    if (saved !== undefined && saved !== panel.classList.contains('visible')) {
      if (window.shoptet?.cart?.toggleRelatedProducts && window.jQuery) {
        window.shoptet.cart.toggleRelatedProducts(window.jQuery(panel));
      } else {
        panel.classList.toggle('visible', saved);
        row.classList.toggle('related-visible', saved);
      }
      unveiled ||= saved;
    }
    panel.id ||= `as-cart-related-${++panelId}`;
    toggle.removeAttribute('aria-hidden');
    toggle.tabIndex = 0;
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-expanded', String(panel.classList.contains('visible')));
  });
  if (unveiled) window.shoptet?.images?.unveil?.();
  syncCoupon();
  if (lastFocus && !document.contains(lastFocus.node) && [document.body, document.documentElement].includes(document.activeElement)) {
    const row = rows.find(item => rowKey(item) === lastFocus.key);
    const target = row?.querySelector(lastFocus.selector) || rows[0]?.querySelector('.main-link') || document.getElementById('content');
    if (target) {
      if (target.id === 'content') target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
    lastFocus = null;
  }
}

document.addEventListener('focusin', event => {
  const row = event.target.closest?.('.in-kosik .cart-table tr.removeable');
  if (!row || !event.target.matches(controlSelector)) return;
  lastFocus = {node: event.target, key: rowKey(row), selector: controlSelector.split(', ').find(selector => event.target.matches(selector))};
});
document.addEventListener('click', event => {
  const toggle = event.target.closest?.('.in-kosik .show-related');
  if (toggle) {
    const row = toggle.closest('tr');
    const open = row.nextElementSibling?.classList.contains('visible') || false;
    expandedProducts.set(rowKey(row), open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  if (event.target.closest?.('.in-kosik .toggle-coupon-input-button')) syncCoupon();
});
document.addEventListener('keydown', event => {
  const toggle = event.target.closest?.('.in-kosik .show-related');
  if (toggle && event.key === ' ') { event.preventDefault(); toggle.click(); }
});
document.addEventListener('ShoptetDOMCartContentLoaded', enhanceCartStep);
