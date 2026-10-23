// Mobilní hlavička (pod 768 px, styly components/_mobile-header.scss). Hlavička Disca je pevná
// nahoře. Dokud je vidět informační lišta, stojí hlavička pod ní (--as-header-offset). Po odjetí
// lišty se zkompaktní (.as-header-compact: lupa místo pole hledání) a při posunu dolů se schová
// (.as-header-hidden), při posunu nahoru se vrátí. Obsah stránky drží místo celé hlavičky
// (--as-info-height + --as-mobile-header-height), takže se při přepnutí neposouvá.

const MOBILE = '(max-width: 767px)';
const COMPACT = 'as-header-compact';
const HIDDEN = 'as-header-hidden';
// Drobné posuny (setrvačnost prstu) hlavičku nepřepínají.
const TOLERANCE = 4;

export function enhanceMobileHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const root = document.documentElement;
  const media = window.matchMedia(MOBILE);
  const info = document.querySelector('.overall-wrapper > .site-msg.information');
  let infoHeight = 0;
  let lastY = window.scrollY;
  let frame = 0;

  const measureInfo = () => {
    infoHeight = info?.isConnected && media.matches ? info.getBoundingClientRect().height : 0;
    root.style.setProperty('--as-info-height', `${infoHeight}px`);
  };

  const update = () => {
    frame = 0;
    if (!media.matches) {
      root.classList.remove(COMPACT, HIDDEN);
      root.style.removeProperty('--as-header-offset');
      return;
    }
    const y = Math.max(0, window.scrollY);
    root.style.setProperty('--as-header-offset', `${Math.max(0, infoHeight - y)}px`);
    root.classList.toggle(COMPACT, y > infoHeight);
    if (Math.abs(y - lastY) < TOLERANCE) return;
    root.classList.toggle(HIDDEN, y > lastY && y > infoHeight + header.offsetHeight);
    lastY = y;
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  if (info) {
    // Zavření lišty (Disco ji skryje) i změna její výšky při otočení telefonu.
    new ResizeObserver(() => { measureInfo(); schedule(); }).observe(info);
    info.querySelector('.js-close-information-msg')?.addEventListener('click', () => {
      setTimeout(() => { measureInfo(); schedule(); });
    });
  }
  media.addEventListener('change', () => { measureInfo(); schedule(); });
  window.addEventListener('scroll', schedule, { passive: true });
  measureInfo();
  update();
}
