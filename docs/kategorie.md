# Kategorie: sidebar, filtry, řazení a stránkování

Návrh: [Figma 1631:7129](https://www.figma.com/design/jpEXMp36OXxRJqE0ortBfB/aSteroid?node-id=1631-7129), řazení v sousední vrstvě 1631:6967. Využívá se skutečné HTML Disca, bez náhrady jeho řazení nebo AJAX filtrování. Produkty, obrázky, ceny, počty a dostupné volby řazení pocházejí z e-shopu. Font a hlavní barva se řídí administrací; nenastavuje se napevno Rubik ani modrá z návrhu.

## Pro obchodníka

Vzhled kategorie se používá automaticky. Horní popis, podkategorie a nejprodávanější zůstávají přes šířku obsahu. Na desktopu je pod nimi levý sloupec a produktový výpis; prázdný sloupec nerezervuje místo. Ostatní vložené prvky sidebaru (např. Kategorie nebo Top 10) zůstávají podle administrace.

Filtry se nastavují v Shoptetu: prvek **Filtry** v **Vzhled a obsah → Šablony → Prvky** a jeho obsah v **Nastavení → Produkty → Parametrické filtry**. Samotný prvek Kategorie filtry nenahrazuje. U parametrů musí být nastavené přiřazení ke kategorii a hodnoty na produktech. Pokud server filtr nevypíše, aSteroid ho nevymýšlí z názvů produktů. Při této integraci se zpočátku vracel jen prázdný blok kategorií; po změně nastavení se začaly vypisovat cena a příznaky.

Sekce filtrů lze sbalit jejich nadpisem. Na telefonu se celé filtry otevírají tlačítkem **Filtry**, řazení zůstává rozbalovací. Na desktopu je řazení řádkem záložek. V nabídce jsou skutečné možnosti Shoptetu (testovací e-shop má např. Abecedně, nikoli Nejnovější z návrhu). Text „Načíst další“ a počet určuje Shoptet podle zbývajících položek, nikoli pevné číslo z Figmy.

## Implementace

- `components/_category-listing.scss`: grid stránky a výpisu, řazení a spodní ovládání. Sidebar 262 px + mezera 22 px v existujícím kontejneru. Výpis 2 / 3 / 4 sloupce podle dostupné šířky. Varianty karet a horní části kategorie dál zůstávají v dosavadních souborech; nekopírují se.
- `components/_category-filters.scss`: karty filtrů s rámečkem, zaoblením 12 px a mezerou 14 px, počty v pilulkách, původní cenový slider. Flex `order` řadí štítky, cenu a parametry, bez přesunu formulářů v DOM. Pravidla platí i po nativním přesunu filtrů na mobil.
- `tools/_button.scss`: neutrální `tertiary` + velikost `listing` 48 px; používají je řazení, tlačítko Filtry i stránkování. Stávající velikosti a varianty se nemění.
- `tools/_checkbox.scss`: sdílený mixin vzhledu původní dvojice input + label (22 px, rádius 6 px, check 16 px). Použitý na filtry; jiné dosud nepřeváděné formuláře touto změnou nepřestylováváme.
- `js/category-filters.js`, volaný z `category.js`: doplní chybějící nadpis štítků, název ceny, tlačítka sbalení s aria-expanded/controls a mobilní tlačítko přes nativní `data-unveil="filters"`. Tlačítko nemá vlastní náhradní obsluhu filtru, jeho přepnutí provádí Shoptet. Stav panelu a sbalených sekcí se zachovává při `ShoptetDOMPageContentLoaded`, opakovaná inicializace neduplikuje tlačítka. Původní vstupy, formuláře a posuvník se nepřesouvají ani nenahrazují. Jejich přesun mezi sidebar a `#filters-wrapper` zajišťuje původní `detectFilters()` Shoptetu.
- Nové ikony `check.svg` a `expand-less.svg` pocházejí z poskytnutých vrstev Figmy, existující expand-more/chevron-right se znovu používají. SVG se sestavují do současného systému masek; nejsou přítomné dočasné URL Figmy v runtime.

Původní rozhraní: `.sidebar`, `.sidebar-inner.sidebar-filters-wrapper`, `.box-filters`, `#filters`, `.filter-section-boolean`, `.param-filter-top`, `input[data-url] + .filter-label .filter-count`, `#slider .ui-slider-handle`, `#price-filter-form`, `#category-header`, `.listSorting__control[data-sort][data-url]`, `.loadMore__button`, `.pagination__link`, `.goToTop__button`.

Vlastní doplňky jsou pouze stavové atributy, tlačítka sbalení a mobilní spouštěč, který v testovaném markupu chyběl. Žádná náhradní data kategorií, parametrů, cen nebo řazení. Globální checkboxy jiných částí e-shopu ani checkout nejsou tímto celkem migrované.

## Ověření

Build, kontrola integrity kompatibilního základu a testy settings-app/registrace stylů. Nové regresní kontroly `category-listing.spec.cjs`: geometrie sidebaru a ovládání, prázdný sidebar, breakpointy, zachování sbalení po náhradě HTML a opakované inicializaci. Fixture filtrů je veřejné HTML testovacího Disca. Jejich browserový běh zde blokuje start Chromia v sandboxu (MachPortRendezvous / permission denied); nepovažovat je za prošlé. Přímá integrační kontrola místo toho proběhla v in-app prohlížeči.

V lokálním náhledu skutečného e-shopu bez nativních main/font CSS ověřeno: stock 13 → 11 položek, cenový posuvník klávesnicí 300 → 301 Kč (13 → 12 položek), nativní řazení, stránka 2 se 4 produkty, dočtení 9 → 13 produktů a odstranění tlačítka Načíst další na konci. Mobilní Filtry se otevírají/zavírají nativní obsluhou a aria stav odpovídá. Sbalená cena přežije AJAX; nejsou duplicitní ovladače. Šířky 320, 390, 767, 768, 991, 992, 1199, 1200 a 1920 px bez horizontálního přetékání, se správným přesunem filtrů na mobil. Společné styly spodních tlačítek se při 1920/390 shodují (včetně výšky 48 px). Při porovnání se zapnutým a odstraněným nativním CSS se shodovalo všech 24 měřených prvků při obou šířkách.

Do auditu a snímků přidané ovládání výpisu a kategorie Pletené košíky. Vizuální důkazy jsou v pracovních výstupech Codexu (`outputs/category-filters-*`, `category-listing-*`).

Náhled `npm run preview:blank` navíc přeposílá prázdný nativní POST pro dočtení produktů **jen** na stránky kategorií Pletené košíky a Šperky s hlavičkou Shoptetu. Objednávkové/košíkové formuláře zůstávají nepovolené. HTML fragmenty bez hlavičky se zachovají, vlastní adresy e-shopu v odkazech a data-url se převádějí na lokální cestu, aby AJAX neopustil náhled.

Další parametrické skupiny, barevné/obrázkové volby a dlouhý seznam se „Zobrazit vše“ v testovací kategorii zatím nejsou. Jejich skutečnou integraci je nutné ověřit po vyplnění dat; kontrola ceny a příznaků nenahrazuje ověření těchto typů. Kompatibilní snapshot Disca se v tomto celku neprořezává a úplná migrace CSS tím není dokončená.
