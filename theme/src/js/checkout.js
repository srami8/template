// Původní rozbalovací popisek slouží jako nadpis stále viditelného nativního kontaktu.
function syncCheckoutContact() {
  const box = document.querySelector('#checkoutSidebar .checkout-box');
  const title = box?.querySelector('.toggle-contacts');
  if (!box?.querySelector('.contact-box a') || !title || title.getAttribute('role') === 'heading') return;
  const labels = { cs: 'Potřebujete poradit?', sk: 'Potrebujete poradiť?', en: 'Need advice?' };
  title.textContent = labels[(document.documentElement.lang || 'cs').slice(0, 2)] || title.childNodes[0]?.textContent || title.textContent;
  title.setAttribute('role', 'heading');
  title.setAttribute('aria-level', '2');
}

// Shoptet přepočítává volby přes mousedown na .radio-wrapper. Nativní změna radia klávesnicí
// sama aktualizuje jen checked; předejme ji stejné obsluze, bez vlastního výpočtu/stavů.
export function enhanceCheckout() {
  if (!document.body.matches('.in-krok-1, .in-krok-2')) return;
  syncCheckoutContact();
  document.addEventListener('ShoptetDOMPageContentLoaded', syncCheckoutContact);
  document.addEventListener('ShoptetDOMCartContentLoaded', syncCheckoutContact);
  if (!document.body.classList.contains('in-krok-1')) return;
  document.addEventListener('change', event => {
    const input = event.target;
    if (!input.matches('.shipping-billing-table input[type="radio"][name="shippingId"], .shipping-billing-table input[type="radio"][name="billingId"]')) return;
    const row = input.closest('.radio-wrapper');
    if (!input.checked || input.disabled || !row || row.classList.contains('active')) return;
    row.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  });
}
