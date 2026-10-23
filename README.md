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

## Jak to do sebe zapadá

```
Obchodník v adminu Shoptetu
  └─ „Přejít na nastavení doplňku“ → settings-app (OAuth ověření e-shopu)
       └─ uloží volby do vlastní DB
       └─ přes API /template-include vloží do e-shopu:
            <script>window.asteroidConfig = { header: "v2", … }</script>
            + odkaz na CSS/JS z theme/dist

E-shop (HTML Disco)
  └─ theme JS přečte window.asteroidConfig → nastaví třídy na <body>
  └─ theme CSS podle tříd zobrazí zvolenou variantu
```

## Konfigurace šablony

Settings-app vkládá do e-shopu `window.asteroidConfig`. Všechny klíče jsou volitelné:

```js
window.asteroidConfig = {
  header: 'v1',                 // varianta hlavičky: 'v1' | 'v2' | 'v3'
  banners: 'default',           // bannery na úvodu: 'default' | 'content' | 'fullwidth' | 'cards'
  categoryLayout: 'default',    // layout kategorie
  phone: {                      // otevírací doba za telefonem v horní liště;
    hours: 'po–pá: 9:00–17:00', // číslo se bere z kontaktních údajů v nastavení e-shopu
  },
  quickLinks: [                 // řádek rychlých odkazů pod hlavičkou
    { label: 'Novinky', url: '/novinky/', icon: 'local-fire-department' },
  ],
  navLinks: [                   // v2: odkazy vedle „Katalogu produktů“
    { label: 'Kontakt', url: '/kontakty/' },
  ],
  productCard: 'default',       // vzhled karet produktů (zatím jen 'default', třída .as-product-card-*)
  productColumns: 6,            // produkty vedle sebe v sekcích úvodní stránky: 4 | 5 | 6 (bez hodnoty podle Shoptetu)
  homeCategories: {             // kategorie na úvodní stránce (víc než 6 = carousel);
    title: 'Tohle u nás zrovna frčí', // název, odkaz a obrázek převezme settings-app z API při uložení
    items: [
      { guid: '…', name: 'Šperky', url: '/sperky/', image: '/user/categories/thumb/sperky.jpg' },
    ],
  },
};
```

Ikony (`icon`) odpovídají souborům v [`theme/src/icons`](theme/src/icons/).

Náhled jiné varianty bez změny nastavení: přidejte k adrese e-shopu `?asteroid-header=v2`, `?asteroid-banners=cards` nebo `?asteroid-columns=6`.

Bannery na úvodní stránce podle názvu (`js/homepage-banners.js`): doplňkové bannery s pozicí Zápatí (Shoptet jich pošle libovolný počet, Střed nejvýš dva) umístí konec interního názvu. `[1]`, `[2]` … = mozaika pod prvním pásem produktů, `[L]` / `[P]` / `[R]` = vedle produktové sekce se stejným nadpisem, bez značky = zůstane v zápatí. Přihlášený admin vidí na e-shopu štítek, kam banner patří.

## Vývoj

Požadavky: Node.js 18+.

```bash
npm install
npm run build   # sestaví theme/dist
npm run dev     # sleduje změny v theme/src
npm run deploy  # sestaví a nahraje theme/dist na SFTP testovacího e-shopu, pak zapíše do e-shopů kód s novou verzí
```

`npm run deploy` čte přístupy z `.env` v kořeni repozitáře (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`) a nahrává do složky `asteroid/`, tedy na `https://313980.myshoptet.com/user/documents/asteroid/`. Soubor `.env` se necommituje.

Verze v adrese souborů (`asteroid.css?v=…`) je otisk jejich obsahu. Shoptet soubory posílá s mezipamětí na rok, prohlížeč je tak stáhne jen jednou po každém nasazení. Po nahrání proto `deploy` přes API zapíše do všech e-shopů v `settings-app/data` kód s novou verzí (`npm run publish-snippets -w settings-app`). Bez toho by e-shopy načítaly starou verzi z mezipaměti.
