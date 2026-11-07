// Písmo z administrace v Blank mode. Shoptet ho načítá souborem @font-face (shoptet.config.fonts.google,
// soubor na cdn.myshoptet.com), který Blank mode nestahuje stejně jako ostatní CSS Shoptetu
// (docs/blank-mode.md). Proměnné --template-font jsou v HTML, chyběla by jen samotná písma.
// Když soubor na stránce není, načteme ho podle konfigurace Shoptetu; s CSS Shoptetu se nic nemění.
// Písmo ikon (fonts.custom) nenačítáme, ikony kreslí aSteroid vlastními maskami.

export function loadTemplateFonts() {
  const urls = window.shoptet?.config?.fonts?.google?.urls;
  if (!Array.isArray(urls)) return;
  const loaded = new Set([...document.querySelectorAll('link[rel~="stylesheet"]')].map((link) => link.href));
  urls.filter((url) => typeof url === 'string' && !loaded.has(url)).forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.dataset.asFont = '';
    document.head.append(link);
  });
}
