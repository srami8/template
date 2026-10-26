# Aktivní filtry kategorie

Návrhy: [desktop 1633:7414](https://www.figma.com/design/jpEXMp36OXxRJqE0ortBfB/aSteroid?node-id=1633-7414), [mobilní panel 1633:10605](https://www.figma.com/design/jpEXMp36OXxRJqE0ortBfB/aSteroid?node-id=1633-10605). Majitel doplnil, že na mobilu mají být štítky **v panelu i nad řazením**.

## Pro obchodníka

Po výběru filtru se nad řazením zobrazí jeho štítek. Na telefonu je stejný přehled také nahoře ve vysunutém panelu filtrů. Kliknutím na štítek nebo jeho křížek se zruší pouze tento filtr. Odkaz **Vymazat filtry** zruší celý výběr, včetně cenového rozsahu, a zachová řazení. Pokud není vybraný žádný filtr, přehled nezabírá místo. Vzhled je automatický, nepřibývá nastavení ani ruční zadávání názvů.

Oba přehledy ukazují stejný aktuální stav. Produkty se obnovují původním AJAXem Shoptetu; mobilní panel při zrušení filtru zůstane otevřený. Fokus po obnově přejde na sousední štítek, po vymazání všech na zavření panelu / aktuální řazení. Názvy se zalamují a křížek zůstává dostupný.

## Implementace a napojení

- `tools/_tag.scss`: původní styl CTA/Search tag z našeptávače (14 px / 600, 8 × 16 px, hlavní světlé pozadí, pill). Používá jej původní `.searchWhisperer__additionalResults__link` i aktivní filtry; nejde o dva samostatné vzhledy. Dismissible varianta pouze doplňuje 12px mezeru a 16px existující ikonu close (Figma komponenta 93:2479). Odkaz pro vymazání má close 20 px.
- `components/_active-filters.scss`: zalamovaný přehled s mezerou 4 px, před řazením odstup 40 px / mobil 24 px. V panelu padding 24 × 16 px, border-bottom a clear odkaz na samostatném řádku po 16 px. Odstraňuje lokální vliv globálních odstavců #content p a nativních verzálek/červeného křížku #clear-filters, nikoli styly jiných odkazů.
- `js/active-filters.js`, volaný po `enhanceCategoryFilters`: čte vybrané původní `.filter-section input[data-url]`, jejich label bez počtu a nativní URL pro odebrání. Cena se bere z aktuálního priceMin/priceMax a zobrazených textů slideru (včetně měny), není napevno. Pokud Shoptet poskytne vlastní `.active-filters`, zachová se na místě a druhý přehled využije jeho data; testovaná šablona tento markup neposkytuje.
- Doplňující tlačítka mají původní `.active-filters .input[data-url]`. Klik i tap na křížek řeší **původní delegace Shoptetu**, která volá makeFilterAjaxRequest. Ikona je pseudo-element, aby event.target zůstal přímo na ovladači s data-url. Původní checkboxy, formuláře, jejich události ani ID se nekopírují a nepřesouvají.
- Shoptet také obsahuje delegaci `p#clear-filters a`, přestože jeho HTML obchod nevypisuje. Přehled nad řazením doplní právě tento odkaz. Mobilní kopie nemá duplicitní ID a volá stejnou nativní funkci makeFilterAjaxRequest se stejnou událostí ShoptetPageFiltersCleared. Nepoužívá vlastní fetch ani jiné filtrovací API.
- Clear URL přednostně používá původní odkaz; při jeho absenci vychází z nativních URL a odebírá kódy skutečných filtrů + priceMin/priceMax. Zachová order a nesouvisející query parametry. První stránku upravuje stejným shoptet.content.regexp jako nativní priceFilter. URL musí být ve stejném originu.
- Obnova po ShoptetDOMPageContentLoaded je součástí stávající inicializace filtrů. Idempotentní přehledy čtou jeden stav, nejde o druhé filtrovací formuláře. Po posledním zrušení se odstraní oba. Přesun samotných filtrů na mobil dál zajišťuje nativní detectFilters.

## Ověření a limity

Build a 24 testů settings-app + 2 testy registrace stylů prošly. Automatický audit blokuje start Chromia (MachPortRendezvous / permission denied); nové browserové regrese nejsou označené za prošlé. Přidané kontroly v category-listing.spec.cjs hlídají native data-url, ceny, zachování řazení, jediné clear ID a dlouhé názvy v obou přehledech. Audit a sada snímků obsahují kategorii s aktivními filtry.

In-app prohlížeč nad skutečným HTML/JS Shoptetu bez nativního CSS: stock + Novinka 3 produkty → odebrání stock 4 produkty / jen Novinka; Vymazat filtry vrátí 13 produktů a prázdný výběr. Cena nativním sliderem 301–390 Kč → 12 produktů, samostatný cenový štítek s odstraněním pouze cenových parametrů. Vymazání všech v panelu zachová otevření i řazení Nejlevnější, oba přehledy zmizí a fokus se vrátí na zavření. Při 320/390/767/768/992/1920 px nulové přetékání, jediné #clear-filters, správný odstup před řazením a skrytý desktopový přehled v panelu. Izolovaná fixture dlouhého názvu při 320 px: štítek se zalomí do šířky 268 px, křížek/clear zůstávají uvnitř 300px panelu a stránka nepřetéká. Osm společných computed vlastností našeptávače a nových štítků je shodných (outputs/active-filter-tag-parity.json).

Lokální preview nyní přepisuje také URL metadat posledního drobečku, kterou Shoptet používá v history.pushState. Jinak cross-origin historie selhala a změna ceny mohla v náhledu znovu zapnout zrušené filtry. Regresní test ověřuje přepis jen itemprop=item, nikoli og:url nebo pozice. Nejde o změnu živého e-shopu. HTML fixtures s vloženým kompatibilním CSS nyní také escapují </style uvnitř jeho SVG data URL, aby předčasně neukončil obalový style; vendor soubory se nemění.

Na testovací kategorii jsou skutečné checkboxy příznaků a cenový slider. Další parametrické skupiny, které obchod nevrací, nebyly živě ověřené; přehled používá stejné původní checkboxové rozhraní. Nativní JS musí zůstat zapnutý. Kompatibilní snapshot se neprořezával, úplná migrace Blank mode tím není dokončená. Externí Claude Docs příručka nebyla upravená; tento soubor obsahuje lokální návod.

Nasazení `c8e04a5`: původní složka, GitHub a SFTP synchronizované; pouze snippet instalace 313980, nastavení beze změny. HTTP ověření CSS/JS 200 a shodné SHA256. Stejné funkce ověřené také na živém e-shopu s oběma nativními CSS: desktop 3 → 4 při zrušení stock, mobilní tap přímo na křížek 3 → 4 bez zavření panelu, clear → 13 a prázdné oba přehledy. Cenový štítek 301–390 Kč: 12 → 13 po zrušení. Finální snímky v pracovních outputs/active-filters-*-live.png.
