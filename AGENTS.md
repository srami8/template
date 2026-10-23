# AGENTS.md – aSteroid

Pokyny pro vývojáře a AI agenty (Claude jako hlavní vývojář, Codex jako nezávislá kontrola).
Zadání a principy: [docs/zadani.md](docs/zadani.md). Popis architektury: [README.md](README.md), [settings-app/README.md](settings-app/README.md).

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
- **Obsah z administrace má přednost** před vlastním nastavením doplňku. Údaje se nezadávají dvakrát.
- **Bezpečnost settings-app:** relace jako podepsaný token (ne cookie), CSRF řeší token ve formuláři, všechny výstupy přes `escape()`, JSON v `<script>` přes `inlineJson()`, z chyb Shoptetu se odstraňují tokeny.
- Komentáře česky, stručně: proč, ne co.

## Příkazy

```bash
npm install
npm run build            # theme/dist
npm run deploy           # build + nahrání na SFTP testovacího e-shopu (potřebuje .env)
npm run settings         # settings-app na http://localhost:8787 (potřebuje SHOPTET_CLIENT_SECRET v .env)
npm run tunnel           # dočasná veřejná adresa (cloudflared v .tools/)
node --check settings-app/src/*.mjs
```

Automatické testy zatím nejsou. Úspěšný build nedokládá správný vzhled ani integraci se Shoptetem.

## Ověření změn

- Testovací e-shop: https://313980.myshoptet.com/ (šablona Disco). Ověřovat na šířce 1920 px a změřit rozměry proti Figmě.
- Náhled variant bez ukládání: `?asteroid-header=v1|v2|v3`, `?asteroid-banners=default|content|fullwidth|cards`.
- Figma: https://www.figma.com/design/jpEXMp36OXxRJqE0ortBfB/aSteroid

## Tajné údaje

`.env` (SFTP, OAuth client secret) a `settings-app/data/` (OAuth tokeny instalací) se nikdy necommitují ani nevypisují.

## Spolupráce Claude × Codex

- Práce po menších, samostatně kontrolovatelných celcích. Bez nesouvisejícího refaktoringu.
- Po dokončení celku předání: zadání a podmínky dokončení, větev a commit, změny a rozhodnutí, provedené kontroly s výsledky, postup ručního ověření, známá rizika a neověřené části, podklady pro vizuální kontrolu.
- Nálezy z review se posuzují podle kódu a reprodukce. Nesouhlas se dokládá.
- Když jeden převezme opravu, druhý stejné soubory souběžně neupravuje. Rozdělení práce musí být výslovné.
- Vizuální schválení a nasazení schvaluje majitel projektu.
