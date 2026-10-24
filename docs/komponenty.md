# Komponenty: prvky Disca a kde se vypisují

Prvek Disca má na všech stránkách stejné třídy. Jeho **vzhled** proto patří do jedné globální komponenty. Místo použití (karta, detail, okno košíku …) řeší jen **umístění a rozložení**. Před úpravou prvku projdi všechna místa ze sloupce „Kde se vypisuje“ a ověř je snímky `npm run snapshots` (před a po nasazení).

| Prvek | Markup Disca | Kde se vypisuje | Vzhled (jediný zdroj) | Umístění |
|---|---|---|---|---|
| Štítky produktu | `.flags(-default) .flag` | karta ve výpisech, detail (přes fotku), další výpisy | `tools/_flag.scss` `label`, globálně `components/_product-elements.scss` | karta `product-cards/_default.scss`, detail `_product-elements.scss` |
| Sleva v kolečku | karta: `.price-save` („(–31 %)“, text bez závorek v `data-as-discount`), detail: `.flags-extra .flag-discount` | karta, detail | `tools/_flag.scss` `discount($size)` | karta 48 px přes roh obrázku, detail 72 px vpravo dole přes fotku |
| Hvězdičky hodnocení | `.stars .star.star-on / .star-off` | karta, detail, hodnocení | `tools/_rating.scss`, globálně `_product-elements.scss` | dle místa |
| Počítadlo množství | `span.quantity > label > input.amount + .increase + .decrease` | karta, detail, okno košíku, stránka košíku | `tools/_quantity.scss` `stepper`, globálně `_product-elements.scss` | karta, okno košíku (rozložení řádku) |
| Tlačítka | `.btn` (`btn-conversion`, `btn-primary`, `btn-secondary`, `btn-default`), `.sortingToggle`, `.toggle-top-prod`, cookie lišta, sociální přihlášení | karta, detail, košík, přihlášení, našeptávač, bannery, výpis kategorie, úvodní text | tvar (pilulka) a `btn-conversion` (konverzní barva z administrace, bílý text) globálně `components/_buttons.scss`; barvy a velikost `tools/_button.scss` (`secondary`, `conversion`, `conversion-outline`, `light`) | variantu volí místo podle návrhu; výjimka „Katalog produktů“ (v2, hranaté podle návrhu) |
| Nadpisy H1–H6 | `h1`–`h6` a třídy `.h1`–`.h6` (název produktu a kategorie `h1`/`.h1`, nadpis košíku `.h1`, sekce úvodní stránky `.h4`, patička `h2`/`h3`, hledání `h4` …) | všechny stránky | `components/_headings.scss` z tokenů `--as-font-size-hN` = `--as-heading-size-hN` (výchozí `theme/src/js/typography.mjs` = Figma, mění nastavení šablony) × `--as-heading-scale-hN` (telefon: H1 0,78, H2 0,86, H3 0,84) | místa s vlastním návrhem přebíjí velikost tokenem jiné úrovně (sekce úvodní stránky H2, okno přihlášení H3) |
| Drobečková navigace | `.breadcrumbs > span#navigation-first` (Domů), `span#navigation-N`, poslední `[data-testid="breadcrumbsLastLevel"]`, oddělovač `.navigation-bullet` | kategorie, detail, stránky, hledání, přihlášení, články (ne úvodní stránka a košík) | `components/_breadcrumbs.scss` | pruh přes celou šířku okna, obsah lícuje s hlavním kontejnerem i na úzkých stránkách; telefon jen poslední odkaz |
| Ikony | písmo `shoptet` v `::before` | hlavička, menu, hledání | `tools/_icon.scss` (maska), glyf mimo breakpointy | velikost v breakpointech |
| Pole formuláře | `.smart-label-wrapper .form-control-wrapper input` | přihlášení (okno i `/login/`), další formuláře | `components/_login.scss` | — |

**Zatím bez návrhu (vzhled Disca):**
- cena na detailu produktu,
- další formuláře (newsletter, objednávka),
- ostatní kolečka `.flags-extra` (doprava zdarma).

Barvy vždy z administrace e-shopu (tokeny `--as-primary-*`, `--as-conversion` z proměnných Shoptetu), nikdy pevně z Figmy.
