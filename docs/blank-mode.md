# Blank mode: kompatibilní CSS základ

Majitel zvolil postupné oddělení od CSS Disca: nejprve vlastní verzovaný kompatibilní základ, později jeho čištění. HTML šablony zůstává Disco, původní JavaScript Shoptetu je zapnutý. `styleMode: blank` nahradí distribuční CSS a font ikon; nezajišťuje chod bez nativního JavaScriptu ani kompatibilitu s HTML Classic.

Shoptet umožňuje vypnout zvlášť CSS, JavaScript nebo obojí na stránce HTML kódů. Jeho obecný popis Blank šablony vychází z Classic. Tato integrace je ověřená pro současné HTML Disca; pokud aktivace mění i HTML šablonu, nepřepínat bez další integrace. [Oficiální dokumentace](https://developers.shoptet.com/shoptet-tools/editing-templates/blank-template-mode/).

## Návod pro obchodníka

1. Nahrát nové soubory aSteroidu a restartovat aplikaci nastavení, pokud ještě běží stará verze.
2. V nastavení aSteroidu v kartě **Základ stylů** zvolit **Blank mode – základ v aSteroid** a uložit. Tím se začne načítat kompatibilní základ. Samotné uložení nevypíná CSS v Shoptetu.
3. Zkontrolovat e-shop; teprve potom v Shoptetu na stránce HTML kódů (`/admin/html-kody/`) vypnout **pouze výchozí CSS**. JavaScript nechat zapnutý, podkladovou šablonu Disco zachovat.
4. Obnovit stránku bez cache. Ověřit menu, hledání, bannery, detail produktu, množství, přidání do košíku, dopravu/platbu a objednávkový formulář na telefonu i počítači. Kontrolu lze provést bez odeslání objednávky.

**Návrat:** nejprve v Shoptetu znovu zapnout původní CSS. Potom v nastavení aSteroidu zvolit **Výchozí styly Disca** a uložit. Toto pořadí zabrání stránce bez základních stylů.

Výchozí volba existujících instalací se nemění. Tato změna sama nezapíná globální Blank mode a neukládá novou volbu obchodníkovi.

## Technické řešení

Pořadí: `base-blank.css` → `asteroid.css` → zvolené varianty. Seznam je společný v `theme/src/js/styles.mjs`; `beforeBase` drží podklad před vlastním vzhledem. Stejné pořadí zachovává dočítání chybějících stylů ze staršího snippetu. Všechny soubory mají vlastní hash v URL; dva fonty ikon mají hash v názvu. Písmo obsahu, barevné proměnné a CSS jiných doplňků zůstávají z Shoptetu.

Podklad `theme/src/vendor/disco/` obsahuje celé nativní main CSS Disca 13 z 25. 10. 2026, font-shoptet CSS a oba formáty fontu. Manifest zaznamenává původní URL, hash upstream i lokální verze. Jediná změna zdroje je cesta k fontům vedle CSS. `build-blank-assets.mjs` kontroluje integritu a kopíruje fonty do dist. Build nevyžaduje síť; deploy zahrnuje CSS i fonty.

Snapshot neznamená automatickou kompatibilitu s budoucími změnami Shoptetu. Aktualizace snapshotu je kontrolovaná změna s testy, nikoli automatické přepsání zdroje během buildu.

## Ověření a opakovatelný náhled

`npm run preview:blank` (Node 20+, ověřeno Node 24) spustí dvě lokální adresy nad veřejným HTML testovacího e-shopu:

- `http://127.0.0.1:8792/`: nativní CSS + místní build aSteroidu.
- `http://127.0.0.1:8793/`: nativní main/font CSS odstraněné, místní base-blank + aSteroid.

Náhled nemění nastavení e-shopu a nepovoluje POST formuláře ani administraci. Zachovává nativní skripty, písmo a další doplňky, takže nejde o izolovanou HTML maketu. Je to simulace vypnutí CSS, nikoli důkaz skutečného přepnutí serverového režimu.

Dne 25. 10. 2026 byly v prohlížeči porovnány šířky 1920 a 390 px na homepage, kategorii, detailu produktu, prázdném košíku, výpisu a detailu článku, obchodních podmínkách, registraci, hledání, kontaktech a přihlášení. Kontrolovány rozměry a computed styly hlavních komponent, nulové nativní CSS linky a nulové horizontální přetékání. Vizuálně ověřena homepage a mobilní menu/formulář. Nativní mobilní menu včetně rychlých odkazů a zvýšení/snížení množství fungují.

Automatické kontroly: build včetně hashů, testy settings-app (pořadí stylů, opt-in režim, starší formulář/snippet, závislosti fontů, simulace Blank) a testy registrace variant. Spuštění lokálního Chromia pro kompletní audit/snímky blokuje sandbox (MachPortRendezvous / permission denied); místo toho proběhlo skutečné měření v in-app prohlížeči.

**Zbývající při aktivaci na testovacím e-shopu:** ověřit skutečný plný košík, AJAX košík, dopravu/platbu a objednávkový formulář po vypnutí CSS. Zkontrolovat také zachování písma a barevných proměnných z administrace; lokální simulace je zachovává, skutečný serverový přepínač zatím ověřen nebyl. Nebyla odeslána objednávka, přihlašovací ani registrační data. Vypnutí CSS v administraci nebylo provedeno. Nové nastavení se objeví až po restartu settings-app.

## Další čištění

1. Nejprve vytvořit sadu skutečných stavů nákupního procesu a chybových/otevřených stavů, porovnávat mobil i desktop.
2. Po komponentách určit, co je základní rozložení a chování Disca a co už plně nahrazuje globální mixin aSteroidu.
3. Odebírat jen doložené duplicity; zachovat nativní třídy, události a breakpointy. Vlastní vzhled dál držet v existujících globálních komponentách.
4. Každý krok samostatně otestovat a verzovat. Neprovádět plošné automatické odstranění „nepoužitého“ CSS.
