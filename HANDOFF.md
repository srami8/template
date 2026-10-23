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
