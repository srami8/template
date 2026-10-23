# Aktualizace (Claude): mobilní hlavička a menu podle Figmy

**Zadání:** majitel dodal 5 návrhů (výchozí, sticky, menu úroveň 1–3). Rozhodnutí majitele:
- ikona účtu otevře okno přihlášení,
- položka „Další“ se vynechá,
- hlavička se při posunu dolů schová a při posunu nahoru vrátí kompaktní,
- odznak košíku je v konverzní barvě jako na desktopu.

**(1) Disco a Shoptet**
- Hlavička: `#header` (pevná na mobilu), `.header-top-wrapper`, `.navigation-buttons` (lupa, košík, hamburger), `.search` / `.search-form` (pole i tlačítko Disca), `.site-msg.information` (Disco má inline `bottom`).
- Menu: `#navigation .navigation-in`, `.menu-level-1 > li.ext` + `.submenu-arrow` (Disco přepíná `li.exp`), `.menu-level-2 > li > a.menu-image + div > a + ul.menu-level-3` (Shoptet dává nejvýš 3 úrovně), `.navigationActions` (měna / jazyk / přihlášení), `.top-navigation-menu` (informační stránky).
- Okno přihlášení: `#login` přes kopii tlačítka účtu `.as-account-button`.

**(2) Vlastní doplňky**
- `components/_mobile-header.scss` + `js/mobile-header.js`:
  - řádek přes flex s `order` a `.navigation-buttons { display: contents }`,
  - tlačítka 40 px, pole hledání 40 px,
  - kompaktní a skrytý stav, lišta absolutně nahoře; inline `bottom` od Disca přebíjí `!important`.
- `js/header.js`: měří výšku jen plné hlavičky, `shopPhone` exportován.
- `layout/_header.scss`:
  - ikona účtu a odznak košíku jsou společné mimo breakpointy,
  - kopie účtu je vidět i na mobilu,
  - odstraněny staré mobilní rezervy 50 / 80 px.
- `components/_mobile-menu.scss` (přepsáno) + `js/mobile-menu.js`:
  - panel, horní řádek, řádky podle návrhu,
  - panely úrovní,
  - informační stránky, telefon.
  - Hlavička má při otevřeném menu z-index 1005, panel je v její vrstvě.
- `tools/_submenu.scss`: na desktopu skrývá mobilní řádky zpět a „Zobrazit vše“.
- `components/_login.scss`: modální okno je mimo breakpoint (`width: min(460px, 100% - 32px)`).
- `header/_v2.scss`: odkazy v2 jsou na mobilu jen v menu.
- Nová ikona `icons/grid-view.svg` (asset z Figmy).

**(3) Ověření**
- Testy: 87 prošlých. Upraveny mobilní testy na nový návrh, nové testy pro kompaktní hlavičku, odkazy v menu a panel menu.
- Skutečný e-shop, headless Chromium 390 × 844, mobil s dotykem:
  - nahoře hlavička 104 px pod lištou 66 px,
  - po posunu dolů schovaná,
  - po posunu nahoru kompaktní 56 px,
  - otevřené hledání 104 px,
  - menu úroveň 1, 2 (Produkty s obrázky), 3 (Šperky) a zpět,
  - okno přihlášení,
  - bez přetékání a bez chyb JS.
- 1920 px beze změny (menu v1 i podmenu, doplňky skryté).

**Odchylky od Figmy**
- Logo má max. výšku 24 px (Figma 20 px slovní značka).
- Telefon je přichycený dole i na 1. úrovni.
- Položky 3. úrovně jsou bez šipky (Shoptet nemá 4. úroveň).

**Neověřeno**
- Skutečný dotyk na zařízení.
- Vícejazyčný e-shop (přepínač jazyka).
- Přihlášený zákazník (kopie tlačítka účtu vede na účet).
- Plný košík (odznak).

---

# Aktualizace (Claude): carousel varianty default na mobilu

Nalezeno při ověření předchozí úpravy, opravu schválil majitel. U varianty bannerů `default` (také `content`, `fullwidth`) byl celý vzhled carouselu a postranních bannerů v `bp.desktop`. Na mobilu proto zůstal Disco: text 34 px tučně přes obrázek, nadpis a text se překrývaly.

**(1) Disco a Shoptet:** `#carousel` (Bootstrap), `.carousel-control`, `.extended-banner-texts/-title/-text/-link`, `.next-to-carousel-banners`. Na mobilu Shoptet posílá vlastní obrázek carouselu (na e-shopu 720 × 720) a postranní bannery dává pod něj (`col-sm-4`).

**(2) `components/_banners.scss`**
- Vzhled je mimo breakpointy: zaoblení, zrušení inline `min-height`, kulaté šipky, skryté tečky, texty vlevo na středu, typografie s `clamp()`, tlačítko `button.light`, postranní bannery.
- Doplněno vynulování podkladu, rámečku a stínu textů Disca a `height: auto` u odkazu (Disco 32 px).
- Šipky mají odsazení přes `--as-carousel-arrow-inset`: 16 px, na desktopu 32 px.
- Mobil: texty přes celou šířku banneru, postranní bannery 20 px pod carouselem s menšími texty.
- V `bp.desktop` zůstalo jen rozložení: záporné okraje řádku, mřížka s postranním sloupcem 460 px, varianty `content` / `fullwidth`.

**(3) Ověření**
- Testy: 86 prošlých, nový `default carousel banner keeps its look on mobile` (375 vs. 1280 px).
- E-shop 375 px: „Svíčky Lawood“ s nadpisem, textem a bílým tlačítkem, nic se nepřekrývá, postranní bannery pod ním.
- 1920 px beze změny.
- Varianta `cards` na 375 px beze změny (vlastní pravidla s vyšší specificitou).

**Neověřeno:** šipky na mobilu (e-shop má jen jeden mobilní banner carouselu, Disco je pak nezobrazí).

---

# Aktualizace (Claude): stejný vzhled přihlášení, našeptávače a mobilního menu

Bod 3 z revize, schválil majitel. Podle pravidla „vzhled mimo breakpointy, breakpoint mění jen rozložení“.

**(1) Prvky Disca a Shoptetu**
- Přihlášení: `#login .login-form` (okno, na mobilu ho Disco neotevírá) a `#formLogin.login-form` na stránce `/login/`, kam vede „Přihlášení“ z mobilního menu. Stejný markup, `.smart-label-wrapper`, `.alternative-links`, `.submit-wrapper .btn`.
- Našeptávač: `.searchWhisperer*`, overlay `body.search-focused::before` (Disco ho má i na mobilu).
- Mobilní menu: `#navigation .navigation-in .menu-level-1 > li > a` (název v `<b>` s Disco paddingem 20 px), `li.exp` (rozbalení, přepíná Disco), `.menu-level-2 > li > div > a`, `.navigationActions` (měna, přihlášení), `.submenu-arrow` (pole 50 px).

**(2) Vlastní doplňky**
- `components/_login.scss`: vzhled formuláře (proměnné polí Shoptetu, ikony, odkazy, tlačítko `button.secondary`) je mimo breakpointy pro okno i stránku. `#formLogin` má `width: auto; max-width: 460px`, protože Disco mu dává pevných 440 px a na 375 px přetékal. V `bp.desktop` zůstalo jen modální umístění okna a overlay.
- `components/_search-whisperer.scss` přepsán na tři části:
  - společný vzhled,
  - rozložení desktop / compact / mobil,
  - rozdíly přes proměnné `--as-whisperer-pad`, `--as-whisperer-product-gap`, `--as-whisperer-empty-icon` a `--as-whisperer-category-columns`.
  - Na mobilu: jeden sloupec, odsazení 16 px, kategorie po 2, kontakt pod nimi.
- Nový `tools/_menu.scss`: mixiny `item`, `item-active` a `sublink`, používají je `header/_v1.scss` (desktop) a `tools/_submenu.scss`.
- Nový `components/_mobile-menu.scss`: jen rozložení mobilního menu (řádky 52 px s oddělovačem, `b { padding: 0 }`, šipka přes výšku řádku, podkategorie odsazené na `primary-50`).
- Šipka podkategorií 16 px `secondary-300` jako v menu v1.
- Rychlé odkazy mají písmo `small` i v mobilním menu (selektor bez `#header` v `layout/_header.scss`).

**(3) Ověření**
- Testy: 85 prošlých, nový `login form and search results share their look on mobile and desktop` (375 vs. 1280 px: pole, ikona, tlačítko, produkt, cena, štítek, tlačítko výsledků).
- Skutečný e-shop 375 px:
  - mobilní menu: řádky 53 px, otevřená kategorie v primární barvě (na e-shopu skoro černá z administrace), podkategorie jako na desktopu,
  - `/login/`: stejný vzhled jako okno, stránka nepřetéká (scrollWidth 375),
  - našeptávač s výsledky i „nic nenalezeno“ s kategoriemi a kontaktem.
- 1920 px beze změny: našeptávač ve sloupcích `1058px 360px`, okno přihlášení 460 px, pole 52 px s ikonou.

**Neověřeno / zbývá**
- Mobilní menu má typografii menu v1 i u hlavičky v2: katalog v2 na desktopu má menší písmo, sjednotit podle varianty.
- **Nalezeno při ověření (mimo zadání):** u varianty bannerů `default` je na mobilu carousel ve stylu Disca (text 34 px přes obrázek, překrývá se). Náš vzhled carouselu je jen od 768 px, stejný typ problému.
- Newsletter a captcha na stránce `/login/` jsou Disco formuláře bez našeho vzhledu.

---

# Aktualizace (Claude): výkon – mezipaměť souborů šablony a posun hlavičky

Z revize výkonu (měřeno na testovacím e-shopu, headless Chromium) majitel schválil opravu dvou kritických bodů.

**1. CSS a JS se neukládaly do mezipaměti**
- Problém: kód v e-shopu načítal soubory s `?v=Date.now()` přes `document.write`. Každé zobrazení stránky tak stahovalo 23 KB znovu, i když Shoptet posílá `max-age` na rok.
- `settings-app/src/theme-config.mjs`:
  - `assetsVersion()` = SHA-256 obsahu `theme/dist/asteroid.css` a `.js` (12 znaků), `ASSETS_VERSION` v .env ji může přepsat.
  - Kód do e-shopu jsou obyčejné značky `<link>` a `<script src>`, bez `document.write`. Skript zůstává blokující: třídy variant na `<html>` se musí nastavit před vykreslením a DOMContentLoaded musí běžet před sliderem Shoptetu.
- Nový `settings-app/src/publish-snippets.mjs` (`npm run publish-snippets -w settings-app`) zapíše kód s novou verzí do všech instalací v úložišti (`listInstallations()` ve `store.mjs`). Kořenový `npm run deploy` ho spouští po nahrání souborů.

**2. Posun stránky po vykreslení (CLS 0,163 na desktopu)**
- Problém: řádek rychlých odkazů vkládá JS až na DOMContentLoaded, po prvním vykreslení. Hlavička i obsah pak sjely o 45 px.
- `main.js` dá na `<html>` třídu `as-has-quicklinks` (skript běží v hlavičce, před vykreslením).
- `layout/_header.scss`:
  - řádek má pevnou výšku `$quicklinks-height: 45px` (odkaz 44 + linka),
  - dokud v `#header` chybí, `.header-bottom` má `margin-top` stejné výšky (`#header:not(:has(.as-quicklinks))`),
  - jen na desktopu, na mobilu jsou odkazy v menu.

**Ověření**
- Testy: 84 prošlých, nový `quick links row has its space reserved before the script inserts it`.
- Měření na e-shopu:

| | Před | Po |
|---|---|---|
| 2. návštěva, přenos CSS + JS | 23,3 KB, 40–450 ms | 0 B, 1–3 ms |
| CLS desktop | 0,163 | 0,020 |
| CLS mobil, 2. návštěva | 0,018 | 0 |

- Kód v e-shopu ověřen: `<link …asteroid.css?v=9dfecb5ae64b>` a `<script …asteroid.js?v=9dfecb5ae64b>`, žádný `document.write`. Rychlé odkazy, kategorie i bannery u sekcí fungují.

**Zbývá z revize (neopravováno):**
- CLS 0,02 z vložení kategorií na úvodní stránce, pod hranicí 0,1.
- Vzhled přihlášení, našeptávače a mobilního menu na mobilu.
- Líné načítání obrázků v multibanneru `cards`.
- Drobnosti v `banners.js`, `viewport.js` a `product-cards.js`.

**Riziko:** `publish-snippets` zapisuje do všech instalací v lokálním `settings-app/data`. Při hostingu aplikace s nastavením se musí spouštět tam, kde jsou instalace uložené.

---

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
