# První krok košíku

Figma `1642:5563` (obsah `1642:7904`, kroky `1642:7621`). Základ implementace `3b44344`. Hlavička, její nastavená varianta a data obchodu zůstávají původní.

## Chování a obsah

- Na širokém desktopu má seznam maximální šířku 1180 px, běžný produkt minimální výšku 96 px a rozestupy karet 10 px. Delší názvy/varianty mohou kartu zvětšit; obsah se neořezává. Skutečné produktové obrázky zůstávají ze Shoptetu, ukázkové fotografie z Figmy se nevkládají.
- Pod názvem zůstává původní odkaz na související produkty. Rozbalí skutečný následující řádek tabulky, včetně původních formulářů přidání a případné volby variant. Funguje také na mobilu a klávesami Enter/mezerník.
- Množství, dostupnost, ceny, odebrání a přepočty dál obsluhuje Shoptet. Změna množství zachová rozbalení souvisejících produktů a vrátí fokus na odpovídající ovladač po nativní výměně HTML.
- Tlačítko kuponu má stejný čtvercový základ jako checkboxy ve filtrech. Jde nadále o nativní rozbalovací tlačítko, nikoli nový input. Pole a odeslání jsou původní. Platí i upozornění Shoptetu na rozepsaný a nepoužitý kód při pokračování.
- Doprava zdarma a slevová motivace používají společnou typografii a průběh, s vlastní ikonou kamionu / procent. Slevová lišta se objeví jen při odpovídajícím nastavení a datech Shoptetu; ilustrativních 5 % ani částky z návrhu se nevkládají.
- Datum doručení je nativní, umístěné pod dopravou. Žádný vlastní výpočet data, ceny nebo procent.
- Shrnutí obsahuje skutečný primární součet a další cenové řádky Shoptetu, pokud je poskytuje. Majitel výslovně zvolil nativní rozpis místo zástupného druhého řádku „Celkem za zboží“. Pokud obchod další řádky nevypíše, aSteroid je nevymýšlí.
- Mobilní rozložení skládá obsah pod sebe, zachovává dostupné ovladače a využívá původní mobilní dostupnost uvnitř názvu. Nezobrazuje současně její druhou desktopovou kopii.

## Nativní rozhraní a sdílené komponenty

`components/_cart.scss` řeší pouze rozložení nad `body.in-kosik`, `#cart-wrapper`, `.cart-inner`, `.cart-table`, jejími původními buňkami `.cart-p-image/.p-name/.p-availability/.p-quantity/.p-price/.p-total`, řádkem `.related`, `.cart-related-*`, `.summary`, `.price-wrapper`, `.discount-coupon` a `.next-step-*`.

Shrnutí ani formuláře se nepřesouvají a nekopírují. Nativní `.box` má v levé části `display:contents`, datum a motivace se řadí v CSS. Původní odkaz Zpět do obchodu je umístěný v levém sloupci CSS, jeho původní cíl se nemění. Prázdný košík nepřebírá layout plné tabulky.

- Kroky: `components/_order-steps.scss`, původní `ol.cart-header`, `.step/.active/.completed`, číslování a původní odkazy. Jeden vzhled i v dalších krocích objednávky, bez změny jejich ostatních formulářů. Pás 72 px na desktopu, mobilní popisky se mohou zalomit a čísla zůstávají v jedné linii.
- Množství: beze změny globálního `tools/quantity.stepper`.
- Odebrání: nový `button.remove` se sestavuje jednou v `_product-elements.scss` pro `:is(#cart-widget,.cart-table) .remove-item`; velikost v tabulce je 20 px, mini-košík zachovává 16 px. Křížky jsou dostupné i bez hoveru. Starý duplikát v `_cart-widget.scss` byl odstraněn.
- Checkbox: `checkbox.box` používá společný Sass placeholder, takže čtvercový základ filtrů i ovladače kuponu má jediné výsledné CSS pravidlo.
- Tlačítka: původní `button.base/size/conversion/conversion-outline/secondary/chevron`. Konverzní barva pochází z administrace, nikoli z pevné modré v ukázce.
- Motivace: `_free-shipping.scss` nově sdílí základ také s `.extra.discount`. To je požadovaná změna nového návrhu; předchozí oprava dopravy slevovou lištu záměrně neměnila. Dárkové motivace zůstávají mimo tento selektor.

`js/cart-step.js` doplňuje pouze přístupnost a paměť rozbalení/fokusu. Nepřidává vizuální třídy a nemění nativní formuláře nebo fetch. Souvisejícímu řádku doplní unikátní ID pro aria-controls; k odkazu tabindex/role/aria-expanded. Po AJAXu používá původní toggleRelatedProducts a images.unveil, pokud jsou dostupné. Původní .visible/.related-visible jsou jedinými stavovými třídami.

Nové lokální assety: `order-arrow.svg` (Figma `1642:5898`) a `percent.svg` (`1642:7848`). Ostatní ikony jsou existující stejné komponenty Figmy ve stávajícím systému masek. Ukázky kurzoru v návrhu jsou ilustrace hoveru, nikoli obsah stránky.

## Ověření a limity

Build a 5 statických testů stylů prošly. Nová kontrola hlídá společný sestavený základ křížku a checkboxu. Dvě browserové regrese prvního kroku a aktualizovaná regrese motivací jsou připravené; jejich běh blokuje start Chromia v sandboxu (MachPortRendezvous), nikoli aserce. Nesmí se označit za prošlé.

In-app prohlížeč nad skutečným zachyceným HTML: 22 běžných rozložení (otevřené/zavřené související produkty a kupon × 11 šířek 320–1920), bez přetékání, viditelné křížky a dostupné akce, zarovnaná čísla kroků. Dále devět šířek s dlouhými názvy a cenou 123 456 789 Kč, bez přetékání; rozbalení klávesnicí a kupon při 320 px. Po dvojí inicializaci zůstaly stejné původní uzly 13 formulářů a 44 vstupů. Jde o kontrolní náhled; skutečné serverové operace jsou ověřené odděleně níže.

Šablona stále používá kompatibilní CSS podklad Disca. Tento redesign není dokončenou migrací bez vendor snapshotu; reset, formulářové stavy, nativní přepočty a data zůstávají závislostmi. Snapshot ani nastavení Blank mode se nemění.

## Nasazení a živá kontrola

Implementace `bc6e4a7`, oprava opakovaného obnovení fokusu `c8d1c2b`, GitHub `feature/responsive` a SFTP. Původní pracovní složka synchronizovaná, snippet aktualizovaný pouze instalaci 313980. CSS i JS vrací HTTP 200 a mají stejné SHA256 jako lokální build. Settings-app ani nastavení Blank se nemění.

Na živém e-shopu ověřeno:

- Nativní množství 1 → 2 → 3 → 2 → 1 a součet 590 → 790 → 990 → 790 → 590 Kč, včetně navazujícího ovládání klávesou Enter bez nového zaměření. Rozbalení souvisejících produktů i fokus přežijí opakovanou výměnu HTML. Regrese zahrnuje dvě navazující výměny.
- Přidání souvisejícího produktu -33 (980 Kč) a jeho odebrání (590 Kč), přepočet nativní dopravy.
- Neplatný kupon vrátí původní hlášení Shoptetu. Neuplatněný rozepsaný kód zablokuje pokračování a zobrazí původní upozornění; po vymazání pokračování funguje.
- Přechod na dopravu/platbu a zpět, bez odeslání objednávky. Společný průvodce má i v dalším kroku 72px pás.
- Otevřený související blok při 11 šířkách 320–1920 px: bez vodorovného přetékání, zarovnané kroky a dostupné tlačítko pokračování.
- Mini-košík používá stejnou masku křížku/barvu, desktop 16px ovladač, mobil zachovává větší dotykovou plochu. Checkbox filtrů zachovává 22 × 22 px / radius 6 px.

Snímky: `outputs/cart-step1-desktop-live.png`, `outputs/cart-step1-mobile-live.png`; měření `outputs/cart-step1-live-checks.json` v pracovním prostoru Codex. Testovací košík byl na začátku i na konci prázdný, všechny vlastní testovací položky odstraněné. Platný kupon, další daňové řádky ani slevová motivace nejsou v testovacích datech k dispozici; jejich skutečné serverové stavy zůstávají limitem ověření.
