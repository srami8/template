// Výchozí velikosti nadpisů H1–H6 v px (Figma Styleguide „Heading“) a povolený rozsah pro nastavení
// šablony. Stejné hodnoty má scss/tokens/_typography.scss ($headings), shodu hlídá test
// tests/responsive/styles.spec.cjs. Obchodník velikosti mění v nastavení šablony, vkládaný kód je
// propíše do proměnných --as-heading-size-hN (na telefonu je CSS zmenší, viz tokeny).

export const HEADING_SIZES = { h1: 36, h2: 28, h3: 24, h4: 20, h5: 18, h6: 16 };
export const HEADING_MIN = 12;
export const HEADING_MAX = 72;

// Jen platné hodnoty, které se liší od výchozích (ty CSS zná samo).
export function headingOverrides(headings = {}) {
  return Object.fromEntries(Object.keys(HEADING_SIZES)
    .map((level) => [level, Math.round(Number(headings?.[level]))])
    .filter(([level, size]) => size >= HEADING_MIN && size <= HEADING_MAX && size !== HEADING_SIZES[level]));
}

// Blok pro vkládaný kód; prázdný řetězec, když obchodník nic nezměnil.
export function headingStyle(headings) {
  const overrides = Object.entries(headingOverrides(headings));
  if (!overrides.length) return '';
  return `<style>:root{${overrides.map(([level, size]) => `--as-heading-size-${level}:${size}px`).join(';')}}</style>`;
}
