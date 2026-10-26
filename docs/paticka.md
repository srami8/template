# Patička

Návrh Figma `jpEXMp36OXxRJqE0ortBfB`, uzel `1633:7416` (komponenta `49:3517`). Hotový pás recenzí obchodu (`shop-reviews.js`, `_shop-reviews.scss`) se nemění.

## Správa obsahu

Obsah spravuje Shoptet, nikoli nový formulář v aSteroidu. Majitel tento postup výslovně potvrdil.

- V **Vzhled a obsah → Šablony → Prvky** ponechat / přidat v patičce Kontakt, Newsletter, požadované rubriky, články, Instagram a Facebook. Počet a obsah menu se řídí aktivními prvky; šablona nevkládá ukázkové odkazy z Figmy.
- E-mail, telefon, fotka obchodníka a sociální odkazy pocházejí z původního kontaktního boxu Shoptetu. Fotka je nově viditelná i v patičce.
- Instagram a Facebook se napojují v **Propojení → Sociální sítě**. Samotný odkaz na profil v kontaktech nevytvoří fotografický feed. Prázdný obal Instagramu nezabírá místo; fotky a odkaz spravuje nativní widget. Pro návrh odpovídá šest obrázků na desktopu.
- Platební loga se stylují, pokud je Shoptet skutečně vypisuje jako svůj seznam `ul.payments`. aSteroid nepřidává loga služeb, které obchod nenabízí.
- Newsletter používá původní formulář, souhlasy, ochranu proti botům i validaci Shoptetu. Výchozí popisky se upraví podle návrhu; vlastní text obchodníka má přednost. Souhlasy ani cílová URL ochrany osobních údajů se nepřepisují.

Oficiální popis prvků a propojení: [Sociální sítě – Shoptet](https://podpora.shoptet.cz/socialni-site/). Bloky Blog / O nás / Facebook ověřené také nad skutečným HTML [oficiálního dema Disca](https://disco.shoptet.cz/).

## Vzhled a ovládání

Instagram je nad kontaktním panelem. Na desktopu šest fotografií vedle sebe, na menších šířkách tři sloupce. Kontakt a newsletter od 992 px tvoří společný panel, na menších šířkách samostatné karty pod sebou. Následují původní menu / widgety, poté platební metody a sociální odkazy, nakonec původní copyright a podpis Shoptetu.

Bez CAPTCHA je tlačítko newsletteru od 480 px součástí řádku s e-mailem. Na menším telefonu je pod formulářem. Pokud Shoptet vypíše bezpečnostní kontrolu, zůstane celá viditelná a tlačítko je až pod ní a souhlasy. Vyšší panel v tomto stavu je záměrný; návrh CAPTCHA nezobrazuje. Nic se neřeší skrytím potřebných polí.

Barvy a fonty se odvozují ze současných tokenů a administrace. Obálka a telefon jsou existující ikony; Facebook / Twitter / TikTok jsou lokální SVG z návrhu (`49:3482`, `49:3486`, `49:3490`), použité přes stávající masky. Všechny mají stejný vzhled na mobilu i desktopu. Fotky, loga plateb a Facebook widget zůstávají dynamickým obsahem Shoptetu, nikoli obrázky ukázek z Figmy.

## Implementace a hranice

`components/_footer.scss` styluje především `#footer`, `.footer-rows`, `.custom-footer`, `.custom-footer__contact`, `.custom-footer__newsletter`, `.contact-box`, `.subscribe-form`, `.instagram-widget`, `.news-item-widget`, `ul.payments`, `.footer-bottom`, `.copyright` a `#signature`. Nepřidává těmto prvkům vlastní vizuální třídy.

`js/footer.js` doplňuje pouze úvodní text podpory, výchozí popisky a dekoraci obálek. Původní sociální položky přesune do spodního seznamu `.as-footer-socials` v novém obalu `.as-footer-meta`; pokud je přítomný nativní platební blok, přesune se celý k němu. Důvod: původní sociální položky jsou uvnitř kontaktního seznamu a CSS je nemůže umístit do samostatného řádku vedle jiného bloku. Odkazy se nekopírují, URL a původní prvky zůstávají zachované. Kontaktní box samotný, formulář, inputy, data a obsluhy Shoptetu se nepřesouvají ani nenahrazují. Opakované zavolání nevytvoří duplicity a neztratí rozepsaný e-mail.

Nový sdílený mixin `button.primary` doplňuje plné tlačítko v hlavní barvě, základ a velikosti tlačítka zůstávají ve společném `tools/_button.scss`.

Tato implementace vzhledu neznamená dokončenou migraci Blank mode. Ověřuje se s vlastním kompatibilním základem, jeho globální reset / kontejnery a nativní formulářové stavy zůstávají závislostí. Vendor snapshot nebyl upraven.

## Kontroly

`tests/responsive/footer.spec.cjs` pokrývá zachování identity formuláře, polí a odkazů, rozepsané hodnoty, vlastní nadpis, idempotenci a rozložení při 320–1920 px s CAPTCHA i bez ní. Fixture vychází z veřejného HTML testovacího e-shopu; bitmapa CAPTCHA je v ní nahrazená transparentním obrázkem. Nejde o test doručení newsletteru.

Build a tři statické kontroly stylů prošly. Spuštění dvou browserových regresí a auditu blokuje sandbox při startu Chromia (MachPortRendezvous); nejsou označené za prošlé. Stejné scénáře byly ověřené in-app prohlížečem: 33 rozložení (s CAPTCHA / bez CAPTCHA / dlouhý e-mail × 11 šířek), původní uzly a hodnoty zachované po dvou inicializacích, nulové přetékání izolované patičky. Nad skutečným HTML/JS lokálního Blank náhledu funguje nativní validace prázdného formuláře a zaměření e-mailu. Žádný odběr nebyl zaregistrován a CAPTCHA nebyla vyplňována.

Na testovacím e-shopu zatím chybí naplněný Instagram, platební seznam a aktivní Blog / Facebook. Jejich ostré datové napojení je třeba ověřit po aktivaci. Nativní bloky Blog / O nás / Facebook byly prohlédnuté na oficiálním demu; jejich obsah se do testovacího obchodu nekopíruje. Instagram a platby mají zatím styly nad nativními selektory, ne potvrzenou živou integraci této instalace.
