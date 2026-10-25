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
| Rozbalovací nabídka | desktop `.top-navigation-tools .dropdown-menu`, mobil `#navigation .navigationActions .menu-level-2` (měna, jazyk) | horní lišta (desktop), mobilní menu | `tools/_dropdown.scss` `panel` | desktop pod tlačítkem v liště, mobil pod položkou v horním řádku menu |
| Horní část kategorie | `.category-top > h1.category-title + .category-perex` | kategorie (i podkategorie, značky mají vlastní šablonu) | `components/_category.scss` | popis max. 820 px; vedle něj místo pro blok článků (od 992 px) |
| Podkategorie | `ul.subcategories.with-image > li > a > span.image + span.text` | jen stránka kategorie | `components/_category.scss` | mřížka tlačítek 72 px (min. 240 px), na telefonu pod sebou |
| Nejprodávanější | `.products-top-wrapper > h2.products-top-header + #productsTop.products-inline > .product > .p` (bez tlačítek, pod ním „Zobrazit více“) | jen stránka kategorie | `components/_category.scss` (karta na šířku), `js/category.js` (posuvný pás, šipky třídami slideru Shoptetu, tlačítko Detail) | 3 / 2 karty vedle sebe, telefon 88 % s kouskem další |
| Články ke kategorii | vlastní `nav.as-category-articles` v `.category-top` (data ze settings-app, docs/clanky-ke-kategoriim.md) | jen stránka kategorie | `components/_category.scss`, `js/category-articles.js` | od 992 px vpravo vedle popisu za čarou, jinak pod popisem před podkategoriemi |
| Vzhled popisu kategorie | `.category-top > .category-perex` (první `img` v popisu z administrace) → `figure.as-category-intro__media` | jen stránka kategorie | základ `components/_category.scss`, varianty `scss/variants/category-{background,image,image-wide}.scss`, společné `tools/_category-intro.scss`, přesun obrázku `js/category-intro.js` | jedna volba pro všechny kategorie (`categoryLayout`, barva na pozadí `categoryTint` + vlastní barva `--as-category-tint`, na tmavé bílý text `.as-category-tint-dark`); bez obrázku výchozí rozložení (se zapnutou barvou na pozadí v barevném pruhu); od 992 px vedle sebe, užší obrázek nahoře |
| Úvodní text | `.welcome-wrapper.container-narrow > .welcome` (obsah z administrace, sloupce Bootstrapu `.col-sm-6`) | úvodní stránka | `layout/_homepage.scss` | přes celou šířku obsahu (Disco max. 1178 px), text sloupců lícuje s nadpisy sekcí |
| Hodnocení obchodu | vlastní `section.as-shop-reviews` před `footer#footer`; data ze stránky hodnocení (`.rate-average`, `.stars-label`, `#ratingsList .vote-wrap`), hvězdičky markupem Shoptetu `.stars .star-on/.star-off` | všechny stránky kromě košíku, objednávky a stránky hodnocení | `components/_shop-reviews.scss` (hvězdičky `tools/_rating.scss`), `js/shop-reviews.js` | od 992 px 4 recenze vedle sebe, 768–991 px 2, telefon posuvný pás; lícuje s obsahem |
| Karta článku | úvodní stránka `.homepage-blog-wrapper .news-item > a > .image + .text > .title, .description, .read-article`; rubrika `.news-wrapper article.news-item > a.news-item-link-img + h2 > a + time + .description` | úvodní stránka (sekce článků), výpis rubriky blogu | `components/_article-card.scss` | mřížka: telefon 1 sloupec, od 768 px 2, od 1200 px 3; sekce na úvodní stránce přes šířku obsahu; „Číst článek“ skryté |
| Ikony | písmo `shoptet` v `::before` | hlavička, menu, hledání | `tools/_icon.scss` (maska), glyf mimo breakpointy | velikost v breakpointech |
| Pole formuláře | `.smart-label-wrapper .form-control-wrapper input` | přihlášení (okno i `/login/`), další formuláře | `components/_login.scss` | — |

**Zatím bez návrhu (vzhled Disca):**
- cena na detailu produktu,
- další formuláře (newsletter, objednávka),
- ostatní kolečka `.flags-extra` (doprava zdarma).

Barvy vždy z administrace e-shopu (tokeny `--as-primary-*`, `--as-conversion` z proměnných Shoptetu), nikdy pevně z Figmy.

## Kontrola stejného vzhledu

`npm run audit` porovná u každé komponenty na skutečném e-shopu vizuální vlastnosti na 1920 a 390 px (barvy, písmo, tloušťka, zaoblení, rámečky, podtržení, zarovnání, ikony). Rozložení (šířky, odsazení řádků, pozice) neporovnává. Novou komponentu přidej do seznamu v `tests/shop/audit.cjs`.
