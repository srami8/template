# Komponenty Disco × aSteroid

Přehled stavu komponent; vizuální srovnání: [styleguide Disco × aSteroid](https://claude.ai/artifact/2peuukfUKNGyeUzgfLMKrP). „Bez CSS Disca“ = stav s vypnutým CSS Shoptetu jen se styly aSteroidu, viz [blank-mode.md](blank-mode.md) (vygenerováno 29. 10. 2026). Stavy: hotovo = návrh i kód, částečně, návrh bez kódu, kód bez návrhu (jen globální komponenty), chybí (vzhled Disca).

| Skupina | Komponenta | Stav | Bez CSS Disca | Figma | Kód | Třídy Shoptetu | Navrhnout |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Základ | Tlačítka | Hotovo | Rozpadá se (30,4 %) | 82:2334, stavy 1689:13982 | `tools/_button.scss, components/_buttons.scss` | `.btn + .btn-conversion / -cart / -default / -primary / -secondary / -special / -plain, .btn-sm / -lg, .disabled` | velikosti podle komponenty (Large 60, Medium 52, Small 44 px) a stavy hotové; doplnit textové tlačítko |
| Základ | Pole formuláře | Hotovo | Rozpadá se (13,8 %) | 93:2578 (Input / Text, Dropdown) | `components/_fields.scss, tools/_field-label.scss` | `.form-control, .smart-label-wrapper, .form-control-wrapper, .js-error-field` | výchozí, fokus, vyplněné, chyba + text chyby, zakázané, s popiskem nad polem |
| Základ | Checkbox a radio | Hotovo | Rozpadá se (4,4 %) | 93:2578 (Checkbox, Radio) | `tools/_choice.scss, components/_choices.scss` | `input[type=checkbox\|radio] + label` | nezaškrtnuté, zaškrtnuté, fokus, zakázané, chyba |
| Základ | Štítky produktu | Hotovo | Rozpadá se (9,5 %) | 1:873 (Tag) | `tools/_flag.scss, components/_product-elements.scss` | `.flags .flag.flag-new / -action / -tip / -discount …` | všechny typy příznaků; barva z administrace, text podle kontrastu (dnes jen tlačítka) |
| Základ | Hlášky (úspěch, chyba, info, varování) | Chybí | Rozpadá se (81,5 %) | — | `—` | `.msg.msg-success / -error / -info / -warning (Shoptet je ukazuje nahoře po akci)` | čtyři typy, s odkazem, se zavřením, na telefonu |
| Základ | Tooltip | Chybí | Rozpadá se (5,2 %) | — | `—` | `.tooltip .tooltip-inner (např. limit množství, sleva u ceny)` | nahoře, dole; dlouhý text |
| Základ | Záložky | Chybí | Rozpadá se (3,7 %) | — | `—` | `.shp-tabs-wrapper .shp-tabs .shp-tab-link, .active` | aktivní, neaktivní, najetí; na telefonu posuvné nebo rozbalovací |
| Základ | Tabulka | Chybí | Rozpadá se (10,3 %) | — | `—` | `table.table (zákaznická sekce, parametry, obsah článků)` | záhlaví, řádky, stav objednávky, na telefonu |
| Základ | Typografie obsahu | Částečně | Rozpadá se (10,4 %) | 1479:5145 (nadpisy desktop), 1633:10337 (mobil) | `components/_headings.scss, layout/_content-width.scss` | `h1–h6, p, ul, ol, a, blockquote, img v obsahu` | odstavce, seznamy, odkazy, citace, obrázek s popiskem, tabulka |
| Hlavička a patička | Informační lišta | Hotovo | Rozpadá se (62,2 %) | 95:4999 (Lišta) | `layout/_site-msg.scss` | `.site-msg.information` | se zavřením, dlouhý text |
| Hlavička a patička | Hlavička | Hotovo | Rozpadá se (10,9 %) | 49:2768 (v1, v2, v3), 1474:4429 a 1474:4525 (mobil) | `layout/_header.scss, header/*, components/_mobile-header.scss` | `#header, .top-navigation-bar, .navigation-buttons` | hotovo; v objednávce zjednodušená |
| Hlavička a patička | Našeptávač hledání | Hotovo | Neměřeno | 49:4880, 82:2453 (nenalezeno) | `components/_search-whisperer.scss` | `.search-whisperer` | hotovo |
| Hlavička a patička | Okno přihlášení | Hotovo | Neměřeno | 93:2242 | `components/_login.scss` | `#login, .popup-widget` | chyba přihlášení, přihlášený zákazník (menu účtu) |
| Hlavička a patička | Výhody obchodu (USP) | Návrh bez kódu | Rozpadá se (9 %) | 1487:3722 (USPs) | `—` | `.benefitBanner__item, __picture, __content` | na telefonu, 2–4 položky |
| Hlavička a patička | Patička | Hotovo | Rozpadá se (5,4 %) | 1487:3720 | `components/_footer.scss` | `#footer, .custom-footer, .contact-box` | telefon (dnes odvozený) |
| Hlavička a patička | Cookie lišta | Chybí | Neměřeno | — | `jen tvar tlačítek` | `.siteCookies, .cookiesSetting` | lišta, podrobné nastavení |
| Úvodní stránka | Bannery | Hotovo | Rozpadá se (28,2 %) | Homepage 0:3 | `components/_banners.scss, variants/banners-*` | `.banners-row, #carousel, .extended-banner` | čtyři vzhledy v nastavení; telefon odvozený |
| Úvodní stránka | Kategorie na úvodu | Hotovo | Rozpadá se (5,3 %) | Homepage 0:3, 1633:10482 (Category button) | `components/_home-categories.scss` | `vlastní blok aSteroidu` | hotovo |
| Úvodní stránka | Produktová sekce | Hotovo | Rozpadá se (17,2 %) | Homepage 0:3 | `components/product-cards/*, js/homepage-products.js` | `.products-wrapper .products-block` | hotovo |
| Úvodní stránka | Karta článku | Hotovo | Rozpadá se (24,4 %) | 1627:5345 (Article) | `components/_article-card.scss` | `.news-item` | hotovo |
| Úvodní stránka | Hodnocení obchodu nad patičkou | Hotovo | Drobné rozdíly (4,2 %) | 15:6029 (Reviews) | `components/_shop-reviews.scss` | `vlastní blok aSteroidu` | hotovo |
| Kategorie a výpis | Drobečková navigace | Hotovo | Rozpadá se (7,2 %) | 1483:5174, 1484:5186 (mobil) | `components/_breadcrumbs.scss` | `.breadcrumbs` | hotovo |
| Kategorie a výpis | Popis kategorie a podkategorie | Hotovo | Rozpadá se (13 %) | 1487:3697, 112:3621 | `components/_category.scss, variants/category-*` | `.category-top, .subcategories, .category-perex` | hotovo |
| Kategorie a výpis | Nejprodávanější | Hotovo | Rozpadá se (6,3 %) | 112:6726 (Best seller) | `components/_category.scss` | `.products-top` | hotovo |
| Kategorie a výpis | Karta produktu | Hotovo | Rozpadá se (6 %) | 1:2149 (Produkt), 15:3438 (CTA), 12:1076 (Price) | `components/product-cards/*, components/_product-elements.scss` | `.product .p, .flags, .price-final, .availability, .stars-wrapper, .p-tools` | varianty produktu (Detail místo Koupit), nedostupný, bez obrázku |
| Kategorie a výpis | Filtry | Hotovo | Rozpadá se (5,8 %) | 1633:7414, 1633:10605 (mobil) | `components/_category-filters.scss` | `#filters, .filter-section, .slider-wrapper` | hotovo |
| Kategorie a výpis | Řazení | Hotovo | Rozpadá se (7,7 %) | 112:3621 | `components/_category-listing.scss` | `#category-header, .sortingToggle` | hotovo |
| Kategorie a výpis | Stránkování a Načíst další | Hotovo | Rozpadá se (7,6 %) | 112:3621 | `components/_category-listing.scss` | `.pagination, .loadMore__button` | hotovo |
| Detail produktu | Galerie a štítky | Částečně | Rozpadá se (53,2 %) | jen štítky a sleva | `components/_product-elements.scss` | `.p-image-wrapper, .p-thumbnails` | více fotek, video, zvětšení, bez obrázku |
| Detail produktu | Název, cena a nákup | Částečně | Rozpadá se (28,1 %) | jen cena, počítadlo, hodnocení | `components/_product-elements.scss, components/_buttons.scss` | `.p-detail-inner-header, .p-final-price-wrapper, .availability-value, .p-to-cart-block, .quantity` | akce, nedostupný, předobjednávka, varianty (select, parametry), hlídací pes, dotaz |
| Detail produktu | Záložky: popis, parametry, hodnocení, diskuze | Chybí | Rozpadá se (2,6 %) | 15:6027 (Coments), 15:6029 (Reviews) jako podklad | `—` | `.shp-tabs, #description, .extended-description .detail-parameters, .rate-wrapper, .vote-wrap, #productDiscussion` | všechny záložky, formulář hodnocení a dotazu, prázdné hodnocení |
| Detail produktu | Související a alternativní produkty | Kód bez návrhu | Rozpadá se (14,9 %) | — | `karta produktu` | `.products-related, .products-alternative` | nadpis sekce, posuvný pás |
| Obsah a účet | Výpis článků | Hotovo | Rozpadá se (22,2 %) | 1627:5345 (karta) | `components/_article-card.scss` | `.news-wrapper .news-item` | hotovo |
| Obsah a účet | Detail článku | Kód bez návrhu | Rozpadá se (13 %) | — | `layout/_content-width.scss` | `.news-item-detail, .next-prev` | nadpis, datum, perex, obsah, další článek, související produkty |
| Obsah a účet | Kontakt a formulář | Kód bez návrhu | Rozpadá se (6 %) | — | `globální pole a tlačítka` | `.contact-box, #formContact` | formulář, odesláno, chyba, mapa |
| Obsah a účet | Registrace | Kód bez návrhu | Rozpadá se (6 %) | — | `globální pole a tlačítka` | `#register-form` | nakupuji na firmu, chyby, souhlasy |
| Obsah a účet | Přihlášení (stránka) | Kód bez návrhu | Rozpadá se (6,5 %) | podle okna 93:2242 | `components/_login.scss` | `.login-wrapper` | zapomenuté heslo, chyba |
| Obsah a účet | Výsledky hledání | Kód bez návrhu | Rozpadá se (49,7 %) | — | `karta produktu` | `.search-results, #content` | produkty, kategorie, články; nic nenalezeno |
| Obsah a účet | Hledání bez výsledků | Kód bez návrhu | Rozpadá se (13 %) | — | `—` | `#content` | prázdný stav s radou |
| Obsah a účet | Stránka hodnocení obchodu | Chybí | Rozpadá se (5 %) | 15:6029 jako podklad | `—` | `.rate-wrapper, .vote-wrap` | souhrn, seznam, formulář |
| Obsah a účet | Stránka 404 | Chybí | Rozpadá se (11,6 %) | — | `—` | `#content` | prázdný stav s hledáním a odkazy |
| Košík a objednávka | Prázdný košík | Kód bez návrhu | Rozpadá se (9,3 %) | — | `components/_cart.scss` | `.cart-emptied` | prázdný stav, doporučené produkty |
| Košík a objednávka | Košík (krok 1) | Hotovo | Rozpadá se (9,9 %) | 1642:5563, 1686:10094 (mobil), 1686:10386 (panel) | `components/_cart.scss, components/_order-steps.scss` | `.cart-table, .cart-header, .summary` | hotovo |
| Košík a objednávka | Doprava a platba (krok 2) | Hotovo | Rozpadá se (9,1 %) | 1645:8015 (telefon chybí) | `components/_checkout.scss` | `#checkoutContent, .shipping-billing-table, #checkoutSidebar` | telefon, výběr výdejního místa |
| Košík a objednávka | Informace o vás (krok 3) | Hotovo | Rozpadá se (10,6 %) | 1685:9631 (telefon chybí) | `components/_checkout-form.scss` | `#order-form, .co-box` | telefon, chyby ve formuláři |
| Košík a objednávka | Děkovací stránka po objednávce | Chybí | Neměřeno | — | `—` | `.order-complete, .order-complete-links` | převod s QR kódem, platba kartou, chyba platby |
| Košík a objednávka | Okno „Přidáno do košíku“ | Chybí | Neměřeno | — | `—` | `#colorbox .advancedOrder` | s doporučenými produkty i bez, na telefonu |
| Obsah a účet | Zákaznická sekce | Chybí | Neměřeno | — | `—` | `.customer-page, table, .btn-plain` | přehled, objednávky, detail objednávky, údaje, adresy, heslo |
