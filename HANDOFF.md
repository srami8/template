# Textová pole a select v celém e-shopu (Claude)

**Zadání:** Figma 93:2578 (styly inputů) – textová pole a select všude v e-shopu.

**Co se změnilo:**
- Nová globální komponenta `components/_fields.scss`. Shoptet má na e-shopu nový vzhled formulářů (`body.ums_forms_redesign--on`), který Disco kreslí z proměnných `--form-*` / `--colors-forms-*`; nastavují se na `html.as-theme`: pole 52 px, pilulka, 14 px, padding 16 px, rámeček `--as-secondary-100`. Pole s plovoucím popiskem Shoptetu má také 52 px (popisek jako placeholder v `--as-secondary-300`, po vyplnění zmenšený nahoře – stejně jako dříve v přihlášení).
- Stavy podle Figmy: fokus rámeček `--as-secondary-400` + stín, chyba validace `--as-danger` rámeček, text a stín, zakázané pozadí `--as-secondary-50`. Textarea rádius 26 px (Figma ji nemá; zakřivení jako 52px pole). Select: text od 24 px, šipka `chevron-right` 20 px v hlavní barvě 24 px od kraje na obalu `:has(> select)`.
- Nově podle Figmy: registrace, kontaktní formulář, kontaktní krok objednávky (vč. telefonu, firmy, poznámky), hodnocení obchodu/produktu, diskuze, zákaznická sekce a okna se stejným markupem. Přihlášení má fokus nově podle návrhu (dříve modrý rámeček). Hledání v hlavičce, newsletter a kupon mají vlastní návrh a zůstávají.
- `_checkout.scss` krok 1: šipka selectu zdola (`top: auto`), protože popisek je nad polem.
- Test drobečků (`layout.spec`) čekal nedostatečně na přepočet `--as-viewport-width` po změně okna a náhodně selhával (i před touto změnou); nově čeká.

**Ověření:** před nasazením na živém e-shopu s podstrčeným CSS (registrace, kontakty, přihlášení, košík, krok 1 a 2 objednávky, 1920/390; testovací produkt jen v headless prohlížeči, košík vyprázdněn, žádná objednávka). Snímky před/po: změna jen registrace a kontaktů (pole 64 → 52 px), přihlášení a ostatní stejné; články/homepage 390 kolísají jako dřív. Audit 5 rozdílů ze 113 (dosavadní, nové „Pole“ prošly). Nový `fields.spec.cjs` (rozměry na 5 šířkách, popisek, šipka v barvě z administrace, fokus/chyba/zakázané, hledání beze změny). Sada 168/168 třikrát, settings-app 5/5.

**Pozor:** 14 px podle Figmy znamená, že iOS Safari při fokusu pole stránku přiblíží (u 16 px ne). Platilo už pro přihlášení a newsletter.

---

# Checkbox a radio v celém e-shopu (Claude)

**Zadání:** Figma 93:2578 (styly inputů): zjistit barvu checkboxu a radia a použít ji všude v e-shopu.

**Barva:** Figma `$-Primary-500` (#1E9FE8) = v šabloně `--as-primary-500` = hlavní barva z administrace (`--color-primary`). Rámeček `$-Secondary-100` = `--as-secondary-100`, popisek `$-Secondary-500`.

**Co se změnilo:**
- Nová globální komponenta `components/_choices.scss` (nad `.as-theme`) zapíná `tools/_checkbox.scss` a `tools/_radio.scss` pro každou původní dvojici `input + label`. Společný základ `tools/_choice.scss`: skrytý input (jen `:has(+ label)`), popisek 16 px / řádek 22 px jako `inline-block` (souhlasy s odkazy se nerozpadnou), prvek u prvního řádku, stavy focus / disabled / chyba validace.
- Dosud ve vzhledu Disca a nově podle Figmy: registrace (typ zákazníka, newsletter), kontaktní krok objednávky (nákup na firmu, jiná adresa, poznámka, newsletter, registrace, souhlas s hodnocením); stejně i zákaznická sekce a formuláře v oknech se stejným markupem.
- Filtry a karty dopravy/platby už vzhled měly; nově mění jen uspořádání (`_category-filters.scss` řádek s počtem a hover, `_checkout.scss` poloha kolečka v kartě). Výjimky: hvězdičky hodnocení (input uvnitř labelu), barevné vzorníky `label.advanced-parameter`.
- Zakázané zaškrtnuté pole má šedý čtverec, aby bílá fajfka zůstala vidět.

**Ověření:** před nasazením na živém e-shopu s podstrčeným CSS (registrace, filtry, krok 1 a 2 objednávky, 1920 a 390 px; testovací produkt v košíku jen v headless prohlížeči, košík vyprázdněn, žádná objednávka). Snímky před/po: změna jen registrace (o 8 px nižší, řádek 22 px místo 26 px); homepage/články kolísají načítáním obrázků jako dřív. Audit 5 rozdílů ze 110 (stejné jako dosud, nové položky „Volby“ prošly). Nový test `choices.spec.cjs` (barva z administrace, víceřádkový souhlas na 5 šířkách, výjimky), `styles.spec` upraven na nový selektor. Celá sada 166/166 (třikrát po sobě; `layout.spec` drobečky jednou předtím náhodně selhal, s volbami nesouvisí), settings-app 5/5. Dokumentace: komponenty.md, vyvoj.md, kategorie.md, objednavka-krok2.md, příručka pro obchodníka.

**Otevřené:** textová pole a select ze stejného uzlu Figmy (výška 52, pilulka, focus se stínem, chybový stav) zatím nepřevedena – nebylo zadáno.

---

# Oprava (Claude): testy po předávce od Codexu

**Zjištění:** Codex v sandboxu nemohl spustit prohlížeč, browserové testy proto od 25. 10. nikdo nespustil. Na `c75c31f` selhávalo 23 ze 163.

**Příčiny a opravy (jen testy, šablona beze změny):**
- **20 selhání – zjednodušená testovací stránka s CSS Disca.** `fixture.cjs` od Codexovy úpravy načítal `base-blank.css` (celé CSS Disca) do zjednodušené napodobeniny markupu; skutečné CSS Disca na ní dává jiné rozměry než na e-shopu (hlavička 154 px místo ≤ 120 apod.). Ověřeno: stejný kód bez podkladu prochází. `fixture.cjs` opět bez `base-blank.css`; testy nad skutečným HTML ze Shoptetu (`fixtures/*.html`) ho dál načítají.
- **category.spec (4,5 řádku podkategorií):** 280,125 vs 280 px – porovnání s tolerancí pod 0,5 px.
- **checkout-images.spec (nefunkční obrázek):** test vracel 404 s platným SVG, Chrome ho vykreslil bez události `error`. Nyní 404 bez obrázku; test potvrzuje, že `checkout-images.js` nefunkční obrázek skutečně odstraní.
- **footer.spec:** druhé vložení skriptu do stejné stránky spadlo na `const LABELS`; každý průchod má vlastní stránku. Skript patičky je v pořádku.

**Ověření:** celá sada 163/163 třikrát po sobě, settings-app prošly. Pravidlo pro testovací stránky doplněné do docs/vyvoj.md (Testy a kontrola). E-shop ani nasazené soubory se nemění.

---

# Společný pravý panel objednávky 2/3 (Codex)

Základ 4a08a98, feature/responsive. Zadání: vzhled kontaktu a rekapitulace kroku 3 stejný jako krok 2, bez duplikace. Rozšířený jeden blok `_checkout.scss` nad nativními třídami; kontakt i součty/CTA dál využívají společné Sass komponenty. Žádné nové JS, třídy ani kopie/přesuny DOM. Nativní servisní řádky kroku 3 mají jen cílené CSS rozložení, finální tlačítko zachovává celý závazný text. Osobní pole, souhlasy, action, ceny a submit původní. Podrobnosti a ověření na konci docs/objednavka-krok2.md.

Náhled: oba kroky × 11 šířek 320–1920 bez přetékání, společná typografie identická, finální tlačítko desktop 52px. Původní formulář stále 29 pojmenovaných ovladačů / 36 form.elements. Build + 7 statických testů prošly; 2 browserové regrese, audit a snapshots blokuje start Chromia. Měření outputs/checkout-step3-summary-preview-checks.json. Nasazeno jako 73fbfbf na GitHub feature/responsive a SFTP; původní /Users/apple/aSteroid synchronizovaný. Snippet pouze instalace 313980, živé CSS/JS HTTP 200 a plné SHA256 shodné s buildem. Živě oba kroky × 11 šířek 320–1920 bez přetékání a s totožnou typografií společných prvků; desktop pravý sloupec432px/CTA52px. Krok 3 stále 29 pojmenovaných ovladačů / 36 form.elements a původní action, nezaškrtnutý opt-out, celé finální označení a odkazy souhlasů. Původní přechod krok2 → krok3 funguje, obrázek načtený, součet stále295Kč/243,80bezDPH. Žádná osobní data ani objednávka; vlastní testovací -6 odstraněn a košík opět prázdný. Snímky outputs/checkout-step3-shared-summary-{desktop,mobile}-live.png, měření checkout-step3-summary-live-checks.json. Audit i snapshots před/po blokuje start Chromia, nikoli úspěšné kontroly. Nastavení Blank, snapshot Disca a settings-app beze změny.

---

# Oprava hlavičky, hoveru a návrat kontaktu (Codex)

Základ ac0d3c5, feature/responsive. Majitel dodal snímky špatného centrování hlavičky a hranatého/skákajícího hoveru; aktualizoval Figmu 1645:8015 o kontakt 1647:9627. Dokumentace docs/objednavka-krok2.md na konci.

Živě reprodukován nativní hover: .desktop .shipping-billing-table .radio-wrapper:hover přidá 1px border + hranatý shadow, výška 76 → 78 px. Cílené &:hover pravidlo vrací obal na border0/shadow none; vlastní label se stejným 1px borderem/radiusem řeší pouze barvy a zaoblený stín. Header má explicitní střed hlavního řádku pro logo/telefon/tools, reset offsetů a clearfixů, mobil separátní telefonní řádek. Platí pro oba poslední kroky a varianty v1/v2.

Kontakt se vrací na původním místě .checkout-box, žádné kopie ani přesuny formulářů/údajů. Původní toggle span dostává text/ARIA heading a kontaktní box je stále viditelný, bez rozbalovací animace; skutečné jméno/fotka/telefon/mail z administrace. Prázdný blok se neukazuje. Sdílený tools/contact vytažený z patičky, stejné fonty/linky/ikony sestavené jednou; lokálně rozložení/foto64 radius10 gap16. Přesný phone-contact.svg24 z Figmy, mail-outline24 existující. Ostatní pole/JS dopravy a přepočty nezměněné.

In-app náhled 52 kombinací: v1/v2 × běžný/dlouhý kontakt × 13 šířek 320–2560. Bez přetékání/překryvů, všechny desktopové středy stejné, mobil logo/tools stejné a telefon v hlavičce. Hover všech 4 metod: 76px výška i další pozice beze změny, vnější border0/shadow none. Kontakt bez jména64px, prázdný skrytý. Kontroly outputs/checkout-fixes-preview-checks.json a checkout-hover-before-fix.json. Browserové regrese nyní obsahují .desktop i skutečný hover; start Chromia stále blokuje MachPortRendezvous. Nasazeno 1c15253 na GitHub feature/responsive a SFTP, původní složka synchronizovaná; snippet pouze instalace 313980, CSS/JS HTTP 200 a shodné SHA256. Build a 7 statických regresí prošly; 3 browserové regrese/audit/snapshots blokuje start Chromia, neoznačují se za prošlé. Živě v1/v2 × 9 šířek 320–2560 bez přetékání/překryvů, středy na desktopu shodné (39,5 px), na mobilu logo/tools stejné. Skutečný hover platební i doručovací karty drží 76 px a border0/shadow none, další pozice beze změny. Kontakt je viditelný i po EUR → CZK a v kroku 3 na mobilu i 1510px desktopu; přihlášení otevřeno/zavřeno na obou zařízeních. Fotka a jméno jsou skutečné z administrace, ne ukázka Figmy. Kontaktní blok patičky po sdílení stylů při 390/1920 bez přetékání, foto56/64. Vlastní testovací produkt -6 odstraněn, košík opět prázdný, bez objednávky. Snímky outputs/checkout-header-contact-fixed-live.png, checkout-hover-fixed-live.png, checkout-contact-mobile-fixed-live.png, checkout-contact-step3-fixed-live.png; měření checkout-fixes-live-checks.json. Nastavení Blank ani settings-app se nemění.

---

# Doplnění obrázků rekapitulace (Codex)

Majitel v administraci nenašel volbu obrázků. Zdroj 3a2a5b8, feature/responsive. Nutnost přidání pouze img do původního odkazu byla předem vysvětlena; žádné formuláře/texty/ceny se nekopírují ani nepřesouvají. Společný styl checkout-images pro kroky 2/3, původní .cart-item-name a; bez vlastní vizuální třídy, 48 px / radius 8 / gap 16. Podrobnosti docs/objednavka-krok2.md, část Obrázky rekapitulace.

Checkout-images.js převezme z prvního kroku jen URL obrázků a kombinaci microIdentifier+microSku (varianty); sessionStorage 15 minut, vždy úplný snímek při ShoptetDOMCartContentLoaded, žádné zákaznické údaje nebo ceny. Pokud cache chybí, jeden GET nativního košíku dle původního odkazu stejného originu, timeout 5 s. Z response se čtou jen URL obrázků; skripty ani markup se nevkládají. Observer obnoví obrázky po nativní výměně rekapitulace bez dalšího GET. Zakázané úložiště, síťová chyba, chybějící obrázek zachovají původní funkční text. Existující nativní img se nepřepíše/neduplikuje. Chybný přidaný obrázek se odstraní bez nekonečné smyčky observeru.

Build a šest statických testů prošly, browserové regrese/audit/snapshots blokuje MachPortRendezvous (nejsou prošlé). In-app náhled prokázal 0 GET při normálním průchodu i po výměně rekapitulace, 1 GET při přímém vstupu/zakázaném úložišti, bezpečné selhání 503/404 bez opakování, zachované formuláře. Dvě varianty se stejným GUID a různým SKU mají odlišné správné obrázky, dlouhý název × 11 šířek 320–1920 bez přetékání a 48px obrázek. Původní pomocný diagnostický output přetékal dlouhou URL, opraven pouze v lokálním helperu (není změna šablony). Nasazeno d609375 na GitHub feature/responsive a SFTP, původní složka synchronizovaná, snippet pouze instalace 313980, živé CSS/JS HTTP 200 a shodné SHA256. Živě přidány vlastní produkty -6 a -17 do původně prázdného košíku. Oba správné různé obrázky se zobrazí v kroku 2, po EUR → CZK i v kroku 3; přímý vstup v nové kartě funguje. Krok 2: 11 šířek 320–1920, krok 3: 6 šířek, bez přetékání, oba načtené obrázky 48 × 48. Součet po dopravě/převodu je stále nativních 685 Kč / 566,11 bez DPH; ceny a formuláře se nemění. Běžný návrat cart → checkout kliknutím znovu ověřen. Testovací produkty nakonec odebrány, košík opět prázdný; žádné osobní údaje ani objednávka. Snímky outputs/checkout-summary-images-desktop-live.png, checkout-summary-images-mobile-live.png, checkout-summary-images-step3-live.png a měření checkout-summary-images-live-checks.json. Otázka chybějících obrázků je tím vyřešená. Změna se nevztahuje na nastavení Blank nebo settings-app.

---

# Objednávka krok 2 a společná hlavička 2/3 (Codex)

Figma 1645:8015, základ 3b3acc5, feature/responsive. Podrobnosti docs/objednavka-krok2.md. Nativní formuláře, inputy, label/for, data atributy a validace zachované; nový layout jen kroku 2 nad #checkoutContent/#checkoutSidebar/.radio-wrapper/.order-summary-item. Žádný nový fetch ani přepočet dopravy/platby. Nalezený nativní nedostatek (obsluha jen mousedown) řeší minimální js/checkout.js: change vybraného radia při neaktivním wrapperu předá stejné nativní obsluze, bez vlastních stavových tříd nebo cen; pointer aktivní wrapper podruhé nespouští. Hlavička nad původním topbarem a #header platí pro body.in-krok-1/in-krok-2 bez ohledu na variantu. EnhanceHeader zde nevytváří proxy účtu, rychlé odkazy ani katalog; mobilní sticky režim se v těchto krocích nepoužívá. Původní přihlášení a měna zůstávají nativní. Step 3 formuláře se neredesignují.

Sdílený tools/checkout přes Sass placeholder skládá součty a navigační akce prvního i druhého kroku jednou. Tools/radio styluje původní dvojici input/label, checked/disabled/inactive/focus a nativní js-error-field. Order-steps přidává přesný 20px order-check z Figmy pro dokončený krok. Ostatní ikony existující. Částky, DPH, dopravci, platební služby, loga a země jsou ze Shoptetu. Uživateli požádáno zapnutí kontaktů a obrázků: kontakt už server vrací, obrázky v rekapitulaci stále ne; vícejazyčný markup na instalaci zatím chybí. Žádné ukázkové fotky/loga/čísla se nevkládají.

Build a šest statických kontrol prošly. Dvě browserové regrese, audit i snapshots blokuje start Chromia (MachPortRendezvous), nejsou označené za prošlé. Kontroly v in-app náhledu: obě varianty × 11 šířek normální/dlouhý obsah, vysoká cena, disabled platba; opravené umístění telefonu × 22 geometrií bez přesahu; hlavička skutečného HTML kroku 3 při 6 šířkách × 2 variantách bez překryvu. Data outputs/checkout-step2-preview-checks.json (initial zachycuje i dřívější přechodové rozměry telefonu, opravený stav je phoneFixed). Před nasazením uloženo checkout-step2-before.png. Nativně před nasazením ověřeny volby adresa/převod → 295 Kč / 243,80 bez DPH a přechod na krok 3, bez vyplnění údajů nebo objednání.

Testovací košík byl na začátku prázdný; přidán vlastní produkt -6 za 200 Kč, po dokončení QA odebrán, košík opět prázdný. Nasazeno jako 543cefc + ea91d66 + ca7cdea na GitHub feature/responsive a SFTP; původní složka synchronizovaná, snippet pouze instalace 313980, CSS/JS HTTP 200 a shodné SHA256. Živě v1/v2 × 11 šířek 320–1920 bez přetékání/překryvů, telefon se vejde, žádná proxy účtu. Třetí krok: společná hlavička ověřena také s v2, mobilní přihlášení i desktopové přihlášení fungují. Návrat do prvního kroku obnoví původní hlavičku s hledáním a proxy; společné součty/CTA zůstávají správně na 390/1920 px. Platby kliknutím i mezerníkem 295 → 318 → 295 Kč, s DPH ze Shoptetu. EUR → CZK se vrátí na 295 Kč; EUR nemá nakonfigurované dopravy/platby. Zásilkovna otevře původní Packeta widget, zavřen bez výběru; bez pobočky se nepokračuje, ale viditelné nativní chybové hlášení nebylo zachyceno. Platná adresa/převod pokračují do kroku 3. Žádné osobní údaje se nezadávaly a žádná objednávka nevznikla. Snímky checkout-step2-desktop-live.png, checkout-step2-mobile-live.png a checkout-step3-header-{desktop,mobile}-live.png, měření checkout-step2-live-checks.json v outputs. Obrázky rekapitulace a vícejazyčný markup stále chybí; na zbývající dostupnost obrázků položena doplňující otázka. Blank nastavení/snapshot ani settings-app se nemění. Externí Claude Docs nejsou tímto zápisem upravené.

---

# První krok košíku (Codex) – Figma 1642:5563

Základ `3b44344`, větev feature/responsive. Zadání: pečlivě převést návrh, maximálně zachovat Disco a sdílet opakované prvky. Majitel upřesnil shrnutí: skutečné nativní cenové řádky, nikoli zástupný opakovaný text. Podrobnosti docs/kosik-krok1.md.

Cart.scss je layout nad nativní tabulkou a summary, bez DOM přesunů/kopií formulářů. Order-steps.scss styluje původní kroky společně pro celou objednávku. Množství zůstává ze společného quantity; remove button má jeden základ pro mini-košík/tabulku, checkbox box jeden zkompilovaný placeholder pro filtry/kupon. Nový návrh vyžaduje také slevovou lištu se stejným průběhem jako doprava, takže společný základ nově zahrnuje .extra.discount a lokální ikonu procent. Další nový asset je šipka kroků. Kurzorové ukázky Figmy nejsou runtime assety. Barvy/fonty z administrace a skutečné ceny/datum/limity z Shoptetu.

JS přidává pouze ARIA a paměť rozbalení/fokusu po nativním ShoptetDOMCartContentLoaded; nové vizuální třídy nevznikají. Formuláře, data-url, nativní submit a backend se nemění. Odkaz na související produkty je nově dostupný i na mobilu a klávesnicí. Testovací košík byl před úkolem prázdný; přidány dva testovací produkty -6 a -17 (200 + 390 Kč), po ověření byly odebrány (včetně dočasně přidaného souvisejícího -33). Žádná objednávka se neodesílá.

Build a 5 statických testů stylů prošly. Tři relevantní browserové regrese blokuje spuštění Chromia, nejsou označené za prošlé. In-app náhled: 22 rozložení 320–1920 px včetně otevření/kuponu bez přetékání, zarovnané kroky a dostupné akce; devět šířek s dlouhými názvy a vysokou cenou, bez přetékání. Dvojí inicializace zachovala původních 13 formulářů a 44 vstupů. Živě ověřeno: opakované nativní přepočty 590 → 790 → 990 → 790 → 590 Kč se zachováním rozbalení a fokusu, související -33 přidán (980 Kč) a odebrán (590 Kč), neplatný kupon i upozornění na neuplatněný kód, přechod na dopravu/platbu a návrat. Společné kroky i tam mají 72 px. Živých 11 šířek 320–1920 px bez přetékání a se zarovnanými kroky; ověřen sdílený křížek mini-košíku na obou zařízeních a 22px checkbox filtrů. Testovací košík nakonec prázdný; žádná objednávka nevznikla. Platný kupon, další cenové řádky a slevová motivace nejsou na této instalaci k dispozici, nejsou označené za živě ověřené. Nasazeno jako bc6e4a7 + oprava opakovaného fokusu c8d1c2b na GitHub feature/responsive a SFTP, původní složka synchronizovaná. Snippet pouze instalace 313980, živé CSS/JS HTTP 200 a shodné SHA256. Snímky outputs/cart-step1-desktop-live.png, cart-step1-mobile-live.png; měření cart-step1-live-checks.json. Blank nastavení a snapshot se nemění; nejde o dokončenou migraci. Externí Claude Docs nejsou tímto zápisem upravené.

---

# Oprava (Codex): společná doprava zdarma

Základ `f86cf86`, větev feature/responsive. Majitel upozornil, že vzhled správný v mini-košíku chybí v prvním kroku a pravděpodobně v mezikroku. Příčina: pravidla byla omezená na #cart-widget. Přesunutá do jediné globální komponenty _free-shipping.scss nad nativními .cart-free-shipping / .extra.delivery; cart-widget řeší jen pořadí/flex. Stejný vzhled včetně dokončeného stavu funguje i v možnostech dopravy detailu. Text, částky a inline procento zůstávají Shoptetu. Bez změny JS/DOM/tříd; slevové lišty se nepřebarvují.

Podrobnosti: docs/doprava-zdarma.md, mapa docs/komponenty.md. Skutečné HTML z testovacího obchodu a oficiálního dema (tam potvrzená .advanced-order včetně slevové motivace). Testovací obchod nyní ukazuje jen krátké oznámení, mezikrok nebyl v administraci zapínán. Demo košík po testu vrácen prázdný. Vlastní testovací košík byl před testem prázdný; přidán 1 produkt za 200 Kč kvůli skutečné kontrole, po testu byl opět prázdný.

Build a 4 statické testy stylů prošly; browserovou regresi blokuje start Chromia. In-app náhled nativních markupů: 24 kombinací (čtyři kontexty × šest šířek), shodné fonty/barvy/ikona/4px výška/zaoblení, skutečné procento zachované, žádné přetékání; plný stav má 4px čáru a další slevová motivace zůstává 16 px. Přidaná statická regrese brání návratu ke scope #cart-widget. Vizuální podklady outputs/free-shipping-popup-fixture.png a free-shipping-fixture-checks.json. Snapshot Disca a Blank nastavení beze změny, není tvrzena dokončená migrace bez podkladu. Externí Claude Docs tímto zápisem nejsou upravené. Nasazeno jako `2a8fd8a` na GitHub feature/responsive a SFTP, snippet pouze instalace 313980; původní složka synchronizovaná. Živé CSS HTTP 200 a shodné SHA256. Skutečný první krok při 320/390/767/768/992/1920 px: stejný 4px průběh, text 14 px / 1.2, původní procento 16,680567 %, bez přetékání. Nativní změna množství 1 → 7 zobrazila potvrzení dopravy zdarma a plnou 4px čáru; stejné potvrzení ověřeno v mobilním mini-košíku. Zpět 7 → 1 vrátilo původní částku 999 Kč a procento. Ověřený mobilní i desktopový mini-košík a skutečný dialog Možnosti doručení (také 4px). Testovací položka nakonec odebrána, ověřen původní prázdný košík; žádná objednávka nevznikla. Snímky outputs/free-shipping-step1-live.png a free-shipping-widget-live.png, měření free-shipping-live-checks.json.

---

# Patička (Codex): nativní bloky Disca podle Figmy

Základ `519e242`, větev feature/responsive. Zadání: patička z Figmy 1633:7416 mimo hotový pás recenzí. Majitel potvrdil nativní správu Instagramu, plateb, Blogu a Facebooku a zobrazení po jejich naplnění. Dokumentace a známé limity: docs/paticka.md.

Styly v components/_footer.scss využívají původní #footer/.custom-footer, contact-box, subscribe-form, menu, widgety a podpis. Nový footer.js doplňuje jen text podpory, výchozí popisky a dekoraci; nezmění vlastní nadpis newsletteru. Původní sociální li a případný platební blok přesune do nového spodního obalu (důvod předem vysvětlen majiteli), bez kopií. Formulář, inputy ani kontaktní box se nepřesouvají. Zachované souhlasy, CAPTCHA, validace, URL i hodnoty polí. Obálka/telefon jsou existující ikony, tři sociální SVG z Figmy přes stávající masky; button.primary sdílí základ a velikosti tlačítek. Nativní Blog/O nás/Facebook ověřeny na oficiálním demu Disca. Instagram a platby na této instalaci zatím nemají obsah, živá integrace zůstává k ověření po naplnění.

Ověření: build a 3 statické kontroly stylů prošly; 2 nové browserové testy a audit blokuje start Chromia, nikoli aserce. In-app izolovaná nativní patička: 33 geometrií 320–1920 px, CAPTCHA / bez CAPTCHA / dlouhý e-mail, bez přetékání, stejné původní formuláře, pole, odkazy a rozepsané hodnoty po dvou inicializacích. Lokální Blank náhled skutečného Shoptetu: prázdné odeslání zachytí původní validace, zaměří e-mail a vypíše chyby e-mailu/CAPTCHA. Bez odeslání odběru a bez řešení CAPTCHA. Vendor snapshot a nastavení Blank se nemění; nejde o dokončenou migraci bez podkladu. Externí Claude Docs tímto zápisem nejsou upravené. Nasazeno jako `beb83e5` na GitHub feature/responsive a SFTP, snippet pouze instalace 313980; původní složka synchronizovaná. Živé CSS/JS HTTP 200 a SHA256 shodné s buildem. Na kategorii 320/390/767/768/992/1200/1920 px správné rozložení, jeden formulář, tři původní sociální odkazy a nulové přetékání. Detail při 390/1920 px také bez přetékání a s jediným formulářem/obalem. Nativní stránka košíku #footer vůbec nevypisuje, žádná patička se tam nevytváří. Snímky outputs/footer-desktop-live.png a footer-mobile-live.png, měření footer-live-checks.json. Panel bez CAPTCHA má na 1920 px 304 px jako návrh, s CAPTCHA je přirozeně vyšší.

---

# Oprava (Codex): spodní popis kategorie na mobilu

Základ `7136fef`, větev feature/responsive. Regrese z aktivních filtrů: produkty a stránkování dostaly order:4, ale nativní .category__secondDescription zůstala na order:3, a proto předběhla produkty i bez vybraného filtru. Žádný přesun popisu nebyl zadán. Mobilní layout nyní dává společné order:4 všemu běžnému obsahu a zachovává jeho nativní DOM pořadí; před něj posouvá pouze #filters-wrapper (1), .active-filters (2) a #category-header (3). Odstraněné duplicitní pořadí v _active-filters.scss. Bez změny JS, HTML, desktopu nebo nastavení administrace.

Ověření: build a 3 statické testy stylů prošly; nový regresní test zahrnuje spodní popis za produkty i stránkováním, s/bez aktivních štítků při 320/390/767/768/1920 px. Chromium se v sandboxu nespustí (MachPortRendezvous), takže browserový test ani audit nejsou označené za prošlé. Stejné pořadí nad skutečným HTML ověřené in-app prohlížečem v lokálním Blank náhledu při uvedených pěti šířkách a se dvěma aktivními filtry na mobilu; popis je pod stránkováním. Nasazeno jako `4b7a97a` na GitHub feature/responsive a SFTP, snippet pouze instalace 313980, původní složka synchronizovaná. Živý e-shop při 320/390/767/768/1920 px: popis pod produkty i stránkováním a nulové vodorovné přetékání. Se stock+Novinka na mobilu dva štítky nad řazením a spodní popis stále pod produkty. Snímek outputs/category-bottom-description-mobile-live.png. Nastavení Blank a server settings-app beze změny.

---

# Úprava (Codex): jeden společný CSS základ štítků a nativní třídy

Základ `13f1ca9`, větev feature/responsive. Majitel požaduje sdílení také ve výsledném CSS a maximální využití tříd Disca. Původní tools/tag.base sdílel zdroj SCSS, ale při každém include kopíroval deklarace. Nyní veřejné mixiny používají interní Sass placeholder: sestaví se jediné společné pravidlo pro původní searchWhisperer__additionalResults__link a .active-filters .input, stejně tak hover/focus. Varianta s křížkem řeší pouze rozdílné vykreslení tlačítka a ikonu.

Odstraněné vlastní třídy as-active-filters a as-active-filters__clear a jejich přidávání přes JS. Rozložení se styluje přes nativní .active-filters/.input a původní p#clear-filters (mobilní kopie bez duplicitního ID). JS ponechává jen nativní třídy nových ovladačů, stavové datové atributy, aria a doplnění chybějícího přehledu do požadovaných dvou umístění. Filtrovací funkce, data-url a formuláře beze změny. Samostatný _active-filters.scss zůstává souborem rozložení; nevytváří vlastní vzhled štítku.

Build: CSS 170001 → 169616 B (gzip 24769 → 24754 B), JS 48846 → 48653 B (gzip 14761 → 14713 B). Úspora je malá, hlavní přínos je jeden zdroj i jedno výsledné pravidlo a méně závislostí na vlastních třídách. Doplněná statická regrese nad dist CSS, browserová regrese požaduje pouze nativní class=active-filters/input. Návod docs/active-filters.md aktualizovaný.

Ověření: build a 3 statické testy stylů včetně nového testu nad sestaveným CSS prošly. Audit nadále blokuje start Chromia (MachPortRendezvous), browserové regrese nejsou označené za prošlé. In-app prohlížeč bez nativního CSS: přehledy mají pouze class=active-filters, tlačítka class=input a clear odstavec žádnou vlastní třídu; 3 → 4 při odebrání stock, clear → 13, mobilní panel zůstává otevřený, bez přetékání. Osm vlastností našeptávače a filtrů je znovu shodných, tentokrát i s aktuálním písmem Mulish z administrace. Nasazeno jako `2239e0a` na GitHub feature/responsive a SFTP, původní složka aktualizovaná, snippet pouze instalace 313980. CSS/JS HTTP 200 a shodné SHA256. Živá kontrola potvrdila pouze nativní class=active-filters/input a clear odstavec bez vlastní třídy, funkční jednotlivé odebrání i clear → 13 bez zavření mobilního panelu, nulové přetékání. Detail outputs/shared-tag-native-classes-live.png. Vzhled beze změny, server settings-app ani nastavení Blank se nemění.

---

# Aktualizace (Codex): aktivní filtry jako štítky s křížkem

Základ `608d2b0`, větev feature/responsive. Figma desktop 1633:7414 a mobil 1633:10605; majitel výslovně doplnil mobilní přehled **v panelu i nad řazením**. Podrobnosti a návod pro obchodníka: docs/active-filters.md.

Společný tools/_tag.scss vychází z původního štítku našeptávače beze změny jeho vzhledu. Filtry přidávají close 16 px; clear link close 20 px používá stejnou existující ikonu. Nativní šablona na testovacím e-shopu nevypisuje přehled ani clear HTML, ale obsluha .active-filters .input a p#clear-filters a v main-3g existuje. Doplňujeme tyto ovladače nad původní inputy a využíváme nativní makeFilterAjaxRequest, žádný vlastní fetch ani kopie/přesuny formulářů. Mobilní clear kopie používá stejnou nativní funkci/událost bez duplicitního ID. Názvy/ceny/URL jsou skutečné, číselné badge z labelu se do štítku nekopírují. Při AJAXu se obnoví oba přehledy a fokus; po vymazání všech zmizí. Zachová se řazení a mobilní panel zůstane otevřený.

Ověření: build, 24 settings-app + 2 styles testy prošly. Audit blokuje start Chromia (MachPortRendezvous), browserové regrese nejsou potvrzené. V in-app prohlížeči s nativním JS a bez nativního CSS ověřeno samostatné odebrání (stock+Novinka 3 → Novinka 4), clear → 13, cenový rozsah 301–390 → 12, jeho odebrání a vymazání všech se zachováním Nejlevnější, otevření panelu a fokusu. Shodných 8 vizuálních vlastností našeptávače/filtrů (outputs/active-filter-tag-parity.json). Šířky 320–1920 bez přetékání, dlouhý název ve fixture se vejde do 268px obsahu 300px panelu. Testovací data nemají další skutečné parametrické skupiny, ty zůstávají limitem živého ověření.

Při kontrole opraven lokální preview: přepis itemprop=item breadcrumb meta pro nativní pushState, aby po clear nezůstala stará query v historii. Nový Node regresní test. V HTML fixtures escapované </style v SVG data URL kompatibilního CSS (jinak předčasně ukončovalo inline style a část stylů se nenačetla); vendor snapshot nezměněný. Audit/snímky a browserové regrese doplněné o aktivní filtry. Server settings-app se nemění, restart není potřeba. Externí Claude Docs neupravované.

Nasazeno jako `c8e04a5` na GitHub feature/responsive, původní složka /Users/apple/aSteroid aktualizovaná, build nahrán na SFTP a snippet pouze instalace 313980. styleMode zůstává blank, globální serverový Blank mode nezměněný; živý e-shop stále obsahuje dvě nativní CSS. HTTP 200 a shodné SHA256 CSS/JS. Živě ověřeno: desktopové odebrání stock+Novinka 3 → Novinka 4; mobilní tap přímo na křížek 3 → 4 s oběma přehledy ve shodě a otevřeným panelem; clear → 13 bez štítků; cena 301–390 → 12 a její zrušení → 13. Ikony, odstupy, link bez nativních verzálek/červeného glyfu a žádné přetékání. Snímky outputs/active-filters-desktop-live.png, active-filters-mobile-panel-live.png a active-filters-mobile-listing-live.png. Nastavení serveru se neměnilo, restart není potřeba.

---

# Oprava (Codex): mobilní čára pod záložkami řazení

Základ `d57aee3`, větev feature/responsive. Majitel upozornil na mezeru pod mobilními záložkami. Příčinou byl padding-bottom:16px na #category-header. Mobilní padding změněn na 0, společná čára nyní lícuje s podtržením aktivní záložky. Žádný nový DOM/JS, nativní řazení a desktopové styly zachované.

Ověření: build a 2 testy registrace stylů prošly; audit opět blokuje start Chromia (MachPortRendezvous), nikoli aserce. In-app prohlížeč nad skutečným Shoptetem bez nativního CSS: 320/390/767/1920 px, rozdíl spodní hrany aktivní záložky a lišty 0 px, bez přetékání. Kontrola při 768 px zachovává dosavadní víceřádkové desktopové řazení. Nasazeno jako `1d11ff6` na GitHub a SFTP, snippet pouze instalace 313980, nastavení Blank beze změny. HTTP 200 + shodné SHA256 CSS. Živý e-shop při 390 px: padding 0 px, rozdíl hran 0 px, nulové přetékání. Nativní AJAX přepnutí na Nejlevnější zachovává návaznost čáry (0 px). Snímek outputs/mobile-sorting-line-live.png.

---

# Oprava (Codex): chování mobilního košíku a filtrů sjednocené s menu

Zadání majitele: automaticky domýšlet související UX, zejména animované vyjetí a zavření tapnutím na tmavý overlay. Základ `c78eeac`, větev `feature/responsive`.

- Sdílené motion/revealed v tools/_drawer.scss: transform doprava, 250 ms ease stejně jako menu, animace i při zavírání, opožděné visibility místo display:none. Respektuje reduced-motion. Zavřený obsah inert + pointer-events:none, desktop bez této změny.
- Sdílený js/drawer.js zachytává tap/click mimo panel v capture fázi před případným zastavením události Shoptetem. Nezavře při akci uvnitř, nepustí klik do podkladové stránky. Košík zavírá původní hideContentWindows, filtry původní data-unveil. Stav a fokus se obnoví, aria-expanded košíku sleduje i nativní zavírání.
- Mobilní filtry zachovávají otevření při AJAXu; návrat z desktopu sám dialog neotevře. Žádná náhrada košíkového/filtrovacího API ani přesuny původního DOM.
- AGENTS.md nově výslovně požaduje sjednocovat chování příbuzných panelů a ověřovat zavřený stav/opakování/AJAX, nejen snímek otevřeného panelu. Návody v docs/cart-widget.md a docs/kategorie.md, externí Claude Docs neupravované.

Kontroly: build, 23 settings-app + 2 styles testy prošly. Audit nadále blokuje start Chromia (MachPortRendezvous / permission denied), browserové regresní testy nejsou označené za prošlé. Rozšířená fixture má stub nativního hideContentWindows; nová kontrola testuje capture i při zastaveném bublání, obě animace, opakování, inert/fokus a reduced-motion. V in-app prohlížeči nad skutečným Shoptetem bez nativního CSS ověřeno: oba panely při otevření začínají posunem 300 px, po dojetí 0; po tapnutí se stav zavře okamžitě, animace doběhne do 300 px a visibility:hidden. Filtr stock 13 → 11 zachová otevřený panel bez duplicit. Zavřené panely inert, nulové přetékání, nativní body scroll-lock.

Nasazeno jako `85b514c` na GitHub feature/responsive a SFTP; snippet zapsán pouze instalaci 313980 se zachovaným styleMode:blank. HTTP 200 + shodné SHA256 pro CSS/JS. Živý e-shop se dvěma nativními CSS: košík při vyjíždění změřen na translateX(294,276 px), po dojetí 0; tap na overlay zavře stav, vrátí fokus a aria-expanded:false, po dojetí translateX(300 px)/visibility:hidden/inert. Totéž ověřeno pro filtry včetně stock 13 → 11 po AJAXu. Při změně šířky 390 → 1920 → 390 se obnoví desktopový sidebar/redirect a po návratu je dialog zavřený, bez přetékání. Snímek outputs/mobile-drawer-behavior-live.png. Nastavení serveru ani globální Blank mode se nemění.

---

# Aktualizace (Codex): mobilní kategorie podle Figmy

Navazuje na `d3d3594`, větev `feature/responsive`. Majitel potvrdil ořez podkategorií na **4,5 řádku** podle 1633:10268. Podrobnosti, návod pro obchodníka, ověření a limity: `docs/kategorie.md`.

- Popis 95 px + Číst více, které odhalí také přiřazené články. Krátký popis bez článků se zbytečně nesbaluje. Obnovuje se po AJAXu i po asynchronním načtení článků, funguje ve variantách s obrázkem/barevným pruhem.
- Podkategorie 2 sloupce, karty 58 px / obrázek 40 px / mezera 8 px, ořez 308 px, rozbalení původních položek bez kopírování. Nejprodávanější: jedna celá mobilní karta a šipky u nadpisu.
- Posuvné záložky řazení z původních tlačítek/data-url. Filtry před řazením; nativní obsah ve 300px pravém panelu, zavření křížkem/Escape/pozadím, klávesnice a návrat fokusu. Checkboxy, slider, formuláře a AJAX dál řídí Shoptet.
- Přidaná pouze ovládací tlačítka, hlavička panelu a stavové atributy; seznamy ani formuláře se nepřesouvají. Nativní přesun filtrů provádí detectFilters(). Sdílený Sass drawer využívá i košík; ikona tune je z Figmy, ostatní ze stávající sady.

Ověření: build, 23 settings-app + 2 styles testy prošly. Automatický audit/browserové testy blokuje start Chromia v sandboxu (MachPortRendezvous); nejsou potvrzené jako prošlé. Náhradní přímé ověření v in-app prohlížeči: bez nativního CSS stock 13 → 11, řazení, AJAX zachová panel bez duplikací, zavření a klávesnice. Šířky 320/390/767/768/992/1920 bez přetékání, návrat desktopového sidebaru. 12 položek a články z regresní fixture: ořez 308 px, pátý řádek na 280 px, rozbaleno 404 px, stále 12 položek; skutečné Šperky se 4 položkami bez nadbytečného tlačítka. Další parametrické skupiny na testovacím e-shopu chybějí. Snapshot Disca se neprořezával; migrace celého CSS není dokončená. Externí Claude Docs není upravená.

Nasazení implementace `489356d`: GitHub feature/responsive, původní checkout aktualizovaný, SFTP soubory a snippet pouze instalace 313980. HTTP 200 a shodné SHA256 pro CSS/JS/category-image-wide. styleMode zůstává blank, server stále načítá i dvě nativní CSS Disca. Živá kontrola: panel 300 × 844 při 390 px, popis 95 px, stock 13 → 11, zavření klepnutím na křížek a rozbalení popisu. Košík klepnutím otevře 300px panel bez navigace; po zvětšení obnoví data-redirect a 580px desktopové okno bez mobilní hlavičky. Nulové přetékání. Důkaz outputs/category-mobile-filters-live.png. Následná drobná oprava drží tlačítko Číst více před články i při pozdním načtení dat; ověřeno na dlouhém popisu v regresní fixture (95 → 285,6 px, články se odhalí s mezerou 32 px od tlačítka). Restart settings-app není potřeba, server se nemění.

---

# Aktualizace (Codex): mobilní panel košíku podle 1631:7130

Navazuje na `1bbebe7`, větev `feature/responsive`. Mobil má pravý 300px panel přes 100dvh, 48px hlavičku se zavřením, dvouřádkové produkty a spodní pevné pokračování + skutečnou informaci o dopravě zdarma. Sdílené mixiny tlačítek a množství zůstávají stejné jako na desktopu. Podrobnosti a návod pro obchodníka: `docs/cart-widget.md`.

Původní Shoptet desktopové/mobilní přepínače měly data-redirect=true. Na mobilu ho nyní dočasně odstraňujeme, takže nativní click/Enter otevře stávající popup; desktopový atribut se obnoví. Žádná nová košíková logika. Nová hlavička s tlačítkem používá nativní hide-content-windows; observer ji idempotentně obnovuje po AJAX. Mobilní breakpointy řídí jen umístění a rozložení. Nová ikona local-shipping je z Figmy; produktová data a obrázky zůstávají živé.

Majitel zapnul nativní informace o dopravě zdarma; nyní server dodává cart-free-shipping s potvrzením dosažení hranice. Nepřebíráme pevnou částku 193 Kč z návrhu ani 700 Kč z banneru. Nativní procenta progress baru se zachovávají.

Lokální měření potvrdilo panel x=90 při 390 px / x=20 při 320 px, šířku 300 px, hlavičku 48 px, zachovaný footer na dolním okraji a nativní zavření s návratem fokusu. Nová regresní kontrola dlouhého seznamu je v layout.spec.cjs, původní testovací stub zná i hide-content-windows. Browserové testy stále blokuje sandbox (MachPortRendezvous), nejsou označené za prošlé. Živé ověření po nasazení potvrdilo nativní množství 1 → 2, odebrání do prázdného stavu, jedinou hlavičku a kontakt; testovací produkt byl následně odebrán. Snímek původního veřejného markupu slouží jen k lokálnímu náhledu; skryté hodnoty z něj byly odstraněné.

Nasazeno a na GitHubu jako `d3d3594`. Ověřená skutečná informace dopravy: limit 1199 Kč, při košíku 200 Kč zbývá 999 Kč, progress 16,68 %, footer 144,6 px. Hodnoty pocházejí ze Shoptetu; nejsou v kódu. Snímek outputs/mobile-cart-live.png. Mobilní kategorie navazuje následujícím celkem.

---

# Aktualizace (Codex): kategorie – sidebar, filtry, řazení a stránkování

Zadání majitele: implementovat návrh Figma `1631:7129` (řazení v sousední vrstvě `1631:6967`) nad původním Discem. Základ `00bef19`, větev `feature/responsive`. Podrobný popis v `docs/kategorie.md` (včetně návodu pro obchodníka).

- Vlastní SCSS výpisu: sidebar 262 px / mezera 22 px, 2–4 sloupce produktů podle šířky, řazení záložkami na desktopu a dropdown na mobilu, spodní ovládání 48 px. Karty produktů používají dosavadní variantu.
- Filtry mají karty 12 px, checkboxy 22 px se sdíleným mixinem, pilulky počtů a původní jQuery UI slider s úchyty 24 px. Barvy a font z administrace, ne natvrdo z Figmy.
- Původní HTML formulářů, inputy/data-url, řazení i stránkování zůstávají. Nový JS doplňuje pouze nadpis štítků, sbalení sekcí a mobilní spouštěč přes nativní data-unveil. Pamatuje stav při AJAXu. Žádné vlastní filtrovací API ani přesun inputů/slideru; mobilní přesun provádí detectFilters() Shoptetu.
- Při diagnostice byl v aside nejprve jen prázdný box-categories, i #filters-wrapper byl prázdný. Po změně nastavení majitelem server začal vracet skutečný box-filters (cena + příznaky). Nebyla to CSS/JS chyba aSteroidu.
- Doplněné regresní testy a veřejná fixture filtrů, audit/snímky pro výpis. Opravené pořadí kompatibilního CSS v obecné testovací fixture (podklad před asteroid.css). Lokální proxy podporuje veřejný nativní POST dočtení produktů dvou testovacích kategorií, nezpřístupňuje objednávkové formuláře.

Ověření: build a integrita vendor souborů; 23 testů settings-app + 2 testy registrace stylů prošly. Browserová sada včetně nových regresních testů zde není potvrzená: Chromium blokuje sandbox při startu (MachPortRendezvous / permission denied), selhání není výsledkem asercí. V in-app prohlížeči nad skutečným Shoptetem bez nativního CSS ověřeno: stock 13 → 11, cena klávesnicí 300 → 301 Kč / 13 → 12, řazení, stránka 2 se 4 produkty, dočtení 9 → 13, sbalení po AJAXu, mobilní otevření/aria a změny šířky 320–1920 px (9 šířek, nulové přetékání). Stejný vzhled 24 měřených prvků s původním CSS i bez něj při 1920 a 390 px. Důkazy: pracovní outputs/category-filters-*, category-native-blank-parity.json.

Limity: další parametrické skupiny/obrázkové volby a „Zobrazit vše“ nejsou v datech testovací kategorie, je nutné je ověřit po doplnění dat. Zachovaný existující kontejner obsahu, jeho fonty a nastavení; odlišné produkty/texty a hlavní barva podle administrace jsou záměrně dynamické. Snapshot se neprořezával; nejde o dokončení migrace celého CSS.

Nasazení: implementace `aa32d0a` je na GitHubu. Původní checkout `/Users/apple/aSteroid` aktualizovaný, build nahrán přes SFTP a hlavička zapsána pouze testovací instalaci 313980 se zachovaným `styleMode: blank`. HTTP kontrola CSS a JS: 200 a shodné SHA256. Živá kontrola potvrdila 262px sidebar, čtyři sloupce, dva ovladače sekcí a funkční mobilní Filtry/aria bez přetékání. E-shop stále načítá také dvě původní main/font CSS Disca; skutečný serverový přepínač nebyl měněn. Shoda bez těchto stylů byla ověřena v lokálním náhledu. Snímky nasazení: outputs/category-live-desktop.png, category-live-mobile.png. Restart settings-app není potřeba (serverový kód se neměnil).

---

# Rozhodnutí majitele: vlastní CSS při zachování vzhledu 1:1

Navazuje na `7b9521c`, větev `feature/responsive`. Majitel potvrdil zapnutí volby Blank základu v aSteroidu a upřesnil dlouhodobý cíl: **postupně převzít CSS Disca do vlastních udržovatelných SCSS komponent aSteroidu tak, aby vypnutí výchozího CSS Shoptetu nezměnilo současný vzhled ani chování.**

- Snapshot není konečné řešení. Po komponentách doplnit vlastní styly, ověřit je bez nativního CSS i bez odpovídajících pravidel snapshotu a až potom zmenšovat aktivní kompatibilní podklad.
- Používat dosavadní architekturu Claude, společné mixiny, nativní HTML/třídy/události a JavaScript Shoptetu. Zachovat stejný vzhled jednotlivých prvků napříč zařízeními.
- Kompletní zadání, pořadí práce, podmínky dokončení a evidence jsou v `docs/blank-mode.md`. Pokyn je také v `AGENTS.md`; nový `CLAUDE.md` odkazuje Claude přímo na tato pravidla.
- První krok: referenční pokrytí plného/AJAX košíku a objednávkových stavů, potom inventura CSS závislostí. Převod snapshotu zatím nezačal. Vypnutí původního CSS v Shoptetu majitel dosud výslovně nepotvrdil.

Tento commit mění pouze dokumentaci a pokyny. Kontrola: `git diff --check`; build ani vizuální testy nejsou pro tuto změnu potřeba. Dokument je předání pro Claude; nejde o potvrzení, že ho již přečetl.

---

# Aktualizace (Codex): příprava CSS-only Blank mode

Majitel schválil kompatibilní verzovaný základ z Disca s následným čištěním. Základ této změny: `0bc49d6`, větev `feature/responsive`.

- Nový `styleMode` (`disco` / `blank`) v nastavení. Výchozí instalace zůstávají v dosavadním režimu. Ukládání ze staršího formuláře zachová volbu.
- `base-blank.css` obsahuje snapshot nativního CSS Disca 13 a fontu ikon, načítá se před `asteroid.css`. SHA256 a zdrojové URL jsou v manifestu. Fonty se sestavují a nasazují lokálně.
- Zachováno původní HTML, selektory i JS Disca. Žádná nová náhrada menu, košíku ani formulářů. Režim nepokrývá vypnutí JS ani přechod na Classic.
- Přepínač CSS v administraci Shoptetu se tímto kódem sám nemění. Nejdřív zvolit Blank základ v aSteroidu a uložit, potom vypnout pouze CSS. Při návratu opačné pořadí.
- Dokumentace a návod pro obchodníka: `docs/blank-mode.md`; externí Claude Docs příručka nebyla změněna.

Ověření: build a kontrola integrity vendor souborů, 22 testů settings-app a 2 testy stylů prošly. Lokální veřejný náhled nad skutečným Shoptetem (`npm run preview:blank`) porovnal 11 typů stránek při 1920 a 390 px s/bez nativního CSS, bez horizontálního přetékání. Ověřeno otevření mobilního menu se 4 rychlými odkazy a nativní změna množství 1 → 2 → 1. Snímky a měření jsou v pracovních výstupech Codexu (`outputs/blank-*`). Sandbox blokuje start Chromia pro plný audit/snímky; kontrola proto proběhla v in-app prohlížeči. Plný košík, AJAX košík a kroky objednávky po skutečné aktivaci zbývají; lokální proxy nepovoluje POST. Žádná objednávka nebyla odeslána.

Nasazení: implementace `53db7b5` je na GitHubu. Původní checkout `/Users/apple/aSteroid` aktualizovaný; build nahrán přes SFTP. Hlavička aktualizována pouze u testovací instalace 313980, režim zůstává `disco`. HTTP kontrola CSS, JS i obou fontů vrátila 200 a shodné SHA256. Server settings-app potřebuje restart, aby zobrazil nový přepínač (v původním terminálu Ctrl+C, potom `npm run settings`). Globální CSS Disca nebylo vypnuto.

---

# Aktualizace (Codex): opravy z revize a převzetí vývoje

Základ: `34b7cfb` na `feature/responsive` (včetně poslední změny šířky obsahu od Claude).

- Obnova článků po dokončení API čte aktuální přiřazení z úložiště; souběžné uložení tak nepřepíše starým veřejným výstupem.
- Minutová pauza po chybě API platí i bez první cache. Bez posledních dat veřejný endpoint vrací 503, no-store a Retry-After: 60.
- Recenze i data článkových karet po HTTP 404 na `/cache/` zkusí původní adresu.
- Vložený kód předává `styleVersions` pro všechny soubory variant. Náhled používá hash svého CSS; starší snippet bez mapy obchází cache časovou verzí.
- Testovací příkaz settings-app používá explicitní glob souborů (funguje i na Node 24).

Ověření: build; 17 testů settings-app (nově souběh ukládání a obnovy, opakování po výpadku bez cache, záložní URL po 404 a změna verze po CSS-only úpravě); 2 testy stylů. Vzhled a markup Disca se nemění, žádné nové DOM komponenty. Integrace zachovává dosavadní zdroje dat a události.

Nasazení: soubory theme nahrány přes SFTP, hlavička aktualizována jen pro testovací instalaci 313980. HTTP ověření potvrdilo mapu styleVersions a binární shodu živého asteroid.js s buildem (SHA256 432c4b1c0132). Původní checkout /Users/apple/aSteroid je aktualizovaný. **Server settings-app stále běží jako původní proces: sandbox odmítl jeho ukončení (Operation not permitted). Serverové opravy se aktivují po restartu v původním terminálu: Ctrl+C, potom npm run settings z kořene repozitáře.** Nedokončený restart není dokončené nasazení serverové části.

---

# Aktualizace (Claude): stejná šířka obsahu na všech stránkách

**Zadání majitele:** všechny stránky mají mít stejnou šířku obsahu jako úvodní stránka. Schválil návrh s omezením šířky běžného textu.

**Příčina:** Disco přidává obalu obsahu (`#content-wrapper`) na textových stránkách, ve výpisu a detailu článku, na přihlášení a registraci `.container-narrow`. Od 1440 px tím obsah zúží z 1418 na 1178 px. Pod 1440 px jsou obě třídy stejné.

**Řešení** (`layout/_content-width.scss`):
- `#content-wrapper.container-narrow` má šířky `.container` Disca (747 / 972 / 1178 / 1418 px);
- čitelnost: odstavce, seznamy, citace v detailu článku (`.news-item-detail .text`) a na textových stránkách (`.pageArticleDetail [itemprop="about"]`) max. 820 px; odstavec s obrázkem, videem nebo tabulkou přes celou šířku. Nadpisy a výpisy přes celou šířku.

**Ověření**
- Testy: nový `content-width.spec.cjs` (1920, 1440: šířka jako úvodní stránka, text 820 px, odstavec s obrázkem plný; 1200 a 390 beze změny).
- Snímky: nové oblasti `#content` pro výpis článků, detail článku, obchodní podmínky a registraci.
- Dokumentace: docs/vyvoj.md, komponenty.md (příručky pro obchodníka se netýká, nemá žádné nastavení).

---

# Aktualizace (Claude): karta článku – datum na úvodní stránce, „Číst článek“

**Zadání majitele:** aktualizovaný návrh „Article“ (1627:5345) přidává „Číst článek“ se šipkou; na e-shopu chybí datum zveřejnění.

**Příčina:** Shoptet do sekce článků na úvodní stránce datum nevypisuje (jen do výpisu rubriky). RSS e-shop nemá.

**Řešení**
- `js/article-cards.js` (nový):
  - **úvodní stránka:** datum z výpisu rubriky přes `/cache/<rubrika>/` (jedno stažení na rubriku), článek mimo první stránku výpisu z detailu (`meta article:published_time`). Stahuje se až u sekce článků, uloží se do `localStorage` na 12 h, prázdný `<time>` drží místo (žádný posun);
  - **výpis rubriky:** přidá odkaz `a.read-article` (Disco ho tam nemá);
  - datum všude jednotně „10. 12. 2023“, `datetime` ve tvaru yyyy-mm-dd.
- `_article-card.scss`: „Číst článek“ 16 px / 500, hlavní barva, podtržené, šipka 16 px (dřív skryté); datum v obou markupech.

**Ověření**
- Testy: `article-card.spec.cjs` 6 prošlo (nové: datum z výpisu i z detailu, uložení, odkaz ve výpisu).
- E-shop: úvodní stránka 3× „24. 10. 2026“ jedním stažením `/cache/rubriky/nase-novinky/`, výpis rubriky s odkazy. Posun stránky způsobený kartou: 0.
- **Nález:** CLS úvodní stránky 0,085 způsobuje carousel bannerů (posun o 1 px při načtení), ne články.

---

# Aktualizace (Claude): karta článku podle Figmy

**Zadání majitele:** vzhled článku podle Figmy „Article“ (1627:5345) všude, kde se objevuje karta článku.

**Kde Disco kartu vypisuje** (ověřeno na e-shopu): sekce nových článků na úvodní stránce (`.homepage-blog-wrapper .news-item`, odkaz přes celou kartu, bez data, s „Číst článek“) a výpis rubriky (`.news-wrapper article.news-item`, s `<time>`). Patička má jen textový seznam článků, hledání karty nevypisuje.

**Řešení** (`components/_article-card.scss`, jedna komponenta pro oba markupy):
- obrázek 3 : 2 se zaoblením 8 px (`object-fit: cover`), mezera k nadpisu 20 px;
- nadpis H4, datum 12 px s novou ikonou `calendar-today` (z Figmy), perex 16 px / 1,7, rozestupy 12 px; „Číst článek“ skryté;
- mřížka: telefon 1 sloupec, od 768 px 2, od 1200 px 3, mezera 20 / 40 px;
- sekce na úvodní stránce přes šířku obsahu (Disco `.container-narrow` 1178 px);
- zrušen záporný okraj Disca (−44 px), za úvodním textem 72 px jako mezi ostatními sekcemi (desktop i telefon).

**Ověření**
- Testy: nový `article-card.spec.cjs` (oba markupy, 3 / 2 / 1 sloupec, poměr obrázku, mezery, datum).
- Snímky: změna jen v oblastech článků (nové oblasti `.homepage-blog-wrapper` a rubrika `.news-wrapper`).
- Rozestup za úvodním textem změřen na e-shopu: 72 px na 1920 i 390 px.
- Audit: nové položky karty článku.
- Dokumentace: příručka (stránky, rozměr obrázku článku), komponenty.md, docs/vyvoj.md.

---

# Aktualizace (Claude): hodnocení obchodu nad patičkou

**Zadání majitele:** nad patičkou na každé stránce celkové hodnocení obchodu a 4 nejnovější recenze s prokliknutím na /hodnoceni-obchodu/ (návrh jako obrázek). Šablonu může mít až 500 e-shopů. Postup přes `/cache/hodnoceni-obchodu/` podle šablony Merkur, s vylepšeními.

**Řešení**
- `js/shop-reviews.js`:
  - čte stránku hodnocení z `/cache/<adresa>/` (serverová mezipaměť Shoptetu), při chybě z běžné adresy;
  - bere průměr, počet a 4 nejnovější recenze (jméno, hvězdičky, text zkrácený na 300 znaků, štítek „Ověřená recenze“ jen pokud ho Shoptet vypisuje);
  - adresu stránky zjistí z odkazu na stránce, jinak podle jazyka (cs, sk, hu, ro, de, pl, en);
  - stahuje až po přiblížení k patičce a výsledek drží 30 minut v `sessionStorage` (i prázdný);
  - zástupný blok drží místo, s uloženými daty se blok vykreslí hned;
  - nezobrazuje se v košíku a objednávce (`ordering-process`) ani na stránce hodnocení; bez recenzí se blok odstraní.
- `components/_shop-reviews.scss`:
  - průměr ve čtverci barvy `--as-success`, nadpis H3 s ikonou `verified` (nová ikona z Figmy), odkaz hlavní barvou;
  - recenze 4 / 2 / posuvný pás; hvězdičky přes `tools/_rating.scss`;
  - na telefonu odsazení 10 px jako obsah stránky.
- **Nastavení:** karta „Hodnocení obchodu“ (`shopReviews.enabled`, výchozí zapnuto; `shopReviews.title`, výchozí „Hodnocení obchodu“).

**Ověření**
- Testy: nový `shop-reviews.spec.cjs` (data, 4 nejnovější, stažení až u patičky, uložení na návštěvu, bez bloku v 5 případech, vlastní nadpis, telefon).
- E-shop na 1920 a 390 px: stažení 0× před posunem, 1× po posunu, další stránka návštěvy 0×; průměr 5,0, „4 hodnocení“, 4 recenze; košík a stránka hodnocení bez bloku; bez přetečení.
- Audit: nové položky bloku. Snímky: beze změny (blok je mimo sledované oblasti).
- Dokumentace: příručka (karta, přehled stránek, časté otázky), docs/vyvoj.md, komponenty.md.

**Poznámka:** v celé sadě testů se při vytížení počítače (zátěž 6) náhodně zasekly testy hlavičky a menu. Samostatně procházejí, se změnou nesouvisí.

---

# Aktualizace (Claude): úvodní text přes celou šířku

**Zadání majitele:** `.welcome-wrapper` přes celou šířku.

**Příčina:** Disco dává úvodnímu textu `.container-narrow` (max. 1178 px, na 1440+ okraje 100 px), takže byl užší než sekce úvodní stránky (1378 px).

**Oprava** (`layout/_homepage.scss`):
- `.welcome-wrapper.container-narrow` má šířku obsahu (stejnou jako nadpisy sekcí).
- Sloupce z editoru (`.col-*`, odsazení 20 px): od 768 px má jejich obal záporný okraj jako `.row` Bootstrapu, na telefonu nemají odsazení. Text tak lícuje se sekcemi a stránka nepřetéká.

**Ověření**
- E-shop: lícování se sekcemi na 1920, 1200, 800 a 390 px, bez přetečení.
- Snímky: nová oblast `.welcome-wrapper`, jinak beze změny.
- Testy: 117 prošlo, nový `welcome.spec.cjs` na 1920, 800 a 390 px.
- Dokumentace: příručka (úvodní stránka), komponenty.md.

---

# Aktualizace (Claude): barva textu na tmavém pozadí podle kontrastu

**Dotaz majitele:** při tmavé barvě pozadí (např. černé) se má přizpůsobit barva písma, odkazů a ikon článků.

**Stav:** přepnutí už fungovalo (`.as-category-tint-dark`). Majitel měl uloženou světlou barvu `#fdf6e8`, proto ho neviděl.

**Oprava:** `isDarkColor` (`settings-app/src/theme-config.mjs`) už nepoužívá pevnou hranici jasu 0,4. Bílý text zvolí, když má podle WCAG vyšší kontrast než tmavý text šablony (`#2e3545`). Středně syté barvy (např. `#1e9fe8`) tak mají tmavý text, černá a tmavé barvy bílý.

**Ověření**
- Testy: settings-app prošly, nové případy `#000000`, `#555555` (bílý text) a `#1e9fe8` (tmavý text).
- E-shop: černé pozadí (podstrčené v prohlížeči) s obrázkem i bez něj na 1920 a 390 px. Bílý je nadpis, popis, tučné písmo, odkaz v popisu, nadpis článků, odkazy i ikony článků, podtržení při najetí myší funguje.

**Poznámka:** volba barvy textu se počítá při uložení nastavení. Dříve uložená barva se přepočítá po dalším uložení.

---

# Aktualizace (Claude): barva na pozadí i u kategorie bez obrázku

**Zadání majitele:** u vzhledu s barvou na pozadí se má barva zobrazit, i když kategorie nemá obrázek v popisu.

**Řešení**
- Nový mixin `tools/_category-intro.scss` `text-band($padding, $padding-mobile)`: pruh přes celou šířku okna s nadpisem, popisem a články ve výchozím rozložení (články vedle popisu od 992 px, jinak pod ním).
- Mixin teď používá i varianta „Obrázek na pozadí“ (80 / 40 px); dřív v ní byl stejný kód napsaný zvlášť.
- `side-tint` u kategorie bez obrázku (`:not($with-image)`) použije `text-band(64px, 32px)` a barvu `--as-category-tint` (jinak `--as-primary-50`).
- Tmavá barva (`.as-category-tint-dark`) přepíná bílý text i bez obrázku, čára u článků (horní i levá) je světlá.

**Ověření**
- Testy: 18 testů kategorie prošlo. Nový test pokrývá pruh bez obrázku na 1440 a 390 px (barva, odsazení 64 / 32 px, bílý text, články, podkategorie pod pruhem). Test „bez obrázku“ teď hlídá výchozí vzhled bez pruhu.
- E-shop: Šperky bez obrázku s uloženou barvou majitele #fdf6e8 (tmavý text) a s podstrčenou #1e3a5f (bílý text), 1920 a 390 px.
- Dokumentace: příručka pro obchodníka, docs/vyvoj.md, komponenty.md.

---

# Aktualizace (Claude): vlastní barva na pozadí popisu kategorie

**Zadání majitele:** kde je na pozadí barva, má si ji uživatel zvolit.

**Řešení**
- **Nastavení:** zaškrtávátko „Světlé pozadí“ je teď „Barva na pozadí“ s volbou „Světlý odstín hlavní barvy e-shopu“ (výchozí, jako dosud) nebo „Vlastní barva“ (výběr barvy). Ukládá se `categoryTintColor` (#rrggbb, jiná hodnota se zahodí). Vlastní barva zůstává uložená i při vypnutém pozadí.
- **Kód e-shopu:** barva jde jako `--as-category-tint` do stejného `<style>:root{…}` jako velikosti nadpisů (`rootStyle` v `theme-config.mjs`). CSS: `background: var(--as-category-tint, var(--as-primary-50))`.
- **Čitelnost:** server spočítá jas barvy (WCAG). U tmavé (pod 0,4) uloží `categoryTintDark` a šablona dá na `<html>` `.as-category-tint-dark`: nadpis, popis, odkazy a články bíle, čára světlá. Bílý text sdílí mixin `light-text` s variantou obrázku na pozadí.

**Ověření**
- Testy: settings-app 2 sady prošly (nová `theme-config.test.mjs`: validace, jas, vložený styl), Playwright 113 prošlo (nový test tmavé barvy).
- E-shop (podstrčené jen v prohlížeči): #1e3a5f s bílým textem na 1920 px, #ffe8d6 s tmavým textem na 390 px.

**Poznámka:** v nastavení e-shopu je teď uložený vzhled „Obrázek na pozadí“ (uložil majitel 14:05 UTC).

---

# Aktualizace (Claude): vzhled popisu kategorie (varianty z Figmy)

**Zadání majitele:** varianty popisu kategorie podle Figmy „Kategorie – typy popisů kategorie“ (1487:3697, komentáře #claude). Uživatel volí v nastavení šablony jeden vzhled pro všechny kategorie. Obrázek je první obrázek vložený do popisu kategorie. Responzivita je na Claudovi.

**Řešení**
- **Nastavení:** karta „Vzhled popisu kategorie“ s volbami výchozí, obrázek na pozadí, obrázek vedle textu, obrázek až k okraji okna, plus „Světlé pozadí“ (jen pro dvě varianty s obrázkem vedle textu). Ukládá se `categoryLayout` a `categoryTint`, na `<html>` jsou třídy `as-category-<vzhled>` a `as-category-tinted`. Náhled: `?asteroid-category=image&asteroid-category-tint=1`.
- **Styly:** každá varianta má vlastní soubor (`variants/category-*.scss`). Výchozí vzhled je v základu, bez souboru (`styles.mjs` nově podporuje hodnotu bez souboru). Společné části jsou v `tools/_category-intro.scss`.
- **Rozložení podle obsahu:** CSS pozná obrázek v popisu přes `:has()` už při prvním vykreslení. Kategorie bez obrázku má výchozí vzhled, bez článků je popis přes celou šířku (podle Figmy).
- **Přesun obrázku:** `js/category-intro.js` přesune první obrázek z popisu do `<figure>`. Odstraní prázdný odstavec a rozměry z editoru, alt zůstává. Funguje i po AJAXu (řazení, filtry).
- **Bez poskočení:** do přesunu jsou obrázky v popisu skryté a místo pro obrázek drží zástupný blok stejného rozměru. Naměřené CLS na e-shopu s obrázkem 0,005–0,016, telefon 0.
- **Barvy:** ztmavení pozadí z `--as-secondary-600` (60 %), světlé pozadí `--as-primary-50` (z hlavní barvy administrace). Pruh navazuje přímo na drobečky (vyrovnává `#content` `padding-top: 20px` Disca na desktopu).
- **Responzivita:**
  - od 992 px dva sloupce (648 : 700, mezera 72), text svisle na střed vůči obrázku;
  - pod 992 px obrázek nahoře (u varianty až k okraji okna od okraje k okraji), pod ním nadpis, popis a články (od 768 px ve 2 sloupcích);
  - obrázek na pozadí: odsazení 80 px, na telefonu 40 px.

**Ověření**
- Testy: 112 Playwright prošlo, nových 7 pro varianty (rozložení na desktopu i telefonu, bez obrázku, beze změny polohy textu při přesunu obrázku, AJAX).
- E-shop: všechny varianty na 1920 a 390 px s obrázkem podstrčeným do HTML popisu (administrace beze změny).
- Snímky beze změny (výchozí vzhled). Audit 0 rozdílů.

**Zbývá:** na e-shopu zatím žádná kategorie nemá obrázek v popisu a vzhled je nastavený na výchozí.

---

# Aktualizace (Claude): rozbitý vzhled administrace šablony

**Hlášení majitele:** administrace šablony (stránka nastavení v iframu) je vizuálně celá rozbitá.

**Příčina:** moje předchozí „oprava“ zalamování nápovědy (`white-space: normal` na `.v2FormField__hint`). Shoptet UI dává této třídě `width: 1px; max-width: 1px; nowrap`, je jen pro nápovědu uvnitř pole formuláře. Po zapnutí zalamování se každá nápověda rozpadla do sloupce po slovech.

**Oprava:** samostatné texty (nápovědy karet, popisky variant, varování nadpisů, seznam značek bannerů) mají vlastní třídu `.as-hint`. Třída Shoptet UI se na ně nepoužívá.

**Ověření:** snímek celé stránky na 1280 a 800 px, testy settings-app.

**Poznámka:** poslední uložení nastavení (13:37 UTC, z administrace) přepnulo hlavičku z V2 na V1. Majitel ověří, jestli šlo o záměr.

---

# Aktualizace (Claude): horní část kategorie přes celou šířku

**Zadání majitele:** `.category-top` má být přes celou šířku containeru.

**Příčina:** Disco dává `.category-top` `max-width: 1178px`. Od 1440 px tak horní část končila o 200 px dřív než výpis produktů a lišta řazení.

**Oprava** (`components/_category.scss`):
- `max-width: none`, horní část má teď stejnou šířku obsahu jako výpis (1920: 271–1649 px);
- pod horní částí mezera 40 px k liště výpisu (podle Figmy). Dřív lišta řazení začínala hned pod kartami Nejprodávanějších.

**Ověření**
- Snímky: změna jen na kategorii.
- Testy: 105 prošlých, nově hlídají šířku (1378 px při 1440).
- Audit: 0 rozdílů.

---

# Aktualizace (Claude): články ke kategoriím ověřené na e-shopu

**Postup:** majitel založil 3 testovací články. Přiřadil jsem je přes formulář nastavení (přes tunel, jako z administrace): Šperky 3 články, Náramky 1 (stejný článek u dvou kategorií).

**Nálezy a opravy**
1. **Adresa souboru přes `http://localhost`:** uložení mimo tunel zapsalo do e-shopu adresu, kterou HTTPS stránka nenačte. Server teď ukládá jen adresu s HTTPS, jinak ponechá předchozí.
2. **Vypršelý tunel:** dočasný tunel přestal fungovat („Tunnel not found“). Spuštěn nový: `https://addressed-dust-tulsa-returns.trycloudflare.com`.
3. **Výpadek API:** při výpadku se server pokoušel o obnovu při každém požadavku. Teď nejvýš jednou za minutu. Pro zkoušku je nově `SHOPTET_API_BASE`.
4. **Řazení, filtry a stránkování (AJAX):** Shoptet vymění celou `.category-top`, takže zmizel blok článků i pás Nejprodávanějších. Obojí se teď vytvoří znovu na `ShoptetDOMPageContentLoaded`. Přidaný test.
5. **Nápověda v nastavení:** Shoptet UI ji nezalamuje (`nowrap`) a utíkala z karet. Opraveno globálně pro všechny karty.

**Ověření**
- Testy: 105 Playwright a 8 testů datové logiky prošlo.
- E-shop na 1920 a 390 px: 0, 1 i 3 články, pořadí, nadpis, více kategorií, výpadek API, řazení. Podrobně v `docs/clanky-ke-kategoriim.md`.

**Zbývá naživo:** přejmenování, skrytí, smazání a budoucí zveřejnění článku (vyžaduje úpravu článků v administraci).

---

# Aktualizace (Claude): články ke kategoriím (issue #1)

**Zadání:** issue #1, část „články“ (přiřazení existujících článků ke kategoriím v nastavení, zveřejnění, blok v kategorii podle Figmy „Články“ 112:5596).

**Hotovo**
- `settings-app/src/category-articles.mjs`: datová logika (formulář → přiřazení podle GUID kategorie a ID článků, stav článku, zveřejněná data, verze, hlášky chyb).
- `settings-app`:
  - karta „Články ke kategoriím“ (hledání, pořadí, odebrání, nadpis, stav skrytý / budoucí / smazaný);
  - `getArticles` (stránkování po 10);
  - veřejný soubor `/public/<eshopId>/category-articles.json` s mezipamětí a obnovou na pozadí;
  - adresa souboru v kódu e-shopu (`snippetConfig`, i v `publish-snippets`).
- Šablona: `js/category-articles.js` (GUID z dataLayer, stažení už v hlavičce), styly bloku v `_category.scss`. Řádek popisu bere výšku navíc z bloku (`grid-template-rows: auto 1fr`), takže nadpis se neroztahuje.
- Provoz, omezení a postup převodu ručně psaných článků: `docs/clanky-ke-kategoriim.md`.

**Ověření**
- `npm test -w settings-app`: 8 testů prošlo.
- Playwright: 104 testů prošlo, z toho 4 nové pro blok článků.
- Karta nastavení vyzkoušena offline s ukázkovými články: přidání, duplicita, pořadí, odebrání, escapování názvu.
- Veřejný soubor vrací 200 a správné hlavičky.

**Chybí:** ověření na e-shopu. E-shop nemá žádný článek, je potřeba založit testovací články a v nastavení je přiřadit (scénáře v dokumentu).

---

# Aktualizace (Claude): stránka kategorie podle návrhu (issue #1, část vzhled)

**Zadání majitele:** podle Figmy „Kategorie“ (112:3621) horní popisek s názvem, články, vzhled subkategorií, Nejprodávanější a výpis produktů. Filtrace a řazení se zatím neřeší.

**Hotovo v tomto kroku**
- `components/_category.scss`:
  - nadpis a popis (max. 820 px, barva secondary-400, odkazy primární barvou),
  - podkategorie jako tlačítka 72 px s obrázkem 56 px a šipkou,
  - „Nejprodávanější“ jako karty na šířku: obrázek 100 px, název na jeden řádek, ceny, tlačítko Detail, sleva v kolečku přes obrázek.
- `js/category.js`: pás karet se posouvá (scroll-snap), šipky mají třídy slideru Shoptetu (stejný vzhled jako na úvodní stránce) a skrývají se na krajích, Detail vede na produkt. Slider Shoptetu se nepoužívá, protože karty přeskupuje do `.products-block`, na které se chytá vzhled svislé karty.
- Rozložení pro blok článků je připravené (`.category-top:has(> .as-category-articles)`: popis vlevo, články vpravo za čarou od 992 px), samotný blok a nastavení přijdou v dalším kroku.
- Výpis produktů používá globální kartu (odpovídá komponentě „Produkt“). V návrhu je vlevo sloupec filtrů a karty mají 284 px. Do doplnění filtrů vyplňuje výpis celou šířku.

**Ověření**
- Testy: 100 prošlých, nový `tests/responsive/category.spec.cjs` (mřížka podkategorií, pás, šipky, Detail, telefon).
- Audit: 0 rozdílů z 52, nové položky kategorie a nejprodávanějších.
- Snímky: nová oblast `.category-top`; ostatní stránky jsou beze změny (jen subpixelové posuny).

---

# Aktualizace (Claude): účet v hlavičce i v objednávce

**Chyba (majitel):** v košíku bylo přihlášení v horní liště, jinde v hlavičce.

**Příčina:** `js/header.js` `renderAccountButton` vkládal kopii tlačítka účtu před košík v hlavičce a bez košíku skončil. V objednávce (`body.ordering-process`: košík, `/objednavka/krok-1/` …) Disco tlačítko košíku v hlavičce nemá (v kroku 1 ani hledání).

**Oprava:** bez košíku se účet vloží před tlačítko menu `[data-target="navigation"]` (na desktopu skryté), jinak na konec `.navigation-buttons`.

**Ověření**
- Testy: 96 prošlých.
- Snímky před a po: změna jen hlavičky košíku (1920, 390).
- Košík a krok „Doprava a platba“ s produktem na 1920 a 390 px: účet v hlavičce, přihlášení v liště skryté.
- Audit 0 rozdílů. Sada snímků má nově `#header` v košíku, audit ikonu účtu v košíku.

---

# Aktualizace (Claude): audit stejného vzhledu desktop vs. mobil

**Zadání majitele:** mezera mezi hlavičkou a drobečky na mobilu, jiný vzhled nabídky měny na mobilu. Pak projít vše hotové, aby se komponenty na desktopu a mobilu nelišily, a průběžně hlásit nálezy.

**Nálezy a opravy**
1. **Mezera nad drobečky (mobil):** Disco dává `.content-wrapper` na mobilu `padding-top: 10px`. Opraveno v `_breadcrumbs.scss`: `.content-wrapper:has(> .breadcrumbs:first-child) { padding-top: 0 }`.
2. **Nabídka měny:**
   - vzhled byl dvakrát (desktop v `_header.scss`, mobil zvlášť a jinak), teď je jeden mixin `tools/_dropdown.scss` `panel`,
   - na mobilu navíc pravidla podkategorií z `_mobile-menu.scss` platila pro každé `.menu-level-2` (Disco ji má i u nabídky měny), zúženo na `.menu-level-1 .menu-level-2/3`,
   - vynulována tečka Disca u aktivní položky, okraj odkazu 20 px a podtržení textu v horním řádku menu.
3. **Banner u sekce:**
   - vzhled (zaoblení, obrázek přes plochu, texty a tlačítko přes obrázek) byl jen v `bp.desktop`, teď platí na všech zařízeních,
   - Codexova mobilní úprava „text pod obrázkem“ zůstává jen pro původní blok Disca (`.body-banners:not(.as-section-banner)`).
4. **Pole hledání:** vzhled byl dvakrát (desktop, mobilní hlavička), teď je jedno společné pravidlo v `_header.scss`, breakpointy mají jen výšku a odsazení.
5. **Počítadlo:** `text-align: left` v mixinu (Disco na detailu mobilu zarovnává vpravo).

**Nový nástroj:** `tests/shop/audit.cjs` (`npm run audit`) porovná 41 komponent na e-shopu na 1920 a 390 px. Výsledek: 0 rozdílů. Audit nezachytí vše, nabídku měny jsem ověřil i snímky otevřeného stavu. Pravidlo je v `AGENTS.md`, popis v `docs/komponenty.md`.

**Ověření:**
- Testy: 96 prošlých (2 dočasná selhání při souběhu s nasazením, po opakování prošly).
- Snímky před a po: změny jen tam, kde měly být.
- Mobilní menu (úrovně 1–3, zpět, přihlášení) beze změny funkčnosti.

**Známé rozdíly podle návrhu (záměrně):**
- košík: pilulka s cenou (desktop) vs. ikona (mobil),
- domeček v drobečcích vs. poslední odkaz,
- řádky mobilního menu (výška, oddělovače),
- velikost nadpisů H1–H3,
- tlačítko v kartě má na mobilu min. výšku 44 px (dotyk).

**Mimo rozsah:** původní blok Střed Disca (banner bez značky) má na mobilu Codexův vzhled, na desktopu vzhled Disca. Na e-shopu se teď nepoužívá.

---

# Aktualizace (Claude): drobečková navigace podle Figmy

**Zadání:**
- Figma „Breadcrumb“ Desktop `1483:5173` / Mobile `1483:5175`.
- Na mobilu jen poslední proklikávací odkaz (návrat o úroveň výš).

**(1) Disco:**
- `.breadcrumbs > span#navigation-first` (odkaz „Domů“ + `.navigation-bullet` „/“), `span#navigation-N`, poslední `[data-testid="breadcrumbsLastLevel"]` bez odkazu.
- Ověřeno na kategorii, podkategorii, detailu, kontaktech, přihlášení, hledání a článcích. Úvodní stránka a košík drobečky nemají.
- Obal je `.content-wrapper.container` (někde `container-narrow`).
- Pravidla Disca: `.aside-indented .breadcrumbs {max-width:1178px}`, `.type-product .breadcrumbs {width:50%}` (≥ 992) a `.multiple-columns-body.type-product …`.

**(2) Změny:**
- Nový `components/_breadcrumbs.scss`:
  - pruh 40 px `secondary-50` přes celou šířku okna (`--as-viewport-width`), obsah odsazený na vnitřní šířku hlavního kontejneru podle breakpointů Disca,
  - desktop: domeček (nová ikona `icons/home.svg` z Figmy), oddělovač „/“ jako `chevron-right` 16 px `secondary-300`, odkazy podtržené `secondary-600`, aktuální stránka `secondary-400` se zkrácením,
  - telefon: jen položka před aktuální stránkou (`:has(+ [data-testid=breadcrumbsLastLevel])`) se šipkou zpět.
  - `:is(body, .aside-indented, .multiple-columns-body.type-product)` + `max-width: none` přebíjí pravidla Disca.
- Sada snímků e-shopu má drobečky a stránku kontaktů (úzký obsah).

**(3) Ověření:**
- Testy: 96 prošlých, nový `breadcrumbs: full-width bar…`.
- Snímky před a po (35 snímků):
  - drobečky na všech stránkách podle návrhu, desktop i mobil,
  - na kategorii nejdřív zůstal pruh 1178 px (max-width Disca), opraveno a ověřeno na 1920 px,
  - ostatní rozdíly: drobečky uvnitř `#content` (kontakty, hledání), posun detailu o 1 px, šum vyhlazení písma.

---

# Aktualizace (Claude): nadpisy podle Figmy globálně a velikosti v nastavení šablony

**Zadání:** nadpisy podle Figmy (H1 36, H2 28, H3 24, H4 20, H5 18, H6 16 px, Medium, výška řádku 1,2) všude. Obchodník je může měnit v administraci šablony, mobil se automaticky zmenší.

**(1) Disco:**
- `.h1,…,h6 {font-weight:700;line-height:1.1}` a velikosti 34/24/20/18/16/14 px,
- barva `--colors-foregrounds-headlines-primary` (z administrace, necháváme),
- kontextová pravidla: `.popup-widget h2`, `ul.manufacturers h2`, `.recapitulation-wrapper h4`.
- Inventura nadpisů na 7 stránkách × 2 šířky: `h1` (detail, kontakty), `h1.category-title`, `h1.h1.cart-heading`, `div.h1` (mobilní hlavička detailu), `.homepage-group-title.h4`, `h2`/`h3` v obsahu i patičce, `h4.search-products-heading`.

**(2) Změny**
- Tokeny: `--as-heading-size-hN` (výchozí z návrhu) × `--as-heading-scale-hN` (pod 768 px: H1 0,78, H2 0,86, H3 0,84) = `--as-font-size-hN`. Zmenšení tak platí i pro velikosti z nastavení. Blok `@media` je na konci `:root` (kvůli mixed-decls jsou ikony v `main.scss` před tokeny).
- Nový `components/_headings.scss`: `h1`–`h6` a `.h1`–`.h6` (písmo nadpisů z administrace, 500, 1,2, velikost z tokenu). `.product-appendix` je o dvě úrovně menší.
- `theme/src/js/typography.mjs`:
  - `HEADING_SIZES` (sdílí settings-app),
  - `headingOverrides` (12–72 px, jen změněné),
  - `headingStyle` → `<style>:root{--as-heading-size-h1:40px}</style>` ve vkládaném kódu (bez JS a dalšího souboru).
- settings-app: `themeConfig.headings`, karta „Velikosti nadpisů“ (6 polí, náhled velikosti, „Vrátit výchozí“, upozornění, když pořadí neklesá).
- `tools/_submenu.scss`: přesun skrytí mobilních řádků za deklarace (mixed-decls).

**(3) Ověření**
- Testy: 95 prošlých. Nové: výchozí v nastavení = tokeny v CSS, `headingStyle`, nadpisy podle návrhu, hodnota z nastavení a zmenšení na telefonu.
- Snímky před a po: změny jen u nadpisů (detail, košík, přihlášení, hledání, sekce úvodní stránky na mobilu), ostatní stejné.
- E-shop přes celý řetězec (dočasně H1 40 px v uloženém nastavení → publish-snippets): desktop 40 px / 500, mobil 31,2 px. Pak vráceno na výchozí: 36 px / 28,08 px.

**Odchylka:** nadpisy značek (`ul.manufacturers h2`, Disco 30 px / 900) jsou teď H2 podle návrhu.

---

# Aktualizace (Claude): konverzní tlačítko globálně, barvy z administrace

**Zadání:** barvy z administrace e-shopu. U `btn-conversion` všude bílý text.

**Změna:** `components/_buttons.scss` přidává `.btn-conversion` → `button.conversion`:
- pozadí `--as-conversion` (= `--color-secondary` z administrace), při najetí `--as-conversion-hover`,
- bílý text,
- `:is(body, .p-detail .p-to-cart-block)` kvůli specificitě Disca.

Karty produktů mají jiné tlačítko (`btn-cart`) s obrysem podle návrhu, nekolidují.

**Ověření**
- Testy: 93 prošlých, nový `conversion buttons use the admin conversion color…` (změna `--color-secondary` se propíše).
- Snímky před a po: změna jen u tlačítka na detailu (1920 i 390), ostatní beze změny.
- Výpis všech `btn-conversion` na e-shopu (detail, košík s položkou, kategorie): detail „Do košíku“ i košík „Pokračovat“ mají pozadí #1E9FE8 (konverzní barva z administrace) a bílý text.

---

# Aktualizace (Claude): tlačítka zaoblená globálně

**Zadání:** všechna tlačítka mají být zaoblená, ne hranatá, a to globálně.

**Inventura:** všechna viditelná tlačítka (`button`, `.btn`, `input[type=submit]`, cookie lišta, sociální přihlášení) na 9 stránkách (úvodní, kategorie, detail, hledání, košík, přihlášení, registrace, kontakty, zapomenuté heslo) na 1920 a 390 px. Hranatá byla:
- detail: „Do košíku“ (`btn-conversion`),
- úvodní text: „Náš příběh“ (`btn-secondary`),
- košík: „Hledat“ (`btn-primary`),
- kategorie: řazení (`sortingToggle`), „Zobrazit více produktů“ (`toggle-top-prod`, mobil),
- detail: `navigation-btn` (záložky na mobilu).
- Disco: `.btn, a.btn { border-radius: 0 }`.

**Změny**
- Nový `components/_buttons.scss`: tvar pilulka pro `.btn` a ovládací prvky Shoptetu výše. Barvy a velikost dál určuje místo přes `tools/button`.
- Výjimka podle návrhu: „Katalog produktů“ (v2) je díl lišty.
- `npm run snapshots` teď spouští Node 20 (dřív přes npm Node 18 neběžel). Detail ve snímcích má celý blok nákupu (`.p-data-wrapper`).

**Ověření**
- Testy: 92 prošlých, nový `buttons are rounded everywhere…`.
- Snímky před a po (skutečný stav před nasazením):
  - rozdíl jen u košíku („Hledat“), řazení v kategorii na mobilu a známého šumu písma,
  - 19 snímků beze změny.
- Opakovaná inventura: hranaté zůstalo jen „Katalog produktů“.

---

# Aktualizace (Claude): prvky produktu jako globální komponenty

**Chyba (majitel):** na detailu produktu měly štítky, sleva, hvězdičky a počítadlo vzhled Disca, protože naše styly platily jen v kartě produktu (`.products-block .p`) a v okně košíku. Markup Disca je přitom stejný.

**(1) Disco:** `.flags-default .flag`, detail `.p-image .flags-default`, `.p-image-wrapper .flags-extra .flag-discount` (původní cena + `.price-save` „–31 %“), `.stars .star-on/-off`, `span.quantity` (detail `.p-detail .add-to-cart .quantity` s vyšší specificitou).

**(2) Změny**
- Nový `tools/_flag.scss` (`label`, `discount($size)`).
- Nový `components/_product-elements.scss`, globálně: počítadlo `quantity.stepper`, hvězdičky `rating.stars`, štítky, kolečko slevy na detailu (72 px, původní cena skrytá).
  - `:is(body, .p-detail .add-to-cart, …)` zvedá specificitu nad Disco.
- Karta: štítek a kolečko přes stejné mixiny. Text kolečka má vlastní `font-weight`, protože Disco dává tučné s vyšší specificitou.
- Procesní doplňky:
  - `tests/shop/snapshots.cjs` (`npm run snapshots before` / `after before`): standardní sada stránek (úvodní, kategorie, detail, hledání, košík, přihlášení) na 1920 a 390 px s porovnáním pixelů,
  - `docs/komponenty.md`: mapa prvků Disca a kde se vypisují,
  - pravidlo v `AGENTS.md`.

**(3) Ověření**
- Testy: 91 prošlých, nový `product flags, discount and quantity look the same on the product detail as in the card`.
- Detail na e-shopu (1920 i 390): počítadlo 36 px bílá pilulka bez rámečku, štítky zaoblené vlevo nahoře, kolečko 72 px červené „–31 %“, hvězdičky v barvách z návrhu.
- Karty na úvodní stránce a v kategorii beze změny (porovnání snímků, rozdíl jen ve vyhlazení písma).

**Bez návrhu (vzhled Disca):** tlačítko „Do košíku“ a cena na detailu, další formuláře, ostatní kolečka `.flags-extra`.

---

# Aktualizace (Claude): styly rozdělené na základ a soubory variant

**Zadání majitele:** variant (karty produktů aj.) časem přibude, e-shop má stahovat jen styly zvolených variant.

**Změny**
- `theme/src/scss/variants/*.scss` → `dist/<název>.css`:
  - `header-v1` (`header/_v1`),
  - `header-v2` (`components/_catalog` + `header/_v2`),
  - `banners-default`, `banners-content`, `banners-fullwidth` (vyňato z rozložení v `_banners.scss`),
  - `banners-cards` (blok `.as-banners-cards`),
  - `product-card-default`.
  - `main.scss` = základ.
  - Build: `sass main.scss:dist/asteroid.css variants:dist`.
- `theme/src/js/styles.mjs`: `VARIANT_STYLES` a `styleFiles(config)`, jediný seznam pro šablonu i settings-app (`.mjs`, protože balíček theme není ESM).
- settings-app: vkládaný kód = `<link data-as-style>` pro základ a zvolené varianty, každý soubor s vlastní verzí (otisk obsahu). `publish-snippets` po deployi.
- `js/main.js` `ensureStyles`: dočte chybějící soubory variant, a to pro náhled přes `?asteroid-…` i pro starší vložený kód, který měl jen `asteroid.css`.
- Testy: fixture skládá základ a všechny varianty, nový `styles.spec.cjs` kontroluje seznam proti `dist` a výchozí hodnoty. AGENTS.md: pravidlo „varianta = vlastní soubor“.

**Ověření**
- Testy: 90 prošlých.
- CSS pravidla před a po jsou totožná, liší se jen seskupení `@media` u tří variant bannerů.
- E-shop (uložené v2 + cards) načte `asteroid` + `header-v2` + `banners-cards` + `product-card-default`. Náhled v1/default dočte `header-v1` a `banners-default`.
- Screenshoty před a po (hlavička, bannery, produkty, mozaika, kategorie; 1920 a 390; uloženo i náhled v1/default) jsou shodné na pixel. U náhledu v1 jiný hash PNG, ale žádný pixel rozdílný o víc než 16/255.

**Velikost:** úspora teď jen ~2–3 KB po kompresi (styly nepoužitých variant), roste s každou další variantou.

---

# Aktualizace (Claude): mozaika bannerů a bannery ze Zápatí podle značky v názvu

**Zjištění:** Shoptet posílá na e-shop nejvýš **2 bannery Střed** (Disco je dává jako 1/3 + 2/3). 4 testovací bannery tak vytlačily i bannery `[L]`/`[R]` u sekcí. Pozice **Zápatí** má víc bannerů (ověřeno 8 viditelných, Disco mění šířku sloupců `col-lg-2` → `col-lg-1.5`). Jsou jen na úvodní stránce, v `#content > .footer-banners > .footer-banner` (img s `data-src` líně, odkaz s `data-ec-promo-id`, když má banner URL). Majitel přepnul bannery na Zápatí.

**(1) Disco a Shoptet:** `.footer-banners` / `.footer-banner`, `.body-banners .banner-wrapper`, `#trackingScript[data-products].banners` (interní název podle promo ID), `body.admin-logged`.

**(2) Vlastní doplňky**
- `js/section-banners.js` → `js/homepage-banners.js` (`placeHomepageBanners`):
  - zdroje Zápatí i Střed,
  - značka `[L]/[P]/[R]` → sekce (beze změny), `[číslo]` → mozaika,
  - bez značky → zůstává,
  - štítky `data-as-admin-label`, prázdné bloky Disca odstraní.
  - Mozaika: řazení podle čísla (stejná čísla v pořadí Shoptetu), třídy `--tall` / `--low` podle pozice ve vzoru, vložená za první `.products-wrapper` (po bannerech u sekcí).
- Nový `components/_banner-mosaic.scss`: mřížka, poměry 460/240 a 460/500, zaoblení 8 px, štítky pro admina.
- `_body-banners.scss`, `_banners.scss`: banner u sekce může být i `.footer-banner` (nulování sloupců Bootstrapu).
- settings-app: karta s návodem k pojmenování.

**(3) Ověření**
- Testy: 89 prošlých, nové `numbered footer banners form the mosaic…` a `mosaic banners stack uncropped on a phone`.
- E-shop:
  - **1920 px:** mozaika 447 × 485 / 446 × 233, mezery 20 px. Odpovídá Figmě, jen v kontejneru Disca 1378 px místo 1420 px.
  - **1024 px:** dva sloupce.
  - **390 px:** pod sebou bez ořezu.
  - `[L]`/`[R]` u sekcí, bannery bez značky v zápatí, štítky pro přihlášeného admina, bez přetékání a chyb.

**Neověřeno:** horní limit počtu bannerů Zápatí.

---

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

Závěrečná drobná úprava ca7cdea prodlužuje desktopový oddělovač rekapitulace až ke spodní hraně viewportu (živě 1080/1080 px), na mobilu bez minimální výšky. Finální CSS znovu HTTP 200 a stejné SHA256. Desktopový snímek aktualizovaný, dočasná položka znovu odebraná a košík ověřen prázdný.
