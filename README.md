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

## Vývoj

Požadavky: Node.js 18+.

```bash
npm install
npm run build   # sestaví theme/dist
npm run dev     # sleduje změny v theme/src
```
