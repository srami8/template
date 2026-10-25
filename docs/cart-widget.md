# Mobilní panel košíku

Návrh [Figma 1631:7130](https://www.figma.com/design/jpEXMp36OXxRJqE0ortBfB/aSteroid?node-id=1631-7130): pravý panel 300 px přes výšku displeje, zavírání v 48px hlavičce, obrázek/název a množství/cena/odebrání ve dvou řádcích, posuvný seznam a pevný spodní blok s dopravou a pokračováním.

## Pro obchodníka

Na telefonu kliknutí na ikonu košíku otevře panel. Pokračování na stránku košíku je dostupné jeho spodním tlačítkem. Zavření křížkem vrací fokus na ikonu; další ovládání včetně změny množství a odebrání je původní Shoptet. Na desktopu zůstává dosavadní bublina.

Informace o dopravě pochází z Shoptetu. V **Nastavení → Doprava a platby → Způsoby dopravy** musí být zapnutá volba **Zobrazovat zákazníkům informaci o dopravě zdarma** a správně nastavený ceník dopravy. Částku z Figmy ani z reklamního banneru nepřebíráme do kódu. Při této implementaci po zapnutí server vrátil skutečné potvrzení „Dopravu máte zdarma!“. [Nápověda Shoptetu](https://podpora.shoptet.cz/dopravy/#zobrazeni-informace-o-doprave-zdarma).

## Implementace a návaznost na Disco

`components/_cart-widget.scss` upravuje existující `#cart-widget`, `.cart-widget-inner`, `.cart-widget-products`, `.cart-widget-bottom` a `.cart-free-shipping`. Obrázky mají 48 px, jména 14 px, ceny 16 px, sdílené počítadlo dál mixin `quantity.stepper` (94 × 36 px). Zavírací křížek je původní ikona 24 px v aktivní ploše 44 px. Tlačítko používá dosavadní mixiny button a nastavení konverzní barvy.

`js/cart.js` na mobilním breakpointu odstraní pouze `data-redirect` z původního přepínače. Nativní obsluha `.toggle-window[data-target=cart]` pak zabrání navigaci a otevře stejný popup; při návratu na desktop se původní atribut obnoví. Žádný druhý košík, kopie produktů, vlastní košíkové API nebo náhrada formulářů nevzniká.

V nativním HTML chybí mobilní zavření, proto JS vloží `.as-cart-header` s tlačítkem `.toggle-window.hide-content-windows`. Zavření obsluhuje Shoptet, doplněk vrátí fokus na spouštěč. MutationObserver přidá hlavičku znovu po nativním AJAX přepisu, bez duplikování. Na desktopu hlavičku odstraní, aby nezůstala skrytá položka ve focus trapu Shoptetu.

Panel začíná v top:0 a končí na 100dvh. Při 390 px zbývá vlevo 90 px, při 320 px 20 px. Pozadí je černé s 60% krytím. Posouvá se jen produktový seznam; footer zůstává dole. Pro velmi nízký viewport má footer vlastní posuv a max-height 50dvh, takže nezanikne seznam ani možnost pokračovat.

Text i procentní šířka `.price-range` zůstávají od Shoptetu, vlastní je jen vzhled (ikona local-shipping, 4px lišta, barva z administrace). U nativního potvrzení dosažené dopravy zdarma bez price-range CSS vykreslí plnou lištu. Desktop při přítomnosti dopravy používá stejnou komponentu nad tlačítkem. Písmo a barvy e-shopu mají přednost před ukázkou Figmy.

## Ověření a limity

Build a dosavadní testy settings-app; nový regresní scénář v layout.spec.cjs kontroluje polohu 300 × 100dvh, 48px hlavičku, dlouhý seznam se stabilním footerem, zavření a obnovení desktopového data-redirect. V tomto prostředí browserovou sadu blokuje sandbox při startu Chromia, takže ji nepovažujeme za prošlou. Kontrola probíhá také v in-app prohlížeči.

Lokální vizuální fixture používá veřejný skutečný markup plného košíku bez skrytých hodnot, se zakázanými formulářovými požadavky. Nenahrazuje integrační ověření; nativní množství/odebrání a prázdný stav se ověřují po nasazení na testovacím e-shopu. Nebyla vytvořena ani odeslána objednávka.

Živé ověření nasazení `d3d3594`: panel 300 × 844 px na šířce 390 px, nulové přetékání, nativní množství 1 → 2, odebrání → prázdný stav s jednou hlavičkou/kontaktem. Po nastavení dopravy server vrací skutečný limit 1199 Kč: při košíku 200 Kč zbývá 999 Kč a nativní progress má 16,68 %. Footer má 144,6 px jako návrh. Limity se neukládají do kódu. Testovací produkt byl odebrán, objednávka nebyla vytvořena. Sdílená geometrie panelu se nově používá i pro mobilní filtry (`tools/_drawer.scss`).
