// Původní Shoptet obsluhuje související produkty, kupon i všechny formuláře.
// Doplňujeme jejich přístupnost a zachování rozbalení/fokusu po jeho AJAXu.
// Na telefonu je rozbalený řádek .related vysouvací panel (components/_cart.scss): doplňujeme
// zavření, roli dialogu, fokus a zavření klepnutím mimo / Esc jako u filtrů a mini-košíku.
import { dismissDrawerOnBackdrop } from './drawer';

const expandedProducts = new Map();
let panelId = 0;
let lastFocus = null;
const controlSelector = '.amount, .increase, .decrease, .show-related, .remove-item';
const mobile = window.matchMedia('(max-width: 767px)');
const CLOSE_LABELS = { cs: 'Zavřít související produkty', sk: 'Zavrieť súvisiace produkty', en: 'Close related products' };

const openPanel = () => document.querySelector('.in-kosik .cart-table tr.related.visible');
const panelToggle = panel => panel?.previousElementSibling?.querySelector('.show-related');

function syncPanels() {
  document.querySelectorAll('.in-kosik .cart-table tr.related').forEach(panel => {
    panel.inert = mobile.matches && !panel.classList.contains('visible');
    if (mobile.matches) {
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
    } else {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-modal');
    }
  });
}
function addClose(panel, toggle) {
  const cell = panel.firstElementChild;
  if (!cell || cell.querySelector(':scope > button')) return;
  const lang = (document.documentElement.lang || 'cs').slice(0, 2);
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', CLOSE_LABELS[lang] || CLOSE_LABELS.en);
  close.addEventListener('click', () => toggle.click());
  cell.prepend(close);
  panel.setAttribute('aria-label', toggle.textContent.replace(/\s+/g, ' ').trim());
}

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
    addClose(panel, toggle);
  });
  if (unveiled) window.shoptet?.images?.unveil?.();
  syncPanels();
  syncCoupon();
  if (lastFocus && !document.contains(lastFocus.node) && [document.body, document.documentElement].includes(document.activeElement)) {
    const pendingFocus = lastFocus;
    lastFocus = null;
    const row = rows.find(item => rowKey(item) === pendingFocus.key);
    const target = row?.querySelector(pendingFocus.selector) || rows[0]?.querySelector('.main-link') || document.getElementById('content');
    if (target) {
      if (target.id === 'content') target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }
}

document.addEventListener('focusin', event => {
  const row = event.target.closest?.('.in-kosik .cart-table tr.removeable');
  if (!row || !event.target.matches(controlSelector)) return;
  lastFocus = {node: event.target, key: rowKey(row), selector: controlSelector.split(', ').find(selector => event.target.matches(selector))};
});
// Obsluha Shoptetu je delegovaná na html, na document už čteme výsledný stav.
document.addEventListener('click', event => {
  const toggle = event.target.closest?.('.in-kosik .show-related');
  if (toggle) {
    const row = toggle.closest('tr');
    const panel = row.nextElementSibling;
    const open = panel?.classList.contains('visible') || false;
    expandedProducts.set(rowKey(row), open);
    toggle.setAttribute('aria-expanded', String(open));
    syncPanels();
    if (mobile.matches) (open ? panel.querySelector(':scope > td > button') : toggle).focus();
  }
  if (event.target.closest?.('.in-kosik .toggle-coupon-input-button')) syncCoupon();
  // Po přidání z panelu ukazuje Shoptet vlastní okno „Přidáno do košíku“; panel by ho zakryl.
  const added = mobile.matches && event.target.closest?.('.in-kosik .cart-table tr.related.visible [type="submit"]');
  if (added) panelToggle(added.closest('tr.related'))?.click();
});
document.addEventListener('keydown', event => {
  const toggle = event.target.closest?.('.in-kosik .show-related');
  if (toggle && event.key === ' ') { event.preventDefault(); toggle.click(); }
  const panel = mobile.matches && openPanel();
  if (!panel) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    panelToggle(panel)?.click();
  } else if (event.key === 'Tab') {
    const focusable = [...panel.querySelectorAll('button, a[href], input, select, textarea, [tabindex]')]
      .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!panel.contains(document.activeElement)
      || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }
});
dismissDrawerOnBackdrop({
  panel: openPanel,
  trigger: () => panelToggle(openPanel()),
  isOpen: () => Boolean(openPanel()),
  close: () => panelToggle(openPanel())?.click(),
});
mobile.addEventListener('change', syncPanels);
document.addEventListener('ShoptetDOMCartContentLoaded', enhanceCartStep);
