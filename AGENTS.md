# AGENTS.md – aSteroid

Pokyny pro vývojáře a AI agenty (Claude jako hlavní vývojář, Codex jako nezávislá kontrola).
Zadání a principy: [docs/zadani.md](docs/zadani.md). Popis architektury: [README.md](README.md), [settings-app/README.md](settings-app/README.md).

## Projekt v kostce

Designová šablona pro Shoptet nad šablonou **Disco**, prodávaná jako doplněk.

- `theme/`: SCSS + vanilla JS, které se vkládají nad HTML a CSS Disco. Build Sass + esbuild, výstup `theme/dist/asteroid.css|js`.
- `settings-app/`: Node.js 18 server bez závislostí. Instalace doplňku (OAuth), stránka nastavení v administraci Shoptetu (iframe), zápis konfigurace přes Shoptet API `template-include`.
- Konfiguraci posílá settings-app do e-shopu jako `window.asteroidConfig`. `theme/src/js/main.js` podle ní přidá třídy **na `<html>`** (ne na `<body>`), např. `.as-header-v2`, `.as-banners-cards`.

## Konvence

- **Tokeny:** `theme/src/scss/tokens/` se exportují jako CSS proměnné `--as-*`. Barvy a fonty se odvozují z proměnných Shoptetu (`--color-primary`, `--template-font`…), hodnoty z Figmy jsou jen záloha. Pevné barvy z Figmy nepoužívat tam, kde má Shoptet nastavení (viz docs/zadani.md).
- **Komponenty:** prefix `as-`, BEM-like (`.as-bcard__track`), sdílené styly jako Sass mixiny v `tools/`.
- **Napojení na Disco:** selektory vždy ověřit na skutečném HTML testovacího e-shopu. Disco používá selektory s `#header` / `#navigation`, naše pravidla proto často potřebují stejnou specificitu. Obcházení stylů Disco komentovat (co Disco dělá a proč to přebíjíme).
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
