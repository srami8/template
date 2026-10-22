# aSteroid – šablona pro Shoptet

Designová šablona pro Shoptet postavená nad šablonou **Disco**, prodávaná jako doplněk na [Shoptet marketplace](https://doplnky.shoptet.cz/).

Návrh: [Figma – aSteroid](https://www.figma.com/design/jpEXMp36OXxRJqE0ortBfB/aSteroid)

## Struktura

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
  categoryLayout: 'default',    // layout kategorie
  phone: {                      // telefon v horní liště
    number: '+420 777 888 998',
    hours: 'po–pá: 9:00–17:00',
  },
  quickLinks: [                 // řádek rychlých odkazů pod hlavičkou
    { label: 'Novinky', url: '/novinky/', icon: 'local-fire-department' },
  ],
};
```

Ikony (`icon`) odpovídají souborům v [`theme/src/icons`](theme/src/icons/).

## Vývoj

Požadavky: Node.js 18+.

```bash
npm install
npm run build   # sestaví theme/dist
npm run dev     # sleduje změny v theme/src
```
