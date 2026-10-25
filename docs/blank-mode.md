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

## Závazný cíl migrace – zadání pro Claude i Codex

Majitel výslovně potvrdil: **současný vzhled a chování e-shopu jsou reference. Vypnutí původního CSS Shoptetu nesmí změnit vzhled ani ovládání. CSS postupně přebírá aSteroid do vlastních udržovatelných SCSS komponent.** Nejde o redesign ani jen o trvalé načítání celé kopie Disca pod jiným názvem.

Kompatibilní snapshot je dočasná pojistka pro dosud nepřevedené části. Cílem je odstranit závislost vzhledu na původním CSS Disca, včetně tohoto snapshotu, jakmile jej vlastní komponenty plně nahradí. Nativní HTML, třídy, datové atributy, formuláře, události a JavaScript Shoptetu zůstávají integračním rozhraním. Vypnutí nativního JavaScriptu není součást této migrace.

### Postup pro každou komponentu

1. Zachytit aktuální referenci před změnou: snímky, rozměry, typografii, mezery, barvy a ovládání. Najít všechna místa, kde komponentu Shoptet vykresluje, včetně dynamického AJAX obsahu. Současný vzhled má při této migraci přednost před novými designovými úpravami.
2. Zmapovat závislosti na CSS Disca: reset, rozložení, viditelnost, breakpointy, ikony a otevřené/chybové stavy. Zjistit, co už pokrývají existující mixiny a komponenty aSteroidu.
3. Doplnit chybějící pravidla do současné struktury `theme/src/scss/` (tokeny, tools, layout, components). Nevytvářet paralelní kopii již existující komponenty. Společný vzhled patří mimo desktopové breakpointy; varianty zůstávají ve vlastních souborech registrovaných v `styles.mjs`.
4. Ve vývojovém náhledu vypnout nativní CSS **a zároveň vyřadit nahrazovaná pravidla z kompatibilního podkladu**. Jinak by snapshot zakryl chybějící vlastní styly a test by nedoložil převod. Ostatní nepřevedené části mají svůj kompatibilní základ dál.
5. Porovnat před/po na skutečném Shoptetu: desktop 1920 px, mobil 390 px, relevantní mezilehlé šířky a změna šířky již otevřené stránky. Ověřit běžný obsah, dlouhé texty, focus, disabled, chyby, otevřené panely a AJAX varianty tam, kde existují.
6. Teprve po doložené shodě odstranit odpovídající pravidla z aktivního kompatibilního základu. Pravidla sdílená s nepřevedenou částí zatím zachovat. Původní vendor snapshot uchovat jako dohledatelnou referenci; redukovaný podklad vést odděleně a popsat jeho sestavení a kontrolu integrity. Neupravovat minifikovaný vendor soubor naslepo ani jen přepsat jeho hash.
7. Zapsat výsledek, dotčené selektory, všechny výskyty, zbývající závislosti a provedené kontroly do předání. Každý převod samostatně kontrolovatelný commit. Aktualizovat přehled níže.

### Doporučené pořadí

1. Nejdřív dokončit referenční pokrytí plného/AJAX košíku, dopravy, platby a objednávkového formuláře, včetně chybových stavů.
2. Základ stránky: reset, kontejnery, mřížka, typografie a pomocné třídy pro viditelnost. Změny mají globální dopad, proto kontrolovat všechny typy stránek.
3. Sdílené komponenty: tlačítka, inputy, selecty, checkboxy/radia, množství, ceny, štítky, hodnocení a ikony. Převádět napříč všemi výskyty, ne po jednotlivých stránkách.
4. Hlavička, navigace, hledání/našeptávač, přihlášení a panely; potom bannery, produktové výpisy, kategorie a detail produktu.
5. Košík a objednávkové kroky, články, obsahové stránky, patička a zbývající méně časté stavy.
6. Po pokrytí všech částí ověřit celý e-shop s úplně vyřazeným kompatibilním snapshotem. Teprve tehdy je migrace CSS dokončená.

### Podmínky dokončení každého kroku

- Vzhled i chování odpovídají referenci na mobilu a desktopu; bez neschválených vizuálních změn.
- Převáděná komponenta je ověřena bez nativního CSS a bez svých původních pravidel v kompatibilním podkladu.
- Pokryté jsou všechny její výskyty i relevantní stavy. Nákupní akce a nativní události dál fungují.
- Žádné maskování chyb globálním `overflow-x: hidden`, plošným `!important` ani schováním důležitých akcí.
- Build, relevantní regresní testy, vizuální porovnání a integrační kontroly prošly; neověřené stavy jsou výslovně uvedené a krok se za dokončený nepovažuje.

### Stav a evidence

Majitel v navazující konverzaci potvrdil, že v aSteroidu zapnul **Blank mode – základ v aSteroid**. To není potvrzení vypnutí původního CSS v administraci Shoptetu. Restart aplikace a dostupnost nové karty už majitel potvrdil. Historický popis kontrol výše zachycuje stav při prvním nasazení.

| Oblast | Stav | Další krok |
|---|---|---|
| Vlastní načítání kompatibilního CSS a fontu ikon | Implementováno a nasazeno | Zachovat jako pojistku při převodu |
| Nahrazení snapshotu vlastními SCSS komponentami | Zatím nezahájeno; dosavadní vzhled je kombinace vlastních stylů a kompatibilního podkladu | Doplnit reference a inventuru závislostí |
| Plný/AJAX košík a objednávkové kroky bez nativního CSS | Zbývá integrační ověření | Zachytit stavy před první redukcí podkladu |
| Úplné odebrání kompatibilního snapshotu | Cílový stav | Až po převodu a ověření všech částí |
