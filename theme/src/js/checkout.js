// Shoptet přepočítává volby přes mousedown na .radio-wrapper. Nativní změna radia klávesnicí
// sama aktualizuje jen checked; předejme ji stejné obsluze, bez vlastního výpočtu/stavů.
export function enhanceCheckout() {
  if (!document.body.classList.contains('in-krok-1')) return;
  document.addEventListener('change', event => {
    const input = event.target;
    if (!input.matches('.shipping-billing-table input[type="radio"][name="shippingId"], .shipping-billing-table input[type="radio"][name="billingId"]')) return;
    const row = input.closest('.radio-wrapper');
    if (!input.checked || input.disabled || !row || row.classList.contains('active')) return;
    row.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  });
}
