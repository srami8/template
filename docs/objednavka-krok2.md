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
- `tools/_radio.scss` je opakovatelný vzhled původního inputu a labelu, bez nového ovládání přes JS. Kolečka mají 22 px a checked 7px okraj; fokus zůstává viditelný.
- Telefon, měna, šipky, účet a ostatní masky jsou existující lokální assety. Loga dopravců/plateb i produktové obrázky jsou dynamická data Shoptetu, nikoli statické obrázky z návrhu.

## Podklady a limity ověření

Zachycené nativní HTML v `tests/responsive/fixtures/checkout-step2.html` neobsahuje skripty ani vyplněné skryté tokeny. Test kontroluje form kontrakty a geometrii s dlouhými názvy při 11 šířkách pro obě varianty hlavičky. Neimituje skutečné serverové přepočty. Statická regrese hlídá jediný sestavený základ součtů.

Šablona stále používá přechodný kompatibilní CSS podklad Disca; nejde o dokončenou migraci bez snapshotu. Snapshot ani nastavení Blank se nemění.
