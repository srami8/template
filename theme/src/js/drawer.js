// Ztmavení může vykreslovat body i nativní .overlay. Capture zachytí také tap,
// který by delegovaná obsluha Shoptetu zastavila před document v bublající fázi.
export function dismissDrawerOnBackdrop({ panel, trigger, isOpen, close }) {
  const mobile = window.matchMedia('(max-width: 767px)');
  document.addEventListener('click', event => {
    if (!mobile.matches || !isOpen()) return;
    const current = panel();
    const opener = trigger();
    if (!current || current.contains(event.target) || opener?.contains(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    close();
  }, true);
}
