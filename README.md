# aSteroid – šablona pro Shoptet

Designová šablona pro Shoptet postavená nad šablonou **Disco**, prodávaná jako doplněk na [Shoptet marketplace](https://doplnky.shoptet.cz/).

Návrh: [Figma – aSteroid](https://www.figma.com/design/jpEXMp36OXxRJqE0ortBfB/aSteroid)

Zadání a principy vývoje (barvy a fonty z administrace, obsah z administrace, postup): [docs/zadani.md](docs/zadani.md)

## Struktura

Pokyny pro vývoj a spolupráci: [AGENTS.md](AGENTS.md).
Responzivní chování a jeho ověřování: [docs/responzivita.md](docs/responzivita.md).

| Složka | Co obsahuje |
|---|---|
| [`theme/`](theme/) | SCSS a JS šablony, které se vkládají do e-shopu nad HTML šablony Disco. Varianty hlavičky, layouty kategorie, komponenty. |
| [`settings-app/`](settings-app/) | Stránka nastavení doplňku. Obchodník si v ní vybírá variantu hlavičky, layout kategorie atd. Konfiguraci propisuje do e-shopu přes Shoptet API. |

## Dokumentace

- **Pro vývoj:** [docs/vyvoj.md](docs/vyvoj.md) – architektura, konfigurace `window.asteroidConfig`, varianty, moduly, chování po AJAXu, testy, nasazení, provoz.
- **Pro obchodníka:** příručka „aSteroid – příručka pro obchodníka“ (Claude Docs): https://claude.ai/artifact/X9RrPxJnCkjFkufZZ6FMjz
- Pravidla práce: [AGENTS.md](AGENTS.md), deník změn: [HANDOFF.md](HANDOFF.md).

V kostce: obchodník v administraci Shoptetu otevře nastavení doplňku (settings-app), to přes API `template-include` vloží do e-shopu `window.asteroidConfig`, odkazy na CSS/JS z `theme/dist` a proměnné CSS. Skript šablony podle konfigurace nastaví třídy variant na `<html>` a CSS zobrazí zvolený vzhled nad HTML šablony Disco.

## Vývoj

Požadavky: Node.js 18+.

```bash
npm install
npm run build   # sestaví theme/dist
npm run dev     # sleduje změny v theme/src
npm run deploy  # sestaví a nahraje theme/dist na SFTP testovacího e-shopu, pak zapíše do e-shopů kód s novou verzí
```

`npm run deploy` čte přístupy z `.env` v kořeni repozitáře (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`) a nahrává do složky `asteroid/`, tedy na `https://313980.myshoptet.com/user/documents/asteroid/`. Soubor `.env` se necommituje.

Styly jsou rozdělené na základ `asteroid.css` a soubory variant (`header-v2.css`, `banners-cards.css`, `product-card-default.css` …, zdroje v `theme/src/scss/variants`). Vkládaný kód načte základ a jen soubory zvolených variant (`theme/src/js/styles.mjs`). Při náhledu jiné varianty přes parametr adresy dočte chybějící soubor šablona sama. Verze v adrese souborů (`asteroid.css?v=…`) je otisk obsahu každého souboru zvlášť. Shoptet soubory posílá s mezipamětí na rok, prohlížeč je tak stáhne jen jednou po každém nasazení. Po nahrání proto `deploy` přes API zapíše do všech e-shopů v `settings-app/data` kód s novou verzí (`npm run publish-snippets -w settings-app`). Bez toho by e-shopy načítaly starou verzi z mezipaměti.
