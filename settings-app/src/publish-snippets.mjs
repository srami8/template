// Po nasazení nových souborů šablony (npm run deploy) zapíše do všech e-shopů kód s novou verzí
// souborů. Bez toho by e-shopy dál načítaly starou adresu a prohlížeče soubory z mezipaměti.
// Nastavení šablony se nemění, bere se uložené u instalace (i s adresou článků ke kategoriím).

import { listInstallations } from './store.mjs';
import { setHeaderSnippet } from './shoptet.mjs';
import { assetsVersion, buildHeaderSnippet, snippetConfig } from './theme-config.mjs';

let failed = 0;
for (const { eshopId, installation } of listInstallations()) {
  try {
    await setHeaderSnippet(installation, buildHeaderSnippet(snippetConfig(installation)));
    console.log(`kód šablony: e-shop ${eshopId}, základ ${assetsVersion()}`);
  } catch (error) {
    failed += 1;
    console.error(`kód šablony: e-shop ${eshopId} selhal (${error.message})`);
  }
}
if (failed) process.exit(1);
