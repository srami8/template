# Blank mode: jen styly aSteroidu

**Rozhodnutí majitele (29. 10. 2026):** Blank mode znamená, že obchodník v Shoptetu vypne výchozí CSS a e-shop vypadá **jen podle stylů aSteroidu**. Kopie CSS Disca do vydání nepatří a u obchodníků se nenačítá. HTML šablony zůstává Disco a JavaScript Shoptetu zůstává zapnutý; šablona se nemění na Classic. [Oficiální popis Blank módu Shoptetu](https://developers.shoptet.com/shoptet-tools/editing-templates/blank-template-mode/).

## Stav

- Všichni obchodníci (i testovací e-shop) načítají CSS Shoptetu (Disco) a za ním `asteroid.css` s variantami.
- Volba Blank mode je v nastavení doplňku skrytá, dokud aSteroid sám nepokryje vše, co dnes dodává CSS Disca. Dřívější uložená hodnota `styleMode` se ignoruje (`theme/src/js/styles.mjs` ji nezná).
- Měření 29. 10. 2026: bez CSS Disca se rozpadá 41 ze 48 komponent, drobné rozdíly má 1 (karta produktu na počítači), 6 nejde automaticky nafotit. Žádná komponenta zatím nefunguje beze změny. Po komponentách: [komponenty-stav.md](komponenty-stav.md) (sloupec „Bez CSS Disca“), vizuálně [styleguide Disco × aSteroid](https://claude.ai/artifact/2peuukfUKNGyeUzgfLMKrP) (třetí sloupec).

## Co dnes dodává CSS Disca

Z měření a snímků bez CSS Shoptetu (soubory `main-13.less….css` a `font-shoptet-13.css` z `cdn.myshoptet.com`):

| Oblast | Co se bez Disca stane | Příklad |
| --- | --- | --- |
| Skryté prvky | okna a panely, které Disco skrývá stylem, jsou vidět v toku stránky | přihlašovací formulář v hlavičce, celé mobilní menu jako seznam odkazů, okno hledání, mini-košík |
| Základ stránky | chybí reset, kontejnery, mřížka (`.container`, `.row`, `.col-*`) a pomocné třídy viditelnosti | rozložení kategorie, detailu, patičky a objednávky |
| Písmo ikon | ikony Shoptetu v `::before` (font `shoptet`) zmizí | šipky, lupa, košík tam, kde je nemáme jako vlastní masku |
| Základ komponent | aSteroid u nativních prvků upravuje barvy a stavy, velikost a rozložení bere z Disca | tlačítka (−41 % výšky), pole, tabulky, záložky, hlášky, tooltip |
| Výpisy a detail | mřížka produktů, galerie, záložky detailu, karusel bannerů | detail produktu, bannery, řazení a stránkování |

Funkční chování (JavaScript Shoptetu, formuláře, AJAX) zůstává; rozpadá se jen vzhled.

Blank mode podle [dokumentace Shoptetu](https://developers.shoptet.com/shoptet-tools/editing-templates/blank-template-mode/) nestahuje **žádné CSS Shoptetu**: kromě vzhledu Disca (`main-13.less….css`) a písma ikon (`font-shoptet-13.css`) i soubor `@font-face` písma z administrace (`…/font-face/<písmo>.css`). Proměnné `--template-font`, `--color-*` a konfigurace `shoptet.config.fonts` jsou v HTML a zůstávají. Písmo z administrace v Blank mode dočítá `js/template-fonts.js` podle `shoptet.config.fonts.google.urls` (s CSS Shoptetu je soubor na stránce a skript nic nedělá). Cizí CSS e-shopu (jiné doplňky) zůstává.

## Základ ve vrstvě `as-foundation`

Co Disco dodává jako základ stránky (reset, `body`, odkazy, mřížka `.container`/`.row`/`.col-*`, kostra obsahu, pomocné třídy viditelnosti, zavřené a otevřené stavy oken a nabídek), píšeme do `theme/src/scss/foundation/` (`_reset.scss`, `_grid.scss`, `_visibility.scss`). Všechno je ve vrstvě `@layer as-foundation`: pravidla bez vrstvy mají vždy přednost, takže **s CSS Disca platí Disco** (obchodníci nevidí změnu) a komponenty aSteroidu přebíjí základ i v Blank mode. Pravidla:

- zrcadlit pravidla Disca jen pro prvky a třídy, které e-shop používá (stejné selektory a vlastnosti, výsledné hodnoty Disca), nekopírovat celé bloky;
- nepřidávat vlastnost, kterou Disco danému prvku nenastavuje – ta by se projevila i s Discem;
- žádné `!important` (ve vrstvě by naopak vyhrálo nad Discem);
- proměnné, které definuje jen `:root` Disca a aSteroid je používá, definovat v `:root` ve vrstvě.

Kontrola, že základ s CSS Disca nic nemění: `npm run build && npm run foundation:noop`. Na 14 stránkách, v košíku s testovacím produktem a v obou krocích objednávky (jen headless prohlížeč, nic se nevyplňuje a košík se vyprázdní) × 1440/1024/768/390 px změří všechny vypočítané vlastnosti a polohu všech prvků (`html`, `body`, svg, `::before`, `::after`, `::marker`, `::placeholder`) s vrstvou, bez ní a znovu s ní ve stejném DOM, ve výchozím stavu i s otevřenými okny, menu a nabídkami (třídy z JS Shoptetu). Musí vyjít 0 rozdílů. Měření, u kterého se stránka mezitím změnila, skončí chybou. Na konci skript vypíše selektory vrstvy, které na žádné měřené stránce nenašly prvek: pro ty kontrola nic nedokládá, takže je musí pokrýt jejich zrcadlení přesně podle Disca. Nepokrývá ani vynucené `:hover`/`:focus` a stavy, které třídy z JS nevyvolají (ty ověřila jednorázová kontrola 4. 11. 2026). Pravidla s pseudo-třídami proto zrcadlit přesně podle Disca, včetně seskupení selektorů: prohlížeč, který nějaký selektor nezná (např. `:has` ve Firefoxu ESR 115), zahodí celé pravidlo Disca a samostatně oddělená část základu by se pak projevila i s Discem.

**Pozor na obrácené pořadí.** Pravidlo aSteroidu, které dnes prohrává s pravidlem Disca s vyšší specificitou (typicky `#content p`), v Blank mode nad jeho zrcadlem ve vrstvě vyhraje, protože pravidlo bez vrstvy má přednost vždy. Bez Disca pak vypadá jinak než s ním, a `foundation:noop` to nevidí, protože měří jen se zapnutým Discem. Známá místa: `.description p` v `components/_article-card.scss` a `.category-perex p` v `components/_category.scss` proti `#content p` (22 px); způsob vyrovnání čeká na rozhodnutí majitele. Rozdíl odhalí až porovnání bez Disca (`npm run blank:measure`).

## Postup převodu

Cíl: e-shop s vypnutým CSS Shoptetu vypadá a funguje stejně jako dnes, na mobilu i počítači. Nejde o redesign.

1. Zachytit referenci (dnešní vzhled s CSS Disca): snímky, rozměry, typografii, stavy. Najít všechna místa, kde Shoptet komponentu vykresluje, včetně AJAX obsahu.
2. Zjistit, co komponentě dodává CSS Disca (reset, rozložení, viditelnost, breakpointy, ikony, stavy). Referencí je kopie `theme/src/vendor/disco/main.css` (snapshot Disca 13 z 25. 10. 2026).
3. Doplnit chybějící pravidla do struktury `theme/src/scss/` (tokeny, tools, layout, components). Nekopírovat pravidla Disca naslepo; jedna globální komponenta, varianty ve vlastních souborech.
4. Ověřit v náhledu bez CSS Shoptetu (`npm run preview:blank`, port 8793) a měřením `npm run blank:measure` (build, focení komponent styleguidu s CSS Disca a bez něj z místního buildu, porovnání do `test-results/styleguide-local/img/blank-diff.json`), s CSS Disca kontrolou `npm run foundation:noop`. Komponenta je převedená, když se bez CSS Disca shoduje s referencí; zároveň se nesmí změnit vzhled s CSS Disca, který dnes vidí obchodníci.
5. Zapsat výsledek do [komponenty-stav.md](komponenty-stav.md) a do předání. Každý převod je samostatný commit.

Doporučené pořadí: (1) základ stránky a skryté prvky (popupy, menu, okna), písmo ikon nahradit vlastními maskami; (2) sdílené komponenty (tlačítka, pole, volby, tabulky, hlášky, záložky); (3) hlavička, navigace, hledání, přihlášení a panely; (4) bannery, výpisy, kategorie, detail produktu; (5) košík a objednávka, obsah, patička, méně časté stavy. Nové komponenty od designera se kódují rovnou tak, aby fungovaly i bez CSS Disca.

Hotovo je, až všechny stránky projdou kontrolou s vypnutým CSS Shoptetu a bez kopie Disca. Teprve pak se volba Blank mode zpřístupní obchodníkům (s návodem: nejdřív zvolit v aSteroidu, pak vypnout CSS v Shoptetu; návrat obráceně).

## Kopie CSS Disca ve vývoji

`theme/src/vendor/disco/` obsahuje celé nativní main CSS Disca 13, font-shoptet CSS a oba formáty fontu ikon; manifest zaznamenává původní URL a kontrolní součty. `build-blank-assets.mjs` z něj sestaví `dist/base-blank.css` a fonty. Používá se jen:

- v testech se skutečným HTML (`tests/responsive/fixtures/*.html`), kde zastupuje CSS Shoptetu, které má e-shop načtené;
- jako reference pro převod (krok 2).

Do e-shopu se nenačítá (není v `styles.mjs` ani ve vkládaném kódu) a do vydání přes Addon Repository nepatří. Aktualizace snapshotu je samostatná kontrolovaná změna.

## Měření a styleguide

Nástroje jsou v `tests/shop/styleguide/` (seznam komponent `manifest.cjs`, focení `capture.cjs`, porovnání `diff.cjs`, stránka a přehled `build.cjs`):

- `npm run blank:measure` – build a porovnání aSteroidu s CSS Disca a bez něj (místní build, před nasazením; snímky v `test-results/styleguide-local/img`, odděleně od nasazené verze);
- `npm run styleguide` – snímky Disco × aSteroid × bez CSS Disca z nasazené verze, stránka `test-results/styleguide/index.html` a přehled [komponenty-stav.md](komponenty-stav.md);
- jednotlivě `npm run styleguide:capture -- <režimy> [--local]`, `styleguide:diff`, `styleguide:build`.

Košík a kroky objednávky fotí s testovacím produktem jen v headless prohlížeči a košík na konci vyprázdní.

Jak číst výsledek porovnání: pixel se počítá jako rozdílný od odchylky 8 na kanál, takže se projeví i světlé rámečky a pozadí. „Funguje“ znamená rozdíl do 0,5 % plochy a výšky. Výška je skutečná z focení. Dlouhé komponenty (snímek oříznutý na 1100 px, na telefonu 1500 px) se porovnávají jen v začátku, a proto nikdy nedostanou „Funguje“. Komponenta, která bez CSS Disca zmizí, se počítá jako rozpadlá.

## Náhled

`npm run preview:blank` (Node 20+) spustí dvě lokální adresy nad veřejným HTML testovacího e-shopu: `http://127.0.0.1:8792/` s CSS Shoptetu a místním buildem aSteroidu, `http://127.0.0.1:8793/` bez jakéhokoli CSS Shoptetu (jako skutečný Blank mode) a jen se styly aSteroidu. Náhled zachovává JavaScript Shoptetu, písmo z administrace i ostatní doplňky, nemění nastavení e-shopu a neodesílá formuláře (výjimkou je prázdný POST pro dočtení produktů dvou testovacích kategorií, viz [kategorie.md](kategorie.md)).
