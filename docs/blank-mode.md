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

## Postup převodu

Cíl: e-shop s vypnutým CSS Shoptetu vypadá a funguje stejně jako dnes, na mobilu i počítači. Nejde o redesign.

1. Zachytit referenci (dnešní vzhled s CSS Disca): snímky, rozměry, typografii, stavy. Najít všechna místa, kde Shoptet komponentu vykresluje, včetně AJAX obsahu.
2. Zjistit, co komponentě dodává CSS Disca (reset, rozložení, viditelnost, breakpointy, ikony, stavy). Referencí je kopie `theme/src/vendor/disco/main.css` (snapshot Disca 13 z 25. 10. 2026).
3. Doplnit chybějící pravidla do struktury `theme/src/scss/` (tokeny, tools, layout, components). Nekopírovat pravidla Disca naslepo; jedna globální komponenta, varianty ve vlastních souborech.
4. Ověřit v náhledu bez CSS Shoptetu (`npm run preview:blank`, port 8793) a ve styleguidu (focení `capture.cjs` v režimu `blank`). Komponenta je převedená, když se bez CSS Disca shoduje s referencí; zároveň se nesmí změnit vzhled s CSS Disca, který dnes vidí obchodníci.
5. Zapsat výsledek do [komponenty-stav.md](komponenty-stav.md) a do předání. Každý převod je samostatný commit.

Doporučené pořadí: (1) základ stránky a skryté prvky (popupy, menu, okna), písmo ikon nahradit vlastními maskami; (2) sdílené komponenty (tlačítka, pole, volby, tabulky, hlášky, záložky); (3) hlavička, navigace, hledání, přihlášení a panely; (4) bannery, výpisy, kategorie, detail produktu; (5) košík a objednávka, obsah, patička, méně časté stavy. Nové komponenty od designera se kódují rovnou tak, aby fungovaly i bez CSS Disca.

Hotovo je, až všechny stránky projdou kontrolou s vypnutým CSS Shoptetu a bez kopie Disca. Teprve pak se volba Blank mode zpřístupní obchodníkům (s návodem: nejdřív zvolit v aSteroidu, pak vypnout CSS v Shoptetu; návrat obráceně).

## Kopie CSS Disca ve vývoji

`theme/src/vendor/disco/` obsahuje celé nativní main CSS Disca 13, font-shoptet CSS a oba formáty fontu ikon; manifest zaznamenává původní URL a kontrolní součty. `build-blank-assets.mjs` z něj sestaví `dist/base-blank.css` a fonty. Používá se jen:

- v testech se skutečným HTML (`tests/responsive/fixtures/*.html`), kde zastupuje CSS Shoptetu, které má e-shop načtené;
- jako reference pro převod (krok 2).

Do e-shopu se nenačítá (není v `styles.mjs` ani ve vkládaném kódu) a do vydání přes Addon Repository nepatří. Aktualizace snapshotu je samostatná kontrolovaná změna.

## Náhled

`npm run preview:blank` (Node 20+) spustí dvě lokální adresy nad veřejným HTML testovacího e-shopu: `http://127.0.0.1:8792/` s CSS Shoptetu a místním buildem aSteroidu, `http://127.0.0.1:8793/` s odstraněným CSS Shoptetu a jen se styly aSteroidu. Náhled zachovává JavaScript Shoptetu, písmo z administrace i ostatní doplňky, nemění nastavení e-shopu a neodesílá formuláře (výjimkou je prázdný POST pro dočtení produktů dvou testovacích kategorií, viz [kategorie.md](kategorie.md)).
