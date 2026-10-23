# aSteroid – šablona pro Shoptet

Designová šablona pro Shoptet postavená nad šablonou **Disco**, prodávaná jako doplněk na [Shoptet marketplace](https://doplnky.shoptet.cz/).

Návrh: [Figma – aSteroid](https://www.figma.com/design/jpEXMp36OXxRJqE0ortBfB/aSteroid)

Zadání a principy vývoje (barvy a fonty z administrace, obsah z administrace, postup): [docs/zadani.md](docs/zadani.md)

## Struktura

Pokyny pro vývoj a spolupráci: [AGENTS.md](AGENTS.md).

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
};
```

Ikony (`icon`) odpovídají souborům v [`theme/src/icons`](theme/src/icons/).

Náhled jiné varianty bez změny nastavení: přidejte k adrese e-shopu `?asteroid-header=v2` nebo `?asteroid-banners=cards`.

## Vývoj

Požadavky: Node.js 18+.

```bash
npm install
npm run build   # sestaví theme/dist
npm run dev     # sleduje změny v theme/src
npm run deploy  # sestaví a nahraje theme/dist na SFTP testovacího e-shopu
```

`npm run deploy` čte přístupy z `.env` v kořeni repozitáře (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`) a nahrává do složky `asteroid/`, tedy na `https://313980.myshoptet.com/user/documents/asteroid/`. Soubor `.env` se necommituje.
