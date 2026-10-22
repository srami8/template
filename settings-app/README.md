# settings-app

Stránka nastavení doplňku aSteroid. Zatím jen plán, kód přijde v dalším kroku.

## Odpovědnosti

1. **Ověření e-shopu přes OAuth.** Shoptet otevře „Addon settings url“ (s `#SHOP_ID#`) a my ověříme, že jde o admina daného e-shopu.
2. **Formulář nastavení.** Varianta hlavičky (`v1` / `v2` / `v3`), layout kategorie (globálně i pro jednotlivé kategorie), rychlé odkazy pod hlavičkou a další volby.
3. **Uložení do vlastní DB.** Shoptet nastavení doplňků neukládá.
4. **Propsání do e-shopu.** Přes Shoptet API `template-include` vloží:
   - `<script>window.asteroidConfig = {…}</script>`
   - odkazy na `asteroid.css` a `asteroid.js` z `theme/dist` (hostované na CDN)

## Otevřené otázky

- Hosting a databáze (Vercel + Postgres, Railway, vlastní server…)
- Doména pro settings-app a CDN pro theme
