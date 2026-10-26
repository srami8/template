# Doprava zdarma

Lišta má jeden společný vzhled v mini-košíku, prvním kroku objednávky, mezikroku po přidání a přehledu možností dopravy v detailu. Ikona, text, zvýraznění částky, barvy, 4px výška a zaoblení průběhu se nemění mezi mobilním a desktopovým zobrazením. Šířku určuje dostupné místo.

## Správa

Limit dopravy zdarma, dostupné dopravy, částku do limitu a procento dodává Shoptet. aSteroid je nepočítá, nepřepisuje a nevkládá ukázkové částky z Figmy. Když je doprava zdarma dosažená a Shoptet už nevypíše původní průběh, CSS pod skutečným potvrzením doplní plnou čáru. Při prázdném obalu bez potvrzení se žádná falešná plná čára nedoplňuje.

Nastavení mezikroku po přidání zůstává v Shoptetu. Pokud obchod ukazuje jen krátké oznámení o přidání, aSteroid místo něj sám nevytváří popup.

## Technické řešení a důvod opravy

Původní vzhled byl chybně omezený na `#cart-widget .cart-free-shipping`, takže první krok a mezikrok zůstaly ve výchozím stylu Disca. Pravidla jsou přesunutá do `components/_free-shipping.scss` pod společný selektor `.as-theme :is(.cart-free-shipping, .extra.delivery)`. V sestaveném CSS je společný základ jen jednou. V `_cart-widget.scss` zůstává pouze pořadí/flex pro umístění a mobilní kontext.

Nativní `.price-range > div` má nadále původní inline `width`, který mění Shoptet po aktualizaci košíku. Žádné změny JS, nové třídy, náhrady elementů ani přesuny DOM nejsou potřeba. `.extra.discount`, `.extra.gift` a další motivace nesouvisející s dopravou zůstávají mimo tento selektor.

Skutečné HTML ověřené: testovací e-shop (mini-košík, první krok a možnosti dopravy), oficiální demo Disca (mezikrok `.advanced-order` včetně další slevové motivace). Testovací e-shop nyní mezikrok neotevírá, zobrazí krátké oznámení; proto se jeho markup ověřoval samostatně na oficiálním demu a v kontrolním náhledu. Obsah nativních lišt je ve fixture `tests/responsive/fixtures/free-shipping.json`.

## Regrese a ověření

`styles.spec.cjs` hlídá jeden společný sestavený základ a nepřítomnost omezení na `#cart-widget`. `free-shipping.spec.cjs` porovnává vzhled všech čtyř kontextů při 320/390/767/768/992/1920 px, zachování procenta, stav dosaženého limitu a nedotčenou slevovou lištu.

Build a 4 statické kontroly stylů prošly. Browserové testy / audit blokuje start Chromia v sandboxu; neoznačují se za prošlé. Stejné měření proběhlo in-app prohlížečem: ve všech 24 kombinacích stejné fonty, barvy, ikona, 4px lišta a zaoblení, zachované nativní procento 16,6806 %, bez vodorovného přetékání. Dosažený limit má plnou 4px čáru, slevová lišta zůstává nativních 16 px. Jde o ověření nad skutečnými markupy, nikoli potvrzení aktivního popupu této instalace.

Vendor snapshot ani nastavení Blank mode se touto opravou nemění. Odebrání podkladu zůstává samostatným migračním krokem.

Nasazení `2a8fd8a`: GitHub feature/responsive, SFTP a snippet instalace 313980. Živé CSS se shoduje s buildem. Ověřen první krok při šesti uvedených šířkách bez přetékání; mini-košík na mobilu i desktopu a dialog možností dopravy mají stejné 4px lišty. Nativní aktualizace 1 → 7 kusů přepnula na skutečné potvrzení dopravy zdarma, zpět na 1 kus se vrátilo 999 Kč a původní procento. Testovací položka odebrána, košík vrácen prázdný. Mezikrok této instalace není aktivní, proto pro něj zůstává ověření skutečného markup z dema a kontrolního náhledu.

Nový návrh prvního kroku (1642:5563) výslovně sjednocuje také slevovou motivaci. Společný základ proto nově zahrnuje `.extra.discount`, s ikonou procent a stejnou 4px lištou; původní údaj o oddělené nativní 16px slevové liště výše zachycuje stav před tímto novým zadáním. Více v [prvním kroku košíku](kosik-krok1.md).
