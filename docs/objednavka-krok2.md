# Doprava a platba, společná hlavička dokončení objednávky

Figma 1645:8015, hlavička 1645:8338. Navazuje na první krok košíku. Maximální využití nativního Disca a sdílení prvků zůstává závazné i pro další vývoj.

## Chování pro obchodníka

Krok Doprava a platba používá skutečné dopravy, platební metody, ceny, podmínky dostupnosti, výdejní místa, měny a cenový rozpis Shoptetu. Ukázkové dopravce, Apple/Google Pay, loga, texty a ceny z Figmy aSteroid nevytváří. Pokud obchod nabízí jedinou zemi doručení, Shoptet nemusí vypisovat její výběr; vlastní náhradní pole nepřidáváme.

Poslední dva kroky objednávky mají jednu zjednodušenou hlavičku nezávislou na nastavení varianty v1/v2: logo obchodu, dostupný telefon, měna/jazyk podle aktivovaných funkcí a původní přihlášení nebo účet. Menu, rychlé odkazy, propagační pás a hledání se v těchto krocích nezobrazují. První krok košíku a zbytek obchodu nadále používají zvolenou hlavičku.

Telefon je stále z nativní `.contact-box .tel a`; otevírací doba ze stávajícího nastavení šablony. Je-li kontakt v objednávce vypnutý, aSteroid nevloží náhradní ani ukázkové číslo. Důsledkem je hlavička bez telefonu. Měnu i přihlášení obsluhuje Shoptet. Jazyk se zobrazí, jen pokud jej obchod skutečně nabízí; jeho vícejazyčný markup na testovací instalaci zatím není k dispozici a je potřeba ho ověřit při aktivaci.

## Nativní rozhraní

`components/_checkout.scss` řeší rozložení druhého kroku nad původními `#checkoutContent`, `#checkoutSidebar`, `.co-box`, `.co-basic-information`, `.shipping-billing-table`, `.radio-wrapper`, `.payment-info/.payment-logo/.payment-shipping-price`, `.order-summary-item`, `.recapitulation-single`, `.price-wrapper` a `.next-step`.

Žádné přemisťování, klonování nebo nahrazování formulářů, žádný vlastní fetch, přepočet cen ani výběr výdejního místa. Původní `name`, `value`, `data-*`, `for/id`, `form=order-form` a akce `Step1ChooseDelivery/Step1Validate` zůstávají Shoptetu. CSS respektuje checked, disabled, inactive a chyby nativních formulářů. Nativní mobilní schování nadpisu základních údajů přebíjí cílený selektor se stejným ID.

`components/_checkout-header.scss` platí pouze pro `body.in-krok-1/.in-krok-2`. Původní topbar a #header zůstávají ve stejném místě DOM. Topbar leží nad řádkem loga, prázdné plochy nepohlcují kliknutí; původní ovladače jsou dostupné. `enhanceHeader` v těchto dvou krocích pouze doplní již existující telefon a nevytváří kopii účtu, rychlé odkazy ani katalog. `enhanceMobileHeader` zde nezavádí sticky/kompaktní chování. Třetí krok dostává tuto hlavičku, nikoli nový redesign jeho formulářů.

## Sdílení prvků

- Původní `ol.cart-header` z prvního kroku: dokončené kroky nyní zobrazují přesnou ikonu `order-check.svg` z Figmy (20 × 20). Odkazy a číslování zůstávají nativní.
- `tools/_checkout.scss` používá Sass placeholdery pro součty a navigační akce. První i druhý krok se sestaví do společných pravidel; první krok má lokálně jen jiné umístění odkazu zpět. Tlačítka dál používají existující button mixiny, barvy z administrace.
- Kolečko je globální radio celého e-shopu (`tools/_radio.scss`, zapnuté v `components/_choices.scss`), bez náhradního ovladače: 22 px, checked 7px okraj v hlavní barvě, fokus zůstává viditelný. `_checkout.scss` mění jen polohu v kartě (16 px od okraje, svisle na středu). Checkboxy kontaktního kroku (nákup na firmu, jiná adresa, poznámka, newsletter, registrace, souhlas s hodnocením) mají globální checkbox.
- Telefon, měna, šipky, účet a ostatní masky jsou existující lokální assety. Loga dopravců/plateb i produktové obrázky jsou dynamická data Shoptetu, nikoli statické obrázky z návrhu.

## Podklady a limity ověření

Zachycené nativní HTML v `tests/responsive/fixtures/checkout-step2.html` neobsahuje skripty ani vyplněné skryté tokeny. Test kontroluje form kontrakty a geometrii s dlouhými názvy při 11 šířkách pro obě varianty hlavičky. Neimituje skutečné serverové přepočty. Statická regrese hlídá jediný sestavený základ součtů.

Šablona stále používá přechodný kompatibilní CSS podklad Disca; nejde o dokončenou migraci bez snapshotu. Snapshot ani nastavení Blank se nemění.

Nativní checkout při volbě metody poslouchá pouze `mousedown` na `.radio-wrapper`. Živě reprodukováno: mezerník změnil checked, ale součet zůstal u předchozí platby. `js/checkout.js` proto u nativního change vybraného radia předá událost stejné obsluze, jen pokud wrapper ještě není active. Pointer už active nastavuje sám, takže se obsluha nespouští podruhé. Disabled se ignoruje, žádné vlastní ceny, fetch ani stavové třídy. Regrese hlídá jednu nativní obsluhu při klávesnici i kliknutí.

## Nasazení a skutečná integrace

Nasazeno `543cefc` + `ea91d66` + `ca7cdea` na GitHub feature/responsive a SFTP, původní složka synchronizovaná. Snippet pouze instalace 313980, CSS/JS HTTP 200 a stejné SHA256 jako build. Šest statických kontrol prošlo; browserové regrese, audit a snapshots blokuje start Chromia (MachPortRendezvous). Syntaxe nového testu ověřená, browserové regrese se neoznačují za prošlé.

In-app živě: obě hlavičky při 11 šířkách 320–1920 bez přetékání/překryvů, telefon uvnitř hlavičky, žádná kopie účtu. Mobilní i desktopové přihlášení se otevře/zavře, krok 3 má stejnou hlavičku i s variantou v2. První krok po návratu má původní variantu s hledáním a společné součty/CTA fungují při 390/1920. Platby kliknutím i klávesnicí přepočítají 295 → 318 → 295 Kč včetně nativního DPH; EUR → CZK se vrátí na 295 Kč. V EUR nemá obchod dostupné dopravy/platby. Packeta se otevře v původním dialogu a dá se zavřít; výdejní místo nebylo vybrané, nepokračování bez něj ověřené, konkrétní chybové hlášení nezachycené. Volba adresy a převodu dovolí přejít do třetího kroku. Bez zadání osobních údajů/odeslání objednávky. Testovací produkt -6 nakonec odstraněný, košík opět prázdný.

Snímky `outputs/checkout-step2-desktop-live.png`, `checkout-step2-mobile-live.png`, `checkout-step3-header-desktop-live.png`, `checkout-step3-header-mobile-live.png`; měření `checkout-step2-live-checks.json`. Telefon už Shoptet vrací. Obrázky rekapitulace a vícejazyčný markup na této instalaci stále chybí; je nutné dokončit ověření, až budou dostupné.

Závěrečná drobná úprava ca7cdea prodlužuje desktopový oddělovač rekapitulace až ke spodní hraně viewportu (živě 1080/1080 px), na mobilu bez minimální výšky. Finální CSS znovu HTTP 200 a stejné SHA256. Desktopový snímek aktualizovaný, dočasná položka znovu odebraná a košík ověřen prázdný.

## Obrázky rekapitulace bez volby v administraci

Majitel možnost zapnutí obrázků nenašel a nativní HTML obsahuje pouze název, množství a cenu. Nutné doplnění je proto omezené na jeden `img` uvnitř původního odkazu `.cart-item-name a`; jeho text, ostatní uzly i formuláře zůstávají na místě. Žádná vlastní vizuální třída, nový produktový výpis ani ukázková fotografie. `components/_checkout-images.scss` má jeden společný vzhled pro kroky 2 i 3: 48 × 48 px, radius 8 px, mezera 16 px. Obrázek má prázdný alt, protože odkaz už obsahuje skutečný název.

`js/checkout-images.js` při návštěvě prvního kroku uloží pouze adresy obrázků a kombinaci nativního identifikátoru se SKU do sessionStorage (platnost 15 minut). Celý snímek se obnoví po ShoptetDOMCartContentLoaded, včetně odstranění již odebraných položek. Ceny, množství, zákaznické údaje ani formuláře se neukládají. Varianty stejného produktu s jiným SKU se nepárují podle pouhé URL produktu.

Při běžném přechodu z košíku není nutný další GET. Při přímém vstupu nebo chybějící položce se jednou načte původní stránka košíku z nativního odkazu prvního kroku (pouze stejný origin). Z HTML se čtou jen img URL; žádné skripty nebo jiné HTML se nepřebírají. Nejvýše jeden požadavek na dokument objednávky, timeout 5 sekund, bez opakovaného síťového dotazování při AJAX aktualizaci rekapitulace. Zakázané úložiště, selhání sítě nebo chybějící obrázek neblokují objednávku a ponechají původní text. Nativní obrázek, pokud jej Shoptet v budoucnu vrátí sám, se nenahradí ani neduplikuje.

Přidané browserové regrese pro běžný průchod, přímý vstup, AJAX výměnu, varianty, zakázané úložiště a chyby sítě/obrázku. Šest statických kontrol prošlo; browserové testy/audit/snapshots nadále blokuje spuštění Chromia. In-app náhled: normální průchod a obnova 0 požadavků, přímý vstup a zakázané úložiště 1 požadavek, síťová chyba/chybný obrázek bez opakování a se zachovanými formuláři. Stejný GUID se dvěma SKU má dva správné různé obrázky. Dlouhý název při 11 šířkách 320–1920 bez přetékání, všude obrázek 48 × 48. Živé ověření po nasazení je níže.

Nasazení obrázků: `d609375`, GitHub feature/responsive a SFTP, snippet instalace 313980. Původní složka synchronizovaná, CSS/JS HTTP 200 a shodné SHA256. Na skutečných dvou produktech správné různé fotografie při přechodu z prvního kroku, po EUR → CZK i v kroku 3, také při přímém vstupu v nové kartě. Krok 2 při 11 šířkách 320–1920 a krok 3 při 6 šířkách bez přetékání; obě fotografie 48 × 48 px. Součet 685 Kč / 566,11 bez DPH pochází stále ze Shoptetu. Nativní pokračování z košíku znovu ověřeno. Všechny vlastní testovací položky odstraněné, výchozí prázdný košík obnovený, bez osobních údajů a objednávky.

Snímky: `outputs/checkout-summary-images-desktop-live.png`, `checkout-summary-images-mobile-live.png`, `checkout-summary-images-step3-live.png`; měření `checkout-summary-images-live-checks.json`. Původní limit chybějících obrázků je tímto doplněním vyřešený; dřívější zmínky o chybějících obrázcích popisují stav před touto změnou. Vícejazyčný nativní markup zůstává samostatným dříve uvedeným limitem.

## Oprava hoveru, centrování a vrácení kontaktu podle aktualizované Figmy

Majitel doložil nesrovnanou hlavičku a hranaté obrysy/odskakování metod. Nativní `.desktop .shipping-billing-table .radio-wrapper:hover` přidával obalu 1px border a hranatý stín: živě karta narostla ze 76 na 78 px. Zrušení tohoto hover borderu/stínu má cíleně vyšší specificitu. Vizuální stav zůstává jen na původním zaobleném labelu, jeho border má ve všech stavech stejnou tloušťku; žádné posuny, změny paddingu nebo JS hover. Regrese musí mít třídu `.desktop` a skutečný hover, samotné nastavení šířky problém neodhalilo.

Hlavička má explicitní společnou výšku hlavního řádku. Logo je v jejím flex středu, telefon a nástroje jsou ukotvené do stejné poloviny řádku; resetované staré offsety a pomocné clearfixy. Mobil s telefonem má samostatný 64px hlavní řádek a telefon pod ním, bez překryvu. Oprava platí pro oba kroky i obě varianty.

Aktualizovaná Figma 1647:9627 vrací kontakt nad rekapitulaci. Původní `.checkout-box/.contact-box` zůstává na místě a trvale viditelný, pokud má skutečné kontaktní údaje. Původní rozbalovací span slouží jako ARIA heading s textem „Potřebujete poradit?“, bez kopie kontaktu a bez nového vizuálního class. Shoptet už nemá skrývat/animovat jeho obsah. Konfigurované jméno kontaktu, telefon, e-mail a fotografie zůstávají ze Shoptetu; ilustrativní osoba z Figmy se nevkládá. Telefon je nad e-mailem, případné další nativní údaje se zachovávají.

Opakované styly byly vytažené z patičky do `tools/contact` s jedním sestaveným základem pro původní třídy. Místo použití mění jen rozložení/mezery (patička původní, objednávka foto 64px/radius10 a gap16). Přesná 24px ikona telefonu z Figmy je `phone-contact.svg`, obálka je stávající. Kontakt je sdílený pro kroky 2/3 a reaguje na nativní obsah/události.

In-app náhled: 52 kombinací obou variant/13 šířek 320–2560 včetně 1510 px a dlouhého kontaktu, nulové přetékání a překryvy, desktop všechny středy shodné, mobil logo/nástroje shodné. Všechny čtyři metody mají při skutečném hoveru původní 76px výšku, všechny ostatní pozice zachované, vnější border 0/stín none. Bez konfigurovaného jména má kontakt přesných 64 px jako návrh, prázdný kontaktní blok skrytý. Build a statické regrese se ověřují při nasazení; browserové regrese/audit nadále omezuje start Chromia v sandboxu.

Nasazeno `1c15253` na GitHub feature/responsive a SFTP; původní složka synchronizovaná, snippet pouze instalace 313980, živé CSS/JS HTTP 200 a shodné SHA256. Build a 7 statických regresí prošly. Browserové regrese, audit a snapshots blokuje start Chromia (MachPortRendezvous), nejsou označené za prošlé.

Živá kontrola: obě varianty při 9 šířkách 320–2560 bez přetékání/překryvů, desktopové středy všech prvků shodné (39,5 px), mobilní logo/tools shodné. Skutečný hover dopravy i platby má stále 76 px a obal bez borderu/stínu; všechny další karty zůstávají na místě. Nativní kontakt je vidět po změně měny i ve třetím kroku na mobilu a desktopu. Přihlášení na obou zařízeních otevřeno/zavřeno, přechod do kroku 3 funguje. Patička po extrakci společných stylů při 390/1920 bez přetékání a s původními rozměry fotografie. Vlastní testovací položka odebraná, původní prázdný košík obnovený, žádná objednávka nevznikla.

Snímky v outputs: `checkout-header-contact-fixed-live.png`, `checkout-hover-fixed-live.png`, `checkout-contact-mobile-fixed-live.png`, `checkout-contact-step3-fixed-live.png`; měření `checkout-fixes-live-checks.json`. Dřívější pokyn o skrytém kontaktním bloku nahrazuje tento aktualizovaný návrh.


## Společná rekapitulace kroků 2 a 3

Pravý panel i rozložení sloupců nyní používají jeden blok `body:is(.in-krok-1, .in-krok-2)` v `_checkout.scss`. Nativní `#checkoutSidebar`, `.order-summary`, `.order-summary-item`, `.cart-item-*`, `.price-wrapper` a `.next-step` se nekopírují ani nepřesouvají. Kontakt už má společnou komponentu `_checkout-contact.scss`; sjednocení šířky a odsazení panelu sjednocuje i jeho umístění. Žádný nový JS, vizuální třídy ani volby administrace.

Krok 3 vrací dopravu/platbu jako `.order-summary-item` s názvem ve `strong` a prázdným množstvím; cílené CSS pouze upraví rozložení těchto řádků. Ceny a jejich nativní formát zůstávají Shoptetu. Finální `.next-step-finish` používá stejný Sass základ jako pokračování; celé „Objednat s povinností platby“ se na úzké šířce může zalomit. Souhlasy, odkazy, jména polí, vazba na `#order-form` a submit zůstávají původní. Pravidla dopravních voleb a osobního formuláře zůstávají oddělená.

Lokální kontrola skutečného HTML: oba kroky × 11 šířek 320–1920 px bez vodorovného přetékání; shodné písmo, barvy a řezy společných prvků. Třetí krok zachoval 29 pojmenovaných ovladačů / 36 položek `form.elements`, nativní action i celé finální tlačítko. Build a 7 statických testů prošly. Dvě browserové regrese, audit a snapshots blokuje start Chromia (MachPortRendezvous); nejsou označené za prošlé. Nasazeno jako 73fbfbf na GitHub feature/responsive a SFTP; původní /Users/apple/aSteroid synchronizovaný. Snippet pouze instalace 313980, živé CSS/JS HTTP 200 a plné SHA256 shodné s buildem. Živě oba kroky × 11 šířek 320–1920 bez přetékání a s totožnou typografií společných prvků; desktop pravý sloupec432px/CTA52px. Krok 3 stále 29 pojmenovaných ovladačů / 36 form.elements a původní action, nezaškrtnutý opt-out, celé finální označení a odkazy souhlasů. Původní přechod krok2 → krok3 funguje, obrázek načtený, součet stále295Kč/243,80bezDPH. Žádná osobní data ani objednávka; vlastní testovací -6 odstraněn a košík opět prázdný. Snímky outputs/checkout-step3-shared-summary-{desktop,mobile}-live.png, měření checkout-step3-summary-live-checks.json. Audit i snapshots před/po blokuje start Chromia, nikoli úspěšné kontroly. Nastavení Blank, snapshot Disca a settings-app beze změny. Externí Claude Docs nejsou tímto zápisem upravené.

## Pole a select (Figma 93:2578)

Pole kontaktního kroku a select měny/země prvního kroku mají globální vzhled polí (`components/_fields.scss`): 52 px, pilulka, plovoucí popisek, fokus, chyba a zakázaný stav. Šipka selectu je globální; `_checkout.scss` v prvním kroku jen drží popisek nad polem a šipku proto umisťuje zdola (`top: auto; bottom: 16px`). Pole i select mají písmo 16 px (komponenty Forms).

## Třetí krok podle Figmy 1685:9631 (Informace o vás)

Levý formulář `#checkoutContent` má vlastní komponentu `components/_checkout-form.scss` (`body.in-krok-2`). Formulář, jména polí, akce `Step2Validate`, rozbalování `.js-hidden/.visible` (firma, jiná adresa, poznámka, informace o registraci), předvolby telefonu a validace zůstávají Shoptetu; mění se jen rozložení a vzhled.

- Přihlášení: šedý box `--as-secondary-50`, rádius 12 px, ikona `perm-identity` 32 px vlevo, odkaz v hlavní barvě. Text s odkazem zůstává jedním tokem (ikona je absolutně, ne flex).
- Nadpisy sekcí H4 bez ikon Disca (společné pravidlo s krokem 2 v `_checkout.scss`), legenda „Povinná pole“ skrytá (povinnost značí hvězdička, legendu má Shoptet `aria-hidden`).
- Pole: popisek nad polem (`tools/_field-label.scss`), mezi skupinami 24 px, sekce po 40 px. Od 992 px dva sloupce: e-mail s telefonem (jen když telefon následuje), město s PSČ (fakturační i doručovací); ostatní a celý formulář pod 992 px přes celou šířku. Disco omezení šířek (440/220/120 px) zrušené.
- Telefon: předvolba a číslo v jedné pilulce, svislá čára mezi nimi, šířka předvolby podle obsahu. Rámeček, fokus i chyba jsou na `.phone-combined-input` (`:focus-within`, `:has(.js-error-field)`), původní seznam zemí Disca se otevírá beze změny.
- Země: text `.form-control-wrapper--with-note` i zakázaný select vypadají jako zakázaný výběr (šedé pozadí, šipka `--as-secondary-300`); u nákupu na firmu Shoptet zobrazí aktivní select s globálním vzhledem.
- Volby: řádek skupiny je flex, aby popisek inline-block neseděl na účaří a mezery odpovídaly (24 px pod zemí, 12 px mezi „Doručit na jinou adresu“ a „Zadat poznámku“).
- Pravý panel: souhlasy 32 px pod součtem, text 16 px `--as-secondary-300` s podtrženými odkazy; finální tlačítko „Objednat“ (20 px) a pod ním celé původní „s povinností platby“ (16 px), na středu, bez šipky, výška 74 px.

Mobilní návrh zatím není; pod 992 px je formulář v jednom sloupci se stejným vzhledem. Písmo v polích je globálně 16 px jako v návrhu (rozhodnutí majitele 27. 10.).

Ověření: test `tests/responsive/checkout-step3.spec.cjs` nad skutečným HTML (`fixtures/checkout-step3.html`, bez skriptů a osobních údajů, zkrácený seznam zemí): rozměry a mezery podle Figmy na 1920 px, popisek ve stavech fokus/vyplněno, telefon fokus/chyba, 11 šířek 320–1920 se všemi rozbalenými částmi bez přetékání, jména polí formuláře beze změny. Živě na e-shopu 1920/390 zavřené i rozbalené části, výběr předvolby +421 se propíše do `phoneCode`; testovací produkt jen v headless prohlížeči, košík vyprázdněn, bez osobních údajů a objednávky.
