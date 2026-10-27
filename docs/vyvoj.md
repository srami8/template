# aSteroid – dokumentace pro vývoj

Technický popis šablony: architektura, kde co je v kódu, jak se co chová, jak se testuje a nasazuje. Pro obchodníky je samostatná příručka (Claude Docs „aSteroid – příručka pro obchodníka“, https://claude.ai/artifact/X9RrPxJnCkjFkufZZ6FMjz).

Pravidla práce a spolupráce: [AGENTS.md](../AGENTS.md). Zadání a principy: [zadani.md](zadani.md). Návrh: [Figma](https://www.figma.com/design/jpEXMp36OXxRJqE0ortBfB/aSteroid).

| Dokument | Obsah |
|---|---|
| [cart-widget.md](cart-widget.md) | mobilní panel košíku, nativní ovládání a doprava zdarma |
| [kategorie.md](kategorie.md) | sidebar, filtry, řazení a stránkování kategorie |
| [blank-mode.md](blank-mode.md) | zapnutí CSS-only Blank mode, návrat a správa kompatibilního základu |
| [komponenty.md](komponenty.md) | prvky Disca, kde se vypisují a kde je jejich jediný zdroj vzhledu |
| [responzivita.md](responzivita.md) | responzivní chování hlavičky a postup ověření |
| [clanky-ke-kategoriim.md](clanky-ke-kategoriim.md) | články ke kategoriím: data, zveřejnění, provoz, převod ručních článků |
| [../settings-app/README.md](../settings-app/README.md) | aplikace nastavení: cesty, spuštění, nastavení doplňku v Shoptetu |
| [../HANDOFF.md](../HANDOFF.md) | deník změn (nejnovější nahoře): co, proč, jak ověřeno |

## Architektura

```
Administrace Shoptetu
  └─ Propojení → aSteroid ─► settings-app (iframe, OAuth basic_eshop)
       ├─ uloží nastavení instalace (data/store.json)
       ├─ Shoptet API /api/template-include (common-header):
       │    <script>window.asteroidConfig = {…}</script>
       │    <link data-as-style="asteroid|header-v1|…"> (základ + soubory zvolených variant, ?v=otisk)
       │    <style>:root{--as-heading-size-h1:…;--as-category-tint:…}</style> (jen změněné hodnoty)
       │    <script src="asteroid.js?v=otisk">
       └─ veřejný soubor /public/<eshopId>/category-articles.json (články ke kategoriím)

E-shop (HTML šablony Disco)
  ├─ asteroid.js v hlavičce (blokující): třídy variant na <html>, pak DOMContentLoaded úpravy DOM
  └─ asteroid.css + variants/*.css: vzhled nad třídami Disca
```

- **theme/**: SCSS + vanilla JS. Build `sass` + `esbuild` do `theme/dist` (`asteroid.css`, `<varianta>.css`, `asteroid.js`). Soubory leží na e-shopu v `/user/documents/asteroid/`.
- **settings-app/**: Node.js 18+ bez závislostí. Instalace doplňku, stránka nastavení, zápis kódu do e-shopu, veřejný soubor článků.
- Skript šablony je blokující v `<head>`: třídy na `<html>` se nastaví před prvním vykreslením (žádné přepnutí varianty po načtení) a jeho DOMContentLoaded běží před sliderem Shoptetu.

## CSS-only Blank mode

`styleMode` je `disco` (výchozí, beze změny stávajících instalací) nebo `blank`. Ve druhém režimu snippet načte `base-blank.css` **před** `asteroid.css` a variantami. Základ je verzovaný snapshot Disca 13 v `theme/src/vendor/disco`, sestavený lokálně včetně fontu ikon. Build ověřuje SHA256 manifestu a kopíruje fonty do dist; deploy je nahraje spolu s CSS. Písmo obsahu a barevné proměnné nadále dodává Shoptet podle administrace. `styleVersions` obsahuje i otisk podkladu; JS umí podklad doplnit před existující asteroid.css u starého snippetu.

Nejde o režim bez JS ani o migraci HTML na Classic. Používá se stále Disco a nativní JS. Úplný kompatibilní podklad se zatím záměrně neprořezává podle první stránky: obsahuje i tabulky, formuláře, nákup a otevřené stavy. Postup aktivace, návratu a následného čištění je v [blank-mode.md](blank-mode.md). Návod pro obchodníka je tam také; externí Claude Docs příručka nebyla upravena.

## Konfigurace (`window.asteroidConfig`)

Tvar vytváří `settings-app/src/theme-config.mjs` (`themeConfigFromForm`, `snippetConfig`), čte ho `theme/src/js/main.js`. Všechny klíče jsou volitelné, neznámá hodnota = výchozí.

| Klíč | Hodnoty | Výchozí | Třída na `<html>` / použití |
|---|---|---|---|
| `header` | `v1` \| `v2` \| `v3` | `v1` | `.as-header-<v>`; soubor `header-v1.css` / `header-v2.css` |
| `banners` | `default` \| `content` \| `fullwidth` \| `cards` | `default` | `.as-banners-<v>`, soubor `banners-<v>.css` |
| `productCard` | `default` | `default` | `.as-product-card-default`, soubor `product-card-default.css` |
| `productColumns` | `4` \| `5` \| `6` | podle Shoptetu | `js/homepage-products.js` (počet v sliderech úvodní stránky) |
| `categoryLayout` | `default` \| `background` \| `image` \| `image-wide` | `default` | `.as-category-<v>`; `default` je v základu (bez souboru), ostatní `category-<v>.css` |
| `categoryTint` | `true` \| `false` | `false` | `.as-category-tinted` (jen `image`, `image-wide`); pruh je i u kategorie bez obrázku (výchozí rozložení v pruhu, mixin `text-band`) |
| `categoryTintColor` | `#rrggbb` \| `null` | `null` | do `<style>` jako `--as-category-tint`; bez ní `--as-primary-50` |
| `categoryTintDark` | `true` \| `false` | `false` | `.as-category-tint-dark`: nadpis, popis, odkazy a ikony článků bíle; počítá server při uložení (`isDarkColor`: bílý text má podle WCAG vyšší kontrast než tmavý `#2e3545`) |
| `categoryArticles` | URL souboru s `?v=` | – | jen když existuje přiřazení; `js/category-articles.js` |
| `phone` | `{ hours }` \| `null` | `null` | otevírací doba za telefonem (číslo z kontaktu e-shopu) |
| `quickLinks` | `[{ label, url, icon? }]` (max 6) | `[]` | řádek pod hlavičkou, `.as-has-quicklinks` drží místo předem |
| `navLinks` | `[{ label, url }]` (max 8) | `[]` | odkazy vedle Katalogu (v2) |
| `homeCategories` | `{ title, items: [{ guid, name, url, image }] }` (max 16) | – | `js/home-categories.js`; data z API při uložení |
| `shopReviews` | `{ enabled, title }` | `{ enabled: true, title: 'Hodnocení obchodu' }` | `js/shop-reviews.js`, blok nad patičkou |
| `headings` | `{ h1: 40, … }` jen změněné | `{}` | do `<style>` jako `--as-heading-size-hN` |

Ikony (`icon`) jsou soubory v `theme/src/icons` (`npm run build:icons` → `scss/generated/_icons.scss`). Vložený kód má limit Shoptetu 8192 znaků (`buildHeaderSnippet` hlídá), proto velká data (články) jdou mimo něj.

**Náhled bez uložení** (parametry adresy e-shopu): `?asteroid-header=v2`, `?asteroid-banners=cards`, `?asteroid-columns=6`, `?asteroid-category=image-wide`, `?asteroid-category-tint=1`. Chybějící soubor varianty dočte `ensureStyles` v `main.js` (v náhledu proto stránka může poskočit, s uloženým nastavením ne).

## Varianty stylů

- Seznam: `theme/src/js/styles.mjs` (`VARIANT_STYLES`), sdílí ho šablona i settings-app. Hodnota v `base` (např. `categoryLayout: default`) nemá soubor.
- Nová varianta: soubor `theme/src/scss/variants/<prefix>-<hodnota>.scss`, hodnota ve `styles.mjs`, volba v `theme-config.mjs` + `views.mjs`, třída v `main.js`. Test `styles.spec.cjs` hlídá shodu seznamu a sestavených souborů.
- Styly varianty jen pod její třídou na `<html>`, sdílené části jako mixiny v `scss/tools/`.
- Verze souborů (`?v=`) je otisk obsahu každého souboru zvlášť; vkládaný kód předává i mapu `styleVersions` pro náhledy nezvolených variant. Starší kód bez mapy při dočtení použije časovou verzi, aby nevzal starou cache. Shoptet je posílá s mezipamětí na rok.

## Kód šablony

### JS (`theme/src/js`)

| Soubor | Co dělá |
|---|---|
| `main.js` | vstup: konfigurace, náhled, třídy na `<html>`, dočtení stylů, volání modulů na DOMContentLoaded, ochrana proti dvojímu spuštění (`window.asteroidStarted`) |
| `styles.mjs`, `typography.mjs` | seznam variant stylů; výchozí velikosti nadpisů (sdílí settings-app) |
| `viewport.js` | `--as-viewport-width` bez posuvníku (pásy přes celou šířku okna) |
| `header.js`, `catalog.js` | úpravy hlavičky (účet vedle košíku, telefon, odkazy); „Katalog produktů“ v2/v3 nad menu Disca |
| `mobile-header.js`, `mobile-menu.js` | mobilní hlavička (schování při posunu, pod informační lištou); menu jako panel zleva |
| `search.js`, `contact.js` | našeptávač („nic nenalezeno“ + kontakt z e-shopu) |
| `cart.js`, `login.js` | okno košíku v hlavičce; okno přihlášení |
| `banners.js`, `homepage-banners.js` | bannery na výšku; bannery Zápatí/Střed podle značky v názvu (`[n]` mozaika, `[L]`/`[P]`/`[R]` u sekce, štítky pro admina) |
| `home-categories.js`, `homepage-products.js` | kategorie na úvodní stránce; počet produktů v sliderech |
| `product-cards.js` | hodnota slevy do `data-as-discount` (i po AJAXu přes MutationObserver) |
| `category.js` | Nejprodávanější: posuvný pás, šipky, tlačítko Detail |
| `category-intro.js` | přesun prvního obrázku z popisu kategorie do `figure.as-category-intro__media` |
| `shop-reviews.js` | hodnocení obchodu nad patičkou: data ze stránky hodnocení přes `/cache/<adresa>/` (serverová mezipaměť Shoptetu, ~25 kB gzip), stažení až u patičky, `sessionStorage` 30 min, 4 nejnovější recenze |
| `article-cards.js` | karta článku: na úvodní stránce doplní datum zveřejnění z výpisu rubriky (`/cache/<rubrika>/`, chybějící z detailu článku; stažení u sekce, `localStorage` 12 h, místo pro datum předem), ve výpisu rubriky přidá „Číst článek“; datum jednotně „10. 12. 2023“ |
| `category-articles.js` | blok článků ke kategorii (GUID z `dataLayer`, data stažená už v hlavičce) |

### SCSS (`theme/src/scss`)

- `tokens/`: barvy, písmo, tvary jako `--as-*`. Barvy a písmo z proměnných Shoptetu (`--color-primary`, `--template-font` …), Figma jen záloha. Odstíny hlavní barvy `color-mix` s bílou/černou. Nadpisy `--as-font-size-hN` = velikost × měřítko (telefon H1 0,78, H2 0,86, H3 0,84).
- `tools/`: sdílené mixiny – `button`, `quantity`, `rating`, `flag`, `slider`, `dropdown`, `menu`, `submenu`, `category-card`, `category-intro`, `choice` + `checkbox` + `radio`, `field-font` (písmo polí na telefonu), `field-label` (popisek nad polem), `icon`, `breakpoints`.
- `components/`: globální komponenty (tlačítka, nadpisy, prvky produktu, drobečky, kategorie, karta článku, hodnocení obchodu, hledání, přihlášení, košík, bannery, mobilní hlavička a menu).
- `layout/`, `header/`: hlavička, úvodní stránka, informační lišta, šířka obsahu stránek (`_content-width.scss`: `#content-wrapper.container-narrow` Disca má šířku jako `.container`, běžný text článků a textových stránek max. 820 px); varianty hlavičky v1/v2.
- `variants/`: soubory variant (viz výše).

Breakpointy (`tools/_breakpoints.scss`): `bp.desktop` od 768 px (jako Disco), `$large` 992 px (obsah vedle sebe), `$wide` 1200 px, kontejnery Disca 747 / 972 / 1178 / 1418 px. Vizuální styly mimo breakpointy, breakpoint mění jen rozložení a rozměry.

## Chování, na které je potřeba myslet

- **AJAX Shoptetu** (řazení, filtry, stránkování) vymění `.category-top` i výpis a vyvolá `ShoptetDOMPageContentLoaded`. Na ni se znovu spouští `category.js`, `category-intro.js` a vykreslení článků; karty produktů hlídá MutationObserver. Nová úprava DOM v kategorii musí být idempotentní a navázaná na tuto událost.
- **Bez posunu stránky:** rozložení, které závisí na obsahu, se rozhoduje v CSS (`:has()`), JS jen dokončí (přesun obrázku, vložení bloku). Místo se drží předem (zástupný blok, `.as-has-quicklinks`). U variant popisu kategorie je naměřené CLS 0,005–0,016.
- **Specificita Disca:** Disco používá `#header`, `#navigation`, `#productsTop` …, naše pravidla potřebují stejnou specificitu. Každé `!important` s důvodem v komentáři.
- **Hodnocení obchodu bez vlastního serveru:** blok čte stránku hodnocení obchodu z `/cache/<adresa>/` (nedokumentovaná, ale funkční serverová mezipaměť Shoptetu, obsah shodný s běžnou adresou, odpověď ~20 ms; při chybě včetně HTTP 404 se zkusí běžná adresa). Adresa stránky z odkazu na stránce, jinak podle jazyka. Šetrnost pro stovky e-shopů: stahuje se až po přiblížení k patičce (IntersectionObserver, 800 px) a jednou za 30 minut návštěvy (`sessionStorage`, i prázdný výsledek). Markup se čte přes `data-testid` (`textRatingAverage`, `textRatingAuthor`, `textRating` …).
- **Pásy přes celou šířku okna** používají `--as-viewport-width` (ne `100vw`, ten zahrnuje posuvník). `#content` má na desktopu `padding-top: 20px` (Disco), pásy navazující na drobečky ho vyrovnávají.
- **Barvy jen z tokenů**, žádná pevná barva z Figmy tam, kde má Shoptet nastavení.
- **Pole formulářů jsou globální** (`components/_fields.scss`): Shoptet má na `body.ums_forms_redesign--on` nový vzhled formulářů kreslený z proměnných `--form-*`, `--colors-forms-*`. Nastavují se na `html.as-theme` (stejný prvek jako `:root` Disca, kde se počítají `--*-computed-*`, a vyšší specificita); pole s plovoucím popiskem přepisuje v obalu jen okraj a výšku popisku (52 px). Stavy, které proměnné nemají (stín fokusu a chyby, barva textu, placeholder), jsou pravidla na `.form-control:not(.query-input)`. Select nemá `::after`, šipku nese obal `:is(.form-group, .form-control-wrapper):has(> select.form-control)`, svisle `top: calc(var(--form-controls-computed-height) / 2)` (pod pole Shoptet do obalu vkládá hlášky validace). Písmo 14 px podle Figmy, na telefonu (pod 768 px) 16 px: iOS Safari při fokusu pole pod 16 px přiblíží stránku. Globální pole to mají v proměnných (`--form-controls-font-size` + řádek `1.25`, aby pole zůstalo 52 px), pole s vlastním `font-size` (hledání v hlavičce, kupon, select měny v kroku 1, číslo v počítadle) volají `tools/_field-font.scss` `phone`. Nové pole s vlastní velikostí písma musí mixin volat také. Test `tests/responsive/fields.spec.cjs`, audit „Pole“ (velikost písma se mezi desktopem a mobilem u polí neporovnává).
- **Popisek nad polem** (`tools/_field-label.scss` `above`, Figma 93:2578 „Has label“): plovoucí popisek Shoptetu (`.smart-label-wrapper > label`) zůstává v DOM, mixin ho ve všech stavech (`.focused`, `.populated`) drží nad polem (16 px, `--as-secondary-400`, mezera 8 px přes flex obalu) a vrací poli běžné okraje 52 px. `display` popisku nemění: Shoptet u země přepíná dva popisky třídou `.js-location--hidden`. Použití: třetí krok objednávky (`components/_checkout-form.scss`).
- **Checkbox a radio jsou globální** (`components/_choices.scss` nad `.as-theme`): platí pro každou dvojici `input + label` v e-shopu, i pro formuláře, které se načítají později (okna, zákaznická sekce). Komponenta mění jen uspořádání řádku a polohu prvku (`::before`), vzhled ne. Popisek je `inline-block` s řádkem 22 px, ne flex: souhlasy obsahují odkazy a flex by text rozdělil na samostatné bloky. Input se skrývá jen s labelem hned za sebou (`:has(+ label)`), hvězdičky hodnocení mají input uvnitř labelu; barevné vzorníky `label.advanced-parameter` jsou vyloučené. Test `tests/responsive/choices.spec.cjs`, audit „Volby“.

## settings-app

Cesty, relace a nastavení doplňku: [settings-app/README.md](../settings-app/README.md). Doplňky k němu:

- `GET /public/<eshopId>/category-articles.json`: veřejný soubor článků (CORS `*`, `max-age=300`, obnova z API na pozadí po 10 min, při chybě nejvýš 1 pokus za minutu, chyba nic nemaže).
- Kód e-shopu skládá `buildHeaderSnippet(snippetConfig(installation))`; stejně ho po nasazení zapisuje `publish-snippets` do všech instalací.
- Uložení ukládá adresu souboru článků jen s HTTPS (uložení přes `http://localhost` ponechá předchozí).
- Stránka nastavení: Shoptet UI. Vlastní nápovědy mají třídu `.as-hint`; `.v2FormField__hint` ze Shoptet UI má šířku 1 px a `nowrap` a pro samostatný text se nehodí.
- Oprávnění doplňku: HTML kódy v šabloně (zápis), informace o e-shopu, kategorie, články (čtení).

## Testy a kontrola

| Příkaz | Co ověřuje |
|---|---|
| `npx -y node@20 node_modules/@playwright/test/cli.js test --config tests/responsive/playwright.config.cjs` | rozložení a chování na izolovaných HTML podle markupu Disca (`tests/responsive/*.spec.cjs`); stránka testu načítá `theme/dist` |
| `npm test -w settings-app` | datová logika (články, barva pozadí, vložený styl) |
| `npm run snapshots <tag> [porovnat-s]` | snímky vybraných oblastí skutečného e-shopu na 1920 a 390 px a porovnání (`test-results/shop/`) |
| `npm run audit` | stejný vzhled komponent na desktopu a telefonu na skutečném e-shopu (`tests/shop/audit.cjs`) |

Testy izolovaných stránek: každá stránka v nové záložce (`setContent` ponechává `window`, skript šablony se podruhé nespustí); ResizeObserver hlásí změnu šířky až po vykreslení.

**Dva druhy testovacích stránek – kdy načítat CSS Disca (`base-blank.css`):**
- **Zjednodušená napodobenina markupu** (`tests/responsive/fixture.cjs`, jednotlivé stránky v `*.spec.cjs` sestavené ručně): **bez** `base-blank.css`. Potřebnou geometrii Disca mají vepsanou samy; skutečné CSS Disca na zjednodušeném HTML dává jiné rozměry než na e-shopu a testy by hlásily neexistující chyby (stalo se 25.–27. 10.: 20 falešných selhání).
- **Skutečné HTML ze Shoptetu** (`tests/responsive/fixtures/*.html`, např. košík, objednávka, filtry, patička, doprava zdarma): **s** `base-blank.css` před `asteroid.css`, stejně jako na e-shopu.
- Shodu vzhledu bez nativního CSS (Blank mode) ověřuje `npm run preview:blank` nad skutečným e-shopem, ne zjednodušená stránka.
- Simulace nefunkčního obrázku: 404 bez obrazových dat (404 s platným SVG prohlížeč vykreslí bez události `error`).
- Celou sadu spouštět před každým commitem; „ověřeno v náhledu“ ji nenahrazuje.

## Postup změny

1. Ověřit markup a chování Disca na testovacím e-shopu (https://313980.myshoptet.com/) a místa, kde se prvek vypisuje ([komponenty.md](komponenty.md)).
2. `npm run snapshots before`.
3. Změna; test v `tests/responsive`, u settings-app v `settings-app/test`.
4. `npm run deploy` (build, SFTP, zápis kódu do e-shopů), po změně settings-app restart serveru.
5. `npm run snapshots after before`, `npm run audit`, kontrola otevřených stavů očima.
6. Commit (trailer `Co-Authored-By`), push `feature/responsive`.
7. `HANDOFF.md`, [komponenty.md](komponenty.md), **tato dokumentace a příručka pro obchodníka**, když se změnilo chování nebo nastavení.

## Provoz

- `.env` (necommituje se): SFTP (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`), `SHOPTET_CLIENT_SECRET`, volitelně `PUBLIC_URL`, `PORT`, `ASSETS_VERSION`, `SHOPTET_API_BASE` (jen zkouška výpadku API).
- `settings-app/data/store.json`: instalace, OAuth tokeny, nastavení, přiřazení článků; necommituje se. Pro ostrý provoz databáze.
- Veřejná adresa settings-app: zatím dočasný tunel Cloudflare (`npm run tunnel`); po každé změně adresy přepsat adresy doplňku v Shoptetu a znovu uložit nastavení (adresa článků je v kódu e-shopu). Pro provoz stálá adresa (`PUBLIC_URL`, hosting nebo pojmenovaný tunel).
- Odkaz na nastavení s tokenem relace platí 2 hodiny.

## Známé mezery

- Hlavička **V3** je v nastavení, ale nemá vlastní styly (soubor ani pravidla `.as-header-v3`).
- Sidebar, příznakové/cenové filtry, řazení a stránkování podle návrhu 1631:7129; implementace a ověření v [kategorie.md](kategorie.md). Další parametrické skupiny je nutné ověřit nad daty.
- Úložiště settings-app je JSON soubor, ne databáze.

Mobilní kategorie podle Figmy (ořez popisu/článků, 4,5 řádku podkategorií, posuvné řazení a pravý panel filtrů): [kategorie.md](kategorie.md#mobilní-kategorie-163310268-163310605). Sdílený panel košíku/filtrů je v `tools/_drawer.scss`; nativní data a AJAX se nenahrazují.

Mobilní panely mají společné chování v `js/drawer.js` a pohyb v `tools/_drawer.scss`: otevření/zavření 250 ms, tap na overlay v capture fázi, inert zavřeného obsahu a reduced-motion. U příbuzných prvků automaticky přebírat zavedené vzory menu; závazná kontrola chování je doplněná v AGENTS.md.

Oprava mobilní čáry řazení: #category-header má padding-bottom:0, takže border-bottom navazuje na podtržení aktivní záložky. Viz docs/kategorie.md; desktopové řazení a JS beze změny.

Aktivní filtry kategorie (Figma 1633:7414 / 1633:10605): [active-filters.md](active-filters.md). Společný tag mixin s našeptávačem, nativní .active-filters .input a #clear-filters; na mobilu přehled v panelu i nad řazením podle upřesnění majitele.

Štítky našeptávače a filtrů mají jeden společný základ i v sestaveném CSS (Sass placeholder za API tools/tag.base). Komponenta filtrů používá přímo nativní .active-filters/.input/#clear-filters; JS nedoplňuje čistě vizuální as-* třídy. Test styles.spec.cjs hlídá společné výsledné pravidlo.

Spodní popis kategorie (`.category__secondDescription`) zůstává na mobilu i desktopu za produkty a stránkováním. Mobilní CSS posouvá dopředu pouze filtry, aktivní štítky a řazení; zbytek zachovává původní pořadí Disca. Při přidání dalšího bloku kontrolovat i spodní popis, ne jen ovladače nad výpisem.

Patička podle Figmy 1633:7416: [správa obsahu, nativní prvky a ověření](paticka.md). Původní formulář newsletteru, kontakty a menu Disca; platební a sociální řádek používá původní odkazy. Recenze obchodu se nemění.

Doprava zdarma se styluje globálně přes původní `.cart-free-shipping` a `.extra.delivery` v jediné komponentě, nikoli uvnitř konkrétního okna košíku. Text a procento dodává Shoptet. [Výskyty a ověření](doprava-zdarma.md).

První krok košíku podle Figmy 1642:5563: [nativní prvky, sdílené komponenty a ověření](kosik-krok1.md). Původní tabulka, související produkty a kupony, společné kroky objednávky; žádné kopírování formulářů.

## Objednávka: doprava a platba

Společná hlavička posledních dvou kroků nezávisí na variantě z administrace; formuláře zůstávají Shoptetu. Popis, nativní třídy, sdílené komponenty a limity: [objednavka-krok2.md](objednavka-krok2.md).

Rekapitulace kroků 2/3 nyní doplňuje pouze chybějící img z nativního košíku; administrace nevyžaduje novou volbu. Obrázky se párují podle identifikátoru i SKU a mají jeden společný styl. Zdroj, cache, fallback a ověření: [objednavka-krok2.md](objednavka-krok2.md#obrázky-rekapitulace-bez-volby-v-administraci).

Aktualizace objednávky: kontakt nad rekapitulací opět viditelný, sdílí základ s patičkou (`tools/contact`). Hover regrese musí zahrnovat nativní `.desktop` a skutečný :hover, jinak se konflikt Disca neprojeví. Detaily a živé ověření: [objednavka-krok2.md](objednavka-krok2.md#oprava-hoveru-centrování-a-vrácení-kontaktu-podle-aktualizované-figmy).

Pravý kontakt a rekapitulace kroků 2/3 používají společný CSS blok nad nativním `#checkoutSidebar`, včetně finálního tlačítka se zachovaným závazným textem. Žádný nový JS ani vlastní vizuální třídy. [Podrobnosti](objednavka-krok2.md#společná-rekapitulace-kroků-2-a-3).
