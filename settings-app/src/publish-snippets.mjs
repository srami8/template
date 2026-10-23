// Po nasazení nových souborů šablony (npm run deploy) zapíše do všech e-shopů kód s novou verzí
// souborů. Bez toho by e-shopy dál načítaly starou adresu a prohlížeče soubory z mezipaměti.
// Nastavení šablony se nemění, bere se uložené u instalace.

import { listInstallations } from './store.mjs';
import { setHeaderSnippet } from './shoptet.mjs';
import { DEFAULT_THEME_CONFIG, assetsVersion, buildHeaderSnippet } from './theme-config.mjs';

let failed = 0;
for (const { eshopId, installation } of listInstallations()) {
  try {
    await setHeaderSnippet(installation, buildHeaderSnippet(installation.themeConfig || DEFAULT_THEME_CONFIG));
    console.log(`kód šablony: e-shop ${eshopId} má verzi ${assetsVersion()}`);
  } catch (error) {
    failed += 1;
    console.error(`kód šablony: e-shop ${eshopId} selhal (${error.message})`);
  }
}
if (failed) process.exit(1);
