# Responzivita šablony

Responzivita se řeší při každé implementaci. Chybějící mobilní Figma není důvod ponechat rozbitý layout. Vývojář samostatně rozhodne přeskupení podle obsahu a ověří výsledek; zásadní změny informační architektury a obchodních funkcí nadále řeší s majitelem.

## Rozložení

- Pod 768 px zůstává mobilní hlavička, menu a vyhledávání Disca. Hledání se otevře lupou na samostatném řádku. Desktopová kopie účtu je skrytá, rychlé odkazy jsou uvnitř hlavního menu pod kategoriemi a před měnou a přihlášením; informační odkazy V2 mají vlastní vodorovný posuvný řádek. Skutečná výška pevné hlavičky určuje odstup obsahu a horní okraj mobilního menu, aby nezakrývala informační lištu.
- Od 768 px zůstávají logo, hledání a akce v jednom řádku jako v Discu. Vyhledávání vyplňuje zbývající místo do svého maxima; nemusí držet přesnou šířku návrhu. Pod 1200 px řídí skrytí textu ceny košíku původní třída `.visible-lg-inline-block`. Dlouhý název účtu se zalomí uvnitř tlačítka.
- Od 768 do 1199 px má našeptávač jeden sloupec, produktové výsledky se řadí pod sebe. Bannery se skládají do hlavního banneru a řádku dvou postranních.
- Horní menu a telefon se při dlouhém obsahu mohou zalomit. Informační odkazy vedle katalogu mají vlastní posuvný řádek, aby velký počet položek nezabral téměř celou obrazovku.
- Podkategorie mají na menším desktopu méně sloupců, dostupné místo určuje šířku obrázků a textu. Původní DOM a obsluha Disca zůstávají zachované.
- Ceny a akce produktů se v úzké kartě zalamují. Počet a rozměry položek nativního slideru nadále určuje Shoptet.
- Výška našeptávače, katalogu V2 a desktopového košíku je omezená skutečným volným místem pod prvkem. Delší obsah se posouvá uvnitř původního panelu. Úvodní banner přes celou obrazovku počítá šířku bez scrollbarů včetně stabilního gutteru Disca.
- U obsahového banneru `.body-banners` se na telefonu původní nadpis, popis a tlačítko zobrazí pod obrázkem. Text tak zůstane čitelný i u nízkého širokého banneru a celý banner nadále funguje jako původní odkaz.

Přednost mají CSS flex/grid, `min-width: 0`, rozumné maximální šířky a zalamování. JavaScript měří pouze rozměry, které závisí na umístění panelu nebo vizuálním viewportu. Nepřesouvá prvky Disca ani nenahrazuje jeho události. Horizontální posuv je záměrný u pásu karet bannerů a rychlých odkazů, nikoli u celé stránky.

## Referenční chování hlavičky Disco

Ověřeno 23. 10. 2026 na `313980.myshoptet.com`, šablona 13 (Disco). V testovacím prohlížeči byly vynechány pouze soubory aSteroidu a externí Treelab CSS; původní HTML, CSS a skripty Shoptetu zůstaly načtené. Následně se do stejné stránky vložilo lokální sestavení aSteroidu. Soubory na serveru se neměnily.

- Mobilní hlavní řádek má 50 / 80 px podle šířky, otevření hledání přidá 48 px. Informační odkazy V2 zvětší celkovou hlavičku o svůj řádek; rychlé odkazy jsou na mobilu uvnitř menu; velikost původních ovládacích prvků zůstává Discu.
- Mobilní skrytí při posunu dolů a návrat při posunu nahoru dál řídí původní `.scrolled-down`. Hledání ovládá `.toggle-window[data-target="search"]` a `.search-window-visible`.
- Při změně z mobilu na desktop zůstane zachovaný stejný formulář i rozepsaný dotaz. Escape hledání zavře a vymaže dotaz podle původní obsluhy Disca.
- Od 768 px má Disco hledání přímo mezi logem a košíkem; cena košíku se objeví od 1200 px. aSteroid tyto přechody zachovává, navíc má vlastní vzhled a tlačítko účtu v hlavním řádku.

Referenční stylesheet: `cdn.myshoptet.com/prj/dist/master/shop/dist/main-13.less.c8a6415be4516e0585b7.css`. Při další změně nejprve znovu ověř chování aktuální verze Disca. Nepřidávej vlastní mobilní menu, obsluhu hledání ani další breakpoint jen podle desktopového obrázku.

## Automatické kontroly

```bash
npm ci
npx playwright install chromium
npm run test:responsive
```

Pokud prostředí již má kompatibilní Chromium, lze místo stahování zadat jeho cestu:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:responsive
```

Sada v `tests/responsive` kontroluje obě implementované hlavičky při šířkách 320–1920 CSS px, dlouhé odkazy a názvy, ceny a nákupní akce, hledání s výsledky i bez výsledků, menu, omezení popupů a opakované změny šířky bannerů. Při chybě uloží screenshot a trace do ignorovaného `test-results/responsive`.

Fixture vychází z již používaných selektorů a dokumentované struktury komponent. Neobsahuje kompletní produkční HTML, CSS, skripty ani AJAX Shoptetu. Tyto testy jsou regresní kontrolou naší nadstavby, nikoli důkazem kompatibility s aktuálním Discem.

## Kontrola na testovacím e-shopu

Po nasazení ověř 320, 390, 768, 1024, 1280 a 1920 px, polohy těsně před a za breakpointy a úzkou obrazovku na šířku. Použij i dlouhé názvy, ceny, více odkazů a přihlášený účet.

Zkontroluj otevření a zavření původního menu, přihlášení a košíku, podkategorie klávesnicí i dotykem, odeslání hledání, skutečné výsledky našeptávače, změny množství, přesun sliderů a dosažitelnost spodních akcí panelů. Změň šířku při otevřeném panelu a ověř stav po AJAX překreslení. Nejdřív ověř toto chování na skutečném Discu, potom schval vzhled.
