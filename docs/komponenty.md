# Komponenty: prvky Disca a kde se vypisují

Prvek Disca má na všech stránkách stejné třídy. Jeho **vzhled** proto patří do jedné globální komponenty. Místo použití (karta, detail, okno košíku …) řeší jen **umístění a rozložení**. Před úpravou prvku projdi všechna místa ze sloupce „Kde se vypisuje“ a ověř je snímky `npm run snapshots` (před a po nasazení).

| Prvek | Markup Disca | Kde se vypisuje | Vzhled (jediný zdroj) | Umístění |
|---|---|---|---|---|
| Štítky produktu | `.flags(-default) .flag` | karta ve výpisech, detail (přes fotku), další výpisy | `tools/_flag.scss` `label`, globálně `components/_product-elements.scss` | karta `product-cards/_default.scss`, detail `_product-elements.scss` |
| Sleva v kolečku | karta: `.price-save` („(–31 %)“, text bez závorek v `data-as-discount`), detail: `.flags-extra .flag-discount` | karta, detail | `tools/_flag.scss` `discount($size)` | karta 48 px přes roh obrázku, detail 72 px vpravo dole přes fotku |
| Hvězdičky hodnocení | `.stars .star.star-on / .star-off` | karta, detail, hodnocení | `tools/_rating.scss`, globálně `_product-elements.scss` | dle místa |
| Počítadlo množství | `span.quantity > label > input.amount + .increase + .decrease` | karta, detail, okno košíku, stránka košíku | `tools/_quantity.scss` `stepper`, globálně `_product-elements.scss` | karta, okno košíku (rozložení řádku) |
| Tlačítka | `.btn` (`btn-conversion`, `btn-primary`, `btn-default`) | karta, detail, košík, přihlášení, našeptávač, bannery | `tools/_button.scss` (varianty `secondary`, `conversion`, `conversion-outline`, `light`) | variantu volí místo podle návrhu |
| Ikony | písmo `shoptet` v `::before` | hlavička, menu, hledání | `tools/_icon.scss` (maska), glyf mimo breakpointy | velikost v breakpointech |
| Pole formuláře | `.smart-label-wrapper .form-control-wrapper input` | přihlášení (okno i `/login/`), další formuláře | `components/_login.scss` | — |

**Zatím bez návrhu (vzhled Disca):**
- tlačítko „Do košíku“ a cena na detailu produktu,
- další formuláře (newsletter, objednávka),
- ostatní kolečka `.flags-extra` (doprava zdarma).
