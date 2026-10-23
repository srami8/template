// Rozměry viewportu pro prvky, které přesahují obsah (banner) nebo plovou pod hlavičkou.
// clientWidth nezahrnuje scrollbar; 100vw by u fullwidth banneru rozšířilo stránku o jeho šířku.
export function trackViewportWidth() {
  const root = document.documentElement;
  let previous;
  const update = () => {
    // Disco rezervuje i stabilní gutter scrollbarů; clientWidth ho v Chromiu může zahrnovat.
    const width = Math.min(root.clientWidth, root.getBoundingClientRect().width);
    if (width === previous) return;
    previous = width;
    root.style.setProperty('--as-viewport-width', `${width}px`);
  };
  update();
  new ResizeObserver(update).observe(root);
}

// visualViewport reaguje i na klávesnici telefonu; top je v souřadnicích getBoundingClientRect().
export function availableViewportHeight(top, gap = 16) {
  const viewport = window.visualViewport;
  const bottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
  return Math.max(0, bottom - top - gap);
}
