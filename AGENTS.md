# AGENTS.md – aSteroid

Pokyny pro vývojáře a AI agenty (Claude jako hlavní vývojář, Codex jako nezávislá kontrola).
Zadání a principy: [docs/zadani.md](docs/zadani.md). Dokumentace pro vývoj: [docs/vyvoj.md](docs/vyvoj.md), [settings-app/README.md](settings-app/README.md).

## Projekt v kostce

Designová šablona pro Shoptet nad šablonou **Disco**, prodávaná jako doplněk.

- `theme/`: SCSS + vanilla JS, které se vkládají nad HTML a CSS Disco. Build Sass + esbuild, výstup `theme/dist/asteroid.css|js`.
- `settings-app/`: Node.js 18 server bez závislostí. Instalace doplňku (OAuth), stránka nastavení v administraci Shoptetu (iframe), zápis konfigurace přes Shoptet API `template-include`.
- Konfiguraci posílá settings-app do e-shopu jako `window.asteroidConfig`. `theme/src/js/main.js` podle ní přidá třídy **na `<html>`** (ne na `<body>`), např. `.as-header-v2`, `.as-banners-cards`.

## Závazné pravidlo: maximálně využívat Disco

- Zdrojový kód Disca měnit nelze. Jeho HTML, CSS třídy a funkce jsou **integrační rozhraní**.
- Před implementací prozkoumat skutečný markup, styly a chování dané části Disca na testovacím e-shopu. Když podklad chybí, vyžádat si ho. Selektory neodhadovat.
- Přednostně stylovat existující prvky přes jejich třídy v naší SCSS nadstavbě.
- Nevytvářet vlastní komponentu, markup ani náhradní JS, pokud jde požadavek splnit přes existující šablonu.
- Třídy `as-*` jen pro doplňující stav, konfiguraci, nebo prvky, pro které Disco nemá základ. Ne plošně jako náhradu tříd Disca.
- Zachovat události, datové atributy, formuláře a další vazby, na kterých stojí funkčnost Shoptetu.
- Nepřesouvat, nenahrazovat a neduplikovat DOM prvky JavaScriptem. Když je to nezbytné, před implementací vysvětlit důvod a dopad.
- CSS cílené, s přiměřenou specificitou. Každé `!important` musí mít konkrétní důvod v komentáři.

Předání ke kontrole navíc uvádí: (1) které prvky, třídy a funkce Disca řešení využívá, (2) jaké vlastní doplňky zavádí a proč, (3) jak byla ověřena původní funkčnost dotčených prvků.

## Konvence

- **Tokeny:** `theme/src/scss/tokens/` se exportují jako CSS proměnné `--as-*`. Barvy a fonty se odvozují z proměnných Shoptetu (`--color-primary`, `--template-font`…), hodnoty z Figmy jsou jen záloha. Pevné barvy z Figmy nepoužívat tam, kde má Shoptet nastavení (viz docs/zadani.md).
- **Komponenty:** prefix `as-`, BEM-like (`.as-bcard__track`), sdílené styly jako Sass mixiny v `tools/`.
- **Sdílené komponenty se nepíšou znovu.** Stejný prvek vypadá na celém e-shopu stejně a styluje se jedním mixinem z `tools/`: `button` (base, size md/sm, secondary, conversion, chevron), `quantity.stepper` (počítadlo množství), `slider` (holder, arrows), `rating.stars`, `category-card.card`. Kontakt z nastavení e-shopu je v `js/contact.js`. Nový opakující se prvek nejdřív jako mixin / modul, pak použít.
- **Varianty vzhledu** (hlavička, bannery, karty produktů) jsou třídy na `<html>` (`.as-header-v2`, `.as-product-card-default`). Styly varianty jsou jen pod její třídou, další varianta = nový soubor (např. `components/product-cards/_<varianta>.scss`) a hodnota v nastavení.
- **Napojení na Disco:** viz závazné pravidlo výše; selektory vždy ověřit na skutečném HTML testovacího e-shopu. Disco používá selektory s `#header` / `#navigation`, naše pravidla proto často potřebují stejnou specificitu. Obcházení stylů Disco komentovat (co Disco dělá a proč to přebíjíme).
- **Desktop:** `@include bp.desktop` (od 768 px, jako Disco). Mobilní návrhy zatím ve Figmě nejsou.
- **Hlavička podle Disca:** od 768 px logo, hledání a akce v jednom řádku; pod 1200 px cenu košíku řídí původní `.visible-lg-inline-block`. Na mobilu se hledání otevírá původní lupou. Nezavádět trvalý druhý řádek hledání na tabletu. Referenční chování a způsob ověření jsou v `docs/responzivita.md`.
- **Jednotný vzhled napříč zařízeními:** mixiny tlačítek, počítadel množství, inputů a ostatní vizuální styly komponent patří do společného základu mimo `bp.desktop`. Breakpoint mění rozložení, mezery a potřebné rozměry, nikoli návrat k výchozímu vzhledu Disca. Při kontrole porovnej stejný prvek na mobilu i desktopu, včetně AJAX obsahu plného košíku.
- **Varianta = vlastní soubor stylů.** Styly varianty (hlavička, bannery, karty produktů a každá další volba v nastavení šablony) patří do `theme/src/scss/variants/<prefix>-<hodnota>.scss` → `dist/<prefix>-<hodnota>.css`, nikdy do základu (`main.scss` → `asteroid.css`). Název přidej do `theme/src/js/styles.mjs`. Ten seznam používá vkládaný kód (settings-app) i šablona pro náhled, a test `styles.spec.cjs` hlídá, že odpovídá souborům. Varianta smí jen importovat sdílené mixiny (`tools/`), nekopírovat je. Styly varianty se načítají za základem. Výjimka: `base-blank.css` je kompatibilní podklad Disca a musí být před `asteroid.css` (`beforeBase` ve styles.mjs).
- **Prvek Disca = jedna globální komponenta.** Stejný prvek (štítek, sleva, hvězdičky, počítadlo, tlačítko, pole formuláře, ikona) má na všech stránkách stejné třídy. Jeho vzhled patří do jedné globální komponenty (`tools/*` + `components/_product-elements.scss` apod.), místo použití řeší jen umístění a rozložení. Než prvek nastyluješ, najdi všechna místa, kde se vypisuje (`docs/komponenty.md`, a ověř na e-shopu: výpis, detail, košík, hledání, přihlášení), a zkontroluj je všechna snímky `npm run snapshots` před a po nasazení. Po každé změně vzhledu spusť `npm run audit` (porovná vzhled komponent na 1920 a 390 px na e-shopu) a novou komponentu do něj přidej (`tests/shop/audit.cjs`). Audit neověří vše (pořadí, rozvržení), otevřené stavy (nabídky, okna) zkontroluj i očima na snímku.
- **Ikony jsou na všech zařízeních stejné.** Když přepíšeš ikonu Disca (jeho písmo `shoptet`) na desktopu, glyf patří do společného základu mimo breakpointy, aby se změna projevila i na mobilu, včetně otevřených stavů (menu, hledání). Breakpoint smí měnit jen velikost a umístění ikony. Kontrola: na mobilu v hlavičce ani v menu nezůstane `::before` / `::after` s písmem `shoptet` bez naší masky.
- **Responzivita je součást každé změny.** Když chybí mobilní návrh, rozhodni rozložení samostatně podle obsahu a UX; na běžné volby breakpointů nečekej na schválení. Zachovej ovládání a data Disca. Při nedostatku místa nejdřív zmenši mezery, potom přeskup nebo zalom bloky; důležité akce a obsah neschovávej. Pevné rozměry z desktopové Figmy jsou cílové maximum, nikoli minimální šířka.
- **Sjednocovat také chování.** U příbuzných mobilních panelů automaticky převzít už zavedené vzory menu: animované vysunutí i zavření, tap na tmavý overlay, křížek, Escape, návrat fokusu a uzamčení pozadí. Ověřit opakované otevření, obsah po AJAXu, zavřený stav bez zachytávání dotyků/Tab a přechod na desktop. Samotný snímek otevřeného panelu nestačí; tyto detaily domýšlet bez dalšího zadání majitele.
- **Ověřování responzivity:** žádné překryvy loga, vyhledávání, účtu a košíku; hledání zůstává použitelné, dlouhé názvy a ceny se vejdou a otevřené panely umožní dosáhnout celého obsahu. Žádné globální `overflow-x: hidden` k maskování chyb. Testuj mezi breakpointy i při změně šířky už otevřené stránky. Pravidla a příkazy: [docs/responzivita.md](docs/responzivita.md).
- **Obsah z administrace má přednost** před vlastním nastavením doplňku. Údaje se nezadávají dvakrát.
- **Bezpečnost settings-app:** relace jako podepsaný token (ne cookie), CSRF řeší token ve formuláři, všechny výstupy přes `escape()`, JSON v `<script>` přes `inlineJson()`, z chyb Shoptetu se odstraňují tokeny.
- **Dokumentace se píše průběžně.** Změna chování, nastavení nebo konfigurace = aktualizace [docs/vyvoj.md](docs/vyvoj.md) (vývoj) a příručky pro obchodníka (Claude Docs, odkaz v docs/vyvoj.md) ve stejném celku jako kód. Příručka popisuje, co obchodník vidí a kde to nastaví, bez technických detailů.
- Komentáře česky, stručně: proč, ne co.

## Příkazy

```bash
npm install
npm run build            # theme/dist
npm run test:responsive  # build + Chromium: geometrie, dlouhý obsah, panely, změny šířky
npm run deploy           # build, nahrání na SFTP testovacího e-shopu a zápis kódu s novou verzí souborů do e-shopů (potřebuje .env)
npm run settings         # settings-app na http://localhost:8787 (potřebuje SHOPTET_CLIENT_SECRET v .env)
npm run tunnel           # dočasná veřejná adresa (cloudflared v .tools/)
node --check settings-app/src/*.mjs
```

Lokální testy responzivity používají izolované HTML a náhradní obsluhu rozhraní Disca. Úspěšný build ani tyto testy nedokládají správný vzhled a skutečnou integraci se Shoptetem; tu ověř na testovacím e-shopu.

## Ověření změn

- Testovací e-shop: https://313980.myshoptet.com/ (šablona Disco). Ověřovat na šířce 1920 px a změřit rozměry proti Figmě.
- Náhled variant bez ukládání: `?asteroid-header=v1|v2|v3`, `?asteroid-banners=default|content|fullwidth|cards`, `?asteroid-columns=4|5|6`, `?asteroid-category=default|background|image|image-wide`, `?asteroid-category-tint=1`. Bannery podle značky v názvu („Nadpis sekce [L|P|R]“, „[1]“ …) řeší `js/homepage-banners.js`.
- Figma: https://www.figma.com/design/jpEXMp36OXxRJqE0ortBfB/aSteroid

## Tajné údaje

`.env` (SFTP, OAuth client secret) a `settings-app/data/` (OAuth tokeny instalací) se nikdy necommitují ani nevypisují.

## Spolupráce Claude × Codex

- Práce po menších, samostatně kontrolovatelných celcích. Bez nesouvisejícího refaktoringu.
- Po dokončení celku předání: zadání a podmínky dokončení, větev a commit, změny a rozhodnutí, provedené kontroly s výsledky, postup ručního ověření, známá rizika a neověřené části, podklady pro vizuální kontrolu.
- Nálezy z review se posuzují podle kódu a reprodukce. Nesouhlas se dokládá.
- Když jeden převezme opravu, druhý stejné soubory souběžně neupravuje. Rozdělení práce musí být výslovné.
- Vizuální schválení a nasazení schvaluje majitel projektu.

## CSS-only Blank mode

Majitel schválil verzovaný kompatibilní základ z Disca a jeho postupné čištění. `styleMode: blank` načte `base-blank.css` a lokální font ikon; HTML i JavaScript Shoptetu zůstávají původní. Neměnit šablonu na Classic a nevypínat nativní JS. Vendor snapshot v `theme/src/vendor/disco/` má zdroje a kontrolní součty v manifestu; aktualizace je samostatně kontrolovaná změna. Pravidla o `!important` platí pro vlastní kód, snapshot zachovává původní CSS. Postup a limity: [docs/blank-mode.md](docs/blank-mode.md).


**Závazný cíl potvrzený majitelem:** při postupném převodu CSS zachovat současný vzhled a ovládání 1:1 na mobilu i desktopu. Kompatibilní snapshot je přechodná pojistka. Po komponentách nahrazovat jeho pravidla vlastním SCSS v existující architektuře aSteroidu; po ověření je odebírat z aktivního podkladu. Převod každé komponenty testovat s vypnutým nativním CSS i bez jejích pravidel ze snapshotu. Cílem je nakonec fungovat bez původního CSS Disca i bez celé jeho kopie. Nejde o redesign a nevypíná se nativní JS. Podrobný postup, podmínky dokončení a evidence jsou v [docs/blank-mode.md](docs/blank-mode.md#závazný-cíl-migrace--zadání-pro-claude-i-codex).
