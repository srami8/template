# Aktualizace (Claude): stejné ikony hlavičky na mobilu i desktopu

**Úkol (majitel):** ikony v hlavičce se na mobilu lišily od desktopu, což je neakceptovatelné. Co se přepíše na desktopu, musí platit i na mobilu.

**Příčina:** `layout/_header.scss` nahrazoval ikony písma `shoptet` našimi maskami jen uvnitř `bp.desktop`. Na mobilu zůstaly ikony Disca: lupa, košík, hamburger / křížek, křížek v otevřeném hledání a šipka podkategorií v menu.

**(1) Prvky Disca:** `#header .navigation-buttons > [data-target=search|cart|navigation]::before`, `body.navigation-window-visible` (křížek místo hamburgeru), `.search-input-icon::before` (zavření hledání na mobilu), `.search-button::before`, `#navigation .submenu-arrow::after` (Disco ji při rozbalení otáčí o 180°, otočení zůstává).

**(2) Vlastní doplňky:**
- Glyfy jsou nově na začátku `_header.scss`, mimo breakpointy: lupa `search`, košík `shopping-cart`, menu `menu`, otevřené menu `close`, zavření hledání `close`, šipka `expand-more`.
- Desktop mění jen velikost (košík a účet 32 px).
- Na mobilu jsou původní tlačítka 50 / 80 px `display: flex` a ikonu centrují. Disco ji centroval výškou řádku písma. Kopie účtu `.as-account-button` je z toho vyjmutá a zůstává skrytá.
- Nové pravidlo v `AGENTS.md`: ikony jsou na všech zařízeních stejné.

**(3) Ověření:**
- Testy: 83 prošlých, nový `header icons are the same on mobile and desktop` (375 vs. 1280 px, stejná maska).
- Skutečný e-shop 375 px: lupa, košík a hamburger jsou naše ikony 24 px, otevřené menu ukazuje náš křížek. Při kontrole v hlavičce ani v menu nezůstala ikona písma `shoptet` bez masky.
- 1920 px beze změny: košík a účet 32 px, lupa 24 px.

**Neověřeno:** šířka 481–767 px (tlačítka Disca 80 px) jen výpočtem, ne vizuálně. Plný košík na mobilu (odznak počtu kusů vedle nové ikony).

---

# Aktualizace (Claude): bannery Střed přiřazené k sekcím podle názvu

Nahrazuje globální nastavení `middleBanners` (`default` / `left` / `right`), které umělo jen jeden banner vedle sekce za prvním blokem. Majitel chce u každé sekce zvolit vlastní banner, např. dvě sekce pod sebou, obě s bannerem vlevo.

**Úkol:** banner Střed se zobrazí vedle sekce, jejíž nadpis má v názvu, se značkou `[L]` (vlevo) nebo `[P]` / `[R]` (vpravo).

**(1) Využité prvky Disca a Shoptetu**
- `#trackingScript[data-products]`: měřicí data Shoptetu, `banners[promoId] = {id: 'bannerN', name: <interní název>, position: 'indexPageBody'}`. Klíč odpovídá `data-ec-promo-id` odkazu banneru. Nejde o dokumentované API; když zmizí, použije se `alt` / nadpis.
- Blok `#content > .row.banners-content.body-banners > .col-* > .banner-wrapper` (všechny bannery Střed za 1. sekcí), `.homepage-group-title` + `.products-wrapper`, `data-columns` slideru.
- Banner bez cílové URL nemá `<a>` ani promo ID, jen `<img>`. Značku pak bereme z `alt`.

**(2) Vlastní doplňky**
- `js/section-banners.js` (nový): hledá značku v interním názvu, pak v `alt` a nadpisu banneru. Shoda s nadpisem sekce ignoruje velikost písmen i mezery. Značku odstraní z `alt` a nadpisu. Přiřazený `.banner-wrapper` **přesune** do nového `div.banners-content.body-banners.as-section-banner--left|right` před nadpis sekce. Přesun je zdůvodněný: Shoptet bannery jinam vykreslit neumí, prvek zůstává původní (měření promo akcí funguje). Prázdné sloupce a prázdný původní blok odstraní.
- `main.js`: `placeSectionBanners()` před `setHomepageProductColumns`. Odstraněny `MIDDLE_BANNER_LAYOUTS`, třída `.as-middle-banners-*` a náhled `?asteroid-middle-banners`.
- `homepage-products.js`: −2 produkty pro **každou** sekci za `.as-section-banner`, od 992 px.
- `_body-banners.scss`: přepsáno na `.as-section-banner`. Vzhled (obrázek přes plochu, texty, tlačítko `button.light`) je od 768 px. Rámeček je na `.banner-wrapper` (kvůli bannerům bez odkazu), poměr 434 : 509 se neořezává (text v obrázku). Float od 992 px (300 px, od 1200 px 434 px). Tablet: nad sekcí, 434 px uprostřed. Nový breakpoint `bp.$large` (992 px, šířka `.container` Disca).
- settings-app: karta s volbou nahrazena návodem k pojmenování, `middleBanners` odstraněno z konfigurace.

**(3) Ověření**
- Testy: 82 prošlých. `body-banners.spec.cjs` přepsán: dva bannery (interní název přes `#trackingScript`, banner bez odkazu přes `alt`), banner bez značky zůstává, odstranění značky, `data-columns` 4/4/6; 1024 px (300 px, nad sebou nic neořezané), 800 px (nad sekcí, uprostřed), 375 px bez přetékání.
- Skutečný e-shop (`?asteroid-columns=6`): 1920 px, „Omrkni nové kousky [L]“ (značka v nadpisu banneru) vlevo od 1. sekce, „Novinky, které musíš mít [R]“ (bez odkazu, značka v `alt`) vpravo od 2. sekce. 3. sekce je pod oběma, sloupce 4/4/6. 1024 px: banner 300 × 352, 4/4/6. 800 px: 434 × 509 uprostřed. 375 px: vykreslil se jen banner viditelný na mobilu, 355 px, bez přetékání.

**Ruční kroky:** majitel pojmenovává bannery v administraci. Značku je lepší dávat do interního „Název“: když je v „Název banneru“, zobrazí se jako nadpis přes obrázek (po odstranění značky).

**Rizika:**
- `#trackingScript` je interní kód Shoptetu.
- Po přejmenování sekce je potřeba přejmenovat i banner.
- Počet sloupců se určuje podle šířky při načtení.

**Neověřeno:** dotykový posun, uložení nastavení v administraci (bez vlivu, nastavení odpadlo).

---

# Aktualizace (Claude): banner Střed vedle produktové sekce

Nové nastavení šablony „Banner mezi produkty na úvodní stránce“ (`middleBanners`: `default` | `left` | `right`, třída `.as-middle-banners-*`, náhled `?asteroid-middle-banners=left`). Obsah jsou doplňkové bannery Shoptetu s pozicí Střed, nic se neprogramuje navíc.

- Disco blok `#content > .row.banners-content.body-banners` vykreslí za první produktovou sekcí. Od 1200 px ho `components/_body-banners.scss` obteče (`float`, 434 px), sekce za ním (`.homepage-group-title` + `.products-wrapper`) má `display: flow-root; width: auto` (Disco obalu dává `width: 100 %`, jinak by spadl pod banner), další obsah `clear: both`. DOM se nemění.
- `js/homepage-products.js`: slider sekce vedle banneru dostane o 2 produkty méně (min. 3), jen když je okno při načtení ≥ 1200 px.
- Vzhled banneru podle Figmy: obrázek přes celou plochu (`object-fit: cover`), zaoblení 8 px, nadpis H1 36 px a text nahoře, tlačítko 44 px nad spodkem; nová sdílená varianta `button.light` (použita i u tlačítka v carouselu, které mělo stejné barvy).
- Testy: 81 prošlých, nový `tests/responsive/body-banners.spec.cjs` (vlastní minimální stránka podle skutečného pořadí v `#content`).
- Ověřeno na e-shopu (náhledový parametr): 1920 px vlevo i vpravo – banner 434 × 509 px, sekce 904 px se 4 kartami 226 px, výška sekce 518 px, další sekce o 72 px níž; 1024 px banner nad sekcí, slider 6 → 5; mobil: Shoptet blok nevykreslí (banner je nastavený pro desktop, mobilní je skrytý), bez přetékání.
- Neověřeno: víc bannerů Střed najednou (na e-shopu je viditelný jeden), uložení v administraci (jen náhled), dotykový posun.

---

# Aktualizace (Claude): převzetí feature/responsive, výška tlačítka v kartě

Navazuje na předchozí aktualizace Codexu. Větev nasazena na testovací e-shop (SFTP).

- `npm run test:responsive`: **78 prošlých** (77 původních + 1 nový). Na tomto stroji je Node 18, Playwright 1.62 potřebuje Node 20, testy proto běží přes `npx -y node@20 node_modules/@playwright/test/cli.js test --config tests/responsive/playwright.config.cjs`. Prošel i test shody vzhledu košíku na mobilu a desktopu, který se u Codexu nespustil (pád Chromu).
- Tlačítko v kartě produktu: `min-height: 44px` jen na mobilu (`bp.mobile`). Na desktopu má 36 px podle Figmy, stejně jako počítadlo vedle (předtím 44 / 36 px v jednom řádku). Nový test `product card button keeps the design height on desktop and a touch target on mobile`.
- Ověřeno na skutečném e-shopu: multibanner (`cards`) při 375 px – pás 0–375 px, první karta x = 20 px, další vykukuje, přichycení na začátek karty, na konci 20 px od pravého okraje, stránka nepřetéká; informační lišta hned pod mobilní hlavičkou (50 px). Desktop 1920 px: tlačítko i počítadlo v kartě 36 px, cena košíku zobrazená.
- Neověřeno: skutečný dotykový swipe (jen programový posun), plný košík na mobilu na skutečném e-shopu (košík je prázdný).

---

# Aktualizace: posun multibanneru po jedné kartě

Šipky nyní posouvají pás o skutečnou šířku jedné karty plus mezeru namísto 90 % viewportu. Zachováno zarovnání a koncové odsazení. `scroll-snap-stop: always` omezuje přeskakování karet při posuvu. Bez nové knihovny a změn DOM.

Ověřeno na skutečném e-shopu při 1280 px: šířka kroku 339,42 px, po dvou kliknutích vpravo scrollLeft 339,5 a 679 px; po kliknutí vlevo návrat na 339,5 px. Druhá / třetí karta lícuje s původní hranou obsahu x≈51 px. Build a kontrola diffu prošly. Dotykový swipe nebyl samostatně ověřen.

---

# Aktualizace: multibanner podle chování Aktinu

Pás varianty `cards` nyní na všech zařízeních sahá přes celou šířku displeje. První karta a přichycení lícují s původním obsahem, posun probíhá i přes levou hranu displeje. Koncové odsazení lícuje s pravou hranou obsahu. Rozměry původního sloupce měří `banners.js`, zachováno HTML carouselu, původní šipky a stávající velikost desktopových karet.

Build a kontrola diffu prošly. Ověřeno v prohlížeči nad skutečným Shoptetem při 1280 px: pás x=0, šířka 1280 px, první karta x=51 px odpovídá levému okraji původního sloupce. Po kliknutí na další první karta odjede do záporné souřadnice, poslední končí přibližně na x=1229 px. Šířka celé stránky zůstává 1280 px. Mobilní chování této aktualizace zatím nebylo vizuálně ověřeno.

---

# Doplnění pro Claude: jednotný vzhled mobilního košíku

Na přímé zadání majitele byly sdílené styly obsahu košíku přesunuty mimo `bp.desktop`. Příčinou rozdílného vzhledu bylo omezení mixinů `quantity.stepper` a `button.*` i typografie pouze na desktop. Na mobilu se tak uplatňoval původní vzhled Disca.

Používej stávající společné mixiny na všech zařízeních. Do breakpointů patří rozdíly rozložení, nikoli celý vizuální styl komponent. Zachováno původní HTML, AJAX a ovládání Shoptetu. Mobil má dvouřádkovou mřížku produktu, tlačítko přes šířku a posuv celého panelu. Desktopové umístění okna zůstává v desktopovém breakpointu.

Další změny této pracovní kopie: rychlé odkazy jsou na mobilu uvnitř hlavní navigace; multibanner sahá k hranám displeje, přichytává karty s levým odsazením 20 px a má koncové odsazení 20 px vpravo. Změny navazují na původní strukturu a mixiny bez přepisu JS košíku.

Ověření této opravy: build Sass/esbuild a git diff --check prošly. Přidán regresní test shody vizuálních vlastností tlačítka, počítadla a inputu při 390 a 1280 px. Jeho běh zde blokuje pád Chrome při startu (SIGABRT / EPERM), takže nebyla potvrzena vizuální ani interakční kontrola. Původní výsledky testů níže patří k předchozímu commitu, nikoli k této opravě.

---

# Předání: responzivita aSteroid

Pracovní větev: `feature/responsive`. Základ: `c167871da29abcd9e2dad3f98c17c5ad5c993631` (`feature/product-columns`, obsahuje všechny dosavadní funkční větve). Úpravy implementoval Codex na přímé zadání majitele, včetně následného porovnání hlavičky s výchozím Discem. Claude může navázat podle tohoto předání.

## Zadání a výsledek

Odstranit rozpady rozložení na menších šířkách a samostatně rozhodovat responzivní chování i bez mobilní Figmy. Pravidla pro další práci jsou v `AGENTS.md`, konkrétní chování a příkazy v `docs/responzivita.md`.

- Pružné vyhledávání, logo a akce v jednom řádku od 768 px jako v Discu. Cena košíku se zobrazuje od 1200 px podle původní `.visible-lg-inline-block`. Dlouhý účet se zalamuje uvnitř tlačítka. Dřívější trvalý druhý řádek hledání při 768–1199 px byl po porovnání s Discem odstraněn.
- Doplněné informační a rychlé odkazy mají vlastní posuvné řádky a zůstávají dostupné klávesnicí, včetně informačních odkazů V2 na mobilu. Ty před úpravou tvořily neostylovaný vysoký seznam.
- Méně sloupců našeptávače, kategorií a podmenu na menším desktopu, zalamování cen a nákupních akcí v úzkých kartách.
- Měření výšky pevné mobilní hlavičky místo rezervy 50/80 px Disca, správný odstup informační lišty a mobilního menu.
- Omezení a scroll panelů podle skutečného volného místa; nativní desktopový košík se pod 992 px neroztahuje do celé výšky obrazovky.
- Tlačítko katalogu vystupuje nad ztmavení jen při otevřeném katalogu, takže nepřekrývá výsledky hledání. Počáteční `aria-expanded` se synchronizuje ihned (předchozí R5).
- Obsahové bannery na mobilu zobrazují původní text pod obrázkem. Fullwidth banner respektuje i stabilní rezervu scrollbarů Disca.

## Využití Disca

HTML, původní prvky, třídy a události Disca nebyly nahrazeny ani přesouvány. Styly cílí na již používané a nově přímo ověřené selektory. Katalog stále otevírá `.toggle-window[data-target="navigation"]`, původní menu řídí podkategorie a klávesnici. JS doplňuje rozměrové CSS proměnné, nikoli alternativní menu, hledání nebo košík. Backend settings-app se v této změně neupravoval.

## Ověření

- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:responsive`: **75 prošlých testů**, build ikon, Sass a esbuild prošel.
- Sada zahrnuje dlouhé texty, ceny a akce karet, obě hlavičky, šířky 320–1920 px včetně sousedů breakpointů, popupy, záměrné horizontální posuvy, hledání, krátký viewport, kolizi vrstev a stabilní scrollbar gutter.
- Kontrolní spuštění proti původním CSS/JS z `c167871` selhalo: hlavní hlavička při 768 px přetéká i bez doplňkových odkazů. Původní sestavení selhalo i v dalších třech kontrolách přetékání / umístění košíku. Regresní kontroly tedy rozlišují původní a opravené chování.
- Nad skutečným HTML, CSS a JS testovacího Shoptetu proběhlo **15 úspěšných scénářů**: V1 a V2 při 320, 390, 768, 1024, 1280 a 1920 px; nativní interakce při 390, 768 a 1280 px.
- Výchozí Disco bylo nejprve samostatně změřeno bez načtení aSteroidu. Následné porovnání V1 a V2 při 16 šířkách 320–1920 px (včetně 479/480/481, 767/768, 991/992 a 1199/1200) ověřilo společný řádek, dostupnou šířku hledání, viditelnost ceny košíku a absenci překryvů / přetékání. Všech **32 kontrol** prošlo.
- Další skutečný mobilní scénář ověřil původní formulář při změně šířky, otevření hledání (+48 px), Escape a schování / návrat hlavičky při scrollování. Chování odpovídá výchozímu Discu; Escape podle jeho původní obsluhy také vymaže dotaz.
- Nad skutečným Discem prošlo dalších **14 kontrol**: dlouhý název účtu a 8 informačních odkazů při 10 šířkách, potom dlouhé textové logo při 320, 768, 991 a 1280 px. Mobilní informační odkazy se skutečně posouvají i po zaměření posledního odkazu klávesnicí; jejich rodič potřebuje `min-width: 0`, protože původní `.navigation-wrapper` je flex i na mobilu.
- Ověřeno nativní otevření menu, podkategorie, Escape, vstup klávesnicí na odkaz `/pletene-kosiky/`, desktopové otevření a zavření přihlášení, prázdný košík a skutečné výsledky našeptávače pro „košík“. Košík má na malém desktopu výšku podle obsahu, hledání nezakrývá tlačítko katalogu a mobilní informační lišta není pod hlavičkou.
- Navíc načtena kategorie `/pletene-kosiky/`, detail `/zbozi/fut-heroes-24/` a prázdný košík `/kosik/` při 390, 768 a 1280 px: všech 9 načtení vrátilo HTTP 200, bez přetékání stránky a bez zachycených výjimek JavaScriptu. Jde o kontrolu rozložení a inicializace, nikoli o otestování celého nákupu.

Při těchto kontrolách byly lokální `theme/dist/asteroid.css|js` dosazeny pouze do odpovědí testovacího prohlížeče. Na server se nic nenahrávalo. Síťové odpovědi byly načítány přes curl se zapnutým ověřováním TLS; Chromium samo nedůvěřuje certifikátu síťového proxy. Načteny byly zdroje e-shopu a `cdn.myshoptet.com`; cizí Treelab stylesheet a analytické / sociální služby se testu neúčastnily. Potenciální souběh s cizím stylesheetem vyžaduje samostatnou kontrolu.

Automatické testy v repozitáři jsou izolované regresní kontroly rozhraní; živé testy byly samostatnou kontrolou této instance. Nebylo provedeno přihlášení skutečnými údaji, přidání produktu do košíku, objednávka ani SFTP nasazení. Plný košík je pokryt lokální fixture, skutečný Shoptet byl kontrolován s prázdným košíkem.

## Před nasazením

Prohlédnout diff a vizuálně schválit rozložení. Spustit testy podle `docs/responzivita.md`; po nasazení znovu ověřit skutečné interakce v e-shopu. Předchozí samostatné backendové nálezy a neimplementovaná varianta V3 nejsou součástí tohoto úkolu.
